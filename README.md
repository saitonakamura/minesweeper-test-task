# Minesweeper test task

## What was done

- Base game logic and basic ui
- Build configuration adapted from my pet project (https://github.com/saitonakamura/midi-explorer/tree/master/frontend)
- No fancy linters, only barebone ts and jest
- Basic tests for core logic
- Tailwind for styling
- Some basic ui components

## What could be done better

- There's a bug in mines distribution, there's a chance amount won't be exact
- Core logic uses immutable appoarch which is great for debugging, but perfomance can be improved if we'll use mutable data
- Using single array (instead of native multidimensional arr[][]) on the other hand may be error prone and more cumbersome to support

## Possible improvements

- Better overall design
- Win/lose screens that show mines locations