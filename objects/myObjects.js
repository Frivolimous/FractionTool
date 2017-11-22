const Validation={
	NO:0,
	WARN:1,
	YES:2,
}

function myObj_makeFraction(expression1,expression2,line){
	let m={};

	m.numerator =  expression1 || myObj_makeExpression();
	m.denominator = expression2 || myObj_makeExpression();
	
	m.numerator.factorsUp=true;
	m.denominator.factorsUp=false;
	m.type="fraction";
	m.line=line || myObj_makeLine();
	m.line.master=m;
	m.numerator.parent=m;
	m.denominator.parent=m;
	m.x=0;
	m.y=0;
	m.noDenominator=false;

	m.hasMult=function(){
		return (this.numerator.hasMult() || this.denominator.hasMult());
	}

	m.hasDiv=function(){
		return (this.numerator.hasDiv() || this.denominator.hasDiv());
	}
	m.hasAdd=function(){
		return (this.numerator.hasAdd() || this.denominator.hasAdd());
	}
	m.hasSub=function(){
		return (this.numerator.hasSub() || this.denominator.hasSub());
	}

	m.toText=function(){
		return this.numerator.toText()+"/"+this.denominator.toText();
	}

	m.goTo=function(_x,_y){
		this.x=_x;
		this.y=_y;
		gameM.needRefresh=true;
		//this.refreshPositions();
	}

	m.tweenTo=function(_x,_y){
		this.x=_x;
		this.y=_y;
		gameM.needRefresh=true;
		//this.refreshPositions();
	}

	m.getWidth=function(){
		return Math.max(this.numerator.getWidth(),this.denominator.getWidth());
	}

	m.refreshPositions=function(){
		this.numerator.goTo(this.x,this.y-40);
		this.denominator.goTo(this.x,this.y+40);
		this.numerator.refreshPositions();
		this.denominator.refreshPositions();
		
		if (this.denominator.list.length==0){
			if (!m.noDenominator){
				m.noDenominator=true;
				this.line.resize(0);	
			}
			this.numerator.goTo(this.x,this.y);
			this.numerator.refreshPositions();
		}else{
			if (m.noDenominator){
				this.numerator.goTo(this.x,this.y-40);
				this.numerator.refreshPositions();
				m.noDenominator=false;
			}

			let _width=Math.max(this.numerator.bounds.right-this.numerator.bounds.left,this.denominator.bounds.right-this.numerator.bounds.left);
			this.line.resize(_width);
			this.line.tweenTo(this.x,this.y);
			//this.line.resize(Math.max(this.numerator.getWidth(),this.denominator.getWidth());
		}
	}

	m.select=function(b){
		if (b){
			if (this.over==null){
				this.over=new PIXI.Graphics();
				this.over.beginFill(CONFIG.colors.SELECTED,0.5);
				let _width=this.getWidth();
				this.over.drawRect(this.x-_width/2-20,this.y-75,_width+40,150);
				this.over.interactive=true;
				this.over.buttonMode=true;
				gameM.gameStage.addChildAt(this.over,1);
			}
		}else{
			if (this.over!=null){
				this.over.parent.removeChild(this.over);
				this.over=null;
			}
		}
	}

	m.inSelectBounds=function(x,y){
		if (this.over==null) return false;
		let _width=this.getWidth();
		if (x>this.x-_width/2-20 && x<this.x+_width/2+20 && y>this.y-75 && y<this.y+75) return true;
		return false;
	}

	m.mergeWith=function(_fraction2,_sign){
		let _fraction1=this;
		if (_fraction1.location.pos>_fraction2.location.pos){
			_fraction1=_fraction2;
			_fraction2=this;
		}
		switch(_sign.toText()){
			case "*":
				if (_fraction1.hasAdd() || _fraction1.hasSub() || _fraction2.hasAdd() || _fraction2.hasSub()) return {type:"error",text:ERROR.ORDER_OP};
				var _moving=[];
				var _changing=[];
				var _removing=[];
				if (_fraction1.denominator.list.length==0){
					_changing.push({object:_fraction1.numerator.list[_fraction1.numerator.list.length-1],text:_fraction1.numerator.list[_fraction1.numerator.list.length-1].toNumber()*_fraction2.numerator.list[0].toNumber()});
					_removing.push(_fraction2.numerator.list[0]);
				}else if (_fraction2.denominator.list.length==0){
					_changing.push({object:_fraction1.numerator.list[_fraction1.numerator.list.length-1],text:_fraction1.numerator.list[_fraction1.numerator.list.length-1].toNumber()*_fraction2.numerator.list[0].toNumber()});
					_removing.push(_fraction2.numerator.list[0]);
				}else{
					_moving.push({new:true,text:"*",location:{expression:_fraction1.numerator,pos:-1}});
					_moving.push({object:_fraction2.numerator.list[0],location:{expression:_fraction1.numerator,pos:-1}});
				}
				
				for (var i=1;i<_fraction2.numerator.list.length;i+=1){
					_moving.push({object:_fraction2.numerator.list[i],location:{expression:_fraction1.numerator,pos:-1}});
				};
				if (_fraction2.denominator.list.length>0 && _fraction1.denominator.list.length>0){
					_moving.push({new:true,text:"*",location:{expression:_fraction1.denominator,pos:-1}});
				}
				for (var i=0;i<_fraction2.denominator.list.length;i+=1){
					_moving.push({object:_fraction2.denominator.list[i],location:{expression:_fraction1.denominator,pos:-1}});
				};
				_removing.push(_fraction2);
				_removing.push(_sign);
				return {type:"success",moving:_moving,removing:_removing,changing:_changing};
			case ":":
				_moving=[];
				for (var i=0;i<_fraction2.numerator.list.length;i+=1){
					_moving.push({object:_fraction2.numerator.list[i],location:{expression:_fraction2.denominator,pos:-1}});
				}
				for (var i=0;i<_fraction2.denominator.list.length;i+=1){
					_moving.push({object:_fraction2.denominator.list[i],location:{expression:_fraction2.numerator,pos:-1}});
				}
				return {type:"success",moving:_moving,changing:[{object:_sign,text:"*"}]};
			case "+": case "-":
				if (_fraction1.location.expression.hasMult()||_fraction1.location.expression.hasDiv()) return {type:"error",text:"Simplify First."};
				if (_sign.toText()=="-" && !OPTIONS.allowSubFractionMultipleNumerators && _fraction2.numerator.list.length>1) return {type:"error",text:"Simplify your Numerator"};
				if (_fraction1.denominator.toText()==_fraction2.denominator.toText()){
					var _moving=[];
					var _removing=[];
					var _changing=[];
					/**/
					let _sign0="+";
					if (_fraction1.location.pos>0 && _fraction1.location.expression.list[_fraction1.location.pos-1].toText()=="-"){
						if (!OPTIONS.allowSubAddFractions) return {type:"error",text:ERROR.SUBTRACT_FIRST};
						_sign0="-";
					}
						
					for (var i=0;i<_fraction2.denominator.list.length;i+=1){
						_removing.push(_fraction2.denominator.list[i]);
					}
					_removing.push(_fraction2);
					_moving.push({object:_sign,location:{expression:_fraction1.numerator,pos:-1}});
					if (_sign0=="-"){
						if  (_sign.toText()=="+") _changing.push({object:_sign,text:"-"});
						if  (_sign.toText()=="-") _changing.push({object:_sign,text:"+"});
					}
					for (var i=0;i<_fraction2.numerator.list.length;i+=1){
						_moving.push({object:_fraction2.numerator.list[i],location:{expression:_fraction1.numerator,pos:-1}});
						if (_fraction2.numerator.list[i].type=="sign" && _sign.toText()!=_sign0){
							if (_fraction2.numerator.list[i].toText()=="-"){
								_changing.push({object:_fraction2.numerator.list[i],text:"+"});
							}else if (_fraction2.numerator.list[i].toText()=="+"){
								_changing.push({object:_fraction2.numerator.list[i],text:"-"});
							}
						}
					}
					return {type:"success",moving:_moving,removing:_removing,changing:_changing};
				}else{
					return {type:"error",text:"Denominators must be identical."};
				}
				break;
		}
	}

	return m;
}

