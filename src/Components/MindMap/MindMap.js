import React, { useState } from "react";
import "./MindMap.scss";

const MindMap = () => {
  const [bubbles, setBubbles] = useState([]);

  const addBubble = () => {
    const newBubble = {
      id: Date.now(),
      text: "Nouvelle bulle",
      importance: "normal", // Par défaut, on considère que c'est une bulle normale
    };

    setBubbles([...bubbles, newBubble]);
  };

  const updateBubble = (id, text) => {
    setBubbles(
      bubbles.map((bubble) => (bubble.id === id ? { ...bubble, text } : bubble))
    );
  };

  const handleImportanceChange = (id, importance) => {
    setBubbles(
      bubbles.map((bubble) =>
        bubble.id === id ? { ...bubble, importance } : bubble
      )
    );
  };

  return (
    <div className="mind-map">
      <button onClick={addBubble}>Ajouter une bulle</button>
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`bubble ${bubble.importance}`}
          style={{ width: `${bubble.text.length * 1.5}em` }}
        >
          <input
            type="text"
            value={bubble.text}
            onChange={(e) => updateBubble(bubble.id, e.target.value)}
          />
          <div className="bubble-type">
            <label>
              <input
                type="radio"
                value="normal"
                checked={bubble.importance === "normal"}
                onChange={() => handleImportanceChange(bubble.id, "normal")}
              />
              Normal
            </label>
            <label>
              <input
                type="radio"
                value="important"
                checked={bubble.importance === "important"}
                onChange={() => handleImportanceChange(bubble.id, "important")}
              />
              Important
            </label>
            <label>
              <input
                type="radio"
                value="very-important"
                checked={bubble.importance === "very-important"}
                onChange={() =>
                  handleImportanceChange(bubble.id, "very-important")
                }
              />
              Très important
            </label>
            <label>
              <input
                type="radio"
                value="example"
                checked={bubble.importance === "example"}
                onChange={() => handleImportanceChange(bubble.id, "example")}
              />
              Exemple
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MindMap;
