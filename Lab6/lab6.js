	
	//Some part of code and some concepts come from perspective.html, cube.html, 
	//shadedCube.html, shadedSphere, lab5 solution, piazza and
    //http://learningwebgl.com/
    //http://www.lighthouse3d.com/
    //http://www.videotutorialsrock.com/opengl_tutorial
	//http://people.ucsc.edu/~dfutsche/Lab
	//https://www.khronos.org
	

var canvas;
var gl;
var program;

var materialAmbient = vec4(0.0, 0.0, 0.0, 1.0);
var matertDiffuse = vec4(1.0, 0.3,0.4,1.0)
var materialSpecular = vec4(1.0, 0.5, 0.5, 0.0);
var lightAmbient = vec4(0.0, 0.0, 0.0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0,1.0, 1.0,1.0);
var eye = [0,.5,2];
var at = [0.0,0.0,-0.2];
var up = [0.0,1.0,0.0];
var theta =[0.0,0.0,0.0];
var projection;
var fov = 85;
var materialShininess = 100.0;
var lightPosition;

var projectionLoc;
var toggleLoc;
var ModelViewMatrixLo;

var ambientProduct;
var diffuseProduct;
var specularProduct;
var lightPositionLoc;
var ambientProductLoc;
var diffuseProductLoc;
var specularProductLoc;
var ambientMatLoc;
var diffuseMatLoc;
var specularMatLoc;
var shininessMatLoc;
var shininessLoc;
var light_;

var vertex_list = [];
var color_list = [];
var normals = [];
var index_list = [];
var objects = [];
var indexData = [];
var normalData = [];
var test = [];
var color = [];

var active = 0;
var toggle = true;
var counter = 1.0;
var type = 4.0;
var boolTexture = 0.0;
var normal = vec3(0,1,0);

