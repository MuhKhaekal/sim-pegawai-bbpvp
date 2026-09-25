import { neon } from "@neondatabase/serverless";
import PangkatGolonganClient from "./PangkatGolonganClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PangkatGolonganPage() {
  const sql = neon(process.env.DATABASE_URL!);

  const rows = await sql`
    SELECT
      id,
      status_kepegawaian,
      pangkat_golongan
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
  }));

  return <PangkatGolonganClient initialData={data} />;
}