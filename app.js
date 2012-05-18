
/**
 * Module dependencies.
 */

var express = require('express')
var routes = require('./routes');
var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

// CONFIG
app.configure(function(){

  // DEFAULT
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  
  // SESSIONS
  app.use(express.cookieParser());
  app.use(express.session({secret: 'secret', key: 'express.sid'}));

});

// DEV MODE
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// PRODUCTON MODE
app.configure('production', function(){
  app.use(express.errorHandler());
});



// ROUTES
app.get('/', function(req, res){
  res.render('index', {
    title: 'Home'
  });
});
app.get('/news', function(req, res){
  res.render('news', {
    title: 'News'
  });
});


// LISTEN FOR REQUESTS
app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});



// SOCKET IO
var active_connections = 0;
io.sockets.on('connection', function (socket) {

  active_connections++

  io.sockets.emit('user:connect', active_connections);

  socket.on('disconnect', function () {
    active_connections--
    io.sockets.emit('user:disconnect', active_connections);
  });

  // EVENT: User stops drawing something
  socket.on('draw:end', function (uid, co_ordinates) {
    
    io.sockets.emit('draw:end', uid, co_ordinates)
    console.log('draw:end', uid, co_ordinates);

  });
  
});


