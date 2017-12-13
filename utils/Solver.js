const Validation={
	NO:0,
	ERROR:1,
	SOFT:2,
	SUCCESS:3,
	HARD:4,
	PROMPT:5,
}

function Solver(_root){
	root=_root;
	solver=this;

	this.addRoot=function(_root){
		root=_root;
	}

	this.testEquivalentExpressions=function(s1,s2){
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

	this.getDivisors=function(n){
		if (n==0) return [];
		let _neg=1;
		if (n<0){
			n=Math.abs(n);
			_neg=-1;
		}
		if (n==0) return [0];
		let m=[];
		for (var i=0;i<=n;i+=1){
			/*let div=n/i;
			if (Math.floor(div)==div){
				m.push(div);
			}*/
			if (n%i == 0){
				m.push(i*_neg);
			}
		}
		return m;
	}

	this.cancelValues=function(_obj1,_obj2){
		//Cancelling Numerator and Denominator.  Either obj1 or obj2 can be numerator.
		//Includes same and different fraction.
		//Only takes place if purely MULTIPLICATION is involved.
		//obj1 should always still exist, if possible (what is landed on)
		let _value1=_obj1.toNumber();
		let _value2=_obj2.toNumber();
		let _expression1=_obj1.location.expression;
		let _expression2=_obj2.location.expression;
		let _sign1=solver.getSignFor(_obj1);
		let _sign2=solver.getSignFor(_obj2);
		let _num1=false;
		if (_obj1.location.expression.factorsUp) _num1=true;

		if (_value1==_value2){
			//Identical Values cancel out
			if ((_num1?_expression1:_expression2).list.length==1){
				return {type:Validation.SUCCESS,changing:[{object:(_num1?_obj1:_obj2),text:"1"}],removing:[(_num1?_sign2:_sign1),(_num1?_obj2:_obj1)]};
			}else{
				return {type:Validation.SUCCESS,removing:[_obj1,_obj2,_sign1,_sign2]};
			}
		}else if (OPTIONS.cancelNegatives=="both" && _value2<0 && _value1<0){
			return {type:Validation.PROMPT,text:CONFIG.text.SIMPLIFY,
					obj:_obj1,
					obj2:_obj2,
					output:function(i){
						return solver.finishCancellingBy(_obj1,_obj2,i);
					},
					also:{type:Validation.SUCCESS,changing:[
						{object:_obj1,text:String(Math.abs(_obj1.toNumber()))},
						{object:_obj2,text:String(Math.abs(_obj2.toNumber()))}
						]}
				};
		}else if (Math.max(_value1,_value2)%Math.min(_value1,_value2)==0){
			//The second one is a factor of the first one
			if (OPTIONS.combineFactors=="input"){
				return {type:Validation.PROMPT,text:CONFIG.text.SIMPLIFY,
					obj:_obj1,
					obj2:_obj2,
					output:function(i){
						return solver.finishCancellingBy(_obj1,_obj2,i);
					}
				};
			}else if (OPTIONS.combineFactors==true || (OPTIONS.combineFactors=="-1" && Math.min(_value1,_value2)==-1)){
				return solver.finishCancellingBy(_obj1,_obj2,Math.max(_value1,_value2));
			}else{
				return {type:Validation.ERROR,text:ERROR.FACTOR_FIRST};
			}
		}else if (OPTIONS.cancelNegatives==true && _value2<0 && _value1<0){
			return {type:Validation.SUCCESS,changing:[
			{object:_obj1,text:String(Math.abs(_obj1.toNumber()))},
			{object:_obj2,text:String(Math.abs(_obj2.toNumber()))}
			]};
		}else{
			//Neither of them are factors 
			//Includes the case where they share a factor ***SEPARATE***
			if (OPTIONS.combineCommon!=false){
				if (OPTIONS.combineCommon=="input"){
					return {type:Validation.PROMPT,text:CONFIG.text.SIMPLIFY,
						obj:_obj1,
						obj2:_obj2,
						output:function(i){
							return solver.finishCancellingBy(_obj1,_obj2,i);
						}
					};
				}else if (OPTIONS.combineCommon==true){

				}
			}
			if (OPTIONS.combineNot=="input"){
				return {type:Validation.PROMPT,text:CONFIG.text.SIMPLIFY,
					obj:_obj1,
					obj2:_obj2,
					output:function(i){
						return solver.finishCancellingBy(_obj1,_obj2,i);
					}
				};
			}
			return {type:Validation.ERROR,text:ERROR.CANNOT_CANCEL};
		}
		return {type:Validation.ERROR,text:ERROR.ERROR};
	};

	this.getSignFor=function(_obj,_dir){
		//dir can be "before", "after" or "either".  null = either.
		if (_dir!="after" && _obj.location.pos>0){
			return _obj.location.expression.list[_obj.location.pos-1];
		}else if(_dir!="before" && _obj.location.expression.list.length>1){
			return _obj.location.expression.list[_obj.location.pos+1];
		}else{
			return null;
		}
	}

	this.finishCancellingBy=function(_obj1,_obj2,_factor){
		let _value1=_obj1.toNumber();
		let _value2=_obj2.toNumber();
		if (_value1%_factor==0 && _value2%_factor==0){
			_value1/=_factor;
			_value2/=_factor;
			if (_value2==-1 && !_obj2.location.expression.factorsUp){
				_value2=1;
				_value1*=-1;
			}else if (_value1==-1 && !_obj1.location.expression.factorsUp){
				_value1=1;
				_value2*=-1;
			}
			let _removing=[];
			let _changing=[];
			let _sign1=solver.getSignFor(_obj1);
			let _sign2=solver.getSignFor(_obj2);
			
			if (_value1!=1 || (_value1==1 && _obj1.location.expression.factorsUp)){
				//1 on top or not 1, change its value
				_changing.push({object:_obj1,text:String(_value1)});
			}else{
				//1 on bottom, get rid of it
				_removing.push(_obj1);
				if (_sign1!=null) _removing.push(_sign1);
			}
			if (_value2!=1 || (_value2==1 && _obj2.location.expression.factorsUp)){
				//1 on top or not 1, change its value
				_changing.push({object:_obj2,text:String(_value2)});
			}else{
				//1 on bottom, get rid of it
				_removing.push(_obj2);
				if (_sign2!=null) _removing.push(_sign2);
			}
			return {type:Validation.SUCCESS,changing:_changing,removing:_removing};
		}else{
			return {type:Validation.ERROR,flash:[{object:_obj1,type:Validation.ERROR},{object:_obj2,type:Validation.ERROR}]};
			//return {type:Validation.ERROR,text:String(_factor)+" is not a common divisor.",flash:[{object:_obj1,type:Validation.ERROR},{object:_obj2,type:Validation.ERROR}]};
		}
	}

	this.amplifyFraction=function(_fraction,_amp){
		_fraction.select(false);
		if (_amp==null || _amp.length==1) return;

		let _moving=[];
		let _changing=[];
		if (OPTIONS.amplifySolves=="solo" && _fraction.numerator.list.length==1){
			_changing.push({object:_fraction.numerator.list[0],text:String(_fraction.numerator.list[0].toNumber()*_amp)});
		}else{
			if (solver.hasSign(_fraction.numerator,"+") || solver.hasSign(_fraction.numerator,"-")){
				_moving.push({new:true,text:"(",location:{expression:_fraction.numerator,pos:0}});
				_moving.push({new:true,text:")",location:{expression:_fraction.numerator,pos:-1}});
			}
			_moving.push({new:true,text:"*",location:{expression:_fraction.numerator,pos:-1}});
			_moving.push({new:true,text:_amp,location:{expression:_fraction.numerator,pos:-1}});
		}

		if (_fraction.denominator.list.length==0){
			_moving.push({new:true,text:_amp,location:{expression:_fraction.denominator,pos:-1}});
		}else if (OPTIONS.amplifySolves=="solo" && _fraction.denominator.list.length==1){
			_changing.push({object:_fraction.denominator.list[0],text:String(_fraction.denominator.list[0].toNumber()*_amp)});
		}else{
			if (solver.hasSign(_fraction.denominator,"+") || solver.hasSign(_fraction.denominator,"-")){
				_moving.push({new:true,text:"(",location:{expression:_fraction.denominator,pos:0}});
				_moving.push({new:true,text:")",location:{expression:_fraction.denominator,pos:-1}});
			}
			_moving.push({new:true,text:"*",location:{expression:_fraction.denominator,pos:-1}});
			_moving.push({new:true,text:_amp,location:{expression:_fraction.denominator,pos:-1}});
		}
		return {type:Validation.SUCCESS,moving:_moving,changing:_changing}
	}

	this.factorObject=function(_object,_factor){
		let _expression=_object.location.expression;
		
		return {type:Validation.SUCCESS,
			moving:[{new:true,text:"*",location:{expression:_expression,pos:_object.location.pos}},
			{new:true,text:String(_factor),location:{expression:_expression,pos:_object.location.pos}}],
			changing:[{object:_object,text:String(_object.toNumber()/_factor)}]};
	}

	this.hasSign=function(_object,_sign,_scope){
		if (_object.type==ObjectTypes.FRACTION){
			return (solver.hasSign(_object.numerator,_sign) || solver.hasSign(_object.denominator,_sign));
		}else if (_object.type==ObjectTypes.EXPRESSION){
			_scope=_scope || {start:0,end:_object.list.length};
			let _numBrackets=0;
			for (var i=_scope.start;i<_scope.end;i+=1){
				if (_numBrackets==0 && _object.list[i].toText()==_sign) return true;
				if (_object.list[i].toText()=="(") _numBrackets+=1;
				if (_object.list[i].toText()==")") _numBrackets-=1;
			}
			return false;
		}
	}

	this.inBrackets=function(_object){
		let _expression=_object.location.expression;
		let _numOpen=0;
		for (var i=0;i<_object.location.pos;i+=1){
			if (_expression.list[i].type==ObjectTypes.BRACKET){
				if (_expression.list[i].toText()=="(") _numOpen+=1;
				else if (_expression.list[i].toText()==")") _numOpen-=1;
			}
		}
		if (_numOpen>0) return true;
		return false;
	}

	this.sameBrackets=function(_obj1,_obj2){
		let _expression=_obj1.location.expression;
		if (_obj2.location.expression!=_expression) return false;
		let _numOpen=0;
		let _num1=null;
		let _num2=null;

		for (var i=0;i<_expression.list.length;i+=1){
			if (_expression.list[i].type==ObjectTypes.BRACKET){
				if (_expression.list[i].toText()=="(") _numOpen+=1;
				else if (_expression.list[i].toText()==")") _numOpen-=1;
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

	this.getBracketScope=function(_expression,_obj){
		if (_obj.location.expression!=_expression) return null;

		return solver.getBracketScopeFrom(_expression,_obj.location.pos);
	}

	this.getBracketScopeFrom=function(_expression,_pos){
		let _numOpen=0;
		let _start=null;
		let _end=null;
		for (var i=_pos;i>=0;i-=1){
			if (_expression.list[i].type==ObjectTypes.BRACKET){
				if (_expression.list[i].toText()=="("){
					if (_numOpen==0) _start=i;
					break;
					_numOpen-=1;
				}
				else if (_expression.list[i].toText()==")") _numOpen+=1;
			}
		}
		if (_start==null) return {start:0,end:_expression.list.length};

		_numOpen=0;
		for (i=_pos+1;i<_expression.list.length;i+=1){
			if (_expression.list[i].type==ObjectTypes.BRACKET){
				if (_expression.list[i].toText()==")"){
					if (_numOpen==0){
						_end=i;
						break;
					}
					_numOpen-=1;
				}
				else if (_expression.list[i].toText()=="(") _numOpen+=1;
			}
		}
		return {start:_start+1,end:_end};
	}

	this.removeAndReturnAllBrackets=function(){
		let _remove=[];

		for (var i=0;i<root.list.length;i+=1){
			if (root.list[i].type==ObjectTypes.FRACTION){
				_remove=_remove.concat(solver.removeAndReturnBrackets(root.list[i].numerator));
				_remove=_remove.concat(solver.removeAndReturnBrackets(root.list[i].denominator));
				if (root.list[i].numerator.list.length>1 && root.list[i].numerator.list[0].toText()!="(" && root.list[i].denominator.list.length==0){
					let _block=game_addNewBlock("(");
					root.list[i].numerator.addObject(_block,0);
					_block=game_addNewBlock(")");
					root.list[i].numerator.addObject(_block);

				}
			}else if (root.list[i].type==ObjectTypes.EXPRESSION){
				_remove=_remove.concat(solver.removeAndReturnBrackets(root.list[i]));
			}
		}
		return _remove;
	}

	this.removeAndReturnBrackets=function(_expression){
		let _numOpen=0;
		let _start=null;
		let _end=null;

		for (var i=0;i<_expression.list.length;i+=1){
			//unneeded brackets from the INSIDE:  () or (X) or (A+B)
			//unneeded from the OUTSIDE: +(???)+
			if (_expression.list[i].type==ObjectTypes.BRACKET){
				if (_expression.list[i].toText()=="("){
					let _scope=solver.getBracketScopeFrom(_expression,i);

					if ((_scope.start-1==0 && _scope.end-1==_expression.list.length && _expression.parent.type==ObjectTypes.FRACTION && _expression.parent.denominator.list.length>0) || 
						(!solver.hasSign(_expression,"+",_scope) && !solver.hasSign(_expression,"-",_scope)) || 
						((_scope.start<2 || _expression.list[_scope.start-2].toText()=="+") && (_scope.end>=_expression.list.length-2 || _expression.list[_scope.end+1].toText()!="*")) ||
						(_scope.end-_scope.start<=1)){
						let m=[_expression.list[_scope.end],_expression.list[_scope.start-1]]
						_expression.list.splice(_scope.end,1);
						_expression.list.splice(_scope.start-1,1);
						return m.concat(solver.removeAndReturnBrackets(_expression));
					}
				}
			}
		}
		return [];
	}

	this.correctsToFlash=function(_expression,a){
		let m=[];
		for (i=0;i<a.length;i+=1){
			m.push({object:_expression.list[a[i]],type:Validation.SUCCESS});
		}
		return m;
	}

	this.getCorrectFlashes=function(_expression,_scope){
		let a=solver.getCorrectOperations(_expression,_scope);
		return solver.correctsToFlash(_expression,a);
	}

	this.getCorrectOperations=function(_expression,_scope){
		_scope=_scope || {start:0,end:_expression.list.length};
		let _fromScopes=[];
		let _mults=[];
		let _divs=[];
		let _adds=[];
		let _subs=[];
		let _nextScope={start:-1,end:-1};
		let _cScope=0;
		let _hasMult=false;
		for (var i=_scope.start+1;i<_scope.end;i+=1){
			if (_cScope==0 && _expression.list[i].type==ObjectTypes.SIGN){
				if (!_hasMult && (_expression.list[i].toText()=="*" || _expression.list[i].toText()==":")){
					_hasMult=true;
				}
				if ((i==0 || _expression.list[i-1].type!=ObjectTypes.BRACKET) && 
					(i>=_expression.list.length-1 || _expression.list[i+1].type!=ObjectTypes.BRACKET)){
					switch(_expression.list[i].toText()){
						case "+": _adds.push(i); break;
						case "-": _subs.push(i); break;
						case "*": _mults.push(i); break;
						case ":": _divs.push(i); break;
					}
				}
			}else if (_expression.list[i].type==ObjectTypes.BRACKET){
				if (_expression.list[i].toText()=="("){
					//let _scope=solver.getBrack
					if (_cScope==0) _fromScopes=_fromScopes.concat(solver.getCorrectOperations(_expression,solver.getBracketScopeFrom(_expression,i)));
					_cScope+=1;
				}else{
					_cScope-=1;
				}
			}
		}
		if (_fromScopes.length>0) return _fromScopes;
		if (!_hasMult){
			//only addition and subtraction
			if (_subs.length==0){
				//only addition
				return _adds.concat(_fromScopes);
			}else{
				//subtraction involved
				return [Math.min(_adds[0]||Infinity,_subs[0]||Infinity)].concat(_fromScopes);
			}
		}else{
			if (_divs.length==0 && _adds.length==0 && _subs.length==0){
				return _mults.concat(_fromScopes);
			}

			let m=_divs;

			let _first;
			if (_mults.length>0 && _mults[0]<(_divs[0]||Infinity)){
				m.push(_mults[0]);
			}
			return m.concat(_fromScopes);
		}
	}

	this.canCombineObjects=function(_obj1,_obj2){
		/*if ((_obj1.type!=ObjectTypes.NUMBER && _obj1.type!=ObjectTypes.FRACTION) || (_obj2.type!=ObjectTypes.NUMBER && _obj2.type!=ObjectTypes.FRACTION)){
			//wrong types combining
			return null;
		}*/
		//different expressions
		if (_obj1.location.expression!=_obj2.location.expression) return null;

		if (_obj1.location.pos>_obj2.location.pos){
			let _obj3=_obj2;
			_obj2=_obj1;
			_obj1=_obj3;
		}
		let _expression=_obj1.location.expression;


		//if (_obj2.location.pos<_scope.start || _obj2.location.pos>_scope.end){
		if (!solver.sameBrackets(_obj1,_obj2)){
			//different bracket scope
			return {type:Validation.ERROR,text:ERROR.ORDER_OP};
		}

		let _scope=solver.getBracketScope(_expression,_obj1);
		let hasMult=false;
		let hasDiv=false;
		let hasAdd=false;
		let hasSub=false;
		let hasBrackets=false;
		let midMult=false;
		let midDiv=false;
		let midAdd=false;
		let midSub=false;
		let midBrackets=false;
		let prev=null;
		let next=null;
		let firstPos=_obj1.location.pos+1;
		let lastPos=_obj2.location.pos-1;
		let first=_expression.list[firstPos].toText();
		let last=_expression.list[lastPos].toText();
		let adjacent=(_obj2.location.pos-_obj1.location.pos==2);
		let firstMult=null;
		let firstAdd=null;
		let _numBrackets=0;
		for (var i=_scope.start;i<_scope.end;i+=1){
			if (_expression.list[i].type==ObjectTypes.SIGN){
				if (_numBrackets==0){
					switch(_expression.list[i].toText()){
						case "*": 
							hasMult=true; 
							if (firstMult==null) firstMult=i;
							break;
						case ":": 
							hasDiv=true; break;
							if (firstMult==null) firstMult=i;
							break;
						case "+": 
							hasAdd=true;
							if (firstAdd==null) firstAdd=i;
							break;
						case "-": hasSub=true;
							hasAdd=true;
							if (firstAdd==null) firstAdd=i;
							break;
					}
				}
			}
			if (_expression.list[i].type==ObjectTypes.BRACKET){
				hasBrackets=true;
				if (_expression.list[i].toText()=="("){
					_numBrackets+=1;
				}
				if (_expression.list[i].toText()==")"){
					 _numBrackets-=1;
				}
			}
		}

		_numBrackets=0;
		for (var i=_obj1.location.pos+1;i<_obj2.location.pos;i+=1){
			if (_numBrackets==0 && _expression.list[i].type==ObjectTypes.SIGN){
				switch(_expression.list[i].toText()){
					case "*": midMult=true; break;
					case ":": midDiv=true; break;
					case "+": midAdd=true; break;
					case "-": midSub=true; break;
				}
			}
			if (_expression.list[i].type==ObjectTypes.BRACKET){
				midBrackets=true;
				if (_expression.list[i].toText()=="("){
					_numBrackets+=1;
				}
				if (_expression.list[i].toText()==")"){
					 _numBrackets-=1;
				}
			}
		}

		if (_obj1.location.pos-1>=_scope.start){
			if (_expression.list[_obj1.location.pos].type==ObjectTypes.BRACKET){
				prev=")";
			}else if (_obj1.location.pos-1>=_scope.start && _expression.list[_obj1.location.pos-1].type==ObjectTypes.SIGN){
				prev=_expression.list[_obj1.location.pos-1].toText();
			}
		}
		if (_obj2.location.pos+1<_scope.end){
			if (_expression.list[_obj2.location.pos].type==ObjectTypes.BRACKET){
				next="(";
			}else if (_obj2.location.pos+1<_scope.end && _expression.list[_obj2.location.pos+1].type==ObjectTypes.SIGN){
				next=_expression.list[_obj2.location.pos+1].toText();
			}
		}
		/*
		hasMult, hasDiv, hasAdd, hasSub, hasBracket
		midMult, midDiv, midAdd, midSub, midBracket
		prev, next
		firstPos, lastPos
		first, last
		adjacent
		firstMult, firstAdd
		*/

		let _result=null;
		if (adjacent){
			switch (first){
				case ":": _result={type:Validation.SUCCESS}; break;

				case "*":
					if (hasAdd || hasSub || hasDiv){
						//console.log(prev);
						if (prev==":"){
							_result={type:Validation.ERROR};
						}else{
							if (firstPos==firstMult){
								_result={type:Validation.SUCCESS};
							}else{
								_result={type:Validation.SOFT,text:ERROR.LEFT_TO_RIGHT};
							}
						}
					}else{
						_result={type:Validation.SUCCESS};
					}
					break;
				case "+": case "-":
					if (hasMult || hasDiv || hasSub){
						if ((prev==null || prev=="+") && (next==null || next=="+" || next=="-")){
							if (hasMult || hasDiv){
								_result={type:Validation.SOFT,text:hasMult?ERROR.MULTIPLICATION_FIRST:ERROR.DIVISION_FIRST};
							}else{
								if (firstPos==firstAdd){
									_result={type:Validation.SUCCESS}
								}else{
									_result={type:Validation.SOFT,text:ERROR.LEFT_TO_RIGHT};
								}
							}
						}else{
							_result={type:Validation.ERROR};
						}
					}else{
						_result={type:Validation.SUCCESS};
					}
					break;
			}
		}else{
			//NON-ADJACENT
			switch(first){
				case "*":
					if (!(hasDiv || hasAdd || hasSub)){
						_result={type:Validation.SUCCESS};
						break;
					}
				case ":":
					if (prev==":") _result={type:Validation.ERROR};
					else if (midAdd || midSub || last==":") _result={type:Validation.ERROR};
					else _result={type:Validation.SOFT,text:ERROR.LEFT_TO_RIGHT};
					break;
				case "+":
					if (!(hasDiv || hasMult || hasSub)){
						_result={type:Validation.SUCCESS};
						break;
					}
				case "-":
					if ((prev==null || prev=="+") && (next==null || next=="+" || next=="-")){
						if (midDiv || midMult || last=="-") _result={type:Validation.ERROR}
						_result={type:Validation.SOFT,text:hasMult?ERROR.MULTIPLICATION_FIRST:hasDiv?ERROR.DIVISION_FIRST:ERROR.LEFT_TO_RIGHT};
					}else{
						_result={type:Validation.ERROR};
					}
					break;

			}
		}
		if (hasBrackets && (_result.type==Validation.SUCCESS || _result.type==Validation.SOFT)) return {type:Validation.SOFT,text:ERROR.BRACKET_FIRST};
		return _result;
	}

	this.canCombine=function(_obj1,_obj2){
		let _result=solver.dragCombine(_obj1,_obj2);
		if (_result==null || _result.type==Validation.NO) return Validation.NO;
		if (_result.type==Validation.SOFT) return Validation.SOFT;
		if (_result.type==Validation.ERROR || _result.type==Validation.SOFT || _result.type==Validation.HARD) return Validation.ERROR;
		if (_result.type==Validation.SUCCESS || _result.type==Validation.PROMPT) return Validation.SUCCESS;
		return Validation.NO;
	}

	this.dragCombine=function(_obj1,_obj2){
		//obj 1 is what you are dropping ON; location = fixed
		if (_obj1==_obj2) return null;
		
		if (_obj1.type!=ObjectTypes.NUMBER || _obj2.type!=ObjectTypes.NUMBER) return null;
		if (isNaN(_obj1.toNumber()) || isNaN(_obj2.toNumber())) return {type:Validation.HARD,text:"Cannot perform an operation with a variable"};

		let _expression=_obj1.location.expression;
		let _expression2=_obj2.location.expression;

		if (_expression==_expression2){
			// both are in this expression
			let _canCombine=solver.canCombineObjects(_obj1,_obj2);
			
			if (_canCombine==null) return null;

			if (_canCombine.type==Validation.ERROR){
				let _flash=solver.getCorrectFlashes(_expression);
				_flash.push({object:_obj1,type:Validation.HARD});
				_flash.push({object:_obj2,type:Validation.HARD});
				return {type:Validation.ERROR,flash:_flash};
			}else if (_canCombine.type==Validation.SOFT){
				let _flash=solver.getCorrectFlashes(_expression);
				_flash.push({object:_obj1,type:Validation.HARD});
				_flash.push({object:_obj2,type:Validation.HARD});
				return {type:Validation.SOFT,flash:_flash,text:_canCombine.text};
			}

			let _sign;

			if (_obj1.location.pos>_obj2.location.pos){
				_sign=_expression.list[_obj2.location.pos+1];
			}else{
				_sign=_expression.list[_obj2.location.pos-1];
			}
			
			switch (_sign.toText()){
				case "*":
					return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[_sign,_obj2]};
				case ":": //Should never happen
					return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()/_obj2.toNumber())}],removing:[_sign,_obj2]};
				case "-":
					return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()-_obj2.toNumber())}],removing:[_sign,_obj2]};
				case "+":
					return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()+_obj2.toNumber())}],removing:[_sign,_obj2]};
			}
		}else{
			// different expressions

			/*if (solver.inBrackets(_obj1) || solver.inBrackets(_obj2)){
				return {type:Validation.ERROR,flash:[{object:_obj1,type:Validation.HARD},{object:_obj2,type:Validation.HARD}]};
			}*/
			let _fraction=_expression.parent;
			let _fraction2=_expression2.parent;
			let _first=Math.min(_fraction.location.pos,_fraction2.location.pos);
			let _last=Math.max(_fraction.location.pos,_fraction2.location.pos);

			if (_fraction!=_fraction2){
				//DIFFERENT FRACTIONS
				for (var i=_first+1;i<_last;i+=1){
					//Going past semicolon doesn't attach
					if (root.list[i].type==ObjectTypes.SIGN && root.list[i].toText()==";") return null;
				}
				_result=solver.canCombineObjects(_fraction,_fraction2)
				if (_result.type==Validation.ERROR){
					//Can't combine the objects >> flash the correct operands in the main equation
					let _flash=solver.getCorrectFlashes(root);
					return {type:Validation.ERROR,flash:_flash.concat([{object:_obj1,type:Validation.HARD},{object:_obj2,type:Validation.HARD}])};
				}else if (_result.type==Validation.SOFT){
					let _flash=solver.getCorrectFlashes(root);
					return {type:Validation.SOFT,text:_result.text,flash:_flash.concat([{object:_obj1,type:Validation.HARD},{object:_obj2,type:Validation.HARD}])};

					/*let _flash=solver.getCorrectFlashes(_expression);
					_flash.push({object:_obj1,type:Validation.HARD});
					_flash.push({object:_obj2,type:Validation.HARD});
					return {type:Validation.SOFT,flash:_flash,text:_canCombine.text};*/
				}

				if (_last-_first==2){
					//adjacent non-* fractions
					if (root.list[_first+1].toText()==":"){
						return {type:Validation.ERROR,flash:[{object:root.list[_first+1],type:Validation.SUCCESS},{object:_obj1,type:Validation.HARD},{object:_obj2,type:Validation.HARD}]};
					}else if (root.list[_first+1].toText()!="*"){
						if (solver.testEquivalentExpressions(_fraction.denominator.toText(),_fraction2.denominator.toText())){
							return {type:Validation.SOFT,flash:[{object:root.list[_first+1],type:Validation.SUCCESS},{object:_obj1,type:Validation.ERROR},{object:_obj2,type:Validation.ERROR}]};
						}else{
							let _flash=[];
							for (var i=0;i<_fraction.denominator.list.length;i+=1){
								_flash.push({object:_fraction.denominator.list[i],type:Validation.ERROR});
							}
							for (var i=0;i<_fraction2.denominator.list.length;i+=1){
								_flash.push({object:_fraction2.denominator.list[i],type:Validation.ERROR});
							}
							_flash.push({object:root.list[_first+1],type:Validation.HARD});
							//Add/Sub with different denom
							return {type:Validation.SOFT,flash:_flash,text:ERROR.SAME_DENOMINATOR};
						}
					}
				}else{
					if (solver.hasSign(root,"+")){
						return {type:Validation.ERROR,flash:solver.getCorrectFlashes(root).concat([{object:_obj1,type:Validation.HARD},{object:_obj2,type:Validation.HARD}])};
					}
				}
			}

			let _flash=[];
			if (solver.inBrackets(_obj1) || solver.hasSign(_expression,"+") || solver.hasSign(_expression,"-")){
				_flash=solver.getCorrectFlashes(_expression,solver.getBracketScope(_expression,_obj1));
				_flash.push({object:_obj1,type:Validation.HARD});
			}else if (solver.hasSign(_expression,"(")){
				_flash=solver.getCorrectFlashes(_expression,solver.getBracketScope(_expression,_obj1));
				_flash.push({object:_obj1,type:Validation.SOFT});
			}

			if (solver.inBrackets(_obj2) || solver.hasSign(_expression2,"+") || solver.hasSign(_expression2,"-")){
				_flash=_flash.concat(solver.getCorrectFlashes(_expression2,solver.getBracketScope(_expression2,_obj2)));
				_flash.push({object:_obj2,type:Validation.HARD});
			}else if (solver.hasSign(_expression2,"(")){
				_flash=_flash.concat(solver.getCorrectFlashes(_expression2,solver.getBracketScope(_expression2,_obj2)));
				_flash.push({object:_obj2,type:Validation.SOFT});
			}
			if (_flash.length>0){
				// if one of the objects can't be taken out of the fraction because of brackets, addition or subtraction
				return {type:Validation.ERROR,flash:_flash};
			}

			//DIFFERENT FRACTIONS
			if (_expression.factorsUp==_expression2.factorsUp){
				//N-N or D-D
				if (OPTIONS.combineNNDD){
					if (_fraction2.denominator.list.length==0 && _fraction2.numerator.list.length==1){
						let _sign=(_fraction2.location.pos<_fraction.location.pos?root.list[_fraction2.location.pos+1]:root.list[_fraction2.location.pos-1]);
						return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[_obj2,_sign,_fraction2]};
					}
					let _sign2;
					if (_obj2.location.pos>0){
						_sign2=_obj2.location.expression.list[_obj2.location.pos-1];
					}else if (_obj2.location.expression.list.length>1){
						_sign2=_obj2.location.expression.list[_obj2.location.pos+1];
					}else{
						if (_fraction.numerator==_obj1.location.expression){
							return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())},{object:_obj2,text:"1"}]};
						}else{
							return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[_obj2]};
						}
					}
					return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[_sign2,_obj2]};
				}else{
					let _flash=[{object:_obj1,type:Validation.HARD},{object:_obj2,type:Validation.HARD}];
					if (_last-_first==2){
						_flash.push({object:root.list[_first+1],type:Validation.SUCCESS});
					}
					return {type:Validation.SOFT,flash:_flash,text:ERROR.COMBINE_FIRST};
				}
			}else{
				//N-D or D-N
				return solver.cancelValues(_obj1,_obj2);
			}
		}
		//nothing to do
		return null;
	}

	this.clickSign=function(_sign){
		let _expression=_sign.location.expression;
		let _obj1=_expression.list[_sign.location.pos-1];
		let _obj2=_expression.list[_sign.location.pos+1];

		let _canCombine=solver.canCombineObjects(_obj1,_obj2);
		if (_canCombine==null) return null;

		if (_canCombine.type==Validation.ERROR){
			let _flash=solver.getCorrectFlashes(_expression);
			_flash.push({object:_sign,type:Validation.ERROR});
			return {type:Validation.ERROR,flash:_flash};
		}else if (_canCombine.type==Validation.SOFT){
			let _flash=solver.getCorrectFlashes(_expression);
			_flash.push({object:_sign,type:Validation.SOFT});
			return {type:Validation.SOFT,flash:_flash,text:_canCombine.text};
		}

		if (_obj1.type==ObjectTypes.FRACTION && _obj2.type==ObjectTypes.FRACTION){
			//between fractions
			return solver.mergeFractions(_obj1,_obj2,_sign);
		}else{
			//between numbers
			switch(_sign.toText()){
				case "*": //adjacent multiplication
					return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[_sign,_obj2]};
				case "+":
					return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()+_obj2.toNumber())}],removing:[_sign,_obj2]};
				case "-":
					return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()-_obj2.toNumber())}],removing:[_sign,_obj2]};
			}
		}
	}

	this.mergeFractions=function(_fraction1,_fraction2,_sign){
		if (_fraction1.location.pos>_fraction2.location.pos){
			let _fraction3=_fraction1;
			_fraction1=_fraction2;
			_fraction2=_fraction3;
		}

		switch(_sign.toText()){
			case "*":
				if (_fraction1.denominator.list.length==0 && _fraction2.denominator.list.length==0 && _fraction2.numerator.list[0].type==ObjectTypes.NUMBER){
					_removing=[_fraction2.numerator.list[0],_sign];
					if (_fraction2.numerator.list.length>1) _removing.push(_fraction2.numerator.list[1]);
					_moving=[];
					for (var i=2;i<_fraction2.numerator.list.length;i+=1){
						_moving.push({object:_fraction2.numerator.list[i],location:{expression:_fraction1.numerator,pos:-1}});
					}
					_changing=[{object:_fraction1.numerator.list[_fraction1.numerator.list.length-1],text:String(_fraction1.numerator.list[_fraction1.numerator.list.length-1].toNumber()*_fraction2.numerator.list[0].toNumber())}];
					return {type:Validation.SUCCESS,removing:_removing,moving:_moving,changing:_changing};					
				}
				var _moving=[];
				var _changing=[];
				var _removing=[];
				if (OPTIONS.allowMergeMakeBrackets==true){
					if (solver.hasSign(_fraction1.numerator,"+") || solver.hasSign(_fraction1.numerator,"-")){
						_moving.push({new:true,text:"(",location:{expression:_fraction1.numerator,pos:0},origin:_fraction1.numerator.list[0]});
						_moving.push({new:true,text:")",location:{expression:_fraction1.numerator,pos:-1},origin:_fraction1.numerator.list[_fraction1.numerator.list.length-1]});
					}
					if (solver.hasSign(_fraction1.denominator,"+") || solver.hasSign(_fraction1.denominator,"-")){
						_moving.push({new:true,text:"(",location:{expression:_fraction1.denominator,pos:0},origin:_fraction1.denominator.list[0]});
						_moving.push({new:true,text:")",location:{expression:_fraction1.denominator,pos:-1},origin:_fraction1.denominator.list[_fraction1.denominator.list.length-1]});
					}
				}else{
					//combining two fractions that have an addition or subtraction
					if (solver.hasSign(_fraction1,"+") || solver.hasSign(_fraction1,"-") || solver.hasSign(_fraction2,"+") || solver.hasSign(_fraction2,"-")){
						return {type:Validation.ERROR,text:ERROR.ORDER_OP};
					}
				}
				//_removing.push(_sign);
				//_moving.push({new:true,text:"*",location:{expression:_fraction1.numerator,pos:-1},origin:_sign});
				_moving.push({object:_sign,location:{expression:_fraction1.numerator,pos:-1}});
				if (OPTIONS.allowMergeMakeBrackets==true){
					if (solver.hasSign(_fraction2.numerator,"+") || solver.hasSign(_fraction2.numerator,"-")){
						_moving.push({new:true,text:"(",location:{expression:_fraction1.numerator,pos:-1},origin:_fraction2.numerator.list[0]});
					}
				}
				_moving.push({object:_fraction2.numerator.list[0],location:{expression:_fraction1.numerator,pos:-1}});
				
				for (var i=1;i<_fraction2.numerator.list.length;i+=1){
					_moving.push({object:_fraction2.numerator.list[i],location:{expression:_fraction1.numerator,pos:-1}});
				};

				if (OPTIONS.allowMergeMakeBrackets==true){
					if (solver.hasSign(_fraction2.numerator,"+") || solver.hasSign(_fraction2.numerator,"-")){
						_moving.push({new:true,text:")",location:{expression:_fraction1.numerator,pos:-1},origin:_fraction2.numerator.list[_fraction2.numerator.list.length-1]});
					}
				}

				if (_fraction2.denominator.list.length>0 && _fraction1.denominator.list.length>0){
					_moving.push({new:true,text:"*",location:{expression:_fraction1.denominator,pos:-1},origin:_sign});
					if (OPTIONS.allowMergeMakeBrackets==true){
						if (solver.hasSign(_fraction2.denominator,"+") || solver.hasSign(_fraction2.denominator,"-")){
							_moving.push({new:true,text:"(",location:{expression:_fraction1.denominator,pos:-1},origin:_fraction2.denominator.list[0]});
						}
					}
				}
				for (var i=0;i<_fraction2.denominator.list.length;i+=1){
					_moving.push({object:_fraction2.denominator.list[i],location:{expression:_fraction1.denominator,pos:-1}});
				};
				if (OPTIONS.allowMergeMakeBrackets==true && _fraction1.denominator.list.length>0){
					if (solver.hasSign(_fraction2.denominator,"+") || solver.hasSign(_fraction2.denominator,"-")){
						_moving.push({new:true,text:")",location:{expression:_fraction1.denominator,pos:-1},origin:_fraction2.denominator.list[_fraction2.denominator.list.length-1]});
					}
				}
				_removing.push(_fraction2);
				
				return {type:Validation.SUCCESS,moving:_moving,removing:_removing,changing:_changing};
			case ":":
				_moving=[];
				for (var i=0;i<_fraction2.numerator.list.length;i+=1){
					_moving.push({object:_fraction2.numerator.list[i],location:{expression:_fraction2.denominator,pos:-1}});
				}
				for (var i=0;i<_fraction2.denominator.list.length;i+=1){
					_moving.push({object:_fraction2.denominator.list[i],location:{expression:_fraction2.numerator,pos:-1}});
				}
				return {type:Validation.SUCCESS,moving:_moving,changing:[{object:_sign,text:"*"}]};
			case "+": case "-":
				if (_fraction1.denominator.list.length==0 && _fraction2.denominator.list.length==0 && _fraction2.numerator.list[0].type==ObjectTypes.NUMBER){
					_removing=[_fraction2.numerator.list[0],_sign];
					if (_fraction2.numerator.list.length>1) _removing.push(_fraction2.numerator.list[1]);
					_moving=[];
					for (var i=2;i<_fraction2.numerator.list.length;i+=1){
						_moving.push({object:_fraction2.numerator.list[i],location:{expression:_fraction1.numerator,pos:-1}});
					}
					if (_sign.text()=="+") _changing=[{object:_fraction1.numerator.list[_fraction1.numerator.list.length-1],text:String(_fraction1.numerator.list[_fraction1.numerator.list.length-1].toNumber()+_fraction2.numerator.list[0].toNumber())}];
					else _changing=[{object:_fraction1.numerator.list[_fraction1.numerator.list.length-1],text:String(_fraction1.numerator.list[_fraction1.numerator.list.length-1].toNumber()-_fraction2.numerator.list[0].toNumber())}];
					return {type:Validation.SUCCESS,removing:_removing,moving:_moving,changing:_changing};					
				}
				if (solver.testEquivalentExpressions(_fraction1.denominator.toText(),_fraction2.denominator.toText())){
					var _moving=[];
					var _removing=[];
					var _changing=[];
					let _addBracketsNumerator=false;
					
					let _sign0="+";
					if (_fraction1.location.pos>0 && _fraction1.location.expression.list[_fraction1.location.pos-1].toText()=="-"){
						_sign0="-";
					}

					if (_sign.toText()=="-" && _fraction2.numerator.list.length>1){
						 if (OPTIONS.allowSubFractionMultipleNumerators==false){
						 		return {type:Validation.ERROR,text:"Simplify your Numerator"};
						 }
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
						_moving.push({new:true,text:"(",location:{expression:_fraction1.numerator,pos:-1},origin:_fraction1.numerator.list[0]});
					}
					for (var i=0;i<_fraction2.numerator.list.length;i+=1){
						_moving.push({object:_fraction2.numerator.list[i],location:{expression:_fraction1.numerator,pos:-1}});
						if (!_addBracketsNumerator && _fraction2.numerator.list[i].type==ObjectTypes.SIGN && _sign.toText()!=_sign0){
							if (_fraction2.numerator.list[i].toText()=="-"){
								_changing.push({object:_fraction2.numerator.list[i],text:"+"});
							}else if (_fraction2.numerator.list[i].toText()=="+"){
								_changing.push({object:_fraction2.numerator.list[i],text:"-"});
							}
						}
					}
					if (_addBracketsNumerator){
						_moving.push({new:true,text:")",location:{expression:_fraction1.numerator,pos:-1},origin:_fraction1.numerator.list[_fraction1.numerator.list.length-1]});
					}
					return {type:Validation.SUCCESS,moving:_moving,removing:_removing,changing:_changing};
				}else{
					let _flash=[];
					for (var i=0;i<_fraction1.denominator.list.length;i+=1){
						_flash.push({object:_fraction1.denominator.list[i],type:Validation.ERROR});
					}
					for (var i=0;i<_fraction2.denominator.list.length;i+=1){
						_flash.push({object:_fraction2.denominator.list[i],type:Validation.ERROR});
					}
					//return {type:Validation.ERROR,text:ERROR.SAME_DENOMINATOR};
					return {type:Validation.ERROR,flash:_flash};
				}
				break;
		}
	}
}