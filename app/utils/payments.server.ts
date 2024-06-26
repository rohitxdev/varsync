import { Environment, Paddle, LogLevel } from "@paddle/paddle-node-sdk";
import { config } from "./config.server";

export const paddle = new Paddle(config.PADDLE_API_KEY, {
	environment: Environment.sandbox,
	logLevel: config.APP_ENV === "development" ? LogLevel.verbose : LogLevel.none,
});
