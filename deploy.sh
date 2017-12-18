#!/bin/bash

# ----------------------
# KUDU Deployment Script
# Version: 1.0.15
# ----------------------

# Helpers
# -------

exitWithMessageOnError () {
  if [ ! $? -eq 0 ]; then
    echo "An error has occurred during web site deployment."
    echo $1
    exit 1
  fi
}

# Setup
# -----

SCRIPT_DIR="${BASH_SOURCE[0]%\\*}"
SCRIPT_DIR="${SCRIPT_DIR%/*}"
ARTIFACTS=$SCRIPT_DIR/../artifacts
KUDU_SYNC_CMD=${KUDU_SYNC_CMD//\"}

if [[ ! -n "$DEPLOYMENT_SOURCE" ]]; then
  DEPLOYMENT_SOURCE=$SCRIPT_DIR
fi

if [[ ! -n "$NEXT_MANIFEST_PATH" ]]; then
  NEXT_MANIFEST_PATH=$ARTIFACTS/manifest

  if [[ ! -n "$PREVIOUS_MANIFEST_PATH" ]]; then
    PREVIOUS_MANIFEST_PATH=$NEXT_MANIFEST_PATH
  fi
fi

if [[ ! -n "$DEPLOYMENT_TARGET" ]]; then
  DEPLOYMENT_TARGET=$ARTIFACTS/wwwroot
else
  KUDU_SERVICE=true
fi

if [[ ! -n "$KUDU_SYNC_CMD" ]]; then
  # Install kudu sync
  echo Installing Kudu Sync
  npm install kudusync -g --silent
  exitWithMessageOnError "npm failed"

  if [[ ! -n "$KUDU_SERVICE" ]]; then
    # In case we are running locally this is the correct location of kuduSync
    KUDU_SYNC_CMD=kuduSync
  else
    # In case we are running on kudu service this is the correct location of kuduSync
    KUDU_SYNC_CMD=$APPDATA/npm/node_modules/kuduSync/bin/kuduSync
  fi
fi

# Node Helpers
# ------------

selectNodeVersion () {
  if [[ -n "$KUDU_SELECT_NODE_VERSION_CMD" ]]; then
    SELECT_NODE_VERSION="$KUDU_SELECT_NODE_VERSION_CMD \"$DEPLOYMENT_SOURCE\" \"$DEPLOYMENT_TARGET\" \"$DEPLOYMENT_TEMP\""
    eval $SELECT_NODE_VERSION
    exitWithMessageOnError "select node version failed"

    if [[ -e "$DEPLOYMENT_TEMP/__nodeVersion.tmp" ]]; then
      NODE_EXE=`cat "$DEPLOYMENT_TEMP/__nodeVersion.tmp"`
      exitWithMessageOnError "getting node version failed"
    fi

    if [[ -e "$DEPLOYMENT_TEMP/__npmVersion.tmp" ]]; then
      NPM_JS_PATH=`cat "$DEPLOYMENT_TEMP/__npmVersion.tmp"`
      exitWithMessageOnError "getting npm version failed"
    fi

    if [[ ! -n "$NODE_EXE" ]]; then
      NODE_EXE=node
    fi

    NPM_CMD="\"$NODE_EXE\" \"$NPM_JS_PATH\""
  else
    NPM_CMD=npm
    NODE_EXE=node
  fi
}

# Prerequisites
# -------------

# Select node version
selectNodeVersion

# Verify node.js installed
hash node 2>/dev/null
exitWithMessageOnError "Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment."

# Verify dotnet installed
hash dotnet 2>/dev/null
exitWithMessageOnError "Missing dotnet executable."

# Bootstrap paket. Since we're using git-bash we can just call exe files
.paket/paket.bootstrapper.exe
exitWithMessageOnError "Failed to bootstrap paket."

# Verify yarn installed
hash yarn 2>/dev/null
if [[ $? != 0 ]]; then
  echo "Missing yarn, installing via npm"
  eval $NPM_CMD install yarn -g --silent
  exitWithMessageOnError "Failed to install Yarn."
  echo "Finished installing Yarn."
fi

##################################################################################################################################
# Deployment
# ----------

echo "Handling deployment from directory $PWD."
echo "Step 1: KuduSync"

# 1. KuduSync
if [[ "$IN_PLACE_DEPLOYMENT" -ne "1" ]]; then
  echo "Beginning kudu sync"
  "$KUDU_SYNC_CMD" -v 50 -f "$DEPLOYMENT_SOURCE" -t "$DEPLOYMENT_TARGET" -n "$NEXT_MANIFEST_PATH" -p "$PREVIOUS_MANIFEST_PATH" -i ".git;.hg;.deployment;deploy.sh;node_modules;packages;paket-files"
  exitWithMessageOnError "Kudu Sync failed"
fi

echo "Step 2: Yarn install"

# 2. Restore npm packages
if [ -e "$DEPLOYMENT_TARGET/package.json" ]; then
  cd "$DEPLOYMENT_TARGET"
  yarn install
  exitWithMessageOnError "yarn package install failed"
  cd - > /dev/null
fi

echo "Step 3: Yarn build"

# 3. Build npm projects
if [ -e "$DEPLOYMENT_TARGET/package.json" ]; then
  cd "$DEPLOYMENT_TARGET"
  yarn build
  exitWithMessageOnError "yarn build failed"
  cd - > /dev/null
fi

echo "Step 4: Dotnet restore"

# 4. Restore dotnet packages
cd "$DEPLOYMENT_TARGET"
dotnet restore
exitWithMessageOnError "Failed to restore dotnet packages."
cd - > /dev/null

echo "Step 5: Dotnet public"

# 4. Publish dotnet solution
cd "$DEPLOYMENT_TARGET"
dotnet publish -C Release
exitWithMessageOnError "Failed to publish dotnet solution."
cd - > /dev/null

##################################################################################################################################
echo "Finished successfully."
