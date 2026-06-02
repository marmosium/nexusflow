import { useState, useEffect } from "react";
import { Package, ClipboardList, Clock, CheckCircle, XCircle, ChevronRight, Plus, Trash2, Send, Eye, Shield, Sparkles } from "lucide-react";
import { useStokContext, type StokFoy, type StokSatiri } from "../context/StokContext";
import { supabase } from "../../../lib/supabase";

type Gorunum = "liste" | "yeni" | "kod";

let satirSayaci = 1;
function yeniSatir(): StokSatiri {
  return { id: satirSayaci++, urunAdi: "", kapNumarasi: "", miktar: "", lokasyon: "", aciklama: "" };
}

const istatistikSablonu = [
  { label: "Toplam Föy",  key: "toplam",     icon: ClipboardList, renk: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Bekleyen",    key: "bekleyen",   icon: Clock,         renk: "text-amber-400",   bg: "bg-amber-500/10"  },
  { label: "Onaylanan",   key: "onaylanan",  icon: CheckCircle,   renk: "text-sky-400",     bg: "bg-sky-500/10"    },
  { label: "Reddedilen",  key: "reddedilen", icon: XCircle,       renk: "text-rose-400",    bg: "bg-rose-500/10"   },
];

function tarihFormatla(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
}

function DurumBadge({ durum }: { durum: StokFoy["durum"] }) {
  const map = {
    kidemli_inceleme:    { label: "Kıdemli İnceleme",  cls: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
    birim_amiri_inceleme:{ label: "Onay Bekliyor",      cls: "bg-amber-500/10  text-amber-400  border-amber-500/20"  },
    onaylandi:           { label: "Onaylandı",          cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"},
    reddedildi:          { label: "Reddedildi",         cls: "bg-rose-500/10   text-rose-400   border-rose-500/20"   },
    beklemede:           { label: "Taslak",             cls: "bg-gray-500/10   text-gray-400   border-gray-500/20"   },
  };
  const { label, cls } = map[durum] ?? map.beklemede;
  return <span className={`text-xs px-2.5 py-1 rounded-full border ${cls}`}>{label}</span>;
}

export default function BirimAmiriPage() {
  const { foyler, foyGonder, foyDurumGuncelle, tumVeriyiTemizle } = useStokContext();
  const [gorunum, setGorunum] = useState<Gorunum>("liste");
  const [satirlar, setSatirlar] = useState<StokSatiri[]>([yeniSatir()]);
  const [email, setEmail] = useState<string>("");
  const [gonderildi, setGonderildi] = useState(false);
  const [acikFoyId, setAcikFoyId] = useState<string | null>(null);
  const [anaKategori, setAnaKategori] = useState<"islem-gorecek" | "islenmis" | null>(null);
  const [altKategori, setAltKategori] = useState<string | null>(null);
  const [kodAdet, setKodAdet] = useState<string>("1");
  const [uretilmiKodlar, setUretilmiKodlar] = useState<string[]>([]);

  const PREFIX_MAP: Record<string, string> = {
    "Moloz": "BL",
    "Plaka": "SL",
    "Cut to Size": "CS",
    "Paledyen": "AP",
  };

  function kodUret() {
    if (!altKategori || !PREFIX_MAP[altKategori]) return;
    const prefix = PREFIX_MAP[altKategori];
    const yy = String(new Date().getFullYear()).slice(-2);
    const lsKey = `nexusflow_kod_sayac_${prefix}${yy}`;
    const mevcutSayac = parseInt(localStorage.getItem(lsKey) ?? "0", 10);
    const adet = Math.max(1, parseInt(kodAdet, 10) || 1);
    const yeniKodlar: string[] = [];
    for (let i = 1; i <= adet; i++) {
      const sayi = String(mevcutSayac + i).padStart(3, "0");
      yeniKodlar.push(`${prefix}${yy}${sayi}`);
    }
    localStorage.setItem(lsKey, String(mevcutSayac + adet));
    setUretilmiKodlar(yeniKodlar);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const bekleyenFoyler = foyler.filter((f) => f.durum === "birim_amiri_inceleme");

  const istatistik = {
    toplam:     foyler.length,
    bekleyen:   bekleyenFoyler.length,
    onaylanan:  foyler.filter((f) => f.durum === "onaylandi").length,
    reddedildi: foyler.filter((f) => f.durum === "reddedildi").length,
  };

  function satirGuncelle(id: number, alan: keyof Omit<StokSatiri, "id">, deger: string) {
    setSatirlar((prev) => prev.map((s) => s.id === id ? { ...s, [alan]: deger } : s));
  }
  function satirEkle() { setSatirlar((prev) => [...prev, yeniSatir()]); }
  function satirSil(id: number) {
    if (satirlar.length === 1) return;
    setSatirlar((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    foyGonder(satirlar, email, "onaylandi");
    setSatirlar([yeniSatir()]);
    setGonderildi(true);
    setTimeout(() => { setGonderildi(false); setGorunum("liste"); }, 2000);
  }

  function onayla(foy: StokFoy) { foyDurumGuncelle(foy.foyId, "onaylandi"); setAcikFoyId(null); }
  function reddet(foy: StokFoy) { foyDurumGuncelle(foy.foyId, "reddedildi"); setAcikFoyId(null); }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-sky-600/8 rounded-full blur-3xl" />
      </div>

      {/* Sol Dashboard */}
      <aside className="relative z-10 hidden lg:flex flex-col w-72 shrink-0 border-r border-gray-800/60 bg-gray-950/80 backdrop-blur-sm p-6 gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Stok Modülü</p>
            <p className="text-gray-500 text-xs">Birim Amiri Paneli</p>
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
              onClick={() => setGorunum("liste")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                gorunum === "liste"
                  ? "bg-emerald-600/10 border border-emerald-500/20 text-emerald-400"
                  : "hover:bg-gray-900 text-gray-500 hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={15} />Onay Bekleyenler
                {bekleyenFoyler.length > 0 && (
                  <span className="ml-1 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">{bekleyenFoyler.length}</span>
                )}
              </div>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setGorunum("yeni")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                gorunum === "yeni"
                  ? "bg-emerald-600/10 border border-emerald-500/20 text-emerald-400"
                  : "hover:bg-gray-900 text-gray-500 hover:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2"><ClipboardList size={15} />Yeni Föy Oluştur</div>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Tüm Föyler Özeti */}
        <div>
          <p className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-3">Son Föyler</p>
          <div className="space-y-2">
            {foyler.slice(0, 4).map((f) => (
              <div key={f.foyId} className="flex items-center justify-between bg-gray-900/60 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-gray-300 text-xs font-medium truncate">#{f.foyId.slice(0, 8).toUpperCase()}</p>
                  <p className="text-gray-600 text-xs truncate">{f.olusturanEmail.split("@")[0]}</p>
                </div>
                <DurumBadge durum={f.durum} />
              </div>
            ))}
            {foyler.length === 0 && <p className="text-gray-700 text-xs">Henüz föy yok</p>}
          </div>
        </div>

        {/* Kod Üret */}
        <div>
          <button
            onClick={() => setGorunum("kod")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              gorunum === "kod"
                ? "bg-sky-600/10 border border-sky-500/20 text-sky-400"
                : "bg-sky-600/10 border border-sky-500/20 text-sky-400 hover:bg-sky-600/20"
            }`}
          >
            <Sparkles size={15} /> Kod Üret
          </button>
        </div>

        {/* Veri Temizle */}
        <div className="mt-auto">
          <button
            onClick={() => { if (window.confirm("Tüm veriler sıfırlanacak. Emin misiniz?")) { tumVeriyiTemizle(); setAnaKategori(null); setAltKategori(null); setUretilmiKodlar([]); setKodAdet("1"); } }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 text-sm transition"
          >
            <Trash2 size={15} /> Verileri Temizle
          </button>
        </div>
      </aside>

      {/* Sağ İçerik */}
      <main className="relative z-10 flex-1 overflow-x-auto">
        <div className="px-4 sm:px-8 py-10 sm:py-14">

          {/* ── YENİ FÖY FORMU ── */}
          {gorunum === "yeni" && (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <Package size={20} className="text-emerald-400" />
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
                          <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[180px]">Ürün Adı <span className="text-emerald-400">*</span></th>
                          <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[140px]">Kap Numarası <span className="text-emerald-400">*</span></th>
                          <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[100px]">Miktar <span className="text-emerald-400">*</span></th>
                          <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[160px]">Lokasyon <span className="text-emerald-400">*</span></th>
                          <th className="text-left text-white font-semibold px-4 py-3 text-base min-w-[200px]">Açıklama</th>
                          <th className="px-4 py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {satirlar.map((satir, index) => (
                          <tr key={satir.id} className="bg-gray-950 hover:bg-gray-900/40 transition-colors">
                            <td className="px-4 py-2.5 text-gray-600 text-xs">{index + 1}</td>
                            <td className="px-2 py-2"><input type="text" value={satir.urunAdi} onChange={(e) => satirGuncelle(satir.id, "urunAdi", e.target.value)} placeholder="Ürün adı" required className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" /></td>
                            <td className="px-2 py-2"><input type="text" value={satir.kapNumarasi} onChange={(e) => satirGuncelle(satir.id, "kapNumarasi", e.target.value)} placeholder="KAP-001" required className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" /></td>
                            <td className="px-2 py-2"><input type="number" value={satir.miktar} onChange={(e) => satirGuncelle(satir.id, "miktar", e.target.value)} placeholder="0" min="0" required className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" /></td>
                            <td className="px-2 py-2"><input type="text" value={satir.lokasyon} onChange={(e) => satirGuncelle(satir.id, "lokasyon", e.target.value)} placeholder="Depo A - Raf 3" required className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" /></td>
                            <td className="px-2 py-2"><input type="text" value={satir.aciklama} onChange={(e) => satirGuncelle(satir.id, "aciklama", e.target.value)} placeholder="Ek not..." className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" /></td>
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
                    <button type="button" onClick={satirEkle} className="flex items-center gap-2 text-gray-500 hover:text-emerald-400 text-sm transition">
                      <Plus size={15} /> Satır Ekle
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5 gap-4">
                  <p className="text-gray-600 text-sm">{satirlar.length} ürün</p>
                  <div className="flex items-center gap-3">
                    {gonderildi && (
                      <span className="text-emerald-400 text-sm flex items-center gap-1.5">
                        <CheckCircle size={15} /> Föy onaylandı ve kaydedildi
                      </span>
                    )}
                    <button type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-950">
                      <Send size={15} /> Föyü Onayla ve Kaydet
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}

          {/* ── ONAY BEKLEYEN FÖYLER ── */}
          {gorunum === "liste" && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                    <Shield size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-xl leading-tight">Onay Bekleyen Föyler</h1>
                    <p className="text-gray-500 text-sm">İnceleme ve onay işlemleri</p>
                  </div>
                </div>
                {bekleyenFoyler.length > 0 && (
                  <span className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                    {bekleyenFoyler.length} bekliyor
                  </span>
                )}
              </div>

              {bekleyenFoyler.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4">
                    <CheckCircle size={24} className="text-gray-700" />
                  </div>
                  <p className="text-gray-500 text-sm">Onay bekleyen föy bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bekleyenFoyler.map((foy) => {
                    const acik = acikFoyId === foy.foyId;
                    return (
                      <div key={foy.foyId} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

                        {/* Föy Başlığı */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                          <div>
                            <p className="text-white font-semibold text-sm">Föy #{foy.foyId.slice(0, 8).toUpperCase()}</p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {foy.olusturanEmail} · {tarihFormatla(foy.gonderilmeTarihi ?? foy.olusturmaTarihi)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <DurumBadge durum={foy.durum} />
                            <button
                              onClick={() => setAcikFoyId(acik ? null : foy.foyId)}
                              className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition"
                            >
                              <Eye size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Tablo — her zaman görünür */}
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

                        {/* Aksiyon Barı */}
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800 bg-gray-900/50">
                          <p className="text-gray-600 text-xs">{foy.satirlar.length} ürün</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => reddet(foy)}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg text-sm font-medium transition"
                            >
                              <XCircle size={14} /> Reddet
                            </button>
                            <button
                              onClick={() => onayla(foy)}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition"
                            >
                              <CheckCircle size={14} /> Onayla
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── KOD ÜRET ── */}
          {gorunum === "kod" && (
            <>
              {/* Başlık */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center">
                    <Sparkles size={20} className="text-sky-400" />
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-xl leading-tight">Kod Üret</h1>
                    <p className="text-gray-500 text-sm">Ürün tipini seçerek kod oluşturun</p>
                  </div>
                </div>
                {(anaKategori || altKategori) && (
                  <button
                    onClick={() => { setAnaKategori(null); setAltKategori(null); }}
                    className="text-gray-600 hover:text-gray-400 text-sm transition"
                  >
                    Sıfırla
                  </button>
                )}
              </div>

              {/* Adım 1 — Ana Kategori */}
              <div className="mb-6">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">
                  Adım 1 · Ürün Tipi Seçin
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "islem-gorecek" as const, label: "İşlem Görecek Ürün", aciklama: "Moloz, Plaka, Cut to Size veya Paledyen" },
                    { key: "islenmis" as const,      label: "İşlenmiş Ürün",       aciklama: "Ticari veya Üretim Fazlası" },
                  ].map(({ key, label, aciklama }) => (
                    <button
                      key={key}
                      onClick={() => { setAnaKategori(key); setAltKategori(null); }}
                      className={`text-left p-5 rounded-2xl border transition-all duration-200 ${
                        anaKategori === key
                          ? "bg-sky-600/10 border-sky-500/50 ring-1 ring-sky-500/30"
                          : "bg-gray-900 border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold text-sm">{label}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          anaKategori === key ? "border-sky-400 bg-sky-400" : "border-gray-700"
                        }`}>
                          {anaKategori === key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs">{aciklama}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Adım 2 — Alt Kategori */}
              {anaKategori && (
                <div className="mb-8">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">
                    Adım 2 · Alt Kategori Seçin
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(anaKategori === "islem-gorecek"
                      ? ["Moloz", "Plaka", "Cut to Size", "Paledyen"]
                      : ["Ticari", "Üretim Fazlası"]
                    ).map((alt) => (
                      <button
                        key={alt}
                        onClick={() => setAltKategori(alt)}
                        className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                          altKategori === alt
                            ? "bg-sky-600/10 border-sky-500/50 text-sky-300 ring-1 ring-sky-500/30"
                            : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200"
                        }`}
                      >
                        {alt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Seçim Özeti + Adet + Üret */}
              {anaKategori && altKategori && (
                <div className="space-y-4">
                  <div className="bg-gray-900 border border-sky-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Seçilen</p>
                      <p className="text-white font-semibold text-sm">
                        {anaKategori === "islem-gorecek" ? "İşlem Görecek Ürün" : "İşlenmiş Ürün"}
                        <span className="text-sky-400 mx-2">›</span>
                        {altKategori}
                        {PREFIX_MAP[altKategori] && (
                          <span className="ml-2 text-xs text-gray-500">
                            (Prefix: <span className="text-sky-400 font-mono">{PREFIX_MAP[altKategori]}</span>)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col gap-1">
                        <label className="text-gray-500 text-xs">Adet</label>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={kodAdet}
                          onChange={(e) => { setKodAdet(e.target.value); setUretilmiKodlar([]); }}
                          className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm text-center focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                        />
                      </div>
                      <button
                        onClick={kodUret}
                        className="self-end flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-5 py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                      >
                        <Sparkles size={15} /> Kodları Üret
                      </button>
                    </div>
                  </div>

                  {/* Üretilen Kodlar */}
                  {uretilmiKodlar.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                      <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
                        <p className="text-white font-semibold text-sm">{uretilmiKodlar.length} kod üretildi</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(uretilmiKodlar.join("\n"));
                          }}
                          className="text-gray-500 hover:text-sky-400 text-xs transition"
                        >
                          Tümünü Kopyala
                        </button>
                      </div>
                      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {uretilmiKodlar.map((kod) => (
                          <div
                            key={kod}
                            className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-center font-mono text-sky-300 text-sm font-semibold tracking-widest"
                          >
                            {kod}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </main>

    </div>
  );
}
