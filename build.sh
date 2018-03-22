if [ "a$1" = "a" ]; then
  echo Usage build.sh 1.1.0
  exit
fi

happyFolder=/rixx/DeV/HappyOrder
version=$1

echo Building HappyOrder v.$1 from $happyFolder
echo "Node ==================================="

cd "$happyFolder"
cd node
gulp scripts
cd ..

echo "APK ==================================="

cd HappyOrder
./build.sh $version
cd ..

echo "electron ==================================="

cd electron
./build.sh $version
cd ..

echo "done ==================================="


