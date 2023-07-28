
MySample.main = (function(graphics) {
    'use strict';

    let previousTime = performance.now();
    let toggle = false;
    let toggleCount = 0;
    let angle = Math.PI / 25;
    let currAngle = 0;
    let curveAngle = 0;
    let angelChange = .01;
    let startTimer = 0;
    let goStars = false;
    let scaler = {
        x: 1.02,
        y: 1.02
    }
    let changeScale = -.04
    let newStar;
    let curveTranslate = {
        x: .5,
        y: 0
    };
    let curveChange = -1;
    let scalerC = {
        x: .995,
        y: .995
    }

    let triTranslate = {
        x: 0,
        y: -.5
    }

    let triangle = {
        verts: [
            {x: -50, y: 0},
            {x: 50, y: 0},
            {x: 0, y: -75}
        ],
        center: {x: 500, y: 450}
    }

    let tri2  = {
        verts: [
            {x: -50, y: 100},
            {x: 50, y: 100},
            {x: 0, y: 175}
        ],
        center: {x: 500, y: 450}
    }
    
    let tri2Translate = {
        x: 0,
        y: .5
    }

    let square = {
        verts: [
            {x: -50, y: 50},
            {x: 50, y: 50},
            {x: 50, y: -50},
            {x: -50, y: -50},],
        center: {x: 500, y: 500}
    }

    let octagon = {
        verts: [
          { x: -10, y: -30 },
          { x: 10, y: -30 },
          { x: 30, y: -10 },
          { x: 30, y: 10 },
          { x: 10, y: 30 },
          { x: -10, y: 30 },
          { x: -30, y: 10 },
          { x: -30, y: -10 },
        ],
        center: { x: 500, y: 500 },
      };

    
    let star = {
        verts: [
            { x: 3, y: -50 },
            { x: 15, y: -20 },
            { x: 47, y: -15 },
            { x: 23, y: 8 },
            { x: 29, y: 40 },
            { x: 1, y: 25 },
            { x: -29, y: 40 },
            { x: -23, y: 8 },
            { x: -47, y: -15 },
            { x: -14, y: -20 },
        ],
        center: { x: 500, y: 500 },
        startTime: 0,
        move: false,
        translate: {
            x: 1,
            y: 0,
        },
        angle: 0,
    };
    let stars = [];
    let yChange = -2.5
    for(let i =0; i < 50; i++){
        let ss = JSON.parse(JSON.stringify(star));
        ss.translate.y = yChange;
        ss.start = i * 25;
        stars.push(ss);
        yChange += .1
    }
    for(let i =0; i < 50; i++){
        let ss = JSON.parse(JSON.stringify(star));
        ss.translate.y = yChange;
        ss.translate.x *= -1;
        ss.start = (i * 25) + 1250;
        stars.push(ss);
        yChange -= .1
    }
    let newSquare = square;
    let newOct = octagon;

    // function randomlyChooseElements(array) {
    //     let remainingElements = array.slice(); // Create a copy of the original array
    //     const chosenElements = [];
    //     let startAdd = 0;
      
    //     while (remainingElements.length > 0) {
    //       const randomIndex = Math.floor(Math.random() * remainingElements.length);
    //       const chosenElement = remainingElements[randomIndex];
    //       chosenElement.start = startAdd;
    //       startAdd += 25;
    //       chosenElements.push(chosenElement);
    //       remainingElements.splice(randomIndex, 1);
    //     }
      
    //     return chosenElements;
    //   }
      
    // stars = randomlyChooseElements(stars);
      console.log(stars);
    let curve = [500,150,250,325,500,850,750,675,5];
    let CardinalCurve = [500,150,250,325,500,850,750,675,5];
    CardinalCurve = graphics.rotateCurve(1,CardinalCurve,1.5)


      
      // Output the results
      

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        toggleCount+= elapsedTime;
        if(toggleCount >= 500){
            toggle = !toggle;
            toggleCount = 0;
            scaler.x += changeScale;
            scaler.y += changeScale;
            changeScale *= -1;
        }
        if(goStars){
            startTimer += 1;
            for(let i=0; i < stars.length; i++){
                let star = stars[i];
                if(star.start < startTimer){
                    star.move = true;
                }
                if(star.center.x >= 950 || 
                    star.center.y <= 50 ||
                    star.center.x <= 50 ||
                    star.center.y >= 950){
                    star.move = false;
                }
                star.angle += angle / 5;
            }
        }

        if(curve[0] >= 550 || curve[0] <= 450){
            curveTranslate.x += curveChange;
            curveChange *= -1;
        }
        currAngle += angle / 5;
        curveAngle += angelChange

    }

    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear();
        for(let i=0; i < stars.length; i++){
            if(stars[i].move){
                stars[i] = graphics.translatePrimitive(stars[i],stars[i].translate);
                stars[i] = graphics.scalePrimitive(stars[i], scaler)
                newStar = graphics.rotatePrimitive(stars[i], stars[i].angle);
                graphics.drawPrimitive(newStar,true,'pink');
            }
            else {
                graphics.drawPrimitive(stars[i],true,'pink');
            }
        }
        if(Math.abs(curve[5] - curve[1]) > 100){
            curve = graphics.scaleCurve(2,curve,scalerC);
            curve = graphics.translateCurve(2,curve,curveTranslate);
        }
        else if(((curve[0]+curve[4])/2) !== 500 && ((curve[1]+curve[5])/2) !== 500){
            curve = graphics.translateCurve(2,curve,curveTranslate);
        }
        else if(angelChange < .5){
            angelChange+= .01;
        }
        else{
            goStars = true;
            newSquare = graphics.rotatePrimitive(square,currAngle);
            newOct = graphics.rotatePrimitive(octagon,-currAngle);
            if( triangle.center.y > 75){
                triangle = graphics.translatePrimitive(triangle, triTranslate)
                tri2 = graphics.translatePrimitive(tri2,tri2Translate);

            }

        }
        if(Math.abs(CardinalCurve[4] - CardinalCurve[0]) > 80){
            CardinalCurve = graphics.scaleCurve(1,CardinalCurve,{x: .995, y: .995});
        }
        let newCurve = graphics.rotateCurve(2,curve, curveAngle);
        graphics.drawPrimitive(triangle,true,'red');
        graphics.drawPrimitive(tri2,true,'red');
        graphics.drawPrimitive(newSquare,true,'yellow');
        let newOctagon = graphics.scalePrimitive(newOct,{x:2.5, y:2.5});
        graphics.drawPrimitive(newOctagon,true,'cyan');
        graphics.drawCurve(2,newCurve,50,true,true,false,"lime");
        let newCCurve = graphics.rotateCurve(1,CardinalCurve,curveAngle)
        graphics.drawCurve(1,newCCurve,50,true,true,false,"blue");


    }


    //------------------------------------------------------------------
    //
    // This is the animation loop.
    //
    //------------------------------------------------------------------
    function animationLoop(time) {

        let elapsedTime = time - previousTime;
        previousTime = time;
        update(elapsedTime);
        render();

        requestAnimationFrame(animationLoop);
    }

    function initialize(){
        graphics.initialize();      
        
    }
    console.log('initializing...');
    initialize();
    requestAnimationFrame(animationLoop);

}(MySample.graphics));
