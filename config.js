const CONFIG={
	margins:{
		tileSize:50,
		tileSpacing:10,
	},
	formula:"3/4*5/3",
	errorLoc:{x:300,y:400},
	colors:{
		RED:0xff0000,
		NUMBER_NEUTRAL:0xffffff,
		NUMBER:0x3399ff,
		NUMBER_TEXT:0xffffff,
		SIGN:0xf9f9f9,
		SIGN_TEXT:0,
		FACTOR:0xeeeeee,
		SELECTED:0xff9900,
		BACKGROUND:0xffffff,
		BLANK:0xffffff,
		WHITE:0xffffff,
		BOX:0xf1f1f1,
		BOX_BORDER:0x999999,
	}
}

const OPTIONS={
	setUsed:-1,

	factorUsing:"input",
	//"pairs","primes","input",
	factorsWhileDraging:true,
	//true,false //disabled if factorUsing is input
	factorMinusOverride:false,
	//true, false
	combineFactors:"input",
	//true, false, "-1", "input"
	combineCommon:"input",
	//false,true,"input"
	combineNot:"input",
	//false,"input"
	errorDisplay:"clickable",
	//"timed","clickable"
	showSoftErrors:true,
	//true,false
	showHardErrors:false,
	//true,false
	moveAcrossFractions:true,
	//true,false
	allowSubAddInside:true,
	//true,false
	allowSubAddFractions:false,
	//true,false
	forceMultFirstOrderOp:false,
	//true,false
	onlyAdjacentOperations:false,
	//true,false
	allowSubFractionMultipleNumerators:true,
	//true,false
	numeratorsAcrossAddition:true,
	//true,false,"fraction"
	divisorsAcrossAddition:true,
	//true,false
	amplifyInSimpList:true,
	//true,false
	factorList:"bubbles",
	//"dropdown","bubbles"
}

const ERROR={
	ORDER_OP:"Follow Order of Operations",
	//multiply fractions that contain addition or subtraction
	//attempting to take something between two fractions that are not being multiplied (ie a/b+c/d > 1/b+a*c/d)
	COMBINE_FIRST:"Combine Fractions First.",
	//if option 'moveAcrossFractions==false' and attempting to work across two different fractions
	SUBTRACT_FIRST:"Follow Order of Operations",
	//if attempting to do an operation following a negative value (and option enabled)
}

const LEVELS={
	current:0,

	loadLevel:function(i){
		LEVELS.current+=i;
		LEVELS.current=Math.max(LEVELS.current,0);
		LEVELS.current=Math.min(LEVELS.current,LEVELS.data.length);
		game_clearGame();
		config_loadLevel(LEVELS.current);
		//ui_updateLevelText(LEVELS.current);
	},

	data:new Array(17),
}

