@echo off
echo ====================================================
echo Pushing Manikkavel-S Profile README to GitHub...
echo ====================================================
cd /d "%~dp0"
git remote remove origin 2>nul
git remote add origin https://github.com/Manikkavel-S/Manikkavel-S.git
git branch -M main
git add .
git commit -m "feat: redesign GitHub profile README with real verified data" 2>nul
git push -u origin main
echo.
echo ====================================================
echo Done! Check your profile at: https://github.com/Manikkavel-S
echo ====================================================
pause
