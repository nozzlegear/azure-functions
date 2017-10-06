#!/bin/bash

# Zip the project up, excluding node modules. Escape the wildcard to prevent the shell
# from auto-expanding it itself. Leave it to zip instead.
fileName="deployment.zip"
apiUrl="https://nozzlegear-alexa.scm.azurewebsites.net/api/zip/site/wwwroot"

# Seem to be running into some kind of cache issue that doesn't overwrite the previous deployment.zip, so we'll delete that.
rm $fileName

zip -r $fileName . -x node_modules/\* packages/\* \*.zip .git/\* */obj/\* >/dev/null
echo "Zipped files, uploading to Azure..."
curl -X PUT --data-binary "@$fileName" --user "$AZURE_FUNC_USERNAME:$AZURE_FUNC_PASSWORD" $apiUrl

lastExitCode=$?

if [ $lastExitCode -ne 0 ]; then
  echo "Deployment failed!"
else
  echo "Deployment was successful."
fi

exit $lastExitCode