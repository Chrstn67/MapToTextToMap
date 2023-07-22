import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MindMap from "../MindMap/MindMap";

const SavedMindMap = () => {
  const { id } = useParams();
  const [savedMap, setSavedMap] = useState(null);

  // Récupérer le mind map spécifique depuis le local storage
  useEffect(() => {
    const savedMindMaps = JSON.parse(localStorage.getItem("mindMaps")) || [];
    const map = savedMindMaps.find((map) => map.id === id);
    setSavedMap(map);
  }, [id]);

  return (
    <div>
      <h1>{savedMap ? savedMap.title : "Mind Map non trouvé"}</h1>
      {savedMap && <MindMap savedMap={savedMap} />}
    </div>
  );
};

export default SavedMindMap;
