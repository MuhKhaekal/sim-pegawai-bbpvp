import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function requireAdmin() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET belum dikonfigurasi.");

  const token = (await cookies()).get("admin_session")?.value;
  if (!token) throw new Error("Sesi admin tidak ditemukan.");

  try {
    return await jwtVerify(token, new TextEncoder().encode(secret));
  } catch {
    throw new Error("Sesi admin tidak valid atau sudah kedaluwarsa.");
  }
}
