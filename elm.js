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

console.warn('Compiled in DEV mode. Follow the advice at https://elm-lang.org/0.19.0/optimize for better performance and smaller assets.');


var _List_Nil_UNUSED = { $: 0 };
var _List_Nil = { $: '[]' };

function _List_Cons_UNUSED(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons(hd, tl) { return { $: '::', a: hd, b: tl }; }


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

	/**/
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

	/**_UNUSED/
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

	/**/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**_UNUSED/
	if (!x.$)
	//*/
	/**/
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

var _Utils_Tuple0_UNUSED = 0;
var _Utils_Tuple0 = { $: '#0' };

function _Utils_Tuple2_UNUSED(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3_UNUSED(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr_UNUSED(c) { return c; }
function _Utils_chr(c) { return new String(c); }


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

var _Debug_log_UNUSED = F2(function(tag, value)
{
	return value;
});

var _Debug_log = F2(function(tag, value)
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

function _Debug_toString_UNUSED(value)
{
	return '<internals>';
}

function _Debug_toString(value)
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


function _Debug_crash_UNUSED(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash(identifier, fact1, fact2, fact3, fact4)
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
	if (region.start.line === region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'on lines ' + region.start.line + ' through ' + region.end.line;
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




/**/
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

function _Json_wrap(value) { return { $: 0, a: value }; }
function _Json_unwrap(value) { return value.a; }

function _Json_wrap_UNUSED(value) { return value; }
function _Json_unwrap_UNUSED(value) { return value; }

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
		impl.init,
		impl.update,
		impl.subscriptions,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	elm$core$Result$isOk(result) || _Debug_crash(2 /**/, _Json_errorToString(result.a) /**/);
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


function _Platform_export_UNUSED(exports)
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


function _Platform_export(exports)
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

	/**_UNUSED/
	var node = args['node'];
	//*/
	/**/
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

function _VirtualDom_noJavaScriptUri_UNUSED(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,'')) ? '' : value;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,''))
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri_UNUSED(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value) ? '' : value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
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
		message: func(record.message),
		stopPropagation: record.stopPropagation,
		preventDefault: record.preventDefault
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
		var message = !tag ? value : tag < 3 ? value.a : value.message;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.stopPropagation;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.preventDefault) && event.preventDefault(),
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
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var view = impl.view;
			/**_UNUSED/
			var domNode = args['node'];
			//*/
			/**/
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
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.setup && impl.setup(sendToApp)
			var view = impl.view;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.body);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.title) && (_VirtualDom_doc.title = title = doc.title);
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
	var onUrlChange = impl.onUrlChange;
	var onUrlRequest = impl.onUrlRequest;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		setup: function(sendToApp)
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
							&& curr.protocol === next.protocol
							&& curr.host === next.host
							&& curr.port_.a === next.port_.a
						)
							? elm$browser$Browser$Internal(next)
							: elm$browser$Browser$External(href)
					));
				}
			});
		},
		init: function(flags)
		{
			return A3(impl.init, flags, _Browser_getUrl(), key);
		},
		view: impl.view,
		update: impl.update,
		subscriptions: impl.subscriptions
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
		? { hidden: 'hidden', change: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { hidden: 'mozHidden', change: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { hidden: 'msHidden', change: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { hidden: 'webkitHidden', change: 'webkitvisibilitychange' }
		: { hidden: 'hidden', change: 'visibilitychange' };
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
		scene: _Browser_getScene(),
		viewport: {
			x: _Browser_window.pageXOffset,
			y: _Browser_window.pageYOffset,
			width: _Browser_doc.documentElement.clientWidth,
			height: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		width: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		height: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
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
			scene: {
				width: node.scrollWidth,
				height: node.scrollHeight
			},
			viewport: {
				x: node.scrollLeft,
				y: node.scrollTop,
				width: node.clientWidth,
				height: node.clientHeight
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
			scene: _Browser_getScene(),
			viewport: {
				x: x,
				y: y,
				width: _Browser_doc.documentElement.clientWidth,
				height: _Browser_doc.documentElement.clientHeight
			},
			element: {
				x: x + rect.left,
				y: y + rect.top,
				width: rect.width,
				height: rect.height
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
var author$project$Main$UpdateWindowSize = function (a) {
	return {$: 'UpdateWindowSize', a: a};
};
var elm$core$Basics$EQ = {$: 'EQ'};
var elm$core$Basics$GT = {$: 'GT'};
var elm$core$Basics$LT = {$: 'LT'};
var elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === 'RBEmpty_elm_builtin') {
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
	var dict = _n0.a;
	return elm$core$Dict$keys(dict);
};
var elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var elm$core$Array$foldr = F3(
	function (func, baseCase, _n0) {
		var tree = _n0.c;
		var tail = _n0.d;
		var helper = F2(
			function (node, acc) {
				if (node.$ === 'SubTree') {
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
		height: elm$core$Basics$round(viewPort.scene.height),
		width: elm$core$Basics$round(viewPort.scene.width)
	};
};
var author$project$Graph$Graph = function (a) {
	return {$: 'Graph', a: a};
};
var elm$core$Basics$identity = function (x) {
	return x;
};
var elm$core$Basics$negate = function (n) {
	return -n;
};
var elm$core$Dict$RBEmpty_elm_builtin = {$: 'RBEmpty_elm_builtin'};
var elm$core$Dict$empty = elm$core$Dict$RBEmpty_elm_builtin;
var author$project$Graph$empty = author$project$Graph$Graph(
	{
		bags: elm$core$Dict$empty,
		edges: elm$core$Dict$empty,
		manyBody: {distanceMax: 1000, distanceMin: 1, strength: -40, theta: 0.9},
		vertices: elm$core$Dict$empty
	});
var author$project$Main$Draw = function (a) {
	return {$: 'Draw', a: a};
};
var author$project$Main$ListsOfBagsVerticesAndEdges = {$: 'ListsOfBagsVerticesAndEdges'};
var author$project$Main$RectSelector = {$: 'RectSelector'};
var elm$core$Basics$False = {$: 'False'};
var elm$core$Basics$True = {$: 'True'};
var elm$core$Maybe$Nothing = {$: 'Nothing'};
var elm$core$Set$Set_elm_builtin = function (a) {
	return {$: 'Set_elm_builtin', a: a};
};
var elm$core$Set$empty = elm$core$Set$Set_elm_builtin(elm$core$Dict$empty);
var author$project$Main$initialModel = {
	alpha: 0,
	altIsDown: false,
	bagPreferences: {draggablePullCenter: false, hasConvexHull: false, pullIsActive: false, pullX: 600, pullXStrength: 4.0e-2, pullY: 300, pullYStrength: 4.0e-2},
	edgePreferences: {color: 'white', distance: 50, strength: 0.5, thickness: 3},
	graph: author$project$Graph$empty,
	highlightingBagOnMouseOver: elm$core$Maybe$Nothing,
	highlightingEdgeOnMouseOver: elm$core$Maybe$Nothing,
	highlightingPullCenterOnMouseOver: elm$core$Maybe$Nothing,
	highlightingVertexOnMouseOver: elm$core$Maybe$Nothing,
	leftBarContent: author$project$Main$ListsOfBagsVerticesAndEdges,
	maybeSelectedBag: elm$core$Maybe$Nothing,
	selectedEdges: elm$core$Set$empty,
	selectedVertices: elm$core$Set$empty,
	selector: author$project$Main$RectSelector,
	shiftIsDown: false,
	tool: author$project$Main$Draw(elm$core$Maybe$Nothing),
	vaderIsOn: true,
	vertexPreferences: {color: 'white', fixed: false, inBags: elm$core$Set$empty, radius: 5, userDefinedProperties: elm$core$Dict$empty, x: 200, y: 200},
	windowSize: {height: 600, width: 800}
};
var author$project$Main$FromD3Tick = function (a) {
	return {$: 'FromD3Tick', a: a};
};
var author$project$Main$MouseMove = function (a) {
	return {$: 'MouseMove', a: a};
};
var author$project$Main$MouseUp = function (a) {
	return {$: 'MouseUp', a: a};
};
var elm$core$Array$branchFactor = 32;
var elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 'Array_elm_builtin', a: a, b: b, c: c, d: d};
	});
var elm$core$Basics$ceiling = _Basics_ceiling;
var elm$core$Basics$fdiv = _Basics_fdiv;
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
	return {$: 'Leaf', a: a};
};
var elm$core$Array$SubTree = function (a) {
	return {$: 'SubTree', a: a};
};
var elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
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
var elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var elm$core$Basics$eq = _Utils_equal;
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
var elm$core$Basics$add = _Basics_add;
var elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var elm$core$Basics$floor = _Basics_floor;
var elm$core$Basics$gt = _Utils_gt;
var elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var elm$core$Basics$mul = _Basics_mul;
var elm$core$Basics$sub = _Basics_sub;
var elm$core$Elm$JsArray$length = _JsArray_length;
var elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.nodeListSize) {
			return A4(
				elm$core$Array$Array_elm_builtin,
				elm$core$Elm$JsArray$length(builder.tail),
				elm$core$Array$shiftStep,
				elm$core$Elm$JsArray$empty,
				builder.tail);
		} else {
			var treeLen = builder.nodeListSize * elm$core$Array$branchFactor;
			var depth = elm$core$Basics$floor(
				A2(elm$core$Basics$logBase, elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? elm$core$List$reverse(builder.nodeList) : builder.nodeList;
			var tree = A2(elm$core$Array$treeFromBuilder, correctNodeList, builder.nodeListSize);
			return A4(
				elm$core$Array$Array_elm_builtin,
				elm$core$Elm$JsArray$length(builder.tail) + treeLen,
				A2(elm$core$Basics$max, 5, depth * elm$core$Array$shiftStep),
				tree,
				builder.tail);
		}
	});
var elm$core$Basics$idiv = _Basics_idiv;
var elm$core$Basics$lt = _Utils_lt;
var elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					elm$core$Array$builderToArray,
					false,
					{nodeList: nodeList, nodeListSize: (len / elm$core$Array$branchFactor) | 0, tail: tail});
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
var elm$core$Maybe$Just = function (a) {
	return {$: 'Just', a: a};
};
var elm$core$Result$Err = function (a) {
	return {$: 'Err', a: a};
};
var elm$core$Result$Ok = function (a) {
	return {$: 'Ok', a: a};
};
var elm$core$Result$isOk = function (result) {
	if (result.$ === 'Ok') {
		return true;
	} else {
		return false;
	}
};
var elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 'Failure', a: a, b: b};
	});
var elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 'Field', a: a, b: b};
	});
var elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 'Index', a: a, b: b};
	});
var elm$json$Json$Decode$OneOf = function (a) {
	return {$: 'OneOf', a: a};
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
var elm$core$String$uncons = _String_uncons;
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
				case 'Field':
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _n1 = elm$core$String$uncons(f);
						if (_n1.$ === 'Nothing') {
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
				case 'Index':
					var i = error.a;
					var err = error.b;
					var indexName = '[' + (elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2(elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'OneOf':
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
var elm$json$Json$Decode$andThen = _Json_andThen;
var elm$json$Json$Decode$field = _Json_decodeField;
var elm$json$Json$Decode$float = _Json_decodeFloat;
var elm$json$Json$Decode$int = _Json_decodeInt;
var elm$json$Json$Decode$list = _Json_decodeList;
var elm$json$Json$Decode$succeed = _Json_succeed;
var author$project$Main$fromD3TickData = _Platform_incomingPort(
	'fromD3TickData',
	A2(
		elm$json$Json$Decode$andThen,
		function (nodes) {
			return A2(
				elm$json$Json$Decode$andThen,
				function (alpha) {
					return elm$json$Json$Decode$succeed(
						{alpha: alpha, nodes: nodes});
				},
				A2(elm$json$Json$Decode$field, 'alpha', elm$json$Json$Decode$float));
		},
		A2(
			elm$json$Json$Decode$field,
			'nodes',
			elm$json$Json$Decode$list(
				A2(
					elm$json$Json$Decode$andThen,
					function (y) {
						return A2(
							elm$json$Json$Decode$andThen,
							function (x) {
								return A2(
									elm$json$Json$Decode$andThen,
									function (id) {
										return elm$json$Json$Decode$succeed(
											{id: id, x: x, y: y});
									},
									A2(elm$json$Json$Decode$field, 'id', elm$json$Json$Decode$int));
							},
							A2(elm$json$Json$Decode$field, 'x', elm$json$Json$Decode$float));
					},
					A2(elm$json$Json$Decode$field, 'y', elm$json$Json$Decode$float))))));
var author$project$Main$Character = function (a) {
	return {$: 'Character', a: a};
};
var author$project$Main$Control = function (a) {
	return {$: 'Control', a: a};
};
var author$project$Main$toKey = function (string) {
	var _n0 = elm$core$String$uncons(string);
	if ((_n0.$ === 'Just') && (_n0.a.b === '')) {
		var _n1 = _n0.a;
		var c = _n1.a;
		return author$project$Main$Character(c);
	} else {
		return author$project$Main$Control(string);
	}
};
var elm$json$Json$Decode$map = _Json_map1;
var elm$json$Json$Decode$string = _Json_decodeString;
var author$project$Main$keyDecoder = A2(
	elm$json$Json$Decode$map,
	author$project$Main$toKey,
	A2(elm$json$Json$Decode$field, 'key', elm$json$Json$Decode$string));
var author$project$Main$MousePosition = F2(
	function (x, y) {
		return {x: x, y: y};
	});
var elm$json$Json$Decode$map2 = _Json_map2;
var author$project$Main$mousePosition = A3(
	elm$json$Json$Decode$map2,
	author$project$Main$MousePosition,
	A2(elm$json$Json$Decode$field, 'clientX', elm$json$Json$Decode$int),
	A2(elm$json$Json$Decode$field, 'clientY', elm$json$Json$Decode$int));
var author$project$Main$AltKeyDown = {$: 'AltKeyDown'};
var author$project$Main$ClickOnVertexTrash = {$: 'ClickOnVertexTrash'};
var author$project$Main$DrawToolClicked = {$: 'DrawToolClicked'};
var author$project$Main$NoOp = {$: 'NoOp'};
var author$project$Main$SelectToolClicked = {$: 'SelectToolClicked'};
var author$project$Main$ShiftKeyDown = {$: 'ShiftKeyDown'};
var author$project$Main$VaderClicked = {$: 'VaderClicked'};
var author$project$Main$toKeyDownMsg = function (key) {
	_n0$6:
	while (true) {
		if (key.$ === 'Character') {
			switch (key.a.valueOf()) {
				case 's':
					return author$project$Main$SelectToolClicked;
				case 'd':
					return author$project$Main$DrawToolClicked;
				case 'f':
					return author$project$Main$VaderClicked;
				default:
					break _n0$6;
			}
		} else {
			switch (key.a) {
				case 'Backspace':
					return author$project$Main$ClickOnVertexTrash;
				case 'Alt':
					return author$project$Main$AltKeyDown;
				case 'Shift':
					return author$project$Main$ShiftKeyDown;
				default:
					break _n0$6;
			}
		}
	}
	return author$project$Main$NoOp;
};
var author$project$Main$AltKeyUp = {$: 'AltKeyUp'};
var author$project$Main$ShiftKeyUp = {$: 'ShiftKeyUp'};
var author$project$Main$toKeyUpMsg = function (key) {
	_n0$2:
	while (true) {
		if (key.$ === 'Control') {
			switch (key.a) {
				case 'Alt':
					return author$project$Main$AltKeyUp;
				case 'Shift':
					return author$project$Main$ShiftKeyUp;
				default:
					break _n0$2;
			}
		} else {
			break _n0$2;
		}
	}
	return author$project$Main$NoOp;
};
var elm$browser$Browser$Events$Document = {$: 'Document'};
var elm$browser$Browser$Events$MySub = F3(
	function (a, b, c) {
		return {$: 'MySub', a: a, b: b, c: c};
	});
var elm$browser$Browser$Events$State = F2(
	function (subs, pids) {
		return {pids: pids, subs: subs};
	});
var elm$core$Task$succeed = _Scheduler_succeed;
var elm$browser$Browser$Events$init = elm$core$Task$succeed(
	A2(elm$browser$Browser$Events$State, _List_Nil, elm$core$Dict$empty));
var elm$browser$Browser$Events$nodeToKey = function (node) {
	if (node.$ === 'Document') {
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
		return {event: event, key: key};
	});
var elm$core$Platform$sendToSelf = _Platform_sendToSelf;
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
var elm$browser$Browser$External = function (a) {
	return {$: 'External', a: a};
};
var elm$browser$Browser$Internal = function (a) {
	return {$: 'Internal', a: a};
};
var elm$browser$Browser$Dom$NotFound = function (a) {
	return {$: 'NotFound', a: a};
};
var elm$core$Basics$never = function (_n0) {
	never:
	while (true) {
		var nvr = _n0.a;
		var $temp$_n0 = nvr;
		_n0 = $temp$_n0;
		continue never;
	}
};
var elm$core$Task$Perform = function (a) {
	return {$: 'Perform', a: a};
};
var elm$core$Task$init = elm$core$Task$succeed(_Utils_Tuple0);
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
		var task = _n0.a;
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
				return _Utils_Tuple0;
			},
			elm$core$Task$sequence(
				A2(
					elm$core$List$map,
					elm$core$Task$spawnCmd(router),
					commands)));
	});
var elm$core$Task$onSelfMsg = F3(
	function (_n0, _n1, _n2) {
		return elm$core$Task$succeed(_Utils_Tuple0);
	});
var elm$core$Task$cmdMap = F2(
	function (tagger, _n0) {
		var task = _n0.a;
		return elm$core$Task$Perform(
			A2(elm$core$Task$map, tagger, task));
	});
_Platform_effectManagers['Task'] = _Platform_createManager(elm$core$Task$init, elm$core$Task$onEffects, elm$core$Task$onSelfMsg, elm$core$Task$cmdMap);
var elm$core$Task$command = _Platform_leaf('Task');
var elm$core$Task$perform = F2(
	function (toMessage, task) {
		return elm$core$Task$command(
			elm$core$Task$Perform(
				A2(elm$core$Task$map, toMessage, task)));
	});
var elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 'Normal':
			return 0;
		case 'MayStopPropagation':
			return 1;
		case 'MayPreventDefault':
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
var elm$url$Url$Http = {$: 'Http'};
var elm$url$Url$Https = {$: 'Https'};
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
		return {fragment: fragment, host: host, path: path, port_: port_, protocol: protocol, query: query};
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
					if (_n1.$ === 'Nothing') {
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
		elm$url$Url$Http,
		A2(elm$core$String$dropLeft, 7, str)) : (A2(elm$core$String$startsWith, 'https://', str) ? A2(
		elm$url$Url$chompAfterProtocol,
		elm$url$Url$Https,
		A2(elm$core$String$dropLeft, 8, str)) : elm$core$Maybe$Nothing);
};
var elm$browser$Browser$Events$spawn = F3(
	function (router, key, _n0) {
		var node = _n0.a;
		var name = _n0.b;
		var actualNode = function () {
			if (node.$ === 'Document') {
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
var elm$core$Dict$Black = {$: 'Black'};
var elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: 'RBNode_elm_builtin', a: a, b: b, c: c, d: d, e: e};
	});
var elm$core$Basics$compare = _Utils_compare;
var elm$core$Dict$Red = {$: 'Red'};
var elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Red')) {
			var _n1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
				var _n3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Red,
					key,
					value,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, rK, rV, rLeft, rRight));
			} else {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) && (left.d.$ === 'RBNode_elm_builtin')) && (left.d.a.$ === 'Red')) {
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
					elm$core$Dict$Red,
					lK,
					lV,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, llK, llV, llLeft, llRight),
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, key, value, lRight, right));
			} else {
				return A5(elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, key, value, elm$core$Dict$RBEmpty_elm_builtin, elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _n1 = A2(elm$core$Basics$compare, key, nKey);
			switch (_n1.$) {
				case 'LT':
					return A5(
						elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3(elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 'EQ':
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
		if ((_n0.$ === 'RBNode_elm_builtin') && (_n0.a.$ === 'Red')) {
			var _n1 = _n0.a;
			var k = _n0.b;
			var v = _n0.c;
			var l = _n0.d;
			var r = _n0.e;
			return A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _n0;
			return x;
		}
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
var elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
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
var elm$core$Process$kill = _Scheduler_kill;
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
			state.pids,
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
		if (_n0.$ === 'Just') {
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
		var key = _n0.key;
		var event = _n0.event;
		var toMessage = function (_n2) {
			var subKey = _n2.a;
			var _n3 = _n2.b;
			var node = _n3.a;
			var name = _n3.b;
			var decoder = _n3.c;
			return _Utils_eq(subKey, key) ? A2(_Browser_decodeEvent, decoder, event) : elm$core$Maybe$Nothing;
		};
		var messages = A2(elm$core$List$filterMap, toMessage, state.subs);
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
var elm$browser$Browser$Events$onKeyDown = A2(elm$browser$Browser$Events$on, elm$browser$Browser$Events$Document, 'keydown');
var elm$browser$Browser$Events$onKeyUp = A2(elm$browser$Browser$Events$on, elm$browser$Browser$Events$Document, 'keyup');
var elm$browser$Browser$Events$onMouseMove = A2(elm$browser$Browser$Events$on, elm$browser$Browser$Events$Document, 'mousemove');
var elm$browser$Browser$Events$onMouseUp = A2(elm$browser$Browser$Events$on, elm$browser$Browser$Events$Document, 'mouseup');
var elm$browser$Browser$Events$Window = {$: 'Window'};
var elm$browser$Browser$Events$onResize = function (func) {
	return A3(
		elm$browser$Browser$Events$on,
		elm$browser$Browser$Events$Window,
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
var elm$core$Platform$Sub$batch = _Platform_batch;
var author$project$Main$subscriptions = function (_n0) {
	return elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				elm$browser$Browser$Events$onResize(
				F2(
					function (w, h) {
						return author$project$Main$UpdateWindowSize(
							{height: h, width: w});
					})),
				elm$browser$Browser$Events$onMouseMove(
				A2(elm$json$Json$Decode$map, author$project$Main$MouseMove, author$project$Main$mousePosition)),
				elm$browser$Browser$Events$onMouseUp(
				A2(elm$json$Json$Decode$map, author$project$Main$MouseUp, author$project$Main$mousePosition)),
				author$project$Main$fromD3TickData(author$project$Main$FromD3Tick),
				elm$browser$Browser$Events$onKeyDown(
				A2(elm$json$Json$Decode$map, author$project$Main$toKeyDownMsg, author$project$Main$keyDecoder)),
				elm$browser$Browser$Events$onKeyUp(
				A2(elm$json$Json$Decode$map, author$project$Main$toKeyUpMsg, author$project$Main$keyDecoder))
			]));
};
var elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
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
var elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (maybe.$ === 'Just') {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var author$project$Graph$makeNewId = A2(
	elm$core$Basics$composeR,
	elm$core$Dict$keys,
	A2(
		elm$core$Basics$composeR,
		elm$core$List$maximum,
		A2(
			elm$core$Basics$composeR,
			elm$core$Maybe$withDefault(-1),
			elm$core$Basics$add(1))));
var elm$core$Dict$map = F2(
	function (func, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
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
var elm$core$Set$insert = F2(
	function (key, _n0) {
		var dict = _n0.a;
		return elm$core$Set$Set_elm_builtin(
			A3(elm$core$Dict$insert, key, _Utils_Tuple0, dict));
	});
var elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _n1 = A2(elm$core$Basics$compare, targetKey, key);
				switch (_n1.$) {
					case 'LT':
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 'EQ':
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
var elm$core$Dict$member = F2(
	function (key, dict) {
		var _n0 = A2(elm$core$Dict$get, key, dict);
		if (_n0.$ === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var elm$core$Set$member = F2(
	function (key, _n0) {
		var dict = _n0.a;
		return A2(elm$core$Dict$member, key, dict);
	});
var author$project$Graph$addBagAndGetNewBagId = F3(
	function (vertexSet, bag, _n0) {
		var p = _n0.a;
		var idOfTheNewBag = author$project$Graph$makeNewId(p.bags);
		var updateInBags = F2(
			function (vertexId, v) {
				return _Utils_update(
					v,
					{
						inBags: A2(elm$core$Set$member, vertexId, vertexSet) ? A2(elm$core$Set$insert, idOfTheNewBag, v.inBags) : v.inBags
					});
			});
		return _Utils_Tuple2(
			author$project$Graph$Graph(
				_Utils_update(
					p,
					{
						bags: A3(elm$core$Dict$insert, idOfTheNewBag, bag, p.bags),
						vertices: A2(elm$core$Dict$map, updateInBags, p.vertices)
					})),
			idOfTheNewBag);
	});
var author$project$Graph$getVertices = function (_n0) {
	var vertices = _n0.a.vertices;
	return vertices;
};
var author$project$Graph$mapEdges = F2(
	function (up, _n0) {
		var p = _n0.a;
		return author$project$Graph$Graph(
			_Utils_update(
				p,
				{
					edges: up(p.edges)
				}));
	});
var author$project$Graph$addEdgeBetweenExistingVertices = F3(
	function (_n0, e, graph) {
		var s = _n0.a;
		var t = _n0.b;
		var targetIsThere = A2(
			elm$core$Dict$member,
			t,
			author$project$Graph$getVertices(graph));
		var sourceIsThere = A2(
			elm$core$Dict$member,
			s,
			author$project$Graph$getVertices(graph));
		return (sourceIsThere && targetIsThere) ? A2(
			author$project$Graph$mapEdges,
			A2(
				elm$core$Dict$insert,
				_Utils_Tuple2(s, t),
				e),
			graph) : graph;
	});
var author$project$Graph$mapVertices = F2(
	function (up, _n0) {
		var p = _n0.a;
		return author$project$Graph$Graph(
			_Utils_update(
				p,
				{
					vertices: up(p.vertices)
				}));
	});
var author$project$Graph$newVertexId = function (_n0) {
	var vertices = _n0.a.vertices;
	return author$project$Graph$makeNewId(vertices);
};
var author$project$Graph$addNeighbour = F5(
	function (_n0, sourceId, _n1, e, graph) {
		var x = _n0.x;
		var y = _n0.y;
		var v = _n1.a;
		var maybeBagId = _n1.b;
		var targetId = author$project$Graph$newVertexId(graph);
		var newVertex = _Utils_update(
			v,
			{
				inBags: function () {
					if (maybeBagId.$ === 'Just') {
						var bagId = maybeBagId.a;
						return elm$core$Set$insert(bagId);
					} else {
						return elm$core$Basics$identity;
					}
				}()(v.inBags),
				x: x,
				y: y
			});
		return A2(
			author$project$Graph$mapEdges,
			A2(
				elm$core$Dict$insert,
				_Utils_Tuple2(sourceId, targetId),
				e),
			A2(
				author$project$Graph$mapVertices,
				A2(elm$core$Dict$insert, targetId, newVertex),
				graph));
	});
var author$project$Graph$addVertexAndGetTheNewVertexId = F3(
	function (_n0, _n1, graph) {
		var x = _n0.x;
		var y = _n0.y;
		var v = _n1.a;
		var maybeBagId = _n1.b;
		var newVertex = _Utils_update(
			v,
			{
				inBags: function () {
					if (maybeBagId.$ === 'Just') {
						var bagId = maybeBagId.a;
						return elm$core$Set$insert(bagId);
					} else {
						return elm$core$Basics$identity;
					}
				}()(v.inBags),
				x: x,
				y: y
			});
		var id = author$project$Graph$newVertexId(graph);
		return _Utils_Tuple2(
			A2(
				author$project$Graph$mapVertices,
				A2(elm$core$Dict$insert, id, newVertex),
				graph),
			id);
	});
var author$project$Graph$getEdge = F2(
	function (edgeId, _n0) {
		var edges = _n0.a.edges;
		return A2(elm$core$Dict$get, edgeId, edges);
	});
var elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) {
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
	if (((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) && (dict.e.$ === 'RBNode_elm_builtin')) {
		if ((dict.e.d.$ === 'RBNode_elm_builtin') && (dict.e.d.a.$ === 'Red')) {
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
				elm$core$Dict$Red,
				rlK,
				rlV,
				A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Black,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, lK, lV, lLeft, lRight),
					rlL),
				A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, rK, rV, rlR, rRight));
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
			if (clr.$ === 'Black') {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Black,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, rK, rV, rLeft, rRight));
			} else {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Black,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) && (dict.e.$ === 'RBNode_elm_builtin')) {
		if ((dict.d.d.$ === 'RBNode_elm_builtin') && (dict.d.d.a.$ === 'Red')) {
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
				elm$core$Dict$Red,
				lK,
				lV,
				A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, llK, llV, llLeft, llRight),
				A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Black,
					k,
					v,
					lRight,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, rK, rV, rLeft, rRight)));
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
			if (clr.$ === 'Black') {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Black,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, rK, rV, rLeft, rRight));
			} else {
				return A5(
					elm$core$Dict$RBNode_elm_builtin,
					elm$core$Dict$Black,
					k,
					v,
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
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
				A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Red, key, value, lRight, right));
		} else {
			_n2$2:
			while (true) {
				if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Black')) {
					if (right.d.$ === 'RBNode_elm_builtin') {
						if (right.d.a.$ === 'Black') {
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
	if ((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor.$ === 'Black') {
			if ((lLeft.$ === 'RBNode_elm_builtin') && (lLeft.a.$ === 'Red')) {
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
				if (_n4.$ === 'RBNode_elm_builtin') {
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
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Black')) {
					var _n4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === 'RBNode_elm_builtin') && (lLeft.a.$ === 'Red')) {
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
						if (_n7.$ === 'RBNode_elm_builtin') {
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
		if (dict.$ === 'RBNode_elm_builtin') {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _n1 = elm$core$Dict$getMin(right);
				if (_n1.$ === 'RBNode_elm_builtin') {
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
		if ((_n0.$ === 'RBNode_elm_builtin') && (_n0.a.$ === 'Red')) {
			var _n1 = _n0.a;
			var k = _n0.b;
			var v = _n0.c;
			var l = _n0.d;
			var r = _n0.e;
			return A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _n0;
			return x;
		}
	});
var elm$core$Set$foldr = F3(
	function (func, initialState, _n0) {
		var dict = _n0.a;
		return A3(
			elm$core$Dict$foldr,
			F3(
				function (key, _n1, state) {
					return A2(func, key, state);
				}),
			initialState,
			dict);
	});
var author$project$Graph$removeEdges = function (l) {
	return author$project$Graph$mapEdges(
		function (es) {
			return A3(elm$core$Set$foldr, elm$core$Dict$remove, es, l);
		});
};
var elm$core$Dict$singleton = F2(
	function (key, value) {
		return A5(elm$core$Dict$RBNode_elm_builtin, elm$core$Dict$Black, key, value, elm$core$Dict$RBEmpty_elm_builtin, elm$core$Dict$RBEmpty_elm_builtin);
	});
var elm$core$Set$singleton = function (key) {
	return elm$core$Set$Set_elm_builtin(
		A2(elm$core$Dict$singleton, key, _Utils_Tuple0));
};
var author$project$Graph$devideEdge = F4(
	function (pos, _n0, _n1, graph) {
		var s = _n0.a;
		var t = _n0.b;
		var v = _n1.a;
		var maybeBagId = _n1.b;
		var _n2 = A3(
			author$project$Graph$addVertexAndGetTheNewVertexId,
			pos,
			_Utils_Tuple2(v, maybeBagId),
			graph);
		var newGraph_ = _n2.a;
		var newId = _n2.b;
		var newGraph = function () {
			var _n3 = A2(
				author$project$Graph$getEdge,
				_Utils_Tuple2(s, t),
				graph);
			if (_n3.$ === 'Just') {
				var e = _n3.a;
				return A3(
					author$project$Graph$addEdgeBetweenExistingVertices,
					_Utils_Tuple2(newId, t),
					e,
					A3(
						author$project$Graph$addEdgeBetweenExistingVertices,
						_Utils_Tuple2(s, newId),
						e,
						A2(
							author$project$Graph$removeEdges,
							elm$core$Set$singleton(
								_Utils_Tuple2(s, t)),
							newGraph_)));
			} else {
				return graph;
			}
		}();
		return _Utils_Tuple2(newGraph, newId);
	});
var author$project$Graph$addNeighbourDevidingEdge = F6(
	function (sourceId, pos, _n0, _n1, e, graph) {
		var s = _n0.a;
		var t = _n0.b;
		var v = _n1.a;
		var maybeBagId = _n1.b;
		var _n2 = A4(
			author$project$Graph$devideEdge,
			pos,
			_Utils_Tuple2(s, t),
			_Utils_Tuple2(v, maybeBagId),
			graph);
		var newGraph = _n2.a;
		var newId = _n2.b;
		return A3(
			author$project$Graph$addEdgeBetweenExistingVertices,
			_Utils_Tuple2(sourceId, newId),
			e,
			newGraph);
	});
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
var author$project$Graph$incomingEdges = F2(
	function (vertexId, _n0) {
		var edges = _n0.a.edges;
		return A2(
			elm$core$Dict$filter,
			F2(
				function (_n1, _n2) {
					var s = _n1.a;
					var t = _n1.b;
					return _Utils_eq(vertexId, t);
				}),
			edges);
	});
var author$project$Graph$outgoingEdges = F2(
	function (vertexId, _n0) {
		var edges = _n0.a.edges;
		return A2(
			elm$core$Dict$filter,
			F2(
				function (_n1, _n2) {
					var s = _n1.a;
					var t = _n1.b;
					return _Utils_eq(vertexId, s);
				}),
			edges);
	});
var elm$core$Basics$neq = _Utils_notEqual;
var elm$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			elm$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(elm$core$Dict$remove, k, t);
				}),
			t1,
			t2);
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
var author$project$Graph$contractEdge = F3(
	function (_n0, v, graph) {
		var s = _n0.a;
		var t = _n0.b;
		var vertices = graph.a.vertices;
		var ot = A2(author$project$Graph$outgoingEdges, t, graph);
		var os = A2(author$project$Graph$outgoingEdges, s, graph);
		var newVertex = function () {
			var _n17 = _Utils_Tuple2(
				A2(elm$core$Dict$get, s, vertices),
				A2(elm$core$Dict$get, t, vertices));
			if ((_n17.a.$ === 'Just') && (_n17.b.$ === 'Just')) {
				var w = _n17.a.a;
				var z = _n17.b.a;
				return _Utils_update(
					v,
					{x: (w.x + z.x) / 2, y: (w.y + z.y) / 2});
			} else {
				return v;
			}
		}();
		var newId = author$project$Graph$newVertexId(graph);
		var os_ = elm$core$Dict$fromList(
			A2(
				elm$core$List$map,
				function (_n15) {
					var _n16 = _n15.a;
					var u = _n16.b;
					var e = _n15.b;
					return _Utils_Tuple2(
						_Utils_Tuple2(newId, u),
						e);
				},
				A2(
					elm$core$List$filter,
					function (_n13) {
						var _n14 = _n13.a;
						var u = _n14.b;
						return !_Utils_eq(u, t);
					},
					elm$core$Dict$toList(os))));
		var ot_ = elm$core$Dict$fromList(
			A2(
				elm$core$List$map,
				function (_n11) {
					var _n12 = _n11.a;
					var u = _n12.b;
					var e = _n11.b;
					return _Utils_Tuple2(
						_Utils_Tuple2(newId, u),
						e);
				},
				A2(
					elm$core$List$filter,
					function (_n9) {
						var _n10 = _n9.a;
						var u = _n10.b;
						return !_Utils_eq(u, s);
					},
					elm$core$Dict$toList(ot))));
		var it = A2(author$project$Graph$incomingEdges, t, graph);
		var it_ = elm$core$Dict$fromList(
			A2(
				elm$core$List$map,
				function (_n7) {
					var _n8 = _n7.a;
					var u = _n8.a;
					var e = _n7.b;
					return _Utils_Tuple2(
						_Utils_Tuple2(u, newId),
						e);
				},
				A2(
					elm$core$List$filter,
					function (_n5) {
						var _n6 = _n5.a;
						var u = _n6.a;
						return !_Utils_eq(u, s);
					},
					elm$core$Dict$toList(it))));
		var is = A2(author$project$Graph$incomingEdges, s, graph);
		var is_ = elm$core$Dict$fromList(
			A2(
				elm$core$List$map,
				function (_n3) {
					var _n4 = _n3.a;
					var u = _n4.a;
					var e = _n3.b;
					return _Utils_Tuple2(
						_Utils_Tuple2(u, newId),
						e);
				},
				A2(
					elm$core$List$filter,
					function (_n1) {
						var _n2 = _n1.a;
						var u = _n2.a;
						return !_Utils_eq(u, t);
					},
					elm$core$Dict$toList(is))));
		var newEdges = A2(
			elm$core$Dict$union,
			ot_,
			A2(
				elm$core$Dict$union,
				os_,
				A2(elm$core$Dict$union, it_, is_)));
		var edgesToRemove = A2(
			elm$core$Dict$union,
			ot,
			A2(
				elm$core$Dict$union,
				os,
				A2(elm$core$Dict$union, it, is)));
		return A2(
			author$project$Graph$mapEdges,
			A2(
				elm$core$Basics$composeR,
				function (es) {
					return A2(elm$core$Dict$diff, es, edgesToRemove);
				},
				elm$core$Dict$union(newEdges)),
			A2(
				author$project$Graph$mapVertices,
				A2(
					elm$core$Basics$composeR,
					A2(elm$core$Dict$insert, newId, newVertex),
					A2(
						elm$core$Basics$composeR,
						elm$core$Dict$remove(s),
						elm$core$Dict$remove(t))),
				graph));
	});
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
var elm$core$Set$fromList = function (list) {
	return A3(elm$core$List$foldl, elm$core$Set$insert, elm$core$Set$empty, list);
};
var author$project$Graph$disjointUnion = F2(
	function (_n0, graph) {
		var verts = _n0.a;
		var edgs = _n0.b;
		var p = graph.a;
		var n = author$project$Graph$newVertexId(graph);
		var dictForTheAddedVertices = elm$core$Dict$fromList(
			A2(
				elm$core$List$indexedMap,
				F2(
					function (i, _n8) {
						var oldId = _n8.a;
						var v = _n8.b;
						return _Utils_Tuple2(
							oldId,
							_Utils_Tuple2(n + i, v));
					}),
				elm$core$Dict$toList(verts)));
		var newVertices = A3(
			elm$core$Dict$foldr,
			F2(
				function (_n6, _n7) {
					var newId = _n7.a;
					var v = _n7.b;
					return A2(elm$core$Dict$insert, newId, v);
				}),
			p.vertices,
			dictForTheAddedVertices);
		var addedEdges = elm$core$Dict$fromList(
			A2(
				elm$core$List$map,
				function (_n1) {
					var _n2 = _n1.a;
					var oldSourceId = _n2.a;
					var oldTargetId = _n2.b;
					var e = _n1.b;
					var _n3 = _Utils_Tuple2(
						A2(elm$core$Dict$get, oldSourceId, dictForTheAddedVertices),
						A2(elm$core$Dict$get, oldTargetId, dictForTheAddedVertices));
					if ((_n3.a.$ === 'Just') && (_n3.b.$ === 'Just')) {
						var _n4 = _n3.a.a;
						var newSourceId = _n4.a;
						var _n5 = _n3.b.a;
						var newTargetId = _n5.a;
						return _Utils_Tuple2(
							_Utils_Tuple2(newSourceId, newTargetId),
							e);
					} else {
						return _Utils_Tuple2(
							_Utils_Tuple2(0, 0),
							e);
					}
				},
				elm$core$Dict$toList(edgs)));
		var newEdges = A2(elm$core$Dict$union, addedEdges, p.edges);
		return _Utils_Tuple3(
			author$project$Graph$Graph(
				_Utils_update(
					p,
					{edges: newEdges, vertices: newVertices})),
			elm$core$Set$fromList(
				A2(
					elm$core$List$map,
					elm$core$Tuple$first,
					elm$core$Dict$values(dictForTheAddedVertices))),
			elm$core$Set$fromList(
				elm$core$Dict$keys(addedEdges)));
	});
var author$project$Graph$getEdges = function (_n0) {
	var edges = _n0.a.edges;
	return edges;
};
var author$project$Graph$duplicateSubgraphAndGetTheDuplicate = F3(
	function (vs, es, graph) {
		var addedVertices = A2(
			elm$core$Dict$filter,
			F2(
				function (vertexId, _n1) {
					return A2(elm$core$Set$member, vertexId, vs);
				}),
			author$project$Graph$getVertices(graph));
		var addedEdges = A2(
			elm$core$Dict$filter,
			F2(
				function (edgeId, _n0) {
					return A2(elm$core$Set$member, edgeId, es);
				}),
			author$project$Graph$getEdges(graph));
		return A2(
			author$project$Graph$disjointUnion,
			_Utils_Tuple2(addedVertices, addedEdges),
			graph);
	});
var elm$json$Json$Encode$float = _Json_wrap;
var elm$json$Json$Encode$int = _Json_wrap;
var elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			elm$core$List$foldl,
			F2(
				function (_n0, obj) {
					var k = _n0.a;
					var v = _n0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(_Utils_Tuple0),
			pairs));
};
var author$project$Graph$encodeEdgeforD3 = F2(
	function (_n0, _n1) {
		var source = _n0.a;
		var target = _n0.b;
		var distance = _n1.distance;
		var strength = _n1.strength;
		return elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'source',
					elm$json$Json$Encode$int(source)),
					_Utils_Tuple2(
					'target',
					elm$json$Json$Encode$int(target)),
					_Utils_Tuple2(
					'distance',
					elm$json$Json$Encode$float(distance)),
					_Utils_Tuple2(
					'strength',
					elm$json$Json$Encode$float(strength))
				]));
	});
var elm$json$Json$Encode$list = F2(
	function (func, entries) {
		return _Json_wrap(
			A3(
				elm$core$List$foldl,
				_Json_addEntry(func),
				_Json_emptyArray(_Utils_Tuple0),
				entries));
	});
var author$project$Graph$encodeEdgesForD3 = function (edges) {
	return A2(
		elm$json$Json$Encode$list,
		elm$core$Basics$identity,
		elm$core$Dict$values(
			A2(elm$core$Dict$map, author$project$Graph$encodeEdgeforD3, edges)));
};
var author$project$Graph$encodeManyBody = function (_n0) {
	var strength = _n0.strength;
	var theta = _n0.theta;
	var distanceMin = _n0.distanceMin;
	var distanceMax = _n0.distanceMax;
	return elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'strength',
				elm$json$Json$Encode$float(strength)),
				_Utils_Tuple2(
				'theta',
				elm$json$Json$Encode$float(theta)),
				_Utils_Tuple2(
				'distanceMin',
				elm$json$Json$Encode$float(distanceMin)),
				_Utils_Tuple2(
				'distanceMax',
				elm$json$Json$Encode$float(distanceMax))
			]));
};
var author$project$Graph$encodePullData = function (_n0) {
	var pullX = _n0.pullX;
	var pullY = _n0.pullY;
	var pullXStrength = _n0.pullXStrength;
	var pullYStrength = _n0.pullYStrength;
	return elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'pullX',
				elm$json$Json$Encode$float(pullX)),
				_Utils_Tuple2(
				'pullXStrength',
				elm$json$Json$Encode$float(pullXStrength)),
				_Utils_Tuple2(
				'pullY',
				elm$json$Json$Encode$float(pullY)),
				_Utils_Tuple2(
				'pullYStrength',
				elm$json$Json$Encode$float(pullYStrength))
			]));
};
var author$project$Graph$encodePullCenters = F2(
	function (bags, l) {
		return A2(
			elm$json$Json$Encode$list,
			author$project$Graph$encodePullData,
			A2(
				elm$core$List$filter,
				function ($) {
					return $.pullIsActive;
				},
				A2(
					elm$core$List$filterMap,
					function (bagId) {
						return A2(elm$core$Dict$get, bagId, bags);
					},
					l)));
	});
var elm$json$Json$Encode$null = _Json_encodeNull;
var author$project$Graph$encodeVertexForD3 = F2(
	function (bags, _n0) {
		var vertexId = _n0.a;
		var x = _n0.b.x;
		var y = _n0.b.y;
		var fixed = _n0.b.fixed;
		var inBags = _n0.b.inBags;
		return elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'id',
					elm$json$Json$Encode$int(vertexId)),
					_Utils_Tuple2(
					'x',
					elm$json$Json$Encode$float(x)),
					_Utils_Tuple2(
					'y',
					elm$json$Json$Encode$float(y)),
					_Utils_Tuple2(
					'pullCenters',
					A2(
						author$project$Graph$encodePullCenters,
						bags,
						elm$core$Set$toList(inBags))),
					_Utils_Tuple2(
					'fx',
					fixed ? elm$json$Json$Encode$float(x) : elm$json$Json$Encode$null),
					_Utils_Tuple2(
					'fy',
					fixed ? elm$json$Json$Encode$float(y) : elm$json$Json$Encode$null)
				]));
	});
var author$project$Graph$encodeVerticesForD3 = function (_n0) {
	var vertices = _n0.a.vertices;
	var bags = _n0.a.bags;
	return A2(
		elm$json$Json$Encode$list,
		author$project$Graph$encodeVertexForD3(bags),
		elm$core$Dict$toList(vertices));
};
var author$project$Graph$encodeForD3 = function (graph) {
	var edges = graph.a.edges;
	var manyBody = graph.a.manyBody;
	return elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'vertices',
				author$project$Graph$encodeVerticesForD3(graph)),
				_Utils_Tuple2(
				'edges',
				author$project$Graph$encodeEdgesForD3(edges)),
				_Utils_Tuple2(
				'manyBody',
				author$project$Graph$encodeManyBody(manyBody))
			]));
};
var author$project$Graph$getBag = F2(
	function (bagId, _n0) {
		var bags = _n0.a.bags;
		return A2(elm$core$Dict$get, bagId, bags);
	});
var author$project$Graph$getBags = function (_n0) {
	var bags = _n0.a.bags;
	return bags;
};
var elm$core$List$sum = function (numbers) {
	return A3(elm$core$List$foldl, elm$core$Basics$add, 0, numbers);
};
var author$project$Graph$getCenter = F2(
	function (l, _n0) {
		var vertices = _n0.a.vertices;
		var selectedVertices = elm$core$Dict$values(
			A2(
				elm$core$Dict$filter,
				F2(
					function (vertexId, _n1) {
						return A2(elm$core$Set$member, vertexId, l);
					}),
				vertices));
		var xValues = A2(
			elm$core$List$map,
			function ($) {
				return $.x;
			},
			selectedVertices);
		var yValues = A2(
			elm$core$List$map,
			function ($) {
				return $.y;
			},
			selectedVertices);
		var n = elm$core$List$length(selectedVertices);
		return (!n) ? elm$core$Maybe$Nothing : elm$core$Maybe$Just(
			{
				x: elm$core$List$sum(xValues) / n,
				y: elm$core$List$sum(yValues) / n
			});
	});
var author$project$Colision$ccw = F3(
	function (_n0, _n1, _n2) {
		var px = _n0.a;
		var py = _n0.b;
		var qx = _n1.a;
		var qy = _n1.b;
		var rx = _n2.a;
		var ry = _n2.b;
		return 0 > (((qy - py) * (rx - qx)) - ((qx - px) * (ry - qy)));
	});
