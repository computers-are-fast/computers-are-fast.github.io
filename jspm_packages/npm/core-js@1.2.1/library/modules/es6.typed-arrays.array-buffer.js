/* */ 
var $def = require('./$.def'),
    buffer = require('./$.buffer'),
    $ArrayBuffer = buffer.ArrayBuffer,
    $DataView = buffer.DataView,
    FORCED = $def.F * !buffer.useNative,
    ARRAY_BUFFER = 'ArrayBuffer';
$def($def.G + $def.W + FORCED, {ArrayBuffer: $ArrayBuffer});
$def($def.S + FORCED, ARRAY_BUFFER, {isView: function isView(it) {}});
$def($def.P + FORCED, ARRAY_BUFFER, {slice: function slice(start, end) {
    var len = this.byteLength,
        first = toIndex(start, len),
        final = toIndex(end === undefined ? len : end, len),
        result = new $ArrayBuffer(toLength(final - first)),
        viewS = new $DataView(this),
        viewT = new $DataView(result),
        index = 0;
    while (first < final) {
      viewT.setUint8(index++, viewS.getUint8(first++));
    }
    return result;
  }});