function myObj_makeExpression(a){
	let m={};
	m.x=250;
	m.y=150;
	m.list=a || [];
	m.factorsUp=true;
	m.type="expression";
	m.parent=null;
	m.toText=function(){
		let s="";
		for (var i=0;i<this.list.length;i+=1){
			if (this.list[i] === Object(this.list[i])){
				s+=this.list[i].toText();
			}else{
				s+=String(this.list[i]);
			}
		}
		return s;
	}

	m.addObject=function(_object,i){
		if (i==null || i==-1) i=this.list.length;
		this.list.splice(i,0,_object);
		_object.location={expression:this,pos:i};
		gameM.needRefresh=true;
		//this.refreshPositions();
	}

	m.removeObject=function(_object){
		for (var i=0;i<this.list.length;i+=1){
			if (this.list[i]==_object){
				this.list.splice(i,1);
				gameM.needRefresh=true;
				//this.refreshPositions();
				return;
			}
		}
	}
	m.bounds={left:0,right:0,top:0,bot:0};
	m.graphics=new PIXI.Graphics();

	m.goTo=function(_x,_y){
		this.x=_x;
		this.y=_y;
		gameM.needRefresh=true;
		//m.refreshPositions();
	}

	m.tweenTo=function(_x,_y){
		this.x=_x;
		this.y=_y;
		gameM.needRefresh=true;
		//m.refreshPositions();
	}

	m.rootRefresh=function(){
		let _startX=0;
		let _widths=0;
		/*for (var i=0;i<this.list.length;i+=1){
			_widths+=this.list[i].getWidth();
			if (i>0) _widths+=CONFIG.margins.tileSpacing;
		}*/
		_startX=this.x-_widths/2;
		_widths=0;
		for (var i=0;i<this.list.length;i+=1){
			this.list[i].tweenTo(_startX+_widths+this.list[i].getWidth()/2,this.y);
			if (this.list[i].type=="fraction" || this.list[i].type=="expression") this.list[i].refreshPositions();
			_widths+=this.list[i].getWidth();
			_widths+=CONFIG.margins.tileSpacing*2;
			this.list[i].location={expression:this,pos:i};
		}
	}

	m.getWidth=function(){
		let m=0;
		for (var i=0;i<this.list.length;i+=1){
			m+=this.list[i].getWidth();
			//if (i>0) m+=CONFIG.margins.tileSpacing;
		}
		m+=CONFIG.margins.tileSpacing*(this.list.length-1);
		return m;
	}

	m.refreshPositions=function(){
		let _startX=0;
		let _widths=0;
		for (var i=0;i<this.list.length;i+=1){
			_widths+=this.list[i].getWidth();
			if (i>0) _widths+=CONFIG.margins.tileSpacing;
		}
		_startX=this.x-_widths/2;

		_widths=0;
		for (var i=0;i<this.list.length;i+=1){
			this.list[i].tweenTo(_startX+_widths+this.list[i].getWidth()/2,this.y);
			if (this.list[i].type=="fraction") this.list[i].refreshPositions();
			_widths+=this.list[i].getWidth();
			_widths+=CONFIG.margins.tileSpacing;
			this.list[i].location={expression:this,pos:i};
		}
		
		/*this.bounds.left=_startX-CONFIG.margins.tileSpacing/2;
		this.bounds.right=this.bounds.left+this.list.length*CONFIG.margins.tileSpacing;
		this.bounds.top=this.y-CONFIG.margins.tileSpacing/2;
		this.bounds.bot=this.bounds.top+CONFIG.margins.tileSpacing;*/
		this.bounds.left=_startX-CONFIG.margins.tileSpacing;
		this.bounds.right=this.bounds.left+this.getWidth()+CONFIG.margins.tileSpacing*2;
		this.bounds.top=this.y-(CONFIG.margins.tileSize+CONFIG.margins.tileSpacing)/2;
		this.bounds.bot=this.bounds.top+CONFIG.margins.tileSize+CONFIG.margins.tileSpacing;
		this.graphics.clear();
		if (this.list.length>0){
			this.graphics.beginFill(CONFIG.colors.BOX);
			this.graphics.lineStyle(1,CONFIG.colors.BOX_BORDER);
			this.graphics.drawRoundedRect(this.bounds.left,this.bounds.top,this.bounds.right-this.bounds.left,this.bounds.bot-this.bounds.top,5);
		}
		/*if (this.parent!=null && this.parent.type=="fraction"){
			this.parent.resize();
		}*/
	}

	m.hitTestLoc=function(x,y){
		var m;
		if (x>this.bounds.left-30 && x<this.bounds.right+30 && y>this.bounds.top-30 && y<this.bounds.bot+30){
			m=(x-this.bounds.left)/(this.bounds.right-this.bounds.left)*this.list.length;
			m=Math.round(m*2)/2;
			if (m==Math.floor(m)){
				return m;
				//return this.list[m];
			}else{
				//return Math.floor(m);
				return this.list[Math.floor(m)];
			}
		}else{
			return null;
		}
	}

	m.canPlaceAt=function(_object,i){
		let _result=this.getPlaceAt(_object,i);
		if (_result==null) return Validation.NO;
		if (_result==false) return Validation.WARN;
		return Validation.YES;
	}
	
	m.getPlaceAt=function(_object,i){
		return null;

		let _toLeft;
		let _toRight;
		let _signToNeg;
		let _signToPos;

		if (_object.location.expression==this){
			let _index=_object.location.pos;
			let _dif=i-_index;
			if (_dif<3 && _dif>-2) return null;
			if (_dif%2==0){
				//leftOfNum
				return null;
			}else{
				//rightOfNum
				if (i>_index){
					//moving to the right
				}else{
					//moving to the left
				}
			}
		}else{
			//comes from a different place!
			return null;
		}
		
/*
		let _sign;
		if (_object.location.pos==0){
			if (_object.location.expression.list.length>1){
				_sign=_object.location.expression.list[1];
			}
		}else{
			if (_object.location.expression==_expression && i>_object.location.pos){
				_sign=_object.location.expression.list[_object.location.pos+1];
			}else{
				_sign=_object.location.expression.list[_object.location.pos-1];
			}
		}
		*/
		return {toLeft:_toLeft,toRight:_toRight,signToNeg:_signToNeg,signToPos:_signToPos,numTimesNeg:_numTimesNeg};
	}

	m.canCombine=function(_obj1,_obj2){
		let _result=this.getCombine(_obj1,_obj2);
		if (_result==null) return Validation.NO;
		if (_result.type=="error" || (OPTIONS.showHardErrors && _result.type=="hard")) return Validation.WARN;
		if (_result.type=="success" || _result.type=="prompt") return Validation.YES;
		return Validation.NO;
	}

	m.hasMult=function(){
		for (var i=0;i<this.list.length;i+=1){
			if (this.list[i].toText()=="*") return true;
		}
		return false;
	}
	m.hasDiv=function(){
		for (var i=0;i<this.list.length;i+=1){
			if (this.list[i].toText()==":") return true;
		}
		return false;
	}
	m.hasAdd=function(){
		for (var i=0;i<this.list.length;i+=1){
			if (this.list[i].toText()=="+") return true;
		}
		return false;
	}
	m.hasSub=function(){
		for (var i=0;i<this.list.length;i+=1){
			if (this.list[i].toText()=="-") return true;
		}
		return false;
	}

	m.getCombine=function(_obj1,_obj2){
		//obj 1 should always be here.
		//obj 1 is what you are dropping ON; location = fixed
		if (_obj1==_obj2) return null;
		if (_obj1.type!="number" || _obj2.type!="number"){
			//if (_obj1.type=="fraction"
			//dropping on self, dropping on a sign.
			if (_obj1.type=="fraction" && _obj2.type=="fraction"){
				var index1;
				var index2;
				var flipped=false;
				for (var i=0;i<this.list.length;i+=1){
					if (this.list[i]==_obj1) index1=i;
					if (this.list[i]==_obj2) index2=i;
				}
				if (index1>index2){
					flipped=true;
					let index3=index1;
					let _obj3=_obj1;
					index1=index2;
					index2=index3;
					_obj1=_obj2;
					_obj2=_obj3;
				}
				let _sign=this.list[index1+1];
				if (this.list[index2-1]==_sign){
					return _obj1.mergeWith(_obj2,_sign);
				}else{
					return {type:"error",text:"Currently, only ADJACENTS can combine"};
				}
			}else{
				return null;
			}
		}
		var index1;
		var index2;
		var flipped=false;
		for (var i=0;i<this.list.length;i+=1){
			if (this.list[i]==_obj1) index1=i;
			if (this.list[i]==_obj2) index2=i;
		}
		if (index1==null){
			console.log("ERROR");
		}else if (index2==null){
			// 2 comes from elsewhere
			let _fraction=this.parent;
			if (_fraction.type=="fraction" && _obj2.location.expression.parent==_fraction){
				//same fraction: Numerator and Denominator
				if (_fraction.hasAdd() || _fraction.hasSub() || _fraction.hasDiv()) return {type:"hard",text:"simplify first"}; //numerator to denominator, only works if Multiplication Only.
				return myObj_cancelValues(_obj1,_obj2,this,_obj2.location.expression);

			}else{
				//DIFFERENT FRACTIONS
				if (!OPTIONS.moveAcrossFractions) return {type:"error",text:ERROR.COMBINE_FIRST};

				let _master=_fraction.location.expression;
				let _fraction2=_obj2.location.expression.parent;
				if (_fraction.hasAdd() || _fraction.hasSub() || _fraction2.hasAdd() || _fraction2.hasSub()){
					return {type:"error",text:ERROR.ORDER_OP};
				}
				let fIndex1;
				let fIndex2;
				var fFlipped=false;
				for (var i=0;i<_master.list.length;i+=1){
					if (_master.list[i]==_fraction) fIndex1=i;
					if (_master.list[i]==_fraction2) fIndex2=i;
				}
				let _fSign;
				if (fIndex1<fIndex2){
					if (_master.list[fIndex1+1]==_master.list[fIndex2-1]){
						_fSign=_master.list[fIndex1+1];
					}else{
						let j=fIndex1+2;
						while (j<=fIndex2-1){
							if (_master.list[j].toText()=="+" || _master.list[j].toText()=="-"){
								//if there's a + or - in between these values and a * or : is involved
								return {type:"error",text:ERROR.ORDER_OP};
							}
							j+=1;
						}
						_fSign=_master.list[fIndex2-1];
					}
				}else{
					if (_master.list[fIndex2+1]==_master.list[fIndex1-1]){
						_fSign=_master.list[fIndex2+1];
					}else{
						let j=fIndex2+2;
						while (j<=fIndex1-1){
							if (_master.list[j].toText()=="+" || _master.list[j].toText()=="-"){
								//if there's a + or - in between these values and a * or : is involved
								return {type:"error",text:ERROR.ORDER_OP};
							}
							j+=1;
						}
						_fSign=_master.list[fIndex2+1];
					}
				}
				if (_fSign!=null){
					if (_fSign.toText()=="*"){
						if ((_fraction.numerator==_obj1.location.expression)==(_fraction2.numerator==_obj2.location.expression)){
							if (_fraction2.denominator.list.length==0 && _fraction2.numerator.list.length==1){
								return {type:"success",changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[_obj2,_fSign,_fraction2]};
							}
							//N-N or D-D
							let sign2;
							if (_obj2.location.pos>0){
								sign2=_obj2.location.expression.list[_obj2.location.pos-1];
							}else if (_obj2.location.expression.list.length>1){
								sign2=_obj2.location.expression.list[_obj2.location.pos+1];
							}else{
								if (_fraction.numerator==_obj1.location.expression){
									return {type:"success",changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())},{object:_obj2,text:"1"}]};
								}else{
									return {type:"success",changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[_obj2]};
								}
							}
							return {type:"success",changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[sign2,_obj2]};
						}else{
							//N-D or D-N
							return myObj_cancelValues(_obj1,_obj2,this,_obj2.location.expression);
						}
					}else if (_fSign.toText()==":"){
						return {type:"error",text:"Click the Division"};
					}else{
						if ((_fraction.numerator==_obj1.location.expression)==(_fraction2.numerator==_obj2.location.expression)){
							if (_fraction.numerator==_obj1.location.expression){
								if (!OPTIONS.numeratorsAcrossAddition) return {type:"hard",text:"Can't do that"};
							}else{
								if (!OPTIONS.divisorsAcrossAddition) return {type:"hard",text:"Can't do that"};
							}
							return _fraction.mergeWith(_fraction2,_fSign);
						}return {type:"hard",text:"Can't do that"};
						//return {type:"error",text:"NOT MULT"};
					}
				}else{
					return {type:"error",text:"Currently, only ADJACENTS can combine"};
				}
			}
		}else{
			// both are in this expression
			if (index1>index2){
				flipped=true;
				let index3=index1;
				let _obj3=_obj1;
				index1=index2;
				index2=index3;
				_obj1=_obj2;
				_obj2=_obj3;
			}
			if (index1>0 && this.list[index1-1].toText()==":"){
				//division out of order ***
				return {type:"error",text:"Follow Order of Operations."};
			}

			let sign1=this.list[index1+1];
			let sign2=this.list[index2-1];
			if (sign1==sign2){
				//ADJACENT -- EASY
				switch(sign1.toText()){
					case "*": //adjacent multiplication
						return {type:"success",changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[sign2,_obj2]};
					case ":": //adjacent division
						return {type:"success",changing:[{object:_obj1,text:String(_obj1.toNumber()/_obj2.toNumber())}],removing:[sign2,_obj2]};
					case "+": case "-":
						if (OPTIONS.forceMultFirstOrderOp && (this.hasMult() || this.hasDiv())) return {type:"error",text:"Follow Order of Operations."};

						let value1=_obj1.toNumber();
						if (index1>0){
							if (this.list[index1-1].toText()=="-"){
								if (!OPTIONS.allowSubAddInside) return {type:"error",text:ERROR.SUBTRACT_FIRST};
								value1=-value1;
							}else if (this.list[index1-1].toText()!="+"){
								return {type:"error",text:"Follow Order of Operations."};
							}
						}
						if (this.list.length>index2+1){
							if (this.list[index2+1].toText()!="+" && this.list[index2+1].toText()!="-"){
								return {type:"error",text:"Follow Order of Operations."};
							}
						}
						let value2=_obj2.toNumber();
						if (this.list[index2-1].toText()=="-"){
							value2=-value2;
						}
						value1+=value2;
						let _changing;
						if (index1>0){
							if (value1>=0){
								_changing={object:this.list[index1-1],text:"+"};
							}else{
								_changing={object:this.list[index1-1],text:"-"};
								value1=Math.abs(value1);
							}
						}
						
						//addition or subtraction
						return {type:"success",changing:[{object:_obj1,text:String(value1)},_changing],removing:[sign2,_obj2]};
				}
			}else{
				//NON-ADJACENT
				if (OPTIONS.onlyAdjacentOperations) return {type:"hard",text:"Only Adjacents."};
				switch (sign1.toText()){
					case "*": case ":":
						let j=sign1.location.pos+1;
						while (j<=sign2.location.pos){
							if (this.list[j].toText()=="+" || this.list[j].toText()=="-"){
								//if there's a + or - in between these values and a * or : is involved
								return {type:"error",text:"Follow Order of Operations."};
							}
							j+=1;
						}
						if (sign2.toText()=="*"){
							//multiplication.
							//if there is a : after the first value, you cannot move that one to the second.
							
							let _value=_obj1.toNumber()*_obj2.toNumber()
							if (flipped && sign1.toText()!=":"){
								return {type:"success",changing:[{object:_obj2,text:String(_value)}],removing:[sign1,_obj1]};
							}else{
								return {type:"success",changing:[{object:_obj1,text:String(_value)}],removing:[sign2,_obj2]};
							}
						}else{
							//division
							//x*y:z,  move x to z, becomes y*[x:z]
							let _value=_obj1.toNumber()/_obj2.toNumber()
							if (flipped){
								return {type:"success",changing:[{object:_obj2,text:String(_value)},{object:sign2,text:"*"}],removing:[sign1,_obj1]};
							}else{
								return {type:"success",changing:[{object:_obj1,text:String(_value)}],removing:[sign2,_obj2]};
							}
						}
					case "+": case "-":
						//can't do addition or subtraction until multiplication is dealt with.
						if (OPTIONS.forceMultFirstOrderOp && (this.hasMult() || this.hasDiv())) return {type:"error",text:"Follow Order of Operations."};
						let value1=_obj1.toNumber();
						if (index1>0){
							if (this.list[index1-1].toText()=="-"){
								if (!OPTIONS.allowSubAddInside) return {type:"error",text:ERROR.SUBTRACT_FIRST};
								value1=-value1;
							}else if (this.list[index1-1].toText()!="+"){
								return {type:"error",text:"Follow Order of Operations."};
							}
						}
						if (this.list.length>index2+1){
							if (this.list[index2+1].toText()!="+" && this.list[index2+1].toText()!="-"){
								return {type:"error",text:"Follow Order of Operations."};
							}
						}
						let value2=_obj2.toNumber();
						if (sign2.toText()=="-") value2=-value2;
						value1+=value2;

						if (!flipped){
							let _signToNeg;
							let _signToPos;
							if (index1>0){
								if (value1>=0){
									_signToPos=this.list[index1-1];
								}else{
									_signToNeg=this.list[index1-1];
									value1=Math.abs(value1);
								}
							}
							//Distant Addition/Subtraction
							return {type:"success",changing:[{object:_obj1,text:String(value1)},{object:_signToNeg,text:"-"},{object:_signToPos,text:"+"}],removing:[_obj2,sign2]};
						}else{
							let _signToNeg;
							let _signToPos;

							if (value1<0){
								_signToNeg=sign2;
								value1=Math.abs(value1);
							}else{
								_signToPos=sign2;
							}
							if (index1==0){
								let _numTimesNeg;
								if (this.list[index1+1].toText()=="-"){
									_numTimesNeg=this.list[index1+2];
								}
								//Still Distant Addition/Subtraction, when moving to FRONT
								return {type:"success",changing:[{object:_obj2,text:String(value1)},{object:_signToNeg,text:"-"},{object:_signToPos,text:"+"},{object:_numTimesNeg,text:(_numTimesNeg!=null?String((-1)*_numTimesNeg.toNumber()):null)}],removing:[_obj1,sign1]};
							}else{
								//Still Distant Addition/Subtraction, when moving to REGULAR
								return {type:"success",changing:[{object:_obj2,text:String(value1)},{object:_signToNeg,text:"-"},{object:_signToPos,text:"+"}],removing:[_obj1,this.list[index1-1]]};
							}
						}
				}
			}
			//nothing fulfilled
			return {type:"error",text:"Generic Error."};
		}
		//nothing to do
		return null;
	}

	return m;
}

