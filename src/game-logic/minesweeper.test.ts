import invariant from "tiny-invariant";
import {
  createGame,
  createPredefinedField,
  getCell,
  openCell,
} from "./minesweeper";

describe("minesweeper", () => {
  it("should be on first step when creating game", () => {
    const game = createGame(3, 3, 0);
    expect(game.state).toBe("firstStep");
  });

  it("should move from first step to playing when opening first cell", () => {
    const game = createGame(3, 3, 0);
    expect(game.state).toBe("firstStep");

    const newGame = openCell(game, [0, 0]);
    expect(newGame.state).toBe("playing");
  });

  it("should open empty cell with nearby mines", () => {
    const sizeX = 3;
    const sizeY = 3;
    const x = 0;
    const y = 1;
    const game = openCell(
      {
        state: "playing",
        sizeX,
        sizeY,
        field: createPredefinedField(sizeX, sizeY, new Set(["0_0"])),
        startTime: 0,
      },
      [x, y]
    );

    expect(game.state).toBe("playing");
    invariant(game.state === "playing");
    expect(getCell(game.field, game.sizeX, [x, y])?.public).toBe("opened");
  });

  it("should open empty cells with no nearby mines", () => {
    const sizeX = 3;
    const sizeY = 3;
    const x = 2;
    const y = 1;
    const game = openCell(
      {
        state: "playing",
        sizeX,
        sizeY,
        field: createPredefinedField(sizeX, sizeY, new Set(["0_0", "0_2"])),
        startTime: 0,
      },
      [x, y]
    );

    invariant(game.state === "playing");
    expect(getCell(game.field, game.sizeX, [1, 0])?.public).toBe("opened");
    expect(getCell(game.field, game.sizeX, [2, 0])?.public).toBe("opened");
    expect(getCell(game.field, game.sizeX, [1, 1])?.public).toBe("opened");
    expect(getCell(game.field, game.sizeX, [2, 1])?.public).toBe("opened");
    expect(getCell(game.field, game.sizeX, [1, 2])?.public).toBe("opened");
    expect(getCell(game.field, game.sizeX, [2, 2])?.public).toBe("opened");
  });

  it("should calculate nearby mines count correctly", () => {
    const sizeX = 3;
    const sizeY = 3;
    const x = 2;
    const y = 1;
    const game = openCell(
      {
        state: "playing",
        sizeX,
        sizeY,
        field: createPredefinedField(sizeX, sizeY, new Set(["0_0", "0_2"])),
        startTime: 0,
      },
      [x, y]
    );

    invariant(game.state === "playing");
    expect(getCell(game.field, game.sizeX, [0, 0])?.nearbyMines).toBe(0);
    expect(getCell(game.field, game.sizeX, [1, 0])?.nearbyMines).toBe(1);
    expect(getCell(game.field, game.sizeX, [2, 0])?.nearbyMines).toBe(0);
    expect(getCell(game.field, game.sizeX, [0, 1])?.nearbyMines).toBe(2);
    expect(getCell(game.field, game.sizeX, [1, 1])?.nearbyMines).toBe(2);
    expect(getCell(game.field, game.sizeX, [2, 1])?.nearbyMines).toBe(0);
    expect(getCell(game.field, game.sizeX, [0, 2])?.nearbyMines).toBe(0);
    expect(getCell(game.field, game.sizeX, [1, 2])?.nearbyMines).toBe(1);
    expect(getCell(game.field, game.sizeX, [2, 2])?.nearbyMines).toBe(0);
  });

  it("should lose when opening mined cell", () => {
    const sizeX = 3;
    const sizeY = 3;
    const x = 0;
    const y = 0;
    const game = openCell(
      {
        state: "playing",
        sizeX,
        sizeY,
        field: createPredefinedField(sizeX, sizeY, new Set(["0_0"])),
        startTime: 0,
      },
      [x, y]
    );

    expect(game.state).toBe("lost");
  });

  it("should won the game when all empty fields are opened", () => {
    const sizeX = 3;
    const sizeY = 3;

    let game = openCell(
      {
        state: "playing",
        sizeX,
        sizeY,
        field: createPredefinedField(sizeX, sizeY, new Set(["0_0", "0_2"])),
        startTime: 0,
      },
      [2, 1]
    );

    game = openCell(game, [0, 1]);

    expect(game.state).toBe("won");
  });
});
