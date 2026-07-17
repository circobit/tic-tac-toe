// Gameboard
// It is defined using an IIFE (Immediately Invoked
// Function Expression). It allows us to have one object
// which values cannot be altered outside of the
// methods defined within it. And since it's executed 
// right away, it cannot be duplicated.

const Gameboard = (() => {
	const rows = 3;
	const columns = 3;
	const board = [];

	// Helper to set an empty board or reset it
	function resetBoard() {
		// Empty the board array. For truncating
		// constants, which cannot be reassigned 
		// like `board = [];`, we can set its length to
		// zero to have it cleaned before rebuilding it.
		board.length = 0;
		for (let i = 0; i < rows; i++) {
			// Add rows and columns in each row. Use an empty 
			// string to make it easier to render the dashboard by 
			// avoiding unnecessary checks. Use the format 
			// 'Array(columns).fill("")' to avoid an inner loop.
			board[i] = Array(columns).fill("");
		}
	};

	// Call the function to reset the board
	resetBoard();

	// Return current dashboard
	function getBoard() {
		return board;
	};

	// Place a mark on the dashboard
	function placeMark(row, column, mark) {
		// Allow to mark just available spots
		// identified by empty strings.
		if (board[row][column] === "") {
			board[row][column] = mark;
			// Return true if the mark is successfully
			// placed. Otherwise, return false.
			return true;
		} else {
			return false;
		};
	};

	// Function to check if the board is full
	function isFull() {
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < columns; j++) {
				if (board[i][j] === "") {
					return false;
				}
			};
		};
		return true;
	};

	// Return the methods to be exposed
	return { getBoard, placeMark, resetBoard, isFull };
})();


// Factory function to create players

function createPlayer(name, mark) {
	let score = 0;

	function getScore() {
		return score;
	};

	function addWin() {
		score++;
	};

	return { name, mark, getScore, addWin };
};


// Game controller
// Its objective is to run the game 

const GameController = (() => {
	// Players
	const playerOne = createPlayer("Player One", "X");
	const playerTwo = createPlayer("Player Two", "O");
	// Game state
	let currentPlayer = playerOne;
	let gameOver = false;

	// Winning lines
	const winningLines = [
		// Three rows possibilities
		[[0,0], [0,1], [0,2]],
		[[1,0], [1,1], [1,2]],
		[[2,0], [2,1], [2,2]],
		// Three columns possibilities
		[[0,0], [1,0], [2,0]],
		[[0,1], [1,1], [2,1]],
		[[0,2], [1,2], [2,2]],
		// Two diagonal possibilities
		[[0,0], [1,1], [2,2]],
		[[0,2], [1,1], [2,0]]
	];

	// Function to check if there are winnings
	function checkWin() {
		// Get current board
		const currentBoard = Gameboard.getBoard();
		// Iterate through the winning lines 
		for (let i = 0; i < winningLines.length; i++) {
			// Get the line
			const line = winningLines[i];
			// Get the three coordinates of the line
			const firstCoord  = line[0];
			const secondCoord = line[1];
			const thirdCoord  = line[2];
			// Get the line in the currentBoard using the coordinates
			// to check wether they hold the same mark and are not empty
			const firstCell = currentBoard[firstCoord[0]][firstCoord[1]];
			const secondCell = currentBoard[secondCoord[0]][secondCoord[1]];
			const thirdCell  = currentBoard[thirdCoord[0]][thirdCoord[1]];
			if (firstCell !== "" && firstCell === secondCell && secondCell === thirdCell) {
				// Returning just true wouldn't say who won.
				// So returning the value of one cell would directly tell 
				// if there's a winner and who is at the same time.
				return firstCell;
			};
		};
		return null;
	};

	function playRound(row, column) {
		// Store currentMark
		let markToPlace = currentPlayer.mark;
		// Check if game is over before proceeding
		if (gameOver) {
			return { status: "over" };
		};
		const success = Gameboard.placeMark(row, column, currentPlayer.mark);
		// Check wether the mark was successfully placed 
		// (There wasn't another mark in that place already)
		// If the move is not valid, return 'invalid'
		if (!success) {
			return { status: "invalid" };
		};
		// Check if there's a winner
		const winner = checkWin();
		if (winner !== null) {
			gameOver = true;
			currentPlayer.addWin();
			// Finish function execution
			// since there is a winner
			return { status: "win", mark: markToPlace, player:  currentPlayer.name };
		};
		// If there is no winner, check wether the board
		// is full to confirm wether there is a tie
		if (Gameboard.isFull()) {
			gameOver = true;
			return { status: "tie", mark: markToPlace };
		}
		// If the game is not over, the move was valid
		// Set current player to be the next one and
		// return 'continue'
		if (currentPlayer === playerOne) {
			currentPlayer = playerTwo;
		} else {
			currentPlayer = playerOne;
		};
		// If placing the mark is valid, return 'continue'
		// and the place to mark
		return { status: "continue", mark: markToPlace, nextPlayer: currentPlayer.name };
	};

	// Function to reset game
	// The distinction here is that this doesn't reset the score,
	// but grants the users the hability to start a new game
	// while keeping their score
	function resetGame() {
		// Reset board
		Gameboard.resetBoard();
		// Set currentPlayer back to playerOne
		currentPlayer = playerOne;
		// Set gameOver back to false
		gameOver = false;
	};

	return { playRound, resetGame };
})();


//=== Helpers for event listeners ===//

// Function to render play move
function renderPlay(cell, mark, nextPlayer) {
	const nextPlayerCell = document.getElementById("nextPlayer");
	cell.textContent = mark;
	nextPlayerCell.textContent = nextPlayer;
};

// Function to render win or tie
function renderEndGame(result) {
	// Get elements to change text on
	const resultValue = document.getElementById("resultValue");
	// Show game final result
	if (result.status == "tie") {
		resultValue.textContent = "It's a tie!";
	} else {
		resultValue.textContent = `${result.player} won!`;
	};
};

// Function to play
function play(event) {
	// Get coordinates
	let coord = event.target.dataset.col;
	// Split string
	coord = coord.split(",");
	// Convert both strings to numbers
	const row = +coord[0];
	const column = +coord[1];
	// Execute a play and store its result
	const result = GameController.playRound(row, column);
	// Check the result to know if it should do nothing (in case of 
	// game over or invalid move), continue and show next player
	// or stop and show that it's a tie or a win.
	if (result.status === "over" || result.status === "invalid") {
		return;
	} else if (result.status === "win" || result.status === "tie") {
		renderEndGame(result);
	};
	// If game is not finished and move is valid, render mark 
	// in cell and update who's next
	renderPlay(event.target, result.mark, result.nextPlayer);
};


// Function to reset game
function reset() {
	const cells = document.querySelectorAll(".cell");
	const nextPlayerCell = document.getElementById("nextPlayer");
	Gameboard.resetBoard();
	cells.forEach(element => {
		element.textContent = "";
	});
	nextPlayerCell.textContent = "Player One";
};


//=== Event listeners ===//

// Listener to mark attemps in each cell
const cells = document.querySelectorAll(".cell");
cells.forEach(element => {
	element.addEventListener('click', (event) => play(event))
});

// Listener to reset game after pressing the 'Reset Game' button
const reserGameButton = document.getElementById("resetGame");
reserGameButton.addEventListener('click', () => reset());