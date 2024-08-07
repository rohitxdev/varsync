import { createRequestHandler } from "@remix-run/express";
import express from "express";
import * as Sentry from "@sentry/remix";
import * as build from "./build/server/index.js";

Sentry.init({
	dsn: process.env.VITE_SENTRY_DSN,
	autoInstrumentRemix: true,
	enabled: process.env.APP_ENV === "production",
});

const app = express();

app.use(express.static("build/client"));
app.all("*", createRequestHandler({ build }));

const host = process.env.HOST;
const port = Number.parseInt(process.env.PORT);

app.listen(port, host, () => {
	console.log(`\u001b[34mserver is listening on port ${port}\u001b[0m`);
});
