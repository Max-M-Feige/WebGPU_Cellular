/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./shader.wgsl":
/*!*********************!*\
  !*** ./shader.wgsl ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (\"@vertex\\nfn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f \\n{\\n\\treturn vec4f(pos,0,1);\\n}\\n\\n@fragment\\nfn fragmentMain() -> @location(0) vec4f {\\n\\treturn vec4f(1,0,0,1);\\n}\");\n\n//# sourceURL=webpack://@maxfeige/webgpu-conway/./shader.wgsl?");

/***/ }),

/***/ "./main.ts":
/*!*****************!*\
  !*** ./main.ts ***!
  \*****************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _shader_wgsl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shader.wgsl */ \"./shader.wgsl\");\n\n//Webpack setup was a PITA\nconsole.log(_shader_wgsl__WEBPACK_IMPORTED_MODULE_0__[\"default\"]);\nconst canvas = document.querySelector(\"canvas\");\nif (canvas === null) {\n    throw \"Could not find canvas\";\n}\nif (!navigator.gpu) {\n    throw \"Could not get gpu\";\n}\nasync function main() {\n    const adapter = await navigator.gpu.requestAdapter();\n    if (adapter === null) {\n        throw \"No appropriate adapter found\";\n    }\n    let allFeatures = [\"bgra8unorm-storage\", \"depth-clip-control\", \"depth32float-stencil8\", \"float32-filterable\",\n        \"indirect-first-instance\", \"rg11b10ufloat-renderable\", \"shader-f16\", \"texture-compression-astc\", \"texture-compression-bc\", \"texture-compression-etc2\", \"timestamp-query\"];\n    let supportedFeatures = [];\n    let unsupportedFeatures = [];\n    for (let feature of allFeatures) {\n        if (adapter.features.has(feature)) {\n            supportedFeatures.push(feature);\n        }\n        else {\n            unsupportedFeatures.push(feature);\n        }\n    }\n    console.log(\"%c Supported features: \\n\" + supportedFeatures.join(\"\\n\"), 'color: lightgreen');\n    console.log(\"%c Unsupported features: \\n\" + unsupportedFeatures.join(\"\\n\"), 'color: #ffcccb');\n    const device = await adapter.requestDevice({\n        //Requiring certain features - some features might be limited to nvida/amd gpus, others require more modern hardware\n        requiredFeatures: supportedFeatures,\n        //Example limit - 8192 is the default value, but just showing off what we could require\n        requiredLimits: {\n            maxTextureDimension2D: 8192\n        },\n        //Not sure how to use this!\n        defaultQueue: {}\n    });\n    const context = canvas.getContext(\"webgpu\");\n    if (context === null) {\n        throw \"Could not get webgpu context!\";\n    }\n    //currently will return rgba8unorm or bgra8unorm\n    //Basically some gpus like textures to be rgb, some bgr! Mine (3060 ti) happens to like bgr (TIL!)\n    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();\n    console.log(\"Preferred format: \" + canvasFormat);\n    context.configure({\n        device: device,\n        format: canvasFormat,\n        //This is the default usage - texture being used as a color or depth attachment!\n        //Could be several flags or'd together\n        usage: GPUTextureUsage.RENDER_ATTACHMENT,\n        //Specifiy the format that views from the getCurrentTexture function may have\n        //Defaults empty array.  Not sure how to use, or how relates to default format!\n        viewFormats: [],\n        //Opaque or premultiplied. Premultiplied will take alpha and change color before it goes anywhere!\n        alphaMode: \"opaque\"\n    });\n    const vertices = new Float32Array([\n        //   X,    Y,\n        -0.8, -0.8,\n        0.8, -0.8,\n        0.8, 0.8,\n        -0.8, -0.8,\n        0.8, 0.8,\n        -0.8, 0.8,\n    ]);\n    //TODO: Switch to index buffers with a square instead of repeating vertices\n    //Create vertex buffer\n    const vertexBuffer = device.createBuffer({\n        \"label\": \"Cell vertices\",\n        size: vertices.byteLength,\n        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST\n    });\n    device.queue.writeBuffer(vertexBuffer, 0, vertices);\n    const vertexBufferLayout = {\n        //Number of bytes the gpu needs to skip to find next vertex.\n        //Since we're using 2 32 bit floats per coord, that is 4 * 2 = 8 bytes\n        arrayStride: 8,\n        //Array of attributes.  Since we only have 1 attribute, this just has a single item\n        attributes: [{\n                //Vertices are 2 32 bit floats, so float 32x2\n                format: \"float32x2\",\n                //How far into this buffer does the attribute start.  Only matters if we're storing multiple attributes in a single buffer\n                offset: 0,\n                //Arbitrary number between 0 and 15 that must be unique per attribute. \n                shaderLocation: 0\n            }]\n    };\n    const cellShaderModule = device.createShaderModule({\n        label: \"Cell Shader\",\n        code: _shader_wgsl__WEBPACK_IMPORTED_MODULE_0__[\"default\"]\n    });\n    const cellPipleline = device.createRenderPipeline({\n        label: \"Cell pipeline\",\n        layout: \"auto\",\n        vertex: {\n            module: cellShaderModule,\n            entryPoint: \"vertexMain\",\n            buffers: [vertexBufferLayout]\n        },\n        fragment: {\n            module: cellShaderModule,\n            entryPoint: \"fragmentMain\",\n            targets: [{\n                    format: canvasFormat\n                }]\n        }\n    });\n    //What we will use for drawing ops!\n    const encoder = device.createCommandEncoder();\n    let clearColor = {\n        r: 0,\n        g: 0,\n        b: 0.4,\n        a: 1\n    };\n    //Could also create a clear color from an array (Or any iterable)!\n    clearColor = [0, 0, 0.4, 1];\n    //Set up a command to clear the texture and store the results back into that texture\n    const pass = encoder.beginRenderPass({\n        colorAttachments: [{\n                //Grab the current texture of our canvas (which will match the width/height and format of our previous context.configure)\n                view: context.getCurrentTexture().createView(),\n                loadOp: \"clear\",\n                storeOp: \"store\",\n                clearValue: clearColor\n            }]\n    });\n    pass.setPipeline(cellPipleline);\n    pass.setVertexBuffer(0, vertexBuffer);\n    pass.draw(vertices.length / 2);\n    //End the pass\n    pass.end();\n    /** Method 1: Create buffer and submit it, then clear it out\n    //Convert our pass into a bunch of commands the gpu can execute\n    let commandBuffer : GPUCommandBuffer | null = encoder.finish();\n\n    //Tell our device to queue our commands.  This makes our commandBuffer no longer useable\n    device.queue.submit([commandBuffer]);\n    //Let go of our buffer so JS can garbage collect whatever was in side\n    commandBuffer = null;\n    */\n    /**\n     * Method 2 (preferred when useable): Submit buffer as we create it, so we don't need to hold onto it\n     */\n    device.queue.submit([encoder.finish()]);\n    //tada! we've cleared our canvas and its all set to the color we gave earlier\n}\nmain();\n\n\n//# sourceURL=webpack://@maxfeige/webgpu-conway/./main.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./main.ts");
/******/ 	
/******/ })()
;