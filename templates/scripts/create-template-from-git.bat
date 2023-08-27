@ECHO OFF

REM SET URL
SET REPOSITORY="https://github.com/ShotaOki/iot-app-kit-extra/trunk/examples/typescript-simple"
REM SET TARGET DIRECTORY
SET TARGET="typescript-simple"

REM SET 7z Directory
SET CREATE_ZIP="C:\Program Files\7-Zip\7z.exe"

REM DOWNLOAD GIT FILES
svn export %REPOSITORY% %TARGET%

REM CREATE ZIP FILE
%CREATE_ZIP% a ..\%TARGET%.zip %TARGET%

REM REMOVE TEMP FILES
DEL %TARGET% /F /S /Q
RMDIR %TARGET% /S /Q
