// // qrcode.js
// // Handles QR code generation and scanning

// // QR code configuration
// const QR_CONFIG = {
// 	width: 260, // Increased size for better readability
// 	margin: 6, // Wider margin for better scanning
// 	errorCorrectionLevel: "H", // Highest error correction level (30% damage tolerance)
// 	color: {
// 		dark: "#000000",
// 		light: "#ffffff",
// 	},
// 	rendererOpts: {
// 		quality: 0.9, // Higher quality rendering
// 	},
// };

// // Container for QR scanning functionality
// let scanner = null;

// // Display a QR code with the given data
// function displayQRCode(data, elementId = "qrcode") {
// 	const canvas = document.getElementById(elementId);
// 	if (!canvas) {
// 		console.error(`QR code canvas not found: ${elementId}`);
// 		return false;
// 	}

// 	// Log data size for debugging
// 	console.log(`QR data size: ${data.length} bytes`);

// 	// Clear any existing QR code
// 	const context = canvas.getContext("2d");
// 	context.clearRect(0, 0, canvas.width, canvas.height);

// 	try {
// 		QRCode.toCanvas(canvas, data, QR_CONFIG, function (error) {
// 			if (error) {
// 				console.error("Error generating QR code:", error);
// 				return false;
// 			}
// 			console.log(`QR code generated, data length: ${data.length}`);
// 			return true;
// 		});
// 	} catch (e) {
// 		console.error("QR code generation failed:", e);
// 		return false;
// 	}
// }

// // Initialize QR code scanner using the HTML5-QRCode library
// function initQRScanner() {
// 	const qrScanDiv = document.getElementById("qrScanArea");
// 	if (!qrScanDiv) {
// 		console.error("QR scan area not found");
// 		return;
// 	}
// 	// Create scanner instance if not already created
// 	if (!scanner) {
// 		scanner = new Html5Qrcode("qrScanArea");
// 	}

// 	// Configure camera for scanning - make QR box smaller than the container
// 	// Calculate the proper qrbox size based on the actual container dimensions
// 	// Use a size that's guaranteed to be smaller than the container
// 	const containerWidth = qrScanDiv.offsetWidth || 300;
// 	const containerHeight = qrScanDiv.offsetHeight || 300;
// 	const qrBoxSize = Math.min(containerWidth, containerHeight) - 30; // 30px safety margin

// 	console.log(
// 		`QR scanner container size: ${containerWidth}x${containerHeight}, using box size: ${qrBoxSize}`
// 	);

// 	// Configure camera for scanning with a safe box size
// 	const qrconfig = {
// 		fps: 10,
// 		qrbox: { width: qrBoxSize, height: qrBoxSize },
// 		aspectRatio: 1.0,
// 	};

// 	// Toggle scanning UI
// 	const scanButton = document.getElementById("scanQRBtn");
// 	const scanUI = document.getElementById("qrScanContainer");

// 	if (scanUI.style.display === "none" || !scanUI.style.display) {
// 		scanUI.style.display = "block";
// 		scanButton.textContent = "Stop Scanning";

// 		// Start scanning
// 		scanner
// 			.start(
// 				{ facingMode: "environment" },
// 				qrconfig,
// 				onQRCodeSuccess,
// 				onQRCodeError
// 			)
// 			.catch((err) => {
// 				console.error("Scanner start error:", err);
// 				alert(`Failed to start QR scanner: ${err.message || err}`);
// 				scanUI.style.display = "none";
// 				scanButton.textContent = "Scan QR Code";
// 			});
// 	} else {
// 		// Stop scanning
// 		if (scanner && scanner.isScanning) {
// 			scanner
// 				.stop()
// 				.then(() => {
// 					console.log("QR scanner stopped");
// 				})
// 				.catch((err) => {
// 					console.error("Scanner stop error:", err);
// 				});
// 		}
// 		scanUI.style.display = "none";
// 		scanButton.textContent = "Scan QR Code";
// 	}
// }

// // Handle successful QR code scan
// function onQRCodeSuccess(decodedText) {
// 	console.log(`QR code detected: ${decodedText.substring(0, 20)}...`);

// 	// If scanner is active, stop it
// 	if (scanner && scanner.isScanning) {
// 		scanner.pause();
// 	}

// 	// Process the scanned QR code
// 	const remoteSDP = document.getElementById("remoteSDP");
// 	if (!remoteSDP) {
// 		console.error("Remote SDP textarea not found");
// 		if (scanner) scanner.resume();
// 		return;
// 	}

