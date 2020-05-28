#!/bin/bash
sourcedir=/rixx/DeV/HappyOrder/node
cd $sourcedir

rsync -ave ssh * root@s10.tmg.it:/opt/happy/src/

echo -e "Watching $sourcedir for changes\n----------------------------------"
sleep 1
/usr/bin/inotifywait -r -m -e modify $sourcedir |
  while read path _ file; do
	echo "  >> $path$file modified, invoking push <<"
	cd $sourcedir
    rsync -ave ssh * root@s10.tmg.it:/opt/happy/src/
	# exit
  done
echo "exiting now"
sleep 2
