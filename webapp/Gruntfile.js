module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');
    //grunt.loadNpmTasks('grunt-protractor-runner');
    //grunt.loadNpmTasks('webdriver-manager');
    grunt.loadNpmTasks('grunt-keepalive');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            dist: {
                files: {
                    'build/app.js': ['js/app.js']
                }
            },
            dev: {
                files: {
                    'build/static/app.js': ['js/app.js']
                },
                options: {
                    // TODO add remapify
                    browserifyOptions: {
                        debug: true
                    },
                    watch: true
                }
            },
            prod: {
                files: {
                    'build/static/app.js': ['js/app.js']
                }
            }
        },

        express: {
            dev: {
                options: {
                    script: './server.js'

                }
            }
        },

        less: {
            dev: {
                files: {
                    'build/static/main.css': ['less/main.less']
                }
            },
            prod: {
                files: {
                    'build/static/main.css': ['less/main.less']
                }
            }
        },

        run: {
            dev: {
                cmd: 'node app.js',
                options: {
                    wait: false,
                    ready: false
                }
            }
        },

        watch: {
            options: {
                atBegin: true
            },
            express: {
                files: 'server.js',
                tasks: ['express:dev'],
                options: {
                    spawn: false,
                    keepAlive: false

                }
            },
            less: {
                files: 'less/**/*.less',
                tasks: ['less:dev']
            }
        },

        /*protractor: {
         e2e: {
         options: {
         configFile: "../tests/conf.js",
         // Stops Grunt process if a test fails
         keepAlive: false
         }
         },
         continuous: {
         options: {
         keepAlive: false
         }
         }
         }*/

        compress: {
            main: {
                options: {
                    archive: 'distribution/app.zip'
                },
                files: [
                    {app: ['build/**']},
                    {app: ['view/**']},
                    {app: ['config.json']},
                    {app: ['package.json']},
                    {app: ['server.js']}
                ]
            }
        },
        clean: {
            build: ["build/static/*.*"]
        }

    });
    /*grunt.registerTask('test', function () {
     var config = require("./config.json");
     var request = require('request');
     grunt.task.run('express:dev');
     request.get('http://localhost:' + config.http.port);
     grunt.task.run('e2e-test');
     });*/

    //grunt.registerTask('e2e-test', ['protractor:e2e']);
    grunt.registerTask('develop', ['browserify:dev', 'watch']);


    grunt.registerTask('build', ['clean', 'browserify:prod', 'less:prod', 'compress']);


};
