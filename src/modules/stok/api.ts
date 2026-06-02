import { supabase } from "../../lib/supabase";
import type { StokKalemi } from "./types";

export async function getStokKalemleri(): Promise<StokKalemi[]> {
  const { data, error } = await supabase
    .from("stok_kalemleri")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
