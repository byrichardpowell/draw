tool.minDistance = 10;
tool.maxDistance = 45;

var socket = io.connect('http://localhost');
var canvas = document.getElementById('myCanvas');

var path;
var uid = (((1+Math.random())*0x10000)|0).toString(16).substring(1);
var path_to_send;

function onMouseDown(event) {

    var hue = Math.random() * 360;
    var color = new HsbColor(hue, 1, 1);
    var point = event.point;
    
    path = new Path();
    path.fillColor = new HsbColor(Math.random() * 360, 1, 1);
    path.add(event.point);


    path_to_send = {
        hue : hue,
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






function draw_external_path( points ) {

    console.log('draw_external_path');

    console.log(points);

    // Start the path
    var path = new Path();
    start_point = new Point(points.start.x, points.start.y);
    path.fillColor = new HsbColor( points.hue, 1, 1);
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



socket.on('draw:end', function( artist, data ) {

    // It wasnt this user who created the event
    // if ( artist !== uid && data ) {

        draw_external_path( JSON.parse( data ) );

    // }

}) 
