// caternator/tokenizer - Breaks the input into tokens!

function tokenize( rawLineString ) {
	return splitTokensFromLine( normalizeLine( rawLineString ) );
}

function normalizeLine( lineString ) {
	return lineString.replace( /[\(\)=]/g, ' $& ' ).replace( /^\s+|\s+$/g, '' );
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

function identifyTokens( rawLineTokens ) {
	return rawLineTokens.rawTokens.map( function identifySingleToken( token, index ) {
		if( token == '(' ) {
			return { type: 'group begin' };
		}
		else if( token == ')' ) {
			return { type: 'group end' };
		}
		else if( token == '=' ) {
			return { type: 'assign' };
		}
		else if( token.match( /^\$/ ) ) {
			return { type: 'variable', value: token };
		}
		else if( token.match( /^@/ ) ) {
			return { type: 'function', value: token };
		}
		else if( token.match( /^#/ ) ) {
			return { type: 'metadata', value: token };
		}
		else {
			return { type: 'word', value: token };
		}
	});
}

module.exports.tokenize = tokenize;
module.exports.identifyTokens = identifyTokens;
