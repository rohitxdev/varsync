import { LoaderFunctionArgs } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useNavigate, redirect } from '@remix-run/react';
import { ComponentProps } from 'react';
import { TabList, Tab as AriaTab, Tabs } from 'react-aria-components';
import { LuLock, LuServer, LuSettings } from 'react-icons/lu';
import { useProject } from '~/hooks/useProject';
import { getProject } from '~/utils/db.server';

export const loader = (args: LoaderFunctionArgs) => {
	const url = new URL(args.request.url);
	const env = url.searchParams.get('env');

	if (!env) {
		url.searchParams.set('env', 'testing');
		return redirect(url.toString());
	}

	const project = getProject(args.params.projectId!);

	return { project };
};

const Tab = ({ className, ...rest }: ComponentProps<typeof AriaTab>) => {
	return (
		<AriaTab
			className={`flex cursor-pointer items-center justify-start gap-4 rounded px-2 py-1 hover:bg-neutral-200 ${className}`}
			{...rest}
		/>
	);
};

export default function Route() {
	const { id } = useProject();
	const navigate = useNavigate();

	return (
		<div className="grid min-h-screen grid-cols-[auto_1fr] items-center bg-neutral-200">
			<div className="grid h-full w-52 content-start gap-4 rounded-md bg-neutral-100 p-2 font-medium">
				<Link className="flex items-center justify-center gap-2 p-4" to="/">
					<img src="/logo.png" alt="Logo" height={24} width={24} />
					<span className="text-xl font-semibold">Varsync</span>
				</Link>
				<Tabs onSelectionChange={(key) => navigate(`/${id}/${key.toString()}`)}>
					<TabList>
						<Tab id="">
							<LuServer /> Variables
						</Tab>
						<Tab id="settings">
							<LuSettings /> Settings
						</Tab>
						<Tab id="tokens">
							<LuLock /> Tokens
						</Tab>
					</TabList>
				</Tabs>
			</div>
			<Outlet />
		</div>
	);
}
