// scripts/gestures.js
export function initGestures(videoEl, onGesture) {
  const hands = new Hands({ locateFile: f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
  hands.setOptions({ maxNumHands:1, minDetectionConfidence:0.7, minTrackingConfidence:0.7 });
  hands.onResults(res=>{
    if (!res.multiHandLandmarks) return;
    const lm = res.multiHandLandmarks[0];
    // рассчитываем pinch‑dist, swipe‑векторы, считываем «OK» (три пальца вместе) и т.д.
    const thumb = lm[4], index = lm[8], middle=lm[12];
    const dx=(thumb.x-index.x)*window.innerWidth;
    const dy=(thumb.y-index.y)*window.innerHeight;
    const dist = Math.hypot(dx,dy);
    if (dist<40) {
      const x = (thumb.x+index.x)/2*window.innerWidth;
      const y = (thumb.y+index.y)/2*window.innerHeight;
      onGesture('pinch', x, y);
    }
    // TODO: swipe, expand, OK‑gesture и пр.
  });
  new Camera(videoEl, { onFrame:()=>hands.send({ image:videoEl }), width:640, height:480 }).start();
}
