"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { calcWarikan, type Member } from "@/lib/warikan";

let nextId = 1;

export default function WarikanPage() {
  const [total, setTotal] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([
    { id: nextId++, name: "", shares: 1 },
    { id: nextId++, name: "", shares: 1 },
  ]);

  const addMember = useCallback(() => {
    setMembers((prev) => [...prev, { id: nextId++, name: "", shares: 1 }]);
  }, []);

  const removeMember = useCallback((id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateName = useCallback((id: number, name: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
  }, []);

  const updateShares = useCallback((id: number, shares: number) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, shares: Math.max(1, shares) } : m)));
  }, []);

  const totalNum = parseInt(total.replace(/,/g, ""), 10);
  const isValid = !isNaN(totalNum) && totalNum > 0 && members.length >= 2;
  const results = isValid ? calcWarikan(totalNum, members) : [];
  const totalShares = members.reduce((s, m) => s + m.shares, 0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          ki<span>tt</span>o
        </div>
        <Link href="/" className={styles.backLink}>← ツール一覧</Link>
      </header>

      <div className={styles.toolHeader}>
        <h1 className={styles.toolTitle}>🧮 割り勘計算</h1>
        <p className={styles.toolDesc}>
          人数・口数を設定して不均等割り勘にも対応。10円単位で丸めます。
        </p>
      </div>

      <div className={styles.inputSection}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>合計金額（円）</label>
          <input
            className={styles.totalInput}
            type="number"
            min="0"
            placeholder="例: 12800"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>参加者</label>
          <div className={styles.memberList}>
            {members.map((m, idx) => (
              <div key={m.id} className={styles.memberRow}>
                <span className={styles.memberNum}>{idx + 1}</span>
                <input
                  className={styles.nameInput}
                  type="text"
                  placeholder={`参加者${idx + 1}`}
                  value={m.name}
                  onChange={(e) => updateName(m.id, e.target.value)}
                />
                <div className={styles.sharesControl}>
                  <button
                    className={styles.sharesBtn}
                    onClick={() => updateShares(m.id, m.shares - 1)}
                    disabled={m.shares <= 1}
                  >−</button>
                  <span className={styles.sharesValue}>{m.shares}口</span>
                  <button
                    className={styles.sharesBtn}
                    onClick={() => updateShares(m.id, m.shares + 1)}
                  >＋</button>
                </div>
                {members.length > 2 && (
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeMember(m.id)}
                  >×</button>
                )}
              </div>
            ))}
          </div>
          <button className={styles.addBtn} onClick={addMember}>
            ＋ 参加者を追加
          </button>
        </div>
      </div>

      {isValid && (
        <div className={styles.resultSection}>
          <div className={styles.resultHeader}>計算結果</div>
          <div className={styles.resultSummary}>
            合計 <strong>{totalNum.toLocaleString()}円</strong> ÷ {members.length}人（計{totalShares}口）
          </div>
          <div className={styles.resultList}>
            {results.map((r) => (
              <div key={r.id} className={styles.resultRow}>
                <span className={styles.resultName}>{r.name}</span>
                <span className={styles.resultShares}>
                  {members.find((m) => m.id === r.id)?.shares}口
                </span>
                <span className={styles.resultAmount}>
                  {r.amount.toLocaleString()}<span className={styles.yen}>円</span>
                </span>
              </div>
            ))}
          </div>
          <div className={styles.resultCheck}>
            合計確認: {results.reduce((s, r) => s + r.amount, 0).toLocaleString()}円
            {results.reduce((s, r) => s + r.amount, 0) === totalNum
              ? " ✓"
              : ` （差額 ${(results.reduce((s, r) => s + r.amount, 0) - totalNum).toLocaleString()}円）`}
          </div>
        </div>
      )}
    </div>
  );
}