function myObj_cancelValues(_obj1,_obj2,_expression1,_expression2){
	//Cancelling Numerator and Denominator.  Either obj1 or obj2 can be numerator.
	//Includes same and different fraction.
	//Only takes place if purely MULTIPLICATION is involved.
	//value 1 should always still exist, if possible (what is landed on)
	let _value1=_obj1.toNumber();
	let _value2=_obj2.toNumber();
	let _sign1;
	let _sign2;
	let _num1=false;
	if (_obj1.location.expression.factorsUp) _num1=true;

	if (_obj1.toText()=="1" &&  _num1 && _expression1.list.length==1 && _obj2.toText()!="-1") return {type:"error",text:"Solo One cannot be combined"};
	if (_obj2.toText()=="1" && !_num1 && _expression2.list.length==1 && _obj1.toText()!="-1") return {type:"error",text:"Solo One cannot be combined"};
	
	if (_obj1.location.pos>0){
		_sign1=_expression1.list[_obj1.location.pos-1];
	}else if (_expression1.list.length>1){
		_sign1=_expression1.list[_obj1.location.pos+1];
	}
	if (_obj2.location.pos>0) {
		_sign2=_expression2.list[_obj2.location.pos-1];
	}else if (_expression2.list.length>1){
		_sign2=_expression2.list[_obj2.location.pos+1];
	}
	let _num=_num1?_obj1:_obj2;
	let _den=_num1?_obj2:_obj1;
	let _signN=_num1?_sign1:_sign2;
	let _signD=_num1?_sign2:_sign1;
	let _numE=_num1?_expression1:_expression2;
	let _denE=_num1?_expression2:_expression1;
	
	if (_value1==_value2){
		//Identical Values cancel out
		if (_numE.list.length==1){
			return {type:"success",changing:[{object:_num,text:"1"}],removing:[_signD,_den]};/*
		if (_num1 && (_expression1.list.length==1)){
			return {type:"success",changing:[{object:_obj1,text:"1"}],removing:[_sign2,_obj2]};
		}else if (!_num1 && (_expression2.list.length==1)){
			return {type:"success",changing:[{object:_obj2,text:"1"}],removing:[_sign1,_obj1]};*/
		}else{
			return {type:"success",removing:[_obj1,_obj2,_sign1,_sign2]};
		}
	}else if (_value1%_value2==0){
		//The second one is a factor of the first one
		if (OPTIONS.combineFactors=="input"){
			return {type:"prompt",text:"What is a common factor for:\n"+String(_value1)+" and "+String(_value2),
				output:function(i){
					return myObj_finishCancellingBy(_obj1,_obj2,i);
				}
			};
		}else if (OPTIONS.combineFactors==true || (OPTIONS.combineFactors=="-1" && _value2==-1)){
			return myObj_finishCancellingBy(_obj1,_obj2,_value2);
		}else{
			return {type:"error",text:"Try factoring first."};
		}
	}else if (_value2%_value1==0){
		//The first one is a factor of the second one
		if (OPTIONS.combineFactors=="input"){
			return {type:"prompt",text:"What is a common factor for:\n"+String(_value1)+" and "+String(_value2),
				output:function(i){
					return myObj_finishCancellingBy(_obj1,_obj2,i);
				}
			};
		}else if (OPTIONS.combineFactors==true || (OPTIONS.combineFactors=="-1" && _value1==-1)){
			return myObj_finishCancellingBy(_obj1,_obj2,_value1);
		}else{
			return {type:"error",text:"Try factoring first."};
		}
	}else{
		//Neither of them are factors 
		//Includes the case where they share a factor ***SEPARATE***
		if (OPTIONS.combineCommon!=false){

			if (OPTIONS.combineCommon=="input"){
				return {type:"prompt",text:"What is a common factor for:\n"+String(_value1)+" and "+String(_value2),
					output:function(i){
						return myObj_finishCancellingBy(_obj1,_obj2,i);
					}
				};
			}else if (OPTIONS.combineCommon==true){

			}
		}
		if (OPTIONS.combineNot=="input"){
			return {type:"prompt",text:"What is a common factor for:\n"+String(_value1)+" and "+String(_value2),
				output:function(i){
					return myObj_finishCancellingBy(_obj1,_obj2,i);
				}
			};
		}
		return {type:"error",text:"Cannot Cancel These"};
	}
	return {type:"error",text:"WIP"};
}

