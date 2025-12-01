/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getCookie } from "@/lib/tokenHandlers";
import { UserInfo } from "@/types/user.interface";
import jwt, { JwtPayload } from "jsonwebtoken";

export const getUserInfo = async (): Promise<UserInfo | null> => {
  try {
    const accessToken = await getCookie("accessToken");

    if (!accessToken) {
      return null;
    }

    const verifiedToken = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET as string
    ) as JwtPayload;

    if (!verifiedToken) {
      return null;
    }

    const userInfo: UserInfo = {
      name: verifiedToken.name || "Unknown User",
      email: verifiedToken.email,
      role: verifiedToken.role,
    };

    return userInfo;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};
