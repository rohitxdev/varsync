import { useNavigate } from "@remix-run/react";
import {
	Dialog,
	DialogTrigger,
	Menu,
	MenuItem,
	OverlayArrow,
	Popover,
} from "react-aria-components";
import { LuLogOut, LuUser } from "react-icons/lu";
import { useFetcher } from "react-router-dom";
import { useRootLoader } from "~/utils/hooks";
import { Button } from "./buttons";

export const ProfileMenu = () => {
	const { user } = useRootLoader();
	const navigate = useNavigate();
	const fetcher = useFetcher();

	return (
		<div>
			<DialogTrigger>
				<Button>
					<img
						className="aspect-square size-12 rounded-full border bg-blue-600"
						src={user?.pictureUrl ?? ""}
						alt="User"
					/>
				</Button>
				<Popover>
					<OverlayArrow />
					<Dialog>
						<fetcher.Form>
							<Menu className="overflow-hidden rounded-md bg-white text-black text-sm *:flex *:gap-2 *:px-4 *:py-2 *:outline-none [&_*:hover]:bg-neutral-100">
								<MenuItem onAction={() => navigate("/account")}>
									<LuUser className="size-4" /> Account
								</MenuItem>
								<MenuItem
									onAction={() =>
										fetcher.submit(null, {
											action: "/auth/log-out",
											method: "POST",
										})
									}
								>
									<LuLogOut className="size-4" /> Log Out
								</MenuItem>
							</Menu>
						</fetcher.Form>
					</Dialog>
				</Popover>
			</DialogTrigger>
		</div>
	);
};
