import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { openDB } from "idb";
import { nanoid } from "nanoid";
import "./SavedMindMap.scss";

const SavedMindMap = () => {
  const { id: mapId } = useParams();
  const [bubbles, setBubbles] = useState([]);
  const [mapTitle, setMapTitle] = useState("");
  const [keywordMode, setKeywordMode] = useState(false); // État pour le mode "mots-clés"

  useEffect(() => {
    // Fonction pour récupérer une carte mentale spécifique depuis IndexedDB
    const getMindMapFromIndexedDB = async () => {
      const DB_NAME = "mindMapDB";
      const DB_STORE_NAME = "mindMaps";
      const db = await openDB(DB_NAME, 1);

      try {
        const savedMindMaps = await db.get(DB_STORE_NAME, mapId);

        console.debug("savedMindMaps", savedMindMaps);

        savedMindMaps?.title && setMapTitle(savedMindMaps.title);

        if (Array.isArray(savedMindMaps?.bubbles)) {
          setBubbles(savedMindMaps.bubbles);
        } else {
          setBubbles([]);
        }
      } catch (error) {
        console.error("Error getting saved mind maps:", error);
        setBubbles([]);
      }
    };

    getMindMapFromIndexedDB();
  }, [mapId]);

  const handleKeywordModeChange = () => {
    setKeywordMode(!keywordMode);
  };

  const addBubble = () => {
    const newBubble = {
      id: nanoid(),
      type: "full-text",
      text: "Nouveau texte complet",
      keywords: [],
      importance: "normal",
    };

    const newBubbles = [...bubbles, newBubble];
    setBubbles(newBubbles);
    saveMindMapsToIndexedDB(newBubbles);
  };

  const updateBubble = (bubbleId, text) => {
    const updatedMaps = bubbles.map((bubble) => {
      if (bubble.id === bubbleId) {
        return {
          ...bubble,
          text,
        };
      }

      return bubble;
    });
    setBubbles(updatedMaps);
    saveMindMapsToIndexedDB(updatedMaps);
  };

  const handleImportanceChange = (bubbleId, importance) => {
    const updatedMaps = bubbles.map((bubble) => {
      if (bubble.id === bubbleId) {
        return {
          ...bubble,
          importance,
        };
      }

      return bubble;
    });
    setBubbles(updatedMaps);
    saveMindMapsToIndexedDB(updatedMaps);
  };

  const addKeywordToBubble = (bubbleId, keyword) => {
    const updatedBubbles = bubbles.map((bubble) => {
      if (bubble.id === bubbleId) {
        return {
          ...bubble,
          keywords: [...bubble.keywords, { id: nanoid(), value: keyword }],
        };
      }

      return bubble;
    });
    setBubbles(updatedBubbles);
    saveMindMapsToIndexedDB(updatedBubbles);
  };

  const updateKeywordInBubble = (bubbleId, keywordId, newKeyword) => {
    const updatedMaps = bubbles.map((bubble) => {
      if (bubble.id === bubbleId) {
        return {
          ...bubble,
          keywords: bubble.keywords.map((keyword) =>
            keyword.id === keywordId
              ? { ...keyword, value: newKeyword }
              : keyword
          ),
        };
      }

      return bubble;
    });
    setBubbles(updatedMaps);
    saveMindMapsToIndexedDB(updatedMaps);
  };

  const deleteKeywordFromBubble = (bubbleId, keywordId) => {
    const updatedMaps = bubbles.map((bubble) => {
      if (bubble.id === bubbleId) {
        return {
          ...bubble,
          keywords: bubble.keywords.filter(
            (keyword) => keyword.id !== keywordId
          ),
        };
      }

      return bubble;
    });
    setBubbles(updatedMaps);
    saveMindMapsToIndexedDB(updatedMaps);
  };

  const deleteBubble = (bubbleId) => {
    const updatedMaps = bubbles.filter((bubble) => bubble.id !== bubbleId);
    setBubbles(updatedMaps);
    saveMindMapsToIndexedDB(updatedMaps);
  };

  const moveBubbleBefore = (bubbleId, beforeBubbleId) => {
    const bubbleToMove = bubbles.find((bubble) => bubble.id === bubbleId);
    const beforeBubbleIndex = bubbles.findIndex(
      (bubble) => bubble.id === beforeBubbleId
    );

    if (beforeBubbleIndex >= 0) {
      const updatedMaps = bubbles.filter((bubble) => bubble.id !== bubbleId);
      updatedMaps.splice(beforeBubbleIndex, 0, bubbleToMove);
      setBubbles(updatedMaps);
      saveMindMapsToIndexedDB(updatedMaps);
    }
  };

  const moveBubbleAfter = (bubbleId, afterBubbleId) => {
    const bubbleToMove = bubbles.find((bubble) => bubble.id === bubbleId);
    const afterBubbleIndex = bubbles.findIndex(
      (bubble) => bubble.id === afterBubbleId
    );

    if (afterBubbleIndex >= 0) {
      const updatedMaps = bubbles.filter((bubble) => bubble.id !== bubbleId);
      updatedMaps.splice(afterBubbleIndex + 1, 0, bubbleToMove);
      setBubbles(updatedMaps);
      saveMindMapsToIndexedDB(updatedMaps);
    }
  };

  // Fonction pour sauvegarder les mind maps dans IndexedDB
  const saveMindMapsToIndexedDB = async (bubbles) => {
    const DB_NAME = "mindMapDB";
    const DB_STORE_NAME = "mindMaps";
    const db = await openDB(DB_NAME, 1);
    const newMap = {
      id: mapId,
      title: mapTitle,
      bubbles,
    };

    await db.put(DB_STORE_NAME, newMap);
  };

  return (
    <div className="saved-mind-map">
      <h2>{mapTitle}</h2>

      <div className="sticky-buttons">
        <button className="button-add" onClick={addBubble}>
          Ajouter une bulle
        </button>
        <div className="mode-toggle">
          <button className="mode-keyword" onClick={handleKeywordModeChange}>
            {keywordMode ? "Mode texte" : "Mode mots-clés"}
          </button>
        </div>
      </div>
      {bubbles.map((bubble, index) => (
        <div key={bubble.id} className={`bubble ${bubble.importance}`}>
          {keywordMode ? (
            // Mode "mots-clés"
            <div className="keywords-container">
              <h3>Mots-clés :</h3>
              {bubble.keywords.map((keyword) => (
                <div key={keyword.id} className="keyword-item">
                  <input
                    type="text"
                    value={keyword.value}
                    onChange={(e) =>
                      updateKeywordInBubble(
                        bubble.id,
                        keyword.id,
                        e.target.value
                      )
                    }
                  />
                  <button
                    onClick={() =>
                      deleteKeywordFromBubble(bubble.id, keyword.id)
                    }
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              <div className="sticky-buttons">
                <button
                  onClick={() =>
                    addKeywordToBubble(bubble.id, "Nouveau mot-clé")
                  }
                >
                  Ajouter un mot-clé
                </button>
              </div>
            </div>
          ) : (
            // Mode texte
            <div>
              <textarea
                value={bubble.text}
                onChange={(e) => updateBubble(bubble.id, e.target.value)}
              />
            </div>
          )}
          <div className="bubble-actions">
            {index > 0 && (
              <button
                onClick={() =>
                  moveBubbleBefore(bubble.id, bubbles[index - 1].id)
                }
              >
                <span role="img" aria-label="Move before">
                  ⬆️
                </span>
              </button>
            )}
            {index < bubbles.length - 1 && (
              <button
                onClick={() =>
                  moveBubbleAfter(bubble.id, bubbles[index + 1].id)
                }
              >
                <span role="img" aria-label="Move after">
                  ⬇️
                </span>
              </button>
            )}
            <button onClick={() => deleteBubble(bubble.id)}>
              <span role="img" aria-label="Delete">
                ❌
              </span>
            </button>
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
            <label>
              <input
                type="radio"
                value="citation"
                checked={bubble.importance === "citation"}
                onChange={() => handleImportanceChange(bubble.id, "citation")}
              />
              Citation
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedMindMap;
