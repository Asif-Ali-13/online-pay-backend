import mongoose from "mongoose";

export const connectDB = async () => {
	try {
		const connectionInstance = 
			await mongoose.connect(`${process.env.MONGODB_URI!}/O-pay`);
		console.log(`MONGO DB connected !`);
	} 
	catch (error) {
		console.log(`MONGO DB Connection Failed . Error : ${error}`);
		process.exit(1);
	}
}

