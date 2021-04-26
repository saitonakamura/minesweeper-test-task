import React from "react";
import ReactDOM from "react-dom";
import { Game } from "./Game";

import "./index.css";

const App = () => (
  <main className="container mx-auto flex justify-center items-center h-screen">
    <Game />
  </main>
);

ReactDOM.render(<App />, document.querySelector("#root"));
