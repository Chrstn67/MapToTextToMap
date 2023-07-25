import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { openDB, wrap } from "idb";
import "./SavedMindMap.scss";

const SavedMindMap = () => {
  const { id } = useParams();
  const [bubbles, setBubbles] = useState([]);
  const [mapTitle, setMapTitle] = useState("");

  useEffect(() => {
    // Fonction pour récupérer une carte mentale spécifique depuis IndexedDB
    const getMindMapFromIndexedDB = async () => {
      const DB_NAME = "mindMapDB";
      const DB_STORE_NAME = "mindMaps";
      const db = await openDB(DB_NAME, 1);
      const savedMindMap = await wrap(db)
        .get(DB_STORE_NAME, id)
        .catch((error) => {
          console.error("Error getting saved mind map:", error);
          return null;
        });
      if (savedMindMap) {
        setBubbles(savedMindMap.bubbles);
        setMapTitle(savedMindMap.title);
      } else {
        setBubbles([]);
        setMapTitle("");
      }
    };

    getMindMapFromIndexedDB();
  }, [id]);

  return (
    <div className="saved-mind-map">
      <h2>{mapTitle}</h2>
      {bubbles.map((bubble) => (
        <div key={bubble.id} className={`bubble ${bubble.importance}`}>
          <p>{bubble.text}</p>
          <div className="keywords-container">
            <h3>Mots-clés :</h3>
            {bubble.keywords.map((keyword) => (
              <span key={keyword.id} className="keyword">
                {keyword.value}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedMindMap;
