import invariant from "tiny-invariant";
import {
  createGame,
  createPredefinedField,
  getCell,
  openCell,
} from "./minesweeper";

describe("minesweeper", () => {
  it("should be on first step when creating game", () => {
    const game = createGame(0);
    expect(game.state).toBe("firstStep");
  });

  it("should move from first step to playing when opening first cell", () => {
    const game = createGame(0);
    expect(game.state).toBe("firstStep");

    const newGame = openCell(game, 0, 0);
    expect(newGame.state).toBe("playing");
  });

  it("should open empty cell", () => {
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
      x,
      y
    );

    expect(game.state).toBe("playing");
    invariant(game.state === "playing");
    expect(getCell(game.field, game.sizeX, x, y)?.public).toBe("opened");
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
      x,
      y
    );

    expect(game.state).toBe("lost");
  });
});
