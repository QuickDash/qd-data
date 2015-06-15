var d3 = require('d3');

var qd = {
 // slideOut: require('./slide-out'),
 // dataSelector: require('./data-selector')
}

var currency = d3.format("$,");
var number = d3.format(",");
var currency2p = d3.format("$,.2r");
var number2p = d3.format(",.2r");

qd.currencyFormat = function(d){
  var rounded = Math.round(d);
  if (Math.abs(rounded) < 10) return d3.format("$")(rounded);
  return currency(rounded);
}
qd.numberFormat = function(d){
  var rounded = Math.round(d);
  if (Math.abs(rounded) < 10) return rounded;
  return number(rounded);
};
qd.bigCurrencyFormat = function(d){
  var abs = Math.abs(d);
  if(abs/1e12 >= 1) {
    return generateBigFormatter(d, "currency") + "t";
  }
  else if (abs/1e9 >= 1) {
   return generateBigFormatter(d, "currency") + "b";
  }else if(abs/1e6 >= 1){
   return generateBigFormatter(d, "currency") + "m";
  }else if(abs/1e3 >= 1){
   return generateBigFormatter(d, "currency") + "k";
  }else{
   return qd.currencyFormat(d);
  }
}
qd.bigNumberFormat = function(d){
  var abs = Math.abs(d);
  if(abs/1e12 >= 1) {
    return generateBigFormatter(d, "number") + "t";
  }
  else if (abs/1e9 >= 1) {
   return generateBigFormatter(d, "number") + "b";
  }else if(abs/1e6 >= 1){
   return generateBigFormatter(d, "number") + "m";
  }else if(abs/1e3 >= 1){
   return generateBigFormatter(d, "number") + "k";
  }else{
   return qd.numberFormat(d);
  }
}

generateBigFormatter = function(d, type) {
  var digitLength, dividedNumber, truncatedNumber;
  var number = Math.abs(d);
  if(number/1e12 >= 1) {
    dividedNumber = number/1e12;
  }
  else if (number/1e9 >= 1) {
   dividedNumber = number/1e9;
  }else if(number/1e6 >= 1){
   dividedNumber = number/1e6;
  }else if(number/1e3 >= 1){
   dividedNumber = number/1e3;
  }
  digitLength = String(Math.floor(dividedNumber)).length;
  if(digitLength === 1) digitLength = 2;
  if(type === "currency")
    return d3.format("$,." + String(digitLength) + "r")(dividedNumber);
  else if(type === "number")
    return d3.format(",." + String(digitLength) + "r")(dividedNumber);
};

qd.wireupDataAll = function(chartList, datConf){
  chartList.forEach(function(chart){
    if (chart.wireUpData !== undefined) chart.wireUpData(datConf);
  });
}

qd.resizeAll = function(chartList){
  chartList.forEach(function(chart){
    if(chart.resize !== undefined) chart.resize();
  });   
}

qd.dataConfigMixin = require('./data-config-mixin');
qd.dataConfigurator = require('./data-configurator');

module.exports = qd;