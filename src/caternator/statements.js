var alternations = require( './alternations' );

////////////////
// Classes
////////////////

function VariableStatement( variable, items, metadatas ) {
	Statement.call( this, items, metadatas );

	this.type = 'variable';
	this.name = variable;
}

VariableStatement.prototype = new Statement();

function FunctionStatement( fn, items, metadatas ) {
	Statement.call( this, items, metadatas );

	this.type = 'function';
	this.name = fn;
}

FunctionStatement.prototype = new Statement();

function OutputStatement( items, metadatas ) {
	Statement.call( this, items, metadatas );

	this.type = 'output';
}

FunctionStatement.prototype = new Statement();



////////////////
// Base Classes
////////////////

function Statement( items, metadatas ) {
	// Extensions set this.type.
	if( items ) {
		this.alternationSet = new alternations.AlternationSet( items, metadatas || [] );
	}
}

Statement.prototype.alternationSet = null;



module.exports.VariableStatement = VariableStatement;
module.exports.FunctionStatement = FunctionStatement;
module.exports.OutputStatement = OutputStatement;
