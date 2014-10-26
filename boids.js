$(document).ready(function() {
    cfg = {
        'debug': true,
        'canvas': {
            'width': 500,
            'height': 500
        },
        'boid': {
            'size': 10,
            'velocity_magnitude': 4
        },
        'avoid_distance': 30,
        'velocity_adjust': 8
    }
    $('body').append(
        $('<canvas>').attr({
            'id': 'canvas',
            'width': cfg.canvas.width,
            'height': cfg.canvas.height,
        })
    )
    
    ctx = $('#canvas')[0].getContext('2d')
    rand = {
        'integer': function(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        },
        'color': function() {
            white = Math.pow(16,6) - 1
            return this.integer(0, white).toString(16) 
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
        'zero': {'x':0,'y':0},
        'sum': function (vectors) {
            return vectors.reduce(this.add, this.zero)
        },
        'add': function(v1, v2) {
            return {
                'x': v1.x + v2.x,
                'y': v1.y + v2.y
            }
        },
        'diff': function(v1, v2) {
            return {
                'x': v1.x - v2.x,
                'y': v1.y - v2.y
            }
        },
        'quotient': function(v, s) {
            return {
                'x': v.x / s,
                'y': v.y / s
            }
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
        } 
    }
    rules = {
        'huddle': function(me,boids) {
            unique = boids.filter(function(i) {
                return !vector.equal(me.pos,i.pos)
            })
            vectors = boids.map(function(i) {
                return i.pos
            })
            flock = vector.mean(vectors)
            distance = vector.diff(flock, me.pos)
            adjust = vector.quotient(distance,100)
            return adjust
        },
        'avoid': function(me, boids) {
            unique = boids.filter(function(i) {
                return !vector.equal(me.pos,i.pos)
            }) 
            neighbors = unique.filter(function(i) { 
                return vector.distance(me.pos,i.pos) < cfg.avoid_distance 
            })
            displacements = neighbors.map(function(i) {
                return vector.diff(i.pos, me.pos)
            })
            adjust = vector.diff({'x':0,'y':0}, vector.sum(displacements))
            return adjust
        },
        'speed': function(me,boids) {
            unique = boids.filter(function(i) {
                return !vector.equal(me.vel, i.vel)
            })
            velocities = unique.map(function(i) {
                return i.vel
            })
            pace = vector.mean(velocities)
            adjust = vector.quotient(vector.diff(pace,me.vel), cfg.velocity_adjust)
            cfg.debug && console.log(me,adjust)
            return adjust
        }
    }

    boid = {
        'make': function() {
            return {
                'color': '#' + rand.color(),
                'pos': {
                    'x': rand.integer(0,cfg.canvas.width),
                    'y': rand.integer(0,cfg.canvas.height),
                },
                // ensure non-zero velocity, in either direction
                'vel': {
                    'x': rand.integer(1,cfg.boid.velocity_magnitude) * rand.choice([-1,1]),
                    'y': rand.integer(1,cfg.boid.velocity_magnitude) * rand.choice([-1,1])
                }
            }
        },
        'draw': function(boid) {
            ctx.fillStyle = boid.color
            ctx.fillRect(boid.pos.x,boid.pos.y,cfg.boid.size,cfg.boid.size)
        },
        'move': function(boid) {
            /*
            resultant = vector.sum([
                _.values(rules).map(function(f) {
                    return f(boid,boids)
                })
            ])*/
            resultant = vector.zero
            boid.vel = vector.add(boid.vel, resultant)
            boid.pos = vector.add(boid.pos, boid.vel)
            if (boid.pos.x > cfg.canvas.width) {
                boid.pos.x = 0
            }
            if (boid.pos.x < 0) {
                boid.pos.x = cfg.canvas.width
            }
            if (boid.pos.y > cfg.canvas.height) {
                boid.pos.y = 0
            }
            if (boid.pos.y < 0) {
                boid.pos.y = cfg.canvas.height
            }
        }
    }

    boids = _.range(100).map(boid.make)

    loop = function() {
        //ctx.clearRect(0, 0, cfg.canvas.width, cfg.canvas.height)
        cfg.canvas.height = window.innerHeight
        cfg.canvas.width = window.innerWidth / 2
        
        ctx.canvas.height = cfg.canvas.height
        ctx.canvas.width = cfg.canvas.width
        //console.log(boids[0].pos)
        boids.map(boid.draw)
        boids.map(boid.move)

    }
    setInterval(
        function(){
            loop()
        },
        10
    ) 
})
