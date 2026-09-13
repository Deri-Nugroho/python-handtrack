// Retrolens - Hand Tracking Filter Portal
// Web version using MediaPipe Hands JavaScript

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const outputCanvas = document.getElementById('output-canvas');
const ctx = canvas.getContext('2d');
const outputCtx = outputCanvas.getContext('2d');
const startBtn = document.getElementById('start-btn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const currentFilterEl = document.getElementById('current-filter');

// Filter list
const filters = ["MONO", "DUAL-TONE", "PIXELATE", "INVERT", "SEPIA", "BLUR", "THERMAL", "SKETCH", "GLITCH", "NEON"];
let currentFilter = 0;
let gestureTriggered = false;
let hands = null;
let camera = null;
let isRunning = false;

// Galaxy background (generated once)
let galaxyBg = null;

function generateGalaxyBackground(width, height) {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = width;
    bgCanvas.height = height;
    const bgCtx = bgCanvas.getContext('2d');
    
    // Space purple background
    bgCtx.fillStyle = '#1e0a28';
    bgCtx.fillRect(0, 0, width, height);
    
    // Stars
    for (let i = 0; i < 800; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        bgCtx.fillStyle = '#ffffff';
        bgCtx.fillRect(x, y, 1, 1);
    }
    
    // Colorful orbs
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 5 + 2;
        const r = Math.floor(Math.random() * 105 + 150);
        const g = Math.floor(Math.random() * 155 + 100);
        const b = 255;
        bgCtx.beginPath();
        bgCtx.arc(x, y, radius, 0, Math.PI * 2);
        bgCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        bgCtx.fill();
    }
    
    return bgCanvas;
}

// Filter functions
function applyFilter(imageData, filterName) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    switch (filterName) {
        case "MONO":
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }
            break;
            
        case "INVERT":
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            break;
            
        case "SEPIA":
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            }
            break;
            
        case "DUAL-TONE":
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                if (gray > 127) {
                    data[i] = 0;
                    data[i + 1] = 165;
                    data[i + 2] = 255;
                } else {
                    data[i] = 147;
                    data[i + 1] = 20;
                    data[i + 2] = 255;
                }
            }
            break;
            
        case "THERMAL":
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                const normalized = gray / 255;
                // Simple thermal colormap
                if (normalized < 0.25) {
                    data[i] = 0;
                    data[i + 1] = normalized * 4 * 255;
                    data[i + 2] = 255;
                } else if (normalized < 0.5) {
                    data[i] = 0;
                    data[i + 1] = 255;
                    data[i + 2] = (1 - (normalized - 0.25) * 4) * 255;
                } else if (normalized < 0.75) {
                    data[i] = (normalized - 0.5) * 4 * 255;
                    data[i + 1] = 255;
                    data[i + 2] = 0;
                } else {
                    data[i] = 255;
                    data[i + 1] = (1 - (normalized - 0.75) * 4) * 255;
                    data[i + 2] = 0;
                }
            }
            break;
            
        case "NEON":
            // Edge detection with neon glow
            const tempData = new Uint8ClampedArray(data);
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = (y * width + x) * 4;
                    const gray = tempData[idx] * 0.299 + tempData[idx + 1] * 0.587 + tempData[idx + 2] * 0.114;
                    
                    // Simple edge detection
                    const idxRight = (y * width + (x + 1)) * 4;
                    const idxDown = ((y + 1) * width + x) * 4;
                    const grayRight = tempData[idxRight] * 0.299 + tempData[idxRight + 1] * 0.587 + tempData[idxRight + 2] * 0.114;
                    const grayDown = tempData[idxDown] * 0.299 + tempData[idxDown + 1] * 0.587 + tempData[idxDown + 2] * 0.114;
                    
                    const edge = Math.abs(gray - grayRight) + Math.abs(gray - grayDown);
                    
                    if (edge > 30) {
                        data[idx] = 255;
                        data[idx + 1] = 255;
                        data[idx + 2] = 0;
                    } else {
                        data[idx] = 0;
                        data[idx + 1] = 0;
                        data[idx + 2] = 0;
                    }
                }
            }
            break;
    }
    
    return imageData;
}

// Special filters that need canvas operations
function applyCanvasFilter(ctx, width, height, filterName) {
    switch (filterName) {
        case "BLUR":
            ctx.filter = 'blur(10px)';
            break;
        case "PIXELATE":
            ctx.imageSmoothingEnabled = false;
            break;
        default:
            ctx.filter = 'none';
            ctx.imageSmoothingEnabled = true;
    }
}

