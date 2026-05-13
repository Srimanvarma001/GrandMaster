import React from "react";
import styles from "./Header.module.css";

export default function Header({ phase, tab, setTab, history, showHistory, setShowHistory, onReset }) {
  return (
    <header className={styles.header}>
      <div className={styles.logoGroup}>
        <span className={styles.crown}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15 6L19 5L18 9L22 11L18 13L19 17L15 16L12 21L9 16L5 17L6 13L2 11L6 9L5 5L9 6L12 2Z" />
          </svg>
        </span>
        <div className={styles.logoText}>
          <span className={styles.title}>GRANDMASTER</span>
          <span className={styles.tagline}>Multi-Agent Brief Architect</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {phase === "done" && (
          <div className={styles.tabGroup}>
            <button
              className={`${styles.tabBtn} ${tab === "crew" ? styles.active : ""}`}
              onClick={() => setTab("crew")}
            >
              <span className={styles.tabDot} data-active={tab === "crew"} />
              Crew Output
            </button>
            <button
              className={`${styles.tabBtn} ${tab === "doc" ? styles.active : ""}`}
              onClick={() => setTab("doc")}
            >
              <span className={styles.tabDot} data-active={tab === "doc"} />
              Final Brief
            </button>
          </div>
        )}

        <div className={styles.divider} />

        {history.length > 0 && (
          <button
            className={`${styles.ghostBtn} ${showHistory ? styles.activeGhost : ""}`}
            onClick={() => setShowHistory(!showHistory)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            History
            <span className={styles.badge}>{history.length}</span>
          </button>
        )}

        {phase !== "input" && (
          <button className={styles.ghostBtn} onClick={onReset}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            New Idea
          </button>
        )}
      </nav>
    </header>
  );
}