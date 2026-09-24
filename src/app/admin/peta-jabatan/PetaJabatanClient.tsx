"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hapusPetaJabatan, tambahPetaJabatan, updatePetaJabatan } from "./actions";

type PetaJabatan = {
  id: number;
  nama_jabatan: string;
  kebutuhan_ideal: number;
  kelas_jabatan: number | null;
};

type ModalMode = "tambah" | "edit" | "hapus" | null;

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#15406A] focus:ring-4 focus:ring-[#15406A]/10";

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

    return initialData.filter((item) => `${item.nama_jabatan} ${item.kelas_jabatan ?? ""}`.toLowerCase().includes(keyword));
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
    <div className="min-h-full bg-slate-50/60 p-4 md:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-800 md:text-3xl">Peta Jabatan</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Kelola jabatan fungsional dan pelaksana beserta kebutuhan ideal dan kelas jabatannya.</p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#15406A] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#15406A]/20 transition hover:-translate-y-0.5 hover:bg-[#103554]"
          >
            <span className="text-lg leading-none">+</span>
            Tambah Jabatan
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Jabatan" value={initialData.length} />
          <StatCard label="Kebutuhan Ideal" value={initialData.reduce((sum, item) => sum + item.kebutuhan_ideal, 0)} />
          <StatCard label="Kelas Jabatan" value={new Set(initialData.map((item) => item.kelas_jabatan).filter((value) => value !== null)).size} />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-end md:p-5">


            <div className="relative w-full md:w-80">
              <input  
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama jabatan..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm outline-none transition focus:border-[#15406A] focus:bg-white focus:ring-4 focus:ring-[#15406A]/10"
              />
              <svg className="absolute left-3 top-3 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 text-left font-bold">No</th>
                  <th className="px-5 py-4 text-left font-bold">Nama Jabatan Fungsional/Pelaksana</th>
                  <th className="px-5 py-4 text-center font-bold">Kebutuhan Ideal</th>
                  <th className="px-5 py-4 text-center font-bold">Kelas Jabatan</th>
                  <th className="px-5 py-4 text-right font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                      {search ? "Tidak ada jabatan yang sesuai pencarian." : "Belum ada data peta jabatan."}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-4 text-slate-400">{index + 1}</td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{item.nama_jabatan}</td>
                      <td className="px-5 py-4 text-center font-bold text-[#15406A]">{item.kebutuhan_ideal}</td>
                      <td className="px-5 py-4 text-center">
                        {item.kelas_jabatan === null ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span className="inline-flex min-w-10 justify-center rounded-lg bg-[#15406A]/10 px-2.5 py-1 font-bold text-[#15406A]">{item.kelas_jabatan}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-[#15406A]/30 hover:bg-[#15406A]/5 hover:text-[#15406A]"
                          >
                            Edit
                          </button>
                          <button type="button" onClick={() => openDelete(item)} className="rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={closeModal}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            {modal === "hapus" ? (
              <form action={handleSubmit}>
                <input type="hidden" name="id" value={selected?.id ?? ""} />
                <div className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 7h12m-9 0V4h6v3m-7 4v6m4-6v6m5-10-1 13H8L7 7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-800">Hapus Peta Jabatan?</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Anda akan menghapus <strong>{selected?.nama_jabatan}</strong>. Data pegawai yang sudah terhubung tidak ikut terhapus.
                  </p>
                  {error && <ErrorMessage message={error} />}
                </div>
                <ModalFooter onCancel={closeModal} submitLabel="Ya, Hapus" submitting={isSubmitting} danger />
              </form>
            ) : (
              <form action={handleSubmit}>
                {modal === "edit" && <input type="hidden" name="id" value={selected?.id ?? ""} />}
                <div className="p-6">
                  <div className="mb-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#15406A]">Master Peta Jabatan</p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-800">{modal === "edit" ? "Edit Jabatan" : "Tambah Jabatan"}</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">Nama Jabatan Fungsional/Pelaksana</label>
                      <input name="nama_jabatan" required defaultValue={selected?.nama_jabatan ?? ""} className={inputClass} placeholder="Contoh: Instruktur Ahli Muda" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">Kebutuhan Ideal</label>
                        <input name="kebutuhan_ideal" type="number" min="0" required defaultValue={selected?.kebutuhan_ideal ?? 0} className={inputClass} />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">Kelas Jabatan</label>
                        <input name="kelas_jabatan" type="number" min="0" defaultValue={selected?.kelas_jabatan ?? ""} className={inputClass} placeholder="Contoh: 9" />
                      </div>
                    </div>
                  </div>

                  {error && <ErrorMessage message={error} />}
                </div>
                <ModalFooter onCancel={closeModal} submitLabel={modal === "edit" ? "Simpan Perubahan" : "Simpan Jabatan"} submitting={isSubmitting} />
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-800">{value.toLocaleString("id-ID")}</p>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{message}</div>;
}

function ModalFooter({ onCancel, submitLabel, submitting, danger = false }: { onCancel: () => void; submitLabel: string; submitting: boolean; danger?: boolean }) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
      <button type="button" onClick={onCancel} disabled={submitting} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
        Batal
      </button>
      <button
        type="submit"
        disabled={submitting}
        className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${danger ? "bg-red-500 hover:bg-red-600" : "bg-[#15406A] hover:bg-[#103554]"}`}
      >
        {submitting ? "Memproses..." : submitLabel}
      </button>
    </div>
  );
}
