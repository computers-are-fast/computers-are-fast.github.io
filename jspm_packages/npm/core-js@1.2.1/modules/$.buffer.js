/* */ 
'use strict';
if (require('./$.support-desc')) {
  var global = require('./$.global'),
      $ = require('./$'),
      $mix = require('./$.mix'),
      $fill = require('./$.array-fill'),
      strictNew = require('./$.strict-new'),
      toInteger = require('./$.to-integer'),
      toLength = require('./$.to-length'),
      $ArrayBuffer = global.ArrayBuffer,
      $DataView = global.DataView,
      Math = global.Math,
      parseInt = global.parseInt,
      useNativeBuffer = !!($ArrayBuffer && $DataView);
  var abs = Math.abs,
      pow = Math.pow,
      min = Math.min,
      floor = Math.floor,
      log = Math.log,
      LN2 = Math.LN2;
  var signed = function(value, bits) {
    var s = 32 - bits;
    return value << s >> s;
  };
  var unsigned = function(value, bits) {
    var s = 32 - bits;
    return value << s >>> s;
  };
  var roundToEven = function(n) {
    var w = floor(n),
        f = n - w;
    return f < .5 ? w : f > .5 ? w + 1 : w % 2 ? w + 1 : w;
  };
  var packI8 = function(n) {
    return [n & 0xff];
  };
  var unpackI8 = function(bytes) {
    return signed(bytes[0], 8);
  };
  var packU8 = function(n) {
    return [n & 0xff];
  };
  var unpackU8 = function(bytes) {
    return unsigned(bytes[0], 8);
  };
  var packI16 = function(n) {
    return [n & 0xff, n >> 8 & 0xff];
  };
  var unpackI16 = function(bytes) {
    return signed(bytes[1] << 8 | bytes[0], 16);
  };
  var packU16 = function(n) {
    return [n & 0xff, n >> 8 & 0xff];
  };
  var unpackU16 = function(bytes) {
    return unsigned(bytes[1] << 8 | bytes[0], 16);
  };
  var packI32 = function(n) {
    return [n & 0xff, n >> 8 & 0xff, n >> 16 & 0xff, n >> 24 & 0xff];
  };
  var unpackI32 = function(bytes) {
    return signed(bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0], 32);
  };
  var packU32 = function(n) {
    return [n & 0xff, n >> 8 & 0xff, n >> 16 & 0xff, n >> 24 & 0xff];
  };
  var unpackU32 = function(bytes) {
    return unsigned(bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0], 32);
  };
  var packIEEE754 = function(v, ebits, fbits) {
    var bias = (1 << ebits - 1) - 1,
        s,
        e,
        f,
        ln,
        i,
        bits,
        str,
        bytes;
    if (v !== v) {
      e = (1 << ebits) - 1;
      f = pow(2, fbits - 1);
      s = 0;
    } else if (v === Infinity || v === -Infinity) {
      e = (1 << ebits) - 1;
      f = 0;
      s = v < 0 ? 1 : 0;
    } else if (v === 0) {
      e = 0;
      f = 0;
      s = 1 / v === -Infinity ? 1 : 0;
    } else {
      s = v < 0;
      v = abs(v);
      if (v >= pow(2, 1 - bias)) {
        e = min(floor(log(v) / LN2), 1023);
        var significand = v / pow(2, e);
        if (significand < 1) {
          e -= 1;
          significand *= 2;
        }
        if (significand >= 2) {
          e += 1;
          significand /= 2;
        }
        f = roundToEven(significand * pow(2, fbits));
        if (f / pow(2, fbits) >= 2) {
          e = e + 1;
          f = 1;
        }
        if (e > bias) {
          e = (1 << ebits) - 1;
          f = 0;
        } else {
          e = e + bias;
          f = f - pow(2, fbits);
        }
      } else {
        e = 0;
        f = roundToEven(v / pow(2, 1 - bias - fbits));
      }
    }
    bits = [];
    for (i = fbits; i; i -= 1) {
      bits.push(f % 2 ? 1 : 0);
      f = floor(f / 2);
    }
    for (i = ebits; i; i -= 1) {
      bits.push(e % 2 ? 1 : 0);
      e = floor(e / 2);
    }
    bits.push(s ? 1 : 0);
    bits.reverse();
    str = bits.join('');
    bytes = [];
    while (str.length) {
      bytes.unshift(parseInt(str.slice(0, 8), 2));
      str = str.slice(8);
    }
    return bytes;
  };
  var unpackIEEE754 = function(bytes, ebits, fbits) {
    var bits = [],
        i,
        j,
        b,
        str,
        bias,
        s,
        e,
        f;
    for (i = 0; i < bytes.length; ++i)
      for (b = bytes[i], j = 8; j; --j) {
        bits.push(b % 2 ? 1 : 0);
        b = b >> 1;
      }
    bits.reverse();
    str = bits.join('');
    bias = (1 << ebits - 1) - 1;
    s = parseInt(str.slice(0, 1), 2) ? -1 : 1;
    e = parseInt(str.slice(1, 1 + ebits), 2);
    f = parseInt(str.slice(1 + ebits), 2);
    if (e === (1 << ebits) - 1)
      return f !== 0 ? NaN : s * Infinity;
    else if (e > 0)
      return s * pow(2, e - bias) * (1 + f / pow(2, fbits));
    else if (f !== 0)
      return s * pow(2, -(bias - 1)) * (f / pow(2, fbits));
    return s < 0 ? -0 : 0;
  };
  var unpackF64 = function(b) {
    return unpackIEEE754(b, 11, 52);
  };
  var packF64 = function(v) {
    return packIEEE754(v, 11, 52);
  };
  var unpackF32 = function(b) {
    return unpackIEEE754(b, 8, 23);
  };
  var packF32 = function(v) {
    return packIEEE754(v, 8, 23);
  };
  var addGetter = function(C, key, internal) {
    $.setDesc(C.prototype, key, {get: function() {
        return this[internal];
      }});
  };
  var get = function(view, bytes, index, conversion, isLittleEndian) {
    var numIndex = +index,
        intIndex = toInteger(numIndex);
    if (numIndex != intIndex || intIndex < 0 || intIndex + bytes > view._l)
      throw RangeError();
    var store = view._b._b,
        start = intIndex + view._o,
        pack = store.slice(start, start + bytes);
    isLittleEndian || pack.reverse();
    return conversion(pack);
  };
  var set = function(view, bytes, index, conversion, value, isLittleEndian) {
    var numIndex = +index,
        intIndex = toInteger(numIndex);
    if (numIndex != intIndex || intIndex < 0 || intIndex + bytes > view._l)
      throw RangeError();
    var store = view._b._b,
        start = intIndex + view._o,
        pack = conversion(+value);
    isLittleEndian || pack.reverse();
    for (var i = 0; i < bytes; i++)
      store[start + i] = pack[i];
  };
  if (!(useNativeBuffer = false)) {
    $ArrayBuffer = function ArrayBuffer(length) {
      strictNew(this, $ArrayBuffer, 'ArrayBuffer');
      this._b = $fill.call(Array(length), 0);
      this._l = length;
    };
    addGetter($ArrayBuffer, 'byteLength', '_l');
    $DataView = function DataView(buffer) {
      strictNew(this, $DataView, 'DataView');
      if (!(buffer instanceof $ArrayBuffer))
        throw TypeError();
      var bufferLength = buffer._b.length,
          byteLength = arguments[2],
          offset = toInteger(arguments[1]);
      if (offset < 0)
        throw RangeError();
      byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
      if (offset + byteLength > bufferLength)
        throw RangeError();
      this._b = buffer;
      this._o = offset;
      this._l = byteLength;
    };
    addGetter($DataView, 'buffer', '_b');
    addGetter($DataView, 'byteLength', '_l');
    addGetter($DataView, 'byteOffset', '_o');
    $mix($DataView.prototype, {
      getInt8: function getInt8(byteOffset) {
        return get(this, 1, byteOffset, unpackI8);
      },
      getUint8: function getUint8(byteOffset) {
        return get(this, 1, byteOffset, unpackU8);
      },
      getInt16: function getInt16(byteOffset) {
        return get(this, 2, byteOffset, unpackI16, arguments[1]);
      },
      getUint16: function getUint16(byteOffset) {
        return get(this, 2, byteOffset, unpackU16, arguments[1]);
      },
      getInt32: function getInt32(byteOffset) {
        return get(this, 4, byteOffset, unpackI32, arguments[1]);
      },
      getUint32: function getUint32(byteOffset) {
        return get(this, 4, byteOffset, unpackU32, arguments[1]);
      },
      getFloat32: function getFloat32(byteOffset) {
        return get(this, 4, byteOffset, unpackF32, arguments[1]);
      },
      getFloat64: function getFloat64(byteOffset) {
        return get(this, 8, byteOffset, unpackF64, arguments[1]);
      },
      setInt8: function setInt8(byteOffset, value) {
        return set(this, 1, byteOffset, packI8, value);
      },
      setUint8: function setUint8(byteOffset, value) {
        return set(this, 1, byteOffset, packU8, value);
      },
      setInt16: function setInt16(byteOffset, value) {
        return set(this, 2, byteOffset, packI16, value, arguments[2]);
      },
      setUint16: function setUint16(byteOffset, value) {
        return set(this, 2, byteOffset, packU16, value, arguments[2]);
      },
      setInt32: function setInt32(byteOffset, value) {
        return set(this, 4, byteOffset, packI32, value, arguments[2]);
      },
      setUint32: function setUint32(byteOffset, value) {
        return set(this, 4, byteOffset, packU32, value, arguments[2]);
      },
      setFloat32: function setFloat32(byteOffset, value) {
        return set(this, 4, byteOffset, packF32, value, arguments[2]);
      },
      setFloat64: function setFloat64(byteOffset, value) {
        return set(this, 8, byteOffset, packF64, value, arguments[2]);
      }
    });
  }
  module.exports = {
    useNative: useNativeBuffer,
    ArrayBuffer: $ArrayBuffer,
    DataView: $DataView
  };
}
