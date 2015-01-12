// caternator/grouper - Creates Specific Groups from Identified Tokens and Plain Groups.
// Has nothing to do with fish.

// process:
// - calls group matcher to get type of group.
// - creates specific group object for type of group.
// - recur on any sub groups in group.

var matcher = require( 'caternator/group-matcher' );

function identifyGroups( nestedLineTokens ) {
	return plainGroup( nestedLineTokens );
}

function identifyGroupsInItems( nestedTokens ) {
	var identifiedItems = nestedTokens.map( function identifyItem( item ) {
		// This only works because we're directly creating the arrays,
		// so we know we're not dealing with just Array-Like Objects.
		if( foo.constructor != Array ) {
			return item;
		}
		else {
			return mapGroupMatchResult( matcher.matchItems( item ) );
		}
	});
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

function metadataGroup( groupMatchResult ) {
	// body...
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
