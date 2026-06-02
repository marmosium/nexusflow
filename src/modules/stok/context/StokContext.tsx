import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface StokSatiri {
  id: number;
  urunAdi: string;
  kapNumarasi: string;
  miktar: string;
  lokasyon: string;
  aciklama: string;
}

export type FoyDurum = "beklemede" | "kidemli_inceleme" | "birim_amiri_inceleme" | "onaylandi" | "reddedildi";

export interface StokFoy {
  foyId: string;
  satirlar: StokSatiri[];
  durum: FoyDurum;
  olusturanEmail: string;
  olusturmaTarihi: string;
  gonderilmeTarihi?: string;
}

interface StokContextType {
  foyler: StokFoy[];
  foyGonder: (satirlar: StokSatiri[], olusturanEmail: string, baslangicDurum?: FoyDurum) => void;
  foyDurumGuncelle: (foyId: string, durum: FoyDurum) => void;
  tumVeriyiTemizle: () => void;
}

const StokContext = createContext<StokContextType | null>(null);

const LS_KEY = "nexusflow_stok_foyler";

function localdenOku(): StokFoy[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function localeyYaz(foyler: StokFoy[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(foyler));
}

export function StokProvider({ children }: { children: ReactNode }) {
  const [foyler, setFoyler] = useState<StokFoy[]>(localdenOku);

  useEffect(() => {
    localeyYaz(foyler);
  }, [foyler]);

  function foyGonder(satirlar: StokSatiri[], olusturanEmail: string, baslangicDurum: FoyDurum = "kidemli_inceleme") {
    const yeniFoy: StokFoy = {
      foyId: crypto.randomUUID(),
      satirlar,
      durum: baslangicDurum,
      olusturanEmail,
      olusturmaTarihi: new Date().toISOString(),
      gonderilmeTarihi: new Date().toISOString(),
    };
    setFoyler((prev) => [yeniFoy, ...prev]);
  }

  function foyDurumGuncelle(foyId: string, durum: FoyDurum) {
    setFoyler((prev) =>
      prev.map((f) => (f.foyId === foyId ? { ...f, durum } : f))
    );
  }

  function tumVeriyiTemizle() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("nexusflow_"))
      .forEach((k) => localStorage.removeItem(k));
    setFoyler([]);
  }

  return (
    <StokContext.Provider value={{ foyler, foyGonder, foyDurumGuncelle, tumVeriyiTemizle }}>
      {children}
    </StokContext.Provider>
  );
}

export function useStokContext() {
  const ctx = useContext(StokContext);
  if (!ctx) throw new Error("useStokContext, StokProvider içinde kullanılmalı");
  return ctx;
}
