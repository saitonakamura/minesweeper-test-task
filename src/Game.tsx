import React, { useCallback, useState } from "react";
import {
  createPredefinedField,
  getCoordsByCellIndex,
  getInitialGame,
  openCell,
} from "./game-logic/minesweeper";

export const Game = () => {
  const [game, setGame] = useState(getInitialGame());

  const start = useCallback(
    () =>
      setGame({
        state: "playing",
        sizeX: 3,
        sizeY: 3,
        startTime: Date.now(),
        field: createPredefinedField(3, 3, new Set(["0_0", "0_2"])),
      }),
    []
  );

  switch (game.state) {
    case "firstStep":
    case "playing":
      return (
        <div className="grid grid-rows-3 grid-cols-3">
          {game.field.map((cell, index) => (
            <button
              key={index}
              onClick={() =>
                setGame(openCell(game, getCoordsByCellIndex(game.sizeX, index)))
              }
            >
              {cell.public === "opened"
                ? cell.nearbyMines === 0
                  ? " "
                  : cell.nearbyMines
                : "X"}
            </button>
          ))}
        </div>
      );
    case "won":
      return <div>{`Won, time: ${game.time}`}</div>;
    case "lost":
      return (
        <div>
          Lost, <button onClick={start}>Play again</button>
        </div>
      );
    case "initial":
    default:
      return <button onClick={start}>Start</button>;
  }
};
