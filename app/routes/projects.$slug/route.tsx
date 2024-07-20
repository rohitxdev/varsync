import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, Outlet, redirect, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { type ComponentProps, useState } from "react";
import { Tab as AriaTab, Button, TabList, Tabs } from "react-aria-components";
import {
	LuFileText,
	LuKey,
	LuLayers,
	LuLogOut,
	LuPanelRightClose,
	LuSettings,
	LuUser,
	LuWebhook,
} from "react-icons/lu";
import { Modal } from "~/components/ui";
import { getProject } from "~/db/projects.server";
import { getUser } from "~/utils/auth.server";
import { MasterPasswordProvider } from "~/utils/contexts";
import { useRootLoader } from "~/utils/hooks";
import LuVault from "../../assets/vault.svg?react";
import { LogOutDialog } from "../../components/dialogs";

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUser(args.request);
	if (!user) return redirect("/");

	const project = await getProject({
		slug: args.params.slug!,
		userId: user._id.toString(),
	});
	if (!project?._id) return redirect("/projects", { statusText: "Project not found" });

	return { project };
};

export const meta: MetaFunction<typeof loader> = (args) => {
	return [{ title: `${args.data?.project.name ?? "Project"} | Varsync` }];
};

const Tab = ({ className, ...rest }: ComponentProps<typeof AriaTab>) => {
	return (
		<AriaTab
			className={`flex h-9 cursor-pointer items-center justify-start gap-4 rounded selected:bg-white/10 px-4 font-medium selected:text-white text-slate-400 outline-none hover:text-white ${className}`}
			{...rest}
		/>
	);
};

const Route = () => {
	const { user } = useRootLoader();
	const { project } = useLoaderData<typeof loader>();
	const { pathname } = useLocation();
	const [showNav, setShowNav] = useState(true);
	const [showLogOutDialog, setShowLogOutDialog] = useState(false);
	const navigate = useNavigate();
	const slug = project.slug;
	const envs = Object.keys(project.envs);

	return (
		<MasterPasswordProvider>
			<div className="grid min-h-screen w-screen grid-cols-[auto_1fr] items-center divide-x-[1px] divide-white/10 *:max-h-screen *:overflow-auto">
				<div
					className={`flex h-full flex-col content-start gap-4 bg-neutral-500/5 p-2 font-medium duration-150 ${showNav ? "max-w-64" : "w-16"}`}
				>
					<div className="flex items-center justify-between p-3">
						{showNav && (
							<Link className="flex items-center justify-center gap-1.5" to="/">
								<img src="/logo.png" alt="Logo" height={36} width={36} />
								<span className="font-semibold text-2xl">Varsync</span>
							</Link>
						)}
						<Button className="p-1" onPress={() => setShowNav((val) => !val)}>
							<LuPanelRightClose
								className={`size-5 text-slate-400 ${showNav && "rotate-180"}`}
							/>
						</Button>
					</div>
					<Tabs
						defaultSelectedKey={pathname}
						onSelectionChange={(key) => navigate(key.toString())}
					>
						<TabList
							className={`[&_svg]:size-5 ${!showNav && "*:mx-auto *:justify-center *:px-0 [&_span]:hidden"}`}
						>
							<Tab id={`/projects/${slug}/vault/${envs[0]}`}>
								<LuVault className="size-5" />
								<span>Vault</span>
							</Tab>
							<Tab id={`/projects/${slug}/logs`}>
								<LuFileText />
								<span>Logs</span>
							</Tab>
							<Tab id={`/projects/${slug}/api-keys`}>
								<LuKey />
								<span>API Keys</span>
							</Tab>
							<Tab id={`/projects/${slug}/webhooks`}>
								<LuWebhook />
								<span>Webhooks</span>
							</Tab>
							<Tab id={`/projects/${slug}/settings`}>
								<LuSettings />
								<span>Settings</span>
							</Tab>
						</TabList>
					</Tabs>
					{/* <ThemeToggle /> */}
					<div className="mt-auto space-y-1">
						<Link
							className="flex h-9 cursor-pointer items-center justify-start gap-4 rounded font-medium text-slate-400 outline-none hover:text-white md:px-4"
							to="/projects"
						>
							<LuLayers className="size-5" />
							{showNav && <span>Projects</span>}
						</Link>
						<Link
							className="flex h-9 cursor-pointer items-center justify-start gap-4 rounded font-medium text-slate-400 outline-none hover:text-white md:px-4"
							to="/account"
						>
							<LuUser className="size-5" />
							{showNav && <span>Account</span>}
						</Link>
					</div>
					<div className="flex items-center gap-4 p-2">
						{showNav && (
							<>
								<img
									className="rounded-full border border-white/10"
									src={user?.pictureUrl!}
									alt=""
									height={48}
									width={48}
								/>
								<div className="flex w-1/2 flex-col gap-1">
									<p>{user?.fullName ?? user?.email.split("@")[0]}</p>
									<p className="overflow-hidden text-ellipsis text-slate-400 text-xs">
										{user?.email}
									</p>
								</div>
							</>
						)}
						<Modal
							dialog={<LogOutDialog />}
							isOpen={showLogOutDialog}
							onOpenChange={setShowLogOutDialog}
						>
							<Button className="mx-auto">
								<LuLogOut className="size-5" />
							</Button>
						</Modal>
					</div>
				</div>
				<Outlet />
			</div>
		</MasterPasswordProvider>
	);
};

export default Route;
