@echo off
REM Publish the songs listed in site_songs.txt to the site (copies audio+covers, rebuilds songs.js).
cd /d "%~dp0.."
"C:\Users\Scott\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.10_qbz5n2kfra8p0\python.exe" "tools\build_music.py"
echo.
echo Done. Review the changes, then push to publish:
echo    git add songs.js assets/music  ^&^&  git commit -m "update music"  ^&^&  git push
pause
