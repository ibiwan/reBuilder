

var template = "/^abc(?:d|e|f)x{1,3}12y??((?:p|q)+)(z)/";

var rb = new reBuilder();
var q = rb
    .add('a')
    .add('b', 'c')            // add any number of items
    .or(                      // specify any number of options
        'd',
        rb.add('e'),
        'f'
    )
    .repeat(1, 3, true,  'x') // true: greedy
    .add(12)
    .anchorStart()            // can be called any time.  also .anchorEnd()
    .repeat(0, 1, false, 'y') // false: lazy
    .capture(                 // anonymous capture group
        rb.repeat(1, null, true,
            rb.or('p', 'q')
        )
    )
    .named(                   // not implemented: named capture group
        'mytag',
        'z'
    )
;

var re = rb.generate();
console.log('re:', re);

if(re !== null){
    var strings = [
        'abce',
        'aa12327',
        'aaaa12327',
        'a123b27',
        'a12b',
    ];
    for(var i = 0; i < strings.length; i++){
        console.log('match', strings[i], strings[i].match(re));
    }
}