function myObj_finishCancellingBy(_obj1,_obj2,_factor){
	let _value1=_obj1.toNumber();
	let _value2=_obj2.toNumber();
	if (_value1%_factor==0 && _value2%_factor==0){
		_value1/=_factor;
		_value2/=_factor;
		if (_value2==-1 && !_obj2.location.expression.factorsUp){
			_value2=1;
			_value1*=-1;
		}
		if (_value1==-1 && !_obj1.location.expression.factorsUp){
			_value1=1;
			_value2*=-1;
		}
		let _removing=[];
		let _changing=[];
		let _sign1;
		let _sign2;
		if (_obj1.location.pos>0){
			_sign1=_obj1.location.expression.list[_obj1.location.pos-1];
		}else if (_obj1.location.expression.list.length>1){
			_sign1=_obj1.location.expression.list[_obj1.location.pos+1];
		}
		if (_obj2.location.pos>0) {
			_sign2=_obj2.location.expression.list[_obj2.location.pos-1];
		}else if (_obj2.location.expression.list.length>1){
			_sign2=_obj2.location.expression.list[_obj2.location.pos+1];
		}
		if (_value1!=1 || (_value1==1 && _obj1.location.expression.factorsUp)){
			_changing.push({object:_obj1,text:String(_value1)});
		}else{
			_removing.push(_obj1);
			if (_sign1!=null) _removing.push(_sign1);
		}
		if (_value2!=1 || (_value2==1 && _obj2.location.expression.factorsUp)){
			_changing.push({object:_obj2,text:String(_value2)});
		}else{
			_removing.push(_obj2);
			if (_sign2!=null) _removing.push(_sign2);
		}
		return {type:"success",changing:_changing,removing:_removing};
	}else{
		return {type:"error",text:String(_factor)+" is not a common divisor."};
	}
}

