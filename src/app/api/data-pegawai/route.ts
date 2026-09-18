import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const rows = await sql`
      SELECT
        id,
        nama,
        nip,
        bidang,
        pangkat_golongan,
        tmt_pangkat_terakhir,
        jabatan,
        tmt_jabatan_terakhir,
        status_kepegawaian,
        created_at,
        tempat_lahir,
        tanggal_lahir,
        sisa_cuti_tahun_lalu,
        cuti_tahun_ini
      FROM data_pegawai
      ORDER BY created_at DESC
    `;

    const leaveRows = await sql`
      SELECT
        id,
        pegawai_id,
        jenis_cuti,
        bulan_angka,
        tahun,
        durasi,
        keterangan,
        created_at
      FROM leave_records
      ORDER BY tahun DESC, bulan_angka DESC
    `;

    const leaveMap = new Map<number, typeof leaveRows>();

    for (const cuti of leaveRows) {
      const pegawaiId = Number(cuti.pegawai_id);

      const existing = leaveMap.get(pegawaiId);

      if (existing) {
        existing.push(cuti);
      } else {
        leaveMap.set(pegawaiId, [cuti]);
      }
    }

    const data = rows.map((pegawai) => ({
      id: Number(pegawai.id),
      nama: String(pegawai.nama),
      nip: String(pegawai.nip),
      bidang: String(pegawai.bidang),
      pangkat_golongan: String(pegawai.pangkat_golongan),

      tmt_pangkat_terakhir:
        pegawai.tmt_pangkat_terakhir === null
          ? null
          : String(pegawai.tmt_pangkat_terakhir),

      jabatan: String(pegawai.jabatan),

      tmt_jabatan_terakhir:
        pegawai.tmt_jabatan_terakhir === null
          ? null
          : String(pegawai.tmt_jabatan_terakhir),

      status_kepegawaian: String(
        pegawai.status_kepegawaian
      ),

      created_at:
        pegawai.created_at === null
          ? null
          : String(pegawai.created_at),

      tempat_lahir:
        pegawai.tempat_lahir === null
          ? null
          : String(pegawai.tempat_lahir),

      tanggal_lahir:
        pegawai.tanggal_lahir === null
          ? null
          : String(pegawai.tanggal_lahir),

      sisa_cuti_tahun_lalu: Number(
        pegawai.sisa_cuti_tahun_lalu
      ),

      cuti_tahun_ini: Number(
        pegawai.cuti_tahun_ini
      ),

      riwayat_cuti:
        leaveMap.get(Number(pegawai.id)) ?? [],
    }));

    return NextResponse.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("API data pegawai error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data pegawai",
      },
      {
        status: 500,
      }
    );
  }
}