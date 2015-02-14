
/**

Caternator
==========

Usage
-----

```
var c = new Caternator();
var p = c.compile( programString );
var r = p.select();

console.log( r.toString() );
```

 */

var tokenizer = require( '../tokenizer/tokenizer' );

function Caternator() {
}

function compile( programString ) {
	// For now, it will suffice to simply tokenize the whole document and parse only on flush.
	var tokenizer = getNewTokenizer.call( this );
	var parser = null; //new parser.CaternatorParser( tokenizer );
	var program = parser.parse( programString );

	return program;
};

// internal methods.
function getNewTokenizer() {
	return new tokenizer.Tokenizer({
		rules: [
			[ (/^\r?\n/), 'lineEnd' ],
			[ (/^\s+/), 'whitespace', true ], // ignore.
			[ (/^\(/), 'groupBegin' ],
			[ (/^\)/), 'groupEnd' ],
			[ (/^\.\.\./), 'functionArguments' ],
			[ (/^\$[a-z0-9-_]+/), 'variable' ],
			[ (/^@[a-z0-9-_]+/), 'function' ],
			[ (/^#[a-z0-9-_]+/), 'metadata' ],
			[ (/^=/), 'assign' ],
			// Be careful making the catch all:
			// It has to not cover any of the previous specific tokens.
			// \r\n is covered by \s.
			[ (/^[^\s\(\)\$#@=]+/), 'text' ],
		]
	});
}
