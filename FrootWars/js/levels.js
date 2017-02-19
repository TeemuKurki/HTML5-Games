
var levels = {

	// Level data
	data:[
	 {   // First level 
		foreground:'desert-foreground',
		background:'clouds-background',
		entities:[
            //Ground and slingshot
			{type:"ground", name:"dirt", x:500,y:440,width:1000,height:20,isStatic:true},
			{type:"ground", name:"wood", x:185,y:390,width:10,height:80,isStatic:true},	

            {type:"block", name:"wood", x:500,y:370,width:30,height:120, isStatic:true},
            {type:"block", name:"wood", x:535,y:295,width:100,height:30, isStatic:true},

            {type:"block", name:"wood", x:750,y:360,width:30,height:140, isStatic:true},
            {type:"block", name:"wood", x:750,y:240,width:30,height:100, isStatic:true},

            {type:"block", name:"wood", x:655,y:205,width:160,height:30, isStatic:true},
            {type:"block", name:"wood", x:535,y:205,width:80,height:30, isStatic:true},
            
            {type:"block", name:"glass", x:620,y:360,width:30,height:140, isStatic:true, angle:-35},

			{type:"hero", name:"orange",x:495,y:250},

            {type:"hero", name:"orange",x:80,y:405},
			{type:"hero", name:"apple",x:140,y:405},

            {type:"goal", name:"target", x:700, y:400, isStatic:true},
		]
	 },
		{   // Second level 
			foreground:'desert-foreground',
			background:'clouds-background',
			entities:[
				{type:"ground", name:"dirt", x:500,y:440,width:1000,height:20,isStatic:true},
				{type:"ground", name:"wood", x:185,y:390,width:30,height:80,isStatic:true},

				{type:"hero", name:"strawberry",x:30,y:415},
				{type:"hero", name:"orange",x:80,y:405},
				{type:"hero", name:"apple",x:140,y:405},

                {type:"goal", name:"target",x:900,y:400, isStatic:true},
			]
		},
        {   //Third level.. Test level
            foreground:'desert-foreground',
            background:'clouds-background',
            entities:[
                //Ground and slingshot
                {type:"ground", name:"dirt", x:500,y:440,width:1000,height:20,isStatic:true},
                {type:"ground", name:"wood", x:185,y:390,width:30,height:80,isStatic:true},
						
                {type:"villain", name:"fries", x:400,y:300,calories:520},				

                {type:"hero", name:"orange",x:80,y:405},
                {type:"hero", name:"apple",x:140,y:405},

                {type:"goal", name:"target", x:400, y:400, isStatic:true},
            ]
        }
        
	],

    // Initialize level selection screen
    init: function() {
        var html = $("#levelselectscreen").html();
        for (var i = 0; i < levels.data.length; i++) {
            var level = levels.data[i];
            html += '<input type="button" value="'+(i+1)+'">';
        }
        $('#levelselectscreen').html(html);
        // Set the button click event handlers to load level
        $('#levelselectscreen input').click(function() {
            levels.load(this.value - 1);
            $('#levelselectscreen').hide();
        });
    },

    // Load all data and images for a specific level
    load: function(number) {
        //Initialize Box2D world wherever a level is loaded
        box2d.init();

        //Declare a new currentLevel object
        game.currentLevel = {
            number: number,
            hero: []
        };
        game.score = 0;
        $("#score").html("score: " + game.score);
        var level = levels.data[number];

        //Load background, foreground and slingshot images

        game.currentLevel.backgroundImage = loader.loadImage("images/backgrounds/" + level.background + ".png");
        game.currentLevel.foregroundImage = loader.loadImage("images/backgrounds/" + level.foreground + ".png");
        game.slingshotImage = loader.loadImage("images/slingshot.png");
        game.slingshotFrontImage = loader.loadImage("images/slingshot-front.png");

        //Load all entities
        for(var i = level.entities.length - 1; i >= 0; i--){
            var entity = level.entities[i];
            entities.create(entity);
        };

        //Call same.start() once the assets have loaded
        if (loader.loaded) {
            //Actual game drawing happens game.start
            game.start();
        } else {
            loader.onload = game.start;
        }
    }
};