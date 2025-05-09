document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const currentPlayerDisplay = document.getElementById('current-player');
    const resetButton = document.getElementById('reset-button');

    // Game state
    let currentPlayer = 1; // 1 for Player 1 (Black), 2 for Player 2 (White)
    let gameActive = true;
    let occupiedPoints = {}; // Will store the occupied points and by which player
    let remainingCoins = {
        1: 9, // Player 1 has 9 coins
        2: 9  // Player 2 has 9 coins
    };
    let removingCoin = false; // Flag to indicate if we're in the "removing coin" phase
    let lastLineFormed = false; // Flag to track if a line was formed in the last move
    let movementPhase = false; // Flag to indicate if we're in the movement phase
    let selectedCoin = null; // Track the selected coin for movement
    
    // Store lines formed by players to check if a coin is part of a line
    let playerLines = {
        1: [], // Each entry will be an array of 3 pointIds
        2: []
    };
    
    // Store the lines formed in the current turn
    let currentTurnNewLines = [];

    // Board configuration
    const boardSize = 400;
    const squareSizes = [400, 266, 133]; // Sizes of the three squares

    // Points coordinates where coins can be placed (intersections)
    const points = [];
    
    // Map to store adjacent points for each point
    const adjacentPointsMap = {};

    // Create coin counters in the UI
    function createCoinCounters() {
        // This function is no longer needed as we use static HTML for coin counters and game message
        // No need to create any elements here anymore
    }

    // Create the board with lines
    function createBoard() {
        // Track point number for sequential labeling
        let pointNumber = 1;
        
        // Create the outer square
        for (let i = 0; i < 3; i++) {
            const size = squareSizes[i];
            const offset = (boardSize - size) / 2;

            // Horizontal lines
            const topLine = createBoardLine('horizontal');
            topLine.style.top = `${offset}px`;
            topLine.style.left = `${offset}px`;
            topLine.style.width = `${size}px`;

            const bottomLine = createBoardLine('horizontal');
            bottomLine.style.top = `${boardSize - offset}px`;
            bottomLine.style.left = `${offset}px`;
            bottomLine.style.width = `${size}px`;

            // Vertical lines
            const leftLine = createBoardLine('vertical');
            leftLine.style.left = `${offset}px`;
            leftLine.style.top = `${offset}px`;
            leftLine.style.height = `${size}px`;

            const rightLine = createBoardLine('vertical');
            rightLine.style.left = `${boardSize - offset}px`;
            rightLine.style.top = `${offset}px`;
            rightLine.style.height = `${size}px`;

            gameBoard.appendChild(topLine);
            gameBoard.appendChild(bottomLine);
            gameBoard.appendChild(leftLine);
            gameBoard.appendChild(rightLine);

            // Add points at corners and midpoints of each square
            if (i === 0) {
                // Outer square - corners
                addPoint(offset, offset, pointNumber++); // Top-left
                addPoint(offset, boardSize - offset, pointNumber++); // Bottom-left
                addPoint(boardSize - offset, offset, pointNumber++); // Top-right
                addPoint(boardSize - offset, boardSize - offset, pointNumber++); // Bottom-right
                
                // Outer square - midpoints
                addPoint(offset, boardSize / 2, pointNumber++); // Middle-left
                addPoint(boardSize - offset, boardSize / 2, pointNumber++); // Middle-right
                addPoint(boardSize / 2, offset, pointNumber++); // Middle-top
                addPoint(boardSize / 2, boardSize - offset, pointNumber++); // Middle-bottom
            } else if (i === 1) {
                // Middle square - corners
                addPoint(offset, offset, pointNumber++); // Top-left
                addPoint(offset, boardSize - offset, pointNumber++); // Bottom-left
                addPoint(boardSize - offset, offset, pointNumber++); // Top-right
                addPoint(boardSize - offset, boardSize - offset, pointNumber++); // Bottom-right
                
                // Middle square - midpoints
                addPoint(offset, boardSize / 2, pointNumber++); // Middle-left
                addPoint(boardSize - offset, boardSize / 2, pointNumber++); // Middle-right
                addPoint(boardSize / 2, offset, pointNumber++); // Middle-top
                addPoint(boardSize / 2, boardSize - offset, pointNumber++); // Middle-bottom
            } else if (i === 2) {
                // Inner square - corners
                addPoint(offset, offset, pointNumber++); // Top-left
                addPoint(offset, boardSize - offset, pointNumber++); // Bottom-left
                addPoint(boardSize - offset, offset, pointNumber++); // Top-right
                addPoint(boardSize - offset, boardSize - offset, pointNumber++); // Bottom-right
                
                // Inner square - midpoints
                addPoint(offset, boardSize / 2, pointNumber++); // Middle-left
                addPoint(boardSize - offset, boardSize / 2, pointNumber++); // Middle-right
                addPoint(boardSize / 2, offset, pointNumber++); // Middle-top
                addPoint(boardSize / 2, boardSize - offset, pointNumber++); // Middle-bottom
            }
        }
        
        // Add connecting lines between squares (the "spokes")
        createConnectingLines();
        
        // Calculate adjacent points for each point
        calculateAdjacentPoints();
        
        // Debug log to verify adjacency map for point 24
        const point24 = points.find(p => p.number === 24);
        if (point24) {
            console.log("Adjacent to point 24:", adjacentPointsMap[point24.id]);
        }
    }
    
    // Create connecting lines between squares
    function createConnectingLines() {
        // Create lines between midpoints of the squares (the "spokes")
        const connections = [
            // Left side spoke: 5 -> 13 -> 21
            { from: 5, to: 13 },
            { from: 13, to: 21 },
            
            // Top side spoke: 7 -> 15 -> 23
            { from: 7, to: 15 },
            { from: 15, to: 23 },
            
            // Right side spoke: 6 -> 14 -> 22
            { from: 6, to: 14 },
            { from: 14, to: 22 },
            
            // Bottom side spoke: 8 -> 16 -> 24
            { from: 8, to: 16 },
            { from: 16, to: 24 }
        ];
        
        // Create each line
        connections.forEach(conn => {
            // Find the points by their numbers
            const fromPoint = points.find(p => p.number === conn.from);
            const toPoint = points.find(p => p.number === conn.to);
            
            if (fromPoint && toPoint) {
                // Create a line between these points
                const line = document.createElement('div');
                line.classList.add('board-line', 'connecting-line');
                
                // Calculate the angle and length of the line
                const dx = toPoint.x - fromPoint.x;
                const dy = toPoint.y - fromPoint.y;
                const length = Math.sqrt(dx*dx + dy*dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                
                // Position and rotate the line
                line.style.left = `${fromPoint.x}px`;
                line.style.top = `${fromPoint.y}px`;
                line.style.width = `${length}px`;
                line.style.height = '1px'; // Thinner height for consistency
                line.style.transformOrigin = '0 0';
                line.style.transform = `rotate(${angle}deg)`;
                
                // Add to the board
                gameBoard.appendChild(line);
            }
        });
    }

    // Calculate all adjacent points for each point
    function calculateAdjacentPoints() {
        points.forEach(point => {
            adjacentPointsMap[point.id] = findAdjacentPoints(point);
        });
        
        // Debug log all adjacency connections
        debugAdjacentPoints();
    }
    
    // Debug function to log all adjacency connections
    function debugAdjacentPoints() {
        console.log("--- ADJACENCY MAP DEBUGGING ---");
        points.forEach(point => {
            const adjacentIds = adjacentPointsMap[point.id] || [];
            const adjacentPointNumbers = adjacentIds.map(id => {
                const adjacentPoint = points.find(p => p.id === id);
                return adjacentPoint ? adjacentPoint.number : 'unknown';
            }).sort((a, b) => a - b);
            
            console.log(`Point ${point.number} is adjacent to: ${adjacentPointNumbers.join(', ')}`);
        });
        
        // Specifically check the connections we're concerned about
        checkSpecificConnection(23, 24, "Point 23 should NOT be connected to point 24");
        checkSpecificConnection(24, 23, "Point 24 should NOT be connected to point 23");
        console.log("--- END ADJACENCY DEBUGGING ---");
    }

    // Check if two points are connected and log the result
    function checkSpecificConnection(point1, point2, message) {
        const point1Object = points.find(p => p.number === point1);
        const point2Object = points.find(p => p.number === point2);
        
        if (!point1Object || !point2Object) {
            console.log(`Cannot check connection - points not found`);
            return;
        }
        
        const isConnected = adjacentPointsMap[point1Object.id] && 
                            adjacentPointsMap[point1Object.id].includes(point2Object.id);
        
        console.log(`${message}: ${isConnected ? 'CONNECTED!' : 'not connected'}`);
    }

    // Find all adjacent points for a given point
    function findAdjacentPoints(point) {
        const adjacent = [];
        
        // Get the point number for the current point
        const pointNumber = point.number;
        
        // Check if the point is on inner, middle, or outer square
        const isOuterSquare = pointNumber <= 8;
        const isMiddleSquare = pointNumber > 8 && pointNumber <= 16;
        const isInnerSquare = pointNumber > 16;
        
        // Define adjacency based on the board's logical structure and physical connections
        // Points can only be adjacent if they're connected by a direct line
        
        switch (pointNumber) {
            // Outer square - corners
            case 1: // Top-left corner
                adjacent.push(...findPointsByNumbers([5, 7]));
                break;
            case 2: // Bottom-left corner
                adjacent.push(...findPointsByNumbers([5, 8]));
                break;
            case 3: // Top-right corner
                adjacent.push(...findPointsByNumbers([6, 7]));
                break;
            case 4: // Bottom-right corner
                adjacent.push(...findPointsByNumbers([6, 8]));
                break;
            
            // Outer square - midpoints
            case 5: // Middle-left
                adjacent.push(...findPointsByNumbers([1, 2, 13]));
                break;
            case 6: // Middle-right
                adjacent.push(...findPointsByNumbers([3, 4, 14]));
                break;
            case 7: // Middle-top
                adjacent.push(...findPointsByNumbers([1, 3, 15]));
                break;
            case 8: // Middle-bottom
                adjacent.push(...findPointsByNumbers([2, 4, 16]));
                break;
            
            // Middle square - corners
            case 9: // Top-left corner
                adjacent.push(...findPointsByNumbers([13, 15]));
                break;
            case 10: // Bottom-left corner
                adjacent.push(...findPointsByNumbers([13, 16]));
                break;
            case 11: // Top-right corner
                adjacent.push(...findPointsByNumbers([14, 15]));
                break;
            case 12: // Bottom-right corner
                adjacent.push(...findPointsByNumbers([14, 16]));
                break;
            
            // Middle square - midpoints
            case 13: // Middle-left
                adjacent.push(...findPointsByNumbers([5, 9, 10, 21]));
                break;
            case 14: // Middle-right
                adjacent.push(...findPointsByNumbers([6, 11, 12, 22]));
                break;
            case 15: // Middle-top
                adjacent.push(...findPointsByNumbers([7, 9, 11, 23]));
                break;
            case 16: // Middle-bottom
                adjacent.push(...findPointsByNumbers([8, 10, 12, 24]));
                break;
            
            // Inner square - corners
            case 17: // Top-left corner
                adjacent.push(...findPointsByNumbers([21, 23]));
                break;
            case 18: // Bottom-left corner
                adjacent.push(...findPointsByNumbers([21, 24]));
                break;
            case 19: // Top-right corner
                adjacent.push(...findPointsByNumbers([22, 23]));
                break;
            case 20: // Bottom-right corner
                adjacent.push(...findPointsByNumbers([22, 24]));
                break;
            
            // Inner square - midpoints
            case 21: // Middle-left
                adjacent.push(...findPointsByNumbers([13, 17, 18]));
                break;
            case 22: // Middle-right
                adjacent.push(...findPointsByNumbers([14, 19, 20]));
                break;
            case 23: // Middle-top
                adjacent.push(...findPointsByNumbers([15, 17, 19]));
                break;
            case 24: // Middle-bottom
                adjacent.push(...findPointsByNumbers([16, 18, 20]));
                break;
        }
        
        // Log for debugging
        if (pointNumber === 17) {
            console.log(`Point 17 adjacent to: ${adjacent.map(p => p.number).join(', ')}`);
        }
        
        // Return the adjacent point IDs
        return adjacent.map(p => p.id);
    }

    // Helper function to find points by their numbers
    function findPointsByNumbers(numbers) {
        return points.filter(p => numbers.includes(p.number));
    }

    // Helper function to create board lines
    function createBoardLine(orientation) {
        const line = document.createElement('div');
        line.classList.add('board-line', orientation);
        return line;
    }

    // Add a point (intersection) where coins can be placed
    function addPoint(x, y, pointNumber) {
        // Check if point already exists
        const pointExists = points.some(p => Math.abs(p.x - x) < 5 && Math.abs(p.y - y) < 5);
        if (pointExists) return;

        // Create a unique ID for the point
        const pointId = `point-${x}-${y}`;
        
        // Add to points array
        points.push({ x, y, id: pointId, number: pointNumber });
        
        // Create and position the point element
        const pointElement = document.createElement('div');
        pointElement.classList.add('point');
        pointElement.id = pointId;
        pointElement.style.left = `${x}px`;
        pointElement.style.top = `${y}px`;
        
        // Add position number beside the point
        const numberSpan = document.createElement('div');
        numberSpan.classList.add('point-number');
        numberSpan.textContent = pointNumber;
        
        // Position the number beside the point (slightly to the right and down)
        numberSpan.style.left = `${x + 12}px`;
        numberSpan.style.top = `${y - 12}px`;
        
        // Add click event
        pointElement.addEventListener('click', () => handlePointClick(pointId, x, y));
        
        gameBoard.appendChild(pointElement);
        gameBoard.appendChild(numberSpan);
    }

    // Display game message
    function showMessage(message) {
        const messageArea = document.getElementById('game-message');
        if (messageArea) {
            messageArea.textContent = message;
        }
    }

    // Update coin counter display
    function updateCoinCounters() {
        const p1CountElement = document.querySelector('#player1-coins .coin-count');
        const p2CountElement = document.querySelector('#player2-coins .coin-count');
        
        if (p1CountElement && p2CountElement) {
            p1CountElement.textContent = remainingCoins[1];
            p2CountElement.textContent = remainingCoins[2];
        }
    }

    // Handle click on a point
    function handlePointClick(pointId, x, y) {
        // If game is not active, do nothing
        if (!gameActive) {
            return;
        }

        // If we're in removing coin mode
        if (removingCoin) {
            handleRemoveCoin(pointId);
            return;
        }

        // If we're in movement phase
        if (movementPhase) {
            handleMovementPhase(pointId, x, y);
            return;
        }

        // Normal coin placement mode
        // Check if point is not already occupied
        if (occupiedPoints[pointId]) {
            return;
        }
        
        // Check if player has coins left
        if (remainingCoins[currentPlayer] <= 0) {
            // If no coins left, enter movement phase
            movementPhase = true;
            showMessage(`All coins placed! Player ${currentPlayer} - select one of your coins to move.`);
            highlightPlayerCoins(currentPlayer);
            return;
        }

        // Mark point as occupied by current player
        occupiedPoints[pointId] = currentPlayer;
        
        // Place coin and decrease counter
        placeCoin(x, y, currentPlayer);
        remainingCoins[currentPlayer]--;
        updateCoinCounters();
        
        // Update all lines
        recalculateAllLines();
        
        // Clear any previous turn's new lines
        currentTurnNewLines = [];
        
        // Check for newly formed lines
        const newLines = findNewLines(currentPlayer, pointId);
        if (newLines.length > 0) {
            // Store the new lines
            currentTurnNewLines = newLines;
            
            // Enter coin removal mode
            removingCoin = true;
            showMessage(`Player ${currentPlayer} formed a new line! Select an opponent's coin to remove.`);
            highlightRemovableOpponentCoins();
            return;
        }
        
        // If all coins are now placed but no new line was formed, enter movement phase
        if (remainingCoins[1] === 0 && remainingCoins[2] === 0 && !movementPhase) {
            movementPhase = true;
            showMessage(`All coins placed! Player ${currentPlayer} - select one of your coins to move.`);
            highlightPlayerCoins(currentPlayer);
            return;
        }
        
        // Switch player
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updatePlayerDisplay();
    }

    // Handle the movement phase of the game
    function handleMovementPhase(pointId, x, y) {
        // If no coin is selected, try to select one of the player's coins
        if (!selectedCoin) {
            // First, check if either player has only 2 coins left
            const player1Coins = countPlayerCoins(1);
            const player2Coins = countPlayerCoins(2);
            
            if (player1Coins <= 2) {
                // Player 2 wins
                declareWinner(2);
                return;
            } else if (player2Coins <= 2) {
                // Player 1 wins
                declareWinner(1);
                return;
            }
            
            // Check if the clicked point has the current player's coin
            if (occupiedPoints[pointId] !== currentPlayer) {
                showMessage(`Player ${currentPlayer} - select one of YOUR coins to move.`);
                return;
            }
            
            // Select this coin for movement
            selectedCoin = { pointId, x, y };
            
            // Highlight valid move destinations
            highlightValidMoveDestinations(x, y);
            showMessage(`Select where to move your coin.`);
            return;
        }
        
        // If a coin is already selected, try to move it to the clicked point
        
        // Check if the clicked point is already occupied
        if (occupiedPoints[pointId]) {
            showMessage(`Cannot move to an occupied point. Select another destination.`);
            return;
        }
        
        // Check if this is a valid move (adjacent only)
        if (!isValidMove(selectedCoin.pointId, pointId)) {
            showMessage(`Invalid move. You can only move to an adjacent point horizontally or vertically.`);
            return;
        }
        
        // Remember which lines this coin was part of before moving
        const oldLines = findLinesContainingPoint(selectedCoin.pointId);
        
        // Remove the coin from its current position
        removeCoinFromBoard(selectedCoin.x, selectedCoin.y);
        delete occupiedPoints[selectedCoin.pointId];
        
        // Place the coin at the new position
        placeCoin(x, y, currentPlayer);
        occupiedPoints[pointId] = currentPlayer;
        
        // Clear selection and highlights
        selectedCoin = null;
        removeAllHighlights();
        
        // Update all lines
        recalculateAllLines();
        
        // Check for new lines formed by this move
        const newLines = findNewLines(currentPlayer, pointId, oldLines);
        if (newLines.length > 0) {
            // Store the new lines
            currentTurnNewLines = newLines;
            
            // Enter coin removal mode
            removingCoin = true;
            showMessage(`Player ${currentPlayer} formed a new line! Select an opponent's coin to remove.`);
            highlightRemovableOpponentCoins();
            return;
        }
        
        // Switch player
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updatePlayerDisplay();
        highlightPlayerCoins(currentPlayer);
        showMessage(`Player ${currentPlayer} - select one of your coins to move.`);
    }

    // Check if a move is valid (adjacent only)
    function isValidMove(fromPointId, toPointId) {
        // Get point numbers for both points
        const fromPointNumber = pointIdToNumber(fromPointId);
        const toPointNumber = pointIdToNumber(toPointId);
        
        // If we can't find either point number, the move is invalid
        if (fromPointNumber === -1 || toPointNumber === -1) {
            return false;
        }
        
        // Explicitly prevent moving from point 24 to point 23 or vice versa
        // These points are on opposite sides of the inner square and not directly connected
        if ((fromPointNumber === 24 && toPointNumber === 23) || 
            (fromPointNumber === 23 && toPointNumber === 24)) {
            console.log("Preventing invalid move between points 23 and 24");
            return false;
        }
        
        // Check if the destination point is in the list of adjacent points for the source point
        // This is the only valid move criteria - must be adjacent according to the adjacency map
        return adjacentPointsMap[fromPointId] && adjacentPointsMap[fromPointId].includes(toPointId);
    }

    // Highlight valid destinations for a selected coin
    function highlightValidMoveDestinations(x, y) {
        removeAllHighlights();
        
        const pointId = `point-${x}-${y}`;
        const pointNumber = pointIdToNumber(pointId);
        
        console.log(`Highlighting valid moves for point ${pointNumber} at ${pointId}`);
        
        // Get adjacent points from the map - these are the standard adjacent moves
        const adjacentPointIds = adjacentPointsMap[pointId] || [];
        
        // Log the adjacent points
        const adjacentPointNumbers = adjacentPointIds.map(id => {
            const point = points.find(p => p.id === id);
            return point ? point.number : 'unknown';
        }).sort((a, b) => a - b);
        
        console.log(`Adjacent to point ${pointNumber}: ${adjacentPointNumbers.join(', ')}`);
        
        // Highlight each valid (unoccupied) move destination
        const validMoves = [];
        adjacentPointIds.forEach(movePointId => {
            // Skip if the point is occupied
            if (occupiedPoints[movePointId]) {
                return;
            }
            
            const pointElement = document.getElementById(movePointId);
            if (pointElement) {
                pointElement.classList.add('valid-move');
                const movePointNumber = pointIdToNumber(movePointId);
                validMoves.push(movePointNumber);
            }
        });
        
        // Log the final valid moves
        console.log(`Final valid moves for point ${pointNumber}: ${validMoves.sort((a, b) => a - b).join(', ')}`);
        
        // Highlight the selected coin
        const coin = findCoinElement(x, y);
        if (coin) {
            coin.classList.add('selected');
        }
    }

    // Find a coin element at given coordinates
    function findCoinElement(x, y) {
        const coins = gameBoard.querySelectorAll('.coin');
        for (const coin of coins) {
            const coinX = parseInt(coin.style.left);
            const coinY = parseInt(coin.style.top);
            
            if (Math.abs(coinX - x) < 5 && Math.abs(coinY - y) < 5) {
                return coin;
            }
        }
        return null;
    }

    // Highlight the current player's coins for movement selection
    function highlightPlayerCoins(player) {
        removeAllHighlights();
        
        const playerColor = player === 1 ? 'black' : 'white';
        const playerCoins = gameBoard.querySelectorAll(`.coin.${playerColor}`);
        
        // Only highlight coins that have at least one valid move
        playerCoins.forEach(coin => {
            const coinX = parseInt(coin.style.left);
            const coinY = parseInt(coin.style.top);
            const pointId = `point-${coinX}-${coinY}`;
            
            // Check if this coin has any valid moves
            const hasValidMoves = hasValidMovesForCoin(pointId);
            
            if (hasValidMoves) {
                coin.classList.add('movable');
            }
        });
    }

    // Check if a coin has any valid moves
    function hasValidMovesForCoin(pointId) {
        // Get adjacent points from the map
        const adjacentPointIds = adjacentPointsMap[pointId] || [];
        
        // Check if any adjacent point is empty
        return adjacentPointIds.some(adjPointId => !occupiedPoints[adjPointId]);
    }

    // Highlight opponent's coins that can be removed (not part of a line)
    function highlightRemovableOpponentCoins() {
        removeAllHighlights();
        
        const opponent = currentPlayer === 1 ? 2 : 1;
        const opponentColor = opponent === 1 ? 'black' : 'white';
        
        // Get all protected points for the opponent
        const protectedPoints = new Set();
        
        // Check each line of the opponent
        playerLines[opponent].forEach(line => {
            // Add all points in this line to the protected set
            line.forEach(pointId => protectedPoints.add(pointId));
        });
        
        console.log(`Protected points for opponent (${opponent}):`, Array.from(protectedPoints));
        
        // Find all coins of the opponent
        const opponentCoins = gameBoard.querySelectorAll(`.coin.${opponentColor}`);
        
        // Add highlight to coins that are not part of a line
        let removableCoinsCount = 0;
        opponentCoins.forEach(coin => {
            const coinX = parseInt(coin.style.left);
            const coinY = parseInt(coin.style.top);
            const pointId = `point-${coinX}-${coinY}`;
            
            // If the coin is not in the protected set, it can be removed
            if (!protectedPoints.has(pointId)) {
                coin.classList.add('removable');
                removableCoinsCount++;
            }
        });
        
        // If no coins are removable, show message and auto-skip turn after delay
        if (removableCoinsCount === 0 && opponentCoins.length > 0) {
            showMessage("All opponent coins are protected! Your turn will be skipped.");
            setTimeout(() => {
                // Exit removal mode
                removingCoin = false;
                removeAllHighlights();
                
                // Switch player
                currentPlayer = currentPlayer === 1 ? 2 : 1;
                updatePlayerDisplay();
                
                if (movementPhase) {
                    highlightPlayerCoins(currentPlayer);
                    showMessage(`Player ${currentPlayer} - select one of your coins to move.`);
                } else {
                    showMessage("");
                }
            }, 2000);
        }
    }

    // Get all points that are part of lines for a player
    function getPointsInLines(player) {
        const linePoints = new Set();
        const playerColor = player === 1 ? 'black' : 'white';
        
        // Get all coins for this player
        const coins = [];
        for (const [pointId, coinPlayer] of Object.entries(occupiedPoints)) {
            if (coinPlayer === player) {
                const [, x, y] = pointId.split('-').map(Number);
                coins.push({x, y, pointId});
            }
        }
        
        // Check every possible combination of 3 positions
        for (let i = 0; i < coins.length; i++) {
            for (let j = i + 1; j < coins.length; j++) {
                for (let k = j + 1; k < coins.length; k++) {
                    const p1 = coins[i];
                    const p2 = coins[j];
                    const p3 = coins[k];
                    
                    // Check if these 3 points form a valid line (adjacent points in a straight line)
                    if (arePointsInLine(p1, p2, p3) && arePointsConnected(p1, p2, p3)) {
                        // Add all three points to the protected set
                        linePoints.add(p1.pointId);
                        linePoints.add(p2.pointId);
                        linePoints.add(p3.pointId);
                        
                        // Also check for lines visually present on the board
                        const lines = gameBoard.querySelectorAll('.win-line');
                        lines.forEach(line => {
                            if (line.dataset.points) {
                                const [startId, endId] = line.dataset.points.split(',');
                                linePoints.add(startId);
                                linePoints.add(endId);
                            }
                        });
                    }
                }
            }
        }
        
        // Log for debugging
        console.log(`Protected points for player ${player}: `, Array.from(linePoints));
        
        return Array.from(linePoints);
    }

    // Remove all highlights from the board
    function removeAllHighlights() {
        // Remove highlights from coins
        const coins = gameBoard.querySelectorAll('.coin');
        coins.forEach(coin => {
            coin.classList.remove('removable', 'movable', 'selected');
        });
        
        // Remove highlights from points
        const pointElements = gameBoard.querySelectorAll('.point');
        pointElements.forEach(point => {
            point.classList.remove('valid-move');
        });
    }

    // Handle removing an opponent's coin
    function handleRemoveCoin(pointId) {
        const opponent = currentPlayer === 1 ? 2 : 1;
        
        // Check if the point has the opponent's coin
        if (occupiedPoints[pointId] !== opponent) {
            showMessage("You must select an opponent's coin!");
            return;
        }
        
        // Get all protected points for the opponent
        const protectedPoints = new Set();
        
        // Check each line of the opponent
        playerLines[opponent].forEach(line => {
            // Add all points in this line to the protected set
            line.forEach(pointId => protectedPoints.add(pointId));
        });
        
        // Check if the coin is part of a line (can't remove those)
        if (protectedPoints.has(pointId)) {
            showMessage("You can't remove a coin that is part of a line!");
            
            // Check if all opponent coins are protected by being in lines
            const allCoinsProtected = checkIfAllCoinsProtected(opponent);
            if (allCoinsProtected) {
                showMessage("All opponent coins are protected! Your turn is skipped.");
                setTimeout(() => {
                    // Exit removal mode
                    removingCoin = false;
                    removeAllHighlights();
                    
                    // Switch player
                    currentPlayer = currentPlayer === 1 ? 2 : 1;
                    updatePlayerDisplay();
                    
                    if (movementPhase) {
                        highlightPlayerCoins(currentPlayer);
                        showMessage(`Player ${currentPlayer} - select one of your coins to move.`);
                    } else {
                        showMessage("");
                    }
                }, 2000);
            }
            return;
        }
        
        // Get coordinates from pointId
        const [, x, y] = pointId.split('-').map(Number);
        
        // Remove the coin from the game
        removeCoinFromBoard(x, y);
        
        // Update game state
        delete occupiedPoints[pointId];
        
        // Update lines after removal
        recalculateAllLines();
        
        // Check if opponent has less than 3 coins left - if so, current player wins
        // But only do this during movement phase (after all coins are placed)
        if (movementPhase) {
            const opponentRemainingCoins = countPlayerCoins(opponent);
            
            if (opponentRemainingCoins < 3) {
                declareWinner(currentPlayer);
                return;
            }
        }
        
        // Exit removal mode
        removingCoin = false;
        removeAllHighlights();
        showMessage("");
        
        // Check if we are in movement phase
        if (movementPhase) {
            // Switch player and highlight their coins
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updatePlayerDisplay();
            highlightPlayerCoins(currentPlayer);
            showMessage(`Player ${currentPlayer} - select one of your coins to move.`);
        } else {
            // Switch player
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updatePlayerDisplay();
        }
    }

    // Count the number of coins a player has on the board
    function countPlayerCoins(player) {
        let count = 0;
        
        for (const coinPlayer of Object.values(occupiedPoints)) {
            if (coinPlayer === player) {
                count++;
            }
        }
        
        return count;
    }

    // Check if all coins of a player are part of lines (protected)
    function checkIfAllCoinsProtected(player) {
        const playerCoins = Object.entries(occupiedPoints)
            .filter(([_, coinPlayer]) => coinPlayer === player)
            .map(([pointId, _]) => pointId);
        
        if (playerCoins.length === 0) return false;
        
        // Get all protected points for the player
        const protectedPoints = new Set();
        
        // Check each line of the player
        playerLines[player].forEach(line => {
            // Add all points in this line to the protected set
            line.forEach(pointId => protectedPoints.add(pointId));
        });
        
        // Check if every coin is in the protected set
        return playerCoins.every(pointId => protectedPoints.has(pointId));
    }

    // Remove a coin from the board
    function removeCoinFromBoard(x, y) {
        // Find and remove the coin element at these coordinates
        const coins = gameBoard.querySelectorAll('.coin');
        for (const coin of coins) {
            const coinX = parseInt(coin.style.left);
            const coinY = parseInt(coin.style.top);
            
            if (Math.abs(coinX - x) < 5 && Math.abs(coinY - y) < 5) {
                gameBoard.removeChild(coin);
                break;
            }
        }
    }

    // Place a coin on the board
    function placeCoin(x, y, player) {
        const coin = document.createElement('div');
        coin.classList.add('coin', player === 1 ? 'black' : 'white');
        coin.style.left = `${x}px`;
        coin.style.top = `${y}px`;
        
        // Add click handler for coin interaction
        coin.addEventListener('click', () => {
            const pointId = `point-${x}-${y}`;
            
            if (removingCoin) {
                // If in removal phase, only process click if the coin is removable
                if (coin.classList.contains('removable')) {
                    handleRemoveCoin(pointId);
                } else if (occupiedPoints[pointId] === (currentPlayer === 1 ? 2 : 1)) {
                    // If this is an opponent's coin but not removable, show a message
                    showMessage("You can't remove a coin that is part of a line!");
                }
            } else if (movementPhase && !selectedCoin && occupiedPoints[pointId] === currentPlayer) {
                // If in movement phase and no coin is selected, check if it belongs to current player
                
                // Check if this coin has any valid moves before selecting it
                if (hasValidMovesForCoin(pointId)) {
                    selectedCoin = { pointId, x, y };
                    highlightValidMoveDestinations(x, y);
                    showMessage(`Select where to move your coin.`);
                } else {
                    showMessage(`This coin has no valid moves. Select another coin.`);
                }
            }
        });
        
        gameBoard.appendChild(coin);
    }

    // Update the display to show current player
    function updatePlayerDisplay() {
        currentPlayerDisplay.textContent = `Player ${currentPlayer} (${currentPlayer === 1 ? 'Black' : 'White'})`;
    }

    // Reset the game
    function resetGame() {
        // Clear the board
        while (gameBoard.firstChild) {
            gameBoard.removeChild(gameBoard.firstChild);
        }
        
        // Clear any point numbers that might be outside the game board
        const pointNumbers = document.querySelectorAll('.point-number');
        pointNumbers.forEach(number => {
            if (number.parentNode) {
                number.parentNode.removeChild(number);
            }
        });
        
        // Reset game state
        currentPlayer = 1;
        gameActive = true;
        occupiedPoints = {};
        points.length = 0;
        remainingCoins = {
            1: 9,
            2: 9
        };
        removingCoin = false;
        lastLineFormed = false;
        movementPhase = false;
        selectedCoin = null;
        playerLines = {
            1: [],
            2: []
        };
        currentTurnNewLines = [];
        
        // Clear message
        showMessage("");
        
        // Recreate the board
        createBoard();
        updatePlayerDisplay();
        updateCoinCounters();
        
        // Recalculate all lines (should be none when game starts)
        recalculateAllLines();
    }

    // Check for win conditions
    function checkWin() {
        // Convert occupied points to a format easier to check
        const playerPositions = {
            1: [],
            2: []
        };
        
        for (const [pointId, player] of Object.entries(occupiedPoints)) {
            const [, x, y] = pointId.split('-').map(Number);
            playerPositions[player].push({ x, y, pointId });
        }
        
        // Check for 3 in a row for the current player
        return checkThreeInRow(playerPositions[currentPlayer]);
    }

    // Check if player has 3 coins in a row
    function checkThreeInRow(positions) {
        if (positions.length < 3) return false;
        
        let lineFound = false;
        
        // Check every possible combination of 3 positions
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                for (let k = j + 1; k < positions.length; k++) {
                    const p1 = positions[i];
                    const p2 = positions[j];
                    const p3 = positions[k];
                    
                    // Check if these 3 points form a valid line (adjacent points in a straight line)
                    if (arePointsInLine(p1, p2, p3) && arePointsConnected(p1, p2, p3)) {
                        // Create a line ID for easy comparison
                        const linePointIds = [p1.pointId, p2.pointId, p3.pointId].sort();
                        const lineId = linePointIds.join('-');
                        
                        // Check if this is a new line in this turn
                        const existingLine = playerLines[currentPlayer].some(line => 
                            line.sort().join('-') === lineId
                        );
                        
                        if (!existingLine) {
                            // Store this new line
                            playerLines[currentPlayer].push(linePointIds);
                            currentTurnNewLines.push(lineId);
                            
                            drawWinLine(p1, p2, p3, currentPlayer);
                            lineFound = true;
                        }
                    }
                }
            }
        }
        
        return lineFound;
    }

    // Check if three points form a valid connected line
    function areThreePointsConnected(p1, p2, p3) {
        // First check if they're in a straight line
        if (!isInLine(p1, p2, p3)) return false;
        
        // Then check if they are properly connected according to game rules
        return arePointsConnected(p1, p2, p3);
    }

    // Helper function to get x, y coordinates from point ID
    function getPointCoordinates(pointId) {
        const [, x, y] = pointId.split('-').map(Number);
        return { x, y, pointId };
    }

    // Check if three points form a valid connected line
    function arePointsConnected(p1, p2, p3) {
        // Sort the points by x or y coordinate depending on the line orientation
        const sameX = Math.abs(p1.x - p2.x) < 5 && Math.abs(p2.x - p3.x) < 5;
        
        let sorted;
        if (sameX) {
            // Sort by y if they have the same x
            sorted = [p1, p2, p3].sort((a, b) => a.y - b.y);
        } else {
            // Sort by x
            sorted = [p1, p2, p3].sort((a, b) => a.x - b.x);
        }
        
        const [a, b, c] = sorted;
        
        // First check: Each point must be adjacent to the next
        const aToBAdjacent = isValidMove(a.pointId, b.pointId);
        const bToCAdjacent = isValidMove(b.pointId, c.pointId);
        
        // If basic adjacency check fails, return false
        if (!aToBAdjacent || !bToCAdjacent) {
            console.log(`Points not adjacent: ${a.pointId}, ${b.pointId}, ${c.pointId}`);
            return false;
        }
        
        // Second check: All three points must be on the same square (outer, middle, inner)
        // or on the same "spoke" (connecting outer, middle, inner squares)
        
        // Extract point numbers (added during board creation)
        const aNumber = pointIdToNumber(a.pointId);
        const bNumber = pointIdToNumber(b.pointId);
        const cNumber = pointIdToNumber(c.pointId);
        
        console.log(`Checking points: ${aNumber}, ${bNumber}, ${cNumber}`);
        
        // Points 1-8 are on the outer square
        // Points 9-16 are on the middle square
        // Points 17-24 are on the inner square
        
        // Check if all points are on the same square
        const allOuterSquare = aNumber <= 8 && bNumber <= 8 && cNumber <= 8;
        const allMiddleSquare = aNumber > 8 && aNumber <= 16 && bNumber > 8 && bNumber <= 16 && cNumber > 8 && cNumber <= 16;
        const allInnerSquare = aNumber > 16 && bNumber > 16 && cNumber > 16;
        
        if (allOuterSquare || allMiddleSquare || allInnerSquare) {
            console.log(`All points on same square: ${allOuterSquare ? 'outer' : (allMiddleSquare ? 'middle' : 'inner')}`);
            return true;
        }
        
        // If not on same square, they must be on same "spoke" connecting squares
        // For each corner or midpoint, check if the points form a valid spoke
        
        // Check if points are at same relative position across different squares
        // E.g., point 1 (outer top-left), point 9 (middle top-left), point 17 (inner top-left)
        const relativePosition = (num) => {
            if (num <= 8) return num;
            if (num <= 16) return num - 8;
            return num - 16;
        };
        
        const aPos = relativePosition(aNumber);
        const bPos = relativePosition(bNumber);
        const cPos = relativePosition(cNumber);
        
        // If all points have the same relative position, they form a valid spoke
        if (aPos === bPos && bPos === cPos) {
            console.log(`Points form a valid spoke: ${aPos}`);
            return true;
        }
        
        console.log(`Points do not form a valid line: ${aNumber}, ${bNumber}, ${cNumber}`);
        return false;
    }

    // Helper function to convert pointId to its number
    function pointIdToNumber(pointId) {
        // Find the point in the points array
        const point = points.find(p => p.id === pointId);
        return point ? point.number : -1;
    }

    // Draw a line through the winning points
    function drawWinLine(p1, p2, p3, playerNum) {
        // Sort points to ensure we draw line from one end to the other
        let sorted;
        if (Math.abs(p1.x - p2.x) < 5 && Math.abs(p2.x - p3.x) < 5) {
            // Vertical line
            sorted = [p1, p2, p3].sort((a, b) => a.y - b.y);
        } else {
            // Horizontal or diagonal line
            sorted = [p1, p2, p3].sort((a, b) => a.x - b.x);
        }
        
        const start = sorted[0];
        const end = sorted[2];
        
        const line = document.createElement('div');
        line.classList.add('win-line');
        
        // Add player-specific class for styling
        if (playerNum) {
            line.classList.add(`player${playerNum}-line`);
        }
        
        // Calculate line length and angle
        const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
        
        // Style the line
        line.style.width = `${length}px`;
        line.style.height = '6px'; // Fixed height
        line.style.left = `${start.x}px`;
        line.style.top = `${start.y}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 0';
        
        // Store a reference to the line with its associated pointIds
        line.dataset.points = [start.pointId, end.pointId].join(',');
        line.dataset.player = playerNum || currentPlayer;
        
        gameBoard.appendChild(line);
    }

    // Event listener for reset button
    resetButton.addEventListener('click', resetGame);

    // Initialize the game
    createCoinCounters();
    createBoard();

    // Recalculate all lines after a move
    function recalculateAllLines() {
        // Clear existing lines tracking
        playerLines = {
            1: [],
            2: []
        };
        
        // Remove all visual line indicators
        const oldLines = gameBoard.querySelectorAll('.win-line');
        oldLines.forEach(line => gameBoard.removeChild(line));
        
        // Add debug logging
        console.log("Recalculating all lines...");
        
        // Check all possible combinations of three points for each player
        [1, 2].forEach(player => {
            const playerPositions = [];
            
            // Collect all positions for this player
            for (const [pointId, coinPlayer] of Object.entries(occupiedPoints)) {
                if (coinPlayer === player) {
                    const [, x, y] = pointId.split('-').map(Number);
                    playerPositions.push({ x, y, pointId });
                }
            }
            
            console.log(`Player ${player} positions:`, playerPositions);
            
            // Check all combinations of 3 positions
            if (playerPositions.length >= 3) {
                for (let i = 0; i < playerPositions.length; i++) {
                    for (let j = i + 1; j < playerPositions.length; j++) {
                        for (let k = j + 1; k < playerPositions.length; k++) {
                            const p1 = playerPositions[i];
                            const p2 = playerPositions[j];
                            const p3 = playerPositions[k];
                            
                            // Log the points being checked
                            console.log(`Checking points:`, p1, p2, p3);
                            
                            // Check if these points form a line
                            const isLine = arePointsInLine(p1, p2, p3);
                            const isConnected = arePointsConnected(p1, p2, p3);
                            
                            console.log(`In line: ${isLine}, Connected: ${isConnected}`);
                            
                            if (isLine && isConnected) {
                                // Add to player lines
                                const linePointIds = [p1.pointId, p2.pointId, p3.pointId].sort();
                                playerLines[player].push(linePointIds);
                                
                                // Draw the line for each player
                                drawWinLine(p1, p2, p3, player);
                                
                                console.log(`Line found for player ${player}:`, linePointIds);
                            }
                        }
                    }
                }
            }
        });
        
        console.log("Updated player lines:", playerLines);
    }

    // Simple check if points are in a straight line
    function arePointsInLine(p1, p2, p3) {
        // Check if all points have the same x-coordinate (vertical line)
        const sameX = Math.abs(p1.x - p2.x) < 5 && Math.abs(p2.x - p3.x) < 5;
        
        // Check if all points have the same y-coordinate (horizontal line)
        const sameY = Math.abs(p1.y - p2.y) < 5 && Math.abs(p2.y - p3.y) < 5;
        
        // Only horizontal or vertical lines are valid, not diagonal
        return sameX || sameY;
    }

    // Find new lines formed by placing a coin at a specific point
    function findNewLines(player, pointId, oldLines = []) {
        const newLines = [];
        
        // Convert old lines to strings for easy comparison
        const oldLineStrings = oldLines.map(line => line.sort().join(','));
        
        // Check current lines containing this point
        playerLines[player].forEach(line => {
            if (line.includes(pointId)) {
                // Convert to string for comparison
                const lineString = line.sort().join(',');
                
                // Check if this is a new line
                if (!oldLineStrings.includes(lineString)) {
                    newLines.push(line);
                }
            }
        });
        
        console.log(`New lines for player ${player} at point ${pointId}:`, newLines);
        return newLines;
    }

    // Find lines that contain a specific point
    function findLinesContainingPoint(pointId) {
        const lines = [];
        
        // Check both players' lines
        [1, 2].forEach(player => {
            playerLines[player].forEach(line => {
                if (line.includes(pointId)) {
                    lines.push([...line]); // Clone the line
                }
            });
        });
        
        return lines;
    }

    // Check if a point is part of any line
    function isPointInAnyLine(pointId, playerToCheck) {
        if (!playerLines[playerToCheck]) return false;
        
        // Check if any line contains this point
        return playerLines[playerToCheck].some(line => line.includes(pointId));
    }

    // Initialize the game board and points
    function initializeGame() {
        // Reset game state
        currentPlayer = 1;
        gamePhase = 'placement';
        currentTurnNewLines = [];
        occupiedPoints = {};
        selectedCoin = null;
        adjacentPoints = [];
        playerCoins = { 1: 0, 2: 0 };
        playerLines = { 1: [], 2: [] };
        removeCoinMode = false;
        
        // Clear the game board
        gameBoard.innerHTML = '';
        
        // Add status display
        statusDisplay = document.createElement('div');
        statusDisplay.id = 'status-display';
        document.body.appendChild(statusDisplay);
        
        // Create the board points
        createBoardPoints();
        
        // Update the game status
        updateGameStatus();
        
        // Find and display any initial lines
        recalculateAllLines();
    }

    // Update coin counter display
    function updateCoinCounters() {
        const p1CountElement = document.querySelector('#player1-coins .coin-count');
        const p2CountElement = document.querySelector('#player2-coins .coin-count');
        
        if (p1CountElement && p2CountElement) {
            p1CountElement.textContent = remainingCoins[1];
            p2CountElement.textContent = remainingCoins[2];
        }
    }

    // Function to declare a winner
    function declareWinner(winner) {
        gameActive = false;
        const loser = winner === 1 ? 2 : 1;
        
        showMessage(`🎉 Player ${winner} wins! Player ${loser} has fewer than 3 coins remaining. 🎉`);
        
        // Highlight the winner's remaining coins with victory animation
        const winnerColor = winner === 1 ? 'black' : 'white';
        const winnerCoins = gameBoard.querySelectorAll(`.coin.${winnerColor}`);
        
        winnerCoins.forEach(coin => {
            coin.classList.add('winner');
        });
        
        // Add victory effects to the board
        const victoryOverlay = document.createElement('div');
        victoryOverlay.classList.add('victory-overlay');
        victoryOverlay.innerHTML = `
            <div class="victory-message">
                <h2>Player ${winner} Wins!</h2>
                <p>Congratulations!</p>
            </div>
        `;
        
        // Add some confetti effects
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDelay = `${Math.random() * 3}s`;
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            victoryOverlay.appendChild(confetti);
        }
        
        gameBoard.appendChild(victoryOverlay);
    }
}); 
