const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Папка для сохранения фото на диске D:
const uploadDir = 'D:/photo';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(express.static(path.join(__dirname, '../public')));
app.use('/photos', express.static('D:/photo'));
app.use(express.json({ limit: '5mb' }));

app.post('/upload', async (req, res) => {
  try {
    const imageBase64 = req.body.image.split(',')[1];
    const buffer = Buffer.from(imageBase64, 'base64');
    const filename = `photo_${Date.now()}.jpg`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, buffer);

    res.json({ success: true, filename: `/photos/${filename}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для получения списка всех jpg-файлов
app.get('/photos-list', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const jpgFiles = files.filter(f => f.endsWith('.jpg'));
    res.json(jpgFiles);
  });
});

app.listen(PORT, () => console.log('Server running on http://localhost:${PORT}'));