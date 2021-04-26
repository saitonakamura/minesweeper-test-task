import React, { useCallback, useState } from "react";
import {
  createGame,
  createPredefinedField,
  getCoordsByCellIndex,
  getInitialGame,
  openCell,
} from "./game-logic/minesweeper";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

const formatTime = (ms: number) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "unit",
      // @ts-ignore
      unit: "millisecond",
    }).format(ms);
  } catch {
    return `${ms} ms`;
  }
};

export const Game = () => {
  const [game, setGame] = useState(getInitialGame());

  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  const [mines, setMines] = useState(2);

  const start = useCallback(() => setGame(createGame(columns, rows, mines)), [
    columns,
    rows,
    mines,
  ]);

  const playAgain = useCallback(() => setGame(getInitialGame()), []);

  switch (game.state) {
    case "firstStep":
    case "playing":
      return (
        <div
          className={`grid grid-rows-${game.sizeY} grid-cols-${game.sizeX} gap-10`}
        >
          {game.field.map((cell, index) => (
            <button
              key={index}
              className="rounded-md bg-gray-300 w-20 h-20 border-2 border-gray-600 drop-shadow-md "
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
      return (
        <div className="text-lg">
          {`Won, time: ${formatTime(game.time)}`}
          <Button onClick={playAgain} className="ml-3">
            Play again
          </Button>
        </div>
      );
    case "lost":
      return (
        <div className="text-lg">
          Lost,{" "}
          <Button onClick={playAgain} className="ml-3">
            Play again
          </Button>
        </div>
      );
    case "initial":
    default:
      return (
        <form className="flex flex-col gap-5">
          <label>
            <span>Columns</span>
            <Input
              className="ml-2"
              type="number"
              min={3}
              max={10}
              value={columns}
              onChange={(e) => setColumns(parseInt(e.currentTarget.value))}
            />
          </label>
          <label>
            <span>Rows</span>
            <Input
              className="ml-2"
              type="number"
              min={3}
              max={10}
              value={rows}
              onChange={(e) => setRows(parseInt(e.currentTarget.value))}
            />
          </label>
          <label>
            <span>Mines</span>
            <Input
              className="ml-2"
              type="number"
              min={Math.max(Math.floor((columns * rows) / 10), 1)}
              max={columns * rows - 1}
              value={mines}
              onChange={(e) => setMines(parseInt(e.currentTarget.value))}
            />
          </label>
          <Button onClick={start} type="submit">
            Start
          </Button>
        </form>
      );
  }
};