var author$project$Colision$collideLineSegments = F2(
	function (_n0, _n1) {
		var p1 = _n0.a;
		var q1 = _n0.b;
		var p2 = _n1.a;
		var q2 = _n1.b;
		return (!_Utils_eq(
			A3(author$project$Colision$ccw, p1, q1, p2),
			A3(author$project$Colision$ccw, p1, q1, q2))) && (!_Utils_eq(
			A3(author$project$Colision$ccw, p2, q2, p1),
			A3(author$project$Colision$ccw, p2, q2, q1)));
	});
var author$project$Graph$getEdgeIdsIntersectingLineSegment = F2(
	function (lineSegment, _n0) {
		var vertices = _n0.a.vertices;
		var edges = _n0.a.edges;
		var intersecting = function (_n2) {
			var s = _n2.a;
			var t = _n2.b;
			var _n1 = _Utils_Tuple2(
				A2(elm$core$Dict$get, s, vertices),
				A2(elm$core$Dict$get, t, vertices));
			if ((_n1.a.$ === 'Just') && (_n1.b.$ === 'Just')) {
				var v = _n1.a.a;
				var w = _n1.b.a;
				return A2(
					author$project$Colision$collideLineSegments,
					lineSegment,
					_Utils_Tuple2(
						_Utils_Tuple2(v.x, v.y),
						_Utils_Tuple2(w.x, w.y)));
			} else {
				return false;
			}
		};
		return elm$core$Set$fromList(
			A2(
				elm$core$List$filter,
				intersecting,
				elm$core$Dict$keys(edges)));
	});
var author$project$Graph$getManyBody = function (_n0) {
	var manyBody = _n0.a.manyBody;
	return manyBody;
};
var elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (maybe.$ === 'Just') {
			var value = maybe.a;
			return elm$core$Maybe$Just(
				f(value));
		} else {
			return elm$core$Maybe$Nothing;
		}
	});
var author$project$Graph$getRoundedVertexPosition = F2(
	function (vertexId, _n0) {
		var vertices = _n0.a.vertices;
		return A2(
			elm$core$Maybe$map,
			function (_n1) {
				var x = _n1.x;
				var y = _n1.y;
				return {
					x: elm$core$Basics$round(x),
					y: elm$core$Basics$round(y)
				};
			},
			A2(elm$core$Dict$get, vertexId, vertices));
	});
var elm$core$Basics$min = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) < 0) ? x : y;
	});
var author$project$Colision$collideRectWithCircle = F2(
	function (rect, circle) {
		var _n0 = _Utils_Tuple2(
			circle.x - A2(
				elm$core$Basics$max,
				rect.x,
				A2(elm$core$Basics$min, circle.x, rect.x + rect.width)),
			circle.y - A2(
				elm$core$Basics$max,
				rect.y,
				A2(elm$core$Basics$min, circle.y, rect.y + rect.height)));
		var deltaX = _n0.a;
		var deltaY = _n0.b;
		return _Utils_cmp((deltaX * deltaX) + (deltaY * deltaY), circle.radius * circle.radius) < 0;
	});
var author$project$Graph$getVertexIdsInRect = F2(
	function (rect, _n0) {
		var vertices = _n0.a.vertices;
		var inRect = F2(
			function (_n1, v) {
				return A2(
					author$project$Colision$collideRectWithCircle,
					rect,
					{radius: v.radius, x: v.x, y: v.y});
			});
		return elm$core$Set$fromList(
			elm$core$Dict$keys(
				A2(elm$core$Dict$filter, inRect, vertices)));
	});
var author$project$Graph$getVerticesIn = F2(
	function (vertexIds, _n0) {
		var vertices = _n0.a.vertices;
		return A2(
			elm$core$Dict$filter,
			F2(
				function (vertexId, _n1) {
					return A2(elm$core$Set$member, vertexId, vertexIds);
				}),
			vertices);
	});
var author$project$Graph$getVerticesInBag = F2(
	function (bagId, _n0) {
		var vertices = _n0.a.vertices;
		return elm$core$Set$fromList(
			elm$core$Dict$keys(
				A2(
					elm$core$Dict$filter,
					F2(
						function (_n1, v) {
							return A2(elm$core$Set$member, bagId, v.inBags);
						}),
					vertices)));
	});
