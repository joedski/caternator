/**
 * This parser is basically a literal translation of the grammar described in FORMAL_GRAMMER.md
 * except with all the names camelCased for added javascriptiness.
 *
 * Also the short token names were expanded. ('variable' instead of 'var'.)
 */

var productions = require( 'expectation-parser/productions' );
var expect = require( 'expectation-parser' );



exports.parse = function parse( tokens ) {
	return expectProgram( tokens );
};

exports.expectVarStatement = expectVarStatement;



//////// Entry Point ////////

function expectProgram( tokens ) {
	return productionWithNameOrNull( 'program', expect.sequence([
		expectStatementSeq,
		expect.optional( expect.terminal({ type: 'lineEnd' }) )
	]), tokens );
};



//////// Statements ////////

function expectStatementSeq( tokens ) {
	return productionWithNameOrNull( 'statementSeq', expect.sequence([
		expectStatement,
		expect.repetition( expect.sequence([
			expect.terminal({ type: 'lineEnd' }),
			expectStatement
		]))
	]), tokens );
};

function expectStatement( tokens ) {
	// Anonymous!
	return expect.alternation([
		expectVarStatement,
		expectFunStatement,
		expectOutStatement
	], tokens );
};

function expectVarStatement( tokens ) {
	return productionWithNameOrNull( 'varStatement', expect.sequence([
		expect.terminal({ type: 'variable' }),
		expect.repetition( expectMetaGroup ),
		expect.terminal({ type: 'assign' }),
		expectItemSeq
	]), tokens );
};

function expectFunStatement( tokens ) {
	return productionWithNameOrNull( 'funStatement', expect.sequence([
		expect.terminal({ type: 'function' }),
		expect.repetition( expectMetaGroup ),
		expect.terminal({ type: 'assign' }),
		expectItemSeq
	]), tokens );
};

function expectOutStatement( tokens ) {
	return productionWithNameOrNull( 'outStatement', expectItemSeq, tokens );
};



//////// Metas ////////

function expectMetaGroup( tokens ) {
	return productionWithNameOrNull( 'metaGroup', expect.alternation([
		expectMetaSeq,
		expect.sequence([
			expect.terminal({ type: 'groupBegin' }),
			// this was another alternation, but currently
			// it doesn't behave right...
			expectMetaSeq,
			expect.terminal({ type: 'groupEnd' })
		]),
		expect.sequence([
			expect.terminal({ type: 'groupBegin' }),
			expectMetaAssignGroup,
			expect.terminal({ type: 'groupEnd' })
		])
	]), tokens );
};

function expectMetaSeq( tokens ) {
	return productionWithNameOrNull( 'metaSeq', expect.sequence([
		expect.terminal({ type: 'metadata' }),
		expect.repetition( expect.terminal({ type: 'metadata' }) )
	]), tokens );
};

function expectMetaAssignGroup( tokens ) {
	return productionWithNameOrNull( 'metaAssignGroup', expect.sequence([
		expect.terminal({ type: 'metadata' }),
		expect.terminal({ type: 'assign' }),
		expectItemSeq
	]), tokens );
};



//////// Plain Group ////////

function expectPlainGroup( tokens ) {
	return productionWithNameOrNull( 'plainGroup', expect.sequence([
		expect.terminal({ type: 'groupBegin' }),
		expectItemSeq,
		expect.terminal({ type: 'groupEnd' })
	]), tokens );
};



//////// Items ////////

function expectItemDelimiter( tokens ) {
	return productionWithNameOrNull( 'itemDelimiter', expect.sequence([
		expect.terminal({ type: 'groupBegin' }),
		expectItemDelimiterItemSeq,
		expect.terminal({ type: 'groupEnd' }),
	]), tokens );
};

function expectItemDelimiterItemSeq( tokens ) {
	return productionWithNameOrNull( 'itemDelimiterItemSeq', expect.alternation([
		expect.sequence([
			expect.terminal({ type: 'text', value: /^or$/i }),
			expect.optional( expectCondition )
		]),
		expectCondition
	]), tokens );
};

function expectItemSeq( tokens ) {
	return productionWithNameOrNull( 'itemSeq', expect.sequence([
		expectItem,
		expect.repetition( expectItem )
	]), tokens );
};

function expectItem( tokens ) {
	return productionWithNameOrNull( 'item', expect.alternation([
		expect.terminal({ type: 'variable' }),
		expectFunctionCall,
		expect.terminal({ type: 'functionArguments' }),
		expect.terminal({ type: 'text' }),
		expectMetaGroup,
		expectItemDelimiter,
		expectPlainGroup
	]), tokens );
};



//////// Conditions ////////

function expectCondition( tokens ) {
	return productionWithNameOrNull( 'condition', expect.sequence([
		expect.terminal({ type: 'text', value: /^if$/i }),
		expect.terminal({ type: 'variable' }),
		expectConditionPredicate
	]), tokens );
};

function expectConditionPredicate( tokens ) {
	return productionWithNameOrNull( 'conditionPredicate', expect.alternation([
		expect.sequence([
			expect.terminal({ type: 'text', value: /^is$/i }),
			expectItemSeq
		]),
		expect.sequence([
			expect.terminal({ type: 'text', value: /^has$/i }),
			expectMetaGroup,
			expect.repetition( expectMetaGroup )
		])
	]), tokens );
};

function expectFunctionCall( tokens ) {
	return productionWithNameOrNull( 'functionCall', expect.sequence([
		expect.terminal({ type: 'function' }),
		expect.alternation([
			expectFunctionCall,
			expectItem
		])
	]), tokens );
}



////////////////////////////////

function productionWithNameOrNull( name, expectation, tokens ) {
	var production = expectation( tokens );

	return newProductionOrNull( name, production );
}

function defineExpectation( name, expectation ) {
	return function namedExpectation( tokens ) {
		var production = expectation( tokens );

		return newProductionOrNull( name, production );
	};
}

function newProductionOrNull( ruleName, production ) {
	if( production ) {
		if( production.anonymous )
			return new productions.Production( ruleName, production.contents );
		else
			// This only occurs in one case, with the out statement.
			return new productions.Production( ruleName, [ production ] );
	}
	else {
		return null;
	}
}

function CompileError( message, options ) {
	Error.call( this, message );

	this.cause = options.cause || null;
}

CompileError.prototype = new Error();
