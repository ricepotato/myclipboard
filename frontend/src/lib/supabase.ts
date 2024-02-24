import { createClient } from "@supabase/supabase-js";
import { Database } from "./supabase.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getItems({ from, to }: { from: number; to: number }) {
  const { data, error } = await supabase
    .from("clipboard")
    .select("*")
    .range(from, to)
    .order("created_at", { ascending: false });
  if (error !== null) {
    console.error(error);
    throw error;
  }
  return data;
}

export async function getItem(id: string) {
  const { data, error } = await supabase
    .from("clipboard")
    .select("*")
    .eq("id", id);
  if (error !== null) {
    console.error(error);
    throw error;
  }
  try {
    return data[0];
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function putItem({
  user_id,
  value,
  type,
}: {
  value: string;
  type: string;
  user_id: string;
}) {
  const { data, error } = await supabase
    .from("clipboard")
    .insert([{ value, type, user_id }])
    .select();
  if (error !== null) {
    console.error(error);
    throw error;
  }
  return data;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("clipboard").delete().eq("id", id);
  if (error !== null) {
    console.error(error);
    throw error;
  }
}
