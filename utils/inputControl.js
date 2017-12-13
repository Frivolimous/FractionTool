const inputM={
	mouse:null,
	mouseEnabled:true,
	keyboard:null,
}

function input_init(){
	window.addEventListener("keydown",onKeyDown);
	window.addEventListener("keyup",onKeyUp);
	
	app.stage.on("pointerdown",onMouseDown);
	app.stage.on("pointermove",onMouseMove);
	//app.stage.on("wheel",onWheel);
	window.addEventListener("wheel",onWheel);
	if (interactionMode=="desktop"){
		window.addEventListener("pointerup",onMouseUp);
	}else{
		window.addEventListener("touchend",onMouseUp);
	}
	inputM.mouse=new input_MouseObject();
}

//==MOUSE==

function onWheel(e){
	//console.log(e);
	let _object=gameM.objectManager.getClosestObject(inputM.mouse,50);
	if (_object!=null && _object.type==ObjectTypes.UI && _object.onWheel!=null){
		_object.onWheel(e.deltaY);
	}
}

function onMouseDown(e){
	inputM.mouse.x=e.data.global.x/app.stage.scale.x;
	inputM.mouse.y=e.data.global.y/app.stage.scale.y;
	inputM.mouse.down=true;

	if (!inputM.mouseEnabled) return;
	if (inputM.mouse.timerRunning) return;

	if (!game_mouseDown(e)) return;

	inputM.mouse.drag=gameM.objectManager.getClosestObject(inputM.mouse,50);
	if (inputM.mouse.drag!=null){
		inputM.mouse.timerRunning=true;
		setTimeout(function(){
			inputM.mouse.timerRunning=false;
			if (inputM.mouse.drag!=null){
				game_startDrag(inputM.mouse.drag);
			}

		},200);
	}
}

function onMouseUp(e){
	inputM.mouse.down=false;

	if (inputM.mouse.drag!=null){
		if (!inputM.mouse.timerRunning){
			let _target=gameM.objectManager.getClosestObject(inputM.mouse,50,inputM.mouse.drag);
			game_endDrag(inputM.mouse.drag,_target);
		}else{
			game_onClick(inputM.mouse.drag);
		}
	}
	inputM.mouse.drag=null;
	inputM.mouse.dragTarget=null;
}

function onMouseMove(e){
	inputM.mouse.x=e.data.global.x/app.stage.scale.x;
	inputM.mouse.y=e.data.global.y/app.stage.scale.y;
	game_onMouseMove(inputM.mouse);
}

function input_MouseObject(par){
	par = par || {};
	this.x=par.x || 0;
	this.y=par.y || 0;
	this.down=par.down || false;
	this.drag=par.drag || null;
	this.dragTarget=par.dragTarget || null;
	this.timerRunning=false;
}

//==KEYBOARD==

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
		case "A": case "a": game_toggleAmplifySelect(); break;
		case "ArrowLeft": LEVELS.loadLevel(-1); break;
		case "ArrowRight": LEVELS.loadLevel(1); break;
		case "ArrowUp":
		case "ArrowDown": 
		case "Q": case "q": LEVELS.loadLevel(0); break;
		case "z": game_undo(); break;
		case "x": game_redo(); break;
	}
	//console.log(e.key);
}

function onKeyUp(e){
	
}