// Initialize MediaPipe Hands
function initializeHands() {
    hands = new Hands({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});
    
    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });
    
    hands.onResults(onResults);
}

// Process hand tracking results
function onResults(results) {
    // Clear canvases
    outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Draw video frame to output canvas
    outputCtx.drawImage(results.image, 0, 0, outputCanvas.width, outputCanvas.height);
    
    const width = outputCanvas.width;
    const height = outputCanvas.height;
    
    let portalPoints = [];
    let changeFilter = false;
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks;
        
        // Check for filter change gesture (thumb & pinky close)
        for (const handLandmarks of landmarks) {
            const thumb = handLandmarks[4];
            const pinky = handLandmarks[20];
            
            const thumbX = thumb.x * width;
            const thumbY = thumb.y * height;
            const pinkyX = pinky.x * width;
            const pinkyY = pinky.y * height;
            
            const distance = Math.sqrt(Math.pow(thumbX - pinkyX, 2) + Math.pow(thumbY - pinkyY, 2));
            
            if (distance < 40) {
                changeFilter = true;
            }
        }
        
        // Alternative gesture: index fingers from both hands close
        if (landmarks.length >= 2) {
            const index1 = landmarks[0][8];
            const index2 = landmarks[1][8];
            
            const idx1X = index1.x * width;
            const idx1Y = index1.y * height;
            const idx2X = index2.x * width;
            const idx2Y = index2.y * height;
            
            const distance = Math.sqrt(Math.pow(idx1X - idx2X, 2) + Math.pow(idx1Y - idx2Y, 2));
            
            if (distance < 40) {
                changeFilter = true;
            }
        }
        
        // Handle filter change
        if (changeFilter) {
            if (!gestureTriggered) {
                currentFilter = (currentFilter + 1) % filters.length;
                currentFilterEl.textContent = filters[currentFilter];
                gestureTriggered = true;
            }
        } else {
            gestureTriggered = false;
        }
        
        // Collect portal points (thumb and index from both hands)
        for (const handLandmarks of landmarks) {
            const thumb = handLandmarks[4];
            const index = handLandmarks[8];
            
            const thumbX = Math.round(thumb.x * width);
            const thumbY = Math.round(thumb.y * height);
            const indexX = Math.round(index.x * width);
            const indexY = Math.round(index.y * height);
            
            portalPoints.push([thumbX, thumbY]);
            portalPoints.push([indexX, indexY]);
            
            // Draw points
            outputCtx.fillStyle = '#ffff00';
            outputCtx.beginPath();
            outputCtx.arc(thumbX, thumbY, 8, 0, Math.PI * 2);
            outputCtx.fill();
            
            outputCtx.beginPath();
            outputCtx.arc(indexX, indexY, 8, 0, Math.PI * 2);
            outputCtx.fill();
        }
        
        // Create portal if we have 4 points
        if (portalPoints.length === 4) {
            // Sort points by Y coordinate
            portalPoints.sort((a, b) => a[1] - b[1]);
            
            const topPoints = portalPoints.slice(0, 2);
            const bottomPoints = portalPoints.slice(2);
            
            // Sort top and bottom by X
            topPoints.sort((a, b) => a[0] - b[0]);
            bottomPoints.sort((a, b) => a[0] - b[0]);
            
            // Create polygon points
            const polyPoints = [
                topPoints[0],
                topPoints[1],
                bottomPoints[1],
                bottomPoints[0]
            ];
            
            // Calculate bounding box
            const allX = polyPoints.map(p => p[0]);
            const allY = polyPoints.map(p => p[1]);
            const minX = Math.max(0, Math.min(...allX));
            const minY = Math.max(0, Math.min(...allY));
            const maxX = Math.min(width, Math.max(...allX));
            const maxY = Math.min(height, Math.max(...allY));
            const boxWidth = maxX - minX;
            const boxHeight = maxY - minY;
            
            if (boxWidth > 0 && boxHeight > 0) {
                // Get ROI
                const imageData = outputCtx.getImageData(minX, minY, boxWidth, boxHeight);
                
                // Apply filter
                const filterName = filters[currentFilter];
                
                if (filterName === "PIXELATE") {
                    // Pixelate effect
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    const scale = 0.1;
                    tempCanvas.width = Math.max(1, Math.floor(boxWidth * scale));
                    tempCanvas.height = Math.max(1, Math.floor(boxHeight * scale));
                    
                    tempCtx.drawImage(outputCanvas, minX, minY, boxWidth, boxHeight, 0, 0, tempCanvas.width, tempCanvas.height);
                    
                    outputCtx.imageSmoothingEnabled = false;
                    outputCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, minX, minY, boxWidth, boxHeight);
                    outputCtx.imageSmoothingEnabled = true;
                } else if (filterName === "BLUR") {
                    // Blur effect
                    outputCtx.filter = 'blur(15px)';
                    outputCtx.drawImage(outputCanvas, minX, minY, boxWidth, boxHeight, minX, minY, boxWidth, boxHeight);
                    outputCtx.filter = 'none';
                } else {
                    // Pixel-based filters
                    const filteredData = applyFilter(imageData, filterName);
                    outputCtx.putImageData(filteredData, minX, minY);
                }
                
                // Draw portal outline
                outputCtx.strokeStyle = '#ffffff';
                outputCtx.lineWidth = 3;
                outputCtx.beginPath();
                outputCtx.moveTo(polyPoints[0][0], polyPoints[0][1]);
                for (let i = 1; i < polyPoints.length; i++) {
                    outputCtx.lineTo(polyPoints[i][0], polyPoints[i][1]);
                }
                outputCtx.closePath();
                outputCtx.stroke();
                
                // Add glow particles
                for (let i = 0; i < 4; i++) {
                    const pt1 = polyPoints[i];
                    const pt2 = polyPoints[(i + 1) % 4];
                    for (let j = 0; j < 5; j++) {
                        const alpha = Math.random();
                        const px = Math.round(pt1[0] * alpha + pt2[0] * (1 - alpha)) + Math.floor(Math.random() * 30 - 15);
                        const py = Math.round(pt1[1] * alpha + pt2[1] * (1 - alpha)) + Math.floor(Math.random() * 30 - 15);
                        
                        outputCtx.fillStyle = '#00ffff';
                        outputCtx.beginPath();
                        outputCtx.arc(px, py, Math.random() * 3 + 1, 0, Math.PI * 2);
                        outputCtx.fill();
                    }
                }
                
                // Draw filter name
                outputCtx.fillStyle = '#ffffff';
                outputCtx.font = 'bold 20px Arial';
                outputCtx.fillText(`PORTAL: ${filterName}`, topPoints[0][0], topPoints[0][1] - 15);
            }
        }
    }
    
    // Draw overlay text
    outputCtx.fillStyle = '#ffffff';
    outputCtx.font = '16px Arial';
    outputCtx.fillText('Ganti Filter: Jempol & Kelingking', 10, 30);
    outputCtx.fillStyle = '#00ffff';
    outputCtx.fillText(`Filter Aktif: ${filters[currentFilter]}`, 10, 55);
}

