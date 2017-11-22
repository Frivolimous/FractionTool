var gameM={
	objects:new Array(),
	expressions:new Array(),
	fractions:[],
	mainExpression:null,
	gameStage:new PIXI.Sprite(),
	background:new PIXI.Graphics(),
	overlay:new PIXI.Graphics(),
	gameBounds:{left:0,top:0,bot:1500,right:1500},
	placeholder:null,
	factors:new Array(),
	needRefresh:false,
};
var tempSelected;
var amplifying=false;

//== Initialize Game Elements==\\

function game_init(){
	gameM.background.beginFill(CONFIG.colors.BACKGROUND);
	gameM.background.lineStyle(1,0);
	gameM.background.drawRect(0,0,stageBorders.right,stageBorders.bot);
	gameM.placeholder=myObj_makeBlank();
	gameM.placeholder.graphics.x=-500;
	

	//inputM.dragFunction=game_onMouseDown;
	inputM.gameCanvas=gameM.gameStage;
	
	gameM.gameBounds.bot=Math.max(gameM.gameBounds.bot,stageBorders.bot);
	gameM.gameBounds.right=Math.max(gameM.gameBounds.right,stageBorders.right);
	
	gameM.gameStage.addChild(gameM.background);
	app.stage.addChild(gameM.gameStage);
	//app.stage.addChild(gameM.overlay);
	app.ticker.add(game_onTick);

	gameM.gameStage.addChild(gameM.placeholder.graphics);
	running=true;
}

//== Start/Stop the Game ==\\

function game_clearGame(){
	amplifying=false;
	tempSelected=null;
	while(gameM.objects.length>0){
		gameM.objects[0].parent.removeChild(gameM.objects[0]);
		gameM.objects.shift();
	}
	while(gameM.expressions.length>0){
		gameM.expressions[0].graphics.parent.removeChild(gameM.expressions[0].graphics);
		gameM.expressions.shift();
	}
	while(gameM.fractions.length>0){
		if (gameM.fractions[0].line.parent!=null) gameM.fractions[0].line.parent.removeChild(gameM.fractions[0].line);
		gameM.fractions.shift();
	}
	gameM.mainExpression=null;
	gameM.placeholder.x=-200;
	while(gameM.factors.length>0){
		gameM.factors[0].parent.removeChild(gameM.factors[0]);
		gameM.factors.shift();
	}
	gameM.needRefresh=false;
}

function restartGame(){
	startGame();
}

function startGame(){
	running=true;
}

//==Primary Game Loop==\\
function game_onTick(e){
	if (!running) return;
	if (tempSelected!=null){
		tempSelected.select(false);
		tempSelected=null;
		if (inputM.mouse.drag!=null){
			inputM.mouse.drag.select(true);
			gameM.gameStage.addChild(gameM.overlay);
			gameM.gameStage.addChild(inputM.mouse.drag);
		}
	}

	for (var i=0;i<gameM.objects.length;i+=1){
		if (gameM.objects[i].x!=gameM.objects[i].goal.x){
			let diff=gameM.objects[i].goal.x-gameM.objects[i].x;
			if (Math.abs(diff)<1) gameM.objects[i].x=gameM.objects[i].goal.x;
			else gameM.objects[i].x+=diff/2;
		}
		if (gameM.objects[i].y!=gameM.objects[i].goal.y){
			let diff=gameM.objects[i].goal.y-gameM.objects[i].y;
			if (Math.abs(diff)<1) gameM.objects[i].y=gameM.objects[i].goal.y;
			else gameM.objects[i].y+=diff/2;
		}
	}

	if (gameM.needRefresh){
		gameM.mainExpression.rootRefresh();
		gameM.needRefresh=false;
	}

	if (inputM.mouse.drag!=null && !inputM.mouse.timerRunning && inputM.mouse.drag.type=="number"){
		gameM.overlay.clear();
		/*gameM.placeholder.disabled=true;
		gameM.placeholder.red=false;*/

		let _validation;
		for (var i=0;i<gameM.expressions.length;i+=1){
			let _hitTest=gameM.expressions[i].hitTestLoc(inputM.mouse.x,inputM.mouse.y);
			if (_hitTest!=null){
				if (_hitTest===Object(_hitTest)){
					_validation=gameM.expressions[i].canCombine(_hitTest,inputM.mouse.drag);
					if (_validation!=Validation.NO){
						_hitTest.select(_validation==Validation.YES?true:"red");
						inputM.mouse.drag.select(_validation==Validation.YES?true:"red");
						gameM.gameStage.addChild(_hitTest);
						tempSelected=_hitTest;
					}
					//gameM.placeholder.attachTo(_hitTest,_validation);
				}else{
					_validation=gameM.expressions[i].canPlaceAt(inputM.mouse.drag,_hitTest);
					gameM.placeholder.placeAt(gameM.expressions[i],_hitTest,_validation);
				}
				break;
			}
		}

		if (tempSelected==null){
			if (gameM.factors.length>0){
				for (var i=0;i<gameM.factors.length;i+=1){
					if (gameM.factors[i].getDistance(inputM.mouse.x,inputM.mouse.y)==0){
						tempSelected=gameM.factors[i];
						tempSelected.select(true);
						break;
					}
				}
			}
		}

		if (tempSelected==null){
			game_makeLine(inputM.mouse.drag,inputM.mouse,gameM.placeholder.red);
		}else{
			game_makeLine(inputM.mouse.drag,tempSelected,_validation==Validation.WARN);
		}
	}
}

