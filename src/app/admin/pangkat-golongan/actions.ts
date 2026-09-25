"use server";

import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/lib/admin-auth";

const sql = neon(process.env.DATABASE_URL!);

export async function tambahPangkatGolongan(formData: FormData) {
  await requireAdmin();
  const statusKepegawaian = String(formData.get("status_kepegawaian") || "").trim();
  const pangkatGolongan = String(formData.get("pangkat_golongan") || "").trim();

  if (!statusKepegawaian || !pangkatGolongan) {
    throw new Error("Status kepegawaian dan pangkat/golongan wajib diisi.");
  }

  const existing = await sql`
    SELECT id
    FROM pangkat_golongan
    WHERE LOWER(TRIM(status_kepegawaian)) = LOWER(TRIM(${statusKepegawaian}))
      AND LOWER(TRIM(pangkat_golongan)) = LOWER(TRIM(${pangkatGolongan}))
    LIMIT 1
  `;

  if (existing.length > 0) {
    throw new Error("Data pangkat/golongan tersebut sudah tersedia.");
  }

  await sql`
    INSERT INTO pangkat_golongan (status_kepegawaian, pangkat_golongan)
    VALUES (${statusKepegawaian}, ${pangkatGolongan})
  `;

  revalidatePath("/admin/pangkat-golongan");
  revalidatePath("/admin/tambah-pegawai");
  revalidatePath("/admin/data-pegawai");

  return { success: true };
}

export async function updatePangkatGolongan(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const statusKepegawaian = String(formData.get("status_kepegawaian") || "").trim();
  const pangkatGolongan = String(formData.get("pangkat_golongan") || "").trim();

  if (!id) {
    throw new Error("ID data tidak valid.");
  }

  if (!statusKepegawaian || !pangkatGolongan) {
    throw new Error("Status kepegawaian dan pangkat/golongan wajib diisi.");
  }

  const existing = await sql`
    SELECT id
    FROM pangkat_golongan
    WHERE LOWER(TRIM(status_kepegawaian)) = LOWER(TRIM(${statusKepegawaian}))
      AND LOWER(TRIM(pangkat_golongan)) = LOWER(TRIM(${pangkatGolongan}))
      AND id <> ${id}
    LIMIT 1
  `;

  if (existing.length > 0) {
    throw new Error("Data pangkat/golongan tersebut sudah tersedia.");
  }

  await sql`
    UPDATE pangkat_golongan
    SET
      status_kepegawaian = ${statusKepegawaian},
      pangkat_golongan = ${pangkatGolongan},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  revalidatePath("/admin/pangkat-golongan");
  revalidatePath("/admin/tambah-pegawai");
  revalidatePath("/admin/data-pegawai");

  return { success: true };
}

export async function hapusPangkatGolongan(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  if (!id) {
    throw new Error("ID data tidak valid.");
  }

  try {
    await sql`DELETE FROM pangkat_golongan WHERE id = ${id}`;
    revalidatePath("/admin/pangkat-golongan");
    revalidatePath("/admin/tambah-pegawai");
    revalidatePath("/admin/data-pegawai");
    return { success: true };
  } catch (error: unknown) {
    console.error("Gagal menghapus pangkat/golongan:", error);
    if (
      typeof error === "object" && 
      error !== null && 
      "code" in error && 
      (error as Record<string, unknown>).code === "23503"
    ) {
      throw new Error("Pangkat/Golongan masih digunakan oleh pegawai dan tidak dapat dihapus.");
    }
    throw new Error("Gagal menghapus data pangkat/golongan.");
  }
}