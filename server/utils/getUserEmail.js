import { clerkClient } from "@clerk/clerk-sdk-node";

export const getUserEmail = async (userId) => {
  const user = await clerkClient.users.getUser(userId);

  return user.emailAddresses[0].emailAddress;
};