function myObj_makeBlank(){
	let m={};
	m.x=0;
	m.y=0;
	m.location=null;
	m.graphics=new PIXI.Graphics();
	m.graphics.beginFill(CONFIG.colors.BLANK);
	m.graphics.lineStyle(1,CONFIG.colors.BLANK);
	m.graphics.drawRoundedRect(-50,-50,100,100,5);
	m.graphics.alpha=0.5;

	m.attachTo=function(_obj,_validation){
		if (_validation==Validation.NO){
			this.disabled=true;
			this.graphics.visible=false;
			return;
		}
		this.graphics.visible=true;
		this.graphics.width=_obj.getWidth()+CONFIG.margins.tileSpacing;
		this.graphics.height=_obj.getWidth()+CONFIG.margins.tileSpacing;
		this.graphics.x=_obj.x;
		this.graphics.y=_obj.y;
		this.disabled=false;

		if (_validation==Validation.YES){
			this.red=false;
			this.graphics.tint=CONFIG.colors.SELECTED;
		}else if (_validation==Validation.WARN){
			this.red=true;
			this.graphics.tint=CONFIG.colors.RED;
		}
		
	}

	m.placeAt=function(_expression,i,_validation){
		if (_validation==Validation.NO){
			this.disabled=true;
			this.graphics.visible=false;
			return;
		}
		this.graphics.visible=true;
		this.graphics.width=20;
		this.graphics.height=CONFIG.margins.tileSpacing;
		if (i==0){
			this.graphics.x=_expression.list[i].x-CONFIG.margins.tileSpacing/2;
			this.graphics.y=_expression.list[i].y;
		}else{
			this.graphics.x=_expression.list[i-1].x+CONFIG.margins.tileSpacing/2;
			this.graphics.y=_expression.list[i-1].y;
		}
		this.disabled=false;

		if (_validation==Validation.YES){
			this.red=false;
		}else if (_validation==Validation.WARN){
			this.red=true;
		}
	}
	return m;
}

