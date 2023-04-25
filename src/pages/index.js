import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    const bearer = process.env.NEXT_PUBLIC_WHATSAPP_TOKEN;
    const [messageText, setMessageText] = useState("");
    const sendMessage = async () => {
        console.log("Sending..");
        console.log(bearer);
        try {
            const response = await axios.post(
                "https://graph.facebook.com/v16.0/111369568531545/messages",
                {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: "919471070789",
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
            setMessageText("");
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div>
            <input
                type="text"
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}
