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
	var production = expect.sequence([
		expectStatementSeq,
		expect.optional( expect.terminal({ type: 'lineEnd' }) )
	], tokens );

	return newProductionOrNull( 'program', production );
}



//////// Statements ////////

function expectStatementSeq( tokens ) {
	var production = expect.sequence([
		expectStatement,
		expect.repetition( expect.sequence([
			expect.terminal({ type: 'lineEnd' }),
			expectStatement
		]))
	], tokens );

	return newProductionOrNull( 'statementSeq', production );
}

function expectStatement( tokens ) {
	var production = expect.alternation([
		expectVarStatement,
		expectFunStatement,
		expectOutStatement
	], tokens );

	return newProductionOrNull( 'statement', production );
}

function expectVarStatement( tokens ) {
	var production = expect.sequence([
		expect.terminal({ type: 'variable' }),
		expect.repetition( expectMetaGroup ),
		expect.terminal({ type: 'assign' }),
		expectItemSeq
	], tokens );

	return newProductionOrNull( 'varStatement', production );
}

function expectFunStatement( tokens ) {
	var production = expect.sequence([
		expect.terminal({ type: 'function' }),
		expect.repetition( expectMetaGroup ),
		expect.terminal({ type: 'assign' }),
		expectItemSeq
	], tokens );

	return newProductionOrNull( 'funStatement', production );
}

function expectOutStatement( tokens ) {
	var production = expectItemSeq( tokens );

	// return newProductionOrNull( 'outStatement', production );
	if( production )
		return new productions.Production( 'outStatement', [ production ] );
	else
		return null;
}



//////// Metas ////////

function expectMetaGroup( tokens ) {
	var production = expect.alternation([
		expectMetaSeq,
		expect.sequence([
			expect.terminal({ type: 'groupBegin' }),
			expect.alternation([
				expectMetaSeq,
				expectMetaAssignGroup
			]),
			expect.terminal({ type: 'groupEnd' })
		])
	], tokens );

	return newProductionOrNull( 'metaGroup', production );
}

function expectMetaSeq( tokens ) {
	var production = expect.sequence([
		expect.terminal({ type: 'metadata' }),
		expect.repetition( expect.terminal({ type: 'metadata' }) )
	], tokens );

	return newProductionOrNull( 'metaSeq', production );
}

function expectMetaAssignGroup( tokens ) {
	var production = expect.sequence([
		expect.terminal({ type: 'metadata' }),
		expect.terminal({ type: 'assign' }),
		expectItemSeq
	], tokens );

	return newProductionOrNull( 'metaAssignGroup', production );
}



//////// Plain Group ////////

function expectPlainGroup( tokens ) {
	var production = expect.sequence([
		expect.terminal({ type: 'groupBegin' }),
		expectItemSeq,
		expect.terminal({ type: 'groupEnd' })
	], tokens );

	return newProductionOrNull( 'plainGroup', production );
}



//////// Items ////////

function expectItemDelimiter( tokens ) {
	var production = expect.sequence([
		expect.terminal({ type: 'groupBegin' }),
		expectItemDelimiterItemSeq,
		expect.terminal({ type: 'groupEnd' }),
	], tokens );

	return newProductionOrNull( 'itemDelimiter', production );
}

function expectItemDelimiterItemSeq( tokens ) {
	var production = expect.alternation([
		expect.sequence([
			expect.terminal({ type: 'text', value: /^or$/i }),
			expect.optional( expectCondition )
		]),
		expectCondition
	], tokens );

	return newProductionOrNull( 'itemDelimiterItemSeq', production );
}

function expectItemSeq( tokens ) {
	var production = expect.sequence([
		expectItem,
		expect.repetition( expectItem )
	], tokens );

	return newProductionOrNull( 'itemSeq', production );
}

function expectItem( tokens ) {
	var production = expect.alternation([
		expect.terminal({ type: 'variable' }),
		expectFunctionCall,
		expect.terminal({ type: 'functionArguments' }),
		expect.terminal({ type: 'text' }),
		expectMetaGroup,
		expectItemDelimiter,
		expectPlainGroup
	], tokens );

	return newProductionOrNull( 'item', production );
}



//////// Conditions ////////

function expectCondition( tokens ) {
	var production = expect.sequence([
		expect.terminal({ type: 'text', value: /^if$/i }),
		expect.terminal({ type: 'variable' }),
		expectConditionPredicate
	], tokens );

	return newProductionOrNull( 'condition', production );
}

function expectConditionPredicate( tokens ) {
	var production = expect.alternation([
		expect.sequence([
			expect.terminal({ type: 'text', value: /^is$/i }),
			expectItemSeq
		]),
		expect.sequence([
			expect.terminal({ type: 'text', value: /^has$/i }),
			expectMetaGroup,
			expect.repetition( expectMetaGroup )
		])
	], tokens );

	return newProductionOrNull( 'conditionPredicate', production );
}

function expectFunctionCall( tokens ) {
	var production = expect.sequence([
		expect.terminal({ type: 'function' }),
		expect.alternation([
			expectFunctionCall,
			expectItem
		])
	], tokens );

	return newProductionOrNull( 'functionCall', production );
}



////////////////////////////////

function newProductionOrNull( ruleName, production ) {
	if( production ) {
		if( production.anonymous )
			return new productions.Production( ruleName, production.contents );
		else
			return production;
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
