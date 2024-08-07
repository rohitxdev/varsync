import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation, useParams } from "@remix-run/react";
import jwt from "jsonwebtoken";
import { useEffect, useRef } from "react";
import { Button } from "react-aria-components";
import toast from "react-hot-toast";
import { LuArrowLeft } from "react-icons/lu";
import { z } from "zod";

import { googleUserSchema } from "~/schemas/auth";
import {
	commitSession,
	destroySession,
	exchangeCodeForToken,
	exchangeTokenForUserInfo,
	getGoogleAuthUrl,
	getSession,
} from "~/utils/auth.server";

import { InputField } from "~/components/ui";
import { createUser, getUserByEmail, updateUser } from "~/db/user.server";
import { config } from "~/utils/config.server";
import { useRootLoader } from "~/utils/hooks";
import { getRandomNumber, scryptHash, verifyScryptHash } from "~/utils/misc";
import Spinner from "../../assets/spinner.svg?react";

const authTypeSchema = z.enum(["log-in", "sign-up", "forgot-password"]);

const logInBodySchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

const signUpBodySchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(8, "Password has to be at least 8 characters long."),
		"confirm-password": z.string(),
	})
	.refine((val) => val.password === val["confirm-password"]);

const forgotPasswordBodySchema = z.object({
	email: z.string().email(),
});

export const action = async (args: ActionFunctionArgs) => {
	const session = await getSession();
	if (session.has("userId")) return json({ error: "user is already logged in" }, 400);

	const formData = Object.fromEntries(await args.request.formData());
	if (formData["bot-trap"]) return null;

	switch (args.params.type) {
		case "log-in": {
			const logInData = logInBodySchema.safeParse(formData);
			if (!logInData.success) return json(logInData.error, 422);

			const user = await getUserByEmail(logInData.data.email);
			if (!user) return json({ error: "user not found" }, 404);
			if (!user.passwordHash) return json({ error: "password not set" });
			if (!verifyScryptHash(user.passwordHash, logInData.data.password)) {
				return json({ error: "incorrect password" }, 400);
			}

			session.set("userId", user._id.toString());

			return json(null, {
				headers: {
					"Set-Cookie": await commitSession(session),
				},
			});
		}

		case "sign-up": {
			const signUpData = signUpBodySchema.safeParse(formData);
			if (!signUpData.success) return json(signUpData.error, 422);

			if (await getUserByEmail(signUpData.data.email)) {
				return json({ error: "user with this email already exists" }, 400);
			}

			const userId = await createUser({
				email: signUpData.data.email,
				passwordHash: scryptHash(signUpData.data.password),
				pictureUrl: `https://api.dicebear.com/7.x/lorelei/svg?seed=${getRandomNumber(9999, 99999)}`,
				role: "user",
				isBanned: false,
				subscriptionPlan: "free",
			});

			session.set("userId", userId);

			return json(null, {
				headers: {
					"Set-Cookie": await commitSession(session),
				},
			});
		}

		case "log-out":
			return redirect("/", {
				headers: {
					"Set-Cookie": await destroySession(session),
				},
			});

		case "forgot-password": {
			const forgotPasswordData = forgotPasswordBodySchema.safeParse(formData);
			if (!forgotPasswordData.success) return json(forgotPasswordData.error, 422);
			const user = await getUserByEmail(forgotPasswordData.data.email);
			if (!user) return json({ error: "user not found" }, 404);
			const passwordResetToken = jwt.sign(
				{
					sub: user._id,
					type: "password-reset",
				},
				config.JWT_SIGNING_KEY,
				{ expiresIn: "10m" },
			);
			await updateUser(user._id.toString(), {
				$set: { passwordResetToken },
			});
			return { message: "Sent reset password email", passwordResetToken };
		}

		default:
			return json({ error: "invalid auth type" }, 400);
	}
};

export const loader = async (args: LoaderFunctionArgs) => {
	const session = await getSession(args.request.headers.get("Cookie"));
	if (session.has("userId")) return redirect("/");

	const { searchParams, origin } = new URL(args.request.url);

	const authType = authTypeSchema.safeParse(args.params.type);
	if (!authType.success) return redirect("/auth/log-in");

	const code = searchParams.get("code");
	const redirectUri = `${origin}/auth/log-in`;

	if (!code)
		return {
			googleAuthUrl: getGoogleAuthUrl({
				clientId: config.GOOGLE_CLIENT_ID,
				redirectUri,
				responseType: "code",
				scope: "email profile",
				prompt: "consent",
				state: "google",
				accessType: "offline",
			}),
			gitHubAuthUrl: null,
			reload: false,
		};

	switch (searchParams.get("state")) {
		case "google": {
			const token = await exchangeCodeForToken(code, redirectUri);
			if (!token) return null;

			const userInfo = await exchangeTokenForUserInfo(token);

			if (!userInfo) return null;

			const googleUser = googleUserSchema.safeParse(userInfo);
			if (!googleUser.success) return null;

			const { email, name, picture } = googleUser.data;
			const user = await getUserByEmail(email);

			if (user?._id) {
				session.set("userId", user._id.toString());
			} else {
				const userId = await createUser({
					email,
					fullName: name,
					pictureUrl: picture,
					role: "user",
					isBanned: false,
					subscriptionPlan: "free",
				});
				session.set("userId", userId);
			}
			return json(
				{ googleAuthUrl: null, gitHubAuthUrl: null, reload: true },
				{
					headers: {
						"Set-Cookie": await commitSession(session),
					},
				},
			);
		}
		case "github": {
			return null;
		}
		default: {
			return null;
		}
	}
};

