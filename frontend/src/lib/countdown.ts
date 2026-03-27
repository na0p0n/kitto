export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
};

/**
 * YYYY-MM-DD 形式の日付文字列から残り時間を計算する。
 * 対象日の 00:00:00 を締切とする。
 */
export function calcTimeLeft(dateStr: string, now: Date = new Date()): TimeLeft {
  const target = new Date(dateStr + "T00:00:00");
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}
