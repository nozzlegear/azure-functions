FROM kkarczmarczyk/node-yarn:8.0
WORKDIR /app

# copy project and restore as distinct layers
COPY package.json ./
COPY yarn.lock ./
RUN yarn install

# copy everything else and build
COPY . ./
RUN yarn build

# Define your UNIX binary here
ENV fprocess="node /app/index.js"
ENV read_timeout=60
ENV write_timeout=60

HEALTHCHECK --interval=5s CMD [ -e /tmp/.lock ] || exit 1

ADD https://github.com/openfaas/faas/releases/download/0.6.15/fwatchdog /usr/bin
RUN chmod +x /usr/bin/fwatchdog

CMD ["fwatchdog"]
