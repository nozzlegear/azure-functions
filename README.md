# Azure Functions

This repository is full of custom Azure functions (like AWS Lambda) that I use. Most are Alexa skills, some are daily roundup emails.

## Secrets

This repository uses [git-secret](https://github.com/sobolevn/git-secret) to encrypt `env.yml` files which are used in turn to specify sensitive env values to functions and Docker images. You'll need a GPG key to use git-secret, and you can only decrypt the files if your key has already been added as a trusted user. [Installation instructions are here.](http://git-secret.io/installation)

Usage:

|Command|Description|
|-------|-----------|
|`git secret init`|Initializes git-secret for the repository. Only needs to be done once per project.|
|`git secret tell`|Adds a GPG key to the trusted users list. Use the `-m` flag to add your own key.|
|`git secret add path/to/file`|Adds a file to git secret. This file **must** be ignored by your .gitignore file or else it will be checked in to source control.|
|`git secret hide`|Encrypts all added files and creates new ones with the filename format `filename.extension.secret`. These files **should be added to source control**.|
|`git secret reveal`|Decrypts all added files with their original filename.|

## TODO

- [ ] Change the name of this repo to just "functions".
- [ ] Build a function to listen for GitHub webhooks and build/deploy all functions on new pushes.
  - On second thought this might be more difficult than imagined in that the listener function is in its own container and can't get outside of that to deploy the repo.
- [ ] Build a function to aggregate the logs for all other functions.
- [ ] Figure out how to deploy environment variables without the need for uploading my own gpg key to production.
  - Maybe a function that responds with environment variables and other functions can query them? With a public, password-protected portal to view/change them?
  - Or maybe they read them from a password-protected CouchDB instance?