export default function Route() {
	const params = useParams();
	const authType = params.type as z.infer<typeof authTypeSchema>;
	const data = useLoaderData<typeof loader>();
	const googleAuthUrl = data?.googleAuthUrl;
	const gitHubAuthUrl = data?.gitHubAuthUrl;
	const passwordRef = useRef<string | null>(null);
	const { state } = useNavigation();
	const { user } = useRootLoader();

	// biome-ignore lint/correctness/useExhaustiveDependencies: only need to check once
	useEffect(() => {
		if (data?.reload) {
			location.reload();
		}
	}, []);

	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-12">
			<Link
				to="/"
				className="absolute top-0 left-0 m-6 block size-12 rounded-full p-2 duration-200 ease-out hover:bg-white hover:text-black"
				aria-label="Go back"
			>
				<LuArrowLeft className="size-full" />
			</Link>
			{data?.reload ? (
				<Spinner className="mx-auto size-12 fill-white" />
			) : user ? (
				<>
					<h2 className="font-semibold text-2xl">You are already logged in.</h2>
				</>
			) : (
				<>
					<div className="flex items-center gap-4">
						<img src="/logo.svg" alt="Logo" height={40} width={40} />
						<h2 className="mt-2 font-semibold text-4xl">Varsync</h2>
					</div>
					<Form
						className="grid w-96 shrink-0 items-center gap-4 rounded-lg p-6 ring-1 ring-white/30 [&_label]:text-sm [&_label]:text-white"
						method="POST"
						action={`/auth/${authType}`}
					>
						<InputField
							type="email"
							name="email"
							autoComplete="email"
							label="Email"
							isRequired
						/>
						{authType === "forgot-password" && (
							<Button
								type="submit"
								className="mt-2 h-12 w-full rounded-lg bg-blue-600 font-semibold text-lg"
								onPress={() =>
									toast.success("Sent email!", {
										style: { fontWeight: 500 },
									})
								}
							>
								Send Reset Email
							</Button>
						)}
						{authType !== "forgot-password" && (
							<InputField
								type="text"
								name="password"
								autoComplete="current-password"
								validate={(val) => {
									if (!val) return "Please enter your password.";
									if (authType === "log-in") return;
									if (val.length < 8)
										return "Password has to be at least 8 characters long.";
									return;
								}}
								minLength={8}
								onInput={(e) => {
									passwordRef.current = e.currentTarget.value;
								}}
								label={
									<span className="flex items-center justify-between">
										Password
										{authType === "log-in" && (
											<Link
												to="/auth/forgot-password"
												className="ml-auto text-slate-400 text-xs hover:text-white hover:underline"
											>
												Forgot password?
											</Link>
										)}
									</span>
								}
								isRequired
							/>
						)}
						{authType === "sign-up" && (
							<>
								<InputField
									type="text"
									name="confirm-password"
									validate={(val) => {
										if (!val) return "Please confirm your password.";
										if (val !== passwordRef.current)
											return "Passwords have to match.";
									}}
									minLength={8}
									label="Confirm password"
									isRequired
								/>
								<div id="captcha" />
								<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" />
							</>
						)}
						{authType !== "forgot-password" && (
							<>
								<Button
									type="submit"
									className="mt-2 h-12 w-full rounded-lg bg-blue-600 font-semibold text-lg"
								>
									{state === "submitting" ? (
										<Spinner className="mx-auto size-6 fill-white" />
									) : authType === "log-in" ? (
										"Log In"
									) : (
										"Sign Up"
									)}
								</Button>
								<p className="-mt-2 text-right text-xs">
									{authType === "log-in"
										? "Don't have an account?"
										: "Already have an account?"}
									<Link
										replace
										to={`/auth/${authType === "log-in" ? "sign-up" : "log-in"}`}
										className="ml-1 font-semibold text-blue-400 underline-offset-4 hover:underline"
									>
										{authType === "log-in" ? "Sign up" : "Log in"}
									</Link>
								</p>
								<div className="my-2 flex w-full items-center justify-center gap-4 px-2 text-slate-400 text-sm [&>hr]:h-0.5 [&>hr]:grow [&>hr]:border-slate-400">
									<hr />
									<span>OR</span>
									<hr />
								</div>
								{googleAuthUrl && (
									<Link
										to={googleAuthUrl}
										className="flex h-12 w-full items-center justify-center gap-5 rounded-lg bg-white font-semibold text-black"
									>
										Continue with Google
										<img
											src="/google.svg"
											alt="Google Logo"
											height={24}
											width={24}
										/>
									</Link>
								)}
								{gitHubAuthUrl && (
									<Link
										to={gitHubAuthUrl}
										className="flex h-12 w-full items-center justify-center gap-5 rounded-lg bg-white font-semibold text-black"
									>
										Continue with GitHub
										<img
											src="/github.svg"
											alt="GitHub Logo"
											height={24}
											width={24}
										/>
									</Link>
								)}
							</>
						)}
						<input type="email" name="bot-trap" aria-hidden className="hidden" />
					</Form>
				</>
			)}
		</div>
	);
}
