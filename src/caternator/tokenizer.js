// caternator/tokenizer - Breaks the input into tokens!

// String -> Array<Array<String>>
// Returns a 2D array: An array where each item represents a line,
// and where each line contains an array of the tokens from that line.
function tokenize( inputString ) {
	var normalizedInput = normalize( inputString );
	var lines = splitLines( normalizedInput );
	return lines.map( tokenizeLine );
}

// normalize line-endings: trim and remove runs
// space out certain characters: "(", ")", "="
function normalize( inputString ) {
	return inputString
		.replace( /[\r\n]+/g, '\n' ) // remove runs, remove \r.
		.replace( /^\n+|\n+$/g, '' ) // trim.
		.replace( /[\(\)=]/g, ' $& ' ) // space out tokens.
		;
}

function splitLines( normalizedInput ) {
	return normalizedInput.split( '\n' );
}

function tokenizeLine( line ) {
	var normedLine = normalizeLine( line );
	return collectTokensFromLine( normedLine );
}

function normalizeLine( line ) {
	return line.replace( /^\s+|\s+$/g, '' );
}

function collectTokensFromLine( line ) {
	var tokens = [];
	var whitespaceSeeker = /\s+/g;
	var match, lastIndex = 0, token;

	function pushToken() {
		if( match ) {
			token = line.substring( lastIndex, match.index );
		}
		else {
			token = line.substring( lastIndex );
		}

		tokens.push( token );
	}

	while( match = whitespaceSeeker.exec( line ) ) {
		pushToken();
		lastIndex = whitespaceSeeker.lastIndex;
	}

	pushToken();

	return tokens;
}

module.exports.tokenize = tokenize;
