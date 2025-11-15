function createCapsule(x, y, width, height, options = {}) {
    const radius = width / 2;
    const bodyHeight = height - width;

    const topCircle = Bodies.circle(x, y - bodyHeight / 2, radius, options);
    const bottomCircle = Bodies.circle(x, y + bodyHeight / 2, radius, options);
    const middle = Bodies.rectangle(x, y, width, bodyHeight, options);

    return Matter.Body.create({
        parts: [topCircle, bottomCircle, middle],
        friction: 0.1,
        frictionAir: 0.03,
        restitution: 0
    });
}
//--------------------------------------------
// Aliases
//--------------------------------------------
const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Composite = Matter.Composite,
      Events = Matter.Events;

//--------------------------------------------
// Engine + Renderer
//--------------------------------------------
const engine = Engine.create();
engine.gravity.y = 1.2;

const render = Render.create({
    element: document.body,
    canvas: document.getElementById("world"),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: "#e6e6e6", // soft grey
        wireframes: false,
        pixelRatio: window.devicePixelRatio
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

//--------------------------------------------
// World Setup
//--------------------------------------------

// Player (light grey)
// Capsule player (40px wide, 80px tall), darker grey
const player = createCapsule(200, 0, 40, 80, {
    label: "player",
    render: {
        fillStyle: "#b3b3b3"  // darker grey
    }
});


// Ground (white)
const ground = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight - 40,
    window.innerWidth,
    80,
    {
        isStatic: true,
        label: "ground",
        render: { fillStyle: "#ffffff" }
    }
);

// Platforms (white)
const platform1 = Bodies.rectangle(300, 400, 300, 30, {
    isStatic: true,
    render: { fillStyle: "#ffffff" }
});

const platform2 = Bodies.rectangle(700, 300, 300, 30, {
    isStatic: true,
    render: { fillStyle: "#ffffff" }
});

Composite.add(engine.world, [player, ground, platform1, platform2]);

//--------------------------------------------
// Controls
//--------------------------------------------
let keys = { left: false, right: false, up: false };
let canJump = false;

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
    if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") keys.up = true;
});

document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
    if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") keys.up = false;
});

//--------------------------------------------
// Movement Loop
//--------------------------------------------
Events.on(engine, "beforeUpdate", () => {
    const groundSpeed = 6;
    const airSpeed = 2.5;       // reduced in-air control
    const drift = 0.98;         // slow drifting decay

    // Determine if grounded
    const isGrounded = canJump;

    // Horizontal movement
    if (keys.left) {
        if (isGrounded) {
            Body.setVelocity(player, {
                x: -groundSpeed,
                y: player.velocity.y
            });
        } else {
            Body.setVelocity(player, {
                x: player.velocity.x - airSpeed,
                y: player.velocity.y
            });
        }
    }

    if (keys.right) {
        if (isGrounded) {
            Body.setVelocity(player, {
                x: groundSpeed,
                y: player.velocity.y
            });
        } else {
            Body.setVelocity(player, {
                x: player.velocity.x + airSpeed,
                y: player.velocity.y
            });
        }
    }

    // Apply drifting inertia when airborne
    if (!isGrounded && !keys.left && !keys.right) {
        Body.setVelocity(player, {
            x: player.velocity.x * drift,
            y: player.velocity.y
        });
    }

    // Jump
    if (keys.up && canJump) {
        Body.setVelocity(player, { x: player.velocity.x, y: -15 });
        canJump = false;
    }
});

//--------------------------------------------
// Resize Handler
//--------------------------------------------
window.addEventListener("resize", () => {
    Render.setPixelRatio(render, window.devicePixelRatio);

    Body.setPosition(ground, {
        x: window.innerWidth / 2,
        y: window.innerHeight - 40
    });

    Body.setVertices(ground, [
        { x: 0, y: window.innerHeight - 80 },
        { x: window.innerWidth, y: window.innerHeight - 80 },
        { x: window.innerWidth, y: window.innerHeight },
        { x: 0, y: window.innerHeight }
    ]);
});
