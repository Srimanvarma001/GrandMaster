import React, { useRef, useEffect } from "react";
import styles from "./PieceCard.module.css";

export default function PieceCard({ piece, state, isActive }) {
  const outputRef = useRef(null);
  const isDone = state.status === "done";
  const isIdle = state.status === "idle";

  useEffect(() => {
    if (isActive && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  });

  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : ""} ${isDone ? styles.done : ""}`}
      style={{
        "--piece-color": piece.color,
      }}
    >
      <div className={styles.cardHeader}>
        <span
          className={styles.symbol}
          style={{
            color: isActive ? piece.color : isDone ? piece.color : "var(--text3)",
          }}
        >
          {piece.symbol}
        </span>
        <div className={styles.meta}>
          <div className={styles.name}>{piece.name}</div>
          <div className={styles.role}>{piece.role}</div>
        </div>
        <div
          className={`${styles.dot} ${isActive ? styles.dotActive : isDone ? styles.dotDone : ""}`}
          style={isActive ? { background: piece.color } : {}}
        />
      </div>

      <div
        ref={outputRef}
        className={`${styles.output} ${isIdle ? styles.idle : ""}`}
      >
        {state.output ? (
          <>
            {state.output}
            {isActive && <span className={styles.cursor}>▊</span>}
          </>
        ) : (
          <span className={styles.placeholder}>
            {isIdle ? "Waiting..." : "Starting..."}
          </span>
        )}
      </div>
    </div>
  );
}
