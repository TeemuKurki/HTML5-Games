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
var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

var world;
//30 pixels on canvas corresponds to 1 meter in Box2d world
//Box2d uses meters not pixels so we haveto scale it down, so we can use pixels 
var scale = 30;
function init(){
    //Set up the Box2D world that will do most of the physics calculation  

    //declare gravity as 9.8 m/s^2 downward (Earth gravity)
    var gravity = new b2Vec2(0,9.8);
    //Allow objects that are at rest to fall asleep and be excluded from calculations
    var allowSleep = true;
    world = new b2World(gravity,allowSleep);

    createFloor();
    createRectangularBody();
    createCircularBody();
    createSimplePolygonBody();
    createComplexBody();
    createRevoluteJoint();
    createSpecialBody();
    listenForContact();

    setupDebugDraw();
    animate();
};

var timeStep = 1/60;

//As per the Box2d manual, the suggested iteration count for Box2D is 8 for velocity and 3 for position
var velocityIteration = 8;
var positionIteration = 3;

function animate(){
    //Box2D uses a comuputational algorithm called an integrator
    //Integrator simulate physics equations at discrete points in time.
    //timeStep is the amount of time we want Box2D to simulate
    //Constraint solver solves all the constraints in the simulation, one at the time
    //We need to iterate all constraints number of times 
    //Two phases in Constraint solver, velocity and position Each phase has its own iteration count
    //Using fewer itrations increases performance, but accuracy suffers
    world.Step(timeStep, velocityIteration, positionIteration);
    //Clears any forces that are applied to the bodies
    world.ClearForces();

    world.DrawDebugData();

    if(specialBody){
        drawSpecialBody();
    }

    //Kill special body when dead
    if(specialBody && specialBody.GetUserData().life <= 0){
        world.DestroyBody(specialBody);
        specialBody = undefined;
        console.log("The special body was destroyed");
    }

    setTimeout(animate, timeStep);
};

function createFloor(){
    //A body defenition hold all the data needed to construct a rigid body
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = 640/2/scale;
    bodyDef.position.y = 450/scale;

    //A fixture is used to attach a shape to a body for collision detection
    //A fixture defenition is used to create a fixture
    var fixtureDef = new b2FixtureDef;
    //Used to calculate weight
    fixtureDef.density = 1.0;
    //Used to make sure body slides realistically
    fixtureDef.friction = 0.5;
    //Used to make body bouncy
    fixtureDef.restitution = 0.2;

    fixtureDef.shape = new b2PolygonShape;
    //Parameters are half-width and half-height for the box
    fixtureDef.shape.SetAsBox(320/scale, 10/scale);

    var body = world.CreateBody(bodyDef);
    var fixture = body.CreateFixture(fixtureDef);
};

function createRectangularBody(){
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = 40/scale;
    bodyDef.position.y = 100/scale;

    var fixtureDef = new b2FixtureDef;
    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.3;

    fixtureDef.shape = new b2PolygonShape;
    fixtureDef.shape.SetAsBox(30/scale, 50/scale);

    var body = world.CreateBody(bodyDef);
    var fixture = body.CreateFixture(fixtureDef);
};

function createCircularBody(){
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = 130/scale;
    bodyDef.position.y = 100/scale;
    
    var fixtureDef = new b2FixtureDef;
    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.7;

    //b2CircleShape takes one parameter, the radius of circle
    fixtureDef.shape = new b2CircleShape(30/scale);

    var body = world.CreateBody(bodyDef);
    var fixture = body.CreateFixture(fixtureDef);
};

function createSimplePolygonBody(){
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = 230/scale;
    bodyDef.position.y = 50/scale;

    var fixtureDef = new b2FixtureDef;
    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.2;

    fixtureDef.shape = new b2PolygonShape();
    //Create an array of b2Vec2 points in clockwise direction 
    var points = [
        //All the coordinates are relative to the body origin.
        //First point (0,0) starts at the origin of the body (230,50)
        //We do not need to close polygon. Box2D will take care of this
        //All points must be defined in a clockwise direction
        new b2Vec2(0,0),
        new b2Vec2(40/scale, 50/scale),
        new b2Vec2(50/scale, 100/scale),
        new b2Vec2(-50/scale, 100/scale),
        new b2Vec2(-40/scale, 50/scale),
    ];
    //Use SetAsArray to define the shape using the points array and number of points
    fixtureDef.shape.SetAsArray(points, points.length);

    var body = world.CreateBody(bodyDef);

    var fixture = body.CreateFixture(fixtureDef);
};

function createComplexBody(){
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = 350/scale;
    bodyDef.position.y = 50/scale;
    var body = world.CreateBody(bodyDef);

    //Create first fixture and attach a circular shape to the body
    var fixtureDef = new b2FixtureDef;
    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.7;
    fixtureDef.shape = new b2CircleShape(40/scale);
    body.CreateFixture(fixtureDef);

    //Create second fixture and attach a polygon shape to the body
    fixtureDef.shape = new b2PolygonShape;
    var points = [
        new b2Vec2(0,0),
        new b2Vec2(40/scale, 50/scale),
        new b2Vec2(50/scale, 100/scale),
        new b2Vec2(-50/scale, 100/scale),
        new b2Vec2(-40/scale, 50/scale),
    ];
    fixtureDef.shape.SetAsArray(points, points.length);
    body.CreateFixture(fixtureDef);

};

