// src/app/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "kunci_cadangan");

export async function handleLogin(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (username === "admin" && password === "adminbbpvp123") {
    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(SECRET_KEY);

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    redirect("/admin");
  } else {
    redirect("/login?error=1");
  }
}