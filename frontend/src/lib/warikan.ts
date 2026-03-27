export type Member = {
  id: number;
  name: string;
  shares: number;
};

export type WarikanResult = {
  id: number;
  name: string;
  amount: number;
};

/**
 * 合計金額を口数に応じて分配する。
 * 各人の金額は10円単位に切り捨て、端数は最大口数の人に加算する。
 */
export function calcWarikan(total: number, members: Member[]): WarikanResult[] {
  const totalShares = members.reduce((s, m) => s + m.shares, 0);
  if (totalShares === 0) return [];

  const results = members.map((m) => ({
    id: m.id,
    name: m.name || `参加者${m.id}`,
    raw: (total * m.shares) / totalShares,
    amount: 0,
  }));

  let distributed = 0;
  results.forEach((r) => {
    r.amount = Math.floor(r.raw / 10) * 10;
    distributed += r.amount;
  });

  const remainder = total - distributed;
  if (remainder > 0) {
    const maxIdx = results.reduce((best, r, i) => (r.raw > results[best].raw ? i : best), 0);
    results[maxIdx].amount += remainder;
  }

  return results.map(({ id, name, amount }) => ({ id, name, amount }));
}
