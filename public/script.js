const cameraBtn = document.getElementById('cameraBtn');
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const canvas = document.getElementById('canvas');
const result = document.getElementById('result');
const filterSelect = document.getElementById('filterSelect');
const vkShare = document.getElementById('vkShare');
const tgShare = document.getElementById('tgShare');
const waShare = document.getElementById('waShare');
const cameraSelect = document.getElementById('cameraSelect');

let currentFilter = 'none';
let currentFacingMode = 'user';

if (filterSelect) {
  filterSelect.addEventListener('change', () => {
    currentFilter = filterSelect.value;
    applyFilter();
  });
}

if (cameraSelect) {
  cameraSelect.addEventListener('change', () => {
    currentFacingMode = cameraSelect.value;
    startCamera();
  });
}

async function startCamera() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => track.stop());
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode } });
    video.srcObject = stream;
    window.stream = stream;
    document.getElementById('cameraContainer').hidden = false;
    applyFilter();
  } catch (err) {
    alert('Ошибка доступа к камере: ' + err.message);
  }
}

function applyFilter() {
  switch (currentFilter) {
    case 'gta':
      video.style.filter = 'contrast(1.5) saturate(1.8) sepia(0.4)';
      break;
    case 'retro':
      video.style.filter = 'sepia(0.7) hue-rotate(-20deg) contrast(1.2)';
      break;
    case 'tokio':
      video.style.filter = 'hue-rotate(200deg) saturate(2) brightness(1.1)';
      break;
    case 'peaky':
      video.style.filter = 'grayscale(1) contrast(1.3) brightness(0.9)';
      break;
    default:
      video.style.filter = 'none';
  }
}

cameraBtn.addEventListener('click', startCamera);

captureBtn.addEventListener('click', async () => {
  try {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Применяем выбранный фильтр
    switch (currentFilter) {
      case 'gta':
        ctx.filter = 'contrast(1.5) saturate(1.8) sepia(0.4)';
        break;
      case 'retro':
        ctx.filter = 'sepia(0.7) hue-rotate(-20deg) contrast(1.2)';
        break;
      case 'tokio':
        ctx.filter = 'hue-rotate(200deg) saturate(2) brightness(1.1)';
        break;
      case 'peaky':
        ctx.filter = 'grayscale(1) contrast(1.3) brightness(0.9)';
        break;
      default:
        ctx.filter = 'none';
    }
    
    // Делаем снимок
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9); // Устанавливаем качество JPEG
    
    // Показываем статус загрузки
    result.textContent = 'Загрузка...';
    canvas.hidden = false;
    
    // Отправляем фото на сервер
    const res = await fetch('/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Ошибка загрузки фото');
    }
    
    const data = await res.json();
    if (data.success) {
      // Создаем ссылку на фото с полным URL
      const photoUrl = data.url;
      result.innerHTML = `Фото сохранено: <a href="${photoUrl}" target="_blank">Открыть фото</a>`;
      
      // Обновляем ссылки для шаринга
      const shareUrl = window.location.origin + photoUrl;
      vkShare.href = `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}`;
      tgShare.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`;
      waShare.href = `https://wa.me/?text=${encodeURIComponent(shareUrl)}`;
    } else {
      throw new Error(data.error || 'Неизвестная ошибка');
    }
  } catch (e) {
    console.error('Ошибка при сохранении фото:', e);
    result.textContent = 'Ошибка: ' + e.message;
  }
});

// Обновляем обработчики кнопок шаринга
vkShare.addEventListener('click', (e) => {
  if (vkShare.href === 'https://vospominaniy.onrender.com') {
    e.preventDefault();
    alert('Сначала сделайте фото');
  }
});

tgShare.addEventListener('click', (e) => {
  if (tgShare.href === 'https://vospominaniy.onrender.com') {
    e.preventDefault();
    alert('Сначала сделайте фото');
  }
});

waShare.addEventListener('click', (e) => {
  if (waShare.href === 'https://vospominaniy.onrender.com') {
    e.preventDefault();
    alert('Сначала сделайте фото');
  }
}); 