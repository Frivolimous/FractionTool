var gameM={
	objectManager:null,
	solver:null,
	fractions:[],
	mainExpression:null,
	gameStage:new PIXI.Sprite(),
	gameBack:new PIXI.Graphics(),
	rope:null,
};
var amplifying=false;

//== Initialize Game Elements==\\

function game_init(){
	gameM.objectManager=new ObjectManager(gameM.gameStage);
	gameM.solver=new Solver();
	gameM.rope=myObj_makeRope();
	app.stage.addChild(gameM.gameBack);
	app.stage.addChild(gameM.gameStage);
	app.ticker.add(game_onTick);
}

//== Start/Stop the Game ==\\
function game_loadGame(_expression,_leaveHistory=false){
	game_clearGame(_leaveHistory);
	gameM.mainExpression=myObj_makeExpression();
	gameM.solver.addRoot(gameM.mainExpression);
	gameM.mainExpression.goTo(CONFIG.sizing.mainAlign.x,CONFIG.sizing.mainAlign.y);

	if (_expression!=null) game_makeNewProblem(_expression);
	if (!_leaveHistory) game_storeTextHistory(gameM.mainExpression.toExportText());
}

function game_clearGame(_leaveHistory=false){
	if (!_leaveHistory) game_clearHistory();
	amplifying=false;
	gameM.objectManager.removeAll();

	while(gameM.fractions.length>0){
		gameM.fractions[0].select(false);
		gameM.fractions.shift();
	}
	gameM.mainExpression=null;
}

//==Primary Game Loop==\\
function game_onTick(e){
	gameM.objectManager.forEach(function(){
		if (this.update!=null) this.update();
	});
	gameM.rope.update();
	if (gameM.mainExpression.needRefresh){
		let _remove=gameM.solver.removeAndReturnAllBrackets();
		//if (_remove.length>0) game_addToHistory({removing:_remove});
		for (var i=0;i<_remove.length;i+=1){
			gameM.objectManager.removeObject(_remove[i]);
		}
		gameM.mainExpression.rootRefresh();
		gameM.mainExpression.needRefresh=false;
	}
}

//==Interactions==

function game_onMouseMove(e){
	if (e.drag!=null && !e.timerRunning && e.drag.type==ObjectTypes.UI){
		if (e.drag.mouseMove!=null) e.drag.mouseMove(e);
		return;
	}
	if (e.drag!=null && !e.timerRunning && e.drag.type==ObjectTypes.NUMBER){
		let _validation;
		let _target=gameM.objectManager.getClosestObject(e,50);
		
		if (_target!=null && _target==e.dragTarget){
		}else if (_target!=null && _target.type==ObjectTypes.NUMBER){
		//if (_target!=null && _target!=e.dragTarget && _target.type==ObjectTypes.NUMBER){
			_validation=gameM.solver.canCombine(_target,e.drag);
			if (_validation!=Validation.NO){
				let _color;

				switch(_validation){
					case Validation.SUCCESS: _color=CONFIG.colors.VALID; break;
					case Validation.NO: case Validation.ERROR: _color=CONFIG.colors.RED; break;
					case Validation.SOFT: _color=CONFIG.colors.SOFT; break;
				}
				_target.select(_color);
				e.drag.select(_color);
				gameM.gameStage.addChild(_target);
				e.dragTarget=_target;
				gameM.rope.drawLine(e.drag.goal,e.dragTarget.goal,_color);	
			}else{
				//gameM.rope.drawLine(e.drag.goal,inputM.mouse,CONFIG.colors.SELECTED);
			}
		}else{
			if (e.dragTarget!=null){
				game_clearSelected(e.dragTarget);
				e.drag.select(true);
				e.dragTarget=null;
				gameM.gameStage.addChild(gameM.rope);
				gameM.gameStage.addChild(e.drag);
			}
			gameM.rope.drawLine(e.drag.goal,inputM.mouse,CONFIG.colors.SELECTED);
		}
	}else if (e.dragTarget!=null){
		e.dragTarget.select(false);
		gameM.rope.clearLine();
	}
}

