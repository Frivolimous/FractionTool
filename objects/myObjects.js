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
					
			}
			this.line.resize(-1);
			if (m.denominator.list.length==0){
				if (m.numerator.list.length>1){
					this.line.makeBrackets(this.numerator.bounds.right-this.numerator.bounds.left);
				}
			}
			
			this.numerator.goTo(this.x,this.y);
			this.numerator.refreshPositions();
		}else{
			if (m.noDenominator){
				this.numerator.goTo(this.x,this.y-40);
				this.numerator.refreshPositions();
				m.noDenominator=false;
			}
			
			let _width=Math.max(this.numerator.bounds.right-this.numerator.bounds.left,this.denominator.bounds.right-this.denominator.bounds.left);
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
		let _root=_fraction1.location.expression;

		if (_fraction1.location.pos>_fraction2.location.pos){
			_fraction1=_fraction2;
			_fraction2=this;
		}
		switch(_sign.toText()){
			case "*":
				var _moving=[];
				var _changing=[];
				var _removing=[];

				if (OPTIONS.forceLeftToRight!=false){
					let _firstMult=null;
					for (var i=0;_firstMult==null;i+=1){
						if (_root.list[i].type=="sign" && _root.list[i].toText()=="*"){
							_firstMult=i;
						}
					}
					if (OPTIONS.forceLeftToRight==true && _sign.location.pos!=_firstMult) return {type:"soft",text:ERROR.LEFT_TO_RIGHT};
					if (_sign.location.pos!=_firstMult && OPTIONS.forceLeftToRight=="mixed"){
						if (_root.hasAdd() || _root.hasSub()){
							return {type:"soft",text:ERROR.LEFT_TO_RIGHT};
						}

						if (_root.hasDiv()){
							return {type:"soft",text:ERROR.DIVISION_FIRST};
						}
					}
				}

				if (OPTIONS.allowMergeMakeBrackets==true){
					if (_fraction1.numerator.hasAdd() || _fraction1.numerator.hasSub()){
						_moving.push({new:true,text:"(",location:{expression:_fraction1.numerator,pos:0}});
						_moving.push({new:true,text:")",location:{expression:_fraction1.numerator,pos:-1}});
					}
					if (_fraction1.denominator.hasAdd() || _fraction1.denominator.hasSub()){
						_moving.push({new:true,text:"(",location:{expression:_fraction1.denominator,pos:0}});
						_moving.push({new:true,text:")",location:{expression:_fraction1.denominator,pos:-1}});
					}
				}else{
					//combining two fractions that have an addition or subtraction
					if (_fraction1.hasAdd() || _fraction1.hasSub() || _fraction2.hasAdd() || _fraction2.hasSub()) return {type:"error",text:ERROR.ORDER_OP};
				}
					
				_moving.push({new:true,text:"*",location:{expression:_fraction1.numerator,pos:-1}});
				if (OPTIONS.allowMergeMakeBrackets==true){
					if (_fraction2.numerator.hasAdd() || _fraction2.numerator.hasSub()){
						_moving.push({new:true,text:"(",location:{expression:_fraction1.numerator,pos:-1}});
					}
				}
				_moving.push({object:_fraction2.numerator.list[0],location:{expression:_fraction1.numerator,pos:-1}});
				
				for (var i=1;i<_fraction2.numerator.list.length;i+=1){
					_moving.push({object:_fraction2.numerator.list[i],location:{expression:_fraction1.numerator,pos:-1}});
				};

				if (OPTIONS.allowMergeMakeBrackets==true){
					if (_fraction2.numerator.hasAdd() || _fraction2.numerator.hasSub()){
						_moving.push({new:true,text:")",location:{expression:_fraction1.numerator,pos:-1}});
					}
				}

				if (_fraction2.denominator.list.length>0 && _fraction1.denominator.list.length>0){
					_moving.push({new:true,text:"*",location:{expression:_fraction1.denominator,pos:-1}});
					if (OPTIONS.allowMergeMakeBrackets==true){
						if (_fraction2.denominator.hasAdd() || _fraction2.denominator.hasSub()){
							_moving.push({new:true,text:"(",location:{expression:_fraction1.denominator,pos:-1}});
						}
					}
				}
				for (var i=0;i<_fraction2.denominator.list.length;i+=1){
					_moving.push({object:_fraction2.denominator.list[i],location:{expression:_fraction1.denominator,pos:-1}});
				};
				if (OPTIONS.allowMergeMakeBrackets==true && _fraction1.denominator.list.length>0){
					if (_fraction2.denominator.hasAdd() || _fraction2.denominator.hasSub()){
						_moving.push({new:true,text:")",location:{expression:_fraction1.denominator,pos:-1}});
					}
				}
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
				//multiplication before addition/subtraction
				
				if (_fraction2.location.pos<_root.list.length-1){
					if (_root.list[_fraction2.location.pos+1].toText()=="*"){
						return {type:"error",text:ERROR.MULTIPLICATION_FIRST};
					}
				}

				if (_fraction1.location.pos>0 && _root.list[_fraction1.location.pos-1].toText()=="*"){
					return {type:"error",text:ERROR.MULTIPLICATION_FIRST};
				}
				if (OPTIONS.forceMultFirstOrderOp && (_root.hasMult() || _root.hasDiv())) return {type:"soft",text:ERROR.MULTIPLICATION_FIRST};

				if (_fraction1.location.pos>0 && (OPTIONS.forceLeftToRight==true ||
					(OPTIONS.forceLeftToRight=="mixed" && (_root.hasSub() || _root.hasMult())))){
					return {type:"soft",text:ERROR.LEFT_TO_RIGHT};
				}

				

				
				if (_fraction1.denominator.equivalentTo(_fraction2.denominator)){
					var _moving=[];
					var _removing=[];
					var _changing=[];
					let _addBracketsNumerator=false;
					
					let _sign0="+";
					if (_fraction1.location.pos>0 && _fraction1.location.expression.list[_fraction1.location.pos-1].toText()=="-"){
						//Subtraction after Addition
						if (!OPTIONS.allowSubAddFractions) return {type:"soft",text:ERROR.SUBTRACT_FIRST};
						_sign0="-";
					}

					if (_sign.toText()=="-" && _fraction2.numerator.list.length>1){
						 if (OPTIONS.allowSubFractionMultipleNumerators==false) return {type:"error",text:"Simplify your Numerator"};
						 if (OPTIONS.allowSubFractionMultipleNumerators=="brackets") _addBracketsNumerator=true;
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
					if (_addBracketsNumerator){
						_moving.push({new:true,text:"(",location:{expression:_fraction1.numerator,pos:-1}});
					}
					for (var i=0;i<_fraction2.numerator.list.length;i+=1){
						_moving.push({object:_fraction2.numerator.list[i],location:{expression:_fraction1.numerator,pos:-1}});
						if (!_addBracketsNumerator && _fraction2.numerator.list[i].type=="sign" && _sign.toText()!=_sign0){
							if (_fraction2.numerator.list[i].toText()=="-"){
								_changing.push({object:_fraction2.numerator.list[i],text:"+"});
							}else if (_fraction2.numerator.list[i].toText()=="+"){
								_changing.push({object:_fraction2.numerator.list[i],text:"-"});
							}
						}
					}
					if (_addBracketsNumerator){
						_moving.push({new:true,text:")",location:{expression:_fraction1.numerator,pos:-1}});
					}
					return {type:"success",moving:_moving,removing:_removing,changing:_changing};
				}else{
					return {type:"error",text:ERROR.SAME_DENOMINATOR};
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
			if (this.list[i].type=="fraction"){
				this.list[i].numerator.tryRemoveBrackets();
				this.list[i].denominator.tryRemoveBrackets();
			}else if (this.list[i].type=="expression"){
				this.list[i].tryRemoveBrackets();
			}
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
			m=Math.floor(m);
			return this.list[m];
			/*m=Math.round(m*2)/2;
			if (m==Math.floor(m)){
				return m;
				//return this.list[m];
			}else{
				//return Math.floor(m);
				return this.list[Math.floor(m)];
			}*/
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
		if (_result.type=="error" || _result.type=="soft" || (OPTIONS.showHardErrors && _result.type=="hard")) return Validation.WARN;
		if (_result.type=="success" || _result.type=="prompt") return Validation.YES;
		return Validation.NO;
	}

	m.hasMult=function(_scope){
		_scope=_scope || {start:0,end:this.list.length};
		let _numBrackets=0;
		for (var i=_scope.start;i<_scope.end;i+=1){
			if (this.list[i].toText()=="(") _numBrackets+=1;
			if (this.list[i].toText()==")") _numBrackets-=1;
			if (_numBrackets==0 && this.list[i].toText()=="*") return true;
		}
		return false;
	}
	m.hasDiv=function(_scope){
		_scope=_scope || {start:0,end:this.list.length};
		let _numBrackets=0;
		for (var i=_scope.start;i<_scope.end;i+=1){
			if (this.list[i].toText()=="(") _numBrackets+=1;
			if (this.list[i].toText()==")") _numBrackets-=1;
			if (_numBrackets==0 && this.list[i].toText()==":") return true;
		}
		return false;
	}
	m.hasAdd=function(_scope){
		_scope=_scope || {start:0,end:this.list.length};
		let _numBrackets=0;
		for (var i=_scope.start;i<_scope.end;i+=1){
			if (this.list[i].toText()=="(") _numBrackets+=1;
			if (this.list[i].toText()==")") _numBrackets-=1;
			if (_numBrackets==0 && this.list[i].toText()=="+") return true;
		}
		return false;
	}
	m.hasSub=function(_scope){
		_scope=_scope || {start:0,end:this.list.length};
		let _numBrackets=0;
		for (var i=_scope.start;i<_scope.end;i+=1){
			if (this.list[i].toText()=="(") _numBrackets+=1;
			if (this.list[i].toText()==")") _numBrackets-=1;
			if (_numBrackets==0 && this.list[i].toText()=="-") return true;
		}
		return false;
	}

	m.sameBrackets=function(_obj1,_obj2){
		if (_obj1.location.expression!=this || _obj2.location.expression!=this) return false;
		let _numOpen=0;
		let _num1=null;
		let _num2=null;

		for (var i=0;i<this.list.length;i+=1){
			if (this.list[i].type=="bracket"){
				if (this.list[i].toText()=="(") _numOpen+=1;
				else if (this.list[i].toText()==")") _numOpen-=1;
			}
			if (i==_obj1.location.pos) _num1=_numOpen;
			if (i==_obj2.location.pos) _num2=_numOpen;
			if (_num1!=null && _num2!=null){
				if (_num1==_num2) return true;
				return false;
			}
			if (_num1!=null && _numOpen<_num1) return false;
			if (_num2!=null && _numOpen<_num2) return false;
		}


		return false;
	}
	m.getBracketScope=function(_obj){
		if (_obj.location.expression!=this) return null;

		return this.getBracketScopeFrom(_obj.location.pos);
	}

	m.getBracketScopeFrom=function(_pos){
		let _numOpen=0;
		let _start=null;
		let _end=null;
		for (var i=_pos;i>=0;i-=1){
			if (this.list[i].type=="bracket"){
				if (this.list[i].toText()=="("){
					if (_numOpen==0) _start=i;
					break;
					_numOpen-=1;
				}
				else if (this.list[i].toText()==")") _numOpen+=1;
			}
		}
		if (_start==null) return {start:0,end:this.list.length};

		_numOpen=0;
		for (i=_pos;i<this.list.length;i+=1){
			if (this.list[i].type=="bracket"){
				if (this.list[i].toText()==")"){
					if (_numOpen==0){
						_end=i;
						break;
					}
					_numOpen-=1;
				}
				else if (this.list[i].toText()=="(") _numOpen+=1;
			}
		}
		return {start:_start+1,end:_end};
	}

	m.tryRemoveBrackets=function(){
		let _numOpen=0;
		let _start=null;
		let _end=null;

		for (var i=0;i<this.list.length;i+=1){
			//unneeded brackets from the INSIDE.  () or (X)
			if (this.list[i].type=="bracket"){
				if (this.list[i].toText()=="("){
					_numOpen+=1;
					_start=i;
				}
				else if (this.list[i].toText()==")"){
					_numOpen-=1;
					_end=i;
					if (_end-_start==1){
						game_removeObject(this.list[_end]);
						game_removeObject(this.list[_start]);
						this.list.splice(_start,2);
						m.tryRemoveBrackets();
						return;
					}else if (_end-_start==2){
						game_removeObject(this.list[_end]);
						//game_removeObject(this.list[_start+1]);
						game_removeObject(this.list[_start]);
						this.list.splice(_end,1);
						this.list.splice(_start,1);
						m.tryRemoveBrackets();
						return;
					}
				}
			}
		}
		this.tryRemoveOutsideBrackets();
	}

	m.tryRemoveOutsideBrackets=function(){
		for (var i=0;i<this.list.length;i+=1){
			if (this.list[i].toText()=="("){
				//if no addition or subtraction in the brackets
				let _scope=this.getBracketScopeFrom(i+1);
				if (!this.hasAdd(_scope) && !this.hasSub(_scope)){
					game_removeObject(this.list[_scope.end]);
					game_removeObject(this.list[_scope.start-1]);
					this.list.splice(_scope.end,1);
					this.list.splice(_scope.start-1,1);
					this.tryRemoveOutsideBrackets();
					return;
				}
				/*if (i>0){
					if (this.list[i-1].toText()=="-" || this.list[i-1].toText()=="+"){
						game_removeObject(this.list[_scope.end]);
						game_removeObject(this.list[_scope.start-1]);
						this.list.splice(_scope.end,1);
						this.list.splice(_scope.start-1,1);
						this.tryRemoveOutsideBrackets();
						return;
					}
				}*/
			}
		}
	}

	m.equivalentTo=function(_expression2){
		let s1=this.toText();
		let s2=_expression2.toText();

		if (eval(s1)!=eval(s2)) return false;
		if (s1==s2) return true;

		main:for (var i=0;i<s1.length;i+=1){
			for (var j=0;j<s2.length;j+=1){
				if (s1.substr(i,1)==s2.substr(j,1)){
					s2=s2.substring(0,j)+s2.substring(j+1,s2.length);
					continue main;
				}
			}
			return false;
		}
		return true;
	}
	m.getCombine=function(_obj1,_obj2){
		//obj 1 should always be here.
		//obj 1 is what you are dropping ON; location = fixed
		if (_obj1==_obj2) return null;
		if (_obj1.type!="number" || _obj2.type!="number"){
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
		if (isNaN(_obj1.toNumber()) || isNaN(_obj2.toNumber())) return {type:"hard",text:"Cannot perform an operation with a variable"};
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
			if (_obj1.inBrackets() || _obj2.inBrackets()){
				return {type:"error",text:ERROR.ORDER_OP};
			}
			if (_fraction.type=="fraction" && _obj2.location.expression.parent==_fraction){
				//same fraction: Numerator and Denominator
				if (_fraction.hasAdd() || _fraction.hasSub() || _fraction.hasDiv()) return {type:"hard",text:ERROR.ORDER_OP}; //numerator to denominator, only works if Multiplication Only.
				return myObj_cancelValues(_obj1,_obj2,this,_obj2.location.expression);
			}else{
				//DIFFERENT FRACTIONS
				let _fraction2=_obj2.location.expression.parent;
				let _master=_fraction.location.expression;

				if ((_fraction.location.pos>0 && _fraction.location.expression.list[_fraction.location.pos-1].toText()==":") ||
					(_fraction2.location.pos>0 && _fraction2.location.expression.list[_fraction2.location.pos-1].toText()==":")){
						return {type:"error",text:ERROR.DIVISION_FIRST};
				}
				if (OPTIONS.forceLeftToRight!=false){
					let _firstMult=null;
					let _root=_fraction.location.expression;
					let _sign=_root.list[Math.min(_fraction.location.pos,_fraction2.location.pos)+1];
					for (var i=0;_firstMult==null;i+=1){
						if (_root.list[i].type=="sign" && _root.list[i].toText()=="*"){
							_firstMult=i;
						}
					}
					if (OPTIONS.forceLeftToRight==true && _sign.location.pos!=_firstMult) return {type:"soft",text:ERROR.LEFT_TO_RIGHT};
					if ((_sign.location.pos!=_firstMult || Math.abs(_fraction.location.pos-_fraction2.location.pos)>2) && OPTIONS.forceLeftToRight=="mixed"){
						if (_root.hasAdd() || _root.hasSub()){
							return {type:"soft",text:ERROR.LEFT_TO_RIGHT};
						}

						if (_root.hasDiv()){
							return {type:"soft",text:ERROR.DIVISION_FIRST};
						}
					}
				}
				let _first=Math.min(_fraction.location.pos,_fraction2.location.pos);
				let _last=Math.max(_fraction.location.pos,_fraction2.location.pos);
				
				for (var i=_first+1;i<_last;i+=1){
					if (_master.list[i].type=="sign" && _master.list[i].toText()==";") return null;
				}
				if (!OPTIONS.moveAcrossFractions){
					
					//must combine fractions first if 'move across fractions' is disabled
					return {type:"error",text:ERROR.COMBINE_FIRST};
				}

				if (this.hasAdd() || this.hasSub() || _obj2.location.expression.hasAdd() || _obj2.location.expression.hasSub()){
					//can't move across if addition or subtraction involved
					return {type:"error",text:ERROR.ORDER_OP};
				}
				if (!OPTIONS.allowCancelOtherExpression){
					if (_fraction.hasAdd() || _fraction2.hasAdd()){
						return {type:"error",text:"Simplify the Sum"};
					}
					if (_fraction.hasSub() ||_fraction2.hasSub()){
						return {type:"error",text:"Simplify the Difference"};
					}
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
					}else{
						if ((_fraction.numerator==_obj1.location.expression)==(_fraction2.numerator==_obj2.location.expression)){
							if (_fraction.numerator==_obj1.location.expression){
								//numerators across an addition, won't join the fractions if this is disabled.
								if (!OPTIONS.numeratorsAcrossAddition) return {type:"soft",text:ERROR.COMBINE_FIRST};
							}else{
								if (!OPTIONS.divisorsAcrossAddition) return {type:"soft",text:ERROR.COMBINE_FIRST};
							}
							return _fraction.mergeWith(_fraction2,_fSign);
						}
						return {type:"soft",text:ERROR.COMBINE_FIRST};
					}
				}else{
					//this should never happen since you can't link distant fractions
					return {type:"error",text:"Currently, only ADJACENTS can combine"};
				}
			}
		}else{
			// both are in this expression
			if (!this.sameBrackets(_obj1,_obj2)){
				//not within the same bracket scope
				return {type:"error",text:ERROR.ORDER_OP};
			}
			let _scope=this.getBracketScope(_obj1);

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
				//division out of order *** no division should exist
				return {type:"error",text:ERROR.ORDER_OP};
			}
			
			let sign1=this.list[index1+1];
			let sign2=this.list[index2-1];
			if (sign1==sign2){
				//ADJACENT -- EASY
				switch(sign1.toText()){
					case "*": //adjacent multiplication
						if (OPTIONS.forceLeftToRight!=false){
							let _firstMult=null;
							for (var i=_scope.start;_firstMult==null;i+=1){
								if (this.list[i].type=="sign" && this.list[i].toText()=="*"){
									_firstMult=i;
								}
							}
							if (OPTIONS.forceLeftToRight==true && sign1.location.pos!=_firstMult) return {type:"soft",text:ERROR.LEFT_TO_RIGHT};
							if (sign1.location.pos!=_firstMult && OPTIONS.forceLeftToRight=="mixed"){
								if (this.hasAdd() || this.hasSub()){
									return {type:"soft",text:ERROR.LEFT_TO_RIGHT};
								}

								if (this.hasDiv()){
									return {type:"soft",text:ERROR.DIVISION_FIRST};
								}
							}
						}
						return {type:"success",changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[sign2,_obj2]};
					case ":": //adjacent division
						return {type:"success",changing:[{object:_obj1,text:String(_obj1.toNumber()/_obj2.toNumber())}],removing:[sign2,_obj2]};
					case "+": case "-":
						//must perform multiplication first
						let value1=_obj1.toNumber();

						if (index2+1<_scope.end){
							if (this.list[index2+1].toText()=="*"){
								return {type:"error",text:ERROR.MULTIPLICATION_FIRST};
							}
						}
						if (index1>_scope.start && this.list[index1-1].toText()=="*"){
							return {type:"error",text:ERROR.MULTIPLICATION_FIRST};
						}

						if (OPTIONS.forceMultFirstOrderOp && (this.hasMult(_scope) || this.hasDiv(_scope))) 
							return {type:"soft",text:ERROR.MULTIPLICATION_FIRST};

						if (index1>_scope.start){
							if (OPTIONS.forceLeftToRight==true || 
								(OPTIONS.forceLeftToRight=="mixed" && (this.hasSub(_scope) || (this.hasAdd(_scope) && (this.hasMult(_scope) || this.hasDiv(_scope)))))){
								return {type:"soft",text:ERROR.LEFT_TO_RIGHT};
							}

							if (this.list[index1-1].toText()=="-"){
								//if left-to-right is disabled and disallowing addition after subtraction
								if (!OPTIONS.allowSubAddInside) return {type:"soft",text:ERROR.SUBTRACT_FIRST};
								value1=-value1;
							}
						}

						let value2=_obj2.toNumber();
						if (this.list[index2-1].toText()=="-"){
							value2=-value2;
						}
						value1+=value2;
						let _changing;
						if (index1>_scope.start){
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
				if (OPTIONS.onlyAdjacentOperations) return {type:"soft",text:"Only Adjacent Numbers."};

				switch (sign1.toText()){
					case "*": case ":":
						let j=sign1.location.pos+1;
						while (j<=sign2.location.pos){
							if (this.list[j].toText()=="+" || this.list[j].toText()=="-"){
								//if there's a + or - in between these values and a * or : is involved
								return {type:"error",text:ERROR.ORDER_OP};
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
						/* ERROR ORDER: 
						1) mult before or after an addition, ERROR
						2) mult is present and must be first, SOFT
						3) must solve left to right, SOFT
						4) can't solve ADD after SUB, SOFT
						*/

						let value1=_obj1.toNumber();

						if (index2+1<_scope.end){
							if (this.list[index2+1].toText()=="*"){
								return {type:"error",text:ERROR.MULTIPLICATION_FIRST};
							}
						}
						if (index1>_scope.start && this.list[index1-1].toText()=="*"){
							return {type:"error",text:ERROR.MULTIPLICATION_FIRST};
						}
						if (sign2.toText()=="*") return {type:"error",text:ERROR.ORDER_OP};
						
						if (OPTIONS.forceMultFirstOrderOp && (this.hasMult(_scope) || this.hasDiv(_scope))) return {type:"soft",text:ERROR.MULTIPLICATION_FIRST};
						
						if (OPTIONS.forceLeftToRight==true || 
							(OPTIONS.forceLeftToRight=="mixed" && (this.hasSub(_scope) || (this.hasAdd(_scope) && this.hasMult(_scope))))){
							return {type:"soft",text:ERROR.LEFT_TO_RIGHT};
						}

						if (index1>_scope.start && this.list[index1-1].toText()=="-"){
							if (!OPTIONS.allowSubAddInside) return {type:"soft",text:ERROR.SUBTRACT_FIRST};
							value1=-value1;
						}

						let value2=_obj2.toNumber();

						if (sign2.toText()=="-") value2=-value2;
						value1+=value2;

						if (!flipped){
							let _signToNeg;
							let _signToPos;
							if (index1>_scope.start){
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
							if (index1==_scope.start){
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
		return {type:"error",text:"This should not happen."};
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

	//if (_obj1.toText()=="1" &&  _num1 && _expression1.list.length==1 && _obj2.toText()!="-1") return {type:"error",text:"Solo One cannot be combined"};
	//if (_obj2.toText()=="1" && !_num1 && _expression2.list.length==1 && _obj1.toText()!="-1") return {type:"error",text:"Solo One cannot be combined"};
	
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
	}else if (OPTIONS.cancelNegatives=="both" && _value2<0 && _value1<0){
		let s;
		if (OPTIONS.commonText=="simplify"){
			s="Simplify By:";
		}else if (OPTIONS.commonText=="factorOf"){
			s="What is a common factor for:\n"+String(_value1)+" and "+String(_value2);
		}
		return {type:"prompt",text:s,
				output:function(i){
					return myObj_finishCancellingBy(_obj1,_obj2,i);
				},
				also:{type:"success",changing:[
					{object:_obj1,text:String(Math.abs(_obj1.toNumber()))},
					{object:_obj2,text:String(Math.abs(_obj2.toNumber()))}
					]}
			};
	}else if (_value1%_value2==0){
		//The second one is a factor of the first one
		if (OPTIONS.combineFactors=="input"){
			let s;
			if (OPTIONS.commonText=="simplify"){
				s="Simplify By:";
			}else if (OPTIONS.commonText=="factorOf"){
				s="What is a common factor for:\n"+String(_value1)+" and "+String(_value2);
			}
			return {type:"prompt",text:s,
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
			let s;
			if (OPTIONS.commonText=="simplify"){
				s="Simplify By:";
			}else if (OPTIONS.commonText=="factorOf"){
				s="What is a common factor for:\n"+String(_value1)+" and "+String(_value2);
			}
			return {type:"prompt",text:s,
				output:function(i){
					return myObj_finishCancellingBy(_obj1,_obj2,i);
				}
			};
		}else if (OPTIONS.combineFactors==true || (OPTIONS.combineFactors=="-1" && _value1==-1)){
			return myObj_finishCancellingBy(_obj1,_obj2,_value1);
		}else{
			return {type:"error",text:"Try factoring first."};
		}
	}else if (OPTIONS.cancelNegatives==true && _value2<0 && _value1<0){
		return {type:"success",changing:[
		{object:_obj1,text:String(Math.abs(_obj1.toNumber()))},
		{object:_obj2,text:String(Math.abs(_obj2.toNumber()))}
		]};
	}else{
		//Neither of them are factors 
		//Includes the case where they share a factor ***SEPARATE***
		if (OPTIONS.combineCommon!=false){
			if (OPTIONS.combineCommon=="input"){
				let s;
				if (OPTIONS.commonText=="simplify"){
					s="Simplify By:";
				}else if (OPTIONS.commonText=="factorOf"){
					s="What is a common factor for:\n"+String(_value1)+" and "+String(_value2);
				}
				return {type:"prompt",text:s,
					output:function(i){
						return myObj_finishCancellingBy(_obj1,_obj2,i);
					}
				};
			}else if (OPTIONS.combineCommon==true){

			}
		}
		if (OPTIONS.combineNot=="input"){
			let s;
			if (OPTIONS.commonText=="simplify"){
				s="Simplify By:";
			}else if (OPTIONS.commonText=="factorOf"){
				s="What is a common factor for:\n"+String(_value1)+" and "+String(_value2);
			}
			return {type:"prompt",text:s,
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
	if (OPTIONS.factorList=="dropdown"){
		m.back.beginFill(CONFIG.colors.FACTOR);
		m.back.lineStyle(2,0);
		m.back.drawRoundedRect(-CONFIG.margins.tileSize/2,-10,CONFIG.margins.tileSize,20,2);
		m.text=new PIXI.Text(s,{fill:CONFIG.colors.SIGN_TEXT,fontSize:10});
		m.text.x=-m.text.width/2;
		m.text.y=-5;
		m.addChild(m.text);
	}else if (OPTIONS.factorList=="bubbles"){
		m.back.beginFill(CONFIG.colors.FACTOR);
		m.back.lineStyle(2,0);
		m.back.drawRoundedRect(-25,-25,50,50,20);
		m.text=new PIXI.Text(s,{fill:CONFIG.colors.SIGN_TEXT,fontSize:14});
		m.text.x=-m.text.width/2;
		m.text.y=-m.text.height/2;
		m.addChild(m.text);
	}
	
	m.value=v;
	m.type="factor";

	m.setTweenTarget=function(_index,_total,_up){
		if (OPTIONS.factorList=="dropdown"){
			if (_index==-1)_index=Math.ceil(_total);
			this.tweenTo(this.goal.x,this.goal.y+(40+_index*20)*(_up?-1:1));
		}else if (OPTIONS.factorList=="bubbles"){
			_total=Math.ceil(_total);
			if (_index==-1){
				//off to the side
				let _x=Math.ceil(_total/2+1)*35;
				let _y=60;
				this.tweenTo(this.goal.x+_x,this.goal.y+_y*(_up?-1:1));
			}else{
				let numRow1=Math.ceil(_total/2);
				let numRow2=Math.floor(_total/2);
				let _x;
				let _y;
				if (_index<numRow1){
					_x=-(numRow1-1)*35+70*_index;
					_y=60;
				}else{
					_x=-(numRow2-1)*35+70*(_index-numRow1);
					_y=115;
				}
				this.tweenTo(this.goal.x+_x,this.goal.y+_y*(_up?-1:1));
			}
		}
	}

	return m;
}

function myObj_makeBracket(s){
	if (s!="(" && s!=")") return null;

	let m=myObj_makeBasic();
	m.back.beginFill(CONFIG.colors.SIGN);
	m.back.lineStyle(2,0);
	//m.back.drawRoundedRect(-10,-25,20,50,5);
	m.makeText(s,{fill:CONFIG.colors.SIGN_TEXT,fontSize:46});
	m.text.y=-28;

	m.type="bracket";

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

	m.factorsOpen=false;

	m.setText=function(s){
		if (Number(s)<0) s="("+s+")"
		this.text.text=s;
		this.text.x=-this.text.width/2;
	}

	m.toText=function(){
		if (this.text.text.substring(0,1)=="("){
			let _text=this.text.text.substring(1,this.text.text.length-1)
			return _text;
		}
		return this.text.text;
	}

	m.setText(s);

	m.tweenTo=function(x,y){
		this.goal.x=x;
		this.goal.y=y;

		if (this.factorsOpen){
			game_repositionFactorsOf(this);
		}
	}

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

	m.inBrackets=function(){
		let _numOpen=0;
		for (var i=0;i<this.location.pos;i+=1){
			if (this.location.expression.list[i].type=="bracket"){
				if (this.location.expression.list[i].toText()=="(") _numOpen+=1;
				else if (this.location.expression.list[i].toText()==")") _numOpen-=1;
			}
		}
		if (_numOpen>0) return true;
		return false;
	}

	m.select(false);

	return m;
}

function myObj_makeLine(){
	let m=myObj_makeBasic();
	m.interactive=false;
	m.master=null;
	m.type="line";
	m.bracketMode=false;

	m.resize=function(width){
		this.back.clear();
		if (width>0){
			m.bracketMode=false;
			/*this.back.beginFill(CONFIG.colors.BOX);
			this.back.lineStyle(1,CONFIG.colors.BOX_BORDER);
			this.back.drawRoundedRect(-width/2-5,-2-5,width+10,4+10,5);*/
			this.back.lineStyle(0);
			this.back.beginFill(0);
			this.back.drawRoundedRect(-width/2,-2,width,4,3);
		}
	}
	m.resize(100);

	m.makeBrackets=function(width){
		m.bracketMode=true;
		/*this.back.clear();
		this.back.beginFill(CONFIG.colors.BOX);
		this.back.lineStyle(1,CONFIG.colors.BOX_BORDER);
		this.back.drawRoundedRect(-width/2-10,-CONFIG.margins.tileSize/2,15,CONFIG.margins.tileSize,3);
		this.back.drawRoundedRect(width/2-5,-CONFIG.margins.tileSize/2,15,CONFIG.margins.tileSize,3);
		this.back.endFill();*/

		this.back.lineStyle(3,0);
		this.back.moveTo(-width/2,-CONFIG.margins.tileSize/2.5);
		this.back.quadraticCurveTo(-width/2-7,0,-width/2,CONFIG.margins.tileSize/2.5);
		this.back.moveTo(width/2,-CONFIG.margins.tileSize/2.5);
		this.back.quadraticCurveTo(width/2+7,0,width/2,CONFIG.margins.tileSize/2.5);

	}

	m.getDistance=function(x,y){
		if (this.bracketMode) return 10000;
		if (x>this.x-this.back.width/2 && x<this.x+this.back.width/2 && y>this.y-this.back.height/2 && y<this.y+this.back.height/2){
			return 0;
		}else{
			return 10000;
		}
	}

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

	m.errorFlash=function(_color){
		if (_color==null) _color=0xff0000;
		JMBL.tweenTo(this.back,7,{tint:_color},function(){
			JMBL.tweenWait(m.back,20,function(){
			JMBL.tweenTo(m.back,7,{tint:0xffffff});
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
	if (interactionMode=="mobile"){
		input_makeVirtualKeyboard()
	}
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
	if (OPTIONS.factorsWhileDraging=="noclose" && _obj.type=="number" && _obj.factorsOpen==true){
		m.x+=130;
	}
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
		if (x>this.x && x<this.x+200 && y>this.y && y<this.y+100) return true;
		return false;
	}

	m.dispose=function(b=true){
		if (interactionMode=="mobile"){
			input_removeVirtualKeyboard();
		}
		m.carat=null;
		if (b && this.output!=null){
			if (m.input.text==" -") m.input.text="-1";
			this.output(m.input.text);
		}
		this.destroy();
		if (myObj_currentInput==this) myObj_currentInput=null;
	}

	m.okButton=button_constructBasic({label:"OK",labelStyle:{fill:0xffffff,fontSize:10},bgColor:CONFIG.colors.CONFIRM,width:30,height:15,output:function(){m.dispose()}});
	m.okButton.x=105;
	m.okButton.y=73;
	m.addChild(m.okButton);
	m.cancelButton=button_constructBasic({label:"CANCEL",labelStyle:{fill:0xffffff,fontSize:10},bgColor:CONFIG.colors.CANCEL,width:50,height:15,output:function(){m.input.text=""; m.dispose()}});
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