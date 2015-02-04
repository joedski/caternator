

var productions = require( './productions' );
var expect = require( './expect' );

function expectProgram( tokens ) {
	var production = expect.sequenceOf([
		expectStatementSeq,
		expect.optional( expect.terminal({ type: 'lineEnd' }) )
	], tokens );

	if( production ) {
		return new productions.Production( 'program', production.contents );
	}
	else {
		return null;
	}
}



////////////////////////////////

function CompileError( message, options ) {
	Error.call( this, message );

	this.cause = options.cause || null;
}

CompileError.prototype = new Error();
