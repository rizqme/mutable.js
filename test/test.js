function test(){
	print('Mutable.js testing...')

	var log = '';

	var a = new Mutable({
			value: 0,
			setter: function(oldval, newval)
			{
				return newval < 0 ? 0 : newval > 10 ? 10 : newval;
			}
		}),

		b = new Mutable({
			value: 0,
			getter: function(value)
			{
				return value * 10;
			}
		}),

		c = new Mutable({value: 0}),

		d = new Mutable({value:0, setter: function(oldval, newval){log = newval; return newval;}}),

		e = new Mutable({value: 1});

	var $1, $2, $3, $4;

	if(    a() === 0 
		&& a(1) === 1
		&& a() === 1
		&& a(-2) === 0
		&& a() === 0
		&& a(11) === 10
		&& a() === 10)
		print('setter ok.');
	else
		print('setter failed.');

	if(b() === 0
		&& b(1) === 10
		&& b() === 10)
		print('getter ok.');
	else
		print('getter failed.');

	var fn1 = function(){c(1); return true;};
	var fn2 = function(){c(3); return true;};
	var fn3 = function(){c(5); return true;};
	c.lock(fn1, fn3);
	if(	   c() === 0
		&& c(1) === 0
		&& c() === 0
		&& fn1() && c() === 1
		&& fn2() && c() === 1
		&& fn3() && c() === 5)
		print('lock ok.');
	else
		print('lock failed.');

	a(1);
	b(1);
	d.bind(function(){return a() + b();});
	$1 = log;
	a(2);
	$2 = log;
	b(2);
	$3 = log;
	d.unbind();
	a(5);
	$4 = log;
	if(    $1 === 11
		&& $2 === 12
		&& $3 === 22
		&& $4 === 22)
		print('bind ok.');
	else
		print('bind failed.');

	log = null;
	var fn = function(oldval, newval){log = newval;};
	e.watch(fn);
	$1 = log;
	e(1);
	$2 = log;
	e(2);
	$3 = log;
	e.unwatch(fn);
	e(0);
	$4 = log;
	if(    $1 === null
		&& $2 === null
		&& $3 === 2
		&& $4 === 2)
		print('watch ok.');
	else
		print('watch failed.');
}
