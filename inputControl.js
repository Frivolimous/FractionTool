const inputM={
	mouse:null,
	dragFunction:null,
	gameCanvas:{x:0,y:0},
	mouseEnabled:true,
}

function input_init(_gameStage){
	window.addEventListener("keydown",onKeyDown);
	window.addEventListener("keyup",onKeyUp);
	
	app.stage.on("pointerdown",onMouseDown);
	app.stage.on("pointermove",onMouseMove);
	//window.addEventListener("pointerdown",onMouseDown);
	window.addEventListener("pointerup",onMouseUp);
	//window.addEventListener("pointermove",onMouseMove);
	inputM.mouse=new input_MouseObject();
}

function onMouseDown(e){
	inputM.mouse.x=e.data.global.x;
	inputM.mouse.y=e.data.global.y;
	if (myObj_currentInput!=null && !myObj_currentInput.inBounds(inputM.mouse.x,inputM.mouse.y)) myObj_currentInput.dispose();
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

function onKeyDown(e){
	if (myObj_currentInput!=null){
		myObj_currentInput.keyDown(e.key);
		return;
	}
	switch(e.key){
		case "A": game_startAmplify(); break; //myObj_inputBox("HEY!"); break;
		/*case "1": ui_selectButtonAt(0); break;
		case "2": ui_selectButtonAt(1); break;
		case "3": ui_selectButtonAt(2); break;
		case "4": ui_selectButtonAt(3); break;
		case "5": ui_selectButtonAt(4); break;
		case "6": ui_selectButtonAt(5); break;
		case "7": ui_selectButtonAt(6); break;
		case "8": ui_selectButtonAt(7); break;
		case "9": ui_selectButtonAt(8); break;
		case "0": ui_selectButtonAt(9); break;
		case "-": case "_": game_zoomBy(1/1.2); break;
		case "Enter": break;*/
	}
}

function onKeyUp(e){
	
}