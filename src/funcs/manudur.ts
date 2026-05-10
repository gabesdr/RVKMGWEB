import type { Flokkur, ManudurData } from "./typur";
export class Manudur {
  readonly id: string;
  readonly dagsetning: string;
  readonly flokkur: Flokkur;
  readonly thyngd: number;
  readonly upphaf: number;
  readonly lokKm: number;
  readonly eknirKm: number;
  readonly gjaldPerKm: number;
  readonly gjald: number;

  constructor(
    dagsetning: string,
    flokkur: Flokkur,
    thyngd: number,
    upphaf: number,
    lokKm: number,
    gjaldPerKm: number,
  ) {
    this.dagsetning = dagsetning;
    this.flokkur = flokkur;
    this.thyngd = thyngd;
    this.upphaf = upphaf;
    this.lokKm = lokKm;
    this.eknirKm = lokKm - upphaf;
    this.gjaldPerKm = gjaldPerKm;
    this.gjald = this.eknirKm * gjaldPerKm;
    this.id = `${Date.now()}-${Math.random()}.toString(36).slice(2, 8)}`;
  }

  static fromData(data: ManudurData): Manudur {
    const m = Object.create(Manudur.prototype) as Manudur;
    Object.assign(m, data);
    return m;
  }

  toString(): string {
    const flokkurTexti =
      this.flokkur === "C"
        ? "C (${formatNumber(this.thyngd)} kg)"
        : this.flokkur;

    return `${this.dagsetning} · ${flokkurTexti}  ·  ${formatNumber(this.upphaf)} → ${formatNumber(this.lokKm)} (${formatNumber(this.eknirKm)} km)  ·  ${formatCurrency(this.gjald)} kr`;
  }
}

export function formatNumber(num: number): string {
  return num.toLocaleString("is-IS");
}

export function formatCurrency(num: number): string {
  return num.toLocaleString("is-IS", {
    style: "currency",
    currency: "ISK",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

export function dagsetningIDag(): string {
  return new Date().toISOString().split("T")[0];
}
