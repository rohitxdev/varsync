import { LuChevronsUpDown } from 'react-icons/lu';
import {
	Select as AriaSelect,
	SelectValue,
	Button,
	Popover,
	ListBox,
	ListBoxItem,
} from 'react-aria-components';
import { ComponentProps, ReactNode } from 'react';

interface SelectProps extends ComponentProps<typeof AriaSelect> {
	options: ReactNode[];
	placement?: ComponentProps<typeof Popover>['placement'];
}

export const Select = ({ options, placement, className, ...rest }: SelectProps) => {
	return (
		<AriaSelect className={`mr-auto ${className}`} {...rest}>
			<Button className="flex h-8 w-full items-center justify-between gap-2 rounded-md border border-black bg-neutral-100 px-2 pl-3 text-sm font-medium *:shrink-0">
				<SelectValue className="w-3/4 overflow-hidden text-ellipsis text-start capitalize" />
				<LuChevronsUpDown className="stroke-neutral-600 stroke-[3]" />
			</Button>
			<Popover placement={placement}>
				<ListBox className="w-[--trigger-width] rounded-md border border-black bg-neutral-100 p-1 font-medium">
					{options.map((item, i) => (
						<ListBoxItem
							className="overflow-hidden text-ellipsis rounded p-1 capitalize outline-none focus:bg-neutral-300"
							key={i}
							id={item?.toString()}
						>
							{item}
						</ListBoxItem>
					))}
				</ListBox>
			</Popover>
		</AriaSelect>
	);
};
