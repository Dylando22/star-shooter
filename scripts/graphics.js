// ------------------------------------------------------------------
// 
// This is the graphics object.  It provides a pseudo pixel rendering
// space for use in demonstrating some basic rendering techniques.
//
// ------------------------------------------------------------------
MySample.graphics = (function(pixelsX, pixelsY, showPixels) {
    'use strict';

    let canvas = document.getElementById('canvas-main');
    let context = canvas.getContext('2d', { alpha: false });

    let deltaX = canvas.width / pixelsX;
    let deltaY = canvas.height / pixelsY;

    function factorial(x) {
        if(x === 0 || x === 1){
            return 1
        }
        else{
            return factorial(x-1) * x;
        }
    }

    let hermitePoints = function(){
        let memo = [];

        return function inner(u){
            let u1000 = Math.floor(u *1000);
            if(memo[u1000] === undefined){
                console.log("memoizing hermite")
                let temp = []
                let u2 = u * u;
                let u3 = u*u*u;
                temp[0] = ((2*u3) - (3 * u2)+1);
                temp[1] = (-2*(u3))+(3*(u2));
                temp[2] = ((u3)-(2*(u2))+u);
                temp[3] = (u3-u2);
                memo[u1000] = temp;
            }
            return memo[u1000]
        }
    }()

    let cardinalPoints = function(){
        let memo = [];


        return function inner(u,t){
        
            let u1000 = Math.floor(u *1000);
            let t1000 = Math.floor(t * 1000);
            if(memo[u1000] === undefined){
                memo[u1000] = []
                // console.log("memoizing cardinal")
                let temp = []
                let s = (1 - t)/2;
                let u2 = u * u;
                let u3 = u*u*u;
                temp[0] = (-s * u3 + 2 * s * u2 - s * u);
                temp[1] = ((2 - s) * u3 + (s - 3) * u2 + 1);
                temp[2] = ((s - 2) * u3 + (3 - 2 * s) * u2 + s * u);
                temp[3] = (s * u3 - s * u2);
                memo[u1000][t1000] = temp;
            }
            else if( memo[u1000][t1000] === undefined){
                // console.log("memoizing cardinal")
                let temp = []
                let s = (1 - t)/2;
                let u2 = u * u;
                let u3 = u*u*u;
                temp[0] = (-s * u3 + 2 * s * u2 - s * u);
                temp[1] = ((2 - s) * u3 + (s - 3) * u2 + 1);
                temp[2] = ((s - 2) * u3 + (3 - 2 * s) * u2 + s * u);
                temp[3] = (s * u3 - s * u2);
                memo[u1000][t1000] = temp;
            }
            return memo[u1000][t1000];
        }
    }()

    let blendC = function(){
        let memo = []
        return function inner(n,k){
            if(memo[n] === undefined){
                memo[n] = []
            }
            if(memo[n][k] === undefined){
                let x = n-k;
                memo[n][k] = (factorial(n) / (factorial(k) * factorial(x)));
            }
            return memo[n][k];
        }

    }();


    let bezierPoints = function(){
        let memo = [];

        return function inner(u){
            let u1000 = Math.floor(u *1000);
            if(memo[u1000] === undefined){
                // console.log("memoizing bezier")
                let temp = []
                let u2 = u * u;
                let u3 = u*u*u;
                let min2 = (1-u) * (1-u);
                temp[0] = (blendC(3,0)) *(1-u) * (1-u) * (1-u);
                temp[1] = (blendC(3,1)) *u*min2;
                temp[2] = (blendC(3,2)) *u2*(1-u);
                temp[3] = (blendC(3,3)) *u3;
                memo[u1000] = temp;
            }
            return memo[u1000]
        }
    }()

    let bezierMatrixPoints = function(){
        let memo = [];

        return function inner(u){
            let u1000 = Math.floor(u *1000);
            if(memo[u1000] === undefined){
                // console.log("memoizing bezier Matrix")
                let temp = []
                let u2 = u * u;
                let u3 = u*u*u;
                temp[0] = (3* u2 - 3 *u3);
                temp[1] =  (1 - 3 * u + 3 * u2 - u3);
                temp[2] = u3;
                temp[3] = (3 * u - 6 * u2 + 3 * u3);
                memo[u1000] = temp;
            }
            return memo[u1000]
        }
    }()


    //------------------------------------------------------------------
    //
    // Public function that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.restore();

        //
        // Draw a very light background to show the "pixels" for the framebuffer.
        if (showPixels) {
            context.save();
            context.lineWidth = .1;
            context.strokeStyle = 'rgb(150, 150, 150)';
            context.beginPath();
            for (let y = 0; y <= pixelsY; y++) {
                context.moveTo(1, y * deltaY);
                context.lineTo(canvas.width, y * deltaY);
            }
            for (let x = 0; x <= pixelsX; x++) {
                context.moveTo(x * deltaX, 1);
                context.lineTo(x * deltaX, canvas.width);
            }
            context.stroke();
            context.restore();
        }
    }

    //------------------------------------------------------------------
    //
    // Public function that renders a "pixel" on the framebuffer.
    //
    //------------------------------------------------------------------
    function drawPixel(x, y, color) {
        x = Math.trunc(x);
        y = Math.trunc(y);

        context.fillStyle = color;
        context.fillRect(x * deltaX, y * deltaY, deltaX, deltaY);
    }

    //------------------------------------------------------------------
    //
    // Helper function used to draw an X centered at a point.
    //
    //------------------------------------------------------------------
    function drawPoint(x, y, ptColor) {
        drawPixel(x - 1, y - 1, ptColor);
        drawPixel(x + 1, y - 1, ptColor);
        drawPixel(x, y, ptColor);
        drawPixel(x + 1, y + 1, ptColor);
        drawPixel(x - 1, y + 1, ptColor);
    }

     //------------------------------------------------------------------
    //
    // Bresenham line drawing algorithm.
    //------------------------------------------------------------------
    function drawLine(x1, y1, x2, y2, color) {
        let dX = Math.abs(x2 - x1);
        let dY = Math.abs(y2 - y1);
        // if it is one of the wider octants, Octants based on slides
            // Oct 2
            if(x2 >= x1 && y2 <  y1 && dY >= dX){
                BresenhamY(x1,y1, dX, dY,1,color);
            }
            // Oct 5
            else if(x2 > x1 && y2 <= y1 && dX > dY){
                BresenhamX(x1,y1, dX, dY,-1,color);

            }
            // Oct 1
            else if(x2 > x1 && y2 > y1 && dX >= dY){
                BresenhamX(x1,y1, dX, dY,1,color);

            }
            // Oct 6
            else if(x2 >= x1 && y2 >  y1 && dY > dX){
                BresenhamY(x2,y2, dX, dY,-1,color);

            }
            // Oct 3
            else if(x2 < x1 && y2 > y1 && dY > dX){
                BresenhamY(x2,y2, dX, dY,1,color);
            }
            // Oct 4
            else if(x2 < x1 && y2 >= y1 && dX >= dY){
                BresenhamX(x2,y2, dX, dY,-1,color);

            }
            // Oct 0
            else if(x2 < x1 && y2 <= y1 && dX > dY){
                BresenhamX(x2,y2, dX, dY,1,color);

            }
            // Oct 7
            else {
                BresenhamY(x1,y1, dX, dY,-1,color);
            }
        
    }

    function BresenhamY(x1, y1, dX, dY, xAdd, color){
        let p = 2 * dX - dY;;
        let x = x1;
        let y = y1;

        let count = dY;

        while(count-- >= 0){
            drawPixel(x,y,color);
            y--;
            if(p >= 0){
                x += xAdd;
                p += (2*dX - 2*dY);
            }else {
                p += 2 * dX;
            }
        }
       
    }

    function BresenhamX(x1, y1, dX, dY, yAdd, color){
        let x = x1;
        let y = y1;

        let p = 2 * dY - dX;
        let count = dX;

        while (count-- >= 0){
            drawPixel(x,y,color);
            x++;
            if(p >= 0){
                y += yAdd;
                p += (2 * dY - 2 * dX);
            } else {
                p += 2 * dY;
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Renders an Hermite curve based on the input parameters.
    //
    //------------------------------------------------------------------
    function drawCurveHermite(controls, segments, showPoints, showLine, showControl, lineColor) {
        let x = controls[0];
        let y = controls[1];
        let nextX;
        let nextY;
        drawPoint(x,y,'cyan');
        drawPoint(controls[4],controls[5], lineColor);
        for(let i = (1/segments); i <= 1; i += (1/segments)){
            let points = hermitePoints(i);
            nextX = (x*points[0]) + (controls[4]*(points[1])) + (controls[2]*points[2]) + (controls[6]*points[3])
            nextY = (y*points[0]) + (controls[5]*(points[1])) + (controls[3]*points[2]) + (controls[7]*points[3])
            if(showLine){
                drawLine(x,y,nextX,nextY,lineColor);
            }
            if(showPoints){
                drawPoint(nextX,nextY, 'yellow');
            }
            x = nextX;
            y = nextY;
        }
        if(showLine){
            drawLine(nextX,nextY,controls[4], controls[5],lineColor);
        }
        if(showControl){
            drawLine(controls[0],controls[1],controls[2], controls[3],"green"); 
            drawLine(controls[4],controls[5],controls[6], controls[7],"green"); 

        }


    }

    //------------------------------------------------------------------
    //
    // Renders a Cardinal curve based on the input parameters.
    //
    //------------------------------------------------------------------
    function drawCurveCardinal(controls, segments, showPoints, showLine, showControl, lineColor) {
        let x = controls[0];
        let y = controls[1];
        let nextX;
        let nextY;
        let endX = controls[4];
        let endY = controls[5];
        let Xmin1 = controls[2];
        let Ymin1 = controls[3];
        let Xplus1 = controls[6];
        let Yplus1 = controls[7];
        for(let i = (1/segments); i <=1; i += (1/segments) ){
            let points = cardinalPoints(i,controls[8]);
            nextX = Xmin1 * points[0] + controls[0] * points[1] + endX * points[2] + Xplus1 * points[3];
            nextY = Ymin1 * points[0] + controls[1] * points[1] + endY * points[2] + Yplus1 * points[3];            
            if(showLine){
            drawLine(x,y,nextX,nextY,lineColor);
            }
            if(showPoints){
                drawPoint(nextX,nextY, 'white');
            }
            x = nextX;
            y = nextY;
        }
        if(showLine){
            drawLine(nextX,nextY,controls[4], controls[5],lineColor);
        }
        if(showControl){
            drawPoint(controls[2], controls[3],"yellow"); 
            drawPoint(controls[6], controls[7],"yellow"); 

        }


    }

    //------------------------------------------------------------------
    //
    // Renders a Bezier curve based on the input parameters.
    //
    //------------------------------------------------------------------
    function drawCurveBezier(controls, segments, showPoints, showLine, showControl, lineColor) {
        let p0X = controls[0];
        let p0Y = controls[1];
        let p1X = controls[2];
        let p1Y = controls[3];
        let p2X = controls[6];
        let p2Y = controls[7];
        let p3X = controls[4];
        let p3Y = controls[5];
        let x = p0X;
        let y = p0Y;
        let nextX;
        let nextY;
        for(let i = (1/segments); i <=1; i += (1/segments) ){
            let points = bezierPoints(i);
            nextX = (p0X * points[0]) + (p1X * points[1]) + (p2X * points[2]) + (p3X * points[3]);
            nextY = (p0Y * points[0]) + (p1Y * points[1]) + (p2Y * points[2]) + (p3Y * points[3]);
            if(showLine){
                drawLine(x,y,nextX,nextY,lineColor);
            }
            if(showPoints){
                drawPoint(nextX,nextY, 'yellow');
            }
            x = nextX;
            y = nextY;
        }
        if(showLine){
            drawLine(nextX,nextY,p3X,p3Y,lineColor);
        }
        if(showControl){
            drawPoint(controls[2], controls[3],"yellow"); 
            drawPoint(controls[6], controls[7],"yellow"); 

        }
        drawPoint(((p3X + p0X) / 2),((p3Y + p0Y)/2), 'white')
        drawPoint(p0X, p0Y, 'white');
        drawPoint(p3X, p3Y, 'white');

    }

    //------------------------------------------------------------------
    //
    // Renders a Bezier curve based on the input parameters; using the matrix form.
    // This follows the Mathematics for Game Programmers form.
    //
    //------------------------------------------------------------------
    function drawCurveBezierMatrix(controls, segments, showPoints, showLine, showControl, lineColor) {
        let p0X = controls[0];
        let p0Y = controls[1];
        let p1X = controls[2];
        let p1Y = controls[3];
        let p2X = controls[6];
        let p2Y = controls[7];
        let p3X = controls[4];
        let p3Y = controls[5];
        let x = p3X;
        let y = p3Y;
        let nextX;
        let nextY;

        for(let i = (1/segments); i <=1; i += (1/segments) ){
            let points = bezierMatrixPoints(i);
            nextX = (p1X * points[0] + p3X * points[1] + p0X * points[2] + p2X * points[3]);
            nextY = (p1Y * points[0] + p3Y * points[1] + p0Y * points[2] + p2Y * points[3]);
            if(showLine){
                drawLine(x,y,nextX,nextY,lineColor);
            }
            if(showPoints){
                drawPoint(nextX,nextY, 'yellow');
            }
            x = nextX;
            y = nextY;
        }
                    
        if(showLine){
            drawLine(p0X,p0Y,x,y,lineColor);
        }
        if(showControl){
            drawPoint(controls[2], controls[3],"yellow"); 
            drawPoint(controls[6], controls[7],"yellow"); 

        }

    }

    //------------------------------------------------------------------
    //
    // Entry point for rendering the different types of curves.
    // I know a different (functional) JavaScript pattern could be used
    // here.  My goal was to keep it looking C++'ish to keep it familiar
    // to those not expert in JavaScript.
    //
    //------------------------------------------------------------------
    function drawCurve(type, controls, segments, showPoints, showLine, showControl, lineColor) {
        switch (type) {
            case api.Curve.Hermite:
                drawCurveHermite(controls, segments, showPoints, showLine, showControl, lineColor);
                break;
            case api.Curve.Cardinal:
                drawCurveCardinal(controls, segments, showPoints, showLine, showControl, lineColor);
                break;
            case api.Curve.Bezier:
                drawCurveBezier(controls, segments, showPoints, showLine, showControl, lineColor);
                break;
            case api.Curve.BezierMatrix:
                drawCurveBezierMatrix(controls, segments, showPoints, showLine, showControl, lineColor);
                break;
        }
    }

//------------------------------------------------------------------
//
// Renders a primitive of the form: {
//    verts: [ {x, y}, ...],    // Must have at least 2 verts
//    center: { x, y }
// }
// 
// connect: If true, the last vertex and first vertex have a line drawn between them.
//
// color: The color to use when drawing the lines
//
//------------------------------------------------------------------
function drawPrimitive(primitive, connect, color) {
let vertices = primitive.verts;
let center = primitive.center;
let x = vertices[0].x
let y = vertices[0].y


for(let i=1; i<vertices.length;i++){
    drawLine(center.x + x, center. y +y, center.x + vertices[i].x,center.y + vertices[i].y,color);
    x = vertices[i].x;
    y = vertices[i].y;
}
if(connect){
    drawLine(center.x + x, center.y + y, center.x + vertices[0].x, center.y + vertices[0].y,color);
}
}

//------------------------------------------------------------------
//
// Translates a point of the form: { x, y }
//
// distance: { x, y }
//
//------------------------------------------------------------------
function translatePoint(point, distance) {
    return {
        x: point.x + distance.x,
        y: point.y + distance.y
    }
}


//------------------------------------------------------------------
//
// Translates a primitive of the form: {
//    verts: [],    // Must have at least 2 verts
//    center: { x, y }
// }
//
// distance: { x, y }
//
//------------------------------------------------------------------
function translatePrimitive(primitive, distance) {
    let center = translatePoint(primitive.center,distance);
    return{
        center,
        verts: primitive.verts,
        startTime: primitive.startTime,
        move: primitive.move,
        angle: primitive.angle,
        translate: primitive.translate
    }
}

//------------------------------------------------------------------
//
// Scales a primitive of the form: {
//    verts: [],    // Must have at least 2 verts
//    center: { x, y }
// }
//
// scale: { x, y }
//
//------------------------------------------------------------------
function scalePrimitive(primitive, scale) {
    let newV = [];
    for(let i=0;i<primitive.verts.length;i++){
        let x = primitive.verts[i].x * scale.x;
        let y = primitive.verts[i].y * scale.y;
        newV.push({
            x,
            y,
        })
    }
    return {
        center: primitive.center,
        verts: newV,
        startTime: primitive.startTime,
        move: primitive.move,
        angle: primitive.angle,
        translate: primitive.translate
    }
}

//------------------------------------------------------------------
//
// Rotates a primitive of the form: {
//    verts: [],    // Must have at least 2 verts
//    center: { x, y }
// }
//
// angle: radians
//
//------------------------------------------------------------------
function rotatePrimitive(primitive, angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    let v = primitive.verts;
    let newV = [];
    for(let i=0; i<primitive.verts.length; i++){
        let x = v[i].x * cos - v[i].y * sin;
        let y = v[i].x * sin + v[i].y * cos;
        newV.push({
            x,
            y,
        })
    }
    return {
        center: primitive.center,
        verts: newV,
        startTime: primitive.startTime,
        move: primitive.move,
        angle: primitive.angle,
        translate: primitive.translate
    }
    
}

//------------------------------------------------------------------
//
// Translates a curve.
//    type: Cardinal, Bezier
//    controls: appropriate to the curve type
//    distance: { x, y }
//
//------------------------------------------------------------------
function translateCurve(type, controls, distance) {
    let newControls = [];
    newControls[0] = controls[0] + distance.x;
    newControls[1] = controls[1] + distance.y;
    newControls[2] = controls[2] + distance.x;
    newControls[3] = controls[3] + distance.y;
    newControls[6] = controls[6] + distance.x;
    newControls[7] = controls[7] + distance.y;
    newControls[4] = controls[4] + distance.x;
    newControls[5] = controls[5] + distance.y;
    newControls[8] = controls[8];
    return newControls;

}

//------------------------------------------------------------------
//
// Scales a curve relative to its center.
//    type: Cardinal, Bezier
//    controls: appropriate to the curve type
//    scale: { x, y }
//
//------------------------------------------------------------------
function scaleCurve(type, controls, scale) {
    let centerX = (controls[0]+controls[4])/2
    let centerY = (controls[1]+controls[5])/2
    let newControls = [];
    let temp = translateCurve(type,controls,{x: -centerX, y: -centerY});
    newControls[0] = temp[0] * scale.x;
    newControls[1] = temp[1] * scale.y;
    newControls[2] = temp[2] * scale.x;
    newControls[3] = temp[3] * scale.y;
    newControls[6] = temp[6] * scale.x;
    newControls[7] = temp[7] * scale.y;
    newControls[4] = temp[4] * scale.x;
    newControls[5] = temp[5] * scale.y;
    newControls[8] = controls[8];
    return translateCurve(type,newControls,{x: centerX, y: centerY});
}

//------------------------------------------------------------------
//
// Rotates a curve about its center.
//    type: Cardinal, Bezier
//    controls: appropriate to the curve type
//    angle: radians
//
//------------------------------------------------------------------
function rotateCurve(type, controls, angle) {
    let centerX = (controls[0]+controls[4])/2
    let centerY = (controls[1]+controls[5])/2
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    let xC = -centerX * cos - -centerY * sin + centerX;
    let yC = -centerX * sin + -centerY * cos + centerY;
    
    let newControls = [];
    newControls[0] = controls[0] * cos - controls[1] * sin + xC;
    newControls[1] = controls[0] * sin + controls[1] * cos + yC;
    newControls[2] = controls[2] * cos - controls[3] * sin + xC;
    newControls[3] = controls[2] * sin + controls[3] * cos + yC;
    newControls[6] = controls[6] * cos - controls[7] * sin + xC;
    newControls[7] = controls[6] * sin + controls[7] * cos + yC;
    newControls[4] = controls[4] * cos - controls[5] * sin + xC;
    newControls[5] = controls[4] * sin + controls[5] * cos + yC;
    newControls[8] = controls[8];
    return newControls;

}

    function initialize(){
        for(let i=1; i <= 50; i++){
            for(let j = (1/i); j <= 1; j += (1/i)){
                hermitePoints(j);
                bezierPoints(j);
                bezierMatrixPoints(j);
                for(let t= -5; t <=5; t += .5){
                    cardinalPoints(j,t);
                }
            }
        }
        for (let j =0; j <= 3; j++){
            blendC(3,j);
        }

    }

    //
    // This is what we'll export as the rendering API
    const api = {
        clear: clear,
        drawPixel: drawPixel,
        drawLine: drawLine,
        drawCurve: drawCurve,
        drawPrimitive: drawPrimitive,
        translatePrimitive: translatePrimitive,
        scalePrimitive: scalePrimitive,
        rotatePrimitive: rotatePrimitive,
        translateCurve: translateCurve,
        scaleCurve: scaleCurve,
        rotateCurve: rotateCurve,
        initialize: initialize,
    };

    Object.defineProperty(api, 'sizeX', {
        value: pixelsX,
        writable: false
    });
    Object.defineProperty(api, 'sizeY', {
        value: pixelsY,
        writable: false
    });
    Object.defineProperty(api, 'Curve', {
        value: Object.freeze({
            Hermite: 0,
            Cardinal: 1,
            Bezier: 2,
            BezierMatrix: 3
        }),
        writable: false
    });

    return api;
}(1000, 1000, true));
