import { createRequestHandler } from "@remix-run/express";
import express from "express";
import * as Sentry from "@sentry/remix";
import * as build from "./build/server/index.js";

Sentry.init({
	dsn: process.env.VITE_SENTRY_DSN,
	tracesSampleRate: 1,
	autoInstrumentRemix: true,
});

const app = express();

app.use(express.static("build/client"));
app.all("*", createRequestHandler({ build }));

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Server is listening to port ${port}`);
});
