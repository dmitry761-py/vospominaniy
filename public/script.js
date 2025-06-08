const cameraBtn = document.getElementById('cameraBtn');
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const canvas = document.getElementById('canvas');
const result = document.getElementById('result');
const filterSelect = document.getElementById('filterSelect');
const vkShare = document.getElementById('vkShare');
const tgShare = document.getElementById('tgShare');
const waShare = document.getElementById('waShare');

let currentFilter = 'none';

if (filterSelect) {
  filterSelect.addEventListener('change', () => {
    currentFilter = filterSelect.value;
    video.style.filter = currentFilter;
  });
}

cameraBtn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    document.getElementById('cameraContainer').hidden = false;
    video.style.filter = currentFilter;
  } catch (err) {
    alert('Ошибка доступа к камере: ' + err.message);
  }
});

captureBtn.addEventListener('click', async () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.filter = currentFilter;
  ctx.drawImage(video, 0, 0);
  const imageData = canvas.toDataURL('image/jpeg');
  result.textContent = 'Загрузка...';
  try {
    const res = await fetch('/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData })
    });
    const data = await res.json();
    if (data.success) {
      result.innerHTML = `Фото сохранено: <a href="${data.filename}" target="_blank">${data.filename}</a>`;
    } else {
      result.textContent = 'Ошибка: ' + (data.error || 'Неизвестно');
    }
  } catch (e) {
    result.textContent = 'Ошибка отправки: ' + e.message;
  }
  canvas.hidden = false;
});

// Заглушки для кнопок шаринга (ссылки добавите позже)
vkShare.addEventListener('click', () => {
  alert('Ссылка для VK будет добавлена позже');
});
tgShare.addEventListener('click', () => {
  alert('Ссылка для Telegram будет добавлена позже');
});
waShare.addEventListener('click', () => {
  alert('Ссылка для WhatsApp будет добавлена позже');
}); 