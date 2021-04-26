type CellPublic = "opened" | "closed";

type CellPrivate = "mined" | "empty";

type Cell = { public: CellPublic; private: CellPrivate };

// Multidimensional array as a single array is probably better for cache linearity
// Not that it matters since I'm allocating all over the place
// Mostly did as challenge
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
    }
  | GamePlaying
  | { state: "lost" }
  | { state: "won"; time: number };

const intDivide = (x: number, divider: number) => Math.floor(x / divider);

const getCellIndex = (sizeX: number, x: number, y: number) => x + y * sizeX;

const coordsByCellIndex = (sizeX: number, index: number) => [
  index % sizeX,
  intDivide(index, sizeX),
];

export const getCell = (
  field: Field,
  sizeX: number,
  x: number,
  y: number
): Cell | undefined => field[getCellIndex(sizeX, x, y)];

const getCellPublic = (field: Field, sizeX: number, x: number, y: number) =>
  getCell(field, sizeX, x, y)?.public;

const generateField = (
  sizeX: number,
  sizeY: number,
  minesCount: number,
  firstX: number,
  firstY: number
): Field =>
  new Array(sizeX * sizeY).fill(undefined).map(
    (_, index): Cell => {
      if (getCellIndex(sizeX, firstX, firstY) === index) {
        return { public: "closed", private: "empty" };
      }

      const rnd = Math.random();
      if (rnd > 0.5 && minesCount > 0) {
        // argument mutation is usually frowned upon, but it's fine for the primitives and small function
        minesCount--;
        return { public: "closed", private: "mined" };
      } else {
        return { public: "closed", private: "empty" };
      }
    }
  );

export const createPredefinedField = (
  sizeX: number,
  sizeY: number,
  mines: Set<string>
) =>
  new Array(sizeX * sizeY).fill(undefined).map(
    (_, index): Cell => {
      const [x, y] = coordsByCellIndex(sizeX, index);
      return {
        public: "closed",
        private: mines.has(`${x}_${y}`) ? "mined" : "empty",
      };
    }
  );

export const createGame = (minesCount: number): Game => {
  const sizeX = 3;
  const sizeY = 3;
  return {
    state: "firstStep",
    sizeX,
    sizeY,
    startTime: Date.now(),
    minesCount,
  };
};

const changeFieldCell = (
  field: Field,
  sizeX: number,
  x: number,
  y: number,
  newCell: Cell
) =>
  field.map((cell, index) =>
    getCellIndex(sizeX, x, y) === index ? newCell : cell
  );

const hasWon = (game: Game) => false;

export const openCell = (game: Game, x: number, y: number): Game => {
  switch (game.state) {
    case "firstStep":
      return {
        state: "playing",
        sizeX: game.sizeX,
        sizeY: game.sizeY,
        startTime: game.startTime,
        field: generateField(game.sizeX, game.sizeY, game.minesCount, x, y),
      };
    case "playing":
      const cell = getCell(game.field, game.sizeX, x, y);
      if (cell?.public !== "closed") return game;

      if (cell.private === "empty") {
        const newGame = {
          ...game,
          field: changeFieldCell(game.field, game.sizeX, x, y, {
            public: "opened",
            private: "empty",
          }),
        };

        if (hasWon(newGame)) {
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
