// caternator/grouper - Creates Specific Groups from Identified Tokens and Plain Groups.
// Has nothing to do with fish.

// process:
// - calls group matcher to get type of group.
// - creates specific group object for type of group.
// - recur on any sub groups in group.

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
		return createGroup
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

function plainGroup( groupMatchResult ) {
	return group( 'plain', {
		items: identifyGroups( groupMatchResult.items )
	});
}

function conditionGroup( groupMatchResult ) {
	return group( 'condition', {
		subject: groupMatchResult.variables[ 0 ].value,
		predicate: predicateGroup( groupMatchResult.rest )
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

		metadatas: predicateGroupMatchResult.metadatas,
		value: predicateGroupMatchResult.rest.type == 'plain' ? predicateGroupMatchResult.rest : null
	});
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
