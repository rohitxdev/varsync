import crypto from "node:crypto";
import slugify from "slugify";
import { z } from "zod";

export const toSlug = (text: string) => slugify(text, { lower: true, trim: true });

export const LOCALE_UK = "en-GB";

export const getRandomNumber = (min: number, max: number, truncate = true) => {
	const val = min + Math.random() * (max - min);
	return truncate ? Math.trunc(val) : val;
};

export const numFormatter = new Intl.NumberFormat(LOCALE_UK, {
	notation: "compact",
	maximumSignificantDigits: 3,
});

export const actionResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});

export const scryptHash = (text: string) => {
	const salt = crypto.randomBytes(64).toString("base64");
	const hash = crypto.scryptSync(text, salt, 64).toString("base64");
	return `${hash}${salt}`;
};

export const verifyScryptHash = (text: string, hash: string) => {
	return crypto.timingSafeEqual(
		crypto.scryptSync(text, hash.slice(64), 64),
		Buffer.from(hash.slice(0, 64), "base64"),
	);
};

// export const encryptAES = (text: string, secretKey: string) => {
// 	const key = crypto.pbkdf2Sync(secretKey, "salt", 200000, 32, "sha256");
// 	const iv = crypto.randomBytes(16);
// 	const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
// 	return Buffer.concat([iv, cipher.update(text, "utf8"), cipher.final()]).toString("base64");
// };

// export const decryptAES = (cipherText: string, secretKey: string) => {
// 	const buffer = Buffer.from(cipherText, "base64");
// 	const iv = buffer.subarray(0, 16);
// 	const cipher = buffer.subarray(16);
// 	const key = crypto.pbkdf2Sync(secretKey, "salt", 200000, 32, "sha256");
// 	const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
// 	return Buffer.concat([decipher.update(cipher), decipher.final()]).toString("utf8");
// };
