function reBuilder(){
    var expr = '';
    var names = [];

    var waiting = [];
    var anchorStart = false;
    var anchorEnd = false;

    var isString = function v(a){return typeof a === 'string';};

    var a2a = function a2a(args, start){start = start || 0; return [].slice.call(args, start);};

    var flatten = function flatten() {
        var flat = [], i;
        for (i = 0; i < arguments.length; i++) {
            if (arguments[i] instanceof Array) {
                flat = flat.concat(flatten.apply(null, arguments[i]));
            } else {
                flat.push(arguments[i]);
            }
        }
        return flat;
    };

    var smartPop = function smartPop(){
        return waiting.pop().map(function(r){
            return (r instanceof reBuilder) ? smartPop() : r;
        });
    };

    var aJoin = function aJoin(glue, ary){
        var ret = [];
        for(i = 0; i < ary.length; i++){
            ret.push(ary[i]);
            if(i < ary.length - 1){
                ret.push(glue);
            }
        }
        return ret;
    };

    this.anchorStart = function(){
        anchorStart = true;
        return this;
    };

    this.anchorEnd = function(){
        anchorEnd = true;
        return this;
    };

    this.add = function(){
        waiting.push(a2a(arguments));
        return this;
    };

    this.or = function(){
        this.add.apply(this, a2a(arguments)); // pushes results to waiting[]
        var inner = smartPop();               // poor man's "return" without breaking fluency

        waiting.push(                         // "return" results
            [].concat(
                ['(?:'],
                aJoin('|', inner),
                [')']
            )
        );
        return this;                          // be fluent
    };

    this.repeat = function(min, max, greedy){
        min = min || 0;
        max = max || Infinity;
        var counter = null;
             if(min === 0 && max === 1)        { counter = '?'; }
        else if(min === 0 && max === Infinity) { counter = '*'; }
        else if(min === 1 && max === Infinity) { counter = '+'; }

        if(counter !== null){
            if(greedy === false){ counter += '?'; }
        } else {
            if(min === max){
                counter = '{' + min + '}';
            } else if (min === 0) {
                counter = '{,' + max + '}';
            } else if (max === Infinity) {
                counter = '{' + min + ',}';
            } else {
                counter = '{' + min + ',' + max + '}';
            }
        }

        this.add.apply(this, a2a(arguments, 3));
        var inner = smartPop();
        waiting.push([inner, counter]);

        return this;
    };

    this.generate = function(){
        expr = (anchorStart ? '^' : '') + flatten(waiting).join('') + (anchorEnd ? '$' : '');
        console.log('GENERATED', expr);
        try
        {
            return new RegExp(expr);
        }
        catch (e)
        {
            console.log('could not form re', expr, e);
            return null;
        }
    };

    this.charDigit = function(){
        return '\\d';
    };

    // this.named = function(tag) {
    //     names.push(tag);
    //     expr += this.capture.apply(this, a2a(arguments, 1));
    //     return this;
    // };

    this.capture = function(){
        expr += '(' + this.concat.apply(this, arguments) + ')';
        return this;
    };


}
