import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { openDB, wrap } from "idb";
import "./MindMapList.scss";

const MindMapList = () => {
  const [savedMindMaps, setSavedMindMaps] = useState([]);

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

      setSavedMindMaps(savedMindMaps);
    };

    getMindMapsFromIndexedDB();
  }, []);

  // Fonction pour supprimer une carte mentale de la liste
  const deleteMindMap = async (id) => {
    const DB_NAME = "mindMapDB";
    const DB_STORE_NAME = "mindMaps";
    const db = await openDB(DB_NAME, 1);
    const tx = db.transaction(DB_STORE_NAME, "readwrite");
    const store = tx.objectStore(DB_STORE_NAME);
    await store.delete(id);
    const updatedMindMaps = await wrap(store).getAll();
    setSavedMindMaps(updatedMindMaps);
  };

  return (
    <div className="mind-map-list">
      <h2>Liste des Cartes Mentales Sauvegardées</h2>
      {savedMindMaps.length === 0 ? (
        <p>Aucune carte mentale sauvegardée pour le moment.</p>
      ) : (
        <ul>
          {savedMindMaps.map((map) => (
            <li key={map.id}>
              <Link to={`/mindmap/${map.id}`}>{map.title}</Link>
              <button onClick={() => deleteMindMap(map.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MindMapList;
