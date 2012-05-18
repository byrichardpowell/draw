tool.minDistance = 10;
tool.maxDistance = 45;


// Initialise Socket.io
var socket = io.connect('/');

// A random UID to prevent re-drawing of the users own drawings
var uid = (((1+Math.random())*0x10000)|0).toString(16).substring(1);

// JSON data ofthe users current drawing
// Is sent to the user
var path_to_send;

// 
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


function draw_external_path( points ) {

    console.log('draw_external_path');

    console.log(points);

    // Start the path
    var path = new Path();
    var start_point = new Point(points.start.x, points.start.y);
    var color = new RgbColor( points.rgba.red, points.rgba.green, points.rgba.blue, points.rgba.opacity );

    path.fillColor = color;
    path.add(start_point);

    // Draw the length of the path
    var paths = points.path
    var length = paths.length
    for (var i = 0; i < length; i++ ) {

        path.add(paths[i].top);
        path.insert(0, paths[i].bottom);
        path.smooth();

        // path.add(point);

    }

    path.add(points.end);
    path.closed = true;
    path.smooth();

}




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


