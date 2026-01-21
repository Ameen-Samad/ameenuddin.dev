import { useEffect, useRef } from "react";

interface ThreeSceneProps {
	generatedCode: string | null;
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
