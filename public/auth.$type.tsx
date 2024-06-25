import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, Link, useLoaderData, useNavigation, useParams } from '@remix-run/react';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { useRef } from 'react';
import { Button, Input, Label, TextField } from 'react-aria-components';
import toast from 'react-hot-toast';
import { LuArrowLeft } from 'react-icons/lu';
import { z } from 'zod';

import { googleUserSchema, userSchema } from '~/schemas/auth';
import {
	commitSession,
	destroySession,
	exchangeCodeForToken,
	exchangeTokenForUserInfo,
	getGoogleAuthUrl,
	getSession,
} from '~/utils/auth.server';

import GitHubLogoIcon from '../assets/github.svg';
import GoogleLogoIcon from '../assets/google.svg';
import SpinnerVector from '../assets/spinner.svg';
import { getRandomNumber } from '~/utils/misc';

const authTypeSchema = z.enum(['log-in', 'sign-up', 'forgot-password']);

const validPasswordRegex = new RegExp(
	'^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$',
);

const logInBodySchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

const signUpBodySchema = z
	.object({
		email: z.string().email(),
		password: z
			.string()
			.regex(
				validPasswordRegex,
				'Password has to be at least 8 characters and contain 1 uppercase letter, 1 number, and 1 special character',
			),
		'confirm-password': z.string(),
	})
	.refine((val) => val['password'] === val['confirm-password']);

const forgotPasswordBodySchema = z.object({
	email: z.string().email(),
});

export const action = async (args: ActionFunctionArgs) => {
	const session = await getSession();
	if (session.has('userId')) return json({ error: 'user is already logged in' }, 400);

	const formData = Object.fromEntries(await args.request.formData());
	if (formData['bot-trap']) return null;

	switch (args.params.type) {
		case 'log-in': {
			const logInData = logInBodySchema.safeParse(formData);
			if (!logInData.success) return json(logInData.error, 422);

			const user = await usersCollection.findOne({ email: logInData.data.email });
			if (!user) return json({ error: 'user not found' }, 404);
			if (!user.passwordHash) return json({ error: 'password not set' });
			if (!(await argon2.verify(user.passwordHash, logInData.data.password))) {
				return json({ error: 'incorrect password' }, 400);
			}

			session.set('userId', user._id.toString());

			return redirect('/', {
				headers: {
					'Set-Cookie': await commitSession(session),
				},
			});
		}

		case 'sign-up': {
			const signUpData = signUpBodySchema.safeParse(formData);
			if (!signUpData.success) return json(signUpData.error, 422);

			if (await usersCollection.findOne({ email: signUpData.data.email })) {
				return json({ error: 'user with this email already exists' }, 400);
			}

			const { insertedId: userId } = await usersCollection.insertOne({
				email: signUpData.data.email,
				passwordHash: await argon2.hash(signUpData.data.password),
				pictureUrl: `https://api.dicebear.com/7.x/lorelei/svg?seed=${getRandomNumber(9999, 99999)}`,
				preferences: {
					shouldSendEmailReports: true,
					analyticsReportsFrequency: 'weekly',
					errorReportsFrequency: 'weekly',
					graphAnimationsEnabled: true,
				},
				role: 'user',
				isBanned: false,
			} satisfies z.infer<typeof userSchema>);

			session.set('userId', userId.toString());

			return redirect('/', {
				headers: {
					'Set-Cookie': await commitSession(session),
				},
			});
		}

		case 'log-out':
			return redirect('/', {
				headers: {
					'Set-Cookie': await destroySession(session),
				},
			});

		case 'forgot-password': {
			const forgotPasswordData = forgotPasswordBodySchema.safeParse(formData);
			if (!forgotPasswordData.success) return json(forgotPasswordData.error, 422);
			const user = await usersCollection.findOne({ email: forgotPasswordData.data.email });
			if (!user) return json({ error: 'user not found' }, 404);
			const passwordResetToken = jwt.sign(
				{
					sub: user._id,
					type: 'password-reset',
				},
				process.env.JWT_SECRET,
				{ expiresIn: '10m' },
			);
			await usersCollection.findOneAndUpdate({ _id: user._id }, { $set: { passwordResetToken } });
			return { message: 'Sent reset password email', passwordResetToken };
		}

		default:
			return json({ error: 'invalid auth type' }, 400);
	}
};

