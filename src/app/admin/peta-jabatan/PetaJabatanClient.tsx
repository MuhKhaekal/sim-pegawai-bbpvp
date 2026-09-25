"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hapusPetaJabatan, tambahPetaJabatan, updatePetaJabatan } from "./actions";

export type PetaJabatan = {
  id: number;
  nama_jabatan: string;
  kebutuhan_ideal: number;
  kelas_jabatan: number | null;
  bup: number; // Tambahkan tipe untuk BUP
};

type ModalMode = "tambah" | "edit" | "hapus" | null;

export default function PetaJabatanClient({ initialData }: { initialData: PetaJabatan[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<PetaJabatan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return initialData;

    return initialData.filter((item) => `${item.nama_jabatan} ${item.kelas_jabatan ?? ""} ${item.bup}`.toLowerCase().includes(keyword));
  }, [initialData, search]);

  function openAdd() {
    setSelected(null);
    setError("");
    setModal("tambah");
  }

  function openEdit(item: PetaJabatan) {
    setSelected(item);
    setError("");
    setModal("edit");
  }

  function openDelete(item: PetaJabatan) {
    setSelected(item);
    setError("");
    setModal("hapus");
  }

  function closeModal() {
    if (isSubmitting) return;
    setModal(null);
    setSelected(null);
    setError("");
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");

    try {
      if (modal === "tambah") {
        await tambahPetaJabatan(formData);
      } else if (modal === "edit") {
        await updatePetaJabatan(formData);
      } else if (modal === "hapus") {
        await hapusPetaJabatan(formData);
      }
      closeModal();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* =====================================================
          HEADER 
      ===================================================== */}
      <div className="animate-fade-up flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5 mb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-100/50 text-amber-500 px-3 py-1 rounded-full mb-2 lg:mb-3 text-[10px] lg:text-xs font-black tracking-widest uppercase border border-amber-200">
            <span>Database</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-[#15406A] tracking-tight">Peta Jabatan</h1>
          <p className="text-gray-500 mt-1 lg:mt-2 font-medium text-sm lg:text-base">Kelola kebutuhan ideal, kelas, dan Batas Usia Pensiun (BUP) jabatan.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 bg-[#15406A] hover:bg-blue-900 text-white px-5 py-3 lg:px-6 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm lg:text-base w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Input Data Baru</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Total Jabatan" value={initialData.length} />
        <StatCard label="Total Kebutuhan Ideal" value={initialData.reduce((sum, item) => sum + item.kebutuhan_ideal, 0)} />
        <StatCard label="Total Kelas Jabatan" value={new Set(initialData.map((item) => item.kelas_jabatan).filter((value) => value !== null)).size} />
      </div>

      {/* =====================================================
          TABLE 
      ===================================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* TABEL HEADER / FILTER */}
        <div className="p-5 border-b border-gray-100 bg-white md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari nama jabatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-9 pr-3 py-2 text-sm focus:bg-white focus:outline-none focus:border-[#15406A] focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            {search && (
              <button type="button" onClick={() => setSearch("")} className="px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors whitespace-nowrap">
                Reset
              </button>
            )}
          </div>
        </div>

        {/* TABEL KONTEN */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-16 text-center">No</th>
                <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nama Jabatan Fungsional/Pelaksana</th>
                <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Kelas</th>
                <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Kebutuhan</th>
                <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">BUP</th>
                <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-sm text-gray-500">
                    {search ? "Tidak ada jabatan yang sesuai pencarian." : "Belum ada data peta jabatan."}
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id} className={`group border-b border-gray-100 hover:bg-blue-50/40 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-3 align-middle text-center text-sm font-bold text-gray-400">{index + 1}</td>

                    <td className="px-4 py-3 align-middle">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-[#15406A] transition-colors">{item.nama_jabatan}</span>
                    </td>

                    <td className="px-4 py-3 align-middle text-center">
                      {item.kelas_jabatan === null ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span className="inline-flex justify-center rounded-lg bg-[#15406A]/10 px-2.5 py-1 text-xs font-bold text-[#15406A]">Kls {item.kelas_jabatan}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 align-middle text-center">
                      <span className="inline-flex justify-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">{item.kebutuhan_ideal}</span>
                    </td>

                    <td className="px-4 py-3 align-middle text-center">
                      <span className="inline-flex justify-center rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 border border-orange-100">{item.bup} Thn</span>
                    </td>

                    <td className="px-4 py-3 align-middle text-right">
                      <div className="flex justify-end gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded border border-blue-100 transition-colors tooltip" title="Edit Data">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                          </svg>
                        </button>
                        <button onClick={() => openDelete(item)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded border border-red-100 transition-colors tooltip" title="Hapus Data">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          MODAL (EDIT / TAMBAH / HAPUS)
      ===================================================== */}
      {modal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onMouseDown={closeModal}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200" onMouseDown={(event) => event.stopPropagation()}>
            {modal === "hapus" ? (
              <form action={handleSubmit}>
                <input type="hidden" name="id" value={selected?.id ?? ""} />
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Hapus Peta Jabatan?</h3>
                  <p className="text-center text-gray-500 mb-6 text-sm">
                    Anda yakin ingin menghapus <strong>{selected?.nama_jabatan}</strong>? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  {error && <ErrorMessage message={error} />}
                  <div className="flex gap-3">
                    <button type="button" onClick={closeModal} disabled={isSubmitting} className="w-1/2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
                      Batal
                    </button>
                    <button type="submit" disabled={isSubmitting} className="w-1/2 px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex justify-center items-center disabled:opacity-50">
                      {isSubmitting ? "Memproses..." : "Ya, Hapus"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form action={handleSubmit}>
                {modal === "edit" && <input type="hidden" name="id" value={selected?.id ?? ""} />}
                <div className="p-6 md:p-8">
                  <div className="mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-[#15406A]">{modal === "edit" ? "Edit Peta Jabatan" : "Tambah Peta Jabatan"}</h3>
                    <p className="text-sm text-gray-500 mt-1">Lengkapi informasi master data peta jabatan.</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-gray-700">Nama Jabatan Fungsional/Pelaksana</label>
                      <input
                        name="nama_jabatan"
                        required
                        defaultValue={selected?.nama_jabatan ?? ""}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-[#15406A] focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Contoh: Instruktur Ahli Muda"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-bold text-gray-700">Kebutuhan Ideal</label>
                        <input
                          name="kebutuhan_ideal"
                          type="number"
                          min="0"
                          required
                          defaultValue={selected?.kebutuhan_ideal ?? 0}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-[#15406A] focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-bold text-gray-700">Kelas Jabatan</label>
                        <input
                          name="kelas_jabatan"
                          type="number"
                          min="0"
                          defaultValue={selected?.kelas_jabatan ?? ""}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-[#15406A] focus:ring-2 focus:ring-blue-100 transition-all"
                          placeholder="Contoh: 9"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-gray-700">Batas Usia Pensiun (BUP)</label>
                      <div className="relative">
                        <input
                          name="bup"
                          type="number"
                          min="0"
                          required
                          defaultValue={selected?.bup ?? 58}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-4 py-2.5 pr-16 text-sm focus:bg-white focus:outline-none focus:border-[#15406A] focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">tahun</span>
                      </div>
                    </div>
                  </div>

                  {error && <ErrorMessage message={error} />}

                  <div className="flex gap-3">
                    <button type="button" onClick={closeModal} disabled={isSubmitting} className="w-1/2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
                      Batal
                    </button>
                    <button type="submit" disabled={isSubmitting} className="w-1/2 px-4 py-2 bg-[#15406A] hover:bg-[#103554] text-white font-semibold rounded-xl transition-colors flex justify-center items-center disabled:opacity-50">
                      {isSubmitting ? "Memproses..." : modal === "edit" ? "Simpan Perubahan" : "Simpan Jabatan"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// KOMPONEN PELENGKAP
// =====================================================
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-[#15406A]">{value.toLocaleString("id-ID")}</p>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{message}</div>;
}
