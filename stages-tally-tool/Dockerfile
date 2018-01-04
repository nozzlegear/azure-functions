FROM google/dart
WORKDIR /app

# copy project and restore as distinct layers
COPY pubspec.* ./
RUN pub get

# copy everything else and build
COPY . ./
RUN pub get --offline
RUN dart tool/build.dart
RUN chmod u+x /app/analyze.sh
RUN /app/analyze.sh

# Add openfaas watchdog
ADD https://github.com/openfaas/faas/releases/download/0.6.15/fwatchdog /usr/bin
RUN chmod +x /usr/bin/fwatchdog

RUN /usr/bin/dart --version

# Define your UNIX binary here
ENV fprocess="/usr/bin/dart /app/lib/main.dart"
ENV read_timeout=60
ENV write_timeout=60
# ENV content_type=application/json

HEALTHCHECK --interval=5s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]
