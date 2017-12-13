const DisplayState={
	NORMAL:0,
	DARKENED:-1,
	BLACKENED:-2,
	GREYED:1,
	BRIGHTENED:2,
}

function button_clearButton(_function,par){
	par=par || {};
	var m=uiElement_constructor({
		bgColor:0x00ff00,
		clickFunction:_function,
		alpha:0.05,
		width:par.width || 190,
		height:par.height || 50
	});
	m.buttonMode=true;
	m.x=par.x || 0;
	m.y=par.y || 0;
	return m;
}

function button_selectButton(_label,_function){
	_button=button_constructBasic({
		bgColor:0x113311,
		function:_function,
		width:40,
		height:40,
		label:_label,
		labelColor:0xf1f1f1,
	});

	_button.label.y=10;
	_button.label.style.fontSize=14;

	_button.setSelectState=function(bool){
		if (bool){
			if (!this.selectRect){
				this.selectRect=new PIXI.Graphics;
				this.selectRect.lineStyle(2,0xffff00);
				this.selectRect.drawRect(0,0,_button.graphics.width,_button.graphics.height);
			}
			this.addChild(this.selectRect);
		}else{
			if (this.selectRect && this.selectRect.parent==this){
				this.removeChild(this.selectRect);
			}
		}
	}
	return _button;
}

function uiElement_maskedWindow(par){
	//optional: x,y,width,height,innerHeight,backColor
	par=par || {};
	var m=new PIXI.Sprite();
	m.back=new PIXI.Graphics();
	if (par.innerHeight){
		m.back.beginFill(par.backColor||0);
		m.back.drawRect(0,0,par.width,par.innerHeight);
		m.back.beginFill(0xff0000);
		m.back.drawCircle(50,50,25);
		m.addChild(m.back);
	}
	
	m.mask=new PIXI.Graphics();
	m.addChild(m.mask);
	m.mask.beginFill(0xff0000);
	m.mask.drawRect(0,0,par.width||50,par.height||100);
	m.type=ObjectTypes.UI;

	m.x=par.x||0;
	m.y=par.y||0;
	m.vY=0;
	m.objects=[];
	m.autoSort=par.autoSort||false;
	m.interactive=true;
	m.offsetY=0;
	m.goalY=null;
	m.scrollbar=null;

	m.onWheel=function(_deltaY){
		m.vY-=_deltaY*0.008;
	}

	m.setScroll=function(p){
		if (m.back.height>m.mask.height){
			m.back.y=p*(m.mask.height-m.back.height);
		}else{
			m.back.y=0;
		}
	}

	m.getRatio=function(){
		return Math.min(1,m.mask.height/m.back.height);
	}

	m.update=function(){
		if (this.goalY!=null){
			this.vY=(this.goalY-this.back.y)/4;
		}
		if (m.vY!=0){
			if (Math.abs(m.vY)<0.1) m.vY=0;
			else{
				let _y=this.back.y+m.vY;
				_y=Math.min(_y,0);
				_y=Math.max(_y,m.mask.height-m.back.height);
				m.vY*=0.95;
				if (this.scrollbar!=null) this.scrollbar.setPosition(_y/(m.mask.height-m.back.height));
			}
		}
	}

	m.select=function(b){
		
	}

	m.startMove=function(e){
		this.offsetY=e.y-this.y-this.back.y;
	}

	m.endMove=function(e){
		this.goalY=null;
	}

	m.mouseMove=function(e){
		let _y=e.y-this.y-this.offsetY;
		this.goalY=e.y-this.y-this.offsetY;
		this.vY=(_y-this.back.y)/4;
	}

	m.onClick=function(e){
		let _object=this.getClosestObject(e);
		if (_object!=null){
			if (_object.onClick!=null) _object.onClick();
		}
	}

	m.addObject=function(_object){
		this.objects.push(_object);
		_object.x-=this.x-this.back.x;
		_object.y-=this.y-this.back.y;
		this.back.addChild(_object);
		if (this.autoSort) this.sortObjects();
	}

	m.removeObject=function(_object){
		for (var i=0;i<this.objects.length;i+=1){
			if (this.objects[i]==_object){
				m.removeObjectAt(i);
				return;
			}
		}
	}

	m.removeObjectAt=function(i){
		this.back.removeChild(this.objects[i]);
		this.objects.splice(i,1);
		if (this.autoSort) this.sortObjects();
	}

	m.sortObjects=function(){
		let cY=0;
		for (var i=0;i<this.objects.length;i+=1){
			this.objects[i].y=cY+this.objects[i].back.height/2;
			this.objects[i].x=this.objects[i].back.width/2;
			cY+=this.objects[i].back.height;
		}
	}

	m.getClosestObject=function(e){
		let _y=e.y-this.y-this.back.y;
		for (var i=0;i<this.objects.length;i+=1){
			if (_y>this.objects[i].y-this.objects[i].back.height/2 && _y<this.objects[i].y+this.objects[i].back.height/2){
				return (this.objects[i]);
			}
		}
	}

	m.getDistance=function(x,y){
		if (x>this.x && x<this.x+this.mask.width && y>this.y && y<this.y+this.mask.height){
			return -50;
		}else{
			return 10000;
		}
	}

	m.dispose=function(){

	}
	return m;
}