function game_mouseDown(e){
	if (myObj_currentInput!=null && 
		!myObj_currentInput.inBounds(inputM.mouse.x,inputM.mouse.y) &&
		(inputM.keyboard==null || !inputM.keyboard.inBounds(inputM.mouse.x,inputM.mouse.y))) myObj_currentInput.dispose();
	if (amplifying){
		game_trySelectFractionAt(inputM.mouse.x,inputM.mouse.y);
		return false;
	}
	return true;
}

function game_startDrag(_object){
	if (_object.type==ObjectTypes.UI){
		_object.startMove(inputM.mouse);
		return;
	}else if (_object.type!=ObjectTypes.NUMBER) return;

	_object.select(true);
	gameM.gameStage.addChild(gameM.rope);
	gameM.gameStage.addChild(_object);	
}

function game_endDrag(_object,_target){
	if (_object.type==ObjectTypes.UI){
		_object.endMove(inputM.mouse);
	}
	if (myObj_currentError!=null) myObj_currentError.dispose();	

	if (_target!=null && _target.type==ObjectTypes.NUMBER){
		let _result=game_finishResult(gameM.solver.dragCombine(_target,_object));
		if (_result!=null){
			 if (_result.type==Validation.PROMPT) return;
		}
	}

	game_clearSelected(_object,_target);
}

function game_onClick(_object){
	if (myObj_currentError!=null) myObj_currentError.dispose();
	if (_object.type==ObjectTypes.UI){
		if (_object.onClick!=null) _object.onClick(inputM.mouse);
	}
	
	if (_object.type==ObjectTypes.SIGN){
		if (_object.toText()==";") return;

		let _result=game_finishResult(gameM.solver.clickSign(_object));
		if (_result==null || _result.type==Validation.ERROR){
			if (_result==null) _object.errorFlash();
		}else if (_result.type==Validation.SOFT){
			_object.errorFlash(CONFIG.colors.SOFT);
		}
	}else if (_object.type==ObjectTypes.FACTOR){
		_object.onClick();
	}else if (_object.type==ObjectTypes.NUMBER){
		if (OPTIONS.factorMinusOverride==true || OPTIONS.factorMinusOverride=="both" && _object.toNumber()<-1){
			let _expression=_object.location.expression;
			let _origin=_object;
			_origin.setText(Math.abs(_object.toNumber()));
			let _newObj=myObj_makeNumber("-1");
			let _newSign=myObj_makeSign("*");
			gameM.objectManager.addObject(_newObj);
			gameM.objectManager.addObject(_newSign);
			_newObj.goTo(_expression.list[_expression.list.length-1].x,_expression.list[_expression.list.length-1].y);
			_newSign.goTo(_expression.list[_expression.list.length-1].x,_expression.list[_expression.list.length-1].y);
			_expression.addObject(_newSign,_origin.location.pos);
			_expression.addObject(_newObj,_origin.location.pos);
			_newObj.goTo(_origin.x,_origin.y);
			_newSign.goTo(_origin.x,_origin.y);
			
			if (OPTIONS.factorMinusOverride=="both"){
				showFactors(_object);
			}
		}else{
			if (_object.factorsOpen){
				_object.closeFactors();
			}else{
				showFactors(_object);
			}
		}
	}
}

function game_clearSelected(_object,_object2){
	gameM.rope.clearLine();
	_object.select(false);
	if (_object2!=null){
		_object2.select(false);
	}
}

//==Combinations==

