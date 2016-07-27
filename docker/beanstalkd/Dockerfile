FROM alpine:3.4
MAINTAINER Vlod Kalicun <vlod@vlod.com>

# from https://github.com/mendsley/docker-alpine-beanstalk/blob/master/Dockerfile
RUN buildDeps='gcc make musl-dev curl' \
  BEANSTALK_DOWNLOAD_URL="https://github.com/kr/beanstalkd/archive/master.zip" \
  && set -x \
  && addgroup beanstalk \
	&& adduser -H -D -s /bin/false -G beanstalk beanstalk \
  && apk add --update $buildDeps \
  && curl -sSL "$BEANSTALK_DOWNLOAD_URL" -o /tmp/master.zip \
  && unzip /tmp/master.zip -d /root \
  && rm /usr/include/sys/fcntl.h \
  && ln -s /usr/include/fcntl.h /usr/include/sys/fcntl.h \
  && cd /root/beanstalkd-master \
  && make \
  && mkdir -p /opt \
  && cp /root/beanstalkd-master/beanstalkd /opt/beanstalkd \
  && cd / \
  && rm /tmp/master.zip \
  && rm -rf /root/beanstalkd-master \
  && apk del $buildDeps \
	&& rm -rf  /var/cache/apk/* \
  ;

EXPOSE 11300
CMD /opt/beanstalkd