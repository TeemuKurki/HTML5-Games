var singleplayer = {
    //Begin singleplayer campaing
    start: function() {
        $(".gamelayer").hide();

        //Begin first level
        singleplayer.currentlevel = 0;
        game.type = "singleplayer";
        game.team = "blue";

        //Finally start first level
        singleplayer.startCurrentLevel();
    },

    exit: function() {
        //Show the starting menu layer
        $(".gamelayer").hide();
        $("#gamestartscreen").show();
    },

    currentlevel: 0,
    
    startCurrentLevel: function() {
        //load all the items for the level
        var level = maps.singleplayer[singleplayer.currentlevel];

        //Don't allow player to enter mission until all assets for the level are loaded
        $("#entermission").attr("disabled", true);

        //Load all assets for the level
        game.currentMapImage = loader.loadImage(level.mapImage);
        game.currentlevel = level;

        game.offsetX = level.startX * game.gridSize;
        game.offsetY = level.startY * game.gridSize;

        //Enable the enter mission button once all assets are loaded
        if(loader.loaded){
            $("#entermission").removeAttr("disabled");
        }
        else {
            loader.onload = function() {
                $("#entermission").removeAttr("disabled");
            }
        }

        //Load the mission screen with the curren briefing
        $("#missionbriefing").html(level.briefing.replace(/\n/g,'<br><br>'));
        $("#missionscreen").show();
    },

    play: function() {
        game.animationLoop();
        game.animationInterval = setInterval(game.animationLoop,game.animationTimeout);
        game.start();
    }
}