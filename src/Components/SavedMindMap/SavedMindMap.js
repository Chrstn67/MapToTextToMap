import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { openDB } from "idb";
import { nanoid } from "nanoid";
import html2pdf from "html2pdf.js";
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

  const exportToPDF = () => {
    const contentDiv = document.createElement("div");

    const titleElement = document.createElement("h1");
    titleElement.textContent = mapTitle;
    contentDiv.appendChild(titleElement);

    // Fonction pour obtenir la couleur en fonction de l'importance
    const getColorForImportance = (importance) => {
      switch (importance) {
        case "introduction":
          return "#1100ff";
        case "plan":
          return "#bcbfc2";
        case "idee-principale":
          return "#7af300";
        case "idee-secondaire":
          return "#cdf897";
        case "idee-tertiaire":
          return "#c9faba";
        case "normal":
          return "#f9f9f9";
        case "idee-importante":
          return "#f8b7b6";
        case "idee-tres-importante":
          return "#fa4646";
        case "exemple":
          return "#fff385";
        case "citation":
          return "#00eeff";
        case "lecon":
          return "#ff4076";
        case "conclusion":
          return "#700000";
        default:
          return "#f9f9f9"; // Couleur par défaut si l'importance ne correspond à aucune option
      }
    };

    bubbles.forEach((bubble) => {
      const bubbleDiv = document.createElement("div"); // Utilisez une balise <div> pour conserver les sauts de ligne
      const bubbleTitle = document.createElement("h3");
      const bubbleContent = document.createElement("pre"); // Utilisez une balise <div> ou <pre> pour conserver les sauts de ligne

      bubbleTitle.style.backgroundColor = getColorForImportance(
        bubble.importance
      );

      bubbleTitle.textContent = `${bubble.importance}`;

      if (keywordMode) {
        const keywords = bubble.keywords
          .map((keyword) => keyword.value)
          .join(", ");
        bubbleContent.textContent = `${keywords}`;
      } else {
        bubbleContent.textContent = bubble.text;
      }

      bubbleDiv.appendChild(bubbleTitle);
      bubbleDiv.appendChild(bubbleContent);
      contentDiv.appendChild(bubbleDiv);
    });

    const opt = {
      margin: 10,
      filename: `${mapTitle}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Génère le PDF
    html2pdf().from(contentDiv).set(opt).save();
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
        <button className="button-export" onClick={exportToPDF}>
          Exporter au format PDF
        </button>
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
                placeholder={bubble.text}
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedMindMap;
