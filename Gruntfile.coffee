module.exports = (grunt) ->
	## Show elapsed time at the end
	require('time-grunt')(grunt)

	serverPort = 9000
	livereloadPort = 35729


	## Project configuration.
	grunt.initConfig
	## Metadata.
		pkg: grunt.file.readJSON 'package.json'

		OUTPUT_JS: '<%= pkg.name%>'
		JQUERY_PLUGIN_JS: 'jquery.<%= OUTPUT_JS %>'
		banner: '/*! <%= pkg.name %> - v<%=pkg.version%> - ' +
		'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
		'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
		'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;*/\n'

	## Task configuration.
		clean:
			dist: ['dist']
			tmp: ['tmp']

		notify:
			server: options: { message: 'Server running' }
			test: options: { message: 'Tests passed successfully' }
			build: options: { message: 'Build Complete' }

		umd:
				default:
						src: 'dist/jquery.xnCarousel.js',
						amdModuleId: 'xnCarousel',
						objectToExport: 'wrapper'
						globalAlias: 'xnCarousel'
						template: 'template/umd/umd.hbs',
						deps:
							'default': ['jQuery']
							amd: ['jquery']
							cjs: ['jquery']

		browserify:
			src:
				src: 'src/js/carousel.js'
				dest: 'dist/<%= OUTPUT_JS %>.js'
				options:
					alias: ['src/js/jquery.shim.js:jquery', 'node_modules/resig-class/index.js:class', 'src/js/carousel.js:xnCarousel']
					debug: true
			plugin:
				src: 'src/js/jquery-wrapper.js',
				dest: 'dist/<%= JQUERY_PLUGIN_JS %>.js'
				options:
					alias: ['src/js/jquery-wrapper.js:wrapper', 'src/js/jquery.shim.js:jquery', 'node_modules/resig-class/index.js:class']
			test:
				src: 'test/automated/**/*.coffee'
				dest: 'tmp/automated-tests.js'
				options:
					alias: ['src/js/jquery.shim.js:jquery', 'node_modules/resig-class/index.js:class']
					debug: true
					transform: ['coffeeify']
		jsdoc:
			dist:
				src: 'src/**/*.js'
				options:
					#template:'node_modules/grunt-jsdoc/node_modules/jsdoc/templates/default'
					template:'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template'
					destination:'doc'
		less:
			dist:
				options: yuicompress: true
				files: ['dist/<%= OUTPUT_JS %>.min.css': 'src/less/style.less', 'dist/<%= JQUERY_PLUGIN_JS %>.min.css': 'src/less/style.less']

		uglify:
			options:
				banner: '<%= banner %>'
			dist:
				files: ['dist/<%= OUTPUT_JS %>.min.js': 'dist/<%= OUTPUT_JS %>.js', 'dist/<%= JQUERY_PLUGIN_JS %>.min.js': 'dist/<%= JQUERY_PLUGIN_JS %>.js']

	## Automated testing
		testem:
			main:
				options:
					before_tests: 'grunt compile'
					src_files: ['<%= jshint.src.src %>', 'test/automated/**/*']
					parallel: 8,
					test_page: 'test/automated/runner.html',
					launch_in_ci: ['PhantomJS', 'Chrome', 'Firefox', 'IE9', 'IE10'],
					launch_in_dev: ['Chrome', 'Firefox']
		## Automated testing
		mocha:
			automated: [ 'test/automated/runner.html' ]
			options:
				bail: false ## Bail means if a test fails, grunt will abort. False by default.
				log: false ## To enable logs while testing
				reporter: 'Spec'

		jshint:
			src:
				options: { jshintrc: 'src/.jshintrc' }
				src: 'src/js/**/*.js'

		coffeelint:
			options:
				max_line_length: level: 'ignore'
				no_tabs: level: 'ignore'
				indentation: level: 'ignore'
			test: 'test/automated/**/*.coffee'
			gruntfile: 'Gruntfile.coffee'

		watch:
			options:
				livereload:
					port: livereloadPort
				spawn: false
			gruntfile:
				files: 'Gruntfile.coffee'
				tasks: ['coffeelint:gruntfile']
			src:
				files: '<%= jshint.src.src %>'
				tasks: ['jshint:src', 'browserify', 'mocha', 'notify:test']
				options:
					spawn: true
			automatedtest:
				files: 'test/automated/**/*'
				tasks: ['coffeelint:test', 'browserify:test', 'mocha', 'notify:test']
			manualtest:
				files: 'test/dev/*'

		copy:
			demo:
				files: [
					{expand: true, flatten: true, src: ['test/dev/*'], dest: 'dist/demo', filter: 'isFile'}
				]
			less:
				files: [
					expand: true,
					flatten: true,
					src: ['src/less/style.less'],
					dest: 'dist'
					rename: (dest) ->
						"#{dest}/jquery.<%= OUTPUT_JS %>.less"
				]

		connect:
			options:
				hostname: '*'
				port: serverPort
			dev:
				options:
					port: serverPort
			demo:
				options:
					keepalive: true

		open:
			dev:
				path: "http://localhost:#{serverPort}/test/dev"
			demo:
				path: "http://localhost:#{serverPort}/dist/demo"
			coverage:
				path: "http://localhost:#{serverPort}/test/automated/code-coverage.html"

	## These plugins provide necessary tasks.
	grunt.loadNpmTasks 'grunt-contrib-clean'
	grunt.loadNpmTasks 'grunt-contrib-copy'
	grunt.loadNpmTasks 'grunt-contrib-less'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-contrib-jshint'
	grunt.loadNpmTasks 'grunt-coffeelint'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-connect'
	grunt.loadNpmTasks 'grunt-notify'
	grunt.loadNpmTasks 'grunt-browserify'
	grunt.loadNpmTasks 'grunt-umd'
	grunt.loadNpmTasks 'grunt-open'

	## Used for automated testing
	grunt.loadNpmTasks 'grunt-contrib-testem'
	grunt.loadNpmTasks 'grunt-mocha'
	grunt.loadNpmTasks 'grunt-jsdoc'

	## Default task.
	grunt.registerTask 'compile', ['clean', 'jshint', 'coffeelint', 'browserify', 'umd']
	grunt.registerTask 'test', ['compile', 'mocha']
	grunt.registerTask 'default', ['test']
	grunt.registerTask 'test-all', ['testem:run:main', 'notify:test']
	grunt.registerTask 'coverage', ['compile', 'open:coverage', 'connect:demo']
	grunt.registerTask 'build', ['less', 'copy:less', 'uglify', 'notify:build']
	grunt.registerTask 'pre-commit', ['compile', 'testem:ci:main', 'build', 'clean:tmp']
	grunt.registerTask 'dev', ['compile', 'connect:dev', 'notify:server', 'open:dev', 'watch']
	grunt.registerTask 'demo',
		['compile', 'build', 'copy:demo', 'clean:tmp', 'notify:server', 'open:demo', 'connect:demo']
