import { numFormatter } from '~/utils/misc';

interface QuotaUsageProps {
	usedQuota: number;
	quotaLimit: number;
}

export const QuotaUsage = ({ usedQuota, quotaLimit }: QuotaUsageProps) => {
	return (
		<div className="max-w-[300px] rounded-md p-4">
			<h3 className="font-semibold">Read requests</h3>
			<p className="text-sm">
				{numFormatter.format(usedQuota)} of {numFormatter.format(quotaLimit)} used
			</p>
			<div>
				<div className="h-2 w-full overflow-hidden rounded-full bg-neutral-400">
					<div
						className="h-full bg-blue-500"
						style={{ width: `${(usedQuota / quotaLimit) * 100}%` }}
					/>
				</div>
				<div className="flex justify-between">
					<small>0</small>
					<small>{numFormatter.format(quotaLimit)}</small>
				</div>
			</div>
		</div>
	);
};
