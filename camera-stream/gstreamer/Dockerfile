# Dockerfile for GStreamer
FROM ubuntu:20.04

# Install dependencies
RUN apt-get update && apt-get install -y \
  gstreamer1.0-tools gstreamer1.0-plugins-base \
  gstreamer1.0-plugins-good v4l-utils

COPY ./start_stream.sh /opt/gstreamer/start_stream.sh

# Set the entrypoint
ENTRYPOINT ["bash", "/opt/gstreamer/start_stream.sh"]
