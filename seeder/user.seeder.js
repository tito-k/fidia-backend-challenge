import User from "../src/model/user.model.js"

const users = [
  new User({
    name: "John Smith",
    email: "john.smith@example.com",
    password: "fidiaChallenge123$",
    mobileNumber: "+2348100000008",
    country: "Nigeria",
  }),
  new User({
    name: "John Doe",
    email: "john.doe@example.com",
    password: "fidiaChallenge123$",
    mobileNumber: "+2348100000048",
    country: "Nigeria",
  }),
];

export const seedUser = async () => {
  try {
    const userCollection = await User.find();

    if (userCollection.length > 0) {
      return;
    }

    await User.collection.drop();

    users.forEach((user) => {
      User.create(user);
    });

    console.log("User collection has been added to db.");
  } catch (error) {
    console.log(error);
  }
};
