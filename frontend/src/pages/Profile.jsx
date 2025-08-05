import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logOut } from '../features/users/userThunks';
import { socket } from '../utils/socket';
import { setClearMsg, setError } from '../features/users/userSlice';

function Profile() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { loggedInUser } = useSelector(state => state.users);

    const handleLogout = async () => {
        try {
            socket.emit("user-disconnect", loggedInUser?._id, () => {
                socket.disconnect();
            });
            await dispatch(logOut()).unwrap();
            navigate("/");
        } catch (err) {
            dispatch(setError(err || "Logout failed"));
        } finally {
            dispatch(setClearMsg());
        }
    };

  return (
    <div className="col-12 col-md-3 p-4 border-start text-center">
        <Link to={`/${loggedInUser?._id}/update-profile`}>
            <img
                src={loggedInUser?.avatar}
                className="mt-5 rounded-circle img-fluid"
                style={{ maxWidth: "200px", height: "auto" }}
                alt="User Avatar"
                />
        </Link>
        <h2 className="mt-3 fs-4 fs-md-3">{loggedInUser?.fullName}</h2>
        <h6 className="text-secondary">{loggedInUser?.email}</h6>
        <button onClick={handleLogout} className='btn btn-dark mt-2'>Logout</button>
    </div>
  )
}

export default Profile