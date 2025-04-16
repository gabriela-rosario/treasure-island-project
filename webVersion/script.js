const grid = document.getElementById('game-grid');
const startBtn = document.getElementById('start-btn');
const numRows = 6;
const numCols = 6;

// starting positions for player, shovel, and treasure
let playerPosition = { row: 0, col: 0 };
const shovelPosition = { row: 2, col: 1 };
const treasurePosition = { row: 5, col: 5 };

// position for obstacles
const obstacles = [
    { row: 1, col: 1 },
    { row: 3, col: 3 },
    { row: 4, col: 2 }
];

//create th grid
function createGrid() {
    grid.innerHTML = '';

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            // create new tile (div element)
            const cell = document.createElement('div');
            cell.classList.add('tile');

            // check if this cell should be the player
            if (row === playerPosition.row && col === playerPosition.col) {
                cell.classList.add('player');
            }

            // check for shovel
            if (row === shovelPosition.row && col === shovelPosition.col) {
                cell.classList.add('shovel');
                cell.innerHTML = '<img src="images/shovel.png" alt="shovel">';
            }

            // check for treasure
            if (row === treasurePosition.row && col === treasurePosition.col) {
                cell.classList.add('treasure');
                cell.innerHTML = '<img src="images/treasure.png" alt="treasure chest">';
            }

            // check for obstacles by looping through obstacle array
            for (let i = 0; i < obstacles.length; i++) {
                if (row === obstacles[i].row && col === obstacles[i].col) {
                cell.classList.add('obstacle');
                cell.innerHTML = '<img src="images/obstacle.png" alt="obstacle">';
                }
            }

            grid.appendChild(cell);
            }
            }
            }


            // depth-first-search function to find path from start to target
            function dfs(start, target) {
              // next positions to explore
              const stack = [start];

              // keeps track of visited tiles
              const visited = new Set();
              const path = [];

              // keep track of how it gets to each position
              const parentMap = {};

              function posToString(pos) {
                return `${pos.row},${pos.col}`;
              }

              while (stack.length > 0) {
                const current = stack.pop();
                const key = posToString(current);
                if (visited.has(key)) continue;

                visited.add(key);
                if (current.row === target.row && current.col === target.col) {
                  // build path
                  let pathNode = key;
                  while (pathNode !== posToString(start)) {
                    path.unshift(stringToPos(pathNode));
                    pathNode = parentMap[pathNode];
                  }
                  return path;
                }

                const directions = [
                  { row: -1, col: 0 }, // up
                  { row: 1, col: 0 },  // down
                  { row: 0, col: -1 }, // left
                  { row: 0, col: 1 }   // right
                ];

                for (let dir of directions) {
                  const newRow = current.row + dir.row;
                  const newCol = current.col + dir.col;

                  if (
                    newRow >= 0 && newRow < numRows &&
                    newCol >= 0 && newCol < numCols &&
                    !obstacles.some(ob => ob.row === newRow && ob.col === newCol)
                  ) {
                    const nextKey = `${newRow},${newCol}`;
                    if (!visited.has(nextKey)) {
                      parentMap[nextKey] = key;
                      stack.push({ row: newRow, col: newCol });
                    }
                  }
                }
              }

              return null; // no path found
            }

            function stringToPos(str) {
              const [row, col] = str.split(',').map(Number);
              return { row, col };
            }

            // function to display messages
            function showMessage(text) {
              const messageBox = document.getElementById('message');
              messageBox.textContent = text;
            }

            // move player along the path
            function movePlayer(path, onComplete) {
              let step = 0;
              const interval = setInterval(() => {
                if (step >= path.length) {
                  clearInterval(interval);
                  if (onComplete) onComplete();
                  return;
                }
                playerPosition = path[step];
                createGrid();
                step++;
              }, 300);
            }

            startBtn.addEventListener('click', () => {
                showMessage("AI is looking for the shovel...");

                const pathToShovel = dfs(playerPosition, shovelPosition);
                if (pathToShovel) {
                    movePlayer(pathToShovel, () => {
                        showMessage("Shovel found! Now searching for the treasure...");

                        // give player time to read message
                        setTimeout(() => {
                            const pathToTreasure = dfs(shovelPosition, treasurePosition);
                            if (pathToTreasure) {
                                movePlayer(pathToTreasure, () => {
                                    showMessage("Treasure found!");
                                    });
                                } else {
                                    showMessage("No path to treasure");
                            }
                            }, 1000); // delay before starting treasure search
                        });
                        } else {
                            showMessage("No path to shovel!");
                        }
            });