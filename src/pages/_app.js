import { useAuthState } from "react-firebase-hooks/auth";
import Login from "./login";
import { app } from "../../firebase";
import { getFirestore, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useEffect } from "react";
const db = getFirestore(app);
const auth = getAuth(app);

export default function App({ Component, pageProps }) {
    const [user, loading] = useAuthState(auth);

    useEffect(() => {
        if (user) {
            setDoc(
                doc(db, "users", user.uid),
                {
                    email: user.email,
                    lastSeen: serverTimestamp(),
                    photoURL: user.photoURL,
                },
                { merge: true }
            );
        }
    }, [user]);
    if (loading) return <p>Loading...</p>;
    if (!user) return <Login />;
    return <Component {...pageProps} />;
}
