# VS Code & Copilot Performans Rehberi

## 🚀 Hızlı Çözümler

### 1. **VS Code Yeniden Başlatma**
```
Ctrl+Shift+P → "Developer: Reload Window"
```

### 2. **Copilot High Demand Çözümleri**

#### Yöntem A: Copilot Logout/Login
```
Ctrl+Shift+P → "GitHub Copilot: Sign Out"
Ctrl+Shift+P → "GitHub Copilot: Sign In"
```

#### Yöntem B: Extension Restart
```
Ctrl+Shift+P → "Developer: Reload Window With Extensions Disabled"
Sonra extensions'ları tek tek aktifleştir
```

#### Yöntem C: Copilot Ayarları
VS Code Settings'e ekle:
```json
{
  "github.copilot.enable": {
    "*": true,
    "markdown": false,
    "plaintext": false
  }
}
```

### 3. **Memory Optimizasyonu**

#### Windows Memory Clear
```powershell
# PowerShell'de çalıştır:
Get-Process code | Stop-Process -Force
Start-Sleep 2
code .
```

#### Node.js Memory Artırma
```bash
# Terminal'de:
export NODE_OPTIONS="--max-old-space-size=8192"
```

### 4. **Extension Temizliği**

#### Gereksiz Extensions'ları Kaldır:
- Kullanmadığınız dil extensions'ları
- Eski theme'ler
- Duplicate functionality extensions

#### Önerilen Minimum Extensions:
- GitHub Copilot
- ES Lint
- TypeScript
- Git Lens (opsiyonel)

### 5. **Disk Temizliği**

#### Workspace Temizliği:
```powershell
# Node modules temizle
Remove-Item node_modules -Recurse -Force
npm install

# VS Code workspace temizle
Remove-Item .vscode -Recurse -Force -ErrorAction SilentlyContinue
```

### 6. **Alternative Solutions**

#### Copilot Alternative:
- Cursor Editor (AI-powered)
- GitHub.dev (browser)
- Smaller workspace'ler

#### Performance Monitoring:
```
Ctrl+Shift+P → "Developer: Show Running Extensions"
```

## ⚡ Acil Durum Çözümleri

### VS Code Crash Olduğunda:
1. Task Manager'dan tüm `Code.exe` process'lerini öldür
2. `%APPDATA%\Code\User\workspaceStorage` klasörünü temizle
3. VS Code'u yeniden başlat

### Copilot Çalışmadığında:
1. GitHub hesabının active olduğunu kontrol et
2. VPN kullanıyorsan kapat
3. Antivirus'ün VS Code'u bloklamadığını kontrol et

## 💡 Öneriler

- **RAM:** Minimum 8GB, ideal 16GB
- **SSD:** VS Code'u SSD'ye kurun
- **Internet:** Stable bağlantı (Copilot için)
- **Extensions:** Maximum 10-15 extension
- **Workspace:** Büyük projeleri parçalara bölün
