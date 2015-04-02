$(document).ready(function() {
    
    cfg = {
        'debug': false,
        'loop_interval': 10,
        'canvas': {
            'width': window.innerWidth / 2,
            'height': window.innerHeight
        }
    }
    controlled = {
        'count': {
            'n': 100,
            'label': 'amount of boids'
        },
        'size': {
            'n': 10,
            'label': 'boid size in pixels'
        },
        'max_velocity': {
            'n': 4,
            'label': 'maximum velocity that a boid is allowed to travel at' 
        },
        'avoid_distance': {
            'n': 2,
            'label': 'distance that boids will try to maintain from eachother'
        },
        'velocity_adjust': {
            'n': 100,
            'label': 'scale that velocity is reduced by'
        }
    }
    
    controls = {
        'count': function(n) {
            controlled.count.n = n;    
            boids = boid.makeall(controlled.count.n)
        },
        'size': function(n) {
            controlled.size.n = n;    
        },
        'max_velocity': function(n) {
            controlled.max_velocity.n = n;    
        },
        'avoid_distance': function(n){ 
            controlled.avoid_distance.n = n; 
        }
    }

    create_control = function(name) {
        return $('<div>').attr('id','control').append(
            $('<div>').attr('id','label').text(controlled[name].label)
        ).append(
        
        )       
    }

    $('body').append(
        $('<div>').attr('id','page-wrap').append(
            $('<div>').attr('id','canvas-wrap').append(
                $('<canvas>').attr(cfg.canvas).attr('id','canvas')
            )
        ).append(
            $('<div>').attr('id','controls').append(
                Object.keys(controlled).map(create_control)
            )
        ) 
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
            'weight': 0.1
        },
        'avoid': {
            'result': function(me, boids) {
                unique = boids.filter(function(i) {
                    return !vector.equal(me.pos,i.pos)
                }) 
                neighbors = unique.filter(function(i) { 
                    return vector.distance(me.pos,i.pos) < controlled.avoid_distance.n 
                })
                displacements = neighbors.map(function(i) {
                    return vector.diff(i.pos, me.pos)
                })
                adjust = vector.diff(vector.zero(), vector.sum(displacements))
                return adjust
            },
            'weight': 5
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
                adjust = vector.quotient(vector.diff(pace,me.vel), controlled.velocity_adjust.n)
                return adjust
            },
            'weight': 1
        }
    }
    
    apply_rules = function(me,boids,rules) {
        // return a vector that is the sum of all applied rules
        total = vector.zero()
        for (var key in rules) { 
            rule = rules[key]
            weight = rule.weight
            result = rule.result(me,boids)
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
                    'x': rand.integer(1,controlled.max_velocity.n) * rand.choice([-1,1]),
                    'y': rand.integer(1,controlled.max_velocity.n) * rand.choice([-1,1])
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
            mag = vector.magnitude(boid.vel)
            lim = controlled.max_velocity.n
            if ( mag > lim ) {
                boid.vel = vector.product( vector.quotient(boid.vel, mag), lim) 
            }
            return boid
        },
        'draw': function(boid) {
            ctx.fillStyle = boid.color
            ctx.fillRect(boid.pos.x,boid.pos.y,controlled.size.n,controlled.size.n)

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
    boids = boid.makeall(controlled.count.n)
    
    main = {
        'loop': function() {
            cfg.canvas.width = window.innerWidth / 2
            cfg.canvas.height = window.innerHeight
            
            ctx.canvas.width = cfg.canvas.width
            ctx.canvas.height = cfg.canvas.height
            cfg.debug && console.log(boids[0].pos)
            boids.map(function(b) {return boid.draw(boid.speed_limit(boid.move(b)))})
        },
        'init': function() {
            setInterval(this.loop, cfg.loop_interval)
        }
        
    }
    main.init()

})
