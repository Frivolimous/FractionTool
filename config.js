const CONFIG={
	sizing:{
		tileSize:{width:50,height:35,rounding:2.5,font:18},
		signSize:{width:35,height:35,rounding:5,font:18,shadowY:4},
		bracketSize:{font:32,width:3,textY:-24},
		tileSpacing:5,
		mainAlign:{x:100,y:230},
		fractionMargin:25,
		fractionSelection:{width:15,height:100,rounding:5},
		factorSize:{width:75,height:30,rounding:2,font:18},
		factorOffset:{base:40,scale:30},
		lineSize:{height:2,rounding:2},
		inputWindow:{width:210,height:45,rounding:5,spacing:30},
		inputBox:{x:117.5,y:4.5,width:48,height:35,rounding:5},
		inputLabel:{x:38,y:15,font:12},
		inputText:{x:120,y:13,font:18},
		inputCaret:{y:0,width:2,height:18},
		inputOK:{x:170,y:8,width:32,height:29,font:12,rounding:3},
		inputCancel:{x:0,y:0,width:30,height:45,font:15,rounding:5},
		ropeSize:3,
		errorWindow:{x:300,y:400,width:200,height:20,font:12},
		errorX:{x:191,y:1,width:7,height:7},
		fontFamily:"Lato",
	},
	colors:{
		RED:0xE14356,
		ORANGE:0xff9901,
		CONFIRM:0x60717C,
		CANCEL:0x333333,
		NUMBER_NEUTRAL:0xffffff,
		NUMBER:0x3399ff,
		NUMBER_TEXT:0xffffff,
		SIGN:0x333C42,
		SIGN_SHADOW:0x242A2E,
		SIGN_TEXT:0xffffff,
		FACTOR:0xffffff,
		FACTOR_BORDER:0xEDEEF0,
		FACTOR_LINE:0x868C94,
		SELECTED:0x33ccff,
		SOFT:0xff9901,
		VALID:0x2BD372,
		BACKGROUND:0xE3E7ED,
		BLANK:0xffffff,
		WHITE:0xffffff,
		BOX:0x333333,
		BOX_BORDER:0x999999,
		BLACK:0x333333,
	},
	maxFactors:3,
	moveSpeed:0.3,
	text:{
		SIMPLIFY:"SIMPLIFY BY:",
		AMPLIFY:"AMPLIFY BY:",
	}
}

const OPTIONS={
	//NEW LIST!!!!
	combineNNDD:false, //Allow you to multiply numerators and denominators of different fractions?
	//true, false









	//OLD LIST!!!!
	factorMinusOverride:"both",
	//true, false, "both"
	combineFactors:"input",
	//true, false, "-1", "input"
	combineCommon:"input",
	//false,true,"input"
	combineNot:"input",
	//false,"input"
	cancelNegatives:false,
	//true,false,"both"
	moveAcrossFractions:true,
	//true,false
	allowSubAddInside:false,
	//true,false
	allowSubAddFractions:false,
	//true,false
	forceMultFirstOrderOp:true,
	//true,false
	forceLeftToRight:"mixed",
	//true,false,"mixed"
	onlyAdjacentOperations:false,
	//true,false,
	allowSubFractionMultipleNumerators:"brackets",
	//true,false,"brackets"
	numeratorsAcrossAddition:false,
	//true,false,"fraction"
	divisorsAcrossAddition:false,
	//true,false
	amplifySolves:"solo",
	//false, true, "solo"
	mustBracketsFirst:true, //force bracketed terms first within an order op
	//true, false
	allowCancelOtherExpression:true,
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
	DIVISION_FIRST:"Compute the Division First",
	//if 'force multiplication first' and soft error, or general ORDER OF OPERATIONS that has to do with this.
	BRACKET_FIRST:"Compute the Brackets First",
	SAME_DENOMINATOR:"Denominators must be the same.",
	//addition/subtraction with different denominators
	FACTOR_FIRST:"Try factoring first.",

	CANNOT_CANCEL:"Cannot Cancel These",

	ERROR:"Real Error - this should not happen",
}

const LEVELS={
	current:0,
	customLevel:"",
	loadLevel:function(i){
		if (LEVELS.current==-1){
			if (i==0){
				game_loadGame(LEVELS.customLevel);
				return;
			}else{
				LEVELS.current=0;
			}
		}else{
			LEVELS.current+=i;
			LEVELS.current=Math.max(LEVELS.current,0);
		}

		if (LEVELS.current>=LEVELS.levelData.length){
			LEVELS.current=LEVELS.levelData.length;
			ui_updateLevelText(LEVELS.current,"END OF VARIANTS");
			game_loadGame(null);
		}else{
			ui_updateLevelText(LEVELS.current,LEVELS.levelData[LEVELS.current].title);
			game_loadGame(LEVELS.levelData[LEVELS.current].expression);
		}
	},


	/*****************
		FORMAT
	[A/B] is a fraction 
	/A/B/ is also accepted
	signs: +-:* automatically converted to what they need to be
	Nested fractions are not supported
	: within a fraction is not supported
	Exponents and Variables are not supported
	*****************/

	levelData:[{title:"Multiplication",expression:"[2/3]*[3/4]"},
				{title:"Addition",expression:"[5/2]+[8/3]"},
				{title:"Subtraction",expression:"[2/12]-[4/15]"},
				{title:"Division",expression:"[10/4]:[5/8]"},
				{title:"Negatives 1",expression:"[-7/2]*[-5/-3]*[7-5/2-7]"},
				{title:"Negatives 2",expression:"[-7/2]+[-5/-2]-[7-5/2-7]"},
				{title:"Long Expressions",expression:"[6-4+7-3-2*2/2*4+7-3*2*2]"},
				{title:"Large Mult",expression:"[96/377]*[403/256]"},
				{title:"Large Add",expression:"[704/640]+[448/256]"},
				{title:"Mult Add",expression:"[5/5]*[6/7]+[24/21]"},
				{title:"Sub Add",expression:"[3/5]-[20/10]+[2/5]"},
				{title:"Sub Div",expression:"[8/5]-[8/3]:[8/3]"},
				{title:"Lots of Mults",expression:"[1/2]*[3/4]*[5/6]:[7/8]*[9/10]"},
				{title:"Comparing",expression:"[2/3];[5/6];[7/12]"},
				{title:"Sums then Prods",expression:"[2+3/3+5]*[3+4/4+5]"},
				{title:"Brackets",expression:"[6+7*(2+2*4)/2*(7+5*(3+2))]"},
				{title:"Long Addition",expression:"[3+4+5+6+7+8/3+4+5+6-7+8]"}],
}

function loadCustomLevel(s){
	//Can call this from the CONSOLE to test any level
	LEVELS.customLevel=s;
	ui_updateLevelText("-","Custom");
	LEVELS.current=-1;
	game_loadGame(s);
}