function config_changeOptionSet(){
	OPTIONS.setUsed+=1;
	if (OPTIONS.setUsed>1) OPTIONS.setUsed=0;
	switch(OPTIONS.setUsed){
		case 0:
			ui_setRulesText("Standard");
			OPTIONS.factorUsing="pairs";
			//"pairs","primes","input",
			OPTIONS.factorsWhileDraging=false;
			//true,false //disabled if factorUsing is input
			OPTIONS.factorMinusOverride="full";
			//true, false, "full"
			OPTIONS.combineFactors="input";
			//true, false, "-1", "input"
			OPTIONS.combineCommon="input";
			//false,true,"input"
			OPTIONS.combineNot="input";
			//false,"input"
			OPTIONS.errorDisplay="clickable";
			//"timed","clickable"
			OPTIONS.showSoftErrors=true;
			//true,false
			OPTIONS.showHardErrors=false;
			//true,false
			OPTIONS.moveAcrossFractions=false;
			//true,false
			OPTIONS.allowSubAddInside=false;
			//true,false
			OPTIONS.allowSubAddFractions=false;
			//true,false
			OPTIONS.forceMultFirstOrderOp=true;
			//true,false
			OPTIONS.onlyAdjacentOperations=true;
			//true,false
			OPTIONS.allowSubFractionMultipleNumerators=false;
			//true,false
			OPTIONS.numeratorsAcrossAddition=false;
			//true,false,"fraction"
			OPTIONS.divisorsAcrossAddition=false;
			//true,false
			OPTIONS.amplifyInSimpList=false;
			//true,false
			OPTIONS.factorList="dropdown";
			//"dropdown","bubbles"
			break;
		case 1:
			ui_setRulesText("Freedom");
			OPTIONS.factorUsing="pairs";
			//"pairs","primes","input",
			OPTIONS.factorsWhileDraging=true;
			//true,false //disabled if factorUsing is input
			OPTIONS.factorMinusOverride=true;
			//true, false, "full"
			OPTIONS.combineFactors=true;
			//true, false, "-1", "input"
			OPTIONS.combineCommon="input";
			//false,true,"input"
			OPTIONS.combineNot=false;
			//false,"input"
			OPTIONS.errorDisplay="clickable";
			//"timed","clickable"
			OPTIONS.showSoftErrors=false;
			//true,false
			OPTIONS.showHardErrors=false;
			//true,false
			OPTIONS.moveAcrossFractions=true;
			//true,false
			OPTIONS.allowSubAddInside=true;
			//true,false
			OPTIONS.allowSubAddFractions=true;
			//true,false
			OPTIONS.forceMultFirstOrderOp=false;
			//true,false
			OPTIONS.onlyAdjacentOperations=false;
			//true,false
			OPTIONS.allowSubFractionMultipleNumerators=true;
			//true,false
			OPTIONS.numeratorsAcrossAddition=true;
			//true,false,"fraction"
			OPTIONS.divisorsAcrossAddition=true;
			//true,false
			OPTIONS.amplifyInSimpList=true;
			//true,false
			OPTIONS.factorList="dropdown";
			//"dropdown","bubbles"
			break;
		case 2:
			ui_setRulesText("Full Input");
			OPTIONS.factorUsing="input";
			//"pairs","primes","input",
			OPTIONS.factorsWhileDraging=false;
			//true,false //disabled if factorUsing is input
			OPTIONS.factorMinusOverride=false;
			//true, false, "full"
			OPTIONS.combineFactors="input";
			//true, false, "-1", "input"
			OPTIONS.combineCommon="input";
			//false,true,"input"
			OPTIONS.combineNot="input";
			//false,"input"
			OPTIONS.errorDisplay="clickable";
			//"timed","clickable"
			OPTIONS.showSoftErrors=true;
			//true,false
			OPTIONS.showHardErrors=true;
			//true,false
			OPTIONS.moveAcrossFractions=false;
			//true,false
			OPTIONS.allowSubAddInside=false;
			//true,false
			OPTIONS.allowSubAddFractions=false;
			//true,false
			OPTIONS.forceMultFirstOrderOp=false;
			//true,false
			OPTIONS.onlyAdjacentOperations=true;
			//true,false
			OPTIONS.allowSubFractionMultipleNumerators=false;
			//true,false
			OPTIONS.numeratorsAcrossAddition=false;
			//true,false,"fraction"
			OPTIONS.divisorsAcrossAddition=false;
			//true,false
			OPTIONS.amplifyInSimpList=true;
			//true,false
			OPTIONS.factorList="dropdown";
			//"dropdown","bubbles"
			break;
	}
}

