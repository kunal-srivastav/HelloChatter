import { IoMdMicOff, IoMdMic } from "react-icons/io";
import { CiVideoOff, CiVideoOn } from "react-icons/ci";
import { MdCallEnd } from "react-icons/md";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../utils/socket";
import { setAcceptCall, setIncomingCall } from "../features/calls/callSlice";
import { setError } from "../features/users/userSlice";

function VideoCall() {
  const { remoteUserId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loggedInUser } = useSelector(state => state.users);
  const { incomingCall, acceptCall } = useSelector(state => state.calls);

  const myStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerRef = useRef(null);
  const hasAddedTracks = useRef(false);
  const hasStartedCall = useRef(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callingState, setCallingState] = useState("Calling");

  // Create peer connection
  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStreamRef.current) {
        remoteStreamRef.current.srcObject = remoteStream;
      }
    };

    peerRef.current = peer;
  };

  // Get user's media stream
  const sendStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    if (myStreamRef.current) {
      myStreamRef.current.srcObject = stream;
    }

    if (peerRef.current && !hasAddedTracks.current) {
        stream.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, stream);
      });
      hasAddedTracks.current = true;
    }

    return stream;
  };

  // Caller sends offer
  const makeCall = useCallback(async () => {
    try {
      createPeerConnection();           // 1. Create connection
      await sendStream();              // 2. Add media
      const offer = await peerRef.current.createOffer(); // 3. Create offer
      await peerRef.current.setLocalDescription(offer);
      socket.emit("send-offer", {
        from: loggedInUser._id,
        to: remoteUserId,
        offer
      });
    } catch (err) {
      dispatch(setError(err || "Unable to start the call"));
    }
  }, [loggedInUser, remoteUserId]);

  // Callee handles offer and sends answer
  const handleCallAccepted = useCallback(async () => {
    try {
      setCallingState("On Call");
      createPeerConnection();
      const { from, offer } = incomingCall;
      await sendStream();
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
  
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
  
      socket.emit("send-answer", { to: from, answer });
    } catch (err) {
      dispatch(setError(err || "Unable to accept incoming call"));
    }
  }, [incomingCall, acceptCall]);

  useEffect(() => {
    socket.on("end-call", endCall);

    socket.on("receive-answer", async ({ answer }) => {
      setCallingState("On Call");
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(candidate);
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    return () => {
      socket.off("end-call");
      socket.off("receive-answer");
      socket.off("ice-candidate");
    };
  }, []);

  useEffect(() => {
    const startCall = async () => {
      if (hasStartedCall.current) return; // prevent duplicate execution

      if (incomingCall && acceptCall) {
        hasStartedCall.current = true;
        await handleCallAccepted();
      } else if (!incomingCall && !acceptCall) {
        if (loggedInUser?._id < remoteUserId) {
          hasStartedCall.current = true;
          await makeCall();
        }
      }
    };

    startCall();
  }, [incomingCall, acceptCall, loggedInUser, remoteUserId]);


  const endCall = () => {
    setCallingState("call ended");
    peerRef.current?.close();
    peerRef.current = null;

    if (myStreamRef.current?.srcObject) {
      myStreamRef.current.srcObject.getTracks().forEach(track => track.stop());
      myStreamRef.current.srcObject = null;
    }

    if (remoteStreamRef.current?.srcObject) {
      remoteStreamRef.current.srcObject = null;
    }

    hasAddedTracks.current = false;
    dispatch(setIncomingCall(null));
    dispatch(setAcceptCall(false));
    socket.emit("end-call", {to: remoteUserId})
    setTimeout(() => {
      navigate("/chat")
    }, 2000);
  };

  const toggleVideo = () => {
    const stream = myStreamRef?.current?.srcObject;
    if(!stream) return;

    stream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
      setIsVideoEnabled(track.enabled);
    })
  };

  const toggleMic = () => {
    const stream = myStreamRef?.current?.srcObject;
    if(!stream) return;

    stream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      setIsAudioEnabled(track.enabled);
    })
  }

  return (
    <div className="container-fluid text-center py-4">
      <h1 className="text-primary">Video Call</h1>
      <hr />
      <p className="text-white">{callingState}</p>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <h4 className="text-light">My Stream</h4>
          <video ref={myStreamRef} autoPlay playsInline className="w-100 rounded-3 shadow" style={{ maxHeight: "300px" }} />
        </div>
        <div className="col-12 col-md-6">
          <h4 style={{ color: "#3A0519" }}>Remote Stream</h4>
          <video ref={remoteStreamRef} autoPlay playsInline className="w-100 rounded-3 shadow" style={{ maxHeight: "300px" }} />
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mt-4">
        <button type="button" className="btn btn-light rounded-circle p-3" onClick={endCall}>
          <MdCallEnd size={25} color="red" />
        </button>
        <button type="button" className="btn btn-secondary rounded-circle p-3" onClick={toggleMic}>
          {isAudioEnabled ? <IoMdMicOff size={25} /> : <IoMdMic size={25} color="white" />}
        </button>
        <button type="button" className="btn btn-secondary rounded-circle p-3" onClick={toggleVideo}>
          {isVideoEnabled ? <CiVideoOff size={25} /> : <CiVideoOn size={25} color="white" />}
        </button>
      </div>
    </div>
  );
}

export default VideoCall;
