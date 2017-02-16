var mouse = {
    //x, y coordinates for of mouse relative to the top left corner of canvas
    x: 0,
    y: 0,

    //x, y coordinates for of mouse relative to the top left corner of game map
    gameX: 0,
    gameY: 0,

    //game grid x,y coordinates of mouse
    gridX: 0,
    gridY: 0,

    //whether or not left mouse button is currently pressed
    buttonPressed: false,

    //whetheror not the player is dragging and selecting with the left mouse button
    dragSelect: false,

    //whether of not the mouse is inside the canvas
    insideCanvas: false,

    click: function(ev, rightClick) {
        //Player clicked inside the canvas
    },

    //Checks if mouse is being dragged across canvas, if so, draw white rectangle from top-left corner to bottom-right
    //We subtract the map offset when calculating the coordinates of the rectangle so it is relative to the game map
    //and doesn't move even if map is panned 
    draw: function() {
        if(this.dragSelect){
            var x = Math.min(this.gameX, this.dragX);
            var y = Math.min(this.gameY, this.dragY);
            var width = Math.abs(this.gameX - this.dragX);
            var height = Math.abs(this.gameY - this.dragY);
            game.foregroundContext.strokeStyle = "white";
            game.foregroundContext.strokeRect(x - game.offsetX, y - game.offsetY, width, height);
        }
    },

    calculateGameCoordinates: function() {
        mouse.gameX = mouse.x + game.offsetX;
        mouse.gameY = mouse.y + game.offsetY;

        mouse.gridX = Math.floor((mouse.gameX) / game.gridSize);
        mouse.gridY = Math.floor((mouse.gameY) / game.gridSize);
    },

    init: function() {
        var $mouseCanvas = $("#gameforegroundcanvas");

        $mouseCanvas.mousemove(function(ev) {
            var offset = $mouseCanvas.offset();
            mouse.x = ev.pageX - offset.left;
            mouse.y = ev.pageY - offset.top;

            mouse.calculateGameCoordinates();

            if(mouse.buttonPressed){
                //Check if mouse have been moved at least 4 pixels. If so dragSelect = true
                //This prevents game from confusing every click whit the drag selection operation.
                if((Math.abs(mouse.dragX - mouse.gameX) > 4 || Math.abs(mouse.dragY - mouse.gameY) > 4)){
                    mouse.dragSelect = true;
                }
            }
            else {
                    mouse.dragSelect = false;
                }
        });

        //Whenever click operation is completed clear dragSelect
        $mouseCanvas.click(function(ev){
            mouse.click(ev, false);
            mouse.dragSelect = false;
            return false;
        });

        //If LMB is pressed set buttonPressed = true and save mouse position to dragX, dragY
        //We prevent default mousebutton behaivior like browsers context menus
        $mouseCanvas.mousedown(function(ev){
            if(ev.which == 1){
                mouse.buttonPressed = true;
                mouse.dragX = mouse.gameX;
                mouse.dragY = mouse.gameY;
                ev.preventDefault();
            }
            return false;
        });

        //We call mouse.click() and set rightClick parameter to true
        $mouseCanvas.bind("contextmenu", function(ev) {
            mouse.click(ev,true);
            return false;
        });

        //If LMB is released set buttonPressed and dragSelect to false
        $mouseCanvas.mouseup(function(ev) {
            var shiftPressed = ev.shiftkey;
            if(ev.which == 1){
                //Left key was released
                mouse.buttonPressed = false;
                mouse.dragSelect = false;
            }
            return false;
        });

        //If mouse leaves the canvas, set insideCanvas to false
        $mouseCanvas.mouseleave(function(ev) {
            mouse.insideCanvas = false;
        });

        //If mouse re-enters to canvas we set buttonPressed to false and insideCanvas to true
        $mouseCanvas.mouseenter(function(ev) {
            mouse.buttonPressed = false;
            mouse.insideCanvas = true;
        });
    }
}