// caternator/tokenizer - Breaks the input into tokens!

function tokenize( lineContainer ) {
	lineContainer.tokens = splitTokensFromLine( normalizeLine( lineContainer.string ) );

	return lineContainer;
}

function normalizeLine( line ) {
	return line.replace( /^\s+|\s+$/g, '' );
}

function splitTokensFromLine( line ) {
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

function identifyTokens( lineContainer ) {
	// something with lineContainer.tokens.
	lineContainer.identifiedTokens = lineContainer.tokens.map( function identifySingleToken( token, index ) {
		// ...
	})
}

module.exports.tokenize = tokenize;
module.exports.identifyTokens = identifyTokens;

// Token Wrapper Objects, too, like Assingment Indicator, Group Begin Indicator, etc.
