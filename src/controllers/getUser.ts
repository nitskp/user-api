import User from "../models/user.model";

export const getUser = async (email: string, getPassword?: boolean) => {
  // const client = new MongoClient(databaseUrl);
  try {
    const result = await User.findOne(
      { email: email },
      { _id: 0, password: getPassword }
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};
