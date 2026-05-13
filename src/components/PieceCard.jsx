import React, { useRef, useEffect, useState } from "react";
import styles from "./PieceCard.module.css";

export default function PieceCard({ piece, state, isActive, onStop, isStopped, canStop, onRegenerate, isRegenerating }) {
  const outputRef = useRef(null);
  const isDone = state.status === "done";
  const isIdle = state.status === "idle";
  const isStoppedState = state.status === "stopped" || isStopped;
  const [showRegen, setShowRegen] = useState(false);
  const [regenInput, setRegenInput] = useState("");

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
            color: isActive ? piece.color : isDone ? piece.color : isStoppedState ? "var(--text3)" : "var(--text3)",
          }}
        >
          {isStoppedState ? "⏹" : piece.symbol}
        </span>
        <div className={styles.meta}>
          <div className={styles.name}>{piece.name}</div>
          <div className={styles.role}>{piece.role}</div>
        </div>
        {canStop && (
          <button
            onClick={onStop}
            className={styles.stopBtn}
            title="Stop this agent"
          >
            ⏹
          </button>
        )}
        {isDone && onRegenerate && (
          <button
            onClick={() => setShowRegen(!showRegen)}
            className={styles.regenBtn}
            title="Regenerate this agent"
          >
            ↻
          </button>
        )}
        <div
          className={`${styles.dot} ${isActive ? styles.dotActive : isDone ? styles.dotDone : isStoppedState ? styles.dotDone : ""}`}
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

      {showRegen && (
        <div className={styles.regenArea}>
          <input
            type="text"
            value={regenInput}
            onChange={(e) => setRegenInput(e.target.value)}
            placeholder="Optional: add instructions (e.g. 'focus more on mobile')"
            className={styles.regenInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && regenInput.trim()) {
                onRegenerate(piece.id, regenInput.trim());
                setShowRegen(false);
                setRegenInput("");
              }
            }}
          />
          <button
            onClick={() => {
              onRegenerate(piece.id, regenInput.trim());
              setShowRegen(false);
              setRegenInput("");
            }}
            className={styles.regenSubmit}
            disabled={isRegenerating}
          >
            {isRegenerating ? "..." : "↻"}
          </button>
        </div>
      )}
    </div>
  );
}
