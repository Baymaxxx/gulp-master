/**
 * 初始化
 * npm install gulp-util gulp-autoprefixer gulp-compass gulp-livereload gulp-imagemin imagemin-pngquant gulp-ruby-sass gulp-sourcemaps gulp-changed gulp-webserver gulp-minify-css gulp-uglify gulp-rename gulp-concat gulp-clean tiny-lr --save-dev
 */
// 引入gulp
var gulp			= require('gulp');					// 基础库

// 引入我们的gulp组件
var sass 			=  require('gulp-ruby-sass'),		// CSS预处理/Sass编译
	uglify 			=  require('gulp-uglify'),			// JS文件压缩
	imagemin 		=  require('gulp-imagemin'),		// imagemin 图片压缩
	pngquant 		=  require('imagemin-pngquant'),	// imagemin 深度压缩
	livereload 		=  require('gulp-livereload'),		// 网页自动刷新（服务器控制客户端同步刷新）
	webserver 		= require('gulp-webserver'),		// 本地服务器
	rename 			= require('gulp-rename'),			// 文件重命名
	sourcemaps 		= require('gulp-sourcemaps'),		// 来源地图
	changed 		= require('gulp-changed'),			// 只操作有过修改的文件
	concat 			= require("gulp-concat"), 			// 文件合并
	clean 			= require('gulp-clean'),			// 文件清理
	autoprefixer = require('gulp-autoprefixer');		// css后处理，加css3前缀
	pixrem = require('gulp-pixrem');				//px to rem
/* = 全局路径设置
-------------------------------------------------------------- */
var srcPath = {
	html	: 'src',
	css		: 'src/css',
	script	: 'src/js',
	image	: 'src/img'
};
var destPath = {
	html	: 'dist',
	css     : 'dist/css',
	script	: 'dist/js',
	image	: 'dist/img'
};

/* = 开发环境( Ddevelop Task )
-------------------------------------------------------------- */
	// HTML处理
	gulp.task('html', function() {
		return gulp.src( srcPath.html+'/**/*.html' )
			.pipe(changed( destPath.html ))
			.pipe(gulp.dest( destPath.html ));
	});
	// .css处理
	gulp.task('css', function() {
		return gulp.src( srcPath.css+'/**/*.css' )
			.pipe(changed( destPath.css ))
			.pipe(gulp.dest( destPath.css ));
	});
	//PX TO REM
	// gulp.task('css', function() {
	//   gulp.src('css/style.css')
	//     .pipe(pixrem())
	//     .pipe(gulp.dest('public/css/'));
	// });
	 
	// gulp.task('css', function() {
	//   gulp.src('css/style.css')
	//     .pipe(pixrem({ rootValue: '10px' }))
	//     .pipe(gulp.dest('public/css/'));
	// });
	 
	// gulp.task('css', function() {
	//   gulp.src('css/style.css')
	//     .pipe(pixrem({
	//       rootValue: '100%',
	//       replace: true
	//     }))
	//     .pipe(gulp.dest('public/css/'));
	// });
	// 样式处理 压缩成compressed
	gulp.task('cssmin', function () {
 	    return sass(srcPath.css+'/**/*.scss', { style: 'compressed' }) // 指明源文件路径、并进行文件匹配（style: 'compressed' 表示输出格式）
          .on('error', function (err) {
               console.error('Error!', err.message); // 显示错误信息
          })
          .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
          .pipe(gulp.dest(destPath.css)); // 输出路径
	});
	//样式处理 不压缩
	gulp.task('sass', function () {
   	  return sass(srcPath.css+'/**/*.scss', { style: 'nested' }) // 指明源文件路径、并进行文件匹配（style: 'compressed' 表示输出格式）
          .on('error', function (err) {
               console.error('Error!', err.message); // 显示错误信息
          })
          .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
          .pipe(gulp.dest(srcPath.css)); // 输出路径
	});
	// JS文件压缩&重命名
	gulp.task('script', function() {
		return gulp.src( [srcPath.script+'/**/*.js','!'+srcPath.script+'/**/*.min.js'] ) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
			.pipe(changed( destPath.script )) // 对应匹配的文件
			.pipe(sourcemaps.init()) // 执行sourcemaps
			// .pipe(rename({ suffix: '.min' })) // 重命名
			.pipe(uglify({ preserveComments:'some' })) // 使用uglify进行压缩，并保留部分注释
			.pipe(sourcemaps.write('maps')) // 地图输出路径（存放位置）
			.pipe(gulp.dest( destPath.script )); // 输出路径
	});
	// imagemin 图片压缩
	gulp.task('images', function(){
		return gulp.src( srcPath.image+'/**/*' ) // 指明源文件路径，如需匹配指定格式的文件，可以写成 .{png,jpg,gif,svg}
			.pipe(changed( destPath.image ))
			.pipe(imagemin({
				progressive: true, // 无损压缩JPG图片
				svgoPlugins: [{removeViewBox: false}], // 不要移除svg的viewbox属性
				use: [pngquant()] // 深度压缩PNG
			}))
			.pipe(gulp.dest( destPath.image )); // 输出路径
	});
	// 文件合并
	gulp.task('concat', function () {
		return gulp.src( srcPath.script+'/**/*.min.js' )  // 要合并的文件
		.pipe(concat('libs.js')) // 合并成libs.js
		.pipe(rename({ suffix: '.min' })) // 重命名
		.pipe(gulp.dest( destPath.script )); // 输出路径
	});
	// 本地服务器
	gulp.task('webserver', function() {
		gulp.src( destPath.html ) // 服务器目录（.代表根目录）
		.pipe(webserver({ // 运行gulp-webserver
			livereload: true, // 启用LiveReload
			open: true // 服务器启动时自动打开网页
		}));
	});
	// 监听任务
	gulp.task('watch',function(){
		// 监听 html
		gulp.watch( srcPath.html+'/**/*.html' , ['html'])
		// 监听 scss
		gulp.watch( srcPath.css+'/**/*' , ['css','sass','cssmin']);
		// 监听 images
		gulp.watch( srcPath.image+'/**/*' , ['images']);
		// 监听 js
		gulp.watch( [srcPath.script+'/*.js','!'+srcPath.script+'/*.min.js'] , ['script','concat']);
	});
	// 默认任务
	gulp.task('default',['webserver','watch']);

