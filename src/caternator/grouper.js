// caternator/grouper - Creates Specific Groups from Identified Tokens and Plain Groups.
// Has nothing to do with fish.

// Identify Groups turns generic groups/arrays into Groups structured to make
// creation of the actual Runtime Objects mostly plug and play.

// Types of Groups
// ===============
// 
// All groups have the property 'type' set to the value 'group'.
// 
// Plain Group
// -----------
// 
// {
//     type: 'group',
//     groupType: 'plain',
//     items: [...]<Group|Token>
//         All of the items contained within this Group.
//         Any sub-groups in this list of items are also run through identifyGroups().
// }
// 
// Alternation Delimiter Group
// ---------------------------
// 
// Alternation Delimiters may have an Optional Condition Group attached to them.
// They themselves have the following properties:
// 
// {
//     type: 'group',
//     groupType: 'alternationDelimiter',
//     condition: ConditionGroup|null = {
//          type: 'group',
//          groupType: 'condition',
//          subject: String
//          predicate: PredicateGroup = {
//              type: 'group',
//              groupType: 'predicate',
//              predicateType: String = 'is' | 'has',
//              negated: Boolean
//              // is-type
//              metadatas: Array<String>
//              // has-type
//              metadatas: Array<String>
//              value: PlainGroup
//         }
//     }
// }
// 
// Condition Group
// ---------------
// 
// Condition Groups hold the information on what condition, if any,
// needs to be fulfilled for the Alternation it's attached to
// to be considered valid.
// They have the following properties:
// - groupType = 'condition'
// - subject: String; The variable name which is the subject of this condition.
// - predicate: PredicateGroup; The predicate which is applied to the subject.
// 
// Predicate Group
// ---------------
// 
// A Predicate Group holds the actual test which is applied to its parent
// Condition Group's Subject.  They come in a few different flavors, detailed below.
// 
// ### 'is'-Type Predicates
// 
// An 'is'-type Predicate indicates a check on whether a Subject has certain metadatas defined on it,
// implicitly with some value that is not the Null Group or the Word 'no'.
// They have the following properties:
// - groupType = 'predicate'
// - predicateType = 'is'
// - negated: Boolean; Whether or not the truth value returned by evaluation of this predicate
//     should be negated.
// - metadatas: Array<String>; The metadata names that the subject should have defined on it
//     in order for this Predicate to evaluate to True.
//     
// TODO: Is-type Predicates should use a value:PlainGroup for comparison.  The metadatas defined on the predicate value will determine what metadatas should be defined on the targe.
// 
// ### 'has'-Type Predicates
// 
// A 'has'-type Predicate indicates a check on whether a Subject has an attached metadata either
// defined and equal to a certain value, or undefined ('equal' to a Null Group.)
// These have the following properties:
// - groupType = 'predicate'
// - predicateType = 'has'
// - negated: Boolean; Whether or not the truth value returned by evaluation of this predicate
//     should be negated.
// - metadatas: Array<String>; The metadata names whose values will be checked against 
//     this predicate's value.  Currently, this will only contain 1 metadata name.
// - value: PlainGroup; The value to which the metadata's own value is compared.
//     This will be converted to an Alternation Set or Constant later.  In the former case,
//     the metadata has to match only one of the Alternation Set's Alternation Items to be valid.
//     
// ### 'equals'-Type Predicates
// 
// An 'equals'-type Predicate indicates a check on the actual value that the subject
// has Selected to.  Note that this isn't very useful and isn't fully supported yet.
// These have the following properties:
// - groupType = 'predicate'
// - predicateType = 'equals'
// - negated: Boolean; Whether or not the truth value returned by evaluation of this predicate
//     should be negated.
// - value: PlainGroup; The value(s) to which the Subject's own values will be compared.
//     As value is a PlainGroup, it will be converted into an Alternation Set or Constant,
//     and in the former case need only match one of the Alternation Items within the Set.
// 
// Null Group
// ----------
// 
// The simplest of all Groups, this represents an empty or null value.
// Special case of the Plain Group.
// It has but the following additional property:
// 
// {
//     type: 'group',
//     groupType: 'null'
// }
// 
// Function Call Group
// -------------------
// 
// {
//     type: 'group',
//     groupType: 'functionCall',
//     name: String // Function name
//     arguments: PlainGroup|NullGroup|FunctionCallGroup // Chained calls.
// }

var tokenizer = require( './tokenizer' );
var matcher = require( './group-matcher' );

function identifyGroups( nestedLineTokens ) {
	return nestedLineTokens.map( identifyItem );
}

function identifyItem( item ) {
	// This only works because we're directly creating the arrays,
	// so we know we're not dealing with just Array-Like Objects.
	if( foo.constructor != Array ) {
		return item;
	}
	else {
		return mapGroupMatchResult( matcher.matchItems( item ) );
	}
}

