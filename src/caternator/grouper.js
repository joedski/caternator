// caternator/grouper - Creates Specific Groups from Identified Tokens and Plain Groups.
// Has nothing to do with fish.

// process:
// - calls group matcher to get type of group.
// - creates specific group object for type of group.
// - recur on any sub groups in group.

var matcher = require( 'caternator/group-matcher' );

var groupTypes = {
	plain: 'plain',
	metadata: 'metadata',
	alternationItemDelimiter: 'alternation item delimiter',
	condition: 'condition'
};

function identifyGroups( line ) {
	// line.nestedTokens...

	line.groups = plainGroup( line.nestedTokens );

	return line;
}

function identifyGroupsInItems( nestedTokens ) {
	var identifiedItems = nestedTokens.map( function identifyItem( item ) {
		if( (typeof item) != 'array' ) {
			return item;
		}
		else if( isMetadataGroup( item ) ) {
			return metadataGroup( item );
		}
		else if( isAlternationDelimiterGroup( item ) ) {
			return alternationDelimiterGroup( item );
		}
		else {
			return plainGroup( item );
		}
	});
}

function plainGroup( nestedTokens ) {
	var group = {};
	group.type = groupTypes.plain;
	group.items = identifyGroupsInItems( nestedTokens );
	return group;
}

function metadataGroup( nestedTokens ) {
	var group = {};
	group.type = groupTypes.metadata;
	// TODO: no items.  map :Object { '#key': value }...
	group.map = {};
	return group;
}

function alternationDelimiterGroup( nestedTokens ) {
	var group = {};
	group.type = groupTypes.alternationItemDelimiter;
	// TODO: Get condition...
	group.condition = null;
	return group;
}

function conditionGroup( nestedTokens ) {
	var group = {};
	group.type = groupTypes.condition;
	// TODO: Create condition...
	group.condition = {};
	return group;
}
