import { MongoClient } from "mongodb";

export interface User {
  firstName: string;
  lastName: string;
  profilePic: Buffer;
  email: string;
  password: string;
  mobileNumber: string;
}

export const createUser = async (databaseUrl: string, data: User) => {
  const client = new MongoClient(databaseUrl);
  try {
    await client.connect();
    console.log(`Database connected`);
    const result = await client.db("data").collection("users").insertOne(data);
    return result;
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
};
