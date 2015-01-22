var util = require( './util' );


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
