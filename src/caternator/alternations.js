// Core classes for the run time.
// These are instantiated with the data parsed out by the compiler.

var util = require( './util' );
var Map = this.Map || util.Map;
var environment = require( './environment' );
var satisfaction = require( './satisfaction' );



////////////////////////
// Alternation Classes
////////////////////////

// alternationItemList :Array, metadata :Map
function AlternationSet( alternationItemList, metadata ) {
	this.items = alternationItemList;
	this.metadata = metadata;
}

AlternationSet.prototype.items = null;
AlternationSet.prototype.metadata = null;

AlternationSet.prototype.getSatisfactionCriteria = function( environment ) {
	var tallies = {
		variables: {
			// variables that are required on all Alternation Items in this Set are required on this Set.
			required: new util.Tally(),
			// variables that are optinal or required on any but not all Alternation Items in this set are optional on this Set.
			optional: new util.Tally()
		},
		functions: {
			required: new util.Tally(),
			optional: new util.Tally()
		}
	};

	var criteria = new satisfaction.SatisfactionCriteria();

	this.items.forEach( function tallyVariablesOf( item ) {
		var criteria = item.getSatisfactionCriteria( environment );

		util.forEachOwnProperty( tallies, function forKind( pair, kind ) {
			util.forEachOwnProperty( pair, function forRequirement( tally, requirement ) {
				criteria[ kind ][ tally ].forEach( tallyNamedItem( name ) {
					tally.incr( name );
				});
			});
		});
	});

	util.forEachOwnProperty( tallies, function tallyKind( pair, kind ) {
		pair.required.forEach( function tallyRequired( count, name ) {
			if( count == this.items.count ) {
				criteria[ kind ].required.push( name );
			}
			else {
				criteria[ kind ].optional.push( name );
			}
		}, this );

		pair.optional.forEach( function tallyOptional( count, name ) {
			criteria[ kind ].optional.push( name );
		});
	}, this );

	return criteria;
};

AlternationSet.prototype.getSatisfactionWith = function( environment ) {
	return this.getSatisfactionCriteria( environment ).satisfiedBy( environment );
};

// -> SelectionResult
AlternationSet.prototype.select = function( environment, environmentMemo ) {
	if( environmentMemo && environmentMemo.get( this ) ) {
		return environmentMemo.get( this );
	}

	var byPreference = satisfaction.byPreferenceOnEnvironment( environment );
	var preferentiallySortedItems;
	var unculledItems = this.items.filter( function onlySatisfiedItems( item ) {
		return item.getSatisfactionWith( environment ).satisfied;
	});
	var unsortedItems;
	var mostPreferredItems;
	var selectedItem;
	var result;

	// Try conditional items first.
	unsortedItems = unculledItems.filter( function getConditionalItems( item ) {
		return item.conditional && item.condition.fulfilledBy( environment );
	});

	if( unsortedItems.length ===  ) {
		// Otherwise, non-conditional.
		unsortedItems = this.items.filter( function getConditionalItems( item ) {
			return ! item.conditional;
		});
	}

	unsortedItems.sort( byPreference );
	mostPreferredItems = unsortedItems.filter( function onlyMostPreferred( item ) {
		return byPreference( item, unsortedItems[ 0 ] ) === 0;
	});

	// Pick only one item.
	selectedItem = mostPreferredItems[ Math.random() * mostPreferredItems.length << 0 ];

	result = new SelectionResult({
		environment: environment,
		environmentMemo: environmentMemo,
		itemResults: selectedItem.selectContents( environment, environmentMemo )
	});

	if( environmentMemo ) {
		environmentMemo.set( this, result );
	}

	return result;
};

// This is mostly used as part of implementing Conditions.
AlternationSet.prototype.selectAll = function( environment, environmentMemo ) {
	return this.items.map( function selectAlternationItems( item ) {
		return new SelectionResult({
			environment: environment,
			environmentMemo: environmentMemo,
			itemResults: item.selectContents( environment, environmentMemo )
		});
	});
};



