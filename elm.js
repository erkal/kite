(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === elm$core$Basics$EQ ? 0 : ord === elm$core$Basics$LT ? -1 : 1;
	}));
});



// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = elm$core$Set$toList(x);
		y = elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = elm$core$Dict$toList(x);
		y = elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = elm$core$Dict$toList(x);
		y = elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (!x.$)
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? elm$core$Basics$LT : n ? elm$core$Basics$GT : elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[94m' + string + '\x1b[0m' : string;
}



// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.da.bx === region.dD.bx)
	{
		return 'on line ' + region.da.bx;
	}
	return 'on lines ' + region.da.bx + ' through ' + region.dD.bx;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return word
		? elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? elm$core$Maybe$Nothing
		: elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? elm$core$Maybe$Just(n) : elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800)
			+
			String.fromCharCode(code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

var _Json_decodeInt = { $: 2 };
var _Json_decodeBool = { $: 3 };
var _Json_decodeFloat = { $: 4 };
var _Json_decodeValue = { $: 5 };
var _Json_decodeString = { $: 6 };

function _Json_decodeList(decoder) { return { $: 7, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 8, b: decoder }; }

function _Json_decodeNull(value) { return { $: 9, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 10,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 11,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 12,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 13,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 14,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 15,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return elm$core$Result$Err(A2(elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 3:
			return (typeof value === 'boolean')
				? elm$core$Result$Ok(value)
				: _Json_expecting('a BOOL', value);

		case 2:
			if (typeof value !== 'number') {
				return _Json_expecting('an INT', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return elm$core$Result$Ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return elm$core$Result$Ok(value);
			}

			return _Json_expecting('an INT', value);

		case 4:
			return (typeof value === 'number')
				? elm$core$Result$Ok(value)
				: _Json_expecting('a FLOAT', value);

		case 6:
			return (typeof value === 'string')
				? elm$core$Result$Ok(value)
				: (value instanceof String)
					? elm$core$Result$Ok(value + '')
					: _Json_expecting('a STRING', value);

		case 9:
			return (value === null)
				? elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 5:
			return elm$core$Result$Ok(_Json_wrap(value));

		case 7:
			if (!Array.isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 8:
			if (!Array.isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 10:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return (elm$core$Result$isOk(result)) ? result : elm$core$Result$Err(A2(elm$json$Json$Decode$Field, field, result.a));

		case 11:
			var index = decoder.e;
			if (!Array.isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return (elm$core$Result$isOk(result)) ? result : elm$core$Result$Err(A2(elm$json$Json$Decode$Index, index, result.a));

		case 12:
			if (typeof value !== 'object' || value === null || Array.isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!elm$core$Result$isOk(result))
					{
						return elm$core$Result$Err(A2(elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return elm$core$Result$Ok(elm$core$List$reverse(keyValuePairs));

		case 13:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return elm$core$Result$Ok(answer);

		case 14:
			var result = _Json_runHelp(decoder.b, value);
			return (!elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 15:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if (elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return elm$core$Result$Err(elm$json$Json$Decode$OneOf(elm$core$List$reverse(errors)));

		case 1:
			return elm$core$Result$Err(A2(elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!elm$core$Result$isOk(result))
		{
			return elm$core$Result$Err(A2(elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return elm$core$Result$Ok(toElmValue(array));
}

function _Json_toElmArray(array)
{
	return A2(elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return elm$core$Result$Err(A2(elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 3:
		case 2:
		case 4:
		case 6:
		case 5:
			return true;

		case 9:
			return x.c === y.c;

		case 7:
		case 8:
		case 12:
			return _Json_equality(x.b, y.b);

		case 10:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 11:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 13:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 14:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 15:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.fe,
		impl.fW,
		impl.fK,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	result = init(result.a);
	var model = result.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		result = A2(update, msg, model);
		stepper(model = result.a, viewMetadata);
		_Platform_dispatchEffects(managers, result.b, subscriptions(model));
	}

	_Platform_dispatchEffects(managers, result.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				p: bag.n,
				q: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.q)
		{
			x = temp.p(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		r: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].r;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		r: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].r;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS


function _VirtualDom_noScript(tag)
{
	return tag == 'script' ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return /^(on|formAction$)/i.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,'')) ? '' : value;
}

function _VirtualDom_noJavaScriptUri_UNUSED(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,''))
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value) ? '' : value;
}

function _VirtualDom_noJavaScriptOrHtmlUri_UNUSED(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value)
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2(elm$json$Json$Decode$map, func, handler.a)
				:
			A3(elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		av: func(record.av),
		db: record.db,
		cY: record.cY
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		(key !== 'value' || key !== 'checked' || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		value
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		value
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.av;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.db;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.cY) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			var oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			var newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}



// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.fe,
		impl.fW,
		impl.fK,
		function(sendToApp, initialModel) {
			var view = impl.fZ;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.fe,
		impl.fW,
		impl.fK,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.bC && impl.bC(sendToApp)
			var view = impl.fZ;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.eN);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.fO) && (_VirtualDom_doc.title = title = doc.fO);
			});
		}
	);
});



// ANIMATION


var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.fr;
	var onUrlRequest = impl.fs;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		bC: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.download)
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.ec === next.ec
							&& curr.dL === next.dL
							&& curr.d8.a === next.d8.a
						)
							? elm$browser$Browser$Internal(next)
							: elm$browser$Browser$External(href)
					));
				}
			});
		},
		fe: function(flags)
		{
			return A3(impl.fe, flags, _Browser_getUrl(), key);
		},
		fZ: impl.fZ,
		fW: impl.fW,
		fK: impl.fK
	});
}

