echo "Launch HappyOrder dev"

happyFolder=/rixx/DeV/HappyOrder

echo Launch HappyOrder dev from $happyFolder
echo "Transpile Node ==================================="

cd "$happyFolder/node"
exo-open --working-directory "`pwd`" --launch TerminalEmulator $happyFolder/node/start-ts-watch.sh

echo "Launch Node ==================================="

cd "$happyFolder/node"
exo-open --working-directory "`pwd`" --launch TerminalEmulator $happyFolder/node/start-nodemon.sh


echo "Ionic serve ==================================="

cd $happyFolder/HappyOrder
exo-open --working-directory "`pwd`" --launch TerminalEmulator $happyFolder/node/ionic.sh
cd ..


echo "done ==================================="


