import React, { useState } from "react";
import styles from "./DocView.module.css";

export default function DocView({ idea, finalDoc }) {
  const [copied, setCopied] = useState(false);

  const copyDoc = () => {
    navigator.clipboard.writeText(finalDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.ideaTag}>"{idea}"</div>
        <button
          className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
          onClick={copyDoc}
        >
          {copied ? "✓ Copied!" : "Copy markdown"}
        </button>
      </div>

      <div className={styles.docBox}>
        <pre className={styles.pre}>{finalDoc}</pre>
      </div>
    </div>
  );
}
