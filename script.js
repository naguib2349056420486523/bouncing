
const RADIUS = 10;
const DIAMETER = RADIUS * 2;
const TICK_RATE = 16; 
const PIX_IN_M = 50;


const inputs = {
    spawnCount: document.querySelector("#spawnCount"),
    gravity: document.querySelector("#gravityStrength"),
    airDensity: document.querySelector("#airDensity"),
    bounciness: document.querySelector("#bounciness"),
    wind: document.querySelector("#windForce"),
    resetBtn: document.querySelector("#resetBtn")
};

 
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;






let balls = [];
let gameInterval;

let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;

canvas.addEventListener("mousedown", (e) => {
    isMouseDown = true;
    updateMousePos(e);
});

window.addEventListener("mouseup", () => {
    isMouseDown = false;
});

canvas.addEventListener("mousemove", (e) => {
    updateMousePos(e);
});

function updateMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
}




function resetCanvas() {
    balls = []; 
    if (gameInterval !== undefined) clearInterval(gameInterval);
    startSimulation();
}

function startSimulation() {
    const numBalls = Number(inputs.spawnCount.value);
    for(let i = 0; i < numBalls; i++){
        balls.push(createBall());
    }
    gameInterval = setInterval(updatePhysics, TICK_RATE);
}

function createBall() {
    return { 
        position: {
            x: Math.random() * (canvas.width - DIAMETER) + RADIUS, 
            y: Math.random() * (canvas.height / 3) + RADIUS, 
        },
        velocity: {
            x: (Math.random() * 10) - 5,
            y: (Math.random() * 10) - 5,
        },
        color: {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256), 
        }
    };
}







function updatePhysics() {
    const G = Number(inputs.gravity.value);
    const RHO = Number(inputs.airDensity.value); 
    const BOUNCE = Number(inputs.bounciness.value);
    const WIND = Number(inputs.wind.value);

    const Cd = 0.47; 
    const rMeters = RADIUS / PIX_IN_M;
    const Area = Math.PI * (rMeters * rMeters);
    const MASS = 0.5; 
    const timeStep = TICK_RATE / 1000; 

    for(let ball of balls) {
        const Fg = MASS * G;
        let Fd_x = -0.5 * RHO * ball.velocity.x * Math.abs(ball.velocity.x) * Cd * Area;
        let Fd_y = -0.5 * RHO * ball.velocity.y * Math.abs(ball.velocity.y) * Cd * Area;
        const Fwind = WIND;

        let netForceX = Fd_x + Fwind;
        let netForceY = Fg + Fd_y;



        

        if (isMouseDown) {
            const dx = mouseX - ball.position.x;
            const dy = mouseY - ball.position.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            const safeDist = Math.max(distance, 10);
            const forceStrength = 2000; 
            
            const forceX = (dx / safeDist) * forceStrength;
            const forceY = (dy / safeDist) * forceStrength;

            netForceX += forceX;
            netForceY += forceY;
        }





const accX = netForceX / MASS;
        const accY = netForceY / MASS;

        ball.velocity.x += accX * timeStep;
        ball.velocity.y += accY * timeStep;

        ball.position.x += (ball.velocity.x * timeStep) * PIX_IN_M;
        ball.position.y += (ball.velocity.y * timeStep) * PIX_IN_M;

        if (ball.position.y >= canvas.height - RADIUS) {
            ball.position.y = canvas.height - RADIUS; 
            ball.velocity.y *= -1 * BOUNCE; 
            if(Math.abs(ball.velocity.y) < 0.5) ball.velocity.y = 0;
        }






    
 else if (ball.position.y <= RADIUS) {
            ball.position.y = RADIUS;
            ball.velocity.y *= -1 * BOUNCE;
        }

        if (ball.position.x >= canvas.width - RADIUS) {
            ball.position.x = canvas.width - RADIUS;
            ball.velocity.x *= -1 * BOUNCE;
        } else if (ball.position.x <= RADIUS) {
            ball.position.x = RADIUS;
            ball.velocity.x *= -1 * BOUNCE;
        }
    }
    drawObjects();
}



function drawObjects(){
    ctx.fillStyle = 'rgba(141, 153, 174, 0.3)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for(let ball of balls) {
        ctx.beginPath();
        ctx.arc(ball.position.x, ball.position.y, RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${ball.color.r}, ${ball.color.g}, ${ball.color.b})`;
        ctx.fill();
        ctx.strokeStyle = "#2b2d42"; 
        ctx.stroke(); 
    }

    if(isMouseDown) {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();
    }
}

inputs.resetBtn.addEventListener("click", resetCanvas);
resetCanvas();