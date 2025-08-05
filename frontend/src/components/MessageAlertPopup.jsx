import { useSelector } from "react-redux";

function MessageAlertPopup () {

    const { incomingMessage } = useSelector(state => state.messages);

    return (
        <div
          className="position-fixed top-0 start-0 w-100 d-flex justify-content-center mt-3"
          style={{ zIndex: 1055 }}
        >
          <div
            className="alert alert-primary shadow d-flex align-items-center gap-2 rounded-pill px-4 py-2"
            role="alert"
            style={{
              minWidth: "280px",
              maxWidth: "90%",
              animation: "slideDownFade 0.6s ease-in-out",
            }}
          >
            <img
              src={incomingMessage?.senderId?.avatar || "/default-avatar.png"}
              alt="avatar"
              className="rounded-circle"
              style={{ width: "32px", height: "32px", objectFit: "cover" }}
            />
            <div className="flex-grow-1 text-truncate">
              <strong>{incomingMessage?.senderId?.fullName}</strong>:{" "}
              <span>
                {incomingMessage?.text
                  ? incomingMessage.text
                  : incomingMessage?.image
                  ? "📷 Sent an image"
                  : incomingMessage?.video
                  ? "🎥 Sent a video"
                  : "Sent a message"}
              </span>
            </div>
          </div>
        </div>
    )
};

export default MessageAlertPopup;