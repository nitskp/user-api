import { MongoClient } from "mongodb";

export const getUser = async (email: string, databaseUrl: string) => {
  const client = new MongoClient(databaseUrl);
  try {
    await client.connect();
    console.log("Database Connected");
    // need to learn why project option or filtering field that has to be shown is not working
    const result = await client
      .db("data")
      .collection("users")
      .findOne({ email: email });
    return result;
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
};