// Maps a GroupMatchResult to a friendlier data structure.
function mapGroupMatchResult( groupMatchResult ) {
	var createGroup = {
		'metadata': metadataGroup,
		'alternationDelimiter': alternationDelimiterGroup,
		'null': nullGroup,
		'plain': plainGroup
	}[ groupMatchResult.type ];

	if( ! createGroup ) {
		throw new GroupMatchError( '"' + groupMatchResult.type + '" is not a valid group type.', {
			groupMatchResult: groupMatchResult
		});
	}
	else {
		return createGroup( groupMatchResult );
	}
}

function group( groupType, options ) {
	options.type = 'group';
	options.groupType = groupType;

	return options;
}

function metadataGroup( groupMatchResult ) {
	return group( 'metadata', {
		metadataMap: (function createMetadataMap() {
			var map = {};

			if( groupMatchResult.metadatas.length > 1 ) {
				groupMatchResult.metadatas.forEach( function setMetadataMapping( metadataToken ) {
					// The default value for a metadata is always 'yes'.
					map[ metadataToken.value ] = plainGroupFromWords([ 'yes' ]);
				});
			}
			else {
				map[ groupMatchResult.metadatas[ 0 ].value ] = plainGroup( groupMatchResult.rest );
			}
		}())
	});
}

function alternationDelimiterGroup( groupMatchResult ) {
	return group( 'alternationDelimiter', {
		condition: groupMatchResult.rest ? conditionGroup( groupMatchResult.rest ) || null
	});
}

function nullGroup( groupMatchResult ) {
	return group( 'null' );
}

function plainGroupFromWords( words ) {
	return plainGroup( matcher.matchItems( tokenizer.identifyTokens( words ) ) );
}

// Only items whose groups have already been identified should use this.
// Which basically means this is only used by the function call normalizer.
function plainGroupFromIdentifiedItems( identifiedItems ) {
	return group( 'plain', {
		items: identifiedItems
	});
}

function plainGroup( groupMatchResult ) {
	return group( 'plain', {
		items: normalizeFunctionCalls( identifyGroups( groupMatchResult.items ) )
	});
}

function conditionGroup( groupMatchResult ) {
	return group( 'condition', {
		subject: groupMatchResult.variables[ 0 ].value,
		predicate: predicateGroup( groupMatchResult.rest )
	});
}

function functionCallGroupFromNameAndArgs( name, args ) {
	return group( 'functionCall', {
		name: name,
		arguments: args
	});
}

function predicateGroup( predicateGroupMatchResult ) {
	return group( 'predicate', {
		// one of 'predicateEquals', 'predicateIs', 'predicateIsNot', 'predicateHas', 'predicateDoesNotHave'.
		predicateType: (function mapPredicateType() {
			switch( predicateGroupMatchResult.type ) {
				case 'predicateEquals': return 'equals'; break;

				case 'predicateIs':
				case 'predicateIsNot':
					return 'is';
					break;

				case 'predicateHas':
				case 'predicateDoesNotHave':
					return 'has';
					break;

				default:
					throw new GroupMatchError( '"' + predicateGroupMatchResult.type + '" is not a valid condition predicate type.', {
						groupMatchResult: predicateGroupMatchResult
					});
			}
		}()),

		negated: (function mapPredicateNegation() {
			switch( predicateGroupMatchResult.type ) {
				case 'predicateEquals':
				case 'predicateIs':
				case 'predicateHas':
					return false;

				case 'predicateIsNot':
				case 'predicateDoesNotHave':
					return true;

				default:
					throw new GroupMatchError( '"' + predicateGroupMatchResult.type + '" is not a valid condition predicate type.', {
						groupMatchResult: predicateGroupMatchResult
					});
			}
		}()),

		metadatas: predicateGroupMatchResult.metadatas.map( function unwrap( metadataToken ) { return metadataToken.value; }),
		value: predicateGroupMatchResult.rest.type == 'plain' ? plainGroup( predicateGroupMatchResult.rest ) : null
	});
}

function normalizeFunctionCalls( items ) {
	var itemsReversed = items.slice( 0 );
	var normalizedItemsReversed = [];
	itemsReversed.reverse();

	itemsReversed.forEach( function checkItems( item, index ) {
		var nextItem = normalizedItemsReversed[ checkItems.length - 1 ];

		if( item.type == 'function' ) {
			if( ! nextItem ) {
				nextItem = nullGroup();
			}
			else if( nextItem.type != 'group' ) {
				nextItem = plainGroupFromIdentifiedItems([ nextItem ]);
			}
			else switch( nextItem.groupType ) {
				case 'plain':
				case 'functionCall':
				case 'null':
					break;

				default:
					nextItem = plainGroupFromIdentifiedItems([ nextItem ]);
					break;
			}

			normalizedItemsReversed.pop();
			normalizedItemsReversed.push( functionCallGroupFromNameAndArgs( item.value, nextItem ) );
		}
		else {
			normalizedItemsReversed.push( item );
		}
	});

	normalizedItemsReversed.reverse();
	return normalizedItemsReversed;
}



function GroupMatchError( message, options ) {
	options = options || {};

	Error.call( this, message );

	this.name = 'GroupMatchError';
	this.groupMatchResult = options.groupMatchResult;
}

GroupMatchError.prototype = new Error();



exports.identifyGroups = identifyGroups;
exports.GroupMatchError = GroupMatchError;
