( function( w, d, undefined ) {

	/*

	var socket = io.connect('http://localhost');


	// DRAWING ---------------------------

	var uid = (((1+Math.random())*0x10000)|0).toString(16).substring(1)
	var mouse_is_down = false;
	var mouse_positions = [];
	var record_mouse_position_interval; 


	var record_mouse_position = function( x, y ) {

		if ( x && y ) {

			mouse_positions.push( { x : x, y : y } )

		}

	}

	var send_mouse_position = function() {

		if ( mouse_positions.length && !mouse_is_down ) {

			console.log('sending mouse positions')

			socket.emit('draw:end', uid, JSON.stringify( mouse_positions ) )
			mouse_positions = new Array();

		}

	}



	// EVENT: Mouse down
	d.addEventListener( "mousedown", function( e ) {
	    
	    mouse_is_down = true;


	}, false);

	// EVENT: Mouse move
	// Only relevant if the user drags
	d.addEventListener("mousemove", function( e ) {

	    if (  mouse_is_down ) {

	    	record_mouse_position_interval = setInterval( record_mouse_position( e.x, e.y ), 50 );

	    }

	}, false);

	// EVENT: Mouse up
	// Only relevant if the user dragged
	d.addEventListener("mouseup", function(e) {

		mouse_is_down = false;

		clearInterval( record_mouse_position_interval );

		send_mouse_position();

	}, false);





	window.socket = socket;
	window.draw = {
		uid : uid
	}


	*/


} (window, document) )

