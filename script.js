class GameOfLife {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 8;
        this.running = false;
        this.fps = 10;
        this.lastFrame = 0;

        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Initialize grid
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.grid = this.createGrid();
        this.nextGrid = this.createGrid();

        // Add canvas click handler
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    resize() {
        // Make canvas fill 80% of the smaller screen dimension
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
        this.canvas.width = Math.floor(size / this.cellSize) * this.cellSize;
        this.canvas.height = Math.floor(size / this.cellSize) * this.cellSize;
    }

    createGrid() {
        return Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.grid[row][col] = this.grid[row][col] ? 0 : 1;
            this.draw();
        }
    }

    randomize() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col] = Math.random() > 0.7 ? 1 : 0;
            }
        }
        this.draw();
    }

    clear() {
        this.grid = this.createGrid();
        this.draw();
    }

    countNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = (row + i + this.rows) % this.rows;
                const newCol = (col + j + this.cols) % this.cols;
                count += this.grid[newRow][newCol];
            }
        }
        return count;
    }

    update() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const neighbors = this.countNeighbors(row, col);
                const cell = this.grid[row][col];

                if (cell === 1 && (neighbors < 2 || neighbors > 3)) {
                    this.nextGrid[row][col] = 0;
                } else if (cell === 0 && neighbors === 3) {
                    this.nextGrid[row][col] = 1;
                } else {
                    this.nextGrid[row][col] = cell;
                }
            }
        }

        // Swap grids
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col]) {
                    // Draw glow effect with smaller blur for smaller cells
                    this.ctx.shadowColor = '#00ff00';
                    this.ctx.shadowBlur = 5;
                    this.ctx.fillStyle = '#00ff00';
                    this.ctx.fillRect(
                        col * this.cellSize,
                        row * this.cellSize,
                        this.cellSize - 1,
                        this.cellSize - 1
                    );
                    // Reset shadow for better performance
                    this.ctx.shadowBlur = 0;
                }
            }
        }
    }

    animate(timestamp) {
        if (!this.running) return;

        const elapsed = timestamp - this.lastFrame;
        if (elapsed > 1000 / this.fps) {
            this.update();
            this.draw();
            this.lastFrame = timestamp;
        }

        requestAnimationFrame((ts) => this.animate(ts));
    }

    start() {
        if (!this.running) {
            this.running = true;
            this.animate(performance.now());
        }
    }

    stop() {
        this.running = false;
    }

    setFPS(fps) {
        this.fps = fps;
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new GameOfLife(canvas);
    const startBtn = document.getElementById('startBtn');
    const clearBtn = document.getElementById('clearBtn');
    const randomBtn = document.getElementById('randomBtn');
    const speedInput = document.getElementById('speed');
    const speedValue = document.getElementById('speedValue');

    startBtn.addEventListener('click', () => {
        if (game.running) {
            game.stop();
            startBtn.textContent = 'Start';
        } else {
            game.start();
            startBtn.textContent = 'Pause';
        }
    });

    clearBtn.addEventListener('click', () => {
        game.clear();
        game.stop();
        startBtn.textContent = 'Start';
    });

    randomBtn.addEventListener('click', () => {
        game.randomize();
    });

    speedInput.addEventListener('input', (e) => {
        const fps = parseInt(e.target.value);
        game.setFPS(fps);
        speedValue.textContent = `${fps} FPS`;
    });

    // Initial draw
    game.draw();
});
