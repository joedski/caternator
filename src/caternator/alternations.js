// Core classes for the run time.
// These are instantiated with the data parsed out by the compiler.

var util = require( './util' );
var Map = this.Map || util.Map;
var environment = require( './environment' );



// This assumes all items being sorted are satisfied.
function byPreferenceOnEnvironment( environment ) {
	return function( altItemA, altItemB ) {
		var resultA = altItemA.getSatisfactionWith( environment );
		var resultB = altItemB.getSatisfactionWith( environment );

		if( resultA.requiredVariables.satisfied.length != resultB.requiredVariables.satisfied.length ) {
			return resultA.requiredVariables.satisfied.length - resultB.requiredVariables.satisfied.length;
		}
		else if( resultA.requiredFunctions.satisfied.length != resultB.requiredFunctions.satisfied.length ) {
			return resultA.requiredFunctions.satisfied.length - resultB.requiredFunctions.satisfied.length;
		}
		else if( resultA.optionalVariables.satisfied.length != resultB.optionalVariables.satisfied.length ) {
			return resultA.optionalVariables.satisfied.length - resultB.optionalVariables.satisfied.length;
		}
		else if( resultA.optionalFunctions.satisfied.length != resultB.optionalFunctions.satisfied.length ) {
			return resultA.optionalFunctions.satisfied.length - resultB.optionalFunctions.satisfied.length;
		}
		else if( resultA.optionalVariables.unsatisfied.length != resultB.optionalVariables.unsatisfied.length ) {
			return -(resultA.optionalVariables.unsatisfied.length - resultB.optionalVariables.unsatisfied.length);
		}
		else if( resultA.optionalFunctions.unsatisfied.length != resultB.optionalFunctions.unsatisfied.length ) {
			return -(resultA.optionalFunctions.unsatisfied.length - resultB.optionalFunctions.unsatisfied.length);
		}
		else {
			if( altItemA.isEmpty() && ! altItemB.isEmpty() ) {
				return -1;
			}
			else if( ! altItemA.isEmpty() && altItemB.isEmpty() ) {
				return 1;
			}
		}

		// Any items which are the same in all of the above have the same preference.
		return 0;
	};
}



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

AlternationSet.prototype.getSatisfactionCriteria = function() {
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

	var criteria = new satisfaction.SatisfactionCriteria();

	this.items.forEach( function tallyVariablesOf( item ) {
		var criteria = item.getSatisfactionCriteria();

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
	this.getSatisfactionCriteria().satisfiedBy( environment );
};

// -> SelectionResult
AlternationSet.prototype.select = function( environment, environmentMemo ) {
	// if a memo is present, then check that first.
	//   If a Result for This is present in the Memo, return that Result.
	// cull any Alternation Items not Satisfied by current Environment.
	// try conditional Alternation Items first:
	//   cull any Alternation Items whose Conditions fail (are not Fulfilled)
	//   if no Items remain, skip to non-Conditional Alternation Items.
	//   otherwise skip to Preferential Selection.
	// failing above, do non-Conditional Alternation Items:
	// failing that, Select upon an empty list.
	// 
	// Preferential Selection:
	// Rank Items in order of Preference:
	//   items with more Required Variables Satisfied rank higher.
	//   where the above is the same, items with more Optional Variables Satisfied rank higher.
	//   where all of the above are the same, items with fewer Optional Variables Not Satisfied rank higher.
	//   where all of the above are the same, items which are Not Empty rank higher than those that are.
	// 
	// Keep only Items with the greatest Preference.
	//   If more than one Item has the same Greatest Preference, keep all of them.
	// 
	// Choose one Item from those remaining and return Item's Selection Results within a new Selection Result.
};

AlternationSet.prototype.selectAll = function( environment, environmentMemo ) {
	return this.items.map( function selectAlternationItems( item ) {
		return new SelectionResult({
			environment: environment,
			environmentMemo: environmentMemo,
			itemResults: item.selectContents( environment, environmentMemo )
		});
	});
};



// contents :Array, condition :Condition..., metadata :Map
function AlternationItem( contents, condition, metadata ) {
	this.contents = contents;
	this.metadata = metadata;
	this.conditional = !! condition;
	this.condition = condition || new AlternationItemNonCondition();
}

AlternationSet.prototype.items = null;
AlternationSet.prototype.metadata = null;

AlternationSet.prototype.getSatisfactionCriteria = function() {
	// requiredVariables - variables which appear directly within this item's contents,
	//   or which are required on any sub-items within this item's contents.
	// requiredFunctions - functions which appear directly within this item's contents,
	//   or which are required on any sub-items within this item's contents.
	// optionalVariables - variables which are optional on any sub-alternation-set within this item's contents.
	// optionalFunctions - functions which are optional on any sub-alternation-set within this item's contents.
};

AlternationSet.prototype.getSatisfactionWith = function( environment ) {
	this.getSatisfactionCriteria().satisfiedBy( environment );
};

// -> Array<SelectionResult|TerminalResult>
AlternationSet.prototype.selectContents = function( environment, environmentMemo ) {
	return this.contents.map( function selectOn( item ) {
		return item.select( environment, environmentMemo );
	});
};



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



function AlternationVariable( name ) {
	this.name = name;
}

// TODO: AlternationVariable prototype...



// name :String, fnArgs :AlternationSet
function AlternationFunction( name, fnArgs ) {
	this.name = name;
	this.arguments = fnArgs;
}

// TODO: AlternationFunction prototype...



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