function uiElement_scrollbar(par){
	//required: output
	//optional: x,y,width,height,backColor,moverColor,ratio

	var m=new PIXI.Sprite();
	m.back=new PIXI.Graphics();
	m.addChild(m.back);
	m.mover=new PIXI.Graphics();
	m.addChild(m.mover);
	m.output=par.output;
	m.topY=par.topY || 0;
	m.bottomY=par.bottomY || 40;
	m.dragging=false;
	m.type=ObjectTypes.UI;
	m.interactive=true;
	m.buttonMode=true;
	m.moverColor=par.moverColor||0x333333;
	m.back.beginFill(par.backColor||0x999999);
	m.back.drawRoundedRect(0,0,par.width||4,par.height||50,(par.width/2)||2);
	m.offsetY=0;
	m.ratio=par.ratio || 0.5;
	m.x=par.x||0;
	m.y=par.y||0;


	m.drawMover=function(p){
		//p = 0-1
		p=Math.min(1,Math.max(0,p));
		/*if (p>=1) this.visible=false;
		else this.visible=true;*/
		this.mover.beginFill(this.moverColor);
		this.mover.drawRoundedRect(0,0,m.back.width,p*this.back.height,m.back.width/2);
		m.bottomY=this.back.height-this.mover.height;
	}

	m.onClick=function(e){

	}

	m.startMove=function(e){
		this.offsetY=e.y-this.y-this.mover.y;
	}

	m.endMove=function(e){
		
	}

	m.mouseMove=function(e){
		let _y=e.y-this.y-this.offsetY;
		_y=Math.max(_y,this.topY);
		_y=Math.min(_y,this.bottomY);
		this.mover.y=_y;
		this.output(this.getPosition());
		
	}

	m.setPosition=function(p){
		//p==0-1
		let _y=p*(this.bottomY-this.topY)+this.topY;
		this.mover.y=_y;
		this.output(this.getPosition());
	}
	

	m.getPosition=function(){
		//returns 0-1
		return (this.mover.y-this.topY)/(this.bottomY-this.topY);

	}

	m.update=function(){
		
	}

	m.select=function(b){
		
	}

	m.getDistance=function(x,y){
		if (interactionMode=="mobile") return 10000;

		if (x>this.x && x<this.x+this.back.width && y>this.y && y<this.y+this.back.height){
			return -50;
		}else{
			return 10000;
		}
	}

	m.dispose=function(){

	}

	m.drawMover(m.ratio);
	m.setPosition(par.position || 0);
	return m;
}

//===SUPPORTING CALLS===\\

