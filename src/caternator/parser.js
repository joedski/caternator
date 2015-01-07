// caternator/parser - Top-level Parser Thingy

var tokenizer = require( 'caternator/tokenizer' );

// String -> Thing
function parse( input ) {
	// - tokenize
	var normalizedInput = normalize( input );
	var lineList = splitLines( normalizedInput );
	var tokensLineList = lineList.map( tokenizer.tokenize );
	var identifiedTokensList = tokensLineList.map( tokenizer.identifyTokens );
	var nestedTokensLineList = tokensLineList.map( nestTokens );

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

function nestTokens( tokensLine ) {
	var resultantNestedTokens = initResultantNestedTokens();

	tokensLine.tokens.forEach( function step( token, index ) {
		// body...
	})
}

function initResultantNestedTokens() {
	var r = [], pn;

	for( pn in resultantNestedTokensPrototype ) {
		r[ pn ] = resultantNestedTokensPrototype[ pn ];
	}

	return r;
}

var resultantNestedTokensPrototype = {
	addDeeper: function() { this.add( [] ).deeper(); return this; },
	add: function( item ) { this.resolve().push( item ); return this; },
	deeper: function() { this.path.push( this.resolve().length - 1 ); return this; },
	shallower: function() { this.path.pop(); return this; },
	top: function() { this.path.length = 0; return this; },
	resolve: function() {
		var goal = this;
		var pi, pl;

		for( pi = 0, pl = this.path.length; pi < pl; ++pi ) {
			goal = goal[ this.path[ pi ] ];
		}

		return goal;
	}
};