//==Interactions==
function game_startDrag(_object){
	if (_object.type!="factor"){
		game_blankDown();
	}
	/*if (amplifying){
		game_checkFractionsAmplify();
		return;
	}*/
	if (_object.type!="number") return;
	if (OPTIONS.factorsWhileDraging && OPTIONS.factorUsing!="input") showFactors(_object);

	_object.select(true);
	/*gameM.gameStage.addChild(gameM.placeholder.graphics);*/
	gameM.gameStage.addChild(gameM.overlay);
	gameM.gameStage.addChild(_object);
	
}

function game_clearSelected(_object){
	
	if (_object!=null) _object.select(false);
	gameM.overlay.clear();
	game_blankDown();
}

function game_endDrag(_object){
	if (gameM.factors.length>0){
		for (var i=0;i<gameM.factors.length;i+=1){
			if (gameM.factors[i].getDistance(inputM.mouse.x,inputM.mouse.y)==0){
				game_factorObject(gameM.factors[i]);
				game_clearSelected(_object);
				return;
			}
		}
	}
	if (myObj_currentError!=null) myObj_currentError.dispose();	
	for (var i=0;i<gameM.expressions.length;i+=1){
		let _hitTest=gameM.expressions[i].hitTestLoc(inputM.mouse.x,inputM.mouse.y);
		if (_hitTest==null){
			
		}else{
			if (_hitTest===Object(_hitTest)){
				if (game_tryCombine(gameM.expressions[i],_hitTest,_object)=="freeze") return;
			}else{
				//reposition
				game_tryReposition(gameM.expressions[i],_object,_hitTest);
			}
			break;
		}
	}
	game_clearSelected(_object);
	
}

function game_checkFractionsAmplify(){
	for (var i=0;i<gameM.fractions.length;i+=1){
		if (gameM.fractions[i].inSelectBounds(inputM.mouse.x,inputM.mouse.y)){
			popFractionsAmplify(gameM.fractions[i]);
		}else{
			gameM.fractions[i].select(false);
		};
	}
	amplifying=false;
}

function popFractionsAmplify(_fraction){
	_fraction.select(true);
	myObj_inputBox("How much do you want to amplify?",_fraction.numerator,function(i){
		_fraction.select(false);
		if (i==null || i.length==1) return;
		game_loadExpression(_fraction.numerator,[_fraction.numerator.list.length==0?"1":null,"*",i]);
		game_loadExpression(_fraction.denominator,[_fraction.denominator.list.length==0?"1":null,"*",i]);
	});
}

