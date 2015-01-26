var util = require( './util' );



// TODO: Reimplement using Sets instead of Arrays because arrays are dumb for this.
function SatisfactionCriteria( options ) {
	options = options || {};

	this.variables = {
		required: (options.variables || {}).required || [],
		optional: (options.variables || {}).optional || []
	};

	this.functions = {
		required: (options.functions || {}).required || [],
		optional: (options.functions || {}).optional || []
	};
}

SatisfactionCriteria.nullCriteria = new SatisfactionCriteria();

SatisfactionCriteria.prototype.satisfiedBy = function( environment ) {
	function byDefinitionOf( type ) {
		var hasType;

		if( type == 'variable' ) { hasType = 'hasVariable'; }
		else if( type == 'function' ) { hasType = 'hasFunction'; }

		return function byDefinition( name ) {
			return environment[ hasType ]( name ) ? 'satisfied' : 'unsatisfied';
		};
	}

	var byDefinitionOfVariable = byDefinitionOf( 'variable' );
	var byDefinitionOfFunction = byDefinitionOf( 'function' );

	return new SatisfactionResult({
		variables: {
			required: util.partition( this.variables.required, byDefinitionOfVariable )
			optional: util.partition( this.variables.optional, byDefinitionOfVariable )
		},
		functions: {
			required: util.partition( this.functions.required, byDefinitionOfFunction )
			optional: util.partition( this.functions.optional, byDefinitionOfFunction )
		}
	});
};

// fn :Function( itemName :String, itemType :String, itemRequirement :String )
// Note that itemType will always be plural: 'variables', 'functions'.
// itemRequirement is one of 'required', 'optional'.
SatisfactionCriteria.prototype.forEach = function( fn, context ) {
	[ 'variables', 'functions' ].forEach( function iterateType( type ) {
		[ 'required', 'optional' ].forEach( function iterateRequirement( requirement ) {
			this[ type ][ requirement ].forEach( function iterateName( name ) {
				fn.call( context, name, type, requirement, this );
			}, this );
		}, this );
	}, this );
};

SatisfactionCriteria.prototype.union = function( otherCriteria ) {
	var unionCriteria = new SatisfactionCriteria( this );

	otherCriteria.forEach( function add( name, type, requirement ) {
		var unionCriteriaArr = unionCriteria[ type ][ requirement ];

		// using an array to a set's job.  wooo.
		if( unionCriteriaArr.indexOf( name ) == -1 ) {
			unionCriteriaArr.push( name );
		}
	});

	return unionCriteria;
};



function SatisfactionResult( options ) {
	options = options || {};

	this.variables = {
		required: (options.variables || {}).required || { satisfied: [], unsatisfied: [] },
		optional: (options.variables || {}).optional || { satisfied: [], unsatisfied: [] }
	};

	this.functions = {
		required: (options.functions || {}).required || { satisfied: [], unsatisfied: [] },
		optional: (options.functions || {}).optional || { satisfied: [], unsatisfied: [] }
	};

	if( this.requiredVariables.unsatisfied.length > 0 || this.requiredFunctions.unsatisfied.length > 0 ) {
		this.satisfied = false;
	}
	else {
		this.satisfied = true;
	}
}



// This assumes all items being sorted are satisfied.
function byPreferenceOnEnvironment( environment ) {
	return function( altItemA, altItemB ) {
		var resultA = altItemA.getSatisfactionWith( environment );
		var resultB = altItemB.getSatisfactionWith( environment );

		if( resultA.variables.required.satisfied.length != resultB.variables.required.satisfied.length ) {
			return resultA.variables.required.satisfied.length - resultB.variables.required.satisfied.length;
		}
		else if( resultA.functions.required.satisfied.length != resultB.functions.required.satisfied.length ) {
			return resultA.functions.required.satisfied.length - resultB.functions.required.satisfied.length;
		}
		else if( resultA.variables.optional.satisfied.length != resultB.variables.optional.satisfied.length ) {
			return resultA.variables.optional.satisfied.length - resultB.variables.optional.satisfied.length;
		}
		else if( resultA.functions.optional.satisfied.length != resultB.functions.optional.satisfied.length ) {
			return resultA.functions.optional.satisfied.length - resultB.functions.optional.satisfied.length;
		}
		else if( resultA.variables.optional.unsatisfied.length != resultB.variables.optional.unsatisfied.length ) {
			return -(resultA.variables.optional.unsatisfied.length - resultB.variables.optional.unsatisfied.length);
		}
		else if( resultA.functions.optional.unsatisfied.length != resultB.functions.optional.unsatisfied.length ) {
			return -(resultA.functions.optional.unsatisfied.length - resultB.functions.optional.unsatisfied.length);
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

exports.SatisfactionCriteria = SatisfactionCriteria;
exports.SatisfactionResult = SatisfactionResult;
exports.byPreferenceOnEnvironment = byPreferenceOnEnvironment;
