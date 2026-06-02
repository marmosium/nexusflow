import { useState, useEffect } from "react";
import { Package, ClipboardList, Clock, CheckCircle, XCircle, ChevronRight, Eye, Plus, Trash2, Send } from "lucide-react";
import { useStokContext, type StokFoy, type StokSatiri } from "../context/StokContext";
import { supabase } from "../../../lib/supabase";

type Gorunum = "liste" | "yeni";

let satirSayaci = 1;
function yeniSatir(): StokSatiri {
  return { id: satirSayaci++, urunAdi: "", kapNumarasi: "", miktar: "", lokasyon: "", aciklama: "" };
}

const istatistikSablonu = [
  { label: "Toplam Föy", key: "toplam",    icon: ClipboardList, renk: "text-indigo-400", bg: "bg-indigo-500/10" },
  { label: "Bekleyen",   key: "bekleyen",  icon: Clock,         renk: "text-amber-400",  bg: "bg-amber-500/10"  },
  { label: "Onaylanan",  key: "onaylanan", icon: CheckCircle,   renk: "text-emerald-400",bg: "bg-emerald-500/10"},
  { label: "Reddedilen", key: "reddedilen",icon: XCircle,       renk: "text-rose-400",   bg: "bg-rose-500/10"  },
];

function tarihFormatla(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
}

