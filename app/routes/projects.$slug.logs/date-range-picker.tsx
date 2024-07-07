import { type ComponentProps, useEffect, useState } from "react";
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
import { LuCalendar, LuChevronLeft, LuChevronRight } from "react-icons/lu";

export const DateRangePicker = ({
	className,
	...rest
}: ComponentProps<typeof AriaDateRangePicker>) => {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		setIsLoaded(true);
	}, []);

	return (
		<AriaDateRangePicker hideTimeZone className={`w-64 ${className}`} {...rest}>
			<Group className="flex h-9 items-center gap-1.5 divide-x-[1px] divide-white/10 rounded border border-white/10 bg-white/5">
				<div className="flex w-full items-center gap-1.5">
					{isLoaded ? (
						<>
							<DateInput className="ml-auto flex" slot="start">
								{(segment) => <DateSegment segment={segment} />}
							</DateInput>
							<span aria-hidden="true">-</span>
							<DateInput className="mr-auto flex" slot="end">
								{(segment) => <DateSegment segment={segment} />}
							</DateInput>
						</>
					) : (
						<p className="w-full text-center">--/--/---- - --/--/----</p>
					)}
				</div>
				<Button className="h-full px-3">
					<LuCalendar className="size-4" />
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
};
