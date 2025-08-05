import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

function Welcome () {
    return (
      <div className="col-12 col-md d-flex flex-column justify-content-center align-items-center text-white px-3">
        <div
          className="text-center bg-opacity-50 p-4 rounded-4"
          style={{ backgroundColor: "#3A0519", minHeight: "60vh" }} >
          <IoChatbubbleEllipsesOutline size={60} />
            <h3 className="mt-3 fs-4 fs-md-3">Welcome to ChatApp 👋</h3>
            <p className="fs-6 fs-md-5">Select a user from the left to start chatting.</p>
        </div>
      </div>
    )
};

export default Welcome;