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
			return {type:Validation.ERROR,text:String(_factor)+" is not a common divisor.",flash:[{object:_obj1,type:Validation.ERROR},{object:_obj2,type:Validation.ERROR}]};
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
				if (_object.list[i].toText()=="(") _numBrackets+=1;
				if (_object.list[i].toText()==")") _numBrackets-=1;
				if (_numBrackets==0 && _object.list[i].toText()==_sign) return true;
			}
			return false;
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
				var _moving=[];
				var _changing=[];
				var _removing=[];

				if (OPTIONS.forceLeftToRight!=false){
					let _firstMult=null;
					for (var i=0;_firstMult==null;i+=1){
						if (root.list[i].type==ObjectTypes.SIGN && (root.list[i].toText()=="*" || root.list[i].toText()==":")){
							_firstMult=i;
						}
					}
					if (OPTIONS.forceLeftToRight==true && _sign.location.pos!=_firstMult) return {type:Validation.SOFT,text:ERROR.LEFT_TO_RIGHT};
					if (_sign.location.pos!=_firstMult && OPTIONS.forceLeftToRight=="mixed"){
						if (solver.hasSign(root,":")){
							let _flash=[];
							for (var i=0;i<root.list.length;i+=1){
								if (root.list[i].type==ObjectTypes.SIGN && root.list[i].toText()==":"){
									_flash.push({object:root.list[i],type:Validation.SUCCESS});
								}
							}
							_flash.push({object:_sign,type:Validation.SOFT});
							_flash.push({object:root.list[_firstMult],type:Validation.SUCCESS});
							//return {type:Validation.SOFT,text:ERROR.DIVISION_FIRST};
							return {type:Validation.SOFT,flash:_flash};
						}

						if (solver.hasSign(root,"+") || solver.hasSign(root,"-")){
							//return {type:Validation.SOFT,text:ERROR.LEFT_TO_RIGHT};
							return {type:Validation.SOFT,flash:[{object:_sign,type:Validation.SOFT},{object:root.list[_firstMult],type:Validation.SUCCESS}]};
						}
					}
				}

				if (OPTIONS.allowMergeMakeBrackets==true){
					if (solver.hasSign(_fraction1.numerator,"+") || solver.hasSign(_fraction1.numerator,"-")){
						_moving.push({new:true,text:"(",location:{expression:_fraction1.numerator,pos:0}});
						_moving.push({new:true,text:")",location:{expression:_fraction1.numerator,pos:-1}});
					}
					if (solver.hasSign(_fraction1.denominator,"+") || solver.hasSign(_fraction1.denominator,"-")){
						_moving.push({new:true,text:"(",location:{expression:_fraction1.denominator,pos:0}});
						_moving.push({new:true,text:")",location:{expression:_fraction1.denominator,pos:-1}});
					}
				}else{
					//combining two fractions that have an addition or subtraction
					if (solver.hasSign(_fraction1,"+") || solver.hasSign(_fraction1,"-") || solver.hasSign(_fraction2,"+") || solver.hasSign(_fraction2,"-")){
						return {type:Validation.ERROR,text:ERROR.ORDER_OP};
					}
				}
					
				_moving.push({new:true,text:"*",location:{expression:_fraction1.numerator,pos:-1}});
				if (OPTIONS.allowMergeMakeBrackets==true){
					if (solver.hasSign(_fraction2.numerator,"+") || solver.hasSign(_fraction2.numerator,"-")){
						_moving.push({new:true,text:"(",location:{expression:_fraction1.numerator,pos:-1}});
					}
				}
				_moving.push({object:_fraction2.numerator.list[0],location:{expression:_fraction1.numerator,pos:-1}});
				
				for (var i=1;i<_fraction2.numerator.list.length;i+=1){
					_moving.push({object:_fraction2.numerator.list[i],location:{expression:_fraction1.numerator,pos:-1}});
				};

				if (OPTIONS.allowMergeMakeBrackets==true){
					if (solver.hasSign(_fraction2.numerator,"+") || solver.hasSign(_fraction2.numerator,"-")){
						_moving.push({new:true,text:")",location:{expression:_fraction1.numerator,pos:-1}});
					}
				}

				if (_fraction2.denominator.list.length>0 && _fraction1.denominator.list.length>0){
					_moving.push({new:true,text:"*",location:{expression:_fraction1.denominator,pos:-1}});
					if (OPTIONS.allowMergeMakeBrackets==true){
						if (solver.hasSign(_fraction2.denominator,"+") || solver.hasSign(_fraction2.denominator,"-")){
							_moving.push({new:true,text:"(",location:{expression:_fraction1.denominator,pos:-1}});
						}
					}
				}
				for (var i=0;i<_fraction2.denominator.list.length;i+=1){
					_moving.push({object:_fraction2.denominator.list[i],location:{expression:_fraction1.denominator,pos:-1}});
				};
				if (OPTIONS.allowMergeMakeBrackets==true && _fraction1.denominator.list.length>0){
					if (solver.hasSign(_fraction2.denominator,"+") || solver.hasSign(_fraction2.denominator,"-")){
						_moving.push({new:true,text:")",location:{expression:_fraction1.denominator,pos:-1}});
					}
				}
				_removing.push(_fraction2);
				_removing.push(_sign);
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
				if (OPTIONS.forceMultFirstOrderOp && solver.hasSign(root,":")){
					let _flash=[{object:_sign,type:Validation.SOFT}];
					for (var i=0;i<root.list.length;i+=1){
						if (root.list[i].toText()==":" || root.list[i].toText()=="*"){
							_flash.push({object:root.list[i],type:Validation.SUCCESS});
						}
					}
					return {type:Validation.SOFT,flash:_flash};
				}
				/*if (OPTIONS.forceMultFirstOrderOp && solver.hasSign(root,"*")){
					let _flash=[{object:_sign,type:Validation.SOFT}];
					for (var i=0;i<root.list.length;i+=1){
						if (root.list[i].toText()=="*"){
							_flash.push({object:root.list[i],type:Validation.SUCCESS});
						}
					}
					return {type:Validation.SOFT,flash:_flash};
				}*/

				if (_fraction1.location.pos>0 && root.list[_fraction1.location.pos-1].toText()=="*"){
					return {type:Validation.ERROR,text:ERROR.MULTIPLICATION_FIRST,flash:[{object:_sign,type:Validation.ERROR},{object:root.list[_fraction1.location.pos-1],type:Validation.SUCCESS}]};
				}else if (_fraction1.location.pos>0 && root.list[_fraction1.location.pos-1].toText()==":"){
					return {type:Validation.ERROR,flash:[{object:_sign,type:Validation.ERROR},{object:root.list[_fraction1.location.pos-1],type:Validation.SUCCESS}]};
				}

				//multiplication before addition/subtraction
				if (_fraction2.location.pos<root.list.length-1){
					if (root.list[_fraction2.location.pos+1].toText()==":"){
						return {type:Validation.ERROR,flash:[{object:_sign,type:Validation.ERROR},{object:root.list[_fraction2.location.pos+1],type:Validation.SUCCESS}]};
					}
					if (root.list[_fraction2.location.pos+1].toText()=="*"){
						return {type:Validation.ERROR,text:ERROR.MULTIPLICATION_FIRST,flash:[{object:_sign,type:Validation.ERROR},{object:root.list[_fraction2.location.pos+1],type:Validation.SUCCESS}]};
					}
				}

				if (_fraction1.location.pos>0 && (OPTIONS.forceLeftToRight==true ||
					(OPTIONS.forceLeftToRight=="mixed" && solver.hasSign(root,"-")))){
					let _flash=[{object:_sign,type:Validation.SOFT}];
					for (var i=0;i<root.list.length;i+=1){
						if (root.list[i].type==ObjectTypes.SIGN && (root.list[i].toText()=="-" || root.list[i].toText()=="+")){
							_flash.push({object:root.list[i],type:Validation.SUCCESS});
							break;
						}
					}
					return {type:Validation.SOFT,flash:_flash};
				}

				

				if (solver.testEquivalentExpressions(_fraction1.denominator.toText(),_fraction2.denominator.toText())){
				//if (_fraction1.denominator.equivalentTo(_fraction2.denominator)){
					var _moving=[];
					var _removing=[];
					var _changing=[];
					let _addBracketsNumerator=false;
					
					let _sign0="+";
					if (_fraction1.location.pos>0 && _fraction1.location.expression.list[_fraction1.location.pos-1].toText()=="-"){
						//Subtraction after Addition
						if (!OPTIONS.allowSubAddFractions) return {type:Validation.SOFT,flash:[{object:_sign,type:Validation.SOFT},{object:_fraction.location.expression.list[_fraction1.location.pos-1],type:Validation.SUCCESS}]};
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
						_moving.push({new:true,text:"(",location:{expression:_fraction1.numerator,pos:-1}});
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
						_moving.push({new:true,text:")",location:{expression:_fraction1.numerator,pos:-1}});
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
			//unneeded from the OUTSIDE: +(???)
			if (_expression.list[i].type==ObjectTypes.BRACKET){
				if (_expression.list[i].toText()=="("){
					let _scope=solver.getBracketScopeFrom(_expression,i);
					solver.hasSign(_expression,"+",_scope);
					if ((!solver.hasSign(_expression,"+",_scope) && !solver.hasSign(_expression,"-",_scope)) || 
						(_scope.start-1==0 && _scope.end-1==_expression.list.length && _expression.parent.type==ObjectTypes.FRACTION && _expression.parent.denominator.list.length>0) || 
						(_scope.start>=2 && _expression.list[_scope.start-2].toText()=="+") ||
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

	this.canCombine=function(_obj1,_obj2){
		let _result=solver.getCombine(_obj1,_obj2);
		if (_result==null || _result.type==Validation.NO) return Validation.NO;
		if (_result.type==Validation.SOFT) return Validation.SOFT;
		if (_result.type==Validation.ERROR || _result.type==Validation.SOFT || _result.type==Validation.HARD) return Validation.ERROR;
		if (_result.type==Validation.SUCCESS || _result.type==Validation.PROMPT) return Validation.SUCCESS;
		return Validation.NO;
	}

	this.getCombine=function(_obj1,_obj2){
		//obj 1 is what you are dropping ON; location = fixed
		if (_obj1==_obj2) return null;
		let _expression=_obj1.location.expression;
		if (_obj1.type==ObjectTypes.FRACTION && _obj2.type==ObjectTypes.FRACTION){
			//combine fractions
			if (Math.abs(_obj1.location.pos-_obj2.location.pos)>2){
				return {type:Validation.ERROR,text:"Currently, only ADJACENTS can combine"};
			}
			let _sign=_expression.list[Math.min(_obj1.location.pos,_obj2.location.pos)+1];
			return solver.mergeFractions(_obj1,_obj2,_sign);
		}else if (_obj1.type!=ObjectTypes.NUMBER || _obj2.type!=ObjectTypes.NUMBER){
			return null;
		}else{
			if (isNaN(_obj1.toNumber()) || isNaN(_obj2.toNumber())) return {type:Validation.HARD,text:"Cannot perform an operation with a variable"};
			var index1;
			var index2;
			
			for (var i=0;i<_expression.list.length;i+=1){
				if (_expression.list[i]==_obj1) index1=i;
				if (_expression.list[i]==_obj2) index2=i;
			}
			if (_obj2.location.expression!=_expression){
				// 2 comes from elsewhere
				let _fraction=_expression.parent;
				if (solver.inBrackets(_obj1) || solver.inBrackets(_obj2)){
					return {type:Validation.ERROR,text:ERROR.ORDER_OP};
				}
				if (_fraction.type==ObjectTypes.FRACTION && _obj2.location.expression.parent==_fraction){
					//same fraction: Numerator and Denominator
					if (solver.hasSign(_fraction,"+") || solver.hasSign(_fraction,"-") || solver.hasSign(_fraction,":")) return {type:Validation.HARD,text:ERROR.ORDER_OP}; //numerator to denominator, only works if Multiplication Only.
					return solver.cancelValues(_obj1,_obj2);
				}else{
					//DIFFERENT FRACTIONS
					let _fraction2=_obj2.location.expression.parent;

					let _first=Math.min(_fraction.location.pos,_fraction2.location.pos);
					let _last=Math.max(_fraction.location.pos,_fraction2.location.pos);
					
					for (var i=_first+1;i<_last;i+=1){
						if (root.list[i].type==ObjectTypes.SIGN && root.list[i].toText()==";") return null;
					}

					if (_fraction.location.pos>0 && _fraction.location.expression.list[_fraction.location.pos-1].toText()==":"){
						return {type:Validation.ERROR,flash:[{object:_fraction.location.expression.list[_fraction.location.pos-1],type:Validation.SUCCESS}]};

					}
					if (_fraction2.location.pos>0 && _fraction2.location.expression.list[_fraction2.location.pos-1].toText()==":"){
						//return {type:Validation.ERROR,text:ERROR.DIVISION_FIRST};
						return {type:Validation.ERROR,flash:[{object:_fraction2.location.expression.list[_fraction2.location.pos-1],type:Validation.SUCCESS}]};						
					}
					if (OPTIONS.forceLeftToRight!=false){
						
						let _sign=root.list[Math.min(_fraction.location.pos,_fraction2.location.pos)+1];
						if (_sign.toText()=="*"){
							let _firstMult=null;
							for (var i=0;_firstMult==null;i+=1){
								if (root.list[i].type==ObjectTypes.SIGN && root.list[i].toText()=="*"){
									_firstMult=i;
								}
							}
							if (OPTIONS.forceLeftToRight==true && _sign.location.pos!=_firstMult) return {type:Validation.SOFT,text:ERROR.LEFT_TO_RIGHT};
							if ((_sign.location.pos!=_firstMult || Math.abs(_fraction.location.pos-_fraction2.location.pos)>2) && OPTIONS.forceLeftToRight=="mixed"){
								if (solver.hasSign(root,"+") || solver.hasSign(root,"-")){
									return {type:Validation.SOFT,text:ERROR.LEFT_TO_RIGHT,flash:[{object:root.list[i],type:Validation.SUCCESS}]};
								}

								if (solver.hasSign(root,":")){
									let _flash=[];
									for (var i=0;i<root.list.length;i+=1){
										if (root.list[i].type==ObjectTypes.SIGN && root.list[i].toText()==":"){
											_flash.push({object:root.list[i],type:Validation.SUCCESS});
										}
									}
									return {type:Validation.SOFT,text:ERROR.DIVISION_FIRST,flash:_flash};
								}
							}
						}
					}
					
					if (!OPTIONS.moveAcrossFractions){
						//must combine fractions first if 'move across fractions' is disabled
						//return {type:Validation.ERROR,text:ERROR.COMBINE_FIRST};
						return {type:Validation.ERROR,flash:[{object:root.list[Math.min(_fraction.location.pos,_fraction2.location.pos)+1],type:Validation.SUCCESS}]};
					}
					if (solver.hasSign(_expression,"+") || solver.hasSign(_expression,"-")){
						let _flash=[];
						for (var i=0;i<_expression.list.length;i+=1){
							if (_expression.list[i].type==ObjectTypes.SIGN && (_expression.list[i].toText()=="+" || _expression.list[i].toText()=="-")){
								_flash.push({object:_expression.list[i],type:Validation.SUCCESS});
							}
						}
						return {type:Validation.ERROR,text:ERROR.ORDER_OP,flash:_flash};
					}
					let _expression2=_obj2.location.expression;
					if (solver.hasSign(_expression2,"+") || solver.hasSign(_expression2,"-")){
						//can't move across if addition or subtraction involved
						//return {type:Validation.ERROR,text:ERROR.ORDER_OP};
						let _flash=[];
						for (var i=0;i<_expression2.list.length;i+=1){
							if (_expression2.list[i].type==ObjectTypes.SIGN && (_expression2.list[i].toText()=="+" || _expression2.list[i].toText()=="-")){
								_flash.push({object:_expression2.list[i],type:Validation.SUCCESS});
							}
						}
						return {type:Validation.ERROR,text:ERROR.ORDER_OP,flash:_flash};
					}
					if (!OPTIONS.allowCancelOtherExpression){
						if (solver.hasSign(_fraction,"+") || solver.hasSign(_fraction2,"+")){
							return {type:Validation.ERROR,text:"Simplify the Sum"};
						}
						if (solver.hasSign(_fraction,"-") ||solver.hasSign(_fraction2,"-")){
							return {type:Validation.ERROR,text:"Simplify the Difference"};
						}
					}
					let fIndex1;
					let fIndex2;
					var fFlipped=false;
					for (var i=0;i<root.list.length;i+=1){
						if (root.list[i]==_fraction) fIndex1=i;
						if (root.list[i]==_fraction2) fIndex2=i;
					}
					let _fSign;
					if (fIndex1<fIndex2){
						if (root.list[fIndex1+1]==root.list[fIndex2-1]){
							_fSign=root.list[fIndex1+1];
						}else{
							let _flash=[];
							for (let j=fIndex1+2;j<=fIndex2-1;j+=1){
								if (root.list[j].toText()=="+" || root.list[j].toText()=="-"){
									//if there's a + or - in between these values and a * or : is involved
									//return {type:Validation.ERROR,text:ERROR.ORDER_OP};
									_flash.push({object:root.list[j],type:Validation.ERROR});
								}
							}
							if (_flash.length>0){
								return {type:Validation.ERROR,text:ERROR.ORDER_OP,flash:_flash};
							}
							_fSign=root.list[fIndex2-1];
						}
					}else{
						if (root.list[fIndex2+1]==root.list[fIndex1-1]){
							_fSign=root.list[fIndex2+1];
						}else{
							let _flash=[];
							for (let j=fIndex2+2;j<=fIndex1-1;j+=1){
								if (root.list[j].toText()=="+" || root.list[j].toText()=="-"){
									//if there's a + or - in between these values and a * or : is involved
									//return {type:Validation.ERROR,text:ERROR.ORDER_OP};
									_flash.push({object:root.list[j],type:Validation.ERROR});
								}
							}
							if (_flash.length>0){
								return {type:Validation.ERROR,text:ERROR.ORDER_OP,flash:_flash};
							}
							_fSign=root.list[fIndex2+1];
						}
					}
					if (_fSign!=null){
						if (_fSign.toText()=="*"){
							if ((_fraction.numerator==_obj1.location.expression)==(_fraction2.numerator==_obj2.location.expression)){
								if (_fraction2.denominator.list.length==0 && _fraction2.numerator.list.length==1){
									return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[_obj2,_fSign,_fraction2]};
								}
								//N-N or D-D
								let sign2;
								if (_obj2.location.pos>0){
									sign2=_obj2.location.expression.list[_obj2.location.pos-1];
								}else if (_obj2.location.expression.list.length>1){
									sign2=_obj2.location.expression.list[_obj2.location.pos+1];
								}else{
									if (_fraction.numerator==_obj1.location.expression){
										return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())},{object:_obj2,text:"1"}]};
									}else{
										return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[_obj2]};
									}
								}
								return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[sign2,_obj2]};
							}else{
								//N-D or D-N
								return solver.cancelValues(_obj1,_obj2);
							}
						}else{
							let _flash=[];
							/*let _start=Math.min(_fraction.location.pos,_fraction2.location.pos);
							let _end=Math.max(_fraction.location.pos,_fraction2.location.pos);
							for (var i=_start+1;i<_end;i+=1){
								if (root.list[i].type==ObjectTypes.SIGN){
									_flash.push({object:root.list[i],type:Validation.ERROR});
								}
							}*/
							if (solver.testEquivalentExpressions(_fraction.denominator.toText(),_fraction2.denominator.toText())){
								let _sign=root.list[Math.min(_fraction.location.pos,_fraction2.location.pos)+1];
								_flash.push({object:_sign,type:Validation.SUCCESS});
							}else{
								for (var i=0;i<_fraction.denominator.list.length;i+=1){
									_flash.push({object:_fraction.denominator.list[i],type:Validation.ERROR});
								}
								for (var i=0;i<_fraction2.denominator.list.length;i+=1){
									_flash.push({object:_fraction2.denominator.list[i],type:Validation.ERROR});
								}
							}
							if ((_fraction.numerator==_obj1.location.expression)==(_fraction2.numerator==_obj2.location.expression)){
								if (_fraction.numerator==_obj1.location.expression){
									//numerators across an addition, won't join the fractions if this is disabled.
									//if (!OPTIONS.numeratorsAcrossAddition) return {type:Validation.SOFT,text:ERROR.COMBINE_FIRST};
									if (!OPTIONS.numeratorsAcrossAddition) return {type:Validation.SOFT,flash:_flash};
								}else{
									//if (!OPTIONS.divisorsAcrossAddition) return {type:Validation.SOFT,text:ERROR.COMBINE_FIRST};
									if (!OPTIONS.divisorsAcrossAddition) return {type:Validation.SOFT,flash:_flash};
								}
								return solver.mergeFractions(_fraction,_fraction2,_fSign);
							}
							//return {type:Validation.SOFT,text:ERROR.COMBINE_FIRST};
							return {type:Validation.SOFT,flash:_flash};
						}
					}else{
						//this should never happen since you can't link distant fractions
						return {type:Validation.ERROR,text:"Currently, only ADJACENTS can combine"};
					}
				}
			}else{
				// both are in this expression

				var flipped=false;
				if (!solver.sameBrackets(_obj1,_obj2)){
					//not within the same bracket scope
					return {type:Validation.ERROR,text:ERROR.ORDER_OP};
				}
				let _scope=solver.getBracketScope(_expression,_obj1);

				if (index1>index2){
					flipped=true;
					let index3=index1;
					let _obj3=_obj1;
					index1=index2;
					index2=index3;
					_obj1=_obj2;
					_obj2=_obj3;
				}
				if (index1>0 && _expression.list[index1-1].toText()==":"){
					//division out of order *** no division should exist
					return {type:Validation.ERROR,text:ERROR.ORDER_OP};
				}
				
				let sign1=_expression.list[index1+1];
				let sign2=_expression.list[index2-1];
				if (sign1==sign2){
					//ADJACENT -- EASY
					switch(sign1.toText()){
						case "*": //adjacent multiplication
							if (OPTIONS.forceLeftToRight!=false){
								let _firstMult=null;
								for (var i=_scope.start;_firstMult==null;i+=1){
									if (_expression.list[i].type==ObjectTypes.SIGN && _expression.list[i].toText()=="*"){
										_firstMult=i;
									}
								}
								if (OPTIONS.forceLeftToRight==true && sign1.location.pos!=_firstMult) return {type:Validation.SOFT,text:ERROR.LEFT_TO_RIGHT};

								if (sign1.location.pos!=_firstMult && OPTIONS.forceLeftToRight=="mixed"){
									if (solver.hasSign(_expression,"+") || solver.hasSign(_expression,"-")){
										return {type:Validation.SOFT,text:ERROR.LEFT_TO_RIGHT};
									}

									if (solver.hasSign(_expression,":")){
										return {type:Validation.SOFT,text:ERROR.DIVISION_FIRST};
									}
								}
							}
							return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()*_obj2.toNumber())}],removing:[sign2,_obj2]};
						case ":": //adjacent division
							return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_obj1.toNumber()/_obj2.toNumber())}],removing:[sign2,_obj2]};
						case "+": case "-":
							//must perform multiplication first
							let value1=_obj1.toNumber();

							if (index2+1<_scope.end){
								if (_expression.list[index2+1].toText()=="*"){
									return {type:Validation.ERROR,text:ERROR.MULTIPLICATION_FIRST};
								}
							}
							if (index1>_scope.start && _expression.list[index1-1].toText()=="*"){
								return {type:Validation.ERROR,text:ERROR.MULTIPLICATION_FIRST};
							}

							if (OPTIONS.forceMultFirstOrderOp && (solver.hasSign(_expression,"*",_scope) || solver.hasSign(_expression,":",_scope))) 
								return {type:Validation.SOFT,text:ERROR.MULTIPLICATION_FIRST};
							if (index1>_scope.start){
								if (OPTIONS.forceLeftToRight==true || 
									(OPTIONS.forceLeftToRight=="mixed" && (solver.hasSign(_expression,"-",_scope) || (solver.hasSign(_expression,"+",_scope) && (solver.hasSign(_expression,"*",_scope) || solver.hasSign(_expression,":",_scope)))))){
									if (_expression.list[index1-1].toText()=="-"){
										return {type:Validation.ERROR,text:ERROR.LEFT_TO_RIGHT};
									}else{
										return {type:Validation.SOFT,text:ERROR.LEFT_TO_RIGHT};
									}
								}

								if (_expression.list[index1-1].toText()=="-"){
									//if left-to-right is disabled and disallowing addition after subtraction
									if (!OPTIONS.allowSubAddInside) return {type:Validation.SOFT,text:ERROR.SUBTRACT_FIRST};
									value1=-value1;
								}
							}

							let value2=_obj2.toNumber();
							if (_expression.list[index2-1].toText()=="-"){
								value2=-value2;
							}
							value1+=value2;
							let _changing;
							if (index1>_scope.start){
								if (value1>=0){
									_changing={object:_expression.list[index1-1],text:"+"};
								}else{
									_changing={object:_expression.list[index1-1],text:"-"};
									value1=Math.abs(value1);
								}
							}
							
							//addition or subtraction
							return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(value1)},_changing],removing:[sign2,_obj2]};
					}
				}else{
					//NON-ADJACENT
					if (OPTIONS.onlyAdjacentOperations) return {type:Validation.SOFT,text:"Only Adjacent Numbers."};

					switch (sign1.toText()){
						case "*": case ":":
							let j=sign1.location.pos+1;
							while (j<=sign2.location.pos){
								if (_expression.list[j].toText()=="+" || _expression.list[j].toText()=="-"){
									//if there's a + or - in between these values and a * or : is involved
									return {type:Validation.ERROR,text:ERROR.ORDER_OP};
								}
								j+=1;
							}
							if (sign2.toText()=="*"){
								//multiplication.
								//if there is a : after the first value, you cannot move that one to the second.
								
								let _value=_obj1.toNumber()*_obj2.toNumber()
								if (flipped && sign1.toText()!=":"){
									return {type:Validation.SUCCESS,changing:[{object:_obj2,text:String(_value)}],removing:[sign1,_obj1]};
								}else{
									return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_value)}],removing:[sign2,_obj2]};
								}
							}else{
								//division
								//x*y:z,  move x to z, becomes y*[x:z]
								let _value=_obj1.toNumber()/_obj2.toNumber()
								if (flipped){
									return {type:Validation.SUCCESS,changing:[{object:_obj2,text:String(_value)},{object:sign2,text:"*"}],removing:[sign1,_obj1]};
								}else{
									return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(_value)}],removing:[sign2,_obj2]};
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
								if (_expression.list[index2+1].toText()=="*"){
									return {type:Validation.ERROR,text:ERROR.MULTIPLICATION_FIRST};
								}
							}
							if (index1>_scope.start && _expression.list[index1-1].toText()=="*"){
								return {type:Validation.ERROR,text:ERROR.MULTIPLICATION_FIRST};
							}
							if (sign2.toText()=="*") return {type:Validation.ERROR,text:ERROR.ORDER_OP};
							
							if (OPTIONS.forceMultFirstOrderOp && (solver.hasSign(_expression,"*",_scope) || solver.hasSign(_expression,":",_scope))) return {type:Validation.SOFT,text:ERROR.MULTIPLICATION_FIRST};
							
							if (OPTIONS.forceLeftToRight==true || 
								(OPTIONS.forceLeftToRight=="mixed" && (solver.hasSign(_expression,"-",_scope) || (solver.hasSign(_expression,"+",_scope) && solver.hasSign(_expression,"*",_scope))))){
								return {type:Validation.SOFT,text:ERROR.LEFT_TO_RIGHT};
							}

							if (index1>_scope.start && _expression.list[index1-1].toText()=="-"){
								if (!OPTIONS.allowSubAddInside) return {type:Validation.SOFT,text:ERROR.SUBTRACT_FIRST};
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
										_signToPos=_expression.list[index1-1];
									}else{
										_signToNeg=_expression.list[index1-1];
										value1=Math.abs(value1);
									}
								}
								//Distant Addition/Subtraction
								return {type:Validation.SUCCESS,changing:[{object:_obj1,text:String(value1)},{object:_signToNeg,text:"-"},{object:_signToPos,text:"+"}],removing:[_obj2,sign2]};
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
									if (_expression.list[index1+1].toText()=="-"){
										_numTimesNeg=_expression.list[index1+2];
									}
									//Still Distant Addition/Subtraction, when moving to FRONT
									return {type:Validation.SUCCESS,changing:[{object:_obj2,text:String(value1)},{object:_signToNeg,text:"-"},{object:_signToPos,text:"+"},{object:_numTimesNeg,text:(_numTimesNeg!=null?String((-1)*_numTimesNeg.toNumber()):null)}],removing:[_obj1,sign1]};
								}else{
									//Still Distant Addition/Subtraction, when moving to REGULAR
									return {type:Validation.SUCCESS,changing:[{object:_obj2,text:String(value1)},{object:_signToNeg,text:"-"},{object:_signToPos,text:"+"}],removing:[_obj1,_expression.list[index1-1]]};
								}
							}
					}
				}
			}
		}
		//nothing to do
		return null;
	}
}