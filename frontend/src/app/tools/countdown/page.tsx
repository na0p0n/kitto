"use client";

import { useState, useEffect, useCallback, useReducer } from "react";
import Link from "next/link";
import styles from "./page.module.css";

type CountdownEvent = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
};

function calcTimeLeft(dateStr: string): TimeLeft {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function loadEvents(): CountdownEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("kitto_countdown_events");
    return raw ? (JSON.parse(raw) as CountdownEvent[]) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: CountdownEvent[]) {
  localStorage.setItem("kitto_countdown_events", JSON.stringify(events));
}

export default function CountdownPage() {
  const [events, setEvents] = useState<CountdownEvent[]>(() => loadEvents());
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [activeId, setActiveId] = useState<string | null>(() => {
    const loaded = loadEvents();
    return loaded.length > 0 ? loaded[0].id : null;
  });
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const timer = setInterval(forceUpdate, 1000);
    return () => clearInterval(timer);
  }, []);

  const addEvent = useCallback(() => {
    if (!newName.trim() || !newDate) return;
    const event: CountdownEvent = {
      id: Date.now().toString(),
      name: newName.trim(),
      date: newDate,
    };
    const updated = [event, ...events];
    setEvents(updated);
    saveEvents(updated);
    setActiveId(event.id);
    setNewName("");
    setNewDate("");
  }, [newName, newDate, events]);

  const removeEvent = useCallback(
    (id: string) => {
      const updated = events.filter((e) => e.id !== id);
      setEvents(updated);
      saveEvents(updated);
      if (activeId === id) setActiveId(updated.length > 0 ? updated[0].id : null);
    },
    [events, activeId]
  );

  const activeEvent = events.find((e) => e.id === activeId) ?? null;
  const timeLeft = activeEvent ? calcTimeLeft(activeEvent.date) : null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>
          ki<span>tt</span>o
        </div>
        <Link href="/" className={styles.backLink}>← ツール一覧</Link>
      </header>

      <div className={styles.toolHeader}>
        <h1 className={styles.toolTitle}>📅 カウントダウン</h1>
        <p className={styles.toolDesc}>
          イベントまでの残り時間をリアルタイムで表示。複数のイベントを登録できます。
        </p>
      </div>

      {/* Active countdown display */}
      <div className={styles.displaySection}>
        {activeEvent && timeLeft ? (
          <>
            <div className={styles.eventName}>{activeEvent.name}</div>
            <div className={styles.eventDate}>
              {new Date(activeEvent.date + "T00:00:00").toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {timeLeft.isPast ? (
              <div className={styles.pastMessage}>このイベントはすでに過ぎています。</div>
            ) : (
              <>
                <div className={styles.daysDisplay}>
                  <span className={styles.daysNum}>{timeLeft.days}</span>
                  <span className={styles.daysLabel}>日</span>
                </div>
                <div className={styles.timeDisplay}>
                  <div className={styles.timeUnit}>
                    <span className={styles.timeNum}>{pad(timeLeft.hours)}</span>
                    <span className={styles.timeLabel}>時間</span>
                  </div>
                  <span className={styles.timeSep}>:</span>
                  <div className={styles.timeUnit}>
                    <span className={styles.timeNum}>{pad(timeLeft.minutes)}</span>
                    <span className={styles.timeLabel}>分</span>
                  </div>
                  <span className={styles.timeSep}>:</span>
                  <div className={styles.timeUnit}>
                    <span className={styles.timeNum}>{pad(timeLeft.seconds)}</span>
                    <span className={styles.timeLabel}>秒</span>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className={styles.emptyDisplay}>
            イベントを登録するとここにカウントダウンが表示されます。
          </div>
        )}
      </div>

      {/* Add event */}
      <div className={styles.addSection}>
        <div className={styles.addRow}>
          <input
            className={styles.nameInput}
            type="text"
            placeholder="イベント名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addEvent()}
          />
          <input
            className={styles.dateInput}
            type="date"
            min={today}
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <button
            className={styles.addBtn}
            onClick={addEvent}
            disabled={!newName.trim() || !newDate}
          >
            追加
          </button>
        </div>
      </div>

      {/* Event list */}
      {events.length > 0 && (
        <div className={styles.eventList}>
          <div className={styles.listHeader}>登録済みイベント</div>
          {events.map((e) => {
            const tl = calcTimeLeft(e.date);
            return (
              <div
                key={e.id}
                className={`${styles.eventItem} ${activeId === e.id ? styles.eventItemActive : ""}`}
                onClick={() => setActiveId(e.id)}
              >
                <div className={styles.eventItemLeft}>
                  <div className={styles.eventItemName}>{e.name}</div>
                  <div className={styles.eventItemDate}>
                    {new Date(e.date + "T00:00:00").toLocaleDateString("ja-JP")}
                  </div>
                </div>
                <div className={styles.eventItemRight}>
                  {tl.isPast ? (
                    <span className={styles.pastBadge}>終了</span>
                  ) : (
                    <span className={styles.daysLeft}>{tl.days}日前</span>
                  )}
                  <button
                    className={styles.removeBtn}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      removeEvent(e.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
