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

function EnvironmentMemo() {
	this.store = new Map();
}

EnvironmentMemo.prototype.get = function( selectable ) {
	this.store.get( selectable );
};

EnvironmentMemo.prototype.set = function( selectable ) {
	this.store.set( selectable );
};

exports.Environment = Environment;
exports.EnvironmentMemo = EnvironmentMemo;
