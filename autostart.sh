#! /bin/bash

# change this
EDITOUR_PATH="/home/username/editour"

printUsage() {
	echo "autostart.sh usage:"
	echo -e "  autostart.sh start\tstarts the node daemon"
	echo -e "  autostart.sh stop\tstops the node daemon"
}

if [ $# -lt 1 ]
then
	printUsage
	exit 1
fi

if [ $1 == "start" ]
then
	echo "autostart.sh starting..."
	"./node_modules/.bin/forever" start -a -l $EDITOUR_PATH/logs/forever.log -o $EDITOUR_PATH/logs/editour.log -e $EDITOUR_PATH/logs/error.log --sourceDir $EDITOUR_PATH index.js
	exit 0
elif [ $1 == "stop" ]
then
	echo "autostart.sh stopping..."
	"./node_modules/.bin/forever" stop $EDITOUR_PATH/index.js
	exit 0
else
	printUsage
	exit 1
fi