function showFactors(_object){
	if (_object.factorsOpen) return;

	_object.factorsOpen=true;
	_object.factors=[];

	let _factors=gameM.solver.getDivisors(_object.toNumber());

	for (var i=0;i<_factors.length/2;i+=1){
		let _text=String(_factors[i])+" \u2219 "+String(_object.toNumber()/_factors[i]);
		let _button=myObj_makeFactor(_text,_factors[i],_object,game_clickFactor);
		_object.factors.push(_button);
	}

	if (OPTIONS.allowMergeMakeBrackets || (!_object.location.expression.parent.hasSign("+") && !_object.location.expression.parent.hasSign("-"))){
		let _button=myObj_makeFactor("AMPLIFY","amplify",_object,game_clickAmplify);
		if (_object.location.expression.factorsUp){
			_button.drawLine(CONFIG.colors.FACTOR_LINE,"bottom");
		}else{
			_button.drawLine(CONFIG.colors.FACTOR_LINE,"top");
		}
		_object.factors.push(_button);
	}

	if (_object.factors.length<=CONFIG.maxFactors+1){
		//SHORT LIST, simple display
		for (i=_object.factors.length-1;i>=0;i-=1){
			_object.factors[i].goTo(_object.x,_object.y);
			_object.factors[i].setTweenTarget(i,_object.location.expression.factorsUp);
			gameM.objectManager.addObject(_object.factors[i]);
		}
	}else{
		//LONG LIST, scrollbar needed
		let _y;
		if (_object.location.expression.factorsUp){
			_object.factors=_object.factors.reverse();
			_object.factors.push(_object.factors.shift());
			_y=_object.y+(0-CONFIG.sizing.factorSize.height*(CONFIG.maxFactors+0.5)-_object.back.height/2)-7;
		}else{
			_y=_object.y+_object.back.height/2+7;
		}
		_object.factorBox=uiElement_maskedWindow({x:_object.x-CONFIG.sizing.factorSize.width/2,y:_y,width:CONFIG.sizing.factorSize.width,height:CONFIG.sizing.factorSize.height*(CONFIG.maxFactors+0.5),innerHeight:CONFIG.sizing.factorSize.height*(_object.factors.length-1),backColor:CONFIG.colors.FACTOR_BORDER});
		

		for (i=0;i<_object.factors.length-1;i+=1){
			_object.factorBox.addObject(_object.factors[i]);
		}
		_object.factorBox.sortObjects();
		_object.factorBar=uiElement_scrollbar({ratio:_object.factorBox.getRatio(),output:function(p){_object.factorBox.setScroll(p)},height:_object.factorBox.mask.height-6,x:_object.factorBox.x+_object.factorBox.mask.width-6,y:_object.factorBox.y+3});
		gameM.objectManager.addObject(_object.factorBar);
		gameM.objectManager.addObject(_object.factorBox);
		_object.factorBox.scrollbar=_object.factorBar;

		let _ampButton=_object.factors[_object.factors.length-1];
		gameM.objectManager.addObject(_ampButton);
		if (_object.location.expression.factorsUp){
			_ampButton.goTo(_object.x,_object.factorBox.y-_ampButton.back.height/2);
			_object.factorBar.setPosition(1);
		}else{
			_ampButton.goTo(_object.x,_object.factorBox.y+_object.factorBox.mask.height+_ampButton.back.height/2);
		}
	}
}

function game_clickAmplify(_factor){
	popFractionsAmplify(_factor.linked.location.expression.parent);
}

function game_clickFactor(_factor){
	game_finishResult(gameM.solver.factorObject(_factor.linked,_factor.value));
}

//==AMPLIFY==
function game_toggleAmplifySelect(){
	if (amplifying){
		for (var i=0;i<gameM.fractions.length;i+=1){
			gameM.fractions[i].select(false);
		}
		amplifying=false;
	}else{
		for (var i=0;i<gameM.fractions.length;i+=1){
			if (OPTIONS.allowMergeMakeBrackets || (!gameM.fractions[i].hasSign("+") && !gameM.fractions[i].hasSign("-"))){
				gameM.fractions[i].select(true);
				amplifying=true;
			}
		}
	}
}

