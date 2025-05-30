// webrtc.js
// Minimal one-way WebRTC: active client sends video, remote client receives

let peerConnection = null;
let sdpChunks = [];
let sdpCurrentIdx = 0;

function setupPeerConnection() {
	peerConnection = new RTCPeerConnection();

	peerConnection.ontrack = (event) => {
		let video = document.getElementById("video");
		if (video) {
			video.srcObject = event.streams[0];
		}
	};

	return peerConnection;
}

async function startWebRTC(stream) {
	const pc = setupPeerConnection();
	stream.getTracks().forEach((track) => pc.addTrack(track, stream));
	pc.onicecandidate = (event) => {
		if (!event.candidate) {
			// Show the full SDP in the localSDP textarea (compressed and chunked)
			window.displayPagedSDP(JSON.stringify(pc.localDescription));
			if (window.updateQRCodeWithCurrentChunk) {
				window.updateQRCodeWithCurrentChunk();
			}
		}
	};
	const offer = await pc.createOffer();
	await pc.setLocalDescription(offer);
	console.log("Full Offer SDP:", JSON.stringify(pc.localDescription));
}

async function setRemoteDescription() {
	const remoteSdpElem = document.getElementById("remoteSDP");
	let sdpText = remoteSdpElem.value;
	if (!peerConnection) setupPeerConnection();

	// Handle chunked input and show chunk status
	let descText = sdpText;
	let chunkInfoElem = document.getElementById("chunkInfo");
	if (window.parseSDPChunk) {
		const parsed = window.parseSDPChunk(sdpText);
		if (parsed) {
			descText = parsed;
			if (chunkInfoElem) {
				chunkInfoElem.textContent = "All chunks received.";
			}
		} else if (window._receivedChunks) {
			// Show chunk progress
			const total = window._receivedChunks.length;
			const received = window._receivedChunks.filter(Boolean).length;
			const missing = window._receivedChunks
				.map((c, i) => (c ? null : i + 1))
				.filter((v) => v !== null);
			if (chunkInfoElem) {
				chunkInfoElem.textContent = `Chunks received: ${received}/${total}. Missing: ${missing.join(
					", "
				)}`;
			}
			return; // Wait for more chunks
		}
	}
	try {
		const desc = JSON.parse(descText);
		await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
		if (desc.type === "offer") {
			const answer = await peerConnection.createAnswer();
			await peerConnection.setLocalDescription(answer);
			peerConnection.onicecandidate = (event) => {
				if (!event.candidate) {
					window.displayPagedSDP(
						JSON.stringify(peerConnection.localDescription)
					);
				}
			};
			console.log(
				"Full Answer SDP:",
				JSON.stringify(peerConnection.localDescription)
			);
		}
	} catch (e) {
		if (chunkInfoElem)
			chunkInfoElem.textContent = "Invalid SDP or waiting for more chunks.";
	}
}

function displayPagedSDP(sdp) {
	// Only show chunked compressed SDP in the UI
	if (window.compressSDP && window.splitIntoChunks) {
		sdpChunks = window.splitIntoChunks(window.compressSDP(sdp), 800); // Use same chunk size as compression.js
		sdpCurrentIdx = 0;
		window.sdpChunks = sdpChunks; // Ensure global for navigation
		const localSDP = document.getElementById("localSDP");
		if (localSDP) localSDP.value = sdpChunks[0] || "";
		const nav = document.getElementById("sdpNav");
		const indexSpan = document.getElementById("sdpIndex");
		if (nav && indexSpan) {
			nav.style.display = sdpChunks.length > 1 ? "" : "none";
			indexSpan.textContent = `Page ${sdpCurrentIdx + 1} of ${
				sdpChunks.length
			}`;
		}
	} else {
		// fallback: show full SDP
		const localSDP = document.getElementById("localSDP");
		if (localSDP) localSDP.value = sdp;
	}
}

window.showPrevSDP = function () {
	if (!window.sdpChunks || window.sdpChunks.length < 2) return;
	window.sdpCurrentIdx =
		(window.sdpCurrentIdx - 1 + window.sdpChunks.length) % window.sdpChunks.length;
	const localSDP = document.getElementById("localSDP");
	if (localSDP) localSDP.value = window.sdpChunks[window.sdpCurrentIdx];
	const nav = document.getElementById("sdpNav");
	const indexSpan = document.getElementById("sdpIndex");
	if (nav && indexSpan) {
		indexSpan.textContent = `Page ${window.sdpCurrentIdx + 1} of ${window.sdpChunks.length}`;
	}
	if (window.updateQRCodeWithCurrentChunk) {
		console.log("[QR] showPrevSDP triggers QR update");
		window.updateQRCodeWithCurrentChunk();
	}
};

window.showNextSDP = function () {
	if (!window.sdpChunks || window.sdpChunks.length < 2) return;
	window.sdpCurrentIdx = (window.sdpCurrentIdx + 1) % window.sdpChunks.length;
	const localSDP = document.getElementById("localSDP");
	if (localSDP) localSDP.value = window.sdpChunks[window.sdpCurrentIdx];
	const nav = document.getElementById("sdpNav");
	const indexSpan = document.getElementById("sdpIndex");
	if (nav && indexSpan) {
		indexSpan.textContent = `Page ${window.sdpCurrentIdx + 1} of ${window.sdpChunks.length}`;
	}
	if (window.updateQRCodeWithCurrentChunk) {
		console.log("[QR] showNextSDP triggers QR update");
		window.updateQRCodeWithCurrentChunk();
	}
};

window.startWebRTC = startWebRTC;
window.setRemoteDescription = setRemoteDescription;
window.displayPagedSDP = displayPagedSDP;
window.sdpChunks = sdpChunks;
window.sdpCurrentIdx = sdpCurrentIdx;