////////////////////////

// contents :Array, condition :Condition..., metadata :Map
// contents Array can contain any number of any of:
// - Alternation Set
// - Alternation Variable
// - Alternation Function
// - Alternation Terminal
function AlternationItem( contents, condition, metadata ) {
	this.contents = contents;
	this.metadata = metadata;
	this.conditional = !! condition;
	this.condition = condition || new AlternationItemNonCondition();
}

AlternationItem.prototype.items = null;
AlternationItem.prototype.metadata = null;

AlternationItem.prototype.getSatisfactionCriteria = function( environment ) {
	// requiredVariables - variables which appear directly within this item's contents,
	//   or which are required on any sub-items within this item's contents.
	// requiredFunctions - functions which appear directly within this item's contents,
	//   or which are required on any sub-items within this item's contents.
	// optionalVariables - variables which are optional on any sub-alternation-set within this item's contents.
	// optionalFunctions - functions which are optional on any sub-alternation-set within this item's contents.

	var criteria = new satisfaction.SatisfactionCriteria();
	var tallies = {
		variables: {
			required: new util.Tally(),
			optional: new util.Tally()
		},
		functions: {
			required: new util.Tally(),
			optional: new util.Tally()
		}
	};

	this.items.forEach( function tallyItems( item ) {
		if( item instanceof AlternationSet ) {
			item.getSatisfactionCriteria( environment ).forEach( function tallyItems( name, type, requirement ) {
				tallies[ type ][ requirement ].incr( name );
			});
		}
		else if( item.type == 'variable' || item.type == 'function' ) {
			tallies[ item.type + 's' ].required.incr( item.value );
		}
		// otherwise do nothing.
		return;
	});

	util.forEachOwnProperty( tallies, function addTalliesOfTypeToCriteria( type, typeName ) {
		util.forEachOwnProperty( type, function addTalliesOfRequirementToCriteria( tally, requirement ) {
			tally.forEach( function addTally( count, name ) {
				criteria[ typeName ][ requirement ].push( name );
			});
		});
	});

	return criteria;
};

AlternationItem.prototype.getSatisfactionWith = function( environment ) {
	return this.getSatisfactionCriteria( environment ).satisfiedBy( environment );
};

// -> Array<SelectionResult|TerminalResult>
AlternationItem.prototype.selectContents = function( environment, environmentMemo ) {
	return this.contents.map( function selectOn( item ) {
		return item.select( environment, environmentMemo );
	});
};



////////////////////////

function AlternationTerminal( value ) {
	this.value = value;
};

// -> TerminalResult
AlternationTerminal.prototype.select = function( environment, environmentMemo ) {
	return new TerminalResult({
		environment: environment,
		environmentMemo: environmentMemo,
		value: this.value;
	});
};

AlternationTerminal.prototype.getSatisfactionCriteria = function( environment ) {
	return satisfaction.SatisfactionCriteria.nullCriteria;
};

AlternationTerminal.prototype.getSatisfactionWith = function( environment ) {
	return this.getSatisfactionCriteria( environment ).satisfiedBy( environment );
};



////////////////////////

function AlternationVariable( name ) {
	this.name = name;
}

AlternationVariable.prototype.select = function( environment, environmentMemo ) {
	return environment.getVariable( this.name ).select( environment, environmentMemo );
};

AlternationVariable.prototype.getSatisfactionCriteria = function( environment ) {
	// Technically should be the criteria of itself and the contained Alternation Set,
	// but if we don't have an environment then this can only return its own name as the only Criteria.

	var criteria = new satisfaction.SatisfactionCriteria({ variables: { required: [ this.name ] } });

	if( environment ) {
		criteria = criteria.union( environment.getVariable( this.name ).getSatisfactionCriteria( environment ) );
	}

	return criteria;
};

AlternationVariable.prototype.getSatisfactionWith = function( environment ) {
	return this.getSatisfactionCriteria( environment ).satisfiedBy( environment );
};



////////////////////////

