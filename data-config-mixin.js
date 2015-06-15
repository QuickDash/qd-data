module.exports = function(_chart) {

  _chart.dataConfigKey = function(_) {
    if (!arguments.length) return _chart._dataConfigKey;
    _chart._dataConfigKey = _;
    return _chart;
  }

  _chart.wireUpData = function(dataConfig){

    var thisDataConfig = dataConfig[_chart.dataConfigKey()];
  	var dimension = thisDataConfig.dimension;
  	var group = thisDataConfig.group;

    _chart.dataConfig = function() {return thisDataConfig;}
    _chart.headerLabel = function() {return _chart.dataConfig().label;}

  	if (dimension) _chart.dimension(dimension);
    if (group) _chart.group(group);
    if (_chart.totalCapacity && _chart.totalCapacityGenerator) _chart.totalCapacity(_chart.totalCapacityGenerator()); 
    if (_chart.label && thisDataConfig.label_column && thisDataConfig.label_column !== thisDataConfig.key_column) { 
      _chart.label(function(d){ 
        var dataConfigItem = dataConfig[_chart.dataConfigKey()];
    	  return (dataConfigItem.labelForKey && dataConfigItem.labelForKey(d.key || d)) || d.key;
      });
    }
    if (_chart.resize) _chart.resize();
  }

  return _chart;
}