import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "../Header/Header";
import MindMap from "../MindMap/MindMap";
import MindMapList from "../MindMapList/MindMapList";
import SavedMindMap from "../SavedMindMap/SavedMindMap";

function App() {
  const [savedMindMaps, setSavedMindMaps] = useState([]);

  useEffect(() => {
    const savedMindMaps = JSON.parse(localStorage.getItem("mindMaps")) || [];
    setSavedMindMaps(savedMindMaps);
  }, []);

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          {/* Passer les données des mind maps à MindMapList */}
          <Route
            path="/mindmaps"
            element={<MindMapList savedMindMaps={savedMindMaps} />}
          />
          {/* Autres routes sans modification */}
          <Route path="/" element={<MindMap />} />
          <Route path="/mindmap/:id" element={SavedMindMap} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
