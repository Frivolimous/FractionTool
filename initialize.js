
//== Main Initialization ==\\
var interactionMode="desktop";
var _Resolution=1;
try{
	document.createEvent("TouchEvent");
	interactionMode="mobile";
}catch(e){
	//interactionMode="desktop";
}
let stageBorders={left:0,top:0,right:800,bot:500};
var app = new PIXI.Application(stageBorders.right-stageBorders.left,stageBorders.bot-stageBorders.top,{
	backgroundColor:0xff0000,
	antialias:true,
	resolution:_Resolution,
	roundPixels:true,
});

document.getElementById("game-canvas").append(app.view);
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
EventManager_init();

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