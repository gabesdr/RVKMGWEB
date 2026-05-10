export type Flokkur = "A" | "B" | "C";

export interface ManudurData {
  id: string;
  dagsetning: string;
  flokkur: Flokkur;
  thyngd: number;
  upphaf: number;
  lokKm: number;
  eknirKm: number;
  gjaldPerKm: number;
  gjald: number;
}
