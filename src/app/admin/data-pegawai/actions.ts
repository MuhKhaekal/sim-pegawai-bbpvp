"use server";

import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/lib/admin-auth";

const sql = neon(process.env.DATABASE_URL!);

const text = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

const nullableText = (value: FormDataEntryValue | null) => {
  const v = text(value);
  return v === "" ? null : v;
};

const positiveId = (value: FormDataEntryValue | null, label: string) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error(`${label} tidak valid.`);
  return id;
};

const nonNegativeInt = (value: FormDataEntryValue | null, label: string, fallback = 0) => {
  const raw = text(value);
  if (raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) throw new Error(`${label} harus berupa bilangan bulat 0 atau lebih.`);
  return n;
};

function revalidatePegawai(id?: number) {
  revalidatePath("/admin");
  revalidatePath("/admin/data-pegawai");
  revalidatePath("/admin/tambah-pegawai");
  revalidatePath("/admin/manajemen-cuti");
  if (id) {
    revalidatePath(`/admin/data-pegawai/${id}`);
    revalidatePath(`/admin/edit-pegawai/${id}`);
  }
}

export async function tambahPegawai(formData: FormData) {
  await requireAdmin();

  const nama = text(formData.get("nama"));
  const nip = text(formData.get("nip")).replace(/\s/g, "");
  const tempatLahir = nullableText(formData.get("tempat_lahir"));
  const tanggalLahir = nullableText(formData.get("tanggal_lahir"));
  const jabatanId = positiveId(formData.get("jabatan_id"), "Jabatan");
  const bidangId = positiveId(formData.get("bidang_unit_kerja_id"), "Bidang/Unit Kerja");
  const pangkatId = positiveId(formData.get("pangkat_golongan_id"), "Pangkat/Golongan");
  const tmtPangkat = nullableText(formData.get("tmt_pangkat_terakhir"));
  const tmtJabatan = nullableText(formData.get("tmt_jabatan_terakhir"));
  const status = text(formData.get("status_kepegawaian"));
  const sisaLalu = nonNegativeInt(formData.get("sisa_cuti_tahun_lalu"), "Sisa cuti tahun lalu");
  const cutiKini = nonNegativeInt(formData.get("cuti_tahun_ini"), "Cuti tahun ini");

  if (!nama) throw new Error("Nama pegawai wajib diisi.");
  if (!/^\d{18}$/.test(nip)) throw new Error("NIP harus terdiri dari 18 digit angka.");
  if (!status) throw new Error("Status kepegawaian wajib dipilih.");

  const result = await sql.transaction([
    sql`SELECT id FROM data_pegawai WHERE regexp_replace(nip, '[^0-9]', '', 'g') = ${nip} LIMIT 1`,
    sql`SELECT id, nama_jabatan FROM peta_jabatan WHERE id = ${jabatanId}`,
    sql`SELECT id, nama_bidang FROM bidang_unit_kerja WHERE id = ${bidangId}`,
    sql`SELECT id, status_kepegawaian, pangkat_golongan FROM pangkat_golongan WHERE id = ${pangkatId}`,
  ]);

  if (result[0].length) throw new Error("NIP tersebut sudah terdaftar.");
  const jabatan = result[1][0];
  const bidang = result[2][0];
  const pangkat = result[3][0];
  if (!jabatan) throw new Error("Jabatan yang dipilih tidak ditemukan.");
  if (!bidang) throw new Error("Bidang/Unit Kerja yang dipilih tidak ditemukan.");
  if (!pangkat) throw new Error("Pangkat/Golongan yang dipilih tidak ditemukan.");
  if (String(pangkat.status_kepegawaian).trim().toLowerCase() !== status.toLowerCase()) {
    throw new Error("Status kepegawaian tidak sesuai dengan pangkat/golongan yang dipilih.");
  }

  await sql`
    INSERT INTO data_pegawai (
      nama, nip, tempat_lahir, tanggal_lahir, bidang, pangkat_golongan,
      tmt_pangkat_terakhir, jabatan, tmt_jabatan_terakhir, status_kepegawaian,
      sisa_cuti_tahun_lalu, cuti_tahun_ini, jabatan_id, pangkat_golongan_id, bidang_unit_kerja_id
    ) VALUES (
      ${nama}, ${nip}, ${tempatLahir}, ${tanggalLahir}, ${jabatan.nama_jabatan}, ${pangkat.pangkat_golongan},
      ${tmtPangkat}, ${jabatan.nama_jabatan}, ${tmtJabatan}, ${status},
      ${sisaLalu}, ${cutiKini}, ${jabatanId}, ${pangkatId}, ${bidangId}
    )
  `;

  revalidatePegawai();
  return { success: true, message: "Data pegawai berhasil ditambahkan." };
}

