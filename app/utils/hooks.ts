import { useRouteLoaderData } from "@remix-run/react";
import type { loader as rootLoader } from "~/root";
import type { loader as projectLoader } from "~/routes/projects.$slug/route";

export const useProject = () => {
	const { project } = useRouteLoaderData<typeof projectLoader>("routes/projects.$slug")!;
	return project;
};

export const useRootLoader = () => useRouteLoaderData<typeof rootLoader>("root")!;
