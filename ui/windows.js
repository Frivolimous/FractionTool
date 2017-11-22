function window_bottomBar(){
	var m=uiElement_basic({width:stageBorders.right,height:80,y:stageBorders.bot-80,bgColor:CONFIG.colors.BOX});
	m.animateAdd=function(){
		console.log("A");
		JMBL.tweenTo(this,10,{y:stageBorders.bot-80});
	}
	
	m.animateRemove=function(){
		console.log("B");
		JMBL.tweenTo(this,10,{y:stageBorders.bot+80});
	}
	return m;
}

function window_virtualKeyboard(_output){
	var m=uiElement_basic({width:stageBorders.right,height:80,y:stageBorders.bot+80,bgColor:CONFIG.colors.BOX});
	m.buttons=[];
	window_makeKeyboardButton("1",25,m,_output);
	window_makeKeyboardButton("2",75,m,_output);
	window_makeKeyboardButton("3",125,m,_output);
	window_makeKeyboardButton("4",175,m,_output);
	window_makeKeyboardButton("5",225,m,_output);
	window_makeKeyboardButton("6",275,m,_output);
	window_makeKeyboardButton("7",325,m,_output);
	window_makeKeyboardButton("8",375,m,_output);
	window_makeKeyboardButton("9",425,m,_output);
	window_makeKeyboardButton("0",475,m,_output);
	window_makeKeyboardButton("-",525,m,_output);

	let _button=button_constructBasic({label:"DEL",labelStyle:{fill:0xffffff,fontSize:14},width:60,height:40,output:function(){_output({key:"Backspace"})}});
	_button.y=10;
	_button.x=575;
	m.buttons.push(_button);
	m.addChild(_button);

	m.animateAdd=function(){
		console.log("A");
		JMBL.tweenTo(this,10,{y:stageBorders.bot-80});
	}
	
	m.animateRemove=function(){
		console.log("B");
		JMBL.tweenTo(this,10,{y:stageBorders.bot+80});
	}

	m.inBounds=function(x,y){
		if (y>this.y && y<this.y+80) return true;
		return false;
	}

	return m;
}

function window_makeKeyboardButton(s,x,keyboard,_output){
	let _button=button_constructBasic({label:s,labelStyle:{fill:0xffffff,fontSize:20},width:40,height:40,output:function(){_output({key:s})}});
	_button.y=10;
	_button.x=x;
	keyboard.buttons.push(_button);
	keyboard.addChild(_button);
}