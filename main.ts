
import shader from './shader.wgsl';
//Webpack setup was a PITA
console.log(shader)
const canvas = document.querySelector("canvas") as HTMLCanvasElement;


if (canvas === null)
{
	throw "Could not find canvas";
}
if (!navigator.gpu)
{
	throw "Could not get gpu";
}



async function main()
{
	const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
	if (adapter === null)
	{
		throw "No appropriate adapter found";
	}
	let allFeatures: GPUFeatureName[] = ["bgra8unorm-storage", "depth-clip-control", "depth32float-stencil8", "float32-filterable",
		"indirect-first-instance", "rg11b10ufloat-renderable", "shader-f16", "texture-compression-astc", "texture-compression-bc", "texture-compression-etc2", "timestamp-query"];
	let supportedFeatures: GPUFeatureName[] = [];
	let unsupportedFeatures: GPUFeatureName[] = [];
	for (let feature of allFeatures)
	{
		if (adapter.features.has(feature))
		{
			supportedFeatures.push(feature);
		}
		else
		{
			unsupportedFeatures.push(feature);
		}
	}
	console.log("%c Supported features: \n" + supportedFeatures.join("\n"), 'color: lightgreen');
	console.log("%c Unsupported features: \n" + unsupportedFeatures.join("\n"), 'color: #ffcccb');

	const device: GPUDevice = await adapter.requestDevice({
		//Requiring certain features - some features might be limited to nvida/amd gpus, others require more modern hardware
		requiredFeatures: supportedFeatures,
		//Example limit - 8192 is the default value, but just showing off what we could require
		requiredLimits: {
			maxTextureDimension2D: 8192
		},
		//Not sure how to use this!
		defaultQueue: {}
	});

	const context: GPUCanvasContext | null = canvas.getContext("webgpu");
	if (context === null)
	{
		throw "Could not get webgpu context!";
	}

	//currently will return rgba8unorm or bgra8unorm
	//Basically some gpus like textures to be rgb, some bgr! Mine (3060 ti) happens to like bgr (TIL!)
	const canvasFormat: GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();
	console.log("Preferred format: " + canvasFormat);
	context.configure(
		{
			device: device,
			format: canvasFormat,
			//This is the default usage - texture being used as a color or depth attachment!
			//Could be several flags or'd together
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
			//Specifiy the format that views from the getCurrentTexture function may have
			//Defaults empty array.  Not sure how to use, or how relates to default format!
			viewFormats: [],
			//Opaque or premultiplied. Premultiplied will take alpha and change color before it goes anywhere!
			alphaMode: "opaque"
		}
	);


	const vertices = new Float32Array([
		//   X,    Y,
		-0.8, -0.8, // Triangle 1 (Blue)
		0.8, -0.8,
		0.8, 0.8,

		-0.8, -0.8, // Triangle 2 (Red)
		0.8, 0.8,
		-0.8, 0.8,]);

	//TODO: Switch to index buffers with a square instead of repeating vertices

	//Create vertex buffer
	const vertexBuffer = device.createBuffer({
		"label": "Cell vertices",
		size: vertices.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
	});

	device.queue.writeBuffer(vertexBuffer, 0, vertices);

	const vertexBufferLayout: GPUVertexBufferLayout = {

		//Number of bytes the gpu needs to skip to find next vertex.
		//Since we're using 2 32 bit floats per coord, that is 4 * 2 = 8 bytes
		arrayStride: 8,
		//Array of attributes.  Since we only have 1 attribute, this just has a single item
		attributes: [{
			//Vertices are 2 32 bit floats, so float 32x2
			format: "float32x2",
			//How far into this buffer does the attribute start.  Only matters if we're storing multiple attributes in a single buffer
			offset: 0,
			//Arbitrary number between 0 and 15 that must be unique per attribute. 
			shaderLocation: 0
		}]
	};

	const cellShaderModule : GPUShaderModule = device.createShaderModule({
		label: "Cell Shader",
		code: shader
	});

	const cellPipleline: GPURenderPipeline = device.createRenderPipeline({
		label: "Cell pipeline",
		layout: "auto",
		vertex: {
			module: cellShaderModule,
			entryPoint: "vertexMain",
			buffers: [vertexBufferLayout]		
		},
		fragment: {
			module: cellShaderModule,
			entryPoint: "fragmentMain",
			targets: [{
				format: canvasFormat
			}]
		}
	});
	


	//What we will use for drawing ops!
	const encoder: GPUCommandEncoder = device.createCommandEncoder();

	let clearColor: GPUColor = {
		r: 0,
		g: 0,
		b: 0.4,
		a: 1
	};
	//Could also create a clear color from an array (Or any iterable)!
	clearColor = [0, 0, 0.4, 1];

	//Set up a command to clear the texture and store the results back into that texture
	const pass = encoder.beginRenderPass({
		colorAttachments: [{
			//Grab the current texture of our canvas (which will match the width/height and format of our previous context.configure)
			view: context.getCurrentTexture().createView(),
			loadOp: "clear",
			storeOp: "store",
			clearValue: clearColor
		}]
	});

	pass.setPipeline(cellPipleline);
	pass.setVertexBuffer(0,vertexBuffer);
	pass.draw(vertices.length/2);

	//End the pass
	pass.end();

	/** Method 1: Create buffer and submit it, then clear it out 
	//Convert our pass into a bunch of commands the gpu can execute
	let commandBuffer : GPUCommandBuffer | null = encoder.finish();

	//Tell our device to queue our commands.  This makes our commandBuffer no longer useable
	device.queue.submit([commandBuffer]);
	//Let go of our buffer so JS can garbage collect whatever was in side
	commandBuffer = null;
	*/
	/**
	 * Method 2 (preferred when useable): Submit buffer as we create it, so we don't need to hold onto it
	 */
	device.queue.submit([encoder.finish()]);
	//tada! we've cleared our canvas and its all set to the color we gave earlier

}


main();