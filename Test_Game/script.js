// Module aliases
const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;

// Create engine
const engine = Engine.create();
const world = engine.world;

// Create renderer
const render = Render.create({
    element: document.body,
    canvas: document.getElementById("world"),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "#111"
    }
});

// Create some objects
const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
const boxA = Bodies.rectangle(400, 200, 80, 80);
const boxB = Bodies.rectangle(450, 50, 80, 80);

// Add objects to world
Composite.add(world, [ground, boxA, boxB]);

// Run it
Render.run(render);
Runner.run(Runner.create(), engine);
