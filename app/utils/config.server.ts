import { z } from 'zod';

const booleanEnum = z.enum(['true', 'false']);

export const config = z
	.object({
		ENV: z.enum(['development', 'production', 'test']),
		IS_SIGN_UP_ENABLED: booleanEnum,
		IS_LOG_IN_ENABLED: booleanEnum,
		IS_PAYMENT_ENABLED: booleanEnum,
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		PADDLE_API_KEY: z.string().min(1),
		JWT_SIGNING_KEY: z.string().min(1),
		MONGODB_URL: z.string().min(1),
		FROM_EMAIL: z.string().min(1),
		AWS_ACCESS_KEY_ID: z.string().min(1),
		AWS_ACCESS_KEY_SECRET: z.string().min(1),
		AWS_REGION: z.string().min(1),
	})
	.transform((item) => ({
		...item,
		IS_SIGN_UP_ENABLED: item.IS_SIGN_UP_ENABLED === 'true',
		IS_LOG_IN_ENABLED: item.IS_LOG_IN_ENABLED === 'true',
		IS_PAYMENT_ENABLED: item.IS_PAYMENT_ENABLED === 'true',
	}))
	.parse(process.env);