function _Browser_getUrl()
{
	return elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2(elm$core$Task$perform, elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2(elm$core$Task$perform, elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2(elm$core$Task$perform, elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return elm$core$Result$isOk(result) ? elm$core$Maybe$Just(result.a) : elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { fa: 'hidden', bm: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { fa: 'mozHidden', bm: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { fa: 'msHidden', bm: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { fa: 'webkitHidden', bm: 'webkitvisibilitychange' }
		: { fa: 'hidden', bm: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail(elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		eo: _Browser_getScene(),
		eC: {
			aS: _Browser_window.pageXOffset,
			aT: _Browser_window.pageYOffset,
			aF: _Browser_doc.documentElement.clientWidth,
			aJ: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		aF: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		aJ: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			eo: {
				aF: node.scrollWidth,
				aJ: node.scrollHeight
			},
			eC: {
				aS: node.scrollLeft,
				aT: node.scrollTop,
				aF: node.clientWidth,
				aJ: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			eo: _Browser_getScene(),
			eC: {
				aS: x,
				aT: y,
				aF: _Browser_doc.documentElement.clientWidth,
				aJ: _Browser_doc.documentElement.clientHeight
			},
			e$: {
				aS: x + rect.left,
				aT: y + rect.top,
				aF: rect.width,
				aJ: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2(elm$core$Task$perform, elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2(elm$core$Task$perform, elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});
var author$project$Main$WindowResize = function (a) {
	return {$: 2, a: a};
};
var elm$core$Basics$EQ = 1;
var elm$core$Basics$GT = 2;
var elm$core$Basics$LT = 0;
var elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3(elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var elm$core$List$cons = _List_cons;
var elm$core$Dict$toList = function (dict) {
	return A3(
		elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var elm$core$Dict$keys = function (dict) {
	return A3(
		elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2(elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var elm$core$Set$toList = function (_n0) {
	var dict = _n0;
	return elm$core$Dict$keys(dict);
};
var elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var elm$core$Array$foldr = F3(
	function (func, baseCase, _n0) {
		var tree = _n0.c;
		var tail = _n0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3(elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3(elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			elm$core$Elm$JsArray$foldr,
			helper,
			A3(elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var elm$core$Array$toList = function (array) {
	return A3(elm$core$Array$foldr, elm$core$List$cons, _List_Nil, array);
};
var elm$core$Basics$round = _Basics_round;
var author$project$Main$getWindowSize = function (viewPort) {
	return {
		aJ: elm$core$Basics$round(viewPort.eo.aJ),
		aF: elm$core$Basics$round(viewPort.eo.aF)
	};
};
var author$project$Main$Draw = function (a) {
	return {$: 1, a: a};
};
var author$project$Main$DrawIdle = {$: 0};
var author$project$Main$ListsOfBagsVerticesAndEdges = 1;
var author$project$Main$RectSelector = 0;
var author$project$Main$leftBarWidth = 300;
var author$project$Main$topBarHeight = 57;
var elm$core$Basics$add = _Basics_add;
var elm$core$Basics$negate = function (n) {
	return -n;
};
var elm$core$Basics$identity = function (x) {
	return x;
};
var ianmackenzie$elm_geometry$Geometry$Types$Point2d = elm$core$Basics$identity;
var ianmackenzie$elm_geometry$Point2d$fromCoordinates = elm$core$Basics$identity;
var author$project$Main$initialPan = ianmackenzie$elm_geometry$Point2d$fromCoordinates(
	_Utils_Tuple2(-(author$project$Main$leftBarWidth + 40), -(author$project$Main$topBarHeight + 40)));
var elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var elm$core$Basics$gt = _Utils_gt;
var elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var elm$core$List$reverse = function (list) {
	return A3(elm$core$List$foldl, elm$core$List$cons, _List_Nil, list);
};
var elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							elm$core$List$foldl,
							fn,
							acc,
							elm$core$List$reverse(r4)) : A4(elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4(elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var elm_community$graph$Graph$unGraph = function (graph) {
	var rep = graph;
	return rep;
};
var elm_community$intdict$IntDict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			switch (dict.$) {
				case 0:
					return acc;
				case 1:
					var l = dict.a;
					return A3(f, l.dS, l.ai, acc);
				default:
					var i = dict.a;
					var $temp$f = f,
						$temp$acc = A3(elm_community$intdict$IntDict$foldl, f, acc, i.g),
						$temp$dict = i.h;
					f = $temp$f;
					acc = $temp$acc;
					dict = $temp$dict;
					continue foldl;
			}
		}
	});
var elm_community$graph$Graph$edges = function (graph) {
	var flippedFoldl = F3(
		function (f, dict, list) {
			return A3(elm_community$intdict$IntDict$foldl, f, list, dict);
		});
	var prependEdges = F2(
		function (node1, ctx) {
			return A2(
				flippedFoldl,
				F2(
					function (node2, e) {
						return elm$core$List$cons(
							{aZ: node1, O: e, bg: node2});
					}),
				ctx.P);
		});
	return A3(
		flippedFoldl,
		prependEdges,
		elm_community$graph$Graph$unGraph(graph),
		_List_Nil);
};
var elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var elm_community$intdict$IntDict$foldr = F3(
	function (f, acc, dict) {
		foldr:
		while (true) {
			switch (dict.$) {
				case 0:
					return acc;
				case 1:
					var l = dict.a;
					return A3(f, l.dS, l.ai, acc);
				default:
					var i = dict.a;
					var $temp$f = f,
						$temp$acc = A3(elm_community$intdict$IntDict$foldr, f, acc, i.h),
						$temp$dict = i.g;
					f = $temp$f;
					acc = $temp$acc;
					dict = $temp$dict;
					continue foldr;
			}
		}
	});
var elm_community$intdict$IntDict$values = function (dict) {
	return A3(
		elm_community$intdict$IntDict$foldr,
		F3(
			function (key, value, valueList) {
				return A2(elm$core$List$cons, value, valueList);
			}),
		_List_Nil,
		dict);
};
var elm_community$graph$Graph$nodes = A2(
	elm$core$Basics$composeR,
	elm_community$graph$Graph$unGraph,
	A2(
		elm$core$Basics$composeR,
		elm_community$intdict$IntDict$values,
		elm$core$List$map(
			function ($) {
				return $.ax;
			})));
var gampleman$elm_visualization$Force$Center = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var gampleman$elm_visualization$Force$center = gampleman$elm_visualization$Force$Center;
var elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var elm$core$Basics$fdiv = _Basics_fdiv;
var elm$core$Basics$lt = _Utils_lt;
var elm$core$Basics$min = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) < 0) ? x : y;
	});
var elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var elm$core$Dict$empty = elm$core$Dict$RBEmpty_elm_builtin;
var elm$core$Basics$compare = _Utils_compare;
var elm$core$Maybe$Nothing = {$: 1};
var elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _n1 = A2(elm$core$Basics$compare, targetKey, key);
				switch (_n1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var elm$core$Dict$Black = 1;
var elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var elm$core$Dict$Red = 0;
var elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _n1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _n3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5(elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5(elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _n5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _n6 = left.d;
				var _n7 = _n6.a;
				var llK = _n6.b;
				var llV = _n6.c;
				var llLeft = _n6.d;
				var llRight = _n6.e;
				var lRight = left.e;
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5(elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5(elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5(elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5(elm$core$Dict$RBNode_elm_builtin, 0, key, value, elm$core$Dict$RBEmpty_elm_builtin, elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _n1 = A2(elm$core$Basics$compare, key, nKey);
			switch (_n1) {
				case 0:
					return A5(
						elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3(elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5(elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3(elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _n0 = A3(elm$core$Dict$insertHelp, key, value, dict);
		if ((_n0.$ === -1) && (!_n0.a)) {
			var _n1 = _n0.a;
			var k = _n0.b;
			var v = _n0.c;
			var l = _n0.d;
			var r = _n0.e;
			return A5(elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _n0;
			return x;
		}
	});
var elm$core$Basics$eq = _Utils_equal;
var elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _n1 = dict.d;
			var lClr = _n1.a;
			var lK = _n1.b;
			var lV = _n1.c;
			var lLeft = _n1.d;
			var lRight = _n1.e;
			var _n2 = dict.e;
			var rClr = _n2.a;
			var rK = _n2.b;
			var rV = _n2.c;
			var rLeft = _n2.d;
			var _n3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _n2.e;
			return A5(
				elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5(elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _n4 = dict.d;
			var lClr = _n4.a;
			var lK = _n4.b;
			var lV = _n4.c;
			var lLeft = _n4.d;
			var lRight = _n4.e;
			var _n5 = dict.e;
			var rClr = _n5.a;
			var rK = _n5.b;
			var rV = _n5.c;
			var rLeft = _n5.d;
			var rRight = _n5.e;
			if (clr === 1) {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _n1 = dict.d;
			var lClr = _n1.a;
			var lK = _n1.b;
			var lV = _n1.c;
			var _n2 = _n1.d;
			var _n3 = _n2.a;
			var llK = _n2.b;
			var llV = _n2.c;
			var llLeft = _n2.d;
			var llRight = _n2.e;
			var lRight = _n1.e;
			var _n4 = dict.e;
			var rClr = _n4.a;
			var rK = _n4.b;
			var rV = _n4.c;
			var rLeft = _n4.d;
			var rRight = _n4.e;
			return A5(
				elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5(elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5(elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _n5 = dict.d;
			var lClr = _n5.a;
			var lK = _n5.b;
			var lV = _n5.c;
			var lLeft = _n5.d;
			var lRight = _n5.e;
			var _n6 = dict.e;
			var rClr = _n6.a;
			var rK = _n6.b;
			var rV = _n6.c;
			var rLeft = _n6.d;
			var rRight = _n6.e;
			if (clr === 1) {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _n1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5(elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_n2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _n3 = right.a;
							var _n4 = right.d;
							var _n5 = _n4.a;
							return elm$core$Dict$moveRedRight(dict);
						} else {
							break _n2$2;
						}
					} else {
						var _n6 = right.a;
						var _n7 = right.d;
						return elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _n2$2;
				}
			}
			return dict;
		}
	});
var elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _n3 = lLeft.a;
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					elm$core$Dict$removeMin(left),
					right);
			} else {
				var _n4 = elm$core$Dict$moveRedLeft(dict);
				if (_n4.$ === -1) {
					var nColor = _n4.a;
					var nKey = _n4.b;
					var nValue = _n4.c;
					var nLeft = _n4.d;
					var nRight = _n4.e;
					return A5(
						elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _n4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _n6 = lLeft.a;
						return A5(
							elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2(elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _n7 = elm$core$Dict$moveRedLeft(dict);
						if (_n7.$ === -1) {
							var nColor = _n7.a;
							var nKey = _n7.b;
							var nValue = _n7.c;
							var nLeft = _n7.d;
							var nRight = _n7.e;
							return A5(
								elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2(elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2(elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7(elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _n1 = elm$core$Dict$getMin(right);
				if (_n1.$ === -1) {
					var minKey = _n1.b;
					var minValue = _n1.c;
					return A5(
						elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						elm$core$Dict$removeMin(right));
				} else {
					return elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2(elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var elm$core$Dict$remove = F2(
	function (key, dict) {
		var _n0 = A2(elm$core$Dict$removeHelp, key, dict);
		if ((_n0.$ === -1) && (!_n0.a)) {
			var _n1 = _n0.a;
			var k = _n0.b;
			var v = _n0.c;
			var l = _n0.d;
			var r = _n0.e;
			return A5(elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _n0;
			return x;
		}
	});
var elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _n0 = alter(
			A2(elm$core$Dict$get, targetKey, dictionary));
		if (!_n0.$) {
			var value = _n0.a;
			return A3(elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2(elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return elm$core$Maybe$Just(
				f(value));
		} else {
			return elm$core$Maybe$Nothing;
		}
	});
var elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var gampleman$elm_visualization$Force$Links = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var gampleman$elm_visualization$Force$customLinks = F2(
	function (iters, list) {
		var counts = A3(
			elm$core$List$foldr,
			F2(
				function (_n1, d) {
					var source = _n1.fI;
					var target = _n1.fN;
					return A3(
						elm$core$Dict$update,
						target,
						A2(
							elm$core$Basics$composeL,
							A2(
								elm$core$Basics$composeL,
								elm$core$Maybe$Just,
								elm$core$Maybe$withDefault(1)),
							elm$core$Maybe$map(
								elm$core$Basics$add(1))),
						A3(
							elm$core$Dict$update,
							source,
							A2(
								elm$core$Basics$composeL,
								A2(
									elm$core$Basics$composeL,
									elm$core$Maybe$Just,
									elm$core$Maybe$withDefault(1)),
								elm$core$Maybe$map(
									elm$core$Basics$add(1))),
							d));
				}),
			elm$core$Dict$empty,
			list);
		var count = function (key) {
			return A2(
				elm$core$Maybe$withDefault,
				0,
				A2(elm$core$Dict$get, key, counts));
		};
		return A2(
			gampleman$elm_visualization$Force$Links,
			iters,
			A2(
				elm$core$List$map,
				function (_n0) {
					var source = _n0.fI;
					var target = _n0.fN;
					var distance = _n0.cj;
					var strength = _n0.dc;
					return {
						cd: count(source) / (count(source) + count(target)),
						cj: distance,
						fI: source,
						dc: A2(
							elm$core$Maybe$withDefault,
							1 / A2(
								elm$core$Basics$min,
								count(source),
								count(target)),
							strength),
						fN: target
					};
				},
				list));
	});
var elm$core$Dict$fromList = function (assocs) {
	return A3(
		elm$core$List$foldl,
		F2(
			function (_n0, dict) {
				var key = _n0.a;
				var value = _n0.b;
				return A3(elm$core$Dict$insert, key, value, dict);
			}),
		elm$core$Dict$empty,
		assocs);
};
var gampleman$elm_visualization$Force$ManyBody = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var gampleman$elm_visualization$Force$customManyBody = function (theta) {
	return A2(
		elm$core$Basics$composeR,
		elm$core$Dict$fromList,
		gampleman$elm_visualization$Force$ManyBody(theta));
};
var elm$core$Basics$pow = _Basics_pow;
var elm$core$Basics$sub = _Basics_sub;
var gampleman$elm_visualization$Force$State = elm$core$Basics$identity;
var gampleman$elm_visualization$Force$simulation = function (forces) {
	return {
		aU: 1.0,
		b9: 1 - A2(elm$core$Basics$pow, 1.0e-3, 1 / 300),
		dr: 0.0,
		dI: forces,
		cG: 1.0e-3,
		bN: 0.6
	};
};
var author$project$User$simulation = function (_n0) {
	var graph = _n0.q;
	var myForces = _n0.d0;
	var fromMyForceToForce = function (myForce) {
		switch (myForce.$) {
			case 0:
				return A2(
					gampleman$elm_visualization$Force$customManyBody,
					0.9,
					A2(
						elm$core$List$map,
						function (_n2) {
							var id = _n2.a_;
							var label = _n2.O;
							return _Utils_Tuple2(id, label.dc);
						},
						elm_community$graph$Graph$nodes(graph)));
			case 1:
				var x = myForce.a.aS;
				var y = myForce.a.aT;
				return A2(gampleman$elm_visualization$Force$center, x, y);
			default:
				var fromEdgeToLinkData = function (_n3) {
					var from = _n3.aZ;
					var to = _n3.bg;
					var label = _n3.O;
					return {
						cj: label.cj,
						fI: from,
						dc: elm$core$Maybe$Just(label.dc),
						fN: to
					};
				};
				return A2(
					gampleman$elm_visualization$Force$customLinks,
					1,
					A2(
						elm$core$List$map,
						fromEdgeToLinkData,
						elm_community$graph$Graph$edges(graph)));
		}
	};
	return gampleman$elm_visualization$Force$simulation(
		A2(elm$core$List$map, fromMyForceToForce, myForces));
};
var ianmackenzie$elm_geometry$Point2d$xCoordinate = function (_n0) {
	var _n1 = _n0;
	var x = _n1.a;
	return x;
};
var ianmackenzie$elm_geometry$Point2d$yCoordinate = function (_n0) {
	var _n1 = _n0;
	var y = _n1.b;
	return y;
};
var author$project$User$toEntities = function (_n0) {
	var graph = _n0.q;
	var toEntity = function (_n1) {
		var id = _n1.a_;
		var label = _n1.O;
		return {
			a_: id,
			eD: 0,
			eE: 0,
			aS: ianmackenzie$elm_geometry$Point2d$xCoordinate(label.I),
			aT: ianmackenzie$elm_geometry$Point2d$yCoordinate(label.I)
		};
	};
	return A2(
		elm$core$List$map,
		toEntity,
		elm_community$graph$Graph$nodes(graph));
};
var elm$core$Basics$False = 1;
var elm$core$Basics$True = 0;
var elm$core$Set$Set_elm_builtin = elm$core$Basics$identity;
var elm$core$Set$empty = elm$core$Dict$empty;
var author$project$Main$initialModel = function (user) {
	return {
		ao: false,
		E: elm$core$Set$empty,
		R: elm$core$Set$empty,
		S: elm$core$Maybe$Nothing,
		b$: {aS: 0, aT: 0},
		z: author$project$Main$initialPan,
		d: elm$core$Set$empty,
		bB: 1,
		aA: 0,
		e: author$project$Main$Draw(author$project$Main$DrawIdle),
		f: elm$core$Set$empty,
		bb: false,
		bD: author$project$User$toEntities(user),
		aB: author$project$User$simulation(user),
		r: ianmackenzie$elm_geometry$Point2d$fromCoordinates(
			_Utils_Tuple2(0, 0)),
		a: user,
		aP: true,
		ad: {aJ: 600, aF: 800},
		f4: 1
	};
};
var author$project$Main$MouseMove = function (a) {
	return {$: 17, a: a};
};
var author$project$Main$MouseMoveForUpdatingSvgPos = function (a) {
	return {$: 18, a: a};
};
var author$project$Main$MouseUp = function (a) {
	return {$: 19, a: a};
};
var author$project$Main$PageVisibility = function (a) {
	return {$: 8, a: a};
};
var author$project$Main$Tick = function (a) {
	return {$: 1, a: a};
};
var author$project$Main$Character = function (a) {
	return {$: 0, a: a};
};
var author$project$Main$Control = function (a) {
	return {$: 1, a: a};
};
var elm$core$String$uncons = _String_uncons;
var author$project$Main$toKey = function (string) {
	var _n0 = elm$core$String$uncons(string);
	if ((!_n0.$) && (_n0.a.b === '')) {
		var _n1 = _n0.a;
		var c = _n1.a;
		return author$project$Main$Character(c);
	} else {
		return author$project$Main$Control(string);
	}
};
var elm$core$Array$branchFactor = 32;
var elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var elm$core$Basics$ceiling = _Basics_ceiling;
var elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var elm$core$Basics$toFloat = _Basics_toFloat;
var elm$core$Array$shiftStep = elm$core$Basics$ceiling(
	A2(elm$core$Basics$logBase, 2, elm$core$Array$branchFactor));
var elm$core$Elm$JsArray$empty = _JsArray_empty;
var elm$core$Array$empty = A4(elm$core$Array$Array_elm_builtin, 0, elm$core$Array$shiftStep, elm$core$Elm$JsArray$empty, elm$core$Elm$JsArray$empty);
var elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _n0 = A2(elm$core$Elm$JsArray$initializeFromList, elm$core$Array$branchFactor, nodes);
			var node = _n0.a;
			var remainingNodes = _n0.b;
			var newAcc = A2(
				elm$core$List$cons,
				elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var elm$core$Tuple$first = function (_n0) {
	var x = _n0.a;
	return x;
};
var elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = elm$core$Basics$ceiling(nodeListSize / elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2(elm$core$Elm$JsArray$initializeFromList, elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2(elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var elm$core$Basics$floor = _Basics_floor;
var elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var elm$core$Basics$mul = _Basics_mul;
var elm$core$Elm$JsArray$length = _JsArray_length;
var elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.s) {
			return A4(
				elm$core$Array$Array_elm_builtin,
				elm$core$Elm$JsArray$length(builder.v),
				elm$core$Array$shiftStep,
				elm$core$Elm$JsArray$empty,
				builder.v);
		} else {
			var treeLen = builder.s * elm$core$Array$branchFactor;
			var depth = elm$core$Basics$floor(
				A2(elm$core$Basics$logBase, elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? elm$core$List$reverse(builder.w) : builder.w;
			var tree = A2(elm$core$Array$treeFromBuilder, correctNodeList, builder.s);
			return A4(
				elm$core$Array$Array_elm_builtin,
				elm$core$Elm$JsArray$length(builder.v) + treeLen,
				A2(elm$core$Basics$max, 5, depth * elm$core$Array$shiftStep),
				tree,
				builder.v);
		}
	});
var elm$core$Basics$idiv = _Basics_idiv;
var elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					elm$core$Array$builderToArray,
					false,
					{w: nodeList, s: (len / elm$core$Array$branchFactor) | 0, v: tail});
			} else {
				var leaf = elm$core$Array$Leaf(
					A3(elm$core$Elm$JsArray$initialize, elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2(elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var elm$core$Basics$le = _Utils_le;
var elm$core$Basics$remainderBy = _Basics_remainderBy;
var elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return elm$core$Array$empty;
		} else {
			var tailLen = len % elm$core$Array$branchFactor;
			var tail = A3(elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - elm$core$Array$branchFactor;
			return A5(elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var elm$core$Basics$and = _Basics_and;
var elm$core$Basics$append = _Utils_append;
var elm$core$Basics$or = _Basics_or;
var elm$core$Char$toCode = _Char_toCode;
var elm$core$Char$isLower = function (_char) {
	var code = elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var elm$core$Char$isUpper = function (_char) {
	var code = elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var elm$core$Char$isAlpha = function (_char) {
	return elm$core$Char$isLower(_char) || elm$core$Char$isUpper(_char);
};
var elm$core$Char$isDigit = function (_char) {
	var code = elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var elm$core$Char$isAlphaNum = function (_char) {
	return elm$core$Char$isLower(_char) || (elm$core$Char$isUpper(_char) || elm$core$Char$isDigit(_char));
};
var elm$core$List$length = function (xs) {
	return A3(
		elm$core$List$foldl,
		F2(
			function (_n0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var elm$core$List$map2 = _List_map2;
var elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2(elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var elm$core$List$range = F2(
	function (lo, hi) {
		return A3(elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			elm$core$List$map2,
			f,
			A2(
				elm$core$List$range,
				0,
				elm$core$List$length(xs) - 1),
			xs);
	});
var elm$core$String$all = _String_all;
var elm$core$String$fromInt = _String_fromNumber;
var elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var elm$json$Json$Decode$indent = function (str) {
	return A2(
		elm$core$String$join,
		'\n    ',
		A2(elm$core$String$split, '\n', str));
};
var elm$json$Json$Encode$encode = _Json_encode;
var elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + (elm$core$String$fromInt(i + 1) + (') ' + elm$json$Json$Decode$indent(
			elm$json$Json$Decode$errorToString(error))));
	});
var elm$json$Json$Decode$errorToString = function (error) {
	return A2(elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _n1 = elm$core$String$uncons(f);
						if (_n1.$ === 1) {
							return false;
						} else {
							var _n2 = _n1.a;
							var _char = _n2.a;
							var rest = _n2.b;
							return elm$core$Char$isAlpha(_char) && A2(elm$core$String$all, elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2(elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + (elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2(elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									elm$core$String$join,
									'',
									elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										elm$core$String$join,
										'',
										elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + (elm$core$String$fromInt(
								elm$core$List$length(errors)) + ' ways:'));
							return A2(
								elm$core$String$join,
								'\n\n',
								A2(
									elm$core$List$cons,
									introduction,
									A2(elm$core$List$indexedMap, elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								elm$core$String$join,
								'',
								elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + (elm$json$Json$Decode$indent(
						A2(elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var elm$json$Json$Decode$field = _Json_decodeField;
var elm$json$Json$Decode$map = _Json_map1;
var elm$json$Json$Decode$string = _Json_decodeString;
var author$project$Main$keyDecoder = A2(
	elm$json$Json$Decode$map,
	author$project$Main$toKey,
	A2(elm$json$Json$Decode$field, 'key', elm$json$Json$Decode$string));
var author$project$Main$MousePosition = F2(
	function (x, y) {
		return {aS: x, aT: y};
	});
var elm$json$Json$Decode$int = _Json_decodeInt;
var elm$json$Json$Decode$map2 = _Json_map2;
var author$project$Main$mousePosition = A3(
	elm$json$Json$Decode$map2,
	author$project$Main$MousePosition,
	A2(elm$json$Json$Decode$field, 'clientX', elm$json$Json$Decode$int),
	A2(elm$json$Json$Decode$field, 'clientY', elm$json$Json$Decode$int));
var author$project$Main$ClickOnDrawTool = {$: 12};
var author$project$Main$ClickOnSelectTool = {$: 13};
var author$project$Main$ClickOnVader = {$: 14};
var author$project$Main$KeyDownAlt = {$: 4};
var author$project$Main$KeyDownShift = {$: 6};
var author$project$Main$NoOp = {$: 0};
var author$project$Main$toKeyDownMsg = function (key) {
	_n0$5:
	while (true) {
		if (!key.$) {
			switch (key.a) {
				case 's':
					return author$project$Main$ClickOnSelectTool;
				case 'd':
					return author$project$Main$ClickOnDrawTool;
				case 'f':
					return author$project$Main$ClickOnVader;
				default:
					break _n0$5;
			}
		} else {
			switch (key.a) {
				case 'Alt':
					return author$project$Main$KeyDownAlt;
				case 'Shift':
					return author$project$Main$KeyDownShift;
				default:
					break _n0$5;
			}
		}
	}
	return author$project$Main$NoOp;
};
var author$project$Main$KeyUpAlt = {$: 5};
var author$project$Main$KeyUpShift = {$: 7};
var author$project$Main$toKeyUpMsg = function (key) {
	_n0$2:
	while (true) {
		if (key.$ === 1) {
			switch (key.a) {
				case 'Alt':
					return author$project$Main$KeyUpAlt;
				case 'Shift':
					return author$project$Main$KeyUpShift;
				default:
					break _n0$2;
			}
		} else {
			break _n0$2;
		}
	}
	return author$project$Main$NoOp;
};
var elm$browser$Browser$AnimationManager$Time = function (a) {
	return {$: 0, a: a};
};
var elm$browser$Browser$AnimationManager$State = F3(
	function (subs, request, oldTime) {
		return {cL: oldTime, ek: request, eu: subs};
	});
var elm$core$Task$succeed = _Scheduler_succeed;
var elm$browser$Browser$AnimationManager$init = elm$core$Task$succeed(
	A3(elm$browser$Browser$AnimationManager$State, _List_Nil, elm$core$Maybe$Nothing, 0));
var elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var elm$browser$Browser$Dom$NotFound = elm$core$Basics$identity;
var elm$core$Basics$never = function (_n0) {
	never:
	while (true) {
		var nvr = _n0;
		var $temp$_n0 = nvr;
		_n0 = $temp$_n0;
		continue never;
	}
};
var elm$core$Task$Perform = elm$core$Basics$identity;
var elm$core$Task$init = elm$core$Task$succeed(0);
var elm$core$Task$andThen = _Scheduler_andThen;
var elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			elm$core$Task$andThen,
			function (a) {
				return elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			elm$core$Task$andThen,
			function (a) {
				return A2(
					elm$core$Task$andThen,
					function (b) {
						return elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var elm$core$Task$sequence = function (tasks) {
	return A3(
		elm$core$List$foldr,
		elm$core$Task$map2(elm$core$List$cons),
		elm$core$Task$succeed(_List_Nil),
		tasks);
};
var elm$core$Platform$sendToApp = _Platform_sendToApp;
var elm$core$Task$spawnCmd = F2(
	function (router, _n0) {
		var task = _n0;
		return _Scheduler_spawn(
			A2(
				elm$core$Task$andThen,
				elm$core$Platform$sendToApp(router),
				task));
	});
var elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			elm$core$Task$map,
			function (_n0) {
				return 0;
			},
			elm$core$Task$sequence(
				A2(
					elm$core$List$map,
					elm$core$Task$spawnCmd(router),
					commands)));
	});
var elm$core$Task$onSelfMsg = F3(
	function (_n0, _n1, _n2) {
		return elm$core$Task$succeed(0);
	});
var elm$core$Task$cmdMap = F2(
	function (tagger, _n0) {
		var task = _n0;
		return A2(elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager(elm$core$Task$init, elm$core$Task$onEffects, elm$core$Task$onSelfMsg, elm$core$Task$cmdMap);
var elm$core$Task$command = _Platform_leaf('Task');
var elm$core$Task$perform = F2(
	function (toMessage, task) {
		return elm$core$Task$command(
			A2(elm$core$Task$map, toMessage, task));
	});
var elm$json$Json$Decode$succeed = _Json_succeed;
var elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var elm$core$String$length = _String_length;
var elm$core$String$slice = _String_slice;
var elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			elm$core$String$slice,
			n,
			elm$core$String$length(string),
			string);
	});
var elm$core$String$startsWith = _String_startsWith;
var elm$url$Url$Http = 0;
var elm$url$Url$Https = 1;
var elm$core$String$indexes = _String_indexes;
var elm$core$String$isEmpty = function (string) {
	return string === '';
};
var elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3(elm$core$String$slice, 0, n, string);
	});
var elm$core$String$contains = _String_contains;
var elm$core$String$toInt = _String_toInt;
var elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {dJ: fragment, dL: host, d6: path, d8: port_, ec: protocol, eh: query};
	});
var elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if (elm$core$String$isEmpty(str) || A2(elm$core$String$contains, '@', str)) {
			return elm$core$Maybe$Nothing;
		} else {
			var _n0 = A2(elm$core$String$indexes, ':', str);
			if (!_n0.b) {
				return elm$core$Maybe$Just(
					A6(elm$url$Url$Url, protocol, str, elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_n0.b.b) {
					var i = _n0.a;
					var _n1 = elm$core$String$toInt(
						A2(elm$core$String$dropLeft, i + 1, str));
					if (_n1.$ === 1) {
						return elm$core$Maybe$Nothing;
					} else {
						var port_ = _n1;
						return elm$core$Maybe$Just(
							A6(
								elm$url$Url$Url,
								protocol,
								A2(elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return elm$core$Maybe$Nothing;
				}
			}
		}
	});
var elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if (elm$core$String$isEmpty(str)) {
			return elm$core$Maybe$Nothing;
		} else {
			var _n0 = A2(elm$core$String$indexes, '/', str);
			if (!_n0.b) {
				return A5(elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _n0.a;
				return A5(
					elm$url$Url$chompBeforePath,
					protocol,
					A2(elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2(elm$core$String$left, i, str));
			}
		}
	});
var elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if (elm$core$String$isEmpty(str)) {
			return elm$core$Maybe$Nothing;
		} else {
			var _n0 = A2(elm$core$String$indexes, '?', str);
			if (!_n0.b) {
				return A4(elm$url$Url$chompBeforeQuery, protocol, elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _n0.a;
				return A4(
					elm$url$Url$chompBeforeQuery,
					protocol,
					elm$core$Maybe$Just(
						A2(elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2(elm$core$String$left, i, str));
			}
		}
	});
var elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if (elm$core$String$isEmpty(str)) {
			return elm$core$Maybe$Nothing;
		} else {
			var _n0 = A2(elm$core$String$indexes, '#', str);
			if (!_n0.b) {
				return A3(elm$url$Url$chompBeforeFragment, protocol, elm$core$Maybe$Nothing, str);
			} else {
				var i = _n0.a;
				return A3(
					elm$url$Url$chompBeforeFragment,
					protocol,
					elm$core$Maybe$Just(
						A2(elm$core$String$dropLeft, i + 1, str)),
					A2(elm$core$String$left, i, str));
			}
		}
	});
var elm$url$Url$fromString = function (str) {
	return A2(elm$core$String$startsWith, 'http://', str) ? A2(
		elm$url$Url$chompAfterProtocol,
		0,
		A2(elm$core$String$dropLeft, 7, str)) : (A2(elm$core$String$startsWith, 'https://', str) ? A2(
		elm$url$Url$chompAfterProtocol,
		1,
		A2(elm$core$String$dropLeft, 8, str)) : elm$core$Maybe$Nothing);
};
var elm$browser$Browser$AnimationManager$now = _Browser_now(0);
var elm$browser$Browser$AnimationManager$rAF = _Browser_rAF(0);
var elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var elm$core$Process$kill = _Scheduler_kill;
var elm$core$Process$spawn = _Scheduler_spawn;
var elm$browser$Browser$AnimationManager$onEffects = F3(
	function (router, subs, _n0) {
		var request = _n0.ek;
		var oldTime = _n0.cL;
		var _n1 = _Utils_Tuple2(request, subs);
		if (_n1.a.$ === 1) {
			if (!_n1.b.b) {
				var _n2 = _n1.a;
				return elm$browser$Browser$AnimationManager$init;
			} else {
				var _n4 = _n1.a;
				return A2(
					elm$core$Task$andThen,
					function (pid) {
						return A2(
							elm$core$Task$andThen,
							function (time) {
								return elm$core$Task$succeed(
									A3(
										elm$browser$Browser$AnimationManager$State,
										subs,
										elm$core$Maybe$Just(pid),
										time));
							},
							elm$browser$Browser$AnimationManager$now);
					},
					elm$core$Process$spawn(
						A2(
							elm$core$Task$andThen,
							elm$core$Platform$sendToSelf(router),
							elm$browser$Browser$AnimationManager$rAF)));
			}
		} else {
			if (!_n1.b.b) {
				var pid = _n1.a.a;
				return A2(
					elm$core$Task$andThen,
					function (_n3) {
						return elm$browser$Browser$AnimationManager$init;
					},
					elm$core$Process$kill(pid));
			} else {
				return elm$core$Task$succeed(
					A3(elm$browser$Browser$AnimationManager$State, subs, request, oldTime));
			}
		}
	});
var elm$time$Time$Posix = elm$core$Basics$identity;
var elm$time$Time$millisToPosix = elm$core$Basics$identity;
var elm$browser$Browser$AnimationManager$onSelfMsg = F3(
	function (router, newTime, _n0) {
		var subs = _n0.eu;
		var oldTime = _n0.cL;
		var send = function (sub) {
			if (!sub.$) {
				var tagger = sub.a;
				return A2(
					elm$core$Platform$sendToApp,
					router,
					tagger(
						elm$time$Time$millisToPosix(newTime)));
			} else {
				var tagger = sub.a;
				return A2(
					elm$core$Platform$sendToApp,
					router,
					tagger(newTime - oldTime));
			}
		};
		return A2(
			elm$core$Task$andThen,
			function (pid) {
				return A2(
					elm$core$Task$andThen,
					function (_n1) {
						return elm$core$Task$succeed(
							A3(
								elm$browser$Browser$AnimationManager$State,
								subs,
								elm$core$Maybe$Just(pid),
								newTime));
					},
					elm$core$Task$sequence(
						A2(elm$core$List$map, send, subs)));
			},
			elm$core$Process$spawn(
				A2(
					elm$core$Task$andThen,
					elm$core$Platform$sendToSelf(router),
					elm$browser$Browser$AnimationManager$rAF)));
	});
var elm$browser$Browser$AnimationManager$Delta = function (a) {
	return {$: 1, a: a};
};
var elm$browser$Browser$AnimationManager$subMap = F2(
	function (func, sub) {
		if (!sub.$) {
			var tagger = sub.a;
			return elm$browser$Browser$AnimationManager$Time(
				A2(elm$core$Basics$composeL, func, tagger));
		} else {
			var tagger = sub.a;
			return elm$browser$Browser$AnimationManager$Delta(
				A2(elm$core$Basics$composeL, func, tagger));
		}
	});
_Platform_effectManagers['Browser.AnimationManager'] = _Platform_createManager(elm$browser$Browser$AnimationManager$init, elm$browser$Browser$AnimationManager$onEffects, elm$browser$Browser$AnimationManager$onSelfMsg, 0, elm$browser$Browser$AnimationManager$subMap);
var elm$browser$Browser$AnimationManager$subscription = _Platform_leaf('Browser.AnimationManager');
var elm$browser$Browser$AnimationManager$onAnimationFrame = function (tagger) {
	return elm$browser$Browser$AnimationManager$subscription(
		elm$browser$Browser$AnimationManager$Time(tagger));
};
var elm$browser$Browser$Events$onAnimationFrame = elm$browser$Browser$AnimationManager$onAnimationFrame;
var elm$browser$Browser$Events$Document = 0;
var elm$browser$Browser$Events$MySub = F3(
	function (a, b, c) {
		return {$: 0, a: a, b: b, c: c};
	});
var elm$browser$Browser$Events$State = F2(
	function (subs, pids) {
		return {d7: pids, eu: subs};
	});
var elm$browser$Browser$Events$init = elm$core$Task$succeed(
	A2(elm$browser$Browser$Events$State, _List_Nil, elm$core$Dict$empty));
var elm$browser$Browser$Events$nodeToKey = function (node) {
	if (!node) {
		return 'd_';
	} else {
		return 'w_';
	}
};
var elm$browser$Browser$Events$addKey = function (sub) {
	var node = sub.a;
	var name = sub.b;
	return _Utils_Tuple2(
		_Utils_ap(
			elm$browser$Browser$Events$nodeToKey(node),
			name),
		sub);
};
var elm$browser$Browser$Events$Event = F2(
	function (key, event) {
		return {dF: event, dS: key};
	});
var elm$browser$Browser$Events$spawn = F3(
	function (router, key, _n0) {
		var node = _n0.a;
		var name = _n0.b;
		var actualNode = function () {
			if (!node) {
				return _Browser_doc;
			} else {
				return _Browser_window;
			}
		}();
		return A2(
			elm$core$Task$map,
			function (value) {
				return _Utils_Tuple2(key, value);
			},
			A3(
				_Browser_on,
				actualNode,
				name,
				function (event) {
					return A2(
						elm$core$Platform$sendToSelf,
						router,
						A2(elm$browser$Browser$Events$Event, key, event));
				}));
	});
var elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3(elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _n0) {
				stepState:
				while (true) {
					var list = _n0.a;
					var result = _n0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _n2 = list.a;
						var lKey = _n2.a;
						var lValue = _n2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_n0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_n0 = $temp$_n0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _n3 = A3(
			elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _n3.a;
		var intermediateResult = _n3.b;
		return A3(
			elm$core$List$foldl,
			F2(
				function (_n4, result) {
					var k = _n4.a;
					var v = _n4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var elm$core$Dict$union = F2(
	function (t1, t2) {
		return A3(elm$core$Dict$foldl, elm$core$Dict$insert, t2, t1);
	});
var elm$browser$Browser$Events$onEffects = F3(
	function (router, subs, state) {
		var stepRight = F3(
			function (key, sub, _n6) {
				var deads = _n6.a;
				var lives = _n6.b;
				var news = _n6.c;
				return _Utils_Tuple3(
					deads,
					lives,
					A2(
						elm$core$List$cons,
						A3(elm$browser$Browser$Events$spawn, router, key, sub),
						news));
			});
		var stepLeft = F3(
			function (_n4, pid, _n5) {
				var deads = _n5.a;
				var lives = _n5.b;
				var news = _n5.c;
				return _Utils_Tuple3(
					A2(elm$core$List$cons, pid, deads),
					lives,
					news);
			});
		var stepBoth = F4(
			function (key, pid, _n2, _n3) {
				var deads = _n3.a;
				var lives = _n3.b;
				var news = _n3.c;
				return _Utils_Tuple3(
					deads,
					A3(elm$core$Dict$insert, key, pid, lives),
					news);
			});
		var newSubs = A2(elm$core$List$map, elm$browser$Browser$Events$addKey, subs);
		var _n0 = A6(
			elm$core$Dict$merge,
			stepLeft,
			stepBoth,
			stepRight,
			state.d7,
			elm$core$Dict$fromList(newSubs),
			_Utils_Tuple3(_List_Nil, elm$core$Dict$empty, _List_Nil));
		var deadPids = _n0.a;
		var livePids = _n0.b;
		var makeNewPids = _n0.c;
		return A2(
			elm$core$Task$andThen,
			function (pids) {
				return elm$core$Task$succeed(
					A2(
						elm$browser$Browser$Events$State,
						newSubs,
						A2(
							elm$core$Dict$union,
							livePids,
							elm$core$Dict$fromList(pids))));
			},
			A2(
				elm$core$Task$andThen,
				function (_n1) {
					return elm$core$Task$sequence(makeNewPids);
				},
				elm$core$Task$sequence(
					A2(elm$core$List$map, elm$core$Process$kill, deadPids))));
	});
var elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _n0 = f(mx);
		if (!_n0.$) {
			var x = _n0.a;
			return A2(elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			elm$core$List$foldr,
			elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var elm$browser$Browser$Events$onSelfMsg = F3(
	function (router, _n0, state) {
		var key = _n0.dS;
		var event = _n0.dF;
		var toMessage = function (_n2) {
			var subKey = _n2.a;
			var _n3 = _n2.b;
			var node = _n3.a;
			var name = _n3.b;
			var decoder = _n3.c;
			return _Utils_eq(subKey, key) ? A2(_Browser_decodeEvent, decoder, event) : elm$core$Maybe$Nothing;
		};
		var messages = A2(elm$core$List$filterMap, toMessage, state.eu);
		return A2(
			elm$core$Task$andThen,
			function (_n1) {
				return elm$core$Task$succeed(state);
			},
			elm$core$Task$sequence(
				A2(
					elm$core$List$map,
					elm$core$Platform$sendToApp(router),
					messages)));
	});
var elm$browser$Browser$Events$subMap = F2(
	function (func, _n0) {
		var node = _n0.a;
		var name = _n0.b;
		var decoder = _n0.c;
		return A3(
			elm$browser$Browser$Events$MySub,
			node,
			name,
			A2(elm$json$Json$Decode$map, func, decoder));
	});
_Platform_effectManagers['Browser.Events'] = _Platform_createManager(elm$browser$Browser$Events$init, elm$browser$Browser$Events$onEffects, elm$browser$Browser$Events$onSelfMsg, 0, elm$browser$Browser$Events$subMap);
var elm$browser$Browser$Events$subscription = _Platform_leaf('Browser.Events');
var elm$browser$Browser$Events$on = F3(
	function (node, name, decoder) {
		return elm$browser$Browser$Events$subscription(
			A3(elm$browser$Browser$Events$MySub, node, name, decoder));
	});
var elm$browser$Browser$Events$onKeyDown = A2(elm$browser$Browser$Events$on, 0, 'keydown');
var elm$browser$Browser$Events$onKeyUp = A2(elm$browser$Browser$Events$on, 0, 'keyup');
var elm$browser$Browser$Events$onMouseMove = A2(elm$browser$Browser$Events$on, 0, 'mousemove');
var elm$browser$Browser$Events$onMouseUp = A2(elm$browser$Browser$Events$on, 0, 'mouseup');
var elm$browser$Browser$Events$Window = 1;
var elm$browser$Browser$Events$onResize = function (func) {
	return A3(
		elm$browser$Browser$Events$on,
		1,
		'resize',
		A2(
			elm$json$Json$Decode$field,
			'target',
			A3(
				elm$json$Json$Decode$map2,
				func,
				A2(elm$json$Json$Decode$field, 'innerWidth', elm$json$Json$Decode$int),
				A2(elm$json$Json$Decode$field, 'innerHeight', elm$json$Json$Decode$int))));
};
var elm$browser$Browser$Events$Hidden = 1;
var elm$browser$Browser$Events$Visible = 0;
var elm$browser$Browser$Events$withHidden = F2(
	function (func, isHidden) {
		return func(
			isHidden ? 1 : 0);
	});
var elm$json$Json$Decode$bool = _Json_decodeBool;
var elm$browser$Browser$Events$onVisibilityChange = function (func) {
	var info = _Browser_visibilityInfo(0);
	return A3(
		elm$browser$Browser$Events$on,
		0,
		info.eQ,
		A2(
			elm$json$Json$Decode$map,
			elm$browser$Browser$Events$withHidden(func),
			A2(
				elm$json$Json$Decode$field,
				'target',
				A2(elm$json$Json$Decode$field, info.fa, elm$json$Json$Decode$bool))));
};
var elm$core$Basics$not = _Basics_not;
var elm$core$Platform$Sub$batch = _Platform_batch;
var elm$core$Platform$Sub$none = elm$core$Platform$Sub$batch(_List_Nil);
var gampleman$elm_visualization$Force$isCompleted = function (_n0) {
	var alpha = _n0.aU;
	var minAlpha = _n0.cG;
	return _Utils_cmp(alpha, minAlpha) < 1;
};
var author$project$Main$subscriptions = function (m) {
	return elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				elm$browser$Browser$Events$onResize(
				F2(
					function (w, h) {
						return author$project$Main$WindowResize(
							{aJ: h, aF: w});
					})),
				elm$browser$Browser$Events$onMouseMove(
				A2(elm$json$Json$Decode$map, author$project$Main$MouseMove, author$project$Main$mousePosition)),
				elm$browser$Browser$Events$onMouseMove(
				A2(elm$json$Json$Decode$map, author$project$Main$MouseMoveForUpdatingSvgPos, author$project$Main$mousePosition)),
				elm$browser$Browser$Events$onMouseUp(
				A2(elm$json$Json$Decode$map, author$project$Main$MouseUp, author$project$Main$mousePosition)),
				elm$browser$Browser$Events$onKeyDown(
				A2(elm$json$Json$Decode$map, author$project$Main$toKeyDownMsg, author$project$Main$keyDecoder)),
				elm$browser$Browser$Events$onKeyUp(
				A2(elm$json$Json$Decode$map, author$project$Main$toKeyUpMsg, author$project$Main$keyDecoder)),
				elm$browser$Browser$Events$onVisibilityChange(author$project$Main$PageVisibility),
				(gampleman$elm_visualization$Force$isCompleted(m.aB) || (!m.aP)) ? elm$core$Platform$Sub$none : elm$browser$Browser$Events$onAnimationFrame(author$project$Main$Tick)
			]));
};
var author$project$Main$BrushingForSelection = function (a) {
	return {$: 1, a: a};
};
var author$project$Main$BrushingNewEdgeWithSourceId = function (a) {
	return {$: 1, a: a};
};
var author$project$Main$DraggingSelection = function (a) {
	return {$: 2, a: a};
};
var author$project$Main$Hand = function (a) {
	return {$: 0, a: a};
};
var author$project$Main$HandIdle = {$: 0};
var author$project$Main$LineSelector = 1;
var author$project$Main$Panning = function (a) {
	return {$: 1, a: a};
};
var author$project$Main$Select = function (a) {
	return {$: 2, a: a};
};
var author$project$Main$SelectIdle = {$: 0};
var author$project$Main$restartSimulationIfVaderIsOn = function (m) {
	return m.aP ? _Utils_update(
		m,
		{
			bD: author$project$User$toEntities(m.a),
			aB: author$project$User$simulation(m.a)
		}) : m;
};
var elm$core$Basics$always = F2(
	function (a, _n0) {
		return a;
	});
var elm_community$graph$Graph$Graph = elm$core$Basics$identity;
var elm_community$intdict$IntDict$Empty = {$: 0};
var elm_community$intdict$IntDict$empty = elm_community$intdict$IntDict$Empty;
var elm_community$intdict$IntDict$Inner = function (a) {
	return {$: 2, a: a};
};
var elm_community$intdict$IntDict$size = function (dict) {
	switch (dict.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		default:
			var i = dict.a;
			return i.c3;
	}
};
var elm_community$intdict$IntDict$inner = F3(
	function (p, l, r) {
		var _n0 = _Utils_Tuple2(l, r);
		if (!_n0.a.$) {
			var _n1 = _n0.a;
			return r;
		} else {
			if (!_n0.b.$) {
				var _n2 = _n0.b;
				return l;
			} else {
				return elm_community$intdict$IntDict$Inner(
					{
						g: l,
						k: p,
						h: r,
						c3: elm_community$intdict$IntDict$size(l) + elm_community$intdict$IntDict$size(r)
					});
			}
		}
	});
var elm$core$Basics$neq = _Utils_notEqual;
var elm$core$Bitwise$and = _Bitwise_and;
var elm$core$Bitwise$xor = _Bitwise_xor;
var elm$core$Bitwise$complement = _Bitwise_complement;
var elm$core$Bitwise$or = _Bitwise_or;
var elm$core$Bitwise$shiftRightZfBy = _Bitwise_shiftRightZfBy;
var elm_community$intdict$IntDict$highestBitSet = function (n) {
	var shiftOr = F2(
		function (i, shift) {
			return i | (i >>> shift);
		});
	var n1 = A2(shiftOr, n, 1);
	var n2 = A2(shiftOr, n1, 2);
	var n3 = A2(shiftOr, n2, 4);
	var n4 = A2(shiftOr, n3, 8);
	var n5 = A2(shiftOr, n4, 16);
	return n5 & (~(n5 >>> 1));
};
var elm_community$intdict$IntDict$signBit = elm_community$intdict$IntDict$highestBitSet(-1);
var elm_community$intdict$IntDict$isBranchingBitSet = function (p) {
	return A2(
		elm$core$Basics$composeR,
		elm$core$Bitwise$xor(elm_community$intdict$IntDict$signBit),
		A2(
			elm$core$Basics$composeR,
			elm$core$Bitwise$and(p.aV),
			elm$core$Basics$neq(0)));
};
var elm_community$intdict$IntDict$higherBitMask = function (branchingBit) {
	return branchingBit ^ (~(branchingBit - 1));
};
var elm_community$intdict$IntDict$lcp = F2(
	function (x, y) {
		var branchingBit = elm_community$intdict$IntDict$highestBitSet(x ^ y);
		var mask = elm_community$intdict$IntDict$higherBitMask(branchingBit);
		var prefixBits = x & mask;
		return {aV: branchingBit, ab: prefixBits};
	});
var elm_community$intdict$IntDict$Leaf = function (a) {
	return {$: 1, a: a};
};
var elm_community$intdict$IntDict$leaf = F2(
	function (k, v) {
		return elm_community$intdict$IntDict$Leaf(
			{dS: k, ai: v});
	});
var elm_community$intdict$IntDict$prefixMatches = F2(
	function (p, n) {
		return _Utils_eq(
			n & elm_community$intdict$IntDict$higherBitMask(p.aV),
			p.ab);
	});
var elm_community$intdict$IntDict$update = F3(
	function (key, alter, dict) {
		var join = F2(
			function (_n2, _n3) {
				var k1 = _n2.a;
				var l = _n2.b;
				var k2 = _n3.a;
				var r = _n3.b;
				var prefix = A2(elm_community$intdict$IntDict$lcp, k1, k2);
				return A2(elm_community$intdict$IntDict$isBranchingBitSet, prefix, k2) ? A3(elm_community$intdict$IntDict$inner, prefix, l, r) : A3(elm_community$intdict$IntDict$inner, prefix, r, l);
			});
		var alteredNode = function (mv) {
			var _n1 = alter(mv);
			if (!_n1.$) {
				var v = _n1.a;
				return A2(elm_community$intdict$IntDict$leaf, key, v);
			} else {
				return elm_community$intdict$IntDict$empty;
			}
		};
		switch (dict.$) {
			case 0:
				return alteredNode(elm$core$Maybe$Nothing);
			case 1:
				var l = dict.a;
				return _Utils_eq(l.dS, key) ? alteredNode(
					elm$core$Maybe$Just(l.ai)) : A2(
					join,
					_Utils_Tuple2(
						key,
						alteredNode(elm$core$Maybe$Nothing)),
					_Utils_Tuple2(l.dS, dict));
			default:
				var i = dict.a;
				return A2(elm_community$intdict$IntDict$prefixMatches, i.k, key) ? (A2(elm_community$intdict$IntDict$isBranchingBitSet, i.k, key) ? A3(
					elm_community$intdict$IntDict$inner,
					i.k,
					i.g,
					A3(elm_community$intdict$IntDict$update, key, alter, i.h)) : A3(
					elm_community$intdict$IntDict$inner,
					i.k,
					A3(elm_community$intdict$IntDict$update, key, alter, i.g),
					i.h)) : A2(
					join,
					_Utils_Tuple2(
						key,
						alteredNode(elm$core$Maybe$Nothing)),
					_Utils_Tuple2(i.k.ab, dict));
		}
	});
var elm_community$graph$Graph$applyEdgeDiff = F3(
	function (nodeId, diff, graphRep) {
		var updateOutgoingEdge = F2(
			function (upd, node) {
				return _Utils_update(
					node,
					{
						P: A3(elm_community$intdict$IntDict$update, nodeId, upd, node.P)
					});
			});
		var updateIncomingEdge = F2(
			function (upd, node) {
				return _Utils_update(
					node,
					{
						N: A3(elm_community$intdict$IntDict$update, nodeId, upd, node.N)
					});
			});
		var flippedFoldl = F3(
			function (f, dict, acc) {
				return A3(elm_community$intdict$IntDict$foldl, f, acc, dict);
			});
		var edgeUpdateToMaybe = function (edgeUpdate) {
			if (!edgeUpdate.$) {
				var lbl = edgeUpdate.a;
				return elm$core$Maybe$Just(lbl);
			} else {
				return elm$core$Maybe$Nothing;
			}
		};
		var updateAdjacency = F3(
			function (updateEdge, updatedId, edgeUpdate) {
				var updateLbl = updateEdge(
					elm$core$Basics$always(
						edgeUpdateToMaybe(edgeUpdate)));
				return A2(
					elm_community$intdict$IntDict$update,
					updatedId,
					elm$core$Maybe$map(updateLbl));
			});
		return A3(
			flippedFoldl,
			updateAdjacency(updateOutgoingEdge),
			diff.P,
			A3(
				flippedFoldl,
				updateAdjacency(updateIncomingEdge),
				diff.N,
				graphRep));
	});
var elm_community$graph$Graph$Insert = function (a) {
	return {$: 0, a: a};
};
var elm_community$graph$Graph$Remove = function (a) {
	return {$: 1, a: a};
};
var elm_community$graph$Graph$crashHack = function (msg) {
	crashHack:
	while (true) {
		var $temp$msg = msg;
		msg = $temp$msg;
		continue crashHack;
	}
};
var elm_community$graph$Graph$emptyDiff = {N: elm_community$intdict$IntDict$empty, P: elm_community$intdict$IntDict$empty};
var elm_community$graph$Graph$computeEdgeDiff = F2(
	function (old, _new) {
		var collectUpdates = F3(
			function (edgeUpdate, updatedId, label) {
				var replaceUpdate = function (old_) {
					var _n5 = _Utils_Tuple2(
						old_,
						edgeUpdate(label));
					if (!_n5.a.$) {
						if (_n5.a.a.$ === 1) {
							if (!_n5.b.$) {
								var oldLbl = _n5.a.a.a;
								var newLbl = _n5.b.a;
								return _Utils_eq(oldLbl, newLbl) ? elm$core$Maybe$Nothing : elm$core$Maybe$Just(
									elm_community$graph$Graph$Insert(newLbl));
							} else {
								return elm_community$graph$Graph$crashHack('Graph.computeEdgeDiff: Collected two removals for the same edge. This is an error in the implementation of Graph and you should file a bug report!');
							}
						} else {
							return elm_community$graph$Graph$crashHack('Graph.computeEdgeDiff: Collected inserts before removals. This is an error in the implementation of Graph and you should file a bug report!');
						}
					} else {
						var _n6 = _n5.a;
						var eu = _n5.b;
						return elm$core$Maybe$Just(eu);
					}
				};
				return A2(elm_community$intdict$IntDict$update, updatedId, replaceUpdate);
			});
		var collect = F3(
			function (edgeUpdate, adj, updates) {
				return A3(
					elm_community$intdict$IntDict$foldl,
					collectUpdates(edgeUpdate),
					updates,
					adj);
			});
		var _n0 = _Utils_Tuple2(old, _new);
		if (_n0.a.$ === 1) {
			if (_n0.b.$ === 1) {
				var _n1 = _n0.a;
				var _n2 = _n0.b;
				return elm_community$graph$Graph$emptyDiff;
			} else {
				var _n4 = _n0.a;
				var ins = _n0.b.a;
				return {
					N: A3(collect, elm_community$graph$Graph$Insert, ins.P, elm_community$intdict$IntDict$empty),
					P: A3(collect, elm_community$graph$Graph$Insert, ins.N, elm_community$intdict$IntDict$empty)
				};
			}
		} else {
			if (_n0.b.$ === 1) {
				var rem = _n0.a.a;
				var _n3 = _n0.b;
				return {
					N: A3(collect, elm_community$graph$Graph$Remove, rem.P, elm_community$intdict$IntDict$empty),
					P: A3(collect, elm_community$graph$Graph$Remove, rem.N, elm_community$intdict$IntDict$empty)
				};
			} else {
				var rem = _n0.a.a;
				var ins = _n0.b.a;
				return _Utils_eq(rem, ins) ? elm_community$graph$Graph$emptyDiff : {
					N: A3(
						collect,
						elm_community$graph$Graph$Insert,
						ins.P,
						A3(collect, elm_community$graph$Graph$Remove, rem.P, elm_community$intdict$IntDict$empty)),
					P: A3(
						collect,
						elm_community$graph$Graph$Insert,
						ins.N,
						A3(collect, elm_community$graph$Graph$Remove, rem.N, elm_community$intdict$IntDict$empty))
				};
			}
		}
	});
var elm_community$intdict$IntDict$insert = F3(
	function (key, value, dict) {
		return A3(
			elm_community$intdict$IntDict$update,
			key,
			elm$core$Basics$always(
				elm$core$Maybe$Just(value)),
			dict);
	});
var elm_community$intdict$IntDict$filter = F2(
	function (predicate, dict) {
		var add = F3(
			function (k, v, d) {
				return A2(predicate, k, v) ? A3(elm_community$intdict$IntDict$insert, k, v, d) : d;
			});
		return A3(elm_community$intdict$IntDict$foldl, add, elm_community$intdict$IntDict$empty, dict);
	});
var elm_community$intdict$IntDict$get = F2(
	function (key, dict) {
		get:
		while (true) {
			switch (dict.$) {
				case 0:
					return elm$core$Maybe$Nothing;
				case 1:
					var l = dict.a;
					return _Utils_eq(l.dS, key) ? elm$core$Maybe$Just(l.ai) : elm$core$Maybe$Nothing;
				default:
					var i = dict.a;
					if (!A2(elm_community$intdict$IntDict$prefixMatches, i.k, key)) {
						return elm$core$Maybe$Nothing;
					} else {
						if (A2(elm_community$intdict$IntDict$isBranchingBitSet, i.k, key)) {
							var $temp$key = key,
								$temp$dict = i.h;
							key = $temp$key;
							dict = $temp$dict;
							continue get;
						} else {
							var $temp$key = key,
								$temp$dict = i.g;
							key = $temp$key;
							dict = $temp$dict;
							continue get;
						}
					}
			}
		}
	});
var elm_community$intdict$IntDict$member = F2(
	function (key, dict) {
		var _n0 = A2(elm_community$intdict$IntDict$get, key, dict);
		if (!_n0.$) {
			return true;
		} else {
			return false;
		}
	});
var elm_community$graph$Graph$update = F2(
	function (nodeId, updater) {
		var wrappedUpdater = function (rep) {
			var old = A2(elm_community$intdict$IntDict$get, nodeId, rep);
			var filterInvalidEdges = function (ctx) {
				return elm_community$intdict$IntDict$filter(
					F2(
						function (id, _n0) {
							return _Utils_eq(id, ctx.ax.a_) || A2(elm_community$intdict$IntDict$member, id, rep);
						}));
			};
			var cleanUpEdges = function (ctx) {
				return _Utils_update(
					ctx,
					{
						N: A2(filterInvalidEdges, ctx, ctx.N),
						P: A2(filterInvalidEdges, ctx, ctx.P)
					});
			};
			var _new = A2(
				elm$core$Maybe$map,
				cleanUpEdges,
				updater(old));
			var diff = A2(elm_community$graph$Graph$computeEdgeDiff, old, _new);
			return A3(
				elm_community$intdict$IntDict$update,
				nodeId,
				elm$core$Basics$always(_new),
				A3(elm_community$graph$Graph$applyEdgeDiff, nodeId, diff, rep));
		};
		return A2(
			elm$core$Basics$composeR,
			elm_community$graph$Graph$unGraph,
			A2(elm$core$Basics$composeR, wrappedUpdater, elm$core$Basics$identity));
	});
var author$project$Graph$Extra$updateNodesBy = F3(
	function (l, upBy, graph) {
		var ctxUpdater = F2(
			function (upData, ctx) {
				var node = ctx.ax;
				return _Utils_update(
					ctx,
					{
						ax: _Utils_update(
							node,
							{
								O: A2(upBy, upData, node.O)
							})
					});
			});
		var updateNodeProperties = F2(
			function (_n0, acc) {
				var id = _n0.a;
				var upData = _n0.b;
				return A3(
					elm_community$graph$Graph$update,
					id,
					elm$core$Maybe$map(
						ctxUpdater(upData)),
					acc);
			});
		return A3(elm$core$List$foldr, updateNodeProperties, graph, l);
	});
var author$project$User$getBags = function (_n0) {
	var bags = _n0.aq;
	return bags;
};
var author$project$User$User = elm$core$Basics$identity;
var author$project$User$mapBags = F2(
	function (f, _n0) {
		var p = _n0;
		return _Utils_update(
			p,
			{
				aq: f(p.aq)
			});
	});
var author$project$User$mapGraph = F2(
	function (f, _n0) {
		var p = _n0;
		return _Utils_update(
			p,
			{
				q: f(p.q)
			});
	});
var elm$core$List$maximum = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return elm$core$Maybe$Just(
			A3(elm$core$List$foldl, elm$core$Basics$max, x, xs));
	} else {
		return elm$core$Maybe$Nothing;
	}
};
var elm$core$Set$insert = F2(
	function (key, _n0) {
		var dict = _n0;
		return A3(elm$core$Dict$insert, key, 0, dict);
	});
var author$project$User$addBag = F2(
	function (vs, user) {
		var p = user;
		var l = A2(
			elm$core$List$map,
			function (id) {
				return _Utils_Tuple2(id, 0);
			},
			elm$core$Set$toList(vs));
		var idOfTheNewBag = 1 + A2(
			elm$core$Maybe$withDefault,
			0,
			elm$core$List$maximum(
				elm$core$Dict$keys(
					author$project$User$getBags(user))));
		var insertToBag = F2(
			function (_n0, vP) {
				return _Utils_update(
					vP,
					{
						at: A2(elm$core$Set$insert, idOfTheNewBag, vP.at)
					});
			});
		return _Utils_Tuple2(
			A2(
				author$project$User$mapBags,
				A2(elm$core$Dict$insert, idOfTheNewBag, p.bn),
				A2(
					author$project$User$mapGraph,
					A2(author$project$Graph$Extra$updateNodesBy, l, insertToBag),
					user)),
			idOfTheNewBag);
	});
var author$project$Graph$Extra$insertEdge = F3(
	function (_n0, e, graph) {
		var sourceId = _n0.a;
		var targetId = _n0.b;
		var insertTarget = function (ctx) {
			var outgoing = ctx.P;
			return _Utils_update(
				ctx,
				{
					P: A3(elm_community$intdict$IntDict$insert, targetId, e, ctx.P)
				});
		};
		var insertSource = function (ctx) {
			var incoming = ctx.N;
			return _Utils_update(
				ctx,
				{
					N: A3(elm_community$intdict$IntDict$insert, sourceId, e, ctx.N)
				});
		};
		return A3(
			elm_community$graph$Graph$update,
			targetId,
			elm$core$Maybe$map(insertSource),
			A3(
				elm_community$graph$Graph$update,
				sourceId,
				elm$core$Maybe$map(insertTarget),
				graph));
	});
var author$project$User$addEdge = F2(
	function (edgeId, user) {
		var p = user;
		return A2(
			author$project$User$mapGraph,
			A2(author$project$Graph$Extra$insertEdge, edgeId, p.bo),
			user);
	});
var elm$core$Tuple$second = function (_n0) {
	var y = _n0.b;
	return y;
};
var elm_community$graph$Graph$insert = F2(
	function (nodeContext, graph) {
		return A3(
			elm_community$graph$Graph$update,
			nodeContext.ax.a_,
			elm$core$Basics$always(
				elm$core$Maybe$Just(nodeContext)),
			graph);
	});
var elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (!maybeValue.$) {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return elm$core$Maybe$Nothing;
		}
	});
var elm_community$intdict$IntDict$findMax = function (dict) {
	findMax:
	while (true) {
		switch (dict.$) {
			case 0:
				return elm$core$Maybe$Nothing;
			case 1:
				var l = dict.a;
				return elm$core$Maybe$Just(
					_Utils_Tuple2(l.dS, l.ai));
			default:
				var i = dict.a;
				var $temp$dict = i.h;
				dict = $temp$dict;
				continue findMax;
		}
	}
};
var elm_community$intdict$IntDict$findMin = function (dict) {
	findMin:
	while (true) {
		switch (dict.$) {
			case 0:
				return elm$core$Maybe$Nothing;
			case 1:
				var l = dict.a;
				return elm$core$Maybe$Just(
					_Utils_Tuple2(l.dS, l.ai));
			default:
				var i = dict.a;
				var $temp$dict = i.g;
				dict = $temp$dict;
				continue findMin;
		}
	}
};
var elm_community$graph$Graph$nodeIdRange = function (graph) {
	return A2(
		elm$core$Maybe$andThen,
		function (_n0) {
			var min = _n0.a;
			return A2(
				elm$core$Maybe$andThen,
				function (_n1) {
					var max = _n1.a;
					return elm$core$Maybe$Just(
						_Utils_Tuple2(min, max));
				},
				elm_community$intdict$IntDict$findMax(
					elm_community$graph$Graph$unGraph(graph)));
		},
		elm_community$intdict$IntDict$findMin(
			elm_community$graph$Graph$unGraph(graph)));
};
var author$project$Graph$Extra$insertNode = F2(
	function (n, graph) {
		var newId = 1 + A2(
			elm$core$Maybe$withDefault,
			0,
			A2(
				elm$core$Maybe$map,
				elm$core$Tuple$second,
				elm_community$graph$Graph$nodeIdRange(graph)));
		var newGraph = A2(
			elm_community$graph$Graph$insert,
			{
				N: elm_community$intdict$IntDict$empty,
				ax: {a_: newId, O: n},
				P: elm_community$intdict$IntDict$empty
			},
			graph);
		return _Utils_Tuple2(newGraph, newId);
	});
var author$project$User$addVertex = F2(
	function (coordinates, _n0) {
		var p = _n0;
		var defaultVertexProperties = p.aW;
		var propertiesOfTheNewVertex = _Utils_update(
			defaultVertexProperties,
			{I: coordinates});
		var _n1 = A2(author$project$Graph$Extra$insertNode, propertiesOfTheNewVertex, p.q);
		var newMyGraph = _n1.a;
		var newId = _n1.b;
		return _Utils_Tuple2(
			_Utils_update(
				p,
				{q: newMyGraph}),
			newId);
	});
var elm_community$graph$Graph$get = function (nodeId) {
	return A2(
		elm$core$Basics$composeR,
		elm_community$graph$Graph$unGraph,
		elm_community$intdict$IntDict$get(nodeId));
};
var author$project$User$getVertexProperties = F2(
	function (vertexId, _n0) {
		var graph = _n0.q;
		return A2(
			elm$core$Maybe$map,
			A2(
				elm$core$Basics$composeR,
				function ($) {
					return $.ax;
				},
				function ($) {
					return $.O;
				}),
			A2(elm_community$graph$Graph$get, vertexId, graph));
	});
var ianmackenzie$elm_geometry$Point2d$coordinates = function (_n0) {
	var coordinates_ = _n0;
	return coordinates_;
};
var ianmackenzie$elm_geometry$Point2d$origin = ianmackenzie$elm_geometry$Point2d$fromCoordinates(
	_Utils_Tuple2(0, 0));
var author$project$User$bringBackIfFixed = function (user) {
	return elm$core$List$map(
		function (ent) {
			var id = ent.a_;
			var maybeVP = A2(author$project$User$getVertexProperties, id, user);
			var _n0 = ianmackenzie$elm_geometry$Point2d$coordinates(
				A2(
					elm$core$Maybe$withDefault,
					ianmackenzie$elm_geometry$Point2d$origin,
					A2(
						elm$core$Maybe$map,
						function ($) {
							return $.I;
						},
						maybeVP)));
			var x = _n0.a;
			var y = _n0.b;
			return _Utils_eq(
				A2(
					elm$core$Maybe$map,
					function ($) {
						return $.bT;
					},
					maybeVP),
				elm$core$Maybe$Just(true)) ? _Utils_update(
				ent,
				{eD: 0, eE: 0, aS: x, aT: y}) : ent;
		});
};
var elm_community$graph$Graph$remove = F2(
	function (nodeId, graph) {
		return A3(
			elm_community$graph$Graph$update,
			nodeId,
			elm$core$Basics$always(elm$core$Maybe$Nothing),
			graph);
	});
var elm_community$intdict$IntDict$Disjunct = F2(
	function (a, b) {
		return {$: 2, a: a, b: b};
	});
var elm_community$intdict$IntDict$Left = 0;
var elm_community$intdict$IntDict$Parent = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var elm_community$intdict$IntDict$Right = 1;
var elm_community$intdict$IntDict$SamePrefix = {$: 0};
var elm_community$intdict$IntDict$combineBits = F3(
	function (a, b, mask) {
		return (a & (~mask)) | (b & mask);
	});
var elm_community$intdict$IntDict$mostSignificantBranchingBit = F2(
	function (a, b) {
		return (_Utils_eq(a, elm_community$intdict$IntDict$signBit) || _Utils_eq(b, elm_community$intdict$IntDict$signBit)) ? elm_community$intdict$IntDict$signBit : A2(elm$core$Basics$max, a, b);
	});
var elm_community$intdict$IntDict$determineBranchRelation = F2(
	function (l, r) {
		var rp = r.k;
		var lp = l.k;
		var mask = elm_community$intdict$IntDict$highestBitSet(
			A2(elm_community$intdict$IntDict$mostSignificantBranchingBit, lp.aV, rp.aV));
		var modifiedRightPrefix = A3(elm_community$intdict$IntDict$combineBits, rp.ab, ~lp.ab, mask);
		var prefix = A2(elm_community$intdict$IntDict$lcp, lp.ab, modifiedRightPrefix);
		var childEdge = F2(
			function (branchPrefix, c) {
				return A2(elm_community$intdict$IntDict$isBranchingBitSet, branchPrefix, c.k.ab) ? 1 : 0;
			});
		return _Utils_eq(lp, rp) ? elm_community$intdict$IntDict$SamePrefix : (_Utils_eq(prefix, lp) ? A2(
			elm_community$intdict$IntDict$Parent,
			0,
			A2(childEdge, l.k, r)) : (_Utils_eq(prefix, rp) ? A2(
			elm_community$intdict$IntDict$Parent,
			1,
			A2(childEdge, r.k, l)) : A2(
			elm_community$intdict$IntDict$Disjunct,
			prefix,
			A2(childEdge, prefix, l))));
	});
var elm_community$intdict$IntDict$uniteWith = F3(
	function (merger, l, r) {
		var mergeWith = F3(
			function (key, left, right) {
				var _n14 = _Utils_Tuple2(left, right);
				if (!_n14.a.$) {
					if (!_n14.b.$) {
						var l2 = _n14.a.a;
						var r2 = _n14.b.a;
						return elm$core$Maybe$Just(
							A3(merger, key, l2, r2));
					} else {
						return left;
					}
				} else {
					if (!_n14.b.$) {
						return right;
					} else {
						var _n15 = _n14.a;
						var _n16 = _n14.b;
						return elm$core$Maybe$Nothing;
					}
				}
			});
		var _n0 = _Utils_Tuple2(l, r);
		_n0$1:
		while (true) {
			_n0$2:
			while (true) {
				switch (_n0.a.$) {
					case 0:
						var _n1 = _n0.a;
						return r;
					case 1:
						switch (_n0.b.$) {
							case 0:
								break _n0$1;
							case 1:
								break _n0$2;
							default:
								break _n0$2;
						}
					default:
						switch (_n0.b.$) {
							case 0:
								break _n0$1;
							case 1:
								var r2 = _n0.b.a;
								return A3(
									elm_community$intdict$IntDict$update,
									r2.dS,
									function (l_) {
										return A3(
											mergeWith,
											r2.dS,
											l_,
											elm$core$Maybe$Just(r2.ai));
									},
									l);
							default:
								var il = _n0.a.a;
								var ir = _n0.b.a;
								var _n3 = A2(elm_community$intdict$IntDict$determineBranchRelation, il, ir);
								switch (_n3.$) {
									case 0:
										return A3(
											elm_community$intdict$IntDict$inner,
											il.k,
											A3(elm_community$intdict$IntDict$uniteWith, merger, il.g, ir.g),
											A3(elm_community$intdict$IntDict$uniteWith, merger, il.h, ir.h));
									case 1:
										if (!_n3.a) {
											if (_n3.b === 1) {
												var _n4 = _n3.a;
												var _n5 = _n3.b;
												return A3(
													elm_community$intdict$IntDict$inner,
													il.k,
													il.g,
													A3(elm_community$intdict$IntDict$uniteWith, merger, il.h, r));
											} else {
												var _n8 = _n3.a;
												var _n9 = _n3.b;
												return A3(
													elm_community$intdict$IntDict$inner,
													il.k,
													A3(elm_community$intdict$IntDict$uniteWith, merger, il.g, r),
													il.h);
											}
										} else {
											if (_n3.b === 1) {
												var _n6 = _n3.a;
												var _n7 = _n3.b;
												return A3(
													elm_community$intdict$IntDict$inner,
													ir.k,
													ir.g,
													A3(elm_community$intdict$IntDict$uniteWith, merger, l, ir.h));
											} else {
												var _n10 = _n3.a;
												var _n11 = _n3.b;
												return A3(
													elm_community$intdict$IntDict$inner,
													ir.k,
													A3(elm_community$intdict$IntDict$uniteWith, merger, l, ir.g),
													ir.h);
											}
										}
									default:
										if (!_n3.b) {
											var parentPrefix = _n3.a;
											var _n12 = _n3.b;
											return A3(elm_community$intdict$IntDict$inner, parentPrefix, l, r);
										} else {
											var parentPrefix = _n3.a;
											var _n13 = _n3.b;
											return A3(elm_community$intdict$IntDict$inner, parentPrefix, r, l);
										}
								}
						}
				}
			}
			var l2 = _n0.a.a;
			return A3(
				elm_community$intdict$IntDict$update,
				l2.dS,
				function (r_) {
					return A3(
						mergeWith,
						l2.dS,
						elm$core$Maybe$Just(l2.ai),
						r_);
				},
				r);
		}
		var _n2 = _n0.b;
		return l;
	});
var elm_community$intdict$IntDict$union = elm_community$intdict$IntDict$uniteWith(
	F3(
		function (key, old, _new) {
			return old;
		}));
var author$project$Graph$Extra$contractEdge = F3(
	function (_n0, label, graph) {
		var sourceId = _n0.a;
		var targetId = _n0.b;
		var newId = 1 + A2(
			elm$core$Maybe$withDefault,
			0,
			A2(
				elm$core$Maybe$map,
				elm$core$Tuple$second,
				elm_community$graph$Graph$nodeIdRange(graph)));
		var newNode = {
			N: A2(
				elm_community$intdict$IntDict$union,
				A2(
					elm$core$Maybe$withDefault,
					elm_community$intdict$IntDict$empty,
					A2(
						elm$core$Maybe$map,
						function ($) {
							return $.N;
						},
						A2(elm_community$graph$Graph$get, sourceId, graph))),
				A2(
					elm$core$Maybe$withDefault,
					elm_community$intdict$IntDict$empty,
					A2(
						elm$core$Maybe$map,
						function ($) {
							return $.N;
						},
						A2(elm_community$graph$Graph$get, targetId, graph)))),
			ax: {a_: newId, O: label},
			P: A2(
				elm_community$intdict$IntDict$union,
				A2(
					elm$core$Maybe$withDefault,
					elm_community$intdict$IntDict$empty,
					A2(
						elm$core$Maybe$map,
						function ($) {
							return $.P;
						},
						A2(elm_community$graph$Graph$get, sourceId, graph))),
				A2(
					elm$core$Maybe$withDefault,
					elm_community$intdict$IntDict$empty,
					A2(
						elm$core$Maybe$map,
						function ($) {
							return $.P;
						},
						A2(elm_community$graph$Graph$get, targetId, graph))))
		};
		return _Utils_Tuple2(
			A2(
				elm_community$graph$Graph$insert,
				newNode,
				A2(
					elm_community$graph$Graph$remove,
					targetId,
					A2(elm_community$graph$Graph$remove, sourceId, graph))),
			newId);
	});
var ianmackenzie$elm_geometry$Geometry$Types$LineSegment2d = elm$core$Basics$identity;
var ianmackenzie$elm_geometry$LineSegment2d$fromEndpoints = elm$core$Basics$identity;
var ianmackenzie$elm_geometry$LineSegment2d$from = F2(
	function (startPoint_, endPoint_) {
		return ianmackenzie$elm_geometry$LineSegment2d$fromEndpoints(
			_Utils_Tuple2(startPoint_, endPoint_));
	});
var author$project$User$lineSegmentOf = F2(
	function (_n0, user) {
		var from = _n0.a;
		var to = _n0.b;
		var getPosition = function (vertexId) {
			return A2(
				elm$core$Maybe$map,
				function ($) {
					return $.I;
				},
				A2(author$project$User$getVertexProperties, vertexId, user));
		};
		var _n1 = _Utils_Tuple2(
			getPosition(from),
			getPosition(to));
		if ((!_n1.a.$) && (!_n1.b.$)) {
			var p = _n1.a.a;
			var q = _n1.b.a;
			return A2(ianmackenzie$elm_geometry$LineSegment2d$from, p, q);
		} else {
			return A2(ianmackenzie$elm_geometry$LineSegment2d$from, ianmackenzie$elm_geometry$Point2d$origin, ianmackenzie$elm_geometry$Point2d$origin);
		}
	});
var ianmackenzie$elm_geometry$LineSegment2d$endpoints = function (_n0) {
	var endpoints_ = _n0;
	return endpoints_;
};
var ianmackenzie$elm_float_extra$Float$Extra$interpolateFrom = F3(
	function (start, end, parameter) {
		return (parameter <= 0.5) ? (start + (parameter * (end - start))) : (end + ((1 - parameter) * (start - end)));
	});
var ianmackenzie$elm_geometry$Point2d$interpolateFrom = F3(
	function (p1, p2, t) {
		var _n0 = ianmackenzie$elm_geometry$Point2d$coordinates(p2);
		var x2 = _n0.a;
		var y2 = _n0.b;
		var _n1 = ianmackenzie$elm_geometry$Point2d$coordinates(p1);
		var x1 = _n1.a;
		var y1 = _n1.b;
		return ianmackenzie$elm_geometry$Point2d$fromCoordinates(
			_Utils_Tuple2(
				A3(ianmackenzie$elm_float_extra$Float$Extra$interpolateFrom, x1, x2, t),
				A3(ianmackenzie$elm_float_extra$Float$Extra$interpolateFrom, y1, y2, t)));
	});
var ianmackenzie$elm_geometry$LineSegment2d$interpolate = function (lineSegment) {
	var _n0 = ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment);
	var start = _n0.a;
	var end = _n0.b;
	return A2(ianmackenzie$elm_geometry$Point2d$interpolateFrom, start, end);
};
var ianmackenzie$elm_geometry$LineSegment2d$midpoint = function (lineSegment) {
	return A2(ianmackenzie$elm_geometry$LineSegment2d$interpolate, lineSegment, 0.5);
};
var author$project$User$contractEdge = F2(
	function (edgeId, user) {
		var p = user;
		var midPoint = ianmackenzie$elm_geometry$LineSegment2d$midpoint(
			A2(author$project$User$lineSegmentOf, edgeId, user));
		var setPos = function (ctx) {
			var node = ctx.ax;
			var label = node.O;
			return _Utils_update(
				ctx,
				{
					ax: _Utils_update(
						node,
						{
							O: _Utils_update(
								label,
								{I: midPoint})
						})
				});
		};
		var _n0 = A3(author$project$Graph$Extra$contractEdge, edgeId, p.aW, p.q);
		var newGraph_ = _n0.a;
		var newId = _n0.b;
		var newGraph = A3(
			elm_community$graph$Graph$update,
			newId,
			elm$core$Maybe$map(setPos),
			newGraph_);
		return _Utils_update(
			p,
			{q: newGraph});
	});
var elm_community$intdict$IntDict$remove = F2(
	function (key, dict) {
		return A3(
			elm_community$intdict$IntDict$update,
			key,
			elm$core$Basics$always(elm$core$Maybe$Nothing),
			dict);
	});
var author$project$Graph$Extra$removeEdge = F2(
	function (_n0, graph) {
		var sourceId = _n0.a;
		var targetId = _n0.b;
		var removeFromTarget = function (ctx) {
			var incoming = ctx.N;
			return _Utils_update(
				ctx,
				{
					N: A2(elm_community$intdict$IntDict$remove, sourceId, ctx.N)
				});
		};
		var removeFromSource = function (ctx) {
			var outgoing = ctx.P;
			return _Utils_update(
				ctx,
				{
					P: A2(elm_community$intdict$IntDict$remove, targetId, ctx.P)
				});
		};
		return A3(
			elm_community$graph$Graph$update,
			targetId,
			elm$core$Maybe$map(removeFromTarget),
			A3(
				elm_community$graph$Graph$update,
				sourceId,
				elm$core$Maybe$map(removeFromSource),
				graph));
	});
var author$project$User$removeEdge = function (edgeId) {
	return author$project$User$mapGraph(
		author$project$Graph$Extra$removeEdge(edgeId));
};
var author$project$User$divideEdge = F3(
	function (coordinates, _n0, user) {
		var s = _n0.a;
		var t = _n0.b;
		var _n1 = A2(author$project$User$addVertex, coordinates, user);
		var user_ = _n1.a;
		var newId = _n1.b;
		return _Utils_Tuple2(
			A2(
				author$project$User$removeEdge,
				_Utils_Tuple2(s, t),
				A2(
					author$project$User$addEdge,
					_Utils_Tuple2(newId, t),
					A2(
						author$project$User$addEdge,
						_Utils_Tuple2(s, newId),
						user_))),
			newId);
	});
var elm_community$graph$Graph$NodeContext = F3(
	function (node, incoming, outgoing) {
		return {N: incoming, ax: node, P: outgoing};
	});
var elm_community$graph$Graph$fromNodesAndEdges = F2(
	function (nodes_, edges_) {
		var nodeRep = A3(
			elm$core$List$foldl,
			function (n) {
				return A2(
					elm_community$intdict$IntDict$insert,
					n.a_,
					A3(elm_community$graph$Graph$NodeContext, n, elm_community$intdict$IntDict$empty, elm_community$intdict$IntDict$empty));
			},
			elm_community$intdict$IntDict$empty,
			nodes_);
		var addEdge = F2(
			function (edge, rep) {
				var updateOutgoing = function (ctx) {
					return _Utils_update(
						ctx,
						{
							P: A3(elm_community$intdict$IntDict$insert, edge.bg, edge.O, ctx.P)
						});
				};
				var updateIncoming = function (ctx) {
					return _Utils_update(
						ctx,
						{
							N: A3(elm_community$intdict$IntDict$insert, edge.aZ, edge.O, ctx.N)
						});
				};
				return A3(
					elm_community$intdict$IntDict$update,
					edge.bg,
					elm$core$Maybe$map(updateIncoming),
					A3(
						elm_community$intdict$IntDict$update,
						edge.aZ,
						elm$core$Maybe$map(updateOutgoing),
						rep));
			});
		var addEdgeIfValid = F2(
			function (edge, rep) {
				return (A2(elm_community$intdict$IntDict$member, edge.aZ, rep) && A2(elm_community$intdict$IntDict$member, edge.bg, rep)) ? A2(addEdge, edge, rep) : rep;
			});
		return A3(elm$core$List$foldl, addEdgeIfValid, nodeRep, edges_);
	});
var elm_community$graph$Graph$empty = elm_community$intdict$IntDict$empty;
var elm_community$graph$Graph$fold = F3(
	function (f, acc, graph) {
		var go = F2(
			function (acc1, graph1) {
				go:
				while (true) {
					var maybeContext = A2(
						elm$core$Maybe$andThen,
						function (id) {
							return A2(elm_community$graph$Graph$get, id, graph);
						},
						A2(
							elm$core$Maybe$map,
							elm$core$Tuple$first,
							elm_community$graph$Graph$nodeIdRange(graph1)));
					if (!maybeContext.$) {
						var ctx = maybeContext.a;
						var $temp$acc1 = A2(f, ctx, acc1),
							$temp$graph1 = A2(elm_community$graph$Graph$remove, ctx.ax.a_, graph1);
						acc1 = $temp$acc1;
						graph1 = $temp$graph1;
						continue go;
					} else {
						return acc1;
					}
				}
			});
		return A2(go, acc, graph);
	});
var elm_community$graph$Graph$mapContexts = function (f) {
	return A2(
		elm_community$graph$Graph$fold,
		function (ctx) {
			return elm_community$graph$Graph$insert(
				f(ctx));
		},
		elm_community$graph$Graph$empty);
};
var elm_community$intdict$IntDict$keys = function (dict) {
	return A3(
		elm_community$intdict$IntDict$foldr,
		F3(
			function (key, value, keyList) {
				return A2(elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var elm_community$graph$Graph$nodeIds = A2(elm$core$Basics$composeR, elm_community$graph$Graph$unGraph, elm_community$intdict$IntDict$keys);
var elm_community$intdict$IntDict$fromList = function (pairs) {
	return A3(
		elm$core$List$foldl,
		function (_n0) {
			var a = _n0.a;
			var b = _n0.b;
			return A2(elm_community$intdict$IntDict$insert, a, b);
		},
		elm_community$intdict$IntDict$empty,
		pairs);
};
var elm_community$intdict$IntDict$toList = function (dict) {
	return A3(
		elm_community$intdict$IntDict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var author$project$Graph$Extra$disjointUnion = F2(
	function (g, h) {
		var _n0 = _Utils_Tuple2(
			A2(
				elm$core$Maybe$withDefault,
				0,
				A2(
					elm$core$Maybe$map,
					elm$core$Tuple$second,
					elm_community$graph$Graph$nodeIdRange(h))),
			A2(
				elm$core$Maybe$withDefault,
				0,
				A2(
					elm$core$Maybe$map,
					elm$core$Tuple$first,
					elm_community$graph$Graph$nodeIdRange(g))));
		var maxH = _n0.a;
		var minG = _n0.b;
		var delta = (maxH - minG) + 1;
		var shiftForAdjacency = A2(
			elm$core$Basics$composeR,
			elm_community$intdict$IntDict$toList,
			A2(
				elm$core$Basics$composeR,
				elm$core$List$map(
					function (_n3) {
						var id = _n3.a;
						var e = _n3.b;
						return _Utils_Tuple2(id + delta, e);
					}),
				elm_community$intdict$IntDict$fromList));
		var shift = function (_n2) {
			var node = _n2.ax;
			var incoming = _n2.N;
			var outgoing = _n2.P;
			return {
				N: shiftForAdjacency(incoming),
				ax: _Utils_update(
					node,
					{a_: node.a_ + delta}),
				P: shiftForAdjacency(outgoing)
			};
		};
		var gShifted = A2(elm_community$graph$Graph$mapContexts, shift, g);
		return {
			dC: A2(
				elm$core$List$map,
				function (_n1) {
					var from = _n1.aZ;
					var to = _n1.bg;
					return _Utils_Tuple2(from, to);
				},
				elm_community$graph$Graph$edges(gShifted)),
			ez: A2(
				elm_community$graph$Graph$fromNodesAndEdges,
				_Utils_ap(
					elm_community$graph$Graph$nodes(gShifted),
					elm_community$graph$Graph$nodes(h)),
				_Utils_ap(
					elm_community$graph$Graph$edges(gShifted),
					elm_community$graph$Graph$edges(h))),
			eB: elm_community$graph$Graph$nodeIds(gShifted)
		};
	});
var elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2(elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var elm$core$Dict$member = F2(
	function (key, dict) {
		var _n0 = A2(elm$core$Dict$get, key, dict);
		if (!_n0.$) {
			return true;
		} else {
			return false;
		}
	});
var elm$core$Set$member = F2(
	function (key, _n0) {
		var dict = _n0;
		return A2(elm$core$Dict$member, key, dict);
	});
var author$project$Graph$Extra$duplicateSubgraph = F3(
	function (vs, es, graph) {
		var subgraph = A2(
			elm_community$graph$Graph$fromNodesAndEdges,
			A2(
				elm$core$List$filter,
				function (_n1) {
					var id = _n1.a_;
					return A2(elm$core$Set$member, id, vs);
				},
				elm_community$graph$Graph$nodes(graph)),
			A2(
				elm$core$List$filter,
				function (_n2) {
					var from = _n2.aZ;
					var to = _n2.bg;
					return A2(
						elm$core$Set$member,
						_Utils_Tuple2(from, to),
						es);
				},
				elm_community$graph$Graph$edges(graph)));
		var _n0 = A2(author$project$Graph$Extra$disjointUnion, subgraph, graph);
		var union = _n0.ez;
		var verticesOfTheFirstGraphShifted = _n0.eB;
		var edgesOfTheFirstGraphShifted = _n0.dC;
		return _Utils_Tuple3(union, verticesOfTheFirstGraphShifted, edgesOfTheFirstGraphShifted);
	});
var elm$core$Set$fromList = function (list) {
	return A3(elm$core$List$foldl, elm$core$Set$insert, elm$core$Set$empty, list);
};
var author$project$User$duplicateSubgraph = F3(
	function (vs, es, user) {
		var p = user;
		var _n0 = A3(author$project$Graph$Extra$duplicateSubgraph, vs, es, p.q);
		var newGraph = _n0.a;
		var nvs = _n0.b;
		var nes = _n0.c;
		return _Utils_Tuple3(
			_Utils_update(
				p,
				{q: newGraph}),
			elm$core$Set$fromList(nvs),
			elm$core$Set$fromList(nes));
	});
var ianmackenzie$elm_geometry$Bootstrap$Point2d$coordinates = function (_n0) {
	var coordinates_ = _n0;
	return coordinates_;
};
var ianmackenzie$elm_geometry$Geometry$Types$Vector2d = elm$core$Basics$identity;
var ianmackenzie$elm_geometry$Vector2d$fromComponents = elm$core$Basics$identity;
var ianmackenzie$elm_geometry$Vector2d$from = F2(
	function (firstPoint, secondPoint) {
		var _n0 = ianmackenzie$elm_geometry$Bootstrap$Point2d$coordinates(secondPoint);
		var x2 = _n0.a;
		var y2 = _n0.b;
		var _n1 = ianmackenzie$elm_geometry$Bootstrap$Point2d$coordinates(firstPoint);
		var x1 = _n1.a;
		var y1 = _n1.b;
		return ianmackenzie$elm_geometry$Vector2d$fromComponents(
			_Utils_Tuple2(x2 - x1, y2 - y1));
	});
var ianmackenzie$elm_geometry$LineSegment2d$vector = function (lineSegment) {
	var _n0 = ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment);
	var p1 = _n0.a;
	var p2 = _n0.b;
	return A2(ianmackenzie$elm_geometry$Vector2d$from, p1, p2);
};
var ianmackenzie$elm_geometry$Vector2d$components = function (_n0) {
	var components_ = _n0;
	return components_;
};
var ianmackenzie$elm_geometry$Vector2d$crossProduct = F2(
	function (firstVector, secondVector) {
		var _n0 = ianmackenzie$elm_geometry$Vector2d$components(secondVector);
		var x2 = _n0.a;
		var y2 = _n0.b;
		var _n1 = ianmackenzie$elm_geometry$Vector2d$components(firstVector);
		var x1 = _n1.a;
		var y1 = _n1.b;
		return (x1 * y2) - (y1 * x2);
	});
var ianmackenzie$elm_geometry$Vector2d$dotProduct = F2(
	function (firstVector, secondVector) {
		var _n0 = ianmackenzie$elm_geometry$Vector2d$components(secondVector);
		var x2 = _n0.a;
		var y2 = _n0.b;
		var _n1 = ianmackenzie$elm_geometry$Vector2d$components(firstVector);
		var x1 = _n1.a;
		var y1 = _n1.b;
		return (x1 * x2) + (y1 * y2);
	});
var ianmackenzie$elm_geometry$LineSegment2d$intersectionPoint = F2(
	function (lineSegment1, lineSegment2) {
		var s = ianmackenzie$elm_geometry$LineSegment2d$vector(lineSegment2);
		var r = ianmackenzie$elm_geometry$LineSegment2d$vector(lineSegment1);
		var _n0 = ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment2);
		var q = _n0.a;
		var q_ = _n0.b;
		var _n1 = ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment1);
		var p = _n1.a;
		var p_ = _n1.b;
		var pq = A2(ianmackenzie$elm_geometry$Vector2d$from, p, q);
		var pqXr = A2(ianmackenzie$elm_geometry$Vector2d$crossProduct, pq, r);
		var pqXs = A2(ianmackenzie$elm_geometry$Vector2d$crossProduct, pq, s);
		var pq_ = A2(ianmackenzie$elm_geometry$Vector2d$from, p, q_);
		var rXpq_ = A2(ianmackenzie$elm_geometry$Vector2d$crossProduct, r, pq_);
		var uDenominator = pqXr + rXpq_;
		var qp_ = A2(ianmackenzie$elm_geometry$Vector2d$from, q, p_);
		var sXqp_ = A2(ianmackenzie$elm_geometry$Vector2d$crossProduct, s, qp_);
		var tDenominator = pqXs - sXqp_;
		if ((!tDenominator) || (!uDenominator)) {
			return (A2(ianmackenzie$elm_geometry$Vector2d$dotProduct, r, s) < 0) ? (_Utils_eq(p_, q_) ? elm$core$Maybe$Just(p_) : (_Utils_eq(p, q) ? elm$core$Maybe$Just(p) : elm$core$Maybe$Nothing)) : (_Utils_eq(p_, q) ? elm$core$Maybe$Just(p_) : (_Utils_eq(p, q_) ? elm$core$Maybe$Just(p) : elm$core$Maybe$Nothing));
		} else {
			var u = pqXr / uDenominator;
			var t = pqXs / tDenominator;
			if (((0 <= t) && (t <= 1)) && ((0 <= u) && (u <= 1))) {
				var intersection = (_Utils_cmp(
					A2(elm$core$Basics$min, t, 1 - t),
					A2(elm$core$Basics$min, u, 1 - u)) < 1) ? A2(ianmackenzie$elm_geometry$LineSegment2d$interpolate, lineSegment1, t) : A2(ianmackenzie$elm_geometry$LineSegment2d$interpolate, lineSegment2, u);
				return elm$core$Maybe$Just(intersection);
			} else {
				return elm$core$Maybe$Nothing;
			}
		}
	});
var author$project$User$edgeIdsIntersectiongLineSegment = F2(
	function (lS, user) {
		var graph = user.q;
		var intersects = F2(
			function (l1, l2) {
				var _n2 = A2(ianmackenzie$elm_geometry$LineSegment2d$intersectionPoint, l1, l2);
				if (!_n2.$) {
					return true;
				} else {
					return false;
				}
			});
		return elm$core$Set$fromList(
			A2(
				elm$core$List$map,
				function (_n1) {
					var from = _n1.aZ;
					var to = _n1.bg;
					return _Utils_Tuple2(from, to);
				},
				A2(
					elm$core$List$filter,
					function (_n0) {
						var from = _n0.aZ;
						var to = _n0.bg;
						return A2(
							intersects,
							lS,
							A2(
								author$project$User$lineSegmentOf,
								_Utils_Tuple2(from, to),
								user));
					},
					elm_community$graph$Graph$edges(graph))));
	});
var author$project$User$getVertexIdsWithPositions = F2(
	function (s, _n0) {
		var graph = _n0.q;
		return elm_community$intdict$IntDict$fromList(
			A2(
				elm$core$List$map,
				function (_n2) {
					var id = _n2.a_;
					var label = _n2.O;
					return _Utils_Tuple2(id, label.I);
				},
				A2(
					elm$core$List$filter,
					function (_n1) {
						var id = _n1.a_;
						return A2(elm$core$Set$member, id, s);
					},
					elm_community$graph$Graph$nodes(graph))));
	});
var author$project$User$getVerticesInBag = F2(
	function (bagId, _n0) {
		var graph = _n0.q;
		var takeIfBagIdIsInBags = function (_n1) {
			var id = _n1.a_;
			var label = _n1.O;
			return A2(elm$core$Set$member, bagId, label.at) ? elm$core$Maybe$Just(id) : elm$core$Maybe$Nothing;
		};
		return elm$core$Set$fromList(
			A2(
				elm$core$List$filterMap,
				takeIfBagIdIsInBags,
				elm_community$graph$Graph$nodes(graph)));
	});
var author$project$Graph$Extra$inducedEdges = F2(
	function (vs, graph) {
		return elm$core$Set$fromList(
			A2(
				elm$core$List$map,
				function (_n1) {
					var from = _n1.aZ;
					var to = _n1.bg;
					return _Utils_Tuple2(from, to);
				},
				A2(
					elm$core$List$filter,
					function (_n0) {
						var from = _n0.aZ;
						var to = _n0.bg;
						var label = _n0.O;
						return A2(elm$core$Set$member, from, vs) && A2(elm$core$Set$member, to, vs);
					},
					elm_community$graph$Graph$edges(graph))));
	});
var author$project$User$inducedEdges = F2(
	function (vs, _n0) {
		var graph = _n0.q;
		return A2(author$project$Graph$Extra$inducedEdges, vs, graph);
	});
var elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3(elm$core$List$foldr, elm$core$List$cons, ys, xs);
		}
	});
var elm$core$List$concat = function (lists) {
	return A3(elm$core$List$foldr, elm$core$List$append, _List_Nil, lists);
};
var elm$core$List$concatMap = F2(
	function (f, list) {
		return elm$core$List$concat(
			A2(elm$core$List$map, f, list));
	});
var author$project$Graph$Extra$inducedNodes = A2(
	elm$core$Basics$composeR,
	elm$core$Set$toList,
	A2(
		elm$core$Basics$composeR,
		elm$core$List$concatMap(
			function (_n0) {
				var s = _n0.a;
				var t = _n0.b;
				return _List_fromArray(
					[s, t]);
			}),
		elm$core$Set$fromList));
var author$project$User$inducedVertices = author$project$Graph$Extra$inducedNodes;
var elm$core$Set$remove = F2(
	function (key, _n0) {
		var dict = _n0;
		return A2(elm$core$Dict$remove, key, dict);
	});
var elm_community$graph$Graph$mapNodes = function (f) {
	return A2(
		elm_community$graph$Graph$fold,
		function (_n0) {
			var node = _n0.ax;
			var incoming = _n0.N;
			var outgoing = _n0.P;
			return elm_community$graph$Graph$insert(
				{
					N: incoming,
					ax: {
						a_: node.a_,
						O: f(node.O)
					},
					P: outgoing
				});
		},
		elm_community$graph$Graph$empty);
};
var author$project$User$removeBag = F2(
	function (bagId, user) {
		var removeFromBag = function (vP) {
			return _Utils_update(
				vP,
				{
					at: A2(elm$core$Set$remove, bagId, vP.at)
				});
		};
		return A2(
			author$project$User$mapBags,
			elm$core$Dict$remove(bagId),
			A2(
				author$project$User$mapGraph,
				elm_community$graph$Graph$mapNodes(removeFromBag),
				user));
	});
var elm$core$Set$foldr = F3(
	function (func, initialState, _n0) {
		var dict = _n0;
		return A3(
			elm$core$Dict$foldr,
			F3(
				function (key, _n1, state) {
					return A2(func, key, state);
				}),
			initialState,
			dict);
	});
var author$project$User$removeEdges = F2(
	function (s, user) {
		return A3(elm$core$Set$foldr, author$project$User$removeEdge, user, s);
	});
var author$project$User$removeVertices = F2(
	function (l, _n0) {
		var p = _n0;
		var rem = F2(
			function (vertexId, acc) {
				return A2(elm_community$graph$Graph$remove, vertexId, acc);
			});
		return _Utils_update(
			p,
			{
				q: A3(elm$core$Set$foldr, rem, p.q, l)
			});
	});
var ianmackenzie$elm_geometry$Point2d$centroidHelp = F6(
	function (x0, y0, count, dx, dy, points) {
		centroidHelp:
		while (true) {
			if (points.b) {
				var point = points.a;
				var remaining = points.b;
				var _n1 = ianmackenzie$elm_geometry$Point2d$coordinates(point);
				var x = _n1.a;
				var y = _n1.b;
				var newDx = dx + (x - x0);
				var newDy = dy + (y - y0);
				var $temp$x0 = x0,
					$temp$y0 = y0,
					$temp$count = count + 1,
					$temp$dx = newDx,
					$temp$dy = newDy,
					$temp$points = remaining;
				x0 = $temp$x0;
				y0 = $temp$y0;
				count = $temp$count;
				dx = $temp$dx;
				dy = $temp$dy;
				points = $temp$points;
				continue centroidHelp;
			} else {
				return ianmackenzie$elm_geometry$Point2d$fromCoordinates(
					_Utils_Tuple2(x0 + (dx / count), y0 + (dy / count)));
			}
		}
	});
var ianmackenzie$elm_geometry$Point2d$centroid = function (points) {
	if (!points.b) {
		return elm$core$Maybe$Nothing;
	} else {
		var first = points.a;
		var rest = points.b;
		var _n1 = ianmackenzie$elm_geometry$Point2d$coordinates(first);
		var x0 = _n1.a;
		var y0 = _n1.b;
		return elm$core$Maybe$Just(
			A6(ianmackenzie$elm_geometry$Point2d$centroidHelp, x0, y0, 1, 0, 0, rest));
	}
};
var author$project$User$getCentroid = F2(
	function (vs, _n0) {
		var graph = _n0.q;
		return ianmackenzie$elm_geometry$Point2d$centroid(
			A2(
				elm$core$List$filterMap,
				function (_n1) {
					var id = _n1.a_;
					var label = _n1.O;
					return A2(elm$core$Set$member, id, vs) ? elm$core$Maybe$Just(label.I) : elm$core$Maybe$Nothing;
				},
				elm_community$graph$Graph$nodes(graph)));
	});
var author$project$Graph$Extra$updateNodes = F3(
	function (nodeSetToUpdate, up, graph) {
		var up_ = function (ctx) {
			var node = ctx.ax;
			return _Utils_update(
				ctx,
				{
					ax: _Utils_update(
						node,
						{
							O: up(node.O)
						})
				});
		};
		return A3(
			elm$core$Set$foldr,
			function (id) {
				return A2(
					elm_community$graph$Graph$update,
					id,
					elm$core$Maybe$map(up_));
			},
			graph,
			nodeSetToUpdate);
	});
var author$project$User$updateVertices = F2(
	function (vs, up) {
		return author$project$User$mapGraph(
			A2(author$project$Graph$Extra$updateNodes, vs, up));
	});
var ianmackenzie$elm_geometry$Point2d$translateBy = F2(
	function (vector, point) {
		var _n0 = ianmackenzie$elm_geometry$Vector2d$components(vector);
		var vx = _n0.a;
		var vy = _n0.b;
		var _n1 = ianmackenzie$elm_geometry$Point2d$coordinates(point);
		var px = _n1.a;
		var py = _n1.b;
		return ianmackenzie$elm_geometry$Point2d$fromCoordinates(
			_Utils_Tuple2(px + vx, py + vy));
	});
var author$project$User$setCentroidX = F3(
	function (vs, newCentroidX, user) {
		var oldCentroidX = A2(
			elm$core$Maybe$withDefault,
			0,
			A2(
				elm$core$Maybe$map,
				ianmackenzie$elm_geometry$Point2d$xCoordinate,
				A2(author$project$User$getCentroid, vs, user)));
		var shift = ianmackenzie$elm_geometry$Vector2d$fromComponents(
			_Utils_Tuple2(newCentroidX - oldCentroidX, 0));
		return A3(
			author$project$User$updateVertices,
			vs,
			function (vP) {
				return _Utils_update(
					vP,
					{
						I: A2(ianmackenzie$elm_geometry$Point2d$translateBy, shift, vP.I)
					});
			},
			user);
	});
var author$project$User$setCentroidY = F3(
	function (vs, newCentroidY, user) {
		var oldCentroidY = A2(
			elm$core$Maybe$withDefault,
			0,
			A2(
				elm$core$Maybe$map,
				ianmackenzie$elm_geometry$Point2d$yCoordinate,
				A2(author$project$User$getCentroid, vs, user)));
		var shift = ianmackenzie$elm_geometry$Vector2d$fromComponents(
			_Utils_Tuple2(0, newCentroidY - oldCentroidY));
		return A3(
			author$project$User$updateVertices,
			vs,
			function (vP) {
				return _Utils_update(
					vP,
					{
						I: A2(ianmackenzie$elm_geometry$Point2d$translateBy, shift, vP.I)
					});
			},
			user);
	});
var author$project$User$setVertexPositions = function (l) {
	return author$project$User$mapGraph(
		A2(
			author$project$Graph$Extra$updateNodesBy,
			l,
			F2(
				function (pos, vP) {
					return _Utils_update(
						vP,
						{I: pos});
				})));
};
var author$project$User$updateBag = F3(
	function (bagId, up, _n0) {
		var p = _n0;
		return _Utils_update(
			p,
			{
				aq: A3(
					elm$core$Dict$update,
					bagId,
					elm$core$Maybe$map(up),
					p.aq)
			});
	});
var author$project$User$updateByEntities = function (l) {
	return author$project$User$mapGraph(
		A2(
			author$project$Graph$Extra$updateNodesBy,
			A2(
				elm$core$List$map,
				function (_n0) {
					var id = _n0.a_;
					var x = _n0.aS;
					var y = _n0.aT;
					return _Utils_Tuple2(
						id,
						ianmackenzie$elm_geometry$Point2d$fromCoordinates(
							_Utils_Tuple2(x, y)));
				},
				l),
			F2(
				function (pos, vP) {
					return _Utils_update(
						vP,
						{I: pos});
				})));
};
var author$project$User$updateDefaultBag = F2(
	function (up, _n0) {
		var p = _n0;
		return _Utils_update(
			p,
			{
				bn: up(p.bn)
			});
	});
var author$project$User$updateDefaultEdgeProperties = F2(
	function (up, _n0) {
		var p = _n0;
		return _Utils_update(
			p,
			{
				bo: up(p.bo)
			});
	});
var author$project$User$updateDefaultVertexProperties = F2(
	function (up, _n0) {
		var p = _n0;
		return _Utils_update(
			p,
			{
				aW: up(p.aW)
			});
	});
var author$project$Graph$Extra$updateEdges = F3(
	function (edgeSetToUpdate, up, graph) {
		var newEdges = A2(
			elm$core$List$map,
			function (edge) {
				var from = edge.aZ;
				var to = edge.bg;
				var label = edge.O;
				return A2(
					elm$core$Set$member,
					_Utils_Tuple2(from, to),
					edgeSetToUpdate) ? _Utils_update(
					edge,
					{
						O: up(edge.O)
					}) : edge;
			},
			elm_community$graph$Graph$edges(graph));
		return A2(
			elm_community$graph$Graph$fromNodesAndEdges,
			elm_community$graph$Graph$nodes(graph),
			newEdges);
	});
var author$project$User$updateEdges = F2(
	function (es, up) {
		return author$project$User$mapGraph(
			A2(author$project$Graph$Extra$updateEdges, es, up));
	});
var elm$core$Basics$ge = _Utils_ge;
var ianmackenzie$elm_geometry$BoundingBox2d$maxX = function (_n0) {
	var boundingBox = _n0;
	return boundingBox.a1;
};
var ianmackenzie$elm_geometry$BoundingBox2d$maxY = function (_n0) {
	var boundingBox = _n0;
	return boundingBox.a2;
};
var ianmackenzie$elm_geometry$BoundingBox2d$minX = function (_n0) {
	var boundingBox = _n0;
	return boundingBox.a3;
};
var ianmackenzie$elm_geometry$BoundingBox2d$minY = function (_n0) {
	var boundingBox = _n0;
	return boundingBox.a4;
};
var ianmackenzie$elm_geometry$BoundingBox2d$intersects = F2(
	function (other, boundingBox) {
		return (_Utils_cmp(
			ianmackenzie$elm_geometry$BoundingBox2d$minX(boundingBox),
			ianmackenzie$elm_geometry$BoundingBox2d$maxX(other)) < 1) && ((_Utils_cmp(
			ianmackenzie$elm_geometry$BoundingBox2d$maxX(boundingBox),
			ianmackenzie$elm_geometry$BoundingBox2d$minX(other)) > -1) && ((_Utils_cmp(
			ianmackenzie$elm_geometry$BoundingBox2d$minY(boundingBox),
			ianmackenzie$elm_geometry$BoundingBox2d$maxY(other)) < 1) && (_Utils_cmp(
			ianmackenzie$elm_geometry$BoundingBox2d$maxY(boundingBox),
			ianmackenzie$elm_geometry$BoundingBox2d$minY(other)) > -1)));
	});
var ianmackenzie$elm_geometry$Geometry$Types$BoundingBox2d = elm$core$Basics$identity;
var ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema = function (extrema_) {
	return ((_Utils_cmp(extrema_.a3, extrema_.a1) < 1) && (_Utils_cmp(extrema_.a4, extrema_.a2) < 1)) ? extrema_ : {
		a1: A2(elm$core$Basics$max, extrema_.a3, extrema_.a1),
		a2: A2(elm$core$Basics$max, extrema_.a4, extrema_.a2),
		a3: A2(elm$core$Basics$min, extrema_.a3, extrema_.a1),
		a4: A2(elm$core$Basics$min, extrema_.a4, extrema_.a2)
	};
};
var ianmackenzie$elm_geometry$Circle2d$centerPoint = function (_n0) {
	var properties = _n0;
	return properties.eP;
};
var ianmackenzie$elm_geometry$Circle2d$radius = function (_n0) {
	var properties = _n0;
	return properties.a8;
};
var ianmackenzie$elm_geometry$Circle2d$boundingBox = function (circle) {
	var r = ianmackenzie$elm_geometry$Circle2d$radius(circle);
	var _n0 = ianmackenzie$elm_geometry$Point2d$coordinates(
		ianmackenzie$elm_geometry$Circle2d$centerPoint(circle));
	var x = _n0.a;
	var y = _n0.b;
	return ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema(
		{a1: x + r, a2: y + r, a3: x - r, a4: y - r});
};
var elm$core$Basics$abs = function (n) {
	return (n < 0) ? (-n) : n;
};
var ianmackenzie$elm_geometry$Geometry$Types$Circle2d = elm$core$Basics$identity;
var ianmackenzie$elm_geometry$Circle2d$withRadius = F2(
	function (radius_, centerPoint_) {
		return {
			eP: centerPoint_,
			a8: elm$core$Basics$abs(radius_)
		};
	});
var author$project$User$vertexIdsInBoundingBox = F2(
	function (bB, _n0) {
		var graph = _n0.q;
		var vertexBB = function (vertexProperties) {
			return ianmackenzie$elm_geometry$Circle2d$boundingBox(
				A2(ianmackenzie$elm_geometry$Circle2d$withRadius, vertexProperties.a8, vertexProperties.I));
		};
		return elm$core$Set$fromList(
			A2(
				elm$core$List$map,
				function ($) {
					return $.a_;
				},
				A2(
					elm$core$List$filter,
					function (_n1) {
						var label = _n1.O;
						return A2(
							ianmackenzie$elm_geometry$BoundingBox2d$intersects,
							bB,
							vertexBB(label));
					},
					elm_community$graph$Graph$nodes(graph))));
	});
var elm$core$Basics$clamp = F3(
	function (low, high, number) {
		return (_Utils_cmp(number, low) < 0) ? low : ((_Utils_cmp(number, high) > 0) ? high : number);
	});
var elm$core$Dict$isEmpty = function (dict) {
	if (dict.$ === -2) {
		return true;
	} else {
		return false;
	}
};
var elm$core$Set$isEmpty = function (_n0) {
	var dict = _n0;
	return elm$core$Dict$isEmpty(dict);
};
var elm$core$Dict$singleton = F2(
	function (key, value) {
		return A5(elm$core$Dict$RBNode_elm_builtin, 1, key, value, elm$core$Dict$RBEmpty_elm_builtin, elm$core$Dict$RBEmpty_elm_builtin);
	});
var elm$core$Set$singleton = function (key) {
	return A2(elm$core$Dict$singleton, key, 0);
};
var elm$core$String$toFloat = _String_toFloat;
var elm$core$Tuple$mapSecond = F2(
	function (func, _n0) {
		var x = _n0.a;
		var y = _n0.b;
		return _Utils_Tuple2(
			x,
			func(y));
	});
var elm_community$intdict$IntDict$map = F2(
	function (f, dict) {
		switch (dict.$) {
			case 0:
				return elm_community$intdict$IntDict$empty;
			case 1:
				var l = dict.a;
				return A2(
					elm_community$intdict$IntDict$leaf,
					l.dS,
					A2(f, l.dS, l.ai));
			default:
				var i = dict.a;
				return A3(
					elm_community$intdict$IntDict$inner,
					i.k,
					A2(elm_community$intdict$IntDict$map, f, i.g),
					A2(elm_community$intdict$IntDict$map, f, i.h));
		}
	});
var gampleman$elm_visualization$Force$reheat = function (_n0) {
	var config = _n0;
	return _Utils_update(
		config,
		{aU: 1.0});
};
var elm$core$Dict$values = function (dict) {
	return A3(
		elm$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return A2(elm$core$List$cons, value, valueList);
			}),
		_List_Nil,
		dict);
};
var elm$core$Basics$sqrt = _Basics_sqrt;
var elm$core$Dict$map = F2(
	function (func, dict) {
		if (dict.$ === -2) {
			return elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			return A5(
				elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				A2(func, key, value),
				A2(elm$core$Dict$map, func, left),
				A2(elm$core$Dict$map, func, right));
		}
	});
var elm$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			if (dict.$ === -2) {
				return n;
			} else {
				var left = dict.d;
				var right = dict.e;
				var $temp$n = A2(elm$core$Dict$sizeHelp, n + 1, right),
					$temp$dict = left;
				n = $temp$n;
				dict = $temp$dict;
				continue sizeHelp;
			}
		}
	});
var elm$core$Dict$size = function (dict) {
	return A2(elm$core$Dict$sizeHelp, 0, dict);
};
var elm$core$Basics$isNaN = _Basics_isNaN;
var ianmackenzie$elm_geometry$BoundingBox2d$dimensions = function (boundingBox) {
	return _Utils_Tuple2(
		ianmackenzie$elm_geometry$BoundingBox2d$maxX(boundingBox) - ianmackenzie$elm_geometry$BoundingBox2d$minX(boundingBox),
		ianmackenzie$elm_geometry$BoundingBox2d$maxY(boundingBox) - ianmackenzie$elm_geometry$BoundingBox2d$minY(boundingBox));
};
var ianmackenzie$elm_geometry$Vector2d$squaredLength = function (vector) {
	var _n0 = ianmackenzie$elm_geometry$Vector2d$components(vector);
	var x = _n0.a;
	var y = _n0.b;
	return (x * x) + (y * y);
};
var ianmackenzie$elm_geometry$Point2d$squaredDistanceFrom = F2(
	function (firstPoint, secondPoint) {
		return ianmackenzie$elm_geometry$Vector2d$squaredLength(
			A2(ianmackenzie$elm_geometry$Vector2d$from, firstPoint, secondPoint));
	});
var ianmackenzie$elm_geometry$Point2d$distanceFrom = F2(
	function (firstPoint, secondPoint) {
		return elm$core$Basics$sqrt(
			A2(ianmackenzie$elm_geometry$Point2d$squaredDistanceFrom, firstPoint, secondPoint));
	});
var ianmackenzie$elm_geometry$Vector2d$scaleBy = F2(
	function (scale, vector) {
		var _n0 = ianmackenzie$elm_geometry$Vector2d$components(vector);
		var x = _n0.a;
		var y = _n0.b;
		return ianmackenzie$elm_geometry$Vector2d$fromComponents(
			_Utils_Tuple2(x * scale, y * scale));
	});
var ianmackenzie$elm_geometry$Vector2d$sum = F2(
	function (firstVector, secondVector) {
		var _n0 = ianmackenzie$elm_geometry$Vector2d$components(secondVector);
		var x2 = _n0.a;
		var y2 = _n0.b;
		var _n1 = ianmackenzie$elm_geometry$Vector2d$components(firstVector);
		var x1 = _n1.a;
		var y1 = _n1.b;
		return ianmackenzie$elm_geometry$Vector2d$fromComponents(
			_Utils_Tuple2(x1 + x2, y1 + y2));
	});
var ianmackenzie$elm_geometry$Vector2d$zero = ianmackenzie$elm_geometry$Vector2d$fromComponents(
	_Utils_Tuple2(0, 0));
var gampleman$elm_visualization$Force$ManyBody$applyForce = F4(
	function (alpha, theta, qtree, vertex) {
		var isFarAway = function (treePart) {
			var distance = A2(ianmackenzie$elm_geometry$Point2d$distanceFrom, vertex.I, treePart.dp.I);
			var _n2 = ianmackenzie$elm_geometry$BoundingBox2d$dimensions(treePart.eO);
			var width = _n2.a;
			return _Utils_cmp(width / distance, theta) < 0;
		};
		var calculateVelocity = F2(
			function (target, source) {
				var delta = A2(ianmackenzie$elm_geometry$Vector2d$from, target.I, source.I);
				var weight = (source.dc * alpha) / ianmackenzie$elm_geometry$Vector2d$squaredLength(delta);
				return elm$core$Basics$isNaN(weight) ? ianmackenzie$elm_geometry$Vector2d$zero : A2(ianmackenzie$elm_geometry$Vector2d$scaleBy, weight, delta);
			});
		var useAggregate = function (treePart) {
			return A2(calculateVelocity, vertex, treePart.dp);
		};
		switch (qtree.$) {
			case 0:
				return ianmackenzie$elm_geometry$Vector2d$zero;
			case 1:
				var leaf = qtree.a;
				if (isFarAway(leaf)) {
					return useAggregate(leaf);
				} else {
					var applyForceFromPoint = F2(
						function (point, accum) {
							return _Utils_eq(point.dS, vertex.dS) ? accum : A2(
								ianmackenzie$elm_geometry$Vector2d$sum,
								A2(calculateVelocity, vertex, point),
								accum);
						});
					var _n1 = leaf.eS;
					var first = _n1.a;
					var rest = _n1.b;
					return A3(
						elm$core$List$foldl,
						applyForceFromPoint,
						ianmackenzie$elm_geometry$Vector2d$zero,
						A2(elm$core$List$cons, first, rest));
				}
			default:
				var node = qtree.a;
				if (isFarAway(node)) {
					return useAggregate(node);
				} else {
					var helper = function (tree) {
						return A4(gampleman$elm_visualization$Force$ManyBody$applyForce, alpha, theta, tree, vertex);
					};
					return A2(
						ianmackenzie$elm_geometry$Vector2d$sum,
						helper(node.fL),
						A2(
							ianmackenzie$elm_geometry$Vector2d$sum,
							helper(node.fF),
							A2(
								ianmackenzie$elm_geometry$Vector2d$sum,
								helper(node.fn),
								helper(node.fq))));
				}
		}
	});
var gampleman$elm_visualization$Force$ManyBody$constructSuperPoint = F2(
	function (first, rest) {
		var initialStrength = first.dc;
		var initialPoint = ianmackenzie$elm_geometry$Point2d$coordinates(first.I);
		var folder = F2(
			function (point, _n3) {
				var _n4 = _n3.a;
				var accumX = _n4.a;
				var accumY = _n4.b;
				var strength = _n3.b;
				var size = _n3.c;
				var _n2 = ianmackenzie$elm_geometry$Point2d$coordinates(point.I);
				var x = _n2.a;
				var y = _n2.b;
				return _Utils_Tuple3(
					_Utils_Tuple2(accumX + x, accumY + y),
					strength + point.dc,
					size + 1);
			});
		var _n0 = A3(
			elm$core$List$foldl,
			folder,
			_Utils_Tuple3(initialPoint, initialStrength, 1),
			rest);
		var _n1 = _n0.a;
		var totalX = _n1.a;
		var totalY = _n1.b;
		var totalStrength = _n0.b;
		var totalSize = _n0.c;
		return {
			I: ianmackenzie$elm_geometry$Point2d$fromCoordinates(
				_Utils_Tuple2(totalX / totalSize, totalY / totalSize)),
			dc: totalStrength
		};
	});
var gampleman$elm_visualization$Force$ManyBody$config = {
	eT: gampleman$elm_visualization$Force$ManyBody$constructSuperPoint,
	eU: gampleman$elm_visualization$Force$ManyBody$constructSuperPoint,
	fS: function ($) {
		return $.I;
	}
};
var gampleman$elm_visualization$Force$QuadTree$Empty = {$: 0};
var gampleman$elm_visualization$Force$QuadTree$empty = gampleman$elm_visualization$Force$QuadTree$Empty;
var gampleman$elm_visualization$Force$QuadTree$Leaf = function (a) {
	return {$: 1, a: a};
};
var gampleman$elm_visualization$Force$QuadTree$Node = function (a) {
	return {$: 2, a: a};
};
var gampleman$elm_visualization$Force$QuadTree$NE = 0;
var gampleman$elm_visualization$Force$QuadTree$NW = 1;
var gampleman$elm_visualization$Force$QuadTree$SE = 2;
var gampleman$elm_visualization$Force$QuadTree$SW = 3;
var ianmackenzie$elm_geometry$BoundingBox2d$midX = function (_n0) {
	var boundingBox = _n0;
	return boundingBox.a3 + (0.5 * (boundingBox.a1 - boundingBox.a3));
};
var ianmackenzie$elm_geometry$BoundingBox2d$midY = function (_n0) {
	var boundingBox = _n0;
	return boundingBox.a4 + (0.5 * (boundingBox.a2 - boundingBox.a4));
};
var ianmackenzie$elm_geometry$BoundingBox2d$centerPoint = function (boundingBox) {
	return ianmackenzie$elm_geometry$Point2d$fromCoordinates(
		_Utils_Tuple2(
			ianmackenzie$elm_geometry$BoundingBox2d$midX(boundingBox),
			ianmackenzie$elm_geometry$BoundingBox2d$midY(boundingBox)));
};
var ianmackenzie$elm_geometry$BoundingBox2d$centroid = function (boundingBox) {
	return ianmackenzie$elm_geometry$BoundingBox2d$centerPoint(boundingBox);
};
var ianmackenzie$elm_geometry$BoundingBox2d$extrema = function (_n0) {
	var extrema_ = _n0;
	return extrema_;
};
var gampleman$elm_visualization$Force$QuadTree$quadrant = F2(
	function (boundingBox, point) {
		var _n0 = ianmackenzie$elm_geometry$Point2d$coordinates(point);
		var x = _n0.a;
		var y = _n0.b;
		var _n1 = ianmackenzie$elm_geometry$Point2d$coordinates(
			ianmackenzie$elm_geometry$BoundingBox2d$centroid(boundingBox));
		var midX = _n1.a;
		var midY = _n1.b;
		var _n2 = ianmackenzie$elm_geometry$BoundingBox2d$extrema(boundingBox);
		var minX = _n2.a3;
		var minY = _n2.a4;
		var maxX = _n2.a1;
		var maxY = _n2.a2;
		return (_Utils_cmp(y, midY) > -1) ? ((_Utils_cmp(x, midX) > -1) ? 0 : 1) : ((_Utils_cmp(x, midX) > -1) ? 2 : 3);
	});
var ianmackenzie$elm_geometry$BoundingBox2d$singleton = function (point) {
	var _n0 = ianmackenzie$elm_geometry$Point2d$coordinates(point);
	var x = _n0.a;
	var y = _n0.b;
	return ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema(
		{a1: x, a2: y, a3: x, a4: y});
};
var gampleman$elm_visualization$Force$QuadTree$singleton = F2(
	function (toPoint, vertex) {
		return gampleman$elm_visualization$Force$QuadTree$Leaf(
			{
				dp: 0,
				eO: ianmackenzie$elm_geometry$BoundingBox2d$singleton(
					toPoint(vertex)),
				eS: _Utils_Tuple2(vertex, _List_Nil)
			});
	});
var ianmackenzie$elm_geometry$BoundingBox2d$contains = F2(
	function (point, boundingBox) {
		var _n0 = ianmackenzie$elm_geometry$Point2d$coordinates(point);
		var x = _n0.a;
		var y = _n0.b;
		return ((_Utils_cmp(
			ianmackenzie$elm_geometry$BoundingBox2d$minX(boundingBox),
			x) < 1) && (_Utils_cmp(
			x,
			ianmackenzie$elm_geometry$BoundingBox2d$maxX(boundingBox)) < 1)) && ((_Utils_cmp(
			ianmackenzie$elm_geometry$BoundingBox2d$minY(boundingBox),
			y) < 1) && (_Utils_cmp(
			y,
			ianmackenzie$elm_geometry$BoundingBox2d$maxY(boundingBox)) < 1));
	});
var ianmackenzie$elm_geometry$BoundingBox2d$hull = F2(
	function (firstBox, secondBox) {
		return ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema(
			{
				a1: A2(
					elm$core$Basics$max,
					ianmackenzie$elm_geometry$BoundingBox2d$maxX(firstBox),
					ianmackenzie$elm_geometry$BoundingBox2d$maxX(secondBox)),
				a2: A2(
					elm$core$Basics$max,
					ianmackenzie$elm_geometry$BoundingBox2d$maxY(firstBox),
					ianmackenzie$elm_geometry$BoundingBox2d$maxY(secondBox)),
				a3: A2(
					elm$core$Basics$min,
					ianmackenzie$elm_geometry$BoundingBox2d$minX(firstBox),
					ianmackenzie$elm_geometry$BoundingBox2d$minX(secondBox)),
				a4: A2(
					elm$core$Basics$min,
					ianmackenzie$elm_geometry$BoundingBox2d$minY(firstBox),
					ianmackenzie$elm_geometry$BoundingBox2d$minY(secondBox))
			});
	});
var gampleman$elm_visualization$Force$QuadTree$insertBy = F3(
	function (toPoint, vertex, qtree) {
		switch (qtree.$) {
			case 0:
				return gampleman$elm_visualization$Force$QuadTree$Leaf(
					{
						dp: 0,
						eO: ianmackenzie$elm_geometry$BoundingBox2d$singleton(
							toPoint(vertex)),
						eS: _Utils_Tuple2(vertex, _List_Nil)
					});
			case 1:
				var leaf = qtree.a;
				var maxSize = 32;
				var _n1 = leaf.eS;
				var first = _n1.a;
				var rest = _n1.b;
				var newSize = 2 + elm$core$List$length(rest);
				if (_Utils_cmp(newSize, maxSize) > -1) {
					var initial = gampleman$elm_visualization$Force$QuadTree$Node(
						{
							dp: 0,
							eO: A2(
								ianmackenzie$elm_geometry$BoundingBox2d$hull,
								leaf.eO,
								ianmackenzie$elm_geometry$BoundingBox2d$singleton(
									toPoint(vertex))),
							fn: gampleman$elm_visualization$Force$QuadTree$Empty,
							fq: gampleman$elm_visualization$Force$QuadTree$Empty,
							fF: gampleman$elm_visualization$Force$QuadTree$Empty,
							fL: gampleman$elm_visualization$Force$QuadTree$Empty
						});
					return A3(
						elm$core$List$foldl,
						gampleman$elm_visualization$Force$QuadTree$insertBy(toPoint),
						initial,
						A2(elm$core$List$cons, first, rest));
				} else {
					return gampleman$elm_visualization$Force$QuadTree$Leaf(
						{
							dp: 0,
							eO: A2(
								ianmackenzie$elm_geometry$BoundingBox2d$hull,
								leaf.eO,
								ianmackenzie$elm_geometry$BoundingBox2d$singleton(
									toPoint(vertex))),
							eS: _Utils_Tuple2(
								vertex,
								A2(elm$core$List$cons, first, rest))
						});
				}
			default:
				var node = qtree.a;
				var point = toPoint(vertex);
				if (A2(ianmackenzie$elm_geometry$BoundingBox2d$contains, point, node.eO)) {
					var _n2 = A2(gampleman$elm_visualization$Force$QuadTree$quadrant, node.eO, point);
					switch (_n2) {
						case 0:
							return gampleman$elm_visualization$Force$QuadTree$Node(
								_Utils_update(
									node,
									{
										fn: A3(gampleman$elm_visualization$Force$QuadTree$insertBy, toPoint, vertex, node.fn)
									}));
						case 2:
							return gampleman$elm_visualization$Force$QuadTree$Node(
								_Utils_update(
									node,
									{
										fF: A3(gampleman$elm_visualization$Force$QuadTree$insertBy, toPoint, vertex, node.fF)
									}));
						case 1:
							return gampleman$elm_visualization$Force$QuadTree$Node(
								_Utils_update(
									node,
									{
										fq: A3(gampleman$elm_visualization$Force$QuadTree$insertBy, toPoint, vertex, node.fq)
									}));
						default:
							return gampleman$elm_visualization$Force$QuadTree$Node(
								_Utils_update(
									node,
									{
										fL: A3(gampleman$elm_visualization$Force$QuadTree$insertBy, toPoint, vertex, node.fL)
									}));
					}
				} else {
					var _n3 = ianmackenzie$elm_geometry$BoundingBox2d$extrema(node.eO);
					var minX = _n3.a3;
					var minY = _n3.a4;
					var maxX = _n3.a1;
					var maxY = _n3.a2;
					var _n4 = ianmackenzie$elm_geometry$BoundingBox2d$dimensions(node.eO);
					var width = _n4.a;
					var height = _n4.b;
					var _n5 = A2(gampleman$elm_visualization$Force$QuadTree$quadrant, node.eO, point);
					switch (_n5) {
						case 0:
							return gampleman$elm_visualization$Force$QuadTree$Node(
								{
									dp: 0,
									eO: ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema(
										{a1: maxX + width, a2: maxY + height, a3: minX, a4: minY}),
									fn: A2(gampleman$elm_visualization$Force$QuadTree$singleton, toPoint, vertex),
									fq: gampleman$elm_visualization$Force$QuadTree$Empty,
									fF: gampleman$elm_visualization$Force$QuadTree$Empty,
									fL: qtree
								});
						case 2:
							return gampleman$elm_visualization$Force$QuadTree$Node(
								{
									dp: 0,
									eO: ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema(
										{a1: maxX + width, a2: maxY, a3: minX, a4: minY - height}),
									fn: gampleman$elm_visualization$Force$QuadTree$Empty,
									fq: qtree,
									fF: A2(gampleman$elm_visualization$Force$QuadTree$singleton, toPoint, vertex),
									fL: gampleman$elm_visualization$Force$QuadTree$Empty
								});
						case 1:
							return gampleman$elm_visualization$Force$QuadTree$Node(
								{
									dp: 0,
									eO: ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema(
										{a1: maxX, a2: maxY + height, a3: minX - width, a4: minY}),
									fn: gampleman$elm_visualization$Force$QuadTree$Empty,
									fq: A2(gampleman$elm_visualization$Force$QuadTree$singleton, toPoint, vertex),
									fF: qtree,
									fL: gampleman$elm_visualization$Force$QuadTree$Empty
								});
						default:
							return gampleman$elm_visualization$Force$QuadTree$Node(
								{
									dp: 0,
									eO: ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema(
										{a1: maxX, a2: maxY, a3: minX - width, a4: minY - height}),
									fn: qtree,
									fq: gampleman$elm_visualization$Force$QuadTree$Empty,
									fF: gampleman$elm_visualization$Force$QuadTree$Empty,
									fL: A2(gampleman$elm_visualization$Force$QuadTree$singleton, toPoint, vertex)
								});
					}
				}
		}
	});
var gampleman$elm_visualization$Force$QuadTree$fromList = function (toPoint) {
	return A2(
		elm$core$List$foldl,
		gampleman$elm_visualization$Force$QuadTree$insertBy(toPoint),
		gampleman$elm_visualization$Force$QuadTree$empty);
};
var gampleman$elm_visualization$Force$QuadTree$getAggregate = function (qtree) {
	switch (qtree.$) {
		case 0:
			return elm$core$Maybe$Nothing;
		case 1:
			var aggregate = qtree.a.dp;
			return elm$core$Maybe$Just(aggregate);
		default:
			var aggregate = qtree.a.dp;
			return elm$core$Maybe$Just(aggregate);
	}
};
var gampleman$elm_visualization$Force$QuadTree$performAggregate = F2(
	function (config, vanillaQuadTree) {
		var combineAggregates = config.eT;
		var combineVertices = config.eU;
		switch (vanillaQuadTree.$) {
			case 0:
				return gampleman$elm_visualization$Force$QuadTree$Empty;
			case 1:
				var leaf = vanillaQuadTree.a;
				var _n1 = leaf.eS;
				var first = _n1.a;
				var rest = _n1.b;
				return gampleman$elm_visualization$Force$QuadTree$Leaf(
					{
						dp: A2(combineVertices, first, rest),
						eO: leaf.eO,
						eS: _Utils_Tuple2(first, rest)
					});
			default:
				var node = vanillaQuadTree.a;
				var newSw = A2(gampleman$elm_visualization$Force$QuadTree$performAggregate, config, node.fL);
				var newSe = A2(gampleman$elm_visualization$Force$QuadTree$performAggregate, config, node.fF);
				var newNw = A2(gampleman$elm_visualization$Force$QuadTree$performAggregate, config, node.fq);
				var newNe = A2(gampleman$elm_visualization$Force$QuadTree$performAggregate, config, node.fn);
				var subresults = A2(
					elm$core$List$filterMap,
					gampleman$elm_visualization$Force$QuadTree$getAggregate,
					_List_fromArray(
						[newNw, newSw, newNe, newSe]));
				if (!subresults.b) {
					return gampleman$elm_visualization$Force$QuadTree$Empty;
				} else {
					var x = subresults.a;
					var xs = subresults.b;
					return gampleman$elm_visualization$Force$QuadTree$Node(
						{
							dp: A2(combineAggregates, x, xs),
							eO: node.eO,
							fn: newNe,
							fq: newNw,
							fF: newSe,
							fL: newSw
						});
				}
		}
	});
var gampleman$elm_visualization$Force$ManyBody$manyBody = F3(
	function (alpha, theta, vertices) {
		var withAggregates = A2(
			gampleman$elm_visualization$Force$QuadTree$performAggregate,
			gampleman$elm_visualization$Force$ManyBody$config,
			A2(
				gampleman$elm_visualization$Force$QuadTree$fromList,
				function ($) {
					return $.I;
				},
				vertices));
		var updateVertex = function (vertex) {
			return _Utils_update(
				vertex,
				{
					bM: A2(
						ianmackenzie$elm_geometry$Vector2d$sum,
						vertex.bM,
						A4(gampleman$elm_visualization$Force$ManyBody$applyForce, alpha, theta, withAggregates, vertex))
				});
		};
		return A2(elm$core$List$map, updateVertex, vertices);
	});
var gampleman$elm_visualization$Force$ManyBody$wrapper = F4(
	function (alpha, theta, strengths, points) {
		var vertices = A2(
			elm$core$List$map,
			function (_n2) {
				var key = _n2.a;
				var point = _n2.b;
				var x = point.aS;
				var y = point.aT;
				var strength = A2(
					elm$core$Maybe$withDefault,
					0,
					A2(elm$core$Dict$get, key, strengths));
				return {
					dS: key,
					I: ianmackenzie$elm_geometry$Point2d$fromCoordinates(
						_Utils_Tuple2(x, y)),
					dc: strength,
					bM: ianmackenzie$elm_geometry$Vector2d$zero
				};
			},
			elm$core$Dict$toList(points));
		var updater = F2(
			function (newVertex, maybePoint) {
				if (maybePoint.$ === 1) {
					return elm$core$Maybe$Nothing;
				} else {
					var point = maybePoint.a;
					var _n1 = ianmackenzie$elm_geometry$Vector2d$components(newVertex.bM);
					var dvx = _n1.a;
					var dvy = _n1.b;
					return elm$core$Maybe$Just(
						_Utils_update(
							point,
							{eD: point.eD + dvx, eE: point.eE + dvy}));
				}
			});
		var newVertices = A3(gampleman$elm_visualization$Force$ManyBody$manyBody, alpha, theta, vertices);
		var folder = F2(
			function (newVertex, pointsDict) {
				return A3(
					elm$core$Dict$update,
					newVertex.dS,
					updater(newVertex),
					pointsDict);
			});
		return A3(elm$core$List$foldl, folder, points, newVertices);
	});
var gampleman$elm_visualization$Force$applyForce = F3(
	function (alpha, force, entities) {
		switch (force.$) {
			case 0:
				var x = force.a;
				var y = force.b;
				var n = elm$core$Dict$size(entities);
				var _n1 = A3(
					elm$core$Dict$foldr,
					F3(
						function (_n2, ent, _n3) {
							var sx0 = _n3.a;
							var sy0 = _n3.b;
							return _Utils_Tuple2(sx0 + ent.aS, sy0 + ent.aT);
						}),
					_Utils_Tuple2(0, 0),
					entities);
				var sumx = _n1.a;
				var sumy = _n1.b;
				var sx = (sumx / n) - x;
				var sy = (sumy / n) - y;
				return A2(
					elm$core$Dict$map,
					F2(
						function (_n4, ent) {
							return _Utils_update(
								ent,
								{aS: ent.aS - sx, aT: ent.aT - sy});
						}),
					entities);
			case 1:
				var _float = force.a;
				var collisionParamidDict = force.b;
				return entities;
			case 2:
				var iters = force.a;
				var lnks = force.b;
				return A3(
					elm$core$List$foldl,
					F2(
						function (_n5, ents) {
							var source = _n5.fI;
							var target = _n5.fN;
							var distance = _n5.cj;
							var strength = _n5.dc;
							var bias = _n5.cd;
							var _n6 = _Utils_Tuple2(
								A2(elm$core$Dict$get, source, ents),
								A2(elm$core$Dict$get, target, ents));
							if ((!_n6.a.$) && (!_n6.b.$)) {
								var sourceNode = _n6.a.a;
								var targetNode = _n6.b.a;
								var y = ((targetNode.aT + targetNode.eE) - sourceNode.aT) - sourceNode.eE;
								var x = ((targetNode.aS + targetNode.eD) - sourceNode.aS) - sourceNode.eD;
								var d = elm$core$Basics$sqrt(
									A2(elm$core$Basics$pow, x, 2) + A2(elm$core$Basics$pow, y, 2));
								var l = (((d - distance) / d) * alpha) * strength;
								return A3(
									elm$core$Dict$update,
									source,
									elm$core$Maybe$map(
										function (tn) {
											return _Utils_update(
												tn,
												{eD: tn.eD + ((x * l) * (1 - bias)), eE: tn.eE + ((y * l) * (1 - bias))});
										}),
									A3(
										elm$core$Dict$update,
										target,
										elm$core$Maybe$map(
											function (sn) {
												return _Utils_update(
													sn,
													{eD: sn.eD - ((x * l) * bias), eE: sn.eE - ((y * l) * bias)});
											}),
										ents));
							} else {
								var otherwise = _n6;
								return ents;
							}
						}),
					entities,
					lnks);
			case 3:
				var theta = force.a;
				var entityStrengths = force.b;
				return A4(gampleman$elm_visualization$Force$ManyBody$wrapper, alpha, theta, entityStrengths, entities);
			case 4:
				var directionalParamidDict = force.a;
				return entities;
			default:
				var directionalParamidDict = force.a;
				return entities;
		}
	});
var gampleman$elm_visualization$Force$tick = F2(
	function (_n0, nodes) {
		var state = _n0;
		var updateEntity = function (ent) {
			return _Utils_update(
				ent,
				{eD: ent.eD * state.bN, eE: ent.eE * state.bN, aS: ent.aS + (ent.eD * state.bN), aT: ent.aT + (ent.eE * state.bN)});
		};
		var dictNodes = A3(
			elm$core$List$foldl,
			function (node) {
				return A2(elm$core$Dict$insert, node.a_, node);
			},
			elm$core$Dict$empty,
			nodes);
		var alpha = state.aU + ((state.dr - state.aU) * state.b9);
		var newNodes = A3(
			elm$core$List$foldl,
			gampleman$elm_visualization$Force$applyForce(alpha),
			dictNodes,
			state.dI);
		return _Utils_Tuple2(
			_Utils_update(
				state,
				{aU: alpha}),
			A2(
				elm$core$List$map,
				updateEntity,
				elm$core$Dict$values(newNodes)));
	});
var ianmackenzie$elm_geometry$BoundingBox2d$from = F2(
	function (firstPoint, secondPoint) {
		var _n0 = ianmackenzie$elm_geometry$Point2d$coordinates(secondPoint);
		var x2 = _n0.a;
		var y2 = _n0.b;
		var _n1 = ianmackenzie$elm_geometry$Point2d$coordinates(firstPoint);
		var x1 = _n1.a;
		var y1 = _n1.b;
		return ianmackenzie$elm_geometry$BoundingBox2d$fromExtrema(
			{
				a1: A2(elm$core$Basics$max, x1, x2),
				a2: A2(elm$core$Basics$max, y1, y2),
				a3: A2(elm$core$Basics$min, x1, x2),
				a4: A2(elm$core$Basics$min, y1, y2)
			});
	});
var ianmackenzie$elm_geometry$Point2d$addTo = F2(
	function (point, vector) {
		return A2(ianmackenzie$elm_geometry$Point2d$translateBy, vector, point);
	});
var ianmackenzie$elm_geometry$Point2d$scaleAbout = F3(
	function (centerPoint, scale, point) {
		return A2(
			ianmackenzie$elm_geometry$Point2d$addTo,
			centerPoint,
			A2(
				ianmackenzie$elm_geometry$Vector2d$scaleBy,
				scale,
				A2(ianmackenzie$elm_geometry$Vector2d$from, centerPoint, point)));
	});
var author$project$Main$update = F2(
	function (msg, m) {
		switch (msg.$) {
			case 0:
				return m;
			case 1:
				var _n1 = A2(gampleman$elm_visualization$Force$tick, m.aB, m.bD);
				var newSimulationState = _n1.a;
				var newSimulationEntities__ = _n1.b;
				var newSimulationEntities_ = A2(author$project$User$bringBackIfFixed, m.a, newSimulationEntities__);
				var newSimulationEntities = function () {
					var _n2 = m.e;
					if ((_n2.$ === 2) && (_n2.a.$ === 2)) {
						var brushStart = _n2.a.a.ar;
						var vertexPositionsAtStart = _n2.a.a.b8;
						var delta = A2(ianmackenzie$elm_geometry$Vector2d$from, brushStart, m.r);
						var newVertexPositions = A2(
							elm_community$intdict$IntDict$map,
							F2(
								function (_n3, pos) {
									return A2(ianmackenzie$elm_geometry$Point2d$translateBy, delta, pos);
								}),
							vertexPositionsAtStart);
						return A2(
							elm$core$List$map,
							function (ent) {
								var maybePos = A2(elm_community$intdict$IntDict$get, ent.a_, newVertexPositions);
								var maybeX = A2(elm$core$Maybe$map, ianmackenzie$elm_geometry$Point2d$xCoordinate, maybePos);
								var maybeY = A2(elm$core$Maybe$map, ianmackenzie$elm_geometry$Point2d$yCoordinate, maybePos);
								return _Utils_update(
									ent,
									{
										eD: 0,
										eE: 0,
										aS: A2(elm$core$Maybe$withDefault, ent.aS, maybeX),
										aT: A2(elm$core$Maybe$withDefault, ent.aT, maybeY)
									});
							},
							newSimulationEntities_);
					} else {
						return newSimulationEntities_;
					}
				}();
				return _Utils_update(
					m,
					{
						bD: newSimulationEntities,
						aB: newSimulationState,
						a: A2(author$project$User$updateByEntities, newSimulationEntities, m.a)
					});
			case 2:
				var wS = msg.a;
				return _Utils_update(
					m,
					{ad: wS});
			case 3:
				var deltaY = msg.a;
				var zoomDelta = m.f4 + (1.0e-3 * (-deltaY));
				var newZoom = A3(elm$core$Basics$clamp, 0.5, 2, zoomDelta);
				return _Utils_update(
					m,
					{
						z: A3(ianmackenzie$elm_geometry$Point2d$scaleAbout, m.r, m.f4 / newZoom, m.z),
						f4: newZoom
					});
			case 4:
				return _Utils_update(
					m,
					{ao: true});
			case 5:
				return _Utils_update(
					m,
					{ao: false});
			case 6:
				return _Utils_update(
					m,
					{bb: true});
			case 7:
				return _Utils_update(
					m,
					{bb: false});
			case 8:
				var visibility = msg.a;
				if (visibility === 1) {
					return _Utils_update(
						m,
						{ao: false, bb: false});
				} else {
					return m;
				}
			case 9:
				var selectedMode = msg.a;
				return _Utils_update(
					m,
					{bB: selectedMode});
			case 10:
				return _Utils_update(
					m,
					{z: author$project$Main$initialPan, f4: 1});
			case 11:
				return _Utils_update(
					m,
					{
						e: author$project$Main$Hand(author$project$Main$HandIdle)
					});
			case 12:
				return _Utils_update(
					m,
					{
						e: author$project$Main$Draw(author$project$Main$DrawIdle)
					});
			case 13:
				return _Utils_update(
					m,
					{
						e: author$project$Main$Select(author$project$Main$SelectIdle)
					});
			case 14:
				return author$project$Main$restartSimulationIfVaderIsOn(
					_Utils_update(
						m,
						{aP: !m.aP}));
			case 15:
				return _Utils_update(
					m,
					{
						aA: 0,
						e: author$project$Main$Select(author$project$Main$SelectIdle)
					});
			case 16:
				return _Utils_update(
					m,
					{
						aA: 1,
						e: author$project$Main$Select(author$project$Main$SelectIdle)
					});
			case 17:
				var newMousePosition = msg.a;
				var _n5 = m.e;
				_n5$3:
				while (true) {
					switch (_n5.$) {
						case 2:
							switch (_n5.a.$) {
								case 1:
									var brushStart = _n5.a.a.ar;
									var _n6 = m.aA;
									if (!_n6) {
										var newSelectedVertices = A2(
											author$project$User$vertexIdsInBoundingBox,
											A2(ianmackenzie$elm_geometry$BoundingBox2d$from, brushStart, m.r),
											m.a);
										return _Utils_update(
											m,
											{
												d: A2(author$project$User$inducedEdges, newSelectedVertices, m.a),
												f: newSelectedVertices
											});
									} else {
										var newSelectedEdges = A2(
											author$project$User$edgeIdsIntersectiongLineSegment,
											A2(ianmackenzie$elm_geometry$LineSegment2d$from, brushStart, m.r),
											m.a);
										return _Utils_update(
											m,
											{
												d: newSelectedEdges,
												f: author$project$User$inducedVertices(newSelectedEdges)
											});
									}
								case 2:
									var brushStart = _n5.a.a.ar;
									var vertexPositionsAtStart = _n5.a.a.b8;
									var delta = A2(ianmackenzie$elm_geometry$Vector2d$from, brushStart, m.r);
									var newVertexPositions = A2(
										elm$core$List$map,
										elm$core$Tuple$mapSecond(
											ianmackenzie$elm_geometry$Point2d$translateBy(delta)),
										elm_community$intdict$IntDict$toList(vertexPositionsAtStart));
									return _Utils_update(
										m,
										{
											aB: gampleman$elm_visualization$Force$reheat(m.aB),
											a: A2(author$project$User$setVertexPositions, newVertexPositions, m.a)
										});
								default:
									break _n5$3;
							}
						case 0:
							if (_n5.a.$ === 1) {
								var mousePositionAtPanStart = _n5.a.a.d_;
								var panAtStart = _n5.a.a.d4;
								return _Utils_update(
									m,
									{
										z: function () {
											var toPoint = function (pos) {
												return ianmackenzie$elm_geometry$Point2d$fromCoordinates(
													_Utils_Tuple2(pos.aS, pos.aT));
											};
											var delta = A2(
												ianmackenzie$elm_geometry$Vector2d$scaleBy,
												1 / m.f4,
												A2(
													ianmackenzie$elm_geometry$Vector2d$from,
													toPoint(newMousePosition),
													toPoint(mousePositionAtPanStart)));
											return A2(ianmackenzie$elm_geometry$Point2d$translateBy, delta, panAtStart);
										}()
									});
							} else {
								break _n5$3;
							}
						default:
							break _n5$3;
					}
				}
				return m;
			case 18:
				var newMousePosition = msg.a;
				var panAsVector = ianmackenzie$elm_geometry$Vector2d$fromComponents(
					ianmackenzie$elm_geometry$Point2d$coordinates(m.z));
				var newSvgMousePosition = A2(
					ianmackenzie$elm_geometry$Point2d$translateBy,
					panAsVector,
					A3(
						ianmackenzie$elm_geometry$Point2d$scaleAbout,
						ianmackenzie$elm_geometry$Point2d$origin,
						1 / m.f4,
						ianmackenzie$elm_geometry$Point2d$fromCoordinates(
							_Utils_Tuple2(newMousePosition.aS, newMousePosition.aT))));
				return _Utils_update(
					m,
					{b$: newMousePosition, r: newSvgMousePosition});
			case 19:
				var _n7 = m.e;
				_n7$3:
				while (true) {
					switch (_n7.$) {
						case 2:
							switch (_n7.a.$) {
								case 1:
									var brushStart = _n7.a.a.ar;
									var _n8 = _Utils_eq(brushStart, m.r) ? _Utils_Tuple2(elm$core$Set$empty, elm$core$Set$empty) : _Utils_Tuple2(m.f, m.d);
									var newSelectedVertices = _n8.a;
									var newSelectedEdges = _n8.b;
									return _Utils_update(
										m,
										{
											d: newSelectedEdges,
											e: author$project$Main$Select(author$project$Main$SelectIdle),
											f: newSelectedVertices
										});
								case 2:
									return author$project$Main$restartSimulationIfVaderIsOn(
										_Utils_update(
											m,
											{
												e: author$project$Main$Select(author$project$Main$SelectIdle)
											}));
								default:
									break _n7$3;
							}
						case 0:
							if (_n7.a.$ === 1) {
								return _Utils_update(
									m,
									{
										e: author$project$Main$Hand(author$project$Main$HandIdle)
									});
							} else {
								break _n7$3;
							}
						default:
							break _n7$3;
					}
				}
				return m;
			case 20:
				var _n9 = m.e;
				_n9$2:
				while (true) {
					switch (_n9.$) {
						case 1:
							if (!_n9.a.$) {
								var _n10 = _n9.a;
								var _n11 = A2(author$project$User$addVertex, m.r, m.a);
								var newUser = _n11.a;
								var sourceId = _n11.b;
								return _Utils_update(
									m,
									{
										e: author$project$Main$Draw(
											author$project$Main$BrushingNewEdgeWithSourceId(sourceId)),
										a: newUser
									});
							} else {
								break _n9$2;
							}
						case 2:
							if (!_n9.a.$) {
								var _n12 = _n9.a;
								return _Utils_update(
									m,
									{
										e: author$project$Main$Select(
											author$project$Main$BrushingForSelection(
												{ar: m.r}))
									});
							} else {
								break _n9$2;
							}
						default:
							break _n9$2;
					}
				}
				return m;
			case 21:
				var _n13 = m.e;
				if ((_n13.$ === 1) && (_n13.a.$ === 1)) {
					var sourceId = _n13.a.a;
					var _n14 = A2(author$project$User$addVertex, m.r, m.a);
					var userGraphWithAddedVertex = _n14.a;
					var newId = _n14.b;
					var newUser = A2(
						author$project$User$addEdge,
						_Utils_Tuple2(sourceId, newId),
						userGraphWithAddedVertex);
					return author$project$Main$restartSimulationIfVaderIsOn(
						_Utils_update(
							m,
							{
								e: author$project$Main$Draw(author$project$Main$DrawIdle),
								a: newUser
							}));
				} else {
					return m;
				}
			case 22:
				return _Utils_update(
					m,
					{
						e: function () {
							var _n15 = m.e;
							if ((!_n15.$) && (!_n15.a.$)) {
								var _n16 = _n15.a;
								return author$project$Main$Hand(
									author$project$Main$Panning(
										{d_: m.b$, d4: m.z}));
							} else {
								return m.e;
							}
						}()
					});
			case 23:
				var id = msg.a;
				return _Utils_update(
					m,
					{
						R: elm$core$Set$singleton(id)
					});
			case 24:
				return _Utils_update(
					m,
					{R: elm$core$Set$empty});
			case 25:
				var edgeId = msg.a;
				return _Utils_update(
					m,
					{
						E: elm$core$Set$singleton(edgeId)
					});
			case 26:
				return _Utils_update(
					m,
					{E: elm$core$Set$empty});
			case 27:
				var id = msg.a;
				var _n17 = m.e;
				_n17$2:
				while (true) {
					switch (_n17.$) {
						case 1:
							if (!_n17.a.$) {
								var _n18 = _n17.a;
								return _Utils_update(
									m,
									{
										e: author$project$Main$Draw(
											author$project$Main$BrushingNewEdgeWithSourceId(id))
									});
							} else {
								break _n17$2;
							}
						case 2:
							if (!_n17.a.$) {
								var _n19 = _n17.a;
								var _n20 = A2(elm$core$Set$member, id, m.f) ? (m.ao ? A3(author$project$User$duplicateSubgraph, m.f, m.d, m.a) : _Utils_Tuple3(m.a, m.f, m.d)) : _Utils_Tuple3(
									m.a,
									elm$core$Set$singleton(id),
									elm$core$Set$empty);
								var newUser = _n20.a;
								var newSelectedVertices = _n20.b;
								var newSelectedEdges = _n20.c;
								return _Utils_update(
									m,
									{
										d: newSelectedEdges,
										e: author$project$Main$Select(
											author$project$Main$DraggingSelection(
												{
													ar: m.r,
													b8: A2(author$project$User$getVertexIdsWithPositions, newSelectedVertices, newUser)
												})),
										f: newSelectedVertices,
										a: newUser
									});
							} else {
								break _n17$2;
							}
						default:
							break _n17$2;
					}
				}
				return m;
			case 28:
				var targetId = msg.a;
				var _n21 = m.e;
				if ((_n21.$ === 1) && (_n21.a.$ === 1)) {
					var sourceId = _n21.a.a;
					return _Utils_eq(sourceId, targetId) ? _Utils_update(
						m,
						{
							e: author$project$Main$Draw(author$project$Main$DrawIdle)
						}) : author$project$Main$restartSimulationIfVaderIsOn(
						_Utils_update(
							m,
							{
								e: author$project$Main$Draw(author$project$Main$DrawIdle),
								a: A2(
									author$project$User$addEdge,
									_Utils_Tuple2(sourceId, targetId),
									m.a)
							}));
				} else {
					return m;
				}
			case 29:
				var _n22 = msg.a;
				var s = _n22.a;
				var t = _n22.b;
				var _n23 = m.e;
				_n23$2:
				while (true) {
					switch (_n23.$) {
						case 1:
							if (!_n23.a.$) {
								var _n24 = _n23.a;
								var _n25 = A3(
									author$project$User$divideEdge,
									m.r,
									_Utils_Tuple2(s, t),
									m.a);
								var newUser = _n25.a;
								var idOfTheNewVertex = _n25.b;
								return _Utils_update(
									m,
									{
										E: elm$core$Set$empty,
										e: author$project$Main$Draw(
											author$project$Main$BrushingNewEdgeWithSourceId(idOfTheNewVertex)),
										a: newUser
									});
							} else {
								break _n23$2;
							}
						case 2:
							if (!_n23.a.$) {
								var _n26 = _n23.a;
								var _n27 = A2(
									elm$core$Set$member,
									_Utils_Tuple2(s, t),
									m.d) ? (m.ao ? A3(author$project$User$duplicateSubgraph, m.f, m.d, m.a) : _Utils_Tuple3(m.a, m.f, m.d)) : _Utils_Tuple3(
									m.a,
									elm$core$Set$fromList(
										_List_fromArray(
											[s, t])),
									elm$core$Set$singleton(
										_Utils_Tuple2(s, t)));
								var newUser = _n27.a;
								var newSelectedVertices = _n27.b;
								var newSelectedEdges = _n27.c;
								return _Utils_update(
									m,
									{
										d: newSelectedEdges,
										e: author$project$Main$Select(
											author$project$Main$DraggingSelection(
												{
													ar: m.r,
													b8: A2(author$project$User$getVertexIdsWithPositions, newSelectedVertices, newUser)
												})),
										f: newSelectedVertices,
										a: newUser
									});
							} else {
								break _n23$2;
							}
						default:
							break _n23$2;
					}
				}
				return m;
			case 30:
				var _n28 = msg.a;
				var s = _n28.a;
				var t = _n28.b;
				var _n29 = m.e;
				if ((_n29.$ === 1) && (_n29.a.$ === 1)) {
					var sourceId = _n29.a.a;
					var _n30 = A3(
						author$project$User$divideEdge,
						m.r,
						_Utils_Tuple2(s, t),
						m.a);
					var newUser_ = _n30.a;
					var newId = _n30.b;
					var newUser = A2(
						author$project$User$addEdge,
						_Utils_Tuple2(sourceId, newId),
						newUser_);
					return author$project$Main$restartSimulationIfVaderIsOn(
						_Utils_update(
							m,
							{
								E: elm$core$Set$empty,
								e: author$project$Main$Draw(author$project$Main$DrawIdle),
								a: newUser
							}));
				} else {
					return m;
				}
			case 36:
				var b = msg.a;
				var updateCH = function (bag) {
					return _Utils_update(
						bag,
						{bU: b});
				};
				return _Utils_update(
					m,
					{
						a: function () {
							var _n31 = m.S;
							if (!_n31.$) {
								var bagId = _n31.a;
								return A3(author$project$User$updateBag, bagId, updateCH, m.a);
							} else {
								return A2(author$project$User$updateDefaultBag, updateCH, m.a);
							}
						}()
					});
			case 41:
				var str = msg.a;
				return _Utils_update(
					m,
					{
						a: A3(
							author$project$User$setCentroidX,
							m.f,
							A2(
								elm$core$Maybe$withDefault,
								0,
								elm$core$String$toFloat(str)),
							m.a)
					});
			case 42:
				var str = msg.a;
				return _Utils_update(
					m,
					{
						a: A3(
							author$project$User$setCentroidY,
							m.f,
							A2(
								elm$core$Maybe$withDefault,
								0,
								elm$core$String$toFloat(str)),
							m.a)
					});
			case 43:
				var newColor = msg.a;
				var updateColor = function (v) {
					return _Utils_update(
						v,
						{ae: newColor});
				};
				return _Utils_update(
					m,
					{
						a: elm$core$Set$isEmpty(m.f) ? A2(author$project$User$updateDefaultVertexProperties, updateColor, m.a) : A3(author$project$User$updateVertices, m.f, updateColor, m.a)
					});
			case 44:
				var str = msg.a;
				var updateRadius = function (v) {
					return _Utils_update(
						v,
						{
							a8: A3(
								elm$core$Basics$clamp,
								4,
								20,
								A2(
									elm$core$Maybe$withDefault,
									0,
									elm$core$String$toFloat(str)))
						});
				};
				return _Utils_update(
					m,
					{
						a: elm$core$Set$isEmpty(m.f) ? A2(author$project$User$updateDefaultVertexProperties, updateRadius, m.a) : A3(author$project$User$updateVertices, m.f, updateRadius, m.a)
					});
			case 51:
				var newColor = msg.a;
				var updateColor = function (e) {
					return _Utils_update(
						e,
						{ae: newColor});
				};
				return _Utils_update(
					m,
					{
						a: elm$core$Set$isEmpty(m.d) ? A2(author$project$User$updateDefaultEdgeProperties, updateColor, m.a) : A3(author$project$User$updateEdges, m.d, updateColor, m.a)
					});
			case 45:
				var b = msg.a;
				var updateFixed = function (v) {
					return _Utils_update(
						v,
						{bT: b});
				};
				return author$project$Main$restartSimulationIfVaderIsOn(
					_Utils_update(
						m,
						{
							a: elm$core$Set$isEmpty(m.f) ? A2(author$project$User$updateDefaultVertexProperties, updateFixed, m.a) : A3(author$project$User$updateVertices, m.f, updateFixed, m.a)
						}));
			case 52:
				var str = msg.a;
				var updateThickness = function (e) {
					return _Utils_update(
						e,
						{
							aC: A3(
								elm$core$Basics$clamp,
								1,
								20,
								A2(
									elm$core$Maybe$withDefault,
									0,
									elm$core$String$toFloat(str)))
						});
				};
				return _Utils_update(
					m,
					{
						a: elm$core$Set$isEmpty(m.d) ? A2(author$project$User$updateDefaultEdgeProperties, updateThickness, m.a) : A3(author$project$User$updateEdges, m.d, updateThickness, m.a)
					});
			case 53:
				var str = msg.a;
				var updateDistance = function (e) {
					return _Utils_update(
						e,
						{
							cj: A3(
								elm$core$Basics$clamp,
								0,
								2000,
								A2(
									elm$core$Maybe$withDefault,
									0,
									elm$core$String$toFloat(str)))
						});
				};
				return author$project$Main$restartSimulationIfVaderIsOn(
					_Utils_update(
						m,
						{
							a: elm$core$Set$isEmpty(m.d) ? A2(author$project$User$updateDefaultEdgeProperties, updateDistance, m.a) : A3(author$project$User$updateEdges, m.d, updateDistance, m.a)
						}));
			case 54:
				var str = msg.a;
				var updateStrength = function (e) {
					return _Utils_update(
						e,
						{
							dc: A3(
								elm$core$Basics$clamp,
								0,
								1,
								A2(
									elm$core$Maybe$withDefault,
									0,
									elm$core$String$toFloat(str)))
						});
				};
				return author$project$Main$restartSimulationIfVaderIsOn(
					_Utils_update(
						m,
						{
							a: elm$core$Set$isEmpty(m.d) ? A2(author$project$User$updateDefaultEdgeProperties, updateStrength, m.a) : A3(author$project$User$updateEdges, m.d, updateStrength, m.a)
						}));
			case 37:
				var newUser = A2(author$project$User$removeVertices, m.f, m.a);
				return author$project$Main$restartSimulationIfVaderIsOn(
					_Utils_update(
						m,
						{E: elm$core$Set$empty, R: elm$core$Set$empty, d: elm$core$Set$empty, f: elm$core$Set$empty, a: newUser}));
			case 47:
				var newUser = A2(author$project$User$removeEdges, m.d, m.a);
				return author$project$Main$restartSimulationIfVaderIsOn(
					_Utils_update(
						m,
						{E: elm$core$Set$empty, d: elm$core$Set$empty, a: newUser}));
			case 46:
				var _n32 = elm$core$Set$toList(m.d);
				if (_n32.b && (!_n32.b.b)) {
					var selectedEdge = _n32.a;
					var newUser = A2(author$project$User$contractEdge, selectedEdge, m.a);
					return author$project$Main$restartSimulationIfVaderIsOn(
						_Utils_update(
							m,
							{E: elm$core$Set$empty, d: elm$core$Set$empty, a: newUser}));
				} else {
					return m;
				}
			case 32:
				var _n33 = m.S;
				if (!_n33.$) {
					var bagId = _n33.a;
					return _Utils_update(
						m,
						{
							S: elm$core$Maybe$Nothing,
							a: A2(author$project$User$removeBag, bagId, m.a)
						});
				} else {
					return m;
				}
			case 31:
				var _n34 = A2(author$project$User$addBag, m.f, m.a);
				var newUser = _n34.a;
				var idOfTheNewBag = _n34.b;
				return _Utils_update(
					m,
					{
						S: elm$core$Maybe$Just(idOfTheNewBag),
						a: newUser
					});
			case 38:
				var id = msg.a;
				return _Utils_update(
					m,
					{
						R: elm$core$Set$singleton(id)
					});
			case 39:
				return _Utils_update(
					m,
					{R: elm$core$Set$empty});
			case 40:
				var id = msg.a;
				return _Utils_update(
					m,
					{
						d: elm$core$Set$empty,
						e: author$project$Main$Select(author$project$Main$SelectIdle),
						f: elm$core$Set$singleton(id)
					});
			case 48:
				var edgeId = msg.a;
				return _Utils_update(
					m,
					{
						E: elm$core$Set$singleton(edgeId)
					});
			case 49:
				return _Utils_update(
					m,
					{E: elm$core$Set$empty});
			case 50:
				var _n35 = msg.a;
				var sourceId = _n35.a;
				var targetId = _n35.b;
				return _Utils_update(
					m,
					{
						d: elm$core$Set$singleton(
							_Utils_Tuple2(sourceId, targetId)),
						e: author$project$Main$Select(author$project$Main$SelectIdle),
						f: elm$core$Set$fromList(
							_List_fromArray(
								[sourceId, targetId]))
					});
			case 33:
				var bagId = msg.a;
				return _Utils_update(
					m,
					{
						R: A2(author$project$User$getVerticesInBag, bagId, m.a)
					});
			case 34:
				return _Utils_update(
					m,
					{R: elm$core$Set$empty});
			default:
				var bagId = msg.a;
				var _n36 = _Utils_eq(
					m.S,
					elm$core$Maybe$Just(bagId)) ? _Utils_Tuple2(elm$core$Maybe$Nothing, elm$core$Set$empty) : _Utils_Tuple2(
					elm$core$Maybe$Just(bagId),
					A2(author$project$User$getVerticesInBag, bagId, m.a));
				var newMaybeSelectedBag = _n36.a;
				var newSelectedVertices = _n36.b;
				return _Utils_update(
					m,
					{S: newMaybeSelectedBag, d: elm$core$Set$empty, f: newSelectedVertices});
		}
	});
var elm$core$String$fromFloat = _String_fromNumber;
var elm$svg$Svg$trustedNode = _VirtualDom_nodeNS('http://www.w3.org/2000/svg');
var elm$svg$Svg$path = elm$svg$Svg$trustedNode('path');
var elm$svg$Svg$svg = elm$svg$Svg$trustedNode('svg');
var elm$svg$Svg$Attributes$d = _VirtualDom_attribute('d');
var elm$svg$Svg$Attributes$fill = _VirtualDom_attribute('fill');
var elm$svg$Svg$Attributes$height = _VirtualDom_attribute('height');
var elm$svg$Svg$Attributes$viewBox = _VirtualDom_attribute('viewBox');
var elm$svg$Svg$Attributes$width = _VirtualDom_attribute('width');
var author$project$Icons$draw40pxWithColor = F2(
	function (color, d) {
		return A2(
			elm$svg$Svg$svg,
			_List_fromArray(
				[
					elm$svg$Svg$Attributes$viewBox('0 0 100 100'),
					elm$svg$Svg$Attributes$width(
					elm$core$String$fromFloat(40)),
					elm$svg$Svg$Attributes$height(
					elm$core$String$fromFloat(40))
				]),
			_List_fromArray(
				[
					A2(
					elm$svg$Svg$path,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$d(d),
							elm$svg$Svg$Attributes$fill(color)
						]),
					_List_Nil)
				]));
	});
var author$project$Icons$icons = {eK: 'M50,15A35,35,0,1,0,85,50,35,35,0,0,0,50,15ZM38.17,70.94V29.06L70.21,50Z', eR: 'M30.93,75.32h.21v-.74a1.73,1.73,0,0,1,1.72-1.73h.81a9.51,9.51,0,0,0-.07-3c-.93-4.19-2.07-8.35-3.37-12.44C28.08,50.71,26.79,44,28.92,37c2.38-7.8,7.1-13.34,15.13-15.75a2.87,2.87,0,0,0,1.44-1.19A17.19,17.19,0,0,1,50,15c.1.91.21,1.49.21,2.07,0,.86,0,1.73-.1,2.58-.11,1.2.26,1.92,1.58,2a14.15,14.15,0,0,1,2.16.51c0,2.68,0,2.68,2.43,3.67a17.8,17.8,0,0,1,2.38,1,6.72,6.72,0,0,1,1.57,1.4A46.81,46.81,0,0,0,63.31,32c2.35,2.18,4.81,4.26,7.3,6.28,1.08.88,1.9,1.67,1.36,3.21A3.22,3.22,0,0,0,72.13,43a5.74,5.74,0,0,1-2.53,5c-3.46,1.68-6.19,1.21-8.93-1.56a4,4,0,0,0-4.55-1.2,13.89,13.89,0,0,1-8.09.81l1.3,1.37A60.33,60.33,0,0,1,58.6,58.76c2,3.37,3.64,6.92,3.57,10.93a26.11,26.11,0,0,1-.28,3.16h.34A1.72,1.72,0,0,1,64,74.58v.74h.2a2,2,0,0,1,2,2V85H29V77.27A2,2,0,0,1,30.93,75.32Z', eZ: 'M87.92,35.61C86.93,24.4,79,15,68,15A19.91,19.91,0,0,0,49.77,27.37C46.7,20.09,40.14,15,32,15c-11,0-18.91,9.4-19.9,20.61,0,0-.54,2.78.64,7.79a34.43,34.43,0,0,0,10.5,17.5L49.77,85l27-24.1a34.43,34.43,0,0,0,10.5-17.5C88.46,38.39,87.92,35.61,87.92,35.61ZM59.86,65.17a11,11,0,0,1-5.73,3.67,1.62,1.62,0,0,0-1.39,1.83c0,1,0,2,0,3a1.25,1.25,0,0,1-1.35,1.41c-1.08,0-2.18,0-3.27,0a1.32,1.32,0,0,1-1.42-1.5c0-.74,0-1.48,0-2.22,0-1.64-.07-1.7-1.64-2a20.4,20.4,0,0,1-5.83-1.67c-1.45-.71-1.61-1.07-1.19-2.58.31-1.13.62-2.26,1-3.38.41-1.29.76-1.45,2-.83a18.84,18.84,0,0,0,6.47,1.93,7.91,7.91,0,0,0,4.25-.55,3.31,3.31,0,0,0,.78-5.8A9.53,9.53,0,0,0,50,55.16a59.52,59.52,0,0,1-6.62-3c-3.39-2-5.55-4.82-5.29-9,.28-4.67,2.92-7.58,7.2-9.14,1.77-.64,1.78-.61,1.79-2.46,0-.63,0-1.25,0-1.87,0-1.39.27-1.64,1.65-1.67.43,0,.85,0,1.28,0,3,0,3,0,3,2.94,0,2.09,0,2.1,2.09,2.42a18.32,18.32,0,0,1,4.58,1.37,1.34,1.34,0,0,1,.87,1.78c-.38,1.27-.72,2.56-1.13,3.82s-.77,1.37-1.91.82a14.64,14.64,0,0,0-7.27-1.44,5.42,5.42,0,0,0-1.94.4,2.75,2.75,0,0,0-.68,4.89,12.86,12.86,0,0,0,3.16,1.76,58.4,58.4,0,0,1,5.76,2.61C62.44,52.72,64,60.11,59.86,65.17Z', e_: 'M81.61,34.77a11.59,11.59,0,0,1-14.19,1.71l-6.34,6.34,4.36,4.37-11.6,2.42-5.06,5.06q-1.22,5.8-2.42,11.6L42,61.91l-5.51,5.51a11.6,11.6,0,1,1-3.88-3.88L38.11,58c-1.45-1.47-2.9-3-4.36-4.42L44.84,51.3l5.63-5.63,2.31-11.08,4.41,4.35,6.35-6.34a11.58,11.58,0,1,1,18.07,2.17Z', e4: 'M15,15H35.22l-7.78,7.78,14,14-4.66,4.66-14-14L15,35.22ZM85,85H64.78l7.78-7.78-14-14,4.66-4.66,14,14L85,64.78ZM15,85V64.78l7.78,7.78,14-14,4.66,4.66-14,14L35.22,85ZM85,15V35.22l-7.78-7.78-14,14-4.66-4.66,14-14L64.78,15Z', e7: 'M85.89,50.89a35.89,35.89,0,0,1-24.52,34c-1.83.35-2.47-.76-2.47-1.72,0-1.18,0-5,0-9.85,0-3.34-1.15-5.53-2.43-6.64,8-.89,16.38-3.92,16.38-17.71a13.85,13.85,0,0,0-3.69-9.63,12.89,12.89,0,0,0-.36-9.5s-3-1-9.85,3.68a34,34,0,0,0-18,0c-6.86-4.64-9.87-3.68-9.87-3.68a12.92,12.92,0,0,0-.35,9.5A13.86,13.86,0,0,0,27.1,49c0,13.75,8.38,16.83,16.35,17.74a7.62,7.62,0,0,0-2.28,4.79c-2,.92-7.24,2.51-10.44-3,0,0-1.9-3.44-5.5-3.7,0,0-3.5,0-.25,2.19,0,0,2.36,1.1,4,5.24,0,0,2.11,7,12.09,4.82,0,3,0,5.25,0,6.1s-.66,2.06-2.45,1.73a35.89,35.89,0,1,1,47.23-34Z', e8: 'M47,84.42c2.59,0,4.89.15,7.15.3a66.71,66.71,0,0,0,12.41,0c2.64-6.33,5.27-13.42,7.82-20.3,2.93-7.9,6-16.06,9-23.21,1.91-4.45.24-7.4-.36-7.75a4.47,4.47,0,0,0-2.44.36,4.44,4.44,0,0,1-.16.6l-3.12,9.35a4.67,4.67,0,1,1-8.86-3l3.11-9.34q0-.14.09-.24A4.83,4.83,0,0,1,71.89,29a9.66,9.66,0,0,0-.17-7.5,3.88,3.88,0,0,0-2.33-2c-1.16-.3-3,.24-4.79,1.76L62,39.81a4.67,4.67,0,1,1-9.25-1.33L55.19,21a4.83,4.83,0,0,1-.2-1.37,4.68,4.68,0,0,0-9.35,0,4.73,4.73,0,0,1-.17,1.26l2.45,16a4.67,4.67,0,0,1-9.24,1.42L35.92,20.36a3.69,3.69,0,0,0-4-1.07A3.76,3.76,0,0,0,30,23.47c0,.09,0,.2.05.3l3,24.11,4.51,5.41a4.67,4.67,0,1,1-7.18,6l-7.53-9a6.26,6.26,0,0,0-2.4-.91,4.38,4.38,0,0,0-3.19.58,4.53,4.53,0,0,0-1.53,3.33,6.49,6.49,0,0,0,2,5.12c.12.12.24.24.35.37L39.8,84.81A66.3,66.3,0,0,1,47,84.42ZM80.75,32h0Z', fh: 'M43.11,51.72H31.64L45.41,15H63.77Q58.61,27.63,53.44,40.25H70.66L29.34,85Z', fi: 'M35.33,34.38H19a4,4,0,0,1-4-4V19a4,4,0,0,1,4-4H35.33a4,4,0,0,1,4,4V30.38A4,4,0,0,1,35.33,34.38Zm49.67-4V19a4,4,0,0,0-4-4H47.38a4,4,0,0,0-4,4V30.38a4,4,0,0,0,4,4H81A4,4,0,0,0,85,30.38Zm0,25.31V44.31a4,4,0,0,0-4-4H47.38a4,4,0,0,0-4,4V55.69a4,4,0,0,0,4,4H81A4,4,0,0,0,85,55.69ZM85,81V69.62a4,4,0,0,0-4-4H47.38a4,4,0,0,0-4,4V81a4,4,0,0,0,4,4H81A4,4,0,0,0,85,81ZM39.33,55.69V44.31a4,4,0,0,0-4-4H19a4,4,0,0,0-4,4V55.69a4,4,0,0,0,4,4H35.33A4,4,0,0,0,39.33,55.69Zm0,25.31V69.62a4,4,0,0,0-4-4H19a4,4,0,0,0-4,4V81a4,4,0,0,0,4,4H35.33A4,4,0,0,0,39.33,81Z', fj: 'M64.51,24.52,15,74.19,25.78,85,75.29,35.33ZM56.45,48.39l-5-5L63.35,31.54l4.95,5ZM35.74,25.74,38.38,15l3.95,10.74,7.79,3.1-7.19,3.93L38.21,41l-2.47-9.62L26.64,28Zm35,30.83,3.43-3.52v6l5,2-6.31,2.85-.5,7.18-3.59-8.25-6.94-.5,6.31-3-2.53-6.26Zm7.79-38.43,2.64-2.7V20L85,21.58l-4.84,2.19.44,6.69L77,23l-5.33-.39,4.84-2.31-1.93-4.81Z', fw: 'M29,64.23l13.16,10-13.88,10a3.59,3.59,0,0,1-5-5Zm3.35-4.78L45.48,69l22-30.62-13.16-10Q43.32,43.89,32.32,59.45Zm25.2-34.73L70.2,34.77l7.18-8.85c.05-.36.68-5.3-3.11-8.61A9.65,9.65,0,0,0,64,15.87Z', fx: 'M85,43.9V56.1a3.23,3.23,0,0,1-3.23,3.23H60.22V81.77A3.24,3.24,0,0,1,57,85H44.79a3.24,3.24,0,0,1-3.24-3.23V59.33H18.23A3.23,3.23,0,0,1,15,56.1V43.9a3.23,3.23,0,0,1,3.23-3.23H41.55V18.23A3.24,3.24,0,0,1,44.79,15H57a3.24,3.24,0,0,1,3.23,3.23V40.67H81.77A3.23,3.23,0,0,1,85,43.9Z', fy: 'M69.51,51.72,52.3,52.87,67.21,79.26,56.89,85,43.11,57.46,30.49,68.93V15Z', fz: 'M83.91,45.62c-.57-.35-5-3-6.74-3.8L75,36.57c.65-1.74,1.88-6.61,2.07-7.45A2.33,2.33,0,0,0,76.45,27l-3.4-3.4a2.33,2.33,0,0,0-2.17-.62c-.64.14-5.64,1.4-7.45,2.07l-5.25-2.17c-.77-1.68-3.33-6-3.8-6.74a2.33,2.33,0,0,0-2-1.09H47.6a2.33,2.33,0,0,0-2,1.09c-.35.57-3,5-3.8,6.74L36.57,25c-1.74-.65-6.6-1.88-7.45-2.07a2.33,2.33,0,0,0-2.17.62L23.55,27a2.33,2.33,0,0,0-.62,2.17c.14.64,1.4,5.64,2.07,7.45l-2.17,5.25c-1.68.77-6,3.33-6.74,3.8a2.33,2.33,0,0,0-1.09,2v4.8a2.33,2.33,0,0,0,1.09,2c.57.35,5,3,6.74,3.8L25,63.43c-.65,1.74-1.88,6.6-2.07,7.45a2.33,2.33,0,0,0,.62,2.17l3.4,3.4a2.33,2.33,0,0,0,2.17.62c.64-.14,5.64-1.4,7.45-2.07l5.25,2.17c.77,1.68,3.33,6,3.8,6.74a2.33,2.33,0,0,0,2,1.09h4.8a2.33,2.33,0,0,0,2-1.09c.35-.57,3-5,3.8-6.74L63.43,75c1.74.65,6.6,1.88,7.45,2.07a2.33,2.33,0,0,0,2.17-.62l3.4-3.4a2.33,2.33,0,0,0,.62-2.17c-.14-.64-1.4-5.64-2.07-7.45l2.17-5.25c1.68-.77,6-3.33,6.74-3.8a2.33,2.33,0,0,0,1.09-2V47.6A2.33,2.33,0,0,0,83.91,45.62ZM50,65.26A15.26,15.26,0,1,1,65.26,50,15.28,15.28,0,0,1,50,65.26Z', fA: 'M47.12,69.3a30.75,30.75,0,0,1-10.87-1.82,21.22,21.22,0,0,1-8.16-5.37A23.92,23.92,0,0,1,23,53.33a37.44,37.44,0,0,1-1.78-12.11,28.56,28.56,0,0,1,1.93-10.71,24.35,24.35,0,0,1,5.38-8.28,24.09,24.09,0,0,1,8.23-5.34A28.68,28.68,0,0,1,47.35,15a27.69,27.69,0,0,1,10.37,1.89,24.11,24.11,0,0,1,8.12,5.3,23.86,23.86,0,0,1,5.3,8.24A29,29,0,0,1,73,41.07q0,9.43-3.63,15.74a24.06,24.06,0,0,1-9.6,9.47l.24.47q5.1,10.59,10.05,10.59a9,9,0,0,0,2.28-.23A4.28,4.28,0,0,0,74,76.34a6,6,0,0,0,1.27-1.4c.39-.56.82-1.23,1.28-2a.84.84,0,0,1,.7-.5,1.39,1.39,0,0,1,.85.19,1.7,1.7,0,0,1,.62.7,1,1,0,0,1,0,.93A33.27,33.27,0,0,1,77,77.57a20.05,20.05,0,0,1-2.51,3.52,13.51,13.51,0,0,1-3.44,2.79A8.67,8.67,0,0,1,66.69,85,7.5,7.5,0,0,1,62,83.3a19.37,19.37,0,0,1-3.91-4.22,33.54,33.54,0,0,1-3-5.33q-1.27-2.84-2.13-5.07A28.26,28.26,0,0,1,47.12,69.3ZM45,53.13a12.54,12.54,0,0,1,6.11,1.78q3.18,1.79,6,6.58A23.47,23.47,0,0,0,61.54,53a35.87,35.87,0,0,0,1.59-10.79,47.92,47.92,0,0,0-.81-8.82,25.55,25.55,0,0,0-2.67-7.7A15.17,15.17,0,0,0,54.7,20.3a13.39,13.39,0,0,0-7.58-2.05,12.41,12.41,0,0,0-7.23,2.09,16.36,16.36,0,0,0-5,5.45A26.23,26.23,0,0,0,32,33.45a41,41,0,0,0-.93,8.7A52.68,52.68,0,0,0,32,51.78a21.5,21.5,0,0,0,3.09,8,11.85,11.85,0,0,1,1.28-2.43,9.2,9.2,0,0,1,2-2.13,10.24,10.24,0,0,1,2.82-1.51A11.48,11.48,0,0,1,45,53.13Zm2.48,12.92a12.5,12.5,0,0,0,4.17-.7,42.2,42.2,0,0,0-4.06-6.84,5.37,5.37,0,0,0-4.37-2.36,4.16,4.16,0,0,0-2.39.73,8.59,8.59,0,0,0-1.86,1.67,7.24,7.24,0,0,0-1.16,1.85,4.29,4.29,0,0,0-.39,1.24c0,.26.3.63.89,1.12a13,13,0,0,0,2.32,1.47,19.7,19.7,0,0,0,3.21,1.28A12.49,12.49,0,0,0,47.43,66.05Z', fB: 'M19.65,71V38.35H15v-4.7L24.3,29H29V71Zm28-23.35v-9.3H57v9.3Zm0,23.35V61.65H57V71Zm28,0V38.35H71v-4.7L80.3,29H85V71Z', fG: 'M24.32,85,15,76.79,23.67,68,33,76.17ZM41.65,67.35l-9.31-8.22L41,50.31l9.31,8.21ZM59,49.69l-9.31-8.21,8.67-8.83,9.31,8.22ZM76.33,32,67,23.83,75.68,15,85,23.21Z', fH: 'M84.75,25.37h-10V15h10Zm-19.93,0h-10V15h10Zm-19.93,0h-10V15h10ZM25,25.37H15V15H25ZM84.75,85h-10V74.63h10ZM64.82,85h-10V74.63h10ZM44.89,85h-10V74.63h10ZM25,85H15V74.63H25Zm0-19.61H15V55H25Zm0-20.74H15V34.28H25ZM85,65.39H75V55H85Zm0-20.74H75V34.28H85Z', fV: 'M25,29.26V24.07H37.5c-.52-3.1.34-6.13,2.27-7.77A5.54,5.54,0,0,1,43.18,15H58a5.84,5.84,0,0,1,2.28,1.3c2.8,2.6,2.33,7.3,2.27,7.77H75v5.19H70.45v48a9.17,9.17,0,0,1-1.13,3.89A7.94,7.94,0,0,1,63.64,85H37.5a8.19,8.19,0,0,1-6.82-3.89,9,9,0,0,1-1.13-3.89v-48Zm17-5.19H58a4.88,4.88,0,0,0,0-3.88,3.42,3.42,0,0,0-1.13-1.3H43.18a3.42,3.42,0,0,0-1.13,1.3A4.88,4.88,0,0,0,42.05,24.07ZM39.77,35.74V72h3.41V35.74Zm9.09,0V72h3.41V35.74Zm9.09,0V72h3.41V35.74Z', fY: 'M65,20c9,5.84,13.54,17.52,12,30l9,34H83c-.93-2.69-2.43-7.25-4-13-4.24-15.56-4.26-22.76-10-26-2.7-1.53-6.06-1.83-8-2a27.14,27.14,0,0,0-10,1V16A26,26,0,0,1,65,20ZM53,48V60H72a14.12,14.12,0,0,0-4-9A14.68,14.68,0,0,0,53,48ZM33,51a14.12,14.12,0,0,0-4,9H48V48A14.68,14.68,0,0,0,33,51ZM66.55,82Q69.27,72,72,62H52ZM49,62H29q2.73,10,5.45,20Zm2,18H61L51,66ZM50,66,40,80H50Z', f4: 'M83.47,76.29,63.81,56.92a26.81,26.81,0,0,0-2.79-34c-9.45-9.55-24.17-9.71-34-3.06C14.56,28.28,10.67,47.21,20.7,59.32c8.54,10.31,24.61,12.59,36.65,4.33L76.17,83A5.33,5.33,0,0,0,84,83,5.26,5.26,0,0,0,83.47,76.29Zm-27-19.42C48,65,33.53,64.55,25.89,55.29c-7.89-9.56-5-24.38,5-30.88A21.09,21.09,0,0,1,58.62,28.9,21.07,21.07,0,0,1,56.51,56.87Z'};
var author$project$Main$AlgorithmVisualizations = 5;
var author$project$Main$ClickOnLeftMostBarRadioButton = function (a) {
	return {$: 9, a: a};
};
var author$project$Main$GamesOnGraphs = 6;
var author$project$Main$GraphGenerators = 4;
var author$project$Main$GraphOperations = 2;
var author$project$Main$GraphQueries = 3;
var author$project$Main$Preferences = 0;
var author$project$Main$leftBarHeaderSize = 38;
var elm$html$Html$div = _VirtualDom_node('div');
var elm$json$Json$Encode$string = _Json_wrap;
var elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			elm$json$Json$Encode$string(string));
	});
var elm$html$Html$Attributes$id = elm$html$Html$Attributes$stringProperty('id');
var elm$virtual_dom$VirtualDom$style = _VirtualDom_style;
var elm$html$Html$Attributes$style = elm$virtual_dom$VirtualDom$style;
var author$project$Main$leftBarHeader = elm$html$Html$div(
	_List_fromArray(
		[
			elm$html$Html$Attributes$id('header-in-left-bar'),
			A2(
			elm$html$Html$Attributes$style,
			'height',
			elm$core$String$fromInt(author$project$Main$leftBarHeaderSize) + 'px')
		]));
var author$project$Main$leftBarHeaderTextSize = 10;
var elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var elm$html$Html$text = elm$virtual_dom$VirtualDom$text;
var author$project$Main$leftBarHeaderText = function (headerText) {
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				A2(elm$html$Html$Attributes$style, 'float', 'left'),
				A2(
				elm$html$Html$Attributes$style,
				'padding',
				elm$core$String$fromInt(author$project$Main$leftBarHeaderTextSize) + 'px')
			]),
		_List_fromArray(
			[
				elm$html$Html$text(headerText)
			]));
};
var author$project$Main$leftBarContentForAlgorithmVisualizations = function (m) {
	return _List_fromArray(
		[
			author$project$Main$leftBarHeader(
			_List_fromArray(
				[
					author$project$Main$leftBarHeaderText('Algorithm Visualizations (coming soon)')
				]))
		]);
};
var author$project$Main$leftBarContentForGamesOnGraphs = function (m) {
	return _List_fromArray(
		[
			author$project$Main$leftBarHeader(
			_List_fromArray(
				[
					author$project$Main$leftBarHeaderText('Games on Graphs (coming soon)')
				]))
		]);
};
var author$project$Main$leftBarContentForGraphGenerators = function (m) {
	return _List_fromArray(
		[
			author$project$Main$leftBarHeader(
			_List_fromArray(
				[
					author$project$Main$leftBarHeaderText('Graph Generators (coming soon)')
				]))
		]);
};
var author$project$Main$leftBarContentForGraphOperations = function (m) {
	return _List_fromArray(
		[
			author$project$Main$leftBarHeader(
			_List_fromArray(
				[
					author$project$Main$leftBarHeaderText('Graph Operations (coming soon)')
				]))
		]);
};
var author$project$Main$leftBarContentForGraphQueries = function (m) {
	return _List_fromArray(
		[
			author$project$Main$leftBarHeader(
			_List_fromArray(
				[
					author$project$Main$leftBarHeaderText('Graph Queries (coming soon)')
				]))
		]);
};
var author$project$Colors$highlightColorForMouseOver = 'rgb(255, 47, 146)';
var author$project$Icons$draw = F2(
	function (size, d) {
		return A2(
			elm$svg$Svg$svg,
			_List_fromArray(
				[
					elm$svg$Svg$Attributes$viewBox('0 0 100 100'),
					elm$svg$Svg$Attributes$width(
					elm$core$String$fromFloat(size)),
					elm$svg$Svg$Attributes$height(
					elm$core$String$fromFloat(size))
				]),
			_List_fromArray(
				[
					A2(
					elm$svg$Svg$path,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$d(d),
							elm$svg$Svg$Attributes$fill('rgb(195,195,195)')
						]),
					_List_Nil)
				]));
	});
var author$project$Icons$draw24px = author$project$Icons$draw(24);
var author$project$Main$ClickOnBagItem = function (a) {
	return {$: 35, a: a};
};
var author$project$Main$ClickOnBagPlus = {$: 31};
var author$project$Main$ClickOnBagTrash = {$: 32};
var author$project$Main$ClickOnEdgeContract = {$: 46};
var author$project$Main$ClickOnEdgeItem = function (a) {
	return {$: 50, a: a};
};
var author$project$Main$ClickOnEdgeTrash = {$: 47};
var author$project$Main$ClickOnVertexItem = function (a) {
	return {$: 40, a: a};
};
var author$project$Main$ClickOnVertexTrash = {$: 37};
var author$project$Main$MouseOutBagItem = function (a) {
	return {$: 34, a: a};
};
var author$project$Main$MouseOutEdgeItem = function (a) {
	return {$: 49, a: a};
};
var author$project$Main$MouseOutVertexItem = function (a) {
	return {$: 39, a: a};
};
var author$project$Main$MouseOverBagItem = function (a) {
	return {$: 33, a: a};
};
var author$project$Main$MouseOverEdgeItem = function (a) {
	return {$: 48, a: a};
};
var author$project$Main$MouseOverVertexItem = function (a) {
	return {$: 38, a: a};
};
var elm$core$String$concat = function (strings) {
	return A2(elm$core$String$join, '', strings);
};
var elm$core$String$dropRight = F2(
	function (n, string) {
		return (n < 1) ? string : A3(elm$core$String$slice, 0, -n, string);
	});
var author$project$User$bagElementsInCurlyBraces = F2(
	function (bagId, user) {
		var inside = A2(
			elm$core$String$dropRight,
			2,
			elm$core$String$concat(
				A2(
					elm$core$List$map,
					function (vertexId) {
						return elm$core$String$fromInt(vertexId) + ', ';
					},
					elm$core$Set$toList(
						A2(author$project$User$getVerticesInBag, bagId, user)))));
		return '{ ' + (inside + ' }');
	});
var author$project$User$getEdges = function (_n0) {
	var graph = _n0.q;
	return elm_community$graph$Graph$edges(graph);
};
var author$project$User$getVertices = function (_n0) {
	var graph = _n0.q;
	return elm_community$graph$Graph$nodes(graph);
};
var elm$core$Set$size = function (_n0) {
	var dict = _n0;
	return elm$core$Dict$size(dict);
};
var elm$html$Html$Attributes$class = elm$html$Html$Attributes$stringProperty('className');
var elm$html$Html$Attributes$title = elm$html$Html$Attributes$stringProperty('title');
var elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			elm$virtual_dom$VirtualDom$on,
			event,
			elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var elm$html$Html$Events$onClick = function (msg) {
	return A2(
		elm$html$Html$Events$on,
		'click',
		elm$json$Json$Decode$succeed(msg));
};
var elm$html$Html$Events$onMouseOut = function (msg) {
	return A2(
		elm$html$Html$Events$on,
		'mouseout',
		elm$json$Json$Decode$succeed(msg));
};
var elm$html$Html$Events$onMouseOver = function (msg) {
	return A2(
		elm$html$Html$Events$on,
		'mouseover',
		elm$json$Json$Decode$succeed(msg));
};
var author$project$Main$leftBarContentForListsOfBagsVerticesAndEdges = function (m) {
	var verticesHeader = author$project$Main$leftBarHeader(
		_List_fromArray(
			[
				author$project$Main$leftBarHeaderText('Vertices'),
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('button'),
						elm$html$Html$Attributes$title('Remove Selected Vertices'),
						elm$html$Html$Events$onClick(author$project$Main$ClickOnVertexTrash)
					]),
				_List_fromArray(
					[
						author$project$Icons$draw24px(author$project$Icons$icons.fV)
					]))
			]));
	var vertexItem = function (_n2) {
		var id = _n2.a_;
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					A2(elm$html$Html$Attributes$style, 'padding', '4px 20px 4px 20px'),
					elm$html$Html$Attributes$class(
					A2(elm$core$Set$member, id, m.f) ? 'leftBarContent-item-selected' : 'leftBarContent-item'),
					A2(elm$core$Set$member, id, m.R) ? A2(elm$html$Html$Attributes$style, 'border-right', '10px solid ' + author$project$Colors$highlightColorForMouseOver) : A2(elm$html$Html$Attributes$style, '', ''),
					elm$html$Html$Events$onMouseOver(
					author$project$Main$MouseOverVertexItem(id)),
					elm$html$Html$Events$onMouseOut(
					author$project$Main$MouseOutVertexItem(id)),
					elm$html$Html$Events$onClick(
					author$project$Main$ClickOnVertexItem(id))
				]),
			_List_fromArray(
				[
					elm$html$Html$text(
					elm$core$String$fromInt(id))
				]));
	};
	var maybeEdgeContractButton = (elm$core$Set$size(m.d) === 1) ? A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$class('button'),
				elm$html$Html$Events$onClick(author$project$Main$ClickOnEdgeContract),
				elm$html$Html$Attributes$title('Contract the selected edge')
			]),
		_List_fromArray(
			[
				author$project$Icons$draw24px(author$project$Icons$icons.e_)
			])) : A2(elm$html$Html$div, _List_Nil, _List_Nil);
	var listOfVertices = A2(
		elm$html$Html$div,
		_List_Nil,
		elm$core$List$reverse(
			A2(
				elm$core$List$map,
				vertexItem,
				author$project$User$getVertices(m.a))));
	var viewVertexList = A2(
		elm$html$Html$div,
		_List_Nil,
		_List_fromArray(
			[verticesHeader, listOfVertices]));
	var edgesHeader = author$project$Main$leftBarHeader(
		_List_fromArray(
			[
				author$project$Main$leftBarHeaderText('Edges'),
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('button'),
						elm$html$Html$Attributes$title('Remove Selected Edges'),
						elm$html$Html$Events$onClick(author$project$Main$ClickOnEdgeTrash)
					]),
				_List_fromArray(
					[
						author$project$Icons$draw24px(author$project$Icons$icons.fV)
					])),
				maybeEdgeContractButton
			]));
	var edgeItem = function (_n1) {
		var from = _n1.aZ;
		var to = _n1.bg;
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					A2(elm$html$Html$Attributes$style, 'padding', '4px 20px 4px 20px'),
					elm$html$Html$Attributes$class(
					A2(
						elm$core$Set$member,
						_Utils_Tuple2(from, to),
						m.d) ? 'leftBarContent-item-selected' : 'leftBarContent-item'),
					A2(
					elm$core$Set$member,
					_Utils_Tuple2(from, to),
					m.E) ? A2(elm$html$Html$Attributes$style, 'border-right', '10px solid ' + author$project$Colors$highlightColorForMouseOver) : A2(elm$html$Html$Attributes$style, '', ''),
					elm$html$Html$Events$onMouseOver(
					author$project$Main$MouseOverEdgeItem(
						_Utils_Tuple2(from, to))),
					elm$html$Html$Events$onMouseOut(
					author$project$Main$MouseOutEdgeItem(
						_Utils_Tuple2(from, to))),
					elm$html$Html$Events$onClick(
					author$project$Main$ClickOnEdgeItem(
						_Utils_Tuple2(from, to)))
				]),
			_List_fromArray(
				[
					elm$html$Html$text(
					elm$core$String$fromInt(from) + (' → ' + elm$core$String$fromInt(to)))
				]));
	};
	var listOfEdges = A2(
		elm$html$Html$div,
		_List_Nil,
		elm$core$List$reverse(
			A2(
				elm$core$List$map,
				edgeItem,
				author$project$User$getEdges(m.a))));
	var viewEdgeList = A2(
		elm$html$Html$div,
		_List_Nil,
		_List_fromArray(
			[edgesHeader, listOfEdges]));
	var bagsHeader = author$project$Main$leftBarHeader(
		_List_fromArray(
			[
				author$project$Main$leftBarHeaderText('Bags'),
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('button'),
						elm$html$Html$Attributes$title('Remove Selected Bag'),
						elm$html$Html$Events$onClick(author$project$Main$ClickOnBagTrash)
					]),
				_List_fromArray(
					[
						author$project$Icons$draw24px(author$project$Icons$icons.fV)
					])),
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('button'),
						elm$html$Html$Attributes$title('Add New Bag'),
						elm$html$Html$Events$onClick(author$project$Main$ClickOnBagPlus)
					]),
				_List_fromArray(
					[
						author$project$Icons$draw24px(author$project$Icons$icons.fx)
					]))
			]));
	var bagItem = F2(
		function (bagId, _n0) {
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						A2(elm$html$Html$Attributes$style, 'padding', '4px 20px 4px 20px'),
						elm$html$Html$Attributes$class(
						_Utils_eq(
							elm$core$Maybe$Just(bagId),
							m.S) ? 'leftBarContent-item-selected' : 'leftBarContent-item'),
						elm$html$Html$Events$onMouseOver(
						author$project$Main$MouseOverBagItem(bagId)),
						elm$html$Html$Events$onMouseOut(
						author$project$Main$MouseOutBagItem(bagId)),
						elm$html$Html$Events$onClick(
						author$project$Main$ClickOnBagItem(bagId))
					]),
				_List_fromArray(
					[
						elm$html$Html$text(
						A2(author$project$User$bagElementsInCurlyBraces, bagId, m.a))
					]));
		});
	var listOfBags = A2(
		elm$html$Html$div,
		_List_Nil,
		elm$core$List$reverse(
			elm$core$Dict$values(
				A2(
					elm$core$Dict$map,
					bagItem,
					author$project$User$getBags(m.a)))));
	var viewBagList = A2(
		elm$html$Html$div,
		_List_Nil,
		_List_fromArray(
			[bagsHeader, listOfBags]));
	return _List_fromArray(
		[viewBagList, viewVertexList, viewEdgeList]);
};
var author$project$Main$leftBarContentForPreferences = function (m) {
	return _List_fromArray(
		[
			author$project$Main$leftBarHeader(
			_List_fromArray(
				[
					author$project$Main$leftBarHeaderText('Preferences (coming soon)')
				]))
		]);
};
var elm$html$Html$a = _VirtualDom_node('a');
var elm$html$Html$Attributes$href = function (url) {
	return A2(
		elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var elm$html$Html$Attributes$target = elm$html$Html$Attributes$stringProperty('target');
var author$project$Main$leftBar = function (m) {
	var thinBandWidth = 40;
	var thinBandButton = F3(
		function (title, selectedMode, icon) {
			var color = _Utils_eq(selectedMode, m.bB) ? 'white' : 'rgb(46, 46, 46)';
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$title(title),
						elm$html$Html$Attributes$class('thinBandButton'),
						elm$html$Html$Events$onClick(
						author$project$Main$ClickOnLeftMostBarRadioButton(selectedMode))
					]),
				_List_fromArray(
					[
						A2(author$project$Icons$draw40pxWithColor, color, icon)
					]));
		});
	var thinBandRadioButtons = A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$id('thinBarButtonGroup')
			]),
		_List_fromArray(
			[
				A3(thinBandButton, 'Preferences', 0, author$project$Icons$icons.fz),
				A3(thinBandButton, 'Lists of Bags, Vertices and Edges', 1, author$project$Icons$icons.fi),
				A3(thinBandButton, 'Graph Operations', 2, author$project$Icons$icons.fj),
				A3(thinBandButton, 'Graph Queries', 3, author$project$Icons$icons.fA),
				A3(thinBandButton, 'Graph Generators', 4, author$project$Icons$icons.fh),
				A3(thinBandButton, 'Algorithm Visualizations', 5, author$project$Icons$icons.eK),
				A3(thinBandButton, 'Games on Graphs', 6, author$project$Icons$icons.eR)
			]));
	var githubButton = A2(
		elm$html$Html$a,
		_List_fromArray(
			[
				elm$html$Html$Attributes$title('Source Code'),
				elm$html$Html$Attributes$href('https://github.com/erkal/kite'),
				elm$html$Html$Attributes$target('_blank')
			]),
		_List_fromArray(
			[
				A2(author$project$Icons$draw40pxWithColor, 'yellow', author$project$Icons$icons.e7)
			]));
	var thinBand = A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$id('leftBarThinBand'),
				A2(elm$html$Html$Attributes$style, 'position', 'absolute'),
				A2(
				elm$html$Html$Attributes$style,
				'width',
				elm$core$String$fromInt(thinBandWidth) + 'px'),
				A2(elm$html$Html$Attributes$style, 'height', '100%'),
				A2(elm$html$Html$Attributes$style, 'overflow', 'scroll')
			]),
		_List_fromArray(
			[thinBandRadioButtons, githubButton]));
	var content = A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$id('leftBarContent'),
				A2(elm$html$Html$Attributes$style, 'position', 'absolute'),
				A2(
				elm$html$Html$Attributes$style,
				'left',
				elm$core$String$fromInt(thinBandWidth) + 'px'),
				A2(
				elm$html$Html$Attributes$style,
				'width',
				elm$core$String$fromInt(author$project$Main$leftBarWidth - thinBandWidth) + 'px'),
				A2(elm$html$Html$Attributes$style, 'height', '100%'),
				A2(elm$html$Html$Attributes$style, 'overflow', 'scroll')
			]),
		function () {
			var _n0 = m.bB;
			switch (_n0) {
				case 0:
					return author$project$Main$leftBarContentForPreferences(m);
				case 1:
					return author$project$Main$leftBarContentForListsOfBagsVerticesAndEdges(m);
				case 2:
					return author$project$Main$leftBarContentForGraphOperations(m);
				case 3:
					return author$project$Main$leftBarContentForGraphQueries(m);
				case 4:
					return author$project$Main$leftBarContentForGraphGenerators(m);
				case 5:
					return author$project$Main$leftBarContentForAlgorithmVisualizations(m);
				default:
					return author$project$Main$leftBarContentForGamesOnGraphs(m);
			}
		}());
	return A2(
		elm$html$Html$div,
		_List_Nil,
		_List_fromArray(
			[thinBand, content]));
};
var author$project$Colors$colorHighlightForSelection = 'rgb(0, 150, 255)';
var author$project$Main$MouseDownOnMainSvg = {$: 22};
var author$project$Main$MouseDownOnTransparentInteractionRect = {$: 20};
var author$project$Main$MouseUpOnTransparentInteractionRect = {$: 21};
var author$project$Main$WheelDeltaY = function (a) {
	return {$: 3, a: a};
};
var elm$svg$Svg$g = elm$svg$Svg$trustedNode('g');
var author$project$Main$emptySvgElement = A2(elm$svg$Svg$g, _List_Nil, _List_Nil);
var author$project$Main$MouseDownOnEdge = function (a) {
	return {$: 29, a: a};
};
var author$project$Main$MouseOutEdge = function (a) {
	return {$: 26, a: a};
};
var author$project$Main$MouseOverEdge = function (a) {
	return {$: 25, a: a};
};
var author$project$Main$MouseUpOnEdge = function (a) {
	return {$: 30, a: a};
};
var elm$svg$Svg$Attributes$stroke = _VirtualDom_attribute('stroke');
var elm$svg$Svg$Attributes$strokeOpacity = _VirtualDom_attribute('stroke-opacity');
var elm$svg$Svg$Attributes$strokeWidth = _VirtualDom_attribute('stroke-width');
var elm$svg$Svg$Events$onMouseDown = function (msg) {
	return A2(
		elm$html$Html$Events$on,
		'mousedown',
		elm$json$Json$Decode$succeed(msg));
};
var elm$svg$Svg$Events$onMouseOut = function (msg) {
	return A2(
		elm$html$Html$Events$on,
		'mouseout',
		elm$json$Json$Decode$succeed(msg));
};
var elm$svg$Svg$Events$onMouseOver = function (msg) {
	return A2(
		elm$html$Html$Events$on,
		'mouseover',
		elm$json$Json$Decode$succeed(msg));
};
var elm$svg$Svg$Events$onMouseUp = function (msg) {
	return A2(
		elm$html$Html$Events$on,
		'mouseup',
		elm$json$Json$Decode$succeed(msg));
};
var elm$svg$Svg$polyline = elm$svg$Svg$trustedNode('polyline');
var elm$svg$Svg$Attributes$points = _VirtualDom_attribute('points');
var ianmackenzie$elm_geometry_svg$Geometry$Svg$coordinatesString = function (point) {
	var _n0 = ianmackenzie$elm_geometry$Point2d$coordinates(point);
	var x = _n0.a;
	var y = _n0.b;
	return elm$core$String$fromFloat(x) + (',' + elm$core$String$fromFloat(y));
};
var ianmackenzie$elm_geometry_svg$Geometry$Svg$pointsAttribute = function (points) {
	return elm$svg$Svg$Attributes$points(
		A2(
			elm$core$String$join,
			' ',
			A2(elm$core$List$map, ianmackenzie$elm_geometry_svg$Geometry$Svg$coordinatesString, points)));
};
var ianmackenzie$elm_geometry_svg$Geometry$Svg$lineSegment2d = F2(
	function (attributes, lineSegment) {
		var _n0 = ianmackenzie$elm_geometry$LineSegment2d$endpoints(lineSegment);
		var p1 = _n0.a;
		var p2 = _n0.b;
		return A2(
			elm$svg$Svg$polyline,
			A2(
				elm$core$List$cons,
				ianmackenzie$elm_geometry_svg$Geometry$Svg$pointsAttribute(
					_List_fromArray(
						[p1, p2])),
				attributes),
			_List_Nil);
	});
var author$project$Main$viewEdges = function (user) {
	var drawEdge = function (_n1) {
		var from = _n1.aZ;
		var to = _n1.bg;
		var label = _n1.O;
		var _n0 = _Utils_Tuple2(
			A2(author$project$User$getVertexProperties, from, user),
			A2(author$project$User$getVertexProperties, to, user));
		if ((!_n0.a.$) && (!_n0.b.$)) {
			var v = _n0.a.a;
			var w = _n0.b.a;
			return A2(
				elm$svg$Svg$g,
				_List_fromArray(
					[
						elm$svg$Svg$Events$onMouseDown(
						author$project$Main$MouseDownOnEdge(
							_Utils_Tuple2(from, to))),
						elm$svg$Svg$Events$onMouseUp(
						author$project$Main$MouseUpOnEdge(
							_Utils_Tuple2(from, to))),
						elm$svg$Svg$Events$onMouseOver(
						author$project$Main$MouseOverEdge(
							_Utils_Tuple2(from, to))),
						elm$svg$Svg$Events$onMouseOut(
						author$project$Main$MouseOutEdge(
							_Utils_Tuple2(from, to)))
					]),
				_List_fromArray(
					[
						A2(
						ianmackenzie$elm_geometry_svg$Geometry$Svg$lineSegment2d,
						_List_fromArray(
							[
								elm$svg$Svg$Attributes$stroke('red'),
								elm$svg$Svg$Attributes$strokeOpacity('0'),
								elm$svg$Svg$Attributes$strokeWidth(
								elm$core$String$fromFloat(label.aC + 6))
							]),
						A2(ianmackenzie$elm_geometry$LineSegment2d$from, v.I, w.I)),
						A2(
						ianmackenzie$elm_geometry_svg$Geometry$Svg$lineSegment2d,
						_List_fromArray(
							[
								elm$svg$Svg$Attributes$stroke(label.ae),
								elm$svg$Svg$Attributes$strokeWidth(
								elm$core$String$fromFloat(label.aC))
							]),
						A2(ianmackenzie$elm_geometry$LineSegment2d$from, v.I, w.I))
					]));
		} else {
			return author$project$Main$emptySvgElement;
		}
	};
	return A2(
		elm$svg$Svg$g,
		_List_Nil,
		A2(
			elm$core$List$map,
			drawEdge,
			author$project$User$getEdges(user)));
};
var author$project$User$getBagsWithVertices = function (_n0) {
	var graph = _n0.q;
	var bags = _n0.aq;
	var initialAcc = A2(
		elm$core$Dict$map,
		F2(
			function (_n2, bP) {
				return _Utils_Tuple2(bP, _List_Nil);
			}),
		bags);
	var cons = F3(
		function (id, label, bagId) {
			return A2(
				elm$core$Dict$update,
				bagId,
				elm$core$Maybe$map(
					elm$core$Tuple$mapSecond(
						elm$core$List$cons(
							_Utils_Tuple2(id, label)))));
		});
	var handleVertex = F2(
		function (_n1, acc) {
			var id = _n1.a_;
			var label = _n1.O;
			return A3(
				elm$core$Set$foldr,
				A2(cons, id, label),
				acc,
				label.at);
		});
	return A3(
		elm$core$List$foldr,
		handleVertex,
		initialAcc,
		elm_community$graph$Graph$nodes(graph));
};
var elm$core$Dict$filter = F2(
	function (isGood, dict) {
		return A3(
			elm$core$Dict$foldl,
			F3(
				function (k, v, d) {
					return A2(isGood, k, v) ? A3(elm$core$Dict$insert, k, v, d) : d;
				}),
			elm$core$Dict$empty,
			dict);
	});
var elm$svg$Svg$Attributes$opacity = _VirtualDom_attribute('opacity');
var elm$svg$Svg$Attributes$strokeLinejoin = _VirtualDom_attribute('stroke-linejoin');
var elm$core$List$sortBy = _List_sortBy;
var elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var ianmackenzie$elm_geometry$Polygon2d$counterclockwiseAround = F3(
	function (origin, a, b) {
		return A2(
			ianmackenzie$elm_geometry$Vector2d$crossProduct,
			A2(ianmackenzie$elm_geometry$Vector2d$from, origin, a),
			A2(ianmackenzie$elm_geometry$Vector2d$from, origin, b)) >= 0;
	});
var ianmackenzie$elm_geometry$Polygon2d$chainHelp = F2(
	function (acc, list) {
		chainHelp:
		while (true) {
			var _n0 = _Utils_Tuple2(acc, list);
			if (_n0.b.b) {
				if (_n0.a.b && _n0.a.b.b) {
					var _n1 = _n0.a;
					var r1 = _n1.a;
					var _n2 = _n1.b;
					var r2 = _n2.a;
					var rs = _n2.b;
					var _n3 = _n0.b;
					var x = _n3.a;
					var xs = _n3.b;
					if (A3(ianmackenzie$elm_geometry$Polygon2d$counterclockwiseAround, r2, r1, x)) {
						var $temp$acc = A2(elm$core$List$cons, r2, rs),
							$temp$list = A2(elm$core$List$cons, x, xs);
						acc = $temp$acc;
						list = $temp$list;
						continue chainHelp;
					} else {
						var $temp$acc = A2(elm$core$List$cons, x, acc),
							$temp$list = xs;
						acc = $temp$acc;
						list = $temp$list;
						continue chainHelp;
					}
				} else {
					var _n4 = _n0.b;
					var x = _n4.a;
					var xs = _n4.b;
					var $temp$acc = A2(elm$core$List$cons, x, acc),
						$temp$list = xs;
					acc = $temp$acc;
					list = $temp$list;
					continue chainHelp;
				}
			} else {
				return A2(elm$core$List$drop, 1, acc);
			}
		}
	});
var ianmackenzie$elm_geometry$Polygon2d$chain = ianmackenzie$elm_geometry$Polygon2d$chainHelp(_List_Nil);
var ianmackenzie$elm_geometry$Geometry$Types$Polygon2d = elm$core$Basics$identity;
var elm$core$List$sum = function (numbers) {
	return A3(elm$core$List$foldl, elm$core$Basics$add, 0, numbers);
};
var ianmackenzie$elm_geometry$Triangle2d$vertices = function (_n0) {
	var vertices_ = _n0;
	return vertices_;
};
var ianmackenzie$elm_geometry$Triangle2d$counterclockwiseArea = function (triangle) {
	var _n0 = ianmackenzie$elm_geometry$Triangle2d$vertices(triangle);
	var p1 = _n0.a;
	var p2 = _n0.b;
	var p3 = _n0.c;
	var firstVector = A2(ianmackenzie$elm_geometry$Vector2d$from, p1, p2);
	var secondVector = A2(ianmackenzie$elm_geometry$Vector2d$from, p1, p3);
	return 0.5 * A2(ianmackenzie$elm_geometry$Vector2d$crossProduct, firstVector, secondVector);
};
var ianmackenzie$elm_geometry$Geometry$Types$Triangle2d = elm$core$Basics$identity;
var ianmackenzie$elm_geometry$Triangle2d$fromVertices = elm$core$Basics$identity;
var ianmackenzie$elm_geometry$Polygon2d$counterclockwiseArea = function (vertices_) {
	if (!vertices_.b) {
		return 0;
	} else {
		if (!vertices_.b.b) {
			var single = vertices_.a;
			return 0;
		} else {
			if (!vertices_.b.b.b) {
				var first = vertices_.a;
				var _n1 = vertices_.b;
				var second = _n1.a;
				return 0;
			} else {
				var first = vertices_.a;
				var _n2 = vertices_.b;
				var second = _n2.a;
				var rest = _n2.b;
				var segmentArea = F2(
					function (start, end) {
						return ianmackenzie$elm_geometry$Triangle2d$counterclockwiseArea(
							ianmackenzie$elm_geometry$Triangle2d$fromVertices(
								_Utils_Tuple3(first, start, end)));
					});
				var segmentAreas = A3(
					elm$core$List$map2,
					segmentArea,
					A2(elm$core$List$cons, second, rest),
					rest);
				return elm$core$List$sum(segmentAreas);
			}
		}
	}
};
var ianmackenzie$elm_geometry$Polygon2d$makeOuterLoop = function (vertices_) {
	return (ianmackenzie$elm_geometry$Polygon2d$counterclockwiseArea(vertices_) >= 0) ? vertices_ : elm$core$List$reverse(vertices_);
};
var ianmackenzie$elm_geometry$Polygon2d$singleLoop = function (vertices_) {
	return {
		a$: _List_Nil,
		a6: ianmackenzie$elm_geometry$Polygon2d$makeOuterLoop(vertices_)
	};
};
var ianmackenzie$elm_geometry$Polygon2d$convexHull = function (points) {
	var sorted = A2(elm$core$List$sortBy, ianmackenzie$elm_geometry$Point2d$coordinates, points);
	var upper = ianmackenzie$elm_geometry$Polygon2d$chain(
		elm$core$List$reverse(sorted));
	var lower = ianmackenzie$elm_geometry$Polygon2d$chain(sorted);
	return ianmackenzie$elm_geometry$Polygon2d$singleLoop(
		_Utils_ap(lower, upper));
};
var ianmackenzie$elm_geometry$Polygon2d$innerLoops = function (_n0) {
	var polygon = _n0;
	return polygon.a$;
};
var ianmackenzie$elm_geometry$Polygon2d$outerLoop = function (_n0) {
	var polygon = _n0;
	return polygon.a6;
};
var ianmackenzie$elm_geometry_svg$Geometry$Svg$polygon2d = F2(
	function (attributes, polygon) {
		var loops = A2(
			elm$core$List$cons,
			ianmackenzie$elm_geometry$Polygon2d$outerLoop(polygon),
			ianmackenzie$elm_geometry$Polygon2d$innerLoops(polygon));
		var loopString = function (loop) {
			if (!loop.b) {
				return '';
			} else {
				var coordinateStrings = A2(
					elm$core$List$map,
					function (point) {
						var _n1 = ianmackenzie$elm_geometry$Point2d$coordinates(point);
						var x = _n1.a;
						var y = _n1.b;
						var xString = elm$core$String$fromFloat(x);
						var yString = elm$core$String$fromFloat(y);
						return xString + (' ' + yString);
					},
					loop);
				return 'M ' + (A2(elm$core$String$join, ' L ', coordinateStrings) + ' Z');
			}
		};
		var pathAttribute = elm$svg$Svg$Attributes$d(
			A2(
				elm$core$String$join,
				' ',
				A2(elm$core$List$map, loopString, loops)));
		return A2(
			elm$svg$Svg$path,
			A2(elm$core$List$cons, pathAttribute, attributes),
			_List_Nil);
	});
var author$project$Main$viewHulls = function (user) {
	var hull = function (positions) {
		return A2(
			ianmackenzie$elm_geometry_svg$Geometry$Svg$polygon2d,
			_List_fromArray(
				[
					elm$svg$Svg$Attributes$fill('lightGray'),
					elm$svg$Svg$Attributes$opacity('0.3'),
					elm$svg$Svg$Attributes$stroke('lightGray'),
					elm$svg$Svg$Attributes$strokeWidth('50'),
					elm$svg$Svg$Attributes$strokeLinejoin('round')
				]),
			ianmackenzie$elm_geometry$Polygon2d$convexHull(positions));
	};
	var hulls = A2(
		elm$core$List$map,
		function (_n2) {
			var l = _n2.b;
			return hull(
				A2(
					elm$core$List$map,
					A2(
						elm$core$Basics$composeR,
						elm$core$Tuple$second,
						function ($) {
							return $.I;
						}),
					l));
		},
		elm$core$Dict$values(
			A2(
				elm$core$Dict$filter,
				F2(
					function (_n0, _n1) {
						var bP = _n1.a;
						return bP.bU;
					}),
				author$project$User$getBagsWithVertices(user))));
	return A2(elm$svg$Svg$g, _List_Nil, hulls);
};
var author$project$Main$MouseDownOnVertex = function (a) {
	return {$: 27, a: a};
};
var author$project$Main$MouseOutVertex = function (a) {
	return {$: 24, a: a};
};
var author$project$Main$MouseOverVertex = function (a) {
	return {$: 23, a: a};
};
var author$project$Main$MouseUpOnVertex = function (a) {
	return {$: 28, a: a};
};
var elm$svg$Svg$Attributes$transform = _VirtualDom_attribute('transform');
var elm$svg$Svg$circle = elm$svg$Svg$trustedNode('circle');
var elm$svg$Svg$Attributes$cx = _VirtualDom_attribute('cx');
var elm$svg$Svg$Attributes$cy = _VirtualDom_attribute('cy');
var elm$svg$Svg$Attributes$r = _VirtualDom_attribute('r');
var ianmackenzie$elm_geometry_svg$Geometry$Svg$circle2d = F2(
	function (attributes, circle) {
		var r = elm$svg$Svg$Attributes$r(
			elm$core$String$fromFloat(
				ianmackenzie$elm_geometry$Circle2d$radius(circle)));
		var _n0 = ianmackenzie$elm_geometry$Point2d$coordinates(
			ianmackenzie$elm_geometry$Circle2d$centerPoint(circle));
		var x = _n0.a;
		var y = _n0.b;
		var cx = elm$svg$Svg$Attributes$cx(
			elm$core$String$fromFloat(x));
		var cy = elm$svg$Svg$Attributes$cy(
			elm$core$String$fromFloat(y));
		return A2(
			elm$svg$Svg$circle,
			A2(
				elm$core$List$cons,
				cx,
				A2(
					elm$core$List$cons,
					cy,
					A2(elm$core$List$cons, r, attributes))),
			_List_Nil);
	});
var author$project$Main$viewVertices = function (user) {
	var pin = F2(
		function (fixed, radius) {
			return fixed ? A2(
				ianmackenzie$elm_geometry_svg$Geometry$Svg$circle2d,
				_List_fromArray(
					[
						elm$svg$Svg$Attributes$fill('red'),
						elm$svg$Svg$Attributes$stroke('white')
					]),
				A2(ianmackenzie$elm_geometry$Circle2d$withRadius, radius / 2, ianmackenzie$elm_geometry$Point2d$origin)) : author$project$Main$emptySvgElement;
		});
	var drawVertex = function (_n2) {
		var id = _n2.a_;
		var label = _n2.O;
		var _n0 = label;
		var position = _n0.I;
		var color = _n0.ae;
		var radius = _n0.a8;
		var fixed = _n0.bT;
		var _n1 = ianmackenzie$elm_geometry$Point2d$coordinates(position);
		var x = _n1.a;
		var y = _n1.b;
		return A2(
			elm$svg$Svg$g,
			_List_fromArray(
				[
					elm$svg$Svg$Attributes$transform(
					'translate(' + (elm$core$String$fromFloat(x) + (',' + (elm$core$String$fromFloat(y) + ')')))),
					elm$svg$Svg$Events$onMouseDown(
					author$project$Main$MouseDownOnVertex(id)),
					elm$svg$Svg$Events$onMouseUp(
					author$project$Main$MouseUpOnVertex(id)),
					elm$svg$Svg$Events$onMouseOver(
					author$project$Main$MouseOverVertex(id)),
					elm$svg$Svg$Events$onMouseOut(
					author$project$Main$MouseOutVertex(id))
				]),
			_List_fromArray(
				[
					A2(
					ianmackenzie$elm_geometry_svg$Geometry$Svg$circle2d,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$fill(color)
						]),
					A2(ianmackenzie$elm_geometry$Circle2d$withRadius, radius, ianmackenzie$elm_geometry$Point2d$origin)),
					A2(pin, fixed, radius)
				]));
	};
	return A2(
		elm$svg$Svg$g,
		_List_Nil,
		A2(
			elm$core$List$map,
			drawVertex,
			author$project$User$getVertices(user)));
};
var author$project$Main$wheelDeltaY = A2(elm$json$Json$Decode$field, 'deltaY', elm$json$Json$Decode$int);
var ianmackenzie$elm_geometry$BoundingBox2d$aggregate = function (boundingBoxes) {
	if (boundingBoxes.b) {
		var first = boundingBoxes.a;
		var rest = boundingBoxes.b;
		return elm$core$Maybe$Just(
			A3(elm$core$List$foldl, ianmackenzie$elm_geometry$BoundingBox2d$hull, first, rest));
	} else {
		return elm$core$Maybe$Nothing;
	}
};
var author$project$User$getBoundingBoxWithMargin = F2(
	function (s, user) {
		var makeBb = function (_n0) {
			var position = _n0.I;
			var radius = _n0.a8;
			return ianmackenzie$elm_geometry$Circle2d$boundingBox(
				A2(ianmackenzie$elm_geometry$Circle2d$withRadius, radius + 4, position));
		};
		var vertexBb = function (id) {
			return A2(
				elm$core$Maybe$map,
				makeBb,
				A2(author$project$User$getVertexProperties, id, user));
		};
		var boundingBoxesOfvertices = A2(
			elm$core$List$filterMap,
			vertexBb,
			elm$core$Set$toList(s));
		return ianmackenzie$elm_geometry$BoundingBox2d$aggregate(boundingBoxesOfvertices);
	});
var author$project$User$getDefaultEdgeProperties = function (_n0) {
	var defaultEdgeProperties = _n0.bo;
	return defaultEdgeProperties;
};
var elm$core$List$intersperse = F2(
	function (sep, xs) {
		if (!xs.b) {
			return _List_Nil;
		} else {
			var hd = xs.a;
			var tl = xs.b;
			var step = F2(
				function (x, rest) {
					return A2(
						elm$core$List$cons,
						sep,
						A2(elm$core$List$cons, x, rest));
				});
			var spersed = A3(elm$core$List$foldr, step, _List_Nil, tl);
			return A2(elm$core$List$cons, hd, spersed);
		}
	});
var elm$html$Html$Events$onMouseDown = function (msg) {
	return A2(
		elm$html$Html$Events$on,
		'mousedown',
		elm$json$Json$Decode$succeed(msg));
};
var elm$html$Html$Events$onMouseUp = function (msg) {
	return A2(
		elm$html$Html$Events$on,
		'mouseup',
		elm$json$Json$Decode$succeed(msg));
};
var elm$svg$Svg$line = elm$svg$Svg$trustedNode('line');
var elm$svg$Svg$rect = elm$svg$Svg$trustedNode('rect');
var elm$svg$Svg$text = elm$virtual_dom$VirtualDom$text;
var elm$svg$Svg$text_ = elm$svg$Svg$trustedNode('text');
var elm$svg$Svg$Attributes$fillOpacity = _VirtualDom_attribute('fill-opacity');
var elm$svg$Svg$Attributes$fontSize = _VirtualDom_attribute('font-size');
var elm$svg$Svg$Attributes$strokeDasharray = _VirtualDom_attribute('stroke-dasharray');
var elm$svg$Svg$Attributes$textAnchor = _VirtualDom_attribute('text-anchor');
var elm$svg$Svg$Attributes$x = _VirtualDom_attribute('x');
var elm$svg$Svg$Attributes$x1 = _VirtualDom_attribute('x1');
var elm$svg$Svg$Attributes$x2 = _VirtualDom_attribute('x2');
var elm$svg$Svg$Attributes$y = _VirtualDom_attribute('y');
var elm$svg$Svg$Attributes$y1 = _VirtualDom_attribute('y1');
var elm$svg$Svg$Attributes$y2 = _VirtualDom_attribute('y2');
var ianmackenzie$elm_geometry_svg$Geometry$Svg$boundingBox2d = F2(
	function (attributes, boundingBox) {
		var _n0 = ianmackenzie$elm_geometry$BoundingBox2d$extrema(boundingBox);
		var minX = _n0.a3;
		var minY = _n0.a4;
		var maxX = _n0.a1;
		var maxY = _n0.a2;
		var width = elm$svg$Svg$Attributes$width(
			elm$core$String$fromFloat(maxX - minX));
		var x = elm$svg$Svg$Attributes$x(
			elm$core$String$fromFloat(minX));
		var height = elm$svg$Svg$Attributes$height(
			elm$core$String$fromFloat(maxY - minY));
		var y = elm$svg$Svg$Attributes$y(
			elm$core$String$fromFloat(minY));
		return A2(
			elm$svg$Svg$rect,
			A2(
				elm$core$List$cons,
				x,
				A2(
					elm$core$List$cons,
					y,
					A2(
						elm$core$List$cons,
						width,
						A2(elm$core$List$cons, height, attributes)))),
			_List_Nil);
	});
var author$project$Main$mainSvg = function (m) {
	var transparentInteractionRect = A2(
		elm$svg$Svg$rect,
		_List_fromArray(
			[
				elm$svg$Svg$Attributes$fillOpacity('0'),
				elm$svg$Svg$Attributes$x(
				elm$core$String$fromFloat(
					ianmackenzie$elm_geometry$Point2d$xCoordinate(m.z))),
				elm$svg$Svg$Attributes$y(
				elm$core$String$fromFloat(
					ianmackenzie$elm_geometry$Point2d$yCoordinate(m.z))),
				elm$svg$Svg$Attributes$width(
				elm$core$String$fromFloat(m.ad.aF / m.f4)),
				elm$svg$Svg$Attributes$height(
				elm$core$String$fromFloat(m.ad.aJ / m.f4)),
				elm$html$Html$Events$onMouseDown(author$project$Main$MouseDownOnTransparentInteractionRect),
				elm$html$Html$Events$onMouseUp(author$project$Main$MouseUpOnTransparentInteractionRect)
			]),
		_List_Nil);
	var maybeRectAroundSelectedVertices = function () {
		var rect = function (selectedVertices) {
			var maybeBoudingBox = A2(author$project$User$getBoundingBoxWithMargin, selectedVertices, m.a);
			if (!maybeBoudingBox.$) {
				var bB = maybeBoudingBox.a;
				return A2(
					ianmackenzie$elm_geometry_svg$Geometry$Svg$boundingBox2d,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$strokeWidth('1'),
							elm$svg$Svg$Attributes$stroke('rgb(40,127,230)'),
							elm$svg$Svg$Attributes$fill('none')
						]),
					bB);
			} else {
				return author$project$Main$emptySvgElement;
			}
		};
		var _n16 = m.e;
		if (_n16.$ === 2) {
			var vertexSelectorState = _n16.a;
			if (vertexSelectorState.$ === 1) {
				return author$project$Main$emptySvgElement;
			} else {
				return rect(m.f);
			}
		} else {
			return author$project$Main$emptySvgElement;
		}
	}();
	var maybeHighlightsOnSelectedVertices = function () {
		var drawHL = function (_n15) {
			var position = _n15.I;
			var radius = _n15.a8;
			return A2(
				ianmackenzie$elm_geometry_svg$Geometry$Svg$circle2d,
				_List_fromArray(
					[
						elm$svg$Svg$Attributes$fill(author$project$Colors$colorHighlightForSelection)
					]),
				A2(ianmackenzie$elm_geometry$Circle2d$withRadius, radius + 4, position));
		};
		return A2(
			elm$svg$Svg$g,
			_List_Nil,
			A2(
				elm$core$List$map,
				A2(
					elm$core$Basics$composeR,
					function ($) {
						return $.O;
					},
					drawHL),
				A2(
					elm$core$List$filter,
					function (_n14) {
						var id = _n14.a_;
						return A2(elm$core$Set$member, id, m.f);
					},
					author$project$User$getVertices(m.a))));
	}();
	var maybeHighlightsOnSelectedEdges = function () {
		var drawHL = function (_n13) {
			var from = _n13.aZ;
			var to = _n13.bg;
			var label = _n13.O;
			var _n12 = _Utils_Tuple2(
				A2(author$project$User$getVertexProperties, from, m.a),
				A2(author$project$User$getVertexProperties, to, m.a));
			if ((!_n12.a.$) && (!_n12.b.$)) {
				var v = _n12.a.a;
				var w = _n12.b.a;
				return A2(
					ianmackenzie$elm_geometry_svg$Geometry$Svg$lineSegment2d,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$stroke(author$project$Colors$colorHighlightForSelection),
							elm$svg$Svg$Attributes$strokeWidth(
							elm$core$String$fromFloat(label.aC + 6))
						]),
					A2(ianmackenzie$elm_geometry$LineSegment2d$from, v.I, w.I));
			} else {
				return author$project$Main$emptySvgElement;
			}
		};
		return A2(
			elm$svg$Svg$g,
			_List_Nil,
			A2(
				elm$core$List$map,
				drawHL,
				A2(
					elm$core$List$filter,
					function (_n11) {
						var from = _n11.aZ;
						var to = _n11.bg;
						return A2(
							elm$core$Set$member,
							_Utils_Tuple2(from, to),
							m.d);
					},
					author$project$User$getEdges(m.a))));
	}();
	var maybeHighlightOnMouseOveredVertices = function () {
		var drawHL = function (_n10) {
			var position = _n10.I;
			var radius = _n10.a8;
			return A2(
				ianmackenzie$elm_geometry_svg$Geometry$Svg$circle2d,
				_List_fromArray(
					[
						elm$svg$Svg$Attributes$fill(author$project$Colors$highlightColorForMouseOver)
					]),
				A2(ianmackenzie$elm_geometry$Circle2d$withRadius, radius + 4, position));
		};
		return A2(
			elm$svg$Svg$g,
			_List_Nil,
			A2(
				elm$core$List$map,
				A2(
					elm$core$Basics$composeR,
					function ($) {
						return $.O;
					},
					drawHL),
				A2(
					elm$core$List$filter,
					function (_n9) {
						var id = _n9.a_;
						return A2(elm$core$Set$member, id, m.R);
					},
					author$project$User$getVertices(m.a))));
	}();
	var maybeHighlightOnMouseOveredEdges = function () {
		var drawHL = function (_n8) {
			var from = _n8.aZ;
			var to = _n8.bg;
			var label = _n8.O;
			var _n7 = _Utils_Tuple2(
				A2(author$project$User$getVertexProperties, from, m.a),
				A2(author$project$User$getVertexProperties, to, m.a));
			if ((!_n7.a.$) && (!_n7.b.$)) {
				var v = _n7.a.a;
				var w = _n7.b.a;
				return A2(
					ianmackenzie$elm_geometry_svg$Geometry$Svg$lineSegment2d,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$stroke(author$project$Colors$highlightColorForMouseOver),
							elm$svg$Svg$Attributes$strokeWidth(
							elm$core$String$fromFloat(label.aC + 6))
						]),
					A2(ianmackenzie$elm_geometry$LineSegment2d$from, v.I, w.I));
			} else {
				return author$project$Main$emptySvgElement;
			}
		};
		return A2(
			elm$svg$Svg$g,
			_List_Nil,
			A2(
				elm$core$List$map,
				drawHL,
				A2(
					elm$core$List$filter,
					function (_n6) {
						var from = _n6.aZ;
						var to = _n6.bg;
						return A2(
							elm$core$Set$member,
							_Utils_Tuple2(from, to),
							m.E);
					},
					author$project$User$getEdges(m.a))));
	}();
	var maybeBrushedSelector = function () {
		var _n4 = m.e;
		if ((_n4.$ === 2) && (_n4.a.$ === 1)) {
			var brushStart = _n4.a.a.ar;
			var _n5 = m.aA;
			if (!_n5) {
				return A2(
					ianmackenzie$elm_geometry_svg$Geometry$Svg$boundingBox2d,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$stroke('rgb(127,127,127)'),
							elm$svg$Svg$Attributes$strokeWidth('1'),
							elm$svg$Svg$Attributes$strokeDasharray('1 2'),
							elm$svg$Svg$Attributes$fill('none')
						]),
					A2(ianmackenzie$elm_geometry$BoundingBox2d$from, brushStart, m.r));
			} else {
				return A2(
					ianmackenzie$elm_geometry_svg$Geometry$Svg$lineSegment2d,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$stroke('rgb(127,127,127)'),
							elm$svg$Svg$Attributes$strokeWidth('1'),
							elm$svg$Svg$Attributes$strokeDasharray('1 2')
						]),
					A2(ianmackenzie$elm_geometry$LineSegment2d$from, brushStart, m.r));
			}
		} else {
			return author$project$Main$emptySvgElement;
		}
	}();
	var maybeBrushedEdge = function () {
		var _n2 = m.e;
		if ((_n2.$ === 1) && (_n2.a.$ === 1)) {
			var sourceId = _n2.a.a;
			var _n3 = A2(author$project$User$getVertexProperties, sourceId, m.a);
			if (!_n3.$) {
				var position = _n3.a.I;
				var dEP = author$project$User$getDefaultEdgeProperties(m.a);
				return A2(
					ianmackenzie$elm_geometry_svg$Geometry$Svg$lineSegment2d,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$strokeWidth(
							elm$core$String$fromFloat(dEP.aC)),
							elm$svg$Svg$Attributes$stroke(dEP.ae)
						]),
					A2(ianmackenzie$elm_geometry$LineSegment2d$from, position, m.r));
			} else {
				return author$project$Main$emptySvgElement;
			}
		} else {
			return author$project$Main$emptySvgElement;
		}
	}();
	var fromPanAndZoom = F2(
		function (pan, zoom) {
			return elm$core$String$concat(
				A2(
					elm$core$List$intersperse,
					' ',
					A2(
						elm$core$List$map,
						elm$core$String$fromFloat,
						_List_fromArray(
							[
								ianmackenzie$elm_geometry$Point2d$xCoordinate(m.z),
								ianmackenzie$elm_geometry$Point2d$yCoordinate(m.z),
								m.ad.aF / zoom,
								m.ad.aJ / zoom
							]))));
		});
	var cursor = function () {
		var _n0 = m.e;
		switch (_n0.$) {
			case 0:
				if (!_n0.a.$) {
					var _n1 = _n0.a;
					return 'grab';
				} else {
					return 'grabbing';
				}
			case 1:
				return 'crosshair';
			default:
				return 'default';
		}
	}();
	var backgroundPageWidth = 600;
	var a4HeightByWidth = 297 / 210;
	var pageA4WithRuler = A2(
		elm$svg$Svg$g,
		_List_Nil,
		_List_fromArray(
			[
				A2(
				elm$svg$Svg$rect,
				_List_fromArray(
					[
						elm$svg$Svg$Attributes$x('0'),
						elm$svg$Svg$Attributes$y('0'),
						elm$svg$Svg$Attributes$width(
						elm$core$String$fromFloat(backgroundPageWidth)),
						elm$svg$Svg$Attributes$height(
						elm$core$String$fromFloat(backgroundPageWidth * a4HeightByWidth)),
						elm$svg$Svg$Attributes$stroke('rgb(83, 83, 83)'),
						elm$svg$Svg$Attributes$fill('none'),
						elm$svg$Svg$Attributes$strokeWidth(
						elm$core$String$fromFloat(1 / m.f4))
					]),
				_List_Nil),
				A2(
				elm$svg$Svg$line,
				_List_fromArray(
					[
						elm$svg$Svg$Attributes$x1('100'),
						elm$svg$Svg$Attributes$y1('0'),
						elm$svg$Svg$Attributes$x2('100'),
						elm$svg$Svg$Attributes$y2(
						elm$core$String$fromFloat((-5) / m.f4)),
						elm$svg$Svg$Attributes$stroke('rgb(83, 83, 83)'),
						elm$svg$Svg$Attributes$strokeWidth(
						elm$core$String$fromFloat(1 / m.f4))
					]),
				_List_Nil),
				A2(
				elm$svg$Svg$text_,
				_List_fromArray(
					[
						elm$svg$Svg$Attributes$x('100'),
						elm$svg$Svg$Attributes$y(
						elm$core$String$fromFloat((-24) / m.f4)),
						elm$svg$Svg$Attributes$fill('rgb(83, 83, 83)'),
						elm$svg$Svg$Attributes$textAnchor('middle'),
						elm$svg$Svg$Attributes$fontSize(
						elm$core$String$fromFloat(12 / m.f4))
					]),
				_List_fromArray(
					[
						elm$svg$Svg$text(
						elm$core$String$fromInt(
							elm$core$Basics$round(100 * m.f4)) + '%')
					])),
				A2(
				elm$svg$Svg$text_,
				_List_fromArray(
					[
						elm$svg$Svg$Attributes$x('100'),
						elm$svg$Svg$Attributes$y(
						elm$core$String$fromFloat((-10) / m.f4)),
						elm$svg$Svg$Attributes$fill('rgb(83, 83, 83)'),
						elm$svg$Svg$Attributes$textAnchor('middle'),
						elm$svg$Svg$Attributes$fontSize(
						elm$core$String$fromFloat(12 / m.f4))
					]),
				_List_fromArray(
					[
						elm$svg$Svg$text('100px')
					]))
			]));
	return A2(
		elm$svg$Svg$svg,
		_List_fromArray(
			[
				A2(elm$html$Html$Attributes$style, 'background-color', 'rgb(46, 46, 46)'),
				A2(elm$html$Html$Attributes$style, 'cursor', cursor),
				A2(elm$html$Html$Attributes$style, 'position', 'absolute'),
				elm$svg$Svg$Attributes$width(
				elm$core$String$fromInt(m.ad.aF)),
				elm$svg$Svg$Attributes$height(
				elm$core$String$fromInt(m.ad.aJ)),
				elm$svg$Svg$Attributes$viewBox(
				A2(fromPanAndZoom, m.z, m.f4)),
				elm$svg$Svg$Events$onMouseDown(author$project$Main$MouseDownOnMainSvg),
				A2(
				elm$html$Html$Events$on,
				'wheel',
				A2(elm$json$Json$Decode$map, author$project$Main$WheelDeltaY, author$project$Main$wheelDeltaY))
			]),
		_List_fromArray(
			[
				pageA4WithRuler,
				author$project$Main$viewHulls(m.a),
				maybeBrushedEdge,
				transparentInteractionRect,
				maybeHighlightsOnSelectedEdges,
				maybeHighlightOnMouseOveredEdges,
				maybeHighlightsOnSelectedVertices,
				maybeHighlightOnMouseOveredVertices,
				author$project$Main$viewEdges(m.a),
				author$project$Main$viewVertices(m.a),
				maybeBrushedSelector,
				maybeRectAroundSelectedVertices
			]));
};
var elm$core$Char$fromCode = _Char_fromCode;
var elm$core$String$cons = _String_cons;
var elm$core$String$fromChar = function (_char) {
	return A2(elm$core$String$cons, _char, '');
};
var author$project$CheckBox$view = function (maybeChecked) {
	var _n0 = function () {
		if (!maybeChecked.$) {
			if (maybeChecked.a) {
				return _Utils_Tuple2(
					elm$core$String$fromChar(
						elm$core$Char$fromCode(10004)),
					false);
			} else {
				return _Utils_Tuple2(
					elm$core$String$fromChar(
						elm$core$Char$fromCode(0)),
					true);
			}
		} else {
			return _Utils_Tuple2('?', true);
		}
	}();
	var t = _n0.a;
	var msg = _n0.b;
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				A2(elm$html$Html$Attributes$style, 'border-radius', '2px'),
				A2(elm$html$Html$Attributes$style, 'background-color', '#454545'),
				A2(elm$html$Html$Attributes$style, 'padding', '2px'),
				A2(elm$html$Html$Attributes$style, 'padding-left', '6px'),
				A2(elm$html$Html$Attributes$style, 'width', '11px'),
				A2(elm$html$Html$Attributes$style, 'height', '15px'),
				elm$html$Html$Events$onClick(msg)
			]),
		_List_fromArray(
			[
				elm$html$Html$text(t)
			]));
};
var author$project$Main$CheckBoxConvexHull = function (a) {
	return {$: 36, a: a};
};
var author$project$Main$headerForBagProperties = function (m) {
	var _n0 = m.S;
	if (_n0.$ === 1) {
		return 'Bag Preferences';
	} else {
		var bagId = _n0.a;
		return 'Selected Bag';
	}
};
var elm$html$Html$label = _VirtualDom_node('label');
var author$project$Main$input = F2(
	function (label, inputField) {
		return A2(
			elm$html$Html$div,
			_List_Nil,
			_List_fromArray(
				[
					A2(
					elm$html$Html$label,
					_List_fromArray(
						[
							A2(elm$html$Html$Attributes$style, 'width', '80px'),
							A2(elm$html$Html$Attributes$style, 'padding-right', '8px'),
							A2(elm$html$Html$Attributes$style, 'vertical-align', 'middle'),
							A2(elm$html$Html$Attributes$style, 'display', 'inline-block'),
							A2(elm$html$Html$Attributes$style, 'text-align', 'right')
						]),
					_List_fromArray(
						[
							elm$html$Html$text(label)
						])),
					A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							A2(elm$html$Html$Attributes$style, 'display', 'inline-block')
						]),
					_List_fromArray(
						[inputField]))
				]));
	});
