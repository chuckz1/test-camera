// qrcode.js
// Handles QR code generation for SDP chunks

// Display a QR code with the given data in the canvas with id 'qrcode'
function displayQRCode(data) {
	console.log(
		"[QR] displayQRCode called with data:",
		data && data.substring
			? data.substring(0, 40) + (data.length > 40 ? "..." : "")
			: data
	);
	const canvas = document.getElementById("qrcode");
	if (!canvas) return;
	// Check for QRCode library (from CDN)
	if (
		typeof window.QRCode === "undefined" &&
		typeof window.qrcode === "undefined"
	) {
		console.error("QRCode library not loaded");
		return;
	}
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// Use the correct global (QRCode)
	const QR = window.QRCode || window.qrcode;
	QR.toCanvas(
		canvas,
		data,
		{
			width: 260,
			margin: 6,
			errorCorrectionLevel: "H",
			color: { dark: "#000", light: "#fff" },
		},
		function (error) {
			if (error) console.error(error);
		}
	);
}

// Update QR code for the current chunk (call this after chunk changes)
window.updateQRCodeWithCurrentChunk = function () {
	console.log("[QR] updateQRCodeWithCurrentChunk called");
	if (!window.sdpChunks || !window.sdpChunks.length) return;
	const idx = window.sdpCurrentIdx || 0;
	displayQRCode(window.sdpChunks[idx]);
};
