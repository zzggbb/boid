$(document).ready(function() {
    
    cfg = {
        'loop_interval': 10,
        'debug': true
    }
    
    create_control = function(name) {
        return $('<div>').attr('id','control').append(
            $('<div>').attr('id','label').text(controlled[name].label)
        ).append(
            $('<input>').attr({
                'id': name, 
                'placeholder': controlled[name].n
            }).keypress(function(e) {
                if (e.which == 13) { 
                    controlled[name].n = $('#'+name).val() 
                }    
            })
        )       
    }

    
    
    filters = {
        'unique': function(me, we) {
            return we.filter(function(i) {
                return !vector.equal(me.pos, i.pos)
            })    
        },
        'neighbors': function(me, we) {
            return we.filter(function(i) {
                return vector.distance(me.pos, i.pos) < controlled.neighbor_distance.n   
            })
        }
    }

    rules = {
        'huddle': function(me, we) {
            center = vector.mean(we.map(function(i) {
                return i.pos
            }))
            adjust = vector.diff(center, me.pos)
            adjust = vector.product(adjust,controlled.huddle_adjust.n)
            return adjust
        },
        'avoid': function(me, we) {
            we = filters.neighbors(me, we)
            // displacements = [i.pos - me.pos for i in we]
            displacements = we.map(function(i) {
                return vector.diff(me.pos, i.pos)
            })
            adjust = vector.diff(vector.zero(), vector.sum(displacements))
            //adjust = vector.quotient(adjust, controlled.avoid_adjust.n)
            return adjust
        },
        'speed': function(me, we) {
            match_speed = vector.mean(we.map(function(i) {
                return i.vel
            }))
            adjust = vector.diff(match_speed, me.vel)
            adjust = vector.product(adjust, controlled.speed_adjust.n)
            return adjust
        }
    }
    
    apply_rules = function(me, we) {
        // return a vector that is the sum of all applied rules
        return vector.sum(Object.keys(rules).map(function(key) {
            rule = rules[key]
            weight = controlled[key].n
            return vector.product(rule(me, we), weight)
        }))
    }

    boid = {
        'make': function() {
            /* represents a single boid */
            return {
                'color': rand.color(),
                'pos': {
                    'x': rand.integer(0,canvas.width),
                    'y': rand.integer(0,canvas.height),
                },
                'vel': {
                    'x': rand.integer(1,controlled.max_velocity.n) * rand.choice([-1,1]),
                    'y': rand.integer(1,controlled.max_velocity.n) * rand.choice([-1,1])
                }
            }
        },
        'makeall' : function(count) {
            /* create an array of `count` boids */
            return Array.apply(null,Array(count)).map(this.make)
        },
        'check': function(pos) {
            /* adjust a boids position if it hits a wall */
            pos.x = bound(pos.x, 0, canvas.width)
            pos.y = bound(pos.y, 0, canvas.height)
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
            ctx.fillStyle = controlled.color.n || boid.color
            ctx.fillRect(boid.pos.x,boid.pos.y,controlled.size.n,controlled.size.n)
            ctx.fill();
            return boid
        },
        'move': function(boid) {
            resultant = apply_rules(boid,boids)
            boid.vel = vector.add(boid.vel, resultant)
            boid.pos = this.check(vector.add(boid.pos, boid.vel))
            return boid
        }
    }
    
    boids = []; 
    canvas = {};

    $('body').append(
        $('<div>').attr('id','page-wrap').append(
            $('<div>').attr('id','canvas-wrap').append(
                $('<canvas>').attr('id','canvas')
            )
        ).append(
            $('<div>').attr('id','controls').append(
                $('<div>').attr('id','boxes').append(
                    Object.keys(controlled).map(create_control)
                )
            ).append($('<div>').attr('id','toggle'))
        ) 
    )

    ctx = $('#canvas')[0].getContext('2d')

    main = {
        'loop': function() {
            canvas.width = $('#canvas-wrap').width()
            canvas.height = $('#canvas-wrap').height()
            
            ctx.canvas.width = canvas.width
            ctx.canvas.height = canvas.height
            
            if (controlled.count.n != boids.length) {
                boids = boid.makeall(parseInt(controlled.count.n));    
            }

            boids.map(function(b) {return boid.draw(boid.speed_limit(boid.move(b)))})
        },
        'init': function() {
            setInterval(this.loop, cfg.loop_interval)
        }
        
    }
    main.init()

})
