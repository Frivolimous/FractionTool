const CONFIG={
	margins:{
		tileSize:50,
		tileSpacing:10,
	},
	formula:"3/4*5/3",
	errorLoc:{x:300,y:400},
	colors:{
		RED:0xff0000,
		ORANGE:0xff9900,
		CONFIRM:0x337733,
		CANCEL:0x773333,
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
		BLACK:0x333333,
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
	commonText:"factorOf",
	//"simplify", "factorOf",
	combineCommon:"input",
	//false,true,"input"
	combineNot:"input",
	//false,"input"
	errorDisplay:"clickable",
	//"timed","clickable"
	cancelNegatives:true,
	//true,false
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
	forceLeftToRight:"mixed",
	//true,false,"mixed"
	onlyAdjacentOperations:false,
	//true,false,
	allowSubFractionMultipleNumerators:true,
	//true,false,"brackets"
	numeratorsAcrossAddition:true,
	//true,false,"fraction"
	divisorsAcrossAddition:true,
	//true,false
	amplifyInSimpList:true,
	//true,false
	amplifySolves:false,
	//false, true, "solo"
	factorList:"bubbles",
	//"dropdown","bubbles"
	allowCancelOtherExpression:false,
	//true,false
	allowMergeMakeBrackets:true,
	//true,false
}

const ERROR={
	ORDER_OP:"Follow Order of Operations",
	//multiply fractions that contain addition or subtraction
	//attempting to take something between two fractions that are not being multiplied (ie a/b+c/d > 1/b+a*c/d)
	COMBINE_FIRST:"Combine Fractions First.",
	//if option 'moveAcrossFractions==false' and attempting to work across two different fractions
	SUBTRACT_FIRST:"Follow Order of Operations",
	//if attempting to do an operation following a negative value (and option enabled)
	LEFT_TO_RIGHT:"Work Left to Right",
	//if 'work left to right' is enabled
	DIVISION_FIRST:"Click the Division First",
	//if left to right is enabled and a division is blocking pure multiplication, or if trying to work across a division
	MULTIPLICATION_FIRST:"Compute the Multiplication First",
	//if 'force multiplication first' and soft error, or general ORDER OF OPERATIONS that has to do with this.
	SAME_DENOMINATOR:"Denominators must be the same.",
	//addition/subtraction with different denominators
}

const LEVELS={
	current:0,

	loadLevel:function(i){
		if (LEVELS.current==-1 && i!=0) {
			LEVELS.current=0;
		}else{
			LEVELS.current+=i;
			LEVELS.current=Math.max(LEVELS.current,0);
		}
		game_clearGame();
		config_loadLevel(LEVELS.current);
		//ui_updateLevelText(LEVELS.current);
	},
}

function config_changeOptionSet(){
	OPTIONS.setUsed+=1;
	if (OPTIONS.setUsed>1) OPTIONS.setUsed=0;
	switch(OPTIONS.setUsed){
		case 0:
			ui_setRulesText("Standard");
			OPTIONS.factorUsing="pairs";
			//"pairs","primes","input",
			OPTIONS.factorsWhileDraging="noclose";
			//true,false, "noclose" //disabled if factorUsing is input
			OPTIONS.factorMinusOverride="both"; //STILL UNCLEAR
			//true, false, "full","both"
			OPTIONS.commonText="simplify";
			//"simplify", "factorOf"
			OPTIONS.combineFactors="input";
			//true, false, "-1", "input"
			OPTIONS.combineCommon="input";
			//false,true,"input"
			OPTIONS.combineNot="input";
			//false,"input"
			OPTIONS.errorDisplay="clickable";
			//"timed","clickable"
			OPTIONS.cancelNegatives="both";
			//true,false,"both"
			OPTIONS.showSoftErrors=true; //Orange Feedback, show as ORANGE
			//true,false
			OPTIONS.showHardErrors=true; // Disconnect Feedback, show the ERROR MESSAGE
			//true,false
			OPTIONS.moveAcrossFractions=true;
			//true,false
			OPTIONS.allowSubAddInside=false;
			//true,false
			OPTIONS.allowSubAddFractions=false;
			//true,false
			OPTIONS.forceMultFirstOrderOp=true;
			//true,false
			OPTIONS.onlyAdjacentOperations=false;
			//true,false
			OPTIONS.allowSubFractionMultipleNumerators="brackets";
			//true,false
			OPTIONS.numeratorsAcrossAddition=false;
			//true,false,"fraction"
			OPTIONS.divisorsAcrossAddition=false; 
			//true,false
			OPTIONS.amplifyInSimpList=true;
			//true,false
			OPTIONS.amplifySolves="solo";
			//false, true, "solo"
			OPTIONS.factorList="dropdown";
			//"dropdown","bubbles"
			OPTIONS.allowCancelOtherExpression=true;
			//true,false
			OPTIONS.allowMergeMakeBrackets=true;
			//true,false
			break;
		case 1:
			ui_setRulesText("Freedom");
			OPTIONS.factorUsing="pairs";
			//"pairs","primes","input",
			OPTIONS.factorsWhileDraging="noclose";
			//true,false //disabled if factorUsing is input
			OPTIONS.factorMinusOverride=false;
			//true, false, "full"
			OPTIONS.commonText="simplify";
			//"simplify", "factorOf"
			OPTIONS.combineFactors="input";
			//true, false, "-1", "input"
			OPTIONS.combineCommon="input";
			//false,true,"input"
			OPTIONS.combineNot="input";
			//false,"input"
			OPTIONS.errorDisplay="clickable";
			//"timed","clickable"
			OPTIONS.cancelNegatives=true;
			//true,false
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
			OPTIONS.numeratorsAcrossAddition=false;
			//true,false,"fraction"
			OPTIONS.divisorsAcrossAddition=false;
			//true,false
			OPTIONS.amplifyInSimpList=true;
			//true,false
			OPTIONS.amplifySolves="solo";
			//false, true, "solo"
			OPTIONS.factorList="dropdown";
			//"dropdown","bubbles"
			OPTIONS.allowCancelOtherExpression=false;
			//true,false
			OPTIONS.allowMergeMakeBrackets=false;
			//true,false
			break;
		case 2:
			ui_setRulesText("Standard");
			OPTIONS.factorUsing="pairs";  // NOT DISCUSSED BUT OK?
			//"pairs","primes","input",
			OPTIONS.factorsWhileDraging=false; // LISTS DONT CLOSE 
			//true,false //disabled if factorUsing is input
			OPTIONS.factorMinusOverride="full"; //-1 pulled out AND decomposition list opens
			//true, false, "full"
			OPTIONS.combineFactors="input"; //yes
			//true, false, "-1", "input"
			OPTIONS.combineCommon="input"; //yes
			//false,true,"input"
			OPTIONS.combineNot="input"; //yes
			//false,"input"
			OPTIONS.errorDisplay="clickable"; // who cares
			//"timed","clickable"
			OPTIONS.cancelNegatives=false; // yes, and input opens if common divisor exists
			//true,false
			OPTIONS.showSoftErrors=true;
			//true,false
			OPTIONS.showHardErrors=false;
			//true,false
			OPTIONS.moveAcrossFractions=false; // multiplication yes, addition no.
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
			OPTIONS.numeratorsAcrossAddition=false; // false
			//true,false,"fraction"
			OPTIONS.divisorsAcrossAddition=false; // false
			//true,false
			OPTIONS.amplifyInSimpList=false; //true
			//true,false
			OPTIONS.factorList="dropdown"; // dropdown
			//"dropdown","bubbles"
			break;
		case 3:
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
			OPTIONS.cancelNegatives=true;
			//true,false
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
		case 4:
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
			OPTIONS.cancelNegatives=false;
			//true,false
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
			game_makeNewProblem("[2/3]*[3/4]");
			break;
		case 1:
			ui_updateLevelText(LEVELS.current,"Addition");
			game_makeNewProblem("[5/2]+[8/3]");
			break;
		case 2:
			ui_updateLevelText(LEVELS.current,"Subtraction");
			game_makeNewProblem("[2/12]-[4/15]");
			break;
		case 3:
			ui_updateLevelText(LEVELS.current,"Division");
			game_makeNewProblem("[10/4]:[5/8]");
			break;
		case 4:
			ui_updateLevelText(LEVELS.current,"Negatives 1");
			game_makeNewProblem("[-7/2]*[-5/-3]*[7-5/2-7]");
			break;
		case 5:
			ui_updateLevelText(LEVELS.current,"Negatives 2");
			game_makeNewProblem("[-7/2]+[-5/-2]-[7-5/2-7]");
			break;
		case 6:
			ui_updateLevelText(LEVELS.current,"Long Expressions");
			gameM.mainExpression.x-=50;
			game_makeNewProblem("[6-4+7-3-2*2/2*4+7-3*2*2]");
			break;
		case 7:
			ui_updateLevelText(LEVELS.current,"Large Mult");
			game_makeNewProblem("[96/377]*[403/256]");
			break;
		case 8:
			ui_updateLevelText(LEVELS.current,"Large Add");
			game_makeNewProblem("[704/640]+[448/256]");
			break;
		case 9:
			ui_updateLevelText(LEVELS.current,"Mult Add");
			game_makeNewProblem("[5/5]*[6/7]+[24/21]");
			break;
		case 10:
			ui_updateLevelText(LEVELS.current,"Sub Add");
			game_makeNewProblem("[3/5]-[20/10]+[2/5]");
			break;
		case 11:
			ui_updateLevelText(LEVELS.current,"Sub Div");
			game_makeNewProblem("[8/5]-[8/3]:[8/3]");
			break;
		case 12:
			ui_updateLevelText(LEVELS.current,"Lots of Mults");
			game_makeNewProblem("[1/2]*[3/4]*[5/6]:[7/8]*[9/10]");
			break;
		case 13:
			ui_updateLevelText(LEVELS.current,"Comparing");
			game_makeNewProblem("[2/3];[5/6];[7/12]");
			break;
		case 14:
			ui_updateLevelText(LEVELS.current,"Sums then Prods");
			game_makeNewProblem("[2+3/3+5]*[3+4/4+5]");
			break;
		case 15:
			ui_updateLevelText(LEVELS.current,"Brackets");
			game_makeNewProblem("[6+7*(2+2*4)/2*(7+5*(3+2))]");
			gameM.mainExpression.goTo(50,230);
			break;
		case 16:
			ui_updateLevelText(LEVELS.current,"Long Addition");
			game_makeNewProblem("[3+4+5+6+7+8/3+4+5+6-7+8]");
			break;
		case -1:
			ui_updateLevelText("-","Custom");
			game_makeNewProblem(CUSTOM_LEVEL);
			break;
		default:
			ui_updateLevelText(LEVELS.current,"END OF VARIANTS");
			gameM.mainExpression.goTo(10,230);
			break;
	}
}

var CUSTOM_LEVEL="";

function loadCustomLevel(s){
	CUSTOM_LEVEL=s;
	LEVELS.current=-1;
	game_clearGame();
	if (OPTIONS.setUsed==-1) config_changeOptionSet();
	gameM.mainExpression=myObj_makeExpression();
	gameM.mainExpression.goTo(100,230);	
	ui_updateLevelText("-","Custom");
	game_makeNewProblem(s);
}