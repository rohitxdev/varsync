import type { ReactNode } from "react";
import toast from "react-hot-toast";

import { LuInfo, LuCheckCircle, LuXCircle, LuAlertTriangle } from "react-icons/lu";
export const showToast = (content: ReactNode, type?: "success" | "warning" | "error") => {
	let icon: ReactNode = <LuInfo className="size-5 stroke-[3] text-white" />;
	let toastBackgroundColor = "bg-white/5";
	let toastBorderColor = "border-white/25";

	switch (type) {
		case "success":
			icon = <LuCheckCircle className="size-5 stroke-[3] text-green-500" />;
			toastBackgroundColor = "bg-green-500/5";
			toastBorderColor = "border-green-500/25";
			break;
		case "error":
			icon = <LuXCircle className="size-5 stroke-[3] text-red-500" />;
			toastBackgroundColor = "bg-red-500/5";
			toastBorderColor = "border-red-500/25";
			break;
		case "warning":
			icon = <LuAlertTriangle className="size-5 stroke-[3] text-yellow-500" />;
			toastBackgroundColor = "bg-yellow-500/5";
			toastBorderColor = "border-yellow-500/25";
			break;
		default:
			break;
	}
	toast.custom(
		<div className={`overflow-hidden rounded-md border bg-dark duration-100 ${toastBorderColor}`}>
			<div className={`flex min-w-80 items-center gap-4 px-6 py-4 ${toastBackgroundColor}`}>
				{icon}
				{content}
			</div>
		</div>,
	);
};