var author$project$Main$lineWithColumns = F2(
	function (columnSize, columns) {
		var item = function (content) {
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						A2(elm$html$Html$Attributes$style, 'display', 'inline-block'),
						A2(
						elm$html$Html$Attributes$style,
						'width',
						elm$core$String$fromInt(columnSize) + 'px')
					]),
				_List_fromArray(
					[content]));
		};
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					A2(elm$html$Html$Attributes$style, 'margin-bottom', '10px'),
					A2(elm$html$Html$Attributes$style, 'display', 'block')
				]),
			A2(elm$core$List$map, item, columns));
	});
var author$project$Main$subMenu = F2(
	function (header, rest) {
		return A2(
			elm$html$Html$div,
			_List_fromArray(
				[
					elm$html$Html$Attributes$class('right-bar-submenu')
				]),
			A2(
				elm$core$List$cons,
				A2(
					elm$html$Html$div,
					_List_fromArray(
						[
							A2(elm$html$Html$Attributes$style, 'margin-bottom', '20px')
						]),
					_List_fromArray(
						[
							A2(
							elm$html$Html$div,
							_List_fromArray(
								[
									elm$html$Html$Attributes$class('right-bar-submenu-header')
								]),
							_List_fromArray(
								[
									elm$html$Html$text(header)
								]))
						])),
				rest));
	});