// 	// Set the scanned text in the textarea
// 	remoteSDP.value = decodedText;

// 	// If this is a paged QR code, process it automatically
// 	if (decodedText.startsWith("PAGE:") && window.parseSDPChunk) {
// 		const allChunksReceived = window.parseSDPChunk(decodedText);
// 		if (allChunksReceived) {
// 			// All chunks received, stop scanning
// 			if (scanner && scanner.isScanning) {
// 				scanner
// 					.stop()
// 					.then(() => {
// 						console.log("QR scanner stopped after all chunks received");
// 						document.getElementById("scanQRBtn").textContent = "Scan QR Code";
// 						document.getElementById("qrScanContainer").style.display = "none";
// 					})
// 					.catch(console.error);
// 			}
// 		} else {
// 			// Still need more chunks, resume scanning
// 			if (scanner) {
// 				setTimeout(() => {
// 					scanner.resume();
// 				}, 1000); // Small delay to prevent re-scanning the same QR code
// 			}
// 		}
// 	} else {
// 		// Not a paged chunk or parseSDPChunk not available
// 		if (scanner) scanner.resume();
// 	}
// }

// // Handle QR code scan errors
// function onQRCodeError(err) {
// 	// Most scan errors are just "QR code not found in frame", no need to log these
// 	if (err && !err.includes("QR code not found")) {
// 		console.error("QR scan error:", err);
// 	}
// }

// // Update QR code when showing SDP chunk
// function updateQRCodeWithCurrentChunk() {
// 	const signalingBox = document.getElementById("signalingBox");
// 	if (signalingBox && signalingBox.value) {
// 		displayQRCode(signalingBox.value);
// 	}
// }

// // Process QR code from an uploaded image
// function processQRCodeImage(imageElement) {
// 	try {
// 		// Create a canvas to draw the image for processing
// 		const canvas = document.createElement("canvas");
// 		const context = canvas.getContext("2d");
// 		const width = imageElement.naturalWidth;
// 		const height = imageElement.naturalHeight;

// 		canvas.width = width;
// 		canvas.height = height;
// 		context.drawImage(imageElement, 0, 0, width, height);

// 		// Get image data for QR code detection
// 		const imageData = context.getImageData(0, 0, width, height);

// 		// Use jsQR library to decode the QR code
// 		const code = jsQR(imageData.data, width, height);

// 		if (code) {
// 			console.log(
// 				"QR code found in image:",
// 				code.data.substring(0, 30) + "..."
// 			);
// 			// Process the QR code data the same way as camera scanning
// 			onQRCodeSuccess(code.data);
// 			return true;
// 		} else {
// 			console.error("No QR code found in the uploaded image");
// 			alert(
// 				"No QR code found in the uploaded image. Please try a clearer image."
// 			);
// 			return false;
// 		}
// 	} catch (e) {
// 		console.error("Error processing QR code image:", e);
// 		alert("Error processing QR code image: " + e.message);
// 		return false;
// 	}
// }

// // Handle image upload functionality
// function setupQRImageUpload() {
// 	const fileInput = document.getElementById("qrFileInput");
// 	const preview = document.getElementById("uploadPreview");
// 	const imageElement = document.getElementById("uploadedQrImage");
// 	const processButton = document.getElementById("processUploadedQr");

// 	if (!fileInput || !preview || !imageElement || !processButton) {
// 		console.error("QR image upload elements not found");
// 		return;
// 	}

// 	fileInput.onchange = function (e) {
// 		const file = e.target.files[0];
// 		if (!file) return;

// 		// Check if file is an image
// 		if (!file.type.match("image.*")) {
// 			alert("Please select an image file");
// 			return;
// 		}

// 		// Create a URL for the image file
// 		const reader = new FileReader();
// 		reader.onload = function (e) {
// 			imageElement.src = e.target.result;
// 			preview.style.display = "block";
// 		};
// 		reader.readAsDataURL(file);
// 	};

// 	processButton.onclick = function () {
// 		if (imageElement.complete && imageElement.naturalHeight !== 0) {
// 			processQRCodeImage(imageElement);
// 		} else {
// 			alert("Please wait for the image to load completely");
// 		}
// 	};
// }

// // Export functions for use in other modules
// window.displayQRCode = displayQRCode;
// window.initQRScanner = initQRScanner;
// window.updateQRCodeWithCurrentChunk = updateQRCodeWithCurrentChunk;
// window.setupQRImageUpload = setupQRImageUpload;
