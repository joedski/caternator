// caternator/parser - Top-level Parser Thingy

var tokenizer = require( 'caternator/tokenizer' );
var grouper = require( 'caternator/grouper' );

// String -> Thing
function parse( input ) {
	// - tokenize
	var normalizedInput = normalize( input );
	// TODO: This should be written some other way.  Probably just using forEach since I'm mutating things.
	var lineList = splitLines( normalizedInput );
	lineList = lineList.filter( isStatementLine );
	lineList = lineList.map( tokenizer.tokenize );
	lineList = lineList.map( tokenizer.identifyTokens );
	lineList = lineList.map( nestTokens );
	lineList = lineList.map( grouper.identifyGroups );

	// var listWithNormedFns = nestedTokensLineList.map( normalizeFunctionCalls );

	return {};
}

// normalize line-endings
// space out certain characters: "(", ")", "="
function normalize( inputString :String ) :String {
	return inputString
		.replace( /\r\n?/g, '\n' ) // normalize line endings.  (theoretically shouldn't matter?)
		.replace( /[\(\)=]/g, ' $& ' ) // space out tokens.
		;
}

function splitLines( normalizedInput :String ) :Array {
	var lines = normalizedInput.split( '\n' );
	return lines.map( function addMeta( lineString, index ) {
		return {
			string: lineString,
			meta: {
				lineNumber: index
			}
		};
	});
}

// Assume all non-empty lines are statement lines. (no comments yet...)
function isStatementLine( line ) {
	// TODO: Should probably add comments at some point.
	if( isEmptyLine( line ) ) {
		return false;
	}

	return true;
}

function isEmptyLine( line ) {
	if( line.string.replace( /\s+/g, '' ) != '' )
		return true;
	else
		return false;
}

function nestTokens( line ) {
	var resultantNestedTokens = initResultantNestedTokens();

	// Not functional-style, but hopefully easy to understand.
	line.tokens.forEach( function step( token, index ) {
		switch( token.type ) {
			case 'group begin': resultantNestedTokens.addDeeper(); break;
			case 'group end': resultantNestedTokens.shallower(); break;
			default: resultantNestedTokens.add( token ); break;
		}
	});

	line.nestedTokens = resultantNestedTokens;

	return line;
}

function initResultantNestedTokens() {
	var r = [], pn;

	for( pn in resultantNestedTokensPrototype ) {
		r[ pn ] = resultantNestedTokensPrototype[ pn ];
	}

	r.path = [];
	r.top();

	return r;
}

var resultantNestedTokensPrototype = {
	addDeeper: function() { this.add( [] ).deeper(); return this; },
	add: function( item ) { this.currentEnd.push( item ); return this; },
	deeper: function() { this.path.push( this.resolve().length - 1 ); this.currentEnd = this.resolve(); return this; },
	shallower: function() { this.path.pop(); this.currentEnd = this.resolve(); return this; },
	top: function() { this.path.length = 0; this.currentEnd = this.resolve(); return this; },
	currentEnd: null,
	resolve: function() {
		var goal = this;
		var pi, pl;

		for( pi = 0, pl = this.path.length; pi < pl; ++pi ) {
			goal = goal[ this.path[ pi ] ];
		}

		return goal;
	}
};

// function normalizeFunctionCalls( line ) {
// 	function normalizeFnsInGroup( group ) {
// 		// if Function Call is followed by Group, next Function Call.
// 		// if Function Call is followed by 
// 	}

// 	normalizeFnsInGroup( line.nestedTokens );

// 	return line;
// }

module.exports.parse = parse;
