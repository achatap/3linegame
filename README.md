# Three Square Coin Game

A strategic board game where players place and move coins to form lines and capture opponent pieces.

## How to Play

### Game Setup
- The game is played on a board with three concentric squares connected by lines at the corners and midpoints
- Each player has 9 coins (Player 1: Black, Player 2: White)
- Players take turns placing their coins on the board's intersections

### Game Rules
1. **Placement Phase**: 
   - Players take turns placing one coin at a time on any vacant intersection on the board
   - When a player forms a line of 3 adjacent coins (horizontal or vertical only, not diagonal), they can remove one of their opponent's coins that is not part of a line

2. **Movement Phase**:
   - After all 18 coins have been placed, players take turns moving their coins
   - Coins can move to adjacent vacant intersections or to the opposite side of the same square (opposite corners or opposite midpoints)
   - When a player forms a new line by moving a coin, they can remove one of their opponent's coins that is not part of a line
   - If all opponent coins are protected (part of lines), the turn is automatically skipped

3. **Winning the Game**:
   - A player wins when their opponent has fewer than 3 coins remaining
   - A player also wins if their opponent cannot make a valid move

## Features
- Interactive game board with visual guidance
- Coin counter to track remaining coins
- Special highlighting for valid moves and removable coins
- Line detection and protection system

## Getting Started

1. Clone this repository
2. Open `index.html` in your web browser
3. Enjoy the game!

## Game Rules

- Players can only place coins on the intersection points of the board.
- Once a coin is placed, it cannot be moved until the movement phase begins.
- Each player has exactly 9 coins to use in the placement phase.
- A valid line must consist of 3 adjacent coins in a straight line.
- During the movement phase, a coin can move to an adjacent empty position or to the opposite side of the same square.
- Only newly formed lines in the current turn allow a player to remove an opponent's coin.
- An opponent's coin that is part of a line of 3 cannot be removed.
- If all opponent coins are protected by being part of lines, the player's turn is skipped.
- After removing an opponent's coin, it's the opponent's turn to play.

## Files Included

- `index.html`: The game's HTML structure
- `styles.css`: CSS styling for the game board and UI
- `script.js`: JavaScript code containing the game logic

## Running the Game

Simply double-click the `index.html` file to open it in your default web browser. No installation or internet connection is required to play.

## Technology Used

This game is built using vanilla:
- HTML5
- CSS3
- JavaScript

No external libraries or frameworks are required. 
