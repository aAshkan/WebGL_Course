var theta = 0.0;
var thetaLoc;

var speed = 100;
var direction = true;

var key;

var canvas;
var gl;
var points = [];
var NumTimesToSubdivide = 3;
var red = 0;
var green = 0;
var blue = 0;
var redLoc;
var greenLoc;
var blueLoc;


var mousedown;
var xoffset = 0.0;
var yoffset = 0.0;
var stampmode = false;
var xpos = 0;
var ypos = 0;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
     
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );
	
	var shrink;
	if ( stampmode ) {
		shrink = 1/10;
	}
	else {
		shrink = 1;
		xpos=0;
		ypos=0;
	}
	
    var vertices = [
        vec2( -1*shrink+xpos, -1*shrink+ypos ),
        vec2(  0*shrink+xpos,  1*shrink+ypos ),
        vec2(  1*shrink+xpos, -1*shrink+ypos )
    ];
	
	divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
	
    // Load the data into the GPU    
  
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vPosition);
	
	//alert("test1");
	
    redLoc = gl.getUniformLocation(program, "red");
    greenLoc = gl.getUniformLocation(program, "green");
    blueLoc = gl.getUniformLocation(program, "blue");
	xoffsetLoc = gl.getUniformLocation(program, "xoffset");
	yoffsetLoc = gl.getUniformLocation(program, "yoffset");
	
	
	//alert("test2");
	
    thetaLoc = gl.getUniformLocation(program, "theta");
    
    // Initialize event handlers
    
    document.getElementById("slider").onchange = function(event) {
//        speed = 100 - event.target.value;
		points = [];
		NumTimesToSubdivide = event.target.value;
		window.onload();
	};
    
    window.onkeydown = function( event ) {
        var key = String.fromCharCode(event.keyCode);
        switch( key ) {
/*		  case '1':
            direction = !direction;
            break;

          case '2':
            speed /= 2.0;
            break;

          case '3':
            speed *= 2.0;
            break;
*/        
			case 'R':
            red = 1.0;
            green = 0.0;
            blue = 0.0;
            render();
            break;

          case 'G':
            red = 0.0;
            green = 1.0;
            blue = 0.0;
            render();
            break;

          case 'B':
            red = 0.0;
            green = 0.0;
            blue = 1.0;
            render();
            break;
			
			case 'S':
				if ( stampmode ) {
					alert("stampmode off");
					stampmode = false;
				}	
				else {
					alert("stampmode on");
					stampmode = true;
				}
		}
    };

	canvas.onmousedown = function(event) {
        mousedown = true;
//		alert("down x:"+event.pageX+" y:"+event.pageY);
	}

    canvas.onmouseup = function(event) {
        mousedown = false;
		if (stampmode) {
			var rect = event.target.getBoundingClientRect();
			var halfheight = canvas.height/2;
			var halfwidth = canvas.width/2;
		xpos = (event.pageX - rect.left - halfheight)/halfheight;
		ypos = (halfwidth - event.pageY + rect.top)/halfwidth;
			window.onload();
		}
//		alert("up x:"+event.pageX+" y:"+event.pageY);
    }

    canvas.addEventListener('mousemove', function(event) {
        var rect = event.target.getBoundingClientRect();
        var halfheight = canvas.height/2;
		var halfwidth = canvas.width/2;
		x = (event.pageX - rect.left - halfheight)/halfheight;
		y = (halfwidth - event.pageY + rect.top)/halfwidth;

        if (mousedown && stampmode != true) {
            xoffset = x;
            yoffset = y;
//			alert("offset x:"+xoffset+" y:"+yoffset);
            render();
        }
    }, false);

    render();
};
function triCalculator ()
{
	var guess = document.getElementById("triCalc").value;
	//var guess = Math.pow(3, (input-1));
	//alert("test");
	var answer = Math.pow(3, (NumTimesToSubdivide));
	//alert (answer);
	if (guess > answer)
		alert ("Nah... Not that many!");
	if (guess < answer)
		alert ("Nah... Way more than that!");
	if (guess == answer)
		alert ("Good Job!");
	//alert(guess.value);
	return;

}
function triangle( a, b, c )
{
    //points.push( a, b, c );
    points.push( a, b, c);
    points.push( b, c, a );
    //points.push( a, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion
    
    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {
    
        //bisect the sides
        
        var randomizer = vec2 (Math.random()/45, Math.random()/23);

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        ab = add(ab, randomizer);
        ac = add(ac, randomizer);
        bc = add(bc, randomizer);
        
        
        --count;
        
        //var x = add (x, vect2(Math.random(), Math.random()));

        // three new triangles
        
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        //divideTriangle( b, bc, ab, count );
        //divideTriangle( a, ab, bc, count );

    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    theta += (direction ? 0.1 : -0.1);
    gl.uniform1f(thetaLoc, theta);

	gl.drawArrays( gl.LINES, 0, points.length );
	
	gl.uniform1f(xoffsetLoc, xoffset);
	gl.uniform1f(yoffsetLoc, yoffset);
	gl.uniform1f(redLoc, red);
    gl.uniform1f(greenLoc, green);
    gl.uniform1f(blueLoc, blue);

//    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    setTimeout(
        function () {requestAnimFrame( render );},
        speed
    );
}
