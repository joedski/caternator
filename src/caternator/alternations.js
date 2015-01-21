// Core classes for the run time.
// These are instantiated with the data parsed out by the compiler.

var util = require( './util' );
var Map = this.Map || util.Map;



////////////////////////
// Environment Classes
////////////////////////

function Environment( options ) {
	options = options || {};

	this.variableMap = options.variableMap || new Map();
	this.functionMap = options.functionMap || new Map();
	this.outputs = options.outputs || [];
}

Environment.prototype.getVariable = function( variableName ) {
	return this.variableMap.get( variableName );
};

Environment.prototype.getFunction = function( functionName ) {
	return this.functionMap.get( functionName );
};

function EnvironmentMemo( environment ) {
	this.environment = environment;
	this.store = new Map();
}

EnvironmentMemo.prototype.getResultOf = function( selectable ) {
	var result = this.store.get( selectable );

	if( ! result ) {
		result = selectable.select( this.environment );
		this.store.set( result );
	}

	return result;
};



////////////////////////
// Alternation Classes
////////////////////////

// alternationItemList :Array, metadata :Map
function AlternationSet( alternationItemList, metadata ) {
	this.items = alternationItemList;
	this.metadata = metadata;

	this.satisfactionCriteria = this.getSatisfactionCriteria();
}

AlternationSet.prototype.items = null;
AlternationSet.prototype.metadata = null;

AlternationSet.prototype.getSatisfactionCriteria = function() {
	// 
};

// -> SelectionResult
AlternationSet.prototype.select = function( environment ) {
	// body...
};



// contents :Array, condition :Condition..., metadata :Map
function AlternationItem( contents, condition, metadata ) {
	this.contents = contents;
	this.metadata = metadata;
	this.conditional = !! condition;
	this.condition = condition || new AlternationItemNonCondition();

	this.satisfactionCriteria = this.getSatisfactionCriteria();
}

AlternationSet.prototype.items = null;
AlternationSet.prototype.metadata = null;

AlternationSet.prototype.getSatisfactionCriteria = function() {
	// 
};

// -> Array<SelectionResult|TerminalResult>
AlternationSet.prototype.selectContents = function( environment ) {
	// body...
};



function AlternationTerminal( value ) {
	this.value = value;
};

// -> TerminalResult
AlternationTerminal.prototype.select = function( environment ) {
	// just this value warpped in a result.
};



function AlternationVariable( name ) {
	this.name = name;
}

// TODO: AlternationVariable prototype...



// name :String, fnArgs :AlternationSet
function AlternationFunction( name, fnArgs ) {
	this.name = name;
	this.arguments = fnArgs;
}

// TODO: AlternationFunction prototype...



////////////////////////
// Result Classes
////////////////////////

// TODO: SelectionResult class
// TODO: TerminalResult cass



////////////////////////
// Condition Classes
////////////////////////

function AlternationItemNonCondition() {}

AlternationItemNonCondition.prototype.fulfilledBy = function( environment ) {
	return true;
};

function AlternationItemIsCondition( subjectName, metadata ) {
	this.subjectName = subjectName;
	this.metadata = metadata;
}

AlternationItemIsCondition.prototype.fulfilledBy = function( environment ) {
	// true if the variable is defined
	// and if it has the metadata in this.metadata also defined.
};

function AlternationItemHasCondition( subjectName, metadata ) {
	this.subjectName = subjectName;
	this.metadata = metadata;
}

AlternationItemIsCondition.prototype.fulfilledBy = function( environment ) {
	// true if the variable is defined
	// and if it has the metadata in this.metadata also defined 
	// and if for each mapping on this.metadata if the variable has the same metadata mappings.
	// (all values are strings, here...)
};

function AlternationItemEqualsCondition( subjectName, alternationSet ) {
	this.subjectName = subjectName;
	this.value = alternationSet;
}

AlternationItemIsCondition.prototype.fulfilledBy = function( environment ) {
	// TODO: Implement necessary pipework for isCondition.fulfilledBy.
	// true if the variable is defined
	// and if its selected value is the same as
	//   one of the values that CAN be selected from the alternationSet pointed to by this.value.
	// This is one case actually where a selectAll would be handy.
	return false;
};
