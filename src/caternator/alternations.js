var util = require( './util' );

// This is the big kahuna, and actually deals with the real behavior in this Alternation Thingy.

// - split Value into Alternation Items at each Alternation Delimiter Group:
// 	- Normalize Alternation Delimiters: If the first Item is not a Delimiter, unshift a non-conditional Delimiter.
// 	- Create Alternation Items from
// 		- each Alternation Delimiter
// 		- and the items between it and the next Alternation Delimiter, or the end of the list of Items.
// 			- Alternation Items can end up empty.
// - For each Alternation Item: map Items contained therein:
// 	- Word Token: create Constant Item of Word Token
// 	- Plain Group: create Alternation Set of Group, following the process of delimiting above.

// 	One possible implementation to split out Alternations:
// 	- Get indices of all Delimiters
// 	- Pair Delimiters with Items in Alternation Item:
// 		- Alternation’s own Items are sliced from list of all Items using the indices of the Delimiters.
// 		- since second arg of Array#slice() is optional, undef value means slice to end.  Shazam.

function AlternationSet( items, metadatas ) {
	this.alternationItems = createAlternationItems( items );
	this.metadata = mapMetadatas( metadatas );
}

function AlternationItem( delimiterGroup, items ) {
	// get metadatas and metadata groups:
	// - partition into (metadata|metadata groups), others
	
	if( delimiterGroup.condition ) {
		// create predicate function that acts like select or something...
	}
}



function createAlternationItems( items ) {
	var alternationDelimiterIndices = util.findIndicesOf( items, function delimiters( item ) {
		return item.type == 'group' && item.groupType == 'alternationDelimiter';
	});

	return alternationDelimiterIndices
		.map( function instantiate( delimIndex, indexIndex ) {
			var delimiter = items[ delimIndex ];
			var delimiterItems = items.slice( delimIndex + 1, alternationDelimiterIndices[ indexIndex + 1 ] );

			return new AlternationItem( delimiter, delimiterItems );
		});
}

exports.AlternationSet = AlternationSet;
