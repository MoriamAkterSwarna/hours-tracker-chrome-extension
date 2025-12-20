# Create placeholder PNG icons for Chrome Extension
# Minimal valid PNG files (1x1 pixel blue)

$iconsDir = "icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir
}

# Minimal valid PNG (1x1 blue pixel) as base64
$pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Decode and write for each size
@(16, 48, 128) | ForEach-Object {
    $size = $_
    $iconPath = Join-Path $iconsDir "icon$size.png"
    $bytes = [Convert]::FromBase64String($pngBase64)
    [System.IO.File]::WriteAllBytes($iconPath, $bytes)
    Write-Host "Created $iconPath"
}

Write-Host "All icons created successfully!"
