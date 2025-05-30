// Minimal one-way WebRTC: active client sends video, remote client receives

let peerConnection = null;

function setupPeerConnection() {
	peerConnection = new RTCPeerConnection();

	peerConnection.ontrack = (event) => {
		let remoteVideo = document.getElementById("remoteVideo");
		if (!remoteVideo) {
			remoteVideo = document.createElement("video");
			remoteVideo.id = "remoteVideo";
			remoteVideo.autoplay = true;
			remoteVideo.playsInline = true;
			document.body.appendChild(remoteVideo);
		}
		remoteVideo.srcObject = event.streams[0];
	};

	return peerConnection;
}

async function startWebRTC(stream) {
	const pc = setupPeerConnection();
	stream.getTracks().forEach((track) => pc.addTrack(track, stream));
	pc.onicecandidate = (event) => {
		if (!event.candidate) {
			// Log the full SDP before compression
			console.log(
				"Full SDP offer before compression:",
				JSON.stringify(pc.localDescription)
			);
			displayPagedSDP(JSON.stringify(pc.localDescription));
		}
	};
	const offer = await pc.createOffer();
	await pc.setLocalDescription(offer);
}

async function setRemoteDescription() {
	const remoteSdpElem = document.getElementById("remoteSDP");
	let sdpText = remoteSdpElem.value;
	// Accept either chunked compressed data or full uncompressed SDP
	if (sdpText.startsWith("PAGE:")) {
		if (window.parseSDPChunk) {
			const allChunksReceived = window.parseSDPChunk(sdpText);
			if (!allChunksReceived) {
				console.log("Waiting for more SDP chunks...");
				return;
			}
			// After all chunks received, parseSDPChunk will set remoteSDP.value to the full SDP
			sdpText = remoteSdpElem.value;
			console.log("All SDP chunks received. Full SDP:");
			console.log(JSON.stringify(sdpText));
		}
	} else {
		console.log("Received full uncompressed SDP:");
		console.log(sdpText);
	}
	if (!peerConnection) setupPeerConnection();
	const desc = JSON.parse(sdpText);
	await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
	if (desc.type === "offer") {
		const answer = await peerConnection.createAnswer();
		await peerConnection.setLocalDescription(answer);
		peerConnection.onicecandidate = (event) => {
			if (!event.candidate) {
				console.log(
					"Full SDP answer before compression:",
					JSON.stringify(peerConnection.localDescription)
				);
				displayPagedSDP(JSON.stringify(peerConnection.localDescription));
			}
		};
	} else {
		console.log("Remote description set successfully.");
	}
}

window.startWebRTC = startWebRTC;
window.setRemoteDescription = setRemoteDescription;