var author$project$User$getBagProperties = F2(
	function (bagId, _n0) {
		var bags = _n0.aq;
		return A2(elm$core$Dict$get, bagId, bags);
	});
var author$project$User$getDefaultBagProperties = function (_n0) {
	var defaultBagProperties = _n0.bn;
	return defaultBagProperties;
};
var elm$virtual_dom$VirtualDom$map = _VirtualDom_map;
var elm$html$Html$map = elm$virtual_dom$VirtualDom$map;
var author$project$Main$bagProperties = function (m) {
	return A2(
		author$project$Main$subMenu,
		author$project$Main$headerForBagProperties(m),
		_List_fromArray(
			[
				A2(
				author$project$Main$lineWithColumns,
				140,
				_List_fromArray(
					[
						A2(
						author$project$Main$input,
						'Convex Hull',
						A2(
							elm$html$Html$map,
							author$project$Main$CheckBoxConvexHull,
							author$project$CheckBox$view(
								function () {
									var _n0 = m.S;
									if (!_n0.$) {
										var bagId = _n0.a;
										var _n1 = A2(author$project$User$getBagProperties, bagId, m.a);
										if (!_n1.$) {
											var bag = _n1.a;
											return elm$core$Maybe$Just(bag.bU);
										} else {
											return elm$core$Maybe$Nothing;
										}
									} else {
										return elm$core$Maybe$Just(
											author$project$User$getDefaultBagProperties(m.a).bU);
									}
								}())))
					]))
			]));
};
var author$project$Colors$vertexAndEdgeColors = _List_fromArray(
	['black', 'white', 'lightgray', 'darkgray', 'gray', 'rgb(199, 0, 57)', 'rgb(144, 12, 63)', 'rgb(81, 24, 73)', 'rgb(61, 61, 106)', 'rgb(42, 123, 154)', 'rgb(0, 187, 173)', 'rgb(86, 199, 133)', 'rgb(173, 213, 91)', 'rgb(237, 221, 83)', 'rgb(255, 195, 0)', 'rgb(255, 140, 26)', 'rgb(255, 87, 51)']);
