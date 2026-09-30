import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { useRef } from "react";

const FloatingShape = ({
    position,
    size,
    speed,
}) => {
    const meshRef = useRef();

    useFrame((state, delta) => {
        if (!meshRef.current) {
            return;
        }

        meshRef.current.rotation.x +=
            delta * speed;

        meshRef.current.rotation.y +=
            delta * speed * 0.8;

        meshRef.current.position.y +=
            Math.sin(
                state.clock.elapsedTime *
                    speed
            ) *
            0.0008;
    });

    return (
        <Float
            speed={speed}
            rotationIntensity={0.5}
            floatIntensity={0.7}
        >
            <mesh
                ref={meshRef}
                position={position}
                scale={size}
            >
                <icosahedronGeometry
                    args={[1, 1]}
                />

                <meshStandardMaterial
                    color="#2563eb"
                    transparent
                    opacity={0.12}
                    roughness={0.3}
                    metalness={0.6}
                />
            </mesh>
        </Float>
    );
};

const ThreeBackground = () => {
    return (
        <div className="three-background">
            <Canvas
                camera={{
                    position: [0, 0, 8],
                    fov: 50,
                }}
                dpr={[1, 1.5]}
            >
                <ambientLight
                    intensity={1.5}
                />

                <directionalLight
                    position={[5, 5, 5]}
                    intensity={2}
                />

                <FloatingShape
                    position={[-4, 2, -2]}
                    size={1.5}
                    speed={0.25}
                />

                <FloatingShape
                    position={[4, 1, -3]}
                    size={1.2}
                    speed={0.35}
                />

                <FloatingShape
                    position={[2, -3, -2]}
                    size={1}
                    speed={0.3}
                />

                <FloatingShape
                    position={[-3, -3, -4]}
                    size={0.8}
                    speed={0.2}
                />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={false}
                />
            </Canvas>
        </div>
    );
};

export default ThreeBackground;