	//Some part of code and some concepts come from perspective.html, cube.html, 
	//shadedCube.html, shadedSphere, lab5 solution, piazza and
    //http://learningwebgl.com/
    //http://www.lighthouse3d.com/
    //http://www.videotutorialsrock.com/opengl_tutorial
	//http://people.ucsc.edu/~dfutsche/Lab
	//https://www.khronos.org
	//http://www.kamend.com/
	//http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
	
//Global Variables
var canvas;
var gl;
var points = [];
var colors = [];
var normals = [];

var eye = new vec3(0, 1, 1);
var at = new vec3(0, 0, 0);
var up = new vec3(0, 1, 0); 
var fov = 95;
var radius = 1.75;
var sphereRadius = 0.6;

var lightPosition = vec4(1, 1, 1, 1);
var projectionMatrix;
var ambientProduct;
var specularProduct;
var diffuseProduct;
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 0.0, 1.0);
var materialDiffuse = vec4(1.0, 0.0, 1.0, 1.0);

var translateX = 0.0;
var translateZ = 0.0;
var translateY = 0.0;
var preTranslateX = 0.0;
var preTranslateZ = 0.0;
var preTranslateY = 0.0;
var rTheta = [ 1, 1, 0 ];
var theta  = 0.0;
var phi    = 0.0;
var dr 	   = 5.0 * Math.PI/180.0;
var thetaLoc;
var modelMatrix = mat4();
var perspectiveMatrix = mat4();
var viewMatrix = mat4();
var toggleShading = 0;
var togglePerlin = 0;
var toggleTessellation = 0;