export async function updatePegawai(id: number, formData: FormData) {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) throw new Error("ID pegawai tidak valid.");

  const nama = text(formData.get("nama"));
  const nip = text(formData.get("nip")).replace(/\s/g, "");
  const tempatLahir = nullableText(formData.get("tempat_lahir"));
  const tanggalLahir = nullableText(formData.get("tanggal_lahir"));
  const jabatanId = positiveId(formData.get("jabatan_id"), "Jabatan");
  const bidangId = positiveId(formData.get("bidang_unit_kerja_id"), "Bidang/Unit Kerja");
  const pangkatId = positiveId(formData.get("pangkat_golongan_id"), "Pangkat/Golongan");
  const tmtPangkat = nullableText(formData.get("tmt_pangkat_terakhir"));
  const tmtJabatan = nullableText(formData.get("tmt_jabatan_terakhir"));
  const status = text(formData.get("status_kepegawaian"));
  const sisaLalu = nonNegativeInt(formData.get("sisa_cuti_tahun_lalu"), "Sisa cuti tahun lalu");
  const cutiKini = nonNegativeInt(formData.get("cuti_tahun_ini"), "Cuti tahun ini");

  if (!nama) throw new Error("Nama pegawai wajib diisi.");
  if (!/^\d{18}$/.test(nip)) throw new Error("NIP harus terdiri dari 18 digit angka.");
  if (!status) throw new Error("Status kepegawaian wajib dipilih.");

  const result = await sql.transaction([
    sql`SELECT id FROM data_pegawai WHERE regexp_replace(nip, '[^0-9]', '', 'g') = ${nip} AND id <> ${id} LIMIT 1`,
    sql`SELECT id, nama_jabatan FROM peta_jabatan WHERE id = ${jabatanId}`,
    sql`SELECT id, nama_bidang FROM bidang_unit_kerja WHERE id = ${bidangId}`,
    sql`SELECT id, status_kepegawaian, pangkat_golongan FROM pangkat_golongan WHERE id = ${pangkatId}`,
    sql`SELECT id FROM data_pegawai WHERE id = ${id}`,
  ]);

  if (result[0].length) throw new Error("NIP tersebut sudah digunakan pegawai lain.");
  if (!result[4].length) throw new Error("Pegawai tidak ditemukan.");
  const jabatan = result[1][0];
  const bidang = result[2][0];
  const pangkat = result[3][0];
  if (!jabatan || !bidang || !pangkat) throw new Error("Master data yang dipilih tidak ditemukan.");
  if (String(pangkat.status_kepegawaian).trim().toLowerCase() !== status.toLowerCase()) {
    throw new Error("Status kepegawaian tidak sesuai dengan pangkat/golongan yang dipilih.");
  }

  await sql`
    UPDATE data_pegawai SET
      nama = ${nama}, nip = ${nip}, tempat_lahir = ${tempatLahir}, tanggal_lahir = ${tanggalLahir},
      bidang = ${bidang.nama_bidang},
      pangkat_golongan = ${pangkat.pangkat_golongan}, tmt_pangkat_terakhir = ${tmtPangkat},
      jabatan = ${jabatan.nama_jabatan}, tmt_jabatan_terakhir = ${tmtJabatan}, status_kepegawaian = ${status},
      sisa_cuti_tahun_lalu = ${sisaLalu}, cuti_tahun_ini = ${cutiKini},
      jabatan_id = ${jabatanId}, pangkat_golongan_id = ${pangkatId}, bidang_unit_kerja_id = ${bidangId}
    WHERE id = ${id}
  `;

  revalidatePegawai(id);
  return { success: true, message: "Data pegawai berhasil diperbarui." };
}