var author$project$ColorPicker$colors = author$project$Colors$vertexAndEdgeColors;
var elm$html$Html$button = _VirtualDom_node('button');
var author$project$ColorPicker$view = function (maybeSelectedColor) {
	var dropbtn = function () {
		if (!maybeSelectedColor.$) {
			var color = maybeSelectedColor.a;
			return A2(
				elm$html$Html$button,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('color-picker-dropbtn')
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								A2(elm$html$Html$Attributes$style, 'background-color', color),
								A2(elm$html$Html$Attributes$style, 'width', '100%'),
								A2(elm$html$Html$Attributes$style, 'height', '100%')
							]),
						_List_Nil)
					]));
		} else {
			return A2(
				elm$html$Html$button,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('color-picker-dropbtn')
					]),
				_List_fromArray(
					[
						A2(
						elm$html$Html$div,
						_List_fromArray(
							[
								A2(elm$html$Html$Attributes$style, 'background-color', '#454545'),
								A2(elm$html$Html$Attributes$style, 'width', '100%'),
								A2(elm$html$Html$Attributes$style, 'height', '100%'),
								A2(elm$html$Html$Attributes$style, 'color', 'white')
							]),
						_List_fromArray(
							[
								elm$html$Html$text('?')
							]))
					]));
		}
	}();
	var colorBox = function (color2) {
		return A2(
			elm$html$Html$a,
			_List_fromArray(
				[
					A2(elm$html$Html$Attributes$style, 'background-color', color2),
					elm$html$Html$Events$onClick(color2)
				]),
			_List_Nil);
	};
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$class('color-picker-dropdown')
			]),
		_List_fromArray(
			[
				dropbtn,
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('color-picker-dropdown-content')
					]),
				A2(elm$core$List$map, colorBox, author$project$ColorPicker$colors))
			]));
};
var author$project$Main$ColorPickerEdge = function (a) {
	return {$: 51, a: a};
};
var author$project$Main$NumberInputDistance = function (a) {
	return {$: 53, a: a};
};
var author$project$Main$NumberInputEdgeStrength = function (a) {
	return {$: 54, a: a};
};
var author$project$Main$NumberInputThickness = function (a) {
	return {$: 52, a: a};
};
var elm$html$Html$input = _VirtualDom_node('input');
var elm$html$Html$Attributes$type_ = elm$html$Html$Attributes$stringProperty('type');
var author$project$Main$numberInput = function (attributes) {
	return A2(
		elm$html$Html$input,
		_Utils_ap(
			_List_fromArray(
				[
					A2(elm$html$Html$Attributes$style, 'width', '40px'),
					A2(elm$html$Html$Attributes$style, 'padding-left', '4px'),
					A2(elm$html$Html$Attributes$style, 'padding-top', '4px'),
					A2(elm$html$Html$Attributes$style, 'padding-bottom', '4px'),
					elm$html$Html$Attributes$type_('number')
				]),
			attributes),
		_List_Nil);
};
var author$project$Graph$Extra$deleteDuplicates = function (xs) {
	if (xs.b) {
		var x = xs.a;
		var rest = xs.b;
		return A2(
			elm$core$List$cons,
			x,
			author$project$Graph$Extra$deleteDuplicates(
				A2(
					elm$core$List$filter,
					elm$core$Basics$neq(x),
					rest)));
	} else {
		return _List_Nil;
	}
};
var author$project$Graph$Extra$getCommonEdgeProperty = F3(
	function (vs, prop, graph) {
		var l = author$project$Graph$Extra$deleteDuplicates(
			A2(
				elm$core$List$filterMap,
				function (_n1) {
					var from = _n1.aZ;
					var to = _n1.bg;
					var label = _n1.O;
					return A2(
						elm$core$Set$member,
						_Utils_Tuple2(from, to),
						vs) ? elm$core$Maybe$Just(
						prop(label)) : elm$core$Maybe$Nothing;
				},
				elm_community$graph$Graph$edges(graph)));
		if (l.b && (!l.b.b)) {
			var unique = l.a;
			return elm$core$Maybe$Just(unique);
		} else {
			return elm$core$Maybe$Nothing;
		}
	});
