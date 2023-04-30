import styled from "styled-components";
import Head from "next/head";
import { Button } from "@mui/material";
import { signInWithPopup } from "firebase/auth";
import { app } from "../../firebase";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const Login = () => {
    const signIn = () =>
        signInWithPopup(auth, provider).catch((err) => alert(err));

    return (
        <>
            <Container>
                <Head>
                    <title>Login</title>
                </Head>
                <LoginContainer>
                    <Logo src="https://i.imgur.com/quMVBMg.png" />
                    <Button onClick={signIn} variant="outlined">
                        Sign in with Google
                    </Button>
                </LoginContainer>
            </Container>
        </>
    );
};

export default Login;
const Container = styled.div`
    display: grid;
    place-items: center;
    height: 100vh;
    background: whitesmoke;
`;
const LoginContainer = styled.div`
    padding: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.08);
`;
const Logo = styled.img`
    height: 100px;
    width: 100px;
    margin-bottom: 50px;
`;
