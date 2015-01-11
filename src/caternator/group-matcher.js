// caternator/group-matcher - Matches sequences of items inside of groups.
// Returns a match object in sort of the same way the a regexp does, in that it doesn't if there's no match.
// group-matcher.matchItems does NOT create any Groups, merely matches the data for use therein.

// group-matcher.groupSpecs contains the group specs, so as to allow group-matcher to match against sub-groups.
// grouper is still responsible for actually creating the Groups proper.

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
	'condition': [
		[ 'word:if', 'variable', 'rest:predicateEquals' ],
		[ 'word:if', 'variable', 'rest:predicateIs' ],
		[ 'word:if', 'variable', 'rest:predicateHas' ]
	],
	'predicateEquals': [
		[ 'assign', 'rest:plain' ]
	],
	'predicateIs': [
		[ 'word:is', 'rest<metadata>' ]
	],
	'predicateHas': [
		[ 'word:has', 'metadata', 'assign', 'rest:plain' ]
	],
	'null': [
		[],
		[ 'word:none' ],
		[ 'word:nothing' ]
	]
};

// Result:
// - type: The type of group these items matched as.
// - items: The original items.
// - specs: The list of spec strings this matched against.
// - variables: Array of vars, if any were specified in spec list.
// - metadatas: Array of metadatas, if any were specified in the spec list.
// - functions: Array of functions, if any were specified in the spec list.
// - rest: a Result object representing what the Rest matched as, or null if no rest is specced.
// 
// Note: if rest is specified as a type of token, eg "rest<metadata>", then
// that type of token will be populated with the contents of rest, as well as
// the rest property being populated by a type=plain Result whose items property
// contains the same tokens.
// 
// Unspecified rest is treated as 'rest:plain'.
// 
// Condition types, since they use a separate group for the predicate, must
// have their predicate accessed through there.
// 
// thus predResult = result.rest; and predType = result.rest.type; etc.

// Note: condition is only checked as part of alternationDelimiter.
var groupSpecCheckOrder = [ 'metadata', 'alternationDelimiter', 'null' ];

// Always returns GroupMatchResult, never Null.
function matchItems( items ) {
	// something, anyway.
	// matches items against each spec, as specified in groupSpecCheckOrder.
	// First one to match, this adds that group type label to the results and returns it.
	// If no group in the group spec check order matches, returns all items with the label "plain".
	
	var result = null;
	var groupType = groupSpecCheckOrder.find( function typeOfGroup( specType ) {
		result = matchItemsAgainstType( items, specType );
		return !!result;
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

	specListList.find( function trySpecList( specList ) {
		result = result || matchItemsAgainst( items, specList );
		return !!result;
	});

	return result;
}

function matchItemsAgainst( items, specs ) {
	// convert spec into series of executable predicates.
	// if last spec item is some version of 'rest' then include that...
	//     if have rest predicate, then slurp any left over items and pass into rest.
	//     else, left over items fail the condition.  (default rest predicate of "must be no items left.")
	// test items each in turn.
	// since each item corresponds to a specific spec predicate,
	// the length of the spec (less a rest spec) can be sliced from the items.

	var restSpec = getRestSpec( specs );
	var initialSpecs = getInitialSpecs( specs );
	var initialPredicates = createPredicates( specs );
	var restPredicate = createRestPredicate( restSpec );
	var initialItems = items.slice( 0, initialSpecs.length );
	var restItems = items.slice( initialSpecs.length );

	var itemsMatch :Boolean, restMatch :Object;

	itemsMatch = initialPredicates.every( function testPredicate( predicate, index ) {
		return predicate( initialItems[ index ] );
	});

	restMatch = restPredicate( restItems );

	if( itemsMatch && restMatch ) {
		return groupMatchResultFromItemsRest( initialItems, restMatch );
	}
	else {
		return null;
	}
}

function getRestSpec( specs ) {
	var restSpec = specs[ specs.length - 1 ];

	if( restSpec.match( /^rest/i ) ) {
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
			// Might change later.
			throw new Error( 'MatchError: Invalid Rest Spec at ' + String( index ) + ': Rest Spec must occur only at end of Spec List.' );
		}
		else {
			throw new Error( 'MatchError: Invalid/Unknown Spec: ' + String( index ) + ': ' + String( spec ) + ' (spec list: ' + specs.join( ', ' ) + ')' );
		}
	});
}

// Rest predicates are a bit different, in that rather than a boolean return, they return a Result or null.
function createRestPredicate( restSpec ) {
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
		// certain group type.

		groupType = (/^rest:(.+)$/.exec( restSpec ) || [])[ 1 ];

		if( ! groupType ) {
			throw new Error( 'Predicate Error: No group type specified in rest spec "' + String( restSpec ) + '" for rest predicate.' );
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
				throw new Error( 'Predicate Error: Unknown group type specified in rest spec "' + String( restSpec ) + '" for rest predicate.' );
			}

			predicate = function restAsGroupPredicate( rest ) {
				return matchItemsAgainstType( rest, restAsGroupPredicate.groupType );
			};
		}

		predicate.specType = 'group';
		predicate.groupType = groupType;
	}
	else if( restSpec.match( /^rest</ ) ) {
		// rest consists only of one kind of tokens.

		tokenType = (/^rest<([a-z]+)>$/.exec( restSpec ) || [])[ 1 ];

		if( ! groupType ) {
			throw new Error( 'Predicate Error: No token type specified in rest spec "' + String( restSpec ) + '" for rest predicate.' );
		}

		predicate = function restWithTokenTypePredicate( rest ) {
			var result;
			var hasOnlyTokensOfType = rest.every( function testTokenType( token ) {
				return token.type == restWithTokenTypePredicate.tokenType;
			});

			if( hasOnlyTokensOfType ) {
				result = plainGroupMatchResultFromItems( rest );

				if( [ 'variable', 'metadata', 'function' ].indexOf( restWithTokenTypePredicate.tokenType ) != -1 ) {
					result[ restWithTokenTypePredicate.tokenType ] = result.items;
				}
			}

			return result;
		};

		predicate.specType = 'tokens';
		predicate.tokenType = tokenType;
	}
	else {
		throw new Error( 'MatchError: Invalid/Unknown Rest Spec: "' + String( restSpec ) + '"' );
	}

	return predicate;
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

function groupMatchResultFromItemsRest( items, restMatch ) {
	// body...
}
