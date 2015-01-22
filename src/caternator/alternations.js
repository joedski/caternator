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

EnvironmentMemo.prototype.get = function( selectable ) {
	this.store.get( selectable );
};

EnvironmentMemo.prototype.set = function( selectable ) {
	this.store.set( selectable );
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
	// requiredVariables - variables which are required on every alternation item.
	// requiredFunctions - functions which are required on every alternation item.
	// optionalVariables - variables which are optional on any alternation item, or required on some but not all.
	// optionalFunctions - functions which are optional on any alternation item, or required on some but not all.
};

// -> SelectionResult
AlternationSet.prototype.select = function( environment, environmentMemo ) {
	// cull any Alternation Items not Satisfied by current Environment.
	// try conditional Alternation Items first:
	//   cull any Alternation Items whose Conditions fail (are not Fulfilled)
	//   if no Items remain, skip to non-Conditional Alternation Items.
	//   otherwise skip to Preferential Selection.
	// failing above, do non-Conditional Alternation Items:
	// failing that, Select upon an empty list.
	// 
	// Preferential Selection:
	// Rank Items in order of Preference:
	//   items with more Required Variables Satisfied rank higher.
	//   where the above is the same, items with more Optional Variables Satisfied rank higher.
	//   where all of the above are the same, items with fewer Optional Variables Not Satisfied rank higher.
	//   where all of the above are the same, items which are Not Empty rank higher than those that are.
	// 
	// Keep only Items with the greatest Preference.
	//   If more than one Item has the same Greatest Preference, keep all of them.
	// 
	// Choose one Item from those remaining and return Item's Selection Results within a new Selection Result.
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
	// requiredVariables - variables which appear directly within this item's contents,
	//   or which are required on any sub-items within this item's contents.
	// requiredFunctions - functions which appear directly within this item's contents,
	//   or which are required on any sub-items within this item's contents.
	// optionalVariables - variables which are optional on any sub-alternation-set within this item's contents.
	// optionalFunctions - functions which are optional on any sub-alternation-set within this item's contents.
};

// -> Array<SelectionResult|TerminalResult>
AlternationSet.prototype.selectContents = function( environment, environmentMemo ) {
	return this.contents.map( function selectOn( item ) {
		return item.select( environment, environmentMemo );
	});
};



function AlternationTerminal( value ) {
	this.value = value;
};

// -> TerminalResult
AlternationTerminal.prototype.select = function( environment, environmentMemo ) {
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
