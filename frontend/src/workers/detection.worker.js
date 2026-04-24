import * as ort from 'onnxruntime-web';

let session = null;
const labels = ["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"];

async function loadModel() {
  try {
    // Using local model path. User must place yolov8n.onnx in public/models/
    // Try WebGPU first, then WebGL, then WASM
    session = await ort.InferenceSession.create('/models/yolov8n.onnx', {
      executionProviders: ['webgpu', 'webgl', 'wasm'],
      graphOptimizationLevel: 'all'
    });
    self.postMessage({ type: 'LOADED' });
  } catch (e) {
    self.postMessage({ type: 'ERROR', error: e.message });
  }
}

function iou(box1, box2) {
  const [x1, y1, w1, h1] = box1;
  const [x2, y2, w2, h2] = box2;
  const x_overlap = Math.max(0, Math.min(x1 + w1, x2 + w2) - Math.max(x1, x2));
  const y_overlap = Math.max(0, Math.min(y1 + h1, y2 + h2) - Math.max(y1, y2));
  const intersection = x_overlap * y_overlap;
  const union = w1 * h1 + w2 * h2 - intersection;
  return intersection / union;
}

function nonMaxSuppression(boxes, scores, iouThreshold) {
  const indices = scores
    .map((score, i) => ({ score, i }))
    .sort((a, b) => b.score - a.score)
    .map(v => v.i);

  const kept = [];
  while (indices.length > 0) {
    const current = indices.shift();
    kept.push(current);
    for (let i = 0; i < indices.length; i++) {
      if (iou(boxes[current], boxes[indices[i]]) > iouThreshold) {
        indices.splice(i, 1);
        i--;
      }
    }
  }
  return kept;
}

async function detect(buffer, threshold, iouThreshold) {
  if (!session) return;

  // Convert Uint8Array buffer back to Float32Array [1, 3, 640, 640]
  const data = new Uint8ClampedArray(buffer);
  const float32Data = new Float32Array(3 * 640 * 640);
  for (let i = 0; i < data.length / 4; i++) {
    float32Data[i] = data[i * 4] / 255.0; // R
    float32Data[i + 640 * 640] = data[i * 4 + 1] / 255.0; // G
    float32Data[i + 2 * 640 * 640] = data[i * 4 + 2] / 255.0; // B
  }

  const imageTensor = new ort.Tensor('float32', float32Data, [1, 3, 640, 640]);
  const feeds = { images: imageTensor };
  const results = await session.run(feeds);
  const output = results.output0.data; // [1, 84, 8400]

  const boxes = [];
  const scores = [];
  const classIds = [];

  // YOLOv8 output: [x, y, w, h, class0, class1, ...] 
  // We need to transpose the [84, 8400] to [8400, 84]
  for (let i = 0; i < 8400; i++) {
    let maxScore = 0;
    let classId = -1;
    
    // Find best class
    for (let j = 4; j < 84; j++) {
        const score = output[j * 8400 + i];
        if (score > maxScore) {
            maxScore = score;
            classId = j - 4;
        }
    }

    if (maxScore > threshold) {
      const x = output[0 * 8400 + i];
      const y = output[1 * 8400 + i];
      const w = output[2 * 8400 + i];
      const h = output[3 * 8400 + i];

      // Convert from center-x, center-y, w, h to top-left-x, top-left-y, w, h
      boxes.push([x - w / 2, y - h / 2, w, h]);
      scores.push(maxScore);
      classIds.push(classId);
    }
  }

  const indices = nonMaxSuppression(boxes, scores, iouThreshold);
  
  const finalDetections = indices.map(idx => ({
    label: labels[classIds[idx]],
    confidence: scores[idx],
    bbox: boxes[idx]
  }));

  self.postMessage({ type: 'RESULTS', detections: finalDetections });
}

self.onmessage = async (e) => {
  const { type, data } = e.data;
  if (type === 'LOAD') {
    await loadModel();
  } else if (type === 'DETECT') {
    const { buffer, threshold, iouThreshold } = data;
    await detect(buffer, threshold, iouThreshold);
  }
};
