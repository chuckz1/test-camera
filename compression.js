// compression.js
// Handles SDP compression and chunked paging logic

const MAX_CHUNK_SIZE = 800; // bytes

function compressSDP(sdp) {
	return LZString.compressToEncodedURIComponent(sdp);
}

function decompressSDP(data) {
	return LZString.decompressFromEncodedURIComponent(data);
}

function splitIntoChunks(data, chunkSize) {
	const chunks = [];
	const total = Math.ceil(data.length / chunkSize);
	for (let i = 0; i < total; i++) {
		const start = i * chunkSize;
		const end = Math.min(start + chunkSize, data.length);
		const part = data.slice(start, end);
		chunks.push(`CHUNK:${i + 1}/${total}:${part}`);
	}
	return chunks;
}

function joinChunks(chunks) {
	return chunks.map((chunk) => chunk.split(":").slice(2).join(":")).join("");
}

function showSDPChunk(idx) {
	const signalingBox = document.getElementById("localSDP");
	const nav = document.getElementById("sdpNav");
	const indexSpan = document.getElementById("sdpIndex");
	if (!window.sdpChunks.length) return;
	signalingBox.value = window.sdpChunks[idx];
	if (nav && indexSpan) {
		nav.style.display = window.sdpChunks.length > 1 ? "" : "none";
		indexSpan.textContent = `Page ${idx + 1} of ${window.sdpChunks.length}`;
	}
	console.log("[QR] showSDPChunk triggers QR update");
	if (window.updateQRCodeWithCurrentChunk) {
		window.updateQRCodeWithCurrentChunk();
	}
}

window.showPrevSDP = function () {
	if (window.sdpChunks.length < 2) return;
	window.sdpCurrentIdx =
		(window.sdpCurrentIdx - 1 + window.sdpChunks.length) %
		window.sdpChunks.length;
	showSDPChunk(window.sdpCurrentIdx);
};

window.showNextSDP = function () {
	if (window.sdpChunks.length < 2) return;
	window.sdpCurrentIdx = (window.sdpCurrentIdx + 1) % window.sdpChunks.length;
	showSDPChunk(window.sdpCurrentIdx);
};

function displayPagedSDP(sdp) {
	console.log("Full SDP:", sdp);
	const compressed = compressSDP(sdp);
	window.sdpChunks = splitIntoChunks(compressed, MAX_CHUNK_SIZE);
	window.sdpCurrentIdx = 0;
	showSDPChunk(0);
}

function parseSDPChunk(chunkOrFull) {
	if (chunkOrFull.startsWith("CHUNK:")) {
		// Accept only one chunk at a time for now
		const parts = chunkOrFull.split(":");
		const [current, total] = parts[1].split("/").map(Number);
		if (!window._receivedChunks) {
			window._receivedChunks = new Array(total).fill(null);
		}
		window._receivedChunks[current - 1] = parts.slice(2).join(":");
		const receivedCount = window._receivedChunks.filter(Boolean).length;
		if (receivedCount === total) {
			const compressed = window._receivedChunks.join("");
			const sdp = decompressSDP(compressed);
			console.log("Full SDP (decompressed):", sdp);
			return sdp;
		} else {
			return null;
		}
	} else {
		// Not chunked, just decompress if needed
		try {
			const sdp = JSON.parse(chunkOrFull);
			console.log("Full SDP (raw):", chunkOrFull);
			return chunkOrFull;
		} catch {
			// Try decompress
			try {
				const sdp = decompressSDP(chunkOrFull);
				console.log("Full SDP (decompressed):", sdp);
				return sdp;
			} catch {
				return null;
			}
		}
	}
}

window.displayPagedSDP = displayPagedSDP;
window.parseSDPChunk = parseSDPChunk;
window.compressSDP = compressSDP;
window.decompressSDP = decompressSDP;
window.splitIntoChunks = splitIntoChunks;
window.joinChunks = joinChunks;