var author$project$Graph$inducedEdges = F2(
	function (vs, _n0) {
		var edges = _n0.a.edges;
		return elm$core$Set$fromList(
			A2(
				elm$core$List$filter,
				function (_n1) {
					var sourceId = _n1.a;
					var targetId = _n1.b;
					return A2(elm$core$Set$member, sourceId, vs) && A2(elm$core$Set$member, targetId, vs);
				},
				elm$core$Dict$keys(edges)));
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
var author$project$Graph$inducedVertices = F2(
	function (es, _n0) {
		var vertices = _n0.a.vertices;
		return elm$core$Set$fromList(
			A2(
				elm$core$List$concatMap,
				function (_n1) {
					var s = _n1.a;
					var t = _n1.b;
					return _List_fromArray(
						[s, t]);
				},
				elm$core$Set$toList(es)));
	});
var elm$core$Dict$update = F3(
	function (targetKey, alter, dictionary) {
		var _n0 = alter(
			A2(elm$core$Dict$get, targetKey, dictionary));
		if (_n0.$ === 'Just') {
			var value = _n0.a;
			return A3(elm$core$Dict$insert, targetKey, value, dictionary);
		} else {
			return A2(elm$core$Dict$remove, targetKey, dictionary);
		}
	});
var author$project$Graph$moveCenterX = F3(
	function (l, x, graph) {
		var p = graph.a;
		var vertices = p.vertices;
		var centerX = A2(
			elm$core$Maybe$withDefault,
			0,
			A2(
				elm$core$Maybe$map,
				function ($) {
					return $.x;
				},
				A2(author$project$Graph$getCenter, l, graph)));
		var move = function (id) {
			return A2(
				elm$core$Dict$update,
				id,
				elm$core$Maybe$map(
					function (v) {
						return _Utils_update(
							v,
							{x: (x + v.x) - centerX});
					}));
		};
		return author$project$Graph$Graph(
			_Utils_update(
				p,
				{
					vertices: A3(elm$core$Set$foldr, move, vertices, l)
				}));
	});
var author$project$Graph$moveCenterY = F3(
	function (l, y, graph) {
		var p = graph.a;
		var vertices = p.vertices;
		var centerY = A2(
			elm$core$Maybe$withDefault,
			0,
			A2(
				elm$core$Maybe$map,
				function ($) {
					return $.y;
				},
				A2(author$project$Graph$getCenter, l, graph)));
		var move = function (id) {
			return A2(
				elm$core$Dict$update,
				id,
				elm$core$Maybe$map(
					function (v) {
						return _Utils_update(
							v,
							{y: (y + v.y) - centerY});
					}));
		};
		return author$project$Graph$Graph(
			_Utils_update(
				p,
				{
					vertices: A3(elm$core$Set$foldr, move, vertices, l)
				}));
	});
var author$project$Graph$updateBag = F3(
	function (bagId, up, _n0) {
		var p = _n0.a;
		return author$project$Graph$Graph(
			_Utils_update(
				p,
				{
					bags: A3(
						elm$core$Dict$update,
						bagId,
						elm$core$Maybe$map(up),
						p.bags)
				}));
	});
var author$project$Graph$movePullCenterToCenter = F2(
	function (maybeBagId, graph) {
		if (maybeBagId.$ === 'Nothing') {
			return graph;
		} else {
			var bagId = maybeBagId.a;
			var vs = A2(author$project$Graph$getVerticesInBag, bagId, graph);
			var maybeCenter = A2(author$project$Graph$getCenter, vs, graph);
			var up = function (bag) {
				if (maybeCenter.$ === 'Nothing') {
					return bag;
				} else {
					var x = maybeCenter.a.x;
					var y = maybeCenter.a.y;
					return _Utils_update(
						bag,
						{pullX: x, pullY: y});
				}
			};
			return A3(author$project$Graph$updateBag, bagId, up, graph);
		}
	});
var author$project$Graph$moveVertices = function (l) {
	var move = function (_n0) {
		var id = _n0.id;
		var x = _n0.x;
		var y = _n0.y;
		return A2(
			elm$core$Dict$update,
			id,
			elm$core$Maybe$map(
				function (v) {
					return _Utils_update(
						v,
						{x: x, y: y});
				}));
	};
	return author$project$Graph$mapVertices(
		function (vs) {
			return A3(elm$core$List$foldr, move, vs, l);
		});
};
var elm$core$Set$remove = F2(
	function (key, _n0) {
		var dict = _n0.a;
		return elm$core$Set$Set_elm_builtin(
			A2(elm$core$Dict$remove, key, dict));
	});
var author$project$Graph$removeBag = F2(
	function (bagId, _n0) {
		var p = _n0.a;
		return author$project$Graph$Graph(
			_Utils_update(
				p,
				{
					bags: A2(elm$core$Dict$remove, bagId, p.bags),
					vertices: A2(
						elm$core$Dict$map,
						F2(
							function (_n1, v) {
								return _Utils_update(
									v,
									{
										inBags: A2(elm$core$Set$remove, bagId, v.inBags)
									});
							}),
						p.vertices)
				}));
	});
var elm$core$Basics$not = _Basics_not;
var author$project$Graph$removeVertices = function (l) {
	var edgeToRemove = F2(
		function (_n0, _n1) {
			var v = _n0.a;
			var w = _n0.b;
			return !(A2(elm$core$Set$member, v, l) || A2(elm$core$Set$member, w, l));
		});
	return A2(
		elm$core$Basics$composeR,
		author$project$Graph$mapVertices(
			function (vs) {
				return A3(elm$core$Set$foldr, elm$core$Dict$remove, vs, l);
			}),
		author$project$Graph$mapEdges(
			elm$core$Dict$filter(edgeToRemove)));
};
var author$project$Graph$updateEdges = F2(
	function (l, up) {
		return author$project$Graph$mapEdges(
			function (es) {
				return A3(
					elm$core$Set$foldr,
					function (e) {
						return A2(
							elm$core$Dict$update,
							e,
							elm$core$Maybe$map(up));
					},
					es,
					l);
			});
	});
var author$project$Graph$updateManyBody = F2(
	function (up, _n0) {
		var p = _n0.a;
		return author$project$Graph$Graph(
			_Utils_update(
				p,
				{
					manyBody: up(p.manyBody)
				}));
	});
var author$project$Graph$updateVertices = F2(
	function (l, up) {
		return author$project$Graph$mapVertices(
			function (vs) {
				return A3(
					elm$core$Set$foldr,
					function (v) {
						return A2(
							elm$core$Dict$update,
							v,
							elm$core$Maybe$map(up));
					},
					vs,
					l);
			});
	});
var author$project$Main$Brush = F2(
	function (start, mousePos) {
		return {mousePos: mousePos, start: start};
	});
var author$project$Main$BrushingForSelection = function (a) {
	return {$: 'BrushingForSelection', a: a};
};
var author$project$Main$DraggingPullCenter = F3(
	function (a, b, c) {
		return {$: 'DraggingPullCenter', a: a, b: b, c: c};
	});
var author$project$Main$DraggingSelection = F2(
	function (a, b) {
		return {$: 'DraggingSelection', a: a, b: b};
	});
var author$project$Main$EdgeBrush = F2(
	function (sourceId, mousePos) {
		return {mousePos: mousePos, sourceId: sourceId};
	});
var author$project$Main$Idle = {$: 'Idle'};
var author$project$Main$LineSelector = {$: 'LineSelector'};
var author$project$Main$Select = function (a) {
	return {$: 'Select', a: a};
};
var author$project$Main$toD3Drag = _Platform_outgoingPort(
	'toD3Drag',
	elm$json$Json$Encode$list(
		function ($) {
			return elm$json$Json$Encode$object(
				_List_fromArray(
					[
						_Utils_Tuple2(
						'id',
						elm$json$Json$Encode$int($.id)),
						_Utils_Tuple2(
						'x',
						elm$json$Json$Encode$float($.x)),
						_Utils_Tuple2(
						'y',
						elm$json$Json$Encode$float($.y))
					]));
		}));
var author$project$Main$toD3DragEnd = _Platform_outgoingPort('toD3DragEnd', elm$core$Basics$identity);
var author$project$Main$toD3DragStart = _Platform_outgoingPort(
	'toD3DragStart',
	function ($) {
		var a = $.a;
		var b = $.b;
		return A2(
			elm$json$Json$Encode$list,
			elm$core$Basics$identity,
			_List_fromArray(
				[
					elm$core$Basics$identity(a),
					elm$json$Json$Encode$list(
					function ($) {
						return elm$json$Json$Encode$object(
							_List_fromArray(
								[
									_Utils_Tuple2(
									'id',
									elm$json$Json$Encode$int($.id)),
									_Utils_Tuple2(
									'x',
									elm$json$Json$Encode$float($.x)),
									_Utils_Tuple2(
									'y',
									elm$json$Json$Encode$float($.y))
								]));
					})(b)
				]));
	});
var author$project$Main$toD3GraphData = _Platform_outgoingPort('toD3GraphData', elm$core$Basics$identity);
var author$project$Main$toD3RestartWithAlpha = _Platform_outgoingPort('toD3RestartWithAlpha', elm$json$Json$Encode$float);
var author$project$Main$toD3StopSimulation = _Platform_outgoingPort(
	'toD3StopSimulation',
	function ($) {
		return elm$json$Json$Encode$null;
	});
var elm$core$Basics$clamp = F3(
	function (low, high, number) {
		return (_Utils_cmp(number, low) < 0) ? low : ((_Utils_cmp(number, high) > 0) ? high : number);
	});
var elm$core$Platform$Cmd$batch = _Platform_batch;
var elm$core$Platform$Cmd$none = elm$core$Platform$Cmd$batch(_List_Nil);
var elm$core$Dict$isEmpty = function (dict) {
	if (dict.$ === 'RBEmpty_elm_builtin') {
		return true;
	} else {
		return false;
	}
};
var elm$core$Set$isEmpty = function (_n0) {
	var dict = _n0.a;
	return elm$core$Dict$isEmpty(dict);
};
var elm$core$String$toFloat = _String_toFloat;
var author$project$Main$update = F2(
	function (msg, m) {
		var sendGraphData = function (graph) {
			return author$project$Main$toD3GraphData(
				author$project$Graph$encodeForD3(graph));
		};
		var reheatSimulationIfVaderIsOn = m.vaderIsOn ? author$project$Main$toD3RestartWithAlpha(0.6) : elm$core$Platform$Cmd$none;
		switch (msg.$) {
			case 'NoOp':
				return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
			case 'AltKeyDown':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{altIsDown: true}),
					elm$core$Platform$Cmd$none);
			case 'AltKeyUp':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{altIsDown: false}),
					elm$core$Platform$Cmd$none);
			case 'ShiftKeyDown':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{shiftIsDown: true}),
					elm$core$Platform$Cmd$none);
			case 'ShiftKeyUp':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{shiftIsDown: false}),
					elm$core$Platform$Cmd$none);
			case 'UpdateWindowSize':
				var wS = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{windowSize: wS}),
					elm$core$Platform$Cmd$none);
			case 'DrawToolClicked':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							selectedEdges: elm$core$Set$empty,
							selectedVertices: elm$core$Set$empty,
							tool: author$project$Main$Draw(elm$core$Maybe$Nothing)
						}),
					elm$core$Platform$Cmd$none);
			case 'SelectToolClicked':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							tool: author$project$Main$Select(author$project$Main$Idle)
						}),
					elm$core$Platform$Cmd$none);
			case 'RectSelectorClicked':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							selector: author$project$Main$RectSelector,
							tool: author$project$Main$Select(author$project$Main$Idle)
						}),
					elm$core$Platform$Cmd$none);
			case 'LineSelectorClicked':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							selector: author$project$Main$LineSelector,
							tool: author$project$Main$Select(author$project$Main$Idle)
						}),
					elm$core$Platform$Cmd$none);
			case 'MouseMove':
				var mousePos = msg.a;
				var _n1 = m.tool;
				_n1$4:
				while (true) {
					if (_n1.$ === 'Draw') {
						if (_n1.a.$ === 'Just') {
							var sourceId = _n1.a.a.sourceId;
							return _Utils_Tuple2(
								_Utils_update(
									m,
									{
										tool: author$project$Main$Draw(
											elm$core$Maybe$Just(
												A2(author$project$Main$EdgeBrush, sourceId, mousePos)))
									}),
								elm$core$Platform$Cmd$none);
						} else {
							break _n1$4;
						}
					} else {
						switch (_n1.a.$) {
							case 'BrushingForSelection':
								var start = _n1.a.a.start;
								var _n2 = function () {
									var _n3 = m.selector;
									if (_n3.$ === 'RectSelector') {
										var miny = A2(elm$core$Basics$min, start.y, mousePos.y);
										var minx = A2(elm$core$Basics$min, start.x, mousePos.x);
										var maxy = A2(elm$core$Basics$max, start.y, mousePos.y);
										var maxx = A2(elm$core$Basics$max, start.x, mousePos.x);
										var newSelectedVertices_ = A2(
											author$project$Graph$getVertexIdsInRect,
											{height: maxy - miny, width: maxx - minx, x: minx, y: miny},
											m.graph);
										return _Utils_Tuple2(
											newSelectedVertices_,
											A2(author$project$Graph$inducedEdges, newSelectedVertices_, m.graph));
									} else {
										var newSelectedEdges_ = A2(
											author$project$Graph$getEdgeIdsIntersectingLineSegment,
											_Utils_Tuple2(
												_Utils_Tuple2(start.x, start.y),
												_Utils_Tuple2(mousePos.x, mousePos.y)),
											m.graph);
										return _Utils_Tuple2(
											A2(author$project$Graph$inducedVertices, newSelectedEdges_, m.graph),
											newSelectedEdges_);
									}
								}();
								var newSelectedVertices = _n2.a;
								var newSelectedEdges = _n2.b;
								return _Utils_Tuple2(
									_Utils_update(
										m,
										{
											selectedEdges: newSelectedEdges,
											selectedVertices: newSelectedVertices,
											tool: author$project$Main$Select(
												author$project$Main$BrushingForSelection(
													A2(author$project$Main$Brush, start, mousePos)))
										}),
									elm$core$Platform$Cmd$none);
							case 'DraggingSelection':
								var _n4 = _n1.a;
								var startPositionsOfVertices = _n4.a;
								var start = _n4.b.start;
								var move = function (_n5) {
									var id = _n5.id;
									var x = _n5.x;
									var y = _n5.y;
									return {id: id, x: x + (mousePos.x - start.x), y: y + (mousePos.y - start.y)};
								};
								var newPositions = A2(elm$core$List$map, move, startPositionsOfVertices);
								return _Utils_Tuple2(
									_Utils_update(
										m,
										{
											graph: A2(author$project$Graph$moveVertices, newPositions, m.graph),
											tool: author$project$Main$Select(
												A2(
													author$project$Main$DraggingSelection,
													startPositionsOfVertices,
													A2(author$project$Main$Brush, start, mousePos)))
										}),
									m.vaderIsOn ? author$project$Main$toD3Drag(newPositions) : elm$core$Platform$Cmd$none);
							case 'DraggingPullCenter':
								var _n6 = _n1.a;
								var bagId = _n6.a;
								var startPositionOfThePullCenter = _n6.b;
								var start = _n6.c.start;
								var newGraph = function () {
									var _n7 = startPositionOfThePullCenter;
									var x = _n7.x;
									var y = _n7.y;
									var move = function (bag) {
										return _Utils_update(
											bag,
											{pullX: x + (mousePos.x - start.x), pullY: y + (mousePos.y - start.y)});
									};
									return A3(author$project$Graph$updateBag, bagId, move, m.graph);
								}();
								return _Utils_Tuple2(
									_Utils_update(
										m,
										{
											graph: newGraph,
											tool: author$project$Main$Select(
												A3(
													author$project$Main$DraggingPullCenter,
													bagId,
													startPositionOfThePullCenter,
													A2(author$project$Main$Brush, start, mousePos)))
										}),
									elm$core$Platform$Cmd$batch(
										_List_fromArray(
											[
												sendGraphData(newGraph),
												reheatSimulationIfVaderIsOn
											])));
							default:
								break _n1$4;
						}
					}
				}
				return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
			case 'MouseUp':
				var _n8 = m.tool;
				_n8$3:
				while (true) {
					if (_n8.$ === 'Select') {
						switch (_n8.a.$) {
							case 'BrushingForSelection':
								var start = _n8.a.a.start;
								var mousePos = _n8.a.a.mousePos;
								return _Utils_Tuple2(
									_Utils_update(
										m,
										{
											selectedEdges: _Utils_eq(start, mousePos) ? elm$core$Set$empty : m.selectedEdges,
											selectedVertices: _Utils_eq(start, mousePos) ? elm$core$Set$empty : m.selectedVertices,
											tool: author$project$Main$Select(author$project$Main$Idle)
										}),
									elm$core$Platform$Cmd$none);
							case 'DraggingSelection':
								var _n9 = _n8.a;
								return _Utils_Tuple2(
									_Utils_update(
										m,
										{
											tool: author$project$Main$Select(author$project$Main$Idle)
										}),
									m.vaderIsOn ? author$project$Main$toD3DragEnd(
										author$project$Graph$encodeForD3(m.graph)) : elm$core$Platform$Cmd$none);
							case 'DraggingPullCenter':
								var _n10 = _n8.a;
								return _Utils_Tuple2(
									_Utils_update(
										m,
										{
											tool: author$project$Main$Select(author$project$Main$Idle)
										}),
									elm$core$Platform$Cmd$none);
							default:
								break _n8$3;
						}
					} else {
						break _n8$3;
					}
				}
				return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
			case 'MouseDownOnTransparentInteractionRect':
				var mousePos = msg.a;
				var x = mousePos.x;
				var y = mousePos.y;
				var _n11 = m.tool;
				_n11$2:
				while (true) {
					if (_n11.$ === 'Draw') {
						if (_n11.a.$ === 'Nothing') {
							var _n12 = _n11.a;
							var _n13 = A3(
								author$project$Graph$addVertexAndGetTheNewVertexId,
								mousePos,
								_Utils_Tuple2(m.vertexPreferences, m.maybeSelectedBag),
								m.graph);
							var upGraph = _n13.a;
							var newId = _n13.b;
							var newGraph = A2(author$project$Graph$movePullCenterToCenter, m.maybeSelectedBag, upGraph);
							return _Utils_Tuple2(
								_Utils_update(
									m,
									{
										graph: newGraph,
										tool: author$project$Main$Draw(
											elm$core$Maybe$Just(
												A2(author$project$Main$EdgeBrush, newId, mousePos)))
									}),
								elm$core$Platform$Cmd$none);
						} else {
							break _n11$2;
						}
					} else {
						if (_n11.a.$ === 'Idle') {
							var _n14 = _n11.a;
							return _Utils_Tuple2(
								_Utils_update(
									m,
									{
										tool: author$project$Main$Select(
											author$project$Main$BrushingForSelection(
												A2(author$project$Main$Brush, mousePos, mousePos)))
									}),
								elm$core$Platform$Cmd$none);
						} else {
							break _n11$2;
						}
					}
				}
				return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
			case 'MouseUpOnTransparentInteractionRect':
				var pos = msg.a;
				var _n15 = m.tool;
				if ((_n15.$ === 'Draw') && (_n15.a.$ === 'Just')) {
					var sourceId = _n15.a.a.sourceId;
					var newGraph = A5(
						author$project$Graph$addNeighbour,
						pos,
						sourceId,
						_Utils_Tuple2(m.vertexPreferences, m.maybeSelectedBag),
						m.edgePreferences,
						m.graph);
					return _Utils_Tuple2(
						_Utils_update(
							m,
							{
								graph: newGraph,
								tool: author$project$Main$Draw(elm$core$Maybe$Nothing)
							}),
						elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									sendGraphData(newGraph),
									reheatSimulationIfVaderIsOn
								])));
				} else {
					return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
				}
			case 'MouseOverVertex':
				var id = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							highlightingVertexOnMouseOver: elm$core$Maybe$Just(id)
						}),
					elm$core$Platform$Cmd$none);
			case 'MouseOverEdge':
				var edgeId = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							highlightingEdgeOnMouseOver: elm$core$Maybe$Just(edgeId)
						}),
					elm$core$Platform$Cmd$none);
			case 'MouseOutVertex':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{highlightingVertexOnMouseOver: elm$core$Maybe$Nothing}),
					elm$core$Platform$Cmd$none);
			case 'MouseOutEdge':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{highlightingEdgeOnMouseOver: elm$core$Maybe$Nothing}),
					elm$core$Platform$Cmd$none);
			case 'MouseDownOnVertex':
				var id = msg.a;
				var mousePos = msg.b;
				var _n16 = m.tool;
				_n16$2:
				while (true) {
					if (_n16.$ === 'Draw') {
						if (_n16.a.$ === 'Nothing') {
							var _n17 = _n16.a;
							return _Utils_Tuple2(
								_Utils_update(
									m,
									{
										tool: function () {
											var _n18 = A2(author$project$Graph$getRoundedVertexPosition, id, m.graph);
											if (_n18.$ === 'Just') {
												var pos = _n18.a;
												return author$project$Main$Draw(
													elm$core$Maybe$Just(
														A2(author$project$Main$EdgeBrush, id, pos)));
											} else {
												return author$project$Main$Draw(elm$core$Maybe$Nothing);
											}
										}()
									}),
								elm$core$Platform$Cmd$none);
						} else {
							break _n16$2;
						}
					} else {
						if (_n16.a.$ === 'Idle') {
							var _n19 = _n16.a;
							var idAndPosition = F2(
								function (vertexId, _n21) {
									var x = _n21.x;
									var y = _n21.y;
									return {id: vertexId, x: x, y: y};
								});
							var _n20 = A2(elm$core$Set$member, id, m.selectedVertices) ? (m.altIsDown ? A3(author$project$Graph$duplicateSubgraphAndGetTheDuplicate, m.selectedVertices, m.selectedEdges, m.graph) : _Utils_Tuple3(m.graph, m.selectedVertices, m.selectedEdges)) : _Utils_Tuple3(
								m.graph,
								elm$core$Set$singleton(id),
								elm$core$Set$empty);
							var newGraph = _n20.a;
							var newSelectedVertices = _n20.b;
							var newSelectedEdges = _n20.c;
							var startPositionsOfVertices = elm$core$Dict$values(
								A2(
									elm$core$Dict$map,
									idAndPosition,
									A2(author$project$Graph$getVerticesIn, newSelectedVertices, newGraph)));
							return _Utils_Tuple2(
								_Utils_update(
									m,
									{
										graph: newGraph,
										selectedEdges: newSelectedEdges,
										selectedVertices: newSelectedVertices,
										tool: author$project$Main$Select(
											A2(
												author$project$Main$DraggingSelection,
												startPositionsOfVertices,
												A2(author$project$Main$Brush, mousePos, mousePos)))
									}),
								m.vaderIsOn ? author$project$Main$toD3DragStart(
									_Utils_Tuple2(
										author$project$Graph$encodeForD3(newGraph),
										startPositionsOfVertices)) : elm$core$Platform$Cmd$none);
						} else {
							break _n16$2;
						}
					}
				}
				return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
			case 'MouseDownOnEdge':
				var _n22 = msg.a;
				var s = _n22.a;
				var t = _n22.b;
				var mousePos = msg.b;
				var _n23 = m.tool;
				_n23$2:
				while (true) {
					if (_n23.$ === 'Draw') {
						if (_n23.a.$ === 'Nothing') {
							var _n24 = _n23.a;
							var _n25 = A4(
								author$project$Graph$devideEdge,
								mousePos,
								_Utils_Tuple2(s, t),
								_Utils_Tuple2(m.vertexPreferences, m.maybeSelectedBag),
								m.graph);
							var newGraph = _n25.a;
							var idOfTheNewVertex = _n25.b;
							return _Utils_Tuple2(
								_Utils_update(
									m,
									{
										graph: newGraph,
										highlightingEdgeOnMouseOver: elm$core$Maybe$Nothing,
										tool: author$project$Main$Draw(
											elm$core$Maybe$Just(
												A2(author$project$Main$EdgeBrush, idOfTheNewVertex, mousePos)))
									}),
								elm$core$Platform$Cmd$none);
						} else {
							break _n23$2;
						}
					} else {
						if (_n23.a.$ === 'Idle') {
							var _n26 = _n23.a;
							var idAndPosition = F2(
								function (vertexId, _n28) {
									var x = _n28.x;
									var y = _n28.y;
									return {id: vertexId, x: x, y: y};
								});
							var _n27 = A2(
								elm$core$Set$member,
								_Utils_Tuple2(s, t),
								m.selectedEdges) ? (m.altIsDown ? A3(author$project$Graph$duplicateSubgraphAndGetTheDuplicate, m.selectedVertices, m.selectedEdges, m.graph) : _Utils_Tuple3(m.graph, m.selectedVertices, m.selectedEdges)) : _Utils_Tuple3(
								m.graph,
								elm$core$Set$fromList(
									_List_fromArray(
										[s, t])),
								elm$core$Set$singleton(
									_Utils_Tuple2(s, t)));
							var newGraph = _n27.a;
							var newSelectedVertices = _n27.b;
							var newSelectedEdges = _n27.c;
							var startPositionsOfVertices = elm$core$Dict$values(
								A2(
									elm$core$Dict$map,
									idAndPosition,
									A2(author$project$Graph$getVerticesIn, newSelectedVertices, newGraph)));
							return _Utils_Tuple2(
								_Utils_update(
									m,
									{
										graph: newGraph,
										selectedEdges: newSelectedEdges,
										selectedVertices: newSelectedVertices,
										tool: author$project$Main$Select(
											A2(
												author$project$Main$DraggingSelection,
												startPositionsOfVertices,
												A2(author$project$Main$Brush, mousePos, mousePos)))
									}),
								m.vaderIsOn ? author$project$Main$toD3DragStart(
									_Utils_Tuple2(
										author$project$Graph$encodeForD3(newGraph),
										startPositionsOfVertices)) : elm$core$Platform$Cmd$none);
						} else {
							break _n23$2;
						}
					}
				}
				return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
			case 'MouseUpOnVertex':
				var id = msg.a;
				var _n29 = m.tool;
				if ((_n29.$ === 'Draw') && (_n29.a.$ === 'Just')) {
					var sourceId = _n29.a.a.sourceId;
					var newGraph = _Utils_eq(sourceId, id) ? m.graph : A3(
						author$project$Graph$addEdgeBetweenExistingVertices,
						_Utils_Tuple2(sourceId, id),
						m.edgePreferences,
						m.graph);
					return _Utils_Tuple2(
						_Utils_update(
							m,
							{
								graph: newGraph,
								tool: author$project$Main$Draw(elm$core$Maybe$Nothing)
							}),
						elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									sendGraphData(newGraph),
									reheatSimulationIfVaderIsOn
								])));
				} else {
					return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
				}
			case 'MouseUpOnEdge':
				var edgeId = msg.a;
				var pos = msg.b;
				var _n30 = m.tool;
				if ((_n30.$ === 'Draw') && (_n30.a.$ === 'Just')) {
					var sourceId = _n30.a.a.sourceId;
					var newGraph = A6(
						author$project$Graph$addNeighbourDevidingEdge,
						sourceId,
						pos,
						edgeId,
						_Utils_Tuple2(m.vertexPreferences, m.maybeSelectedBag),
						m.edgePreferences,
						m.graph);
					return _Utils_Tuple2(
						_Utils_update(
							m,
							{
								graph: newGraph,
								highlightingEdgeOnMouseOver: elm$core$Maybe$Nothing,
								tool: author$project$Main$Draw(elm$core$Maybe$Nothing)
							}),
						elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									sendGraphData(newGraph),
									reheatSimulationIfVaderIsOn
								])));
				} else {
					return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
				}
			case 'FromD3Tick':
				var alpha = msg.a.alpha;
				var nodes = msg.a.nodes;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							alpha: alpha,
							graph: A2(author$project$Graph$moveVertices, nodes, m.graph)
						}),
					elm$core$Platform$Cmd$none);
			case 'VaderClicked':
				var newVaderIsOn = !m.vaderIsOn;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{vaderIsOn: newVaderIsOn}),
					newVaderIsOn ? author$project$Main$toD3RestartWithAlpha(1) : author$project$Main$toD3StopSimulation(_Utils_Tuple0));
			case 'FromConvexHullCheckBox':
				var b = msg.a;
				var updateCH = function (bag) {
					return _Utils_update(
						bag,
						{hasConvexHull: b});
				};
				var _n31 = function () {
					var _n32 = m.maybeSelectedBag;
					if (_n32.$ === 'Just') {
						var bagId = _n32.a;
						return _Utils_Tuple2(
							A3(author$project$Graph$updateBag, bagId, updateCH, m.graph),
							m.bagPreferences);
					} else {
						return _Utils_Tuple2(
							m.graph,
							updateCH(m.bagPreferences));
					}
				}();
				var newGraph = _n31.a;
				var newBagPreferences = _n31.b;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{bagPreferences: newBagPreferences, graph: newGraph}),
					elm$core$Platform$Cmd$none);
			case 'FromPullIsActiveCheckBox':
				var b = msg.a;
				var updatePullIsActive = function (bag) {
					return _Utils_update(
						bag,
						{pullIsActive: b});
				};
				var _n33 = function () {
					var _n34 = m.maybeSelectedBag;
					if (_n34.$ === 'Just') {
						var bagId = _n34.a;
						return _Utils_Tuple2(
							A3(author$project$Graph$updateBag, bagId, updatePullIsActive, m.graph),
							m.bagPreferences);
					} else {
						return _Utils_Tuple2(
							m.graph,
							updatePullIsActive(m.bagPreferences));
					}
				}();
				var newGraph = _n33.a;
				var newBagPreferences = _n33.b;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{bagPreferences: newBagPreferences, graph: newGraph}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								sendGraphData(newGraph),
								reheatSimulationIfVaderIsOn
							])));
			case 'FromDraggableCenterCheckBox':
				var b = msg.a;
				var updateDraggablePullCenter = function (bag) {
					return _Utils_update(
						bag,
						{draggablePullCenter: b});
				};
				var _n35 = function () {
					var _n36 = m.maybeSelectedBag;
					if (_n36.$ === 'Just') {
						var bagId = _n36.a;
						return _Utils_Tuple2(
							A3(author$project$Graph$updateBag, bagId, updateDraggablePullCenter, m.graph),
							m.bagPreferences);
					} else {
						return _Utils_Tuple2(
							m.graph,
							updateDraggablePullCenter(m.bagPreferences));
					}
				}();
				var newGraph = _n35.a;
				var newBagPreferences = _n35.b;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{bagPreferences: newBagPreferences, graph: newGraph}),
					elm$core$Platform$Cmd$none);
			case 'FromPullXStrengthInput':
				var str = msg.a;
				var _n37 = m.maybeSelectedBag;
				if (_n37.$ === 'Just') {
					var bagId = _n37.a;
					var oldPullXStrength = A3(
						elm$core$Basics$clamp,
						0,
						1,
						A2(
							elm$core$Maybe$withDefault,
							0,
							A2(
								elm$core$Maybe$map,
								function ($) {
									return $.pullXStrength;
								},
								A2(
									elm$core$Dict$get,
									bagId,
									author$project$Graph$getBags(m.graph)))));
					var newPullXStrength = A2(
						elm$core$Maybe$withDefault,
						oldPullXStrength,
						elm$core$String$toFloat(str));
					var newGraph = A3(
						author$project$Graph$updateBag,
						bagId,
						function (bag) {
							return _Utils_update(
								bag,
								{pullXStrength: newPullXStrength});
						},
						m.graph);
					return _Utils_Tuple2(
						_Utils_update(
							m,
							{graph: newGraph}),
						elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									sendGraphData(newGraph),
									reheatSimulationIfVaderIsOn
								])));
				} else {
					var oldCashedBag = m.bagPreferences;
					var newPullXStrength = A2(
						elm$core$Maybe$withDefault,
						m.bagPreferences.pullXStrength,
						elm$core$String$toFloat(str));
					return _Utils_Tuple2(
						_Utils_update(
							m,
							{
								bagPreferences: _Utils_update(
									oldCashedBag,
									{pullXStrength: newPullXStrength})
							}),
						elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									sendGraphData(m.graph),
									reheatSimulationIfVaderIsOn
								])));
				}
			case 'FromPullYStrengthInput':
				var str = msg.a;
				var _n38 = m.maybeSelectedBag;
				if (_n38.$ === 'Just') {
					var bagId = _n38.a;
					var oldPullYStrength = A2(
						elm$core$Maybe$withDefault,
						0,
						A2(
							elm$core$Maybe$map,
							function ($) {
								return $.pullYStrength;
							},
							A2(
								elm$core$Dict$get,
								bagId,
								author$project$Graph$getBags(m.graph))));
					var newPullYStrength = A3(
						elm$core$Basics$clamp,
						0,
						1,
						A2(
							elm$core$Maybe$withDefault,
							oldPullYStrength,
							elm$core$String$toFloat(str)));
					var newGraph = A3(
						author$project$Graph$updateBag,
						bagId,
						function (bag) {
							return _Utils_update(
								bag,
								{pullYStrength: newPullYStrength});
						},
						m.graph);
					return _Utils_Tuple2(
						_Utils_update(
							m,
							{graph: newGraph}),
						elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									sendGraphData(newGraph),
									reheatSimulationIfVaderIsOn
								])));
				} else {
					var oldCashedBag = m.bagPreferences;
					var newPullYStrength = A2(
						elm$core$Maybe$withDefault,
						m.bagPreferences.pullYStrength,
						elm$core$String$toFloat(str));
					return _Utils_Tuple2(
						_Utils_update(
							m,
							{
								bagPreferences: _Utils_update(
									oldCashedBag,
									{pullYStrength: newPullYStrength})
							}),
						elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									sendGraphData(m.graph),
									reheatSimulationIfVaderIsOn
								])));
				}
			case 'FromPullXInput':
				var str = msg.a;
				var updatePullX = function (bag) {
					return _Utils_update(
						bag,
						{
							pullX: A2(
								elm$core$Maybe$withDefault,
								0,
								elm$core$String$toFloat(str))
						});
				};
				var _n39 = function () {
					var _n40 = m.maybeSelectedBag;
					if (_n40.$ === 'Just') {
						var bagId = _n40.a;
						return _Utils_Tuple2(
							A3(author$project$Graph$updateBag, bagId, updatePullX, m.graph),
							m.bagPreferences);
					} else {
						return _Utils_Tuple2(
							m.graph,
							updatePullX(m.bagPreferences));
					}
				}();
				var newGraph = _n39.a;
				var newBagPreferences = _n39.b;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{bagPreferences: newBagPreferences, graph: newGraph}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								sendGraphData(newGraph),
								reheatSimulationIfVaderIsOn
							])));
			case 'FromPullYInput':
				var str = msg.a;
				var updatePullY = function (bag) {
					return _Utils_update(
						bag,
						{
							pullY: A2(
								elm$core$Maybe$withDefault,
								0,
								elm$core$String$toFloat(str))
						});
				};
				var _n41 = function () {
					var _n42 = m.maybeSelectedBag;
					if (_n42.$ === 'Just') {
						var bagId = _n42.a;
						return _Utils_Tuple2(
							A3(author$project$Graph$updateBag, bagId, updatePullY, m.graph),
							m.bagPreferences);
					} else {
						return _Utils_Tuple2(
							m.graph,
							updatePullY(m.bagPreferences));
					}
				}();
				var newGraph = _n41.a;
				var newBagPreferences = _n41.b;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{bagPreferences: newBagPreferences, graph: newGraph}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								sendGraphData(newGraph),
								reheatSimulationIfVaderIsOn
							])));
			case 'FromVertexColorPicker':
				var newColor = msg.a;
				var updateColor = function (v) {
					return _Utils_update(
						v,
						{color: newColor});
				};
				var newVertexPreferences = elm$core$Set$isEmpty(m.selectedVertices) ? updateColor(m.vertexPreferences) : m.vertexPreferences;
				var newGraph = A3(author$project$Graph$updateVertices, m.selectedVertices, updateColor, m.graph);
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{graph: newGraph, vertexPreferences: newVertexPreferences}),
					elm$core$Platform$Cmd$none);
			case 'FromEdgeColorPicker':
				var newColor = msg.a;
				var updateColor = function (e) {
					return _Utils_update(
						e,
						{color: newColor});
				};
				var newGraph = A3(author$project$Graph$updateEdges, m.selectedEdges, updateColor, m.graph);
				var newEdgePreferences = elm$core$Set$isEmpty(m.selectedEdges) ? updateColor(m.edgePreferences) : m.edgePreferences;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{edgePreferences: newEdgePreferences, graph: newGraph}),
					elm$core$Platform$Cmd$none);
			case 'FromFixedCheckBox':
				var b = msg.a;
				var updateFixed = function (v) {
					return _Utils_update(
						v,
						{fixed: b});
				};
				var newVertexPreferences = elm$core$Set$isEmpty(m.selectedVertices) ? updateFixed(m.vertexPreferences) : m.vertexPreferences;
				var newGraph = A3(author$project$Graph$updateVertices, m.selectedVertices, updateFixed, m.graph);
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{graph: newGraph, vertexPreferences: newVertexPreferences}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								sendGraphData(newGraph)
							])));
			case 'FromRadiusInput':
				var str = msg.a;
				var newRadius = A3(
					elm$core$Basics$clamp,
					4,
					20,
					A2(
						elm$core$Maybe$withDefault,
						0,
						elm$core$String$toFloat(str)));
				var updateRadius = function (v) {
					return _Utils_update(
						v,
						{radius: newRadius});
				};
				var newVertexPreferences = elm$core$Set$isEmpty(m.selectedVertices) ? updateRadius(m.vertexPreferences) : m.vertexPreferences;
				var newGraph = A3(author$project$Graph$updateVertices, m.selectedVertices, updateRadius, m.graph);
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{graph: newGraph, vertexPreferences: newVertexPreferences}),
					elm$core$Platform$Cmd$none);
			case 'FromThicknessInput':
				var str = msg.a;
				var newThickness = A3(
					elm$core$Basics$clamp,
					1,
					20,
					A2(
						elm$core$Maybe$withDefault,
						0,
						elm$core$String$toFloat(str)));
				var updateThickness = function (e) {
					return _Utils_update(
						e,
						{thickness: newThickness});
				};
				var newGraph = A3(author$project$Graph$updateEdges, m.selectedEdges, updateThickness, m.graph);
				var newEdgePreferences = elm$core$Set$isEmpty(m.selectedEdges) ? updateThickness(m.edgePreferences) : m.edgePreferences;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{edgePreferences: newEdgePreferences, graph: newGraph}),
					elm$core$Platform$Cmd$none);
			case 'FromDistanceInput':
				var str = msg.a;
				var newDistance = A3(
					elm$core$Basics$clamp,
					0,
					2000,
					A2(
						elm$core$Maybe$withDefault,
						0,
						elm$core$String$toFloat(str)));
				var updateDistance = function (e) {
					return _Utils_update(
						e,
						{distance: newDistance});
				};
				var newEdgePreferences = elm$core$Set$isEmpty(m.selectedEdges) ? updateDistance(m.edgePreferences) : m.edgePreferences;
				var newGraph = A3(author$project$Graph$updateEdges, m.selectedEdges, updateDistance, m.graph);
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{edgePreferences: newEdgePreferences, graph: newGraph}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								sendGraphData(newGraph),
								reheatSimulationIfVaderIsOn
							])));
			case 'FromStrengthInput':
				var str = msg.a;
				var newStrength = A3(
					elm$core$Basics$clamp,
					0,
					1,
					A2(
						elm$core$Maybe$withDefault,
						0,
						elm$core$String$toFloat(str)));
				var updateStrength = function (e) {
					return _Utils_update(
						e,
						{strength: newStrength});
				};
				var newGraph = A3(author$project$Graph$updateEdges, m.selectedEdges, updateStrength, m.graph);
				var newEdgePreferences = elm$core$Set$isEmpty(m.selectedEdges) ? updateStrength(m.edgePreferences) : m.edgePreferences;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{edgePreferences: newEdgePreferences, graph: newGraph}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								sendGraphData(newGraph),
								reheatSimulationIfVaderIsOn
							])));
			case 'FromManyBodyStrengthInput':
				var str = msg.a;
				var currentStrength = author$project$Graph$getManyBody(m.graph).strength;
				var newStrength = A2(
					elm$core$Maybe$withDefault,
					currentStrength,
					elm$core$String$toFloat(str));
				var up = function (mB) {
					return _Utils_update(
						mB,
						{strength: newStrength});
				};
				var newGraph = A2(author$project$Graph$updateManyBody, up, m.graph);
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{graph: newGraph}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								sendGraphData(newGraph),
								reheatSimulationIfVaderIsOn
							])));
			case 'FromManyBodyThetaInput':
				var str = msg.a;
				var currentTheta = author$project$Graph$getManyBody(m.graph).theta;
				var newTheta = A2(
					elm$core$Maybe$withDefault,
					currentTheta,
					elm$core$String$toFloat(str));
				var up = function (mB) {
					return _Utils_update(
						mB,
						{theta: newTheta});
				};
				var newGraph = A2(author$project$Graph$updateManyBody, up, m.graph);
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{graph: newGraph}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								sendGraphData(newGraph),
								reheatSimulationIfVaderIsOn
							])));
			case 'FromManyBodyMinDistanceInput':
				var str = msg.a;
				var currentDistanceMin = author$project$Graph$getManyBody(m.graph).distanceMin;
				var newDistanceMin = A2(
					elm$core$Maybe$withDefault,
					currentDistanceMin,
					elm$core$String$toFloat(str));
				var up = function (mB) {
					return _Utils_update(
						mB,
						{distanceMin: newDistanceMin});
				};
				var newGraph = A2(author$project$Graph$updateManyBody, up, m.graph);
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{graph: newGraph}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								sendGraphData(newGraph),
								reheatSimulationIfVaderIsOn
							])));
			case 'FromManyBodyMaxDistanceInput':
				var str = msg.a;
				var currentDistanceMax = author$project$Graph$getManyBody(m.graph).distanceMax;
				var newDistanceMax = A2(
					elm$core$Maybe$withDefault,
					currentDistanceMax,
					elm$core$String$toFloat(str));
				var up = function (mB) {
					return _Utils_update(
						mB,
						{distanceMax: newDistanceMax});
				};
				var newGraph = A2(author$project$Graph$updateManyBody, up, m.graph);
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{graph: newGraph}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								sendGraphData(newGraph),
								reheatSimulationIfVaderIsOn
							])));
			case 'FromYInput':
				var str = msg.a;
				var _n43 = m.tool;
				if (_n43.$ === 'Select') {
					return _Utils_Tuple2(
						_Utils_update(
							m,
							{
								graph: function () {
									var oldCenterY = function () {
										var _n44 = A2(author$project$Graph$getCenter, m.selectedVertices, m.graph);
										if (_n44.$ === 'Just') {
											var y = _n44.a.y;
											return y;
										} else {
											return 0;
										}
									}();
									var newY = A2(
										elm$core$Maybe$withDefault,
										oldCenterY,
										elm$core$String$toFloat(str));
									return A3(author$project$Graph$moveCenterY, m.selectedVertices, newY, m.graph);
								}()
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
				}
			case 'FromXInput':
				var str = msg.a;
				var _n45 = m.tool;
				if (_n45.$ === 'Select') {
					return _Utils_Tuple2(
						_Utils_update(
							m,
							{
								graph: function () {
									var oldCenterX = function () {
										var _n46 = A2(author$project$Graph$getCenter, m.selectedVertices, m.graph);
										if (_n46.$ === 'Just') {
											var x = _n46.a.x;
											return x;
										} else {
											return 0;
										}
									}();
									var newX = A2(
										elm$core$Maybe$withDefault,
										oldCenterX,
										elm$core$String$toFloat(str));
									return A3(author$project$Graph$moveCenterX, m.selectedVertices, newX, m.graph);
								}()
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
				}
			case 'ClickOnVertexTrash':
				var newGraph = A2(author$project$Graph$removeVertices, m.selectedVertices, m.graph);
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{graph: newGraph, highlightingEdgeOnMouseOver: elm$core$Maybe$Nothing, highlightingVertexOnMouseOver: elm$core$Maybe$Nothing, selectedEdges: elm$core$Set$empty, selectedVertices: elm$core$Set$empty}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								sendGraphData(newGraph),
								reheatSimulationIfVaderIsOn
							])));
			case 'ClickOnEdgeTrash':
				var newGraph = A2(author$project$Graph$removeEdges, m.selectedEdges, m.graph);
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{graph: newGraph, highlightingEdgeOnMouseOver: elm$core$Maybe$Nothing, selectedEdges: elm$core$Set$empty}),
					elm$core$Platform$Cmd$batch(
						_List_fromArray(
							[
								sendGraphData(newGraph),
								reheatSimulationIfVaderIsOn
							])));
			case 'ClickOnEdgeContract':
				var _n47 = elm$core$Set$toList(m.selectedEdges);
				if (_n47.b && (!_n47.b.b)) {
					var selectedEdge = _n47.a;
					var newGraph = A3(author$project$Graph$contractEdge, selectedEdge, m.vertexPreferences, m.graph);
					return _Utils_Tuple2(
						_Utils_update(
							m,
							{graph: newGraph, highlightingEdgeOnMouseOver: elm$core$Maybe$Nothing, selectedEdges: elm$core$Set$empty}),
						elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									sendGraphData(newGraph),
									reheatSimulationIfVaderIsOn
								])));
				} else {
					return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
				}
			case 'ClickOnBagTrash':
				var _n48 = m.maybeSelectedBag;
				if (_n48.$ === 'Just') {
					var bagId = _n48.a;
					var newGraph = A2(author$project$Graph$removeBag, bagId, m.graph);
					return _Utils_Tuple2(
						_Utils_update(
							m,
							{graph: newGraph, maybeSelectedBag: elm$core$Maybe$Nothing}),
						elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									sendGraphData(newGraph),
									reheatSimulationIfVaderIsOn
								])));
				} else {
					return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
				}
			case 'ClickOnBagPlus':
				var _n49 = A3(author$project$Graph$addBagAndGetNewBagId, m.selectedVertices, m.bagPreferences, m.graph);
				var newGraph_ = _n49.a;
				var idOfTheNewBag = _n49.b;
				var newGraph = A2(
					author$project$Graph$movePullCenterToCenter,
					elm$core$Maybe$Just(idOfTheNewBag),
					newGraph_);
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							graph: newGraph,
							maybeSelectedBag: elm$core$Maybe$Just(idOfTheNewBag)
						}),
					elm$core$Platform$Cmd$none);
			case 'MouseOverVertexItem':
				var vertexId = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							highlightingVertexOnMouseOver: elm$core$Maybe$Just(vertexId)
						}),
					elm$core$Platform$Cmd$none);
			case 'MouseOutVertexItem':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{highlightingVertexOnMouseOver: elm$core$Maybe$Nothing}),
					elm$core$Platform$Cmd$none);
			case 'MouseOutEdgeItem':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{highlightingEdgeOnMouseOver: elm$core$Maybe$Nothing}),
					elm$core$Platform$Cmd$none);
			case 'ClickOnVertexItem':
				var vertexId = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							selectedEdges: elm$core$Set$empty,
							selectedVertices: elm$core$Set$singleton(vertexId),
							tool: author$project$Main$Select(author$project$Main$Idle)
						}),
					elm$core$Platform$Cmd$none);
			case 'ClickOnEdgeItem':
				var _n50 = msg.a;
				var sourceId = _n50.a;
				var targetId = _n50.b;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							selectedEdges: elm$core$Set$singleton(
								_Utils_Tuple2(sourceId, targetId)),
							selectedVertices: elm$core$Set$fromList(
								_List_fromArray(
									[sourceId, targetId])),
							tool: author$project$Main$Select(author$project$Main$Idle)
						}),
					elm$core$Platform$Cmd$none);
			case 'MouseOverBagItem':
				var bagId = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							highlightingBagOnMouseOver: elm$core$Maybe$Just(bagId)
						}),
					elm$core$Platform$Cmd$none);
			case 'MouseOverEdgeItem':
				var edgeId = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							highlightingEdgeOnMouseOver: elm$core$Maybe$Just(edgeId)
						}),
					elm$core$Platform$Cmd$none);
			case 'MouseOverPullCenter':
				var bagId = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							highlightingPullCenterOnMouseOver: elm$core$Maybe$Just(bagId)
						}),
					elm$core$Platform$Cmd$none);
			case 'MouseOutBagItem':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{highlightingBagOnMouseOver: elm$core$Maybe$Nothing}),
					elm$core$Platform$Cmd$none);
			case 'MouseOutPullCenter':
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{highlightingPullCenterOnMouseOver: elm$core$Maybe$Nothing}),
					elm$core$Platform$Cmd$none);
			case 'ClickOnBagItem':
				var bagId = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							maybeSelectedBag: _Utils_eq(
								m.maybeSelectedBag,
								elm$core$Maybe$Just(bagId)) ? elm$core$Maybe$Nothing : elm$core$Maybe$Just(bagId),
							selectedVertices: _Utils_eq(
								m.maybeSelectedBag,
								elm$core$Maybe$Just(bagId)) ? elm$core$Set$empty : A2(author$project$Graph$getVerticesInBag, bagId, m.graph),
							tool: author$project$Main$Select(author$project$Main$Idle)
						}),
					elm$core$Platform$Cmd$none);
			case 'ClickOnPullCenter':
				var bagId = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{
							maybeSelectedBag: elm$core$Maybe$Just(bagId),
							selectedVertices: A2(author$project$Graph$getVerticesInBag, bagId, m.graph)
						}),
					elm$core$Platform$Cmd$none);
			case 'MouseDownOnPullCenter':
				var bagId = msg.a;
				var mousePos = msg.b;
				var _n51 = A2(author$project$Graph$getBag, bagId, m.graph);
				if (_n51.$ === 'Just') {
					var bag = _n51.a;
					return _Utils_Tuple2(
						_Utils_update(
							m,
							{
								tool: author$project$Main$Select(
									A3(
										author$project$Main$DraggingPullCenter,
										bagId,
										{x: bag.pullX, y: bag.pullY},
										A2(author$project$Main$Brush, mousePos, mousePos)))
							}),
						elm$core$Platform$Cmd$none);
				} else {
					return _Utils_Tuple2(m, elm$core$Platform$Cmd$none);
				}
			default:
				var leftBarContent = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						m,
						{leftBarContent: leftBarContent}),
					elm$core$Platform$Cmd$none);
		}
	});
