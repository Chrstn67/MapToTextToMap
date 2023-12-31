import React, { useState, useEffect, useRef } from "react";
import { openDB } from "idb";
import { nanoid } from "nanoid";
import "./MindMap.scss";

const MindMap = () => {
  const mapId = useRef(null);
  const [bubbles, setBubbles] = useState([]);
  const [mapTitle, setMapTitle] = useState("Titre de la carte mentale");
  const [keywordMode, setKeywordMode] = useState(false); // État pour le mode "mots-clés"
  const [selectedKeywords, setSelectedKeywords] = useState([]); // État pour les mots-clés sélectionnés
  const DB_NAME = "mindMapDB";
  const DB_STORE_NAME = "mindMaps";

  useEffect(() => {
    if (!mapId.current) {
      mapId.current = nanoid();
    }

    // Fonction pour récupérer les cartes mentales depuis IndexedDB
    const getMindMapsFromIndexedDB = async () => {
      const DB_NAME = "mindMapDB";
      const DB_STORE_NAME = "mindMaps";
      const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
          db.createObjectStore(DB_STORE_NAME, {
            // The 'id' property of the object will be the key.
            keyPath: "id",
          });
        },
      });

      try {
        const savedMindMaps = await db.get(DB_STORE_NAME, mapId.current);

        console.debug("savedMindMaps", savedMindMaps);

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

    getMindMapsFromIndexedDB();
  }, []);

  // Fonction pour sauvegarder les mind maps dans IndexedDB
  const saveMindMapsToIndexedDB = async (bubbles) => {
    const db = await openDB(DB_NAME, 1);
    // const tx = db.transaction(DB_STORE_NAME, "readwrite");
    // const store = tx.objectStore(DB_STORE_NAME);

    const newMap = {
      id: mapId.current,
      title: mapTitle, // Ajouter le titre dans l'objet map
      bubbles,
    };

    await db.delete(DB_STORE_NAME, mapId.current);

    // Update the map
    // await store.put(newMap);
    await db.add(DB_STORE_NAME, newMap);
  };

  const handleMapTitleChange = (e) => {
    setMapTitle(e.target.value);
  };

  const addBubble = () => {
    // I KNOW, IT'S UGLY, BUT NO TIME, I WANT TO SLEEP
    const newBubble = {
      id: nanoid(),
      type: "full-text",
      text: "Nouveau texte complet",
      keywords: [],
      importance: "normal",
    };

    const newBubbles = [...bubbles, newBubble];

    setBubbles(newBubbles);
    // Sauvegarder les cartes mentales dans IndexedDB
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

  const deleteBubble = (bubbleId) => {
    const updatedBubbles = bubbles.filter((bubble) => bubble.id !== bubbleId);
    setBubbles(updatedBubbles);
    saveMindMapsToIndexedDB(updatedBubbles);
  };

  const moveBubbleBefore = (currentBubbleId, targetBubbleId) => {
    const currentBubbleIndex = bubbles.findIndex(
      (bubble) => bubble.id === currentBubbleId
    );
    const targetBubbleIndex = bubbles.findIndex(
      (bubble) => bubble.id === targetBubbleId
    );

    if (currentBubbleIndex !== -1 && targetBubbleIndex !== -1) {
      const newBubbles = [...bubbles];
      const [removedBubble] = newBubbles.splice(currentBubbleIndex, 1);
      newBubbles.splice(targetBubbleIndex, 0, removedBubble);
      setBubbles(newBubbles);
      saveMindMapsToIndexedDB(newBubbles);
    }
  };

  const moveBubbleAfter = (currentBubbleId, targetBubbleId) => {
    const currentBubbleIndex = bubbles.findIndex(
      (bubble) => bubble.id === currentBubbleId
    );
    const targetBubbleIndex = bubbles.findIndex(
      (bubble) => bubble.id === targetBubbleId
    );

    if (currentBubbleIndex !== -1 && targetBubbleIndex !== -1) {
      const newBubbles = [...bubbles];
      const [removedBubble] = newBubbles.splice(currentBubbleIndex, 1);
      newBubbles.splice(targetBubbleIndex + 1, 0, removedBubble);
      setBubbles(newBubbles);
      saveMindMapsToIndexedDB(newBubbles);
    }
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

  const handleSave = () => {
    saveMindMapsToIndexedDB(bubbles);
    alert("Map sauvegardée");
  };

  return (
    <div className="mind-map">
      {/* Utiliser un input pour permettre à l'utilisateur de saisir le titre */}
      <input
        type="text"
        placeholder="Titre de la carte mentale"
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

      <div className="map">
        <h2>{mapTitle}</h2>
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
                        selectedKeywords.includes(keyword.value)
                          ? "selected"
                          : ""
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
                  <button
                    onClick={() => moveBubbleBefore(bubble.id, bubble.id)}
                  >
                    <span role="img" aria-label="Move before">
                      ⬆️
                    </span>
                  </button>
                  <button onClick={() => moveBubbleAfter(bubble.id, bubble.id)}>
                    <span role="img" aria-label="Move after">
                      ⬇️
                    </span>
                  </button>
                </div>
                <div className="bubble-type">
                  {/* Menu déroulant pour l'importance */}
                  <select
                    value={bubble.importance}
                    onChange={(e) =>
                      handleImportanceChange(bubble.id, e.target.value)
                    }
                  >
                    <option value="introduction">Introduction</option>
                    <option value="plan">Plan</option>
                    <option value="idee-principale">Idée Principale</option>
                    <option value="idee-secondaire">Idée Secondaire</option>
                    <option value="idee-tertiaire">Idée Tertiaire</option>
                    <option value="normal">Normal</option>
                    <option value="idee-importante">Important</option>
                    <option value="idee-tres-importante">Très important</option>
                    <option value="exemple">Exemple</option>
                    <option value="citation">Citation</option>
                    <option value="lecon">Leçon</option>
                    <option value="conclusion">Conclusion</option>
                  </select>
                </div>
              </>
            ) : (
              // Mode texte complet
              <>
                <textarea
                  placeholder={bubble.text}
                  onChange={(e) => updateBubble(bubble.id, e.target.value)}
                />
                <div className="bubble-actions">
                  <button onClick={() => deleteBubble(bubble.id)}>
                    <span role="img" aria-label="Delete">
                      ❌
                    </span>
                  </button>
                  <button
                    onClick={() => moveBubbleBefore(bubble.id, bubble.id)}
                  >
                    <span role="img" aria-label="Move before">
                      ⬆️
                    </span>
                  </button>
                  <button onClick={() => moveBubbleAfter(bubble.id, bubble.id)}>
                    <span role="img" aria-label="Move after">
                      ⬇️
                    </span>
                  </button>
                </div>
                <div className="bubble-type">
                  {/* Menu déroulant pour l'importance */}
                  <select
                    value={bubble.importance}
                    onChange={(e) =>
                      handleImportanceChange(bubble.id, e.target.value)
                    }
                  >
                    <option value="introduction">Introduction</option>
                    <option value="plan">Plan</option>
                    <option value="idee-principale">Idée Principale</option>
                    <option value="idee-secondaire">Idée Secondaire</option>
                    <option value="idee-tertiaire">Idée Tertiaire</option>
                    <option value="normal">Normal</option>
                    <option value="idee-importante">Important</option>
                    <option value="idee-tres-importante">Très important</option>
                    <option value="exemple">Exemple</option>
                    <option value="citation">Citation</option>
                    <option value="lecon">Leçon</option>
                    <option value="conclusion">Conclusion</option>
                  </select>
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
                        placeholder={keyword.value}
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
    </div>
  );
};

export default MindMap;
