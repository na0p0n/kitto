import { calcWarikan, type Member } from "../lib/warikan";

function members(defs: { shares?: number; name?: string }[]): Member[] {
  return defs.map((d, i) => ({
    id: i + 1,
    name: d.name ?? `参加者${i + 1}`,
    shares: d.shares ?? 1,
  }));
}

describe("calcWarikan", () => {
  describe("均等割り", () => {
    test("3人で3000円 → 各1000円", () => {
      const result = calcWarikan(3000, members([{}, {}, {}]));
      expect(result.map((r) => r.amount)).toEqual([1000, 1000, 1000]);
    });

    test("2人で1000円 → 各500円", () => {
      const result = calcWarikan(1000, members([{}, {}]));
      expect(result.map((r) => r.amount)).toEqual([500, 500]);
    });

    test("合計金額が保たれる: 3人で10000円", () => {
      const result = calcWarikan(10000, members([{}, {}, {}]));
      const total = result.reduce((s, r) => s + r.amount, 0);
      expect(total).toBe(10000);
    });
  });

  describe("端数処理", () => {
    test("3人で10000円 → 合計が10000円に保たれる（10円単位）", () => {
      const result = calcWarikan(10000, members([{}, {}, {}]));
      const total = result.reduce((s, r) => s + r.amount, 0);
      expect(total).toBe(10000);
      result.forEach((r) => expect(r.amount % 10).toBe(0));
    });

    test("3人で12800円 → 合計が12800円に保たれる", () => {
      const result = calcWarikan(12800, members([{}, {}, {}]));
      const total = result.reduce((s, r) => s + r.amount, 0);
      expect(total).toBe(12800);
    });
  });

  describe("不均等割り（口数）", () => {
    test("2口と1口で3000円 → 2000/1000", () => {
      const result = calcWarikan(3000, members([{ shares: 2 }, { shares: 1 }]));
      expect(result[0].amount).toBe(2000);
      expect(result[1].amount).toBe(1000);
    });

    test("3口と1口と1口で5000円 → 3000/1000/1000", () => {
      const result = calcWarikan(5000, members([{ shares: 3 }, { shares: 1 }, { shares: 1 }]));
      expect(result[0].amount).toBe(3000);
      expect(result[1].amount).toBe(1000);
      expect(result[2].amount).toBe(1000);
    });

    test("不均等割りでも合計が保たれる", () => {
      const result = calcWarikan(13500, members([{ shares: 3 }, { shares: 2 }, { shares: 1 }]));
      const total = result.reduce((s, r) => s + r.amount, 0);
      expect(total).toBe(13500);
    });
  });

  describe("名前のフォールバック", () => {
    test("名前が空の場合 '参加者N' になる", () => {
      const result = calcWarikan(1000, members([{ name: "" }, { name: "" }]));
      expect(result[0].name).toBe("参加者1");
      expect(result[1].name).toBe("参加者2");
    });

    test("名前が設定されている場合そのまま返す", () => {
      const result = calcWarikan(1000, members([{ name: "田中" }, { name: "鈴木" }]));
      expect(result[0].name).toBe("田中");
      expect(result[1].name).toBe("鈴木");
    });
  });

  describe("エッジケース", () => {
    test("totalShares が 0 の場合は空配列を返す", () => {
      const result = calcWarikan(1000, [{ id: 1, name: "A", shares: 0 }]);
      expect(result).toEqual([]);
    });
  });
});
