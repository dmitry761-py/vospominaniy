$downloadDir = "E:\photo"
$renderBaseUrl = "https://vospominaniy.onrender.com"
$photoListUrl = "$renderBaseUrl/photos-list"
$photoDownloadUrl = "$renderBaseUrl/photos"

# Создаем папку, если ее нет
if (-not (Test-Path $downloadDir)) {
    New-Item -Path $downloadDir -ItemType Directory -Force
    Write-Host "Создана папка: $downloadDir"
}

Write-Host "Скрипт запущен. Скачиваем фото каждые 3 минуты..."

try {
    while ($true) {
        try {
            Write-Host "$(Get-Date) - Получаю список фото..."
            $fileListJson = Invoke-WebRequest -Uri $photoListUrl -UseBasicParsing | Select-Object -ExpandProperty Content
            $fileNames = $fileListJson | ConvertFrom-Json

            if ($fileNames.Count -eq 0) {
                Write-Host "Список фото пуст."
            } else {
                foreach ($fileName in $fileNames) {
                    $localFilePath = Join-Path -Path $downloadDir -ChildPath $fileName
                    $remoteFileUrl = "$photoDownloadUrl/$fileName"

                    if (-not (Test-Path $localFilePath)) {
                        Write-Host "Скачиваю $fileName..."
                        Invoke-WebRequest -Uri $remoteFileUrl -OutFile $localFilePath -UseBasicParsing
                        Write-Host "Сохранено: $localFilePath"
                    } else {
                        Write-Host "$fileName уже существует. Пропускаю."
                    }
                }
            }
        } catch {
            Write-Host "Ошибка при скачивании фото: $($_.Exception.Message)"
        }

        Write-Host "Следующее скачивание через 3 минуты..."
        Start-Sleep -Seconds 180 # Ждем 3 минуты (180 секунд)
    }
} finally {
    Write-Host "Скрипт завершил работу или столкнулся с неустранимой ошибкой. Нажмите Enter для выхода..."
    Read-Host
} 