function game_onClick(_object){
	if (myObj_currentError!=null) myObj_currentError.dispose();
	if (_object.type!="factor"){
		game_blankDown();
	}
	/*if (amplifying){
		game_checkFractionsAmplify();
		return;
	}*/
	if (_object.type=="sign"){
		if (_object.toText()==";") return;
		if (!game_tryCombine(_object.location.expression,_object.location.expression.list[_object.location.pos-1],_object.location.expression.list[_object.location.pos+1])){
			if (myObj_currentError==null) myObj_errorPopup("Simplify First");
			_object.errorFlash();
		}
	}else if (_object.type=="line"){
		if (_object.master.type=="fraction"){
			if (_object.master.numerator.list.length==1 && _object.master.denominator.list.length==1){
				if (!game_tryCombine(_object.master.numerator,_object.master.numerator.list[0],_object.master.denominator.list[0])){
					_object.errorFlash();
					if (myObj_currentError==null) myObj_errorPopup("Simplify First");
				}			
			}else{
				_object.errorFlash();
				if (myObj_currentError==null) myObj_errorPopup("Simplify First");
			}
		}
	}else if (_object.type=="factor"){
		game_factorObject(_object);
	}else if (_object.type=="number"){
		if (OPTIONS.factorMinusOverride==true && _object.toNumber()<-1){
			let _expression=_object.location.expression;
			let _origin=_object;
			_origin.setText(Math.abs(_object.toNumber()));
			let _newObj=myObj_makeNumber("-1");
			let _newSign=myObj_makeSign("*");
			game_addObject(_newObj);
			game_addObject(_newSign);
			_newObj.goTo(_origin.x,_origin.y);
			_newSign.goTo(_origin.x,_origin.y);
			_expression.addObject(_newSign,_origin.location.pos);
			_expression.addObject(_newObj,_origin.location.pos);
			game_blankDown();
		}else{
			showFactors(_object);
		}
	}
	console.log("CLICK!");
}

function showFactors(_object){
	if (OPTIONS.factorUsing=="pairs"){
		let _factors=JMBL.getDivisors(_object.toNumber());
		let _total=(OPTIONS.factorMinusOverride=="full"&&_factors[0]<0)?_factors.length:_factors.length/2;
		for (var i=0;i<_total;i+=1){
			let _text=String(_factors[i]+";"+String(_object.toNumber()/_factors[i]));
			let _button=myObj_makeFactor(_text,_factors[i]);
			_button.goTo(_object.x,_object.y);
			/*_button.x=_object.x;
			_button.y=_object.y;*/
			_button.setTweenTarget(i,_total,_object.location.expression.factorsUp);
			_button.linked=_object;
			game_addObject(_button);
			gameM.factors.push(_button);
		}
		if (OPTIONS.amplifyInSimpList){
			let _button=myObj_makeFactor("Amplify","amplify");
			_button.goTo(_object.x,_object.y);
			_button.setTweenTarget(-1,_total,_object.location.expression.factorsUp);
			_button.linked=_object;
			game_addObject(_button);
			gameM.factors.push(_button);
		}
	}else if (OPTIONS.factorUsing=="primes"){
		let _factors=JMBL.getPrimeDivisors(_object.toNumber());
		for (var i=0;i<_factors.length;i+=1){
			let _text=String(_factors[i]);
			let _button=myObj_makeFactor(_text,_factors[i]);
			_button.goTo(_object.x,_object.y);
			/*_button.x=_object.x;
			_button.y=_object.y;*/
			_button.setTweenTarget(i,_total,_object.location.expression.factorsUp);
			_button.linked=_object;
			game_addObject(_button);
			gameM.factors.push(_button);
		}
	}else if (OPTIONS.factorUsing=="input"){
		myObj_inputBox("Choose a factor of "+_object.toText()+":",_object,function(i){
			if (i==null || i.length==1) return;
			if (_object.toNumber()%i==0){
				game_factorObject({linked:_object,value:Number(i)});
			}else{
				myObj_errorPopup("Not a whole divisor");
			}
		});
	}
}

