@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off

:: ----------------------
:: KUDU Deployment Script
:: Version: 1.0.15
:: ----------------------

:: Prerequisites
:: -------------

:: Verify node.js installed
where node 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.
  goto error
)

:: Verify yarn installed
which yarn 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo "Missing yarn, installing via npm"
  call npm install yarn -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error
  echo "Finished installing Yarn."
)

echo "Yarn installed, continuing to deployment"

:: Setup
:: -----

setlocal enabledelayedexpansion

SET ARTIFACTS=%~dp0%..\artifacts

IF NOT DEFINED DEPLOYMENT_SOURCE (
  SET DEPLOYMENT_SOURCE=%~dp0%.
)

IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%ARTIFACTS%\wwwroot
)

IF NOT DEFINED NEXT_MANIFEST_PATH (
  SET NEXT_MANIFEST_PATH=%ARTIFACTS%\manifest

  IF NOT DEFINED PREVIOUS_MANIFEST_PATH (
    SET PREVIOUS_MANIFEST_PATH=%ARTIFACTS%\manifest
  )
)

IF NOT DEFINED KUDU_SYNC_CMD (
  :: Install kudu sync
  echo Installing Kudu Sync
  call npm install kudusync -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "kuduSync" would also work
  SET KUDU_SYNC_CMD=%appdata%\npm\kuduSync.cmd
)
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Deployment
:: ----------
echo Handling function App deployment with custom build.cmd script.
echo "build.cmd running in directory %cd%"

:: Bootstrap packet
.paket\paket.bootstrapper.exe
IF !ERRORLEVEL! NEQ 0 goto error

:: Restore dotnet packages and publish dotnet projects
call dotnet restore
call dotnet publish -c Release
IF !ERRORLEVEL! NEQ 0 goto error

:: Restore node packages and build node projects
call yarn install
call yarn build
IF !ERRORLEVEL! NEQ 0 goto error

:: 3. KuduSync
IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
  call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 -f ./ -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd;node_modules;"
  IF !ERRORLEVEL! NEQ 0 goto error
)

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
goto end

:: Execute command routine that will echo out when error
:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" NEQ "0" echo Failed exitCode=%ERRORLEVEL%, command=%_CMD_%
exit /b %ERRORLEVEL%

:error
endlocal
echo An error has occurred during web site deployment.
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
endlocal
echo Finished successfully.


REM @echo off
REM cls

REM echo "build.cmd running in directory %cd%"

REM dotnet restore std-artist-tally-tool
REM dotnet build -c Release std-artist-tally-tool

REM REM .paket\paket.bootstrapper.exe
REM REM if errorlevel 1 (
REM REM   exit /b %errorlevel%
REM REM )

REM REM .paket\paket.exe restore --force
REM REM if errorlevel 1 (
REM REM   exit /b %errorlevel%
REM REM )

REM call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 -f "%DEPLOYMENT_TEMP%" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd"
REM IF !ERRORLEVEL! NEQ 0 goto error