import { neon } from "@neondatabase/serverless";
import PangkatGolonganClient from "./PangkatGolonganClient";

export const revalidate = 0;

export default async function PangkatGolonganPage() {
  const sql = neon(process.env.DATABASE_URL!);

  const rows = await sql`
    SELECT
      id,
      status_kepegawaian,
      pangkat_golongan,
      masa_kerja,
      created_at,
      updated_at
    FROM pangkat_golongan
    ORDER BY
      CASE
        WHEN LOWER(status_kepegawaian) = 'pns' THEN 1
        WHEN LOWER(status_kepegawaian) = 'pppk' THEN 2
        WHEN LOWER(status_kepegawaian) = 'non-asn' THEN 3
        ELSE 4
      END,
      pangkat_golongan ASC
  `;

  const data = rows.map((row) => ({
    id: Number(row.id),
    status_kepegawaian: String(row.status_kepegawaian ?? ""),
    pangkat_golongan: String(row.pangkat_golongan ?? ""),
    masa_kerja: Number(row.masa_kerja ?? 0),
    created_at: row.created_at
      ? String(row.created_at)
      : null,
    updated_at: row.updated_at
      ? String(row.updated_at)
      : null,
  }));

  return <PangkatGolonganClient initialData={data} />;
}