import styled from "styled-components";
import { Avatar, Button } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import { useAuthState } from "react-firebase-hooks/auth";
import {
    collection,
    getFirestore,
    query,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { app } from "../../firebase";
import { getAuth } from "firebase/auth";
import { useEffect } from "react";
import { useState } from "react";

const auth = getAuth(app);
const db = getFirestore(app);
const Sidebar = () => {
    const [user] = useAuthState(auth);
    const [chats, setChats] = useState([]);

    //Side effect for getting chats from database
    useEffect(() => {
        const chatsRef = collection(
            db,
            "messages",
            `ashish.blackhawk@gmail.com`,
            `allChats`
        );

        const getChatsQuery = query(chatsRef, orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(
            getChatsQuery,
            (querySnapshot) => {
                console.log(user.email);
                console.log(querySnapshot);
                setChats(querySnapshot.docs.map((doc) => doc.data()));
            },
            (queryError) => {
                console.log("Query Error", queryError);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [user]);
    return (
        <Container>
            <Header>
                <UserAvatar
                    onClick={() => auth.signOut()}
                    src={user?.photoURL}
                />
                <IconsContainer>
                    <ChatIcon />
                    <MoreVertIcon />
                </IconsContainer>
            </Header>
            <SearchContainer>
                <SearchIcon />
                <SearchInput placeholder="Search in chats" />
            </SearchContainer>
            {console.log(chats.length)}
            {user && chats.length && (
                <>
                    {console.log(chats)}
                    {chats?.map((chat) => (
                        <>
                            <p>{chat.contact}</p>
                        </>
                    ))}
                </>
            )}
        </Container>
    );
};
export default Sidebar;
const Container = styled.div`
    width: 25vw;
    height: 95vh;
    border-right: 1px solid whitesmoke;
`;
const Header = styled.div`
    display: flex;
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 1;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    height: 50px;
    border-bottom: 1px solid whitesmoke;
`;
const UserAvatar = styled(Avatar)`
    cursor: pointer;
    :hover {
        opacity: 0.8;
    }
`;
const IconsContainer = styled.div``;
const SearchContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 15px;
`;
const SearchInput = styled.input`
    border: none;
    outline: none;
    flex: 1;
`;
const SidebarButton = styled(Button)`
    width: 100%;
    border-top: 1px solid whitesmoke;
    border-bottom: 1px solid whitesmoke;
`;
