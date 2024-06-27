import { useState } from 'react';
import { Box, TextField, Card, Alert, styled, Typography, Button, IconButton, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { Clear } from "@mui/icons-material"
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, deleteUser, signOut } from 'firebase/auth';
import { auth } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'
import logo from "../logo512.png"

const Page = styled(Box)(({ theme }) => ({
    background: "#1b1b1b",
    width: "100%",
    height: "100%",
    position: "fixed",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    [theme.breakpoints.down('md')]: {
        background: '#322b25',
    },
}))

const LoginCard = styled(Card)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    minWidth: 300,
    background: "#322b25",
    padding: "20px",
    borderRadius: "7px",
    [theme.breakpoints.down('md')]: {
        boxShadow: "none"
    }

}))

const Input = styled(TextField)({
    fontSize: "10px",
    marginTop: "20px",
    width: '100%',
})

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export default function Login() {
    const [err, setErr] = useState(false)
    const [errmsg, setErrmsg] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await signInWithEmailAndPassword(auth, email, password)
            if (res.user.emailVerified) {
                navigate("/")
            }
            else {
                signOut(auth)
                setErr(true)
                setErrmsg("Email Not Verified, Login with a Verified Email!")
            }
        } catch (err) {
            setErr(true)
            if (err.code === "auth/user-not-found") {
                setErrmsg("User does Not Found")
            }
        }
    }


    const changepass = async () => {
        const email = prompt("Write Your Email to Continue")

        await sendPasswordResetEmail(auth, email)
            .then(() => {
                alert("Reset Link Sent to Email Successfully")
            })
            .catch((error) => {
                setErr(true)
                const errorCode = error.code;
                if (errorCode === "auth/user-not-found") {
                    setErrmsg("Email not Registered")
                }

                else if (errorCode === "auth/invalid-email") {
                    setErrmsg("Email is not Valid")
                }

                else {
                    // let text = errorCode;
                    // const myArray = text.split("/");
                    // const error = myArray[1][0].toUpperCase() + myArray[1].substring(1)
                    // setErrmsg(error)
                    setErrmsg("Something Went Wrong")
                }
            });

    }


    return (
        <Page>
            <LoginCard>
                <Box sx={{ textAlign: "center", width: "100%", display: "block" }}>
                    <Box><img src={logo} width={"80px"} alt="Linkon" /></Box>
                    <Typography variant="h5" sx={{ pt: 2, color: "#fffcf9" }}>Sign In</Typography>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Input placeholder="Email" variant="outlined" id="email" type="email" required inputProps={{
                        sx: {
                            color: '#7e7a77',
                            paddingLeft: '15px',

                        },
                    }} InputLabelProps={{ shrink: false, display: "none" }} sx={{
                        backgroundColor: '#171310',
                        borderRadius: 3,
                        color: "#b0a9a6",
                        border: 'none',
                        "& fieldset": { border: 'none' },
                    }} />
                    <Input inputProps={{
                        sx: {
                            color: '#7e7a77',
                            paddingLeft: '15px',
                        },
                    }} InputLabelProps={{ shrink: false, display: "none" }} sx={{
                        backgroundColor: '#171310',
                        marginTop: 1,
                        borderRadius: 3,
                        color: "#b0a9a6",
                        border: 'none',
                        "& fieldset": { border: 'none' },
                    }} placeholder='Password' variant="outlined" id="password" type="password" required />



                    <Box style={{ display: "flex", justifyContent: "flex-end", }}> <Button onClick={changepass} sx={{ mt: 1.5, p: 0, color: "#ded9d4" }}>Forget Password?</Button></Box>
                    <Button variant="contained" sx={{ background: "#e4ac50", width: "100%", py: "14px", mt: 2, "&:hover": { background: "#e4ac50" } }} type="submit">Login Now</Button>
                </form>
                <Typography sx={{ pt: 2, color: "#ded9d4" }}>New to Linkon? <Link to="/register" style={{ color: "#e4ab51" }}>Sign Up</Link></Typography>

            </LoginCard>
            <Typography sx={{ fontSize: "13px", background: "#1b1b1b", mt: 2, p: 1, textAlign: "center", color: "#a9a9a9", borderRadius: 1, fontWeight: "800" }}>With ❤️ from <a href="https://api.whatsapp.com/send?phone=919044558703&text=Hi%2C%20I%20Used%20Linkon%20and%20Had%20Some%20Feedback%20Regarding%20it!" target="_blank" style={{ color: "#ded9d4", fontWeight: "800" }}>DEVCOST Tech.</a></Typography>
            <div id="recaptcha-container"></div>
            {err === true &&
                <ThemeProvider theme={darkTheme}>
                    <CssBaseline /><Alert color='warning' title='Error' action={<IconButton onClick={() => { setErr(false) }}><Clear /></IconButton>} severity="error" sx={{ display: "flex", alignItems: "center", transition: "all 0.2s ease-in-out", position: "fixed", bottom: "20px", left: "20px", }}>{errmsg}</Alert>
                </ThemeProvider >}
        </Page>
    )
}