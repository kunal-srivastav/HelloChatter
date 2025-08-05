import { useEffect} from "react";
import { useSelector } from "react-redux";
import MessageHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { socket } from "../utils/socket";

function UserChat() {

    const { loggedInUser } = useSelector((state) => state.users);

    useEffect(() => {
        if (!loggedInUser) return;

        const onConnect = () => {
            console.log("Connected to server");
        };

        socket.on("connect", onConnect);

        return () => {
            socket.off("connect", onConnect);
        };
    }, [loggedInUser]);

    return (
        <div className="col-12 col-md-6 d-flex flex-column overflow-hidden" style={{ height: "100%" }}>
            <MessageHeader />
            <ChatMessages />
            <ChatInput />
        </div>
    )
}

export default UserChat;