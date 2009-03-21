/*
 * Copyright (c) 2008 Rizqi Ahmad
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */ 

var Mutable;

(function(){

var defset = function(){return arguments[1]};
var defget = function(){return arguments[0]};

var List =
{
	indexOf: function(array, item)
	{
		if(array.indexOf)
			return array.indexOf(item);
		
		for(var i=0; i<array.length; i++)
		{
			if(array[i] == item)
				return i;
		}
		
		return -1;
	},
	
	include: function(array, item)
	{
		var index = List.indexOf(array, item);
		if(index < 0)
			array.push(item);
		return array;
	},
	
	exclude: function(array, item)
	{
		var index = List.indexOf(array, item);
		if(index > -1)
			array.splice(index, 1);
		return array;
	}
};

Mutable = function(mutator)
{
	mutator = mutator || {};
	
	var value = mutator.value,
		setter = mutator.setter || defset,
		getter = mutator.getter || defget;
	
	var watchers = [];
	var lock;
	var binding;
	
	var trigger = function(oldval, newval)
	{
		var array = [];
		for(var i=0; i<watchers.length; i++)
		{
			if(watchers[i].obsolete)
				continue;
			array.push(watchers[i]);
			watchers[i](oldval, newval);
		}
		watchers = array;
	};
	
	var mutable = function(newval)
	{
		var oldval = value;
		var caller = arguments.callee.caller || {};
		if(arguments.length)
		{
			if((binding && caller != binding) || (lock && List.indexOf(lock, caller) < 0))
				return getter.call(caller, value);
			
			value = setter.call(caller, oldval, newval);
			if(value != oldval)
				trigger(oldval, value);
			
			return getter.call(caller, value);
		}
		else
		{
			if(caller.binding && !caller.binding.initialized)
				mutable.watch(caller.binding);
			return getter.call(caller, value);
		}
	};
	
	mutable.bind = function(fn)
	{
		binding = fn.binding = function()
		{
			mutable(fn());
		};
		binding();
		binding.initialized = true;
	};
	
	mutable.unbind = function()
	{
		if(binding)
			binding.obsolete = true;
	};
	
	mutable.watch = function(fn)
	{
		if(typeof fn == 'function')
			List.include(watchers, fn);
	};
	
	mutable.unwatch = function(fn)
	{
		if(!arguments.length)
			watchers.length = 0;
		else
			List.exclude(watchers, fn);
	};
	
	mutable.lock = function()
	{
		lock = Array.prototype.slice.call(arguments);
		mutable.lock = function(){};
	};
	
	return mutable;
};

})();