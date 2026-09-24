import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";
import FormEditPegawai from "./FormEditPegawai";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditPegawaiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const sql = neon(process.env.DATABASE_URL!);
  const [pegawaiRows, jabatanRows, bidangRows, pangkatRows] = await Promise.all([
    sql`SELECT id, nama, nip, tempat_lahir, tanggal_lahir, pangkat_golongan, pangkat_golongan_id, tmt_pangkat_terakhir, jabatan, jabatan_id, tmt_jabatan_terakhir, bidang, bidang_unit_kerja_id, status_kepegawaian, sisa_cuti_tahun_lalu, cuti_tahun_ini FROM data_pegawai WHERE id = ${id} LIMIT 1`,
    sql`SELECT id, nama_jabatan AS nama FROM peta_jabatan ORDER BY LOWER(nama_jabatan)`,
    sql`SELECT id, nama_bidang AS nama FROM bidang_unit_kerja ORDER BY LOWER(nama_bidang)`,
    sql`SELECT id, status_kepegawaian, pangkat_golongan FROM pangkat_golongan ORDER BY status_kepegawaian, pangkat_golongan`,
  ]);
  if (!pegawaiRows.length) notFound();
  const p = pegawaiRows[0];
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-blue-100 text-[#15406A] text-xs font-black tracking-widest rounded-full mb-3 uppercase">Manajemen Data</div>
        <h1 className="text-4xl font-black text-[#15406A] tracking-tight">Edit Data Pegawai</h1>
      </div>
      <FormEditPegawai
        pegawai={{
          id: Number(p.id), nama: String(p.nama ?? ""), nip: String(p.nip ?? ""),
          tempat_lahir: p.tempat_lahir == null ? null : String(p.tempat_lahir), tanggal_lahir: p.tanggal_lahir == null ? null : String(p.tanggal_lahir),
          pangkat_golongan: String(p.pangkat_golongan ?? ""), pangkat_golongan_id: p.pangkat_golongan_id == null ? null : Number(p.pangkat_golongan_id),
          tmt_pangkat_terakhir: p.tmt_pangkat_terakhir == null ? null : String(p.tmt_pangkat_terakhir), jabatan: String(p.jabatan ?? ""),
          jabatan_id: p.jabatan_id == null ? null : Number(p.jabatan_id), tmt_jabatan_terakhir: p.tmt_jabatan_terakhir == null ? null : String(p.tmt_jabatan_terakhir),
          bidang: String(p.bidang ?? ""), bidang_unit_kerja_id: p.bidang_unit_kerja_id == null ? null : Number(p.bidang_unit_kerja_id),
          status_kepegawaian: String(p.status_kepegawaian ?? ""), sisa_cuti_tahun_lalu: Number(p.sisa_cuti_tahun_lalu ?? 0), cuti_tahun_ini: Number(p.cuti_tahun_ini ?? 0),
        }}
        jabatanList={jabatanRows.map(r => ({ id: Number(r.id), nama: String(r.nama) }))}
        bidangUnitList={bidangRows.map(r => ({ id: Number(r.id), nama: String(r.nama) }))}
        pangkatList={pangkatRows.map(r => ({ id: Number(r.id), status_kepegawaian: String(r.status_kepegawaian), pangkat_golongan: String(r.pangkat_golongan) }))}
      />
    </div>
  );
}
