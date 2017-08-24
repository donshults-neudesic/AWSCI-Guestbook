
var AWS = require('aws-sdk');
var del = require('del');
var fs = require('fs');
var gutil = require('gulp-util');
require('dotenv').config()

var config = {
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key
}

//var config = { useIAM: true};
//var config = JSON.parse(fs.readFileSync('~/.aws/credentials'));

let params1 = {
    name: 'readGuestBook',
    role: 'arn:aws:iam::615275379173:role/lambda_basic_execution',
    handler: 'readGuestbook.handler',
    runtime: 'nodejs6.10',
    s3: {
        bucket: 'neudesicshared01',
        key: 'guestbook.zip'
    }
}

let params2 = {
    name: 'writeGuestBook',
    role: 'arn:aws:iam::615275379173:role/lambda_basic_execution',
    handler: 'writeGuestbook.handler',
    runtime: 'nodejs6.10',
    s3: {
        bucket: 'neudesicshared01',
        key: 'guestbook.zip'
    }
}

let options = {
    profile: 'default',
    region: 'us-west-2'
};

var gulp = require('gulp')
//runSequence = require('run-sequence').use(gulp);
var zip = require('gulp-zip');
var install = require('gulp-install');
var runSequence = require('run-sequence').use(gulp);

var s3 = require('gulp-s3-upload')(config);
const lambda = require('gulp-lambda-deploy');

gulp.task('setawsprofile', function () {
    AWS_PROFILE = 'default';
    console.log(process.env.aws_access_key_id);
    console.log(process.env.aws_secret_access_key);

});

//Clean the build folder and delete the lambda code zip.
gulp.task('clean', function () {
    return del('./build', del('./guestbook.zip'));
});
//package javascript
gulp.task('js', function () {
    return gulp.src('app/functions/*.js')
        .pipe(gulp.dest('build'));
});

gulp.task('npm', function () {
    return gulp.src('./package.json')
        .pipe(gulp.dest('./build'))
        .pipe(install({ production: true }));
});

// Next copy over environment variables managed outside of source control.
gulp.task('env', function () {
    gulp.src('./config.env.production')
        .pipe(rename('.env'))
        .pipe(gulp.dest('./build'))
});

// Now the dist directory is ready to go. Zip it.
gulp.task('zip', function () {
    return gulp.src(['build/**/*', '!build/package.json', 'build/.*'])
        .pipe(zip('guestbook.zip'))
        .pipe(gulp.dest('./'));
});

//upload lambda code to S3
gulp.task('uploadguestbook', function () {
    //console.log(AWS_PROFILE);

    return gulp.src("./guestbook.zip")
        .pipe(s3({
            Bucket: 'neudesicshared01', //  Required 
            ACL: 'public-read'       //  Needs to be user-defined 
        }, {
                // S3 Constructor Options, ie: 
                maxRetries: 5
            }));
});
gulp.task('uploadswagger', function () {
    return gulp.src("./json/APIGateway.json")
        .pipe(s3({
            Bucket: 'neudesicshared01', //  Required 
            ACL: 'public-read'       //  Needs to be user-defined 
        }, {
                // S3 Constructor Options, ie: 
                maxRetries: 5
            }));
});
gulp.task('uploadweb', function () {
    //console.log(AWS_PROFILE);

    return gulp.src("./app/web/**")
        .pipe(s3({
            Bucket: 'www.cidemo.com', //  Required 
            ACL: 'public-read'       //  Needs to be user-defined 
        }, {
                // S3 Constructor Options, ie: 
                maxRetries: 5
            }));
});

gulp.task('lambda1', function (cb) {
    // TODO: This should probably pull from package.json
    return gulp.src('build/readGuestbook.js')
        .pipe(zip('package.zip'))
        .pipe(lambda(params1, options));
    // .on('end', cb); 
});

gulp.task('lambda2', function (cb) {
    // TODO: This should probably pull from package.json
    return gulp.src('build/writeGuestbook.js')
        .pipe(zip('package.zip'))
        .pipe(lambda(params2, options));
    //.on('end', cb); 
});

gulp.task('apiupload', function () {
    var ApiImporter = require('aws-apigateway-importer');
    var importer = new ApiImporter('json/APIGateway.json');

    importer.create(function (err, result) {
        if (err) {
            return console.error(err);
        }

        importer.updateApi(function (err, result) {
            if (err) {
                return console.error(err);
            }
            console.log(result);
        });
    });
});

// The key to deploying as a single command is to manage the sequence of events.
gulp.task('default', function (callback) {
    return runSequence(
        'setawsprofile',
        'clean',
        'js',
        'npm',
        'zip',
        'uploadguestbook',
        /*'uploadswagger',
        'lambda1',
        'lambda2',
        'uploadweb',
        'apiupload',*/
        callback
    );
});

