import {
	DialogTrigger,
	Button,
	Popover,
	OverlayArrow,
	Dialog,
	Switch,
} from 'react-aria-components';

export const ProfileMenu = () => {
	return (
		<div>
			<DialogTrigger>
				<Button className="aspect-square size-12 rounded-full border bg-blue-600"></Button>
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
