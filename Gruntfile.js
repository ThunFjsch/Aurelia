module.exports = function(grunt) {
    let config = require('./.screeps.json');
    grunt.loadNpmTasks('grunt-screeps');
    grunt.initConfig({
        screeps: {
            options: {
                email: config.email,
                token: config.password,
                branch: config.branch,
                ptr: false
            },
            dist: {
                src: ['src/*.js'],
            }
        }
    });
}