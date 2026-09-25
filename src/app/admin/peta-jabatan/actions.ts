"use server";

import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/lib/admin-auth";

const sql = neon(process.env.DATABASE_URL!);

function parsePositiveInt(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function getName(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function tambahPetaJabatan(formData: FormData) {
  await requireAdmin();

  const namaJabatan = getName(formData.get("nama_jabatan"));
  const kebutuhanIdeal = parsePositiveInt(formData.get("kebutuhan_ideal"));
  
  const kelasJabatanValue = getName(formData.get("kelas_jabatan"));
  const kelasJabatan = kelasJabatanValue === "" ? null : parsePositiveInt(formData.get("kelas_jabatan"), 0);

  // Ambil nilai BUP, set default ke 58 jika kosong
  const bup = parsePositiveInt(formData.get("bup"), 58); 

  if (!namaJabatan) {
    return {
      success: false,
      message: "Nama jabatan wajib diisi.",
    };
  }

  const existing = await sql`
    SELECT id
    FROM peta_jabatan
    WHERE LOWER(TRIM(nama_jabatan)) =
          LOWER(TRIM(${namaJabatan}))
    LIMIT 1
  `;

  if (existing.length > 0) {
    return {
      success: false,
      message: "Nama jabatan tersebut sudah terdaftar.",
    };
  }

  await sql`
    INSERT INTO peta_jabatan (
      nama_jabatan,
      kebutuhan_ideal,
      kelas_jabatan,
      bup
    )
    VALUES (
      ${namaJabatan},
      ${kebutuhanIdeal},
      ${kelasJabatan},
      ${bup}
    )
  `;

  revalidatePath("/admin/peta-jabatan");
  revalidatePath("/admin/tambah-pegawai");
  revalidatePath("/admin/data-pegawai");

  return {
    success: true,
    message: "Jabatan berhasil ditambahkan.",
  };
}

export async function updatePetaJabatan(formData: FormData) {
  await requireAdmin();
  const id = parsePositiveInt(formData.get("id"));
  const namaJabatan = getName(formData.get("nama_jabatan"));
  const kebutuhanIdeal = parsePositiveInt(formData.get("kebutuhan_ideal"));
  const kelasJabatanValue = getName(formData.get("kelas_jabatan"));
  const kelasJabatan = kelasJabatanValue === "" ? null : parsePositiveInt(formData.get("kelas_jabatan"), 0);
  
  // Ambil nilai BUP, set default ke 58 jika kosong
  const bup = parsePositiveInt(formData.get("bup"), 58); 

  if (!id || !namaJabatan) {
    throw new Error("Data jabatan tidak lengkap.");
  }

  const duplicate = await sql`
    SELECT id
    FROM peta_jabatan
    WHERE LOWER(TRIM(nama_jabatan)) = LOWER(TRIM(${namaJabatan}))
      AND id <> ${id}
    LIMIT 1
  `;

  if (duplicate.length > 0) {
    throw new Error("Nama jabatan tersebut sudah digunakan.");
  }

  await sql`
    UPDATE peta_jabatan
    SET
      nama_jabatan = ${namaJabatan},
      kebutuhan_ideal = ${kebutuhanIdeal},
      kelas_jabatan = ${kelasJabatan},
      bup = ${bup},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;

  revalidatePath("/admin/peta-jabatan");
  revalidatePath("/admin/tambah-pegawai");
  revalidatePath("/admin/data-pegawai");

  return {
    success: true,
    message: "Jabatan berhasil diperbarui.", // Pesan diperbaiki
  };
}

export async function hapusPetaJabatan(formData: FormData) {
  await requireAdmin();
  const id = parsePositiveInt(formData.get("id"));

  if (!id) {
    throw new Error("ID jabatan tidak valid.");
  }

  try {
    await sql`DELETE FROM peta_jabatan WHERE id = ${id}`;
    revalidatePath("/admin/peta-jabatan");
    revalidatePath("/admin/tambah-pegawai");
    revalidatePath("/admin/data-pegawai");
    return { success: true, message: "Jabatan berhasil dihapus." };
  } catch (error: unknown) {
    console.error("Gagal menghapus jabatan:", error);
    
    // Pengecekan tipe yang aman (Type Guard) menggantikan 'any'
    if (
      typeof error === "object" && 
      error !== null && 
      "code" in error && 
      (error as Record<string, unknown>).code === "23503"
    ) {
      return { success: false, message: "Jabatan masih digunakan oleh pegawai dan tidak dapat dihapus." };
    }
    
    return { success: false, message: "Gagal menghapus jabatan." };
  }
}