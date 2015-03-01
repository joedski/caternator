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

// Iterates over enumerable properties.
var forEachProperty = exports.forEachProperty = function forEachProperty( object, fn, context ) {
	var pn;

	for( pn in object ) {
		fn.call( context, object[ pn ], pn, object );
	}
}

// Iterates over own enumerable properties.
var forEachOwnProperty = exports.forEachOwnProperty = function forEachOwnProperty( object, fn, context ) {
	function fnIfOwn( value, propName, object ) {
		if( object.hasOwnProperty( propName ) )
			fn.call( context, value, propName, object );
	}

	forEachProperty( object, fnIfOwn, context );
}



var UIDGen = exports.UIDGen = function UIDGen( prefix ) {
	this.prefix = String( prefix || '' );
	this.uid = 0;
};

UIDGen.prototype.getNext = function() {
	var nextUID = this.prefix + String( this.uid );
};



var Tally = exports.Tally = function Tally() {
	this.map = new Map();
}

Tally.prototype.incr = function( name, count ) {
	if( count == void 0 ) count = 1;

	if( ! this.has( name ) ) {
		this.set( name, count );
	}
	else {
		this.set( name, this.get( name ) + count );
	}
};

Tally.prototype.decr = function( name, count ) {
	if( count == void 0 ) count = 1;
	
	this.incr( name, - count );
};

Tally.prototype.has = function( name ) {
	return this.map.has( name );
};

Tally.prototype.get = function( name ) {
	return this.map.get( name );
};

Tally.prototype.set = function( name, count ) {
	return this.map.set( name, count );
};

Tally.prototype.forEach = function( fn, context ) {
	this.map.forEach( function( count, key ) {
		fn.call( context, count, key, this );
	}, this );
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

	Mappish.prototype.length = 1;

	Object.defineProperty( Mappish.prototype, 'size', {
		enumerable: true,
		configurable: true,
		get: function() {
			return this._keys.length;
		},
		set: function( newLength ) {}
	});

	// Note, this doesn't implement the specified semantic behavior.
	// But then, the ES6 spec is unimplementable in ES5, so.
	// (my use case doesn't depend on the different 0s being the same, nor on NaN.)
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
});

if( ! Map.prototype.union ) {
	// The least efficient.
	Map.prototype.union = function map_union( otherMap ) {
		var unionMap = new Map();

		this.forEach( function( value, key ) { unionMap.set( key, value ); });
		otherMap.forEach( function( value, key ) { unionMap.set( key, value ); });

		return unionMap;
	};
}

var StringMap = exports.StringMap = (function initStringMap() {
	var propPrefix = 'key:';
	var propPrefixLength = propPrefix.length;

	function keyToProp( key ) {
		// prevent accidentallying anything.
		return propPrefix + key;
	}

	function propToKey( prop ) {
		return prop.slice( propPrefixLength );
	}

	function StringMap( array ) {
		this.length = 1;
		this._store = {};
		this._keys = [];

		if( array ) {
			array.forEach( function addArrayPair( pair ) {
				this.set( pair[ 0 ], pair[ 1 ] );
			}, this );
		}
	}

	StringMap.prototype.length = 1;
	StringMap.prototype._store = null; // v8 optimization
	StringMap.prototype._keys = null;

	Object.defineProperty( StringMap.prototype, 'size', {
		enumerable: true,
		configurable: true,
		get: function() {
			return this._keys.length;
		},
		set: function( newLength ) {}
	});

	StringMap.prototype.set = function( key, value ) {
		var prop = keyToProp( key );

		if( ! this._store.hasOwnProperty( key ) )
			this._keys.push( key );

		this._store[ keyToProp( key ) ] = value;
	};

	StringMap.prototype.get = function( key ) {
		return this._store[ keyToProp( key ) ];
	};

	StringMap.prototype.forEach = function( fn, context ) {
		var _this = this;
		this._keys.forEach( function( key ) {
			fn.call( context, _this.get( key ), key, _this );
		});
		return;
	};

	StringMap.prototype.has = function( key ) {
		return this._store.hasOwnProperty( key );
	};

	StringMap.prototype[ 'delete' ] = function( key ) {
		if( ! this.has( key ) ) return;

		delete this._store[ keyToProp( key ) ];
		this._keys.splice( this._keys.indexOf( key ), 1 );
	};

	StringMap.prototype.union = function( otherStringMap ) {
		var unionMap = new StringMap();

		this.forEach( function( value, key ) {
			unionMap.set( key, value );
		});

		otherStringMap.forEach( function( value, key ) {
			unionMap.set( key, value );
		});

		return otherStringMap;
	};
})