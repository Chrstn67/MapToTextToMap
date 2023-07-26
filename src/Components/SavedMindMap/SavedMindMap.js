import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { openDB } from "idb";
import "./SavedMindMap.scss";

const SavedMindMap = () => {
  const { id: mapId } = useParams();
  const [bubbles, setBubbles] = useState([]);
  const [mapTitle, setMapTitle] = useState("");

  useEffect(() => {
    // Fonction pour récupérer une carte mentale spécifique depuis IndexedDB
    const getMindMapFromIndexedDB = async () => {
      const DB_NAME = "mindMapDB";
      const DB_STORE_NAME = "mindMaps";
      const db = await openDB(DB_NAME, 1);
      
      try {
        const savedMindMaps = await db
        .get(DB_STORE_NAME, mapId)

        console.debug("savedMindMaps", savedMindMaps)

        savedMindMaps?.title && setMapTitle(savedMindMaps.title);

        if(Array.isArray(savedMindMaps?.bubbles)) {
          setBubbles(savedMindMaps.bubbles);
        } else {
          setBubbles([])
        }
      } catch(error) {
        console.error("Error getting saved mind maps:", error);
        setBubbles([]);
      }
    };

    getMindMapFromIndexedDB();
  }, [mapId]);

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
