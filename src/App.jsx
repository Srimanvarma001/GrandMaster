import React, { useState, useEffect } from "react";
import { PIECES } from "./utils/pieces";
import { streamAgent, formatContext } from "./utils/agentRunner";
import { loadHistory, saveHistory } from "./utils/history";

import Header from "./components/Header";
import InputScreen from "./components/InputScreen";
import CrewView from "./components/CrewView";
import DocView from "./components/DocView";
import HistoryPanel from "./components/HistoryPanel";

export default function App() {
  const [phase, setPhase] = useState("input"); // input | running | done | paused
  const [idea, setIdea] = useState("");
  const [states, setStates] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [finalDoc, setFinalDoc] = useState("");
  const [tab, setTab] = useState("crew"); // crew | doc
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [stoppedIds, setStoppedIds] = useState(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const abortControllerRef = React.useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const stopPiece = (pieceId) => {
    setStoppedIds((prev) => new Set([...prev, pieceId]));
    if (activeId === pieceId) {
      setActiveId(null);
    }
  };

  const isStopped = (pieceId) => stoppedIds.has(pieceId);

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      setPhase("running");
    } else {
      setIsPaused(true);
      setPhase("paused");
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  };

  const resetPause = () => {
    setIsPaused(false);
    setPhase("input");
    setStoppedIds(new Set());
  };

  const deploy = async () => {
    if (!idea.trim()) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const init = {};
    PIECES.forEach((p) => {
      init[p.id] = { status: "idle", output: "" };
    });
    setStates(init);
    setPhase("running");
    setTab("crew");
    setFinalDoc("");
    setShowHistory(false);
    setStoppedIds(new Set());
    setIsPaused(false);

    const outputs = {};
    const contextMap = {};

    for (let i = 0; i < PIECES.length; i++) {
      if (signal.aborted) {
        setPhase("paused");
        return;
      }

      const piece = PIECES[i];
      const nextPiece = PIECES[i + 1];

      while (isPaused && !signal.aborted) {
        await new Promise(r => setTimeout(r, 500));
      }

      if (signal.aborted) {
        setPhase("paused");
        return;
      }

      if (isStopped(piece.id)) {
        setStates((prev) => ({
          ...prev,
          [piece.id]: { status: "stopped", output: "⚠️ Stopped by user" },
        }));
        continue;
      }

      if (i > 0) {
        const isSameProvider = nextPiece && piece.provider === nextPiece.provider;
        const delay = isSameProvider ? 5000 : 1500;
        await new Promise(r => setTimeout(r, delay));
      }

      if (signal.aborted) {
        setPhase("paused");
        return;
      }

      if (isStopped(piece.id)) {
        setStates((prev) => ({
          ...prev,
          [piece.id]: { status: "stopped", output: "⚠️ Stopped by user" },
        }));
        continue;
      }

      setActiveId(piece.id);
      setStates((prev) => ({
        ...prev,
        [piece.id]: { status: "thinking", output: "" },
      }));

      let prompt = idea;
      if (Object.keys(contextMap).length > 0) {
        const context = formatContext(contextMap);
        prompt = `Project brief: ${idea}\n\n## Previous Agents' Work\n${context}\n\n---\n\nNow you are the ${piece.name} — ${piece.role}. Build upon what previous agents decided and provide your expert contribution.`;
      }

      await new Promise((resolve) => {
        const handleChunk = (text) => {
          if (signal.aborted) return;
          setStates((prev) => ({
            ...prev,
            [piece.id]: { status: "thinking", output: text },
          }));
        };
        const handleDone = (finalText) => {
          if (signal.aborted) {
            resolve();
            return;
          }
          outputs[piece.id] = finalText;
          contextMap[piece.name] = finalText;
          setStates((prev) => ({
            ...prev,
            [piece.id]: { status: "done", output: finalText },
          }));
          resolve();
        };
        streamAgent(piece, prompt, handleChunk, handleDone);
      });

      if (signal.aborted) {
        setPhase("paused");
        return;
      }
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
    setStoppedIds(new Set());
    setIsPaused(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const regeneratePiece = async (pieceId, customInstructions = "") => {
    const pieceIndex = PIECES.findIndex(p => p.id === pieceId);
    if (pieceIndex === -1) return;

    const piece = PIECES[pieceIndex];
    const outputs = {};

    PIECES.forEach(p => {
      if (states[p.id]?.status === "done") {
        outputs[p.id] = states[p.id].output;
      }
    });

    const contextMap = {};
    for (let i = 0; i < pieceIndex; i++) {
      const prevPiece = PIECES[i];
      if (outputs[prevPiece.id]) {
        contextMap[prevPiece.name] = outputs[prevPiece.id];
      }
    }

    setActiveId(piece.id);
    setStates(prev => ({
      ...prev,
      [piece.id]: { status: "thinking", output: "" },
    }));

    let prompt = idea;
    const context = formatContext(contextMap);
    const instructions = customInstructions ? `\n\nAdditional instructions from user: ${customInstructions}` : "";
    prompt = `Project brief: ${idea}\n\n## Previous Agents' Work\n${context}\n\n---\n\nNow you are the ${piece.name} — ${piece.role}. Build upon what previous agents decided and provide your expert contribution.${instructions}`;

    await new Promise((resolve) => {
      streamAgent(
        piece,
        prompt,
        (text) =>
          setStates(prev => ({
            ...prev,
            [piece.id]: { status: "thinking", output: text },
          })),
        (finalText) => {
          setStates(prev => ({
            ...prev,
            [piece.id]: { status: "done", output: finalText },
          }));
          setActiveId(null);
          resolve();
        }
      );
    });
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

      {(phase === "running" || phase === "paused" || (phase === "done" && tab === "crew")) && (
        <CrewView
          idea={idea}
          states={states}
          activeId={activeId}
          phase={phase}
          onStopPiece={stopPiece}
          stoppedIds={stoppedIds}
          onRegenerate={regeneratePiece}
          isPaused={isPaused}
          onTogglePause={togglePause}
        />
      )}

      {phase === "done" && tab === "doc" && (
        <DocView idea={idea} finalDoc={finalDoc} />
      )}
    </div>
  );
}