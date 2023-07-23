import React from "react";
import { Link } from "react-router-dom";

import "./Header.scss";

const Header = () => {
  return (
    <header>
      <h1>MapToTextToMap</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">Créer une Map</Link>
          </li>
          <li>
            <Link to="/mindmaps">Listes des Maps</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
