// caternator/parser - Top-level Parser Thingy

var tokenizer = require( './tokenizer' );
var nester = require( './nester' );
var grouper = require( './grouper' );

// String -> Thing
function parse( input ) {
	// - tokenize
	var normalizedInput = normalize( input );
	// TODO: This should be written some other way.  Probably just using forEach since I'm mutating things.
	var lineList = splitLines( normalizedInput );
	lineList = lineList.filter( isStatementLine );
	lineList = lineList.map( tokenizer.tokenize );
	lineList = lineList.map( tokenizer.identifyTokens );
	lineList = lineList.map( nester.nestTokens );
	lineList = lineList.map( grouper.identifyGroups );

	// var listWithNormedFns = nestedTokensLineList.map( normalizeFunctionCalls );

	return {};
}

// normalize line-endings
function normalize( inputString :String ) :String {
	return inputString
		// .replace( /\r\n?/g, '\n' ) // normalize line endings.  (theoretically shouldn't matter?)
		// .replace( /\n+$/, '' )
		// ;
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

module.exports.parse = parse;