export async function hapusPegawai(id: number) {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) return { success: false, message: "ID pegawai tidak valid." };

  try {
    const result = await sql.transaction([
      sql`SELECT id, nama FROM data_pegawai WHERE id = ${id} FOR UPDATE`,
      sql`DELETE FROM leave_records WHERE pegawai_id = ${id}`,
      sql`DELETE FROM data_pegawai WHERE id = ${id}`
    ]);
    if (!result[0].length) return { success: false, message: "Pegawai tidak ditemukan." };
    revalidatePegawai();
    return { success: true, message: "Data pegawai berhasil dihapus." };
  } catch (error: any) {
    console.error("Gagal menghapus pegawai:", error);
    return { success: false, message: error?.code === "23503" ? "Pegawai masih dipakai oleh data lain dan tidak dapat dihapus." : "Gagal menghapus data pegawai." };
  }
}

// ==========================================
// D. SIMPAN / EDIT CUTI TAHUNAN
// ==========================================

export async function simpanCutiTahunan(pegawaiId: number, bulanAngka: number, tahun: number, durasiBaru: number, keterangan = "") {
  if (!Number.isInteger(durasiBaru) || durasiBaru <= 0) {
    return {
      success: false,
      message: "Durasi harus lebih dari 0.",
    };
  }

  if (!Number.isInteger(bulanAngka) || bulanAngka < 1 || bulanAngka > 12) {
    return {
      success: false,
      message: "Bulan cuti tidak valid.",
    };
  }

  if (!Number.isInteger(tahun) || tahun < 2000) {
    return {
      success: false,
      message: "Tahun cuti tidak valid.",
    };
  }

  try {
    const result = await sql.transaction([
      sql`
        SELECT
          sisa_cuti_tahun_lalu,
          cuti_tahun_ini
        FROM data_pegawai
        WHERE id = ${pegawaiId}
        FOR UPDATE
      `,

      sql`
        SELECT
          COALESCE(SUM(durasi), 0) AS total_durasi
        FROM leave_records
        WHERE
          pegawai_id = ${pegawaiId}
          AND jenis_cuti = 'Tahunan'
          AND bulan_angka = ${bulanAngka}
          AND tahun = ${tahun}
      `,

      sql`
        SELECT
          COALESCE(SUM(durasi), 0) AS total_durasi
        FROM leave_records
        WHERE
          pegawai_id = ${pegawaiId}
          AND jenis_cuti = 'Tahunan'
          AND tahun = ${tahun}
          AND bulan_angka <> ${bulanAngka}
      `,
    ]);

    const pegawaiRows = result[0] as Array<{
      sisa_cuti_tahun_lalu: number;
      cuti_tahun_ini: number;
    }>;

    const existingRows = result[1] as Array<{
      total_durasi: number;
    }>;

    const otherRows = result[2] as Array<{
      total_durasi: number;
    }>;

    if (pegawaiRows.length === 0) {
      throw new Error("Pegawai tidak ditemukan.");
    }

    const quotaLalu = Number(pegawaiRows[0].sisa_cuti_tahun_lalu) || 0;

    const quotaKini = Number(pegawaiRows[0].cuti_tahun_ini) || 0;

    const durasiLama = Number(existingRows[0]?.total_durasi) || 0;

    const totalCutiLainnya = Number(otherRows[0]?.total_durasi) || 0;

    const totalKuota = quotaLalu + quotaKini;

    const totalPemakaianSetelahEdit = totalCutiLainnya + durasiBaru;

    if (totalPemakaianSetelahEdit > totalKuota) {
      const sisaKuota = totalKuota - totalCutiLainnya;

      throw new Error(`Kuota tidak cukup. Sisa kuota yang tersedia untuk perubahan ini adalah ${sisaKuota} hari.`);
    }

    await sql`
      DELETE FROM leave_records
      WHERE
        pegawai_id = ${pegawaiId}
        AND jenis_cuti = 'Tahunan'
        AND bulan_angka = ${bulanAngka}
        AND tahun = ${tahun}
    `;

    const keteranganFinal = keterangan.trim() || "Pengambilan cuti tahunan.";

    await sql`
      INSERT INTO leave_records (
        pegawai_id,
        jenis_cuti,
        bulan_angka,
        tahun,
        durasi,
        keterangan
      )
      VALUES (
        ${pegawaiId},
        'Tahunan',
        ${bulanAngka},
        ${tahun},
        ${durasiBaru},
        ${keteranganFinal}
      )
    `;

    revalidatePath("/admin");
    revalidatePath("/admin/data-pegawai");
    revalidatePath("/admin/manajemen-cuti");
    revalidatePath(`/admin/data-pegawai/${pegawaiId}`);

    return {
      success: true,
      message: durasiLama > 0 ? "Data cuti berhasil diperbarui." : "Cuti Tahunan berhasil dicatat.",
    };
  } catch (error: unknown) {
    console.error("Gagal memproses cuti tahunan:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menyimpan cuti tahunan.",
    };
  }
}

