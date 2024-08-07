import { useSearchParams } from "@remix-run/react";
import hljs from "highlight.js/lib/core";
import go from "highlight.js/lib/languages/go";
import js from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import "highlight.js/styles/tokyo-night-dark.css";
import { CopyButton } from "~/components/buttons";

hljs.registerLanguage("javascript", js);
hljs.registerLanguage("go", go);
hljs.registerLanguage("python", python);

const jsCode = `import { VarsyncClient } from 'varsync';

const varsync = new VarsyncClient(import.meta.env.VARSYNC_API_KEY); 
//const varsync = new VarsyncClient(process.env.VARSYNC_API_KEY); for node.js

await varsync.init();

const doSomethingCool = (usedQuota) => {
	if (!varsync.get("IS_FEATURE_ENABLED")) return;

	if(usedQuota <= varsync.get("QUOTA_LIMIT")) {
		doStuff()
	}
};`;

const goCode = `package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/varsync/go"
)

func main() {
	config := varsync.New(os.Getenv("VARSYNC_API_KEY"))

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		if !config.GetBool("IS_FEATURE_ENABLED") {
			c.Status(http.StatusBadRequest)
			return
		}

		user, ok := c.Get("user")
		if !ok {
			c.Status(http.StatusUnauthorized)
			return
		}

		u, ok := user.(User)
		if !ok {
			c.Status(http.StatusInternalServerError)
			return
		}

		if u.UsedQuota >= config.GetInt("QUOTA_LIMIT") {
			c.Status(http.StatusForbidden)
			return
		}
			
		doStuff()
		c.Status(http.StatusOK)
		return
	})

	r.Run()
}
`;

const pythonCode = `from flask import Flask, request, jsonify
from varsync import VarsyncClient
import os

app = Flask(__name__)

config = VarsyncClient(env = os.getenv("NODE_ENV"))

@app.route('/api', methods = ['GET'])
def handler():
    if not config.get("IS_FEATURE_ENABLED"):
        return '', 400

    user = get_current_user()

    if user['used_quota'] <= config.get("QUOTA_LIMIT"):
        do_stuff()
        return '', 200

    return '', 403
`;
const defaultLang = "javascript";

const data = [
	{ language: "javascript", code: jsCode },
	{ language: "go", code: goCode },
	{ language: "python", code: pythonCode },
];

export const CodeBlock = () => {
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
			defaultSelectedKey={data.find((item) => item.language === lang) ? lang : defaultLang}
		>
			<TabList className="flex divide-x-[1px] divide-neutral-600 overflow-hidden">
				{data.map((item) => (
					<Tab
						className="flex w-full items-center justify-center gap-2 overflow-hidden text-ellipsis selected:bg-neutral-800 py-2 font-medium text-sm capitalize outline-none"
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
			{data.map((item) => (
				<TabPanel
					className="relative size-full bg-neutral-800"
					key={item.language}
					id={item.language}
				>
					<CopyButton
						className="absolute top-0 right-0 m-2 rounded border-none p-2 duration-100 hover:bg-white/10"
						text={item.code}
					/>
					<div className="size-full overflow-auto p-3 pb-12">
						<pre
							className="text-left font-jetbrains-mono font-semibold text-sm"
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
