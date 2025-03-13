# Camera Stream

Allows for a video device to be streamed over Webrtc. Currently the `/dev/video0` device is used by default.

## GStreamer

GStreamer is an open-source multimedia framework that enables the creation of applications for handling video, audio, and other media types. It uses a pipeline-based architecture, where data flows through a series of elements (such as decoders, encoders, filters, and sinks) to process media.



`gst-launch-1.0` creates a GStreamer pipeline that captures video from a camera and streams it over UDP. Command Breakdown:

- `v4l2src device=/dev/video0`: Captures raw video from the device `/dev/video0` (The webcam or capture card).
- `'video/x-raw, width=640, height=480, framerate=30/1'`: Specifies the format of the captured video, setting the resolution to 640x480 pixels and the frame rate to 30 frames per second. This resolution can be changed once we know the resolution of the FPV camera.
- `videoconvert`: Converts the video format to ensure compatibility with the next elements in the pipeline.
- `vp8enc deadline=1`: Encodes the video in VP8 format with a low latency setting (`deadline=1`).
- `rtpvp8pay`: Packages the encoded VP8 video into RTP (Real-time Transport Protocol) packets for streaming.
- `udpsink host=janus port=10000`: Sends the RTP stream via UDP to the host `janus` on port 10000, typically to a server or service like Janus WebRTC server.

This pipeline captures, encodes, and streams video to the Janus service over a specified network protocol. The script is located in `./gstreamer/start_stream.sh`. The script is run when the docker compose is started. 

```sh
gst-launch-1.0 v4l2src device=/dev/video0 ! \
  'video/x-raw, width=640, height=480, framerate=30/1' ! \
  videoconvert ! vp8enc deadline=1 ! \
  rtpvp8pay ! udpsink host=janus port=10000
```

## Janus
Janus is an open-source WebRTC server designed to enable real-time communication (RTC) between web browsers, mobile devices, and other media services. It acts as a general-purpose gateway that supports audio, video, and data streaming, enabling features like video conferencing, live streaming, and peer-to-peer communication.

Janus was choosen because it offers the lowest latency video streaming. This does come with complexity. 

```cfg
vp8-sample: {
        type = "rtp"                             
        id = 1234                               
        audio = false                           
        video = true                            
        videoport = 10000                        
        videopt = 96                             
        videocodec = "VP8"                      
        videofmtp = "profile-level-id=42e01f;packetization-mode=1"  
        secret = "adminpwd"
        secret (adjust as needed)
}
```

This configuration defines a VP8 video stream for Janus, specifying the details of the stream that will be used to stream video data to Janus. This is located in `./janus/janus.plugin.streaming.jcfg`

- `type = "rtp"`: Indicates that the stream type is RTP (Real-time Transport Protocol), which is typically used for video and audio streaming.
- `id = 1234`: A unique identifier for the stream, used by Janus to differentiate it from other streams.
- `description = "VP8 video stream from GStreamer"`: A description of the stream, which provides information about the source or purpose of the stream.
- `audio = false`: No audio stream is included; the focus is solely on video.
- `video = true`: Video streaming is enabled.
- `videoport = 10000`: The port on which Janus listens for incoming video stream data. This should match the port used in the GStreamer pipeline (e.g., `udpsink port=10000`).
- `videopt = 96`: The RTP payload type assigned to the VP8 stream, which helps in identifying the codec in the RTP packets (should match the codec set in GStreamer).
- `videocodec = "VP8"`: The codec being used for video encoding, which is VP8 in this case.
- `videofmtp = "profile-level-id=42e01f;packetization-mode=1"`: Additional VP8-specific parameters for stream negotiation, such as the profile level and packetization mode for proper decoding and delivery.
- `secret = "adminpwd"`: The authentication secret required to access or configure the stream, ensuring only authorized users can access or modify the stream configuration.

This configuration enables Janus to receive and process an incoming VP8 video stream via RTP (The GStreamer pipeline).


## Changing Video Input

Changing the video input is simple. Start by finding the video device that you would like to stream. This can be acheived using the following command:

#### Linux:
```bash
v4l2-ctl --list-devices
```
##### Example Output:
```bash
C922 Pro Stream Webcam (usb-0000:04:00.3-1):
        /dev/video0
        /dev/video1
        /dev/media0
```
The device id for this device is: `/dev/video0`

#### Windows/MacOS:

```bash
ffmpeg -f avfoundation -list_devices true -i ""
```

#### Updating the docker compose 

Next update the docker compose with the new device id. 

```yml  
  gstreamer:
    build:
      context: ./gstreamer
      dockerfile: Dockerfile
    container_name: gstreamer
    devices:
      - "<New Device ID>:/dev/video0"
    depends_on:
      - janus
    ports:
      - '10000:10000/udp'
    networks:
      - webrtc_network
```