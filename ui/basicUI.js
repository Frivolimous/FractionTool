let uiM={
	bottomBar:null,
	levelText:null,
	rulesText:null,
};

function ui_updateLevelText(i,s){
	uiM.levelText.text="Level "+i;
	if (s!=null) uiM.levelText.text+=": "+s
}
function ui_overrideLevelText(s){
	uiM.levelText.text=s;
}

function ui_setRulesText(s){
	uiM.rulesText.text=s;
}

function ui_init(){
	uiM.bottomBar=window_bottomBar();
	app.stage.addChild(uiM.bottomBar);
	let _button=button_constructBasic({label:"Amplify",labelStyle:{fill:0xffffff,fontSize:14},width:80,height:40,output:game_startAmplify});
	uiM.bottomBar.addChild(_button);
	_button.x=50;
	_button.y=20;

	_button=button_constructBasic({label:"Rules",labelStyle:{fill:0xffffff,fontSize:14},width:80,height:40,output:config_changeOptionSet});
	uiM.bottomBar.addChild(_button);
	_button.x=530;
	_button.y=30;

	_button=button_constructBasic({width:40,height:40,output:function(){LEVELS.loadLevel(-1)}});
	_button.x=640;
	_button.y=30;
	_button.graphics.beginFill(0xffffff);
	_button.graphics.moveTo(32,8);
	_button.graphics.lineTo(8,20);
	_button.graphics.lineTo(32,32);
	_button.graphics.lineTo(32,8);
	uiM.bottomBar.addChild(_button);

	_button=button_constructBasic({width:40,height:40,output:function(){LEVELS.loadLevel(0)}});
	_button.x=690;
	_button.y=30;
	_button.graphics.beginFill(0xffffff);
	_button.graphics.drawCircle(20,20,12);
	uiM.bottomBar.addChild(_button);

	_button=button_constructBasic({width:40,height:40,output:function(){LEVELS.loadLevel(1)}});
	_button.x=740;
	_button.y=30;
	_button.graphics.beginFill(0xffffff);
	_button.graphics.moveTo(8,8);
	_button.graphics.lineTo(32,20);
	_button.graphics.lineTo(8,32);
	_button.graphics.lineTo(8,8);
	uiM.bottomBar.addChild(_button);

	uiM.levelText=new PIXI.Text("Level 0",{fill:0x6060ee,fontWeight:"bold",fontSize:14});
	uiM.levelText.x=640;
	uiM.levelText.y=10;
	uiM.bottomBar.addChild(uiM.levelText);
	uiM.rulesText=new PIXI.Text("RULES",{fill:0x6060ee,fontWeight:"bold",fontSize:14});
	uiM.rulesText.x=532;
	uiM.rulesText.y=10;
	uiM.bottomBar.addChild(uiM.rulesText);
}

function ui_onTick(_delta){
	
}