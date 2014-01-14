module.exports = (grunt) ->
	## Show elapsed time at the end
	require('time-grunt')(grunt)

	serverPort = 9000
	livereloadPort = 35729


	## Project configuration.
	grunt.initConfig
	## Metadata.
		pkg: grunt.file.readJSON 'package.json'

		OUTPUT_JS: 'jquery.<%= pkg.name %>'
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
			build_no_tests: options: { message: 'Build Complete (WITHOUT TESTING)' }

		browserify:
			src:
				src: 'src/js/jquery-wrapper.js',
				dest: 'dist/<%= OUTPUT_JS %>.js'
				options:
					alias: ['src/js/jquery-wrapper.js:wrapper', 'src/js/jquery.shim.js:jquery', 'node_modules/resig-class/index.js:class']
					postBundleCB: (err, src, next) ->
						src = "(function(window, jQuery) {\nvar require;\n#{src}\n})(this, jQuery);"
						next(err, src)

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
				files: ['dist/<%= OUTPUT_JS %>.min.css': 'src/less/style.less']

		uglify:
			options:
				banner: '<%= banner %>'
			dist:
				files: ['dist/<%= OUTPUT_JS %>.min.js': 'dist/<%= OUTPUT_JS %>.js']

	## Automated testing
		testem:
			main:
				options:
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
						"#{dest}/<%= OUTPUT_JS %>.less"
				]
			scss:
				files: [
					expand: true,
					src: ['src/less/style.less'],
					dest: 'dist'
					rename: (dest) ->
						"#{dest}/<%= OUTPUT_JS %>.scss"
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

		release:
			options:
				commit: true #default: true
				tag: true #default: true
				push: true #default: true
				pushTags: true #default: true
				npm: false
				tagName: '<%= version %>' #default: '<%= version %>'
				commitMessage: 'xnCarousel <%= version %> release' #default: 'release <%= version %>'
				tagMessage: 'tagging version <%= version %>'
				github:
					repo: 'http://github.com/nanlabs/xncarousel.git'
					usernameVar: 'GITHUB_USERNAME' #ENVIRONMENT VARIABLE that contains Github username
					passwordVar: 'GITHUB_PASSWORD' #ENVIRONMENT VARIABLE that contains Github password

		shell:
			checkMaster:
				command: 'git rev-parse --abbrev-ref HEAD',
				options:
					callback:
						(err, stdout, stderr, ret) ->
							grunt.fail.fatal "You must be on master branch to run 'release' task"  if stdout isnt "master"
							ret()

	## Aux Plugins.
	grunt.loadNpmTasks 'grunt-contrib-clean'
	grunt.loadNpmTasks 'grunt-contrib-copy'
	grunt.loadNpmTasks 'grunt-shell'

	# Compilation plugins
	grunt.loadNpmTasks 'grunt-contrib-less'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-browserify'

	#Release plugin
	grunt.loadNpmTasks 'grunt-release'

	## Used for linting
	grunt.loadNpmTasks 'grunt-contrib-jshint'
	grunt.loadNpmTasks 'grunt-coffeelint'

	## Dev environment plugins
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-connect'
	grunt.loadNpmTasks 'grunt-notify'
	grunt.loadNpmTasks 'grunt-open'

	## Report pluings
	grunt.loadNpmTasks 'grunt-jsdoc'

	## Testing plugins
	grunt.loadNpmTasks 'grunt-contrib-testem'
	grunt.loadNpmTasks 'grunt-mocha'


	## Internal tasks
	grunt.registerTask '_compile', ['clean', 'jshint', 'coffeelint', 'browserify']
	grunt.registerTask '_package', ['less', 'copy:less', 'copy:scss', 'uglify', 'clean:tmp']
	grunt.registerTask '_pre-release', ['test', 'shell:checkMaster']

	# Partial (dev) tasks
	grunt.registerTask 'test', ['_compile', 'mocha', 'clean:tmp', 'notify:test']
	grunt.registerTask 'test-browsers', ['_compile', 'testem:ci:main', 'clean:tmp', 'notify:test']
	grunt.registerTask 'coverage', ['_compile', 'open:coverage', 'connect:demo']
	grunt.registerTask 'dev', ['_compile', 'connect:dev', 'notify:server', 'open:dev', 'watch']

	# Full build tasks
	grunt.registerTask 'pre-commit', ['test-browsers', '_package', 'notify:build']
	grunt.registerTask 'build-no-tests', ['_compile', '_package', 'notify:build_no_tests']
	grunt.registerTask 'major-release', ['_pre-release', 'release:major']
	grunt.registerTask 'minor-release', ['_pre-release', 'release:minor']
	grunt.registerTask 'patch-release', ['_pre-release', 'release:patch']

	## Default task
	grunt.registerTask 'default', ['test', '_package', 'notify:build']
