var util = require( './util' );

// This is the big kahuna, and actually deals with the real behavior in this Alternation Thingy.
// NOTE: In all cases, the 'environment' here refers to a memoized environment,
// not the plain data-object enviornment.

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
	this.uid = alternationSetUIDGen.getNext();
	this.alternationItems = createAlternationItems( items );
	this.metadata = mapMetadatas( metadatas );
	this.cacheSatisfactionRequirements();
}

// The environment passed in is a memoized environment.
// returns an array of Selected results.
AlternationSet.prototype.select = function( environment ) {
	// do the thing!
	// - 
};

// Selects then returns only one of the Selected results at random.
AlternationSet.prototype.selectOne = function( environment ) {
	var selectionResults = this.select( environment );
	var index = Math.random() * selectionResults.length << 0;

	return selectionResults[ index ];
};

AlternationSet.prototype.cacheSatisfactionRequirements = function() {
	this.satisfactionRequirements = new SatisfactionRequirements( this.alternationItems.map( function( item ) {
		return item.satisfactionRequirements;
	}));
};



function SatisfactionRequirements( subRequirementsList ) {
	// A variable is Required if all Alternation Items in this Set Require that Variable.
	// otherwise, a variable is Optional.
	// Process:
	// - for each Alternation Item, collect Fulfillment Requirements.
	// - for each Variable in Item's Funfillment Requirements:
	//   - increment that Variable's Required count if it is Required
	//   - increment that Variable's Optional count if it is Optional
	// - Set this Alternation Set's Fulfillment Requirements:
	//   - if a Variable's Required count is equal to the number of Alternation Items present,
	//     IE every Alternation Item requires this variable,
	//     - set Variable as Required.
	//   - otherwise, set Variable as Optional.
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



function AlternationItem( delimiterGroup, items ) {
	// get metadatas and metadata groups:
	// - partition into (metadata|metadata groups), others

	this.uid = alternationItemUIDGen.getNext();
	
	if( delimiterGroup.condition ) {
		this.conditional = true;
		this.condition = new AlternationCondition( delimiterGroup.condition );
		// create predicate function that acts like select or something...
	}
	else {
		this.conditional = false;
	}

	this.extractAndSaveMetadatas( items );
	this.cacheSatisfactionRequirements();
}

AlternationItem.prototype.select = function( environment ) {
	// do the thing!
};

AlternationItem.prototype.isSatisfiedBy = function( environment ) {
	// body...
};

AlternationItem.prototype.cacheSatisfactionRequirements = function() {
	var requirements = {};

	this.items
};



// Evaluation of Alternation Conditions:
// - 

function AlternationCondition( group ) {
	this.subject = group.subject;
	this.predicate = new AlternationConditionPredicate( group.predicate );
}

AlternationCondition.prototype.isFulfilledBy = function( environment ) {
	// Evaluate condition against environment.
};

function AlternationConditionPredicate( predicateGroup ) {
	this.type = predicateGroup.predicateType;
	this.negated = predicateGroup.negated;
	this.metadataNames = predicateGroup.metadatas;

	if( predicateGroup.value ) {
		this.value = new AlternationSet( predicateGroup.value );
	}

	this.predicate = switchPredicate.call( this, predicateGroup );
}

function switchPredicate( predicateGroup ) {
	switch( this.type ) {
		case 'is':
			return predicateIs;

		case 'has':
			return predicateHas;

		case 'equals':
			return predicateEquals;

		default:
			throw new Error( 'Unknown Predicate Type: ' + String( this.type ) );
	}
}

function predicateIs( subjectName, environment ) {
	// get current value of subjectName fron environment's variables.
	// if subject has defined all metadatas specified in this.metadataNames,
	// then true.
	// else false.
}

function predicateHas( subjectName, environment ) {
	// get current value of subjectName fron environment's variables.
	// if subject has metadata name(s) specified this.metadataNames
	//    and their values are equal to the selection of the Alternation Set in this.value,
	// then true.
	// else false.
}



function SelectionResult( options ) {
	options = options || {};

	this.requiredVariablesSatisfied = options.requiredVariablesSatisfied || 0;
}



// TODO: Remove code requiring this function into statement-compile,
// because it's in the wrong place and should not be here.
function partitionSubject( subjectItems, otherType ) {
	return util.partition( subjectItems, function( item ) {
		if( item.type == otherType ) return otherType;
		if( item.type == 'metadata' ) return metadata;
		if( item.type == 'group' && item.groupType == 'metadata' ) return metadata;
		return '*';
	});
}



var alternationSetUIDGen = new util.UIDGen( 'alternationSet:' );
var alternationItemUIDGen = new util.UIDGen( 'alternationItem:' );



exports.AlternationSet = AlternationSet;
