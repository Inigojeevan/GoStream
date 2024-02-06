import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const Rooms = () => {
  const location = useLocation();
  const userVideo = useRef<HTMLVideoElement>(null);
  const userStream = useRef<MediaStream>();
  const partnerVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection>();
  const webSocketRef = useRef<WebSocket>();

  const openCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: true,
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (userVideo.current && stream) {
        userVideo.current.srcObject = stream;
      }
      userStream.current = stream;
    } catch (error) {
      console.error("Error accessing user media:", error);
    }
  };

  useEffect(() => {
    openCamera().then(async () => {
      const roomID = location.pathname.split("/");
      webSocketRef.current = new WebSocket(
        `ws://localhost:8000/joinRoom?roomID=${roomID[2]}`
      );

      webSocketRef.current.addEventListener("open", () => {
        console.log("Connected to the server");
        webSocketRef.current?.send(JSON.stringify({ join: true }));
      });

      webSocketRef.current.addEventListener("message", async (e) => {
        const message = JSON.parse(e.data);

        if (message.join) {
          callUser();
        }
        if (message.offer) {
          handleOffer(message.offer);
        }
        if (message.answer) {
          console.log("Received Answer");
          if (peerRef.current) {
            await peerRef.current.setRemoteDescription(
              new RTCSessionDescription(message.answer)
            );
          }
        }
        if (message.iceCandidate) {
          console.log("Ice candidate received");
          try {
            if (peerRef.current) {
              await peerRef.current.addIceCandidate(message.iceCandidate);
            }
          } catch (err) {
            console.error("Error adding ICE candidate:", err);
          }
        }
      });
    });
  }, [location.pathname]);

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    console.log("Received Offer, Creating Answer");
    peerRef.current = createPeer();

    if (!peerRef.current) return;

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    userStream.current?.getTracks().forEach((track) => {
      peerRef.current?.addTrack(track, userStream.current as MediaStream);
    });

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    webSocketRef.current?.send(
      JSON.stringify({ answer: peerRef.current.localDescription })
    );
  };

  const callUser = async () => {
    console.log("Calling Other User");
    peerRef.current = createPeer();

    userStream.current?.getTracks().forEach(async (track) => {
      await peerRef.current?.addTrack(track, userStream.current as MediaStream);
    });
  };

  const handleIceCandidateEvent = (e: RTCPeerConnectionIceEvent) => {
    if (e.candidate && webSocketRef.current) {
      webSocketRef.current.send(JSON.stringify({ iceCandidate: e.candidate }));
    }
  };

  const createPeer = () => {
    console.log("Creating Peer Connection");
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onnegotiationneeded = handleNegotiationNeeded;
    peer.onicecandidate = handleIceCandidateEvent;
    peer.ontrack = (e: RTCTrackEvent) => handleTrackEvent(e.streams);

    return peer;
  };

  const handleNegotiationNeeded = async () => {
    console.log("Creating Offer");

    try {
      if (peerRef.current) {
        const myOffer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(myOffer);

        webSocketRef.current?.send(
          JSON.stringify({ offer: peerRef.current.localDescription })
        );
      }
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  };

  const handleTrackEvent = (streams: ReadonlyArray<MediaStream>) => {
    console.log("Received Tracks");
    console.log(streams);
    if (partnerVideo.current && streams.length > 0) {
      partnerVideo.current.srcObject = streams[0];
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "whitesmoke",
          height: "200px",
          width: "100%",
        }}
      >
        <h1>Golang {"&"} React</h1>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          top: "100px",
          right: "100px",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <video playsInline autoPlay muted controls={true} ref={userVideo} />
        <video playsInline autoPlay controls={true} ref={partnerVideo} />
      </div>
    </div>
  );
};

export default Rooms;
