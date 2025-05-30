// // compression.js
// // Handles SDP compression and chunked paging logic

// const MAX_CHUNK_SIZE = 800; // Reduced to 800 bytes for more readable QR codes
// let sdpChunks = [];
// let sdpCurrentIdx = 0;

// // Track received SDP chunks
// let receivedChunks = [];
// let expectedTotalChunks = 0;

// // Enhanced SDP compression
// function compressSDP(sdp) {
// 	// Pre-process SDP to normalize and optimize it
// 	const sdpObj = JSON.parse(sdp);

// 	// Do not remove any lines from the SDP string; send the full SDP
// 	sdpObj.sdp = sdpObj.sdp
// 		.split("\r\n")
// 		.filter(
// 			(line) =>
// 				// Only remove comments and truly optional attributes
// 				// KEEP all a=rtpmap: and a=fmtp: lines (they are needed for codec negotiation)
// 				!line.startsWith("a=rtcp-fb:") &&
// 				!line.includes("network-id") &&
// 				!line.includes("generation")
// 		)
// 		.join("\r\n");

// 	// Convert back to string and compress
// 	const optimizedSdp = JSON.stringify(sdpObj);
// 	console.log(`SDP size before compression: ${optimizedSdp.length} bytes`);

// 	// Use LZString for efficient compression
// 	return LZString.compressToEncodedURIComponent(optimizedSdp);
// }

// function decompressSDP(data) {
// 	// Decompress the data
// 	const decompressedData = LZString.decompressFromEncodedURIComponent(data);

// 	if (!decompressedData) {
// 		throw new Error("Failed to decompress SDP data");
// 	}

// 	console.log(`SDP size after decompression: ${decompressedData.length} bytes`);
// 	return decompressedData;
// }

// function splitIntoChunks(data, chunkSize) {
// 	const chunks = [];
// 	const total = Math.ceil(data.length / chunkSize);

// 	// Remove sessionId logic
// 	for (let i = 0; i < total; i++) {
// 		const start = i * chunkSize;
// 		const end = Math.min(start + chunkSize, data.length);
// 		const part = data.slice(start, end);

// 		// Format: "PAGE:currentPage/totalPages:checksum:compressed-data"
// 		const checksum = calculateChecksum(part);
// 		chunks.push(`PAGE:${i + 1}/${total}:${checksum}:${part}`);
// 		console.log(
// 			`Created chunk ${i + 1}/${total}, length: ${
// 				part.length
// 			}, checksum: ${checksum}`
// 		);
// 	}
// 	return chunks;
// }

// // Simple checksum function to verify data integrity
// function calculateChecksum(data) {
// 	let sum = 0;
// 	for (let i = 0; i < data.length; i++) {
// 		sum = (sum + data.charCodeAt(i)) % 9973; // Use a prime number
// 	}
// 	return sum.toString(36); // Convert to base36 for compactness
// }

// function showSDPChunk(idx) {
// 	const signalingBox = document.getElementById("signalingBox");
// 	const nav = document.getElementById("sdpNav");
// 	const indexSpan = document.getElementById("sdpIndex");
// 	if (!sdpChunks.length) return;
// 	signalingBox.value = sdpChunks[idx];
// 	if (nav && indexSpan) {
// 		nav.style.display = sdpChunks.length > 1 ? "" : "none";
// 		indexSpan.textContent = `Page ${idx + 1} of ${sdpChunks.length}`;
// 	}

// 	// Update QR code with the current chunk
// 	// if (window.updateQRCodeWithCurrentChunk) {
// 	// 	window.updateQRCodeWithCurrentChunk();
// 	// } else if (window.displayQRCode) {
// 	// 	window.displayQRCode(sdpChunks[idx]);
// 	// }
// }

// window.showPrevSDP = function () {
// 	if (sdpChunks.length < 2) return;
// 	sdpCurrentIdx = (sdpCurrentIdx - 1 + sdpChunks.length) % sdpChunks.length;
// 	showSDPChunk(sdpCurrentIdx);
// };

// window.showNextSDP = function () {
// 	if (sdpChunks.length < 2) return;
// 	sdpCurrentIdx = (sdpCurrentIdx + 1) % sdpChunks.length;
// 	showSDPChunk(sdpCurrentIdx);
// };

// function displayPagedSDP(sdp) {
// 	const compressed = compressSDP(sdp);
// 	sdpChunks = splitIntoChunks(compressed, MAX_CHUNK_SIZE);
// 	sdpCurrentIdx = 0;
// 	showSDPChunk(0);
// }

