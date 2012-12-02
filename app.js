/**
 * Module dependencies.
 */

var express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  io = require('socket.io').listen(server);

/**
 * A setting, just one
 */

var port = 3000;





/** Below be dragons 
 *
 */

var pub = __dirname + '/public';
app.use(app.router);
app.use(express.static(pub));
app.use(express.errorHandler());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {layout: false});

// SESSIONS
app.use(express.cookieParser());
app.use(express.session({secret: 'secret', key: 'express.sid'}));


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
    title: 'title',
    layout: 'layout.jade'
  });
});

// LISTEN FOR REQUESTS
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
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
  socket.on('draw:progress', function (uid, co_ordinates) {
    
    io.sockets.emit('draw:progress', uid, co_ordinates)

  });

  // EVENT: User stops drawing something
  socket.on('draw:end', function (uid, co_ordinates) {
    
    io.sockets.emit('draw:end', uid, co_ordinates)

  });
  
});


