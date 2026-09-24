"use client";
import { useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { tambahPegawai } from "../data-pegawai/actions";

const SelectArrow = () => (
  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
  </div>
);

// Fungsi pembantu untuk mengubah objek Date menjadi format YYYY-MM-DD untuk database
const formatForDB = (date: Date | null) => {
  if (!date) return "";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

type MasterOption = { id: number; nama: string };
type PangkatOption = { id: number; status_kepegawaian: string; pangkat_golongan: string };

export default function FormPegawai({
  jabatanList,
  bidangUnitList,
  pangkatList,
}: {
  jabatanList: MasterOption[];
  bidangUnitList: MasterOption[];
  pangkatList: PangkatOption[];
}) {
  const [nip, setNip] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Kalkulasi Tahun Otomatis untuk Cuti
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  // State khusus untuk menampung data tanggal dari kalender kustom
  const [tglLahir, setTglLahir] = useState<Date | null>(null);
  const [tmtPangkat, setTmtPangkat] = useState<Date | null>(null);
  const [tmtJabatan, setTmtJabatan] = useState<Date | null>(null);

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
      const result = await tambahPegawai(formData);
      if (!result?.success) throw new Error(result?.message || "Gagal menyimpan data.");

      formRef.current?.reset();
    setNip("");
    setTglLahir(null);
    setTmtPangkat(null);
    setTmtJabatan(null);

      setIsSubmitting(false);
      setShowModal(true);
    } catch (error) {
      setIsSubmitting(false);
      window.alert(error instanceof Error ? error.message : "Gagal menyimpan data pegawai.");
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
            <h3 className="text-2xl font-black text-gray-800 mb-2">Berhasil!</h3>
            <p className="text-gray-500 font-medium mb-8">Data pegawai baru telah tersimpan di dalam database.</p>
            <div className="space-y-3">
              <button onClick={() => setShowModal(false)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors">
                Tutup & Tambah Lagi
              </button>
              
            </div>
          </div>
        </div>
      )}

      {/* Tambahkan sedikit CSS kustom agar kalender library menyatu dengan Tailwind */}
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__input-container input { width: 100%; }
        .react-datepicker-popper { z-index: 40 !important; }
      `}</style>

      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-gray-100">
        <form ref={formRef} action={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            {/* ----------------- KOLOM KIRI ----------------- */}
            <div className="space-y-6">
              <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                <label className={labelClass}>Nama Lengkap & Gelar</label>
                <input type="text" name="nama" required className={inputClass} placeholder="Budi Santoso, S.Kom." />
              </div>

              <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                <label className={labelClass}>NIP</label>
                <input type="text" name="nip" value={nip} onChange={handleNipChange} maxLength={21} placeholder="19691203 260184 1 001" required className={`${inputClass} font-mono tracking-wider`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                  <label className={labelClass}>Tempat Lahir</label>
                  <input type="text" name="tempat_lahir" required className={inputClass} placeholder="Makassar" />
                </div>

                {/* TANGGAL LAHIR */}
                <div className="relative z-20 transform transition-all duration-300 focus-within:-translate-y-1">
                  <label className={labelClass}>Tanggal Lahir</label>
                  <DatePicker
                    selected={tglLahir}
                    onChange={(date: Date | null) => setTglLahir(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    className={inputClass}
                    required
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                  <input type="hidden" name="tanggal_lahir" value={formatForDB(tglLahir)} />
                </div>
              </div>

              <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                <label className={labelClass}>Pangkat / Golongan</label>
                <div className={selectWrapperClass}>
                  <select name="pangkat_golongan_id" className={selectClass} required>
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

              {/* TMT PANGKAT TERAKHIR (Opsional) */}
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
                  <select name="jabatan_id" className={selectClass} required>
                    <option value="">Pilih Jabatan</option>
                    {jabatanList.map((item) => (
                      <option key={item.id} value={item.id}>{item.nama}</option>
                    ))}
                  </select>
                  <SelectArrow />
                </div>
              </div>

              {/* TMT JABATAN TERAKHIR (Opsional) */}
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
                  <select name="bidang_unit_kerja_id" className={selectClass} required>
                    <option value="">Pilih Bidang / Unit Kerja</option>
                    {bidangUnitList.map((item) => (
                      <option key={item.id} value={item.id}>{item.nama}</option>
                    ))}
                  </select>
                  <SelectArrow />
                </div>
              </div>

              <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                <label className={labelClass}>Status Kepegawaian</label>
                <div className={selectWrapperClass}>
                  <select name="status_kepegawaian" className={selectClass} required>
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Non ASN">Non ASN</option>
                  </select>
                  <SelectArrow />
                </div>
              </div>

              {/* BARU: INPUT SISA CUTI & CUTI TAHUN INI */}
              <div className="grid grid-cols-2 gap-4">
                <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                  <label className={labelClass}>Sisa Cuti Thn {lastYear}</label>
                  <input type="number" name="sisa_cuti_tahun_lalu" min="0" placeholder="Contoh: 3" className={inputClass} />
                </div>

                <div className="transform transition-all duration-300 focus-within:-translate-y-1">
                  <label className={labelClass}>Cuti Thn {currentYear}</label>
                  <input type="number" name="cuti_tahun_ini" min="0" placeholder="Contoh: 12" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-8 border-t border-gray-100 mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`relative overflow-hidden bg-gradient-to-r from-[#15406A] to-[#215d9c] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-[0_8px_20px_rgba(21,64,106,0.3)] hover:shadow-[0_15px_25px_rgba(21,64,106,0.4)] hover:-translate-y-1 transition-all duration-300 group ${isSubmitting ? "opacity-80 cursor-not-allowed" : ""}`}
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-500"></div>
              <span className="relative flex items-center space-x-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                    </svg>
                    <span>Simpan Data Pegawai</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
