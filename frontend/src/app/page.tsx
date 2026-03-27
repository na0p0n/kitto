"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Category = "すべて" | "生活" | "計算" | "おもしろ" | "仕事";

type Tool = {
  icon: string;
  iconBg: string;
  name: string;
  desc: string;
  badge?: { label: string; type: "new" | "pop" | "soon" };
  category: Exclude<Category, "すべて">;
  href?: string;
  soon?: boolean;
};

const TOOLS: Tool[] = [
  {
    icon: "🔑",
    iconBg: "#EDE9FE",
    name: "UUID 衝突チェッカー",
    desc: "UUID v4 を生成して衝突率を確かめる。",
    badge: { label: "新着", type: "new" },
    category: "おもしろ",
    href: "/tools/uuid",
  },
  {
    icon: "🧮",
    iconBg: "#E1F5EE",
    name: "割り勘計算",
    desc: "不均等割り勘にも対応。幹事の強い味方。",
    badge: { label: "人気", type: "pop" },
    category: "計算",
    href: "/tools/warikan",
  },
  {
    icon: "📅",
    iconBg: "#FAEEDA",
    name: "カウントダウン",
    desc: "〇〇まで何日？シェア用画像も作れる。",
    category: "生活",
    href: "/tools/countdown",
  },
  {
    icon: "🎲",
    iconBg: "#F5F5F5",
    name: "次のツール",
    desc: "準備中です。お楽しみに。",
    badge: { label: "準備中", type: "soon" },
    category: "おもしろ",
    soon: true,
  },
];

const CATEGORIES: Category[] = ["すべて", "生活", "計算", "おもしろ", "仕事"];

function badgeClass(type: "new" | "pop" | "soon") {
  if (type === "new") return styles.badgeNew;
  if (type === "pop") return styles.badgePop;
  return styles.badgeSoon;
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("すべて");

  const filtered =
    activeCategory === "すべて"
      ? TOOLS
      : TOOLS.filter((t) => t.category === activeCategory);

  return (
    <div className={styles.site}>
      <header className={styles.header}>
        <div className={styles.logo}>
          ki<span>tt</span>o
        </div>
        <nav className={styles.headerNav}>
          <span>ツール一覧</span>
          <span>について</span>
        </nav>
      </header>

      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>便利 × おもしろ</p>
        <h1 className={styles.heroTitle}>
          きっといつか
          <br />
          役に立つ。
        </h1>
        <p className={styles.heroSub}>
          ちょっと便利で、ちょっと面白い。そんなツールをゆるく集めました。
        </p>
      </section>

      <div className={styles.filterBar}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.tab} ${activeCategory === cat ? styles.tabActive : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.toolsGrid}>
        {filtered.map((tool) => (
          <a
            key={tool.name}
            className={`${styles.toolCard} ${tool.soon ? styles.toolCardSoon : ""}`}
            href={tool.soon ? undefined : tool.href}
          >
            <div className={styles.toolIcon} style={{ background: tool.iconBg }}>
              {tool.icon}
            </div>
            <div className={styles.toolName}>{tool.name}</div>
            <div className={styles.toolDesc}>{tool.desc}</div>
            {tool.badge && (
              <span className={`${styles.toolBadge} ${badgeClass(tool.badge.type)}`}>
                {tool.badge.label}
              </span>
            )}
          </a>
        ))}
      </div>

      <footer className={styles.footer}>
        <span>© 2025 Kitto</span>
        <a href="https://x.com/" target="_blank" rel="noopener noreferrer">
          X (Twitter)
        </a>
      </footer>
    </div>
  );
}
