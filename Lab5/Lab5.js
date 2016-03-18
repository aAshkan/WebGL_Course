
	//Some part of code and some concepts come from perspective.html, cube.html, 
	//shadedCube.html, shadedSphere, piazza and
    //http://learningwebgl.com/
    //http://www.lighthouse3d.com/
    //http://www.videotutorialsrock.com/opengl_tutorial

var oldX;
var oldY;
var oldZ;
var canvas;
var gl;

var numTimesToSubdivide = 3;
 
var index = 0; 

var pointsArray = [];
var normalsArray = [];


var near = -10;
var far = 10;
var radius = 1.5;
var rTheta = [ 1, 1, 0 ];
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;
var colors = 1;
var colorsLoc;
var on = 0;
var onLoc;
var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var vertices = [
	va, vb, vc, vd
	];
var lightX = lightY = lightZ = 1;
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.6, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, .6, 1.0 );
	document.getElementById("on").onclick = function(){
var lightAmbient = vec4(0, 0, 0, 0 );
var lightDiffuse = vec4(0, 0, 0, 0 );
var lightSpecular = vec4(0, 0, 0, 0 );
};
var materialAmbient = vec4( 1.0, .4, .7, 1.0 );
var materialDiffuse = vec4( 0.3, 0.8, .75, 0 );
var materialSpecular = vec4( .7, 0.8, 1.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

///////
var colorsArray = [];
var texCoordsArray = [];

var texture;

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];


var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];    

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

    
function triangle(a, b, c) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t1, t2));
     normal = vec4(normal);

     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);

     
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);

     index += 3;
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

	
	//////
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
    		pointsArray = [];
			//divideTetra was changed to divideTriangle
    		divideTriangle(va, vb, vc, vd, NumTimesToSubdivide);
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
	
	
	
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	//var cBuffer = gl.createBuffer();
    //gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

	document.getElementById("on").onclick = function(){
 lightAmbient = vec4(0, 0, 0, 0 );
 lightDiffuse = vec4(0, 0, 0, 0 );
 lightSpecular = vec4(0, 0, 0, 0 );
}
    document.getElementById("Button0").onclick = function(){radius *= 2.0;};
    document.getElementById("Button1").onclick = function(){radius *= 0.5;};
    document.getElementById("Button2").onclick = function(){theta += dr;};
    document.getElementById("Button3").onclick = function(){theta -= dr;};
    document.getElementById("Button4").onclick = function(){phi += dr;};
    document.getElementById("Button5").onclick = function(){phi -= dr;};
	document.getElementById("lightX").onclick = function(){lightX -= 1;};
    document.getElementById("sLightX").onclick = function(){lightX += 1;};
    document.getElementById("lightY").onclick = function(){lightY -= 1;};
    document.getElementById("sLightY").onclick = function(){lightY += 1;};
    document.getElementById("lightZ").onclick = function(){lightZ += 1;};
    document.getElementById("sLightZ").onclick = function(){lightZ -= 1;};
    
    document.getElementById("on").onclick = function () {
		if (on)
			on = 0;
		else
			on = 1; 
    
    document.getElementById("Button6").onclick = function(){
        numTimesToSubdivide++; 
        index = 0;
        pointsArray = []; 
        normalsArray = [];
        init();
    };
    document.getElementById("Button7").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = []; 
        normalsArray = [];
        init();
		

			
	};
    	
		
    };

document.getElementById("on").onclick = function(){
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );
}

    render();
}


function render() {
    gl.clearColor(.7, .5, .9, 1.0);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
            
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
        
    for( var i=0; i<index; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    window.requestAnimFrame(render);
}
