import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls, Sky } from "@react-three/drei";

interface MaterialProps {
	color: string;
}

interface GeometryData {
	type: string;
	params: number[];
}

interface SceneObject {
	id: string;
	type: string;
	geometry: number[];
	material: MaterialProps;
	position?: [number, number, number];
	rotation?: [number, number, number];
	scale?: [number, number, number];
}

interface ThreeSceneProps {
	generatedCode: string | null;
}

function parseGeneratedCode(code: string): SceneObject[] {
	const objects: SceneObject[] = [];

	try {
		// Extract geometry creations
		const geometryRegex = /new THREE\.(Box|Sphere|Cylinder|Cone|Torus|Plane)Geometry\(([\d.,\s]*)\)/g;
		const materialRegex = /new THREE\.MeshStandardMaterial\(\{([^}]+)\}\)/g;
		const positionRegex = /\.position\.set\(([-\d.,\s]+)\)/g;

		const geometries: GeometryData[] = [];
		const materials: MaterialProps[] = [];
		const positions: number[][] = [];

		let geometryMatch = geometryRegex.exec(code);
		while (geometryMatch !== null) {
			const [, type, params] = geometryMatch;
			geometries.push({
				type,
				params: params.split(",").map(p => parseFloat(p.trim()))
			});
			geometryMatch = geometryRegex.exec(code);
		}

		let materialMatch = materialRegex.exec(code);
		while (materialMatch !== null) {
			const [, props] = materialMatch;
			// Parse material properties (simplified)
			const colorMatch = props.match(/color:\s*(?:0x([0-9a-f]+)|new THREE\.Color\((.*?)\))/i);
			materials.push({
				color: colorMatch ? `#${colorMatch[1] || "ffffff"}` : "#ffffff",
			});
			materialMatch = materialRegex.exec(code);
		}

		let positionMatch = positionRegex.exec(code);
		while (positionMatch !== null) {
			const [, coords] = positionMatch;
			positions.push(coords.split(",").map(c => parseFloat(c.trim())));
			positionMatch = positionRegex.exec(code);
		}

		// Combine geometries with materials and positions
		for (let i = 0; i < geometries.length; i++) {
			objects.push({
				id: `object-${Date.now()}-${i}`,
				type: geometries[i].type,
				geometry: geometries[i].params,
				material: materials[i] || { color: "#ffffff" },
				position: (positions[i] as [number, number, number]) || [0, 0, 0],
			});
		}
	} catch (error) {
		console.error("Error parsing generated code:", error);
	}

	return objects;
}

function DynamicMesh({ obj }: { obj: SceneObject }) {
	const geometry = (() => {
		switch (obj.type) {
			case "Box":
				return <boxGeometry args={obj.geometry as [number, number, number]} />;
			case "Sphere":
				return <sphereGeometry args={obj.geometry as [number, number, number]} />;
			case "Cylinder":
				return <cylinderGeometry args={obj.geometry as [number, number, number]} />;
			case "Cone":
				return <coneGeometry args={obj.geometry as [number, number, number]} />;
			case "Torus":
				return <torusGeometry args={obj.geometry as [number, number, number]} />;
			case "Plane":
				return <planeGeometry args={obj.geometry as [number, number]} />;
			default:
				return <boxGeometry args={[1, 1, 1]} />;
		}
	})();

	return (
		<mesh position={obj.position} rotation={obj.rotation} scale={obj.scale}>
			{geometry}
			<meshStandardMaterial color={obj.material.color} />
		</mesh>
	);
}

function Scene({ objects }: { objects: SceneObject[] }) {
	return (
		<>
			{/* Lighting */}
			<ambientLight intensity={0.5} />
			<directionalLight position={[10, 10, 5]} intensity={1} castShadow />
			<pointLight position={[-10, -10, -5]} intensity={0.5} />

			{/* Ground plane (grass field) */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
				<planeGeometry args={[50, 50]} />
				<meshStandardMaterial color="#2d5016" />
			</mesh>

			{/* Grid helper for reference */}
			<Grid
				args={[50, 50]}
				cellSize={0.5}
				cellThickness={0.5}
				cellColor="#3d6020"
				sectionSize={2.5}
				sectionThickness={1}
				sectionColor="#4d7030"
				fadeDistance={50}
				fadeStrength={1}
				followCamera={false}
			/>

			{/* Sky */}
			<Sky
				distance={450000}
				sunPosition={[5, 1, 8]}
				inclination={0.6}
				azimuth={0.25}
			/>

			{/* Dynamic objects from generated code */}
			{objects.map((obj) => (
				<DynamicMesh key={obj.id} obj={obj} />
			))}

			{/* Orbit controls */}
			<OrbitControls
				enableDamping
				dampingFactor={0.05}
				maxPolarAngle={Math.PI / 2}
				minDistance={2}
				maxDistance={50}
			/>
		</>
	);
}

export function ThreeScene({ generatedCode }: ThreeSceneProps) {
	const [objects, setObjects] = useState<SceneObject[]>([]);

	useEffect(() => {
		if (generatedCode) {
			const parsed = parseGeneratedCode(generatedCode);
			setObjects(parsed);
		} else {
			setObjects([]);
		}
	}, [generatedCode]);

	return (
		<Canvas
			shadows
			camera={{ position: [5, 5, 5], fov: 60 }}
			style={{ width: "100%", height: "100%" }}
		>
			<Scene objects={objects} />
		</Canvas>
	);
}
