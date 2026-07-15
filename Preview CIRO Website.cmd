@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0preview-ciro.ps1"
if errorlevel 1 (
  echo.
  echo The CIRO preview could not be opened.
  pause
)
