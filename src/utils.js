// var socket = io();

// socket.on('move', function (moveInstructions) {
// 	'use strict';
// 	if (moveInstructions.statusAfterMovement === "OK") {

// 		moveInstructions.score && $('#txtScore').text(moveInstructions.score);

// 		if (moveInstructions.foodCoords) {
// 			var newFood = document.querySelector('#fieldContainer div:nth-child(' + moveInstructions.foodCoords.x + ') div:nth-child(' + moveInstructions.foodCoords.y + ')'),
// 				oldFood = document.querySelector(".food");

// 			if (oldFood !== newFood) {
// 				if (oldFood) {
// 					oldFood.className = oldFood.className.replace('food').trim();
// 				}

// 				if (newFood) {
// 					newFood.className += ' food';
// 				}
// 			}
// 		}

// 		[].forEach.call(document.querySelectorAll(".snakeBody"), function (peace) {
// 			peace.className = peace.className.replace('snakeBody', '').trim();
// 		});

// 		moveInstructions.newCoords.forEach(function (coords) {
// 			document.querySelector('#fieldContainer div:nth-child(' + coords.x + ') div:nth-child(' + coords.y + ')').className += ' snakeBody';
// 		});
// 	} else {
// 		alert("Game over");
// 		$("#btnEnd").trigger("click");
// 	}
// });

// 	e.preventDefault(); 
// });
  
// $('#btnStart').click(function(){
// 	var fieldSize = $('#txtFieldSize').val();
// 	if (fieldSize == '' || isNaN(fieldSize * 1)) {
// 		alert('Enter number');
// 		$('#txtFieldSize').val('');
// 		return;
// 	}

// 	$('#txtFieldSize').val('');
// 	$('#fieldSize').hide('');
// 	$('#txtScore').text(0);
// 	$('#scoreInfo').show();
	
// 	drawField(fieldSize, fieldSize);
// 	var fieldInfo = {
// 		width: fieldSize,
// 		height: fieldSize
// 	};
	
// 	socket.emit('start game', fieldInfo);
// 	$(this).hide();
// });  	
  
// $('#btnEnd').click(function(){
// 	socket.emit('end game', '');
// 	$('#txtFieldSize').show('');
// 	$('#scoreInfo').hide();
// 	$('#btnStart').show();
// 	$('#fieldSize').show('');
// 	$('#fieldContainer').html('');
// });  

var Player = {
	cssClass: 'player',
	directions : {
		up : 1, 
		down : 2,
		left : 3,
		right : 4
	},
	current: function () {
		return document.getElementsByClassName(this.cssClass)[0];
	},
	draw: function (newCoords) {
		var current = this.current();
		if(current) {
			current.classList.remove("player");
		} 
		
		var newPosition = document.getElementById(newCoords.x + '-' + newCoords.y);
		newPosition && newPosition.classList.add(this.cssClass)
	},
	getCords: function (){
		var node = this.current();
		return {x: node.id.split('-')[0] * 1, y: node.id.split('-')[1] * 1};
	},
	areMovesAllowed: function(coords) {
		var newPosition = document.getElementById(coords.x + '-' + coords.y);
		return !newPosition.classList.contains('wall');
	},
	move: function (direction) {
		 var coords = Player.getCords();
		 switch (direction) {
            case this.directions.up:
				coords.x-=1; 
                break;
            case this.directions.left:
            	coords.y-=1;
			    break;
            case this.directions.down:
            	coords.x+=1;
			    break;
            case this.directions.right:
            	coords.y+=1;
			    break;
        }
		
		if(this.areMovesAllowed(coords)) {
			if(Box.isABox(coords)) {
				Box.move(coords, direction);
			}
			
			this.draw(coords);	
		}
	}
}

var Box = {
	draw: function (coords) {
		document.getElementById(coords.x + '-' + coords.y).classList.add('box');
	},
	remove: function (coords) {
		document.getElementById(coords.x + '-' + coords.y).classList.remove('box');
	},
	areMovesAllowed: function(coords) {
		var newPosition = document.getElementById(coords.x + '-' + coords.y);
		return !newPosition.classList.contains('wall') &&
			   !newPosition.classList.contains('player');
	},
	isABox: function (coords) {
		return document.getElementById(coords.x + "-" + coords.y).classList.contains('box');
	},
	move: function (coords, direction) {
		 var newCoords = {x: coords.x, y: coords.y};
		 
		 switch (direction) {
            case Player.directions.up:
				newCoords.x -= 1; 
                break;
            case Player.directions.left:
            	newCoords.y -= 1;
			    break;
            case Player.directions.down:
            	newCoords.x += 1;
			    break;
            case Player.directions.right:
            	newCoords.y += 1;
			    break;
        }
		
		if(this.areMovesAllowed(newCoords)) {
			this.remove(coords);
			this.draw(newCoords);	
		}
	}
}

var Container = {
	cssClass: "container",
	draw: function(coords) {
		document.getElementById(coords.x + "-" + coords.y).classList.add(this.cssClass);
	},
	remove: function(coords) {
		document.getElementById(coords.x + "-" + coords.y).classList.remove(this.cssClass);
	},
	isAContainer: function (coords) {
		return document.getElementById(coords.x + "-" + coords.y).classList.contains(this.cssClass);
	}
}
// attach keys handlers
document.addEventListener('keydown', function(e) {
	switch (e.which) {
		case 37: // left
			Player.move(Player.directions.left);
			//socket.emit('change direction', 'left');
			break;

		case 38: // up
			Player.move(Player.directions.up);
			//socket.emit('change direction', 'up');
			break;

		case 39: // right
			Player.move(Player.directions.right);
			//socket.emit('change direction', 'right');
			break;

		case 40: // down
			Player.move(Player.directions.down);
			//socket.emit('change direction', 'down');
			break;

		default: return; 
	}
});



function drawField(fieldContainer, fieldJSON) {
	var i,
		j,
		row,
		cell,
		playerCords = {x: 10, y: 20};
	
	for(i = 0; i < fieldJSON.rows; i++) {
	   row = document.createElement('div');
	   row.className = 'Row'
	   for(j = 0; j < fieldJSON.columns; j++) {
		  cell = document.createElement('div');
		  cellContent = document.createElement('p');
		  cell.className = 'Cell';
		  cell.id = i + "-" + j;
		  
	 	  //draw walls
   	      if (j == 0 || j == fieldJSON.columns - 1 || i == 0 || i == fieldJSON.rows - 1) {
			cell.classList.add('wall');
		  }
	
		  cell.appendChild(cellContent);
		  row.appendChild(cell);
	   }
	   
	   fieldContainer.appendChild(row);
	}
	
	//draw walls
	fieldJSON.walls.forEach(function (wall){
		var cell = document.getElementById(wall.x + "-" + wall.y);
		cell && cell.classList.add("wall");	
	});
	
	//draw player
	Player.draw({ x: fieldJSON.playerPosition.x, y: fieldJSON.playerPosition.y });
	
	//draw box
	fieldJSON.boxes.forEach(function (wall){
		Box.draw({ x: wall.x, y: wall.y });
	});
	
	//draw box container
	fieldJSON.containers.forEach(function (wall){
		Container.draw({ x: wall.x, y: wall.y });
	});	
}
