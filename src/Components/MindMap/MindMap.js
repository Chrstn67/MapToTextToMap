import React, { useState, useEffect } from "react";
import { openDB, deleteDB, wrap, unwrap } from "idb";
import "./MindMap.scss";

const MindMap = () => {
  const [maps, setMaps] = useState([]);
  const [mapTitle, setMapTitle] = useState("Titre de la carte mentale");
  const [keywordMode, setKeywordMode] = useState(false); // État pour le mode "mots-clés"
  const [selectedKeywords, setSelectedKeywords] = useState([]); // État pour les mots-clés sélectionnés
  const DB_NAME = "mindMapDB";
  const DB_STORE_NAME = "mindMaps";

  useEffect(() => {
    // Fonction pour récupérer les cartes mentales depuis IndexedDB
    const getMindMapsFromIndexedDB = async () => {
      const DB_NAME = "mindMapDB";
      const DB_STORE_NAME = "mindMaps";
      const db = await openDB(DB_NAME, 1);
      const savedMindMaps = await wrap(db)
        .getAll(DB_STORE_NAME)
        .catch((error) => {
          console.error("Error getting saved mind maps:", error);
          return [];
        });

      // Pour chaque carte mentale, récupérer les bulles associées
      const mappedMindMaps = await Promise.all(
        savedMindMaps.map(async (map) => {
          const mapBubbles = await wrap(db)
            .getAll("bubbles", map.id)
            .catch((error) => {
              console.error("Error getting saved bubbles:", error);
              return [];
            });
          return {
            ...map,
            bubbles: mapBubbles,
          };
        })
      );

      setMaps(mappedMindMaps);
    };

    getMindMapsFromIndexedDB();
  }, []);

  // Fonction pour sauvegarder les mind maps dans IndexedDB
  const saveMindMapsToIndexedDB = async (maps) => {
    const db = await openDB(DB_NAME, 1);
    const tx = db.transaction(DB_STORE_NAME, "readwrite");
    const store = tx.objectStore(DB_STORE_NAME);
    // Supprimer toutes les cartes mentales existantes dans IndexedDB
    await store.clear();
    // Ajouter les nouvelles cartes mentales dans IndexedDB
    await Promise.all(
      maps.map(async (map) => {
        await store.put({
          ...map,
          title: mapTitle, // Ajouter le titre dans l'objet map
        });
        // Enregistrer les bulles associées à chaque carte mentale
        await Promise.all(
          map.bubbles.map((bubble) =>
            store.put({
              ...bubble,
              mapId: map.id, // Ajouter l'ID de la carte mentale à la bulle
            })
          )
        );
      })
    );
  };

  const handleMapTitleChange = (e) => {
    setMapTitle(e.target.value);
  };

  const addBubble = () => {
    // Vérifier si une carte mentale avec le même titre existe déjà
    const existingMap = maps.find((map) => map.title === mapTitle);

    // Si une carte mentale avec le même titre existe, ajouter la bulle à cette carte
    if (existingMap) {
      const newBubble = {
        id: Date.now(),
        type: "full-text",
        text: "Nouveau texte complet",
        keywords: [],
        importance: "normal",
      };

      setMaps((prevMaps) =>
        prevMaps.map((map) =>
          map.id === existingMap.id
            ? { ...map, bubbles: [...map.bubbles, newBubble] }
            : map
        )
      );
      // Sauvegarder les cartes mentales dans IndexedDB
      saveMindMapsToIndexedDB([...maps, existingMap]);
    } else {
      // Si aucune carte mentale avec le même titre existe, créer une nouvelle carte mentale avec la bulle
      const newBubble = {
        id: Date.now(),
        type: "full-text",
        text: "Nouveau texte complet",
        keywords: [],
        importance: "normal",
      };

      const newMap = {
        id: Date.now(),
        title: mapTitle,
        bubbles: [newBubble],
      };

      setMaps([...maps, newMap]);
      // Sauvegarder les cartes mentales dans IndexedDB
      saveMindMapsToIndexedDB([...maps, newMap]);
    }
  };

  const updateBubble = (mapId, bubbleId, text) => {
    const updatedMaps = maps.map((map) =>
      map.id === mapId
        ? {
            ...map,
            bubbles: map.bubbles.map((bubble) =>
              bubble.id === bubbleId ? { ...bubble, text } : bubble
            ),
          }
        : map
    );
    setMaps(updatedMaps);
    saveMindMapsToIndexedDB(updatedMaps);
  };

  const handleImportanceChange = (mapId, bubbleId, importance) => {
    const updatedMaps = maps.map((map) =>
      map.id === mapId
        ? {
            ...map,
            bubbles: map.bubbles.map((bubble) =>
              bubble.id === bubbleId ? { ...bubble, importance } : bubble
            ),
          }
        : map
    );
    setMaps(updatedMaps);
    saveMindMapsToIndexedDB(updatedMaps);
  };

  const deleteBubble = (mapId, bubbleId) => {
    const updatedMaps = maps.map((map) =>
      map.id === mapId
        ? {
            ...map,
            bubbles: map.bubbles.filter((bubble) => bubble.id !== bubbleId),
          }
        : map
    );
    setMaps(updatedMaps);
    saveMindMapsToIndexedDB(updatedMaps);
  };

  const moveBubbleBefore = (mapId, bubbleId) => {
    const mapIndex = maps.findIndex((map) => map.id === mapId);
    if (mapIndex > 0) {
      const updatedMaps = [...maps];
      const map = updatedMaps[mapIndex];
      const bubbleIndex = map.bubbles.findIndex(
        (bubble) => bubble.id === bubbleId
      );
      if (bubbleIndex > 0) {
        const tempBubble = map.bubbles[bubbleIndex];
        map.bubbles[bubbleIndex] = map.bubbles[bubbleIndex - 1];
        map.bubbles[bubbleIndex - 1] = tempBubble;
        setMaps(updatedMaps);
        saveMindMapsToIndexedDB(updatedMaps);
      }
    }
  };

  const moveBubbleAfter = (mapId, bubbleId) => {
    const mapIndex = maps.findIndex((map) => map.id === mapId);
    if (mapIndex < maps.length - 1) {
      const updatedMaps = [...maps];
      const map = updatedMaps[mapIndex];
      const bubbleIndex = map.bubbles.findIndex(
        (bubble) => bubble.id === bubbleId
      );
      if (bubbleIndex < map.bubbles.length - 1) {
        const tempBubble = map.bubbles[bubbleIndex];
        map.bubbles[bubbleIndex] = map.bubbles[bubbleIndex + 1];
        map.bubbles[bubbleIndex + 1] = tempBubble;
        setMaps(updatedMaps);
        saveMindMapsToIndexedDB(updatedMaps);
      }
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

  const addKeywordToBubble = (mapId, bubbleId, keyword) => {
    const updatedMaps = maps.map((map) =>
      map.id === mapId
        ? {
            ...map,
            bubbles: map.bubbles.map((bubble) =>
              bubble.id === bubbleId
                ? {
                    ...bubble,
                    keywords: [
                      ...bubble.keywords,
                      { id: Date.now(), value: keyword },
                    ],
                  }
                : bubble
            ),
          }
        : map
    );
    setMaps(updatedMaps);
    saveMindMapsToIndexedDB(updatedMaps);
  };

  const updateKeywordInBubble = (mapId, bubbleId, keywordId, newKeyword) => {
    const updatedMaps = maps.map((map) =>
      map.id === mapId
        ? {
            ...map,
            bubbles: map.bubbles.map((bubble) =>
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
            ),
          }
        : map
    );
    setMaps(updatedMaps);
    saveMindMapsToIndexedDB(updatedMaps);
  };

  const deleteKeywordFromBubble = (mapId, bubbleId, keywordId) => {
    const updatedMaps = maps.map((map) =>
      map.id === mapId
        ? {
            ...map,
            bubbles: map.bubbles.map((bubble) =>
              bubble.id === bubbleId
                ? {
                    ...bubble,
                    keywords: bubble.keywords.filter(
                      (keyword) => keyword.id !== keywordId
                    ),
                  }
                : bubble
            ),
          }
        : map
    );
    setMaps(updatedMaps);
    saveMindMapsToIndexedDB(updatedMaps);
  };

  const handleSave = () => {
    saveMindMapsToIndexedDB(maps);
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

      {maps.map((map) => (
        <div key={map.id} className="map">
          <h2>{map.title}</h2>
          {map.bubbles.map((bubble) => (
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
                    <button onClick={() => deleteBubble(map.id, bubble.id)}>
                      <span role="img" aria-label="Delete">
                        ❌
                      </span>
                    </button>
                    <button onClick={() => moveBubbleBefore(map.id, bubble.id)}>
                      <span role="img" aria-label="Move before">
                        ⬆️
                      </span>
                    </button>
                    <button onClick={() => moveBubbleAfter(map.id, bubble.id)}>
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
                        onChange={() =>
                          handleImportanceChange(map.id, bubble.id, "normal")
                        }
                      />
                      Normal
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="important"
                        checked={bubble.importance === "important"}
                        onChange={() =>
                          handleImportanceChange(map.id, bubble.id, "important")
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
                          handleImportanceChange(
                            map.id,
                            bubble.id,
                            "very-important"
                          )
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
                          handleImportanceChange(map.id, bubble.id, "example")
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
                          handleImportanceChange(map.id, bubble.id, "citation")
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
                    onChange={(e) =>
                      updateBubble(map.id, bubble.id, e.target.value)
                    }
                  />
                  <div className="bubble-actions">
                    <button onClick={() => deleteBubble(map.id, bubble.id)}>
                      <span role="img" aria-label="Delete">
                        ❌
                      </span>
                    </button>
                    <button onClick={() => moveBubbleBefore(map.id, bubble.id)}>
                      <span role="img" aria-label="Move before">
                        ⬆️
                      </span>
                    </button>
                    <button onClick={() => moveBubbleAfter(map.id, bubble.id)}>
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
                        onChange={() =>
                          handleImportanceChange(map.id, bubble.id, "normal")
                        }
                      />
                      Normal
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="important"
                        checked={bubble.importance === "important"}
                        onChange={() =>
                          handleImportanceChange(map.id, bubble.id, "important")
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
                          handleImportanceChange(
                            map.id,
                            bubble.id,
                            "very-important"
                          )
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
                          handleImportanceChange(map.id, bubble.id, "example")
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
                          handleImportanceChange(map.id, bubble.id, "citation")
                        }
                      />
                      Citation
                    </label>
                  </div>
                  <div className="keywords-container">
                    <h3>Mots-clés :</h3>
                    <button
                      onClick={() =>
                        addKeywordToBubble(map.id, bubble.id, "Nouveau mot-clé")
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
                              map.id,
                              bubble.id,
                              keyword.id,
                              e.target.value
                            )
                          }
                        />
                        <button
                          onClick={() =>
                            deleteKeywordFromBubble(
                              map.id,
                              bubble.id,
                              keyword.id
                            )
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
      ))}
    </div>
  );
};

export default MindMap;
