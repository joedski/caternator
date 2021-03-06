// caternator/group-matcher - Matches sequences of items inside of groups.
// Returns a match object in sort of the same way the a regexp does, in that it doesn't if there's no match.
// group-matcher.matchItems does NOT create any Groups, merely matches the data for use therein.
// I didn't know this at the time of writing but this is a very (very) rudimentary compiler compiler.
// Go me?

// Exports:
// - matchItems( items :Array ) :GroupMatchResult
//     Determines the Group Type of the group whose contents are the items provided.
//     If no specific Group Type is matched, this returns a Plain Type Group.

// GroupMatchResult: (Note, no actual 'class' is defined.)
// Properties:
// - type: String; The Type of the Group these items matched as.
// - items: Array<Token|Array>; The original items.
// - specs: Array<String>; The specs that these items matched against.
// - variables: Array<Token>; Any variable tokens that have a corresponding spec in the spec list.
// - metadatas: Array<Token>; Any metadata tokens that have a corresponding spec in the spec list.
// - functions: Array<Token>; Any function tokens that have a corresponding spec in the spec list.
// - rest: GroupMatchResult | Null; The results of matching the rest of the items.
// 
// If a spec line doesn't specify a 'rest' group at the end, then
// the line is treated as being fixed length, and the GroupMatchResult will have rest=null.
// 
// A rest spec of 'rest:groupType' specifies that the GroupMatchResult from matching the rest of the items
// as a new Group must be of the listed type.  Writing just 'rest' is the same as writing 'rest:plain'.

// GroupSpec
// A Group Spec is an array of spec strings, usually just called specs.
// It may consist of 0 or more of these specs, the last of which can be a 'rest' spec of some sort.
// A 'rest' spec anywhere else is considered an error.
// 
// Where a Group Spec does not have a 'rest' spec, the list of Tokens passed into matchItems()
// MUST have the same number of items as the Group Spec to be considered valid.
// Partial matches are not allowed.
// 
// The following Spec Strings are currently supported:
// - 'metadata': Indicates a metadata token should appear in this position.
// - 'variable': Indicates a variable token should appear in this position.
// - 'function': Indicates a function token should appear in this position.
// - 'word': Indicates a word token should appear in this position.
// - 'word:foo': Indicates a word token with the value 'foo' should appear in this position.
// - 'rest': This is treated as 'rest:plain'.
// - 'rest:plain': Indicates the rest of the items after the constant portion,
//     when treated as a new Group, should match the 'plain' group type.
//     In addition to the 'plain' group type, any group type specified in the
//     groupSpecsMap are allowed.
// - 'rest<metadata>': Indicates the rest of the items after the constant portion should all be metadata tokens.
//     This will treat the items as a plain group regardless of what they would normally match.
//     Note that this requires the items to be tokens.  Sub-groups appearing in this spec position are invalid.
//     Any token type may be used, although if the token type is specified to be 'variable', 'metadata', or 'function',
//     then the tokens that match this spec will also be included in the 'variables', 'metadata', or 'functions'
//     property of the GroupMatchResult that results from this spec,
//     and will in turn be included in the parent's respective list property.

var groupSpecsMap = {
	// Note: 'plain' is not included here because 'plain' is the default type.
	'metadata': [
		[ 'rest<metadata>' ],
		[ 'metadata', 'assign', 'rest:plain' ]
	],
	'alternationDelimiter': [
		[ 'word:or' ],
		[ 'word:or', 'rest:condition' ],
		[ 'rest:condition' ]
	],
	'null': [
		[],
		[ 'word:none' ],
		[ 'word:nothing' ]
	],

	// condition has 3 different forms, detailed below.
	'condition': [
		[ 'word:if', 'variable', 'rest:predicateEquals' ],
		[ 'word:if', 'variable', 'rest:predicateIs' ],
		[ 'word:if', 'variable', 'rest:predicateIsNot' ],
		[ 'word:if', 'variable', 'rest:predicateHas' ],
		[ 'word:if', 'variable', 'rest:predicateDoesNotHave' ]
	],

	// 3 separate predicates make the type of predicate unambiguous,
	// meaning no duck-typing later.
	'predicateEquals': [
		[ 'assign', 'rest:plain' ]
	],
	// No negated form of equals?
	'predicateIs': [
		[ 'word:is', 'rest<metadata>' ]
	],
	'predicateIsNot': [
		[ 'word:is', 'word:not', 'rest<metadata>' ],
		[ 'word:isn\'t', 'rest<metadata>' ]
	],
	'predicateHas': [
		[ 'word:has', 'metadata', 'assign', 'rest:plain' ]
	],
	'predicateDoesNotHave': [
		[ 'word:does', 'word:not', 'word:have', 'metadata', 'assign', 'rest:plain' ],
		[ 'word:doesn\'t', 'word:have', 'metadata', 'assign', 'rest:plain' ]
	]
};

