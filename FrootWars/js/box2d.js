var box2d = {
    scale:30,
    init:function(){
        //gravity 9.8m/s^2. Earths gravity
        var gravity = new b2Vec2(0,9.8);
        var allowSleep = true;
        box2d.world = new b2World(gravity, allowSleep);

        // Set up debug draw
        var debugContext = document.getElementById('debugcanvas').getContext('2d');
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(debugContext);
        debugDraw.SetDrawScale(box2d.scale);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        box2d.world.SetDebugDraw(debugDraw);

        var listener = new Box2D.Dynamics.b2ContactListener;
        listener.PostSolve = function(contact, impulse){
            var body1 = contact.GetFixtureA().GetBody();
            var body2 = contact.GetFixtureB().GetBody();
            var entity1 = body1.GetUserData();
            var entity2 = body2.GetUserData();

            var impulseAlongNormal = Math.abs(impulse.normalImpulses[0]);
                //Listener is called a little too often. Filter out very small impulseScaleFactor
                //After trying different values, 2 seems to work Well
                if(impulseAlongNormal > 1.5){
                    if((entity1.type == "hero" && entity2.type == "goal") || (entity2.type == "hero" && entity1.type == "goal")){
                        game.mode = "level-success";
                        game.showEndingScreen();
                    }
                    //if objects have a health, reduce health by the impulse value
                    if(entity1.health){
                        entity1.health -= impulseAlongNormal;
                    }
                    if(entity2.health){
                        entity2.health -= impulseAlongNormal;
                    }
                    if(entity1.bounceSound){
                        entity1.bounceSound.play();
                    }
                    if(entity2.bounceSound){
                        entity2.bounceSound.play();
                    }
                }
        };
        box2d.world.SetContactListener(listener);
    },

    step:function(timeStep){
        //Velocity iterations = 8
        //Position iteration = 3

        if(timeStep > 2/60){
            timeStep = 2/60
        }
        //Recommended values for position iteration is 8 and for position iteration is 3
        box2d.world.Step(timeStep, 8, 3);
    },

    createRectangle:function(entity,definition){
			var bodyDef = new b2BodyDef;
			if(entity.isStatic){
				bodyDef.type = b2Body.b2_staticBody;
			} else {
				bodyDef.type = b2Body.b2_dynamicBody;
			}
			
			bodyDef.position.x = entity.x/box2d.scale;
			bodyDef.position.y = entity.y/box2d.scale;
			if (entity.angle) {
				bodyDef.angle = Math.PI*entity.angle/180;
			}
			
			var fixtureDef = new b2FixtureDef;
			fixtureDef.density = definition.density;
			fixtureDef.friction = definition.friction;
			fixtureDef.restitution = definition.restitution;

			fixtureDef.shape = new b2PolygonShape;
			fixtureDef.shape.SetAsBox(entity.width/2/box2d.scale,entity.height/2/box2d.scale);
			
			var body = box2d.world.CreateBody(bodyDef);	
			body.SetUserData(entity);
			
			var fixture = body.CreateFixture(fixtureDef);
			return body;
	},
	
	createCircle:function(entity,definition){
			var bodyDef = new b2BodyDef;
			if(entity.isStatic){
				bodyDef.type = b2Body.b2_staticBody;
			} else {
				bodyDef.type = b2Body.b2_dynamicBody;
			}
			
			bodyDef.position.x = entity.x/box2d.scale;
			bodyDef.position.y = entity.y/box2d.scale;
			bodyDef.angularDamping = definition.angularDamping;
			
			if (entity.angle) {
				bodyDef.angle = Math.PI*entity.angle/180;
			}			
			var fixtureDef = new b2FixtureDef;
			fixtureDef.density = definition.density;
			fixtureDef.friction = definition.friction;
			fixtureDef.restitution = definition.restitution;

			fixtureDef.shape = new b2CircleShape(entity.radius/box2d.scale);
			
			var body = box2d.world.CreateBody(bodyDef);	
			body.SetUserData(entity);

			var fixture = body.CreateFixture(fixtureDef);
			return body;
	},
};