// Start camera
async function startCamera() {
    try {
        loading.classList.remove('hidden');
        startBtn.disabled = true;
        
        // Initialize MediaPipe Hands
        initializeHands();
        
        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            }
        });
        
        video.srcObject = stream;
        
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve();
            };
        });
        
        // Set canvas dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        outputCanvas.width = video.videoWidth;
        outputCanvas.height = video.videoHeight;
        
        // Generate galaxy background
        galaxyBg = generateGalaxyBackground(canvas.width, canvas.height);
        
        // Start camera processing
        camera = new Camera(video, {
            onFrame: async () => {
                await hands.send({image: video});
            },
            width: 1280,
            height: 720
        });
        
        await camera.start();
        
        loading.classList.add('hidden');
        isRunning = true;
        startBtn.textContent = 'Kamera Aktif';
        
    } catch (err) {
        console.error('Error starting camera:', err);
        loading.classList.add('hidden');
        startBtn.disabled = false;
        
        let errorMsg = 'Gagal mengakses kamera. ';
        if (err.name === 'NotAllowedError') {
            errorMsg += 'Silakan izinkan akses kamera di browser Anda.';
        } else if (err.name === 'NotFoundError') {
            errorMsg += 'Tidak ada kamera yang ditemukan.';
        } else {
            errorMsg += err.message;
        }
        
        error.textContent = errorMsg;
        error.classList.remove('hidden');
        
        setTimeout(() => {
            error.classList.add('hidden');
        }, 5000);
    }
}

// Event listeners
startBtn.addEventListener('click', startCamera);

// Handle window resize
window.addEventListener('resize', () => {
    if (isRunning && video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        outputCanvas.width = video.videoWidth;
        outputCanvas.height = video.videoHeight;
        galaxyBg = generateGalaxyBackground(canvas.width, canvas.height);
    }
});
