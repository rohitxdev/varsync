import { ComponentProps, ReactNode } from 'react';
import {
	DialogTrigger,
	ModalOverlay as AriaModalOverlay,
	Modal as AriaModal,
} from 'react-aria-components';

interface ModalProps extends ComponentProps<typeof AriaModal> {
	trigger: ReactNode;
	dialog: ReactNode;
}

export const Modal = ({ trigger, dialog, className, ...rest }: ModalProps) => {
	return (
		<DialogTrigger>
			{trigger}
			<AriaModalOverlay className="fixed inset-0 flex min-h-full items-center justify-center bg-black/30 backdrop-blur-sm duration-150">
				<AriaModal
					className={`entering:scale-95 entering:ease-out shadow-xl outline-none duration-150 *:max-w-[90vw] *:outline-none ${className}`}
					{...rest}
				>
					{dialog}
				</AriaModal>
			</AriaModalOverlay>
		</DialogTrigger>
	);
};
