import User, { UserInterface } from "../models/user.model";

export const createUser = async (databaseUrl: string, data: UserInterface) => {
  try {
    const result = await User.create(data);
    return result;
  } catch (error) {
    console.log(error);
  }
};
