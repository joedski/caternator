/**
 * Usage:
 * var env = new Environment({
 *     variableStatements: [ ... ],
 *     functionStatements: [ ... ],
 *     outputStatements: [ ... ]
 * });
 *
 * var root = new RootAlternation( env );
 * var output = root.selectOne();
 *
 * ...
 *
 * RootAlternation.prototype.selectOne = function( env ) {
 *     var memoizedEnv = env.getMemoized();
 *     return this.root.selectOne( memoizedEnv );
 * }
 */

function Environment( options ) {
	options = options || {};

	initStores.call( this );

	(options.variableStatements || []).forEach( this.addVariable, this );
	(options.functionStatements || []).forEach( this.addFunction, this );
	(options.outputStatements || []).forEach( this.addOutput, this );
}

function initStores() {
	this.variableStore = new Store();
	this.functionStore = new Store();
	this.outputs = [];
}

Environment.prototype.addVariable = function( variableStatement ) {
	this.variableStore.set( variableStatement.subject, variableStatement.value );
};

Environment.prototype.addFunction = function( functionStatement ) {
	this.functionStore.set( functionStatement.subject, functionStatement.value );
};

Environment.prototype.addOutput = function( outputStatement ) {
	this.outputs.push( outputStatement.value );
};

Environment.prototype.getMemoized = function() {
	return new MemoizedEnvironment( this );
};

Environment.prototype.getVariable = function( name ) {
	return this.variableStore.get( name );
};

Environment.prototype.getFunction = function( name ) {
	return this.functionStore.get( name );;
};

Environment.prototype.getAllOutputs = function() {
	return this.outputs.slice( 0 );
};



function Store() {
	this._store = {};
}

Store.prototype.get = function( name ) {
	return this._store[ name ];
};

Store.prototype.set = function( name, value ) {
	this._store[ name ] = value;
	return value;
};



function MemoizedEnvironment( baseEnvironment ) {
	this.memo = new EnvironmentMemo();
	this.base = baseEnvironment;
}

// This allows reuse of the same environment for multiple selections if so desired.
MemoizedEnvironment.prototype.getMemoized = function() {
	return this;
};

MemoizedEnvironment.prototype.getVariable = function( name ) {
	var alternation = this.base.getVariable( name );
	var memo = this.memo.get( alternation );

	if( memo ) return memo;

	return this.memo.set( alternation, alternation.selectOne( this.base ) );
};



function EnvironmentMemo() {
	this.memo = {};
}

EnvironmentMemo.prototype.get = function( alternation ) {
	return this.memo[ alternation.uid ];
};

EnvironmentMemo.prototype.set = function( alternation, result ) {
	this.memo[ alternation.uid ] = result;
	return result;
};
