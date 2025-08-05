import { useRef, useState } from "react";
import { sendMessage } from "../features/messages/messageThunks";
import { FaImage, FaVideo } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { addChatMessages } from "../features/messages/messageSlice";
import { setClearMsg, setError } from "../features/users/userSlice";

function ChatInput() {
  const imageBtnRef = useRef(null);
  const videoBtnRef = useRef(null);
  const dispatch = useDispatch();
  const { loggedInUser, remoteUser } = useSelector(state => state.users);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [msg, setMsg] = useState({
    text: "",
    image: null,
    video: null,
    previewUrl: null
  });

  const handleImageBtn = () => {
    imageBtnRef.current.click();
  };

  const handleVideoBtn = () => {
    videoBtnRef.current.click();
  };

  const handleOnChange = (e) => {
    const { value, name, files } = e.target;
    if (files && files.length > 0) {
      const previewUrl = URL.createObjectURL(files[0]);
      setMsg(prev => ({ ...prev, [name]: files[0], previewUrl }));
    } else {
      setMsg(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSendMessage = async () => {
    if (!msg.text && !msg.image && !msg.video) return;
    setIsSending(true);
    setUploadProgress(0);

    const messageData = new FormData();
    if (msg.text) messageData.append("text", msg.text);
    if (msg.image) messageData.append("image", msg.image);
    if (msg.video) messageData.append("video", msg.video);
    messageData.append("receiverId", remoteUser._id);
    messageData.append("senderId", loggedInUser._id);

    try {
      if (remoteUser) {
        const res = await dispatch(sendMessage({messageData, setProgress: setUploadProgress})).unwrap();
        if(res && res.message) {
          dispatch(addChatMessages(res.message));
        }
      }
      setMsg({ text: "", image: null, video: null, previewUrl: null });
    } catch (err) {
      dispatch(setError(err || "Error sending message"));
    } finally {
      setIsSending(false);
      setUploadProgress(0);
      dispatch(setClearMsg());
    }
  };

  return (
    <div>
      {msg.previewUrl && (
        <div className="text-end me-4 position-relative d-inline-block float-end" style={{ maxWidth: "200px" }}>
          {msg.image && (
            <img
              src={msg.previewUrl}
              alt="preview"
              className="img-fluid rounded"
            />
          )}
          {msg.video && (
            <video
              src={msg.previewUrl}
              className="img-fluid rounded"
            />
          )}

          {/* Spinner overlay */}
          {isSending && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50 rounded"
              style={{ zIndex: 10 }} > 
              <div className="spinner-border text-light" role="status" />
              <div className="text-light">{uploadProgress}%</div>
            </div>
          )}

          {/* Close button */}
          <button
            className="btn btn-sm btn-danger position-absolute"
            style={{ top: 5, right: 5, zIndex: 11, visibility: isSending ? "hidden" : "visible" }}
            onClick={() => setMsg(prev => ({
              ...prev,
              image: null,
              video: null,
              previewUrl: null
            }))}
          >
            ×
          </button>
        </div>
      )}

      {/* Input controls */}
      <div className="input-group p-3 border-top bg-light">
        <input
          type="text"
          className="form-control"
          name="text"
          value={msg.text}
          onChange={handleOnChange}
          placeholder="Type your message"
          disabled={isSending}
        />
        <button type="button" className="btn btn-outline-primary" onClick={handleImageBtn}>
          <FaImage />
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={handleVideoBtn}>
          <FaVideo />
        </button>
        <button
          className="btn btn-success"
          type="button"
          onClick={handleSendMessage}
          disabled={isSending}
        >
          {isSending ? (
            <div className="spinner-border spinner-border-sm text-light" role="status" />
          ) : (
            <IoSend size={20} color="white" />
          )}
        </button>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        accept="image/*"
        ref={imageBtnRef}
        onChange={handleOnChange}
        name="image"
        hidden
        disabled={isSending}
      />
      <input
        type="file"
        accept="video/*"
        ref={videoBtnRef}
        onChange={handleOnChange}
        name="video"
        hidden
        disabled={isSending}
      />
    </div>
  );
}

export default ChatInput;
