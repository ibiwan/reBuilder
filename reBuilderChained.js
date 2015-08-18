function reBuilder(){
    var expr = '';
    var names = [];

    var waiting = [];
    var anchorStart = false;
    var anchorEnd = false;

    var isString = function v(a){return typeof a === 'string';};

    var a2a = function a2a(args, start){start = start || 0; return [].slice.call(args, start);};

    var flatten = function flatten(arr) {
        return arr.reduce(function (flat, toFlatten) {
            return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
        }, []);
    };

    var smartPop = function smartPop(){
        return waiting.pop().map(function(r){
            return (r instanceof reBuilder) ? smartPop() : r;
        });
    };

    var aJoin = function aJoin(glue, ary){
        return ary.reduce(function(prev, curr, idx, orig){
            prev.push(curr);
            if(idx < orig.length - 1){ prev.push(glue); }
            return prev;
        }, []);
    };

    var smartCall = function smartCall(f, that, parms){ // use "waiting" stack to implement function returns while maintaining fluency
        f.apply(that, parms);
        return smartPop();
    };

    var smartReturn = function smartReturn(ret){
        waiting.push(ret);
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
        smartReturn(a2a(arguments));
        return this;
    };

    this.or = function(){
        var inner = smartCall(this.add, this, a2a(arguments));
        smartReturn(
            [].concat(
                ['(?:'],
                aJoin('|', inner),
                [')']
            )
        );
        return this;
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

        var inner = smartCall(this.add, this, a2a(arguments, 3));
        smartReturn([inner, counter]);

        return this;
    };

    this.charDigit = function(){
        return '\\d';
    };

    this.named = function(tag) {
        names.push(tag);
        smartReturn(smartCall(this.capture, this, a2a(arguments, 1)));
        return this;
    };

    this.capture = function(){
        var inner = smartCall(this.add, this, a2a(arguments));
        smartReturn(
            [].concat(
                ['('],
                aJoin('|', inner),
                [')']
            )
        );
        return this;
    };


    this.generate = function(){
        expr = (anchorStart ? '^' : '') + flatten(waiting).join('') + (anchorEnd ? '$' : '');
        // console.log('GENERATED', expr);
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

}
