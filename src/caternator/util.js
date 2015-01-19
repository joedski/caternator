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
