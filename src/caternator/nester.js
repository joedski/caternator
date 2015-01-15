// caternator/nester - Nests tokens into subseqs.

function nestTokens( lineTokens ) {
	var resultantNestedTokens = initResultantNestedTokens();

	// Not functional-style, but hopefully easy to understand.
	lineTokens.forEach( function step( token, index ) {
		switch( token.type ) {
			case 'group begin': resultantNestedTokens.addDeeper(); break;
			case 'group end': resultantNestedTokens.shallower(); break;
			default: resultantNestedTokens.add( token ); break;
		}
	});

	return resultantNestedTokens;
}

function initResultantNestedTokens() {
	var r = [], pn;

	for( pn in resultantNestedTokensPrototype ) {
		r[ pn ] = resultantNestedTokensPrototype[ pn ];
	}

	r.path = [];
	r.top();

	return r;
}

var resultantNestedTokensPrototype = {
	addDeeper: function() { this.add( [] ).deeper(); return this; },
	add: function( item ) { this.currentEnd.push( item ); return this; },
	deeper: function() { this.path.push( this.resolve().length - 1 ); this.currentEnd = this.resolve(); return this; },
	shallower: function() { this.path.pop(); this.currentEnd = this.resolve(); return this; },
	top: function() { this.path.length = 0; this.currentEnd = this.resolve(); return this; },
	currentEnd: null,
	resolve: function() {
		var goal = this;
		var pi, pl;

		for( pi = 0, pl = this.path.length; pi < pl; ++pi ) {
			goal = goal[ this.path[ pi ] ];
		}

		return goal;
	}
};

exports.nestTokens = nestTokens;
