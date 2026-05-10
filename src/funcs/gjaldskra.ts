import type { Flokkur } from "./typur";

export function gjaldFyrirFlokk(flokkur: Flokkur): number {
  if (flokkur === "A") return 4.15;
  if (flokkur === "B") return 6.95;
  if (flokkur === "C") return 9.85;
  return 0;
}

export function gjaldFyrirThyngd(thyngd: number): number {
  if (thyngd <= 3500) return 6.95;
  if (thyngd <= 5000) return 9.85;
  if (thyngd <= 6000) return 10.44;
  if (thyngd <= 7000) return 11.06;
  if (thyngd <= 8000) return 11.73;
  if (thyngd <= 9000) return 12.43;
  if (thyngd <= 10000) return 13.18;
  return 0;
}

export function erLoglegurFlokkur(flokkur: string): flokkur is Flokkur {
  return flokkur === "A" || flokkur === "B" || flokkur === "C";
}
