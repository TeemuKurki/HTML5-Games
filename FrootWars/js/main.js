//Make common used objects into variables for convenience
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

// Setup requestAnimationFrame and cancelAnimationFrame for use in the game code
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

$(window).load(function() {
    game.init();
});

var game = {
    // Start initializing objects, preloading assets and display start screen
    init: function() {
        // Initialize objects
        levels.init();
        loader.init();
        mouse.init();

        //Load all sound effects and background music
        //"Kindergarten" by Gurdonark
        //http://ccmixter.org/files/gurdonark/26491 is licensed under a Creative Commons license
        game.backgroundMusic = loader.loadSound("audio/gurdonark-kindergarten");
        game.slingshotReleasedSound = loader.loadSound("audio/released");
        game.bounceSound = loader.loadSound("audio/bounce");
        game.breakSound = {
            "glass":loader.loadSound("audio/glassbreak"),
            "wood":loader.loadSound("audio/woodbreak")
        };
        game.levelDoneMusic = loader.loadSound("audio/levelDone");

        // Hide all game layers and display the start screen
        $('.gamelayer').hide();
        $('#gamestartscreen').show();
        //Get handler for game canvas and context
        game.canvas = document.getElementById('gamecanvas');
        game.context = game.canvas.getContext('2d');

    },

    showLevelScreen: function() {
        game.resetLevel();
        $('.gamelayer').hide();
        $('#levelselectscreen').show('slow');
    },

    //Game mode
    mode: "intro",
    //X and Y cordinates for slingshot
    slingshotX: 140,
    slingshotY: 280,

    start: function() {
        $(".gamelayer").hide();
        //Display game canvas and score
        $("#gamecanvas").show();
        $("#scorescreen").show();

        //Currently music is stopped when game launches because it gets annoying :D 
        //game.stopBackgroundMusic();
        game.stopBackgroundMusic();

        game.mode = "intro";
        game.offsetLeft = 0;
        game.ended = false;
        game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
    },

    //Max panning speed per frame in pixels
    maxSpeed: 3.5,
    //Min and Max panning offset
    minOffset: 0,
    maxOffset: 300,
    //Current panning offset
    offsetLeft: 0,

    //Slowly pans the screen to center of newCenter
    panTo: function(newCenter) {
        if (Math.abs(newCenter - game.offsetLeft - game.canvas.width / 4) > 0 && game.offsetLeft <= game.maxOffset && game.offsetLeft >= game.minOffset) {
            var deltaX = Math.round((newCenter - game.offsetLeft - game.canvas.width / 4) / 2);
            if (deltaX && Math.abs(deltaX) > game.maxSpeed) {
                deltaX = game.maxSpeed * Math.abs(deltaX) / (deltaX);
            }
            game.offsetLeft += deltaX;
        } else {
            return true;
        }
        if (game.offsetLeft < game.minOffset) {
            game.offsetLeft = game.minOffset;
            return true;
        } else if (game.offsetLeft > game.maxOffset) {
            game.offsetLeft = game.maxOffset;
            return true;
        }
        return false;
    },

    countHeroesAndVillains:function(){
        game.heroes = [];
        for(var body = box2d.world.GetBodyList(); body; body = body.GetNext()){
            var entity = body.GetUserData();
            if(entity){
                if(entity.type == "hero"){
                    game.heroes.push(body);
                }
            }
        }
    },

    mouseOnCurrentHero:function(){
        if(!game.currentHero){
            return false;
        }
        //Calculates distance between current hero and mouse and compares it to the radius of current hero
        //If distance is less than radius -> mouse is over current hero. This only works on circular heroes
        var position = game.currentHero.GetPosition();
        //Math pow means exponental calculations (Math.pow(4,3) == 4*4*4 == 64)
        var distanceSquared = Math.pow(position.x*box2d.scale - mouse.x - game.offsetLeft, 2) + Math.pow(position.y*box2d.scale - mouse.y, 2);
        var radiusSquared = Math.pow(game.currentHero.GetUserData().radius, 2);
        return (distanceSquared <= radiusSquared);
    },

    showEndingScreen:function(){
        game.stopBackgroundMusic();
        game.levelDoneMusic.play();
        if(game.mode == "level-success"){
            if(game.currentLevel.number < levels.data.length-1){
                $("#endingmessage").html("Level Complete. Well Done!!!");
                $("#playnextlevel").show();
            }
            else{
                $("#endingmessage").html("All Levels Completed. Well Done!!!");
                $("#playnextlevel").hide();
            }
        }
        else if(game.mode == "level-failure"){
            $("#endingmessage").html("Level Failed. Play Again?");
            $("#playnextlevel").hide();
        }

        $("#endingscreen").show();
    },

    //Resets all current prosesses
    resetLevel:function(){
        window.cancelAnimationFrame(game.animationFrame);
        game.lastUpdateTime = undefined;
        game.currentHero = undefined;
        loader.loadedCount = 0;
        loader.totalCount = 0;
        game.backgroundMusic.pause();
    },

    restartLevel:function(){
        game.resetLevel();
        levels.load(game.currentLevel.number);
    },

    startNextLevel:function(){
        game.resetLevel();
        levels.load(game.currentLevel.number + 1);
    },

    strokeCounter: 0,

    handlePanning: function() {
        if (game.mode == "intro") {
            game.strokeCounter = 0;
            $("#scorescreen  #Stroke").html("Stroke: "+game.strokeCounter);
            if (game.panTo(700)) {
                game.mode = "load-next-hero";
            }
        }
        if (game.mode == "wait-for-firing") {
            if (mouse.dragging) {
                if(game.mouseOnCurrentHero()){
                    game.mode = "firing";
                }
                else {
                    game.panTo(mouse.x + game.offsetLeft);
                }
            } else {
                game.panTo(game.slingshotX);
            }
        }
        if (game.mode == "load-next-hero") {
            game.countHeroesAndVillains();

            //Check if there are any more heroes left to load, if not, end the level (Failure)
            if(game.heroes.length == 0){
                game.mode = "level-failure";
                return;
            }
            //Load hero and set mode to "wait-for-firing"
            if(!game.currentHero){
                game.currentHero = game.heroes[game.heroes.length-1];
                game.currentHero.SetPosition({x:180/box2d.scale, y:200/box2d.scale});
                game.currentHero.SetLinearVelocity({x:0, y:0});
                game.currentHero.SetAngularVelocity(0);
                game.currentHero.SetAwake(true);
            }
            else{
                //Wait for hero to spot bouncing and fall asleep and the switch to wait-for-firing
                game.panTo(game.slingshotX);
                if(!game.currentHero.IsAwake()){
                    game.mode = "wait-for-firing";
                }
            }
        }
        if (game.mode == "firing") {
            if(mouse.down){
                game.panTo(game.slingshotX);

                game.currentHero.SetPosition({x:(mouse.x + game.offsetLeft)/box2d.scale, y:mouse.y/box2d.scale});
            }
            else{
                game.mode = "fired";
                game.slingshotReleasedSound.play();
                game.strokeCounter++;
                $("#scorescreen  #Stroke").html("Stroke: "+game.strokeCounter);
                var impulseScaleFactor = 0.75;
                var impulse = new b2Vec2((game.slingshotX + 35 - mouse.x - game.offsetLeft)*impulseScaleFactor, (game.slingshotY + 25 - mouse.y)*impulseScaleFactor);
                game.currentHero.ApplyImpulse(impulse, game.currentHero.GetWorldCenter());
            }

        }
        if (game.mode == "fired") {
            //Pan to wherever the hero currently is
            var heroX = game.currentHero.GetPosition().x*box2d.scale;
            game.panTo(heroX);

            //and wait till it stops moving or is out of bounds
            if(!game.currentHero.IsAwake() || heroX <0 || heroX > game.currentLevel.foregroundImage.width){
                //Delete old hero
                box2d.world.DestroyBody(game.currentHero);
                game.currentHero = undefined;
                //Load next hero
                game.mode = "load-next-hero";
            }
            
        }
        if(game.mode == "level-success" || game.mode == "level-failure"){
            if(game.panTo(0)){
                game.ended = true;
                game.showEndingScreen();
            }
        }
    },

    animate: function() {
        //Animate the background
        game.handlePanning();

        //Animate charecters
        var currentTime = new Date().getTime();
        var timeStep;
        if(game.lastUpdateTime){
            //timeStep is the difference between lastUpdateTime and currentTime
            timeStep = (currentTime - game.lastUpdateTime/1000);
            box2d.step(timeStep);
        }
        //We save currentTime to lastUpdateTime
        game.lastUpdateTime = currentTime;

        //Draw the background with parallax scrolling
        game.context.drawImage(game.currentLevel.backgroundImage, game.offsetLeft / 4, 0, 640, 480, 0, 0, 640, 480);
        game.context.drawImage(game.currentLevel.foregroundImage, game.offsetLeft, 0, 640, 480, 0, 0, 640, 480);

        //Draw a slingshot
        game.context.drawImage(game.slingshotImage, game.slingshotX - game.offsetLeft, game.slingshotY);

        //Draw all bodies
        game.drawAllBodies();

        //Draw a band when we are firing a hero
        if(game.mode == "firing"){
            game.drawSlingshotBand();
        }

        //Draw the front of the slingshot
        game.context.drawImage(game.slingshotFrontImage, game.slingshotX - game.offsetLeft, game.slingshotY);

        if (!game.ended) {
            game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
        }
    },

    drawAllBodies:function(){
        box2d.world.DrawDebugData();

        //Itarate through all the bodies and draw them on them game canvas
        for(var body = box2d.world.GetBodyList(); body; body = body.GetNext()){
            var entity = body.GetUserData();
            if(entity){
                var entityX = body.GetPosition().x * box2d.scale;
                if(entityX < 0 || entityX > game.currentLevel.foregroundImage.width || (entity.health && entity.health < 0)){
                    box2d.world.DestroyBody(body);
                    if(entity.breakSound){
                        entity.breakSound.play();
                    }
                }else{   
                    entities.draw(entity,body.GetPosition(), body.GetAngle());
                }
            }
        }
    },

    drawSlingshotBand:function(){
        game.context.strokeStyle = "rgb(68,31,11)"; //Dark brown color
        game.context.lineWidth = 6;

        // Use angle hero has been dragged and radius to calculate coordinates of edge of hero wrt. hero center
        var radius = game.currentHero.GetUserData().radius;
        var heroX = game.currentHero.GetPosition().x * box2d.scale;
        var heroY = game.currentHero.GetPosition().y * box2d.scale;
        var angle = Math.atan(game.slingshotY + 25 - heroY, game.slingshotX + 50 - heroX);

        var heroFarEdgeX = heroX - radius * Math.cos(angle);
        var heroFarEdgeY = heroY - radius * Math.sin(angle);

        game.context.beginPath();
        //Start line from top of slingshot (the back side)
        game.context.moveTo(game.slingshotX + 50 - game.offsetLeft, game.slingshotY + 25);

        //Draw line to center of hero
        game.context.lineTo(heroX - game.offsetLeft, heroY);
        game.context.stroke();

        //Draw the hero on the back band

        entities.draw(game.currentHero.GetUserData(), game.currentHero.GetPosition(), game.currentHero.GetAngle());

        game.context.beginPath();
        // Move to edge of hero farthest from slingshot top
        game.context.moveTo(heroFarEdgeX, heroFarEdgeY);

        //Draw line back to top of slingshot (the front end)
        game.context.lineTo(game.slingshotX - game.offsetLeft + 10, game.slingshotY + 30);
        game.context.stroke();
    },

    startBackgroundMusic:function(){
        var toggleImage = $("#togglemusic")[0];
        game.backgroundMusic.play();
        toggleImage.src="images/icons/sound.png";
    },

    stopBackgroundMusic:function(){
        var toggleImage = $("#togglemusic")[0];
        toggleImage.src="images/icons/nosound.png";
        game.backgroundMusic.pause();
        //Go to the start of the song
        game.backgroundMusic.currentTime = 0
    },

    //toggleMusic button on UI calls this function
    toggleBackgroundMusic:function(){
        var toggleImage = $("#togglemusic")[0];
        if(game.backgroundMusic.paused){
            game.backgroundMusic.play()
            toggleImage.src="images/icons/sound.png";
        }
        else{
            game.backgroundMusic.pause();
            toggleImage.src="images/icons/nosound.png";
        }
    }
};

