"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { tambahBidangUnitKerja, updateBidangUnitKerja, hapusBidangUnitKerja } from "./actions";

type BidangUnitKerja = {
  id: number;
  nama_bidang: string;
  created_at: string | null;
  updated_at: string | null;
};

interface Props {
  initialData: BidangUnitKerja[];
}

type ModalMode = "tambah" | "edit" | null;

export default function BidangUnitKerjaClient({ initialData }: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");

  const [modalMode, setModalMode] = useState<ModalMode>(null);

  const [selectedData, setSelectedData] = useState<BidangUnitKerja | null>(null);

  const [namaBidang, setNamaBidang] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return initialData;
    }

    return initialData.filter((item) => item.nama_bidang.toLowerCase().includes(keyword));
  }, [initialData, search]);

  const resetForm = () => {
    setNamaBidang("");
    setSelectedData(null);
  };

  const bukaTambah = () => {
    resetForm();
    setMessage(null);
    setModalMode("tambah");
  };

  const bukaEdit = (item: BidangUnitKerja) => {
    setSelectedData(item);
    setNamaBidang(item.nama_bidang);
    setMessage(null);
    setModalMode("edit");
  };

  const tutupModal = () => {
    if (isLoading) return;

    setModalMode(null);
    resetForm();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();

      if (modalMode === "edit" && selectedData) {
        formData.append("id", String(selectedData.id));
      }

      formData.append("nama_bidang", namaBidang);

      const result = modalMode === "edit" ? await updateBidangUnitKerja(formData) : await tambahBidangUnitKerja(formData);

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message,
        });
        setModalMode(null);
        resetForm();
      }
    } catch {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat menyimpan data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: BidangUnitKerja) => {
    const confirmed = window.confirm(`Hapus "${item.nama_bidang}"?`);

    if (!confirmed) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await hapusBidangUnitKerja(item.id);

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message,
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat menghapus data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 md:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#15406A]">
              <span className="h-2 w-2 rounded-full bg-[#15406A]" />
              Master Data
            </div>

            <h1 className="text-3xl font-black tracking-tight text-[#15406A] md:text-4xl">Bidang / Unit Kerja</h1>

            <p className="mt-1 text-sm font-medium text-slate-500">Kelola daftar Bidang/Unit Kerja yang digunakan oleh data pegawai.</p>
          </div>

          <button type="button" onClick={bukaTambah} className="rounded-xl bg-[#15406A] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#103653] active:scale-[0.98]">
            + Tambah Data
          </button>
        </div>

        {/* ALERT */}
        {message && <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message.text}</div>}

        {/* STAT */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bidang / Unit Kerja</p>

            <p className="mt-2 text-3xl font-black text-[#15406A]">{initialData.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Hasil Pencarian</p>

            <p className="mt-2 text-3xl font-black text-[#15406A]">{filteredData.length}</p>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <div className="relative max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari Bidang/Unit Kerja..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-[#15406A] focus:bg-white focus:ring-2 focus:ring-[#15406A]/10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-4 font-black text-slate-500">No</th>

                  <th className="px-5 py-4 font-black text-slate-500">Bidang / Unit Kerja</th>

                  <th className="px-5 py-4 text-right font-black text-slate-500">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center text-sm font-medium text-slate-400">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-slate-400">{index + 1}</td>

                      <td className="px-5 py-4 font-bold text-slate-700">{item.nama_bidang}</td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => bukaEdit(item)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-[#15406A] transition hover:bg-blue-100">
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={isLoading}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
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
        </div>
      </div>

      {/* MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-black text-[#15406A]">{modalMode === "edit" ? "Edit Bidang / Unit Kerja" : "Tambah Bidang / Unit Kerja"}</h2>

              <p className="mt-1 text-sm text-slate-500">Masukkan nama Bidang/Unit Kerja.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Nama Bidang / Unit Kerja</label>

                <input
                  type="text"
                  value={namaBidang}
                  onChange={(e) => setNamaBidang(e.target.value)}
                  placeholder="Contoh: Bidang Penyelenggara"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#15406A] focus:ring-2 focus:ring-[#15406A]/10"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button type="button" onClick={tutupModal} disabled={isLoading} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                  Batal
                </button>

                <button type="submit" disabled={isLoading} className="rounded-xl bg-[#15406A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#103653] disabled:cursor-not-allowed disabled:opacity-60">
                  {isLoading ? "Menyimpan..." : modalMode === "edit" ? "Simpan Perubahan" : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
