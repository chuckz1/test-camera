window.addEventListener("DOMContentLoaded", () => {
	// Camera controls
	window.getCameras();
	const refreshBtn = document.getElementById("refreshCameras");
	if (refreshBtn) {
		refreshBtn.onclick = window.getCameras;
	}
	const startBtn = document.getElementById("startCamera");
	if (startBtn) {
		startBtn.onclick = window.startCamera;
	}

	// WebRTC controls
	const startWebRTCBtn = document.getElementById("startWebRTC");
	if (startWebRTCBtn) {
		startWebRTCBtn.onclick = () => {
			const video = document.getElementById("video");
			let stream =
				video && video.srcObject instanceof MediaStream
					? video.srcObject
					: null;
			if (!stream) {
				console.log("No valid stream found in video element.");
				return;
			}
			window.startWebRTC(stream);
		};
	}
	const setRemoteBtn = document.getElementById("setRemoteSDP");
	if (setRemoteBtn) {
		setRemoteBtn.onclick = window.setRemoteDescription;
	}
});
