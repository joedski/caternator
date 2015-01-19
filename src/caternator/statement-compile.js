var statements = require( './statements' );
var util = require( './util' );

function compile( items ) {
	var statement = null;
	var statementTrials = [
		tryVariableStatement,
		tryFunctionStatement,
		tryOutputStatement,
	];

	statementTrials.some( function tryStatementType( statementTrial ) {
		statement = statementTrial( items );
		return !! statement;
	});

	return statement;
}

// Expects an array of items with:
// - 1 variable and 0 or more metadata tokens before an assign token
// - an assign token
// - stuff after an assign token
function tryVariableStatement( items ) {
	var statementParts = splitOnFirstAssign( items );

	if( ! statementParts ) return null;

	var subjectParts = partitionSubject( statementParts.subject, 'variable' );

	if( subjectParts.variable.length > 1 ) {
		throw new StatementCompileError( 'Cannot assign to more than one variable in a Variable Statement', {
			variables: subjectParts[ 'variable' ],
			items: items
		});
	}

	if( subjectParts[ '*' ].length > 0 ) {
		return null;
	}

	return new statements.VariableStatement(
		subjectParts.variable[ 0 ].value,
		statementParts.value,
		subjectParts.metadata
	);
}

// Expects an array of items with:
// - 1 function and 0 or more metadata tokens before an assign token
// - an assign token
// - stuff after an assign token
function tryFunctionStatement( items ) {
	var statementParts = splitOnFirstAssign( items );

	if( ! statementParts ) return null;

	var subjectParts = partitionSubject( statementParts.subject, 'function' );

	if( subjectParts[ 'function' ].length > 1 ) {
		throw new StatementCompileError( 'Cannot assign to more than one function in a Function Statement', {
			'functions': subjectParts[ 'function' ],
			items: items
		});
	}

	if( subjectParts[ '*' ].length > 0 ) {
		return null;
	}

	return new statements.FunctionStatement(
		subjectParts[ 'function' ][ 0 ].value,
		statementParts.value,
		subjectParts.metadata
	);
}

// Expects an array of items with:
// - anything
function tryOutputStatement( items ) {
	// var partitionedItems = util.partition( items, 'type', [ 'metadata' ] );

	return new statements.OutputStatement( items );
}



// Splits a list of items into { subject:, value: }
function splitOnFirstAssign( items ) {
	var assignIndex = util.findIndexOf( function assign( item ) {
		return item.type == 'assign';
	});

	if( assignIndex == -1 ) return null;

	return {
		subject: items.slice( 0, assignIndex ),
		value: items.slice( assignIndex + 1 )
	};
}

function partitionSubject( subjectItems, otherType ) {
	return util.partition( subjectItems, function( item ) {
		if( item.type == otherType ) return otherType;
		if( item.type == 'metadata' ) return 'metadata';
		if( item.type == 'group' && item.groupType == 'metadata' ) return 'metadata';
		return '*';
	});
}



function StatementCompileError( message, options ) {
	Error.call( this, message );

	this.variables = options.variables;
	this.items = options.items;
}

StatementCompileError.prototype = new Error();



exports.VariableStatement = VariableStatement;
exports.FunctionStatement = FunctionStatement;
exports.OutputStatement = OutputStatement;
exports.StatementCompileError = StatementCompileError;