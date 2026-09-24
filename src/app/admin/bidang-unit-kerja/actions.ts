"use server";

import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/lib/admin-auth";

const sql = neon(process.env.DATABASE_URL!);

export async function tambahBidangUnitKerja(
  formData: FormData,
) {
  await requireAdmin();
  const namaBidang =
    String(formData.get("nama_bidang") || "").trim();

  if (!namaBidang) {
    return {
      success: false,
      message: "Nama Bidang/Unit Kerja wajib diisi.",
    };
  }

  const existing = await sql`
    SELECT id
    FROM bidang_unit_kerja
    WHERE LOWER(TRIM(nama_bidang)) =
          LOWER(TRIM(${namaBidang}))
    LIMIT 1
  `;

  if (existing.length > 0) {
    return {
      success: false,
      message: "Bidang/Unit Kerja tersebut sudah tersedia.",
    };
  }

  await sql`
    INSERT INTO bidang_unit_kerja (
      nama_bidang
    )
    VALUES (
      ${namaBidang}
    )
  `;

  revalidatePath("/admin/bidang-unit-kerja");

  return {
    success: true,
    message:
      "Bidang/Unit Kerja berhasil ditambahkan.",
  };
}

export async function updateBidangUnitKerja(
  formData: FormData,
) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  const namaBidang =
    String(formData.get("nama_bidang") || "").trim();

  if (!id) {
    return {
      success: false,
      message: "ID data tidak valid.",
    };
  }

  if (!namaBidang) {
    return {
      success: false,
      message: "Nama Bidang/Unit Kerja wajib diisi.",
    };
  }

  const existing = await sql`
    SELECT id
    FROM bidang_unit_kerja
    WHERE LOWER(TRIM(nama_bidang)) =
          LOWER(TRIM(${namaBidang}))
      AND id <> ${id}
    LIMIT 1
  `;

  if (existing.length > 0) {
    return {
      success: false,
      message: "Bidang/Unit Kerja tersebut sudah tersedia.",
    };
  }

  await sql`
    UPDATE bidang_unit_kerja
    SET
      nama_bidang = ${namaBidang},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  revalidatePath("/admin/bidang-unit-kerja");

  return {
    success: true,
    message:
      "Bidang/Unit Kerja berhasil diperbarui.",
  };
}

export async function hapusBidangUnitKerja(
  id: number,
) {
  await requireAdmin();
  if (!id) {
    return {
      success: false,
      message: "ID data tidak valid.",
    };
  }

  try {
    await sql`DELETE FROM bidang_unit_kerja WHERE id = ${id}`;
    revalidatePath("/admin/bidang-unit-kerja");
    revalidatePath("/admin/tambah-pegawai");
    revalidatePath("/admin/data-pegawai");
    return { success: true, message: "Bidang/Unit Kerja berhasil dihapus." };
  } catch (error: any) {
    console.error("Gagal menghapus bidang/unit kerja:", error);
    if (error?.code === "23503") return { success: false, message: "Bidang/Unit Kerja masih digunakan oleh pegawai dan tidak dapat dihapus." };
    return { success: false, message: "Gagal menghapus Bidang/Unit Kerja." };
  }
}