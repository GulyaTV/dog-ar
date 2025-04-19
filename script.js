// script.js
const videoElement = document.getElementById('camera');
const buttons = document.querySelectorAll('.mixdog-btn');

// 1) Запускаем камеру
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then(stream => videoElement.srcObject = stream)
  .catch(console.error);

// 2) Настраиваем MediaPipe Hands
const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});
hands.onResults(onHandsResults);

// 3) Подключаем камеру к MediaPipe
new Camera(videoElement, {
  onFrame: async () => await hands.send({ image: videoElement }),
  width: 640, height: 480
}).start();

// 4) Обработка результатов жестов
let pinchDown = false;
function onHandsResults(results) {
  if (!results.multiHandLandmarks || !results.multiHandLandmarks.length) {
    resetButtons();
    pinchDown = false;
    return;
  }
  const lm = results.multiHandLandmarks[0];
  // концы большого (4) и указательного (8) пальцев
  const thumb = lm[4]; 
  const index = lm[8];
  const dx = (thumb.x - index.x) * window.innerWidth;
  const dy = (thumb.y - index.y) * window.innerHeight;
  const dist = Math.hypot(dx, dy);

  // координаты центра «пинча»
  const cx = (thumb.x + index.x) / 2 * window.innerWidth;
  const cy = (thumb.y + index.y) / 2 * window.innerHeight;

  const THRESH = 40; // пиксели
  if (dist < THRESH) {
    // начало «тапа»
    if (!pinchDown) {
      pinchDown = true;
      tryClick(cx, cy);
    }
  } else {
    pinchDown = false;
    resetButtons();
  }
}

// 5) Пробуем «кликнуть» по элементу в точке (cx,cy)
function tryClick(x, y) {
  const el = document.elementFromPoint(x, y);
  if (el && el.classList.contains('mixdog-btn')) {
    el.classList.add('active');
    // тут можно вызвать приложение
    console.log(`Activated ${el.id}`);
    // например, window.location = `${el.id}.html`;
  }
}

// 6) Сброс состояния кнопок
function resetButtons() {
  buttons.forEach(b => b.classList.remove('active'));
}