function game_trySelectFractionAt(_x,_y){
	for (var i=0;i<gameM.fractions.length;i+=1){
		if (gameM.fractions[i].inSelectBounds(_x,_y)){
			popFractionsAmplify(gameM.fractions[i]);
		}else{
			gameM.fractions[i].select(false);
		};
	}
	amplifying=false;
}

function popFractionsAmplify(_fraction){
	_fraction.select(true);
	_box=myObj_inputBox(CONFIG.text.AMPLIFY,_fraction.numerator,function(amp){
		for (var i=0;i<_box.links.length;i+=1){
			if (_box.links[i].innerSign!=null){
				_box.links[i].clearInnerSign();
			}else{
				_box.links[i].location.expression.removeObject(_box.links[i]);
				gameM.objectManager.removeObject(_box.links[i]);
			}
		}
		game_finishResult(gameM.solver.amplifyFraction(_fraction,amp));
	});
	if (_fraction.numerator.list.length==1){
		_fraction.numerator.list[0].addInnerSign("*");
		_box.links.push(_fraction.numerator.list[0]);
	}else{
		let _num;
		if (gameM.solver.hasSign(_fraction.numerator,"+") || gameM.solver.hasSign(_fraction.numerator,"-")){
			_num=game_addNewBlock("(");
			_box.links.push(_num);
			_num.goTo(_fraction.numerator.list[0].x,_fraction.numerator.list[0].y);
			_fraction.numerator.addObject(_num,0);
			_num=game_addNewBlock(")");
			_box.links.push(_num);
			_num.goTo(_fraction.numerator.list[_fraction.numerator.list.length-1].x,_fraction.numerator.list[_fraction.numerator.list.length-1].y);
			_fraction.numerator.addObject(_num);
		}
		_num=game_addNewBlock("*");
		_box.links.push(_num);
		_num.goTo(_fraction.numerator.list[_fraction.numerator.list.length-1].x,_fraction.numerator.list[_fraction.numerator.list.length-1].y);
		_fraction.numerator.addObject(_num);
		_num=game_addNewBlock("");
		_num.setAsInner();
		_box.links.push(_num);
		_num.goTo(_fraction.numerator.list[_fraction.numerator.list.length-1].x,_fraction.numerator.list[_fraction.numerator.list.length-1].y);
		_fraction.numerator.addObject(_num);
	}

	if (_fraction.denominator.list.length==1){
		_fraction.denominator.list[0].addInnerSign("*");
		_box.links.push(_fraction.denominator.list[0]);
	}else if (_fraction.denominator.list.length==0){
		let _num=game_addNewBlock("");
		_num.setAsInner();
		_box.links.push(_num);
		_fraction.denominator.addObject(_num);
	}else{
		let _num;
		if (gameM.solver.hasSign(_fraction.denominator,"+") || gameM.solver.hasSign(_fraction.denominator,"-")){
			_num=game_addNewBlock("(");
			_box.links.push(_num);
			_num.goTo(_fraction.denominator.list[0].x,_fraction.denominator.list[0].y);
			_fraction.denominator.addObject(_num,0);
			_num=game_addNewBlock(")");
			_box.links.push(_num);
			_num.goTo(_fraction.denominator.list[_fraction.denominator.list.length-1].x,_fraction.denominator.list[_fraction.denominator.list.length-1].y);
			_fraction.denominator.addObject(_num);
		}
		_num=game_addNewBlock("*");
		_box.links.push(_num);
		_num.goTo(_fraction.denominator.list[_fraction.denominator.list.length-1].x,_fraction.denominator.list[_fraction.denominator.list.length-1].y);
		_fraction.denominator.addObject(_num);
		_num=game_addNewBlock("");
		_num.setAsInner();
		_box.links.push(_num);
		_num.goTo(_fraction.denominator.list[_fraction.denominator.list.length-1].x,_fraction.denominator.list[_fraction.denominator.list.length-1].y);
		_fraction.denominator.addObject(_num);
	}
}

//==Modifying the blocks==

var game_history=[];
var game_historyIndex=-1;

