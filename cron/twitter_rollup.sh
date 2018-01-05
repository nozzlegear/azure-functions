SHELL=/bin/sh
0 12 * * * root curl localhost:8080/function/twitter_rollup >> /var/log/twitter_rollup.log 2>&1

# Place this file under /etc/cron.d