function game_factorObject(_object){
	if (_object.value=="amplify"){
		popFractionsAmplify(_object.linked.location.expression.parent);
	}else{
		let _origin=_object.linked;
		let _newObj=myObj_makeNumber(String(_object.value));
		let _newSign=myObj_makeSign("*");
		let _expression=_origin.location.expression;
		_origin.setText(_origin.toNumber()/_object.value);
		game_addObject(_newObj);
		game_addObject(_newSign);
		_newObj.goTo(_origin.x,_origin.y);
		_newSign.goTo(_origin.x,_origin.y);
		_expression.addObject(_newSign,_origin.location.pos);
		_expression.addObject(_newObj,_origin.location.pos);
		_number=myObj_makeSign("-");
	}
	game_blankDown();
}

function game_blankDown(){
	while(gameM.factors.length>0){
		game_removeObject(gameM.factors.shift());
	}
}

function game_startAmplify(){
	if (amplifying){
		for (var i=0;i<gameM.fractions.length;i+=1){
			gameM.fractions[i].select(false);
		}
		amplifying=false;
	}else{
		for (var i=0;i<gameM.fractions.length;i+=1){
			if (!gameM.fractions[i].hasAdd() && !gameM.fractions[i].hasSub()){
				gameM.fractions[i].select(true);
				amplifying=true;
			}
		}
	}
}

//==Utility==

function game_addObject(_object){
	gameM.gameStage.addChild(_object);
	gameM.objects.push(_object);
}

function game_removeObject(_object){
	for (var i=0;i<gameM.objects.length;i+=1){
		if (gameM.objects[i]==_object){
			game_removeObjectAt(i);
			return;
		}
	}
}

function game_removeObjectAt(i){
	gameM.gameStage.removeChild(gameM.objects[i]);
	gameM.objects.splice(i,1);
}

function game_getClosestObject(point,maxDist,filter){
	var m=null;
	var _distance=maxDist*maxDist;
	var _distance2=0;
	
	for (var i=0;i<gameM.objects.length;i+=1){
		if (filter!=null && filter==gameM.objects[i]) continue;
		//if (gameM.objects[i].type=="sign") continue;
		//let _x2=gameM.objects[i].x-point.x;
		//let _y2=gameM.objects[i].y-point.y;
		//_distance2=_x2*_x2+_y2*_y2;
		_distance2=gameM.objects[i].getDistance(point.x,point.y);
		if (_distance2<_distance){
			_distance=_distance2;
			m=gameM.objects[i];
		}
	}
	return m;
}

function game_tryCombine(_expression,_obj1,_obj2){
	return game_finishResult(_obj1,_obj2,_expression.getCombine(_obj1,_obj2));
	//let _result=_expression.getCombine(_obj1,_obj2);

}

function game_finishResult(_obj1,_obj2,_result){
	/*result properties:
		moving:[{object,location:{expression,pos}}]
		removing:[object]
		changing:[{object,text}]
	*/
	if (_result!=null &&  _result.type=="success"){
		game_finishResult(_result);
		if (_result.moving!=null){
			for (var i=0;i<_result.moving.length;i+=1){
				if (_result.moving[i].new){
					let _block=game_addNewBlock(_result.moving[i].text);
					_block.goTo(_result.moving[i].location.expression.x,_result.moving[i].location.expression.y);
					_result.moving[i].location.expression.addObject(_block,_result.moving[i].location.pos);
				}else if (_result.moving[i].object!=null){
					_result.moving[i].object.location.expression.removeObject(_result.moving[i].object);
					if (_result.moving[i].object.location.expression==_result.moving[i].location.expression && _result.moving[i].object.location.pos<_result.moving[i].location.pos){
						_result.moving[i].location.pos-=1;
					}
					_result.moving[i].location.expression.addObject(_result.moving[i].object,_result.moving[i].location.pos);
				}
			}
		}
		if (_result.removing!=null){
			for (i=0;i<_result.removing.length;i+=1){
				if (_result.removing[i]==null) continue;
				if (_result.removing[i].type=="fraction"){
					game_removeFraction(_result.removing[i]);
				}else{
					_result.removing[i].location.expression.removeObject(_result.removing[i]);
					game_removeObject(_result.removing[i]);
				}
			}
		}
		if (_result.changing!=null){
			for (i=0;i<_result.changing.length;i+=1){
				if (_result.changing[i]==null || _result.changing[i].object==null) continue;
				_result.changing[i].object.setText(_result.changing[i].text);
			}
		}
		return true;
	}else if (_result!=null &&  _result.type=="error"){
		if (_result.color!=null){
			myObj_errorPopup(_result.text,_result.color);
		}else{	
			myObj_errorPopup(_result.text);
		}
	}else if (_result!=null &&  _result.type=="soft" && OPTIONS.showSoftErrors){
		if (_result.color!=null){
			myObj_errorPopup(_result.text,_result.color);
		}else{	
			myObj_errorPopup(_result.text);
		}
	}else if (_result!=null &&  _result.type=="hard" && OPTIONS.showHardErrors){
		if (_result.color!=null){
			myObj_errorPopup(_result.text,_result.color);
		}else{	
			myObj_errorPopup(_result.text);
		}
	}else if (_result!=null && _result.type=="prompt"){
		myObj_inputBox(_result.text,_obj1,function(i){
			game_clearSelected(_obj2);
			if (i==null || i.length==1) return;
			game_finishResult(_obj1,_obj2,_result.output(i));
		});
		return "freeze";
	}
	return false;
}

