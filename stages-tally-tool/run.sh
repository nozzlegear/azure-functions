#!/bin/bash

docker build -t nozzlegear/sci-tally-tool . && docker run -p 8000:8080 -it nozzlegear/sci-tally-tool