// name :String, fnArgs :AlternationSet
function AlternationFunction( name, fnArgs ) {
	this.name = name;
	this.arguments = fnArgs;
}

AlternationFunction.prototype.select = function( environment, environmentMemo ) {
	var result;

	environmentMemo.pushFunctionArguments( this.arguments.select( environment, environmentMemo ) );
	result = environment.getFunction( this.name ).select( environment, environmentMemo );
	environmentMemo.popFunctionArgumetns();

	return result;
};

AlternationFunction.prototype.getSatisfactionCriteria = function( environment ) {
	// Technically should be the criteria of itself and the contained Alternation Set,
	// but if we don't have an environment then this can only return its own name as the only Criteria.

	var criteria = new satisfaction.SatisfactionCriteria({ functions: { required: [ this.name ] } });

	criteria = criteria.union( this.arguments.getSatisfactionCriteria( environment ) );

	if( environment ) {
		criteria = criteria.union( environment.getVariable( this.name ).getSatisfactionCriteria( environment ) );
	}

	return criteria;
};

AlternationFunction.prototype.getSatisfactionWith = function( environment ) {
	return this.getSatisfactionCriteria( environment ).satisfiedBy( environment );
};



////////////////////////

function AlternationFunctionArguments() {}

AlternationFunctionArguments.prototype.select = function( environment, environmentMemo ) {
	return environmentMemo.getFunctionArguments();
};

AlternationFunctionArguments.prototype.getSatisfactionCriteria = function( environment ) {
	return new satisfaction.SatisfactionCriteria();
};

AlternationFunctionArguments.prototype.getSatisfactionWith = function( environment ) {
	return this.getSatisfactionCriteria( environment ).satisfiedBy( environment );
};



////////////////////////
// Result Classes
////////////////////////

function Result( options ) {
	if( ! options ) return;

	this.environment = options.environment;
	this.environmentMemo = options.environmentMemo;
}

Result.prototype.toString = function() {
	return '';
};



////////////////////////

function SelectionResult( options ) {
	Result.call( this, options );

	this.itemResults = options.itemResults;
}

SelectionResult.prototype = new Result();

SelectionResult.prototype.toString = function() {
	return this.itemResults.map( function toStringItemResults( itemResult ) {
		return itemResult.toString();
	}).join( '' );
};



////////////////////////

function TerminalResult( options ) {
	Result.call( this, options );

	this.value = options.value;
}

TerminalResult.prototype = new Result();

TerminalResult.prototype.toString = function() {
	return String( this.value );
};



////////////////////////

function NullResult( options ) {
	Result.call( this, options );
}

NullResult.prototype = new Result();




////////////////////////
// Condition Classes
////////////////////////

function AlternationItemNonCondition() {}

AlternationItemNonCondition.prototype.fulfilledBy = function( environment ) {
	return true;
};

function AlternationItemIsCondition( subjectName, metadata ) {
	this.subjectName = subjectName;
	this.metadata = metadata;
}

AlternationItemIsCondition.prototype.fulfilledBy = function( environment ) {
	// true if the variable is defined
	// and if it has the metadata in this.metadata also defined.
};

function AlternationItemHasCondition( subjectName, metadata ) {
	this.subjectName = subjectName;
	this.metadata = metadata;
}

AlternationItemIsCondition.prototype.fulfilledBy = function( environment ) {
	// true if the variable is defined
	// and if it has the metadata in this.metadata also defined 
	// and if for each mapping on this.metadata if the variable has the same metadata mappings.
	// (all values are strings, here...)
};

function AlternationItemEqualsCondition( subjectName, alternationSet ) {
	this.subjectName = subjectName;
	this.value = alternationSet;
}

AlternationItemIsCondition.prototype.fulfilledBy = function( environment ) {
	// TODO: Implement necessary pipework for isCondition.fulfilledBy.
	// true if the variable is defined
	// and if its selected value is the same as
	//   one of the values that CAN be selected from the alternationSet pointed to by this.value.
	// This is one case actually where a selectAll would be handy.
	return false;
};
