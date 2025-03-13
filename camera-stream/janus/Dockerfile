# Use an official Debian as a parent image
FROM debian:bullseye-slim

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    cmake \
    git \
    wget \
    libmicrohttpd-dev \
    libjansson-dev \
    libssl-dev \
    libsrtp2-dev \
    libsofia-sip-ua-dev \
    libglib2.0-dev \
    libopus-dev \
    libogg-dev \
    libcurl4-openssl-dev \
    liblua5.3-dev \
    libconfig-dev \
    pkg-config \
    gengetopt \
    libtool \
    automake \
    gtk-doc-tools \
    libnice-dev \
    libwebsockets-dev \
    libavutil-dev \
    libavformat-dev \
    libavcodec-dev \
    libavfilter-dev \
    libavdevice-dev \
    libavresample-dev \
    libswscale-dev \
    libnanomsg-dev \
    librabbitmq-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install libsrtp with OpenSSL support
RUN git clone https://github.com/cisco/libsrtp.git /usr/local/src/libsrtp && \
    cd /usr/local/src/libsrtp && \
    git checkout v2.4.2 && \
    ./configure --prefix=/usr/local --enable-openssl && \
    make shared_library && \
    make install

# Install usrsctp
RUN git clone https://github.com/sctplab/usrsctp.git /usr/local/src/usrsctp && \
    cd /usr/local/src/usrsctp && \
    ./bootstrap && \
    ./configure --prefix=/usr/local && \
    make && \
    make install

# Update dynamic linker cache
RUN ldconfig

# Install Janus Gateway
RUN git clone https://github.com/meetecho/janus-gateway.git /usr/local/src/janus-gateway && \
    cd /usr/local/src/janus-gateway && \
    sh autogen.sh && \
    ./configure --prefix=/opt/janus \
                --enable-post-processing \
                --enable-plugin-echotest \
                --enable-plugin-recordplay \
                --enable-plugin-sip \
                --enable-plugin-videocall \
                --enable-plugin-videoroom \
                --enable-plugin-voicemail \
                --enable-plugin-textroom \
                --enable-plugin-audiobridge \
                --enable-plugin-nosip \
                --enable-plugin-streaming \
                --enable-plugin-lua \
                --enable-plugin-dtlssrtp \
                --enable-plugin-srtp \
                --enable-plugin-usrsctp \
                --enable-plugin-websockets \
                --enable-plugin-nanomsg \
                --enable-plugin-mqtt \
                --enable-plugin-unixsockets \
                --enable-plugin-rabbitmq && \
    make && \
    make install && \
    make configs

# Expose necessary ports
EXPOSE 8088 8089 8188 8189 10000-10200/udp

COPY ./janus.plugin.streaming.jcfg /opt/janus/etc/janus/janus.plugin.streaming.jcfg

# Set the entry point
ENTRYPOINT ["/opt/janus/bin/janus"]
