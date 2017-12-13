
//== Main Initialization ==\\
var interactionMode="desktop";
var _Resolution=2;
try{
	document.createEvent("TouchEvent");
	interactionMode="mobile";
}catch(e){
	//interactionMode="desktop";
}
let stageBorders={left:0,top:0,right:800/_Resolution,bot:500/_Resolution};
var app = new PIXI.Application(stageBorders.right-stageBorders.left,stageBorders.bot-stageBorders.top,{
	backgroundColor:0xffffff,
	antialias:true,
	resolution:_Resolution,
	roundPixels:true,
});
stageBorders.right*=_Resolution;
stageBorders.bot*=_Resolution;

document.getElementById("game-canvas").append(app.view);
app.stage.scale.x=1/_Resolution;
app.stage.scale.y=1/_Resolution;
stageBorders.left=app.view.offsetLeft;
stageBorders.top=app.view.offsetTop;

//== Initialize Variables for use ==\\

//keybard, mobile, mouse



//== Initialize Supporting Structures ==\\
app.stage.interactive=true;
window.addEventListener("resize",function(){
	stageBorders.left=app.view.offsetLeft;
	stageBorders.top=app.view.offsetTop;
});

let _background=new PIXI.Graphics();
_background.beginFill(CONFIG.colors.BACKGROUND);
_background.lineStyle(1,0);
_background.drawRect(0,0,stageBorders.right,stageBorders.bot);
app.stage.addChild(_background);

//== Initialize Game Elements ==\\



//== Utility Functions ==\\
// (Call These)
function nullFunc(){}


//== Support Functions ==\\
// (Don't Call These)

//== Initialize the game after everything is setup ==\\
game_init();
ui_init();
input_init(gameM.gameStage);
LEVELS.loadLevel(0);