var map = [
[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

var textureEarth;
var texturePlane;
var textureMars;
var locate;
var typeLoc;
var sampleLoc;
var textureLoc;


window.onload = function init()
{
	var lightSrc = new create_light();
	var plane = new create_object(0, 0, 0);
	var camera = new create_camera();
	
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( .3, 0.5, 0.8, .75 );

    // enable hidden-surface removal
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    aTexture = gl.getAttribLocation( program, "aTexture" );
    gl.enableVertexAttribArray( aTexture );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );

    vNormals = gl.getAttribLocation(program, "normal");
    gl.enableVertexAttribArray(vNormals);

    initEarth();
    initPlane();
    initMars();
	
	add_object(lightSrc);

	for(var i = 0; i < objects.length; i++){
       if(objects[i].name  == "Light") light_ = i;
    }

	lightPositionLoc = gl.getUniformLocation(program,"lightPosition");
	ambientProductLoc = gl.getUniformLocation(program,"ambientProduct");
	diffuseProductLoc = gl.getUniformLocation(program,"diffuseProduct");
	specularProductLoc = gl.getUniformLocation(program, "specularProduct");
	shininessLoc = gl.getUniformLocation(program,"shininess");
	ambientMatLoc = gl.getUniformLocation(program,"ambientMat");
	diffuseMatLoc = gl.getUniformLocation(program,"diffuseMat");
	specularMatLoc = gl.getUniformLocation(program,"specularMat");
	shininessMatLoc = gl.getUniformLocation(program,"shininessMat");

    init_sphere(gl, program, -0.6, 0.9, .85, "Sphere");
	create_plane();
	plane.name = "Plane";
	plane.type = 0;
	plane.texture = textureEarth;
	plane.point_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, plane.point_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertex_list), gl.DYNAMIC_DRAW);
	plane.normal_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, plane.normal_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.DYNAMIC_DRAW);
	plane.texture_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, plane.texture_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(color_list), gl.DYNAMIC_DRAW)
	plane.index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, plane.index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index_list), gl.STATIC_DRAW);
	plane.index_buffer.itemSize = 1;
	plane.index_buffer.numItems = index_list.length;
	add_object(plane);
	
	add_object(camera);

    projectionLoc = gl.getUniformLocation(program,"Projection");
    toggleLoc = gl.getUniformLocation(program,"toggle");
    typeLoc = gl.getUniformLocation(program,"shade");
    textureLoc = gl.getUniformLocation(program,"textures");
    sampleLoc = gl.getUniformLocation(program,"uSampler");

    document.getElementById("light").onclick = function(){
      if(toggle){
        toggle = !toggle;
        counter = 1.0;
        type = 2.0;
      }
	  else {
        toggle = !toggle;
        counter = 0.0;
        type = 4.0;
      }

    }

    document.getElementById("texture").onclick = function(){
		if(boolTexture == 0.0) 
			boolTexture = 1.0;
        else 
			boolTexture = 0.0;
		 
		 if(objects[active].type == 0) 
			objects[active].option = boolTexture;
    }
	
    document.getElementById("textureEarth").onclick = function(){
     objects[active].texture = textureEarth;
    }

    document.getElementById("texturePlane").onclick = function(){
     objects[active].texture = texturePlane;
    }

    document.getElementById("textureMars").onclick = function(){
     objects[active].texture = textureMars;
    }

    for(var i = 0; i < objects.length; i++){
       if(objects[i].name  == "Camera") 
			locate = i;
      }
    render();
};

    function initEarth() {
        textureEarth = gl.createTexture();
        textureEarth.image = new Image();
        textureEarth.image.onload = function () {
        handleLoadedTexture(textureEarth)
        }
        textureEarth.image.src = "earth.jpeg";
    }

    function initPlane() {
        texturePlane = gl.createTexture();
        texturePlane.image = new Image();
        texturePlane.image.onload = function () {
            handleLoadedTexture(texturePlane)
        }
        texturePlane.image.src = "Checker.png";
    }

    function initMars() {
        textureMars = gl.createTexture();
        textureMars.image = new Image();
        textureMars.image.onload = function () {
            handleLoadedTexture(textureMars)
        }

        textureMars.image.src = "mars.jpg";
    }


	function init_sphere(gl, program,x,y,z, name){

		var sphere = new create_object(x, y, z);

        var latitudeBands = 30;
        var longitudeBands = 30;
        var radius = 0.3;
        normalData = [];
        test = [];
        color = [];
        for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
            var theta = latNumber * Math.PI / latitudeBands;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
                var phi = longNumber * 2 * Math.PI / longitudeBands;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longitudeBands);
                var v = 1 - (latNumber / latitudeBands);

                normalData.push(x,y,z);
                color.push(vec2(u,v));
                test.push(vec3(radius * x, radius * y, radius * z));

            }
        }

	indexData = [];
	for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
		for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
			 var first = (latNumber * (longitudeBands + 1)) + longNumber;
			 var second = first + longitudeBands + 1;

			   indexData.push(first);
			   indexData.push(second);
			   indexData.push(first + 1);

			   indexData.push(second);
			   indexData.push(second + 1);
			   indexData.push(first + 1);

		}
	}

		sphere.name = name;
		sphere.type = 0;
	 
		sphere.texture = textureMars; 
		sphere.point_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, sphere.point_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(test), gl.DYNAMIC_DRAW);


		sphere.normal_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, sphere.normal_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(normalData), gl.DYNAMIC_DRAW);

		sphere.texture_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, sphere.texture_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(color), gl.DYNAMIC_DRAW)

		sphere.index_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.index_buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
		sphere.index_buffer.itemSize = 1;
		sphere.index_buffer.numItems = indexData.length;

		add_object(sphere);

	    ModelViewMatrixLo = gl.getUniformLocation(program,
										"modelViewMatrix");

}


	function alter(){
		active++;
		if(active >= objects.length) 
			active = 0;
	   alert(objects[active].name + " is chosen!");

	}
	window.onkeydown = function( event ) {
		var key = String.fromCharCode(event.keyCode);
		switch( key ) {
		   case 'T':
			 alter();
			   break;
			   
		  case 'A':
		   translate_x(-0.1);
			break;

		  case 'D':
		  translate_x(0.1);
			break;

		  case 'Z':
		  translate_y(-0.1);
		  break;

		  case 'Q':
			translate_y(0.1);
			break;
			   
			   
		  case 'W':
		   translate_z( -0.1);
			break;

		  case 'S':
			translate_z(0.1);
			break;
		}
	};

function translate_x(x){
  if(objects[active].name == "Camera"){
     objects[active].eye[0] += x;
    objects[active].at[0] += x;
} 
   objects[active].center_x += x;
}

