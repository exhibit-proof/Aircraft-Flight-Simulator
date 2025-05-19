@echo off
set "parentProcessName=x3d_html_runner"
for /f "usebackq tokens=2 delims==" %%a in (`wmic process where "name='%parentProcessName%'" get parentprocessid /value`) do set "parentPid=%%~a"
for /f "usebackq tokens=2 delims==" %%a in (`wmic process where "parentprocessid='%parentPid%'" get processid /value`) do taskkill /f /pid %%~a