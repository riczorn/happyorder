#!/bin/bash
# HappyOrder - vedi il README.txt
# Batch per l'avvio da Linux
# forever riavvia node se per qualche motivo dovesse morire.
# per installare forever: dopo aver installato node:
# $> npm install forever -g

# cd ./unikas/bin/nodejs

# windows kill any running node processes:

# /unikas/bin/toolz/pskill.exe node

# linux  : killall node    oppure     killall nodejs (guarda con ps aux)
killall node nodejs

forever dist/main.js
