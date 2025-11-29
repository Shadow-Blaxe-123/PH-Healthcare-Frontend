"use server";

import { deleteCookie } from "@/lib/tokenHandlers";
import { redirect } from "next/navigation";

export default async function logoutUser() {
  await deleteCookie("accessToken");
  await deleteCookie("refreshToken");
  redirect("/login");
}
