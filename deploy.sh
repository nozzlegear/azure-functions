#!/bin/bash

RED='\033[0;31m'
NC='\033[0m' # No Color

# sshpass is from apt, sudo apt install sshpass
if ! hash sshpass 2>/dev/null; then
    echo -e "${RED}Could not find sshpass command. Install it with \"sudo apt install sshpass\".${NC}" 1>&2
    exit 3
fi

INPLACE=false

while getopts ":in-place:" opt; do
  case $opt in
    a)
      INPLACE=true
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

if [ $INPLACE == true ]; then
    echo "Using in-place deployment, skipping GitHub repository sync."
else
    #1: Cd to 'functions' dir
    #2: Pull the latest version of this repository
    deployTarget=$FUNC_DEPLOY_TARGET

    if [ ! $deployTarget ]; then
        echo -e "${RED}Could not find SSH deployment target variable \$FUNC_DEPLOY_TARGET${NC}"
        exit 3
    fi

    echo "Remember to push this repository to source control before running deploy command."
    echo "Using SSH deployment target from environment variable \$FUNC_DEPLOY_TARGET."

    ssh "$deployTarget" "git clone https://github.com/nozzlegear/azure-functions.git; cd azure-functions; faas build -f functions.yml; faas deploy -f functions.yml"
fi

#3: