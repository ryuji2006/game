// 盤面サイズ
const ROWS = 6, COLS = 6;
const CELL_SIZE = 100;
const WIDTH = COLS * CELL_SIZE;
const HEIGHT = ROWS * CELL_SIZE;

// 盤面データ
let board = [];
let state = [];
let currentTurn = 1;  // 1: 赤 (先攻), 2: 青 (後攻)
let firstMoves = 2;  // 最初の2手

function setup() {
    createCanvas(WIDTH, HEIGHT).parent("game-container");
    initializeBoard();
}

function initializeBoard() {
    for (let r = 0; r < ROWS; r++) {
        board[r] = Array(COLS).fill(0);
        state[r] = Array(COLS).fill(0);
    }
}

function draw() {
    background(255);
    drawBoard();
}

function drawBoard() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let x = c * CELL_SIZE;
            let y = r * CELL_SIZE;

            let color;
            if (board[r][c] === 1) {  // 赤
                color = state[r][c] === 1 ? [255, 200, 200] :
                        state[r][c] === 2 ? [255, 100, 100] :
                        state[r][c] === 3 ? [200, 50, 50] : [150, 0, 0];
            } else if (board[r][c] === 2) {  // 青
                color = state[r][c] === 1 ? [200, 200, 255] :
                        state[r][c] === 2 ? [100, 100, 255] :
                        state[r][c] === 3 ? [50, 50, 200] : [0, 0, 150];
            } else {
                color = [255, 255, 255];
            }

            fill(color);
            stroke(0);
            rect(x, y, CELL_SIZE, CELL_SIZE);

            if (state[r][c] > 0) {
                fill(0);
                textSize(32);
                textAlign(CENTER, CENTER);
                text(state[r][c], x + CELL_SIZE / 2, y + CELL_SIZE / 2);
            }
        }
    }
}

function mousePressed() {
    let c = floor(mouseX / CELL_SIZE);
    let r = floor(mouseY / CELL_SIZE);

    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;

    if (firstMoves > 0) {
        if (board[r][c] === 0) {
            board[r][c] = currentTurn;
            state[r][c] = 3;
            firstMoves--;
            currentTurn = 3 - currentTurn;
        }
        return;
    }

    if (board[r][c] === currentTurn) {
        if (state[r][c] === 3) {  // 状態③ → 状態④（拡散開始）
            state[r][c] = 4;
            processAllExplosions();
        } else if (state[r][c] === 1) {  // 状態① → 状態②
            state[r][c] = 2;
        } else if (state[r][c] === 2) {  // 状態② → 状態③
            state[r][c] = 3;
        }
        currentTurn = 3 - currentTurn;  // ターン交代
    }

    checkWinner();
}

function processAllExplosions() {
    let explosionQueue = [];

    // 初期状態4をすべてキューに追加
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (state[r][c] === 4) {
                explosionQueue.push([r, c]);
            }
        }
    }

    while (explosionQueue.length > 0) {
        let newQueue = [];

        while (explosionQueue.length > 0) {
            let [r, c] = explosionQueue.shift();
            let player = board[r][c];
            let directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

            for (let [dr, dc] of directions) {
                let nr = r + dr;
                let nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    if (board[nr][nc] === 0) {
                        board[nr][nc] = player;
                        state[nr][nc] = 1;
                    } else if (board[nr][nc] === player) {
                        if (state[nr][nc] < 3) {
                            state[nr][nc]++;
                        } else if (state[nr][nc] === 3) {
                            state[nr][nc] = 4;
                            newQueue.push([nr, nc]);  // すぐに爆発対象に追加
                        }
                    } else {
                        board[nr][nc] = player;
                        state[nr][nc]++;
                        // 状態が4になった場合、爆発対象に追加
                        if (state[nr][nc] === 4) {
                            newQueue.push([nr, nc]);
                        }
                    }
                }
            }

            // 爆発後は空に戻す
            board[r][c] = 0;
            state[r][c] = 0;
        }

        // 連鎖した状態4のマスをすべて処理
        explosionQueue = newQueue;
    }

    draw();
}

function checkWinner() {
    if (firstMoves > 0) return;

    let redCount = 0, blueCount = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === 1) redCount++;
            if (board[r][c] === 2) blueCount++;
        }
    }

    if (redCount === 0) {
        alert("後攻（青）の勝利！");
        noLoop();
    } else if (blueCount === 0) {
        alert("先攻（赤）の勝利！");
        noLoop();
    }
}
