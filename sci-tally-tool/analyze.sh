#!/bin/bash

RED='\033[0;31m'
NC='\033[0m' # No Color

dartanalyzer lib/main.dart

if [[ $? -ne 0 ]]; then
    echo -e "${RED}Strong-mode Dart analyzer detected errors.${NC}" 1>&2
    exit 3
fi