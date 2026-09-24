"use server";

import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/lib/admin-auth";

const sql = neon(process.env.DATABASE_URL!);

export async function tambahPangkatGolongan(formData: FormData) {
  await requireAdmin();
  const statusKepegawaian =
    String(formData.get("status_kepegawaian") || "").trim();

  const pangkatGolongan =
    String(formData.get("pangkat_golongan") || "").trim();

  const masaKerjaRaw =
    String(formData.get("masa_kerja") || "").trim();

  if (!statusKepegawaian) {
    return {
      success: false,
      message: "Status kepegawaian wajib diisi.",
    };
  }

  if (!pangkatGolongan) {
    return {
      success: false,
      message: "Pangkat/Golongan wajib diisi.",
    };
  }

  const masaKerja = Number(masaKerjaRaw);

  if (!Number.isInteger(masaKerja) || masaKerja < 0) {
    return {
      success: false,
      message: "Masa kerja harus berupa angka 0 atau lebih.",
    };
  }

  const existing = await sql`
    SELECT id
    FROM pangkat_golongan
    WHERE LOWER(TRIM(status_kepegawaian)) =
          LOWER(TRIM(${statusKepegawaian}))
      AND LOWER(TRIM(pangkat_golongan)) =
          LOWER(TRIM(${pangkatGolongan}))
    LIMIT 1
  `;

  if (existing.length > 0) {
    return {
      success: false,
      message: "Data pangkat/golongan tersebut sudah tersedia.",
    };
  }

  await sql`
    INSERT INTO pangkat_golongan (
      status_kepegawaian,
      pangkat_golongan,
      masa_kerja
    )
    VALUES (
      ${statusKepegawaian},
      ${pangkatGolongan},
      ${masaKerja}
    )
  `;

  revalidatePath("/admin/pangkat-golongan");

  return {
    success: true,
    message: "Data pangkat/golongan berhasil ditambahkan.",
  };
}

export async function updatePangkatGolongan(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  const statusKepegawaian =
    String(formData.get("status_kepegawaian") || "").trim();

  const pangkatGolongan =
    String(formData.get("pangkat_golongan") || "").trim();

  const masaKerjaRaw =
    String(formData.get("masa_kerja") || "").trim();

  if (!id) {
    return {
      success: false,
      message: "ID data tidak valid.",
    };
  }

  if (!statusKepegawaian || !pangkatGolongan) {
    return {
      success: false,
      message: "Status kepegawaian dan pangkat/golongan wajib diisi.",
    };
  }

  const masaKerja = Number(masaKerjaRaw);

  if (!Number.isInteger(masaKerja) || masaKerja < 0) {
    return {
      success: false,
      message: "Masa kerja harus berupa angka 0 atau lebih.",
    };
  }

  const existing = await sql`
    SELECT id
    FROM pangkat_golongan
    WHERE LOWER(TRIM(status_kepegawaian)) =
          LOWER(TRIM(${statusKepegawaian}))
      AND LOWER(TRIM(pangkat_golongan)) =
          LOWER(TRIM(${pangkatGolongan}))
      AND id <> ${id}
    LIMIT 1
  `;

  if (existing.length > 0) {
    return {
      success: false,
      message: "Data pangkat/golongan tersebut sudah tersedia.",
    };
  }

  await sql`
    UPDATE pangkat_golongan
    SET
      status_kepegawaian = ${statusKepegawaian},
      pangkat_golongan = ${pangkatGolongan},
      masa_kerja = ${masaKerja},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  revalidatePath("/admin/pangkat-golongan");

  return {
    success: true,
    message: "Data pangkat/golongan berhasil diperbarui.",
  };
}

export async function hapusPangkatGolongan(id: number) {
  await requireAdmin();
  if (!id) {
    return {
      success: false,
      message: "ID data tidak valid.",
    };
  }

  /*
   * Karena foreign key menggunakan ON DELETE SET NULL,
   * data pegawai tidak ikut terhapus.
   */

  try {
    await sql`DELETE FROM pangkat_golongan WHERE id = ${id}`;
    revalidatePath("/admin/pangkat-golongan");
    revalidatePath("/admin/tambah-pegawai");
    revalidatePath("/admin/data-pegawai");
    return { success: true, message: "Data pangkat/golongan berhasil dihapus." };
  } catch (error: any) {
    console.error("Gagal menghapus pangkat/golongan:", error);
    if (error?.code === "23503") return { success: false, message: "Pangkat/Golongan masih digunakan oleh pegawai dan tidak dapat dihapus." };
    return { success: false, message: "Gagal menghapus data pangkat/golongan." };
  }
}