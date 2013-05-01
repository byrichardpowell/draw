/**
 * Module dependencies.
 */

var express = require("express");
var app = express();
//var P = require('paper');
var paper = require('paper');
paper.setup(new paper.Canvas(1920, 1080));

var socket = require('socket.io');
//var paper = require('paper');
//paper.setup(new paper.Canvas(1920, 1080));
//var layer = paper.project.activeLayer;

app.configure(function(){
  app.use(express.static(__dirname + '/'));
});

/**
 * A setting, just one
 */

var port = 9002;





/** Below be dragons 
 *
 */

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
// Index page
app.get('/', function(req, res){
  res.sendfile(__dirname + '/src/static/html/index.html');
});

// Drawings
app.get('/d/*', function(req, res){
  res.sendfile(__dirname + '/src/static/html/draw.html');
});

// Static files IE Javascript and CSS
app.use("/static", express.static(__dirname + '/src/static'));

// LISTEN FOR REQUESTS
var server = app.listen(port);
var io = socket.listen(server);

// SOCKET IO
io.sockets.on('connection', function (socket) {

  socket.on('disconnect', function () {
	disconnect(socket);
  });

  // EVENT: User stops drawing something
  // Having room as a parameter is not good for secure rooms
  socket.on('draw:progress', function (room, uid, co_ordinates) {
    io.sockets.in(room).emit('draw:progress', uid, co_ordinates);
    progress_external_path(room, JSON.parse(co_ordinates), uid);
  });

  // EVENT: User stops drawing something
  // Having room as a parameter is not good for secure rooms
  socket.on('draw:end', function (room, uid, co_ordinates) {
	io.sockets.in(room).emit('draw:end', uid, co_ordinates);
    end_external_path(room, JSON.parse(co_ordinates), uid);
  });
  
  // User joins a room
  socket.on('subscribe', function(data) {
    subscribe(socket, data);
  });
  
});

//var papers = {};
var projects = {};
// Subscribe a client to a room
function subscribe(socket, data) {
  var room = data.room;

  // Subscribe the client to the room
  socket.join(room);
  
  // Create Paperjs instance for this room if it doesn't exist
  // TODO try to load from database if it exists there
  /*var paper = papers[room];
  if (!paper) {
    papers[room] = {};
    //papers[room].paper = require('paper');
    papers[room].paper = new P.PaperScope();
    papers[room].paper.setup(new papers[room].paper.Canvas(1920, 1080));
    papers[room].external_paths = {};
  }*/

  var project = projects[room];
  if (!project) {
    projects[room] = {};
	projects[room].project = new paper.Project(paper.view);
	projects[room].external_paths = {};
  }
  
  // Broadcast to room the new user count
  var active_connections = io.sockets.manager.rooms['/' + room].length;  
  io.sockets.in(room).emit('user:connect', active_connections);
 
}


// When a client disconnects, unsubscribe him from
// the rooms he subscribed to
function disconnect(socket) {
  // Get a list of rooms for the client
  var rooms = io.sockets.manager.roomClients[socket.id];

  // Unsubscribe from the rooms
  for(var room in rooms) {
    if(room && rooms[room]) {
      unsubscribe(socket, { room: room.replace('/','') });
    }
  }
  
}

// Unsubscribe a client from a room
function unsubscribe(socket, data) {
  var room = data.room;
  
  // Remove the client from socket.io room
  // This is optional for the disconnect event, we do it anyway
  // because we want to broadcast the new room population
  socket.leave(room);
	
  // Broadcast to room the new user count
  if (io.sockets.manager.rooms['/' + room]) {
    var active_connections = io.sockets.manager.rooms['/' + room].length;  
    io.sockets.in(room).emit('user:disconnect', active_connections);
  } else {
    // TODO if no one left in room, remove Paperjs instance
    // from the array to free up memory
    console.log('Room is empty.');
  }
  
}

// Ends a path
var end_external_path = function (room, points, artist) {

  //var paper = papers[room].paper;
  //var path = papers[room].external_paths[artist];
  var project = projects[room].project;
  project.activate();
  var path = projects[room].external_paths[artist];
  
  if (path) {

    // Close the path
    path.add(new paper.Point(points.end[1], points.end[2]));
    path.closed = true;
    path.smooth();
    paper.view.draw();
	
    // Remove the old data
    //papers[room].external_paths[artist] = false;
    projects[room].external_paths[artist] = false;

  }
  
  console.log("Room = " + room);
  console.log("Project id = " + project.index);
  debugger;
  paper.view.exportFrames({
    amount: 1,
    directory: __dirname,
    onComplete: function() {
      console.log('Done exporting.');
    },
    onProgress: function(event) {
      console.log(event.percentage + '% complete, frame took: ' + event.delta);
    }
  });
  
  console.log(project.exportJSON());
  
  //project.exportSVG();

};

// Continues to draw a path in real time
progress_external_path = function (room, points, artist) {

  //var paper = papers[room].paper;
  //var path = papers[room].external_paths[artist];
  var project = projects[room].project;
  project.activate();
  var path = projects[room].external_paths[artist];

  // The path hasn't already been started
  // So start it
  if (!path) {

    // Creates the path in an easy to access way
    //papers[room].external_paths[artist] = new paper.Path();
    //path = papers[room].external_paths[artist];
    projects[room].external_paths[artist] = new paper.Path();
	path = projects[room].external_paths[artist];

    // Starts the path
    var start_point = new paper.Point(points.start[1], points.start[2]);
    var color = new paper.Color(points.rgba.red, points.rgba.green, points.rgba.blue, points.rgba.opacity);
    path.fillColor = color;
    path.add(start_point);

  }

  // Draw all the points along the length of the path
  var paths = points.path;
  var length = paths.length;
  for (var i = 0; i < length; i++) {

    path.add(new paper.Point(paths[i].top[1], paths[i].top[2]));
    path.insert(0, new paper.Point(paths[i].bottom[1], paths[i].bottom[2]));

  }

  path.smooth();
  paper.view.draw();
  
  console.log("project id = " + project.index);

};

