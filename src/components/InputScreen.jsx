import React from "react";
import { PIECES } from "../utils/pieces";
import styles from "./InputScreen.module.css";

export default function InputScreen({ idea, setIdea, onDeploy, historyCount, onShowHistory }) {
  return (
    <div className={styles.screen}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>Multi-Agent Project Planner</div>
        <h1 className={styles.heading}>Deploy Your Crew</h1>
        <p className={styles.sub}>
          Describe your idea. Six specialist agents will analyze it in sequence 
          and produce a complete project brief — strategy, specification, stack, QA, and task breakdown.
        </p>

        <div className={styles.inputWrap}>
          <textarea
            className={styles.textarea}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="What do you want to build?"
            rows={4}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onDeploy();
            }}
          />
          <button
            className={styles.deployBtn}
            onClick={onDeploy}
            disabled={!idea.trim()}
          >
            Deploy Crew
          </button>

          {historyCount > 0 && (
            <button className={styles.historyLink} onClick={onShowHistory}>
              {historyCount} saved idea{historyCount !== 1 ? "s" : ""}
            </button>
          )}
        </div>

        <div className={styles.pieces}>
          {PIECES.map((p) => (
            <div key={p.id} className={styles.pieceItem}>
              <span className={styles.pieceSymbol} style={{ color: p.color }}>
                {p.symbol}
              </span>
              <span className={styles.pieceName}>{p.name}</span>
              <span className={styles.pieceRole}>{p.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