var elm$html$Html$div = _VirtualDom_node('div');
var elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var elm$html$Html$text = elm$virtual_dom$VirtualDom$text;
var elm$json$Json$Encode$string = _Json_wrap;
var elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			elm$json$Json$Encode$string(string));
	});
var elm$html$Html$Attributes$id = elm$html$Html$Attributes$stringProperty('id');
var author$project$Main$forDebugging = function (m) {
	var toShow = function () {
		var _n0 = _Utils_Tuple2(m.shiftIsDown, m.altIsDown);
		if (_n0.a) {
			if (_n0.b) {
				return 'Shift + Alt';
			} else {
				return 'Shift';
			}
		} else {
			if (_n0.b) {
				return 'Alt';
			} else {
				return '';
			}
		}
	}();
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$id('forDebugging')
			]),
		_List_fromArray(
			[
				elm$html$Html$text(toShow)
			]));
};
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
var author$project$Icons$icons = {algoVizPlay: 'M50,15A35,35,0,1,0,85,50,35,35,0,0,0,50,15ZM38.17,70.94V29.06L70.21,50Z', chessHorse: 'M30.93,75.32h.21v-.74a1.73,1.73,0,0,1,1.72-1.73h.81a9.51,9.51,0,0,0-.07-3c-.93-4.19-2.07-8.35-3.37-12.44C28.08,50.71,26.79,44,28.92,37c2.38-7.8,7.1-13.34,15.13-15.75a2.87,2.87,0,0,0,1.44-1.19A17.19,17.19,0,0,1,50,15c.1.91.21,1.49.21,2.07,0,.86,0,1.73-.1,2.58-.11,1.2.26,1.92,1.58,2a14.15,14.15,0,0,1,2.16.51c0,2.68,0,2.68,2.43,3.67a17.8,17.8,0,0,1,2.38,1,6.72,6.72,0,0,1,1.57,1.4A46.81,46.81,0,0,0,63.31,32c2.35,2.18,4.81,4.26,7.3,6.28,1.08.88,1.9,1.67,1.36,3.21A3.22,3.22,0,0,0,72.13,43a5.74,5.74,0,0,1-2.53,5c-3.46,1.68-6.19,1.21-8.93-1.56a4,4,0,0,0-4.55-1.2,13.89,13.89,0,0,1-8.09.81l1.3,1.37A60.33,60.33,0,0,1,58.6,58.76c2,3.37,3.64,6.92,3.57,10.93a26.11,26.11,0,0,1-.28,3.16h.34A1.72,1.72,0,0,1,64,74.58v.74h.2a2,2,0,0,1,2,2V85H29V77.27A2,2,0,0,1,30.93,75.32Z', donateHeart: 'M87.92,35.61C86.93,24.4,79,15,68,15A19.91,19.91,0,0,0,49.77,27.37C46.7,20.09,40.14,15,32,15c-11,0-18.91,9.4-19.9,20.61,0,0-.54,2.78.64,7.79a34.43,34.43,0,0,0,10.5,17.5L49.77,85l27-24.1a34.43,34.43,0,0,0,10.5-17.5C88.46,38.39,87.92,35.61,87.92,35.61ZM59.86,65.17a11,11,0,0,1-5.73,3.67,1.62,1.62,0,0,0-1.39,1.83c0,1,0,2,0,3a1.25,1.25,0,0,1-1.35,1.41c-1.08,0-2.18,0-3.27,0a1.32,1.32,0,0,1-1.42-1.5c0-.74,0-1.48,0-2.22,0-1.64-.07-1.7-1.64-2a20.4,20.4,0,0,1-5.83-1.67c-1.45-.71-1.61-1.07-1.19-2.58.31-1.13.62-2.26,1-3.38.41-1.29.76-1.45,2-.83a18.84,18.84,0,0,0,6.47,1.93,7.91,7.91,0,0,0,4.25-.55,3.31,3.31,0,0,0,.78-5.8A9.53,9.53,0,0,0,50,55.16a59.52,59.52,0,0,1-6.62-3c-3.39-2-5.55-4.82-5.29-9,.28-4.67,2.92-7.58,7.2-9.14,1.77-.64,1.78-.61,1.79-2.46,0-.63,0-1.25,0-1.87,0-1.39.27-1.64,1.65-1.67.43,0,.85,0,1.28,0,3,0,3,0,3,2.94,0,2.09,0,2.1,2.09,2.42a18.32,18.32,0,0,1,4.58,1.37,1.34,1.34,0,0,1,.87,1.78c-.38,1.27-.72,2.56-1.13,3.82s-.77,1.37-1.91.82a14.64,14.64,0,0,0-7.27-1.44,5.42,5.42,0,0,0-1.94.4,2.75,2.75,0,0,0-.68,4.89,12.86,12.86,0,0,0,3.16,1.76,58.4,58.4,0,0,1,5.76,2.61C62.44,52.72,64,60.11,59.86,65.17Z', edgeContract: 'M81.61,34.77a11.59,11.59,0,0,1-14.19,1.71l-6.34,6.34,4.36,4.37-11.6,2.42-5.06,5.06q-1.22,5.8-2.42,11.6L42,61.91l-5.51,5.51a11.6,11.6,0,1,1-3.88-3.88L38.11,58c-1.45-1.47-2.9-3-4.36-4.42L44.84,51.3l5.63-5.63,2.31-11.08,4.41,4.35,6.35-6.34a11.58,11.58,0,1,1,18.07,2.17Z', githubCat: 'M85.89,50.89a35.89,35.89,0,0,1-24.52,34c-1.83.35-2.47-.76-2.47-1.72,0-1.18,0-5,0-9.85,0-3.34-1.15-5.53-2.43-6.64,8-.89,16.38-3.92,16.38-17.71a13.85,13.85,0,0,0-3.69-9.63,12.89,12.89,0,0,0-.36-9.5s-3-1-9.85,3.68a34,34,0,0,0-18,0c-6.86-4.64-9.87-3.68-9.87-3.68a12.92,12.92,0,0,0-.35,9.5A13.86,13.86,0,0,0,27.1,49c0,13.75,8.38,16.83,16.35,17.74a7.62,7.62,0,0,0-2.28,4.79c-2,.92-7.24,2.51-10.44-3,0,0-1.9-3.44-5.5-3.7,0,0-3.5,0-.25,2.19,0,0,2.36,1.1,4,5.24,0,0,2.11,7,12.09,4.82,0,3,0,5.25,0,6.1s-.66,2.06-2.45,1.73a35.89,35.89,0,1,1,47.23-34Z', lightning: 'M43.11,51.72H31.64L45.41,15H63.77Q58.61,27.63,53.44,40.25H70.66L29.34,85Z', listOfThree: 'M35.33,34.38H19a4,4,0,0,1-4-4V19a4,4,0,0,1,4-4H35.33a4,4,0,0,1,4,4V30.38A4,4,0,0,1,35.33,34.38Zm49.67-4V19a4,4,0,0,0-4-4H47.38a4,4,0,0,0-4,4V30.38a4,4,0,0,0,4,4H81A4,4,0,0,0,85,30.38Zm0,25.31V44.31a4,4,0,0,0-4-4H47.38a4,4,0,0,0-4,4V55.69a4,4,0,0,0,4,4H81A4,4,0,0,0,85,55.69ZM85,81V69.62a4,4,0,0,0-4-4H47.38a4,4,0,0,0-4,4V81a4,4,0,0,0,4,4H81A4,4,0,0,0,85,81ZM39.33,55.69V44.31a4,4,0,0,0-4-4H19a4,4,0,0,0-4,4V55.69a4,4,0,0,0,4,4H35.33A4,4,0,0,0,39.33,55.69Zm0,25.31V69.62a4,4,0,0,0-4-4H19a4,4,0,0,0-4,4V81a4,4,0,0,0,4,4H35.33A4,4,0,0,0,39.33,81Z', magicStick: 'M64.51,24.52,15,74.19,25.78,85,75.29,35.33ZM56.45,48.39l-5-5L63.35,31.54l4.95,5ZM35.74,25.74,38.38,15l3.95,10.74,7.79,3.1-7.19,3.93L38.21,41l-2.47-9.62L26.64,28Zm35,30.83,3.43-3.52v6l5,2-6.31,2.85-.5,7.18-3.59-8.25-6.94-.5,6.31-3-2.53-6.26Zm7.79-38.43,2.64-2.7V20L85,21.58l-4.84,2.19.44,6.69L77,23l-5.33-.39,4.84-2.31-1.93-4.81Z', pen: 'M29,64.23l13.16,10-13.88,10a3.59,3.59,0,0,1-5-5Zm3.35-4.78L45.48,69l22-30.62-13.16-10Q43.32,43.89,32.32,59.45Zm25.2-34.73L70.2,34.77l7.18-8.85c.05-.36.68-5.3-3.11-8.61A9.65,9.65,0,0,0,64,15.87Z', plus: 'M85,43.9V56.1a3.23,3.23,0,0,1-3.23,3.23H60.22V81.77A3.24,3.24,0,0,1,57,85H44.79a3.24,3.24,0,0,1-3.24-3.23V59.33H18.23A3.23,3.23,0,0,1,15,56.1V43.9a3.23,3.23,0,0,1,3.23-3.23H41.55V18.23A3.24,3.24,0,0,1,44.79,15H57a3.24,3.24,0,0,1,3.23,3.23V40.67H81.77A3.23,3.23,0,0,1,85,43.9Z', pointer: 'M69.51,51.72,52.3,52.87,67.21,79.26,56.89,85,43.11,57.46,30.49,68.93V15Z', preferencesGear: 'M83.91,45.62c-.57-.35-5-3-6.74-3.8L75,36.57c.65-1.74,1.88-6.61,2.07-7.45A2.33,2.33,0,0,0,76.45,27l-3.4-3.4a2.33,2.33,0,0,0-2.17-.62c-.64.14-5.64,1.4-7.45,2.07l-5.25-2.17c-.77-1.68-3.33-6-3.8-6.74a2.33,2.33,0,0,0-2-1.09H47.6a2.33,2.33,0,0,0-2,1.09c-.35.57-3,5-3.8,6.74L36.57,25c-1.74-.65-6.6-1.88-7.45-2.07a2.33,2.33,0,0,0-2.17.62L23.55,27a2.33,2.33,0,0,0-.62,2.17c.14.64,1.4,5.64,2.07,7.45l-2.17,5.25c-1.68.77-6,3.33-6.74,3.8a2.33,2.33,0,0,0-1.09,2v4.8a2.33,2.33,0,0,0,1.09,2c.57.35,5,3,6.74,3.8L25,63.43c-.65,1.74-1.88,6.6-2.07,7.45a2.33,2.33,0,0,0,.62,2.17l3.4,3.4a2.33,2.33,0,0,0,2.17.62c.64-.14,5.64-1.4,7.45-2.07l5.25,2.17c.77,1.68,3.33,6,3.8,6.74a2.33,2.33,0,0,0,2,1.09h4.8a2.33,2.33,0,0,0,2-1.09c.35-.57,3-5,3.8-6.74L63.43,75c1.74.65,6.6,1.88,7.45,2.07a2.33,2.33,0,0,0,2.17-.62l3.4-3.4a2.33,2.33,0,0,0,.62-2.17c-.14-.64-1.4-5.64-2.07-7.45l2.17-5.25c1.68-.77,6-3.33,6.74-3.8a2.33,2.33,0,0,0,1.09-2V47.6A2.33,2.33,0,0,0,83.91,45.62ZM50,65.26A15.26,15.26,0,1,1,65.26,50,15.28,15.28,0,0,1,50,65.26Z', qForQuery: 'M47.12,69.3a30.75,30.75,0,0,1-10.87-1.82,21.22,21.22,0,0,1-8.16-5.37A23.92,23.92,0,0,1,23,53.33a37.44,37.44,0,0,1-1.78-12.11,28.56,28.56,0,0,1,1.93-10.71,24.35,24.35,0,0,1,5.38-8.28,24.09,24.09,0,0,1,8.23-5.34A28.68,28.68,0,0,1,47.35,15a27.69,27.69,0,0,1,10.37,1.89,24.11,24.11,0,0,1,8.12,5.3,23.86,23.86,0,0,1,5.3,8.24A29,29,0,0,1,73,41.07q0,9.43-3.63,15.74a24.06,24.06,0,0,1-9.6,9.47l.24.47q5.1,10.59,10.05,10.59a9,9,0,0,0,2.28-.23A4.28,4.28,0,0,0,74,76.34a6,6,0,0,0,1.27-1.4c.39-.56.82-1.23,1.28-2a.84.84,0,0,1,.7-.5,1.39,1.39,0,0,1,.85.19,1.7,1.7,0,0,1,.62.7,1,1,0,0,1,0,.93A33.27,33.27,0,0,1,77,77.57a20.05,20.05,0,0,1-2.51,3.52,13.51,13.51,0,0,1-3.44,2.79A8.67,8.67,0,0,1,66.69,85,7.5,7.5,0,0,1,62,83.3a19.37,19.37,0,0,1-3.91-4.22,33.54,33.54,0,0,1-3-5.33q-1.27-2.84-2.13-5.07A28.26,28.26,0,0,1,47.12,69.3ZM45,53.13a12.54,12.54,0,0,1,6.11,1.78q3.18,1.79,6,6.58A23.47,23.47,0,0,0,61.54,53a35.87,35.87,0,0,0,1.59-10.79,47.92,47.92,0,0,0-.81-8.82,25.55,25.55,0,0,0-2.67-7.7A15.17,15.17,0,0,0,54.7,20.3a13.39,13.39,0,0,0-7.58-2.05,12.41,12.41,0,0,0-7.23,2.09,16.36,16.36,0,0,0-5,5.45A26.23,26.23,0,0,0,32,33.45a41,41,0,0,0-.93,8.7A52.68,52.68,0,0,0,32,51.78a21.5,21.5,0,0,0,3.09,8,11.85,11.85,0,0,1,1.28-2.43,9.2,9.2,0,0,1,2-2.13,10.24,10.24,0,0,1,2.82-1.51A11.48,11.48,0,0,1,45,53.13Zm2.48,12.92a12.5,12.5,0,0,0,4.17-.7,42.2,42.2,0,0,0-4.06-6.84,5.37,5.37,0,0,0-4.37-2.36,4.16,4.16,0,0,0-2.39.73,8.59,8.59,0,0,0-1.86,1.67,7.24,7.24,0,0,0-1.16,1.85,4.29,4.29,0,0,0-.39,1.24c0,.26.3.63.89,1.12a13,13,0,0,0,2.32,1.47,19.7,19.7,0,0,0,3.21,1.28A12.49,12.49,0,0,0,47.43,66.05Z', selectionLine: 'M24.32,85,15,76.79,23.67,68,33,76.17ZM41.65,67.35l-9.31-8.22L41,50.31l9.31,8.21ZM59,49.69l-9.31-8.21,8.67-8.83,9.31,8.22ZM76.33,32,67,23.83,75.68,15,85,23.21Z', selectionRect: 'M84.75,25.37h-10V15h10Zm-19.93,0h-10V15h10Zm-19.93,0h-10V15h10ZM25,25.37H15V15H25ZM84.75,85h-10V74.63h10ZM64.82,85h-10V74.63h10ZM44.89,85h-10V74.63h10ZM25,85H15V74.63H25Zm0-19.61H15V55H25Zm0-20.74H15V34.28H25ZM85,65.39H75V55H85Zm0-20.74H75V34.28H85Z', trash: 'M25,29.26V24.07H37.5c-.52-3.1.34-6.13,2.27-7.77A5.54,5.54,0,0,1,43.18,15H58a5.84,5.84,0,0,1,2.28,1.3c2.8,2.6,2.33,7.3,2.27,7.77H75v5.19H70.45v48a9.17,9.17,0,0,1-1.13,3.89A7.94,7.94,0,0,1,63.64,85H37.5a8.19,8.19,0,0,1-6.82-3.89,9,9,0,0,1-1.13-3.89v-48Zm17-5.19H58a4.88,4.88,0,0,0,0-3.88,3.42,3.42,0,0,0-1.13-1.3H43.18a3.42,3.42,0,0,0-1.13,1.3A4.88,4.88,0,0,0,42.05,24.07ZM39.77,35.74V72h3.41V35.74Zm9.09,0V72h3.41V35.74Zm9.09,0V72h3.41V35.74Z', vader: 'M65,20c9,5.84,13.54,17.52,12,30l9,34H83c-.93-2.69-2.43-7.25-4-13-4.24-15.56-4.26-22.76-10-26-2.7-1.53-6.06-1.83-8-2a27.14,27.14,0,0,0-10,1V16A26,26,0,0,1,65,20ZM53,48V60H72a14.12,14.12,0,0,0-4-9A14.68,14.68,0,0,0,53,48ZM33,51a14.12,14.12,0,0,0-4,9H48V48A14.68,14.68,0,0,0,33,51ZM66.55,82Q69.27,72,72,62H52ZM49,62H29q2.73,10,5.45,20Zm2,18H61L51,66ZM50,66,40,80H50Z'};
var author$project$Main$AlgorithmVisualizations = {$: 'AlgorithmVisualizations'};
var author$project$Main$GamesOnGraphs = {$: 'GamesOnGraphs'};
var author$project$Main$GraphGenerators = {$: 'GraphGenerators'};
var author$project$Main$GraphOperations = {$: 'GraphOperations'};
var author$project$Main$GraphQueries = {$: 'GraphQueries'};
var author$project$Main$Preferences = {$: 'Preferences'};
var author$project$Main$ThinBarButtonClicked = function (a) {
	return {$: 'ThinBarButtonClicked', a: a};
};
var author$project$Main$leftBarHeaderSize = 38;
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
var elm$core$String$concat = function (strings) {
	return A2(elm$core$String$join, '', strings);
};
var elm$core$String$dropRight = F2(
	function (n, string) {
		return (n < 1) ? string : A3(elm$core$String$slice, 0, -n, string);
	});