function button_constructBasic(par){
	par=par || {};

	var m=uiElement_constructor({
		label:par.label,
		labelStyle:par.labelStyle,
		width:par.width||200,
		height:par.height||50,
		rounding:par.rounding||null,
		//clickFunction:par.function,
		x:par.x||50,
		y:par.y||50,
		bgColor:par.bgColor||0x8080ff,
		alpha:par.alpha||1
	});
	m.output=par.output;
	m.buttonMode=true;
	m.downOnThis=false;
	m.disabled=false;

	m.disable=function(b=true){
		m.disabled=b;
		if (b){
			this.setDisplayState(DisplayState.BLACKENED);
		}else{
			this.setDisplayState(DisplayState.NORMAL);
		}
	}
	m.on("pointerover",function(e){
		if (interactionMode=="desktop"){
			if (!this.disabled) this.setDisplayState(DisplayState.DARKENED);
		}
	});
	m.on("pointerout",function(e){
		if (!this.disabled) this.setDisplayState(DisplayState.NORMAL);
		this.downOnThis=false;
	});
	m.on("pointerdown",function(e){
		if (interactionMode=="desktop"){
			if (!this.disabled) this.setDisplayState(DisplayState.BRIGHTENED);
		}
		this.downOnThis=true;
	});
	m.on("pointerup",function(e){
		if (interactionMode=="desktop"){
			if (!this.disabled) this.setDisplayState(DisplayState.DARKENED);
		}else{
			if (!this.disabled) this.setDisplayState(DisplayState.NORMAL);
		}
		if (this.downOnThis){
			if (!this.disabled) this.output();
		}
		this.downOnThis=false;
	});
	
	return m;
}

function uiElement_constructor(par){
	//required: width, height
	//optional: bgColor, label, labelStyle
	//optional: clickFunction, clickRemove
	par=par || {};

	var m=uiElement_basic(par);
	m.interactive=true;
	
	if (par.clickFunction!=null){
		m.clickFunction=par.clickFunction;
		m.on("pointerdown",m.clickFunction);
	}
	
	par.displayState=par.displayState || DisplayState.NORMAL;

	m.setDisplayState=function(_state){
		if (this.displayState==_state) return;
		this.displayState=_state;
		if (this.overlay==null) this.overlay=new PIXI.Graphics();
		this.overlay.clear();
		switch(_state){
			case DisplayState.DARKENED:
				this.overlay.beginFill(0);
				this.overlay.alpha=0.5;
				this.overlay.drawRect(0,0,this.graphics.width,this.graphics.height);
				this.addChild(this.overlay);
				break;
			case DisplayState.BLACKENED:
				this.overlay.beginFill(0);
				this.overlay.alpha=0.8;
				this.overlay.drawRect(0,0,this.graphics.width,this.graphics.height);
				this.addChild(this.overlay);
				break;
			case DisplayState.GREYED:
				this.overlay.beginFill(0x999999);
				this.overlay.alpha=0.5;
				this.overlay.drawRect(0,0,this.graphics.width,this.graphics.height);
				this.addChild(this.overlay);
				break;
			case DisplayState.BRIGHTENED:
				this.overlay.beginFill(0xffffff);
				this.overlay.alpha=0.3;
				this.overlay.drawRect(0,0,this.graphics.width,this.graphics.height);
				this.addChild(this.overlay);
				break;
			case DisplayState.NORMAL: 
			default:
				if (this.overlay!=null && this.overlay.parent==this){
					this.removeChild(this.overlay);
				}break;
		}
	}

	m.setDisplayState(par.displayState);
	return m;
}

function uiElement_basic(par){
	par=par || {};
	var m=new PIXI.Sprite();
	m.graphics=new PIXI.Graphics();
	m.addChild(m.graphics);
	
	if (par.width!=null) {
		m.graphics.beginFill(par.bgColor || 0x808080);
		if (par.rounding!=null){
			m.graphics.drawRoundedRect(0,0,par.width,par.height,par.rounding);
		}else{
			m.graphics.drawRect(0,0,par.width,par.height);
		}
		m.graphics.alpha=(par.alpha==null?1:par.alpha);
	}
	m.x=par.x || 0;
	m.y=par.y || 0;

	if (par.label!=null){
		m.label=new PIXI.Text(par.label,par.labelStyle || {fill:0xffffff});
		if (m.label.width>m.graphics.width*0.9){
			m.label.width=m.graphics.width*0.9;
			m.label.scale.y=m.label.scale.x;
		}
		m.label.x=(par.width-m.label.width)/2;
		m.label.y=(par.height-m.label.height)/2;
		m.addChild(m.label);
	}
	
	return m;
}