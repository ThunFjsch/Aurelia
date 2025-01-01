module.exports = function(grunt) {
    let config = require('./.screeps.json');
    grunt.loadNpmTasks('grunt-screeps');
    grunt.initConfig({
        screeps: {
            options: {
                server: {
                    host: 'screeps.newbieland.net',
                    port: 21025,
                    http: true
                },
                email: config.email,
                password: config.passwordNewby,
                branch: config.branch,
                ptr: false
            },
            dist: {
                src: ['src/*.js']
            }
        }
    });
}

/**
 * options: {
                email: config.email,
                token: config.password,
                branch: config.branch,
                ptr: false
            },
            dist: {
                src: ['src/*.js'],
 */