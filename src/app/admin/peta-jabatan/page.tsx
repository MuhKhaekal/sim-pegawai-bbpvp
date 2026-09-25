import { neon } from "@neondatabase/serverless";
import PetaJabatanClient from "./PetaJabatanClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PetaJabatanPage() {
  const sql = neon(process.env.DATABASE_URL!);

  const rows = await sql`
    SELECT
      id,
      nama_jabatan,
      kebutuhan_ideal,
      kelas_jabatan,
      bup, 
      created_at,
      updated_at
    FROM peta_jabatan
    ORDER BY nama_jabatan ASC
  `;

  const data = rows.map((row) => ({
    id: Number(row.id),
    nama_jabatan: String(row.nama_jabatan ?? ""),
    kebutuhan_ideal: Number(row.kebutuhan_ideal ?? 0),
    kelas_jabatan: row.kelas_jabatan === null ? null : Number(row.kelas_jabatan),
    bup: Number(row.bup ?? 58), // Pastikan mapping kolom bup
  }));

  return <PetaJabatanClient initialData={data} />;
}