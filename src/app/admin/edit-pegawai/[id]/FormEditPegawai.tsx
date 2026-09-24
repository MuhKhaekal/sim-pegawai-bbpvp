"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { updatePegawai } from "../../data-pegawai/actions";

// Tipe data Pegawai (Diperbarui dengan sisa_cuti_tahun_lalu & cuti_tahun_ini)
export type Pegawai = {
  id: number;
  nama: string;
  nip: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;

  pangkat_golongan: string;
  pangkat_golongan_id: number | null;

  tmt_pangkat_terakhir: string | null;

  jabatan: string;
  jabatan_id: number | null;

  tmt_jabatan_terakhir: string | null;

  bidang: string;
  bidang_unit_kerja_id: number | null;

  status_kepegawaian: string;

  sisa_cuti_tahun_lalu: number;
  cuti_tahun_ini: number;
};

type MasterOption = {
  id: number;
  nama: string;
};

type PangkatOption = {
  id: number;
  status_kepegawaian: string;
  pangkat_golongan: string;
};

interface FormEditPegawaiProps {
  pegawai: Pegawai;
  jabatanList: MasterOption[];
  bidangUnitList: MasterOption[];
  pangkatList: PangkatOption[];
}

const SelectArrow = () => (
  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
  </div>
);

const formatForDB = (date: Date | null) => {
  if (!date) return "";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

const formatNipAwal = (nipAsli: string) => {
  if (!nipAsli) return "";
  const val = nipAsli.replace(/\D/g, "");
  let res = "";
  if (val.length > 0) res += val.substring(0, 8);
  if (val.length > 8) res += " " + val.substring(8, 14);
  if (val.length > 14) res += " " + val.substring(14, 15);
  if (val.length > 15) res += " " + val.substring(15, 18);
  return res;
};

export default function FormEditPegawai({ pegawai, jabatanList, bidangUnitList, pangkatList }: FormEditPegawaiProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Kalkulasi Tahun Otomatis untuk Cuti
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const [nip, setNip] = useState(formatNipAwal(pegawai.nip));

  const [tglLahir, setTglLahir] = useState<Date | null>(pegawai.tanggal_lahir ? new Date(pegawai.tanggal_lahir) : null);
  const [tmtPangkat, setTmtPangkat] = useState<Date | null>(pegawai.tmt_pangkat_terakhir ? new Date(pegawai.tmt_pangkat_terakhir) : null);
  const [tmtJabatan, setTmtJabatan] = useState<Date | null>(pegawai.tmt_jabatan_terakhir ? new Date(pegawai.tmt_jabatan_terakhir) : null);

  const handleNipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    let res = "";
    if (val.length > 0) res += val.substring(0, 8);
    if (val.length > 8) res += " " + val.substring(8, 14);
    if (val.length > 14) res += " " + val.substring(14, 15);
    if (val.length > 15) res += " " + val.substring(15, 18);
    setNip(res);
  };

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await updatePegawai(pegawai.id, formData);
      if (!result?.success) throw new Error(result?.message || "Gagal memperbarui data.");
      setShowModal(true);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Gagal memperbarui data pegawai.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border-gray-200 text-gray-800 rounded-xl border-2 p-3.5 focus:bg-white focus:border-[#15406A] focus:ring-4 focus:ring-[#15406A]/10 transition-all duration-300 outline-none font-medium";
  const selectWrapperClass = "relative w-full";
  const selectClass = `${inputClass} appearance-none cursor-pointer pr-10`;
  const labelClass = "block text-sm font-bold text-[#15406A] mb-1.5 ml-1";

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative z-[70]">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Sukses!</h3>
            <p className="text-gray-500 font-medium mb-8">Data pegawai berhasil diperbarui.</p>
            <button onClick={() => router.push("/admin/data-pegawai")} className="w-full bg-[#15406A] hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/30">
              Kembali ke Tabel Data
            </button>
          </div>
        </div>
      )}

      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__input-container input { width: 100%; }
        .react-datepicker-popper { z-index: 40 !important; }
      `}</style>

      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-gray-100">
        <form action={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            {/* ----------------- KOLOM KIRI ----------------- */}
            <div className="space-y-6">
              <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                <label className={labelClass}>Nama Lengkap & Gelar</label>
                <input type="text" name="nama" defaultValue={pegawai.nama} required className={inputClass} />
              </div>

              <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                <label className={labelClass}>NIP</label>
                <input type="text" name="nip" value={nip} onChange={handleNipChange} maxLength={21} required className={`${inputClass} font-mono tracking-wider`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                  <label className={labelClass}>Tempat Lahir</label>
                  <input type="text" name="tempat_lahir" defaultValue={pegawai.tempat_lahir || ""} required className={inputClass} />
                </div>

                <div className="relative z-20 transform transition-all duration-300 focus-within:-translate-y-1">
                  <label className={labelClass}>Tanggal Lahir</label>
                  <DatePicker selected={tglLahir} onChange={(date: Date | null) => setTglLahir(date)} dateFormat="dd/MM/yyyy" className={inputClass} required showMonthDropdown showYearDropdown dropdownMode="select" />
                  <input type="hidden" name="tanggal_lahir" value={formatForDB(tglLahir)} />
                </div>
              </div>

              <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                <label className={labelClass}>Pangkat / Golongan</label>

                <div className={selectWrapperClass}>
                  <select name="pangkat_golongan_id" defaultValue={pegawai.pangkat_golongan_id?.toString() ?? ""} className={selectClass} required>
                    <option value="">Pilih Pangkat / Golongan</option>

                    {pangkatList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.status_kepegawaian} — {item.pangkat_golongan}
                      </option>
                    ))}
                  </select>

                  <SelectArrow />
                </div>
              </div>

              <div className="relative z-10 transform transition-all duration-300 focus-within:-translate-y-1">
                <label className={labelClass}>
                  TMT Pangkat Terakhir <span className="text-gray-400 font-normal text-[11px] ml-1">(Opsional)</span>
                </label>
                <DatePicker
                  selected={tmtPangkat}
                  onChange={(date: Date | null) => setTmtPangkat(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Boleh dikosongkan..."
                  className={inputClass}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  isClearable
                />
                <input type="hidden" name="tmt_pangkat_terakhir" value={formatForDB(tmtPangkat)} />
              </div>
            </div>

            {/* ----------------- KOLOM KANAN ----------------- */}
            <div className="space-y-6">
              <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                <label className={labelClass}>Jabatan</label>

                <div className={selectWrapperClass}>
                  <select name="jabatan_id" defaultValue={pegawai.jabatan_id?.toString() ?? ""} className={selectClass} required>
                    <option value="">Pilih Jabatan</option>

                    {jabatanList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama}
                      </option>
                    ))}
                  </select>

                  <SelectArrow />
                </div>
              </div>

              <div className="relative z-0 transform transition-all duration-300 focus-within:-translate-y-1">
                <label className={labelClass}>
                  TMT Jabatan Terakhir <span className="text-gray-400 font-normal text-[11px] ml-1">(Opsional)</span>
                </label>
                <DatePicker
                  selected={tmtJabatan}
                  onChange={(date: Date | null) => setTmtJabatan(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Boleh dikosongkan..."
                  className={inputClass}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  isClearable
                />
                <input type="hidden" name="tmt_jabatan_terakhir" value={formatForDB(tmtJabatan)} />
              </div>

              <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                <label className={labelClass}>Bidang / Unit Kerja</label>

                <div className={selectWrapperClass}>
                  <select name="bidang_unit_kerja_id" defaultValue={pegawai.bidang_unit_kerja_id?.toString() ?? ""} className={selectClass} required>
                    <option value="">Pilih Bidang / Unit Kerja</option>

                    {bidangUnitList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama}
                      </option>
                    ))}
                  </select>

                  <SelectArrow />
                </div>
              </div>    

              <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                <label className={labelClass}>Status Kepegawaian</label>
                <div className={selectWrapperClass}>
                  <select name="status_kepegawaian" defaultValue={pegawai.status_kepegawaian} className={selectClass} required>
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Non ASN">Non ASN</option>
                  </select>
                  <SelectArrow />
                </div>
              </div>

              {/* INPUT SISA CUTI & CUTI TAHUN INI */}
              <div className="grid grid-cols-2 gap-4">
                <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                  <label className={labelClass}>Sisa Cuti Thn {lastYear}</label>
                  <input type="number" name="sisa_cuti_tahun_lalu" defaultValue={pegawai.sisa_cuti_tahun_lalu} min="0" placeholder="Contoh: 3" className={inputClass} />
                </div>

                <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                  <label className={labelClass}>Cuti Thn {currentYear}</label>
                  <input type="number" name="cuti_tahun_ini" defaultValue={pegawai.cuti_tahun_ini} min="0" placeholder="Contoh: 12" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-8">
            <button type="button" onClick={() => router.push("/admin/data-pegawai")} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="px-10 py-4 bg-gradient-to-r from-[#15406A] to-[#215d9c] text-white font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-transform disabled:opacity-70">
              {isSubmitting ? "Memperbarui..." : "Perbarui Data Pegawai"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
