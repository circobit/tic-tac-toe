// Gameboard

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
		};
	};

	// Return the methods to be exposed
	return { getBoard, placeMark, resetBoard };
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