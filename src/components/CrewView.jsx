import React from "react";
import { PIECES } from "../utils/pieces";
import PieceCard from "./PieceCard";
import styles from "./CrewView.module.css";

export default function CrewView({ idea, states, activeId, phase, onStopPiece, stoppedIds, onRegenerate, isPaused, onTogglePause }) {
  const doneCount = PIECES.filter((p) => states[p.id]?.status === "done").length;
  const activePiece = PIECES.find((p) => p.id === activeId);

  return (
    <div className={styles.wrap}>
      {idea && (
        <div className={styles.ideaTag}>"{idea}"</div>
      )}

      {(phase === "running" || phase === "paused") && (
        <div className={styles.progressWrap}>
          <div className={styles.progressInfo}>
            <span>
              {isPaused ? "⏸ Workflow Paused" : activePiece
                ? `${activePiece.symbol} ${activePiece.name} thinking...`
                : "Preparing..."}
            </span>
            <span>
              {doneCount}/{PIECES.length}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(doneCount / PIECES.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {phase === "running" && (
        <button onClick={onTogglePause} className={styles.pauseBtn} title="Pause Workflow">
          ⏸ Hold
        </button>
      )}

      {phase === "paused" && (
        <div className={styles.pauseControls}>
          <button onClick={onTogglePause} className={styles.resumeBtn} title="Resume Workflow">
            ▶ Resume
          </button>
        </div>
      )}

      <div className={styles.grid}>
        {PIECES.map((piece) => (
          <PieceCard
            key={piece.id}
            piece={piece}
            state={states[piece.id] || { status: "idle", output: "" }}
            isActive={activeId === piece.id}
            onStop={() => onStopPiece(piece.id)}
            isStopped={stoppedIds.has(piece.id)}
            canStop={(phase === "running" || phase === "paused") && (activeId === piece.id || states[piece.id]?.status === "idle" || !states[piece.id]?.status)}
            onRegenerate={onRegenerate}
            isRegenerating={activeId === piece.id && states[piece.id]?.status === "thinking"}
            isPaused={isPaused && activeId === piece.id}
          />
        ))}
      </div>
    </div>
  );
}