export default function KidemliOperatorPage() {
  const { foyler, foyGonder, foyDurumGuncelle } = useStokContext();
  const [gorunum, setGorunum] = useState<Gorunum>("liste");
  const [satirlar, setSatirlar] = useState<StokSatiri[]>([yeniSatir()]);
  const [email, setEmail] = useState<string>("");
  const [gonderildi, setGonderildi] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const gelenFoyler = foyler.filter((f) => f.durum === "kidemli_inceleme");

  const istatistik = {
    toplam:      foyler.length,
    bekleyen:    gelenFoyler.length,
    onaylanan:   foyler.filter((f) => f.durum === "birim_amiri_inceleme" || f.durum === "onaylandi").length,
    reddedildi:  foyler.filter((f) => f.durum === "reddedildi").length,
  };

  function satirGuncelle(id: number, alan: keyof Omit<StokSatiri, "id">, deger: string) {
    setSatirlar((prev) => prev.map((s) => s.id === id ? { ...s, [alan]: deger } : s));
  }

  function satirEkle() {
    setSatirlar((prev) => [...prev, yeniSatir()]);
  }

  function satirSil(id: number) {
    if (satirlar.length === 1) return;
    setSatirlar((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    foyGonder(satirlar, email, "birim_amiri_inceleme");
    setSatirlar([yeniSatir()]);
    setGonderildi(true);
    setTimeout(() => { setGonderildi(false); setGorunum("liste"); }, 2000);
  }

  function ilerlet(foy: StokFoy) {
    foyDurumGuncelle(foy.foyId, "birim_amiri_inceleme");
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Arka plan dekor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      {/* Sol Dashboard */}
      <aside className="relative z-10 hidden lg:flex flex-col w-72 shrink-0 border-r border-gray-800/60 bg-gray-950/80 backdrop-blur-sm p-6 gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
            <Package size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Stok Modülü</p>
            <p className="text-gray-500 text-xs">Kıdemli Operatör Paneli</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-3">Özet</p>
          {istatistikSablonu.map(({ label, key, icon: Icon, renk, bg }) => (
            <div key={label} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon size={15} className={renk} />
                </div>
                <span className="text-gray-400 text-sm">{label}</span>
              </div>
              <span className="text-white font-semibold text-sm">{istatistik[key as keyof typeof istatistik]}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-3">Hızlı Erişim</p>
          <div className="space-y-1">
            <button
              onClick={() => setGorunum("yeni")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                gorunum === "yeni"
                  ? "bg-violet-600/10 border border-violet-500/20 text-violet-400"
                  : "hover:bg-gray-900 text-gray-500 hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2"><ClipboardList size={15} />Yeni Föy Oluştur</div>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setGorunum("liste")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                gorunum === "liste"
                  ? "bg-violet-600/10 border border-violet-500/20 text-violet-400"
                  : "hover:bg-gray-900 text-gray-500 hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={15} />Bekleyen Föyler
                {gelenFoyler.length > 0 && (
                  <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">{gelenFoyler.length}</span>
                )}
              </div>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sağ İçerik */}
      <main className="relative z-10 flex-1 overflow-x-auto">
        <div className="px-4 sm:px-8 py-10 sm:py-14">

          {/* ── YENİ FÖY FORMU ── */}
          {gorunum === "yeni" && (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                  <Package size={20} className="text-violet-400" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl leading-tight">Stok Föyü</h1>
                  <p className="text-gray-500 text-sm">Yeni stok girişi oluştur</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="rounded-2xl border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-900 border-b border-gray-800">
                          <th className="text-left text-white font-semibold px-4 py-3 text-base w-8">#</th>
                          <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[180px]">Ürün Adı <span className="text-violet-400">*</span></th>
                          <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[140px]">Kap Numarası <span className="text-violet-400">*</span></th>
                          <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[100px]">Miktar <span className="text-violet-400">*</span></th>
                          <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[160px]">Lokasyon <span className="text-violet-400">*</span></th>
                          <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[200px]">Açıklama</th>
                          <th className="px-4 py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {satirlar.map((satir, index) => (
                          <tr key={satir.id} className="bg-gray-950 hover:bg-gray-900/40 transition-colors">
                            <td className="px-4 py-2.5 text-gray-600 text-xs">{index + 1}</td>
                            <td className="px-2 py-2">
                              <input type="text" value={satir.urunAdi} onChange={(e) => satirGuncelle(satir.id, "urunAdi", e.target.value)} placeholder="Ürün adı" required className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition" />
                            </td>
                            <td className="px-2 py-2">
                              <input type="text" value={satir.kapNumarasi} onChange={(e) => satirGuncelle(satir.id, "kapNumarasi", e.target.value)} placeholder="KAP-001" required className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition" />
                            </td>
                            <td className="px-2 py-2">
                              <input type="number" value={satir.miktar} onChange={(e) => satirGuncelle(satir.id, "miktar", e.target.value)} placeholder="0" min="0" required className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition" />
                            </td>
                            <td className="px-2 py-2">
                              <input type="text" value={satir.lokasyon} onChange={(e) => satirGuncelle(satir.id, "lokasyon", e.target.value)} placeholder="Depo A - Raf 3" required className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition" />
                            </td>
                            <td className="px-2 py-2">
                              <input type="text" value={satir.aciklama} onChange={(e) => satirGuncelle(satir.id, "aciklama", e.target.value)} placeholder="Ek not..." className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition" />
                            </td>
                            <td className="px-2 py-2">
                              <button type="button" onClick={() => satirSil(satir.id)} disabled={satirlar.length === 1} className="p-1.5 text-gray-700 hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed transition rounded-lg hover:bg-rose-500/10">
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-gray-800 bg-gray-900/50 px-4 py-2.5">
                    <button type="button" onClick={satirEkle} className="flex items-center gap-2 text-gray-500 hover:text-violet-400 text-sm transition">
                      <Plus size={15} /> Satır Ekle
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5 gap-4">
                  <p className="text-gray-600 text-sm">{satirlar.length} ürün</p>
                  <div className="flex items-center gap-3">
                    {gonderildi && (
                      <span className="text-emerald-400 text-sm flex items-center gap-1.5">
                        <CheckCircle size={15} /> Föy birim amirine gönderildi
                      </span>
                    )}
                    <button type="submit" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-950">
                      <Send size={15} /> Föyü Gönder
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}

          {/* ── BEKLEYEN FÖYLER LİSTESİ ── */}
          {gorunum === "liste" && (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                  <ClipboardList size={20} className="text-violet-400" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl leading-tight">Gelen Föyler</h1>
                  <p className="text-gray-500 text-sm">İnceleme bekleyen stok föyleri</p>
                </div>
              </div>

              {gelenFoyler.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4">
                    <ClipboardList size={24} className="text-gray-700" />
                  </div>
                  <p className="text-gray-500 text-sm">Bekleyen föy bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gelenFoyler.map((foy) => (
                    <div key={foy.foyId} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                        <div>
                          <p className="text-white font-semibold text-sm">Föy #{foy.foyId.slice(0, 8).toUpperCase()}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{foy.olusturanEmail} · {tarihFormatla(foy.gonderilmeTarihi ?? foy.olusturmaTarihi)}</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">İnceleme Bekliyor</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left text-white font-semibold px-4 py-3 text-base">#</th>
                              <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[160px]">Ürün Adı</th>
                              <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[130px]">Kap Numarası</th>
                              <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[90px]">Miktar</th>
                              <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[150px]">Lokasyon</th>
                              <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[180px]">Açıklama</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800/60">
                            {foy.satirlar.map((satir, i) => (
                              <tr key={satir.id} className="hover:bg-gray-800/30 transition-colors">
                                <td className="px-4 py-3 text-gray-600 text-xs">{i + 1}</td>
                                <td className="px-4 py-3 text-gray-200 text-sm">{satir.urunAdi}</td>
                                <td className="px-4 py-3 text-gray-200 text-sm">{satir.kapNumarasi}</td>
                                <td className="px-4 py-3 text-gray-200 text-sm">{satir.miktar}</td>
                                <td className="px-4 py-3 text-gray-200 text-sm">{satir.lokasyon}</td>
                                <td className="px-4 py-3 text-gray-400 text-sm">{satir.aciklama || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800 bg-gray-900/50">
                        <p className="text-gray-600 text-xs">{foy.satirlar.length} ürün</p>
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition">
                            <Eye size={14} /> İncele
                          </button>
                          <button onClick={() => ilerlet(foy)} className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition">
                            <ChevronRight size={14} /> Birim Amirine Gönder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </main>

    </div>
  );
}
