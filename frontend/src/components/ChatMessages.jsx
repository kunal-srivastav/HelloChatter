import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteMessage, getUserMessages } from "../features/messages/messageThunks";
import { deleteChatMessage } from "../features/messages/messageSlice";

function ChatMessages() {

    const bottomRef = useRef(null);
    const { loggedInUser, remoteUser } = useSelector((state) => state.users); 
    const { messages } = useSelector(state => state.messages);
    const [msgCopied, setMsgCopied] = useState("");
    const dispatch = useDispatch();

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
      const fetchMsg = async () => {
        if(remoteUser) {
          dispatch(getUserMessages(remoteUser?._id));
        }
      };
      fetchMsg();
    }, [remoteUser]);

    const handleCopy = (text) => {
      navigator.clipboard.writeText(text);
      setMsgCopied("Copied!");
      setTimeout(() => {
        setMsgCopied("");
      }, 2000);
    };

    const handleDelete = async (msgId) => {
      const res = await dispatch(deleteMessage(msgId));
      const { deletedMsgId } = res.payload;
      if(deletedMsgId) {
        dispatch(deleteChatMessage(deletedMsgId));
      }
    };

    return (
      <div className="flex-grow-1 bg-transparent p-3 overflow-auto position-relative"
        style={{ maxHeight: 'calc(100vh - 160px)' }} >
        <ul className="list-unstyled">
          {messages?.length > 0 &&
            messages?.map((msg, index) => {
              if (!msg) return null; // Skip if msg is undefined or null
              const { senderId, text, image, video, createdAt } = msg;
              const isMine = senderId?._id === loggedInUser?._id;

              return (
                <li key={msg?._id} className={`d-flex mb-2 ${isMine ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div className="d-flex align-items-start">
                    {!isMine && (
                      <img src={senderId?.avatar} alt="avatar" className="mt-2 mx-1 rounded-circle"
                        width={25} height={25} />
                    )}

                    <div className="d-flex flex-column align-items-end position-relative">
                      {/* Image Message */}
                      {image && (
                        <img src={image} alt="sent-img" style={{ maxWidth: '200px', borderRadius: '10px' }}
                          className="mb-1" />
                      )}

                      {/* Video Message */}
                      {video && (
                        <video src={video} controls style={{ maxWidth: '200px', borderRadius: '10px' }}
                          className="mb-1" />
                      )}

                      {/* Text Message */}
                      {text && (
                        <span className={`px-3 py-2 border rounded-pill d-inline-block ${
                            isMine ? 'text-light bg-primary' : 'text-success bg-light'
                          }`} >
                          {text}
                          <small className="text-muted mx-1" style={{ fontSize: '0.65rem' }}>
                            {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit',
                              minute: '2-digit' })}
                          </small>
                        </span>
                      )}

                      {/* Dropdown Options for Sender */}
                      {isMine && (
                        <div className="dropdown position-absolute" style={{ top: 0, right: isMine ? 0 : 'auto' }}>
                         <button
                            className="btn btn-transparent mt-1 rounded-circle"
                            style={{ width: '30px', height: '30px' }}
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            aria-label="Message options"
                          >
                            <span style={{ fontSize: "1.25rem" }}>⋮</span>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end bg-dark">
                            <li>
                              <button className="dropdown-item text-success" onClick={() => handleCopy(text)}>
                                Copy
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item text-danger" onClick={() => handleDelete(msg?._id)}>
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
        <div ref={bottomRef}></div>
        {msgCopied && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-2" role="alert">
          {msgCopied}
        </div>
      )}
      </div>
    )
};

export default ChatMessages;