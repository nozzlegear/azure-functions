FROM microsoft/dotnet
WORKDIR /app

# copy project and restore as distinct layers
COPY *.fsproj ./
RUN dotnet restore

# copy everything else and build
COPY . ./
RUN dotnet publish -c release -o dist

# Add openfaas watchdog
ADD https://github.com/openfaas/faas/releases/download/0.6.15/fwatchdog /usr/bin
RUN chmod +x /usr/bin/fwatchdog

# Define your UNIX binary here
ENV fprocess="/app/dist/stages-tally-tool"
ENV read_timeout=60
ENV write_timeout=60
# ENV content_type=application/json

HEALTHCHECK --interval=5s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]
