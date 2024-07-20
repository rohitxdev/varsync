import type { ComponentProps } from "react";
import {
	DateRangePicker as AriaDateRangePicker,
	Button,
	CalendarCell,
	CalendarGrid,
	DateInput,
	DateSegment,
	Dialog,
	Group,
	Heading,
	Popover,
	RangeCalendar,
} from "react-aria-components";
import { LuCalendar, LuChevronDown, LuChevronLeft, LuChevronRight } from "react-icons/lu";

export const DateRangePicker = ({
	className,
	...rest
}: ComponentProps<typeof AriaDateRangePicker>) => (
	<AriaDateRangePicker shouldForceLeadingZeros className={`w-72 ${className}`} {...rest}>
		<Group className="flex h-9 items-center justify-end gap-2 rounded border border-white/10 bg-white/5">
			<LuCalendar className="ml-2 size-4 shrink-0" />
			<div className="flex grow items-center justify-center gap-1.5">
				<DateInput className="flex" slot="start">
					{(segment) => <DateSegment segment={segment} />}
				</DateInput>
				<span aria-hidden="true">-</span>
				<DateInput className="flex" slot="end">
					{(segment) => <DateSegment segment={segment} />}
				</DateInput>
			</div>
			<Button className="flex h-full w-8 items-center justify-center border-white/10 border-l-[1px]">
				<LuChevronDown />
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
								className="flex size-7 items-center justify-center rounded-full selected:bg-blue-500 text-center text-sm"
								date={date}
							/>
						)}
					</CalendarGrid>
				</RangeCalendar>
			</Dialog>
		</Popover>
	</AriaDateRangePicker>
);
