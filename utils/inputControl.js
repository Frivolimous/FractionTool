const inputM={
	mouse:null,
	dragFunction:null,
	gameCanvas:{x:0,y:0},
	mouseEnabled:true,
	keyboard:null,
}

function input_init(_gameStage){
	window.addEventListener("keydown",onKeyDown);
	window.addEventListener("keyup",onKeyUp);
	
	app.stage.on("pointerdown",onMouseDown);
	app.stage.on("pointermove",onMouseMove);
	//window.addEventListener("pointerdown",onMouseDown);
	if (interactionMode=="desktop"){
		window.addEventListener("pointerup",onMouseUp);
	}else{
		window.addEventListener("touchend",onMouseUp);
	}
	//window.addEventListener("pointermove",onMouseMove);
	inputM.mouse=new input_MouseObject();
}

function onMouseDown(e){
	inputM.mouse.x=e.data.global.x;
	inputM.mouse.y=e.data.global.y;
	if (myObj_currentInput!=null && 
		!myObj_currentInput.inBounds(inputM.mouse.x,inputM.mouse.y) &&
		(inputM.keyboard==null || !inputM.keyboard.inBounds(inputM.mouse.x,inputM.mouse.y))) myObj_currentInput.dispose();
	if (!inputM.mouseEnabled) return;
	inputM.mouse.down=true;
	if (inputM.mouse.timerRunning) return;
	if (amplifying){
		game_checkFractionsAmplify();
		return;
	}
	inputM.mouse.drag=game_getClosestObject(inputM.mouse,50);
	if (inputM.mouse.drag!=null){
		inputM.mouse.timerRunning=true;
		setTimeout(function(){
			inputM.mouse.timerRunning=false;
			if (inputM.mouse.drag!=null){
				//inputM.mouse.drag.tweenTo(inputM.mouse.x,inputM.mouse.y);
				game_startDrag(inputM.mouse.drag);
			}

		},200);
	}else{
		game_blankDown();
	}
}

function onMouseUp(e){
	inputM.mouse.down=false;
	if (inputM.mouse.drag!=null){
		if (!inputM.mouse.timerRunning){
			game_endDrag(inputM.mouse.drag);
		}else{
			game_onClick(inputM.mouse.drag);
		}
		inputM.mouse.drag=null;
	}
}

function onMouseMove(e){
	/*inputM.mouse.x=e.x-stageBorders.left;
	inputM.mouse.y=e.y-stageBorders.top;*/
	inputM.mouse.x=e.data.global.x;
	inputM.mouse.y=e.data.global.y;
}

function input_MouseObject(par){
	par = par || {};
	this.x=par.x || 0;
	this.y=par.y || 0;
	this.down=par.down || false;
	this.drag=par.drag || null;
	this.timerRunning=false;
}

function input_makeVirtualKeyboard(){
	if (inputM.keyboard==null){
		inputM.keyboard=window_virtualKeyboard(onKeyDown);
	}
	app.stage.addChild(inputM.keyboard);
	inputM.keyboard.animateAdd();
	uiM.bottomBar.animateRemove();
}

function input_removeVirtualKeyboard(){
	if (inputM.keyboard!=null){
		inputM.keyboard.animateRemove();
		uiM.bottomBar.animateAdd();
	}
}

function onKeyDown(e){
	if (myObj_currentInput!=null){
		myObj_currentInput.keyDown(e.key);
		return;
	}
	switch(e.key){
		case "A": case "a": game_startAmplify(); break;
		case "ArrowLeft": LEVELS.loadLevel(-1); break;
		case "ArrowRight": LEVELS.loadLevel(1); break;
		case "ArrowUp":
		case "ArrowDown": 
		case "Q": case "q": LEVELS.loadLevel(0); break;
		case "R": case "r": config_changeOptionSet(); break;
	}
	console.log(e.key);
}

function onKeyUp(e){
	
}