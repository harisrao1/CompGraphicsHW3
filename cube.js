"use strict";

var canvas;
var gl;

var numPositions  = 36;

var positions = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = [0, 0, 0];
//same as in the colored cube example


//here are some definitions that may be needed.
var modelMatrix=mat4();
var viewMatrix=mat4();
var projectionMatrix=mat4();
var resultMatrix=mat4();
var identityMatrix=mat4();
var matrixLoc;

var origin=vec3(0,0,0);
var cameraUp=vec3(0,1,0);
var cameraPosition=vec3(0,0,1);
var lookAtCube;
var cameraText;
var useProjection=false;
var usePerspective=false;

var xdeg, ydeg, zdeg;
var xpos, ypos, zpos;
var xscale, yscale, zscale;

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);


    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    matrixLoc = gl.getUniformLocation(program, "uMatrix");



    render();
}

function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d)
{
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    var vertices = [
        vec4(-0.25, -0.25,  0.25, 1.0),
        vec4(-0.25,  0.25,  0.25, 1.0),
        vec4(0.25,  0.25,  0.25, 1.0),
        vec4(0.25, -0.25,  0.25, 1.0),
        vec4(-0.25, -0.25, -0.25, 1.0),
        vec4(-0.25,  0.25, -0.25, 1.0),
        vec4(0.25,  0.25, -0.25, 1.0),
        vec4(0.25, -0.25, -0.25, 1.0)
    ];

    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 1.0, 1.0, 1.0)   // white
    ];

    //vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
    }
}

function Move(thetaX, thetaY, thetaZ, x, y, z)
{

    var cosX = Math.cos( radians(thetaX) );
    var sinX = Math.sin( radians(thetaX) );
    var cosY = Math.cos( radians(thetaY) );
    var sinY = Math.sin( radians(thetaY) );
    var cosZ = Math.cos( radians(thetaZ) );
    var sinZ = Math.sin( radians(thetaZ) );
    if (lookAtCube)
    {
        return mat4(
        cosY * cosZ,          cosY * sinZ,          -sinY,   0,
        sinX*sinY*cosZ - cosX*sinZ, sinX*sinY*sinZ + cosX*cosZ, sinX*cosY, 0,
        cosX*sinY*cosZ + sinX*sinZ, cosX*sinY*sinZ - sinX*cosZ, cosX*cosY, 0,
        0.0,              0.0,              0.0,   1.0);
    }
    else
    {
        return mat4(
        cosY * cosZ,          cosY * sinZ,          -sinY,   x,
        sinX*sinY*cosZ - cosX*sinZ, sinX*sinY*sinZ + cosX*cosZ, sinX*cosY, y,
        cosX*sinY*cosZ + sinX*sinZ, cosX*sinY*sinZ - sinX*cosZ, cosX*cosY, z,
        0.0,              0.0,              0.0,   1.0);
    }
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//todo: compute the model matrix here instead of in the shader
	//modelMatrix=...
	//hint: you can use rotateX, rotateY and rotateZ to get matrices and combine them.

    lookAtCube = document.getElementById( "lookAtCube" ).checked;
    console.log(lookAtCube);
    xdeg = document.getElementById( "xrot" ).value;
    ydeg = document.getElementById( "yrot" ).value;
    zdeg = document.getElementById( "zrot" ).value;
    xpos = document.getElementById( "xpos" ).value / 250;
    ypos = document.getElementById( "ypos" ).value / 250;
    zpos = document.getElementById( "zpos" ).value / 250;

	//todo: 
	//1. compute the view matrix when the camera is pointing at the -z direction.
	//hint: here the view matrix is the inverse of the camera matrix, which is a translation from the origin to the position of the camera(by default the camera is already looking towards the -z direction if you don't rotate it). Then combine the model and view matrices. There's a function translate( x, y, z ).
	//2. add support for looking at the cube
	//hint: there's a function lookAt( eye, at, up ). We want the camera (eye) to look at the center of the cube.
	//lookAt(cameraPosition, origin, cameraUp);
	//3. add orthographic or perspective projection if it's enabled, and multiply the projection matrix with the model-view matrix.
	//hint: there are functions perspective( fovy, aspect, near, far ) and ortho( left, right, bottom, top, near, far ).
	
 
    var test4 = Move(xdeg, ydeg, zdeg, xpos, ypos, zpos);
	
	gl.uniformMatrix4fv(matrixLoc, false, flatten(test4));


    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    requestAnimationFrame(render);
}
