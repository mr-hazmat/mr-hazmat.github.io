//--------------------------------------------
// Aliases
//--------------------------------------------
const {
    Engine,
    Render,
    Runner,
    Bodies,
    Body,
    Composite,
    Events
} = Matter;

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
        background: "#e6e6e6",
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

// Golden-ratio rectangle player
const playerWidth = 40;
const playerHeight = Math.round(playerWidth * 1.618); // ≈ 65

const player = Bodies.rectangle(200, 0, playerWidth, playerHeight, {
    label: "player",
    friction: 0,
    frictionAir: 0.015,
    restitution: 0,
    render: { fillStyle: "#b3b3b3" }
});

// Lock rotation
Body.setInertia(player, Infinity);

// Ground
const ground = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight - 40,
    window.innerWidth,
    80,
    {
        isStatic: true,
        friction: 0,
        render: { fillStyle: "#ffffff" }
    }
);

// Platforms
const platform1 = Bodies.rectangle(300, 400, 300, 30, {
    isStatic: true,
    friction: 0,
    render: { fillStyle: "#ffffff" }
});
const platform2 = Bodies.rectangle(700, 300, 300, 30, {
    isStatic: true,
    friction: 0,
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
// Smooth Camera
//--------------------------------------------
const camera = { x: 0, y: 0, lerp: 0.1 };

//--------------------------------------------
// Movement + Camera Update
//--------------------------------------------
Events.on(engine, "beforeUpdate", () => {
    // 🔒 Lock rotation
    Body.setAngle(player, 0);
    player.angularVelocity = 0;

    const isGrounded = canJump;

    // Friction-based acceleration
    const accelGround = 2.4;
    const accelAir = 0.6;
    const maxGroundSpeed = 8;
    const maxAirSpeed = 5;

    let vel = player.velocity.x;

    if (keys.left) vel -= isGrounded ? accelGround : accelAir;
    if (keys.right) vel += isGrounded ? accelGround : accelAir;

    const speedLimit = isGrounded ? maxGroundSpeed : maxAirSpeed;
    vel = Math.max(-speedLimit, Math.min(speedLimit, vel));

    Body.setVelocity(player, { x: vel, y: player.velocity.y });

    // Jump
    if (keys.up && canJump) {
        Body.setVelocity(player, { x: player.velocity.x, y: -15 });
        canJump = false;
    }

    // Camera follow
    const camTargetX = player.position.x - render.options.width / 2;
    const camTargetY = player.position.y - render.options.height / 2;

    camera.x += (camTargetX - camera.x) * camera.lerp;
    camera.y += (camTargetY - camera.y) * camera.lerp;

    render.bounds.min.x = camera.x;
    render.bounds.min.y = camera.y;
    render.bounds.max.x = camera.x + render.options.width;
    render.bounds.max.y = camera.y + render.options.height;
});

//--------------------------------------------
// Jump Detection
//--------------------------------------------
Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((pair) => {
        const bodies = [pair.bodyA, pair.bodyB];

        if (bodies.includes(player)) {
            const other = pair.bodyA === player ? pair.bodyB : pair.bodyA;

            if (other.isStatic) {
                const contact = pair.collision.supports[0];
                if (contact.y > player.position.y + 10) canJump = true;
            }
        }
    });
});

//--------------------------------------------
// Resize Handler
//--------------------------------------------
window.addEventListener("resize", () => {
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    Render.setPixelRatio(render, window.devicePixelRatio);

    Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight - 40 });

    Body.setVertices(ground, [
        { x: 0, y: window.innerHeight - 80 },
        { x: window.innerWidth, y: window.innerHeight - 80 },
        { x: window.innerWidth, y: window.innerHeight },
        { x: 0, y: window.innerHeight }
    ]);
});
