// // main.js
// // Coordinates interactions between camera, webrtc, and compression modules

// window.addEventListener("DOMContentLoaded", () => {
// 	// Camera controls
// 	window.getCameras();
// 	const refreshBtn = document.getElementById("refreshCameras");
// 	if (refreshBtn) {
// 		refreshBtn.onclick = window.getCameras;
// 	}
// 	const startBtn = document.getElementById("startCamera");
// 	if (startBtn) {
// 		startBtn.onclick = window.startCamera;
// 	}

// 	// WebRTC controls
// 	const startWebRTCBtn = document.getElementById("startWebRTC");
// 	if (startWebRTCBtn) {
// 		startWebRTCBtn.onclick = () => {
// 			// Always get the stream from the video element for reliability
// 			const video = document.getElementById("video");
// 			let stream =
// 				video && video.srcObject instanceof MediaStream
// 					? video.srcObject
// 					: null;
// 			if (!stream) {
// 				// alert("Start the camera first.");
// 				console.log("No valid stream found in video element.");
// 				console.log(stream);
// 				return;
// 			}
// 			window.startWebRTC(stream);
// 		};
// 	}
// 	const setRemoteBtn = document.getElementById("setRemoteSDP");
// 	if (setRemoteBtn) {
// 		setRemoteBtn.onclick = window.setRemoteDescription;
// 	}

// 	// QR code scanning button
// 	const scanQRBtn = document.getElementById("scanQRBtn");
// 	if (scanQRBtn && window.initQRScanner) {
// 		scanQRBtn.onclick = window.initQRScanner;
// 	}

// 	// Setup QR code image upload
// 	if (window.setupQRImageUpload) {
// 		window.setupQRImageUpload();
// 	}

// 	// Handle paste events in remoteSDP textarea
// 	const remoteSDP = document.getElementById("remoteSDP");
// 	if (remoteSDP) {
// 		remoteSDP.addEventListener("paste", function () {
// 			// Use setTimeout to access the pasted text after the paste event completes
// 			setTimeout(() => {
// 				if (this.value.startsWith("PAGE:")) {
// 					const allChunksReceived = window.parseSDPChunk(this.value);
// 					if (!allChunksReceived) {
// 						// We don't have all chunks yet, clear the textarea for the next chunk
// 						this.value = "";
// 					}
// 				}
// 			}, 0);
// 		});
// 	}

// 	// SDP navigation
// 	const sdpPrev = document.getElementById("sdpPrev");
// 	const sdpNext = document.getElementById("sdpNext");
// 	if (sdpPrev)
// 		sdpPrev.onclick = () => window.showPrevSDP && window.showPrevSDP();
// 	if (sdpNext)
// 		sdpNext.onclick = () => window.showNextSDP && window.showNextSDP();
// });
