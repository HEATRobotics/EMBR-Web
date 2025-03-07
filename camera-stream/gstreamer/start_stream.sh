#!/bin/bash

# GStreamer pipeline to capture webcam video and stream to Janus
gst-launch-1.0 v4l2src device=/dev/video0 ! \
  'video/x-raw, width=640, height=480, framerate=30/1' ! \
  videoconvert ! vp8enc deadline=1 ! \
  rtpvp8pay ! udpsink host=janus port=10000