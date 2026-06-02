import { useEffect, useState } from "react";
import { getStokKalemleri } from "../api";
import type { StokKalemi } from "../types";

export function useStok() {
  const [kalemler, setKalemler] = useState<StokKalemi[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    getStokKalemleri()
      .then(setKalemler)
      .catch((e) => setHata(e.message))
      .finally(() => setYukleniyor(false));
  }, []);

  return { kalemler, yukleniyor, hata };
}