// Note: condition is only checked as part of alternationDelimiter.
var groupSpecCheckOrder = [ 'metadata', 'alternationDelimiter', 'null' ];

// Always returns GroupMatchResult, never Null.
function matchItems( items ) {
	var result = null;
	var groupType;

	groupSpecCheckOrder.forEach( function typeOfGroup( specType ) {
		if( result ) return;

		result = matchItemsAgainstType( items, specType );
		groupType = specType;
	});

	if( ! result ) {
		return plainGroupMatchResultFromItems( items );
	}
	else {
		return result;
	}
}

// -> GroupMatchResult | Null
function matchItemsAgainstType( items, specType ) {
	var specListList = groupSpecsMap[ specType ] || [];
	var result = null;

	specListList.forEach( function trySpecList( specList ) {
		result = result || matchItemsAgainst( items, specList );
	});

	if( result ) {
		result.type = specType;
	}

	return result;
}

function matchItemsAgainst( items, specs ) {
	// Creating a bunch of functions.  Slow?  Maybe.
	var restSpec = getRestSpec( specs );
	var initialSpecs = getInitialSpecs( specs );
	var initialPredicates = createPredicates( initialSpecs );
	var restPredicate = createRestPredicate( restSpec );
	var initialItems = items.slice( 0, initialSpecs.length );
	var restItems = items.slice( initialSpecs.length );

	var itemsMatch, // Boolean
		restMatch; // Object | Null

	if( initialSpecs.length === 0 ) {
		itemsMatch = (initialSpecs.length === initialItems.length);
	}
	else {
		itemsMatch = initialPredicates.every( function testPredicate( predicate, index ) {
			return (initialItems[ index ] != null) && predicate( initialItems[ index ] );
		});
	}

	restMatch = restPredicate( restItems );

	if( itemsMatch && restMatch ) {
		return {
			items: items.slice( 0 ),
			specs: specs.slice( 0 ),
			variables: getVariablesFromItems( initialItems, initialSpecs ).concat( restMatch.variables ),
			metadatas: getMetadatasFromItems( initialItems, initialSpecs ).concat( restMatch.metadatas ),
			functions: getFunctionsFromItems( initialItems, initialSpecs ).concat( restMatch.functions ),
			rest: restMatch
		}
	}
	else {
		return null;
	}
}

function getRestSpec( specs ) {
	var restSpec = specs[ specs.length - 1 ];

	// check if defined first because empty specs. (see Null Group type.)
	if( restSpec && restSpec.match( /^rest/i ) ) {
		return restSpec;
	}
	else {
		return '';
	}
}

function getInitialSpecs( specs ) {
	var restSpec = getRestSpec( specs );

	if( restSpec ) {
		return specs.slice( 0, specs.length - 1 );
	}
	else {
		return specs.slice( 0 );
	}
}

// Creating one-off fns is probably the slowest way to do it... (but maybe not for mighty V8, stronk JS engine?)
function createPredicates( specs ) {
	return specs.map( function specToPredicate( spec, index ) {
		var err;
		var match;

		var specWordIndex = 0;
		var plainSpecWords = [
			'word',
			'variable',
			'metadata',
			'function',
			'assign'
		];

		// one off fns are not as problematic as this bigass ifthen chain, though.
		if( spec.match( /^word:/ ) ) {
			match = /^word:(.+)/i.exec( spec );
			return function wordValuePredicate( token ) {
				return (token.type == 'word') && (token.value.toLowerCase() == match[ 1 ].toLowerCase());
			};
		}
		else if( (specWordIndex = plainSpecWords.indexOf( spec )) != -1 ) {
			return (function createPlainSpecWordPredicate( closuredSpecWordIndex ) {
				return function plainSpecWordPredicate( token ) {
					return (token.type == plainSpecWords[ closuredSpecWordIndex ]);
				};
			}( specWordIndex ));
		}
		else if( spec.match( /^group/ ) ) {
			if( spec == 'group' ) spec = 'group:plain';

			return function groupPredicate( group ) {
				return (typeof group) == 'array';
			};
		}
		else if( spec.match( /^rest/ ) ) {
			// Might change later?  Then again, I don't want to have to keep trying things.
			// Of course, if only one 'rest' spec is allowed per spec line,
			// then it becomes just a matter of evaluating finalSpecs against finalItems,
			// with restItems being whatever's between the two.
			throw new MatchError( 'Invalid Rest Spec at ' + String( index ) + ': Rest Spec must occur only at end of Spec List.', {
				spec: spec
			});
		}
		else {
			throw new MatchError( 'Invalid/Unknown Spec: ' + String( index ) + ': ' + String( spec ) + ' (spec list: ' + specs.join( ', ' ) + ')' {
				spec: spec
			});
		}
	});
}

