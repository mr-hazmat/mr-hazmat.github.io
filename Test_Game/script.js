//--------------------------------------------
// Matter.js Aliases
//--------------------------------------------
const { Engine, Render, Runner, Bodies, Body, Composite, Events } = Matter;

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

// Player (golden-ratio rectangle)
const playerWidth = 40;
const playerHeight = Math.round(playerWidth * 1.618); // ≈65

const player = Bodies.rectangle(200, 0, playerWidth, playerHeight, {
    label: "player",
    friction: 0,
    frictionAir: 0.012,
    restitution: 0,
    render: { fillStyle: "#b3b3b3" }
});
Body.setInertia(player, Infinity); // lock rotation

// Ground
const ground = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight - 40,
    window.innerWidth,
    80,
    { isStatic: true, friction: 0.2, render: { fillStyle: "#ffffff" } }
);

// Platforms
const platform1 = Bodies.rectangle(300, 400, 300, 30, { isStatic: true, friction: 0.2, render: { fillStyle: "#ffffff" } });
const platform2 = Bodies.rectangle(700, 300, 300, 30, { isStatic: true, friction: 0.2, render: { fillStyle: "#ffffff" } });

Composite.add(engine.world, [player, ground, platform1, platform2]);

//--------------------------------------------
// Controls
//--------------------------------------------
let keys = { left: false, right: false, up: false };
let canJump = false;
let jumpCount = 0; // track jumps

document.addEventListener("keydown", e => {
    if (["ArrowLeft","KeyA"].includes(e.code)) keys.left = true;
    if (["ArrowRight","KeyD"].includes(e.code)) keys.right = true;
    if (["ArrowUp","KeyW"].includes(e.code)) keys.up = true;
});

document.addEventListener("keyup", e => {
    if (["ArrowLeft","KeyA"].includes(e.code)) keys.left = false;
    if (["ArrowRight","KeyD"].includes(e.code)) keys.right = false;
    if (["ArrowUp","KeyW"].includes(e.code)) keys.up = false;
});

//--------------------------------------------
// Gun setup
//--------------------------------------------
let gunDirection = "right"; // "left" or "right"
let canShoot = true;
const shootCooldown = 200; // ms

document.addEventListener("keydown", e => {
    if (e.code === "Space" && canShoot) { // Spacebar to shoot
        shootProjectile();
        canShoot = false;
        setTimeout(() => canShoot = true, shootCooldown);
    }
});

function shootProjectile() {
    const speed = 12;
    const offsetX = gunDirection === "right" ? playerWidth / 2 : -playerWidth / 2;
    const projectile = Bodies.circle(player.position.x + offsetX, player.position.y, 5, {
        frictionAir: 0,
        restitution: 0,
        label: "projectile",
        render: { fillStyle: "#ffffff" }
    });

    const velX = gunDirection === "right" ? speed : -speed;
    Body.setVelocity(projectile, { x: velX, y: 0 });

    Composite.add(engine.world, projectile);

    // Remove after 3 seconds
    setTimeout(() => {
        Composite.remove(engine.world, projectile);
    }, 3000);
}

//--------------------------------------------
// Camera
//--------------------------------------------
const camera = { x: 0, y: 0, lerp: 0.1 };

//--------------------------------------------
// Movement + Camera Update
//--------------------------------------------
Events.on(engine, "beforeUpdate", () => {
    // Lock rotation
    Body.setAngle(player, 0);
    player.angularVelocity = 0;

    const isGrounded = canJump;

    // Reset jump count when on ground
    if (isGrounded) jumpCount = 0;

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

    // Gun points left/right based on movement
    if (vel < -0.5) gunDirection = "left";
    if (vel > 0.5) gunDirection = "right";

    // Jump logic
    if (keys.up) {
        if (isGrounded) {
            Body.setVelocity(player, { x: player.velocity.x, y: -15 });
            canJump = false;
            jumpCount = 1;
        } else if (jumpCount === 1) {
            Body.setVelocity(player, { x: player.velocity.x, y: -10 }); // 2/3 jump
            jumpCount = 2;
        }
    }
});

//--------------------------------------------
// Jump detection
//--------------------------------------------
Events.on(engine, "collisionStart", event => {
    event.pairs.forEach(pair => {
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
// Camera follow & render transform
//--------------------------------------------
Events.on(engine, "afterUpdate", () => {
    const camTargetX = player.position.x - render.options.width / 2;
    const camTargetY = player.position.y - render.options.height / 2;

    camera.x += (camTargetX - camera.x) * camera.lerp;
    camera.y += (camTargetY - camera.y) * camera.lerp;

    render.bounds.min.x = camera.x;
    render.bounds.min.y = camera.y;
    render.bounds.max.x = camera.x + render.options.width;
    render.bounds.max.y = camera.y + render.options.height;

    render.context.setTransform(1, 0, 0, 1, -camera.x, -camera.y);
});

//--------------------------------------------
// Resize handler
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
