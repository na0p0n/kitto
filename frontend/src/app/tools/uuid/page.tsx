"use client";

import { useState, useCallback } from "react";
import styles from "./page.module.css";

type UuidEntry = {
  uuid: string;
  isCollision: boolean;
};

// UUID v4: 2^122 possible values
const UUID_SPACE = 2n ** 122n;

/**
 * Birthday problem approximation:
 * P(collision) ≈ 1 - e^(-n*(n-1) / (2 * N))
 * For display, we show as a percentage with enough precision.
 */
function collisionProbability(n: number): string {
  if (n < 2) return "0%";
  // Use log to avoid bigint float issues: -n*(n-1) / (2 * 2^122)
  const exponent = -(n * (n - 1)) / (2 * Number(UUID_SPACE));
  const p = 1 - Math.exp(exponent);
  if (p === 0) return "~0%";
  // Show in scientific notation when extremely small
  if (p < 1e-10) return `~${p.toExponential(2)}%`;
  return `${(p * 100).toFixed(10).replace(/0+$/, "").replace(/\.$/, "")}%`;
}

// 相対URLで呼び出す（本番: nginx が /api/* をバックエンドへルーティング）
// ローカル開発: next.config.ts の rewrites が /api/* をバックエンドへプロキシ
const API_BASE = "";

export default function UuidToolPage() {
  const [history, setHistory] = useState<UuidEntry[]>([]);
  const [seenSet, setSeenSet] = useState<Set<string>>(new Set());
  const [collisionCount, setCollisionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/tools/uuid/generate`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { uuid: string } = await res.json();
      const { uuid } = data;

      const isCollision = seenSet.has(uuid);

      setSeenSet((prev) => new Set(prev).add(uuid));
      setHistory((prev) => [{ uuid, isCollision }, ...prev]);
      if (isCollision) setCollisionCount((c) => c + 1);
    } catch (e) {
      setError("生成に失敗しました。バックエンドが起動しているか確認してください。");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [seenSet]);

  const total = history.length;
  const actualRate =
    total === 0
      ? "—"
      : collisionCount === 0
        ? "0 / " + total
        : `${collisionCount} / ${total}`;
  const theoProbability = collisionProbability(total);
  const latest = history[0] ?? null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          ki<span>tt</span>o
        </div>
        <a href="/" className={styles.backLink}>← ツール一覧</a>
      </header>

      <div className={styles.toolHeader}>
        <h1 className={styles.toolTitle}>🔑 UUID 衝突チェッカー</h1>
        <p className={styles.toolDesc}>
          ボタンを押すたびに UUID v4 を生成します。<br />
          理論上衝突はほぼ起きませんが、実際に試して確かめてみましょう。
        </p>
      </div>

      <div className={styles.generateSection}>
        <button
          className={styles.generateBtn}
          onClick={generate}
          disabled={loading}
        >
          {loading ? "生成中..." : "UUID を生成する"}
        </button>

        {error && <p style={{ fontSize: 13, color: "#DC2626" }}>{error}</p>}

        {latest && (
          <div
            className={
              latest.isCollision
                ? `${styles.latestUuid} ${styles.latestUuidCollision}`
                : styles.latestUuid
            }
          >
            {latest.isCollision && "💥 衝突！ "}
            {latest.uuid}
          </div>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>生成数</div>
          <div className={styles.statValue}>{total.toLocaleString()}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>衝突数</div>
          <div
            className={
              collisionCount > 0
                ? `${styles.statValue} ${styles.statValueDanger}`
                : styles.statValue
            }
          >
            {collisionCount}
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>実際の衝突率</div>
          <div className={styles.statValue} style={{ fontSize: 16 }}>
            {actualRate}
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>理論上の衝突確率</div>
          <div className={styles.statValue} style={{ fontSize: 16 }}>
            {theoProbability}
          </div>
          <div className={styles.statSub}>誕生日問題による推定</div>
        </div>
      </div>

      <div className={styles.historySection}>
        <div className={styles.historyHeader}>
          履歴（新しい順）
        </div>
        {history.length === 0 ? (
          <div className={styles.emptyState}>
            まだ UUID が生成されていません。
          </div>
        ) : (
          <div className={styles.historyList}>
            {history.map((entry, i) => (
              <div
                key={`${entry.uuid}-${i}`}
                className={
                  entry.isCollision
                    ? `${styles.historyItem} ${styles.historyItemCollision}`
                    : styles.historyItem
                }
              >
                <span className={styles.historyIndex}>
                  {total - i}
                </span>
                <span className={styles.historyUuid}>{entry.uuid}</span>
                {entry.isCollision && (
                  <span className={styles.collisionBadge}>衝突</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
