console.log("hola");

const { Engine, Render, World, Bodies, Body, Events } = Matter;

class App {
    constructor(params = {}) {
        this.initCanvas();
        this.initPhysics();
        this.initBodies();

        this.updateCanvasSize();
        this.animate();
    }

    initCanvas() {
        this.canvas = document.getElementById('fireworksCanvas');
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener("resize", this.updateCanvasSize.bind(this));
    }

    updateCanvasSize() {
        console.log('updateCanvasSize');

        this.canvas.width = this.canvas.getBoundingClientRect().width;
        this.canvas.height = this.canvas.getBoundingClientRect().height;

        if (this.render) {
            this.render.options.width = this.canvas.width;
            this.render.options.height = this.canvas.height;
        }
    }

    initPhysics() {
        console.log(Matter);

        this.engine = Engine.create();
        this.world = this.engine.world;
        this.world.gravity.y = 0.05; // Adding gravity to fireworks

        this.render = Render.create({
            element: document.body,
            engine: this.engine,
            canvas: this.canvas,
            options: {
                showPerformance: true,
                showDebug: true,
                width: this.canvas.width,
                height: this.canvas.height,
            }
        });

        Render.run(this.render);

        this.runner = Matter.Runner.create();
        Matter.Runner.run(this.runner, this.engine);
    }

    initBodies() {
        this.particles = [];

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.createFireworks(x, y);
        });
    }

    // Create fireworks with a single color for each explosion and fade out effect
    createFireworks(x, y) {
        const getRandomColor = () => {
            const colors = ['#ff4040', '#ffdd40', '#40ffdd', '#40a6ff', '#a640ff'];
            return colors[Math.floor(Math.random() * colors.length)];
        };

        const fireworkColor = getRandomColor(); // Assign a single color to this firework

        for (let i = 0; i < 200; i++) {
            const radius = Math.random() * 3 + 2;

            const particle = Bodies.circle(x, y, radius, {
                restitution: 0.9,
                friction: 0.01,
                render: { fillStyle: fireworkColor }
            });

            // Add opacity and a lifespan (time before the particle disappears)
            particle.opacity = 1.0;  // Start with full opacity
            particle.fadeSpeed = 0.005; // Speed at which opacity decreases

            const forceMagnitude = 0.03 + Math.random() * 0.05;
            Body.setVelocity(particle, {
                x: (Math.random() - 0.5) * forceMagnitude * 100,
                y: (Math.random() - 0.5) * forceMagnitude * 100
            });

            this.particles.push(particle);
            World.add(this.world, particle);
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        Engine.update(this.engine);

        this.particles.forEach((particle, index) => {
            this.ctx.beginPath();
            this.ctx.arc(particle.position.x, particle.position.y, particle.circleRadius, 0, Math.PI * 2);
            
            // Reduce opacity gradually
            particle.opacity -= particle.fadeSpeed;

            if (particle.opacity < .005) {
                particle.opacity = 0;
            }

            // Set the fill style with opacity
            this.ctx.fillStyle = `rgba(${parseInt(particle.render.fillStyle.slice(1, 3), 16)}, ${parseInt(particle.render.fillStyle.slice(3, 5), 16)}, ${parseInt(particle.render.fillStyle.slice(5, 7), 16)}, ${particle.opacity})`;
            this.ctx.fill();

            // Remove the particle if it's off-screen or fully transparent
            if (particle.position.y > this.canvas.height || particle.position.x < 0 || particle.position.x > this.canvas.width || particle.opacity <= 0) {
                World.remove(this.world, particle);
                this.particles.splice(index, 1);
            }
        });

        requestAnimationFrame(this.animate.bind(this));
    }
}

// Instantiate the App class
const app = new App();
