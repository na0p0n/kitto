import { calcTimeLeft, pad } from "../lib/countdown";

// 基準時刻: 2026-01-01 12:00:00
const BASE = new Date("2026-01-01T12:00:00");

describe("calcTimeLeft", () => {
  describe("未来の日付", () => {
    test("翌日 0:00 まで → 残り12時間", () => {
      const result = calcTimeLeft("2026-01-02", BASE);
      expect(result.isPast).toBe(false);
      expect(result.days).toBe(0);
      expect(result.hours).toBe(12);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });

    test("2日後 0:00 まで → 残り1日12時間", () => {
      const result = calcTimeLeft("2026-01-03", BASE);
      expect(result.isPast).toBe(false);
      expect(result.days).toBe(1);
      expect(result.hours).toBe(12);
    });

    test("365日後 → days が 364 または 365", () => {
      const result = calcTimeLeft("2027-01-01", BASE);
      expect(result.isPast).toBe(false);
      expect(result.days).toBeGreaterThanOrEqual(364);
    });
  });

  describe("過去の日付", () => {
    test("昨日の日付 → isPast = true", () => {
      const result = calcTimeLeft("2025-12-31", BASE);
      expect(result.isPast).toBe(true);
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });

    test("当日 0:00 はすでに過去（基準が 12:00 のため）→ isPast = true", () => {
      const result = calcTimeLeft("2026-01-01", BASE);
      expect(result.isPast).toBe(true);
    });
  });

  describe("秒の精度", () => {
    test("59秒後が正しく計算される", () => {
      // 基準: 2026-01-02 23:59:01 → 2026-01-03 00:00:00 まで 59秒
      const base = new Date("2026-01-02T23:59:01");
      const result = calcTimeLeft("2026-01-03", base);
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(59);
    });
  });
});

describe("pad", () => {
  test("1桁の数字をゼロ埋め", () => {
    expect(pad(0)).toBe("00");
    expect(pad(5)).toBe("05");
    expect(pad(9)).toBe("09");
  });

  test("2桁の数字はそのまま", () => {
    expect(pad(10)).toBe("10");
    expect(pad(59)).toBe("59");
  });
});
