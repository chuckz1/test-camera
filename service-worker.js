// PWA

// const CACHE_NAME = "arducam-camera-pwa-v1";
// const URLS_TO_CACHE = [
// 	"./camera.html",
// 	"./manifest.json",
// 	"./circle.png",
// 	"./triangle.png",
// 	"./styles.css",
// 	"./main.js",
// ];

// self.addEventListener("install", (event) => {
// 	event.waitUntil(
// 		caches.open(CACHE_NAME).then((cache) => {
// 			return cache.addAll(URLS_TO_CACHE);
// 		})
// 	);
// });

// self.addEventListener("activate", (event) => {
// 	event.waitUntil(
// 		caches.keys().then((keys) => {
// 			return Promise.all(
// 				keys
// 					.filter((key) => key !== CACHE_NAME)
// 					.map((key) => caches.delete(key))
// 			);
// 		})
// 	);
// });

// self.addEventListener("fetch", (event) => {
// 	event.respondWith(
// 		caches.match(event.request).then((response) => {
// 			return response || fetch(event.request);
// 		})
// 	);
// });
