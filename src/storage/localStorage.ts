import { Manudur } from "../funcs/manudur";
import type { ManudurData } from "../funcs/typur";

const STORAGE_KEY = "kmgjald.saga";

export function vistaSogu(saga: Manudur[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saga));
  } catch (error) {
    console.error("Gat ekki vistað sögu í localStorage:", error);
  }
}

export function lesaSogu(): Manudur[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return [];

    const data = JSON.parse(json) as ManudurData[];
    return data.map((d) => Manudur.fromData(d));
  } catch (e) {
    console.error("Gat ekki lesið sögu", e);
    return [];
  }
}

export function hreinsaSoguStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
