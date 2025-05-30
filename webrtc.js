// webrtc.js
// Minimal one-way WebRTC: active client sends video, remote client receives

let peerConnection = null;

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
			// Show the full SDP in the localSDP textarea
			displayPagedSDP(JSON.stringify(pc.localDescription));
		}
	};
	const offer = await pc.createOffer();
	await pc.setLocalDescription(offer);
}

async function setRemoteDescription() {
	const remoteSdpElem = document.getElementById("remoteSDP");
	let sdpText = remoteSdpElem.value;
	if (!peerConnection) setupPeerConnection();
	const desc = JSON.parse(sdpText);
	await peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
	if (desc.type === "offer") {
		const answer = await peerConnection.createAnswer();
		await peerConnection.setLocalDescription(answer);
		peerConnection.onicecandidate = (event) => {
			if (!event.candidate) {
				displayPagedSDP(JSON.stringify(peerConnection.localDescription));
			}
		};
	}
}

function displayPagedSDP(sdp) {
	const localSDP = document.getElementById("localSDP");
	if (localSDP) localSDP.value = sdp;
}

window.startWebRTC = startWebRTC;
window.setRemoteDescription = setRemoteDescription;
window.displayPagedSDP = displayPagedSDP;
