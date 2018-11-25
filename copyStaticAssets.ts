const shell = require('shelljs');

shell.mkdir('-p', 'dist/public/');
shell.cp('-R', 'client/build/**/*', 'dist/public/');
