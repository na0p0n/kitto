"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

const REGIONS = [
  { id: "hokkaido", name: "北海道", prefectures: ["北海道"] },
  { id: "tohoku", name: "東北", prefectures: ["青森", "岩手", "宮城", "秋田", "山形", "福島"] },
  { id: "kanto", name: "関東", prefectures: ["茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川"] },
  { id: "chubu", name: "中部", prefectures: ["新潟", "富山", "石川", "福井", "山梨", "長野", "岐阜", "静岡", "愛知"] },
  { id: "kinki", name: "近畿", prefectures: ["三重", "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山"] },
  { id: "chugoku", name: "中国", prefectures: ["鳥取", "島根", "岡山", "広島", "山口"] },
  { id: "shikoku", name: "四国", prefectures: ["徳島", "香川", "愛媛", "高知"] },
  { id: "kyushu", name: "九州・沖縄", prefectures: ["福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄"] },
];

const SLOT_CHARS = ["北", "南", "東", "西", "駅", "店", "道", "路", "山", "川", "海", "丘", "宮", "本"];
const SPIN_TICKS = 18;
const SPIN_INTERVAL_MS = 80;

type Chain = { id: number; name: string; category: string; emoji: string | null };
type StoreResult = {
  id: number;
  chainId: number;
  chainName: string;
  chainEmoji: string | null;
  name: string;
  prefecture: string;
  address: string;
  lat: number | null;
  lng: number | null;
  region: string;
};

function regionState(region: (typeof REGIONS)[0], selected: Set<string>) {
  const total = region.prefectures.length;
  const count = region.prefectures.filter((p) => selected.has(p)).length;
  if (count === 0) return "none";
  if (count === total) return "all";
  return "partial";
}

