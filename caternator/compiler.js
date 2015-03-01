// Converts Productions into a Program.

var util = require( './util' );
var Program = require( './program' );
var alternations = require( './alternations' );

// Production<"Program"> -> Program
exports.compile = function compile( programProduction ) {
	return new Program({
		variableStatements: compileAllVariableStatements( programProduction ),
		functionStatements: compileFunctionStatements( programProduction ),
		outputStatements: compileOutputStatements( programProduction )
	});
}

function compileAllVariableStatements( programProduction ) {
	// get only variable statement productions.
	// convert into Variable Statements.
	// return.
	return programProduction.contents
		.filter( function onlyVariableStatementProductions( production ) {
			return production.ruleName == 'varStatement';
		})
		.map( compileVariableStatement );
}

function compileVariableStatement( variableStatementProduction ) {
	// 0 should be a TerminalProduction.
	var subject = variableStatementProduction.contents[ 0 ].terminal.value;
	var metadataGroups = variableStatementProduction.contents.slice( 1 ).filter( productionsNamed( 'metaGroup' ) );
	var metadataMap = metadataMapFromGroups( metadataGroups );
	var rawItems = variableStatementProduction.contents[ variableStatementProduction.contents.length - 1 ].contents;
	// var alternationItems = itemAndDelimiterPairsFromRawItems( rawItems ).map( compileItemAndDelimiterPair );
	var alternationSet = compileItemSequence( rawItems, metadataMap );
}



function compileItemSequence( rawItemArray, metadataMap ) {
	// metadataMap is optional.
	var alternationItems = itemAndDelimiterPairsFromRawItems( rawItems ).map( compileItemAndDelimiterPair );

	return new alternations.AlternationSet( alternationItems, metadataMap );
}

function metadataMapFromGroups( metadataGroups ) {
	var metadataMap = new util.StringMap();

	function addMetaSeq( metaSeqProduction ) {
		metaSeqProduction.contents.forEach( function( metaTerminalProduction ) {
			metadataMap.set( metaTerminalProduction.terminal.value, new alternations.AlternationTerminal( 'yes' ) );
		});
	}

	function addMetaAssignSeq( metaAssignSeqProduction ) {
		var subject = metaAssignSeqProduction.contents[ 0 ].terminal.value;
		var alternationSet = compileItemSequence( metaAssignSeqProduction.contents[ 2 ] );
	}

	metadataGroups.forEach( function addProductionToMap( metaGroupProduction ) {
		if( metaGroupProduction.contents[ 0 ].ruleName == '<terminal>' ) {
			if( metaGroupProduction.contents[ 0 ])
		}
	})

	return [];
}

function itemAndDelimiterPairsFromRawItems( rawItems ) {
	var unwrappedItems = rawItems.map( function( ritem ) { return ritem.contents[ 0 ]; });
	var delimProductions = unwrappedItems.filter( productionsNamed( 'itemDelimiter' ) );
	var delimIndices = delimProductions.map( function ( production ) {
		return unwrappedItems.indexOf( production );
	});

	var pairs = [];

	if( delimProductions.length === 0 ) {
		pairs.push({
			itemDelimiter: makeEmptyItemDelimiter(),
			rawItems: unwrappedItems
		});

		return pairs;
	}

	if( delimIndices[ 0 ] !== 0 ) {
		pairs.push({
			itemDelimiter: makeEmptyItemDelimiter(),
			rawItems: unwrappedItems.slice( 0, delimIndices[ 0 ] )
		});
	}

	delimProductions.forEach( function addPair( itemDelimiterProduction, index ) {
		var productionIndex = delimIndices[ index ];
		// if nextProductionIndex is undefined, then slice acts the same as if that parameter is not included.
		var nextProductionIndex = delimIndices[ index + 1 ] || (void 0);

		pairs.push({
			itemDelimiter: compileItemDelimiter( itemDelimiterProduction ),
			rawItems: unwrappedItems.slice( productionIndex, nextProductionIndex )
		});
	});

	return pairs;
}

// { ItemDelimiter, Array<Production "item"> } -> AlternationItem
// Exact kind depends on item being compiled.
// TerminalProduction -> TerminalAlternation
function compileItemAndDelimiterPair( itemAndDelimiterPair ) {
	// - separate into metadatas and non-metadatas.
	// - metadataMapFromGroups
	// - compileItem
	// - create AlternationItem

	var condition = itemAndDelimiterPair.itemDelimiter.condition;
	// var compiledItems = itemAndDelimiterPair.rawItems.map( compileItem );
	var partitionedRawItems = util.partition( itemAndDelimiterPair.rawItems, function( production ) {
		if( production.ruleName == 'metaGroup' ) return 'metaGroup';
		return '_';
	});

	var metadataMap = metadataMapFromGroups( partitionedRawItems.metadatas );
	var compiledItems = partitionedRawItems._.map( compileItem );

	return new AlternationItem( compiledItems, condition, metadataMap );
}

function compileItemDelimiter( itemDelimiterProduction ) {
	// if the delim begins with "or", then it's the second item, otherwise the first.
	// hence using filter...
	var conditionProduction = itemDelimiterProduction.contents[ 1 ].contents.filter( productionsNamed( 'condition' ) )[ 0 ];

	return {
		condition: conditionProduction ? compileCondition( conditionProduction ) : null;
	};
}

function makeEmptyItemDelimiter() {
	return {
		condition: null
	};
}

function compileItem( itemProduction ) {
	// recursion can occur here.
	// due to prior partitioning, the following things don't appear here:
	// - Production "itemDelimiter".
	// - Production "metaGroup"
	// Everything else can show up.
	// result depends on what the item production is.
	// - Terminal "variable" -> AlternationVariable
	// - Terminal "functionArguments" -> AlternationFunctionArguments
	// - Terminal "text" -> AlternationTerminal
	// - Production "functionCall" -> compileFunctionCall
	// - Production "plainGroup" -> compileItemSequence -> AlternationSet

	if( itemProduction.terminal ) {
		switch( itemProduction.terminal.type ) {
			case 'variable': return compileItemVariable( itemProduction );
			case 'functionArguments': return compileItemFunctionArguments( itemProduction );
			default: return compileItemTerminal( itemProduction );
		}
	}

	else if( itemProduction.ruleName == 'functionCall' ) {
		return compileFunctionCall( itemProduction );
	}
	else if( itemProduction.ruleName == 'plainGroup' ) {
		// recursion.
		return compileItemSequence( itemProduction.contents[ 1 ] )
	}

	throw new Error( "Encountered unexpected production while trying to compile item: " + itemProduction.ruleName );
}

function compileItemVariable( variableProduction ) {
	// body...
}

function compileItemFunctionArguments( functionArgumentsProduction ) {
	// body...
}

function compileItemTerminal( terminalProduction ) {
	// body...
}

function compileFunctionCall( argument ) {
	// body...
}

function compileCondition( conditionProduction ) {
	// body...
}



function productionsNamed( ruleName ) {
	return function filterForProductionsNamed( production ) {
		return production.ruleName == ruleName;
	};
}
