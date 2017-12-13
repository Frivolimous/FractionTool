const ObjectTypes={
	FRACTION:0,
	EXPRESSION:1,
	NUMBER:2,
	SIGN:3,
	LINE:4,
	FACTOR:5,
	BRACKET:6,
	UI:7,
}

myObjects={
	fraction:function(expression1,expression2){
		this.numerator = expression1 || myObj_makeExpression();
		this.denominator = expression2 || myObj_makeExpression();
		
		this.numerator.factorsUp=true;
		this.denominator.factorsUp=false;
		this.type=ObjectTypes.FRACTION;
		this.line=myObj_makeLine();
		this.line.master=this;
		this.numerator.parent=this;
		this.denominator.parent=this;
		this.x=0;
		this.y=0;
		this.noDenominator=false;

		this.toText=function(){
			return this.numerator.toText()+"/"+this.denominator.toText();
		}

		this.toExportText=function(){
			return "["+this.numerator.toText()+"/"+this.denominator.toText()+"]";
		}

		this.getRoot=function(){
			if (this.location!=null && this.location.expression!=null) return this.location.expression.getRoot();
			return this;
		}

		this.goTo=function(_x,_y){
			let iX=_x-this.x;
			let iY=_y-this.y;
			this.x=_x;
			this.y=_y;
			//this.getRoot().needRefresh=true;
			this.numerator.goTo(this.numerator.x+iX,this.numerator.y+iY);
			this.denominator.goTo(this.denominator.x+iX,this.denominator.y+iY);
		}

		this.tweenTo=function(_x,_y){
			this.goTo(_x,_y);
		}

		this.getWidth=function(){
			return Math.max(this.numerator.getWidth(),this.denominator.getWidth());
		}

		this.dispose=function(){
			this.numerator.dispose();
			this.denominator.dispose();

		}
		
		this.refreshPositions=function(){
			this.numerator.goTo(this.x,this.y-CONFIG.sizing.fractionMargin);
			this.denominator.goTo(this.x,this.y+CONFIG.sizing.fractionMargin);
			this.numerator.refreshPositions();
			this.denominator.refreshPositions();
			
			if (this.denominator.list.length==0){
				if (!this.noDenominator){
					this.noDenominator=true;
						
				}
				this.line.resize(-1);
				this.numerator.goTo(this.x,this.y);
				this.numerator.refreshPositions();
			}else{
				if (this.noDenominator){
					this.numerator.goTo(this.x,this.y-CONFIG.sizing.fractionMargin);
					this.numerator.refreshPositions();
					this.noDenominator=false;
				}
				
				let _width=Math.max(this.numerator.getWidth(),this.denominator.getWidth());
				this.line.resize(_width);
				this.line.tweenTo(this.x,this.y);
				//this.line.resize(Math.max(this.numerator.getWidth(),this.denominator.getWidth());
			}
			if (this.over!=null){
				this.select(false);
				this.select(true);
			}
		}

		this.select=function(b){
			if (b){
				if (this.over==null){
					this.over=new PIXI.Graphics();
					this.over.beginFill(CONFIG.colors.SELECTED,0.5);
					let _width=this.getWidth();
					this.over.drawRoundedRect(this.x-_width/2-CONFIG.sizing.fractionSelection.width/2,this.y-CONFIG.sizing.fractionSelection.height/2,_width+CONFIG.sizing.fractionSelection.width,CONFIG.sizing.fractionSelection.height,CONFIG.sizing.fractionSelection.rounding);
					this.over.interactive=true;
					this.over.buttonMode=true;
					gameM.gameStage.addChildAt(this.over,0);
				}
			}else{
				if (this.over!=null){
					this.over.parent.removeChild(this.over);
					this.over=null;
				}
			}
		}

		this.inSelectBounds=function(x,y){
			if (this.over==null) return false;
			let _width=this.getWidth();
			if (x>this.x-_width/2-CONFIG.sizing.fractionSelection.width/2 && x<this.x+_width/2+CONFIG.sizing.fractionSelection.width/2 && y>this.y-CONFIG.sizing.fractionSelection.height/2 && y<this.y+CONFIG.sizing.fractionSelection.height/2) return true;
			return false;
		}
	},
	expression:function(a){
		this.x=0;
		this.y=0;
		this.list=a || [];
		this.factorsUp=true;
		this.type=ObjectTypes.EXPRESSION;
		this.parent=null;
		this.toText=function(){
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

		this.toExportText=function(){
			let s="";
			for (var i=0;i<this.list.length;i+=1){
				if (this.list[i] === Object(this.list[i])){
					if (this.list[i].toExportText!=null) s+=this.list[i].toExportText();
					else s+=this.list[i].toText();
				}else{
					s+=String(this.list[i]);
				}
			}
			return s;
		}

		this.getRoot=function(){
			if (this.parent!=null) return this.parent.getRoot();
			else return this;
		}
		
		this.addObject=function(_object,i){
			if (_object.location!=null && _object.location.expression.removeObject(_object) && _object.location.expression==this && _object.location.pos<i){
				i-=1;
			}
			/*_result.moving[i].object.location.expression.removeObject(_result.moving[i].object);
			if (_result.moving[i].object.location.expression==_result.moving[i].location.expression && _result.moving[i].object.location.pos<_result.moving[i].location.pos){
				_result.moving[i].location.pos-=1;
			}*/
			if (i==null || i==-1) i=this.list.length;
			this.list.splice(i,0,_object);
			_object.location={expression:this,pos:i};
			if (_object.x==0 && _object.y==0) _object.goTo(this.x,this.y);
			this.getRoot().needRefresh=true;
		}

		this.removeObject=function(_object){
			for (var i=0;i<this.list.length;i+=1){
				if (this.list[i]==_object){
					this.list.splice(i,1);
					this.getRoot().needRefresh=true;
					return true;
				}
			}
			return false;
		}

		this.goTo=function(_x,_y){
			let iY=_y-this.y;
			this.x=_x;
			this.y=_y;
			this.getRoot().needRefresh=true;
			for (var i=0;i<this.list.length;i+=1){
				if (this.list[i].type==ObjectTypes.FRACTION){
					this.list[i].goTo(this.list[i].x+iX,this.list[i].y+iY);
				}else{
					this.list[i].y+=iY;
				}
			}
		}

		this.tweenTo=function(_x,_y){
			this.goTo(_x,_y);
		}


		this.rootRefresh=function(){
			let _startX=0;
			let _widths=0;
			_startX=this.x-_widths/2;
			_widths=0;
			for (var i=0;i<this.list.length;i+=1){
				this.list[i].tweenTo(_startX+_widths+this.list[i].getWidth()/2,this.y);
				if (this.list[i].type==ObjectTypes.FRACTION || this.list[i].type==ObjectTypes.EXPRESSION) this.list[i].refreshPositions();
				_widths+=this.list[i].getWidth();
				_widths+=CONFIG.sizing.tileSpacing*2;
				this.list[i].location={expression:this,pos:i};
			}
		}

		this.getWidth=function(){
			let m=0;
			for (var i=0;i<this.list.length;i+=1){
				m+=this.list[i].getWidth();
				//if (i>0) m+=CONFIG.sizing.tileSpacing;
			}
			m+=CONFIG.sizing.tileSpacing*(this.list.length-1);
			return m;
		}

		this.refreshPositions=function(){
			let _startX=0;
			let _widths=0;
			for (var i=0;i<this.list.length;i+=1){
				_widths+=this.list[i].getWidth();
				if (i>0) _widths+=CONFIG.sizing.tileSpacing;
			}
			_startX=this.x-_widths/2;

			_widths=0;
			for (var i=0;i<this.list.length;i+=1){
				this.list[i].tweenTo(_startX+_widths+this.list[i].getWidth()/2,this.y);
				if (this.list[i].type==ObjectTypes.FRACTION) this.list[i].refreshPositions();
				_widths+=this.list[i].getWidth();
				_widths+=CONFIG.sizing.tileSpacing;
				this.list[i].location={expression:this,pos:i};
			}
		}
	},
	factor:function(s,v,_linked,_output){
		myObjects.applyBasics(this);
		this.back.beginFill(CONFIG.colors.FACTOR);
		this.back.lineStyle(1,CONFIG.colors.FACTOR_BORDER);
		this.back.drawRoundedRect(-CONFIG.sizing.factorSize.width/2,-CONFIG.sizing.factorSize.height/2,CONFIG.sizing.factorSize.width,CONFIG.sizing.factorSize.height,CONFIG.sizing.factorSize.rounding);
		this.output=_output;

		let _fontSize=(s=="AMPLIFY"?14:CONFIG.sizing.factorSize.font);

		this.makeText(s,{fill:CONFIG.colors.BLACK,fontFamily:CONFIG.sizing.fontFamily,fontSize:_fontSize},7);
		this.addChild(this.text);

		this.linked=_linked;
		
		this.value=v;
		this.type=ObjectTypes.FACTOR;

		this.setTweenTarget=function(_index,_up){
			this.tweenTo(this.goal.x,this.goal.y+(CONFIG.sizing.factorOffset.base+_index*CONFIG.sizing.factorOffset.scale)*(_up?-1:1));
		}

		this.onClick=function(){
			this.linked.closeFactors();
			this.output(this);
		}

		this.select=function(){}

		this.drawLine=function(_color,_side){
			this.back.lineStyle(2,_color);
			switch(_side){
				case "bottom":
					this.back.moveTo(-this.back.width/2,this.back.height/2-2);
					this.back.lineTo(this.back.width/2,this.back.height/2-2);
					break;
				case "top":
					this.back.moveTo(-this.back.width/2,-this.back.height/2+2);
					this.back.lineTo(this.back.width/2,-this.back.height/2+2);
					break;
				case "left":
					this.back.moveTo(-this.back.width/2+2,-this.back.height/2);
					this.back.lineTo(-this.back.width/2+2,this.back.height/2);
					break;
				case "right":
					this.back.moveTo(this.back.width/2-2,-this.back.height/2);
					this.back.lineTo(this.back.width/2-2,this.back.height/2);
					break;
			}
		}
	},
	bracket:function(s){
		if (s!="(" && s!=")") return null;
		myObjects.applyBasics(this);

		this.makeText(s,{fill:0,fontFamily:CONFIG.sizing.fontFamily,fontSize:CONFIG.sizing.bracketSize.font},false);
		
		this.type=ObjectTypes.BRACKET;

		this.getWidth=function(){
			return CONFIG.sizing.bracketSize.width;
		}
	},
	sign:function(s){
		myObjects.applyBasics(this);
		this.back.beginFill(0xffffff);
	
		this.back.drawRoundedRect(-CONFIG.sizing.signSize.width/2,-CONFIG.sizing.signSize.height/2,CONFIG.sizing.signSize.width,CONFIG.sizing.signSize.height,CONFIG.sizing.signSize.rounding);
		this.makeText(s,{fill:CONFIG.colors.SIGN_TEXT,fontFamily:CONFIG.sizing.fontFamily,fontSize:CONFIG.sizing.signSize.font,fontWeight:"bold"});
		this.baseTint=CONFIG.colors.SIGN;
		this.back.tint=this.baseTint;
		this.type=ObjectTypes.SIGN;
		
		this.toText=function(){
			if (this.text.text=="\u2219") return "*";
			if (this.text.text=="\u2013") return "-";
			return this.text.text;
		}

		this.setText=function(s){
			switch(s){
				case ":": case "/":
					this.text.text=":";
					break;
				case "*": case "·": case "x": case "•":
					this.text.text="\u2219";
					break;
				case "-": case "─":
					this.text.text="\u2013";
					break;
				default: this.text.text=s;
			}
		}
		this.setText(s);
	},
	number:function(s){
		myObjects.applyBasics(this);
		this.back.beginFill(0xffffff);
		this.back.drawRoundedRect(-CONFIG.sizing.tileSize.width/2,-CONFIG.sizing.tileSize.height/2,CONFIG.sizing.tileSize.width,CONFIG.sizing.tileSize.height,CONFIG.sizing.tileSize.rounding);
		this.makeText(s,{fill:CONFIG.colors.NUMBER_TEXT,fontFamily:CONFIG.sizing.fontFamily,fontWeight:"bold",fontSize:CONFIG.sizing.tileSize.font});
		this.type=ObjectTypes.NUMBER;
		this.baseTint=CONFIG.colors.NUMBER;
		this.back.tint=this.baseTint;

		this.factorsOpen=false;

		this.hasInnerSign=false;
		this.innerText=null;
		this.innerSign=null;

		this.addInnerSign=function(_sign){
			this.back.clear();
			this.back.beginFill(0xffffff);
			this.back.drawRoundedRect(-CONFIG.sizing.tileSize.width,-CONFIG.sizing.tileSize.height/2,CONFIG.sizing.tileSize.width*2,CONFIG.sizing.tileSize.height,CONFIG.sizing.tileSize.rounding);
			this.text.x=-CONFIG.sizing.tileSize.width/2-this.text.width/2;
			this.innerText=new PIXI.Text("",{fill:CONFIG.colors.BLACK,fontFamily:CONFIG.sizing.fontFamily,fontWeight:"bold",fontSize:CONFIG.sizing.tileSize.font});
			this.innerText.x=CONFIG.sizing.tileSize.width/2+this.innerText.width/2;
			this.innerText.y=-this.innerText.height/2;
			this.addChild(this.innerText);
			this.innerSign=new PIXI.Text(_sign=="*"?"\u2219":_sign,{fill:CONFIG.colors.BLACK,fontFamily:CONFIG.sizing.fontFamily,fontWeight:"bold",fontSize:CONFIG.sizing.tileSize.font});
			this.innerSign.x=-this.innerSign.width/2;
			this.innerSign.y=-this.innerSign.height/2;
			this.addChild(this.innerSign);
			this.location.expression.getRoot().needRefresh=true;
		}

		this.clearInnerSign=function(){
			this.back.clear();
			this.back.beginFill(0xffffff);
			this.back.drawRoundedRect(-CONFIG.sizing.tileSize.width/2,-CONFIG.sizing.tileSize.height/2,CONFIG.sizing.tileSize.width,CONFIG.sizing.tileSize.height,CONFIG.sizing.tileSize.rounding);
			if (this.innerText!=null){
				this.innerText.parent.removeChild(this.innerText);
				this.innerText=null;
			}
			if (this.innerSign!=null){
				this.innerSign.parent.removeChild(this.innerSign);
				this.innerSign=null;
			}
			this.text.x=-this.text.width/2;
			this.location.expression.getRoot().needRefresh=true;
		}

		this.setAsInner=function(){
			this.innerText=new PIXI.Text("",{fill:CONFIG.colors.BLACK,fontFamily:CONFIG.sizing.fontFamily,fontWeight:"bold",fontSize:CONFIG.sizing.tileSize.font});
			this.innerText.x=CONFIG.sizing.tileSize.width/2+this.innerText.width/2;
			this.innerText.y=-this.innerText.height/2;
			this.addChild(this.innerText);
		}

		this.setInnerText=function(s){
			if (this.innerText!=null){
				this.innerText.text=s;
				if (this.innerSign!=null) this.innerText.x=CONFIG.sizing.tileSize.width/2-this.innerText.width/2;
				else this.innerText.x=-this.innerText.width/2;
			}
		}

		this.setText=function(s){
			if (Number(s)<0) s="("+s+")"
			this.text.text=s;
			this.text.x=-this.text.width/2;
		}

		this.toText=function(){
			if (this.text.text.substring(0,1)=="("){
				let _text=this.text.text.substring(1,this.text.text.length-1)
				return _text;
			}
			return this.text.text;
		}

		this.setText(s);

		this.tweenTo=function(x,y){
			this.goal.x=x;
			this.goal.y=y;

			if (this.factorsOpen){
				this.repositionFactors();
			}
		}

		this.repositionFactors=function(){
			if (this.factorBox==null){
				for (var i=0;i<this.factors.length;i+=1){
					this.factors[i].goTo(this.goal.x,this.goal.y);
					this.factors[i].setTweenTarget(i,this.location.expression.factorsUp);
				}
			}else{
				this.factorBox.x=this.goal.x-this.factorBox.mask.width/2;
				this.factorBar.x=this.factorBox.x+this.factorBox.mask.width-6;
				this.factors[this.factors.length-1].goal.x=this.factors[this.factors.length-1].x=this.goal.x+this.factors[this.factors.length-1].width/2;
			}
		}

		this.closeFactors=function(){
			if (this.factors==null) return;
			this.factorsOpen=false;
			if (this.factorBox!=null){
				gameM.objectManager.removeObject(this.factorBox);
				gameM.objectManager.removeObject(this.factorBar);
				gameM.objectManager.removeObject(this.factors[this.factors.length-1]);
				this.factors=null;
				this.factorBox=null;
				this.factorBar=null;
			}else{
				while(this.factors.length>0){
					gameM.objectManager.removeObject(this.factors[0]);
					this.factors.shift();
				}
			}
		}

		this.toNumber=function(){
			return Number(this.toText());
		}

		this.select=function(b){

			if (b==true){
				this.back.tint=CONFIG.colors.SELECTED;
			}else if (b==false){
				this.back.tint=this.baseTint;
			}else{
				this.back.tint=b;
			}
		}

		this.select(false);
	},

	line:function(){
		myObjects.applyBasics(this);
		this.interactive=false;
		this.master=null;
		this.type=ObjectTypes.LINE;

		this.resize=function(width){
			this.back.clear();
			if (width>0){
				this.back.lineStyle(0);
				this.back.beginFill(0x333C42);
				this.back.drawRoundedRect(-width/2,-CONFIG.sizing.lineSize.height/2,width,CONFIG.sizing.lineSize.height,CONFIG.sizing.lineSize.rounding);
			}
		}
		this.resize(100);

		this.getDistance=function(x,y){
			return 10000;
		}

	},

	applyBasics:function(m){
		let m=new PIXI.Sprite();
		m.back=new PIXI.Graphics;
		m.addChild(m.back);
		m.baseFilter=0xffffff;

		m.goal={x:0,y:0};
		m.interactive=true;
		m.buttonMode=true;

		m.makeText=function(s,style,_resize){
			this.text=new PIXI.Text(s,style);
			
			if (_resize && this.text.width>(this.back.width*0.9-_resize)){
				this.text.width=(this.back.width*0.9-_resize);
				this.text.scale.y=this.text.scale.x;
			}

			this.text.x=-this.text.width/2-(_resize/2||0);
			this.text.y=-this.text.height/2;
			
			this.addChild(this.text);
		}

		m.toText=function(){
			if (this.text!=null) return this.text.text;
		}

		m.setText=function(s){
			if (this.text!=null) this.text.text=s;
			this.text.x=-this.text.width/2;
		}

		m.goTo=function(x,y){
			this.x=this.goal.x=x;
			this.y=this.goal.y=y;
		}

		m.tweenTo=function(x,y){
			this.goal.x=x;
			this.goal.y=y;
		}

		m.tweenMerge=function(_object,_tweenEnd){
			this.tweenEnd=_tweenEnd;
			this.goal=_object;
		}
		m.update=function(){
			if (this.x!=this.goal.x){
				let diff=this.goal.x-this.x;
				if (Math.abs(diff)<1) this.x=this.goal.x;
				else this.x+=diff*CONFIG.moveSpeed;
			}
			if (this.y!=this.goal.y){
				let diff=this.goal.y-this.y;
				if (Math.abs(diff)<1) this.y=this.goal.y;
				else this.y+=diff*CONFIG.moveSpeed;
			}

			if (this.tweenEnd!=null && Math.abs(this.x-this.goal.x)<5 && Math.abs(this.y-this.goal.y)<5){
				console.log("A");
				this.tweenEnd();
				this.tweenEnd=null;
			}
		}

		m.getWidth=function(){
			return this.back.width;
		}

		m.select=function(b){
			if (b){
				this.back.tint=CONFIG.colors.SELECTED;
			}else{
				this.back.tint=this.baseTint;
			}
		}

		m.errorFlash=function(_color,_timing){
			if (_color==null) _color=CONFIG.colors.RED;
			//_color=0xff0000;
			if (_timing==1){
				//delayed flash
				JMBL.tweenWait(m.back,32,function(){
					JMBL.tweenColor(m.back,7,{tint:_color},function(){
						JMBL.tweenWait(m.back,25,function(){
							JMBL.tweenColor(m.back,10,{tint:m.baseTint});
						});
					});
				});
			}else if (_timing==2){
				//double flash
				JMBL.tweenColor(m.back,5,{tint:m.baseTint},function(){
					JMBL.tweenWait(m.back,4,function(){
						JMBL.tweenColor(m.back,5,{tint:_color},function(){
							JMBL.tweenWait(m.back,14,function(){
								JMBL.tweenColor(m.back,12,{tint:m.baseTint});
							});
						});
					});
				});
			}else{
				//normal flash
				JMBL.tweenColor(this.back,8,{tint:_color},function(){
					JMBL.tweenWait(m.back,20,function(){
						JMBL.tweenColor(m.back,12,{tint:m.baseTint});
					});
				});
			}
		}

		m.getDistance=function(x,y){
			if (x>this.x-this.back.width/2 && x<this.x+this.back.width/2 && y>this.y-this.back.height/2 && y<this.y+this.back.height/2){
				return 0;
			}else{
				return 10000;
			}
		}

		m.dispose=function(){

		}
	}
}

function myObj_makeRope(){
	let m=new PIXI.Graphics();
	m.origin=null;
	m.target=null;
	m.color=null;

	m.drawLine=function(_origin,_target,_color){
		this.origin=_origin || this.origin;
		this.target=_target || this.target;
		this.color=_color || this.color;
		this.clear();
		this.lineStyle(CONFIG.sizing.ropeSize,this.color);
		this.moveTo(this.origin.x,this.origin.y);
		this.lineTo(this.target.x,this.target.y);
	}

	m.clearLine=function(){
		this.clear();
		this.origin=null;
		this.target=null;
	}

	m.update=function(){
		if (this.origin!=null){
			this.drawLine();
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
	m.text=new PIXI.Text(s,{fill:0xffffff,fontFamily:CONFIG.sizing.fontFamily,fontWeight:"bold",fontSize:CONFIG.sizing.inputLabel.font});
	m.text.y=CONFIG.sizing.inputLabel.y;
	m.text.x=CONFIG.sizing.inputLabel.x;
	m.input=new PIXI.Text("",{fill:CONFIG.colors.NUMBER,fontFamily:CONFIG.sizing.fontFamily,fontSize:CONFIG.sizing.inputText.font});

	//m.back.lineStyle(1,CONFIG.colors.BOX_BORDER);
	m.back.beginFill(CONFIG.colors.BOX);
	m.back.drawRoundedRect(0,0,CONFIG.sizing.inputWindow.width,CONFIG.sizing.inputWindow.height,CONFIG.sizing.inputWindow.rounding);
	m.back.lineStyle(1,CONFIG.colors.NUMBER);
	m.back.beginFill(CONFIG.colors.WHITE);
	m.back.drawRoundedRect(CONFIG.sizing.inputBox.x,CONFIG.sizing.inputBox.y,CONFIG.sizing.inputBox.width,CONFIG.sizing.inputBox.height,CONFIG.sizing.inputBox.rounding);
	
	let _bounds=m.text.getBounds();
	m.input.x=CONFIG.sizing.inputText.x;
	m.input.y=CONFIG.sizing.inputText.y;
	m.output=output;
	m.caret=myObj_caret();
	m.caret.y=m.input.y+CONFIG.sizing.inputCaret.y;
	m.caret.x=m.input.x+m.input.width;

	m.links=[];

	m.addChild(m.back);
	m.addChild(m.text);
	m.addChild(m.input);
	m.addChild(m.caret);
	app.stage.addChild(m);
	let _up=false;
	if (_obj.type==ObjectTypes.EXPRESSION){
		if (_obj.factorsUp) _up=true;
	}else{
		if (_obj.location.expression.factorsUp) _up=true;
	}

	
	if (_obj.type==ObjectTypes.NUMBER && _obj.factorsOpen==true){
		m.x=_obj.x+CONFIG.sizing.factorSize.width/2+5;
	}else{
		m.x=_obj.x-CONFIG.sizing.inputWindow.width/2;
	}
	if (_up) m.y=_obj.y-CONFIG.sizing.inputWindow.height-CONFIG.sizing.inputWindow.spacing;
	else m.y=_obj.y+CONFIG.sizing.inputWindow.spacing;

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
				for (var i=0;i<m.links.length;i+=1){
					if (m.links[i].setInnerText!=null) m.links[i].setInnerText(m.input.text);
				}
				if (m.caret!=null) m.caret.x=m.input.x+m.input.width;
				break;
			case "-":
				if (m.input.text.length==1) m.input.text+=_key;
				for (var i=0;i<m.links.length;i+=1){
					if (m.links[i].setInnerText!=null) m.links[i].setInnerText(m.input.text);
				}
				if (m.caret!=null) m.caret.x=m.input.x+m.input.width;
				break;
			case "Backspace": 
				m.input.text=m.input.text.substring(0,m.input.text.length-1); 
				for (var i=0;i<m.links.length;i+=1){
					if (m.links[i].setInnerText!=null) m.links[i].setInnerText(m.input.text);
				}
				if (m.caret!=null) m.caret.x=m.input.x+m.input.width;
				break;
			case "Enter": m.dispose(); break;
			case "Escape": m.input.text=""; m.dispose(); break;
		}
	}

	m.inBounds=function(x,y){
		if (x>this.x && x<this.x+CONFIG.sizing.inputWindow.width && y>this.y && y<this.y+CONFIG.sizing.inputWindow.height) return true;
		return false;
	}

	m.dispose=function(b=true){
		if (interactionMode=="mobile"){
			input_removeVirtualKeyboard();
		}
		if (m.caret!=null && m.caret.parent!=null){
			m.caret.parent.removeChild(m.caret);
			m.caret=null;
		}
		if (b && this.output!=null){
			if (m.input.text==" -") m.input.text="-1";
			this.output(m.input.text);
		}
		this.destroy();
		if (myObj_currentInput==this) myObj_currentInput=null;
	}

	m.okButton=button_constructBasic({label:"OK",labelStyle:{fill:0xffffff,fontSize:CONFIG.sizing.inputOK.font},bgColor:CONFIG.colors.CONFIRM,width:CONFIG.sizing.inputOK.width,height:CONFIG.sizing.inputOK.height,rounding:CONFIG.sizing.inputOK.rounding,output:function(){m.dispose()}});
	m.okButton.x=CONFIG.sizing.inputOK.x;
	m.okButton.y=CONFIG.sizing.inputOK.y;
	m.addChild(m.okButton);
	m.cancelButton=button_constructBasic({labelStyle:{fill:0xffffff,fontSize:CONFIG.sizing.inputCancel.font},bgColor:CONFIG.colors.CANCEL,width:CONFIG.sizing.inputCancel.width,height:CONFIG.sizing.inputCancel.height,rounding:CONFIG.sizing.inputCancel.rounding,output:function(){m.input.text=""; m.dispose()}});
	m.cancelButton.graphics.lineStyle(2,0x8C939B);
	m.cancelButton.graphics.moveTo(11,17.5);
	m.cancelButton.graphics.lineTo(20,26.5);
	m.cancelButton.graphics.moveTo(11,26.5);
	m.cancelButton.graphics.lineTo(20,17.5);
	m.back.lineStyle(1,0x49565F);
	m.back.moveTo(31,6);
	m.back.lineTo(31,40);
	m.cancelButton.x=CONFIG.sizing.inputCancel.x;
	m.cancelButton.y=CONFIG.sizing.inputCancel.y;
	m.addChild(m.cancelButton);

	return m;
}

function myObj_errorPopup(s,color=CONFIG.colors.RED){
	if (myObj_currentError!=null){
		myObj_currentError.dispose();
		myObj_currentError=null;
	}
	let m=new PIXI.Sprite();
	m.back=new PIXI.Graphics();
	m.text=new PIXI.Text(s,{fill:0xffffff,fontFamily:CONFIG.sizing.fontFamily,fontSize:CONFIG.sizing.errorWindow.font,align:"center"});
	let _bounds=m.text.getBounds();
	m.text.x=CONFIG.sizing.errorWindow.width/2-_bounds.width/2;
	m.back.beginFill(color);
	m.back.drawRect(0,0,CONFIG.sizing.errorWindow.width,CONFIG.sizing.errorWindow.height);
	m.back.endFill();
	m.addChild(m.back);
	m.addChild(m.text);

	m.x=CONFIG.sizing.errorWindow.x;
	m.y=CONFIG.sizing.errorWindow.y;
	m.interactive=true;
	m.buttonMode=true;
	m.on("pointerdown",function(){m.dispose();});
	m.back.lineStyle(2,CONFIG.colors.WHITE);
	m.back.moveTo(CONFIG.sizing.errorX.x,CONFIG.sizing.errorX.y);
	m.back.lineTo(CONFIG.sizing.errorX.x+CONFIG.sizing.errorX.width,CONFIG.sizing.errorX.y+CONFIG.sizing.errorX.height);
	m.back.moveTo(CONFIG.sizing.errorX.x+CONFIG.sizing.errorX.width,CONFIG.sizing.errorX.y);
	m.back.lineTo(CONFIG.sizing.errorX.x,CONFIG.sizing.errorX.y+CONFIG.sizing.errorX.height);

	app.stage.addChild(m);
	JMBL.tweenFrom(m,20,{alpha:0});

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

function myObj_caret(_color){
	let m=new PIXI.Graphics();
	let _speed=400;
	_color=_color || CONFIG.colors.NUMBER;
	m.beginFill(_color);
	m.drawRect(0,0,CONFIG.sizing.inputCaret.width,CONFIG.sizing.inputCaret.height);
	togglecaret=function(){
		if (m.parent!=null){
			if (m.visible==false) m.visible=true;
			else m.visible=false;
			window.setTimeout(togglecaret,_speed);
		}
	}
	window.setTimeout(togglecaret,_speed);

	return m;
}