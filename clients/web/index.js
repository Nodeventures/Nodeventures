var connect = require('connect');
var serveStatic = require('serve-static');
var app = connect();

app.use(serveStatic(__dirname)).listen(8081);