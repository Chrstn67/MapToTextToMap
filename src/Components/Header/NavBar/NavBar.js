import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.scss";

const Navbar = () => {
  return (
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
  );
};

export default Navbar;
