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

//===SUPPORTING CALLS===\\

function button_skillButton(par){
	//make sure you have par.index and par.function
	par=par || {};
	par.level=par.level || 0;
	par.maxLevel=par.maxLevel || 10;
	par.labelStyle=par.labelStyle || {fill:0xf1f1f1,fontSize:14};
	par.width=par.width || 40;
	par.height=par.height || 40;
	par.x=par.x || 50;
	par.y=par.y || 50;
	par.bgColor=par.bgColor || 0x112266;
	
	var m=uiElement_constructor(par);
	m.label.y=10;
	m.label.x=(m.graphics.width-m.label.width/2)/2;

	if (par.level===0) m.setDisplayState(DisplayState.DARKENED);
	if (par.level>=par.maxLevel) m.setDisplayState(DisplayState.BRIGHTENED);

	let s=par.level.toString();
	if (s.length==1) s="0"+s;
	let maxS=par.maxLevel.toString();
	if (maxS.length==1) maxS="0"+maxS;
	m.counter=new PIXI.Text(s+"/"+maxS,{fill:m.label.style.fill, fontSize:8});
	m.counter.x=m.graphics.width/2-m.counter.width/2;
	m.counter.y=m.graphics.height-10;
	m.addChild(m.counter);

	m.index=par.index;
	m.output=par.function;
	m.buttonMode=true;
	m.downOnThis=false;
	m.on("pointerover",function(e){
	});
	m.on("pointerout",function(e){
		this.downOnThis=false;
	});
	m.on("pointerdown",function(e){
		this.downOnThis=true;
	});
	m.on("pointerup",function(e){
		if (this.downOnThis){
			this.output();
		}
		this.downOnThis=false;
	});
	
	return m;

}

function button_constructBasic(par){
	par=par || {};

	var m=uiElement_constructor({
		label:par.label,
		labelStyle:par.labelStyle,
		width:par.width||200,
		height:par.height||50,
		//clickFunction:par.function,
		x:par.x||50,
		y:par.y||50,
		bgColor:par.bgColor||0x8080ff,
		alpha:par.alpha||1
	});
	m.output=par.output;
	m.buttonMode=true;
	m.downOnThis=false;
	m.on("pointerover",function(e){
		if (interactionMode=="desktop"){
			this.setDisplayState(DisplayState.DARKENED);
		}
	});
	m.on("pointerout",function(e){
		this.setDisplayState(DisplayState.NORMAL);
		this.downOnThis=false;
	});
	m.on("pointerdown",function(e){
		if (interactionMode=="desktop"){
			this.setDisplayState(DisplayState.BRIGHTENED);
		}
		this.downOnThis=true;
	});
	m.on("pointerup",function(e){
		if (interactionMode=="desktop"){
			this.setDisplayState(DisplayState.DARKENED);
		}else{
			this.setDisplayState(DisplayState.NORMAL);
		}
		if (this.downOnThis){
			this.output();
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
		m.graphics.drawRect(0,0,par.width,par.height);
		m.graphics.alpha=(par.alpha==null?1:par.alpha);
	}
	m.x=par.x || 0;
	m.y=par.y || 0;

	if (par.label!=null){
		m.label=new PIXI.Text(par.label,par.labelStyle || {fill:0xffffff});
		m.label.x=(par.width-m.label.width)/2;
		m.label.y=(par.height-m.label.height)/2;
		/*m.label.x=par.width/15;
		m.label.y=par.height/15;*/
		m.addChild(m.label);
	}
	
	return m;
}