var author$project$Graph$bagElementsInCurlyBraces = F2(
	function (bagId, graph) {
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
						A2(author$project$Graph$getVerticesInBag, bagId, graph)))));
		return '{ ' + (inside + ' }');
	});
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
	return {$: 'ClickOnBagItem', a: a};
};
var author$project$Main$ClickOnBagPlus = {$: 'ClickOnBagPlus'};
var author$project$Main$ClickOnBagTrash = {$: 'ClickOnBagTrash'};
var author$project$Main$ClickOnEdgeContract = {$: 'ClickOnEdgeContract'};
var author$project$Main$ClickOnEdgeItem = function (a) {
	return {$: 'ClickOnEdgeItem', a: a};
};
var author$project$Main$ClickOnEdgeTrash = {$: 'ClickOnEdgeTrash'};
var author$project$Main$ClickOnVertexItem = function (a) {
	return {$: 'ClickOnVertexItem', a: a};
};
var author$project$Main$MouseOutBagItem = function (a) {
	return {$: 'MouseOutBagItem', a: a};
};
var author$project$Main$MouseOutEdgeItem = function (a) {
	return {$: 'MouseOutEdgeItem', a: a};
};
var author$project$Main$MouseOutVertexItem = function (a) {
	return {$: 'MouseOutVertexItem', a: a};
};
var author$project$Main$MouseOverBagItem = function (a) {
	return {$: 'MouseOverBagItem', a: a};
};
var author$project$Main$MouseOverEdgeItem = function (a) {
	return {$: 'MouseOverEdgeItem', a: a};
};
var author$project$Main$MouseOverVertexItem = function (a) {
	return {$: 'MouseOverVertexItem', a: a};
};
var elm$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
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
var elm$core$Set$size = function (_n0) {
	var dict = _n0.a;
	return elm$core$Dict$size(dict);
};
var elm$html$Html$Attributes$class = elm$html$Html$Attributes$stringProperty('className');
var elm$html$Html$Attributes$title = elm$html$Html$Attributes$stringProperty('title');
var elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 'Normal', a: a};
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
						author$project$Icons$draw24px(author$project$Icons$icons.trash)
					]))
			]));
	var vertexItem = F2(
		function (vertexId, _n3) {
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						A2(elm$html$Html$Attributes$style, 'padding', '4px 20px 4px 20px'),
						elm$html$Html$Attributes$class(
						A2(elm$core$Set$member, vertexId, m.selectedVertices) ? 'leftBarContent-item-selected' : 'leftBarContent-item'),
						_Utils_eq(
						m.highlightingVertexOnMouseOver,
						elm$core$Maybe$Just(vertexId)) ? A2(elm$html$Html$Attributes$style, 'border-right', '6px solid ' + author$project$Colors$highlightColorForMouseOver) : A2(elm$html$Html$Attributes$style, '', ''),
						elm$html$Html$Events$onMouseOver(
						author$project$Main$MouseOverVertexItem(vertexId)),
						elm$html$Html$Events$onMouseOut(
						author$project$Main$MouseOutVertexItem(vertexId)),
						elm$html$Html$Events$onClick(
						author$project$Main$ClickOnVertexItem(vertexId))
					]),
				_List_fromArray(
					[
						elm$html$Html$text(
						elm$core$String$fromInt(vertexId))
					]));
		});
	var maybeEdgeContractButton = (elm$core$Set$size(m.selectedEdges) === 1) ? A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$class('button'),
				elm$html$Html$Events$onClick(author$project$Main$ClickOnEdgeContract),
				elm$html$Html$Attributes$title('Contract the selected edge')
			]),
		_List_fromArray(
			[
				author$project$Icons$draw24px(author$project$Icons$icons.edgeContract)
			])) : A2(elm$html$Html$div, _List_Nil, _List_Nil);
	var listOfVertices = A2(
		elm$html$Html$div,
		_List_Nil,
		elm$core$List$reverse(
			elm$core$Dict$values(
				A2(
					elm$core$Dict$map,
					vertexItem,
					author$project$Graph$getVertices(m.graph)))));
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
						author$project$Icons$draw24px(author$project$Icons$icons.trash)
					])),
				maybeEdgeContractButton
			]));
	var edgeIdToString = function (_n2) {
		var sourceId = _n2.a;
		var targetId = _n2.b;
		return elm$core$String$fromInt(sourceId) + (' → ' + elm$core$String$fromInt(targetId));
	};
	var edgeItem = F2(
		function (edgeId, _n1) {
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						A2(elm$html$Html$Attributes$style, 'padding', '4px 20px 4px 20px'),
						elm$html$Html$Attributes$class(
						A2(elm$core$Set$member, edgeId, m.selectedEdges) ? 'leftBarContent-item-selected' : 'leftBarContent-item'),
						_Utils_eq(
						m.highlightingEdgeOnMouseOver,
						elm$core$Maybe$Just(edgeId)) ? A2(elm$html$Html$Attributes$style, 'border-right', '6px solid ' + author$project$Colors$highlightColorForMouseOver) : A2(elm$html$Html$Attributes$style, '', ''),
						elm$html$Html$Events$onMouseOver(
						author$project$Main$MouseOverEdgeItem(edgeId)),
						elm$html$Html$Events$onMouseOut(
						author$project$Main$MouseOutEdgeItem(edgeId)),
						elm$html$Html$Events$onClick(
						author$project$Main$ClickOnEdgeItem(edgeId))
					]),
				_List_fromArray(
					[
						elm$html$Html$text(
						edgeIdToString(edgeId))
					]));
		});
	var listOfEdges = A2(
		elm$html$Html$div,
		_List_Nil,
		elm$core$List$reverse(
			elm$core$Dict$values(
				A2(
					elm$core$Dict$map,
					edgeItem,
					author$project$Graph$getEdges(m.graph)))));
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
						author$project$Icons$draw24px(author$project$Icons$icons.trash)
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
						author$project$Icons$draw24px(author$project$Icons$icons.plus)
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
							m.maybeSelectedBag) ? 'leftBarContent-item-selected' : 'leftBarContent-item'),
						_Utils_eq(
						m.highlightingBagOnMouseOver,
						elm$core$Maybe$Just(bagId)) ? A2(elm$html$Html$Attributes$style, 'border-right', '6px solid ' + author$project$Colors$highlightColorForMouseOver) : A2(elm$html$Html$Attributes$style, '', ''),
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
						A2(author$project$Graph$bagElementsInCurlyBraces, bagId, m.graph))
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
					author$project$Graph$getBags(m.graph)))));
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
var author$project$Main$leftBarWidth = 300;
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
		function (title, leftBarContent, icon) {
			var color = _Utils_eq(leftBarContent, m.leftBarContent) ? 'white' : 'rgb(46, 46, 46)';
			return A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$title(title),
						elm$html$Html$Attributes$class('thinBandButton'),
						elm$html$Html$Events$onClick(
						author$project$Main$ThinBarButtonClicked(leftBarContent))
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
				A3(thinBandButton, 'Preferences', author$project$Main$Preferences, author$project$Icons$icons.preferencesGear),
				A3(thinBandButton, 'Lists of Bags, Vertices and Edges', author$project$Main$ListsOfBagsVerticesAndEdges, author$project$Icons$icons.listOfThree),
				A3(thinBandButton, 'Graph Operations', author$project$Main$GraphOperations, author$project$Icons$icons.magicStick),
				A3(thinBandButton, 'Graph Queries', author$project$Main$GraphQueries, author$project$Icons$icons.qForQuery),
				A3(thinBandButton, 'Graph Generators', author$project$Main$GraphGenerators, author$project$Icons$icons.lightning),
				A3(thinBandButton, 'Algorithm Visualizations', author$project$Main$AlgorithmVisualizations, author$project$Icons$icons.algoVizPlay),
				A3(thinBandButton, 'Games on Graphs', author$project$Main$GamesOnGraphs, author$project$Icons$icons.chessHorse)
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
				A2(author$project$Icons$draw40pxWithColor, 'yellow', author$project$Icons$icons.githubCat)
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
	var donateButton = A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$title('Donate')
			]),
		_List_fromArray(
			[
				A2(author$project$Icons$draw40pxWithColor, 'orchid', author$project$Icons$icons.donateHeart)
			]));
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
			var _n0 = m.leftBarContent;
			switch (_n0.$) {
				case 'Preferences':
					return author$project$Main$leftBarContentForPreferences(m);
				case 'ListsOfBagsVerticesAndEdges':
					return author$project$Main$leftBarContentForListsOfBagsVerticesAndEdges(m);
				case 'GraphOperations':
					return author$project$Main$leftBarContentForGraphOperations(m);
				case 'GraphQueries':
					return author$project$Main$leftBarContentForGraphQueries(m);
				case 'GraphGenerators':
					return author$project$Main$leftBarContentForGraphGenerators(m);
				case 'AlgorithmVisualizations':
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
var elm$core$List$minimum = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return elm$core$Maybe$Just(
			A3(elm$core$List$foldl, elm$core$Basics$min, x, xs));
	} else {
		return elm$core$Maybe$Nothing;
	}
};
var author$project$Graph$getMaybeRectAroundVertices = F2(
	function (vertexIds, graph) {
		var extremes = A2(
			elm$core$List$map,
			function (_n5) {
				var x = _n5.x;
				var y = _n5.y;
				var radius = _n5.radius;
				return {bottom: y + radius, left: x - radius, right: x + radius, top: y - radius};
			},
			elm$core$Dict$values(
				A2(author$project$Graph$getVerticesIn, vertexIds, graph)));
		var _n0 = _Utils_Tuple2(
			elm$core$List$minimum(
				A2(
					elm$core$List$map,
					function ($) {
						return $.left;
					},
					extremes)),
			elm$core$List$minimum(
				A2(
					elm$core$List$map,
					function ($) {
						return $.top;
					},
					extremes)));
		var maybeMinx = _n0.a;
		var maybeMiny = _n0.b;
		var _n1 = _Utils_Tuple2(
			elm$core$List$maximum(
				A2(
					elm$core$List$map,
					function ($) {
						return $.right;
					},
					extremes)),
			elm$core$List$maximum(
				A2(
					elm$core$List$map,
					function ($) {
						return $.bottom;
					},
					extremes)));
		var maybeMaxx = _n1.a;
		var maybeMaxy = _n1.b;
		var _n2 = _Utils_Tuple2(
			_Utils_Tuple2(maybeMinx, maybeMiny),
			_Utils_Tuple2(maybeMaxx, maybeMaxy));
		if ((((_n2.a.a.$ === 'Just') && (_n2.a.b.$ === 'Just')) && (_n2.b.a.$ === 'Just')) && (_n2.b.b.$ === 'Just')) {
			var _n3 = _n2.a;
			var minx = _n3.a.a;
			var miny = _n3.b.a;
			var _n4 = _n2.b;
			var maxx = _n4.a.a;
			var maxy = _n4.b.a;
			return elm$core$Maybe$Just(
				{height: maxy - miny, width: maxx - minx, x: minx, y: miny});
		} else {
			return elm$core$Maybe$Nothing;
		}
	});
var author$project$Graph$getVertex = F2(
	function (vertexId, _n0) {
		var vertices = _n0.a.vertices;
		return A2(elm$core$Dict$get, vertexId, vertices);
	});
var author$project$Main$ClickOnPullCenter = function (a) {
	return {$: 'ClickOnPullCenter', a: a};
};
var author$project$Main$MouseDownOnPullCenter = F2(
	function (a, b) {
		return {$: 'MouseDownOnPullCenter', a: a, b: b};
	});
var author$project$Main$MouseDownOnTransparentInteractionRect = function (a) {
	return {$: 'MouseDownOnTransparentInteractionRect', a: a};
};
var author$project$Main$MouseOutPullCenter = function (a) {
	return {$: 'MouseOutPullCenter', a: a};
};
var author$project$Main$MouseOverPullCenter = function (a) {
	return {$: 'MouseOverPullCenter', a: a};
};
var author$project$Main$MouseUpOnTransparentInteractionRect = function (a) {
	return {$: 'MouseUpOnTransparentInteractionRect', a: a};
};
var elm$svg$Svg$circle = elm$svg$Svg$trustedNode('circle');
var author$project$Main$emptySvgElement = A2(elm$svg$Svg$circle, _List_Nil, _List_Nil);
var author$project$Main$pointsForSvg = A2(
	elm$core$Basics$composeR,
	elm$core$List$map(
		function (_n0) {
			var x = _n0.a;
			var y = _n0.b;
			return elm$core$String$fromFloat(x) + (',' + (elm$core$String$fromFloat(y) + ' '));
		}),
	elm$core$String$concat);
var author$project$Main$MouseDownOnEdge = F2(
	function (a, b) {
		return {$: 'MouseDownOnEdge', a: a, b: b};
	});
var author$project$Main$MouseOutEdge = function (a) {
	return {$: 'MouseOutEdge', a: a};
};
var author$project$Main$MouseOverEdge = function (a) {
	return {$: 'MouseOverEdge', a: a};
};
var author$project$Main$MouseUpOnEdge = F2(
	function (a, b) {
		return {$: 'MouseUpOnEdge', a: a, b: b};
	});
var elm$svg$Svg$g = elm$svg$Svg$trustedNode('g');
var elm$svg$Svg$line = elm$svg$Svg$trustedNode('line');
var elm$svg$Svg$Attributes$stroke = _VirtualDom_attribute('stroke');
var elm$svg$Svg$Attributes$strokeOpacity = _VirtualDom_attribute('stroke-opacity');
var elm$svg$Svg$Attributes$strokeWidth = _VirtualDom_attribute('stroke-width');
var elm$svg$Svg$Attributes$x1 = _VirtualDom_attribute('x1');
var elm$svg$Svg$Attributes$x2 = _VirtualDom_attribute('x2');
var elm$svg$Svg$Attributes$y1 = _VirtualDom_attribute('y1');
var elm$svg$Svg$Attributes$y2 = _VirtualDom_attribute('y2');
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
var author$project$Main$viewEdges = function (graph) {
	var vertices = author$project$Graph$getVertices(graph);
	var edges = author$project$Graph$getEdges(graph);
	var drawEdge = F2(
		function (_n1, _n2) {
			var s = _n1.a;
			var t = _n1.b;
			var color = _n2.color;
			var thickness = _n2.thickness;
			var _n0 = _Utils_Tuple2(
				A2(elm$core$Dict$get, s, vertices),
				A2(elm$core$Dict$get, t, vertices));
			if ((_n0.a.$ === 'Just') && (_n0.b.$ === 'Just')) {
				var v = _n0.a.a;
				var w = _n0.b.a;
				return A2(
					elm$svg$Svg$g,
					_List_fromArray(
						[
							A2(
							elm$html$Html$Events$on,
							'mousedown',
							A2(
								elm$json$Json$Decode$map,
								author$project$Main$MouseDownOnEdge(
									_Utils_Tuple2(s, t)),
								author$project$Main$mousePosition)),
							A2(
							elm$html$Html$Events$on,
							'mouseup',
							A2(
								elm$json$Json$Decode$map,
								author$project$Main$MouseUpOnEdge(
									_Utils_Tuple2(s, t)),
								author$project$Main$mousePosition)),
							elm$svg$Svg$Events$onMouseOver(
							author$project$Main$MouseOverEdge(
								_Utils_Tuple2(s, t))),
							elm$svg$Svg$Events$onMouseOut(
							author$project$Main$MouseOutEdge(
								_Utils_Tuple2(s, t)))
						]),
					_List_fromArray(
						[
							A2(
							elm$svg$Svg$line,
							_List_fromArray(
								[
									elm$svg$Svg$Attributes$stroke('red'),
									elm$svg$Svg$Attributes$strokeWidth(
									elm$core$String$fromFloat(thickness + 6)),
									elm$svg$Svg$Attributes$strokeOpacity('0'),
									elm$svg$Svg$Attributes$x1(
									elm$core$String$fromFloat(v.x)),
									elm$svg$Svg$Attributes$y1(
									elm$core$String$fromFloat(v.y)),
									elm$svg$Svg$Attributes$x2(
									elm$core$String$fromFloat(w.x)),
									elm$svg$Svg$Attributes$y2(
									elm$core$String$fromFloat(w.y))
								]),
							_List_Nil),
							A2(
							elm$svg$Svg$line,
							_List_fromArray(
								[
									elm$svg$Svg$Attributes$stroke(color),
									elm$svg$Svg$Attributes$strokeWidth(
									elm$core$String$fromFloat(thickness)),
									elm$svg$Svg$Attributes$x1(
									elm$core$String$fromFloat(v.x)),
									elm$svg$Svg$Attributes$y1(
									elm$core$String$fromFloat(v.y)),
									elm$svg$Svg$Attributes$x2(
									elm$core$String$fromFloat(w.x)),
									elm$svg$Svg$Attributes$y2(
									elm$core$String$fromFloat(w.y))
								]),
							_List_Nil)
						]));
			} else {
				return author$project$Main$emptySvgElement;
			}
		});
	var es = elm$core$Dict$values(
		A2(elm$core$Dict$map, drawEdge, edges));
	return A2(elm$svg$Svg$g, _List_Nil, es);
};
var author$project$ConvexHull$clockwise = F3(
	function (o, a, b) {
		var sub = F2(
			function (_n2, _n3) {
				var x1 = _n2.a;
				var y1 = _n2.b;
				var x2 = _n3.a;
				var y2 = _n3.b;
				return _Utils_Tuple2(x1 - x2, y1 - y2);
			});
		var cross = F2(
			function (_n0, _n1) {
				var x1 = _n0.a;
				var y1 = _n0.b;
				var x2 = _n1.a;
				var y2 = _n1.b;
				return (x1 * y2) - (x2 * y1);
			});
		return A2(
			cross,
			A2(sub, a, o),
			A2(sub, b, o)) <= 0;
	});
var elm$core$List$tail = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return elm$core$Maybe$Just(xs);
	} else {
		return elm$core$Maybe$Nothing;
	}
};
var author$project$ConvexHull$chain = function () {
	var go = F2(
		function (acc, l) {
			go:
			while (true) {
				var _n0 = _Utils_Tuple2(acc, l);
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
						if (A3(author$project$ConvexHull$clockwise, r2, r1, x)) {
							var $temp$acc = A2(elm$core$List$cons, r2, rs),
								$temp$l = A2(elm$core$List$cons, x, xs);
							acc = $temp$acc;
							l = $temp$l;
							continue go;
						} else {
							var $temp$acc = A2(elm$core$List$cons, x, acc),
								$temp$l = xs;
							acc = $temp$acc;
							l = $temp$l;
							continue go;
						}
					} else {
						var acc2 = _n0.a;
						var _n4 = _n0.b;
						var x = _n4.a;
						var xs = _n4.b;
						var $temp$acc = A2(elm$core$List$cons, x, acc2),
							$temp$l = xs;
						acc = $temp$acc;
						l = $temp$l;
						continue go;
					}
				} else {
					var acc2 = _n0.a;
					return elm$core$List$reverse(
						A2(
							elm$core$Maybe$withDefault,
							_List_Nil,
							elm$core$List$tail(acc2)));
				}
			}
		});
	return go(_List_Nil);
}();
var elm$core$List$sortBy = _List_sortBy;
var author$project$ConvexHull$convexHull = function (points) {
	if (elm$core$List$length(points) <= 1) {
		return points;
	} else {
		var sorted = A2(elm$core$List$sortBy, elm$core$Tuple$first, points);
		var upper = author$project$ConvexHull$chain(
			elm$core$List$reverse(sorted));
		var lower = author$project$ConvexHull$chain(sorted);
		return elm$core$List$concat(
			_List_fromArray(
				[lower, upper]));
	}
};
var author$project$Graph$getBagsWithVertices = function (graph) {
	var initialAcc = A2(
		elm$core$Dict$map,
		F2(
			function (_n1, _n2) {
				return _List_Nil;
			}),
		author$project$Graph$getBags(graph));
	var cons = F3(
		function (v, bagId, acc) {
			return A3(
				elm$core$Dict$update,
				bagId,
				elm$core$Maybe$map(
					elm$core$List$cons(v)),
				acc);
		});
	var handleVertex = F3(
		function (_n0, v, acc) {
			return A3(
				elm$core$List$foldr,
				cons(v),
				acc,
				elm$core$Set$toList(v.inBags));
		});
	return A3(
		elm$core$Dict$foldr,
		handleVertex,
		initialAcc,
		author$project$Graph$getVertices(graph));
};
var elm$svg$Svg$polygon = elm$svg$Svg$trustedNode('polygon');
var elm$svg$Svg$Attributes$opacity = _VirtualDom_attribute('opacity');
var elm$svg$Svg$Attributes$points = _VirtualDom_attribute('points');
var elm$svg$Svg$Attributes$strokeLinejoin = _VirtualDom_attribute('stroke-linejoin');
var author$project$Main$viewHulls = function (graph) {
	var hull = function (positions) {
		return A2(
			elm$svg$Svg$polygon,
			_List_fromArray(
				[
					elm$svg$Svg$Attributes$points(
					author$project$Main$pointsForSvg(
						author$project$ConvexHull$convexHull(positions))),
					elm$svg$Svg$Attributes$fill('lightGray'),
					elm$svg$Svg$Attributes$opacity('0.3'),
					elm$svg$Svg$Attributes$stroke('lightGray'),
					elm$svg$Svg$Attributes$strokeWidth('50'),
					elm$svg$Svg$Attributes$strokeLinejoin('round')
				]),
			_List_Nil);
	};
	var hasConvexHull = function (bagId) {
		return A2(
			elm$core$Maybe$withDefault,
			false,
			A2(
				elm$core$Maybe$map,
				function ($) {
					return $.hasConvexHull;
				},
				A2(
					elm$core$Dict$get,
					bagId,
					author$project$Graph$getBags(graph))));
	};
	var hulls = A2(
		elm$core$List$map,
		hull,
		A2(
			elm$core$List$map,
			elm$core$List$map(
				function (v) {
					return _Utils_Tuple2(v.x, v.y);
				}),
			elm$core$Dict$values(
				A2(
					elm$core$Dict$filter,
					F2(
						function (bagId, _n0) {
							return hasConvexHull(bagId);
						}),
					author$project$Graph$getBagsWithVertices(graph)))));
	return A2(elm$svg$Svg$g, _List_Nil, hulls);
};
var author$project$Main$MouseDownOnVertex = F2(
	function (a, b) {
		return {$: 'MouseDownOnVertex', a: a, b: b};
	});
