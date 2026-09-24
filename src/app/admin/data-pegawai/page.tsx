import { neon } from "@neondatabase/serverless";
import TabelPegawaiClient, { Pegawai } from "./TabelPegawaiClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DataPegawaiAdminPage() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT
      p.id, p.nama, p.nip, p.tempat_lahir, p.tanggal_lahir,
      COALESCE(j.nama_jabatan, p.jabatan, '-') AS jabatan,
      COALESCE(pg.pangkat_golongan, p.pangkat_golongan, '-') AS pangkat_golongan,
      COALESCE(b.nama_bidang, p.bidang, '-') AS bidang,
      p.tmt_pangkat_terakhir, p.tmt_jabatan_terakhir, p.status_kepegawaian,
      p.created_at, p.sisa_cuti_tahun_lalu, p.cuti_tahun_ini
    FROM data_pegawai p
    LEFT JOIN peta_jabatan j ON j.id = p.jabatan_id
    LEFT JOIN pangkat_golongan pg ON pg.id = p.pangkat_golongan_id
    LEFT JOIN bidang_unit_kerja b ON b.id = p.bidang_unit_kerja_id
    ORDER BY p.nama ASC
  `;

  const data: Pegawai[] = rows.map((r) => ({
    id: Number(r.id), nama: String(r.nama ?? ""), nip: String(r.nip ?? ""),
    tempat_lahir: r.tempat_lahir == null ? null : String(r.tempat_lahir),
    tanggal_lahir: r.tanggal_lahir == null ? null : String(r.tanggal_lahir),
    pangkat_golongan: String(r.pangkat_golongan ?? "-"),
    tmt_pangkat_terakhir: r.tmt_pangkat_terakhir == null ? null : String(r.tmt_pangkat_terakhir),
    jabatan: String(r.jabatan ?? "-"),
    tmt_jabatan_terakhir: r.tmt_jabatan_terakhir == null ? null : String(r.tmt_jabatan_terakhir),
    bidang: String(r.bidang ?? "-"), status_kepegawaian: String(r.status_kepegawaian ?? "-"),
    sisa_cuti_tahun_lalu: Number(r.sisa_cuti_tahun_lalu ?? 0), cuti_tahun_ini: Number(r.cuti_tahun_ini ?? 0),
  }));

  return <TabelPegawaiClient data={data} />;
}