/* = 发布环境( Release Task )
-------------------------------------------------------------- */
	// 清理文件
	gulp.task('clean', function() {
		return gulp.src( [destPath.css+'/maps',destPath.script+'/maps'], {read: false} ) // 清理maps文件
			.pipe(clean());
	});
	// 样式处理
	gulp.task('sassRelease', function () {
		return sass( srcPath.css+'/*.scss', { style: 'compressed' }) // 指明源文件路径、并进行文件匹配（编译风格：压缩）
			.on('error', function (err) {
				console.error('Error!', err.message); // 显示错误信息
			})
			.pipe(gulp.dest( destPath.css )); // 输出路径
	});
	// 脚本压缩&重命名
	gulp.task('scriptRelease', function() {
		return gulp.src( [srcPath.script+'/*.js','!'+srcPath.script+'/*.min.js'] ) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
			.pipe(rename({ suffix: '.min' })) // 重命名
			.pipe(uglify({ preserveComments:'some' })) // 使用uglify进行压缩，并保留部分注释
			.pipe(gulp.dest( destPath.script )); // 输出路径
	});
	// 打包发布
	gulp.task('release', ['clean'], function(){ // 开始任务前会先执行[clean]任务
		return gulp.start('sassRelease','scriptRelease','images'); // 等[clean]任务执行完毕后再执行其他任务
	});

/* = 帮助提示( Help )
-------------------------------------------------------------- */
	gulp.task('help',function () {
		console.log('----------------- 开发环境 -----------------');
		console.log('gulp default		开发环境（默认任务）');
		console.log('gulp html		HTML处理');
		console.log('gulp sass		样式处理');
		console.log('gulp script		JS文件压缩&重命名');
		console.log('gulp images		图片压缩');
		console.log('gulp concat		文件合并');
		console.log('---------------- 发布环境 -----------------');
		console.log('gulp release		打包发布');
		console.log('gulp clean		清理文件');
		console.log('gulp sassRelease		样式处理');
		console.log('gulp scriptRelease	脚本压缩&重命名');
		console.log('---------------------------------------------');
	});
