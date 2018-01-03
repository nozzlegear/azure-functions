#!/bin/bash

RED='\033[0;31m'
NC='\033[0m' # No Color
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
    git secret reveal -d .gnupg -f
    faas build -f functions.yml
    faas deploy -f functions.yml
    echo "Deployment finished!"
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

#     COMMAND=$(cat <<-EOF
# if [ ! -d azure-functions ]; then git clone "https://github.com/nozzlegear/azure-functions.git"; fi
# && cd azure-functions
# && git pull
# && git secret reveal -f
# && faas build -f functions.yml
# && faas deploy -f functions.yml
# EOF
# )

    COMMAND="if [ ! -d azure-functions ]; then git clone 'https://github.com/nozzlegear/azure-functions.git'; fi && cd azure-functions && git pull && bash deploy.sh --in-place"

    ssh "$FUNC_DEPLOY_TARGET" "$COMMAND"

fi

#3: