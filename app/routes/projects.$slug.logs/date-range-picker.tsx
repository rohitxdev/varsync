import type { ComponentProps } from "react";
import {
	Button,
	CalendarCell,
	CalendarGrid,
	DateInput,
	DateRangePicker as AriaDateRangePicker,
	DateSegment,
	Dialog,
	Group,
	Heading,
	Popover,
	RangeCalendar,
} from "react-aria-components";
import { LuChevronLeft, LuChevronRight, LuChevronsUpDown } from "react-icons/lu";

export const DateRangePicker = ({
	className,
	...rest
}: ComponentProps<typeof AriaDateRangePicker>) => (
	<AriaDateRangePicker className={`w-64 ${className}`} {...rest}>
		<Group className="flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2 py-1">
			<DateInput className="ml-auto flex" slot="start">
				{(segment) => <DateSegment segment={segment} />}
			</DateInput>
			<span aria-hidden="true">–</span>
			<DateInput className="mr-auto flex" slot="end">
				{(segment) => <DateSegment segment={segment} />}
			</DateInput>
			<Button>
				<LuChevronsUpDown />
			</Button>
		</Group>
		<Popover className="rounded-lg border border-white/10 bg-dark">
			<Dialog>
				<RangeCalendar className="flex w-[--trigger-width] flex-col gap-3 bg-white/5 p-4">
					<header className="flex w-full items-center justify-between">
						<Button className="rounded p-1 hover:bg-white/5" slot="previous">
							<LuChevronLeft className="size-5" />
						</Button>
						<Heading />
						<Button className="rounded p-1 hover:bg-white/5" slot="next">
							<LuChevronRight className="size-5" />
						</Button>
					</header>
					<CalendarGrid>
						{(date) => (
							<CalendarCell
								className="flex size-7 items-center justify-center rounded-full text-center text-sm selected:bg-blue-500"
								date={date}
							/>
						)}
					</CalendarGrid>
				</RangeCalendar>
			</Dialog>
		</Popover>
	</AriaDateRangePicker>
);
