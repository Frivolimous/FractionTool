function window_bottomBar(){
	var m=uiElement_basic({width:stageBorders.right,height:80,y:stageBorders.bot-80,bgColor:0xf1f1f1});
	m.animateAdd=function(){
		JMBL.tweenTo(this,10,{y:stageBorders.bot-80});
	}
	
	m.animateRemove=function(){
		JMBL.tweenTo(this,10,{y:stageBorders.bot+80});
	}
	return m;
}

function window_virtualKeyboard(_output){
	var m=uiElement_basic({width:stageBorders.right,height:80,y:stageBorders.bot+80,bgColor:0xf1f1f1});
	m.buttons=[];
	let i=0;
	window_makeKeyboardButton("1",15+i*55,m,_output);
	i+=1;
	window_makeKeyboardButton("2",15+i*55,m,_output);
	i+=1;
	window_makeKeyboardButton("3",15+i*55,m,_output);
	i+=1;
	window_makeKeyboardButton("4",15+i*55,m,_output);
	i+=1;
	window_makeKeyboardButton("5",15+i*55,m,_output);
	i+=1;
	window_makeKeyboardButton("6",15+i*55,m,_output);
	i+=1;
	window_makeKeyboardButton("7",15+i*55,m,_output);
	i+=1;
	window_makeKeyboardButton("8",15+i*55,m,_output);
	i+=1;
	window_makeKeyboardButton("9",15+i*55,m,_output);
	i+=1;
	window_makeKeyboardButton("0",15+i*55,m,_output);
	i+=1;
	window_makeKeyboardButton("-",15+i*55,m,_output);
	i+=1;

	let _button=button_constructBasic({bgColor:CONFIG.colors.CANCEL,width:70,height:50,output:function(){_output({key:"Backspace"})}});
	_button.y=10;
	_button.x=15+i*55;
	_button.graphics.beginFill(0xffffff);
	_button.graphics.moveTo(20,25);
	_button.graphics.lineTo(30,15);
	_button.graphics.lineTo(50,15);
	_button.graphics.lineTo(50,35);
	_button.graphics.lineTo(30,35);
	_button.graphics.lineTo(20,25);
	_button.graphics.endFill();
	_button.graphics.lineStyle(2,CONFIG.colors.CANCEL);
	_button.graphics.moveTo(35,21);
	_button.graphics.lineTo(43,29);
	_button.graphics.moveTo(35,29);
	_button.graphics.lineTo(43,21);
	m.buttons.push(_button);
	m.addChild(_button);
	i+=1.5;
	_button=button_constructBasic({label:"ENTER",bgColor:CONFIG.colors.CONFIRM,labelStyle:{fill:0xffffff,fontSize:14},width:70,height:50,output:function(){_output({key:"Enter"})}});
	_button.y=10;
	_button.x=800-85;
	m.buttons.push(_button);
	m.addChild(_button);
	i+=1;
	m.animateAdd=function(){
		JMBL.tweenTo(this,10,{y:stageBorders.bot-80});
	}
	
	m.animateRemove=function(){
		JMBL.tweenTo(this,10,{y:stageBorders.bot+80});
	}

	m.inBounds=function(x,y){
		if (y>this.y && y<this.y+80) return true;
		return false;
	}

	return m;
}

function window_makeKeyboardButton(s,x,keyboard,_output){
	let _button=button_constructBasic({label:s,labelStyle:{fill:0xffffff,fontSize:20},width:50,height:50,output:function(){_output({key:s})}});
	_button.y=10;
	_button.x=x;
	keyboard.buttons.push(_button);
	keyboard.addChild(_button);
}