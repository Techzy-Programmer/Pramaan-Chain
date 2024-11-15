# Check for Node.js installation
try {
    $null = node -v
} catch {
    Write-Error "Error: Node.js is not installed. Please install Node.js first."
    Read-Host "Press Enter to exit"
    exit 1
}

# Set installation directory using $env:USERPROFILE
$installDir = Join-Path $env:USERPROFILE ".pch"

# Create the installation directory if it doesn't exist
if (-not (Test-Path -Path $installDir)) {
    try {
        New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    } catch {
        Write-Error "Error: Failed to create installation directory."
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Define URLs
$scriptUrl = "https://dl.pramaan-chain.tech/index.js"
$pkgUrl = "https://dl.pramaan-chain.tech/package.json"

# Download the script and package.json
Write-Host "Downloading script & its dependencies..."
try {
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $scriptUrl -OutFile (Join-Path $installDir "main.js")
    Invoke-WebRequest -Uri $pkgUrl -OutFile (Join-Path $installDir "package.json")
} catch {
    Write-Error "Error: Failed to download the script. Please check your internet connection and try again."
    Read-Host "Press Enter to exit"
    exit 1
}

# Create the PowerShell script to run the Node.js script
Write-Host "Creating executable..."
$scriptContent = @"
@echo off
node "%~dp0main.js" %*
"@

try {
    Set-Content -Path (Join-Path $installDir "pch.bat") -Value $scriptContent
} catch {
    Write-Error "Error: Failed to create executable."
    Read-Host "Press Enter to exit"
    exit 1
}

# Add to PATH
Write-Host "Adding installation directory to PATH..."
$currentUserPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")

if ($currentUserPath) {
    if ($currentUserPath -notlike "*$installDir*") {
        $newPath = "$currentUserPath;$installDir"
        try {
            [System.Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
        } catch {
            Write-Warning "Warning: Failed to update PATH. You may need to add '$installDir' to your PATH manually."
        }
    }
} else {
    try {
        [System.Environment]::SetEnvironmentVariable("PATH", $installDir, "User")
    } catch {
        Write-Warning "Warning: Failed to update PATH. You may need to add '$installDir' to your PATH manually."
    }
}

Write-Host "`nInstallation completed successfully!`n"
Write-Host "Please restart your PowerShell session and try running 'pch -v'"
Write-Host "to verify the installation.`n"

Read-Host "Press Enter to exit"
