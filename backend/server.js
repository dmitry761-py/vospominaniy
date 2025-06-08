const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Конфигурация
const config = {
  uploadDir: path.normalize('E:/photo'), // Нормализуем путь
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedExtensions: ['.jpg', '.jpeg']
};

// Создаем папку для загрузок, если её нет
if (!fs.existsSync(config.uploadDir)) {
  try {
    fs.mkdirSync(config.uploadDir, { recursive: true });
    console.log(`Создана папка для загрузок: ${config.uploadDir}`);
  } catch (err) {
    console.error('Ошибка создания папки для загрузок:', err);
    process.exit(1);
  }
}

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json({ limit: config.maxFileSize }));

// Проверка валидности имени файла
function isValidFilename(filename) {
  const ext = path.extname(filename).toLowerCase();
  return config.allowedExtensions.includes(ext) && 
         !filename.includes('..') && 
         /^[a-zA-Z0-9_-]+\.(jpg|jpeg)$/.test(filename);
}

// Эндпоинт для получения списка всех фото
app.get('/photos-list', (req, res) => {
  try {
    if (!fs.existsSync(config.uploadDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(config.uploadDir)
      .filter(file => config.allowedExtensions.includes(path.extname(file).toLowerCase()))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(config.uploadDir, a));
        const statB = fs.statSync(path.join(config.uploadDir, b));
        return statB.mtime.getTime() - statA.mtime.getTime();
      });
    res.json(files);
  } catch (err) {
    console.error('Ошибка при получении списка фото:', err);
    res.status(500).json({ error: 'Ошибка при получении списка фото' });
  }
});

// Эндпоинт для получения конкретного фото
app.get('/photos/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    
    if (!isValidFilename(filename)) {
      return res.status(400).json({ error: 'Недопустимое имя файла' });
    }

    const filepath = path.join(config.uploadDir, filename);
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Фото не найдено' });
    }
    
    res.sendFile(filepath);
  } catch (err) {
    console.error('Ошибка при получении фото:', err);
    res.status(500).json({ error: 'Ошибка при получении фото' });
  }
});

// Эндпоинт для загрузки фото
app.post('/upload', async (req, res) => {
  try {
    if (!req.body.image || typeof req.body.image !== 'string') {
      return res.status(400).json({ error: 'Отсутствуют данные изображения' });
    }

    const base64Data = req.body.image.split(',')[1];
    if (!base64Data) {
      return res.status(400).json({ error: 'Неверный формат данных изображения' });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length > config.maxFileSize) {
      return res.status(400).json({ error: 'Размер файла превышает допустимый' });
    }

    const filename = `photo_${Date.now()}.jpg`;
    const filepath = path.join(config.uploadDir, filename);

    fs.writeFileSync(filepath, buffer);
    console.log(`Сохранено фото: ${filename}`);

    // Возвращаем полный URL для доступа к фото
    const photoUrl = `/photos/${filename}`;
    res.json({ 
      success: true, 
      filename,
      url: photoUrl
    });
  } catch (err) {
    console.error('Ошибка при сохранении фото:', err);
    res.status(500).json({ error: 'Ошибка при сохранении фото' });
  }
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));