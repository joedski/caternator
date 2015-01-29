// caternator/parser - Top-level Parser Thingy

var tokenizer = require( './tokenizer' );
var nester = require( './nester' );
var grouper = require( './grouper' );
var statementCompiler = require( './statement_compiler' );

// String -> Thing
function parse( input ) {
	var rawLineList = splitLines( input );
	var lineList = rawLineList.map( parseRawLine );

	return {
		variableStatements: [],
		functionStatements: [],
		outputStatements: [],
		lines: lineList
	};
}

function splitLines( normalizedInput ) {
	return normalizedInput.split( '\n' );
}

function parseRawLine( rawLineString, index, rawLineList ) {
	var line = {
		string: rawLineString,
		metadata: { lineNumber: index }
	};

	try {
		if( isStatementLine( line ) ) {
			line.type = 'statement';
			line.rawTokens = tokenizer.tokenize( line.string );
			line.flatTokens = tokenizer.identifyTokens( line.rawTokens );
			line.nestedTokens = nester.nestTokens( line.flatTokens );
			line.groupedTokens = grouper.identifyGroups( line.nestTokens );
			line.statement = statementCompiler.compile( line.groupedTokens );

			// TODO: Identify statement type. (variable definition, function definition, output.)
			// line.statementType = '';
		}
		else if( isEmptyLine( line ) ) {
			line.type = 'empty';
		}
		else {
			line.type = 'invalid';
		}
	}
	catch( e ) {
		throw new LineParseError( 'Error trying to parse line ' + String( index ) + ': ' + e.message, {
			line: line,
			originalError: e
		});
	}

	return line;
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



function LineParseError( message, options ) {
	options = options || {};

	Error.call( this, message );

	this.name = 'LineParseError';
	this.line = options.line;
	this.originalError = options.originalError;
}

LineParseError.prototype = new Error();



exports.parse = parse;
exports.LineParseError = LineParseError;
