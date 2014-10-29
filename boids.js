$(document).ready(function() {
    
    cfg = {
        'debug': false,
        'loop_interval': 10,
        'canvas': {
            'width': window.innerWidth / 2,
            'height': window.innerHeight
        },
        'boid': {
            'count': 50,
            'size': 10,
            'max_velocity': 4
        },
        'avoid_distance': 10,
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

    rules = {
        'huddle': {
            'result' : function(me,boids) {
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
            'weight': 1
        },
        'avoid': {
            'result': function(me, boids) {
                unique = boids.filter(function(i) {
                    return !vector.equal(me.pos,i.pos)
                }) 
                neighbors = unique.filter(function(i) { 
                    return vector.distance(me.pos,i.pos) < cfg.avoid_distance 
                })
                displacements = neighbors.map(function(i) {
                    return vector.diff(i.pos, me.pos)
                })
                adjust = vector.diff(vector.zero(), vector.sum(displacements))
                return adjust
            },
            'weight': 1
        },
        'speed': {
            'result': function(me,boids) {
                unique = boids.filter(function(i) {
                    return !vector.equal(me.vel, i.vel)
                })
                velocities = unique.map(function(i) {
                    return i.vel
                })
                pace = vector.mean(velocities)
                adjust = vector.quotient(vector.diff(pace,me.vel), cfg.velocity_adjust)
                return adjust
            },
            'weight': 1
        }
    }
    
    apply_rules = function(me,boids,rules) {
        // return a vector that is the sum of all applied rules
        total = vector.zero()
        for (var key in rules) { 
            rule = rules[key]; console.log(rule)
            weight = rule.weight; console.log(weight)
            result = rule.result(me,boids); console.log(result)
            partial = vector.product(result, weight)
            total = vector.add(total, partial)
        }
        return total
    }

    boid = {
        'make': function() {
            return {
                'color': rand.color(),
                'pos': {
                    'x': rand.integer(0,cfg.canvas.width),
                    'y': rand.integer(0,cfg.canvas.height),
                },
                // ensure non-zero velocity
                'vel': {
                    'x': rand.integer(1,cfg.boid.max_velocity) * rand.choice([-1,1]),
                    'y': rand.integer(1,cfg.boid.max_velocity) * rand.choice([-1,1])
                }
            }
        },
        'makeall' : function(count) {
            return Array.apply(null,Array(count)).map(this.make)
        },
        'check': function(pos) {
            if (pos.x > cfg.canvas.width) {
                pos.x = 0
            }
            if (pos.x < 0) {
                pos.x = cfg.canvas.width
            }
            if (pos.y > cfg.canvas.height) {
                pos.y = 0
            }
            if (pos.y < 0) {
                pos.y = cfg.canvas.height
            }
            return pos
        },
        'speed_limit': function(boid) {
            if ( vector.magnitude(boid.vel) > cfg.boid.max_velocity) {
            
            }
        },
        'draw': function(boid) {
            ctx.fillStyle = boid.color
            ctx.fillRect(boid.pos.x,boid.pos.y,cfg.boid.size,cfg.boid.size)

            ctx.fill();
            //ctx.rotate(-1 * Math.atan2(boid.vel.y, boid.vel.x))
            //console.log(this)
            return boid
        },
        'move': function(boid) {
            /*
            resultant = vector.sum([
                .map(function(f) {
                    return f(boid,boids)
                })
            ])*/
            /* 
                should be the sum of all `rules` applied to the current 
                `boid` and its surrounding `boids`
            */

            //resultant = vector.zero()
            resultant = apply_rules(boid,boids,rules)
            boid.vel = vector.add(boid.vel, resultant)
            boid.pos = this.check(vector.add(boid.pos, boid.vel))
            return boid
        }
    }
    boids = boid.makeall(cfg.boid.count)
    
    main = {
        'loop': function() {
            cfg.canvas.width = window.innerWidth / 2
            cfg.canvas.height = window.innerHeight
            
            ctx.canvas.width = cfg.canvas.width
            ctx.canvas.height = cfg.canvas.height
            cfg.debug && console.log(boids[0].pos)
            
            boids.map(function(b) {return boid.draw(boid.move(b))})
        },
        'init': function() {
            setInterval(this.loop, cfg.loop_interval)
        }
        
    }
    main.init()

})