function myObj_makeFactor(s,v){
	let m=myObj_makeBasic();

	m.back.beginFill(CONFIG.colors.FACTOR);
	m.back.lineStyle(2,0);
	m.back.drawRoundedRect(-CONFIG.margins.tileSize/2,-10,CONFIG.margins.tileSize,20,2);
	m.text=new PIXI.Text(s,{fill:CONFIG.colors.SIGN_TEXT,fontSize:10});
	m.text.x=-m.text.width/2;
	m.value=v;
	m.text.y=-5;
	m.addChild(m.text);
	m.type="factor";

	m.toText=function(){
		return this.text.text;
	}

	m.setText=function(s){
		this.text.text=s;
	}

	return m;
}

function myObj_makeSign(s){
	let m=myObj_makeBasic();

	m.back.beginFill(CONFIG.colors.SIGN);
	m.back.lineStyle(2,0);
	m.back.drawRoundedRect(-25,-25,CONFIG.margins.tileSize,CONFIG.margins.tileSize,10);
	m.makeText(s,{fill:CONFIG.colors.SIGN_TEXT});
	
	m.type="sign";
	
	m.toText=function(){
		if (this.text.text=="\u2022") return "*";
		if (this.text.text=="\u2012") return "-";
		return this.text.text;
	}

	m.setText=function(s){
		switch(s){
			case ":": case "/":
				this.text.text=":";
				break;
			case "*": case "·": case "x": case "•":
				this.text.text="\u2022";
				break;
			case "-": case "─":
				this.text.text="\u2012";
				break;
			default: this.text.text=s;
		}
	}
	m.setText(s);

	return m;
}

