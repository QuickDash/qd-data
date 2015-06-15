var lodash = require('lodash');

function addLookupFunctions(_cfg){
	for (var configKey in _cfg){
	  var c = _cfg[configKey];
	  if (c.label_column && c.key_column !== c.label_column) {
	    buildLookupTable(c);
	    c.labelForKey = function(key){
	      return this.lookupTable[key];
	    }
	  } else {
	    c.labelForKey = function(key){
	      return key;
	    }
	  }
	}
}

function buildLookupTable(c){
	c.lookupTable = {};
	var allRecords = c.dimension.top(Infinity);
	allRecords.forEach(function(row){
	  var key = row[c.key_column];
	  var value = row[c.label_column];
	  if (c.lookupTable[key] === undefined) c.lookupTable[key] = value;
	});
}

module.exports = function(configObject){
	var _sourceConfig = configObject;

	var _configurator = {};

	_configurator.sourceConfig = function() {
		return _sourceConfig;
	}

	_configurator.instantiate = function(opts) {	
		// AutoConfig Functions:
		//	Each function on "ac" can be used as a value for the "autoConfig" property
		//	on a data config item.
		//
		//	If no value is present for autoConfig: group and/or dimension properties of the 
		//	data config item must be set as functions.
		var ac = {};
		ac.sum = function(config){
		// "all": This option sets up both a dimension and group for the key_column.
		// Group is a simple sum based on opts.measureColumn.
			config.dimension = simpleDimension(config.key_column);
			config.group = sumGroup(config.dimension);
		}
		// "specificCount": This option sets up both a dimension and group for the key_column.
		// Group is now reduced by countGroup(record count), not by sum. 
		ac.count = function(config) {
			config.dimension = simpleDimension(config.key_column);
			config.group = countGroup(config.dimension);
		};
		ac.totalSum = function(config){
		// "totalSum": This option sets up only a group with a "total" sum based on opts.measureColumn
			config.group = opts.crossfilterObject.groupAll().reduceSum(function(d){
          	  return Math.round(d[opts.measureColumn]) || 0;
        	});
		}
		ac.totalCount = function(config){
		// "totalCount": This option sets up only a group with a "total" count. 
			config.group = opts.crossfilterObject.groupAll().reduceCount();
		}
		ac.hierarchical = function(config){
		// "hierarchical": This option sets up levels, dimensions, measureColumn.
		// Useful for charts such as Treemap & Sankey.
		    var levels = [];
		    config.columns.forEach(function(c){
		      levels.push({
		        dimension: simpleDimension(c),
		        columnName: c
		      });
		    });
		    config.levels = levels;
		    config.measureColumn = opts.measureColumn;
		}

		// autoConfig support functions
		function simpleDimension(dataColumn){
			return opts.crossfilterObject.dimension(function(d){
			  return (d[dataColumn] === undefined || d[dataColumn] === NaN || d[dataColumn] === '') ? "Unknown" : d[dataColumn].trim();
			});  
		}
		function sumGroup(dimension) {
			return dimension.group().reduceSum(function(d){
			  return Math.round(d[opts.measureColumn]) || 0;
			});
		}
		function countGroup(dimension) {
			//had to return object like this so that number display could use the group.value()
			//added group property for access to the group needed in country detail
			return {value: function(){ 
								return dimension
										.group()
										.reduceCount()
										.all()
										.filter(function(i){
											return i.value != 0;
										}).length;
					},
					group: function() {
								return dimension.group().reduceCount();
					}

			};
			//return dimension.group().reduceCount();
		}
		

		// Instantiate config for given opts
		var _cfg = lodash.cloneDeep(_sourceConfig);	
		for (var configKey in _cfg){
			var autoConfigName = _cfg[configKey].autoConfig;
			if (autoConfigName) {
			// Invoke auto config function for each item, if defined
				ac[autoConfigName](_cfg[configKey]); 
			} else {
			// Invoke manually configured functions for dimension and group
				if (_cfg[configKey].dimension)
					_cfg[configKey].dimension = _cfg[configKey].dimension(opts);
				if (_cfg[configKey].group) 
					_cfg[configKey].group = _cfg[configKey].group(opts);
			}

		}

		addLookupFunctions(_cfg);

		return _cfg;
	}

	return _configurator;
} 