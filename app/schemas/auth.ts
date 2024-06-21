import { z } from 'zod';

export const googleUserSchema = z.object({
	id: z.string().min(1),
	email: z.string().min(1),
	verified_email: z.boolean(),
	name: z.string().min(1),
	given_name: z.string().min(1),
	family_name: z.string().min(1),
	picture: z.string().min(1),
	locale: z.string().min(1).optional(),
});

export const reportFrequencySchema = z.enum(['off', 'daily', 'weekly', 'monthly']);

export const userPreferencesSchema = z.object({
	shouldSendEmailReports: z.boolean(),
	errorReportsFrequency: reportFrequencySchema,
	analyticsReportsFrequency: reportFrequencySchema,
	graphAnimationsEnabled: z.boolean(),
});

export const subscriptionPlanSchema = z.enum(['basic', 'pro']).nullish();

export const roleSchema = z.enum(['user', 'admin']);

export const userSchema = z.object({
	email: z.string().email(),
	passwordHash: z.string().nullish(),
	fullName: z.string().nullish(),
	pictureUrl: z.string().nullish(),
	role: roleSchema,
	preferences: userPreferencesSchema,
	subscriptionPlan: subscriptionPlanSchema,
	subscriptionStartDate: z.date().nullish(),
	subscriptionEndDate: z.date().nullish(),
	isBanned: z.boolean(),
	passwordResetToken: z.string().nullish(),
});

export interface User extends z.infer<typeof userSchema> {}
