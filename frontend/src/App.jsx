import { useEffect, useState } from 'react'
import { Routes, Route} from "react-router-dom"
import Login from './pages/Login';
import Register from './pages/Register';
import VideoCall from './pages/VideoCall';
import ChatRoom from './pages/ChatRoom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './features/users/userThunks';
import { socket } from './utils/socket';
import { setClearMsg } from './features/users/userSlice';

function App() {

  const { loggedInUser } = useSelector(state => state.users);
  const dispatch = useDispatch();
  const [userChecked, setUserChecked] = useState(false);

useEffect(() => {
  if (!userChecked) {
    dispatch(getCurrentUser())
      .finally(() => setUserChecked(true));
  }
}, [dispatch, userChecked]);

// clear messages after 3s
useEffect(() => {
  const timer = setTimeout(() => {
    dispatch(setClearMsg());
  }, 3000);
  return () => clearTimeout(timer);
}, [dispatch]);


  useEffect(() => {
    if (loggedInUser) {
      socket.emit("user-connect", loggedInUser._id); // Register user with socket
    }
  }, [loggedInUser]);

  return (
    <div className='container-fluid'>
      <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/register' element={< Register />} />
            {loggedInUser && (
              <>
              <Route path='/:userId/update-profile' element={loggedInUser && <Register />} />
              <Route path='/chat' element={loggedInUser && <ChatRoom />} />
              <Route path='/:remoteUserId/video-call' element={loggedInUser && <VideoCall /> } />        
              </>
            )}
      </Routes>
    </div>
  )
}

export default App;