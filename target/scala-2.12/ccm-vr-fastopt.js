(function(){
'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */





// Get the environment info
var $env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
var $g =
  (typeof $env["global"] === "object" && $env["global"])
    ? $env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
$env["global"] = $g;

// Where to send exports



var $e =
  (typeof $env["exportsNamespace"] === "object" && $env["exportsNamespace"])
    ? $env["exportsNamespace"] : $g;

$env["exportsNamespace"] = $e;

// Freeze the environment info
$g["Object"]["freeze"]($env);

// Linking info - must be in sync with scala.scalajs.runtime.LinkingInfo
var $linkingInfo = {
  "envInfo": $env,
  "semantics": {




    "asInstanceOfs": 1,








    "arrayIndexOutOfBounds": 1,










    "moduleInit": 2,





    "strictFloats": false,




    "productionMode": false

  },



  "assumingES6": false,

  "linkerVersion": "0.6.22",
  "globalThis": this
};
$g["Object"]["freeze"]($linkingInfo);
$g["Object"]["freeze"]($linkingInfo["semantics"]);

// Snapshots of builtins and polyfills






var $imul = $g["Math"]["imul"] || (function(a, b) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

var $fround = $g["Math"]["fround"] ||









  (function(v) {
    return +v;
  });


var $clz32 = $g["Math"]["clz32"] || (function(i) {
  // See Hacker's Delight, Section 5-3
  if (i === 0) return 32;
  var r = 1;
  if ((i & 0xffff0000) === 0) { i <<= 16; r += 16; };
  if ((i & 0xff000000) === 0) { i <<= 8; r += 8; };
  if ((i & 0xf0000000) === 0) { i <<= 4; r += 4; };
  if ((i & 0xc0000000) === 0) { i <<= 2; r += 2; };
  return r + (i >> 31);
});


// Other fields




















var $lastIDHash = 0; // last value attributed to an id hash code



var $idHashCodeMap = $g["WeakMap"] ? new $g["WeakMap"]() : null;



// Core mechanism

var $makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};


var $makeAsArrayOfPrimitive = function(isInstanceOfFunction, arrayEncodedName) {
  return function(obj, depth) {
    if (isInstanceOfFunction(obj, depth) || (obj === null))
      return obj;
    else
      $throwArrayCastException(obj, arrayEncodedName, depth);
  }
};


/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
var $propertyName = function(obj) {
  for (var prop in obj)
    return prop;
};

// Runtime functions

var $isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};


var $throwClassCastException = function(instance, classFullName) {




  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ClassCastException().init___T(
      instance + " is not an instance of " + classFullName));

};

var $throwArrayCastException = function(instance, classArrayEncodedName, depth) {
  for (; depth; --depth)
    classArrayEncodedName = "[" + classArrayEncodedName;
  $throwClassCastException(instance, classArrayEncodedName);
};



var $throwArrayIndexOutOfBoundsException = function(i) {
  var msg = (i === null) ? null : ("" + i);



  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ArrayIndexOutOfBoundsException().init___T(msg));

};


var $noIsInstance = function(instance) {
  throw new $g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

var $makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

var $newArrayObject = function(arrayClassData, lengths) {
  return $newArrayObjectInternal(arrayClassData, lengths, 0);
};

var $newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  var result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    var subArrayClassData = arrayClassData.componentData;
    var subLengthIndex = lengthIndex+1;
    var underlying = result.u;
    for (var i = 0; i < underlying.length; i++) {
      underlying[i] = $newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

var $objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

var $objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return $d_T.getClassOf();
    case "number": {
      var v = instance | 0;
      if (v === instance) { // is the value integral?
        if ($isByte(v))
          return $d_jl_Byte.getClassOf();
        else if ($isShort(v))
          return $d_jl_Short.getClassOf();
        else
          return $d_jl_Integer.getClassOf();
      } else {
        if ($isFloat(instance))
          return $d_jl_Float.getClassOf();
        else
          return $d_jl_Double.getClassOf();
      }
    }
    case "boolean":
      return $d_jl_Boolean.getClassOf();
    case "undefined":
      return $d_sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        return instance.getClass__jl_Class();
      else if ($is_sjsr_RuntimeLong(instance))
        return $d_jl_Long.getClassOf();
      else if ($isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

var $objectClone = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new $c_jl_CloneNotSupportedException().init___();
};

var $objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

var $objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

var $objectFinalize = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

var $objectEquals = function(instance, rhs) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && $numberEquals(instance, rhs);
  else
    return instance === rhs;
};

var $numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

var $objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return $m_sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return $m_sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if ($isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();

      else if ($idHashCodeMap === null)
        return 42;

      else
        return $systemIdentityHashCode(instance);
  }
};

var $comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":

      $as_T(rhs);

      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":

      $as_jl_Number(rhs);

      return $m_jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":

      $asBoolean(rhs);

      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

var $charSequenceLength = function(instance) {
  if (typeof(instance) === "string")

    return $uI(instance["length"]);



  else
    return instance.length__I();
};

var $charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")

    return $uI(instance["charCodeAt"](index)) & 0xffff;



  else
    return instance.charAt__I__C(index);
};

var $charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")

    return $as_T(instance["substring"](start, end));



  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

var $booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

var $numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
var $numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
var $numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
var $numberLongValue = function(instance) {
  if (typeof instance === "number")
    return $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
var $numberFloatValue = function(instance) {
  if (typeof instance === "number") return $fround(instance);
  else                              return instance.floatValue__F();
};
var $numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

var $isNaN = function(instance) {
  return instance !== instance;
};

var $isInfinite = function(instance) {
  return !$g["isFinite"](instance) && !$isNaN(instance);
};

var $doubleToInt = function(x) {
  return (x > 2147483647) ? (2147483647) : ((x < -2147483648) ? -2147483648 : (x | 0));
};

/** Instantiates a JS object with variadic arguments to the constructor. */
var $newJSObjectWithVarargs = function(ctor, args) {
  // This basically emulates the ECMAScript specification for 'new'.
  var instance = $g["Object"]["create"](ctor.prototype);
  var result = ctor["apply"](instance, args);
  switch (typeof result) {
    case "string": case "number": case "boolean": case "undefined": case "symbol":
      return instance;
    default:
      return result === null ? instance : result;
  }
};

var $resolveSuperRef = function(initialProto, propName) {
  var getPrototypeOf = $g["Object"]["getPrototypeOf"];
  var getOwnPropertyDescriptor = $g["Object"]["getOwnPropertyDescriptor"];

  var superProto = getPrototypeOf(initialProto);
  while (superProto !== null) {
    var desc = getOwnPropertyDescriptor(superProto, propName);
    if (desc !== void 0)
      return desc;
    superProto = getPrototypeOf(superProto);
  }

  return void 0;
};

var $superGet = function(initialProto, self, propName) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var getter = desc["get"];
    if (getter !== void 0)
      return getter["call"](self);
    else
      return desc["value"];
  }
  return void 0;
};

var $superSet = function(initialProto, self, propName, value) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var setter = desc["set"];
    if (setter !== void 0) {
      setter["call"](self, value);
      return void 0;
    }
  }
  throw new $g["TypeError"]("super has no setter '" + propName + "'.");
};







var $propertiesOf = function(obj) {
  var result = [];
  for (var prop in obj)
    result["push"](prop);
  return result;
};

var $systemArraycopy = function(src, srcPos, dest, destPos, length) {
  var srcu = src.u;
  var destu = dest.u;


  if (srcPos < 0 || destPos < 0 || length < 0 ||
      (srcPos > ((srcu.length - length) | 0)) ||
      (destPos > ((destu.length - length) | 0))) {
    $throwArrayIndexOutOfBoundsException(null);
  }


  if (srcu !== destu || destPos < srcPos || (((srcPos + length) | 0) < destPos)) {
    for (var i = 0; i < length; i = (i + 1) | 0)
      destu[(destPos + i) | 0] = srcu[(srcPos + i) | 0];
  } else {
    for (var i = (length - 1) | 0; i >= 0; i = (i - 1) | 0)
      destu[(destPos + i) | 0] = srcu[(srcPos + i) | 0];
  }
};

var $systemIdentityHashCode =

  ($idHashCodeMap !== null) ?

  (function(obj) {
    switch (typeof obj) {
      case "string": case "number": case "boolean": case "undefined":
        return $objectHashCode(obj);
      default:
        if (obj === null) {
          return 0;
        } else {
          var hash = $idHashCodeMap["get"](obj);
          if (hash === void 0) {
            hash = ($lastIDHash + 1) | 0;
            $lastIDHash = hash;
            $idHashCodeMap["set"](obj, hash);
          }
          return hash;
        }
    }

  }) :
  (function(obj) {
    if ($isScalaJSObject(obj)) {
      var hash = obj["$idHashCode$0"];
      if (hash !== void 0) {
        return hash;
      } else if (!$g["Object"]["isSealed"](obj)) {
        hash = ($lastIDHash + 1) | 0;
        $lastIDHash = hash;
        obj["$idHashCode$0"] = hash;
        return hash;
      } else {
        return 42;
      }
    } else if (obj === null) {
      return 0;
    } else {
      return $objectHashCode(obj);
    }

  });

// is/as for hijacked boxed classes (the non-trivial ones)

var $isByte = function(v) {
  return typeof v === "number" && (v << 24 >> 24) === v && 1/v !== 1/-0;
};

var $isShort = function(v) {
  return typeof v === "number" && (v << 16 >> 16) === v && 1/v !== 1/-0;
};

var $isInt = function(v) {
  return typeof v === "number" && (v | 0) === v && 1/v !== 1/-0;
};

var $isFloat = function(v) {



  return typeof v === "number";

};


var $asUnit = function(v) {
  if (v === void 0 || v === null)
    return v;
  else
    $throwClassCastException(v, "scala.runtime.BoxedUnit");
};

var $asBoolean = function(v) {
  if (typeof v === "boolean" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Boolean");
};

var $asByte = function(v) {
  if ($isByte(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Byte");
};

var $asShort = function(v) {
  if ($isShort(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Short");
};

var $asInt = function(v) {
  if ($isInt(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Integer");
};

var $asFloat = function(v) {
  if ($isFloat(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Float");
};

var $asDouble = function(v) {
  if (typeof v === "number" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Double");
};


// Unboxes


var $uZ = function(value) {
  return !!$asBoolean(value);
};
var $uB = function(value) {
  return $asByte(value) | 0;
};
var $uS = function(value) {
  return $asShort(value) | 0;
};
var $uI = function(value) {
  return $asInt(value) | 0;
};
var $uJ = function(value) {
  return null === value ? $m_sjsr_RuntimeLong$().Zero$1
                        : $as_sjsr_RuntimeLong(value);
};
var $uF = function(value) {
  /* Here, it is fine to use + instead of fround, because asFloat already
   * ensures that the result is either null or a float.
   */
  return +$asFloat(value);
};
var $uD = function(value) {
  return +$asDouble(value);
};






// TypeArray conversions

var $byteArray2TypedArray = function(value) { return new $g["Int8Array"](value.u); };
var $shortArray2TypedArray = function(value) { return new $g["Int16Array"](value.u); };
var $charArray2TypedArray = function(value) { return new $g["Uint16Array"](value.u); };
var $intArray2TypedArray = function(value) { return new $g["Int32Array"](value.u); };
var $floatArray2TypedArray = function(value) { return new $g["Float32Array"](value.u); };
var $doubleArray2TypedArray = function(value) { return new $g["Float64Array"](value.u); };

var $typedArray2ByteArray = function(value) {
  var arrayClassData = $d_B.getArrayOf();
  return new arrayClassData.constr(new $g["Int8Array"](value));
};
var $typedArray2ShortArray = function(value) {
  var arrayClassData = $d_S.getArrayOf();
  return new arrayClassData.constr(new $g["Int16Array"](value));
};
var $typedArray2CharArray = function(value) {
  var arrayClassData = $d_C.getArrayOf();
  return new arrayClassData.constr(new $g["Uint16Array"](value));
};
var $typedArray2IntArray = function(value) {
  var arrayClassData = $d_I.getArrayOf();
  return new arrayClassData.constr(new $g["Int32Array"](value));
};
var $typedArray2FloatArray = function(value) {
  var arrayClassData = $d_F.getArrayOf();
  return new arrayClassData.constr(new $g["Float32Array"](value));
};
var $typedArray2DoubleArray = function(value) {
  var arrayClassData = $d_D.getArrayOf();
  return new arrayClassData.constr(new $g["Float64Array"](value));
};

// TypeData class


/** @constructor */
var $TypeData = function() {




  // Runtime support
  this.constr = void 0;
  this.parentData = void 0;
  this.ancestors = null;
  this.componentData = null;
  this.arrayBase = null;
  this.arrayDepth = 0;
  this.zero = null;
  this.arrayEncodedName = "";
  this._classOf = void 0;
  this._arrayOf = void 0;
  this.isArrayOf = void 0;

  // java.lang.Class support
  this["name"] = "";
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isRawJSType"] = false;
  this["isInstance"] = void 0;
};


$TypeData.prototype.initPrim = function(



    zero, arrayEncodedName, displayName) {
  // Runtime support
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInstance"] = function(obj) { return false; };

  return this;
};


$TypeData.prototype.initClass = function(



    internalNameObj, isInterface, fullName,
    ancestors, isRawJSType, parentData, isInstance, isArrayOf) {
  var internalName = $propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.arrayEncodedName = "L"+fullName+";";
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isInterface"] = isInterface;
  this["isRawJSType"] = !!isRawJSType;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.initArray = function(



    componentData) {
  // The constructor

  var componentZero0 = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  var componentZero = (componentZero0 == "longZero")
    ? $m_sjsr_RuntimeLong$().Zero$1
    : componentZero0;


  /** @constructor */
  var ArrayClass = function(arg) {
    if (typeof(arg) === "number") {
      // arg is the length of the array
      this.u = new Array(arg);
      for (var i = 0; i < arg; i++)
        this.u[i] = componentZero;
    } else {
      // arg is a native array that we wrap
      this.u = arg;
    }
  }
  ArrayClass.prototype = new $h_O;
  ArrayClass.prototype.constructor = ArrayClass;


  ArrayClass.prototype.get = function(i) {
    if (i < 0 || i >= this.u.length)
      $throwArrayIndexOutOfBoundsException(i);
    return this.u[i];
  };
  ArrayClass.prototype.set = function(i, v) {
    if (i < 0 || i >= this.u.length)
      $throwArrayIndexOutOfBoundsException(i);
    this.u[i] = v;
  };


  ArrayClass.prototype.clone__O = function() {
    if (this.u instanceof Array)
      return new ArrayClass(this.u["slice"](0));
    else
      // The underlying Array is a TypedArray
      return new ArrayClass(new this.u.constructor(this.u));
  };






































  ArrayClass.prototype.$classData = this;

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  var encodedName = "[" + componentData.arrayEncodedName;
  var componentBase = componentData.arrayBase || componentData;
  var arrayDepth = componentData.arrayDepth + 1;

  var isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = $d_O;
  this.ancestors = {O: 1, jl_Cloneable: 1, Ljava_io_Serializable: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.getClassOf = function() {



  if (!this._classOf)
    this._classOf = new $c_jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};


$TypeData.prototype.getArrayOf = function() {



  if (!this._arrayOf)
    this._arrayOf = new $TypeData().initArray(this);
  return this._arrayOf;
};

// java.lang.Class support


$TypeData.prototype["getFakeInstance"] = function() {



  if (this === $d_T)
    return "some string";
  else if (this === $d_jl_Boolean)
    return false;
  else if (this === $d_jl_Byte ||
           this === $d_jl_Short ||
           this === $d_jl_Integer ||
           this === $d_jl_Float ||
           this === $d_jl_Double)
    return 0;
  else if (this === $d_jl_Long)
    return $m_sjsr_RuntimeLong$().Zero$1;
  else if (this === $d_sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};


$TypeData.prototype["getSuperclass"] = function() {



  return this.parentData ? this.parentData.getClassOf() : null;
};


$TypeData.prototype["getComponentType"] = function() {



  return this.componentData ? this.componentData.getClassOf() : null;
};


$TypeData.prototype["newArrayOfThisClass"] = function(lengths) {



  var arrayClassData = this;
  for (var i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return $newArrayObject(arrayClassData, lengths);
};




// Create primitive types

var $d_V = new $TypeData().initPrim(undefined, "V", "void");
var $d_Z = new $TypeData().initPrim(false, "Z", "boolean");
var $d_C = new $TypeData().initPrim(0, "C", "char");
var $d_B = new $TypeData().initPrim(0, "B", "byte");
var $d_S = new $TypeData().initPrim(0, "S", "short");
var $d_I = new $TypeData().initPrim(0, "I", "int");
var $d_J = new $TypeData().initPrim("longZero", "J", "long");
var $d_F = new $TypeData().initPrim(0.0, "F", "float");
var $d_D = new $TypeData().initPrim(0.0, "D", "double");

// Instance tests for array of primitives

var $isArrayOf_Z = $makeIsArrayOfPrimitive($d_Z);
$d_Z.isArrayOf = $isArrayOf_Z;

var $isArrayOf_C = $makeIsArrayOfPrimitive($d_C);
$d_C.isArrayOf = $isArrayOf_C;

var $isArrayOf_B = $makeIsArrayOfPrimitive($d_B);
$d_B.isArrayOf = $isArrayOf_B;

var $isArrayOf_S = $makeIsArrayOfPrimitive($d_S);
$d_S.isArrayOf = $isArrayOf_S;

var $isArrayOf_I = $makeIsArrayOfPrimitive($d_I);
$d_I.isArrayOf = $isArrayOf_I;

var $isArrayOf_J = $makeIsArrayOfPrimitive($d_J);
$d_J.isArrayOf = $isArrayOf_J;

var $isArrayOf_F = $makeIsArrayOfPrimitive($d_F);
$d_F.isArrayOf = $isArrayOf_F;

var $isArrayOf_D = $makeIsArrayOfPrimitive($d_D);
$d_D.isArrayOf = $isArrayOf_D;


// asInstanceOfs for array of primitives
var $asArrayOf_Z = $makeAsArrayOfPrimitive($isArrayOf_Z, "Z");
var $asArrayOf_C = $makeAsArrayOfPrimitive($isArrayOf_C, "C");
var $asArrayOf_B = $makeAsArrayOfPrimitive($isArrayOf_B, "B");
var $asArrayOf_S = $makeAsArrayOfPrimitive($isArrayOf_S, "S");
var $asArrayOf_I = $makeAsArrayOfPrimitive($isArrayOf_I, "I");
var $asArrayOf_J = $makeAsArrayOfPrimitive($isArrayOf_J, "J");
var $asArrayOf_F = $makeAsArrayOfPrimitive($isArrayOf_F, "F");
var $asArrayOf_D = $makeAsArrayOfPrimitive($isArrayOf_D, "D");

var $d_Lfacades_IFThree$VRController = new $TypeData().initClass({
  Lfacades_IFThree$VRController: 0
}, false, "facades.IFThree$VRController", {
  Lfacades_IFThree$VRController: 1
}, true, (void 0), $noIsInstance);
function $f_Lplots_Plot__resetColor__pLplots_Plot__I__V($thiz, pIndex) {
  var color = new $g.THREE.Color();
  var newHue = ($thiz.hue$1 + (0.1 * (pIndex / $thiz.numPoints$1)));
  color.setHSL(newHue, 1.0, 0.5);
  var colorsAttr = $thiz.getGeometry__Lorg_scalajs_threejs_BufferGeometry().getAttribute("customColor");
  var cArr = colorsAttr.array;
  cArr[$imul(3, pIndex)] = $fround($uD(color.r));
  cArr[((1 + $imul(3, pIndex)) | 0)] = $fround($uD(color.g));
  cArr[((2 + $imul(3, pIndex)) | 0)] = $fround($uD(color.b));
  colorsAttr.needsUpdate = true
}
function $f_Lplots_Plot__$$init$__V($thiz) {
  $thiz.numPoints$1 = $uI($thiz.getGeometry__Lorg_scalajs_threejs_BufferGeometry().getAttribute("size").array.length);
  $thiz.selections$1 = $m_s_Array$().apply__I__sc_Seq__AI((-1), new $c_sjs_js_WrappedArray().init___sjs_js_Array([]))
}
function $is_Lplots_Plot(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lplots_Plot)))
}
function $as_Lplots_Plot(obj) {
  return (($is_Lplots_Plot(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "plots.Plot"))
}
function $isArrayOf_Lplots_Plot(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lplots_Plot)))
}
function $asArrayOf_Lplots_Plot(obj, depth) {
  return (($isArrayOf_Lplots_Plot(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lplots.Plot;", depth))
}
function $f_Luserinput_OculusTouchEvents__$$init$__V($thiz) {
  $thiz.userinput$OculusTouchEvents$$undsetter$und$ThumbRest$undTouchBegan$und$eq__T__V("thumbrest touch began");
  $thiz.userinput$OculusTouchEvents$$undsetter$und$ThumbRest$undTouchEnded$und$eq__T__V("thumbrest touch ended")
}
function $f_Lutil_Timing__displayDetails__D__D__s_Option__V($thiz, startTime, endTime, desc) {
  if (desc.isDefined__Z()) {
    var jsx$1 = $m_Lorg_scalajs_dom_package$().console__Lorg_scalajs_dom_raw_Console();
    var s = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["", " took ", "ms"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([desc.get__O(), (endTime - startTime)]));
    jsx$1.log(s)
  }
}
function $f_Lutil_Timing__setDescriptions__s_Option__s_Option__V($thiz, preCallbackDesc, callbackDesc) {
  if (preCallbackDesc.isDefined__Z()) {
    $thiz.preCallDescription$1 = preCallbackDesc
  };
  if (callbackDesc.isDefined__Z()) {
    $thiz.onCalledDescription$1 = callbackDesc
  }
}
function $f_Lutil_Timing__$$init$__V($thiz) {
  $thiz.preCallDescription$1 = $m_s_None$();
  $thiz.onCalledDescription$1 = $m_s_None$()
}
/** @constructor */
function $c_O() {
  /*<skip>*/
}
/** @constructor */
function $h_O() {
  /*<skip>*/
}
$h_O.prototype = $c_O.prototype;
$c_O.prototype.init___ = (function() {
  return this
});
$c_O.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_O.prototype.toString__T = (function() {
  var jsx$2 = $objectGetClass(this).getName__T();
  var i = this.hashCode__I();
  var x = $uD((i >>> 0));
  var jsx$1 = x.toString(16);
  return ((jsx$2 + "@") + $as_T(jsx$1))
});
$c_O.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
$c_O.prototype.toString = (function() {
  return this.toString__T()
});
function $is_O(obj) {
  return (obj !== null)
}
function $as_O(obj) {
  return obj
}
function $isArrayOf_O(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    var arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase.isPrimitive)))
  }
}
function $asArrayOf_O(obj, depth) {
  return (($isArrayOf_O(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Object;", depth))
}
var $d_O = new $TypeData().initClass({
  O: 0
}, false, "java.lang.Object", {
  O: 1
}, (void 0), (void 0), $is_O, $isArrayOf_O);
$c_O.prototype.$classData = $d_O;
function $f_s_Proxy__equals__O__Z($thiz, that) {
  return ((that !== null) && (((that === $thiz) || (that === $thiz.self$1)) || $objectEquals(that, $thiz.self$1)))
}
function $f_s_Proxy__toString__T($thiz) {
  return ("" + $thiz.self$1)
}
function $f_s_concurrent_Promise__complete__s_util_Try__s_concurrent_Promise($thiz, result) {
  if ($thiz.tryComplete__s_util_Try__Z(result)) {
    return $thiz
  } else {
    throw new $c_jl_IllegalStateException().init___T("Promise already completed.")
  }
}
function $f_s_util_control_NoStackTrace__fillInStackTrace__jl_Throwable($thiz) {
  var this$1 = $m_s_util_control_NoStackTrace$();
  if (this$1.$$undnoSuppression$1) {
    return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call($thiz)
  } else {
    return $as_jl_Throwable($thiz)
  }
}
function $is_sc_GenTraversableOnce(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversableOnce)))
}
function $as_sc_GenTraversableOnce(obj) {
  return (($is_sc_GenTraversableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenTraversableOnce"))
}
function $isArrayOf_sc_GenTraversableOnce(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversableOnce)))
}
function $asArrayOf_sc_GenTraversableOnce(obj, depth) {
  return (($isArrayOf_sc_GenTraversableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenTraversableOnce;", depth))
}
function $f_sci_VectorPointer__copyOf__AO__AO($thiz, a) {
  var copy = $newArrayObject($d_O.getArrayOf(), [a.u.length]);
  $systemArraycopy(a, 0, copy, 0, a.u.length);
  return copy
}
function $f_sci_VectorPointer__gotoNextBlockStart__I__I__V($thiz, index, xor) {
  if ((xor < 1024)) {
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1))
  } else if ((xor < 32768)) {
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((index >>> 10) | 0))), 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get(0), 1))
  } else if ((xor < 1048576)) {
    $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & ((index >>> 15) | 0))), 1));
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get(0), 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get(0), 1))
  } else if ((xor < 33554432)) {
    $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & ((index >>> 20) | 0))), 1));
    $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get(0), 1));
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get(0), 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get(0), 1))
  } else if ((xor < 1073741824)) {
    $thiz.display4$und$eq__AO__V($asArrayOf_O($thiz.display5__AO().get((31 & ((index >>> 25) | 0))), 1));
    $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get(0), 1));
    $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get(0), 1));
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get(0), 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get(0), 1))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $f_sci_VectorPointer__getElem__I__I__O($thiz, index, xor) {
  if ((xor < 32)) {
    return $thiz.display0__AO().get((31 & index))
  } else if ((xor < 1024)) {
    return $asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1).get((31 & index))
  } else if ((xor < 32768)) {
    return $asArrayOf_O($asArrayOf_O($thiz.display2__AO().get((31 & ((index >>> 10) | 0))), 1).get((31 & ((index >>> 5) | 0))), 1).get((31 & index))
  } else if ((xor < 1048576)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($thiz.display3__AO().get((31 & ((index >>> 15) | 0))), 1).get((31 & ((index >>> 10) | 0))), 1).get((31 & ((index >>> 5) | 0))), 1).get((31 & index))
  } else if ((xor < 33554432)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($thiz.display4__AO().get((31 & ((index >>> 20) | 0))), 1).get((31 & ((index >>> 15) | 0))), 1).get((31 & ((index >>> 10) | 0))), 1).get((31 & ((index >>> 5) | 0))), 1).get((31 & index))
  } else if ((xor < 1073741824)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($thiz.display5__AO().get((31 & ((index >>> 25) | 0))), 1).get((31 & ((index >>> 20) | 0))), 1).get((31 & ((index >>> 15) | 0))), 1).get((31 & ((index >>> 10) | 0))), 1).get((31 & ((index >>> 5) | 0))), 1).get((31 & index))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $f_sci_VectorPointer__gotoPos__I__I__V($thiz, index, xor) {
  if ((xor >= 32)) {
    if ((xor < 1024)) {
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1))
    } else if ((xor < 32768)) {
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((index >>> 10) | 0))), 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1))
    } else if ((xor < 1048576)) {
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & ((index >>> 15) | 0))), 1));
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((index >>> 10) | 0))), 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1))
    } else if ((xor < 33554432)) {
      $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & ((index >>> 20) | 0))), 1));
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & ((index >>> 15) | 0))), 1));
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((index >>> 10) | 0))), 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1))
    } else if ((xor < 1073741824)) {
      $thiz.display4$und$eq__AO__V($asArrayOf_O($thiz.display5__AO().get((31 & ((index >>> 25) | 0))), 1));
      $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & ((index >>> 20) | 0))), 1));
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & ((index >>> 15) | 0))), 1));
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & ((index >>> 10) | 0))), 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & ((index >>> 5) | 0))), 1))
    } else {
      throw new $c_jl_IllegalArgumentException().init___()
    }
  }
}
function $f_sci_VectorPointer__stabilize__I__V($thiz, index) {
  var x1 = (((-1) + $thiz.depth__I()) | 0);
  switch (x1) {
    case 5: {
      var a = $thiz.display5__AO();
      $thiz.display5$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a));
      var a$1 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$1));
      var a$2 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$2));
      var a$3 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$3));
      var a$4 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$4));
      $thiz.display5__AO().set((31 & ((index >>> 25) | 0)), $thiz.display4__AO());
      $thiz.display4__AO().set((31 & ((index >>> 20) | 0)), $thiz.display3__AO());
      $thiz.display3__AO().set((31 & ((index >>> 15) | 0)), $thiz.display2__AO());
      $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
      $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
      break
    }
    case 4: {
      var a$5 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$5));
      var a$6 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$6));
      var a$7 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$7));
      var a$8 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$8));
      $thiz.display4__AO().set((31 & ((index >>> 20) | 0)), $thiz.display3__AO());
      $thiz.display3__AO().set((31 & ((index >>> 15) | 0)), $thiz.display2__AO());
      $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
      $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
      break
    }
    case 3: {
      var a$9 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$9));
      var a$10 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$10));
      var a$11 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$11));
      $thiz.display3__AO().set((31 & ((index >>> 15) | 0)), $thiz.display2__AO());
      $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
      $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
      break
    }
    case 2: {
      var a$12 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$12));
      var a$13 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$13));
      $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
      $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
      break
    }
    case 1: {
      var a$14 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$14));
      $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
      break
    }
    case 0: {
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $f_sci_VectorPointer__gotoNextBlockStartWritable__I__I__V($thiz, index, xor) {
  if ((xor < 1024)) {
    if (($thiz.depth__I() === 1)) {
      $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display1__AO().set(0, $thiz.display0__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO())
  } else if ((xor < 32768)) {
    if (($thiz.depth__I() === 2)) {
      $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display2__AO().set(0, $thiz.display1__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO())
  } else if ((xor < 1048576)) {
    if (($thiz.depth__I() === 3)) {
      $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display3__AO().set(0, $thiz.display2__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & ((index >>> 15) | 0)), $thiz.display2__AO())
  } else if ((xor < 33554432)) {
    if (($thiz.depth__I() === 4)) {
      $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display4__AO().set(0, $thiz.display3__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & ((index >>> 15) | 0)), $thiz.display2__AO());
    $thiz.display4__AO().set((31 & ((index >>> 20) | 0)), $thiz.display3__AO())
  } else if ((xor < 1073741824)) {
    if (($thiz.depth__I() === 5)) {
      $thiz.display5$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display5__AO().set(0, $thiz.display4__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & ((index >>> 5) | 0)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & ((index >>> 10) | 0)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & ((index >>> 15) | 0)), $thiz.display2__AO());
    $thiz.display4__AO().set((31 & ((index >>> 20) | 0)), $thiz.display3__AO());
    $thiz.display5__AO().set((31 & ((index >>> 25) | 0)), $thiz.display4__AO())
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V($thiz, that, depth) {
  $thiz.depth$und$eq__I__V(depth);
  var x1 = (((-1) + depth) | 0);
  switch (x1) {
    case (-1): {
      break
    }
    case 0: {
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 1: {
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 2: {
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 3: {
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 4: {
      $thiz.display4$und$eq__AO__V(that.display4__AO());
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 5: {
      $thiz.display5$und$eq__AO__V(that.display5__AO());
      $thiz.display4$und$eq__AO__V(that.display4__AO());
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
/** @constructor */
function $c_LMain$() {
  $c_O.call(this);
  this.controls$1 = null;
  this.env$1 = null;
  this.stats$1 = null;
  this.foundVRHeadset$1 = false
}
$c_LMain$.prototype = new $h_O();
$c_LMain$.prototype.constructor = $c_LMain$;
/** @constructor */
function $h_LMain$() {
  /*<skip>*/
}
$h_LMain$.prototype = $c_LMain$.prototype;
$c_LMain$.prototype.init___ = (function() {
  this.foundVRHeadset$1 = false;
  return this
});
$c_LMain$.prototype.init__V = (function() {
  var container = $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().getElementById("scene-container");
  this.env$1 = $m_Lenv_Environment$().setup__Lorg_scalajs_dom_raw_Element__Lenv_Environment(container);
  $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().body.appendChild($g.WEBVR.createButton(this.env$1.renderer$1));
  if (this.foundVRHeadset$1) {
    $m_Lorg_scalajs_dom_package$().console__Lorg_scalajs_dom_raw_Console().log("Found headset");
    this.env$1.renderer$1.vr.enabled = true
  };
  $m_Lwindow_Window$().setupEventListeners__Lorg_scalajs_threejs_PerspectiveCamera__Lorg_scalajs_threejs_WebGLRenderer__V(this.env$1.camera$1, this.env$1.renderer$1);
  this.controls$1 = $m_Luserinput_Controls$().setup__Lenv_Environment__Luserinput_Controls(this.env$1);
  this.stats$1 = new $g.Stats();
  container.appendChild(this.stats$1.dom)
});
$c_LMain$.prototype.$$js$exported$meth$init__O = (function() {
  this.init__V()
});
$c_LMain$.prototype.animate__D__V = (function(timeStamp) {
  $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().requestAnimationFrame((function(arg1$2) {
    var arg1 = $uD(arg1$2);
    $m_LMain$().animate__D__V(arg1)
  }));
  $g.THREE.VRController.update();
  if ((this.controls$1 !== null)) {
    this.controls$1.update__D__V(timeStamp)
  };
  if ((this.stats$1 !== null)) {
    this.stats$1.update()
  };
  if ((this.env$1 !== null)) {
    this.env$1.render__V()
  }
});
$c_LMain$.prototype.$$js$exported$prop$renderer__O = (function() {
  return this.env$1.renderer$1
});
$c_LMain$.prototype.$$js$exported$prop$foundVRHeadset__O = (function() {
  return this.foundVRHeadset$1
});
$c_LMain$.prototype.$$js$exported$prop$foundVRHeadset__Z__O = (function(x$1) {
  this.foundVRHeadset$1 = x$1
});
Object.defineProperty($c_LMain$.prototype, "renderer", {
  "get": (function() {
    return this.$$js$exported$prop$renderer__O()
  }),
  "configurable": true
});
$c_LMain$.prototype.init = (function() {
  return this.$$js$exported$meth$init__O()
});
Object.defineProperty($c_LMain$.prototype, "foundVRHeadset", {
  "get": (function() {
    return this.$$js$exported$prop$foundVRHeadset__O()
  }),
  "set": (function(arg$1) {
    var prep0 = $uZ(arg$1);
    this.$$js$exported$prop$foundVRHeadset__Z__O(prep0)
  }),
  "configurable": true
});
var $d_LMain$ = new $TypeData().initClass({
  LMain$: 0
}, false, "Main$", {
  LMain$: 1,
  O: 1
});
$c_LMain$.prototype.$classData = $d_LMain$;
var $n_LMain$ = (void 0);
function $m_LMain$() {
  if ((!$n_LMain$)) {
    $n_LMain$ = new $c_LMain$().init___()
  };
  return $n_LMain$
}
/** @constructor */
function $c_LUtils$() {
  $c_O.call(this);
  this.cube1$1 = null;
  this.cube2$1 = null
}
$c_LUtils$.prototype = new $h_O();
$c_LUtils$.prototype.constructor = $c_LUtils$;
/** @constructor */
function $h_LUtils$() {
  /*<skip>*/
}
$h_LUtils$.prototype = $c_LUtils$.prototype;
$c_LUtils$.prototype.mergeRegions__V = (function() {
  var this$1 = $m_LMain$().env$1;
  var jsx$1 = this$1.env$Environment$$Regions__Lenv_Environment$Regions$().regions$1.get(0).position;
  jsx$1.set(0.0, 1.0, (-1.0));
  var this$2 = $m_LMain$().env$1;
  var jsx$2 = this$2.env$Environment$$Regions__Lenv_Environment$Regions$().regions$1.get(1).position;
  jsx$2.set(0.0, 1.0, (-1.0))
});
$c_LUtils$.prototype.init___ = (function() {
  $n_LUtils$ = this;
  this.cube1$1 = $m_s_None$();
  this.cube2$1 = $m_s_None$();
  return this
});
$c_LUtils$.prototype.getBoundingCube$1__p1__Lorg_scalajs_threejs_Mesh = (function() {
  var sideLen = (1 + ($m_Lplots_Plot$().PARTICLE$undSIZE$1 / 2));
  var geometry = new $g.THREE.BoxGeometry(sideLen, sideLen, sideLen);
  var cube = new $g.THREE.Mesh(geometry, this.basicMaterial$1__p1__Lorg_scalajs_threejs_MeshBasicMaterial());
  cube.material.transparent = true;
  cube.material.opacity = 0.1;
  cube.position.set(0.0, 0.0, 0.0);
  var wireframe = new $g.THREE.WireframeGeometry(geometry);
  var line = new $g.THREE.LineSegments(wireframe);
  line.material.depthTest = false;
  line.material.opacity = 0.25;
  line.material.transparent = true;
  cube.add(line);
  return cube
});
$c_LUtils$.prototype.$$js$exported$meth$showPlotBounds__O = (function() {
  this.showPlotBounds__V()
});
$c_LUtils$.prototype.basicMaterial$1__p1__Lorg_scalajs_threejs_MeshBasicMaterial = (function() {
  var params = {};
  params.color = $m_Lplots_Colors$Hex$().WHITE$1;
  return new $g.THREE.MeshBasicMaterial(params)
});
$c_LUtils$.prototype.$$js$exported$meth$switchPlot__I__O = (function(i) {
  $m_LMain$().env$1.nextPlot__I__V(i)
});
$c_LUtils$.prototype.$$js$exported$meth$scalePlot__I__D__O = (function(i, s) {
  this.scalePlot__I__D__V(i, s)
});
$c_LUtils$.prototype.scalePlot__I__D__V = (function(i, s) {
  var this$1 = $m_LMain$().env$1.getActivePlot__I__Lplots_Plot(i);
  var jsx$1 = this$1.points$1.scale;
  jsx$1.multiplyScalar(s)
});
$c_LUtils$.prototype.$$js$exported$meth$collapse__O = (function() {
  this.mergeRegions__V()
});
$c_LUtils$.prototype.showPlotBounds__V = (function() {
  if (this.cube1$1.isEmpty__Z()) {
    this.cube1$1 = new $c_s_Some().init___O(this.getBoundingCube$1__p1__Lorg_scalajs_threejs_Mesh());
    this.cube2$1 = new $c_s_Some().init___O(this.getBoundingCube$1__p1__Lorg_scalajs_threejs_Mesh());
    var this$1 = $m_LMain$().env$1;
    this$1.env$Environment$$Regions__Lenv_Environment$Regions$().regions$1.get(0).add(this.cube1$1.get__O());
    var this$2 = $m_LMain$().env$1;
    this$2.env$Environment$$Regions__Lenv_Environment$Regions$().regions$1.get(1).add(this.cube2$1.get__O())
  } else {
    var this$3 = $m_LMain$().env$1;
    this$3.env$Environment$$Regions__Lenv_Environment$Regions$().regions$1.get(0).remove(this.cube1$1.get__O());
    var this$4 = $m_LMain$().env$1;
    this$4.env$Environment$$Regions__Lenv_Environment$Regions$().regions$1.get(1).remove(this.cube2$1.get__O());
    this.cube1$1 = $m_s_None$();
    this.cube2$1 = $m_s_None$()
  }
});
$c_LUtils$.prototype.$$js$exported$meth$expand__O = (function() {
  var this$1 = $m_LMain$().env$1;
  this$1.env$Environment$$Regions__Lenv_Environment$Regions$().reposition__V()
});
$c_LUtils$.prototype.expand = (function() {
  return this.$$js$exported$meth$expand__O()
});
$c_LUtils$.prototype.collapse = (function() {
  return this.$$js$exported$meth$collapse__O()
});
$c_LUtils$.prototype.showPlotBounds = (function() {
  return this.$$js$exported$meth$showPlotBounds__O()
});
$c_LUtils$.prototype.scalePlot = (function(arg$1, arg$2) {
  var prep0 = $uI(arg$1);
  var prep1 = $uD(arg$2);
  return this.$$js$exported$meth$scalePlot__I__D__O(prep0, prep1)
});
$c_LUtils$.prototype.switchPlot = (function(arg$1) {
  var prep0 = $uI(arg$1);
  return this.$$js$exported$meth$switchPlot__I__O(prep0)
});
var $d_LUtils$ = new $TypeData().initClass({
  LUtils$: 0
}, false, "Utils$", {
  LUtils$: 1,
  O: 1
});
$c_LUtils$.prototype.$classData = $d_LUtils$;
var $n_LUtils$ = (void 0);
function $m_LUtils$() {
  if ((!$n_LUtils$)) {
    $n_LUtils$ = new $c_LUtils$().init___()
  };
  return $n_LUtils$
}
/** @constructor */
function $c_Lenv_Environment() {
  $c_O.call(this);
  this.Regions$module$1 = null;
  this.scene$1 = null;
  this.camera$1 = null;
  this.renderer$1 = null;
  this.plots3D$1 = null;
  this.active$1 = null;
  this.DNE$1 = 0
}
$c_Lenv_Environment.prototype = new $h_O();
$c_Lenv_Environment.prototype.constructor = $c_Lenv_Environment;
/** @constructor */
function $h_Lenv_Environment() {
  /*<skip>*/
}
$h_Lenv_Environment.prototype = $c_Lenv_Environment.prototype;
$c_Lenv_Environment.prototype.loadPlot__I__I__V = (function(regionID, plotID) {
  var this$1 = this.env$Environment$$Regions__Lenv_Environment$Regions$();
  if ((regionID > this$1.regions$1.u.length)) {
    var jsx$2 = $m_Lutil_Log$();
    var jsx$1 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["USER ERROR: There are only ", " regions, cannot load plot into region ", "."]));
    var this$2 = this.env$Environment$$Regions__Lenv_Environment$Regions$();
    jsx$2.apply__T__V(jsx$1.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this$2.regions$1.u.length, regionID])));
    var jsx$4 = $m_Lutil_Log$();
    var jsx$3 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Use loadPlot(", ", ", ") to create a new region containing that plot!"]));
    var this$3 = this.env$Environment$$Regions__Lenv_Environment$Regions$();
    jsx$4.apply__T__V(jsx$3.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this$3.regions$1.u.length, plotID])));
    return (void 0)
  };
  var this$4 = this.env$Environment$$Regions__Lenv_Environment$Regions$();
  if ((regionID === this$4.regions$1.u.length)) {
    this.env$Environment$$Regions__Lenv_Environment$Regions$().add__Lorg_scalajs_threejs_Object3D__V(new $g.THREE.Object3D());
    var xs = this.active$1;
    var n1 = ((1 + xs.u.length) | 0);
    var result = $newArrayObject($d_I.getArrayOf(), [n1]);
    $m_s_Array$().copy__O__I__O__I__I__V(xs, 0, result, 0, xs.u.length);
    result.set(xs.u.length, plotID);
    this.active$1 = result
  };
  this.env$Environment$$Regions__Lenv_Environment$Regions$().update__I__I__V(regionID, plotID);
  this.active$1.set(regionID, plotID)
});
$c_Lenv_Environment.prototype.nextPlot__I__V = (function(regionID) {
  if ((this.active$1.u.length <= regionID)) {
    this.loadPlot__I__I__V(regionID, 0)
  } else {
    this.loadPlot__I__I__V(regionID, ((((1 + this.active$1.get(regionID)) | 0) % $asArrayOf_Lplots_Plot(this.plots3D$1.get(((regionID % 2) | 0)).get__O(), 1).u.length) | 0))
  }
});
$c_Lenv_Environment.prototype.Regions$lzycompute$1__p1__V = (function() {
  if ((this.Regions$module$1 === null)) {
    this.Regions$module$1 = new $c_Lenv_Environment$Regions$().init___Lenv_Environment(this)
  }
});
$c_Lenv_Environment.prototype.getActivePlot__I__Lplots_Plot = (function(regionID) {
  return $asArrayOf_Lplots_Plot(this.plots3D$1.get(((regionID % 2) | 0)).get__O(), 1).get(this.active$1.get(regionID))
});
$c_Lenv_Environment.prototype.pointSelection__Lorg_scalajs_threejs_Raycaster__V = (function(rayCaster) {
  var this$1 = this.getActivePlot__I__Lplots_Plot(0);
  var jsx$2 = rayCaster.intersectObject(this$1.points$1);
  var this$2 = this.getActivePlot__I__Lplots_Plot(1);
  var jsx$1 = rayCaster.intersectObject(this$2.points$1);
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$2, jsx$1]);
  var len = $uI(xs.array$6.length);
  var array = $newArrayObject($d_sjs_js_Array.getArrayOf(), [len]);
  var elem$1 = 0;
  elem$1 = 0;
  var this$6 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(xs, 0, $uI(xs.array$6.length));
  while (this$6.hasNext__Z()) {
    var arg1 = this$6.next__O();
    array.set(elem$1, arg1);
    elem$1 = ((1 + elem$1) | 0)
  };
  var plot1 = this.getActivePlot__I__Lplots_Plot(0);
  var plot2 = this.getActivePlot__I__Lplots_Plot(1);
  var _1 = new $c_s_Tuple2$mcII$sp().init___I__I((-1), (-1));
  var _2 = new $c_s_Tuple2$mcII$sp().init___I__I((-1), (-1));
  var results1$2 = _1;
  var results2$2 = _2;
  var array$1 = array.get(0);
  if (($uI(array$1.length) !== 0)) {
    results1$2 = $m_Luserinput_Interactions$().on__O__sjs_js_Array__Luserinput_Interactions__T2(plot1, array.get(0), $m_Luserinput_Interactions$PlotInteractions$())
  };
  var array$2 = array.get(1);
  if (($uI(array$2.length) !== 0)) {
    results2$2 = $m_Luserinput_Interactions$().on__O__sjs_js_Array__Luserinput_Interactions__T2(plot2, array.get(1), $m_Luserinput_Interactions$PlotInteractions$())
  };
  var _1$mcI$sp = results1$2.$$und1$mcI$sp__I();
  var _2$mcI$sp = results1$2.$$und2$mcI$sp__I();
  var _1$mcI$sp$1 = results2$2.$$und1$mcI$sp__I();
  var _2$mcI$sp$1 = results2$2.$$und2$mcI$sp__I();
  if ((_1$mcI$sp !== (-1))) {
    var array$3 = [_1$mcI$sp];
    if (plot2.plots$Plot$$Selection__Lplots_Plot$Selection$().changesColor$1) {
      var i = 0;
      var len$1 = $uI(array$3.length);
      while ((i < len$1)) {
        var index = i;
        var arg1$1 = array$3[index];
        var i$1 = $uI(arg1$1);
        $f_Lplots_Plot__resetColor__pLplots_Plot__I__V(plot2, i$1);
        i = ((1 + i) | 0)
      }
    };
    if (plot2.plots$Plot$$Selection__Lplots_Plot$Selection$().changesSize$1) {
      var newSize = $fround($m_Lplots_Plot$().PARTICLE$undSIZE$1);
      var sizesAttr = plot2.getGeometry__Lorg_scalajs_threejs_BufferGeometry().getAttribute("size");
      var sArr = sizesAttr.array;
      var i$2 = 0;
      var len$2 = $uI(array$3.length);
      while ((i$2 < len$2)) {
        var index$1 = i$2;
        var arg1$2 = array$3[index$1];
        var i$3 = $uI(arg1$2);
        sArr[i$3] = newSize;
        i$2 = ((1 + i$2) | 0)
      };
      sizesAttr.needsUpdate = true
    }
  };
  if ((_2$mcI$sp !== (-1))) {
    var array$4 = [_2$mcI$sp];
    if (plot2.plots$Plot$$Selection__Lplots_Plot$Selection$().changesColor$1) {
      var r = plot2.plots$Plot$$Selection__Lplots_Plot$Selection$().red$1;
      var g = plot2.plots$Plot$$Selection__Lplots_Plot$Selection$().green$1;
      var b = plot2.plots$Plot$$Selection__Lplots_Plot$Selection$().blue$1;
      var colorsAttr = plot2.getGeometry__Lorg_scalajs_threejs_BufferGeometry().getAttribute("customColor");
      var cArr = colorsAttr.array;
      var i$4 = 0;
      var len$3 = $uI(array$4.length);
      while ((i$4 < len$3)) {
        var index$2 = i$4;
        var arg1$3 = array$4[index$2];
        var i$5 = $uI(arg1$3);
        cArr[$imul(3, i$5)] = r;
        cArr[((1 + $imul(3, i$5)) | 0)] = g;
        cArr[((2 + $imul(3, i$5)) | 0)] = b;
        i$4 = ((1 + i$4) | 0)
      };
      colorsAttr.needsUpdate = true
    };
    if (plot2.plots$Plot$$Selection__Lplots_Plot$Selection$().changesSize$1) {
      var newSize$1 = $fround(($fround($m_Lplots_Plot$().PARTICLE$undSIZE$1) * plot2.plots$Plot$$Selection__Lplots_Plot$Selection$().scale$1));
      var sizesAttr$1 = plot2.getGeometry__Lorg_scalajs_threejs_BufferGeometry().getAttribute("size");
      var sArr$1 = sizesAttr$1.array;
      var i$6 = 0;
      var len$4 = $uI(array$4.length);
      while ((i$6 < len$4)) {
        var index$3 = i$6;
        var arg1$4 = array$4[index$3];
        var i$7 = $uI(arg1$4);
        sArr$1[i$7] = newSize$1;
        i$6 = ((1 + i$6) | 0)
      };
      sizesAttr$1.needsUpdate = true
    }
  };
  if ((_1$mcI$sp$1 !== (-1))) {
    var array$5 = [_1$mcI$sp$1];
    if (plot1.plots$Plot$$Selection__Lplots_Plot$Selection$().changesColor$1) {
      var i$8 = 0;
      var len$5 = $uI(array$5.length);
      while ((i$8 < len$5)) {
        var index$4 = i$8;
        var arg1$5 = array$5[index$4];
        var i$9 = $uI(arg1$5);
        $f_Lplots_Plot__resetColor__pLplots_Plot__I__V(plot1, i$9);
        i$8 = ((1 + i$8) | 0)
      }
    };
    if (plot1.plots$Plot$$Selection__Lplots_Plot$Selection$().changesSize$1) {
      var newSize$2 = $fround($m_Lplots_Plot$().PARTICLE$undSIZE$1);
      var sizesAttr$2 = plot1.getGeometry__Lorg_scalajs_threejs_BufferGeometry().getAttribute("size");
      var sArr$2 = sizesAttr$2.array;
      var i$10 = 0;
      var len$6 = $uI(array$5.length);
      while ((i$10 < len$6)) {
        var index$5 = i$10;
        var arg1$6 = array$5[index$5];
        var i$11 = $uI(arg1$6);
        sArr$2[i$11] = newSize$2;
        i$10 = ((1 + i$10) | 0)
      };
      sizesAttr$2.needsUpdate = true
    }
  };
  if ((_2$mcI$sp$1 !== (-1))) {
    var array$6 = [_2$mcI$sp$1];
    if (plot1.plots$Plot$$Selection__Lplots_Plot$Selection$().changesColor$1) {
      var r$1 = plot1.plots$Plot$$Selection__Lplots_Plot$Selection$().red$1;
      var g$1 = plot1.plots$Plot$$Selection__Lplots_Plot$Selection$().green$1;
      var b$1 = plot1.plots$Plot$$Selection__Lplots_Plot$Selection$().blue$1;
      var colorsAttr$1 = plot1.getGeometry__Lorg_scalajs_threejs_BufferGeometry().getAttribute("customColor");
      var cArr$1 = colorsAttr$1.array;
      var i$12 = 0;
      var len$7 = $uI(array$6.length);
      while ((i$12 < len$7)) {
        var index$6 = i$12;
        var arg1$7 = array$6[index$6];
        var i$13 = $uI(arg1$7);
        cArr$1[$imul(3, i$13)] = r$1;
        cArr$1[((1 + $imul(3, i$13)) | 0)] = g$1;
        cArr$1[((2 + $imul(3, i$13)) | 0)] = b$1;
        i$12 = ((1 + i$12) | 0)
      };
      colorsAttr$1.needsUpdate = true
    };
    if (plot1.plots$Plot$$Selection__Lplots_Plot$Selection$().changesSize$1) {
      var newSize$3 = $fround(($fround($m_Lplots_Plot$().PARTICLE$undSIZE$1) * plot1.plots$Plot$$Selection__Lplots_Plot$Selection$().scale$1));
      var sizesAttr$3 = plot1.getGeometry__Lorg_scalajs_threejs_BufferGeometry().getAttribute("size");
      var sArr$3 = sizesAttr$3.array;
      var i$14 = 0;
      var len$8 = $uI(array$6.length);
      while ((i$14 < len$8)) {
        var index$7 = i$14;
        var arg1$8 = array$6[index$7];
        var i$15 = $uI(arg1$8);
        sArr$3[i$15] = newSize$3;
        i$14 = ((1 + i$14) | 0)
      };
      sizesAttr$3.needsUpdate = true
    }
  }
});
$c_Lenv_Environment.prototype.init___Lorg_scalajs_threejs_Scene__Lorg_scalajs_threejs_PerspectiveCamera__Lorg_scalajs_threejs_WebGLRenderer = (function(scene, camera, renderer) {
  this.scene$1 = scene;
  this.camera$1 = camera;
  this.renderer$1 = renderer;
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([$m_s_None$(), $m_s_None$()]);
  var len = $uI(xs.array$6.length);
  var array = $newArrayObject($d_s_Option.getArrayOf(), [len]);
  var elem$1 = 0;
  elem$1 = 0;
  var this$4 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(xs, 0, $uI(xs.array$6.length));
  while (this$4.hasNext__Z()) {
    var arg1 = this$4.next__O();
    array.set(elem$1, arg1);
    elem$1 = ((1 + elem$1) | 0)
  };
  this.plots3D$1 = array;
  var xs$1 = $m_sci_Nil$();
  var len$1 = $f_sc_LinearSeqOptimized__length__I(xs$1);
  var array$1 = $newArrayObject($d_I.getArrayOf(), [len$1]);
  var elem$1$1 = 0;
  elem$1$1 = 0;
  var this$9 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(xs$1);
  while (this$9.hasNext__Z()) {
    var arg1$1 = this$9.next__O();
    array$1.set(elem$1$1, $uI(arg1$1));
    elem$1$1 = ((1 + elem$1$1) | 0)
  };
  this.active$1 = array$1;
  this.DNE$1 = (-248);
  return this
});
$c_Lenv_Environment.prototype.render__V = (function() {
  var this$1 = $m_Luserinput_Controls$();
  var maybeRC = ((!this$1.instance$1.controllerConnected__Z()) ? (this$1.rayCaster$1.setFromCamera(this$1.instance$1.mouse$1, this.camera$1), new $c_s_Some().init___O(this$1.rayCaster$1)) : $m_Luserinput_OculusControllers$().getActiveRayCaster__s_Option());
  if (maybeRC.isDefined__Z()) {
    var this$2 = this.env$Environment$$Regions__Lenv_Environment$Regions$();
    if ((this$2.regions$1.u.length >= 2)) {
      this.pointSelection__Lorg_scalajs_threejs_Raycaster__V(maybeRC.get__O())
    }
  };
  this.renderer$1.render(this.scene$1, this.camera$1)
});
$c_Lenv_Environment.prototype.env$Environment$$Regions__Lenv_Environment$Regions$ = (function() {
  if ((this.Regions$module$1 === null)) {
    this.Regions$lzycompute$1__p1__V()
  };
  return this.Regions$module$1
});
$c_Lenv_Environment.prototype.addPlots__I__s_Option__V = (function(regionID, plots) {
  $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Added plots to region #", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([regionID])));
  this.plots3D$1.set(regionID, plots)
});
$c_Lenv_Environment.prototype.getPlot__I__I__Lplots_Plot = (function(regionID, plotID) {
  return $asArrayOf_Lplots_Plot(this.plots3D$1.get(((regionID % 2) | 0)).get__O(), 1).get(plotID)
});
var $d_Lenv_Environment = new $TypeData().initClass({
  Lenv_Environment: 0
}, false, "env.Environment", {
  Lenv_Environment: 1,
  O: 1
});
$c_Lenv_Environment.prototype.$classData = $d_Lenv_Environment;
/** @constructor */
function $c_Lenv_Environment$() {
  $c_O.call(this);
  this.instance$1 = null
}
$c_Lenv_Environment$.prototype = new $h_O();
$c_Lenv_Environment$.prototype.constructor = $c_Lenv_Environment$;
/** @constructor */
function $h_Lenv_Environment$() {
  /*<skip>*/
}
$h_Lenv_Environment$.prototype = $c_Lenv_Environment$.prototype;
$c_Lenv_Environment$.prototype.init___ = (function() {
  return this
});
$c_Lenv_Environment$.prototype.makeRenderer__p1__Lorg_scalajs_threejs_WebGLRenderer = (function() {
  var renderer = new $g.THREE.WebGLRenderer();
  renderer.setSize($m_Lwindow_Window$().width__D(), $m_Lwindow_Window$().height__D());
  renderer.devicePixelRatio = $m_Lwindow_Window$().devicePixelRatio__D();
  renderer.vr.enabled = false;
  return renderer
});
$c_Lenv_Environment$.prototype.addFloor$1__p1__Lorg_scalajs_threejs_Scene__V = (function(scene$1) {
  var floorMaterial = new $g.THREE.MeshLambertMaterial();
  floorMaterial.color = new $g.THREE.Color(1.6777215E7);
  var floorGeometry = new $g.THREE.PlaneGeometry(6.0, 6.0, 32.0);
  var floor = new $g.THREE.Mesh(floorGeometry, floorMaterial);
  floor.receiveShadow = true;
  floor.rotateX((-1.57075));
  var floorGrid = new $g.THREE.GridHelper(6.0, 6.0, $m_Lplots_Colors$().Black$1, $m_Lplots_Colors$().Black$1);
  floorGrid.position.setY(0.001);
  floorGrid.material.linewidth = 2.0;
  scene$1.add(floorGrid);
  scene$1.add(floor);
  var elem = new $g.THREE.MeshLambertMaterial();
  var elem$1 = null;
  elem$1 = elem;
  new $g.THREE.CubeGeometry(1.0, 0.35, 1.0);
  var boxGeo = new $g.THREE.CubeGeometry(1.0, 0.35, 1.0);
  var cube = new $g.THREE.Mesh(boxGeo, elem$1);
  cube.castShadow = true;
  cube.receiveShadow = true;
  cube.position.set(2.5, 0.175, 2.5);
  scene$1.add(cube);
  var boxGeo$1 = new $g.THREE.CubeGeometry(1.0, 0.35, 1.0);
  var cube$1 = new $g.THREE.Mesh(boxGeo$1, elem$1);
  cube$1.castShadow = true;
  cube$1.receiveShadow = true;
  cube$1.position.set((-2.5), 0.175, 2.5);
  scene$1.add(cube$1);
  var boxGeo$2 = new $g.THREE.CubeGeometry(1.0, 0.35, 1.0);
  var cube$2 = new $g.THREE.Mesh(boxGeo$2, elem$1);
  cube$2.castShadow = true;
  cube$2.receiveShadow = true;
  cube$2.position.set((-2.5), 0.175, (-2.5));
  scene$1.add(cube$2);
  var boxGeo$3 = new $g.THREE.CubeGeometry(1.0, 0.35, 1.0);
  var cube$3 = new $g.THREE.Mesh(boxGeo$3, elem$1);
  cube$3.castShadow = true;
  cube$3.receiveShadow = true;
  cube$3.position.set(2.5, 0.175, (-2.5));
  scene$1.add(cube$3);
  var boxGeo$4 = new $g.THREE.CubeGeometry(1.0, 0.25, 1.0);
  var cube$4 = new $g.THREE.Mesh(boxGeo$4, elem$1);
  cube$4.castShadow = true;
  cube$4.receiveShadow = true;
  cube$4.position.set(2.5, 0.125, 1.5);
  scene$1.add(cube$4);
  var boxGeo$5 = new $g.THREE.CubeGeometry(1.0, 0.25, 1.0);
  var cube$5 = new $g.THREE.Mesh(boxGeo$5, elem$1);
  cube$5.castShadow = true;
  cube$5.receiveShadow = true;
  cube$5.position.set((-2.5), 0.125, 1.5);
  scene$1.add(cube$5);
  var boxGeo$6 = new $g.THREE.CubeGeometry(1.0, 0.25, 1.0);
  var cube$6 = new $g.THREE.Mesh(boxGeo$6, elem$1);
  cube$6.castShadow = true;
  cube$6.receiveShadow = true;
  cube$6.position.set((-2.5), 0.125, (-1.5));
  scene$1.add(cube$6);
  var boxGeo$7 = new $g.THREE.CubeGeometry(1.0, 0.25, 1.0);
  var cube$7 = new $g.THREE.Mesh(boxGeo$7, elem$1);
  cube$7.castShadow = true;
  cube$7.receiveShadow = true;
  cube$7.position.set(2.5, 0.125, (-1.5));
  scene$1.add(cube$7);
  var boxGeo$8 = new $g.THREE.CubeGeometry(1.0, 0.25, 1.0);
  var cube$8 = new $g.THREE.Mesh(boxGeo$8, elem$1);
  cube$8.castShadow = true;
  cube$8.receiveShadow = true;
  cube$8.position.set(1.5, 0.125, 2.5);
  scene$1.add(cube$8);
  var boxGeo$9 = new $g.THREE.CubeGeometry(1.0, 0.25, 1.0);
  var cube$9 = new $g.THREE.Mesh(boxGeo$9, elem$1);
  cube$9.castShadow = true;
  cube$9.receiveShadow = true;
  cube$9.position.set((-1.5), 0.125, 2.5);
  scene$1.add(cube$9);
  var boxGeo$10 = new $g.THREE.CubeGeometry(1.0, 0.25, 1.0);
  var cube$10 = new $g.THREE.Mesh(boxGeo$10, elem$1);
  cube$10.castShadow = true;
  cube$10.receiveShadow = true;
  cube$10.position.set((-1.5), 0.125, (-2.5));
  scene$1.add(cube$10);
  var boxGeo$11 = new $g.THREE.CubeGeometry(1.0, 0.25, 1.0);
  var cube$11 = new $g.THREE.Mesh(boxGeo$11, elem$1);
  cube$11.castShadow = true;
  cube$11.receiveShadow = true;
  cube$11.position.set(1.5, 0.125, (-2.5));
  scene$1.add(cube$11)
});
$c_Lenv_Environment$.prototype.makeLight__D__D__Lorg_scalajs_threejs_Light = (function(yPos, xOrientation) {
  var spotlight = new $g.THREE.SpotLight(1.6777215E7, 0.5);
  spotlight.distance = 10.0;
  spotlight.castShadow = true;
  spotlight.position.set(0.0, yPos, 0.0);
  spotlight.rotateX(xOrientation);
  return spotlight
});
$c_Lenv_Environment$.prototype.setup__Lorg_scalajs_dom_raw_Element__Lenv_Environment = (function(container) {
  var camera = this.makeCamera__p1__D__Lorg_scalajs_threejs_PerspectiveCamera($m_Lwindow_Window$().aspectRatio__D());
  var renderer = this.makeRenderer__p1__Lorg_scalajs_threejs_WebGLRenderer();
  container.appendChild(renderer.domElement);
  var scene = this.makeScene__p1__Lorg_scalajs_threejs_Scene();
  scene.add(camera);
  var env = new $c_Lenv_Environment().init___Lorg_scalajs_threejs_Scene__Lorg_scalajs_threejs_PerspectiveCamera__Lorg_scalajs_threejs_WebGLRenderer(scene, camera, renderer);
  this.instance$1 = env;
  var loadTexture = $m_Lresources_package$Res$().loadPointTexture__I__s_concurrent_Future(1);
  var pf = new $c_Lenv_Environment$$anonfun$setup$1().init___Lenv_Environment(env);
  var executor = $m_s_concurrent_ExecutionContext$Implicits$().global__s_concurrent_ExecutionContext();
  $f_s_concurrent_Future__andThen__s_PartialFunction__s_concurrent_ExecutionContext__s_concurrent_Future(loadTexture, pf, executor);
  return env
});
$c_Lenv_Environment$.prototype.addRoof$1__p1__D__Lorg_scalajs_threejs_Scene__D__V = (function(height, scene$1, delta$1) {
  var material = new $g.THREE.MeshLambertMaterial();
  material.color = new $g.THREE.Color(1.6777215E7);
  var roofGeometry = new $g.THREE.PlaneGeometry(6.0, 6.0, 32.0);
  var roof = new $g.THREE.Mesh(roofGeometry, material);
  roof.translateY(height);
  roof.rotateX(1.57075);
  var roofGrid = new $g.THREE.GridHelper(6.0, 6.0, $m_Lplots_Colors$().Black$1, $m_Lplots_Colors$().Black$1);
  roofGrid.position.setY((height - delta$1));
  scene$1.add(roofGrid);
  scene$1.add(roof)
});
$c_Lenv_Environment$.prototype.makeCamera__p1__D__Lorg_scalajs_threejs_PerspectiveCamera = (function(aspectRatio) {
  return new $g.THREE.PerspectiveCamera(65.0, aspectRatio, 0.01, 20000.0)
});
$c_Lenv_Environment$.prototype.makeScene__p1__Lorg_scalajs_threejs_Scene = (function() {
  var scene = new $g.THREE.Scene();
  scene.background = new $g.THREE.Color(8306926.0);
  var floorLight = this.makeLight__D__D__Lorg_scalajs_threejs_Light(3.0, 0.0);
  scene.add(floorLight);
  this.addFloor$1__p1__Lorg_scalajs_threejs_Scene__V(scene);
  this.addRoof$1__p1__D__Lorg_scalajs_threejs_Scene__D__V(6.0, scene, 0.001);
  return scene
});
$c_Lenv_Environment$.prototype.makePlots__Lenv_Environment__Lorg_scalajs_threejs_Texture__V = (function(env, texture) {
  this.makeSingle$1__p1__Lorg_scalajs_threejs_Texture__I__T__D__Lenv_Environment__V(texture, 0, "SM1_timeSeries", $m_Lplots_Colors$().RED$undHUE$undSHIFT$1, env);
  this.makeSingle$1__p1__Lorg_scalajs_threejs_Texture__I__T__D__Lenv_Environment__V(texture, 1, "SM2_timeSeries", $m_Lplots_Colors$().RED$undHUE$undSHIFT$1, env)
});
$c_Lenv_Environment$.prototype.makeSingle$1__p1__Lorg_scalajs_threejs_Texture__I__T__D__Lenv_Environment__V = (function(texture, plotNumber, storageID, hue, env$2) {
  var sm = this.createSMPlots__T__D__I__s_Option(storageID, hue, 1);
  if (sm.isEmpty__Z()) {
    return (void 0)
  };
  env$2.addPlots__I__s_Option__V(plotNumber, sm);
  env$2.loadPlot__I__I__V(plotNumber, 0);
  var axes = $m_Lplots_CoordinateAxes3D$().create__D__Lorg_scalajs_threejs_Color__Z__Z__Lplots_CoordinateAxes3D(1.0, $m_Lplots_Colors$().Black$1, true, false);
  env$2.env$Environment$$Regions__Lenv_Environment$Regions$().apply__I__Lorg_scalajs_threejs_Object3D(plotNumber).add(axes)
});
$c_Lenv_Environment$.prototype.createSMPlots__T__D__I__s_Option = (function(localStorageID, hue, textureIndex) {
  var timeSeries = $m_Lresources_package$BrowserStorage$().timeSeriesFromCSV__T__s_Option(localStorageID);
  if (timeSeries.isEmpty__Z()) {
    return $m_s_None$()
  } else {
    var xs = $asArrayOf_O(timeSeries.get__O(), 1);
    var elems$2 = null;
    elems$2 = [];
    var x1 = xs.u.length;
    switch (x1) {
      case (-1): {
        break
      }
    };
    var i = 0;
    var len = xs.u.length;
    while ((i < len)) {
      var index = i;
      var arg1 = xs.get(index);
      var x0$1 = $as_T2(arg1);
      if ((x0$1 === null)) {
        throw new $c_s_MatchError().init___O(x0$1)
      };
      var id = $as_T(x0$1.$$und1__O());
      var vs = $asArrayOf_D(x0$1.$$und2__O(), 1);
      var elem = new $c_T2().init___O__O(id, $m_Lmath_Stats$().standardize__sc_Seq__AD($m_s_Predef$().wrapDoubleArray__AD__scm_WrappedArray(vs)));
      elems$2.push(elem);
      i = ((1 + i) | 0)
    };
    var standardizedData = $makeNativeArrayWrapper($d_T2.getArrayOf(), elems$2);
    var xs$1 = $m_sci_Nil$();
    var len$1 = $f_sc_LinearSeqOptimized__length__I(xs$1);
    var array = $newArrayObject($d_Lplots_ShadowManifold.getArrayOf(), [len$1]);
    var elem$1 = 0;
    elem$1 = 0;
    var this$12 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(xs$1);
    while (this$12.hasNext__Z()) {
      var arg1$1 = this$12.next__O();
      array.set(elem$1, arg1$1);
      elem$1 = ((1 + elem$1) | 0)
    };
    var plots = new $c_sr_ObjectRef().init___O(array);
    var i$1 = new $c_sr_IntRef().init___I(0);
    var this$16 = new $c_scm_ArrayOps$ofRef().init___AO(standardizedData);
    var p = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1) {
      return (function(check$ifrefutable$1$2) {
        var check$ifrefutable$1 = $as_T2(check$ifrefutable$1$2);
        return (check$ifrefutable$1 !== null)
      })
    })(this));
    new $c_sc_TraversableLike$WithFilter().init___sc_TraversableLike__F1(this$16, p).foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$3$1, hue$1, textureIndex$1, plots$1, i$2) {
      return (function(x$4$2) {
        var x$4 = $as_T2(x$4$2);
        if ((x$4 !== null)) {
          var id$1 = $as_T(x$4.$$und1__O());
          var data = $asArrayOf_D(x$4.$$und2__O(), 1);
          var jsx$3 = new $c_Lplots_PointsBuilder().init___AD__AD__AD__I__s_Option(null, null, null, 0, $m_s_None$());
          var until = data.u.length;
          var x = ((until > 0) ? until : 0);
          var y = data.u.length;
          var hi = ((x < y) ? x : y);
          var x$1 = (((-2) + hi) | 0);
          var size = ((x$1 > 0) ? x$1 : 0);
          var result = $m_jl_reflect_Array$().newInstance__jl_Class__I__O($objectGetClass(data).getComponentType__jl_Class(), size);
          if ((size > 0)) {
            $m_s_Array$().copy__O__I__O__I__I__V(data, 2, result, 0, size)
          };
          var jsx$2 = jsx$3.withXS__AD__Lplots_PointsBuilder($asArrayOf_D(result, 1));
          if ((data.u.length === 0)) {
            if ((data.u.length === 0)) {
              throw new $c_jl_UnsupportedOperationException().init___T("empty.tail")
            };
            var until$1 = data.u.length;
            var x$2 = ((until$1 > 0) ? until$1 : 0);
            var y$1 = data.u.length;
            var hi$1 = ((x$2 < y$1) ? x$2 : y$1);
            var x$3 = (((-1) + hi$1) | 0);
            var size$1 = ((x$3 > 0) ? x$3 : 0);
            var result$1 = $m_jl_reflect_Array$().newInstance__jl_Class__I__O($objectGetClass(data).getComponentType__jl_Class(), size$1);
            if ((size$1 > 0)) {
              $m_s_Array$().copy__O__I__O__I__I__V(data, 1, result$1, 0, size$1)
            };
            var jsx$1 = result$1
          } else {
            var until$2 = data.u.length;
            var x$5 = ((until$2 > 0) ? until$2 : 0);
            var y$2 = data.u.length;
            var hi$2 = ((x$5 < y$2) ? x$5 : y$2);
            var x$6 = (((-1) + hi$2) | 0);
            var size$2 = ((x$6 > 0) ? x$6 : 0);
            var result$2 = $m_jl_reflect_Array$().newInstance__jl_Class__I__O($objectGetClass(data).getComponentType__jl_Class(), size$2);
            if ((size$2 > 0)) {
              $m_s_Array$().copy__O__I__O__I__I__V(data, 1, result$2, 0, size$2)
            };
            var jsx$1 = result$2
          };
          var points = jsx$2.withYS__AD__Lplots_PointsBuilder($asArrayOf_D(jsx$1, 1)).withZS__AD__Lplots_PointsBuilder(data).usingHue__s_Option__Lplots_PointsBuilder(new $c_s_Some().init___O(hue$1)).usingTexture__I__Lplots_PointsBuilder(textureIndex$1).build3D__Lorg_scalajs_threejs_Points();
          var xs$2 = $asArrayOf_Lplots_ShadowManifold(plots$1.elem$1, 1);
          var elem$2 = $m_Lplots_ShadowManifold$().apply__T__Lorg_scalajs_threejs_Points__D__Lplots_ShadowManifold(id$1, points, hue$1);
          var n1 = ((1 + xs$2.u.length) | 0);
          var result$3 = $newArrayObject($d_Lplots_ShadowManifold.getArrayOf(), [n1]);
          $m_s_Array$().copy__O__I__O__I__I__V(xs$2, 0, result$3, 0, xs$2.u.length);
          result$3.set(xs$2.u.length, elem$2);
          plots$1.elem$1 = result$3;
          i$2.elem$1 = ((1 + i$2.elem$1) | 0)
        } else {
          throw new $c_s_MatchError().init___O(x$4)
        }
      })
    })(this, hue, textureIndex, plots, i$1)));
    return new $c_s_Some().init___O($asArrayOf_Lplots_ShadowManifold(plots.elem$1, 1))
  }
});
var $d_Lenv_Environment$ = new $TypeData().initClass({
  Lenv_Environment$: 0
}, false, "env.Environment$", {
  Lenv_Environment$: 1,
  O: 1
});
$c_Lenv_Environment$.prototype.$classData = $d_Lenv_Environment$;
var $n_Lenv_Environment$ = (void 0);
function $m_Lenv_Environment$() {
  if ((!$n_Lenv_Environment$)) {
    $n_Lenv_Environment$ = new $c_Lenv_Environment$().init___()
  };
  return $n_Lenv_Environment$
}
/** @constructor */
function $c_Lenv_Environment$Regions$() {
  $c_O.call(this);
  this.regions$1 = null;
  this.$$outer$1 = null
}
$c_Lenv_Environment$Regions$.prototype = new $h_O();
$c_Lenv_Environment$Regions$.prototype.constructor = $c_Lenv_Environment$Regions$;
/** @constructor */
function $h_Lenv_Environment$Regions$() {
  /*<skip>*/
}
$h_Lenv_Environment$Regions$.prototype = $c_Lenv_Environment$Regions$.prototype;
$c_Lenv_Environment$Regions$.prototype.reposition__V = (function() {
  var this$1 = this.$$outer$1.env$Environment$$Regions__Lenv_Environment$Regions$();
  var x1 = this$1.regions$1.u.length;
  switch (x1) {
    case 1: {
      this.regions$1.get(0).position.set(0.0, 1.0, (-2.0));
      break
    }
    case 2: {
      this.regions$1.get(0).position.set((-1.0), 1.0, (-1.0));
      this.regions$1.get(1).position.set(1.0, 1.0, (-1.0));
      break
    }
    case 3: {
      this.regions$1.get(0).position.set((-1.0), 1.0, (-1.0));
      this.regions$1.get(1).position.set(1.0, 1.0, (-1.0));
      this.regions$1.get(2).position.set((-2.0), 1.0, 0.0);
      break
    }
    case 4: {
      this.regions$1.get(0).position.set((-1.0), 1.0, (-1.0));
      this.regions$1.get(1).position.set(1.0, 1.0, (-1.0));
      this.regions$1.get(2).position.set((-2.0), 1.0, 0.0);
      this.regions$1.get(3).position.set(2.0, 1.0, 0.0);
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
});
$c_Lenv_Environment$Regions$.prototype.update__I__I__V = (function(regionID, plotID) {
  if ((this.$$outer$1.active$1.get(regionID) !== this.$$outer$1.DNE$1)) {
    var jsx$1 = this.regions$1.get(regionID);
    var this$1 = this.$$outer$1.getPlot__I__I__Lplots_Plot(((regionID % 2) | 0), this.$$outer$1.active$1.get(regionID));
    jsx$1.remove(this$1.points$1)
  };
  var jsx$2 = this.regions$1.get(regionID);
  var this$2 = this.$$outer$1.getPlot__I__I__Lplots_Plot(((regionID % 2) | 0), plotID);
  jsx$2.add(this$2.points$1)
});
$c_Lenv_Environment$Regions$.prototype.add__Lorg_scalajs_threejs_Object3D__V = (function(newRegion) {
  $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Adding region #", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.regions$1.u.length])));
  var xs = this.regions$1;
  var n1 = ((1 + xs.u.length) | 0);
  var result = $newArrayObject($d_Lorg_scalajs_threejs_Object3D.getArrayOf(), [n1]);
  $m_s_Array$().copy__O__I__O__I__I__V(xs, 0, result, 0, xs.u.length);
  result.set(xs.u.length, newRegion);
  this.regions$1 = result;
  this.$$outer$1.scene$1.add(newRegion);
  this.reposition__V()
});
$c_Lenv_Environment$Regions$.prototype.apply__I__Lorg_scalajs_threejs_Object3D = (function(i) {
  return this.regions$1.get(i)
});
$c_Lenv_Environment$Regions$.prototype.init___Lenv_Environment = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  var xs = $m_sci_Nil$();
  var len = $f_sc_LinearSeqOptimized__length__I(xs);
  var array = $newArrayObject($d_Lorg_scalajs_threejs_Object3D.getArrayOf(), [len]);
  var elem$1 = 0;
  elem$1 = 0;
  var this$4 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(xs);
  while (this$4.hasNext__Z()) {
    var arg1 = this$4.next__O();
    array.set(elem$1, arg1);
    elem$1 = ((1 + elem$1) | 0)
  };
  this.regions$1 = array;
  return this
});
var $d_Lenv_Environment$Regions$ = new $TypeData().initClass({
  Lenv_Environment$Regions$: 0
}, false, "env.Environment$Regions$", {
  Lenv_Environment$Regions$: 1,
  O: 1
});
$c_Lenv_Environment$Regions$.prototype.$classData = $d_Lenv_Environment$Regions$;
/** @constructor */
function $c_Lmath_Stats$() {
  $c_O.call(this)
}
$c_Lmath_Stats$.prototype = new $h_O();
$c_Lmath_Stats$.prototype.constructor = $c_Lmath_Stats$;
/** @constructor */
function $h_Lmath_Stats$() {
  /*<skip>*/
}
$h_Lmath_Stats$.prototype = $c_Lmath_Stats$.prototype;
$c_Lmath_Stats$.prototype.init___ = (function() {
  return this
});
$c_Lmath_Stats$.prototype.standardize__sc_Seq__AD = (function(ts) {
  var mean = ($uD(ts.sum__s_math_Numeric__O($m_s_math_Numeric$DoubleIsFractional$())) / ts.length__I());
  var standev = this.standardDeviation__sc_Seq__D(ts);
  var xs = $asArrayOf_D(ts.toArray__s_reflect_ClassTag__O($m_s_reflect_ManifestFactory$DoubleManifest$()), 1);
  var elems$2 = null;
  elems$2 = [];
  var x1 = xs.u.length;
  switch (x1) {
    case (-1): {
      break
    }
  };
  var i = 0;
  var len = xs.u.length;
  while ((i < len)) {
    var idx = i;
    var arg1 = xs.get(idx);
    var elem = ((arg1 - mean) / standev);
    elems$2.push(elem);
    i = ((1 + i) | 0)
  };
  return $makeNativeArrayWrapper($d_D.getArrayOf(), elems$2)
});
$c_Lmath_Stats$.prototype.standardDeviation__sc_Seq__D = (function(data) {
  var mean = ($uD(data.sum__s_math_Numeric__O($m_s_math_Numeric$DoubleIsFractional$())) / data.length__I());
  var jsx$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, mean$1) {
    return (function(x$2) {
      var x = $uD(x$2);
      var x$1 = (mean$1 + x);
      return $uD($g.Math.pow(x$1, 2.0))
    })
  })(this, mean));
  var this$3 = $m_sc_Seq$();
  var x$3 = ($uD($as_sc_TraversableOnce(data.map__F1__scg_CanBuildFrom__O(jsx$1, this$3.ReusableCBFInstance$2)).sum__s_math_Numeric__O($m_s_math_Numeric$DoubleIsFractional$())) / data.length__I());
  return $uD($g.Math.sqrt(x$3))
});
var $d_Lmath_Stats$ = new $TypeData().initClass({
  Lmath_Stats$: 0
}, false, "math.Stats$", {
  Lmath_Stats$: 1,
  O: 1
});
$c_Lmath_Stats$.prototype.$classData = $d_Lmath_Stats$;
var $n_Lmath_Stats$ = (void 0);
function $m_Lmath_Stats$() {
  if ((!$n_Lmath_Stats$)) {
    $n_Lmath_Stats$ = new $c_Lmath_Stats$().init___()
  };
  return $n_Lmath_Stats$
}
/** @constructor */
function $c_Lorg_scalajs_dom_ext_Storage() {
  $c_O.call(this);
  this.domStorage$1 = null
}
$c_Lorg_scalajs_dom_ext_Storage.prototype = new $h_O();
$c_Lorg_scalajs_dom_ext_Storage.prototype.constructor = $c_Lorg_scalajs_dom_ext_Storage;
/** @constructor */
function $h_Lorg_scalajs_dom_ext_Storage() {
  /*<skip>*/
}
$h_Lorg_scalajs_dom_ext_Storage.prototype = $c_Lorg_scalajs_dom_ext_Storage.prototype;
$c_Lorg_scalajs_dom_ext_Storage.prototype.init___Lorg_scalajs_dom_raw_Storage = (function(domStorage) {
  this.domStorage$1 = domStorage;
  return this
});
$c_Lorg_scalajs_dom_ext_Storage.prototype.apply__T__s_Option = (function(key) {
  return $m_s_Option$().apply__O__s_Option($as_T(this.domStorage$1.getItem(key)))
});
/** @constructor */
function $c_Lorg_scalajs_dom_package$() {
  $c_O.call(this);
  this.ApplicationCache$1 = null;
  this.Blob$1 = null;
  this.BlobPropertyBag$1 = null;
  this.ClipboardEventInit$1 = null;
  this.DOMException$1 = null;
  this.Event$1 = null;
  this.EventException$1 = null;
  this.EventSource$1 = null;
  this.FileReader$1 = null;
  this.FormData$1 = null;
  this.KeyboardEvent$1 = null;
  this.MediaError$1 = null;
  this.MutationEvent$1 = null;
  this.MutationObserverInit$1 = null;
  this.Node$1 = null;
  this.NodeFilter$1 = null;
  this.PerformanceNavigation$1 = null;
  this.PositionError$1 = null;
  this.Range$1 = null;
  this.TextEvent$1 = null;
  this.TextTrack$1 = null;
  this.URL$1 = null;
  this.VisibilityState$1 = null;
  this.WebSocket$1 = null;
  this.WheelEvent$1 = null;
  this.XMLHttpRequest$1 = null;
  this.XPathResult$1 = null;
  this.window$1 = null;
  this.document$1 = null;
  this.console$1 = null;
  this.bitmap$0$1 = 0
}
$c_Lorg_scalajs_dom_package$.prototype = new $h_O();
$c_Lorg_scalajs_dom_package$.prototype.constructor = $c_Lorg_scalajs_dom_package$;
/** @constructor */
function $h_Lorg_scalajs_dom_package$() {
  /*<skip>*/
}
$h_Lorg_scalajs_dom_package$.prototype = $c_Lorg_scalajs_dom_package$.prototype;
$c_Lorg_scalajs_dom_package$.prototype.init___ = (function() {
  return this
});
$c_Lorg_scalajs_dom_package$.prototype.console$lzycompute__p1__Lorg_scalajs_dom_raw_Console = (function() {
  if (((536870912 & this.bitmap$0$1) === 0)) {
    this.console$1 = this.window__Lorg_scalajs_dom_raw_Window().console;
    this.bitmap$0$1 = (536870912 | this.bitmap$0$1)
  };
  return this.console$1
});
$c_Lorg_scalajs_dom_package$.prototype.document__Lorg_scalajs_dom_raw_HTMLDocument = (function() {
  return (((268435456 & this.bitmap$0$1) === 0) ? this.document$lzycompute__p1__Lorg_scalajs_dom_raw_HTMLDocument() : this.document$1)
});
$c_Lorg_scalajs_dom_package$.prototype.window__Lorg_scalajs_dom_raw_Window = (function() {
  return (((134217728 & this.bitmap$0$1) === 0) ? this.window$lzycompute__p1__Lorg_scalajs_dom_raw_Window() : this.window$1)
});
$c_Lorg_scalajs_dom_package$.prototype.window$lzycompute__p1__Lorg_scalajs_dom_raw_Window = (function() {
  if (((134217728 & this.bitmap$0$1) === 0)) {
    this.window$1 = $g.window;
    this.bitmap$0$1 = (134217728 | this.bitmap$0$1)
  };
  return this.window$1
});
$c_Lorg_scalajs_dom_package$.prototype.document$lzycompute__p1__Lorg_scalajs_dom_raw_HTMLDocument = (function() {
  if (((268435456 & this.bitmap$0$1) === 0)) {
    this.document$1 = this.window__Lorg_scalajs_dom_raw_Window().document;
    this.bitmap$0$1 = (268435456 | this.bitmap$0$1)
  };
  return this.document$1
});
$c_Lorg_scalajs_dom_package$.prototype.console__Lorg_scalajs_dom_raw_Console = (function() {
  return (((536870912 & this.bitmap$0$1) === 0) ? this.console$lzycompute__p1__Lorg_scalajs_dom_raw_Console() : this.console$1)
});
var $d_Lorg_scalajs_dom_package$ = new $TypeData().initClass({
  Lorg_scalajs_dom_package$: 0
}, false, "org.scalajs.dom.package$", {
  Lorg_scalajs_dom_package$: 1,
  O: 1
});
$c_Lorg_scalajs_dom_package$.prototype.$classData = $d_Lorg_scalajs_dom_package$;
var $n_Lorg_scalajs_dom_package$ = (void 0);
function $m_Lorg_scalajs_dom_package$() {
  if ((!$n_Lorg_scalajs_dom_package$)) {
    $n_Lorg_scalajs_dom_package$ = new $c_Lorg_scalajs_dom_package$().init___()
  };
  return $n_Lorg_scalajs_dom_package$
}
/** @constructor */
function $c_Lplots_Colors$() {
  $c_O.call(this);
  this.RED$undHUE$undSHIFT$1 = 0.0;
  this.BLUE$undHUE$undSHIFT$1 = 0.0;
  this.AquaBlue$1 = 0;
  this.Orange$1 = 0;
  this.Indigo$1 = 0;
  this.PaleGreen$1 = 0;
  this.MintGreen$1 = 0;
  this.Black$1 = null;
  this.White$1 = null;
  this.Red$1 = null;
  this.Green$1 = null;
  this.Blue$1 = null
}
$c_Lplots_Colors$.prototype = new $h_O();
$c_Lplots_Colors$.prototype.constructor = $c_Lplots_Colors$;
/** @constructor */
function $h_Lplots_Colors$() {
  /*<skip>*/
}
$h_Lplots_Colors$.prototype = $c_Lplots_Colors$.prototype;
$c_Lplots_Colors$.prototype.init___ = (function() {
  $n_Lplots_Colors$ = this;
  this.RED$undHUE$undSHIFT$1 = 0.01;
  this.BLUE$undHUE$undSHIFT$1 = 0.5;
  this.AquaBlue$1 = 7456997;
  this.Orange$1 = 15044209;
  this.Indigo$1 = 9335269;
  this.PaleGreen$1 = 13165937;
  this.MintGreen$1 = 7464334;
  this.Black$1 = new $g.THREE.Color($m_Lplots_Colors$Hex$().BLACK$1);
  this.White$1 = new $g.THREE.Color($m_Lplots_Colors$Hex$().WHITE$1);
  this.Red$1 = new $g.THREE.Color(1.671168E7);
  this.Green$1 = new $g.THREE.Color(65280.0);
  this.Blue$1 = new $g.THREE.Color(255.0);
  return this
});
var $d_Lplots_Colors$ = new $TypeData().initClass({
  Lplots_Colors$: 0
}, false, "plots.Colors$", {
  Lplots_Colors$: 1,
  O: 1
});
$c_Lplots_Colors$.prototype.$classData = $d_Lplots_Colors$;
var $n_Lplots_Colors$ = (void 0);
function $m_Lplots_Colors$() {
  if ((!$n_Lplots_Colors$)) {
    $n_Lplots_Colors$ = new $c_Lplots_Colors$().init___()
  };
  return $n_Lplots_Colors$
}
/** @constructor */
function $c_Lplots_Colors$Hex$() {
  $c_O.call(this);
  this.WHITE$1 = 0;
  this.GRAY$1 = 0;
  this.BLACK$1 = 0
}
$c_Lplots_Colors$Hex$.prototype = new $h_O();
$c_Lplots_Colors$Hex$.prototype.constructor = $c_Lplots_Colors$Hex$;
/** @constructor */
function $h_Lplots_Colors$Hex$() {
  /*<skip>*/
}
$h_Lplots_Colors$Hex$.prototype = $c_Lplots_Colors$Hex$.prototype;
$c_Lplots_Colors$Hex$.prototype.init___ = (function() {
  this.WHITE$1 = 16777215;
  this.GRAY$1 = 11184810;
  this.BLACK$1 = 0;
  return this
});
var $d_Lplots_Colors$Hex$ = new $TypeData().initClass({
  Lplots_Colors$Hex$: 0
}, false, "plots.Colors$Hex$", {
  Lplots_Colors$Hex$: 1,
  O: 1
});
$c_Lplots_Colors$Hex$.prototype.$classData = $d_Lplots_Colors$Hex$;
var $n_Lplots_Colors$Hex$ = (void 0);
function $m_Lplots_Colors$Hex$() {
  if ((!$n_Lplots_Colors$Hex$)) {
    $n_Lplots_Colors$Hex$ = new $c_Lplots_Colors$Hex$().init___()
  };
  return $n_Lplots_Colors$Hex$
}
/** @constructor */
function $c_Lplots_CoordinateAxes3D$() {
  $c_O.call(this)
}
$c_Lplots_CoordinateAxes3D$.prototype = new $h_O();
$c_Lplots_CoordinateAxes3D$.prototype.constructor = $c_Lplots_CoordinateAxes3D$;
/** @constructor */
function $h_Lplots_CoordinateAxes3D$() {
  /*<skip>*/
}
$h_Lplots_CoordinateAxes3D$.prototype = $c_Lplots_CoordinateAxes3D$.prototype;
$c_Lplots_CoordinateAxes3D$.prototype.init___ = (function() {
  return this
});
$c_Lplots_CoordinateAxes3D$.prototype.create__D__Lorg_scalajs_threejs_Color__Z__Z__Lplots_CoordinateAxes3D = (function(length, color, centeredOrigin, planeGrids) {
  var len = $fround(($fround(length) / 2.0));
  var geometry = new $g.THREE.BufferGeometry();
  var material = new $g.THREE.LineBasicMaterial();
  material.color = color;
  var elem$1 = null;
  elem$1 = null;
  var elem$1$1 = null;
  elem$1$1 = null;
  if (centeredOrigin) {
    elem$1 = new $g.Float32Array(36);
    var i = 0;
    while (true) {
      var v1 = i;
      var x1 = ((v1 % 3) | 0);
      switch (x1) {
        case 0: {
          elem$1[v1] = 0.0;
          break
        }
        case 1: {
          elem$1[v1] = 0.0;
          break
        }
        case 2: {
          elem$1[v1] = 0.0;
          break
        }
        default: {
          throw new $c_s_MatchError().init___O(x1)
        }
      };
      if ((i === 35)) {
        break
      };
      i = ((1 + i) | 0)
    };
    var ev$1 = elem$1;
    ev$1[3] = $fround(($uF(ev$1[3]) + len));
    var ev$2 = elem$1;
    ev$2[10] = $fround(($uF(ev$2[10]) + len));
    var ev$3 = elem$1;
    ev$3[17] = $fround(($uF(ev$3[17]) + len));
    var ev$4 = elem$1;
    ev$4[21] = $fround(($uF(ev$4[21]) - len));
    var ev$5 = elem$1;
    ev$5[28] = $fround(($uF(ev$5[28]) - len));
    var ev$6 = elem$1;
    ev$6[35] = $fround(($uF(ev$6[35]) - len));
    elem$1$1 = new $g.Float32Array(36);
    var i$1 = 0;
    while (true) {
      var v1$1 = i$1;
      elem$1$1[v1$1] = 0.5;
      if ((i$1 === 35)) {
        break
      };
      i$1 = ((1 + i$1) | 0)
    }
  } else {
    var _1 = $fround((0.0 - len));
    var _2 = $fround((0.0 - len));
    var _3 = $fround((0.0 - len));
    elem$1 = new $g.Float32Array(15);
    elem$1[0] = $fround((_1 + $fround((2.0 * len))));
    elem$1[1] = _2;
    elem$1[2] = _3;
    elem$1[3] = _1;
    elem$1[4] = _2;
    elem$1[5] = _3;
    elem$1[6] = _1;
    elem$1[7] = _2;
    elem$1[8] = $fround((_3 + $fround((2.0 * len))));
    elem$1[9] = _1;
    elem$1[10] = _2;
    elem$1[11] = _3;
    elem$1[12] = _1;
    elem$1[13] = $fround((_2 + $fround((2.0 * len))));
    elem$1[14] = _3;
    elem$1$1 = new $g.Float32Array(15);
    var i$2 = 0;
    while (true) {
      var v1$2 = i$2;
      elem$1$1[v1$2] = 0.5;
      if ((i$2 === 14)) {
        break
      };
      i$2 = ((1 + i$2) | 0)
    }
  };
  geometry.addAttribute("position", new $g.THREE.BufferAttribute(elem$1, 3.0));
  geometry.addAttribute("color", new $g.THREE.BufferAttribute(elem$1$1, 3.0));
  geometry.computeBoundingSphere();
  var axes = new ($a_Lplots_CoordinateAxes3D())(geometry, material);
  if (planeGrids) {
    var gridXZ = new $g.THREE.GridHelper(1.0, 10.0, color, color);
    var gridXY = new $g.THREE.GridHelper(1.0, 10.0, color, color);
    gridXZ.rotateZ(1.57075);
    var gridZY = new $g.THREE.GridHelper(1.0, 10.0, color, color);
    gridZY.rotateX(1.57075);
    axes.add(gridXY);
    axes.add(gridXZ);
    axes.add(gridZY)
  };
  return axes
});
var $d_Lplots_CoordinateAxes3D$ = new $TypeData().initClass({
  Lplots_CoordinateAxes3D$: 0
}, false, "plots.CoordinateAxes3D$", {
  Lplots_CoordinateAxes3D$: 1,
  O: 1
});
$c_Lplots_CoordinateAxes3D$.prototype.$classData = $d_Lplots_CoordinateAxes3D$;
var $n_Lplots_CoordinateAxes3D$ = (void 0);
function $m_Lplots_CoordinateAxes3D$() {
  if ((!$n_Lplots_CoordinateAxes3D$)) {
    $n_Lplots_CoordinateAxes3D$ = new $c_Lplots_CoordinateAxes3D$().init___()
  };
  return $n_Lplots_CoordinateAxes3D$
}
/** @constructor */
function $c_Lplots_Plot$() {
  $c_O.call(this);
  this.PARTICLE$undSIZE$1 = 0.0
}
$c_Lplots_Plot$.prototype = new $h_O();
$c_Lplots_Plot$.prototype.constructor = $c_Lplots_Plot$;
/** @constructor */
function $h_Lplots_Plot$() {
  /*<skip>*/
}
$h_Lplots_Plot$.prototype = $c_Lplots_Plot$.prototype;
$c_Lplots_Plot$.prototype.init___ = (function() {
  this.PARTICLE$undSIZE$1 = 0.1;
  return this
});
var $d_Lplots_Plot$ = new $TypeData().initClass({
  Lplots_Plot$: 0
}, false, "plots.Plot$", {
  Lplots_Plot$: 1,
  O: 1
});
$c_Lplots_Plot$.prototype.$classData = $d_Lplots_Plot$;
var $n_Lplots_Plot$ = (void 0);
function $m_Lplots_Plot$() {
  if ((!$n_Lplots_Plot$)) {
    $n_Lplots_Plot$ = new $c_Lplots_Plot$().init___()
  };
  return $n_Lplots_Plot$
}
/** @constructor */
function $c_Lplots_Plot$Selection$() {
  $c_O.call(this);
  this.changesColor$1 = false;
  this.red$1 = 0.0;
  this.green$1 = 0.0;
  this.blue$1 = 0.0;
  this.changesSize$1 = false;
  this.scale$1 = 0.0
}
$c_Lplots_Plot$Selection$.prototype = new $h_O();
$c_Lplots_Plot$Selection$.prototype.constructor = $c_Lplots_Plot$Selection$;
/** @constructor */
function $h_Lplots_Plot$Selection$() {
  /*<skip>*/
}
$h_Lplots_Plot$Selection$.prototype = $c_Lplots_Plot$Selection$.prototype;
$c_Lplots_Plot$Selection$.prototype.init___Lplots_Plot = (function($$outer) {
  this.changesColor$1 = true;
  this.red$1 = 1.0;
  this.green$1 = 1.0;
  this.blue$1 = 1.0;
  this.changesSize$1 = true;
  this.scale$1 = 1.5;
  return this
});
var $d_Lplots_Plot$Selection$ = new $TypeData().initClass({
  Lplots_Plot$Selection$: 0
}, false, "plots.Plot$Selection$", {
  Lplots_Plot$Selection$: 1,
  O: 1
});
$c_Lplots_Plot$Selection$.prototype.$classData = $d_Lplots_Plot$Selection$;
/** @constructor */
function $c_Lplots_PointsBuilder() {
  $c_O.call(this);
  this.xs$1 = null;
  this.ys$1 = null;
  this.zs$1 = null;
  this.textureID$1 = 0;
  this.hue$1 = null
}
$c_Lplots_PointsBuilder.prototype = new $h_O();
$c_Lplots_PointsBuilder.prototype.constructor = $c_Lplots_PointsBuilder;
/** @constructor */
function $h_Lplots_PointsBuilder() {
  /*<skip>*/
}
$h_Lplots_PointsBuilder.prototype = $c_Lplots_PointsBuilder.prototype;
$c_Lplots_PointsBuilder.prototype.usingHue__s_Option__Lplots_PointsBuilder = (function(hueIn) {
  return new $c_Lplots_PointsBuilder().init___AD__AD__AD__I__s_Option(this.xs$1, this.ys$1, this.zs$1, this.textureID$1, hueIn)
});
$c_Lplots_PointsBuilder.prototype.usingTexture__I__Lplots_PointsBuilder = (function(textureIDin) {
  return new $c_Lplots_PointsBuilder().init___AD__AD__AD__I__s_Option(this.xs$1, this.ys$1, this.zs$1, textureIDin, this.hue$1)
});
$c_Lplots_PointsBuilder.prototype.withXS__AD__Lplots_PointsBuilder = (function(xValues) {
  return new $c_Lplots_PointsBuilder().init___AD__AD__AD__I__s_Option(xValues, this.ys$1, this.zs$1, this.textureID$1, this.hue$1)
});
$c_Lplots_PointsBuilder.prototype.init___AD__AD__AD__I__s_Option = (function(xs, ys, zs, textureID, hue) {
  this.xs$1 = xs;
  this.ys$1 = ys;
  this.zs$1 = zs;
  this.textureID$1 = textureID;
  this.hue$1 = hue;
  return this
});
$c_Lplots_PointsBuilder.prototype.withYS__AD__Lplots_PointsBuilder = (function(yValues) {
  return new $c_Lplots_PointsBuilder().init___AD__AD__AD__I__s_Option(this.xs$1, yValues, this.zs$1, this.textureID$1, this.hue$1)
});
$c_Lplots_PointsBuilder.prototype.build3D__Lorg_scalajs_threejs_Points = (function() {
  var this$4 = $m_s_Predef$().genericArrayOps__O__scm_ArrayOps(this.xs$1);
  var that = $m_s_Predef$().genericWrapArray__O__scm_WrappedArray(this.ys$1);
  if ((that !== null)) {
    this$4.repr__O();
    var elems$2 = null;
    elems$2 = [];
    var i = 0;
    var x = this$4.length__I();
    var that$1 = that.length__I();
    var len = ((x < that$1) ? x : that$1);
    while ((i < len)) {
      var elem = new $c_T2().init___O__O(this$4.apply__I__O(i), that.apply__I__O(i));
      elems$2.push(elem);
      i = ((1 + i) | 0)
    };
    var xs = $makeNativeArrayWrapper($d_T2.getArrayOf(), elems$2)
  } else {
    this$4.repr__O();
    var elems$2$1 = null;
    elems$2$1 = [];
    var these = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this$4, 0, this$4.length__I());
    var those = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(that, 0, that.length__I());
    while ((these.hasNext__Z() && those.hasNext__Z())) {
      var elem$1 = new $c_T2().init___O__O(these.next__O(), those.next__O());
      elems$2$1.push(elem$1)
    };
    var xs = $makeNativeArrayWrapper($d_T2.getArrayOf(), elems$2$1)
  };
  var this$16 = new $c_scm_ArrayOps$ofRef().init___AO(xs);
  var that$2 = $m_s_Predef$().genericWrapArray__O__scm_WrappedArray(this.zs$1);
  if ((that$2 !== null)) {
    var elems$2$2 = null;
    elems$2$2 = [];
    var i$1 = 0;
    var $$this = this$16.repr$1;
    var x$1 = $$this.u.length;
    var that$3 = that$2.length__I();
    var len$1 = ((x$1 < that$3) ? x$1 : that$3);
    while ((i$1 < len$1)) {
      var index = i$1;
      var $$this$1 = this$16.repr$1;
      var elem$2 = new $c_T2().init___O__O($$this$1.get(index), that$2.apply__I__O(i$1));
      elems$2$2.push(elem$2);
      i$1 = ((1 + i$1) | 0)
    };
    var xs$1 = $makeNativeArrayWrapper($d_T2.getArrayOf(), elems$2$2)
  } else {
    var elems$2$3 = null;
    elems$2$3 = [];
    var $$this$2 = this$16.repr$1;
    var these$1 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this$16, 0, $$this$2.u.length);
    var those$1 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(that$2, 0, that$2.length__I());
    while ((these$1.hasNext__Z() && those$1.hasNext__Z())) {
      var elem$3 = new $c_T2().init___O__O(these$1.next__O(), those$1.next__O());
      elems$2$3.push(elem$3)
    };
    var xs$1 = $makeNativeArrayWrapper($d_T2.getArrayOf(), elems$2$3)
  };
  var elems$2$4 = null;
  elems$2$4 = [];
  var x1 = xs$1.u.length;
  switch (x1) {
    case (-1): {
      break
    }
  };
  var i$2 = 0;
  var len$2 = xs$1.u.length;
  while ((i$2 < len$2)) {
    var index$1 = i$2;
    var arg1 = xs$1.get(index$1);
    var x0$1 = $as_T2(arg1);
    matchEnd4$1: {
      var elem$4;
      if ((x0$1 !== null)) {
        var p2 = $as_T2(x0$1.$$und1__O());
        var c = x0$1.$$und2__O();
        if ((p2 !== null)) {
          var a = p2.$$und1__O();
          var b = p2.$$und2__O();
          var elem$4 = new $c_T3().init___O__O__O(a, b, c);
          break matchEnd4$1
        }
      };
      throw new $c_s_MatchError().init___O(x0$1)
    };
    var unboxedElem = ((elem$4 === null) ? null : elem$4);
    elems$2$4.push(unboxedElem);
    i$2 = ((1 + i$2) | 0)
  };
  var vertices = $makeNativeArrayWrapper($d_T3.getArrayOf(), elems$2$4);
  return $m_Lplots_PointsBuilder$().plots$PointsBuilder$$makePoints__AT3__s_Option__I__Lorg_scalajs_threejs_Points(vertices, this.hue$1, this.textureID$1)
});
$c_Lplots_PointsBuilder.prototype.withZS__AD__Lplots_PointsBuilder = (function(zValues) {
  return new $c_Lplots_PointsBuilder().init___AD__AD__AD__I__s_Option(this.xs$1, this.ys$1, zValues, this.textureID$1, this.hue$1)
});
var $d_Lplots_PointsBuilder = new $TypeData().initClass({
  Lplots_PointsBuilder: 0
}, false, "plots.PointsBuilder", {
  Lplots_PointsBuilder: 1,
  O: 1
});
$c_Lplots_PointsBuilder.prototype.$classData = $d_Lplots_PointsBuilder;
/** @constructor */
function $c_Lplots_PointsBuilder$() {
  $c_O.call(this)
}
$c_Lplots_PointsBuilder$.prototype = new $h_O();
$c_Lplots_PointsBuilder$.prototype.constructor = $c_Lplots_PointsBuilder$;
/** @constructor */
function $h_Lplots_PointsBuilder$() {
  /*<skip>*/
}
$h_Lplots_PointsBuilder$.prototype = $c_Lplots_PointsBuilder$.prototype;
$c_Lplots_PointsBuilder$.prototype.init___ = (function() {
  return this
});
$c_Lplots_PointsBuilder$.prototype.makeShaderMaterial__p1__I__Lorg_scalajs_threejs_PointsMaterial = (function(textureIndex) {
  $m_Lutil_Log$().apply__T__V("\tCreating SM material");
  var myVertexShader = $as_T($m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().getElementById("vertexshader").textContent);
  var myFragmentShader = $as_T($m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().getElementById("fragmentshader").textContent);
  var params = {};
  params.fragmentShader = myFragmentShader;
  params.vertexShader = myVertexShader;
  var $this = {};
  $this.color = null;
  $this.texture = null;
  $this.textureIndex$1$f = 0;
  $this.textureIndex$1$f = textureIndex;
  var $this$1 = {};
  $this$1.value = null;
  $this$1.value = $m_Lplots_Colors$().White$1;
  $this.color = $this$1;
  var this$2 = {};
  this$2.value = null;
  var i = $uI($this.textureIndex$1$f);
  var this$3 = $m_Lresources_Textures$();
  this$2.value = this$3.loadedTextures$1.apply__O__O(i);
  $this.texture = this$2;
  params.uniforms = $this;
  params.alphaTest = 0.5;
  var material = new $g.THREE.ShaderMaterial(params);
  return material
});
$c_Lplots_PointsBuilder$.prototype.plots$PointsBuilder$$makePoints__AT3__s_Option__I__Lorg_scalajs_threejs_Points = (function(coordinates, hue, textureIndex) {
  var vertices = this.makeVertices__p1__AT3__ALorg_scalajs_threejs_Vector3(coordinates);
  var x1 = this.makeGeometry__p1__ALorg_scalajs_threejs_Vector3__s_Option__T3(vertices, hue);
  if ((x1 === null)) {
    throw new $c_s_MatchError().init___O(x1)
  };
  var geometry = x1.$$und1$1;
  var minimums = $as_T3(x1.$$und2$1);
  var maximums = $as_T3(x1.$$und3$1);
  var points = new $g.THREE.Points(geometry, this.makeShaderMaterial__p1__I__Lorg_scalajs_threejs_PointsMaterial(textureIndex));
  points.receiveShadow = false;
  points.castShadow = false;
  var x = ($uD(maximums.$$und1$1) - $uD(minimums.$$und1$1));
  var xScale = $uD($g.Math.abs(x));
  var x$1 = ($uD(maximums.$$und2$1) - $uD(minimums.$$und2$1));
  var yScale = $uD($g.Math.abs(x$1));
  var x$2 = ($uD(maximums.$$und3$1) - $uD(minimums.$$und3$1));
  var zScale = $uD($g.Math.abs(x$2));
  var ev$1 = points.scale;
  ev$1.x = ($uD(ev$1.x) / xScale);
  var ev$2 = points.scale;
  ev$2.y = ($uD(ev$2.y) / yScale);
  var ev$3 = points.scale;
  ev$3.z = ($uD(ev$3.z) / zScale);
  var centerX = (($uD(maximums.$$und1$1) + $uD(minimums.$$und1$1)) / (2 * xScale));
  var centerY = (($uD(maximums.$$und2$1) + $uD(minimums.$$und2$1)) / (2 * yScale));
  var centerZ = (($uD(maximums.$$und3$1) + $uD(minimums.$$und3$1)) / (2 * zScale));
  points.translateX((-centerX));
  points.translateY((-centerY));
  points.translateZ((-centerZ));
  points.matrixWorldNeedsUpdate = true;
  return points
});
$c_Lplots_PointsBuilder$.prototype.makeGeometry__p1__ALorg_scalajs_threejs_Vector3__s_Option__T3 = (function(vertices, hueShift) {
  var positions = new $g.Float32Array($imul(3, vertices.u.length));
  var colors = new $g.Float32Array($imul(3, vertices.u.length));
  var sizes = new $g.Float32Array(vertices.u.length);
  var l = vertices.u.length;
  var color = new $g.THREE.Color();
  if (hueShift.isEmpty__Z()) {
    color.setRGB(255.0, 255.0, 255.0)
  };
  var elem$1 = null;
  elem$1 = null;
  var elem$1$1 = 0.0;
  elem$1$1 = (-1.7976931348623157E308);
  var elem$1$2 = 0.0;
  elem$1$2 = (-1.7976931348623157E308);
  var elem$1$3 = 0.0;
  elem$1$3 = (-1.7976931348623157E308);
  var elem$1$4 = 0.0;
  elem$1$4 = 1.7976931348623157E308;
  var elem$1$5 = 0.0;
  elem$1$5 = 1.7976931348623157E308;
  var elem$1$6 = 0.0;
  elem$1$6 = 1.7976931348623157E308;
  var end = vertices.u.length;
  var isEmpty$4 = (end <= 0);
  var scala$collection$immutable$Range$$lastElement$4 = (((-1) + end) | 0);
  if ((!isEmpty$4)) {
    var i = 0;
    while (true) {
      var v1 = i;
      elem$1 = vertices.get(v1);
      positions[$imul(3, v1)] = $fround($uD(elem$1.x));
      if (($uD(elem$1.x) > elem$1$1)) {
        elem$1$1 = $uD(elem$1.x)
      };
      if (($uD(elem$1.x) < elem$1$4)) {
        elem$1$4 = $uD(elem$1.x)
      };
      positions[((1 + $imul(3, v1)) | 0)] = $fround($uD(elem$1.y));
      if (($uD(elem$1.y) > elem$1$2)) {
        elem$1$2 = $uD(elem$1.y)
      };
      if (($uD(elem$1.y) < elem$1$5)) {
        elem$1$5 = $uD(elem$1.y)
      };
      positions[((2 + $imul(3, v1)) | 0)] = $fround($uD(elem$1.z));
      if (($uD(elem$1.z) > elem$1$3)) {
        elem$1$3 = $uD(elem$1.z)
      };
      if (($uD(elem$1.z) < elem$1$6)) {
        elem$1$6 = $uD(elem$1.z)
      };
      if (hueShift.isDefined__Z()) {
        color.setHSL(($uD(hueShift.get__O()) + (0.1 * (v1 / l))), 1.0, 0.5)
      };
      colors[$imul(3, v1)] = $fround($uD(color.r));
      colors[((1 + $imul(3, v1)) | 0)] = $fround($uD(color.g));
      colors[((2 + $imul(3, v1)) | 0)] = $fround($uD(color.b));
      sizes[v1] = $fround($m_Lplots_Plot$().PARTICLE$undSIZE$1);
      if ((i === scala$collection$immutable$Range$$lastElement$4)) {
        break
      };
      i = ((1 + i) | 0)
    }
  };
  $m_Lutil_Log$().apply__T__V("Largest values:");
  $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["\\tx: ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([elem$1$1])));
  $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["\\ty: ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([elem$1$2])));
  $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["\\tz: ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([elem$1$3])));
  $m_Lutil_Log$().apply__T__V("Smallest values:");
  $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["\\tx: ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([elem$1$4])));
  $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["\\ty: ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([elem$1$5])));
  $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["\\tz: ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([elem$1$6])));
  var geometry = new $g.THREE.BufferGeometry();
  geometry.vertices = $m_sjs_js_JSConverters$JSRichGenTraversableOnce$().toJSArray$extension__sc_GenTraversableOnce__sjs_js_Array($m_s_Predef$().genericArrayOps__O__scm_ArrayOps(vertices));
  geometry.addAttribute("position", new $g.THREE.BufferAttribute(positions, 3.0));
  geometry.addAttribute("customColor", new $g.THREE.BufferAttribute(colors, 3.0));
  geometry.addAttribute("size", new $g.THREE.BufferAttribute(sizes, 1.0));
  return new $c_T3().init___O__O__O(geometry, new $c_T3().init___O__O__O(elem$1$4, elem$1$5, elem$1$6), new $c_T3().init___O__O__O(elem$1$1, elem$1$2, elem$1$3))
});
$c_Lplots_PointsBuilder$.prototype.makeVertices__p1__AT3__ALorg_scalajs_threejs_Vector3 = (function(coordinates) {
  var elems$2 = null;
  elems$2 = [];
  var x1 = coordinates.u.length;
  switch (x1) {
    case (-1): {
      break
    }
  };
  var i = 0;
  var len = coordinates.u.length;
  while ((i < len)) {
    var index = i;
    var arg1 = coordinates.get(index);
    var x0$1 = $as_T3(arg1);
    if ((x0$1 === null)) {
      throw new $c_s_MatchError().init___O(x0$1)
    };
    var x = $uD(x0$1.$$und1$1);
    var y = $uD(x0$1.$$und2$1);
    var z = $uD(x0$1.$$und3$1);
    var elem = new $g.THREE.Vector3(x, y, z);
    var unboxedElem = ((elem === null) ? null : elem);
    elems$2.push(unboxedElem);
    i = ((1 + i) | 0)
  };
  return $makeNativeArrayWrapper($d_Lorg_scalajs_threejs_Vector3.getArrayOf(), elems$2)
});
var $d_Lplots_PointsBuilder$ = new $TypeData().initClass({
  Lplots_PointsBuilder$: 0
}, false, "plots.PointsBuilder$", {
  Lplots_PointsBuilder$: 1,
  O: 1
});
$c_Lplots_PointsBuilder$.prototype.$classData = $d_Lplots_PointsBuilder$;
var $n_Lplots_PointsBuilder$ = (void 0);
function $m_Lplots_PointsBuilder$() {
  if ((!$n_Lplots_PointsBuilder$)) {
    $n_Lplots_PointsBuilder$ = new $c_Lplots_PointsBuilder$().init___()
  };
  return $n_Lplots_PointsBuilder$
}
/** @constructor */
function $c_Lplots_ShadowManifold$() {
  $c_O.call(this)
}
$c_Lplots_ShadowManifold$.prototype = new $h_O();
$c_Lplots_ShadowManifold$.prototype.constructor = $c_Lplots_ShadowManifold$;
/** @constructor */
function $h_Lplots_ShadowManifold$() {
  /*<skip>*/
}
$h_Lplots_ShadowManifold$.prototype = $c_Lplots_ShadowManifold$.prototype;
$c_Lplots_ShadowManifold$.prototype.init___ = (function() {
  return this
});
$c_Lplots_ShadowManifold$.prototype.apply__T__Lorg_scalajs_threejs_Points__D__Lplots_ShadowManifold = (function(id, points, hue) {
  var sm = new $c_Lplots_ShadowManifold().init___T__Lorg_scalajs_threejs_Points(id, points);
  sm.hue$1 = hue;
  return sm
});
var $d_Lplots_ShadowManifold$ = new $TypeData().initClass({
  Lplots_ShadowManifold$: 0
}, false, "plots.ShadowManifold$", {
  Lplots_ShadowManifold$: 1,
  O: 1
});
$c_Lplots_ShadowManifold$.prototype.$classData = $d_Lplots_ShadowManifold$;
var $n_Lplots_ShadowManifold$ = (void 0);
function $m_Lplots_ShadowManifold$() {
  if ((!$n_Lplots_ShadowManifold$)) {
    $n_Lplots_ShadowManifold$ = new $c_Lplots_ShadowManifold$().init___()
  };
  return $n_Lplots_ShadowManifold$
}
/** @constructor */
function $c_Lresources_CSVParser$() {
  $c_O.call(this);
  this.numberRegex$1 = null
}
$c_Lresources_CSVParser$.prototype = new $h_O();
$c_Lresources_CSVParser$.prototype.constructor = $c_Lresources_CSVParser$;
/** @constructor */
function $h_Lresources_CSVParser$() {
  /*<skip>*/
}
$h_Lresources_CSVParser$.prototype = $c_Lresources_CSVParser$.prototype;
$c_Lresources_CSVParser$.prototype.init___ = (function() {
  this.numberRegex$1 = "([-+]?)((\\d+\\.\\d+)|(\\d+\\.)|(\\.\\d+)|(\\d+))";
  return this
});
$c_Lresources_CSVParser$.prototype.parse__T__AT2 = (function(data) {
  $m_Lutil_Log$().apply__T__V("PreProcessing Data...");
  var xs = $m_sjsr_RuntimeString$().split__T__T__I__AT(data, "[^ -~]", 0);
  var elems$2 = null;
  elems$2 = [];
  var x1 = xs.u.length;
  switch (x1) {
    case (-1): {
      break
    }
  };
  var i = 0;
  var len = xs.u.length;
  while ((i < len)) {
    var index = i;
    var arg1 = xs.get(index);
    var x$1 = $as_T(arg1);
    var elem = $as_T(x$1.trim());
    var unboxedElem = ((elem === null) ? null : elem);
    elems$2.push(unboxedElem);
    i = ((1 + i) | 0)
  };
  var xs$1 = $makeNativeArrayWrapper($d_T.getArrayOf(), elems$2);
  var b = new $c_scm_ArrayBuilder$ofRef().init___s_reflect_ClassTag(new $c_s_reflect_ClassTag$GenericClassTag().init___jl_Class($d_T.getClassOf()));
  var i$1 = 0;
  var len$1 = xs$1.u.length;
  while ((i$1 < len$1)) {
    var index$1 = i$1;
    var arg1$1 = xs$1.get(index$1);
    var x$2 = $as_T(arg1$1);
    if ((x$2 === null)) {
      throw new $c_jl_NullPointerException().init___()
    };
    if (((x$2 !== "") !== false)) {
      b.$$plus$eq__O__scm_ArrayBuilder$ofRef(arg1$1)
    };
    i$1 = ((1 + i$1) | 0)
  };
  var temp = $asArrayOf_T(b.result__AO(), 1);
  var xs$2 = $m_sci_Nil$();
  var len$2 = $f_sc_LinearSeqOptimized__length__I(xs$2);
  var array = $newArrayObject($d_T.getArrayOf().getArrayOf(), [len$2]);
  var elem$1 = 0;
  elem$1 = 0;
  var this$22 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(xs$2);
  while (this$22.hasNext__Z()) {
    var arg1$2 = this$22.next__O();
    array.set(elem$1, arg1$2);
    elem$1 = ((1 + elem$1) | 0)
  };
  var elem$1$1 = null;
  elem$1$1 = array;
  var i$2 = 0;
  var len$3 = temp.u.length;
  while ((i$2 < len$3)) {
    var index$2 = i$2;
    var arg1$3 = temp.get(index$2);
    var line = $as_T(arg1$3);
    var xs$3 = $asArrayOf_T(elem$1$1, 2);
    var elem$2 = $m_sjsr_RuntimeString$().split__T__T__I__AT(line, ",", 0);
    var n1 = ((1 + xs$3.u.length) | 0);
    var result = $newArrayObject($d_T.getArrayOf().getArrayOf(), [n1]);
    $m_s_Array$().copy__O__I__O__I__I__V(xs$3, 0, result, 0, xs$3.u.length);
    result.set(xs$3.u.length, elem$2);
    elem$1$1 = result;
    i$2 = ((1 + i$2) | 0)
  };
  var colCount = $asArrayOf_T(elem$1$1, 2).get(0).u.length;
  $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["\\tcolumns: ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([colCount])));
  var xs$4 = $asArrayOf_T(elem$1$1, 2).get(0);
  var end = xs$4.u.length;
  var isEmpty$4 = (end <= 0);
  var scala$collection$immutable$Range$$lastElement$4 = (((-1) + end) | 0);
  if ((!isEmpty$4)) {
    var i$3 = 0;
    while (true) {
      var v1 = i$3;
      $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["\\t\\tcolumn ", " id: ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([v1, $asArrayOf_T(elem$1$1, 2).get(0).get(v1)])));
      if ((i$3 === scala$collection$immutable$Range$$lastElement$4)) {
        break
      };
      i$3 = ((1 + i$3) | 0)
    }
  };
  $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["\\trows:    ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$asArrayOf_T(elem$1$1, 2).u.length])));
  var xs$5 = $m_sci_Nil$();
  var len$4 = $f_sc_LinearSeqOptimized__length__I(xs$5);
  var array$1 = $newArrayObject($d_D.getArrayOf().getArrayOf(), [len$4]);
  var elem$1$2 = 0;
  elem$1$2 = 0;
  var this$43 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(xs$5);
  while (this$43.hasNext__Z()) {
    var arg1$4 = this$43.next__O();
    array$1.set(elem$1$2, arg1$4);
    elem$1$2 = ((1 + elem$1$2) | 0)
  };
  var elem$1$3 = null;
  elem$1$3 = array$1;
  var isEmpty$4$1 = (colCount <= 0);
  var scala$collection$immutable$Range$$lastElement$4$1 = (((-1) + colCount) | 0);
  if ((!isEmpty$4$1)) {
    var i$4 = 0;
    while (true) {
      var v1$1 = i$4;
      var xs$6 = $asArrayOf_D(elem$1$3, 2);
      var xs$7 = $m_sci_Nil$();
      var len$5 = $f_sc_LinearSeqOptimized__length__I(xs$7);
      var array$2 = $newArrayObject($d_D.getArrayOf(), [len$5]);
      var elem$1$4 = 0;
      elem$1$4 = 0;
      var this$53 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(xs$7);
      while (this$53.hasNext__Z()) {
        var arg1$5 = this$53.next__O();
        array$2.set(elem$1$4, $uD(arg1$5));
        elem$1$4 = ((1 + elem$1$4) | 0)
      };
      var n1$1 = ((1 + xs$6.u.length) | 0);
      var result$1 = $newArrayObject($d_D.getArrayOf().getArrayOf(), [n1$1]);
      $m_s_Array$().copy__O__I__O__I__I__V(xs$6, 0, result$1, 0, xs$6.u.length);
      result$1.set(xs$6.u.length, array$2);
      elem$1$3 = result$1;
      if ((i$4 === scala$collection$immutable$Range$$lastElement$4$1)) {
        break
      };
      i$4 = ((1 + i$4) | 0)
    }
  };
  var xs$8 = $asArrayOf_T(elem$1$1, 2);
  var end$1 = xs$8.u.length;
  var isEmpty$4$2 = (end$1 <= 0);
  var scala$collection$immutable$Range$$lastElement$4$2 = (((-1) + end$1) | 0);
  if ((!isEmpty$4$2)) {
    var i$5 = 0;
    while (true) {
      var v1$2 = i$5;
      if ((v1$2 !== 0)) {
        var xs$9 = $asArrayOf_T(elem$1$1, 2).get(v1$2);
        var end$2 = xs$9.u.length;
        var isEmpty$4$3 = (end$2 <= 0);
        var scala$collection$immutable$Range$$lastElement$4$3 = (((-1) + end$2) | 0);
        if ((!isEmpty$4$3)) {
          var i$6 = 0;
          while (true) {
            var v1$3 = i$6;
            var this$68 = $m_Lresources_CSVParser$();
            var str = $asArrayOf_T(elem$1$1, 2).get(v1$2).get(v1$3);
            var regex = this$68.numberRegex$1;
            if ((str === null)) {
              throw new $c_jl_NullPointerException().init___()
            };
            if ($m_ju_regex_Pattern$().matches__T__jl_CharSequence__Z(regex, str)) {
              var jsx$2 = $asArrayOf_D(elem$1$3, 2);
              var xs$10 = $asArrayOf_D(elem$1$3, 2).get(v1$3);
              var x = $asArrayOf_T(elem$1$1, 2).get(v1$2).get(v1$3);
              var this$72 = new $c_sci_StringOps().init___T(x);
              var jsx$1 = $m_jl_Double$();
              var $$this = this$72.repr$1;
              var elem$3 = jsx$1.parseDouble__T__D($$this);
              var n1$2 = ((1 + xs$10.u.length) | 0);
              var result$2 = $newArrayObject($d_D.getArrayOf(), [n1$2]);
              $m_s_Array$().copy__O__I__O__I__I__V(xs$10, 0, result$2, 0, xs$10.u.length);
              result$2.set(xs$10.u.length, elem$3);
              jsx$2.set(v1$3, result$2)
            } else {
              $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["WARNING: r", "c", " Is NAN: ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([v1$2, v1$3, $asArrayOf_T(elem$1$1, 2).get(v1$2).get(v1$3)])))
            };
            if ((i$6 === scala$collection$immutable$Range$$lastElement$4$3)) {
              break
            };
            i$6 = ((1 + i$6) | 0)
          }
        }
      };
      if ((i$5 === scala$collection$immutable$Range$$lastElement$4$2)) {
        break
      };
      i$5 = ((1 + i$5) | 0)
    }
  };
  var xs$11 = $m_sci_Nil$();
  var len$6 = $f_sc_LinearSeqOptimized__length__I(xs$11);
  var array$3 = $newArrayObject($d_T2.getArrayOf(), [len$6]);
  var elem$1$5 = 0;
  elem$1$5 = 0;
  var this$80 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(xs$11);
  while (this$80.hasNext__Z()) {
    var arg1$6 = this$80.next__O();
    array$3.set(elem$1$5, arg1$6);
    elem$1$5 = ((1 + elem$1$5) | 0)
  };
  var elem$1$6 = null;
  elem$1$6 = array$3;
  var isEmpty$4$4 = (colCount <= 0);
  var scala$collection$immutable$Range$$lastElement$4$4 = (((-1) + colCount) | 0);
  if ((!isEmpty$4$4)) {
    var i$7 = 0;
    while (true) {
      var v1$4 = i$7;
      var xs$12 = $asArrayOf_T2(elem$1$6, 1);
      var elem$4 = new $c_T2().init___O__O($asArrayOf_T(elem$1$1, 2).get(0).get(v1$4), $asArrayOf_D(elem$1$3, 2).get(v1$4));
      var n1$3 = ((1 + xs$12.u.length) | 0);
      var result$3 = $newArrayObject($d_T2.getArrayOf(), [n1$3]);
      $m_s_Array$().copy__O__I__O__I__I__V(xs$12, 0, result$3, 0, xs$12.u.length);
      result$3.set(xs$12.u.length, elem$4);
      elem$1$6 = result$3;
      if ((i$7 === scala$collection$immutable$Range$$lastElement$4$4)) {
        break
      };
      i$7 = ((1 + i$7) | 0)
    }
  };
  return $asArrayOf_T2(elem$1$6, 1)
});
var $d_Lresources_CSVParser$ = new $TypeData().initClass({
  Lresources_CSVParser$: 0
}, false, "resources.CSVParser$", {
  Lresources_CSVParser$: 1,
  O: 1
});
$c_Lresources_CSVParser$.prototype.$classData = $d_Lresources_CSVParser$;
var $n_Lresources_CSVParser$ = (void 0);
function $m_Lresources_CSVParser$() {
  if ((!$n_Lresources_CSVParser$)) {
    $n_Lresources_CSVParser$ = new $c_Lresources_CSVParser$().init___()
  };
  return $n_Lresources_CSVParser$
}
/** @constructor */
function $c_Lresources_Textures$() {
  $c_O.call(this);
  this.defaultPointTextureID$1 = 0;
  this.pointTextureDirs$1 = null;
  this.loadedTextures$1 = null;
  this.contains$1 = null
}
$c_Lresources_Textures$.prototype = new $h_O();
$c_Lresources_Textures$.prototype.constructor = $c_Lresources_Textures$;
/** @constructor */
function $h_Lresources_Textures$() {
  /*<skip>*/
}
$h_Lresources_Textures$.prototype = $c_Lresources_Textures$.prototype;
$c_Lresources_Textures$.prototype.init___ = (function() {
  $n_Lresources_Textures$ = this;
  this.defaultPointTextureID$1 = 0;
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array(["img/disc.png", "img/disc2.png", "img/orangeOrb.png", "img/blueOrb.png", "img/blackHole.png"]);
  var len = $uI(xs.array$6.length);
  var array = $newArrayObject($d_T.getArrayOf(), [len]);
  var elem$1 = 0;
  elem$1 = 0;
  var this$4 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(xs, 0, $uI(xs.array$6.length));
  while (this$4.hasNext__Z()) {
    var arg1 = this$4.next__O();
    array.set(elem$1, arg1);
    elem$1 = ((1 + elem$1) | 0)
  };
  this.pointTextureDirs$1 = array;
  this.loadedTextures$1 = $as_sci_Map($m_s_Predef$().Map$2.apply__sc_Seq__sc_GenMap($m_sci_Nil$()));
  var eta$0$1 = this.loadedTextures$1;
  this.contains$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, eta$0$1$1) {
    return (function(key$2) {
      var key = $uI(key$2);
      return eta$0$1$1.contains__O__Z(key)
    })
  })(this, eta$0$1));
  return this
});
$c_Lresources_Textures$.prototype.add__I__Lorg_scalajs_threejs_Texture__V = (function(i, texture) {
  this.loadedTextures$1 = this.loadedTextures$1.$$plus__T2__sci_Map(new $c_T2().init___O__O(i, texture))
});
var $d_Lresources_Textures$ = new $TypeData().initClass({
  Lresources_Textures$: 0
}, false, "resources.Textures$", {
  Lresources_Textures$: 1,
  O: 1
});
$c_Lresources_Textures$.prototype.$classData = $d_Lresources_Textures$;
var $n_Lresources_Textures$ = (void 0);
function $m_Lresources_Textures$() {
  if ((!$n_Lresources_Textures$)) {
    $n_Lresources_Textures$ = new $c_Lresources_Textures$().init___()
  };
  return $n_Lresources_Textures$
}
/** @constructor */
function $c_Lresources_package$BrowserStorage$() {
  $c_O.call(this)
}
$c_Lresources_package$BrowserStorage$.prototype = new $h_O();
$c_Lresources_package$BrowserStorage$.prototype.constructor = $c_Lresources_package$BrowserStorage$;
/** @constructor */
function $h_Lresources_package$BrowserStorage$() {
  /*<skip>*/
}
$h_Lresources_package$BrowserStorage$.prototype = $c_Lresources_package$BrowserStorage$.prototype;
$c_Lresources_package$BrowserStorage$.prototype.init___ = (function() {
  return this
});
$c_Lresources_package$BrowserStorage$.prototype.timeSeriesFromCSV__T__s_Option = (function(localStorageID) {
  var this$1 = $m_Lorg_scalajs_dom_ext_LocalStorage$().apply__T__s_Option(localStorageID);
  if (this$1.isEmpty__Z()) {
    return $m_s_None$()
  } else {
    var arg1 = this$1.get__O();
    var data = $as_T(arg1);
    return new $c_s_Some().init___O($m_Lresources_CSVParser$().parse__T__AT2(data))
  }
});
var $d_Lresources_package$BrowserStorage$ = new $TypeData().initClass({
  Lresources_package$BrowserStorage$: 0
}, false, "resources.package$BrowserStorage$", {
  Lresources_package$BrowserStorage$: 1,
  O: 1
});
$c_Lresources_package$BrowserStorage$.prototype.$classData = $d_Lresources_package$BrowserStorage$;
var $n_Lresources_package$BrowserStorage$ = (void 0);
function $m_Lresources_package$BrowserStorage$() {
  if ((!$n_Lresources_package$BrowserStorage$)) {
    $n_Lresources_package$BrowserStorage$ = new $c_Lresources_package$BrowserStorage$().init___()
  };
  return $n_Lresources_package$BrowserStorage$
}
/** @constructor */
function $c_Lresources_package$Res$() {
  $c_O.call(this)
}
$c_Lresources_package$Res$.prototype = new $h_O();
$c_Lresources_package$Res$.prototype.constructor = $c_Lresources_package$Res$;
/** @constructor */
function $h_Lresources_package$Res$() {
  /*<skip>*/
}
$h_Lresources_package$Res$.prototype = $c_Lresources_package$Res$.prototype;
$c_Lresources_package$Res$.prototype.init___ = (function() {
  return this
});
$c_Lresources_package$Res$.prototype.loadPointTexture__I__s_concurrent_Future = (function(i) {
  if ($m_Lresources_Textures$().contains$1.apply$mcZI$sp__I__Z(i)) {
    return $m_s_concurrent_Future$().apply__F0__s_concurrent_ExecutionContext__s_concurrent_Future(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, i$1) {
      return (function() {
        var this$1 = $m_Lresources_Textures$();
        return this$1.loadedTextures$1.apply__O__O(i$1)
      })
    })(this, i)), $m_s_concurrent_ExecutionContext$Implicits$().global__s_concurrent_ExecutionContext())
  } else {
    var promise = new $c_s_concurrent_impl_Promise$DefaultPromise().init___();
    var timedCallback = new $c_Lutil_TimedFunction1().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, i$2, promise$1) {
      return (function(texture$2) {
        $m_Lresources_Textures$().add__I__Lorg_scalajs_threejs_Texture__V(i$2, texture$2);
        try {
          var result = new $c_s_util_Success().init___O(texture$2)
        } catch (e) {
          var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
          if ((e$2 !== null)) {
            matchEnd8: {
              var result;
              var o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
              if ((!o11.isEmpty__Z())) {
                var e$3 = $as_jl_Throwable(o11.get__O());
                var result = new $c_s_util_Failure().init___jl_Throwable(e$3);
                break matchEnd8
              };
              throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
            }
          } else {
            var result;
            throw e
          }
        };
        $f_s_concurrent_Promise__complete__s_util_Try__s_concurrent_Promise(promise$1, result)
      })
    })(this, i, promise)));
    var preCallbackDesc = new $c_s_Some().init___O("Loading the texture");
    var callbackDesc = $m_s_None$();
    $f_Lutil_Timing__setDescriptions__s_Option__s_Option__V(timedCallback, preCallbackDesc, callbackDesc);
    new $g.THREE.TextureLoader().load($m_Lresources_Textures$().pointTextureDirs$1.get(i), (function(f) {
      return (function(arg1) {
        return f.apply__O__O(arg1)
      })
    })(timedCallback));
    return promise
  }
});
var $d_Lresources_package$Res$ = new $TypeData().initClass({
  Lresources_package$Res$: 0
}, false, "resources.package$Res$", {
  Lresources_package$Res$: 1,
  O: 1
});
$c_Lresources_package$Res$.prototype.$classData = $d_Lresources_package$Res$;
var $n_Lresources_package$Res$ = (void 0);
function $m_Lresources_package$Res$() {
  if ((!$n_Lresources_package$Res$)) {
    $n_Lresources_package$Res$ = new $c_Lresources_package$Res$().init___()
  };
  return $n_Lresources_package$Res$
}
/** @constructor */
function $c_Luserinput_Controls() {
  $c_O.call(this);
  this.vr$1 = null;
  this.fp$1 = null;
  this.mouse$1 = null;
  this.controllers$1 = null
}
$c_Luserinput_Controls.prototype = new $h_O();
$c_Luserinput_Controls.prototype.constructor = $c_Luserinput_Controls;
/** @constructor */
function $h_Luserinput_Controls() {
  /*<skip>*/
}
$h_Luserinput_Controls.prototype = $c_Luserinput_Controls.prototype;
$c_Luserinput_Controls.prototype.init___ = (function() {
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([null, null]);
  var len = $uI(xs.array$6.length);
  var array = $newArrayObject($d_Lfacades_IFThree$VRController.getArrayOf(), [len]);
  var elem$1 = 0;
  elem$1 = 0;
  var this$4 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(xs, 0, $uI(xs.array$6.length));
  while (this$4.hasNext__Z()) {
    var arg1 = this$4.next__O();
    array.set(elem$1, arg1);
    elem$1 = ((1 + elem$1) | 0)
  };
  this.controllers$1 = array;
  return this
});
$c_Luserinput_Controls.prototype.controllerConnected__Z = (function() {
  return ((this.controllers$1.get(0) !== null) || (this.controllers$1.get(1) !== null))
});
$c_Luserinput_Controls.prototype.update__D__V = (function(timeStamp) {
  this.vr$1.update();
  if ((!this.controllerConnected__Z())) {
    this.fp$1.update(timeStamp)
  }
});
var $d_Luserinput_Controls = new $TypeData().initClass({
  Luserinput_Controls: 0
}, false, "userinput.Controls", {
  Luserinput_Controls: 1,
  O: 1
});
$c_Luserinput_Controls.prototype.$classData = $d_Luserinput_Controls;
/** @constructor */
function $c_Luserinput_Controls$() {
  $c_O.call(this);
  this.instance$1 = null;
  this.rayCaster$1 = null
}
$c_Luserinput_Controls$.prototype = new $h_O();
$c_Luserinput_Controls$.prototype.constructor = $c_Luserinput_Controls$;
/** @constructor */
function $h_Luserinput_Controls$() {
  /*<skip>*/
}
$h_Luserinput_Controls$.prototype = $c_Luserinput_Controls$.prototype;
$c_Luserinput_Controls$.prototype.init___ = (function() {
  $n_Luserinput_Controls$ = this;
  this.rayCaster$1 = new $g.THREE.Raycaster();
  this.rayCaster$1.params.Points.threshold = 0.015;
  return this
});
$c_Luserinput_Controls$.prototype.setup__Lenv_Environment__Luserinput_Controls = (function(env) {
  $m_Lutil_Log$().apply__T__V("Controls Setup...");
  var controls = new $c_Luserinput_Controls().init___();
  this.instance$1 = controls;
  controls.vr$1 = new $g.THREE.VRControls(env.camera$1);
  $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().addEventListener("vr controller connected", (function(env$1, controls$1) {
    return (function(arg1$2) {
      return $m_Luserinput_Controls$().userinput$Controls$$$anonfun$setup$1__Lfacades_IFThree$SomeEvent__Lenv_Environment__Luserinput_Controls__O(arg1$2, env$1, controls$1)
    })
  })(env, controls));
  controls.fp$1 = new $g.THREE.FirstPersonVRControls(env.camera$1, env.scene$1);
  controls.mouse$1 = new $g.THREE.Vector2();
  $m_Lwindow_Window$().setupMouseEventListener__Lorg_scalajs_threejs_Vector2__V(controls.mouse$1);
  return controls
});
$c_Luserinput_Controls$.prototype.userinput$Controls$$$anonfun$setup$1__Lfacades_IFThree$SomeEvent__Lenv_Environment__Luserinput_Controls__O = (function(event, env$1, controls$1) {
  var controller = event.detail;
  if (($as_T(controller.name) === $m_Luserinput_OculusControllerRight$().name$2)) {
    $m_Luserinput_OculusControllerRight$().setup__Lfacades_IFThree$VRController__V(controller);
    controls$1.controllers$1.set(1, controller);
    env$1.scene$1.add(controller);
    return (void 0)
  } else if (($as_T(controller.name) === $m_Luserinput_OculusControllerLeft$().name$2)) {
    $m_Luserinput_OculusControllerLeft$().setup__Lfacades_IFThree$VRController__V(controller);
    controls$1.controllers$1.set(0, controller);
    env$1.scene$1.add(controller);
    return (void 0)
  } else {
    $m_Lutil_Log$().apply__T__V("[Controls]\t Unknown controller passed on event: \"vr controller connected\"");
    return (void 0)
  }
});
var $d_Luserinput_Controls$ = new $TypeData().initClass({
  Luserinput_Controls$: 0
}, false, "userinput.Controls$", {
  Luserinput_Controls$: 1,
  O: 1
});
$c_Luserinput_Controls$.prototype.$classData = $d_Luserinput_Controls$;
var $n_Luserinput_Controls$ = (void 0);
function $m_Luserinput_Controls$() {
  if ((!$n_Luserinput_Controls$)) {
    $n_Luserinput_Controls$ = new $c_Luserinput_Controls$().init___()
  };
  return $n_Luserinput_Controls$
}
/** @constructor */
function $c_Luserinput_Interactions$() {
  $c_O.call(this)
}
$c_Luserinput_Interactions$.prototype = new $h_O();
$c_Luserinput_Interactions$.prototype.constructor = $c_Luserinput_Interactions$;
/** @constructor */
function $h_Luserinput_Interactions$() {
  /*<skip>*/
}
$h_Luserinput_Interactions$.prototype = $c_Luserinput_Interactions$.prototype;
$c_Luserinput_Interactions$.prototype.init___ = (function() {
  return this
});
$c_Luserinput_Interactions$.prototype.on__O__sjs_js_Array__Luserinput_Interactions__T2 = (function(entity, intersections, evidence$1) {
  return evidence$1.onIntersection__Lplots_Plot__sjs_js_Array__T2($as_Lplots_Plot(entity), intersections)
});
var $d_Luserinput_Interactions$ = new $TypeData().initClass({
  Luserinput_Interactions$: 0
}, false, "userinput.Interactions$", {
  Luserinput_Interactions$: 1,
  O: 1
});
$c_Luserinput_Interactions$.prototype.$classData = $d_Luserinput_Interactions$;
var $n_Luserinput_Interactions$ = (void 0);
function $m_Luserinput_Interactions$() {
  if ((!$n_Luserinput_Interactions$)) {
    $n_Luserinput_Interactions$ = new $c_Luserinput_Interactions$().init___()
  };
  return $n_Luserinput_Interactions$
}
/** @constructor */
function $c_Luserinput_OculusControllers$() {
  $c_O.call(this)
}
$c_Luserinput_OculusControllers$.prototype = new $h_O();
$c_Luserinput_OculusControllers$.prototype.constructor = $c_Luserinput_OculusControllers$;
/** @constructor */
function $h_Luserinput_OculusControllers$() {
  /*<skip>*/
}
$h_Luserinput_OculusControllers$.prototype = $c_Luserinput_OculusControllers$.prototype;
$c_Luserinput_OculusControllers$.prototype.init___ = (function() {
  return this
});
$c_Luserinput_OculusControllers$.prototype.getActiveRayCaster__s_Option = (function() {
  return ($m_Luserinput_OculusControllerRight$().isPointing__Z() ? new $c_s_Some().init___O($m_Luserinput_OculusControllerRight$().updatedRayCaster__Lorg_scalajs_threejs_Raycaster()) : ($m_Luserinput_OculusControllerLeft$().isPointing__Z() ? new $c_s_Some().init___O($m_Luserinput_OculusControllerLeft$().updatedRayCaster__Lorg_scalajs_threejs_Raycaster()) : $m_s_None$()))
});
var $d_Luserinput_OculusControllers$ = new $TypeData().initClass({
  Luserinput_OculusControllers$: 0
}, false, "userinput.OculusControllers$", {
  Luserinput_OculusControllers$: 1,
  O: 1
});
$c_Luserinput_OculusControllers$.prototype.$classData = $d_Luserinput_OculusControllers$;
var $n_Luserinput_OculusControllers$ = (void 0);
function $m_Luserinput_OculusControllers$() {
  if ((!$n_Luserinput_OculusControllers$)) {
    $n_Luserinput_OculusControllers$ = new $c_Luserinput_OculusControllers$().init___()
  };
  return $n_Luserinput_OculusControllers$
}
/** @constructor */
function $c_Lutil_Log$() {
  $c_O.call(this);
  this.showLogs$1 = false
}
$c_Lutil_Log$.prototype = new $h_O();
$c_Lutil_Log$.prototype.constructor = $c_Lutil_Log$;
/** @constructor */
function $h_Lutil_Log$() {
  /*<skip>*/
}
$h_Lutil_Log$.prototype = $c_Lutil_Log$.prototype;
$c_Lutil_Log$.prototype.init___ = (function() {
  this.showLogs$1 = false;
  return this
});
$c_Lutil_Log$.prototype.apply__T__V = (function(message) {
  if (this.showLogs$1) {
    $m_Lorg_scalajs_dom_package$().console__Lorg_scalajs_dom_raw_Console().log(message)
  }
});
var $d_Lutil_Log$ = new $TypeData().initClass({
  Lutil_Log$: 0
}, false, "util.Log$", {
  Lutil_Log$: 1,
  O: 1
});
$c_Lutil_Log$.prototype.$classData = $d_Lutil_Log$;
var $n_Lutil_Log$ = (void 0);
function $m_Lutil_Log$() {
  if ((!$n_Lutil_Log$)) {
    $n_Lutil_Log$ = new $c_Lutil_Log$().init___()
  };
  return $n_Lutil_Log$
}
/** @constructor */
function $c_Lwindow_Window$() {
  $c_O.call(this)
}
$c_Lwindow_Window$.prototype = new $h_O();
$c_Lwindow_Window$.prototype.constructor = $c_Lwindow_Window$;
/** @constructor */
function $h_Lwindow_Window$() {
  /*<skip>*/
}
$h_Lwindow_Window$.prototype = $c_Lwindow_Window$.prototype;
$c_Lwindow_Window$.prototype.init___ = (function() {
  return this
});
$c_Lwindow_Window$.prototype.height__D = (function() {
  return $uD($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerHeight)
});
$c_Lwindow_Window$.prototype.setupEventListeners__Lorg_scalajs_threejs_PerspectiveCamera__Lorg_scalajs_threejs_WebGLRenderer__V = (function(camera, renderer) {
  $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().addEventListener("resize", (function(camera$1, renderer$1) {
    return (function(arg1$2) {
      $m_Lwindow_Window$().window$Window$$$anonfun$setupEventListeners$1__Lorg_scalajs_dom_raw_Event__Lorg_scalajs_threejs_PerspectiveCamera__Lorg_scalajs_threejs_WebGLRenderer__V(arg1$2, camera$1, renderer$1)
    })
  })(camera, renderer))
});
$c_Lwindow_Window$.prototype.window$Window$$$anonfun$setupMouseEventListener$1__Lorg_scalajs_dom_raw_MouseEvent__Lorg_scalajs_threejs_Vector2__V = (function(event, mouse$1) {
  mouse$1.x = ((-1.0) + (2 * ($uD(event.clientX) / $uD($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerWidth))));
  mouse$1.y = (1 + (2 * (-($uD(event.clientY) / $uD($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerHeight)))))
});
$c_Lwindow_Window$.prototype.aspectRatio__D = (function() {
  return (this.width__D() / this.height__D())
});
$c_Lwindow_Window$.prototype.setupMouseEventListener__Lorg_scalajs_threejs_Vector2__V = (function(mouse) {
  $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().addEventListener("mousemove", (function(mouse$1) {
    return (function(arg1$2) {
      $m_Lwindow_Window$().window$Window$$$anonfun$setupMouseEventListener$1__Lorg_scalajs_dom_raw_MouseEvent__Lorg_scalajs_threejs_Vector2__V(arg1$2, mouse$1)
    })
  })(mouse))
});
$c_Lwindow_Window$.prototype.window$Window$$$anonfun$setupEventListeners$1__Lorg_scalajs_dom_raw_Event__Lorg_scalajs_threejs_PerspectiveCamera__Lorg_scalajs_threejs_WebGLRenderer__V = (function(e, camera$1, renderer$1) {
  camera$1.aspect = ($uD($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerWidth) / $uD($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerHeight));
  camera$1.updateProjectionMatrix();
  renderer$1.setSize($uD($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerWidth), $uD($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerHeight))
});
$c_Lwindow_Window$.prototype.width__D = (function() {
  return $uD($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().innerWidth)
});
$c_Lwindow_Window$.prototype.devicePixelRatio__D = (function() {
  return $uD($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().devicePixelRatio)
});
var $d_Lwindow_Window$ = new $TypeData().initClass({
  Lwindow_Window$: 0
}, false, "window.Window$", {
  Lwindow_Window$: 1,
  O: 1
});
$c_Lwindow_Window$.prototype.$classData = $d_Lwindow_Window$;
var $n_Lwindow_Window$ = (void 0);
function $m_Lwindow_Window$() {
  if ((!$n_Lwindow_Window$)) {
    $n_Lwindow_Window$ = new $c_Lwindow_Window$().init___()
  };
  return $n_Lwindow_Window$
}
/** @constructor */
function $c_jl_Class() {
  $c_O.call(this);
  this.data$1 = null
}
$c_jl_Class.prototype = new $h_O();
$c_jl_Class.prototype.constructor = $c_jl_Class;
/** @constructor */
function $h_jl_Class() {
  /*<skip>*/
}
$h_jl_Class.prototype = $c_jl_Class.prototype;
$c_jl_Class.prototype.getName__T = (function() {
  return $as_T(this.data$1.name)
});
$c_jl_Class.prototype.getComponentType__jl_Class = (function() {
  return $as_jl_Class(this.data$1.getComponentType())
});
$c_jl_Class.prototype.isPrimitive__Z = (function() {
  return $uZ(this.data$1.isPrimitive)
});
$c_jl_Class.prototype.toString__T = (function() {
  return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
});
$c_jl_Class.prototype.isAssignableFrom__jl_Class__Z = (function(that) {
  return ((this.isPrimitive__Z() || that.isPrimitive__Z()) ? ((this === that) || ((this === $d_S.getClassOf()) ? (that === $d_B.getClassOf()) : ((this === $d_I.getClassOf()) ? ((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) : ((this === $d_F.getClassOf()) ? (((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) : ((this === $d_D.getClassOf()) && ((((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) || (that === $d_F.getClassOf()))))))) : this.isInstance__O__Z(that.getFakeInstance__p1__O()))
});
$c_jl_Class.prototype.isInstance__O__Z = (function(obj) {
  return $uZ(this.data$1.isInstance(obj))
});
$c_jl_Class.prototype.init___jl_ScalaJSClassData = (function(data) {
  this.data$1 = data;
  return this
});
$c_jl_Class.prototype.getFakeInstance__p1__O = (function() {
  return this.data$1.getFakeInstance()
});
$c_jl_Class.prototype.newArrayOfThisClass__sjs_js_Array__O = (function(dimensions) {
  return this.data$1.newArrayOfThisClass(dimensions)
});
$c_jl_Class.prototype.isArray__Z = (function() {
  return $uZ(this.data$1.isArrayClass)
});
$c_jl_Class.prototype.isInterface__Z = (function() {
  return $uZ(this.data$1.isInterface)
});
function $is_jl_Class(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Class)))
}
function $as_jl_Class(obj) {
  return (($is_jl_Class(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Class"))
}
function $isArrayOf_jl_Class(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Class)))
}
function $asArrayOf_jl_Class(obj, depth) {
  return (($isArrayOf_jl_Class(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Class;", depth))
}
var $d_jl_Class = new $TypeData().initClass({
  jl_Class: 0
}, false, "java.lang.Class", {
  jl_Class: 1,
  O: 1
});
$c_jl_Class.prototype.$classData = $d_jl_Class;
/** @constructor */
function $c_jl_System$() {
  $c_O.call(this);
  this.out$1 = null;
  this.err$1 = null;
  this.in$1 = null;
  this.getHighPrecisionTime$1 = null
}
$c_jl_System$.prototype = new $h_O();
$c_jl_System$.prototype.constructor = $c_jl_System$;
/** @constructor */
function $h_jl_System$() {
  /*<skip>*/
}
$h_jl_System$.prototype = $c_jl_System$.prototype;
$c_jl_System$.prototype.init___ = (function() {
  $n_jl_System$ = this;
  this.out$1 = new $c_jl_JSConsoleBasedPrintStream().init___jl_Boolean(false);
  this.err$1 = new $c_jl_JSConsoleBasedPrintStream().init___jl_Boolean(true);
  this.in$1 = null;
  var x = $g.performance;
  if ($uZ((!(!x)))) {
    var x$1 = $g.performance.now;
    if ($uZ((!(!x$1)))) {
      var jsx$1 = (function() {
        return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$1__D()
      })
    } else {
      var x$2 = $g.performance.webkitNow;
      if ($uZ((!(!x$2)))) {
        var jsx$1 = (function() {
          return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$2__D()
        })
      } else {
        var jsx$1 = (function() {
          return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$3__D()
        })
      }
    }
  } else {
    var jsx$1 = (function() {
      return $m_jl_System$().java$lang$System$$$anonfun$getHighPrecisionTime$4__D()
    })
  };
  this.getHighPrecisionTime$1 = jsx$1;
  return this
});
$c_jl_System$.prototype.java$lang$System$$$anonfun$getHighPrecisionTime$3__D = (function() {
  return $uD(new $g.Date().getTime())
});
$c_jl_System$.prototype.java$lang$System$$$anonfun$getHighPrecisionTime$1__D = (function() {
  return $uD($g.performance.now())
});
$c_jl_System$.prototype.java$lang$System$$$anonfun$getHighPrecisionTime$4__D = (function() {
  return $uD(new $g.Date().getTime())
});
$c_jl_System$.prototype.java$lang$System$$$anonfun$getHighPrecisionTime$2__D = (function() {
  return $uD($g.performance.webkitNow())
});
var $d_jl_System$ = new $TypeData().initClass({
  jl_System$: 0
}, false, "java.lang.System$", {
  jl_System$: 1,
  O: 1
});
$c_jl_System$.prototype.$classData = $d_jl_System$;
var $n_jl_System$ = (void 0);
function $m_jl_System$() {
  if ((!$n_jl_System$)) {
    $n_jl_System$ = new $c_jl_System$().init___()
  };
  return $n_jl_System$
}
/** @constructor */
function $c_jl_reflect_Array$() {
  $c_O.call(this)
}
$c_jl_reflect_Array$.prototype = new $h_O();
$c_jl_reflect_Array$.prototype.constructor = $c_jl_reflect_Array$;
/** @constructor */
function $h_jl_reflect_Array$() {
  /*<skip>*/
}
$h_jl_reflect_Array$.prototype = $c_jl_reflect_Array$.prototype;
$c_jl_reflect_Array$.prototype.init___ = (function() {
  return this
});
$c_jl_reflect_Array$.prototype.newInstance__jl_Class__I__O = (function(componentType, length) {
  return componentType.newArrayOfThisClass__sjs_js_Array__O([length])
});
var $d_jl_reflect_Array$ = new $TypeData().initClass({
  jl_reflect_Array$: 0
}, false, "java.lang.reflect.Array$", {
  jl_reflect_Array$: 1,
  O: 1
});
$c_jl_reflect_Array$.prototype.$classData = $d_jl_reflect_Array$;
var $n_jl_reflect_Array$ = (void 0);
function $m_jl_reflect_Array$() {
  if ((!$n_jl_reflect_Array$)) {
    $n_jl_reflect_Array$ = new $c_jl_reflect_Array$().init___()
  };
  return $n_jl_reflect_Array$
}
/** @constructor */
function $c_ju_Arrays$() {
  $c_O.call(this)
}
$c_ju_Arrays$.prototype = new $h_O();
$c_ju_Arrays$.prototype.constructor = $c_ju_Arrays$;
/** @constructor */
function $h_ju_Arrays$() {
  /*<skip>*/
}
$h_ju_Arrays$.prototype = $c_ju_Arrays$.prototype;
$c_ju_Arrays$.prototype.init___ = (function() {
  return this
});
$c_ju_Arrays$.prototype.equals__AO__AO__Z = (function(a, b) {
  if ((a === b)) {
    return true
  } else if ((((a !== null) && (b !== null)) && (a.u.length === b.u.length))) {
    var this$1 = $m_s_Predef$().genericArrayOps__O__scm_ArrayOps(a);
    var this$2 = $f_sc_SeqLike__indices__sci_Range(this$1);
    var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this$2, 0, this$2.length__I());
    var res = true;
    while ((res && this$3.hasNext__Z())) {
      var arg1 = this$3.next__O();
      var i = $uI(arg1);
      res = $m_sr_BoxesRunTime$().equals__O__O__Z(a.get(i), b.get(i))
    };
    return res
  } else {
    return false
  }
});
$c_ju_Arrays$.prototype.equals__AD__AD__Z = (function(a, b) {
  if ((a === b)) {
    return true
  } else if ((((a !== null) && (b !== null)) && (a.u.length === b.u.length))) {
    var this$1 = $m_s_Predef$().genericArrayOps__O__scm_ArrayOps(a);
    var this$2 = $f_sc_SeqLike__indices__sci_Range(this$1);
    var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this$2, 0, this$2.length__I());
    var res = true;
    while ((res && this$3.hasNext__Z())) {
      var arg1 = this$3.next__O();
      var i = $uI(arg1);
      res = $m_sr_BoxesRunTime$().equals__O__O__Z(a.get(i), b.get(i))
    };
    return res
  } else {
    return false
  }
});
$c_ju_Arrays$.prototype.equals__AI__AI__Z = (function(a, b) {
  if ((a === b)) {
    return true
  } else if ((((a !== null) && (b !== null)) && (a.u.length === b.u.length))) {
    var this$1 = $m_s_Predef$().genericArrayOps__O__scm_ArrayOps(a);
    var this$2 = $f_sc_SeqLike__indices__sci_Range(this$1);
    var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this$2, 0, this$2.length__I());
    var res = true;
    while ((res && this$3.hasNext__Z())) {
      var arg1 = this$3.next__O();
      var i = $uI(arg1);
      res = $m_sr_BoxesRunTime$().equals__O__O__Z(a.get(i), b.get(i))
    };
    return res
  } else {
    return false
  }
});
$c_ju_Arrays$.prototype.equals__AF__AF__Z = (function(a, b) {
  if ((a === b)) {
    return true
  } else if ((((a !== null) && (b !== null)) && (a.u.length === b.u.length))) {
    var this$1 = $m_s_Predef$().genericArrayOps__O__scm_ArrayOps(a);
    var this$2 = $f_sc_SeqLike__indices__sci_Range(this$1);
    var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this$2, 0, this$2.length__I());
    var res = true;
    while ((res && this$3.hasNext__Z())) {
      var arg1 = this$3.next__O();
      var i = $uI(arg1);
      res = $m_sr_BoxesRunTime$().equals__O__O__Z(a.get(i), b.get(i))
    };
    return res
  } else {
    return false
  }
});
$c_ju_Arrays$.prototype.equals__AJ__AJ__Z = (function(a, b) {
  if ((a === b)) {
    return true
  } else if ((((a !== null) && (b !== null)) && (a.u.length === b.u.length))) {
    var this$1 = $m_s_Predef$().genericArrayOps__O__scm_ArrayOps(a);
    var this$2 = $f_sc_SeqLike__indices__sci_Range(this$1);
    var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this$2, 0, this$2.length__I());
    var res = true;
    while ((res && this$3.hasNext__Z())) {
      var arg1 = this$3.next__O();
      var i = $uI(arg1);
      res = $m_sr_BoxesRunTime$().equals__O__O__Z(a.get(i), b.get(i))
    };
    return res
  } else {
    return false
  }
});
$c_ju_Arrays$.prototype.equals__AZ__AZ__Z = (function(a, b) {
  if ((a === b)) {
    return true
  } else if ((((a !== null) && (b !== null)) && (a.u.length === b.u.length))) {
    var this$1 = $m_s_Predef$().genericArrayOps__O__scm_ArrayOps(a);
    var this$2 = $f_sc_SeqLike__indices__sci_Range(this$1);
    var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this$2, 0, this$2.length__I());
    var res = true;
    while ((res && this$3.hasNext__Z())) {
      var arg1 = this$3.next__O();
      var i = $uI(arg1);
      res = $m_sr_BoxesRunTime$().equals__O__O__Z(a.get(i), b.get(i))
    };
    return res
  } else {
    return false
  }
});
$c_ju_Arrays$.prototype.equals__AB__AB__Z = (function(a, b) {
  if ((a === b)) {
    return true
  } else if ((((a !== null) && (b !== null)) && (a.u.length === b.u.length))) {
    var this$1 = $m_s_Predef$().genericArrayOps__O__scm_ArrayOps(a);
    var this$2 = $f_sc_SeqLike__indices__sci_Range(this$1);
    var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this$2, 0, this$2.length__I());
    var res = true;
    while ((res && this$3.hasNext__Z())) {
      var arg1 = this$3.next__O();
      var i = $uI(arg1);
      res = $m_sr_BoxesRunTime$().equals__O__O__Z(a.get(i), b.get(i))
    };
    return res
  } else {
    return false
  }
});
$c_ju_Arrays$.prototype.equals__AC__AC__Z = (function(a, b) {
  if ((a === b)) {
    return true
  } else if ((((a !== null) && (b !== null)) && (a.u.length === b.u.length))) {
    var this$1 = $m_s_Predef$().genericArrayOps__O__scm_ArrayOps(a);
    var this$2 = $f_sc_SeqLike__indices__sci_Range(this$1);
    var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this$2, 0, this$2.length__I());
    var res = true;
    while ((res && this$3.hasNext__Z())) {
      var arg1 = this$3.next__O();
      var i = $uI(arg1);
      res = $m_sr_BoxesRunTime$().equals__O__O__Z(new $c_jl_Character().init___C(a.get(i)), new $c_jl_Character().init___C(b.get(i)))
    };
    return res
  } else {
    return false
  }
});
$c_ju_Arrays$.prototype.equals__AS__AS__Z = (function(a, b) {
  if ((a === b)) {
    return true
  } else if ((((a !== null) && (b !== null)) && (a.u.length === b.u.length))) {
    var this$1 = $m_s_Predef$().genericArrayOps__O__scm_ArrayOps(a);
    var this$2 = $f_sc_SeqLike__indices__sci_Range(this$1);
    var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this$2, 0, this$2.length__I());
    var res = true;
    while ((res && this$3.hasNext__Z())) {
      var arg1 = this$3.next__O();
      var i = $uI(arg1);
      res = $m_sr_BoxesRunTime$().equals__O__O__Z(a.get(i), b.get(i))
    };
    return res
  } else {
    return false
  }
});
var $d_ju_Arrays$ = new $TypeData().initClass({
  ju_Arrays$: 0
}, false, "java.util.Arrays$", {
  ju_Arrays$: 1,
  O: 1
});
$c_ju_Arrays$.prototype.$classData = $d_ju_Arrays$;
var $n_ju_Arrays$ = (void 0);
function $m_ju_Arrays$() {
  if ((!$n_ju_Arrays$)) {
    $n_ju_Arrays$ = new $c_ju_Arrays$().init___()
  };
  return $n_ju_Arrays$
}
/** @constructor */
function $c_s_FallbackArrayBuilding() {
  $c_O.call(this)
}
$c_s_FallbackArrayBuilding.prototype = new $h_O();
$c_s_FallbackArrayBuilding.prototype.constructor = $c_s_FallbackArrayBuilding;
/** @constructor */
function $h_s_FallbackArrayBuilding() {
  /*<skip>*/
}
$h_s_FallbackArrayBuilding.prototype = $c_s_FallbackArrayBuilding.prototype;
/** @constructor */
function $c_s_LowPriorityImplicits() {
  $c_O.call(this)
}
$c_s_LowPriorityImplicits.prototype = new $h_O();
$c_s_LowPriorityImplicits.prototype.constructor = $c_s_LowPriorityImplicits;
/** @constructor */
function $h_s_LowPriorityImplicits() {
  /*<skip>*/
}
$h_s_LowPriorityImplicits.prototype = $c_s_LowPriorityImplicits.prototype;
$c_s_LowPriorityImplicits.prototype.genericWrapArray__O__scm_WrappedArray = (function(xs) {
  return ((xs === null) ? null : $m_scm_WrappedArray$().make__O__scm_WrappedArray(xs))
});
$c_s_LowPriorityImplicits.prototype.wrapDoubleArray__AD__scm_WrappedArray = (function(xs) {
  return ((xs !== null) ? new $c_scm_WrappedArray$ofDouble().init___AD(xs) : null)
});
function $f_s_PartialFunction__applyOrElse__O__F1__O($thiz, x, $default) {
  return ($thiz.isDefinedAt__O__Z(x) ? $thiz.apply__O__O(x) : $default.apply__O__O(x))
}
/** @constructor */
function $c_s_PartialFunction$() {
  $c_O.call(this);
  this.scala$PartialFunction$$fallback$undpf$f = null;
  this.scala$PartialFunction$$constFalse$f = null;
  this.empty$undpf$1 = null
}
$c_s_PartialFunction$.prototype = new $h_O();
$c_s_PartialFunction$.prototype.constructor = $c_s_PartialFunction$;
/** @constructor */
function $h_s_PartialFunction$() {
  /*<skip>*/
}
$h_s_PartialFunction$.prototype = $c_s_PartialFunction$.prototype;
$c_s_PartialFunction$.prototype.init___ = (function() {
  $n_s_PartialFunction$ = this;
  this.scala$PartialFunction$$fallback$undpf$f = new $c_s_PartialFunction$$anonfun$1().init___();
  this.scala$PartialFunction$$constFalse$f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$1$2) {
      return false
    })
  })(this));
  this.empty$undpf$1 = new $c_s_PartialFunction$$anon$1().init___();
  return this
});
var $d_s_PartialFunction$ = new $TypeData().initClass({
  s_PartialFunction$: 0
}, false, "scala.PartialFunction$", {
  s_PartialFunction$: 1,
  O: 1
});
$c_s_PartialFunction$.prototype.$classData = $d_s_PartialFunction$;
var $n_s_PartialFunction$ = (void 0);
function $m_s_PartialFunction$() {
  if ((!$n_s_PartialFunction$)) {
    $n_s_PartialFunction$ = new $c_s_PartialFunction$().init___()
  };
  return $n_s_PartialFunction$
}
/** @constructor */
function $c_s_Predef$any2stringadd$() {
  $c_O.call(this)
}
$c_s_Predef$any2stringadd$.prototype = new $h_O();
$c_s_Predef$any2stringadd$.prototype.constructor = $c_s_Predef$any2stringadd$;
/** @constructor */
function $h_s_Predef$any2stringadd$() {
  /*<skip>*/
}
$h_s_Predef$any2stringadd$.prototype = $c_s_Predef$any2stringadd$.prototype;
$c_s_Predef$any2stringadd$.prototype.init___ = (function() {
  return this
});
$c_s_Predef$any2stringadd$.prototype.$$plus$extension__O__T__T = (function($$this, other) {
  return (("" + $$this) + other)
});
var $d_s_Predef$any2stringadd$ = new $TypeData().initClass({
  s_Predef$any2stringadd$: 0
}, false, "scala.Predef$any2stringadd$", {
  s_Predef$any2stringadd$: 1,
  O: 1
});
$c_s_Predef$any2stringadd$.prototype.$classData = $d_s_Predef$any2stringadd$;
var $n_s_Predef$any2stringadd$ = (void 0);
function $m_s_Predef$any2stringadd$() {
  if ((!$n_s_Predef$any2stringadd$)) {
    $n_s_Predef$any2stringadd$ = new $c_s_Predef$any2stringadd$().init___()
  };
  return $n_s_Predef$any2stringadd$
}
/** @constructor */
function $c_s_concurrent_ExecutionContext$Implicits$() {
  $c_O.call(this);
  this.global$1 = null;
  this.bitmap$0$1 = false
}
$c_s_concurrent_ExecutionContext$Implicits$.prototype = new $h_O();
$c_s_concurrent_ExecutionContext$Implicits$.prototype.constructor = $c_s_concurrent_ExecutionContext$Implicits$;
/** @constructor */
function $h_s_concurrent_ExecutionContext$Implicits$() {
  /*<skip>*/
}
$h_s_concurrent_ExecutionContext$Implicits$.prototype = $c_s_concurrent_ExecutionContext$Implicits$.prototype;
$c_s_concurrent_ExecutionContext$Implicits$.prototype.init___ = (function() {
  return this
});
$c_s_concurrent_ExecutionContext$Implicits$.prototype.global$lzycompute__p1__s_concurrent_ExecutionContext = (function() {
  if ((!this.bitmap$0$1)) {
    this.global$1 = $m_sjs_concurrent_JSExecutionContext$().queue$1;
    this.bitmap$0$1 = true
  };
  return this.global$1
});
$c_s_concurrent_ExecutionContext$Implicits$.prototype.global__s_concurrent_ExecutionContext = (function() {
  return ((!this.bitmap$0$1) ? this.global$lzycompute__p1__s_concurrent_ExecutionContext() : this.global$1)
});
var $d_s_concurrent_ExecutionContext$Implicits$ = new $TypeData().initClass({
  s_concurrent_ExecutionContext$Implicits$: 0
}, false, "scala.concurrent.ExecutionContext$Implicits$", {
  s_concurrent_ExecutionContext$Implicits$: 1,
  O: 1
});
$c_s_concurrent_ExecutionContext$Implicits$.prototype.$classData = $d_s_concurrent_ExecutionContext$Implicits$;
var $n_s_concurrent_ExecutionContext$Implicits$ = (void 0);
function $m_s_concurrent_ExecutionContext$Implicits$() {
  if ((!$n_s_concurrent_ExecutionContext$Implicits$)) {
    $n_s_concurrent_ExecutionContext$Implicits$ = new $c_s_concurrent_ExecutionContext$Implicits$().init___()
  };
  return $n_s_concurrent_ExecutionContext$Implicits$
}
function $f_s_concurrent_Future__andThen__s_PartialFunction__s_concurrent_ExecutionContext__s_concurrent_Future($thiz, pf, executor) {
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, pf$1, executor$1) {
    return (function(result$2) {
      var result = $as_s_util_Try(result$2);
      try {
        pf$1.applyOrElse__O__F1__O(result, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1) {
          return (function(x$2) {
            var x = $as_s_util_Try(x$2);
            return x
          })
        })($this)))
      } catch (e) {
        var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
        if ((e$2 !== null)) {
          matchEnd8: {
            var o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
            if ((!o11.isEmpty__Z())) {
              var t = $as_jl_Throwable(o11.get__O());
              executor$1.reportFailure__jl_Throwable__V(t);
              break matchEnd8
            };
            throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
          }
        } else {
          throw e
        }
      };
      return result
    })
  })($thiz, pf, executor));
  return $f_s_concurrent_impl_Promise__transform__F1__s_concurrent_ExecutionContext__s_concurrent_Future($thiz, f, executor)
}
function $f_s_concurrent_Future__map__F1__s_concurrent_ExecutionContext__s_concurrent_Future($thiz, f, executor) {
  var f$2 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, f$1) {
    return (function(x$2$2) {
      var x$2 = $as_s_util_Try(x$2$2);
      return x$2.map__F1__s_util_Try(f$1)
    })
  })($thiz, f));
  return $f_s_concurrent_impl_Promise__transform__F1__s_concurrent_ExecutionContext__s_concurrent_Future($thiz, f$2, executor)
}
/** @constructor */
function $c_s_concurrent_Future$() {
  $c_O.call(this);
  this.toBoxed$1 = null;
  this.unit$1 = null
}
$c_s_concurrent_Future$.prototype = new $h_O();
$c_s_concurrent_Future$.prototype.constructor = $c_s_concurrent_Future$;
/** @constructor */
function $h_s_concurrent_Future$() {
  /*<skip>*/
}
$h_s_concurrent_Future$.prototype = $c_s_concurrent_Future$.prototype;
$c_s_concurrent_Future$.prototype.init___ = (function() {
  $n_s_concurrent_Future$ = this;
  var array = [new $c_T2().init___O__O($d_Z.getClassOf(), $d_jl_Boolean.getClassOf()), new $c_T2().init___O__O($d_B.getClassOf(), $d_jl_Byte.getClassOf()), new $c_T2().init___O__O($d_C.getClassOf(), $d_jl_Character.getClassOf()), new $c_T2().init___O__O($d_S.getClassOf(), $d_jl_Short.getClassOf()), new $c_T2().init___O__O($d_I.getClassOf(), $d_jl_Integer.getClassOf()), new $c_T2().init___O__O($d_J.getClassOf(), $d_jl_Long.getClassOf()), new $c_T2().init___O__O($d_F.getClassOf(), $d_jl_Float.getClassOf()), new $c_T2().init___O__O($d_D.getClassOf(), $d_jl_Double.getClassOf()), new $c_T2().init___O__O($d_V.getClassOf(), $d_sr_BoxedUnit.getClassOf())];
  var this$20 = new $c_scm_MapBuilder().init___sc_GenMap($m_sci_Map$EmptyMap$());
  var i = 0;
  var len = $uI(array.length);
  while ((i < len)) {
    var index = i;
    var arg1 = array[index];
    this$20.$$plus$eq__T2__scm_MapBuilder($as_T2(arg1));
    i = ((1 + i) | 0)
  };
  this.toBoxed$1 = $as_sci_Map(this$20.elems$1);
  this.unit$1 = this.successful__O__s_concurrent_Future((void 0));
  return this
});
$c_s_concurrent_Future$.prototype.successful__O__s_concurrent_Future = (function(result) {
  var this$1 = $m_s_concurrent_Promise$().successful__O__s_concurrent_Promise(result);
  return this$1
});
$c_s_concurrent_Future$.prototype.apply__F0__s_concurrent_ExecutionContext__s_concurrent_Future = (function(body, executor) {
  return this.unit$1.map__F1__s_concurrent_ExecutionContext__s_concurrent_Future(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, body$1) {
    return (function(x$5$2) {
      $asUnit(x$5$2);
      return body$1.apply__O()
    })
  })(this, body)), executor)
});
var $d_s_concurrent_Future$ = new $TypeData().initClass({
  s_concurrent_Future$: 0
}, false, "scala.concurrent.Future$", {
  s_concurrent_Future$: 1,
  O: 1
});
$c_s_concurrent_Future$.prototype.$classData = $d_s_concurrent_Future$;
var $n_s_concurrent_Future$ = (void 0);
function $m_s_concurrent_Future$() {
  if ((!$n_s_concurrent_Future$)) {
    $n_s_concurrent_Future$ = new $c_s_concurrent_Future$().init___()
  };
  return $n_s_concurrent_Future$
}
/** @constructor */
function $c_s_concurrent_Promise$() {
  $c_O.call(this)
}
$c_s_concurrent_Promise$.prototype = new $h_O();
$c_s_concurrent_Promise$.prototype.constructor = $c_s_concurrent_Promise$;
/** @constructor */
function $h_s_concurrent_Promise$() {
  /*<skip>*/
}
$h_s_concurrent_Promise$.prototype = $c_s_concurrent_Promise$.prototype;
$c_s_concurrent_Promise$.prototype.init___ = (function() {
  return this
});
$c_s_concurrent_Promise$.prototype.successful__O__s_concurrent_Promise = (function(result) {
  var result$1 = new $c_s_util_Success().init___O(result);
  return $m_s_concurrent_impl_Promise$KeptPromise$().apply__s_util_Try__s_concurrent_Promise(result$1)
});
var $d_s_concurrent_Promise$ = new $TypeData().initClass({
  s_concurrent_Promise$: 0
}, false, "scala.concurrent.Promise$", {
  s_concurrent_Promise$: 1,
  O: 1
});
$c_s_concurrent_Promise$.prototype.$classData = $d_s_concurrent_Promise$;
var $n_s_concurrent_Promise$ = (void 0);
function $m_s_concurrent_Promise$() {
  if ((!$n_s_concurrent_Promise$)) {
    $n_s_concurrent_Promise$ = new $c_s_concurrent_Promise$().init___()
  };
  return $n_s_concurrent_Promise$
}
/** @constructor */
function $c_s_concurrent_impl_Promise$() {
  $c_O.call(this)
}
$c_s_concurrent_impl_Promise$.prototype = new $h_O();
$c_s_concurrent_impl_Promise$.prototype.constructor = $c_s_concurrent_impl_Promise$;
/** @constructor */
function $h_s_concurrent_impl_Promise$() {
  /*<skip>*/
}
$h_s_concurrent_impl_Promise$.prototype = $c_s_concurrent_impl_Promise$.prototype;
$c_s_concurrent_impl_Promise$.prototype.init___ = (function() {
  return this
});
$c_s_concurrent_impl_Promise$.prototype.scala$concurrent$impl$Promise$$resolveTry__s_util_Try__s_util_Try = (function(source) {
  if ($is_s_util_Failure(source)) {
    var x2 = $as_s_util_Failure(source);
    var t = x2.exception$2;
    return this.resolver__p1__jl_Throwable__s_util_Try(t)
  } else {
    return source
  }
});
$c_s_concurrent_impl_Promise$.prototype.resolver__p1__jl_Throwable__s_util_Try = (function(throwable) {
  if ($is_sr_NonLocalReturnControl(throwable)) {
    var x2 = $as_sr_NonLocalReturnControl(throwable);
    return new $c_s_util_Success().init___O(x2.value__O())
  } else if ($is_s_util_control_ControlThrowable(throwable)) {
    var x3 = $as_s_util_control_ControlThrowable(throwable);
    return new $c_s_util_Failure().init___jl_Throwable(new $c_ju_concurrent_ExecutionException().init___T__jl_Throwable("Boxed ControlThrowable", $as_jl_Throwable(x3)))
  } else if ($is_jl_InterruptedException(throwable)) {
    var x4 = $as_jl_InterruptedException(throwable);
    return new $c_s_util_Failure().init___jl_Throwable(new $c_ju_concurrent_ExecutionException().init___T__jl_Throwable("Boxed InterruptedException", x4))
  } else if ($is_jl_Error(throwable)) {
    var x5 = $as_jl_Error(throwable);
    return new $c_s_util_Failure().init___jl_Throwable(new $c_ju_concurrent_ExecutionException().init___T__jl_Throwable("Boxed Error", x5))
  } else {
    return new $c_s_util_Failure().init___jl_Throwable(throwable)
  }
});
var $d_s_concurrent_impl_Promise$ = new $TypeData().initClass({
  s_concurrent_impl_Promise$: 0
}, false, "scala.concurrent.impl.Promise$", {
  s_concurrent_impl_Promise$: 1,
  O: 1
});
$c_s_concurrent_impl_Promise$.prototype.$classData = $d_s_concurrent_impl_Promise$;
var $n_s_concurrent_impl_Promise$ = (void 0);
function $m_s_concurrent_impl_Promise$() {
  if ((!$n_s_concurrent_impl_Promise$)) {
    $n_s_concurrent_impl_Promise$ = new $c_s_concurrent_impl_Promise$().init___()
  };
  return $n_s_concurrent_impl_Promise$
}
/** @constructor */
function $c_s_concurrent_impl_Promise$KeptPromise$() {
  $c_O.call(this)
}
$c_s_concurrent_impl_Promise$KeptPromise$.prototype = new $h_O();
$c_s_concurrent_impl_Promise$KeptPromise$.prototype.constructor = $c_s_concurrent_impl_Promise$KeptPromise$;
/** @constructor */
function $h_s_concurrent_impl_Promise$KeptPromise$() {
  /*<skip>*/
}
$h_s_concurrent_impl_Promise$KeptPromise$.prototype = $c_s_concurrent_impl_Promise$KeptPromise$.prototype;
$c_s_concurrent_impl_Promise$KeptPromise$.prototype.init___ = (function() {
  return this
});
$c_s_concurrent_impl_Promise$KeptPromise$.prototype.apply__s_util_Try__s_concurrent_Promise = (function(result) {
  var x1 = $m_s_concurrent_impl_Promise$().scala$concurrent$impl$Promise$$resolveTry__s_util_Try__s_util_Try(result);
  if ($is_s_util_Success(x1)) {
    var x2 = $as_s_util_Success(x1);
    return new $c_s_concurrent_impl_Promise$KeptPromise$Successful().init___s_util_Success(x2)
  } else if ($is_s_util_Failure(x1)) {
    var x4 = $as_s_util_Failure(x1);
    return new $c_s_concurrent_impl_Promise$KeptPromise$Failed().init___s_util_Failure(x4)
  } else {
    throw new $c_s_MatchError().init___O(x1)
  }
});
var $d_s_concurrent_impl_Promise$KeptPromise$ = new $TypeData().initClass({
  s_concurrent_impl_Promise$KeptPromise$: 0
}, false, "scala.concurrent.impl.Promise$KeptPromise$", {
  s_concurrent_impl_Promise$KeptPromise$: 1,
  O: 1
});
$c_s_concurrent_impl_Promise$KeptPromise$.prototype.$classData = $d_s_concurrent_impl_Promise$KeptPromise$;
var $n_s_concurrent_impl_Promise$KeptPromise$ = (void 0);
function $m_s_concurrent_impl_Promise$KeptPromise$() {
  if ((!$n_s_concurrent_impl_Promise$KeptPromise$)) {
    $n_s_concurrent_impl_Promise$KeptPromise$ = new $c_s_concurrent_impl_Promise$KeptPromise$().init___()
  };
  return $n_s_concurrent_impl_Promise$KeptPromise$
}
/** @constructor */
function $c_s_math_Ordered$() {
  $c_O.call(this)
}
$c_s_math_Ordered$.prototype = new $h_O();
$c_s_math_Ordered$.prototype.constructor = $c_s_math_Ordered$;
/** @constructor */
function $h_s_math_Ordered$() {
  /*<skip>*/
}
$h_s_math_Ordered$.prototype = $c_s_math_Ordered$.prototype;
$c_s_math_Ordered$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Ordered$ = new $TypeData().initClass({
  s_math_Ordered$: 0
}, false, "scala.math.Ordered$", {
  s_math_Ordered$: 1,
  O: 1
});
$c_s_math_Ordered$.prototype.$classData = $d_s_math_Ordered$;
var $n_s_math_Ordered$ = (void 0);
function $m_s_math_Ordered$() {
  if ((!$n_s_math_Ordered$)) {
    $n_s_math_Ordered$ = new $c_s_math_Ordered$().init___()
  };
  return $n_s_math_Ordered$
}
/** @constructor */
function $c_s_package$() {
  $c_O.call(this);
  this.BigDecimal$1 = null;
  this.BigInt$1 = null;
  this.AnyRef$1 = null;
  this.Traversable$1 = null;
  this.Iterable$1 = null;
  this.Seq$1 = null;
  this.IndexedSeq$1 = null;
  this.Iterator$1 = null;
  this.List$1 = null;
  this.Nil$1 = null;
  this.$$colon$colon$1 = null;
  this.$$plus$colon$1 = null;
  this.$$colon$plus$1 = null;
  this.Stream$1 = null;
  this.$$hash$colon$colon$1 = null;
  this.Vector$1 = null;
  this.StringBuilder$1 = null;
  this.Range$1 = null;
  this.Equiv$1 = null;
  this.Fractional$1 = null;
  this.Integral$1 = null;
  this.Numeric$1 = null;
  this.Ordered$1 = null;
  this.Ordering$1 = null;
  this.Either$1 = null;
  this.Left$1 = null;
  this.Right$1 = null;
  this.bitmap$0$1 = 0
}
$c_s_package$.prototype = new $h_O();
$c_s_package$.prototype.constructor = $c_s_package$;
/** @constructor */
function $h_s_package$() {
  /*<skip>*/
}
$h_s_package$.prototype = $c_s_package$.prototype;
$c_s_package$.prototype.init___ = (function() {
  $n_s_package$ = this;
  this.AnyRef$1 = new $c_s_package$$anon$1().init___();
  this.Traversable$1 = $m_sc_Traversable$();
  this.Iterable$1 = $m_sc_Iterable$();
  this.Seq$1 = $m_sc_Seq$();
  this.IndexedSeq$1 = $m_sc_IndexedSeq$();
  this.Iterator$1 = $m_sc_Iterator$();
  this.List$1 = $m_sci_List$();
  this.Nil$1 = $m_sci_Nil$();
  this.$$colon$colon$1 = $m_sci_$colon$colon$();
  this.$$plus$colon$1 = $m_sc_$plus$colon$();
  this.$$colon$plus$1 = $m_sc_$colon$plus$();
  this.Stream$1 = $m_sci_Stream$();
  this.$$hash$colon$colon$1 = $m_sci_Stream$$hash$colon$colon$();
  this.Vector$1 = $m_sci_Vector$();
  this.StringBuilder$1 = $m_scm_StringBuilder$();
  this.Range$1 = $m_sci_Range$();
  this.Equiv$1 = $m_s_math_Equiv$();
  this.Fractional$1 = $m_s_math_Fractional$();
  this.Integral$1 = $m_s_math_Integral$();
  this.Numeric$1 = $m_s_math_Numeric$();
  this.Ordered$1 = $m_s_math_Ordered$();
  this.Ordering$1 = $m_s_math_Ordering$();
  this.Either$1 = $m_s_util_Either$();
  this.Left$1 = $m_s_util_Left$();
  this.Right$1 = $m_s_util_Right$();
  return this
});
var $d_s_package$ = new $TypeData().initClass({
  s_package$: 0
}, false, "scala.package$", {
  s_package$: 1,
  O: 1
});
$c_s_package$.prototype.$classData = $d_s_package$;
var $n_s_package$ = (void 0);
function $m_s_package$() {
  if ((!$n_s_package$)) {
    $n_s_package$ = new $c_s_package$().init___()
  };
  return $n_s_package$
}
/** @constructor */
function $c_s_reflect_ClassManifestFactory$() {
  $c_O.call(this);
  this.Byte$1 = null;
  this.Short$1 = null;
  this.Char$1 = null;
  this.Int$1 = null;
  this.Long$1 = null;
  this.Float$1 = null;
  this.Double$1 = null;
  this.Boolean$1 = null;
  this.Unit$1 = null;
  this.Any$1 = null;
  this.Object$1 = null;
  this.AnyVal$1 = null;
  this.Nothing$1 = null;
  this.Null$1 = null
}
$c_s_reflect_ClassManifestFactory$.prototype = new $h_O();
$c_s_reflect_ClassManifestFactory$.prototype.constructor = $c_s_reflect_ClassManifestFactory$;
/** @constructor */
function $h_s_reflect_ClassManifestFactory$() {
  /*<skip>*/
}
$h_s_reflect_ClassManifestFactory$.prototype = $c_s_reflect_ClassManifestFactory$.prototype;
$c_s_reflect_ClassManifestFactory$.prototype.init___ = (function() {
  $n_s_reflect_ClassManifestFactory$ = this;
  this.Byte$1 = $m_s_reflect_ManifestFactory$ByteManifest$();
  this.Short$1 = $m_s_reflect_ManifestFactory$ShortManifest$();
  this.Char$1 = $m_s_reflect_ManifestFactory$CharManifest$();
  this.Int$1 = $m_s_reflect_ManifestFactory$IntManifest$();
  this.Long$1 = $m_s_reflect_ManifestFactory$LongManifest$();
  this.Float$1 = $m_s_reflect_ManifestFactory$FloatManifest$();
  this.Double$1 = $m_s_reflect_ManifestFactory$DoubleManifest$();
  this.Boolean$1 = $m_s_reflect_ManifestFactory$BooleanManifest$();
  this.Unit$1 = $m_s_reflect_ManifestFactory$UnitManifest$();
  this.Any$1 = $m_s_reflect_ManifestFactory$AnyManifest$();
  this.Object$1 = $m_s_reflect_ManifestFactory$ObjectManifest$();
  this.AnyVal$1 = $m_s_reflect_ManifestFactory$AnyValManifest$();
  this.Nothing$1 = $m_s_reflect_ManifestFactory$NothingManifest$();
  this.Null$1 = $m_s_reflect_ManifestFactory$NullManifest$();
  return this
});
var $d_s_reflect_ClassManifestFactory$ = new $TypeData().initClass({
  s_reflect_ClassManifestFactory$: 0
}, false, "scala.reflect.ClassManifestFactory$", {
  s_reflect_ClassManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ClassManifestFactory$.prototype.$classData = $d_s_reflect_ClassManifestFactory$;
var $n_s_reflect_ClassManifestFactory$ = (void 0);
function $m_s_reflect_ClassManifestFactory$() {
  if ((!$n_s_reflect_ClassManifestFactory$)) {
    $n_s_reflect_ClassManifestFactory$ = new $c_s_reflect_ClassManifestFactory$().init___()
  };
  return $n_s_reflect_ClassManifestFactory$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$() {
  $c_O.call(this)
}
$c_s_reflect_ManifestFactory$.prototype = new $h_O();
$c_s_reflect_ManifestFactory$.prototype.constructor = $c_s_reflect_ManifestFactory$;
/** @constructor */
function $h_s_reflect_ManifestFactory$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$.prototype = $c_s_reflect_ManifestFactory$.prototype;
$c_s_reflect_ManifestFactory$.prototype.init___ = (function() {
  return this
});
var $d_s_reflect_ManifestFactory$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$: 0
}, false, "scala.reflect.ManifestFactory$", {
  s_reflect_ManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ManifestFactory$.prototype.$classData = $d_s_reflect_ManifestFactory$;
var $n_s_reflect_ManifestFactory$ = (void 0);
function $m_s_reflect_ManifestFactory$() {
  if ((!$n_s_reflect_ManifestFactory$)) {
    $n_s_reflect_ManifestFactory$ = new $c_s_reflect_ManifestFactory$().init___()
  };
  return $n_s_reflect_ManifestFactory$
}
/** @constructor */
function $c_s_reflect_package$() {
  $c_O.call(this);
  this.ClassManifest$1 = null;
  this.Manifest$1 = null
}
$c_s_reflect_package$.prototype = new $h_O();
$c_s_reflect_package$.prototype.constructor = $c_s_reflect_package$;
/** @constructor */
function $h_s_reflect_package$() {
  /*<skip>*/
}
$h_s_reflect_package$.prototype = $c_s_reflect_package$.prototype;
$c_s_reflect_package$.prototype.init___ = (function() {
  $n_s_reflect_package$ = this;
  this.ClassManifest$1 = $m_s_reflect_ClassManifestFactory$();
  this.Manifest$1 = $m_s_reflect_ManifestFactory$();
  return this
});
var $d_s_reflect_package$ = new $TypeData().initClass({
  s_reflect_package$: 0
}, false, "scala.reflect.package$", {
  s_reflect_package$: 1,
  O: 1
});
$c_s_reflect_package$.prototype.$classData = $d_s_reflect_package$;
var $n_s_reflect_package$ = (void 0);
function $m_s_reflect_package$() {
  if ((!$n_s_reflect_package$)) {
    $n_s_reflect_package$ = new $c_s_reflect_package$().init___()
  };
  return $n_s_reflect_package$
}
/** @constructor */
function $c_s_util_control_Breaks() {
  $c_O.call(this);
  this.scala$util$control$Breaks$$breakException$1 = null
}
$c_s_util_control_Breaks.prototype = new $h_O();
$c_s_util_control_Breaks.prototype.constructor = $c_s_util_control_Breaks;
/** @constructor */
function $h_s_util_control_Breaks() {
  /*<skip>*/
}
$h_s_util_control_Breaks.prototype = $c_s_util_control_Breaks.prototype;
$c_s_util_control_Breaks.prototype.init___ = (function() {
  this.scala$util$control$Breaks$$breakException$1 = new $c_s_util_control_BreakControl().init___();
  return this
});
var $d_s_util_control_Breaks = new $TypeData().initClass({
  s_util_control_Breaks: 0
}, false, "scala.util.control.Breaks", {
  s_util_control_Breaks: 1,
  O: 1
});
$c_s_util_control_Breaks.prototype.$classData = $d_s_util_control_Breaks;
function $is_s_util_control_ControlThrowable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_control_ControlThrowable)))
}
function $as_s_util_control_ControlThrowable(obj) {
  return (($is_s_util_control_ControlThrowable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.util.control.ControlThrowable"))
}
function $isArrayOf_s_util_control_ControlThrowable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_control_ControlThrowable)))
}
function $asArrayOf_s_util_control_ControlThrowable(obj, depth) {
  return (($isArrayOf_s_util_control_ControlThrowable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.util.control.ControlThrowable;", depth))
}
/** @constructor */
function $c_s_util_control_NonFatal$() {
  $c_O.call(this)
}
$c_s_util_control_NonFatal$.prototype = new $h_O();
$c_s_util_control_NonFatal$.prototype.constructor = $c_s_util_control_NonFatal$;
/** @constructor */
function $h_s_util_control_NonFatal$() {
  /*<skip>*/
}
$h_s_util_control_NonFatal$.prototype = $c_s_util_control_NonFatal$.prototype;
$c_s_util_control_NonFatal$.prototype.init___ = (function() {
  return this
});
$c_s_util_control_NonFatal$.prototype.apply__jl_Throwable__Z = (function(t) {
  return (!($is_jl_VirtualMachineError(t) || ($is_jl_ThreadDeath(t) || ($is_jl_InterruptedException(t) || ($is_jl_LinkageError(t) || $is_s_util_control_ControlThrowable(t))))))
});
$c_s_util_control_NonFatal$.prototype.unapply__jl_Throwable__s_Option = (function(t) {
  return (this.apply__jl_Throwable__Z(t) ? new $c_s_Some().init___O(t) : $m_s_None$())
});
var $d_s_util_control_NonFatal$ = new $TypeData().initClass({
  s_util_control_NonFatal$: 0
}, false, "scala.util.control.NonFatal$", {
  s_util_control_NonFatal$: 1,
  O: 1
});
$c_s_util_control_NonFatal$.prototype.$classData = $d_s_util_control_NonFatal$;
var $n_s_util_control_NonFatal$ = (void 0);
function $m_s_util_control_NonFatal$() {
  if ((!$n_s_util_control_NonFatal$)) {
    $n_s_util_control_NonFatal$ = new $c_s_util_control_NonFatal$().init___()
  };
  return $n_s_util_control_NonFatal$
}
/** @constructor */
function $c_s_util_hashing_MurmurHash3() {
  $c_O.call(this)
}
$c_s_util_hashing_MurmurHash3.prototype = new $h_O();
$c_s_util_hashing_MurmurHash3.prototype.constructor = $c_s_util_hashing_MurmurHash3;
/** @constructor */
function $h_s_util_hashing_MurmurHash3() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3.prototype = $c_s_util_hashing_MurmurHash3.prototype;
$c_s_util_hashing_MurmurHash3.prototype.arrayHash$mVc$sp__Asr_BoxedUnit__I__I = (function(a, seed) {
  var h = seed;
  var i = 0;
  while ((i < a.u.length)) {
    h = this.mix__I__I__I(h, 0);
    i = ((1 + i) | 0)
  };
  return this.finalizeHash__I__I__I(h, a.u.length)
});
$c_s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = $imul((-862048943), k);
  var i = k;
  k = ((i << 15) | ((i >>> 17) | 0));
  k = $imul(461845907, k);
  return (hash ^ k)
});
$c_s_util_hashing_MurmurHash3.prototype.arrayHash$mDc$sp__AD__I__I = (function(a, seed) {
  var h = seed;
  var i = 0;
  while ((i < a.u.length)) {
    h = this.mix__I__I__I(h, $m_sr_Statics$().doubleHash__D__I(a.get(i)));
    i = ((1 + i) | 0)
  };
  return this.finalizeHash__I__I__I(h, a.u.length)
});
$c_s_util_hashing_MurmurHash3.prototype.arrayHash$mJc$sp__AJ__I__I = (function(a, seed) {
  var h = seed;
  var i = 0;
  while ((i < a.u.length)) {
    h = this.mix__I__I__I(h, $m_sr_Statics$().longHash__J__I(a.get(i)));
    i = ((1 + i) | 0)
  };
  return this.finalizeHash__I__I__I(h, a.u.length)
});
$c_s_util_hashing_MurmurHash3.prototype.arrayHash$mZc$sp__AZ__I__I = (function(a, seed) {
  var h = seed;
  var i = 0;
  while ((i < a.u.length)) {
    h = this.mix__I__I__I(h, (a.get(i) ? 1231 : 1237));
    i = ((1 + i) | 0)
  };
  return this.finalizeHash__I__I__I(h, a.u.length)
});
$c_s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  var i = h;
  h = ((i << 13) | ((i >>> 19) | 0));
  return (((-430675100) + $imul(5, h)) | 0)
});
$c_s_util_hashing_MurmurHash3.prototype.bytesHash__AB__I__I = (function(data, seed) {
  var len = data.u.length;
  var h = seed;
  var i = 0;
  while ((len >= 4)) {
    var k = (255 & data.get(i));
    k = (k | ((255 & data.get(((1 + i) | 0))) << 8));
    k = (k | ((255 & data.get(((2 + i) | 0))) << 16));
    k = (k | ((255 & data.get(((3 + i) | 0))) << 24));
    h = this.mix__I__I__I(h, k);
    i = ((4 + i) | 0);
    len = (((-4) + len) | 0)
  };
  var k$2 = 0;
  if ((len === 3)) {
    k$2 = (k$2 ^ ((255 & data.get(((2 + i) | 0))) << 16))
  };
  if ((len >= 2)) {
    k$2 = (k$2 ^ ((255 & data.get(((1 + i) | 0))) << 8))
  };
  if ((len >= 1)) {
    k$2 = (k$2 ^ (255 & data.get(i)));
    h = this.mixLast__I__I__I(h, k$2)
  };
  return this.finalizeHash__I__I__I(h, data.u.length)
});
$c_s_util_hashing_MurmurHash3.prototype.avalanche__p1__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = $imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = $imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
$c_s_util_hashing_MurmurHash3.prototype.arrayHash$mSc$sp__AS__I__I = (function(a, seed) {
  var h = seed;
  var i = 0;
  while ((i < a.u.length)) {
    h = this.mix__I__I__I(h, a.get(i));
    i = ((1 + i) | 0)
  };
  return this.finalizeHash__I__I__I(h, a.u.length)
});
$c_s_util_hashing_MurmurHash3.prototype.arrayHash__O__I__I = (function(a, seed) {
  var h = seed;
  var i = 0;
  while ((i < $m_sr_ScalaRunTime$().array$undlength__O__I(a))) {
    h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I($m_sr_ScalaRunTime$().array$undapply__O__I__O(a, i)));
    i = ((1 + i) | 0)
  };
  return this.finalizeHash__I__I__I(h, $m_sr_ScalaRunTime$().array$undlength__O__I(a))
});
$c_s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__I = (function(x, seed) {
  var arr = x.productArity__I();
  if ((arr === 0)) {
    var this$1 = x.productPrefix__T();
    return $m_sjsr_RuntimeString$().hashCode__T__I(this$1)
  } else {
    var h = seed;
    var i = 0;
    while ((i < arr)) {
      h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(x.productElement__I__O(i)));
      i = ((1 + i) | 0)
    };
    return this.finalizeHash__I__I__I(h, arr)
  }
});
$c_s_util_hashing_MurmurHash3.prototype.unorderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var a = new $c_sr_IntRef().init___I(0);
  var b = new $c_sr_IntRef().init___I(0);
  var n = new $c_sr_IntRef().init___I(0);
  var c = new $c_sr_IntRef().init___I(1);
  xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, a$1, b$1, n$1, c$1) {
    return (function(x$2) {
      var h = $m_sr_Statics$().anyHash__O__I(x$2);
      a$1.elem$1 = ((a$1.elem$1 + h) | 0);
      b$1.elem$1 = (b$1.elem$1 ^ h);
      if ((h !== 0)) {
        c$1.elem$1 = $imul(c$1.elem$1, h)
      };
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, a, b, n, c)));
  var h$1 = seed;
  h$1 = this.mix__I__I__I(h$1, a.elem$1);
  h$1 = this.mix__I__I__I(h$1, b.elem$1);
  h$1 = this.mixLast__I__I__I(h$1, c.elem$1);
  return this.finalizeHash__I__I__I(h$1, n.elem$1)
});
$c_s_util_hashing_MurmurHash3.prototype.arrayHash$mCc$sp__AC__I__I = (function(a, seed) {
  var h = seed;
  var i = 0;
  while ((i < a.u.length)) {
    h = this.mix__I__I__I(h, a.get(i));
    i = ((1 + i) | 0)
  };
  return this.finalizeHash__I__I__I(h, a.u.length)
});
$c_s_util_hashing_MurmurHash3.prototype.arrayHash$mFc$sp__AF__I__I = (function(a, seed) {
  var h = seed;
  var i = 0;
  while ((i < a.u.length)) {
    var jsx$1 = h;
    var this$1 = $m_sr_Statics$();
    var fv = a.get(i);
    h = this.mix__I__I__I(jsx$1, this$1.doubleHash__D__I(fv));
    i = ((1 + i) | 0)
  };
  return this.finalizeHash__I__I__I(h, a.u.length)
});
$c_s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__p1__I__I((hash ^ length))
});
$c_s_util_hashing_MurmurHash3.prototype.arrayHash$mIc$sp__AI__I__I = (function(a, seed) {
  var h = seed;
  var i = 0;
  while ((i < a.u.length)) {
    h = this.mix__I__I__I(h, a.get(i));
    i = ((1 + i) | 0)
  };
  return this.finalizeHash__I__I__I(h, a.u.length)
});
$c_s_util_hashing_MurmurHash3.prototype.orderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var n = new $c_sr_IntRef().init___I(0);
  var h = new $c_sr_IntRef().init___I(seed);
  xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, n$1, h$1) {
    return (function(x$2) {
      h$1.elem$1 = $this.mix__I__I__I(h$1.elem$1, $m_sr_Statics$().anyHash__O__I(x$2));
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, n, h)));
  return this.finalizeHash__I__I__I(h.elem$1, n.elem$1)
});
$c_s_util_hashing_MurmurHash3.prototype.listHash__sci_List__I__I = (function(xs, seed) {
  var n = 0;
  var h = seed;
  var elems = xs;
  while ((!elems.isEmpty__Z())) {
    var head = elems.head__O();
    var this$1 = elems;
    var tail = this$1.tail__sci_List();
    h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(head));
    n = ((1 + n) | 0);
    elems = tail
  };
  return this.finalizeHash__I__I__I(h, n)
});
/** @constructor */
function $c_sc_$colon$plus$() {
  $c_O.call(this)
}
$c_sc_$colon$plus$.prototype = new $h_O();
$c_sc_$colon$plus$.prototype.constructor = $c_sc_$colon$plus$;
/** @constructor */
function $h_sc_$colon$plus$() {
  /*<skip>*/
}
$h_sc_$colon$plus$.prototype = $c_sc_$colon$plus$.prototype;
$c_sc_$colon$plus$.prototype.init___ = (function() {
  return this
});
var $d_sc_$colon$plus$ = new $TypeData().initClass({
  sc_$colon$plus$: 0
}, false, "scala.collection.$colon$plus$", {
  sc_$colon$plus$: 1,
  O: 1
});
$c_sc_$colon$plus$.prototype.$classData = $d_sc_$colon$plus$;
var $n_sc_$colon$plus$ = (void 0);
function $m_sc_$colon$plus$() {
  if ((!$n_sc_$colon$plus$)) {
    $n_sc_$colon$plus$ = new $c_sc_$colon$plus$().init___()
  };
  return $n_sc_$colon$plus$
}
/** @constructor */
function $c_sc_$plus$colon$() {
  $c_O.call(this)
}
$c_sc_$plus$colon$.prototype = new $h_O();
$c_sc_$plus$colon$.prototype.constructor = $c_sc_$plus$colon$;
/** @constructor */
function $h_sc_$plus$colon$() {
  /*<skip>*/
}
$h_sc_$plus$colon$.prototype = $c_sc_$plus$colon$.prototype;
$c_sc_$plus$colon$.prototype.init___ = (function() {
  return this
});
var $d_sc_$plus$colon$ = new $TypeData().initClass({
  sc_$plus$colon$: 0
}, false, "scala.collection.$plus$colon$", {
  sc_$plus$colon$: 1,
  O: 1
});
$c_sc_$plus$colon$.prototype.$classData = $d_sc_$plus$colon$;
var $n_sc_$plus$colon$ = (void 0);
function $m_sc_$plus$colon$() {
  if ((!$n_sc_$plus$colon$)) {
    $n_sc_$plus$colon$ = new $c_sc_$plus$colon$().init___()
  };
  return $n_sc_$plus$colon$
}
/** @constructor */
function $c_sc_Iterator$() {
  $c_O.call(this);
  this.empty$1 = null
}
$c_sc_Iterator$.prototype = new $h_O();
$c_sc_Iterator$.prototype.constructor = $c_sc_Iterator$;
/** @constructor */
function $h_sc_Iterator$() {
  /*<skip>*/
}
$h_sc_Iterator$.prototype = $c_sc_Iterator$.prototype;
$c_sc_Iterator$.prototype.init___ = (function() {
  $n_sc_Iterator$ = this;
  this.empty$1 = new $c_sc_Iterator$$anon$2().init___();
  return this
});
var $d_sc_Iterator$ = new $TypeData().initClass({
  sc_Iterator$: 0
}, false, "scala.collection.Iterator$", {
  sc_Iterator$: 1,
  O: 1
});
$c_sc_Iterator$.prototype.$classData = $d_sc_Iterator$;
var $n_sc_Iterator$ = (void 0);
function $m_sc_Iterator$() {
  if ((!$n_sc_Iterator$)) {
    $n_sc_Iterator$ = new $c_sc_Iterator$().init___()
  };
  return $n_sc_Iterator$
}
function $f_sc_TraversableOnce__copyToArray__O__I__V($thiz, xs, start) {
  $thiz.copyToArray__O__I__I__V(xs, start, (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0))
}
function $f_sc_TraversableOnce__to__scg_CanBuildFrom__O($thiz, cbf) {
  var b = cbf.apply__scm_Builder();
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.seq__sc_TraversableOnce());
  return b.result__O()
}
function $f_sc_TraversableOnce__mkString__T__T__T__T($thiz, start, sep, end) {
  var this$1 = $thiz.addString__scm_StringBuilder__T__T__T__scm_StringBuilder(new $c_scm_StringBuilder().init___(), start, sep, end);
  return this$1.underlying$5.java$lang$StringBuilder$$content$f
}
function $f_sc_TraversableOnce__foldLeft__O__F2__O($thiz, z, op) {
  var result = new $c_sr_ObjectRef().init___O(z);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, op$1, result$1) {
    return (function(x$2) {
      result$1.elem$1 = op$1.apply__O__O__O(result$1.elem$1, x$2)
    })
  })($thiz, op, result)));
  return result.elem$1
}
function $f_sc_TraversableOnce__size__I($thiz) {
  var result = new $c_sr_IntRef().init___I(0);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, result$1) {
    return (function(x$2) {
      result$1.elem$1 = ((1 + result$1.elem$1) | 0)
    })
  })($thiz, result)));
  return result.elem$1
}
function $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder($thiz, b, start, sep, end) {
  var first = new $c_sr_BooleanRef().init___Z(true);
  b.append__T__scm_StringBuilder(start);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b$1, sep$1, first$1) {
    return (function(x$2) {
      if (first$1.elem$1) {
        b$1.append__O__scm_StringBuilder(x$2);
        first$1.elem$1 = false;
        return (void 0)
      } else {
        b$1.append__T__scm_StringBuilder(sep$1);
        return b$1.append__O__scm_StringBuilder(x$2)
      }
    })
  })($thiz, b, sep, first)));
  b.append__T__scm_StringBuilder(end);
  return b
}
function $f_sc_TraversableOnce__sum__s_math_Numeric__O($thiz, num) {
  return $thiz.foldLeft__O__F2__O(num.fromInt__I__O(0), new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this, num$1) {
    return (function(x$2, y$2) {
      return num$1.plus__O__O__O(x$2, y$2)
    })
  })($thiz, num)))
}
function $f_sc_TraversableOnce__toArray__s_reflect_ClassTag__O($thiz, evidence$1) {
  if ($thiz.isTraversableAgain__Z()) {
    var result = evidence$1.newArray__I__O($thiz.size__I());
    $thiz.copyToArray__O__I__V(result, 0);
    return result
  } else {
    return $thiz.toBuffer__scm_Buffer().toArray__s_reflect_ClassTag__O(evidence$1)
  }
}
function $f_sc_TraversableOnce__nonEmpty__Z($thiz) {
  return (!$thiz.isEmpty__Z())
}
function $is_sc_TraversableOnce(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_TraversableOnce)))
}
function $as_sc_TraversableOnce(obj) {
  return (($is_sc_TraversableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.TraversableOnce"))
}
function $isArrayOf_sc_TraversableOnce(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_TraversableOnce)))
}
function $asArrayOf_sc_TraversableOnce(obj, depth) {
  return (($isArrayOf_sc_TraversableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.TraversableOnce;", depth))
}
/** @constructor */
function $c_scg_GenMapFactory() {
  $c_O.call(this)
}
$c_scg_GenMapFactory.prototype = new $h_O();
$c_scg_GenMapFactory.prototype.constructor = $c_scg_GenMapFactory;
/** @constructor */
function $h_scg_GenMapFactory() {
  /*<skip>*/
}
$h_scg_GenMapFactory.prototype = $c_scg_GenMapFactory.prototype;
$c_scg_GenMapFactory.prototype.apply__sc_Seq__sc_GenMap = (function(elems) {
  var this$1 = new $c_scm_MapBuilder().init___sc_GenMap(this.empty__sc_GenMap());
  return $as_sc_GenMap($as_scm_Builder($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this$1, elems)).result__O())
});
/** @constructor */
function $c_scg_GenericCompanion() {
  $c_O.call(this)
}
$c_scg_GenericCompanion.prototype = new $h_O();
$c_scg_GenericCompanion.prototype.constructor = $c_scg_GenericCompanion;
/** @constructor */
function $h_scg_GenericCompanion() {
  /*<skip>*/
}
$h_scg_GenericCompanion.prototype = $c_scg_GenericCompanion.prototype;
function $f_scg_Growable__loop$1__pscg_Growable__sc_LinearSeq__V($thiz, xs) {
  _loop: while (true) {
    var this$1 = xs;
    if ($f_sc_TraversableOnce__nonEmpty__Z(this$1)) {
      $thiz.$$plus$eq__O__scg_Growable(xs.head__O());
      xs = $as_sc_LinearSeq(xs.tail__O());
      continue _loop
    };
    break
  }
}
function $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz, xs) {
  if ($is_sc_LinearSeq(xs)) {
    var x2 = $as_sc_LinearSeq(xs);
    var xs$1 = x2;
    $f_scg_Growable__loop$1__pscg_Growable__sc_LinearSeq__V($thiz, xs$1)
  } else {
    xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
      return (function(elem$2) {
        return $this.$$plus$eq__O__scg_Growable(elem$2)
      })
    })($thiz)))
  };
  return $thiz
}
/** @constructor */
function $c_sci_HashMap$Merger() {
  $c_O.call(this)
}
$c_sci_HashMap$Merger.prototype = new $h_O();
$c_sci_HashMap$Merger.prototype.constructor = $c_sci_HashMap$Merger;
/** @constructor */
function $h_sci_HashMap$Merger() {
  /*<skip>*/
}
$h_sci_HashMap$Merger.prototype = $c_sci_HashMap$Merger.prototype;
/** @constructor */
function $c_sci_Stream$$hash$colon$colon$() {
  $c_O.call(this)
}
$c_sci_Stream$$hash$colon$colon$.prototype = new $h_O();
$c_sci_Stream$$hash$colon$colon$.prototype.constructor = $c_sci_Stream$$hash$colon$colon$;
/** @constructor */
function $h_sci_Stream$$hash$colon$colon$() {
  /*<skip>*/
}
$h_sci_Stream$$hash$colon$colon$.prototype = $c_sci_Stream$$hash$colon$colon$.prototype;
$c_sci_Stream$$hash$colon$colon$.prototype.init___ = (function() {
  return this
});
var $d_sci_Stream$$hash$colon$colon$ = new $TypeData().initClass({
  sci_Stream$$hash$colon$colon$: 0
}, false, "scala.collection.immutable.Stream$$hash$colon$colon$", {
  sci_Stream$$hash$colon$colon$: 1,
  O: 1
});
$c_sci_Stream$$hash$colon$colon$.prototype.$classData = $d_sci_Stream$$hash$colon$colon$;
var $n_sci_Stream$$hash$colon$colon$ = (void 0);
function $m_sci_Stream$$hash$colon$colon$() {
  if ((!$n_sci_Stream$$hash$colon$colon$)) {
    $n_sci_Stream$$hash$colon$colon$ = new $c_sci_Stream$$hash$colon$colon$().init___()
  };
  return $n_sci_Stream$$hash$colon$colon$
}
/** @constructor */
function $c_sci_StreamIterator$LazyCell() {
  $c_O.call(this);
  this.v$1 = null;
  this.st$1 = null;
  this.bitmap$0$1 = false;
  this.$$outer$1 = null
}
$c_sci_StreamIterator$LazyCell.prototype = new $h_O();
$c_sci_StreamIterator$LazyCell.prototype.constructor = $c_sci_StreamIterator$LazyCell;
/** @constructor */
function $h_sci_StreamIterator$LazyCell() {
  /*<skip>*/
}
$h_sci_StreamIterator$LazyCell.prototype = $c_sci_StreamIterator$LazyCell.prototype;
$c_sci_StreamIterator$LazyCell.prototype.init___sci_StreamIterator__F0 = (function($$outer, st) {
  this.st$1 = st;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_sci_StreamIterator$LazyCell.prototype.v$lzycompute__p1__sci_Stream = (function() {
  if ((!this.bitmap$0$1)) {
    this.v$1 = $as_sci_Stream(this.st$1.apply__O());
    this.bitmap$0$1 = true
  };
  this.st$1 = null;
  return this.v$1
});
$c_sci_StreamIterator$LazyCell.prototype.v__sci_Stream = (function() {
  return ((!this.bitmap$0$1) ? this.v$lzycompute__p1__sci_Stream() : this.v$1)
});
var $d_sci_StreamIterator$LazyCell = new $TypeData().initClass({
  sci_StreamIterator$LazyCell: 0
}, false, "scala.collection.immutable.StreamIterator$LazyCell", {
  sci_StreamIterator$LazyCell: 1,
  O: 1
});
$c_sci_StreamIterator$LazyCell.prototype.$classData = $d_sci_StreamIterator$LazyCell;
/** @constructor */
function $c_sci_StringOps$() {
  $c_O.call(this)
}
$c_sci_StringOps$.prototype = new $h_O();
$c_sci_StringOps$.prototype.constructor = $c_sci_StringOps$;
/** @constructor */
function $h_sci_StringOps$() {
  /*<skip>*/
}
$h_sci_StringOps$.prototype = $c_sci_StringOps$.prototype;
$c_sci_StringOps$.prototype.init___ = (function() {
  return this
});
$c_sci_StringOps$.prototype.equals$extension__T__O__Z = (function($$this, x$1) {
  if ($is_sci_StringOps(x$1)) {
    var StringOps$1 = ((x$1 === null) ? null : $as_sci_StringOps(x$1).repr$1);
    return ($$this === StringOps$1)
  } else {
    return false
  }
});
var $d_sci_StringOps$ = new $TypeData().initClass({
  sci_StringOps$: 0
}, false, "scala.collection.immutable.StringOps$", {
  sci_StringOps$: 1,
  O: 1
});
$c_sci_StringOps$.prototype.$classData = $d_sci_StringOps$;
var $n_sci_StringOps$ = (void 0);
function $m_sci_StringOps$() {
  if ((!$n_sci_StringOps$)) {
    $n_sci_StringOps$ = new $c_sci_StringOps$().init___()
  };
  return $n_sci_StringOps$
}
/** @constructor */
function $c_sci_WrappedString$() {
  $c_O.call(this)
}
$c_sci_WrappedString$.prototype = new $h_O();
$c_sci_WrappedString$.prototype.constructor = $c_sci_WrappedString$;
/** @constructor */
function $h_sci_WrappedString$() {
  /*<skip>*/
}
$h_sci_WrappedString$.prototype = $c_sci_WrappedString$.prototype;
$c_sci_WrappedString$.prototype.init___ = (function() {
  return this
});
$c_sci_WrappedString$.prototype.newBuilder__scm_Builder = (function() {
  var this$2 = new $c_scm_StringBuilder().init___();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$2) {
      var x = $as_T(x$2);
      return new $c_sci_WrappedString().init___T(x)
    })
  })(this));
  return new $c_scm_Builder$$anon$1().init___scm_Builder__F1(this$2, f)
});
var $d_sci_WrappedString$ = new $TypeData().initClass({
  sci_WrappedString$: 0
}, false, "scala.collection.immutable.WrappedString$", {
  sci_WrappedString$: 1,
  O: 1
});
$c_sci_WrappedString$.prototype.$classData = $d_sci_WrappedString$;
var $n_sci_WrappedString$ = (void 0);
function $m_sci_WrappedString$() {
  if ((!$n_sci_WrappedString$)) {
    $n_sci_WrappedString$ = new $c_sci_WrappedString$().init___()
  };
  return $n_sci_WrappedString$
}
/** @constructor */
function $c_scm_ArrayOps$ofBoolean$() {
  $c_O.call(this)
}
$c_scm_ArrayOps$ofBoolean$.prototype = new $h_O();
$c_scm_ArrayOps$ofBoolean$.prototype.constructor = $c_scm_ArrayOps$ofBoolean$;
/** @constructor */
function $h_scm_ArrayOps$ofBoolean$() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofBoolean$.prototype = $c_scm_ArrayOps$ofBoolean$.prototype;
$c_scm_ArrayOps$ofBoolean$.prototype.init___ = (function() {
  return this
});
$c_scm_ArrayOps$ofBoolean$.prototype.equals$extension__AZ__O__Z = (function($$this, x$1) {
  if ($is_scm_ArrayOps$ofBoolean(x$1)) {
    var ofBoolean$1 = ((x$1 === null) ? null : $as_scm_ArrayOps$ofBoolean(x$1).repr$1);
    return ($$this === ofBoolean$1)
  } else {
    return false
  }
});
var $d_scm_ArrayOps$ofBoolean$ = new $TypeData().initClass({
  scm_ArrayOps$ofBoolean$: 0
}, false, "scala.collection.mutable.ArrayOps$ofBoolean$", {
  scm_ArrayOps$ofBoolean$: 1,
  O: 1
});
$c_scm_ArrayOps$ofBoolean$.prototype.$classData = $d_scm_ArrayOps$ofBoolean$;
var $n_scm_ArrayOps$ofBoolean$ = (void 0);
function $m_scm_ArrayOps$ofBoolean$() {
  if ((!$n_scm_ArrayOps$ofBoolean$)) {
    $n_scm_ArrayOps$ofBoolean$ = new $c_scm_ArrayOps$ofBoolean$().init___()
  };
  return $n_scm_ArrayOps$ofBoolean$
}
/** @constructor */
function $c_scm_ArrayOps$ofByte$() {
  $c_O.call(this)
}
$c_scm_ArrayOps$ofByte$.prototype = new $h_O();
$c_scm_ArrayOps$ofByte$.prototype.constructor = $c_scm_ArrayOps$ofByte$;
/** @constructor */
function $h_scm_ArrayOps$ofByte$() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofByte$.prototype = $c_scm_ArrayOps$ofByte$.prototype;
$c_scm_ArrayOps$ofByte$.prototype.init___ = (function() {
  return this
});
$c_scm_ArrayOps$ofByte$.prototype.equals$extension__AB__O__Z = (function($$this, x$1) {
  if ($is_scm_ArrayOps$ofByte(x$1)) {
    var ofByte$1 = ((x$1 === null) ? null : $as_scm_ArrayOps$ofByte(x$1).repr$1);
    return ($$this === ofByte$1)
  } else {
    return false
  }
});
var $d_scm_ArrayOps$ofByte$ = new $TypeData().initClass({
  scm_ArrayOps$ofByte$: 0
}, false, "scala.collection.mutable.ArrayOps$ofByte$", {
  scm_ArrayOps$ofByte$: 1,
  O: 1
});
$c_scm_ArrayOps$ofByte$.prototype.$classData = $d_scm_ArrayOps$ofByte$;
var $n_scm_ArrayOps$ofByte$ = (void 0);
function $m_scm_ArrayOps$ofByte$() {
  if ((!$n_scm_ArrayOps$ofByte$)) {
    $n_scm_ArrayOps$ofByte$ = new $c_scm_ArrayOps$ofByte$().init___()
  };
  return $n_scm_ArrayOps$ofByte$
}
/** @constructor */
function $c_scm_ArrayOps$ofChar$() {
  $c_O.call(this)
}
$c_scm_ArrayOps$ofChar$.prototype = new $h_O();
$c_scm_ArrayOps$ofChar$.prototype.constructor = $c_scm_ArrayOps$ofChar$;
/** @constructor */
function $h_scm_ArrayOps$ofChar$() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofChar$.prototype = $c_scm_ArrayOps$ofChar$.prototype;
$c_scm_ArrayOps$ofChar$.prototype.init___ = (function() {
  return this
});
$c_scm_ArrayOps$ofChar$.prototype.equals$extension__AC__O__Z = (function($$this, x$1) {
  if ($is_scm_ArrayOps$ofChar(x$1)) {
    var ofChar$1 = ((x$1 === null) ? null : $as_scm_ArrayOps$ofChar(x$1).repr$1);
    return ($$this === ofChar$1)
  } else {
    return false
  }
});
var $d_scm_ArrayOps$ofChar$ = new $TypeData().initClass({
  scm_ArrayOps$ofChar$: 0
}, false, "scala.collection.mutable.ArrayOps$ofChar$", {
  scm_ArrayOps$ofChar$: 1,
  O: 1
});
$c_scm_ArrayOps$ofChar$.prototype.$classData = $d_scm_ArrayOps$ofChar$;
var $n_scm_ArrayOps$ofChar$ = (void 0);
function $m_scm_ArrayOps$ofChar$() {
  if ((!$n_scm_ArrayOps$ofChar$)) {
    $n_scm_ArrayOps$ofChar$ = new $c_scm_ArrayOps$ofChar$().init___()
  };
  return $n_scm_ArrayOps$ofChar$
}
/** @constructor */
function $c_scm_ArrayOps$ofDouble$() {
  $c_O.call(this)
}
$c_scm_ArrayOps$ofDouble$.prototype = new $h_O();
$c_scm_ArrayOps$ofDouble$.prototype.constructor = $c_scm_ArrayOps$ofDouble$;
/** @constructor */
function $h_scm_ArrayOps$ofDouble$() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofDouble$.prototype = $c_scm_ArrayOps$ofDouble$.prototype;
$c_scm_ArrayOps$ofDouble$.prototype.init___ = (function() {
  return this
});
$c_scm_ArrayOps$ofDouble$.prototype.equals$extension__AD__O__Z = (function($$this, x$1) {
  if ($is_scm_ArrayOps$ofDouble(x$1)) {
    var ofDouble$1 = ((x$1 === null) ? null : $as_scm_ArrayOps$ofDouble(x$1).repr$1);
    return ($$this === ofDouble$1)
  } else {
    return false
  }
});
var $d_scm_ArrayOps$ofDouble$ = new $TypeData().initClass({
  scm_ArrayOps$ofDouble$: 0
}, false, "scala.collection.mutable.ArrayOps$ofDouble$", {
  scm_ArrayOps$ofDouble$: 1,
  O: 1
});
$c_scm_ArrayOps$ofDouble$.prototype.$classData = $d_scm_ArrayOps$ofDouble$;
var $n_scm_ArrayOps$ofDouble$ = (void 0);
function $m_scm_ArrayOps$ofDouble$() {
  if ((!$n_scm_ArrayOps$ofDouble$)) {
    $n_scm_ArrayOps$ofDouble$ = new $c_scm_ArrayOps$ofDouble$().init___()
  };
  return $n_scm_ArrayOps$ofDouble$
}
/** @constructor */
function $c_scm_ArrayOps$ofFloat$() {
  $c_O.call(this)
}
$c_scm_ArrayOps$ofFloat$.prototype = new $h_O();
$c_scm_ArrayOps$ofFloat$.prototype.constructor = $c_scm_ArrayOps$ofFloat$;
/** @constructor */
function $h_scm_ArrayOps$ofFloat$() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofFloat$.prototype = $c_scm_ArrayOps$ofFloat$.prototype;
$c_scm_ArrayOps$ofFloat$.prototype.init___ = (function() {
  return this
});
$c_scm_ArrayOps$ofFloat$.prototype.equals$extension__AF__O__Z = (function($$this, x$1) {
  if ($is_scm_ArrayOps$ofFloat(x$1)) {
    var ofFloat$1 = ((x$1 === null) ? null : $as_scm_ArrayOps$ofFloat(x$1).repr$1);
    return ($$this === ofFloat$1)
  } else {
    return false
  }
});
var $d_scm_ArrayOps$ofFloat$ = new $TypeData().initClass({
  scm_ArrayOps$ofFloat$: 0
}, false, "scala.collection.mutable.ArrayOps$ofFloat$", {
  scm_ArrayOps$ofFloat$: 1,
  O: 1
});
$c_scm_ArrayOps$ofFloat$.prototype.$classData = $d_scm_ArrayOps$ofFloat$;
var $n_scm_ArrayOps$ofFloat$ = (void 0);
function $m_scm_ArrayOps$ofFloat$() {
  if ((!$n_scm_ArrayOps$ofFloat$)) {
    $n_scm_ArrayOps$ofFloat$ = new $c_scm_ArrayOps$ofFloat$().init___()
  };
  return $n_scm_ArrayOps$ofFloat$
}
/** @constructor */
function $c_scm_ArrayOps$ofInt$() {
  $c_O.call(this)
}
$c_scm_ArrayOps$ofInt$.prototype = new $h_O();
$c_scm_ArrayOps$ofInt$.prototype.constructor = $c_scm_ArrayOps$ofInt$;
/** @constructor */
function $h_scm_ArrayOps$ofInt$() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofInt$.prototype = $c_scm_ArrayOps$ofInt$.prototype;
$c_scm_ArrayOps$ofInt$.prototype.init___ = (function() {
  return this
});
$c_scm_ArrayOps$ofInt$.prototype.equals$extension__AI__O__Z = (function($$this, x$1) {
  if ($is_scm_ArrayOps$ofInt(x$1)) {
    var ofInt$1 = ((x$1 === null) ? null : $as_scm_ArrayOps$ofInt(x$1).repr$1);
    return ($$this === ofInt$1)
  } else {
    return false
  }
});
var $d_scm_ArrayOps$ofInt$ = new $TypeData().initClass({
  scm_ArrayOps$ofInt$: 0
}, false, "scala.collection.mutable.ArrayOps$ofInt$", {
  scm_ArrayOps$ofInt$: 1,
  O: 1
});
$c_scm_ArrayOps$ofInt$.prototype.$classData = $d_scm_ArrayOps$ofInt$;
var $n_scm_ArrayOps$ofInt$ = (void 0);
function $m_scm_ArrayOps$ofInt$() {
  if ((!$n_scm_ArrayOps$ofInt$)) {
    $n_scm_ArrayOps$ofInt$ = new $c_scm_ArrayOps$ofInt$().init___()
  };
  return $n_scm_ArrayOps$ofInt$
}
/** @constructor */
function $c_scm_ArrayOps$ofLong$() {
  $c_O.call(this)
}
$c_scm_ArrayOps$ofLong$.prototype = new $h_O();
$c_scm_ArrayOps$ofLong$.prototype.constructor = $c_scm_ArrayOps$ofLong$;
/** @constructor */
function $h_scm_ArrayOps$ofLong$() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofLong$.prototype = $c_scm_ArrayOps$ofLong$.prototype;
$c_scm_ArrayOps$ofLong$.prototype.init___ = (function() {
  return this
});
$c_scm_ArrayOps$ofLong$.prototype.equals$extension__AJ__O__Z = (function($$this, x$1) {
  if ($is_scm_ArrayOps$ofLong(x$1)) {
    var ofLong$1 = ((x$1 === null) ? null : $as_scm_ArrayOps$ofLong(x$1).repr$1);
    return ($$this === ofLong$1)
  } else {
    return false
  }
});
var $d_scm_ArrayOps$ofLong$ = new $TypeData().initClass({
  scm_ArrayOps$ofLong$: 0
}, false, "scala.collection.mutable.ArrayOps$ofLong$", {
  scm_ArrayOps$ofLong$: 1,
  O: 1
});
$c_scm_ArrayOps$ofLong$.prototype.$classData = $d_scm_ArrayOps$ofLong$;
var $n_scm_ArrayOps$ofLong$ = (void 0);
function $m_scm_ArrayOps$ofLong$() {
  if ((!$n_scm_ArrayOps$ofLong$)) {
    $n_scm_ArrayOps$ofLong$ = new $c_scm_ArrayOps$ofLong$().init___()
  };
  return $n_scm_ArrayOps$ofLong$
}
/** @constructor */
function $c_scm_ArrayOps$ofRef$() {
  $c_O.call(this)
}
$c_scm_ArrayOps$ofRef$.prototype = new $h_O();
$c_scm_ArrayOps$ofRef$.prototype.constructor = $c_scm_ArrayOps$ofRef$;
/** @constructor */
function $h_scm_ArrayOps$ofRef$() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofRef$.prototype = $c_scm_ArrayOps$ofRef$.prototype;
$c_scm_ArrayOps$ofRef$.prototype.init___ = (function() {
  return this
});
$c_scm_ArrayOps$ofRef$.prototype.equals$extension__AO__O__Z = (function($$this, x$1) {
  if ($is_scm_ArrayOps$ofRef(x$1)) {
    var ofRef$1 = ((x$1 === null) ? null : $as_scm_ArrayOps$ofRef(x$1).repr$1);
    return ($$this === ofRef$1)
  } else {
    return false
  }
});
var $d_scm_ArrayOps$ofRef$ = new $TypeData().initClass({
  scm_ArrayOps$ofRef$: 0
}, false, "scala.collection.mutable.ArrayOps$ofRef$", {
  scm_ArrayOps$ofRef$: 1,
  O: 1
});
$c_scm_ArrayOps$ofRef$.prototype.$classData = $d_scm_ArrayOps$ofRef$;
var $n_scm_ArrayOps$ofRef$ = (void 0);
function $m_scm_ArrayOps$ofRef$() {
  if ((!$n_scm_ArrayOps$ofRef$)) {
    $n_scm_ArrayOps$ofRef$ = new $c_scm_ArrayOps$ofRef$().init___()
  };
  return $n_scm_ArrayOps$ofRef$
}
/** @constructor */
function $c_scm_ArrayOps$ofShort$() {
  $c_O.call(this)
}
$c_scm_ArrayOps$ofShort$.prototype = new $h_O();
$c_scm_ArrayOps$ofShort$.prototype.constructor = $c_scm_ArrayOps$ofShort$;
/** @constructor */
function $h_scm_ArrayOps$ofShort$() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofShort$.prototype = $c_scm_ArrayOps$ofShort$.prototype;
$c_scm_ArrayOps$ofShort$.prototype.init___ = (function() {
  return this
});
$c_scm_ArrayOps$ofShort$.prototype.equals$extension__AS__O__Z = (function($$this, x$1) {
  if ($is_scm_ArrayOps$ofShort(x$1)) {
    var ofShort$1 = ((x$1 === null) ? null : $as_scm_ArrayOps$ofShort(x$1).repr$1);
    return ($$this === ofShort$1)
  } else {
    return false
  }
});
var $d_scm_ArrayOps$ofShort$ = new $TypeData().initClass({
  scm_ArrayOps$ofShort$: 0
}, false, "scala.collection.mutable.ArrayOps$ofShort$", {
  scm_ArrayOps$ofShort$: 1,
  O: 1
});
$c_scm_ArrayOps$ofShort$.prototype.$classData = $d_scm_ArrayOps$ofShort$;
var $n_scm_ArrayOps$ofShort$ = (void 0);
function $m_scm_ArrayOps$ofShort$() {
  if ((!$n_scm_ArrayOps$ofShort$)) {
    $n_scm_ArrayOps$ofShort$ = new $c_scm_ArrayOps$ofShort$().init___()
  };
  return $n_scm_ArrayOps$ofShort$
}
/** @constructor */
function $c_scm_ArrayOps$ofUnit$() {
  $c_O.call(this)
}
$c_scm_ArrayOps$ofUnit$.prototype = new $h_O();
$c_scm_ArrayOps$ofUnit$.prototype.constructor = $c_scm_ArrayOps$ofUnit$;
/** @constructor */
function $h_scm_ArrayOps$ofUnit$() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofUnit$.prototype = $c_scm_ArrayOps$ofUnit$.prototype;
$c_scm_ArrayOps$ofUnit$.prototype.init___ = (function() {
  return this
});
$c_scm_ArrayOps$ofUnit$.prototype.equals$extension__Asr_BoxedUnit__O__Z = (function($$this, x$1) {
  if ($is_scm_ArrayOps$ofUnit(x$1)) {
    var ofUnit$1 = ((x$1 === null) ? null : $as_scm_ArrayOps$ofUnit(x$1).repr$1);
    return ($$this === ofUnit$1)
  } else {
    return false
  }
});
var $d_scm_ArrayOps$ofUnit$ = new $TypeData().initClass({
  scm_ArrayOps$ofUnit$: 0
}, false, "scala.collection.mutable.ArrayOps$ofUnit$", {
  scm_ArrayOps$ofUnit$: 1,
  O: 1
});
$c_scm_ArrayOps$ofUnit$.prototype.$classData = $d_scm_ArrayOps$ofUnit$;
var $n_scm_ArrayOps$ofUnit$ = (void 0);
function $m_scm_ArrayOps$ofUnit$() {
  if ((!$n_scm_ArrayOps$ofUnit$)) {
    $n_scm_ArrayOps$ofUnit$ = new $c_scm_ArrayOps$ofUnit$().init___()
  };
  return $n_scm_ArrayOps$ofUnit$
}
/** @constructor */
function $c_scm_WrappedArray$() {
  $c_O.call(this);
  this.EmptyWrappedArray$1 = null
}
$c_scm_WrappedArray$.prototype = new $h_O();
$c_scm_WrappedArray$.prototype.constructor = $c_scm_WrappedArray$;
/** @constructor */
function $h_scm_WrappedArray$() {
  /*<skip>*/
}
$h_scm_WrappedArray$.prototype = $c_scm_WrappedArray$.prototype;
$c_scm_WrappedArray$.prototype.init___ = (function() {
  $n_scm_WrappedArray$ = this;
  this.EmptyWrappedArray$1 = new $c_scm_WrappedArray$ofRef().init___AO($newArrayObject($d_O.getArrayOf(), [0]));
  return this
});
$c_scm_WrappedArray$.prototype.make__O__scm_WrappedArray = (function(x) {
  if ((x === null)) {
    return null
  } else if ($isArrayOf_O(x, 1)) {
    var x3 = $asArrayOf_O(x, 1);
    return new $c_scm_WrappedArray$ofRef().init___AO(x3)
  } else if ($isArrayOf_I(x, 1)) {
    var x4 = $asArrayOf_I(x, 1);
    return new $c_scm_WrappedArray$ofInt().init___AI(x4)
  } else if ($isArrayOf_D(x, 1)) {
    var x5 = $asArrayOf_D(x, 1);
    return new $c_scm_WrappedArray$ofDouble().init___AD(x5)
  } else if ($isArrayOf_J(x, 1)) {
    var x6 = $asArrayOf_J(x, 1);
    return new $c_scm_WrappedArray$ofLong().init___AJ(x6)
  } else if ($isArrayOf_F(x, 1)) {
    var x7 = $asArrayOf_F(x, 1);
    return new $c_scm_WrappedArray$ofFloat().init___AF(x7)
  } else if ($isArrayOf_C(x, 1)) {
    var x8 = $asArrayOf_C(x, 1);
    return new $c_scm_WrappedArray$ofChar().init___AC(x8)
  } else if ($isArrayOf_B(x, 1)) {
    var x9 = $asArrayOf_B(x, 1);
    return new $c_scm_WrappedArray$ofByte().init___AB(x9)
  } else if ($isArrayOf_S(x, 1)) {
    var x10 = $asArrayOf_S(x, 1);
    return new $c_scm_WrappedArray$ofShort().init___AS(x10)
  } else if ($isArrayOf_Z(x, 1)) {
    var x11 = $asArrayOf_Z(x, 1);
    return new $c_scm_WrappedArray$ofBoolean().init___AZ(x11)
  } else if ($isArrayOf_sr_BoxedUnit(x, 1)) {
    var x12 = $asArrayOf_sr_BoxedUnit(x, 1);
    return new $c_scm_WrappedArray$ofUnit().init___Asr_BoxedUnit(x12)
  } else {
    throw new $c_s_MatchError().init___O(x)
  }
});
var $d_scm_WrappedArray$ = new $TypeData().initClass({
  scm_WrappedArray$: 0
}, false, "scala.collection.mutable.WrappedArray$", {
  scm_WrappedArray$: 1,
  O: 1
});
$c_scm_WrappedArray$.prototype.$classData = $d_scm_WrappedArray$;
var $n_scm_WrappedArray$ = (void 0);
function $m_scm_WrappedArray$() {
  if ((!$n_scm_WrappedArray$)) {
    $n_scm_WrappedArray$ = new $c_scm_WrappedArray$().init___()
  };
  return $n_scm_WrappedArray$
}
/** @constructor */
function $c_sjs_concurrent_JSExecutionContext$() {
  $c_O.call(this);
  this.runNow$1 = null;
  this.queue$1 = null
}
$c_sjs_concurrent_JSExecutionContext$.prototype = new $h_O();
$c_sjs_concurrent_JSExecutionContext$.prototype.constructor = $c_sjs_concurrent_JSExecutionContext$;
/** @constructor */
function $h_sjs_concurrent_JSExecutionContext$() {
  /*<skip>*/
}
$h_sjs_concurrent_JSExecutionContext$.prototype = $c_sjs_concurrent_JSExecutionContext$.prototype;
$c_sjs_concurrent_JSExecutionContext$.prototype.init___ = (function() {
  $n_sjs_concurrent_JSExecutionContext$ = this;
  this.runNow$1 = $m_sjs_concurrent_RunNowExecutionContext$();
  this.queue$1 = $m_sjs_concurrent_QueueExecutionContext$().apply__s_concurrent_ExecutionContextExecutor();
  return this
});
var $d_sjs_concurrent_JSExecutionContext$ = new $TypeData().initClass({
  sjs_concurrent_JSExecutionContext$: 0
}, false, "scala.scalajs.concurrent.JSExecutionContext$", {
  sjs_concurrent_JSExecutionContext$: 1,
  O: 1
});
$c_sjs_concurrent_JSExecutionContext$.prototype.$classData = $d_sjs_concurrent_JSExecutionContext$;
var $n_sjs_concurrent_JSExecutionContext$ = (void 0);
function $m_sjs_concurrent_JSExecutionContext$() {
  if ((!$n_sjs_concurrent_JSExecutionContext$)) {
    $n_sjs_concurrent_JSExecutionContext$ = new $c_sjs_concurrent_JSExecutionContext$().init___()
  };
  return $n_sjs_concurrent_JSExecutionContext$
}
/** @constructor */
function $c_sjs_concurrent_QueueExecutionContext$() {
  $c_O.call(this)
}
$c_sjs_concurrent_QueueExecutionContext$.prototype = new $h_O();
$c_sjs_concurrent_QueueExecutionContext$.prototype.constructor = $c_sjs_concurrent_QueueExecutionContext$;
/** @constructor */
function $h_sjs_concurrent_QueueExecutionContext$() {
  /*<skip>*/
}
$h_sjs_concurrent_QueueExecutionContext$.prototype = $c_sjs_concurrent_QueueExecutionContext$.prototype;
$c_sjs_concurrent_QueueExecutionContext$.prototype.init___ = (function() {
  return this
});
$c_sjs_concurrent_QueueExecutionContext$.prototype.apply__s_concurrent_ExecutionContextExecutor = (function() {
  var v = $g.Promise;
  if ((v === (void 0))) {
    return new $c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext().init___()
  } else {
    return new $c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext().init___()
  }
});
var $d_sjs_concurrent_QueueExecutionContext$ = new $TypeData().initClass({
  sjs_concurrent_QueueExecutionContext$: 0
}, false, "scala.scalajs.concurrent.QueueExecutionContext$", {
  sjs_concurrent_QueueExecutionContext$: 1,
  O: 1
});
$c_sjs_concurrent_QueueExecutionContext$.prototype.$classData = $d_sjs_concurrent_QueueExecutionContext$;
var $n_sjs_concurrent_QueueExecutionContext$ = (void 0);
function $m_sjs_concurrent_QueueExecutionContext$() {
  if ((!$n_sjs_concurrent_QueueExecutionContext$)) {
    $n_sjs_concurrent_QueueExecutionContext$ = new $c_sjs_concurrent_QueueExecutionContext$().init___()
  };
  return $n_sjs_concurrent_QueueExecutionContext$
}
/** @constructor */
function $c_sjs_js_JSConverters$JSRichGenTraversableOnce$() {
  $c_O.call(this)
}
$c_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype = new $h_O();
$c_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype.constructor = $c_sjs_js_JSConverters$JSRichGenTraversableOnce$;
/** @constructor */
function $h_sjs_js_JSConverters$JSRichGenTraversableOnce$() {
  /*<skip>*/
}
$h_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype = $c_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype;
$c_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype.init___ = (function() {
  return this
});
$c_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype.toJSArray$extension__sc_GenTraversableOnce__sjs_js_Array = (function($$this) {
  if ($is_sjs_js_ArrayOps($$this)) {
    var x2 = $as_sjs_js_ArrayOps($$this);
    return x2.scala$scalajs$js$ArrayOps$$array$f
  } else if ($is_sjs_js_WrappedArray($$this)) {
    var x3 = $as_sjs_js_WrappedArray($$this);
    return x3.array$6
  } else {
    var result = [];
    $$this.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, result$1) {
      return (function(x$2) {
        return $uI(result$1.push(x$2))
      })
    })(this, result)));
    return result
  }
});
var $d_sjs_js_JSConverters$JSRichGenTraversableOnce$ = new $TypeData().initClass({
  sjs_js_JSConverters$JSRichGenTraversableOnce$: 0
}, false, "scala.scalajs.js.JSConverters$JSRichGenTraversableOnce$", {
  sjs_js_JSConverters$JSRichGenTraversableOnce$: 1,
  O: 1
});
$c_sjs_js_JSConverters$JSRichGenTraversableOnce$.prototype.$classData = $d_sjs_js_JSConverters$JSRichGenTraversableOnce$;
var $n_sjs_js_JSConverters$JSRichGenTraversableOnce$ = (void 0);
function $m_sjs_js_JSConverters$JSRichGenTraversableOnce$() {
  if ((!$n_sjs_js_JSConverters$JSRichGenTraversableOnce$)) {
    $n_sjs_js_JSConverters$JSRichGenTraversableOnce$ = new $c_sjs_js_JSConverters$JSRichGenTraversableOnce$().init___()
  };
  return $n_sjs_js_JSConverters$JSRichGenTraversableOnce$
}
/** @constructor */
function $c_sjs_js_WrappedDictionary$Cache$() {
  $c_O.call(this);
  this.safeHasOwnProperty$1 = null
}
$c_sjs_js_WrappedDictionary$Cache$.prototype = new $h_O();
$c_sjs_js_WrappedDictionary$Cache$.prototype.constructor = $c_sjs_js_WrappedDictionary$Cache$;
/** @constructor */
function $h_sjs_js_WrappedDictionary$Cache$() {
  /*<skip>*/
}
$h_sjs_js_WrappedDictionary$Cache$.prototype = $c_sjs_js_WrappedDictionary$Cache$.prototype;
$c_sjs_js_WrappedDictionary$Cache$.prototype.init___ = (function() {
  $n_sjs_js_WrappedDictionary$Cache$ = this;
  this.safeHasOwnProperty$1 = $g.Object.prototype.hasOwnProperty;
  return this
});
var $d_sjs_js_WrappedDictionary$Cache$ = new $TypeData().initClass({
  sjs_js_WrappedDictionary$Cache$: 0
}, false, "scala.scalajs.js.WrappedDictionary$Cache$", {
  sjs_js_WrappedDictionary$Cache$: 1,
  O: 1
});
$c_sjs_js_WrappedDictionary$Cache$.prototype.$classData = $d_sjs_js_WrappedDictionary$Cache$;
var $n_sjs_js_WrappedDictionary$Cache$ = (void 0);
function $m_sjs_js_WrappedDictionary$Cache$() {
  if ((!$n_sjs_js_WrappedDictionary$Cache$)) {
    $n_sjs_js_WrappedDictionary$Cache$ = new $c_sjs_js_WrappedDictionary$Cache$().init___()
  };
  return $n_sjs_js_WrappedDictionary$Cache$
}
/** @constructor */
function $c_sjsr_Bits$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = false;
  this.arrayBuffer$1 = null;
  this.int32Array$1 = null;
  this.float32Array$1 = null;
  this.float64Array$1 = null;
  this.areTypedArraysBigEndian$1 = false;
  this.highOffset$1 = 0;
  this.lowOffset$1 = 0
}
$c_sjsr_Bits$.prototype = new $h_O();
$c_sjsr_Bits$.prototype.constructor = $c_sjsr_Bits$;
/** @constructor */
function $h_sjsr_Bits$() {
  /*<skip>*/
}
$h_sjsr_Bits$.prototype = $c_sjsr_Bits$.prototype;
$c_sjsr_Bits$.prototype.init___ = (function() {
  $n_sjsr_Bits$ = this;
  var x = ((($g.ArrayBuffer && $g.Int32Array) && $g.Float32Array) && $g.Float64Array);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = $uZ((!(!x)));
  this.arrayBuffer$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.ArrayBuffer(8) : null);
  this.int32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Int32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float64Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float64Array(this.arrayBuffer$1, 0, 1) : null);
  if ((!this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f)) {
    var jsx$1 = true
  } else {
    this.int32Array$1[0] = 16909060;
    var jsx$1 = ($uB(new $g.Int8Array(this.arrayBuffer$1, 0, 8)[0]) === 1)
  };
  this.areTypedArraysBigEndian$1 = jsx$1;
  this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
  this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
  return this
});
$c_sjsr_Bits$.prototype.numberHashCode__D__I = (function(value) {
  var iv = $uI((value | 0));
  if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
    return iv
  } else {
    var t = this.doubleToLongBits__D__J(value);
    var lo = t.lo$2;
    var hi = t.hi$2;
    return (lo ^ hi)
  }
});
$c_sjsr_Bits$.prototype.doubleToLongBitsPolyfill__p1__D__J = (function(value) {
  if ((value !== value)) {
    var _3 = $uD($g.Math.pow(2.0, 51));
    var x1_$_$$und1$1 = false;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = _3
  } else if (((value === Infinity) || (value === (-Infinity)))) {
    var _1 = (value < 0);
    var x1_$_$$und1$1 = _1;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = 0.0
  } else if ((value === 0.0)) {
    var _1$1 = ((1 / value) === (-Infinity));
    var x1_$_$$und1$1 = _1$1;
    var x1_$_$$und2$1 = 0;
    var x1_$_$$und3$1 = 0.0
  } else {
    var s = (value < 0);
    var av = (s ? (-value) : value);
    if ((av >= $uD($g.Math.pow(2.0, (-1022))))) {
      var twoPowFbits = $uD($g.Math.pow(2.0, 52));
      var a = ($uD($g.Math.log(av)) / 0.6931471805599453);
      var x = $uD($g.Math.floor(a));
      var a$1 = $uI((x | 0));
      var e = ((a$1 < 1023) ? a$1 : 1023);
      var b = e;
      var twoPowE = $uD($g.Math.pow(2.0, b));
      if ((twoPowE > av)) {
        e = (((-1) + e) | 0);
        twoPowE = (twoPowE / 2)
      };
      var n = ((av / twoPowE) * twoPowFbits);
      var w = $uD($g.Math.floor(n));
      var f = (n - w);
      var f$1 = ((f < 0.5) ? w : ((f > 0.5) ? (1 + w) : (((w % 2) !== 0) ? (1 + w) : w)));
      if (((f$1 / twoPowFbits) >= 2)) {
        e = ((1 + e) | 0);
        f$1 = 1.0
      };
      if ((e > 1023)) {
        e = 2047;
        f$1 = 0.0
      } else {
        e = ((1023 + e) | 0);
        f$1 = (f$1 - twoPowFbits)
      };
      var _2 = e;
      var _3$1 = f$1;
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = _2;
      var x1_$_$$und3$1 = _3$1
    } else {
      var n$1 = (av / $uD($g.Math.pow(2.0, (-1074))));
      var w$1 = $uD($g.Math.floor(n$1));
      var f$2 = (n$1 - w$1);
      var _3$2 = ((f$2 < 0.5) ? w$1 : ((f$2 > 0.5) ? (1 + w$1) : (((w$1 % 2) !== 0) ? (1 + w$1) : w$1)));
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = 0;
      var x1_$_$$und3$1 = _3$2
    }
  };
  var s$1 = $uZ(x1_$_$$und1$1);
  var e$1 = $uI(x1_$_$$und2$1);
  var f$3 = $uD(x1_$_$$und3$1);
  var x$1 = (f$3 / 4.294967296E9);
  var hif = $uI((x$1 | 0));
  var hi = (((s$1 ? (-2147483648) : 0) | (e$1 << 20)) | hif);
  var lo = $uI((f$3 | 0));
  return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
});
$c_sjsr_Bits$.prototype.doubleToLongBits__D__J = (function(value) {
  if (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f) {
    this.float64Array$1[0] = value;
    var value$1 = $uI(this.int32Array$1[this.highOffset$1]);
    var value$2 = $uI(this.int32Array$1[this.lowOffset$1]);
    return new $c_sjsr_RuntimeLong().init___I__I(value$2, value$1)
  } else {
    return this.doubleToLongBitsPolyfill__p1__D__J(value)
  }
});
var $d_sjsr_Bits$ = new $TypeData().initClass({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", {
  sjsr_Bits$: 1,
  O: 1
});
$c_sjsr_Bits$.prototype.$classData = $d_sjsr_Bits$;
var $n_sjsr_Bits$ = (void 0);
function $m_sjsr_Bits$() {
  if ((!$n_sjsr_Bits$)) {
    $n_sjsr_Bits$ = new $c_sjsr_Bits$().init___()
  };
  return $n_sjsr_Bits$
}
/** @constructor */
function $c_sjsr_RuntimeString$() {
  $c_O.call(this);
  this.CASE$undINSENSITIVE$undORDER$1 = null;
  this.bitmap$0$1 = false
}
$c_sjsr_RuntimeString$.prototype = new $h_O();
$c_sjsr_RuntimeString$.prototype.constructor = $c_sjsr_RuntimeString$;
/** @constructor */
function $h_sjsr_RuntimeString$() {
  /*<skip>*/
}
$h_sjsr_RuntimeString$.prototype = $c_sjsr_RuntimeString$.prototype;
$c_sjsr_RuntimeString$.prototype.init___ = (function() {
  return this
});
$c_sjsr_RuntimeString$.prototype.indexOf__T__I__I__I = (function(thiz, ch, fromIndex) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz.indexOf(str, fromIndex))
});
$c_sjsr_RuntimeString$.prototype.split__T__T__I__AT = (function(thiz, regex, limit) {
  if ((thiz === null)) {
    throw new $c_jl_NullPointerException().init___()
  };
  var this$1 = $m_ju_regex_Pattern$();
  return this$1.compile__T__I__ju_regex_Pattern(regex, 0).split__jl_CharSequence__I__AT(thiz, limit)
});
$c_sjsr_RuntimeString$.prototype.toCharArray__T__AC = (function(thiz) {
  var length = $uI(thiz.length);
  var result = $newArrayObject($d_C.getArrayOf(), [length]);
  var i = 0;
  while ((i < length)) {
    var jsx$1 = i;
    var index = i;
    result.set(jsx$1, (65535 & $uI(thiz.charCodeAt(index))));
    i = ((1 + i) | 0)
  };
  return result
});
$c_sjsr_RuntimeString$.prototype.indexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz.indexOf(str))
});
$c_sjsr_RuntimeString$.prototype.fromCodePoint__p1__I__T = (function(codePoint) {
  if ((((-65536) & codePoint) === 0)) {
    return $as_T($g.String.fromCharCode(codePoint))
  } else if (((codePoint < 0) || (codePoint > 1114111))) {
    throw new $c_jl_IllegalArgumentException().init___()
  } else {
    var offsetCp = (((-65536) + codePoint) | 0);
    return $as_T($g.String.fromCharCode((55296 | (offsetCp >> 10)), (56320 | (1023 & offsetCp))))
  }
});
$c_sjsr_RuntimeString$.prototype.hashCode__T__I = (function(thiz) {
  var res = 0;
  var mul = 1;
  var i = (((-1) + $uI(thiz.length)) | 0);
  while ((i >= 0)) {
    var jsx$1 = res;
    var index = i;
    res = ((jsx$1 + $imul((65535 & $uI(thiz.charCodeAt(index))), mul)) | 0);
    mul = $imul(31, mul);
    i = (((-1) + i) | 0)
  };
  return res
});
var $d_sjsr_RuntimeString$ = new $TypeData().initClass({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  sjsr_RuntimeString$: 1,
  O: 1
});
$c_sjsr_RuntimeString$.prototype.$classData = $d_sjsr_RuntimeString$;
var $n_sjsr_RuntimeString$ = (void 0);
function $m_sjsr_RuntimeString$() {
  if ((!$n_sjsr_RuntimeString$)) {
    $n_sjsr_RuntimeString$ = new $c_sjsr_RuntimeString$().init___()
  };
  return $n_sjsr_RuntimeString$
}
/** @constructor */
function $c_sjsr_StackTrace$() {
  $c_O.call(this);
  this.isRhino$1 = false;
  this.decompressedClasses$1 = null;
  this.decompressedPrefixes$1 = null;
  this.compressedPrefixes$1 = null;
  this.bitmap$0$1 = 0
}
$c_sjsr_StackTrace$.prototype = new $h_O();
$c_sjsr_StackTrace$.prototype.constructor = $c_sjsr_StackTrace$;
/** @constructor */
function $h_sjsr_StackTrace$() {
  /*<skip>*/
}
$h_sjsr_StackTrace$.prototype = $c_sjsr_StackTrace$.prototype;
$c_sjsr_StackTrace$.prototype.compressedPrefixes$lzycompute__p1__sjs_js_Array = (function() {
  if (((8 & this.bitmap$0$1) === 0)) {
    this.compressedPrefixes$1 = $g.Object.keys(this.decompressedPrefixes__p1__sjs_js_Dictionary());
    this.bitmap$0$1 = (8 | this.bitmap$0$1)
  };
  return this.compressedPrefixes$1
});
$c_sjsr_StackTrace$.prototype.extractFirefox__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var x = $as_T(e.stack);
  var jsx$2 = x.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("(?:\\n@:0)?\\s+$", "m"), "");
  var x$1 = $as_T(jsx$2);
  var jsx$1 = x$1.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^(?:\\((\\S*)\\))?@", "gm"), "{anonymous}($1)@");
  var x$2 = $as_T(jsx$1);
  return x$2.split("\n")
});
$c_sjsr_StackTrace$.prototype.extractOpera10a__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var lineRE = $m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("Line (\\d+).*script (?:in )?(\\S+)(?:: In function (\\S+))?$", "i");
  var x = $as_T(e.stacktrace);
  var lines = x.split("\n");
  var result = [];
  var i = 0;
  var len = $uI(lines.length);
  while ((i < len)) {
    var mtch = lineRE.exec($as_T(lines[i]));
    if ((mtch !== null)) {
      var value = mtch[3];
      var fnName = $as_T(((value === (void 0)) ? "{anonymous}" : value));
      var value$1 = mtch[2];
      if ((value$1 === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var value$2 = mtch[1];
      if ((value$2 === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var jsx$1 = result.push(((((fnName + "()@") + value$1) + ":") + value$2));
      $uI(jsx$1)
    };
    i = ((2 + i) | 0)
  };
  return result
});
$c_sjsr_StackTrace$.prototype.init___ = (function() {
  return this
});
$c_sjsr_StackTrace$.prototype.isRhino__p1__Z = (function() {
  return (((1 & this.bitmap$0$1) === 0) ? this.isRhino$lzycompute__p1__Z() : this.isRhino$1)
});
$c_sjsr_StackTrace$.prototype.decodeClassName__p1__T__T = (function(encodedName) {
  var encoded = (((65535 & $uI(encodedName.charCodeAt(0))) === 36) ? $as_T(encodedName.substring(1)) : encodedName);
  var dict = this.decompressedClasses__p1__sjs_js_Dictionary();
  if ($uZ($m_sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1.call(dict, encoded))) {
    var dict$1 = this.decompressedClasses__p1__sjs_js_Dictionary();
    if ((!$uZ($m_sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1.call(dict$1, encoded)))) {
      throw new $c_ju_NoSuchElementException().init___T(("key not found: " + encoded))
    };
    var base = $as_T(dict$1[encoded])
  } else {
    var base = this.loop$1__p1__I__T__T(0, encoded)
  };
  var thiz = $as_T(base.split("_").join("."));
  return $as_T(thiz.split("$und").join("_"))
});
$c_sjsr_StackTrace$.prototype.extractOpera10b__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var lineRE = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^(.*)@(.+):(\\d+)$");
  var x = $as_T(e.stacktrace);
  var lines = x.split("\n");
  var result = [];
  var i = 0;
  var len = $uI(lines.length);
  while ((i < len)) {
    var mtch = lineRE.exec($as_T(lines[i]));
    if ((mtch !== null)) {
      var value = mtch[1];
      if ((value === (void 0))) {
        var fnName = "global code"
      } else {
        var x$3 = $as_T(value);
        var fnName = (x$3 + "()")
      };
      var value$1 = mtch[2];
      if ((value$1 === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var value$2 = mtch[3];
      if ((value$2 === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var jsx$1 = result.push(((((fnName + "@") + value$1) + ":") + value$2));
      $uI(jsx$1)
    };
    i = ((1 + i) | 0)
  };
  return result
});
$c_sjsr_StackTrace$.prototype.extractChrome__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var x = ($as_T(e.stack) + "\n");
  var jsx$6 = x.replace($m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^[\\s\\S]+?\\s+at\\s+"), " at ");
  var x$1 = $as_T(jsx$6);
  var jsx$5 = x$1.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^\\s+(at eval )?at\\s+", "gm"), "");
  var x$2 = $as_T(jsx$5);
  var jsx$4 = x$2.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^([^\\(]+?)([\\n])", "gm"), "{anonymous}() ($1)$2");
  var x$3 = $as_T(jsx$4);
  var jsx$3 = x$3.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^Object.<anonymous>\\s*\\(([^\\)]+)\\)", "gm"), "{anonymous}() ($1)");
  var x$4 = $as_T(jsx$3);
  var jsx$2 = x$4.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^([^\\(]+|\\{anonymous\\}\\(\\)) \\((.+)\\)$", "gm"), "$1@$2");
  var x$5 = $as_T(jsx$2);
  var jsx$1 = x$5.split("\n");
  return jsx$1.slice(0, (-1))
});
$c_sjsr_StackTrace$.prototype.extract__sjs_js_Dynamic__Ajl_StackTraceElement = (function(stackdata) {
  var lines = this.normalizeStackTraceLines__p1__sjs_js_Dynamic__sjs_js_Array(stackdata);
  return this.normalizedLinesToStackTrace__p1__sjs_js_Array__Ajl_StackTraceElement(lines)
});
$c_sjsr_StackTrace$.prototype.compressedPrefixes__p1__sjs_js_Array = (function() {
  return (((8 & this.bitmap$0$1) === 0) ? this.compressedPrefixes$lzycompute__p1__sjs_js_Array() : this.compressedPrefixes$1)
});
$c_sjsr_StackTrace$.prototype.decompressedClasses__p1__sjs_js_Dictionary = (function() {
  return (((2 & this.bitmap$0$1) === 0) ? this.decompressedClasses$lzycompute__p1__sjs_js_Dictionary() : this.decompressedClasses$1)
});
$c_sjsr_StackTrace$.prototype.extractClassMethod__p1__T__T2 = (function(functionName) {
  var PatC = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^(?:Object\\.|\\[object Object\\]\\.)?(?:ScalaJS\\.c\\.|\\$c_)([^\\.]+)(?:\\.prototype)?\\.([^\\.]+)$");
  var PatS = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^(?:Object\\.|\\[object Object\\]\\.)?(?:ScalaJS\\.(?:s|f)\\.|\\$(?:s|f)_)((?:_[^_]|[^_])+)__([^\\.]+)$");
  var PatM = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^(?:Object\\.|\\[object Object\\]\\.)?(?:ScalaJS\\.m\\.|\\$m_)([^\\.]+)$");
  var isModule = false;
  var mtch = PatC.exec(functionName);
  if ((mtch === null)) {
    mtch = PatS.exec(functionName);
    if ((mtch === null)) {
      mtch = PatM.exec(functionName);
      isModule = true
    }
  };
  if ((mtch !== null)) {
    var value = mtch[1];
    if ((value === (void 0))) {
      throw new $c_ju_NoSuchElementException().init___T("undefined.get")
    };
    var className = this.decodeClassName__p1__T__T($as_T(value));
    if (isModule) {
      var methodName = "<clinit>"
    } else {
      var value$1 = mtch[2];
      if ((value$1 === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var methodName = this.decodeMethodName__p1__T__T($as_T(value$1))
    };
    return new $c_T2().init___O__O(className, methodName)
  } else {
    return new $c_T2().init___O__O("<jscode>", functionName)
  }
});
$c_sjsr_StackTrace$.prototype.isRhino$lzycompute__p1__Z = (function() {
  if (((1 & this.bitmap$0$1) === 0)) {
    this.isRhino$1 = this.liftedTree1$1__p1__Z();
    this.bitmap$0$1 = (1 | this.bitmap$0$1)
  };
  return this.isRhino$1
});
$c_sjsr_StackTrace$.prototype.decompressedPrefixes$lzycompute__p1__sjs_js_Dictionary = (function() {
  if (((4 & this.bitmap$0$1) === 0)) {
    this.decompressedPrefixes$1 = {
      "sjsr_": "scala_scalajs_runtime_",
      "sjs_": "scala_scalajs_",
      "sci_": "scala_collection_immutable_",
      "scm_": "scala_collection_mutable_",
      "scg_": "scala_collection_generic_",
      "sc_": "scala_collection_",
      "sr_": "scala_runtime_",
      "s_": "scala_",
      "jl_": "java_lang_",
      "ju_": "java_util_"
    };
    this.bitmap$0$1 = (4 | this.bitmap$0$1)
  };
  return this.decompressedPrefixes$1
});
$c_sjsr_StackTrace$.prototype.extract__jl_Throwable__Ajl_StackTraceElement = (function(throwable) {
  return this.extract__sjs_js_Dynamic__Ajl_StackTraceElement(throwable.stackdata)
});
$c_sjsr_StackTrace$.prototype.decompressedClasses$lzycompute__p1__sjs_js_Dictionary = (function() {
  if (((2 & this.bitmap$0$1) === 0)) {
    var dict = {
      "O": "java_lang_Object",
      "T": "java_lang_String",
      "V": "scala_Unit",
      "Z": "scala_Boolean",
      "C": "scala_Char",
      "B": "scala_Byte",
      "S": "scala_Short",
      "I": "scala_Int",
      "J": "scala_Long",
      "F": "scala_Float",
      "D": "scala_Double"
    };
    var index = 0;
    while ((index <= 22)) {
      if ((index >= 2)) {
        dict[("T" + index)] = ("scala_Tuple" + index)
      };
      dict[("F" + index)] = ("scala_Function" + index);
      index = ((1 + index) | 0)
    };
    this.decompressedClasses$1 = dict;
    this.bitmap$0$1 = (2 | this.bitmap$0$1)
  };
  return this.decompressedClasses$1
});
$c_sjsr_StackTrace$.prototype.normalizeStackTraceLines__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var x = (!e);
  if ($uZ((!(!x)))) {
    return []
  } else if (this.isRhino__p1__Z()) {
    return this.extractRhino__p1__sjs_js_Dynamic__sjs_js_Array(e)
  } else {
    var x$1 = (e.arguments && e.stack);
    if ($uZ((!(!x$1)))) {
      return this.extractChrome__p1__sjs_js_Dynamic__sjs_js_Array(e)
    } else {
      var x$2 = (e.stack && e.sourceURL);
      if ($uZ((!(!x$2)))) {
        return this.extractSafari__p1__sjs_js_Dynamic__sjs_js_Array(e)
      } else {
        var x$3 = (e.stack && e.number);
        if ($uZ((!(!x$3)))) {
          return this.extractIE__p1__sjs_js_Dynamic__sjs_js_Array(e)
        } else {
          var x$4 = (e.stack && e.fileName);
          if ($uZ((!(!x$4)))) {
            return this.extractFirefox__p1__sjs_js_Dynamic__sjs_js_Array(e)
          } else {
            var x$5 = (e.message && e["opera#sourceloc"]);
            if ($uZ((!(!x$5)))) {
              var x$6 = (!e.stacktrace);
              if ($uZ((!(!x$6)))) {
                return this.extractOpera9__p1__sjs_js_Dynamic__sjs_js_Array(e)
              } else {
                var x$7 = ((e.message.indexOf("\n") > (-1)) && (e.message.split("\n").length > e.stacktrace.split("\n").length));
                if ($uZ((!(!x$7)))) {
                  return this.extractOpera9__p1__sjs_js_Dynamic__sjs_js_Array(e)
                } else {
                  return this.extractOpera10a__p1__sjs_js_Dynamic__sjs_js_Array(e)
                }
              }
            } else {
              var x$8 = ((e.message && e.stack) && e.stacktrace);
              if ($uZ((!(!x$8)))) {
                var x$9 = (e.stacktrace.indexOf("called from line") < 0);
                if ($uZ((!(!x$9)))) {
                  return this.extractOpera10b__p1__sjs_js_Dynamic__sjs_js_Array(e)
                } else {
                  return this.extractOpera11__p1__sjs_js_Dynamic__sjs_js_Array(e)
                }
              } else {
                var x$10 = (e.stack && (!e.fileName));
                if ($uZ((!(!x$10)))) {
                  return this.extractChrome__p1__sjs_js_Dynamic__sjs_js_Array(e)
                } else {
                  return this.extractOther__p1__sjs_js_Dynamic__sjs_js_Array(e)
                }
              }
            }
          }
        }
      }
    }
  }
});
$c_sjsr_StackTrace$.prototype.extractOpera9__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var lineRE = $m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("Line (\\d+).*script (?:in )?(\\S+)", "i");
  var x = $as_T(e.message);
  var lines = x.split("\n");
  var result = [];
  var i = 2;
  var len = $uI(lines.length);
  while ((i < len)) {
    var mtch = lineRE.exec($as_T(lines[i]));
    if ((mtch !== null)) {
      var value = mtch[2];
      if ((value === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var value$1 = mtch[1];
      if ((value$1 === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var jsx$1 = result.push(((("{anonymous}()@" + value) + ":") + value$1));
      $uI(jsx$1)
    };
    i = ((2 + i) | 0)
  };
  return result
});
$c_sjsr_StackTrace$.prototype.normalizedLinesToStackTrace__p1__sjs_js_Array__Ajl_StackTraceElement = (function(lines) {
  var NormalizedFrameLine = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^([^\\@]*)\\@(.*):([0-9]+)$");
  var NormalizedFrameLineWithColumn = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^([^\\@]*)\\@(.*):([0-9]+):([0-9]+)$");
  var trace = [];
  var i = 0;
  while ((i < $uI(lines.length))) {
    var line = $as_T(lines[i]);
    if ((line === null)) {
      throw new $c_jl_NullPointerException().init___()
    };
    if ((line !== "")) {
      var mtch1 = NormalizedFrameLineWithColumn.exec(line);
      if ((mtch1 !== null)) {
        var value = mtch1[1];
        if ((value === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        var x1 = this.extractClassMethod__p1__T__T2($as_T(value));
        if ((x1 === null)) {
          throw new $c_s_MatchError().init___O(x1)
        };
        var className = $as_T(x1.$$und1__O());
        var methodName = $as_T(x1.$$und2__O());
        var value$1 = mtch1[2];
        if ((value$1 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        var fileName = $as_T(value$1);
        var value$2 = mtch1[3];
        if ((value$2 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        var x = $as_T(value$2);
        var this$15 = new $c_sci_StringOps().init___T(x);
        var this$17 = $m_jl_Integer$();
        var $$this = this$15.repr$1;
        var lineNumber = this$17.parseInt__T__I__I($$this, 10);
        var value$3 = mtch1[4];
        if ((value$3 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        var x$1 = $as_T(value$3);
        var this$23 = new $c_sci_StringOps().init___T(x$1);
        var this$25 = $m_jl_Integer$();
        var $$this$1 = this$23.repr$1;
        var value$4 = this$25.parseInt__T__I__I($$this$1, 10);
        var jsx$1 = trace.push({
          "declaringClass": className,
          "methodName": methodName,
          "fileName": fileName,
          "lineNumber": lineNumber,
          "columnNumber": ((value$4 === (void 0)) ? (void 0) : value$4)
        });
        $uI(jsx$1)
      } else {
        var mtch2 = NormalizedFrameLine.exec(line);
        if ((mtch2 !== null)) {
          var value$5 = mtch2[1];
          if ((value$5 === (void 0))) {
            throw new $c_ju_NoSuchElementException().init___T("undefined.get")
          };
          var x1$2 = this.extractClassMethod__p1__T__T2($as_T(value$5));
          if ((x1$2 === null)) {
            throw new $c_s_MatchError().init___O(x1$2)
          };
          var className$3 = $as_T(x1$2.$$und1__O());
          var methodName$3 = $as_T(x1$2.$$und2__O());
          var value$6 = mtch2[2];
          if ((value$6 === (void 0))) {
            throw new $c_ju_NoSuchElementException().init___T("undefined.get")
          };
          var fileName$1 = $as_T(value$6);
          var value$7 = mtch2[3];
          if ((value$7 === (void 0))) {
            throw new $c_ju_NoSuchElementException().init___T("undefined.get")
          };
          var x$2 = $as_T(value$7);
          var this$52 = new $c_sci_StringOps().init___T(x$2);
          var this$54 = $m_jl_Integer$();
          var $$this$2 = this$52.repr$1;
          var lineNumber$1 = this$54.parseInt__T__I__I($$this$2, 10);
          var jsx$2 = trace.push({
            "declaringClass": className$3,
            "methodName": methodName$3,
            "fileName": fileName$1,
            "lineNumber": lineNumber$1,
            "columnNumber": (void 0)
          });
          $uI(jsx$2)
        } else {
          $uI(trace.push({
            "declaringClass": "<jscode>",
            "methodName": line,
            "fileName": null,
            "lineNumber": (-1),
            "columnNumber": (void 0)
          }))
        }
      }
    };
    i = ((1 + i) | 0)
  };
  var value$8 = $env.sourceMapper;
  var mappedTrace = ((value$8 === (void 0)) ? trace : value$8(trace));
  var result = $newArrayObject($d_jl_StackTraceElement.getArrayOf(), [$uI(mappedTrace.length)]);
  i = 0;
  while ((i < $uI(mappedTrace.length))) {
    var jsSte = mappedTrace[i];
    var ste = new $c_jl_StackTraceElement().init___T__T__T__I($as_T(jsSte.declaringClass), $as_T(jsSte.methodName), $as_T(jsSte.fileName), $uI(jsSte.lineNumber));
    var value$9 = jsSte.columnNumber;
    if ((value$9 !== (void 0))) {
      var columnNumber = $uI(value$9);
      ste.setColumnNumber(columnNumber)
    };
    result.set(i, ste);
    i = ((1 + i) | 0)
  };
  return result
});
$c_sjsr_StackTrace$.prototype.extractOpera11__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var lineRE = $m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("^.*line (\\d+), column (\\d+)(?: in (.+))? in (\\S+):$");
  var x = $as_T(e.stacktrace);
  var lines = x.split("\n");
  var result = [];
  var i = 0;
  var len = $uI(lines.length);
  while ((i < len)) {
    var mtch = lineRE.exec($as_T(lines[i]));
    if ((mtch !== null)) {
      var value = mtch[4];
      if ((value === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var jsx$1 = $as_T(value);
      var value$1 = mtch[1];
      if ((value$1 === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var value$2 = mtch[2];
      if ((value$2 === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var location = ((((jsx$1 + ":") + value$1) + ":") + value$2);
      var value$3 = mtch[2];
      var fnName0 = $as_T(((value$3 === (void 0)) ? "global code" : value$3));
      var x$1 = $as_T(fnName0.replace($m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("<anonymous function: (\\S+)>"), "$1"));
      var jsx$2 = x$1.replace($m_sjsr_StackTrace$StringRE$().re$extension0__T__sjs_js_RegExp("<anonymous function>"), "{anonymous}");
      var fnName = $as_T(jsx$2);
      $uI(result.push(((fnName + "@") + location)))
    };
    i = ((2 + i) | 0)
  };
  return result
});
$c_sjsr_StackTrace$.prototype.extractSafari__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var x = $as_T(e.stack);
  var jsx$3 = x.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("\\[native code\\]\\n", "m"), "");
  var x$1 = $as_T(jsx$3);
  var jsx$2 = x$1.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^(?=\\w+Error\\:).*$\\n", "m"), "");
  var x$2 = $as_T(jsx$2);
  var jsx$1 = x$2.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^@", "gm"), "{anonymous}()@");
  var x$3 = $as_T(jsx$1);
  return x$3.split("\n")
});
$c_sjsr_StackTrace$.prototype.loop$1__p1__I__T__T = (function(i, encoded$1) {
  _loop: while (true) {
    if ((i < $uI(this.compressedPrefixes__p1__sjs_js_Array().length))) {
      var prefix = $as_T(this.compressedPrefixes__p1__sjs_js_Array()[i]);
      if ((($uI(encoded$1.length) >= 0) && ($as_T(encoded$1.substring(0, $uI(prefix.length))) === prefix))) {
        var dict = this.decompressedPrefixes__p1__sjs_js_Dictionary();
        if ((!$uZ($m_sjs_js_WrappedDictionary$Cache$().safeHasOwnProperty$1.call(dict, prefix)))) {
          throw new $c_ju_NoSuchElementException().init___T(("key not found: " + prefix))
        };
        var jsx$1 = $as_T(dict[prefix]);
        var beginIndex = $uI(prefix.length);
        return (("" + jsx$1) + $as_T(encoded$1.substring(beginIndex)))
      } else {
        i = ((1 + i) | 0);
        continue _loop
      }
    } else {
      return ((($uI(encoded$1.length) >= 0) && ($as_T(encoded$1.substring(0, $uI("L".length))) === "L")) ? $as_T(encoded$1.substring(1)) : encoded$1)
    }
  }
});
$c_sjsr_StackTrace$.prototype.liftedTree1$1__p1__Z = (function() {
  try {
    $g.Packages.org.mozilla.javascript.JavaScriptException;
    return true
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      if ($is_sjs_js_JavaScriptException(e$2)) {
        return false
      } else {
        throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
      }
    } else {
      throw e
    }
  }
});
$c_sjsr_StackTrace$.prototype.decompressedPrefixes__p1__sjs_js_Dictionary = (function() {
  return (((4 & this.bitmap$0$1) === 0) ? this.decompressedPrefixes$lzycompute__p1__sjs_js_Dictionary() : this.decompressedPrefixes$1)
});
$c_sjsr_StackTrace$.prototype.extractRhino__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var value = e.stack;
  var x = $as_T(((value === (void 0)) ? "" : value));
  var jsx$3 = x.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^\\s+at\\s+", "gm"), "");
  var x$1 = $as_T(jsx$3);
  var jsx$2 = x$1.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^(.+?)(?: \\((.+)\\))?$", "gm"), "$2@$1");
  var x$2 = $as_T(jsx$2);
  var jsx$1 = x$2.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("\\r\\n?", "gm"), "\n");
  var x$3 = $as_T(jsx$1);
  return x$3.split("\n")
});
$c_sjsr_StackTrace$.prototype.extractOther__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  return []
});
$c_sjsr_StackTrace$.prototype.extractIE__p1__sjs_js_Dynamic__sjs_js_Array = (function(e) {
  var x = $as_T(e.stack);
  var jsx$3 = x.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^\\s*at\\s+(.*)$", "gm"), "$1");
  var x$1 = $as_T(jsx$3);
  var jsx$2 = x$1.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^Anonymous function\\s+", "gm"), "{anonymous}() ");
  var x$2 = $as_T(jsx$2);
  var jsx$1 = x$2.replace($m_sjsr_StackTrace$StringRE$().re$extension1__T__T__sjs_js_RegExp("^([^\\(]+|\\{anonymous\\}\\(\\))\\s+\\((.+)\\)$", "gm"), "$1@$2");
  var x$3 = $as_T(jsx$1);
  var qual$1 = x$3.split("\n");
  return qual$1.slice(1)
});
$c_sjsr_StackTrace$.prototype.decodeMethodName__p1__T__T = (function(encodedName) {
  if ((($uI(encodedName.length) >= 0) && ($as_T(encodedName.substring(0, $uI("init___".length))) === "init___"))) {
    return "<init>"
  } else {
    var methodNameLen = $uI(encodedName.indexOf("__"));
    return ((methodNameLen < 0) ? encodedName : $as_T(encodedName.substring(0, methodNameLen)))
  }
});
var $d_sjsr_StackTrace$ = new $TypeData().initClass({
  sjsr_StackTrace$: 0
}, false, "scala.scalajs.runtime.StackTrace$", {
  sjsr_StackTrace$: 1,
  O: 1
});
$c_sjsr_StackTrace$.prototype.$classData = $d_sjsr_StackTrace$;
var $n_sjsr_StackTrace$ = (void 0);
function $m_sjsr_StackTrace$() {
  if ((!$n_sjsr_StackTrace$)) {
    $n_sjsr_StackTrace$ = new $c_sjsr_StackTrace$().init___()
  };
  return $n_sjsr_StackTrace$
}
/** @constructor */
function $c_sjsr_StackTrace$StringRE$() {
  $c_O.call(this)
}
$c_sjsr_StackTrace$StringRE$.prototype = new $h_O();
$c_sjsr_StackTrace$StringRE$.prototype.constructor = $c_sjsr_StackTrace$StringRE$;
/** @constructor */
function $h_sjsr_StackTrace$StringRE$() {
  /*<skip>*/
}
$h_sjsr_StackTrace$StringRE$.prototype = $c_sjsr_StackTrace$StringRE$.prototype;
$c_sjsr_StackTrace$StringRE$.prototype.init___ = (function() {
  return this
});
$c_sjsr_StackTrace$StringRE$.prototype.re$extension1__T__T__sjs_js_RegExp = (function($$this, mods) {
  return new $g.RegExp($$this, mods)
});
$c_sjsr_StackTrace$StringRE$.prototype.re$extension0__T__sjs_js_RegExp = (function($$this) {
  return new $g.RegExp($$this)
});
var $d_sjsr_StackTrace$StringRE$ = new $TypeData().initClass({
  sjsr_StackTrace$StringRE$: 0
}, false, "scala.scalajs.runtime.StackTrace$StringRE$", {
  sjsr_StackTrace$StringRE$: 1,
  O: 1
});
$c_sjsr_StackTrace$StringRE$.prototype.$classData = $d_sjsr_StackTrace$StringRE$;
var $n_sjsr_StackTrace$StringRE$ = (void 0);
function $m_sjsr_StackTrace$StringRE$() {
  if ((!$n_sjsr_StackTrace$StringRE$)) {
    $n_sjsr_StackTrace$StringRE$ = new $c_sjsr_StackTrace$StringRE$().init___()
  };
  return $n_sjsr_StackTrace$StringRE$
}
/** @constructor */
function $c_sjsr_package$() {
  $c_O.call(this)
}
$c_sjsr_package$.prototype = new $h_O();
$c_sjsr_package$.prototype.constructor = $c_sjsr_package$;
/** @constructor */
function $h_sjsr_package$() {
  /*<skip>*/
}
$h_sjsr_package$.prototype = $c_sjsr_package$.prototype;
$c_sjsr_package$.prototype.init___ = (function() {
  return this
});
$c_sjsr_package$.prototype.unwrapJavaScriptException__jl_Throwable__O = (function(th) {
  if ($is_sjs_js_JavaScriptException(th)) {
    var x2 = $as_sjs_js_JavaScriptException(th);
    var e = x2.exception$4;
    return e
  } else {
    return th
  }
});
$c_sjsr_package$.prototype.wrapJavaScriptException__O__jl_Throwable = (function(e) {
  if ($is_jl_Throwable(e)) {
    var x2 = $as_jl_Throwable(e);
    return x2
  } else {
    return new $c_sjs_js_JavaScriptException().init___O(e)
  }
});
var $d_sjsr_package$ = new $TypeData().initClass({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", {
  sjsr_package$: 1,
  O: 1
});
$c_sjsr_package$.prototype.$classData = $d_sjsr_package$;
var $n_sjsr_package$ = (void 0);
function $m_sjsr_package$() {
  if ((!$n_sjsr_package$)) {
    $n_sjsr_package$ = new $c_sjsr_package$().init___()
  };
  return $n_sjsr_package$
}
/** @constructor */
function $c_sr_BoxesRunTime$() {
  $c_O.call(this)
}
$c_sr_BoxesRunTime$.prototype = new $h_O();
$c_sr_BoxesRunTime$.prototype.constructor = $c_sr_BoxesRunTime$;
/** @constructor */
function $h_sr_BoxesRunTime$() {
  /*<skip>*/
}
$h_sr_BoxesRunTime$.prototype = $c_sr_BoxesRunTime$.prototype;
$c_sr_BoxesRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_BoxesRunTime$.prototype.equalsCharObject__jl_Character__O__Z = (function(xc, y) {
  if ($is_jl_Character(y)) {
    var x2 = $as_jl_Character(y);
    return (xc.value$1 === x2.value$1)
  } else if ($is_jl_Number(y)) {
    var x3 = $as_jl_Number(y);
    if (((typeof x3) === "number")) {
      var x2$1 = $uD(x3);
      return (x2$1 === xc.value$1)
    } else if ($is_sjsr_RuntimeLong(x3)) {
      var t = $uJ(x3);
      var lo = t.lo$2;
      var hi = t.hi$2;
      var value = xc.value$1;
      var hi$1 = (value >> 31);
      return ((lo === value) && (hi === hi$1))
    } else {
      return ((x3 === null) ? (xc === null) : $objectEquals(x3, xc))
    }
  } else {
    return ((xc === null) && (y === null))
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumObject__jl_Number__O__Z = (function(xn, y) {
  if ($is_jl_Number(y)) {
    var x2 = $as_jl_Number(y);
    return this.equalsNumNum__jl_Number__jl_Number__Z(xn, x2)
  } else if ($is_jl_Character(y)) {
    var x3 = $as_jl_Character(y);
    if (((typeof xn) === "number")) {
      var x2$1 = $uD(xn);
      return (x2$1 === x3.value$1)
    } else if ($is_sjsr_RuntimeLong(xn)) {
      var t = $uJ(xn);
      var lo = t.lo$2;
      var hi = t.hi$2;
      var value = x3.value$1;
      var hi$1 = (value >> 31);
      return ((lo === value) && (hi === hi$1))
    } else {
      return ((xn === null) ? (x3 === null) : $objectEquals(xn, x3))
    }
  } else {
    return ((xn === null) ? (y === null) : $objectEquals(xn, y))
  }
});
$c_sr_BoxesRunTime$.prototype.equals__O__O__Z = (function(x, y) {
  if ((x === y)) {
    return true
  } else if ($is_jl_Number(x)) {
    var x2 = $as_jl_Number(x);
    return this.equalsNumObject__jl_Number__O__Z(x2, y)
  } else if ($is_jl_Character(x)) {
    var x3 = $as_jl_Character(x);
    return this.equalsCharObject__jl_Character__O__Z(x3, y)
  } else {
    return ((x === null) ? (y === null) : $objectEquals(x, y))
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumNum__jl_Number__jl_Number__Z = (function(xn, yn) {
  if (((typeof xn) === "number")) {
    var x2 = $uD(xn);
    if (((typeof yn) === "number")) {
      var x2$2 = $uD(yn);
      return (x2 === x2$2)
    } else if ($is_sjsr_RuntimeLong(yn)) {
      var t = $uJ(yn);
      var lo = t.lo$2;
      var hi = t.hi$2;
      return (x2 === $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi))
    } else if ($is_s_math_ScalaNumber(yn)) {
      var x4 = $as_s_math_ScalaNumber(yn);
      return x4.equals__O__Z(x2)
    } else {
      return false
    }
  } else if ($is_sjsr_RuntimeLong(xn)) {
    var t$1 = $uJ(xn);
    var lo$1 = t$1.lo$2;
    var hi$1 = t$1.hi$2;
    if ($is_sjsr_RuntimeLong(yn)) {
      var t$2 = $uJ(yn);
      var lo$2 = t$2.lo$2;
      var hi$2 = t$2.hi$2;
      return ((lo$1 === lo$2) && (hi$1 === hi$2))
    } else if (((typeof yn) === "number")) {
      var x3$3 = $uD(yn);
      return ($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo$1, hi$1) === x3$3)
    } else if ($is_s_math_ScalaNumber(yn)) {
      var x4$2 = $as_s_math_ScalaNumber(yn);
      return x4$2.equals__O__Z(new $c_sjsr_RuntimeLong().init___I__I(lo$1, hi$1))
    } else {
      return false
    }
  } else {
    return ((xn === null) ? (yn === null) : $objectEquals(xn, yn))
  }
});
var $d_sr_BoxesRunTime$ = new $TypeData().initClass({
  sr_BoxesRunTime$: 0
}, false, "scala.runtime.BoxesRunTime$", {
  sr_BoxesRunTime$: 1,
  O: 1
});
$c_sr_BoxesRunTime$.prototype.$classData = $d_sr_BoxesRunTime$;
var $n_sr_BoxesRunTime$ = (void 0);
function $m_sr_BoxesRunTime$() {
  if ((!$n_sr_BoxesRunTime$)) {
    $n_sr_BoxesRunTime$ = new $c_sr_BoxesRunTime$().init___()
  };
  return $n_sr_BoxesRunTime$
}
var $d_sr_Null$ = new $TypeData().initClass({
  sr_Null$: 0
}, false, "scala.runtime.Null$", {
  sr_Null$: 1,
  O: 1
});
/** @constructor */
function $c_sr_ScalaRunTime$() {
  $c_O.call(this)
}
$c_sr_ScalaRunTime$.prototype = new $h_O();
$c_sr_ScalaRunTime$.prototype.constructor = $c_sr_ScalaRunTime$;
/** @constructor */
function $h_sr_ScalaRunTime$() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$.prototype = $c_sr_ScalaRunTime$.prototype;
$c_sr_ScalaRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_ScalaRunTime$.prototype.array$undlength__O__I = (function(xs) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.u.length
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.u.length
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.u.length
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.u.length
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.u.length
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    return x7.u.length
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.u.length
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.u.length
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.u.length
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.u.length
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.array$undupdate__O__I__O__V = (function(xs, idx, value) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    x2.set(idx, value)
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    x3.set(idx, $uI(value))
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    x4.set(idx, $uD(value))
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    x5.set(idx, $uJ(value))
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    x6.set(idx, $uF(value))
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    if ((value === null)) {
      var jsx$1 = 0
    } else {
      var this$2 = $as_jl_Character(value);
      var jsx$1 = this$2.value$1
    };
    x7.set(idx, jsx$1)
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    x8.set(idx, $uB(value))
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    x9.set(idx, $uS(value))
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    x10.set(idx, $uZ(value))
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    x11.set(idx, (void 0))
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.$$undtoString__s_Product__T = (function(x) {
  var this$1 = x.productIterator__sc_Iterator();
  var start = (x.productPrefix__T() + "(");
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this$1, start, ",", ")")
});
$c_sr_ScalaRunTime$.prototype.array$undapply__O__I__O = (function(xs, idx) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.get(idx)
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.get(idx)
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.get(idx)
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.get(idx)
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.get(idx)
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    var c = x7.get(idx);
    return new $c_jl_Character().init___C(c)
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.get(idx)
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.get(idx)
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.get(idx)
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.get(idx)
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
var $d_sr_ScalaRunTime$ = new $TypeData().initClass({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", {
  sr_ScalaRunTime$: 1,
  O: 1
});
$c_sr_ScalaRunTime$.prototype.$classData = $d_sr_ScalaRunTime$;
var $n_sr_ScalaRunTime$ = (void 0);
function $m_sr_ScalaRunTime$() {
  if ((!$n_sr_ScalaRunTime$)) {
    $n_sr_ScalaRunTime$ = new $c_sr_ScalaRunTime$().init___()
  };
  return $n_sr_ScalaRunTime$
}
/** @constructor */
function $c_sr_Statics$() {
  $c_O.call(this)
}
$c_sr_Statics$.prototype = new $h_O();
$c_sr_Statics$.prototype.constructor = $c_sr_Statics$;
/** @constructor */
function $h_sr_Statics$() {
  /*<skip>*/
}
$h_sr_Statics$.prototype = $c_sr_Statics$.prototype;
$c_sr_Statics$.prototype.init___ = (function() {
  return this
});
$c_sr_Statics$.prototype.doubleHash__D__I = (function(dv) {
  var iv = $doubleToInt(dv);
  if ((iv === dv)) {
    return iv
  } else {
    var this$1 = $m_sjsr_RuntimeLong$();
    var lo = this$1.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(dv);
    var hi = this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
    return (($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi) === dv) ? (lo ^ hi) : $m_sjsr_Bits$().numberHashCode__D__I(dv))
  }
});
$c_sr_Statics$.prototype.anyHash__O__I = (function(x) {
  if ((x === null)) {
    return 0
  } else if (((typeof x) === "number")) {
    var x3 = $uD(x);
    return this.doubleHash__D__I(x3)
  } else if ($is_sjsr_RuntimeLong(x)) {
    var t = $uJ(x);
    var lo = t.lo$2;
    var hi = t.hi$2;
    return this.longHash__J__I(new $c_sjsr_RuntimeLong().init___I__I(lo, hi))
  } else {
    return $objectHashCode(x)
  }
});
$c_sr_Statics$.prototype.longHash__J__I = (function(lv) {
  var lo = lv.lo$2;
  var lo$1 = lv.hi$2;
  return ((lo$1 === (lo >> 31)) ? lo : (lo ^ lo$1))
});
var $d_sr_Statics$ = new $TypeData().initClass({
  sr_Statics$: 0
}, false, "scala.runtime.Statics$", {
  sr_Statics$: 1,
  O: 1
});
$c_sr_Statics$.prototype.$classData = $d_sr_Statics$;
var $n_sr_Statics$ = (void 0);
function $m_sr_Statics$() {
  if ((!$n_sr_Statics$)) {
    $n_sr_Statics$ = new $c_sr_Statics$().init___()
  };
  return $n_sr_Statics$
}
/** @constructor */
function $c_Lorg_scalajs_dom_ext_LocalStorage$() {
  $c_Lorg_scalajs_dom_ext_Storage.call(this)
}
$c_Lorg_scalajs_dom_ext_LocalStorage$.prototype = new $h_Lorg_scalajs_dom_ext_Storage();
$c_Lorg_scalajs_dom_ext_LocalStorage$.prototype.constructor = $c_Lorg_scalajs_dom_ext_LocalStorage$;
/** @constructor */
function $h_Lorg_scalajs_dom_ext_LocalStorage$() {
  /*<skip>*/
}
$h_Lorg_scalajs_dom_ext_LocalStorage$.prototype = $c_Lorg_scalajs_dom_ext_LocalStorage$.prototype;
$c_Lorg_scalajs_dom_ext_LocalStorage$.prototype.init___ = (function() {
  $c_Lorg_scalajs_dom_ext_Storage.prototype.init___Lorg_scalajs_dom_raw_Storage.call(this, $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().localStorage);
  return this
});
var $d_Lorg_scalajs_dom_ext_LocalStorage$ = new $TypeData().initClass({
  Lorg_scalajs_dom_ext_LocalStorage$: 0
}, false, "org.scalajs.dom.ext.LocalStorage$", {
  Lorg_scalajs_dom_ext_LocalStorage$: 1,
  Lorg_scalajs_dom_ext_Storage: 1,
  O: 1
});
$c_Lorg_scalajs_dom_ext_LocalStorage$.prototype.$classData = $d_Lorg_scalajs_dom_ext_LocalStorage$;
var $n_Lorg_scalajs_dom_ext_LocalStorage$ = (void 0);
function $m_Lorg_scalajs_dom_ext_LocalStorage$() {
  if ((!$n_Lorg_scalajs_dom_ext_LocalStorage$)) {
    $n_Lorg_scalajs_dom_ext_LocalStorage$ = new $c_Lorg_scalajs_dom_ext_LocalStorage$().init___()
  };
  return $n_Lorg_scalajs_dom_ext_LocalStorage$
}
/** @constructor */
function $c_Lplots_ShadowManifold() {
  $c_O.call(this);
  this.tag$1 = null;
  this.points$1 = null;
  this.hue$1 = 0.0;
  this.numPoints$1 = 0;
  this.selections$1 = null;
  this.Selection$module$1 = null
}
$c_Lplots_ShadowManifold.prototype = new $h_O();
$c_Lplots_ShadowManifold.prototype.constructor = $c_Lplots_ShadowManifold;
/** @constructor */
function $h_Lplots_ShadowManifold() {
  /*<skip>*/
}
$h_Lplots_ShadowManifold.prototype = $c_Lplots_ShadowManifold.prototype;
$c_Lplots_ShadowManifold.prototype.init___T__Lorg_scalajs_threejs_Points = (function(tag, points) {
  this.tag$1 = tag;
  this.points$1 = points;
  $f_Lplots_Plot__$$init$__V(this);
  return this
});
$c_Lplots_ShadowManifold.prototype.plots$Plot$$Selection__Lplots_Plot$Selection$ = (function() {
  if ((this.Selection$module$1 === null)) {
    this.plots$Plot$$Selection$lzycompute$1__p1__V()
  };
  return this.Selection$module$1
});
$c_Lplots_ShadowManifold.prototype.plots$Plot$$Selection$lzycompute$1__p1__V = (function() {
  if ((this.Selection$module$1 === null)) {
    this.Selection$module$1 = new $c_Lplots_Plot$Selection$().init___Lplots_Plot(this)
  }
});
$c_Lplots_ShadowManifold.prototype.getGeometry__Lorg_scalajs_threejs_BufferGeometry = (function() {
  return this.points$1.geometry
});
function $is_Lplots_ShadowManifold(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Lplots_ShadowManifold)))
}
function $as_Lplots_ShadowManifold(obj) {
  return (($is_Lplots_ShadowManifold(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "plots.ShadowManifold"))
}
function $isArrayOf_Lplots_ShadowManifold(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Lplots_ShadowManifold)))
}
function $asArrayOf_Lplots_ShadowManifold(obj, depth) {
  return (($isArrayOf_Lplots_ShadowManifold(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lplots.ShadowManifold;", depth))
}
var $d_Lplots_ShadowManifold = new $TypeData().initClass({
  Lplots_ShadowManifold: 0
}, false, "plots.ShadowManifold", {
  Lplots_ShadowManifold: 1,
  O: 1,
  Lplots_Plot: 1
});
$c_Lplots_ShadowManifold.prototype.$classData = $d_Lplots_ShadowManifold;
/** @constructor */
function $c_Luserinput_Interactions$PlotInteractions$() {
  $c_O.call(this)
}
$c_Luserinput_Interactions$PlotInteractions$.prototype = new $h_O();
$c_Luserinput_Interactions$PlotInteractions$.prototype.constructor = $c_Luserinput_Interactions$PlotInteractions$;
/** @constructor */
function $h_Luserinput_Interactions$PlotInteractions$() {
  /*<skip>*/
}
$h_Luserinput_Interactions$PlotInteractions$.prototype = $c_Luserinput_Interactions$PlotInteractions$.prototype;
$c_Luserinput_Interactions$PlotInteractions$.prototype.init___ = (function() {
  return this
});
$c_Luserinput_Interactions$PlotInteractions$.prototype.onIntersection__Lplots_Plot__sjs_js_Array__T2 = (function(entity, intersection) {
  var index = $uI(intersection[0].index);
  var oldIndex = entity.selections$1.get(0);
  if ((oldIndex !== index)) {
    var array = [oldIndex];
    if (entity.plots$Plot$$Selection__Lplots_Plot$Selection$().changesColor$1) {
      var i = 0;
      var len = $uI(array.length);
      while ((i < len)) {
        var index$1 = i;
        var arg1 = array[index$1];
        var i$1 = $uI(arg1);
        $f_Lplots_Plot__resetColor__pLplots_Plot__I__V(entity, i$1);
        i = ((1 + i) | 0)
      }
    };
    if (entity.plots$Plot$$Selection__Lplots_Plot$Selection$().changesSize$1) {
      var newSize = $fround($m_Lplots_Plot$().PARTICLE$undSIZE$1);
      var sizesAttr = entity.getGeometry__Lorg_scalajs_threejs_BufferGeometry().getAttribute("size");
      var sArr = sizesAttr.array;
      var i$2 = 0;
      var len$1 = $uI(array.length);
      while ((i$2 < len$1)) {
        var index$2 = i$2;
        var arg1$1 = array[index$2];
        var i$3 = $uI(arg1$1);
        sArr[i$3] = newSize;
        i$2 = ((1 + i$2) | 0)
      };
      sizesAttr.needsUpdate = true
    }
  };
  entity.selections$1.set(0, index);
  var array$1 = [index];
  if (entity.plots$Plot$$Selection__Lplots_Plot$Selection$().changesColor$1) {
    var r = entity.plots$Plot$$Selection__Lplots_Plot$Selection$().red$1;
    var g = entity.plots$Plot$$Selection__Lplots_Plot$Selection$().green$1;
    var b = entity.plots$Plot$$Selection__Lplots_Plot$Selection$().blue$1;
    var colorsAttr = entity.getGeometry__Lorg_scalajs_threejs_BufferGeometry().getAttribute("customColor");
    var cArr = colorsAttr.array;
    var i$4 = 0;
    var len$2 = $uI(array$1.length);
    while ((i$4 < len$2)) {
      var index$3 = i$4;
      var arg1$2 = array$1[index$3];
      var i$5 = $uI(arg1$2);
      cArr[$imul(3, i$5)] = r;
      cArr[((1 + $imul(3, i$5)) | 0)] = g;
      cArr[((2 + $imul(3, i$5)) | 0)] = b;
      i$4 = ((1 + i$4) | 0)
    };
    colorsAttr.needsUpdate = true
  };
  if (entity.plots$Plot$$Selection__Lplots_Plot$Selection$().changesSize$1) {
    var newSize$1 = $fround(($fround($m_Lplots_Plot$().PARTICLE$undSIZE$1) * entity.plots$Plot$$Selection__Lplots_Plot$Selection$().scale$1));
    var sizesAttr$1 = entity.getGeometry__Lorg_scalajs_threejs_BufferGeometry().getAttribute("size");
    var sArr$1 = sizesAttr$1.array;
    var i$6 = 0;
    var len$3 = $uI(array$1.length);
    while ((i$6 < len$3)) {
      var index$4 = i$6;
      var arg1$3 = array$1[index$4];
      var i$7 = $uI(arg1$3);
      sArr$1[i$7] = newSize$1;
      i$6 = ((1 + i$6) | 0)
    };
    sizesAttr$1.needsUpdate = true
  };
  return new $c_s_Tuple2$mcII$sp().init___I__I(oldIndex, entity.selections$1.get(0))
});
var $d_Luserinput_Interactions$PlotInteractions$ = new $TypeData().initClass({
  Luserinput_Interactions$PlotInteractions$: 0
}, false, "userinput.Interactions$PlotInteractions$", {
  Luserinput_Interactions$PlotInteractions$: 1,
  O: 1,
  Luserinput_Interactions: 1
});
$c_Luserinput_Interactions$PlotInteractions$.prototype.$classData = $d_Luserinput_Interactions$PlotInteractions$;
var $n_Luserinput_Interactions$PlotInteractions$ = (void 0);
function $m_Luserinput_Interactions$PlotInteractions$() {
  if ((!$n_Luserinput_Interactions$PlotInteractions$)) {
    $n_Luserinput_Interactions$PlotInteractions$ = new $c_Luserinput_Interactions$PlotInteractions$().init___()
  };
  return $n_Luserinput_Interactions$PlotInteractions$
}
/** @constructor */
function $c_Luserinput_OculusController() {
  $c_O.call(this);
  this.Primary$undPressBegan$1 = null;
  this.Primary$undPressEnded$1 = null;
  this.Grip$undPressBegan$1 = null;
  this.Grip$undPressEnded$1 = null;
  this.Axes$undChanged$1 = null;
  this.Disconnected$1 = null;
  this.meshColorRed$1 = 0;
  this.meshColorBlue$1 = 0;
  this.meshColorWhite$1 = 0;
  this.controllerEl$1 = null;
  this.controllerMesh$1 = null;
  this.rayCasterEl$1 = null;
  this.rayCasterArrow$1 = null;
  this.ThumbRest$undTouchBegan$1 = null;
  this.ThumbRest$undTouchEnded$1 = null
}
$c_Luserinput_OculusController.prototype = new $h_O();
$c_Luserinput_OculusController.prototype.constructor = $c_Luserinput_OculusController;
/** @constructor */
function $h_Luserinput_OculusController() {
  /*<skip>*/
}
$h_Luserinput_OculusController.prototype = $c_Luserinput_OculusController.prototype;
$c_Luserinput_OculusController.prototype.init___ = (function() {
  $f_Luserinput_OculusTouchEvents__$$init$__V(this);
  this.Primary$undPressBegan$1 = "primary press began";
  this.Primary$undPressEnded$1 = "primary press ended";
  this.Grip$undPressBegan$1 = "grip press began";
  this.Grip$undPressEnded$1 = "grip press ended";
  this.Axes$undChanged$1 = "thumbstick axes changed";
  this.Disconnected$1 = "disconnected";
  this.meshColorRed$1 = 16711680;
  this.meshColorBlue$1 = 255;
  this.meshColorWhite$1 = 16777215;
  return this
});
$c_Luserinput_OculusController.prototype.updatedRayCaster__Lorg_scalajs_threejs_Raycaster = (function() {
  this.rayCasterEl$1.set(this.controllerEl$1.position, this.controllerDirection__Lorg_scalajs_threejs_Vector3());
  return this.rayCasterEl$1
});
$c_Luserinput_OculusController.prototype.createControllerMesh__I__Lorg_scalajs_threejs_Mesh = (function(color) {
  var controllerMaterial = new $g.THREE.MeshBasicMaterial();
  controllerMaterial.color = new $g.THREE.Color(color);
  var controllerMesh = new $g.THREE.Mesh(new $g.THREE.CylinderGeometry(0.005, 0.05, 0.1, 6.0), controllerMaterial);
  var handleMesh = new $g.THREE.Mesh(new $g.THREE.BoxGeometry(0.03, 0.1, 0.03), controllerMaterial);
  controllerMesh.rotation.x = (-1.5707963267948966);
  handleMesh.position.y = (-0.05);
  controllerMesh.add(handleMesh);
  return controllerMesh
});
$c_Luserinput_OculusController.prototype.userinput$OculusTouchEvents$$undsetter$und$ThumbRest$undTouchBegan$und$eq__T__V = (function(x$1) {
  this.ThumbRest$undTouchBegan$1 = x$1
});
$c_Luserinput_OculusController.prototype.init__Lfacades_IFThree$VRController__I__V = (function(vrc, hexColor) {
  this.controllerEl$1 = vrc;
  this.controllerMesh$1 = this.createControllerMesh__I__Lorg_scalajs_threejs_Mesh(hexColor);
  this.rayCasterEl$1 = new $g.THREE.Raycaster();
  this.rayCasterEl$1.set(vrc.position, this.controllerDirection__Lorg_scalajs_threejs_Vector3());
  this.rayCasterEl$1.params.Points.threshold = 0.015;
  this.rayCasterArrow$1 = new $g.THREE.ArrowHelper(new $g.THREE.Vector3(0.0, 0.0, (-1.0)), new $g.THREE.Vector3(0.0, 0.0, 0.0), 100.0, hexColor);
  this.rayCasterArrow$1.visible = false;
  this.rayCasterArrow$1.cone.visible = false;
  vrc.add(this.rayCasterArrow$1);
  vrc.add(this.controllerMesh$1)
});
$c_Luserinput_OculusController.prototype.isPointing__Z = (function() {
  return ((this.rayCasterArrow$1 !== null) && $uZ(this.rayCasterArrow$1.visible))
});
$c_Luserinput_OculusController.prototype.userinput$OculusTouchEvents$$undsetter$und$ThumbRest$undTouchEnded$und$eq__T__V = (function(x$1) {
  this.ThumbRest$undTouchEnded$1 = x$1
});
$c_Luserinput_OculusController.prototype.controllerDirection__Lorg_scalajs_threejs_Vector3 = (function() {
  var matrix = new $g.THREE.Matrix4();
  matrix.extractRotation(this.controllerEl$1.matrix);
  var direction = new $g.THREE.Vector3(0.0, 0.0, 1.0);
  direction = direction.applyMatrix4(matrix).negate();
  return direction
});
/** @constructor */
function $c_jl_Number() {
  $c_O.call(this)
}
$c_jl_Number.prototype = new $h_O();
$c_jl_Number.prototype.constructor = $c_jl_Number;
/** @constructor */
function $h_jl_Number() {
  /*<skip>*/
}
$h_jl_Number.prototype = $c_jl_Number.prototype;
function $is_jl_Number(obj) {
  return (!(!(((obj && obj.$classData) && obj.$classData.ancestors.jl_Number) || ((typeof obj) === "number"))))
}
function $as_jl_Number(obj) {
  return (($is_jl_Number(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Number"))
}
function $isArrayOf_jl_Number(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
}
function $asArrayOf_jl_Number(obj, depth) {
  return (($isArrayOf_jl_Number(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Number;", depth))
}
/** @constructor */
function $c_jl_StackTraceElement() {
  $c_O.call(this);
  this.declaringClass$1 = null;
  this.methodName$1 = null;
  this.fileName$1 = null;
  this.lineNumber$1 = 0;
  this.columnNumber$1 = 0
}
$c_jl_StackTraceElement.prototype = new $h_O();
$c_jl_StackTraceElement.prototype.constructor = $c_jl_StackTraceElement;
/** @constructor */
function $h_jl_StackTraceElement() {
  /*<skip>*/
}
$h_jl_StackTraceElement.prototype = $c_jl_StackTraceElement.prototype;
$c_jl_StackTraceElement.prototype.$$js$exported$meth$getColumnNumber__O = (function() {
  return this.columnNumber$1
});
$c_jl_StackTraceElement.prototype.init___T__T__T__I = (function(declaringClass, methodName, fileName, lineNumber) {
  this.declaringClass$1 = declaringClass;
  this.methodName$1 = methodName;
  this.fileName$1 = fileName;
  this.lineNumber$1 = lineNumber;
  this.columnNumber$1 = (-1);
  return this
});
$c_jl_StackTraceElement.prototype.equals__O__Z = (function(that) {
  if ($is_jl_StackTraceElement(that)) {
    var x2 = $as_jl_StackTraceElement(that);
    return ((((this.fileName$1 === x2.fileName$1) && (this.lineNumber$1 === x2.lineNumber$1)) && (this.declaringClass$1 === x2.declaringClass$1)) && (this.methodName$1 === x2.methodName$1))
  } else {
    return false
  }
});
$c_jl_StackTraceElement.prototype.$$js$exported$meth$setColumnNumber__I__O = (function(columnNumber) {
  this.columnNumber$1 = columnNumber
});
$c_jl_StackTraceElement.prototype.toString__T = (function() {
  var result = "";
  if ((this.declaringClass$1 !== "<jscode>")) {
    result = ((("" + result) + this.declaringClass$1) + ".")
  };
  result = (("" + result) + this.methodName$1);
  if ((this.fileName$1 === null)) {
    result = (result + "(Unknown Source)")
  } else {
    result = (("" + result) + new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["(", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.fileName$1])));
    if ((this.lineNumber$1 >= 0)) {
      result = (("" + result) + new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array([":", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.lineNumber$1])));
      if ((this.columnNumber$1 >= 0)) {
        result = (("" + result) + new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array([":", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.columnNumber$1])))
      }
    };
    result = (result + ")")
  };
  return result
});
$c_jl_StackTraceElement.prototype.hashCode__I = (function() {
  var this$1 = this.declaringClass$1;
  var jsx$1 = $m_sjsr_RuntimeString$().hashCode__T__I(this$1);
  var this$2 = this.methodName$1;
  return (jsx$1 ^ $m_sjsr_RuntimeString$().hashCode__T__I(this$2))
});
$c_jl_StackTraceElement.prototype.setColumnNumber = (function(arg$1) {
  var prep0 = $uI(arg$1);
  return this.$$js$exported$meth$setColumnNumber__I__O(prep0)
});
$c_jl_StackTraceElement.prototype.getColumnNumber = (function() {
  return this.$$js$exported$meth$getColumnNumber__O()
});
function $is_jl_StackTraceElement(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_StackTraceElement)))
}
function $as_jl_StackTraceElement(obj) {
  return (($is_jl_StackTraceElement(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.StackTraceElement"))
}
function $isArrayOf_jl_StackTraceElement(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_StackTraceElement)))
}
function $asArrayOf_jl_StackTraceElement(obj, depth) {
  return (($isArrayOf_jl_StackTraceElement(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.StackTraceElement;", depth))
}
var $d_jl_StackTraceElement = new $TypeData().initClass({
  jl_StackTraceElement: 0
}, false, "java.lang.StackTraceElement", {
  jl_StackTraceElement: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StackTraceElement.prototype.$classData = $d_jl_StackTraceElement;
/** @constructor */
function $c_jl_Throwable() {
  $c_O.call(this);
  this.s$1 = null;
  this.e$1 = null;
  this.stackTrace$1 = null
}
$c_jl_Throwable.prototype = new $h_O();
$c_jl_Throwable.prototype.constructor = $c_jl_Throwable;
/** @constructor */
function $h_jl_Throwable() {
  /*<skip>*/
}
$h_jl_Throwable.prototype = $c_jl_Throwable.prototype;
$c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable = (function() {
  var v = $g.Error.captureStackTrace;
  if ((v === (void 0))) {
    try {
      var e$1 = {}.undef()
    } catch (e) {
      var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        if ($is_sjs_js_JavaScriptException(e$2)) {
          var x5 = $as_sjs_js_JavaScriptException(e$2);
          var e$3 = x5.exception$4;
          var e$1 = e$3
        } else {
          var e$1;
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
        }
      } else {
        var e$1;
        throw e
      }
    };
    this.stackdata = e$1
  } else {
    $g.Error.captureStackTrace(this);
    this.stackdata = this
  };
  return this
});
$c_jl_Throwable.prototype.getMessage__T = (function() {
  return this.s$1
});
$c_jl_Throwable.prototype.toString__T = (function() {
  var className = $objectGetClass(this).getName__T();
  var message = this.getMessage__T();
  return ((message === null) ? className : ((className + ": ") + message))
});
$c_jl_Throwable.prototype.getStackTrace__Ajl_StackTraceElement = (function() {
  if ((this.stackTrace$1 === null)) {
    this.stackTrace$1 = $m_sjsr_StackTrace$().extract__jl_Throwable__Ajl_StackTraceElement(this)
  };
  return this.stackTrace$1
});
$c_jl_Throwable.prototype.init___T__jl_Throwable = (function(s, e) {
  this.s$1 = s;
  this.e$1 = e;
  this.fillInStackTrace__jl_Throwable();
  return this
});
$c_jl_Throwable.prototype.printStackTrace__Ljava_io_PrintStream__V = (function(s) {
  var f = (function($this, s$1) {
    return (function(x$1$2) {
      var x$1 = $as_T(x$1$2);
      s$1.println__T__V(x$1)
    })
  })(this, s);
  this.getStackTrace__Ajl_StackTraceElement();
  var arg1 = this.toString__T();
  f(arg1);
  if ((this.stackTrace$1.u.length !== 0)) {
    var i = 0;
    while ((i < this.stackTrace$1.u.length)) {
      var arg1$1 = ("  at " + this.stackTrace$1.get(i));
      f(arg1$1);
      i = ((1 + i) | 0)
    }
  } else {
    f("  <no stack trace available>")
  };
  var wCause = this;
  while (true) {
    var jsx$2 = wCause;
    var this$1 = wCause;
    if ((jsx$2 !== this$1.e$1)) {
      var this$2 = wCause;
      var jsx$1 = (this$2.e$1 !== null)
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var parentTrace = wCause.getStackTrace__Ajl_StackTraceElement();
      var this$3 = wCause;
      wCause = this$3.e$1;
      var thisTrace = wCause.getStackTrace__Ajl_StackTraceElement();
      var thisLength = thisTrace.u.length;
      var parentLength = parentTrace.u.length;
      var arg1$2 = ("Caused by: " + wCause.toString__T());
      f(arg1$2);
      if ((thisLength !== 0)) {
        var sameFrameCount = 0;
        while (true) {
          if (((sameFrameCount < thisLength) && (sameFrameCount < parentLength))) {
            var x = thisTrace.get((((-1) + ((thisLength - sameFrameCount) | 0)) | 0));
            var x$2 = parentTrace.get((((-1) + ((parentLength - sameFrameCount) | 0)) | 0));
            var jsx$3 = ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
          } else {
            var jsx$3 = false
          };
          if (jsx$3) {
            sameFrameCount = ((1 + sameFrameCount) | 0)
          } else {
            break
          }
        };
        if ((sameFrameCount > 0)) {
          sameFrameCount = (((-1) + sameFrameCount) | 0)
        };
        var lengthToPrint = ((thisLength - sameFrameCount) | 0);
        var i$2 = 0;
        while ((i$2 < lengthToPrint)) {
          var arg1$3 = ("  at " + thisTrace.get(i$2));
          f(arg1$3);
          i$2 = ((1 + i$2) | 0)
        };
        if ((sameFrameCount > 0)) {
          var arg1$4 = (("  ... " + sameFrameCount) + " more");
          f(arg1$4)
        }
      } else {
        f("  <no stack trace available>")
      }
    } else {
      break
    }
  }
});
function $is_jl_Throwable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Throwable)))
}
function $as_jl_Throwable(obj) {
  return (($is_jl_Throwable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Throwable"))
}
function $isArrayOf_jl_Throwable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
}
function $asArrayOf_jl_Throwable(obj, depth) {
  return (($isArrayOf_jl_Throwable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Throwable;", depth))
}
/** @constructor */
function $c_ju_regex_Matcher() {
  $c_O.call(this);
  this.pattern0$1 = null;
  this.input0$1 = null;
  this.regionStart0$1 = 0;
  this.regionEnd0$1 = 0;
  this.regexp$1 = null;
  this.inputstr$1 = null;
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = false;
  this.appendPos$1 = 0;
  this.startOfGroupCache$1 = null
}
$c_ju_regex_Matcher.prototype = new $h_O();
$c_ju_regex_Matcher.prototype.constructor = $c_ju_regex_Matcher;
/** @constructor */
function $h_ju_regex_Matcher() {
  /*<skip>*/
}
$h_ju_regex_Matcher.prototype = $c_ju_regex_Matcher.prototype;
$c_ju_regex_Matcher.prototype.find__Z = (function() {
  if (this.canStillFind$1) {
    this.lastMatchIsValid$1 = true;
    this.lastMatch$1 = this.regexp$1.exec(this.inputstr$1);
    if ((this.lastMatch$1 !== null)) {
      var value = this.lastMatch$1[0];
      if ((value === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var thiz = $as_T(value);
      if ((thiz === null)) {
        throw new $c_jl_NullPointerException().init___()
      };
      if ((thiz === "")) {
        var ev$1 = this.regexp$1;
        ev$1.lastIndex = ((1 + $uI(ev$1.lastIndex)) | 0)
      }
    } else {
      this.canStillFind$1 = false
    };
    this.startOfGroupCache$1 = $m_s_None$();
    return (this.lastMatch$1 !== null)
  } else {
    return false
  }
});
$c_ju_regex_Matcher.prototype.ensureLastMatch__p1__sjs_js_RegExp$ExecResult = (function() {
  if ((this.lastMatch$1 === null)) {
    throw new $c_jl_IllegalStateException().init___T("No match available")
  };
  return this.lastMatch$1
});
$c_ju_regex_Matcher.prototype.matches__Z = (function() {
  this.reset__ju_regex_Matcher();
  this.find__Z();
  if ((this.lastMatch$1 !== null)) {
    if ((this.start__I() !== 0)) {
      var jsx$1 = true
    } else {
      var jsx$2 = this.end__I();
      var thiz = this.inputstr$1;
      var jsx$1 = (jsx$2 !== $uI(thiz.length))
    }
  } else {
    var jsx$1 = false
  };
  if (jsx$1) {
    this.reset__ju_regex_Matcher()
  };
  return (this.lastMatch$1 !== null)
});
$c_ju_regex_Matcher.prototype.end__I = (function() {
  var jsx$1 = this.start__I();
  var thiz = this.group__T();
  return ((jsx$1 + $uI(thiz.length)) | 0)
});
$c_ju_regex_Matcher.prototype.init___ju_regex_Pattern__jl_CharSequence__I__I = (function(pattern0, input0, regionStart0, regionEnd0) {
  this.pattern0$1 = pattern0;
  this.input0$1 = input0;
  this.regionStart0$1 = regionStart0;
  this.regionEnd0$1 = regionEnd0;
  this.regexp$1 = this.pattern0$1.newJSRegExp__sjs_js_RegExp();
  this.inputstr$1 = $objectToString($charSequenceSubSequence(this.input0$1, this.regionStart0$1, this.regionEnd0$1));
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = true;
  this.appendPos$1 = 0;
  this.startOfGroupCache$1 = $m_s_None$();
  return this
});
$c_ju_regex_Matcher.prototype.group__T = (function() {
  var value = this.ensureLastMatch__p1__sjs_js_RegExp$ExecResult()[0];
  if ((value === (void 0))) {
    throw new $c_ju_NoSuchElementException().init___T("undefined.get")
  };
  return $as_T(value)
});
$c_ju_regex_Matcher.prototype.start__I = (function() {
  return $uI(this.ensureLastMatch__p1__sjs_js_RegExp$ExecResult().index)
});
$c_ju_regex_Matcher.prototype.reset__ju_regex_Matcher = (function() {
  this.regexp$1.lastIndex = 0;
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = true;
  this.appendPos$1 = 0;
  this.startOfGroupCache$1 = $m_s_None$();
  return this
});
var $d_ju_regex_Matcher = new $TypeData().initClass({
  ju_regex_Matcher: 0
}, false, "java.util.regex.Matcher", {
  ju_regex_Matcher: 1,
  O: 1,
  ju_regex_MatchResult: 1
});
$c_ju_regex_Matcher.prototype.$classData = $d_ju_regex_Matcher;
/** @constructor */
function $c_s_Predef$$anon$3() {
  $c_O.call(this)
}
$c_s_Predef$$anon$3.prototype = new $h_O();
$c_s_Predef$$anon$3.prototype.constructor = $c_s_Predef$$anon$3;
/** @constructor */
function $h_s_Predef$$anon$3() {
  /*<skip>*/
}
$h_s_Predef$$anon$3.prototype = $c_s_Predef$$anon$3.prototype;
$c_s_Predef$$anon$3.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$3.prototype.apply__scm_Builder = (function() {
  return new $c_scm_StringBuilder().init___()
});
$c_s_Predef$$anon$3.prototype.apply__O__scm_Builder = (function(from) {
  $as_T(from);
  return new $c_scm_StringBuilder().init___()
});
var $d_s_Predef$$anon$3 = new $TypeData().initClass({
  s_Predef$$anon$3: 0
}, false, "scala.Predef$$anon$3", {
  s_Predef$$anon$3: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_s_Predef$$anon$3.prototype.$classData = $d_s_Predef$$anon$3;
function $f_s_Product2__productElement__I__O($thiz, n) {
  switch (n) {
    case 0: {
      return $thiz.$$und1__O();
      break
    }
    case 1: {
      return $thiz.$$und2__O();
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
    }
  }
}
function $f_s_Product3__productElement__I__O($thiz, n) {
  switch (n) {
    case 0: {
      return $thiz.$$und1$1;
      break
    }
    case 1: {
      return $thiz.$$und2$1;
      break
    }
    case 2: {
      return $thiz.$$und3$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
    }
  }
}
/** @constructor */
function $c_s_package$$anon$1() {
  $c_O.call(this)
}
$c_s_package$$anon$1.prototype = new $h_O();
$c_s_package$$anon$1.prototype.constructor = $c_s_package$$anon$1;
/** @constructor */
function $h_s_package$$anon$1() {
  /*<skip>*/
}
$h_s_package$$anon$1.prototype = $c_s_package$$anon$1.prototype;
$c_s_package$$anon$1.prototype.init___ = (function() {
  return this
});
$c_s_package$$anon$1.prototype.toString__T = (function() {
  return "object AnyRef"
});
var $d_s_package$$anon$1 = new $TypeData().initClass({
  s_package$$anon$1: 0
}, false, "scala.package$$anon$1", {
  s_package$$anon$1: 1,
  O: 1,
  s_Specializable: 1
});
$c_s_package$$anon$1.prototype.$classData = $d_s_package$$anon$1;
/** @constructor */
function $c_s_util_hashing_MurmurHash3$() {
  $c_s_util_hashing_MurmurHash3.call(this);
  this.seqSeed$2 = 0;
  this.mapSeed$2 = 0;
  this.setSeed$2 = 0
}
$c_s_util_hashing_MurmurHash3$.prototype = new $h_s_util_hashing_MurmurHash3();
$c_s_util_hashing_MurmurHash3$.prototype.constructor = $c_s_util_hashing_MurmurHash3$;
/** @constructor */
function $h_s_util_hashing_MurmurHash3$() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3$.prototype = $c_s_util_hashing_MurmurHash3$.prototype;
$c_s_util_hashing_MurmurHash3$.prototype.init___ = (function() {
  $n_s_util_hashing_MurmurHash3$ = this;
  this.seqSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Seq");
  this.mapSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Map");
  this.setSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Set");
  return this
});
$c_s_util_hashing_MurmurHash3$.prototype.seqHash__sc_Seq__I = (function(xs) {
  if ($is_sci_List(xs)) {
    var x2 = $as_sci_List(xs);
    return this.listHash__sci_List__I__I(x2, this.seqSeed$2)
  } else {
    return this.orderedHash__sc_TraversableOnce__I__I(xs, this.seqSeed$2)
  }
});
var $d_s_util_hashing_MurmurHash3$ = new $TypeData().initClass({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
$c_s_util_hashing_MurmurHash3$.prototype.$classData = $d_s_util_hashing_MurmurHash3$;
var $n_s_util_hashing_MurmurHash3$ = (void 0);
function $m_s_util_hashing_MurmurHash3$() {
  if ((!$n_s_util_hashing_MurmurHash3$)) {
    $n_s_util_hashing_MurmurHash3$ = new $c_s_util_hashing_MurmurHash3$().init___()
  };
  return $n_s_util_hashing_MurmurHash3$
}
function $f_sc_Iterator__isEmpty__Z($thiz) {
  return (!$thiz.hasNext__Z())
}
function $f_sc_Iterator__toString__T($thiz) {
  return (($thiz.hasNext__Z() ? "non-empty" : "empty") + " iterator")
}
function $f_sc_Iterator__forall__F1__Z($thiz, p) {
  var res = true;
  while ((res && $thiz.hasNext__Z())) {
    res = $uZ(p.apply__O__O($thiz.next__O()))
  };
  return res
}
function $f_sc_Iterator__foreach__F1__V($thiz, f) {
  while ($thiz.hasNext__Z()) {
    f.apply__O__O($thiz.next__O())
  }
}
function $f_sc_Iterator__toStream__sci_Stream($thiz) {
  if ($thiz.hasNext__Z()) {
    var hd = $thiz.next__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
      return (function() {
        return $this.toStream__sci_Stream()
      })
    })($thiz));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  } else {
    $m_sci_Stream$();
    return $m_sci_Stream$Empty$()
  }
}
function $f_sc_Iterator__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var i = start;
  var y = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var end = ((start + ((len < y) ? len : y)) | 0);
  while (((i < end) && $thiz.hasNext__Z())) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, $thiz.next__O());
    i = ((1 + i) | 0)
  }
}
/** @constructor */
function $c_sc_TraversableLike$WithFilter() {
  $c_O.call(this);
  this.p$1 = null;
  this.$$outer$1 = null
}
$c_sc_TraversableLike$WithFilter.prototype = new $h_O();
$c_sc_TraversableLike$WithFilter.prototype.constructor = $c_sc_TraversableLike$WithFilter;
/** @constructor */
function $h_sc_TraversableLike$WithFilter() {
  /*<skip>*/
}
$h_sc_TraversableLike$WithFilter.prototype = $c_sc_TraversableLike$WithFilter.prototype;
$c_sc_TraversableLike$WithFilter.prototype.foreach__F1__V = (function(f) {
  this.$$outer$1.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, f$1) {
    return (function(x$2) {
      return ($uZ($this.p$1.apply__O__O(x$2)) ? f$1.apply__O__O(x$2) : (void 0))
    })
  })(this, f)))
});
$c_sc_TraversableLike$WithFilter.prototype.init___sc_TraversableLike__F1 = (function($$outer, p) {
  this.p$1 = p;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
var $d_sc_TraversableLike$WithFilter = new $TypeData().initClass({
  sc_TraversableLike$WithFilter: 0
}, false, "scala.collection.TraversableLike$WithFilter", {
  sc_TraversableLike$WithFilter: 1,
  O: 1,
  scg_FilterMonadic: 1
});
$c_sc_TraversableLike$WithFilter.prototype.$classData = $d_sc_TraversableLike$WithFilter;
/** @constructor */
function $c_scg_GenSetFactory() {
  $c_scg_GenericCompanion.call(this)
}
$c_scg_GenSetFactory.prototype = new $h_scg_GenericCompanion();
$c_scg_GenSetFactory.prototype.constructor = $c_scg_GenSetFactory;
/** @constructor */
function $h_scg_GenSetFactory() {
  /*<skip>*/
}
$h_scg_GenSetFactory.prototype = $c_scg_GenSetFactory.prototype;
/** @constructor */
function $c_scg_GenTraversableFactory() {
  $c_scg_GenericCompanion.call(this);
  this.ReusableCBFInstance$2 = null
}
$c_scg_GenTraversableFactory.prototype = new $h_scg_GenericCompanion();
$c_scg_GenTraversableFactory.prototype.constructor = $c_scg_GenTraversableFactory;
/** @constructor */
function $h_scg_GenTraversableFactory() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory.prototype = $c_scg_GenTraversableFactory.prototype;
$c_scg_GenTraversableFactory.prototype.init___ = (function() {
  this.ReusableCBFInstance$2 = new $c_scg_GenTraversableFactory$$anon$1().init___scg_GenTraversableFactory(this);
  return this
});
/** @constructor */
function $c_scg_GenTraversableFactory$GenericCanBuildFrom() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype = new $h_O();
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.constructor = $c_scg_GenTraversableFactory$GenericCanBuildFrom;
/** @constructor */
function $h_scg_GenTraversableFactory$GenericCanBuildFrom() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory$GenericCanBuildFrom.prototype = $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype;
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__scm_Builder = (function() {
  return this.$$outer$1.newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__O__scm_Builder = (function(from) {
  var from$1 = $as_sc_GenTraversable(from);
  return from$1.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
/** @constructor */
function $c_scg_MapFactory() {
  $c_scg_GenMapFactory.call(this)
}
$c_scg_MapFactory.prototype = new $h_scg_GenMapFactory();
$c_scg_MapFactory.prototype.constructor = $c_scg_MapFactory;
/** @constructor */
function $h_scg_MapFactory() {
  /*<skip>*/
}
$h_scg_MapFactory.prototype = $c_scg_MapFactory.prototype;
/** @constructor */
function $c_sci_HashMap$$anon$2() {
  $c_sci_HashMap$Merger.call(this);
  this.invert$2 = null;
  this.mergef$1$f = null
}
$c_sci_HashMap$$anon$2.prototype = new $h_sci_HashMap$Merger();
$c_sci_HashMap$$anon$2.prototype.constructor = $c_sci_HashMap$$anon$2;
/** @constructor */
function $h_sci_HashMap$$anon$2() {
  /*<skip>*/
}
$h_sci_HashMap$$anon$2.prototype = $c_sci_HashMap$$anon$2.prototype;
$c_sci_HashMap$$anon$2.prototype.init___F2 = (function(mergef$1) {
  this.mergef$1$f = mergef$1;
  this.invert$2 = new $c_sci_HashMap$$anon$2$$anon$3().init___sci_HashMap$$anon$2(this);
  return this
});
$c_sci_HashMap$$anon$2.prototype.apply__T2__T2__T2 = (function(kv1, kv2) {
  return $as_T2(this.mergef$1$f.apply__O__O__O(kv1, kv2))
});
var $d_sci_HashMap$$anon$2 = new $TypeData().initClass({
  sci_HashMap$$anon$2: 0
}, false, "scala.collection.immutable.HashMap$$anon$2", {
  sci_HashMap$$anon$2: 1,
  sci_HashMap$Merger: 1,
  O: 1
});
$c_sci_HashMap$$anon$2.prototype.$classData = $d_sci_HashMap$$anon$2;
/** @constructor */
function $c_sci_HashMap$$anon$2$$anon$3() {
  $c_sci_HashMap$Merger.call(this);
  this.$$outer$2 = null
}
$c_sci_HashMap$$anon$2$$anon$3.prototype = new $h_sci_HashMap$Merger();
$c_sci_HashMap$$anon$2$$anon$3.prototype.constructor = $c_sci_HashMap$$anon$2$$anon$3;
/** @constructor */
function $h_sci_HashMap$$anon$2$$anon$3() {
  /*<skip>*/
}
$h_sci_HashMap$$anon$2$$anon$3.prototype = $c_sci_HashMap$$anon$2$$anon$3.prototype;
$c_sci_HashMap$$anon$2$$anon$3.prototype.apply__T2__T2__T2 = (function(kv1, kv2) {
  return $as_T2(this.$$outer$2.mergef$1$f.apply__O__O__O(kv2, kv1))
});
$c_sci_HashMap$$anon$2$$anon$3.prototype.init___sci_HashMap$$anon$2 = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  return this
});
var $d_sci_HashMap$$anon$2$$anon$3 = new $TypeData().initClass({
  sci_HashMap$$anon$2$$anon$3: 0
}, false, "scala.collection.immutable.HashMap$$anon$2$$anon$3", {
  sci_HashMap$$anon$2$$anon$3: 1,
  sci_HashMap$Merger: 1,
  O: 1
});
$c_sci_HashMap$$anon$2$$anon$3.prototype.$classData = $d_sci_HashMap$$anon$2$$anon$3;
/** @constructor */
function $c_sci_List$$anon$1() {
  $c_O.call(this)
}
$c_sci_List$$anon$1.prototype = new $h_O();
$c_sci_List$$anon$1.prototype.constructor = $c_sci_List$$anon$1;
/** @constructor */
function $h_sci_List$$anon$1() {
  /*<skip>*/
}
$h_sci_List$$anon$1.prototype = $c_sci_List$$anon$1.prototype;
$c_sci_List$$anon$1.prototype.init___ = (function() {
  return this
});
$c_sci_List$$anon$1.prototype.apply__O__O = (function(x) {
  return this
});
$c_sci_List$$anon$1.prototype.toString__T = (function() {
  return "<function1>"
});
$c_sci_List$$anon$1.prototype.apply$mcZI$sp__I__Z = (function(v1) {
  return $uZ(this)
});
var $d_sci_List$$anon$1 = new $TypeData().initClass({
  sci_List$$anon$1: 0
}, false, "scala.collection.immutable.List$$anon$1", {
  sci_List$$anon$1: 1,
  O: 1,
  F1: 1
});
$c_sci_List$$anon$1.prototype.$classData = $d_sci_List$$anon$1;
function $f_scm_Builder__sizeHint__sc_TraversableLike__V($thiz, coll) {
  var x1 = coll.sizeHintIfCheap__I();
  switch (x1) {
    case (-1): {
      break
    }
    default: {
      $thiz.sizeHint__I__V(x1)
    }
  }
}
function $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V($thiz, size, boundingColl) {
  var x1 = boundingColl.sizeHintIfCheap__I();
  switch (x1) {
    case (-1): {
      break
    }
    default: {
      $thiz.sizeHint__I__V(((size < x1) ? size : x1))
    }
  }
}
function $is_scm_Builder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Builder)))
}
function $as_scm_Builder(obj) {
  return (($is_scm_Builder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.Builder"))
}
function $isArrayOf_scm_Builder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Builder)))
}
function $asArrayOf_scm_Builder(obj, depth) {
  return (($isArrayOf_scm_Builder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.Builder;", depth))
}
/** @constructor */
function $c_sr_AbstractFunction0() {
  $c_O.call(this)
}
$c_sr_AbstractFunction0.prototype = new $h_O();
$c_sr_AbstractFunction0.prototype.constructor = $c_sr_AbstractFunction0;
/** @constructor */
function $h_sr_AbstractFunction0() {
  /*<skip>*/
}
$h_sr_AbstractFunction0.prototype = $c_sr_AbstractFunction0.prototype;
$c_sr_AbstractFunction0.prototype.toString__T = (function() {
  return "<function0>"
});
/** @constructor */
function $c_sr_AbstractFunction1() {
  $c_O.call(this)
}
$c_sr_AbstractFunction1.prototype = new $h_O();
$c_sr_AbstractFunction1.prototype.constructor = $c_sr_AbstractFunction1;
/** @constructor */
function $h_sr_AbstractFunction1() {
  /*<skip>*/
}
$h_sr_AbstractFunction1.prototype = $c_sr_AbstractFunction1.prototype;
$c_sr_AbstractFunction1.prototype.toString__T = (function() {
  return "<function1>"
});
$c_sr_AbstractFunction1.prototype.apply$mcZI$sp__I__Z = (function(v1) {
  return $uZ(this.apply__O__O(v1))
});
/** @constructor */
function $c_sr_AbstractFunction2() {
  $c_O.call(this)
}
$c_sr_AbstractFunction2.prototype = new $h_O();
$c_sr_AbstractFunction2.prototype.constructor = $c_sr_AbstractFunction2;
/** @constructor */
function $h_sr_AbstractFunction2() {
  /*<skip>*/
}
$h_sr_AbstractFunction2.prototype = $c_sr_AbstractFunction2.prototype;
$c_sr_AbstractFunction2.prototype.toString__T = (function() {
  return "<function2>"
});
/** @constructor */
function $c_sr_BooleanRef() {
  $c_O.call(this);
  this.elem$1 = false
}
$c_sr_BooleanRef.prototype = new $h_O();
$c_sr_BooleanRef.prototype.constructor = $c_sr_BooleanRef;
/** @constructor */
function $h_sr_BooleanRef() {
  /*<skip>*/
}
$h_sr_BooleanRef.prototype = $c_sr_BooleanRef.prototype;
$c_sr_BooleanRef.prototype.toString__T = (function() {
  var b = this.elem$1;
  return ("" + b)
});
$c_sr_BooleanRef.prototype.init___Z = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_BooleanRef = new $TypeData().initClass({
  sr_BooleanRef: 0
}, false, "scala.runtime.BooleanRef", {
  sr_BooleanRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_BooleanRef.prototype.$classData = $d_sr_BooleanRef;
function $isArrayOf_sr_BoxedUnit(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BoxedUnit)))
}
function $asArrayOf_sr_BoxedUnit(obj, depth) {
  return (($isArrayOf_sr_BoxedUnit(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.runtime.BoxedUnit;", depth))
}
var $d_sr_BoxedUnit = new $TypeData().initClass({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", {
  sr_BoxedUnit: 1,
  O: 1,
  Ljava_io_Serializable: 1
}, (void 0), (void 0), (function(x) {
  return (x === (void 0))
}));
/** @constructor */
function $c_sr_IntRef() {
  $c_O.call(this);
  this.elem$1 = 0
}
$c_sr_IntRef.prototype = new $h_O();
$c_sr_IntRef.prototype.constructor = $c_sr_IntRef;
/** @constructor */
function $h_sr_IntRef() {
  /*<skip>*/
}
$h_sr_IntRef.prototype = $c_sr_IntRef.prototype;
$c_sr_IntRef.prototype.toString__T = (function() {
  var i = this.elem$1;
  return ("" + i)
});
$c_sr_IntRef.prototype.init___I = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_IntRef = new $TypeData().initClass({
  sr_IntRef: 0
}, false, "scala.runtime.IntRef", {
  sr_IntRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_IntRef.prototype.$classData = $d_sr_IntRef;
/** @constructor */
function $c_sr_ObjectRef() {
  $c_O.call(this);
  this.elem$1 = null
}
$c_sr_ObjectRef.prototype = new $h_O();
$c_sr_ObjectRef.prototype.constructor = $c_sr_ObjectRef;
/** @constructor */
function $h_sr_ObjectRef() {
  /*<skip>*/
}
$h_sr_ObjectRef.prototype = $c_sr_ObjectRef.prototype;
$c_sr_ObjectRef.prototype.toString__T = (function() {
  var obj = this.elem$1;
  return ("" + obj)
});
$c_sr_ObjectRef.prototype.init___O = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_ObjectRef = new $TypeData().initClass({
  sr_ObjectRef: 0
}, false, "scala.runtime.ObjectRef", {
  sr_ObjectRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_ObjectRef.prototype.$classData = $d_sr_ObjectRef;
/** @constructor */
function $c_Luserinput_OculusControllerLeft$() {
  $c_Luserinput_OculusController.call(this);
  this.name$2 = null;
  this.X$undPressBegan$2 = null;
  this.X$undPressEnded$2 = null;
  this.Y$undPressBegan$2 = null;
  this.Y$undPressEnded$2 = null
}
$c_Luserinput_OculusControllerLeft$.prototype = new $h_Luserinput_OculusController();
$c_Luserinput_OculusControllerLeft$.prototype.constructor = $c_Luserinput_OculusControllerLeft$;
/** @constructor */
function $h_Luserinput_OculusControllerLeft$() {
  /*<skip>*/
}
$h_Luserinput_OculusControllerLeft$.prototype = $c_Luserinput_OculusControllerLeft$.prototype;
$c_Luserinput_OculusControllerLeft$.prototype.init___ = (function() {
  $c_Luserinput_OculusController.prototype.init___.call(this);
  this.name$2 = "Oculus Touch (Left)";
  this.X$undPressBegan$2 = "X press began";
  this.X$undPressEnded$2 = "X press ended";
  this.Y$undPressBegan$2 = "Y press began";
  this.Y$undPressEnded$2 = "Y press ended";
  return this
});
$c_Luserinput_OculusControllerLeft$.prototype.setup__Lfacades_IFThree$VRController__V = (function(vrc) {
  $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["", " Connected!"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.name$2])));
  this.init__Lfacades_IFThree$VRController__I__V(vrc, this.meshColorBlue$1);
  vrc.addEventListener(this.ThumbRest$undTouchBegan$1, (function($this) {
    return (function(event$2) {
      $m_Lutil_Log$().apply__T__V("Thumbrest Touch Began");
      $m_Luserinput_OculusControllerLeft$().rayCasterArrow$1.visible = true
    })
  })(this));
  vrc.addEventListener(this.ThumbRest$undTouchEnded$1, (function(this$2) {
    return (function(event$3$2) {
      $m_Lutil_Log$().apply__T__V("Thumbrest Touch Ended");
      $m_Luserinput_OculusControllerLeft$().rayCasterArrow$1.visible = false
    })
  })(this));
  vrc.addEventListener(this.Primary$undPressBegan$1, (function(this$3) {
    return (function(event$4$2) {
      $m_Lutil_Log$().apply__T__V("Primary Press Began")
    })
  })(this));
  vrc.addEventListener(this.Primary$undPressEnded$1, (function(this$4) {
    return (function(event$5$2) {
      $m_Lutil_Log$().apply__T__V("Primary Press Ended")
    })
  })(this));
  vrc.addEventListener(this.Grip$undPressBegan$1, (function(this$5) {
    return (function(event$6$2) {
      $m_Lutil_Log$().apply__T__V("Grip Press Began")
    })
  })(this));
  vrc.addEventListener(this.Grip$undPressEnded$1, (function(this$6) {
    return (function(event$7$2) {
      $m_Lutil_Log$().apply__T__V("Grip Press Ended")
    })
  })(this));
  vrc.addEventListener(this.Axes$undChanged$1, (function(this$7) {
    return (function(event$8$2) {
      $m_Lutil_Log$().apply__T__V("Axes Changed")
    })
  })(this));
  vrc.addEventListener(this.X$undPressBegan$2, (function(this$8) {
    return (function(event$9$2) {
      $m_Lutil_Log$().apply__T__V("X Press Began")
    })
  })(this));
  vrc.addEventListener(this.X$undPressEnded$2, (function(this$9) {
    return (function(event$10$2) {
      $m_Lutil_Log$().apply__T__V("X Press Ended")
    })
  })(this));
  vrc.addEventListener(this.Y$undPressBegan$2, (function(this$10) {
    return (function(event$11$2) {
      $m_Lutil_Log$().apply__T__V("Y Press Began")
    })
  })(this));
  vrc.addEventListener(this.Y$undPressEnded$2, (function(this$11) {
    return (function(event$12$2) {
      $m_Lutil_Log$().apply__T__V("Y Press Ended")
    })
  })(this));
  vrc.addEventListener(this.Disconnected$1, (function(this$12, vrc$1) {
    return (function(event$13$2) {
      vrc$1.parent.remove(vrc$1);
      $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["", " Disconnected!"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$m_Luserinput_OculusControllerLeft$().name$2])))
    })
  })(this, vrc))
});
var $d_Luserinput_OculusControllerLeft$ = new $TypeData().initClass({
  Luserinput_OculusControllerLeft$: 0
}, false, "userinput.OculusControllerLeft$", {
  Luserinput_OculusControllerLeft$: 1,
  Luserinput_OculusController: 1,
  O: 1,
  Luserinput_OculusTouchEvents: 1
});
$c_Luserinput_OculusControllerLeft$.prototype.$classData = $d_Luserinput_OculusControllerLeft$;
var $n_Luserinput_OculusControllerLeft$ = (void 0);
function $m_Luserinput_OculusControllerLeft$() {
  if ((!$n_Luserinput_OculusControllerLeft$)) {
    $n_Luserinput_OculusControllerLeft$ = new $c_Luserinput_OculusControllerLeft$().init___()
  };
  return $n_Luserinput_OculusControllerLeft$
}
/** @constructor */
function $c_Luserinput_OculusControllerRight$() {
  $c_Luserinput_OculusController.call(this);
  this.name$2 = null;
  this.A$undPressBegan$2 = null;
  this.A$undPressEnded$2 = null;
  this.B$undPressBegan$2 = null;
  this.B$undPressEnded$2 = null;
  this.captured$2 = null;
  this.capturedDiff$2 = null
}
$c_Luserinput_OculusControllerRight$.prototype = new $h_Luserinput_OculusController();
$c_Luserinput_OculusControllerRight$.prototype.constructor = $c_Luserinput_OculusControllerRight$;
/** @constructor */
function $h_Luserinput_OculusControllerRight$() {
  /*<skip>*/
}
$h_Luserinput_OculusControllerRight$.prototype = $c_Luserinput_OculusControllerRight$.prototype;
$c_Luserinput_OculusControllerRight$.prototype.init___ = (function() {
  $c_Luserinput_OculusController.prototype.init___.call(this);
  $n_Luserinput_OculusControllerRight$ = this;
  this.name$2 = "Oculus Touch (Right)";
  this.A$undPressBegan$2 = "A press began";
  this.A$undPressEnded$2 = "A press ended";
  this.B$undPressBegan$2 = "B press began";
  this.B$undPressEnded$2 = "B press ended";
  this.captured$2 = $m_s_None$();
  return this
});
$c_Luserinput_OculusControllerRight$.prototype.setup__Lfacades_IFThree$VRController__V = (function(vrc) {
  $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["", " Connected!"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.name$2])));
  this.init__Lfacades_IFThree$VRController__I__V(vrc, this.meshColorRed$1);
  vrc.addEventListener(this.ThumbRest$undTouchBegan$1, (function($this) {
    return (function(event$2) {
      $m_Lutil_Log$().apply__T__V("Thumbrest Touch Began");
      $m_Luserinput_OculusControllerRight$().rayCasterArrow$1.visible = true
    })
  })(this));
  vrc.addEventListener(this.ThumbRest$undTouchEnded$1, (function(this$2) {
    return (function(event$3$2) {
      $m_Lutil_Log$().apply__T__V("Thumbrest Touch Ended");
      $m_Luserinput_OculusControllerRight$().rayCasterArrow$1.visible = false
    })
  })(this));
  vrc.addEventListener(this.Primary$undPressBegan$1, (function(this$3) {
    return (function(event$4$2) {
      $m_Lutil_Log$().apply__T__V("Primary Press Began")
    })
  })(this));
  vrc.addEventListener(this.Primary$undPressEnded$1, (function(this$4) {
    return (function(event$5$2) {
      $m_Lutil_Log$().apply__T__V("Primary Press Ended")
    })
  })(this));
  vrc.addEventListener(this.Grip$undPressBegan$1, (function(this$5, vrc$1) {
    return (function(event$6$2) {
      var this$1 = $m_Lenv_Environment$().instance$1;
      var regions = this$1.env$Environment$$Regions__Lenv_Environment$Regions$().regions$1;
      var i = 0;
      var len = regions.u.length;
      while ((i < len)) {
        var index = i;
        var arg1 = regions.get(index);
        var controllerPos = vrc$1.position;
        if (($m_Luserinput_OculusControllerRight$().captured$2.isEmpty__Z() && ($uD(arg1.position.distanceTo(controllerPos)) < 0.5))) {
          $g.THREE.SceneUtils.attach(arg1, $m_Lenv_Environment$().instance$1.scene$1, vrc$1);
          $m_Luserinput_OculusControllerRight$().captured$2 = new $c_s_Some().init___O(arg1)
        };
        i = ((1 + i) | 0)
      };
      $m_Lutil_Log$().apply__T__V("Grip Press Began")
    })
  })(this, vrc));
  vrc.addEventListener(this.Grip$undPressEnded$1, (function(this$6$1, vrc$2) {
    return (function(event$7$2) {
      var this$9 = $m_Luserinput_OculusControllerRight$().captured$2;
      if (this$9.isDefined__Z()) {
        var dropped = $m_Luserinput_OculusControllerRight$().captured$2.get__O();
        $g.THREE.SceneUtils.detach(dropped, vrc$2, $m_Lenv_Environment$().instance$1.scene$1);
        $m_Luserinput_OculusControllerRight$().captured$2 = $m_s_None$()
      };
      $m_Lutil_Log$().apply__T__V("Grip Press Ended")
    })
  })(this, vrc));
  vrc.addEventListener(this.Axes$undChanged$1, (function(this$7$1) {
    return (function(event$8$2) {
      $m_Lutil_Log$().apply__T__V("Axes Changed")
    })
  })(this));
  vrc.addEventListener(this.A$undPressBegan$2, (function(this$8$1) {
    return (function(event$9$2) {
      $m_Lutil_Log$().apply__T__V("A Press Began")
    })
  })(this));
  vrc.addEventListener(this.A$undPressEnded$2, (function(this$9$1) {
    return (function(event$10$2) {
      $m_Lutil_Log$().apply__T__V("A Press Ended")
    })
  })(this));
  vrc.addEventListener(this.B$undPressBegan$2, (function(this$10) {
    return (function(event$11$2) {
      $m_Lutil_Log$().apply__T__V("B Press Began")
    })
  })(this));
  vrc.addEventListener(this.B$undPressEnded$2, (function(this$11) {
    return (function(event$12$2) {
      $m_Lutil_Log$().apply__T__V("B Press Ended")
    })
  })(this));
  vrc.addEventListener(this.Disconnected$1, (function(this$12, vrc$3) {
    return (function(event$13$2) {
      vrc$3.parent.remove(vrc$3);
      $m_Lutil_Log$().apply__T__V(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["", " Disconnected!"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$m_Luserinput_OculusControllerRight$().name$2])))
    })
  })(this, vrc))
});
var $d_Luserinput_OculusControllerRight$ = new $TypeData().initClass({
  Luserinput_OculusControllerRight$: 0
}, false, "userinput.OculusControllerRight$", {
  Luserinput_OculusControllerRight$: 1,
  Luserinput_OculusController: 1,
  O: 1,
  Luserinput_OculusTouchEvents: 1
});
$c_Luserinput_OculusControllerRight$.prototype.$classData = $d_Luserinput_OculusControllerRight$;
var $n_Luserinput_OculusControllerRight$ = (void 0);
function $m_Luserinput_OculusControllerRight$() {
  if ((!$n_Luserinput_OculusControllerRight$)) {
    $n_Luserinput_OculusControllerRight$ = new $c_Luserinput_OculusControllerRight$().init___()
  };
  return $n_Luserinput_OculusControllerRight$
}
/** @constructor */
function $c_Lutil_TimedFunction1() {
  $c_O.call(this);
  this.func$1 = null;
  this.startTime$1 = 0.0;
  this.preCallDescription$1 = null;
  this.onCalledDescription$1 = null
}
$c_Lutil_TimedFunction1.prototype = new $h_O();
$c_Lutil_TimedFunction1.prototype.constructor = $c_Lutil_TimedFunction1;
/** @constructor */
function $h_Lutil_TimedFunction1() {
  /*<skip>*/
}
$h_Lutil_TimedFunction1.prototype = $c_Lutil_TimedFunction1.prototype;
$c_Lutil_TimedFunction1.prototype.apply__O__O = (function(v1) {
  this.apply__O__V(v1)
});
$c_Lutil_TimedFunction1.prototype.toString__T = (function() {
  return "<function1>"
});
$c_Lutil_TimedFunction1.prototype.apply$mcZI$sp__I__Z = (function(v1) {
  return $uZ((this.apply__O__V(v1), (void 0)))
});
$c_Lutil_TimedFunction1.prototype.init___F1 = (function(func) {
  this.func$1 = func;
  $f_Lutil_Timing__$$init$__V(this);
  this.startTime$1 = $uD(new $g.Date().getTime());
  return this
});
$c_Lutil_TimedFunction1.prototype.apply__O__V = (function(input) {
  var callbackTime = $uD(new $g.Date().getTime());
  this.func$1.apply__O__O(input);
  var endTime = $uD(new $g.Date().getTime());
  var startTime = this.startTime$1;
  var desc = this.preCallDescription$1;
  $f_Lutil_Timing__displayDetails__D__D__s_Option__V(this, startTime, callbackTime, desc);
  var desc$1 = this.onCalledDescription$1;
  $f_Lutil_Timing__displayDetails__D__D__s_Option__V(this, callbackTime, endTime, desc$1)
});
var $d_Lutil_TimedFunction1 = new $TypeData().initClass({
  Lutil_TimedFunction1: 0
}, false, "util.TimedFunction1", {
  Lutil_TimedFunction1: 1,
  O: 1,
  F1: 1,
  Lutil_Timing: 1
});
$c_Lutil_TimedFunction1.prototype.$classData = $d_Lutil_TimedFunction1;
var $d_jl_Boolean = new $TypeData().initClass({
  jl_Boolean: 0
}, false, "java.lang.Boolean", {
  jl_Boolean: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "boolean")
}));
/** @constructor */
function $c_jl_Character() {
  $c_O.call(this);
  this.value$1 = 0
}
$c_jl_Character.prototype = new $h_O();
$c_jl_Character.prototype.constructor = $c_jl_Character;
/** @constructor */
function $h_jl_Character() {
  /*<skip>*/
}
$h_jl_Character.prototype = $c_jl_Character.prototype;
$c_jl_Character.prototype.equals__O__Z = (function(that) {
  if ($is_jl_Character(that)) {
    var jsx$1 = this.value$1;
    var this$1 = $as_jl_Character(that);
    return (jsx$1 === this$1.value$1)
  } else {
    return false
  }
});
$c_jl_Character.prototype.toString__T = (function() {
  var c = this.value$1;
  return $as_T($g.String.fromCharCode(c))
});
$c_jl_Character.prototype.init___C = (function(value) {
  this.value$1 = value;
  return this
});
$c_jl_Character.prototype.hashCode__I = (function() {
  return this.value$1
});
function $is_jl_Character(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Character)))
}
function $as_jl_Character(obj) {
  return (($is_jl_Character(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Character"))
}
function $isArrayOf_jl_Character(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Character)))
}
function $asArrayOf_jl_Character(obj, depth) {
  return (($isArrayOf_jl_Character(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Character;", depth))
}
var $d_jl_Character = new $TypeData().initClass({
  jl_Character: 0
}, false, "java.lang.Character", {
  jl_Character: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_jl_Character.prototype.$classData = $d_jl_Character;
/** @constructor */
function $c_jl_Character$() {
  $c_O.call(this);
  this.java$lang$Character$$charTypesFirst256$1 = null;
  this.charTypeIndices$1 = null;
  this.charTypes$1 = null;
  this.isMirroredIndices$1 = null;
  this.bitmap$0$1 = 0
}
$c_jl_Character$.prototype = new $h_O();
$c_jl_Character$.prototype.constructor = $c_jl_Character$;
/** @constructor */
function $h_jl_Character$() {
  /*<skip>*/
}
$h_jl_Character$.prototype = $c_jl_Character$.prototype;
$c_jl_Character$.prototype.init___ = (function() {
  return this
});
$c_jl_Character$.prototype.digit__C__I__I = (function(c, radix) {
  return (((radix > 36) || (radix < 2)) ? (-1) : ((((c >= 48) && (c <= 57)) && ((((-48) + c) | 0) < radix)) ? (((-48) + c) | 0) : ((((c >= 65) && (c <= 90)) && ((((-65) + c) | 0) < (((-10) + radix) | 0))) ? (((-55) + c) | 0) : ((((c >= 97) && (c <= 122)) && ((((-97) + c) | 0) < (((-10) + radix) | 0))) ? (((-87) + c) | 0) : ((((c >= 65313) && (c <= 65338)) && ((((-65313) + c) | 0) < (((-10) + radix) | 0))) ? (((-65303) + c) | 0) : ((((c >= 65345) && (c <= 65370)) && ((((-65345) + c) | 0) < (((-10) + radix) | 0))) ? (((-65303) + c) | 0) : (-1)))))))
});
var $d_jl_Character$ = new $TypeData().initClass({
  jl_Character$: 0
}, false, "java.lang.Character$", {
  jl_Character$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Character$.prototype.$classData = $d_jl_Character$;
var $n_jl_Character$ = (void 0);
function $m_jl_Character$() {
  if ((!$n_jl_Character$)) {
    $n_jl_Character$ = new $c_jl_Character$().init___()
  };
  return $n_jl_Character$
}
/** @constructor */
function $c_jl_Double$() {
  $c_O.call(this);
  this.doubleStrPat$1 = null;
  this.bitmap$0$1 = false
}
$c_jl_Double$.prototype = new $h_O();
$c_jl_Double$.prototype.constructor = $c_jl_Double$;
/** @constructor */
function $h_jl_Double$() {
  /*<skip>*/
}
$h_jl_Double$.prototype = $c_jl_Double$.prototype;
$c_jl_Double$.prototype.init___ = (function() {
  return this
});
$c_jl_Double$.prototype.doubleStrPat__p1__sjs_js_RegExp = (function() {
  return ((!this.bitmap$0$1) ? this.doubleStrPat$lzycompute__p1__sjs_js_RegExp() : this.doubleStrPat$1)
});
$c_jl_Double$.prototype.doubleStrPat$lzycompute__p1__sjs_js_RegExp = (function() {
  if ((!this.bitmap$0$1)) {
    this.doubleStrPat$1 = new $g.RegExp("^[\\x00-\\x20]*[+-]?(NaN|Infinity|(\\d+\\.?\\d*|\\.\\d+)([eE][+-]?\\d+)?)[fFdD]?[\\x00-\\x20]*$");
    this.bitmap$0$1 = true
  };
  return this.doubleStrPat$1
});
$c_jl_Double$.prototype.compare__D__D__I = (function(a, b) {
  if ((a !== a)) {
    return ((b !== b) ? 0 : 1)
  } else if ((b !== b)) {
    return (-1)
  } else if ((a === b)) {
    if ((a === 0.0)) {
      var ainf = (1.0 / a);
      return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
    } else {
      return 0
    }
  } else {
    return ((a < b) ? (-1) : 1)
  }
});
$c_jl_Double$.prototype.parseDouble__T__D = (function(s) {
  if ($uZ(this.doubleStrPat__p1__sjs_js_RegExp().test(s))) {
    return $uD($g.parseFloat(s))
  } else {
    throw new $c_jl_NumberFormatException().init___T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["For input string: \"", "\""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([s])))
  }
});
var $d_jl_Double$ = new $TypeData().initClass({
  jl_Double$: 0
}, false, "java.lang.Double$", {
  jl_Double$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Double$.prototype.$classData = $d_jl_Double$;
var $n_jl_Double$ = (void 0);
function $m_jl_Double$() {
  if ((!$n_jl_Double$)) {
    $n_jl_Double$ = new $c_jl_Double$().init___()
  };
  return $n_jl_Double$
}
/** @constructor */
function $c_jl_Error() {
  $c_jl_Throwable.call(this)
}
$c_jl_Error.prototype = new $h_jl_Throwable();
$c_jl_Error.prototype.constructor = $c_jl_Error;
/** @constructor */
function $h_jl_Error() {
  /*<skip>*/
}
$h_jl_Error.prototype = $c_jl_Error.prototype;
function $is_jl_Error(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Error)))
}
function $as_jl_Error(obj) {
  return (($is_jl_Error(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Error"))
}
function $isArrayOf_jl_Error(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Error)))
}
function $asArrayOf_jl_Error(obj, depth) {
  return (($isArrayOf_jl_Error(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Error;", depth))
}
/** @constructor */
function $c_jl_Exception() {
  $c_jl_Throwable.call(this)
}
$c_jl_Exception.prototype = new $h_jl_Throwable();
$c_jl_Exception.prototype.constructor = $c_jl_Exception;
/** @constructor */
function $h_jl_Exception() {
  /*<skip>*/
}
$h_jl_Exception.prototype = $c_jl_Exception.prototype;
/** @constructor */
function $c_jl_Integer$() {
  $c_O.call(this)
}
$c_jl_Integer$.prototype = new $h_O();
$c_jl_Integer$.prototype.constructor = $c_jl_Integer$;
/** @constructor */
function $h_jl_Integer$() {
  /*<skip>*/
}
$h_jl_Integer$.prototype = $c_jl_Integer$.prototype;
$c_jl_Integer$.prototype.init___ = (function() {
  return this
});
$c_jl_Integer$.prototype.fail$1__p1__T__sr_Nothing$ = (function(s$1) {
  throw new $c_jl_NumberFormatException().init___T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["For input string: \"", "\""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([s$1])))
});
$c_jl_Integer$.prototype.parseInt__T__I__I = (function(s, radix) {
  if ((s === null)) {
    var jsx$1 = true
  } else {
    var this$2 = new $c_sci_StringOps().init___T(s);
    var $$this = this$2.repr$1;
    var jsx$1 = ($uI($$this.length) === 0)
  };
  if (((jsx$1 || (radix < 2)) || (radix > 36))) {
    this.fail$1__p1__T__sr_Nothing$(s)
  } else {
    var i = ((((65535 & $uI(s.charCodeAt(0))) === 45) || ((65535 & $uI(s.charCodeAt(0))) === 43)) ? 1 : 0);
    var this$12 = new $c_sci_StringOps().init___T(s);
    var $$this$1 = this$12.repr$1;
    if (($uI($$this$1.length) <= i)) {
      this.fail$1__p1__T__sr_Nothing$(s)
    } else {
      while (true) {
        var jsx$2 = i;
        var this$16 = new $c_sci_StringOps().init___T(s);
        var $$this$2 = this$16.repr$1;
        if ((jsx$2 < $uI($$this$2.length))) {
          var jsx$3 = $m_jl_Character$();
          var index = i;
          if ((jsx$3.digit__C__I__I((65535 & $uI(s.charCodeAt(index))), radix) < 0)) {
            this.fail$1__p1__T__sr_Nothing$(s)
          };
          i = ((1 + i) | 0)
        } else {
          break
        }
      };
      var res = $uD($g.parseInt(s, radix));
      return (((res !== res) || ((res > 2147483647) || (res < (-2147483648)))) ? this.fail$1__p1__T__sr_Nothing$(s) : $doubleToInt(res))
    }
  }
});
$c_jl_Integer$.prototype.bitCount__I__I = (function(i) {
  var t1 = ((i - (1431655765 & (i >> 1))) | 0);
  var t2 = (((858993459 & t1) + (858993459 & (t1 >> 2))) | 0);
  return ($imul(16843009, (252645135 & ((t2 + (t2 >> 4)) | 0))) >> 24)
});
var $d_jl_Integer$ = new $TypeData().initClass({
  jl_Integer$: 0
}, false, "java.lang.Integer$", {
  jl_Integer$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Integer$.prototype.$classData = $d_jl_Integer$;
var $n_jl_Integer$ = (void 0);
function $m_jl_Integer$() {
  if ((!$n_jl_Integer$)) {
    $n_jl_Integer$ = new $c_jl_Integer$().init___()
  };
  return $n_jl_Integer$
}
/** @constructor */
function $c_ju_concurrent_atomic_AtomicReference() {
  $c_O.call(this);
  this.value$1 = null
}
$c_ju_concurrent_atomic_AtomicReference.prototype = new $h_O();
$c_ju_concurrent_atomic_AtomicReference.prototype.constructor = $c_ju_concurrent_atomic_AtomicReference;
/** @constructor */
function $h_ju_concurrent_atomic_AtomicReference() {
  /*<skip>*/
}
$h_ju_concurrent_atomic_AtomicReference.prototype = $c_ju_concurrent_atomic_AtomicReference.prototype;
$c_ju_concurrent_atomic_AtomicReference.prototype.compareAndSet__O__O__Z = (function(expect, update) {
  if ((expect === this.value$1)) {
    this.value$1 = update;
    return true
  } else {
    return false
  }
});
$c_ju_concurrent_atomic_AtomicReference.prototype.init___O = (function(value) {
  this.value$1 = value;
  return this
});
/** @constructor */
function $c_ju_regex_Pattern() {
  $c_O.call(this);
  this.jsRegExp$1 = null;
  this.$$undpattern$1 = null;
  this.$$undflags$1 = 0
}
$c_ju_regex_Pattern.prototype = new $h_O();
$c_ju_regex_Pattern.prototype.constructor = $c_ju_regex_Pattern;
/** @constructor */
function $h_ju_regex_Pattern() {
  /*<skip>*/
}
$h_ju_regex_Pattern.prototype = $c_ju_regex_Pattern.prototype;
$c_ju_regex_Pattern.prototype.init___sjs_js_RegExp__T__I = (function(jsRegExp, _pattern, _flags) {
  this.jsRegExp$1 = jsRegExp;
  this.$$undpattern$1 = _pattern;
  this.$$undflags$1 = _flags;
  return this
});
$c_ju_regex_Pattern.prototype.toString__T = (function() {
  return this.$$undpattern$1
});
$c_ju_regex_Pattern.prototype.split__jl_CharSequence__I__AT = (function(input, limit) {
  var inputStr = $objectToString(input);
  if ((inputStr === "")) {
    var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([""]);
    var len = $uI(xs.array$6.length);
    var array = $newArrayObject($d_T.getArrayOf(), [len]);
    var elem$1 = 0;
    elem$1 = 0;
    var this$4 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(xs, 0, $uI(xs.array$6.length));
    while (this$4.hasNext__Z()) {
      var arg1 = this$4.next__O();
      array.set(elem$1, arg1);
      elem$1 = ((1 + elem$1) | 0)
    };
    return array
  } else {
    var lim = ((limit > 0) ? limit : 2147483647);
    var matcher = new $c_ju_regex_Matcher().init___ju_regex_Pattern__jl_CharSequence__I__I(this, inputStr, 0, $uI(inputStr.length));
    var elems$2 = null;
    elems$2 = [];
    var prevEnd = 0;
    var size = 0;
    while (((size < (((-1) + lim) | 0)) && matcher.find__Z())) {
      if ((matcher.end__I() !== 0)) {
        var beginIndex = prevEnd;
        var endIndex = matcher.start__I();
        var elem = $as_T(inputStr.substring(beginIndex, endIndex));
        var unboxedElem = ((elem === null) ? null : elem);
        elems$2.push(unboxedElem);
        size = ((1 + size) | 0)
      };
      prevEnd = matcher.end__I()
    };
    var beginIndex$1 = prevEnd;
    var elem$2 = $as_T(inputStr.substring(beginIndex$1));
    var unboxedElem$1 = ((elem$2 === null) ? null : elem$2);
    elems$2.push(unboxedElem$1);
    var result = $makeNativeArrayWrapper($d_T.getArrayOf(), elems$2);
    if ((limit !== 0)) {
      return result
    } else {
      var actualLength = result.u.length;
      while (((actualLength !== 0) && (result.get((((-1) + actualLength) | 0)) === ""))) {
        actualLength = (((-1) + actualLength) | 0)
      };
      if ((actualLength === result.u.length)) {
        return result
      } else {
        var actualResult = $newArrayObject($d_T.getArrayOf(), [actualLength]);
        $systemArraycopy(result, 0, actualResult, 0, actualLength);
        return actualResult
      }
    }
  }
});
$c_ju_regex_Pattern.prototype.newJSRegExp__sjs_js_RegExp = (function() {
  var r = new $g.RegExp(this.jsRegExp$1);
  if ((r !== this.jsRegExp$1)) {
    return r
  } else {
    var jsFlags = ((($uZ(this.jsRegExp$1.global) ? "g" : "") + ($uZ(this.jsRegExp$1.ignoreCase) ? "i" : "")) + ($uZ(this.jsRegExp$1.multiline) ? "m" : ""));
    return new $g.RegExp($as_T(this.jsRegExp$1.source), jsFlags)
  }
});
var $d_ju_regex_Pattern = new $TypeData().initClass({
  ju_regex_Pattern: 0
}, false, "java.util.regex.Pattern", {
  ju_regex_Pattern: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_regex_Pattern.prototype.$classData = $d_ju_regex_Pattern;
/** @constructor */
function $c_ju_regex_Pattern$() {
  $c_O.call(this);
  this.java$util$regex$Pattern$$splitHackPat$1 = null;
  this.java$util$regex$Pattern$$flagHackPat$1 = null
}
$c_ju_regex_Pattern$.prototype = new $h_O();
$c_ju_regex_Pattern$.prototype.constructor = $c_ju_regex_Pattern$;
/** @constructor */
function $h_ju_regex_Pattern$() {
  /*<skip>*/
}
$h_ju_regex_Pattern$.prototype = $c_ju_regex_Pattern$.prototype;
$c_ju_regex_Pattern$.prototype.init___ = (function() {
  $n_ju_regex_Pattern$ = this;
  this.java$util$regex$Pattern$$splitHackPat$1 = new $g.RegExp("^\\\\Q(.|\\n|\\r)\\\\E$");
  this.java$util$regex$Pattern$$flagHackPat$1 = new $g.RegExp("^\\(\\?([idmsuxU]*)(?:-([idmsuxU]*))?\\)");
  return this
});
$c_ju_regex_Pattern$.prototype.matches__T__jl_CharSequence__Z = (function(regex, input) {
  var this$1 = this.compile__T__I__ju_regex_Pattern(regex, 0);
  return new $c_ju_regex_Matcher().init___ju_regex_Pattern__jl_CharSequence__I__I(this$1, input, 0, $charSequenceLength(input)).matches__Z()
});
$c_ju_regex_Pattern$.prototype.compile__T__I__ju_regex_Pattern = (function(regex, flags) {
  if (((16 & flags) !== 0)) {
    var x1 = new $c_T2().init___O__O(this.quote__T__T(regex), flags)
  } else {
    var m = this.java$util$regex$Pattern$$splitHackPat$1.exec(regex);
    if ((m !== null)) {
      var value = m[1];
      if ((value === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var this$5 = new $c_s_Some().init___O(new $c_T2().init___O__O(this.quote__T__T($as_T(value)), flags))
    } else {
      var this$5 = $m_s_None$()
    };
    if (this$5.isEmpty__Z()) {
      var this$6 = $m_ju_regex_Pattern$();
      var m$1 = this$6.java$util$regex$Pattern$$flagHackPat$1.exec(regex);
      if ((m$1 !== null)) {
        var value$1 = m$1[0];
        if ((value$1 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        var thiz = $as_T(value$1);
        var beginIndex = $uI(thiz.length);
        var newPat = $as_T(regex.substring(beginIndex));
        var value$2 = m$1[1];
        if ((value$2 === (void 0))) {
          var flags1 = flags
        } else {
          var chars = $as_T(value$2);
          var this$20 = new $c_sci_StringOps().init___T(chars);
          var start = 0;
          var $$this = this$20.repr$1;
          var end = $uI($$this.length);
          var z = flags;
          var start$1 = start;
          var z$1 = z;
          var jsx$1;
          _foldl: while (true) {
            if ((start$1 !== end)) {
              var temp$start = ((1 + start$1) | 0);
              var arg1 = z$1;
              var arg2 = this$20.apply__I__O(start$1);
              var f = $uI(arg1);
              if ((arg2 === null)) {
                var c = 0
              } else {
                var this$24 = $as_jl_Character(arg2);
                var c = this$24.value$1
              };
              var temp$z = (f | $m_ju_regex_Pattern$().java$util$regex$Pattern$$charToFlag__C__I(c));
              start$1 = temp$start;
              z$1 = temp$z;
              continue _foldl
            };
            var jsx$1 = z$1;
            break
          };
          var flags1 = $uI(jsx$1)
        };
        var value$3 = m$1[2];
        if ((value$3 === (void 0))) {
          var flags2 = flags1
        } else {
          var chars$3 = $as_T(value$3);
          var this$31 = new $c_sci_StringOps().init___T(chars$3);
          var start$2 = 0;
          var $$this$1 = this$31.repr$1;
          var end$1 = $uI($$this$1.length);
          var z$2 = flags1;
          var start$3 = start$2;
          var z$3 = z$2;
          var jsx$2;
          _foldl$1: while (true) {
            if ((start$3 !== end$1)) {
              var temp$start$1 = ((1 + start$3) | 0);
              var arg1$1 = z$3;
              var arg2$1 = this$31.apply__I__O(start$3);
              var f$1 = $uI(arg1$1);
              if ((arg2$1 === null)) {
                var c$1 = 0
              } else {
                var this$35 = $as_jl_Character(arg2$1);
                var c$1 = this$35.value$1
              };
              var temp$z$1 = (f$1 & (~$m_ju_regex_Pattern$().java$util$regex$Pattern$$charToFlag__C__I(c$1)));
              start$3 = temp$start$1;
              z$3 = temp$z$1;
              continue _foldl$1
            };
            var jsx$2 = z$3;
            break
          };
          var flags2 = $uI(jsx$2)
        };
        var this$36 = new $c_s_Some().init___O(new $c_T2().init___O__O(newPat, flags2))
      } else {
        var this$36 = $m_s_None$()
      }
    } else {
      var this$36 = this$5
    };
    var x1 = $as_T2((this$36.isEmpty__Z() ? new $c_T2().init___O__O(regex, flags) : this$36.get__O()))
  };
  if ((x1 === null)) {
    throw new $c_s_MatchError().init___O(x1)
  };
  var jsPattern = $as_T(x1.$$und1__O());
  var flags1$1 = x1.$$und2$mcI$sp__I();
  var jsFlags = (("g" + (((2 & flags1$1) !== 0) ? "i" : "")) + (((8 & flags1$1) !== 0) ? "m" : ""));
  var jsRegExp = new $g.RegExp(jsPattern, jsFlags);
  return new $c_ju_regex_Pattern().init___sjs_js_RegExp__T__I(jsRegExp, regex, flags1$1)
});
$c_ju_regex_Pattern$.prototype.quote__T__T = (function(s) {
  var result = "";
  var i = 0;
  while ((i < $uI(s.length))) {
    var index = i;
    var c = (65535 & $uI(s.charCodeAt(index)));
    var jsx$2 = result;
    switch (c) {
      case 92:
      case 46:
      case 40:
      case 41:
      case 91:
      case 93:
      case 123:
      case 125:
      case 124:
      case 63:
      case 42:
      case 43:
      case 94:
      case 36: {
        var jsx$1 = ("\\" + new $c_jl_Character().init___C(c));
        break
      }
      default: {
        var jsx$1 = new $c_jl_Character().init___C(c)
      }
    };
    result = (("" + jsx$2) + jsx$1);
    i = ((1 + i) | 0)
  };
  return result
});
$c_ju_regex_Pattern$.prototype.java$util$regex$Pattern$$charToFlag__C__I = (function(c) {
  switch (c) {
    case 105: {
      return 2;
      break
    }
    case 100: {
      return 1;
      break
    }
    case 109: {
      return 8;
      break
    }
    case 115: {
      return 32;
      break
    }
    case 117: {
      return 64;
      break
    }
    case 120: {
      return 4;
      break
    }
    case 85: {
      return 256;
      break
    }
    default: {
      throw new $c_jl_IllegalArgumentException().init___T("bad in-pattern flag")
    }
  }
});
var $d_ju_regex_Pattern$ = new $TypeData().initClass({
  ju_regex_Pattern$: 0
}, false, "java.util.regex.Pattern$", {
  ju_regex_Pattern$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_regex_Pattern$.prototype.$classData = $d_ju_regex_Pattern$;
var $n_ju_regex_Pattern$ = (void 0);
function $m_ju_regex_Pattern$() {
  if ((!$n_ju_regex_Pattern$)) {
    $n_ju_regex_Pattern$ = new $c_ju_regex_Pattern$().init___()
  };
  return $n_ju_regex_Pattern$
}
/** @constructor */
function $c_s_Option$() {
  $c_O.call(this)
}
$c_s_Option$.prototype = new $h_O();
$c_s_Option$.prototype.constructor = $c_s_Option$;
/** @constructor */
function $h_s_Option$() {
  /*<skip>*/
}
$h_s_Option$.prototype = $c_s_Option$.prototype;
$c_s_Option$.prototype.init___ = (function() {
  return this
});
$c_s_Option$.prototype.apply__O__s_Option = (function(x) {
  return ((x === null) ? $m_s_None$() : new $c_s_Some().init___O(x))
});
var $d_s_Option$ = new $TypeData().initClass({
  s_Option$: 0
}, false, "scala.Option$", {
  s_Option$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Option$.prototype.$classData = $d_s_Option$;
var $n_s_Option$ = (void 0);
function $m_s_Option$() {
  if ((!$n_s_Option$)) {
    $n_s_Option$ = new $c_s_Option$().init___()
  };
  return $n_s_Option$
}
/** @constructor */
function $c_s_Predef$() {
  $c_s_LowPriorityImplicits.call(this);
  this.Map$2 = null;
  this.Set$2 = null;
  this.ClassManifest$2 = null;
  this.Manifest$2 = null;
  this.NoManifest$2 = null;
  this.StringCanBuildFrom$2 = null;
  this.singleton$und$less$colon$less$2 = null;
  this.scala$Predef$$singleton$und$eq$colon$eq$f = null
}
$c_s_Predef$.prototype = new $h_s_LowPriorityImplicits();
$c_s_Predef$.prototype.constructor = $c_s_Predef$;
/** @constructor */
function $h_s_Predef$() {
  /*<skip>*/
}
$h_s_Predef$.prototype = $c_s_Predef$.prototype;
$c_s_Predef$.prototype.init___ = (function() {
  $n_s_Predef$ = this;
  $m_s_package$();
  $m_sci_List$();
  this.Map$2 = $m_sci_Map$();
  this.Set$2 = $m_sci_Set$();
  this.ClassManifest$2 = $m_s_reflect_package$().ClassManifest$1;
  this.Manifest$2 = $m_s_reflect_package$().Manifest$1;
  this.NoManifest$2 = $m_s_reflect_NoManifest$();
  this.StringCanBuildFrom$2 = new $c_s_Predef$$anon$3().init___();
  this.singleton$und$less$colon$less$2 = new $c_s_Predef$$anon$1().init___();
  this.scala$Predef$$singleton$und$eq$colon$eq$f = new $c_s_Predef$$anon$2().init___();
  return this
});
$c_s_Predef$.prototype.assert__Z__V = (function(assertion) {
  if ((!assertion)) {
    throw new $c_jl_AssertionError().init___O("assertion failed")
  }
});
$c_s_Predef$.prototype.genericArrayOps__O__scm_ArrayOps = (function(xs) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    var jsx$1 = new $c_scm_ArrayOps$ofRef().init___AO(x2)
  } else if ($isArrayOf_Z(xs, 1)) {
    var x3 = $asArrayOf_Z(xs, 1);
    var jsx$1 = new $c_scm_ArrayOps$ofBoolean().init___AZ(x3)
  } else if ($isArrayOf_B(xs, 1)) {
    var x4 = $asArrayOf_B(xs, 1);
    var jsx$1 = new $c_scm_ArrayOps$ofByte().init___AB(x4)
  } else if ($isArrayOf_C(xs, 1)) {
    var x5 = $asArrayOf_C(xs, 1);
    var jsx$1 = new $c_scm_ArrayOps$ofChar().init___AC(x5)
  } else if ($isArrayOf_D(xs, 1)) {
    var x6 = $asArrayOf_D(xs, 1);
    var jsx$1 = new $c_scm_ArrayOps$ofDouble().init___AD(x6)
  } else if ($isArrayOf_F(xs, 1)) {
    var x7 = $asArrayOf_F(xs, 1);
    var jsx$1 = new $c_scm_ArrayOps$ofFloat().init___AF(x7)
  } else if ($isArrayOf_I(xs, 1)) {
    var x8 = $asArrayOf_I(xs, 1);
    var jsx$1 = new $c_scm_ArrayOps$ofInt().init___AI(x8)
  } else if ($isArrayOf_J(xs, 1)) {
    var x9 = $asArrayOf_J(xs, 1);
    var jsx$1 = new $c_scm_ArrayOps$ofLong().init___AJ(x9)
  } else if ($isArrayOf_S(xs, 1)) {
    var x10 = $asArrayOf_S(xs, 1);
    var jsx$1 = new $c_scm_ArrayOps$ofShort().init___AS(x10)
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    var jsx$1 = new $c_scm_ArrayOps$ofUnit().init___Asr_BoxedUnit(x11)
  } else if ((xs === null)) {
    var jsx$1 = null
  } else {
    var jsx$1;
    throw new $c_s_MatchError().init___O(xs)
  };
  return $as_scm_ArrayOps(jsx$1)
});
$c_s_Predef$.prototype.require__Z__V = (function(requirement) {
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed")
  }
});
var $d_s_Predef$ = new $TypeData().initClass({
  s_Predef$: 0
}, false, "scala.Predef$", {
  s_Predef$: 1,
  s_LowPriorityImplicits: 1,
  O: 1,
  s_DeprecatedPredef: 1
});
$c_s_Predef$.prototype.$classData = $d_s_Predef$;
var $n_s_Predef$ = (void 0);
function $m_s_Predef$() {
  if ((!$n_s_Predef$)) {
    $n_s_Predef$ = new $c_s_Predef$().init___()
  };
  return $n_s_Predef$
}
/** @constructor */
function $c_s_StringContext$() {
  $c_O.call(this)
}
$c_s_StringContext$.prototype = new $h_O();
$c_s_StringContext$.prototype.constructor = $c_s_StringContext$;
/** @constructor */
function $h_s_StringContext$() {
  /*<skip>*/
}
$h_s_StringContext$.prototype = $c_s_StringContext$.prototype;
$c_s_StringContext$.prototype.init___ = (function() {
  return this
});
$c_s_StringContext$.prototype.treatEscapes0__p1__T__Z__T = (function(str, strict) {
  var len = $uI(str.length);
  var x1 = $m_sjsr_RuntimeString$().indexOf__T__I__I(str, 92);
  switch (x1) {
    case (-1): {
      return str;
      break
    }
    default: {
      return this.replace$1__p1__I__T__Z__I__T(x1, str, strict, len)
    }
  }
});
$c_s_StringContext$.prototype.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T = (function(i, next, str$1, strict$1, len$1, b$1) {
  _loop: while (true) {
    if ((next >= 0)) {
      if ((next > i)) {
        b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, next)
      };
      var idx = ((1 + next) | 0);
      if ((idx >= len$1)) {
        throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
      };
      var index = idx;
      var x1 = (65535 & $uI(str$1.charCodeAt(index)));
      switch (x1) {
        case 98: {
          var c = 8;
          break
        }
        case 116: {
          var c = 9;
          break
        }
        case 110: {
          var c = 10;
          break
        }
        case 102: {
          var c = 12;
          break
        }
        case 114: {
          var c = 13;
          break
        }
        case 34: {
          var c = 34;
          break
        }
        case 39: {
          var c = 39;
          break
        }
        case 92: {
          var c = 92;
          break
        }
        default: {
          if (((x1 >= 48) && (x1 <= 55))) {
            if (strict$1) {
              throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
            };
            var index$1 = idx;
            var leadch = (65535 & $uI(str$1.charCodeAt(index$1)));
            var oct = (((-48) + leadch) | 0);
            idx = ((1 + idx) | 0);
            if ((idx < len$1)) {
              var index$2 = idx;
              var jsx$2 = ((65535 & $uI(str$1.charCodeAt(index$2))) >= 48)
            } else {
              var jsx$2 = false
            };
            if (jsx$2) {
              var index$3 = idx;
              var jsx$1 = ((65535 & $uI(str$1.charCodeAt(index$3))) <= 55)
            } else {
              var jsx$1 = false
            };
            if (jsx$1) {
              var jsx$3 = oct;
              var index$4 = idx;
              oct = (((-48) + (((jsx$3 << 3) + (65535 & $uI(str$1.charCodeAt(index$4)))) | 0)) | 0);
              idx = ((1 + idx) | 0);
              if (((idx < len$1) && (leadch <= 51))) {
                var index$5 = idx;
                var jsx$5 = ((65535 & $uI(str$1.charCodeAt(index$5))) >= 48)
              } else {
                var jsx$5 = false
              };
              if (jsx$5) {
                var index$6 = idx;
                var jsx$4 = ((65535 & $uI(str$1.charCodeAt(index$6))) <= 55)
              } else {
                var jsx$4 = false
              };
              if (jsx$4) {
                var jsx$6 = oct;
                var index$7 = idx;
                oct = (((-48) + (((jsx$6 << 3) + (65535 & $uI(str$1.charCodeAt(index$7)))) | 0)) | 0);
                idx = ((1 + idx) | 0)
              }
            };
            idx = (((-1) + idx) | 0);
            var c = (65535 & oct)
          } else {
            var c;
            throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
          }
        }
      };
      idx = ((1 + idx) | 0);
      b$1.append__C__jl_StringBuilder(c);
      var temp$i = idx;
      var temp$next = $m_sjsr_RuntimeString$().indexOf__T__I__I__I(str$1, 92, idx);
      i = temp$i;
      next = temp$next;
      continue _loop
    } else {
      if ((i < len$1)) {
        b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, len$1)
      };
      return b$1.java$lang$StringBuilder$$content$f
    }
  }
});
$c_s_StringContext$.prototype.replace$1__p1__I__T__Z__I__T = (function(first, str$1, strict$1, len$1) {
  var b = new $c_jl_StringBuilder().init___();
  return this.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T(0, first, str$1, strict$1, len$1, b)
});
var $d_s_StringContext$ = new $TypeData().initClass({
  s_StringContext$: 0
}, false, "scala.StringContext$", {
  s_StringContext$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext$.prototype.$classData = $d_s_StringContext$;
var $n_s_StringContext$ = (void 0);
function $m_s_StringContext$() {
  if ((!$n_s_StringContext$)) {
    $n_s_StringContext$ = new $c_s_StringContext$().init___()
  };
  return $n_s_StringContext$
}
/** @constructor */
function $c_s_concurrent_impl_CallbackRunnable() {
  $c_O.call(this);
  this.executor$1 = null;
  this.onComplete$1 = null;
  this.value$1 = null
}
$c_s_concurrent_impl_CallbackRunnable.prototype = new $h_O();
$c_s_concurrent_impl_CallbackRunnable.prototype.constructor = $c_s_concurrent_impl_CallbackRunnable;
/** @constructor */
function $h_s_concurrent_impl_CallbackRunnable() {
  /*<skip>*/
}
$h_s_concurrent_impl_CallbackRunnable.prototype = $c_s_concurrent_impl_CallbackRunnable.prototype;
$c_s_concurrent_impl_CallbackRunnable.prototype.run__V = (function() {
  $m_s_Predef$().require__Z__V((this.value$1 !== null));
  try {
    this.onComplete$1.apply__O__O(this.value$1)
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      matchEnd8: {
        var o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
        if ((!o11.isEmpty__Z())) {
          var e$3 = $as_jl_Throwable(o11.get__O());
          this.executor$1.reportFailure__jl_Throwable__V(e$3);
          break matchEnd8
        };
        throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
      }
    } else {
      throw e
    }
  }
});
$c_s_concurrent_impl_CallbackRunnable.prototype.init___s_concurrent_ExecutionContext__F1 = (function(executor, onComplete) {
  this.executor$1 = executor;
  this.onComplete$1 = onComplete;
  this.value$1 = null;
  return this
});
$c_s_concurrent_impl_CallbackRunnable.prototype.executeWithValue__s_util_Try__V = (function(v) {
  $m_s_Predef$().require__Z__V((this.value$1 === null));
  this.value$1 = v;
  try {
    this.executor$1.execute__jl_Runnable__V(this)
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      matchEnd8: {
        var o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
        if ((!o11.isEmpty__Z())) {
          var t = $as_jl_Throwable(o11.get__O());
          this.executor$1.reportFailure__jl_Throwable__V(t);
          break matchEnd8
        };
        throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
      }
    } else {
      throw e
    }
  }
});
function $is_s_concurrent_impl_CallbackRunnable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_concurrent_impl_CallbackRunnable)))
}
function $as_s_concurrent_impl_CallbackRunnable(obj) {
  return (($is_s_concurrent_impl_CallbackRunnable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.concurrent.impl.CallbackRunnable"))
}
function $isArrayOf_s_concurrent_impl_CallbackRunnable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_concurrent_impl_CallbackRunnable)))
}
function $asArrayOf_s_concurrent_impl_CallbackRunnable(obj, depth) {
  return (($isArrayOf_s_concurrent_impl_CallbackRunnable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.concurrent.impl.CallbackRunnable;", depth))
}
var $d_s_concurrent_impl_CallbackRunnable = new $TypeData().initClass({
  s_concurrent_impl_CallbackRunnable: 0
}, false, "scala.concurrent.impl.CallbackRunnable", {
  s_concurrent_impl_CallbackRunnable: 1,
  O: 1,
  jl_Runnable: 1,
  s_concurrent_OnCompleteRunnable: 1
});
$c_s_concurrent_impl_CallbackRunnable.prototype.$classData = $d_s_concurrent_impl_CallbackRunnable;
function $f_s_concurrent_impl_Promise__toString__T($thiz) {
  var x1 = $thiz.value__s_Option();
  if ($is_s_Some(x1)) {
    var x2 = $as_s_Some(x1);
    var result = $as_s_util_Try(x2.value$2);
    return (("Future(" + result) + ")")
  } else {
    var x = $m_s_None$();
    if ((x === x1)) {
      return "Future(<not completed>)"
    } else {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $f_s_concurrent_impl_Promise__transform__F1__s_concurrent_ExecutionContext__s_concurrent_Future($thiz, f, executor) {
  var p = new $c_s_concurrent_impl_Promise$DefaultPromise().init___();
  $thiz.onComplete__F1__s_concurrent_ExecutionContext__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, f$1, p$1) {
    return (function(result$2) {
      var result = $as_s_util_Try(result$2);
      var result$1 = $f_s_concurrent_impl_Promise__liftedTree1$1__ps_concurrent_impl_Promise__F1__s_util_Try__s_util_Try($this, f$1, result);
      return $as_s_concurrent_impl_Promise$DefaultPromise($f_s_concurrent_Promise__complete__s_util_Try__s_concurrent_Promise(p$1, result$1))
    })
  })($thiz, f, p)), executor);
  return p
}
function $f_s_concurrent_impl_Promise__liftedTree1$1__ps_concurrent_impl_Promise__F1__s_util_Try__s_util_Try($thiz, f$1, result$1) {
  try {
    return $as_s_util_Try(f$1.apply__O__O(result$1))
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      var o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
      if ((!o11.isEmpty__Z())) {
        var t = $as_jl_Throwable(o11.get__O());
        return new $c_s_util_Failure().init___jl_Throwable(t)
      };
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
    } else {
      throw e
    }
  }
}
/** @constructor */
function $c_s_math_Fractional$() {
  $c_O.call(this)
}
$c_s_math_Fractional$.prototype = new $h_O();
$c_s_math_Fractional$.prototype.constructor = $c_s_math_Fractional$;
/** @constructor */
function $h_s_math_Fractional$() {
  /*<skip>*/
}
$h_s_math_Fractional$.prototype = $c_s_math_Fractional$.prototype;
$c_s_math_Fractional$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Fractional$ = new $TypeData().initClass({
  s_math_Fractional$: 0
}, false, "scala.math.Fractional$", {
  s_math_Fractional$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Fractional$.prototype.$classData = $d_s_math_Fractional$;
var $n_s_math_Fractional$ = (void 0);
function $m_s_math_Fractional$() {
  if ((!$n_s_math_Fractional$)) {
    $n_s_math_Fractional$ = new $c_s_math_Fractional$().init___()
  };
  return $n_s_math_Fractional$
}
/** @constructor */
function $c_s_math_Integral$() {
  $c_O.call(this)
}
$c_s_math_Integral$.prototype = new $h_O();
$c_s_math_Integral$.prototype.constructor = $c_s_math_Integral$;
/** @constructor */
function $h_s_math_Integral$() {
  /*<skip>*/
}
$h_s_math_Integral$.prototype = $c_s_math_Integral$.prototype;
$c_s_math_Integral$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Integral$ = new $TypeData().initClass({
  s_math_Integral$: 0
}, false, "scala.math.Integral$", {
  s_math_Integral$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Integral$.prototype.$classData = $d_s_math_Integral$;
var $n_s_math_Integral$ = (void 0);
function $m_s_math_Integral$() {
  if ((!$n_s_math_Integral$)) {
    $n_s_math_Integral$ = new $c_s_math_Integral$().init___()
  };
  return $n_s_math_Integral$
}
/** @constructor */
function $c_s_math_Numeric$() {
  $c_O.call(this)
}
$c_s_math_Numeric$.prototype = new $h_O();
$c_s_math_Numeric$.prototype.constructor = $c_s_math_Numeric$;
/** @constructor */
function $h_s_math_Numeric$() {
  /*<skip>*/
}
$h_s_math_Numeric$.prototype = $c_s_math_Numeric$.prototype;
$c_s_math_Numeric$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Numeric$ = new $TypeData().initClass({
  s_math_Numeric$: 0
}, false, "scala.math.Numeric$", {
  s_math_Numeric$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Numeric$.prototype.$classData = $d_s_math_Numeric$;
var $n_s_math_Numeric$ = (void 0);
function $m_s_math_Numeric$() {
  if ((!$n_s_math_Numeric$)) {
    $n_s_math_Numeric$ = new $c_s_math_Numeric$().init___()
  };
  return $n_s_math_Numeric$
}
function $is_s_math_ScalaNumber(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_math_ScalaNumber)))
}
function $as_s_math_ScalaNumber(obj) {
  return (($is_s_math_ScalaNumber(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.math.ScalaNumber"))
}
function $isArrayOf_s_math_ScalaNumber(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_math_ScalaNumber)))
}
function $asArrayOf_s_math_ScalaNumber(obj, depth) {
  return (($isArrayOf_s_math_ScalaNumber(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.math.ScalaNumber;", depth))
}
/** @constructor */
function $c_s_reflect_ClassTag$() {
  $c_O.call(this)
}
$c_s_reflect_ClassTag$.prototype = new $h_O();
$c_s_reflect_ClassTag$.prototype.constructor = $c_s_reflect_ClassTag$;
/** @constructor */
function $h_s_reflect_ClassTag$() {
  /*<skip>*/
}
$h_s_reflect_ClassTag$.prototype = $c_s_reflect_ClassTag$.prototype;
$c_s_reflect_ClassTag$.prototype.init___ = (function() {
  return this
});
$c_s_reflect_ClassTag$.prototype.apply__jl_Class__s_reflect_ClassTag = (function(runtimeClass1) {
  return ((runtimeClass1 === $d_B.getClassOf()) ? $m_s_reflect_ManifestFactory$ByteManifest$() : ((runtimeClass1 === $d_S.getClassOf()) ? $m_s_reflect_ManifestFactory$ShortManifest$() : ((runtimeClass1 === $d_C.getClassOf()) ? $m_s_reflect_ManifestFactory$CharManifest$() : ((runtimeClass1 === $d_I.getClassOf()) ? $m_s_reflect_ManifestFactory$IntManifest$() : ((runtimeClass1 === $d_J.getClassOf()) ? $m_s_reflect_ManifestFactory$LongManifest$() : ((runtimeClass1 === $d_F.getClassOf()) ? $m_s_reflect_ManifestFactory$FloatManifest$() : ((runtimeClass1 === $d_D.getClassOf()) ? $m_s_reflect_ManifestFactory$DoubleManifest$() : ((runtimeClass1 === $d_Z.getClassOf()) ? $m_s_reflect_ManifestFactory$BooleanManifest$() : ((runtimeClass1 === $d_V.getClassOf()) ? $m_s_reflect_ManifestFactory$UnitManifest$() : ((runtimeClass1 === $d_O.getClassOf()) ? $m_s_reflect_ManifestFactory$ObjectManifest$() : ((runtimeClass1 === $d_sr_Nothing$.getClassOf()) ? $m_s_reflect_ManifestFactory$NothingManifest$() : ((runtimeClass1 === $d_sr_Null$.getClassOf()) ? $m_s_reflect_ManifestFactory$NullManifest$() : new $c_s_reflect_ClassTag$GenericClassTag().init___jl_Class(runtimeClass1)))))))))))))
});
var $d_s_reflect_ClassTag$ = new $TypeData().initClass({
  s_reflect_ClassTag$: 0
}, false, "scala.reflect.ClassTag$", {
  s_reflect_ClassTag$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_reflect_ClassTag$.prototype.$classData = $d_s_reflect_ClassTag$;
var $n_s_reflect_ClassTag$ = (void 0);
function $m_s_reflect_ClassTag$() {
  if ((!$n_s_reflect_ClassTag$)) {
    $n_s_reflect_ClassTag$ = new $c_s_reflect_ClassTag$().init___()
  };
  return $n_s_reflect_ClassTag$
}
/** @constructor */
function $c_s_util_Either$() {
  $c_O.call(this)
}
$c_s_util_Either$.prototype = new $h_O();
$c_s_util_Either$.prototype.constructor = $c_s_util_Either$;
/** @constructor */
function $h_s_util_Either$() {
  /*<skip>*/
}
$h_s_util_Either$.prototype = $c_s_util_Either$.prototype;
$c_s_util_Either$.prototype.init___ = (function() {
  return this
});
var $d_s_util_Either$ = new $TypeData().initClass({
  s_util_Either$: 0
}, false, "scala.util.Either$", {
  s_util_Either$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Either$.prototype.$classData = $d_s_util_Either$;
var $n_s_util_Either$ = (void 0);
function $m_s_util_Either$() {
  if ((!$n_s_util_Either$)) {
    $n_s_util_Either$ = new $c_s_util_Either$().init___()
  };
  return $n_s_util_Either$
}
/** @constructor */
function $c_s_util_Left$() {
  $c_O.call(this)
}
$c_s_util_Left$.prototype = new $h_O();
$c_s_util_Left$.prototype.constructor = $c_s_util_Left$;
/** @constructor */
function $h_s_util_Left$() {
  /*<skip>*/
}
$h_s_util_Left$.prototype = $c_s_util_Left$.prototype;
$c_s_util_Left$.prototype.init___ = (function() {
  return this
});
$c_s_util_Left$.prototype.toString__T = (function() {
  return "Left"
});
var $d_s_util_Left$ = new $TypeData().initClass({
  s_util_Left$: 0
}, false, "scala.util.Left$", {
  s_util_Left$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Left$.prototype.$classData = $d_s_util_Left$;
var $n_s_util_Left$ = (void 0);
function $m_s_util_Left$() {
  if ((!$n_s_util_Left$)) {
    $n_s_util_Left$ = new $c_s_util_Left$().init___()
  };
  return $n_s_util_Left$
}
/** @constructor */
function $c_s_util_Right$() {
  $c_O.call(this)
}
$c_s_util_Right$.prototype = new $h_O();
$c_s_util_Right$.prototype.constructor = $c_s_util_Right$;
/** @constructor */
function $h_s_util_Right$() {
  /*<skip>*/
}
$h_s_util_Right$.prototype = $c_s_util_Right$.prototype;
$c_s_util_Right$.prototype.init___ = (function() {
  return this
});
$c_s_util_Right$.prototype.toString__T = (function() {
  return "Right"
});
var $d_s_util_Right$ = new $TypeData().initClass({
  s_util_Right$: 0
}, false, "scala.util.Right$", {
  s_util_Right$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Right$.prototype.$classData = $d_s_util_Right$;
var $n_s_util_Right$ = (void 0);
function $m_s_util_Right$() {
  if ((!$n_s_util_Right$)) {
    $n_s_util_Right$ = new $c_s_util_Right$().init___()
  };
  return $n_s_util_Right$
}
/** @constructor */
function $c_s_util_control_NoStackTrace$() {
  $c_O.call(this);
  this.$$undnoSuppression$1 = false
}
$c_s_util_control_NoStackTrace$.prototype = new $h_O();
$c_s_util_control_NoStackTrace$.prototype.constructor = $c_s_util_control_NoStackTrace$;
/** @constructor */
function $h_s_util_control_NoStackTrace$() {
  /*<skip>*/
}
$h_s_util_control_NoStackTrace$.prototype = $c_s_util_control_NoStackTrace$.prototype;
$c_s_util_control_NoStackTrace$.prototype.init___ = (function() {
  this.$$undnoSuppression$1 = false;
  return this
});
var $d_s_util_control_NoStackTrace$ = new $TypeData().initClass({
  s_util_control_NoStackTrace$: 0
}, false, "scala.util.control.NoStackTrace$", {
  s_util_control_NoStackTrace$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_control_NoStackTrace$.prototype.$classData = $d_s_util_control_NoStackTrace$;
var $n_s_util_control_NoStackTrace$ = (void 0);
function $m_s_util_control_NoStackTrace$() {
  if ((!$n_s_util_control_NoStackTrace$)) {
    $n_s_util_control_NoStackTrace$ = new $c_s_util_control_NoStackTrace$().init___()
  };
  return $n_s_util_control_NoStackTrace$
}
/** @constructor */
function $c_sc_IndexedSeq$$anon$1() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
}
$c_sc_IndexedSeq$$anon$1.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_sc_IndexedSeq$$anon$1.prototype.constructor = $c_sc_IndexedSeq$$anon$1;
/** @constructor */
function $h_sc_IndexedSeq$$anon$1() {
  /*<skip>*/
}
$h_sc_IndexedSeq$$anon$1.prototype = $c_sc_IndexedSeq$$anon$1.prototype;
$c_sc_IndexedSeq$$anon$1.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sc_IndexedSeq$());
  return this
});
$c_sc_IndexedSeq$$anon$1.prototype.apply__scm_Builder = (function() {
  $m_sc_IndexedSeq$();
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sc_IndexedSeq$$anon$1 = new $TypeData().initClass({
  sc_IndexedSeq$$anon$1: 0
}, false, "scala.collection.IndexedSeq$$anon$1", {
  sc_IndexedSeq$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sc_IndexedSeq$$anon$1.prototype.$classData = $d_sc_IndexedSeq$$anon$1;
/** @constructor */
function $c_scg_GenSeqFactory() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_scg_GenSeqFactory.prototype = new $h_scg_GenTraversableFactory();
$c_scg_GenSeqFactory.prototype.constructor = $c_scg_GenSeqFactory;
/** @constructor */
function $h_scg_GenSeqFactory() {
  /*<skip>*/
}
$h_scg_GenSeqFactory.prototype = $c_scg_GenSeqFactory.prototype;
/** @constructor */
function $c_scg_GenTraversableFactory$$anon$1() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this);
  this.$$outer$2 = null
}
$c_scg_GenTraversableFactory$$anon$1.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_scg_GenTraversableFactory$$anon$1.prototype.constructor = $c_scg_GenTraversableFactory$$anon$1;
/** @constructor */
function $h_scg_GenTraversableFactory$$anon$1() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory$$anon$1.prototype = $c_scg_GenTraversableFactory$$anon$1.prototype;
$c_scg_GenTraversableFactory$$anon$1.prototype.apply__scm_Builder = (function() {
  return this.$$outer$2.newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$$anon$1.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $$outer);
  return this
});
var $d_scg_GenTraversableFactory$$anon$1 = new $TypeData().initClass({
  scg_GenTraversableFactory$$anon$1: 0
}, false, "scala.collection.generic.GenTraversableFactory$$anon$1", {
  scg_GenTraversableFactory$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_scg_GenTraversableFactory$$anon$1.prototype.$classData = $d_scg_GenTraversableFactory$$anon$1;
/** @constructor */
function $c_scg_ImmutableMapFactory() {
  $c_scg_MapFactory.call(this)
}
$c_scg_ImmutableMapFactory.prototype = new $h_scg_MapFactory();
$c_scg_ImmutableMapFactory.prototype.constructor = $c_scg_ImmutableMapFactory;
/** @constructor */
function $h_scg_ImmutableMapFactory() {
  /*<skip>*/
}
$h_scg_ImmutableMapFactory.prototype = $c_scg_ImmutableMapFactory.prototype;
/** @constructor */
function $c_sci_$colon$colon$() {
  $c_O.call(this)
}
$c_sci_$colon$colon$.prototype = new $h_O();
$c_sci_$colon$colon$.prototype.constructor = $c_sci_$colon$colon$;
/** @constructor */
function $h_sci_$colon$colon$() {
  /*<skip>*/
}
$h_sci_$colon$colon$.prototype = $c_sci_$colon$colon$.prototype;
$c_sci_$colon$colon$.prototype.init___ = (function() {
  return this
});
$c_sci_$colon$colon$.prototype.toString__T = (function() {
  return "::"
});
var $d_sci_$colon$colon$ = new $TypeData().initClass({
  sci_$colon$colon$: 0
}, false, "scala.collection.immutable.$colon$colon$", {
  sci_$colon$colon$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_$colon$colon$.prototype.$classData = $d_sci_$colon$colon$;
var $n_sci_$colon$colon$ = (void 0);
function $m_sci_$colon$colon$() {
  if ((!$n_sci_$colon$colon$)) {
    $n_sci_$colon$colon$ = new $c_sci_$colon$colon$().init___()
  };
  return $n_sci_$colon$colon$
}
/** @constructor */
function $c_sci_Range$() {
  $c_O.call(this);
  this.MAX$undPRINT$1 = 0
}
$c_sci_Range$.prototype = new $h_O();
$c_sci_Range$.prototype.constructor = $c_sci_Range$;
/** @constructor */
function $h_sci_Range$() {
  /*<skip>*/
}
$h_sci_Range$.prototype = $c_sci_Range$.prototype;
$c_sci_Range$.prototype.init___ = (function() {
  this.MAX$undPRINT$1 = 512;
  return this
});
$c_sci_Range$.prototype.description__p1__I__I__I__Z__T = (function(start, end, step, isInclusive) {
  return ((((start + (isInclusive ? " to " : " until ")) + end) + " by ") + step)
});
$c_sci_Range$.prototype.scala$collection$immutable$Range$$fail__I__I__I__Z__sr_Nothing$ = (function(start, end, step, isInclusive) {
  throw new $c_jl_IllegalArgumentException().init___T((this.description__p1__I__I__I__Z__T(start, end, step, isInclusive) + ": seqs cannot contain more than Int.MaxValue elements."))
});
var $d_sci_Range$ = new $TypeData().initClass({
  sci_Range$: 0
}, false, "scala.collection.immutable.Range$", {
  sci_Range$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Range$.prototype.$classData = $d_sci_Range$;
var $n_sci_Range$ = (void 0);
function $m_sci_Range$() {
  if ((!$n_sci_Range$)) {
    $n_sci_Range$ = new $c_sci_Range$().init___()
  };
  return $n_sci_Range$
}
/** @constructor */
function $c_sci_Stream$StreamCanBuildFrom() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
}
$c_sci_Stream$StreamCanBuildFrom.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_sci_Stream$StreamCanBuildFrom.prototype.constructor = $c_sci_Stream$StreamCanBuildFrom;
/** @constructor */
function $h_sci_Stream$StreamCanBuildFrom() {
  /*<skip>*/
}
$h_sci_Stream$StreamCanBuildFrom.prototype = $c_sci_Stream$StreamCanBuildFrom.prototype;
$c_sci_Stream$StreamCanBuildFrom.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sci_Stream$());
  return this
});
var $d_sci_Stream$StreamCanBuildFrom = new $TypeData().initClass({
  sci_Stream$StreamCanBuildFrom: 0
}, false, "scala.collection.immutable.Stream$StreamCanBuildFrom", {
  sci_Stream$StreamCanBuildFrom: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sci_Stream$StreamCanBuildFrom.prototype.$classData = $d_sci_Stream$StreamCanBuildFrom;
/** @constructor */
function $c_scm_StringBuilder$() {
  $c_O.call(this)
}
$c_scm_StringBuilder$.prototype = new $h_O();
$c_scm_StringBuilder$.prototype.constructor = $c_scm_StringBuilder$;
/** @constructor */
function $h_scm_StringBuilder$() {
  /*<skip>*/
}
$h_scm_StringBuilder$.prototype = $c_scm_StringBuilder$.prototype;
$c_scm_StringBuilder$.prototype.init___ = (function() {
  return this
});
var $d_scm_StringBuilder$ = new $TypeData().initClass({
  scm_StringBuilder$: 0
}, false, "scala.collection.mutable.StringBuilder$", {
  scm_StringBuilder$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder$.prototype.$classData = $d_scm_StringBuilder$;
var $n_scm_StringBuilder$ = (void 0);
function $m_scm_StringBuilder$() {
  if ((!$n_scm_StringBuilder$)) {
    $n_scm_StringBuilder$ = new $c_scm_StringBuilder$().init___()
  };
  return $n_scm_StringBuilder$
}
/** @constructor */
function $c_sjsr_AnonFunction0() {
  $c_sr_AbstractFunction0.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction0.prototype = new $h_sr_AbstractFunction0();
$c_sjsr_AnonFunction0.prototype.constructor = $c_sjsr_AnonFunction0;
/** @constructor */
function $h_sjsr_AnonFunction0() {
  /*<skip>*/
}
$h_sjsr_AnonFunction0.prototype = $c_sjsr_AnonFunction0.prototype;
$c_sjsr_AnonFunction0.prototype.apply__O = (function() {
  return (0, this.f$2)()
});
$c_sjsr_AnonFunction0.prototype.init___sjs_js_Function0 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction0 = new $TypeData().initClass({
  sjsr_AnonFunction0: 0
}, false, "scala.scalajs.runtime.AnonFunction0", {
  sjsr_AnonFunction0: 1,
  sr_AbstractFunction0: 1,
  O: 1,
  F0: 1
});
$c_sjsr_AnonFunction0.prototype.$classData = $d_sjsr_AnonFunction0;
/** @constructor */
function $c_sjsr_AnonFunction1() {
  $c_sr_AbstractFunction1.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction1.prototype = new $h_sr_AbstractFunction1();
$c_sjsr_AnonFunction1.prototype.constructor = $c_sjsr_AnonFunction1;
/** @constructor */
function $h_sjsr_AnonFunction1() {
  /*<skip>*/
}
$h_sjsr_AnonFunction1.prototype = $c_sjsr_AnonFunction1.prototype;
$c_sjsr_AnonFunction1.prototype.apply__O__O = (function(arg1) {
  return (0, this.f$2)(arg1)
});
$c_sjsr_AnonFunction1.prototype.init___sjs_js_Function1 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction1 = new $TypeData().initClass({
  sjsr_AnonFunction1: 0
}, false, "scala.scalajs.runtime.AnonFunction1", {
  sjsr_AnonFunction1: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1
});
$c_sjsr_AnonFunction1.prototype.$classData = $d_sjsr_AnonFunction1;
/** @constructor */
function $c_sjsr_AnonFunction2() {
  $c_sr_AbstractFunction2.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction2.prototype = new $h_sr_AbstractFunction2();
$c_sjsr_AnonFunction2.prototype.constructor = $c_sjsr_AnonFunction2;
/** @constructor */
function $h_sjsr_AnonFunction2() {
  /*<skip>*/
}
$h_sjsr_AnonFunction2.prototype = $c_sjsr_AnonFunction2.prototype;
$c_sjsr_AnonFunction2.prototype.init___sjs_js_Function2 = (function(f) {
  this.f$2 = f;
  return this
});
$c_sjsr_AnonFunction2.prototype.apply__O__O__O = (function(arg1, arg2) {
  return (0, this.f$2)(arg1, arg2)
});
var $d_sjsr_AnonFunction2 = new $TypeData().initClass({
  sjsr_AnonFunction2: 0
}, false, "scala.scalajs.runtime.AnonFunction2", {
  sjsr_AnonFunction2: 1,
  sr_AbstractFunction2: 1,
  O: 1,
  F2: 1
});
$c_sjsr_AnonFunction2.prototype.$classData = $d_sjsr_AnonFunction2;
/** @constructor */
function $c_sjsr_RuntimeLong$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
  this.Zero$1 = null
}
$c_sjsr_RuntimeLong$.prototype = new $h_O();
$c_sjsr_RuntimeLong$.prototype.constructor = $c_sjsr_RuntimeLong$;
/** @constructor */
function $h_sjsr_RuntimeLong$() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong$.prototype = $c_sjsr_RuntimeLong$.prototype;
$c_sjsr_RuntimeLong$.prototype.init___ = (function() {
  $n_sjsr_RuntimeLong$ = this;
  this.Zero$1 = new $c_sjsr_RuntimeLong().init___I__I(0, 0);
  return this
});
$c_sjsr_RuntimeLong$.prototype.Zero__sjsr_RuntimeLong = (function() {
  return this.Zero$1
});
$c_sjsr_RuntimeLong$.prototype.toUnsignedString__p1__I__I__T = (function(lo, hi) {
  if ((((-2097152) & hi) === 0)) {
    var this$5 = ((4.294967296E9 * hi) + $uD((lo >>> 0)));
    return ("" + this$5)
  } else {
    return $as_T(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(lo, hi, 1000000000, 0, 2))
  }
});
$c_sjsr_RuntimeLong$.prototype.divideImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    if ((bhi === (blo >> 31))) {
      if (((alo === (-2147483648)) && (blo === (-1)))) {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return (-2147483648)
      } else {
        var lo = ((alo / blo) | 0);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
        return lo
      }
    } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-1);
      return (-1)
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else {
    var neg = (ahi < 0);
    if (neg) {
      var lo$1 = ((-alo) | 0);
      var hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
      var abs_$_lo$2 = lo$1;
      var abs_$_hi$2 = hi
    } else {
      var abs_$_lo$2 = alo;
      var abs_$_hi$2 = ahi
    };
    var neg$1 = (bhi < 0);
    if (neg$1) {
      var lo$2 = ((-blo) | 0);
      var hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
      var abs$1_$_lo$2 = lo$2;
      var abs$1_$_hi$2 = hi$1
    } else {
      var abs$1_$_lo$2 = blo;
      var abs$1_$_hi$2 = bhi
    };
    var absRLo = this.unsigned$und$div__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
    if ((neg === neg$1)) {
      return absRLo
    } else {
      var hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
      return ((-absRLo) | 0)
    }
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D = (function(lo, hi) {
  if ((hi < 0)) {
    var x = ((lo !== 0) ? (~hi) : ((-hi) | 0));
    var jsx$1 = $uD((x >>> 0));
    var x$1 = ((-lo) | 0);
    return (-((4.294967296E9 * jsx$1) + $uD((x$1 >>> 0))))
  } else {
    return ((4.294967296E9 * hi) + $uD((lo >>> 0)))
  }
});
$c_sjsr_RuntimeLong$.prototype.fromDouble__D__sjsr_RuntimeLong = (function(value) {
  var lo = this.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(value);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I = (function(value) {
  if ((value < (-9.223372036854776E18))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-2147483648);
    return 0
  } else if ((value >= 9.223372036854776E18)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 2147483647;
    return (-1)
  } else {
    var rawLo = $uI((value | 0));
    var x = (value / 4.294967296E9);
    var rawHi = $uI((x | 0));
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (((value < 0) && (rawLo !== 0)) ? (((-1) + rawHi) | 0) : rawHi);
    return rawLo
  }
});
$c_sjsr_RuntimeLong$.prototype.unsigned$und$div__p1__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble / bDouble);
      var x = (rDouble / 4.294967296E9);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = $uI((x | 0));
      return $uI((rDouble | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    var pow = ((31 - $clz32(blo)) | 0);
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((ahi >>> pow) | 0);
    return (((alo >>> pow) | 0) | ((ahi << 1) << ((31 - pow) | 0)))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    var pow$2 = ((31 - $clz32(bhi)) | 0);
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    return ((ahi >>> pow$2) | 0)
  } else {
    return $uI(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 0))
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$toString__I__I__T = (function(lo, hi) {
  return ((hi === (lo >> 31)) ? ("" + lo) : ((hi < 0) ? ("-" + this.toUnsignedString__p1__I__I__T(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))) : this.toUnsignedString__p1__I__I__T(lo, hi)))
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo === blo) ? 0 : ((((-2147483648) ^ alo) < ((-2147483648) ^ blo)) ? (-1) : 1)) : ((ahi < bhi) ? (-1) : 1))
});
$c_sjsr_RuntimeLong$.prototype.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar = (function(alo, ahi, blo, bhi, ask) {
  var shift = ((((bhi !== 0) ? $clz32(bhi) : ((32 + $clz32(blo)) | 0)) - ((ahi !== 0) ? $clz32(ahi) : ((32 + $clz32(alo)) | 0))) | 0);
  var n = shift;
  var lo = (((32 & n) === 0) ? (blo << n) : 0);
  var hi = (((32 & n) === 0) ? (((((blo >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (bhi << n)) : (blo << n));
  var bShiftLo = lo;
  var bShiftHi = hi;
  var remLo = alo;
  var remHi = ahi;
  var quotLo = 0;
  var quotHi = 0;
  while (((shift >= 0) && (((-2097152) & remHi) !== 0))) {
    var alo$1 = remLo;
    var ahi$1 = remHi;
    var blo$1 = bShiftLo;
    var bhi$1 = bShiftHi;
    if (((ahi$1 === bhi$1) ? (((-2147483648) ^ alo$1) >= ((-2147483648) ^ blo$1)) : (((-2147483648) ^ ahi$1) >= ((-2147483648) ^ bhi$1)))) {
      var lo$1 = remLo;
      var hi$1 = remHi;
      var lo$2 = bShiftLo;
      var hi$2 = bShiftHi;
      var lo$3 = ((lo$1 - lo$2) | 0);
      var hi$3 = ((((-2147483648) ^ lo$3) > ((-2147483648) ^ lo$1)) ? (((-1) + ((hi$1 - hi$2) | 0)) | 0) : ((hi$1 - hi$2) | 0));
      remLo = lo$3;
      remHi = hi$3;
      if ((shift < 32)) {
        quotLo = (quotLo | (1 << shift))
      } else {
        quotHi = (quotHi | (1 << shift))
      }
    };
    shift = (((-1) + shift) | 0);
    var lo$4 = bShiftLo;
    var hi$4 = bShiftHi;
    var lo$5 = (((lo$4 >>> 1) | 0) | (hi$4 << 31));
    var hi$5 = ((hi$4 >>> 1) | 0);
    bShiftLo = lo$5;
    bShiftHi = hi$5
  };
  var alo$2 = remLo;
  var ahi$2 = remHi;
  if (((ahi$2 === bhi) ? (((-2147483648) ^ alo$2) >= ((-2147483648) ^ blo)) : (((-2147483648) ^ ahi$2) >= ((-2147483648) ^ bhi)))) {
    var lo$6 = remLo;
    var hi$6 = remHi;
    var remDouble = ((4.294967296E9 * hi$6) + $uD((lo$6 >>> 0)));
    var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
    if ((ask !== 1)) {
      var x = (remDouble / bDouble);
      var lo$7 = $uI((x | 0));
      var x$1 = (x / 4.294967296E9);
      var hi$7 = $uI((x$1 | 0));
      var lo$8 = quotLo;
      var hi$8 = quotHi;
      var lo$9 = ((lo$8 + lo$7) | 0);
      var hi$9 = ((((-2147483648) ^ lo$9) < ((-2147483648) ^ lo$8)) ? ((1 + ((hi$8 + hi$7) | 0)) | 0) : ((hi$8 + hi$7) | 0));
      quotLo = lo$9;
      quotHi = hi$9
    };
    if ((ask !== 0)) {
      var rem_mod_bDouble = (remDouble % bDouble);
      remLo = $uI((rem_mod_bDouble | 0));
      var x$2 = (rem_mod_bDouble / 4.294967296E9);
      remHi = $uI((x$2 | 0))
    }
  };
  if ((ask === 0)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = quotHi;
    var a = quotLo;
    return a
  } else if ((ask === 1)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = remHi;
    var a$1 = remLo;
    return a$1
  } else {
    var lo$10 = quotLo;
    var hi$10 = quotHi;
    var quot = ((4.294967296E9 * hi$10) + $uD((lo$10 >>> 0)));
    var this$25 = remLo;
    var remStr = ("" + this$25);
    var a$2 = ((("" + quot) + $as_T("000000000".substring($uI(remStr.length)))) + remStr);
    return a$2
  }
});
$c_sjsr_RuntimeLong$.prototype.remainderImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    if ((bhi === (blo >> 31))) {
      if ((blo !== (-1))) {
        var lo = ((alo % blo) | 0);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
        return lo
      } else {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return 0
      }
    } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
      return alo
    }
  } else {
    var neg = (ahi < 0);
    if (neg) {
      var lo$1 = ((-alo) | 0);
      var hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
      var abs_$_lo$2 = lo$1;
      var abs_$_hi$2 = hi
    } else {
      var abs_$_lo$2 = alo;
      var abs_$_hi$2 = ahi
    };
    var neg$1 = (bhi < 0);
    if (neg$1) {
      var lo$2 = ((-blo) | 0);
      var hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
      var abs$1_$_lo$2 = lo$2;
      var abs$1_$_hi$2 = hi$1
    } else {
      var abs$1_$_lo$2 = blo;
      var abs$1_$_hi$2 = bhi
    };
    var absRLo = this.unsigned$und$percent__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
    if (neg) {
      var hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
      return ((-absRLo) | 0)
    } else {
      return absRLo
    }
  }
});
$c_sjsr_RuntimeLong$.prototype.unsigned$und$percent__p1__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble % bDouble);
      var x = (rDouble / 4.294967296E9);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = $uI((x | 0));
      return $uI((rDouble | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
      return alo
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    return (alo & (((-1) + blo) | 0))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (ahi & (((-1) + bhi) | 0));
    return alo
  } else {
    return $uI(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 1))
  }
});
var $d_sjsr_RuntimeLong$ = new $TypeData().initClass({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", {
  sjsr_RuntimeLong$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_RuntimeLong$.prototype.$classData = $d_sjsr_RuntimeLong$;
var $n_sjsr_RuntimeLong$ = (void 0);
function $m_sjsr_RuntimeLong$() {
  if ((!$n_sjsr_RuntimeLong$)) {
    $n_sjsr_RuntimeLong$ = new $c_sjsr_RuntimeLong$().init___()
  };
  return $n_sjsr_RuntimeLong$
}
/** @constructor */
function $c_sr_AbstractPartialFunction() {
  $c_O.call(this)
}
$c_sr_AbstractPartialFunction.prototype = new $h_O();
$c_sr_AbstractPartialFunction.prototype.constructor = $c_sr_AbstractPartialFunction;
/** @constructor */
function $h_sr_AbstractPartialFunction() {
  /*<skip>*/
}
$h_sr_AbstractPartialFunction.prototype = $c_sr_AbstractPartialFunction.prototype;
$c_sr_AbstractPartialFunction.prototype.apply__O__O = (function(x) {
  return this.applyOrElse__O__F1__O(x, $m_s_PartialFunction$().empty$undpf$1)
});
$c_sr_AbstractPartialFunction.prototype.toString__T = (function() {
  return "<function1>"
});
$c_sr_AbstractPartialFunction.prototype.apply$mcZI$sp__I__Z = (function(x) {
  return $uZ(this.applyOrElse__O__F1__O(x, $m_s_PartialFunction$().empty$undpf$1))
});
var $d_sr_Nothing$ = new $TypeData().initClass({
  sr_Nothing$: 0
}, false, "scala.runtime.Nothing$", {
  sr_Nothing$: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
/** @constructor */
function $c_Ljava_io_OutputStream() {
  $c_O.call(this)
}
$c_Ljava_io_OutputStream.prototype = new $h_O();
$c_Ljava_io_OutputStream.prototype.constructor = $c_Ljava_io_OutputStream;
/** @constructor */
function $h_Ljava_io_OutputStream() {
  /*<skip>*/
}
$h_Ljava_io_OutputStream.prototype = $c_Ljava_io_OutputStream.prototype;
var $d_Lorg_scalajs_threejs_Object3D = new $TypeData().initClass({
  Lorg_scalajs_threejs_Object3D: 0
}, false, "org.scalajs.threejs.Object3D", {
  Lorg_scalajs_threejs_Object3D: 1,
  sjs_js_Object: 1,
  O: 1,
  sjs_js_Any: 1,
  Lorg_scalajs_threejs_EventDispatcher: 1
}, true, (void 0), (function(x) {
  return (x instanceof $g.THREE.Object3D)
}));
var $d_Lorg_scalajs_threejs_Vector3 = new $TypeData().initClass({
  Lorg_scalajs_threejs_Vector3: 0
}, false, "org.scalajs.threejs.Vector3", {
  Lorg_scalajs_threejs_Vector3: 1,
  sjs_js_Object: 1,
  O: 1,
  sjs_js_Any: 1,
  Lorg_scalajs_threejs_Vector: 1
}, true, (void 0), (function(x) {
  return (x instanceof $g.THREE.Vector3)
}));
function $is_T(obj) {
  return ((typeof obj) === "string")
}
function $as_T(obj) {
  return (($is_T(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.String"))
}
function $isArrayOf_T(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
}
function $asArrayOf_T(obj, depth) {
  return (($isArrayOf_T(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.String;", depth))
}
var $d_T = new $TypeData().initClass({
  T: 0
}, false, "java.lang.String", {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, (void 0), (void 0), $is_T);
/** @constructor */
function $c_jl_AssertionError() {
  $c_jl_Error.call(this)
}
$c_jl_AssertionError.prototype = new $h_jl_Error();
$c_jl_AssertionError.prototype.constructor = $c_jl_AssertionError;
/** @constructor */
function $h_jl_AssertionError() {
  /*<skip>*/
}
$h_jl_AssertionError.prototype = $c_jl_AssertionError.prototype;
$c_jl_AssertionError.prototype.init___O = (function(detailMessage) {
  var message = ("" + detailMessage);
  if ($is_jl_Throwable(detailMessage)) {
    var x2 = $as_jl_Throwable(detailMessage);
    var cause = x2
  } else {
    var cause = null
  };
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, message, cause);
  return this
});
var $d_jl_AssertionError = new $TypeData().initClass({
  jl_AssertionError: 0
}, false, "java.lang.AssertionError", {
  jl_AssertionError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_AssertionError.prototype.$classData = $d_jl_AssertionError;
var $d_jl_Byte = new $TypeData().initClass({
  jl_Byte: 0
}, false, "java.lang.Byte", {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isByte(x)
}));
/** @constructor */
function $c_jl_CloneNotSupportedException() {
  $c_jl_Exception.call(this)
}
$c_jl_CloneNotSupportedException.prototype = new $h_jl_Exception();
$c_jl_CloneNotSupportedException.prototype.constructor = $c_jl_CloneNotSupportedException;
/** @constructor */
function $h_jl_CloneNotSupportedException() {
  /*<skip>*/
}
$h_jl_CloneNotSupportedException.prototype = $c_jl_CloneNotSupportedException.prototype;
$c_jl_CloneNotSupportedException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_jl_CloneNotSupportedException = new $TypeData().initClass({
  jl_CloneNotSupportedException: 0
}, false, "java.lang.CloneNotSupportedException", {
  jl_CloneNotSupportedException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_CloneNotSupportedException.prototype.$classData = $d_jl_CloneNotSupportedException;
function $isArrayOf_jl_Double(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
}
function $asArrayOf_jl_Double(obj, depth) {
  return (($isArrayOf_jl_Double(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Double;", depth))
}
var $d_jl_Double = new $TypeData().initClass({
  jl_Double: 0
}, false, "java.lang.Double", {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "number")
}));
var $d_jl_Float = new $TypeData().initClass({
  jl_Float: 0
}, false, "java.lang.Float", {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isFloat(x)
}));
var $d_jl_Integer = new $TypeData().initClass({
  jl_Integer: 0
}, false, "java.lang.Integer", {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isInt(x)
}));
function $is_jl_InterruptedException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_InterruptedException)))
}
function $as_jl_InterruptedException(obj) {
  return (($is_jl_InterruptedException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.InterruptedException"))
}
function $isArrayOf_jl_InterruptedException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_InterruptedException)))
}
function $asArrayOf_jl_InterruptedException(obj, depth) {
  return (($isArrayOf_jl_InterruptedException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.InterruptedException;", depth))
}
function $is_jl_LinkageError(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_LinkageError)))
}
function $as_jl_LinkageError(obj) {
  return (($is_jl_LinkageError(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.LinkageError"))
}
function $isArrayOf_jl_LinkageError(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_LinkageError)))
}
function $asArrayOf_jl_LinkageError(obj, depth) {
  return (($isArrayOf_jl_LinkageError(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.LinkageError;", depth))
}
function $isArrayOf_jl_Long(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
}
function $asArrayOf_jl_Long(obj, depth) {
  return (($isArrayOf_jl_Long(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Long;", depth))
}
var $d_jl_Long = new $TypeData().initClass({
  jl_Long: 0
}, false, "java.lang.Long", {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $is_sjsr_RuntimeLong(x)
}));
/** @constructor */
function $c_jl_RuntimeException() {
  $c_jl_Exception.call(this)
}
$c_jl_RuntimeException.prototype = new $h_jl_Exception();
$c_jl_RuntimeException.prototype.constructor = $c_jl_RuntimeException;
/** @constructor */
function $h_jl_RuntimeException() {
  /*<skip>*/
}
$h_jl_RuntimeException.prototype = $c_jl_RuntimeException.prototype;
var $d_jl_Short = new $TypeData().initClass({
  jl_Short: 0
}, false, "java.lang.Short", {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isShort(x)
}));
/** @constructor */
function $c_jl_StringBuilder() {
  $c_O.call(this);
  this.java$lang$StringBuilder$$content$f = null
}
$c_jl_StringBuilder.prototype = new $h_O();
$c_jl_StringBuilder.prototype.constructor = $c_jl_StringBuilder;
/** @constructor */
function $h_jl_StringBuilder() {
  /*<skip>*/
}
$h_jl_StringBuilder.prototype = $c_jl_StringBuilder.prototype;
$c_jl_StringBuilder.prototype.init___ = (function() {
  this.java$lang$StringBuilder$$content$f = "";
  return this
});
$c_jl_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  return this.substring__I__I__T(start, end)
});
$c_jl_StringBuilder.prototype.toString__T = (function() {
  return this.java$lang$StringBuilder$$content$f
});
$c_jl_StringBuilder.prototype.init___I = (function(initialCapacity) {
  $c_jl_StringBuilder.prototype.init___.call(this);
  if ((initialCapacity < 0)) {
    throw new $c_jl_NegativeArraySizeException().init___()
  };
  return this
});
$c_jl_StringBuilder.prototype.append__jl_CharSequence__I__I__jl_StringBuilder = (function(s, start, end) {
  var s$1 = $charSequenceSubSequence(((s === null) ? "null" : s), start, end);
  this.java$lang$StringBuilder$$content$f = (("" + this.java$lang$StringBuilder$$content$f) + s$1);
  return this
});
$c_jl_StringBuilder.prototype.length__I = (function() {
  var thiz = this.java$lang$StringBuilder$$content$f;
  return $uI(thiz.length)
});
$c_jl_StringBuilder.prototype.append__C__jl_StringBuilder = (function(c) {
  var str = $as_T($g.String.fromCharCode(c));
  this.java$lang$StringBuilder$$content$f = (("" + this.java$lang$StringBuilder$$content$f) + str);
  return this
});
$c_jl_StringBuilder.prototype.substring__I__I__T = (function(start, end) {
  var thiz = this.java$lang$StringBuilder$$content$f;
  return $as_T(thiz.substring(start, end))
});
$c_jl_StringBuilder.prototype.init___T = (function(str) {
  $c_jl_StringBuilder.prototype.init___.call(this);
  if ((str === null)) {
    throw new $c_jl_NullPointerException().init___()
  };
  this.java$lang$StringBuilder$$content$f = str;
  return this
});
$c_jl_StringBuilder.prototype.charAt__I__C = (function(index) {
  var thiz = this.java$lang$StringBuilder$$content$f;
  return (65535 & $uI(thiz.charCodeAt(index)))
});
var $d_jl_StringBuilder = new $TypeData().initClass({
  jl_StringBuilder: 0
}, false, "java.lang.StringBuilder", {
  jl_StringBuilder: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StringBuilder.prototype.$classData = $d_jl_StringBuilder;
function $is_jl_ThreadDeath(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ThreadDeath)))
}
function $as_jl_ThreadDeath(obj) {
  return (($is_jl_ThreadDeath(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.ThreadDeath"))
}
function $isArrayOf_jl_ThreadDeath(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ThreadDeath)))
}
function $asArrayOf_jl_ThreadDeath(obj, depth) {
  return (($isArrayOf_jl_ThreadDeath(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.ThreadDeath;", depth))
}
function $is_jl_VirtualMachineError(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_VirtualMachineError)))
}
function $as_jl_VirtualMachineError(obj) {
  return (($is_jl_VirtualMachineError(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.VirtualMachineError"))
}
function $isArrayOf_jl_VirtualMachineError(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_VirtualMachineError)))
}
function $asArrayOf_jl_VirtualMachineError(obj, depth) {
  return (($isArrayOf_jl_VirtualMachineError(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.VirtualMachineError;", depth))
}
/** @constructor */
function $c_ju_concurrent_ExecutionException() {
  $c_jl_Exception.call(this)
}
$c_ju_concurrent_ExecutionException.prototype = new $h_jl_Exception();
$c_ju_concurrent_ExecutionException.prototype.constructor = $c_ju_concurrent_ExecutionException;
/** @constructor */
function $h_ju_concurrent_ExecutionException() {
  /*<skip>*/
}
$h_ju_concurrent_ExecutionException.prototype = $c_ju_concurrent_ExecutionException.prototype;
$c_ju_concurrent_ExecutionException.prototype.init___T__jl_Throwable = (function(message, cause) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, message, cause);
  return this
});
var $d_ju_concurrent_ExecutionException = new $TypeData().initClass({
  ju_concurrent_ExecutionException: 0
}, false, "java.util.concurrent.ExecutionException", {
  ju_concurrent_ExecutionException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_concurrent_ExecutionException.prototype.$classData = $d_ju_concurrent_ExecutionException;
/** @constructor */
function $c_s_Array$() {
  $c_s_FallbackArrayBuilding.call(this)
}
$c_s_Array$.prototype = new $h_s_FallbackArrayBuilding();
$c_s_Array$.prototype.constructor = $c_s_Array$;
/** @constructor */
function $h_s_Array$() {
  /*<skip>*/
}
$h_s_Array$.prototype = $c_s_Array$.prototype;
$c_s_Array$.prototype.init___ = (function() {
  return this
});
$c_s_Array$.prototype.slowcopy__p2__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var i = srcPos;
  var j = destPos;
  var srcUntil = ((srcPos + length) | 0);
  while ((i < srcUntil)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(dest, j, $m_sr_ScalaRunTime$().array$undapply__O__I__O(src, i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
});
$c_s_Array$.prototype.apply__I__sc_Seq__AI = (function(x, xs) {
  var array = $newArrayObject($d_I.getArrayOf(), [((1 + xs.length__I()) | 0)]);
  array.set(0, x);
  var elem$1 = 0;
  elem$1 = 1;
  var this$2 = xs.iterator__sc_Iterator();
  while (this$2.hasNext__Z()) {
    var arg1 = this$2.next__O();
    var x$2 = $uI(arg1);
    array.set(elem$1, x$2);
    elem$1 = ((1 + elem$1) | 0)
  };
  return array
});
$c_s_Array$.prototype.copy__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var srcClass = $objectGetClass(src);
  if ((srcClass.isArray__Z() && $objectGetClass(dest).isAssignableFrom__jl_Class__Z(srcClass))) {
    $systemArraycopy(src, srcPos, dest, destPos, length)
  } else {
    this.slowcopy__p2__O__I__O__I__I__V(src, srcPos, dest, destPos, length)
  }
});
var $d_s_Array$ = new $TypeData().initClass({
  s_Array$: 0
}, false, "scala.Array$", {
  s_Array$: 1,
  s_FallbackArrayBuilding: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Array$.prototype.$classData = $d_s_Array$;
var $n_s_Array$ = (void 0);
function $m_s_Array$() {
  if ((!$n_s_Array$)) {
    $n_s_Array$ = new $c_s_Array$().init___()
  };
  return $n_s_Array$
}
/** @constructor */
function $c_s_Predef$$eq$colon$eq() {
  $c_O.call(this)
}
$c_s_Predef$$eq$colon$eq.prototype = new $h_O();
$c_s_Predef$$eq$colon$eq.prototype.constructor = $c_s_Predef$$eq$colon$eq;
/** @constructor */
function $h_s_Predef$$eq$colon$eq() {
  /*<skip>*/
}
$h_s_Predef$$eq$colon$eq.prototype = $c_s_Predef$$eq$colon$eq.prototype;
$c_s_Predef$$eq$colon$eq.prototype.toString__T = (function() {
  return "<function1>"
});
$c_s_Predef$$eq$colon$eq.prototype.apply$mcZI$sp__I__Z = (function(v1) {
  return $uZ(v1)
});
/** @constructor */
function $c_s_Predef$$less$colon$less() {
  $c_O.call(this)
}
$c_s_Predef$$less$colon$less.prototype = new $h_O();
$c_s_Predef$$less$colon$less.prototype.constructor = $c_s_Predef$$less$colon$less;
/** @constructor */
function $h_s_Predef$$less$colon$less() {
  /*<skip>*/
}
$h_s_Predef$$less$colon$less.prototype = $c_s_Predef$$less$colon$less.prototype;
$c_s_Predef$$less$colon$less.prototype.toString__T = (function() {
  return "<function1>"
});
$c_s_Predef$$less$colon$less.prototype.apply$mcZI$sp__I__Z = (function(v1) {
  return $uZ(v1)
});
function $f_s_concurrent_impl_Promise$KeptPromise$Kept__onComplete__F1__s_concurrent_ExecutionContext__V($thiz, func, executor) {
  new $c_s_concurrent_impl_CallbackRunnable().init___s_concurrent_ExecutionContext__F1(executor, func).executeWithValue__s_util_Try__V($thiz.result__s_util_Try())
}
/** @constructor */
function $c_s_math_Equiv$() {
  $c_O.call(this)
}
$c_s_math_Equiv$.prototype = new $h_O();
$c_s_math_Equiv$.prototype.constructor = $c_s_math_Equiv$;
/** @constructor */
function $h_s_math_Equiv$() {
  /*<skip>*/
}
$h_s_math_Equiv$.prototype = $c_s_math_Equiv$.prototype;
$c_s_math_Equiv$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Equiv$ = new $TypeData().initClass({
  s_math_Equiv$: 0
}, false, "scala.math.Equiv$", {
  s_math_Equiv$: 1,
  O: 1,
  s_math_LowPriorityEquiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Equiv$.prototype.$classData = $d_s_math_Equiv$;
var $n_s_math_Equiv$ = (void 0);
function $m_s_math_Equiv$() {
  if ((!$n_s_math_Equiv$)) {
    $n_s_math_Equiv$ = new $c_s_math_Equiv$().init___()
  };
  return $n_s_math_Equiv$
}
/** @constructor */
function $c_s_math_Ordering$() {
  $c_O.call(this)
}
$c_s_math_Ordering$.prototype = new $h_O();
$c_s_math_Ordering$.prototype.constructor = $c_s_math_Ordering$;
/** @constructor */
function $h_s_math_Ordering$() {
  /*<skip>*/
}
$h_s_math_Ordering$.prototype = $c_s_math_Ordering$.prototype;
$c_s_math_Ordering$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Ordering$ = new $TypeData().initClass({
  s_math_Ordering$: 0
}, false, "scala.math.Ordering$", {
  s_math_Ordering$: 1,
  O: 1,
  s_math_LowPriorityOrderingImplicits: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Ordering$.prototype.$classData = $d_s_math_Ordering$;
var $n_s_math_Ordering$ = (void 0);
function $m_s_math_Ordering$() {
  if ((!$n_s_math_Ordering$)) {
    $n_s_math_Ordering$ = new $c_s_math_Ordering$().init___()
  };
  return $n_s_math_Ordering$
}
/** @constructor */
function $c_s_reflect_NoManifest$() {
  $c_O.call(this)
}
$c_s_reflect_NoManifest$.prototype = new $h_O();
$c_s_reflect_NoManifest$.prototype.constructor = $c_s_reflect_NoManifest$;
/** @constructor */
function $h_s_reflect_NoManifest$() {
  /*<skip>*/
}
$h_s_reflect_NoManifest$.prototype = $c_s_reflect_NoManifest$.prototype;
$c_s_reflect_NoManifest$.prototype.init___ = (function() {
  return this
});
$c_s_reflect_NoManifest$.prototype.toString__T = (function() {
  return "<?>"
});
var $d_s_reflect_NoManifest$ = new $TypeData().initClass({
  s_reflect_NoManifest$: 0
}, false, "scala.reflect.NoManifest$", {
  s_reflect_NoManifest$: 1,
  O: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_reflect_NoManifest$.prototype.$classData = $d_s_reflect_NoManifest$;
var $n_s_reflect_NoManifest$ = (void 0);
function $m_s_reflect_NoManifest$() {
  if ((!$n_s_reflect_NoManifest$)) {
    $n_s_reflect_NoManifest$ = new $c_s_reflect_NoManifest$().init___()
  };
  return $n_s_reflect_NoManifest$
}
/** @constructor */
function $c_sc_AbstractIterator() {
  $c_O.call(this)
}
$c_sc_AbstractIterator.prototype = new $h_O();
$c_sc_AbstractIterator.prototype.constructor = $c_sc_AbstractIterator;
/** @constructor */
function $h_sc_AbstractIterator() {
  /*<skip>*/
}
$h_sc_AbstractIterator.prototype = $c_sc_AbstractIterator.prototype;
$c_sc_AbstractIterator.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sc_AbstractIterator.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_sc_AbstractIterator.prototype.isEmpty__Z = (function() {
  return $f_sc_Iterator__isEmpty__Z(this)
});
$c_sc_AbstractIterator.prototype.toString__T = (function() {
  return $f_sc_Iterator__toString__T(this)
});
$c_sc_AbstractIterator.prototype.foreach__F1__V = (function(f) {
  $f_sc_Iterator__foreach__F1__V(this, f)
});
$c_sc_AbstractIterator.prototype.foldLeft__O__F2__O = (function(z, op) {
  return $f_sc_TraversableOnce__foldLeft__O__F2__O(this, z, op)
});
$c_sc_AbstractIterator.prototype.toBuffer__scm_Buffer = (function() {
  var this$1 = $m_scm_ArrayBuffer$();
  var cbf = this$1.ReusableCBFInstance$2;
  return $as_scm_Buffer($f_sc_TraversableOnce__to__scg_CanBuildFrom__O(this, cbf))
});
$c_sc_AbstractIterator.prototype.size__I = (function() {
  return $f_sc_TraversableOnce__size__I(this)
});
$c_sc_AbstractIterator.prototype.toStream__sci_Stream = (function() {
  return $f_sc_Iterator__toStream__sci_Stream(this)
});
$c_sc_AbstractIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractIterator.prototype.isTraversableAgain__Z = (function() {
  return false
});
$c_sc_AbstractIterator.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_Iterator__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_sc_AbstractIterator.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
/** @constructor */
function $c_scg_SetFactory() {
  $c_scg_GenSetFactory.call(this)
}
$c_scg_SetFactory.prototype = new $h_scg_GenSetFactory();
$c_scg_SetFactory.prototype.constructor = $c_scg_SetFactory;
/** @constructor */
function $h_scg_SetFactory() {
  /*<skip>*/
}
$h_scg_SetFactory.prototype = $c_scg_SetFactory.prototype;
/** @constructor */
function $c_sci_Map$() {
  $c_scg_ImmutableMapFactory.call(this)
}
$c_sci_Map$.prototype = new $h_scg_ImmutableMapFactory();
$c_sci_Map$.prototype.constructor = $c_sci_Map$;
/** @constructor */
function $h_sci_Map$() {
  /*<skip>*/
}
$h_sci_Map$.prototype = $c_sci_Map$.prototype;
$c_sci_Map$.prototype.init___ = (function() {
  return this
});
$c_sci_Map$.prototype.empty__sc_GenMap = (function() {
  return $m_sci_Map$EmptyMap$()
});
var $d_sci_Map$ = new $TypeData().initClass({
  sci_Map$: 0
}, false, "scala.collection.immutable.Map$", {
  sci_Map$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1
});
$c_sci_Map$.prototype.$classData = $d_sci_Map$;
var $n_sci_Map$ = (void 0);
function $m_sci_Map$() {
  if ((!$n_sci_Map$)) {
    $n_sci_Map$ = new $c_sci_Map$().init___()
  };
  return $n_sci_Map$
}
/** @constructor */
function $c_scm_GrowingBuilder() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
}
$c_scm_GrowingBuilder.prototype = new $h_O();
$c_scm_GrowingBuilder.prototype.constructor = $c_scm_GrowingBuilder;
/** @constructor */
function $h_scm_GrowingBuilder() {
  /*<skip>*/
}
$h_scm_GrowingBuilder.prototype = $c_scm_GrowingBuilder.prototype;
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scm_GrowingBuilder = (function(x) {
  this.elems$1.$$plus$eq__O__scg_Growable(x);
  return this
});
$c_scm_GrowingBuilder.prototype.init___scg_Growable = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
$c_scm_GrowingBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_GrowingBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
$c_scm_GrowingBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_GrowingBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_GrowingBuilder = new $TypeData().initClass({
  scm_GrowingBuilder: 0
}, false, "scala.collection.mutable.GrowingBuilder", {
  scm_GrowingBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_GrowingBuilder.prototype.$classData = $d_scm_GrowingBuilder;
/** @constructor */
function $c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext() {
  $c_O.call(this);
  this.resolvedUnitPromise$1 = null
}
$c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext.prototype = new $h_O();
$c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext.prototype.constructor = $c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext;
/** @constructor */
function $h_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext() {
  /*<skip>*/
}
$h_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext.prototype = $c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext.prototype;
$c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext.prototype.init___ = (function() {
  this.resolvedUnitPromise$1 = $g.Promise.resolve((void 0));
  return this
});
$c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext.prototype.scala$scalajs$concurrent$QueueExecutionContext$PromisesExecutionContext$$$anonfun$execute$2__sr_BoxedUnit__jl_Runnable__sjs_js_$bar = (function(x$1, runnable$2) {
  try {
    runnable$2.run__V()
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      e$2.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
    } else {
      throw e
    }
  }
});
$c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext.prototype.reportFailure__jl_Throwable__V = (function(t) {
  t.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
});
$c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext.prototype.execute__jl_Runnable__V = (function(runnable) {
  this.resolvedUnitPromise$1.then((function(arg$outer, runnable$2) {
    return (function(arg1$2) {
      var arg1 = $asUnit(arg1$2);
      return arg$outer.scala$scalajs$concurrent$QueueExecutionContext$PromisesExecutionContext$$$anonfun$execute$2__sr_BoxedUnit__jl_Runnable__sjs_js_$bar(arg1, runnable$2)
    })
  })(this, runnable))
});
var $d_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext = new $TypeData().initClass({
  sjs_concurrent_QueueExecutionContext$PromisesExecutionContext: 0
}, false, "scala.scalajs.concurrent.QueueExecutionContext$PromisesExecutionContext", {
  sjs_concurrent_QueueExecutionContext$PromisesExecutionContext: 1,
  O: 1,
  s_concurrent_ExecutionContextExecutor: 1,
  s_concurrent_ExecutionContext: 1,
  ju_concurrent_Executor: 1
});
$c_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext.prototype.$classData = $d_sjs_concurrent_QueueExecutionContext$PromisesExecutionContext;
/** @constructor */
function $c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext() {
  $c_O.call(this)
}
$c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext.prototype = new $h_O();
$c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext.prototype.constructor = $c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext;
/** @constructor */
function $h_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext() {
  /*<skip>*/
}
$h_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext.prototype = $c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext.prototype;
$c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext.prototype.init___ = (function() {
  return this
});
$c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext.prototype.reportFailure__jl_Throwable__V = (function(t) {
  t.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
});
$c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext.prototype.execute__jl_Runnable__V = (function(runnable) {
  $g.setTimeout((function($this, runnable$1) {
    return (function() {
      try {
        runnable$1.run__V()
      } catch (e) {
        var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
        if ((e$2 !== null)) {
          e$2.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
        } else {
          throw e
        }
      }
    })
  })(this, runnable), 0)
});
var $d_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext = new $TypeData().initClass({
  sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext: 0
}, false, "scala.scalajs.concurrent.QueueExecutionContext$TimeoutsExecutionContext", {
  sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext: 1,
  O: 1,
  s_concurrent_ExecutionContextExecutor: 1,
  s_concurrent_ExecutionContext: 1,
  ju_concurrent_Executor: 1
});
$c_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext.prototype.$classData = $d_sjs_concurrent_QueueExecutionContext$TimeoutsExecutionContext;
/** @constructor */
function $c_sjs_concurrent_RunNowExecutionContext$() {
  $c_O.call(this)
}
$c_sjs_concurrent_RunNowExecutionContext$.prototype = new $h_O();
$c_sjs_concurrent_RunNowExecutionContext$.prototype.constructor = $c_sjs_concurrent_RunNowExecutionContext$;
/** @constructor */
function $h_sjs_concurrent_RunNowExecutionContext$() {
  /*<skip>*/
}
$h_sjs_concurrent_RunNowExecutionContext$.prototype = $c_sjs_concurrent_RunNowExecutionContext$.prototype;
$c_sjs_concurrent_RunNowExecutionContext$.prototype.init___ = (function() {
  return this
});
$c_sjs_concurrent_RunNowExecutionContext$.prototype.reportFailure__jl_Throwable__V = (function(t) {
  t.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
});
$c_sjs_concurrent_RunNowExecutionContext$.prototype.execute__jl_Runnable__V = (function(runnable) {
  try {
    runnable.run__V()
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      e$2.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1)
    } else {
      throw e
    }
  }
});
var $d_sjs_concurrent_RunNowExecutionContext$ = new $TypeData().initClass({
  sjs_concurrent_RunNowExecutionContext$: 0
}, false, "scala.scalajs.concurrent.RunNowExecutionContext$", {
  sjs_concurrent_RunNowExecutionContext$: 1,
  O: 1,
  s_concurrent_ExecutionContextExecutor: 1,
  s_concurrent_ExecutionContext: 1,
  ju_concurrent_Executor: 1
});
$c_sjs_concurrent_RunNowExecutionContext$.prototype.$classData = $d_sjs_concurrent_RunNowExecutionContext$;
var $n_sjs_concurrent_RunNowExecutionContext$ = (void 0);
function $m_sjs_concurrent_RunNowExecutionContext$() {
  if ((!$n_sjs_concurrent_RunNowExecutionContext$)) {
    $n_sjs_concurrent_RunNowExecutionContext$ = new $c_sjs_concurrent_RunNowExecutionContext$().init___()
  };
  return $n_sjs_concurrent_RunNowExecutionContext$
}
var $d_sjs_js_Array = new $TypeData().initClass({
  sjs_js_Array: 0
}, false, "scala.scalajs.js.Array", {
  sjs_js_Array: 1,
  sjs_js_Object: 1,
  O: 1,
  sjs_js_Any: 1,
  sjs_js_Iterable: 1
}, true, (void 0), (function(x) {
  return (x instanceof $g.Array)
}));
/** @constructor */
function $c_sjsr_RuntimeLong() {
  $c_jl_Number.call(this);
  this.lo$2 = 0;
  this.hi$2 = 0
}
$c_sjsr_RuntimeLong.prototype = new $h_jl_Number();
$c_sjsr_RuntimeLong.prototype.constructor = $c_sjsr_RuntimeLong;
/** @constructor */
function $h_sjsr_RuntimeLong() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong.prototype = $c_sjsr_RuntimeLong.prototype;
$c_sjsr_RuntimeLong.prototype.longValue__J = (function() {
  return $uJ(this)
});
$c_sjsr_RuntimeLong.prototype.$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 | b.lo$2), (this.hi$2 | b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) >= ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
});
$c_sjsr_RuntimeLong.prototype.byteValue__B = (function() {
  return ((this.lo$2 << 24) >> 24)
});
$c_sjsr_RuntimeLong.prototype.equals__O__Z = (function(that) {
  if ($is_sjsr_RuntimeLong(that)) {
    var x2 = $as_sjsr_RuntimeLong(that);
    return ((this.lo$2 === x2.lo$2) && (this.hi$2 === x2.hi$2))
  } else {
    return false
  }
});
$c_sjsr_RuntimeLong.prototype.$$less__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) < ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
});
$c_sjsr_RuntimeLong.prototype.$$times__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var blo = b.lo$2;
  var a0 = (65535 & alo);
  var a1 = ((alo >>> 16) | 0);
  var b0 = (65535 & blo);
  var b1 = ((blo >>> 16) | 0);
  var a0b0 = $imul(a0, b0);
  var a1b0 = $imul(a1, b0);
  var a0b1 = $imul(a0, b1);
  var lo = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
  var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
  var hi = (((((((($imul(alo, b.hi$2) + $imul(this.hi$2, blo)) | 0) + $imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
});
$c_sjsr_RuntimeLong.prototype.init___I__I__I = (function(l, m, h) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, (l | (m << 22)), ((m >> 10) | (h << 12)));
  return this
});
$c_sjsr_RuntimeLong.prototype.$$percent__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.remainderImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong.prototype.toString__T = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toString__I__I__T(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.init___I__I = (function(lo, hi) {
  this.lo$2 = lo;
  this.hi$2 = hi;
  return this
});
$c_sjsr_RuntimeLong.prototype.compareTo__O__I = (function(x$1) {
  var that = $as_sjsr_RuntimeLong(x$1);
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
});
$c_sjsr_RuntimeLong.prototype.$$less$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) <= ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
});
$c_sjsr_RuntimeLong.prototype.$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 & b.lo$2), (this.hi$2 & b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater$greater__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : ((this.hi$2 >>> n) | 0)), (((32 & n) === 0) ? ((this.hi$2 >>> n) | 0) : 0))
});
$c_sjsr_RuntimeLong.prototype.$$greater__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) > ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
});
$c_sjsr_RuntimeLong.prototype.$$less$less__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (this.lo$2 << n) : 0), (((32 & n) === 0) ? (((((this.lo$2 >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (this.hi$2 << n)) : (this.lo$2 << n)))
});
$c_sjsr_RuntimeLong.prototype.init___I = (function(value) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, value, (value >> 31));
  return this
});
$c_sjsr_RuntimeLong.prototype.toInt__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.notEquals__sjsr_RuntimeLong__Z = (function(b) {
  return (!((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2)))
});
$c_sjsr_RuntimeLong.prototype.unary$und$minus__sjsr_RuntimeLong = (function() {
  var lo = this.lo$2;
  var hi = this.hi$2;
  return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  var lo = ((alo + b.lo$2) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) < ((-2147483648) ^ alo)) ? ((1 + ((ahi + bhi) | 0)) | 0) : ((ahi + bhi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.shortValue__S = (function() {
  return ((this.lo$2 << 16) >> 16)
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : (this.hi$2 >> n)), (((32 & n) === 0) ? (this.hi$2 >> n) : (this.hi$2 >> 31)))
});
$c_sjsr_RuntimeLong.prototype.toDouble__D = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.$$div__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.divideImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong.prototype.doubleValue__D = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.hashCode__I = (function() {
  return (this.lo$2 ^ this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.intValue__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.unary$und$tilde__sjsr_RuntimeLong = (function() {
  return new $c_sjsr_RuntimeLong().init___I__I((~this.lo$2), (~this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.compareTo__jl_Long__I = (function(that) {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
});
$c_sjsr_RuntimeLong.prototype.floatValue__F = (function() {
  return $fround($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  var lo = ((alo - b.lo$2) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) > ((-2147483648) ^ alo)) ? (((-1) + ((ahi - bhi) | 0)) | 0) : ((ahi - bhi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 ^ b.lo$2), (this.hi$2 ^ b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.equals__sjsr_RuntimeLong__Z = (function(b) {
  return ((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2))
});
function $is_sjsr_RuntimeLong(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong)))
}
function $as_sjsr_RuntimeLong(obj) {
  return (($is_sjsr_RuntimeLong(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong"))
}
function $isArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
}
function $asArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (($isArrayOf_sjsr_RuntimeLong(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong;", depth))
}
var $d_sjsr_RuntimeLong = new $TypeData().initClass({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_sjsr_RuntimeLong.prototype.$classData = $d_sjsr_RuntimeLong;
/** @constructor */
function $c_Ljava_io_FilterOutputStream() {
  $c_Ljava_io_OutputStream.call(this);
  this.out$2 = null
}
$c_Ljava_io_FilterOutputStream.prototype = new $h_Ljava_io_OutputStream();
$c_Ljava_io_FilterOutputStream.prototype.constructor = $c_Ljava_io_FilterOutputStream;
/** @constructor */
function $h_Ljava_io_FilterOutputStream() {
  /*<skip>*/
}
$h_Ljava_io_FilterOutputStream.prototype = $c_Ljava_io_FilterOutputStream.prototype;
$c_Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream = (function(out) {
  this.out$2 = out;
  return this
});
/** @constructor */
function $c_jl_ArithmeticException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ArithmeticException.prototype = new $h_jl_RuntimeException();
$c_jl_ArithmeticException.prototype.constructor = $c_jl_ArithmeticException;
/** @constructor */
function $h_jl_ArithmeticException() {
  /*<skip>*/
}
$h_jl_ArithmeticException.prototype = $c_jl_ArithmeticException.prototype;
$c_jl_ArithmeticException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_ArithmeticException = new $TypeData().initClass({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArithmeticException.prototype.$classData = $d_jl_ArithmeticException;
/** @constructor */
function $c_jl_ClassCastException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ClassCastException.prototype = new $h_jl_RuntimeException();
$c_jl_ClassCastException.prototype.constructor = $c_jl_ClassCastException;
/** @constructor */
function $h_jl_ClassCastException() {
  /*<skip>*/
}
$h_jl_ClassCastException.prototype = $c_jl_ClassCastException.prototype;
$c_jl_ClassCastException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
function $is_jl_ClassCastException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ClassCastException)))
}
function $as_jl_ClassCastException(obj) {
  return (($is_jl_ClassCastException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.ClassCastException"))
}
function $isArrayOf_jl_ClassCastException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ClassCastException)))
}
function $asArrayOf_jl_ClassCastException(obj, depth) {
  return (($isArrayOf_jl_ClassCastException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.ClassCastException;", depth))
}
var $d_jl_ClassCastException = new $TypeData().initClass({
  jl_ClassCastException: 0
}, false, "java.lang.ClassCastException", {
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ClassCastException.prototype.$classData = $d_jl_ClassCastException;
/** @constructor */
function $c_jl_IllegalArgumentException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IllegalArgumentException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalArgumentException.prototype.constructor = $c_jl_IllegalArgumentException;
/** @constructor */
function $h_jl_IllegalArgumentException() {
  /*<skip>*/
}
$h_jl_IllegalArgumentException.prototype = $c_jl_IllegalArgumentException.prototype;
$c_jl_IllegalArgumentException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_jl_IllegalArgumentException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IllegalArgumentException = new $TypeData().initClass({
  jl_IllegalArgumentException: 0
}, false, "java.lang.IllegalArgumentException", {
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalArgumentException.prototype.$classData = $d_jl_IllegalArgumentException;
/** @constructor */
function $c_jl_IllegalStateException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IllegalStateException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalStateException.prototype.constructor = $c_jl_IllegalStateException;
/** @constructor */
function $h_jl_IllegalStateException() {
  /*<skip>*/
}
$h_jl_IllegalStateException.prototype = $c_jl_IllegalStateException.prototype;
$c_jl_IllegalStateException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IllegalStateException = new $TypeData().initClass({
  jl_IllegalStateException: 0
}, false, "java.lang.IllegalStateException", {
  jl_IllegalStateException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalStateException.prototype.$classData = $d_jl_IllegalStateException;
/** @constructor */
function $c_jl_IndexOutOfBoundsException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IndexOutOfBoundsException.prototype = new $h_jl_RuntimeException();
$c_jl_IndexOutOfBoundsException.prototype.constructor = $c_jl_IndexOutOfBoundsException;
/** @constructor */
function $h_jl_IndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_IndexOutOfBoundsException.prototype = $c_jl_IndexOutOfBoundsException.prototype;
$c_jl_IndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IndexOutOfBoundsException = new $TypeData().initClass({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IndexOutOfBoundsException.prototype.$classData = $d_jl_IndexOutOfBoundsException;
/** @constructor */
function $c_jl_JSConsoleBasedPrintStream$DummyOutputStream() {
  $c_Ljava_io_OutputStream.call(this)
}
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = new $h_Ljava_io_OutputStream();
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.constructor = $c_jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
function $h_jl_JSConsoleBasedPrintStream$DummyOutputStream() {
  /*<skip>*/
}
$h_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = $c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype;
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.init___ = (function() {
  return this
});
var $d_jl_JSConsoleBasedPrintStream$DummyOutputStream = new $TypeData().initClass({
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream$DummyOutputStream", {
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  jl_AutoCloseable: 1,
  Ljava_io_Flushable: 1
});
$c_jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.$classData = $d_jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
function $c_jl_NegativeArraySizeException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_NegativeArraySizeException.prototype = new $h_jl_RuntimeException();
$c_jl_NegativeArraySizeException.prototype.constructor = $c_jl_NegativeArraySizeException;
/** @constructor */
function $h_jl_NegativeArraySizeException() {
  /*<skip>*/
}
$h_jl_NegativeArraySizeException.prototype = $c_jl_NegativeArraySizeException.prototype;
$c_jl_NegativeArraySizeException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_jl_NegativeArraySizeException = new $TypeData().initClass({
  jl_NegativeArraySizeException: 0
}, false, "java.lang.NegativeArraySizeException", {
  jl_NegativeArraySizeException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NegativeArraySizeException.prototype.$classData = $d_jl_NegativeArraySizeException;
/** @constructor */
function $c_jl_NullPointerException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_NullPointerException.prototype = new $h_jl_RuntimeException();
$c_jl_NullPointerException.prototype.constructor = $c_jl_NullPointerException;
/** @constructor */
function $h_jl_NullPointerException() {
  /*<skip>*/
}
$h_jl_NullPointerException.prototype = $c_jl_NullPointerException.prototype;
$c_jl_NullPointerException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_jl_NullPointerException = new $TypeData().initClass({
  jl_NullPointerException: 0
}, false, "java.lang.NullPointerException", {
  jl_NullPointerException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NullPointerException.prototype.$classData = $d_jl_NullPointerException;
/** @constructor */
function $c_jl_UnsupportedOperationException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_UnsupportedOperationException.prototype = new $h_jl_RuntimeException();
$c_jl_UnsupportedOperationException.prototype.constructor = $c_jl_UnsupportedOperationException;
/** @constructor */
function $h_jl_UnsupportedOperationException() {
  /*<skip>*/
}
$h_jl_UnsupportedOperationException.prototype = $c_jl_UnsupportedOperationException.prototype;
$c_jl_UnsupportedOperationException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_UnsupportedOperationException = new $TypeData().initClass({
  jl_UnsupportedOperationException: 0
}, false, "java.lang.UnsupportedOperationException", {
  jl_UnsupportedOperationException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_UnsupportedOperationException.prototype.$classData = $d_jl_UnsupportedOperationException;
/** @constructor */
function $c_ju_NoSuchElementException() {
  $c_jl_RuntimeException.call(this)
}
$c_ju_NoSuchElementException.prototype = new $h_jl_RuntimeException();
$c_ju_NoSuchElementException.prototype.constructor = $c_ju_NoSuchElementException;
/** @constructor */
function $h_ju_NoSuchElementException() {
  /*<skip>*/
}
$h_ju_NoSuchElementException.prototype = $c_ju_NoSuchElementException.prototype;
$c_ju_NoSuchElementException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_ju_NoSuchElementException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_ju_NoSuchElementException = new $TypeData().initClass({
  ju_NoSuchElementException: 0
}, false, "java.util.NoSuchElementException", {
  ju_NoSuchElementException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_NoSuchElementException.prototype.$classData = $d_ju_NoSuchElementException;
/** @constructor */
function $c_s_MatchError() {
  $c_jl_RuntimeException.call(this);
  this.objString$4 = null;
  this.obj$4 = null;
  this.bitmap$0$4 = false
}
$c_s_MatchError.prototype = new $h_jl_RuntimeException();
$c_s_MatchError.prototype.constructor = $c_s_MatchError;
/** @constructor */
function $h_s_MatchError() {
  /*<skip>*/
}
$h_s_MatchError.prototype = $c_s_MatchError.prototype;
$c_s_MatchError.prototype.objString$lzycompute__p4__T = (function() {
  if ((!this.bitmap$0$4)) {
    this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
    this.bitmap$0$4 = true
  };
  return this.objString$4
});
$c_s_MatchError.prototype.ofClass$1__p4__T = (function() {
  var this$1 = this.obj$4;
  return ("of class " + $objectGetClass(this$1).getName__T())
});
$c_s_MatchError.prototype.liftedTree1$1__p4__T = (function() {
  try {
    return ((($objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return ("an instance " + this.ofClass$1__p4__T())
    } else {
      throw e
    }
  }
});
$c_s_MatchError.prototype.getMessage__T = (function() {
  return this.objString__p4__T()
});
$c_s_MatchError.prototype.objString__p4__T = (function() {
  return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
});
$c_s_MatchError.prototype.init___O = (function(obj) {
  this.obj$4 = obj;
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_s_MatchError = new $TypeData().initClass({
  s_MatchError: 0
}, false, "scala.MatchError", {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_MatchError.prototype.$classData = $d_s_MatchError;
/** @constructor */
function $c_s_Option() {
  $c_O.call(this)
}
$c_s_Option.prototype = new $h_O();
$c_s_Option.prototype.constructor = $c_s_Option;
/** @constructor */
function $h_s_Option() {
  /*<skip>*/
}
$h_s_Option.prototype = $c_s_Option.prototype;
$c_s_Option.prototype.isDefined__Z = (function() {
  return (!this.isEmpty__Z())
});
var $d_s_Option = new $TypeData().initClass({
  s_Option: 0
}, false, "scala.Option", {
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Option.prototype.$classData = $d_s_Option;
/** @constructor */
function $c_s_PartialFunction$$anon$1() {
  $c_O.call(this);
  this.lift$1 = null
}
$c_s_PartialFunction$$anon$1.prototype = new $h_O();
$c_s_PartialFunction$$anon$1.prototype.constructor = $c_s_PartialFunction$$anon$1;
/** @constructor */
function $h_s_PartialFunction$$anon$1() {
  /*<skip>*/
}
$h_s_PartialFunction$$anon$1.prototype = $c_s_PartialFunction$$anon$1.prototype;
$c_s_PartialFunction$$anon$1.prototype.init___ = (function() {
  this.lift$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$2) {
      return $m_s_None$()
    })
  })(this));
  return this
});
$c_s_PartialFunction$$anon$1.prototype.apply__O__O = (function(v1) {
  this.apply__O__sr_Nothing$(v1)
});
$c_s_PartialFunction$$anon$1.prototype.toString__T = (function() {
  return "<function1>"
});
$c_s_PartialFunction$$anon$1.prototype.apply$mcZI$sp__I__Z = (function(v1) {
  return $uZ(this.apply__O__sr_Nothing$(v1))
});
$c_s_PartialFunction$$anon$1.prototype.isDefinedAt__O__Z = (function(x) {
  return false
});
$c_s_PartialFunction$$anon$1.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return $f_s_PartialFunction__applyOrElse__O__F1__O(this, x, $default)
});
$c_s_PartialFunction$$anon$1.prototype.apply__O__sr_Nothing$ = (function(x) {
  throw new $c_s_MatchError().init___O(x)
});
var $d_s_PartialFunction$$anon$1 = new $TypeData().initClass({
  s_PartialFunction$$anon$1: 0
}, false, "scala.PartialFunction$$anon$1", {
  s_PartialFunction$$anon$1: 1,
  O: 1,
  s_PartialFunction: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_PartialFunction$$anon$1.prototype.$classData = $d_s_PartialFunction$$anon$1;
/** @constructor */
function $c_s_Predef$$anon$1() {
  $c_s_Predef$$less$colon$less.call(this)
}
$c_s_Predef$$anon$1.prototype = new $h_s_Predef$$less$colon$less();
$c_s_Predef$$anon$1.prototype.constructor = $c_s_Predef$$anon$1;
/** @constructor */
function $h_s_Predef$$anon$1() {
  /*<skip>*/
}
$h_s_Predef$$anon$1.prototype = $c_s_Predef$$anon$1.prototype;
$c_s_Predef$$anon$1.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$1.prototype.apply__O__O = (function(x) {
  return x
});
var $d_s_Predef$$anon$1 = new $TypeData().initClass({
  s_Predef$$anon$1: 0
}, false, "scala.Predef$$anon$1", {
  s_Predef$$anon$1: 1,
  s_Predef$$less$colon$less: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$1.prototype.$classData = $d_s_Predef$$anon$1;
/** @constructor */
function $c_s_Predef$$anon$2() {
  $c_s_Predef$$eq$colon$eq.call(this)
}
$c_s_Predef$$anon$2.prototype = new $h_s_Predef$$eq$colon$eq();
$c_s_Predef$$anon$2.prototype.constructor = $c_s_Predef$$anon$2;
/** @constructor */
function $h_s_Predef$$anon$2() {
  /*<skip>*/
}
$h_s_Predef$$anon$2.prototype = $c_s_Predef$$anon$2.prototype;
$c_s_Predef$$anon$2.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$2.prototype.apply__O__O = (function(x) {
  return x
});
var $d_s_Predef$$anon$2 = new $TypeData().initClass({
  s_Predef$$anon$2: 0
}, false, "scala.Predef$$anon$2", {
  s_Predef$$anon$2: 1,
  s_Predef$$eq$colon$eq: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$2.prototype.$classData = $d_s_Predef$$anon$2;
/** @constructor */
function $c_s_StringContext() {
  $c_O.call(this);
  this.parts$1 = null
}
$c_s_StringContext.prototype = new $h_O();
$c_s_StringContext.prototype.constructor = $c_s_StringContext;
/** @constructor */
function $h_s_StringContext() {
  /*<skip>*/
}
$h_s_StringContext.prototype = $c_s_StringContext.prototype;
$c_s_StringContext.prototype.productPrefix__T = (function() {
  return "StringContext"
});
$c_s_StringContext.prototype.productArity__I = (function() {
  return 1
});
$c_s_StringContext.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_StringContext(x$1)) {
    var StringContext$1 = $as_s_StringContext(x$1);
    var x = this.parts$1;
    var x$2 = StringContext$1.parts$1;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
$c_s_StringContext.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.parts$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_StringContext.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_StringContext.prototype.checkLengths__sc_Seq__V = (function(args) {
  if ((this.parts$1.length__I() !== ((1 + args.length__I()) | 0))) {
    throw new $c_jl_IllegalArgumentException().init___T((((("wrong number of arguments (" + args.length__I()) + ") for interpolated string with ") + this.parts$1.length__I()) + " parts"))
  }
});
$c_s_StringContext.prototype.s__sc_Seq__T = (function(args) {
  var f = (function($this) {
    return (function(str$2) {
      var str = $as_T(str$2);
      var this$1 = $m_s_StringContext$();
      return this$1.treatEscapes0__p1__T__Z__T(str, false)
    })
  })(this);
  this.checkLengths__sc_Seq__V(args);
  var pi = this.parts$1.iterator__sc_Iterator();
  var ai = args.iterator__sc_Iterator();
  var arg1 = pi.next__O();
  var bldr = new $c_jl_StringBuilder().init___T($as_T(f(arg1)));
  while (ai.hasNext__Z()) {
    var obj = ai.next__O();
    bldr.java$lang$StringBuilder$$content$f = (("" + bldr.java$lang$StringBuilder$$content$f) + obj);
    var arg1$1 = pi.next__O();
    var str$1 = $as_T(f(arg1$1));
    bldr.java$lang$StringBuilder$$content$f = (("" + bldr.java$lang$StringBuilder$$content$f) + str$1)
  };
  return bldr.java$lang$StringBuilder$$content$f
});
$c_s_StringContext.prototype.init___sc_Seq = (function(parts) {
  this.parts$1 = parts;
  return this
});
$c_s_StringContext.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_StringContext.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_s_StringContext(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_StringContext)))
}
function $as_s_StringContext(obj) {
  return (($is_s_StringContext(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.StringContext"))
}
function $isArrayOf_s_StringContext(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_StringContext)))
}
function $asArrayOf_s_StringContext(obj, depth) {
  return (($isArrayOf_s_StringContext(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.StringContext;", depth))
}
var $d_s_StringContext = new $TypeData().initClass({
  s_StringContext: 0
}, false, "scala.StringContext", {
  s_StringContext: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext.prototype.$classData = $d_s_StringContext;
function $f_s_reflect_ClassTag__newArray__I__O($thiz, len) {
  var x1 = $thiz.runtimeClass__jl_Class();
  return ((x1 === $d_B.getClassOf()) ? $newArrayObject($d_B.getArrayOf(), [len]) : ((x1 === $d_S.getClassOf()) ? $newArrayObject($d_S.getArrayOf(), [len]) : ((x1 === $d_C.getClassOf()) ? $newArrayObject($d_C.getArrayOf(), [len]) : ((x1 === $d_I.getClassOf()) ? $newArrayObject($d_I.getArrayOf(), [len]) : ((x1 === $d_J.getClassOf()) ? $newArrayObject($d_J.getArrayOf(), [len]) : ((x1 === $d_F.getClassOf()) ? $newArrayObject($d_F.getArrayOf(), [len]) : ((x1 === $d_D.getClassOf()) ? $newArrayObject($d_D.getArrayOf(), [len]) : ((x1 === $d_Z.getClassOf()) ? $newArrayObject($d_Z.getArrayOf(), [len]) : ((x1 === $d_V.getClassOf()) ? $newArrayObject($d_sr_BoxedUnit.getArrayOf(), [len]) : $m_jl_reflect_Array$().newInstance__jl_Class__I__O($thiz.runtimeClass__jl_Class(), len))))))))))
}
function $f_s_reflect_ClassTag__equals__O__Z($thiz, x) {
  if ($is_s_reflect_ClassTag(x)) {
    var x$2 = $thiz.runtimeClass__jl_Class();
    var x$3 = $as_s_reflect_ClassTag(x).runtimeClass__jl_Class();
    return (x$2 === x$3)
  } else {
    return false
  }
}
function $f_s_reflect_ClassTag__prettyprint$1__ps_reflect_ClassTag__jl_Class__T($thiz, clazz) {
  if (clazz.isArray__Z()) {
    var jsx$1 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Array[", "]"]));
    var clazz$1 = clazz.getComponentType__jl_Class();
    return jsx$1.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$f_s_reflect_ClassTag__prettyprint$1__ps_reflect_ClassTag__jl_Class__T($thiz, clazz$1)]))
  } else {
    return clazz.getName__T()
  }
}
function $is_s_reflect_ClassTag(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_reflect_ClassTag)))
}
function $as_s_reflect_ClassTag(obj) {
  return (($is_s_reflect_ClassTag(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.reflect.ClassTag"))
}
function $isArrayOf_s_reflect_ClassTag(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_reflect_ClassTag)))
}
function $asArrayOf_s_reflect_ClassTag(obj, depth) {
  return (($isArrayOf_s_reflect_ClassTag(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.reflect.ClassTag;", depth))
}
/** @constructor */
function $c_s_util_Try() {
  $c_O.call(this)
}
$c_s_util_Try.prototype = new $h_O();
$c_s_util_Try.prototype.constructor = $c_s_util_Try;
/** @constructor */
function $h_s_util_Try() {
  /*<skip>*/
}
$h_s_util_Try.prototype = $c_s_util_Try.prototype;
function $is_s_util_Try(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Try)))
}
function $as_s_util_Try(obj) {
  return (($is_s_util_Try(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.util.Try"))
}
function $isArrayOf_s_util_Try(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Try)))
}
function $asArrayOf_s_util_Try(obj, depth) {
  return (($isArrayOf_s_util_Try(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.util.Try;", depth))
}
/** @constructor */
function $c_s_util_control_BreakControl() {
  $c_jl_Throwable.call(this)
}
$c_s_util_control_BreakControl.prototype = new $h_jl_Throwable();
$c_s_util_control_BreakControl.prototype.constructor = $c_s_util_control_BreakControl;
/** @constructor */
function $h_s_util_control_BreakControl() {
  /*<skip>*/
}
$h_s_util_control_BreakControl.prototype = $c_s_util_control_BreakControl.prototype;
$c_s_util_control_BreakControl.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_s_util_control_BreakControl.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $f_s_util_control_NoStackTrace__fillInStackTrace__jl_Throwable(this)
});
var $d_s_util_control_BreakControl = new $TypeData().initClass({
  s_util_control_BreakControl: 0
}, false, "scala.util.control.BreakControl", {
  s_util_control_BreakControl: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_s_util_control_BreakControl.prototype.$classData = $d_s_util_control_BreakControl;
function $f_sc_GenMapLike__equals__O__Z($thiz, that) {
  if ($is_sc_GenMap(that)) {
    var x2 = $as_sc_GenMap(that);
    return (($thiz === x2) || (($thiz.size__I() === x2.size__I()) && $f_sc_GenMapLike__liftedTree1$1__psc_GenMapLike__sc_GenMap__Z($thiz, x2)))
  } else {
    return false
  }
}
function $f_sc_GenMapLike__liftedTree1$1__psc_GenMapLike__sc_GenMap__Z($thiz, x2$1) {
  try {
    var this$1 = $thiz.iterator__sc_Iterator();
    var res = true;
    while ((res && this$1.hasNext__Z())) {
      var arg1 = this$1.next__O();
      var x0$1 = $as_T2(arg1);
      if ((x0$1 === null)) {
        throw new $c_s_MatchError().init___O(x0$1)
      };
      var k = x0$1.$$und1__O();
      var v = x0$1.$$und2__O();
      var x1$2 = x2$1.get__O__s_Option(k);
      matchEnd6: {
        if ($is_s_Some(x1$2)) {
          var x2 = $as_s_Some(x1$2);
          var p3 = x2.value$2;
          if ($m_sr_BoxesRunTime$().equals__O__O__Z(v, p3)) {
            res = true;
            break matchEnd6
          }
        };
        res = false
      }
    };
    return res
  } catch (e) {
    if ($is_jl_ClassCastException(e)) {
      $as_jl_ClassCastException(e);
      return false
    } else {
      throw e
    }
  }
}
function $f_sc_GenSeqLike__equals__O__Z($thiz, that) {
  if ($is_sc_GenSeq(that)) {
    var x2 = $as_sc_GenSeq(that);
    return $thiz.sameElements__sc_GenIterable__Z(x2)
  } else {
    return false
  }
}
function $f_sc_GenSeqLike__isDefinedAt__I__Z($thiz, idx) {
  return ((idx >= 0) && (idx < $thiz.length__I()))
}
function $is_sc_GenTraversable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversable)))
}
function $as_sc_GenTraversable(obj) {
  return (($is_sc_GenTraversable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenTraversable"))
}
function $isArrayOf_sc_GenTraversable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversable)))
}
function $asArrayOf_sc_GenTraversable(obj, depth) {
  return (($isArrayOf_sc_GenTraversable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenTraversable;", depth))
}
/** @constructor */
function $c_sc_Iterable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sc_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_sc_Iterable$.prototype.constructor = $c_sc_Iterable$;
/** @constructor */
function $h_sc_Iterable$() {
  /*<skip>*/
}
$h_sc_Iterable$.prototype = $c_sc_Iterable$.prototype;
$c_sc_Iterable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sc_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Iterable$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Iterable$ = new $TypeData().initClass({
  sc_Iterable$: 0
}, false, "scala.collection.Iterable$", {
  sc_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Iterable$.prototype.$classData = $d_sc_Iterable$;
var $n_sc_Iterable$ = (void 0);
function $m_sc_Iterable$() {
  if ((!$n_sc_Iterable$)) {
    $n_sc_Iterable$ = new $c_sc_Iterable$().init___()
  };
  return $n_sc_Iterable$
}
/** @constructor */
function $c_sc_Iterator$$anon$10() {
  $c_sc_AbstractIterator.call(this);
  this.$$outer$2 = null;
  this.f$1$2 = null
}
$c_sc_Iterator$$anon$10.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$10.prototype.constructor = $c_sc_Iterator$$anon$10;
/** @constructor */
function $h_sc_Iterator$$anon$10() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$10.prototype = $c_sc_Iterator$$anon$10.prototype;
$c_sc_Iterator$$anon$10.prototype.next__O = (function() {
  return this.f$1$2.apply__O__O(this.$$outer$2.next__O())
});
$c_sc_Iterator$$anon$10.prototype.init___sc_Iterator__F1 = (function($$outer, f$1) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.f$1$2 = f$1;
  return this
});
$c_sc_Iterator$$anon$10.prototype.hasNext__Z = (function() {
  return this.$$outer$2.hasNext__Z()
});
var $d_sc_Iterator$$anon$10 = new $TypeData().initClass({
  sc_Iterator$$anon$10: 0
}, false, "scala.collection.Iterator$$anon$10", {
  sc_Iterator$$anon$10: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$10.prototype.$classData = $d_sc_Iterator$$anon$10;
/** @constructor */
function $c_sc_Iterator$$anon$2() {
  $c_sc_AbstractIterator.call(this)
}
$c_sc_Iterator$$anon$2.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$2.prototype.constructor = $c_sc_Iterator$$anon$2;
/** @constructor */
function $h_sc_Iterator$$anon$2() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$2.prototype = $c_sc_Iterator$$anon$2.prototype;
$c_sc_Iterator$$anon$2.prototype.init___ = (function() {
  return this
});
$c_sc_Iterator$$anon$2.prototype.next__O = (function() {
  this.next__sr_Nothing$()
});
$c_sc_Iterator$$anon$2.prototype.next__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next on empty iterator")
});
$c_sc_Iterator$$anon$2.prototype.hasNext__Z = (function() {
  return false
});
var $d_sc_Iterator$$anon$2 = new $TypeData().initClass({
  sc_Iterator$$anon$2: 0
}, false, "scala.collection.Iterator$$anon$2", {
  sc_Iterator$$anon$2: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$2.prototype.$classData = $d_sc_Iterator$$anon$2;
/** @constructor */
function $c_sc_LinearSeqLike$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.these$2 = null
}
$c_sc_LinearSeqLike$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sc_LinearSeqLike$$anon$1.prototype.constructor = $c_sc_LinearSeqLike$$anon$1;
/** @constructor */
function $h_sc_LinearSeqLike$$anon$1() {
  /*<skip>*/
}
$h_sc_LinearSeqLike$$anon$1.prototype = $c_sc_LinearSeqLike$$anon$1.prototype;
$c_sc_LinearSeqLike$$anon$1.prototype.init___sc_LinearSeqLike = (function($$outer) {
  this.these$2 = $$outer;
  return this
});
$c_sc_LinearSeqLike$$anon$1.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    var result = this.these$2.head__O();
    this.these$2 = $as_sc_LinearSeqLike(this.these$2.tail__O());
    return result
  } else {
    return $m_sc_Iterator$().empty$1.next__O()
  }
});
$c_sc_LinearSeqLike$$anon$1.prototype.hasNext__Z = (function() {
  return (!this.these$2.isEmpty__Z())
});
var $d_sc_LinearSeqLike$$anon$1 = new $TypeData().initClass({
  sc_LinearSeqLike$$anon$1: 0
}, false, "scala.collection.LinearSeqLike$$anon$1", {
  sc_LinearSeqLike$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_LinearSeqLike$$anon$1.prototype.$classData = $d_sc_LinearSeqLike$$anon$1;
/** @constructor */
function $c_sc_Traversable$() {
  $c_scg_GenTraversableFactory.call(this);
  this.breaks$3 = null
}
$c_sc_Traversable$.prototype = new $h_scg_GenTraversableFactory();
$c_sc_Traversable$.prototype.constructor = $c_sc_Traversable$;
/** @constructor */
function $h_sc_Traversable$() {
  /*<skip>*/
}
$h_sc_Traversable$.prototype = $c_sc_Traversable$.prototype;
$c_sc_Traversable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sc_Traversable$ = this;
  this.breaks$3 = new $c_s_util_control_Breaks().init___();
  return this
});
$c_sc_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Traversable$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Traversable$ = new $TypeData().initClass({
  sc_Traversable$: 0
}, false, "scala.collection.Traversable$", {
  sc_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Traversable$.prototype.$classData = $d_sc_Traversable$;
var $n_sc_Traversable$ = (void 0);
function $m_sc_Traversable$() {
  if ((!$n_sc_Traversable$)) {
    $n_sc_Traversable$ = new $c_sc_Traversable$().init___()
  };
  return $n_sc_Traversable$
}
/** @constructor */
function $c_scg_ImmutableSetFactory() {
  $c_scg_SetFactory.call(this)
}
$c_scg_ImmutableSetFactory.prototype = new $h_scg_SetFactory();
$c_scg_ImmutableSetFactory.prototype.constructor = $c_scg_ImmutableSetFactory;
/** @constructor */
function $h_scg_ImmutableSetFactory() {
  /*<skip>*/
}
$h_scg_ImmutableSetFactory.prototype = $c_scg_ImmutableSetFactory.prototype;
$c_scg_ImmutableSetFactory.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_SetBuilder().init___sc_Set(this.emptyInstance__sci_Set())
});
/** @constructor */
function $c_sci_Iterable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sci_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_sci_Iterable$.prototype.constructor = $c_sci_Iterable$;
/** @constructor */
function $h_sci_Iterable$() {
  /*<skip>*/
}
$h_sci_Iterable$.prototype = $c_sci_Iterable$.prototype;
$c_sci_Iterable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Iterable$ = new $TypeData().initClass({
  sci_Iterable$: 0
}, false, "scala.collection.immutable.Iterable$", {
  sci_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Iterable$.prototype.$classData = $d_sci_Iterable$;
var $n_sci_Iterable$ = (void 0);
function $m_sci_Iterable$() {
  if ((!$n_sci_Iterable$)) {
    $n_sci_Iterable$ = new $c_sci_Iterable$().init___()
  };
  return $n_sci_Iterable$
}
/** @constructor */
function $c_sci_StreamIterator() {
  $c_sc_AbstractIterator.call(this);
  this.these$2 = null
}
$c_sci_StreamIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_StreamIterator.prototype.constructor = $c_sci_StreamIterator;
/** @constructor */
function $h_sci_StreamIterator() {
  /*<skip>*/
}
$h_sci_StreamIterator.prototype = $c_sci_StreamIterator.prototype;
$c_sci_StreamIterator.prototype.next__O = (function() {
  if ($f_sc_Iterator__isEmpty__Z(this)) {
    return $m_sc_Iterator$().empty$1.next__O()
  } else {
    var cur = this.these$2.v__sci_Stream();
    var result = cur.head__O();
    this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, cur$1) {
      return (function() {
        return $as_sci_Stream(cur$1.tail__O())
      })
    })(this, cur)));
    return result
  }
});
$c_sci_StreamIterator.prototype.init___sci_Stream = (function(self) {
  this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, self$1) {
    return (function() {
      return self$1
    })
  })(this, self)));
  return this
});
$c_sci_StreamIterator.prototype.hasNext__Z = (function() {
  var this$1 = this.these$2.v__sci_Stream();
  return $f_sc_TraversableOnce__nonEmpty__Z(this$1)
});
$c_sci_StreamIterator.prototype.toStream__sci_Stream = (function() {
  var result = this.these$2.v__sci_Stream();
  this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      $m_sci_Stream$();
      return $m_sci_Stream$Empty$()
    })
  })(this)));
  return result
});
var $d_sci_StreamIterator = new $TypeData().initClass({
  sci_StreamIterator: 0
}, false, "scala.collection.immutable.StreamIterator", {
  sci_StreamIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_StreamIterator.prototype.$classData = $d_sci_StreamIterator;
/** @constructor */
function $c_sci_Traversable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sci_Traversable$.prototype = new $h_scg_GenTraversableFactory();
$c_sci_Traversable$.prototype.constructor = $c_sci_Traversable$;
/** @constructor */
function $h_sci_Traversable$() {
  /*<skip>*/
}
$h_sci_Traversable$.prototype = $c_sci_Traversable$.prototype;
$c_sci_Traversable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Traversable$ = new $TypeData().initClass({
  sci_Traversable$: 0
}, false, "scala.collection.immutable.Traversable$", {
  sci_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Traversable$.prototype.$classData = $d_sci_Traversable$;
var $n_sci_Traversable$ = (void 0);
function $m_sci_Traversable$() {
  if ((!$n_sci_Traversable$)) {
    $n_sci_Traversable$ = new $c_sci_Traversable$().init___()
  };
  return $n_sci_Traversable$
}
/** @constructor */
function $c_sci_TrieIterator() {
  $c_sc_AbstractIterator.call(this);
  this.elems$2 = null;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = null;
  this.scala$collection$immutable$TrieIterator$$posStack$f = null;
  this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null
}
$c_sci_TrieIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_TrieIterator.prototype.constructor = $c_sci_TrieIterator;
/** @constructor */
function $h_sci_TrieIterator() {
  /*<skip>*/
}
$h_sci_TrieIterator.prototype = $c_sci_TrieIterator.prototype;
$c_sci_TrieIterator.prototype.isContainer__p2__O__Z = (function(x) {
  return ($is_sci_HashMap$HashMap1(x) || $is_sci_HashSet$HashSet1(x))
});
$c_sci_TrieIterator.prototype.next__O = (function() {
  if ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null)) {
    var el = this.scala$collection$immutable$TrieIterator$$subIter$f.next__O();
    if ((!this.scala$collection$immutable$TrieIterator$$subIter$f.hasNext__Z())) {
      this.scala$collection$immutable$TrieIterator$$subIter$f = null
    };
    return el
  } else {
    return this.next0__p2__Asci_Iterable__I__O(this.scala$collection$immutable$TrieIterator$$arrayD$f, this.scala$collection$immutable$TrieIterator$$posD$f)
  }
});
$c_sci_TrieIterator.prototype.initPosStack__AI = (function() {
  return $newArrayObject($d_I.getArrayOf(), [6])
});
$c_sci_TrieIterator.prototype.hasNext__Z = (function() {
  return ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null) || (this.scala$collection$immutable$TrieIterator$$depth$f >= 0))
});
$c_sci_TrieIterator.prototype.next0__p2__Asci_Iterable__I__O = (function(elems, i) {
  _next0: while (true) {
    if ((i === (((-1) + elems.u.length) | 0))) {
      this.scala$collection$immutable$TrieIterator$$depth$f = (((-1) + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = this.scala$collection$immutable$TrieIterator$$arrayStack$f.get(this.scala$collection$immutable$TrieIterator$$depth$f);
        this.scala$collection$immutable$TrieIterator$$posD$f = this.scala$collection$immutable$TrieIterator$$posStack$f.get(this.scala$collection$immutable$TrieIterator$$depth$f);
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.set(this.scala$collection$immutable$TrieIterator$$depth$f, null)
      } else {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
        this.scala$collection$immutable$TrieIterator$$posD$f = 0
      }
    } else {
      this.scala$collection$immutable$TrieIterator$$posD$f = ((1 + this.scala$collection$immutable$TrieIterator$$posD$f) | 0)
    };
    var m = elems.get(i);
    if (this.isContainer__p2__O__Z(m)) {
      return this.getElem__O__O(m)
    } else if (this.isTrie__p2__O__Z(m)) {
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.set(this.scala$collection$immutable$TrieIterator$$depth$f, this.scala$collection$immutable$TrieIterator$$arrayD$f);
        this.scala$collection$immutable$TrieIterator$$posStack$f.set(this.scala$collection$immutable$TrieIterator$$depth$f, this.scala$collection$immutable$TrieIterator$$posD$f)
      };
      this.scala$collection$immutable$TrieIterator$$depth$f = ((1 + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      this.scala$collection$immutable$TrieIterator$$arrayD$f = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      this.scala$collection$immutable$TrieIterator$$posD$f = 0;
      var temp$elems = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      elems = temp$elems;
      i = 0;
      continue _next0
    } else {
      this.scala$collection$immutable$TrieIterator$$subIter$f = m.iterator__sc_Iterator();
      return this.next__O()
    }
  }
});
$c_sci_TrieIterator.prototype.getElems__p2__sci_Iterable__Asci_Iterable = (function(x) {
  if ($is_sci_HashMap$HashTrieMap(x)) {
    var x2 = $as_sci_HashMap$HashTrieMap(x);
    var jsx$1 = x2.elems$6
  } else {
    if ((!$is_sci_HashSet$HashTrieSet(x))) {
      throw new $c_s_MatchError().init___O(x)
    };
    var x3 = $as_sci_HashSet$HashTrieSet(x);
    var jsx$1 = x3.elems$5
  };
  return $asArrayOf_sci_Iterable(jsx$1, 1)
});
$c_sci_TrieIterator.prototype.init___Asci_Iterable = (function(elems) {
  this.elems$2 = elems;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = this.initArrayStack__AAsci_Iterable();
  this.scala$collection$immutable$TrieIterator$$posStack$f = this.initPosStack__AI();
  this.scala$collection$immutable$TrieIterator$$arrayD$f = this.elems$2;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null;
  return this
});
$c_sci_TrieIterator.prototype.isTrie__p2__O__Z = (function(x) {
  return ($is_sci_HashMap$HashTrieMap(x) || $is_sci_HashSet$HashTrieSet(x))
});
$c_sci_TrieIterator.prototype.initArrayStack__AAsci_Iterable = (function() {
  return $newArrayObject($d_sci_Iterable.getArrayOf().getArrayOf(), [6])
});
/** @constructor */
function $c_scm_Builder$$anon$1() {
  $c_O.call(this);
  this.self$1 = null;
  this.f$1$1 = null
}
$c_scm_Builder$$anon$1.prototype = new $h_O();
$c_scm_Builder$$anon$1.prototype.constructor = $c_scm_Builder$$anon$1;
/** @constructor */
function $h_scm_Builder$$anon$1() {
  /*<skip>*/
}
$h_scm_Builder$$anon$1.prototype = $c_scm_Builder$$anon$1.prototype;
$c_scm_Builder$$anon$1.prototype.init___scm_Builder__F1 = (function($$outer, f$1) {
  this.f$1$1 = f$1;
  this.self$1 = $$outer;
  return this
});
$c_scm_Builder$$anon$1.prototype.equals__O__Z = (function(that) {
  return $f_s_Proxy__equals__O__Z(this, that)
});
$c_scm_Builder$$anon$1.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
});
$c_scm_Builder$$anon$1.prototype.toString__T = (function() {
  return $f_s_Proxy__toString__T(this)
});
$c_scm_Builder$$anon$1.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1 = (function(xs) {
  this.self$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs);
  return this
});
$c_scm_Builder$$anon$1.prototype.result__O = (function() {
  return this.f$1$1.apply__O__O(this.self$1.result__O())
});
$c_scm_Builder$$anon$1.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundColl) {
  this.self$1.sizeHintBounded__I__sc_TraversableLike__V(size, boundColl)
});
$c_scm_Builder$$anon$1.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
});
$c_scm_Builder$$anon$1.prototype.$$plus$eq__O__scm_Builder$$anon$1 = (function(x) {
  this.self$1.$$plus$eq__O__scm_Builder(x);
  return this
});
$c_scm_Builder$$anon$1.prototype.hashCode__I = (function() {
  return this.self$1.hashCode__I()
});
$c_scm_Builder$$anon$1.prototype.sizeHint__I__V = (function(size) {
  this.self$1.sizeHint__I__V(size)
});
$c_scm_Builder$$anon$1.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1(xs)
});
var $d_scm_Builder$$anon$1 = new $TypeData().initClass({
  scm_Builder$$anon$1: 0
}, false, "scala.collection.mutable.Builder$$anon$1", {
  scm_Builder$$anon$1: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Proxy: 1
});
$c_scm_Builder$$anon$1.prototype.$classData = $d_scm_Builder$$anon$1;
/** @constructor */
function $c_scm_LazyBuilder() {
  $c_O.call(this);
  this.parts$1 = null
}
$c_scm_LazyBuilder.prototype = new $h_O();
$c_scm_LazyBuilder.prototype.constructor = $c_scm_LazyBuilder;
/** @constructor */
function $h_scm_LazyBuilder() {
  /*<skip>*/
}
$h_scm_LazyBuilder.prototype = $c_scm_LazyBuilder.prototype;
$c_scm_LazyBuilder.prototype.init___ = (function() {
  this.parts$1 = new $c_scm_ListBuffer().init___();
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder = (function(xs) {
  this.parts$1.$$plus$eq__O__scm_ListBuffer(xs);
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scm_LazyBuilder = (function(x) {
  var jsx$1 = this.parts$1;
  $m_sci_List$();
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([x]);
  var this$2 = $m_sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  jsx$1.$$plus$eq__O__scm_ListBuffer($as_sci_List($f_sc_TraversableLike__to__scg_CanBuildFrom__O(xs, cbf)));
  return this
});
$c_scm_LazyBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
$c_scm_LazyBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder(xs)
});
/** @constructor */
function $c_scm_ListBuffer$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.cursor$2 = null
}
$c_scm_ListBuffer$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_scm_ListBuffer$$anon$1.prototype.constructor = $c_scm_ListBuffer$$anon$1;
/** @constructor */
function $h_scm_ListBuffer$$anon$1() {
  /*<skip>*/
}
$h_scm_ListBuffer$$anon$1.prototype = $c_scm_ListBuffer$$anon$1.prototype;
$c_scm_ListBuffer$$anon$1.prototype.init___scm_ListBuffer = (function($$outer) {
  this.cursor$2 = ($$outer.isEmpty__Z() ? $m_sci_Nil$() : $$outer.scala$collection$mutable$ListBuffer$$start$6);
  return this
});
$c_scm_ListBuffer$$anon$1.prototype.next__O = (function() {
  if ((!this.hasNext__Z())) {
    throw new $c_ju_NoSuchElementException().init___T("next on empty Iterator")
  } else {
    var ans = this.cursor$2.head__O();
    var this$1 = this.cursor$2;
    this.cursor$2 = this$1.tail__sci_List();
    return ans
  }
});
$c_scm_ListBuffer$$anon$1.prototype.hasNext__Z = (function() {
  return (this.cursor$2 !== $m_sci_Nil$())
});
var $d_scm_ListBuffer$$anon$1 = new $TypeData().initClass({
  scm_ListBuffer$$anon$1: 0
}, false, "scala.collection.mutable.ListBuffer$$anon$1", {
  scm_ListBuffer$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_scm_ListBuffer$$anon$1.prototype.$classData = $d_scm_ListBuffer$$anon$1;
/** @constructor */
function $c_scm_MapBuilder() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
}
$c_scm_MapBuilder.prototype = new $h_O();
$c_scm_MapBuilder.prototype.constructor = $c_scm_MapBuilder;
/** @constructor */
function $h_scm_MapBuilder() {
  /*<skip>*/
}
$h_scm_MapBuilder.prototype = $c_scm_MapBuilder.prototype;
$c_scm_MapBuilder.prototype.$$plus$eq__T2__scm_MapBuilder = (function(x) {
  this.elems$1 = this.elems$1.$$plus__T2__sc_GenMap(x);
  return this
});
$c_scm_MapBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__T2__scm_MapBuilder($as_T2(elem))
});
$c_scm_MapBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_MapBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_MapBuilder.prototype.init___sc_GenMap = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_MapBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__T2__scm_MapBuilder($as_T2(elem))
});
$c_scm_MapBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_MapBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_MapBuilder = new $TypeData().initClass({
  scm_MapBuilder: 0
}, false, "scala.collection.mutable.MapBuilder", {
  scm_MapBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_MapBuilder.prototype.$classData = $d_scm_MapBuilder;
/** @constructor */
function $c_scm_SetBuilder() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
}
$c_scm_SetBuilder.prototype = new $h_O();
$c_scm_SetBuilder.prototype.constructor = $c_scm_SetBuilder;
/** @constructor */
function $h_scm_SetBuilder() {
  /*<skip>*/
}
$h_scm_SetBuilder.prototype = $c_scm_SetBuilder.prototype;
$c_scm_SetBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
$c_scm_SetBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_SetBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_SetBuilder.prototype.$$plus$eq__O__scm_SetBuilder = (function(x) {
  this.elems$1 = this.elems$1.$$plus__O__sc_Set(x);
  return this
});
$c_scm_SetBuilder.prototype.init___sc_Set = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_SetBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
$c_scm_SetBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_SetBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_SetBuilder = new $TypeData().initClass({
  scm_SetBuilder: 0
}, false, "scala.collection.mutable.SetBuilder", {
  scm_SetBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_SetBuilder.prototype.$classData = $d_scm_SetBuilder;
/** @constructor */
function $c_scm_WrappedArrayBuilder() {
  $c_O.call(this);
  this.tag$1 = null;
  this.manifest$1 = null;
  this.elems$1 = null;
  this.capacity$1 = 0;
  this.size$1 = 0
}
$c_scm_WrappedArrayBuilder.prototype = new $h_O();
$c_scm_WrappedArrayBuilder.prototype.constructor = $c_scm_WrappedArrayBuilder;
/** @constructor */
function $h_scm_WrappedArrayBuilder() {
  /*<skip>*/
}
$h_scm_WrappedArrayBuilder.prototype = $c_scm_WrappedArrayBuilder.prototype;
$c_scm_WrappedArrayBuilder.prototype.init___s_reflect_ClassTag = (function(tag) {
  this.tag$1 = tag;
  this.manifest$1 = tag;
  this.capacity$1 = 0;
  this.size$1 = 0;
  return this
});
$c_scm_WrappedArrayBuilder.prototype.ensureSize__p1__I__V = (function(size) {
  if ((this.capacity$1 < size)) {
    var newsize = ((this.capacity$1 === 0) ? 16 : (this.capacity$1 << 1));
    while ((newsize < size)) {
      newsize = (newsize << 1)
    };
    this.resize__p1__I__V(newsize)
  }
});
$c_scm_WrappedArrayBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_WrappedArrayBuilder(elem)
});
$c_scm_WrappedArrayBuilder.prototype.$$plus$eq__O__scm_WrappedArrayBuilder = (function(elem) {
  this.ensureSize__p1__I__V(((1 + this.size$1) | 0));
  this.elems$1.update__I__O__V(this.size$1, elem);
  this.size$1 = ((1 + this.size$1) | 0);
  return this
});
$c_scm_WrappedArrayBuilder.prototype.mkArray__p1__I__scm_WrappedArray = (function(size) {
  var runtimeClass = this.tag$1.runtimeClass__jl_Class();
  var newelems = ((runtimeClass === $d_B.getClassOf()) ? new $c_scm_WrappedArray$ofByte().init___AB($newArrayObject($d_B.getArrayOf(), [size])) : ((runtimeClass === $d_S.getClassOf()) ? new $c_scm_WrappedArray$ofShort().init___AS($newArrayObject($d_S.getArrayOf(), [size])) : ((runtimeClass === $d_C.getClassOf()) ? new $c_scm_WrappedArray$ofChar().init___AC($newArrayObject($d_C.getArrayOf(), [size])) : ((runtimeClass === $d_I.getClassOf()) ? new $c_scm_WrappedArray$ofInt().init___AI($newArrayObject($d_I.getArrayOf(), [size])) : ((runtimeClass === $d_J.getClassOf()) ? new $c_scm_WrappedArray$ofLong().init___AJ($newArrayObject($d_J.getArrayOf(), [size])) : ((runtimeClass === $d_F.getClassOf()) ? new $c_scm_WrappedArray$ofFloat().init___AF($newArrayObject($d_F.getArrayOf(), [size])) : ((runtimeClass === $d_D.getClassOf()) ? new $c_scm_WrappedArray$ofDouble().init___AD($newArrayObject($d_D.getArrayOf(), [size])) : ((runtimeClass === $d_Z.getClassOf()) ? new $c_scm_WrappedArray$ofBoolean().init___AZ($newArrayObject($d_Z.getArrayOf(), [size])) : ((runtimeClass === $d_V.getClassOf()) ? new $c_scm_WrappedArray$ofUnit().init___Asr_BoxedUnit($newArrayObject($d_sr_BoxedUnit.getArrayOf(), [size])) : new $c_scm_WrappedArray$ofRef().init___AO($asArrayOf_O(this.tag$1.newArray__I__O(size), 1)))))))))));
  if ((this.size$1 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$1.array__O(), 0, newelems.array__O(), 0, this.size$1)
  };
  return newelems
});
$c_scm_WrappedArrayBuilder.prototype.result__O = (function() {
  return this.result__scm_WrappedArray()
});
$c_scm_WrappedArrayBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_WrappedArrayBuilder.prototype.resize__p1__I__V = (function(size) {
  this.elems$1 = this.mkArray__p1__I__scm_WrappedArray(size);
  this.capacity$1 = size
});
$c_scm_WrappedArrayBuilder.prototype.result__scm_WrappedArray = (function() {
  if (((this.capacity$1 !== 0) && (this.capacity$1 === this.size$1))) {
    this.capacity$1 = 0;
    return this.elems$1
  } else {
    return this.mkArray__p1__I__scm_WrappedArray(this.size$1)
  }
});
$c_scm_WrappedArrayBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_WrappedArrayBuilder(elem)
});
$c_scm_WrappedArrayBuilder.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$1 < size)) {
    this.resize__p1__I__V(size)
  }
});
$c_scm_WrappedArrayBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_WrappedArrayBuilder = new $TypeData().initClass({
  scm_WrappedArrayBuilder: 0
}, false, "scala.collection.mutable.WrappedArrayBuilder", {
  scm_WrappedArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_WrappedArrayBuilder.prototype.$classData = $d_scm_WrappedArrayBuilder;
function $is_sr_NonLocalReturnControl(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sr_NonLocalReturnControl)))
}
function $as_sr_NonLocalReturnControl(obj) {
  return (($is_sr_NonLocalReturnControl(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.runtime.NonLocalReturnControl"))
}
function $isArrayOf_sr_NonLocalReturnControl(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_NonLocalReturnControl)))
}
function $asArrayOf_sr_NonLocalReturnControl(obj, depth) {
  return (($isArrayOf_sr_NonLocalReturnControl(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.runtime.NonLocalReturnControl;", depth))
}
/** @constructor */
function $c_sr_ScalaRunTime$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.c$2 = 0;
  this.cmax$2 = 0;
  this.x$2$2 = null
}
$c_sr_ScalaRunTime$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sr_ScalaRunTime$$anon$1.prototype.constructor = $c_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $h_sr_ScalaRunTime$$anon$1() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$$anon$1.prototype = $c_sr_ScalaRunTime$$anon$1.prototype;
$c_sr_ScalaRunTime$$anon$1.prototype.next__O = (function() {
  var result = this.x$2$2.productElement__I__O(this.c$2);
  this.c$2 = ((1 + this.c$2) | 0);
  return result
});
$c_sr_ScalaRunTime$$anon$1.prototype.init___s_Product = (function(x$2) {
  this.x$2$2 = x$2;
  this.c$2 = 0;
  this.cmax$2 = x$2.productArity__I();
  return this
});
$c_sr_ScalaRunTime$$anon$1.prototype.hasNext__Z = (function() {
  return (this.c$2 < this.cmax$2)
});
var $d_sr_ScalaRunTime$$anon$1 = new $TypeData().initClass({
  sr_ScalaRunTime$$anon$1: 0
}, false, "scala.runtime.ScalaRunTime$$anon$1", {
  sr_ScalaRunTime$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sr_ScalaRunTime$$anon$1.prototype.$classData = $d_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $c_Lenv_Environment$$anonfun$setup$1() {
  $c_sr_AbstractPartialFunction.call(this);
  this.env$1$2 = null
}
$c_Lenv_Environment$$anonfun$setup$1.prototype = new $h_sr_AbstractPartialFunction();
$c_Lenv_Environment$$anonfun$setup$1.prototype.constructor = $c_Lenv_Environment$$anonfun$setup$1;
/** @constructor */
function $h_Lenv_Environment$$anonfun$setup$1() {
  /*<skip>*/
}
$h_Lenv_Environment$$anonfun$setup$1.prototype = $c_Lenv_Environment$$anonfun$setup$1.prototype;
$c_Lenv_Environment$$anonfun$setup$1.prototype.applyOrElse__s_util_Try__F1__O = (function(x1, $default) {
  if ($is_s_util_Success(x1)) {
    var x2 = $as_s_util_Success(x1);
    var texture = x2.value$2;
    $m_Lenv_Environment$().makePlots__Lenv_Environment__Lorg_scalajs_threejs_Texture__V(this.env$1$2, texture);
    return (void 0)
  } else if ($is_s_util_Failure(x1)) {
    var x3 = $as_s_util_Failure(x1);
    var err = x3.exception$2;
    err.printStackTrace__Ljava_io_PrintStream__V($m_jl_System$().err$1);
    return (void 0)
  } else {
    return $default.apply__O__O(x1)
  }
});
$c_Lenv_Environment$$anonfun$setup$1.prototype.isDefinedAt__O__Z = (function(x) {
  return this.isDefinedAt__s_util_Try__Z($as_s_util_Try(x))
});
$c_Lenv_Environment$$anonfun$setup$1.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return this.applyOrElse__s_util_Try__F1__O($as_s_util_Try(x), $default)
});
$c_Lenv_Environment$$anonfun$setup$1.prototype.isDefinedAt__s_util_Try__Z = (function(x1) {
  return ($is_s_util_Success(x1) || $is_s_util_Failure(x1))
});
$c_Lenv_Environment$$anonfun$setup$1.prototype.init___Lenv_Environment = (function(env$1) {
  this.env$1$2 = env$1;
  return this
});
var $d_Lenv_Environment$$anonfun$setup$1 = new $TypeData().initClass({
  Lenv_Environment$$anonfun$setup$1: 0
}, false, "env.Environment$$anonfun$setup$1", {
  Lenv_Environment$$anonfun$setup$1: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Lenv_Environment$$anonfun$setup$1.prototype.$classData = $d_Lenv_Environment$$anonfun$setup$1;
var $b_Lplots_CoordinateAxes = (void 0);
function $a_Lplots_CoordinateAxes() {
  if ((!$b_Lplots_CoordinateAxes)) {
    /** @constructor */
    var $c_Lplots_CoordinateAxes = (function $c_Lplots_CoordinateAxes(arg$1, arg$2) {
      var geometry = arg$1;
      var material = arg$2;
      $g.THREE.Line.call(this, geometry, material)
    });
    /** @constructor */
    var $h_Lplots_CoordinateAxes = (function $h_Lplots_CoordinateAxes() {
      /*<skip>*/
    });
    $h_Lplots_CoordinateAxes.prototype = $g.THREE.Line.prototype;
    $c_Lplots_CoordinateAxes.prototype = new $h_Lplots_CoordinateAxes();
    $c_Lplots_CoordinateAxes.prototype.constructor = $c_Lplots_CoordinateAxes;
    $b_Lplots_CoordinateAxes = $c_Lplots_CoordinateAxes
  };
  return $b_Lplots_CoordinateAxes
}
/** @constructor */
function $c_T2() {
  $c_O.call(this);
  this.$$und1$f = null;
  this.$$und2$f = null
}
$c_T2.prototype = new $h_O();
$c_T2.prototype.constructor = $c_T2;
/** @constructor */
function $h_T2() {
  /*<skip>*/
}
$h_T2.prototype = $c_T2.prototype;
$c_T2.prototype.productPrefix__T = (function() {
  return "Tuple2"
});
$c_T2.prototype.$$und1$mcI$sp__I = (function() {
  return $uI(this.$$und1__O())
});
$c_T2.prototype.productArity__I = (function() {
  return 2
});
$c_T2.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_T2(x$1)) {
    var Tuple2$1 = $as_T2(x$1);
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und1__O(), Tuple2$1.$$und1__O()) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und2__O(), Tuple2$1.$$und2__O()))
  } else {
    return false
  }
});
$c_T2.prototype.productElement__I__O = (function(n) {
  return $f_s_Product2__productElement__I__O(this, n)
});
$c_T2.prototype.init___O__O = (function(_1, _2) {
  this.$$und1$f = _1;
  this.$$und2$f = _2;
  return this
});
$c_T2.prototype.toString__T = (function() {
  return (((("(" + this.$$und1__O()) + ",") + this.$$und2__O()) + ")")
});
$c_T2.prototype.$$und2__O = (function() {
  return this.$$und2$f
});
$c_T2.prototype.$$und2$mcI$sp__I = (function() {
  return $uI(this.$$und2__O())
});
$c_T2.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_T2.prototype.$$und1__O = (function() {
  return this.$$und1$f
});
$c_T2.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_T2(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T2)))
}
function $as_T2(obj) {
  return (($is_T2(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Tuple2"))
}
function $isArrayOf_T2(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T2)))
}
function $asArrayOf_T2(obj, depth) {
  return (($isArrayOf_T2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Tuple2;", depth))
}
var $d_T2 = new $TypeData().initClass({
  T2: 0
}, false, "scala.Tuple2", {
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_T2.prototype.$classData = $d_T2;
/** @constructor */
function $c_T3() {
  $c_O.call(this);
  this.$$und1$1 = null;
  this.$$und2$1 = null;
  this.$$und3$1 = null
}
$c_T3.prototype = new $h_O();
$c_T3.prototype.constructor = $c_T3;
/** @constructor */
function $h_T3() {
  /*<skip>*/
}
$h_T3.prototype = $c_T3.prototype;
$c_T3.prototype.productPrefix__T = (function() {
  return "Tuple3"
});
$c_T3.prototype.productArity__I = (function() {
  return 3
});
$c_T3.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_T3(x$1)) {
    var Tuple3$1 = $as_T3(x$1);
    return (($m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und1$1, Tuple3$1.$$und1$1) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und2$1, Tuple3$1.$$und2$1)) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und3$1, Tuple3$1.$$und3$1))
  } else {
    return false
  }
});
$c_T3.prototype.productElement__I__O = (function(n) {
  return $f_s_Product3__productElement__I__O(this, n)
});
$c_T3.prototype.toString__T = (function() {
  return (((((("(" + this.$$und1$1) + ",") + this.$$und2$1) + ",") + this.$$und3$1) + ")")
});
$c_T3.prototype.init___O__O__O = (function(_1, _2, _3) {
  this.$$und1$1 = _1;
  this.$$und2$1 = _2;
  this.$$und3$1 = _3;
  return this
});
$c_T3.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_T3.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_T3(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T3)))
}
function $as_T3(obj) {
  return (($is_T3(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Tuple3"))
}
function $isArrayOf_T3(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T3)))
}
function $asArrayOf_T3(obj, depth) {
  return (($isArrayOf_T3(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Tuple3;", depth))
}
var $d_T3 = new $TypeData().initClass({
  T3: 0
}, false, "scala.Tuple3", {
  T3: 1,
  O: 1,
  s_Product3: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_T3.prototype.$classData = $d_T3;
/** @constructor */
function $c_jl_ArrayIndexOutOfBoundsException() {
  $c_jl_IndexOutOfBoundsException.call(this)
}
$c_jl_ArrayIndexOutOfBoundsException.prototype = new $h_jl_IndexOutOfBoundsException();
$c_jl_ArrayIndexOutOfBoundsException.prototype.constructor = $c_jl_ArrayIndexOutOfBoundsException;
/** @constructor */
function $h_jl_ArrayIndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_ArrayIndexOutOfBoundsException.prototype = $c_jl_ArrayIndexOutOfBoundsException.prototype;
$c_jl_ArrayIndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_ArrayIndexOutOfBoundsException = new $TypeData().initClass({
  jl_ArrayIndexOutOfBoundsException: 0
}, false, "java.lang.ArrayIndexOutOfBoundsException", {
  jl_ArrayIndexOutOfBoundsException: 1,
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArrayIndexOutOfBoundsException.prototype.$classData = $d_jl_ArrayIndexOutOfBoundsException;
/** @constructor */
function $c_jl_NumberFormatException() {
  $c_jl_IllegalArgumentException.call(this)
}
$c_jl_NumberFormatException.prototype = new $h_jl_IllegalArgumentException();
$c_jl_NumberFormatException.prototype.constructor = $c_jl_NumberFormatException;
/** @constructor */
function $h_jl_NumberFormatException() {
  /*<skip>*/
}
$h_jl_NumberFormatException.prototype = $c_jl_NumberFormatException.prototype;
$c_jl_NumberFormatException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_NumberFormatException = new $TypeData().initClass({
  jl_NumberFormatException: 0
}, false, "java.lang.NumberFormatException", {
  jl_NumberFormatException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NumberFormatException.prototype.$classData = $d_jl_NumberFormatException;
/** @constructor */
function $c_s_None$() {
  $c_s_Option.call(this)
}
$c_s_None$.prototype = new $h_s_Option();
$c_s_None$.prototype.constructor = $c_s_None$;
/** @constructor */
function $h_s_None$() {
  /*<skip>*/
}
$h_s_None$.prototype = $c_s_None$.prototype;
$c_s_None$.prototype.init___ = (function() {
  return this
});
$c_s_None$.prototype.productPrefix__T = (function() {
  return "None"
});
$c_s_None$.prototype.productArity__I = (function() {
  return 0
});
$c_s_None$.prototype.isEmpty__Z = (function() {
  return true
});
$c_s_None$.prototype.get__O = (function() {
  this.get__sr_Nothing$()
});
$c_s_None$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_s_None$.prototype.toString__T = (function() {
  return "None"
});
$c_s_None$.prototype.get__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("None.get")
});
$c_s_None$.prototype.hashCode__I = (function() {
  return 2433880
});
$c_s_None$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_s_None$ = new $TypeData().initClass({
  s_None$: 0
}, false, "scala.None$", {
  s_None$: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_None$.prototype.$classData = $d_s_None$;
var $n_s_None$ = (void 0);
function $m_s_None$() {
  if ((!$n_s_None$)) {
    $n_s_None$ = new $c_s_None$().init___()
  };
  return $n_s_None$
}
/** @constructor */
function $c_s_PartialFunction$$anonfun$1() {
  $c_sr_AbstractPartialFunction.call(this)
}
$c_s_PartialFunction$$anonfun$1.prototype = new $h_sr_AbstractPartialFunction();
$c_s_PartialFunction$$anonfun$1.prototype.constructor = $c_s_PartialFunction$$anonfun$1;
/** @constructor */
function $h_s_PartialFunction$$anonfun$1() {
  /*<skip>*/
}
$h_s_PartialFunction$$anonfun$1.prototype = $c_s_PartialFunction$$anonfun$1.prototype;
$c_s_PartialFunction$$anonfun$1.prototype.init___ = (function() {
  return this
});
$c_s_PartialFunction$$anonfun$1.prototype.isDefinedAt__O__Z = (function(x1) {
  return true
});
$c_s_PartialFunction$$anonfun$1.prototype.applyOrElse__O__F1__O = (function(x1, $default) {
  return $m_s_PartialFunction$().scala$PartialFunction$$fallback$undpf$f
});
var $d_s_PartialFunction$$anonfun$1 = new $TypeData().initClass({
  s_PartialFunction$$anonfun$1: 0
}, false, "scala.PartialFunction$$anonfun$1", {
  s_PartialFunction$$anonfun$1: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_PartialFunction$$anonfun$1.prototype.$classData = $d_s_PartialFunction$$anonfun$1;
/** @constructor */
function $c_s_Some() {
  $c_s_Option.call(this);
  this.value$2 = null
}
$c_s_Some.prototype = new $h_s_Option();
$c_s_Some.prototype.constructor = $c_s_Some;
/** @constructor */
function $h_s_Some() {
  /*<skip>*/
}
$h_s_Some.prototype = $c_s_Some.prototype;
$c_s_Some.prototype.productPrefix__T = (function() {
  return "Some"
});
$c_s_Some.prototype.productArity__I = (function() {
  return 1
});
$c_s_Some.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_Some(x$1)) {
    var Some$1 = $as_s_Some(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.value$2, Some$1.value$2)
  } else {
    return false
  }
});
$c_s_Some.prototype.isEmpty__Z = (function() {
  return false
});
$c_s_Some.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.value$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_Some.prototype.get__O = (function() {
  return this.value$2
});
$c_s_Some.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_Some.prototype.init___O = (function(value) {
  this.value$2 = value;
  return this
});
$c_s_Some.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_Some.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_s_Some(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_Some)))
}
function $as_s_Some(obj) {
  return (($is_s_Some(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Some"))
}
function $isArrayOf_s_Some(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Some)))
}
function $asArrayOf_s_Some(obj, depth) {
  return (($isArrayOf_s_Some(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Some;", depth))
}
var $d_s_Some = new $TypeData().initClass({
  s_Some: 0
}, false, "scala.Some", {
  s_Some: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Some.prototype.$classData = $d_s_Some;
/** @constructor */
function $c_s_StringContext$InvalidEscapeException() {
  $c_jl_IllegalArgumentException.call(this);
  this.index$5 = 0
}
$c_s_StringContext$InvalidEscapeException.prototype = new $h_jl_IllegalArgumentException();
$c_s_StringContext$InvalidEscapeException.prototype.constructor = $c_s_StringContext$InvalidEscapeException;
/** @constructor */
function $h_s_StringContext$InvalidEscapeException() {
  /*<skip>*/
}
$h_s_StringContext$InvalidEscapeException.prototype = $c_s_StringContext$InvalidEscapeException.prototype;
$c_s_StringContext$InvalidEscapeException.prototype.init___T__I = (function(str, index) {
  this.index$5 = index;
  var jsx$3 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["invalid escape ", " index ", " in \"", "\". Use \\\\\\\\ for literal \\\\."]));
  $m_s_Predef$().require__Z__V(((index >= 0) && (index < $uI(str.length))));
  if ((index === (((-1) + $uI(str.length)) | 0))) {
    var jsx$1 = "at terminal"
  } else {
    var jsx$2 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["'\\\\", "' not one of ", " at"]));
    var index$1 = ((1 + index) | 0);
    var c = (65535 & $uI(str.charCodeAt(index$1)));
    var jsx$1 = jsx$2.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_jl_Character().init___C(c), "[\\b, \\t, \\n, \\f, \\r, \\\\, \\\", \\']"]))
  };
  var s = jsx$3.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$1, index, str]));
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_s_StringContext$InvalidEscapeException = new $TypeData().initClass({
  s_StringContext$InvalidEscapeException: 0
}, false, "scala.StringContext$InvalidEscapeException", {
  s_StringContext$InvalidEscapeException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext$InvalidEscapeException.prototype.$classData = $d_s_StringContext$InvalidEscapeException;
/** @constructor */
function $c_s_concurrent_impl_Promise$KeptPromise$Failed() {
  $c_O.call(this);
  this.result$1 = null
}
$c_s_concurrent_impl_Promise$KeptPromise$Failed.prototype = new $h_O();
$c_s_concurrent_impl_Promise$KeptPromise$Failed.prototype.constructor = $c_s_concurrent_impl_Promise$KeptPromise$Failed;
/** @constructor */
function $h_s_concurrent_impl_Promise$KeptPromise$Failed() {
  /*<skip>*/
}
$h_s_concurrent_impl_Promise$KeptPromise$Failed.prototype = $c_s_concurrent_impl_Promise$KeptPromise$Failed.prototype;
$c_s_concurrent_impl_Promise$KeptPromise$Failed.prototype.init___s_util_Failure = (function(result) {
  this.result$1 = result;
  return this
});
$c_s_concurrent_impl_Promise$KeptPromise$Failed.prototype.tryComplete__s_util_Try__Z = (function(value) {
  return false
});
$c_s_concurrent_impl_Promise$KeptPromise$Failed.prototype.toString__T = (function() {
  return $f_s_concurrent_impl_Promise__toString__T(this)
});
$c_s_concurrent_impl_Promise$KeptPromise$Failed.prototype.onComplete__F1__s_concurrent_ExecutionContext__V = (function(func, executor) {
  $f_s_concurrent_impl_Promise$KeptPromise$Kept__onComplete__F1__s_concurrent_ExecutionContext__V(this, func, executor)
});
$c_s_concurrent_impl_Promise$KeptPromise$Failed.prototype.value__s_Option = (function() {
  return new $c_s_Some().init___O(this.result$1)
});
$c_s_concurrent_impl_Promise$KeptPromise$Failed.prototype.map__F1__s_concurrent_ExecutionContext__s_concurrent_Future = (function(f, executor) {
  return this
});
$c_s_concurrent_impl_Promise$KeptPromise$Failed.prototype.result__s_util_Try = (function() {
  return this.result$1
});
var $d_s_concurrent_impl_Promise$KeptPromise$Failed = new $TypeData().initClass({
  s_concurrent_impl_Promise$KeptPromise$Failed: 0
}, false, "scala.concurrent.impl.Promise$KeptPromise$Failed", {
  s_concurrent_impl_Promise$KeptPromise$Failed: 1,
  O: 1,
  s_concurrent_impl_Promise$KeptPromise$Kept: 1,
  s_concurrent_impl_Promise: 1,
  s_concurrent_Promise: 1,
  s_concurrent_Future: 1,
  s_concurrent_Awaitable: 1
});
$c_s_concurrent_impl_Promise$KeptPromise$Failed.prototype.$classData = $d_s_concurrent_impl_Promise$KeptPromise$Failed;
/** @constructor */
function $c_s_concurrent_impl_Promise$KeptPromise$Successful() {
  $c_O.call(this);
  this.result$1 = null
}
$c_s_concurrent_impl_Promise$KeptPromise$Successful.prototype = new $h_O();
$c_s_concurrent_impl_Promise$KeptPromise$Successful.prototype.constructor = $c_s_concurrent_impl_Promise$KeptPromise$Successful;
/** @constructor */
function $h_s_concurrent_impl_Promise$KeptPromise$Successful() {
  /*<skip>*/
}
$h_s_concurrent_impl_Promise$KeptPromise$Successful.prototype = $c_s_concurrent_impl_Promise$KeptPromise$Successful.prototype;
$c_s_concurrent_impl_Promise$KeptPromise$Successful.prototype.tryComplete__s_util_Try__Z = (function(value) {
  return false
});
$c_s_concurrent_impl_Promise$KeptPromise$Successful.prototype.toString__T = (function() {
  return $f_s_concurrent_impl_Promise__toString__T(this)
});
$c_s_concurrent_impl_Promise$KeptPromise$Successful.prototype.init___s_util_Success = (function(result) {
  this.result$1 = result;
  return this
});
$c_s_concurrent_impl_Promise$KeptPromise$Successful.prototype.onComplete__F1__s_concurrent_ExecutionContext__V = (function(func, executor) {
  $f_s_concurrent_impl_Promise$KeptPromise$Kept__onComplete__F1__s_concurrent_ExecutionContext__V(this, func, executor)
});
$c_s_concurrent_impl_Promise$KeptPromise$Successful.prototype.value__s_Option = (function() {
  return new $c_s_Some().init___O(this.result$1)
});
$c_s_concurrent_impl_Promise$KeptPromise$Successful.prototype.map__F1__s_concurrent_ExecutionContext__s_concurrent_Future = (function(f, executor) {
  return $f_s_concurrent_Future__map__F1__s_concurrent_ExecutionContext__s_concurrent_Future(this, f, executor)
});
$c_s_concurrent_impl_Promise$KeptPromise$Successful.prototype.result__s_util_Try = (function() {
  return this.result$1
});
var $d_s_concurrent_impl_Promise$KeptPromise$Successful = new $TypeData().initClass({
  s_concurrent_impl_Promise$KeptPromise$Successful: 0
}, false, "scala.concurrent.impl.Promise$KeptPromise$Successful", {
  s_concurrent_impl_Promise$KeptPromise$Successful: 1,
  O: 1,
  s_concurrent_impl_Promise$KeptPromise$Kept: 1,
  s_concurrent_impl_Promise: 1,
  s_concurrent_Promise: 1,
  s_concurrent_Future: 1,
  s_concurrent_Awaitable: 1
});
$c_s_concurrent_impl_Promise$KeptPromise$Successful.prototype.$classData = $d_s_concurrent_impl_Promise$KeptPromise$Successful;
/** @constructor */
function $c_s_util_Failure() {
  $c_s_util_Try.call(this);
  this.exception$2 = null
}
$c_s_util_Failure.prototype = new $h_s_util_Try();
$c_s_util_Failure.prototype.constructor = $c_s_util_Failure;
/** @constructor */
function $h_s_util_Failure() {
  /*<skip>*/
}
$h_s_util_Failure.prototype = $c_s_util_Failure.prototype;
$c_s_util_Failure.prototype.productPrefix__T = (function() {
  return "Failure"
});
$c_s_util_Failure.prototype.productArity__I = (function() {
  return 1
});
$c_s_util_Failure.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_util_Failure(x$1)) {
    var Failure$1 = $as_s_util_Failure(x$1);
    var x = this.exception$2;
    var x$2 = Failure$1.exception$2;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
$c_s_util_Failure.prototype.map__F1__s_util_Try = (function(f) {
  return this
});
$c_s_util_Failure.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.exception$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_util_Failure.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_util_Failure.prototype.init___jl_Throwable = (function(exception) {
  this.exception$2 = exception;
  return this
});
$c_s_util_Failure.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_util_Failure.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_s_util_Failure(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Failure)))
}
function $as_s_util_Failure(obj) {
  return (($is_s_util_Failure(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.util.Failure"))
}
function $isArrayOf_s_util_Failure(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Failure)))
}
function $asArrayOf_s_util_Failure(obj, depth) {
  return (($isArrayOf_s_util_Failure(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.util.Failure;", depth))
}
var $d_s_util_Failure = new $TypeData().initClass({
  s_util_Failure: 0
}, false, "scala.util.Failure", {
  s_util_Failure: 1,
  s_util_Try: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Failure.prototype.$classData = $d_s_util_Failure;
/** @constructor */
function $c_s_util_Success() {
  $c_s_util_Try.call(this);
  this.value$2 = null
}
$c_s_util_Success.prototype = new $h_s_util_Try();
$c_s_util_Success.prototype.constructor = $c_s_util_Success;
/** @constructor */
function $h_s_util_Success() {
  /*<skip>*/
}
$h_s_util_Success.prototype = $c_s_util_Success.prototype;
$c_s_util_Success.prototype.productPrefix__T = (function() {
  return "Success"
});
$c_s_util_Success.prototype.productArity__I = (function() {
  return 1
});
$c_s_util_Success.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_util_Success(x$1)) {
    var Success$1 = $as_s_util_Success(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.value$2, Success$1.value$2)
  } else {
    return false
  }
});
$c_s_util_Success.prototype.map__F1__s_util_Try = (function(f) {
  try {
    return new $c_s_util_Success().init___O(f.apply__O__O(this.value$2))
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      var o11 = $m_s_util_control_NonFatal$().unapply__jl_Throwable__s_Option(e$2);
      if ((!o11.isEmpty__Z())) {
        var e$3 = $as_jl_Throwable(o11.get__O());
        return new $c_s_util_Failure().init___jl_Throwable(e$3)
      };
      throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
    } else {
      throw e
    }
  }
});
$c_s_util_Success.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.value$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_util_Success.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_util_Success.prototype.init___O = (function(value) {
  this.value$2 = value;
  return this
});
$c_s_util_Success.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_util_Success.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_s_util_Success(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Success)))
}
function $as_s_util_Success(obj) {
  return (($is_s_util_Success(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.util.Success"))
}
function $isArrayOf_s_util_Success(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Success)))
}
function $asArrayOf_s_util_Success(obj, depth) {
  return (($isArrayOf_s_util_Success(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.util.Success;", depth))
}
var $d_s_util_Success = new $TypeData().initClass({
  s_util_Success: 0
}, false, "scala.util.Success", {
  s_util_Success: 1,
  s_util_Try: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Success.prototype.$classData = $d_s_util_Success;
function $f_sc_GenSetLike__equals__O__Z($thiz, that) {
  if ($is_sc_GenSet(that)) {
    var x2 = $as_sc_GenSet(that);
    return (($thiz === x2) || (($thiz.size__I() === x2.size__I()) && $f_sc_GenSetLike__liftedTree1$1__psc_GenSetLike__sc_GenSet__Z($thiz, x2)))
  } else {
    return false
  }
}
function $f_sc_GenSetLike__liftedTree1$1__psc_GenSetLike__sc_GenSet__Z($thiz, x2$1) {
  try {
    return $thiz.subsetOf__sc_GenSet__Z(x2$1)
  } catch (e) {
    if ($is_jl_ClassCastException(e)) {
      $as_jl_ClassCastException(e);
      return false
    } else {
      throw e
    }
  }
}
function $f_sc_TraversableLike__flatMap__F1__scg_CanBuildFrom__O($thiz, f, bf) {
  var b = bf.apply__O__scm_Builder($thiz.repr__O());
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, f$1, b$1) {
    return (function(x$2) {
      return $as_scm_Builder(b$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($as_sc_GenTraversableOnce(f$1.apply__O__O(x$2)).seq__sc_TraversableOnce()))
    })
  })($thiz, f, b)));
  return b.result__O()
}
function $f_sc_TraversableLike__to__scg_CanBuildFrom__O($thiz, cbf) {
  var b = cbf.apply__scm_Builder();
  $f_scm_Builder__sizeHint__sc_TraversableLike__V(b, $thiz);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.thisCollection__sc_Traversable());
  return b.result__O()
}
function $f_sc_TraversableLike__isPartLikelySynthetic$1__psc_TraversableLike__T__I__Z($thiz, fqn$1, partStart$1) {
  var firstChar = (65535 & $uI(fqn$1.charCodeAt(partStart$1)));
  return (((firstChar > 90) && (firstChar < 127)) || (firstChar < 65))
}
function $f_sc_TraversableLike__toString__T($thiz) {
  return $thiz.mkString__T__T__T__T(($thiz.stringPrefix__T() + "("), ", ", ")")
}
function $f_sc_TraversableLike__map__F1__scg_CanBuildFrom__O($thiz, f, bf) {
  var b = $f_sc_TraversableLike__builder$1__psc_TraversableLike__scg_CanBuildFrom__scm_Builder($thiz, bf);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, f$1, b$1) {
    return (function(x$2) {
      return b$1.$$plus$eq__O__scm_Builder(f$1.apply__O__O(x$2))
    })
  })($thiz, f, b)));
  return b.result__O()
}
function $f_sc_TraversableLike__builder$1__psc_TraversableLike__scg_CanBuildFrom__scm_Builder($thiz, bf$1) {
  var b = bf$1.apply__O__scm_Builder($thiz.repr__O());
  $f_scm_Builder__sizeHint__sc_TraversableLike__V(b, $thiz);
  return b
}
function $f_sc_TraversableLike__stringPrefix__T($thiz) {
  var this$1 = $thiz.repr__O();
  var fqn = $objectGetClass(this$1).getName__T();
  var pos = (((-1) + $uI(fqn.length)) | 0);
  while (true) {
    if ((pos !== (-1))) {
      var index = pos;
      var jsx$1 = ((65535 & $uI(fqn.charCodeAt(index))) === 36)
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      pos = (((-1) + pos) | 0)
    } else {
      break
    }
  };
  if ((pos === (-1))) {
    var jsx$2 = true
  } else {
    var index$1 = pos;
    var jsx$2 = ((65535 & $uI(fqn.charCodeAt(index$1))) === 46)
  };
  if (jsx$2) {
    return ""
  };
  var result = "";
  while (true) {
    var partEnd = ((1 + pos) | 0);
    while (true) {
      if ((pos !== (-1))) {
        var index$2 = pos;
        var jsx$4 = ((65535 & $uI(fqn.charCodeAt(index$2))) <= 57)
      } else {
        var jsx$4 = false
      };
      if (jsx$4) {
        var index$3 = pos;
        var jsx$3 = ((65535 & $uI(fqn.charCodeAt(index$3))) >= 48)
      } else {
        var jsx$3 = false
      };
      if (jsx$3) {
        pos = (((-1) + pos) | 0)
      } else {
        break
      }
    };
    var lastNonDigit = pos;
    while (true) {
      if ((pos !== (-1))) {
        var index$4 = pos;
        var jsx$6 = ((65535 & $uI(fqn.charCodeAt(index$4))) !== 36)
      } else {
        var jsx$6 = false
      };
      if (jsx$6) {
        var index$5 = pos;
        var jsx$5 = ((65535 & $uI(fqn.charCodeAt(index$5))) !== 46)
      } else {
        var jsx$5 = false
      };
      if (jsx$5) {
        pos = (((-1) + pos) | 0)
      } else {
        break
      }
    };
    var partStart = ((1 + pos) | 0);
    if (((pos === lastNonDigit) && (partEnd !== $uI(fqn.length)))) {
      return result
    };
    while (true) {
      if ((pos !== (-1))) {
        var index$6 = pos;
        var jsx$7 = ((65535 & $uI(fqn.charCodeAt(index$6))) === 36)
      } else {
        var jsx$7 = false
      };
      if (jsx$7) {
        pos = (((-1) + pos) | 0)
      } else {
        break
      }
    };
    if ((pos === (-1))) {
      var atEnd = true
    } else {
      var index$7 = pos;
      var atEnd = ((65535 & $uI(fqn.charCodeAt(index$7))) === 46)
    };
    if ((atEnd || (!$f_sc_TraversableLike__isPartLikelySynthetic$1__psc_TraversableLike__T__I__Z($thiz, fqn, partStart)))) {
      var part = $as_T(fqn.substring(partStart, partEnd));
      var thiz = result;
      if ((thiz === null)) {
        throw new $c_jl_NullPointerException().init___()
      };
      if ((thiz === "")) {
        result = part
      } else {
        result = ((("" + part) + new $c_jl_Character().init___C(46)) + result)
      };
      if (atEnd) {
        return result
      }
    }
  }
}
/** @constructor */
function $c_scg_SeqFactory() {
  $c_scg_GenSeqFactory.call(this)
}
$c_scg_SeqFactory.prototype = new $h_scg_GenSeqFactory();
$c_scg_SeqFactory.prototype.constructor = $c_scg_SeqFactory;
/** @constructor */
function $h_scg_SeqFactory() {
  /*<skip>*/
}
$h_scg_SeqFactory.prototype = $c_scg_SeqFactory.prototype;
/** @constructor */
function $c_sci_HashMap$HashTrieMap$$anon$1() {
  $c_sci_TrieIterator.call(this)
}
$c_sci_HashMap$HashTrieMap$$anon$1.prototype = new $h_sci_TrieIterator();
$c_sci_HashMap$HashTrieMap$$anon$1.prototype.constructor = $c_sci_HashMap$HashTrieMap$$anon$1;
/** @constructor */
function $h_sci_HashMap$HashTrieMap$$anon$1() {
  /*<skip>*/
}
$h_sci_HashMap$HashTrieMap$$anon$1.prototype = $c_sci_HashMap$HashTrieMap$$anon$1.prototype;
$c_sci_HashMap$HashTrieMap$$anon$1.prototype.init___sci_HashMap$HashTrieMap = (function($$outer) {
  $c_sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$6);
  return this
});
$c_sci_HashMap$HashTrieMap$$anon$1.prototype.getElem__O__O = (function(x) {
  return $as_sci_HashMap$HashMap1(x).ensurePair__T2()
});
var $d_sci_HashMap$HashTrieMap$$anon$1 = new $TypeData().initClass({
  sci_HashMap$HashTrieMap$$anon$1: 0
}, false, "scala.collection.immutable.HashMap$HashTrieMap$$anon$1", {
  sci_HashMap$HashTrieMap$$anon$1: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_HashMap$HashTrieMap$$anon$1.prototype.$classData = $d_sci_HashMap$HashTrieMap$$anon$1;
/** @constructor */
function $c_sci_HashSet$HashTrieSet$$anon$1() {
  $c_sci_TrieIterator.call(this)
}
$c_sci_HashSet$HashTrieSet$$anon$1.prototype = new $h_sci_TrieIterator();
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.constructor = $c_sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
function $h_sci_HashSet$HashTrieSet$$anon$1() {
  /*<skip>*/
}
$h_sci_HashSet$HashTrieSet$$anon$1.prototype = $c_sci_HashSet$HashTrieSet$$anon$1.prototype;
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.init___sci_HashSet$HashTrieSet = (function($$outer) {
  $c_sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$5);
  return this
});
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.getElem__O__O = (function(cc) {
  return $as_sci_HashSet$HashSet1(cc).key$6
});
var $d_sci_HashSet$HashTrieSet$$anon$1 = new $TypeData().initClass({
  sci_HashSet$HashTrieSet$$anon$1: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet$$anon$1", {
  sci_HashSet$HashTrieSet$$anon$1: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.$classData = $d_sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
function $c_sci_Set$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_Set$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_Set$.prototype.constructor = $c_sci_Set$;
/** @constructor */
function $h_sci_Set$() {
  /*<skip>*/
}
$h_sci_Set$.prototype = $c_sci_Set$.prototype;
$c_sci_Set$.prototype.init___ = (function() {
  return this
});
$c_sci_Set$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
var $d_sci_Set$ = new $TypeData().initClass({
  sci_Set$: 0
}, false, "scala.collection.immutable.Set$", {
  sci_Set$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Set$.prototype.$classData = $d_sci_Set$;
var $n_sci_Set$ = (void 0);
function $m_sci_Set$() {
  if ((!$n_sci_Set$)) {
    $n_sci_Set$ = new $c_sci_Set$().init___()
  };
  return $n_sci_Set$
}
/** @constructor */
function $c_sci_Stream$StreamBuilder() {
  $c_scm_LazyBuilder.call(this)
}
$c_sci_Stream$StreamBuilder.prototype = new $h_scm_LazyBuilder();
$c_sci_Stream$StreamBuilder.prototype.constructor = $c_sci_Stream$StreamBuilder;
/** @constructor */
function $h_sci_Stream$StreamBuilder() {
  /*<skip>*/
}
$h_sci_Stream$StreamBuilder.prototype = $c_sci_Stream$StreamBuilder.prototype;
$c_sci_Stream$StreamBuilder.prototype.init___ = (function() {
  $c_scm_LazyBuilder.prototype.init___.call(this);
  return this
});
$c_sci_Stream$StreamBuilder.prototype.result__O = (function() {
  return this.result__sci_Stream()
});
$c_sci_Stream$StreamBuilder.prototype.result__sci_Stream = (function() {
  var this$1 = this.parts$1;
  return $as_sci_Stream(this$1.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream().flatMap__F1__scg_CanBuildFrom__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$5$2) {
      var x$5 = $as_sc_TraversableOnce(x$5$2);
      return x$5.toStream__sci_Stream()
    })
  })(this)), ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___())))
});
function $is_sci_Stream$StreamBuilder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$StreamBuilder)))
}
function $as_sci_Stream$StreamBuilder(obj) {
  return (($is_sci_Stream$StreamBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream$StreamBuilder"))
}
function $isArrayOf_sci_Stream$StreamBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$StreamBuilder)))
}
function $asArrayOf_sci_Stream$StreamBuilder(obj, depth) {
  return (($isArrayOf_sci_Stream$StreamBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream$StreamBuilder;", depth))
}
var $d_sci_Stream$StreamBuilder = new $TypeData().initClass({
  sci_Stream$StreamBuilder: 0
}, false, "scala.collection.immutable.Stream$StreamBuilder", {
  sci_Stream$StreamBuilder: 1,
  scm_LazyBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_sci_Stream$StreamBuilder.prototype.$classData = $d_sci_Stream$StreamBuilder;
/** @constructor */
function $c_sci_VectorBuilder() {
  $c_O.call(this);
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  this.depth$1 = 0;
  this.display0$1 = null;
  this.display1$1 = null;
  this.display2$1 = null;
  this.display3$1 = null;
  this.display4$1 = null;
  this.display5$1 = null
}
$c_sci_VectorBuilder.prototype = new $h_O();
$c_sci_VectorBuilder.prototype.constructor = $c_sci_VectorBuilder;
/** @constructor */
function $h_sci_VectorBuilder() {
  /*<skip>*/
}
$h_sci_VectorBuilder.prototype = $c_sci_VectorBuilder.prototype;
$c_sci_VectorBuilder.prototype.display3__AO = (function() {
  return this.display3$1
});
$c_sci_VectorBuilder.prototype.init___ = (function() {
  this.display0$1 = $newArrayObject($d_O.getArrayOf(), [32]);
  this.depth$1 = 1;
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  return this
});
$c_sci_VectorBuilder.prototype.depth__I = (function() {
  return this.depth$1
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$1 = x$1
});
$c_sci_VectorBuilder.prototype.display0__AO = (function() {
  return this.display0$1
});
$c_sci_VectorBuilder.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$1 = x$1
});
$c_sci_VectorBuilder.prototype.display4__AO = (function() {
  return this.display4$1
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__sci_VectorBuilder = (function(elem) {
  if ((this.lo$1 >= this.display0$1.u.length)) {
    var newBlockIndex = ((32 + this.blockIndex$1) | 0);
    var xor = (this.blockIndex$1 ^ newBlockIndex);
    $f_sci_VectorPointer__gotoNextBlockStartWritable__I__I__V(this, newBlockIndex, xor);
    this.blockIndex$1 = newBlockIndex;
    this.lo$1 = 0
  };
  this.display0$1.set(this.lo$1, elem);
  this.lo$1 = ((1 + this.lo$1) | 0);
  return this
});
$c_sci_VectorBuilder.prototype.result__O = (function() {
  return this.result__sci_Vector()
});
$c_sci_VectorBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_sci_VectorBuilder.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$1 = x$1
});
$c_sci_VectorBuilder.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$1 = x$1
});
$c_sci_VectorBuilder.prototype.display1__AO = (function() {
  return this.display1$1
});
$c_sci_VectorBuilder.prototype.display5__AO = (function() {
  return this.display5$1
});
$c_sci_VectorBuilder.prototype.result__sci_Vector = (function() {
  var size = ((this.blockIndex$1 + this.lo$1) | 0);
  if ((size === 0)) {
    var this$1 = $m_sci_Vector$();
    return this$1.NIL$6
  };
  var s = new $c_sci_Vector().init___I__I__I(0, size, 0);
  var depth = this.depth$1;
  $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
  if ((this.depth$1 > 1)) {
    var xor = (((-1) + size) | 0);
    $f_sci_VectorPointer__gotoPos__I__I__V(s, 0, xor)
  };
  return s
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sci_VectorBuilder.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$1 = x$1
});
$c_sci_VectorBuilder.prototype.display2__AO = (function() {
  return this.display2$1
});
$c_sci_VectorBuilder.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$1 = x$1
});
$c_sci_VectorBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $as_sci_VectorBuilder($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
});
$c_sci_VectorBuilder.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$1 = x$1
});
function $is_sci_VectorBuilder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_VectorBuilder)))
}
function $as_sci_VectorBuilder(obj) {
  return (($is_sci_VectorBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.VectorBuilder"))
}
function $isArrayOf_sci_VectorBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_VectorBuilder)))
}
function $asArrayOf_sci_VectorBuilder(obj, depth) {
  return (($isArrayOf_sci_VectorBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.VectorBuilder;", depth))
}
var $d_sci_VectorBuilder = new $TypeData().initClass({
  sci_VectorBuilder: 0
}, false, "scala.collection.immutable.VectorBuilder", {
  sci_VectorBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorBuilder.prototype.$classData = $d_sci_VectorBuilder;
/** @constructor */
function $c_sci_VectorIterator() {
  $c_sc_AbstractIterator.call(this);
  this.endIndex$2 = 0;
  this.blockIndex$2 = 0;
  this.lo$2 = 0;
  this.endLo$2 = 0;
  this.$$undhasNext$2 = false;
  this.depth$2 = 0;
  this.display0$2 = null;
  this.display1$2 = null;
  this.display2$2 = null;
  this.display3$2 = null;
  this.display4$2 = null;
  this.display5$2 = null
}
$c_sci_VectorIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_VectorIterator.prototype.constructor = $c_sci_VectorIterator;
/** @constructor */
function $h_sci_VectorIterator() {
  /*<skip>*/
}
$h_sci_VectorIterator.prototype = $c_sci_VectorIterator.prototype;
$c_sci_VectorIterator.prototype.next__O = (function() {
  if ((!this.$$undhasNext$2)) {
    throw new $c_ju_NoSuchElementException().init___T("reached iterator end")
  };
  var res = this.display0$2.get(this.lo$2);
  this.lo$2 = ((1 + this.lo$2) | 0);
  if ((this.lo$2 === this.endLo$2)) {
    if ((((this.blockIndex$2 + this.lo$2) | 0) < this.endIndex$2)) {
      var newBlockIndex = ((32 + this.blockIndex$2) | 0);
      var xor = (this.blockIndex$2 ^ newBlockIndex);
      $f_sci_VectorPointer__gotoNextBlockStart__I__I__V(this, newBlockIndex, xor);
      this.blockIndex$2 = newBlockIndex;
      var x = ((this.endIndex$2 - this.blockIndex$2) | 0);
      this.endLo$2 = ((x < 32) ? x : 32);
      this.lo$2 = 0
    } else {
      this.$$undhasNext$2 = false
    }
  };
  return res
});
$c_sci_VectorIterator.prototype.display3__AO = (function() {
  return this.display3$2
});
$c_sci_VectorIterator.prototype.depth__I = (function() {
  return this.depth$2
});
$c_sci_VectorIterator.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$2 = x$1
});
$c_sci_VectorIterator.prototype.init___I__I = (function(_startIndex, endIndex) {
  this.endIndex$2 = endIndex;
  this.blockIndex$2 = ((-32) & _startIndex);
  this.lo$2 = (31 & _startIndex);
  var x = ((endIndex - this.blockIndex$2) | 0);
  this.endLo$2 = ((x < 32) ? x : 32);
  this.$$undhasNext$2 = (((this.blockIndex$2 + this.lo$2) | 0) < endIndex);
  return this
});
$c_sci_VectorIterator.prototype.display0__AO = (function() {
  return this.display0$2
});
$c_sci_VectorIterator.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$2 = x$1
});
$c_sci_VectorIterator.prototype.display4__AO = (function() {
  return this.display4$2
});
$c_sci_VectorIterator.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$2 = x$1
});
$c_sci_VectorIterator.prototype.hasNext__Z = (function() {
  return this.$$undhasNext$2
});
$c_sci_VectorIterator.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$2 = x$1
});
$c_sci_VectorIterator.prototype.display1__AO = (function() {
  return this.display1$2
});
$c_sci_VectorIterator.prototype.display5__AO = (function() {
  return this.display5$2
});
$c_sci_VectorIterator.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$2 = x$1
});
$c_sci_VectorIterator.prototype.display2__AO = (function() {
  return this.display2$2
});
$c_sci_VectorIterator.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$2 = x$1
});
$c_sci_VectorIterator.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$2 = x$1
});
var $d_sci_VectorIterator = new $TypeData().initClass({
  sci_VectorIterator: 0
}, false, "scala.collection.immutable.VectorIterator", {
  sci_VectorIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorIterator.prototype.$classData = $d_sci_VectorIterator;
/** @constructor */
function $c_sjsr_UndefinedBehaviorError() {
  $c_jl_Error.call(this)
}
$c_sjsr_UndefinedBehaviorError.prototype = new $h_jl_Error();
$c_sjsr_UndefinedBehaviorError.prototype.constructor = $c_sjsr_UndefinedBehaviorError;
/** @constructor */
function $h_sjsr_UndefinedBehaviorError() {
  /*<skip>*/
}
$h_sjsr_UndefinedBehaviorError.prototype = $c_sjsr_UndefinedBehaviorError.prototype;
$c_sjsr_UndefinedBehaviorError.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
$c_sjsr_UndefinedBehaviorError.prototype.init___jl_Throwable = (function(cause) {
  $c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable.call(this, ("An undefined behavior was detected" + ((cause === null) ? "" : (": " + cause.getMessage__T()))), cause);
  return this
});
$c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable = (function(message, cause) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, message, cause);
  return this
});
var $d_sjsr_UndefinedBehaviorError = new $TypeData().initClass({
  sjsr_UndefinedBehaviorError: 0
}, false, "scala.scalajs.runtime.UndefinedBehaviorError", {
  sjsr_UndefinedBehaviorError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_sjsr_UndefinedBehaviorError.prototype.$classData = $d_sjsr_UndefinedBehaviorError;
/** @constructor */
function $c_Ljava_io_PrintStream() {
  $c_Ljava_io_FilterOutputStream.call(this);
  this.encoder$3 = null;
  this.autoFlush$3 = false;
  this.charset$3 = null;
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  this.bitmap$0$3 = false
}
$c_Ljava_io_PrintStream.prototype = new $h_Ljava_io_FilterOutputStream();
$c_Ljava_io_PrintStream.prototype.constructor = $c_Ljava_io_PrintStream;
/** @constructor */
function $h_Ljava_io_PrintStream() {
  /*<skip>*/
}
$h_Ljava_io_PrintStream.prototype = $c_Ljava_io_PrintStream.prototype;
$c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset = (function(_out, autoFlush, charset) {
  this.autoFlush$3 = autoFlush;
  this.charset$3 = charset;
  $c_Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream.call(this, _out);
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  return this
});
$c_Ljava_io_PrintStream.prototype.println__T__V = (function(s) {
  this.print__T__V(s);
  this.java$lang$JSConsoleBasedPrintStream$$printString__T__V("\n")
});
var $b_Lplots_CoordinateAxes3D = (void 0);
function $a_Lplots_CoordinateAxes3D() {
  if ((!$b_Lplots_CoordinateAxes3D)) {
    /** @constructor */
    var $c_Lplots_CoordinateAxes3D = (function $c_Lplots_CoordinateAxes3D(arg$1, arg$2) {
      var geometry = arg$1;
      var material = arg$2;
      $a_Lplots_CoordinateAxes().call(this, geometry, material)
    });
    /** @constructor */
    var $h_Lplots_CoordinateAxes3D = (function $h_Lplots_CoordinateAxes3D() {
      /*<skip>*/
    });
    $h_Lplots_CoordinateAxes3D.prototype = $a_Lplots_CoordinateAxes().prototype;
    $c_Lplots_CoordinateAxes3D.prototype = new $h_Lplots_CoordinateAxes3D();
    $c_Lplots_CoordinateAxes3D.prototype.constructor = $c_Lplots_CoordinateAxes3D;
    $b_Lplots_CoordinateAxes3D = $c_Lplots_CoordinateAxes3D
  };
  return $b_Lplots_CoordinateAxes3D
}
function $f_s_math_Numeric$DoubleIsConflicted__toInt__D__I($thiz, x) {
  return $doubleToInt(x)
}
function $f_s_math_Numeric$DoubleIsConflicted__plus__D__D__D($thiz, x, y) {
  return (x + y)
}
/** @constructor */
function $c_s_reflect_ClassTag$GenericClassTag() {
  $c_O.call(this);
  this.runtimeClass$1 = null
}
$c_s_reflect_ClassTag$GenericClassTag.prototype = new $h_O();
$c_s_reflect_ClassTag$GenericClassTag.prototype.constructor = $c_s_reflect_ClassTag$GenericClassTag;
/** @constructor */
function $h_s_reflect_ClassTag$GenericClassTag() {
  /*<skip>*/
}
$h_s_reflect_ClassTag$GenericClassTag.prototype = $c_s_reflect_ClassTag$GenericClassTag.prototype;
$c_s_reflect_ClassTag$GenericClassTag.prototype.newArray__I__O = (function(len) {
  return $f_s_reflect_ClassTag__newArray__I__O(this, len)
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.equals__O__Z = (function(x) {
  return $f_s_reflect_ClassTag__equals__O__Z(this, x)
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.toString__T = (function() {
  var clazz = this.runtimeClass$1;
  return $f_s_reflect_ClassTag__prettyprint$1__ps_reflect_ClassTag__jl_Class__T(this, clazz)
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.runtimeClass__jl_Class = (function() {
  return this.runtimeClass$1
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.init___jl_Class = (function(runtimeClass) {
  this.runtimeClass$1 = runtimeClass;
  return this
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.hashCode__I = (function() {
  return $m_sr_Statics$().anyHash__O__I(this.runtimeClass$1)
});
var $d_s_reflect_ClassTag$GenericClassTag = new $TypeData().initClass({
  s_reflect_ClassTag$GenericClassTag: 0
}, false, "scala.reflect.ClassTag$GenericClassTag", {
  s_reflect_ClassTag$GenericClassTag: 1,
  O: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ClassTag$GenericClassTag.prototype.$classData = $d_s_reflect_ClassTag$GenericClassTag;
/** @constructor */
function $c_sc_Seq$() {
  $c_scg_SeqFactory.call(this)
}
$c_sc_Seq$.prototype = new $h_scg_SeqFactory();
$c_sc_Seq$.prototype.constructor = $c_sc_Seq$;
/** @constructor */
function $h_sc_Seq$() {
  /*<skip>*/
}
$h_sc_Seq$.prototype = $c_sc_Seq$.prototype;
$c_sc_Seq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sc_Seq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Seq$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Seq$ = new $TypeData().initClass({
  sc_Seq$: 0
}, false, "scala.collection.Seq$", {
  sc_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Seq$.prototype.$classData = $d_sc_Seq$;
var $n_sc_Seq$ = (void 0);
function $m_sc_Seq$() {
  if ((!$n_sc_Seq$)) {
    $n_sc_Seq$ = new $c_sc_Seq$().init___()
  };
  return $n_sc_Seq$
}
/** @constructor */
function $c_scg_IndexedSeqFactory() {
  $c_scg_SeqFactory.call(this)
}
$c_scg_IndexedSeqFactory.prototype = new $h_scg_SeqFactory();
$c_scg_IndexedSeqFactory.prototype.constructor = $c_scg_IndexedSeqFactory;
/** @constructor */
function $h_scg_IndexedSeqFactory() {
  /*<skip>*/
}
$h_scg_IndexedSeqFactory.prototype = $c_scg_IndexedSeqFactory.prototype;
/** @constructor */
function $c_sci_HashMap$() {
  $c_scg_ImmutableMapFactory.call(this);
  this.defaultMerger$4 = null
}
$c_sci_HashMap$.prototype = new $h_scg_ImmutableMapFactory();
$c_sci_HashMap$.prototype.constructor = $c_sci_HashMap$;
/** @constructor */
function $h_sci_HashMap$() {
  /*<skip>*/
}
$h_sci_HashMap$.prototype = $c_sci_HashMap$.prototype;
$c_sci_HashMap$.prototype.init___ = (function() {
  $n_sci_HashMap$ = this;
  var mergef = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this) {
    return (function(a$2, b$2) {
      var a = $as_T2(a$2);
      $as_T2(b$2);
      return a
    })
  })(this));
  this.defaultMerger$4 = new $c_sci_HashMap$$anon$2().init___F2(mergef);
  return this
});
$c_sci_HashMap$.prototype.scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap = (function(hash0, elem0, hash1, elem1, level, size) {
  var index0 = (31 & ((hash0 >>> level) | 0));
  var index1 = (31 & ((hash1 >>> level) | 0));
  if ((index0 !== index1)) {
    var bitmap = ((1 << index0) | (1 << index1));
    var elems = $newArrayObject($d_sci_HashMap.getArrayOf(), [2]);
    if ((index0 < index1)) {
      elems.set(0, elem0);
      elems.set(1, elem1)
    } else {
      elems.set(0, elem1);
      elems.set(1, elem0)
    };
    return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(bitmap, elems, size)
  } else {
    var elems$2 = $newArrayObject($d_sci_HashMap.getArrayOf(), [1]);
    var bitmap$2 = (1 << index0);
    elems$2.set(0, this.scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(hash0, elem0, hash1, elem1, ((5 + level) | 0), size));
    return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(bitmap$2, elems$2, size)
  }
});
$c_sci_HashMap$.prototype.empty__sc_GenMap = (function() {
  return $m_sci_HashMap$EmptyHashMap$()
});
var $d_sci_HashMap$ = new $TypeData().initClass({
  sci_HashMap$: 0
}, false, "scala.collection.immutable.HashMap$", {
  sci_HashMap$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1,
  scg_BitOperations$Int: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashMap$.prototype.$classData = $d_sci_HashMap$;
var $n_sci_HashMap$ = (void 0);
function $m_sci_HashMap$() {
  if ((!$n_sci_HashMap$)) {
    $n_sci_HashMap$ = new $c_sci_HashMap$().init___()
  };
  return $n_sci_HashMap$
}
/** @constructor */
function $c_sci_Seq$() {
  $c_scg_SeqFactory.call(this)
}
$c_sci_Seq$.prototype = new $h_scg_SeqFactory();
$c_sci_Seq$.prototype.constructor = $c_sci_Seq$;
/** @constructor */
function $h_sci_Seq$() {
  /*<skip>*/
}
$h_sci_Seq$.prototype = $c_sci_Seq$.prototype;
$c_sci_Seq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Seq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Seq$ = new $TypeData().initClass({
  sci_Seq$: 0
}, false, "scala.collection.immutable.Seq$", {
  sci_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Seq$.prototype.$classData = $d_sci_Seq$;
var $n_sci_Seq$ = (void 0);
function $m_sci_Seq$() {
  if ((!$n_sci_Seq$)) {
    $n_sci_Seq$ = new $c_sci_Seq$().init___()
  };
  return $n_sci_Seq$
}
/** @constructor */
function $c_scm_ArrayBuilder() {
  $c_O.call(this)
}
$c_scm_ArrayBuilder.prototype = new $h_O();
$c_scm_ArrayBuilder.prototype.constructor = $c_scm_ArrayBuilder;
/** @constructor */
function $h_scm_ArrayBuilder() {
  /*<skip>*/
}
$h_scm_ArrayBuilder.prototype = $c_scm_ArrayBuilder.prototype;
$c_scm_ArrayBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_ArrayBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
/** @constructor */
function $c_scm_IndexedSeq$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_IndexedSeq$.prototype = new $h_scg_SeqFactory();
$c_scm_IndexedSeq$.prototype.constructor = $c_scm_IndexedSeq$;
/** @constructor */
function $h_scm_IndexedSeq$() {
  /*<skip>*/
}
$h_scm_IndexedSeq$.prototype = $c_scm_IndexedSeq$.prototype;
$c_scm_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_IndexedSeq$ = new $TypeData().initClass({
  scm_IndexedSeq$: 0
}, false, "scala.collection.mutable.IndexedSeq$", {
  scm_IndexedSeq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_scm_IndexedSeq$.prototype.$classData = $d_scm_IndexedSeq$;
var $n_scm_IndexedSeq$ = (void 0);
function $m_scm_IndexedSeq$() {
  if ((!$n_scm_IndexedSeq$)) {
    $n_scm_IndexedSeq$ = new $c_scm_IndexedSeq$().init___()
  };
  return $n_scm_IndexedSeq$
}
/** @constructor */
function $c_sjs_js_WrappedArray$() {
  $c_scg_SeqFactory.call(this)
}
$c_sjs_js_WrappedArray$.prototype = new $h_scg_SeqFactory();
$c_sjs_js_WrappedArray$.prototype.constructor = $c_sjs_js_WrappedArray$;
/** @constructor */
function $h_sjs_js_WrappedArray$() {
  /*<skip>*/
}
$h_sjs_js_WrappedArray$.prototype = $c_sjs_js_WrappedArray$.prototype;
$c_sjs_js_WrappedArray$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sjs_js_WrappedArray$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sjs_js_WrappedArray().init___()
});
var $d_sjs_js_WrappedArray$ = new $TypeData().initClass({
  sjs_js_WrappedArray$: 0
}, false, "scala.scalajs.js.WrappedArray$", {
  sjs_js_WrappedArray$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sjs_js_WrappedArray$.prototype.$classData = $d_sjs_js_WrappedArray$;
var $n_sjs_js_WrappedArray$ = (void 0);
function $m_sjs_js_WrappedArray$() {
  if ((!$n_sjs_js_WrappedArray$)) {
    $n_sjs_js_WrappedArray$ = new $c_sjs_js_WrappedArray$().init___()
  };
  return $n_sjs_js_WrappedArray$
}
/** @constructor */
function $c_jl_JSConsoleBasedPrintStream() {
  $c_Ljava_io_PrintStream.call(this);
  this.isErr$4 = null;
  this.flushed$4 = false;
  this.buffer$4 = null
}
$c_jl_JSConsoleBasedPrintStream.prototype = new $h_Ljava_io_PrintStream();
$c_jl_JSConsoleBasedPrintStream.prototype.constructor = $c_jl_JSConsoleBasedPrintStream;
/** @constructor */
function $h_jl_JSConsoleBasedPrintStream() {
  /*<skip>*/
}
$h_jl_JSConsoleBasedPrintStream.prototype = $c_jl_JSConsoleBasedPrintStream.prototype;
$c_jl_JSConsoleBasedPrintStream.prototype.init___jl_Boolean = (function(isErr) {
  this.isErr$4 = isErr;
  var out = new $c_jl_JSConsoleBasedPrintStream$DummyOutputStream().init___();
  $c_Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset.call(this, out, false, null);
  this.flushed$4 = true;
  this.buffer$4 = "";
  return this
});
$c_jl_JSConsoleBasedPrintStream.prototype.print__T__V = (function(s) {
  this.java$lang$JSConsoleBasedPrintStream$$printString__T__V(((s === null) ? "null" : s))
});
$c_jl_JSConsoleBasedPrintStream.prototype.java$lang$JSConsoleBasedPrintStream$$printString__T__V = (function(s) {
  var rest = s;
  while ((rest !== "")) {
    var thiz = rest;
    var nlPos = $uI(thiz.indexOf("\n"));
    if ((nlPos < 0)) {
      this.buffer$4 = (("" + this.buffer$4) + rest);
      this.flushed$4 = false;
      rest = ""
    } else {
      var jsx$1 = this.buffer$4;
      var thiz$1 = rest;
      this.doWriteLine__p4__T__V((("" + jsx$1) + $as_T(thiz$1.substring(0, nlPos))));
      this.buffer$4 = "";
      this.flushed$4 = true;
      var thiz$2 = rest;
      var beginIndex = ((1 + nlPos) | 0);
      rest = $as_T(thiz$2.substring(beginIndex))
    }
  }
});
$c_jl_JSConsoleBasedPrintStream.prototype.doWriteLine__p4__T__V = (function(line) {
  var x = $g.console;
  if ($uZ((!(!x)))) {
    var x$1 = this.isErr$4;
    if ($uZ(x$1)) {
      var x$2 = $g.console.error;
      var jsx$1 = $uZ((!(!x$2)))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      $g.console.error(line)
    } else {
      $g.console.log(line)
    }
  }
});
var $d_jl_JSConsoleBasedPrintStream = new $TypeData().initClass({
  jl_JSConsoleBasedPrintStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream", {
  jl_JSConsoleBasedPrintStream: 1,
  Ljava_io_PrintStream: 1,
  Ljava_io_FilterOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  jl_AutoCloseable: 1,
  Ljava_io_Flushable: 1,
  jl_Appendable: 1
});
$c_jl_JSConsoleBasedPrintStream.prototype.$classData = $d_jl_JSConsoleBasedPrintStream;
/** @constructor */
function $c_s_Tuple2$mcII$sp() {
  $c_T2.call(this);
  this.$$und1$mcI$sp$f = 0;
  this.$$und2$mcI$sp$f = 0
}
$c_s_Tuple2$mcII$sp.prototype = new $h_T2();
$c_s_Tuple2$mcII$sp.prototype.constructor = $c_s_Tuple2$mcII$sp;
/** @constructor */
function $h_s_Tuple2$mcII$sp() {
  /*<skip>*/
}
$h_s_Tuple2$mcII$sp.prototype = $c_s_Tuple2$mcII$sp.prototype;
$c_s_Tuple2$mcII$sp.prototype.$$und1$mcI$sp__I = (function() {
  return this.$$und1$mcI$sp$f
});
$c_s_Tuple2$mcII$sp.prototype.init___I__I = (function(_1$mcI$sp, _2$mcI$sp) {
  this.$$und1$mcI$sp$f = _1$mcI$sp;
  this.$$und2$mcI$sp$f = _2$mcI$sp;
  $c_T2.prototype.init___O__O.call(this, null, null);
  return this
});
$c_s_Tuple2$mcII$sp.prototype.$$und2__O = (function() {
  return this.$$und2$mcI$sp$f
});
$c_s_Tuple2$mcII$sp.prototype.$$und2$mcI$sp__I = (function() {
  return this.$$und2$mcI$sp$f
});
$c_s_Tuple2$mcII$sp.prototype.$$und1__O = (function() {
  return this.$$und1$mcI$sp$f
});
var $d_s_Tuple2$mcII$sp = new $TypeData().initClass({
  s_Tuple2$mcII$sp: 0
}, false, "scala.Tuple2$mcII$sp", {
  s_Tuple2$mcII$sp: 1,
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Product2$mcII$sp: 1
});
$c_s_Tuple2$mcII$sp.prototype.$classData = $d_s_Tuple2$mcII$sp;
/** @constructor */
function $c_s_concurrent_impl_Promise$DefaultPromise() {
  $c_ju_concurrent_atomic_AtomicReference.call(this)
}
$c_s_concurrent_impl_Promise$DefaultPromise.prototype = new $h_ju_concurrent_atomic_AtomicReference();
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.constructor = $c_s_concurrent_impl_Promise$DefaultPromise;
/** @constructor */
function $h_s_concurrent_impl_Promise$DefaultPromise() {
  /*<skip>*/
}
$h_s_concurrent_impl_Promise$DefaultPromise.prototype = $c_s_concurrent_impl_Promise$DefaultPromise.prototype;
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise__s_concurrent_impl_Promise$DefaultPromise = (function(linked) {
  _compressedRoot: while (true) {
    var target = linked.root__p2__s_concurrent_impl_Promise$DefaultPromise();
    if ((linked === target)) {
      return target
    } else if (this.compareAndSet__O__O__Z(linked, target)) {
      return target
    } else {
      var x1 = this.value$1;
      if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
        var x2 = $as_s_concurrent_impl_Promise$DefaultPromise(x1);
        linked = x2;
        continue _compressedRoot
      } else {
        return this
      }
    }
  }
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.init___ = (function() {
  $c_ju_concurrent_atomic_AtomicReference.prototype.init___O.call(this, $m_sci_Nil$());
  return this
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.dispatchOrAddCallback__p2__s_concurrent_impl_CallbackRunnable__V = (function(runnable) {
  var _$this = this;
  _dispatchOrAddCallback: while (true) {
    var x1 = _$this.value$1;
    if ($is_s_util_Try(x1)) {
      var x2 = $as_s_util_Try(x1);
      runnable.executeWithValue__s_util_Try__V(x2)
    } else {
      if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
        var x3 = $as_s_concurrent_impl_Promise$DefaultPromise(x1);
        _$this = _$this.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise__s_concurrent_impl_Promise$DefaultPromise(x3);
        continue _dispatchOrAddCallback
      };
      if ((!$is_sci_List(x1))) {
        throw new $c_s_MatchError().init___O(x1)
      };
      var x4 = $as_sci_List(x1);
      if ((!_$this.compareAndSet__O__O__Z(x4, new $c_sci_$colon$colon().init___O__sci_List(runnable, x4)))) {
        continue _dispatchOrAddCallback
      }
    };
    break
  }
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.tryComplete__s_util_Try__Z = (function(value) {
  var resolved = $m_s_concurrent_impl_Promise$().scala$concurrent$impl$Promise$$resolveTry__s_util_Try__s_util_Try(value);
  var x1 = this.tryCompleteAndGetListeners__p2__s_util_Try__sci_List(resolved);
  if ((x1 !== null)) {
    if (x1.isEmpty__Z()) {
      return true
    } else {
      var these = x1;
      while ((!these.isEmpty__Z())) {
        var arg1 = these.head__O();
        var r = $as_s_concurrent_impl_CallbackRunnable(arg1);
        r.executeWithValue__s_util_Try__V(resolved);
        var this$1 = these;
        these = this$1.tail__sci_List()
      };
      return true
    }
  } else {
    return false
  }
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.toString__T = (function() {
  return $f_s_concurrent_impl_Promise__toString__T(this)
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.root__p2__s_concurrent_impl_Promise$DefaultPromise = (function() {
  var _$this = this;
  _root: while (true) {
    var x1 = _$this.value$1;
    if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
      var x2 = $as_s_concurrent_impl_Promise$DefaultPromise(x1);
      _$this = x2;
      continue _root
    } else {
      return _$this
    }
  }
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.tryCompleteAndGetListeners__p2__s_util_Try__sci_List = (function(v) {
  var _$this = this;
  _tryCompleteAndGetListeners: while (true) {
    var x1 = _$this.value$1;
    if ($is_sci_List(x1)) {
      var x2 = $as_sci_List(x1);
      if (_$this.compareAndSet__O__O__Z(x2, v)) {
        return x2
      } else {
        continue _tryCompleteAndGetListeners
      }
    } else if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
      var x3 = $as_s_concurrent_impl_Promise$DefaultPromise(x1);
      _$this = _$this.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise__s_concurrent_impl_Promise$DefaultPromise(x3);
      continue _tryCompleteAndGetListeners
    } else {
      return null
    }
  }
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.onComplete__F1__s_concurrent_ExecutionContext__V = (function(func, executor) {
  this.dispatchOrAddCallback__p2__s_concurrent_impl_CallbackRunnable__V(new $c_s_concurrent_impl_CallbackRunnable().init___s_concurrent_ExecutionContext__F1(executor, func))
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.map__F1__s_concurrent_ExecutionContext__s_concurrent_Future = (function(f, executor) {
  return $f_s_concurrent_Future__map__F1__s_concurrent_ExecutionContext__s_concurrent_Future(this, f, executor)
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.value__s_Option = (function() {
  return this.value0__p2__s_Option()
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.value0__p2__s_Option = (function() {
  var _$this = this;
  _value0: while (true) {
    var x1 = _$this.value$1;
    if ($is_s_util_Try(x1)) {
      var x2 = $as_s_util_Try(x1);
      return new $c_s_Some().init___O(x2)
    } else if ($is_s_concurrent_impl_Promise$DefaultPromise(x1)) {
      var x3 = $as_s_concurrent_impl_Promise$DefaultPromise(x1);
      _$this = _$this.compressedRoot__p2__s_concurrent_impl_Promise$DefaultPromise__s_concurrent_impl_Promise$DefaultPromise(x3);
      continue _value0
    } else {
      return $m_s_None$()
    }
  }
});
function $is_s_concurrent_impl_Promise$DefaultPromise(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_concurrent_impl_Promise$DefaultPromise)))
}
function $as_s_concurrent_impl_Promise$DefaultPromise(obj) {
  return (($is_s_concurrent_impl_Promise$DefaultPromise(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.concurrent.impl.Promise$DefaultPromise"))
}
function $isArrayOf_s_concurrent_impl_Promise$DefaultPromise(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_concurrent_impl_Promise$DefaultPromise)))
}
function $asArrayOf_s_concurrent_impl_Promise$DefaultPromise(obj, depth) {
  return (($isArrayOf_s_concurrent_impl_Promise$DefaultPromise(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.concurrent.impl.Promise$DefaultPromise;", depth))
}
var $d_s_concurrent_impl_Promise$DefaultPromise = new $TypeData().initClass({
  s_concurrent_impl_Promise$DefaultPromise: 0
}, false, "scala.concurrent.impl.Promise$DefaultPromise", {
  s_concurrent_impl_Promise$DefaultPromise: 1,
  ju_concurrent_atomic_AtomicReference: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_concurrent_impl_Promise: 1,
  s_concurrent_Promise: 1,
  s_concurrent_Future: 1,
  s_concurrent_Awaitable: 1
});
$c_s_concurrent_impl_Promise$DefaultPromise.prototype.$classData = $d_s_concurrent_impl_Promise$DefaultPromise;
function $f_s_math_Numeric$IntIsIntegral__plus__I__I__I($thiz, x, y) {
  return ((x + y) | 0)
}
/** @constructor */
function $c_s_reflect_AnyValManifest() {
  $c_O.call(this);
  this.toString$1 = null
}
$c_s_reflect_AnyValManifest.prototype = new $h_O();
$c_s_reflect_AnyValManifest.prototype.constructor = $c_s_reflect_AnyValManifest;
/** @constructor */
function $h_s_reflect_AnyValManifest() {
  /*<skip>*/
}
$h_s_reflect_AnyValManifest.prototype = $c_s_reflect_AnyValManifest.prototype;
$c_s_reflect_AnyValManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_AnyValManifest.prototype.toString__T = (function() {
  return this.toString$1
});
$c_s_reflect_AnyValManifest.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ClassTypeManifest() {
  $c_O.call(this);
  this.prefix$1 = null;
  this.runtimeClass1$1 = null;
  this.typeArguments$1 = null
}
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype = new $h_O();
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype.constructor = $c_s_reflect_ManifestFactory$ClassTypeManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$ClassTypeManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ClassTypeManifest.prototype = $c_s_reflect_ManifestFactory$ClassTypeManifest.prototype;
/** @constructor */
function $c_sc_IndexedSeq$() {
  $c_scg_IndexedSeqFactory.call(this);
  this.ReusableCBF$6 = null
}
$c_sc_IndexedSeq$.prototype = new $h_scg_IndexedSeqFactory();
$c_sc_IndexedSeq$.prototype.constructor = $c_sc_IndexedSeq$;
/** @constructor */
function $h_sc_IndexedSeq$() {
  /*<skip>*/
}
$h_sc_IndexedSeq$.prototype = $c_sc_IndexedSeq$.prototype;
$c_sc_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sc_IndexedSeq$ = this;
  this.ReusableCBF$6 = new $c_sc_IndexedSeq$$anon$1().init___();
  return this
});
$c_sc_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sc_IndexedSeq$ = new $TypeData().initClass({
  sc_IndexedSeq$: 0
}, false, "scala.collection.IndexedSeq$", {
  sc_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_IndexedSeq$.prototype.$classData = $d_sc_IndexedSeq$;
var $n_sc_IndexedSeq$ = (void 0);
function $m_sc_IndexedSeq$() {
  if ((!$n_sc_IndexedSeq$)) {
    $n_sc_IndexedSeq$ = new $c_sc_IndexedSeq$().init___()
  };
  return $n_sc_IndexedSeq$
}
/** @constructor */
function $c_sc_IndexedSeqLike$Elements() {
  $c_sc_AbstractIterator.call(this);
  this.end$2 = 0;
  this.index$2 = 0;
  this.$$outer$2 = null
}
$c_sc_IndexedSeqLike$Elements.prototype = new $h_sc_AbstractIterator();
$c_sc_IndexedSeqLike$Elements.prototype.constructor = $c_sc_IndexedSeqLike$Elements;
/** @constructor */
function $h_sc_IndexedSeqLike$Elements() {
  /*<skip>*/
}
$h_sc_IndexedSeqLike$Elements.prototype = $c_sc_IndexedSeqLike$Elements.prototype;
$c_sc_IndexedSeqLike$Elements.prototype.next__O = (function() {
  if ((this.index$2 >= this.end$2)) {
    $m_sc_Iterator$().empty$1.next__O()
  };
  var x = this.$$outer$2.apply__I__O(this.index$2);
  this.index$2 = ((1 + this.index$2) | 0);
  return x
});
$c_sc_IndexedSeqLike$Elements.prototype.init___sc_IndexedSeqLike__I__I = (function($$outer, start, end) {
  this.end$2 = end;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.index$2 = start;
  return this
});
$c_sc_IndexedSeqLike$Elements.prototype.hasNext__Z = (function() {
  return (this.index$2 < this.end$2)
});
var $d_sc_IndexedSeqLike$Elements = new $TypeData().initClass({
  sc_IndexedSeqLike$Elements: 0
}, false, "scala.collection.IndexedSeqLike$Elements", {
  sc_IndexedSeqLike$Elements: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_BufferedIterator: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sc_IndexedSeqLike$Elements.prototype.$classData = $d_sc_IndexedSeqLike$Elements;
/** @constructor */
function $c_sci_HashSet$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_HashSet$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_HashSet$.prototype.constructor = $c_sci_HashSet$;
/** @constructor */
function $h_sci_HashSet$() {
  /*<skip>*/
}
$h_sci_HashSet$.prototype = $c_sci_HashSet$.prototype;
$c_sci_HashSet$.prototype.init___ = (function() {
  return this
});
$c_sci_HashSet$.prototype.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet = (function(hash0, elem0, hash1, elem1, level) {
  var index0 = (31 & ((hash0 >>> level) | 0));
  var index1 = (31 & ((hash1 >>> level) | 0));
  if ((index0 !== index1)) {
    var bitmap = ((1 << index0) | (1 << index1));
    var elems = $newArrayObject($d_sci_HashSet.getArrayOf(), [2]);
    if ((index0 < index1)) {
      elems.set(0, elem0);
      elems.set(1, elem1)
    } else {
      elems.set(0, elem1);
      elems.set(1, elem0)
    };
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap, elems, ((elem0.size__I() + elem1.size__I()) | 0))
  } else {
    var elems$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [1]);
    var bitmap$2 = (1 << index0);
    var child = this.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(hash0, elem0, hash1, elem1, ((5 + level) | 0));
    elems$2.set(0, child);
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap$2, elems$2, child.size0$5)
  }
});
$c_sci_HashSet$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_HashSet$EmptyHashSet$()
});
var $d_sci_HashSet$ = new $TypeData().initClass({
  sci_HashSet$: 0
}, false, "scala.collection.immutable.HashSet$", {
  sci_HashSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$.prototype.$classData = $d_sci_HashSet$;
var $n_sci_HashSet$ = (void 0);
function $m_sci_HashSet$() {
  if ((!$n_sci_HashSet$)) {
    $n_sci_HashSet$ = new $c_sci_HashSet$().init___()
  };
  return $n_sci_HashSet$
}
/** @constructor */
function $c_sci_IndexedSeq$() {
  $c_scg_IndexedSeqFactory.call(this)
}
$c_sci_IndexedSeq$.prototype = new $h_scg_IndexedSeqFactory();
$c_sci_IndexedSeq$.prototype.constructor = $c_sci_IndexedSeq$;
/** @constructor */
function $h_sci_IndexedSeq$() {
  /*<skip>*/
}
$h_sci_IndexedSeq$.prototype = $c_sci_IndexedSeq$.prototype;
$c_sci_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sci_IndexedSeq$ = new $TypeData().initClass({
  sci_IndexedSeq$: 0
}, false, "scala.collection.immutable.IndexedSeq$", {
  sci_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_IndexedSeq$.prototype.$classData = $d_sci_IndexedSeq$;
var $n_sci_IndexedSeq$ = (void 0);
function $m_sci_IndexedSeq$() {
  if ((!$n_sci_IndexedSeq$)) {
    $n_sci_IndexedSeq$ = new $c_sci_IndexedSeq$().init___()
  };
  return $n_sci_IndexedSeq$
}
/** @constructor */
function $c_sci_ListSet$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_ListSet$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_ListSet$.prototype.constructor = $c_sci_ListSet$;
/** @constructor */
function $h_sci_ListSet$() {
  /*<skip>*/
}
$h_sci_ListSet$.prototype = $c_sci_ListSet$.prototype;
$c_sci_ListSet$.prototype.init___ = (function() {
  return this
});
$c_sci_ListSet$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_ListSet$EmptyListSet$()
});
var $d_sci_ListSet$ = new $TypeData().initClass({
  sci_ListSet$: 0
}, false, "scala.collection.immutable.ListSet$", {
  sci_ListSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$.prototype.$classData = $d_sci_ListSet$;
var $n_sci_ListSet$ = (void 0);
function $m_sci_ListSet$() {
  if ((!$n_sci_ListSet$)) {
    $n_sci_ListSet$ = new $c_sci_ListSet$().init___()
  };
  return $n_sci_ListSet$
}
/** @constructor */
function $c_scm_ArrayBuilder$ofBoolean() {
  $c_scm_ArrayBuilder.call(this);
  this.elems$2 = null;
  this.capacity$2 = 0;
  this.size$2 = 0
}
$c_scm_ArrayBuilder$ofBoolean.prototype = new $h_scm_ArrayBuilder();
$c_scm_ArrayBuilder$ofBoolean.prototype.constructor = $c_scm_ArrayBuilder$ofBoolean;
/** @constructor */
function $h_scm_ArrayBuilder$ofBoolean() {
  /*<skip>*/
}
$h_scm_ArrayBuilder$ofBoolean.prototype = $c_scm_ArrayBuilder$ofBoolean.prototype;
$c_scm_ArrayBuilder$ofBoolean.prototype.init___ = (function() {
  this.capacity$2 = 0;
  this.size$2 = 0;
  return this
});
$c_scm_ArrayBuilder$ofBoolean.prototype.mkArray__p2__I__AZ = (function(size) {
  var newelems = $newArrayObject($d_Z.getArrayOf(), [size]);
  if ((this.size$2 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$2, 0, newelems, 0, this.size$2)
  };
  return newelems
});
$c_scm_ArrayBuilder$ofBoolean.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofBoolean = (function(xs) {
  if ($is_scm_WrappedArray$ofBoolean(xs)) {
    var x2 = $as_scm_WrappedArray$ofBoolean(xs);
    this.ensureSize__p2__I__V(((this.size$2 + x2.length__I()) | 0));
    $m_s_Array$().copy__O__I__O__I__I__V(x2.array$6, 0, this.elems$2, this.size$2, x2.length__I());
    this.size$2 = ((this.size$2 + x2.length__I()) | 0);
    return this
  } else {
    return $as_scm_ArrayBuilder$ofBoolean($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuilder$ofBoolean.prototype.equals__O__Z = (function(other) {
  if ($is_scm_ArrayBuilder$ofBoolean(other)) {
    var x2 = $as_scm_ArrayBuilder$ofBoolean(other);
    return ((this.size$2 === x2.size$2) && (this.elems$2 === x2.elems$2))
  } else {
    return false
  }
});
$c_scm_ArrayBuilder$ofBoolean.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__Z__scm_ArrayBuilder$ofBoolean($uZ(elem))
});
$c_scm_ArrayBuilder$ofBoolean.prototype.toString__T = (function() {
  return "ArrayBuilder.ofBoolean"
});
$c_scm_ArrayBuilder$ofBoolean.prototype.result__O = (function() {
  return this.result__AZ()
});
$c_scm_ArrayBuilder$ofBoolean.prototype.resize__p2__I__V = (function(size) {
  this.elems$2 = this.mkArray__p2__I__AZ(size);
  this.capacity$2 = size
});
$c_scm_ArrayBuilder$ofBoolean.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__Z__scm_ArrayBuilder$ofBoolean($uZ(elem))
});
$c_scm_ArrayBuilder$ofBoolean.prototype.result__AZ = (function() {
  if (((this.capacity$2 !== 0) && (this.capacity$2 === this.size$2))) {
    this.capacity$2 = 0;
    return this.elems$2
  } else {
    return this.mkArray__p2__I__AZ(this.size$2)
  }
});
$c_scm_ArrayBuilder$ofBoolean.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$2 < size)) {
    this.resize__p2__I__V(size)
  }
});
$c_scm_ArrayBuilder$ofBoolean.prototype.ensureSize__p2__I__V = (function(size) {
  if (((this.capacity$2 < size) || (this.capacity$2 === 0))) {
    var newsize = ((this.capacity$2 === 0) ? 16 : (this.capacity$2 << 1));
    while ((newsize < size)) {
      newsize = (newsize << 1)
    };
    this.resize__p2__I__V(newsize)
  }
});
$c_scm_ArrayBuilder$ofBoolean.prototype.$$plus$eq__Z__scm_ArrayBuilder$ofBoolean = (function(elem) {
  this.ensureSize__p2__I__V(((1 + this.size$2) | 0));
  this.elems$2.set(this.size$2, elem);
  this.size$2 = ((1 + this.size$2) | 0);
  return this
});
$c_scm_ArrayBuilder$ofBoolean.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofBoolean(xs)
});
function $is_scm_ArrayBuilder$ofBoolean(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuilder$ofBoolean)))
}
function $as_scm_ArrayBuilder$ofBoolean(obj) {
  return (($is_scm_ArrayBuilder$ofBoolean(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuilder$ofBoolean"))
}
function $isArrayOf_scm_ArrayBuilder$ofBoolean(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuilder$ofBoolean)))
}
function $asArrayOf_scm_ArrayBuilder$ofBoolean(obj, depth) {
  return (($isArrayOf_scm_ArrayBuilder$ofBoolean(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuilder$ofBoolean;", depth))
}
var $d_scm_ArrayBuilder$ofBoolean = new $TypeData().initClass({
  scm_ArrayBuilder$ofBoolean: 0
}, false, "scala.collection.mutable.ArrayBuilder$ofBoolean", {
  scm_ArrayBuilder$ofBoolean: 1,
  scm_ArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuilder$ofBoolean.prototype.$classData = $d_scm_ArrayBuilder$ofBoolean;
/** @constructor */
function $c_scm_ArrayBuilder$ofByte() {
  $c_scm_ArrayBuilder.call(this);
  this.elems$2 = null;
  this.capacity$2 = 0;
  this.size$2 = 0
}
$c_scm_ArrayBuilder$ofByte.prototype = new $h_scm_ArrayBuilder();
$c_scm_ArrayBuilder$ofByte.prototype.constructor = $c_scm_ArrayBuilder$ofByte;
/** @constructor */
function $h_scm_ArrayBuilder$ofByte() {
  /*<skip>*/
}
$h_scm_ArrayBuilder$ofByte.prototype = $c_scm_ArrayBuilder$ofByte.prototype;
$c_scm_ArrayBuilder$ofByte.prototype.init___ = (function() {
  this.capacity$2 = 0;
  this.size$2 = 0;
  return this
});
$c_scm_ArrayBuilder$ofByte.prototype.equals__O__Z = (function(other) {
  if ($is_scm_ArrayBuilder$ofByte(other)) {
    var x2 = $as_scm_ArrayBuilder$ofByte(other);
    return ((this.size$2 === x2.size$2) && (this.elems$2 === x2.elems$2))
  } else {
    return false
  }
});
$c_scm_ArrayBuilder$ofByte.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofByte = (function(xs) {
  if ($is_scm_WrappedArray$ofByte(xs)) {
    var x2 = $as_scm_WrappedArray$ofByte(xs);
    this.ensureSize__p2__I__V(((this.size$2 + x2.length__I()) | 0));
    $m_s_Array$().copy__O__I__O__I__I__V(x2.array$6, 0, this.elems$2, this.size$2, x2.length__I());
    this.size$2 = ((this.size$2 + x2.length__I()) | 0);
    return this
  } else {
    return $as_scm_ArrayBuilder$ofByte($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuilder$ofByte.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__B__scm_ArrayBuilder$ofByte($uB(elem))
});
$c_scm_ArrayBuilder$ofByte.prototype.mkArray__p2__I__AB = (function(size) {
  var newelems = $newArrayObject($d_B.getArrayOf(), [size]);
  if ((this.size$2 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$2, 0, newelems, 0, this.size$2)
  };
  return newelems
});
$c_scm_ArrayBuilder$ofByte.prototype.toString__T = (function() {
  return "ArrayBuilder.ofByte"
});
$c_scm_ArrayBuilder$ofByte.prototype.result__O = (function() {
  return this.result__AB()
});
$c_scm_ArrayBuilder$ofByte.prototype.resize__p2__I__V = (function(size) {
  this.elems$2 = this.mkArray__p2__I__AB(size);
  this.capacity$2 = size
});
$c_scm_ArrayBuilder$ofByte.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__B__scm_ArrayBuilder$ofByte($uB(elem))
});
$c_scm_ArrayBuilder$ofByte.prototype.$$plus$eq__B__scm_ArrayBuilder$ofByte = (function(elem) {
  this.ensureSize__p2__I__V(((1 + this.size$2) | 0));
  this.elems$2.set(this.size$2, elem);
  this.size$2 = ((1 + this.size$2) | 0);
  return this
});
$c_scm_ArrayBuilder$ofByte.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$2 < size)) {
    this.resize__p2__I__V(size)
  }
});
$c_scm_ArrayBuilder$ofByte.prototype.result__AB = (function() {
  if (((this.capacity$2 !== 0) && (this.capacity$2 === this.size$2))) {
    this.capacity$2 = 0;
    return this.elems$2
  } else {
    return this.mkArray__p2__I__AB(this.size$2)
  }
});
$c_scm_ArrayBuilder$ofByte.prototype.ensureSize__p2__I__V = (function(size) {
  if (((this.capacity$2 < size) || (this.capacity$2 === 0))) {
    var newsize = ((this.capacity$2 === 0) ? 16 : (this.capacity$2 << 1));
    while ((newsize < size)) {
      newsize = (newsize << 1)
    };
    this.resize__p2__I__V(newsize)
  }
});
$c_scm_ArrayBuilder$ofByte.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofByte(xs)
});
function $is_scm_ArrayBuilder$ofByte(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuilder$ofByte)))
}
function $as_scm_ArrayBuilder$ofByte(obj) {
  return (($is_scm_ArrayBuilder$ofByte(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuilder$ofByte"))
}
function $isArrayOf_scm_ArrayBuilder$ofByte(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuilder$ofByte)))
}
function $asArrayOf_scm_ArrayBuilder$ofByte(obj, depth) {
  return (($isArrayOf_scm_ArrayBuilder$ofByte(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuilder$ofByte;", depth))
}
var $d_scm_ArrayBuilder$ofByte = new $TypeData().initClass({
  scm_ArrayBuilder$ofByte: 0
}, false, "scala.collection.mutable.ArrayBuilder$ofByte", {
  scm_ArrayBuilder$ofByte: 1,
  scm_ArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuilder$ofByte.prototype.$classData = $d_scm_ArrayBuilder$ofByte;
/** @constructor */
function $c_scm_ArrayBuilder$ofChar() {
  $c_scm_ArrayBuilder.call(this);
  this.elems$2 = null;
  this.capacity$2 = 0;
  this.size$2 = 0
}
$c_scm_ArrayBuilder$ofChar.prototype = new $h_scm_ArrayBuilder();
$c_scm_ArrayBuilder$ofChar.prototype.constructor = $c_scm_ArrayBuilder$ofChar;
/** @constructor */
function $h_scm_ArrayBuilder$ofChar() {
  /*<skip>*/
}
$h_scm_ArrayBuilder$ofChar.prototype = $c_scm_ArrayBuilder$ofChar.prototype;
$c_scm_ArrayBuilder$ofChar.prototype.init___ = (function() {
  this.capacity$2 = 0;
  this.size$2 = 0;
  return this
});
$c_scm_ArrayBuilder$ofChar.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofChar = (function(xs) {
  if ($is_scm_WrappedArray$ofChar(xs)) {
    var x2 = $as_scm_WrappedArray$ofChar(xs);
    this.ensureSize__p2__I__V(((this.size$2 + x2.length__I()) | 0));
    $m_s_Array$().copy__O__I__O__I__I__V(x2.array$6, 0, this.elems$2, this.size$2, x2.length__I());
    this.size$2 = ((this.size$2 + x2.length__I()) | 0);
    return this
  } else {
    return $as_scm_ArrayBuilder$ofChar($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuilder$ofChar.prototype.equals__O__Z = (function(other) {
  if ($is_scm_ArrayBuilder$ofChar(other)) {
    var x2 = $as_scm_ArrayBuilder$ofChar(other);
    return ((this.size$2 === x2.size$2) && (this.elems$2 === x2.elems$2))
  } else {
    return false
  }
});
$c_scm_ArrayBuilder$ofChar.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_ArrayBuilder$ofChar(jsx$1)
});
$c_scm_ArrayBuilder$ofChar.prototype.toString__T = (function() {
  return "ArrayBuilder.ofChar"
});
$c_scm_ArrayBuilder$ofChar.prototype.result__O = (function() {
  return this.result__AC()
});
$c_scm_ArrayBuilder$ofChar.prototype.resize__p2__I__V = (function(size) {
  this.elems$2 = this.mkArray__p2__I__AC(size);
  this.capacity$2 = size
});
$c_scm_ArrayBuilder$ofChar.prototype.result__AC = (function() {
  if (((this.capacity$2 !== 0) && (this.capacity$2 === this.size$2))) {
    this.capacity$2 = 0;
    return this.elems$2
  } else {
    return this.mkArray__p2__I__AC(this.size$2)
  }
});
$c_scm_ArrayBuilder$ofChar.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_ArrayBuilder$ofChar(jsx$1)
});
$c_scm_ArrayBuilder$ofChar.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$2 < size)) {
    this.resize__p2__I__V(size)
  }
});
$c_scm_ArrayBuilder$ofChar.prototype.mkArray__p2__I__AC = (function(size) {
  var newelems = $newArrayObject($d_C.getArrayOf(), [size]);
  if ((this.size$2 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$2, 0, newelems, 0, this.size$2)
  };
  return newelems
});
$c_scm_ArrayBuilder$ofChar.prototype.ensureSize__p2__I__V = (function(size) {
  if (((this.capacity$2 < size) || (this.capacity$2 === 0))) {
    var newsize = ((this.capacity$2 === 0) ? 16 : (this.capacity$2 << 1));
    while ((newsize < size)) {
      newsize = (newsize << 1)
    };
    this.resize__p2__I__V(newsize)
  }
});
$c_scm_ArrayBuilder$ofChar.prototype.$$plus$eq__C__scm_ArrayBuilder$ofChar = (function(elem) {
  this.ensureSize__p2__I__V(((1 + this.size$2) | 0));
  this.elems$2.set(this.size$2, elem);
  this.size$2 = ((1 + this.size$2) | 0);
  return this
});
$c_scm_ArrayBuilder$ofChar.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofChar(xs)
});
function $is_scm_ArrayBuilder$ofChar(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuilder$ofChar)))
}
function $as_scm_ArrayBuilder$ofChar(obj) {
  return (($is_scm_ArrayBuilder$ofChar(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuilder$ofChar"))
}
function $isArrayOf_scm_ArrayBuilder$ofChar(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuilder$ofChar)))
}
function $asArrayOf_scm_ArrayBuilder$ofChar(obj, depth) {
  return (($isArrayOf_scm_ArrayBuilder$ofChar(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuilder$ofChar;", depth))
}
var $d_scm_ArrayBuilder$ofChar = new $TypeData().initClass({
  scm_ArrayBuilder$ofChar: 0
}, false, "scala.collection.mutable.ArrayBuilder$ofChar", {
  scm_ArrayBuilder$ofChar: 1,
  scm_ArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuilder$ofChar.prototype.$classData = $d_scm_ArrayBuilder$ofChar;
/** @constructor */
function $c_scm_ArrayBuilder$ofDouble() {
  $c_scm_ArrayBuilder.call(this);
  this.elems$2 = null;
  this.capacity$2 = 0;
  this.size$2 = 0
}
$c_scm_ArrayBuilder$ofDouble.prototype = new $h_scm_ArrayBuilder();
$c_scm_ArrayBuilder$ofDouble.prototype.constructor = $c_scm_ArrayBuilder$ofDouble;
/** @constructor */
function $h_scm_ArrayBuilder$ofDouble() {
  /*<skip>*/
}
$h_scm_ArrayBuilder$ofDouble.prototype = $c_scm_ArrayBuilder$ofDouble.prototype;
$c_scm_ArrayBuilder$ofDouble.prototype.init___ = (function() {
  this.capacity$2 = 0;
  this.size$2 = 0;
  return this
});
$c_scm_ArrayBuilder$ofDouble.prototype.equals__O__Z = (function(other) {
  if ($is_scm_ArrayBuilder$ofDouble(other)) {
    var x2 = $as_scm_ArrayBuilder$ofDouble(other);
    return ((this.size$2 === x2.size$2) && (this.elems$2 === x2.elems$2))
  } else {
    return false
  }
});
$c_scm_ArrayBuilder$ofDouble.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__D__scm_ArrayBuilder$ofDouble($uD(elem))
});
$c_scm_ArrayBuilder$ofDouble.prototype.toString__T = (function() {
  return "ArrayBuilder.ofDouble"
});
$c_scm_ArrayBuilder$ofDouble.prototype.result__AD = (function() {
  if (((this.capacity$2 !== 0) && (this.capacity$2 === this.size$2))) {
    this.capacity$2 = 0;
    return this.elems$2
  } else {
    return this.mkArray__p2__I__AD(this.size$2)
  }
});
$c_scm_ArrayBuilder$ofDouble.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofDouble = (function(xs) {
  if ($is_scm_WrappedArray$ofDouble(xs)) {
    var x2 = $as_scm_WrappedArray$ofDouble(xs);
    this.ensureSize__p2__I__V(((this.size$2 + x2.length__I()) | 0));
    $m_s_Array$().copy__O__I__O__I__I__V(x2.array$6, 0, this.elems$2, this.size$2, x2.length__I());
    this.size$2 = ((this.size$2 + x2.length__I()) | 0);
    return this
  } else {
    return $as_scm_ArrayBuilder$ofDouble($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuilder$ofDouble.prototype.result__O = (function() {
  return this.result__AD()
});
$c_scm_ArrayBuilder$ofDouble.prototype.mkArray__p2__I__AD = (function(size) {
  var newelems = $newArrayObject($d_D.getArrayOf(), [size]);
  if ((this.size$2 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$2, 0, newelems, 0, this.size$2)
  };
  return newelems
});
$c_scm_ArrayBuilder$ofDouble.prototype.resize__p2__I__V = (function(size) {
  this.elems$2 = this.mkArray__p2__I__AD(size);
  this.capacity$2 = size
});
$c_scm_ArrayBuilder$ofDouble.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__D__scm_ArrayBuilder$ofDouble($uD(elem))
});
$c_scm_ArrayBuilder$ofDouble.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$2 < size)) {
    this.resize__p2__I__V(size)
  }
});
$c_scm_ArrayBuilder$ofDouble.prototype.$$plus$eq__D__scm_ArrayBuilder$ofDouble = (function(elem) {
  this.ensureSize__p2__I__V(((1 + this.size$2) | 0));
  this.elems$2.set(this.size$2, elem);
  this.size$2 = ((1 + this.size$2) | 0);
  return this
});
$c_scm_ArrayBuilder$ofDouble.prototype.ensureSize__p2__I__V = (function(size) {
  if (((this.capacity$2 < size) || (this.capacity$2 === 0))) {
    var newsize = ((this.capacity$2 === 0) ? 16 : (this.capacity$2 << 1));
    while ((newsize < size)) {
      newsize = (newsize << 1)
    };
    this.resize__p2__I__V(newsize)
  }
});
$c_scm_ArrayBuilder$ofDouble.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofDouble(xs)
});
function $is_scm_ArrayBuilder$ofDouble(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuilder$ofDouble)))
}
function $as_scm_ArrayBuilder$ofDouble(obj) {
  return (($is_scm_ArrayBuilder$ofDouble(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuilder$ofDouble"))
}
function $isArrayOf_scm_ArrayBuilder$ofDouble(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuilder$ofDouble)))
}
function $asArrayOf_scm_ArrayBuilder$ofDouble(obj, depth) {
  return (($isArrayOf_scm_ArrayBuilder$ofDouble(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuilder$ofDouble;", depth))
}
var $d_scm_ArrayBuilder$ofDouble = new $TypeData().initClass({
  scm_ArrayBuilder$ofDouble: 0
}, false, "scala.collection.mutable.ArrayBuilder$ofDouble", {
  scm_ArrayBuilder$ofDouble: 1,
  scm_ArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuilder$ofDouble.prototype.$classData = $d_scm_ArrayBuilder$ofDouble;
/** @constructor */
function $c_scm_ArrayBuilder$ofFloat() {
  $c_scm_ArrayBuilder.call(this);
  this.elems$2 = null;
  this.capacity$2 = 0;
  this.size$2 = 0
}
$c_scm_ArrayBuilder$ofFloat.prototype = new $h_scm_ArrayBuilder();
$c_scm_ArrayBuilder$ofFloat.prototype.constructor = $c_scm_ArrayBuilder$ofFloat;
/** @constructor */
function $h_scm_ArrayBuilder$ofFloat() {
  /*<skip>*/
}
$h_scm_ArrayBuilder$ofFloat.prototype = $c_scm_ArrayBuilder$ofFloat.prototype;
$c_scm_ArrayBuilder$ofFloat.prototype.init___ = (function() {
  this.capacity$2 = 0;
  this.size$2 = 0;
  return this
});
$c_scm_ArrayBuilder$ofFloat.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofFloat = (function(xs) {
  if ($is_scm_WrappedArray$ofFloat(xs)) {
    var x2 = $as_scm_WrappedArray$ofFloat(xs);
    this.ensureSize__p2__I__V(((this.size$2 + x2.length__I()) | 0));
    $m_s_Array$().copy__O__I__O__I__I__V(x2.array$6, 0, this.elems$2, this.size$2, x2.length__I());
    this.size$2 = ((this.size$2 + x2.length__I()) | 0);
    return this
  } else {
    return $as_scm_ArrayBuilder$ofFloat($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuilder$ofFloat.prototype.equals__O__Z = (function(other) {
  if ($is_scm_ArrayBuilder$ofFloat(other)) {
    var x2 = $as_scm_ArrayBuilder$ofFloat(other);
    return ((this.size$2 === x2.size$2) && (this.elems$2 === x2.elems$2))
  } else {
    return false
  }
});
$c_scm_ArrayBuilder$ofFloat.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__F__scm_ArrayBuilder$ofFloat($uF(elem))
});
$c_scm_ArrayBuilder$ofFloat.prototype.toString__T = (function() {
  return "ArrayBuilder.ofFloat"
});
$c_scm_ArrayBuilder$ofFloat.prototype.result__O = (function() {
  return this.result__AF()
});
$c_scm_ArrayBuilder$ofFloat.prototype.resize__p2__I__V = (function(size) {
  this.elems$2 = this.mkArray__p2__I__AF(size);
  this.capacity$2 = size
});
$c_scm_ArrayBuilder$ofFloat.prototype.$$plus$eq__F__scm_ArrayBuilder$ofFloat = (function(elem) {
  this.ensureSize__p2__I__V(((1 + this.size$2) | 0));
  this.elems$2.set(this.size$2, elem);
  this.size$2 = ((1 + this.size$2) | 0);
  return this
});
$c_scm_ArrayBuilder$ofFloat.prototype.result__AF = (function() {
  if (((this.capacity$2 !== 0) && (this.capacity$2 === this.size$2))) {
    this.capacity$2 = 0;
    return this.elems$2
  } else {
    return this.mkArray__p2__I__AF(this.size$2)
  }
});
$c_scm_ArrayBuilder$ofFloat.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__F__scm_ArrayBuilder$ofFloat($uF(elem))
});
$c_scm_ArrayBuilder$ofFloat.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$2 < size)) {
    this.resize__p2__I__V(size)
  }
});
$c_scm_ArrayBuilder$ofFloat.prototype.mkArray__p2__I__AF = (function(size) {
  var newelems = $newArrayObject($d_F.getArrayOf(), [size]);
  if ((this.size$2 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$2, 0, newelems, 0, this.size$2)
  };
  return newelems
});
$c_scm_ArrayBuilder$ofFloat.prototype.ensureSize__p2__I__V = (function(size) {
  if (((this.capacity$2 < size) || (this.capacity$2 === 0))) {
    var newsize = ((this.capacity$2 === 0) ? 16 : (this.capacity$2 << 1));
    while ((newsize < size)) {
      newsize = (newsize << 1)
    };
    this.resize__p2__I__V(newsize)
  }
});
$c_scm_ArrayBuilder$ofFloat.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofFloat(xs)
});
function $is_scm_ArrayBuilder$ofFloat(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuilder$ofFloat)))
}
function $as_scm_ArrayBuilder$ofFloat(obj) {
  return (($is_scm_ArrayBuilder$ofFloat(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuilder$ofFloat"))
}
function $isArrayOf_scm_ArrayBuilder$ofFloat(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuilder$ofFloat)))
}
function $asArrayOf_scm_ArrayBuilder$ofFloat(obj, depth) {
  return (($isArrayOf_scm_ArrayBuilder$ofFloat(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuilder$ofFloat;", depth))
}
var $d_scm_ArrayBuilder$ofFloat = new $TypeData().initClass({
  scm_ArrayBuilder$ofFloat: 0
}, false, "scala.collection.mutable.ArrayBuilder$ofFloat", {
  scm_ArrayBuilder$ofFloat: 1,
  scm_ArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuilder$ofFloat.prototype.$classData = $d_scm_ArrayBuilder$ofFloat;
/** @constructor */
function $c_scm_ArrayBuilder$ofInt() {
  $c_scm_ArrayBuilder.call(this);
  this.elems$2 = null;
  this.capacity$2 = 0;
  this.size$2 = 0
}
$c_scm_ArrayBuilder$ofInt.prototype = new $h_scm_ArrayBuilder();
$c_scm_ArrayBuilder$ofInt.prototype.constructor = $c_scm_ArrayBuilder$ofInt;
/** @constructor */
function $h_scm_ArrayBuilder$ofInt() {
  /*<skip>*/
}
$h_scm_ArrayBuilder$ofInt.prototype = $c_scm_ArrayBuilder$ofInt.prototype;
$c_scm_ArrayBuilder$ofInt.prototype.init___ = (function() {
  this.capacity$2 = 0;
  this.size$2 = 0;
  return this
});
$c_scm_ArrayBuilder$ofInt.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofInt = (function(xs) {
  if ($is_scm_WrappedArray$ofInt(xs)) {
    var x2 = $as_scm_WrappedArray$ofInt(xs);
    this.ensureSize__p2__I__V(((this.size$2 + x2.length__I()) | 0));
    $m_s_Array$().copy__O__I__O__I__I__V(x2.array$6, 0, this.elems$2, this.size$2, x2.length__I());
    this.size$2 = ((this.size$2 + x2.length__I()) | 0);
    return this
  } else {
    return $as_scm_ArrayBuilder$ofInt($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuilder$ofInt.prototype.equals__O__Z = (function(other) {
  if ($is_scm_ArrayBuilder$ofInt(other)) {
    var x2 = $as_scm_ArrayBuilder$ofInt(other);
    return ((this.size$2 === x2.size$2) && (this.elems$2 === x2.elems$2))
  } else {
    return false
  }
});
$c_scm_ArrayBuilder$ofInt.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__I__scm_ArrayBuilder$ofInt($uI(elem))
});
$c_scm_ArrayBuilder$ofInt.prototype.toString__T = (function() {
  return "ArrayBuilder.ofInt"
});
$c_scm_ArrayBuilder$ofInt.prototype.result__O = (function() {
  return this.result__AI()
});
$c_scm_ArrayBuilder$ofInt.prototype.resize__p2__I__V = (function(size) {
  this.elems$2 = this.mkArray__p2__I__AI(size);
  this.capacity$2 = size
});
$c_scm_ArrayBuilder$ofInt.prototype.result__AI = (function() {
  if (((this.capacity$2 !== 0) && (this.capacity$2 === this.size$2))) {
    this.capacity$2 = 0;
    return this.elems$2
  } else {
    return this.mkArray__p2__I__AI(this.size$2)
  }
});
$c_scm_ArrayBuilder$ofInt.prototype.$$plus$eq__I__scm_ArrayBuilder$ofInt = (function(elem) {
  this.ensureSize__p2__I__V(((1 + this.size$2) | 0));
  this.elems$2.set(this.size$2, elem);
  this.size$2 = ((1 + this.size$2) | 0);
  return this
});
$c_scm_ArrayBuilder$ofInt.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__I__scm_ArrayBuilder$ofInt($uI(elem))
});
$c_scm_ArrayBuilder$ofInt.prototype.mkArray__p2__I__AI = (function(size) {
  var newelems = $newArrayObject($d_I.getArrayOf(), [size]);
  if ((this.size$2 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$2, 0, newelems, 0, this.size$2)
  };
  return newelems
});
$c_scm_ArrayBuilder$ofInt.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$2 < size)) {
    this.resize__p2__I__V(size)
  }
});
$c_scm_ArrayBuilder$ofInt.prototype.ensureSize__p2__I__V = (function(size) {
  if (((this.capacity$2 < size) || (this.capacity$2 === 0))) {
    var newsize = ((this.capacity$2 === 0) ? 16 : (this.capacity$2 << 1));
    while ((newsize < size)) {
      newsize = (newsize << 1)
    };
    this.resize__p2__I__V(newsize)
  }
});
$c_scm_ArrayBuilder$ofInt.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofInt(xs)
});
function $is_scm_ArrayBuilder$ofInt(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuilder$ofInt)))
}
function $as_scm_ArrayBuilder$ofInt(obj) {
  return (($is_scm_ArrayBuilder$ofInt(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuilder$ofInt"))
}
function $isArrayOf_scm_ArrayBuilder$ofInt(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuilder$ofInt)))
}
function $asArrayOf_scm_ArrayBuilder$ofInt(obj, depth) {
  return (($isArrayOf_scm_ArrayBuilder$ofInt(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuilder$ofInt;", depth))
}
var $d_scm_ArrayBuilder$ofInt = new $TypeData().initClass({
  scm_ArrayBuilder$ofInt: 0
}, false, "scala.collection.mutable.ArrayBuilder$ofInt", {
  scm_ArrayBuilder$ofInt: 1,
  scm_ArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuilder$ofInt.prototype.$classData = $d_scm_ArrayBuilder$ofInt;
/** @constructor */
function $c_scm_ArrayBuilder$ofLong() {
  $c_scm_ArrayBuilder.call(this);
  this.elems$2 = null;
  this.capacity$2 = 0;
  this.size$2 = 0
}
$c_scm_ArrayBuilder$ofLong.prototype = new $h_scm_ArrayBuilder();
$c_scm_ArrayBuilder$ofLong.prototype.constructor = $c_scm_ArrayBuilder$ofLong;
/** @constructor */
function $h_scm_ArrayBuilder$ofLong() {
  /*<skip>*/
}
$h_scm_ArrayBuilder$ofLong.prototype = $c_scm_ArrayBuilder$ofLong.prototype;
$c_scm_ArrayBuilder$ofLong.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofLong = (function(xs) {
  if ($is_scm_WrappedArray$ofLong(xs)) {
    var x2 = $as_scm_WrappedArray$ofLong(xs);
    this.ensureSize__p2__I__V(((this.size$2 + x2.length__I()) | 0));
    $m_s_Array$().copy__O__I__O__I__I__V(x2.array$6, 0, this.elems$2, this.size$2, x2.length__I());
    this.size$2 = ((this.size$2 + x2.length__I()) | 0);
    return this
  } else {
    return $as_scm_ArrayBuilder$ofLong($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuilder$ofLong.prototype.init___ = (function() {
  this.capacity$2 = 0;
  this.size$2 = 0;
  return this
});
$c_scm_ArrayBuilder$ofLong.prototype.$$plus$eq__J__scm_ArrayBuilder$ofLong = (function(elem) {
  this.ensureSize__p2__I__V(((1 + this.size$2) | 0));
  this.elems$2.set(this.size$2, elem);
  this.size$2 = ((1 + this.size$2) | 0);
  return this
});
$c_scm_ArrayBuilder$ofLong.prototype.equals__O__Z = (function(other) {
  if ($is_scm_ArrayBuilder$ofLong(other)) {
    var x2 = $as_scm_ArrayBuilder$ofLong(other);
    return ((this.size$2 === x2.size$2) && (this.elems$2 === x2.elems$2))
  } else {
    return false
  }
});
$c_scm_ArrayBuilder$ofLong.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__J__scm_ArrayBuilder$ofLong($uJ(elem))
});
$c_scm_ArrayBuilder$ofLong.prototype.result__AJ = (function() {
  if (((this.capacity$2 !== 0) && (this.capacity$2 === this.size$2))) {
    this.capacity$2 = 0;
    return this.elems$2
  } else {
    return this.mkArray__p2__I__AJ(this.size$2)
  }
});
$c_scm_ArrayBuilder$ofLong.prototype.toString__T = (function() {
  return "ArrayBuilder.ofLong"
});
$c_scm_ArrayBuilder$ofLong.prototype.result__O = (function() {
  return this.result__AJ()
});
$c_scm_ArrayBuilder$ofLong.prototype.resize__p2__I__V = (function(size) {
  this.elems$2 = this.mkArray__p2__I__AJ(size);
  this.capacity$2 = size
});
$c_scm_ArrayBuilder$ofLong.prototype.mkArray__p2__I__AJ = (function(size) {
  var newelems = $newArrayObject($d_J.getArrayOf(), [size]);
  if ((this.size$2 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$2, 0, newelems, 0, this.size$2)
  };
  return newelems
});
$c_scm_ArrayBuilder$ofLong.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__J__scm_ArrayBuilder$ofLong($uJ(elem))
});
$c_scm_ArrayBuilder$ofLong.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$2 < size)) {
    this.resize__p2__I__V(size)
  }
});
$c_scm_ArrayBuilder$ofLong.prototype.ensureSize__p2__I__V = (function(size) {
  if (((this.capacity$2 < size) || (this.capacity$2 === 0))) {
    var newsize = ((this.capacity$2 === 0) ? 16 : (this.capacity$2 << 1));
    while ((newsize < size)) {
      newsize = (newsize << 1)
    };
    this.resize__p2__I__V(newsize)
  }
});
$c_scm_ArrayBuilder$ofLong.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofLong(xs)
});
function $is_scm_ArrayBuilder$ofLong(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuilder$ofLong)))
}
function $as_scm_ArrayBuilder$ofLong(obj) {
  return (($is_scm_ArrayBuilder$ofLong(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuilder$ofLong"))
}
function $isArrayOf_scm_ArrayBuilder$ofLong(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuilder$ofLong)))
}
function $asArrayOf_scm_ArrayBuilder$ofLong(obj, depth) {
  return (($isArrayOf_scm_ArrayBuilder$ofLong(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuilder$ofLong;", depth))
}
var $d_scm_ArrayBuilder$ofLong = new $TypeData().initClass({
  scm_ArrayBuilder$ofLong: 0
}, false, "scala.collection.mutable.ArrayBuilder$ofLong", {
  scm_ArrayBuilder$ofLong: 1,
  scm_ArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuilder$ofLong.prototype.$classData = $d_scm_ArrayBuilder$ofLong;
/** @constructor */
function $c_scm_ArrayBuilder$ofRef() {
  $c_scm_ArrayBuilder.call(this);
  this.evidence$2$2 = null;
  this.elems$2 = null;
  this.capacity$2 = 0;
  this.size$2 = 0
}
$c_scm_ArrayBuilder$ofRef.prototype = new $h_scm_ArrayBuilder();
$c_scm_ArrayBuilder$ofRef.prototype.constructor = $c_scm_ArrayBuilder$ofRef;
/** @constructor */
function $h_scm_ArrayBuilder$ofRef() {
  /*<skip>*/
}
$h_scm_ArrayBuilder$ofRef.prototype = $c_scm_ArrayBuilder$ofRef.prototype;
$c_scm_ArrayBuilder$ofRef.prototype.init___s_reflect_ClassTag = (function(evidence$2) {
  this.evidence$2$2 = evidence$2;
  this.capacity$2 = 0;
  this.size$2 = 0;
  return this
});
$c_scm_ArrayBuilder$ofRef.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofRef = (function(xs) {
  if ($is_scm_WrappedArray$ofRef(xs)) {
    var x2 = $as_scm_WrappedArray$ofRef(xs);
    this.ensureSize__p2__I__V(((this.size$2 + x2.length__I()) | 0));
    $m_s_Array$().copy__O__I__O__I__I__V(x2.array$6, 0, this.elems$2, this.size$2, x2.length__I());
    this.size$2 = ((this.size$2 + x2.length__I()) | 0);
    return this
  } else {
    return $as_scm_ArrayBuilder$ofRef($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuilder$ofRef.prototype.equals__O__Z = (function(other) {
  if ($is_scm_ArrayBuilder$ofRef(other)) {
    var x2 = $as_scm_ArrayBuilder$ofRef(other);
    return ((this.size$2 === x2.size$2) && (this.elems$2 === x2.elems$2))
  } else {
    return false
  }
});
$c_scm_ArrayBuilder$ofRef.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuilder$ofRef(elem)
});
$c_scm_ArrayBuilder$ofRef.prototype.toString__T = (function() {
  return "ArrayBuilder.ofRef"
});
$c_scm_ArrayBuilder$ofRef.prototype.result__O = (function() {
  return this.result__AO()
});
$c_scm_ArrayBuilder$ofRef.prototype.resize__p2__I__V = (function(size) {
  this.elems$2 = this.mkArray__p2__I__AO(size);
  this.capacity$2 = size
});
$c_scm_ArrayBuilder$ofRef.prototype.$$plus$eq__O__scm_ArrayBuilder$ofRef = (function(elem) {
  this.ensureSize__p2__I__V(((1 + this.size$2) | 0));
  this.elems$2.set(this.size$2, elem);
  this.size$2 = ((1 + this.size$2) | 0);
  return this
});
$c_scm_ArrayBuilder$ofRef.prototype.result__AO = (function() {
  if (((this.capacity$2 !== 0) && (this.capacity$2 === this.size$2))) {
    this.capacity$2 = 0;
    return this.elems$2
  } else {
    return this.mkArray__p2__I__AO(this.size$2)
  }
});
$c_scm_ArrayBuilder$ofRef.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuilder$ofRef(elem)
});
$c_scm_ArrayBuilder$ofRef.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$2 < size)) {
    this.resize__p2__I__V(size)
  }
});
$c_scm_ArrayBuilder$ofRef.prototype.ensureSize__p2__I__V = (function(size) {
  if (((this.capacity$2 < size) || (this.capacity$2 === 0))) {
    var newsize = ((this.capacity$2 === 0) ? 16 : (this.capacity$2 << 1));
    while ((newsize < size)) {
      newsize = (newsize << 1)
    };
    this.resize__p2__I__V(newsize)
  }
});
$c_scm_ArrayBuilder$ofRef.prototype.mkArray__p2__I__AO = (function(size) {
  var newelems = $asArrayOf_O(this.evidence$2$2.newArray__I__O(size), 1);
  if ((this.size$2 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$2, 0, newelems, 0, this.size$2)
  };
  return newelems
});
$c_scm_ArrayBuilder$ofRef.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofRef(xs)
});
function $is_scm_ArrayBuilder$ofRef(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuilder$ofRef)))
}
function $as_scm_ArrayBuilder$ofRef(obj) {
  return (($is_scm_ArrayBuilder$ofRef(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuilder$ofRef"))
}
function $isArrayOf_scm_ArrayBuilder$ofRef(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuilder$ofRef)))
}
function $asArrayOf_scm_ArrayBuilder$ofRef(obj, depth) {
  return (($isArrayOf_scm_ArrayBuilder$ofRef(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuilder$ofRef;", depth))
}
var $d_scm_ArrayBuilder$ofRef = new $TypeData().initClass({
  scm_ArrayBuilder$ofRef: 0
}, false, "scala.collection.mutable.ArrayBuilder$ofRef", {
  scm_ArrayBuilder$ofRef: 1,
  scm_ArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuilder$ofRef.prototype.$classData = $d_scm_ArrayBuilder$ofRef;
/** @constructor */
function $c_scm_ArrayBuilder$ofShort() {
  $c_scm_ArrayBuilder.call(this);
  this.elems$2 = null;
  this.capacity$2 = 0;
  this.size$2 = 0
}
$c_scm_ArrayBuilder$ofShort.prototype = new $h_scm_ArrayBuilder();
$c_scm_ArrayBuilder$ofShort.prototype.constructor = $c_scm_ArrayBuilder$ofShort;
/** @constructor */
function $h_scm_ArrayBuilder$ofShort() {
  /*<skip>*/
}
$h_scm_ArrayBuilder$ofShort.prototype = $c_scm_ArrayBuilder$ofShort.prototype;
$c_scm_ArrayBuilder$ofShort.prototype.init___ = (function() {
  this.capacity$2 = 0;
  this.size$2 = 0;
  return this
});
$c_scm_ArrayBuilder$ofShort.prototype.equals__O__Z = (function(other) {
  if ($is_scm_ArrayBuilder$ofShort(other)) {
    var x2 = $as_scm_ArrayBuilder$ofShort(other);
    return ((this.size$2 === x2.size$2) && (this.elems$2 === x2.elems$2))
  } else {
    return false
  }
});
$c_scm_ArrayBuilder$ofShort.prototype.$$plus$eq__S__scm_ArrayBuilder$ofShort = (function(elem) {
  this.ensureSize__p2__I__V(((1 + this.size$2) | 0));
  this.elems$2.set(this.size$2, elem);
  this.size$2 = ((1 + this.size$2) | 0);
  return this
});
$c_scm_ArrayBuilder$ofShort.prototype.result__AS = (function() {
  if (((this.capacity$2 !== 0) && (this.capacity$2 === this.size$2))) {
    this.capacity$2 = 0;
    return this.elems$2
  } else {
    return this.mkArray__p2__I__AS(this.size$2)
  }
});
$c_scm_ArrayBuilder$ofShort.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__S__scm_ArrayBuilder$ofShort($uS(elem))
});
$c_scm_ArrayBuilder$ofShort.prototype.toString__T = (function() {
  return "ArrayBuilder.ofShort"
});
$c_scm_ArrayBuilder$ofShort.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofShort = (function(xs) {
  if ($is_scm_WrappedArray$ofShort(xs)) {
    var x2 = $as_scm_WrappedArray$ofShort(xs);
    this.ensureSize__p2__I__V(((this.size$2 + x2.length__I()) | 0));
    $m_s_Array$().copy__O__I__O__I__I__V(x2.array$6, 0, this.elems$2, this.size$2, x2.length__I());
    this.size$2 = ((this.size$2 + x2.length__I()) | 0);
    return this
  } else {
    return $as_scm_ArrayBuilder$ofShort($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuilder$ofShort.prototype.result__O = (function() {
  return this.result__AS()
});
$c_scm_ArrayBuilder$ofShort.prototype.resize__p2__I__V = (function(size) {
  this.elems$2 = this.mkArray__p2__I__AS(size);
  this.capacity$2 = size
});
$c_scm_ArrayBuilder$ofShort.prototype.mkArray__p2__I__AS = (function(size) {
  var newelems = $newArrayObject($d_S.getArrayOf(), [size]);
  if ((this.size$2 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$2, 0, newelems, 0, this.size$2)
  };
  return newelems
});
$c_scm_ArrayBuilder$ofShort.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__S__scm_ArrayBuilder$ofShort($uS(elem))
});
$c_scm_ArrayBuilder$ofShort.prototype.sizeHint__I__V = (function(size) {
  if ((this.capacity$2 < size)) {
    this.resize__p2__I__V(size)
  }
});
$c_scm_ArrayBuilder$ofShort.prototype.ensureSize__p2__I__V = (function(size) {
  if (((this.capacity$2 < size) || (this.capacity$2 === 0))) {
    var newsize = ((this.capacity$2 === 0) ? 16 : (this.capacity$2 << 1));
    while ((newsize < size)) {
      newsize = (newsize << 1)
    };
    this.resize__p2__I__V(newsize)
  }
});
$c_scm_ArrayBuilder$ofShort.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofShort(xs)
});
function $is_scm_ArrayBuilder$ofShort(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuilder$ofShort)))
}
function $as_scm_ArrayBuilder$ofShort(obj) {
  return (($is_scm_ArrayBuilder$ofShort(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuilder$ofShort"))
}
function $isArrayOf_scm_ArrayBuilder$ofShort(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuilder$ofShort)))
}
function $asArrayOf_scm_ArrayBuilder$ofShort(obj, depth) {
  return (($isArrayOf_scm_ArrayBuilder$ofShort(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuilder$ofShort;", depth))
}
var $d_scm_ArrayBuilder$ofShort = new $TypeData().initClass({
  scm_ArrayBuilder$ofShort: 0
}, false, "scala.collection.mutable.ArrayBuilder$ofShort", {
  scm_ArrayBuilder$ofShort: 1,
  scm_ArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuilder$ofShort.prototype.$classData = $d_scm_ArrayBuilder$ofShort;
/** @constructor */
function $c_scm_ArrayBuilder$ofUnit() {
  $c_scm_ArrayBuilder.call(this);
  this.size$2 = 0
}
$c_scm_ArrayBuilder$ofUnit.prototype = new $h_scm_ArrayBuilder();
$c_scm_ArrayBuilder$ofUnit.prototype.constructor = $c_scm_ArrayBuilder$ofUnit;
/** @constructor */
function $h_scm_ArrayBuilder$ofUnit() {
  /*<skip>*/
}
$h_scm_ArrayBuilder$ofUnit.prototype = $c_scm_ArrayBuilder$ofUnit.prototype;
$c_scm_ArrayBuilder$ofUnit.prototype.init___ = (function() {
  this.size$2 = 0;
  return this
});
$c_scm_ArrayBuilder$ofUnit.prototype.equals__O__Z = (function(other) {
  if ($is_scm_ArrayBuilder$ofUnit(other)) {
    var x2 = $as_scm_ArrayBuilder$ofUnit(other);
    return (this.size$2 === x2.size$2)
  } else {
    return false
  }
});
$c_scm_ArrayBuilder$ofUnit.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__sr_BoxedUnit__scm_ArrayBuilder$ofUnit($asUnit(elem))
});
$c_scm_ArrayBuilder$ofUnit.prototype.toString__T = (function() {
  return "ArrayBuilder.ofUnit"
});
$c_scm_ArrayBuilder$ofUnit.prototype.$$plus$eq__sr_BoxedUnit__scm_ArrayBuilder$ofUnit = (function(elem) {
  this.size$2 = ((1 + this.size$2) | 0);
  return this
});
$c_scm_ArrayBuilder$ofUnit.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofUnit = (function(xs) {
  this.size$2 = ((this.size$2 + xs.size__I()) | 0);
  return this
});
$c_scm_ArrayBuilder$ofUnit.prototype.result__O = (function() {
  return this.result__Asr_BoxedUnit()
});
$c_scm_ArrayBuilder$ofUnit.prototype.result__Asr_BoxedUnit = (function() {
  var ans = $newArrayObject($d_sr_BoxedUnit.getArrayOf(), [this.size$2]);
  var i = 0;
  while ((i < this.size$2)) {
    ans.set(i, (void 0));
    i = ((1 + i) | 0)
  };
  return ans
});
$c_scm_ArrayBuilder$ofUnit.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__sr_BoxedUnit__scm_ArrayBuilder$ofUnit($asUnit(elem))
});
$c_scm_ArrayBuilder$ofUnit.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuilder$ofUnit(xs)
});
function $is_scm_ArrayBuilder$ofUnit(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuilder$ofUnit)))
}
function $as_scm_ArrayBuilder$ofUnit(obj) {
  return (($is_scm_ArrayBuilder$ofUnit(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuilder$ofUnit"))
}
function $isArrayOf_scm_ArrayBuilder$ofUnit(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuilder$ofUnit)))
}
function $asArrayOf_scm_ArrayBuilder$ofUnit(obj, depth) {
  return (($isArrayOf_scm_ArrayBuilder$ofUnit(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuilder$ofUnit;", depth))
}
var $d_scm_ArrayBuilder$ofUnit = new $TypeData().initClass({
  scm_ArrayBuilder$ofUnit: 0
}, false, "scala.collection.mutable.ArrayBuilder$ofUnit", {
  scm_ArrayBuilder$ofUnit: 1,
  scm_ArrayBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuilder$ofUnit.prototype.$classData = $d_scm_ArrayBuilder$ofUnit;
/** @constructor */
function $c_sjs_js_JavaScriptException() {
  $c_jl_RuntimeException.call(this);
  this.exception$4 = null
}
$c_sjs_js_JavaScriptException.prototype = new $h_jl_RuntimeException();
$c_sjs_js_JavaScriptException.prototype.constructor = $c_sjs_js_JavaScriptException;
/** @constructor */
function $h_sjs_js_JavaScriptException() {
  /*<skip>*/
}
$h_sjs_js_JavaScriptException.prototype = $c_sjs_js_JavaScriptException.prototype;
$c_sjs_js_JavaScriptException.prototype.productPrefix__T = (function() {
  return "JavaScriptException"
});
$c_sjs_js_JavaScriptException.prototype.productArity__I = (function() {
  return 1
});
$c_sjs_js_JavaScriptException.prototype.fillInStackTrace__jl_Throwable = (function() {
  var e = this.exception$4;
  this.stackdata = e;
  return this
});
$c_sjs_js_JavaScriptException.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_sjs_js_JavaScriptException(x$1)) {
    var JavaScriptException$1 = $as_sjs_js_JavaScriptException(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.exception$4, JavaScriptException$1.exception$4)
  } else {
    return false
  }
});
$c_sjs_js_JavaScriptException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.exception$4;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sjs_js_JavaScriptException.prototype.getMessage__T = (function() {
  return $objectToString(this.exception$4)
});
$c_sjs_js_JavaScriptException.prototype.init___O = (function(exception) {
  this.exception$4 = exception;
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_sjs_js_JavaScriptException.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_sjs_js_JavaScriptException.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_sjs_js_JavaScriptException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_JavaScriptException)))
}
function $as_sjs_js_JavaScriptException(obj) {
  return (($is_sjs_js_JavaScriptException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"))
}
function $isArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
}
function $asArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (($isArrayOf_sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth))
}
var $d_sjs_js_JavaScriptException = new $TypeData().initClass({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
$c_sjs_js_JavaScriptException.prototype.$classData = $d_sjs_js_JavaScriptException;
/** @constructor */
function $c_s_reflect_ManifestFactory$BooleanManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$BooleanManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$BooleanManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$BooleanManifest$.prototype = $c_s_reflect_ManifestFactory$BooleanManifest$.prototype;
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.init___ = (function() {
  this.toString$1 = "Boolean";
  return this
});
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_Z.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_Z.getClassOf()
});
var $d_s_reflect_ManifestFactory$BooleanManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$BooleanManifest$: 0
}, false, "scala.reflect.ManifestFactory$BooleanManifest$", {
  s_reflect_ManifestFactory$BooleanManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$BooleanManifest$;
var $n_s_reflect_ManifestFactory$BooleanManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$BooleanManifest$() {
  if ((!$n_s_reflect_ManifestFactory$BooleanManifest$)) {
    $n_s_reflect_ManifestFactory$BooleanManifest$ = new $c_s_reflect_ManifestFactory$BooleanManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$BooleanManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ByteManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$ByteManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ByteManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ByteManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ByteManifest$.prototype = $c_s_reflect_ManifestFactory$ByteManifest$.prototype;
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.init___ = (function() {
  this.toString$1 = "Byte";
  return this
});
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_B.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_B.getClassOf()
});
var $d_s_reflect_ManifestFactory$ByteManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ByteManifest$: 0
}, false, "scala.reflect.ManifestFactory$ByteManifest$", {
  s_reflect_ManifestFactory$ByteManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ByteManifest$;
var $n_s_reflect_ManifestFactory$ByteManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ByteManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ByteManifest$)) {
    $n_s_reflect_ManifestFactory$ByteManifest$ = new $c_s_reflect_ManifestFactory$ByteManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ByteManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$CharManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$CharManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$CharManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$CharManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$CharManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$CharManifest$.prototype = $c_s_reflect_ManifestFactory$CharManifest$.prototype;
$c_s_reflect_ManifestFactory$CharManifest$.prototype.init___ = (function() {
  this.toString$1 = "Char";
  return this
});
$c_s_reflect_ManifestFactory$CharManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_C.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$CharManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_C.getClassOf()
});
var $d_s_reflect_ManifestFactory$CharManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$CharManifest$: 0
}, false, "scala.reflect.ManifestFactory$CharManifest$", {
  s_reflect_ManifestFactory$CharManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$CharManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$CharManifest$;
var $n_s_reflect_ManifestFactory$CharManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$CharManifest$() {
  if ((!$n_s_reflect_ManifestFactory$CharManifest$)) {
    $n_s_reflect_ManifestFactory$CharManifest$ = new $c_s_reflect_ManifestFactory$CharManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$CharManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$DoubleManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$DoubleManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$DoubleManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$DoubleManifest$.prototype = $c_s_reflect_ManifestFactory$DoubleManifest$.prototype;
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.init___ = (function() {
  this.toString$1 = "Double";
  return this
});
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_D.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_D.getClassOf()
});
var $d_s_reflect_ManifestFactory$DoubleManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$DoubleManifest$: 0
}, false, "scala.reflect.ManifestFactory$DoubleManifest$", {
  s_reflect_ManifestFactory$DoubleManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$DoubleManifest$;
var $n_s_reflect_ManifestFactory$DoubleManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$DoubleManifest$() {
  if ((!$n_s_reflect_ManifestFactory$DoubleManifest$)) {
    $n_s_reflect_ManifestFactory$DoubleManifest$ = new $c_s_reflect_ManifestFactory$DoubleManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$DoubleManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$FloatManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$FloatManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$FloatManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$FloatManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$FloatManifest$.prototype = $c_s_reflect_ManifestFactory$FloatManifest$.prototype;
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.init___ = (function() {
  this.toString$1 = "Float";
  return this
});
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_F.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_F.getClassOf()
});
var $d_s_reflect_ManifestFactory$FloatManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$FloatManifest$: 0
}, false, "scala.reflect.ManifestFactory$FloatManifest$", {
  s_reflect_ManifestFactory$FloatManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$FloatManifest$;
var $n_s_reflect_ManifestFactory$FloatManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$FloatManifest$() {
  if ((!$n_s_reflect_ManifestFactory$FloatManifest$)) {
    $n_s_reflect_ManifestFactory$FloatManifest$ = new $c_s_reflect_ManifestFactory$FloatManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$FloatManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$IntManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$IntManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$IntManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$IntManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$IntManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$IntManifest$.prototype = $c_s_reflect_ManifestFactory$IntManifest$.prototype;
$c_s_reflect_ManifestFactory$IntManifest$.prototype.init___ = (function() {
  this.toString$1 = "Int";
  return this
});
$c_s_reflect_ManifestFactory$IntManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_I.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$IntManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_I.getClassOf()
});
var $d_s_reflect_ManifestFactory$IntManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$IntManifest$: 0
}, false, "scala.reflect.ManifestFactory$IntManifest$", {
  s_reflect_ManifestFactory$IntManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$IntManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$IntManifest$;
var $n_s_reflect_ManifestFactory$IntManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$IntManifest$() {
  if ((!$n_s_reflect_ManifestFactory$IntManifest$)) {
    $n_s_reflect_ManifestFactory$IntManifest$ = new $c_s_reflect_ManifestFactory$IntManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$IntManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$LongManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$LongManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$LongManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$LongManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$LongManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$LongManifest$.prototype = $c_s_reflect_ManifestFactory$LongManifest$.prototype;
$c_s_reflect_ManifestFactory$LongManifest$.prototype.init___ = (function() {
  this.toString$1 = "Long";
  return this
});
$c_s_reflect_ManifestFactory$LongManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_J.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$LongManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_J.getClassOf()
});
var $d_s_reflect_ManifestFactory$LongManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$LongManifest$: 0
}, false, "scala.reflect.ManifestFactory$LongManifest$", {
  s_reflect_ManifestFactory$LongManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$LongManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$LongManifest$;
var $n_s_reflect_ManifestFactory$LongManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$LongManifest$() {
  if ((!$n_s_reflect_ManifestFactory$LongManifest$)) {
    $n_s_reflect_ManifestFactory$LongManifest$ = new $c_s_reflect_ManifestFactory$LongManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$LongManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$PhantomManifest() {
  $c_s_reflect_ManifestFactory$ClassTypeManifest.call(this);
  this.toString$2 = null
}
$c_s_reflect_ManifestFactory$PhantomManifest.prototype = new $h_s_reflect_ManifestFactory$ClassTypeManifest();
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.constructor = $c_s_reflect_ManifestFactory$PhantomManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$PhantomManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$PhantomManifest.prototype = $c_s_reflect_ManifestFactory$PhantomManifest.prototype;
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.toString__T = (function() {
  return this.toString$2
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ShortManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$ShortManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ShortManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ShortManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ShortManifest$.prototype = $c_s_reflect_ManifestFactory$ShortManifest$.prototype;
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.init___ = (function() {
  this.toString$1 = "Short";
  return this
});
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_S.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_S.getClassOf()
});
var $d_s_reflect_ManifestFactory$ShortManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ShortManifest$: 0
}, false, "scala.reflect.ManifestFactory$ShortManifest$", {
  s_reflect_ManifestFactory$ShortManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ShortManifest$;
var $n_s_reflect_ManifestFactory$ShortManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ShortManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ShortManifest$)) {
    $n_s_reflect_ManifestFactory$ShortManifest$ = new $c_s_reflect_ManifestFactory$ShortManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ShortManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$UnitManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$UnitManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$UnitManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$UnitManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$UnitManifest$.prototype = $c_s_reflect_ManifestFactory$UnitManifest$.prototype;
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.init___ = (function() {
  this.toString$1 = "Unit";
  return this
});
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_sr_BoxedUnit.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_V.getClassOf()
});
var $d_s_reflect_ManifestFactory$UnitManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$UnitManifest$: 0
}, false, "scala.reflect.ManifestFactory$UnitManifest$", {
  s_reflect_ManifestFactory$UnitManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$UnitManifest$;
var $n_s_reflect_ManifestFactory$UnitManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$UnitManifest$() {
  if ((!$n_s_reflect_ManifestFactory$UnitManifest$)) {
    $n_s_reflect_ManifestFactory$UnitManifest$ = new $c_s_reflect_ManifestFactory$UnitManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$UnitManifest$
}
function $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that) {
  var these = $thiz.iterator__sc_Iterator();
  var those = that.iterator__sc_Iterator();
  while ((these.hasNext__Z() && those.hasNext__Z())) {
    if ((!$m_sr_BoxesRunTime$().equals__O__O__Z(these.next__O(), those.next__O()))) {
      return false
    }
  };
  return ((!these.hasNext__Z()) && (!those.hasNext__Z()))
}
function $f_sc_IterableLike__take__I__O($thiz, n) {
  var b = $thiz.newBuilder__scm_Builder();
  if ((n <= 0)) {
    return b.result__O()
  } else {
    b.sizeHintBounded__I__sc_TraversableLike__V(n, $thiz);
    var i = 0;
    var it = $thiz.iterator__sc_Iterator();
    while (((i < n) && it.hasNext__Z())) {
      b.$$plus$eq__O__scm_Builder(it.next__O());
      i = ((1 + i) | 0)
    };
    return b.result__O()
  }
}
function $f_sc_IterableLike__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var i = start;
  var x = ((start + len) | 0);
  var that = $m_sr_ScalaRunTime$().array$undlength__O__I(xs);
  var end = ((x < that) ? x : that);
  var it = $thiz.iterator__sc_Iterator();
  while (((i < end) && it.hasNext__Z())) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, it.next__O());
    i = ((1 + i) | 0)
  }
}
/** @constructor */
function $c_sci_List$() {
  $c_scg_SeqFactory.call(this);
  this.partialNotApplied$5 = null
}
$c_sci_List$.prototype = new $h_scg_SeqFactory();
$c_sci_List$.prototype.constructor = $c_sci_List$;
/** @constructor */
function $h_sci_List$() {
  /*<skip>*/
}
$h_sci_List$.prototype = $c_sci_List$.prototype;
$c_sci_List$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sci_List$ = this;
  this.partialNotApplied$5 = new $c_sci_List$$anon$1().init___();
  return this
});
$c_sci_List$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_List$ = new $TypeData().initClass({
  sci_List$: 0
}, false, "scala.collection.immutable.List$", {
  sci_List$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_List$.prototype.$classData = $d_sci_List$;
var $n_sci_List$ = (void 0);
function $m_sci_List$() {
  if ((!$n_sci_List$)) {
    $n_sci_List$ = new $c_sci_List$().init___()
  };
  return $n_sci_List$
}
/** @constructor */
function $c_sci_Stream$() {
  $c_scg_SeqFactory.call(this)
}
$c_sci_Stream$.prototype = new $h_scg_SeqFactory();
$c_sci_Stream$.prototype.constructor = $c_sci_Stream$;
/** @constructor */
function $h_sci_Stream$() {
  /*<skip>*/
}
$h_sci_Stream$.prototype = $c_sci_Stream$.prototype;
$c_sci_Stream$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Stream$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_Stream$StreamBuilder().init___()
});
var $d_sci_Stream$ = new $TypeData().initClass({
  sci_Stream$: 0
}, false, "scala.collection.immutable.Stream$", {
  sci_Stream$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$.prototype.$classData = $d_sci_Stream$;
var $n_sci_Stream$ = (void 0);
function $m_sci_Stream$() {
  if ((!$n_sci_Stream$)) {
    $n_sci_Stream$ = new $c_sci_Stream$().init___()
  };
  return $n_sci_Stream$
}
/** @constructor */
function $c_scm_ArrayBuffer$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_ArrayBuffer$.prototype = new $h_scg_SeqFactory();
$c_scm_ArrayBuffer$.prototype.constructor = $c_scm_ArrayBuffer$;
/** @constructor */
function $h_scm_ArrayBuffer$() {
  /*<skip>*/
}
$h_scm_ArrayBuffer$.prototype = $c_scm_ArrayBuffer$.prototype;
$c_scm_ArrayBuffer$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_ArrayBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_ArrayBuffer$ = new $TypeData().initClass({
  scm_ArrayBuffer$: 0
}, false, "scala.collection.mutable.ArrayBuffer$", {
  scm_ArrayBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer$.prototype.$classData = $d_scm_ArrayBuffer$;
var $n_scm_ArrayBuffer$ = (void 0);
function $m_scm_ArrayBuffer$() {
  if ((!$n_scm_ArrayBuffer$)) {
    $n_scm_ArrayBuffer$ = new $c_scm_ArrayBuffer$().init___()
  };
  return $n_scm_ArrayBuffer$
}
/** @constructor */
function $c_scm_ListBuffer$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_ListBuffer$.prototype = new $h_scg_SeqFactory();
$c_scm_ListBuffer$.prototype.constructor = $c_scm_ListBuffer$;
/** @constructor */
function $h_scm_ListBuffer$() {
  /*<skip>*/
}
$h_scm_ListBuffer$.prototype = $c_scm_ListBuffer$.prototype;
$c_scm_ListBuffer$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_ListBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_ListBuffer().init___())
});
var $d_scm_ListBuffer$ = new $TypeData().initClass({
  scm_ListBuffer$: 0
}, false, "scala.collection.mutable.ListBuffer$", {
  scm_ListBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer$.prototype.$classData = $d_scm_ListBuffer$;
var $n_scm_ListBuffer$ = (void 0);
function $m_scm_ListBuffer$() {
  if ((!$n_scm_ListBuffer$)) {
    $n_scm_ListBuffer$ = new $c_scm_ListBuffer$().init___()
  };
  return $n_scm_ListBuffer$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$AnyManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$AnyManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$AnyManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$AnyManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$AnyManifest$.prototype = $c_s_reflect_ManifestFactory$AnyManifest$.prototype;
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.init___ = (function() {
  this.toString$2 = "Any";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_O.getClassOf()
});
var $d_s_reflect_ManifestFactory$AnyManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$AnyManifest$: 0
}, false, "scala.reflect.ManifestFactory$AnyManifest$", {
  s_reflect_ManifestFactory$AnyManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$AnyManifest$;
var $n_s_reflect_ManifestFactory$AnyManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$AnyManifest$() {
  if ((!$n_s_reflect_ManifestFactory$AnyManifest$)) {
    $n_s_reflect_ManifestFactory$AnyManifest$ = new $c_s_reflect_ManifestFactory$AnyManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$AnyManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$AnyValManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$AnyValManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$AnyValManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$AnyValManifest$.prototype = $c_s_reflect_ManifestFactory$AnyValManifest$.prototype;
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.init___ = (function() {
  this.toString$2 = "AnyVal";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_O.getClassOf()
});
var $d_s_reflect_ManifestFactory$AnyValManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$AnyValManifest$: 0
}, false, "scala.reflect.ManifestFactory$AnyValManifest$", {
  s_reflect_ManifestFactory$AnyValManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$AnyValManifest$;
var $n_s_reflect_ManifestFactory$AnyValManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$AnyValManifest$() {
  if ((!$n_s_reflect_ManifestFactory$AnyValManifest$)) {
    $n_s_reflect_ManifestFactory$AnyValManifest$ = new $c_s_reflect_ManifestFactory$AnyValManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$AnyValManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$NothingManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$NothingManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$NothingManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$NothingManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$NothingManifest$.prototype = $c_s_reflect_ManifestFactory$NothingManifest$.prototype;
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.init___ = (function() {
  this.toString$2 = "Nothing";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_sr_Nothing$.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_sr_Nothing$.getClassOf()
});
var $d_s_reflect_ManifestFactory$NothingManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NothingManifest$: 0
}, false, "scala.reflect.ManifestFactory$NothingManifest$", {
  s_reflect_ManifestFactory$NothingManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NothingManifest$;
var $n_s_reflect_ManifestFactory$NothingManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$NothingManifest$() {
  if ((!$n_s_reflect_ManifestFactory$NothingManifest$)) {
    $n_s_reflect_ManifestFactory$NothingManifest$ = new $c_s_reflect_ManifestFactory$NothingManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NothingManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$NullManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$NullManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$NullManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$NullManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$NullManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$NullManifest$.prototype = $c_s_reflect_ManifestFactory$NullManifest$.prototype;
$c_s_reflect_ManifestFactory$NullManifest$.prototype.init___ = (function() {
  this.toString$2 = "Null";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_sr_Null$.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_sr_Null$.getClassOf()
});
var $d_s_reflect_ManifestFactory$NullManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NullManifest$: 0
}, false, "scala.reflect.ManifestFactory$NullManifest$", {
  s_reflect_ManifestFactory$NullManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NullManifest$;
var $n_s_reflect_ManifestFactory$NullManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$NullManifest$() {
  if ((!$n_s_reflect_ManifestFactory$NullManifest$)) {
    $n_s_reflect_ManifestFactory$NullManifest$ = new $c_s_reflect_ManifestFactory$NullManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NullManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ObjectManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ObjectManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ObjectManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ObjectManifest$.prototype = $c_s_reflect_ManifestFactory$ObjectManifest$.prototype;
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.init___ = (function() {
  this.toString$2 = "Object";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.newArray__I__O = (function(len) {
  return $newArrayObject($d_O.getArrayOf(), [len])
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.runtimeClass__jl_Class = (function() {
  return $d_O.getClassOf()
});
var $d_s_reflect_ManifestFactory$ObjectManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ObjectManifest$: 0
}, false, "scala.reflect.ManifestFactory$ObjectManifest$", {
  s_reflect_ManifestFactory$ObjectManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ObjectManifest$;
var $n_s_reflect_ManifestFactory$ObjectManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ObjectManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ObjectManifest$)) {
    $n_s_reflect_ManifestFactory$ObjectManifest$ = new $c_s_reflect_ManifestFactory$ObjectManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ObjectManifest$
}
function $is_sc_GenMap(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenMap)))
}
function $as_sc_GenMap(obj) {
  return (($is_sc_GenMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenMap"))
}
function $isArrayOf_sc_GenMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenMap)))
}
function $asArrayOf_sc_GenMap(obj, depth) {
  return (($isArrayOf_sc_GenMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenMap;", depth))
}
function $is_sc_GenSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSeq)))
}
function $as_sc_GenSeq(obj) {
  return (($is_sc_GenSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenSeq"))
}
function $isArrayOf_sc_GenSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSeq)))
}
function $asArrayOf_sc_GenSeq(obj, depth) {
  return (($isArrayOf_sc_GenSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenSeq;", depth))
}
/** @constructor */
function $c_sci_Vector$() {
  $c_scg_IndexedSeqFactory.call(this);
  this.NIL$6 = null
}
$c_sci_Vector$.prototype = new $h_scg_IndexedSeqFactory();
$c_sci_Vector$.prototype.constructor = $c_sci_Vector$;
/** @constructor */
function $h_sci_Vector$() {
  /*<skip>*/
}
$h_sci_Vector$.prototype = $c_sci_Vector$.prototype;
$c_sci_Vector$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sci_Vector$ = this;
  this.NIL$6 = new $c_sci_Vector().init___I__I__I(0, 0, 0);
  return this
});
$c_sci_Vector$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_VectorBuilder().init___()
});
var $d_sci_Vector$ = new $TypeData().initClass({
  sci_Vector$: 0
}, false, "scala.collection.immutable.Vector$", {
  sci_Vector$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector$.prototype.$classData = $d_sci_Vector$;
var $n_sci_Vector$ = (void 0);
function $m_sci_Vector$() {
  if ((!$n_sci_Vector$)) {
    $n_sci_Vector$ = new $c_sci_Vector$().init___()
  };
  return $n_sci_Vector$
}
/** @constructor */
function $c_s_math_Numeric$IntIsIntegral$() {
  $c_O.call(this)
}
$c_s_math_Numeric$IntIsIntegral$.prototype = new $h_O();
$c_s_math_Numeric$IntIsIntegral$.prototype.constructor = $c_s_math_Numeric$IntIsIntegral$;
/** @constructor */
function $h_s_math_Numeric$IntIsIntegral$() {
  /*<skip>*/
}
$h_s_math_Numeric$IntIsIntegral$.prototype = $c_s_math_Numeric$IntIsIntegral$.prototype;
$c_s_math_Numeric$IntIsIntegral$.prototype.init___ = (function() {
  return this
});
$c_s_math_Numeric$IntIsIntegral$.prototype.plus__O__O__O = (function(x, y) {
  var x$1 = $uI(x);
  var y$1 = $uI(y);
  return $f_s_math_Numeric$IntIsIntegral__plus__I__I__I(this, x$1, y$1)
});
$c_s_math_Numeric$IntIsIntegral$.prototype.fromInt__I__O = (function(x) {
  return x
});
$c_s_math_Numeric$IntIsIntegral$.prototype.toInt__O__I = (function(x) {
  var x$1 = $uI(x);
  return x$1
});
var $d_s_math_Numeric$IntIsIntegral$ = new $TypeData().initClass({
  s_math_Numeric$IntIsIntegral$: 0
}, false, "scala.math.Numeric$IntIsIntegral$", {
  s_math_Numeric$IntIsIntegral$: 1,
  O: 1,
  s_math_Numeric$IntIsIntegral: 1,
  s_math_Integral: 1,
  s_math_Numeric: 1,
  s_math_Ordering: 1,
  ju_Comparator: 1,
  s_math_PartialOrdering: 1,
  s_math_Equiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_math_Ordering$IntOrdering: 1
});
$c_s_math_Numeric$IntIsIntegral$.prototype.$classData = $d_s_math_Numeric$IntIsIntegral$;
var $n_s_math_Numeric$IntIsIntegral$ = (void 0);
function $m_s_math_Numeric$IntIsIntegral$() {
  if ((!$n_s_math_Numeric$IntIsIntegral$)) {
    $n_s_math_Numeric$IntIsIntegral$ = new $c_s_math_Numeric$IntIsIntegral$().init___()
  };
  return $n_s_math_Numeric$IntIsIntegral$
}
/** @constructor */
function $c_sc_AbstractTraversable() {
  $c_O.call(this)
}
$c_sc_AbstractTraversable.prototype = new $h_O();
$c_sc_AbstractTraversable.prototype.constructor = $c_sc_AbstractTraversable;
/** @constructor */
function $h_sc_AbstractTraversable() {
  /*<skip>*/
}
$h_sc_AbstractTraversable.prototype = $c_sc_AbstractTraversable.prototype;
$c_sc_AbstractTraversable.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_sc_AbstractTraversable.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_sc_AbstractTraversable.prototype.foldLeft__O__F2__O = (function(z, op) {
  return $f_sc_TraversableOnce__foldLeft__O__F2__O(this, z, op)
});
$c_sc_AbstractTraversable.prototype.toBuffer__scm_Buffer = (function() {
  var this$1 = $m_scm_ArrayBuffer$();
  var cbf = this$1.ReusableCBFInstance$2;
  return $as_scm_Buffer($f_sc_TraversableLike__to__scg_CanBuildFrom__O(this, cbf))
});
$c_sc_AbstractTraversable.prototype.sizeHintIfCheap__I = (function() {
  return (-1)
});
$c_sc_AbstractTraversable.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractTraversable.prototype.repr__O = (function() {
  return this
});
$c_sc_AbstractTraversable.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_sc_AbstractTraversable.prototype.toArray__s_reflect_ClassTag__O = (function(evidence$1) {
  return $f_sc_TraversableOnce__toArray__s_reflect_ClassTag__O(this, evidence$1)
});
$c_sc_AbstractTraversable.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  return $f_sc_TraversableLike__map__F1__scg_CanBuildFrom__O(this, f, bf)
});
$c_sc_AbstractTraversable.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
$c_sc_AbstractTraversable.prototype.newBuilder__scm_Builder = (function() {
  return this.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
$c_sc_AbstractTraversable.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $f_sc_SeqLike__indices__sci_Range($thiz) {
  var end = $thiz.length__I();
  return new $c_sci_Range().init___I__I__I(0, end, 1)
}
function $f_sc_SeqLike__lengthCompare__I__I($thiz, len) {
  if ((len < 0)) {
    return 1
  } else {
    var i = 0;
    var it = $thiz.iterator__sc_Iterator();
    while (it.hasNext__Z()) {
      if ((i === len)) {
        return (it.hasNext__Z() ? 1 : 0)
      };
      it.next__O();
      i = ((1 + i) | 0)
    };
    return ((i - len) | 0)
  }
}
function $f_sc_SeqLike__isEmpty__Z($thiz) {
  return ($thiz.lengthCompare__I__I(0) === 0)
}
/** @constructor */
function $c_s_math_Numeric$DoubleIsFractional$() {
  $c_O.call(this)
}
$c_s_math_Numeric$DoubleIsFractional$.prototype = new $h_O();
$c_s_math_Numeric$DoubleIsFractional$.prototype.constructor = $c_s_math_Numeric$DoubleIsFractional$;
/** @constructor */
function $h_s_math_Numeric$DoubleIsFractional$() {
  /*<skip>*/
}
$h_s_math_Numeric$DoubleIsFractional$.prototype = $c_s_math_Numeric$DoubleIsFractional$.prototype;
$c_s_math_Numeric$DoubleIsFractional$.prototype.init___ = (function() {
  return this
});
$c_s_math_Numeric$DoubleIsFractional$.prototype.plus__O__O__O = (function(x, y) {
  var x$1 = $uD(x);
  var y$1 = $uD(y);
  return $f_s_math_Numeric$DoubleIsConflicted__plus__D__D__D(this, x$1, y$1)
});
$c_s_math_Numeric$DoubleIsFractional$.prototype.fromInt__I__O = (function(x) {
  return x
});
$c_s_math_Numeric$DoubleIsFractional$.prototype.toInt__O__I = (function(x) {
  var x$1 = $uD(x);
  return $f_s_math_Numeric$DoubleIsConflicted__toInt__D__I(this, x$1)
});
var $d_s_math_Numeric$DoubleIsFractional$ = new $TypeData().initClass({
  s_math_Numeric$DoubleIsFractional$: 0
}, false, "scala.math.Numeric$DoubleIsFractional$", {
  s_math_Numeric$DoubleIsFractional$: 1,
  O: 1,
  s_math_Numeric$DoubleIsFractional: 1,
  s_math_Numeric$DoubleIsConflicted: 1,
  s_math_Numeric: 1,
  s_math_Ordering: 1,
  ju_Comparator: 1,
  s_math_PartialOrdering: 1,
  s_math_Equiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_math_Fractional: 1,
  s_math_Ordering$DoubleOrdering: 1
});
$c_s_math_Numeric$DoubleIsFractional$.prototype.$classData = $d_s_math_Numeric$DoubleIsFractional$;
var $n_s_math_Numeric$DoubleIsFractional$ = (void 0);
function $m_s_math_Numeric$DoubleIsFractional$() {
  if ((!$n_s_math_Numeric$DoubleIsFractional$)) {
    $n_s_math_Numeric$DoubleIsFractional$ = new $c_s_math_Numeric$DoubleIsFractional$().init___()
  };
  return $n_s_math_Numeric$DoubleIsFractional$
}
function $is_sc_GenSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSet)))
}
function $as_sc_GenSet(obj) {
  return (($is_sc_GenSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenSet"))
}
function $isArrayOf_sc_GenSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSet)))
}
function $asArrayOf_sc_GenSet(obj, depth) {
  return (($isArrayOf_sc_GenSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenSet;", depth))
}
function $f_sc_IndexedSeqLike__toBuffer__scm_Buffer($thiz) {
  var result = new $c_scm_ArrayBuffer().init___I($thiz.size__I());
  var xs = $thiz.seq__sc_TraversableOnce();
  result.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer(xs);
  return result
}
function $is_sc_IndexedSeqLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeqLike)))
}
function $as_sc_IndexedSeqLike(obj) {
  return (($is_sc_IndexedSeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeqLike"))
}
function $isArrayOf_sc_IndexedSeqLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeqLike)))
}
function $asArrayOf_sc_IndexedSeqLike(obj, depth) {
  return (($isArrayOf_sc_IndexedSeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeqLike;", depth))
}
function $is_sc_LinearSeqLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqLike)))
}
function $as_sc_LinearSeqLike(obj) {
  return (($is_sc_LinearSeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqLike"))
}
function $isArrayOf_sc_LinearSeqLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqLike)))
}
function $asArrayOf_sc_LinearSeqLike(obj, depth) {
  return (($isArrayOf_sc_LinearSeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqLike;", depth))
}
function $f_sc_IndexedSeqOptimized__lengthCompare__I__I($thiz, len) {
  return (($thiz.length__I() - len) | 0)
}
function $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z($thiz, that) {
  if ($is_sc_IndexedSeq(that)) {
    var x2 = $as_sc_IndexedSeq(that);
    var len = $thiz.length__I();
    if ((len === x2.length__I())) {
      var i = 0;
      while (((i < len) && $m_sr_BoxesRunTime$().equals__O__O__Z($thiz.apply__I__O(i), x2.apply__I__O(i)))) {
        i = ((1 + i) | 0)
      };
      return (i === len)
    } else {
      return false
    }
  } else {
    return $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that)
  }
}
function $f_sc_IndexedSeqOptimized__isEmpty__Z($thiz) {
  return ($thiz.length__I() === 0)
}
function $f_sc_IndexedSeqOptimized__foreach__F1__V($thiz, f) {
  var i = 0;
  var len = $thiz.length__I();
  while ((i < len)) {
    f.apply__O__O($thiz.apply__I__O(i));
    i = ((1 + i) | 0)
  }
}
function $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O($thiz, start, end, z, op) {
  _foldl: while (true) {
    if ((start === end)) {
      return z
    } else {
      var temp$start = ((1 + start) | 0);
      var temp$z = op.apply__O__O__O(z, $thiz.apply__I__O(start));
      start = temp$start;
      z = temp$z;
      continue _foldl
    }
  }
}
function $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var i = 0;
  var j = start;
  var x = $thiz.length__I();
  var x$1 = ((x < len) ? x : len);
  var that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var end = ((x$1 < that) ? x$1 : that);
  while ((i < end)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, j, $thiz.apply__I__O(i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
}
function $f_sc_LinearSeqOptimized__lengthCompare__I__I($thiz, len) {
  if ((len < 0)) {
    return 1
  } else {
    var i = 0;
    var xs = $thiz;
    return $f_sc_LinearSeqOptimized__loop$1__psc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($thiz, i, xs, len)
  }
}
function $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z($thiz, that) {
  if ($is_sc_LinearSeq(that)) {
    var x2 = $as_sc_LinearSeq(that);
    if (($thiz === x2)) {
      return true
    } else {
      var these = $thiz;
      var those = x2;
      while ((((!these.isEmpty__Z()) && (!those.isEmpty__Z())) && $m_sr_BoxesRunTime$().equals__O__O__Z(these.head__O(), those.head__O()))) {
        these = $as_sc_LinearSeqOptimized(these.tail__O());
        those = $as_sc_LinearSeq(those.tail__O())
      };
      return (these.isEmpty__Z() && those.isEmpty__Z())
    }
  } else {
    return $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that)
  }
}
function $f_sc_LinearSeqOptimized__apply__I__O($thiz, n) {
  var rest = $thiz.drop__I__sc_LinearSeqOptimized(n);
  if (((n < 0) || rest.isEmpty__Z())) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  };
  return rest.head__O()
}
function $f_sc_LinearSeqOptimized__foldLeft__O__F2__O($thiz, z, op) {
  var acc = z;
  var these = $thiz;
  while ((!these.isEmpty__Z())) {
    acc = op.apply__O__O__O(acc, these.head__O());
    these = $as_sc_LinearSeqOptimized(these.tail__O())
  };
  return acc
}
function $f_sc_LinearSeqOptimized__length__I($thiz) {
  var these = $thiz;
  var len = 0;
  while ((!these.isEmpty__Z())) {
    len = ((1 + len) | 0);
    these = $as_sc_LinearSeqOptimized(these.tail__O())
  };
  return len
}
function $f_sc_LinearSeqOptimized__last__O($thiz) {
  if ($thiz.isEmpty__Z()) {
    throw new $c_ju_NoSuchElementException().init___()
  };
  var these = $thiz;
  var nx = $as_sc_LinearSeqOptimized(these.tail__O());
  while ((!nx.isEmpty__Z())) {
    these = nx;
    nx = $as_sc_LinearSeqOptimized(nx.tail__O())
  };
  return these.head__O()
}
function $f_sc_LinearSeqOptimized__isDefinedAt__I__Z($thiz, x) {
  return ((x >= 0) && ($f_sc_LinearSeqOptimized__lengthCompare__I__I($thiz, x) > 0))
}
function $f_sc_LinearSeqOptimized__loop$1__psc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($thiz, i, xs, len$1) {
  _loop: while (true) {
    if ((i === len$1)) {
      return (xs.isEmpty__Z() ? 0 : 1)
    } else if (xs.isEmpty__Z()) {
      return (-1)
    } else {
      var temp$i = ((1 + i) | 0);
      var temp$xs = $as_sc_LinearSeqOptimized(xs.tail__O());
      i = temp$i;
      xs = temp$xs;
      continue _loop
    }
  }
}
function $is_sc_LinearSeqOptimized(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqOptimized)))
}
function $as_sc_LinearSeqOptimized(obj) {
  return (($is_sc_LinearSeqOptimized(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqOptimized"))
}
function $isArrayOf_sc_LinearSeqOptimized(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqOptimized)))
}
function $asArrayOf_sc_LinearSeqOptimized(obj, depth) {
  return (($isArrayOf_sc_LinearSeqOptimized(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqOptimized;", depth))
}
function $f_sc_SetLike__isEmpty__Z($thiz) {
  return ($thiz.size__I() === 0)
}
function $f_sc_SetLike__toBuffer__scm_Buffer($thiz) {
  var result = new $c_scm_ArrayBuffer().init___I($thiz.size__I());
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, result$1) {
    return (function(x$2$2) {
      return result$1.$$plus$eq__O__scm_ArrayBuffer(x$2$2)
    })
  })($thiz, result)));
  return result
}
function $f_sc_MapLike__apply__O__O($thiz, key) {
  var x1 = $thiz.get__O__s_Option(key);
  var x = $m_s_None$();
  if ((x === x1)) {
    return $f_sc_MapLike__$default__O__O($thiz, key)
  } else if ($is_s_Some(x1)) {
    var x2 = $as_s_Some(x1);
    var value = x2.value$2;
    return value
  } else {
    throw new $c_s_MatchError().init___O(x1)
  }
}
function $f_sc_MapLike__isEmpty__Z($thiz) {
  return ($thiz.size__I() === 0)
}
function $f_sc_MapLike__toBuffer__scm_Buffer($thiz) {
  var result = new $c_scm_ArrayBuffer().init___I($thiz.size__I());
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, result$1) {
    return (function(x$7$2) {
      var x$7 = $as_T2(x$7$2);
      return result$1.$$plus$eq__O__scm_ArrayBuffer(x$7)
    })
  })($thiz, result)));
  return result
}
function $f_sc_MapLike__$default__O__O($thiz, key) {
  throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
}
function $f_sc_MapLike__contains__O__Z($thiz, key) {
  return $thiz.get__O__s_Option(key).isDefined__Z()
}
function $f_sc_MapLike__addString__scm_StringBuilder__T__T__T__scm_StringBuilder($thiz, b, start, sep, end) {
  var this$2 = $thiz.iterator__sc_Iterator();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x0$1$2) {
      var x0$1 = $as_T2(x0$1$2);
      if ((x0$1 !== null)) {
        var k = x0$1.$$und1__O();
        var v = x0$1.$$und2__O();
        return (("" + $m_s_Predef$any2stringadd$().$$plus$extension__O__T__T(k, " -> ")) + v)
      } else {
        throw new $c_s_MatchError().init___O(x0$1)
      }
    })
  })($thiz));
  var this$3 = new $c_sc_Iterator$$anon$10().init___sc_Iterator__F1(this$2, f);
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this$3, b, start, sep, end)
}
function $f_sc_MapLike__applyOrElse__O__F1__O($thiz, x, $default) {
  var x1 = $thiz.get__O__s_Option(x);
  if ($is_s_Some(x1)) {
    var x2 = $as_s_Some(x1);
    var v = x2.value$2;
    return v
  } else {
    var x$1 = $m_s_None$();
    if ((x$1 === x1)) {
      return $default.apply__O__O(x)
    } else {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
/** @constructor */
function $c_sc_AbstractIterable() {
  $c_sc_AbstractTraversable.call(this)
}
$c_sc_AbstractIterable.prototype = new $h_sc_AbstractTraversable();
$c_sc_AbstractIterable.prototype.constructor = $c_sc_AbstractIterable;
/** @constructor */
function $h_sc_AbstractIterable() {
  /*<skip>*/
}
$h_sc_AbstractIterable.prototype = $c_sc_AbstractIterable.prototype;
$c_sc_AbstractIterable.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IterableLike__sameElements__sc_GenIterable__Z(this, that)
});
$c_sc_AbstractIterable.prototype.forall__F1__Z = (function(p) {
  var this$1 = this.iterator__sc_Iterator();
  return $f_sc_Iterator__forall__F1__Z(this$1, p)
});
$c_sc_AbstractIterable.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.iterator__sc_Iterator();
  $f_sc_Iterator__foreach__F1__V(this$1, f)
});
$c_sc_AbstractIterable.prototype.toStream__sci_Stream = (function() {
  return this.iterator__sc_Iterator().toStream__sci_Stream()
});
$c_sc_AbstractIterable.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IterableLike__copyToArray__O__I__I__V(this, xs, start, len)
});
function $is_sci_Iterable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Iterable)))
}
function $as_sci_Iterable(obj) {
  return (($is_sci_Iterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Iterable"))
}
function $isArrayOf_sci_Iterable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Iterable)))
}
function $asArrayOf_sci_Iterable(obj, depth) {
  return (($isArrayOf_sci_Iterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Iterable;", depth))
}
var $d_sci_Iterable = new $TypeData().initClass({
  sci_Iterable: 0
}, true, "scala.collection.immutable.Iterable", {
  sci_Iterable: 1,
  sci_Traversable: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  s_Immutable: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1
});
/** @constructor */
function $c_sci_StringOps() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_sci_StringOps.prototype = new $h_O();
$c_sci_StringOps.prototype.constructor = $c_sci_StringOps;
/** @constructor */
function $h_sci_StringOps() {
  /*<skip>*/
}
$h_sci_StringOps.prototype = $c_sci_StringOps.prototype;
$c_sci_StringOps.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_sci_StringOps.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_sci_WrappedString().init___T($$this)
});
$c_sci_StringOps.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  var c = (65535 & $uI($$this.charCodeAt(idx)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_StringOps.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_StringOps.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_StringOps.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_sci_StringOps.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_sci_WrappedString().init___T($$this)
});
$c_sci_StringOps.prototype.equals__O__Z = (function(x$1) {
  return $m_sci_StringOps$().equals$extension__T__O__Z(this.repr$1, x$1)
});
$c_sci_StringOps.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_sci_StringOps.prototype.toString__T = (function() {
  var $$this = this.repr$1;
  return $$this
});
$c_sci_StringOps.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_sci_StringOps.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var $$this = this.repr$1;
  var end = $uI($$this.length);
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_sci_StringOps.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return $uI($$this.length)
});
$c_sci_StringOps.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_sci_StringOps.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI($$this.length))
});
$c_sci_StringOps.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $uI($$this.length)
});
$c_sci_StringOps.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $uI($$this.length)
});
$c_sci_StringOps.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI($$this.length));
  return $f_sc_Iterator__toStream__sci_Stream(this$3)
});
$c_sci_StringOps.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sci_StringOps.prototype.repr__O = (function() {
  return this.repr$1
});
$c_sci_StringOps.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_sci_StringOps.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_sci_StringOps.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $m_sjsr_RuntimeString$().hashCode__T__I($$this)
});
$c_sci_StringOps.prototype.init___T = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_sci_StringOps.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
$c_sci_StringOps.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_StringBuilder().init___()
});
$c_sci_StringOps.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_sci_StringOps(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_StringOps)))
}
function $as_sci_StringOps(obj) {
  return (($is_sci_StringOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.StringOps"))
}
function $isArrayOf_sci_StringOps(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_StringOps)))
}
function $asArrayOf_sci_StringOps(obj, depth) {
  return (($isArrayOf_sci_StringOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.StringOps;", depth))
}
var $d_sci_StringOps = new $TypeData().initClass({
  sci_StringOps: 0
}, false, "scala.collection.immutable.StringOps", {
  sci_StringOps: 1,
  O: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
$c_sci_StringOps.prototype.$classData = $d_sci_StringOps;
function $f_scm_ArrayOps__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var that = $m_sr_ScalaRunTime$().array$undlength__O__I($thiz.repr__O());
  var x = ((len < that) ? len : that);
  var that$1 = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var l = ((x < that$1) ? x : that$1);
  if ((l > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V($thiz.repr__O(), 0, xs, start, l)
  }
}
function $is_scm_ArrayOps(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayOps)))
}
function $as_scm_ArrayOps(obj) {
  return (($is_scm_ArrayOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayOps"))
}
function $isArrayOf_scm_ArrayOps(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayOps)))
}
function $asArrayOf_scm_ArrayOps(obj, depth) {
  return (($isArrayOf_scm_ArrayOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayOps;", depth))
}
/** @constructor */
function $c_scm_ArrayOps$ofBoolean() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_scm_ArrayOps$ofBoolean.prototype = new $h_O();
$c_scm_ArrayOps$ofBoolean.prototype.constructor = $c_scm_ArrayOps$ofBoolean;
/** @constructor */
function $h_scm_ArrayOps$ofBoolean() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofBoolean.prototype = $c_scm_ArrayOps$ofBoolean.prototype;
$c_scm_ArrayOps$ofBoolean.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_scm_ArrayOps$ofBoolean.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofBoolean().init___AZ($$this)
});
$c_scm_ArrayOps$ofBoolean.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  return $$this.get(idx)
});
$c_scm_ArrayOps$ofBoolean.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayOps$ofBoolean.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayOps$ofBoolean.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayOps$ofBoolean.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofBoolean().init___AZ($$this)
});
$c_scm_ArrayOps$ofBoolean.prototype.equals__O__Z = (function(x$1) {
  return $m_scm_ArrayOps$ofBoolean$().equals$extension__AZ__O__Z(this.repr$1, x$1)
});
$c_scm_ArrayOps$ofBoolean.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_scm_ArrayOps$ofBoolean.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_scm_ArrayOps$ofBoolean.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_ArrayOps$ofBoolean.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var $$this = this.repr$1;
  var end = $$this.u.length;
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_ArrayOps$ofBoolean.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofBoolean.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_ArrayOps$ofBoolean.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length)
});
$c_scm_ArrayOps$ofBoolean.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofBoolean.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofBoolean.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$2 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length);
  return $f_sc_Iterator__toStream__sci_Stream(this$2)
});
$c_scm_ArrayOps$ofBoolean.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_scm_ArrayOps$ofBoolean.prototype.init___AZ = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_scm_ArrayOps$ofBoolean.prototype.repr__O = (function() {
  return this.repr$1
});
$c_scm_ArrayOps$ofBoolean.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ArrayOps__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayOps$ofBoolean.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_scm_ArrayOps$ofBoolean.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $$this.hashCode__I()
});
$c_scm_ArrayOps$ofBoolean.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
$c_scm_ArrayOps$ofBoolean.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuilder$ofBoolean().init___()
});
$c_scm_ArrayOps$ofBoolean.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_scm_ArrayOps$ofBoolean(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayOps$ofBoolean)))
}
function $as_scm_ArrayOps$ofBoolean(obj) {
  return (($is_scm_ArrayOps$ofBoolean(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayOps$ofBoolean"))
}
function $isArrayOf_scm_ArrayOps$ofBoolean(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayOps$ofBoolean)))
}
function $asArrayOf_scm_ArrayOps$ofBoolean(obj, depth) {
  return (($isArrayOf_scm_ArrayOps$ofBoolean(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayOps$ofBoolean;", depth))
}
var $d_scm_ArrayOps$ofBoolean = new $TypeData().initClass({
  scm_ArrayOps$ofBoolean: 0
}, false, "scala.collection.mutable.ArrayOps$ofBoolean", {
  scm_ArrayOps$ofBoolean: 1,
  O: 1,
  scm_ArrayOps: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1
});
$c_scm_ArrayOps$ofBoolean.prototype.$classData = $d_scm_ArrayOps$ofBoolean;
/** @constructor */
function $c_scm_ArrayOps$ofByte() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_scm_ArrayOps$ofByte.prototype = new $h_O();
$c_scm_ArrayOps$ofByte.prototype.constructor = $c_scm_ArrayOps$ofByte;
/** @constructor */
function $h_scm_ArrayOps$ofByte() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofByte.prototype = $c_scm_ArrayOps$ofByte.prototype;
$c_scm_ArrayOps$ofByte.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_scm_ArrayOps$ofByte.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofByte().init___AB($$this)
});
$c_scm_ArrayOps$ofByte.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  return $$this.get(idx)
});
$c_scm_ArrayOps$ofByte.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayOps$ofByte.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayOps$ofByte.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayOps$ofByte.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofByte().init___AB($$this)
});
$c_scm_ArrayOps$ofByte.prototype.equals__O__Z = (function(x$1) {
  return $m_scm_ArrayOps$ofByte$().equals$extension__AB__O__Z(this.repr$1, x$1)
});
$c_scm_ArrayOps$ofByte.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_scm_ArrayOps$ofByte.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_scm_ArrayOps$ofByte.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_ArrayOps$ofByte.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var $$this = this.repr$1;
  var end = $$this.u.length;
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_ArrayOps$ofByte.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofByte.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_ArrayOps$ofByte.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length)
});
$c_scm_ArrayOps$ofByte.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofByte.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofByte.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$2 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length);
  return $f_sc_Iterator__toStream__sci_Stream(this$2)
});
$c_scm_ArrayOps$ofByte.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_scm_ArrayOps$ofByte.prototype.repr__O = (function() {
  return this.repr$1
});
$c_scm_ArrayOps$ofByte.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ArrayOps__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayOps$ofByte.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_scm_ArrayOps$ofByte.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $$this.hashCode__I()
});
$c_scm_ArrayOps$ofByte.prototype.init___AB = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_scm_ArrayOps$ofByte.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
$c_scm_ArrayOps$ofByte.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuilder$ofByte().init___()
});
$c_scm_ArrayOps$ofByte.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_scm_ArrayOps$ofByte(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayOps$ofByte)))
}
function $as_scm_ArrayOps$ofByte(obj) {
  return (($is_scm_ArrayOps$ofByte(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayOps$ofByte"))
}
function $isArrayOf_scm_ArrayOps$ofByte(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayOps$ofByte)))
}
function $asArrayOf_scm_ArrayOps$ofByte(obj, depth) {
  return (($isArrayOf_scm_ArrayOps$ofByte(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayOps$ofByte;", depth))
}
var $d_scm_ArrayOps$ofByte = new $TypeData().initClass({
  scm_ArrayOps$ofByte: 0
}, false, "scala.collection.mutable.ArrayOps$ofByte", {
  scm_ArrayOps$ofByte: 1,
  O: 1,
  scm_ArrayOps: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1
});
$c_scm_ArrayOps$ofByte.prototype.$classData = $d_scm_ArrayOps$ofByte;
/** @constructor */
function $c_scm_ArrayOps$ofChar() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_scm_ArrayOps$ofChar.prototype = new $h_O();
$c_scm_ArrayOps$ofChar.prototype.constructor = $c_scm_ArrayOps$ofChar;
/** @constructor */
function $h_scm_ArrayOps$ofChar() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofChar.prototype = $c_scm_ArrayOps$ofChar.prototype;
$c_scm_ArrayOps$ofChar.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_scm_ArrayOps$ofChar.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofChar().init___AC($$this)
});
$c_scm_ArrayOps$ofChar.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  var c = $$this.get(idx);
  return new $c_jl_Character().init___C(c)
});
$c_scm_ArrayOps$ofChar.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayOps$ofChar.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayOps$ofChar.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayOps$ofChar.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofChar().init___AC($$this)
});
$c_scm_ArrayOps$ofChar.prototype.equals__O__Z = (function(x$1) {
  return $m_scm_ArrayOps$ofChar$().equals$extension__AC__O__Z(this.repr$1, x$1)
});
$c_scm_ArrayOps$ofChar.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_scm_ArrayOps$ofChar.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_scm_ArrayOps$ofChar.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_ArrayOps$ofChar.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var $$this = this.repr$1;
  var end = $$this.u.length;
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_ArrayOps$ofChar.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofChar.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_ArrayOps$ofChar.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length)
});
$c_scm_ArrayOps$ofChar.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofChar.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofChar.prototype.init___AC = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_scm_ArrayOps$ofChar.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$2 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length);
  return $f_sc_Iterator__toStream__sci_Stream(this$2)
});
$c_scm_ArrayOps$ofChar.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_scm_ArrayOps$ofChar.prototype.repr__O = (function() {
  return this.repr$1
});
$c_scm_ArrayOps$ofChar.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ArrayOps__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayOps$ofChar.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_scm_ArrayOps$ofChar.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $$this.hashCode__I()
});
$c_scm_ArrayOps$ofChar.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
$c_scm_ArrayOps$ofChar.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuilder$ofChar().init___()
});
$c_scm_ArrayOps$ofChar.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_scm_ArrayOps$ofChar(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayOps$ofChar)))
}
function $as_scm_ArrayOps$ofChar(obj) {
  return (($is_scm_ArrayOps$ofChar(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayOps$ofChar"))
}
function $isArrayOf_scm_ArrayOps$ofChar(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayOps$ofChar)))
}
function $asArrayOf_scm_ArrayOps$ofChar(obj, depth) {
  return (($isArrayOf_scm_ArrayOps$ofChar(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayOps$ofChar;", depth))
}
var $d_scm_ArrayOps$ofChar = new $TypeData().initClass({
  scm_ArrayOps$ofChar: 0
}, false, "scala.collection.mutable.ArrayOps$ofChar", {
  scm_ArrayOps$ofChar: 1,
  O: 1,
  scm_ArrayOps: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1
});
$c_scm_ArrayOps$ofChar.prototype.$classData = $d_scm_ArrayOps$ofChar;
/** @constructor */
function $c_scm_ArrayOps$ofDouble() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_scm_ArrayOps$ofDouble.prototype = new $h_O();
$c_scm_ArrayOps$ofDouble.prototype.constructor = $c_scm_ArrayOps$ofDouble;
/** @constructor */
function $h_scm_ArrayOps$ofDouble() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofDouble.prototype = $c_scm_ArrayOps$ofDouble.prototype;
$c_scm_ArrayOps$ofDouble.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_scm_ArrayOps$ofDouble.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofDouble().init___AD($$this)
});
$c_scm_ArrayOps$ofDouble.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  return $$this.get(idx)
});
$c_scm_ArrayOps$ofDouble.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayOps$ofDouble.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayOps$ofDouble.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayOps$ofDouble.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofDouble().init___AD($$this)
});
$c_scm_ArrayOps$ofDouble.prototype.equals__O__Z = (function(x$1) {
  return $m_scm_ArrayOps$ofDouble$().equals$extension__AD__O__Z(this.repr$1, x$1)
});
$c_scm_ArrayOps$ofDouble.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_scm_ArrayOps$ofDouble.prototype.init___AD = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_scm_ArrayOps$ofDouble.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_scm_ArrayOps$ofDouble.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_ArrayOps$ofDouble.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var $$this = this.repr$1;
  var end = $$this.u.length;
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_ArrayOps$ofDouble.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofDouble.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_ArrayOps$ofDouble.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length)
});
$c_scm_ArrayOps$ofDouble.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofDouble.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofDouble.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$2 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length);
  return $f_sc_Iterator__toStream__sci_Stream(this$2)
});
$c_scm_ArrayOps$ofDouble.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_scm_ArrayOps$ofDouble.prototype.repr__O = (function() {
  return this.repr$1
});
$c_scm_ArrayOps$ofDouble.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ArrayOps__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayOps$ofDouble.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_scm_ArrayOps$ofDouble.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $$this.hashCode__I()
});
$c_scm_ArrayOps$ofDouble.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
$c_scm_ArrayOps$ofDouble.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuilder$ofDouble().init___()
});
$c_scm_ArrayOps$ofDouble.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_scm_ArrayOps$ofDouble(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayOps$ofDouble)))
}
function $as_scm_ArrayOps$ofDouble(obj) {
  return (($is_scm_ArrayOps$ofDouble(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayOps$ofDouble"))
}
function $isArrayOf_scm_ArrayOps$ofDouble(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayOps$ofDouble)))
}
function $asArrayOf_scm_ArrayOps$ofDouble(obj, depth) {
  return (($isArrayOf_scm_ArrayOps$ofDouble(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayOps$ofDouble;", depth))
}
var $d_scm_ArrayOps$ofDouble = new $TypeData().initClass({
  scm_ArrayOps$ofDouble: 0
}, false, "scala.collection.mutable.ArrayOps$ofDouble", {
  scm_ArrayOps$ofDouble: 1,
  O: 1,
  scm_ArrayOps: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1
});
$c_scm_ArrayOps$ofDouble.prototype.$classData = $d_scm_ArrayOps$ofDouble;
/** @constructor */
function $c_scm_ArrayOps$ofFloat() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_scm_ArrayOps$ofFloat.prototype = new $h_O();
$c_scm_ArrayOps$ofFloat.prototype.constructor = $c_scm_ArrayOps$ofFloat;
/** @constructor */
function $h_scm_ArrayOps$ofFloat() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofFloat.prototype = $c_scm_ArrayOps$ofFloat.prototype;
$c_scm_ArrayOps$ofFloat.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_scm_ArrayOps$ofFloat.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofFloat().init___AF($$this)
});
$c_scm_ArrayOps$ofFloat.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  return $$this.get(idx)
});
$c_scm_ArrayOps$ofFloat.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayOps$ofFloat.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayOps$ofFloat.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayOps$ofFloat.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofFloat().init___AF($$this)
});
$c_scm_ArrayOps$ofFloat.prototype.equals__O__Z = (function(x$1) {
  return $m_scm_ArrayOps$ofFloat$().equals$extension__AF__O__Z(this.repr$1, x$1)
});
$c_scm_ArrayOps$ofFloat.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_scm_ArrayOps$ofFloat.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_scm_ArrayOps$ofFloat.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_ArrayOps$ofFloat.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var $$this = this.repr$1;
  var end = $$this.u.length;
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_ArrayOps$ofFloat.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofFloat.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_ArrayOps$ofFloat.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length)
});
$c_scm_ArrayOps$ofFloat.prototype.init___AF = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_scm_ArrayOps$ofFloat.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofFloat.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofFloat.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$2 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length);
  return $f_sc_Iterator__toStream__sci_Stream(this$2)
});
$c_scm_ArrayOps$ofFloat.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_scm_ArrayOps$ofFloat.prototype.repr__O = (function() {
  return this.repr$1
});
$c_scm_ArrayOps$ofFloat.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ArrayOps__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayOps$ofFloat.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_scm_ArrayOps$ofFloat.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $$this.hashCode__I()
});
$c_scm_ArrayOps$ofFloat.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
$c_scm_ArrayOps$ofFloat.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuilder$ofFloat().init___()
});
$c_scm_ArrayOps$ofFloat.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_scm_ArrayOps$ofFloat(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayOps$ofFloat)))
}
function $as_scm_ArrayOps$ofFloat(obj) {
  return (($is_scm_ArrayOps$ofFloat(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayOps$ofFloat"))
}
function $isArrayOf_scm_ArrayOps$ofFloat(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayOps$ofFloat)))
}
function $asArrayOf_scm_ArrayOps$ofFloat(obj, depth) {
  return (($isArrayOf_scm_ArrayOps$ofFloat(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayOps$ofFloat;", depth))
}
var $d_scm_ArrayOps$ofFloat = new $TypeData().initClass({
  scm_ArrayOps$ofFloat: 0
}, false, "scala.collection.mutable.ArrayOps$ofFloat", {
  scm_ArrayOps$ofFloat: 1,
  O: 1,
  scm_ArrayOps: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1
});
$c_scm_ArrayOps$ofFloat.prototype.$classData = $d_scm_ArrayOps$ofFloat;
/** @constructor */
function $c_scm_ArrayOps$ofInt() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_scm_ArrayOps$ofInt.prototype = new $h_O();
$c_scm_ArrayOps$ofInt.prototype.constructor = $c_scm_ArrayOps$ofInt;
/** @constructor */
function $h_scm_ArrayOps$ofInt() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofInt.prototype = $c_scm_ArrayOps$ofInt.prototype;
$c_scm_ArrayOps$ofInt.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_scm_ArrayOps$ofInt.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofInt().init___AI($$this)
});
$c_scm_ArrayOps$ofInt.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  return $$this.get(idx)
});
$c_scm_ArrayOps$ofInt.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayOps$ofInt.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayOps$ofInt.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayOps$ofInt.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofInt().init___AI($$this)
});
$c_scm_ArrayOps$ofInt.prototype.equals__O__Z = (function(x$1) {
  return $m_scm_ArrayOps$ofInt$().equals$extension__AI__O__Z(this.repr$1, x$1)
});
$c_scm_ArrayOps$ofInt.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_scm_ArrayOps$ofInt.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_scm_ArrayOps$ofInt.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_ArrayOps$ofInt.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var $$this = this.repr$1;
  var end = $$this.u.length;
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_ArrayOps$ofInt.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofInt.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_ArrayOps$ofInt.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length)
});
$c_scm_ArrayOps$ofInt.prototype.init___AI = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_scm_ArrayOps$ofInt.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofInt.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofInt.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$2 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length);
  return $f_sc_Iterator__toStream__sci_Stream(this$2)
});
$c_scm_ArrayOps$ofInt.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_scm_ArrayOps$ofInt.prototype.repr__O = (function() {
  return this.repr$1
});
$c_scm_ArrayOps$ofInt.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ArrayOps__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayOps$ofInt.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_scm_ArrayOps$ofInt.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $$this.hashCode__I()
});
$c_scm_ArrayOps$ofInt.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
$c_scm_ArrayOps$ofInt.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuilder$ofInt().init___()
});
$c_scm_ArrayOps$ofInt.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_scm_ArrayOps$ofInt(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayOps$ofInt)))
}
function $as_scm_ArrayOps$ofInt(obj) {
  return (($is_scm_ArrayOps$ofInt(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayOps$ofInt"))
}
function $isArrayOf_scm_ArrayOps$ofInt(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayOps$ofInt)))
}
function $asArrayOf_scm_ArrayOps$ofInt(obj, depth) {
  return (($isArrayOf_scm_ArrayOps$ofInt(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayOps$ofInt;", depth))
}
var $d_scm_ArrayOps$ofInt = new $TypeData().initClass({
  scm_ArrayOps$ofInt: 0
}, false, "scala.collection.mutable.ArrayOps$ofInt", {
  scm_ArrayOps$ofInt: 1,
  O: 1,
  scm_ArrayOps: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1
});
$c_scm_ArrayOps$ofInt.prototype.$classData = $d_scm_ArrayOps$ofInt;
/** @constructor */
function $c_scm_ArrayOps$ofLong() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_scm_ArrayOps$ofLong.prototype = new $h_O();
$c_scm_ArrayOps$ofLong.prototype.constructor = $c_scm_ArrayOps$ofLong;
/** @constructor */
function $h_scm_ArrayOps$ofLong() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofLong.prototype = $c_scm_ArrayOps$ofLong.prototype;
$c_scm_ArrayOps$ofLong.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_scm_ArrayOps$ofLong.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofLong().init___AJ($$this)
});
$c_scm_ArrayOps$ofLong.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  return $$this.get(idx)
});
$c_scm_ArrayOps$ofLong.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayOps$ofLong.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayOps$ofLong.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayOps$ofLong.prototype.init___AJ = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_scm_ArrayOps$ofLong.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofLong().init___AJ($$this)
});
$c_scm_ArrayOps$ofLong.prototype.equals__O__Z = (function(x$1) {
  return $m_scm_ArrayOps$ofLong$().equals$extension__AJ__O__Z(this.repr$1, x$1)
});
$c_scm_ArrayOps$ofLong.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_scm_ArrayOps$ofLong.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_scm_ArrayOps$ofLong.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_ArrayOps$ofLong.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var $$this = this.repr$1;
  var end = $$this.u.length;
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_ArrayOps$ofLong.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofLong.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_ArrayOps$ofLong.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length)
});
$c_scm_ArrayOps$ofLong.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofLong.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofLong.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$2 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length);
  return $f_sc_Iterator__toStream__sci_Stream(this$2)
});
$c_scm_ArrayOps$ofLong.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_scm_ArrayOps$ofLong.prototype.repr__O = (function() {
  return this.repr$1
});
$c_scm_ArrayOps$ofLong.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ArrayOps__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayOps$ofLong.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_scm_ArrayOps$ofLong.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $$this.hashCode__I()
});
$c_scm_ArrayOps$ofLong.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
$c_scm_ArrayOps$ofLong.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuilder$ofLong().init___()
});
$c_scm_ArrayOps$ofLong.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_scm_ArrayOps$ofLong(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayOps$ofLong)))
}
function $as_scm_ArrayOps$ofLong(obj) {
  return (($is_scm_ArrayOps$ofLong(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayOps$ofLong"))
}
function $isArrayOf_scm_ArrayOps$ofLong(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayOps$ofLong)))
}
function $asArrayOf_scm_ArrayOps$ofLong(obj, depth) {
  return (($isArrayOf_scm_ArrayOps$ofLong(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayOps$ofLong;", depth))
}
var $d_scm_ArrayOps$ofLong = new $TypeData().initClass({
  scm_ArrayOps$ofLong: 0
}, false, "scala.collection.mutable.ArrayOps$ofLong", {
  scm_ArrayOps$ofLong: 1,
  O: 1,
  scm_ArrayOps: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1
});
$c_scm_ArrayOps$ofLong.prototype.$classData = $d_scm_ArrayOps$ofLong;
/** @constructor */
function $c_scm_ArrayOps$ofRef() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_scm_ArrayOps$ofRef.prototype = new $h_O();
$c_scm_ArrayOps$ofRef.prototype.constructor = $c_scm_ArrayOps$ofRef;
/** @constructor */
function $h_scm_ArrayOps$ofRef() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofRef.prototype = $c_scm_ArrayOps$ofRef.prototype;
$c_scm_ArrayOps$ofRef.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_scm_ArrayOps$ofRef.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofRef().init___AO($$this)
});
$c_scm_ArrayOps$ofRef.prototype.apply__I__O = (function(index) {
  var $$this = this.repr$1;
  return $$this.get(index)
});
$c_scm_ArrayOps$ofRef.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayOps$ofRef.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayOps$ofRef.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayOps$ofRef.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofRef().init___AO($$this)
});
$c_scm_ArrayOps$ofRef.prototype.equals__O__Z = (function(x$1) {
  return $m_scm_ArrayOps$ofRef$().equals$extension__AO__O__Z(this.repr$1, x$1)
});
$c_scm_ArrayOps$ofRef.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_scm_ArrayOps$ofRef.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_scm_ArrayOps$ofRef.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_ArrayOps$ofRef.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var $$this = this.repr$1;
  var end = $$this.u.length;
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_ArrayOps$ofRef.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofRef.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_ArrayOps$ofRef.prototype.init___AO = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_scm_ArrayOps$ofRef.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length)
});
$c_scm_ArrayOps$ofRef.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofRef.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofRef.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$2 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length);
  return $f_sc_Iterator__toStream__sci_Stream(this$2)
});
$c_scm_ArrayOps$ofRef.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_scm_ArrayOps$ofRef.prototype.repr__O = (function() {
  return this.repr$1
});
$c_scm_ArrayOps$ofRef.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ArrayOps__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayOps$ofRef.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_scm_ArrayOps$ofRef.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $$this.hashCode__I()
});
$c_scm_ArrayOps$ofRef.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
$c_scm_ArrayOps$ofRef.prototype.newBuilder__scm_Builder = (function() {
  var $$this = this.repr$1;
  return new $c_scm_ArrayBuilder$ofRef().init___s_reflect_ClassTag($m_s_reflect_ClassTag$().apply__jl_Class__s_reflect_ClassTag($objectGetClass($$this).getComponentType__jl_Class()))
});
$c_scm_ArrayOps$ofRef.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_scm_ArrayOps$ofRef(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayOps$ofRef)))
}
function $as_scm_ArrayOps$ofRef(obj) {
  return (($is_scm_ArrayOps$ofRef(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayOps$ofRef"))
}
function $isArrayOf_scm_ArrayOps$ofRef(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayOps$ofRef)))
}
function $asArrayOf_scm_ArrayOps$ofRef(obj, depth) {
  return (($isArrayOf_scm_ArrayOps$ofRef(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayOps$ofRef;", depth))
}
var $d_scm_ArrayOps$ofRef = new $TypeData().initClass({
  scm_ArrayOps$ofRef: 0
}, false, "scala.collection.mutable.ArrayOps$ofRef", {
  scm_ArrayOps$ofRef: 1,
  O: 1,
  scm_ArrayOps: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1
});
$c_scm_ArrayOps$ofRef.prototype.$classData = $d_scm_ArrayOps$ofRef;
/** @constructor */
function $c_scm_ArrayOps$ofShort() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_scm_ArrayOps$ofShort.prototype = new $h_O();
$c_scm_ArrayOps$ofShort.prototype.constructor = $c_scm_ArrayOps$ofShort;
/** @constructor */
function $h_scm_ArrayOps$ofShort() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofShort.prototype = $c_scm_ArrayOps$ofShort.prototype;
$c_scm_ArrayOps$ofShort.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_scm_ArrayOps$ofShort.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofShort().init___AS($$this)
});
$c_scm_ArrayOps$ofShort.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  return $$this.get(idx)
});
$c_scm_ArrayOps$ofShort.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayOps$ofShort.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayOps$ofShort.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayOps$ofShort.prototype.init___AS = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_scm_ArrayOps$ofShort.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofShort().init___AS($$this)
});
$c_scm_ArrayOps$ofShort.prototype.equals__O__Z = (function(x$1) {
  return $m_scm_ArrayOps$ofShort$().equals$extension__AS__O__Z(this.repr$1, x$1)
});
$c_scm_ArrayOps$ofShort.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_scm_ArrayOps$ofShort.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_scm_ArrayOps$ofShort.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_ArrayOps$ofShort.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var $$this = this.repr$1;
  var end = $$this.u.length;
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_ArrayOps$ofShort.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofShort.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_ArrayOps$ofShort.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length)
});
$c_scm_ArrayOps$ofShort.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofShort.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofShort.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$2 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length);
  return $f_sc_Iterator__toStream__sci_Stream(this$2)
});
$c_scm_ArrayOps$ofShort.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_scm_ArrayOps$ofShort.prototype.repr__O = (function() {
  return this.repr$1
});
$c_scm_ArrayOps$ofShort.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ArrayOps__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayOps$ofShort.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_scm_ArrayOps$ofShort.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $$this.hashCode__I()
});
$c_scm_ArrayOps$ofShort.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
$c_scm_ArrayOps$ofShort.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuilder$ofShort().init___()
});
$c_scm_ArrayOps$ofShort.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_scm_ArrayOps$ofShort(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayOps$ofShort)))
}
function $as_scm_ArrayOps$ofShort(obj) {
  return (($is_scm_ArrayOps$ofShort(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayOps$ofShort"))
}
function $isArrayOf_scm_ArrayOps$ofShort(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayOps$ofShort)))
}
function $asArrayOf_scm_ArrayOps$ofShort(obj, depth) {
  return (($isArrayOf_scm_ArrayOps$ofShort(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayOps$ofShort;", depth))
}
var $d_scm_ArrayOps$ofShort = new $TypeData().initClass({
  scm_ArrayOps$ofShort: 0
}, false, "scala.collection.mutable.ArrayOps$ofShort", {
  scm_ArrayOps$ofShort: 1,
  O: 1,
  scm_ArrayOps: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1
});
$c_scm_ArrayOps$ofShort.prototype.$classData = $d_scm_ArrayOps$ofShort;
/** @constructor */
function $c_scm_ArrayOps$ofUnit() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_scm_ArrayOps$ofUnit.prototype = new $h_O();
$c_scm_ArrayOps$ofUnit.prototype.constructor = $c_scm_ArrayOps$ofUnit;
/** @constructor */
function $h_scm_ArrayOps$ofUnit() {
  /*<skip>*/
}
$h_scm_ArrayOps$ofUnit.prototype = $c_scm_ArrayOps$ofUnit.prototype;
$c_scm_ArrayOps$ofUnit.prototype.copyToArray__O__I__V = (function(xs, start) {
  $f_sc_TraversableOnce__copyToArray__O__I__V(this, xs, start)
});
$c_scm_ArrayOps$ofUnit.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofUnit().init___Asr_BoxedUnit($$this)
});
$c_scm_ArrayOps$ofUnit.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1
});
$c_scm_ArrayOps$ofUnit.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayOps$ofUnit.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayOps$ofUnit.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayOps$ofUnit.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_scm_WrappedArray$ofUnit().init___Asr_BoxedUnit($$this)
});
$c_scm_ArrayOps$ofUnit.prototype.equals__O__Z = (function(x$1) {
  return $m_scm_ArrayOps$ofUnit$().equals$extension__Asr_BoxedUnit__O__Z(this.repr$1, x$1)
});
$c_scm_ArrayOps$ofUnit.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_scm_ArrayOps$ofUnit.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_scm_ArrayOps$ofUnit.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_ArrayOps$ofUnit.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var $$this = this.repr$1;
  var end = $$this.u.length;
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_ArrayOps$ofUnit.prototype.size__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofUnit.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_ArrayOps$ofUnit.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length)
});
$c_scm_ArrayOps$ofUnit.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofUnit.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $$this.u.length
});
$c_scm_ArrayOps$ofUnit.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$2 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $$this.u.length);
  return $f_sc_Iterator__toStream__sci_Stream(this$2)
});
$c_scm_ArrayOps$ofUnit.prototype.init___Asr_BoxedUnit = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_scm_ArrayOps$ofUnit.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_scm_ArrayOps$ofUnit.prototype.repr__O = (function() {
  return this.repr$1
});
$c_scm_ArrayOps$ofUnit.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ArrayOps__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayOps$ofUnit.prototype.isTraversableAgain__Z = (function() {
  return true
});
$c_scm_ArrayOps$ofUnit.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $$this.hashCode__I()
});
$c_scm_ArrayOps$ofUnit.prototype.sum__s_math_Numeric__O = (function(num) {
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this, num)
});
$c_scm_ArrayOps$ofUnit.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuilder$ofUnit().init___()
});
$c_scm_ArrayOps$ofUnit.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_scm_ArrayOps$ofUnit(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayOps$ofUnit)))
}
function $as_scm_ArrayOps$ofUnit(obj) {
  return (($is_scm_ArrayOps$ofUnit(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayOps$ofUnit"))
}
function $isArrayOf_scm_ArrayOps$ofUnit(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayOps$ofUnit)))
}
function $asArrayOf_scm_ArrayOps$ofUnit(obj, depth) {
  return (($isArrayOf_scm_ArrayOps$ofUnit(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayOps$ofUnit;", depth))
}
var $d_scm_ArrayOps$ofUnit = new $TypeData().initClass({
  scm_ArrayOps$ofUnit: 0
}, false, "scala.collection.mutable.ArrayOps$ofUnit", {
  scm_ArrayOps$ofUnit: 1,
  O: 1,
  scm_ArrayOps: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1
});
$c_scm_ArrayOps$ofUnit.prototype.$classData = $d_scm_ArrayOps$ofUnit;
function $is_sjs_js_ArrayOps(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_ArrayOps)))
}
function $as_sjs_js_ArrayOps(obj) {
  return (($is_sjs_js_ArrayOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.ArrayOps"))
}
function $isArrayOf_sjs_js_ArrayOps(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_ArrayOps)))
}
function $asArrayOf_sjs_js_ArrayOps(obj, depth) {
  return (($isArrayOf_sjs_js_ArrayOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.ArrayOps;", depth))
}
function $is_sc_IndexedSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeq)))
}
function $as_sc_IndexedSeq(obj) {
  return (($is_sc_IndexedSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeq"))
}
function $isArrayOf_sc_IndexedSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeq)))
}
function $asArrayOf_sc_IndexedSeq(obj, depth) {
  return (($isArrayOf_sc_IndexedSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeq;", depth))
}
function $is_sc_LinearSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeq)))
}
function $as_sc_LinearSeq(obj) {
  return (($is_sc_LinearSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeq"))
}
function $isArrayOf_sc_LinearSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeq)))
}
function $asArrayOf_sc_LinearSeq(obj, depth) {
  return (($isArrayOf_sc_LinearSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeq;", depth))
}
/** @constructor */
function $c_sc_AbstractSeq() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractSeq.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSeq.prototype.constructor = $c_sc_AbstractSeq;
/** @constructor */
function $h_sc_AbstractSeq() {
  /*<skip>*/
}
$h_sc_AbstractSeq.prototype = $c_sc_AbstractSeq.prototype;
$c_sc_AbstractSeq.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_SeqLike__lengthCompare__I__I(this, len)
});
$c_sc_AbstractSeq.prototype.equals__O__Z = (function(that) {
  return $f_sc_GenSeqLike__equals__O__Z(this, that)
});
$c_sc_AbstractSeq.prototype.isEmpty__Z = (function() {
  return $f_sc_SeqLike__isEmpty__Z(this)
});
$c_sc_AbstractSeq.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_sc_AbstractSeq.prototype.apply$mcZI$sp__I__Z = (function(v1) {
  return $uZ(this.apply__O__O(v1))
});
$c_sc_AbstractSeq.prototype.size__I = (function() {
  return this.length__I()
});
$c_sc_AbstractSeq.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return $f_s_PartialFunction__applyOrElse__O__F1__O(this, x, $default)
});
$c_sc_AbstractSeq.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this.seq__sc_Seq())
});
/** @constructor */
function $c_sc_AbstractMap() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractMap.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractMap.prototype.constructor = $c_sc_AbstractMap;
/** @constructor */
function $h_sc_AbstractMap() {
  /*<skip>*/
}
$h_sc_AbstractMap.prototype = $c_sc_AbstractMap.prototype;
$c_sc_AbstractMap.prototype.apply__O__O = (function(key) {
  return $f_sc_MapLike__apply__O__O(this, key)
});
$c_sc_AbstractMap.prototype.isEmpty__Z = (function() {
  return $f_sc_MapLike__isEmpty__Z(this)
});
$c_sc_AbstractMap.prototype.equals__O__Z = (function(that) {
  return $f_sc_GenMapLike__equals__O__Z(this, that)
});
$c_sc_AbstractMap.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_sc_AbstractMap.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_MapLike__toBuffer__scm_Buffer(this)
});
$c_sc_AbstractMap.prototype.apply$mcZI$sp__I__Z = (function(v1) {
  return $uZ(this.apply__O__O(v1))
});
$c_sc_AbstractMap.prototype.contains__O__Z = (function(key) {
  return $f_sc_MapLike__contains__O__Z(this, key)
});
$c_sc_AbstractMap.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_MapLike__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractMap.prototype.isDefinedAt__O__Z = (function(key) {
  return this.contains__O__Z(key)
});
$c_sc_AbstractMap.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var xs = this.seq__sc_Map();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(xs, this$1.mapSeed$2)
});
$c_sc_AbstractMap.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return $f_sc_MapLike__applyOrElse__O__F1__O(this, x, $default)
});
$c_sc_AbstractMap.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_MapBuilder().init___sc_GenMap(this.empty__sc_Map())
});
$c_sc_AbstractMap.prototype.stringPrefix__T = (function() {
  return "Map"
});
/** @constructor */
function $c_sc_AbstractSet() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractSet.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSet.prototype.constructor = $c_sc_AbstractSet;
/** @constructor */
function $h_sc_AbstractSet() {
  /*<skip>*/
}
$h_sc_AbstractSet.prototype = $c_sc_AbstractSet.prototype;
$c_sc_AbstractSet.prototype.isEmpty__Z = (function() {
  return $f_sc_SetLike__isEmpty__Z(this)
});
$c_sc_AbstractSet.prototype.equals__O__Z = (function(that) {
  return $f_sc_GenSetLike__equals__O__Z(this, that)
});
$c_sc_AbstractSet.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_sc_AbstractSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  return this.forall__F1__Z(that)
});
$c_sc_AbstractSet.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_SetLike__toBuffer__scm_Buffer(this)
});
$c_sc_AbstractSet.prototype.apply$mcZI$sp__I__Z = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sc_AbstractSet.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(this, this$1.setSeed$2)
});
$c_sc_AbstractSet.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_SetBuilder().init___sc_Set(this.empty__sc_Set())
});
$c_sc_AbstractSet.prototype.stringPrefix__T = (function() {
  return "Set"
});
function $is_sci_Map(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Map)))
}
function $as_sci_Map(obj) {
  return (($is_sci_Map(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Map"))
}
function $isArrayOf_sci_Map(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Map)))
}
function $asArrayOf_sci_Map(obj, depth) {
  return (($isArrayOf_sci_Map(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Map;", depth))
}
/** @constructor */
function $c_sci_AbstractMap() {
  $c_sc_AbstractMap.call(this)
}
$c_sci_AbstractMap.prototype = new $h_sc_AbstractMap();
$c_sci_AbstractMap.prototype.constructor = $c_sci_AbstractMap;
/** @constructor */
function $h_sci_AbstractMap() {
  /*<skip>*/
}
$h_sci_AbstractMap.prototype = $c_sci_AbstractMap.prototype;
$c_sci_AbstractMap.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_AbstractMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_AbstractMap.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Iterable$()
});
$c_sci_AbstractMap.prototype.empty__sc_Map = (function() {
  return this.empty__sci_Map()
});
$c_sci_AbstractMap.prototype.empty__sci_Map = (function() {
  return $m_sci_Map$EmptyMap$()
});
$c_sci_AbstractMap.prototype.seq__sc_Map = (function() {
  return this
});
/** @constructor */
function $c_sci_ListSet() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_ListSet.prototype = new $h_sc_AbstractSet();
$c_sci_ListSet.prototype.constructor = $c_sci_ListSet;
/** @constructor */
function $h_sci_ListSet() {
  /*<skip>*/
}
$h_sci_ListSet.prototype = $c_sci_ListSet.prototype;
$c_sci_ListSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_ListSet.prototype.next__sci_ListSet = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next of empty set")
});
$c_sci_ListSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_ListSet.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_ListSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_ListSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_ListSet$()
});
$c_sci_ListSet.prototype.$$plus__O__sci_ListSet = (function(elem) {
  return new $c_sci_ListSet$Node().init___sci_ListSet__O(this, elem)
});
$c_sci_ListSet.prototype.size__I = (function() {
  return 0
});
$c_sci_ListSet.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.reverseList$1__p4__sci_List();
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$1)
});
$c_sci_ListSet.prototype.empty__sc_Set = (function() {
  return $m_sci_ListSet$EmptyListSet$()
});
$c_sci_ListSet.prototype.reverseList$1__p4__sci_List = (function() {
  var curr = this;
  var res = $m_sci_Nil$();
  while ((!curr.isEmpty__Z())) {
    var x$4 = curr.elem__O();
    var this$1 = res;
    res = new $c_sci_$colon$colon().init___O__sci_List(x$4, this$1);
    curr = curr.next__sci_ListSet()
  };
  return res
});
$c_sci_ListSet.prototype.contains__O__Z = (function(elem) {
  return false
});
$c_sci_ListSet.prototype.elem__O = (function() {
  throw new $c_ju_NoSuchElementException().init___T("elem of empty set")
});
$c_sci_ListSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
$c_sci_ListSet.prototype.stringPrefix__T = (function() {
  return "ListSet"
});
/** @constructor */
function $c_sci_Set$EmptySet$() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_Set$EmptySet$.prototype = new $h_sc_AbstractSet();
$c_sci_Set$EmptySet$.prototype.constructor = $c_sci_Set$EmptySet$;
/** @constructor */
function $h_sci_Set$EmptySet$() {
  /*<skip>*/
}
$h_sci_Set$EmptySet$.prototype = $c_sci_Set$EmptySet$.prototype;
$c_sci_Set$EmptySet$.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.init___ = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.apply__O__O = (function(v1) {
  return false
});
$c_sci_Set$EmptySet$.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$EmptySet$.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_Set$EmptySet$.prototype.size__I = (function() {
  return 0
});
$c_sci_Set$EmptySet$.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_Set$EmptySet$.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$EmptySet$.prototype.contains__O__Z = (function(elem) {
  return false
});
$c_sci_Set$EmptySet$.prototype.$$plus__O__sc_Set = (function(elem) {
  return new $c_sci_Set$Set1().init___O(elem)
});
var $d_sci_Set$EmptySet$ = new $TypeData().initClass({
  sci_Set$EmptySet$: 0
}, false, "scala.collection.immutable.Set$EmptySet$", {
  sci_Set$EmptySet$: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$EmptySet$.prototype.$classData = $d_sci_Set$EmptySet$;
var $n_sci_Set$EmptySet$ = (void 0);
function $m_sci_Set$EmptySet$() {
  if ((!$n_sci_Set$EmptySet$)) {
    $n_sci_Set$EmptySet$ = new $c_sci_Set$EmptySet$().init___()
  };
  return $n_sci_Set$EmptySet$
}
/** @constructor */
function $c_sci_Set$Set1() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null
}
$c_sci_Set$Set1.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set1.prototype.constructor = $c_sci_Set$Set1;
/** @constructor */
function $h_sci_Set$Set1() {
  /*<skip>*/
}
$h_sci_Set$Set1.prototype = $c_sci_Set$Set1.prototype;
$c_sci_Set$Set1.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set1.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set1.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set1.prototype.forall__F1__Z = (function(p) {
  return $uZ(p.apply__O__O(this.elem1$4))
});
$c_sci_Set$Set1.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4)
});
$c_sci_Set$Set1.prototype.size__I = (function() {
  return 1
});
$c_sci_Set$Set1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set1.prototype.init___O = (function(elem1) {
  this.elem1$4 = elem1;
  return this
});
$c_sci_Set$Set1.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set1.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set2().init___O__O(this.elem1$4, elem))
});
$c_sci_Set$Set1.prototype.contains__O__Z = (function(elem) {
  return $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4)
});
$c_sci_Set$Set1.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set1 = new $TypeData().initClass({
  sci_Set$Set1: 0
}, false, "scala.collection.immutable.Set$Set1", {
  sci_Set$Set1: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set1.prototype.$classData = $d_sci_Set$Set1;
/** @constructor */
function $c_sci_Set$Set2() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null
}
$c_sci_Set$Set2.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set2.prototype.constructor = $c_sci_Set$Set2;
/** @constructor */
function $h_sci_Set$Set2() {
  /*<skip>*/
}
$h_sci_Set$Set2.prototype = $c_sci_Set$Set2.prototype;
$c_sci_Set$Set2.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set2.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set2.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set2.prototype.init___O__O = (function(elem1, elem2) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  return this
});
$c_sci_Set$Set2.prototype.forall__F1__Z = (function(p) {
  return ($uZ(p.apply__O__O(this.elem1$4)) && $uZ(p.apply__O__O(this.elem2$4)))
});
$c_sci_Set$Set2.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set2.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4)
});
$c_sci_Set$Set2.prototype.size__I = (function() {
  return 2
});
$c_sci_Set$Set2.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set2.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set2.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set3().init___O__O__O(this.elem1$4, this.elem2$4, elem))
});
$c_sci_Set$Set2.prototype.contains__O__Z = (function(elem) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4))
});
$c_sci_Set$Set2.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set2 = new $TypeData().initClass({
  sci_Set$Set2: 0
}, false, "scala.collection.immutable.Set$Set2", {
  sci_Set$Set2: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set2.prototype.$classData = $d_sci_Set$Set2;
/** @constructor */
function $c_sci_Set$Set3() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null
}
$c_sci_Set$Set3.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set3.prototype.constructor = $c_sci_Set$Set3;
/** @constructor */
function $h_sci_Set$Set3() {
  /*<skip>*/
}
$h_sci_Set$Set3.prototype = $c_sci_Set$Set3.prototype;
$c_sci_Set$Set3.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set3.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set3.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set3.prototype.forall__F1__Z = (function(p) {
  return (($uZ(p.apply__O__O(this.elem1$4)) && $uZ(p.apply__O__O(this.elem2$4))) && $uZ(p.apply__O__O(this.elem3$4)))
});
$c_sci_Set$Set3.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set3.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4)
});
$c_sci_Set$Set3.prototype.size__I = (function() {
  return 3
});
$c_sci_Set$Set3.prototype.init___O__O__O = (function(elem1, elem2, elem3) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  return this
});
$c_sci_Set$Set3.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set3.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set3.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set4().init___O__O__O__O(this.elem1$4, this.elem2$4, this.elem3$4, elem))
});
$c_sci_Set$Set3.prototype.contains__O__Z = (function(elem) {
  return (($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4))
});
$c_sci_Set$Set3.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set3 = new $TypeData().initClass({
  sci_Set$Set3: 0
}, false, "scala.collection.immutable.Set$Set3", {
  sci_Set$Set3: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set3.prototype.$classData = $d_sci_Set$Set3;
/** @constructor */
function $c_sci_Set$Set4() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null;
  this.elem4$4 = null
}
$c_sci_Set$Set4.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set4.prototype.constructor = $c_sci_Set$Set4;
/** @constructor */
function $h_sci_Set$Set4() {
  /*<skip>*/
}
$h_sci_Set$Set4.prototype = $c_sci_Set$Set4.prototype;
$c_sci_Set$Set4.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set4.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set4.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set4.prototype.forall__F1__Z = (function(p) {
  return ((($uZ(p.apply__O__O(this.elem1$4)) && $uZ(p.apply__O__O(this.elem2$4))) && $uZ(p.apply__O__O(this.elem3$4))) && $uZ(p.apply__O__O(this.elem4$4)))
});
$c_sci_Set$Set4.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set4.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4);
  f.apply__O__O(this.elem4$4)
});
$c_sci_Set$Set4.prototype.size__I = (function() {
  return 4
});
$c_sci_Set$Set4.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4, this.elem4$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set4.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set4.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_HashSet().init___().$$plus__O__sci_HashSet(this.elem1$4).$$plus__O__sci_HashSet(this.elem2$4).$$plus__O__sci_HashSet(this.elem3$4).$$plus__O__sci_HashSet(this.elem4$4).$$plus__O__sci_HashSet(elem))
});
$c_sci_Set$Set4.prototype.contains__O__Z = (function(elem) {
  return ((($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem4$4))
});
$c_sci_Set$Set4.prototype.init___O__O__O__O = (function(elem1, elem2, elem3, elem4) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  this.elem4$4 = elem4;
  return this
});
$c_sci_Set$Set4.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set4 = new $TypeData().initClass({
  sci_Set$Set4: 0
}, false, "scala.collection.immutable.Set$Set4", {
  sci_Set$Set4: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set4.prototype.$classData = $d_sci_Set$Set4;
/** @constructor */
function $c_sci_HashSet() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_HashSet.prototype = new $h_sc_AbstractSet();
$c_sci_HashSet.prototype.constructor = $c_sci_HashSet;
/** @constructor */
function $h_sci_HashSet() {
  /*<skip>*/
}
$h_sci_HashSet.prototype = $c_sci_HashSet.prototype;
$c_sci_HashSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return new $c_sci_HashSet$HashSet1().init___O__I(key, hash)
});
$c_sci_HashSet.prototype.computeHash__O__I = (function(key) {
  return this.improve__I__I($m_sr_Statics$().anyHash__O__I(key))
});
$c_sci_HashSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_HashSet.prototype.init___ = (function() {
  return this
});
$c_sci_HashSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_HashSet.prototype.$$plus__O__sci_HashSet = (function(e) {
  return this.updated0__O__I__I__sci_HashSet(e, this.computeHash__O__I(e), 0)
});
$c_sci_HashSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_HashSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_HashSet$()
});
$c_sci_HashSet.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_HashSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  if ($is_sci_HashSet(that)) {
    var x2 = $as_sci_HashSet(that);
    return this.subsetOf0__sci_HashSet__I__Z(x2, 0)
  } else {
    var this$1 = this.iterator__sc_Iterator();
    return $f_sc_Iterator__forall__F1__Z(this$1, that)
  }
});
$c_sci_HashSet.prototype.size__I = (function() {
  return 0
});
$c_sci_HashSet.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_HashSet.prototype.empty__sc_Set = (function() {
  return $m_sci_HashSet$EmptyHashSet$()
});
$c_sci_HashSet.prototype.improve__I__I = (function(hcode) {
  var h = ((hcode + (~(hcode << 9))) | 0);
  h = (h ^ ((h >>> 14) | 0));
  h = ((h + (h << 4)) | 0);
  return (h ^ ((h >>> 10) | 0))
});
$c_sci_HashSet.prototype.contains__O__Z = (function(e) {
  return this.get0__O__I__I__Z(e, this.computeHash__O__I(e), 0)
});
$c_sci_HashSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return false
});
$c_sci_HashSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_HashSet(elem)
});
$c_sci_HashSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return true
});
function $is_sci_HashSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet)))
}
function $as_sci_HashSet(obj) {
  return (($is_sci_HashSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet"))
}
function $isArrayOf_sci_HashSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet)))
}
function $asArrayOf_sci_HashSet(obj, depth) {
  return (($isArrayOf_sci_HashSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet;", depth))
}
var $d_sci_HashSet = new $TypeData().initClass({
  sci_HashSet: 0
}, false, "scala.collection.immutable.HashSet", {
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet.prototype.$classData = $d_sci_HashSet;
/** @constructor */
function $c_sci_ListSet$EmptyListSet$() {
  $c_sci_ListSet.call(this)
}
$c_sci_ListSet$EmptyListSet$.prototype = new $h_sci_ListSet();
$c_sci_ListSet$EmptyListSet$.prototype.constructor = $c_sci_ListSet$EmptyListSet$;
/** @constructor */
function $h_sci_ListSet$EmptyListSet$() {
  /*<skip>*/
}
$h_sci_ListSet$EmptyListSet$.prototype = $c_sci_ListSet$EmptyListSet$.prototype;
$c_sci_ListSet$EmptyListSet$.prototype.init___ = (function() {
  return this
});
var $d_sci_ListSet$EmptyListSet$ = new $TypeData().initClass({
  sci_ListSet$EmptyListSet$: 0
}, false, "scala.collection.immutable.ListSet$EmptyListSet$", {
  sci_ListSet$EmptyListSet$: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$EmptyListSet$.prototype.$classData = $d_sci_ListSet$EmptyListSet$;
var $n_sci_ListSet$EmptyListSet$ = (void 0);
function $m_sci_ListSet$EmptyListSet$() {
  if ((!$n_sci_ListSet$EmptyListSet$)) {
    $n_sci_ListSet$EmptyListSet$ = new $c_sci_ListSet$EmptyListSet$().init___()
  };
  return $n_sci_ListSet$EmptyListSet$
}
/** @constructor */
function $c_sci_ListSet$Node() {
  $c_sci_ListSet.call(this);
  this.elem$5 = null;
  this.$$outer$5 = null
}
$c_sci_ListSet$Node.prototype = new $h_sci_ListSet();
$c_sci_ListSet$Node.prototype.constructor = $c_sci_ListSet$Node;
/** @constructor */
function $h_sci_ListSet$Node() {
  /*<skip>*/
}
$h_sci_ListSet$Node.prototype = $c_sci_ListSet$Node.prototype;
$c_sci_ListSet$Node.prototype.next__sci_ListSet = (function() {
  return this.$$outer$5
});
$c_sci_ListSet$Node.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_ListSet$Node.prototype.$$plus__O__sci_ListSet = (function(e) {
  return (this.containsInternal__p5__sci_ListSet__O__Z(this, e) ? this : new $c_sci_ListSet$Node().init___sci_ListSet__O(this, e))
});
$c_sci_ListSet$Node.prototype.sizeInternal__p5__sci_ListSet__I__I = (function(n, acc) {
  _sizeInternal: while (true) {
    if (n.isEmpty__Z()) {
      return acc
    } else {
      var temp$n = n.next__sci_ListSet();
      var temp$acc = ((1 + acc) | 0);
      n = temp$n;
      acc = temp$acc;
      continue _sizeInternal
    }
  }
});
$c_sci_ListSet$Node.prototype.size__I = (function() {
  return this.sizeInternal__p5__sci_ListSet__I__I(this, 0)
});
$c_sci_ListSet$Node.prototype.init___sci_ListSet__O = (function($$outer, elem) {
  this.elem$5 = elem;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$5 = $$outer
  };
  return this
});
$c_sci_ListSet$Node.prototype.elem__O = (function() {
  return this.elem$5
});
$c_sci_ListSet$Node.prototype.contains__O__Z = (function(e) {
  return this.containsInternal__p5__sci_ListSet__O__Z(this, e)
});
$c_sci_ListSet$Node.prototype.containsInternal__p5__sci_ListSet__O__Z = (function(n, e) {
  _containsInternal: while (true) {
    if ((!n.isEmpty__Z())) {
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(n.elem__O(), e)) {
        return true
      } else {
        n = n.next__sci_ListSet();
        continue _containsInternal
      }
    } else {
      return false
    }
  }
});
$c_sci_ListSet$Node.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
var $d_sci_ListSet$Node = new $TypeData().initClass({
  sci_ListSet$Node: 0
}, false, "scala.collection.immutable.ListSet$Node", {
  sci_ListSet$Node: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$Node.prototype.$classData = $d_sci_ListSet$Node;
/** @constructor */
function $c_scm_AbstractSeq() {
  $c_sc_AbstractSeq.call(this)
}
$c_scm_AbstractSeq.prototype = new $h_sc_AbstractSeq();
$c_scm_AbstractSeq.prototype.constructor = $c_scm_AbstractSeq;
/** @constructor */
function $h_scm_AbstractSeq() {
  /*<skip>*/
}
$h_scm_AbstractSeq.prototype = $c_scm_AbstractSeq.prototype;
$c_scm_AbstractSeq.prototype.seq__sc_TraversableOnce = (function() {
  return this.seq__scm_Seq()
});
$c_scm_AbstractSeq.prototype.seq__scm_Seq = (function() {
  return this
});
/** @constructor */
function $c_sci_HashSet$EmptyHashSet$() {
  $c_sci_HashSet.call(this)
}
$c_sci_HashSet$EmptyHashSet$.prototype = new $h_sci_HashSet();
$c_sci_HashSet$EmptyHashSet$.prototype.constructor = $c_sci_HashSet$EmptyHashSet$;
/** @constructor */
function $h_sci_HashSet$EmptyHashSet$() {
  /*<skip>*/
}
$h_sci_HashSet$EmptyHashSet$.prototype = $c_sci_HashSet$EmptyHashSet$.prototype;
$c_sci_HashSet$EmptyHashSet$.prototype.init___ = (function() {
  return this
});
var $d_sci_HashSet$EmptyHashSet$ = new $TypeData().initClass({
  sci_HashSet$EmptyHashSet$: 0
}, false, "scala.collection.immutable.HashSet$EmptyHashSet$", {
  sci_HashSet$EmptyHashSet$: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$EmptyHashSet$.prototype.$classData = $d_sci_HashSet$EmptyHashSet$;
var $n_sci_HashSet$EmptyHashSet$ = (void 0);
function $m_sci_HashSet$EmptyHashSet$() {
  if ((!$n_sci_HashSet$EmptyHashSet$)) {
    $n_sci_HashSet$EmptyHashSet$ = new $c_sci_HashSet$EmptyHashSet$().init___()
  };
  return $n_sci_HashSet$EmptyHashSet$
}
/** @constructor */
function $c_sci_HashSet$HashTrieSet() {
  $c_sci_HashSet.call(this);
  this.bitmap$5 = 0;
  this.elems$5 = null;
  this.size0$5 = 0
}
$c_sci_HashSet$HashTrieSet.prototype = new $h_sci_HashSet();
$c_sci_HashSet$HashTrieSet.prototype.constructor = $c_sci_HashSet$HashTrieSet;
/** @constructor */
function $h_sci_HashSet$HashTrieSet() {
  /*<skip>*/
}
$h_sci_HashSet$HashTrieSet.prototype = $c_sci_HashSet$HashTrieSet.prototype;
$c_sci_HashSet$HashTrieSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
  if (((this.bitmap$5 & mask) !== 0)) {
    var sub = this.elems$5.get(offset);
    var subNew = sub.updated0__O__I__I__sci_HashSet(key, hash, ((5 + level) | 0));
    if ((sub === subNew)) {
      return this
    } else {
      var elemsNew = $newArrayObject($d_sci_HashSet.getArrayOf(), [this.elems$5.u.length]);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew, 0, this.elems$5.u.length);
      elemsNew.set(offset, subNew);
      return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(this.bitmap$5, elemsNew, ((this.size0$5 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
    }
  } else {
    var elemsNew$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [((1 + this.elems$5.u.length) | 0)]);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew$2, 0, offset);
    elemsNew$2.set(offset, new $c_sci_HashSet$HashSet1().init___O__I(key, hash));
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$5.u.length - offset) | 0));
    var bitmapNew = (this.bitmap$5 | mask);
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmapNew, elemsNew$2, ((1 + this.size0$5) | 0))
  }
});
$c_sci_HashSet$HashTrieSet.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  while ((i < this.elems$5.u.length)) {
    this.elems$5.get(i).foreach__F1__V(f);
    i = ((1 + i) | 0)
  }
});
$c_sci_HashSet$HashTrieSet.prototype.size__I = (function() {
  return this.size0$5
});
$c_sci_HashSet$HashTrieSet.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_HashSet$HashTrieSet$$anon$1().init___sci_HashSet$HashTrieSet(this)
});
$c_sci_HashSet$HashTrieSet.prototype.init___I__Asci_HashSet__I = (function(bitmap, elems, size0) {
  this.bitmap$5 = bitmap;
  this.elems$5 = elems;
  this.size0$5 = size0;
  $m_s_Predef$().assert__Z__V(($m_jl_Integer$().bitCount__I__I(bitmap) === elems.u.length));
  return this
});
$c_sci_HashSet$HashTrieSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  if ((this.bitmap$5 === (-1))) {
    return this.elems$5.get((31 & index)).get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else if (((this.bitmap$5 & mask) !== 0)) {
    var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
    return this.elems$5.get(offset).get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else {
    return false
  }
});
$c_sci_HashSet$HashTrieSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  if ((that === this)) {
    return true
  } else {
    if ($is_sci_HashSet$HashTrieSet(that)) {
      var x2 = $as_sci_HashSet$HashTrieSet(that);
      if ((this.size0$5 <= x2.size0$5)) {
        var abm = this.bitmap$5;
        var a = this.elems$5;
        var ai = 0;
        var b = x2.elems$5;
        var bbm = x2.bitmap$5;
        var bi = 0;
        if (((abm & bbm) === abm)) {
          while ((abm !== 0)) {
            var alsb = (abm ^ (abm & (((-1) + abm) | 0)));
            var blsb = (bbm ^ (bbm & (((-1) + bbm) | 0)));
            if ((alsb === blsb)) {
              if ((!a.get(ai).subsetOf0__sci_HashSet__I__Z(b.get(bi), ((5 + level) | 0)))) {
                return false
              };
              abm = (abm & (~alsb));
              ai = ((1 + ai) | 0)
            };
            bbm = (bbm & (~blsb));
            bi = ((1 + bi) | 0)
          };
          return true
        } else {
          return false
        }
      }
    };
    return false
  }
});
function $is_sci_HashSet$HashTrieSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashTrieSet)))
}
function $as_sci_HashSet$HashTrieSet(obj) {
  return (($is_sci_HashSet$HashTrieSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet$HashTrieSet"))
}
function $isArrayOf_sci_HashSet$HashTrieSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashTrieSet)))
}
function $asArrayOf_sci_HashSet$HashTrieSet(obj, depth) {
  return (($isArrayOf_sci_HashSet$HashTrieSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashTrieSet;", depth))
}
var $d_sci_HashSet$HashTrieSet = new $TypeData().initClass({
  sci_HashSet$HashTrieSet: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet", {
  sci_HashSet$HashTrieSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashTrieSet.prototype.$classData = $d_sci_HashSet$HashTrieSet;
/** @constructor */
function $c_sci_HashSet$LeafHashSet() {
  $c_sci_HashSet.call(this)
}
$c_sci_HashSet$LeafHashSet.prototype = new $h_sci_HashSet();
$c_sci_HashSet$LeafHashSet.prototype.constructor = $c_sci_HashSet$LeafHashSet;
/** @constructor */
function $h_sci_HashSet$LeafHashSet() {
  /*<skip>*/
}
$h_sci_HashSet$LeafHashSet.prototype = $c_sci_HashSet$LeafHashSet.prototype;
/** @constructor */
function $c_sci_ListMap() {
  $c_sci_AbstractMap.call(this)
}
$c_sci_ListMap.prototype = new $h_sci_AbstractMap();
$c_sci_ListMap.prototype.constructor = $c_sci_ListMap;
/** @constructor */
function $h_sci_ListMap() {
  /*<skip>*/
}
$h_sci_ListMap.prototype = $c_sci_ListMap.prototype;
$c_sci_ListMap.prototype.value__O = (function() {
  throw new $c_ju_NoSuchElementException().init___T("value of empty map")
});
$c_sci_ListMap.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_ListMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_ListMap.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.$$plus__T2__sci_ListMap(kv)
});
$c_sci_ListMap.prototype.empty__sc_Map = (function() {
  return $m_sci_ListMap$EmptyListMap$()
});
$c_sci_ListMap.prototype.empty__sci_Map = (function() {
  return $m_sci_ListMap$EmptyListMap$()
});
$c_sci_ListMap.prototype.size__I = (function() {
  return 0
});
$c_sci_ListMap.prototype.seq__sc_Map = (function() {
  return this
});
$c_sci_ListMap.prototype.$$plus__T2__sci_ListMap = (function(kv) {
  return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(this, kv.$$und1__O(), kv.$$und2__O())
});
$c_sci_ListMap.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.reverseList$1__p5__sci_List();
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$1)
});
$c_sci_ListMap.prototype.key__O = (function() {
  throw new $c_ju_NoSuchElementException().init___T("key of empty map")
});
$c_sci_ListMap.prototype.updated__O__O__sci_ListMap = (function(key, value) {
  return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(this, key, value)
});
$c_sci_ListMap.prototype.get__O__s_Option = (function(key) {
  return $m_s_None$()
});
$c_sci_ListMap.prototype.reverseList$1__p5__sci_List = (function() {
  var curr = this;
  var res = $m_sci_Nil$();
  while ((!curr.isEmpty__Z())) {
    var x$4 = new $c_T2().init___O__O(curr.key__O(), curr.value__O());
    var this$1 = res;
    res = new $c_sci_$colon$colon().init___O__sci_List(x$4, this$1);
    curr = curr.next__sci_ListMap()
  };
  return res
});
$c_sci_ListMap.prototype.next__sci_ListMap = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next of empty map")
});
$c_sci_ListMap.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.$$plus__T2__sci_ListMap(kv)
});
$c_sci_ListMap.prototype.stringPrefix__T = (function() {
  return "ListMap"
});
function $is_sci_ListMap(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_ListMap)))
}
function $as_sci_ListMap(obj) {
  return (($is_sci_ListMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.ListMap"))
}
function $isArrayOf_sci_ListMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ListMap)))
}
function $asArrayOf_sci_ListMap(obj, depth) {
  return (($isArrayOf_sci_ListMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.ListMap;", depth))
}
/** @constructor */
function $c_sci_Map$EmptyMap$() {
  $c_sci_AbstractMap.call(this)
}
$c_sci_Map$EmptyMap$.prototype = new $h_sci_AbstractMap();
$c_sci_Map$EmptyMap$.prototype.constructor = $c_sci_Map$EmptyMap$;
/** @constructor */
function $h_sci_Map$EmptyMap$() {
  /*<skip>*/
}
$h_sci_Map$EmptyMap$.prototype = $c_sci_Map$EmptyMap$.prototype;
$c_sci_Map$EmptyMap$.prototype.init___ = (function() {
  return this
});
$c_sci_Map$EmptyMap$.prototype.apply__O__O = (function(key) {
  this.apply__O__sr_Nothing$(key)
});
$c_sci_Map$EmptyMap$.prototype.$$plus__T2__sci_Map = (function(kv) {
  var key = kv.$$und1__O();
  var value = kv.$$und2__O();
  return new $c_sci_Map$Map1().init___O__O(key, value)
});
$c_sci_Map$EmptyMap$.prototype.size__I = (function() {
  return 0
});
$c_sci_Map$EmptyMap$.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_Map$EmptyMap$.prototype.get__O__s_Option = (function(key) {
  return $m_s_None$()
});
$c_sci_Map$EmptyMap$.prototype.contains__O__Z = (function(key) {
  return false
});
$c_sci_Map$EmptyMap$.prototype.apply__O__sr_Nothing$ = (function(key) {
  throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
});
$c_sci_Map$EmptyMap$.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  var key = kv.$$und1__O();
  var value = kv.$$und2__O();
  return new $c_sci_Map$Map1().init___O__O(key, value)
});
var $d_sci_Map$EmptyMap$ = new $TypeData().initClass({
  sci_Map$EmptyMap$: 0
}, false, "scala.collection.immutable.Map$EmptyMap$", {
  sci_Map$EmptyMap$: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$EmptyMap$.prototype.$classData = $d_sci_Map$EmptyMap$;
var $n_sci_Map$EmptyMap$ = (void 0);
function $m_sci_Map$EmptyMap$() {
  if ((!$n_sci_Map$EmptyMap$)) {
    $n_sci_Map$EmptyMap$ = new $c_sci_Map$EmptyMap$().init___()
  };
  return $n_sci_Map$EmptyMap$
}
/** @constructor */
function $c_sci_Map$Map1() {
  $c_sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null
}
$c_sci_Map$Map1.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map1.prototype.constructor = $c_sci_Map$Map1;
/** @constructor */
function $h_sci_Map$Map1() {
  /*<skip>*/
}
$h_sci_Map$Map1.prototype = $c_sci_Map$Map1.prototype;
$c_sci_Map$Map1.prototype.apply__O__O = (function(key) {
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
    return this.value1$5
  } else {
    throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
  }
});
$c_sci_Map$Map1.prototype.init___O__O = (function(key1, value1) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  return this
});
$c_sci_Map$Map1.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1__O(), kv.$$und2__O())
});
$c_sci_Map$Map1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5))
});
$c_sci_Map$Map1.prototype.size__I = (function() {
  return 1
});
$c_sci_Map$Map1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_T2().init___O__O(this.key1$5, this.value1$5)]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Map$Map1.prototype.updated__O__O__sci_Map = (function(key, value) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map1().init___O__O(this.key1$5, value) : new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, this.value1$5, key, value))
});
$c_sci_Map$Map1.prototype.get__O__s_Option = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : $m_s_None$())
});
$c_sci_Map$Map1.prototype.contains__O__Z = (function(key) {
  return $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)
});
$c_sci_Map$Map1.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1__O(), kv.$$und2__O())
});
var $d_sci_Map$Map1 = new $TypeData().initClass({
  sci_Map$Map1: 0
}, false, "scala.collection.immutable.Map$Map1", {
  sci_Map$Map1: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map1.prototype.$classData = $d_sci_Map$Map1;
/** @constructor */
function $c_sci_Map$Map2() {
  $c_sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null;
  this.key2$5 = null;
  this.value2$5 = null
}
$c_sci_Map$Map2.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map2.prototype.constructor = $c_sci_Map$Map2;
/** @constructor */
function $h_sci_Map$Map2() {
  /*<skip>*/
}
$h_sci_Map$Map2.prototype = $c_sci_Map$Map2.prototype;
$c_sci_Map$Map2.prototype.apply__O__O = (function(key) {
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
    return this.value1$5
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) {
    return this.value2$5
  } else {
    throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
  }
});
$c_sci_Map$Map2.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1__O(), kv.$$und2__O())
});
$c_sci_Map$Map2.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key2$5, this.value2$5))
});
$c_sci_Map$Map2.prototype.size__I = (function() {
  return 2
});
$c_sci_Map$Map2.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_T2().init___O__O(this.key1$5, this.value1$5), new $c_T2().init___O__O(this.key2$5, this.value2$5)]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Map$Map2.prototype.updated__O__O__sci_Map = (function(key, value) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map2().init___O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value) : new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, key, value)))
});
$c_sci_Map$Map2.prototype.get__O__s_Option = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_s_Some().init___O(this.value2$5) : $m_s_None$()))
});
$c_sci_Map$Map2.prototype.contains__O__Z = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5))
});
$c_sci_Map$Map2.prototype.init___O__O__O__O = (function(key1, value1, key2, value2) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  this.key2$5 = key2;
  this.value2$5 = value2;
  return this
});
$c_sci_Map$Map2.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1__O(), kv.$$und2__O())
});
var $d_sci_Map$Map2 = new $TypeData().initClass({
  sci_Map$Map2: 0
}, false, "scala.collection.immutable.Map$Map2", {
  sci_Map$Map2: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map2.prototype.$classData = $d_sci_Map$Map2;
/** @constructor */
function $c_sci_Map$Map3() {
  $c_sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null;
  this.key2$5 = null;
  this.value2$5 = null;
  this.key3$5 = null;
  this.value3$5 = null
}
$c_sci_Map$Map3.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map3.prototype.constructor = $c_sci_Map$Map3;
/** @constructor */
function $h_sci_Map$Map3() {
  /*<skip>*/
}
$h_sci_Map$Map3.prototype = $c_sci_Map$Map3.prototype;
$c_sci_Map$Map3.prototype.apply__O__O = (function(key) {
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
    return this.value1$5
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) {
    return this.value2$5
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5)) {
    return this.value3$5
  } else {
    throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
  }
});
$c_sci_Map$Map3.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1__O(), kv.$$und2__O())
});
$c_sci_Map$Map3.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key2$5, this.value2$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key3$5, this.value3$5))
});
$c_sci_Map$Map3.prototype.init___O__O__O__O__O__O = (function(key1, value1, key2, value2, key3, value3) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  this.key2$5 = key2;
  this.value2$5 = value2;
  this.key3$5 = key3;
  this.value3$5 = value3;
  return this
});
$c_sci_Map$Map3.prototype.size__I = (function() {
  return 3
});
$c_sci_Map$Map3.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_T2().init___O__O(this.key1$5, this.value1$5), new $c_T2().init___O__O(this.key2$5, this.value2$5), new $c_T2().init___O__O(this.key3$5, this.value3$5)]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Map$Map3.prototype.updated__O__O__sci_Map = (function(key, value) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5, this.key3$5, this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value, this.key3$5, this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_sci_Map$Map3().init___O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, value) : new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, this.value3$5, key, value))))
});
$c_sci_Map$Map3.prototype.get__O__s_Option = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_s_Some().init___O(this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_s_Some().init___O(this.value3$5) : $m_s_None$())))
});
$c_sci_Map$Map3.prototype.contains__O__Z = (function(key) {
  return (($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5))
});
$c_sci_Map$Map3.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1__O(), kv.$$und2__O())
});
var $d_sci_Map$Map3 = new $TypeData().initClass({
  sci_Map$Map3: 0
}, false, "scala.collection.immutable.Map$Map3", {
  sci_Map$Map3: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map3.prototype.$classData = $d_sci_Map$Map3;
/** @constructor */
function $c_sci_Map$Map4() {
  $c_sci_AbstractMap.call(this);
  this.key1$5 = null;
  this.value1$5 = null;
  this.key2$5 = null;
  this.value2$5 = null;
  this.key3$5 = null;
  this.value3$5 = null;
  this.key4$5 = null;
  this.value4$5 = null
}
$c_sci_Map$Map4.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map4.prototype.constructor = $c_sci_Map$Map4;
/** @constructor */
function $h_sci_Map$Map4() {
  /*<skip>*/
}
$h_sci_Map$Map4.prototype = $c_sci_Map$Map4.prototype;
$c_sci_Map$Map4.prototype.apply__O__O = (function(key) {
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5)) {
    return this.value1$5
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) {
    return this.value2$5
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5)) {
    return this.value3$5
  } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5)) {
    return this.value4$5
  } else {
    throw new $c_ju_NoSuchElementException().init___T(("key not found: " + key))
  }
});
$c_sci_Map$Map4.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1__O(), kv.$$und2__O())
});
$c_sci_Map$Map4.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(new $c_T2().init___O__O(this.key1$5, this.value1$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key2$5, this.value2$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key3$5, this.value3$5));
  f.apply__O__O(new $c_T2().init___O__O(this.key4$5, this.value4$5))
});
$c_sci_Map$Map4.prototype.size__I = (function() {
  return 4
});
$c_sci_Map$Map4.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_T2().init___O__O(this.key1$5, this.value1$5), new $c_T2().init___O__O(this.key2$5, this.value2$5), new $c_T2().init___O__O(this.key3$5, this.value3$5), new $c_T2().init___O__O(this.key4$5, this.value4$5)]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Map$Map4.prototype.init___O__O__O__O__O__O__O__O = (function(key1, value1, key2, value2, key3, value3, key4, value4) {
  this.key1$5 = key1;
  this.value1$5 = value1;
  this.key2$5 = key2;
  this.value2$5 = value2;
  this.key3$5 = key3;
  this.value3$5 = value3;
  this.key4$5 = key4;
  this.value4$5 = value4;
  return this
});
$c_sci_Map$Map4.prototype.updated__O__O__sci_Map = (function(key, value) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, value, this.key2$5, this.value2$5, this.key3$5, this.value3$5, this.key4$5, this.value4$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, value, this.key3$5, this.value3$5, this.key4$5, this.value4$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, value, this.key4$5, this.value4$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5) ? new $c_sci_Map$Map4().init___O__O__O__O__O__O__O__O(this.key1$5, this.value1$5, this.key2$5, this.value2$5, this.key3$5, this.value3$5, this.key4$5, value) : new $c_sci_HashMap().init___().updated__O__O__sci_HashMap(this.key1$5, this.value1$5).updated__O__O__sci_HashMap(this.key2$5, this.value2$5).updated__O__O__sci_HashMap(this.key3$5, this.value3$5).updated__O__O__sci_HashMap(this.key4$5, this.value4$5).updated__O__O__sci_HashMap(key, value)))))
});
$c_sci_Map$Map4.prototype.get__O__s_Option = (function(key) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) ? new $c_s_Some().init___O(this.value1$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5) ? new $c_s_Some().init___O(this.value2$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5) ? new $c_s_Some().init___O(this.value3$5) : ($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5) ? new $c_s_Some().init___O(this.value4$5) : $m_s_None$()))))
});
$c_sci_Map$Map4.prototype.contains__O__Z = (function(key) {
  return ((($m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key1$5) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key2$5)) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key3$5)) || $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key4$5))
});
$c_sci_Map$Map4.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.updated__O__O__sci_Map(kv.$$und1__O(), kv.$$und2__O())
});
var $d_sci_Map$Map4 = new $TypeData().initClass({
  sci_Map$Map4: 0
}, false, "scala.collection.immutable.Map$Map4", {
  sci_Map$Map4: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Map$Map4.prototype.$classData = $d_sci_Map$Map4;
/** @constructor */
function $c_sci_HashMap() {
  $c_sci_AbstractMap.call(this)
}
$c_sci_HashMap.prototype = new $h_sci_AbstractMap();
$c_sci_HashMap.prototype.constructor = $c_sci_HashMap;
/** @constructor */
function $h_sci_HashMap() {
  /*<skip>*/
}
$h_sci_HashMap.prototype = $c_sci_HashMap.prototype;
$c_sci_HashMap.prototype.computeHash__O__I = (function(key) {
  return this.improve__I__I($m_sr_Statics$().anyHash__O__I(key))
});
$c_sci_HashMap.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_HashMap.prototype.init___ = (function() {
  return this
});
$c_sci_HashMap.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_HashMap.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  return new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv)
});
$c_sci_HashMap.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  return $m_s_None$()
});
$c_sci_HashMap.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.$$plus__T2__sci_HashMap(kv)
});
$c_sci_HashMap.prototype.$$plus__T2__sci_HashMap = (function(kv) {
  return this.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(kv.$$und1__O(), this.computeHash__O__I(kv.$$und1__O()), 0, kv.$$und2__O(), kv, null)
});
$c_sci_HashMap.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_HashMap.prototype.updated__O__O__sci_HashMap = (function(key, value) {
  return this.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, this.computeHash__O__I(key), 0, value, null, null)
});
$c_sci_HashMap.prototype.empty__sc_Map = (function() {
  $m_sci_HashMap$();
  return $m_sci_HashMap$EmptyHashMap$()
});
$c_sci_HashMap.prototype.empty__sci_Map = (function() {
  $m_sci_HashMap$();
  return $m_sci_HashMap$EmptyHashMap$()
});
$c_sci_HashMap.prototype.size__I = (function() {
  return 0
});
$c_sci_HashMap.prototype.seq__sc_Map = (function() {
  return this
});
$c_sci_HashMap.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_HashMap.prototype.improve__I__I = (function(hcode) {
  var h = ((hcode + (~(hcode << 9))) | 0);
  h = (h ^ ((h >>> 14) | 0));
  h = ((h + (h << 4)) | 0);
  return (h ^ ((h >>> 10) | 0))
});
$c_sci_HashMap.prototype.get__O__s_Option = (function(key) {
  return this.get0__O__I__I__s_Option(key, this.computeHash__O__I(key), 0)
});
$c_sci_HashMap.prototype.contains0__O__I__I__Z = (function(key, hash, level) {
  return false
});
$c_sci_HashMap.prototype.contains__O__Z = (function(key) {
  return this.contains0__O__I__I__Z(key, this.computeHash__O__I(key), 0)
});
$c_sci_HashMap.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.$$plus__T2__sci_HashMap(kv)
});
var $d_sci_HashMap = new $TypeData().initClass({
  sci_HashMap: 0
}, false, "scala.collection.immutable.HashMap", {
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap.prototype.$classData = $d_sci_HashMap;
/** @constructor */
function $c_sci_HashSet$HashSet1() {
  $c_sci_HashSet$LeafHashSet.call(this);
  this.key$6 = null;
  this.hash$6 = 0
}
$c_sci_HashSet$HashSet1.prototype = new $h_sci_HashSet$LeafHashSet();
$c_sci_HashSet$HashSet1.prototype.constructor = $c_sci_HashSet$HashSet1;
/** @constructor */
function $h_sci_HashSet$HashSet1() {
  /*<skip>*/
}
$h_sci_HashSet$HashSet1.prototype = $c_sci_HashSet$HashSet1.prototype;
$c_sci_HashSet$HashSet1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  if (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
    return this
  } else if ((hash !== this.hash$6)) {
    return $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level)
  } else {
    var this$2 = $m_sci_ListSet$EmptyListSet$();
    var elem = this.key$6;
    return new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, new $c_sci_ListSet$Node().init___sci_ListSet__O(this$2, elem).$$plus__O__sci_ListSet(key))
  }
});
$c_sci_HashSet$HashSet1.prototype.init___O__I = (function(key, hash) {
  this.key$6 = key;
  this.hash$6 = hash;
  return this
});
$c_sci_HashSet$HashSet1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.key$6)
});
$c_sci_HashSet$HashSet1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.key$6]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_HashSet$HashSet1.prototype.size__I = (function() {
  return 1
});
$c_sci_HashSet$HashSet1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))
});
$c_sci_HashSet$HashSet1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return that.get0__O__I__I__Z(this.key$6, this.hash$6, level)
});
function $is_sci_HashSet$HashSet1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashSet1)))
}
function $as_sci_HashSet$HashSet1(obj) {
  return (($is_sci_HashSet$HashSet1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet$HashSet1"))
}
function $isArrayOf_sci_HashSet$HashSet1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashSet1)))
}
function $asArrayOf_sci_HashSet$HashSet1(obj, depth) {
  return (($isArrayOf_sci_HashSet$HashSet1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashSet1;", depth))
}
var $d_sci_HashSet$HashSet1 = new $TypeData().initClass({
  sci_HashSet$HashSet1: 0
}, false, "scala.collection.immutable.HashSet$HashSet1", {
  sci_HashSet$HashSet1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSet1.prototype.$classData = $d_sci_HashSet$HashSet1;
/** @constructor */
function $c_sci_HashSet$HashSetCollision1() {
  $c_sci_HashSet$LeafHashSet.call(this);
  this.hash$6 = 0;
  this.ks$6 = null
}
$c_sci_HashSet$HashSetCollision1.prototype = new $h_sci_HashSet$LeafHashSet();
$c_sci_HashSet$HashSetCollision1.prototype.constructor = $c_sci_HashSet$HashSetCollision1;
/** @constructor */
function $h_sci_HashSet$HashSetCollision1() {
  /*<skip>*/
}
$h_sci_HashSet$HashSetCollision1.prototype = $c_sci_HashSet$HashSetCollision1.prototype;
$c_sci_HashSet$HashSetCollision1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return ((hash === this.hash$6) ? new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, this.ks$6.$$plus__O__sci_ListSet(key)) : $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level))
});
$c_sci_HashSet$HashSetCollision1.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.ks$6;
  var this$2 = this$1.reverseList$1__p4__sci_List();
  var this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
  $f_sc_Iterator__foreach__F1__V(this$3, f)
});
$c_sci_HashSet$HashSetCollision1.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.ks$6;
  var this$2 = this$1.reverseList$1__p4__sci_List();
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2)
});
$c_sci_HashSet$HashSetCollision1.prototype.size__I = (function() {
  return this.ks$6.size__I()
});
$c_sci_HashSet$HashSetCollision1.prototype.init___I__sci_ListSet = (function(hash, ks) {
  this.hash$6 = hash;
  this.ks$6 = ks;
  return this
});
$c_sci_HashSet$HashSetCollision1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && this.ks$6.contains__O__Z(key))
});
$c_sci_HashSet$HashSetCollision1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  var this$1 = this.ks$6;
  var this$2 = this$1.reverseList$1__p4__sci_List();
  var this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
  var res = true;
  while ((res && this$3.hasNext__Z())) {
    var arg1 = this$3.next__O();
    res = that.get0__O__I__I__Z(arg1, this.hash$6, level)
  };
  return res
});
var $d_sci_HashSet$HashSetCollision1 = new $TypeData().initClass({
  sci_HashSet$HashSetCollision1: 0
}, false, "scala.collection.immutable.HashSet$HashSetCollision1", {
  sci_HashSet$HashSetCollision1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSetCollision1.prototype.$classData = $d_sci_HashSet$HashSetCollision1;
/** @constructor */
function $c_sci_ListMap$EmptyListMap$() {
  $c_sci_ListMap.call(this)
}
$c_sci_ListMap$EmptyListMap$.prototype = new $h_sci_ListMap();
$c_sci_ListMap$EmptyListMap$.prototype.constructor = $c_sci_ListMap$EmptyListMap$;
/** @constructor */
function $h_sci_ListMap$EmptyListMap$() {
  /*<skip>*/
}
$h_sci_ListMap$EmptyListMap$.prototype = $c_sci_ListMap$EmptyListMap$.prototype;
$c_sci_ListMap$EmptyListMap$.prototype.init___ = (function() {
  return this
});
var $d_sci_ListMap$EmptyListMap$ = new $TypeData().initClass({
  sci_ListMap$EmptyListMap$: 0
}, false, "scala.collection.immutable.ListMap$EmptyListMap$", {
  sci_ListMap$EmptyListMap$: 1,
  sci_ListMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListMap$EmptyListMap$.prototype.$classData = $d_sci_ListMap$EmptyListMap$;
var $n_sci_ListMap$EmptyListMap$ = (void 0);
function $m_sci_ListMap$EmptyListMap$() {
  if ((!$n_sci_ListMap$EmptyListMap$)) {
    $n_sci_ListMap$EmptyListMap$ = new $c_sci_ListMap$EmptyListMap$().init___()
  };
  return $n_sci_ListMap$EmptyListMap$
}
/** @constructor */
function $c_sci_ListMap$Node() {
  $c_sci_ListMap.call(this);
  this.key$6 = null;
  this.value$6 = null;
  this.$$outer$6 = null
}
$c_sci_ListMap$Node.prototype = new $h_sci_ListMap();
$c_sci_ListMap$Node.prototype.constructor = $c_sci_ListMap$Node;
/** @constructor */
function $h_sci_ListMap$Node() {
  /*<skip>*/
}
$h_sci_ListMap$Node.prototype = $c_sci_ListMap$Node.prototype;
$c_sci_ListMap$Node.prototype.removeInternal__p6__O__sci_ListMap__sci_List__sci_ListMap = (function(k, cur, acc) {
  _removeInternal: while (true) {
    if (cur.isEmpty__Z()) {
      var this$1 = acc;
      return $as_sci_ListMap($f_sc_LinearSeqOptimized__last__O(this$1))
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
      var x$5 = cur.next__sci_ListMap();
      var this$2 = acc;
      var acc$1 = x$5;
      var these = this$2;
      while ((!these.isEmpty__Z())) {
        var arg1 = acc$1;
        var arg2 = these.head__O();
        var x0$1 = $as_sci_ListMap(arg1);
        var x1$1 = $as_sci_ListMap(arg2);
        acc$1 = new $c_sci_ListMap$Node().init___sci_ListMap__O__O(x0$1, x1$1.key__O(), x1$1.value__O());
        these = $as_sc_LinearSeqOptimized(these.tail__O())
      };
      return $as_sci_ListMap(acc$1)
    } else {
      var temp$cur = cur.next__sci_ListMap();
      var x$6 = cur;
      var this$3 = acc;
      var temp$acc = new $c_sci_$colon$colon().init___O__sci_List(x$6, this$3);
      cur = temp$cur;
      acc = temp$acc;
      continue _removeInternal
    }
  }
});
$c_sci_ListMap$Node.prototype.apply__O__O = (function(k) {
  return this.applyInternal__p6__sci_ListMap__O__O(this, k)
});
$c_sci_ListMap$Node.prototype.value__O = (function() {
  return this.value$6
});
$c_sci_ListMap$Node.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_ListMap$Node.prototype.applyInternal__p6__sci_ListMap__O__O = (function(cur, k) {
  _applyInternal: while (true) {
    if (cur.isEmpty__Z()) {
      throw new $c_ju_NoSuchElementException().init___T(("key not found: " + k))
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
      return cur.value__O()
    } else {
      cur = cur.next__sci_ListMap();
      continue _applyInternal
    }
  }
});
$c_sci_ListMap$Node.prototype.getInternal__p6__sci_ListMap__O__s_Option = (function(cur, k) {
  _getInternal: while (true) {
    if (cur.isEmpty__Z()) {
      return $m_s_None$()
    } else if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
      return new $c_s_Some().init___O(cur.value__O())
    } else {
      cur = cur.next__sci_ListMap();
      continue _getInternal
    }
  }
});
$c_sci_ListMap$Node.prototype.sizeInternal__p6__sci_ListMap__I__I = (function(cur, acc) {
  _sizeInternal: while (true) {
    if (cur.isEmpty__Z()) {
      return acc
    } else {
      var temp$cur = cur.next__sci_ListMap();
      var temp$acc = ((1 + acc) | 0);
      cur = temp$cur;
      acc = temp$acc;
      continue _sizeInternal
    }
  }
});
$c_sci_ListMap$Node.prototype.$$plus__T2__sci_Map = (function(kv) {
  return this.$$plus__T2__sci_ListMap(kv)
});
$c_sci_ListMap$Node.prototype.size__I = (function() {
  return this.sizeInternal__p6__sci_ListMap__I__I(this, 0)
});
$c_sci_ListMap$Node.prototype.key__O = (function() {
  return this.key$6
});
$c_sci_ListMap$Node.prototype.$$plus__T2__sci_ListMap = (function(kv) {
  var k = kv.$$und1__O();
  var m = this.removeInternal__p6__O__sci_ListMap__sci_List__sci_ListMap(k, this, $m_sci_Nil$());
  return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(m, kv.$$und1__O(), kv.$$und2__O())
});
$c_sci_ListMap$Node.prototype.updated__O__O__sci_ListMap = (function(k, v) {
  var m = this.removeInternal__p6__O__sci_ListMap__sci_List__sci_ListMap(k, this, $m_sci_Nil$());
  return new $c_sci_ListMap$Node().init___sci_ListMap__O__O(m, k, v)
});
$c_sci_ListMap$Node.prototype.get__O__s_Option = (function(k) {
  return this.getInternal__p6__sci_ListMap__O__s_Option(this, k)
});
$c_sci_ListMap$Node.prototype.contains__O__Z = (function(k) {
  return this.containsInternal__p6__sci_ListMap__O__Z(this, k)
});
$c_sci_ListMap$Node.prototype.init___sci_ListMap__O__O = (function($$outer, key, value) {
  this.key$6 = key;
  this.value$6 = value;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$6 = $$outer
  };
  return this
});
$c_sci_ListMap$Node.prototype.containsInternal__p6__sci_ListMap__O__Z = (function(cur, k) {
  _containsInternal: while (true) {
    if ((!cur.isEmpty__Z())) {
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(k, cur.key__O())) {
        return true
      } else {
        cur = cur.next__sci_ListMap();
        continue _containsInternal
      }
    } else {
      return false
    }
  }
});
$c_sci_ListMap$Node.prototype.next__sci_ListMap = (function() {
  return this.$$outer$6
});
$c_sci_ListMap$Node.prototype.$$plus__T2__sc_GenMap = (function(kv) {
  return this.$$plus__T2__sci_ListMap(kv)
});
var $d_sci_ListMap$Node = new $TypeData().initClass({
  sci_ListMap$Node: 0
}, false, "scala.collection.immutable.ListMap$Node", {
  sci_ListMap$Node: 1,
  sci_ListMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListMap$Node.prototype.$classData = $d_sci_ListMap$Node;
/** @constructor */
function $c_sci_Range() {
  $c_sc_AbstractSeq.call(this);
  this.start$4 = 0;
  this.end$4 = 0;
  this.step$4 = 0;
  this.isEmpty$4 = false;
  this.scala$collection$immutable$Range$$numRangeElements$4 = 0;
  this.scala$collection$immutable$Range$$lastElement$4 = 0
}
$c_sci_Range.prototype = new $h_sc_AbstractSeq();
$c_sci_Range.prototype.constructor = $c_sci_Range;
/** @constructor */
function $h_sci_Range() {
  /*<skip>*/
}
$h_sci_Range.prototype = $c_sci_Range.prototype;
$c_sci_Range.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Range.prototype.isInclusive__Z = (function() {
  return false
});
$c_sci_Range.prototype.apply__I__O = (function(idx) {
  return this.apply$mcII$sp__I__I(idx)
});
$c_sci_Range.prototype.apply__O__O = (function(v1) {
  var idx = $uI(v1);
  return this.apply$mcII$sp__I__I(idx)
});
$c_sci_Range.prototype.isEmpty__Z = (function() {
  return this.isEmpty$4
});
$c_sci_Range.prototype.longLength__p4__J = (function() {
  var t = this.gap__p4__J();
  var lo = t.lo$2;
  var hi$1 = t.hi$2;
  var value = this.step$4;
  var hi = (value >> 31);
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo$1 = this$1.divideImpl__I__I__I__I__I(lo, hi$1, value, hi);
  var hi$2 = this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
  var value$1 = (this.hasStub__p4__Z() ? 1 : 0);
  var hi$3 = (value$1 >> 31);
  var lo$2 = ((lo$1 + value$1) | 0);
  var hi$4 = ((((-2147483648) ^ lo$2) < ((-2147483648) ^ lo$1)) ? ((1 + ((hi$2 + hi$3) | 0)) | 0) : ((hi$2 + hi$3) | 0));
  return new $c_sjsr_RuntimeLong().init___I__I(lo$2, hi$4)
});
$c_sci_Range.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Range.prototype.equals__O__Z = (function(other) {
  if ($is_sci_Range(other)) {
    var x2 = $as_sci_Range(other);
    if (this.isEmpty$4) {
      return x2.isEmpty$4
    } else if (($f_sc_TraversableOnce__nonEmpty__Z(x2) && (this.start$4 === x2.start$4))) {
      var l0 = this.last__I();
      return ((l0 === x2.last__I()) && ((this.start$4 === l0) || (this.step$4 === x2.step$4)))
    } else {
      return false
    }
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, other)
  }
});
$c_sci_Range.prototype.apply$mcII$sp__I__I = (function(idx) {
  this.scala$collection$immutable$Range$$validateMaxLength__V();
  if (((idx < 0) || (idx >= this.scala$collection$immutable$Range$$numRangeElements$4))) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + idx))
  } else {
    return ((this.start$4 + $imul(this.step$4, idx)) | 0)
  }
});
$c_sci_Range.prototype.init___I__I__I = (function(start, end, step) {
  this.start$4 = start;
  this.end$4 = end;
  this.step$4 = step;
  this.isEmpty$4 = ((((start > end) && (step > 0)) || ((start < end) && (step < 0))) || ((start === end) && (!this.isInclusive__Z())));
  if ((step === 0)) {
    var jsx$1;
    throw new $c_jl_IllegalArgumentException().init___T("step cannot be 0.")
  } else if (this.isEmpty$4) {
    var jsx$1 = 0
  } else {
    var t = this.longLength__p4__J();
    var lo = t.lo$2;
    var hi = t.hi$2;
    var jsx$1 = (((hi === 0) ? (((-2147483648) ^ lo) > (-1)) : (hi > 0)) ? (-1) : lo)
  };
  this.scala$collection$immutable$Range$$numRangeElements$4 = jsx$1;
  switch (step) {
    case 1: {
      var jsx$2 = (this.isInclusive__Z() ? end : (((-1) + end) | 0));
      break
    }
    case (-1): {
      var jsx$2 = (this.isInclusive__Z() ? end : ((1 + end) | 0));
      break
    }
    default: {
      var t$1 = this.gap__p4__J();
      var lo$1 = t$1.lo$2;
      var hi$2 = t$1.hi$2;
      var hi$1 = (step >> 31);
      var this$1 = $m_sjsr_RuntimeLong$();
      var lo$2 = this$1.remainderImpl__I__I__I__I__I(lo$1, hi$2, step, hi$1);
      var jsx$2 = ((lo$2 !== 0) ? ((end - lo$2) | 0) : (this.isInclusive__Z() ? end : ((end - step) | 0)))
    }
  };
  this.scala$collection$immutable$Range$$lastElement$4 = jsx$2;
  return this
});
$c_sci_Range.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_IndexedSeq$()
});
$c_sci_Range.prototype.toString__T = (function() {
  var preposition = (this.isInclusive__Z() ? "to" : "until");
  var stepped = ((this.step$4 === 1) ? "" : new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array([" by ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.step$4])));
  var prefix = (this.isEmpty$4 ? "empty " : ((!this.isExact__p4__Z()) ? "inexact " : ""));
  return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["", "Range ", " ", " ", "", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([prefix, this.start$4, preposition, this.end$4, stepped]))
});
$c_sci_Range.prototype.foreach__F1__V = (function(f) {
  if ((!this.isEmpty$4)) {
    var i = this.start$4;
    while (true) {
      f.apply__O__O(i);
      if ((i === this.scala$collection$immutable$Range$$lastElement$4)) {
        return (void 0)
      };
      i = ((i + this.step$4) | 0)
    }
  }
});
$c_sci_Range.prototype.hasStub__p4__Z = (function() {
  return (this.isInclusive__Z() || (!this.isExact__p4__Z()))
});
$c_sci_Range.prototype.size__I = (function() {
  return this.length__I()
});
$c_sci_Range.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_sci_Range.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.length__I())
});
$c_sci_Range.prototype.scala$collection$immutable$Range$$validateMaxLength__V = (function() {
  if ((this.scala$collection$immutable$Range$$numRangeElements$4 < 0)) {
    $m_sci_Range$().scala$collection$immutable$Range$$fail__I__I__I__Z__sr_Nothing$(this.start$4, this.end$4, this.step$4, this.isInclusive__Z())
  }
});
$c_sci_Range.prototype.length__I = (function() {
  return ((this.scala$collection$immutable$Range$$numRangeElements$4 < 0) ? $m_sci_Range$().scala$collection$immutable$Range$$fail__I__I__I__Z__sr_Nothing$(this.start$4, this.end$4, this.step$4, this.isInclusive__Z()) : this.scala$collection$immutable$Range$$numRangeElements$4)
});
$c_sci_Range.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Range.prototype.sizeHintIfCheap__I = (function() {
  return this.length__I()
});
$c_sci_Range.prototype.isExact__p4__Z = (function() {
  var t = this.gap__p4__J();
  var lo = t.lo$2;
  var hi$1 = t.hi$2;
  var value = this.step$4;
  var hi = (value >> 31);
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo$1 = this$1.remainderImpl__I__I__I__I__I(lo, hi$1, value, hi);
  var hi$2 = this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
  return ((lo$1 === 0) && (hi$2 === 0))
});
$c_sci_Range.prototype.last__I = (function() {
  if (this.isEmpty$4) {
    var this$1 = $m_sci_Nil$();
    return $uI($f_sc_LinearSeqOptimized__last__O(this$1))
  } else {
    return this.scala$collection$immutable$Range$$lastElement$4
  }
});
$c_sci_Range.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_sci_Range.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Range.prototype.sum__s_math_Numeric__O = (function(num) {
  return this.sum__s_math_Numeric__I(num)
});
$c_sci_Range.prototype.sum__s_math_Numeric__I = (function(num) {
  if ((num === $m_s_math_Numeric$IntIsIntegral$())) {
    if (this.isEmpty$4) {
      return 0
    } else if ((this.scala$collection$immutable$Range$$numRangeElements$4 === 1)) {
      return this.head__I()
    } else {
      var value = this.scala$collection$immutable$Range$$numRangeElements$4;
      var hi = (value >> 31);
      var value$1 = this.head__I();
      var hi$1 = (value$1 >> 31);
      var value$2 = this.last__I();
      var hi$2 = (value$2 >> 31);
      var lo = ((value$1 + value$2) | 0);
      var hi$3 = ((((-2147483648) ^ lo) < ((-2147483648) ^ value$1)) ? ((1 + ((hi$1 + hi$2) | 0)) | 0) : ((hi$1 + hi$2) | 0));
      var a0 = (65535 & value);
      var a1 = ((value >>> 16) | 0);
      var b0 = (65535 & lo);
      var b1 = ((lo >>> 16) | 0);
      var a0b0 = $imul(a0, b0);
      var a1b0 = $imul(a1, b0);
      var a0b1 = $imul(a0, b1);
      var lo$1 = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
      var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
      var hi$4 = (((((((($imul(value, hi$3) + $imul(hi, lo)) | 0) + $imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
      var this$2 = $m_sjsr_RuntimeLong$();
      var lo$2 = this$2.divideImpl__I__I__I__I__I(lo$1, hi$4, 2, 0);
      return lo$2
    }
  } else if (this.isEmpty$4) {
    return num.toInt__O__I(num.fromInt__I__O(0))
  } else {
    var acc = num.fromInt__I__O(0);
    var i = this.head__I();
    while (true) {
      acc = num.plus__O__O__O(acc, i);
      if ((i === this.scala$collection$immutable$Range$$lastElement$4)) {
        return num.toInt__O__I(acc)
      };
      i = ((i + this.step$4) | 0)
    }
  }
});
$c_sci_Range.prototype.head__I = (function() {
  return (this.isEmpty$4 ? $m_sci_Nil$().head__sr_Nothing$() : this.start$4)
});
$c_sci_Range.prototype.gap__p4__J = (function() {
  var value = this.end$4;
  var hi = (value >> 31);
  var value$1 = this.start$4;
  var hi$1 = (value$1 >> 31);
  var lo = ((value - value$1) | 0);
  var hi$2 = ((((-2147483648) ^ lo) > ((-2147483648) ^ value)) ? (((-1) + ((hi - hi$1) | 0)) | 0) : ((hi - hi$1) | 0));
  return new $c_sjsr_RuntimeLong().init___I__I(lo, hi$2)
});
function $is_sci_Range(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Range)))
}
function $as_sci_Range(obj) {
  return (($is_sci_Range(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Range"))
}
function $isArrayOf_sci_Range(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Range)))
}
function $asArrayOf_sci_Range(obj, depth) {
  return (($isArrayOf_sci_Range(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Range;", depth))
}
var $d_sci_Range = new $TypeData().initClass({
  sci_Range: 0
}, false, "scala.collection.immutable.Range", {
  sci_Range: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Range.prototype.$classData = $d_sci_Range;
/** @constructor */
function $c_sci_Stream() {
  $c_sc_AbstractSeq.call(this)
}
$c_sci_Stream.prototype = new $h_sc_AbstractSeq();
$c_sci_Stream.prototype.constructor = $c_sci_Stream;
/** @constructor */
function $h_sci_Stream() {
  /*<skip>*/
}
$h_sci_Stream.prototype = $c_sci_Stream.prototype;
$c_sci_Stream.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Stream.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_Stream.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
});
$c_sci_Stream.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_Stream.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Stream.prototype.equals__O__Z = (function(that) {
  return ((this === that) || $f_sc_GenSeqLike__equals__O__Z(this, that))
});
$c_sci_Stream.prototype.flatMap__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = $m_sci_Stream$Empty$()
    } else {
      var nonEmptyPrefix = new $c_sr_ObjectRef().init___O(this);
      var prefix = $as_sc_GenTraversableOnce(f.apply__O__O($as_sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream();
      while (((!$as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z()) && prefix.isEmpty__Z())) {
        nonEmptyPrefix.elem$1 = $as_sci_Stream($as_sci_Stream(nonEmptyPrefix.elem$1).tail__O());
        if ((!$as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z())) {
          prefix = $as_sc_GenTraversableOnce(f.apply__O__O($as_sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream()
        }
      };
      var x$1 = ($as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z() ? ($m_sci_Stream$(), $m_sci_Stream$Empty$()) : prefix.append__F0__sci_Stream(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, f$1, nonEmptyPrefix$1) {
        return (function() {
          var x = $as_sci_Stream($as_sci_Stream(nonEmptyPrefix$1.elem$1).tail__O()).flatMap__F1__scg_CanBuildFrom__O(f$1, ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()));
          return $as_sci_Stream(x)
        })
      })(this, f, nonEmptyPrefix))))
    };
    return x$1
  } else {
    return $f_sc_TraversableLike__flatMap__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_Stream.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_Stream(n)
});
$c_sci_Stream.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  this.force__sci_Stream();
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_sci_Stream.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Stream$()
});
$c_sci_Stream.prototype.toString__T = (function() {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, "Stream(", ", ", ")")
});
$c_sci_Stream.prototype.foreach__F1__V = (function(f) {
  var _$this = this;
  _foreach: while (true) {
    if ((!_$this.isEmpty__Z())) {
      f.apply__O__O(_$this.head__O());
      _$this = $as_sci_Stream(_$this.tail__O());
      continue _foreach
    };
    break
  }
});
$c_sci_Stream.prototype.foldLeft__O__F2__O = (function(z, op) {
  var _$this = this;
  _foldLeft: while (true) {
    if (_$this.isEmpty__Z()) {
      return z
    } else {
      var temp$_$this = $as_sci_Stream(_$this.tail__O());
      var temp$z = op.apply__O__O__O(z, _$this.head__O());
      _$this = temp$_$this;
      z = temp$z;
      continue _foldLeft
    }
  }
});
$c_sci_Stream.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_StreamIterator().init___sci_Stream(this)
});
$c_sci_Stream.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Stream.prototype.length__I = (function() {
  var len = 0;
  var left = this;
  while ((!left.isEmpty__Z())) {
    len = ((1 + len) | 0);
    left = $as_sci_Stream(left.tail__O())
  };
  return len
});
$c_sci_Stream.prototype.toStream__sci_Stream = (function() {
  return this
});
$c_sci_Stream.prototype.drop__I__sci_Stream = (function(n) {
  var _$this = this;
  _drop: while (true) {
    if (((n <= 0) || _$this.isEmpty__Z())) {
      return _$this
    } else {
      var temp$_$this = $as_sci_Stream(_$this.tail__O());
      var temp$n = (((-1) + n) | 0);
      _$this = temp$_$this;
      n = temp$n;
      continue _drop
    }
  }
});
$c_sci_Stream.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  b.append__T__scm_StringBuilder(start);
  if ((!this.isEmpty__Z())) {
    b.append__O__scm_StringBuilder(this.head__O());
    var cursor = this;
    var n = 1;
    if (cursor.tailDefined__Z()) {
      var scout = $as_sci_Stream(this.tail__O());
      if (scout.isEmpty__Z()) {
        b.append__T__scm_StringBuilder(end);
        return b
      };
      if ((cursor !== scout)) {
        cursor = scout;
        if (scout.tailDefined__Z()) {
          scout = $as_sci_Stream(scout.tail__O());
          while (((cursor !== scout) && scout.tailDefined__Z())) {
            b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
            n = ((1 + n) | 0);
            cursor = $as_sci_Stream(cursor.tail__O());
            scout = $as_sci_Stream(scout.tail__O());
            if (scout.tailDefined__Z()) {
              scout = $as_sci_Stream(scout.tail__O())
            }
          }
        }
      };
      if ((!scout.tailDefined__Z())) {
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        var this$1 = cursor;
        if ($f_sc_TraversableOnce__nonEmpty__Z(this$1)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O())
        }
      } else {
        var runner = this;
        var k = 0;
        while ((runner !== scout)) {
          runner = $as_sci_Stream(runner.tail__O());
          scout = $as_sci_Stream(scout.tail__O());
          k = ((1 + k) | 0)
        };
        if (((cursor === scout) && (k > 0))) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        n = ((n - k) | 0)
      }
    };
    if ((!cursor.isEmpty__Z())) {
      if ((!cursor.tailDefined__Z())) {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("?")
      } else {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("...")
      }
    }
  };
  b.append__T__scm_StringBuilder(end);
  return b
});
$c_sci_Stream.prototype.force__sci_Stream = (function() {
  var these = this;
  var those = this;
  if ((!these.isEmpty__Z())) {
    these = $as_sci_Stream(these.tail__O())
  };
  while ((those !== these)) {
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if ((these === those)) {
      return this
    };
    those = $as_sci_Stream(those.tail__O())
  };
  return this
});
$c_sci_Stream.prototype.isDefinedAt__O__Z = (function(x) {
  var x$1 = $uI(x);
  return $f_sc_LinearSeqOptimized__isDefinedAt__I__Z(this, x$1)
});
$c_sci_Stream.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Stream.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = $m_sci_Stream$Empty$()
    } else {
      var hd = f.apply__O__O(this.head__O());
      var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, f$1) {
        return (function() {
          var x = $as_sci_Stream($this.tail__O()).map__F1__scg_CanBuildFrom__O(f$1, ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()));
          return $as_sci_Stream(x)
        })
      })(this, f));
      var x$1 = new $c_sci_Stream$Cons().init___O__F0(hd, tl)
    };
    return x$1
  } else {
    return $f_sc_TraversableLike__map__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_Stream.prototype.append__F0__sci_Stream = (function(rest) {
  if (this.isEmpty__Z()) {
    return $as_sc_GenTraversableOnce(rest.apply__O()).toStream__sci_Stream()
  } else {
    var hd = this.head__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, rest$1) {
      return (function() {
        return $as_sci_Stream($this.tail__O()).append__F0__sci_Stream(rest$1)
      })
    })(this, rest));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  }
});
$c_sci_Stream.prototype.stringPrefix__T = (function() {
  return "Stream"
});
function $is_sci_Stream(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream)))
}
function $as_sci_Stream(obj) {
  return (($is_sci_Stream(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream"))
}
function $isArrayOf_sci_Stream(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream)))
}
function $asArrayOf_sci_Stream(obj, depth) {
  return (($isArrayOf_sci_Stream(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream;", depth))
}
function $is_scm_Buffer(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Buffer)))
}
function $as_scm_Buffer(obj) {
  return (($is_scm_Buffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.Buffer"))
}
function $isArrayOf_scm_Buffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Buffer)))
}
function $asArrayOf_scm_Buffer(obj, depth) {
  return (($isArrayOf_scm_Buffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.Buffer;", depth))
}
function $f_scm_ResizableArray__apply__I__O($thiz, idx) {
  if ((idx >= $thiz.size0$6)) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + idx))
  };
  return $thiz.array$6.get(idx)
}
function $f_scm_ResizableArray__foreach__F1__V($thiz, f) {
  var i = 0;
  var top = $thiz.size0$6;
  while ((i < top)) {
    f.apply__O__O($thiz.array$6.get(i));
    i = ((1 + i) | 0)
  }
}
function $f_scm_ResizableArray__ensureSize__I__V($thiz, n) {
  var value = $thiz.array$6.u.length;
  var hi = (value >> 31);
  var hi$1 = (n >> 31);
  if (((hi$1 === hi) ? (((-2147483648) ^ n) > ((-2147483648) ^ value)) : (hi$1 > hi))) {
    var lo = (value << 1);
    var hi$2 = (((value >>> 31) | 0) | (hi << 1));
    var newSize_$_lo$2 = lo;
    var newSize_$_hi$2 = hi$2;
    while (true) {
      var hi$3 = (n >> 31);
      var b_$_lo$2 = newSize_$_lo$2;
      var b_$_hi$2 = newSize_$_hi$2;
      var bhi = b_$_hi$2;
      if (((hi$3 === bhi) ? (((-2147483648) ^ n) > ((-2147483648) ^ b_$_lo$2)) : (hi$3 > bhi))) {
        var this$1_$_lo$2 = newSize_$_lo$2;
        var this$1_$_hi$2 = newSize_$_hi$2;
        var lo$1 = (this$1_$_lo$2 << 1);
        var hi$4 = (((this$1_$_lo$2 >>> 31) | 0) | (this$1_$_hi$2 << 1));
        var jsx$1_$_lo$2 = lo$1;
        var jsx$1_$_hi$2 = hi$4;
        newSize_$_lo$2 = jsx$1_$_lo$2;
        newSize_$_hi$2 = jsx$1_$_hi$2
      } else {
        break
      }
    };
    var this$2_$_lo$2 = newSize_$_lo$2;
    var this$2_$_hi$2 = newSize_$_hi$2;
    var ahi = this$2_$_hi$2;
    if (((ahi === 0) ? (((-2147483648) ^ this$2_$_lo$2) > (-1)) : (ahi > 0))) {
      var jsx$2_$_lo$2 = 2147483647;
      var jsx$2_$_hi$2 = 0;
      newSize_$_lo$2 = jsx$2_$_lo$2;
      newSize_$_hi$2 = jsx$2_$_hi$2
    };
    var this$3_$_lo$2 = newSize_$_lo$2;
    var this$3_$_hi$2 = newSize_$_hi$2;
    var newArray = $newArrayObject($d_O.getArrayOf(), [this$3_$_lo$2]);
    $systemArraycopy($thiz.array$6, 0, newArray, 0, $thiz.size0$6);
    $thiz.array$6 = newArray
  }
}
function $f_scm_ResizableArray__$$init$__V($thiz) {
  var x = $thiz.initialSize$6;
  $thiz.array$6 = $newArrayObject($d_O.getArrayOf(), [((x > 1) ? x : 1)]);
  $thiz.size0$6 = 0
}
function $f_scm_ResizableArray__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var x = ((len < that) ? len : that);
  var that$1 = $thiz.size0$6;
  var len1 = ((x < that$1) ? x : that$1);
  if ((len1 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V($thiz.array$6, 0, xs, start, len1)
  }
}
/** @constructor */
function $c_sci_HashMap$EmptyHashMap$() {
  $c_sci_HashMap.call(this)
}
$c_sci_HashMap$EmptyHashMap$.prototype = new $h_sci_HashMap();
$c_sci_HashMap$EmptyHashMap$.prototype.constructor = $c_sci_HashMap$EmptyHashMap$;
/** @constructor */
function $h_sci_HashMap$EmptyHashMap$() {
  /*<skip>*/
}
$h_sci_HashMap$EmptyHashMap$.prototype = $c_sci_HashMap$EmptyHashMap$.prototype;
$c_sci_HashMap$EmptyHashMap$.prototype.init___ = (function() {
  return this
});
var $d_sci_HashMap$EmptyHashMap$ = new $TypeData().initClass({
  sci_HashMap$EmptyHashMap$: 0
}, false, "scala.collection.immutable.HashMap$EmptyHashMap$", {
  sci_HashMap$EmptyHashMap$: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$EmptyHashMap$.prototype.$classData = $d_sci_HashMap$EmptyHashMap$;
var $n_sci_HashMap$EmptyHashMap$ = (void 0);
function $m_sci_HashMap$EmptyHashMap$() {
  if ((!$n_sci_HashMap$EmptyHashMap$)) {
    $n_sci_HashMap$EmptyHashMap$ = new $c_sci_HashMap$EmptyHashMap$().init___()
  };
  return $n_sci_HashMap$EmptyHashMap$
}
/** @constructor */
function $c_sci_HashMap$HashMap1() {
  $c_sci_HashMap.call(this);
  this.key$6 = null;
  this.hash$6 = 0;
  this.value$6 = null;
  this.kv$6 = null
}
$c_sci_HashMap$HashMap1.prototype = new $h_sci_HashMap();
$c_sci_HashMap$HashMap1.prototype.constructor = $c_sci_HashMap$HashMap1;
/** @constructor */
function $h_sci_HashMap$HashMap1() {
  /*<skip>*/
}
$h_sci_HashMap$HashMap1.prototype = $c_sci_HashMap$HashMap1.prototype;
$c_sci_HashMap$HashMap1.prototype.ensurePair__T2 = (function() {
  if ((this.kv$6 !== null)) {
    return this.kv$6
  } else {
    this.kv$6 = new $c_T2().init___O__O(this.key$6, this.value$6);
    return this.kv$6
  }
});
$c_sci_HashMap$HashMap1.prototype.init___O__I__O__T2 = (function(key, hash, value, kv) {
  this.key$6 = key;
  this.hash$6 = hash;
  this.value$6 = value;
  this.kv$6 = kv;
  return this
});
$c_sci_HashMap$HashMap1.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  if (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
    if ((merger === null)) {
      return ((this.value$6 === value) ? this : new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv))
    } else {
      var nkv = merger.apply__T2__T2__T2(this.ensurePair__T2(), ((kv !== null) ? kv : new $c_T2().init___O__O(key, value)));
      return new $c_sci_HashMap$HashMap1().init___O__I__O__T2(nkv.$$und1__O(), hash, nkv.$$und2__O(), nkv)
    }
  } else if ((hash !== this.hash$6)) {
    var that = new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
    return $m_sci_HashMap$().scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(this.hash$6, this, hash, that, level, 2)
  } else {
    var this$2 = $m_sci_ListMap$EmptyListMap$();
    var key$1 = this.key$6;
    var value$1 = this.value$6;
    return new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, new $c_sci_ListMap$Node().init___sci_ListMap__O__O(this$2, key$1, value$1).updated__O__O__sci_ListMap(key, value))
  }
});
$c_sci_HashMap$HashMap1.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  return (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6)) ? new $c_s_Some().init___O(this.value$6) : $m_s_None$())
});
$c_sci_HashMap$HashMap1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.ensurePair__T2())
});
$c_sci_HashMap$HashMap1.prototype.size__I = (function() {
  return 1
});
$c_sci_HashMap$HashMap1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.ensurePair__T2()]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_HashMap$HashMap1.prototype.contains0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))
});
function $is_sci_HashMap$HashMap1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashMap1)))
}
function $as_sci_HashMap$HashMap1(obj) {
  return (($is_sci_HashMap$HashMap1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap$HashMap1"))
}
function $isArrayOf_sci_HashMap$HashMap1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashMap1)))
}
function $asArrayOf_sci_HashMap$HashMap1(obj, depth) {
  return (($isArrayOf_sci_HashMap$HashMap1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashMap1;", depth))
}
var $d_sci_HashMap$HashMap1 = new $TypeData().initClass({
  sci_HashMap$HashMap1: 0
}, false, "scala.collection.immutable.HashMap$HashMap1", {
  sci_HashMap$HashMap1: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$HashMap1.prototype.$classData = $d_sci_HashMap$HashMap1;
/** @constructor */
function $c_sci_HashMap$HashMapCollision1() {
  $c_sci_HashMap.call(this);
  this.hash$6 = 0;
  this.kvs$6 = null
}
$c_sci_HashMap$HashMapCollision1.prototype = new $h_sci_HashMap();
$c_sci_HashMap$HashMapCollision1.prototype.constructor = $c_sci_HashMap$HashMapCollision1;
/** @constructor */
function $h_sci_HashMap$HashMapCollision1() {
  /*<skip>*/
}
$h_sci_HashMap$HashMapCollision1.prototype = $c_sci_HashMap$HashMapCollision1.prototype;
$c_sci_HashMap$HashMapCollision1.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  if ((hash === this.hash$6)) {
    return (((merger === null) || (!this.kvs$6.contains__O__Z(key))) ? new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, this.kvs$6.updated__O__O__sci_ListMap(key, value)) : new $c_sci_HashMap$HashMapCollision1().init___I__sci_ListMap(hash, this.kvs$6.$$plus__T2__sci_ListMap(merger.apply__T2__T2__T2(new $c_T2().init___O__O(key, this.kvs$6.apply__O__O(key)), kv))))
  } else {
    var that = new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv);
    return $m_sci_HashMap$().scala$collection$immutable$HashMap$$makeHashTrieMap__I__sci_HashMap__I__sci_HashMap__I__I__sci_HashMap$HashTrieMap(this.hash$6, this, hash, that, level, ((1 + this.kvs$6.size__I()) | 0))
  }
});
$c_sci_HashMap$HashMapCollision1.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  return ((hash === this.hash$6) ? this.kvs$6.get__O__s_Option(key) : $m_s_None$())
});
$c_sci_HashMap$HashMapCollision1.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.kvs$6;
  var this$2 = this$1.reverseList$1__p5__sci_List();
  var this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
  $f_sc_Iterator__foreach__F1__V(this$3, f)
});
$c_sci_HashMap$HashMapCollision1.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.kvs$6;
  var this$2 = this$1.reverseList$1__p5__sci_List();
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2)
});
$c_sci_HashMap$HashMapCollision1.prototype.size__I = (function() {
  return this.kvs$6.size__I()
});
$c_sci_HashMap$HashMapCollision1.prototype.init___I__sci_ListMap = (function(hash, kvs) {
  this.hash$6 = hash;
  this.kvs$6 = kvs;
  return this
});
$c_sci_HashMap$HashMapCollision1.prototype.contains0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && this.kvs$6.contains__O__Z(key))
});
var $d_sci_HashMap$HashMapCollision1 = new $TypeData().initClass({
  sci_HashMap$HashMapCollision1: 0
}, false, "scala.collection.immutable.HashMap$HashMapCollision1", {
  sci_HashMap$HashMapCollision1: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$HashMapCollision1.prototype.$classData = $d_sci_HashMap$HashMapCollision1;
/** @constructor */
function $c_sci_HashMap$HashTrieMap() {
  $c_sci_HashMap.call(this);
  this.bitmap$6 = 0;
  this.elems$6 = null;
  this.size0$6 = 0
}
$c_sci_HashMap$HashTrieMap.prototype = new $h_sci_HashMap();
$c_sci_HashMap$HashTrieMap.prototype.constructor = $c_sci_HashMap$HashTrieMap;
/** @constructor */
function $h_sci_HashMap$HashTrieMap() {
  /*<skip>*/
}
$h_sci_HashMap$HashTrieMap.prototype = $c_sci_HashMap$HashTrieMap.prototype;
$c_sci_HashMap$HashTrieMap.prototype.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap = (function(key, hash, level, value, kv, merger) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
  if (((this.bitmap$6 & mask) !== 0)) {
    var sub = this.elems$6.get(offset);
    var subNew = sub.updated0__O__I__I__O__T2__sci_HashMap$Merger__sci_HashMap(key, hash, ((5 + level) | 0), value, kv, merger);
    if ((subNew === sub)) {
      return this
    } else {
      var elemsNew = $newArrayObject($d_sci_HashMap.getArrayOf(), [this.elems$6.u.length]);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, 0, elemsNew, 0, this.elems$6.u.length);
      elemsNew.set(offset, subNew);
      return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I(this.bitmap$6, elemsNew, ((this.size0$6 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
    }
  } else {
    var elemsNew$2 = $newArrayObject($d_sci_HashMap.getArrayOf(), [((1 + this.elems$6.u.length) | 0)]);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, 0, elemsNew$2, 0, offset);
    elemsNew$2.set(offset, new $c_sci_HashMap$HashMap1().init___O__I__O__T2(key, hash, value, kv));
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$6, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$6.u.length - offset) | 0));
    return new $c_sci_HashMap$HashTrieMap().init___I__Asci_HashMap__I((this.bitmap$6 | mask), elemsNew$2, ((1 + this.size0$6) | 0))
  }
});
$c_sci_HashMap$HashTrieMap.prototype.get0__O__I__I__s_Option = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  if ((this.bitmap$6 === (-1))) {
    return this.elems$6.get(index).get0__O__I__I__s_Option(key, hash, ((5 + level) | 0))
  } else {
    var mask = (1 << index);
    if (((this.bitmap$6 & mask) !== 0)) {
      var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
      return this.elems$6.get(offset).get0__O__I__I__s_Option(key, hash, ((5 + level) | 0))
    } else {
      return $m_s_None$()
    }
  }
});
$c_sci_HashMap$HashTrieMap.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  while ((i < this.elems$6.u.length)) {
    this.elems$6.get(i).foreach__F1__V(f);
    i = ((1 + i) | 0)
  }
});
$c_sci_HashMap$HashTrieMap.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_HashMap$HashTrieMap$$anon$1().init___sci_HashMap$HashTrieMap(this)
});
$c_sci_HashMap$HashTrieMap.prototype.size__I = (function() {
  return this.size0$6
});
$c_sci_HashMap$HashTrieMap.prototype.init___I__Asci_HashMap__I = (function(bitmap, elems, size0) {
  this.bitmap$6 = bitmap;
  this.elems$6 = elems;
  this.size0$6 = size0;
  return this
});
$c_sci_HashMap$HashTrieMap.prototype.contains0__O__I__I__Z = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  if ((this.bitmap$6 === (-1))) {
    return this.elems$6.get(index).contains0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else {
    var mask = (1 << index);
    if (((this.bitmap$6 & mask) !== 0)) {
      var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$6 & (((-1) + mask) | 0)));
      return this.elems$6.get(offset).contains0__O__I__I__Z(key, hash, ((5 + level) | 0))
    } else {
      return false
    }
  }
});
function $is_sci_HashMap$HashTrieMap(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashTrieMap)))
}
function $as_sci_HashMap$HashTrieMap(obj) {
  return (($is_sci_HashMap$HashTrieMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap$HashTrieMap"))
}
function $isArrayOf_sci_HashMap$HashTrieMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashTrieMap)))
}
function $asArrayOf_sci_HashMap$HashTrieMap(obj, depth) {
  return (($isArrayOf_sci_HashMap$HashTrieMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashTrieMap;", depth))
}
var $d_sci_HashMap$HashTrieMap = new $TypeData().initClass({
  sci_HashMap$HashTrieMap: 0
}, false, "scala.collection.immutable.HashMap$HashTrieMap", {
  sci_HashMap$HashTrieMap: 1,
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Map: 1,
  sc_GenMap: 1,
  sc_GenMapLike: 1,
  sc_MapLike: 1,
  s_PartialFunction: 1,
  F1: 1,
  scg_Subtractable: 1,
  sci_Map: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sci_MapLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_HashMap$HashTrieMap.prototype.$classData = $d_sci_HashMap$HashTrieMap;
/** @constructor */
function $c_sci_List() {
  $c_sc_AbstractSeq.call(this)
}
$c_sci_List.prototype = new $h_sc_AbstractSeq();
$c_sci_List.prototype.constructor = $c_sci_List;
/** @constructor */
function $h_sci_List() {
  /*<skip>*/
}
$h_sci_List.prototype = $c_sci_List.prototype;
$c_sci_List.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_List.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_List.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
});
$c_sci_List.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_List.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_List.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_List(n)
});
$c_sci_List.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_List$()
});
$c_sci_List.prototype.foreach__F1__V = (function(f) {
  var these = this;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$1 = these;
    these = this$1.tail__sci_List()
  }
});
$c_sci_List.prototype.foldLeft__O__F2__O = (function(z, op) {
  return $f_sc_LinearSeqOptimized__foldLeft__O__F2__O(this, z, op)
});
$c_sci_List.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this)
});
$c_sci_List.prototype.drop__I__sci_List = (function(n) {
  var these = this;
  var count = n;
  while (((!these.isEmpty__Z()) && (count > 0))) {
    var this$1 = these;
    these = this$1.tail__sci_List();
    count = (((-1) + count) | 0)
  };
  return these
});
$c_sci_List.prototype.length__I = (function() {
  return $f_sc_LinearSeqOptimized__length__I(this)
});
$c_sci_List.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_List.prototype.toStream__sci_Stream = (function() {
  return (this.isEmpty__Z() ? $m_sci_Stream$Empty$() : new $c_sci_Stream$Cons().init___O__F0(this.head__O(), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $this.tail__sci_List().toStream__sci_Stream()
    })
  })(this))))
});
$c_sci_List.prototype.isDefinedAt__O__Z = (function(x) {
  var x$1 = $uI(x);
  return $f_sc_LinearSeqOptimized__isDefinedAt__I__Z(this, x$1)
});
$c_sci_List.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_List.prototype.map__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ((bf === $m_sci_List$().ReusableCBFInstance$2)) {
    if ((this === $m_sci_Nil$())) {
      return $m_sci_Nil$()
    } else {
      var h = new $c_sci_$colon$colon().init___O__sci_List(f.apply__O__O(this.head__O()), $m_sci_Nil$());
      var t = h;
      var rest = this.tail__sci_List();
      while ((rest !== $m_sci_Nil$())) {
        var nx = new $c_sci_$colon$colon().init___O__sci_List(f.apply__O__O(rest.head__O()), $m_sci_Nil$());
        t.tl$5 = nx;
        t = nx;
        var this$1 = rest;
        rest = this$1.tail__sci_List()
      };
      return h
    }
  } else {
    return $f_sc_TraversableLike__map__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_List.prototype.stringPrefix__T = (function() {
  return "List"
});
function $is_sci_List(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_List)))
}
function $as_sci_List(obj) {
  return (($is_sci_List(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.List"))
}
function $isArrayOf_sci_List(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_List)))
}
function $asArrayOf_sci_List(obj, depth) {
  return (($isArrayOf_sci_List(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.List;", depth))
}
/** @constructor */
function $c_sci_Stream$Cons() {
  $c_sci_Stream.call(this);
  this.hd$5 = null;
  this.tlVal$5 = null;
  this.tlGen$5 = null
}
$c_sci_Stream$Cons.prototype = new $h_sci_Stream();
$c_sci_Stream$Cons.prototype.constructor = $c_sci_Stream$Cons;
/** @constructor */
function $h_sci_Stream$Cons() {
  /*<skip>*/
}
$h_sci_Stream$Cons.prototype = $c_sci_Stream$Cons.prototype;
$c_sci_Stream$Cons.prototype.head__O = (function() {
  return this.hd$5
});
$c_sci_Stream$Cons.prototype.tail__sci_Stream = (function() {
  if ((!this.tailDefined__Z())) {
    if ((!this.tailDefined__Z())) {
      this.tlVal$5 = $as_sci_Stream(this.tlGen$5.apply__O());
      this.tlGen$5 = null
    }
  };
  return this.tlVal$5
});
$c_sci_Stream$Cons.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  if ($is_sci_Stream$Cons(that)) {
    var x2 = $as_sci_Stream$Cons(that);
    return this.consEq$1__p5__sci_Stream$Cons__sci_Stream$Cons__Z(this, x2)
  } else {
    return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
  }
});
$c_sci_Stream$Cons.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_Stream$Cons.prototype.tailDefined__Z = (function() {
  return (this.tlGen$5 === null)
});
$c_sci_Stream$Cons.prototype.consEq$1__p5__sci_Stream$Cons__sci_Stream$Cons__Z = (function(a, b) {
  _consEq: while (true) {
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(a.hd$5, b.hd$5)) {
      var x1 = a.tail__sci_Stream();
      if ($is_sci_Stream$Cons(x1)) {
        var x2 = $as_sci_Stream$Cons(x1);
        var x1$2 = b.tail__sci_Stream();
        if ($is_sci_Stream$Cons(x1$2)) {
          var x2$2 = $as_sci_Stream$Cons(x1$2);
          if ((x2 === x2$2)) {
            return true
          } else {
            a = x2;
            b = x2$2;
            continue _consEq
          }
        } else {
          return false
        }
      } else {
        return b.tail__sci_Stream().isEmpty__Z()
      }
    } else {
      return false
    }
  }
});
$c_sci_Stream$Cons.prototype.tail__O = (function() {
  return this.tail__sci_Stream()
});
$c_sci_Stream$Cons.prototype.init___O__F0 = (function(hd, tl) {
  this.hd$5 = hd;
  this.tlGen$5 = tl;
  return this
});
function $is_sci_Stream$Cons(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$Cons)))
}
function $as_sci_Stream$Cons(obj) {
  return (($is_sci_Stream$Cons(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream$Cons"))
}
function $isArrayOf_sci_Stream$Cons(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$Cons)))
}
function $asArrayOf_sci_Stream$Cons(obj, depth) {
  return (($isArrayOf_sci_Stream$Cons(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream$Cons;", depth))
}
var $d_sci_Stream$Cons = new $TypeData().initClass({
  sci_Stream$Cons: 0
}, false, "scala.collection.immutable.Stream$Cons", {
  sci_Stream$Cons: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Cons.prototype.$classData = $d_sci_Stream$Cons;
/** @constructor */
function $c_sci_Stream$Empty$() {
  $c_sci_Stream.call(this)
}
$c_sci_Stream$Empty$.prototype = new $h_sci_Stream();
$c_sci_Stream$Empty$.prototype.constructor = $c_sci_Stream$Empty$;
/** @constructor */
function $h_sci_Stream$Empty$() {
  /*<skip>*/
}
$h_sci_Stream$Empty$.prototype = $c_sci_Stream$Empty$.prototype;
$c_sci_Stream$Empty$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Stream$Empty$.prototype.init___ = (function() {
  return this
});
$c_sci_Stream$Empty$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Stream$Empty$.prototype.tailDefined__Z = (function() {
  return false
});
$c_sci_Stream$Empty$.prototype.tail__sr_Nothing$ = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty stream")
});
$c_sci_Stream$Empty$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty stream")
});
$c_sci_Stream$Empty$.prototype.tail__O = (function() {
  this.tail__sr_Nothing$()
});
var $d_sci_Stream$Empty$ = new $TypeData().initClass({
  sci_Stream$Empty$: 0
}, false, "scala.collection.immutable.Stream$Empty$", {
  sci_Stream$Empty$: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Empty$.prototype.$classData = $d_sci_Stream$Empty$;
var $n_sci_Stream$Empty$ = (void 0);
function $m_sci_Stream$Empty$() {
  if ((!$n_sci_Stream$Empty$)) {
    $n_sci_Stream$Empty$ = new $c_sci_Stream$Empty$().init___()
  };
  return $n_sci_Stream$Empty$
}
/** @constructor */
function $c_sci_Vector() {
  $c_sc_AbstractSeq.call(this);
  this.startIndex$4 = 0;
  this.endIndex$4 = 0;
  this.focus$4 = 0;
  this.dirty$4 = false;
  this.depth$4 = 0;
  this.display0$4 = null;
  this.display1$4 = null;
  this.display2$4 = null;
  this.display3$4 = null;
  this.display4$4 = null;
  this.display5$4 = null
}
$c_sci_Vector.prototype = new $h_sc_AbstractSeq();
$c_sci_Vector.prototype.constructor = $c_sci_Vector;
/** @constructor */
function $h_sci_Vector() {
  /*<skip>*/
}
$h_sci_Vector.prototype = $c_sci_Vector.prototype;
$c_sci_Vector.prototype.checkRangeConvert__p4__I__I = (function(index) {
  var idx = ((index + this.startIndex$4) | 0);
  if (((index >= 0) && (idx < this.endIndex$4))) {
    return idx
  } else {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + index))
  }
});
$c_sci_Vector.prototype.display3__AO = (function() {
  return this.display3$4
});
$c_sci_Vector.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Vector.prototype.apply__I__O = (function(index) {
  var idx = this.checkRangeConvert__p4__I__I(index);
  var xor = (idx ^ this.focus$4);
  return $f_sci_VectorPointer__getElem__I__I__O(this, idx, xor)
});
$c_sci_Vector.prototype.depth__I = (function() {
  return this.depth$4
});
$c_sci_Vector.prototype.lengthCompare__I__I = (function(len) {
  return ((this.length__I() - len) | 0)
});
$c_sci_Vector.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_sci_Vector.prototype.initIterator__sci_VectorIterator__V = (function(s) {
  var depth = this.depth$4;
  $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
  if (this.dirty$4) {
    var index = this.focus$4;
    $f_sci_VectorPointer__stabilize__I__V(s, index)
  };
  if ((s.depth$2 > 1)) {
    var index$1 = this.startIndex$4;
    var xor = (this.startIndex$4 ^ this.focus$4);
    $f_sci_VectorPointer__gotoPos__I__I__V(s, index$1, xor)
  }
});
$c_sci_Vector.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Vector.prototype.init___I__I__I = (function(startIndex, endIndex, focus) {
  this.startIndex$4 = startIndex;
  this.endIndex$4 = endIndex;
  this.focus$4 = focus;
  this.dirty$4 = false;
  return this
});
$c_sci_Vector.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$4 = x$1
});
$c_sci_Vector.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Vector$()
});
$c_sci_Vector.prototype.display0__AO = (function() {
  return this.display0$4
});
$c_sci_Vector.prototype.display4__AO = (function() {
  return this.display4$4
});
$c_sci_Vector.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$4 = x$1
});
$c_sci_Vector.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_sci_Vector.prototype.iterator__sc_Iterator = (function() {
  return this.iterator__sci_VectorIterator()
});
$c_sci_Vector.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$4 = x$1
});
$c_sci_Vector.prototype.length__I = (function() {
  return ((this.endIndex$4 - this.startIndex$4) | 0)
});
$c_sci_Vector.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Vector.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$4 = x$1
});
$c_sci_Vector.prototype.sizeHintIfCheap__I = (function() {
  return this.length__I()
});
$c_sci_Vector.prototype.display1__AO = (function() {
  return this.display1$4
});
$c_sci_Vector.prototype.display5__AO = (function() {
  return this.display5$4
});
$c_sci_Vector.prototype.iterator__sci_VectorIterator = (function() {
  var s = new $c_sci_VectorIterator().init___I__I(this.startIndex$4, this.endIndex$4);
  this.initIterator__sci_VectorIterator__V(s);
  return s
});
$c_sci_Vector.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_sci_Vector.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Vector.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$4 = x$1
});
$c_sci_Vector.prototype.display2__AO = (function() {
  return this.display2$4
});
$c_sci_Vector.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$4 = x$1
});
$c_sci_Vector.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$4 = x$1
});
var $d_sci_Vector = new $TypeData().initClass({
  sci_Vector: 0
}, false, "scala.collection.immutable.Vector", {
  sci_Vector: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_VectorPointer: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_Vector.prototype.$classData = $d_sci_Vector;
/** @constructor */
function $c_sci_WrappedString() {
  $c_sc_AbstractSeq.call(this);
  this.self$4 = null
}
$c_sci_WrappedString.prototype = new $h_sc_AbstractSeq();
$c_sci_WrappedString.prototype.constructor = $c_sci_WrappedString;
/** @constructor */
function $h_sci_WrappedString() {
  /*<skip>*/
}
$h_sci_WrappedString.prototype = $c_sci_WrappedString.prototype;
$c_sci_WrappedString.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_WrappedString.prototype.apply__I__O = (function(idx) {
  var thiz = this.self$4;
  var c = (65535 & $uI(thiz.charCodeAt(idx)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_WrappedString.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_WrappedString.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  var thiz = this.self$4;
  var c = (65535 & $uI(thiz.charCodeAt(n)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_WrappedString.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_WrappedString.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_sci_WrappedString.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_WrappedString.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_IndexedSeq$()
});
$c_sci_WrappedString.prototype.toString__T = (function() {
  return this.self$4
});
$c_sci_WrappedString.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_sci_WrappedString.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var thiz = this.self$4;
  var end = $uI(thiz.length);
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_sci_WrappedString.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_sci_WrappedString.prototype.iterator__sc_Iterator = (function() {
  var thiz = this.self$4;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(thiz.length))
});
$c_sci_WrappedString.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_WrappedString.prototype.length__I = (function() {
  var thiz = this.self$4;
  return $uI(thiz.length)
});
$c_sci_WrappedString.prototype.sizeHintIfCheap__I = (function() {
  var thiz = this.self$4;
  return $uI(thiz.length)
});
$c_sci_WrappedString.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_sci_WrappedString.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_sci_WrappedString.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_WrappedString.prototype.init___T = (function(self) {
  this.self$4 = self;
  return this
});
$c_sci_WrappedString.prototype.toArray__s_reflect_ClassTag__O = (function(evidence$1) {
  return $m_sjsr_RuntimeString$().toCharArray__T__AC(this.self$4)
});
$c_sci_WrappedString.prototype.newBuilder__scm_Builder = (function() {
  return $m_sci_WrappedString$().newBuilder__scm_Builder()
});
var $d_sci_WrappedString = new $TypeData().initClass({
  sci_WrappedString: 0
}, false, "scala.collection.immutable.WrappedString", {
  sci_WrappedString: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
$c_sci_WrappedString.prototype.$classData = $d_sci_WrappedString;
/** @constructor */
function $c_sci_$colon$colon() {
  $c_sci_List.call(this);
  this.head$5 = null;
  this.tl$5 = null
}
$c_sci_$colon$colon.prototype = new $h_sci_List();
$c_sci_$colon$colon.prototype.constructor = $c_sci_$colon$colon;
/** @constructor */
function $h_sci_$colon$colon() {
  /*<skip>*/
}
$h_sci_$colon$colon.prototype = $c_sci_$colon$colon.prototype;
$c_sci_$colon$colon.prototype.head__O = (function() {
  return this.head$5
});
$c_sci_$colon$colon.prototype.productPrefix__T = (function() {
  return "::"
});
$c_sci_$colon$colon.prototype.productArity__I = (function() {
  return 2
});
$c_sci_$colon$colon.prototype.tail__sci_List = (function() {
  return this.tl$5
});
$c_sci_$colon$colon.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_$colon$colon.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.head$5;
      break
    }
    case 1: {
      return this.tl$5;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sci_$colon$colon.prototype.tail__O = (function() {
  return this.tl$5
});
$c_sci_$colon$colon.prototype.init___O__sci_List = (function(head, tl) {
  this.head$5 = head;
  this.tl$5 = tl;
  return this
});
$c_sci_$colon$colon.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_$colon$colon = new $TypeData().initClass({
  sci_$colon$colon: 0
}, false, "scala.collection.immutable.$colon$colon", {
  sci_$colon$colon: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_$colon$colon.prototype.$classData = $d_sci_$colon$colon;
/** @constructor */
function $c_sci_Nil$() {
  $c_sci_List.call(this)
}
$c_sci_Nil$.prototype = new $h_sci_List();
$c_sci_Nil$.prototype.constructor = $c_sci_Nil$;
/** @constructor */
function $h_sci_Nil$() {
  /*<skip>*/
}
$h_sci_Nil$.prototype = $c_sci_Nil$.prototype;
$c_sci_Nil$.prototype.productPrefix__T = (function() {
  return "Nil"
});
$c_sci_Nil$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Nil$.prototype.init___ = (function() {
  return this
});
$c_sci_Nil$.prototype.productArity__I = (function() {
  return 0
});
$c_sci_Nil$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Nil$.prototype.tail__sci_List = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty list")
});
$c_sci_Nil$.prototype.equals__O__Z = (function(that) {
  if ($is_sc_GenSeq(that)) {
    var x2 = $as_sc_GenSeq(that);
    return x2.isEmpty__Z()
  } else {
    return false
  }
});
$c_sci_Nil$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_sci_Nil$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty list")
});
$c_sci_Nil$.prototype.tail__O = (function() {
  return this.tail__sci_List()
});
$c_sci_Nil$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_Nil$ = new $TypeData().initClass({
  sci_Nil$: 0
}, false, "scala.collection.immutable.Nil$", {
  sci_Nil$: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Nil$.prototype.$classData = $d_sci_Nil$;
var $n_sci_Nil$ = (void 0);
function $m_sci_Nil$() {
  if ((!$n_sci_Nil$)) {
    $n_sci_Nil$ = new $c_sci_Nil$().init___()
  };
  return $n_sci_Nil$
}
/** @constructor */
function $c_scm_AbstractBuffer() {
  $c_scm_AbstractSeq.call(this)
}
$c_scm_AbstractBuffer.prototype = new $h_scm_AbstractSeq();
$c_scm_AbstractBuffer.prototype.constructor = $c_scm_AbstractBuffer;
/** @constructor */
function $h_scm_AbstractBuffer() {
  /*<skip>*/
}
$h_scm_AbstractBuffer.prototype = $c_scm_AbstractBuffer.prototype;
$c_scm_AbstractBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
/** @constructor */
function $c_scm_WrappedArray() {
  $c_scm_AbstractSeq.call(this)
}
$c_scm_WrappedArray.prototype = new $h_scm_AbstractSeq();
$c_scm_WrappedArray.prototype.constructor = $c_scm_WrappedArray;
/** @constructor */
function $h_scm_WrappedArray() {
  /*<skip>*/
}
$h_scm_WrappedArray.prototype = $c_scm_WrappedArray.prototype;
$c_scm_WrappedArray.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_WrappedArray.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_WrappedArray.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_WrappedArray.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_WrappedArray.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_IndexedSeq$()
});
$c_scm_WrappedArray.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_WrappedArray.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var end = this.length__I();
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_WrappedArray.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.length__I())
});
$c_scm_WrappedArray.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_WrappedArray.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_WrappedArray.prototype.sizeHintIfCheap__I = (function() {
  return this.length__I()
});
$c_scm_WrappedArray.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_scm_WrappedArray.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_WrappedArray.prototype.toArray__s_reflect_ClassTag__O = (function(evidence$1) {
  var thatElementClass = evidence$1.runtimeClass__jl_Class();
  return ((this.elementClass__p5__jl_Class() === thatElementClass) ? this.array__O() : $f_sc_TraversableOnce__toArray__s_reflect_ClassTag__O(this, evidence$1))
});
$c_scm_WrappedArray.prototype.elementClass__p5__jl_Class = (function() {
  var this$1 = this.array__O();
  return $objectGetClass(this$1).getComponentType__jl_Class()
});
$c_scm_WrappedArray.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_WrappedArrayBuilder().init___s_reflect_ClassTag(this.elemTag__s_reflect_ClassTag())
});
$c_scm_WrappedArray.prototype.stringPrefix__T = (function() {
  return "WrappedArray"
});
/** @constructor */
function $c_scm_WrappedArray$ofBoolean() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofBoolean.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofBoolean.prototype.constructor = $c_scm_WrappedArray$ofBoolean;
/** @constructor */
function $h_scm_WrappedArray$ofBoolean() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofBoolean.prototype = $c_scm_WrappedArray$ofBoolean.prototype;
$c_scm_WrappedArray$ofBoolean.prototype.apply__I__O = (function(index) {
  return this.apply$mcZI$sp__I__Z(index)
});
$c_scm_WrappedArray$ofBoolean.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.apply$mcZI$sp__I__Z(index)
});
$c_scm_WrappedArray$ofBoolean.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__Z__V(index, $uZ(elem))
});
$c_scm_WrappedArray$ofBoolean.prototype.equals__O__Z = (function(that) {
  if ($is_scm_WrappedArray$ofBoolean(that)) {
    var x2 = $as_scm_WrappedArray$ofBoolean(that);
    return $m_ju_Arrays$().equals__AZ__AZ__Z(this.array$6, x2.array$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_WrappedArray$ofBoolean.prototype.apply$mcZI$sp__I__Z = (function(index) {
  return this.array$6.get(index)
});
$c_scm_WrappedArray$ofBoolean.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofBoolean.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$BooleanManifest$()
});
$c_scm_WrappedArray$ofBoolean.prototype.update__I__Z__V = (function(index, elem) {
  this.array$6.set(index, elem)
});
$c_scm_WrappedArray$ofBoolean.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofBoolean.prototype.init___AZ = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofBoolean.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var a = this.array$6;
  return this$1.arrayHash$mZc$sp__AZ__I__I(a, this$1.seqSeed$2)
});
function $is_scm_WrappedArray$ofBoolean(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_WrappedArray$ofBoolean)))
}
function $as_scm_WrappedArray$ofBoolean(obj) {
  return (($is_scm_WrappedArray$ofBoolean(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.WrappedArray$ofBoolean"))
}
function $isArrayOf_scm_WrappedArray$ofBoolean(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_WrappedArray$ofBoolean)))
}
function $asArrayOf_scm_WrappedArray$ofBoolean(obj, depth) {
  return (($isArrayOf_scm_WrappedArray$ofBoolean(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.WrappedArray$ofBoolean;", depth))
}
var $d_scm_WrappedArray$ofBoolean = new $TypeData().initClass({
  scm_WrappedArray$ofBoolean: 0
}, false, "scala.collection.mutable.WrappedArray$ofBoolean", {
  scm_WrappedArray$ofBoolean: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofBoolean.prototype.$classData = $d_scm_WrappedArray$ofBoolean;
/** @constructor */
function $c_scm_WrappedArray$ofByte() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofByte.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofByte.prototype.constructor = $c_scm_WrappedArray$ofByte;
/** @constructor */
function $h_scm_WrappedArray$ofByte() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofByte.prototype = $c_scm_WrappedArray$ofByte.prototype;
$c_scm_WrappedArray$ofByte.prototype.apply__I__O = (function(index) {
  return this.apply__I__B(index)
});
$c_scm_WrappedArray$ofByte.prototype.apply__O__O = (function(v1) {
  return this.apply__I__B($uI(v1))
});
$c_scm_WrappedArray$ofByte.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__B__V(index, $uB(elem))
});
$c_scm_WrappedArray$ofByte.prototype.equals__O__Z = (function(that) {
  if ($is_scm_WrappedArray$ofByte(that)) {
    var x2 = $as_scm_WrappedArray$ofByte(that);
    return $m_ju_Arrays$().equals__AB__AB__Z(this.array$6, x2.array$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_WrappedArray$ofByte.prototype.apply__I__B = (function(index) {
  return this.array$6.get(index)
});
$c_scm_WrappedArray$ofByte.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofByte.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$ByteManifest$()
});
$c_scm_WrappedArray$ofByte.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofByte.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var data = this.array$6;
  return this$1.bytesHash__AB__I__I(data, this$1.seqSeed$2)
});
$c_scm_WrappedArray$ofByte.prototype.init___AB = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofByte.prototype.update__I__B__V = (function(index, elem) {
  this.array$6.set(index, elem)
});
function $is_scm_WrappedArray$ofByte(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_WrappedArray$ofByte)))
}
function $as_scm_WrappedArray$ofByte(obj) {
  return (($is_scm_WrappedArray$ofByte(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.WrappedArray$ofByte"))
}
function $isArrayOf_scm_WrappedArray$ofByte(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_WrappedArray$ofByte)))
}
function $asArrayOf_scm_WrappedArray$ofByte(obj, depth) {
  return (($isArrayOf_scm_WrappedArray$ofByte(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.WrappedArray$ofByte;", depth))
}
var $d_scm_WrappedArray$ofByte = new $TypeData().initClass({
  scm_WrappedArray$ofByte: 0
}, false, "scala.collection.mutable.WrappedArray$ofByte", {
  scm_WrappedArray$ofByte: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofByte.prototype.$classData = $d_scm_WrappedArray$ofByte;
/** @constructor */
function $c_scm_WrappedArray$ofChar() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofChar.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofChar.prototype.constructor = $c_scm_WrappedArray$ofChar;
/** @constructor */
function $h_scm_WrappedArray$ofChar() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofChar.prototype = $c_scm_WrappedArray$ofChar.prototype;
$c_scm_WrappedArray$ofChar.prototype.apply__I__O = (function(index) {
  var c = this.apply__I__C(index);
  return new $c_jl_Character().init___C(c)
});
$c_scm_WrappedArray$ofChar.prototype.apply__O__O = (function(v1) {
  var c = this.apply__I__C($uI(v1));
  return new $c_jl_Character().init___C(c)
});
$c_scm_WrappedArray$ofChar.prototype.update__I__O__V = (function(index, elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  this.update__I__C__V(index, jsx$1)
});
$c_scm_WrappedArray$ofChar.prototype.equals__O__Z = (function(that) {
  if ($is_scm_WrappedArray$ofChar(that)) {
    var x2 = $as_scm_WrappedArray$ofChar(that);
    return $m_ju_Arrays$().equals__AC__AC__Z(this.array$6, x2.array$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_WrappedArray$ofChar.prototype.apply__I__C = (function(index) {
  return this.array$6.get(index)
});
$c_scm_WrappedArray$ofChar.prototype.update__I__C__V = (function(index, elem) {
  this.array$6.set(index, elem)
});
$c_scm_WrappedArray$ofChar.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofChar.prototype.init___AC = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofChar.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$CharManifest$()
});
$c_scm_WrappedArray$ofChar.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofChar.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var a = this.array$6;
  return this$1.arrayHash$mCc$sp__AC__I__I(a, this$1.seqSeed$2)
});
function $is_scm_WrappedArray$ofChar(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_WrappedArray$ofChar)))
}
function $as_scm_WrappedArray$ofChar(obj) {
  return (($is_scm_WrappedArray$ofChar(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.WrappedArray$ofChar"))
}
function $isArrayOf_scm_WrappedArray$ofChar(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_WrappedArray$ofChar)))
}
function $asArrayOf_scm_WrappedArray$ofChar(obj, depth) {
  return (($isArrayOf_scm_WrappedArray$ofChar(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.WrappedArray$ofChar;", depth))
}
var $d_scm_WrappedArray$ofChar = new $TypeData().initClass({
  scm_WrappedArray$ofChar: 0
}, false, "scala.collection.mutable.WrappedArray$ofChar", {
  scm_WrappedArray$ofChar: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofChar.prototype.$classData = $d_scm_WrappedArray$ofChar;
/** @constructor */
function $c_scm_WrappedArray$ofDouble() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofDouble.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofDouble.prototype.constructor = $c_scm_WrappedArray$ofDouble;
/** @constructor */
function $h_scm_WrappedArray$ofDouble() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofDouble.prototype = $c_scm_WrappedArray$ofDouble.prototype;
$c_scm_WrappedArray$ofDouble.prototype.apply__I__O = (function(index) {
  return this.apply$mcDI$sp__I__D(index)
});
$c_scm_WrappedArray$ofDouble.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.apply$mcDI$sp__I__D(index)
});
$c_scm_WrappedArray$ofDouble.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__D__V(index, $uD(elem))
});
$c_scm_WrappedArray$ofDouble.prototype.equals__O__Z = (function(that) {
  if ($is_scm_WrappedArray$ofDouble(that)) {
    var x2 = $as_scm_WrappedArray$ofDouble(that);
    return $m_ju_Arrays$().equals__AD__AD__Z(this.array$6, x2.array$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_WrappedArray$ofDouble.prototype.init___AD = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofDouble.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofDouble.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$DoubleManifest$()
});
$c_scm_WrappedArray$ofDouble.prototype.update__I__D__V = (function(index, elem) {
  this.array$6.set(index, elem)
});
$c_scm_WrappedArray$ofDouble.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofDouble.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var a = this.array$6;
  return this$1.arrayHash$mDc$sp__AD__I__I(a, this$1.seqSeed$2)
});
$c_scm_WrappedArray$ofDouble.prototype.apply$mcDI$sp__I__D = (function(index) {
  return this.array$6.get(index)
});
function $is_scm_WrappedArray$ofDouble(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_WrappedArray$ofDouble)))
}
function $as_scm_WrappedArray$ofDouble(obj) {
  return (($is_scm_WrappedArray$ofDouble(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.WrappedArray$ofDouble"))
}
function $isArrayOf_scm_WrappedArray$ofDouble(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_WrappedArray$ofDouble)))
}
function $asArrayOf_scm_WrappedArray$ofDouble(obj, depth) {
  return (($isArrayOf_scm_WrappedArray$ofDouble(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.WrappedArray$ofDouble;", depth))
}
var $d_scm_WrappedArray$ofDouble = new $TypeData().initClass({
  scm_WrappedArray$ofDouble: 0
}, false, "scala.collection.mutable.WrappedArray$ofDouble", {
  scm_WrappedArray$ofDouble: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofDouble.prototype.$classData = $d_scm_WrappedArray$ofDouble;
/** @constructor */
function $c_scm_WrappedArray$ofFloat() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofFloat.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofFloat.prototype.constructor = $c_scm_WrappedArray$ofFloat;
/** @constructor */
function $h_scm_WrappedArray$ofFloat() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofFloat.prototype = $c_scm_WrappedArray$ofFloat.prototype;
$c_scm_WrappedArray$ofFloat.prototype.apply__I__O = (function(index) {
  return this.apply$mcFI$sp__I__F(index)
});
$c_scm_WrappedArray$ofFloat.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.apply$mcFI$sp__I__F(index)
});
$c_scm_WrappedArray$ofFloat.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__F__V(index, $uF(elem))
});
$c_scm_WrappedArray$ofFloat.prototype.equals__O__Z = (function(that) {
  if ($is_scm_WrappedArray$ofFloat(that)) {
    var x2 = $as_scm_WrappedArray$ofFloat(that);
    return $m_ju_Arrays$().equals__AF__AF__Z(this.array$6, x2.array$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_WrappedArray$ofFloat.prototype.init___AF = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofFloat.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofFloat.prototype.apply$mcFI$sp__I__F = (function(index) {
  return this.array$6.get(index)
});
$c_scm_WrappedArray$ofFloat.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$FloatManifest$()
});
$c_scm_WrappedArray$ofFloat.prototype.update__I__F__V = (function(index, elem) {
  this.array$6.set(index, elem)
});
$c_scm_WrappedArray$ofFloat.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofFloat.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var a = this.array$6;
  return this$1.arrayHash$mFc$sp__AF__I__I(a, this$1.seqSeed$2)
});
function $is_scm_WrappedArray$ofFloat(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_WrappedArray$ofFloat)))
}
function $as_scm_WrappedArray$ofFloat(obj) {
  return (($is_scm_WrappedArray$ofFloat(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.WrappedArray$ofFloat"))
}
function $isArrayOf_scm_WrappedArray$ofFloat(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_WrappedArray$ofFloat)))
}
function $asArrayOf_scm_WrappedArray$ofFloat(obj, depth) {
  return (($isArrayOf_scm_WrappedArray$ofFloat(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.WrappedArray$ofFloat;", depth))
}
var $d_scm_WrappedArray$ofFloat = new $TypeData().initClass({
  scm_WrappedArray$ofFloat: 0
}, false, "scala.collection.mutable.WrappedArray$ofFloat", {
  scm_WrappedArray$ofFloat: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofFloat.prototype.$classData = $d_scm_WrappedArray$ofFloat;
/** @constructor */
function $c_scm_WrappedArray$ofInt() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofInt.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofInt.prototype.constructor = $c_scm_WrappedArray$ofInt;
/** @constructor */
function $h_scm_WrappedArray$ofInt() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofInt.prototype = $c_scm_WrappedArray$ofInt.prototype;
$c_scm_WrappedArray$ofInt.prototype.apply__I__O = (function(index) {
  return this.apply$mcII$sp__I__I(index)
});
$c_scm_WrappedArray$ofInt.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.apply$mcII$sp__I__I(index)
});
$c_scm_WrappedArray$ofInt.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__I__V(index, $uI(elem))
});
$c_scm_WrappedArray$ofInt.prototype.update__I__I__V = (function(index, elem) {
  this.array$6.set(index, elem)
});
$c_scm_WrappedArray$ofInt.prototype.equals__O__Z = (function(that) {
  if ($is_scm_WrappedArray$ofInt(that)) {
    var x2 = $as_scm_WrappedArray$ofInt(that);
    return $m_ju_Arrays$().equals__AI__AI__Z(this.array$6, x2.array$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_WrappedArray$ofInt.prototype.apply$mcII$sp__I__I = (function(index) {
  return this.array$6.get(index)
});
$c_scm_WrappedArray$ofInt.prototype.init___AI = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofInt.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofInt.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$IntManifest$()
});
$c_scm_WrappedArray$ofInt.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofInt.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var a = this.array$6;
  return this$1.arrayHash$mIc$sp__AI__I__I(a, this$1.seqSeed$2)
});
function $is_scm_WrappedArray$ofInt(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_WrappedArray$ofInt)))
}
function $as_scm_WrappedArray$ofInt(obj) {
  return (($is_scm_WrappedArray$ofInt(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.WrappedArray$ofInt"))
}
function $isArrayOf_scm_WrappedArray$ofInt(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_WrappedArray$ofInt)))
}
function $asArrayOf_scm_WrappedArray$ofInt(obj, depth) {
  return (($isArrayOf_scm_WrappedArray$ofInt(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.WrappedArray$ofInt;", depth))
}
var $d_scm_WrappedArray$ofInt = new $TypeData().initClass({
  scm_WrappedArray$ofInt: 0
}, false, "scala.collection.mutable.WrappedArray$ofInt", {
  scm_WrappedArray$ofInt: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofInt.prototype.$classData = $d_scm_WrappedArray$ofInt;
/** @constructor */
function $c_scm_WrappedArray$ofLong() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofLong.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofLong.prototype.constructor = $c_scm_WrappedArray$ofLong;
/** @constructor */
function $h_scm_WrappedArray$ofLong() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofLong.prototype = $c_scm_WrappedArray$ofLong.prototype;
$c_scm_WrappedArray$ofLong.prototype.apply__I__O = (function(index) {
  return this.apply$mcJI$sp__I__J(index)
});
$c_scm_WrappedArray$ofLong.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.apply$mcJI$sp__I__J(index)
});
$c_scm_WrappedArray$ofLong.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__J__V(index, $uJ(elem))
});
$c_scm_WrappedArray$ofLong.prototype.init___AJ = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofLong.prototype.equals__O__Z = (function(that) {
  if ($is_scm_WrappedArray$ofLong(that)) {
    var x2 = $as_scm_WrappedArray$ofLong(that);
    return $m_ju_Arrays$().equals__AJ__AJ__Z(this.array$6, x2.array$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_WrappedArray$ofLong.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofLong.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$LongManifest$()
});
$c_scm_WrappedArray$ofLong.prototype.update__I__J__V = (function(index, elem) {
  this.array$6.set(index, elem)
});
$c_scm_WrappedArray$ofLong.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofLong.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var a = this.array$6;
  return this$1.arrayHash$mJc$sp__AJ__I__I(a, this$1.seqSeed$2)
});
$c_scm_WrappedArray$ofLong.prototype.apply$mcJI$sp__I__J = (function(index) {
  return this.array$6.get(index)
});
function $is_scm_WrappedArray$ofLong(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_WrappedArray$ofLong)))
}
function $as_scm_WrappedArray$ofLong(obj) {
  return (($is_scm_WrappedArray$ofLong(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.WrappedArray$ofLong"))
}
function $isArrayOf_scm_WrappedArray$ofLong(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_WrappedArray$ofLong)))
}
function $asArrayOf_scm_WrappedArray$ofLong(obj, depth) {
  return (($isArrayOf_scm_WrappedArray$ofLong(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.WrappedArray$ofLong;", depth))
}
var $d_scm_WrappedArray$ofLong = new $TypeData().initClass({
  scm_WrappedArray$ofLong: 0
}, false, "scala.collection.mutable.WrappedArray$ofLong", {
  scm_WrappedArray$ofLong: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofLong.prototype.$classData = $d_scm_WrappedArray$ofLong;
/** @constructor */
function $c_scm_WrappedArray$ofRef() {
  $c_scm_WrappedArray.call(this);
  this.elemTag$6 = null;
  this.array$6 = null;
  this.bitmap$0$6 = false
}
$c_scm_WrappedArray$ofRef.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofRef.prototype.constructor = $c_scm_WrappedArray$ofRef;
/** @constructor */
function $h_scm_WrappedArray$ofRef() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofRef.prototype = $c_scm_WrappedArray$ofRef.prototype;
$c_scm_WrappedArray$ofRef.prototype.apply__I__O = (function(index) {
  return this.array$6.get(index)
});
$c_scm_WrappedArray$ofRef.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_scm_WrappedArray$ofRef.prototype.update__I__O__V = (function(index, elem) {
  this.array$6.set(index, elem)
});
$c_scm_WrappedArray$ofRef.prototype.equals__O__Z = (function(that) {
  if ($is_scm_WrappedArray$ofRef(that)) {
    var x2 = $as_scm_WrappedArray$ofRef(that);
    return $m_ju_Arrays$().equals__AO__AO__Z(this.array$6, x2.array$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_WrappedArray$ofRef.prototype.elemTag$lzycompute__p6__s_reflect_ClassTag = (function() {
  if ((!this.bitmap$0$6)) {
    var jsx$1 = $m_s_reflect_ClassTag$();
    var this$1 = this.array$6;
    this.elemTag$6 = jsx$1.apply__jl_Class__s_reflect_ClassTag($objectGetClass(this$1).getComponentType__jl_Class());
    this.bitmap$0$6 = true
  };
  return this.elemTag$6
});
$c_scm_WrappedArray$ofRef.prototype.init___AO = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofRef.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofRef.prototype.elemTag__s_reflect_ClassTag = (function() {
  return ((!this.bitmap$0$6) ? this.elemTag$lzycompute__p6__s_reflect_ClassTag() : this.elemTag$6)
});
$c_scm_WrappedArray$ofRef.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofRef.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var a = this.array$6;
  return this$1.arrayHash__O__I__I(a, this$1.seqSeed$2)
});
function $is_scm_WrappedArray$ofRef(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_WrappedArray$ofRef)))
}
function $as_scm_WrappedArray$ofRef(obj) {
  return (($is_scm_WrappedArray$ofRef(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.WrappedArray$ofRef"))
}
function $isArrayOf_scm_WrappedArray$ofRef(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_WrappedArray$ofRef)))
}
function $asArrayOf_scm_WrappedArray$ofRef(obj, depth) {
  return (($isArrayOf_scm_WrappedArray$ofRef(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.WrappedArray$ofRef;", depth))
}
var $d_scm_WrappedArray$ofRef = new $TypeData().initClass({
  scm_WrappedArray$ofRef: 0
}, false, "scala.collection.mutable.WrappedArray$ofRef", {
  scm_WrappedArray$ofRef: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofRef.prototype.$classData = $d_scm_WrappedArray$ofRef;
/** @constructor */
function $c_scm_WrappedArray$ofShort() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofShort.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofShort.prototype.constructor = $c_scm_WrappedArray$ofShort;
/** @constructor */
function $h_scm_WrappedArray$ofShort() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofShort.prototype = $c_scm_WrappedArray$ofShort.prototype;
$c_scm_WrappedArray$ofShort.prototype.apply__I__O = (function(index) {
  return this.apply__I__S(index)
});
$c_scm_WrappedArray$ofShort.prototype.apply__O__O = (function(v1) {
  return this.apply__I__S($uI(v1))
});
$c_scm_WrappedArray$ofShort.prototype.update__I__S__V = (function(index, elem) {
  this.array$6.set(index, elem)
});
$c_scm_WrappedArray$ofShort.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__S__V(index, $uS(elem))
});
$c_scm_WrappedArray$ofShort.prototype.init___AS = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofShort.prototype.equals__O__Z = (function(that) {
  if ($is_scm_WrappedArray$ofShort(that)) {
    var x2 = $as_scm_WrappedArray$ofShort(that);
    return $m_ju_Arrays$().equals__AS__AS__Z(this.array$6, x2.array$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_WrappedArray$ofShort.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofShort.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$ShortManifest$()
});
$c_scm_WrappedArray$ofShort.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofShort.prototype.apply__I__S = (function(index) {
  return this.array$6.get(index)
});
$c_scm_WrappedArray$ofShort.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var a = this.array$6;
  return this$1.arrayHash$mSc$sp__AS__I__I(a, this$1.seqSeed$2)
});
function $is_scm_WrappedArray$ofShort(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_WrappedArray$ofShort)))
}
function $as_scm_WrappedArray$ofShort(obj) {
  return (($is_scm_WrappedArray$ofShort(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.WrappedArray$ofShort"))
}
function $isArrayOf_scm_WrappedArray$ofShort(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_WrappedArray$ofShort)))
}
function $asArrayOf_scm_WrappedArray$ofShort(obj, depth) {
  return (($isArrayOf_scm_WrappedArray$ofShort(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.WrappedArray$ofShort;", depth))
}
var $d_scm_WrappedArray$ofShort = new $TypeData().initClass({
  scm_WrappedArray$ofShort: 0
}, false, "scala.collection.mutable.WrappedArray$ofShort", {
  scm_WrappedArray$ofShort: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofShort.prototype.$classData = $d_scm_WrappedArray$ofShort;
/** @constructor */
function $c_scm_WrappedArray$ofUnit() {
  $c_scm_WrappedArray.call(this);
  this.array$6 = null
}
$c_scm_WrappedArray$ofUnit.prototype = new $h_scm_WrappedArray();
$c_scm_WrappedArray$ofUnit.prototype.constructor = $c_scm_WrappedArray$ofUnit;
/** @constructor */
function $h_scm_WrappedArray$ofUnit() {
  /*<skip>*/
}
$h_scm_WrappedArray$ofUnit.prototype = $c_scm_WrappedArray$ofUnit.prototype;
$c_scm_WrappedArray$ofUnit.prototype.apply$mcVI$sp__I__V = (function(index) {
  this.array$6.get(index)
});
$c_scm_WrappedArray$ofUnit.prototype.apply__I__O = (function(index) {
  this.apply$mcVI$sp__I__V(index)
});
$c_scm_WrappedArray$ofUnit.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  this.apply$mcVI$sp__I__V(index)
});
$c_scm_WrappedArray$ofUnit.prototype.update__I__O__V = (function(index, elem) {
  this.update__I__sr_BoxedUnit__V(index, $asUnit(elem))
});
$c_scm_WrappedArray$ofUnit.prototype.equals__O__Z = (function(that) {
  if ($is_scm_WrappedArray$ofUnit(that)) {
    var x2 = $as_scm_WrappedArray$ofUnit(that);
    return (this.array$6.u.length === x2.array$6.u.length)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_WrappedArray$ofUnit.prototype.length__I = (function() {
  return this.array$6.u.length
});
$c_scm_WrappedArray$ofUnit.prototype.elemTag__s_reflect_ClassTag = (function() {
  return $m_s_reflect_ManifestFactory$UnitManifest$()
});
$c_scm_WrappedArray$ofUnit.prototype.init___Asr_BoxedUnit = (function(array) {
  this.array$6 = array;
  return this
});
$c_scm_WrappedArray$ofUnit.prototype.array__O = (function() {
  return this.array$6
});
$c_scm_WrappedArray$ofUnit.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var a = this.array$6;
  return this$1.arrayHash$mVc$sp__Asr_BoxedUnit__I__I(a, this$1.seqSeed$2)
});
$c_scm_WrappedArray$ofUnit.prototype.update__I__sr_BoxedUnit__V = (function(index, elem) {
  this.array$6.set(index, elem)
});
function $is_scm_WrappedArray$ofUnit(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_WrappedArray$ofUnit)))
}
function $as_scm_WrappedArray$ofUnit(obj) {
  return (($is_scm_WrappedArray$ofUnit(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.WrappedArray$ofUnit"))
}
function $isArrayOf_scm_WrappedArray$ofUnit(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_WrappedArray$ofUnit)))
}
function $asArrayOf_scm_WrappedArray$ofUnit(obj, depth) {
  return (($isArrayOf_scm_WrappedArray$ofUnit(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.WrappedArray$ofUnit;", depth))
}
var $d_scm_WrappedArray$ofUnit = new $TypeData().initClass({
  scm_WrappedArray$ofUnit: 0
}, false, "scala.collection.mutable.WrappedArray$ofUnit", {
  scm_WrappedArray$ofUnit: 1,
  scm_WrappedArray: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_WrappedArray$ofUnit.prototype.$classData = $d_scm_WrappedArray$ofUnit;
/** @constructor */
function $c_scm_ListBuffer() {
  $c_scm_AbstractBuffer.call(this);
  this.scala$collection$mutable$ListBuffer$$start$6 = null;
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
}
$c_scm_ListBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ListBuffer.prototype.constructor = $c_scm_ListBuffer;
/** @constructor */
function $h_scm_ListBuffer() {
  /*<skip>*/
}
$h_scm_ListBuffer.prototype = $c_scm_ListBuffer.prototype;
$c_scm_ListBuffer.prototype.copyToArray__O__I__V = (function(xs, start) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  $f_sc_TraversableOnce__copyToArray__O__I__V(this$1, xs, start)
});
$c_scm_ListBuffer.prototype.copy__p6__V = (function() {
  if (this.isEmpty__Z()) {
    return (void 0)
  };
  var cursor = this.scala$collection$mutable$ListBuffer$$start$6;
  var this$1 = this.last0$6;
  var limit = this$1.tl$5;
  this.clear__V();
  while ((cursor !== limit)) {
    this.$$plus$eq__O__scm_ListBuffer(cursor.head__O());
    var this$2 = cursor;
    cursor = this$2.tail__sci_List()
  }
});
$c_scm_ListBuffer.prototype.init___ = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
  this.exported$6 = false;
  this.len$6 = 0;
  return this
});
$c_scm_ListBuffer.prototype.apply__I__O = (function(n) {
  if (((n < 0) || (n >= this.len$6))) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  } else {
    var this$2 = this.scala$collection$mutable$ListBuffer$$start$6;
    return $f_sc_LinearSeqOptimized__apply__I__O(this$2, n)
  }
});
$c_scm_ListBuffer.prototype.lengthCompare__I__I = (function(len) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this$1, len)
});
$c_scm_ListBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this$1, that)
});
$c_scm_ListBuffer.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_scm_ListBuffer.prototype.isEmpty__Z = (function() {
  return (this.len$6 === 0)
});
$c_scm_ListBuffer.prototype.toList__sci_List = (function() {
  this.exported$6 = (!this.isEmpty__Z());
  return this.scala$collection$mutable$ListBuffer$$start$6
});
$c_scm_ListBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_ListBuffer.prototype.equals__O__Z = (function(that) {
  if ($is_scm_ListBuffer(that)) {
    var x2 = $as_scm_ListBuffer(that);
    return this.scala$collection$mutable$ListBuffer$$start$6.equals__O__Z(x2.scala$collection$mutable$ListBuffer$$start$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_ListBuffer.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this$1, start, sep, end)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_ListBuffer$()
});
$c_scm_ListBuffer.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$2 = these;
    these = this$2.tail__sci_List()
  }
});
$c_scm_ListBuffer.prototype.foldLeft__O__F2__O = (function(z, op) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__foldLeft__O__F2__O(this$1, z, op)
});
$c_scm_ListBuffer.prototype.toBuffer__scm_Buffer = (function() {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  var this$2 = $m_scm_ArrayBuffer$();
  var cbf = this$2.ReusableCBFInstance$2;
  return $as_scm_Buffer($f_sc_TraversableLike__to__scg_CanBuildFrom__O(this$1, cbf))
});
$c_scm_ListBuffer.prototype.size__I = (function() {
  return this.len$6
});
$c_scm_ListBuffer.prototype.result__O = (function() {
  return this.toList__sci_List()
});
$c_scm_ListBuffer.prototype.iterator__sc_Iterator = (function() {
  return new $c_scm_ListBuffer$$anon$1().init___scm_ListBuffer(this)
});
$c_scm_ListBuffer.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_ListBuffer.prototype.length__I = (function() {
  return this.len$6
});
$c_scm_ListBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_ListBuffer.prototype.toStream__sci_Stream = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream()
});
$c_scm_ListBuffer.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this$1, b, start, sep, end)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scm_ListBuffer = (function(x) {
  if (this.exported$6) {
    this.copy__p6__V()
  };
  if (this.isEmpty__Z()) {
    this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
    this.scala$collection$mutable$ListBuffer$$start$6 = this.last0$6
  } else {
    var last1 = this.last0$6;
    this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
    last1.tl$5 = this.last0$6
  };
  this.len$6 = ((1 + this.len$6) | 0);
  return this
});
$c_scm_ListBuffer.prototype.isDefinedAt__O__Z = (function(x) {
  var x$1 = $uI(x);
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__isDefinedAt__I__Z(this$1, x$1)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_ListBuffer.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  $f_sc_IterableLike__copyToArray__O__I__I__V(this$1, xs, start, len)
});
$c_scm_ListBuffer.prototype.sum__s_math_Numeric__O = (function(num) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_TraversableOnce__sum__s_math_Numeric__O(this$1, num)
});
$c_scm_ListBuffer.prototype.clear__V = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
});
$c_scm_ListBuffer.prototype.toArray__s_reflect_ClassTag__O = (function(evidence$1) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_TraversableOnce__toArray__s_reflect_ClassTag__O(this$1, evidence$1)
});
$c_scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer = (function(xs) {
  _$plus$plus$eq: while (true) {
    var x1 = xs;
    if ((x1 !== null)) {
      if ((x1 === this)) {
        var n = this.len$6;
        xs = $as_sc_TraversableOnce($f_sc_IterableLike__take__I__O(this, n));
        continue _$plus$plus$eq
      }
    };
    return $as_scm_ListBuffer($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(xs)
});
$c_scm_ListBuffer.prototype.stringPrefix__T = (function() {
  return "ListBuffer"
});
function $is_scm_ListBuffer(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ListBuffer)))
}
function $as_scm_ListBuffer(obj) {
  return (($is_scm_ListBuffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ListBuffer"))
}
function $isArrayOf_scm_ListBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ListBuffer)))
}
function $asArrayOf_scm_ListBuffer(obj, depth) {
  return (($isArrayOf_scm_ListBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ListBuffer;", depth))
}
var $d_scm_ListBuffer = new $TypeData().initClass({
  scm_ListBuffer: 0
}, false, "scala.collection.mutable.ListBuffer", {
  scm_ListBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_SeqForwarder: 1,
  scg_IterableForwarder: 1,
  scg_TraversableForwarder: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer.prototype.$classData = $d_scm_ListBuffer;
/** @constructor */
function $c_scm_StringBuilder() {
  $c_scm_AbstractSeq.call(this);
  this.underlying$5 = null
}
$c_scm_StringBuilder.prototype = new $h_scm_AbstractSeq();
$c_scm_StringBuilder.prototype.constructor = $c_scm_StringBuilder;
/** @constructor */
function $h_scm_StringBuilder() {
  /*<skip>*/
}
$h_scm_StringBuilder.prototype = $c_scm_StringBuilder.prototype;
$c_scm_StringBuilder.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_StringBuilder.prototype.init___ = (function() {
  $c_scm_StringBuilder.prototype.init___I__T.call(this, 16, "");
  return this
});
$c_scm_StringBuilder.prototype.$$plus$eq__C__scm_StringBuilder = (function(x) {
  this.append__C__scm_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.apply__I__O = (function(idx) {
  var c = this.underlying$5.charAt__I__C(idx);
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_StringBuilder.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_StringBuilder.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  var c = this.underlying$5.charAt__I__C(index);
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_StringBuilder.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  return this.underlying$5.substring__I__I__T(start, end)
});
$c_scm_StringBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_IndexedSeq$()
});
$c_scm_StringBuilder.prototype.toString__T = (function() {
  return this.underlying$5.java$lang$StringBuilder$$content$f
});
$c_scm_StringBuilder.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_StringBuilder.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var end = this.underlying$5.length__I();
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_StringBuilder.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_StringBuilder.prototype.result__O = (function() {
  return this.underlying$5.java$lang$StringBuilder$$content$f
});
$c_scm_StringBuilder.prototype.append__T__scm_StringBuilder = (function(s) {
  var this$1 = this.underlying$5;
  this$1.java$lang$StringBuilder$$content$f = (("" + this$1.java$lang$StringBuilder$$content$f) + s);
  return this
});
$c_scm_StringBuilder.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.underlying$5.length__I())
});
$c_scm_StringBuilder.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_StringBuilder.prototype.init___I__T = (function(initCapacity, initValue) {
  var this$2 = new $c_jl_StringBuilder().init___I((($uI(initValue.length) + initCapacity) | 0));
  this$2.java$lang$StringBuilder$$content$f = (("" + this$2.java$lang$StringBuilder$$content$f) + initValue);
  $c_scm_StringBuilder.prototype.init___jl_StringBuilder.call(this, this$2);
  return this
});
$c_scm_StringBuilder.prototype.length__I = (function() {
  return this.underlying$5.length__I()
});
$c_scm_StringBuilder.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.sizeHintIfCheap__I = (function() {
  return this.underlying$5.length__I()
});
$c_scm_StringBuilder.prototype.init___jl_StringBuilder = (function(underlying) {
  this.underlying$5 = underlying;
  return this
});
$c_scm_StringBuilder.prototype.append__O__scm_StringBuilder = (function(x) {
  var this$2 = this.underlying$5;
  var str = ("" + x);
  this$2.java$lang$StringBuilder$$content$f = (this$2.java$lang$StringBuilder$$content$f + str);
  return this
});
$c_scm_StringBuilder.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_scm_StringBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_StringBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_StringBuilder.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_StringBuilder.prototype.toArray__s_reflect_ClassTag__O = (function(evidence$1) {
  return $m_sjsr_RuntimeString$().toCharArray__T__AC(this.underlying$5.java$lang$StringBuilder$$content$f)
});
$c_scm_StringBuilder.prototype.append__C__scm_StringBuilder = (function(x) {
  this.underlying$5.append__C__jl_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_StringBuilder().init___())
});
$c_scm_StringBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_StringBuilder = new $TypeData().initClass({
  scm_StringBuilder: 0
}, false, "scala.collection.mutable.StringBuilder", {
  scm_StringBuilder: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  jl_CharSequence: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder.prototype.$classData = $d_scm_StringBuilder;
/** @constructor */
function $c_sjs_js_WrappedArray() {
  $c_scm_AbstractBuffer.call(this);
  this.array$6 = null
}
$c_sjs_js_WrappedArray.prototype = new $h_scm_AbstractBuffer();
$c_sjs_js_WrappedArray.prototype.constructor = $c_sjs_js_WrappedArray;
/** @constructor */
function $h_sjs_js_WrappedArray() {
  /*<skip>*/
}
$h_sjs_js_WrappedArray.prototype = $c_sjs_js_WrappedArray.prototype;
$c_sjs_js_WrappedArray.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.init___ = (function() {
  $c_sjs_js_WrappedArray.prototype.init___sjs_js_Array.call(this, []);
  return this
});
$c_sjs_js_WrappedArray.prototype.apply__I__O = (function(index) {
  return this.array$6[index]
});
$c_sjs_js_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sjs_js_WrappedArray.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sjs_js_WrappedArray.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.array$6[index]
});
$c_sjs_js_WrappedArray.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_sjs_js_WrappedArray.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  this.array$6.push(elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sjs_js_WrappedArray$()
});
$c_sjs_js_WrappedArray.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_sjs_js_WrappedArray.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var end = $uI(this.array$6.length);
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_sjs_js_WrappedArray.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_sjs_js_WrappedArray.prototype.result__O = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(this.array$6.length))
});
$c_sjs_js_WrappedArray.prototype.seq__scm_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_sjs_js_WrappedArray.prototype.length__I = (function() {
  return $uI(this.array$6.length)
});
$c_sjs_js_WrappedArray.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.sizeHintIfCheap__I = (function() {
  return $uI(this.array$6.length)
});
$c_sjs_js_WrappedArray.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_sjs_js_WrappedArray.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  this.array$6.push(elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_sjs_js_WrappedArray.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sjs_js_WrappedArray.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sjs_js_WrappedArray.prototype.init___sjs_js_Array = (function(array) {
  this.array$6 = array;
  return this
});
$c_sjs_js_WrappedArray.prototype.stringPrefix__T = (function() {
  return "WrappedArray"
});
function $is_sjs_js_WrappedArray(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_WrappedArray)))
}
function $as_sjs_js_WrappedArray(obj) {
  return (($is_sjs_js_WrappedArray(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.WrappedArray"))
}
function $isArrayOf_sjs_js_WrappedArray(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_WrappedArray)))
}
function $asArrayOf_sjs_js_WrappedArray(obj, depth) {
  return (($isArrayOf_sjs_js_WrappedArray(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.WrappedArray;", depth))
}
var $d_sjs_js_WrappedArray = new $TypeData().initClass({
  sjs_js_WrappedArray: 0
}, false, "scala.scalajs.js.WrappedArray", {
  sjs_js_WrappedArray: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1
});
$c_sjs_js_WrappedArray.prototype.$classData = $d_sjs_js_WrappedArray;
/** @constructor */
function $c_scm_ArrayBuffer() {
  $c_scm_AbstractBuffer.call(this);
  this.initialSize$6 = 0;
  this.array$6 = null;
  this.size0$6 = 0
}
$c_scm_ArrayBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ArrayBuffer.prototype.constructor = $c_scm_ArrayBuffer;
/** @constructor */
function $h_scm_ArrayBuffer() {
  /*<skip>*/
}
$h_scm_ArrayBuffer.prototype = $c_scm_ArrayBuffer.prototype;
$c_scm_ArrayBuffer.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scm_ArrayBuffer = (function(elem) {
  var n = ((1 + this.size0$6) | 0);
  $f_scm_ResizableArray__ensureSize__I__V(this, n);
  this.array$6.set(this.size0$6, elem);
  this.size0$6 = ((1 + this.size0$6) | 0);
  return this
});
$c_scm_ArrayBuffer.prototype.init___ = (function() {
  $c_scm_ArrayBuffer.prototype.init___I.call(this, 16);
  return this
});
$c_scm_ArrayBuffer.prototype.apply__I__O = (function(idx) {
  return $f_scm_ResizableArray__apply__I__O(this, idx)
});
$c_scm_ArrayBuffer.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayBuffer.prototype.apply__O__O = (function(v1) {
  var idx = $uI(v1);
  return $f_scm_ResizableArray__apply__I__O(this, idx)
});
$c_scm_ArrayBuffer.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_ArrayBuffer$()
});
$c_scm_ArrayBuffer.prototype.foreach__F1__V = (function(f) {
  $f_scm_ResizableArray__foreach__F1__V(this, f)
});
$c_scm_ArrayBuffer.prototype.foldLeft__O__F2__O = (function(z, op) {
  var start = 0;
  var end = this.size0$6;
  var z$1 = z;
  return $f_sc_IndexedSeqOptimized__foldl__psc_IndexedSeqOptimized__I__I__O__F2__O(this, start, end, z$1, op)
});
$c_scm_ArrayBuffer.prototype.toBuffer__scm_Buffer = (function() {
  return $f_sc_IndexedSeqLike__toBuffer__scm_Buffer(this)
});
$c_scm_ArrayBuffer.prototype.result__O = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.size0$6)
});
$c_scm_ArrayBuffer.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_ArrayBuffer.prototype.init___I = (function(initialSize) {
  this.initialSize$6 = initialSize;
  $f_scm_ResizableArray__$$init$__V(this);
  return this
});
$c_scm_ArrayBuffer.prototype.length__I = (function() {
  return this.size0$6
});
$c_scm_ArrayBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.sizeHintIfCheap__I = (function() {
  return this.size0$6
});
$c_scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer = (function(xs) {
  if ($is_sc_IndexedSeqLike(xs)) {
    var x2 = $as_sc_IndexedSeqLike(xs);
    var n = x2.length__I();
    var n$1 = ((this.size0$6 + n) | 0);
    $f_scm_ResizableArray__ensureSize__I__V(this, n$1);
    x2.copyToArray__O__I__I__V(this.array$6, this.size0$6, n);
    this.size0$6 = ((this.size0$6 + n) | 0);
    return this
  } else {
    return $as_scm_ArrayBuffer($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuffer.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ResizableArray__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayBuffer.prototype.sizeHint__I__V = (function(len) {
  if (((len > this.size0$6) && (len >= 1))) {
    var newarray = $newArrayObject($d_O.getArrayOf(), [len]);
    $systemArraycopy(this.array$6, 0, newarray, 0, this.size0$6);
    this.array$6 = newarray
  }
});
$c_scm_ArrayBuffer.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer(xs)
});
$c_scm_ArrayBuffer.prototype.stringPrefix__T = (function() {
  return "ArrayBuffer"
});
function $is_scm_ArrayBuffer(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuffer)))
}
function $as_scm_ArrayBuffer(obj) {
  return (($is_scm_ArrayBuffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuffer"))
}
function $isArrayOf_scm_ArrayBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuffer)))
}
function $asArrayOf_scm_ArrayBuffer(obj, depth) {
  return (($isArrayOf_scm_ArrayBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuffer;", depth))
}
var $d_scm_ArrayBuffer = new $TypeData().initClass({
  scm_ArrayBuffer: 0
}, false, "scala.collection.mutable.ArrayBuffer", {
  scm_ArrayBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1,
  scm_ResizableArray: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer.prototype.$classData = $d_scm_ArrayBuffer;
$e.CCMVR = $m_LMain$();
$e.animate = (function(arg$1) {
  var prep0 = $uD(arg$1);
  $m_LMain$().animate__D__V(prep0)
});
$e.vrdv = $m_LUtils$();
}).call(this);
//# sourceMappingURL=ccm-vr-fastopt.js.map
