import { MongoClient } from "mongodb";
import { config } from "~/utils/config.server";

const mongoClient = new MongoClient(config.MONGODB_URL, {
	connectTimeoutMS: 5000,
	monitorCommands: true,
});

const connectToDb = async () => {
	try {
		await mongoClient.connect();
		console.log("connected to mongodb successfully ✔");
	} catch (error) {
		console.error(error);
		console.error("could not connect to mongodb. Trying again...");
		await connectToDb();
	}
};

await connectToDb();

export const db = mongoClient.db("varsync");
