import { ObjectId, type UpdateFilter } from "mongodb";
import { z } from "zod";
import { db } from "./conn.server";

export const subscriptionPlanSchema = z.enum(["free", "pro"]);

export const roleSchema = z.enum(["user", "admin"]);

export const userSchema = z.object({
	email: z.string().email(),
	passwordHash: z.string().nullish(),
	fullName: z.string().nullish(),
	pictureUrl: z.string().nullish(),
	role: roleSchema,
	subscriptionPlan: subscriptionPlanSchema,
	subscriptionStartDate: z.date().nullish(),
	subscriptionEndDate: z.date().nullish(),
	isBanned: z.boolean(),
	passwordResetToken: z.string().nullish(),
});

const users = db.collection<z.infer<typeof userSchema>>("users");

export const getUserById = async (id: string) => await users.findOne({ _id: new ObjectId(id) });

export const getUserByEmail = async (email: string) => await users.findOne({ email });

export const createUser = async (user: z.infer<typeof userSchema>) => {
	const { insertedId } = await users.insertOne(user);
	return insertedId.toString();
};

export const updateUser = async (
	id: string,
	updatedUser: UpdateFilter<z.infer<typeof userSchema>>,
) => await users.updateOne({ _id: new ObjectId(id) }, { $set: updatedUser });

export const updateUserName = async (name: string, userId: string) =>
	await users.updateOne({ _id: new ObjectId(userId) }, { $set: { fullName: name } });
