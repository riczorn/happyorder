# HappyOrder - vedi il README.txt

echo "Running gulp for transpiling typescript"
echo 'Development mode: nodemon (tracks file changes before restart)'
killall gulp
gulp watch &
nodemon dist/main.js

# echo Production mode: use forever:
# forever dist/main.js

#killall gulp
