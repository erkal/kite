
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
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


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
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


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

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

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode = _elm_lang$core$Json_Decode$succeed;
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$resolve = _elm_lang$core$Json_Decode$andThen(_elm_lang$core$Basics$identity);
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom = _elm_lang$core$Json_Decode$map2(
	F2(
		function (x, y) {
			return y(x);
		}));
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$hardcoded = function (_p0) {
	return _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom(
		_elm_lang$core$Json_Decode$succeed(_p0));
};
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder = F3(
	function (pathDecoder, valDecoder, fallback) {
		var nullOr = function (decoder) {
			return _elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: decoder,
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Json_Decode$null(fallback),
						_1: {ctor: '[]'}
					}
				});
		};
		var handleResult = function (input) {
			var _p1 = A2(_elm_lang$core$Json_Decode$decodeValue, pathDecoder, input);
			if (_p1.ctor === 'Ok') {
				var _p2 = A2(
					_elm_lang$core$Json_Decode$decodeValue,
					nullOr(valDecoder),
					_p1._0);
				if (_p2.ctor === 'Ok') {
					return _elm_lang$core$Json_Decode$succeed(_p2._0);
				} else {
					return _elm_lang$core$Json_Decode$fail(_p2._0);
				}
			} else {
				return _elm_lang$core$Json_Decode$succeed(fallback);
			}
		};
		return A2(_elm_lang$core$Json_Decode$andThen, handleResult, _elm_lang$core$Json_Decode$value);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalAt = F4(
	function (path, valDecoder, fallback, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder,
				A2(_elm_lang$core$Json_Decode$at, path, _elm_lang$core$Json_Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optional = F4(
	function (key, valDecoder, fallback, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$optionalDecoder,
				A2(_elm_lang$core$Json_Decode$field, key, _elm_lang$core$Json_Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$requiredAt = F3(
	function (path, valDecoder, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A2(_elm_lang$core$Json_Decode$at, path, valDecoder),
			decoder);
	});
var _NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required = F3(
	function (key, valDecoder, decoder) {
		return A2(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$custom,
			A2(_elm_lang$core$Json_Decode$field, key, valDecoder),
			decoder);
	});

var _elm_lang$core$Native_Bitwise = function() {

return {
	and: F2(function and(a, b) { return a & b; }),
	or: F2(function or(a, b) { return a | b; }),
	xor: F2(function xor(a, b) { return a ^ b; }),
	complement: function complement(a) { return ~a; },
	shiftLeftBy: F2(function(offset, a) { return a << offset; }),
	shiftRightBy: F2(function(offset, a) { return a >> offset; }),
	shiftRightZfBy: F2(function(offset, a) { return a >>> offset; })
};

}();

var _elm_lang$core$Bitwise$shiftRightZfBy = _elm_lang$core$Native_Bitwise.shiftRightZfBy;
var _elm_lang$core$Bitwise$shiftRightBy = _elm_lang$core$Native_Bitwise.shiftRightBy;
var _elm_lang$core$Bitwise$shiftLeftBy = _elm_lang$core$Native_Bitwise.shiftLeftBy;
var _elm_lang$core$Bitwise$complement = _elm_lang$core$Native_Bitwise.complement;
var _elm_lang$core$Bitwise$xor = _elm_lang$core$Native_Bitwise.xor;
var _elm_lang$core$Bitwise$or = _elm_lang$core$Native_Bitwise.or;
var _elm_lang$core$Bitwise$and = _elm_lang$core$Native_Bitwise.and;

var _Skinney$fnv$FNV$fnvPrime = (Math.pow(2, 24) + Math.pow(2, 8)) + 147;
var _Skinney$fnv$FNV$hashFold = F2(
	function (c, hash) {
		return ((hash ^ _elm_lang$core$Char$toCode(c)) * _Skinney$fnv$FNV$fnvPrime) >>> 0;
	});
var _Skinney$fnv$FNV$hashString = function (str) {
	return A3(_elm_lang$core$String$foldl, _Skinney$fnv$FNV$hashFold, 0, str);
};

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
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
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
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


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$svg$Svg$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$svg$Svg$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$svg$Svg$svgNamespace = A2(
	_elm_lang$virtual_dom$VirtualDom$property,
	'namespace',
	_elm_lang$core$Json_Encode$string('http://www.w3.org/2000/svg'));
var _elm_lang$svg$Svg$node = F3(
	function (name, attributes, children) {
		return A3(
			_elm_lang$virtual_dom$VirtualDom$node,
			name,
			{ctor: '::', _0: _elm_lang$svg$Svg$svgNamespace, _1: attributes},
			children);
	});
var _elm_lang$svg$Svg$svg = _elm_lang$svg$Svg$node('svg');
var _elm_lang$svg$Svg$foreignObject = _elm_lang$svg$Svg$node('foreignObject');
var _elm_lang$svg$Svg$animate = _elm_lang$svg$Svg$node('animate');
var _elm_lang$svg$Svg$animateColor = _elm_lang$svg$Svg$node('animateColor');
var _elm_lang$svg$Svg$animateMotion = _elm_lang$svg$Svg$node('animateMotion');
var _elm_lang$svg$Svg$animateTransform = _elm_lang$svg$Svg$node('animateTransform');
var _elm_lang$svg$Svg$mpath = _elm_lang$svg$Svg$node('mpath');
var _elm_lang$svg$Svg$set = _elm_lang$svg$Svg$node('set');
var _elm_lang$svg$Svg$a = _elm_lang$svg$Svg$node('a');
var _elm_lang$svg$Svg$defs = _elm_lang$svg$Svg$node('defs');
var _elm_lang$svg$Svg$g = _elm_lang$svg$Svg$node('g');
var _elm_lang$svg$Svg$marker = _elm_lang$svg$Svg$node('marker');
var _elm_lang$svg$Svg$mask = _elm_lang$svg$Svg$node('mask');
var _elm_lang$svg$Svg$pattern = _elm_lang$svg$Svg$node('pattern');
var _elm_lang$svg$Svg$switch = _elm_lang$svg$Svg$node('switch');
var _elm_lang$svg$Svg$symbol = _elm_lang$svg$Svg$node('symbol');
var _elm_lang$svg$Svg$desc = _elm_lang$svg$Svg$node('desc');
var _elm_lang$svg$Svg$metadata = _elm_lang$svg$Svg$node('metadata');
var _elm_lang$svg$Svg$title = _elm_lang$svg$Svg$node('title');
var _elm_lang$svg$Svg$feBlend = _elm_lang$svg$Svg$node('feBlend');
var _elm_lang$svg$Svg$feColorMatrix = _elm_lang$svg$Svg$node('feColorMatrix');
var _elm_lang$svg$Svg$feComponentTransfer = _elm_lang$svg$Svg$node('feComponentTransfer');
var _elm_lang$svg$Svg$feComposite = _elm_lang$svg$Svg$node('feComposite');
var _elm_lang$svg$Svg$feConvolveMatrix = _elm_lang$svg$Svg$node('feConvolveMatrix');
var _elm_lang$svg$Svg$feDiffuseLighting = _elm_lang$svg$Svg$node('feDiffuseLighting');
var _elm_lang$svg$Svg$feDisplacementMap = _elm_lang$svg$Svg$node('feDisplacementMap');
var _elm_lang$svg$Svg$feFlood = _elm_lang$svg$Svg$node('feFlood');
var _elm_lang$svg$Svg$feFuncA = _elm_lang$svg$Svg$node('feFuncA');
var _elm_lang$svg$Svg$feFuncB = _elm_lang$svg$Svg$node('feFuncB');
var _elm_lang$svg$Svg$feFuncG = _elm_lang$svg$Svg$node('feFuncG');
var _elm_lang$svg$Svg$feFuncR = _elm_lang$svg$Svg$node('feFuncR');
var _elm_lang$svg$Svg$feGaussianBlur = _elm_lang$svg$Svg$node('feGaussianBlur');
var _elm_lang$svg$Svg$feImage = _elm_lang$svg$Svg$node('feImage');
var _elm_lang$svg$Svg$feMerge = _elm_lang$svg$Svg$node('feMerge');
var _elm_lang$svg$Svg$feMergeNode = _elm_lang$svg$Svg$node('feMergeNode');
var _elm_lang$svg$Svg$feMorphology = _elm_lang$svg$Svg$node('feMorphology');
var _elm_lang$svg$Svg$feOffset = _elm_lang$svg$Svg$node('feOffset');
var _elm_lang$svg$Svg$feSpecularLighting = _elm_lang$svg$Svg$node('feSpecularLighting');
var _elm_lang$svg$Svg$feTile = _elm_lang$svg$Svg$node('feTile');
var _elm_lang$svg$Svg$feTurbulence = _elm_lang$svg$Svg$node('feTurbulence');
var _elm_lang$svg$Svg$font = _elm_lang$svg$Svg$node('font');
var _elm_lang$svg$Svg$linearGradient = _elm_lang$svg$Svg$node('linearGradient');
var _elm_lang$svg$Svg$radialGradient = _elm_lang$svg$Svg$node('radialGradient');
var _elm_lang$svg$Svg$stop = _elm_lang$svg$Svg$node('stop');
var _elm_lang$svg$Svg$circle = _elm_lang$svg$Svg$node('circle');
var _elm_lang$svg$Svg$ellipse = _elm_lang$svg$Svg$node('ellipse');
var _elm_lang$svg$Svg$image = _elm_lang$svg$Svg$node('image');
var _elm_lang$svg$Svg$line = _elm_lang$svg$Svg$node('line');
var _elm_lang$svg$Svg$path = _elm_lang$svg$Svg$node('path');
var _elm_lang$svg$Svg$polygon = _elm_lang$svg$Svg$node('polygon');
var _elm_lang$svg$Svg$polyline = _elm_lang$svg$Svg$node('polyline');
var _elm_lang$svg$Svg$rect = _elm_lang$svg$Svg$node('rect');
var _elm_lang$svg$Svg$use = _elm_lang$svg$Svg$node('use');
var _elm_lang$svg$Svg$feDistantLight = _elm_lang$svg$Svg$node('feDistantLight');
var _elm_lang$svg$Svg$fePointLight = _elm_lang$svg$Svg$node('fePointLight');
var _elm_lang$svg$Svg$feSpotLight = _elm_lang$svg$Svg$node('feSpotLight');
var _elm_lang$svg$Svg$altGlyph = _elm_lang$svg$Svg$node('altGlyph');
var _elm_lang$svg$Svg$altGlyphDef = _elm_lang$svg$Svg$node('altGlyphDef');
var _elm_lang$svg$Svg$altGlyphItem = _elm_lang$svg$Svg$node('altGlyphItem');
var _elm_lang$svg$Svg$glyph = _elm_lang$svg$Svg$node('glyph');
var _elm_lang$svg$Svg$glyphRef = _elm_lang$svg$Svg$node('glyphRef');
var _elm_lang$svg$Svg$textPath = _elm_lang$svg$Svg$node('textPath');
var _elm_lang$svg$Svg$text_ = _elm_lang$svg$Svg$node('text');
var _elm_lang$svg$Svg$tref = _elm_lang$svg$Svg$node('tref');
var _elm_lang$svg$Svg$tspan = _elm_lang$svg$Svg$node('tspan');
var _elm_lang$svg$Svg$clipPath = _elm_lang$svg$Svg$node('clipPath');
var _elm_lang$svg$Svg$colorProfile = _elm_lang$svg$Svg$node('colorProfile');
var _elm_lang$svg$Svg$cursor = _elm_lang$svg$Svg$node('cursor');
var _elm_lang$svg$Svg$filter = _elm_lang$svg$Svg$node('filter');
var _elm_lang$svg$Svg$script = _elm_lang$svg$Svg$node('script');
var _elm_lang$svg$Svg$style = _elm_lang$svg$Svg$node('style');
var _elm_lang$svg$Svg$view = _elm_lang$svg$Svg$node('view');

var _elm_lang$svg$Svg_Attributes$writingMode = _elm_lang$virtual_dom$VirtualDom$attribute('writing-mode');
var _elm_lang$svg$Svg_Attributes$wordSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('word-spacing');
var _elm_lang$svg$Svg_Attributes$visibility = _elm_lang$virtual_dom$VirtualDom$attribute('visibility');
var _elm_lang$svg$Svg_Attributes$unicodeBidi = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-bidi');
var _elm_lang$svg$Svg_Attributes$textRendering = _elm_lang$virtual_dom$VirtualDom$attribute('text-rendering');
var _elm_lang$svg$Svg_Attributes$textDecoration = _elm_lang$virtual_dom$VirtualDom$attribute('text-decoration');
var _elm_lang$svg$Svg_Attributes$textAnchor = _elm_lang$virtual_dom$VirtualDom$attribute('text-anchor');
var _elm_lang$svg$Svg_Attributes$stroke = _elm_lang$virtual_dom$VirtualDom$attribute('stroke');
var _elm_lang$svg$Svg_Attributes$strokeWidth = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-width');
var _elm_lang$svg$Svg_Attributes$strokeOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-opacity');
var _elm_lang$svg$Svg_Attributes$strokeMiterlimit = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-miterlimit');
var _elm_lang$svg$Svg_Attributes$strokeLinejoin = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linejoin');
var _elm_lang$svg$Svg_Attributes$strokeLinecap = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linecap');
var _elm_lang$svg$Svg_Attributes$strokeDashoffset = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dashoffset');
var _elm_lang$svg$Svg_Attributes$strokeDasharray = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dasharray');
var _elm_lang$svg$Svg_Attributes$stopOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stop-opacity');
var _elm_lang$svg$Svg_Attributes$stopColor = _elm_lang$virtual_dom$VirtualDom$attribute('stop-color');
var _elm_lang$svg$Svg_Attributes$shapeRendering = _elm_lang$virtual_dom$VirtualDom$attribute('shape-rendering');
var _elm_lang$svg$Svg_Attributes$pointerEvents = _elm_lang$virtual_dom$VirtualDom$attribute('pointer-events');
var _elm_lang$svg$Svg_Attributes$overflow = _elm_lang$virtual_dom$VirtualDom$attribute('overflow');
var _elm_lang$svg$Svg_Attributes$opacity = _elm_lang$virtual_dom$VirtualDom$attribute('opacity');
var _elm_lang$svg$Svg_Attributes$mask = _elm_lang$virtual_dom$VirtualDom$attribute('mask');
var _elm_lang$svg$Svg_Attributes$markerStart = _elm_lang$virtual_dom$VirtualDom$attribute('marker-start');
var _elm_lang$svg$Svg_Attributes$markerMid = _elm_lang$virtual_dom$VirtualDom$attribute('marker-mid');
var _elm_lang$svg$Svg_Attributes$markerEnd = _elm_lang$virtual_dom$VirtualDom$attribute('marker-end');
var _elm_lang$svg$Svg_Attributes$lightingColor = _elm_lang$virtual_dom$VirtualDom$attribute('lighting-color');
var _elm_lang$svg$Svg_Attributes$letterSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('letter-spacing');
var _elm_lang$svg$Svg_Attributes$kerning = _elm_lang$virtual_dom$VirtualDom$attribute('kerning');
var _elm_lang$svg$Svg_Attributes$imageRendering = _elm_lang$virtual_dom$VirtualDom$attribute('image-rendering');
var _elm_lang$svg$Svg_Attributes$glyphOrientationVertical = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-vertical');
var _elm_lang$svg$Svg_Attributes$glyphOrientationHorizontal = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-horizontal');
var _elm_lang$svg$Svg_Attributes$fontWeight = _elm_lang$virtual_dom$VirtualDom$attribute('font-weight');
var _elm_lang$svg$Svg_Attributes$fontVariant = _elm_lang$virtual_dom$VirtualDom$attribute('font-variant');
var _elm_lang$svg$Svg_Attributes$fontStyle = _elm_lang$virtual_dom$VirtualDom$attribute('font-style');
var _elm_lang$svg$Svg_Attributes$fontStretch = _elm_lang$virtual_dom$VirtualDom$attribute('font-stretch');
var _elm_lang$svg$Svg_Attributes$fontSize = _elm_lang$virtual_dom$VirtualDom$attribute('font-size');
var _elm_lang$svg$Svg_Attributes$fontSizeAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('font-size-adjust');
var _elm_lang$svg$Svg_Attributes$fontFamily = _elm_lang$virtual_dom$VirtualDom$attribute('font-family');
var _elm_lang$svg$Svg_Attributes$floodOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('flood-opacity');
var _elm_lang$svg$Svg_Attributes$floodColor = _elm_lang$virtual_dom$VirtualDom$attribute('flood-color');
var _elm_lang$svg$Svg_Attributes$filter = _elm_lang$virtual_dom$VirtualDom$attribute('filter');
var _elm_lang$svg$Svg_Attributes$fill = _elm_lang$virtual_dom$VirtualDom$attribute('fill');
var _elm_lang$svg$Svg_Attributes$fillRule = _elm_lang$virtual_dom$VirtualDom$attribute('fill-rule');
var _elm_lang$svg$Svg_Attributes$fillOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('fill-opacity');
var _elm_lang$svg$Svg_Attributes$enableBackground = _elm_lang$virtual_dom$VirtualDom$attribute('enable-background');
var _elm_lang$svg$Svg_Attributes$dominantBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('dominant-baseline');
var _elm_lang$svg$Svg_Attributes$display = _elm_lang$virtual_dom$VirtualDom$attribute('display');
var _elm_lang$svg$Svg_Attributes$direction = _elm_lang$virtual_dom$VirtualDom$attribute('direction');
var _elm_lang$svg$Svg_Attributes$cursor = _elm_lang$virtual_dom$VirtualDom$attribute('cursor');
var _elm_lang$svg$Svg_Attributes$color = _elm_lang$virtual_dom$VirtualDom$attribute('color');
var _elm_lang$svg$Svg_Attributes$colorRendering = _elm_lang$virtual_dom$VirtualDom$attribute('color-rendering');
var _elm_lang$svg$Svg_Attributes$colorProfile = _elm_lang$virtual_dom$VirtualDom$attribute('color-profile');
var _elm_lang$svg$Svg_Attributes$colorInterpolation = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation');
var _elm_lang$svg$Svg_Attributes$colorInterpolationFilters = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation-filters');
var _elm_lang$svg$Svg_Attributes$clip = _elm_lang$virtual_dom$VirtualDom$attribute('clip');
var _elm_lang$svg$Svg_Attributes$clipRule = _elm_lang$virtual_dom$VirtualDom$attribute('clip-rule');
var _elm_lang$svg$Svg_Attributes$clipPath = _elm_lang$virtual_dom$VirtualDom$attribute('clip-path');
var _elm_lang$svg$Svg_Attributes$baselineShift = _elm_lang$virtual_dom$VirtualDom$attribute('baseline-shift');
var _elm_lang$svg$Svg_Attributes$alignmentBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('alignment-baseline');
var _elm_lang$svg$Svg_Attributes$zoomAndPan = _elm_lang$virtual_dom$VirtualDom$attribute('zoomAndPan');
var _elm_lang$svg$Svg_Attributes$z = _elm_lang$virtual_dom$VirtualDom$attribute('z');
var _elm_lang$svg$Svg_Attributes$yChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('yChannelSelector');
var _elm_lang$svg$Svg_Attributes$y2 = _elm_lang$virtual_dom$VirtualDom$attribute('y2');
var _elm_lang$svg$Svg_Attributes$y1 = _elm_lang$virtual_dom$VirtualDom$attribute('y1');
var _elm_lang$svg$Svg_Attributes$y = _elm_lang$virtual_dom$VirtualDom$attribute('y');
var _elm_lang$svg$Svg_Attributes$xmlSpace = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:space');
var _elm_lang$svg$Svg_Attributes$xmlLang = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:lang');
var _elm_lang$svg$Svg_Attributes$xmlBase = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:base');
var _elm_lang$svg$Svg_Attributes$xlinkType = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:type');
var _elm_lang$svg$Svg_Attributes$xlinkTitle = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:title');
var _elm_lang$svg$Svg_Attributes$xlinkShow = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:show');
var _elm_lang$svg$Svg_Attributes$xlinkRole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:role');
var _elm_lang$svg$Svg_Attributes$xlinkHref = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:href');
var _elm_lang$svg$Svg_Attributes$xlinkArcrole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:arcrole');
var _elm_lang$svg$Svg_Attributes$xlinkActuate = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:actuate');
var _elm_lang$svg$Svg_Attributes$xChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('xChannelSelector');
var _elm_lang$svg$Svg_Attributes$x2 = _elm_lang$virtual_dom$VirtualDom$attribute('x2');
var _elm_lang$svg$Svg_Attributes$x1 = _elm_lang$virtual_dom$VirtualDom$attribute('x1');
var _elm_lang$svg$Svg_Attributes$xHeight = _elm_lang$virtual_dom$VirtualDom$attribute('x-height');
var _elm_lang$svg$Svg_Attributes$x = _elm_lang$virtual_dom$VirtualDom$attribute('x');
var _elm_lang$svg$Svg_Attributes$widths = _elm_lang$virtual_dom$VirtualDom$attribute('widths');
var _elm_lang$svg$Svg_Attributes$width = _elm_lang$virtual_dom$VirtualDom$attribute('width');
var _elm_lang$svg$Svg_Attributes$viewTarget = _elm_lang$virtual_dom$VirtualDom$attribute('viewTarget');
var _elm_lang$svg$Svg_Attributes$viewBox = _elm_lang$virtual_dom$VirtualDom$attribute('viewBox');
var _elm_lang$svg$Svg_Attributes$vertOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-y');
var _elm_lang$svg$Svg_Attributes$vertOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-x');
var _elm_lang$svg$Svg_Attributes$vertAdvY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-adv-y');
var _elm_lang$svg$Svg_Attributes$version = _elm_lang$virtual_dom$VirtualDom$attribute('version');
var _elm_lang$svg$Svg_Attributes$values = _elm_lang$virtual_dom$VirtualDom$attribute('values');
var _elm_lang$svg$Svg_Attributes$vMathematical = _elm_lang$virtual_dom$VirtualDom$attribute('v-mathematical');
var _elm_lang$svg$Svg_Attributes$vIdeographic = _elm_lang$virtual_dom$VirtualDom$attribute('v-ideographic');
var _elm_lang$svg$Svg_Attributes$vHanging = _elm_lang$virtual_dom$VirtualDom$attribute('v-hanging');
var _elm_lang$svg$Svg_Attributes$vAlphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('v-alphabetic');
var _elm_lang$svg$Svg_Attributes$unitsPerEm = _elm_lang$virtual_dom$VirtualDom$attribute('units-per-em');
var _elm_lang$svg$Svg_Attributes$unicodeRange = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-range');
var _elm_lang$svg$Svg_Attributes$unicode = _elm_lang$virtual_dom$VirtualDom$attribute('unicode');
var _elm_lang$svg$Svg_Attributes$underlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('underline-thickness');
var _elm_lang$svg$Svg_Attributes$underlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('underline-position');
var _elm_lang$svg$Svg_Attributes$u2 = _elm_lang$virtual_dom$VirtualDom$attribute('u2');
var _elm_lang$svg$Svg_Attributes$u1 = _elm_lang$virtual_dom$VirtualDom$attribute('u1');
var _elm_lang$svg$Svg_Attributes$type_ = _elm_lang$virtual_dom$VirtualDom$attribute('type');
var _elm_lang$svg$Svg_Attributes$transform = _elm_lang$virtual_dom$VirtualDom$attribute('transform');
var _elm_lang$svg$Svg_Attributes$to = _elm_lang$virtual_dom$VirtualDom$attribute('to');
var _elm_lang$svg$Svg_Attributes$title = _elm_lang$virtual_dom$VirtualDom$attribute('title');
var _elm_lang$svg$Svg_Attributes$textLength = _elm_lang$virtual_dom$VirtualDom$attribute('textLength');
var _elm_lang$svg$Svg_Attributes$targetY = _elm_lang$virtual_dom$VirtualDom$attribute('targetY');
var _elm_lang$svg$Svg_Attributes$targetX = _elm_lang$virtual_dom$VirtualDom$attribute('targetX');
var _elm_lang$svg$Svg_Attributes$target = _elm_lang$virtual_dom$VirtualDom$attribute('target');
var _elm_lang$svg$Svg_Attributes$tableValues = _elm_lang$virtual_dom$VirtualDom$attribute('tableValues');
var _elm_lang$svg$Svg_Attributes$systemLanguage = _elm_lang$virtual_dom$VirtualDom$attribute('systemLanguage');
var _elm_lang$svg$Svg_Attributes$surfaceScale = _elm_lang$virtual_dom$VirtualDom$attribute('surfaceScale');
var _elm_lang$svg$Svg_Attributes$style = _elm_lang$virtual_dom$VirtualDom$attribute('style');
var _elm_lang$svg$Svg_Attributes$string = _elm_lang$virtual_dom$VirtualDom$attribute('string');
var _elm_lang$svg$Svg_Attributes$strikethroughThickness = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-thickness');
var _elm_lang$svg$Svg_Attributes$strikethroughPosition = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-position');
var _elm_lang$svg$Svg_Attributes$stitchTiles = _elm_lang$virtual_dom$VirtualDom$attribute('stitchTiles');
var _elm_lang$svg$Svg_Attributes$stemv = _elm_lang$virtual_dom$VirtualDom$attribute('stemv');
var _elm_lang$svg$Svg_Attributes$stemh = _elm_lang$virtual_dom$VirtualDom$attribute('stemh');
var _elm_lang$svg$Svg_Attributes$stdDeviation = _elm_lang$virtual_dom$VirtualDom$attribute('stdDeviation');
var _elm_lang$svg$Svg_Attributes$startOffset = _elm_lang$virtual_dom$VirtualDom$attribute('startOffset');
var _elm_lang$svg$Svg_Attributes$spreadMethod = _elm_lang$virtual_dom$VirtualDom$attribute('spreadMethod');
var _elm_lang$svg$Svg_Attributes$speed = _elm_lang$virtual_dom$VirtualDom$attribute('speed');
var _elm_lang$svg$Svg_Attributes$specularExponent = _elm_lang$virtual_dom$VirtualDom$attribute('specularExponent');
var _elm_lang$svg$Svg_Attributes$specularConstant = _elm_lang$virtual_dom$VirtualDom$attribute('specularConstant');
var _elm_lang$svg$Svg_Attributes$spacing = _elm_lang$virtual_dom$VirtualDom$attribute('spacing');
var _elm_lang$svg$Svg_Attributes$slope = _elm_lang$virtual_dom$VirtualDom$attribute('slope');
var _elm_lang$svg$Svg_Attributes$seed = _elm_lang$virtual_dom$VirtualDom$attribute('seed');
var _elm_lang$svg$Svg_Attributes$scale = _elm_lang$virtual_dom$VirtualDom$attribute('scale');
var _elm_lang$svg$Svg_Attributes$ry = _elm_lang$virtual_dom$VirtualDom$attribute('ry');
var _elm_lang$svg$Svg_Attributes$rx = _elm_lang$virtual_dom$VirtualDom$attribute('rx');
var _elm_lang$svg$Svg_Attributes$rotate = _elm_lang$virtual_dom$VirtualDom$attribute('rotate');
var _elm_lang$svg$Svg_Attributes$result = _elm_lang$virtual_dom$VirtualDom$attribute('result');
var _elm_lang$svg$Svg_Attributes$restart = _elm_lang$virtual_dom$VirtualDom$attribute('restart');
var _elm_lang$svg$Svg_Attributes$requiredFeatures = _elm_lang$virtual_dom$VirtualDom$attribute('requiredFeatures');
var _elm_lang$svg$Svg_Attributes$requiredExtensions = _elm_lang$virtual_dom$VirtualDom$attribute('requiredExtensions');
var _elm_lang$svg$Svg_Attributes$repeatDur = _elm_lang$virtual_dom$VirtualDom$attribute('repeatDur');
var _elm_lang$svg$Svg_Attributes$repeatCount = _elm_lang$virtual_dom$VirtualDom$attribute('repeatCount');
var _elm_lang$svg$Svg_Attributes$renderingIntent = _elm_lang$virtual_dom$VirtualDom$attribute('rendering-intent');
var _elm_lang$svg$Svg_Attributes$refY = _elm_lang$virtual_dom$VirtualDom$attribute('refY');
var _elm_lang$svg$Svg_Attributes$refX = _elm_lang$virtual_dom$VirtualDom$attribute('refX');
var _elm_lang$svg$Svg_Attributes$radius = _elm_lang$virtual_dom$VirtualDom$attribute('radius');
var _elm_lang$svg$Svg_Attributes$r = _elm_lang$virtual_dom$VirtualDom$attribute('r');
var _elm_lang$svg$Svg_Attributes$primitiveUnits = _elm_lang$virtual_dom$VirtualDom$attribute('primitiveUnits');
var _elm_lang$svg$Svg_Attributes$preserveAspectRatio = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAspectRatio');
var _elm_lang$svg$Svg_Attributes$preserveAlpha = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAlpha');
var _elm_lang$svg$Svg_Attributes$pointsAtZ = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtZ');
var _elm_lang$svg$Svg_Attributes$pointsAtY = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtY');
var _elm_lang$svg$Svg_Attributes$pointsAtX = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtX');
var _elm_lang$svg$Svg_Attributes$points = _elm_lang$virtual_dom$VirtualDom$attribute('points');
var _elm_lang$svg$Svg_Attributes$pointOrder = _elm_lang$virtual_dom$VirtualDom$attribute('point-order');
var _elm_lang$svg$Svg_Attributes$patternUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternUnits');
var _elm_lang$svg$Svg_Attributes$patternTransform = _elm_lang$virtual_dom$VirtualDom$attribute('patternTransform');
var _elm_lang$svg$Svg_Attributes$patternContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternContentUnits');
var _elm_lang$svg$Svg_Attributes$pathLength = _elm_lang$virtual_dom$VirtualDom$attribute('pathLength');
var _elm_lang$svg$Svg_Attributes$path = _elm_lang$virtual_dom$VirtualDom$attribute('path');
var _elm_lang$svg$Svg_Attributes$panose1 = _elm_lang$virtual_dom$VirtualDom$attribute('panose-1');
var _elm_lang$svg$Svg_Attributes$overlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('overline-thickness');
var _elm_lang$svg$Svg_Attributes$overlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('overline-position');
var _elm_lang$svg$Svg_Attributes$origin = _elm_lang$virtual_dom$VirtualDom$attribute('origin');
var _elm_lang$svg$Svg_Attributes$orientation = _elm_lang$virtual_dom$VirtualDom$attribute('orientation');
var _elm_lang$svg$Svg_Attributes$orient = _elm_lang$virtual_dom$VirtualDom$attribute('orient');
var _elm_lang$svg$Svg_Attributes$order = _elm_lang$virtual_dom$VirtualDom$attribute('order');
var _elm_lang$svg$Svg_Attributes$operator = _elm_lang$virtual_dom$VirtualDom$attribute('operator');
var _elm_lang$svg$Svg_Attributes$offset = _elm_lang$virtual_dom$VirtualDom$attribute('offset');
var _elm_lang$svg$Svg_Attributes$numOctaves = _elm_lang$virtual_dom$VirtualDom$attribute('numOctaves');
var _elm_lang$svg$Svg_Attributes$name = _elm_lang$virtual_dom$VirtualDom$attribute('name');
var _elm_lang$svg$Svg_Attributes$mode = _elm_lang$virtual_dom$VirtualDom$attribute('mode');
var _elm_lang$svg$Svg_Attributes$min = _elm_lang$virtual_dom$VirtualDom$attribute('min');
var _elm_lang$svg$Svg_Attributes$method = _elm_lang$virtual_dom$VirtualDom$attribute('method');
var _elm_lang$svg$Svg_Attributes$media = _elm_lang$virtual_dom$VirtualDom$attribute('media');
var _elm_lang$svg$Svg_Attributes$max = _elm_lang$virtual_dom$VirtualDom$attribute('max');
var _elm_lang$svg$Svg_Attributes$mathematical = _elm_lang$virtual_dom$VirtualDom$attribute('mathematical');
var _elm_lang$svg$Svg_Attributes$maskUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskUnits');
var _elm_lang$svg$Svg_Attributes$maskContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskContentUnits');
var _elm_lang$svg$Svg_Attributes$markerWidth = _elm_lang$virtual_dom$VirtualDom$attribute('markerWidth');
var _elm_lang$svg$Svg_Attributes$markerUnits = _elm_lang$virtual_dom$VirtualDom$attribute('markerUnits');
var _elm_lang$svg$Svg_Attributes$markerHeight = _elm_lang$virtual_dom$VirtualDom$attribute('markerHeight');
var _elm_lang$svg$Svg_Attributes$local = _elm_lang$virtual_dom$VirtualDom$attribute('local');
var _elm_lang$svg$Svg_Attributes$limitingConeAngle = _elm_lang$virtual_dom$VirtualDom$attribute('limitingConeAngle');
var _elm_lang$svg$Svg_Attributes$lengthAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('lengthAdjust');
var _elm_lang$svg$Svg_Attributes$lang = _elm_lang$virtual_dom$VirtualDom$attribute('lang');
var _elm_lang$svg$Svg_Attributes$keyTimes = _elm_lang$virtual_dom$VirtualDom$attribute('keyTimes');
var _elm_lang$svg$Svg_Attributes$keySplines = _elm_lang$virtual_dom$VirtualDom$attribute('keySplines');
var _elm_lang$svg$Svg_Attributes$keyPoints = _elm_lang$virtual_dom$VirtualDom$attribute('keyPoints');
var _elm_lang$svg$Svg_Attributes$kernelUnitLength = _elm_lang$virtual_dom$VirtualDom$attribute('kernelUnitLength');
var _elm_lang$svg$Svg_Attributes$kernelMatrix = _elm_lang$virtual_dom$VirtualDom$attribute('kernelMatrix');
var _elm_lang$svg$Svg_Attributes$k4 = _elm_lang$virtual_dom$VirtualDom$attribute('k4');
var _elm_lang$svg$Svg_Attributes$k3 = _elm_lang$virtual_dom$VirtualDom$attribute('k3');
var _elm_lang$svg$Svg_Attributes$k2 = _elm_lang$virtual_dom$VirtualDom$attribute('k2');
var _elm_lang$svg$Svg_Attributes$k1 = _elm_lang$virtual_dom$VirtualDom$attribute('k1');
var _elm_lang$svg$Svg_Attributes$k = _elm_lang$virtual_dom$VirtualDom$attribute('k');
var _elm_lang$svg$Svg_Attributes$intercept = _elm_lang$virtual_dom$VirtualDom$attribute('intercept');
var _elm_lang$svg$Svg_Attributes$in2 = _elm_lang$virtual_dom$VirtualDom$attribute('in2');
var _elm_lang$svg$Svg_Attributes$in_ = _elm_lang$virtual_dom$VirtualDom$attribute('in');
var _elm_lang$svg$Svg_Attributes$ideographic = _elm_lang$virtual_dom$VirtualDom$attribute('ideographic');
var _elm_lang$svg$Svg_Attributes$id = _elm_lang$virtual_dom$VirtualDom$attribute('id');
var _elm_lang$svg$Svg_Attributes$horizOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-y');
var _elm_lang$svg$Svg_Attributes$horizOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-x');
var _elm_lang$svg$Svg_Attributes$horizAdvX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-adv-x');
var _elm_lang$svg$Svg_Attributes$height = _elm_lang$virtual_dom$VirtualDom$attribute('height');
var _elm_lang$svg$Svg_Attributes$hanging = _elm_lang$virtual_dom$VirtualDom$attribute('hanging');
var _elm_lang$svg$Svg_Attributes$gradientUnits = _elm_lang$virtual_dom$VirtualDom$attribute('gradientUnits');
var _elm_lang$svg$Svg_Attributes$gradientTransform = _elm_lang$virtual_dom$VirtualDom$attribute('gradientTransform');
var _elm_lang$svg$Svg_Attributes$glyphRef = _elm_lang$virtual_dom$VirtualDom$attribute('glyphRef');
var _elm_lang$svg$Svg_Attributes$glyphName = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-name');
var _elm_lang$svg$Svg_Attributes$g2 = _elm_lang$virtual_dom$VirtualDom$attribute('g2');
var _elm_lang$svg$Svg_Attributes$g1 = _elm_lang$virtual_dom$VirtualDom$attribute('g1');
var _elm_lang$svg$Svg_Attributes$fy = _elm_lang$virtual_dom$VirtualDom$attribute('fy');
var _elm_lang$svg$Svg_Attributes$fx = _elm_lang$virtual_dom$VirtualDom$attribute('fx');
var _elm_lang$svg$Svg_Attributes$from = _elm_lang$virtual_dom$VirtualDom$attribute('from');
var _elm_lang$svg$Svg_Attributes$format = _elm_lang$virtual_dom$VirtualDom$attribute('format');
var _elm_lang$svg$Svg_Attributes$filterUnits = _elm_lang$virtual_dom$VirtualDom$attribute('filterUnits');
var _elm_lang$svg$Svg_Attributes$filterRes = _elm_lang$virtual_dom$VirtualDom$attribute('filterRes');
var _elm_lang$svg$Svg_Attributes$externalResourcesRequired = _elm_lang$virtual_dom$VirtualDom$attribute('externalResourcesRequired');
var _elm_lang$svg$Svg_Attributes$exponent = _elm_lang$virtual_dom$VirtualDom$attribute('exponent');
var _elm_lang$svg$Svg_Attributes$end = _elm_lang$virtual_dom$VirtualDom$attribute('end');
var _elm_lang$svg$Svg_Attributes$elevation = _elm_lang$virtual_dom$VirtualDom$attribute('elevation');
var _elm_lang$svg$Svg_Attributes$edgeMode = _elm_lang$virtual_dom$VirtualDom$attribute('edgeMode');
var _elm_lang$svg$Svg_Attributes$dy = _elm_lang$virtual_dom$VirtualDom$attribute('dy');
var _elm_lang$svg$Svg_Attributes$dx = _elm_lang$virtual_dom$VirtualDom$attribute('dx');
var _elm_lang$svg$Svg_Attributes$dur = _elm_lang$virtual_dom$VirtualDom$attribute('dur');
var _elm_lang$svg$Svg_Attributes$divisor = _elm_lang$virtual_dom$VirtualDom$attribute('divisor');
var _elm_lang$svg$Svg_Attributes$diffuseConstant = _elm_lang$virtual_dom$VirtualDom$attribute('diffuseConstant');
var _elm_lang$svg$Svg_Attributes$descent = _elm_lang$virtual_dom$VirtualDom$attribute('descent');
var _elm_lang$svg$Svg_Attributes$decelerate = _elm_lang$virtual_dom$VirtualDom$attribute('decelerate');
var _elm_lang$svg$Svg_Attributes$d = _elm_lang$virtual_dom$VirtualDom$attribute('d');
var _elm_lang$svg$Svg_Attributes$cy = _elm_lang$virtual_dom$VirtualDom$attribute('cy');
var _elm_lang$svg$Svg_Attributes$cx = _elm_lang$virtual_dom$VirtualDom$attribute('cx');
var _elm_lang$svg$Svg_Attributes$contentStyleType = _elm_lang$virtual_dom$VirtualDom$attribute('contentStyleType');
var _elm_lang$svg$Svg_Attributes$contentScriptType = _elm_lang$virtual_dom$VirtualDom$attribute('contentScriptType');
var _elm_lang$svg$Svg_Attributes$clipPathUnits = _elm_lang$virtual_dom$VirtualDom$attribute('clipPathUnits');
var _elm_lang$svg$Svg_Attributes$class = _elm_lang$virtual_dom$VirtualDom$attribute('class');
var _elm_lang$svg$Svg_Attributes$capHeight = _elm_lang$virtual_dom$VirtualDom$attribute('cap-height');
var _elm_lang$svg$Svg_Attributes$calcMode = _elm_lang$virtual_dom$VirtualDom$attribute('calcMode');
var _elm_lang$svg$Svg_Attributes$by = _elm_lang$virtual_dom$VirtualDom$attribute('by');
var _elm_lang$svg$Svg_Attributes$bias = _elm_lang$virtual_dom$VirtualDom$attribute('bias');
var _elm_lang$svg$Svg_Attributes$begin = _elm_lang$virtual_dom$VirtualDom$attribute('begin');
var _elm_lang$svg$Svg_Attributes$bbox = _elm_lang$virtual_dom$VirtualDom$attribute('bbox');
var _elm_lang$svg$Svg_Attributes$baseProfile = _elm_lang$virtual_dom$VirtualDom$attribute('baseProfile');
var _elm_lang$svg$Svg_Attributes$baseFrequency = _elm_lang$virtual_dom$VirtualDom$attribute('baseFrequency');
var _elm_lang$svg$Svg_Attributes$azimuth = _elm_lang$virtual_dom$VirtualDom$attribute('azimuth');
var _elm_lang$svg$Svg_Attributes$autoReverse = _elm_lang$virtual_dom$VirtualDom$attribute('autoReverse');
var _elm_lang$svg$Svg_Attributes$attributeType = _elm_lang$virtual_dom$VirtualDom$attribute('attributeType');
var _elm_lang$svg$Svg_Attributes$attributeName = _elm_lang$virtual_dom$VirtualDom$attribute('attributeName');
var _elm_lang$svg$Svg_Attributes$ascent = _elm_lang$virtual_dom$VirtualDom$attribute('ascent');
var _elm_lang$svg$Svg_Attributes$arabicForm = _elm_lang$virtual_dom$VirtualDom$attribute('arabic-form');
var _elm_lang$svg$Svg_Attributes$amplitude = _elm_lang$virtual_dom$VirtualDom$attribute('amplitude');
var _elm_lang$svg$Svg_Attributes$allowReorder = _elm_lang$virtual_dom$VirtualDom$attribute('allowReorder');
var _elm_lang$svg$Svg_Attributes$alphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('alphabetic');
var _elm_lang$svg$Svg_Attributes$additive = _elm_lang$virtual_dom$VirtualDom$attribute('additive');
var _elm_lang$svg$Svg_Attributes$accumulate = _elm_lang$virtual_dom$VirtualDom$attribute('accumulate');
var _elm_lang$svg$Svg_Attributes$accelerate = _elm_lang$virtual_dom$VirtualDom$attribute('accelerate');
var _elm_lang$svg$Svg_Attributes$accentHeight = _elm_lang$virtual_dom$VirtualDom$attribute('accent-height');

var _elm_lang$core$Color$fmod = F2(
	function (f, n) {
		var integer = _elm_lang$core$Basics$floor(f);
		return (_elm_lang$core$Basics$toFloat(
			A2(_elm_lang$core$Basics_ops['%'], integer, n)) + f) - _elm_lang$core$Basics$toFloat(integer);
	});
var _elm_lang$core$Color$rgbToHsl = F3(
	function (red, green, blue) {
		var b = _elm_lang$core$Basics$toFloat(blue) / 255;
		var g = _elm_lang$core$Basics$toFloat(green) / 255;
		var r = _elm_lang$core$Basics$toFloat(red) / 255;
		var cMax = A2(
			_elm_lang$core$Basics$max,
			A2(_elm_lang$core$Basics$max, r, g),
			b);
		var cMin = A2(
			_elm_lang$core$Basics$min,
			A2(_elm_lang$core$Basics$min, r, g),
			b);
		var c = cMax - cMin;
		var lightness = (cMax + cMin) / 2;
		var saturation = _elm_lang$core$Native_Utils.eq(lightness, 0) ? 0 : (c / (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)));
		var hue = _elm_lang$core$Basics$degrees(60) * (_elm_lang$core$Native_Utils.eq(cMax, r) ? A2(_elm_lang$core$Color$fmod, (g - b) / c, 6) : (_elm_lang$core$Native_Utils.eq(cMax, g) ? (((b - r) / c) + 2) : (((r - g) / c) + 4)));
		return {ctor: '_Tuple3', _0: hue, _1: saturation, _2: lightness};
	});
var _elm_lang$core$Color$hslToRgb = F3(
	function (hue, saturation, lightness) {
		var normHue = hue / _elm_lang$core$Basics$degrees(60);
		var chroma = (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)) * saturation;
		var x = chroma * (1 - _elm_lang$core$Basics$abs(
			A2(_elm_lang$core$Color$fmod, normHue, 2) - 1));
		var _p0 = (_elm_lang$core$Native_Utils.cmp(normHue, 0) < 0) ? {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 1) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: x, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 2) < 0) ? {ctor: '_Tuple3', _0: x, _1: chroma, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 3) < 0) ? {ctor: '_Tuple3', _0: 0, _1: chroma, _2: x} : ((_elm_lang$core$Native_Utils.cmp(normHue, 4) < 0) ? {ctor: '_Tuple3', _0: 0, _1: x, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 5) < 0) ? {ctor: '_Tuple3', _0: x, _1: 0, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 6) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: 0, _2: x} : {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0}))))));
		var r = _p0._0;
		var g = _p0._1;
		var b = _p0._2;
		var m = lightness - (chroma / 2);
		return {ctor: '_Tuple3', _0: r + m, _1: g + m, _2: b + m};
	});
var _elm_lang$core$Color$toRgb = function (color) {
	var _p1 = color;
	if (_p1.ctor === 'RGBA') {
		return {red: _p1._0, green: _p1._1, blue: _p1._2, alpha: _p1._3};
	} else {
		var _p2 = A3(_elm_lang$core$Color$hslToRgb, _p1._0, _p1._1, _p1._2);
		var r = _p2._0;
		var g = _p2._1;
		var b = _p2._2;
		return {
			red: _elm_lang$core$Basics$round(255 * r),
			green: _elm_lang$core$Basics$round(255 * g),
			blue: _elm_lang$core$Basics$round(255 * b),
			alpha: _p1._3
		};
	}
};
var _elm_lang$core$Color$toHsl = function (color) {
	var _p3 = color;
	if (_p3.ctor === 'HSLA') {
		return {hue: _p3._0, saturation: _p3._1, lightness: _p3._2, alpha: _p3._3};
	} else {
		var _p4 = A3(_elm_lang$core$Color$rgbToHsl, _p3._0, _p3._1, _p3._2);
		var h = _p4._0;
		var s = _p4._1;
		var l = _p4._2;
		return {hue: h, saturation: s, lightness: l, alpha: _p3._3};
	}
};
var _elm_lang$core$Color$HSLA = F4(
	function (a, b, c, d) {
		return {ctor: 'HSLA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$hsla = F4(
	function (hue, saturation, lightness, alpha) {
		return A4(
			_elm_lang$core$Color$HSLA,
			hue - _elm_lang$core$Basics$turns(
				_elm_lang$core$Basics$toFloat(
					_elm_lang$core$Basics$floor(hue / (2 * _elm_lang$core$Basics$pi)))),
			saturation,
			lightness,
			alpha);
	});
var _elm_lang$core$Color$hsl = F3(
	function (hue, saturation, lightness) {
		return A4(_elm_lang$core$Color$hsla, hue, saturation, lightness, 1);
	});
var _elm_lang$core$Color$complement = function (color) {
	var _p5 = color;
	if (_p5.ctor === 'HSLA') {
		return A4(
			_elm_lang$core$Color$hsla,
			_p5._0 + _elm_lang$core$Basics$degrees(180),
			_p5._1,
			_p5._2,
			_p5._3);
	} else {
		var _p6 = A3(_elm_lang$core$Color$rgbToHsl, _p5._0, _p5._1, _p5._2);
		var h = _p6._0;
		var s = _p6._1;
		var l = _p6._2;
		return A4(
			_elm_lang$core$Color$hsla,
			h + _elm_lang$core$Basics$degrees(180),
			s,
			l,
			_p5._3);
	}
};
var _elm_lang$core$Color$grayscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$greyscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$RGBA = F4(
	function (a, b, c, d) {
		return {ctor: 'RGBA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$rgba = _elm_lang$core$Color$RGBA;
var _elm_lang$core$Color$rgb = F3(
	function (r, g, b) {
		return A4(_elm_lang$core$Color$RGBA, r, g, b, 1);
	});
var _elm_lang$core$Color$lightRed = A4(_elm_lang$core$Color$RGBA, 239, 41, 41, 1);
var _elm_lang$core$Color$red = A4(_elm_lang$core$Color$RGBA, 204, 0, 0, 1);
var _elm_lang$core$Color$darkRed = A4(_elm_lang$core$Color$RGBA, 164, 0, 0, 1);
var _elm_lang$core$Color$lightOrange = A4(_elm_lang$core$Color$RGBA, 252, 175, 62, 1);
var _elm_lang$core$Color$orange = A4(_elm_lang$core$Color$RGBA, 245, 121, 0, 1);
var _elm_lang$core$Color$darkOrange = A4(_elm_lang$core$Color$RGBA, 206, 92, 0, 1);
var _elm_lang$core$Color$lightYellow = A4(_elm_lang$core$Color$RGBA, 255, 233, 79, 1);
var _elm_lang$core$Color$yellow = A4(_elm_lang$core$Color$RGBA, 237, 212, 0, 1);
var _elm_lang$core$Color$darkYellow = A4(_elm_lang$core$Color$RGBA, 196, 160, 0, 1);
var _elm_lang$core$Color$lightGreen = A4(_elm_lang$core$Color$RGBA, 138, 226, 52, 1);
var _elm_lang$core$Color$green = A4(_elm_lang$core$Color$RGBA, 115, 210, 22, 1);
var _elm_lang$core$Color$darkGreen = A4(_elm_lang$core$Color$RGBA, 78, 154, 6, 1);
var _elm_lang$core$Color$lightBlue = A4(_elm_lang$core$Color$RGBA, 114, 159, 207, 1);
var _elm_lang$core$Color$blue = A4(_elm_lang$core$Color$RGBA, 52, 101, 164, 1);
var _elm_lang$core$Color$darkBlue = A4(_elm_lang$core$Color$RGBA, 32, 74, 135, 1);
var _elm_lang$core$Color$lightPurple = A4(_elm_lang$core$Color$RGBA, 173, 127, 168, 1);
var _elm_lang$core$Color$purple = A4(_elm_lang$core$Color$RGBA, 117, 80, 123, 1);
var _elm_lang$core$Color$darkPurple = A4(_elm_lang$core$Color$RGBA, 92, 53, 102, 1);
var _elm_lang$core$Color$lightBrown = A4(_elm_lang$core$Color$RGBA, 233, 185, 110, 1);
var _elm_lang$core$Color$brown = A4(_elm_lang$core$Color$RGBA, 193, 125, 17, 1);
var _elm_lang$core$Color$darkBrown = A4(_elm_lang$core$Color$RGBA, 143, 89, 2, 1);
var _elm_lang$core$Color$black = A4(_elm_lang$core$Color$RGBA, 0, 0, 0, 1);
var _elm_lang$core$Color$white = A4(_elm_lang$core$Color$RGBA, 255, 255, 255, 1);
var _elm_lang$core$Color$lightGrey = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$grey = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGrey = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightGray = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$gray = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGray = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightCharcoal = A4(_elm_lang$core$Color$RGBA, 136, 138, 133, 1);
var _elm_lang$core$Color$charcoal = A4(_elm_lang$core$Color$RGBA, 85, 87, 83, 1);
var _elm_lang$core$Color$darkCharcoal = A4(_elm_lang$core$Color$RGBA, 46, 52, 54, 1);
var _elm_lang$core$Color$Radial = F5(
	function (a, b, c, d, e) {
		return {ctor: 'Radial', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Color$radial = _elm_lang$core$Color$Radial;
var _elm_lang$core$Color$Linear = F3(
	function (a, b, c) {
		return {ctor: 'Linear', _0: a, _1: b, _2: c};
	});
var _elm_lang$core$Color$linear = _elm_lang$core$Color$Linear;

var _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString = function (color) {
	var _p0 = _elm_lang$core$Color$toRgb(color);
	var red = _p0.red;
	var green = _p0.green;
	var blue = _p0.blue;
	var alpha = _p0.alpha;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'rgba(',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(red),
			A2(
				_elm_lang$core$Basics_ops['++'],
				',',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(green),
					A2(
						_elm_lang$core$Basics_ops['++'],
						',',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(blue),
							A2(
								_elm_lang$core$Basics_ops['++'],
								',',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(alpha),
									')'))))))));
};
var _elm_community$elm_material_icons$Material_Icons_Internal$icon = F3(
	function (path, color, size) {
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		var stringSize = _elm_lang$core$Basics$toString(size);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d(path),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});

var _elm_community$elm_material_icons$Material_Icons_Action$zoom_out = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z');
var _elm_community$elm_material_icons$Material_Icons_Action$zoom_in = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z');
var _elm_community$elm_material_icons$Material_Icons_Action$youtube_searched_for = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17.01 14h-.8l-.27-.27c.98-1.14 1.57-2.61 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5s-6.5 3-6.5 6.5H2l3.84 4 4.16-4H6.51C6.51 7 8.53 5 11.01 5s4.5 2.01 4.5 4.5c0 2.48-2.02 4.5-4.5 4.5-.65 0-1.26-.14-1.82-.38L7.71 15.1c.97.57 2.09.9 3.3.9 1.61 0 3.08-.59 4.22-1.57l.27.27v.79l5.01 4.99L22 19l-4.99-5z');
var _elm_community$elm_material_icons$Material_Icons_Action$work = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$visibility_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z');
var _elm_community$elm_material_icons$Material_Icons_Action$visibility = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
var _elm_community$elm_material_icons$Material_Icons_Action$view_week = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6 5H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm14 0h-3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm-7 0h-3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z');
var _elm_community$elm_material_icons$Material_Icons_Action$view_stream = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 18h17v-6H4v6zM4 5v6h17V5H4z');
var _elm_community$elm_material_icons$Material_Icons_Action$view_quilt = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 18h5v-6h-5v6zm-6 0h5V5H4v13zm12 0h5v-6h-5v6zM10 5v6h11V5H10z');
var _elm_community$elm_material_icons$Material_Icons_Action$view_module = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z');
var _elm_community$elm_material_icons$Material_Icons_Action$view_list = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z');
var _elm_community$elm_material_icons$Material_Icons_Action$view_headline = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z');
var _elm_community$elm_material_icons$Material_Icons_Action$view_day = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M2 21h19v-3H2v3zM20 8H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zM2 3v3h19V3H2z');
var _elm_community$elm_material_icons$Material_Icons_Action$view_column = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 18h5V5h-5v13zm-6 0h5V5H4v13zM16 5v13h5V5h-5z');
var _elm_community$elm_material_icons$Material_Icons_Action$view_carousel = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 19h10V4H7v15zm-5-2h4V6H2v11zM18 6v11h4V6h-4z');
var _elm_community$elm_material_icons$Material_Icons_Action$view_array = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 18h3V5H4v13zM18 5v13h3V5h-3zM8 18h9V5H8v13z');
var _elm_community$elm_material_icons$Material_Icons_Action$view_agenda = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 13H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zm0-10H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z');
var _elm_community$elm_material_icons$Material_Icons_Action$verified_user = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z');
var _elm_community$elm_material_icons$Material_Icons_Action$turned_in_not = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z');
var _elm_community$elm_material_icons$Material_Icons_Action$turned_in = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z');
var _elm_community$elm_material_icons$Material_Icons_Action$trending_up = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z');
var _elm_community$elm_material_icons$Material_Icons_Action$trending_flat = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M22 12l-4-4v3H3v2h15v3z');
var _elm_community$elm_material_icons$Material_Icons_Action$trending_down = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z');
var _elm_community$elm_material_icons$Material_Icons_Action$translate = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z');
var _elm_community$elm_material_icons$Material_Icons_Action$track_changes = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.16 6.57 6 9.03 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.66-.67-3.16-1.76-4.24l-1.41 1.41C15.55 9.9 16 10.9 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.86 1.28-3.41 3-3.86v2.14c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V2h-1C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z');
var _elm_community$elm_material_icons$Material_Icons_Action$toll = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM3 12c0-2.61 1.67-4.83 4-5.65V4.26C3.55 5.15 1 8.27 1 12s2.55 6.85 6 7.74v-2.09c-2.33-.82-4-3.04-4-5.65z');
var _elm_community$elm_material_icons$Material_Icons_Action$today = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z');
var _elm_community$elm_material_icons$Material_Icons_Action$toc = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$thumps_up_down = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 6c0-.55-.45-1-1-1H5.82l.66-3.18.02-.23c0-.31-.13-.59-.33-.8L5.38 0 .44 4.94C.17 5.21 0 5.59 0 6v6.5c0 .83.67 1.5 1.5 1.5h6.75c.62 0 1.15-.38 1.38-.91l2.26-5.29c.07-.17.11-.36.11-.55V6zm10.5 4h-6.75c-.62 0-1.15.38-1.38.91l-2.26 5.29c-.07.17-.11.36-.11.55V18c0 .55.45 1 1 1h5.18l-.66 3.18-.02.24c0 .31.13.59.33.8l.79.78 4.94-4.94c.27-.27.44-.65.44-1.06v-6.5c0-.83-.67-1.5-1.5-1.5z');
var _elm_community$elm_material_icons$Material_Icons_Action$thumb_up = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z');
var _elm_community$elm_material_icons$Material_Icons_Action$thumb_down = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z');
var _elm_community$elm_material_icons$Material_Icons_Action$theaters = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$tab_unselected = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M1 9h2V7H1v2zm0 4h2v-2H1v2zm0-8h2V3c-1.1 0-2 .9-2 2zm8 16h2v-2H9v2zm-8-4h2v-2H1v2zm2 4v-2H1c0 1.1.9 2 2 2zM21 3h-8v6h10V5c0-1.1-.9-2-2-2zm0 14h2v-2h-2v2zM9 5h2V3H9v2zM5 21h2v-2H5v2zM5 5h2V3H5v2zm16 16c1.1 0 2-.9 2-2h-2v2zm0-8h2v-2h-2v2zm-8 8h2v-2h-2v2zm4 0h2v-2h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$tab = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h10v4h8v10z');
var _elm_community$elm_material_icons$Material_Icons_Action$system_update_alt = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 16.5l4-4h-3v-9h-2v9H8l4 4zm9-13h-6v1.99h6v14.03H3V5.49h6V3.5H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2z');
var _elm_community$elm_material_icons$Material_Icons_Action$swap_vertical_circle = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM6.5 9L10 5.5 13.5 9H11v4H9V9H6.5zm11 6L14 18.5 10.5 15H13v-4h2v4h2.5z');
var _elm_community$elm_material_icons$Material_Icons_Action$swap_vert = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z');
var _elm_community$elm_material_icons$Material_Icons_Action$swap_horiz = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z');
var _elm_community$elm_material_icons$Material_Icons_Action$supervisor_account = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16.5 12c1.38 0 2.49-1.12 2.49-2.5S17.88 7 16.5 7C15.12 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5zM9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3zm7.5 3c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75zM9 13c-2.33 0-7 1.17-7 3.5V19h7v-2.25c0-.85.33-2.34 2.37-3.47C10.5 13.1 9.66 13 9 13z');
var _elm_community$elm_material_icons$Material_Icons_Action$subject = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z');
var _elm_community$elm_material_icons$Material_Icons_Action$store = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z');
var _elm_community$elm_material_icons$Material_Icons_Action$stars = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z');
var _elm_community$elm_material_icons$Material_Icons_Action$star_rate = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 18 18'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M9 11.3l3.71 2.7-1.42-4.36L15 7h-4.55L9 2.5 7.55 7H3l3.71 2.64L5.29 14z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Action$spellcheck = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12.45 16h2.09L9.43 3H7.57L2.46 16h2.09l1.12-3h5.64l1.14 3zm-6.02-5L8.5 5.48 10.57 11H6.43zm15.16.59l-8.09 8.09L9.83 16l-1.41 1.41 5.09 5.09L23 13l-1.41-1.41z');
var _elm_community$elm_material_icons$Material_Icons_Action$speaker_notes = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 14H6v-2h2v2zm0-3H6V9h2v2zm0-3H6V6h2v2zm7 6h-5v-2h5v2zm3-3h-8V9h8v2zm0-3h-8V6h8v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$shopping_cart = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z');
var _elm_community$elm_material_icons$Material_Icons_Action$shopping_basket = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z');
var _elm_community$elm_material_icons$Material_Icons_Action$shop_two = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 9H1v11c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2H3V9zm15-4V3c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H5v11c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5h-5zm-6-2h4v2h-4V3zm0 12V8l5.5 3-5.5 4z');
var _elm_community$elm_material_icons$Material_Icons_Action$shop = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zM9 18V9l7.5 4L9 18z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_voice = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 24h2v-2H7v2zm5-11c1.66 0 2.99-1.34 2.99-3L15 4c0-1.66-1.34-3-3-3S9 2.34 9 4v6c0 1.66 1.34 3 3 3zm-1 11h2v-2h-2v2zm4 0h2v-2h-2v2zm4-14h-1.7c0 3-2.54 5.1-5.3 5.1S6.7 13 6.7 10H5c0 3.41 2.72 6.23 6 6.72V20h2v-3.28c3.28-.49 6-3.31 6-6.72z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_remote = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15 9H9c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V10c0-.55-.45-1-1-1zm-3 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM7.05 6.05l1.41 1.41C9.37 6.56 10.62 6 12 6s2.63.56 3.54 1.46l1.41-1.41C15.68 4.78 13.93 4 12 4s-3.68.78-4.95 2.05zM12 0C8.96 0 6.21 1.23 4.22 3.22l1.41 1.41C7.26 3.01 9.51 2 12 2s4.74 1.01 6.36 2.64l1.41-1.41C17.79 1.23 15.04 0 12 0z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_power = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 24h2v-2H7v2zm4 0h2v-2h-2v2zm2-22h-2v10h2V2zm3.56 2.44l-1.45 1.45C16.84 6.94 18 8.83 18 11c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-2.17 1.16-4.06 2.88-5.12L7.44 4.44C5.36 5.88 4 8.28 4 11c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2.72-1.36-5.12-3.44-6.56zM15 24h2v-2h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_phone = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 9h-2v2h2V9zm4 0h-2v2h2V9zm3 6.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 9v2h2V9h-2z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_overscan = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12.01 5.5L10 8h4l-1.99-2.5zM18 10v4l2.5-1.99L18 10zM6 10l-2.5 2.01L6 14v-4zm8 6h-4l2.01 2.5L14 16zm7-13H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_input_svideo = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M8 11.5c0-.83-.67-1.5-1.5-1.5S5 10.67 5 11.5 5.67 13 6.5 13 8 12.33 8 11.5zm7-5c0-.83-.67-1.5-1.5-1.5h-3C9.67 5 9 5.67 9 6.5S9.67 8 10.5 8h3c.83 0 1.5-.67 1.5-1.5zM8.5 15c-.83 0-1.5.67-1.5 1.5S7.67 18 8.5 18s1.5-.67 1.5-1.5S9.33 15 8.5 15zM12 1C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zm0 20c-4.96 0-9-4.04-9-9s4.04-9 9-9 9 4.04 9 9-4.04 9-9 9zm5.5-11c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-2 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_input_hdmi = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 7V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v3H5v6l3 6v3h8v-3l3-6V7h-1zM8 4h8v3h-2V5h-1v2h-2V5h-1v2H8V4z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_input_composite = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M5 2c0-.55-.45-1-1-1s-1 .45-1 1v4H1v6h6V6H5V2zm4 14c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2H9v2zm-8 0c0 1.3.84 2.4 2 2.82V23h2v-4.18C6.16 18.4 7 17.3 7 16v-2H1v2zM21 6V2c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v6h6V6h-2zm-8-4c0-.55-.45-1-1-1s-1 .45-1 1v4H9v6h6V6h-2V2zm4 14c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2h-6v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_input_component = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M5 2c0-.55-.45-1-1-1s-1 .45-1 1v4H1v6h6V6H5V2zm4 14c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2H9v2zm-8 0c0 1.3.84 2.4 2 2.82V23h2v-4.18C6.16 18.4 7 17.3 7 16v-2H1v2zM21 6V2c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v6h6V6h-2zm-8-4c0-.55-.45-1-1-1s-1 .45-1 1v4H9v6h6V6h-2V2zm4 14c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2h-6v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_input_antenna = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 5c-3.87 0-7 3.13-7 7h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.87-3.13-7-7-7zm1 9.29c.88-.39 1.5-1.26 1.5-2.29 0-1.38-1.12-2.5-2.5-2.5S9.5 10.62 9.5 12c0 1.02.62 1.9 1.5 2.29v3.3L7.59 21 9 22.41l3-3 3 3L16.41 21 13 17.59v-3.3zM12 1C5.93 1 1 5.93 1 12h2c0-4.97 4.03-9 9-9s9 4.03 9 9h2c0-6.07-4.93-11-11-11z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_ethernet = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7.77 6.76L6.23 5.48.82 12l5.41 6.52 1.54-1.28L3.42 12l4.35-5.24zM7 13h2v-2H7v2zm10-2h-2v2h2v-2zm-6 2h2v-2h-2v2zm6.77-7.52l-1.54 1.28L20.58 12l-4.35 5.24 1.54 1.28L23.18 12l-5.41-6.52z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_cell = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 24h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zM16 .01L8 0C6.9 0 6 .9 6 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V2c0-1.1-.9-1.99-2-1.99zM16 16H8V4h8v12z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_brightness = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02zM8 16h2.5l1.5 1.5 1.5-1.5H16v-2.5l1.5-1.5-1.5-1.5V8h-2.5L12 6.5 10.5 8H8v2.5L6.5 12 8 13.5V16zm4-7c1.66 0 3 1.34 3 3s-1.34 3-3 3V9z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_bluetooth = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11 24h2v-2h-2v2zm-4 0h2v-2H7v2zm8 0h2v-2h-2v2zm2.71-18.29L12 0h-1v7.59L6.41 3 5 4.41 10.59 10 5 15.59 6.41 17 11 12.41V20h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 3.83l1.88 1.88L13 7.59V3.83zm1.88 10.46L13 16.17v-3.76l1.88 1.88z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_backup_restore = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9H0l4 4 4-4H5c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.51 0-2.91-.49-4.06-1.3l-1.42 1.44C8.04 20.3 9.94 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings_application = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm7-7H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-1.75 9c0 .23-.02.46-.05.68l1.48 1.16c.13.11.17.3.08.45l-1.4 2.42c-.09.15-.27.21-.43.15l-1.74-.7c-.36.28-.76.51-1.18.69l-.26 1.85c-.03.17-.18.3-.35.3h-2.8c-.17 0-.32-.13-.35-.29l-.26-1.85c-.43-.18-.82-.41-1.18-.69l-1.74.7c-.16.06-.34 0-.43-.15l-1.4-2.42c-.09-.15-.05-.34.08-.45l1.48-1.16c-.03-.23-.05-.46-.05-.69 0-.23.02-.46.05-.68l-1.48-1.16c-.13-.11-.17-.3-.08-.45l1.4-2.42c.09-.15.27-.21.43-.15l1.74.7c.36-.28.76-.51 1.18-.69l.26-1.85c.03-.17.18-.3.35-.3h2.8c.17 0 .32.13.35.29l.26 1.85c.43.18.82.41 1.18.69l1.74-.7c.16-.06.34 0 .43.15l1.4 2.42c.09.15.05.34-.08.45l-1.48 1.16c.03.23.05.46.05.69z');
var _elm_community$elm_material_icons$Material_Icons_Action$settings = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z');
var _elm_community$elm_material_icons$Material_Icons_Action$search = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z');
var _elm_community$elm_material_icons$Material_Icons_Action$schedule = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.9'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zM12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Action$room = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z');
var _elm_community$elm_material_icons$Material_Icons_Action$restore = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z');
var _elm_community$elm_material_icons$Material_Icons_Action$report_problem = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z');
var _elm_community$elm_material_icons$Material_Icons_Action$reorder = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z');
var _elm_community$elm_material_icons$Material_Icons_Action$redeem = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z');
var _elm_community$elm_material_icons$Material_Icons_Action$receipt = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z');
var _elm_community$elm_material_icons$Material_Icons_Action$question_answer = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z');
var _elm_community$elm_material_icons$Material_Icons_Action$query_builder = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zM12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z');
var _elm_community$elm_material_icons$Material_Icons_Action$print = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z');
var _elm_community$elm_material_icons$Material_Icons_Action$power_settings_new = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z');
var _elm_community$elm_material_icons$Material_Icons_Action$polymer = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 4h-4L7.11 16.63 4.5 12 9 4H5L.5 12 5 20h4l7.89-12.63L19.5 12 15 20h4l4.5-8z');
var _elm_community$elm_material_icons$Material_Icons_Action$play_for_work = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11 5v5.59H7.5l4.5 4.5 4.5-4.5H13V5h-2zm-5 9c0 3.31 2.69 6 6 6s6-2.69 6-6h-2c0 2.21-1.79 4-4 4s-4-1.79-4-4H6z');
var _elm_community$elm_material_icons$Material_Icons_Action$picture_in_picture = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z');
var _elm_community$elm_material_icons$Material_Icons_Action$perm_scan_wifi = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 3C6.95 3 3.15 4.85 0 7.23L12 22 24 7.25C20.85 4.87 17.05 3 12 3zm1 13h-2v-6h2v6zm-2-8V6h2v2h-2z');
var _elm_community$elm_material_icons$Material_Icons_Action$perm_phone_msg = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM12 3v10l3-3h6V3h-9z');
var _elm_community$elm_material_icons$Material_Icons_Action$perm_media = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M2 6H0v5h.01L0 20c0 1.1.9 2 2 2h18v-2H2V6zm20-2h-8l-2-2H6c-1.1 0-1.99.9-1.99 2L4 16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7 15l4.5-6 3.5 4.51 2.5-3.01L21 15H7z');
var _elm_community$elm_material_icons$Material_Icons_Action$perm_identity = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z');
var _elm_community$elm_material_icons$Material_Icons_Action$perm_device_information = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 7h-2v2h2V7zm0 4h-2v6h2v-6zm4-9.99L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z');
var _elm_community$elm_material_icons$Material_Icons_Action$perm_data_setting = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18.99 11.5c.34 0 .67.03 1 .07L20 0 0 20h11.56c-.04-.33-.07-.66-.07-1 0-4.14 3.36-7.5 7.5-7.5zm3.71 7.99c.02-.16.04-.32.04-.49 0-.17-.01-.33-.04-.49l1.06-.83c.09-.08.12-.21.06-.32l-1-1.73c-.06-.11-.19-.15-.31-.11l-1.24.5c-.26-.2-.54-.37-.85-.49l-.19-1.32c-.01-.12-.12-.21-.24-.21h-2c-.12 0-.23.09-.25.21l-.19 1.32c-.3.13-.59.29-.85.49l-1.24-.5c-.11-.04-.24 0-.31.11l-1 1.73c-.06.11-.04.24.06.32l1.06.83c-.02.16-.03.32-.03.49 0 .17.01.33.03.49l-1.06.83c-.09.08-.12.21-.06.32l1 1.73c.06.11.19.15.31.11l1.24-.5c.26.2.54.37.85.49l.19 1.32c.02.12.12.21.25.21h2c.12 0 .23-.09.25-.21l.19-1.32c.3-.13.59-.29.84-.49l1.25.5c.11.04.24 0 .31-.11l1-1.73c.06-.11.03-.24-.06-.32l-1.07-.83zm-3.71 1.01c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z');
var _elm_community$elm_material_icons$Material_Icons_Action$perm_contact_calendar = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z');
var _elm_community$elm_material_icons$Material_Icons_Action$perm_camera_mic = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v-2.09c-2.83-.48-5-2.94-5-5.91h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2c0 2.97-2.17 5.43-5 5.91V21h7c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-6 8c0 1.1-.9 2-2 2s-2-.9-2-2V9c0-1.1.9-2 2-2s2 .9 2 2v4z');
var _elm_community$elm_material_icons$Material_Icons_Action$payment = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$pageview = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11.5 9C10.12 9 9 10.12 9 11.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5S12.88 9 11.5 9zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-3.21 14.21l-2.91-2.91c-.69.44-1.51.7-2.39.7C9.01 16 7 13.99 7 11.5S9.01 7 11.5 7 16 9.01 16 11.5c0 .88-.26 1.69-.7 2.39l2.91 2.9-1.42 1.42z');
var _elm_community$elm_material_icons$Material_Icons_Action$open_with = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z');
var _elm_community$elm_material_icons$Material_Icons_Action$open_in_new = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z');
var _elm_community$elm_material_icons$Material_Icons_Action$open_in_browser = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-7 6l-4 4h3v6h2v-6h3l-4-4z');
var _elm_community$elm_material_icons$Material_Icons_Action$offline_pin = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$defs,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$id('a'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M0 0h24v24H0V0z'),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom$node,
						'clipPath',
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$id('b'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$use,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$xlinkHref('#a'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$overflow('visible'),
										_1: {ctor: '[]'}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d('M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5 16H7v-2h10v2zm-6.7-4L7 10.7l1.4-1.4 1.9 1.9 5.3-5.3L17 7.3 10.3 14z'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$clipPath('url(#b)'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Action$note_add = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z');
var _elm_community$elm_material_icons$Material_Icons_Action$markunread_mailbox = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 6H10v6H8V4h6V0H6v6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z');
var _elm_community$elm_material_icons$Material_Icons_Action$loyalty = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7zm11.77 8.27L13 19.54l-4.27-4.27C8.28 14.81 8 14.19 8 13.5c0-1.38 1.12-2.5 2.5-2.5.69 0 1.32.28 1.77.74l.73.72.73-.73c.45-.45 1.08-.73 1.77-.73 1.38 0 2.5 1.12 2.5 2.5 0 .69-.28 1.32-.73 1.77z');
var _elm_community$elm_material_icons$Material_Icons_Action$lock_outline = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6-5.1c1.71 0 3.1 1.39 3.1 3.1v2H9V6h-.1c0-1.71 1.39-3.1 3.1-3.1zM18 20H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z');
var _elm_community$elm_material_icons$Material_Icons_Action$lock_open = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z');
var _elm_community$elm_material_icons$Material_Icons_Action$lock = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$list = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z');
var _elm_community$elm_material_icons$Material_Icons_Action$launch = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z');
var _elm_community$elm_material_icons$Material_Icons_Action$language = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z');
var _elm_community$elm_material_icons$Material_Icons_Action$label_outline = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z');
var _elm_community$elm_material_icons$Material_Icons_Action$label = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z');
var _elm_community$elm_material_icons$Material_Icons_Action$invert_colors = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z');
var _elm_community$elm_material_icons$Material_Icons_Action$input = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14c0-1.11-.9-2-2-2zM11 16l4-4-4-4v3H1v2h10v3z');
var _elm_community$elm_material_icons$Material_Icons_Action$info_outline = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$info = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$https = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$http = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4.5 11h-2V9H1v6h1.5v-2.5h2V15H6V9H4.5v2zm2.5-.5h1.5V15H10v-4.5h1.5V9H7v1.5zm5.5 0H14V15h1.5v-4.5H17V9h-4.5v1.5zm9-1.5H18v6h1.5v-2h2c.8 0 1.5-.7 1.5-1.5v-1c0-.8-.7-1.5-1.5-1.5zm0 2.5h-2v-1h2v1z');
var _elm_community$elm_material_icons$Material_Icons_Action$hourglass_full = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z');
var _elm_community$elm_material_icons$Material_Icons_Action$hourglass_empty = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z');
var _elm_community$elm_material_icons$Material_Icons_Action$home = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z');
var _elm_community$elm_material_icons$Material_Icons_Action$history = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$opacity('.9'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Action$highlight_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z');
var _elm_community$elm_material_icons$Material_Icons_Action$help_outline = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z');
var _elm_community$elm_material_icons$Material_Icons_Action$help = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z');
var _elm_community$elm_material_icons$Material_Icons_Action$group_work = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8zm6.5 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z');
var _elm_community$elm_material_icons$Material_Icons_Action$grade = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z');
var _elm_community$elm_material_icons$Material_Icons_Action$gif = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$defs,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$id('a'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M24 24H0V0h24v24z'),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom$node,
						'clipPath',
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$id('b'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$use,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$xlinkHref('#a'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$overflow('visible'),
										_1: {ctor: '[]'}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d('M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$clipPath('url(#b)'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Action$get_app = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z');
var _elm_community$elm_material_icons$Material_Icons_Action$flip_to_front = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 13h2v-2H3v2zm0 4h2v-2H3v2zm2 4v-2H3c0 1.1.89 2 2 2zM3 9h2V7H3v2zm12 12h2v-2h-2v2zm4-18H9c-1.11 0-2 .9-2 2v10c0 1.1.89 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H9V5h10v10zm-8 6h2v-2h-2v2zm-4 0h2v-2H7v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$flip_to_back = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9 7H7v2h2V7zm0 4H7v2h2v-2zm0-8c-1.11 0-2 .9-2 2h2V3zm4 12h-2v2h2v-2zm6-12v2h2c0-1.1-.9-2-2-2zm-6 0h-2v2h2V3zM9 17v-2H7c0 1.1.89 2 2 2zm10-4h2v-2h-2v2zm0-4h2V7h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zM5 7H3v12c0 1.1.89 2 2 2h12v-2H5V7zm10-2h2V3h-2v2zm0 12h2v-2h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$flight_takeoff = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$defs,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$id('a'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M0 0h24v24H0V0z'),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom$node,
						'clipPath',
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$id('b'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$use,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$xlinkHref('#a'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$overflow('visible'),
										_1: {ctor: '[]'}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d('M2.5 19h19v2h-19zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 1.82 3.16.77 1.33 1.6-.43 5.31-1.42 4.35-1.16L21 11.49c.81-.23 1.28-1.05 1.07-1.85z'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$clipPath('url(#b)'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Action$flight_land = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$defs,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$id('a'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M0 0h24v24H0V0z'),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$defs,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$id('c'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M0 0h24v24H0V0z'),
										_1: {ctor: '[]'}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A3(
							_elm_lang$virtual_dom$VirtualDom$node,
							'clipPath',
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$id('b'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$use,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$xlinkHref('#a'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$overflow('visible'),
											_1: {ctor: '[]'}
										}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A3(
								_elm_lang$virtual_dom$VirtualDom$node,
								'clipPath',
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$id('d'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$clipPath('url(#b)'),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$use,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$xlinkHref('#c'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$overflow('visible'),
												_1: {ctor: '[]'}
											}
										},
										{ctor: '[]'}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d('M2.5 19h19v2h-19zm7.18-5.73l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-5.31-1.42-2.76-9.02L10.12 2v8.28L5.15 8.95l-.93-2.32-1.45-.39v5.17l1.6.43 5.31 1.43z'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$clipPath('url(#d)'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
												_1: {ctor: '[]'}
											}
										}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Action$find_replace = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11 6c1.38 0 2.63.56 3.54 1.46L12 10h6V4l-2.05 2.05C14.68 4.78 12.93 4 11 4c-3.53 0-6.43 2.61-6.92 6H6.1c.46-2.28 2.48-4 4.9-4zm5.64 9.14c.66-.9 1.12-1.97 1.28-3.14H15.9c-.46 2.28-2.48 4-4.9 4-1.38 0-2.63-.56-3.54-1.46L10 12H4v6l2.05-2.05C7.32 17.22 9.07 18 11 18c1.55 0 2.98-.51 4.14-1.36L20 21.49 21.49 20l-4.85-4.86z');
var _elm_community$elm_material_icons$Material_Icons_Action$find_in_page = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 19.59V8l-6-6H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c.45 0 .85-.15 1.19-.4l-4.43-4.43c-.8.52-1.74.83-2.76.83-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 1.02-.31 1.96-.83 2.75L20 19.59zM9 13c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z');
var _elm_community$elm_material_icons$Material_Icons_Action$feedback = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z');
var _elm_community$elm_material_icons$Material_Icons_Action$favorite_border = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z');
var _elm_community$elm_material_icons$Material_Icons_Action$favorite = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
var _elm_community$elm_material_icons$Material_Icons_Action$face = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z');
var _elm_community$elm_material_icons$Material_Icons_Action$extension = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z');
var _elm_community$elm_material_icons$Material_Icons_Action$explore = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z');
var _elm_community$elm_material_icons$Material_Icons_Action$exit_to_app = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z');
var _elm_community$elm_material_icons$Material_Icons_Action$event_seat = F2(
	function (color, size) {
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		var stringSize = _elm_lang$core$Basics$toString(size);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$defs,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$id('a'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d('M0 0h24v24H0V0z'),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom$node,
						'clipPath',
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$id('b'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$use,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$xlinkHref('#a'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$overflow('visible'),
										_1: {ctor: '[]'}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d('M4 18v3h3v-3h10v3h3v-6H4zm15-8h3v3h-3zM2 10h3v3H2zm15 3H7V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v8z'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$clipPath('url(#b)'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Action$event = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z');
var _elm_community$elm_material_icons$Material_Icons_Action$eject = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M5 17h14v2H5zm7-12L5.33 15h13.34z');
var _elm_community$elm_material_icons$Material_Icons_Action$done_all = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z');
var _elm_community$elm_material_icons$Material_Icons_Action$done = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z');
var _elm_community$elm_material_icons$Material_Icons_Action$dns = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z');
var _elm_community$elm_material_icons$Material_Icons_Action$description = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z');
var _elm_community$elm_material_icons$Material_Icons_Action$delete = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z');
var _elm_community$elm_material_icons$Material_Icons_Action$dashboard = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z');
var _elm_community$elm_material_icons$Material_Icons_Action$credit_card = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$code = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z');
var _elm_community$elm_material_icons$Material_Icons_Action$class = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z');
var _elm_community$elm_material_icons$Material_Icons_Action$chrome_reader_mode = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 12h7v1.5h-7zm0-2.5h7V11h-7zm0 5h7V16h-7zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15h-9V6h9v13z');
var _elm_community$elm_material_icons$Material_Icons_Action$check_circle = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z');
var _elm_community$elm_material_icons$Material_Icons_Action$change_history = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 7.77L18.39 18H5.61L12 7.77M12 4L2 20h20L12 4z');
var _elm_community$elm_material_icons$Material_Icons_Action$card_travel = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 6h-3V4c0-1.11-.89-2-2-2H9c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4h6v2H9V4zm11 15H4v-2h16v2zm0-5H4V8h3v2h2V8h6v2h2V8h3v6z');
var _elm_community$elm_material_icons$Material_Icons_Action$card_membership = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h4v5l4-2 4 2v-5h4c1.11 0 2-.89 2-2V4c0-1.11-.89-2-2-2zm0 13H4v-2h16v2zm0-5H4V4h16v6z');
var _elm_community$elm_material_icons$Material_Icons_Action$card_giftcard = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z');
var _elm_community$elm_material_icons$Material_Icons_Action$camera_enhance = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM12 17l1.25-2.75L16 13l-2.75-1.25L12 9l-1.25 2.75L8 13l2.75 1.25z');
var _elm_community$elm_material_icons$Material_Icons_Action$cached = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z');
var _elm_community$elm_material_icons$Material_Icons_Action$build = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z');
var _elm_community$elm_material_icons$Material_Icons_Action$bug_report = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$bookmark_border = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z');
var _elm_community$elm_material_icons$Material_Icons_Action$bookmark = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z');
var _elm_community$elm_material_icons$Material_Icons_Action$book = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z');
var _elm_community$elm_material_icons$Material_Icons_Action$backup = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z');
var _elm_community$elm_material_icons$Material_Icons_Action$autorenew = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z');
var _elm_community$elm_material_icons$Material_Icons_Action$assignment_turned_in = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z');
var _elm_community$elm_material_icons$Material_Icons_Action$assignment_returned = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 15l-5-5h3V9h4v4h3l-5 5z');
var _elm_community$elm_material_icons$Material_Icons_Action$assignment_return = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 12h-4v3l-5-5 5-5v3h4v4z');
var _elm_community$elm_material_icons$Material_Icons_Action$assignment_late = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 15h-2v-2h2v2zm0-4h-2V8h2v6zm-1-9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z');
var _elm_community$elm_material_icons$Material_Icons_Action$assignment_ind = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z');
var _elm_community$elm_material_icons$Material_Icons_Action$assignment = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$assessment = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z');
var _elm_community$elm_material_icons$Material_Icons_Action$aspect_ratio = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z');
var _elm_community$elm_material_icons$Material_Icons_Action$announcement = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$android = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z');
var _elm_community$elm_material_icons$Material_Icons_Action$alarm_on = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-1.46-5.47L8.41 12.4l-1.06 1.06 3.18 3.18 6-6-1.06-1.06-4.93 4.95z');
var _elm_community$elm_material_icons$Material_Icons_Action$alarm_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 6c3.87 0 7 3.13 7 7 0 .84-.16 1.65-.43 2.4l1.52 1.52c.58-1.19.91-2.51.91-3.92 0-4.97-4.03-9-9-9-1.41 0-2.73.33-3.92.91L9.6 6.43C10.35 6.16 11.16 6 12 6zm10-.28l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM2.92 2.29L1.65 3.57 2.98 4.9l-1.11.93 1.42 1.42 1.11-.94.8.8C3.83 8.69 3 10.75 3 13c0 4.97 4.02 9 9 9 2.25 0 4.31-.83 5.89-2.2l2.2 2.2 1.27-1.27L3.89 3.27l-.97-.98zm13.55 16.1C15.26 19.39 13.7 20 12 20c-3.87 0-7-3.13-7-7 0-1.7.61-3.26 1.61-4.47l9.86 9.86zM8.02 3.28L6.6 1.86l-.86.71 1.42 1.42.86-.71z');
var _elm_community$elm_material_icons$Material_Icons_Action$alarm_add = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V9z');
var _elm_community$elm_material_icons$Material_Icons_Action$alarm = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z');
var _elm_community$elm_material_icons$Material_Icons_Action$add_shopping_cart = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z');
var _elm_community$elm_material_icons$Material_Icons_Action$account_circle = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z');
var _elm_community$elm_material_icons$Material_Icons_Action$account_box = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z');
var _elm_community$elm_material_icons$Material_Icons_Action$account_balance_with_wallet = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z');
var _elm_community$elm_material_icons$Material_Icons_Action$account_balance = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z');
var _elm_community$elm_material_icons$Material_Icons_Action$accessibility = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z');
var _elm_community$elm_material_icons$Material_Icons_Action$three_d_rotation = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7.52 21.48C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32zm.89-6.52c-.19 0-.37-.03-.52-.08-.16-.06-.29-.13-.4-.24-.11-.1-.2-.22-.26-.37-.06-.14-.09-.3-.09-.47h-1.3c0 .36.07.68.21.95.14.27.33.5.56.69.24.18.51.32.82.41.3.1.62.15.96.15.37 0 .72-.05 1.03-.15.32-.1.6-.25.83-.44s.42-.43.55-.72c.13-.29.2-.61.2-.97 0-.19-.02-.38-.07-.56-.05-.18-.12-.35-.23-.51-.1-.16-.24-.3-.4-.43-.17-.13-.37-.23-.61-.31.2-.09.37-.2.52-.33.15-.13.27-.27.37-.42.1-.15.17-.3.22-.46.05-.16.07-.32.07-.48 0-.36-.06-.68-.18-.96-.12-.28-.29-.51-.51-.69-.2-.19-.47-.33-.77-.43C9.1 8.05 8.76 8 8.39 8c-.36 0-.69.05-1 .16-.3.11-.57.26-.79.45-.21.19-.38.41-.51.67-.12.26-.18.54-.18.85h1.3c0-.17.03-.32.09-.45s.14-.25.25-.34c.11-.09.23-.17.38-.22.15-.05.3-.08.48-.08.4 0 .7.1.89.31.19.2.29.49.29.86 0 .18-.03.34-.08.49-.05.15-.14.27-.25.37-.11.1-.25.18-.41.24-.16.06-.36.09-.58.09H7.5v1.03h.77c.22 0 .42.02.6.07s.33.13.45.23c.12.11.22.24.29.4.07.16.1.35.1.57 0 .41-.12.72-.35.93-.23.23-.55.33-.95.33zm8.55-5.92c-.32-.33-.7-.59-1.14-.77-.43-.18-.92-.27-1.46-.27H12v8h2.3c.55 0 1.06-.09 1.51-.27.45-.18.84-.43 1.16-.76.32-.33.57-.73.74-1.19.17-.47.26-.99.26-1.57v-.4c0-.58-.09-1.1-.26-1.57-.18-.47-.43-.87-.75-1.2zm-.39 3.16c0 .42-.05.79-.14 1.13-.1.33-.24.62-.43.85-.19.23-.43.41-.71.53-.29.12-.62.18-.99.18h-.91V9.12h.97c.72 0 1.27.23 1.64.69.38.46.57 1.12.57 1.99v.4zM12 0l-.66.03 3.81 3.81 1.33-1.33c3.27 1.55 5.61 4.72 5.96 8.48h1.5C23.44 4.84 18.29 0 12 0z');

var _elm_community$elm_material_icons$Material_Icons_Content$undo = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z');
var _elm_community$elm_material_icons$Material_Icons_Content$text_format = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M5 17v2h14v-2H5zm4.5-4.2h5l.9 2.2h2.1L12.75 4h-1.5L6.5 15h2.1l.9-2.2zM12 5.98L13.87 11h-3.74L12 5.98z');
var _elm_community$elm_material_icons$Material_Icons_Content$sort = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z');
var _elm_community$elm_material_icons$Material_Icons_Content$send = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M2.01 21L23 12 2.01 3 2 10l15 2-15 2z');
var _elm_community$elm_material_icons$Material_Icons_Content$select_all = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2zM7 17h10V7H7v10zm2-8h6v6H9V9z');
var _elm_community$elm_material_icons$Material_Icons_Content$save = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z');
var _elm_community$elm_material_icons$Material_Icons_Content$report = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z');
var _elm_community$elm_material_icons$Material_Icons_Content$reply_all = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 8V5l-7 7 7 7v-3l-4-4 4-4zm6 1V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z');
var _elm_community$elm_material_icons$Material_Icons_Content$reply = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z');
var _elm_community$elm_material_icons$Material_Icons_Content$remove_circle_outline = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z');
var _elm_community$elm_material_icons$Material_Icons_Content$remove_circle = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z');
var _elm_community$elm_material_icons$Material_Icons_Content$remove = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 13H5v-2h14v2z');
var _elm_community$elm_material_icons$Material_Icons_Content$redo = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z');
var _elm_community$elm_material_icons$Material_Icons_Content$markunread = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z');
var _elm_community$elm_material_icons$Material_Icons_Content$mail = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z');
var _elm_community$elm_material_icons$Material_Icons_Content$link = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z');
var _elm_community$elm_material_icons$Material_Icons_Content$inbox = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3H4.99c-1.1 0-1.98.9-1.98 2L3 19c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4c0 1.66-1.34 3-3 3s-3-1.34-3-3H4.99V5H19v10zm-3-5h-2V7h-4v3H8l4 4 4-4z');
var _elm_community$elm_material_icons$Material_Icons_Content$gesture = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4.59 6.89c.7-.71 1.4-1.35 1.71-1.22.5.2 0 1.03-.3 1.52-.25.42-2.86 3.89-2.86 6.31 0 1.28.48 2.34 1.34 2.98.75.56 1.74.73 2.64.46 1.07-.31 1.95-1.4 3.06-2.77 1.21-1.49 2.83-3.44 4.08-3.44 1.63 0 1.65 1.01 1.76 1.79-3.78.64-5.38 3.67-5.38 5.37 0 1.7 1.44 3.09 3.21 3.09 1.63 0 4.29-1.33 4.69-6.1H21v-2.5h-2.47c-.15-1.65-1.09-4.2-4.03-4.2-2.25 0-4.18 1.91-4.94 2.84-.58.73-2.06 2.48-2.29 2.72-.25.3-.68.84-1.11.84-.45 0-.72-.83-.36-1.92.35-1.09 1.4-2.86 1.85-3.52.78-1.14 1.3-1.92 1.3-3.28C8.95 3.69 7.31 3 6.44 3 5.12 3 3.97 4 3.72 4.25c-.36.36-.66.66-.88.93l1.75 1.71zm9.29 11.66c-.31 0-.74-.26-.74-.72 0-.6.73-2.2 2.87-2.76-.3 2.69-1.43 3.48-2.13 3.48z');
var _elm_community$elm_material_icons$Material_Icons_Content$forward = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 8V4l8 8-8 8v-4H4V8z');
var _elm_community$elm_material_icons$Material_Icons_Content$font_download = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z');
var _elm_community$elm_material_icons$Material_Icons_Content$flag = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z');
var _elm_community$elm_material_icons$Material_Icons_Content$filter_list = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z');
var _elm_community$elm_material_icons$Material_Icons_Content$drafts = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z');
var _elm_community$elm_material_icons$Material_Icons_Content$create = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z');
var _elm_community$elm_material_icons$Material_Icons_Content$content_paste = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z');
var _elm_community$elm_material_icons$Material_Icons_Content$content_cut = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3z');
var _elm_community$elm_material_icons$Material_Icons_Content$content_copy = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z');
var _elm_community$elm_material_icons$Material_Icons_Content$clear = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z');
var _elm_community$elm_material_icons$Material_Icons_Content$block = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z');
var _elm_community$elm_material_icons$Material_Icons_Content$backspace = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z');
var _elm_community$elm_material_icons$Material_Icons_Content$archive = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z');
var _elm_community$elm_material_icons$Material_Icons_Content$add_circle_outline = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z');
var _elm_community$elm_material_icons$Material_Icons_Content$add_circle = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z');
var _elm_community$elm_material_icons$Material_Icons_Content$add_box = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z');
var _elm_community$elm_material_icons$Material_Icons_Content$add = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z');

var _elm_community$elm_material_icons$Material_Icons_Device$wifi_tethering = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 2c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.48-.81 2.75-2 3.45l1 1.74c1.79-1.04 3-2.97 3-5.19zM12 3C6.48 3 2 7.48 2 13c0 3.7 2.01 6.92 4.99 8.65l1-1.73C5.61 18.53 4 15.96 4 13c0-4.42 3.58-8 8-8s8 3.58 8 8c0 2.96-1.61 5.53-4 6.92l1 1.73c2.99-1.73 5-4.95 5-8.65 0-5.52-4.48-10-10-10z');
var _elm_community$elm_material_icons$Material_Icons_Device$wifi_lock = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20.5 9.5c.28 0 .55.04.81.08L24 6c-3.34-2.51-7.5-4-12-4S3.34 3.49 0 6l12 16 3.5-4.67V14.5c0-2.76 2.24-5 5-5zM23 16v-1.5c0-1.38-1.12-2.5-2.5-2.5S18 13.12 18 14.5V16c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1zm-1 0h-3v-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V16z');
var _elm_community$elm_material_icons$Material_Icons_Device$widgets = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 13v8h8v-8h-8zM3 21h8v-8H3v8zM3 3v8h8V3H3zm13.66-1.31L11 7.34 16.66 13l5.66-5.66-5.66-5.65z');
var _elm_community$elm_material_icons$Material_Icons_Device$wallpaper = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z');
var _elm_community$elm_material_icons$Material_Icons_Device$usb = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95 0 1.22.99 2.2 2.2 2.2 1.21 0 2.2-.98 2.2-2.2 0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z');
var _elm_community$elm_material_icons$Material_Icons_Device$storage = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z');
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_statusbar_null = F2(
	function (color, size) {
		var width = size;
		var height = width - _elm_lang$core$Basics$round(
			(1 / 13) * _elm_lang$core$Basics$toFloat(width));
		var stringHeight = _elm_lang$core$Basics$toString(height);
		var stringWidth = _elm_lang$core$Basics$toString(width);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringWidth),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringHeight),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 26 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M13 4c4.25 0 7.62 1.51 9.68 2.75L13 18.8 3.33 6.75C5.38 5.51 8.75 4 13 4m0-2C5.74 2 .9 5.96.42 6.32l12.57 15.66.01.02.01-.01L25.58 6.32C25.1 5.96 20.26 2 13 2z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_statusbar_not_connected = F2(
	function (color, size) {
		var width = size;
		var height = width - _elm_lang$core$Basics$round(
			(1 / 13) * _elm_lang$core$Basics$toFloat(width));
		var stringHeight = _elm_lang$core$Basics$toString(height);
		var stringWidth = _elm_lang$core$Basics$toString(width);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringWidth),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringHeight),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 26 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M21 8.5c.85 0 1.64.23 2.34.62l2.24-2.79C25.1 5.96 20.26 2 13 2S.9 5.96.42 6.32l12.57 15.66.01.02.01-.01 4.21-5.24c-.76-.87-1.22-2-1.22-3.25 0-2.76 2.24-5 5-5z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M21 10c-1.93 0-3.5 1.57-3.5 3.5h1.75c0-.97.78-1.75 1.75-1.75s1.75.78 1.75 1.75c0 .48-.2.92-.51 1.24l-1.09 1.1c-.63.63-1.02 1.51-1.02 2.47v.44h1.75c0-1.31.39-1.84 1.03-2.47l.78-.8c.5-.5.82-1.2.82-1.97C24.5 11.57 22.93 10 21 10zm-.95 11.95h1.9v-1.9h-1.9v1.9z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_statusbar_connected_no_internet_4 = F2(
	function (color, size) {
		var width = size;
		var height = width - _elm_lang$core$Basics$round(
			(1 / 13) * _elm_lang$core$Basics$toFloat(width));
		var stringHeight = _elm_lang$core$Basics$toString(height);
		var stringWidth = _elm_lang$core$Basics$toString(width);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringWidth),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringHeight),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 26 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M22 22h2v-2h-2v2zM13 2C5.74 2 .9 5.96.42 6.32l12.57 15.66.01.02.01-.01L20 13.28V8h4.24l1.35-1.68C25.1 5.96 20.26 2 13 2zm9 16h2v-8h-2v8z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_statusbar_connected_no_internet_3 = F2(
	function (color, size) {
		var width = size;
		var height = width - _elm_lang$core$Basics$round(
			(1 / 13) * _elm_lang$core$Basics$toFloat(width));
		var stringHeight = _elm_lang$core$Basics$toString(height);
		var stringWidth = _elm_lang$core$Basics$toString(width);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringWidth),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringHeight),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 26 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M24.24 8l1.35-1.68C25.1 5.96 20.26 2 13 2S.9 5.96.42 6.32l12.57 15.66.01.02.01-.01L20 13.28V8h4.24z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M20 13.28V8.71C18.35 7.87 15.94 7 13 7c-5.44 0-9.07 2.97-9.44 3.24l9.43 11.75.01.01.01-.01L20 13.28zM22 20h2v2h-2zm0-10h2v8h-2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_statusbar_connected_no_internet_2 = F2(
	function (color, size) {
		var width = size;
		var height = width - _elm_lang$core$Basics$round(
			(1 / 13) * _elm_lang$core$Basics$toFloat(width));
		var stringHeight = _elm_lang$core$Basics$toString(height);
		var stringWidth = _elm_lang$core$Basics$toString(width);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringWidth),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringHeight),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 26 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M24.24 8l1.35-1.68C25.1 5.96 20.26 2 13 2S.9 5.96.42 6.32l12.57 15.66.01.02.01-.01L20 13.28V8h4.24z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M5.45 12.59l7.54 9.4.01.01.01-.01L20 13.28v-1.09c-1.07-.73-3.59-2.19-7-2.19-4.36 0-7.26 2.38-7.55 2.59zM22 10v8h2v-8h-2zm0 12h2v-2h-2v2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_statusbar_connected_no_internet_1 = F2(
	function (color, size) {
		var width = size;
		var height = width - _elm_lang$core$Basics$round(
			(1 / 13) * _elm_lang$core$Basics$toFloat(width));
		var stringHeight = _elm_lang$core$Basics$toString(height);
		var stringWidth = _elm_lang$core$Basics$toString(width);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringWidth),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringHeight),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 26 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M24.24 8l1.35-1.68C25.1 5.96 20.26 2 13 2S.9 5.96.42 6.32l12.57 15.66.01.02.01-.01L20 13.28V8h4.24z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M7.34 14.95L13 21.99V22v-.01l5.66-7.05C18.44 14.78 16.27 13 13 13s-5.44 1.78-5.66 1.95zM22 22h2v-2h-2v2zm0-12v8h2v-8h-2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_statusbar_connected_no_internet = F2(
	function (color, size) {
		var width = size;
		var height = width - _elm_lang$core$Basics$round(
			(1 / 13) * _elm_lang$core$Basics$toFloat(width));
		var stringHeight = _elm_lang$core$Basics$toString(height);
		var stringWidth = _elm_lang$core$Basics$toString(width);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringWidth),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringHeight),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 26 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M24.24 8l1.35-1.68C25.1 5.96 20.26 2 13 2S.9 5.96.42 6.32l12.57 15.66.01.02.01-.01L20 13.28V8h4.24z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M22 22h2v-2h-2v2zm0-12v8h2v-8h-2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_statusbar_4_bar = F2(
	function (color, size) {
		var width = size;
		var height = width - _elm_lang$core$Basics$round(
			(1 / 13) * _elm_lang$core$Basics$toFloat(width));
		var stringHeight = _elm_lang$core$Basics$toString(height);
		var stringWidth = _elm_lang$core$Basics$toString(width);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringWidth),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringHeight),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 26 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M13.01 21.99L25.58 6.32C25.1 5.96 20.26 2 13 2S.9 5.96.42 6.32l12.57 15.66.01.02.01-.01z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_statusbar_3_bar = F2(
	function (color, size) {
		var width = size;
		var height = width - _elm_lang$core$Basics$round(
			(1 / 13) * _elm_lang$core$Basics$toFloat(width));
		var stringHeight = _elm_lang$core$Basics$toString(height);
		var stringWidth = _elm_lang$core$Basics$toString(width);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringWidth),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringHeight),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 26 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M13.01 21.99l9.43-11.75C22.07 9.97 18.44 7 13 7c-5.44 0-9.07 2.97-9.44 3.24l9.43 11.75h.02z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M13.01 21.99L25.58 6.32C25.1 5.96 20.26 2 13 2S.9 5.96.42 6.32l12.57 15.66.01.02.01-.01z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_statusbar_2_bar = F2(
	function (color, size) {
		var width = size;
		var height = width - _elm_lang$core$Basics$round(
			(1 / 13) * _elm_lang$core$Basics$toFloat(width));
		var stringHeight = _elm_lang$core$Basics$toString(height);
		var stringWidth = _elm_lang$core$Basics$toString(width);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringWidth),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringHeight),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 26 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M13.01 21.99L25.58 6.32C25.1 5.96 20.26 2 13 2S.9 5.96.42 6.32l12.57 15.66.01.02.01-.01z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M13.01 21.99l7.54-9.4C20.26 12.38 17.36 10 13 10c-4.36 0-7.26 2.38-7.55 2.59l7.54 9.4h.02z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_statusbar_1_bar = F2(
	function (color, size) {
		var width = size;
		var height = width - _elm_lang$core$Basics$round(
			(1 / 13) * _elm_lang$core$Basics$toFloat(width));
		var stringHeight = _elm_lang$core$Basics$toString(height);
		var stringWidth = _elm_lang$core$Basics$toString(width);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringWidth),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringHeight),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 26 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M13 21.99l5.66-7.05C18.44 14.78 16.27 13 13 13s-5.44 1.78-5.66 1.95L13 21.99z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M13.01 21.99L25.58 6.32C25.1 5.96 20.26 2 13 2S.9 5.96.42 6.32l12.57 15.66.01.02.01-.01z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z');
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_4_bar_lock = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M23 16v-1.5c0-1.4-1.1-2.5-2.5-2.5S18 13.1 18 14.5V16c-.5 0-1 .5-1 1v4c0 .5.5 1 1 1h5c.5 0 1-.5 1-1v-4c0-.5-.5-1-1-1zm-1 0h-3v-1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V16zm-6.5-1.5c0-2.8 2.2-5 5-5 .4 0 .7 0 1 .1L23.6 7c-.4-.3-4.9-4-11.6-4C5.3 3 .8 6.7.4 7L12 21.5l3.5-4.4v-2.6z');
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_4_bar = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z');
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_3_bar_lock = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$opacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M12 3C5.3 3 .8 6.7.4 7l3.2 3.9L12 21.5l3.5-4.3v-2.6c0-2.2 1.4-4 3.3-4.7.3-.1.5-.2.8-.2.3-.1.6-.1.9-.1.4 0 .7 0 1 .1L23.6 7c-.4-.3-4.9-4-11.6-4z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M23 16v-1.5c0-1.4-1.1-2.5-2.5-2.5S18 13.1 18 14.5V16c-.5 0-1 .5-1 1v4c0 .5.5 1 1 1h5c.5 0 1-.5 1-1v-4c0-.5-.5-1-1-1zm-1 0h-3v-1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V16zm-10 5.5l3.5-4.3v-2.6c0-2.2 1.4-4 3.3-4.7C17.3 9 14.9 8 12 8c-4.8 0-8 2.6-8.5 2.9'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_3_bar = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M3.53 10.95l8.46 10.54.01.01.01-.01 8.46-10.54C20.04 10.62 16.81 8 12 8c-4.81 0-8.04 2.62-8.47 2.95z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_2_bar_lock = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M23 16v-1.5c0-1.4-1.1-2.5-2.5-2.5S18 13.1 18 14.5V16c-.5 0-1 .5-1 1v4c0 .5.5 1 1 1h5c.5 0 1-.5 1-1v-4c0-.5-.5-1-1-1zm-1 0h-3v-1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V16z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M15.5 14.5c0-2.8 2.2-5 5-5 .4 0 .7 0 1 .1L23.6 7c-.4-.3-4.9-4-11.6-4C5.3 3 .8 6.7.4 7L12 21.5l3.5-4.3v-2.7z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$opacity('.3'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d('M4.8 12.5l7.2 9 3.5-4.4v-2.6c0-1.3.5-2.5 1.4-3.4C15.6 10.5 14 10 12 10c-4.1 0-6.8 2.2-7.2 2.5z'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_2_bar = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M4.79 12.52l7.2 8.98H12l.01-.01 7.2-8.98C18.85 12.24 16.1 10 12 10s-6.85 2.24-7.21 2.52z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_1_bar_lock = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M23 16v-1.5c0-1.4-1.1-2.5-2.5-2.5S18 13.1 18 14.5V16c-.5 0-1 .5-1 1v4c0 .5.5 1 1 1h5c.5 0 1-.5 1-1v-4c0-.5-.5-1-1-1zm-1 0h-3v-1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V16z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M15.5 14.5c0-2.8 2.2-5 5-5 .4 0 .7 0 1 .1L23.6 7c-.4-.3-4.9-4-11.6-4C5.3 3 .8 6.7.4 7L12 21.5l3.5-4.3v-2.7z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$opacity('.3'),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$path,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d('M6.7 14.9l5.3 6.6 3.5-4.3v-2.6c0-.2 0-.5.1-.7-.9-.5-2.2-.9-3.6-.9-3 0-5.1 1.7-5.3 1.9z'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_1_bar = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M6.67 14.86L12 21.49v.01l.01-.01 5.33-6.63C17.06 14.65 15.03 13 12 13s-5.06 1.65-5.33 1.86z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_wifi_0_bar = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 1l-8.59 8.59L21 18.18V1zM4.77 4.5L3.5 5.77l6.36 6.36L1 21h17.73l2 2L22 21.73 4.77 4.5z');
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_null = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 6.83V20H6.83L20 6.83M22 2L2 22h20V2z');
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_no_sim = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18.99 5c0-1.1-.89-2-1.99-2h-7L7.66 5.34 19 16.68 18.99 5zM3.65 3.88L2.38 5.15 5 7.77V19c0 1.1.9 2 2 2h10.01c.35 0 .67-.1.96-.26l1.88 1.88 1.27-1.27L3.65 3.88z');
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_connected_no_internet_4_bar = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 18h2v-8h-2v8zm0 4h2v-2h-2v2zM2 22h16V8h4V2L2 22z');
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_connected_no_internet_3_bar = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M22 8V2L2 22h16V8z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M17 22V7L2 22h15zm3-12v8h2v-8h-2zm0 12h2v-2h-2v2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_connected_no_internet_2_bar = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M22 8V2L2 22h16V8z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M14 22V10L2 22h12zm6-12v8h2v-8h-2zm0 12h2v-2h-2v2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_connected_no_internet_1_bar = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M22 8V2L2 22h16V8z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M20 10v8h2v-8h-2zm-8 12V12L2 22h10zm8 0h2v-2h-2v2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_connected_no_internet_0_bar = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M22 8V2L2 22h16V8z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M20 22h2v-2h-2v2zm0-12v8h2v-8h-2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_4_bar = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M2 22h20V2z');
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_3_bar = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M2 22h20V2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M17 7L2 22h15z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_2_bar = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M2 22h20V2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M14 10L2 22h12z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_1_bar = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M2 22h20V2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M12 12L2 22h10z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$signal_cellular_0_bar = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M2 22h20V2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$settings_system_daydream = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9 16h6.5c1.38 0 2.5-1.12 2.5-2.5S16.88 11 15.5 11h-.05c-.24-1.69-1.69-3-3.45-3-1.4 0-2.6.83-3.16 2.02h-.16C7.17 10.18 6 11.45 6 13c0 1.66 1.34 3 3 3zM21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z');
var _elm_community$elm_material_icons$Material_Icons_Device$sd_storage = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 2h-8L4.02 8 4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 6h-2V4h2v4zm3 0h-2V4h2v4zm3 0h-2V4h2v4z');
var _elm_community$elm_material_icons$Material_Icons_Device$screen_rotation = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zm-6.25-.77c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75zm4.6 19.44L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.36zm-7.31.29C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z');
var _elm_community$elm_material_icons$Material_Icons_Device$screen_lock_rotation = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M23.25 12.77l-2.57-2.57-1.41 1.41 2.22 2.22-5.66 5.66L4.51 8.17l5.66-5.66 2.1 2.1 1.41-1.41L11.23.75c-.59-.59-1.54-.59-2.12 0L2.75 7.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12zM8.47 20.48C5.2 18.94 2.86 15.76 2.5 12H1c.51 6.16 5.66 11 11.95 11l.66-.03-3.81-3.82-1.33 1.33zM16 9h5c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1v-.5C21 1.12 19.88 0 18.5 0S16 1.12 16 2.5V3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm.8-6.5c0-.94.76-1.7 1.7-1.7s1.7.76 1.7 1.7V3h-3.4v-.5z');
var _elm_community$elm_material_icons$Material_Icons_Device$screen_lock_portrait = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 16h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1v-1c0-1.11-.9-2-2-2-1.11 0-2 .9-2 2v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm.8-6c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2v1h-2.4v-1zM17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z');
var _elm_community$elm_material_icons$Material_Icons_Device$screen_lock_landscape = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 5H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-2 12H5V7h14v10zm-9-1h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1v-1c0-1.11-.9-2-2-2-1.11 0-2 .9-2 2v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm.8-6c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2v1h-2.4v-1z');
var _elm_community$elm_material_icons$Material_Icons_Device$nfc = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM18 6h-5c-1.1 0-2 .9-2 2v2.28c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V8h3v8H8V8h2V6H6v12h12V6z');
var _elm_community$elm_material_icons$Material_Icons_Device$network_wifi = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M3.53 10.95l8.46 10.54.01.01.01-.01 8.46-10.54C20.04 10.62 16.81 8 12 8c-4.81 0-8.04 2.62-8.47 2.95z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$network_cell = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M2 22h20V2z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M17 7L2 22h15z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$location_searching = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z');
var _elm_community$elm_material_icons$Material_Icons_Device$location_disabled = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06c-1.13.12-2.19.46-3.16.97l1.5 1.5C10.16 5.19 11.06 5 12 5c3.87 0 7 3.13 7 7 0 .94-.19 1.84-.52 2.65l1.5 1.5c.5-.96.84-2.02.97-3.15H23v-2h-2.06zM3 4.27l2.04 2.04C3.97 7.62 3.25 9.23 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c1.77-.2 3.38-.91 4.69-1.98L19.73 21 21 19.73 4.27 3 3 4.27zm13.27 13.27C15.09 18.45 13.61 19 12 19c-3.87 0-7-3.13-7-7 0-1.61.55-3.09 1.46-4.27l9.81 9.81z');
var _elm_community$elm_material_icons$Material_Icons_Device$graphic_eq = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 18h2V6H7v12zm4 4h2V2h-2v20zm-8-8h2v-4H3v4zm12 4h2V6h-2v12zm4-8v4h2v-4h-2z');
var _elm_community$elm_material_icons$Material_Icons_Device$gps_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06c-1.13.12-2.19.46-3.16.97l1.5 1.5C10.16 5.19 11.06 5 12 5c3.87 0 7 3.13 7 7 0 .94-.19 1.84-.52 2.65l1.5 1.5c.5-.96.84-2.02.97-3.15H23v-2h-2.06zM3 4.27l2.04 2.04C3.97 7.62 3.25 9.23 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c1.77-.2 3.38-.91 4.69-1.98L19.73 21 21 19.73 4.27 3 3 4.27zm13.27 13.27C15.09 18.45 13.61 19 12 19c-3.87 0-7-3.13-7-7 0-1.61.55-3.09 1.46-4.27l9.81 9.81z');
var _elm_community$elm_material_icons$Material_Icons_Device$gps_not_fixed = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z');
var _elm_community$elm_material_icons$Material_Icons_Device$gps_fixed = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z');
var _elm_community$elm_material_icons$Material_Icons_Device$dvr = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12zm-2-9H8v2h11V8zm0 4H8v2h11v-2zM7 8H5v2h2V8zm0 4H5v2h2v-2z');
var _elm_community$elm_material_icons$Material_Icons_Device$devices = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z');
var _elm_community$elm_material_icons$Material_Icons_Device$developer_mode = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 5h10v2h2V3c0-1.1-.9-1.99-2-1.99L7 1c-1.1 0-2 .9-2 2v4h2V5zm8.41 11.59L20 12l-4.59-4.59L14 8.83 17.17 12 14 15.17l1.41 1.42zM10 15.17L6.83 12 10 8.83 8.59 7.41 4 12l4.59 4.59L10 15.17zM17 19H7v-2H5v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Device$data_usage = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z');
var _elm_community$elm_material_icons$Material_Icons_Device$brightness_medium = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z');
var _elm_community$elm_material_icons$Material_Icons_Device$brightness_low = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z');
var _elm_community$elm_material_icons$Material_Icons_Device$brightness_high = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z');
var _elm_community$elm_material_icons$Material_Icons_Device$brightness_auto = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10.85 12.65h2.3L12 9l-1.15 3.65zM20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM14.3 16l-.7-2h-3.2l-.7 2H7.8L11 7h2l3.2 9h-1.9z');
var _elm_community$elm_material_icons$Material_Icons_Device$bluetooth_searching = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M14.24 12.01l2.32 2.32c.28-.72.44-1.51.44-2.33 0-.82-.16-1.59-.43-2.31l-2.33 2.32zm5.29-5.3l-1.26 1.26c.63 1.21.98 2.57.98 4.02s-.36 2.82-.98 4.02l1.2 1.2c.97-1.54 1.54-3.36 1.54-5.31-.01-1.89-.55-3.67-1.48-5.19zm-3.82 1L10 2H9v7.59L4.41 5 3 6.41 8.59 12 3 17.59 4.41 19 9 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM11 5.83l1.88 1.88L11 9.59V5.83zm1.88 10.46L11 18.17v-3.76l1.88 1.88z');
var _elm_community$elm_material_icons$Material_Icons_Device$bluetooth_disabled = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 5.83l1.88 1.88-1.6 1.6 1.41 1.41 3.02-3.02L12 2h-1v5.03l2 2v-3.2zM5.41 4L4 5.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l4.29-4.29 2.3 2.29L20 18.59 5.41 4zM13 18.17v-3.76l1.88 1.88L13 18.17z');
var _elm_community$elm_material_icons$Material_Icons_Device$bluetooth_connected = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 12l-2-2-2 2 2 2 2-2zm10.71-4.29L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88zM19 10l-2 2 2 2 2-2-2-2z');
var _elm_community$elm_material_icons$Material_Icons_Device$bluetooth = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z');
var _elm_community$elm_material_icons$Material_Icons_Device$battery_unknown = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zm-2.72 13.95h-1.9v-1.9h1.9v1.9zm1.35-5.26s-.38.42-.67.71c-.48.48-.83 1.15-.83 1.6h-1.6c0-.83.46-1.52.93-2l.93-.94c.27-.27.44-.65.44-1.06 0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5H9c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .66-.27 1.26-.7 1.69z');
var _elm_community$elm_material_icons$Material_Icons_Device$battery_std = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z');
var _elm_community$elm_material_icons$Material_Icons_Device$battery_full = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z');
var _elm_community$elm_material_icons$Material_Icons_Device$battery_charging_full = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z');
var _elm_community$elm_material_icons$Material_Icons_Device$battery_charging_90 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V8h5.47L13 7v1h4V5.33C17 4.6 16.4 4 15.67 4z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M13 12.5h2L11 20v-5.5H9L12.47 8H7v12.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V8h-4v4.5z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$battery_charging_80 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V9h4.93L13 7v2h4V5.33C17 4.6 16.4 4 15.67 4z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M13 12.5h2L11 20v-5.5H9L11.93 9H7v11.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V9h-4v3.5z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$battery_charging_60 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V11h3.87L13 7v4h4V5.33C17 4.6 16.4 4 15.67 4z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M13 12.5h2L11 20v-5.5H9l1.87-3.5H7v9.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V11h-4v1.5z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$battery_charging_50 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M14.47 13.5L11 20v-5.5H9l.53-1H7v7.17C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V13.5h-2.53z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d('M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v8.17h2.53L13 7v5.5h2l-.53 1H17V5.33C17 4.6 16.4 4 15.67 4z'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$battery_charging_30 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v9.17h2L13 7v5.5h2l-1.07 2H17V5.33C17 4.6 16.4 4 15.67 4z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M11 20v-5.5H7v6.17C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V14.5h-3.07L11 20z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$battery_charging_20 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M11 20v-3H7v3.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V17h-4.4L11 20z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d('M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V17h4v-2.5H9L13 7v5.5h2L12.6 17H17V5.33C17 4.6 16.4 4 15.67 4z'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$battery_alert = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2V9h2v5z');
var _elm_community$elm_material_icons$Material_Icons_Device$battery_90 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V8h10V5.33z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M7 8v12.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V8H7z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$battery_80 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V9h10V5.33z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M7 9v11.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V9H7z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$battery_60 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V11h10V5.33z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M7 11v9.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V11H7z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$battery_50 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V13h10V5.33z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M7 13v7.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V13H7z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$battery_30 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V15h10V5.33z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M7 15v5.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V15H7z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$battery_20 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M7 17v3.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V17H7z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.3'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d('M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V17h10V5.33z'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$airplanemode_inactive = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 9V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v3.68l7.83 7.83L21 16v-2l-8-5zM3 5.27l4.99 4.99L2 14v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-3.73L18.73 21 20 19.73 4.27 4 3 5.27z');
var _elm_community$elm_material_icons$Material_Icons_Device$airplanemode_active = F2(
	function (color, size) {
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		var stringSize = _elm_lang$core$Basics$toString(size);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M10.18 9'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$add_alarm = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V9z');
var _elm_community$elm_material_icons$Material_Icons_Device$access_time = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.9'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zM12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Device$access_alarms = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M22 5.7l-4.6-3.9-1.3 1.5 4.6 3.9L22 5.7zM7.9 3.4L6.6 1.9 2 5.7l1.3 1.5 4.6-3.8zM12.5 8H11v6l4.7 2.9.8-1.2-4-2.4V8zM12 4c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z');
var _elm_community$elm_material_icons$Material_Icons_Device$access_alarm = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z');

var _elm_community$elm_material_icons$Material_Icons_Editor$wrap_text = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 19h6v-2H4v2zM20 5H4v2h16V5zm-3 6H4v2h13.25c1.1 0 2 .9 2 2s-.9 2-2 2H15v-2l-3 3 3 3v-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4z');
var _elm_community$elm_material_icons$Material_Icons_Editor$vertical_align_top = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M8 11h3v10h2V11h3l-4-4-4 4zM4 3v2h16V3H4z');
var _elm_community$elm_material_icons$Material_Icons_Editor$vertical_align_center = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M8 19h3v4h2v-4h3l-4-4-4 4zm8-14h-3V1h-2v4H8l4 4 4-4zM4 11v2h16v-2H4z');
var _elm_community$elm_material_icons$Material_Icons_Editor$vertical_align_bottom = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z');
var _elm_community$elm_material_icons$Material_Icons_Editor$strikethrough_s = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M5.9 10h6.3c-.8-.3-1.5-.6-2-.9-.7-.4-1-1-1-1.6 0-.3.1-.6.2-.9.1-.3.3-.5.6-.7.3-.2.6-.4 1-.5.4-.1.8-.2 1.4-.2.5 0 1 .1 1.4.2.4.1.7.3 1 .6.3.2.5.5.6.9.1.3.2.7.2 1.1h4c0-.9-.2-1.7-.5-2.4s-.8-1.4-1.4-1.9c-.6-.5-1.4-1-2.3-1.2-1-.4-2-.5-3.1-.5s-2 .1-2.9.4c-.9.3-1.6.6-2.3 1.1-.6.5-1.1 1-1.4 1.7-.4.7-.6 1.4-.6 2.2 0 .8.2 1.6.5 2.2.1.2.2.3.3.4zM23 12H1v2h11.9c.2.1.5.2.7.3.5.2.9.5 1.2.7.3.2.5.5.6.8.1.3.1.6.1.9 0 .3-.1.6-.2.9-.1.3-.3.5-.6.7-.2.2-.6.3-.9.5-.4.1-.8.2-1.4.2-.6 0-1.1-.1-1.6-.2s-.9-.3-1.2-.6c-.3-.3-.6-.6-.8-1-.2-.4-.3-1-.3-1.6h-4c0 .7.1 1.5.3 2.1.2.6.5 1.1.9 1.6s.8.9 1.3 1.2c.5.3 1 .6 1.6.9.6.2 1.2.4 1.8.5.6.1 1.3.2 1.9.2 1.1 0 2-.1 2.9-.4.9-.2 1.6-.6 2.2-1.1.6-.5 1.1-1 1.4-1.7.3-.7.5-1.4.5-2.3 0-.8-.1-1.5-.4-2.2-.1-.2-.1-.3-.2-.4H23v-2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$space_bar = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 9v4H6V9H4v6h16V9z');
var _elm_community$elm_material_icons$Material_Icons_Editor$publish = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M5 4v2h14V4H5zm0 10h4v6h6v-6h4l-7-7-7 7z');
var _elm_community$elm_material_icons$Material_Icons_Editor$money_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12.5 6.9c1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-.53.12-1.03.3-1.48.54l1.47 1.47c.41-.17.91-.27 1.51-.27zM5.33 4.06L4.06 5.33 7.5 8.77c0 2.08 1.56 3.21 3.91 3.91l3.51 3.51c-.34.48-1.05.91-2.42.91-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c.96-.18 1.82-.55 2.45-1.12l2.22 2.22 1.27-1.27L5.33 4.06z');
var _elm_community$elm_material_icons$Material_Icons_Editor$mode_edit = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z');
var _elm_community$elm_material_icons$Material_Icons_Editor$mode_comment = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z');
var _elm_community$elm_material_icons$Material_Icons_Editor$merge_type = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z');
var _elm_community$elm_material_icons$Material_Icons_Editor$insert_photo = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');
var _elm_community$elm_material_icons$Material_Icons_Editor$insert_link = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z');
var _elm_community$elm_material_icons$Material_Icons_Editor$insert_invitation = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z');
var _elm_community$elm_material_icons$Material_Icons_Editor$insert_emoticon = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z');
var _elm_community$elm_material_icons$Material_Icons_Editor$insert_drive_file = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z');
var _elm_community$elm_material_icons$Material_Icons_Editor$insert_comment = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$insert_chart = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z');
var _elm_community$elm_material_icons$Material_Icons_Editor$functions = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_underlined = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_textdirection_r_to_l = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 10v5h2V4h2v11h2V4h2V2h-8C7.79 2 6 3.79 6 6s1.79 4 4 4zm-2 7v-3l-4 4 4 4v-3h12v-2H8z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_textdirection_l_to_r = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9 10v5h2V4h2v11h2V4h2V2H9C6.79 2 5 3.79 5 6s1.79 4 4 4zm12 8l-4-4v3H5v2h12v3l4-4z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_strikethrough = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_size = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_quote = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_paint = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 4V3c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6h1v4H9v11c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h8V4h-3z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_list_numbered = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_list_bulleted = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12.17c-.74 0-1.33.6-1.33 1.33s.6 1.33 1.33 1.33 1.33-.6 1.33-1.33-.59-1.33-1.33-1.33zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_line_spacing = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6 7h2.5L5 3.5 1.5 7H4v10H1.5L5 20.5 8.5 17H6V7zm4-2v2h12V5H10zm0 14h12v-2H10v2zm0-6h12v-2H10v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_italic = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_indent_increase = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_indent_decrease = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_color_text = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M0 20h24v4H0z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.36'),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Editor$format_color_reset = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 14c0-4-6-10.8-6-10.8s-1.33 1.51-2.73 3.52l8.59 8.59c.09-.42.14-.86.14-1.31zm-.88 3.12L12.5 12.5 5.27 5.27 4 6.55l3.32 3.32C6.55 11.32 6 12.79 6 14c0 3.31 2.69 6 6 6 1.52 0 2.9-.57 3.96-1.5l2.63 2.63 1.27-1.27-2.74-2.74z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_color_fill = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.36'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d('M0 20h24v4H0z'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Editor$format_clear = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_bold = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_align_right = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_align_left = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_align_justify = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z');
var _elm_community$elm_material_icons$Material_Icons_Editor$format_align_center = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z');
var _elm_community$elm_material_icons$Material_Icons_Editor$border_vertical = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 9h2V7H3v2zm0-4h2V3H3v2zm4 16h2v-2H7v2zm0-8h2v-2H7v2zm-4 0h2v-2H3v2zm0 8h2v-2H3v2zm0-4h2v-2H3v2zM7 5h2V3H7v2zm12 12h2v-2h-2v2zm-8 4h2V3h-2v18zm8 0h2v-2h-2v2zm0-8h2v-2h-2v2zm0-10v2h2V3h-2zm0 6h2V7h-2v2zm-4-4h2V3h-2v2zm0 16h2v-2h-2v2zm0-8h2v-2h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$border_top = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 21h2v-2H7v2zm0-8h2v-2H7v2zm4 0h2v-2h-2v2zm0 8h2v-2h-2v2zm-8-4h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2v-2H3v2zm0-4h2V7H3v2zm8 8h2v-2h-2v2zm8-8h2V7h-2v2zm0 4h2v-2h-2v2zM3 3v2h18V3H3zm16 14h2v-2h-2v2zm-4 4h2v-2h-2v2zM11 9h2V7h-2v2zm8 12h2v-2h-2v2zm-4-8h2v-2h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$border_style = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15 21h2v-2h-2v2zm4 0h2v-2h-2v2zM7 21h2v-2H7v2zm4 0h2v-2h-2v2zm8-4h2v-2h-2v2zm0-4h2v-2h-2v2zM3 3v18h2V5h16V3H3zm16 6h2V7h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$border_right = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 21h2v-2H7v2zM3 5h2V3H3v2zm4 0h2V3H7v2zm0 8h2v-2H7v2zm-4 8h2v-2H3v2zm8 0h2v-2h-2v2zm-8-8h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm8 8h2v-2h-2v2zm4-4h2v-2h-2v2zm4-10v18h2V3h-2zm-4 18h2v-2h-2v2zm0-16h2V3h-2v2zm-4 8h2v-2h-2v2zm0-8h2V3h-2v2zm0 4h2V7h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$border_outer = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 7h-2v2h2V7zm0 4h-2v2h2v-2zm4 0h-2v2h2v-2zM3 3v18h18V3H3zm16 16H5V5h14v14zm-6-4h-2v2h2v-2zm-4-4H7v2h2v-2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$border_left = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11 21h2v-2h-2v2zm0-4h2v-2h-2v2zm0-12h2V3h-2v2zm0 4h2V7h-2v2zm0 4h2v-2h-2v2zm-4 8h2v-2H7v2zM7 5h2V3H7v2zm0 8h2v-2H7v2zm-4 8h2V3H3v18zM19 9h2V7h-2v2zm-4 12h2v-2h-2v2zm4-4h2v-2h-2v2zm0-14v2h2V3h-2zm0 10h2v-2h-2v2zm0 8h2v-2h-2v2zm-4-8h2v-2h-2v2zm0-8h2V3h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$border_inner = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 21h2v-2H3v2zm4 0h2v-2H7v2zM5 7H3v2h2V7zM3 17h2v-2H3v2zM9 3H7v2h2V3zM5 3H3v2h2V3zm12 0h-2v2h2V3zm2 6h2V7h-2v2zm0-6v2h2V3h-2zm-4 18h2v-2h-2v2zM13 3h-2v8H3v2h8v8h2v-8h8v-2h-8V3zm6 18h2v-2h-2v2zm0-4h2v-2h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$border_horizontal = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 21h2v-2H3v2zM5 7H3v2h2V7zM3 17h2v-2H3v2zm4 4h2v-2H7v2zM5 3H3v2h2V3zm4 0H7v2h2V3zm8 0h-2v2h2V3zm-4 4h-2v2h2V7zm0-4h-2v2h2V3zm6 14h2v-2h-2v2zm-8 4h2v-2h-2v2zm-8-8h18v-2H3v2zM19 3v2h2V3h-2zm0 6h2V7h-2v2zm-8 8h2v-2h-2v2zm4 4h2v-2h-2v2zm4 0h2v-2h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$border_color = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$d('M17.75 7L14 3.25l-10 10V17h3.75l10-10zm2.96-2.96c.39-.39.39-1.02 0-1.41L18.37.29c-.39-.39-1.02-.39-1.41 0L15 2.25 18.75 6l1.96-1.96z'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fillOpacity('.36'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d('M0 20h24v4H0z'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
									_1: {ctor: '[]'}
								}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Editor$border_clear = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 5h2V3H7v2zm0 8h2v-2H7v2zm0 8h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm-8 0h2v-2H3v2zm0-4h2v-2H3v2zm0-4h2v-2H3v2zm0-4h2V7H3v2zm0-4h2V3H3v2zm8 8h2v-2h-2v2zm8 4h2v-2h-2v2zm0-4h2v-2h-2v2zm0 8h2v-2h-2v2zm0-12h2V7h-2v2zm-8 0h2V7h-2v2zm8-6v2h2V3h-2zm-8 2h2V3h-2v2zm4 16h2v-2h-2v2zm0-8h2v-2h-2v2zm0-8h2V3h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$border_bottom = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9 11H7v2h2v-2zm4 4h-2v2h2v-2zM9 3H7v2h2V3zm4 8h-2v2h2v-2zM5 3H3v2h2V3zm8 4h-2v2h2V7zm4 4h-2v2h2v-2zm-4-8h-2v2h2V3zm4 0h-2v2h2V3zm2 10h2v-2h-2v2zm0 4h2v-2h-2v2zM5 7H3v2h2V7zm14-4v2h2V3h-2zm0 6h2V7h-2v2zM5 11H3v2h2v-2zM3 21h18v-2H3v2zm2-6H3v2h2v-2z');
var _elm_community$elm_material_icons$Material_Icons_Editor$border_all = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z');
var _elm_community$elm_material_icons$Material_Icons_Editor$attach_money = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z');
var _elm_community$elm_material_icons$Material_Icons_Editor$attach_file = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z');

var _elm_community$elm_material_icons$Material_Icons_File$folder_shared = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8h-8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z');
var _elm_community$elm_material_icons$Material_Icons_File$folder_open = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z');
var _elm_community$elm_material_icons$Material_Icons_File$folder = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z');
var _elm_community$elm_material_icons$Material_Icons_File$file_upload = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z');
var _elm_community$elm_material_icons$Material_Icons_File$file_download = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z');
var _elm_community$elm_material_icons$Material_Icons_File$cloud_upload = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z');
var _elm_community$elm_material_icons$Material_Icons_File$cloud_queue = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.48 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z');
var _elm_community$elm_material_icons$Material_Icons_File$cloud_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z');
var _elm_community$elm_material_icons$Material_Icons_File$cloud_download = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z');
var _elm_community$elm_material_icons$Material_Icons_File$cloud_done = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17 15.18 9l1.41 1.41L10 17z');
var _elm_community$elm_material_icons$Material_Icons_File$cloud_circle = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14H8c-1.66 0-3-1.34-3-3s1.34-3 3-3l.14.01C8.58 8.28 10.13 7 12 7c2.21 0 4 1.79 4 4h.5c1.38 0 2.5 1.12 2.5 2.5S17.88 16 16.5 16z');
var _elm_community$elm_material_icons$Material_Icons_File$cloud = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z');
var _elm_community$elm_material_icons$Material_Icons_File$attachment = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7.5 18C4.46 18 2 15.54 2 12.5S4.46 7 7.5 7H18c2.21 0 4 1.79 4 4s-1.79 4-4 4H9.5C8.12 15 7 13.88 7 12.5S8.12 10 9.5 10H17v1.5H9.5c-.55 0-1 .45-1 1s.45 1 1 1H18c1.38 0 2.5-1.12 2.5-2.5S19.38 8.5 18 8.5H7.5c-2.21 0-4 1.79-4 4s1.79 4 4 4H17V18H7.5z');

var _elm_community$elm_material_icons$Material_Icons_Image$wb_sunny = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z');
var _elm_community$elm_material_icons$Material_Icons_Image$wb_iridescent = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M5 14.5h14v-6H5v6zM11 .55V3.5h2V.55h-2zm8.04 2.5l-1.79 1.79 1.41 1.41 1.8-1.79-1.42-1.41zM13 22.45V19.5h-2v2.95h2zm7.45-3.91l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM3.55 4.46l1.79 1.79 1.41-1.41-1.79-1.79-1.41 1.41zm1.41 15.49l1.79-1.8-1.41-1.41-1.79 1.79 1.41 1.42z');
var _elm_community$elm_material_icons$Material_Icons_Image$wb_incandescent = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3.55 18.54l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8zM11 22.45h2V19.5h-2v2.95zM4 10.5H1v2h3v-2zm11-4.19V1.5H9v4.81C7.21 7.35 6 9.28 6 11.5c0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.22-1.21-4.15-3-5.19zm5 4.19v2h3v-2h-3zm-2.76 7.66l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4z');
var _elm_community$elm_material_icons$Material_Icons_Image$wb_cloudy = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z');
var _elm_community$elm_material_icons$Material_Icons_Image$wb_auto = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6.85 12.65h2.3L8 9l-1.15 3.65zM22 7l-1.2 6.29L19.3 7h-1.6l-1.49 6.29L15 7h-.76C12.77 5.17 10.53 4 8 4c-4.42 0-8 3.58-8 8s3.58 8 8 8c3.13 0 5.84-1.81 7.15-4.43l.1.43H17l1.5-6.1L20 16h1.75l2.05-9H22zm-11.7 9l-.7-2H6.4l-.7 2H3.8L7 7h2l3.2 9h-1.9z');
var _elm_community$elm_material_icons$Material_Icons_Image$vignette = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 15c-4.42 0-8-2.69-8-6s3.58-6 8-6 8 2.69 8 6-3.58 6-8 6z');
var _elm_community$elm_material_icons$Material_Icons_Image$view_compact = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 19h6v-7H3v7zm7 0h12v-7H10v7zM3 5v6h19V5H3z');
var _elm_community$elm_material_icons$Material_Icons_Image$view_comfy = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 9h4V5H3v4zm0 5h4v-4H3v4zm5 0h4v-4H8v4zm5 0h4v-4h-4v4zM8 9h4V5H8v4zm5-4v4h4V5h-4zm5 9h4v-4h-4v4zM3 19h4v-4H3v4zm5 0h4v-4H8v4zm5 0h4v-4h-4v4zm5 0h4v-4h-4v4zm0-14v4h4V5h-4z');
var _elm_community$elm_material_icons$Material_Icons_Image$tune = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z');
var _elm_community$elm_material_icons$Material_Icons_Image$transform = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M22 18v-2H8V4h2L7 1 4 4h2v2H2v2h4v8c0 1.1.9 2 2 2h8v2h-2l3 3 3-3h-2v-2h4zM10 8h6v6h2V8c0-1.1-.9-2-2-2h-6v2z');
var _elm_community$elm_material_icons$Material_Icons_Image$tonality = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z');
var _elm_community$elm_material_icons$Material_Icons_Image$timer_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.04 4.55l-1.42 1.42C16.07 4.74 14.12 4 12 4c-1.83 0-3.53.55-4.95 1.48l1.46 1.46C9.53 6.35 10.73 6 12 6c3.87 0 7 3.13 7 7 0 1.27-.35 2.47-.94 3.49l1.45 1.45C20.45 16.53 21 14.83 21 13c0-2.12-.74-4.07-1.97-5.61l1.42-1.42-1.41-1.42zM15 1H9v2h6V1zm-4 8.44l2 2V8h-2v1.44zM3.02 4L1.75 5.27 4.5 8.03C3.55 9.45 3 11.16 3 13c0 4.97 4.02 9 9 9 1.84 0 3.55-.55 4.98-1.5l2.5 2.5 1.27-1.27-7.71-7.71L3.02 4zM12 20c-3.87 0-7-3.13-7-7 0-1.28.35-2.48.95-3.52l9.56 9.56c-1.03.61-2.23.96-3.51.96z');
var _elm_community$elm_material_icons$Material_Icons_Image$timer_3 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11.61 12.97c-.16-.24-.36-.46-.62-.65-.25-.19-.56-.35-.93-.48.3-.14.57-.3.8-.5.23-.2.42-.41.57-.64.15-.23.27-.46.34-.71.08-.24.11-.49.11-.73 0-.55-.09-1.04-.28-1.46-.18-.42-.44-.77-.78-1.06-.33-.28-.73-.5-1.2-.64-.45-.13-.97-.2-1.53-.2-.55 0-1.06.08-1.52.24-.47.17-.87.4-1.2.69-.33.29-.6.63-.78 1.03-.2.39-.29.83-.29 1.29h1.98c0-.26.05-.49.14-.69.09-.2.22-.38.38-.52.17-.14.36-.25.58-.33.22-.08.46-.12.73-.12.61 0 1.06.16 1.36.47.3.31.44.75.44 1.32 0 .27-.04.52-.12.74-.08.22-.21.41-.38.57-.17.16-.38.28-.63.37-.25.09-.55.13-.89.13H6.72v1.57H7.9c.34 0 .64.04.91.11.27.08.5.19.69.35.19.16.34.36.44.61.1.24.16.54.16.87 0 .62-.18 1.09-.53 1.42-.35.33-.84.49-1.45.49-.29 0-.56-.04-.8-.13-.24-.08-.44-.2-.61-.36-.17-.16-.3-.34-.39-.56-.09-.22-.14-.46-.14-.72H4.19c0 .55.11 1.03.32 1.45.21.42.5.77.86 1.05s.77.49 1.24.63.96.21 1.48.21c.57 0 1.09-.08 1.58-.23.49-.15.91-.38 1.26-.68.36-.3.64-.66.84-1.1.2-.43.3-.93.3-1.48 0-.29-.04-.58-.11-.86-.08-.25-.19-.51-.35-.76zm9.26 1.4c-.14-.28-.35-.53-.63-.74-.28-.21-.61-.39-1.01-.53s-.85-.27-1.35-.38c-.35-.07-.64-.15-.87-.23-.23-.08-.41-.16-.55-.25-.14-.09-.23-.19-.28-.3-.05-.11-.08-.24-.08-.39s.03-.28.09-.41c.06-.13.15-.25.27-.34.12-.1.27-.18.45-.24s.4-.09.64-.09c.25 0 .47.04.66.11.19.07.35.17.48.29.13.12.22.26.29.42.06.16.1.32.1.49h1.95c0-.39-.08-.75-.24-1.09-.16-.34-.39-.63-.69-.88-.3-.25-.66-.44-1.09-.59-.43-.15-.92-.22-1.46-.22-.51 0-.98.07-1.39.21-.41.14-.77.33-1.06.57-.29.24-.51.52-.67.84-.16.32-.23.65-.23 1.01s.08.68.23.96c.15.28.37.52.64.73.27.21.6.38.98.53.38.14.81.26 1.27.36.39.08.71.17.95.26s.43.19.57.29c.13.1.22.22.27.34.05.12.07.25.07.39 0 .32-.13.57-.4.77-.27.2-.66.29-1.17.29-.22 0-.43-.02-.64-.08-.21-.05-.4-.13-.56-.24-.17-.11-.3-.26-.41-.44-.11-.18-.17-.41-.18-.67h-1.89c0 .36.08.71.24 1.05.16.34.39.65.7.93.31.27.69.49 1.15.66.46.17.98.25 1.58.25.53 0 1.01-.06 1.44-.19.43-.13.8-.31 1.11-.54.31-.23.54-.51.71-.83.17-.32.25-.67.25-1.06-.02-.4-.09-.74-.24-1.02z');
var _elm_community$elm_material_icons$Material_Icons_Image$timer = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z');
var _elm_community$elm_material_icons$Material_Icons_Image$timer_10 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M0 7.72V9.4l3-1V18h2V6h-.25L0 7.72zm23.78 6.65c-.14-.28-.35-.53-.63-.74-.28-.21-.61-.39-1.01-.53s-.85-.27-1.35-.38c-.35-.07-.64-.15-.87-.23-.23-.08-.41-.16-.55-.25-.14-.09-.23-.19-.28-.3-.05-.11-.08-.24-.08-.39 0-.14.03-.28.09-.41.06-.13.15-.25.27-.34.12-.1.27-.18.45-.24s.4-.09.64-.09c.25 0 .47.04.66.11.19.07.35.17.48.29.13.12.22.26.29.42.06.16.1.32.1.49h1.95c0-.39-.08-.75-.24-1.09-.16-.34-.39-.63-.69-.88-.3-.25-.66-.44-1.09-.59C21.49 9.07 21 9 20.46 9c-.51 0-.98.07-1.39.21-.41.14-.77.33-1.06.57-.29.24-.51.52-.67.84-.16.32-.23.65-.23 1.01s.08.69.23.96c.15.28.36.52.64.73.27.21.6.38.98.53.38.14.81.26 1.27.36.39.08.71.17.95.26s.43.19.57.29c.13.1.22.22.27.34.05.12.07.25.07.39 0 .32-.13.57-.4.77-.27.2-.66.29-1.17.29-.22 0-.43-.02-.64-.08-.21-.05-.4-.13-.56-.24-.17-.11-.3-.26-.41-.44-.11-.18-.17-.41-.18-.67h-1.89c0 .36.08.71.24 1.05.16.34.39.65.7.93.31.27.69.49 1.15.66.46.17.98.25 1.58.25.53 0 1.01-.06 1.44-.19.43-.13.8-.31 1.11-.54.31-.23.54-.51.71-.83.17-.32.25-.67.25-1.06-.02-.4-.09-.74-.24-1.02zm-9.96-7.32c-.34-.4-.75-.7-1.23-.88-.47-.18-1.01-.27-1.59-.27-.58 0-1.11.09-1.59.27-.48.18-.89.47-1.23.88-.34.41-.6.93-.79 1.59-.18.65-.28 1.45-.28 2.39v1.92c0 .94.09 1.74.28 2.39.19.66.45 1.19.8 1.6.34.41.75.71 1.23.89.48.18 1.01.28 1.59.28.59 0 1.12-.09 1.59-.28.48-.18.88-.48 1.22-.89.34-.41.6-.94.78-1.6.18-.65.28-1.45.28-2.39v-1.92c0-.94-.09-1.74-.28-2.39-.18-.66-.44-1.19-.78-1.59zm-.92 6.17c0 .6-.04 1.11-.12 1.53-.08.42-.2.76-.36 1.02-.16.26-.36.45-.59.57-.23.12-.51.18-.82.18-.3 0-.58-.06-.82-.18s-.44-.31-.6-.57c-.16-.26-.29-.6-.38-1.02-.09-.42-.13-.93-.13-1.53v-2.5c0-.6.04-1.11.13-1.52.09-.41.21-.74.38-1 .16-.25.36-.43.6-.55.24-.11.51-.17.81-.17.31 0 .58.06.81.17.24.11.44.29.6.55.16.25.29.58.37.99.08.41.13.92.13 1.52v2.51z');
var _elm_community$elm_material_icons$Material_Icons_Image$timelapse = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16.24 7.76C15.07 6.59 13.54 6 12 6v6l-4.24 4.24c2.34 2.34 6.14 2.34 8.49 0 2.34-2.34 2.34-6.14-.01-8.48zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z');
var _elm_community$elm_material_icons$Material_Icons_Image$texture = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.51 3.08L3.08 19.51c.09.34.27.65.51.9.25.24.56.42.9.51L20.93 4.49c-.19-.69-.73-1.23-1.42-1.41zM11.88 3L3 11.88v2.83L14.71 3h-2.83zM5 3c-1.1 0-2 .9-2 2v2l4-4H5zm14 18c.55 0 1.05-.22 1.41-.59.37-.36.59-.86.59-1.41v-2l-4 4h2zm-9.71 0h2.83L21 12.12V9.29L9.29 21z');
var _elm_community$elm_material_icons$Material_Icons_Image$tag_faces = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z');
var _elm_community$elm_material_icons$Material_Icons_Image$switch_video = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 9.5V6c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-3.5l4 4v-13l-4 4zm-5 6V13H7v2.5L3.5 12 7 8.5V11h6V8.5l3.5 3.5-3.5 3.5z');
var _elm_community$elm_material_icons$Material_Icons_Image$switch_camera = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z');
var _elm_community$elm_material_icons$Material_Icons_Image$style = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61zm19.5-3.7L17.07 3.98c-.31-.75-1.04-1.21-1.81-1.23-.26 0-.53.04-.79.15L7.1 5.95c-.75.31-1.21 1.03-1.23 1.8-.01.27.04.54.15.8l4.96 11.97c.31.76 1.05 1.22 1.83 1.23.26 0 .52-.05.77-.15l7.36-3.05c1.02-.42 1.51-1.59 1.09-2.6zM7.88 8.75c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-2 11c0 1.1.9 2 2 2h1.45l-3.45-8.34v6.34z');
var _elm_community$elm_material_icons$Material_Icons_Image$straighten = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2v8z');
var _elm_community$elm_material_icons$Material_Icons_Image$slideshow = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 8v8l5-4-5-4zm9-5H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z');
var _elm_community$elm_material_icons$Material_Icons_Image$rotate_right = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z');
var _elm_community$elm_material_icons$Material_Icons_Image$rotate_left = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z');
var _elm_community$elm_material_icons$Material_Icons_Image$rotate_90_degrees_ccw = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7.34 6.41L.86 12.9l6.49 6.48 6.49-6.48-6.5-6.49zM3.69 12.9l3.66-3.66L11 12.9l-3.66 3.66-3.65-3.66zm15.67-6.26C17.61 4.88 15.3 4 13 4V.76L8.76 5 13 9.24V6c1.79 0 3.58.68 4.95 2.05 2.73 2.73 2.73 7.17 0 9.9C16.58 19.32 14.79 20 13 20c-.97 0-1.94-.21-2.84-.61l-1.49 1.49C10.02 21.62 11.51 22 13 22c2.3 0 4.61-.88 6.36-2.64 3.52-3.51 3.52-9.21 0-12.72z');
var _elm_community$elm_material_icons$Material_Icons_Image$remove_red_eye = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
var _elm_community$elm_material_icons$Material_Icons_Image$portrait = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 12.25c1.24 0 2.25-1.01 2.25-2.25S13.24 7.75 12 7.75 9.75 8.76 9.75 10s1.01 2.25 2.25 2.25zm4.5 4c0-1.5-3-2.25-4.5-2.25s-4.5.75-4.5 2.25V17h9v-.75zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z');
var _elm_community$elm_material_icons$Material_Icons_Image$picture_as_pdf = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z');
var _elm_community$elm_material_icons$Material_Icons_Image$photo_size_select_small = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M23 15h-2v2h2v-2zm0-4h-2v2h2v-2zm0 8h-2v2c1 0 2-1 2-2zM15 3h-2v2h2V3zm8 4h-2v2h2V7zm-2-4v2h2c0-1-1-2-2-2zM3 21h8v-6H1v4c0 1.1.9 2 2 2zM3 7H1v2h2V7zm12 12h-2v2h2v-2zm4-16h-2v2h2V3zm0 16h-2v2h2v-2zM3 3C2 3 1 4 1 5h2V3zm0 8H1v2h2v-2zm8-8H9v2h2V3zM7 3H5v2h2V3z');
var _elm_community$elm_material_icons$Material_Icons_Image$photo_size_select_large = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 15h2v2h-2v-2zm0-4h2v2h-2v-2zm2 8h-2v2c1 0 2-1 2-2zM13 3h2v2h-2V3zm8 4h2v2h-2V7zm0-4v2h2c0-1-1-2-2-2zM1 7h2v2H1V7zm16-4h2v2h-2V3zm0 16h2v2h-2v-2zM3 3C2 3 1 4 1 5h2V3zm6 0h2v2H9V3zM5 3h2v2H5V3zm-4 8v8c0 1.1.9 2 2 2h12V11H1zm2 8l2.5-3.21 1.79 2.15 2.5-3.22L13 19H3z');
var _elm_community$elm_material_icons$Material_Icons_Image$photo_size_select_actual = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3.01L14.5 11l4.5 6H5z');
var _elm_community$elm_material_icons$Material_Icons_Image$photo_library = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z');
var _elm_community$elm_material_icons$Material_Icons_Image$photo_camera = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$circle,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$cx('12'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$cy('12'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$r('3.2'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Image$photo_album = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm0 15l3-3.86 2.14 2.58 3-3.86L18 19H6z');
var _elm_community$elm_material_icons$Material_Icons_Image$photo = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');
var _elm_community$elm_material_icons$Material_Icons_Image$panorama_wide_angle = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 6c2.45 0 4.71.2 7.29.64.47 1.78.71 3.58.71 5.36 0 1.78-.24 3.58-.71 5.36-2.58.44-4.84.64-7.29.64s-4.71-.2-7.29-.64C4.24 15.58 4 13.78 4 12c0-1.78.24-3.58.71-5.36C7.29 6.2 9.55 6 12 6m0-2c-2.73 0-5.22.24-7.95.72l-.93.16-.25.9C2.29 7.85 2 9.93 2 12s.29 4.15.87 6.22l.25.89.93.16c2.73.49 5.22.73 7.95.73s5.22-.24 7.95-.72l.93-.16.25-.89c.58-2.08.87-4.16.87-6.23s-.29-4.15-.87-6.22l-.25-.89-.93-.16C17.22 4.24 14.73 4 12 4z');
var _elm_community$elm_material_icons$Material_Icons_Image$panorama_vertical = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.94 21.12c-1.1-2.94-1.64-6.03-1.64-9.12 0-3.09.55-6.18 1.64-9.12.04-.11.06-.22.06-.31 0-.34-.23-.57-.63-.57H4.63c-.4 0-.63.23-.63.57 0 .1.02.2.06.31C5.16 5.82 5.71 8.91 5.71 12c0 3.09-.55 6.18-1.64 9.12-.05.11-.07.22-.07.31 0 .33.23.57.63.57h14.75c.39 0 .63-.24.63-.57-.01-.1-.03-.2-.07-.31zM6.54 20c.77-2.6 1.16-5.28 1.16-8 0-2.72-.39-5.4-1.16-8h10.91c-.77 2.6-1.16 5.28-1.16 8 0 2.72.39 5.4 1.16 8H6.54z');
var _elm_community$elm_material_icons$Material_Icons_Image$panorama_horizontal = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 6.54v10.91c-2.6-.77-5.28-1.16-8-1.16-2.72 0-5.4.39-8 1.16V6.54c2.6.77 5.28 1.16 8 1.16 2.72.01 5.4-.38 8-1.16M21.43 4c-.1 0-.2.02-.31.06C18.18 5.16 15.09 5.7 12 5.7c-3.09 0-6.18-.55-9.12-1.64-.11-.04-.22-.06-.31-.06-.34 0-.57.23-.57.63v14.75c0 .39.23.62.57.62.1 0 .2-.02.31-.06 2.94-1.1 6.03-1.64 9.12-1.64 3.09 0 6.18.55 9.12 1.64.11.04.21.06.31.06.33 0 .57-.23.57-.63V4.63c0-.4-.24-.63-.57-.63z');
var _elm_community$elm_material_icons$Material_Icons_Image$panorama_fish_eye = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z');
var _elm_community$elm_material_icons$Material_Icons_Image$panorama = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M23 18V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zM8.5 12.5l2.5 3.01L14.5 11l4.5 6H5l3.5-4.5z');
var _elm_community$elm_material_icons$Material_Icons_Image$palette = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z');
var _elm_community$elm_material_icons$Material_Icons_Image$navigate_next = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z');
var _elm_community$elm_material_icons$Material_Icons_Image$navigate_before = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z');
var _elm_community$elm_material_icons$Material_Icons_Image$nature_people = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M22.17 9.17c0-3.87-3.13-7-7-7s-7 3.13-7 7c0 3.47 2.52 6.34 5.83 6.89V20H6v-3h1v-4c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v4h1v5h16v-2h-3v-3.88c3.47-.41 6.17-3.36 6.17-6.95zM4.5 11c.83 0 1.5-.67 1.5-1.5S5.33 8 4.5 8 3 8.67 3 9.5 3.67 11 4.5 11z');
var _elm_community$elm_material_icons$Material_Icons_Image$nature = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 16.12c3.47-.41 6.17-3.36 6.17-6.95 0-3.87-3.13-7-7-7s-7 3.13-7 7c0 3.47 2.52 6.34 5.83 6.89V20H5v2h14v-2h-6v-3.88z');
var _elm_community$elm_material_icons$Material_Icons_Image$music_note = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z');
var _elm_community$elm_material_icons$Material_Icons_Image$movie_creation = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z');
var _elm_community$elm_material_icons$Material_Icons_Image$monochrome_photos = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 5h-3.2L15 3H9L7.2 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 14h-8v-1c-2.8 0-5-2.2-5-5s2.2-5 5-5V7h8v12zm-3-6c0-2.8-2.2-5-5-5v1.8c1.8 0 3.2 1.4 3.2 3.2s-1.4 3.2-3.2 3.2V18c2.8 0 5-2.2 5-5zm-8.2 0c0 1.8 1.4 3.2 3.2 3.2V9.8c-1.8 0-3.2 1.4-3.2 3.2z');
var _elm_community$elm_material_icons$Material_Icons_Image$loupe = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.49 2 2 6.49 2 12s4.49 10 10 10h8c1.1 0 2-.9 2-2v-8c0-5.51-4.49-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z');
var _elm_community$elm_material_icons$Material_Icons_Image$looks_two = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 8c0 1.11-.9 2-2 2h-2v2h4v2H9v-4c0-1.11.9-2 2-2h2V9H9V7h4c1.1 0 2 .89 2 2v2z');
var _elm_community$elm_material_icons$Material_Icons_Image$looks_one = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z');
var _elm_community$elm_material_icons$Material_Icons_Image$looks_6 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11 15h2v-2h-2v2zm8-12H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h2c1.1 0 2 .89 2 2v2c0 1.11-.9 2-2 2h-2c-1.1 0-2-.89-2-2V9c0-1.11.9-2 2-2h4v2z');
var _elm_community$elm_material_icons$Material_Icons_Image$looks_5 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h2c1.1 0 2 .89 2 2v2c0 1.11-.9 2-2 2H9v-2h4v-2H9V7h6v2z');
var _elm_community$elm_material_icons$Material_Icons_Image$looks_4 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 14h-2v-4H9V7h2v4h2V7h2v10z');
var _elm_community$elm_material_icons$Material_Icons_Image$looks_3 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.01 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 7.5c0 .83-.67 1.5-1.5 1.5.83 0 1.5.67 1.5 1.5V15c0 1.11-.9 2-2 2h-4v-2h4v-2h-2v-2h2V9h-4V7h4c1.1 0 2 .89 2 2v1.5z');
var _elm_community$elm_material_icons$Material_Icons_Image$looks = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 10c-3.86 0-7 3.14-7 7h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.86-3.14-7-7-7zm0-4C5.93 6 1 10.93 1 17h2c0-4.96 4.04-9 9-9s9 4.04 9 9h2c0-6.07-4.93-11-11-11z');
var _elm_community$elm_material_icons$Material_Icons_Image$lens = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z');
var _elm_community$elm_material_icons$Material_Icons_Image$leak_remove = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 3H8c0 .37-.04.72-.12 1.06l1.59 1.59C9.81 4.84 10 3.94 10 3zM3 4.27l2.84 2.84C5.03 7.67 4.06 8 3 8v2c1.61 0 3.09-.55 4.27-1.46L8.7 9.97C7.14 11.24 5.16 12 3 12v2c2.71 0 5.19-.99 7.11-2.62l2.5 2.5C10.99 15.81 10 18.29 10 21h2c0-2.16.76-4.14 2.03-5.69l1.43 1.43C14.55 17.91 14 19.39 14 21h2c0-1.06.33-2.03.89-2.84L19.73 21 21 19.73 4.27 3 3 4.27zM14 3h-2c0 1.5-.37 2.91-1.02 4.16l1.46 1.46C13.42 6.98 14 5.06 14 3zm5.94 13.12c.34-.08.69-.12 1.06-.12v-2c-.94 0-1.84.19-2.66.52l1.6 1.6zm-4.56-4.56l1.46 1.46C18.09 12.37 19.5 12 21 12v-2c-2.06 0-3.98.58-5.62 1.56z');
var _elm_community$elm_material_icons$Material_Icons_Image$leak_add = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6 3H3v3c1.66 0 3-1.34 3-3zm8 0h-2c0 4.97-4.03 9-9 9v2c6.08 0 11-4.93 11-11zm-4 0H8c0 2.76-2.24 5-5 5v2c3.87 0 7-3.13 7-7zm0 18h2c0-4.97 4.03-9 9-9v-2c-6.07 0-11 4.93-11 11zm8 0h3v-3c-1.66 0-3 1.34-3 3zm-4 0h2c0-2.76 2.24-5 5-5v-2c-3.87 0-7 3.13-7 7z');
var _elm_community$elm_material_icons$Material_Icons_Image$landscape = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z');
var _elm_community$elm_material_icons$Material_Icons_Image$iso = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5.5 7.5h2v-2H9v2h2V9H9v2H7.5V9h-2V7.5zM19 19H5L19 5v14zm-2-2v-1.5h-5V17h5z');
var _elm_community$elm_material_icons$Material_Icons_Image$image_aspect_ratio = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16 10h-2v2h2v-2zm0 4h-2v2h2v-2zm-8-4H6v2h2v-2zm4 0h-2v2h2v-2zm8-6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z');
var _elm_community$elm_material_icons$Material_Icons_Image$image = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');
var _elm_community$elm_material_icons$Material_Icons_Image$healing = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17.73 12.02l3.98-3.98c.39-.39.39-1.02 0-1.41l-4.34-4.34c-.39-.39-1.02-.39-1.41 0l-3.98 3.98L8 2.29C7.8 2.1 7.55 2 7.29 2c-.25 0-.51.1-.7.29L2.25 6.63c-.39.39-.39 1.02 0 1.41l3.98 3.98L2.25 16c-.39.39-.39 1.02 0 1.41l4.34 4.34c.39.39 1.02.39 1.41 0l3.98-3.98 3.98 3.98c.2.2.45.29.71.29.26 0 .51-.1.71-.29l4.34-4.34c.39-.39.39-1.02 0-1.41l-3.99-3.98zM12 9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-4.71 1.96L3.66 7.34l3.63-3.63 3.62 3.62-3.62 3.63zM10 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2.66 9.34l-3.63-3.62 3.63-3.63 3.62 3.62-3.62 3.63z');
var _elm_community$elm_material_icons$Material_Icons_Image$hdr_weak = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M5 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm12-2c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z');
var _elm_community$elm_material_icons$Material_Icons_Image$hdr_strong = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zM5 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z');
var _elm_community$elm_material_icons$Material_Icons_Image$hdr_on = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 11.5v-1c0-.8-.7-1.5-1.5-1.5H16v6h1.5v-2h1.1l.9 2H21l-.9-2.1c.5-.3.9-.8.9-1.4zm-1.5 0h-2v-1h2v1zm-13-.5h-2V9H3v6h1.5v-2.5h2V15H8V9H6.5v2zM13 9H9.5v6H13c.8 0 1.5-.7 1.5-1.5v-3c0-.8-.7-1.5-1.5-1.5zm0 4.5h-2v-3h2v3z');
var _elm_community$elm_material_icons$Material_Icons_Image$hdr_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17.5 15v-2h1.1l.9 2H21l-.9-2.1c.5-.2.9-.8.9-1.4v-1c0-.8-.7-1.5-1.5-1.5H16v4.9l1.1 1.1h.4zm0-4.5h2v1h-2v-1zm-4.5 0v.4l1.5 1.5v-1.9c0-.8-.7-1.5-1.5-1.5h-1.9l1.5 1.5h.4zm-3.5-1l-7-7-1.1 1L6.9 9h-.4v2h-2V9H3v6h1.5v-2.5h2V15H8v-4.9l1.5 1.5V15h3.4l7.6 7.6 1.1-1.1-12.1-12z');
var _elm_community$elm_material_icons$Material_Icons_Image$grid_on = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z');
var _elm_community$elm_material_icons$Material_Icons_Image$grid_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M8 4v1.45l2 2V4h4v4h-3.45l2 2H14v1.45l2 2V10h4v4h-3.45l2 2H20v1.45l2 2V4c0-1.1-.9-2-2-2H4.55l2 2H8zm8 0h4v4h-4V4zM1.27 1.27L0 2.55l2 2V20c0 1.1.9 2 2 2h15.46l2 2 1.27-1.27L1.27 1.27zM10 12.55L11.45 14H10v-1.45zm-6-6L5.45 8H4V6.55zM8 20H4v-4h4v4zm0-6H4v-4h3.45l.55.55V14zm6 6h-4v-4h3.45l.55.54V20zm2 0v-1.46L17.46 20H16z');
var _elm_community$elm_material_icons$Material_Icons_Image$grain = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-4 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z');
var _elm_community$elm_material_icons$Material_Icons_Image$gradient = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11 9h2v2h-2zm-2 2h2v2H9zm4 0h2v2h-2zm2-2h2v2h-2zM7 9h2v2H7zm12-6H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm2-7h-2v2h2v2h-2v-2h-2v2h-2v-2h-2v2H9v-2H7v2H5v-2h2v-2H5V5h14v6z');
var _elm_community$elm_material_icons$Material_Icons_Image$flip = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15 21h2v-2h-2v2zm4-12h2V7h-2v2zM3 5v14c0 1.1.9 2 2 2h4v-2H5V5h4V3H5c-1.1 0-2 .9-2 2zm16-2v2h2c0-1.1-.9-2-2-2zm-8 20h2V1h-2v22zm8-6h2v-2h-2v2zM15 5h2V3h-2v2zm4 8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2z');
var _elm_community$elm_material_icons$Material_Icons_Image$flash_on = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 2v11h3v9l7-12h-4l4-8z');
var _elm_community$elm_material_icons$Material_Icons_Image$flash_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3.27 3L2 4.27l5 5V13h3v9l3.58-6.14L17.73 20 19 18.73 3.27 3zM17 10h-4l4-8H7v2.18l8.46 8.46L17 10z');
var _elm_community$elm_material_icons$Material_Icons_Image$flash_auto = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 2v12h3v9l7-12H9l4-9H3zm16 0h-2l-3.2 9h1.9l.7-2h3.2l.7 2h1.9L19 2zm-2.15 5.65L18 4l1.15 3.65h-2.3z');
var _elm_community$elm_material_icons$Material_Icons_Image$flare = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 11H1v2h6v-2zm2.17-3.24L7.05 5.64 5.64 7.05l2.12 2.12 1.41-1.41zM13 1h-2v6h2V1zm5.36 6.05l-1.41-1.41-2.12 2.12 1.41 1.41 2.12-2.12zM17 11v2h6v-2h-6zm-5-2c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm2.83 7.24l2.12 2.12 1.41-1.41-2.12-2.12-1.41 1.41zm-9.19.71l1.41 1.41 2.12-2.12-1.41-1.41-2.12 2.12zM11 23h2v-6h-2v6z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_vintage = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18.7 12.4c-.28-.16-.57-.29-.86-.4.29-.11.58-.24.86-.4 1.92-1.11 2.99-3.12 3-5.19-1.79-1.03-4.07-1.11-6 0-.28.16-.54.35-.78.54.05-.31.08-.63.08-.95 0-2.22-1.21-4.15-3-5.19C10.21 1.85 9 3.78 9 6c0 .32.03.64.08.95-.24-.2-.5-.39-.78-.55-1.92-1.11-4.2-1.03-6 0 0 2.07 1.07 4.08 3 5.19.28.16.57.29.86.4-.29.11-.58.24-.86.4-1.92 1.11-2.99 3.12-3 5.19 1.79 1.03 4.07 1.11 6 0 .28-.16.54-.35.78-.54-.05.32-.08.64-.08.96 0 2.22 1.21 4.15 3 5.19 1.79-1.04 3-2.97 3-5.19 0-.32-.03-.64-.08-.95.24.2.5.38.78.54 1.92 1.11 4.2 1.03 6 0-.01-2.07-1.08-4.08-3-5.19zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_tilt_shift = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M11 4.07V2.05c-2.01.2-3.84 1-5.32 2.21L7.1 5.69c1.11-.86 2.44-1.44 3.9-1.62zm7.32.19C16.84 3.05 15.01 2.25 13 2.05v2.02c1.46.18 2.79.76 3.9 1.62l1.42-1.43zM19.93 11h2.02c-.2-2.01-1-3.84-2.21-5.32L18.31 7.1c.86 1.11 1.44 2.44 1.62 3.9zM5.69 7.1L4.26 5.68C3.05 7.16 2.25 8.99 2.05 11h2.02c.18-1.46.76-2.79 1.62-3.9zM4.07 13H2.05c.2 2.01 1 3.84 2.21 5.32l1.43-1.43c-.86-1.1-1.44-2.43-1.62-3.89zM15 12c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3zm3.31 4.9l1.43 1.43c1.21-1.48 2.01-3.32 2.21-5.32h-2.02c-.18 1.45-.76 2.78-1.62 3.89zM13 19.93v2.02c2.01-.2 3.84-1 5.32-2.21l-1.43-1.43c-1.1.86-2.43 1.44-3.89 1.62zm-7.32-.19C7.16 20.95 9 21.75 11 21.95v-2.02c-1.46-.18-2.79-.76-3.9-1.62l-1.42 1.43z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_none = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_hdr = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_frames = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 4h-4l-4-4-4 4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H4V6h4.52l3.52-3.5L15.52 6H20v14zM18 8H6v10h12');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_drama = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.61 5.64 5.36 8.04 2.35 8.36 0 10.9 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4h2c0-2.76-1.86-5.08-4.4-5.78C8.61 6.88 10.2 6 12 6c3.03 0 5.5 2.47 5.5 5.5v.5H19c1.65 0 3 1.35 3 3s-1.35 3-3 3z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_center_focus = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_b_and_w = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16l-7-8v8H5l7-8V5h7v14z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_9_plus = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm11 7V8c0-1.11-.9-2-2-2h-1c-1.1 0-2 .89-2 2v1c0 1.11.9 2 2 2h1v1H9v2h3c1.1 0 2-.89 2-2zm-3-3V8h1v1h-1zm10-8H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 8h-2V7h-2v2h-2v2h2v2h2v-2h2v6H7V3h14v6z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_9 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zM15 5h-2c-1.1 0-2 .89-2 2v2c0 1.11.9 2 2 2h2v2h-4v2h4c1.1 0 2-.89 2-2V7c0-1.11-.9-2-2-2zm0 4h-2V7h2v2z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_8 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zm-8-2h2c1.1 0 2-.89 2-2v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V7c0-1.11-.9-2-2-2h-2c-1.1 0-2 .89-2 2v1.5c0 .83.67 1.5 1.5 1.5-.83 0-1.5.67-1.5 1.5V13c0 1.11.9 2 2 2zm0-8h2v2h-2V7zm0 4h2v2h-2v-2z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_7 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zm-8-2l4-8V5h-6v2h4l-4 8h2z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_6 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zm-8-2h2c1.1 0 2-.89 2-2v-2c0-1.11-.9-2-2-2h-2V7h4V5h-4c-1.1 0-2 .89-2 2v6c0 1.11.9 2 2 2zm0-4h2v2h-2v-2z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_5 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 1H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zM3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm14 8v-2c0-1.11-.9-2-2-2h-2V7h4V5h-6v6h4v2h-4v2h4c1.1 0 2-.89 2-2z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_4 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm12 10h2V5h-2v4h-2V5h-2v6h4v4zm6-14H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_3 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 1H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zM3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm14 8v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V7c0-1.11-.9-2-2-2h-4v2h4v2h-2v2h2v2h-4v2h4c1.1 0 2-.89 2-2z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_2 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zm-4-4h-4v-2h2c1.1 0 2-.89 2-2V7c0-1.11-.9-2-2-2h-4v2h4v2h-2c-1.1 0-2 .89-2 2v4h6v-2z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter_1 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm11 10h2V5h-4v2h2v8zm7-14H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z');
var _elm_community$elm_material_icons$Material_Icons_Image$filter = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.96 10.29l-2.75 3.54-1.96-2.36L8.5 15h11l-3.54-4.71zM3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z');
var _elm_community$elm_material_icons$Material_Icons_Image$exposure_zero = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16.14 12.5c0 1-.1 1.85-.3 2.55-.2.7-.48 1.27-.83 1.7-.36.44-.79.75-1.3.95-.51.2-1.07.3-1.7.3-.62 0-1.18-.1-1.69-.3-.51-.2-.95-.51-1.31-.95-.36-.44-.65-1.01-.85-1.7-.2-.7-.3-1.55-.3-2.55v-2.04c0-1 .1-1.85.3-2.55.2-.7.48-1.26.84-1.69.36-.43.8-.74 1.31-.93C10.81 5.1 11.38 5 12 5c.63 0 1.19.1 1.7.29.51.19.95.5 1.31.93.36.43.64.99.84 1.69.2.7.3 1.54.3 2.55v2.04zm-2.11-2.36c0-.64-.05-1.18-.13-1.62-.09-.44-.22-.79-.4-1.06-.17-.27-.39-.46-.64-.58-.25-.13-.54-.19-.86-.19-.32 0-.61.06-.86.18s-.47.31-.64.58c-.17.27-.31.62-.4 1.06s-.13.98-.13 1.62v2.67c0 .64.05 1.18.14 1.62.09.45.23.81.4 1.09s.39.48.64.61.54.19.87.19c.33 0 .62-.06.87-.19s.46-.33.63-.61c.17-.28.3-.64.39-1.09.09-.45.13-.99.13-1.62v-2.66z');
var _elm_community$elm_material_icons$Material_Icons_Image$exposure_plus_2 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16.05 16.29l2.86-3.07c.38-.39.72-.79 1.04-1.18.32-.39.59-.78.82-1.17.23-.39.41-.78.54-1.17.13-.39.19-.79.19-1.18 0-.53-.09-1.02-.27-1.46-.18-.44-.44-.81-.78-1.11-.34-.31-.77-.54-1.26-.71-.51-.16-1.08-.24-1.72-.24-.69 0-1.31.11-1.85.32-.54.21-1 .51-1.36.88-.37.37-.65.8-.84 1.3-.18.47-.27.97-.28 1.5h2.14c.01-.31.05-.6.13-.87.09-.29.23-.54.4-.75.18-.21.41-.37.68-.49.27-.12.6-.18.96-.18.31 0 .58.05.81.15.23.1.43.25.59.43.16.18.28.4.37.65.08.25.13.52.13.81 0 .22-.03.43-.08.65-.06.22-.15.45-.29.7-.14.25-.32.53-.56.83-.23.3-.52.65-.88 1.03l-4.17 4.55V18H22v-1.71h-5.95zM8 7H6v4H2v2h4v4h2v-4h4v-2H8V7z');
var _elm_community$elm_material_icons$Material_Icons_Image$exposure_plus_1 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 7H8v4H4v2h4v4h2v-4h4v-2h-4V7zm10 11h-2V7.38L15 8.4V6.7L19.7 5h.3v13z');
var _elm_community$elm_material_icons$Material_Icons_Image$exposure_neg_2 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15.05 16.29l2.86-3.07c.38-.39.72-.79 1.04-1.18.32-.39.59-.78.82-1.17.23-.39.41-.78.54-1.17s.19-.79.19-1.18c0-.53-.09-1.02-.27-1.46-.18-.44-.44-.81-.78-1.11-.34-.31-.77-.54-1.26-.71-.51-.16-1.08-.24-1.72-.24-.69 0-1.31.11-1.85.32-.54.21-1 .51-1.36.88-.37.37-.65.8-.84 1.3-.18.47-.27.97-.28 1.5h2.14c.01-.31.05-.6.13-.87.09-.29.23-.54.4-.75.18-.21.41-.37.68-.49.27-.12.6-.18.96-.18.31 0 .58.05.81.15.23.1.43.25.59.43.16.18.28.4.37.65.08.25.13.52.13.81 0 .22-.03.43-.08.65-.06.22-.15.45-.29.7-.14.25-.32.53-.56.83-.23.3-.52.65-.88 1.03l-4.17 4.55V18H21v-1.71h-5.95zM2 11v2h8v-2H2z');
var _elm_community$elm_material_icons$Material_Icons_Image$exposure_neg_1 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 11v2h8v-2H4zm15 7h-2V7.38L14 8.4V6.7L18.7 5h.3v13z');
var _elm_community$elm_material_icons$Material_Icons_Image$exposure = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M15 17v2h2v-2h2v-2h-2v-2h-2v2h-2v2h2zm5-15H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM5 5h6v2H5V5zm15 15H4L20 4v16z');
var _elm_community$elm_material_icons$Material_Icons_Image$edit = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z');
var _elm_community$elm_material_icons$Material_Icons_Image$details = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 4l9 16 9-16H3zm3.38 2h11.25L12 16 6.38 6z');
var _elm_community$elm_material_icons$Material_Icons_Image$dehaze = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M2 15.5v2h20v-2H2zm0-5v2h20v-2H2zm0-5v2h20v-2H2z');
var _elm_community$elm_material_icons$Material_Icons_Image$crop_square = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z');
var _elm_community$elm_material_icons$Material_Icons_Image$crop_portrait = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z');
var _elm_community$elm_material_icons$Material_Icons_Image$crop_original = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z');
var _elm_community$elm_material_icons$Material_Icons_Image$crop_landscape = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z');
var _elm_community$elm_material_icons$Material_Icons_Image$crop_free = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z');
var _elm_community$elm_material_icons$Material_Icons_Image$crop_din = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z');
var _elm_community$elm_material_icons$Material_Icons_Image$crop_7_5 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z');
var _elm_community$elm_material_icons$Material_Icons_Image$crop_5_4 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z');
var _elm_community$elm_material_icons$Material_Icons_Image$crop_3_2 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12z');
var _elm_community$elm_material_icons$Material_Icons_Image$crop = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z');
var _elm_community$elm_material_icons$Material_Icons_Image$crop_16_9 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z');
var _elm_community$elm_material_icons$Material_Icons_Image$control_point_duplicate = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M16 8h-2v3h-3v2h3v3h2v-3h3v-2h-3zM2 12c0-2.79 1.64-5.2 4.01-6.32V3.52C2.52 4.76 0 8.09 0 12s2.52 7.24 6.01 8.48v-2.16C3.64 17.2 2 14.79 2 12zm13-9c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z');
var _elm_community$elm_material_icons$Material_Icons_Image$control_point = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z');
var _elm_community$elm_material_icons$Material_Icons_Image$compare = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z');
var _elm_community$elm_material_icons$Material_Icons_Image$colorize = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z');
var _elm_community$elm_material_icons$Material_Icons_Image$color_lens = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z');
var _elm_community$elm_material_icons$Material_Icons_Image$collections_bookmark = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zM20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 10l-2.5-1.5L15 12V4h5v8z');
var _elm_community$elm_material_icons$Material_Icons_Image$collections = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z');
var _elm_community$elm_material_icons$Material_Icons_Image$center_focus_weak = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z');
var _elm_community$elm_material_icons$Material_Icons_Image$center_focus_strong = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 7H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z');
var _elm_community$elm_material_icons$Material_Icons_Image$camera_roll = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M14 5c0-1.1-.9-2-2-2h-1V2c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1v1H4c-1.1 0-2 .9-2 2v15c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2h8V5h-8zm-2 13h-2v-2h2v2zm0-9h-2V7h2v2zm4 9h-2v-2h2v2zm0-9h-2V7h2v2zm4 9h-2v-2h2v2zm0-9h-2V7h2v2z');
var _elm_community$elm_material_icons$Material_Icons_Image$camera_rear = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 20H5v2h5v2l3-3-3-3v2zm4 0v2h5v-2h-5zm3-20H7C5.9 0 5 .9 5 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm-5 6c-1.11 0-2-.9-2-2s.89-2 1.99-2 2 .9 2 2C14 5.1 13.1 6 12 6z');
var _elm_community$elm_material_icons$Material_Icons_Image$camera_front = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 20H5v2h5v2l3-3-3-3v2zm4 0v2h5v-2h-5zM12 8c1.1 0 2-.9 2-2s-.9-2-2-2-1.99.9-1.99 2S10.9 8 12 8zm5-8H7C5.9 0 5 .9 5 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zM7 2h10v10.5c0-1.67-3.33-2.5-5-2.5s-5 .83-5 2.5V2z');
var _elm_community$elm_material_icons$Material_Icons_Image$camera_alt = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$circle,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$cx('12'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$cy('12'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$r('3.5'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$d('M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Image$camera = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9.4 10.5l4.77-8.26C13.47 2.09 12.75 2 12 2c-2.4 0-4.6.85-6.32 2.25l3.66 6.35.06-.1zM21.54 9c-.92-2.92-3.15-5.26-6-6.34L11.88 9h9.66zm.26 1h-7.49l.29.5 4.76 8.25C21 16.97 22 14.61 22 12c0-.69-.07-1.35-.2-2zM8.54 12l-3.9-6.75C3.01 7.03 2 9.39 2 12c0 .69.07 1.35.2 2h7.49l-1.15-2zm-6.08 3c.92 2.92 3.15 5.26 6 6.34L12.12 15H2.46zm11.27 0l-3.9 6.76c.7.15 1.42.24 2.17.24 2.4 0 4.6-.85 6.32-2.25l-3.66-6.35-.93 1.6z');
var _elm_community$elm_material_icons$Material_Icons_Image$brush = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z');
var _elm_community$elm_material_icons$Material_Icons_Image$broken_image = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z');
var _elm_community$elm_material_icons$Material_Icons_Image$brightness_7 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z');
var _elm_community$elm_material_icons$Material_Icons_Image$brightness_6 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z');
var _elm_community$elm_material_icons$Material_Icons_Image$brightness_5 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z');
var _elm_community$elm_material_icons$Material_Icons_Image$brightness_4 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-.89 0-1.74-.2-2.5-.55C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.45C10.26 6.2 11.11 6 12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6z');
var _elm_community$elm_material_icons$Material_Icons_Image$brightness_3 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z');
var _elm_community$elm_material_icons$Material_Icons_Image$brightness_2 = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z');
var _elm_community$elm_material_icons$Material_Icons_Image$brightness_1 = F2(
	function (color, size) {
		var stringSize = _elm_lang$core$Basics$toString(size);
		var stringColor = _elm_community$elm_material_icons$Material_Icons_Internal$toRgbaString(color);
		return A2(
			_elm_lang$svg$Svg$svg,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(stringSize),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(stringSize),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$circle,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$cx('12'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$cy('12'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$r('10'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill(stringColor),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _elm_community$elm_material_icons$Material_Icons_Image$blur_on = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M6 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-3 .5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM6 5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm15 5.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM14 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm-11 10c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm7 7c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm0-17c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM10 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 5.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm8 .5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm3 8.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM14 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 3.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm-4-12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0 8.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4-4.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-4c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z');
var _elm_community$elm_material_icons$Material_Icons_Image$blur_off = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M14 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-.2 4.48l.2.02c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5l.02.2c.09.67.61 1.19 1.28 1.28zM14 3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm-4 0c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm11 7c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM10 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8 8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-4 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM2.5 5.27l3.78 3.78L6 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1c0-.1-.03-.19-.06-.28l2.81 2.81c-.71.11-1.25.73-1.25 1.47 0 .83.67 1.5 1.5 1.5.74 0 1.36-.54 1.47-1.25l2.81 2.81c-.09-.03-.18-.06-.28-.06-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1c0-.1-.03-.19-.06-.28l3.78 3.78L20 20.23 3.77 4 2.5 5.27zM10 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm11-3.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM6 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM3 9.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm7 11c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM6 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-3-3.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z');
var _elm_community$elm_material_icons$Material_Icons_Image$blur_linear = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M5 17.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM9 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zM3 21h18v-2H3v2zM5 9.5c.83 0 1.5-.67 1.5-1.5S5.83 6.5 5 6.5 3.5 7.17 3.5 8 4.17 9.5 5 9.5zm0 4c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM9 17c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8-.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM3 3v2h18V3H3zm14 5.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm0 4c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM13 9c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z');
var _elm_community$elm_material_icons$Material_Icons_Image$blur_circular = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M10 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM7 9.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm3 7c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm-3-3c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm3-6c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM14 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-1.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm3 6c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm0-4c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm2-3.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm0-3.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z');
var _elm_community$elm_material_icons$Material_Icons_Image$audiotrack = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z');
var _elm_community$elm_material_icons$Material_Icons_Image$assistant_photo = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z');
var _elm_community$elm_material_icons$Material_Icons_Image$assistant = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5.12 10.88L12 17l-1.88-4.12L6 11l4.12-1.88L12 5l1.88 4.12L18 11l-4.12 1.88z');
var _elm_community$elm_material_icons$Material_Icons_Image$adjust = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z');
var _elm_community$elm_material_icons$Material_Icons_Image$add_to_photos = _elm_community$elm_material_icons$Material_Icons_Internal$icon('M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z');

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Random$onSelfMsg = F3(
	function (_p1, _p0, seed) {
		return _elm_lang$core$Task$succeed(seed);
	});
var _elm_lang$core$Random$magicNum8 = 2147483562;
var _elm_lang$core$Random$range = function (_p2) {
	return {ctor: '_Tuple2', _0: 0, _1: _elm_lang$core$Random$magicNum8};
};
var _elm_lang$core$Random$magicNum7 = 2147483399;
var _elm_lang$core$Random$magicNum6 = 2147483563;
var _elm_lang$core$Random$magicNum5 = 3791;
var _elm_lang$core$Random$magicNum4 = 40692;
var _elm_lang$core$Random$magicNum3 = 52774;
var _elm_lang$core$Random$magicNum2 = 12211;
var _elm_lang$core$Random$magicNum1 = 53668;
var _elm_lang$core$Random$magicNum0 = 40014;
var _elm_lang$core$Random$step = F2(
	function (_p3, seed) {
		var _p4 = _p3;
		return _p4._0(seed);
	});
var _elm_lang$core$Random$onEffects = F3(
	function (router, commands, seed) {
		var _p5 = commands;
		if (_p5.ctor === '[]') {
			return _elm_lang$core$Task$succeed(seed);
		} else {
			var _p6 = A2(_elm_lang$core$Random$step, _p5._0._0, seed);
			var value = _p6._0;
			var newSeed = _p6._1;
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p7) {
					return A3(_elm_lang$core$Random$onEffects, router, _p5._1, newSeed);
				},
				A2(_elm_lang$core$Platform$sendToApp, router, value));
		}
	});
var _elm_lang$core$Random$listHelp = F4(
	function (list, n, generate, seed) {
		listHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 1) < 0) {
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$List$reverse(list),
					_1: seed
				};
			} else {
				var _p8 = generate(seed);
				var value = _p8._0;
				var newSeed = _p8._1;
				var _v2 = {ctor: '::', _0: value, _1: list},
					_v3 = n - 1,
					_v4 = generate,
					_v5 = newSeed;
				list = _v2;
				n = _v3;
				generate = _v4;
				seed = _v5;
				continue listHelp;
			}
		}
	});
var _elm_lang$core$Random$minInt = -2147483648;
var _elm_lang$core$Random$maxInt = 2147483647;
var _elm_lang$core$Random$iLogBase = F2(
	function (b, i) {
		return (_elm_lang$core$Native_Utils.cmp(i, b) < 0) ? 1 : (1 + A2(_elm_lang$core$Random$iLogBase, b, (i / b) | 0));
	});
var _elm_lang$core$Random$command = _elm_lang$core$Native_Platform.leaf('Random');
var _elm_lang$core$Random$Generator = function (a) {
	return {ctor: 'Generator', _0: a};
};
var _elm_lang$core$Random$list = F2(
	function (n, _p9) {
		var _p10 = _p9;
		return _elm_lang$core$Random$Generator(
			function (seed) {
				return A4(
					_elm_lang$core$Random$listHelp,
					{ctor: '[]'},
					n,
					_p10._0,
					seed);
			});
	});
var _elm_lang$core$Random$map = F2(
	function (func, _p11) {
		var _p12 = _p11;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p13 = _p12._0(seed0);
				var a = _p13._0;
				var seed1 = _p13._1;
				return {
					ctor: '_Tuple2',
					_0: func(a),
					_1: seed1
				};
			});
	});
var _elm_lang$core$Random$map2 = F3(
	function (func, _p15, _p14) {
		var _p16 = _p15;
		var _p17 = _p14;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p18 = _p16._0(seed0);
				var a = _p18._0;
				var seed1 = _p18._1;
				var _p19 = _p17._0(seed1);
				var b = _p19._0;
				var seed2 = _p19._1;
				return {
					ctor: '_Tuple2',
					_0: A2(func, a, b),
					_1: seed2
				};
			});
	});
var _elm_lang$core$Random$pair = F2(
	function (genA, genB) {
		return A3(
			_elm_lang$core$Random$map2,
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			genA,
			genB);
	});
var _elm_lang$core$Random$map3 = F4(
	function (func, _p22, _p21, _p20) {
		var _p23 = _p22;
		var _p24 = _p21;
		var _p25 = _p20;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p26 = _p23._0(seed0);
				var a = _p26._0;
				var seed1 = _p26._1;
				var _p27 = _p24._0(seed1);
				var b = _p27._0;
				var seed2 = _p27._1;
				var _p28 = _p25._0(seed2);
				var c = _p28._0;
				var seed3 = _p28._1;
				return {
					ctor: '_Tuple2',
					_0: A3(func, a, b, c),
					_1: seed3
				};
			});
	});
var _elm_lang$core$Random$map4 = F5(
	function (func, _p32, _p31, _p30, _p29) {
		var _p33 = _p32;
		var _p34 = _p31;
		var _p35 = _p30;
		var _p36 = _p29;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p37 = _p33._0(seed0);
				var a = _p37._0;
				var seed1 = _p37._1;
				var _p38 = _p34._0(seed1);
				var b = _p38._0;
				var seed2 = _p38._1;
				var _p39 = _p35._0(seed2);
				var c = _p39._0;
				var seed3 = _p39._1;
				var _p40 = _p36._0(seed3);
				var d = _p40._0;
				var seed4 = _p40._1;
				return {
					ctor: '_Tuple2',
					_0: A4(func, a, b, c, d),
					_1: seed4
				};
			});
	});
var _elm_lang$core$Random$map5 = F6(
	function (func, _p45, _p44, _p43, _p42, _p41) {
		var _p46 = _p45;
		var _p47 = _p44;
		var _p48 = _p43;
		var _p49 = _p42;
		var _p50 = _p41;
		return _elm_lang$core$Random$Generator(
			function (seed0) {
				var _p51 = _p46._0(seed0);
				var a = _p51._0;
				var seed1 = _p51._1;
				var _p52 = _p47._0(seed1);
				var b = _p52._0;
				var seed2 = _p52._1;
				var _p53 = _p48._0(seed2);
				var c = _p53._0;
				var seed3 = _p53._1;
				var _p54 = _p49._0(seed3);
				var d = _p54._0;
				var seed4 = _p54._1;
				var _p55 = _p50._0(seed4);
				var e = _p55._0;
				var seed5 = _p55._1;
				return {
					ctor: '_Tuple2',
					_0: A5(func, a, b, c, d, e),
					_1: seed5
				};
			});
	});
var _elm_lang$core$Random$andThen = F2(
	function (callback, _p56) {
		var _p57 = _p56;
		return _elm_lang$core$Random$Generator(
			function (seed) {
				var _p58 = _p57._0(seed);
				var result = _p58._0;
				var newSeed = _p58._1;
				var _p59 = callback(result);
				var genB = _p59._0;
				return genB(newSeed);
			});
	});
var _elm_lang$core$Random$State = F2(
	function (a, b) {
		return {ctor: 'State', _0: a, _1: b};
	});
var _elm_lang$core$Random$initState = function (seed) {
	var s = A2(_elm_lang$core$Basics$max, seed, 0 - seed);
	var q = (s / (_elm_lang$core$Random$magicNum6 - 1)) | 0;
	var s2 = A2(_elm_lang$core$Basics_ops['%'], q, _elm_lang$core$Random$magicNum7 - 1);
	var s1 = A2(_elm_lang$core$Basics_ops['%'], s, _elm_lang$core$Random$magicNum6 - 1);
	return A2(_elm_lang$core$Random$State, s1 + 1, s2 + 1);
};
var _elm_lang$core$Random$next = function (_p60) {
	var _p61 = _p60;
	var _p63 = _p61._1;
	var _p62 = _p61._0;
	var k2 = (_p63 / _elm_lang$core$Random$magicNum3) | 0;
	var rawState2 = (_elm_lang$core$Random$magicNum4 * (_p63 - (k2 * _elm_lang$core$Random$magicNum3))) - (k2 * _elm_lang$core$Random$magicNum5);
	var newState2 = (_elm_lang$core$Native_Utils.cmp(rawState2, 0) < 0) ? (rawState2 + _elm_lang$core$Random$magicNum7) : rawState2;
	var k1 = (_p62 / _elm_lang$core$Random$magicNum1) | 0;
	var rawState1 = (_elm_lang$core$Random$magicNum0 * (_p62 - (k1 * _elm_lang$core$Random$magicNum1))) - (k1 * _elm_lang$core$Random$magicNum2);
	var newState1 = (_elm_lang$core$Native_Utils.cmp(rawState1, 0) < 0) ? (rawState1 + _elm_lang$core$Random$magicNum6) : rawState1;
	var z = newState1 - newState2;
	var newZ = (_elm_lang$core$Native_Utils.cmp(z, 1) < 0) ? (z + _elm_lang$core$Random$magicNum8) : z;
	return {
		ctor: '_Tuple2',
		_0: newZ,
		_1: A2(_elm_lang$core$Random$State, newState1, newState2)
	};
};
var _elm_lang$core$Random$split = function (_p64) {
	var _p65 = _p64;
	var _p68 = _p65._1;
	var _p67 = _p65._0;
	var _p66 = _elm_lang$core$Tuple$second(
		_elm_lang$core$Random$next(_p65));
	var t1 = _p66._0;
	var t2 = _p66._1;
	var new_s2 = _elm_lang$core$Native_Utils.eq(_p68, 1) ? (_elm_lang$core$Random$magicNum7 - 1) : (_p68 - 1);
	var new_s1 = _elm_lang$core$Native_Utils.eq(_p67, _elm_lang$core$Random$magicNum6 - 1) ? 1 : (_p67 + 1);
	return {
		ctor: '_Tuple2',
		_0: A2(_elm_lang$core$Random$State, new_s1, t2),
		_1: A2(_elm_lang$core$Random$State, t1, new_s2)
	};
};
var _elm_lang$core$Random$Seed = function (a) {
	return {ctor: 'Seed', _0: a};
};
var _elm_lang$core$Random$int = F2(
	function (a, b) {
		return _elm_lang$core$Random$Generator(
			function (_p69) {
				var _p70 = _p69;
				var _p75 = _p70._0;
				var base = 2147483561;
				var f = F3(
					function (n, acc, state) {
						f:
						while (true) {
							var _p71 = n;
							if (_p71 === 0) {
								return {ctor: '_Tuple2', _0: acc, _1: state};
							} else {
								var _p72 = _p75.next(state);
								var x = _p72._0;
								var nextState = _p72._1;
								var _v27 = n - 1,
									_v28 = x + (acc * base),
									_v29 = nextState;
								n = _v27;
								acc = _v28;
								state = _v29;
								continue f;
							}
						}
					});
				var _p73 = (_elm_lang$core$Native_Utils.cmp(a, b) < 0) ? {ctor: '_Tuple2', _0: a, _1: b} : {ctor: '_Tuple2', _0: b, _1: a};
				var lo = _p73._0;
				var hi = _p73._1;
				var k = (hi - lo) + 1;
				var n = A2(_elm_lang$core$Random$iLogBase, base, k);
				var _p74 = A3(f, n, 1, _p75.state);
				var v = _p74._0;
				var nextState = _p74._1;
				return {
					ctor: '_Tuple2',
					_0: lo + A2(_elm_lang$core$Basics_ops['%'], v, k),
					_1: _elm_lang$core$Random$Seed(
						_elm_lang$core$Native_Utils.update(
							_p75,
							{state: nextState}))
				};
			});
	});
var _elm_lang$core$Random$bool = A2(
	_elm_lang$core$Random$map,
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.eq(x, y);
		})(1),
	A2(_elm_lang$core$Random$int, 0, 1));
var _elm_lang$core$Random$float = F2(
	function (a, b) {
		return _elm_lang$core$Random$Generator(
			function (seed) {
				var _p76 = A2(
					_elm_lang$core$Random$step,
					A2(_elm_lang$core$Random$int, _elm_lang$core$Random$minInt, _elm_lang$core$Random$maxInt),
					seed);
				var number = _p76._0;
				var newSeed = _p76._1;
				var negativeOneToOne = _elm_lang$core$Basics$toFloat(number) / _elm_lang$core$Basics$toFloat(_elm_lang$core$Random$maxInt - _elm_lang$core$Random$minInt);
				var _p77 = (_elm_lang$core$Native_Utils.cmp(a, b) < 0) ? {ctor: '_Tuple2', _0: a, _1: b} : {ctor: '_Tuple2', _0: b, _1: a};
				var lo = _p77._0;
				var hi = _p77._1;
				var scaled = ((lo + hi) / 2) + ((hi - lo) * negativeOneToOne);
				return {ctor: '_Tuple2', _0: scaled, _1: newSeed};
			});
	});
var _elm_lang$core$Random$initialSeed = function (n) {
	return _elm_lang$core$Random$Seed(
		{
			state: _elm_lang$core$Random$initState(n),
			next: _elm_lang$core$Random$next,
			split: _elm_lang$core$Random$split,
			range: _elm_lang$core$Random$range
		});
};
var _elm_lang$core$Random$init = A2(
	_elm_lang$core$Task$andThen,
	function (t) {
		return _elm_lang$core$Task$succeed(
			_elm_lang$core$Random$initialSeed(
				_elm_lang$core$Basics$round(t)));
	},
	_elm_lang$core$Time$now);
var _elm_lang$core$Random$Generate = function (a) {
	return {ctor: 'Generate', _0: a};
};
var _elm_lang$core$Random$generate = F2(
	function (tagger, generator) {
		return _elm_lang$core$Random$command(
			_elm_lang$core$Random$Generate(
				A2(_elm_lang$core$Random$map, tagger, generator)));
	});
var _elm_lang$core$Random$cmdMap = F2(
	function (func, _p78) {
		var _p79 = _p78;
		return _elm_lang$core$Random$Generate(
			A2(_elm_lang$core$Random$map, func, _p79._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Random'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Random$init, onEffects: _elm_lang$core$Random$onEffects, onSelfMsg: _elm_lang$core$Random$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Random$cmdMap};

var _elm_lang$core$Set$foldr = F3(
	function (f, b, _p0) {
		var _p1 = _p0;
		return A3(
			_elm_lang$core$Dict$foldr,
			F3(
				function (k, _p2, b) {
					return A2(f, k, b);
				}),
			b,
			_p1._0);
	});
var _elm_lang$core$Set$foldl = F3(
	function (f, b, _p3) {
		var _p4 = _p3;
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, _p5, b) {
					return A2(f, k, b);
				}),
			b,
			_p4._0);
	});
var _elm_lang$core$Set$toList = function (_p6) {
	var _p7 = _p6;
	return _elm_lang$core$Dict$keys(_p7._0);
};
var _elm_lang$core$Set$size = function (_p8) {
	var _p9 = _p8;
	return _elm_lang$core$Dict$size(_p9._0);
};
var _elm_lang$core$Set$member = F2(
	function (k, _p10) {
		var _p11 = _p10;
		return A2(_elm_lang$core$Dict$member, k, _p11._0);
	});
var _elm_lang$core$Set$isEmpty = function (_p12) {
	var _p13 = _p12;
	return _elm_lang$core$Dict$isEmpty(_p13._0);
};
var _elm_lang$core$Set$Set_elm_builtin = function (a) {
	return {ctor: 'Set_elm_builtin', _0: a};
};
var _elm_lang$core$Set$empty = _elm_lang$core$Set$Set_elm_builtin(_elm_lang$core$Dict$empty);
var _elm_lang$core$Set$singleton = function (k) {
	return _elm_lang$core$Set$Set_elm_builtin(
		A2(
			_elm_lang$core$Dict$singleton,
			k,
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Set$insert = F2(
	function (k, _p14) {
		var _p15 = _p14;
		return _elm_lang$core$Set$Set_elm_builtin(
			A3(
				_elm_lang$core$Dict$insert,
				k,
				{ctor: '_Tuple0'},
				_p15._0));
	});
var _elm_lang$core$Set$fromList = function (xs) {
	return A3(_elm_lang$core$List$foldl, _elm_lang$core$Set$insert, _elm_lang$core$Set$empty, xs);
};
var _elm_lang$core$Set$map = F2(
	function (f, s) {
		return _elm_lang$core$Set$fromList(
			A2(
				_elm_lang$core$List$map,
				f,
				_elm_lang$core$Set$toList(s)));
	});
var _elm_lang$core$Set$remove = F2(
	function (k, _p16) {
		var _p17 = _p16;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$remove, k, _p17._0));
	});
var _elm_lang$core$Set$union = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$union, _p20._0, _p21._0));
	});
var _elm_lang$core$Set$intersect = F2(
	function (_p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$intersect, _p24._0, _p25._0));
	});
var _elm_lang$core$Set$diff = F2(
	function (_p27, _p26) {
		var _p28 = _p27;
		var _p29 = _p26;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$diff, _p28._0, _p29._0));
	});
var _elm_lang$core$Set$filter = F2(
	function (p, _p30) {
		var _p31 = _p30;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(
				_elm_lang$core$Dict$filter,
				F2(
					function (k, _p32) {
						return p(k);
					}),
				_p31._0));
	});
var _elm_lang$core$Set$partition = F2(
	function (p, _p33) {
		var _p34 = _p33;
		var _p35 = A2(
			_elm_lang$core$Dict$partition,
			F2(
				function (k, _p36) {
					return p(k);
				}),
			_p34._0);
		var p1 = _p35._0;
		var p2 = _p35._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Set$Set_elm_builtin(p1),
			_1: _elm_lang$core$Set$Set_elm_builtin(p2)
		};
	});

var _elm_community$undo_redo$UndoList$toList = function (_p0) {
	var _p1 = _p0;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_elm_lang$core$List$reverse(_p1.past),
		A2(
			_elm_lang$core$Basics_ops['++'],
			{
				ctor: '::',
				_0: _p1.present,
				_1: {ctor: '[]'}
			},
			_p1.future));
};
var _elm_community$undo_redo$UndoList$view = F2(
	function (viewer, _p2) {
		var _p3 = _p2;
		return viewer(_p3.present);
	});
var _elm_community$undo_redo$UndoList$foldr = F3(
	function (reducer, initial, _p4) {
		var _p5 = _p4;
		return function (b) {
			return A3(_elm_lang$core$List$foldl, reducer, b, _p5.past);
		}(
			A2(
				reducer,
				_p5.present,
				A3(_elm_lang$core$List$foldr, reducer, initial, _p5.future)));
	});
var _elm_community$undo_redo$UndoList$foldl = F3(
	function (reducer, initial, _p6) {
		var _p7 = _p6;
		return function (b) {
			return A3(_elm_lang$core$List$foldl, reducer, b, _p7.future);
		}(
			A2(
				reducer,
				_p7.present,
				A3(_elm_lang$core$List$foldr, reducer, initial, _p7.past)));
	});
var _elm_community$undo_redo$UndoList$reduce = _elm_community$undo_redo$UndoList$foldl;
var _elm_community$undo_redo$UndoList$lengthFuture = function (_p8) {
	return _elm_lang$core$List$length(
		function (_) {
			return _.future;
		}(_p8));
};
var _elm_community$undo_redo$UndoList$lengthPast = function (_p9) {
	return _elm_lang$core$List$length(
		function (_) {
			return _.past;
		}(_p9));
};
var _elm_community$undo_redo$UndoList$length = function (undolist) {
	return (_elm_community$undo_redo$UndoList$lengthPast(undolist) + 1) + _elm_community$undo_redo$UndoList$lengthFuture(undolist);
};
var _elm_community$undo_redo$UndoList$hasFuture = function (_p10) {
	return !_elm_lang$core$List$isEmpty(
		function (_) {
			return _.future;
		}(_p10));
};
var _elm_community$undo_redo$UndoList$hasPast = function (_p11) {
	return !_elm_lang$core$List$isEmpty(
		function (_) {
			return _.past;
		}(_p11));
};
var _elm_community$undo_redo$UndoList$UndoList = F3(
	function (a, b, c) {
		return {past: a, present: b, future: c};
	});
var _elm_community$undo_redo$UndoList$undo = function (_p12) {
	var _p13 = _p12;
	var _p17 = _p13.present;
	var _p16 = _p13.past;
	var _p15 = _p13.future;
	var _p14 = _p16;
	if (_p14.ctor === '[]') {
		return A3(_elm_community$undo_redo$UndoList$UndoList, _p16, _p17, _p15);
	} else {
		return A3(
			_elm_community$undo_redo$UndoList$UndoList,
			_p14._1,
			_p14._0,
			{ctor: '::', _0: _p17, _1: _p15});
	}
};
var _elm_community$undo_redo$UndoList$redo = function (_p18) {
	var _p19 = _p18;
	var _p23 = _p19.present;
	var _p22 = _p19.past;
	var _p21 = _p19.future;
	var _p20 = _p21;
	if (_p20.ctor === '[]') {
		return A3(_elm_community$undo_redo$UndoList$UndoList, _p22, _p23, _p21);
	} else {
		return A3(
			_elm_community$undo_redo$UndoList$UndoList,
			{ctor: '::', _0: _p23, _1: _p22},
			_p20._0,
			_p20._1);
	}
};
var _elm_community$undo_redo$UndoList$fresh = function (state) {
	return A3(
		_elm_community$undo_redo$UndoList$UndoList,
		{ctor: '[]'},
		state,
		{ctor: '[]'});
};
var _elm_community$undo_redo$UndoList$new = F2(
	function (event, _p24) {
		var _p25 = _p24;
		return A3(
			_elm_community$undo_redo$UndoList$UndoList,
			{ctor: '::', _0: _p25.present, _1: _p25.past},
			event,
			{ctor: '[]'});
	});
var _elm_community$undo_redo$UndoList$forget = function (_p26) {
	var _p27 = _p26;
	return A3(
		_elm_community$undo_redo$UndoList$UndoList,
		{ctor: '[]'},
		_p27.present,
		_p27.future);
};
var _elm_community$undo_redo$UndoList$reset = function (_p28) {
	reset:
	while (true) {
		var _p29 = _p28;
		var _p30 = _p29.past;
		if (_p30.ctor === '[]') {
			return _elm_community$undo_redo$UndoList$fresh(_p29.present);
		} else {
			var _v12 = A3(
				_elm_community$undo_redo$UndoList$UndoList,
				_p30._1,
				_p30._0,
				{ctor: '[]'});
			_p28 = _v12;
			continue reset;
		}
	}
};
var _elm_community$undo_redo$UndoList$update = F3(
	function (updater, msg, undolist) {
		var _p31 = msg;
		switch (_p31.ctor) {
			case 'Reset':
				return _elm_community$undo_redo$UndoList$reset(undolist);
			case 'Redo':
				return _elm_community$undo_redo$UndoList$redo(undolist);
			case 'Undo':
				return _elm_community$undo_redo$UndoList$undo(undolist);
			case 'Forget':
				return _elm_community$undo_redo$UndoList$forget(undolist);
			default:
				return A2(
					_elm_community$undo_redo$UndoList$new,
					A2(updater, _p31._0, undolist.present),
					undolist);
		}
	});
var _elm_community$undo_redo$UndoList$map = F2(
	function (f, _p32) {
		var _p33 = _p32;
		return A3(
			_elm_community$undo_redo$UndoList$UndoList,
			A2(_elm_lang$core$List$map, f, _p33.past),
			f(_p33.present),
			A2(_elm_lang$core$List$map, f, _p33.future));
	});
var _elm_community$undo_redo$UndoList$map2 = F3(
	function (f, undoListA, undoListB) {
		return A3(
			_elm_community$undo_redo$UndoList$UndoList,
			A3(_elm_lang$core$List$map2, f, undoListA.past, undoListB.past),
			A2(f, undoListA.present, undoListB.present),
			A3(_elm_lang$core$List$map2, f, undoListA.future, undoListB.future));
	});
var _elm_community$undo_redo$UndoList$andMap = _elm_lang$core$Basics$flip(
	_elm_community$undo_redo$UndoList$map2(
		F2(
			function (x, y) {
				return x(y);
			})));
var _elm_community$undo_redo$UndoList$mapPresent = F2(
	function (f, _p34) {
		var _p35 = _p34;
		return A3(
			_elm_community$undo_redo$UndoList$UndoList,
			_p35.past,
			f(_p35.present),
			_p35.future);
	});
var _elm_community$undo_redo$UndoList$reverse = function (_p36) {
	var _p37 = _p36;
	return A3(_elm_community$undo_redo$UndoList$UndoList, _p37.future, _p37.present, _p37.past);
};
var _elm_community$undo_redo$UndoList$flatten = function (_p38) {
	var _p39 = _p38;
	var _p40 = _p39.present;
	return A3(
		_elm_community$undo_redo$UndoList$UndoList,
		A2(
			_elm_lang$core$Basics_ops['++'],
			_p40.past,
			_elm_lang$core$List$reverse(
				A2(_elm_lang$core$List$concatMap, _elm_community$undo_redo$UndoList$toList, _p39.past))),
		_p40.present,
		A2(
			_elm_lang$core$Basics_ops['++'],
			_p40.future,
			A2(_elm_lang$core$List$concatMap, _elm_community$undo_redo$UndoList$toList, _p39.future)));
};
var _elm_community$undo_redo$UndoList$flatMap = function (f) {
	return function (_p41) {
		return _elm_community$undo_redo$UndoList$flatten(
			A2(_elm_community$undo_redo$UndoList$map, f, _p41));
	};
};
var _elm_community$undo_redo$UndoList$andThen = _elm_community$undo_redo$UndoList$flatMap;
var _elm_community$undo_redo$UndoList$connect = F2(
	function (_p42, undolist) {
		var _p43 = _p42;
		return A3(
			_elm_community$undo_redo$UndoList$UndoList,
			_p43.past,
			_p43.present,
			A2(
				_elm_lang$core$Basics_ops['++'],
				_p43.future,
				_elm_community$undo_redo$UndoList$toList(undolist)));
	});
var _elm_community$undo_redo$UndoList$fromList = F2(
	function (present, future) {
		return A3(
			_elm_community$undo_redo$UndoList$UndoList,
			{ctor: '[]'},
			present,
			future);
	});
var _elm_community$undo_redo$UndoList$New = function (a) {
	return {ctor: 'New', _0: a};
};
var _elm_community$undo_redo$UndoList$Forget = {ctor: 'Forget'};
var _elm_community$undo_redo$UndoList$Undo = {ctor: 'Undo'};
var _elm_community$undo_redo$UndoList$Redo = {ctor: 'Redo'};
var _elm_community$undo_redo$UndoList$Reset = {ctor: 'Reset'};
var _elm_community$undo_redo$UndoList$mapMsg = F2(
	function (f, msg) {
		var _p44 = msg;
		switch (_p44.ctor) {
			case 'Reset':
				return _elm_community$undo_redo$UndoList$Reset;
			case 'Redo':
				return _elm_community$undo_redo$UndoList$Redo;
			case 'Undo':
				return _elm_community$undo_redo$UndoList$Undo;
			case 'Forget':
				return _elm_community$undo_redo$UndoList$Forget;
			default:
				return _elm_community$undo_redo$UndoList$New(
					f(_p44._0));
		}
	});

var _elm_community$undo_redo$UndoList_Decode$decodeMsgString = function (str) {
	return _elm_lang$core$Native_Utils.eq(str, 'Reset') ? _elm_lang$core$Result$Ok(_elm_community$undo_redo$UndoList$Reset) : (_elm_lang$core$Native_Utils.eq(str, 'Redo') ? _elm_lang$core$Result$Ok(_elm_community$undo_redo$UndoList$Redo) : (_elm_lang$core$Native_Utils.eq(str, 'Undo') ? _elm_lang$core$Result$Ok(_elm_community$undo_redo$UndoList$Undo) : (_elm_lang$core$Native_Utils.eq(str, 'Forget') ? _elm_lang$core$Result$Ok(_elm_community$undo_redo$UndoList$Forget) : _elm_lang$core$Result$Err(
		A2(_elm_lang$core$Basics_ops['++'], str, ' is not a valid undolist message')))));
};
var _elm_community$undo_redo$UndoList_Decode$fromResult = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Json_Decode$succeed(_p0._0);
	} else {
		return _elm_lang$core$Json_Decode$fail(_p0._0);
	}
};
var _elm_community$undo_redo$UndoList_Decode$msg = function (decoder) {
	var unionDecoder = A2(
		_elm_lang$core$Json_Decode$andThen,
		_elm_community$undo_redo$UndoList_Decode$fromResult,
		A2(_elm_lang$core$Json_Decode$map, _elm_community$undo_redo$UndoList_Decode$decodeMsgString, _elm_lang$core$Json_Decode$string));
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: unionDecoder,
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$core$Json_Decode$map,
					_elm_community$undo_redo$UndoList$New,
					A2(_elm_lang$core$Json_Decode$field, 'New', decoder)),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_community$undo_redo$UndoList_Decode$undolist = function (state) {
	return A4(
		_elm_lang$core$Json_Decode$map3,
		_elm_community$undo_redo$UndoList$UndoList,
		A2(
			_elm_lang$core$Json_Decode$field,
			'past',
			_elm_lang$core$Json_Decode$list(state)),
		A2(_elm_lang$core$Json_Decode$field, 'present', state),
		A2(
			_elm_lang$core$Json_Decode$field,
			'future',
			_elm_lang$core$Json_Decode$list(state)));
};

var _elm_community$undo_redo$UndoList_Encode$msg = function (msg) {
	var _p0 = msg;
	switch (_p0.ctor) {
		case 'Reset':
			return _elm_lang$core$Json_Encode$string('Reset');
		case 'Redo':
			return _elm_lang$core$Json_Encode$string('Redo');
		case 'Undo':
			return _elm_lang$core$Json_Encode$string('Undo');
		case 'Forget':
			return _elm_lang$core$Json_Encode$string('Forget');
		default:
			return _elm_lang$core$Json_Encode$object(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'New', _1: _p0._0},
					_1: {ctor: '[]'}
				});
	}
};
var _elm_community$undo_redo$UndoList_Encode$undolist = function (_p1) {
	var _p2 = _p1;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'past',
				_1: _elm_lang$core$Json_Encode$list(_p2.past)
			},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'present', _1: _p2.present},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'future',
						_1: _elm_lang$core$Json_Encode$list(_p2.future)
					},
					_1: {ctor: '[]'}
				}
			}
		});
};

var _elm_lang$animation_frame$Native_AnimationFrame = function()
{

function create()
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = requestAnimationFrame(function() {
			callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
		});

		return function() {
			cancelAnimationFrame(id);
		};
	});
}

return {
	create: create
};

}();

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _elm_lang$animation_frame$AnimationFrame$rAF = _elm_lang$animation_frame$Native_AnimationFrame.create(
	{ctor: '_Tuple0'});
var _elm_lang$animation_frame$AnimationFrame$subscription = _elm_lang$core$Native_Platform.leaf('AnimationFrame');
var _elm_lang$animation_frame$AnimationFrame$State = F3(
	function (a, b, c) {
		return {subs: a, request: b, oldTime: c};
	});
var _elm_lang$animation_frame$AnimationFrame$init = _elm_lang$core$Task$succeed(
	A3(
		_elm_lang$animation_frame$AnimationFrame$State,
		{ctor: '[]'},
		_elm_lang$core$Maybe$Nothing,
		0));
var _elm_lang$animation_frame$AnimationFrame$onEffects = F3(
	function (router, subs, _p0) {
		var _p1 = _p0;
		var _p5 = _p1.request;
		var _p4 = _p1.oldTime;
		var _p2 = {ctor: '_Tuple2', _0: _p5, _1: subs};
		if (_p2._0.ctor === 'Nothing') {
			if (_p2._1.ctor === '[]') {
				return _elm_lang$core$Task$succeed(
					A3(
						_elm_lang$animation_frame$AnimationFrame$State,
						{ctor: '[]'},
						_elm_lang$core$Maybe$Nothing,
						_p4));
			} else {
				return A2(
					_elm_lang$core$Task$andThen,
					function (pid) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (time) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$animation_frame$AnimationFrame$State,
										subs,
										_elm_lang$core$Maybe$Just(pid),
										time));
							},
							_elm_lang$core$Time$now);
					},
					_elm_lang$core$Process$spawn(
						A2(
							_elm_lang$core$Task$andThen,
							_elm_lang$core$Platform$sendToSelf(router),
							_elm_lang$animation_frame$AnimationFrame$rAF)));
			}
		} else {
			if (_p2._1.ctor === '[]') {
				return A2(
					_elm_lang$core$Task$andThen,
					function (_p3) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$animation_frame$AnimationFrame$State,
								{ctor: '[]'},
								_elm_lang$core$Maybe$Nothing,
								_p4));
					},
					_elm_lang$core$Process$kill(_p2._0._0));
			} else {
				return _elm_lang$core$Task$succeed(
					A3(_elm_lang$animation_frame$AnimationFrame$State, subs, _p5, _p4));
			}
		}
	});
var _elm_lang$animation_frame$AnimationFrame$onSelfMsg = F3(
	function (router, newTime, _p6) {
		var _p7 = _p6;
		var _p10 = _p7.subs;
		var diff = newTime - _p7.oldTime;
		var send = function (sub) {
			var _p8 = sub;
			if (_p8.ctor === 'Time') {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p8._0(newTime));
			} else {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p8._0(diff));
			}
		};
		return A2(
			_elm_lang$core$Task$andThen,
			function (pid) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (_p9) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$animation_frame$AnimationFrame$State,
								_p10,
								_elm_lang$core$Maybe$Just(pid),
								newTime));
					},
					_elm_lang$core$Task$sequence(
						A2(_elm_lang$core$List$map, send, _p10)));
			},
			_elm_lang$core$Process$spawn(
				A2(
					_elm_lang$core$Task$andThen,
					_elm_lang$core$Platform$sendToSelf(router),
					_elm_lang$animation_frame$AnimationFrame$rAF)));
	});
var _elm_lang$animation_frame$AnimationFrame$Diff = function (a) {
	return {ctor: 'Diff', _0: a};
};
var _elm_lang$animation_frame$AnimationFrame$diffs = function (tagger) {
	return _elm_lang$animation_frame$AnimationFrame$subscription(
		_elm_lang$animation_frame$AnimationFrame$Diff(tagger));
};
var _elm_lang$animation_frame$AnimationFrame$Time = function (a) {
	return {ctor: 'Time', _0: a};
};
var _elm_lang$animation_frame$AnimationFrame$times = function (tagger) {
	return _elm_lang$animation_frame$AnimationFrame$subscription(
		_elm_lang$animation_frame$AnimationFrame$Time(tagger));
};
var _elm_lang$animation_frame$AnimationFrame$subMap = F2(
	function (func, sub) {
		var _p11 = sub;
		if (_p11.ctor === 'Time') {
			return _elm_lang$animation_frame$AnimationFrame$Time(
				function (_p12) {
					return func(
						_p11._0(_p12));
				});
		} else {
			return _elm_lang$animation_frame$AnimationFrame$Diff(
				function (_p13) {
					return func(
						_p11._0(_p13));
				});
		}
	});
_elm_lang$core$Native_Platform.effectManagers['AnimationFrame'] = {pkg: 'elm-lang/animation-frame', init: _elm_lang$animation_frame$AnimationFrame$init, onEffects: _elm_lang$animation_frame$AnimationFrame$onEffects, onSelfMsg: _elm_lang$animation_frame$AnimationFrame$onSelfMsg, tag: 'sub', subMap: _elm_lang$animation_frame$AnimationFrame$subMap};

var _elm_lang$dom$Native_Dom = function() {

var fakeNode = {
	addEventListener: function() {},
	removeEventListener: function() {}
};

var onDocument = on(typeof document !== 'undefined' ? document : fakeNode);
var onWindow = on(typeof window !== 'undefined' ? window : fakeNode);

function on(node)
{
	return function(eventName, decoder, toTask)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {

			function performTask(event)
			{
				var result = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, event);
				if (result.ctor === 'Ok')
				{
					_elm_lang$core$Native_Scheduler.rawSpawn(toTask(result._0));
				}
			}

			node.addEventListener(eventName, performTask);

			return function()
			{
				node.removeEventListener(eventName, performTask);
			};
		});
	};
}

var rAF = typeof requestAnimationFrame !== 'undefined'
	? requestAnimationFrame
	: function(callback) { callback(); };

function withNode(id, doStuff)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		rAF(function()
		{
			var node = document.getElementById(id);
			if (node === null)
			{
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NotFound', _0: id }));
				return;
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(doStuff(node)));
		});
	});
}


// FOCUS

function focus(id)
{
	return withNode(id, function(node) {
		node.focus();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function blur(id)
{
	return withNode(id, function(node) {
		node.blur();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SCROLLING

function getScrollTop(id)
{
	return withNode(id, function(node) {
		return node.scrollTop;
	});
}

function setScrollTop(id, desiredScrollTop)
{
	return withNode(id, function(node) {
		node.scrollTop = desiredScrollTop;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toBottom(id)
{
	return withNode(id, function(node) {
		node.scrollTop = node.scrollHeight;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function getScrollLeft(id)
{
	return withNode(id, function(node) {
		return node.scrollLeft;
	});
}

function setScrollLeft(id, desiredScrollLeft)
{
	return withNode(id, function(node) {
		node.scrollLeft = desiredScrollLeft;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toRight(id)
{
	return withNode(id, function(node) {
		node.scrollLeft = node.scrollWidth;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SIZE

function width(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollWidth;
			case 'VisibleContent':
				return node.clientWidth;
			case 'VisibleContentWithBorders':
				return node.offsetWidth;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.right - rect.left;
		}
	});
}

function height(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollHeight;
			case 'VisibleContent':
				return node.clientHeight;
			case 'VisibleContentWithBorders':
				return node.offsetHeight;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.bottom - rect.top;
		}
	});
}

return {
	onDocument: F3(onDocument),
	onWindow: F3(onWindow),

	focus: focus,
	blur: blur,

	getScrollTop: getScrollTop,
	setScrollTop: F2(setScrollTop),
	getScrollLeft: getScrollLeft,
	setScrollLeft: F2(setScrollLeft),
	toBottom: toBottom,
	toRight: toRight,

	height: F2(height),
	width: F2(width)
};

}();

var _elm_lang$dom$Dom_LowLevel$onWindow = _elm_lang$dom$Native_Dom.onWindow;
var _elm_lang$dom$Dom_LowLevel$onDocument = _elm_lang$dom$Native_Dom.onDocument;

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _elm_lang$keyboard$Keyboard$onSelfMsg = F3(
	function (router, _p0, state) {
		var _p1 = _p0;
		var _p2 = A2(_elm_lang$core$Dict$get, _p1.category, state);
		if (_p2.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (tagger) {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					tagger(_p1.keyCode));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p3) {
					return _elm_lang$core$Task$succeed(state);
				},
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p2._0.taggers)));
		}
	});
var _elm_lang$keyboard$Keyboard_ops = _elm_lang$keyboard$Keyboard_ops || {};
_elm_lang$keyboard$Keyboard_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p4) {
				return task2;
			},
			task1);
	});
var _elm_lang$keyboard$Keyboard$init = _elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty);
var _elm_lang$keyboard$Keyboard$categorizeHelpHelp = F2(
	function (value, maybeValues) {
		var _p5 = maybeValues;
		if (_p5.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '::',
					_0: value,
					_1: {ctor: '[]'}
				});
		} else {
			return _elm_lang$core$Maybe$Just(
				{ctor: '::', _0: value, _1: _p5._0});
		}
	});
var _elm_lang$keyboard$Keyboard$categorizeHelp = F2(
	function (subs, subDict) {
		categorizeHelp:
		while (true) {
			var _p6 = subs;
			if (_p6.ctor === '[]') {
				return subDict;
			} else {
				var _v4 = _p6._1,
					_v5 = A3(
					_elm_lang$core$Dict$update,
					_p6._0._0,
					_elm_lang$keyboard$Keyboard$categorizeHelpHelp(_p6._0._1),
					subDict);
				subs = _v4;
				subDict = _v5;
				continue categorizeHelp;
			}
		}
	});
var _elm_lang$keyboard$Keyboard$categorize = function (subs) {
	return A2(_elm_lang$keyboard$Keyboard$categorizeHelp, subs, _elm_lang$core$Dict$empty);
};
var _elm_lang$keyboard$Keyboard$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$keyboard$Keyboard$subscription = _elm_lang$core$Native_Platform.leaf('Keyboard');
var _elm_lang$keyboard$Keyboard$Watcher = F2(
	function (a, b) {
		return {taggers: a, pid: b};
	});
var _elm_lang$keyboard$Keyboard$Msg = F2(
	function (a, b) {
		return {category: a, keyCode: b};
	});
var _elm_lang$keyboard$Keyboard$onEffects = F3(
	function (router, newSubs, oldState) {
		var rightStep = F3(
			function (category, taggers, task) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (pid) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$core$Dict$insert,
										category,
										A2(_elm_lang$keyboard$Keyboard$Watcher, taggers, pid),
										state));
							},
							_elm_lang$core$Process$spawn(
								A3(
									_elm_lang$dom$Dom_LowLevel$onDocument,
									category,
									_elm_lang$keyboard$Keyboard$keyCode,
									function (_p7) {
										return A2(
											_elm_lang$core$Platform$sendToSelf,
											router,
											A2(_elm_lang$keyboard$Keyboard$Msg, category, _p7));
									})));
					},
					task);
			});
		var bothStep = F4(
			function (category, _p8, taggers, task) {
				var _p9 = _p8;
				return A2(
					_elm_lang$core$Task$map,
					A2(
						_elm_lang$core$Dict$insert,
						category,
						A2(_elm_lang$keyboard$Keyboard$Watcher, taggers, _p9.pid)),
					task);
			});
		var leftStep = F3(
			function (category, _p10, task) {
				var _p11 = _p10;
				return A2(
					_elm_lang$keyboard$Keyboard_ops['&>'],
					_elm_lang$core$Process$kill(_p11.pid),
					task);
			});
		return A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			oldState,
			_elm_lang$keyboard$Keyboard$categorize(newSubs),
			_elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty));
	});
var _elm_lang$keyboard$Keyboard$MySub = F2(
	function (a, b) {
		return {ctor: 'MySub', _0: a, _1: b};
	});
var _elm_lang$keyboard$Keyboard$presses = function (tagger) {
	return _elm_lang$keyboard$Keyboard$subscription(
		A2(_elm_lang$keyboard$Keyboard$MySub, 'keypress', tagger));
};
var _elm_lang$keyboard$Keyboard$downs = function (tagger) {
	return _elm_lang$keyboard$Keyboard$subscription(
		A2(_elm_lang$keyboard$Keyboard$MySub, 'keydown', tagger));
};
var _elm_lang$keyboard$Keyboard$ups = function (tagger) {
	return _elm_lang$keyboard$Keyboard$subscription(
		A2(_elm_lang$keyboard$Keyboard$MySub, 'keyup', tagger));
};
var _elm_lang$keyboard$Keyboard$subMap = F2(
	function (func, _p12) {
		var _p13 = _p12;
		return A2(
			_elm_lang$keyboard$Keyboard$MySub,
			_p13._0,
			function (_p14) {
				return func(
					_p13._1(_p14));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Keyboard'] = {pkg: 'elm-lang/keyboard', init: _elm_lang$keyboard$Keyboard$init, onEffects: _elm_lang$keyboard$Keyboard$onEffects, onSelfMsg: _elm_lang$keyboard$Keyboard$onSelfMsg, tag: 'sub', subMap: _elm_lang$keyboard$Keyboard$subMap};

var _elm_lang$mouse$Mouse_ops = _elm_lang$mouse$Mouse_ops || {};
_elm_lang$mouse$Mouse_ops['&>'] = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return t2;
			},
			t1);
	});
var _elm_lang$mouse$Mouse$onSelfMsg = F3(
	function (router, _p1, state) {
		var _p2 = _p1;
		var _p3 = A2(_elm_lang$core$Dict$get, _p2.category, state);
		if (_p3.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (tagger) {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					tagger(_p2.position));
			};
			return A2(
				_elm_lang$mouse$Mouse_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p3._0.taggers)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$mouse$Mouse$init = _elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty);
var _elm_lang$mouse$Mouse$categorizeHelpHelp = F2(
	function (value, maybeValues) {
		var _p4 = maybeValues;
		if (_p4.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '::',
					_0: value,
					_1: {ctor: '[]'}
				});
		} else {
			return _elm_lang$core$Maybe$Just(
				{ctor: '::', _0: value, _1: _p4._0});
		}
	});
var _elm_lang$mouse$Mouse$categorizeHelp = F2(
	function (subs, subDict) {
		categorizeHelp:
		while (true) {
			var _p5 = subs;
			if (_p5.ctor === '[]') {
				return subDict;
			} else {
				var _v4 = _p5._1,
					_v5 = A3(
					_elm_lang$core$Dict$update,
					_p5._0._0,
					_elm_lang$mouse$Mouse$categorizeHelpHelp(_p5._0._1),
					subDict);
				subs = _v4;
				subDict = _v5;
				continue categorizeHelp;
			}
		}
	});
var _elm_lang$mouse$Mouse$categorize = function (subs) {
	return A2(_elm_lang$mouse$Mouse$categorizeHelp, subs, _elm_lang$core$Dict$empty);
};
var _elm_lang$mouse$Mouse$subscription = _elm_lang$core$Native_Platform.leaf('Mouse');
var _elm_lang$mouse$Mouse$Position = F2(
	function (a, b) {
		return {x: a, y: b};
	});
var _elm_lang$mouse$Mouse$position = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$mouse$Mouse$Position,
	A2(_elm_lang$core$Json_Decode$field, 'pageX', _elm_lang$core$Json_Decode$int),
	A2(_elm_lang$core$Json_Decode$field, 'pageY', _elm_lang$core$Json_Decode$int));
var _elm_lang$mouse$Mouse$Watcher = F2(
	function (a, b) {
		return {taggers: a, pid: b};
	});
var _elm_lang$mouse$Mouse$Msg = F2(
	function (a, b) {
		return {category: a, position: b};
	});
var _elm_lang$mouse$Mouse$onEffects = F3(
	function (router, newSubs, oldState) {
		var rightStep = F3(
			function (category, taggers, task) {
				var tracker = A3(
					_elm_lang$dom$Dom_LowLevel$onDocument,
					category,
					_elm_lang$mouse$Mouse$position,
					function (_p6) {
						return A2(
							_elm_lang$core$Platform$sendToSelf,
							router,
							A2(_elm_lang$mouse$Mouse$Msg, category, _p6));
					});
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (pid) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$core$Dict$insert,
										category,
										A2(_elm_lang$mouse$Mouse$Watcher, taggers, pid),
										state));
							},
							_elm_lang$core$Process$spawn(tracker));
					},
					task);
			});
		var bothStep = F4(
			function (category, _p7, taggers, task) {
				var _p8 = _p7;
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$core$Dict$insert,
								category,
								A2(_elm_lang$mouse$Mouse$Watcher, taggers, _p8.pid),
								state));
					},
					task);
			});
		var leftStep = F3(
			function (category, _p9, task) {
				var _p10 = _p9;
				return A2(
					_elm_lang$mouse$Mouse_ops['&>'],
					_elm_lang$core$Process$kill(_p10.pid),
					task);
			});
		return A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			oldState,
			_elm_lang$mouse$Mouse$categorize(newSubs),
			_elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty));
	});
var _elm_lang$mouse$Mouse$MySub = F2(
	function (a, b) {
		return {ctor: 'MySub', _0: a, _1: b};
	});
var _elm_lang$mouse$Mouse$clicks = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'click', tagger));
};
var _elm_lang$mouse$Mouse$moves = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousemove', tagger));
};
var _elm_lang$mouse$Mouse$downs = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousedown', tagger));
};
var _elm_lang$mouse$Mouse$ups = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mouseup', tagger));
};
var _elm_lang$mouse$Mouse$subMap = F2(
	function (func, _p11) {
		var _p12 = _p11;
		return A2(
			_elm_lang$mouse$Mouse$MySub,
			_p12._0,
			function (_p13) {
				return func(
					_p12._1(_p13));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Mouse'] = {pkg: 'elm-lang/mouse', init: _elm_lang$mouse$Mouse$init, onEffects: _elm_lang$mouse$Mouse$onEffects, onSelfMsg: _elm_lang$mouse$Mouse$onSelfMsg, tag: 'sub', subMap: _elm_lang$mouse$Mouse$subMap};

var _elm_lang$svg$Svg_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$svg$Svg_Events$simpleOn = F2(
	function (name, msg) {
		return A2(
			_elm_lang$svg$Svg_Events$on,
			name,
			_elm_lang$core$Json_Decode$succeed(msg));
	});
var _elm_lang$svg$Svg_Events$onBegin = _elm_lang$svg$Svg_Events$simpleOn('begin');
var _elm_lang$svg$Svg_Events$onEnd = _elm_lang$svg$Svg_Events$simpleOn('end');
var _elm_lang$svg$Svg_Events$onRepeat = _elm_lang$svg$Svg_Events$simpleOn('repeat');
var _elm_lang$svg$Svg_Events$onAbort = _elm_lang$svg$Svg_Events$simpleOn('abort');
var _elm_lang$svg$Svg_Events$onError = _elm_lang$svg$Svg_Events$simpleOn('error');
var _elm_lang$svg$Svg_Events$onResize = _elm_lang$svg$Svg_Events$simpleOn('resize');
var _elm_lang$svg$Svg_Events$onScroll = _elm_lang$svg$Svg_Events$simpleOn('scroll');
var _elm_lang$svg$Svg_Events$onLoad = _elm_lang$svg$Svg_Events$simpleOn('load');
var _elm_lang$svg$Svg_Events$onUnload = _elm_lang$svg$Svg_Events$simpleOn('unload');
var _elm_lang$svg$Svg_Events$onZoom = _elm_lang$svg$Svg_Events$simpleOn('zoom');
var _elm_lang$svg$Svg_Events$onActivate = _elm_lang$svg$Svg_Events$simpleOn('activate');
var _elm_lang$svg$Svg_Events$onClick = _elm_lang$svg$Svg_Events$simpleOn('click');
var _elm_lang$svg$Svg_Events$onFocusIn = _elm_lang$svg$Svg_Events$simpleOn('focusin');
var _elm_lang$svg$Svg_Events$onFocusOut = _elm_lang$svg$Svg_Events$simpleOn('focusout');
var _elm_lang$svg$Svg_Events$onMouseDown = _elm_lang$svg$Svg_Events$simpleOn('mousedown');
var _elm_lang$svg$Svg_Events$onMouseMove = _elm_lang$svg$Svg_Events$simpleOn('mousemove');
var _elm_lang$svg$Svg_Events$onMouseOut = _elm_lang$svg$Svg_Events$simpleOn('mouseout');
var _elm_lang$svg$Svg_Events$onMouseOver = _elm_lang$svg$Svg_Events$simpleOn('mouseover');
var _elm_lang$svg$Svg_Events$onMouseUp = _elm_lang$svg$Svg_Events$simpleOn('mouseup');

var _elm_lang$window$Native_Window = function()
{

var size = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)	{
	callback(_elm_lang$core$Native_Scheduler.succeed({
		width: window.innerWidth,
		height: window.innerHeight
	}));
});

return {
	size: size
};

}();
var _elm_lang$window$Window_ops = _elm_lang$window$Window_ops || {};
_elm_lang$window$Window_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$window$Window$onSelfMsg = F3(
	function (router, dimensions, state) {
		var _p1 = state;
		if (_p1.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (_p2) {
				var _p3 = _p2;
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p3._0(dimensions));
			};
			return A2(
				_elm_lang$window$Window_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p1._0.subs)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$window$Window$init = _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
var _elm_lang$window$Window$size = _elm_lang$window$Native_Window.size;
var _elm_lang$window$Window$width = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.width;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$height = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.height;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$onEffects = F3(
	function (router, newSubs, oldState) {
		var _p4 = {ctor: '_Tuple2', _0: oldState, _1: newSubs};
		if (_p4._0.ctor === 'Nothing') {
			if (_p4._1.ctor === '[]') {
				return _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
			} else {
				return A2(
					_elm_lang$core$Task$andThen,
					function (pid) {
						return _elm_lang$core$Task$succeed(
							_elm_lang$core$Maybe$Just(
								{subs: newSubs, pid: pid}));
					},
					_elm_lang$core$Process$spawn(
						A3(
							_elm_lang$dom$Dom_LowLevel$onWindow,
							'resize',
							_elm_lang$core$Json_Decode$succeed(
								{ctor: '_Tuple0'}),
							function (_p5) {
								return A2(
									_elm_lang$core$Task$andThen,
									_elm_lang$core$Platform$sendToSelf(router),
									_elm_lang$window$Window$size);
							})));
			}
		} else {
			if (_p4._1.ctor === '[]') {
				return A2(
					_elm_lang$window$Window_ops['&>'],
					_elm_lang$core$Process$kill(_p4._0._0.pid),
					_elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing));
			} else {
				return _elm_lang$core$Task$succeed(
					_elm_lang$core$Maybe$Just(
						{subs: newSubs, pid: _p4._0._0.pid}));
			}
		}
	});
var _elm_lang$window$Window$subscription = _elm_lang$core$Native_Platform.leaf('Window');
var _elm_lang$window$Window$Size = F2(
	function (a, b) {
		return {width: a, height: b};
	});
var _elm_lang$window$Window$MySub = function (a) {
	return {ctor: 'MySub', _0: a};
};
var _elm_lang$window$Window$resizes = function (tagger) {
	return _elm_lang$window$Window$subscription(
		_elm_lang$window$Window$MySub(tagger));
};
var _elm_lang$window$Window$subMap = F2(
	function (func, _p6) {
		var _p7 = _p6;
		return _elm_lang$window$Window$MySub(
			function (_p8) {
				return func(
					_p7._0(_p8));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Window'] = {pkg: 'elm-lang/window', init: _elm_lang$window$Window$init, onEffects: _elm_lang$window$Window$onEffects, onSelfMsg: _elm_lang$window$Window$onSelfMsg, tag: 'sub', subMap: _elm_lang$window$Window$subMap};

var _evancz$elm_markdown$Native_Markdown = function() {


// VIRTUAL-DOM WIDGETS

function toHtml(options, factList, rawMarkdown)
{
	var model = {
		options: options,
		markdown: rawMarkdown
	};
	return _elm_lang$virtual_dom$Native_VirtualDom.custom(factList, model, implementation);
}


// WIDGET IMPLEMENTATION

var implementation = {
	render: render,
	diff: diff
};

function render(model)
{
	var html = marked(model.markdown, formatOptions(model.options));
	var div = document.createElement('div');
	div.innerHTML = html;
	return div;
}

function diff(a, b)
{
	
	if (a.model.markdown === b.model.markdown && a.model.options === b.model.options)
	{
		return null;
	}

	return {
		applyPatch: applyPatch,
		data: marked(b.model.markdown, formatOptions(b.model.options))
	};
}

function applyPatch(domNode, data)
{
	domNode.innerHTML = data;
	return domNode;
}


// ACTUAL MARKDOWN PARSER

var marked = function() {
	// catch the `marked` object regardless of the outer environment.
	// (ex. a CommonJS module compatible environment.)
	// note that this depends on marked's implementation of environment detection.
	var module = {};
	var exports = module.exports = {};

	/**
	 * marked - a markdown parser
	 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
	 * https://github.com/chjj/marked
	 * commit cd2f6f5b7091154c5526e79b5f3bfb4d15995a51
	 */
	(function(){var block={newline:/^\n+/,code:/^( {4}[^\n]+\n*)+/,fences:noop,hr:/^( *[-*_]){3,} *(?:\n+|$)/,heading:/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,nptable:noop,lheading:/^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,blockquote:/^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,list:/^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,html:/^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,table:noop,paragraph:/^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,text:/^[^\n]+/};block.bullet=/(?:[*+-]|\d+\.)/;block.item=/^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;block.item=replace(block.item,"gm")(/bull/g,block.bullet)();block.list=replace(block.list)(/bull/g,block.bullet)("hr","\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))")("def","\\n+(?="+block.def.source+")")();block.blockquote=replace(block.blockquote)("def",block.def)();block._tag="(?!(?:"+"a|em|strong|small|s|cite|q|dfn|abbr|data|time|code"+"|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo"+"|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b";block.html=replace(block.html)("comment",/<!--[\s\S]*?-->/)("closed",/<(tag)[\s\S]+?<\/\1>/)("closing",/<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g,block._tag)();block.paragraph=replace(block.paragraph)("hr",block.hr)("heading",block.heading)("lheading",block.lheading)("blockquote",block.blockquote)("tag","<"+block._tag)("def",block.def)();block.normal=merge({},block);block.gfm=merge({},block.normal,{fences:/^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,paragraph:/^/,heading:/^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/});block.gfm.paragraph=replace(block.paragraph)("(?!","(?!"+block.gfm.fences.source.replace("\\1","\\2")+"|"+block.list.source.replace("\\1","\\3")+"|")();block.tables=merge({},block.gfm,{nptable:/^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,table:/^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/});function Lexer(options){this.tokens=[];this.tokens.links={};this.options=options||marked.defaults;this.rules=block.normal;if(this.options.gfm){if(this.options.tables){this.rules=block.tables}else{this.rules=block.gfm}}}Lexer.rules=block;Lexer.lex=function(src,options){var lexer=new Lexer(options);return lexer.lex(src)};Lexer.prototype.lex=function(src){src=src.replace(/\r\n|\r/g,"\n").replace(/\t/g,"    ").replace(/\u00a0/g," ").replace(/\u2424/g,"\n");return this.token(src,true)};Lexer.prototype.token=function(src,top,bq){var src=src.replace(/^ +$/gm,""),next,loose,cap,bull,b,item,space,i,l;while(src){if(cap=this.rules.newline.exec(src)){src=src.substring(cap[0].length);if(cap[0].length>1){this.tokens.push({type:"space"})}}if(cap=this.rules.code.exec(src)){src=src.substring(cap[0].length);cap=cap[0].replace(/^ {4}/gm,"");this.tokens.push({type:"code",text:!this.options.pedantic?cap.replace(/\n+$/,""):cap});continue}if(cap=this.rules.fences.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"code",lang:cap[2],text:cap[3]||""});continue}if(cap=this.rules.heading.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"heading",depth:cap[1].length,text:cap[2]});continue}if(top&&(cap=this.rules.nptable.exec(src))){src=src.substring(cap[0].length);item={type:"table",header:cap[1].replace(/^ *| *\| *$/g,"").split(/ *\| */),align:cap[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:cap[3].replace(/\n$/,"").split("\n")};for(i=0;i<item.align.length;i++){if(/^ *-+: *$/.test(item.align[i])){item.align[i]="right"}else if(/^ *:-+: *$/.test(item.align[i])){item.align[i]="center"}else if(/^ *:-+ *$/.test(item.align[i])){item.align[i]="left"}else{item.align[i]=null}}for(i=0;i<item.cells.length;i++){item.cells[i]=item.cells[i].split(/ *\| */)}this.tokens.push(item);continue}if(cap=this.rules.lheading.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"heading",depth:cap[2]==="="?1:2,text:cap[1]});continue}if(cap=this.rules.hr.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"hr"});continue}if(cap=this.rules.blockquote.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"blockquote_start"});cap=cap[0].replace(/^ *> ?/gm,"");this.token(cap,top,true);this.tokens.push({type:"blockquote_end"});continue}if(cap=this.rules.list.exec(src)){src=src.substring(cap[0].length);bull=cap[2];this.tokens.push({type:"list_start",ordered:bull.length>1});cap=cap[0].match(this.rules.item);next=false;l=cap.length;i=0;for(;i<l;i++){item=cap[i];space=item.length;item=item.replace(/^ *([*+-]|\d+\.) +/,"");if(~item.indexOf("\n ")){space-=item.length;item=!this.options.pedantic?item.replace(new RegExp("^ {1,"+space+"}","gm"),""):item.replace(/^ {1,4}/gm,"")}if(this.options.smartLists&&i!==l-1){b=block.bullet.exec(cap[i+1])[0];if(bull!==b&&!(bull.length>1&&b.length>1)){src=cap.slice(i+1).join("\n")+src;i=l-1}}loose=next||/\n\n(?!\s*$)/.test(item);if(i!==l-1){next=item.charAt(item.length-1)==="\n";if(!loose)loose=next}this.tokens.push({type:loose?"loose_item_start":"list_item_start"});this.token(item,false,bq);this.tokens.push({type:"list_item_end"})}this.tokens.push({type:"list_end"});continue}if(cap=this.rules.html.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:this.options.sanitize?"paragraph":"html",pre:!this.options.sanitizer&&(cap[1]==="pre"||cap[1]==="script"||cap[1]==="style"),text:cap[0]});continue}if(!bq&&top&&(cap=this.rules.def.exec(src))){src=src.substring(cap[0].length);this.tokens.links[cap[1].toLowerCase()]={href:cap[2],title:cap[3]};continue}if(top&&(cap=this.rules.table.exec(src))){src=src.substring(cap[0].length);item={type:"table",header:cap[1].replace(/^ *| *\| *$/g,"").split(/ *\| */),align:cap[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:cap[3].replace(/(?: *\| *)?\n$/,"").split("\n")};for(i=0;i<item.align.length;i++){if(/^ *-+: *$/.test(item.align[i])){item.align[i]="right"}else if(/^ *:-+: *$/.test(item.align[i])){item.align[i]="center"}else if(/^ *:-+ *$/.test(item.align[i])){item.align[i]="left"}else{item.align[i]=null}}for(i=0;i<item.cells.length;i++){item.cells[i]=item.cells[i].replace(/^ *\| *| *\| *$/g,"").split(/ *\| */)}this.tokens.push(item);continue}if(top&&(cap=this.rules.paragraph.exec(src))){src=src.substring(cap[0].length);this.tokens.push({type:"paragraph",text:cap[1].charAt(cap[1].length-1)==="\n"?cap[1].slice(0,-1):cap[1]});continue}if(cap=this.rules.text.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:"text",text:cap[0]});continue}if(src){throw new Error("Infinite loop on byte: "+src.charCodeAt(0))}}return this.tokens};var inline={escape:/^\\([\\`*{}\[\]()#+\-.!_>])/,autolink:/^<([^ >]+(@|:\/)[^ >]+)>/,url:noop,tag:/^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,link:/^!?\[(inside)\]\(href\)/,reflink:/^!?\[(inside)\]\s*\[([^\]]*)\]/,nolink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,strong:/^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,em:/^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,code:/^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,br:/^ {2,}\n(?!\s*$)/,del:noop,text:/^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/};inline._inside=/(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;inline._href=/\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;inline.link=replace(inline.link)("inside",inline._inside)("href",inline._href)();inline.reflink=replace(inline.reflink)("inside",inline._inside)();inline.normal=merge({},inline);inline.pedantic=merge({},inline.normal,{strong:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,em:/^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/});inline.gfm=merge({},inline.normal,{escape:replace(inline.escape)("])","~|])")(),url:/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,del:/^~~(?=\S)([\s\S]*?\S)~~/,text:replace(inline.text)("]|","~]|")("|","|https?://|")()});inline.breaks=merge({},inline.gfm,{br:replace(inline.br)("{2,}","*")(),text:replace(inline.gfm.text)("{2,}","*")()});function InlineLexer(links,options){this.options=options||marked.defaults;this.links=links;this.rules=inline.normal;this.renderer=this.options.renderer||new Renderer;this.renderer.options=this.options;if(!this.links){throw new Error("Tokens array requires a `links` property.")}if(this.options.gfm){if(this.options.breaks){this.rules=inline.breaks}else{this.rules=inline.gfm}}else if(this.options.pedantic){this.rules=inline.pedantic}}InlineLexer.rules=inline;InlineLexer.output=function(src,links,options){var inline=new InlineLexer(links,options);return inline.output(src)};InlineLexer.prototype.output=function(src){var out="",link,text,href,cap;while(src){if(cap=this.rules.escape.exec(src)){src=src.substring(cap[0].length);out+=cap[1];continue}if(cap=this.rules.autolink.exec(src)){src=src.substring(cap[0].length);if(cap[2]==="@"){text=cap[1].charAt(6)===":"?this.mangle(cap[1].substring(7)):this.mangle(cap[1]);href=this.mangle("mailto:")+text}else{text=escape(cap[1]);href=text}out+=this.renderer.link(href,null,text);continue}if(!this.inLink&&(cap=this.rules.url.exec(src))){src=src.substring(cap[0].length);text=escape(cap[1]);href=text;out+=this.renderer.link(href,null,text);continue}if(cap=this.rules.tag.exec(src)){if(!this.inLink&&/^<a /i.test(cap[0])){this.inLink=true}else if(this.inLink&&/^<\/a>/i.test(cap[0])){this.inLink=false}src=src.substring(cap[0].length);out+=this.options.sanitize?this.options.sanitizer?this.options.sanitizer(cap[0]):escape(cap[0]):cap[0];continue}if(cap=this.rules.link.exec(src)){src=src.substring(cap[0].length);this.inLink=true;out+=this.outputLink(cap,{href:cap[2],title:cap[3]});this.inLink=false;continue}if((cap=this.rules.reflink.exec(src))||(cap=this.rules.nolink.exec(src))){src=src.substring(cap[0].length);link=(cap[2]||cap[1]).replace(/\s+/g," ");link=this.links[link.toLowerCase()];if(!link||!link.href){out+=cap[0].charAt(0);src=cap[0].substring(1)+src;continue}this.inLink=true;out+=this.outputLink(cap,link);this.inLink=false;continue}if(cap=this.rules.strong.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.strong(this.output(cap[2]||cap[1]));continue}if(cap=this.rules.em.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.em(this.output(cap[2]||cap[1]));continue}if(cap=this.rules.code.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.codespan(escape(cap[2],true));continue}if(cap=this.rules.br.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.br();continue}if(cap=this.rules.del.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.del(this.output(cap[1]));continue}if(cap=this.rules.text.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.text(escape(this.smartypants(cap[0])));continue}if(src){throw new Error("Infinite loop on byte: "+src.charCodeAt(0))}}return out};InlineLexer.prototype.outputLink=function(cap,link){var href=escape(link.href),title=link.title?escape(link.title):null;return cap[0].charAt(0)!=="!"?this.renderer.link(href,title,this.output(cap[1])):this.renderer.image(href,title,escape(cap[1]))};InlineLexer.prototype.smartypants=function(text){if(!this.options.smartypants)return text;return text.replace(/---/g,"—").replace(/--/g,"–").replace(/(^|[-\u2014\/(\[{"\s])'/g,"$1‘").replace(/'/g,"’").replace(/(^|[-\u2014\/(\[{\u2018\s])"/g,"$1“").replace(/"/g,"”").replace(/\.{3}/g,"…")};InlineLexer.prototype.mangle=function(text){if(!this.options.mangle)return text;var out="",l=text.length,i=0,ch;for(;i<l;i++){ch=text.charCodeAt(i);if(Math.random()>.5){ch="x"+ch.toString(16)}out+="&#"+ch+";"}return out};function Renderer(options){this.options=options||{}}Renderer.prototype.code=function(code,lang,escaped){if(this.options.highlight){var out=this.options.highlight(code,lang);if(out!=null&&out!==code){escaped=true;code=out}}if(!lang){return"<pre><code>"+(escaped?code:escape(code,true))+"\n</code></pre>"}return'<pre><code class="'+this.options.langPrefix+escape(lang,true)+'">'+(escaped?code:escape(code,true))+"\n</code></pre>\n"};Renderer.prototype.blockquote=function(quote){return"<blockquote>\n"+quote+"</blockquote>\n"};Renderer.prototype.html=function(html){return html};Renderer.prototype.heading=function(text,level,raw){return"<h"+level+' id="'+this.options.headerPrefix+raw.toLowerCase().replace(/[^\w]+/g,"-")+'">'+text+"</h"+level+">\n"};Renderer.prototype.hr=function(){return this.options.xhtml?"<hr/>\n":"<hr>\n"};Renderer.prototype.list=function(body,ordered){var type=ordered?"ol":"ul";return"<"+type+">\n"+body+"</"+type+">\n"};Renderer.prototype.listitem=function(text){return"<li>"+text+"</li>\n"};Renderer.prototype.paragraph=function(text){return"<p>"+text+"</p>\n"};Renderer.prototype.table=function(header,body){return"<table>\n"+"<thead>\n"+header+"</thead>\n"+"<tbody>\n"+body+"</tbody>\n"+"</table>\n"};Renderer.prototype.tablerow=function(content){return"<tr>\n"+content+"</tr>\n"};Renderer.prototype.tablecell=function(content,flags){var type=flags.header?"th":"td";var tag=flags.align?"<"+type+' style="text-align:'+flags.align+'">':"<"+type+">";return tag+content+"</"+type+">\n"};Renderer.prototype.strong=function(text){return"<strong>"+text+"</strong>"};Renderer.prototype.em=function(text){return"<em>"+text+"</em>"};Renderer.prototype.codespan=function(text){return"<code>"+text+"</code>"};Renderer.prototype.br=function(){return this.options.xhtml?"<br/>":"<br>"};Renderer.prototype.del=function(text){return"<del>"+text+"</del>"};Renderer.prototype.link=function(href,title,text){if(this.options.sanitize){try{var prot=decodeURIComponent(unescape(href)).replace(/[^\w:]/g,"").toLowerCase()}catch(e){return""}if(prot.indexOf("javascript:")===0||prot.indexOf("vbscript:")===0||prot.indexOf("data:")===0){return""}}var out='<a href="'+href+'"';if(title){out+=' title="'+title+'"'}out+=">"+text+"</a>";return out};Renderer.prototype.image=function(href,title,text){var out='<img src="'+href+'" alt="'+text+'"';if(title){out+=' title="'+title+'"'}out+=this.options.xhtml?"/>":">";return out};Renderer.prototype.text=function(text){return text};function Parser(options){this.tokens=[];this.token=null;this.options=options||marked.defaults;this.options.renderer=this.options.renderer||new Renderer;this.renderer=this.options.renderer;this.renderer.options=this.options}Parser.parse=function(src,options,renderer){var parser=new Parser(options,renderer);return parser.parse(src)};Parser.prototype.parse=function(src){this.inline=new InlineLexer(src.links,this.options,this.renderer);this.tokens=src.reverse();var out="";while(this.next()){out+=this.tok()}return out};Parser.prototype.next=function(){return this.token=this.tokens.pop()};Parser.prototype.peek=function(){return this.tokens[this.tokens.length-1]||0};Parser.prototype.parseText=function(){var body=this.token.text;while(this.peek().type==="text"){body+="\n"+this.next().text}return this.inline.output(body)};Parser.prototype.tok=function(){switch(this.token.type){case"space":{return""}case"hr":{return this.renderer.hr()}case"heading":{return this.renderer.heading(this.inline.output(this.token.text),this.token.depth,this.token.text)}case"code":{return this.renderer.code(this.token.text,this.token.lang,this.token.escaped)}case"table":{var header="",body="",i,row,cell,flags,j;cell="";for(i=0;i<this.token.header.length;i++){flags={header:true,align:this.token.align[i]};cell+=this.renderer.tablecell(this.inline.output(this.token.header[i]),{header:true,align:this.token.align[i]})}header+=this.renderer.tablerow(cell);for(i=0;i<this.token.cells.length;i++){row=this.token.cells[i];cell="";for(j=0;j<row.length;j++){cell+=this.renderer.tablecell(this.inline.output(row[j]),{header:false,align:this.token.align[j]})}body+=this.renderer.tablerow(cell)}return this.renderer.table(header,body)}case"blockquote_start":{var body="";while(this.next().type!=="blockquote_end"){body+=this.tok()}return this.renderer.blockquote(body)}case"list_start":{var body="",ordered=this.token.ordered;while(this.next().type!=="list_end"){body+=this.tok()}return this.renderer.list(body,ordered)}case"list_item_start":{var body="";while(this.next().type!=="list_item_end"){body+=this.token.type==="text"?this.parseText():this.tok()}return this.renderer.listitem(body)}case"loose_item_start":{var body="";while(this.next().type!=="list_item_end"){body+=this.tok()}return this.renderer.listitem(body)}case"html":{var html=!this.token.pre&&!this.options.pedantic?this.inline.output(this.token.text):this.token.text;return this.renderer.html(html)}case"paragraph":{return this.renderer.paragraph(this.inline.output(this.token.text))}case"text":{return this.renderer.paragraph(this.parseText())}}};function escape(html,encode){return html.replace(!encode?/&(?!#?\w+;)/g:/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function unescape(html){return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g,function(_,n){n=n.toLowerCase();if(n==="colon")return":";if(n.charAt(0)==="#"){return n.charAt(1)==="x"?String.fromCharCode(parseInt(n.substring(2),16)):String.fromCharCode(+n.substring(1))}return""})}function replace(regex,opt){regex=regex.source;opt=opt||"";return function self(name,val){if(!name)return new RegExp(regex,opt);val=val.source||val;val=val.replace(/(^|[^\[])\^/g,"$1");regex=regex.replace(name,val);return self}}function noop(){}noop.exec=noop;function merge(obj){var i=1,target,key;for(;i<arguments.length;i++){target=arguments[i];for(key in target){if(Object.prototype.hasOwnProperty.call(target,key)){obj[key]=target[key]}}}return obj}function marked(src,opt,callback){if(callback||typeof opt==="function"){if(!callback){callback=opt;opt=null}opt=merge({},marked.defaults,opt||{});var highlight=opt.highlight,tokens,pending,i=0;try{tokens=Lexer.lex(src,opt)}catch(e){return callback(e)}pending=tokens.length;var done=function(err){if(err){opt.highlight=highlight;return callback(err)}var out;try{out=Parser.parse(tokens,opt)}catch(e){err=e}opt.highlight=highlight;return err?callback(err):callback(null,out)};if(!highlight||highlight.length<3){return done()}delete opt.highlight;if(!pending)return done();for(;i<tokens.length;i++){(function(token){if(token.type!=="code"){return--pending||done()}return highlight(token.text,token.lang,function(err,code){if(err)return done(err);if(code==null||code===token.text){return--pending||done()}token.text=code;token.escaped=true;--pending||done()})})(tokens[i])}return}try{if(opt)opt=merge({},marked.defaults,opt);return Parser.parse(Lexer.lex(src,opt),opt)}catch(e){e.message+="\nPlease report this to https://github.com/chjj/marked.";if((opt||marked.defaults).silent){return"<p>An error occured:</p><pre>"+escape(e.message+"",true)+"</pre>"}throw e}}marked.options=marked.setOptions=function(opt){merge(marked.defaults,opt);return marked};marked.defaults={gfm:true,tables:true,breaks:false,pedantic:false,sanitize:false,sanitizer:null,mangle:true,smartLists:false,silent:false,highlight:null,langPrefix:"lang-",smartypants:false,headerPrefix:"",renderer:new Renderer,xhtml:false};marked.Parser=Parser;marked.parser=Parser.parse;marked.Renderer=Renderer;marked.Lexer=Lexer;marked.lexer=Lexer.lex;marked.InlineLexer=InlineLexer;marked.inlineLexer=InlineLexer.output;marked.parse=marked;if(typeof module!=="undefined"&&typeof exports==="object"){module.exports=marked}else if(typeof define==="function"&&define.amd){define(function(){return marked})}else{this.marked=marked}}).call(function(){return this||(typeof window!=="undefined"?window:global)}());

	return module.exports;
}();


// FORMAT OPTIONS FOR MARKED IMPLEMENTATION

function formatOptions(options)
{
	function toHighlight(code, lang)
	{
		if (!lang && options.defaultHighlighting.ctor === 'Just')
		{
			lang = options.defaultHighlighting._0;
		}

		if (typeof hljs !== 'undefined' && lang && hljs.listLanguages().indexOf(lang) >= 0)
		{
			return hljs.highlight(lang, code, true).value;
		}

		return code;
	}

	var gfm = options.githubFlavored;
	if (gfm.ctor === 'Just')
	{
		return {
			highlight: toHighlight,
			gfm: true,
			tables: gfm._0.tables,
			breaks: gfm._0.breaks,
			sanitize: options.sanitize,
			smartypants: options.smartypants
		};
	}

	return {
		highlight: toHighlight,
		gfm: false,
		tables: false,
		breaks: false,
		sanitize: options.sanitize,
		smartypants: options.smartypants
	};
}


// EXPORTS

return {
	toHtml: F3(toHtml)
};

}();

var _evancz$elm_markdown$Markdown$toHtmlWith = _evancz$elm_markdown$Native_Markdown.toHtml;
var _evancz$elm_markdown$Markdown$defaultOptions = {
	githubFlavored: _elm_lang$core$Maybe$Just(
		{tables: false, breaks: false}),
	defaultHighlighting: _elm_lang$core$Maybe$Nothing,
	sanitize: false,
	smartypants: false
};
var _evancz$elm_markdown$Markdown$toHtml = F2(
	function (attrs, string) {
		return A3(_evancz$elm_markdown$Native_Markdown.toHtml, _evancz$elm_markdown$Markdown$defaultOptions, attrs, string);
	});
var _evancz$elm_markdown$Markdown$Options = F4(
	function (a, b, c, d) {
		return {githubFlavored: a, defaultHighlighting: b, sanitize: c, smartypants: d};
	});

var _mgold$elm_animation$Animation$isStatic = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$core$Native_Utils.eq(_p1._0.from, _p1._0.to);
};
var _mgold$elm_animation$Animation$isScheduled = F2(
	function (t, _p2) {
		var _p3 = _p2;
		return (_elm_lang$core$Native_Utils.cmp(t, _p3._0.start + _p3._0.delay) < 1) && (!_mgold$elm_animation$Animation$isStatic(_p3));
	});
var _mgold$elm_animation$Animation$getTo = function (_p4) {
	var _p5 = _p4;
	return _p5._0.to;
};
var _mgold$elm_animation$Animation$getFrom = function (_p6) {
	var _p7 = _p6;
	return _p7._0.from;
};
var _mgold$elm_animation$Animation$getEase = function (_p8) {
	var _p9 = _p8;
	return _p9._0.ease;
};
var _mgold$elm_animation$Animation$getDelay = function (_p10) {
	var _p11 = _p10;
	return _p11._0.delay;
};
var _mgold$elm_animation$Animation$getStart = function (_p12) {
	var _p13 = _p12;
	return _p13._0.start;
};
var _mgold$elm_animation$Animation$timeElapsed = F2(
	function (t, _p14) {
		var _p15 = _p14;
		return A2(_elm_lang$core$Basics$max, 0, t - (_p15._0.start + _p15._0.delay));
	});
var _mgold$elm_animation$Animation$defaultEase = function (x) {
	return (1 - _elm_lang$core$Basics$cos(_elm_lang$core$Basics$pi * x)) / 2;
};
var _mgold$elm_animation$Animation$spd = F3(
	function (dos, from, to) {
		var _p16 = dos;
		if (_p16.ctor === 'Duration') {
			return _elm_lang$core$Basics$abs(to - from) / _p16._0;
		} else {
			return _p16._0;
		}
	});
var _mgold$elm_animation$Animation$getSpeed = function (_p17) {
	var _p18 = _p17;
	return A3(_mgold$elm_animation$Animation$spd, _p18._0.dos, _p18._0.from, _p18._0.to);
};
var _mgold$elm_animation$Animation$dur = F3(
	function (dos, from, to) {
		var _p19 = dos;
		if (_p19.ctor === 'Duration') {
			return _p19._0;
		} else {
			return _elm_lang$core$Basics$abs(to - from) / _p19._0;
		}
	});
var _mgold$elm_animation$Animation$animate = F2(
	function (t, _p20) {
		var _p21 = _p20;
		var _p25 = _p21._0.to;
		var _p24 = _p21._0.start;
		var _p23 = _p21._0.from;
		var duration = A3(_mgold$elm_animation$Animation$dur, _p21._0.dos, _p23, _p25);
		var fr = A3(_elm_lang$core$Basics$clamp, 0, 1, ((t - _p24) - _p21._0.delay) / duration);
		var eased = _p21._0.ease(fr);
		var correction = function () {
			var _p22 = _p21._0.ramp;
			if (_p22.ctor === 'Nothing') {
				return 0;
			} else {
				var from_ = _p22._0 * (t - _p24);
				var eased_ = _mgold$elm_animation$Animation$defaultEase(fr);
				return from_ - (from_ * eased_);
			}
		}();
		return (_p23 + ((_p25 - _p23) * eased)) + correction;
	});
var _mgold$elm_animation$Animation$velocity = F2(
	function (t, u) {
		var forwDiff = A2(_mgold$elm_animation$Animation$animate, t + 10, u);
		var backDiff = A2(_mgold$elm_animation$Animation$animate, t - 10, u);
		return (forwDiff - backDiff) / 20;
	});
var _mgold$elm_animation$Animation$timeRemaining = F2(
	function (t, _p26) {
		var _p27 = _p26;
		var duration = A3(_mgold$elm_animation$Animation$dur, _p27._0.dos, _p27._0.from, _p27._0.to);
		return A2(_elm_lang$core$Basics$max, 0, ((_p27._0.start + _p27._0.delay) + duration) - t);
	});
var _mgold$elm_animation$Animation$getDuration = function (_p28) {
	var _p29 = _p28;
	return A3(_mgold$elm_animation$Animation$dur, _p29._0.dos, _p29._0.from, _p29._0.to);
};
var _mgold$elm_animation$Animation$equals = F2(
	function (_p31, _p30) {
		var _p32 = _p31;
		var _p35 = _p32._0;
		var _p33 = _p30;
		var _p34 = _p33._0;
		return _elm_lang$core$Native_Utils.eq(_p35.start + _p35.delay, _p34.start + _p34.delay) && (_elm_lang$core$Native_Utils.eq(_p35.from, _p34.from) && (_elm_lang$core$Native_Utils.eq(_p35.to, _p34.to) && (_elm_lang$core$Native_Utils.eq(_p35.ramp, _p34.ramp) && ((_elm_lang$core$Native_Utils.eq(_p35.dos, _p34.dos) || (_elm_lang$core$Native_Utils.cmp(
			1.0e-3,
			_elm_lang$core$Basics$abs(
				A3(_mgold$elm_animation$Animation$dur, _p35.dos, _p35.from, _p35.to) - A3(_mgold$elm_animation$Animation$dur, _p34.dos, _p34.from, _p34.to))) > -1)) && A2(
			_elm_lang$core$List$all,
			function (t) {
				return _elm_lang$core$Native_Utils.eq(
					_p35.ease(t),
					_p34.ease(t));
			},
			{
				ctor: '::',
				_0: 0.1,
				_1: {
					ctor: '::',
					_0: 0.3,
					_1: {
						ctor: '::',
						_0: 0.7,
						_1: {
							ctor: '::',
							_0: 0.9,
							_1: {ctor: '[]'}
						}
					}
				}
			})))));
	});
var _mgold$elm_animation$Animation$isRunning = F2(
	function (t, _p36) {
		var _p37 = _p36;
		var _p39 = _p37._0.start;
		var _p38 = _p37._0.delay;
		var duration = A3(_mgold$elm_animation$Animation$dur, _p37._0.dos, _p37._0.from, _p37._0.to);
		return (_elm_lang$core$Native_Utils.cmp(t, _p39 + _p38) > 0) && ((_elm_lang$core$Native_Utils.cmp(t, (_p39 + _p38) + duration) < 0) && (!_mgold$elm_animation$Animation$isStatic(_p37)));
	});
var _mgold$elm_animation$Animation$isDone = F2(
	function (t, _p40) {
		var _p41 = _p40;
		var duration = A3(_mgold$elm_animation$Animation$dur, _p41._0.dos, _p41._0.from, _p41._0.to);
		return _mgold$elm_animation$Animation$isStatic(_p41) || (_elm_lang$core$Native_Utils.cmp(t, (_p41._0.start + _p41._0.delay) + duration) > -1);
	});
var _mgold$elm_animation$Animation$AnimRecord = F7(
	function (a, b, c, d, e, f, g) {
		return {start: a, delay: b, dos: c, ramp: d, ease: e, from: f, to: g};
	});
var _mgold$elm_animation$Animation$Speed = function (a) {
	return {ctor: 'Speed', _0: a};
};
var _mgold$elm_animation$Animation$Duration = function (a) {
	return {ctor: 'Duration', _0: a};
};
var _mgold$elm_animation$Animation$defaultDuration = _mgold$elm_animation$Animation$Duration(750 * _elm_lang$core$Time$millisecond);
var _mgold$elm_animation$Animation$A = function (a) {
	return {ctor: 'A', _0: a};
};
var _mgold$elm_animation$Animation$animation = function (t) {
	return _mgold$elm_animation$Animation$A(
		A7(_mgold$elm_animation$Animation$AnimRecord, t, 0, _mgold$elm_animation$Animation$defaultDuration, _elm_lang$core$Maybe$Nothing, _mgold$elm_animation$Animation$defaultEase, 0, 1));
};
var _mgold$elm_animation$Animation$static = function (x) {
	return _mgold$elm_animation$Animation$A(
		A7(_mgold$elm_animation$Animation$AnimRecord, 0, 0, _mgold$elm_animation$Animation$defaultDuration, _elm_lang$core$Maybe$Nothing, _mgold$elm_animation$Animation$defaultEase, x, x));
};
var _mgold$elm_animation$Animation$undo = F2(
	function (t, _p42) {
		var _p43 = _p42;
		var _p44 = _p43._0;
		return _mgold$elm_animation$Animation$A(
			_elm_lang$core$Native_Utils.update(
				_p44,
				{
					from: _p44.to,
					to: _p44.from,
					start: t,
					delay: 0 - A2(_mgold$elm_animation$Animation$timeRemaining, t, _p43),
					ramp: _elm_lang$core$Maybe$Nothing,
					ease: function (t) {
						return 1 - _p44.ease(1 - t);
					}
				}));
	});
var _mgold$elm_animation$Animation$retarget = F3(
	function (t, newTo, _p45) {
		var _p46 = _p45;
		var _p49 = _p46;
		var _p48 = _p46._0;
		if (_elm_lang$core$Native_Utils.eq(newTo, _p48.to)) {
			return _p49;
		} else {
			if (_mgold$elm_animation$Animation$isStatic(_p49)) {
				return _mgold$elm_animation$Animation$A(
					_elm_lang$core$Native_Utils.update(
						_p48,
						{start: t, to: newTo, ramp: _elm_lang$core$Maybe$Nothing}));
			} else {
				if (A2(_mgold$elm_animation$Animation$isScheduled, t, _p49)) {
					return _mgold$elm_animation$Animation$A(
						_elm_lang$core$Native_Utils.update(
							_p48,
							{to: newTo, ramp: _elm_lang$core$Maybe$Nothing}));
				} else {
					if (A2(_mgold$elm_animation$Animation$isDone, t, _p49)) {
						return _mgold$elm_animation$Animation$A(
							_elm_lang$core$Native_Utils.update(
								_p48,
								{start: t, delay: 0, from: _p48.to, to: newTo, ramp: _elm_lang$core$Maybe$Nothing}));
					} else {
						var newSpeed = function () {
							var _p47 = _p48.dos;
							if (_p47.ctor === 'Speed') {
								return _p48.dos;
							} else {
								return _mgold$elm_animation$Animation$Speed(
									A3(_mgold$elm_animation$Animation$spd, _p48.dos, _p48.from, _p48.to));
							}
						}();
						var pos = A2(_mgold$elm_animation$Animation$animate, t, _p49);
						var vel = A2(_mgold$elm_animation$Animation$velocity, t, _p49);
						return _mgold$elm_animation$Animation$A(
							A7(
								_mgold$elm_animation$Animation$AnimRecord,
								t,
								0,
								newSpeed,
								_elm_lang$core$Maybe$Just(vel),
								_p48.ease,
								pos,
								newTo));
					}
				}
			}
		}
	});
var _mgold$elm_animation$Animation$duration = F2(
	function (x, _p50) {
		var _p51 = _p50;
		return _mgold$elm_animation$Animation$A(
			_elm_lang$core$Native_Utils.update(
				_p51._0,
				{
					dos: _mgold$elm_animation$Animation$Duration(x)
				}));
	});
var _mgold$elm_animation$Animation$speed = F2(
	function (x, _p52) {
		var _p53 = _p52;
		return _mgold$elm_animation$Animation$A(
			_elm_lang$core$Native_Utils.update(
				_p53._0,
				{
					dos: _mgold$elm_animation$Animation$Speed(
						_elm_lang$core$Basics$abs(x))
				}));
	});
var _mgold$elm_animation$Animation$delay = F2(
	function (x, _p54) {
		var _p55 = _p54;
		return _mgold$elm_animation$Animation$A(
			_elm_lang$core$Native_Utils.update(
				_p55._0,
				{delay: x}));
	});
var _mgold$elm_animation$Animation$ease = F2(
	function (x, _p56) {
		var _p57 = _p56;
		return _mgold$elm_animation$Animation$A(
			_elm_lang$core$Native_Utils.update(
				_p57._0,
				{ease: x}));
	});
var _mgold$elm_animation$Animation$from = F2(
	function (x, _p58) {
		var _p59 = _p58;
		return _mgold$elm_animation$Animation$A(
			_elm_lang$core$Native_Utils.update(
				_p59._0,
				{from: x, ramp: _elm_lang$core$Maybe$Nothing}));
	});
var _mgold$elm_animation$Animation$to = F2(
	function (x, _p60) {
		var _p61 = _p60;
		return _mgold$elm_animation$Animation$A(
			_elm_lang$core$Native_Utils.update(
				_p61._0,
				{to: x, ramp: _elm_lang$core$Maybe$Nothing}));
	});

var _user$project$AbstractDigraph$turnVerticesIntoString = function (g) {
	return {
		vertexList: A2(_elm_lang$core$List$map, _elm_lang$core$Basics$toString, g.vertexList),
		edgeList: A2(
			_elm_lang$core$List$map,
			function (_p0) {
				var _p1 = _p0;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Basics$toString(_p1._0),
					_1: _elm_lang$core$Basics$toString(_p1._1)
				};
			},
			g.edgeList)
	};
};
var _user$project$AbstractDigraph$AbstractDigraph = F2(
	function (a, b) {
		return {vertexList: a, edgeList: b};
	});

var _user$project$BasicGeometry$applyCircularCoords = F2(
	function (_p0, objectList) {
		var _p1 = _p0;
		var _p2 = _p1.center;
		var n = _elm_lang$core$List$length(objectList);
		var circumference = _elm_lang$core$Basics$toFloat(n) * (20 + _p1.maxObjectRadius);
		var circleRadius = circumference / (2 * _elm_lang$core$Basics$pi);
		var posOf = function (i) {
			var angle = ((_elm_lang$core$Basics$toFloat(i) * 2) * _elm_lang$core$Basics$pi) / _elm_lang$core$Basics$toFloat(n);
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Tuple$first(_p2) + (circleRadius * _elm_lang$core$Basics$sin(angle)),
				_1: _elm_lang$core$Tuple$second(_p2) + (circleRadius * _elm_lang$core$Basics$cos(angle))
			};
		};
		return A2(
			_elm_lang$core$List$indexedMap,
			F2(
				function (i, o) {
					return _elm_lang$core$Native_Utils.update(
						o,
						{
							position: posOf(i)
						});
				}),
			objectList);
	});
var _user$project$BasicGeometry$inRect = F2(
	function (_p4, _p3) {
		var _p5 = _p4;
		var _p6 = _p3;
		var _p9 = _p6._1;
		var _p8 = _p6._0;
		var _p7 = _p5._0.position;
		var x = _p7._0;
		var y = _p7._1;
		return A2(
			_elm_lang$core$List$all,
			_elm_lang$core$Basics$identity,
			{
				ctor: '::',
				_0: (_elm_lang$core$Native_Utils.cmp(_p8, x) > 0) && (_elm_lang$core$Native_Utils.cmp(_p8, x + _p5._0.width) < 0),
				_1: {
					ctor: '::',
					_0: (_elm_lang$core$Native_Utils.cmp(_p9, y) > 0) && (_elm_lang$core$Native_Utils.cmp(_p9, y + _p5._0.height) < 0),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$BasicGeometry$scalarMult = F2(
	function (k, _p10) {
		var _p11 = _p10;
		return {ctor: '_Tuple2', _0: k * _p11._0, _1: k * _p11._1};
	});
var _user$project$BasicGeometry$length = function (_p12) {
	var _p13 = _p12;
	return _elm_lang$core$Basics$sqrt(
		Math.pow(_p13._0, 2) + Math.pow(_p13._1, 2));
};
var _user$project$BasicGeometry$normalize = function (vec) {
	return A2(
		_user$project$BasicGeometry$scalarMult,
		1 / _user$project$BasicGeometry$length(vec),
		vec);
};
var _user$project$BasicGeometry$add = F2(
	function (_p15, _p14) {
		var _p16 = _p15;
		var _p17 = _p14;
		return {ctor: '_Tuple2', _0: _p16._0 + _p17._0, _1: _p16._1 + _p17._1};
	});
var _user$project$BasicGeometry$middlePoint = F2(
	function (v, w) {
		return A2(
			_user$project$BasicGeometry$scalarMult,
			0.5,
			A2(_user$project$BasicGeometry$add, v, w));
	});
var _user$project$BasicGeometry$intersect = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		var _p23 = _p21._1._1;
		var _p22 = _p21._1._0;
		var denominatorOfA = (_p20._1._0 * _p23) - (_p20._1._1 * _p22);
		var nominatorOfA = (_p22 * (_p20._0._1 - _p21._0._1)) + (_p23 * (_p21._0._0 - _p20._0._0));
		return _elm_lang$core$Native_Utils.eq(denominatorOfA, 0) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
			A2(
				_user$project$BasicGeometry$add,
				_p20._0,
				A2(_user$project$BasicGeometry$scalarMult, nominatorOfA / denominatorOfA, _p20._1)));
	});
var _user$project$BasicGeometry$gravityCenter = function (l) {
	return _elm_lang$core$List$isEmpty(l) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
		A2(
			_user$project$BasicGeometry$scalarMult,
			1 / _elm_lang$core$Basics$toFloat(
				_elm_lang$core$List$length(l)),
			A3(
				_elm_lang$core$List$foldr,
				_user$project$BasicGeometry$add,
				{ctor: '_Tuple2', _0: 0, _1: 0},
				l)));
};
var _user$project$BasicGeometry$diff = F2(
	function (_p25, _p24) {
		var _p26 = _p25;
		var _p27 = _p24;
		return {ctor: '_Tuple2', _0: _p26._0 - _p27._0, _1: _p26._1 - _p27._1};
	});
var _user$project$BasicGeometry$distance = F2(
	function (v, w) {
		return _user$project$BasicGeometry$length(
			A2(_user$project$BasicGeometry$diff, v, w));
	});
var _user$project$BasicGeometry$findAllInRadius = function (_p28) {
	var _p29 = _p28;
	var isNearEnough = function (v) {
		return _elm_lang$core$Native_Utils.cmp(
			A2(_user$project$BasicGeometry$distance, v, _p29.center),
			_p29.radius) < 1;
	};
	return A2(_elm_lang$core$List$filter, isNearEnough, _p29.points);
};
var _user$project$BasicGeometry$dotProd = F2(
	function (_p31, _p30) {
		var _p32 = _p31;
		var _p33 = _p30;
		return (_p32._0 * _p33._0) + (_p32._1 * _p33._1);
	});
var _user$project$BasicGeometry$mult = F2(
	function (_p34, vec) {
		var _p35 = _p34;
		return {
			ctor: '_Tuple2',
			_0: A2(_user$project$BasicGeometry$dotProd, _p35._0, vec),
			_1: A2(_user$project$BasicGeometry$dotProd, _p35._1, vec)
		};
	});
var _user$project$BasicGeometry$rotationMatrix = function (alpha) {
	var cosa = _elm_lang$core$Basics$cos(alpha);
	var sina = _elm_lang$core$Basics$sin(alpha);
	return {
		ctor: '_Tuple2',
		_0: {ctor: '_Tuple2', _0: cosa, _1: 0 - sina},
		_1: {ctor: '_Tuple2', _0: sina, _1: cosa}
	};
};
var _user$project$BasicGeometry$rotateBy = function (_p36) {
	return _user$project$BasicGeometry$mult(
		_user$project$BasicGeometry$rotationMatrix(
			_elm_lang$core$Basics$degrees(_p36)));
};
var _user$project$BasicGeometry$toPoint = function (_p37) {
	var _p38 = _p37;
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Basics$toFloat(_p38.x),
		_1: _elm_lang$core$Basics$toFloat(_p38.y)
	};
};
var _user$project$BasicGeometry$Position = F2(
	function (a, b) {
		return {x: a, y: b};
	});
var _user$project$BasicGeometry$Circle = F2(
	function (a, b) {
		return {ctor: 'Circle', _0: a, _1: b};
	});
var _user$project$BasicGeometry$Line = F2(
	function (a, b) {
		return {ctor: 'Line', _0: a, _1: b};
	});
var _user$project$BasicGeometry$middleOrthogonal = F2(
	function (p, q) {
		return _elm_lang$core$Native_Utils.eq(p, q) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
			A2(
				_user$project$BasicGeometry$Line,
				A2(_user$project$BasicGeometry$middlePoint, p, q),
				A2(
					_user$project$BasicGeometry$rotateBy,
					90,
					A2(_user$project$BasicGeometry$diff, p, q))));
	});
var _user$project$BasicGeometry$findCircle = F3(
	function (p, q, r) {
		var maybeCenter = A2(
			_elm_lang$core$Maybe$withDefault,
			_elm_lang$core$Maybe$Nothing,
			A3(
				_elm_lang$core$Maybe$map2,
				_user$project$BasicGeometry$intersect,
				A2(_user$project$BasicGeometry$middleOrthogonal, p, q),
				A2(_user$project$BasicGeometry$middleOrthogonal, q, r)));
		var _p39 = maybeCenter;
		if (_p39.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var _p40 = _p39._0;
			var radius = _user$project$BasicGeometry$length(
				A2(_user$project$BasicGeometry$diff, p, _p40));
			return _elm_lang$core$Maybe$Just(
				A2(_user$project$BasicGeometry$Circle, _p40, radius));
		}
	});
var _user$project$BasicGeometry$Rect = function (a) {
	return {ctor: 'Rect', _0: a};
};
var _user$project$BasicGeometry$findRect = F2(
	function (_p42, _p41) {
		var _p43 = _p42;
		var _p48 = _p43._1;
		var _p47 = _p43._0;
		var _p44 = _p41;
		var _p46 = _p44._1;
		var _p45 = _p44._0;
		return _user$project$BasicGeometry$Rect(
			{
				position: {
					ctor: '_Tuple2',
					_0: A2(_elm_lang$core$Basics$min, _p47, _p45),
					_1: A2(_elm_lang$core$Basics$min, _p48, _p46)
				},
				width: _elm_lang$core$Basics$abs(_p47 - _p45),
				height: _elm_lang$core$Basics$abs(_p48 - _p46)
			});
	});

var _user$project$ConvexHull$clockwise = F3(
	function (o, a, b) {
		var sub = F2(
			function (_p1, _p0) {
				var _p2 = _p1;
				var _p3 = _p0;
				return {ctor: '_Tuple2', _0: _p2._0 - _p3._0, _1: _p2._1 - _p3._1};
			});
		var cross = F2(
			function (_p5, _p4) {
				var _p6 = _p5;
				var _p7 = _p4;
				return (_p6._0 * _p7._1) - (_p7._0 * _p6._1);
			});
		return _elm_lang$core$Native_Utils.cmp(
			A2(
				cross,
				A2(sub, a, o),
				A2(sub, b, o)),
			0) < 1;
	});
var _user$project$ConvexHull$chain = function () {
	var go = F2(
		function (acc, l) {
			go:
			while (true) {
				var _p8 = {ctor: '_Tuple2', _0: acc, _1: l};
				if (_p8._1.ctor === '::') {
					if ((_p8._0.ctor === '::') && (_p8._0._1.ctor === '::')) {
						var _p11 = _p8._1._1;
						var _p10 = _p8._1._0;
						var _p9 = _p8._0._1._0;
						if (A3(_user$project$ConvexHull$clockwise, _p9, _p8._0._0, _p10)) {
							var _v5 = {ctor: '::', _0: _p9, _1: _p8._0._1._1},
								_v6 = {ctor: '::', _0: _p10, _1: _p11};
							acc = _v5;
							l = _v6;
							continue go;
						} else {
							var _v7 = {ctor: '::', _0: _p10, _1: acc},
								_v8 = _p11;
							acc = _v7;
							l = _v8;
							continue go;
						}
					} else {
						var _v9 = {ctor: '::', _0: _p8._1._0, _1: _p8._0},
							_v10 = _p8._1._1;
						acc = _v9;
						l = _v10;
						continue go;
					}
				} else {
					return _elm_lang$core$List$reverse(
						A2(
							_elm_lang$core$Maybe$withDefault,
							{ctor: '[]'},
							_elm_lang$core$List$tail(_p8._0)));
				}
			}
		});
	return go(
		{ctor: '[]'});
}();
var _user$project$ConvexHull$convexHull = function (points) {
	if (_elm_lang$core$Native_Utils.cmp(
		_elm_lang$core$List$length(points),
		1) < 1) {
		return points;
	} else {
		var sorted = A2(_elm_lang$core$List$sortBy, _elm_lang$core$Tuple$first, points);
		var lower = _user$project$ConvexHull$chain(sorted);
		var upper = _user$project$ConvexHull$chain(
			_elm_lang$core$List$reverse(sorted));
		return _elm_lang$core$List$concat(
			{
				ctor: '::',
				_0: lower,
				_1: {
					ctor: '::',
					_0: upper,
					_1: {ctor: '[]'}
				}
			});
	}
};

var _user$project$CssHelpers$unselectable = {
	ctor: '::',
	_0: {ctor: '_Tuple2', _0: '-webkit-user-select', _1: 'none'},
	_1: {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: '-moz-user-select', _1: 'none'},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: '-ms-user-select', _1: 'none'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'user-select', _1: 'none'},
				_1: {ctor: '[]'}
			}
		}
	}
};

var _user$project$SvgHelpers$makeArrowHead = function (_p0) {
	var _p1 = _p0;
	var _p2 = {ctor: '_Tuple2', _0: _p1.sourcePos, _1: _p1.targetPos};
	var sx = _p2._0._0;
	var sy = _p2._0._1;
	var tx = _p2._1._0;
	var ty = _p2._1._1;
	var _p3 = {ctor: '_Tuple2', _0: tx - sx, _1: ty - sy};
	var dx = _p3._0;
	var dy = _p3._1;
	var dist = _elm_lang$core$Basics$sqrt((dx * dx) + (dy * dy));
	var rdd = _p1.targetRadius / A2(_elm_lang$core$Basics$max, dist, 1.0e-5);
	var angleAsRadiant = A2(_elm_lang$core$Basics$atan2, dy, dx);
	var angleAsDegree = (360 * angleAsRadiant) / (2 * _elm_lang$core$Basics$pi);
	var rotate = A2(
		_elm_lang$core$Basics_ops['++'],
		'rotate(',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(angleAsDegree),
			')'));
	var _p4 = {ctor: '_Tuple2', _0: tx - (rdd * dx), _1: ty - (rdd * dy)};
	var trx = _p4._0;
	var $try = _p4._1;
	var translate = A2(
		_elm_lang$core$Basics_ops['++'],
		'translate(',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(trx),
			A2(
				_elm_lang$core$Basics_ops['++'],
				',',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString($try),
					')'))));
	return A2(
		_elm_lang$svg$Svg$path,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$d('M0 0 L-10 -4 L-10 4 Z'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$transform(
					A2(_elm_lang$core$Basics_ops['++'], translate, rotate)),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$fill(_p1.color),
					_1: {ctor: '[]'}
				}
			}
		},
		{ctor: '[]'});
};
var _user$project$SvgHelpers$quadraticBezier = F3(
	function (start, control, end) {
		var convert = function (position) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(
					_elm_lang$core$Tuple$first(position)),
				A2(
					_elm_lang$core$Basics_ops['++'],
					',',
					_elm_lang$core$Basics$toString(
						_elm_lang$core$Tuple$second(position))));
		};
		return A2(
			_elm_lang$core$Basics_ops['++'],
			'M',
			A2(
				_elm_lang$core$Basics_ops['++'],
				convert(start),
				A2(
					_elm_lang$core$Basics_ops['++'],
					' Q',
					A2(
						_elm_lang$core$Basics_ops['++'],
						convert(control),
						A2(
							_elm_lang$core$Basics_ops['++'],
							' ',
							convert(end))))));
	});
var _user$project$SvgHelpers$quadraticBezierSymmetric = F3(
	function (start, controlFactor, end) {
		var vecFromStartToMid = A2(
			_user$project$BasicGeometry$scalarMult,
			0.5,
			A2(_user$project$BasicGeometry$diff, end, start));
		var vecFromMidToControl = A2(
			_user$project$BasicGeometry$scalarMult,
			controlFactor,
			A2(_user$project$BasicGeometry$rotateBy, 90, vecFromStartToMid));
		var control = A2(
			_user$project$BasicGeometry$add,
			A2(_user$project$BasicGeometry$add, start, vecFromStartToMid),
			vecFromMidToControl);
		return A3(_user$project$SvgHelpers$quadraticBezier, start, control, end);
	});
var _user$project$SvgHelpers$pathdFromPoints = function (points) {
	var p = _elm_lang$core$String$concat(
		A2(
			_elm_lang$core$List$intersperse,
			' L ',
			A2(
				_elm_lang$core$List$map,
				function (_p5) {
					var _p6 = _p5;
					return A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(_p6._0),
						A2(
							_elm_lang$core$Basics_ops['++'],
							' ',
							_elm_lang$core$Basics$toString(_p6._1)));
				},
				points)));
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'M',
		A2(_elm_lang$core$Basics_ops['++'], p, 'Z'));
};

var _user$project$Extras$groupMaybeBy = F2(
	function (f, l) {
		var upd = F2(
			function (e, acc) {
				var _p0 = f(e);
				if (_p0.ctor === 'Nothing') {
					return acc;
				} else {
					var _p2 = _p0._0;
					var _p1 = A2(_elm_lang$core$Dict$get, _p2, acc);
					if (_p1.ctor === 'Just') {
						return A3(
							_elm_lang$core$Dict$insert,
							_p2,
							{ctor: '::', _0: e, _1: _p1._0},
							acc);
					} else {
						return A3(
							_elm_lang$core$Dict$insert,
							_p2,
							{
								ctor: '::',
								_0: e,
								_1: {ctor: '[]'}
							},
							acc);
					}
				}
			});
		return A3(_elm_lang$core$List$foldr, upd, _elm_lang$core$Dict$empty, l);
	});
var _user$project$Extras$groupBy = F2(
	function (f, l) {
		var upd = F2(
			function (e, acc) {
				var fe = f(e);
				var _p3 = A2(_elm_lang$core$Dict$get, fe, acc);
				if (_p3.ctor === 'Just') {
					return A3(
						_elm_lang$core$Dict$insert,
						fe,
						{ctor: '::', _0: e, _1: _p3._0},
						acc);
				} else {
					return A3(
						_elm_lang$core$Dict$insert,
						fe,
						{
							ctor: '::',
							_0: e,
							_1: {ctor: '[]'}
						},
						acc);
				}
			});
		return A3(_elm_lang$core$List$foldr, upd, _elm_lang$core$Dict$empty, l);
	});
var _user$project$Extras$cartesianProd = F2(
	function (set1, set2) {
		var list2 = _elm_lang$core$Set$toList(set2);
		var row = function (i) {
			return A2(
				_elm_lang$core$List$map,
				function (j) {
					return {ctor: '_Tuple2', _0: i, _1: j};
				},
				list2);
		};
		var list1 = _elm_lang$core$Set$toList(set1);
		return _elm_lang$core$Set$fromList(
			A2(_elm_lang$core$List$concatMap, row, list1));
	});
var _user$project$Extras$subsets = F2(
	function (k, set) {
		if (_elm_lang$core$Native_Utils.cmp(
			k,
			_elm_lang$core$Set$size(set)) > 0) {
			return {ctor: '[]'};
		} else {
			if (_elm_lang$core$Native_Utils.eq(k, 0)) {
				return {
					ctor: '::',
					_0: _elm_lang$core$Set$empty,
					_1: {ctor: '[]'}
				};
			} else {
				var _p4 = _elm_lang$core$Set$toList(set);
				if (_p4.ctor === '[]') {
					return {ctor: '[]'};
				} else {
					var t = _elm_lang$core$Set$fromList(_p4._1);
					return _elm_lang$core$List$concat(
						{
							ctor: '::',
							_0: A2(_user$project$Extras$subsets, k, t),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$core$List$map,
									_elm_lang$core$Set$insert(_p4._0),
									A2(_user$project$Extras$subsets, k - 1, t)),
								_1: {ctor: '[]'}
							}
						});
				}
			}
		}
	});
var _user$project$Extras$isSubset = F2(
	function (s, t) {
		return _elm_lang$core$Set$isEmpty(
			A2(_elm_lang$core$Set$diff, s, t));
	});
var _user$project$Extras$sortPairBy = F2(
	function (f, _p5) {
		var _p6 = _p5;
		var _p8 = _p6._1;
		var _p7 = _p6._0;
		return (_elm_lang$core$Native_Utils.cmp(
			f(_p7),
			f(_p8)) < 1) ? {ctor: '_Tuple2', _0: _p7, _1: _p8} : {ctor: '_Tuple2', _0: _p8, _1: _p7};
	});
var _user$project$Extras$sortPair = _user$project$Extras$sortPairBy(_elm_lang$core$Basics$identity);
var _user$project$Extras$getIndex = F2(
	function (element, list) {
		var helper = F3(
			function (element, list, order) {
				helper:
				while (true) {
					var _p9 = list;
					if (_p9.ctor === '[]') {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						if (_elm_lang$core$Native_Utils.eq(element, _p9._0)) {
							return _elm_lang$core$Maybe$Just(order);
						} else {
							var _v6 = element,
								_v7 = _p9._1,
								_v8 = order + 1;
							element = _v6;
							list = _v7;
							order = _v8;
							continue helper;
						}
					}
				}
			});
		return A3(helper, element, list, 0);
	});
var _user$project$Extras$first = F2(
	function (f, list) {
		first:
		while (true) {
			var _p10 = list;
			if (_p10.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p11 = _p10._0;
				if (f(_p11)) {
					return _elm_lang$core$Maybe$Just(_p11);
				} else {
					var _v10 = f,
						_v11 = _p10._1;
					f = _v10;
					list = _v11;
					continue first;
				}
			}
		}
	});
var _user$project$Extras_ops = _user$project$Extras_ops || {};
_user$project$Extras_ops['?'] = F2(
	function (maybe, $default) {
		return A2(_elm_lang$core$Maybe$withDefault, $default, maybe);
	});

var _user$project$PanAndZoom_Basics$getScale = function (model) {
	return model.scale;
};
var _user$project$PanAndZoom_Basics$getTranslate = function (model) {
	return model.translate;
};
var _user$project$PanAndZoom_Basics$applyToPoint = F2(
	function (p, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: (p.scale * _p1._0) + _elm_lang$core$Tuple$first(p.translate),
			_1: (p.scale * _p1._1) + _elm_lang$core$Tuple$second(p.translate)
		};
	});
var _user$project$PanAndZoom_Basics$inverse = function (p) {
	var _p2 = p.translate;
	var a = _p2._0;
	var b = _p2._1;
	var k = p.scale;
	return {
		scale: 1 / k,
		translate: {ctor: '_Tuple2', _0: (0 - a) / k, _1: (0 - b) / k}
	};
};
var _user$project$PanAndZoom_Basics$concat = F2(
	function (p, q) {
		var _p3 = q.translate;
		var c = _p3._0;
		var d = _p3._1;
		var _p4 = p.translate;
		var a = _p4._0;
		var b = _p4._1;
		var k = p.scale * q.scale;
		return {
			scale: k,
			translate: {ctor: '_Tuple2', _0: a + (c * k), _1: b + (d * k)}
		};
	});
var _user$project$PanAndZoom_Basics$extractTransformForSvg = function (_p5) {
	var _p6 = _p5;
	var _p7 = _p6.translate;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		'translate(',
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(
				_elm_lang$core$Tuple$first(_p7)),
			A2(
				_elm_lang$core$Basics_ops['++'],
				',',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(
						_elm_lang$core$Tuple$second(_p7)),
					A2(
						_elm_lang$core$Basics_ops['++'],
						')',
						A2(
							_elm_lang$core$Basics_ops['++'],
							'scale(',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(_p6.scale),
								')')))))));
};
var _user$project$PanAndZoom_Basics$times = F2(
	function (k, _p8) {
		var _p9 = _p8;
		return {ctor: '_Tuple2', _0: k * _p9._0, _1: k * _p9._1};
	});
var _user$project$PanAndZoom_Basics$subtract = F2(
	function (_p11, _p10) {
		var _p12 = _p11;
		var _p13 = _p10;
		return {ctor: '_Tuple2', _0: _p12._0 - _p13._0, _1: _p12._1 - _p13._1};
	});
var _user$project$PanAndZoom_Basics$add = F2(
	function (_p15, _p14) {
		var _p16 = _p15;
		var _p17 = _p14;
		return {ctor: '_Tuple2', _0: _p16._0 + _p17._0, _1: _p16._1 + _p17._1};
	});
var _user$project$PanAndZoom_Basics$pan = F2(
	function (_p18, model) {
		var _p19 = _p18;
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				translate: A2(_user$project$PanAndZoom_Basics$add, _p19.translateAtStart, _p19.delta)
			});
	});
var _user$project$PanAndZoom_Basics$zoom = F2(
	function (_p20, model) {
		var _p21 = _p20;
		var _p23 = _p21.translateAtStart;
		var _p22 = _p21.scaleAtStart;
		var newScale = A3(_elm_lang$core$Basics$clamp, _p21.minScale, _p21.maxScale, _p22 + _p21.delta);
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				scale: newScale,
				translate: A2(
					_user$project$PanAndZoom_Basics$add,
					_p23,
					A2(
						_user$project$PanAndZoom_Basics$times,
						(newScale / _p22) - 1,
						A2(_user$project$PanAndZoom_Basics$subtract, _p23, _p21.center)))
			});
	});
var _user$project$PanAndZoom_Basics$default = {
	scale: 1,
	translate: {ctor: '_Tuple2', _0: 0, _1: 0}
};
var _user$project$PanAndZoom_Basics$ScaleAndTranslate = F2(
	function (a, b) {
		return {scale: a, translate: b};
	});

var _user$project$Digraph$drawHull = function (positions) {
	return A2(
		_elm_lang$svg$Svg$path,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$d(
				_user$project$SvgHelpers$pathdFromPoints(
					_user$project$ConvexHull$convexHull(positions))),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$fill('gray'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$stroke('gray'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$opacity('0.2'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$strokeWidth('30px'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin('round'),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		},
		{ctor: '[]'});
};
var _user$project$Digraph$drawHulls = function (g) {
	var hullPaths = _elm_lang$core$Dict$values(
		A2(
			_elm_lang$core$Dict$map,
			F2(
				function (hullId, verticesInHull) {
					return _user$project$Digraph$drawHull(
						A2(
							_elm_lang$core$List$map,
							function (_p0) {
								return function (_) {
									return _.position;
								}(
									_elm_lang$core$Tuple$second(_p0));
							},
							verticesInHull));
				}),
			A2(
				_user$project$Extras$groupMaybeBy,
				function (_p1) {
					return function (_) {
						return _.hullId;
					}(
						_elm_lang$core$Tuple$second(_p1));
				},
				_elm_lang$core$Dict$toList(g.vertices))));
	return A2(
		_elm_lang$svg$Svg$g,
		{ctor: '[]'},
		hullPaths);
};
var _user$project$Digraph$drawVertices = function (g) {
	var drawVertex = F2(
		function (_p3, _p2) {
			var _p4 = _p2;
			var _p5 = _p4.radius;
			return A2(
				_elm_lang$svg$Svg$g,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$transform(
						A2(
							_elm_lang$core$Basics_ops['++'],
							'translate',
							_elm_lang$core$Basics$toString(_p4.position))),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$circle,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$r(
								_elm_lang$core$Basics$toString(_p5)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeWidth('1px'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke('#1d1f21'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill(_p4.color),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$text_,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$y(
									_elm_lang$core$Basics$toString(_p5 / 2)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('white'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$textAnchor('middle'),
										_1: {ctor: '[]'}
									}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg$text(
									A2(_elm_lang$core$Maybe$withDefault, '', _p4.label)),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				});
		});
	var vs = _elm_lang$core$Dict$values(
		A2(_elm_lang$core$Dict$map, drawVertex, g.vertices));
	return A2(
		_elm_lang$svg$Svg$g,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$id('vertices'),
			_1: {ctor: '[]'}
		},
		vs);
};
var _user$project$Digraph$drawEdge = F3(
	function (g, _p7, _p6) {
		var _p8 = _p7;
		var _p9 = _p6;
		var _p18 = _p9.thickness;
		var _p17 = _p9.color;
		var _p10 = {
			ctor: '_Tuple2',
			_0: A2(_elm_lang$core$Dict$get, _p8._0, g.vertices),
			_1: A2(_elm_lang$core$Dict$get, _p8._1, g.vertices)
		};
		if (((_p10.ctor === '_Tuple2') && (_p10._0.ctor === 'Just')) && (_p10._1.ctor === 'Just')) {
			var _p15 = _p10._1._0;
			var _p14 = _p10._0._0;
			var _p11 = _p15.position;
			var wx = _p11._0;
			var wy = _p11._1;
			var _p12 = _p14.position;
			var vx = _p12._0;
			var vy = _p12._1;
			var _p13 = _p9.shape;
			switch (_p13.ctor) {
				case 'Standard':
					return A2(
						_elm_lang$svg$Svg$g,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$line,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(_p17),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
											_elm_lang$core$Basics$toString(_p18)),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$x1(
												_elm_lang$core$Basics$toString(vx)),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$y1(
													_elm_lang$core$Basics$toString(vy)),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$x2(
														_elm_lang$core$Basics$toString(wx)),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$y2(
															_elm_lang$core$Basics$toString(wy)),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						});
				case 'Arrowed':
					return A2(
						_elm_lang$svg$Svg$g,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$line,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke(_p17),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
											_elm_lang$core$Basics$toString(_p18)),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$x1(
												_elm_lang$core$Basics$toString(vx)),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$y1(
													_elm_lang$core$Basics$toString(vy)),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$x2(
														_elm_lang$core$Basics$toString(wx)),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$y2(
															_elm_lang$core$Basics$toString(wy)),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: _user$project$SvgHelpers$makeArrowHead(
									{sourcePos: _p14.position, targetPos: _p15.position, targetRadius: _p15.radius, color: _p17}),
								_1: {ctor: '[]'}
							}
						});
				default:
					return A2(
						_elm_lang$svg$Svg$path,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke(_p17),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
									_elm_lang$core$Basics$toString(_p18)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$fill('none'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d(
											A3(_user$project$SvgHelpers$quadraticBezierSymmetric, _p14.position, 1, _p15.position)),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{ctor: '[]'});
			}
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'Digraph',
				{
					start: {line: 230, column: 5},
					end: {line: 282, column: 21}
				},
				_p10)('');
		}
	});
var _user$project$Digraph$drawEdges = function (g) {
	var es = _elm_lang$core$Dict$values(
		A2(
			_elm_lang$core$Dict$map,
			_user$project$Digraph$drawEdge(g),
			g.edges));
	return A2(
		_elm_lang$svg$Svg$g,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$id('edges'),
			_1: {ctor: '[]'}
		},
		es);
};
var _user$project$Digraph$view = function (g) {
	return A2(
		_elm_lang$svg$Svg$g,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$transform(
				_user$project$PanAndZoom_Basics$extractTransformForSvg(g.scaleAndTranslate)),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _user$project$Digraph$drawEdges(g),
			_1: {
				ctor: '::',
				_0: _user$project$Digraph$drawVertices(g),
				_1: {
					ctor: '::',
					_0: _user$project$Digraph$drawHulls(g),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Digraph$update = F2(
	function (msg, g) {
		var _p19 = msg;
		switch (_p19.ctor) {
			case 'AddVertex':
				return _elm_lang$core$Native_Utils.update(
					g,
					{
						vertices: A3(_elm_lang$core$Dict$insert, _p19._0.vertexName, _p19._0.vertexProp, g.vertices)
					});
			case 'AddEdge':
				return _elm_lang$core$Native_Utils.update(
					g,
					{
						edges: A3(
							_elm_lang$core$Dict$insert,
							{ctor: '_Tuple2', _0: _p19._0.source, _1: _p19._0.target},
							_p19._0.edgeProp,
							g.edges)
					});
			case 'RemoveVertices':
				var _p23 = _p19._0.vertexNames;
				return _elm_lang$core$Native_Utils.update(
					g,
					{
						vertices: A3(_elm_lang$core$List$foldr, _elm_lang$core$Dict$remove, g.vertices, _p23),
						edges: A2(
							_elm_lang$core$Dict$filter,
							F2(
								function (_p21, _p20) {
									var _p22 = _p21;
									return (!A2(_elm_lang$core$List$member, _p22._0, _p23)) && (!A2(_elm_lang$core$List$member, _p22._1, _p23));
								}),
							g.edges)
					});
			case 'RemoveEdges':
				return _elm_lang$core$Native_Utils.update(
					g,
					{
						edges: A3(_elm_lang$core$List$foldr, _elm_lang$core$Dict$remove, g.edges, _p19._0.edgeNames)
					});
			case 'SetRadius':
				var updateRadius = _elm_lang$core$Maybe$map(
					function (vP) {
						return _elm_lang$core$Native_Utils.update(
							vP,
							{radius: _p19._0.newRadius});
					});
				return _elm_lang$core$Native_Utils.update(
					g,
					{
						vertices: A3(
							_elm_lang$core$List$foldr,
							A2(_elm_lang$core$Basics$flip, _elm_lang$core$Dict$update, updateRadius),
							g.vertices,
							_p19._0.vertexNames)
					});
			case 'SetColor':
				var updateColor = _elm_lang$core$Maybe$map(
					function (vP) {
						return _elm_lang$core$Native_Utils.update(
							vP,
							{color: _p19._0.newColor});
					});
				return _elm_lang$core$Native_Utils.update(
					g,
					{
						vertices: A3(
							_elm_lang$core$List$foldr,
							A2(_elm_lang$core$Basics$flip, _elm_lang$core$Dict$update, updateColor),
							g.vertices,
							_p19._0.vertexNames)
					});
			case 'MoveVertices':
				var move = function (_p24) {
					var _p25 = _p24;
					return A2(
						_elm_lang$core$Dict$update,
						_p25.vertexName,
						_elm_lang$core$Maybe$map(
							function (prop) {
								return _elm_lang$core$Native_Utils.update(
									prop,
									{position: _p25.position});
							}));
				};
				return _elm_lang$core$Native_Utils.update(
					g,
					{
						vertices: A3(_elm_lang$core$List$foldl, move, g.vertices, _p19._0)
					});
			case 'SetScaleAndTranslate':
				return _elm_lang$core$Native_Utils.update(
					g,
					{scaleAndTranslate: _p19._0});
			default:
				return _p19._0;
		}
	});
var _user$project$Digraph$standardLinkForceData = {strength: 0.9, distance: 25};
var _user$project$Digraph$standardNodeForceData = {gC: _elm_lang$core$Maybe$Nothing, pullStrengthTogC: 1, fixed: false, charge: -100};
var _user$project$Digraph$standardVertexProp = {
	label: _elm_lang$core$Maybe$Nothing,
	position: {ctor: '_Tuple2', _0: 0, _1: 0},
	radius: 6,
	color: 'yellow',
	hullId: _elm_lang$core$Maybe$Nothing,
	force: _user$project$Digraph$standardNodeForceData
};
var _user$project$Digraph$getScaleAndTranslate = function (_) {
	return _.scaleAndTranslate;
};
var _user$project$Digraph$getEdges = function (_) {
	return _.edges;
};
var _user$project$Digraph$getVertices = function (_) {
	return _.vertices;
};
var _user$project$Digraph$digraph = function (_p26) {
	var _p27 = _p26;
	return {vertices: _p27.vertices, edges: _p27.edges, scaleAndTranslate: _p27.scaleAndTranslate};
};
var _user$project$Digraph$empty = {vertices: _elm_lang$core$Dict$empty, edges: _elm_lang$core$Dict$empty, scaleAndTranslate: _user$project$PanAndZoom_Basics$default};
var _user$project$Digraph$Model = F3(
	function (a, b, c) {
		return {vertices: a, edges: b, scaleAndTranslate: c};
	});
var _user$project$Digraph$VertexProp = F6(
	function (a, b, c, d, e, f) {
		return {label: a, position: b, radius: c, color: d, hullId: e, force: f};
	});
var _user$project$Digraph$NodeForceData = F4(
	function (a, b, c, d) {
		return {gC: a, pullStrengthTogC: b, fixed: c, charge: d};
	});
var _user$project$Digraph$EdgeProp = F4(
	function (a, b, c, d) {
		return {color: a, thickness: b, shape: c, force: d};
	});
var _user$project$Digraph$LinkForceData = F2(
	function (a, b) {
		return {strength: a, distance: b};
	});
var _user$project$Digraph$Arc = {ctor: 'Arc'};
var _user$project$Digraph$Arrowed = {ctor: 'Arrowed'};
var _user$project$Digraph$Standard = {ctor: 'Standard'};
var _user$project$Digraph$standardEdgeProp = {color: 'white', thickness: 2, shape: _user$project$Digraph$Standard, force: _user$project$Digraph$standardLinkForceData};
var _user$project$Digraph$ReplaceBy = function (a) {
	return {ctor: 'ReplaceBy', _0: a};
};
var _user$project$Digraph$SetScaleAndTranslate = function (a) {
	return {ctor: 'SetScaleAndTranslate', _0: a};
};
var _user$project$Digraph$MoveVertices = function (a) {
	return {ctor: 'MoveVertices', _0: a};
};
var _user$project$Digraph$SetColor = function (a) {
	return {ctor: 'SetColor', _0: a};
};
var _user$project$Digraph$SetRadius = function (a) {
	return {ctor: 'SetRadius', _0: a};
};
var _user$project$Digraph$RemoveEdges = function (a) {
	return {ctor: 'RemoveEdges', _0: a};
};
var _user$project$Digraph$RemoveVertices = function (a) {
	return {ctor: 'RemoveVertices', _0: a};
};
var _user$project$Digraph$AddEdge = function (a) {
	return {ctor: 'AddEdge', _0: a};
};
var _user$project$Digraph$AddVertex = function (a) {
	return {ctor: 'AddVertex', _0: a};
};

var _user$project$Digraph_Generators_Basic$fromAbstractDigraphWithCenter = function (_p0) {
	var _p1 = _p0;
	var _p2 = _p1.abstractDigraph;
	var vP = _user$project$Digraph$standardVertexProp;
	var vPList = A2(
		_user$project$BasicGeometry$applyCircularCoords,
		{maxObjectRadius: vP.radius, center: _p1.center},
		A2(
			_elm_lang$core$List$map,
			function (i) {
				return vP;
			},
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(_p2.vertexList) - 1)));
	return {
		vertices: _elm_lang$core$Dict$fromList(
			A3(
				_elm_lang$core$List$map2,
				F2(
					function (v0, v1) {
						return {ctor: '_Tuple2', _0: v0, _1: v1};
					}),
				_p2.vertexList,
				vPList)),
		edges: _elm_lang$core$Dict$fromList(
			A2(
				_elm_lang$core$List$map,
				function (e) {
					return {ctor: '_Tuple2', _0: e, _1: _user$project$Digraph$standardEdgeProp};
				},
				_p2.edgeList)),
		scaleAndTranslate: _user$project$PanAndZoom_Basics$default
	};
};
var _user$project$Digraph_Generators_Basic$fromAbstractDigraph = function (abstractDigraph) {
	return _user$project$Digraph_Generators_Basic$fromAbstractDigraphWithCenter(
		{
			center: {ctor: '_Tuple2', _0: 600, _1: 350},
			abstractDigraph: _user$project$AbstractDigraph$turnVerticesIntoString(abstractDigraph)
		});
};
var _user$project$Digraph_Generators_Basic$toAbstractDigraph = function (digraph) {
	return {
		vertexList: _elm_lang$core$Dict$keys(digraph.vertices),
		edgeList: _elm_lang$core$Dict$keys(digraph.edges)
	};
};

var _user$project$Digraph_Generators_Hypercube$tupleMap = F2(
	function (f, pair) {
		return {
			ctor: '_Tuple2',
			_0: f(
				_elm_lang$core$Tuple$first(pair)),
			_1: f(
				_elm_lang$core$Tuple$second(pair))
		};
	});
var _user$project$Digraph_Generators_Hypercube_ops = _user$project$Digraph_Generators_Hypercube_ops || {};
_user$project$Digraph_Generators_Hypercube_ops['~~'] = function (c) {
	return _elm_lang$core$List$map(
		_user$project$Digraph_Generators_Hypercube$tupleMap(
			_elm_lang$core$String$cons(c)));
};
var _user$project$Digraph_Generators_Hypercube_ops = _user$project$Digraph_Generators_Hypercube_ops || {};
_user$project$Digraph_Generators_Hypercube_ops['~'] = function (c) {
	return _elm_lang$core$List$map(
		_elm_lang$core$String$cons(c));
};
var _user$project$Digraph_Generators_Hypercube$hypercube = function (d) {
	var _p0 = d;
	if (_p0 === 0) {
		return {
			vertexList: {
				ctor: '::',
				_0: '',
				_1: {ctor: '[]'}
			},
			edgeList: {ctor: '[]'}
		};
	} else {
		var h = _user$project$Digraph_Generators_Hypercube$hypercube(_p0 - 1);
		var newVertexList = A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_user$project$Digraph_Generators_Hypercube_ops['~'],
				_elm_lang$core$Native_Utils.chr('0'),
				h.vertexList),
			A2(
				_user$project$Digraph_Generators_Hypercube_ops['~'],
				_elm_lang$core$Native_Utils.chr('1'),
				h.vertexList));
		var oldEdgesLifted = A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_user$project$Digraph_Generators_Hypercube_ops['~~'],
				_elm_lang$core$Native_Utils.chr('0'),
				h.edgeList),
			A2(
				_user$project$Digraph_Generators_Hypercube_ops['~~'],
				_elm_lang$core$Native_Utils.chr('1'),
				h.edgeList));
		var extraEdges = A2(
			_elm_lang$core$List$map,
			function (v) {
				return {
					ctor: '_Tuple2',
					_0: A2(
						_elm_lang$core$String$cons,
						_elm_lang$core$Native_Utils.chr('0'),
						v),
					_1: A2(
						_elm_lang$core$String$cons,
						_elm_lang$core$Native_Utils.chr('1'),
						v)
				};
			},
			h.vertexList);
		return {
			vertexList: newVertexList,
			edgeList: A2(_elm_lang$core$Basics_ops['++'], oldEdgesLifted, extraEdges)
		};
	}
};

var _user$project$Digraph_Examples_HyperCubes$create = function (d) {
	return _user$project$Digraph_Generators_Basic$fromAbstractDigraph(
		_user$project$Digraph_Generators_Hypercube$hypercube(d));
};

var _user$project$Digraph_Examples_MultiFoci$multifoci = function () {
	var forceOfPulled = function (id) {
		var _p0 = _elm_lang$core$Native_Utils.eq(
			A2(_elm_lang$core$Basics_ops['%'], id, 4),
			0) ? {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple2', _0: 500, _1: 250},
			_1: '#ff9300',
			_2: 5,
			_3: _elm_lang$core$Maybe$Just('first-Hull')
		} : (_elm_lang$core$Native_Utils.eq(
			A2(_elm_lang$core$Basics_ops['%'], id, 4),
			1) ? {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple2', _0: 500, _1: 450},
			_1: '#f03e31',
			_2: 5,
			_3: _elm_lang$core$Maybe$Just('second-Hull')
		} : (_elm_lang$core$Native_Utils.eq(
			A2(_elm_lang$core$Basics_ops['%'], id, 4),
			2) ? {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple2', _0: 700, _1: 450},
			_1: '#d783ff',
			_2: 5,
			_3: _elm_lang$core$Maybe$Just('third-hull')
		} : {
			ctor: '_Tuple4',
			_0: {ctor: '_Tuple2', _0: 700, _1: 250},
			_1: '#9437ff',
			_2: 5,
			_3: _elm_lang$core$Maybe$Just('fourth-hull')
		}));
		var gC = _p0._0;
		var color = _p0._1;
		var radius = _p0._2;
		var hullId = _p0._3;
		var sNFD = _user$project$Digraph$standardNodeForceData;
		return {
			ctor: '_Tuple4',
			_0: _elm_lang$core$Native_Utils.update(
				sNFD,
				{
					gC: _elm_lang$core$Maybe$Just(gC),
					pullStrengthTogC: 0.2
				}),
			_1: color,
			_2: radius,
			_3: hullId
		};
	};
	return function (g) {
		return _elm_lang$core$Native_Utils.update(
			g,
			{
				vertices: A2(
					_elm_lang$core$Dict$map,
					F2(
						function (id, vP) {
							var _p1 = function () {
								var _p2 = _elm_lang$core$String$toInt(id);
								if (_p2.ctor === 'Ok') {
									return forceOfPulled(_p2._0);
								} else {
									return _elm_lang$core$Native_Utils.crashCase(
										'Digraph.Examples.MultiFoci',
										{
											start: {line: 48, column: 49},
											end: {line: 53, column: 71}
										},
										_p2)('');
								}
							}();
							var newForce = _p1._0;
							var newColor = _p1._1;
							var newRadius = _p1._2;
							var newHullId = _p1._3;
							return _elm_lang$core$Native_Utils.update(
								vP,
								{force: newForce, color: newColor, radius: newRadius, hullId: newHullId});
						}),
					g.vertices),
				edges: A2(
					_elm_lang$core$Dict$map,
					F2(
						function (_p4, eP) {
							var oldForce = eP.force;
							return _elm_lang$core$Native_Utils.update(
								eP,
								{
									force: _elm_lang$core$Native_Utils.update(
										oldForce,
										{distance: 10})
								});
						}),
					g.edges)
			});
	}(
		_user$project$Digraph_Generators_Basic$fromAbstractDigraph(
			{
				vertexList: A2(_elm_lang$core$List$range, 0, 59),
				edgeList: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 0, _1: 1},
					_1: {ctor: '[]'}
				}
			}));
}();

var _user$project$Digraph_Examples_SimpleOnes$sNFD = _user$project$Digraph$standardNodeForceData;
var _user$project$Digraph_Examples_SimpleOnes$sVP = _user$project$Digraph$standardVertexProp;
var _user$project$Digraph_Examples_SimpleOnes$sEP = _user$project$Digraph$standardEdgeProp;
var _user$project$Digraph_Examples_SimpleOnes$kiteWithFixedNode = _user$project$Digraph$digraph(
	{
		vertices: _elm_lang$core$Dict$fromList(
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: '0',
					_1: _elm_lang$core$Native_Utils.update(
						_user$project$Digraph_Examples_SimpleOnes$sVP,
						{
							position: {ctor: '_Tuple2', _0: 650, _1: 226},
							force: _elm_lang$core$Native_Utils.update(
								_user$project$Digraph_Examples_SimpleOnes$sNFD,
								{fixed: true}),
							color: 'purple'
						})
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: '1',
						_1: _elm_lang$core$Native_Utils.update(
							_user$project$Digraph_Examples_SimpleOnes$sVP,
							{
								position: {ctor: '_Tuple2', _0: 383, _1: 261}
							})
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: '2',
							_1: _elm_lang$core$Native_Utils.update(
								_user$project$Digraph_Examples_SimpleOnes$sVP,
								{
									position: {ctor: '_Tuple2', _0: 431, _1: 275}
								})
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: '3',
								_1: _elm_lang$core$Native_Utils.update(
									_user$project$Digraph_Examples_SimpleOnes$sVP,
									{
										position: {ctor: '_Tuple2', _0: 395, _1: 311}
									})
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: '4',
									_1: _elm_lang$core$Native_Utils.update(
										_user$project$Digraph_Examples_SimpleOnes$sVP,
										{
											position: {ctor: '_Tuple2', _0: 381, _1: 364},
											radius: 20
										})
								},
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}),
		edges: _elm_lang$core$Dict$fromList(
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: {ctor: '_Tuple2', _0: '0', _1: '1'},
					_1: _user$project$Digraph_Examples_SimpleOnes$sEP
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: {ctor: '_Tuple2', _0: '2', _1: '0'},
						_1: _user$project$Digraph_Examples_SimpleOnes$sEP
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: {ctor: '_Tuple2', _0: '1', _1: '2'},
							_1: _user$project$Digraph_Examples_SimpleOnes$sEP
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: {ctor: '_Tuple2', _0: '1', _1: '3'},
								_1: _user$project$Digraph_Examples_SimpleOnes$sEP
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: {ctor: '_Tuple2', _0: '2', _1: '3'},
									_1: _user$project$Digraph_Examples_SimpleOnes$sEP
								},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: {ctor: '_Tuple2', _0: '3', _1: '4'},
										_1: _user$project$Digraph_Examples_SimpleOnes$sEP
									},
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}),
		scaleAndTranslate: {
			scale: 1,
			translate: {ctor: '_Tuple2', _0: 0, _1: 0}
		}
	});
var _user$project$Digraph_Examples_SimpleOnes$fruchtGraph = _user$project$Digraph_Generators_Basic$fromAbstractDigraph(
	{
		vertexList: {
			ctor: '::',
			_0: 'a1',
			_1: {
				ctor: '::',
				_0: 'a2',
				_1: {
					ctor: '::',
					_0: 'a3',
					_1: {
						ctor: '::',
						_0: 'b1',
						_1: {
							ctor: '::',
							_0: 'b2',
							_1: {
								ctor: '::',
								_0: 'b3',
								_1: {
									ctor: '::',
									_0: 'c1',
									_1: {
										ctor: '::',
										_0: 'c2',
										_1: {
											ctor: '::',
											_0: 'c3',
											_1: {
												ctor: '::',
												_0: 'd',
												_1: {
													ctor: '::',
													_0: 'e',
													_1: {
														ctor: '::',
														_0: 'f',
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		},
		edgeList: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'a1', _1: 'a2'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'a2', _1: 'a3'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'a3', _1: 'a1'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'b1', _1: 'b2'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'b2', _1: 'b3'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'b3', _1: 'b1'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'c1', _1: 'c2'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'c2', _1: 'c3'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'c3', _1: 'c1'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'f', _1: 'a2'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'f', _1: 'b3'},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'f', _1: 'd'},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'd', _1: 'a1'},
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: 'd', _1: 'e'},
																_1: {
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: 'e', _1: 'b1'},
																	_1: {
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: 'e', _1: 'c1'},
																		_1: {
																			ctor: '::',
																			_0: {ctor: '_Tuple2', _0: 'a3', _1: 'c2'},
																			_1: {
																				ctor: '::',
																				_0: {ctor: '_Tuple2', _0: 'c3', _1: 'b2'},
																				_1: {ctor: '[]'}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});

var _user$project$Digraph_Json_Decode$linkForceDataDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'distance',
	_elm_lang$core$Json_Decode$float,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'strength',
		_elm_lang$core$Json_Decode$float,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Digraph$LinkForceData)));
var _user$project$Digraph_Json_Decode$edgeShapeDecoder = A2(
	_elm_lang$core$Json_Decode$map,
	function (edgeShape) {
		return _elm_lang$core$Native_Utils.eq(edgeShape, 'Standard') ? _user$project$Digraph$Standard : (_elm_lang$core$Native_Utils.eq(edgeShape, 'Arrowed') ? _user$project$Digraph$Arrowed : (_elm_lang$core$Native_Utils.eq(edgeShape, 'Arc') ? _user$project$Digraph$Arc : _user$project$Digraph$Standard));
	},
	_elm_lang$core$Json_Decode$string);
var _user$project$Digraph_Json_Decode$edgePropDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'force',
	_user$project$Digraph_Json_Decode$linkForceDataDecoder,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'shape',
		_user$project$Digraph_Json_Decode$edgeShapeDecoder,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'thickness',
			_elm_lang$core$Json_Decode$float,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
				'color',
				_elm_lang$core$Json_Decode$string,
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Digraph$EdgeProp)))));
var _user$project$Digraph_Json_Decode$pointDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'y',
	_elm_lang$core$Json_Decode$float,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'x',
		_elm_lang$core$Json_Decode$float,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}))));
var _user$project$Digraph_Json_Decode$nodeForceDataDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'charge',
	_elm_lang$core$Json_Decode$float,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'fixed',
		_elm_lang$core$Json_Decode$bool,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'pullStrengthTogC',
			_elm_lang$core$Json_Decode$float,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
				'gC',
				_elm_lang$core$Json_Decode$maybe(_user$project$Digraph_Json_Decode$pointDecoder),
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Digraph$NodeForceData)))));
var _user$project$Digraph_Json_Decode$vertexPropDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'force',
	_user$project$Digraph_Json_Decode$nodeForceDataDecoder,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'hullId',
		_elm_lang$core$Json_Decode$maybe(_elm_lang$core$Json_Decode$string),
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'color',
			_elm_lang$core$Json_Decode$string,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
				'radius',
				_elm_lang$core$Json_Decode$float,
				A3(
					_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
					'position',
					_user$project$Digraph_Json_Decode$pointDecoder,
					A3(
						_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
						'label',
						_elm_lang$core$Json_Decode$maybe(_elm_lang$core$Json_Decode$string),
						_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Digraph$VertexProp)))))));
var _user$project$Digraph_Json_Decode$Vertex = F2(
	function (a, b) {
		return {vertexName: a, vertexProp: b};
	});
var _user$project$Digraph_Json_Decode$vertexDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'vertexProp',
	_user$project$Digraph_Json_Decode$vertexPropDecoder,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'vertexName',
		_elm_lang$core$Json_Decode$string,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Digraph_Json_Decode$Vertex)));
var _user$project$Digraph_Json_Decode$verticesDecoder = A2(
	_elm_lang$core$Json_Decode$map,
	_elm_lang$core$Dict$fromList,
	_elm_lang$core$Json_Decode$list(
		A2(
			_elm_lang$core$Json_Decode$map,
			function (_p0) {
				var _p1 = _p0;
				return {ctor: '_Tuple2', _0: _p1.vertexName, _1: _p1.vertexProp};
			},
			_user$project$Digraph_Json_Decode$vertexDecoder)));
var _user$project$Digraph_Json_Decode$Edge = F2(
	function (a, b) {
		return {edgeId: a, edgeProp: b};
	});
var _user$project$Digraph_Json_Decode$EdgeId = F2(
	function (a, b) {
		return {source: a, target: b};
	});
var _user$project$Digraph_Json_Decode$edgeIdDecoder = A2(
	_elm_lang$core$Json_Decode$map,
	function (_p2) {
		var _p3 = _p2;
		return {ctor: '_Tuple2', _0: _p3.source, _1: _p3.target};
	},
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'target',
		_elm_lang$core$Json_Decode$string,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'source',
			_elm_lang$core$Json_Decode$string,
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Digraph_Json_Decode$EdgeId))));
var _user$project$Digraph_Json_Decode$edgeDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'edgeProp',
	_user$project$Digraph_Json_Decode$edgePropDecoder,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'edgeId',
		_user$project$Digraph_Json_Decode$edgeIdDecoder,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Digraph_Json_Decode$Edge)));
var _user$project$Digraph_Json_Decode$edgesDecoder = A2(
	_elm_lang$core$Json_Decode$map,
	_elm_lang$core$Dict$fromList,
	_elm_lang$core$Json_Decode$list(
		A2(
			_elm_lang$core$Json_Decode$map,
			function (_p4) {
				var _p5 = _p4;
				return {ctor: '_Tuple2', _0: _p5.edgeId, _1: _p5.edgeProp};
			},
			_user$project$Digraph_Json_Decode$edgeDecoder)));
var _user$project$Digraph_Json_Decode$ScaleAndTranslate = F2(
	function (a, b) {
		return {scale: a, translate: b};
	});
var _user$project$Digraph_Json_Decode$scaleAndTranslateDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'translate',
	_user$project$Digraph_Json_Decode$pointDecoder,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'scale',
		_elm_lang$core$Json_Decode$float,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Digraph_Json_Decode$ScaleAndTranslate)));
var _user$project$Digraph_Json_Decode$digraphDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'scaleAndTranslate',
	_user$project$Digraph_Json_Decode$scaleAndTranslateDecoder,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'edges',
		_user$project$Digraph_Json_Decode$edgesDecoder,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'vertices',
			_user$project$Digraph_Json_Decode$verticesDecoder,
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$Digraph$Model))));

var _user$project$Digraph_Json_Encode$encodeLinkForceData = function (linkForceData) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'strength',
				_1: _elm_lang$core$Json_Encode$float(linkForceData.strength)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'distance',
					_1: _elm_lang$core$Json_Encode$float(linkForceData.distance)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Digraph_Json_Encode$encodeEdgeShape = function (edgeShape) {
	var _p0 = edgeShape;
	switch (_p0.ctor) {
		case 'Standard':
			return _elm_lang$core$Json_Encode$string('Standard');
		case 'Arrowed':
			return _elm_lang$core$Json_Encode$string('Arrowed');
		default:
			return _elm_lang$core$Json_Encode$string('Arc');
	}
};
var _user$project$Digraph_Json_Encode$encodeEdgeProp = function (_p1) {
	var _p2 = _p1;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'color',
				_1: _elm_lang$core$Json_Encode$string(_p2.color)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'thickness',
					_1: _elm_lang$core$Json_Encode$float(_p2.thickness)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'shape',
						_1: _user$project$Digraph_Json_Encode$encodeEdgeShape(_p2.shape)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'force',
							_1: _user$project$Digraph_Json_Encode$encodeLinkForceData(_p2.force)
						},
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _user$project$Digraph_Json_Encode$encodeEdgeId = function (edgeId) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'source',
				_1: _elm_lang$core$Json_Encode$string(
					_elm_lang$core$Tuple$first(edgeId))
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'target',
					_1: _elm_lang$core$Json_Encode$string(
						_elm_lang$core$Tuple$second(edgeId))
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Digraph_Json_Encode$encodeEdge = function (_p3) {
	var _p4 = _p3;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'edgeId',
				_1: _user$project$Digraph_Json_Encode$encodeEdgeId(_p4._0)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'edgeProp',
					_1: _user$project$Digraph_Json_Encode$encodeEdgeProp(_p4._1)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Digraph_Json_Encode$encodeEdges = function (edges) {
	return _elm_lang$core$Json_Encode$list(
		A2(
			_elm_lang$core$List$map,
			_user$project$Digraph_Json_Encode$encodeEdge,
			A2(
				_elm_lang$core$List$sortBy,
				_elm_lang$core$Tuple$first,
				_elm_lang$core$Dict$toList(edges))));
};
var _user$project$Digraph_Json_Encode$encodePoint = function (_p5) {
	var _p6 = _p5;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'x',
				_1: _elm_lang$core$Json_Encode$float(_p6._0)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'y',
					_1: _elm_lang$core$Json_Encode$float(_p6._1)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Digraph_Json_Encode$encodeMaybe = F2(
	function (encoder, maybeThing) {
		var _p7 = maybeThing;
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Json_Encode$null;
		} else {
			return encoder(_p7._0);
		}
	});
var _user$project$Digraph_Json_Encode$encodeNodeForceData = function (nodeForceData) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'gC',
				_1: A2(_user$project$Digraph_Json_Encode$encodeMaybe, _user$project$Digraph_Json_Encode$encodePoint, nodeForceData.gC)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'pullStrengthTogC',
					_1: _elm_lang$core$Json_Encode$float(nodeForceData.pullStrengthTogC)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'fixed',
						_1: _elm_lang$core$Json_Encode$bool(nodeForceData.fixed)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'charge',
							_1: _elm_lang$core$Json_Encode$float(nodeForceData.charge)
						},
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _user$project$Digraph_Json_Encode$encodeVertexProp = function (_p8) {
	var _p9 = _p8;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'label',
				_1: A2(_user$project$Digraph_Json_Encode$encodeMaybe, _elm_lang$core$Json_Encode$string, _p9.label)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'position',
					_1: _user$project$Digraph_Json_Encode$encodePoint(_p9.position)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'radius',
						_1: _elm_lang$core$Json_Encode$float(_p9.radius)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'color',
							_1: _elm_lang$core$Json_Encode$string(_p9.color)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'hullId',
								_1: A2(_user$project$Digraph_Json_Encode$encodeMaybe, _elm_lang$core$Json_Encode$string, _p9.hullId)
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'force',
									_1: _user$project$Digraph_Json_Encode$encodeNodeForceData(_p9.force)
								},
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		});
};
var _user$project$Digraph_Json_Encode$encodeVertex = function (_p10) {
	var _p11 = _p10;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'vertexName',
				_1: _elm_lang$core$Json_Encode$string(_p11._0)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'vertexProp',
					_1: _user$project$Digraph_Json_Encode$encodeVertexProp(_p11._1)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Digraph_Json_Encode$encodeVertices = function (vertices) {
	return _elm_lang$core$Json_Encode$list(
		A2(
			_elm_lang$core$List$map,
			_user$project$Digraph_Json_Encode$encodeVertex,
			A2(
				_elm_lang$core$List$sortBy,
				_elm_lang$core$Tuple$first,
				_elm_lang$core$Dict$toList(vertices))));
};
var _user$project$Digraph_Json_Encode$encodeScaleAndTranslate = function (_p12) {
	var _p13 = _p12;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'scale',
				_1: _elm_lang$core$Json_Encode$float(_p13.scale)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'translate',
					_1: _user$project$Digraph_Json_Encode$encodePoint(_p13.translate)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Digraph_Json_Encode$encodeDigraph = function (_p14) {
	var _p15 = _p14;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'vertices',
				_1: _user$project$Digraph_Json_Encode$encodeVertices(_p15.vertices)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'edges',
					_1: _user$project$Digraph_Json_Encode$encodeEdges(_p15.edges)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'scaleAndTranslate',
						_1: _user$project$Digraph_Json_Encode$encodeScaleAndTranslate(_p15.scaleAndTranslate)
					},
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Digraph_Json_Encode$toString = function (digraph) {
	return A2(
		_elm_lang$core$Json_Encode$encode,
		2,
		_user$project$Digraph_Json_Encode$encodeDigraph(digraph));
};

var _user$project$Digraph_Operations$induce = F2(
	function (s, g) {
		return _user$project$Digraph$digraph(
			{
				vertices: A2(
					_elm_lang$core$Dict$filter,
					F2(
						function (v, _p0) {
							return A2(_elm_lang$core$Set$member, v, s);
						}),
					_user$project$Digraph$getVertices(g)),
				edges: A2(
					_elm_lang$core$Dict$filter,
					F2(
						function (_p2, _p1) {
							var _p3 = _p2;
							return A2(_elm_lang$core$Set$member, _p3._0, s) && A2(_elm_lang$core$Set$member, _p3._1, s);
						}),
					_user$project$Digraph$getEdges(g)),
				scaleAndTranslate: _user$project$Digraph$getScaleAndTranslate(g)
			});
	});
var _user$project$Digraph_Operations$union = F2(
	function (g, h) {
		var prependToEdgeNames = function (s) {
			return function (_p4) {
				return A3(
					_elm_lang$core$Dict$foldl,
					function (_p5) {
						var _p6 = _p5;
						return _elm_lang$core$Dict$insert(
							{
								ctor: '_Tuple2',
								_0: A2(_elm_lang$core$Basics_ops['++'], s, _p6._0),
								_1: A2(_elm_lang$core$Basics_ops['++'], s, _p6._1)
							});
					},
					_elm_lang$core$Dict$empty,
					_user$project$Digraph$getEdges(_p4));
			};
		};
		var prependToVertexNames = function (s) {
			return function (_p7) {
				return A3(
					_elm_lang$core$Dict$foldl,
					function (v) {
						return _elm_lang$core$Dict$insert(
							A2(_elm_lang$core$Basics_ops['++'], s, v));
					},
					_elm_lang$core$Dict$empty,
					_user$project$Digraph$getVertices(_p7));
			};
		};
		return _user$project$Digraph$digraph(
			{
				vertices: A2(
					_elm_lang$core$Dict$union,
					A2(prependToVertexNames, '0-', g),
					A2(prependToVertexNames, '1-', h)),
				edges: A2(
					_elm_lang$core$Dict$union,
					A2(prependToEdgeNames, '0-', g),
					A2(prependToEdgeNames, '1-', h)),
				scaleAndTranslate: _user$project$Digraph$getScaleAndTranslate(g)
			});
	});

var _user$project$FileSystem$openCloseFolder = F2(
	function (path, _p0) {
		var _p1 = _p0;
		var newAllFolders = A3(
			_elm_lang$core$Dict$update,
			path,
			_elm_lang$core$Maybe$map(
				function (f) {
					return _elm_lang$core$Native_Utils.update(
						f,
						{isOpen: !f.isOpen});
				}),
			_p1.allFolders);
		return _elm_lang$core$Native_Utils.update(
			_p1,
			{allFolders: newAllFolders});
	});
var _user$project$FileSystem$closeFile = F2(
	function (path, model) {
		var beforeAndAfter = F2(
			function (e, l) {
				var helper = F2(
					function (bef, aft) {
						helper:
						while (true) {
							var _p2 = aft;
							if (_p2.ctor === '::') {
								var _p4 = _p2._1;
								var _p3 = _p2._0;
								if (_elm_lang$core$Native_Utils.eq(_p3, e)) {
									return {
										ctor: '_Tuple2',
										_0: _elm_lang$core$List$reverse(bef),
										_1: _p4
									};
								} else {
									var _v2 = {ctor: '::', _0: _p3, _1: bef},
										_v3 = _p4;
									bef = _v2;
									aft = _v3;
									continue helper;
								}
							} else {
								return {ctor: '_Tuple2', _0: bef, _1: aft};
							}
						}
					});
				return A2(
					helper,
					{ctor: '[]'},
					l);
			});
		var _p5 = A2(beforeAndAfter, path, model.openedFilesOrderedForTabs);
		var tabsBefore = _p5._0;
		var tabsAfter = _p5._1;
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				openedFiles: A2(_elm_lang$core$Dict$remove, path, model.openedFiles),
				openedFilesOrderedForTabs: A2(_elm_lang$core$Basics_ops['++'], tabsBefore, tabsAfter),
				maybePathOfTheFocusedFile: function () {
					var _p6 = model.maybePathOfTheFocusedFile;
					if (_p6.ctor === 'Nothing') {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						var _p8 = _p6._0;
						if (!_elm_lang$core$Native_Utils.eq(_p8, path)) {
							return _elm_lang$core$Maybe$Just(_p8);
						} else {
							var _p7 = _elm_lang$core$List$head(
								_elm_lang$core$List$reverse(tabsBefore));
							if (_p7.ctor === 'Nothing') {
								return _elm_lang$core$List$head(tabsAfter);
							} else {
								return _elm_lang$core$Maybe$Just(_p7._0);
							}
						}
					}
				}()
			});
	});
var _user$project$FileSystem$deleteFocusedFile = function (model) {
	var _p9 = model.maybePathOfTheFocusedFile;
	if (_p9.ctor === 'Just') {
		var _p10 = _p9._0;
		var m = A2(_user$project$FileSystem$closeFile, _p10, model);
		return _elm_lang$core$Native_Utils.update(
			m,
			{
				allFilesWithHashes: A2(_elm_lang$core$Dict$remove, _p10, m.allFilesWithHashes)
			});
	} else {
		return model;
	}
};
var _user$project$FileSystem$focusFile = F2(
	function (path, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				maybePathOfTheFocusedFile: _elm_lang$core$Maybe$Just(path)
			});
	});
var _user$project$FileSystem$updateFocusedUL = F2(
	function (f, _p11) {
		var _p12 = _p11;
		var _p13 = _p12.maybePathOfTheFocusedFile;
		if (_p13.ctor === 'Nothing') {
			return _elm_lang$core$Native_Utils.crashCase(
				'FileSystem',
				{
					start: {line: 186, column: 5},
					end: {line: 191, column: 100}
				},
				_p13)('');
		} else {
			return _elm_lang$core$Native_Utils.update(
				_p12,
				{
					openedFiles: A3(
						_elm_lang$core$Dict$update,
						_p13._0,
						_elm_lang$core$Maybe$map(f),
						_p12.openedFiles)
				});
		}
	});
var _user$project$FileSystem$editFocusedFile = function (updater) {
	return _user$project$FileSystem$updateFocusedUL(
		function (ul) {
			var updatedContent = updater(ul.present.file);
			return A2(
				_elm_community$undo_redo$UndoList$new,
				{
					file: updatedContent,
					hash: _Skinney$fnv$FNV$hashString(
						_elm_lang$core$Basics$toString(updatedContent))
				},
				ul);
		});
};
var _user$project$FileSystem$editFocusedFileWithoutChangingHistoryAndPresentHash = function (updater) {
	return _user$project$FileSystem$updateFocusedUL(
		_elm_community$undo_redo$UndoList$mapPresent(
			function (entry) {
				return _elm_lang$core$Native_Utils.update(
					entry,
					{
						file: updater(entry.file)
					});
			}));
};
var _user$project$FileSystem$redoInFocusedFile = _user$project$FileSystem$updateFocusedUL(_elm_community$undo_redo$UndoList$redo);
var _user$project$FileSystem$undoInFocusedFile = _user$project$FileSystem$updateFocusedUL(_elm_community$undo_redo$UndoList$undo);
var _user$project$FileSystem$saveFileWithHash = F3(
	function (path, fileWithHash, model) {
		var takePrefixes = function (l) {
			return A2(
				_elm_lang$core$List$map,
				_elm_lang$core$String$join('/'),
				A2(
					_elm_lang$core$List$map,
					function (i) {
						return A2(_elm_lang$core$List$take, i, l);
					},
					A2(
						_elm_lang$core$List$range,
						1,
						_elm_lang$core$List$length(l) - 1)));
		};
		var folderPathsToAdd = takePrefixes(
			A2(_elm_lang$core$String$split, '/', path));
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				allFilesWithHashes: A3(_elm_lang$core$Dict$insert, path, fileWithHash, model.allFilesWithHashes),
				allFolders: A2(
					_elm_lang$core$Dict$union,
					_elm_lang$core$Dict$fromList(
						A2(
							_elm_lang$core$List$map,
							function (p) {
								return {
									ctor: '_Tuple2',
									_0: p,
									_1: {isOpen: true}
								};
							},
							folderPathsToAdd)),
					model.allFolders)
			});
	});
var _user$project$FileSystem$setLocked = F2(
	function (bool, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{locked: bool});
	});
var _user$project$FileSystem$startOfEditingFocusedFileWithoutChangingHistoryAndPresentHash = function (_p15) {
	return A2(
		_user$project$FileSystem$setLocked,
		true,
		A2(
			_user$project$FileSystem$updateFocusedUL,
			function (ul) {
				return A2(_elm_community$undo_redo$UndoList$new, ul.present, ul);
			},
			_p15));
};
var _user$project$FileSystem$endOfEditingFocusedFileWithoutChangingHistoryAndPresentHash = function (_p16) {
	return A2(
		_user$project$FileSystem$setLocked,
		false,
		A2(
			_user$project$FileSystem$updateFocusedUL,
			_elm_community$undo_redo$UndoList$mapPresent(
				function (entry) {
					return _elm_lang$core$Native_Utils.update(
						entry,
						{
							hash: _Skinney$fnv$FNV$hashString(
								_elm_lang$core$Basics$toString(entry.file))
						});
				}),
			_p16));
};
var _user$project$FileSystem$getUserInputForNewFile = function (model) {
	return model.userInputForNewFile;
};
var _user$project$FileSystem$isOpenedFile = F2(
	function (path, _p17) {
		var _p18 = _p17;
		return A2(_elm_lang$core$Dict$member, path, _p18.openedFiles);
	});
var _user$project$FileSystem$openFile = F2(
	function (path, model) {
		var _p19 = A2(_elm_lang$core$Dict$get, path, model.allFilesWithHashes);
		if (_p19.ctor === 'Just') {
			var newOpenedFiles = A2(_user$project$FileSystem$isOpenedFile, path, model) ? model.openedFiles : A3(
				_elm_lang$core$Dict$insert,
				path,
				_elm_community$undo_redo$UndoList$fresh(
					{file: _p19._0.file, hash: _p19._0.hash}),
				model.openedFiles);
			return _elm_lang$core$Native_Utils.update(
				model,
				{
					openedFiles: newOpenedFiles,
					openedFilesOrderedForTabs: A2(_elm_lang$core$List$member, path, model.openedFilesOrderedForTabs) ? model.openedFilesOrderedForTabs : A2(
						_elm_lang$core$List$append,
						model.openedFilesOrderedForTabs,
						{
							ctor: '::',
							_0: path,
							_1: {ctor: '[]'}
						})
				});
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'FileSystem',
				{
					start: {line: 201, column: 5},
					end: {line: 222, column: 27}
				},
				_p19)('');
		}
	});
var _user$project$FileSystem$newFile = F3(
	function (path, file, model) {
		var hash = _Skinney$fnv$FNV$hashString(
			_elm_lang$core$Basics$toString(file));
		return A2(
			_user$project$FileSystem$focusFile,
			path,
			A2(
				_user$project$FileSystem$openFile,
				path,
				A3(
					_user$project$FileSystem$saveFileWithHash,
					path,
					{file: file, hash: hash},
					model)));
	});
var _user$project$FileSystem$hasChanged = F2(
	function (path, model) {
		var _p21 = {
			ctor: '_Tuple2',
			_0: A2(_elm_lang$core$Dict$get, path, model.allFilesWithHashes),
			_1: A2(_elm_lang$core$Dict$get, path, model.openedFiles)
		};
		if (((_p21.ctor === '_Tuple2') && (_p21._0.ctor === 'Just')) && (_p21._1.ctor === 'Just')) {
			return !_elm_lang$core$Native_Utils.eq(_p21._0._0.hash, _p21._1._0.present.hash);
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'FileSystem',
				{
					start: {line: 123, column: 5},
					end: {line: 132, column: 62}
				},
				_p21)('The given path is not an open file.');
		}
	});
var _user$project$FileSystem$getAllFolderPaths = function (model) {
	return _elm_lang$core$Dict$keys(model.allFolders);
};
var _user$project$FileSystem$getAllFilePaths = function (model) {
	return _elm_lang$core$Dict$keys(model.allFilesWithHashes);
};
var _user$project$FileSystem$maybePresentOfTheFocused = function (_p23) {
	var _p24 = _p23;
	var _p25 = _p24.maybePathOfTheFocusedFile;
	if (_p25.ctor === 'Nothing') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		var _p26 = A2(_elm_lang$core$Dict$get, _p25._0, _p24.openedFiles);
		if (_p26.ctor === 'Nothing') {
			return _elm_lang$core$Native_Utils.crashCase(
				'FileSystem',
				{
					start: {line: 90, column: 13},
					end: {line: 95, column: 47}
				},
				_p26)('Focused file must be opened!');
		} else {
			return _elm_lang$core$Maybe$Just(_p26._0.present.file);
		}
	}
};
var _user$project$FileSystem$doIfFocusedExists = F3(
	function (f, $default, model) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			$default,
			A2(
				_elm_lang$core$Maybe$map,
				f,
				_user$project$FileSystem$maybePresentOfTheFocused(model)));
	});
var _user$project$FileSystem$takeName = function (path) {
	return A2(
		_elm_lang$core$Maybe$withDefault,
		'ERROR READING FILENAME',
		_elm_lang$core$List$head(
			_elm_lang$core$List$reverse(
				A2(_elm_lang$core$String$split, '/', path))));
};
var _user$project$FileSystem$Model = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {allFilesWithHashes: a, allFolders: b, openedFiles: c, openedFilesOrderedForTabs: d, maybePathOfTheFocusedFile: e, locked: f, emptyFile: g, userInputForNewFile: h, state: i};
	});
var _user$project$FileSystem$FileWithHash = F2(
	function (a, b) {
		return {file: a, hash: b};
	});
var _user$project$FileSystem$Directory = function (a) {
	return {isOpen: a};
};
var _user$project$FileSystem$Idle = {ctor: 'Idle'};
var _user$project$FileSystem$init = function (emptyFile) {
	return {
		allFilesWithHashes: _elm_lang$core$Dict$empty,
		allFolders: _elm_lang$core$Dict$empty,
		openedFiles: _elm_lang$core$Dict$empty,
		openedFilesOrderedForTabs: {ctor: '[]'},
		maybePathOfTheFocusedFile: _elm_lang$core$Maybe$Nothing,
		locked: false,
		emptyFile: emptyFile,
		userInputForNewFile: '',
		state: _user$project$FileSystem$Idle
	};
};
var _user$project$FileSystem$stopAskingForFileName = function (model) {
	return _elm_lang$core$Native_Utils.update(
		model,
		{state: _user$project$FileSystem$Idle});
};
var _user$project$FileSystem$WaitingForFileNameInputForSaveAs = function (a) {
	return {ctor: 'WaitingForFileNameInputForSaveAs', _0: a};
};
var _user$project$FileSystem$WaitingForFileNameInputForNewFile = {ctor: 'WaitingForFileNameInputForNewFile'};
var _user$project$FileSystem$updateHelper = F2(
	function (msg, _p28) {
		var _p29 = _p28;
		var _p41 = _p29;
		var _p40 = _p29.maybePathOfTheFocusedFile;
		if (_p41.locked) {
			return _p41;
		} else {
			var _p30 = msg;
			switch (_p30.ctor) {
				case 'NoOp':
					return _p41;
				case 'OpenAndFocusFile':
					var _p31 = _p30._0;
					return A2(
						_user$project$FileSystem$focusFile,
						_p31,
						A2(_user$project$FileSystem$openFile, _p31, _p41));
				case 'CloseFile':
					return A2(_user$project$FileSystem$closeFile, _p30._0, _p41);
				case 'CloseFocusedFile':
					var _p32 = _p40;
					if (_p32.ctor === 'Nothing') {
						return _elm_lang$core$Native_Utils.crashCase(
							'FileSystem',
							{
								start: {line: 421, column: 17},
								end: {line: 426, column: 48}
							},
							_p32)('');
					} else {
						return A2(_user$project$FileSystem$closeFile, _p32._0, _p41);
					}
				case 'NewFile':
					return _user$project$FileSystem$stopAskingForFileName(
						A3(_user$project$FileSystem$newFile, _p30._0, _p30._1, _p41));
				case 'DeleteFocusedFile':
					return _user$project$FileSystem$deleteFocusedFile(_p41);
				case 'FocusFile':
					return A2(_user$project$FileSystem$focusFile, _p30._0, _p41);
				case 'SaveFocusedFile':
					var _p34 = _p40;
					if (_p34.ctor === 'Nothing') {
						return _elm_lang$core$Native_Utils.crashCase(
							'FileSystem',
							{
								start: {line: 438, column: 17},
								end: {line: 448, column: 80}
							},
							_p34)('');
					} else {
						var _p38 = _p34._0;
						var _p36 = A2(_elm_lang$core$Dict$get, _p38, _p29.openedFiles);
						if (_p36.ctor === 'Nothing') {
							return _elm_lang$core$Native_Utils.crashCase(
								'FileSystem',
								{
									start: {line: 443, column: 25},
									end: {line: 448, column: 80}
								},
								_p36)('');
						} else {
							return A3(_user$project$FileSystem$saveFileWithHash, _p38, _p36._0.present, _p41);
						}
					}
				case 'UndoInFocusedFile':
					return _user$project$FileSystem$undoInFocusedFile(_p41);
				case 'RedoInFocusedFile':
					return _user$project$FileSystem$redoInFocusedFile(_p41);
				case 'OpenCloseFolder':
					return A2(_user$project$FileSystem$openCloseFolder, _p30._0, _p41);
				case 'AskForFileNameForNewFile':
					return _elm_lang$core$Native_Utils.update(
						_p41,
						{state: _user$project$FileSystem$WaitingForFileNameInputForNewFile});
				case 'AskForFileNameForSaveAs':
					return _elm_lang$core$Native_Utils.update(
						_p41,
						{
							state: function () {
								var _p39 = _p41.maybePathOfTheFocusedFile;
								if (_p39.ctor === 'Just') {
									return _user$project$FileSystem$WaitingForFileNameInputForSaveAs(_p39._0);
								} else {
									return _user$project$FileSystem$Idle;
								}
							}()
						});
				case 'UpdateUserInputForNewFileName':
					return _elm_lang$core$Native_Utils.update(
						_p41,
						{userInputForNewFile: _p30._0});
				case 'StopAskingForFileName':
					return _user$project$FileSystem$stopAskingForFileName(_p41);
				default:
					return _p41;
			}
		}
	});
var _user$project$FileSystem$Export = {ctor: 'Export'};
var _user$project$FileSystem$StopAskingForFileName = {ctor: 'StopAskingForFileName'};
var _user$project$FileSystem$AskForFileNameForSaveAs = {ctor: 'AskForFileNameForSaveAs'};
var _user$project$FileSystem$AskForFileNameForNewFile = {ctor: 'AskForFileNameForNewFile'};
var _user$project$FileSystem$OpenCloseFolder = function (a) {
	return {ctor: 'OpenCloseFolder', _0: a};
};
var _user$project$FileSystem$UpdateUserInputForNewFileName = function (a) {
	return {ctor: 'UpdateUserInputForNewFileName', _0: a};
};
var _user$project$FileSystem$RedoInFocusedFile = {ctor: 'RedoInFocusedFile'};
var _user$project$FileSystem$UndoInFocusedFile = {ctor: 'UndoInFocusedFile'};
var _user$project$FileSystem$SaveFocusedFile = {ctor: 'SaveFocusedFile'};
var _user$project$FileSystem$FocusFile = function (a) {
	return {ctor: 'FocusFile', _0: a};
};
var _user$project$FileSystem$DeleteFocusedFile = {ctor: 'DeleteFocusedFile'};
var _user$project$FileSystem$NewFile = F2(
	function (a, b) {
		return {ctor: 'NewFile', _0: a, _1: b};
	});
var _user$project$FileSystem$CloseFocusedFile = {ctor: 'CloseFocusedFile'};
var _user$project$FileSystem$CloseFile = function (a) {
	return {ctor: 'CloseFile', _0: a};
};
var _user$project$FileSystem$OpenAndFocusFile = function (a) {
	return {ctor: 'OpenAndFocusFile', _0: a};
};
var _user$project$FileSystem$NoOp = {ctor: 'NoOp'};
var _user$project$FileSystem$subscriptions = function (model) {
	return _elm_lang$keyboard$Keyboard$downs(
		function (keyCode) {
			if (_elm_lang$core$Native_Utils.eq(keyCode, 13)) {
				var _p42 = model.state;
				switch (_p42.ctor) {
					case 'WaitingForFileNameInputForNewFile':
						return A2(_user$project$FileSystem$NewFile, model.userInputForNewFile, model.emptyFile);
					case 'WaitingForFileNameInputForSaveAs':
						var _p43 = A2(_elm_lang$core$Dict$get, _p42._0, model.allFilesWithHashes);
						if (_p43.ctor === 'Nothing') {
							return A2(_user$project$FileSystem$NewFile, model.userInputForNewFile, model.emptyFile);
						} else {
							var _p44 = _user$project$FileSystem$maybePresentOfTheFocused(model);
							if (_p44.ctor === 'Nothing') {
								return A2(_user$project$FileSystem$NewFile, model.userInputForNewFile, model.emptyFile);
							} else {
								return A2(_user$project$FileSystem$NewFile, model.userInputForNewFile, _p44._0);
							}
						}
					default:
						return _user$project$FileSystem$NoOp;
				}
			} else {
				if (_elm_lang$core$Native_Utils.eq(keyCode, 27)) {
					return _user$project$FileSystem$StopAskingForFileName;
				} else {
					return _user$project$FileSystem$NoOp;
				}
			}
		});
};
var _user$project$FileSystem$ExportFileSystemAsJson = {ctor: 'ExportFileSystemAsJson'};
var _user$project$FileSystem$UploadToLocalStorage = {ctor: 'UploadToLocalStorage'};
var _user$project$FileSystem$NoCall = {ctor: 'NoCall'};
var _user$project$FileSystem$update = F2(
	function (msg, model) {
		var newModel = A2(_user$project$FileSystem$updateHelper, msg, model);
		var _p45 = msg;
		switch (_p45.ctor) {
			case 'SaveFocusedFile':
				return {ctor: '_Tuple2', _0: newModel, _1: _user$project$FileSystem$UploadToLocalStorage};
			case 'Export':
				return {ctor: '_Tuple2', _0: newModel, _1: _user$project$FileSystem$ExportFileSystemAsJson};
			default:
				return {ctor: '_Tuple2', _0: newModel, _1: _user$project$FileSystem$NoCall};
		}
	});

var _user$project$FileSystem_InputFileName$view = function (model) {
	var viewInputArea = A2(
		_elm_lang$html$Html$input,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$type_('text'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'margin-left', _1: '10px'},
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$placeholder('~/myFolder/myGraph'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Events$onInput(_user$project$FileSystem$UpdateUserInputForNewFileName),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$value(
								_user$project$FileSystem$getUserInputForNewFile(model)),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		},
		{ctor: '[]'});
	return A2(
		_elm_lang$html$Html$p,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'color', _1: '#6a98bd'},
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'Enter path',
					function () {
						var _p0 = model.state;
						switch (_p0.ctor) {
							case 'WaitingForFileNameInputForNewFile':
								return ' for the new file:';
							case 'WaitingForFileNameInputForSaveAs':
								return A2(
									_elm_lang$core$Basics_ops['++'],
									' for the new copy of ',
									A2(_elm_lang$core$Basics_ops['++'], _p0._0, ': '));
							default:
								return 'THERE IS A PROBLEM HERE IF THIS IS DISPLAYED!';
						}
					}())),
			_1: {
				ctor: '::',
				_0: viewInputArea,
				_1: {ctor: '[]'}
			}
		});
};

var _user$project$FileSystem_Json_Decode$folderDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'isOpen',
	_elm_lang$core$Json_Decode$bool,
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$FileSystem$Directory));
var _user$project$FileSystem_Json_Decode$fileWithHashDecoder = function (fileDecoder) {
	return A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'hash',
		_elm_lang$core$Json_Decode$int,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'file',
			fileDecoder,
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$FileSystem$FileWithHash)));
};
var _user$project$FileSystem_Json_Decode$undoListOfFileWithHashDecoder = function (fileDecoder) {
	return _elm_community$undo_redo$UndoList_Decode$undolist(
		_user$project$FileSystem_Json_Decode$fileWithHashDecoder(fileDecoder));
};
var _user$project$FileSystem_Json_Decode$PathAndFileWithHash = F2(
	function (a, b) {
		return {path: a, fileWithHash: b};
	});
var _user$project$FileSystem_Json_Decode$pathAndFileWithHashDecoder = function (fileDecoder) {
	return A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'fileWithHash',
		_user$project$FileSystem_Json_Decode$fileWithHashDecoder(fileDecoder),
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'path',
			_elm_lang$core$Json_Decode$string,
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$FileSystem_Json_Decode$PathAndFileWithHash)));
};
var _user$project$FileSystem_Json_Decode$allFilesWithHashesDecoder = function (fileDecoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$list(
			A2(
				_elm_lang$core$Json_Decode$map,
				function (_p0) {
					var _p1 = _p0;
					return {ctor: '_Tuple2', _0: _p1.path, _1: _p1.fileWithHash};
				},
				_user$project$FileSystem_Json_Decode$pathAndFileWithHashDecoder(fileDecoder))));
};
var _user$project$FileSystem_Json_Decode$PathAndFolder = F2(
	function (a, b) {
		return {path: a, folder: b};
	});
var _user$project$FileSystem_Json_Decode$pathAndFolderDecoder = A3(
	_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
	'folder',
	_user$project$FileSystem_Json_Decode$folderDecoder,
	A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'path',
		_elm_lang$core$Json_Decode$string,
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$FileSystem_Json_Decode$PathAndFolder)));
var _user$project$FileSystem_Json_Decode$allFoldersDecoder = A2(
	_elm_lang$core$Json_Decode$map,
	_elm_lang$core$Dict$fromList,
	_elm_lang$core$Json_Decode$list(
		A2(
			_elm_lang$core$Json_Decode$map,
			function (_p2) {
				var _p3 = _p2;
				return {ctor: '_Tuple2', _0: _p3.path, _1: _p3.folder};
			},
			_user$project$FileSystem_Json_Decode$pathAndFolderDecoder)));
var _user$project$FileSystem_Json_Decode$PathAndUndoListOfFileWithHashPair = F2(
	function (a, b) {
		return {path: a, undoListOfFileWithHash: b};
	});
var _user$project$FileSystem_Json_Decode$pathAndUndoListOfFileWithHashPairDecoder = function (fileDecoder) {
	return A3(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
		'undoListOfFileWithHash',
		_user$project$FileSystem_Json_Decode$undoListOfFileWithHashDecoder(fileDecoder),
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'path',
			_elm_lang$core$Json_Decode$string,
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$FileSystem_Json_Decode$PathAndUndoListOfFileWithHashPair)));
};
var _user$project$FileSystem_Json_Decode$openedFilesDecoder = function (fileDecoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$list(
			A2(
				_elm_lang$core$Json_Decode$map,
				function (_p4) {
					var _p5 = _p4;
					return {ctor: '_Tuple2', _0: _p5.path, _1: _p5.undoListOfFileWithHash};
				},
				_user$project$FileSystem_Json_Decode$pathAndUndoListOfFileWithHashPairDecoder(fileDecoder))));
};
var _user$project$FileSystem_Json_Decode$fileSystemDecoder = function (fileDecoder) {
	return A2(
		_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$hardcoded,
		_user$project$FileSystem$Idle,
		A3(
			_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
			'userInputForNewFile',
			_elm_lang$core$Json_Decode$string,
			A3(
				_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
				'emptyFile',
				fileDecoder,
				A2(
					_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$hardcoded,
					false,
					A3(
						_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
						'maybePathOfTheFocusedFile',
						_elm_lang$core$Json_Decode$maybe(_elm_lang$core$Json_Decode$string),
						A3(
							_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
							'openedFilesOrderedForTabs',
							_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string),
							A3(
								_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
								'openedFiles',
								_user$project$FileSystem_Json_Decode$openedFilesDecoder(fileDecoder),
								A3(
									_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
									'allFolders',
									_user$project$FileSystem_Json_Decode$allFoldersDecoder,
									A3(
										_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$required,
										'allFilesWithHashes',
										_user$project$FileSystem_Json_Decode$allFilesWithHashesDecoder(fileDecoder),
										_NoRedInk$elm_decode_pipeline$Json_Decode_Pipeline$decode(_user$project$FileSystem$Model))))))))));
};

var _user$project$FileSystem_Json_Encode$encodeFolder = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'isOpen',
				_1: _elm_lang$core$Json_Encode$bool(_p1.isOpen)
			},
			_1: {ctor: '[]'}
		});
};
var _user$project$FileSystem_Json_Encode$encodeKeyValueFromAllFolders = function (_p2) {
	var _p3 = _p2;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'path',
				_1: _elm_lang$core$Json_Encode$string(_p3._0)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'folder',
					_1: _user$project$FileSystem_Json_Encode$encodeFolder(_p3._1)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$FileSystem_Json_Encode$encodeAllFolders = function (allFolders) {
	return _elm_lang$core$Json_Encode$list(
		A2(
			_elm_lang$core$List$map,
			_user$project$FileSystem_Json_Encode$encodeKeyValueFromAllFolders,
			_elm_lang$core$Dict$toList(allFolders)));
};
var _user$project$FileSystem_Json_Encode$encodeFileWithHash = F2(
	function (encodeFile, _p4) {
		var _p5 = _p4;
		return _elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'file',
					_1: encodeFile(_p5.file)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'hash',
						_1: _elm_lang$core$Json_Encode$int(_p5.hash)
					},
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$FileSystem_Json_Encode$encodeUndoList = function (encodeFile) {
	return function (_p6) {
		return _elm_community$undo_redo$UndoList_Encode$undolist(
			A2(
				_elm_community$undo_redo$UndoList$map,
				_user$project$FileSystem_Json_Encode$encodeFileWithHash(encodeFile),
				_p6));
	};
};
var _user$project$FileSystem_Json_Encode$encodePairOfFileNameAndUndoListOfFileWithHash = F2(
	function (encodeFile, _p7) {
		var _p8 = _p7;
		return _elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'path',
					_1: _elm_lang$core$Json_Encode$string(_p8._0)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'undoListOfFileWithHash',
						_1: A2(_user$project$FileSystem_Json_Encode$encodeUndoList, encodeFile, _p8._1)
					},
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$FileSystem_Json_Encode$encodeOpenedFiles = F2(
	function (encodeFile, openedFiles) {
		return _elm_lang$core$Json_Encode$list(
			A2(
				_elm_lang$core$List$map,
				_user$project$FileSystem_Json_Encode$encodePairOfFileNameAndUndoListOfFileWithHash(encodeFile),
				_elm_lang$core$Dict$toList(openedFiles)));
	});
var _user$project$FileSystem_Json_Encode$encodeKeyValueFromAllFilesWithHashes = F2(
	function (encodeFile, _p9) {
		var _p10 = _p9;
		return _elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'path',
					_1: _elm_lang$core$Json_Encode$string(_p10._0)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'fileWithHash',
						_1: A2(_user$project$FileSystem_Json_Encode$encodeFileWithHash, encodeFile, _p10._1)
					},
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$FileSystem_Json_Encode$encodeAllFilesWithHashes = F2(
	function (encodeFile, allFilesWithHashes) {
		return _elm_lang$core$Json_Encode$list(
			A2(
				_elm_lang$core$List$map,
				_user$project$FileSystem_Json_Encode$encodeKeyValueFromAllFilesWithHashes(encodeFile),
				_elm_lang$core$Dict$toList(allFilesWithHashes)));
	});
var _user$project$FileSystem_Json_Encode$encodeMaybe = F2(
	function (encoder, maybeThing) {
		var _p11 = maybeThing;
		if (_p11.ctor === 'Nothing') {
			return _elm_lang$core$Json_Encode$null;
		} else {
			return encoder(_p11._0);
		}
	});
var _user$project$FileSystem_Json_Encode$encode = F2(
	function (encodeFile, _p12) {
		var _p13 = _p12;
		return _elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'allFilesWithHashes',
					_1: A2(_user$project$FileSystem_Json_Encode$encodeAllFilesWithHashes, encodeFile, _p13.allFilesWithHashes)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'allFolders',
						_1: _user$project$FileSystem_Json_Encode$encodeAllFolders(_p13.allFolders)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'openedFiles',
							_1: A2(_user$project$FileSystem_Json_Encode$encodeOpenedFiles, encodeFile, _p13.openedFiles)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'openedFilesOrderedForTabs',
								_1: _elm_lang$core$Json_Encode$list(
									A2(_elm_lang$core$List$map, _elm_lang$core$Json_Encode$string, _p13.openedFilesOrderedForTabs))
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'maybePathOfTheFocusedFile',
									_1: A2(_user$project$FileSystem_Json_Encode$encodeMaybe, _elm_lang$core$Json_Encode$string, _p13.maybePathOfTheFocusedFile)
								},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'emptyFile',
										_1: encodeFile(_p13.emptyFile)
									},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'userInputForNewFile',
											_1: _elm_lang$core$Json_Encode$string(_p13.userInputForNewFile)
										},
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			});
	});

var _user$project$HtmlHelpers$myMaterialButton = F3(
	function (titleText, icon, msg) {
		return A2(
			_elm_lang$html$Html$button,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$title(titleText),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onClick(msg),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'type', _1: 'button'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'background-color', _1: '#262626'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'border-color', _1: 'gray'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'border-radius', _1: '4px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'border-width', _1: '1px'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'color', _1: 'white'},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'center'},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'outline', _1: 'none'},
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: 'text-decoration', _1: 'none'},
																_1: {
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: 'display', _1: 'inline-block'},
																	_1: {
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: 'font-size', _1: '16px'},
																		_1: {
																			ctor: '::',
																			_0: {ctor: '_Tuple2', _0: 'cursor', _1: 'pointer'},
																			_1: {
																				ctor: '::',
																				_0: {ctor: '_Tuple2', _0: 'padding', _1: '8px 8px 4px 8px'},
																				_1: {
																					ctor: '::',
																					_0: {ctor: '_Tuple2', _0: 'margin', _1: '4px 4px 4px 4px'},
																					_1: {ctor: '[]'}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					icon,
					A3(_elm_lang$core$Color$rgb, 232, 232, 232),
					18),
				_1: {ctor: '[]'}
			});
	});
var _user$project$HtmlHelpers$unselectable = {
	ctor: '::',
	_0: {ctor: '_Tuple2', _0: '-webkit-user-select', _1: 'none'},
	_1: {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: '-moz-user-select', _1: 'none'},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: '-ms-user-select', _1: 'none'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'user-select', _1: 'none'},
				_1: {ctor: '[]'}
			}
		}
	}
};

var _user$project$FileSystem_View_ControlButtons$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$p,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'padding-left', _1: '10px'},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A3(_user$project$HtmlHelpers$myMaterialButton, 'New File', _elm_community$elm_material_icons$Material_Icons_Content$add_circle, _user$project$FileSystem$AskForFileNameForNewFile),
					_1: {
						ctor: '::',
						_0: A3(_user$project$HtmlHelpers$myMaterialButton, 'Save', _elm_community$elm_material_icons$Material_Icons_Content$save, _user$project$FileSystem$SaveFocusedFile),
						_1: {
							ctor: '::',
							_0: A3(_user$project$HtmlHelpers$myMaterialButton, 'Save As', _elm_community$elm_material_icons$Material_Icons_Image$add_to_photos, _user$project$FileSystem$AskForFileNameForSaveAs),
							_1: {
								ctor: '::',
								_0: A3(_user$project$HtmlHelpers$myMaterialButton, 'Delete', _elm_community$elm_material_icons$Material_Icons_Action$delete, _user$project$FileSystem$DeleteFocusedFile),
								_1: {ctor: '[]'}
							}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$p,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'padding-left', _1: '10px'},
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A3(_user$project$HtmlHelpers$myMaterialButton, 'Export all the file system as json file', _elm_community$elm_material_icons$Material_Icons_File$file_upload, _user$project$FileSystem$Export),
						_1: {
							ctor: '::',
							_0: A3(_user$project$HtmlHelpers$myMaterialButton, 'Import file system from json file  (This does not work yet.)', _elm_community$elm_material_icons$Material_Icons_File$file_download, _user$project$FileSystem$NoOp),
							_1: {
								ctor: '::',
								_0: A3(_user$project$HtmlHelpers$myMaterialButton, 'Undo (Z)', _elm_community$elm_material_icons$Material_Icons_Content$undo, _user$project$FileSystem$UndoInFocusedFile),
								_1: {
									ctor: '::',
									_0: A3(_user$project$HtmlHelpers$myMaterialButton, 'Redo (Y)', _elm_community$elm_material_icons$Material_Icons_Content$redo, _user$project$FileSystem$RedoInFocusedFile),
									_1: {ctor: '[]'}
								}
							}
						}
					}),
				_1: {ctor: '[]'}
			}
		});
};

var _user$project$FileSystem_View_FolderTree$viewTree = F2(
	function (fileSystem, tree) {
		var _p0 = tree;
		if (_p0.ctor === 'Tree') {
			var _p2 = _p0._0.path;
			var _p1 = _p0._0.isOpen;
			return A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						A2(
							_elm_lang$core$List$append,
							_user$project$CssHelpers$unselectable,
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'cursor', _1: 'default'},
								_1: {ctor: '[]'}
							})),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$p,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'padding', _1: '8px'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'class', _1: '8px'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'margin', _1: '0px'},
											_1: {ctor: '[]'}
										}
									}
								}),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Events$onMouseDown(
									_user$project$FileSystem$OpenCloseFolder(_p2)),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$style(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'margin-right', _1: '6px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'margin-top', _1: '-2px'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'float', _1: 'left'},
													_1: {ctor: '[]'}
												}
											}
										}),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _p1 ? A2(
										_elm_community$elm_material_icons$Material_Icons_File$folder_open,
										A3(_elm_lang$core$Color$rgb, 159, 128, 74),
										18) : A2(
										_elm_community$elm_material_icons$Material_Icons_File$folder,
										A3(_elm_lang$core$Color$rgb, 159, 128, 74),
										18),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html$text(
									_user$project$FileSystem$takeName(_p2)),
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$style(
									{
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'margin-left', _1: '20px'},
										_1: {
											ctor: '::',
											_0: {
												ctor: '_Tuple2',
												_0: 'display',
												_1: _p1 ? 'block' : 'none'
											},
											_1: {ctor: '[]'}
										}
									}),
								_1: {ctor: '[]'}
							},
							A2(
								_elm_lang$core$List$append,
								A2(
									_elm_lang$core$List$map,
									_user$project$FileSystem_View_FolderTree$viewTree(fileSystem),
									_p0._0.folderChildren),
								A2(
									_elm_lang$core$List$map,
									_user$project$FileSystem_View_FolderTree$viewTree(fileSystem),
									_p0._0.fileChildren))),
						_1: {ctor: '[]'}
					}
				});
		} else {
			var _p3 = _p0._0.path;
			return A2(
				_elm_lang$html$Html$p,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'margin', _1: '0px'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'padding', _1: '8px'},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'background-color',
										_1: _elm_lang$core$Native_Utils.eq(
											fileSystem.maybePathOfTheFocusedFile,
											_elm_lang$core$Maybe$Just(_p3)) ? '#2e2e2e' : '#262626'
									},
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Events$onMouseDown(
							_user$project$FileSystem$OpenAndFocusFile(_p3)),
						_1: {ctor: '[]'}
					}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'margin-right', _1: '6px'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'margin-top', _1: '2px'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'float', _1: 'left'},
											_1: {ctor: '[]'}
										}
									}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_community$elm_material_icons$Material_Icons_Content$content_paste,
								A3(_elm_lang$core$Color$rgb, 107, 155, 192),
								12),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							_user$project$FileSystem$takeName(_p3)),
						_1: {ctor: '[]'}
					}
				});
		}
	});
var _user$project$FileSystem_View_FolderTree$Leaf = function (a) {
	return {ctor: 'Leaf', _0: a};
};
var _user$project$FileSystem_View_FolderTree$Tree = function (a) {
	return {ctor: 'Tree', _0: a};
};
var _user$project$FileSystem_View_FolderTree$treeFromFileSystem = function (fileSystem) {
	var allFilePaths = _user$project$FileSystem$getAllFilePaths(fileSystem);
	var allFolderPaths = _user$project$FileSystem$getAllFolderPaths(fileSystem);
	var isChildPathOf = F2(
		function (path, r) {
			return A2(
				_elm_lang$core$String$startsWith,
				A2(_elm_lang$core$Basics_ops['++'], path, '/'),
				r) && (!A2(
				_elm_lang$core$String$contains,
				'/',
				A2(
					_elm_lang$core$String$dropLeft,
					_elm_lang$core$String$length(path) + 1,
					r)));
		});
	var subtree = function (path) {
		var fileChildren = A2(
			_elm_lang$core$List$map,
			function (p) {
				return _user$project$FileSystem_View_FolderTree$Leaf(
					{path: p});
			},
			A2(
				_elm_lang$core$List$filter,
				isChildPathOf(path),
				allFilePaths));
		var folderChildren = A2(
			_elm_lang$core$List$map,
			subtree,
			A2(
				_elm_lang$core$List$filter,
				isChildPathOf(path),
				allFolderPaths));
		return _user$project$FileSystem_View_FolderTree$Tree(
			{
				path: path,
				isOpen: function () {
					var _p4 = A2(_elm_lang$core$Dict$get, path, fileSystem.allFolders);
					if (_p4.ctor === 'Just') {
						return _p4._0.isOpen;
					} else {
						return true;
					}
				}(),
				folderChildren: folderChildren,
				fileChildren: fileChildren
			});
	};
	return subtree('~');
};
var _user$project$FileSystem_View_FolderTree$view = F2(
	function (fileSearchInput, fileSystem) {
		var filesToShow = A2(
			_elm_lang$core$List$filter,
			_elm_lang$core$String$contains(fileSearchInput),
			_user$project$FileSystem$getAllFilePaths(fileSystem));
		var foldersToShow = A2(
			_elm_lang$core$List$filter,
			function (folderPath) {
				return A2(
					_elm_lang$core$List$any,
					_elm_lang$core$String$startsWith(folderPath),
					filesToShow);
			},
			_user$project$FileSystem$getAllFolderPaths(fileSystem));
		var tree = _user$project$FileSystem_View_FolderTree$treeFromFileSystem(
			_elm_lang$core$Native_Utils.update(
				fileSystem,
				{
					allFilesWithHashes: A2(
						_elm_lang$core$Dict$filter,
						F2(
							function (path, _p5) {
								return A2(_elm_lang$core$List$member, path, filesToShow);
							}),
						fileSystem.allFilesWithHashes),
					allFolders: A2(
						_elm_lang$core$Dict$filter,
						F2(
							function (path, _p6) {
								return A2(_elm_lang$core$List$member, path, foldersToShow);
							}),
						fileSystem.allFolders)
				}));
		return A2(_user$project$FileSystem_View_FolderTree$viewTree, fileSystem, tree);
	});

var _user$project$FileSystem_View_Tabs$viewTab = F2(
	function (model, path) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'display', _1: 'inline-block'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'height', _1: '64px'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'cursor', _1: 'default'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'border-style', _1: 'solid'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'border-width', _1: '0px 0px 1px 0px'},
										_1: {
											ctor: '::',
											_0: {
												ctor: '_Tuple2',
												_0: 'border-color',
												_1: A2(_user$project$FileSystem$hasChanged, path, model) ? '#cf7619' : '#2e2e2e'
											},
											_1: {
												ctor: '::',
												_0: {
													ctor: '_Tuple2',
													_0: 'background-color',
													_1: function () {
														var _p0 = model.maybePathOfTheFocusedFile;
														if (_p0.ctor === 'Nothing') {
															return _elm_lang$core$Native_Utils.crashCase(
																'FileSystem.View.Tabs',
																{
																	start: {line: 41, column: 17},
																	end: {line: 49, column: 38}
																},
																_p0)('');
														} else {
															return _elm_lang$core$Native_Utils.eq(_p0._0, path) ? '#2e2e2e' : '#1e1e1e';
														}
													}()
												},
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onMouseDown(
						_user$project$FileSystem$FocusFile(path)),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$p,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'color',
									_1: function () {
										var _p2 = model.maybePathOfTheFocusedFile;
										if (_p2.ctor === 'Just') {
											return _elm_lang$core$Native_Utils.eq(_p2._0, path) ? 'white' : 'gray';
										} else {
											return 'red';
										}
									}()
								},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'margin', _1: '25px'},
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							_user$project$FileSystem$takeName(path)),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$span,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$style(
										{
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'position', _1: 'relative'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'margin-left', _1: '16px'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'top', _1: '3px'},
													_1: {ctor: '[]'}
												}
											}
										}),
									_1: {
										ctor: '::',
										_0: A3(
											_elm_lang$html$Html_Events$onWithOptions,
											'mousedown',
											{stopPropagation: true, preventDefault: false},
											_elm_lang$core$Json_Decode$succeed(
												_user$project$FileSystem$CloseFile(path))),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A2(_elm_community$elm_material_icons$Material_Icons_Content$clear, _elm_lang$core$Color$gray, 12),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$FileSystem_View_Tabs$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'background-color', _1: '#1e1e1e'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'overflow-x', _1: 'auto'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'overflow-y', _1: 'hidden'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'white-space', _1: 'nowrap'},
								_1: {ctor: '[]'}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$List$map,
			_user$project$FileSystem_View_Tabs$viewTab(model),
			model.openedFilesOrderedForTabs));
};

var _user$project$GraphLayout$lay = F2(
	function (layout, d) {
		var calculatedCircle = function () {
			if (_elm_lang$core$Dict$isEmpty(d)) {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var radius = 100;
				var maybeCenter = _user$project$BasicGeometry$gravityCenter(
					_elm_lang$core$Dict$values(d));
				var _p0 = maybeCenter;
				if (_p0.ctor === 'Nothing') {
					return _elm_lang$core$Maybe$Nothing;
				} else {
					return _elm_lang$core$Maybe$Just(
						A2(_user$project$BasicGeometry$Circle, _p0._0, radius));
				}
			}
		}();
		var count = function (_p1) {
			return _elm_lang$core$List$length(
				_elm_lang$core$Dict$toList(_p1));
		};
		var setXOfAll = function (x) {
			return A2(
				_elm_lang$core$Dict$map,
				F2(
					function (_p3, _p2) {
						var _p4 = _p2;
						return {ctor: '_Tuple2', _0: x, _1: _p4._1};
					}),
				d);
		};
		var setYOfAll = function (y) {
			return A2(
				_elm_lang$core$Dict$map,
				F2(
					function (_p6, _p5) {
						var _p7 = _p5;
						return {ctor: '_Tuple2', _0: _p7._0, _1: y};
					}),
				d);
		};
		var takeYs = function (_p8) {
			return A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$second,
				_elm_lang$core$Dict$values(_p8));
		};
		var maybeMinY = function (_p9) {
			return _elm_lang$core$List$minimum(
				takeYs(_p9));
		};
		var maybeMaxY = function (_p10) {
			return _elm_lang$core$List$maximum(
				takeYs(_p10));
		};
		var takeXs = function (_p11) {
			return A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				_elm_lang$core$Dict$values(_p11));
		};
		var maybeMinX = function (_p12) {
			return _elm_lang$core$List$minimum(
				takeXs(_p12));
		};
		var maybeMaxX = function (_p13) {
			return _elm_lang$core$List$maximum(
				takeXs(_p13));
		};
		var _p14 = layout;
		switch (_p14.ctor) {
			case 'HorizontallyEquidistant':
				var max = A2(
					_elm_lang$core$Maybe$withDefault,
					0,
					maybeMaxX(d));
				var min = A2(
					_elm_lang$core$Maybe$withDefault,
					0,
					maybeMinX(d));
				var delta = (max - min) / _elm_lang$core$Basics$toFloat(
					count(d) - 1);
				var applyPos = F2(
					function (i, _p15) {
						var _p16 = _p15;
						return {
							ctor: '_Tuple2',
							_0: _p16._0,
							_1: {
								ctor: '_Tuple2',
								_0: min + (_elm_lang$core$Basics$toFloat(i) * delta),
								_1: _elm_lang$core$Tuple$second(_p16._1)
							}
						};
					});
				return _elm_lang$core$Dict$fromList(
					A2(
						_elm_lang$core$List$indexedMap,
						applyPos,
						A2(
							_elm_lang$core$List$sortBy,
							function (_p17) {
								return _elm_lang$core$Tuple$first(
									_elm_lang$core$Tuple$second(_p17));
							},
							_elm_lang$core$Dict$toList(d))));
			case 'VerticallyEquidistant':
				var max = A2(
					_elm_lang$core$Maybe$withDefault,
					0,
					maybeMaxY(d));
				var min = A2(
					_elm_lang$core$Maybe$withDefault,
					0,
					maybeMinY(d));
				var delta = (max - min) / _elm_lang$core$Basics$toFloat(
					count(d) - 1);
				var applyPos = F2(
					function (i, _p18) {
						var _p19 = _p18;
						return {
							ctor: '_Tuple2',
							_0: _p19._0,
							_1: {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Tuple$first(_p19._1),
								_1: min + (_elm_lang$core$Basics$toFloat(i) * delta)
							}
						};
					});
				return _elm_lang$core$Dict$fromList(
					A2(
						_elm_lang$core$List$indexedMap,
						applyPos,
						A2(
							_elm_lang$core$List$sortBy,
							function (_p20) {
								return _elm_lang$core$Tuple$second(
									_elm_lang$core$Tuple$second(_p20));
							},
							_elm_lang$core$Dict$toList(d))));
			case 'Align':
				switch (_p14._0.ctor) {
					case 'Top':
						return A2(
							_elm_lang$core$Maybe$withDefault,
							_elm_lang$core$Dict$empty,
							A2(
								_elm_lang$core$Maybe$map,
								setYOfAll,
								maybeMinY(d)));
					case 'Bottom':
						return A2(
							_elm_lang$core$Maybe$withDefault,
							_elm_lang$core$Dict$empty,
							A2(
								_elm_lang$core$Maybe$map,
								setYOfAll,
								maybeMaxY(d)));
					case 'Left':
						return A2(
							_elm_lang$core$Maybe$withDefault,
							_elm_lang$core$Dict$empty,
							A2(
								_elm_lang$core$Maybe$map,
								setXOfAll,
								maybeMinX(d)));
					case 'Right':
						return A2(
							_elm_lang$core$Maybe$withDefault,
							_elm_lang$core$Dict$empty,
							A2(
								_elm_lang$core$Maybe$map,
								setXOfAll,
								maybeMaxX(d)));
					default:
						var _p21 = calculatedCircle;
						if (_p21.ctor === 'Just') {
							var _p23 = _p21._0._0;
							var newPosition = F2(
								function (_p22, xy) {
									return A2(
										_user$project$BasicGeometry$add,
										_p23,
										A2(
											_user$project$BasicGeometry$scalarMult,
											_p21._0._1,
											_user$project$BasicGeometry$normalize(
												A2(_user$project$BasicGeometry$diff, xy, _p23))));
								});
							return A2(_elm_lang$core$Dict$map, newPosition, d);
						} else {
							return d;
						}
				}
			default:
				var _p24 = calculatedCircle;
				if (_p24.ctor === 'Just') {
					var _p30 = _p24._0._0;
					var correct = function (theta) {
						return (_elm_lang$core$Native_Utils.cmp(theta, 0) < 0) ? ((2 * _elm_lang$core$Basics$pi) + theta) : theta;
					};
					var unitAngle = (2 * _elm_lang$core$Basics$pi) / _elm_lang$core$Basics$toFloat(
						count(d));
					return _elm_lang$core$Dict$fromList(
						A2(
							_elm_lang$core$List$indexedMap,
							F2(
								function (i, _p25) {
									var _p26 = _p25;
									return {
										ctor: '_Tuple2',
										_0: _p26._0,
										_1: A2(
											_user$project$BasicGeometry$add,
											_p30,
											_elm_lang$core$Basics$fromPolar(
												{
													ctor: '_Tuple2',
													_0: _p26._1._0,
													_1: 1.0e-2 + (_elm_lang$core$Basics$toFloat(i) * unitAngle)
												}))
									};
								}),
							A2(
								_elm_lang$core$List$sortBy,
								function (_p27) {
									var _p28 = _p27;
									return correct(_p28._1._1);
								},
								_elm_lang$core$Dict$toList(
									A2(
										_elm_lang$core$Dict$map,
										F2(
											function (_p29, pos) {
												return _elm_lang$core$Basics$toPolar(
													A2(_user$project$BasicGeometry$diff, pos, _p30));
											}),
										d)))));
				} else {
					return d;
				}
		}
	});
var _user$project$GraphLayout$CircullaryEquidistant = {ctor: 'CircullaryEquidistant'};
var _user$project$GraphLayout$VerticallyEquidistant = {ctor: 'VerticallyEquidistant'};
var _user$project$GraphLayout$HorizontallyEquidistant = {ctor: 'HorizontallyEquidistant'};
var _user$project$GraphLayout$Align = function (a) {
	return {ctor: 'Align', _0: a};
};
var _user$project$GraphLayout$Circular = {ctor: 'Circular'};
var _user$project$GraphLayout$Right = {ctor: 'Right'};
var _user$project$GraphLayout$Left = {ctor: 'Left'};
var _user$project$GraphLayout$Top = {ctor: 'Top'};
var _user$project$GraphLayout$Bottom = {ctor: 'Bottom'};

var _user$project$KiteLogo$makePath = F2(
	function (p, f) {
		return A2(
			_elm_lang$svg$Svg$path,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$d(p),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$fill(f),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$strokeLinejoin(' round '),
						_1: {ctor: '[]'}
					}
				}
			},
			{ctor: '[]'});
	});
var _user$project$KiteLogo$p1 = A2(_user$project$KiteLogo$makePath, ' M 7 82.88249676666553 L 81.11200387944444 26.7927949348165 L 63.089701831849055 156.99450064611 L 7 82.88249676666553 Z ', ' rgb(90,99,120) ');
var _user$project$KiteLogo$p2 = A2(_user$project$KiteLogo$makePath, ' M 60.378007814103256 219.04566458270332 L 52.00523361094881 153.85963435038093 L 125.56403804642565 210.67289037954887 L 60.378007814103256 219.04566458270332 Z ', ' rgb(96,181,204) ');
var _user$project$KiteLogo$p3 = A2(_user$project$KiteLogo$makePath, ' M 100.52748519617933 272.66623868927564 L 88.09411981289722 227.88820425386382 L 132.87215424830904 215.45483887058165 L 145.30551963159124 260.2328733059935 L 100.52748519617933 272.66623868927564 Z ', ' rgb(141,215,55) ');
var _user$project$KiteLogo$p4 = A2(_user$project$KiteLogo$makePath, ' M 206.08331464172448 226.91303171419864 L 140.4076997674225 224.45630702701334 L 172.0171448609808 258.52247680775696 L 237.69275973528278 260.97920149494223 L 206.08331464172448 226.91303171419864 Z ', ' rgb(141,215,55) ');
var _user$project$KiteLogo$p5 = A2(_user$project$KiteLogo$makePath, ' M 245.0621560022909 240.65044306396032 L 203.5479525750644 219.76427882885025 L 265.94832023740105 199.13623963673393 L 245.0621560022909 240.65044306396032 Z ', ' rgb(239,165,0) ');
var _user$project$KiteLogo$p6 = A2(_user$project$KiteLogo$makePath, ' M 247.88365430528566 156.71073142351872 L 293.35412157309463 166.30747822127492 L 238.28690750752943 202.18119869132772 L 247.88365430528566 156.71073142351872 Z ', ' rgb(239,165,0) ');
var _user$project$KiteLogo$p7 = A2(_user$project$KiteLogo$makePath, ' M 143.70248332123023 98.33982386543252 L 71.36265945579768 156.69728828713886 L 85.34501889952386 26 L 143.70248332123023 98.33982386543252 Z ', ' rgb(96,181,204) ');
var _user$project$KiteLogo$view = A2(
	_elm_lang$svg$Svg$g,
	{ctor: '[]'},
	{
		ctor: '::',
		_0: _user$project$KiteLogo$p1,
		_1: {
			ctor: '::',
			_0: _user$project$KiteLogo$p2,
			_1: {
				ctor: '::',
				_0: _user$project$KiteLogo$p3,
				_1: {
					ctor: '::',
					_0: _user$project$KiteLogo$p4,
					_1: {
						ctor: '::',
						_0: _user$project$KiteLogo$p5,
						_1: {
							ctor: '::',
							_0: _user$project$KiteLogo$p6,
							_1: {
								ctor: '::',
								_0: _user$project$KiteLogo$p7,
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		}
	});

var _user$project$PageLayout$calculate = function (_p0) {
	var _p1 = _p0;
	var _p4 = _p1.windowWidth;
	var _p3 = _p1.windowHeight;
	return {
		browserWindow: {top: 0, left: 0, width: _p4, height: _p3},
		leftBar: {top: 0, left: 0, width: 250, height: _p3},
		rightBar: {top: 0, left: _p4 - 250, width: 250, height: _p3},
		tabsBar: {top: 0, left: 250, width: _p4 - 500, height: 65},
		bottomBar: {top: _p3 - 40, left: 0, width: _p4, height: 40},
		graphSvg: {top: 0, left: 0, width: _p4, height: _p3},
		welcomeWindow: function () {
			var _p2 = {
				ctor: '_Tuple2',
				_0: A2(_elm_lang$core$Basics$min, _p4 - 60, 600),
				_1: A2(_elm_lang$core$Basics$min, _p3 - 60, 500)
			};
			var w = _p2._0;
			var h = _p2._1;
			return {top: ((_p3 / 2) | 0) - ((h / 2) | 0), left: ((_p4 / 2) | 0) - ((w / 2) | 0), width: w, height: h};
		}()
	};
};
var _user$project$PageLayout$update = F2(
	function (msg, model) {
		var _p5 = msg;
		return _user$project$PageLayout$calculate(
			{windowWidth: _p5._0.width, windowHeight: _p5._0.height});
	});
var _user$project$PageLayout$dimensions = function (el) {
	return {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
		_1: {
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'top',
				_1: A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(el.top),
					'px')
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'left',
					_1: A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(el.left),
						'px')
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'width',
						_1: A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(el.width),
							'px')
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'height',
							_1: A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(el.height),
								'px')
						},
						_1: {ctor: '[]'}
					}
				}
			}
		}
	};
};
var _user$project$PageLayout$Model = F7(
	function (a, b, c, d, e, f, g) {
		return {browserWindow: a, leftBar: b, rightBar: c, tabsBar: d, bottomBar: e, graphSvg: f, welcomeWindow: g};
	});
var _user$project$PageLayout$UpdateSize = function (a) {
	return {ctor: 'UpdateSize', _0: a};
};
var _user$project$PageLayout$initialCmd = A2(_elm_lang$core$Task$perform, _user$project$PageLayout$UpdateSize, _elm_lang$window$Window$size);
var _user$project$PageLayout$subscriptions = _elm_lang$window$Window$resizes(_user$project$PageLayout$UpdateSize);

var _user$project$Widgets$update = F2(
	function (msg, _p0) {
		var _p1 = _p0;
		var _p5 = _p1.widgetDict;
		var _p4 = _p1;
		var _p2 = msg;
		switch (_p2.ctor) {
			case 'Filter':
				var isToShow = function (_p3) {
					return A2(
						_elm_lang$core$String$contains,
						_elm_lang$core$String$toLower(_p2._0),
						_elm_lang$core$String$toLower(_p3));
				};
				var setVisibility = F2(
					function (name, w) {
						return isToShow(name) ? _elm_lang$core$Native_Utils.update(
							w,
							{visible: true}) : _elm_lang$core$Native_Utils.update(
							w,
							{visible: false});
					});
				var newWidgetDict = A2(_elm_lang$core$Dict$map, setVisibility, _p5);
				var newModel = _elm_lang$core$Native_Utils.update(
					_p4,
					{
						widgetDict: newWidgetDict,
						maybeNameOfTheActiveWidget: _elm_lang$core$List$head(
							_elm_lang$core$Dict$keys(newWidgetDict))
					});
				return newModel;
			case 'Activate':
				var newModel = _elm_lang$core$Native_Utils.update(
					_p4,
					{
						maybeNameOfTheActiveWidget: _elm_lang$core$Maybe$Just(_p2._0)
					});
				return newModel;
			default:
				var $switch = function (w) {
					return _elm_lang$core$Native_Utils.update(
						w,
						{expanded: !w.expanded});
				};
				var newModel = _elm_lang$core$Native_Utils.update(
					_p4,
					{
						widgetDict: A3(
							_elm_lang$core$Dict$update,
							_p2._0,
							_elm_lang$core$Maybe$map($switch),
							_p5)
					});
				return newModel;
		}
	});
var _user$project$Widgets$initialModel = function (widgetNames) {
	return {
		widgetDict: _elm_lang$core$Dict$fromList(
			A2(
				_elm_lang$core$List$map,
				function (str) {
					return {
						ctor: '_Tuple2',
						_0: str,
						_1: {visible: true, expanded: false}
					};
				},
				widgetNames)),
		maybeNameOfTheActiveWidget: _elm_lang$core$Maybe$Just('Select and Edit')
	};
};
var _user$project$Widgets$Model = F2(
	function (a, b) {
		return {widgetDict: a, maybeNameOfTheActiveWidget: b};
	});
var _user$project$Widgets$SwitchExpanded = function (a) {
	return {ctor: 'SwitchExpanded', _0: a};
};
var _user$project$Widgets$Activate = function (a) {
	return {ctor: 'Activate', _0: a};
};
var _user$project$Widgets$Filter = function (a) {
	return {ctor: 'Filter', _0: a};
};

var _user$project$Widgets_AddRemoveVerticesAndEdges$drawHalfEdge = F2(
	function (model, graph) {
		var _p0 = model.state;
		if (_p0.ctor === 'DraggingEdge') {
			var _p1 = _p0._0.endOfHalfEdge;
			var x2_ = _p1._0;
			var y2_ = _p1._1;
			var _p2 = function () {
				var _p3 = A2(_elm_lang$core$Dict$get, _p0._0.source, graph.vertices);
				if (_p3.ctor === 'Nothing') {
					return _elm_lang$core$Native_Utils.crashCase(
						'Widgets.AddRemoveVerticesAndEdges',
						{
							start: {line: 360, column: 21},
							end: {line: 365, column: 37}
						},
						_p3)('');
				} else {
					return _p3._0.position;
				}
			}();
			var x1_ = _p2._0;
			var y1_ = _p2._1;
			return A2(
				_elm_lang$svg$Svg$line,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$x1(
						_elm_lang$core$Basics$toString(x1_)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$y1(
							_elm_lang$core$Basics$toString(y1_)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$x2(
								_elm_lang$core$Basics$toString(x2_)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$y2(
									_elm_lang$core$Basics$toString(y2_)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke('#ffae00'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeWidth('3px'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$strokeLinecap('round'),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				},
				{ctor: '[]'});
		} else {
			return A2(
				_elm_lang$svg$Svg$g,
				{ctor: '[]'},
				{ctor: '[]'});
		}
	});
var _user$project$Widgets_AddRemoveVerticesAndEdges$createNewVertexName = F2(
	function (suggestedName, existingNames) {
		var $try = function (i) {
			$try:
			while (true) {
				var nameToTry = A2(
					_elm_lang$core$Basics_ops['++'],
					suggestedName,
					A2(
						_elm_lang$core$Basics_ops['++'],
						'-',
						_elm_lang$core$Basics$toString(i)));
				if (A2(_elm_lang$core$Set$member, nameToTry, existingNames)) {
					var _v2 = i + 1;
					i = _v2;
					continue $try;
				} else {
					return nameToTry;
				}
			}
		};
		return A2(_elm_lang$core$Set$member, suggestedName, existingNames) ? $try(0) : suggestedName;
	});
var _user$project$Widgets_AddRemoveVerticesAndEdges$explanations = '\n    To add a vertex, click on the background.\n    To add an edge, drag.\n    To remove a vertex or edge, click on it whilst holding the alt key.\n    ';
var _user$project$Widgets_AddRemoveVerticesAndEdges$viewMenu = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$p,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text(_user$project$Widgets_AddRemoveVerticesAndEdges$explanations),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Widgets_AddRemoveVerticesAndEdges$widgetName = 'Add/Remove';
var _user$project$Widgets_AddRemoveVerticesAndEdges$Model = F4(
	function (a, b, c, d) {
		return {state: a, vertexNamePrefix: b, vertexProp: c, edgeProp: d};
	});
var _user$project$Widgets_AddRemoveVerticesAndEdges$ReadyToRemove = function (a) {
	return {ctor: 'ReadyToRemove', _0: a};
};
var _user$project$Widgets_AddRemoveVerticesAndEdges$DraggingEdge = function (a) {
	return {ctor: 'DraggingEdge', _0: a};
};
var _user$project$Widgets_AddRemoveVerticesAndEdges$ReadyToAdd = {ctor: 'ReadyToAdd'};
var _user$project$Widgets_AddRemoveVerticesAndEdges$initialModel = {state: _user$project$Widgets_AddRemoveVerticesAndEdges$ReadyToAdd, vertexNamePrefix: 'vertex', vertexProp: _user$project$Digraph$standardVertexProp, edgeProp: _user$project$Digraph$standardEdgeProp};
var _user$project$Widgets_AddRemoveVerticesAndEdges$update = F3(
	function (msg, graph, _p5) {
		var _p6 = _p5;
		var _p8 = _p6;
		var _p7 = msg;
		switch (_p7.ctor) {
			case 'NoOp':
				return {ctor: '_Tuple2', _0: _p8, _1: _elm_lang$core$Maybe$Nothing};
			case 'StartDraggingEdge':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						_p8,
						{
							state: _user$project$Widgets_AddRemoveVerticesAndEdges$DraggingEdge(_p7._0)
						}),
					_1: _elm_lang$core$Maybe$Nothing
				};
			case 'DragEdge':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						_p8,
						{
							state: _user$project$Widgets_AddRemoveVerticesAndEdges$DraggingEdge(_p7._0)
						}),
					_1: _elm_lang$core$Maybe$Nothing
				};
			case 'FinishEdge':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						_p8,
						{state: _user$project$Widgets_AddRemoveVerticesAndEdges$ReadyToAdd}),
					_1: _elm_lang$core$Maybe$Just(
						_user$project$Digraph$AddEdge(
							{source: _p7._0.source, target: _p7._0.target, edgeProp: _user$project$Digraph$standardEdgeProp}))
				};
			case 'CancelDraggingEdge':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						_p8,
						{state: _user$project$Widgets_AddRemoveVerticesAndEdges$ReadyToAdd}),
					_1: _elm_lang$core$Maybe$Nothing
				};
			case 'CallAddVertex':
				var existingVertexIds = _elm_lang$core$Set$fromList(
					_elm_lang$core$Dict$keys(graph.vertices));
				var newVertexId = A2(_user$project$Widgets_AddRemoveVerticesAndEdges$createNewVertexName, _p6.vertexNamePrefix, existingVertexIds);
				var propertiesOfTheNewVertex = {
					vertexName: newVertexId,
					vertexProp: _elm_lang$core$Native_Utils.update(
						_p6.vertexProp,
						{position: _p7._0})
				};
				return {
					ctor: '_Tuple2',
					_0: _p8,
					_1: _elm_lang$core$Maybe$Just(
						_user$project$Digraph$AddVertex(propertiesOfTheNewVertex))
				};
			case 'SetReadyToRemove':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						_p8,
						{
							state: _user$project$Widgets_AddRemoveVerticesAndEdges$ReadyToRemove(_p7._0)
						}),
					_1: _elm_lang$core$Maybe$Nothing
				};
			case 'GetReadyToAdd':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						_p8,
						{state: _user$project$Widgets_AddRemoveVerticesAndEdges$ReadyToAdd}),
					_1: _elm_lang$core$Maybe$Nothing
				};
			case 'CallRemoveEdge':
				return {
					ctor: '_Tuple2',
					_0: _p8,
					_1: _elm_lang$core$Maybe$Just(
						_user$project$Digraph$RemoveEdges(
							{
								edgeNames: {
									ctor: '::',
									_0: _p7._0,
									_1: {ctor: '[]'}
								}
							}))
				};
			default:
				return {
					ctor: '_Tuple2',
					_0: _p8,
					_1: _elm_lang$core$Maybe$Just(
						_user$project$Digraph$RemoveVertices(
							{
								vertexNames: {
									ctor: '::',
									_0: _p7._0,
									_1: {ctor: '[]'}
								}
							}))
				};
		}
	});
var _user$project$Widgets_AddRemoveVerticesAndEdges$V = function (a) {
	return {ctor: 'V', _0: a};
};
var _user$project$Widgets_AddRemoveVerticesAndEdges$E = function (a) {
	return {ctor: 'E', _0: a};
};
var _user$project$Widgets_AddRemoveVerticesAndEdges$NoSelection = {ctor: 'NoSelection'};
var _user$project$Widgets_AddRemoveVerticesAndEdges$CallRemoveVertex = function (a) {
	return {ctor: 'CallRemoveVertex', _0: a};
};
var _user$project$Widgets_AddRemoveVerticesAndEdges$CallRemoveEdge = function (a) {
	return {ctor: 'CallRemoveEdge', _0: a};
};
var _user$project$Widgets_AddRemoveVerticesAndEdges$SetReadyToRemove = function (a) {
	return {ctor: 'SetReadyToRemove', _0: a};
};
var _user$project$Widgets_AddRemoveVerticesAndEdges$CallAddVertex = function (a) {
	return {ctor: 'CallAddVertex', _0: a};
};
var _user$project$Widgets_AddRemoveVerticesAndEdges$drawInteractionRectForAddVertex = F3(
	function (model, _p10, _p9) {
		var _p11 = _p10;
		var _p12 = _p9;
		var positionToMsg = function (_p13) {
			return _user$project$Widgets_AddRemoveVerticesAndEdges$CallAddVertex(
				A2(
					_user$project$PanAndZoom_Basics$applyToPoint,
					_user$project$PanAndZoom_Basics$inverse(_p12.scaleAndTranslate),
					_user$project$BasicGeometry$toPoint(_p13)));
		};
		var events = function () {
			var _p14 = model.state;
			if (_p14.ctor === 'ReadyToAdd') {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg_Events$on,
						'click',
						A2(_elm_lang$core$Json_Decode$map, positionToMsg, _elm_lang$mouse$Mouse$position)),
					_1: {ctor: '[]'}
				};
			} else {
				return {ctor: '[]'};
			}
		}();
		return A2(
			_elm_lang$svg$Svg$rect,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$width(
						_elm_lang$core$Basics$toString(_p11.layoutWidth)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$height(
							_elm_lang$core$Basics$toString(_p11.layoutHeight)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$fill('red'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$opacity('0'),
								_1: {ctor: '[]'}
							}
						}
					}
				},
				events),
			{ctor: '[]'});
	});
var _user$project$Widgets_AddRemoveVerticesAndEdges$GetReadyToAdd = {ctor: 'GetReadyToAdd'};
var _user$project$Widgets_AddRemoveVerticesAndEdges$CancelDraggingEdge = {ctor: 'CancelDraggingEdge'};
var _user$project$Widgets_AddRemoveVerticesAndEdges$FinishEdge = function (a) {
	return {ctor: 'FinishEdge', _0: a};
};
var _user$project$Widgets_AddRemoveVerticesAndEdges$DragEdge = function (a) {
	return {ctor: 'DragEdge', _0: a};
};
var _user$project$Widgets_AddRemoveVerticesAndEdges$StartDraggingEdge = function (a) {
	return {ctor: 'StartDraggingEdge', _0: a};
};
var _user$project$Widgets_AddRemoveVerticesAndEdges$NoOp = {ctor: 'NoOp'};
var _user$project$Widgets_AddRemoveVerticesAndEdges$subscriptions = F2(
	function (_p15, model) {
		var _p16 = _p15;
		return _elm_lang$core$Platform_Sub$batch(
			{
				ctor: '::',
				_0: function () {
					var _p17 = model.state;
					if (_p17.ctor === 'DraggingEdge') {
						var positionToMsg = function (p) {
							return _user$project$Widgets_AddRemoveVerticesAndEdges$DragEdge(
								{
									source: _p17._0.source,
									endOfHalfEdge: A2(
										_user$project$PanAndZoom_Basics$applyToPoint,
										_user$project$PanAndZoom_Basics$inverse(_p16.scaleAndTranslate),
										_user$project$BasicGeometry$toPoint(p))
								});
						};
						return _elm_lang$core$Platform_Sub$batch(
							{
								ctor: '::',
								_0: _elm_lang$mouse$Mouse$moves(positionToMsg),
								_1: {
									ctor: '::',
									_0: _elm_lang$mouse$Mouse$ups(
										function (_p18) {
											return _user$project$Widgets_AddRemoveVerticesAndEdges$CancelDraggingEdge;
										}),
									_1: {ctor: '[]'}
								}
							});
					} else {
						return _elm_lang$core$Platform_Sub$none;
					}
				}(),
				_1: {
					ctor: '::',
					_0: _elm_lang$keyboard$Keyboard$downs(
						function (keyCode) {
							return _elm_lang$core$Native_Utils.eq(keyCode, 18) ? _user$project$Widgets_AddRemoveVerticesAndEdges$SetReadyToRemove(_user$project$Widgets_AddRemoveVerticesAndEdges$NoSelection) : _user$project$Widgets_AddRemoveVerticesAndEdges$NoOp;
						}),
					_1: {
						ctor: '::',
						_0: _elm_lang$keyboard$Keyboard$ups(
							function (keyCode) {
								return _elm_lang$core$Native_Utils.eq(keyCode, 18) ? _user$project$Widgets_AddRemoveVerticesAndEdges$GetReadyToAdd : _user$project$Widgets_AddRemoveVerticesAndEdges$NoOp;
							}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _user$project$Widgets_AddRemoveVerticesAndEdges$drawEdgeHandle = F4(
	function (model, graph, _p20, _p19) {
		var _p21 = _p20;
		var _p29 = _p21._1;
		var _p28 = _p21._0;
		var _p22 = _p19;
		var doIfInRemoveMode = function (foo) {
			var _p23 = model.state;
			if (_p23.ctor === 'ReadyToRemove') {
				return foo;
			} else {
				return _user$project$Widgets_AddRemoveVerticesAndEdges$NoOp;
			}
		};
		var _p24 = {
			ctor: '_Tuple2',
			_0: A2(_elm_lang$core$Dict$get, _p28, graph.vertices),
			_1: A2(_elm_lang$core$Dict$get, _p29, graph.vertices)
		};
		if (((_p24.ctor === '_Tuple2') && (_p24._0.ctor === 'Just')) && (_p24._1.ctor === 'Just')) {
			var _p26 = _p24._1._0;
			var _p25 = _p24._0._0;
			return A2(
				_elm_lang$svg$Svg$line,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$stroke(_p22.color),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
							_elm_lang$core$Basics$toString(4 * _p22.thickness)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$strokeOpacity('0'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$cursor('pointer'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$x1(
										_elm_lang$core$Basics$toString(
											_elm_lang$core$Tuple$first(_p25.position))),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$y1(
											_elm_lang$core$Basics$toString(
												_elm_lang$core$Tuple$second(_p25.position))),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$x2(
												_elm_lang$core$Basics$toString(
													_elm_lang$core$Tuple$first(_p26.position))),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$y2(
													_elm_lang$core$Basics$toString(
														_elm_lang$core$Tuple$second(_p26.position))),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Events$onMouseOver(
														doIfInRemoveMode(
															_user$project$Widgets_AddRemoveVerticesAndEdges$SetReadyToRemove(
																_user$project$Widgets_AddRemoveVerticesAndEdges$E(
																	{ctor: '_Tuple2', _0: _p28, _1: _p29})))),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Events$onMouseDown(
															doIfInRemoveMode(
																_user$project$Widgets_AddRemoveVerticesAndEdges$CallRemoveEdge(
																	{ctor: '_Tuple2', _0: _p28, _1: _p29}))),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Events$onMouseOut(
																doIfInRemoveMode(
																	_user$project$Widgets_AddRemoveVerticesAndEdges$SetReadyToRemove(_user$project$Widgets_AddRemoveVerticesAndEdges$NoSelection))),
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				},
				{ctor: '[]'});
		} else {
			return _elm_lang$core$Native_Utils.crashCase(
				'Widgets.AddRemoveVerticesAndEdges',
				{
					start: {line: 242, column: 9},
					end: {line: 260, column: 31}
				},
				_p24)('');
		}
	});
var _user$project$Widgets_AddRemoveVerticesAndEdges$drawInvisibleEdgeHandles = F2(
	function (model, graph) {
		var es = _elm_lang$core$Dict$values(
			A2(
				_elm_lang$core$Dict$map,
				A2(_user$project$Widgets_AddRemoveVerticesAndEdges$drawEdgeHandle, model, graph),
				graph.edges));
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$id('edge-handles-for-removal'),
				_1: {ctor: '[]'}
			},
			es);
	});
var _user$project$Widgets_AddRemoveVerticesAndEdges$drawInvisibleVertexHandles = F2(
	function (model, graph) {
		var positionToMsg = F2(
			function (v, p) {
				return _user$project$Widgets_AddRemoveVerticesAndEdges$StartDraggingEdge(
					{
						source: v,
						endOfHalfEdge: A2(
							_user$project$PanAndZoom_Basics$applyToPoint,
							_user$project$PanAndZoom_Basics$inverse(graph.scaleAndTranslate),
							_user$project$BasicGeometry$toPoint(p))
					});
			});
		var drawVertex = F2(
			function (v, _p30) {
				var _p31 = _p30;
				var _p35 = _p31.position;
				var doIfInRemoveMode = function (foo) {
					var _p32 = model.state;
					if (_p32.ctor === 'ReadyToRemove') {
						return foo;
					} else {
						return _user$project$Widgets_AddRemoveVerticesAndEdges$NoOp;
					}
				};
				var isTheVertexToRemove = function () {
					var _p33 = model.state;
					if ((_p33.ctor === 'ReadyToRemove') && (_p33._0.ctor === 'V')) {
						return _elm_lang$core$Native_Utils.eq(_p33._0._0, v);
					} else {
						return false;
					}
				}();
				var events = function () {
					var _p34 = model.state;
					switch (_p34.ctor) {
						case 'ReadyToAdd':
							return {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg_Events$on,
									'mousedown',
									A2(
										_elm_lang$core$Json_Decode$map,
										positionToMsg(v),
										_elm_lang$mouse$Mouse$position)),
								_1: {ctor: '[]'}
							};
						case 'DraggingEdge':
							return {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Events$onMouseUp(
									_user$project$Widgets_AddRemoveVerticesAndEdges$FinishEdge(
										{source: _p34._0.source, target: v})),
								_1: {ctor: '[]'}
							};
						default:
							return {ctor: '[]'};
					}
				}();
				return A2(
					_elm_lang$svg$Svg$circle,
					A2(
						_elm_lang$core$Basics_ops['++'],
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$cx(
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Tuple$first(_p35))),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$cy(
									_elm_lang$core$Basics$toString(
										_elm_lang$core$Tuple$second(_p35))),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$r(
										_elm_lang$core$Basics$toString(2 * _p31.radius)),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeWidth('4px'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$cursor('pointer'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$opacity('0'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Events$onMouseOver(
														doIfInRemoveMode(
															_user$project$Widgets_AddRemoveVerticesAndEdges$SetReadyToRemove(
																_user$project$Widgets_AddRemoveVerticesAndEdges$V(v)))),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Events$onMouseDown(
															doIfInRemoveMode(
																_user$project$Widgets_AddRemoveVerticesAndEdges$CallRemoveVertex(v))),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Events$onMouseOut(
																doIfInRemoveMode(
																	_user$project$Widgets_AddRemoveVerticesAndEdges$SetReadyToRemove(_user$project$Widgets_AddRemoveVerticesAndEdges$NoSelection))),
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}
							}
						},
						events),
					{ctor: '[]'});
			});
		var vs = _elm_lang$core$Dict$values(
			A2(_elm_lang$core$Dict$map, drawVertex, graph.vertices));
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$id('vertex-handles-for-edge-drawing'),
				_1: {ctor: '[]'}
			},
			vs);
	});
var _user$project$Widgets_AddRemoveVerticesAndEdges$view = F3(
	function (model, graph, sizes) {
		return A2(
			_elm_lang$svg$Svg$g,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A3(_user$project$Widgets_AddRemoveVerticesAndEdges$drawInteractionRectForAddVertex, model, sizes, graph),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$g,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$transform(
								_user$project$PanAndZoom_Basics$extractTransformForSvg(graph.scaleAndTranslate)),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(_user$project$Widgets_AddRemoveVerticesAndEdges$drawInvisibleEdgeHandles, model, graph),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Widgets_AddRemoveVerticesAndEdges$drawHalfEdge, model, graph),
								_1: {
									ctor: '::',
									_0: A2(_user$project$Widgets_AddRemoveVerticesAndEdges$drawInvisibleVertexHandles, model, graph),
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {ctor: '[]'}
				}
			});
	});

var _user$project$Widgets_D3Force$createLinksForD3 = function (graph) {
	return A2(
		_elm_lang$core$List$map,
		function (_p0) {
			var _p1 = _p0;
			var _p2 = _p1._1.force;
			return {source: _p1._0._0, target: _p1._0._1, strength: _p2.strength, distance: _p2.distance};
		},
		_elm_lang$core$Dict$toList(graph.edges));
};
var _user$project$Widgets_D3Force$createNodesForD3 = function (graph) {
	return A2(
		_elm_lang$core$List$map,
		function (_p3) {
			var _p4 = _p3;
			var _p9 = _p4._1.force;
			var _p5 = _p4._1.position;
			var x = _p5._0;
			var y = _p5._1;
			var _p6 = _p9.fixed ? {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just(x),
				_1: _elm_lang$core$Maybe$Just(y)
			} : {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Maybe$Nothing};
			var maybefx = _p6._0;
			var maybefy = _p6._1;
			return {
				id: _p4._0,
				x: x,
				y: y,
				fx: maybefx,
				fy: maybefy,
				gC: A2(
					_elm_lang$core$Maybe$map,
					function (_p7) {
						var _p8 = _p7;
						return {x: _p8._0, y: _p8._1};
					},
					_p9.gC),
				pullStrengthTogC: _p9.pullStrengthTogC,
				charge: _p9.charge,
				radius: _p4._1.radius
			};
		},
		_elm_lang$core$Dict$toList(graph.vertices));
};
var _user$project$Widgets_D3Force$initialModel = 20398;
var _user$project$Widgets_D3Force$widgetName = 'D3 Force';
var _user$project$Widgets_D3Force$toD3_Fire = _elm_lang$core$Native_Platform.outgoingPort(
	'toD3_Fire',
	function (v) {
		return [
			_elm_lang$core$Native_List.toArray(v._0).map(
			function (v) {
				return {
					id: v.id,
					x: v.x,
					y: v.y,
					fx: (v.fx.ctor === 'Nothing') ? null : v.fx._0,
					fy: (v.fy.ctor === 'Nothing') ? null : v.fy._0,
					gC: (v.gC.ctor === 'Nothing') ? null : {x: v.gC._0.x, y: v.gC._0.y},
					pullStrengthTogC: v.pullStrengthTogC,
					charge: v.charge,
					radius: v.radius
				};
			}),
			_elm_lang$core$Native_List.toArray(v._1).map(
			function (v) {
				return {source: v.source, target: v.target, strength: v.strength, distance: v.distance};
			})
		];
	});
var _user$project$Widgets_D3Force$startForceCmd = function (graph) {
	return _user$project$Widgets_D3Force$toD3_Fire(
		{
			ctor: '_Tuple2',
			_0: _user$project$Widgets_D3Force$createNodesForD3(graph),
			_1: _user$project$Widgets_D3Force$createLinksForD3(graph)
		});
};
var _user$project$Widgets_D3Force$fromD3_Positions = _elm_lang$core$Native_Platform.incomingPort(
	'fromD3_Positions',
	_elm_lang$core$Json_Decode$list(
		A2(
			_elm_lang$core$Json_Decode$andThen,
			function (vertexName) {
				return A2(
					_elm_lang$core$Json_Decode$andThen,
					function (position) {
						return _elm_lang$core$Json_Decode$succeed(
							{vertexName: vertexName, position: position});
					},
					A2(
						_elm_lang$core$Json_Decode$field,
						'position',
						A2(
							_elm_lang$core$Json_Decode$andThen,
							function (x) {
								return A2(
									_elm_lang$core$Json_Decode$andThen,
									function (y) {
										return _elm_lang$core$Json_Decode$succeed(
											{x: x, y: y});
									},
									A2(_elm_lang$core$Json_Decode$field, 'y', _elm_lang$core$Json_Decode$float));
							},
							A2(_elm_lang$core$Json_Decode$field, 'x', _elm_lang$core$Json_Decode$float))));
			},
			A2(_elm_lang$core$Json_Decode$field, 'vertexName', _elm_lang$core$Json_Decode$string))));
var _user$project$Widgets_D3Force$fromD3_SimulationEnded = _elm_lang$core$Native_Platform.incomingPort(
	'fromD3_SimulationEnded',
	_elm_lang$core$Json_Decode$null(
		{ctor: '_Tuple0'}));
var _user$project$Widgets_D3Force$fromD3_Alpha = _elm_lang$core$Native_Platform.incomingPort('fromD3_Alpha', _elm_lang$core$Json_Decode$float);
var _user$project$Widgets_D3Force$EndForce = {ctor: 'EndForce'};
var _user$project$Widgets_D3Force$StartForce = {ctor: 'StartForce'};
var _user$project$Widgets_D3Force$viewMenu = A2(
	_elm_lang$html$Html$div,
	{ctor: '[]'},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$html$Html$p,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'padding-left', _1: '10px'},
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A3(_user$project$HtmlHelpers$myMaterialButton, 'Start Force (F)', _elm_community$elm_material_icons$Material_Icons_Device$battery_charging_full, _user$project$Widgets_D3Force$StartForce),
				_1: {ctor: '[]'}
			}),
		_1: {ctor: '[]'}
	});
var _user$project$Widgets_D3Force$ConvertedNodesFromD3 = function (a) {
	return {ctor: 'ConvertedNodesFromD3', _0: a};
};
var _user$project$Widgets_D3Force$NoOp = {ctor: 'NoOp'};
var _user$project$Widgets_D3Force$subscriptions = _elm_lang$core$Platform_Sub$batch(
	{
		ctor: '::',
		_0: _user$project$Widgets_D3Force$fromD3_Positions(
			function (_p10) {
				return _user$project$Widgets_D3Force$ConvertedNodesFromD3(
					A2(
						_elm_lang$core$List$map,
						function (d) {
							return _elm_lang$core$Native_Utils.update(
								d,
								{
									position: {ctor: '_Tuple2', _0: d.position.x, _1: d.position.y}
								});
						},
						_p10));
			}),
		_1: {
			ctor: '::',
			_0: _user$project$Widgets_D3Force$fromD3_SimulationEnded(
				function (_p11) {
					return _user$project$Widgets_D3Force$EndForce;
				}),
			_1: {
				ctor: '::',
				_0: _elm_lang$keyboard$Keyboard$downs(
					function (keyCode) {
						return _elm_lang$core$Native_Utils.eq(
							_elm_lang$core$Char$fromCode(keyCode),
							_elm_lang$core$Native_Utils.chr('F')) ? _user$project$Widgets_D3Force$StartForce : _user$project$Widgets_D3Force$NoOp;
					}),
				_1: {ctor: '[]'}
			}
		}
	});
var _user$project$Widgets_D3Force$NoCall = {ctor: 'NoCall'};
var _user$project$Widgets_D3Force$ResumeRecording = {ctor: 'ResumeRecording'};
var _user$project$Widgets_D3Force$PauseRecording = {ctor: 'PauseRecording'};
var _user$project$Widgets_D3Force$update = F2(
	function (msg, graph) {
		var _p12 = msg;
		switch (_p12.ctor) {
			case 'NoOp':
				return {ctor: '_Tuple3', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none, _2: _user$project$Widgets_D3Force$NoCall};
			case 'ConvertedNodesFromD3':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Maybe$Just(
						_user$project$Digraph$MoveVertices(_p12._0)),
					_1: _elm_lang$core$Platform_Cmd$none,
					_2: _user$project$Widgets_D3Force$NoCall
				};
			case 'StartForce':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Maybe$Nothing,
					_1: _user$project$Widgets_D3Force$startForceCmd(graph),
					_2: _user$project$Widgets_D3Force$PauseRecording
				};
			default:
				return {ctor: '_Tuple3', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none, _2: _user$project$Widgets_D3Force$ResumeRecording};
		}
	});

var _user$project$PanAndZoom$getDelta = function (drag) {
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Basics$toFloat(drag.current.x - drag.start.x),
		_1: _elm_lang$core$Basics$toFloat(drag.current.y - drag.start.y)
	};
};
var _user$project$PanAndZoom$setZoomSensitivity = F2(
	function (k, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{zoomSensitivity: k});
	});
var _user$project$PanAndZoom$setScaleAndTranslate = F2(
	function (scaleAndTranslate, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{scaleAndTranslate: scaleAndTranslate});
	});
var _user$project$PanAndZoom$setScaleLimits = F2(
	function (_p0, model) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Utils.update(
			model,
			{minScale: _p1.minScale, maxScale: _p1.maxScale});
	});
var _user$project$PanAndZoom$Model = F6(
	function (a, b, c, d, e, f) {
		return {scaleAndTranslate: a, minScale: b, maxScale: c, zoomSensitivity: d, state: e, maybeDrag: f};
	});
var _user$project$PanAndZoom$Position = F2(
	function (a, b) {
		return {x: a, y: b};
	});
var _user$project$PanAndZoom$Drag = F2(
	function (a, b) {
		return {start: a, current: b};
	});
var _user$project$PanAndZoom$Zooming = function (a) {
	return {ctor: 'Zooming', _0: a};
};
var _user$project$PanAndZoom$Panning = function (a) {
	return {ctor: 'Panning', _0: a};
};
var _user$project$PanAndZoom$Idle = {ctor: 'Idle'};
var _user$project$PanAndZoom$initialModel = {scaleAndTranslate: _user$project$PanAndZoom_Basics$default, minScale: 0.4, maxScale: 8, zoomSensitivity: 2.0e-2, state: _user$project$PanAndZoom$Idle, maybeDrag: _elm_lang$core$Maybe$Nothing};
var _user$project$PanAndZoom$updateHelper = F2(
	function (msg, model) {
		var _p2 = msg;
		switch (_p2.ctor) {
			case 'NoOp':
				return model;
			case 'ActivatePanning':
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						state: _user$project$PanAndZoom$Panning(_elm_lang$core$Maybe$Nothing)
					});
			case 'ActivateZooming':
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						state: _user$project$PanAndZoom$Zooming(_elm_lang$core$Maybe$Nothing)
					});
			case 'DragStart':
				var _p4 = _p2._0;
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						maybeDrag: _elm_lang$core$Maybe$Just(
							A2(_user$project$PanAndZoom$Drag, _p4, _p4)),
						state: function () {
							var _p3 = model.state;
							switch (_p3.ctor) {
								case 'Panning':
									return _user$project$PanAndZoom$Panning(
										_elm_lang$core$Maybe$Just(
											{
												translateAtStart: _user$project$PanAndZoom_Basics$getTranslate(model.scaleAndTranslate)
											}));
								case 'Zooming':
									return _user$project$PanAndZoom$Zooming(
										_elm_lang$core$Maybe$Just(
											{
												translateAtStart: _user$project$PanAndZoom_Basics$getTranslate(model.scaleAndTranslate),
												scaleAtStart: _user$project$PanAndZoom_Basics$getScale(model.scaleAndTranslate),
												center: {
													ctor: '_Tuple2',
													_0: _elm_lang$core$Basics$toFloat(_p4.x),
													_1: _elm_lang$core$Basics$toFloat(_p4.y)
												}
											}));
								default:
									return _user$project$PanAndZoom$Idle;
							}
						}()
					});
			case 'DragAt':
				var newMaybeDrag = A2(
					_elm_lang$core$Maybe$map,
					function (drag) {
						return A2(_user$project$PanAndZoom$Drag, drag.start, _p2._0);
					},
					model.maybeDrag);
				return _elm_lang$core$Native_Utils.update(
					model,
					{
						maybeDrag: newMaybeDrag,
						scaleAndTranslate: function () {
							var _p5 = model.state;
							_v3_2:
							do {
								switch (_p5.ctor) {
									case 'Panning':
										if (_p5._0.ctor === 'Just') {
											var _p6 = A2(_elm_lang$core$Maybe$map, _user$project$PanAndZoom$getDelta, newMaybeDrag);
											if (_p6.ctor === 'Nothing') {
												return _elm_lang$core$Basics$identity;
											} else {
												return _user$project$PanAndZoom_Basics$pan(
													{translateAtStart: _p5._0._0.translateAtStart, delta: _p6._0});
											}
										} else {
											break _v3_2;
										}
									case 'Zooming':
										if (_p5._0.ctor === 'Just') {
											var _p7 = A2(_elm_lang$core$Maybe$map, _user$project$PanAndZoom$getDelta, newMaybeDrag);
											if (_p7.ctor === 'Nothing') {
												return _elm_lang$core$Basics$identity;
											} else {
												return _user$project$PanAndZoom_Basics$zoom(
													{
														translateAtStart: _p5._0._0.translateAtStart,
														scaleAtStart: _p5._0._0.scaleAtStart,
														center: _p5._0._0.center,
														minScale: model.minScale,
														maxScale: model.maxScale,
														delta: model.zoomSensitivity * (0 - _elm_lang$core$Tuple$second(_p7._0))
													});
											}
										} else {
											break _v3_2;
										}
									default:
										break _v3_2;
								}
							} while(false);
							return _elm_lang$core$Basics$identity;
						}()(model.scaleAndTranslate)
					});
			case 'DragEnd':
				return _elm_lang$core$Native_Utils.update(
					model,
					{maybeDrag: _elm_lang$core$Maybe$Nothing});
			default:
				return _elm_lang$core$Native_Utils.update(
					model,
					{state: _user$project$PanAndZoom$Idle});
		}
	});
var _user$project$PanAndZoom$update = F2(
	function (msg, model) {
		var newModel = A2(_user$project$PanAndZoom$updateHelper, msg, model);
		var _p8 = msg;
		if (_p8.ctor === 'DragAt') {
			return {
				ctor: '_Tuple2',
				_0: newModel,
				_1: _elm_lang$core$Maybe$Just(newModel.scaleAndTranslate)
			};
		} else {
			return {ctor: '_Tuple2', _0: newModel, _1: _elm_lang$core$Maybe$Nothing};
		}
	});
var _user$project$PanAndZoom$GetIdle = {ctor: 'GetIdle'};
var _user$project$PanAndZoom$DragEnd = {ctor: 'DragEnd'};
var _user$project$PanAndZoom$DragAt = function (a) {
	return {ctor: 'DragAt', _0: a};
};
var _user$project$PanAndZoom$DragStart = function (a) {
	return {ctor: 'DragStart', _0: a};
};
var _user$project$PanAndZoom$ActivateZooming = {ctor: 'ActivateZooming'};
var _user$project$PanAndZoom$ActivatePanning = {ctor: 'ActivatePanning'};
var _user$project$PanAndZoom$NoOp = {ctor: 'NoOp'};

var _user$project$Widgets_PanZoom$view = F2(
	function (model, _p0) {
		var _p1 = _p0;
		return A2(
			_elm_lang$svg$Svg$rect,
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html_Events$on,
					'mousedown',
					A2(_elm_lang$core$Json_Decode$map, _user$project$PanAndZoom$DragStart, _elm_lang$mouse$Mouse$position)),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'width',
								_1: A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(_p1.layoutWidth),
									'px')
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'height',
									_1: A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(_p1.layoutHeight),
										'px')
								},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'opacity', _1: '0'},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'cursor',
											_1: function () {
												var _p2 = model.state;
												switch (_p2.ctor) {
													case 'Idle':
														return 'crosshair';
													case 'Zooming':
														return 'ns-resize';
													default:
														if (_p2._0.ctor === 'Nothing') {
															return '-webkit-grab';
														} else {
															return '-webkit-grabbing';
														}
												}
											}()
										},
										_1: {ctor: '[]'}
									}
								}
							}
						}),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$g,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$transform(
							_user$project$PanAndZoom_Basics$extractTransformForSvg(model.scaleAndTranslate)),
						_1: {ctor: '[]'}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$Widgets_PanZoom$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: _elm_lang$keyboard$Keyboard$downs(
				function (keyCode) {
					return _elm_lang$core$Native_Utils.eq(keyCode, 16) ? _user$project$PanAndZoom$ActivatePanning : (_elm_lang$core$Native_Utils.eq(keyCode, 18) ? _user$project$PanAndZoom$ActivateZooming : _user$project$PanAndZoom$NoOp);
				}),
			_1: {
				ctor: '::',
				_0: _elm_lang$mouse$Mouse$moves(
					function () {
						var _p3 = model.state;
						if (_p3.ctor === 'Idle') {
							return function (_p4) {
								return _user$project$PanAndZoom$NoOp;
							};
						} else {
							return _user$project$PanAndZoom$DragAt;
						}
					}()),
				_1: {
					ctor: '::',
					_0: _elm_lang$keyboard$Keyboard$ups(
						function (keyCode) {
							return _user$project$PanAndZoom$GetIdle;
						}),
					_1: {
						ctor: '::',
						_0: _elm_lang$mouse$Mouse$ups(
							function (_p5) {
								return _user$project$PanAndZoom$DragEnd;
							}),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _user$project$Widgets_PanZoom$initialModel = A2(
	_user$project$PanAndZoom$setScaleLimits,
	{minScale: 0.3, maxScale: 6},
	_user$project$PanAndZoom$initialModel);
var _user$project$Widgets_PanZoom$explanations = '\n    To Pan, hold shift and drag.\n    To Zoom in or out, hold alt and drag vertically.\n    ';
var _user$project$Widgets_PanZoom$viewMenu = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$p,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text(_user$project$Widgets_PanZoom$explanations),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Widgets_PanZoom$widgetName = 'Pan and Zoom';
var _user$project$Widgets_PanZoom$NoCall = {ctor: 'NoCall'};
var _user$project$Widgets_PanZoom$ResumeRecording = {ctor: 'ResumeRecording'};
var _user$project$Widgets_PanZoom$PauseRecording = {ctor: 'PauseRecording'};
var _user$project$Widgets_PanZoom$update = F3(
	function (msg, model, scaleAndTranslate) {
		var _p6 = function () {
			var _p7 = msg;
			switch (_p7.ctor) {
				case 'ActivatePanning':
					return A2(
						_user$project$PanAndZoom$update,
						msg,
						A2(_user$project$PanAndZoom$setScaleAndTranslate, scaleAndTranslate, model));
				case 'ActivateZooming':
					return A2(
						_user$project$PanAndZoom$update,
						msg,
						A2(_user$project$PanAndZoom$setScaleAndTranslate, scaleAndTranslate, model));
				default:
					return A2(_user$project$PanAndZoom$update, msg, model);
			}
		}();
		var newModel = _p6._0;
		var maybeScaleAndTranslate = _p6._1;
		var _p8 = msg;
		switch (_p8.ctor) {
			case 'DragStart':
				return {ctor: '_Tuple3', _0: newModel, _1: maybeScaleAndTranslate, _2: _user$project$Widgets_PanZoom$PauseRecording};
			case 'DragEnd':
				return {ctor: '_Tuple3', _0: newModel, _1: maybeScaleAndTranslate, _2: _user$project$Widgets_PanZoom$ResumeRecording};
			default:
				return {ctor: '_Tuple3', _0: newModel, _1: maybeScaleAndTranslate, _2: _user$project$Widgets_PanZoom$NoCall};
		}
	});

var _user$project$Widgets_RandomGraph$initialModel = {n: 40, edgeProbability: 5.0e-2};
var _user$project$Widgets_RandomGraph$widgetName = 'Random Graph';
var _user$project$Widgets_RandomGraph$Model = F2(
	function (a, b) {
		return {n: a, edgeProbability: b};
	});
var _user$project$Widgets_RandomGraph$GraphData = function (a) {
	return {ctor: 'GraphData', _0: a};
};
var _user$project$Widgets_RandomGraph$update = F2(
	function (msg, model) {
		var _p0 = msg;
		if (_p0.ctor === 'Generate') {
			var allPossibleEdges = A2(
				_elm_lang$core$List$map,
				function (e) {
					var _p1 = e;
					if (((_p1.ctor === '::') && (_p1._1.ctor === '::')) && (_p1._1._1.ctor === '[]')) {
						return {ctor: '_Tuple2', _0: _p1._0, _1: _p1._1._0};
					} else {
						return _elm_lang$core$Native_Utils.crashCase(
							'Widgets.RandomGraph',
							{
								start: {line: 53, column: 33},
								end: {line: 58, column: 55}
							},
							_p1)('');
					}
				},
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Set$toList,
					A2(
						_user$project$Extras$subsets,
						2,
						_elm_lang$core$Set$fromList(
							A2(_elm_lang$core$List$range, 1, model.n)))));
			var generator = A2(
				_elm_lang$core$Random$map,
				function (randomFloats) {
					return {
						vertexList: A2(_elm_lang$core$List$range, 1, _p0._0.n),
						edgeList: A2(
							_elm_lang$core$List$filterMap,
							_elm_lang$core$Basics$identity,
							A3(
								_elm_lang$core$List$map2,
								F2(
									function (randomFloat, edge) {
										return (_elm_lang$core$Native_Utils.cmp(randomFloat, _p0._0.edgeProbability) < 0) ? _elm_lang$core$Maybe$Just(edge) : _elm_lang$core$Maybe$Nothing;
									}),
								randomFloats,
								allPossibleEdges))
					};
				},
				A2(
					_elm_lang$core$Random$list,
					_elm_lang$core$List$length(allPossibleEdges),
					A2(_elm_lang$core$Random$float, 0, 1)));
			return {
				ctor: '_Tuple2',
				_0: A2(_elm_lang$core$Random$generate, _user$project$Widgets_RandomGraph$GraphData, generator),
				_1: _elm_lang$core$Maybe$Nothing
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Platform_Cmd$none,
				_1: _elm_lang$core$Maybe$Just(_p0._0)
			};
		}
	});
var _user$project$Widgets_RandomGraph$Generate = function (a) {
	return {ctor: 'Generate', _0: a};
};
var _user$project$Widgets_RandomGraph$viewMenu = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$button,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onClick(
						_user$project$Widgets_RandomGraph$Generate(model)),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Generate'),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		});
};

var _user$project$Widgets_SelectAndEdit$drawSelectionRectangle = function (model) {
	return A2(
		_elm_lang$svg$Svg$g,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$id('vertex-selectors-interaction-layer-for-rectangle-selection'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: function () {
				var _p0 = model.state;
				if (_p0.ctor === 'ScalingRect') {
					var _p1 = A2(_user$project$BasicGeometry$findRect, _p0._0.dragStartPoint, _p0._0.currentMousePoint);
					var _p2 = _p1._0.position;
					return A2(
						_elm_lang$svg$Svg$rect,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$x(
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Tuple$first(_p2))),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$y(
									_elm_lang$core$Basics$toString(
										_elm_lang$core$Tuple$second(_p2))),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$width(
										_elm_lang$core$Basics$toString(_p1._0.width)),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$height(
											_elm_lang$core$Basics$toString(_p1._0.height)),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke('white'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$strokeWidth('2px'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$cursor('cross'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$fillOpacity('0.5'),
														_1: {
															ctor: '::',
															_0: _elm_lang$svg$Svg_Attributes$strokeDasharray('5, 5'),
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}
							}
						},
						{ctor: '[]'});
				} else {
					return A2(
						_elm_lang$svg$Svg$g,
						{ctor: '[]'},
						{ctor: '[]'});
				}
			}(),
			_1: {ctor: '[]'}
		});
};
var _user$project$Widgets_SelectAndEdit$correct = function (scaleAndTranslate) {
	return function (_p3) {
		return A2(
			_user$project$PanAndZoom_Basics$applyToPoint,
			_user$project$PanAndZoom_Basics$inverse(scaleAndTranslate),
			_user$project$BasicGeometry$toPoint(_p3));
	};
};
var _user$project$Widgets_SelectAndEdit$explanations = '\n    To select vertices drag a rectangle.\n    To add vertices to the selection, click on them or while holding the shift key drag a rectangle.\n    To remove vertices from the selection, hold the alt key and drag a rectangle.\n    To move the selected vertices, drag the selection.\n    To copy-and-drag the selected vertices, drag the selection, by holding the shift key pressed.\n    ';
var _user$project$Widgets_SelectAndEdit$widgetName = 'Select and Edit';
var _user$project$Widgets_SelectAndEdit$Model = F6(
	function (a, b, c, d, e, f) {
		return {time: a, state: b, selectedVertices: c, clipBoard: d, altKeyIsPressed: e, shiftKeyIsPressed: f};
	});
var _user$project$Widgets_SelectAndEdit$Animating = function (a) {
	return {ctor: 'Animating', _0: a};
};
var _user$project$Widgets_SelectAndEdit$DraggingVertices = function (a) {
	return {ctor: 'DraggingVertices', _0: a};
};
var _user$project$Widgets_SelectAndEdit$ScalingRect = function (a) {
	return {ctor: 'ScalingRect', _0: a};
};
var _user$project$Widgets_SelectAndEdit$Idle = {ctor: 'Idle'};
var _user$project$Widgets_SelectAndEdit$initialModel = {time: 0, state: _user$project$Widgets_SelectAndEdit$Idle, selectedVertices: _elm_lang$core$Set$empty, clipBoard: _user$project$Digraph$empty, altKeyIsPressed: false, shiftKeyIsPressed: false};
var _user$project$Widgets_SelectAndEdit$StartCopyDraggingVertices = function (a) {
	return {ctor: 'StartCopyDraggingVertices', _0: a};
};
var _user$project$Widgets_SelectAndEdit$AltUp = {ctor: 'AltUp'};
var _user$project$Widgets_SelectAndEdit$AltDown = {ctor: 'AltDown'};
var _user$project$Widgets_SelectAndEdit$ShiftUp = {ctor: 'ShiftUp'};
var _user$project$Widgets_SelectAndEdit$ShiftDown = {ctor: 'ShiftDown'};
var _user$project$Widgets_SelectAndEdit$PasteFromClipBoard = {ctor: 'PasteFromClipBoard'};
var _user$project$Widgets_SelectAndEdit$CopySelectionToClipBoard = {ctor: 'CopySelectionToClipBoard'};
var _user$project$Widgets_SelectAndEdit$Tick = function (a) {
	return {ctor: 'Tick', _0: a};
};
var _user$project$Widgets_SelectAndEdit$StopDraggingVertices = {ctor: 'StopDraggingVertices'};
var _user$project$Widgets_SelectAndEdit$MaybeDraggingVertices = function (a) {
	return {ctor: 'MaybeDraggingVertices', _0: a};
};
var _user$project$Widgets_SelectAndEdit$StartDraggingVertices = function (a) {
	return {ctor: 'StartDraggingVertices', _0: a};
};
var _user$project$Widgets_SelectAndEdit$StopDraggingSelectionRect = {ctor: 'StopDraggingSelectionRect'};
var _user$project$Widgets_SelectAndEdit$DragSelectionRect = function (a) {
	return {ctor: 'DragSelectionRect', _0: a};
};
var _user$project$Widgets_SelectAndEdit$StartSelectionRect = function (a) {
	return {ctor: 'StartSelectionRect', _0: a};
};
var _user$project$Widgets_SelectAndEdit$interactionRect = F2(
	function (graph, _p4) {
		var _p5 = _p4;
		return A2(
			_elm_lang$svg$Svg$rect,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$width(
					_elm_lang$core$Basics$toString(_p5.layoutWidth)),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$height(
						_elm_lang$core$Basics$toString(_p5.layoutHeight)),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$opacity('0'),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg_Events$on,
								'mousedown',
								A2(
									_elm_lang$core$Json_Decode$map,
									function (_p6) {
										return _user$project$Widgets_SelectAndEdit$StartSelectionRect(
											A2(_user$project$Widgets_SelectAndEdit$correct, graph.scaleAndTranslate, _p6));
									},
									_elm_lang$mouse$Mouse$position)),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			{ctor: '[]'});
	});
var _user$project$Widgets_SelectAndEdit$LayWithAnimation = function (a) {
	return {ctor: 'LayWithAnimation', _0: a};
};
var _user$project$Widgets_SelectAndEdit$Lay = function (a) {
	return {ctor: 'Lay', _0: a};
};
var _user$project$Widgets_SelectAndEdit$ChangeVertexColor = function (a) {
	return {ctor: 'ChangeVertexColor', _0: a};
};
var _user$project$Widgets_SelectAndEdit$SetRadius = function (a) {
	return {ctor: 'SetRadius', _0: a};
};
var _user$project$Widgets_SelectAndEdit$RemoveSelectedVerticesFromTheGraph = {ctor: 'RemoveSelectedVerticesFromTheGraph'};
var _user$project$Widgets_SelectAndEdit$viewMenu = function (model) {
	var myButton = function (s) {
		return _elm_lang$html$Html$button(
			A2(
				_elm_lang$core$Basics_ops['++'],
				s,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'type', _1: 'button'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'margin', _1: '.5em'},
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}));
	};
	var it = {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'margin-left', _1: '.5em'},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'font', _1: '1em sans-serif'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'width', _1: '50px'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'box-sizing', _1: 'border-box'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'border', _1: '1px solid #999'},
						_1: {ctor: '[]'}
					}
				}
			}
		}
	};
	var myInput = function (s) {
		return _elm_lang$html$Html$input(
			A2(
				_elm_lang$core$Basics_ops['++'],
				s,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(it),
					_1: {ctor: '[]'}
				}));
	};
	var myTextArea = function (s) {
		return _elm_lang$html$Html$textarea(
			A2(
				_elm_lang$core$Basics_ops['++'],
				s,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						A2(
							_elm_lang$core$Basics_ops['++'],
							it,
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'vertical-align', _1: 'top'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'height', _1: '5em'},
									_1: {ctor: '[]'}
								}
							})),
					_1: {ctor: '[]'}
				}));
	};
	var myDiv = _elm_lang$html$Html$div(
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'margin-top', _1: '1em'},
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		});
	var myInputCollection = F2(
		function (formName, content) {
			return A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'margin-top', _1: '10px'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'border-top', _1: '1px solid #CCC'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'padding', _1: '10px'},
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$p,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$u,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text(formName),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: content
				});
		});
	var leftPad = '100px';
	var myLabel = _elm_lang$html$Html$label(
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'display', _1: 'inline-block'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'width', _1: leftPad},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'text-align', _1: 'right'},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {ctor: '[]'}
		});
	var myButtonDiv = _elm_lang$html$Html$div(
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'margin-top', _1: '1em'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'padding-left', _1: leftPad},
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$p,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text(_user$project$Widgets_SelectAndEdit$explanations),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					myInputCollection,
					'general',
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$p,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A3(_user$project$HtmlHelpers$myMaterialButton, 'Copy', _elm_community$elm_material_icons$Material_Icons_Content$content_copy, _user$project$Widgets_SelectAndEdit$CopySelectionToClipBoard),
								_1: {
									ctor: '::',
									_0: A3(_user$project$HtmlHelpers$myMaterialButton, 'Paste', _elm_community$elm_material_icons$Material_Icons_Content$content_paste, _user$project$Widgets_SelectAndEdit$PasteFromClipBoard),
									_1: {
										ctor: '::',
										_0: A3(_user$project$HtmlHelpers$myMaterialButton, 'Delete', _elm_community$elm_material_icons$Material_Icons_Action$delete, _user$project$Widgets_SelectAndEdit$RemoveSelectedVerticesFromTheGraph),
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						myInputCollection,
						'align',
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$p,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A3(
										_user$project$HtmlHelpers$myMaterialButton,
										'Bottom',
										_elm_community$elm_material_icons$Material_Icons_Editor$vertical_align_bottom,
										_user$project$Widgets_SelectAndEdit$LayWithAnimation(
											_user$project$GraphLayout$Align(_user$project$GraphLayout$Bottom))),
									_1: {
										ctor: '::',
										_0: A3(
											_user$project$HtmlHelpers$myMaterialButton,
											'Top',
											_elm_community$elm_material_icons$Material_Icons_Editor$vertical_align_top,
											_user$project$Widgets_SelectAndEdit$LayWithAnimation(
												_user$project$GraphLayout$Align(_user$project$GraphLayout$Top))),
										_1: {
											ctor: '::',
											_0: A3(
												_user$project$HtmlHelpers$myMaterialButton,
												'Left',
												_elm_community$elm_material_icons$Material_Icons_Editor$format_align_left,
												_user$project$Widgets_SelectAndEdit$LayWithAnimation(
													_user$project$GraphLayout$Align(_user$project$GraphLayout$Left))),
											_1: {
												ctor: '::',
												_0: A3(
													_user$project$HtmlHelpers$myMaterialButton,
													'Right',
													_elm_community$elm_material_icons$Material_Icons_Editor$format_align_right,
													_user$project$Widgets_SelectAndEdit$LayWithAnimation(
														_user$project$GraphLayout$Align(_user$project$GraphLayout$Right))),
												_1: {ctor: '[]'}
											}
										}
									}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							myInputCollection,
							'distribute',
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$p,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: A2(
											myButton,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Events$onClick(
													_user$project$Widgets_SelectAndEdit$LayWithAnimation(_user$project$GraphLayout$HorizontallyEquidistant)),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Horizontally'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												myButton,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Events$onClick(
														_user$project$Widgets_SelectAndEdit$LayWithAnimation(_user$project$GraphLayout$VerticallyEquidistant)),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('Vertically'),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								myInputCollection,
								'change vertex properties',
								{
									ctor: '::',
									_0: myDiv(
										{
											ctor: '::',
											_0: myLabel(
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('radius:'),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													myInput,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$type_('number'),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$min('2'),
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$max('30'),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$html$Html_Events$onInput(
																		function (_p7) {
																			return _user$project$Widgets_SelectAndEdit$SetRadius(
																				A2(
																					_elm_lang$core$Result$withDefault,
																					6,
																					_elm_lang$core$String$toFloat(_p7)));
																		}),
																	_1: {ctor: '[]'}
																}
															}
														}
													},
													{ctor: '[]'}),
												_1: {ctor: '[]'}
											}
										}),
									_1: {
										ctor: '::',
										_0: myDiv(
											{
												ctor: '::',
												_0: myLabel(
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('color:'),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														myInput,
														{
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$type_('color'),
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html_Events$onInput(_user$project$Widgets_SelectAndEdit$ChangeVertexColor),
																_1: {ctor: '[]'}
															}
														},
														{ctor: '[]'}),
													_1: {ctor: '[]'}
												}
											}),
										_1: {
											ctor: '::',
											_0: myButtonDiv(
												{
													ctor: '::',
													_0: A2(
														myButton,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('ExampleButton'),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}
									}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									myInputCollection,
									'change edge properties',
									{
										ctor: '::',
										_0: myDiv(
											{
												ctor: '::',
												_0: myLabel(
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('TODO...'),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														myInput,
														{
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$type_('number'),
															_1: {
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$min('2'),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$html$Html_Attributes$max('30'),
																	_1: {ctor: '[]'}
																}
															}
														},
														{ctor: '[]'}),
													_1: {ctor: '[]'}
												}
											}),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		});
};
var _user$project$Widgets_SelectAndEdit$RemoveFromSelection = function (a) {
	return {ctor: 'RemoveFromSelection', _0: a};
};
var _user$project$Widgets_SelectAndEdit$SetSelectedVertices = function (a) {
	return {ctor: 'SetSelectedVertices', _0: a};
};
var _user$project$Widgets_SelectAndEdit$AddToSelected = function (a) {
	return {ctor: 'AddToSelected', _0: a};
};
var _user$project$Widgets_SelectAndEdit$drawVertexHandles = F2(
	function (_p8, graph) {
		var _p9 = _p8;
		var drawVertex = F2(
			function (vertexName, _p10) {
				var _p11 = _p10;
				var _p12 = _p11.position;
				var x_ = _p12._0;
				var y_ = _p12._1;
				var isSelected = A2(_elm_lang$core$Set$member, vertexName, _p9.selectedVertices);
				var onMouseDownDecMsg = isSelected ? (_p9.shiftKeyIsPressed ? A2(
					_elm_lang$core$Json_Decode$map,
					function (_p13) {
						return _user$project$Widgets_SelectAndEdit$StartCopyDraggingVertices(
							A2(_user$project$Widgets_SelectAndEdit$correct, graph.scaleAndTranslate, _p13));
					},
					_elm_lang$mouse$Mouse$position) : A2(
					_elm_lang$core$Json_Decode$map,
					function (_p14) {
						return _user$project$Widgets_SelectAndEdit$StartDraggingVertices(
							A2(_user$project$Widgets_SelectAndEdit$correct, graph.scaleAndTranslate, _p14));
					},
					_elm_lang$mouse$Mouse$position)) : _elm_lang$core$Json_Decode$succeed(
					_user$project$Widgets_SelectAndEdit$AddToSelected(vertexName));
				return A2(
					_elm_lang$svg$Svg$circle,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$cx(
							_elm_lang$core$Basics$toString(x_)),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$cy(
								_elm_lang$core$Basics$toString(y_)),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$r(
									_elm_lang$core$Basics$toString(_p11.radius + 2)),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$stroke('#fffb00'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$strokeWidth(
											isSelected ? '4px' : '0px'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$fillOpacity('0'),
											_1: {
												ctor: '::',
												_0: A2(_elm_lang$svg$Svg_Events$on, 'mousedown', onMouseDownDecMsg),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					},
					{ctor: '[]'});
			});
		var vs = _elm_lang$core$Dict$values(
			A2(_elm_lang$core$Dict$map, drawVertex, graph.vertices));
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$id('vertex-handles-for-selecting'),
				_1: {ctor: '[]'}
			},
			vs);
	});
var _user$project$Widgets_SelectAndEdit$view = F3(
	function (model, graph, sizes) {
		return A2(
			_elm_lang$svg$Svg$g,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(_user$project$Widgets_SelectAndEdit$interactionRect, graph, sizes),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$g,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$transform(
								_user$project$PanAndZoom_Basics$extractTransformForSvg(graph.scaleAndTranslate)),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _user$project$Widgets_SelectAndEdit$drawSelectionRectangle(model),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Widgets_SelectAndEdit$drawVertexHandles, model, graph),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _user$project$Widgets_SelectAndEdit$SwitchToEdges = {ctor: 'SwitchToEdges'};
var _user$project$Widgets_SelectAndEdit$SwitchToVertices = {ctor: 'SwitchToVertices'};
var _user$project$Widgets_SelectAndEdit$NoOp = {ctor: 'NoOp'};
var _user$project$Widgets_SelectAndEdit$subscriptions = F2(
	function (model, scaleAndTranslate) {
		return _elm_lang$core$Platform_Sub$batch(
			{
				ctor: '::',
				_0: _elm_lang$animation_frame$AnimationFrame$times(_user$project$Widgets_SelectAndEdit$Tick),
				_1: function () {
					var _p15 = model.state;
					switch (_p15.ctor) {
						case 'ScalingRect':
							return {
								ctor: '::',
								_0: _elm_lang$mouse$Mouse$moves(
									function (_p16) {
										return _user$project$Widgets_SelectAndEdit$DragSelectionRect(
											A2(_user$project$Widgets_SelectAndEdit$correct, scaleAndTranslate, _p16));
									}),
								_1: {
									ctor: '::',
									_0: _elm_lang$mouse$Mouse$ups(
										function (_p17) {
											return _user$project$Widgets_SelectAndEdit$StopDraggingSelectionRect;
										}),
									_1: {ctor: '[]'}
								}
							};
						case 'DraggingVertices':
							return {
								ctor: '::',
								_0: _elm_lang$mouse$Mouse$moves(
									function (_p18) {
										return _user$project$Widgets_SelectAndEdit$MaybeDraggingVertices(
											A2(_user$project$Widgets_SelectAndEdit$correct, scaleAndTranslate, _p18));
									}),
								_1: {
									ctor: '::',
									_0: _elm_lang$mouse$Mouse$ups(
										function (_p19) {
											return _user$project$Widgets_SelectAndEdit$StopDraggingVertices;
										}),
									_1: {ctor: '[]'}
								}
							};
						case 'Idle':
							return {
								ctor: '::',
								_0: _elm_lang$keyboard$Keyboard$downs(
									function (keyCode) {
										return _elm_lang$core$Native_Utils.eq(keyCode, 16) ? _user$project$Widgets_SelectAndEdit$ShiftDown : (_elm_lang$core$Native_Utils.eq(keyCode, 18) ? _user$project$Widgets_SelectAndEdit$AltDown : _user$project$Widgets_SelectAndEdit$NoOp);
									}),
								_1: {
									ctor: '::',
									_0: _elm_lang$keyboard$Keyboard$ups(
										function (keyCode) {
											return _elm_lang$core$Native_Utils.eq(keyCode, 16) ? _user$project$Widgets_SelectAndEdit$ShiftUp : (_elm_lang$core$Native_Utils.eq(keyCode, 18) ? _user$project$Widgets_SelectAndEdit$AltUp : _user$project$Widgets_SelectAndEdit$NoOp);
										}),
									_1: {ctor: '[]'}
								}
							};
						default:
							return {ctor: '[]'};
					}
				}()
			});
	});
var _user$project$Widgets_SelectAndEdit$NoCall = {ctor: 'NoCall'};
var _user$project$Widgets_SelectAndEdit$ResumeRecording = {ctor: 'ResumeRecording'};
var _user$project$Widgets_SelectAndEdit$PauseRecording = {ctor: 'PauseRecording'};
var _user$project$Widgets_SelectAndEdit$update = F3(
	function (msg, graph, _p20) {
		var _p21 = _p20;
		var _p55 = _p21.selectedVertices;
		var _p54 = _p21;
		var _p22 = msg;
		switch (_p22.ctor) {
			case 'NoOp':
				return {ctor: '_Tuple3', _0: _p54, _1: _elm_lang$core$Maybe$Nothing, _2: _user$project$Widgets_SelectAndEdit$NoCall};
			case 'SwitchToVertices':
				return {ctor: '_Tuple3', _0: _p54, _1: _elm_lang$core$Maybe$Nothing, _2: _user$project$Widgets_SelectAndEdit$NoCall};
			case 'SwitchToEdges':
				return {ctor: '_Tuple3', _0: _p54, _1: _elm_lang$core$Maybe$Nothing, _2: _user$project$Widgets_SelectAndEdit$NoCall};
			case 'StartDraggingVertices':
				var _p24 = _p22._0;
				var newModel = _elm_lang$core$Native_Utils.update(
					_p54,
					{
						state: _user$project$Widgets_SelectAndEdit$DraggingVertices(
							{
								dragStartPoint: _p24,
								vertexPositionsAtDragStart: _elm_lang$core$Dict$values(
									A2(
										_elm_lang$core$Dict$map,
										F2(
											function (k, v) {
												return {vertexName: k, position: v.position};
											}),
										A2(
											_elm_lang$core$Dict$filter,
											F2(
												function (name, _p23) {
													return A2(_elm_lang$core$Set$member, name, _p55);
												}),
											graph.vertices))),
								currentMousePoint: _p24
							})
					});
				return {ctor: '_Tuple3', _0: newModel, _1: _elm_lang$core$Maybe$Nothing, _2: _user$project$Widgets_SelectAndEdit$PauseRecording};
			case 'MaybeDraggingVertices':
				var digraphMsg = function () {
					var _p25 = _p54.state;
					if (_p25.ctor === 'DraggingVertices') {
						var delta = A2(_user$project$BasicGeometry$diff, _p25._0.currentMousePoint, _p25._0.dragStartPoint);
						var increase = function (v) {
							return _elm_lang$core$Native_Utils.update(
								v,
								{
									position: A2(_user$project$BasicGeometry$add, v.position, delta)
								});
						};
						return _elm_lang$core$Maybe$Just(
							_user$project$Digraph$MoveVertices(
								A2(_elm_lang$core$List$map, increase, _p25._0.vertexPositionsAtDragStart)));
					} else {
						return _elm_lang$core$Maybe$Nothing;
					}
				}();
				var toFloats = function (_p26) {
					var _p27 = _p26;
					return {
						x: _elm_lang$core$Basics$toFloat(_p27.x),
						y: _elm_lang$core$Basics$toFloat(_p27.y)
					};
				};
				var newModel = _elm_lang$core$Native_Utils.update(
					_p54,
					{
						state: function () {
							var _p28 = _p54.state;
							if (_p28.ctor === 'DraggingVertices') {
								return _user$project$Widgets_SelectAndEdit$DraggingVertices(
									_elm_lang$core$Native_Utils.update(
										_p28._0,
										{currentMousePoint: _p22._0}));
							} else {
								return _p54.state;
							}
						}()
					});
				return {ctor: '_Tuple3', _0: newModel, _1: digraphMsg, _2: _user$project$Widgets_SelectAndEdit$NoCall};
			case 'StopDraggingVertices':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{state: _user$project$Widgets_SelectAndEdit$Idle}),
					_1: _elm_lang$core$Maybe$Nothing,
					_2: _user$project$Widgets_SelectAndEdit$ResumeRecording
				};
			case 'AddToSelected':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{
							selectedVertices: A2(_elm_lang$core$Set$insert, _p22._0, _p55)
						}),
					_1: _elm_lang$core$Maybe$Nothing,
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'SetSelectedVertices':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{selectedVertices: _p22._0}),
					_1: _elm_lang$core$Maybe$Nothing,
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'RemoveFromSelection':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{
							selectedVertices: A2(_elm_lang$core$Set$remove, _p22._0, _p55)
						}),
					_1: _elm_lang$core$Maybe$Nothing,
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'RemoveSelectedVerticesFromTheGraph':
				return {
					ctor: '_Tuple3',
					_0: _p54,
					_1: _elm_lang$core$Maybe$Just(
						_user$project$Digraph$RemoveVertices(
							{
								vertexNames: _elm_lang$core$Set$toList(_p55)
							})),
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'SetRadius':
				return {
					ctor: '_Tuple3',
					_0: _p54,
					_1: _elm_lang$core$Maybe$Just(
						_user$project$Digraph$SetRadius(
							{
								newRadius: _p22._0,
								vertexNames: _elm_lang$core$Set$toList(_p55)
							})),
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'ChangeVertexColor':
				return {
					ctor: '_Tuple3',
					_0: _p54,
					_1: _elm_lang$core$Maybe$Just(
						_user$project$Digraph$SetColor(
							{
								newColor: _p22._0,
								vertexNames: _elm_lang$core$Set$toList(_p55)
							})),
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'Lay':
				return {
					ctor: '_Tuple3',
					_0: _p54,
					_1: _elm_lang$core$Maybe$Just(
						_user$project$Digraph$MoveVertices(
							_elm_lang$core$Dict$values(
								A2(
									_elm_lang$core$Dict$map,
									F2(
										function (name, pos) {
											return {vertexName: name, position: pos};
										}),
									A2(
										_user$project$GraphLayout$lay,
										_p22._0,
										A2(
											_elm_lang$core$Dict$map,
											F2(
												function (_p29, v) {
													return v.position;
												}),
											A2(
												_elm_lang$core$Dict$filter,
												F2(
													function (name, _p30) {
														return A2(_elm_lang$core$Set$member, name, _p55);
													}),
												graph.vertices))))))),
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'LayWithAnimation':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{
							state: _user$project$Widgets_SelectAndEdit$Animating(
								{
									animation: _mgold$elm_animation$Animation$animation(_p54.time),
									coordinates: function () {
										var startPositions = A2(
											_elm_lang$core$Dict$map,
											F2(
												function (_p31, v) {
													return v.position;
												}),
											A2(
												_elm_lang$core$Dict$filter,
												F2(
													function (name, _p32) {
														return A2(_elm_lang$core$Set$member, name, _p55);
													}),
												graph.vertices));
										var endPositions = A2(_user$project$GraphLayout$lay, _p22._0, startPositions);
										return _elm_lang$core$Dict$values(
											A2(
												_elm_lang$core$Dict$map,
												F2(
													function (n, v) {
														return {
															vertexName: n,
															startPoint: v.position,
															endPoint: A2(
																_elm_lang$core$Maybe$withDefault,
																v.position,
																A2(_elm_lang$core$Dict$get, n, endPositions))
														};
													}),
												A2(
													_elm_lang$core$Dict$filter,
													F2(
														function (name, _p33) {
															return A2(_elm_lang$core$Set$member, name, _p55);
														}),
													graph.vertices)));
									}()
								})
						}),
					_1: _elm_lang$core$Maybe$Nothing,
					_2: _user$project$Widgets_SelectAndEdit$PauseRecording
				};
			case 'StartSelectionRect':
				var _p34 = _p22._0;
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{
							state: _user$project$Widgets_SelectAndEdit$ScalingRect(
								{dragStartPoint: _p34, currentMousePoint: _p34})
						}),
					_1: _elm_lang$core$Maybe$Nothing,
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'DragSelectionRect':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{
							state: function () {
								var _p35 = _p54.state;
								if (_p35.ctor === 'ScalingRect') {
									return _user$project$Widgets_SelectAndEdit$ScalingRect(
										_elm_lang$core$Native_Utils.update(
											_p35._0,
											{currentMousePoint: _p22._0}));
								} else {
									return _user$project$Widgets_SelectAndEdit$Idle;
								}
							}()
						}),
					_1: _elm_lang$core$Maybe$Nothing,
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'StopDraggingSelectionRect':
				var _p36 = _p54.state;
				if (_p36.ctor === 'ScalingRect') {
					var currentRect = A2(_user$project$BasicGeometry$findRect, _p36._0.dragStartPoint, _p36._0.currentMousePoint);
					var inCurrentRect = function (position) {
						return A2(_user$project$BasicGeometry$inRect, currentRect, position);
					};
					return {
						ctor: '_Tuple3',
						_0: _elm_lang$core$Native_Utils.update(
							_p54,
							{
								state: _user$project$Widgets_SelectAndEdit$Idle,
								selectedVertices: _elm_lang$core$Set$fromList(
									_elm_lang$core$Dict$keys(
										A2(
											_elm_lang$core$Dict$filter,
											F2(
												function (vn, _p37) {
													var _p38 = _p37;
													var _p39 = _p38.position;
													return _p54.altKeyIsPressed ? (A2(_elm_lang$core$Set$member, vn, _p55) && (!inCurrentRect(_p39))) : (_p54.shiftKeyIsPressed ? (A2(_elm_lang$core$Set$member, vn, _p55) || inCurrentRect(_p39)) : inCurrentRect(_p39));
												}),
											graph.vertices)))
							}),
						_1: _elm_lang$core$Maybe$Nothing,
						_2: _user$project$Widgets_SelectAndEdit$NoCall
					};
				} else {
					return {ctor: '_Tuple3', _0: _p54, _1: _elm_lang$core$Maybe$Nothing, _2: _user$project$Widgets_SelectAndEdit$NoCall};
				}
			case 'Tick':
				var _p47 = _p22._0;
				var _p40 = _p54.state;
				if (_p40.ctor === 'Animating') {
					var _p46 = _p40._0.animation;
					return A2(_mgold$elm_animation$Animation$isDone, _p54.time, _p46) ? {
						ctor: '_Tuple3',
						_0: _elm_lang$core$Native_Utils.update(
							_p54,
							{time: _p47, state: _user$project$Widgets_SelectAndEdit$Idle}),
						_1: _elm_lang$core$Maybe$Nothing,
						_2: _user$project$Widgets_SelectAndEdit$ResumeRecording
					} : {
						ctor: '_Tuple3',
						_0: _elm_lang$core$Native_Utils.update(
							_p54,
							{time: _p47}),
						_1: function () {
							var k = A2(_mgold$elm_animation$Animation$animate, _p54.time, _p46);
							var calculateNewCoordinate = function (_p41) {
								var _p42 = _p41;
								var _p43 = {ctor: '_Tuple2', _0: _p42.startPoint, _1: _p42.endPoint};
								var _p45 = _p43._0._1;
								var _p44 = _p43._0._0;
								return {
									vertexName: _p42.vertexName,
									position: {ctor: '_Tuple2', _0: _p44 + (k * (_p43._1._0 - _p44)), _1: _p45 + (k * (_p43._1._1 - _p45))}
								};
							};
							return _elm_lang$core$Maybe$Just(
								_user$project$Digraph$MoveVertices(
									A2(_elm_lang$core$List$map, calculateNewCoordinate, _p40._0.coordinates)));
						}(),
						_2: _user$project$Widgets_SelectAndEdit$NoCall
					};
				} else {
					return {
						ctor: '_Tuple3',
						_0: _elm_lang$core$Native_Utils.update(
							_p54,
							{time: _p47}),
						_1: _elm_lang$core$Maybe$Nothing,
						_2: _user$project$Widgets_SelectAndEdit$NoCall
					};
				}
			case 'CopySelectionToClipBoard':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{
							clipBoard: A2(_user$project$Digraph_Operations$induce, _p54.selectedVertices, graph)
						}),
					_1: _elm_lang$core$Maybe$Nothing,
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'PasteFromClipBoard':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{
							selectedVertices: _elm_lang$core$Set$fromList(
								A2(
									_elm_lang$core$List$map,
									F2(
										function (x, y) {
											return A2(_elm_lang$core$Basics_ops['++'], x, y);
										})('1-'),
									_elm_lang$core$Dict$keys(
										_user$project$Digraph$getVertices(_p54.clipBoard))))
						}),
					_1: _elm_lang$core$Maybe$Just(
						_user$project$Digraph$ReplaceBy(
							A2(_user$project$Digraph_Operations$union, graph, _p54.clipBoard))),
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'ShiftDown':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{shiftKeyIsPressed: true}),
					_1: _elm_lang$core$Maybe$Nothing,
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'ShiftUp':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{shiftKeyIsPressed: false}),
					_1: _elm_lang$core$Maybe$Nothing,
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'AltDown':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{altKeyIsPressed: true}),
					_1: _elm_lang$core$Maybe$Nothing,
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			case 'AltUp':
				return {
					ctor: '_Tuple3',
					_0: _elm_lang$core$Native_Utils.update(
						_p54,
						{altKeyIsPressed: false}),
					_1: _elm_lang$core$Maybe$Nothing,
					_2: _user$project$Widgets_SelectAndEdit$NoCall
				};
			default:
				var _p48 = A3(
					_user$project$Widgets_SelectAndEdit$update,
					_user$project$Widgets_SelectAndEdit$PasteFromClipBoard,
					graph,
					function (_p49) {
						var _p50 = _p49;
						return _p50._0;
					}(
						A3(_user$project$Widgets_SelectAndEdit$update, _user$project$Widgets_SelectAndEdit$CopySelectionToClipBoard, graph, _p54)));
				var m1 = _p48._0;
				var mdm = _p48._1;
				var _p51 = function () {
					var _p52 = mdm;
					if (_p52.ctor === 'Just') {
						return A3(
							_user$project$Widgets_SelectAndEdit$update,
							_user$project$Widgets_SelectAndEdit$StartDraggingVertices(_p22._0),
							A2(_user$project$Digraph$update, _p52._0, graph),
							m1);
					} else {
						return _elm_lang$core$Native_Utils.crashCase(
							'Widgets.SelectAndEdit',
							{
								start: {line: 424, column: 21},
								end: {line: 429, column: 43}
							},
							_p52)('');
					}
				}();
				var m2 = _p51._0;
				var c = _p51._2;
				return {ctor: '_Tuple3', _0: m2, _1: mdm, _2: c};
		}
	});

var _user$project$WelcomeWindow$mdAsString = '\n\n# Welcome to Kite!\n\nKite is a visualization tool for graph theory.\nThis is a pre-alpha version of Kite.\n\nMathematicians, in particular combinatorists, lack web-based tools with which they can create interactive pictures of their ideas. Kite is born out of the need of such a tool. The first step, which was building an editor for graphs, is more or less complete, at least the basis. This is the demo of the current version.\n\n[Kite\'s source code](https://github.com/erkal/kite.git) is open. It is written in [Elm](http://elm-lang.org/) and uses [d3-force](https://github.com/d3/d3/blob/master/API.md#forces-d3-force) (only) for spring embedding.\n\n#### Keyboard Shortcuts:\n\n  + `p` : Toggle this welcome window\n\n  + `f` : Start spring embedding\n\n  + `z` : Undo\n\n  + `y` : Redo\n\n  + `v` : Toggle file system\n\n';
var _user$project$WelcomeWindow$view = function (styleForPositionAndSize) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				A2(
					_elm_lang$core$Basics_ops['++'],
					styleForPositionAndSize,
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'background-color', _1: '#ede7c5'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'overflow', _1: 'scroll'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'border-radius', _1: '8px'},
								_1: {ctor: '[]'}
							}
						}
					})),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$svg,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'width', _1: '300px'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'height', _1: '300px'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'margin-left', _1: '250px'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'margin-top', _1: '200px'},
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$g,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'opacity', _1: '0.5'},
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _user$project$KiteLogo$view,
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_evancz$elm_markdown$Markdown$toHtml,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'margin', _1: '30px'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'position', _1: 'absolute'},
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					},
					_user$project$WelcomeWindow$mdAsString),
				_1: {ctor: '[]'}
			}
		});
};

var _user$project$Main$setStorage = _elm_lang$core$Native_Platform.outgoingPort(
	'setStorage',
	function (v) {
		return v;
	});
var _user$project$Main$exportJsonPort = _elm_lang$core$Native_Platform.outgoingPort(
	'exportJsonPort',
	function (v) {
		return v;
	});
var _user$project$Main$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return {fileSystemIsVisible: a, welcomeWindowIsVisible: b, layout: c, fileSystem: d, fileSearchInput: e, shortcutKeysAreActive: f, widgets: g, addRemoveVerticesAndEdges: h, vertexSelector: i, randomGraph: j, d3Force: k, panZoom: l};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Main$TogglePresentationMode = {ctor: 'TogglePresentationMode'};
var _user$project$Main$DeactivateShortcuts = {ctor: 'DeactivateShortcuts'};
var _user$project$Main$ActivateShortcuts = {ctor: 'ActivateShortcuts'};
var _user$project$Main$UpdateFileSearchInput = function (a) {
	return {ctor: 'UpdateFileSearchInput', _0: a};
};
var _user$project$Main$ToggleWelcomeWindow = {ctor: 'ToggleWelcomeWindow'};
var _user$project$Main$FromPanZoom = function (a) {
	return {ctor: 'FromPanZoom', _0: a};
};
var _user$project$Main$FromLayout = function (a) {
	return {ctor: 'FromLayout', _0: a};
};
var _user$project$Main$init = function (maybeStoredFileSystem) {
	var standardGraphs = A3(
		_user$project$FileSystem$newFile,
		'~/a/b/multi-foci',
		_user$project$Digraph_Examples_MultiFoci$multifoci,
		A3(
			_user$project$FileSystem$newFile,
			'~/hypercubes/7d',
			_user$project$Digraph_Examples_HyperCubes$create(7),
			A3(
				_user$project$FileSystem$newFile,
				'~/hypercubes/5d',
				_user$project$Digraph_Examples_HyperCubes$create(5),
				A3(
					_user$project$FileSystem$newFile,
					'~/hypercubes/3d',
					_user$project$Digraph_Examples_HyperCubes$create(3),
					A3(
						_user$project$FileSystem$newFile,
						'~/kite with fixed node',
						_user$project$Digraph_Examples_SimpleOnes$kiteWithFixedNode,
						A3(
							_user$project$FileSystem$newFile,
							'~/simple/frucht-Graph',
							_user$project$Digraph_Examples_SimpleOnes$fruchtGraph,
							_user$project$FileSystem$init(_user$project$Digraph$empty)))))));
	var fileSystem = function () {
		var _p0 = maybeStoredFileSystem;
		if (_p0.ctor === 'Just') {
			var _p1 = A2(
				_elm_lang$core$Json_Decode$decodeValue,
				_user$project$FileSystem_Json_Decode$fileSystemDecoder(_user$project$Digraph_Json_Decode$digraphDecoder),
				_p0._0);
			if (_p1.ctor === 'Err') {
				return A2(_elm_lang$core$Debug$log, _p1._0, standardGraphs);
			} else {
				return _p1._0;
			}
		} else {
			return standardGraphs;
		}
	}();
	var initialModel = {
		welcomeWindowIsVisible: true,
		fileSystemIsVisible: false,
		widgets: _user$project$Widgets$initialModel(
			{
				ctor: '::',
				_0: _user$project$Widgets_AddRemoveVerticesAndEdges$widgetName,
				_1: {
					ctor: '::',
					_0: _user$project$Widgets_SelectAndEdit$widgetName,
					_1: {
						ctor: '::',
						_0: _user$project$Widgets_RandomGraph$widgetName,
						_1: {
							ctor: '::',
							_0: _user$project$Widgets_D3Force$widgetName,
							_1: {
								ctor: '::',
								_0: _user$project$Widgets_PanZoom$widgetName,
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}),
		layout: _user$project$PageLayout$calculate(
			{windowWidth: 800, windowHeight: 600}),
		fileSystem: fileSystem,
		fileSearchInput: '',
		shortcutKeysAreActive: true,
		addRemoveVerticesAndEdges: _user$project$Widgets_AddRemoveVerticesAndEdges$initialModel,
		vertexSelector: _user$project$Widgets_SelectAndEdit$initialModel,
		randomGraph: _user$project$Widgets_RandomGraph$initialModel,
		d3Force: _user$project$Widgets_D3Force$initialModel,
		panZoom: _user$project$Widgets_PanZoom$initialModel
	};
	return {
		ctor: '_Tuple2',
		_0: initialModel,
		_1: _elm_lang$core$Platform_Cmd$batch(
			{
				ctor: '::',
				_0: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$FromLayout, _user$project$PageLayout$initialCmd),
				_1: {ctor: '[]'}
			})
	};
};
var _user$project$Main$FromFileSystem = function (a) {
	return {ctor: 'FromFileSystem', _0: a};
};
var _user$project$Main$FromRandomGraph = function (a) {
	return {ctor: 'FromRandomGraph', _0: a};
};
var _user$project$Main$update = F2(
	function (msg, _p2) {
		var _p3 = _p2;
		var _p31 = _p3.vertexSelector;
		var _p30 = _p3;
		var _p29 = _p3.fileSystem;
		var handleFileSystemMsg = function (fileSystemMsg) {
			var _p4 = A2(_user$project$FileSystem$update, fileSystemMsg, _p29);
			var newFileSystem = _p4._0;
			var call = _p4._1;
			var newModel = _elm_lang$core$Native_Utils.update(
				_p30,
				{fileSystem: newFileSystem});
			var filesystemAsValue = A2(_user$project$FileSystem_Json_Encode$encode, _user$project$Digraph_Json_Encode$encodeDigraph, newFileSystem);
			var cmds = function () {
				var _p5 = call;
				switch (_p5.ctor) {
					case 'UploadToLocalStorage':
						return {
							ctor: '::',
							_0: _user$project$Main$setStorage(filesystemAsValue),
							_1: {ctor: '[]'}
						};
					case 'ExportFileSystemAsJson':
						var str = A2(_elm_lang$core$Json_Encode$encode, 2, filesystemAsValue);
						return {
							ctor: '::',
							_0: _user$project$Main$exportJsonPort(
								A2(_elm_lang$core$Basics_ops['++'], 'data:application/json;charset=utf-8,', str)),
							_1: {ctor: '[]'}
						};
					default:
						return {ctor: '[]'};
				}
			}();
			return A2(_elm_lang$core$Platform_Cmd_ops['!'], newModel, cmds);
		};
		var _p6 = _p30.fileSystem.state;
		switch (_p6.ctor) {
			case 'WaitingForFileNameInputForNewFile':
				var _p7 = msg;
				if (_p7.ctor === 'FromFileSystem') {
					return handleFileSystemMsg(_p7._0);
				} else {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_p30,
						{ctor: '[]'});
				}
			case 'WaitingForFileNameInputForSaveAs':
				var _p8 = msg;
				if (_p8.ctor === 'FromFileSystem') {
					return handleFileSystemMsg(_p8._0);
				} else {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_p30,
						{ctor: '[]'});
				}
			default:
				var _p9 = msg;
				switch (_p9.ctor) {
					case 'NoOp':
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_p30,
							{ctor: '[]'});
					case 'FromD3Force':
						var _p10 = function () {
							var _p11 = _user$project$FileSystem$maybePresentOfTheFocused(_p29);
							if (_p11.ctor === 'Nothing') {
								return _elm_lang$core$Native_Utils.crashCase(
									'Main',
									{
										start: {line: 245, column: 33},
										end: {line: 250, column: 76}
									},
									_p11)('');
							} else {
								return A2(_user$project$Widgets_D3Force$update, _p9._0, _p11._0);
							}
						}();
						var maybeDigraphMsg = _p10._0;
						var cmd = _p10._1;
						var callToFileSystem = _p10._2;
						var newModel = _elm_lang$core$Native_Utils.update(
							_p30,
							{
								fileSystem: function () {
									var _p13 = callToFileSystem;
									switch (_p13.ctor) {
										case 'PauseRecording':
											return _user$project$FileSystem$startOfEditingFocusedFileWithoutChangingHistoryAndPresentHash;
										case 'NoCall':
											return _elm_lang$core$Basics$identity;
										default:
											return _user$project$FileSystem$endOfEditingFocusedFileWithoutChangingHistoryAndPresentHash;
									}
								}()(
									function () {
										var _p14 = maybeDigraphMsg;
										if (_p14.ctor === 'Nothing') {
											return _elm_lang$core$Basics$identity;
										} else {
											return _user$project$FileSystem$editFocusedFileWithoutChangingHistoryAndPresentHash(
												_user$project$Digraph$update(_p14._0));
										}
									}()(_p29))
							});
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							newModel,
							{
								ctor: '::',
								_0: cmd,
								_1: {ctor: '[]'}
							});
					case 'FromAddRemoveVerticesAndEdges':
						var _p15 = function () {
							var _p16 = _user$project$FileSystem$maybePresentOfTheFocused(_p29);
							if (_p16.ctor === 'Nothing') {
								return _elm_lang$core$Native_Utils.crashCase(
									'Main',
									{
										start: {line: 279, column: 33},
										end: {line: 284, column: 137}
									},
									_p16)('');
							} else {
								return A3(_user$project$Widgets_AddRemoveVerticesAndEdges$update, _p9._0, _p16._0, _p3.addRemoveVerticesAndEdges);
							}
						}();
						var newAddRemoveVerticesAndEdges = _p15._0;
						var maybeDigraphMsg = _p15._1;
						var newModel = _elm_lang$core$Native_Utils.update(
							_p30,
							{
								addRemoveVerticesAndEdges: newAddRemoveVerticesAndEdges,
								fileSystem: function () {
									var _p18 = maybeDigraphMsg;
									if (_p18.ctor === 'Nothing') {
										return _p29;
									} else {
										return A2(
											_user$project$FileSystem$editFocusedFile,
											_user$project$Digraph$update(_p18._0),
											_p29);
									}
								}()
							});
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							newModel,
							{ctor: '[]'});
					case 'FromSelectAndEdit':
						var _p19 = function () {
							var _p20 = _user$project$FileSystem$maybePresentOfTheFocused(_p29);
							if (_p20.ctor === 'Nothing') {
								return _elm_lang$core$Native_Utils.crashCase(
									'Main',
									{
										start: {line: 304, column: 33},
										end: {line: 309, column: 103}
									},
									_p20)('');
							} else {
								return A3(_user$project$Widgets_SelectAndEdit$update, _p9._0, _p20._0, _p31);
							}
						}();
						var newSelectAndEdit = _p19._0;
						var maybeDigraphMsg = _p19._1;
						var callToFileSystem = _p19._2;
						var newFileSystem = function () {
							var _p22 = {ctor: '_Tuple3', _0: maybeDigraphMsg, _1: callToFileSystem, _2: _p31.state};
							if (_p22._0.ctor === 'Just') {
								switch (_p22._2.ctor) {
									case 'DraggingVertices':
										return _user$project$FileSystem$editFocusedFileWithoutChangingHistoryAndPresentHash(
											_user$project$Digraph$update(_p22._0._0));
									case 'Animating':
										return _user$project$FileSystem$editFocusedFileWithoutChangingHistoryAndPresentHash(
											_user$project$Digraph$update(_p22._0._0));
									default:
										return _user$project$FileSystem$editFocusedFile(
											_user$project$Digraph$update(_p22._0._0));
								}
							} else {
								switch (_p22._1.ctor) {
									case 'PauseRecording':
										return _user$project$FileSystem$startOfEditingFocusedFileWithoutChangingHistoryAndPresentHash;
									case 'ResumeRecording':
										return _user$project$FileSystem$endOfEditingFocusedFileWithoutChangingHistoryAndPresentHash;
									default:
										return _elm_lang$core$Basics$identity;
								}
							}
						}()(_p29);
						var newModel = _elm_lang$core$Native_Utils.update(
							_p30,
							{vertexSelector: newSelectAndEdit, fileSystem: newFileSystem});
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							newModel,
							{ctor: '[]'});
					case 'FromWidgets':
						var newWidgets = A2(_user$project$Widgets$update, _p9._0, _p30.widgets);
						var newModel = _elm_lang$core$Native_Utils.update(
							_p30,
							{widgets: newWidgets});
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							newModel,
							{ctor: '[]'});
					case 'FromRandomGraph':
						var _p23 = A2(_user$project$Widgets_RandomGraph$update, _p9._0, _p3.randomGraph);
						var cmd = _p23._0;
						var maybeRandomAbsGraph = _p23._1;
						var maybeNewGraph = A2(_elm_lang$core$Maybe$map, _user$project$Digraph_Generators_Basic$fromAbstractDigraph, maybeRandomAbsGraph);
						var newFileSystem = function () {
							var _p24 = maybeNewGraph;
							if (_p24.ctor === 'Nothing') {
								return _p29;
							} else {
								return A3(_user$project$FileSystem$newFile, '~/random graph', _p24._0, _p29);
							}
						}();
						var newModel = _elm_lang$core$Native_Utils.update(
							_p30,
							{fileSystem: newFileSystem});
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							newModel,
							{
								ctor: '::',
								_0: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$FromRandomGraph, cmd),
								_1: {ctor: '[]'}
							});
					case 'FromFileSystem':
						return handleFileSystemMsg(_p9._0);
					case 'FromLayout':
						var newModel = _elm_lang$core$Native_Utils.update(
							_p30,
							{
								layout: A2(_user$project$PageLayout$update, _p9._0, _p3.layout)
							});
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							newModel,
							{ctor: '[]'});
					case 'FromPanZoom':
						var _p25 = _user$project$FileSystem$maybePresentOfTheFocused(_p29);
						if (_p25.ctor === 'Nothing') {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								_p30,
								{ctor: '[]'});
						} else {
							var _p26 = A3(_user$project$Widgets_PanZoom$update, _p9._0, _p3.panZoom, _p25._0.scaleAndTranslate);
							var newPanZoom = _p26._0;
							var maybePanAndZoom = _p26._1;
							var callToFileSystem = _p26._2;
							var newModel = _elm_lang$core$Native_Utils.update(
								_p30,
								{
									panZoom: newPanZoom,
									fileSystem: function () {
										var _p27 = maybePanAndZoom;
										if (_p27.ctor === 'Nothing') {
											return _elm_lang$core$Basics$identity;
										} else {
											return _user$project$FileSystem$editFocusedFileWithoutChangingHistoryAndPresentHash(
												_user$project$Digraph$update(
													_user$project$Digraph$SetScaleAndTranslate(_p27._0)));
										}
									}()(
										function () {
											var _p28 = callToFileSystem;
											switch (_p28.ctor) {
												case 'PauseRecording':
													return _user$project$FileSystem$startOfEditingFocusedFileWithoutChangingHistoryAndPresentHash;
												case 'ResumeRecording':
													return _user$project$FileSystem$endOfEditingFocusedFileWithoutChangingHistoryAndPresentHash;
												default:
													return _elm_lang$core$Basics$identity;
											}
										}()(_p29))
								});
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								newModel,
								{ctor: '[]'});
						}
					case 'ToggleWelcomeWindow':
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								_p30,
								{welcomeWindowIsVisible: !_p30.welcomeWindowIsVisible}),
							{ctor: '[]'});
					case 'UpdateFileSearchInput':
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								_p30,
								{fileSearchInput: _p9._0}),
							{ctor: '[]'});
					case 'ActivateShortcuts':
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								_p30,
								{shortcutKeysAreActive: true}),
							{ctor: '[]'});
					case 'DeactivateShortcuts':
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								_p30,
								{shortcutKeysAreActive: false}),
							{ctor: '[]'});
					default:
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								_p30,
								{fileSystemIsVisible: !_p3.fileSystemIsVisible}),
							{ctor: '[]'});
				}
		}
	});
var _user$project$Main$FromWidgets = function (a) {
	return {ctor: 'FromWidgets', _0: a};
};
var _user$project$Main$FromSelectAndEdit = function (a) {
	return {ctor: 'FromSelectAndEdit', _0: a};
};
var _user$project$Main$FromAddRemoveVerticesAndEdges = function (a) {
	return {ctor: 'FromAddRemoveVerticesAndEdges', _0: a};
};
var _user$project$Main$FromD3Force = function (a) {
	return {ctor: 'FromD3Force', _0: a};
};
var _user$project$Main$NoOp = {ctor: 'NoOp'};
var _user$project$Main$subscriptions = function (model) {
	var widgetsSubs = function () {
		var _p32 = _user$project$FileSystem$maybePresentOfTheFocused(model.fileSystem);
		if (_p32.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			var _p34 = _p32._0;
			var _p33 = model.widgets.maybeNameOfTheActiveWidget;
			_v20_3:
			do {
				if (_p33.ctor === 'Just') {
					switch (_p33._0) {
						case 'Add/Remove':
							return {
								ctor: '::',
								_0: A2(
									_elm_lang$core$Platform_Sub$map,
									_user$project$Main$FromAddRemoveVerticesAndEdges,
									A2(_user$project$Widgets_AddRemoveVerticesAndEdges$subscriptions, _p34, model.addRemoveVerticesAndEdges)),
								_1: {ctor: '[]'}
							};
						case 'Select and Edit':
							return {
								ctor: '::',
								_0: A2(
									_elm_lang$core$Platform_Sub$map,
									_user$project$Main$FromSelectAndEdit,
									A2(_user$project$Widgets_SelectAndEdit$subscriptions, model.vertexSelector, _p34.scaleAndTranslate)),
								_1: {ctor: '[]'}
							};
						case 'Pan and Zoom':
							return {
								ctor: '::',
								_0: A2(
									_elm_lang$core$Platform_Sub$map,
									_user$project$Main$FromPanZoom,
									_user$project$Widgets_PanZoom$subscriptions(model.panZoom)),
								_1: {ctor: '[]'}
							};
						default:
							break _v20_3;
					}
				} else {
					break _v20_3;
				}
			} while(false);
			return {ctor: '[]'};
		}
	}();
	var generalSubs = function () {
		var _p35 = _user$project$FileSystem$maybePresentOfTheFocused(model.fileSystem);
		if (_p35.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			return model.shortcutKeysAreActive ? {
				ctor: '::',
				_0: A2(_elm_lang$core$Platform_Sub$map, _user$project$Main$FromD3Force, _user$project$Widgets_D3Force$subscriptions),
				_1: {
					ctor: '::',
					_0: _elm_lang$keyboard$Keyboard$downs(
						function (keyCode) {
							var k = _elm_lang$core$Char$fromCode(keyCode);
							return _elm_lang$core$Native_Utils.eq(
								k,
								_elm_lang$core$Native_Utils.chr('P')) ? _user$project$Main$ToggleWelcomeWindow : (_elm_lang$core$Native_Utils.eq(
								k,
								_elm_lang$core$Native_Utils.chr('V')) ? _user$project$Main$TogglePresentationMode : (_elm_lang$core$Native_Utils.eq(
								k,
								_elm_lang$core$Native_Utils.chr('Z')) ? _user$project$Main$FromFileSystem(_user$project$FileSystem$UndoInFocusedFile) : (_elm_lang$core$Native_Utils.eq(
								k,
								_elm_lang$core$Native_Utils.chr('Y')) ? _user$project$Main$FromFileSystem(_user$project$FileSystem$RedoInFocusedFile) : _user$project$Main$NoOp)));
						}),
					_1: {ctor: '[]'}
				}
			} : {ctor: '[]'};
		}
	}();
	return _elm_lang$core$Platform_Sub$batch(
		A2(
			_elm_lang$core$Basics_ops['++'],
			generalSubs,
			A2(
				_elm_lang$core$Basics_ops['++'],
				widgetsSubs,
				{
					ctor: '::',
					_0: A2(_elm_lang$core$Platform_Sub$map, _user$project$Main$FromLayout, _user$project$PageLayout$subscriptions),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$core$Platform_Sub$map,
							_user$project$Main$FromFileSystem,
							_user$project$FileSystem$subscriptions(model.fileSystem)),
						_1: {ctor: '[]'}
					}
				})));
};
var _user$project$Main$view = function (_p36) {
	var _p37 = _p36;
	var _p51 = _p37.widgets;
	var _p50 = _p37.panZoom;
	var _p49 = _p37;
	var _p48 = _p37.layout;
	var _p47 = _p37.fileSystemIsVisible;
	var _p46 = _p37.fileSystem;
	var _p45 = _p37.addRemoveVerticesAndEdges;
	var helperDict = _elm_lang$core$Dict$fromList(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: _user$project$Widgets_AddRemoveVerticesAndEdges$widgetName,
				_1: A2(
					_elm_lang$html$Html$map,
					_user$project$Main$FromAddRemoveVerticesAndEdges,
					_user$project$Widgets_AddRemoveVerticesAndEdges$viewMenu(_p45))
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: _user$project$Widgets_SelectAndEdit$widgetName,
					_1: A2(
						_elm_lang$html$Html$map,
						_user$project$Main$FromSelectAndEdit,
						_user$project$Widgets_SelectAndEdit$viewMenu(_p37.vertexSelector))
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: _user$project$Widgets_RandomGraph$widgetName,
						_1: A2(
							_elm_lang$html$Html$map,
							_user$project$Main$FromRandomGraph,
							_user$project$Widgets_RandomGraph$viewMenu(_p37.randomGraph))
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: _user$project$Widgets_D3Force$widgetName,
							_1: A2(_elm_lang$html$Html$map, _user$project$Main$FromD3Force, _user$project$Widgets_D3Force$viewMenu)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _user$project$Widgets_PanZoom$widgetName,
								_1: A2(
									_elm_lang$html$Html$map,
									_user$project$Main$FromPanZoom,
									_user$project$Widgets_PanZoom$viewMenu(_p50))
							},
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
	var viewWidgetsSearchBar = A2(
		_elm_lang$html$Html$input,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onInput(
				function (_p38) {
					return _user$project$Main$FromWidgets(
						_user$project$Widgets$Filter(_p38));
				}),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$placeholder('Search Widgets'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onBlur(_user$project$Main$ActivateShortcuts),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Events$onFocus(_user$project$Main$DeactivateShortcuts),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$id('widget-searchbar'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$style(
									{
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'background', _1: '#1f2326'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'width', _1: '210px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'height', _1: '14px'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'padding', _1: '10px'},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'margin', _1: '10px'},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'border-style', _1: 'none'},
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: 'color', _1: '#d4d7d6'},
																_1: {ctor: '[]'}
															}
														}
													}
												}
											}
										}
									}),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		},
		{ctor: '[]'});
	var viewTabs = A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				_user$project$PageLayout$dimensions(_p48.tabsBar)),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$map,
				_user$project$Main$FromFileSystem,
				_user$project$FileSystem_View_Tabs$view(_p46)),
			_1: {ctor: '[]'}
		});
	var sizes = {layoutWidth: _p48.graphSvg.width, layoutHeight: _p48.graphSvg.height};
	var viewWidgetOnGraphLayout = function (graph) {
		var _p39 = _p51.maybeNameOfTheActiveWidget;
		_v23_3:
		do {
			if (_p39.ctor === 'Just') {
				switch (_p39._0) {
					case 'Add/Remove':
						return {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$map,
								_user$project$Main$FromAddRemoveVerticesAndEdges,
								A3(_user$project$Widgets_AddRemoveVerticesAndEdges$view, _p45, graph, sizes)),
							_1: {ctor: '[]'}
						};
					case 'Select and Edit':
						return {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$map,
								_user$project$Main$FromSelectAndEdit,
								A3(_user$project$Widgets_SelectAndEdit$view, _p49.vertexSelector, graph, sizes)),
							_1: {ctor: '[]'}
						};
					case 'Pan and Zoom':
						return {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$map,
								_user$project$Main$FromPanZoom,
								A2(_user$project$Widgets_PanZoom$view, _p50, sizes)),
							_1: {ctor: '[]'}
						};
					default:
						break _v23_3;
				}
			} else {
				break _v23_3;
			}
		} while(false);
		return {ctor: '[]'};
	};
	var viewGraphWithWidgetOnGraphLayout = A2(
		_elm_lang$svg$Svg$svg,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				A2(
					_elm_lang$core$List$append,
					_user$project$PageLayout$dimensions(_p48.graphSvg),
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'background-color', _1: '#2e2e2e'},
						_1: {ctor: '[]'}
					})),
			_1: {ctor: '[]'}
		},
		A3(
			_user$project$FileSystem$doIfFocusedExists,
			function (graph) {
				return {
					ctor: '::',
					_0: _user$project$Digraph$view(graph),
					_1: viewWidgetOnGraphLayout(graph)
				};
			},
			{ctor: '[]'},
			_p46));
	var viewFolderTreeViz = A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'color', _1: '#d3d3d3'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'overflow', _1: 'scroll'},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'height',
								_1: A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(_p48.rightBar.height - 200),
									'px')
							},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$map,
				_user$project$Main$FromFileSystem,
				A2(_user$project$FileSystem_View_FolderTree$view, _p37.fileSearchInput, _p46)),
			_1: {ctor: '[]'}
		});
	var viewFileSearchBar = A2(
		_elm_lang$html$Html$input,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onInput(_user$project$Main$UpdateFileSearchInput),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$placeholder('Search Files'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$id('file-searchbar'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Events$onBlur(_user$project$Main$ActivateShortcuts),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onFocus(_user$project$Main$DeactivateShortcuts),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$style(
									{
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'background', _1: '#1f2326'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'width', _1: '210px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'height', _1: '14px'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'padding', _1: '10px'},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'margin', _1: '10px'},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'border-style', _1: 'none'},
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: 'color', _1: '#d4d7d6'},
																_1: {ctor: '[]'}
															}
														}
													}
												}
											}
										}
									}),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		},
		{ctor: '[]'});
	var viewFileControlButtons = A2(
		_elm_lang$html$Html$map,
		_user$project$Main$FromFileSystem,
		_user$project$FileSystem_View_ControlButtons$view(_p46));
	var viewLeftBar = A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'background-color', _1: '#262626'},
					_1: _user$project$PageLayout$dimensions(_p48.leftBar)
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: viewFileSearchBar,
			_1: {
				ctor: '::',
				_0: viewFileControlButtons,
				_1: {
					ctor: '::',
					_0: viewFolderTreeViz,
					_1: {ctor: '[]'}
				}
			}
		});
	var displayIf = function (condition) {
		return {
			ctor: '_Tuple2',
			_0: 'display',
			_1: condition ? 'block' : 'none'
		};
	};
	var viewWelcomeWindow = A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: displayIf(_p49.welcomeWindowIsVisible),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						A2(
							_elm_lang$core$Basics_ops['++'],
							_user$project$PageLayout$dimensions(_p48.browserWindow),
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'background-color', _1: 'red'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'opacity', _1: '0'},
									_1: {ctor: '[]'}
								}
							})),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Events$onMouseDown(_user$project$Main$ToggleWelcomeWindow),
						_1: {ctor: '[]'}
					}
				},
				{ctor: '[]'}),
			_1: {
				ctor: '::',
				_0: _user$project$WelcomeWindow$view(
					_user$project$PageLayout$dimensions(_p48.welcomeWindow)),
				_1: {ctor: '[]'}
			}
		});
	var viewMenu = F2(
		function (widgetName, widgetMenu) {
			var isExpanded = function () {
				var _p40 = A2(_elm_lang$core$Dict$get, widgetName, _p51.widgetDict);
				if (_p40.ctor === 'Just') {
					return _p40._0.expanded;
				} else {
					return _elm_lang$core$Native_Utils.crashCase(
						'Main',
						{
							start: {line: 680, column: 21},
							end: {line: 685, column: 43}
						},
						_p40)('');
				}
			}();
			var viewMenuContent = function (widgetMenu) {
				return A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'padding', _1: '10px'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'min-height', _1: '50px'},
									_1: {
										ctor: '::',
										_0: displayIf(isExpanded),
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: widgetMenu,
						_1: {ctor: '[]'}
					});
			};
			var isActive = _elm_lang$core$Native_Utils.eq(
				_p51.maybeNameOfTheActiveWidget,
				_elm_lang$core$Maybe$Just(widgetName));
			var viewMenuHeader = function (widgetName) {
				return A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'padding', _1: '10px'},
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onMouseDown(
								(isActive || (!isExpanded)) ? _user$project$Main$FromWidgets(
									_user$project$Widgets$SwitchExpanded(widgetName)) : _user$project$Main$NoOp),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(widgetName),
						_1: {ctor: '[]'}
					});
			};
			return A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onMouseDown(
						_user$project$Main$FromWidgets(
							_user$project$Widgets$Activate(widgetName))),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'background', _1: '#2e2e2e'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'width', _1: '230px'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'padding', _1: '0px'},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'margin', _1: '10px'},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'border', _1: '0px'},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'color', _1: '#d4d7d6'},
													_1: {
														ctor: '::',
														_0: {
															ctor: '_Tuple2',
															_0: 'opacity',
															_1: isActive ? '1' : '0.2'
														},
														_1: {
															ctor: '::',
															_0: function () {
																var _p42 = A2(_elm_lang$core$Dict$get, widgetName, _p51.widgetDict);
																if (_p42.ctor === 'Just') {
																	return displayIf(_p42._0.visible);
																} else {
																	return _elm_lang$core$Native_Utils.crashCase(
																		'Main',
																		{
																			start: {line: 724, column: 27},
																			end: {line: 729, column: 47}
																		},
																		_p42)('');
																}
															}(),
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}
							}),
						_1: {ctor: '[]'}
					}
				},
				{
					ctor: '::',
					_0: viewMenuHeader(widgetName),
					_1: {
						ctor: '::',
						_0: viewMenuContent(widgetMenu),
						_1: {ctor: '[]'}
					}
				});
		});
	var viewMenus = A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'overflow', _1: 'scroll'},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'height',
							_1: A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(_p48.rightBar.height - 54),
								'px')
						},
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Dict$values(
			A2(
				_elm_lang$core$Dict$map,
				F2(
					function (k, v) {
						return A2(viewMenu, k, v);
					}),
				helperDict)));
	var viewWidgets = A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				A2(
					_elm_lang$core$List$append,
					_user$project$PageLayout$dimensions(_p48.rightBar),
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'background-color', _1: '#262626'},
						_1: {ctor: '[]'}
					})),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: viewWidgetsSearchBar,
			_1: {
				ctor: '::',
				_0: viewMenus,
				_1: {ctor: '[]'}
			}
		});
	var viewBottomBar = A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				A2(
					_elm_lang$core$Basics_ops['++'],
					_user$project$PageLayout$dimensions(_p48.bottomBar),
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'background-color', _1: '#1e1e1e'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'padding', _1: '0px 20px 0px 20px'},
							_1: {
								ctor: '::',
								_0: displayIf(
									function () {
										var _p44 = _p46.state;
										switch (_p44.ctor) {
											case 'WaitingForFileNameInputForNewFile':
												return true;
											case 'WaitingForFileNameInputForSaveAs':
												return true;
											default:
												return false;
										}
									}()),
								_1: {ctor: '[]'}
							}
						}
					})),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$map,
				_user$project$Main$FromFileSystem,
				_user$project$FileSystem_InputFileName$view(_p46)),
			_1: {ctor: '[]'}
		});
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				A2(
					_elm_lang$core$List$append,
					_user$project$CssHelpers$unselectable,
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'cursor', _1: 'default'},
						_1: {ctor: '[]'}
					})),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: viewGraphWithWidgetOnGraphLayout,
			_1: {
				ctor: '::',
				_0: _p47 ? A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{ctor: '[]'}) : viewTabs,
				_1: {
					ctor: '::',
					_0: _p47 ? A2(
						_elm_lang$html$Html$div,
						{ctor: '[]'},
						{ctor: '[]'}) : viewLeftBar,
					_1: {
						ctor: '::',
						_0: viewWidgets,
						_1: {
							ctor: '::',
							_0: viewWelcomeWindow,
							_1: {
								ctor: '::',
								_0: viewBottomBar,
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		});
};
var _user$project$Main$main = _elm_lang$html$Html$programWithFlags(
	{init: _user$project$Main$init, view: _user$project$Main$view, update: _user$project$Main$update, subscriptions: _user$project$Main$subscriptions})(
	_elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$value),
				_1: {ctor: '[]'}
			}
		}));

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