export default function DestinationRoulettePage() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [selectedPrefs, setSelectedPrefs] = useState(new Set<string>());
  const [count, setCount] = useState<number | null>(null);
  const [result, setResult] = useState<StoreResult | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [slots, setSlots] = useState(["？", "？", "？"]);
  const [error, setError] = useState<string | null>(null);
  const spinRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${API}/api/destinations/chains`)
      .then((r) => r.json())
      .then(setChains)
      .catch(() => {});
  }, []);

  const refreshCount = useCallback(() => {
    if (countRef.current) clearTimeout(countRef.current);
    countRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (selectedChain) params.set("chainId", String(selectedChain));
      if (selectedPrefs.size > 0) params.set("prefectures", Array.from(selectedPrefs).join(","));
      fetch(`${API}/api/destinations/count?${params}`)
        .then((r) => r.json())
        .then((d) => setCount(d.count))
        .catch(() => setCount(null));
    }, 400);
  }, [selectedChain, selectedPrefs]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const toggleRegion = (region: (typeof REGIONS)[0]) => {
    setSelectedPrefs((prev) => {
      const next = new Set(prev);
      if (regionState(region, prev) === "all") {
        region.prefectures.forEach((p) => next.delete(p));
      } else {
        region.prefectures.forEach((p) => next.add(p));
      }
      return next;
    });
    setResult(null);
  };

  const togglePref = (pref: string) => {
    setSelectedPrefs((prev) => {
      const next = new Set(prev);
      next.has(pref) ? next.delete(pref) : next.add(pref);
      return next;
    });
    setResult(null);
  };

  const spin = () => {
    if (spinning || count === 0) return;
    setSpinning(true);
    setResult(null);
    setError(null);

    let tick = 0;
    spinRef.current = setInterval(() => {
      setSlots([
        SLOT_CHARS[Math.floor(Math.random() * SLOT_CHARS.length)],
        SLOT_CHARS[Math.floor(Math.random() * SLOT_CHARS.length)],
        SLOT_CHARS[Math.floor(Math.random() * SLOT_CHARS.length)],
      ]);
      tick++;
      if (tick > SPIN_TICKS) {
        clearInterval(spinRef.current!);
        fetchRandom();
      }
    }, SPIN_INTERVAL_MS);
  };

  const fetchRandom = () => {
    const params = new URLSearchParams();
    if (selectedChain) params.set("chainId", String(selectedChain));
    if (selectedPrefs.size > 0) params.set("prefectures", Array.from(selectedPrefs).join(","));
    fetch(`${API}/api/destinations/random?${params}`)
      .then((r) => {
        if (r.status === 404) throw new Error("no-stores");
        return r.json();
      })
      .then((data: StoreResult) => {
        setResult(data);
        setSlots(["✓", "✓", "✓"]);
      })
      .catch((e) => {
        if (e.message === "no-stores") setError("この条件に該当する店舗がありません");
        else setError("エラーが発生しました");
        setSlots(["？", "？", "？"]);
      })
      .finally(() => setSpinning(false));
  };

  const mapsUrl = result
    ? result.lat && result.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${result.lat},${result.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.address)}`
    : "";

  const categories = [...new Set(chains.map((c) => c.category))];

  return (
    <div className={styles.page}>
      <div className={styles.roadBg} />
      <div className={styles.glow} />

      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.logo}>ki<span>tt</span>o</div>
          <Link href="/" className={styles.backLink}>← ツール一覧</Link>
        </header>

        <div className={styles.toolHeader}>
          <div className={styles.eyebrow}>✦ DESTINATION ROULETTE ✦</div>
          <h1 className={styles.title}>どこ行く？</h1>
          <p className={styles.desc}>突然の旅の目的地、ここで決めよ</p>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>① チェーンを選ぶ</div>
          {categories.length === 0 ? (
            <div className={styles.loading}>読み込み中...</div>
          ) : (
            categories.map((cat) => (
              <div key={cat} className={styles.categoryGroup}>
                <div className={styles.categoryLabel}>{cat}</div>
                <div className={styles.chips}>
                  {chains.filter((c) => c.category === cat).map((chain) => (
                    <button
                      key={chain.id}
                      className={`${styles.chip} ${selectedChain === chain.id ? styles.chipActive : ""}`}
                      onClick={() => { setSelectedChain(selectedChain === chain.id ? null : chain.id); setResult(null); }}
                    >
                      {chain.emoji} {chain.name}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
          {!selectedChain && <div className={styles.hint}>※ 選ばない場合は全チェーンから抽選</div>}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>② エリアで絞る（任意）</div>
          <div className={styles.filterMeta}>
            <span className={styles.selectedCount}>
              {selectedPrefs.size === 0 ? "全国" : `${selectedPrefs.size}都道府県を選択中`}
            </span>
            {selectedPrefs.size > 0 && (
              <button className={styles.clearBtn} onClick={() => { setSelectedPrefs(new Set()); setResult(null); }}>
                クリア
              </button>
            )}
          </div>
          <div className={styles.regionList}>
            {REGIONS.map((region) => {
              const state = regionState(region, selectedPrefs);
              return (
                <div key={region.id} className={styles.regionBlock}>
                  <button className={styles.regionHeader} onClick={() => toggleRegion(region)}>
                    <span className={`${styles.checkbox} ${state !== "none" ? styles.checkboxActive : ""} ${state === "all" ? styles.checkboxAll : ""}`}>
                      {state === "all" ? "✓" : state === "partial" ? "−" : ""}
                    </span>
                    <span className={`${styles.regionName} ${state !== "none" ? styles.regionNameActive : ""}`}>
                      {region.name}
                    </span>
                    <span className={styles.regionCount}>
                      {region.prefectures.filter((p) => selectedPrefs.has(p)).length}/{region.prefectures.length}
                    </span>
                  </button>
                  <div className={styles.prefChips}>
                    {region.prefectures.map((pref) => (
                      <button
                        key={pref}
                        className={`${styles.chip} ${styles.chipSmall} ${selectedPrefs.has(pref) ? styles.chipActive : ""}`}
                        onClick={() => togglePref(pref)}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className={styles.storeCount}>
          対象店舗：
          <span className={count === 0 ? styles.countZero : styles.countPositive}>
            {count === null ? "—" : count}
          </span>
          {" "}件
        </div>

        <div className={styles.slotRow}>
          {slots.map((s, i) => (
            <div key={i} className={`${styles.slot} ${spinning ? styles.slotSpin : ""} ${result ? styles.slotResult : ""}`}>
              {s}
            </div>
          ))}
        </div>

        <div className={styles.spinWrap}>
          <button
            onClick={spin}
            disabled={spinning || count === 0}
            className={`${styles.spinBtn} ${spinning || count === 0 ? styles.spinBtnDisabled : ""}`}
          >
            {spinning ? "抽選中..." : "🎲 決める！"}
          </button>
        </div>

        {error && !spinning && <div className={styles.errorMsg}>{error}</div>}

        {result && !spinning && (
          <div className={styles.resultCard}>
            <div className={styles.resultLabel}>✦ 目的地決定 ✦</div>
            <div className={styles.resultMeta}>
              <span className={styles.resultChainBadge}>{result.chainEmoji} {result.chainName}</span>
              <span className={styles.resultRegion}>{result.prefecture} · {result.region}</span>
            </div>
            <div className={styles.resultName}>{result.name}</div>
            <div className={styles.resultAddress}>{result.address}</div>
            <div className={styles.resultActions}>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.mapsBtn}>
                🗺 Googleマップで開く
              </a>
              <button onClick={spin} className={styles.retryBtn}>🔄 もう一回</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