// // Function to parse a chunk when pasted into the remoteSDP textarea
// function parseSDPChunk(chunk) {
// 	// Check if this is a paged chunk
// 	if (chunk.startsWith("PAGE:")) {
// 		try {
// 			// Parse page metadata
// 			// New format: "PAGE:currentPage/totalPages:checksum:data"
// 			const parts = chunk.split(":");

// 			if (parts.length < 4) {
// 				console.error("Invalid chunk format, missing fields");
// 				return false;
// 			}

// 			const pagingInfo = parts[1];
// 			const [current, total] = pagingInfo
// 				.split("/")
// 				.map((n) => parseInt(n, 10));
// 			const checksum = parts[2];
// 			const data = parts.slice(3).join(":"); // Rejoin in case data contains colons

// 			// Verify checksum
// 			const calculatedChecksum = calculateChecksum(data);
// 			if (checksum !== calculatedChecksum) {
// 				console.error(
// 					`Checksum mismatch. Expected: ${checksum}, Got: ${calculatedChecksum}`
// 				);
// 				alert("QR code data appears corrupted. Please try scanning again.");
// 				return false;
// 			}

// 			console.log(
// 				`Received SDP chunk ${current} of ${total}`
// 			);

// 			// No sessionId, so just reset if chunk count changes
// 			if (expectedTotalChunks === 0 || expectedTotalChunks !== total) {
// 				expectedTotalChunks = total;
// 				receivedChunks = new Array(total).fill(null);
// 				console.log(`New chunk set started`);
// 			}

// 			// Store the chunk data
// 			if (receivedChunks[current - 1] !== null) {
// 				console.warn(`Chunk ${current} already received, ignoring duplicate.`);
// 				alert(`Chunk ${current} already received. Scan a different page.`);
// 				return false;
// 			}
// 			receivedChunks[current - 1] = data;

// 			// Update UI to show progress
// 			const remoteSDP = document.getElementById("remoteSDP");
// 			const receivedCount = receivedChunks.filter((c) => c !== null).length;
// 			const missingPages = receivedChunks
// 				.map((c, idx) => (c === null ? idx + 1 : null))
// 				.filter((v) => v !== null);
// 			remoteSDP.placeholder = `Received ${receivedCount} of ${expectedTotalChunks} chunks (${Math.floor(
// 				(receivedCount / expectedTotalChunks) * 100
// 			)}%).` + (missingPages.length ? ` Missing: ${missingPages.join(", ")}` : " All received!");

// 			// Check if we have all chunks
// 			if (receivedChunks.every((c) => c !== null)) {
// 				// We have all chunks, combine them
// 				const fullCompressedSDP = receivedChunks.join("");
// 				console.log(
// 					"Combined compressed SDP:",
// 					fullCompressedSDP.substring(0, 50) + "..."
// 				);

// 				try {
// 					const fullSDP = decompressSDP(fullCompressedSDP);
// 					console.log(
// 						"Decompressed SDP (first 100 chars):",
// 						fullSDP.substring(0, 100) + "..."
// 					);

// 					// Validate the SDP is proper JSON before setting it
// 					try {
// 						JSON.parse(fullSDP);
// 						console.log("SDP is valid JSON");
// 					} catch (e) {
// 						console.error("Decompressed SDP is not valid JSON:", e);
// 						alert("Error: Reassembled SDP is not valid JSON. Try again.");
// 						return false;
// 					}

// 					// Display the combined SDP and reset tracking
// 					remoteSDP.value = fullSDP;
// 					remoteSDP.placeholder = "Paste Remote SDP";
// 					receivedChunks = [];
// 					expectedTotalChunks = 0;

// 					// Auto set the remote description if the setRemoteSDP button exists
// 					const setRemoteBtn = document.getElementById("setRemoteSDP");
// 					if (setRemoteBtn) {
// 						console.log(
// 							"All chunks received. Automatically setting remote description."
// 						);
// 						window.setRemoteDescription();
// 					}

// 					return true; // All chunks received
// 				} catch (e) {
// 					console.error("Error decompressing SDP:", e);
// 					alert("Error decompressing data. Please try again.");
// 					return false;
// 				}
// 			}
// 			return false; // Still waiting for more chunks
// 		} catch (e) {
// 			console.error("Error parsing paged SDP chunk:", e);
// 			return false;
// 		}
// 	} else {
// 		// Not a paged chunk, just return it as is
// 		return true;
// 	}
// }

// window.displayPagedSDP = displayPagedSDP;
// window.parseSDPChunk = parseSDPChunk;