var mouse = {
    //Set default coordinates
    x: 0,
    y: 0,
    down: false,

    init: function() {
        $("#gamecanvas").mousemove(mouse.mousemovehandler);
        $("#gamecanvas").mousedown(mouse.mousedownhandler);
        $("#gamecanvas").mouseup(mouse.mouseuphandler);
        $("#gamecanvas").mouseout(mouse.mouseuphandler);
    },

    //Used when mouse is in canvas
    //Calculates X and Y coorditates using JQuerys offset() method and pageX and pageY
    mousemovehandler: function(ev) {
        var offset = $("#gamecanvas").offset();

        mouse.x = ev.pageX - offset.left;
        mouse.y = ev.pageY - offset.top;

        if (mouse.down) {
            mouse.dragging = true;
        }
    },

    //Sets mouse.down to true and saves mouses coordinates
    mousedownhandler: function(ev) {
        mouse.down = true;
        mouse.downX = mouse.x;
        mouse.mousedownY = mouse.y;
        ev.originalEvent.preventDefault();
    },

    //Sets mouse.down and mouse.dragging to false.
    //If mouse leaves canvas, we call this function
    mouseuphandler: function(ev) {
        mouse.down = false;
        mouse.dragging = false;
    }
};

var debug = {
    hide:function(){
        if($("#debugcanvas:visible").is(":visible")){
            $("#debugcanvas").hide();
        }
        else{
            $("#debugcanvas").show();
        }
    }
}