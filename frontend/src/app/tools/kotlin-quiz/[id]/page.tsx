"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";

type QuizOption = {
  id: string;
  text: string;
};

type QuestionDetail = {
  id: number;
  title: string;
  description: string;
  buggyCode: string;
  options: QuizOption[];
  hint: string;
  difficulty: string;
  category: string;
  totalQuestions: number;
};

type AnswerResult = {
  correct: boolean;
  correctOptionId: string;
  explanation: string;
};

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

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = parseInt(params.id as string, 10);

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isNaN(questionId)) return;
    const fetchQuestion = async () => {
      setLoading(true);
      setSelected(null);
      setResult(null);
      setShowHint(false);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/tools/kotlin-quiz/questions/${questionId}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: QuestionDetail = await res.json();
        setQuestion(data);
      } catch {
        setError("問題の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [questionId]);

  const handleSubmit = async () => {
    if (!selected || !question || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/tools/kotlin-quiz/questions/${questionId}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionId: selected }),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AnswerResult = await res.json();
      setResult(data);

      const saved = localStorage.getItem("kotlin-quiz-progress") ?? "{}";
      const prog = JSON.parse(saved) as Record<number, { correct: boolean }>;
      prog[questionId] = { correct: data.correct };
      localStorage.setItem("kotlin-quiz-progress", JSON.stringify(prog));
    } catch {
      setError("回答の送信に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  const goTo = (id: number) => {
    router.push(`/tools/kotlin-quiz/${id}`);
  };

  const getOptionClass = (optId: string) => {
    if (!result) {
      return selected === optId ? `${styles.option} ${styles.optionSelected}` : styles.option;
    }
    if (optId === result.correctOptionId) return `${styles.option} ${styles.optionCorrect}`;
    if (optId === selected && !result.correct) return `${styles.option} ${styles.optionWrong}`;
    return `${styles.option} ${styles.optionDisabled}`;
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingScreen}>読み込み中...</div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className={styles.page}>
        <div className={styles.errorScreen}>
          <p>{error ?? "問題が見つかりません。"}</p>
          <Link href="/tools/kotlin-quiz" className={styles.backLinkLarge}>
            ← 問題一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          ki<span>tt</span>o
        </div>
        <Link href="/tools/kotlin-quiz" className={styles.backLink}>
          ← 問題一覧
        </Link>
      </header>

      <div className={styles.container}>
        <div className={styles.meta}>
          <span className={`${styles.diffBadge} ${styles[`diff${question.difficulty}`]}`}>
            {DIFFICULTY_LABELS[question.difficulty]}
          </span>
          <span className={styles.categoryBadge}>
            {CATEGORY_LABELS[question.category] ?? question.category}
          </span>
          <span className={styles.questionNum}>
            Q{question.id} / {question.totalQuestions}
          </span>
        </div>

        <h1 className={styles.title}>{question.title}</h1>
        <p className={styles.description}>{question.description}</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <span className={styles.codeLang}>🐛 バグのあるコード (Kotlin)</span>
          </div>
          <pre className={styles.code}>
            <code>{question.buggyCode}</code>
          </pre>
        </div>

        {!result && (
          <div className={styles.hintArea}>
            <button
              className={styles.hintToggle}
              onClick={() => setShowHint((v) => !v)}
            >
              {showHint ? "💡 ヒントを隠す" : "💡 ヒントを見る"}
            </button>
            {showHint && <p className={styles.hint}>{question.hint}</p>}
          </div>
        )}

        <div className={styles.optionsLabel}>正しい修正はどれですか？</div>
        <div className={styles.options}>
          {question.options.map((opt) => (
            <button
              key={opt.id}
              className={getOptionClass(opt.id)}
              onClick={() => !result && setSelected(opt.id)}
              disabled={!!result}
            >
              <span className={styles.optionId}>{opt.id}</span>
              <code className={styles.optionCode}>{opt.text}</code>
            </button>
          ))}
        </div>

        {!result && (
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!selected || submitting}
          >
            {submitting ? "送信中..." : "答えを送信する"}
          </button>
        )}

        {result && (
          <div
            className={`${styles.resultPanel} ${result.correct ? styles.resultCorrect : styles.resultWrong}`}
          >
            <div className={styles.resultHeader}>
              {result.correct ? "✅ 正解！すばらしい！" : "❌ 不正解...もう一度考えてみよう"}
            </div>
            <div className={styles.explanation}>
              {result.explanation.split("\n").map((line, i) => (
                <p key={i} className={line === "" ? styles.explanationSpacer : styles.explanationLine}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className={styles.navigation}>
            {question.id > 1 && (
              <button className={styles.navBtn} onClick={() => goTo(question.id - 1)}>
                ← 前の問題
              </button>
            )}
            <Link href="/tools/kotlin-quiz" className={styles.navBtnSecondary}>
              一覧へ
            </Link>
            {question.id < question.totalQuestions && (
              <button className={styles.navBtn} onClick={() => goTo(question.id + 1)}>
                次の問題 →
              </button>
            )}
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <span>© 2025 Kitto</span>
      </footer>
    </div>
  );
}
