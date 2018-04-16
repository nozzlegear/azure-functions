FROM google/dart:1.24
WORKDIR /app

# Add dos2unix
RUN apt-get update
RUN apt-get install dos2unix -y

# copy project and restore as distinct layers
COPY pubspec.* ./
RUN pub get

# copy everything else and build
COPY . ./
RUN pub get --offline
RUN dart tool/build.dart
RUN dos2unix /app/analyze.sh
RUN chmod u+x /app/analyze.sh
RUN /app/analyze.sh

CMD ["/usr/bin/dart", "/app/lib/main.dart"]