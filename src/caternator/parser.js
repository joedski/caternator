// caternator/parser - Top-level Parser Thingy

var tokenizer = require( 'caternator/tokenizer' );

function parse( input ) {
	// - tokenize
	// - statementize -> output statements, variable definitions, function definitions
	// - statements' contents:
	//     - unflatten
	//     - interpret special forms
	//     - create output objects (AlternationSets, etc...)

	var tokens = tokenizer.tokenize( input );
	var statements = parseStatements( tokens );

	return statements;
}

function parseStatements( tokens ) {
	return tokens.map( function parseSingleStatement( lineTokens, i ) {
	});
}

function Statement( options ) {
	if( options )
		this.setOptions( options );
}

Statement.prototype.setOptions = function( options ) {
	// type: 'output', 'variable', 'function'.
	this.type = options.type;
	// array of contents.
	this.contents = options.contents;
	// variable or function name.
	this.reference = options.reference;
}
