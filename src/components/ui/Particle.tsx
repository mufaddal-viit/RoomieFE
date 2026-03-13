// "use client";

import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

export default function ParticleBackground() {
    const particlesInit = async (engine: Engine) => {
        await loadFull(engine);
    };

    return (
        <Particles
            init={particlesInit}
            options={{
                fullScreen: { enable: false },
                background: { color: "transparent" },
                particles: {
                    number: {
                        value: 90,
                        density: { enable: true, area: 800 },
                    },
                    color: { value: "#00008b" },
                    links: {
                        enable: true,
                        color: "#00008b",
                        distance: 150,
                        opacity: 0.2,
                        width: 1,
                    },
                    move: {
                        enable: true,
                        speed: 1,
                    },
                    opacity: {
                        value: 0.45,
                    },
                    size: {
                        value: { min: 1, max: 4 },
                    },
                },
                detectRetina: true,
            }}
            className="absolute inset-0 z-[1] pointer-events-none"
            canvasClassName="absolute inset-0 h-full w-full"
        />
    );
}