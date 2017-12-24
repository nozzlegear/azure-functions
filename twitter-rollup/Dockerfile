FROM kkarczmarczyk/node-yarn:8.0
WORKDIR /app

ADD https://github.com/openfaas/faas/releases/download/0.6.15/fwatchdog /usr/bin
RUN chmod +x /usr/bin/fwatchdog

# copy project and restore as distinct layers
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

# copy everything else and build
COPY . ./
RUN yarn build

# Define your UNIX binary here
ENV fprocess="node /app/dist/index.js"
ENV marshal_request=true
ENV read_timeout=30
ENV write_timeout=30

HEALTHCHECK --interval=5s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]
