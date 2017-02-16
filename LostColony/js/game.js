$(window).load(function() {
    game.init();
});

var game = {
    //Start preloading assets
    init: function() {
        loader.init();
        mouse.init();

        $(".gamelayer").hide();
        $("#gamestartscreen").show();

        game.backgoundCanvas = document.getElementById("gamebackgroundcanvas");
        game.backgoundContext = game.backgoundCanvas.getContext("2d");

        game.foregroundCanvas = document.getElementById("gameforegroundcanvas");
        game.foregroundContext = game.backgoundCanvas.getContext("2d");

        game.canvasWidth = game.backgoundCanvas.width;
        game.canvasHeight = game.backgoundCanvas.height;
    },

    start: function() {
        $(".gamelayer").hide();
        $("#gameinterfacescreen").show();
        game.running = true;
        game.refreshBackground = true;

        game.drawingLoop();
    },

    //Map in broken into square tiles of this size (20px * 20px)
    gridSize: 20,

    //Store whether or not the background move and needs to be redrawn
    backgroundChanged: true,

    //A control loop that runs at a fixed period of time
    //100 milliseconds or 10 times a second
    animationTimeout: 100,
    //X & Y panning offsets for the map
    offsetX: 0,
    offsetY: 0,
    //Distance from the edge of canvas at which point panning starts 
    panningThreshold: 60,
    //Pixels to pan every drawing loop
    panningSpeed: 10,

    handlePanning: function() {
        if(!mouse.insideCanvas){
            return;
        }
        if(mouse.x <= game.panningThreshold){
            if(game.offsetX >= game.panningSpeed){
                game.refreshBackground = true;
                game.offsetX -= game.panningSpeed;
            }
        }else if(mouse.x >= game.canvasWidth - game.panningThreshold){
            //Checks if there is still enough map left to pan
            if(game.offsetX + game.canvasWidth + game.panningSpeed <= game.currentMapImage.width){
                game.refreshBackground = true;
                game.offsetX += game.panningSpeed;
            }
        }

        if(mouse.y <= game.panningThreshold){
            if(game.offsetY >= game.panningSpeed){
                game.refreshBackground = true;
                game.offsetY -= game.panningSpeed;
            }
        }else if(mouse.y >= game.canvasHeight - game.panningThreshold){
            //Checks if there is still enough map left to pan
            if(game.offsetY + game.canvasHeight + game.panningSpeed <= game.currentMapImage.height){
                game.refreshBackground = true;
                game.offsetY += game.panningSpeed;
            }
        }

        //If map panned we refresh mouse game coordinates since they changes everytime we pan
        if(game.refreshBackground){
            //Update mouse game coordinates based on game offsets
            mouse.calculateGameCoordinates();
        }
    },

    //The reason we break out the code into two different timer loops is because the 
    //animation code will contain logic such as pathfinding, processing commands,
    //and changing the animation states of sprites, which will not need to be
    //executed as often as the drawing code.
    animationLoop: function() {
        //Animate each of the elements within the game
    },

    drawingLoop: function() {
        //Handle panning
        game.handlePanning();

        //Since drawing the backgound map is a fairly large operation
        //we only redraw the background if it changes (due to panning)
        if(game.refreshBackground) {
            game.backgoundContext.drawImage(game.currentMapImage, game.offsetX, game.offsetY, game.canvasWidth, game.canvasHeight, 0,0, game.canvasWidth, game.canvasHeight);
            game.refreshBackground = false;
        }
        //Clear the foreground canvas
        //game.foregroundContext.clearRect(0,0,game.canvasWidth, game.canvasHeight);

        //Draw mouse
        mouse.draw()

        //Call the drawing loop for the next frame using requestanimateframe
        //This runs as often as browser allows, good for drawing, not good for synchronized movement across different browsers
        if(game.running){
            requestAnimationFrame(game.drawingLoop);
        }

    }
};

var maps = {
    "singleplayer": [
        {
            "name": "Introduction",
            "briefing": "In this level you will learn how to pan across the map-\n\nDon't worry! we will be implementing more features later",
            
            //Map details
            "mapImage": "images/maps/level-one-debug-grid.png",
            "startX": 4,
            "startY": 4,
        },
    ]
};