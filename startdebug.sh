#!/usr/bin/env bash

# only works if mongod is running. if it fails, run "sudo mongod &"

pkill node;
mate-terminal --maximize -e ./webdebug.sh;
node-inspector &
xdg-open http://127.0.0.1:8080/?port=5858;
mongo-express -u admin -p pass -d faf-testdb &
xdg-open http://127.0.0.1:8081/db/faf-testdb/fafpages;

#just have to open localhost:5000 in the end