var author$project$User$getCommonEdgeProperty = F3(
	function (vs, prop, _n0) {
		var graph = _n0.q;
		return A3(author$project$Graph$Extra$getCommonEdgeProperty, vs, prop, graph);
	});
var elm$html$Html$Attributes$max = elm$html$Html$Attributes$stringProperty('max');
var elm$html$Html$Attributes$min = elm$html$Html$Attributes$stringProperty('min');
var elm$html$Html$Attributes$step = function (n) {
	return A2(elm$html$Html$Attributes$stringProperty, 'step', n);
};
var elm$html$Html$Attributes$value = elm$html$Html$Attributes$stringProperty('value');
var elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 1, a: a};
};
var elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			elm$virtual_dom$VirtualDom$on,
			event,
			elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3(elm$core$List$foldr, elm$json$Json$Decode$field, decoder, fields);
	});
var elm$html$Html$Events$targetValue = A2(
	elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	elm$json$Json$Decode$string);
var elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			elm$json$Json$Decode$map,
			elm$html$Html$Events$alwaysStop,
			A2(elm$json$Json$Decode$map, tagger, elm$html$Html$Events$targetValue)));
};
var author$project$Main$edgeProperties = function (m) {
	var headerForEdgeProperties = function () {
		var _n3 = elm$core$Set$size(m.d);
		switch (_n3) {
			case 0:
				return 'Edge Preferences';
			case 1:
				return 'Selected Edge';
			default:
				return 'Selected Edges';
		}
	}();
	return A2(
		author$project$Main$subMenu,
		headerForEdgeProperties,
		_List_fromArray(
			[
				A2(
				author$project$Main$lineWithColumns,
				140,
				_List_fromArray(
					[
						A2(
						author$project$Main$input,
						'Color',
						A2(
							elm$html$Html$map,
							author$project$Main$ColorPickerEdge,
							author$project$ColorPicker$view(
								elm$core$Set$isEmpty(m.d) ? elm$core$Maybe$Just(
									author$project$User$getDefaultEdgeProperties(m.a).ae) : A3(
									author$project$User$getCommonEdgeProperty,
									m.d,
									function ($) {
										return $.ae;
									},
									m.a)))),
						A2(
						author$project$Main$input,
						'thickness',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$value(
									function () {
										if (elm$core$Set$isEmpty(m.d)) {
											return elm$core$String$fromFloat(
												author$project$User$getDefaultEdgeProperties(m.a).aC);
										} else {
											var _n0 = A3(
												author$project$User$getCommonEdgeProperty,
												m.d,
												function ($) {
													return $.aC;
												},
												m.a);
											if (!_n0.$) {
												var r = _n0.a;
												return elm$core$String$fromFloat(r);
											} else {
												return '';
											}
										}
									}()),
									elm$html$Html$Events$onInput(author$project$Main$NumberInputThickness),
									elm$html$Html$Attributes$min('1'),
									elm$html$Html$Attributes$max('20'),
									elm$html$Html$Attributes$step('1')
								])))
					])),
				A2(
				author$project$Main$lineWithColumns,
				140,
				_List_fromArray(
					[
						A2(
						author$project$Main$input,
						'distance',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$value(
									function () {
										if (elm$core$Set$isEmpty(m.d)) {
											return elm$core$String$fromFloat(
												author$project$User$getDefaultEdgeProperties(m.a).cj);
										} else {
											var _n1 = A3(
												author$project$User$getCommonEdgeProperty,
												m.d,
												function ($) {
													return $.cj;
												},
												m.a);
											if (!_n1.$) {
												var r = _n1.a;
												return elm$core$String$fromFloat(r);
											} else {
												return '';
											}
										}
									}()),
									elm$html$Html$Events$onInput(author$project$Main$NumberInputDistance),
									elm$html$Html$Attributes$min('0'),
									elm$html$Html$Attributes$max('2000'),
									elm$html$Html$Attributes$step('1')
								]))),
						A2(
						author$project$Main$input,
						'strength',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$value(
									function () {
										if (elm$core$Set$isEmpty(m.d)) {
											return elm$core$String$fromFloat(
												author$project$User$getDefaultEdgeProperties(m.a).dc);
										} else {
											var _n2 = A3(
												author$project$User$getCommonEdgeProperty,
												m.d,
												function ($) {
													return $.dc;
												},
												m.a);
											if (!_n2.$) {
												var r = _n2.a;
												return elm$core$String$fromFloat(r);
											} else {
												return '';
											}
										}
									}()),
									elm$html$Html$Events$onInput(author$project$Main$NumberInputEdgeStrength),
									elm$html$Html$Attributes$min('0'),
									elm$html$Html$Attributes$max('1'),
									elm$html$Html$Attributes$step('0.05')
								])))
					]))
			]));
};
var author$project$Main$rightBarWidth = 300;
var author$project$Main$ClickOnLineSelector = {$: 16};
var author$project$Main$ClickOnRectSelector = {$: 15};
var author$project$Main$selectionType = function (m) {
	var rectSelector = A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				A2(elm$html$Html$Attributes$style, 'float', 'left'),
				A2(elm$html$Html$Attributes$style, 'margin', '1px'),
				elm$html$Html$Attributes$title('Rectangle Selector'),
				elm$html$Html$Events$onClick(author$project$Main$ClickOnRectSelector),
				elm$html$Html$Attributes$class(
				function () {
					var _n1 = m.aA;
					if (!_n1) {
						return 'radio-button-selected';
					} else {
						return 'radio-button';
					}
				}())
			]),
		_List_fromArray(
			[
				author$project$Icons$draw24px(author$project$Icons$icons.fH)
			]));
	var lineSelector = A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				A2(elm$html$Html$Attributes$style, 'float', 'left'),
				A2(elm$html$Html$Attributes$style, 'margin', '1px'),
				elm$html$Html$Attributes$title('Line Selector'),
				elm$html$Html$Events$onClick(author$project$Main$ClickOnLineSelector),
				elm$html$Html$Attributes$class(
				function () {
					var _n0 = m.aA;
					if (_n0 === 1) {
						return 'radio-button-selected';
					} else {
						return 'radio-button';
					}
				}())
			]),
		_List_fromArray(
			[
				author$project$Icons$draw24px(author$project$Icons$icons.fG)
			]));
	return A2(
		author$project$Main$subMenu,
		'Selection',
		_List_fromArray(
			[
				A2(
				author$project$Main$lineWithColumns,
				280,
				_List_fromArray(
					[
						A2(
						author$project$Main$input,
						'Selector',
						A2(
							elm$html$Html$div,
							_List_fromArray(
								[
									A2(elm$html$Html$Attributes$style, 'vertical-align', 'middle'),
									A2(elm$html$Html$Attributes$style, 'display', 'inline-block')
								]),
							_List_fromArray(
								[
									A2(
									elm$html$Html$div,
									_List_fromArray(
										[
											elm$html$Html$Attributes$class('radio-button-group')
										]),
									_List_fromArray(
										[rectSelector, lineSelector]))
								])))
					]))
			]));
};
var author$project$Main$CheckBoxFixed = function (a) {
	return {$: 45, a: a};
};
var author$project$Main$ColorPickerVertex = function (a) {
	return {$: 43, a: a};
};
var author$project$Main$NumberInputRadius = function (a) {
	return {$: 44, a: a};
};
var author$project$Main$NumberInputVertexX = function (a) {
	return {$: 41, a: a};
};
var author$project$Main$NumberInputVertexY = function (a) {
	return {$: 42, a: a};
};
var author$project$Graph$Extra$getCommonNodeProperty = F3(
	function (vs, prop, graph) {
		var l = author$project$Graph$Extra$deleteDuplicates(
			A2(
				elm$core$List$filterMap,
				function (_n1) {
					var id = _n1.a_;
					var label = _n1.O;
					return A2(elm$core$Set$member, id, vs) ? elm$core$Maybe$Just(
						prop(label)) : elm$core$Maybe$Nothing;
				},
				elm_community$graph$Graph$nodes(graph)));
		if (l.b && (!l.b.b)) {
			var unique = l.a;
			return elm$core$Maybe$Just(unique);
		} else {
			return elm$core$Maybe$Nothing;
		}
	});
