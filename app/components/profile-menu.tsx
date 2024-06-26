import { DialogTrigger, Popover, OverlayArrow, Dialog, Switch } from "react-aria-components";
import { useRootLoader } from "~/utils/hooks";

export const ProfileMenu = () => {
	const { user } = useRootLoader();

	return (
		<div>
			<DialogTrigger>
				<img
					className="aspect-square size-12 rounded-full border bg-blue-600"
					src={user?.pictureUrl ?? ""}
					alt="User"
				/>
				<Popover className="duration-150">
					<OverlayArrow />
					<Dialog>
						<div className="flex-col">
							<Switch defaultSelected>
								<div className="indicator" /> Wi-Fi
							</Switch>
							<Switch defaultSelected>
								<div className="indicator" /> Bluetooth
							</Switch>
							<Switch>
								<div className="indicator" /> Mute
							</Switch>
						</div>
					</Dialog>
				</Popover>
			</DialogTrigger>
		</div>
	);
};
