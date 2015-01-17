var statements = require( './statements' );
var util = require( './util' );

function compile( items ) {
	// try each statement type, using OutputStatement if no other kind matches:
	// - VariableStatement: (variable{1}, metadata{0,}), assign, (*)
	// - FunctionStatement: (function{1}, metadata{0,}), assign, (*)
	// - OutputStatement: *

	var statement;
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
	var subjectItems, valueItems, assignIndex;

	assignIndex = util.findIndexOf( function assign( item ) {
		return item.type == 'assign';
	});

	if( assignIndex == -1 ) {
		return null;
	}

	subjectItems = items.slice( 0, assignIndex );
	valueItems = items.slice( assignIndex + 1 );

	if( subjectItems.length < 1 ) {
		return null;
	}

	var partitionedItems = util.partitionOnProp( subjectItems, 'type', [ 'variable', 'metadata' ]);
	var subjectPartedGroups = util.partition( partitionedItems[ '*' ], function forMetadataGroups( item ) {
		return (item.type == 'group' && item.groupType == 'metadata') ? 'metadata' : '*';
	});

	if( subjectPartedGroups[ '*' ].length > 0 ) {
		return null;
	}

	// Subject side of assign cannot contain more than one actual Subject.
	if( partitionedItems[ 'variable' ].length > 1 ) {
		throw new StatementCompileError( 'Cannot assign to more than one variable in a Variable Statement', {
			variables: partitionedItems[ 'variable' ],
			items: items
		});
	}

	return new statements.VariableStatement(
		partitionedItems[ 'variable' ][ 0 ].value,
		valueItems,
		partitionedItems[ 'metadata' ].concat( subjectMetadataGroups )
	);
}

// Expects an array of items with:
// - 1 function and 0 or more metadata tokens before an assign token
// - an assign token
// - stuff after an assign token
function tryFunctionStatement( items ) {
	var subjectItems, valueItems, assignIndex;

	assignIndex = util.findIndexOf( function assign( item ) {
		return item.type == 'assign';
	});

	if( assignIndex == -1 ) {
		return null;
	}

	subjectItems = items.slice( 0, assignIndex );
	valueItems = items.slice( assignIndex + 1 );

	if( subjectItems.length < 1 ) {
		return null;
	}

	// Still need metadata gruops...
	var partitionedItems = util.partitionOnProp( subjectItems, 'type', [ 'function', 'metadata' ]);
	var subjectPartedGroups = util.partition( partitionedItems[ '*' ], function forMetadataGroups( item ) {
		return (item.type == 'group' && item.groupType == 'metadata') ? 'metadata' : '*';
	});

	if( subjectPartedGroups[ '*' ].length > 0 ) {
		return null;
	}

	// Subject side of assign cannot contain more than one actual Subject.
	if( partitionedItems[ 'function' ].length > 1 ) {
		throw new StatementCompileError( 'Cannot assign to more than one function in a Function Statement', {
			variables: partitionedItems[ 'function' ],
			items: items
		});
	}

	return new statements.FunctionStatement(
		partitionedItems[ 'function' ][ 0 ].value,
		valueItems,
		partitionedItems[ 'metadata' ].concat( subjectPartedGroups )
	);
}

// Expects an array of items with:
// - anything
function tryOutputStatement( items ) {
	var partitionedItems = util.partition( items, 'type', [ 'metadata' ] );

	return new statements.OutputStatement( items )
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