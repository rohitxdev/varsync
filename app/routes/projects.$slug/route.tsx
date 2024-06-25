import type { LoaderFunctionArgs } from '@remix-run/node';
import {
	Link,
	Outlet,
	useNavigate,
	redirect,
	useLoaderData,
	useNavigation,
} from '@remix-run/react';
import type { ComponentProps } from 'react';
import { TabList, Tab as AriaTab, Tabs } from 'react-aria-components';
import { LuFileText, LuLayers, LuLock, LuServer, LuSettings } from 'react-icons/lu';
import { getProject } from '~/utils/db.server';
import { getUserFromSessionCookie } from '~/utils/auth.server';
import Spinner from '../../assets/spinner.svg?react';

export const loader = async (args: LoaderFunctionArgs) => {
	const user = await getUserFromSessionCookie(args.request.headers.get('Cookie'));
	if (!user) return null;

	const project = await getProject({
		slug: args.params.slug!,
		userId: user._id.toString(),
	});

	if (!project?._id) return redirect('/projects');
	return { project };
};

const Tab = ({ className, ...rest }: ComponentProps<typeof AriaTab>) => {
	return (
		<AriaTab
			className={`flex cursor-pointer items-center justify-start gap-4 rounded px-2 py-1 hover:bg-white/10 ${className}`}
			{...rest}
		/>
	);
};

const Route = () => {
	const data = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const { state } = useNavigation();
	const env = Object.keys(data?.project.variables ?? [])[0];

	return (
		<div className="grid min-h-screen grid-cols-[auto_1fr] items-center">
			<div className="grid h-full w-64 grid-rows-[auto_auto_1fr_auto] content-start gap-4 rounded-md bg-neutral-500/5 p-2 font-medium">
				<Link className="flex items-center justify-center gap-2 p-4" to="/">
					<img src="/logo.png" alt="Logo" height={24} width={24} />
					<span className="text-xl font-semibold">Varsync</span>
				</Link>
				<Tabs
					onSelectionChange={(key) => navigate(`/projects/${data?.project.slug}/${key.toString()}`)}
				>
					<TabList>
						<Tab id={`${env}`}>
							<LuServer /> Config
						</Tab>
						<Tab id="logs">
							<LuFileText /> Logs
						</Tab>
						<Tab id="settings">
							<LuSettings /> Settings
						</Tab>
						<Tab id="tokens">
							<LuLock /> Tokens
						</Tab>
					</TabList>
				</Tabs>
				<br />
				<Link className="flex items-center gap-4 p-2" to="/projects">
					<LuLayers /> Projects
				</Link>
			</div>
			{state === 'loading' ? <Spinner className="mx-auto size-8 fill-current" /> : <Outlet />}
		</div>
	);
};

export default Route;
