import UserList from './UserList';
import Profile from './Profile';
import { useDispatch, useSelector } from 'react-redux';
import UserChat from '../components/UserChat';
import { useEffect, useState } from "react";
import { setIncomingCall } from "../features/calls/callSlice";
import { socket } from "../utils/socket";
import { getAllUsers } from "../features/users/userThunks";
import { addChatMessages, setIncomingMessage } from "../features/messages/messageSlice";
import IncomingCallPopup from "../components/IncomingCallPopup";
import MessageAlertPopup from "../components/MessageAlertPopup";
import Welcome from "../components/Welcome";

function ChatRoom() {

  const dispatch = useDispatch();
  const { remoteUser, users } = useSelector(state => state.users);
  const { incomingMessage } = useSelector(state => state.messages);
  const { incomingCall, error, acceptCall } = useSelector(state => state.calls);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (incomingMessage) {
      setShowAlert(true); 

      const timer = setTimeout(() => {
        setShowAlert(false); // Just hide the alert after timeout
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [incomingMessage]);

  useEffect(() => {
    socket.on("receive-message", ({message}) => {
      dispatch(setIncomingMessage(message));
      dispatch(addChatMessages(message));

      // Play sound
      const audio = new Audio("./sounds/message-notification.wav");
      audio.play().catch(err => console.log("Audio play failed:", err));

    });

    return () => {
      socket.off("receive-message");
    }
  }, []);

  useEffect(() => {
    dispatch(getAllUsers());
    socket.on("receive-offer", ({from, offer}) => {
      const user = users?.find(user => user._id === from);
      dispatch(setIncomingCall({from, offer, fullName: user?.fullName, avatar: user?.avatar}));
      if(!acceptCall) {
        const audio = new Audio("./sounds/incoming-call-notification.mp3");
        audio.play().catch(err => console.log("Audio play failed:", err));
      }
    });

    return () => {
      socket.off("receive-offer");
    };
  }, [dispatch, users]);

  return (
    <div className="row border position-relative" style={{height: "100vh"}}>
      {/* Sidebar */}
      <UserList />

      {/* Incoming Call Popup */}
      {incomingCall && (
        <IncomingCallPopup />
      )}
      {showAlert && (
        <MessageAlertPopup />
      )}

      {/* Chat Area */}
      {remoteUser ? (
        <UserChat />
      ) : (
        <Welcome />
      )}

      {/* Profile Panel */}
      <Profile />
      {error && (
        <div className="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-2" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export default ChatRoom;
