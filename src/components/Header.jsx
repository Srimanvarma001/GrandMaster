import React from "react";
import styles from "./Header.module.css";

export default function Header({ phase, tab, setTab, history, showHistory, setShowHistory, onReset }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.crown}>♔</span>
        <span className={styles.title}>GRANDMASTER</span>
      </div>

      <div className={styles.controls}>
        {phase === "done" && (
          <>
            <button
              className={`${styles.tabBtn} ${tab === "crew" ? styles.active : ""}`}
              onClick={() => setTab("crew")}
            >
              Crew
            </button>
            <button
              className={`${styles.tabBtn} ${tab === "doc" ? styles.active : ""}`}
              onClick={() => setTab("doc")}
            >
              Final doc
            </button>
          </>
        )}

        {history.length > 0 && (
          <button
            className={styles.ghostBtn}
            onClick={() => setShowHistory(!showHistory)}
          >
            History
          </button>
        )}

        {phase !== "input" && (
          <button className={styles.ghostBtn} onClick={onReset}>
            New idea
          </button>
        )}
      </div>
    </header>
  );
}