// ==========================================
// E. SIMPAN / EDIT CUTI LAINNYA
// ==========================================

export async function simpanCutiLainnya(formData: FormData) {
  try {
    const pegawaiId = parseNumber(formData.get("pegawaiId"));

    const jenis = String(formData.get("jenis") ?? "").trim();

    const bulan = parseNumber(formData.get("bulan"));

    const durasi = parseNumber(formData.get("durasi"));

    const keterangan = String(formData.get("keterangan") ?? "").trim();

    const tahun = parseNumber(formData.get("tahun"), new Date().getFullYear());

    if (!pegawaiId) {
      throw new Error("Pegawai tidak valid.");
    }

    if (!jenis) {
      throw new Error("Jenis cuti wajib dipilih.");
    }

    if (bulan < 1 || bulan > 12) {
      throw new Error("Bulan cuti wajib dipilih.");
    }

    if (durasi <= 0) {
      throw new Error("Durasi harus lebih dari 0.");
    }

    if (!keterangan) {
      throw new Error("Keterangan wajib diisi.");
    }

    await sql.transaction([
      sql`
        DELETE FROM leave_records
        WHERE
          pegawai_id = ${pegawaiId}
          AND jenis_cuti = ${jenis}
          AND bulan_angka = ${bulan}
          AND tahun = ${tahun}
      `,

      sql`
        INSERT INTO leave_records (
          pegawai_id,
          jenis_cuti,
          bulan_angka,
          tahun,
          durasi,
          keterangan
        )
        VALUES (
          ${pegawaiId},
          ${jenis},
          ${bulan},
          ${tahun},
          ${durasi},
          ${keterangan}
        )
      `,
    ]);

    revalidatePath("/admin");
    revalidatePath("/admin/data-pegawai");
    revalidatePath("/admin/manajemen-cuti");
    revalidatePath(`/admin/data-pegawai/${pegawaiId}`);

    return {
      success: true,
      message: "Data cuti berhasil disimpan/diperbarui.",
    };
  } catch (error: unknown) {
    console.error("Gagal menyimpan cuti lainnya:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menyimpan data cuti.",
    };
  }
}

// ==========================================
// F. HAPUS SATU DATA CUTI
// ==========================================

export async function hapusCuti(pegawaiId: number, bulan: number, tahun: number, jenis: string) {
  try {
    if (!pegawaiId || !bulan || !tahun || !jenis) {
      throw new Error("Data penghapusan tidak lengkap.");
    }

    const pegawaiRows = await sql`
      SELECT id
      FROM data_pegawai
      WHERE id = ${pegawaiId}
    `;

    if (pegawaiRows.length === 0) {
      throw new Error("Pegawai tidak ditemukan.");
    }

    await sql`
      DELETE FROM leave_records
      WHERE
        pegawai_id = ${pegawaiId}
        AND bulan_angka = ${bulan}
        AND tahun = ${tahun}
        AND jenis_cuti = ${jenis}
    `;

    revalidatePath("/admin");
    revalidatePath("/admin/data-pegawai");
    revalidatePath("/admin/manajemen-cuti");
    revalidatePath(`/admin/data-pegawai/${pegawaiId}`);

    return {
      success: true,
      message: "Data cuti berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus cuti:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menghapus data cuti.",
    };
  }
}

// ==========================================
// G. BERSIHKAN SEMUA DATA CUTI PEGAWAI
// ==========================================

