import mongoose from "mongoose";
import { seedUser } from "../../seeder/user.seeder"

const connectToDB = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to database...");

    if (process.env.NODE_ENV !== 'production') {
      await seedUser();
    }
  } catch (error) {
    console.log(`Could not connect to database ${error}`);
  }
};

export default connectToDB;
