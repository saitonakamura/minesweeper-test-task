import produce from "immer";

type CellPublic = "opened" | "closed";

type CellPrivate = "mined" | "empty";

type Cell = { public: CellPublic; private: CellPrivate; nearbyMines: number };

// Multidimensional array as a single array is probably better for cache linearity
// Not that it matters since I'm allocating all over the place
// Mostly did as a challenge
type Field = Cell[];

export type GamePlaying = {
  state: "playing";
  sizeX: number;
  sizeY: number;
  startTime: number;
  field: Field;
};

export type Game =
  | { state: "initial" }
  | {
      state: "firstStep";
      sizeX: number;
      sizeY: number;
      startTime: number;
      minesCount: number;
      field: Field;
    }
  | GamePlaying
  | { state: "lost" }
  | { state: "won"; time: number };

const intDivide = (x: number, divider: number) => Math.floor(x / divider);

const getCellIndex = (sizeX: number, [x, y]: Coords) =>
  // Wonder if we need y size check too, I stumbled upon certain problems without this checks
  x >= 0 && y >= 0 && x < sizeX ? x + y * sizeX : -1;

export const getCoordsByCellIndex = (sizeX: number, index: number) =>
  [index % sizeX, intDivide(index, sizeX)] as const;

export const getCell = (
  field: Field,
  sizeX: number,
  coords: Coords
): Cell | undefined => field[getCellIndex(sizeX, coords)];

const getTop = ([x, y]: Coords) => [x, y - 1] as const;
const getTopRight = ([x, y]: Coords) => [x + 1, y - 1] as const;
const getRight = ([x, y]: Coords) => [x + 1, y] as const;
const getBottomRight = ([x, y]: Coords) => [x + 1, y + 1] as const;
const getBottom = ([x, y]: Coords) => [x, y + 1] as const;
const getBottomLeft = ([x, y]: Coords) => [x - 1, y + 1] as const;
const getLeft = ([x, y]: Coords) => [x - 1, y] as const;
const getTopLeft = ([x, y]: Coords) => [x - 1, y - 1] as const;

type Coords = readonly [number, number];

const getAllNearbyCoords = (coords: Coords): Coords[] =>
  [
    getTop,
    getTopRight,
    getRight,
    getBottomRight,
    getBottom,
    getBottomLeft,
    getLeft,
    getTopLeft,
  ].map((func) => func(coords));

const getAllNearbyCells = (field: Field, sizeX: number, coords: Coords) =>
  getAllNearbyCoords(coords).map(
    (coord) => [getCell(field, sizeX, coord), coord] as const
  );

const countNearbyMines = (field: Field, sizeX: number) =>
  field.map((cell, index) => {
    const coords = getCoordsByCellIndex(sizeX, index);
    const nearbyMines = getAllNearbyCells(field, sizeX, coords).reduce(
      (acc, [cell]) => {
        return acc + (cell?.private === "mined" ? 1 : 0);
      },
      0
    );
    return {
      ...cell,
      nearbyMines,
    };
  });

export const isOpenedCellNearby = (
  field: Field,
  sizeX: number,
  coords: readonly [number, number]
) =>
  getAllNearbyCells(field, sizeX, coords).reduce(
    (acc, [cell]) => acc || (cell?.public === "opened" ? true : false),
    false
  );

export const createPredefinedField = (
  sizeX: number,
  sizeY: number,
  mines?: Set<string>
) =>
  countNearbyMines(
    new Array(sizeX * sizeY).fill(undefined).map(
      (_, index): Cell => {
        const [x, y] = getCoordsByCellIndex(sizeX, index);
        return {
          public: "closed",
          private: mines?.has(`${x}_${y}`) ? "mined" : "empty",
          nearbyMines: 0,
        };
      }
    ),
    sizeX
  );

const generateField = (
  sizeX: number,
  sizeY: number,
  minesCount: number,
  firstCoords: Coords
): Field =>
  countNearbyMines(
    new Array(sizeX * sizeY).fill(undefined).map(
      (_, index): Cell => {
        if (getCellIndex(sizeX, firstCoords) === index) {
          return { public: "closed", private: "empty", nearbyMines: 0 };
        }

        // This doesn't guarantee mines count will be exactly as asked, so it's essentially a bug
        // It's probably better to randomly distribute needed amount throughout the field
        // There's definitely some algo for that
        // Maybe standard deviation can help more equal distrubition
        const rnd = Math.random();
        if (rnd > 0.5 && minesCount > 0) {
          // argument mutation is usually frowned upon, but it's fine for the primitives and small function
          minesCount--;
          return { public: "closed", private: "mined", nearbyMines: 0 };
        } else {
          return { public: "closed", private: "empty", nearbyMines: 0 };
        }
      }
    ),
    sizeX
  );

export const getInitialGame = (): Game => ({
  state: "initial",
});

export const createGame = (minesCount: number): Game => {
  const sizeX = 3;
  const sizeY = 3;
  return {
    state: "firstStep",
    sizeX,
    sizeY,
    startTime: Date.now(),
    minesCount,
    field: createPredefinedField(sizeX, sizeY),
  };
};

// Depth-first adaptation for opening cells
const openCellDfs = (field: Field, sizeX: number, coords: Coords) => {
  return produce(field, (field) => {
    const visited = new Set<string>();

    const dfs = (field: Field, sizeX: number, coords: Coords) => {
      const cell = getCell(field, sizeX, coords);
      if (!cell) {
        return;
      }

      cell.public = "opened";
      visited.add(coords.join("_"));

      if (cell.nearbyMines !== 0) {
        return;
      }

      for (const coord of getAllNearbyCoords(coords)) {
        const cell = getCell(field, sizeX, coord);

        if (
          cell &&
          cell.private === "empty" &&
          cell.nearbyMines === 0 &&
          !visited.has(coord.join("_"))
        ) {
          cell.public = "opened";
          visited.add(coord.join("_"));
          dfs(field, sizeX, coord);
        } else if (cell?.private === "empty") {
          cell.public = "opened";
          visited.add(coord.join("_"));
        }
      }
    };

    dfs(field, sizeX, coords);
  });
};

const hasWon = (field: Field) =>
  field.every(
    (cell) =>
      (cell.public === "opened" && cell.private === "empty") ||
      (cell.public === "closed" && cell.private === "mined")
  );

export const openCell = (game: Game, coords: Coords): Game => {
  switch (game.state) {
    case "firstStep":
      // Trick used in the original minesweeper - first opened cell is always not mined
      // So we're distributing mines after the first open
      const field = generateField(
        game.sizeX,
        game.sizeY,
        game.minesCount,
        coords
      );
      return {
        state: "playing",
        sizeX: game.sizeX,
        sizeY: game.sizeY,
        startTime: game.startTime,
        field: openCellDfs(field, game.sizeX, coords),
      };
    case "playing":
      const cell = getCell(game.field, game.sizeX, coords);
      if (cell?.public !== "closed") return game;

      if (cell.private === "empty") {
        const newGame = {
          ...game,
          field: openCellDfs(game.field, game.sizeX, coords),
        };

        if (hasWon(newGame.field)) {
          return {
            state: "won",
            time: Date.now() - game.startTime,
          };
        } else {
          return newGame;
        }
      }

      if (cell.private === "mined") {
        return { state: "lost" };
      }

      return game;
    default:
      return game;
  }
};
