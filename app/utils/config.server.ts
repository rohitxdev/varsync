import { z } from "zod";

try {
	process.loadEnvFile();
} catch (err) {
	console.log("\u001b[34mwarning: could not load env file.\u001b[0m");
}

const booleanEnum = z.enum(["true", "false"]);

export const config = z
	.object({
		APP_ENV: z.enum(["development", "production", "test"]),
		IS_SIGN_UP_ENABLED: booleanEnum.transform((item) => item === "true"),
		IS_LOG_IN_ENABLED: booleanEnum.transform((item) => item === "true"),
		IS_PAYMENT_ENABLED: booleanEnum.transform((item) => item === "true"),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		JWT_SIGNING_KEY: z.string().min(1),
		MONGODB_URL: z.string().min(1),
		FROM_EMAIL: z.string().min(1),
		AWS_ACCESS_KEY_ID: z.string().min(1),
		AWS_ACCESS_KEY_SECRET: z.string().min(1),
		AWS_REGION: z.string().min(1),
		VITE_SENTRY_DSN: z.string().min(1),
		VITE_SENTRY_ORG: z.string().min(1),
		VITE_SENTRY_PROJECT: z.string().min(1),
		SENTRY_AUTH_TOKEN: z.string().min(1),
		PADDLE_API_KEY: z.string().min(1),
		VITE_PADDLE_CLIENT_TOKEN: z.string().min(1),
		VITE_PADDLE_ENVIRONMENT: z.enum(["sandbox", "production"]),
		UMAMI_WEBSITE_ID: z.string().min(1),
		API_RATE_LIMIT_PER_MINUTE: z
			.string()
			.min(1)
			.transform((item) => Number.parseInt(item, 10)),
	})
	.parse(process.env);
