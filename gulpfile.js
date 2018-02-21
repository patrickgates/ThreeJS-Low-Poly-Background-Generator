// START Editing Project Variables.
// Project related.
var project                 = 'Low Poly Texture'; // Project Name.
var projectURL              = 'http://localhost/low_poly'; // Project URL. Could be something like localhost:8888.
var productURL              = './'; // Theme/Plugin URL. Leave it like it is, since our gulpfile.js lives in the root folder.

// JS Vendor related.
var jsVendorSRC             = [
  './library/js/vendors/*.js',
  './library/js/vendors/**/*.js'
]; // Path to JS vendor folder.
var jsVendorDestination     = './build/js/'; // Path to place the compiled JS vendors file.
var jsVendorMinDestination  = './build/js-min/'; // Path to place the compiled JS vendors file.
var jsVendorFile            = 'vendors'; // Compiled JS vendors file name.
// Default set to vendors i.e. vendors.js.

// JS Custom related.
var jsCustomSRC             = './library/js/application/*.js'; // Path to JS vendor folder.
var jsCustomDestination     = './build/js/'; // Path to place the compiled JS custom scripts file.
var jsCustomMinDestination  = './build/js-min/';
var jsCustomFile            = 'application'; // Compiled JS custom file name.
// Default set to custom i.e. custom.js.

// Watch files paths.
var customJSWatchFiles      = './library/js/application/**/*.js'; // Path to all custom JS files.
var vendorJSWatchFiles      = ['./library/js/vendors/**/*.js', './library/js/vendors/*.js']; // Path to all custom JS files.
var htmlWatchFiles          = './*.html';

// Uglify only on publish
global.uglifyEnv = false;


// Browsers you care about for autoprefixing.
// Browserlist https        ://github.com/ai/browserslist
const AUTOPREFIXER_BROWSERS = [
    'last 2 version',
    '> 1%',
    'ie >= 9',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4',
    'bb >= 10'
  ];

// STOP Editing Project Variables.

/**
 * Load Plugins.
 *
 * Load gulp plugins and assing them semantic names.
 */
var gulp         = require('gulp'); // Gulp of-course

// CSS related plugins.
var sass         = require('gulp-sass'); // Gulp pluign for Sass compilation.
var minifycss    = require('gulp-uglifycss'); // Minifies CSS files.
var autoprefixer = require('gulp-autoprefixer'); // Autoprefixing magic.
var mmq          = require('gulp-merge-media-queries'); // Combine matching media queries into one media query definition.

// JS related plugins.
var concat       = require('gulp-concat'); // Concatenates JS files
var uglify       = require('gulp-uglify'); // Minifies JS files

// Image realted plugins.
var imagemin     = require('gulp-imagemin'); // Minify PNG, JPEG, GIF and SVG images with imagemin.

// Utility related plugins.
var rename       = require('gulp-rename'); // Renames files E.g. style.css -> style.min.css
var lineec       = require('gulp-line-ending-corrector'); // Consistent Line Endings for non UNIX systems. Gulp Plugin for Line Ending Corrector (A utility that makes sure your files have consistent line endings)
var filter       = require('gulp-filter'); // Enables you to work on a subset of the original files by filtering them using globbing.
var sourcemaps   = require('gulp-sourcemaps'); // Maps code in a compressed file (E.g. style.css) back to it’s original position in a source file (E.g. structure.scss, which was later combined with other css files to generate style.css)
var notify       = require('gulp-notify'); // Sends message notification to you
var browserSync  = require('browser-sync').create(); // Reloads browser and injects CSS. Time-saving synchronised browser testing.
var reload       = browserSync.reload; // For manual browser reload.
var wpPot        = require('gulp-wp-pot'); // For generating the .pot file.
var sort         = require('gulp-sort'); // Recommended to prevent unnecessary changes in pot-file.
var gulpif       = require('gulp-if');
var browserify   = require('gulp-browserify');

/**
 * Task: `browser-sync`.
 *
 * Live Reloads, CSS injections, Localhost tunneling.
 *
 * This task does the following:
 *    1. Sets the project URL
 *    2. Sets inject CSS
 *    3. You may define a custom port
 *    4. You may want to stop the browser from openning automatically
 */
gulp.task( 'browser-sync', function() {
  browserSync.init( {

    // For more options
    // @link http://www.browsersync.io/docs/options/

    // Project URL.
    proxy: projectURL,

    // `true` Automatically open the browser with BrowserSync live server.
    // `false` Stop the browser from automatically opening.
    open: false,

    // Inject CSS changes.
    // Commnet it to reload browser for every CSS change.
    injectChanges: true,

    // Use a specific port (instead of the one auto-detected by Browsersync).
    // port: 7000,

  } );
});


 /**
  * Task: `vendorJS`.
  *
  * Concatenate and uglify vendor JS scripts.
  *
  * This task does the following:
  *     1. Gets the source folder for JS vendor files
  *     2. Concatenates all the files and generates vendors.js
  *     3. Renames the JS file with suffix .min.js
  *     4. Uglifes/Minifies the JS file and generates vendors.min.js
  */
  gulp.task( 'vendorsJs', function() {
    var name = global.uglifyEnv === false ? jsVendorFile + '.js' : jsVendorFile + '.min.js';
    var dest = global.uglifyEnv === false ? jsVendorDestination : jsVendorMinDestination;
    
    gulp.src( jsVendorSRC )
      .pipe( concat(name) )
      .pipe( gulpif( global.uglifyEnv === true, uglify() ) ) 
      .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
      .pipe( gulp.dest( dest ) )
      .pipe( notify( { message: 'TASK: "vendorsJs" Completed! 💯', onLast: true } ) );
  });


 /**
  * Task: `customJS`.
  *
  * Concatenate and uglify custom JS scripts.
  *
  * This task does the following:
  *     1. Gets the source folder for JS custom files
  *     2. Concatenates all the files and generates custom.js
  *     3. Renames the JS file with suffix .min.js
  *     4. Uglifes/Minifies the JS file and generates custom.min.js
  */
  gulp.task( 'customJS', function() {
    var name = global.uglifyEnv === false ? jsCustomFile + '.js' : jsCustomFile + '.min.js';
    var dest = global.uglifyEnv === false ? jsCustomDestination : jsCustomMinDestination;
    
    gulp.src(jsCustomSRC)
    .pipe(browserify({
      insertGlobals : true,
      debug : !gulp.env.production
    }))
    .pipe( concat(name) )
    .pipe( gulpif( global.uglifyEnv === true, uglify() ) )
    .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
    .pipe( gulp.dest( dest ) )
    .pipe( notify( { message: 'TASK: "customJs" Completed! 💯', onLast: true } ) );
  });

 /**
  * Watch Tasks.
  *
  * Watches for file changes and runs specific tasks.
  */
gulp.task( 'default', ['vendorsJs', 'customJS', 'browser-sync'], function () {
  gulp.watch( customJSWatchFiles, [ 'customJS', reload ] ); // Reload on customJS file changes.
  gulp.watch( vendorJSWatchFiles, [ 'vendorJS', reload ] ); // Reload on customJS file changes.
  gulp.watch( htmlWatchFiles, [ reload ] ); // Reload on customJS file changes.
});
 
 gulp.task( 'uglifyVar', function() {
   global.uglifyEnv = true;
 });
 
 gulp.task( 'minify', ['uglifyVar', 'vendorsJs', 'customJS']);
