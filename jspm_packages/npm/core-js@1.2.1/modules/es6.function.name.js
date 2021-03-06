/* */ 
var setDesc = require('./$').setDesc,
    createDesc = require('./$.property-desc'),
    has = require('./$.has'),
    FProto = Function.prototype,
    nameRE = /^\s*function ([^ (]*)/,
    NAME = 'name';
NAME in FProto || require('./$.support-desc') && setDesc(FProto, NAME, {
  configurable: true,
  get: function() {
    var match = ('' + this).match(nameRE),
        name = match ? match[1] : '';
    has(this, NAME) || setDesc(this, NAME, createDesc(5, name));
    return name;
  }
});
