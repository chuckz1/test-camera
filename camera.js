// camera.js
// Minimal camera selection and preview logic

let currentStream = null;

async function getCameras() {
	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const videoDevices = devices.filter(
			(device) => device.kind === "videoinput"
		);
		const select = document.getElementById("cameraSelect");
		select.innerHTML = "";
		videoDevices.forEach((device, i) => {
			const option = document.createElement("option");
			option.value = device.deviceId;
			option.text = device.label || `Camera ${i + 1}`;
			select.appendChild(option);
		});
		if (videoDevices.length === 0) {
			const option = document.createElement("option");
			option.text = "No cameras found";
			select.appendChild(option);
		}
	} catch (err) {
		console.error("Error getting cameras:", err);
	}
}

async function startCamera() {
	const select = document.getElementById("cameraSelect");
	const deviceId = select.value;
	const constraints = {
		video: deviceId ? { deviceId: { exact: deviceId } } : true,
	};
	try {
		if (currentStream) {
			currentStream.getTracks().forEach((track) => track.stop());
		}
		const stream = await navigator.mediaDevices.getUserMedia(constraints);
		const video = document.getElementById("video");
		video.srcObject = stream;
		currentStream = stream;
	} catch (err) {
		console.error("Error starting camera:", err);
	}
}

window.addEventListener("DOMContentLoaded", () => {
	getCameras();
	document.getElementById("refreshCameras").onclick = getCameras;
	document.getElementById("startCamera").onclick = startCamera;
});
