"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { tambahPangkatGolongan, updatePangkatGolongan, hapusPangkatGolongan } from "./actions";

type PangkatGolongan = {
  id: number;
  status_kepegawaian: string;
  pangkat_golongan: string;
  masa_kerja: number;
  created_at: string | null;
  updated_at: string | null;
};

interface Props {
  initialData: PangkatGolongan[];
}

type ModalMode = "tambah" | "edit" | null;


export default function PangkatGolonganClient({ initialData }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  const [selectedData, setSelectedData] = useState<PangkatGolongan | null>(null);

  const [statusKepegawaian, setStatusKepegawaian] = useState("PNS");

  const [pangkatGolongan, setPangkatGolongan] = useState("");

  const [masaKerja, setMasaKerja] = useState("");

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

    return initialData.filter((item) => [item.status_kepegawaian, item.pangkat_golongan, String(item.masa_kerja)].join(" ").toLowerCase().includes(keyword));
  }, [initialData, search]);

  const resetForm = () => {
    setStatusKepegawaian("PNS");
    setPangkatGolongan("");
    setMasaKerja("");
    setSelectedData(null);
  };

  const bukaTambah = () => {
    resetForm();
    setModalMode("tambah");
    setMessage(null);
  };

  const bukaEdit = (item: PangkatGolongan) => {
    setSelectedData(item);
    setStatusKepegawaian(item.status_kepegawaian);
    setPangkatGolongan(item.pangkat_golongan);
    setMasaKerja(String(item.masa_kerja));
    setModalMode("edit");
    setMessage(null);
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

      formData.append("status_kepegawaian", statusKepegawaian);

      formData.append("pangkat_golongan", pangkatGolongan);

      formData.append("masa_kerja", masaKerja);

      const result = modalMode === "edit" ? await updatePangkatGolongan(formData) : await tambahPangkatGolongan(formData);

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        setModalMode(null);
        resetForm();
        router.refresh();
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

  const handleDelete = async (item: PangkatGolongan) => {
    const confirmed = window.confirm(`Hapus data "${item.pangkat_golongan}" untuk status "${item.status_kepegawaian}"?`);

    if (!confirmed) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await hapusPangkatGolongan(item.id);

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        router.refresh();
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
    <div className="min-h-full bg-slate-50/60 p-4 md:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-800 md:text-3xl">Pangkat dan Golongan</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Kelola jabatan fungsional dan pelaksana beserta kebutuhan ideal dan kelas jabatannya.</p>
          </div>

          <button type="button" onClick={bukaTambah} className="rounded-xl bg-[#15406A] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#103653] active:scale-[0.98]">
            + Tambah Data
          </button>
        </div>

        {/* ALERT */}
        {message && <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message.text}</div>}

        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total Data" value={initialData.length} />

          <StatCard label="Kelas PNS" value={initialData.filter((item) => item.status_kepegawaian.toLowerCase() === "pns").length} />
          <StatCard label="Kelas PPPK" value={initialData.filter((item) => item.status_kepegawaian.toLowerCase() === "pppk").length} />
          <StatCard label="Kelas NON ASN" value={initialData.filter((item) => item.status_kepegawaian.toLowerCase() === "non asn").length} />
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

          <div className="overflox-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 text-left font-bold">No</th>
                  <th className="px-5 py-4 text-left font-bold">Status Kepegawaian</th>
                  <th className="px-5 py-4 text-left font-bold">Pangkat/Golongan</th>
                  <th className="px-5 py-4 text-left font-bold">Masa Kerja</th>
                  <th className="px-5 py-4 text-left font-bold">Aksi</th>
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
                      <td className="px-5 py-4 font-semibold text-slate-700">{item.status_kepegawaian}</td>
                      <td className="px-5 py-4 text-center font-bold text-[#15406A]">{item.pangkat_golongan}</td>
                      <td className="px-5 py-4 text-center">
                        {item.masa_kerja === null ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span className="inline-flex min-w-10 justify-center rounded-lg bg-[#15406A]/10 px-2.5 py-1 font-bold text-[#15406A]">{item.masa_kerja}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {/* <div className="flex justify-end gap-2">
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
                        </div> */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* SEARCH */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-4 font-black text-slate-500">No</th>

                  <th className="px-5 py-4 font-black text-slate-500">Status Kepegawaian</th>

                  <th className="px-5 py-4 font-black text-slate-500">Pangkat/Golongan</th>

                  <th className="px-5 py-4 font-black text-slate-500">Masa Kerja</th>

                  <th className="px-5 py-4 text-right font-black text-slate-500">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm font-medium text-slate-400">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-slate-400">{index + 1}</td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-black text-[#15406A]">{item.status_kepegawaian}</span>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-700">{item.pangkat_golongan}</td>

                      <td className="px-5 py-4 font-semibold text-slate-600">{item.masa_kerja} tahun</td>

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
              <h2 className="text-xl font-black text-[#15406A]">{modalMode === "edit" ? "Edit Pangkat/Golongan" : "Tambah Pangkat/Golongan"}</h2>

              <p className="mt-1 text-sm text-slate-500">Lengkapi informasi master pangkat/golongan.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* STATUS */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Status Kepegawaian</label>

                <select
                  value={statusKepegawaian}
                  onChange={(e) => setStatusKepegawaian(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#15406A] focus:ring-2 focus:ring-[#15406A]/10"
                >
                  <option value="PNS">PNS</option>
                  <option value="PPPK">PPPK</option>
                  <option value="NON-ASN">NON-ASN</option>
                </select>
              </div>

              {/* PANGKAT */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Pangkat & Golongan</label>

                <input
                  type="text"
                  value={pangkatGolongan}
                  onChange={(e) => setPangkatGolongan(e.target.value)}
                  placeholder="Contoh: III/c - Penata"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#15406A] focus:ring-2 focus:ring-[#15406A]/10"
                />
              </div>

              {/* MASA KERJA */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Masa Kerja</label>

                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={masaKerja}
                    onChange={(e) => setMasaKerja(e.target.value)}
                    placeholder="Contoh: 8"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-20 text-sm font-medium outline-none focus:border-[#15406A] focus:ring-2 focus:ring-[#15406A]/10"
                  />

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">tahun</span>
                </div>
              </div>

              {/* BUTTON */}
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-800">{value.toLocaleString("id-ID")}</p>
    </div>
  );
}
