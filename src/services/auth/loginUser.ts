/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import z from "zod";

const loginValidationSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z
    .string()
    .min(6, { error: "Password must be at least 6 characters" }),
});

export default async function loginUser(
  _currentState: any,
  formData: FormData
): Promise<any> {
  try {
    const loginData = {
      password: formData.get("password"),
      email: formData.get("email"),
    };
    const validatedFields = loginValidationSchema.safeParse(loginData);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.issues.map((issue) => {
          return {
            field: issue.path[0],
            message: issue.message,
          };
        }),
      };
    }

    const res = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(loginData),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    console.log("res:", res);

    return res;
  } catch (error) {
    console.log(error);
    return { error: "Login failed" };
  }
}