function game_storeTextHistory(s){
	while(game_history.length>game_historyIndex+1){
		game_history.pop();
	}
	
	if (game_history.length>0){
		uiM.undoButton.disable(false);
		
	}
	uiM.redoButton.disable(true);
	//_result=game_reverseResult(_result);
	game_historyIndex=game_history.length;
	game_history.push(s);
}

function game_undo(){
	//NOT WORKING WITH BRACKETS
	game_historyIndex-=1;
	if (game_historyIndex<0){
		game_historyIndex=0;
		return;
	}
	if (game_historyIndex==0){
		uiM.undoButton.disable(true);
	}
	//let _result=game_reverseResult(game_history[game_historyIndex]);
	/*let _result=game_history[game_historyIndex][1];
	game_finishResult(_result);*/
	game_loadGame(game_history[game_historyIndex],true);
	uiM.redoButton.disable(false);
}

function game_redo(){
	//NOT WORKING
	
	//game_finishResult(game_history[game_historyIndex][0]);
	if (game_historyIndex>game_history.length-2) return;
	game_historyIndex+=1;
	game_loadGame(game_history[game_historyIndex],true);
	

	if (game_historyIndex>=game_history.length-1){
		game_historyIndex=game_history.length-1;
		uiM.redoButton.disable(true);
	}
	uiM.undoButton.disable(false);
}

function game_clearHistory(){
	game_history=[];
	uiM.undoButton.disable(true);
	uiM.redoButton.disable(true);
}

/*function game_storeHistory(_result,_reverse){
	//let _result=game_reverse(_result);
	if (game_historyMode=="undo"){
		game_history[game_historyIndex][0]=_reverse;
	}else if (game_historyMode=="redo"){
		game_history[game_historyIndex][1]=_reverse;
	}else{
		_result.history=true;
		if (game_historyIndex>=0){
			while(game_history.length>game_historyIndex){
				game_history.pop();
			}
		}
		game_historyIndex=-1;
		if (game_historyIndex!=0){
			uiM.undoButton.disable(false);
			uiM.redoButton.disable(true);
		}
		//_result=game_reverseResult(_result);
		game_history.push([_result,_reverse]);
	}
	game_historyMode=null;
}*/

/*function game_addToHistory(_adding){
	//ATTEMPTED WORKAROUND FOR BRACKETS; NOT WORKING
	if (game_history.length==0){
		console.log("NO HISTORY");
		return;
	}
	let _result=game_history[game_history.length-1][1];
	//console.log(_result.moving);
	//console.log(_adding);
	for (var i=0;i<_adding.removing.length;i+=1){
		if (_result.moving==null) _result.moving=[];
		_result.moving.push({new:true,object:_adding.removing[i],location:{expression:_adding.removing[i].location.expression,pos:_adding.removing[i].location.pos}});
		//console.log(i);
	}
}*/

