////////////////////////
// Environment Classes
////////////////////////

/**
 * Usage of Environment and Environment Memo:
 *
 * var caternatorProgram = Caternator.parseAndCompile( stringInput );
 *
 * var result1 = caternatorProgram.select();
 * var result2 = caternatorProgram.select({ environmentMemo: result1.environmentMemo });
 * var allResults = caternatorProgram.selectAll({ environmentMemo: result2.environmentMemo });
 */

// var env = new Environment({
//     variableMap: Map<Variable Name : Alternation Set>
//     functionMap: Map<Variable Name : Alternation Set>
//     outputs: Array<Alternation Set>
// })

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

Environment.prototype.hasVariable = function( variableName ) {
	return this.variableMap.has( variableName );
};

Environment.prototype.hasFunction = function( functionName ) {
	return this.functionMap.has( functionName );
};

// TODO: Add thing to set up native function.
// TODO: Figure out what all wrapping needs to be done around a native function to present a consistent interface.



function EnvironmentMemo() {
	this.store = new Map();
	this.functionArguments = [];
}

EnvironmentMemo.prototype.get = function( selectable ) {
	this.store.get( selectable );
};

EnvironmentMemo.prototype.set = function( selectable ) {
	this.store.set( selectable );
};

EnvironmentMemo.prototype.pushFunctionArguments = function( result ) {
	this.functionArguments.push( result );
};

EnvironmentMemo.prototype.popFunctionArguments = function() {
	this.functionArguments.pop();
};

// Returns undefined if there are currently no function arguments.
EnvironmentMemo.prototype.getFunctionArguments = function() {
	return this.functionArguments[ this.functionArguments.length - 1 ];
};

exports.Environment = Environment;
exports.EnvironmentMemo = EnvironmentMemo;
