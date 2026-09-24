import { neon } from "@neondatabase/serverless";
import BidangUnitKerjaClient from "./BidangUnitKerjaClient";

export const revalidate = 0;

export default async function BidangUnitKerjaPage() {
  const sql = neon(process.env.DATABASE_URL!);

  const rows = await sql`
    SELECT
      id,
      nama_bidang,
      created_at,
      updated_at
    FROM bidang_unit_kerja
    ORDER BY LOWER(nama_bidang) ASC
  `;

  const data = rows.map((row) => ({
    id: Number(row.id),
    nama_bidang: String(row.nama_bidang ?? ""),
    created_at: row.created_at
      ? String(row.created_at)
      : null,
    updated_at: row.updated_at
      ? String(row.updated_at)
      : null,
  }));

  return (
    <BidangUnitKerjaClient initialData={data} />
  );
}