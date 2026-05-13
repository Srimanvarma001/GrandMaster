import React from "react";
import { PIECES } from "../utils/pieces";
import PieceCard from "./PieceCard";
import styles from "./CrewView.module.css";

export default function CrewView({ idea, states, activeId, phase, onStopPiece, stoppedIds, onRegenerate }) {
  const doneCount = PIECES.filter((p) => states[p.id]?.status === "done").length;
  const activePiece = PIECES.find((p) => p.id === activeId);

  return (
    <div className={styles.wrap}>
      {idea && (
        <div className={styles.ideaTag}>"{idea}"</div>
      )}

      {phase === "running" && (
        <div className={styles.progressWrap}>
          <div className={styles.progressInfo}>
            <span>
              {activePiece
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

      <div className={styles.grid}>
        {PIECES.map((piece) => (
          <PieceCard
            key={piece.id}
            piece={piece}
            state={states[piece.id] || { status: "idle", output: "" }}
            isActive={activeId === piece.id}
            onStop={() => onStopPiece(piece.id)}
            isStopped={stoppedIds.has(piece.id)}
            canStop={phase === "running" && (activeId === piece.id || states[piece.id]?.status === "idle" || !states[piece.id]?.status)}
            onRegenerate={onRegenerate}
            isRegenerating={activeId === piece.id && states[piece.id]?.status === "thinking"}
          />
        ))}
      </div>
    </div>
  );
}
