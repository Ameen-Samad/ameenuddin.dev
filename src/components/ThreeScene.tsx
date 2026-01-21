import { useEffect, useRef } from "react";

interface ThreeSceneProps {
	generatedCode: string | null;
}

function parseGeneratedCode(code: string): SceneObject[] {
	const objects: SceneObject[] = [];

	try {
		// More comprehensive parsing for various Three.js geometry types
		const geometryRegex = /new THREE\.(Box|Sphere|Cylinder|Cone|Torus|TorusKnot|Dodecahedron|Icosahedron|Octahedron|Tetrahedron|Plane|Circle|Ring)Geometry\(([\d.,\s]*)\)/gi;
		const materialRegex = /new THREE\.(MeshStandard|MeshPhong|MeshBasic|MeshLambert)Material\(\{([^}]+)\}\)/gi;
		const meshRegex = /const\s+(\w+)\s*=\s*new THREE\.Mesh\(/g;
		const positionRegex = /(\w+)\.position\.set\(([-\d.,\s]+)\)/g;
		const rotationRegex = /(\w+)\.rotation\.[xyz]\s*[+\-*/]?=\s*([-\d.]+)/g;
		const scaleRegex = /(\w+)\.scale\.set\(([-\d.,\s]+)\)/g;

		const geometries: Map<string, GeometryData> = new Map();
		const materials: Map<string, MaterialProps> = new Map();
		const meshNames: string[] = [];
		const positions: Map<string, number[]> = new Map();
		const scales: Map<string, number[]> = new Map();
		const hasAnimation = /rotation\.[xyz]\s*[+\-*/]?=/.test(code);

		// Extract geometries
		let geometryMatch: RegExpExecArray | null;
		let geomIndex = 0;
		while ((geometryMatch = geometryRegex.exec(code)) !== null) {
			const [, type, params] = geometryMatch;
			const geomKey = `geom_${geomIndex++}`;
			geometries.set(geomKey, {
				type,
				params: params.split(",").map(p => parseFloat(p.trim())).filter(n => !isNaN(n))
			});
		}

		// Extract materials
		let materialMatch: RegExpExecArray | null;
		let matIndex = 0;
		while ((materialMatch = materialRegex.exec(code)) !== null) {
			const [, materialType, props] = materialMatch;
			const matKey = `mat_${matIndex++}`;

			// Parse material properties
			const colorMatch = props.match(/color:\s*(?:0x([0-9a-f]+)|'([^']+)'|"([^"]+)")/i);
			const metalnessMatch = props.match(/metalness:\s*([\d.]+)/i);
			const roughnessMatch = props.match(/roughness:\s*([\d.]+)/i);
			const transparentMatch = props.match(/transparent:\s*(true|false)/i);
			const opacityMatch = props.match(/opacity:\s*([\d.]+)/i);

			materials.set(matKey, {
				color: colorMatch ? `#${colorMatch[1] || colorMatch[2] || colorMatch[3] || "ffffff"}` : "#ffffff",
				metalness: metalnessMatch ? parseFloat(metalnessMatch[1]) : undefined,
				roughness: roughnessMatch ? parseFloat(roughnessMatch[1]) : undefined,
				transparent: transparentMatch ? transparentMatch[1] === "true" : undefined,
				opacity: opacityMatch ? parseFloat(opacityMatch[1]) : undefined,
			});
		}

		// Extract mesh names
		let meshMatch: RegExpExecArray | null;
		while ((meshMatch = meshRegex.exec(code)) !== null) {
			meshNames.push(meshMatch[1]);
		}

		// Extract positions
		let positionMatch: RegExpExecArray | null;
		while ((positionMatch = positionRegex.exec(code)) !== null) {
			const [, meshName, coords] = positionMatch;
			positions.set(meshName, coords.split(",").map(c => parseFloat(c.trim())));
		}

		// Extract scales
		let scaleMatch: RegExpExecArray | null;
		while ((scaleMatch = scaleRegex.exec(code)) !== null) {
			const [, meshName, coords] = scaleMatch;
			scales.set(meshName, coords.split(",").map(c => parseFloat(c.trim())));
		}

		// Combine everything into scene objects
		const geomArray = Array.from(geometries.values());
		const matArray = Array.from(materials.values());

		for (let i = 0; i < Math.max(geomArray.length, 1); i++) {
			const geom = geomArray[i] || { type: "Sphere", params: [1, 32, 32] };
			const mat = matArray[i] || { color: "#ff0000" };
			const meshName = meshNames[i];

			objects.push({
				id: `object-${Date.now()}-${i}`,
				type: geom.type,
				geometry: geom.params,
				material: mat,
				position: meshName && positions.has(meshName)
					? (positions.get(meshName) as [number, number, number])
					: [0, 1, 0],
				scale: meshName && scales.has(meshName)
					? (scales.get(meshName) as [number, number, number])
					: undefined,
				animate: hasAnimation,
			});
		}

		// If nothing was parsed, create a default red sphere
		if (objects.length === 0) {
			objects.push({
				id: `object-${Date.now()}-0`,
				type: "Sphere",
				geometry: [1, 32, 32],
				material: { color: "#ff0000", metalness: 0.5, roughness: 0.2 },
				position: [0, 1, 0],
				animate: false,
			});
		}
	} catch (error) {
		console.error("Error parsing generated code:", error);
		// Return a default object on error
		objects.push({
			id: `object-${Date.now()}-0`,
			type: "Sphere",
			geometry: [1, 32, 32],
			material: { color: "#ff0000" },
			position: [0, 1, 0],
			animate: false,
		});
	}

	return objects;
}

