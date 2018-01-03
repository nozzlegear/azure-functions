#!/bin/bash

RED='\033[0;31m'
NC='\033[0m' # No Color
INPLACE=false
PW=""

while getopts "h?ip:" opt; do
  case $opt in
    i)
      INPLACE=true
      ;;
    p)
      PW=$OPTARG
      ;;
    h|\?)
      echo "Usage: "
      echo "    -h                Display this help message."
      echo "    -i                In-place deployment. Script will skip SSHing, clone and repo sync, and instead will deploy functions from current directory."
      echo "    -p password       Pass the git secret password for secret file decryption. You will be prompted for the password if this option is not specified."
      exit 0
      ;;
  esac
done

function readPassword {
    read -sp "Enter git secret password for file decryption: " PW
    echo
}

function validatePassword {
    size=${#PW}

    if [ $size -lt 1 ]; then
        echo -e "${RED}Password length was 0.${NC}"
        exit 3
    fi
}

if [ ! $PW ]; then
    readPassword
fi

validatePassword

if [ $INPLACE == true ]; then
    git secret reveal -d .gnupg -p "$PW" -f
    faas build -f functions.yml
    faas deploy -f functions.yml
    echo "Deployment finished!"
else
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

    COMMAND="if [ ! -d azure-functions ]; then git clone 'https://github.com/nozzlegear/azure-functions.git'; fi && cd azure-functions && git pull && bash deploy.sh -ip '$PW'"

    ssh "$FUNC_DEPLOY_TARGET" "$COMMAND"

fi

#3: