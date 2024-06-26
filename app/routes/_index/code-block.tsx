import { Button, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { LuCopy } from "react-icons/lu";
import toast from "react-hot-toast";
import { useSearchParams } from "@remix-run/react";
import hljs from "highlight.js/lib/core";
import js from "highlight.js/lib/languages/javascript";
import go from "highlight.js/lib/languages/go";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/tokyo-night-dark.css";

hljs.registerLanguage("javascript", js);
hljs.registerLanguage("go", go);
hljs.registerLanguage("python", python);

interface CodeBlockProps {
	data: {
		language: string;
		code: string;
	}[];
}

const defaultLang = "javascript";

export const CodeBlock = (props: CodeBlockProps) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const lang = searchParams.get("lang") || defaultLang;

	return (
		<Tabs
			className="h-[500px] w-full max-w-[720px] overflow-hidden rounded-lg border border-neutral-600"
			onSelectionChange={(key) =>
				setSearchParams(
					(params) => {
						params.set("lang", key.toString());
						return params;
					},
					{
						preventScrollReset: true,
						replace: true,
					},
				)
			}
			defaultSelectedKey={
				props.data.find((item) => item.language === lang) ? lang : defaultLang
			}
		>
			<TabList className="flex divide-x-[1px] divide-neutral-600 overflow-hidden">
				{props.data.map((item) => (
					<Tab
						className="flex w-full items-center justify-center gap-2 overflow-hidden text-ellipsis py-2 text-sm font-medium capitalize outline-none selected:bg-neutral-800"
						key={item.language}
						id={item.language}
					>
						<span>{item.language}</span>
						<img
							className="rounded-sm"
							src={`/${item.language}.svg`}
							height={16}
							width={16}
							alt=""
						/>
					</Tab>
				))}
			</TabList>
			{props.data.map((item) => (
				<TabPanel
					className="relative size-full bg-neutral-800"
					key={item.language}
					id={item.language}
				>
					<Button
						className="absolute right-0 top-0 m-2 rounded p-2 duration-100 hover:bg-white/10"
						onPress={() =>
							toast.promise(navigator.clipboard.writeText(item.code), {
								success: "Copied to clipboard",
								error: "Failed to copy",
								loading: null,
							})
						}
					>
						<LuCopy className="size-5" />
					</Button>
					<div className="size-full overflow-auto p-3 pb-12">
						<pre
							className="text-left font-jetbrains-mono text-sm font-semibold"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: Needed for highlight.js
							dangerouslySetInnerHTML={{
								__html: hljs.highlight(item.code, {
									language: item.language,
									ignoreIllegals: true,
								}).value,
							}}
						/>
					</div>
				</TabPanel>
			))}
		</Tabs>
	);
};
