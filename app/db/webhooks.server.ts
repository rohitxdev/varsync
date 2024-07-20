import { z } from "zod";
import { db } from "./conn.server";

const webhookSchema = z.object({
	label: z.string().min(1),
	url: z.string().min(1),
	method: z.enum(["GET", "POST", "PUT", "DELETE"]),
	on_action: z.enum(["create", "update", "delete"]),
	variable_name: z.string().min(1),
	project_id: z.string().min(1),
	user_id: z.string().min(1),
});

const webhooks = db.collection<z.infer<typeof webhookSchema>>("webhooks");
