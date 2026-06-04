"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

type QuestionSummary = {
  id: number;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
};

type Progress = Record<number, { correct: boolean }>;

const CATEGORY_LABELS: Record<string, string> = {
  NULL_SAFETY: "Null安全",
  KOTLIN_BASICS: "Kotlin基礎",
  SPRING_ANNOTATIONS: "Springアノテーション",
  SPRING_KOTLIN: "Spring×Kotlin",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "初級",
  MEDIUM: "中級",
  HARD: "上級",
};

export default function KotlinQuizListPage() {
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [progress, setProgress] = useState<Progress>({});
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/tools/kotlin-quiz/questions`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: QuestionSummary[] = await res.json();
        setQuestions(data);
      } catch {
        setError("問題の取得に失敗しました。バックエンドが起動しているか確認してください。");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();

    const saved = localStorage.getItem("kotlin-quiz-progress");
    if (saved) {
      setProgress(JSON.parse(saved) as Progress);
    }
  }, []);

  const answeredCount = Object.keys(progress).length;
  const correctCount = Object.values(progress).filter((p) => p.correct).length;
  const categories = ["ALL", ...Array.from(new Set(questions.map((q) => q.category)))];
  const filtered = filter === "ALL" ? questions : questions.filter((q) => q.category === filter);

  const resetProgress = () => {
    localStorage.removeItem("kotlin-quiz-progress");
    setProgress({});
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          ki<span>tt</span>o
        </div>
        <Link href="/" className={styles.backLink}>
          ← ツール一覧
        </Link>
      </header>

      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>🐛 バグ修正ゲーム</h1>
        <p className={styles.heroDesc}>
          Kotlin &amp; Spring Boot のコードに潜むバグを発見して修正しよう！
        </p>

        {answeredCount > 0 && (
          <div className={styles.scoreBar}>
            <div className={styles.scoreItem}>
              <span className={styles.scoreNum}>{answeredCount}</span>
              <span className={styles.scoreLabel}>/ {questions.length} 解答済</span>
            </div>
            <div className={styles.scoreDivider} />
            <div className={styles.scoreItem}>
              <span className={styles.scoreNum}>{correctCount}</span>
              <span className={styles.scoreLabel}>正解</span>
            </div>
            <div className={styles.scoreDivider} />
            <div className={styles.scoreItem}>
              <span className={styles.scoreNum}>
                {Math.round((correctCount / answeredCount) * 100)}%
              </span>
              <span className={styles.scoreLabel}>正解率</span>
            </div>
            <button className={styles.resetBtn} onClick={resetProgress}>
              リセット
            </button>
          </div>
        )}
      </div>

      <div className={styles.filterBar}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${filter === cat ? styles.filterBtnActive : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat === "ALL" ? "すべて" : (CATEGORY_LABELS[cat] ?? cat)}
          </button>
        ))}
      </div>

      {loading && <p className={styles.loading}>読み込み中...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.grid}>
        {filtered.map((q) => {
          const p = progress[q.id];
          return (
            <Link
              key={q.id}
              href={`/tools/kotlin-quiz/${q.id}`}
              className={`${styles.card} ${p ? (p.correct ? styles.cardCorrect : styles.cardWrong) : ""}`}
            >
              <div className={styles.cardHeader}>
                <span
                  className={`${styles.diffBadge} ${styles[`diff${q.difficulty}`]}`}
                >
                  {DIFFICULTY_LABELS[q.difficulty]}
                </span>
                {p && (
                  <span className={styles.statusIcon}>{p.correct ? "✅" : "❌"}</span>
                )}
              </div>
              <div className={styles.cardNum}>Q{q.id}</div>
              <div className={styles.cardTitle}>{q.title}</div>
              <div className={styles.cardCategory}>
                {CATEGORY_LABELS[q.category] ?? q.category}
              </div>
            </Link>
          );
        })}
      </div>

      <footer className={styles.footer}>
        <span>© 2025 Kitto</span>
      </footer>
    </div>
  );
}