export async function bersihkanSemuaCutiPegawai(pegawaiId: number, tahun: number) {
  try {
    const pegawaiRows = await sql`
      SELECT id
      FROM data_pegawai
      WHERE id = ${pegawaiId}
    `;

    if (pegawaiRows.length === 0) {
      throw new Error("Pegawai tidak ditemukan.");
    }

    await sql`
      DELETE FROM leave_records
      WHERE
        pegawai_id = ${pegawaiId}
        AND tahun = ${tahun}
    `;

    revalidatePath("/admin");
    revalidatePath("/admin/data-pegawai");
    revalidatePath("/admin/manajemen-cuti");
    revalidatePath(`/admin/data-pegawai/${pegawaiId}`);

    return {
      success: true,
      message: "Seluruh data cuti berhasil dibersihkan.",
    };
  } catch (error: unknown) {
    console.error("Gagal membersihkan seluruh cuti:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal membersihkan data cuti.",
    };
  }
}

// ==========================================
// H. RESET KUOTA
// ==========================================

export async function resetCutiPegawai(id: number, cutiTahunIni: number, sisaLalu: number) {
  try {
    if (!Number.isInteger(cutiTahunIni) || !Number.isInteger(sisaLalu)) {
      throw new Error("Kuota harus berupa bilangan bulat.");
    }

    if (cutiTahunIni < 0 || sisaLalu < 0) {
      throw new Error("Kuota tidak boleh bernilai negatif.");
    }

    await sql`
      UPDATE data_pegawai
      SET
        cuti_tahun_ini = ${cutiTahunIni},
        sisa_cuti_tahun_lalu = ${sisaLalu}
      WHERE id = ${id}
    `;

    revalidatePath("/admin");
    revalidatePath("/admin/data-pegawai");
    revalidatePath("/admin/manajemen-cuti");
    revalidatePath(`/admin/data-pegawai/${id}`);

    return {
      success: true,
      message: "Kuota berhasil direset.",
    };
  } catch (error: unknown) {
    console.error("Gagal mereset kuota cuti:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mereset kuota.",
    };
  }
}

// ==========================================
// I. UPDATE / EDIT KUOTA CUTI
// ==========================================
//
// Berbeda dengan RESET.
//
// Fungsi ini digunakan ketika admin mengklik:
// - SISA TAHUN LALU
// - THN 2026
//
// Hanya mengubah kuota dasar.
//
// leave_records TIDAK DIUBAH.
//

export async function updateKuotaCutiPegawai(id: number, cutiTahunIni: number, sisaLalu: number) {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("ID pegawai tidak valid.");
    }

    if (!Number.isInteger(cutiTahunIni) || !Number.isInteger(sisaLalu)) {
      throw new Error("Kuota harus berupa bilangan bulat.");
    }

    if (cutiTahunIni < 0 || sisaLalu < 0) {
      throw new Error("Kuota tidak boleh bernilai negatif.");
    }

    const result = await sql.transaction([
      sql`
        SELECT
          id,
          nama
        FROM data_pegawai
        WHERE id = ${id}
        FOR UPDATE
      `,

      sql`
        SELECT
          COALESCE(SUM(durasi), 0) AS total_cuti_tahunan
        FROM leave_records
        WHERE
          pegawai_id = ${id}
          AND tahun = 2026
          AND jenis_cuti = 'Tahunan'
      `,
    ]);

    const pegawaiRows = result[0] as Array<{
      id: number;
      nama: string;
    }>;

    const cutiRows = result[1] as Array<{
      total_cuti_tahunan: number;
    }>;

    if (pegawaiRows.length === 0) {
      throw new Error("Pegawai tidak ditemukan.");
    }

    const totalCutiTahunan = Number(cutiRows[0]?.total_cuti_tahunan) || 0;

    const totalKuotaBaru = sisaLalu + cutiTahunIni;

    if (totalKuotaBaru < totalCutiTahunan) {
      throw new Error(`Kuota baru tidak boleh lebih kecil dari total cuti tahunan yang sudah digunakan (${totalCutiTahunan} hari).`);
    }

    await sql`
      UPDATE data_pegawai
      SET
        sisa_cuti_tahun_lalu = ${sisaLalu},
        cuti_tahun_ini = ${cutiTahunIni}
      WHERE id = ${id}
    `;

    revalidatePath("/admin");
    revalidatePath("/admin/data-pegawai");
    revalidatePath("/admin/manajemen-cuti");
    revalidatePath(`/admin/data-pegawai/${id}`);

    return {
      success: true,
      message: "Kuota cuti berhasil diperbarui.",
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui kuota cuti:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal memperbarui kuota cuti.",
    };
  }
}
