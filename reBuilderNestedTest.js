

var template = "(a{1,3})12(?:b|3)(\\d*?)(\\d+)";

var rb = new reBuilder();
rb.build(
    rb.capture(
        rb.repeat(1, 3, true, 'a')
    ),
    '12',
    rb.repeat(0, 1, true,
        rb.or(
            'b',
            '3'
        )
    ),
    rb.capture(
        rb.repeat(0, Infinity, false,
            rb.charDigit()
        )
    ),
    rb.named(
        'digits',
        rb.repeat(1, Infinity, true,
            rb.charDigit()
        )
    )
);
var re = rb.generate();
console.log('re:', re);

if(re !== null){
    var strings = [
        'abc',
        'aa12327',
        'aaaa12327',
        'a123b27',
        'a12b',
    ];
    for(var i = 0; i < strings.length; i++){
        console.log('match', strings[i], strings[i].match(re));
    }
}