function game_finishResult(_result){
	//THIS IS THE ONLY PLACE THAT CAN ADD, REMOVE ETC. FROM AN EXISTING EXPRESSION
	/*result properties:
		type: any Validation Type
		moving:[{object,location:{expression,pos}}]
		moving:[{new:true,text:"",location:{expression,pos}}]
		removing:[object]
		changing:[{object,text}]
	*/
	if (_result==null) return;
	
	if (_result.flash!=null){
		for (var i=0;i<_result.flash.length;i+=1){
			let _color=CONFIG.colors.RED;
			let _timing=0;
			switch(_result.flash[i].type){
				case Validation.SUCCESS: _color=CONFIG.colors.VALID; _timing=1; break;
				case Validation.SOFT: _color=CONFIG.colors.SOFT; break;
				case Validation.HARD: 
					if (_result.type==Validation.SOFT) _color=CONFIG.colors.SOFT;
					_timing=2; 
					break;
			}
			_result.flash[i].object.errorFlash(_color,_timing);
		}
	}

	if (_result.type==Validation.SUCCESS){
		//let _reverse={type:Validation.SUCCESS,history:true,removing:[],changing:[],moving:[]};
		if (_result.moving!=null){
			for (var i=0;i<_result.moving.length;i+=1){
				if (_result.moving[i].new){
					if (_result.moving[i].object!=null){
						if (_result.moving[i].object.type==ObjectTypes.FRACTION){
							gameM.objectManager.addObject(_result.moving[i].object.line);
							gameM.fractions.push(_result.moving[i].object);
							_result.moving[i].location.expression.addObject(_result.moving[i].object,_result.moving[i].location.pos);
						}else{
							gameM.objectManager.addObject(_result.moving[i].object);
							if (_result.moving[i].origin!=null) _result.moving[i].object.goTo(_result.moving[i].origin.x,_result.moving[i].origin.y);
							_result.moving[i].location.expression.addObject(_result.moving[i].object,_result.moving[i].location.pos);
						}
					}else{
						let _block=game_addNewBlock(_result.moving[i].text);
						if (_result.moving[i].origin!=null) _block.goTo(_result.moving[i].origin.x,_result.moving[i].origin.y);
						_result.moving[i].location.expression.addObject(_block,_result.moving[i].location.pos);
						//_reverse.removing.push(_block);
					}
				}else if (_result.moving[i].object!=null){
					//_reverse.moving.push({object:_result.moving[i].object,location:{expression:_result.moving[i].object.location.expression,pos:_result.moving[i].object.location.pos}});
					if (_result.moving[i].origin!=null) _result.moving[i].object.goTo(_result.moving[i].origin.x,_result.moving[i].origin.y);
					_result.moving[i].location.expression.addObject(_result.moving[i].object,_result.moving[i].location.pos);
					if (_result.moving[i].object.type==ObjectTypes.NUMBER) _result.moving[i].object.closeFactors();
				}
			}
		}
		if (_result.removing!=null){
			for (i=0;i<_result.removing.length;i+=1){
				if (_result.removing[i]==null) continue;
				if (_result.removing[i].type==ObjectTypes.FRACTION){
				//	_reverse.moving.unshift({new:true,object:_result.removing[i],location:{expression:_result.removing[i].location.expression,pos:_result.removing[i].location.pos}});
					game_removeFraction(_result.removing[i]);
				}else{
					if (_result.removing[i].type==ObjectTypes.NUMBER) _result.removing[i].closeFactors();
					//_reverse.moving.push({new:true,text:_result.removing[i].toText(),location:{expression:_result.removing[i].location.expression,pos:_result.removing[i].location.pos}});
					//_reverse.moving.unshift({new:true,object:_result.removing[i],location:{expression:_result.removing[i].location.expression,pos:_result.removing[i].location.pos}});
					let _object=_result.removing[i];
					_result.removing[i].location.expression.removeObject(_object);

					//JMBL.tweenColor(_object.back,7,{tint:CONFIG.colors.VALID},function(){JMBL.tweenWait(_object.back,14,function(){JMBL.tweenTo(_object.back,14,{alpha:0},function(){gameM.objectManager.removeObject(_object)});});});
					JMBL.tweenTo(_object.back,14,{alpha:0},function(){gameM.objectManager.removeObject(_object)})
					//gameM.objectManager.removeObject(_result.removing[i]);
					
				}
			}
		}
		if (_result.changing!=null){
			for (i=0;i<_result.changing.length;i+=1){
				if (_result.changing[i]==null || _result.changing[i].object==null) continue;
				//_reverse.changing.push({object:_result.changing[i].object,text:_result.changing[i].object.toText()});
				if (_result.changing[i].object.type==ObjectTypes.NUMBER) _result.changing[i].object.closeFactors();
				_result.changing[i].object.setText(_result.changing[i].text);
			}
		}
		//game_storeHistory(_result,_reverse);
		//game_storeHistory(_result);
		game_storeTextHistory(gameM.mainExpression.toExportText());
	}else if (_result.type==Validation.ERROR || _result.type==Validation.HARD){
		if (_result.text!=null) myObj_errorPopup(_result.text);
	}else if (_result.type==Validation.SOFT){
		if (_result.text!=null) myObj_errorPopup(_result.text,CONFIG.colors.SOFT);
	}else if (_result.type==Validation.PROMPT){
		if (_result.also!=null) game_finishResult(_result.also);

		let _box=myObj_inputBox(_result.text,_result.obj,function(i){
			_result.obj.clearInnerSign();
			_result.obj2.clearInnerSign();

			game_clearSelected(_result.obj,_result.obj2);

			if (i==null || i.length==1) return;
			game_finishResult(_result.output(i));
		});
		_result.obj.addInnerSign(":");
		_box.links.push(_result.obj);
		_result.obj2.addInnerSign(":");
		_box.links.push(_result.obj2);
	}
	return _result;
}

