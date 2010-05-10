/*
 * BeFunge interpreter in JavaScript
 * By Kurtis Kopf
 */

function BefungeJS ()
{
	var board = [];
	var rowPtr = 0;
	var colPtr = 0;
	var stack = [];
	var stackPtr = 0;
	var outStream = '';
	var promptListener = null;
	var stringMode = false;
	
	var DIR_STOP = -1;
	var DIR_RIGHT = 0;
	var DIR_LEFT = 1;
	var DIR_UP = 2;
	var DIR_DOWN = 3;
	var direction = DIR_STOP;
	
	var MODE_ERROR = 0;
	var MODE_WRAP = 1;
	var MODE_BOUNCE = 2;
	var wallMode = MODE_ERROR;
	 
	return ({
		reset: reset,
		execute: execute,
		getOutStream: getOutStream
	});
	 
	function reset()
	{
		board = [];
		rowPtr = 0;
		colPtr = 0;
		outStream = '';
		stack = [];
		stackPtr = 0;
		stringMode = false;
		direction = 0;
	}
	
	function getOutStream()
	{
		return (outStream);
	}
	 
	function execute(newBoard)
	{
		board = parseBoard(newBoard);
		do
		{
			executeCommand(currentCommand());
			nextCell();
		} while (direction != DIR_STOP);
		return (outStream);
	}
	
	function parseBoard(text)
	{
		var row = 0;
		var tempBoard = [];
		if (text != null)
		{
			text = text.split('');
			for (var i = 0; i < text.length; i++)
			{
				if (text[i] == "\n")
				{
					row++;
				}
				else
				{
					if (tempBoard[row] == null)
					{
						tempBoard[row] = [];
					}
					tempBoard[row].push(text[i]);
				}
			}
		}
		return (tempBoard);
	}
	
	function currentCommand()
	{
		if (rowPtr < board.length)
		{
			if (colPtr < board[rowPtr].length)
			{
				return (board[rowPtr][colPtr]);
			}
			else
			{
				throw ('We ended up off the board somehow!');
			}
		}
		else
		{
			throw ('We ended up off the board somehow!');
		}
	}
	
	function executeCommand(c)
	{
		if (stringMode)
		{
			(c == '\"' ? switchStringMode() : pushASCII(c));
			return;
		}
		
		if (/[0-9]/.test(c))
		{
			number(c);
			return;
		}
		
		switch (c)
		{
			case ' ': ignore(); break;
			case '+': add(); break;
			case '-': subtract(); break;
			case '*': multiply(); break;
			case '/': divide(); break;
			case '%': modulo(); break;
			case '!': not(); break;
			case '`': greaterThan(); break;
			case '>': right(); break;
			case '<': left(); break;
			case '^': up(); break;
			case 'V':
			case 'v': down(); break;
			case '?': randomDirection(); break;
			case '_': popRight(); break;
			case '|': popDown(); break;
			case '"': switchStringMode(); break;
			case ':': duplicate(); break;
			case '\\': swap(); break;
			case '$': popDiscard(); break;
			case '.': popAsInt(); break;
			case ',': popAsASCII(); break;
			case '#': trampoline(); break;
			case 'P':
			case 'p': put(); break;
			case 'G': 
			case 'g': get(); break;
			case '&': promptInt(); break;
			case '~': promptASCII(); break;
			case '@': end(); break;
			default: throw ('Unknown command: ' + c);
		}
	}
	
	function nextCell()
	{
		switch (direction)
		{
			case DIR_RIGHT: 	moveRight(); 	break;
			case DIR_LEFT: 	moveLeft(); 	break;
			case DIR_UP: 		moveUp(); 	break;
			case DIR_DOWN: 	moveDown(); 	break;
		}
	}
	
	function moveRight()
	{
		var row = board[rowPtr];
		if ((colPtr + 1) < row.length)
		{
			colPtr++;
		}
		else if (wallMode == MODE_ERROR)
		{
			throw ('Unable to move RIGHT, out of room on the board.');
		}
		else if (wallMode == MODE_WRAP)
		{
			colPtr = 0;
		}
		else if (wallMode == MODE_BOUNCE)
		{
			direction = DIR_LEFT;
			moveLeft();
		}
	}
	
	function moveLeft()
	{
		var row = board[rowPtr];
		if ((colPtr - 1) >= 0)
		{
			colPtr--;
		}
		else if (wallMode == MODE_ERROR)
		{
			throw ('Unable to move LEFT, out of room on the board.');
		}
		else if (wallMode == MODE_WRAP)
		{
			colPtr = row.length - 1;
		}
		else if (wallMode == MODE_BOUNCE)
		{
			direction = DIR_RIGHT;
			moveRight();
		}
	}
	
	function moveUp()
	{
		if ((rowPtr - 1) >= 0)
		{
			rowPtr--;
		}
		else if (wallMode == MODE_ERROR)
		{
			throw ('Unable to move UP, out of room on the board.');
		}
		else if (wallMode == MODE_WRAP)
		{
			rowPtr = board.length - 1;
		}
		else if (wallMode == MODE_BOUNCE)
		{
			direction = DIR_DOWN;
			moveDown();
		}
	}
	
	function moveDown()
	{
		if ((rowPtr + 1) < board.length)
		{
			rowPtr++;
		}
		else if (wallMode == MODE_ERROR)
		{
			throw ('Unable to move DOWN, out of room on the board.');
		}
		else if (wallMode == MODE_WRAP)
		{
			rowPtr = 0;
		}
		else if (wallMode == MODE_BOUNCE)
		{
			direction = DIR_UP;
			moveUp();
		}
	}
	
	// continue in the same direction
	function ignore()
	{
		nextCell();
	}
	
	// push the number onto the stack
	function number(val)
	{
		stack.push(Number(val));
	}
	
	// add the two numbers from the top of the stack
	function add()
	{
		var a = stack.pop();
		var b = stack.pop();
		stack.push(a+b);
	}
	
	// subtract the first number on the stack from the second
	function subtract()
	{
		var a = stack.pop();
		var b = stack.pop();
		stack.push(b-a);
	}
	
	// multiply the two numbers from the top of the stack
	function multiply()
	{
		var a = stack.pop();
		var b = stack.pop();
		stack.push(a*b);
	}
	
	// divide the second number on the stack by the first
	function divide()
	{
		var a = stack.pop();
		var b = stack.pop();
		if (a != 0)
		{
			stack.push(Math.floor(b/a));
		}
		else
		{
			throw ('Divide by ZERO! ' + b + '/' + a);
		}
	}
	
	// modulo the second number on the stack by the first
	function modulo()
	{
		var a = stack.pop();
		var b = stack.pop();
		if (a != 0)
		{
			stack.push(b%a);
		}
		else
		{
			throw ('Divide by ZERO! ' + b + '%' + a);
		}
	}
	
	// logical NOT
	function not()
	{
		var a = stack.pop();
		if (a == 0)
		{
			stack.push(1);
		}
		else
		{
			stack.push(0);
		}
	}
	
	// if second number on stack is greater than first, true
	function greaterThan()
	{
		var a = stack.pop();
		var b = stack.pop();
		if (b > a)
		{
			stack.push(1);
		}
		else
		{
			stack.push(0);
		}
	}
	
	// start moving RIGHT
	function right()
	{
		direction = DIR_RIGHT;
	}
	
	// start moving LEFT
	function left()
	{
		direction = DIR_LEFT;
	}
	
	// start moving UP
	function up()
	{
		direction = DIR_UP;
	}
	
	// start moving DOWN
	function down()
	{
		direction = DIR_DOWN;
	}
	
	// stop moving
	function end()
	{
		direction = DIR_STOP;
	}
	
	// move in a random direction
	function randomDirction()
	{
		direction = Math.floor(Math.random() * 4);
	}
	
	// if the first value is 0, move right
	function popRight()
	{
		var a = stack.pop();
		if (a == 0)
		{
			direction = DIR_RIGHT;
		}
		else
		{
			direction = DIR_LEFT;
		}
	}
	
	// if the first value is 0, move down
	function popDown()
	{
		var a = stack.pop();
		if (a == 0)
		{
			direction = DIR_DOWN;
		}
		else
		{
			direction = DIR_UP;
		}
	}
	
	// enter / exit string mode
	function switchStringMode()
	{
		stringMode = !stringMode;
	}
	
	// duplicate whatever is on the top of the stack
	function duplicate()
	{
		var a = stack.pop();
		stack.push(a);
		stack.push(a);
	}
	
	// swap the two values on the top of the stack
	function swap()
	{
		var a = stack.pop();
		var b = stack.pop();
		stack.push(a);
		stack.push(b);
	}
	
	// pop and discard the top value
	function popDiscard()
	{
		var a = stack.pop();
	}
	
	// pop the top of the stack, add it to output as an int
	function popAsInt()
	{
		var a = stack.pop();
		outStream += Number(a);
	}
	
	// pop the top of the stack, add it to output as a char
	function popAsASCII()
	{
		var a = stack.pop();
		if (typeof a == 'number')
		{
			a = String.fromCharCode(a);
		}
		outStream += a;
	}
	
	// skip the next cell
	function trampoline()
	{
		nextCell();
	}
	
	// pop col, row, val, then insert the value at the specified location on the board.
	function put()
	{
		var col = stack.pop();
		var row = stack.pop();
		var val = stack.pop();
		if (row < board.length)
		{
			if (col < board[row].length)
			{
				board[row][col] = val;
			}
			else
			{
				throw ('Target Column is off the Board!');
			}
		}
		else
		{
			throw ('Target Row is off the Board!');
		}
	}
	
	// retrieve a value from the specified location on the board and push it on the stack.
	function get()
	{
		var col = stack.pop();
		var row = stack.pop();
		if (row < board.length)
		{
			if (col < board[row].length)
			{
				stack.push(board[row][col]);
			}
			else
			{
				throw ('Target Column is off the Board!');
			}
		}
		else
		{
			throw ('Target Row is off the Board!');
		}
	}
	
	// push the specified value onto the stack as ASCII
	function pushASCII(val)
	{
		stack.push(val);
	}
	
	function promptInt()
	{
	}
	
	function promptASCII()
	{
	}
}
