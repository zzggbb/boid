rand = {
    'integer': function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    'color': function() {
        white = Math.pow(16,6) - 1
        return '#' + this.integer(0, white).toString(16) 
    },
    'choice' : function(items) {
        return items[Math.floor(items.length * Math.random())]
    }
}
scalar = {
    'sum' : function(items) {
        return items.reduce(this.add, 0)
    },
    'add': function(a, b) {
        return a+b
    },
    'mean' : function(nums) {
        return this.sum(nums) / nums.length
    }
}
vector =  {
    'make': function(x, y) {
        return {
            'x': x,
            'y': y
        }
    }, 
    'zero': function() { return this.make(0, 0) },
    'sum': function (vectors) {
        return vectors.length > 0 ? this.add(vectors[0], this.sum(vectors.slice(1))) : this.zero()
    },
    'add': function(v1, v2) {
        return this.make(v1.x + v2.x, v1.y + v2.y)
    },
    'diff': function(v1, v2) {
        return this.make(v1.x - v2.x, v1.y - v2.y)
    },
    'quotient': function(v, s) {
        return this.make(v.x / s, v.y / s)
    },
    'product': function(v, s) {
        return this.make(v.x * s, v.y * s)
    },
    'mean': function(vectors) {
        resultant = this.sum(vectors)
        len = vectors.length
        mean = this.quotient(resultant, len)
        return mean
    },
    'equal': function(v1, v2) {
        return v1.x == v2.x && v1.y == v2.y
    },
    'distance': function(v1, v2) {
        xs = Math.pow(v2.x - v1.x , 2)
        ys = Math.pow(v2.y - v1.y , 2)
        return Math.sqrt(xs+ys)
    },
    'magnitude': function(v) {
        return Math.sqrt(Math.pow(v.x,2)+Math.pow(v.y,2))
    }
}
compose = function (fs) {
    var fns = fs;
    return function (result) {
        for (var i = fns.length - 1; i > -1; i--) {
              result = fns[i].call(this, result);
        }

        return result;
    }
}
