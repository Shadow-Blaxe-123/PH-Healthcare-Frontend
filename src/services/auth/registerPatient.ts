/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import z from "zod";
import loginUser from "./loginUser";

const registerValidationSchema = z
  .object({
    name: z.string().min(1, { error: "Name is required" }),
    address: z.string().min(1, { error: "Address is required" }),
    email: z.email({ error: "Invalid email address" }),
    password: z
      .string()
      .min(6, { error: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { error: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default async function registerPatient(
  currentState: any,
  formData: FormData
): Promise<any> {
  try {
    const validationData = {
      name: formData.get("name"),
      address: formData.get("address"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };
    const validatedFields = registerValidationSchema.safeParse(validationData);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.issues.map((issue: any) => {
          return {
            field: issue.path[0],
            message: issue.message,
          };
        }),
      };
    }
    const registerData = {
      password: formData.get("password"),
      patient: {
        name: formData.get("name"),
        address: formData.get("address"),
        email: formData.get("email"),
      },
    };
    const newFormData = new FormData();
    newFormData.append("data", JSON.stringify(registerData));

    const res = await fetch(
      "http://localhost:5000/api/v1/user/create-patient",
      {
        method: "POST",
        body: newFormData,
      }
    );
    const result = await res.json();
    console.log("res:", res);

    if (result.success) {
      await loginUser(currentState, formData);
    }

    return result;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.log(error);
    return { error: "Registration failed" };
  }
}