function translate_z(z){
   if(objects[active].name == "Camera"){
     objects[active].eye[2] += z;
    objects[active].at[2] += z;
}
   objects[active].center_z += z;
}

function translate_y(y){
   
  if(objects[active].name == "Camera"){
     objects[active].eye[1] += y;
    objects[active].at[1] += y;
}
  objects[active].center_y += y;
}

function create_light(){
  
  this.name = "Light";
  this.type = 1;
  this.center_x = 1.0;
  this.center_y = 3.0;
  this.center_z = 0.0;
}

function create_camera(){
  
  this.name = "Camera";
  this.type = 1;
  this.center_x = 0;
  this.center_y = 0;
  this.center_z = 0;
  
  this.eye =[-.5, 0.5, 2.0];
  this.at = [-.5, .75, -0.2];
  this.up = [0.0, 1.0, 0.0];

}

function render()
{
	var loc = objects[light_];
   
	gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    projection = lookAt(objects[locate].eye, objects[locate].at, objects[locate].up);
    projection = mult(perspective(fov,1,.0001,30),projection);
    gl.uniformMatrix4fv(projectionLoc,false,flatten(projection));
    gl.uniform1f(toggleLoc,counter);
    gl.uniform1f(typeLoc,type);

	ambientProduct = mult(lightAmbient, materialAmbient);
	diffuseProduct = lightDiffuse;
	specularProduct = mult(lightSpecular,materialSpecular);

	gl.uniform4fv(ambientProductLoc, ambientProduct);
	gl.uniform4fv(diffuseProductLoc, diffuseProduct);
	gl.uniform4fv(specularProductLoc, specularProduct);
	lightPosition = vec4(loc.center_x, loc.center_y ,loc.center_z,1.0);
	gl.uniform4fv(lightPositionLoc,flatten(lightPosition));
	gl.uniform1f(shininessLoc,materialShininess);

	gl.uniform4fv(ambientMatLoc, ambientProduct);
	gl.uniform4fv(diffuseMatLoc, diffuseProduct);
	gl.uniform4fv(specularMatLoc, specularProduct);
	gl.uniform1f(shininessMatLoc,materialShininess);

     render_objects(gl, aTexture, vPosition, vNormals);
     requestAnimFrame(render );
}

function render_objects(gl, aTexture, vPosition, vNormals){
  for(var i = 0; i < objects.length; i++){
    var obj = objects[i];
    if(obj.type != 0) 
		continue;   
    gl.uniform1f(textureLoc, obj.option);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, obj.texture);
    gl.uniform1i(sampleLoc, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER,obj.texture_buffer);
    gl.vertexAttribPointer( aTexture, 2, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.normal_buffer);
    gl.vertexAttribPointer(vNormals, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.point_buffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.index_buffer);
    obj.mvm = translate(obj.center_x, obj.center_y, obj.center_z);
    gl.uniformMatrix4fv(ModelViewMatrixLo, false, flatten(obj.mvm));
    gl.drawElements(gl.TRIANGLES, obj.index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
 }

 function handleLoadedTexture(texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

 
function create_plane(){

 var start_x = -5
 var start_y = -2;
 var range = 10;
 var y_const = -1.0;
 var stat = true
 var color = vec3(0.5, 0.0, 0.3);
 var normal = vec3(0.0, 0.1, 0.0);


vertex_list.push(vec3(-10.0, 0.1, 10.0));
color_list.push(vec2(0,0));
normals.push(normal);

vertex_list.push(vec3(10.0, 0.1, 10.0));
color_list.push(vec2(0,1));
normals.push(normal);

vertex_list.push(vec3(10.0, 0.1, -10.0));
color_list.push(vec2(1,1));
normals.push(normal);

vertex_list.push(vec3(-10.0, 0.1, -10.0));
color_list.push(vec2(0,1));
normals.push(normal);

index_list.push(0);
index_list.push(1);
index_list.push(2);

index_list.push(0);
index_list.push(2);
index_list.push(3);

}

function add_object(object){
        objects.push(object);
}


function create_object(x, y, z){
  
  this.name;
  this.type;
  this.point_buffer;
  this.texure_buffer;
  this.normal_buffer;
  this.index_buffer;
  this.texure;
  this.option = boolTexture;
  
  this.center_x = x;
  this.center_y = y;
  this.center_z = z;
  this.mvm;
}

