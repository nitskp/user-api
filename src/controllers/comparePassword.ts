import bcrypt from "bcrypt";

export const comparePassword = async (password: string, dbPassword: string) => {
  const isSame = bcrypt.compare(password, dbPassword);
  return isSame;
};
