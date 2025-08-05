import { CiVideoOn } from "react-icons/ci";
import { IoMdArrowBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";

function ChatHeader () {

    const { remoteUser } = useSelector((state) => state.users); 

    if (!remoteUser) return null;

    return (
      <header className="py-3 border-bottom d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <Link to="/" className="me-3 text-decoration-none text-dark">
            <IoMdArrowBack size={25} />
          </Link>
          <img src={remoteUser?.avatar} className="rounded-circle me-2" width={40} height={40} alt="avatar" />
          <div>
            <strong>{remoteUser?.fullName}</strong>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <NavLink to={`/${remoteUser._id}/video-call`} className="nav-link">
            <CiVideoOn size={30} color="black" />
          </NavLink>
        </div>
      </header>
    )
};

export default ChatHeader;