function game_tryReposition(_expression,_object,i){
	let _result=_expression.getPlaceAt(_object,i);
	if (_result!=null && _result!=false){
		_object.location.expression.removeObject(_object);
		if (_object.location.expression==_expression && _object.location.pos<i) i-=1;
		gameM.gameStage.addChild(_object);
		_expression.addObject(_object,i);
		if (_result.toLeft!=null){
			_result.toLeft.location.expression.removeObject(_result.toLeft);
			_expression.addObject(_result,_object.location.pos);
			gameM.gameStage.addChild(_result.toLeft);
		}
		if (_result.toRight!=null){
			_result.toRight.location.expression.removeObject(_result.toRight);
			_expression.addObject(_result,_object.location.pos+1);
			gameM.gameStage.addChild(_result.toRight);
		}
	}
}

function game_makeLine(_origin,_target,_red){
	gameM.overlay.lineStyle(3,_red?CONFIG.colors.RED:CONFIG.colors.SELECTED);
	gameM.overlay.moveTo(_origin.x,_origin.y);
	gameM.overlay.lineTo(_target.x,_target.y);
}

function game_makeNewFraction(a1,a2){
	let _fraction=myObj_makeFraction();
	gameM.expressions.push(_fraction.numerator);
	gameM.expressions.push(_fraction.denominator);
	gameM.fractions.push(_fraction);
	game_addObject(_fraction.line);
	gameM.gameStage.addChild(_fraction.numerator.graphics);
	gameM.gameStage.addChild(_fraction.denominator.graphics);
	gameM.gameStage.addChildAt(_fraction.line,1);

	if (a1!=null) game_loadExpression(_fraction.numerator,a1);
	if (a2!=null) game_loadExpression(_fraction.denominator,a2);
	return _fraction;
}

function game_removeFraction(_fraction){
	_fraction.location.expression.removeObject(_fraction);
	if (_fraction.line.parent!=null) _fraction.line.parent.removeChild(_fraction.line);
	if (_fraction.numerator.graphics.parent!=null) _fraction.numerator.graphics.parent.removeChild(_fraction.numerator.graphics);
	if (_fraction.denominator.graphics.parent!=null) _fraction.denominator.graphics.parent.removeChild(_fraction.denominator.graphics);
	JMBL.removeFromArray(_fraction,gameM.fractions);
	JMBL.removeFromArray(_fraction.numerator,gameM.expressions);
	JMBL.removeFromArray(_fraction.denominator,gameM.expressions);
	game_removeObject(_fraction.line);

}

function game_loadExpression(_expression,a){
	for (var i=0;i<a.length;i+=1){
		let _block=game_addNewBlock(a[i]);
		if (_block!=null) _expression.addObject(_block);
	}
}

function game_addNewBlock(s){
	if (s==null) return null;
	let _block;
	switch(s){
		case "*": case "+": case "-": case ":": case ";":
			_block=myObj_makeSign(s);
			break;
		default:
			_block=myObj_makeNumber(s);
	}
	game_addObject(_block);
	return _block;
}