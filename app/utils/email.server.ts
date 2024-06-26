import { SESClient, SendEmailCommand, type SendEmailCommandInput } from "@aws-sdk/client-ses";
import { config } from "./config.server";

const sesClient = new SESClient({
	region: config.AWS_REGION,
	credentials: {
		accessKeyId: config.AWS_ACCESS_KEY_ID,
		secretAccessKey: config.AWS_ACCESS_KEY_SECRET,
	},
});

export const sendEmail = async (to: string, subject: string, body: string) => {
	const params: SendEmailCommandInput = {
		Destination: {
			ToAddresses: [to],
		},
		Message: {
			Subject: {
				Charset: "UTF-8",
				Data: subject,
			},
			Body: {
				Html: {
					Charset: "UTF-8",
					Data: body,
				},
				Text: {
					Charset: "UTF-8",
					Data: body,
				},
			},
		},
		Source: config.FROM_EMAIL,
	};

	await sesClient.send(new SendEmailCommand(params));
};
