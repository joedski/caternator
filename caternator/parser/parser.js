function CaternatorParser( tokenizer ) {
	this.tokenizer = tokenizer;
	this.tokenizer.onToken = this.pushToken.bind( this );
	this.tokenizer.onFlush = this.flush.bind( this );
}

CaternatorParser.prototype.peek = function( n ) {
	if( n == null ) n = 0;

	return this.tokens[ n ];
};

CaternatorParser.prototype.shiftTokens = function() {
	this.tokens.shift();
};

CaternatorParser.prototype.expectProgram = function() {
	var statementSeq;

	statementSeq = this.expectStatementSeq();

	if( statementSeq ) {
		output.push( statementSeq );
	}
	else {
		this.onWarning( CaternatorParser.NO_STATEMENTS, "No statements were parsed from this program." );
	}

	// optional lineEnd at end of whole program.
	if( this.peek() && this.peek().type == 'lineEnd' ) {
		this.shiftTokens();
	}

	if( this.tokens.length !== 0 ) {
		this.onWarning( CaternatorParser.EXCESS_AFTER_END, "Excess tokens found after parsing program.", this.tokens.slice( 0 ) )
	}

	return {
		statementSeq: statementSeq
	};
};

CaternatorParser.prototype.expectStatementSeq = function() {
	var output = [];

	var statement = this.expectStatement();

	if( statement ) output.push( statement );

	// then try to loop on this.
	while( true ) {
		if( this.peek( 0 ).type != 'lineEnd' )
			break;

		this.shiftTokens();

		statement = this.expectStatement();

		if( statement )
	}
	
	if( ! output.length )
		return null;
	else
		return output;
};



////////////////////////////////

function CompileError( message, options ) {
	Error.call( this, message );

	this.cause = options.cause || null;
}

CompileError.prototype = new Error();
