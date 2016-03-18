//Some part of code and some concepts come from perspective.html, cube.html, piazza and
//http://learningwebgl.com/ 
//http://www.lighthouse3d.com/
//http://www.videotutorialsrock.com/opengl_tutorial

var oldX;
var oldY;
var oldZ;
var canvas;
var gl;

var eye = 65; //Camera Position
var near = 1; // lower boundary
var far = 1000; //higher boundary
var top = 0;
var down = 0;
var left = 0;
var right = 0;
var ar = 4 / 3;
var theta = 0;
var rTheta = [ 1, 1, 0 ];
var radius = 5.0;
var phi    = 0.0;

var points = [];
var colors = [];
var program;
var projection;
var mvMatrix;
var modelView;
var pColors = [];
var pPoints = [];
var pProgram;
var pMatrix;
var pModelView;
var pProjection;
var NumTimesToSubdivide = 3; //= 6;



window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    ar = canvas.width / canvas.height;
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    var vertices = [

       
        vec3(  0.0000,  0.0000,  1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
        
    ];
    
    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);       
    gl.enable(gl.DEPTH_TEST);
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    pProgram = initShaders(gl, "pVertex-shader", "fragment-shader");
   
   canvas.addEventListener("mousedown", function(event){
    	oldX = event.pageX;
    	oldY = event.pageY;
   }, false);

    canvas.addEventListener("mousemove", function(event){
    	if(event.which == 1){ //left-click code
			var newX = event.pageX;
			var newY = event.pageY;

			if (event.ctrlKey) { //camera movement
			    phi += (oldY - newY) / 100;
			    theta += (newX - oldX) / 100;
			}

    		for(var i = 0; i < vertices.length; i++){
	    		vertices[i][0] += (newX - oldX)/100;
	    		vertices[i][1] += (oldY - newY)/100;
    		}
    		points = [];
    		divideTetra(vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);
	    	render();
	    	oldX = newX;
	    	oldY = newY;
    	}
    	if(event.which == 3){ //right-click code
    		var newRX = event.pageX;
    		var newRY = event.pageY;
    		rTheta[0] += (oldY - newRY);
    		rTheta[1] += (newRX - oldX);
        	render();
        	oldX = newRX;
        	oldY = newRY;
    	}
    }, false);
	
	document.getElementById( "Randomize" ).onclick = function () {
    	pPoints = [];
		pColors = [];
        drawCheckboardT();
        render();
	};

	document.getElementById("Hawaii").onclick = function () {
	    pPoints = [];
	    pColors = [];
	    drawHawaii();
	    render();
	};

	document.getElementById("Gold").onclick = function () {
	    pPoints = [];
	    pColors = [];
	    drawGold();
	    drawGoldF();
	    render();
	};
    
    modelView = gl.getUniformLocation( program, "modelView" );
	projection = gl.getUniformLocation( program, "projection" );
    pModelView = gl.getUniformLocation( pProgram, "modelView" );
    pProjection = gl.getUniformLocation( pProgram, "projection" );
	drawCheckboard();
    render();
};

function drawSquare(w, x, y, z, color){
	CheckboardTri(w, x, y, color);
	CheckboardTri(w, y, z, color);
}

function drawSquareGold(w, x, y, z, color) {
    CheckboardGold(w, x, y, color);
    CheckboardGold(w, y, z, color);
}

function drawCheckboard(){
	var pHeight = -2.5; 
	for(var i = -20.0; i < 20; i++){
		for(var j = 0.0; j > -40; j--){
			drawSquare(
				vec3(i, pHeight , j ),
				vec3(i+1, pHeight , j ),
				vec3(i+1, pHeight , j+1 ),
				vec3(i, pHeight , j+1 ),
				(i+j)%2+1
			);
		}
	}
}

function drawCheckboardT(){
	var pHeight = -2.5;
	var pHeightRandom = [];
	for(var p = -20; p < 20; p++){
		pHeightRandom[p] = [];
		for(var q = 0; q < 40; q++){
			pHeightRandom[p][q] = (Math.random() - 0.75);
		}
	}
	for(var i = -10.0; i < 10; i++){
		for(var j = 0.0; j > -20; j--){
			drawSquare(
				vec3(i, pHeight + pHeightRandom[i+10][j+20], j ),
				vec3(i+1, pHeight + pHeightRandom[i+11][j+20], j ),
				vec3(i+1, pHeight + pHeightRandom[i+11][j+21], j+1 ),
				vec3(i, pHeight + pHeightRandom[i+10][j+21], j+1 ),
				(i+j)%2+1
			);
		}
	}
}


function drawGoldF() {
    var pHeight = -2.5;
    var pHeightRandom = [];
    for (var p = -20; p < 20; p++) {
        pHeightRandom[p] = [];
        for (var q = 0; q < 40; q++) {
            pHeightRandom[p][q] = (Math.random() - 0.75);
        }
    }
    for (var i = -10.0; i < 10; i++) {
        for (var j = 0.0; j > -20; j--) {
            drawSquareGold(
				vec3(i, pHeight + pHeightRandom[i + 10][j + 20], j),
				vec3(i + 1, pHeight + pHeightRandom[i + 11][j + 20], j),
				vec3(i + 1, pHeight + pHeightRandom[i + 11][j + 21], j + 1),
				vec3(i, pHeight + pHeightRandom[i + 10][j + 21], j + 1),
				(i + j) % 2 + 1
			);
        }
    }
}