var author$project$Main$MouseOutVertex = function (a) {
	return {$: 'MouseOutVertex', a: a};
};
var author$project$Main$MouseOverVertex = function (a) {
	return {$: 'MouseOverVertex', a: a};
};
var author$project$Main$MouseUpOnVertex = function (a) {
	return {$: 'MouseUpOnVertex', a: a};
};
var elm$svg$Svg$Attributes$r = _VirtualDom_attribute('r');
var elm$svg$Svg$Attributes$transform = _VirtualDom_attribute('transform');
var elm$svg$Svg$Events$onMouseUp = function (msg) {
	return A2(
		elm$html$Html$Events$on,
		'mouseup',
		elm$json$Json$Decode$succeed(msg));
};
var author$project$Main$viewVertices = function (graph) {
	var vertices = author$project$Graph$getVertices(graph);
	var pin = F2(
		function (fixed, radius) {
			return fixed ? A2(
				elm$svg$Svg$circle,
				_List_fromArray(
					[
						elm$svg$Svg$Attributes$r(
						elm$core$String$fromFloat(radius / 2)),
						elm$svg$Svg$Attributes$fill('red'),
						elm$svg$Svg$Attributes$stroke('white')
					]),
				_List_Nil) : A2(elm$svg$Svg$g, _List_Nil, _List_Nil);
		});
	var drawVertex = F2(
		function (id, _n0) {
			var x = _n0.x;
			var y = _n0.y;
			var color = _n0.color;
			var radius = _n0.radius;
			var fixed = _n0.fixed;
			return A2(
				elm$svg$Svg$g,
				_List_fromArray(
					[
						elm$svg$Svg$Attributes$transform(
						'translate(' + (elm$core$String$fromFloat(x) + (',' + (elm$core$String$fromFloat(y) + ')')))),
						A2(
						elm$html$Html$Events$on,
						'mousedown',
						A2(
							elm$json$Json$Decode$map,
							author$project$Main$MouseDownOnVertex(id),
							author$project$Main$mousePosition)),
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
						elm$svg$Svg$circle,
						_List_fromArray(
							[
								elm$svg$Svg$Attributes$r(
								elm$core$String$fromFloat(radius)),
								elm$svg$Svg$Attributes$fill(color)
							]),
						_List_Nil),
						A2(pin, fixed, radius)
					]));
		});
	var vs = elm$core$Dict$values(
		A2(elm$core$Dict$map, drawVertex, vertices));
	return A2(elm$svg$Svg$g, _List_Nil, vs);
};
var elm$svg$Svg$rect = elm$svg$Svg$trustedNode('rect');
var elm$svg$Svg$Attributes$class = _VirtualDom_attribute('class');
var elm$svg$Svg$Attributes$cx = _VirtualDom_attribute('cx');
var elm$svg$Svg$Attributes$cy = _VirtualDom_attribute('cy');
var elm$svg$Svg$Attributes$display = _VirtualDom_attribute('display');
var elm$svg$Svg$Attributes$fillOpacity = _VirtualDom_attribute('fill-opacity');
var elm$svg$Svg$Attributes$strokeDasharray = _VirtualDom_attribute('stroke-dasharray');
var elm$svg$Svg$Attributes$x = _VirtualDom_attribute('x');
var elm$svg$Svg$Attributes$y = _VirtualDom_attribute('y');
var elm$svg$Svg$Events$onClick = function (msg) {
	return A2(
		elm$html$Html$Events$on,
		'click',
		elm$json$Json$Decode$succeed(msg));
};
var author$project$Main$mainSvg = function (m) {
	var viewPullCenters = A2(
		elm$svg$Svg$g,
		_List_Nil,
		elm$core$Dict$values(
			A2(
				elm$core$Dict$map,
				F2(
					function (bagId, bag) {
						var rotate = F2(
							function (angle, element) {
								return A2(
									elm$svg$Svg$g,
									_List_fromArray(
										[
											elm$svg$Svg$Attributes$transform(
											'rotate(' + (elm$core$String$fromFloat(angle) + ',0,0)'))
										]),
									_List_fromArray(
										[element]));
							});
						var _n21 = _Utils_Tuple2(10 * bag.pullXStrength, 10 * bag.pullYStrength);
						var xScale = _n21.a;
						var yScale = _n21.b;
						var _n22 = _Utils_Tuple3(30, 20, 6);
						var arrowWidth = _n22.a;
						var arrowHeight = _n22.b;
						var distFromCenter = _n22.c;
						var sep = distFromCenter + arrowHeight;
						var arrow = A2(
							elm$svg$Svg$polygon,
							_List_fromArray(
								[
									elm$svg$Svg$Attributes$points(
									author$project$Main$pointsForSvg(
										_List_fromArray(
											[
												_Utils_Tuple2(-sep, (-arrowWidth) / 2),
												_Utils_Tuple2(-sep, arrowWidth / 2),
												_Utils_Tuple2(-distFromCenter, 0)
											])))
								]),
							_List_Nil);
						var rectX = A2(
							elm$svg$Svg$rect,
							_List_fromArray(
								[
									elm$svg$Svg$Attributes$x(
									elm$core$String$fromFloat((-sep) - (xScale * 20))),
									elm$svg$Svg$Attributes$y('-5'),
									elm$svg$Svg$Attributes$width(
									elm$core$String$fromFloat(xScale * 20)),
									elm$svg$Svg$Attributes$height('10')
								]),
							_List_Nil);
						var rectY = A2(
							elm$svg$Svg$rect,
							_List_fromArray(
								[
									elm$svg$Svg$Attributes$x('-5'),
									elm$svg$Svg$Attributes$y(
									elm$core$String$fromFloat((-sep) - (yScale * 20))),
									elm$svg$Svg$Attributes$width('10'),
									elm$svg$Svg$Attributes$height(
									elm$core$String$fromFloat(yScale * 20))
								]),
							_List_Nil);
						return A2(
							elm$svg$Svg$g,
							_List_fromArray(
								[
									elm$svg$Svg$Attributes$display(
									bag.draggablePullCenter ? 'inline' : 'none'),
									elm$svg$Svg$Attributes$transform(
									'translate(' + (elm$core$String$fromFloat(bag.pullX) + (',' + (elm$core$String$fromFloat(bag.pullY) + ')')))),
									elm$svg$Svg$Attributes$opacity('0.4'),
									elm$svg$Svg$Attributes$class('pullCenter'),
									A2(
									elm$html$Html$Events$on,
									'mousedown',
									A2(
										elm$json$Json$Decode$map,
										author$project$Main$MouseDownOnPullCenter(bagId),
										author$project$Main$mousePosition)),
									elm$svg$Svg$Events$onMouseOver(
									author$project$Main$MouseOverPullCenter(bagId)),
									elm$svg$Svg$Events$onMouseOut(
									author$project$Main$MouseOutPullCenter(bagId)),
									elm$svg$Svg$Events$onClick(
									author$project$Main$ClickOnPullCenter(bagId)),
									elm$svg$Svg$Attributes$fill(
									_Utils_eq(
										m.highlightingPullCenterOnMouseOver,
										elm$core$Maybe$Just(bagId)) ? 'rgb(40,129,230\n' : (_Utils_eq(
										m.maybeSelectedBag,
										elm$core$Maybe$Just(bagId)) ? 'rgb(40,129,230\n' : 'gray'))
								]),
							_List_fromArray(
								[
									arrow,
									A2(rotate, 90, arrow),
									A2(rotate, 180, arrow),
									A2(rotate, 270, arrow),
									rectX,
									A2(rotate, 180, rectX),
									rectY,
									A2(rotate, 180, rectY)
								]));
					}),
				author$project$Graph$getBags(m.graph))));
	var transparentInteractionRect = A2(
		elm$svg$Svg$rect,
		_List_fromArray(
			[
				elm$svg$Svg$Attributes$fillOpacity('0'),
				elm$svg$Svg$Attributes$x('0'),
				elm$svg$Svg$Attributes$y('0'),
				elm$svg$Svg$Attributes$width('100%'),
				elm$svg$Svg$Attributes$height('100%'),
				A2(
				elm$html$Html$Events$on,
				'mousedown',
				A2(elm$json$Json$Decode$map, author$project$Main$MouseDownOnTransparentInteractionRect, author$project$Main$mousePosition)),
				A2(
				elm$html$Html$Events$on,
				'mouseup',
				A2(elm$json$Json$Decode$map, author$project$Main$MouseUpOnTransparentInteractionRect, author$project$Main$mousePosition))
			]),
		_List_Nil);
	var maybeRectAroundSelectedVertices = function () {
		var rect = function (selectedVertices) {
			var maybeRectAroundVertices = A2(author$project$Graph$getMaybeRectAroundVertices, selectedVertices, m.graph);
			if (maybeRectAroundVertices.$ === 'Just') {
				var x = maybeRectAroundVertices.a.x;
				var y = maybeRectAroundVertices.a.y;
				var width = maybeRectAroundVertices.a.width;
				var height = maybeRectAroundVertices.a.height;
				return A2(
					elm$svg$Svg$rect,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$x(
							elm$core$String$fromFloat(x - 1)),
							elm$svg$Svg$Attributes$y(
							elm$core$String$fromFloat(y - 1)),
							elm$svg$Svg$Attributes$width(
							elm$core$String$fromFloat(width + 2)),
							elm$svg$Svg$Attributes$height(
							elm$core$String$fromFloat(height + 2)),
							elm$svg$Svg$Attributes$strokeWidth('1'),
							elm$svg$Svg$Attributes$stroke('rgb(40,127,230)'),
							elm$svg$Svg$Attributes$fill('none')
						]),
					_List_Nil);
			} else {
				return author$project$Main$emptySvgElement;
			}
		};
		var _n18 = m.tool;
		if (_n18.$ === 'Select') {
			var vertexSelectorState = _n18.a;
			if (vertexSelectorState.$ === 'BrushingForSelection') {
				return author$project$Main$emptySvgElement;
			} else {
				return rect(m.selectedVertices);
			}
		} else {
			return author$project$Main$emptySvgElement;
		}
	}();
	var maybeHighlightsOnSelectedVertices = function () {
		var _n16 = m.tool;
		if (_n16.$ === 'Select') {
			var sVAction = _n16.a;
			var hL = F2(
				function (color, radius) {
					return A2(
						elm$svg$Svg$g,
						_List_Nil,
						A2(
							elm$core$List$map,
							function (v) {
								return A2(
									elm$svg$Svg$circle,
									_List_fromArray(
										[
											elm$svg$Svg$Attributes$cx(
											elm$core$String$fromFloat(v.x)),
											elm$svg$Svg$Attributes$cy(
											elm$core$String$fromFloat(v.y)),
											elm$svg$Svg$Attributes$r(
											elm$core$String$fromFloat(
												radius(v) + 4)),
											elm$svg$Svg$Attributes$fill(color)
										]),
									_List_Nil);
							},
							elm$core$Dict$values(
								A2(author$project$Graph$getVerticesIn, m.selectedVertices, m.graph))));
				});
			if (sVAction.$ === 'BrushingForSelection') {
				return A2(
					hL,
					author$project$Colors$highlightColorForMouseOver,
					function ($) {
						return $.radius;
					});
			} else {
				return A2(
					hL,
					author$project$Colors$colorHighlightForSelection,
					function ($) {
						return $.radius;
					});
			}
		} else {
			return author$project$Main$emptySvgElement;
		}
	}();
	var maybeHighlightsOnSelectedEdges = function () {
		var _n12 = m.tool;
		if (_n12.$ === 'Select') {
			var sVAction = _n12.a;
			var hL = function (color) {
				return A2(
					elm$svg$Svg$g,
					_List_Nil,
					A2(
						elm$core$List$map,
						function (_n14) {
							var s = _n14.a;
							var t = _n14.b;
							var _n15 = _Utils_Tuple3(
								A2(
									author$project$Graph$getEdge,
									_Utils_Tuple2(s, t),
									m.graph),
								A2(author$project$Graph$getVertex, s, m.graph),
								A2(author$project$Graph$getVertex, t, m.graph));
							if (((_n15.a.$ === 'Just') && (_n15.b.$ === 'Just')) && (_n15.c.$ === 'Just')) {
								var e = _n15.a.a;
								var v = _n15.b.a;
								var w = _n15.c.a;
								return A2(
									elm$svg$Svg$line,
									_List_fromArray(
										[
											elm$svg$Svg$Attributes$stroke(color),
											elm$svg$Svg$Attributes$strokeWidth(
											elm$core$String$fromFloat(e.thickness + 6)),
											elm$svg$Svg$Attributes$x1(
											elm$core$String$fromFloat(v.x)),
											elm$svg$Svg$Attributes$y1(
											elm$core$String$fromFloat(v.y)),
											elm$svg$Svg$Attributes$x2(
											elm$core$String$fromFloat(w.x)),
											elm$svg$Svg$Attributes$y2(
											elm$core$String$fromFloat(w.y))
										]),
									_List_Nil);
							} else {
								return author$project$Main$emptySvgElement;
							}
						},
						elm$core$Set$toList(m.selectedEdges)));
			};
			if (sVAction.$ === 'BrushingForSelection') {
				return hL(author$project$Colors$highlightColorForMouseOver);
			} else {
				return hL(author$project$Colors$colorHighlightForSelection);
			}
		} else {
			return author$project$Main$emptySvgElement;
		}
	}();
	var maybeHighlightOnVerticesOfMouseOveredBag = function () {
		var _n10 = m.highlightingBagOnMouseOver;
		if (_n10.$ === 'Just') {
			var bagId = _n10.a;
			return A2(
				elm$svg$Svg$g,
				_List_Nil,
				A2(
					elm$core$List$map,
					function (v) {
						return A2(
							elm$svg$Svg$circle,
							_List_fromArray(
								[
									elm$svg$Svg$Attributes$cx(
									elm$core$String$fromFloat(v.x)),
									elm$svg$Svg$Attributes$cy(
									elm$core$String$fromFloat(v.y)),
									elm$svg$Svg$Attributes$r(
									elm$core$String$fromFloat(v.radius + 4)),
									elm$svg$Svg$Attributes$fill(author$project$Colors$highlightColorForMouseOver)
								]),
							_List_Nil);
					},
					elm$core$Dict$values(
						A2(
							elm$core$Dict$filter,
							F2(
								function (_n11, v) {
									return A2(elm$core$Set$member, bagId, v.inBags);
								}),
							author$project$Graph$getVertices(m.graph)))));
		} else {
			return author$project$Main$emptySvgElement;
		}
	}();
	var maybeHighlightOnMouseOveredVertex = function () {
		var _n8 = m.highlightingVertexOnMouseOver;
		if (_n8.$ === 'Just') {
			var id = _n8.a;
			var _n9 = A2(author$project$Graph$getVertex, id, m.graph);
			if (_n9.$ === 'Just') {
				var v = _n9.a;
				return A2(
					elm$svg$Svg$circle,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$cx(
							elm$core$String$fromFloat(v.x)),
							elm$svg$Svg$Attributes$cy(
							elm$core$String$fromFloat(v.y)),
							elm$svg$Svg$Attributes$r(
							elm$core$String$fromFloat(v.radius + 4)),
							elm$svg$Svg$Attributes$fill(author$project$Colors$highlightColorForMouseOver)
						]),
					_List_Nil);
			} else {
				return author$project$Main$emptySvgElement;
			}
		} else {
			return author$project$Main$emptySvgElement;
		}
	}();
	var maybeHighlightOnMouseOveredEdge = function () {
		var _n5 = m.highlightingEdgeOnMouseOver;
		if (_n5.$ === 'Just') {
			var _n6 = _n5.a;
			var s = _n6.a;
			var t = _n6.b;
			var _n7 = _Utils_Tuple3(
				A2(
					author$project$Graph$getEdge,
					_Utils_Tuple2(s, t),
					m.graph),
				A2(author$project$Graph$getVertex, s, m.graph),
				A2(author$project$Graph$getVertex, t, m.graph));
			if (((_n7.a.$ === 'Just') && (_n7.b.$ === 'Just')) && (_n7.c.$ === 'Just')) {
				var e = _n7.a.a;
				var v = _n7.b.a;
				var w = _n7.c.a;
				return A2(
					elm$svg$Svg$line,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$stroke(author$project$Colors$highlightColorForMouseOver),
							elm$svg$Svg$Attributes$strokeWidth(
							elm$core$String$fromFloat(e.thickness + 6)),
							elm$svg$Svg$Attributes$x1(
							elm$core$String$fromFloat(v.x)),
							elm$svg$Svg$Attributes$y1(
							elm$core$String$fromFloat(v.y)),
							elm$svg$Svg$Attributes$x2(
							elm$core$String$fromFloat(w.x)),
							elm$svg$Svg$Attributes$y2(
							elm$core$String$fromFloat(w.y))
						]),
					_List_Nil);
			} else {
				return author$project$Main$emptySvgElement;
			}
		} else {
			return author$project$Main$emptySvgElement;
		}
	}();
	var maybeBrushedSelectionRect = function () {
		var _n3 = m.tool;
		if ((_n3.$ === 'Select') && (_n3.a.$ === 'BrushingForSelection')) {
			var start = _n3.a.a.start;
			var mousePos = _n3.a.a.mousePos;
			var _n4 = m.selector;
			if (_n4.$ === 'RectSelector') {
				var miny = A2(elm$core$Basics$min, start.y, mousePos.y);
				var minx = A2(elm$core$Basics$min, start.x, mousePos.x);
				var maxy = A2(elm$core$Basics$max, start.y, mousePos.y);
				var maxx = A2(elm$core$Basics$max, start.x, mousePos.x);
				return A2(
					elm$svg$Svg$rect,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$x(
							elm$core$String$fromFloat(minx)),
							elm$svg$Svg$Attributes$y(
							elm$core$String$fromFloat(miny)),
							elm$svg$Svg$Attributes$width(
							elm$core$String$fromFloat(maxx - minx)),
							elm$svg$Svg$Attributes$height(
							elm$core$String$fromFloat(maxy - miny)),
							elm$svg$Svg$Attributes$stroke('rgb(127,127,127)'),
							elm$svg$Svg$Attributes$strokeWidth('1'),
							elm$svg$Svg$Attributes$strokeDasharray('1 2'),
							elm$svg$Svg$Attributes$fill('none')
						]),
					_List_Nil);
			} else {
				return A2(
					elm$svg$Svg$line,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$x1(
							elm$core$String$fromInt(start.x)),
							elm$svg$Svg$Attributes$y1(
							elm$core$String$fromInt(start.y)),
							elm$svg$Svg$Attributes$x2(
							elm$core$String$fromInt(mousePos.x)),
							elm$svg$Svg$Attributes$y2(
							elm$core$String$fromInt(mousePos.y)),
							elm$svg$Svg$Attributes$stroke('rgb(127,127,127)'),
							elm$svg$Svg$Attributes$strokeWidth('1'),
							elm$svg$Svg$Attributes$strokeDasharray('1 2')
						]),
					_List_Nil);
			}
		} else {
			return author$project$Main$emptySvgElement;
		}
	}();
	var maybeBrushedEdge = function () {
		var _n1 = m.tool;
		if ((_n1.$ === 'Draw') && (_n1.a.$ === 'Just')) {
			var sourceId = _n1.a.a.sourceId;
			var mousePos = _n1.a.a.mousePos;
			var _n2 = A2(author$project$Graph$getVertex, sourceId, m.graph);
			if (_n2.$ === 'Just') {
				var x = _n2.a.x;
				var y = _n2.a.y;
				return A2(
					elm$svg$Svg$line,
					_List_fromArray(
						[
							elm$svg$Svg$Attributes$x1(
							elm$core$String$fromFloat(x)),
							elm$svg$Svg$Attributes$x2(
							elm$core$String$fromInt(mousePos.x)),
							elm$svg$Svg$Attributes$y1(
							elm$core$String$fromFloat(y)),
							elm$svg$Svg$Attributes$y2(
							elm$core$String$fromInt(mousePos.y)),
							elm$svg$Svg$Attributes$strokeWidth(
							elm$core$String$fromFloat(m.edgePreferences.thickness)),
							elm$svg$Svg$Attributes$stroke(m.edgePreferences.color)
						]),
					_List_Nil);
			} else {
				return author$project$Main$emptySvgElement;
			}
		} else {
			return author$project$Main$emptySvgElement;
		}
	}();
	var cursor = function () {
		var _n0 = m.tool;
		if (_n0.$ === 'Draw') {
			return 'crosshair';
		} else {
			return 'default';
		}
	}();
	return A2(
		elm$svg$Svg$svg,
		_List_fromArray(
			[
				A2(elm$html$Html$Attributes$style, 'background-color', 'rgb(46, 46, 46)'),
				A2(elm$html$Html$Attributes$style, 'position', 'absolute'),
				A2(elm$html$Html$Attributes$style, 'width', '100%'),
				A2(elm$html$Html$Attributes$style, 'height', '100%'),
				A2(elm$html$Html$Attributes$style, 'cursor', cursor)
			]),
		_List_fromArray(
			[
				author$project$Main$viewHulls(m.graph),
				maybeBrushedEdge,
				transparentInteractionRect,
				viewPullCenters,
				maybeHighlightsOnSelectedEdges,
				maybeHighlightOnMouseOveredEdge,
				maybeHighlightOnMouseOveredVertex,
				maybeHighlightsOnSelectedVertices,
				maybeHighlightOnVerticesOfMouseOveredBag,
				author$project$Main$viewEdges(m.graph),
				author$project$Main$viewVertices(m.graph),
				maybeBrushedSelectionRect,
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
		if (maybeChecked.$ === 'Just') {
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
var author$project$Main$FromConvexHullCheckBox = function (a) {
	return {$: 'FromConvexHullCheckBox', a: a};
};
var author$project$Main$FromDraggableCenterCheckBox = function (a) {
	return {$: 'FromDraggableCenterCheckBox', a: a};
};
var author$project$Main$FromPullIsActiveCheckBox = function (a) {
	return {$: 'FromPullIsActiveCheckBox', a: a};
};
var author$project$Main$FromPullXInput = function (a) {
	return {$: 'FromPullXInput', a: a};
};
var author$project$Main$FromPullXStrengthInput = function (a) {
	return {$: 'FromPullXStrengthInput', a: a};
};
var author$project$Main$FromPullYInput = function (a) {
	return {$: 'FromPullYInput', a: a};
};
var author$project$Main$FromPullYStrengthInput = function (a) {
	return {$: 'FromPullYStrengthInput', a: a};
};
var author$project$Main$headerForBagProperties = function (m) {
	var _n0 = m.maybeSelectedBag;
	if (_n0.$ === 'Nothing') {
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
var elm$virtual_dom$VirtualDom$map = _VirtualDom_map;
var elm$html$Html$map = elm$virtual_dom$VirtualDom$map;
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
	return {$: 'MayStopPropagation', a: a};
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
							author$project$Main$FromConvexHullCheckBox,
							author$project$CheckBox$view(
								function () {
									var _n0 = m.maybeSelectedBag;
									if (_n0.$ === 'Just') {
										var bagId = _n0.a;
										var _n1 = A2(author$project$Graph$getBag, bagId, m.graph);
										if (_n1.$ === 'Just') {
											var bag = _n1.a;
											return elm$core$Maybe$Just(bag.hasConvexHull);
										} else {
											return elm$core$Maybe$Nothing;
										}
									} else {
										return elm$core$Maybe$Just(m.bagPreferences.hasConvexHull);
									}
								}())))
					])),
				A2(
				author$project$Main$lineWithColumns,
				140,
				_List_fromArray(
					[
						A2(
						author$project$Main$input,
						'Pull Active',
						A2(
							elm$html$Html$map,
							author$project$Main$FromPullIsActiveCheckBox,
							author$project$CheckBox$view(
								function () {
									var _n2 = m.maybeSelectedBag;
									if (_n2.$ === 'Just') {
										var bagId = _n2.a;
										var _n3 = A2(author$project$Graph$getBag, bagId, m.graph);
										if (_n3.$ === 'Just') {
											var bag = _n3.a;
											return elm$core$Maybe$Just(bag.pullIsActive);
										} else {
											return elm$core$Maybe$Nothing;
										}
									} else {
										return elm$core$Maybe$Just(m.bagPreferences.pullIsActive);
									}
								}()))),
						A2(
						author$project$Main$input,
						'Show Center',
						A2(
							elm$html$Html$map,
							author$project$Main$FromDraggableCenterCheckBox,
							author$project$CheckBox$view(
								function () {
									var _n4 = m.maybeSelectedBag;
									if (_n4.$ === 'Just') {
										var bagId = _n4.a;
										var _n5 = A2(author$project$Graph$getBag, bagId, m.graph);
										if (_n5.$ === 'Just') {
											var bag = _n5.a;
											return elm$core$Maybe$Just(bag.draggablePullCenter);
										} else {
											return elm$core$Maybe$Nothing;
										}
									} else {
										return elm$core$Maybe$Just(m.bagPreferences.draggablePullCenter);
									}
								}())))
					])),
				A2(
				author$project$Main$lineWithColumns,
				140,
				_List_fromArray(
					[
						A2(
						author$project$Main$input,
						'Pull X',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Events$onInput(author$project$Main$FromPullXInput),
									elm$html$Html$Attributes$value(
									elm$core$String$fromFloat(
										function () {
											var _n6 = m.maybeSelectedBag;
											if (_n6.$ === 'Just') {
												var bagId = _n6.a;
												return A2(
													elm$core$Maybe$withDefault,
													400,
													A2(
														elm$core$Maybe$map,
														function ($) {
															return $.pullX;
														},
														A2(
															elm$core$Dict$get,
															bagId,
															author$project$Graph$getBags(m.graph))));
											} else {
												return m.bagPreferences.pullX;
											}
										}()))
								]))),
						A2(
						author$project$Main$input,
						'Pull Y',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Events$onInput(author$project$Main$FromPullYInput),
									elm$html$Html$Attributes$value(
									elm$core$String$fromFloat(
										function () {
											var _n7 = m.maybeSelectedBag;
											if (_n7.$ === 'Just') {
												var bagId = _n7.a;
												return A2(
													elm$core$Maybe$withDefault,
													400,
													A2(
														elm$core$Maybe$map,
														function ($) {
															return $.pullY;
														},
														A2(
															elm$core$Dict$get,
															bagId,
															author$project$Graph$getBags(m.graph))));
											} else {
												return m.bagPreferences.pullY;
											}
										}()))
								])))
					])),
				A2(
				author$project$Main$lineWithColumns,
				140,
				_List_fromArray(
					[
						A2(
						author$project$Main$input,
						'Pull X Strength',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Events$onInput(author$project$Main$FromPullXStrengthInput),
									elm$html$Html$Attributes$value(
									elm$core$String$fromFloat(
										function () {
											var _n8 = m.maybeSelectedBag;
											if (_n8.$ === 'Just') {
												var bagId = _n8.a;
												return A2(
													elm$core$Maybe$withDefault,
													0.1,
													A2(
														elm$core$Maybe$map,
														function ($) {
															return $.pullXStrength;
														},
														A2(
															elm$core$Dict$get,
															bagId,
															author$project$Graph$getBags(m.graph))));
											} else {
												return m.bagPreferences.pullXStrength;
											}
										}())),
									elm$html$Html$Attributes$min('0'),
									elm$html$Html$Attributes$max('1'),
									elm$html$Html$Attributes$step('0.02')
								]))),
						A2(
						author$project$Main$input,
						'Pull Y Strength',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Events$onInput(author$project$Main$FromPullYStrengthInput),
									elm$html$Html$Attributes$value(
									elm$core$String$fromFloat(
										function () {
											var _n9 = m.maybeSelectedBag;
											if (_n9.$ === 'Just') {
												var bagId = _n9.a;
												return A2(
													elm$core$Maybe$withDefault,
													0.1,
													A2(
														elm$core$Maybe$map,
														function ($) {
															return $.pullYStrength;
														},
														A2(
															elm$core$Dict$get,
															bagId,
															author$project$Graph$getBags(m.graph))));
											} else {
												return m.bagPreferences.pullYStrength;
											}
										}())),
									elm$html$Html$Attributes$min('0'),
									elm$html$Html$Attributes$max('1'),
									elm$html$Html$Attributes$step('0.02')
								])))
					]))
			]));
};
var author$project$Colors$vertexAndEdgeColors = _List_fromArray(
	['black', 'white', 'lightgray', 'darkgray', 'gray', 'rgb(199, 0, 57)', 'rgb(144, 12, 63)', 'rgb(81, 24, 73)', 'rgb(61, 61, 106)', 'rgb(42, 123, 154)', 'rgb(0, 187, 173)', 'rgb(86, 199, 133)', 'rgb(173, 213, 91)', 'rgb(237, 221, 83)', 'rgb(255, 195, 0)', 'rgb(255, 140, 26)', 'rgb(255, 87, 51)']);
