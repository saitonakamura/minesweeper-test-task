import React from "react";
import ReactDOM from "react-dom";
import { Game } from "./Game";

import "./index.css";

const App = () => (
  <main>
    <Game />
  </main>
);

ReactDOM.render(<App />, document.querySelector("#root"));