function DynamicMesh({ obj }: { obj: SceneObject }) {
	const meshRef = useRef<any>(null);

	// Add rotation animation if requested
	useEffect(() => {
		if (obj.animate && meshRef.current) {
			let animationId: number;
			const animate = () => {
				if (meshRef.current) {
					meshRef.current.rotation.x += 0.01;
					meshRef.current.rotation.y += 0.01;
				}
				animationId = requestAnimationFrame(animate);
			};
			animate();
			return () => cancelAnimationFrame(animationId);
		}
	}, [obj.animate]);

	const geometry = (() => {
		const type = obj.type.toLowerCase();
		switch (type) {
			case "box":
				return <boxGeometry args={obj.geometry as [number, number, number]} />;
			case "sphere":
				return <sphereGeometry args={obj.geometry as [number, number, number]} />;
			case "cylinder":
				return <cylinderGeometry args={obj.geometry as [number, number, number, number?, number?]} />;
			case "cone":
				return <coneGeometry args={obj.geometry as [number, number, number?]} />;
			case "torus":
				return <torusGeometry args={obj.geometry as [number, number, number?, number?]} />;
			case "torusknot":
				return <torusKnotGeometry args={obj.geometry as [number, number, number?, number?]} />;
			case "dodecahedron":
				return <dodecahedronGeometry args={obj.geometry as [number?, number?]} />;
			case "icosahedron":
				return <icosahedronGeometry args={obj.geometry as [number?, number?]} />;
			case "octahedron":
				return <octahedronGeometry args={obj.geometry as [number?, number?]} />;
			case "tetrahedron":
				return <tetrahedronGeometry args={obj.geometry as [number?, number?]} />;
			case "plane":
				return <planeGeometry args={obj.geometry as [number, number, number?, number?]} />;
			case "circle":
				return <circleGeometry args={obj.geometry as [number?, number?]} />;
			case "ring":
				return <ringGeometry args={obj.geometry as [number, number, number?, number?]} />;
			default:
				return <boxGeometry args={[1, 1, 1]} />;
		}
	})();

	return (
		<mesh
			ref={meshRef}
			position={obj.position}
			rotation={obj.rotation}
			scale={obj.scale}
			castShadow
			receiveShadow
		>
			{geometry}
			<meshStandardMaterial
				color={obj.material.color}
				metalness={obj.material.metalness ?? 0.5}
				roughness={obj.material.roughness ?? 0.5}
				transparent={obj.material.transparent}
				opacity={obj.material.opacity}
			/>
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
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		if (generatedCode && iframeRef.current) {
			// Create an HTML document with the generated Three.js code
			const htmlContent = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<style>
		body {
			margin: 0;
			overflow: hidden;
			background: linear-gradient(to bottom, #0a0a0a 0%, #1a1a1a 100%);
		}
		canvas {
			display: block;
			width: 100%;
			height: 100vh;
		}
	</style>
</head>
<body>
	<canvas id="threeCanvas"></canvas>
	<script type="module">
		${generatedCode}

		// Call the createScene function if it exists
		const canvas = document.getElementById('threeCanvas');
		if (typeof createScene === 'function') {
			createScene(canvas).catch(err => {
				console.error('Error creating scene:', err);
			});
		} else {
			console.error('createScene function not found in generated code');
		}
	</script>
</body>
</html>`;

			// Write the HTML to the iframe
			const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
			if (iframeDoc) {
				iframeDoc.open();
				iframeDoc.write(htmlContent);
				iframeDoc.close();
			}
		}
	}, [generatedCode]);

	return (
		<iframe
			ref={iframeRef}
			style={{
				width: "100%",
				height: "100%",
				border: "none",
				display: "block",
			}}
			title="Three.js Scene"
		/>
	);
}
