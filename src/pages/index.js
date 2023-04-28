import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import app from "../../firebase";
import {
    collection,
    getFirestore,
    doc,
    setDoc,
    Timestamp,
    query,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
const db = getFirestore(app);

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    const bearer = process.env.NEXT_PUBLIC_WHATSAPP_TOKEN;
    const [messageText, setMessageText] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [messages, setMessages] = useState([]);
    const endOfMessagesRef = useRef(null);

    //Side effect for getting messages from database
    useEffect(() => {
        const messageRef = collection(
            db,
            "messages",
            "ashish.blackhawk@gmail.com",
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
    }, [phoneNumber]);

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

            const outgoingDataToFirestore = {
                messageId: response.data.messages[0].id,
                category: "OUTGOING",
                type: "text",
                status: "sending",
                statusUpdatedOn: `${Timestamp.now().seconds}`,
                timestamp: `${Timestamp.now().seconds}`,
                body: `${messageText}`,
            };
            const messageRef = doc(
                db,
                "messages",
                "ashish.blackhawk@gmail.com",
                `91${phoneNumber}`,
                response.data.messages[0].id
            );
            await setDoc(messageRef, outgoingDataToFirestore, {
                merge: true,
            });
            setMessageText("");
            scrollToBottom();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
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
        </div>
    );
}