function myObj_makeNumber(s){
	let m=myObj_makeBasic();
	m.makeText(s,{fill:CONFIG.colors.NUMBER_TEXT});

	m.back.beginFill(CONFIG.colors.NUMBER_NEUTRAL);
	m.back.lineStyle(2,CONFIG.colors.WHITE);
	m.back.drawRoundedRect(-25,-25,CONFIG.margins.tileSize,CONFIG.margins.tileSize,10);
	
	m.type="number";

	m.toNumber=function(){
		return Number(this.toText());
	}

	m.select=function(b){

		if (b=="red"){
			this.back.tint=CONFIG.colors.RED;
		}else if (b){
			this.back.tint=CONFIG.colors.SELECTED;
		}else{
			this.back.tint=CONFIG.colors.NUMBER;
		}
	}

	m.select(false);

	return m;
}

function myObj_makeLine(){
	let m=myObj_makeBasic();

	m.master=null;
	m.type="line";

	m.resize=function(width){
		this.back.clear();
		this.back.beginFill(CONFIG.colors.BOX);
		this.back.lineStyle(1,CONFIG.colors.BOX_BORDER);
		this.back.drawRoundedRect(-width/2-5,-2-5,width+10,4+10,5);
		this.back.lineStyle(0);
		this.back.beginFill(0);
		this.back.drawRoundedRect(-width/2,-2,width,4,3);
	}
	m.resize(100);

	return m;
}

function myObj_makeBasic(){
	let m=new PIXI.Sprite();
	m.back=new PIXI.Graphics;
	m.addChild(m.back);

	m.goal={x:0,y:0};
	m.interactive=true;
	m.buttonMode=true;

	if (gameM.mainExpression!=null){
		m.x=gameM.mainExpression.x;
		m.y=gameM.mainExpression.y;
	}

	m.makeText=function(s,style){
		this.text=new PIXI.Text(s,style);
		this.text.y=-15;
		this.text.x=-this.text.width/2;
		
		this.addChild(this.text);
	}

	m.toText=function(){
		if (this.text!=null) return this.text.text;
	}

	m.setText=function(s){
		if (this.text!=null) this.text.text=s;
		this.text.x=-this.text.width/2;
	}

	m.errorFlash=function(){
		JMBL.tweenTo(this.back,15,{tint:0xff0000},function(){
			JMBL.tweenWait(m.back,10,function(){
			JMBL.tweenTo(m.back,15,{tint:0xffffff});
		});
		});
	}

	m.goTo=function(x,y){
		this.x=this.goal.x=x;
		this.y=this.goal.y=y;
	}

	m.tweenTo=function(x,y){
		this.goal.x=x;
		this.goal.y=y;
	}

	m.getWidth=function(){
		return this.back.width;
	}

	m.select=function(b){
		if (b){
			this.back.tint=CONFIG.colors.SELECTED;
		}else{
			this.back.tint=CONFIG.colors.BLANK;
		}
	}

	m.getDistance=function(x,y){
		if (x>this.x-this.back.width/2 && x<this.x+this.back.width/2 && y>this.y-this.back.height/2 && y<this.y+this.back.height/2){
			return 0;
		}else{
			return 10000;
		}
	}

	return m;
}