var author$project$User$getCommonVertexProperty = F3(
	function (vs, prop, _n0) {
		var graph = _n0.q;
		return A3(author$project$Graph$Extra$getCommonNodeProperty, vs, prop, graph);
	});
var author$project$User$getDefaultVertexProperties = function (_n0) {
	var defaultVertexProperties = _n0.aW;
	return defaultVertexProperties;
};
var author$project$Main$vertexProperties = function (m) {
	var headerForVertexProperties = function () {
		var _n1 = elm$core$Set$size(m.f);
		switch (_n1) {
			case 0:
				return 'Vertex Preferences';
			case 1:
				return 'Selected Vertex';
			default:
				return 'Selected Vertices';
		}
	}();
	return A2(
		author$project$Main$subMenu,
		headerForVertexProperties,
		_List_fromArray(
			[
				A2(
				author$project$Main$lineWithColumns,
				140,
				_List_fromArray(
					[
						A2(
						author$project$Main$input,
						'X',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$value(
									A2(
										elm$core$Maybe$withDefault,
										'',
										A2(
											elm$core$Maybe$map,
											elm$core$String$fromInt,
											A2(
												elm$core$Maybe$map,
												elm$core$Basics$round,
												A2(
													elm$core$Maybe$map,
													ianmackenzie$elm_geometry$Point2d$xCoordinate,
													A2(author$project$User$getCentroid, m.f, m.a)))))),
									elm$html$Html$Events$onInput(author$project$Main$NumberInputVertexX)
								]))),
						A2(
						author$project$Main$input,
						'Y',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$value(
									A2(
										elm$core$Maybe$withDefault,
										'',
										A2(
											elm$core$Maybe$map,
											elm$core$String$fromInt,
											A2(
												elm$core$Maybe$map,
												elm$core$Basics$round,
												A2(
													elm$core$Maybe$map,
													ianmackenzie$elm_geometry$Point2d$yCoordinate,
													A2(author$project$User$getCentroid, m.f, m.a)))))),
									elm$html$Html$Events$onInput(author$project$Main$NumberInputVertexY)
								])))
					])),
				A2(
				author$project$Main$lineWithColumns,
				140,
				_List_fromArray(
					[
						A2(
						author$project$Main$input,
						'Color',
						A2(
							elm$html$Html$map,
							author$project$Main$ColorPickerVertex,
							author$project$ColorPicker$view(
								elm$core$Set$isEmpty(m.f) ? elm$core$Maybe$Just(
									author$project$User$getDefaultVertexProperties(m.a).ae) : A3(
									author$project$User$getCommonVertexProperty,
									m.f,
									function ($) {
										return $.ae;
									},
									m.a)))),
						A2(
						author$project$Main$input,
						'Radius',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$min('4'),
									elm$html$Html$Attributes$max('20'),
									elm$html$Html$Attributes$step('1'),
									elm$html$Html$Attributes$value(
									function () {
										if (elm$core$Set$isEmpty(m.f)) {
											return elm$core$String$fromFloat(
												author$project$User$getDefaultVertexProperties(m.a).a8);
										} else {
											var _n0 = A3(
												author$project$User$getCommonVertexProperty,
												m.f,
												function ($) {
													return $.a8;
												},
												m.a);
											if (!_n0.$) {
												var r = _n0.a;
												return elm$core$String$fromFloat(r);
											} else {
												return '';
											}
										}
									}()),
									elm$html$Html$Events$onInput(author$project$Main$NumberInputRadius)
								])))
					])),
				A2(
				author$project$Main$lineWithColumns,
				140,
				_List_fromArray(
					[
						A2(
						author$project$Main$input,
						'Fixed',
						A2(
							elm$html$Html$map,
							author$project$Main$CheckBoxFixed,
							author$project$CheckBox$view(
								elm$core$Set$isEmpty(m.f) ? elm$core$Maybe$Just(
									author$project$User$getDefaultVertexProperties(m.a).bT) : A3(
									author$project$User$getCommonVertexProperty,
									m.f,
									function ($) {
										return $.bT;
									},
									m.a))))
					]))
			]));
};
var author$project$Main$rightBar = function (m) {
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$id('rightBar'),
				A2(elm$html$Html$Attributes$style, 'right', '0px'),
				A2(
				elm$html$Html$Attributes$style,
				'width',
				elm$core$String$fromInt(author$project$Main$rightBarWidth) + 'px'),
				A2(elm$html$Html$Attributes$style, 'height', '100%')
			]),
		_List_fromArray(
			[
				author$project$Main$selectionType(m),
				author$project$Main$bagProperties(m),
				author$project$Main$vertexProperties(m),
				author$project$Main$edgeProperties(m)
			]));
};
var author$project$Icons$draw34px = author$project$Icons$draw(34);
var author$project$Main$ClickOnHandTool = {$: 11};
var author$project$Main$toolSelectionButtonGroup = function (m) {
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$class('radio-button-group')
			]),
		_List_fromArray(
			[
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$title('Hand (H)'),
						elm$html$Html$Events$onClick(author$project$Main$ClickOnHandTool),
						elm$html$Html$Attributes$class(
						function () {
							var _n0 = m.e;
							if (!_n0.$) {
								return 'radio-button-selected';
							} else {
								return 'radio-button';
							}
						}())
					]),
				_List_fromArray(
					[
						author$project$Icons$draw34px(author$project$Icons$icons.e8)
					])),
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$title('Selection (S)'),
						elm$html$Html$Events$onClick(author$project$Main$ClickOnSelectTool),
						elm$html$Html$Attributes$class(
						function () {
							var _n1 = m.e;
							if (_n1.$ === 2) {
								return 'radio-button-selected';
							} else {
								return 'radio-button';
							}
						}())
					]),
				_List_fromArray(
					[
						author$project$Icons$draw34px(author$project$Icons$icons.fy)
					])),
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$title('Draw (D)'),
						elm$html$Html$Events$onClick(author$project$Main$ClickOnDrawTool),
						elm$html$Html$Attributes$class(
						function () {
							var _n2 = m.e;
							if (_n2.$ === 1) {
								return 'radio-button-selected';
							} else {
								return 'radio-button';
							}
						}())
					]),
				_List_fromArray(
					[
						author$project$Icons$draw34px(author$project$Icons$icons.fw)
					]))
			]));
};
var author$project$Main$vaderAsRadioButton = function (m) {
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$class('radio-button-group')
			]),
		_List_fromArray(
			[
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$title('Force (F)'),
						elm$html$Html$Attributes$class(
						m.aP ? 'radio-button-selected' : 'radio-button'),
						elm$html$Html$Events$onClick(author$project$Main$ClickOnVader)
					]),
				_List_fromArray(
					[
						author$project$Icons$draw34px(author$project$Icons$icons.fY)
					]))
			]));
};
var author$project$Main$ClickOnResetZoomAndPanButton = {$: 10};
var author$project$Main$zoomAndItsButtons = function (m) {
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$class('button-group')
			]),
		_List_fromArray(
			[
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$title('Reset Zoom and Pan'),
						elm$html$Html$Events$onClick(author$project$Main$ClickOnResetZoomAndPanButton),
						elm$html$Html$Attributes$class('topbar-button')
					]),
				_List_fromArray(
					[
						author$project$Icons$draw34px(author$project$Icons$icons.fB)
					]))
			]));
};
var author$project$Main$topBar = function (m) {
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$id('topBar'),
				A2(
				elm$html$Html$Attributes$style,
				'left',
				elm$core$String$fromFloat(author$project$Main$leftBarWidth + 2) + 'px'),
				A2(
				elm$html$Html$Attributes$style,
				'width',
				elm$core$String$fromFloat(((m.ad.aF - author$project$Main$leftBarWidth) - author$project$Main$rightBarWidth) - 3) + 'px'),
				A2(
				elm$html$Html$Attributes$style,
				'height',
				elm$core$String$fromFloat(author$project$Main$topBarHeight) + 'px')
			]),
		_List_fromArray(
			[
				author$project$Main$zoomAndItsButtons(m),
				author$project$Main$toolSelectionButtonGroup(m),
				author$project$Main$vaderAsRadioButton(m)
			]));
};
var author$project$Main$view = function (m) {
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				A2(elm$html$Html$Attributes$style, 'width', '100vw')
			]),
		_List_fromArray(
			[
				author$project$Main$mainSvg(m),
				author$project$Main$leftBar(m),
				author$project$Main$rightBar(m),
				author$project$Main$topBar(m)
			]));
};
var author$project$User$Links = {$: 2};
var author$project$User$ManyBody = {$: 0};
var author$project$User$default = {
	aq: elm$core$Dict$empty,
	bn: {dz: false, bU: false, dK: false, ed: true, ee: 0.1, ef: 600, eg: 300},
	bo: {ae: 'white', cj: 40, dc: 0.7, aC: 3},
	aW: {ae: 'white', bT: false, at: elm$core$Set$empty, I: ianmackenzie$elm_geometry$Point2d$origin, a8: 5, dc: -60},
	q: elm_community$graph$Graph$empty,
	d0: _List_fromArray(
		[author$project$User$ManyBody, author$project$User$Links])
};
var elm$browser$Browser$document = _Browser_document;
var elm$browser$Browser$Dom$getViewport = _Browser_withWindow(_Browser_getViewport);
var elm$core$Platform$Cmd$batch = _Platform_batch;
var elm$core$Platform$Cmd$none = elm$core$Platform$Cmd$batch(_List_Nil);
var author$project$Main$main = elm$browser$Browser$document(
	{
		fe: elm$core$Basics$always(
			_Utils_Tuple2(
				author$project$Main$initialModel(author$project$User$default),
				A2(
					elm$core$Task$perform,
					author$project$Main$WindowResize,
					A2(elm$core$Task$map, author$project$Main$getWindowSize, elm$browser$Browser$Dom$getViewport)))),
		fK: author$project$Main$subscriptions,
		fW: F2(
			function (msg, model) {
				return _Utils_Tuple2(
					A2(author$project$Main$update, msg, model),
					elm$core$Platform$Cmd$none);
			}),
		fZ: function (model) {
			return {
				eN: _List_fromArray(
					[
						author$project$Main$view(model)
					]),
				fO: 'Kite'
			};
		}
	});
_Platform_export({'Main':{'init':author$project$Main$main(
	elm$json$Json$Decode$succeed(0))(0)}});}(this));