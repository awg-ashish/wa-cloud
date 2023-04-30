import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import app from "../../firebase";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    Timestamp,
    query,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import ChatScreen from "../components/ChatScreen";
const auth = getAuth(app);
const db = getFirestore(app);

export default function Home() {
    const bearer = process.env.NEXT_PUBLIC_WHATSAPP_TOKEN;
    const [messageText, setMessageText] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [messages, setMessages] = useState([]);
    const endOfMessagesRef = useRef(null);
    const [user] = useAuthState(auth);

    //Side effect for getting messages from database
    useEffect(() => {
        const messageRef = collection(
            db,
            "messages",
            `${user?.email}`,
            `91${phoneNumber}`
        );

        const getMessagesQuery = query(messageRef, orderBy("timestamp"));
        const unsubscribe = onSnapshot(
            getMessagesQuery,
            (querySnapshot) => {
                setMessages(querySnapshot.docs.map((doc) => doc.data()));
                setTimeout(() => {
                    scrollToBottom();
                }, 500);
            },
            (queryError) => {
                console.log("Query Error", queryError);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [phoneNumber, user]);

    //function for scrolling to bottom of screen
    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    //function for sending messages
    const sendMessage = async () => {
        try {
            console.log(bearer);
            console.log(`trying...`);
            console.log(phoneNumber);
            console.log(messageText);
            const response = await axios.post(
                "https://graph.facebook.com/v16.0/111369568531545/messages",
                {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: `91${phoneNumber}`,
                    type: "text",
                    text: {
                        // the text object
                        preview_url: false,
                        body: `${messageText}`,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${bearer}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(response.data);
            //prepare data for entry in firestore
            const outgoingDataToFirestore = {
                messageId: response.data.messages[0].id,
                category: "OUTGOING",
                type: "text",
                status: "sending",
                statusUpdatedOn: `${Timestamp.now().seconds}`,
                timestamp: `${Timestamp.now().seconds}`,
                body: `${messageText}`,
            };

            if (user) {
                //add data to firestore
                const messageRef = doc(
                    db,
                    "messages",
                    `${user.email}`,
                    `91${phoneNumber}`,
                    response.data.messages[0].id
                );
                await setDoc(messageRef, outgoingDataToFirestore, {
                    merge: true,
                });
                //add the contact to chat list
                const chatRef = doc(
                    db,
                    "messages",
                    `${user.email}`,
                    "allChats",
                    `91${phoneNumber}`
                );
                await setDoc(chatRef, {
                    contact: `91${phoneNumber}`,
                    timestamp: `${Timestamp.now().seconds}`,
                });
            }
            setMessageText("");
            scrollToBottom();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Container>
                <Sidebar />
                <ChatScreen />
            </Container>

            <input
                type="text"
                placeholder="Enter Phone Number..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
                type="text"
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
            {phoneNumber && messages.length && (
                <>
                    {console.log(messages)}
                    {messages?.map((message) => (
                        <p>{message.body}</p>
                    ))}
                    <div ref={endOfMessagesRef}>----------</div>
                </>
            )}
        </>
    );
}
const Container = styled.div`
    display: flex;
    width: 95vw;
    height: 95vh;
    border: 2px solid black;
`;