function config_loadLevel(i){
	if (OPTIONS.setUsed==-1) config_changeOptionSet();
	if (i==null) i=0;
	gameM.mainExpression=myObj_makeExpression();
	gameM.mainExpression.goTo(100,230);	
	switch(i){
		case 0:
			ui_updateLevelText(LEVELS.current,"Multiplication");
			gameM.mainExpression.addObject(game_makeNewFraction(["2"],["3"]));
			gameM.mainExpression.addObject(game_addNewBlock("*"));
			gameM.mainExpression.addObject(game_makeNewFraction(["3"],["4"]));
			break;
		case 1:
			ui_updateLevelText(LEVELS.current,"Addition");
			gameM.mainExpression.addObject(game_makeNewFraction(["5"],["2"]));
			gameM.mainExpression.addObject(game_addNewBlock("+"));
			gameM.mainExpression.addObject(game_makeNewFraction(["8"],["3"]));
			break;
		case 2:
			ui_updateLevelText(LEVELS.current,"Subtraction");
			gameM.mainExpression.addObject(game_makeNewFraction(["2"],["12"]));
			gameM.mainExpression.addObject(game_addNewBlock("-"));
			gameM.mainExpression.addObject(game_makeNewFraction(["4"],["15"]));
			break;
		case 3:
			ui_updateLevelText(LEVELS.current,"Division");

			gameM.mainExpression.addObject(game_makeNewFraction(["10"],["4"]));
			gameM.mainExpression.addObject(game_addNewBlock(":"));
			gameM.mainExpression.addObject(game_makeNewFraction(["5"],["8"]));
			break;
		case 4:
			ui_updateLevelText(LEVELS.current,"Negatives 1");
			gameM.mainExpression.addObject(game_makeNewFraction(["-7"],["2"]));
			gameM.mainExpression.addObject(game_addNewBlock("*"));
			gameM.mainExpression.addObject(game_makeNewFraction(["-5"],["-3"]));
			gameM.mainExpression.addObject(game_addNewBlock("*"));
			gameM.mainExpression.addObject(game_makeNewFraction(["7","-","5"],["2","-","7"]));
			break;
		case 5:
			ui_updateLevelText(LEVELS.current,"Negatives 2");
			gameM.mainExpression.addObject(game_makeNewFraction(["-7"],["2"]));
			gameM.mainExpression.addObject(game_addNewBlock("+"));
			gameM.mainExpression.addObject(game_makeNewFraction(["-5"],["-2"]));
			gameM.mainExpression.addObject(game_addNewBlock("-"));
			gameM.mainExpression.addObject(game_makeNewFraction(["7","-","5"],["2","-","7"]));
			break;
		case 6:
			ui_updateLevelText(LEVELS.current,"Long Expressions");
			gameM.mainExpression.x-=50;
			gameM.mainExpression.addObject(game_makeNewFraction(["6","-","4","+","7","-","3","-","2","*","2"],["2","*","4","+","7","-","3","*","2","*","2"]));
			break;
		case 7:
			ui_updateLevelText(LEVELS.current,"Large Mult");
			gameM.mainExpression.addObject(game_makeNewFraction(["96"],["377"]));
			gameM.mainExpression.addObject(game_addNewBlock("*"));
			gameM.mainExpression.addObject(game_makeNewFraction(["403"],["256"]));
			break;
		case 8:
			ui_updateLevelText(LEVELS.current,"Large Add");
			gameM.mainExpression.addObject(game_makeNewFraction(["704"],["640"]));
			gameM.mainExpression.addObject(game_addNewBlock("+"));
			gameM.mainExpression.addObject(game_makeNewFraction(["448"],["256"]));
			break;
		case 9:
			ui_updateLevelText(LEVELS.current,"Mult Add");
			gameM.mainExpression.addObject(game_makeNewFraction(["5"],["5"]));
			gameM.mainExpression.addObject(game_addNewBlock("*"));
			gameM.mainExpression.addObject(game_makeNewFraction(["6"],["7"]));
			gameM.mainExpression.addObject(game_addNewBlock("+"));
			gameM.mainExpression.addObject(game_makeNewFraction(["24"],["21"]));
			break;
		case 10:
			ui_updateLevelText(LEVELS.current,"Sub Add");
			gameM.mainExpression.addObject(game_makeNewFraction(["3"],["5"]));
			gameM.mainExpression.addObject(game_addNewBlock("-"));
			gameM.mainExpression.addObject(game_makeNewFraction(["20"],["10"]));
			gameM.mainExpression.addObject(game_addNewBlock("+"));
			gameM.mainExpression.addObject(game_makeNewFraction(["2"],["5"]));
			break;
		case 11:
			ui_updateLevelText(LEVELS.current,"Sub Div");
			gameM.mainExpression.addObject(game_makeNewFraction(["8"],["5"]));
			gameM.mainExpression.addObject(game_addNewBlock("-"));
			gameM.mainExpression.addObject(game_makeNewFraction(["8"],["3"]));
			gameM.mainExpression.addObject(game_addNewBlock(":"));
			gameM.mainExpression.addObject(game_makeNewFraction(["8"],["3"]));
			break;
		case 12:
			ui_updateLevelText(LEVELS.current,"Lots of Mults");
			gameM.mainExpression.addObject(game_makeNewFraction(["1"],["2"]));
			gameM.mainExpression.addObject(game_addNewBlock("*"));
			gameM.mainExpression.addObject(game_makeNewFraction(["3"],["4"]));
			gameM.mainExpression.addObject(game_addNewBlock("*"));
			gameM.mainExpression.addObject(game_makeNewFraction(["5"],["6"]));
			gameM.mainExpression.addObject(game_addNewBlock(":"));
			gameM.mainExpression.addObject(game_makeNewFraction(["7"],["8"]));
			gameM.mainExpression.addObject(game_addNewBlock("*"));
			gameM.mainExpression.addObject(game_makeNewFraction(["9"],["10"]));
			break;
		default:
			ui_updateLevelText(LEVELS.current,"END OF VARIANTS");
			break;
	}
}