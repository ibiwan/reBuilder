function reBuilder(){
    var expr = '';
    var names = [];

    function isString(a){return typeof a === 'string';}

    this.build = function(){
        expr = this.concat.apply(this, arguments);
        return this;
    };

    this.concat = function(){
        return '(?:' + [].slice.call(arguments).filter(isString).join('') + ')';
    };

    this.or = function(){
        return '(?:' + [].slice.call(arguments).filter(isString).join('|') + ')';
    };

    this.named = function(tag) {
        names.push(tag);
        return this.capture.apply(this, [].slice.call(arguments, 1));
    };

    this.capture = function(){
        return '(' + this.concat.apply(this, arguments) + ')';
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
            } else {
                counter = '{' + min + ',' + max + '}';
            }
        }

        var counted = this.concat.apply(this, [].slice.call(arguments, 3));
        return counted + counter;
    };

    this.generate = function(){
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
}
