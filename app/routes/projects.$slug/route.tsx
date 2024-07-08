import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, Outlet, redirect, useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { type ComponentProps, useState } from "react";
import {
	Tab as AriaTab,
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
	TabList,
	Tabs,
} from "react-aria-components";
import {
	LuFileText,
	LuKey,
	LuLogOut,
	LuMoreVertical,
	LuSettings,
	LuUser,
	LuWebhook,
} from "react-icons/lu";
import { ComboBox, Modal } from "~/components/ui";
import { getUserFromRequest } from "~/utils/auth.server";
import { getAllProjects, getProject } from "~/utils/db.server";
import { useRootLoader } from "~/utils/hooks";
import LuVault from "../../assets/vault.svg?react";
import { LogOutDialog } from "../../components/dialogs";
import { ThemeToggle } from "./theme-toggle";

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUserFromRequest(args.request);
	if (!user) return redirect("/");

	const [project, projects] = await Promise.all([
		getProject({
			slug: args.params.slug!,
			userId: user._id.toString(),
		}),
		getAllProjects(user._id.toString()),
	]);

	if (!project?._id) return redirect("/projects", { statusText: "Project not found" });

	return { project, projects };
};

export const meta: MetaFunction<typeof loader> = (args) => {
	return [{ title: `${args.data?.project.name ?? "Project"} | Varsync` }];
};

const Tab = ({ className, ...rest }: ComponentProps<typeof AriaTab>) => {
	return (
		<AriaTab
			className={`flex h-9 cursor-pointer items-center justify-start gap-4 rounded px-4 font-medium selected:font-semibold selected:text-white text-slate-400 text-sm outline-none hover:bg-white/10 ${className}`}
			{...rest}
		/>
	);
};

const Route = () => {
	const { project, projects } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const slug = project.slug;
	const envs = Object.keys(project.envs);
	const { user } = useRootLoader();
	const [showLogOutDialog, setShowLogOutDialog] = useState(false);
	const { pathname } = useLocation();

	return (
		<div className="grid min-h-screen grid-cols-[auto_1fr] items-center divide-x-[1px] divide-white/10">
			<div className="grid h-full w-64 grid-cols-1 grid-rows-[auto_auto_1fr_auto] content-start gap-4 bg-neutral-500/5 p-2 font-medium">
				<Link className="m-4 mb-0 flex items-center justify-center gap-3" to="/">
					<img src="/logo.png" alt="Logo" height={24} width={24} />
					<span className="font-semibold text-2xl">Varsync</span>
				</Link>
				<ComboBox
					className="w-full px-2"
					defaultSelectedKey={project.name}
					options={projects.map((item) => item.name)}
					onSelectionChange={(key) => {
						const currentProject = projects.find(
							(item) => item.name === key?.toString(),
						);
						if (!currentProject) return;
						location.href = location.href.replace(slug, currentProject.slug);
					}}
				/>
				<Tabs
					defaultSelectedKey={pathname}
					onSelectionChange={(key) => navigate(key.toString())}
				>
					<TabList>
						<Tab id={`/projects/${slug}/vault/${envs[0]}`}>
							<LuVault className="size-4" />
							<span>Vault</span>
						</Tab>
						<Tab id={`/projects/${slug}/logs`}>
							<LuFileText />
							<span>Logs</span>
						</Tab>
						<Tab id={`/projects/${slug}/access-tokens`}>
							<LuKey />
							<span>Access Tokens</span>
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
				<br />
				<ThemeToggle />
				<div className="flex items-center gap-4 p-2">
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
					<MenuTrigger>
						<Button className="rounded p-2 hover:bg-white/10">
							<LuMoreVertical />
						</Button>
						<Popover className="entering:fade-in entering:zoom-in-95 exiting:fade-out exiting:zoom-out-95 entering:animate-in exiting:animate-out fill-mode-forwards">
							<Menu className="w-28 overflow-hidden rounded-md bg-white font-medium text-black text-sm *:flex *:h-11 *:cursor-pointer *:items-center *:justify-center *:gap-2 [&_*:focus-visible]:bg-neutral-100 [&_*]:outline-none [&_svg]:size-5 [&_svg]:shrink-0">
								<MenuItem onAction={() => navigate("/account")}>
									<LuUser className="size-5" /> Account
								</MenuItem>
								<MenuItem
									className="text-red-500"
									onAction={() => setShowLogOutDialog(true)}
								>
									<LuLogOut className="size-5" /> Log out
								</MenuItem>
							</Menu>
						</Popover>
					</MenuTrigger>
					<Modal
						dialog={<LogOutDialog />}
						isOpen={showLogOutDialog}
						onOpenChange={setShowLogOutDialog}
					/>
				</div>
			</div>
			<Outlet />
		</div>
	);
};

export default Route;
