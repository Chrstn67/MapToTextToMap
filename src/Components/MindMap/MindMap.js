import React, { useState, useEffect } from "react";
import { openDB, deleteDB, wrap, unwrap } from "idb";
import "./MindMap.scss";

const MindMap = () => {
  const [bubbles, setBubbles] = useState([]);
  const [mapTitle, setMapTitle] = useState("Titre de la carte mentale");
  const [keywordMode, setKeywordMode] = useState(false); // État pour le mode "mots-clés"
  const [selectedKeywords, setSelectedKeywords] = useState([]); // État pour les mots-clés sélectionnés
  const DB_NAME = "mindMapDB";
  const DB_STORE_NAME = "mindMaps";

  useEffect(() => {
    // Initialisation de la base de données IndexedDB
    const initDB = async () => {
      const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
          db.createObjectStore(DB_STORE_NAME, { keyPath: "id" });
        },
      });
      const savedMindMaps = await wrap(db)
        .getAll(DB_STORE_NAME)
        .catch((error) => {
          console.error("Error getting saved mind maps:", error);
          return [];
        });
      setBubbles(savedMindMaps);
    };

    initDB();
  }, []);

  // Fonction pour sauvegarder les mind maps dans IndexedDB
  const saveMindMapsToIndexedDB = async (maps) => {
    const db = await openDB(DB_NAME, 1);
    const tx = db.transaction(DB_STORE_NAME, "readwrite");
    const store = tx.objectStore(DB_STORE_NAME);
    // Supprimer toutes les bulles existantes dans IndexedDB
    await store.clear();
    // Ajouter les nouvelles bulles dans IndexedDB
    await Promise.all(
      maps.map((map) =>
        store.put({
          ...map,
          title: mapTitle, // Ajouter le titre dans l'objet bubble
        })
      )
    );
  };

  const handleMapTitleChange = (e) => {
    setMapTitle(e.target.value);
  };

  const addBubble = () => {
    const newBubble = {
      id: Date.now(),
      type: "full-text",
      text: "Nouveau texte complet",
      keywords: [], // Tableau pour stocker les mots-clés
      importance: "normal",
      title: mapTitle, // Ajouter le titre dans l'objet bubble
    };

    setBubbles([...bubbles, newBubble]);
    saveMindMapsToIndexedDB([...bubbles, newBubble]);
  };

  const updateBubble = (id, text) => {
    const updatedBubbles = bubbles.map((bubble) =>
      bubble.id === id ? { ...bubble, text } : bubble
    );
    setBubbles(updatedBubbles);
    saveMindMapsToIndexedDB(updatedBubbles);
  };

  const handleImportanceChange = (id, importance) => {
    setBubbles(
      bubbles.map((bubble) =>
        bubble.id === id ? { ...bubble, importance } : bubble
      )
    );
  };

  const deleteBubble = (id) => {
    const filteredBubbles = bubbles.filter((bubble) => bubble.id !== id);
    setBubbles(filteredBubbles);
    saveMindMapsToIndexedDB(filteredBubbles);
  };

  const moveBubbleBefore = (id) => {
    const bubbleIndex = bubbles.findIndex((bubble) => bubble.id === id);
    if (bubbleIndex > 0) {
      const updatedBubbles = [...bubbles];
      const tempBubble = updatedBubbles[bubbleIndex];
      updatedBubbles[bubbleIndex] = updatedBubbles[bubbleIndex - 1];
      updatedBubbles[bubbleIndex - 1] = tempBubble;
      setBubbles(updatedBubbles);
      saveMindMapsToIndexedDB(updatedBubbles);
    }
  };

  const moveBubbleAfter = (id) => {
    const bubbleIndex = bubbles.findIndex((bubble) => bubble.id === id);
    if (bubbleIndex < bubbles.length - 1) {
      const updatedBubbles = [...bubbles];
      const tempBubble = updatedBubbles[bubbleIndex];
      updatedBubbles[bubbleIndex] = updatedBubbles[bubbleIndex + 1];
      updatedBubbles[bubbleIndex + 1] = tempBubble;
      setBubbles(updatedBubbles);
      saveMindMapsToIndexedDB(updatedBubbles);
    }
  };

  const handleKeywordModeChange = () => {
    setKeywordMode(!keywordMode);
  };

  const handleKeywordSelection = (keyword) => {
    setSelectedKeywords((prevKeywords) =>
      prevKeywords.includes(keyword)
        ? prevKeywords.filter((key) => key !== keyword)
        : [...prevKeywords, keyword]
    );
  };

  const addKeywordToBubble = (bubbleId, keyword) => {
    setBubbles((prevBubbles) =>
      prevBubbles.map((bubble) =>
        bubble.id === bubbleId
          ? {
              ...bubble,
              keywords: [
                ...bubble.keywords,
                { id: Date.now(), value: keyword },
              ],
            }
          : bubble
      )
    );
  };

  const updateKeywordInBubble = (bubbleId, keywordId, newKeyword) => {
    setBubbles((prevBubbles) =>
      prevBubbles.map((bubble) =>
        bubble.id === bubbleId
          ? {
              ...bubble,
              keywords: bubble.keywords.map((keyword) =>
                keyword.id === keywordId
                  ? { ...keyword, value: newKeyword }
                  : keyword
              ),
            }
          : bubble
      )
    );
  };

  const deleteKeywordFromBubble = (bubbleId, keywordId) => {
    setBubbles((prevBubbles) =>
      prevBubbles.map((bubble) =>
        bubble.id === bubbleId
          ? {
              ...bubble,
              keywords: bubble.keywords.filter(
                (keyword) => keyword.id !== keywordId
              ),
            }
          : bubble
      )
    );
  };

  const handleSave = () => {
    saveMindMapsToIndexedDB(bubbles);
    alert("Map sauvegardée");
  };

  return (
    <div className="mind-map">
      {/* Utiliser un input pour permettre à l'utilisateur de saisir le titre */}
      <input
        type="text"
        value={mapTitle}
        onChange={handleMapTitleChange}
        className="map-title-input"
      />

      <h1>{mapTitle}</h1>
      <div className="sticky-buttons">
        <button className="button-add" onClick={addBubble}>
          Ajouter une bulle de texte complet
        </button>
        <button className="button-keyword" onClick={handleKeywordModeChange}>
          {keywordMode ? "Mode texte complet" : "Mode mots-clés"}
        </button>
        <button className="button-save" onClick={handleSave}>
          Enregistrer
        </button>
      </div>

      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`bubble ${bubble.importance}`}
          style={{ width: `${bubble.text.length * 1.5}em` }}
        >
          {keywordMode ? (
            // Mode "mots-clés"
            <>
              <div className="keyword-text">
                {bubble.keywords.map((keyword) => (
                  <span
                    key={keyword.id}
                    className={`keyword ${
                      selectedKeywords.includes(keyword.value) ? "selected" : ""
                    }`}
                    onClick={() => handleKeywordSelection(keyword.value)}
                  >
                    {keyword.value}
                  </span>
                ))}
              </div>
              <div className="bubble-actions">
                <button onClick={() => deleteBubble(bubble.id)}>
                  <span role="img" aria-label="Delete">
                    ❌
                  </span>
                </button>
                <button onClick={() => moveBubbleBefore(bubble.id)}>
                  <span role="img" aria-label="Move before">
                    ⬆️
                  </span>
                </button>
                <button onClick={() => moveBubbleAfter(bubble.id)}>
                  <span role="img" aria-label="Move after">
                    ⬇️
                  </span>
                </button>
              </div>
              <div className="bubble-type">
                {/* Boutons radio pour l'importance */}
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
                    onChange={() =>
                      handleImportanceChange(bubble.id, "important")
                    }
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
                    onChange={() =>
                      handleImportanceChange(bubble.id, "example")
                    }
                  />
                  Exemple
                </label>
                <label>
                  <input
                    type="radio"
                    value="citation"
                    checked={bubble.importance === "citation"}
                    onChange={() =>
                      handleImportanceChange(bubble.id, "citation")
                    }
                  />
                  Citation
                </label>
              </div>
            </>
          ) : (
            // Mode texte complet
            <>
              <textarea
                value={bubble.text}
                onChange={(e) => updateBubble(bubble.id, e.target.value)}
              />
              <div className="bubble-actions">
                <button onClick={() => deleteBubble(bubble.id)}>
                  <span role="img" aria-label="Delete">
                    ❌
                  </span>
                </button>
                <button onClick={() => moveBubbleBefore(bubble.id)}>
                  <span role="img" aria-label="Move before">
                    ⬆️
                  </span>
                </button>
                <button onClick={() => moveBubbleAfter(bubble.id)}>
                  <span role="img" aria-label="Move after">
                    ⬇️
                  </span>
                </button>
              </div>
              <div className="bubble-type">
                {/* Boutons radio pour l'importance */}
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
                    onChange={() =>
                      handleImportanceChange(bubble.id, "important")
                    }
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
                    onChange={() =>
                      handleImportanceChange(bubble.id, "example")
                    }
                  />
                  Exemple
                </label>
                <label>
                  <input
                    type="radio"
                    value="citation"
                    checked={bubble.importance === "citation"}
                    onChange={() =>
                      handleImportanceChange(bubble.id, "citation")
                    }
                  />
                  Citation
                </label>
              </div>
              <div className="keywords-container">
                <h3>Mots-clés :</h3>
                <button
                  onClick={() =>
                    addKeywordToBubble(bubble.id, "Nouveau mot-clé")
                  }
                >
                  Ajouter mot-clé
                </button>
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
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default MindMap;
