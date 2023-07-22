import React from "react";

const MindMapList = ({ savedMindMaps }) => {
  return (
    <div>
      <h2>Liste des cartes mentales sauvegardées :</h2>
      {savedMindMaps.map((mindMap) => (
        <div key={mindMap.id}>
          <span>{mindMap.title}</span>
        </div>
      ))}
    </div>
  );
};

export default MindMapList;