function createRevoluteJoint(){
    //Define the first body
    var bodyDef1 = new b2BodyDef;
    bodyDef1.type = b2Body.b2_dynamicBody;
    bodyDef1.position.x = 480/scale;
    bodyDef1.position.y = 50/scale;
    var body1 = world.CreateBody(bodyDef1);

    //Create first fixture and attach a rectangular shape to the body
    var fixtureDef1 = new b2FixtureDef;
    fixtureDef1.density = 1.0;
    fixtureDef1.friction = 0.5;
    fixtureDef1.restitution = 0.5;
    fixtureDef1.shape = new b2PolygonShape;
    fixtureDef1.shape.SetAsBox(50/scale, 10/scale);

    body1.CreateFixture(fixtureDef1);

    //Create the second body
    var bodyDef2 = new b2BodyDef;
    bodyDef2.type = b2Body.b2_dynamicBody;
    bodyDef2.position.x = 470/scale;
    bodyDef2.position.y = 50/scale;
    var body2 = world.CreateBody(bodyDef2);

    //Create second fixture and attach a polygon shape to the body
    var fixtureDef2 = new b2FixtureDef;
    fixtureDef2.density = 1.0;
    fixtureDef2.friction = 0.5;
    fixtureDef2.restitution = 0.5;
    fixtureDef2.shape = new b2PolygonShape;
    var points = [
        new b2Vec2(0,0),
        new b2Vec2(40/scale,50/scale),
        new b2Vec2(50/scale,100/scale),
        new b2Vec2(-50/scale,100/scale),
        new b2Vec2(-40/scale,50/scale),
    ];
    fixtureDef2.shape.SetAsArray(points, points.length);
    body2.CreateFixture(fixtureDef2);

    //Create a joint between two bodies
    var jointDef = new b2RevoluteJointDef;
    var jointCenter = new b2Vec2(470/scale, 50/scale);
    jointDef.Initialize(body1, body2, jointCenter);
    world.CreateJoint(jointDef);
};

var specialBody;
function createSpecialBody(){
    var bodyDef = new b2BodyDef;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = 450/scale;
    bodyDef.position.y = 0/scale;

    specialBody = world.CreateBody(bodyDef);
    //Set custom properties to body
    specialBody.SetUserData({name: "special", life: 250})

    var fixtureDef = new b2FixtureDef;
    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.5;

    fixtureDef.shape = new b2CircleShape(30/scale);

    var fixture = specialBody.CreateFixture(fixtureDef);
};

function drawSpecialBody(){
    //Get body position and angle
    var position = specialBody.GetPosition();
    var angle = specialBody.GetAngle();

    //Translate and rotate axis to body position and angle
    context.translate(position.x * scale, position.y * scale);
    context.rotate(angle);

    //Draw a filled circular face
    context.fillStyle = "rgb(200,150,250);";
    context.beginPath();
    context.arc(0, 0, 30, 0, 2*Math.PI, false);
    context.fill();

    //Draw two rectangular eyes
    context.fillStyle = "rgb(255,255,255);";
    context.fillRect(-15, -15, 10, 5);
    context.fillRect(5, -15, 10, 5);

    //Draw a upward or downward arc for a smile depending on life
    context.strokeStyle = "rgb(255,255,255);";
    context.beginPath();
    if(specialBody.GetUserData().life > 100){
        context.arc(0, 0, 10, Math.PI, 2*Math.PI, true);
    }
    else {
        context.arc(0, 0, 10, Math.PI, 2*Math.PI, false);
    }
    context.stroke();

    //Translate and rotate axis back to original position and angle
    context.rotate(-angle);
    context.translate(-position.x*scale, -position.y*scale);
};

function listenForContact(){
    var listener = new Box2D.Dynamics.b2ContactListener;
    listener.PostSolve = function (contact, impulse){
        var body1 = contact.GetFixtureA().GetBody();
        var body2 = contact.GetFixtureB().GetBody();
        
        //If either of the bodies is the special body, reduce its life
        if(body1 == specialBody || body2 == specialBody){
            var impulseAlongNormal = impulse.normalImpulses[0];
            specialBody.GetUserData().life -= impulseAlongNormal;
            console.log("The special body was in a collision with impulse ", impulseAlongNormal, "and its life has become ", specialBody.GetUserData().life);
        }
    };
    world.SetContactListener(listener);
};

var context;
function setupDebugDraw(){
    context = document.getElementById("canvas").getContext("2d");

    var debugDraw = new b2DebugDraw();
    //Use this canvas for drawing the debugging screen
    debugDraw.SetSprite(context);
    //Set the scale
    debugDraw.SetDrawScale(scale);
    //Fill boxes with with alpha tranparency of 0.3
    debugDraw.SetFillAlpha(0.3);
    //Draw lines with thickness of 1
    debugDraw.SetLineThickness(1.0);
    //Display all shapes and Joints
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

    //Start using debug draw in our world
    world.SetDebugDraw(debugDraw);
};