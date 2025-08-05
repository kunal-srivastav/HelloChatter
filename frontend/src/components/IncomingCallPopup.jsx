import { useDispatch, useSelector } from "react-redux";
import { setAcceptCall, setIncomingCall } from "../features/calls/callSlice";
import { socket } from "../utils/socket";
import { useNavigate } from "react-router-dom";

function IncomingCallPopup () {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { incomingCall } = useSelector(state => state.calls);

    const handleCallAcceptBtn = () => {
        dispatch(setAcceptCall(true));
        navigate(`/${incomingCall?.from}/video-call`)
    }
    
    const handleCallDecline = () => {
        socket.emit("end-call", {to: incomingCall?.from});
        dispatch(setAcceptCall(false));
        dispatch(setIncomingCall(null));
    };

    return (
        <div className="position-absolute top-0 start-0 w-100 vh-100 d-flex justify-content-center align-items-start bg-dark bg-opacity-75 z-3">
          <div className="card p-4 text-center shadow" style={{ maxWidth: "400px", maxHeight: "500px", animation: "slideDownFade 0.6s ease-in-out" }}>
            <h3 className="mb-2">📞 Incoming Call</h3>
            <p className="lead">
              From <strong>{incomingCall?.fullName || "Unknown"}</strong>
              <img src={incomingCall?.avatar || "./defaultPic.webp"} className="ms-1 mb-1 rounded-circle" width={20} height={20} alt="" />
            </p>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <button className="btn btn-success" onClick={handleCallAcceptBtn}>
                ✅ Accept
              </button>
              <button className="btn btn-danger" onClick={handleCallDecline}>
                ❌ Decline
              </button>
            </div>
          </div>
        </div>
    )
};

export default IncomingCallPopup;