window.onload = function init()
{
	var i = 0;
	
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
	for (var z = 20.0; z > -20.0; z -= .5) {
		for (var x = -20.0; x < 20.0; x += .5) {
			var a = vec4(x, 0, z, 1.0);
			var b = vec4(x + .45, 0, z, 1.0);
			var c = vec4(x, 0, z + .45, 1.0);
			var d = vec4(x + .45, 0, z + .45, 1.0);
			if (i % 2) {    
				triangle(a, b, c, 4);
				triangle(d, c, b, 4);
			}
			else {
				triangle(a, b, c, 5);
				triangle(c, b, d, 5);
			}
			++i;
		}
		++i;
	}
	createSphere(10, 10);
	
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( .7, 0.0, .4, 1.0 );    
    gl.enable(gl.DEPTH_TEST); 
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
	var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	ambientProduct = mult(lightAmbient, materialAmbient);
	specularProduct = mult(lightSpecular, materialSpecular);
	diffuseProduct = mult(lightDiffuse, materialDiffuse);
	thetaLoc = gl.getUniformLocation(program, "theta");
	matrixLoc = gl.getUniformLocation(program, "modelMatrix");
	perspectiveMatrixLoc = gl.getUniformLocation(program, "perspectiveMatrix");
	viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
	projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	lightPositionLoc = gl.getUniformLocation( program, "lightPosition" );
	ambientProductLoc = gl.getUniformLocation( program, "ambientProduct" );
	specularProductLoc = gl.getUniformLocation( program, "specularProduct" );
	diffuseProductLoc = gl.getUniformLocation( program, "diffuseProduct" );
	toggleShadingLoc = gl.getUniformLocation(program, "toggleShading");
	togglePerlinLoc = gl.getUniformLocation(program, "togglePerlin");
	toggleTessellationLoc = gl.getUniformLocation(program, "toggleTessellation");
	
	document.getElementById("Button2").onclick = function(){theta += dr;};
    document.getElementById("Button3").onclick = function(){theta -= dr;};
    document.getElementById("Button4").onclick = function(){phi += dr;};
    document.getElementById("Button5").onclick = function(){phi -= dr;};
	
	document.getElementById("toggleShading").onclick = function () {
        if(toggleShading == 0.0)
			toggleShading = 1.0;
		else
			toggleShading = 0.0;
    };
	document.getElementById("togglePerlin").onclick = function () {
        if(togglePerlin == 0.0)
			togglePerlin = 1.0;
		else
			togglePerlin = 0.0;
    };
	document.getElementById("toggleTessellation").onclick = function () {
        if(toggleTessellation == 0.0)
			toggleTessellation = 1.0;
		else
			toggleTessellation = 0.0;
    };
	document.getElementById("lightX").onchange = function(event) {
		lightPosition[0] = event.target.value;
    };
	document.getElementById("lightY").onchange = function(event) {
		lightPosition[1] = event.target.value;
    };
	document.getElementById("lightZ").onchange = function(event) {
		lightPosition[2] = event.target.value;
    };
	document.getElementById("translateX").onchange = function(event) {
		translateX = event.target.value - preTranslateX;
		preTranslateX = event.target.value;
        modelMatrix = mult(modelMatrix, translate(translateX, 0, 0));
    };
	document.getElementById("translateY").onchange = function(event) {
		translateY = event.target.value - preTranslateY;
		preTranslateY = event.target.value;
        modelMatrix = mult(modelMatrix, translate(0, translateY, 0));
    };
	document.getElementById("translateZ").onchange = function(event) {
		translateZ = event.target.value - preTranslateZ;
		preTranslateZ = event.target.value;
        modelMatrix = mult(modelMatrix, translate(0, 0, translateZ));
    };
	projectionMatrix = ortho(-10, 20, -10, 20, -10, 20);
	gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );
	gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
	gl.uniform4fv(specularProductLoc, flatten(specularProduct));
	gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
	
    render();
};
function triangle( a, b, c, color )
{
    var baseColors = [
        vec4(1.0, 0.0, 0.0, 1.0),
        vec4(0.0, 1.0, 0.0, 1.0),
        vec4(0.0, 0.0, 1.0, 1.0),
        vec4(0.0, 0.0, 0.0, 1.0),
		vec4(.8, .8, .9, 1.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    ];	
     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t2, t1));
     normal = vec4(normal);

     normals.push(normal);
     normals.push(normal);
     normals.push(normal);
	
    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
}
function eyeFind() {	
	eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
		radius * Math.sin(theta) * Math.sin(phi),
		radius * Math.cos(theta));
	
}
function createSphere(lat, longitude) {
	for(var i = 0; i < lat; i++) {
		for(var j = 0; j < longitude; j++) {
			var sphereTheta = (Math.PI)/lat;
			var spherePhi = (2*Math.PI)/longitude;
			var a = vec4(sphereRadius * Math.sin(sphereTheta*i) * Math.cos(spherePhi*j), sphereRadius * Math.cos(sphereTheta*i), sphereRadius * Math.sin(sphereTheta*i) * Math.sin(spherePhi*j), 1.0);
			var b = vec4(sphereRadius * Math.sin(sphereTheta*(i + 1)) * Math.cos(spherePhi*j), sphereRadius * Math.cos(sphereTheta*(i + 1)), sphereRadius * Math.sin(sphereTheta*(i + 1)) * Math.sin(spherePhi*j), 1.0);
			var c = vec4(sphereRadius * Math.sin(sphereTheta*i) * Math.cos(spherePhi*(j + 1)), sphereRadius * Math.cos(sphereTheta*i), sphereRadius * Math.sin(sphereTheta*i) * Math.sin(spherePhi*(j + 1)), 1.0);
			var d = vec4(sphereRadius * Math.sin(sphereTheta*(i + 1)) * Math.cos(spherePhi*(j + 1)), sphereRadius * Math.cos(sphereTheta*(i + 1)), sphereRadius * Math.sin(sphereTheta*(i + 1)) * Math.sin(spherePhi*(j + 1)), 1.0);
			triangle( a, b, c, 2 )
			triangle( c, b, d, 2 )
		}
	}
}
function render()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var tempMat = modelMatrix;
	
	modelMatrix = new mat4();
	eyeFind();
	viewMatrix = lookAt(eye, at, up);
	perspectiveMatrix = perspective(fov, 1, .001, 10);
	modelMatrix = mult(modelMatrix, translate(0, -2.0, 0));	
	
	gl.uniformMatrix4fv(matrixLoc, false, flatten(modelMatrix));
	gl.uniformMatrix4fv(perspectiveMatrixLoc, false, flatten(perspectiveMatrix));
	gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
	gl.uniform4fv(lightPositionLoc, lightPosition);
	gl.uniform1i(toggleShadingLoc, toggleShading);
	gl.uniform1i(togglePerlinLoc, togglePerlin);
	gl.uniform1i(toggleTessellationLoc, toggleTessellation);
	gl.drawArrays( gl.TRIANGLES, 0, points.length - 600);	
	modelMatrix = tempMat;	
	gl.uniformMatrix4fv(matrixLoc, false, flatten(modelMatrix));
	gl.drawArrays( gl.TRIANGLES, points.length - 600, 600);
	setTimeout(
        function () {requestAnimFrame( render );},
        10
    );
}
