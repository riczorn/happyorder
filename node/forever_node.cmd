@echo off

rem ; HappyOrder - vedi il README.txt
rem ; Batch per l'avvio da Windows
rem ; forever riavvia node se per qualche motivo dovesse morire.
rem ; per installare forever: dopo aver installato node:
rem ; $> npm install forever -g

rem ; test if using D: or C: drive

rem vol would be best as it does never raise warnings on empty SD card readers
rem and other non-desired fail situations; but it is inconsistent across operating
rem systems (XP SP3 and PosReady seem not to support it, but XP sp2 and Win7/10 do?)
rem vol d: >nul 2>nul
rem if errorlevel 1 (

if exist d:\ (
    echo Uso il disco D:
    d:
) else (
    echo Uso il disco C:
    c:
)

cd \unikas\bin\nodejs

rem ; windows kill any running node processes:

\unikas\bin\toolz\pskill.exe node

rem ; linux  : killall node    oppure     killall nodejs (guarda con ps aux)

forever dist/main.js
