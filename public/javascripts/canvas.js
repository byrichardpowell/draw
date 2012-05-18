tool.minDistance = 10;
tool.maxDistance = 45;


// Initialise Socket.io
var socket = io.connect('/');

// User stuff
var uid = (((1+Math.random())*0x10000)|0).toString(16).substring(1);

// JSON data ofthe users current drawing
// Is sent to the user
var path_to_send;

// Calculates colors
var active_color_rgb;
var active_color_json = {};
var $opacity = $('#opacity');
var update_active_color = function() {

    var rgb_array =  $('.active').attr('data-color').split(',');
    var red = rgb_array[0] / 255;
    var green = rgb_array[1] / 255;
    var blue = rgb_array[2] / 255;
    var opacity =  $opacity.val() / 255;

    active_color_rgb =  new RgbColor( red, green, blue, opacity );
    active_color_rgb._alpha = opacity

    active_color_json = {
        "red" : red,
        "green" : green,
        "blue" : blue,
        "opacity" : opacity
    }

}


// Takes data recieved from other users and draws it
function draw_external_path( points ) {

    // Start the path
    var path = new Path();
    var start_point = new Point(points.start.x, points.start.y);
    var color = new RgbColor( points.rgba.red, points.rgba.green, points.rgba.blue, points.rgba.opacity );
    path.fillColor = color;
    path.add(start_point);

    // Draw all the points along the length of the path
    var paths = points.path
    var length = paths.length
    for (var i = 0; i < length; i++ ) {

        path.add(paths[i].top);
        path.insert(0, paths[i].bottom);
        path.smooth();

    }

    // Close the path
    path.add(points.end);
    path.closed = true;
    path.smooth();

}


// Updates the active connections
var $user_count = $('#userCount');
var $user_count_wrapper = $('#userCountWrapper');
function update_user_count( count ) {

    $user_count_wrapper.css('opacity', 1);
    $user_count.text(' ' + count);

}



// Get the active color from the UI eleements
update_active_color();







// --------------------------------- 
// DRAWING EVENTS


function onMouseDown(event) {

    var point = event.point;

    path = new Path();
    path.fillColor = active_color_rgb
    path.add(event.point);

    path_to_send = {
        rgba : active_color_json,
        start : event.point,
        path : []
    }


}

function onMouseDrag(event) {
    
    var step = event.delta / 2;
    step.angle += 90;
    
    var top = event.middlePoint + step;
    var bottom = event.middlePoint - step;
    
    path.add(top);
    path.insert(0, bottom);
    path.smooth();

    path_to_send.path.push({
        top : top,
        bottom : bottom,
    })

}

function onMouseUp(event) {
   
    path.add(event.point);
    path.closed = true;
    path.smooth();

    path_to_send.end = event.point;

    socket.emit('draw:end', uid, JSON.stringify(path_to_send) );

}










// --------------------------------- 
// CONTROLS EVENTS

var $color = $('.color');
$color.on('click', function() {

    $color.removeClass('active')
    $(this).addClass('active');

    update_active_color()

})

$opacity.on('change', function() {

    update_active_color();

})







// --------------------------------- 
// SOCKET.IO EVENTS

socket.on('draw:end', function( artist, data ) {

    // It wasnt this user who created the event
    if ( artist !== uid && data ) {

        draw_external_path( JSON.parse( data ) );

    }

}) 

socket.on('user:connect', function(user_count) {

    update_user_count( user_count )

}) 

socket.on('user:disconnect', function(user_count) {

    update_user_count( user_count )

}) 


