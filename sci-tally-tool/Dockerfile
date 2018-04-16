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

RUN /usr/bin/dart --version

CMD ["/usr/bin/dart", "/app/lib/main.dart"]
