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
        'n': 3,
        'label': 'maximum velocity of a given boid' 
    },
    'neighbor_distance': {
        'n': 2,
        'label': 'distance at which boids are considered neighbors'
    },
    'speed_adjust': {
        'n': 0.01,
        'label': 'proportion that a boid moves in attempt to match the speed of the flock'
    },
    'huddle_adjust': {
        'n': 0.01,
        'label': 'proportion that a boid moves in attempt to move towards the center of the flock'
    },
    'color': {
        'n': '',
        'label': 'hex code color of boids, or blank for random'
    },
    'huddle': {
        'n': 0.05,
        'label': 'tendency to move towards the center of the flock'
    },
    'avoid': {
        'n': 1,
        'label': 'tendency to move away from nearby boids'
    },
    'speed': {
        'n': 0.1,
        'label': 'tendency to match speed of the flock'
    }
}
