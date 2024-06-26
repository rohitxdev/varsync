import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { config } from "./config.server";

export const paddle = new Paddle(config.PADDLE_API_KEY, {
	environment: Environment.sandbox,
});
