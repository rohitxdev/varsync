import Cryptr from "cryptr";
import { z } from "zod";

const cryptr = new Cryptr("foobar", {
	encoding: "base64",
	pbkdf2Iterations: 10000,
	saltLength: 10,
});

export const encrypt = (text: string) => cryptr.encrypt(text);

export const decrypt = (text: string) => cryptr.decrypt(text);

const apiKeySchema = z.object({
	env: z.string().min(1),
	projectId: z.string().min(1),
});

export const generateApiKey = ({ env, projectId }: z.infer<typeof apiKeySchema>) =>
	encrypt(JSON.stringify({ env, projectId }));

export const verifyApiKey = (apiKey: string) => apiKeySchema.safeParse(JSON.parse(apiKey)).success;

export const LOCALE_UK = "en-GB";

export const getRandomNumber = (min: number, max: number, truncate = true) => {
	const val = min + Math.random() * (max - min);
	return truncate ? Math.trunc(val) : val;
};

export const numFormatter = new Intl.NumberFormat(LOCALE_UK, {
	notation: "compact",
	maximumSignificantDigits: 3,
});