var myObj_currentError;
var myObj_currentInput;

function myObj_inputBox(s,_obj,output){
	if (myObj_currentInput!=null){
		myObj_currentInput.dispose();
	}
	let m=new PIXI.Sprite();
	m.back=new PIXI.Graphics();
	m.text=new PIXI.Text(s,{fill:0,fontSize:12});
	m.text.y=7;
	m.input=new PIXI.Text("",{fill:0,fontSize:14});

	m.back.lineStyle(1,CONFIG.colors.BOX_BORDER);
	m.back.beginFill(CONFIG.colors.BOX);
	m.back.drawRoundedRect(0,0,200,100,20);
	m.back.lineStyle(1,CONFIG.colors.NUMBER);
	m.back.beginFill(CONFIG.colors.WHITE);
	m.back.drawRoundedRect(75,40,45,25,5);
	
	let _bounds=m.text.getBounds();
	m.text.x=100-_bounds.width/2;
	m.input.x=78;
	m.input.y=43;
	m.output=output;
	m.carat=new PIXI.Graphics();
	m.carat.beginFill(CONFIG.colors.NUMBER);
	m.carat.drawRect(0,0,2,15);
	m.carat.y=m.input.y+1;
	m.carat.x=m.input.x+m.input.width;
	toggleCarat=function(){
		if (m.carat!=null){
			if (m.carat.parent==null) m.addChild(m.carat);
			else m.carat.parent.removeChild(m.carat);
			window.setTimeout(toggleCarat,400);
		}
	}
	window.setTimeout(toggleCarat,400);

	m.addChild(m.back);
	m.addChild(m.text);
	m.addChild(m.input);
	app.stage.addChild(m);
	let _up=false;
	if (_obj.type=="expression"){
		if (_obj.factorsUp) _up=true;
	}else{
		if (_obj.location.expression.factorsUp) _up=true;
	}

	m.x=_obj.x-100;
	if (_up) m.y=_obj.y-130;
	else m.y=_obj.y+30;

	myObj_currentInput=m;

	m.keyDown=function(_key){
		switch(_key){
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
			case "8":
			case "9":
			case "0":
				if (m.input.text.length<=3 || (m.input.text.charAt(1)=="-" && m.input.text.length<=4)) m.input.text+=_key;
				if (m.carat!=null) m.carat.x=m.input.x+m.input.width;
				break;
			case "-":
				if (m.input.text.length==1) m.input.text+=_key;
				if (m.carat!=null) m.carat.x=m.input.x+m.input.width;
				break;
			 //case "_": game_zoomBy(1/1.2); break;
			case "Backspace": m.input.text=m.input.text.substring(0,m.input.text.length-1); if (m.carat!=null) m.carat.x=m.input.x+m.input.width;
				break;
			case "Enter": m.dispose(); break;
			case "Escape": m.input.text=""; m.dispose(); break;
		}
	}

	m.inBounds=function(x,y){
		if (x>this.x && x<this.x+200 && y>this.y && y<this.y+200) return true;
		return false;
	}

	m.dispose=function(b=true){
		m.carat=null;
		if (b && this.output!=null){
			this.output(m.input.text);
		}
		this.destroy();
		if (myObj_currentInput==this) myObj_currentInput=null;
	}

	m.okButton=button_constructBasic({label:"OK",labelStyle:{fill:0xffffff,fontSize:10},bgColor:0x337733,width:30,height:15,output:function(){m.dispose()}});
	m.okButton.x=105;
	m.okButton.y=73;
	m.addChild(m.okButton);
	m.cancelButton=button_constructBasic({label:"CANCEL",labelStyle:{fill:0xffffff,fontSize:10},bgColor:0x773333,width:50,height:15,output:function(){m.input.text=""; m.dispose()}});
	m.cancelButton.x=45;
	m.cancelButton.y=73;
	m.addChild(m.cancelButton);
}

function myObj_errorPopup(s,color=CONFIG.colors.RED){
	if (myObj_currentError!=null){
		myObj_currentError.dispose();
		myObj_currentError=null;
	}
	let m=new PIXI.Sprite();
	m.back=new PIXI.Graphics();
	m.text=new PIXI.Text(s,{fill:0xffffff,fontSize:12,align:"center"});
	let _bounds=m.text.getBounds();
	m.text.x=100-_bounds.width/2;
	m.back.beginFill(color);
	m.back.drawRect(0,0,200,20);
	m.back.endFill();
	m.addChild(m.back);
	m.addChild(m.text);

	m.x=CONFIG.errorLoc.x;
	m.y=CONFIG.errorLoc.y;
	if (OPTIONS.errorDisplay=="clickable"){
		m.interactive=true;
		m.buttonMode=true;
		m.on("pointerdown",function(){m.dispose();});
		m.back.lineStyle(2,CONFIG.colors.WHITE);
		m.back.moveTo(191,1);
		m.back.lineTo(198,8);
		m.back.moveTo(198,1);
		m.back.lineTo(191,8);
	}

	app.stage.addChild(m);
	JMBL.tweenFrom(m,20,{alpha:0},function(){
		if (OPTIONS.errorDisplay=="timed"){
			JMBL.tweenWait(m,100,function(){
				m.dispose();
			});
		}
	});

	m.dispose=function(){
		if (m.disposing) return;
		m.disposing=true;
		JMBL.tweenTo(m,10,{alpha:0},function(){
			m.parent.removeChild(m);
			m.destroy();
			if (myObj_currentError==m) myObj_currentError=null;
		});
	}

	myObj_currentError=m;

	return m;
}