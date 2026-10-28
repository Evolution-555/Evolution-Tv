@echo off
REM Build script for Evolution TV (Windows)
REM Requires webOS CLI to be installed

echo Building Evolution TV for LG webOS...

REM Check if ares-package is available
where ares-package >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: ares-package not found. Install webOS CLI:
    echo npm install -g @webosose/ares-cli
    exit /b 1
)

REM Package the app
echo Packaging app...
ares-package .

if %ERRORLEVEL% EQU 0 (
    echo Build successful!
    echo IPK file created in the current directory.
) else (
    echo Build failed!
    exit /b 1
)