var author$project$ColorPicker$colors = author$project$Colors$vertexAndEdgeColors;
var elm$html$Html$button = _VirtualDom_node('button');
var author$project$ColorPicker$view = function (maybeSelectedColor) {
	var dropbtn = function () {
		if (maybeSelectedColor.$ === 'Just') {
			var color = maybeSelectedColor.a;
			return A2(
				elm$html$Html$button,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('dropbtn')
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
						elm$html$Html$Attributes$class('dropbtn')
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
				elm$html$Html$Attributes$class('dropdown')
			]),
		_List_fromArray(
			[
				dropbtn,
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$class('dropdown-content')
					]),
				A2(elm$core$List$map, colorBox, author$project$ColorPicker$colors))
			]));
};
var author$project$Graph$getEdgesIn = F2(
	function (edgeIds, _n0) {
		var edges = _n0.a.edges;
		return A2(
			elm$core$Dict$filter,
			F2(
				function (edgeId, _n1) {
					return A2(elm$core$Set$member, edgeId, edgeIds);
				}),
			edges);
	});
var author$project$Graph$getCommonEdgeProperty = F3(
	function (edgeIds, prop, graph) {
		var deleteDuplicates = function (xs) {
			if (xs.b) {
				var x = xs.a;
				var rest = xs.b;
				return A2(
					elm$core$List$cons,
					x,
					deleteDuplicates(
						A2(
							elm$core$List$filter,
							elm$core$Basics$neq(x),
							rest)));
			} else {
				return _List_Nil;
			}
		};
		var l = deleteDuplicates(
			A2(
				elm$core$List$map,
				prop,
				elm$core$Dict$values(
					A2(author$project$Graph$getEdgesIn, edgeIds, graph))));
		if (l.b && (!l.b.b)) {
			var unique = l.a;
			return elm$core$Maybe$Just(unique);
		} else {
			return elm$core$Maybe$Nothing;
		}
	});
var author$project$Main$FromDistanceInput = function (a) {
	return {$: 'FromDistanceInput', a: a};
};
var author$project$Main$FromEdgeColorPicker = function (a) {
	return {$: 'FromEdgeColorPicker', a: a};
};
var author$project$Main$FromStrengthInput = function (a) {
	return {$: 'FromStrengthInput', a: a};
};
var author$project$Main$FromThicknessInput = function (a) {
	return {$: 'FromThicknessInput', a: a};
};
var author$project$Main$edgeProperties = function (m) {
	var thicknessToShow = function () {
		var maybeCommonThickness = elm$core$Set$isEmpty(m.selectedEdges) ? elm$core$Maybe$Just(m.edgePreferences.thickness) : A3(
			author$project$Graph$getCommonEdgeProperty,
			m.selectedEdges,
			function ($) {
				return $.thickness;
			},
			m.graph);
		if (maybeCommonThickness.$ === 'Just') {
			var r = maybeCommonThickness.a;
			return elm$core$String$fromFloat(r);
		} else {
			return '';
		}
	}();
	var strengthToShow = function () {
		var maybeCommonStrength = elm$core$Set$isEmpty(m.selectedEdges) ? elm$core$Maybe$Just(m.edgePreferences.strength) : A3(
			author$project$Graph$getCommonEdgeProperty,
			m.selectedEdges,
			function ($) {
				return $.strength;
			},
			m.graph);
		if (maybeCommonStrength.$ === 'Just') {
			var r = maybeCommonStrength.a;
			return elm$core$String$fromFloat(r);
		} else {
			return '';
		}
	}();
	var maybeCommonEdgeColor = elm$core$Set$isEmpty(m.selectedEdges) ? elm$core$Maybe$Just(m.edgePreferences.color) : A3(
		author$project$Graph$getCommonEdgeProperty,
		m.selectedEdges,
		function ($) {
			return $.color;
		},
		m.graph);
	var headerForEdgeProperties = function () {
		var _n1 = elm$core$Set$size(m.selectedEdges);
		switch (_n1) {
			case 0:
				return 'Edge Preferences';
			case 1:
				return 'Selected Edge';
			default:
				return 'Selected Edges';
		}
	}();
	var distanceToShow = function () {
		var maybeCommonDistance = elm$core$Set$isEmpty(m.selectedEdges) ? elm$core$Maybe$Just(m.edgePreferences.distance) : A3(
			author$project$Graph$getCommonEdgeProperty,
			m.selectedEdges,
			function ($) {
				return $.distance;
			},
			m.graph);
		if (maybeCommonDistance.$ === 'Just') {
			var r = maybeCommonDistance.a;
			return elm$core$String$fromFloat(r);
		} else {
			return '';
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
							author$project$Main$FromEdgeColorPicker,
							author$project$ColorPicker$view(maybeCommonEdgeColor))),
						A2(
						author$project$Main$input,
						'thickness',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$value(thicknessToShow),
									elm$html$Html$Events$onInput(author$project$Main$FromThicknessInput),
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
									elm$html$Html$Attributes$value(distanceToShow),
									elm$html$Html$Events$onInput(author$project$Main$FromDistanceInput),
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
									elm$html$Html$Attributes$value(strengthToShow),
									elm$html$Html$Events$onInput(author$project$Main$FromStrengthInput),
									elm$html$Html$Attributes$min('0'),
									elm$html$Html$Attributes$max('1'),
									elm$html$Html$Attributes$step('0.05')
								])))
					]))
			]));
};
var author$project$Main$FromManyBodyMaxDistanceInput = function (a) {
	return {$: 'FromManyBodyMaxDistanceInput', a: a};
};
var author$project$Main$FromManyBodyMinDistanceInput = function (a) {
	return {$: 'FromManyBodyMinDistanceInput', a: a};
};
var author$project$Main$FromManyBodyStrengthInput = function (a) {
	return {$: 'FromManyBodyStrengthInput', a: a};
};
var author$project$Main$FromManyBodyThetaInput = function (a) {
	return {$: 'FromManyBodyThetaInput', a: a};
};
var author$project$Main$manyBodyProperties = function (m) {
	var mB = author$project$Graph$getManyBody(m.graph);
	return A2(
		author$project$Main$subMenu,
		'Many Body',
		_List_fromArray(
			[
				A2(
				author$project$Main$lineWithColumns,
				140,
				_List_fromArray(
					[
						A2(
						author$project$Main$input,
						'Strength',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$min('-1000'),
									elm$html$Html$Attributes$max('0'),
									elm$html$Html$Attributes$step('10'),
									elm$html$Html$Attributes$value(
									elm$core$String$fromFloat(mB.strength)),
									elm$html$Html$Events$onInput(author$project$Main$FromManyBodyStrengthInput)
								]))),
						A2(
						author$project$Main$input,
						'Theta',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$min('0'),
									elm$html$Html$Attributes$max('1'),
									elm$html$Html$Attributes$step('0.1'),
									elm$html$Html$Attributes$value(
									elm$core$String$fromFloat(mB.theta)),
									elm$html$Html$Events$onInput(author$project$Main$FromManyBodyThetaInput)
								])))
					])),
				A2(
				author$project$Main$lineWithColumns,
				140,
				_List_fromArray(
					[
						A2(
						author$project$Main$input,
						'Min Distance',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$min('0'),
									elm$html$Html$Attributes$max('1000'),
									elm$html$Html$Attributes$step('1'),
									elm$html$Html$Attributes$value(
									elm$core$String$fromFloat(mB.distanceMin)),
									elm$html$Html$Events$onInput(author$project$Main$FromManyBodyMinDistanceInput)
								]))),
						A2(
						author$project$Main$input,
						'Max Distance',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$value(
									elm$core$String$fromFloat(mB.distanceMax)),
									elm$html$Html$Events$onInput(author$project$Main$FromManyBodyMaxDistanceInput)
								])))
					]))
			]));
};
var author$project$Main$rightBarWidth = 300;
var author$project$Main$LineSelectorClicked = {$: 'LineSelectorClicked'};
var author$project$Main$RectSelectorClicked = {$: 'RectSelectorClicked'};
var author$project$Main$selectionType = function (m) {
	var rectSelector = A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				A2(elm$html$Html$Attributes$style, 'float', 'left'),
				A2(elm$html$Html$Attributes$style, 'margin', '1px'),
				elm$html$Html$Attributes$title('Rectangle Selector'),
				elm$html$Html$Events$onClick(author$project$Main$RectSelectorClicked),
				elm$html$Html$Attributes$class(
				function () {
					var _n1 = m.selector;
					if (_n1.$ === 'RectSelector') {
						return 'radio-button-selected';
					} else {
						return 'radio-button';
					}
				}())
			]),
		_List_fromArray(
			[
				author$project$Icons$draw24px(author$project$Icons$icons.selectionRect)
			]));
	var lineSelector = A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				A2(elm$html$Html$Attributes$style, 'float', 'left'),
				A2(elm$html$Html$Attributes$style, 'margin', '1px'),
				elm$html$Html$Attributes$title('Line Selector'),
				elm$html$Html$Events$onClick(author$project$Main$LineSelectorClicked),
				elm$html$Html$Attributes$class(
				function () {
					var _n0 = m.selector;
					if (_n0.$ === 'LineSelector') {
						return 'radio-button-selected';
					} else {
						return 'radio-button';
					}
				}())
			]),
		_List_fromArray(
			[
				author$project$Icons$draw24px(author$project$Icons$icons.selectionLine)
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
										[rectSelector, lineSelector])),
									A2(
									elm$html$Html$div,
									_List_fromArray(
										[
											A2(elm$html$Html$Attributes$style, 'clear', 'both')
										]),
									_List_Nil)
								])))
					]))
			]));
};
var author$project$Graph$getCommonVertexProperty = F3(
	function (vertexIds, prop, graph) {
		var deleteDuplicates = function (xs) {
			if (xs.b) {
				var x = xs.a;
				var rest = xs.b;
				return A2(
					elm$core$List$cons,
					x,
					deleteDuplicates(
						A2(
							elm$core$List$filter,
							elm$core$Basics$neq(x),
							rest)));
			} else {
				return _List_Nil;
			}
		};
		var l = deleteDuplicates(
			A2(
				elm$core$List$map,
				prop,
				elm$core$Dict$values(
					A2(author$project$Graph$getVerticesIn, vertexIds, graph))));
		if (l.b && (!l.b.b)) {
			var unique = l.a;
			return elm$core$Maybe$Just(unique);
		} else {
			return elm$core$Maybe$Nothing;
		}
	});
var author$project$Main$FromFixedCheckBox = function (a) {
	return {$: 'FromFixedCheckBox', a: a};
};
var author$project$Main$FromRadiusInput = function (a) {
	return {$: 'FromRadiusInput', a: a};
};
var author$project$Main$FromVertexColorPicker = function (a) {
	return {$: 'FromVertexColorPicker', a: a};
};
var author$project$Main$FromXInput = function (a) {
	return {$: 'FromXInput', a: a};
};
var author$project$Main$FromYInput = function (a) {
	return {$: 'FromYInput', a: a};
};
var author$project$Main$vertexProperties = function (m) {
	var radiusToShow = function () {
		var maybeCommonRadius = elm$core$Set$isEmpty(m.selectedVertices) ? elm$core$Maybe$Just(m.vertexPreferences.radius) : A3(
			author$project$Graph$getCommonVertexProperty,
			m.selectedVertices,
			function ($) {
				return $.radius;
			},
			m.graph);
		if (maybeCommonRadius.$ === 'Just') {
			var r = maybeCommonRadius.a;
			return elm$core$String$fromFloat(r);
		} else {
			return '';
		}
	}();
	var maybeCommonVertexColor = elm$core$Set$isEmpty(m.selectedVertices) ? elm$core$Maybe$Just(m.vertexPreferences.color) : A3(
		author$project$Graph$getCommonVertexProperty,
		m.selectedVertices,
		function ($) {
			return $.color;
		},
		m.graph);
	var maybeCommonFixed = elm$core$Set$isEmpty(m.selectedVertices) ? elm$core$Maybe$Just(m.vertexPreferences.fixed) : A3(
		author$project$Graph$getCommonVertexProperty,
		m.selectedVertices,
		function ($) {
			return $.fixed;
		},
		m.graph);
	var headerForVertexProperties = function () {
		var _n2 = elm$core$Set$size(m.selectedVertices);
		switch (_n2) {
			case 0:
				return 'Vertex Preferences';
			case 1:
				return 'Selected Vertex';
			default:
				return 'Selected Vertices';
		}
	}();
	var _n0 = function () {
		var _n1 = A2(author$project$Graph$getCenter, m.selectedVertices, m.graph);
		if (_n1.$ === 'Nothing') {
			return _Utils_Tuple2('', '');
		} else {
			var x = _n1.a.x;
			var y = _n1.a.y;
			return _Utils_Tuple2(
				elm$core$String$fromInt(
					elm$core$Basics$round(x)),
				elm$core$String$fromInt(
					elm$core$Basics$round(y)));
		}
	}();
	var commonXToShow = _n0.a;
	var commonYToShow = _n0.b;
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
									elm$html$Html$Attributes$value(commonXToShow),
									elm$html$Html$Events$onInput(author$project$Main$FromXInput)
								]))),
						A2(
						author$project$Main$input,
						'Y',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$value(commonYToShow),
									elm$html$Html$Events$onInput(author$project$Main$FromYInput)
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
							author$project$Main$FromVertexColorPicker,
							author$project$ColorPicker$view(maybeCommonVertexColor))),
						A2(
						author$project$Main$input,
						'Radius',
						author$project$Main$numberInput(
							_List_fromArray(
								[
									elm$html$Html$Attributes$min('4'),
									elm$html$Html$Attributes$max('20'),
									elm$html$Html$Attributes$step('1'),
									elm$html$Html$Attributes$value(radiusToShow),
									elm$html$Html$Events$onInput(author$project$Main$FromRadiusInput)
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
							author$project$Main$FromFixedCheckBox,
							author$project$CheckBox$view(maybeCommonFixed)))
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
				author$project$Main$edgeProperties(m),
				author$project$Main$manyBodyProperties(m)
			]));
};
var author$project$Icons$draw34px = author$project$Icons$draw(34);
var author$project$Main$shortCutsButtonGroup = function (m) {
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
						m.vaderIsOn ? 'radio-button-selected' : 'radio-button'),
						elm$html$Html$Events$onClick(author$project$Main$VaderClicked)
					]),
				_List_fromArray(
					[
						author$project$Icons$draw34px(author$project$Icons$icons.vader)
					]))
			]));
};
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
						elm$html$Html$Attributes$title('Selection (S)'),
						elm$html$Html$Events$onClick(author$project$Main$SelectToolClicked),
						elm$html$Html$Attributes$class(
						function () {
							var _n0 = m.tool;
							if (_n0.$ === 'Select') {
								return 'radio-button-selected';
							} else {
								return 'radio-button';
							}
						}())
					]),
				_List_fromArray(
					[
						author$project$Icons$draw34px(author$project$Icons$icons.pointer)
					])),
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						elm$html$Html$Attributes$title('Draw (D)'),
						elm$html$Html$Events$onClick(author$project$Main$DrawToolClicked),
						elm$html$Html$Attributes$class(
						function () {
							var _n1 = m.tool;
							if (_n1.$ === 'Draw') {
								return 'radio-button-selected';
							} else {
								return 'radio-button';
							}
						}())
					]),
				_List_fromArray(
					[
						author$project$Icons$draw34px(author$project$Icons$icons.pen)
					]))
			]));
};
var author$project$Main$topBarHeight = 57;
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
				elm$core$String$fromFloat(((m.windowSize.width - author$project$Main$leftBarWidth) - author$project$Main$rightBarWidth) - 3) + 'px'),
				A2(
				elm$html$Html$Attributes$style,
				'height',
				elm$core$String$fromFloat(author$project$Main$topBarHeight) + 'px')
			]),
		_List_fromArray(
			[
				author$project$Main$toolSelectionButtonGroup(m),
				author$project$Main$shortCutsButtonGroup(m)
			]));
};
var author$project$Main$viewAlpha = function (m) {
	return A2(
		elm$html$Html$div,
		_List_fromArray(
			[
				elm$html$Html$Attributes$id('alpha'),
				A2(elm$html$Html$Attributes$style, 'position', 'absolute'),
				A2(
				elm$html$Html$Attributes$style,
				'left',
				elm$core$String$fromFloat(author$project$Main$leftBarWidth) + 'px'),
				A2(
				elm$html$Html$Attributes$style,
				'right',
				elm$core$String$fromFloat(author$project$Main$rightBarWidth) + 'px'),
				A2(elm$html$Html$Attributes$style, 'bottom', '0px'),
				A2(elm$html$Html$Attributes$style, 'height', '8px')
			]),
		_List_fromArray(
			[
				A2(
				elm$html$Html$div,
				_List_fromArray(
					[
						A2(
						elm$html$Html$Attributes$style,
						'width',
						elm$core$String$fromFloat(100 * m.alpha) + '%'),
						A2(elm$html$Html$Attributes$style, 'height', '100%'),
						A2(elm$html$Html$Attributes$style, 'background-color', '#454545')
					]),
				_List_Nil)
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
				author$project$Main$viewAlpha(m),
				author$project$Main$leftBar(m),
				author$project$Main$rightBar(m),
				author$project$Main$topBar(m),
				author$project$Main$forDebugging(m)
			]));
};
var elm$browser$Browser$document = _Browser_document;
var elm$browser$Browser$Dom$getViewport = _Browser_withWindow(_Browser_getViewport);
var elm$core$Basics$always = F2(
	function (a, _n0) {
		return a;
	});
var author$project$Main$main = elm$browser$Browser$document(
	{
		init: elm$core$Basics$always(
			_Utils_Tuple2(
				author$project$Main$initialModel,
				elm$core$Platform$Cmd$batch(
					_List_fromArray(
						[
							A2(
							elm$core$Task$perform,
							author$project$Main$UpdateWindowSize,
							A2(elm$core$Task$map, author$project$Main$getWindowSize, elm$browser$Browser$Dom$getViewport))
						])))),
		subscriptions: author$project$Main$subscriptions,
		update: author$project$Main$update,
		view: function (model) {
			return {
				body: _List_fromArray(
					[
						author$project$Main$view(model)
					]),
				title: 'Kite'
			};
		}
	});
_Platform_export({'Main':{'init':author$project$Main$main(
	elm$json$Json$Decode$succeed(_Utils_Tuple0))(0)}});}(this));