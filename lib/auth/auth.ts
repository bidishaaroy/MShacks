import bcrypt from "bcryptjs";
import { getRepository } from "@/lib/data/repository";

export async function authenticateUser(email: string, password: string) {
  const repository = getRepository();
  const user = await repository.findUserByEmail(email);

  if (!user) {
    return null;
  }

  if (user.password && user.password === password) {
    return user;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}
