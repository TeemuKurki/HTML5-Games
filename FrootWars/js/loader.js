
var loader = {
    loaded: true,
    //Assests that have been loaded so far
    loadedCount: 0,
    //Assets that needs to be loaded
    totalCount: 0,

    init: function() {
        //Check sound support
        var mp3Support, oggSupport;
        var audio = document.createElement("audio");
        if (audio.canPlayType) {
            //canPlayType() returns "", "maybe", "probably"
            mp3Support = "" !== audio.canPlayType('audio/mpeg');
            oggSupport = "" !== audio.canPlayType('audio/ogg; codecs="vorbis"');
        } else {
            //audio tag not supported
            mp3Support = false;
            oggSupport = false;
        }

        //Check for ogg, then mp3, and finally set soundFileExtn to undefined
        loader.soundFileExtn = oggSupport ? ".ogg" : mp3Support ? ".mp3" : undefined;
    },

    loadImage: function(url) {
        this.totalCount++;
        this.loaded = false;
        $("#loadingscreen").show();
        var image = new Image();
        image.src = url;
        image.onload = loader.itemLoaded;
        return image;
    },

    soundFileExtn: ".ogg",

    loadSound: function(url) {
        this.totalCount++;
        this.loaded = false;
        $("#loadingscreen").show();
        var audio = new Audio();
        audio.src = url + loader.soundFileExtn;
        audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        return audio;
    },

    itemLoaded: function() {
        loader.loadedCount++;
        $("#loadingmessage").html("loaded " + loader.loadedCount + " of " + loader.totalCount);
        if (loader.loadedCount === loader.totalCount) {
            //Loader had loaded
            loader.loaded = true;
            //Hide loadeing screen
            $("#loadingscreen").hide();
            //Call loader.onload method if exits
            //This lets us use callback if wanted
            if (loader.onload) {
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
};
