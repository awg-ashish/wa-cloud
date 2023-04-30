import styled from "styled-components";
import { Avatar } from "@mui/material";
import getRecipientEmail from "@/utils/getRecipientEmail";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { query, collection, where } from "firebase/firestore";
import { useRouter } from "next/router";

const Chat = ({ id, users }) => {
    const [loggedInUser] = useAuthState(auth);
    const router = useRouter();

    const recipientRef = query(
        collection(db, "users"),
        where("email", "==", getRecipientEmail(users, loggedInUser))
    );

    const [recipientSnapshot] = useCollection(recipientRef);
    const recipient = recipientSnapshot?.docs?.[0]?.data();

    const recipientEmail = getRecipientEmail(users, loggedInUser);

    const enterChat = () => {
        router.push(`/chat/${id}`);
    };
    return (
        <Container onClick={enterChat}>
            {recipient ? (
                <UserAvatar src={recipient.photoURL} />
            ) : (
                <UserAvatar>{recipientEmail[0].toUpperCase()}</UserAvatar>
            )}
            <p>{recipientEmail}</p>
        </Container>
    );
};
export default Chat;
const Container = styled.div`
    display: flex;
    padding: 10px;
    word-break: break-word;
    cursor: pointer;
    :hover {
        background-color: #e9eaeb;
    }
`;
const UserAvatar = styled(Avatar)`
    margin-right: 10px;
`;