//==Expression Builder==

function game_makeNewProblem(s){
	let _expression=[];
	let _state=0;
	for (var i=0;i<s.length;i+=1){
		let _char=s.substring(i,i+1);
		if (_char==" ") continue;
		if (_char=="/" || _char=="[" || _char=="]"){
			if (_state==0){
				_state+=1;
				_expression.push(["",""]);
			}else if (_state==1){
				_state+=1;
			}else if (_state==2){
				_state=0;
			}
		}else{
			if (_state==0) _expression.push(_char);
			else _expression[_expression.length-1][_state-1]+=_char;
		}
	}

	for (i=0;i<_expression.length;i+=1){
		if (Array.isArray(_expression[i])){
			gameM.mainExpression.addObject(game_makeNewFraction(_expression[i][0],_expression[i][1]));
		}else{
			gameM.mainExpression.addObject(game_addNewBlock(_expression[i]));
		}
	}
}

function game_makeNewFraction(a1,a2){
	let _fraction=myObj_makeFraction();
	//let _fraction=myObj_makeFraction();
	gameM.fractions.push(_fraction);
	gameM.objectManager.addObject(_fraction.line);
	_fraction.goTo(gameM.mainExpression.x,gameM.mainExpression.y);
	_fraction.numerator.goTo(gameM.mainExpression.x,gameM.mainExpression.y);
	_fraction.denominator.goTo(gameM.mainExpression.x,gameM.mainExpression.y);
	_fraction.line.goTo(gameM.mainExpression.x,gameM.mainExpression.y);
	if (a1!=null) game_loadExpression(_fraction.numerator,a1);
	if (a2!=null) game_loadExpression(_fraction.denominator,a2);
	return _fraction;
}

function game_removeFraction(_fraction){
	_fraction.location.expression.removeObject(_fraction);
	gameM.objectManager.removeObject(_fraction.line);
	JMBL.removeFromArray(_fraction,gameM.fractions);
}

function game_addNewBlock(s){
	if (s==null) return null;
	let _block;
	switch(s){
		case "*": case "+": case "-": case ":": case ";":
			_block=myObj_makeSign(s);
			break;
		case "(": case ")":
			_block=myObj_makeBracket(s);
			break;
		default:
			_block=myObj_makeNumber(s);
	}
	gameM.objectManager.addObject(_block);
	return _block;
}

function game_loadExpression(_expression,a){
	if (!Array.isArray(a)) a=game_stringToArray(a);
	for (var i=0;i<a.length;i+=1){
		let _block=game_addNewBlock(a[i]);
		if (_block!=null) _expression.addObject(_block);
	}
}

function game_stringToArray(s){
	let m=[];
	for (var i=0;i<s.length;i+=1){
		m.push(s.substring(i,i+1));
	}

	for (i=1;i<m.length;i+=1){
		if (m[i]==" "){
			m.splice(i,1);
			i-=1;
		}else if (!isNaN(Number(m[i])) && (!isNaN(Number(m[i-1])) || (i==1 && m[i-1]=="-"))){
			m[i-1]+=m[i];
			m.splice(i,1);
			i-=1;
		}
	}
	return m;
}