# HappyOrder - vedi il README.txt

echo 'Development mode: nodemon (tracks file changes before restart)'
happyFolder=/rixx/DeV/HappyOrder
cd "$happyFolder/node"
nodemon dist/main.js

# echo Production mode: use forever:
# forever dist/main.js

#killall gulp
