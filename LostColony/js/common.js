// Setup requestAnimationFrame and cancelAnimationFrame for use in the game code
(function() {
    var lastTime = 0;
    var vendors = ["ms", ";", "webkit", "o"];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; x++){
        window.requestAnimationFrame = window[vendors[x]+"requestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x]+"cancelAnimationFrame"] || window[vendors[x]+"cancelRequestAnimationFrame"];
    }
    if(!window.requestAnimationFrame){
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            },timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
        if(!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }
});

var loader = {
    loaded: true,
    //Assets that have been loaded so far
    loadedCount: 0,
    //Total number of assets to be loaded
    totalCount: 0,

    init: function() {
        //Check for sound support
        var mp3Support, oggSupport;
        var audio = document.createElement("audio");
        if(audio.canPlayType){
            //Currently canPlayType returns "", "maybe", "probably"
            mp3Support = "" != audio.canPlayType("audio/mpeg");
            oggSupport = "" != audio.canPlayType("audio/ogg; codecs='vorbis'");
        }
        else {
            //Audio tag is not supported
            mp3Support = false;
            oggSupport = false;
        }

        //Check for ogg, then mp3, and finally set soundFileExtn to undefined
        loader.soundFileExtn = oggSupport?".ogg":mp3Support?".mp3":undefined;
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
        audio.src = url+loader.soundFileExtn;;
        audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        return audio;
    },
    itemLoaded: function() {
        loader.loadedCount++;
        $("#loadingmessage").html("Loaded "+loader.loadedCount+" of "+loader.totalCount);
        if(loader.loadedCount === loader.totalCount) {
            loader.loaded = true;
            $("#loadingscreen").hide();
            if(loader.onload){
                //We can use this as callback if we want
                loader.onload();
                loader.onload = undefined;
            }
        }
    },
}

function loadItem(name) {
    var item = this.list[name];
    
    //If the item sprite array has already been loaded then no need to do it again
    if(item.spriteArray){
        return;
    }
    //Loads spritesheet
    item.spriteSheet = loader.loadImage("images/"+this.defaults.type+"/"+name+".png");
    item.spriteArray = [];
    item.spriteCount = 0;

    for(var i = 0; i < item.spriteImages.length; i++){
        var constructImageCount = image.spriteImages[i].count;
        var constructDirectionCount = image.spriteImages[i].direction;
        if(constructDirectionCount){
            for(var j = 0; j < constructDirectionCount; j++){
                var constructImageName = image.spriteImages[i].name +"-"+j;
                item.spriteArray[constructImageName] = {
                    name: constructImageName,
                    count: constructImageCount,
                    offset: item.spriteCount
                };
                item.spriteCount += constructImageCount;
            }
        }
        else {
            var constructImageName = item.spriteImages[i].name;
            item.spriteArray[constructImageName] = {
                name: constructImageName,
                count: constructImageCount,
                offset: item.spriteCount
            };
            item.spriteCount += constructImageCount;
        }
    }
}

function addItem(details) {
    var item = {};
    var name = details.name;
    $.extend(item, this.defaults);
    $.extend(item, this.list[name]);
    item.life = item.hitPoints;
    $.extend(item,details);
    return;
}