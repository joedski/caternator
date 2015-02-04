var productions = require( './productions' );

// Usage:
// expect.optionally( expect.terminal({ type: 'lineEnd' }) )
// This returns an expectation function which accepts tokens
// and outputs an anonymous production containing either...
// - a single terminal production
// - nothing

////////////////////////////////
// Prelude: General Expectation Functions
////////////////////////////////
// Note: The expectation functions take an array of tokens and some form of functions, ussually an array of.

// This only does what we need here, not general purpose currying.
// I wish JS had currying.
function currifyGeneralExpectation( generalExpectation ) {
	return function curriedExpectation( expectationArg, tokens ) {
		if( ! tokens ) {
			return function curriedExpectation( curryTokens ) {
				return generalExpectation( expectationArg, curryTokens );
			};
		}

		return generalExpectation( expectationArg, tokens );
	};
}

function restOfTokensAfter( tokens, production ) {
	return tokens.slice( production.length );
}

// Covers alternation.
// Array<Function>, Array<Tokens> -> AnonymousProduction | Null
function expectFirstOf( arrayOfAlternateSequenceExpectations, tokens ) {
	var production = null;

	function expectFirstAlternate( sequenceExpectation ) {
		return !! (production = sequenceExpectation( tokens ));
	}

	if( arrayOfAlternateSequenceExpectations.some( expectFirstAlternate ) ) {
		return production;
	}
	else {
		return null;
	}
}

// Covers repetitions.
// Repetitions return a raw array of Productions,
// because the results of a Repetition are concatenated into the rule's resulting Production.
// Function, Array<Tokens> -> AnonymousProduction
// Always returns at least an empty production.
function expectRepetitionOf( repeatedExpectation, tokens ) {
	var production;
	var currentRest = tokens, nextProduction = null;

	production = new productions.AnonymousProduction( 'repetition' );

	while( nextProduction = repeatedExpectation( currentRest ) ) {
		production.push( nextProduction );
		currentRest = restOfTokensAfter( currentRest, nextProduction );
	}

	return production;
}

// Covers optionals
// Function, Array<Tokens> -> AnonymousProduction
// Always returns at least an empty Production.
function expectOptionally( optionalSequenceExpectation, tokens ) {
	var production, optionalProduction;

	production = new productions.AnonymousProduction( 'option' );
	optionalProduction = optionalSequenceExpectation( tokens );

	if( optionalProduction ) {
		production.push( optionalProduction );
	}

	return production;
}

// Covers concatenated sequences
// Array<Function>, Array<Tokens> -> AnonymousProduction | Null
function expectSequence( sequenceOfExpectations, tokens ) {
	var production = new productions.AnonymousProduction( 'sequence' );
	var currentRest = tokens;

	function expectEvery( expectation ) {
		var nextProduction = expectation( currentRest );

		if( nextProduction ) {
			currentRest = restOfTokensAfter( currentRest, nextProduction );
			production.push( nextProduction );
		}

		return !! nextProduction;
	}

	if( sequenceOfExpectations.every( expectEvery ) ) {
		return production;
	}
	else {
		return null;
	}
}

// Covers terminals
// Function|String|Regexp, Array<Tokens> -> TerminalProduction | Null
function expectTerminal( terminal, tokens ) {
	if( ! tokens.length ) {
		return null;
	}

	var passed, t = tokens[ 0 ];

	if( typeof terminal == 'function' ) {
		passed = terminal( t );
	}
	else if( typeof terminal == 'string' ) {
		passed = t.value == terminal;
	}
	else if( terminal instanceof RegExp ) {
		passed = terminal.test( t.value );
	}
	else if( terminal && (typeof terminal.type == 'string') ) {
		passed = terminal.type == t.type;

		if( typeof terminal.value == 'string' ) {
			passed = passed && terminal.value == t.value;
		}
	}

	if( passed ) {
		return new productions.TerminalProduction( tokens[ 0 ] );
	}
	else {
		return null;
	}
}

exports.restAfter = restOfTokensAfter;
exports.firstOf = currifyGeneralExpectation( expectFirstOf );
exports.repetitionOf = currifyGeneralExpectation( expectRepetitionOf );
exports.optionally = currifyGeneralExpectation( expectOptionally );
exports.sequence = currifyGeneralExpectation( expectSequence );
exports.terminal = currifyGeneralExpectation( expectTerminal );
