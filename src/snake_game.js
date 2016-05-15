function BoardCell(xCoord, yCoord) {
    'use strict';
    this.y = yCoord;
    this.x = xCoord;
}

exports.constructor = function (field, socket) {
    'use strict';
    var snakeCoords = [new BoardCell(2, 2), new BoardCell(2, 3), new BoardCell(2, 4)],
        gamesocket = socket,
        fieldInfo = field,
        showFoodTimeout = 80,
        snakeDirection,
        playerScore = 0,
        snakeMoveTimeout = 100,
        gameFinished = false,
        foodInfo = {
            foodCoords : null,
            foodTimeOut : showFoodTimeout
        };


    function makeSnakeAlive(socket) {
        console.log("snake moves");
		setTimeout(function () {
			if(gameFinished) {
				return;
			}
			
			var moveInstr = move();
			moveInstr.foodCoords = provideFood();

			gameFinished = moveInstr.statusAfterMovement === "Error"; 
			socket.emit('move', moveInstr);
			gameFinished || makeSnakeAlive(socket);
		}, snakeMoveTimeout);
	}
	
    function checkField(x, y) {
        // for food
        if (foodInfo.foodCoords && foodInfo.foodCoords.x === x && foodInfo.foodCoords.y === y) {
            return {
                msg: "eat food",
                condition: Enums.cellConditions.food,
            };
        }
		
		//for walls
        if (x == 1 || y == 1 || y == fieldInfo.width || x == fieldInfo.height) {
            return {
                msg: "hit wall",
                condition: Enums.cellConditions.wall,
            };

        }

        // for snake body
        var hit = false;
        snakeCoords.forEach(function (peace) {
            //console.log("newHead:" + x + "," + y + " bodyPeac: " + peace.x + "," + peace.y);
            if (peace.x == x && peace.y == y) {
                hit = true;
                return;
            }        
        });
        
        if (hit) {
            return {
                msg: "snake body",
                condition: Enums.cellConditions.snakeBody,
            };
        }
        
        // empty space
        return {
            msg: "emptySpace",
            condition: Enums.cellConditions.emptySpace,
        };
    
    }
    
    function stopGame() {
        gameFinished = true;    
    }
    
    function provideFood() {
        
        if (!foodInfo.foodCoords) {
            var foodCoordX = 1,
                foodCoordY = -1;
            
            do {
                foodCoordX = Math.floor((Math.random() * fieldInfo.height) + 1);
                foodCoordY = Math.floor((Math.random() * fieldInfo.width) + 1);

            } while (checkField(foodCoordX, foodCoordY).condition !== Enums.cellConditions.emptySpace);
            
            foodInfo.foodCoords = { x: foodCoordX, y: foodCoordY };
        } else {
            if (!(-- foodInfo.foodTimeOut)) {
                foodInfo.foodCoords = null; //hide foot
                foodInfo.foodTimeOut = showFoodTimeout;
            }
        }

        return foodInfo.foodCoords;
    };

    function changeDirection(directionName) {
        var newDirection = Enums.directions[directionName];
        
        switch (snakeDirection) {
            case Enums.directions.up:
                if (newDirection == Enums.directions.down) {
                    return;
                }
                break;
            case Enums.directions.left:
                if (newDirection == Enums.directions.right) {
                    return;
                }
                break;
            case Enums.directions.down:
                if (newDirection == Enums.directions.up) {
                    return;
                }
                break;
            case Enums.directions.right:
                if (newDirection == Enums.directions.left) {
                    return;
                }
                break;
        }

        snakeDirection = newDirection;
    };
    
    function move() {
        
        //provideFood();

        var moveInstr = {};
        var newHead = null;
        var snakeHead = snakeCoords[snakeCoords.length - 1];
        //moveInstr.oldCoords = snakeCoords;
        switch (snakeDirection) {
            case Enums.directions.up:
                newHead = new BoardCell(snakeHead.x - 1, snakeHead.y);
                snakeDirection = Enums.directions.up;
                break;
            case Enums.directions.left:
                newHead = new BoardCell(snakeHead.x, snakeHead.y - 1);
                snakeDirection = Enums.directions.left;
                break;
            case Enums.directions.down:11
                newHead = new BoardCell(snakeHead.x + 1, snakeHead.y);
                snakeDirection = Enums.directions.down;
                break;
            case Enums.directions.right:
            default: // default right
                newHead = new BoardCell(snakeHead.x, snakeHead.y + 1);
                snakeDirection = Enums.directions.right;
                break;
        }

        var status = checkField(newHead.x, newHead.y);
        
        switch (status.condition) {
            case Enums.cellConditions.emptySpace:
                snakeCoords.push(newHead);
                snakeCoords.splice(0, 1); // remove tail
                snakeHead = newHead;
                moveInstr.newCoords = snakeCoords;
                moveInstr.statusAfterMovement = 'OK';
                break;
            case Enums.cellConditions.food:
                snakeCoords.push(newHead);
                playerScore++;
                snakeHead = newHead;
                moveInstr.newCoords = snakeCoords;
                foodInfo.foodCoords = null;
                foodInfo.foodTimeOut = showFoodTimeout;
                moveInstr.statusAfterMovement = 'OK';
                break;
            
            case Enums.cellConditions.wall:
            case Enums.cellConditions.snakeBody:
                moveInstr.statusAfterMovement = 'Error'; 
                break;
        }
        
        moveInstr.score = playerScore;
        return moveInstr;
    }
    
    
    this.stopGame = stopGame;
    this.provideFood = provideFood;
    this.changeDirection = changeDirection;
    this.move = move;
    
    makeSnakeAlive(gamesocket);
};

var Enums = {
	cellConditions : {
		emptySpace: 0,
		wall: 1,
		food : 2,
		snakeBody : 3
	},
	directions : {
		up : 1, 
		down : 2,
		left : 3,
		right : 4
	}
};
