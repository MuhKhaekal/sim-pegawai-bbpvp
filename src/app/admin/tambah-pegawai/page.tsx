import { neon } from "@neondatabase/serverless";
import FormPegawai from "./FormPegawai";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TambahPegawaiPage() {
  const sql = neon(process.env.DATABASE_URL!);
  const [jabatanRows, bidangRows, pangkatRows] = await Promise.all([
    sql`SELECT id, nama_jabatan AS nama FROM peta_jabatan ORDER BY LOWER(nama_jabatan)`,
    sql`SELECT id, nama_bidang AS nama FROM bidang_unit_kerja ORDER BY LOWER(nama_bidang)`,
    sql`SELECT id, status_kepegawaian, pangkat_golongan FROM pangkat_golongan ORDER BY status_kepegawaian, pangkat_golongan`,
  ]);
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black tracking-widest rounded-full mb-3 uppercase shadow-sm">Registrasi</div>
        <h1 className="text-4xl font-black text-[#15406A] tracking-tight">Tambah Pegawai Baru</h1>
      </div>
      <FormPegawai
        jabatanList={jabatanRows.map(r => ({ id: Number(r.id), nama: String(r.nama) }))}
        bidangUnitList={bidangRows.map(r => ({ id: Number(r.id), nama: String(r.nama) }))}
        pangkatList={pangkatRows.map(r => ({ id: Number(r.id), status_kepegawaian: String(r.status_kepegawaian), pangkat_golongan: String(r.pangkat_golongan) }))}
      />
    </div>
  );
}
