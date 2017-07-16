#!/bin/bash

# Zip the project up, excluding node modules. Escape the wildcard to prevent the shell
# from auto-expanding it itself. Leave it to zip instead.
fileName="deployment.zip"
apiUrl="https://nozzlegear-alexa.scm.azurewebsites.net/api/zip/site/wwwroot"

zip -r $fileName . -x node_modules/\* .git/\* >/dev/null
curl -X PUT --data-binary "@$fileName" --user "$AZURE_FUNC_USERNAME:$AZURE_FUNC_PASSWORD" $apiUrl

lastExitCode=$?

if [ $lastExitCode -ne 0 ]; then
  echo "Deployment failed!"
else 
  echo "Deployment was successful."
fi

exit $lastExitCode