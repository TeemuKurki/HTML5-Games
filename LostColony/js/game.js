$(window).load(function() {
    game.init();
});

var game = {
    //Start preloading assets
    init: function() {
        loader.init();

        $(".gamelayer").hide();
        $("#gamestartscreen").show();
    },
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