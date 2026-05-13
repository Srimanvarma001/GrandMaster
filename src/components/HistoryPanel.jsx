import React from "react";
import styles from "./HistoryPanel.module.css";

export default function HistoryPanel({ history, onLoad, onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Past ideas</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {history.length === 0 ? (
          <div className={styles.empty}>Nothing saved yet.</div>
        ) : (
          <div className={styles.list}>
            {history.map((h) => (
              <button
                key={h.id}
                className={styles.item}
                onClick={() => onLoad(h)}
              >
                <div className={styles.itemDate}>{h.date}</div>
                <div className={styles.itemIdea}>
                  {h.idea.slice(0, 80)}{h.idea.length > 80 ? "…" : ""}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
