"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

type UuidHistoryItem = {
  uuid: string;
  createdAt: string;
};

type HistoryResponse = {
  total: number;
  collisions: number;
  history: UuidHistoryItem[];
};

type GenerateResponse = {
  uuid: string;
  collision: boolean;
};

// UUID v4: 2^122 possible values
const UUID_SPACE = 2n ** 122n;

function collisionProbability(n: number): string {
  if (n < 2) return "~0%";
  const exponent = -(n * (n - 1)) / (2 * Number(UUID_SPACE));
  const p = 1 - Math.exp(exponent);
  if (p === 0 || p < 1e-30) return "~0%";
  if (p < 1e-10) return `~${p.toExponential(2)}%`;
  return `${(p * 100).toFixed(10).replace(/0+$/, "").replace(/\.$/, "")}%`;
}

export default function UuidToolPage() {
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [myUuids, setMyUuids] = useState<Set<string>>(new Set());
  const [latest, setLatest] = useState<{ uuid: string; collision: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/tools/uuid/history");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HistoryResponse = await res.json();
      setHistoryData(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/uuid/generate");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: GenerateResponse = await res.json();
      setLatest(data);
      setMyUuids((prev) => new Set(prev).add(data.uuid));
      await fetchHistory();
    } catch (e) {
      setError("生成に失敗しました。バックエンドが起動しているか確認してください。");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [fetchHistory]);

  const total = historyData?.total ?? 0;
  const theoProbability = collisionProbability(total);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          ki<span>tt</span>o
        </div>
        <Link href="/" className={styles.backLink}>← ツール一覧</Link>
      </header>

      <div className={styles.toolHeader}>
        <h1 className={styles.toolTitle}>🔑 UUID 衝突チェッカー</h1>
        <p className={styles.toolDesc}>
          ボタンを押すたびに UUID v4 を生成します。<br />
          全ユーザーの生成履歴を共有し、実際に衝突が起きるか確かめてみましょう。
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
              latest.collision
                ? `${styles.latestUuid} ${styles.latestUuidCollision}`
                : styles.latestUuid
            }
          >
            {latest.collision && "💥 衝突！ "}
            {latest.uuid}
          </div>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>累計生成数</div>
          <div className={styles.statValue}>{total.toLocaleString()}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>今セッション</div>
          <div className={styles.statValue}>{myUuids.size.toLocaleString()}</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>衝突数</div>
          <div
            className={
              (historyData?.collisions ?? 0) > 0
                ? `${styles.statValue} ${styles.statValueDanger}`
                : styles.statValue
            }
          >
            {historyData?.collisions ?? 0}
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
          共有履歴（新しい順・最大100件）
          <button className={styles.refreshBtn} onClick={fetchHistory}>
            更新
          </button>
        </div>
        {!historyData || historyData.history.length === 0 ? (
          <div className={styles.emptyState}>
            まだ UUID が生成されていません。
          </div>
        ) : (
          <div className={styles.historyList}>
            {historyData.history.map((item, i) => (
              <div
                key={item.uuid}
                className={
                  myUuids.has(item.uuid)
                    ? `${styles.historyItem} ${styles.historyItemMine}`
                    : styles.historyItem
                }
              >
                <span className={styles.historyIndex}>
                  {total - i}
                </span>
                <span className={styles.historyUuid}>{item.uuid}</span>
                {myUuids.has(item.uuid) && (
                  <span className={styles.mineBadge}>自分</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