// Rest predicates are a bit different, in that rather than a boolean return, they return a Result or null.
function createRestPredicate( restSpec ) {
	var err;
	var predicate, groupType, tokenType;

	if( ! restSpec ) {
		predicate = function( rest ) {
			return rest.length === 0;
		};

		predicate.specType = 'null';

		return predicate;
	}

	if( restSpec == 'rest' ) {
		restSpec = 'rest:plain';
	}

	if( restSpec.match( /^rest:/ ) ) {
		predicate = createRestGroupTypePredicate( restSpec );
	}
	else if( restSpec.match( /^rest</ ) ) {
		predicate = createRestTokenTypePredicate( restSpec );
	}
	else {
		throw new MatchError( 'Invalid/Unknown Rest Spec: "' + String( restSpec ) + '"', {
			spec: restSpec
		});
	}

	return predicate;
}

function createRestGroupTypePredicate( restSpec ) {
	var groupType;

	groupType = (/^rest:(.+)$/.exec( restSpec ) || [])[ 1 ];

	if( ! groupType ) {
		throw new PredicateError( 'No group type specified in rest spec "' + String( restSpec ) + '" for rest predicate.', {
			spec: restSpec
		});
	}

	if( groupType == 'plain' ) {
		predicate = function restAsPlainGroupPredicate( rest ) {
			var result = matchItems( rest );

			if( result.type == 'plain' ) {
				return result;
			}
			else {
				return null;
			}
		}
	}
	else {
		if( ! groupSpecsMap[ groupType ] ) {
			throw new PredicateError( 'Unknown group type specified in rest spec "' + String( restSpec ) + '" for rest predicate.', {
				spec: restSpec
			});
		}

		predicate = function restAsGroupPredicate( rest ) {
			return matchItemsAgainstType( rest, restAsGroupPredicate.groupType );
		};
	}

	predicate.specType = 'group';
	predicate.groupType = groupType;

	return predicate;
}

function createRestTokenTypePredicate( restSpec ) {
	var tokenType;

	tokenType = (/^rest<([a-z]+)>$/.exec( restSpec ) || [])[ 1 ];

	if( ! tokenType ) {
		throw new PredicateError( 'No token type specified in rest spec "' + String( restSpec ) + '" for rest predicate.', {
			spec: restSpec
		});
	}

	predicate = function restWithTokenTypePredicate( rest ) {
		var result;
		var hasOnlyTokensOfType = rest.every( function testTokenType( token ) {
			return token.type == restWithTokenTypePredicate.tokenType;
		});

		if( hasOnlyTokensOfType ) {
			result = plainGroupMatchResultFromItems( rest );

			if( [ 'variable', 'metadata', 'function' ].indexOf( restWithTokenTypePredicate.tokenType ) != -1 ) {
				result[ pluralPropertyNameOf( restWithTokenTypePredicate.tokenType ) ] = result.items;
			}
		}

		return result;
	};

	predicate.specType = 'tokens';
	predicate.tokenType = tokenType;

	return predicate;
}

function pluralPropertyNameOf( propertyName ) {
	// no exceptions.  Yet.
	// probably ch or sh endings among others.
	// y is a problematic one.
	return propertyName + 's';
}

function plainGroupMatchResultFromItems( items ) {
	return {
		type: 'plain',
		items: items.slice( 0 ),
		specs: [],
		variables: [],
		metadatas: [],
		functions: [],
		rest: null // null because rest is an optional Result.
	};
}

function getTokensOfTypeFromItems( type, items, specs ) {
	// Note: At this point, only items/specs pairs that passed matching will be use here.
	// Therefore no bounds checking should be needed.  Should.
	return items.filter( function isVariableAtSpec( item, index ) {
		return specs[ index ] == type;
	});
}

function getVariablesFromItems( items, specs ) {
	return getTokensOfTypeFromItems( 'variable', items, specs );
}

function getMetadatasFromItems( items, specs ) {
	return getTokensOfTypeFromItems( 'metadata', items, specs );
}

function getFunctionsFromItems( items, specs ) {
	return getTokensOfTypeFromItems( 'function', items, specs );
}



function MatchError( message, options ) {
	options = options || {};

	Error.call( this, message );

	this.name = 'MatchError';
	this.spec = options.spec;
}

MatchError.prototype = new Error();

function PredicateError( message, options ) {
	options = options || {};

	Error.call( this, message );

	this.name = 'PredicateError';
	this.spec = options.spec;
}

PredicateError.prototype = new Error();



exports.matchItems = matchItems;
exports.MatchError = MatchError;
exports.PredicateError = PredicateError;