export const loader = async (args: LoaderFunctionArgs) => {
	const session = await getSession(args.request.headers.get('Cookie'));

	if (session.has('userId')) return redirect('/');

	const { searchParams, origin } = new URL(args.request.url);

	const authType = authTypeSchema.safeParse(args.params.type);
	if (!authType.success) return redirect('/auth/log-in');

	const code = searchParams.get('code');
	const redirectUri = origin + '/auth/log-in';

	if (!code)
		return {
			googleAuthUrl: getGoogleAuthUrl({
				clientId: process.env.GOOGLE_CLIENT_ID!,
				redirectUri,
				responseType: 'code',
				scope: 'email profile',
				prompt: 'consent',
				state: 'google',
				accessType: 'offline',
			}),
			gitHubAuthUrl: null,
		};

	switch (searchParams.get('state')) {
		case 'google': {
			const token = await exchangeCodeForToken(code, redirectUri);
			if (!token) return null;

			const userInfo = await exchangeTokenForUserInfo(token);
			if (!userInfo) return null;

			const googleUser = googleUserSchema.safeParse(userInfo);
			if (!googleUser.success) return null;

			const { email, name, picture } = googleUser.data;
			const user = await usersCollection.findOne({ email });

			if (user?._id) {
				session.set('userId', user._id.toString());
			} else {
				const { insertedId: userId } = await usersCollection.insertOne({
					email,
					fullName: name,
					pictureUrl: picture,
					role: 'user',
					isBanned: false,
					preferences: {
						shouldSendEmailReports: true,
						analyticsReportsFrequency: 'weekly',
						errorReportsFrequency: 'weekly',
						graphAnimationsEnabled: true,
					},
				});
				session.set('userId', userId.toString());
			}
			return redirect('/', {
				headers: {
					'Set-Cookie': await commitSession(session),
				},
			});
		}
		case 'github': {
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
	const user = useUser();
	const { state } = useNavigation();

	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-12">
			<Link
				to="/"
				className="absolute left-0 top-0 m-6 block size-12 rounded-full p-2 duration-200 ease-out hover:bg-white hover:text-black"
				aria-label="Go back"
			>
				<LuArrowLeft className="size-full" />
			</Link>
			{user ? (
				<>
					<h2 className="text-2xl font-semibold">You are already logged in.</h2>
				</>
			) : (
				<>
					<LogoText />
					<Form
						className="flex w-[36ch] shrink-0 flex-col items-center gap-4 rounded-lg p-6 ring-1 ring-white/30"
						method="POST"
						action={`/auth/${authType}`}
					>
						<TextField
							type="email"
							name="email"
							autoComplete="email"
							className="flex w-full flex-col gap-0.5"
						>
							<Label className="font-medium">Email</Label>
							<Input
								required
								placeholder="Email"
								className="rounded-md bg-white/20 px-3 py-2 text-lg font-medium placeholder:text-lg"
							/>
							<FieldError>
								{({ validationDetails }) => {
									if (validationDetails.typeMismatch) {
										return 'Please enter a valid email.';
									}
									return 'Please enter your email.';
								}}
							</FieldError>
						</TextField>
						{authType === 'forgot-password' && (
							<Button
								type="submit"
								className="mt-2 h-12 w-full rounded-lg bg-indigo-600 text-lg font-semibold"
								onPress={() => toast.success('Sent email!', { style: { fontWeight: 500 } })}
							>
								Send Reset Email
							</Button>
						)}
						{authType !== 'forgot-password' && (
							<TextField
								type="text"
								name="password"
								autoComplete="current-password"
								validate={(val) => {
									if (!val) return 'Please enter your password.';
									if (authType === 'log-in') return;
									if (validPasswordRegex.test(val)) return;
									return 'Password has to be at least 8 characters and contain 1 uppercase letter, 1 number, and 1 special character.';
								}}
								onInput={(e) => {
									passwordRef.current = e.currentTarget.value;
								}}
								className="flex w-full flex-col gap-0.5"
								isRequired
							>
								<div className="flex items-end justify-between">
									<Label className="font-medium">Password</Label>
									{authType === 'log-in' && (
										<Link
											to="/auth/forgot-password"
											className="ml-auto text-xs text-neutral-400 hover:text-white hover:underline"
										>
											Forgot password?
										</Link>
									)}
								</div>
								<Input
									placeholder="Password"
									className="rounded-md bg-white/20 px-3 py-2 text-lg font-medium"
								/>
								<FieldError />
							</TextField>
						)}
						{authType === 'sign-up' && (
							<>
								<TextField
									type="text"
									name="confirm-password"
									validate={(val) => {
										if (!val) return 'Please enter your password.';
										if (val !== passwordRef.current) return 'Passwords do not match.';
									}}
									className="flex w-full flex-col gap-0.5"
									isRequired
								>
									<Label>Confirm password</Label>
									<Input
										placeholder="ilovecats123"
										className="rounded-md bg-white/20 px-3 py-2 text-lg"
									/>
									<FieldError />
								</TextField>
								<div id="captcha" />
								<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"></script>
							</>
						)}
						{authType !== 'forgot-password' && (
							<>
								<Button
									type="submit"
									className="mt-2 h-12 w-full rounded-lg bg-indigo-600 text-lg font-semibold"
								>
									{state === 'submitting' ? (
										<SpinnerVector className="mx-auto fill-white p-2" />
									) : authType === 'log-in' ? (
										'Log In'
									) : (
										'Sign Up'
									)}
								</Button>
								<p className="text-sm">
									{authType === 'log-in' ? "Don't have an account?" : 'Already have an account?'}
									<Link
										replace
										to={`/auth/${authType === 'log-in' ? 'sign-up' : 'log-in'}`}
										className="ml-1 font-semibold text-indigo-400 underline-offset-4 hover:underline"
									>
										{authType === 'log-in' ? 'Sign up' : 'Log in'}
									</Link>
								</p>
								<div className="my-2 flex w-full items-center justify-center gap-4 px-2 [&>hr]:h-0.5 [&>hr]:grow [&>hr]:bg-white">
									<hr />
									<span>OR</span>
									<hr />
								</div>
								{googleAuthUrl && (
									<Link
										to={googleAuthUrl}
										className="flex h-12 w-full items-center justify-center gap-5 rounded-lg bg-white font-semibold text-black"
									>
										Continue with Google{' '}
										<img src="/google.svg" alt="Google Logo" height={24} width={24} />
									</Link>
								)}
								{gitHubAuthUrl && (
									<Link
										to={gitHubAuthUrl}
										className="flex h-12 w-full items-center justify-center gap-5 rounded-lg bg-white font-semibold text-black"
									>
										Continue with GitHub{' '}
										<img src="/github.svg" alt="GitHub Logo" height={24} width={24} />
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
