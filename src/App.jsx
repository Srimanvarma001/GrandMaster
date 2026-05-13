import React, { useState, useEffect } from "react";
import { PIECES } from "./utils/pieces";
import { streamAgent } from "./utils/deepseek";
import { loadHistory, saveHistory } from "./utils/history";

import Header from "./components/Header";
import InputScreen from "./components/InputScreen";
import CrewView from "./components/CrewView";
import DocView from "./components/DocView";
import HistoryPanel from "./components/HistoryPanel";

export default function App() {
  const [phase, setPhase] = useState("input"); // input | running | done
  const [idea, setIdea] = useState("");
  const [states, setStates] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [finalDoc, setFinalDoc] = useState("");
  const [tab, setTab] = useState("crew"); // crew | doc
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const deploy = async () => {
    if (!idea.trim()) return;

    // Initialise states
    const init = {};
    PIECES.forEach((p) => {
      init[p.id] = { status: "idle", output: "" };
    });
    setStates(init);
    setPhase("running");
    setTab("crew");
    setFinalDoc("");
    setShowHistory(false);

    const outputs = {};

    for (const piece of PIECES) {
      // Add 1.5s gap between agents
      await new Promise(r => setTimeout(r, 1500));

      setActiveId(piece.id);
      setStates((prev) => ({
        ...prev,
        [piece.id]: { status: "thinking", output: "" },
      }));

      await new Promise((resolve) => {
        streamAgent(
          piece,
          idea,
          (text) =>
            setStates((prev) => ({
              ...prev,
              [piece.id]: { status: "thinking", output: text },
            })),
          (finalText) => {
            outputs[piece.id] = finalText;
            setStates((prev) => ({
              ...prev,
              [piece.id]: { status: "done", output: finalText },
            }));
            resolve();
          }
        );
      });
    }

    setActiveId(null);

    // Assemble final markdown document
    const doc =
      `# ♔ GRANDMASTER Brief\n\n**Idea:** ${idea}\n**Date:** ${new Date().toLocaleDateString()}\n\n---\n\n` +
      PIECES.map(
        (p) =>
          `## ${p.symbol} ${p.name} — ${p.role}\n\n${outputs[p.id] || ""}`
      ).join("\n\n---\n\n");

    setFinalDoc(doc);
    setPhase("done");

    // Save to history
    const entry = {
      id: Date.now(),
      idea,
      date: new Date().toLocaleDateString(),
      doc,
    };
    const next = saveHistory(entry, history);
    setHistory(next);
  };

  const loadHistoryEntry = (h) => {
    setIdea(h.idea);
    setFinalDoc(h.doc);
    setPhase("done");
    setTab("doc");
    setShowHistory(false);
  };

  const reset = () => {
    setPhase("input");
    setIdea("");
    setFinalDoc("");
    setStates({});
    setActiveId(null);
    setShowHistory(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header
        phase={phase}
        tab={tab}
        setTab={setTab}
        history={history}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        onReset={reset}
      />

      {showHistory && (
        <HistoryPanel
          history={history}
          onLoad={loadHistoryEntry}
          onClose={() => setShowHistory(false)}
        />
      )}

      {phase === "input" && (
        <InputScreen
          idea={idea}
          setIdea={setIdea}
          onDeploy={deploy}
          historyCount={history.length}
          onShowHistory={() => setShowHistory(true)}
        />
      )}

      {(phase === "running" || (phase === "done" && tab === "crew")) && (
        <CrewView
          idea={idea}
          states={states}
          activeId={activeId}
          phase={phase}
        />
      )}

      {phase === "done" && tab === "doc" && (
        <DocView idea={idea} finalDoc={finalDoc} />
      )}
    </div>
  );
}