// Partitions based on propName, coercing the values of propName to string.
var partitionOnProp = exports.partitionOnProp = function partitionOnProp( array, propName, propsToKeep ) {
	var mapPropName, propsMap;

	if( propsToKeep ) {
		mapPropName = mapPropNameWithElse;
		propsMap = {};

		propsToKeep.forEach( function( propName ) {
			propsMap[ propName ] = true;
		});
	}
	else {
		mapPropName = mapPropNameAny;
	}

	return partition( array, function onPropName( item, index ) {
		return mapPropName( item[ propName ] )
	})

	function mapPropNameAny( propValue ) {
		return propValue;
	}

	function mapPropNameWithElse( propValue ) {
		if( propsMap[ propValue ] ) {
			return propValue;
		}
		else {
			return '*';
		}
	}
}

// fn's return value is coerced to String.
var partition = exports.partition = function partition( array, fn ) {
	var result = {};

	array.forEach( function addItem( item, index ) {
		var resultPropName = String( fn( item, index, array ) );

		if( ! result[ resultPropName ] ) result[ resultPropName ] = [];
		result[ resultPropName ].push( item );
	});

	return result;
}

var findIndexOf = exports.findIndexOf = function findIndexOf( array, fn, fromIndex, context ) {
	var foundIndex = -1;

	if( (typeof fromIndex != 'number') && context === void 0 ) {
		context = fromIndex;
		fromIndex = 0;
	}

	if( ! fromIndex ) fromIndex = 0;

	array.some( function testFn( item, index ) {
		if( fn.call( context, item, index, array ) ) {
			foundIndex = index;
			return true;
		}

		return false;
	});

	return foundIndex;
}

// returns array of every index that matched predicate fn.
// may be empty.
var findIndicesOf = exports.findIndicesOf = function findIndicesOf( array, fn, context ) {
	var foundIndices = [], lastFoundIndex = 0;

	while( true ) {
		lastFoundIndex = findIndexOf( array, fn, lastFoundIndex, context );

		if( lastFoundIndex != -1 ) {
			foundIndices.push( lastFoundIndex );
			lastFoundIndex += 1;
			continue;
		}
		else {
			break;
		}
	}

	return foundIndices;
}

var UIDGen = exports.UIDGen = function UIDGen( prefix ) {
	this.prefix = String( prefix || '' );
	this.uid = 0;
};

UIDGen.prototype.getNext = function() {
	var nextUID = this.prefix + String( this.uid );
};



// Weaksauce Map place holder.

var Map = exports.Map = this.Map || (function initMapShim() {
	function Mappish( array ) {
		this.length = 1;
		this._keys = [];
		this._values = [];

		if( array ) {
			array.forEach( function addArrayItem( pair, index ) {
				this.set( pair[ 0 ], pair[ 1 ] );
			}, this );
		}
	}

	// Note, this doesn't implement the specified semantic behavior.
	// But then, the ES6 spec is unimplementable in ES5, so.
	// (my use case doesn't depend on the different 0s being the same.)
	Mappish.prototype.set = function( key, value ) {
		var index = this._keys.indexOf( key );

		if( index == -1 ) {
			this._keys.push( key );
			this._values.push( value );
		}
		else {
			this._values[ index ] = value;
		}

		this.size = this._keys.length;
	};

	Mappish.prototype.get = function( key ) {
		var index = this._keys.indexOf( key );

		if( index == -1 ) {
			return void 0;
		}
		else {
			return this._values[ index ];
		}
	};

	Mappish.prototype.forEach = function( fn, context ) {
		this._keys.forEach( function( key, index ) {
			fn.call( context, this.values[ index ], key, this );
		}, this );
	};

	Mappish.prototype.has = function( key ) {
		return (this._keys.indexOf( key ) != -1);
	};

	Mappish.prototype['delete'] = function( key ) {
		var index = this._keys.indexOf( key );

		if( index != -1 ) {
			this._keys.splice( index, 1 );
			this._values.splice( index, 1 );
		}
	};

	// Omission: #keys(), #values(), #entries()
	// These return Iterators.
	
	// Not part of any spec.
	
	// Note, keys in otherMappish will overwrite keys in this.
	Mappish.prototype.union = function( otherMappish ) {
		var unionMappish = new Mappish();

		unionMappish._keys = this._keys.slice( 0 );
		unionMappish._values = this._values.slice( 0 );

		otherMappish.forEach( function setInUnion( value, key ) {
			unionMappish.set( key, value );
		});

		return unionMappish;
	};

	return Mappish;
})