function drawHawaii() {
    var pHeight = -3.5;
    var pHeightRandom = [];
    var counter = 0;
    var a = 64.0;
    var b = 256.0;
    var c = 128.0;
    var smoother = 15;
    for (var p = 0; p < b; p++) {
        pHeightRandom[p] = [];
        for (var q = 0; q < b; q++) {
            pHeightRandom[p][q] = data[counter];
            counter++;
        }
    }
    for (var i = -a; i < a; i++) {
        for (var j = a; j > -a; j--) {
            drawSquare(
				vec3(i, pHeight + pHeightRandom[(i + a) * 2][(j + a) * 2] / smoother, j),
				vec3(i + 1, pHeight + pHeightRandom[(i + a + 1) * 2][(j + a) * 2] / smoother, j),
				vec3(i + 1, pHeight + pHeightRandom[(i + a + 1) * 2][(j + a + 1) * 2] / smoother, j + 1),
				vec3(i, pHeight + pHeightRandom[(i + a) * 2][(j + a + 1) * 2] / smoother, j + 1),
				(i + j) % 2 + 1
			);
        }
    }
}

function drawGold() {
    var pHeight = -3.5;
    var pHeightRandom = [];
    var counter = 0;
    var a = 64.0;
    var b = 256.0;
    for (var p = 0; p < b; p++) {
        pHeightRandom[p] = [];
        for (var q = 0; q < b; q++) {
            pHeightRandom[p][q] = data[counter];
            counter++;
        }
    }
    for (var i = -a; i < a; i++) {
        for (var j = a; j > -a; j--) {
            drawSquareGold(
                vec3(i, pHeight + pHeightRandom[(i + a)][(j + a) % 20], j),
				vec3(i + 1, pHeight + pHeightRandom[(i + a + 1)][(j + a) / 2], j),
				vec3(i + 1, pHeight + pHeightRandom[(i + a + 1)][(j + a + 1) / 2], j + 1),
				vec3(i, pHeight + pHeightRandom[(i + a)][(j + a + 1) % 20], j + 1),
				(i + j) % 2 + 1
			);
        }
    }
}


function CheckboardTri(d, e, f, color){
	var baseC = [
       // vec4(.3, 0.7, .6, .1),
       // vec4(.1, .6, .3, .2),
       // vec4(.3, .9, .1, .2)
		vec3(0, 0.0, .4),
        vec3(.1, .6, .2),
        vec3(0, 0, .4)
    ];
    
    pColors.push( baseC[color]);
    pPoints.push( d );
    pColors.push( baseC[color]);
    pPoints.push( e );
    pColors.push( baseC[color]);
    pPoints.push( f );
    
}

function CheckboardGold(d, e, f, color) {
    var baseC = [
        vec4(.3, 0.7, .4, .2),
        vec4(.1, .6, .2, .2),
        vec4(.3, .2, .1, .2)

    ];

    pColors.push(baseC[color]);
    pPoints.push(d);
    pColors.push(baseC[color]);
    pPoints.push(e);
    pColors.push(baseC[color]);
    pPoints.push(f);

}

function triangle( a, b, c, color )
{

    // add colors and vertices for one triangle

    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 0.0)
    ];

    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
}

function tetra( a, b, c, d )
{
    // tetrahedron with each side using
    // a different color
    
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count )
{
    // check for end of recursion
    
    if ( count === 0 ) {
        tetra( a, b, c, d );
    }
    
    // find midpoints of sides
    // divide four smaller tetrahedra
    
    else {
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;
        
        divideTetra(  a, ab, ac, ad, count );
        divideTetra( ab,  b, bc, bd, count );
        divideTetra( ac, bc,  c, cd, count );
        divideTetra( ad, bd, cd,  d, count );
    }
}


function render()
{
	gl.clearColor(.7, .5, .9, 1.0);
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram( program ); //gasket
    
	//color
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    //gasket
	var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    mvMatrix = lookAt(vec3(radius*Math.sin(theta)*Math.cos(phi), radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta)), vec3(0.0, 0.0, .0) , vec3(0.0, 1.0, 0.0));
	document.getElementById("slider").onchange = function(event) {
		eye = event.target.value;
	};
    pMatrix = perspective(eye, ar, near, far);
    
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

	gl.uniform3fv(gl.getUniformLocation(program, "rTheta"), rTheta); //rotation
	gl.drawArrays( gl.TRIANGLES, 0, points.length ); //gasket
	
    gl.useProgram( pProgram ); //checkboard
    
	//terrain
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pColors), gl.STATIC_DRAW );
    var pColor = gl.getAttribLocation( pProgram, "pColor" );
    gl.vertexAttribPointer( pColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( pColor );
    var pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pPoints), gl.STATIC_DRAW );
    var pPosition = gl.getAttribLocation( pProgram, "pPosition" );
    gl.vertexAttribPointer( pPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( pPosition );

    gl.uniformMatrix4fv( pModelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( pProjection, false, flatten(pMatrix) );     
    requestAnimFrame(render);    
    gl.drawArrays( gl.TRIANGLES, 0, pPoints.length ); //checkboard

    
}
