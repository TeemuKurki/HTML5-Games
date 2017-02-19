
var entities = {
    defenitions:{
        "glass":{fullHealth:100, density:2.4, friction:0.4, restitution:0.15},
        "wood":{fullHealth:500, density:2.4, friction:0.4, restitution:0.4},
        "dirt":{density:3.0, friction:1.5, restitution:0.2},
        "burger":{shape:"circle", fullHealth:40, radius:25, density:1, friction:0.5, restitution:0.4, angularDamping:0.5},
        "sodacan":{shape:"rectangle", fullHealth:80, width:40, height:60, density:1, friction:0.5, restitution:0.7},
        "fries":{shape:"rectangle", fullHealth:50, width:40, height:50, density:1, friction:0.5, restitution:0.6},
        "apple":{shape:"circle", radius:25, density:1.5, friction:0.5, restitution:0.4, angularDamping:0.6},
        "orange":{shape:"circle", radius:25, density:1.5, friction:0.5, restitution:0.4, angularDamping:0.6},
        "strawberry":{shape:"circle", radius:15, density:2.0, friction:0.5, restitution:0.4, angularDamping:0.6},
        "target":{shape:"circle", radius:25, density:3.0, friction:2.0, restitution: 0.4}
    },
    //Take entity and create a Box2D body and add it to the world
    create:function(entity){
        var definition = entities.defenitions[entity.name];
        if(!definition){
            console.log("Undefined entity name", entity.name);
            return;
        }
        switch(entity.type){
            case "block": // simple rectangles
                entity.health = definition.fullHealth;
                entity.fullHealth = definition.fullHealth;
                entity.shape = "rectangle";
                entity.sprite = loader.loadImage("images/entities/"+entity.name+".png");
                entity.breakSound = game.breakSound[entity.name];
                box2d.createRectangle(entity,definition);
                break;
            case "ground": // simple rectangles
                // No need for health. These are indestructible
                entity.shape = "rectangle";
                // No need for sprites. These won't be drawn at all
                box2d.createRectangle(entity,definition);
                break;
            case "goal":
            case "hero": // simple circles
            case "villain": // can be circles or rectangles
                entity.health = definition.fullHealth;
                entity.fullHealth = definition.fullHealth;
                entity.sprite = loader.loadImage("images/entities/"+entity.name+".png");
                entity.shape = definition.shape;
                entity.bounceSound = game.bounceSound;
                if(definition.shape == "circle"){
                    entity.radius = definition.radius;
                    box2d.createCircle(entity,definition);					
                } else if(definition.shape == "rectangle"){
                    entity.width = definition.width;
                    entity.height = definition.height;
                    box2d.createRectangle(entity,definition);
                }
                break;
            default:
            console.log("Undefined entity type",entity.type);
            break;
        }
    },
    //Take entity, it's position and angle and draw it to the game canvas
    draw:function(entity, position, angle){
        game.context.translate(position.x*box2d.scale-game.offsetLeft, position.y*box2d.scale);
        game.context.rotate(angle);
        //This streches image one pixel larger than the sprite defenition in each direction. This is so that small caps between Box2D objects get covered up
        switch(entity.type){
            case "block":
                game.context.drawImage(entity.sprite, 0 ,0, entity.sprite.width, entity.sprite.height, -entity.width/2-1, -entity.height/2-1, entity.width+2, entity.height+2);
                break;
            case "goal":
            case "villain":
            case "hero":
                if(entity.shape == "circle"){
                    game.context.drawImage(entity.sprite, 0, 0, entity.sprite.width, entity. sprite.height, -entity.radius-1, -entity.radius-1, entity.radius*2+2, entity.radius*2+2);
                }
                else if(entity.shape == "rectangle"){
                    game.context.drawImage(entity.sprite, 0 ,0, entity.sprite.width, entity.sprite.height, -entity.width/2-1, -entity.height/2-1, entity.width+2, entity.height+2);
                }
                break;
            case "ground":
                //Do nothing.. we will draw objects like the ground and slingshot separately
                break;
            default:
                console.log("Undefined entity type", entity.type)
                break;
        }

        //Rotate and translate context back to original position
        game.context.rotate(-angle);
        game.context.translate(-position.x*box2d.scale+game.offsetLeft, -position.y*box2d.scale);
    }
};
