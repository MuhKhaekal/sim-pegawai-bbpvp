import { neon } from "@neondatabase/serverless";
import Link from "next/link";
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

  return ( <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="animate-fade-up flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5 mb-4">
        {/* ===================================================
            TITLE
        =================================================== */}

        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-100/50 text-amber-500 px-3 py-1 rounded-full mb-2 lg:mb-3 text-[10px] lg:text-xs font-black tracking-widest uppercase border border-amber-200">
            <span>Database</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-[#15406A] tracking-tight">Data Pegawai</h1>

          <p className="text-gray-500 mt-1 lg:mt-2 font-medium text-sm lg:text-base">Platform Analisis Cerdas SDM BBPVP Makassar.</p>
        </div>

        {/* ===================================================
            ACTION BUTTONS
        =================================================== */}

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* =================================================
              DOWNLOAD EXCEL
          ================================================= */}

          <Link
            href={"/admin/data-pegawai/api/export"}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 lg:px-6 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm lg:text-base w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
            </svg>

            <span>Download Excel</span>
          </Link>

          {/* =================================================
              INPUT DATA BARU
          ================================================= */}

          <Link
            href="/admin/tambah-pegawai"
            className="inline-flex items-center justify-center gap-2 bg-[#15406A] hover:bg-blue-900 text-white px-5 py-3 lg:px-6 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm lg:text-base w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>

            <span>Input Data Baru</span>
          </Link>
        </div>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <TabelPegawaiClient data={data} />
    </div>
  );
}