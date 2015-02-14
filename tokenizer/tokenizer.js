
function noop() {}

function forEach( array, fn, context ) {
	var i, length;

	if( typeof Array.prototype.forEach == 'function' ) {
		array.forEach( fn, context );
	}
	else {
		for( i = 0, length = array.length; i < length; ++i ) {
			fn.call( context, array[ i ], i, array );
		}
	}
}

function find( array, fn, context ) {
	var i, length;

	if( typeof Array.prototype.find == 'function' ) {
		return array.find( fn, context );
	}
	else {
		for( i = 0, length = array.length; i < length; ++i ) {
			if( fn( array[ i ], i, array ) ) {
				return array[ i ];
			}
		}

		return void 0;
	}
}

// Creates functions with the signature String -> String | Null
function createTestFn( test ) {
	if( test.constructor == RegExp ) {
		return function regexTest( input ) {
			// Possibly inefficient to call exec on all the things?
			var match = test.exec( input );

			if( match && match.index == 0 ) {
				return match[ 0 ];
			}
			else {
				return null;
			}
		};
	}
	else if( typeof test == 'string' ) {
		return function stringTest( input ) {
			if( input.indexOf( test ) === 0 ) {
				return test;
			}
			else {
				return null;
			}
		};
	}
	else if( typeof test == 'function' ) {
		return test;
	}
	else {
		throw new Error( "Failed to create Test Function: Unsupported test type: " + String( test ) );
	}
}

function Tokenizer( options ) {
	options = options || {};

	this.onToken = options.onToken || noop; // this can also be assigned to after the fact.
	this.onFlush = options.onFlush || noop; // this can also be assigned to after the fact.
	this.rules = [];
	this.ignored = {};
	this.buffer = '';

	if( options.rules ) {
		this.addRules( options.rules );
	}
}

Tokenizer.prototype.addRule = function( ruleTest, tokenType, ignored ) {
	this.rules.push({
		test: createTestFn( ruleTest ),
		type: tokenType
	});

	this.ignored[ tokenType ] = !!ignored;
};

// Array<Array[3]>
Tokenizer.prototype.addRules = function( ruleList ) {
	var _this = this;

	// forEach( ruleList, this.addRule, this );
	ruleList.forEach( function applyAddRule( rule ) {
		this.addRule.apply( this, rule );
	}, this );
};

Tokenizer.prototype.ignoreType = function( tokenType, ignored ) {
	if( ignored === void 0 ) ignored = true;

	this.ignored[ tokenType ] = !! ignored;
};

Tokenizer.prototype.tokenize = function( input, noBuffer ) {
	if( this.buffer.length > 0 ) {
		input = this.buffer + input;
		this.buffer = '';
	}

	// Nothing to tokenize.
	if( ! input.length ) return;

	var ruleMatch = this.matchRules( input );

	if( ruleMatch ) {
		if( ruleMatch.slice == input && ! noBuffer ) {
			// Input may be incomplete, so store to buffer and wait.
			this.buffer = input;
		}
		else if( ruleMatch.slice == input && noBuffer ) {
			// Assume that this is the end of input.
			this.emitToken( ruleMatch );
			this.onFlush();
		}
		else {
			// Otherwise, Try to tokenize more input.
			this.emitToken( ruleMatch );
			this.tokenize( input.substring( ruleMatch.slice.length ), noBuffer );
		}
	}
	else {
		if( ! noBuffer ) {
			// Input may be incomplete, so store to buffer and wait.
			this.buffer = input;
		}
		else {
			// Throw an error because there's invalid/unmatched input.
			var error = new Error( "Cannot tokenize remaining unbuffered input: " + String( input ).substring( 0, 16 ) + '...' );
			error.input = input;

			throw error;
		}
	}

	return this;
};

// String -> Match | Null
Tokenizer.prototype.matchRules = function( input ) {
	var _this = this;
	var match, matchingRule, slice;

	matchingRule = find( this.rules, function testRule( rule ) {
		return !! (slice = rule.test( input ));
	});

	if( matchingRule ) {
		match = {
			rule: matchingRule,
			slice: slice
		}
	}

	return match || null;
};

Tokenizer.prototype.emitToken = function( ruleMatch ) {
	var token = { type: ruleMatch.rule.type, value: ruleMatch.slice };

	if( this.ignored[ token.type ] ) return;
	
	this.onToken( token );
};

Tokenizer.prototype.flush = function() {
	return this.tokenize( '', true );
};

module.exports = Tokenizer;