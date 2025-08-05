import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { addOnlineUser, removeOfflineUser, setRemoteUser } from '../features/users/userSlice';
import { socket } from '../utils/socket';
import { getUnreadMessages, markAsReadMessages } from '../features/messages/messageThunks';
import { setUnreadMessage } from '../features/messages/messageSlice';

function UserList() {
  const dispatch = useDispatch();
  const { unreadMessages, incomingMessage } = useSelector(state => state.messages);
  const { users, loggedInUser, onlineUsers } = useSelector(state => state.users);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    setFiltered(users);
  }, [users]);

  useEffect(() => {
    if(!loggedInUser) return null;
    dispatch(getUnreadMessages(loggedInUser?._id));
  }, [incomingMessage]);

  useEffect(() => {
    socket.on("online-user", (userId) => dispatch(addOnlineUser(userId)) );
    socket.on("offline-user", (userId) => dispatch(removeOfflineUser(userId)) );

    return () => {
      socket.off("online-user");
      socket.off("offline-user");
    };
  }, [dispatch]);

  const handleSearch = (e) => {
    const { value } = e.target;
    if (!value.trim()) {
      setFiltered(users);
      return;
    }
    const result = users?.filter(user =>
        user?.fullName?.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(result);
  };

  const handleRemoteUser = async (user) => {
    dispatch(setRemoteUser(user));
    await dispatch(markAsReadMessages({senderId: user?._id, receiverId: loggedInUser?._id}));
    dispatch(setUnreadMessage({senderId: user?._id, receiverId: loggedInUser?._id}))
  }

  return (
    <div className="col-12 col-md-3 d-flex flex-column border-end flex-shrink-0 p-3">
      {/* App Brand */}
      <Link to="/" className="d-flex align-items-center mb-4 text-white text-decoration-none">
        <IoChatbubbleEllipsesOutline size={30} />
        <h2 className="fs-4 ms-2 mt-2">Chat <span className='text-dark'>App</span></h2>
      </Link>

      {/* Search */}
      <input type="text" className="form-control bg-dark text-light mb-4"
        onChange={handleSearch}
        placeholder="Search here..." aria-label="Search Users" />

      {/* User list */}
      <ul className="nav nav-pills flex-column mb-auto" style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
        {filtered?.length > 0 ? (
          filtered?.map((user) => {
            const userUnreadCount = unreadMessages?.filter(msg => msg.senderId === user?._id).length || 0;
            return (
            <li className="nav-item mb-3 d-flex border-top border-dark align-items-center"
              onClick={() => {handleRemoteUser(user)}}
              key={user?._id}
              style={{ cursor: "pointer", transition: "background 0.2s" }}
            >
              <div className="position-relative me-3">
                <img src={user?.avatar} className="rounded-circle" width={45} height={45}
                  alt="User Avatar" />
                {onlineUsers && onlineUsers.includes(user?._id) && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle-x p-1 border border-white rounded-circle"
                    style={{ width: "10px", height: "10px", backgroundColor: "#25D366" }} />
                )}
              </div>

              <div>
                <div className="text-white p-0">
                  <strong>{user?.fullName}</strong>
                </div>
                {onlineUsers && onlineUsers.includes(user?._id) ? (
                  <small className='text-success'>Online</small>
                ): (
                  <small className='text-secondary' >Offline</small>
                )
                }
              </div>
              {userUnreadCount > 0 && (
                <span className="badge ms-auto me-2" style={{ backgroundColor: "#25D366" }}>
                  {userUnreadCount}
                </span>
              )}
            </li>
        )})) : (
          <h2>No user found</h2>
        )}
      </ul>
    </div>
  );
}

export default UserList;
