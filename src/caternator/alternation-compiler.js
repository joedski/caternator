// Compiles Group objects into Alternation Things.

var util = require( './util' );
var alternations = require( './alternations' );

// Array<Item>, Map|Null -> AlternationSet<AlternationItem>
// Assumes that these items represent the top level contents of an AlternationSet.
function compile( items, statementMetadata ) {
	return new alternations.AlternationSet(
		createAlternationItemListFromItems( items ),
		statementMetadata || new util.Map()
	);
}

function createAlternationSet( items ) {
	// body...
}

exports.compile = compile;
