import { useState } from 'react';
import { Box, TextField, Card, styled, Alert, Typography, Button, IconButton, Avatar, createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { Clear } from "@mui/icons-material"
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, storage, db, } from '../firebase'
import { doc, setDoc } from "firebase/firestore"
import { useNavigate, Link } from 'react-router-dom'
import logo from "../logo512.png"
import registerDefault from "../registerDefault.png"

const Page = styled(Box)(({ theme }) => ({
    background: "#1b1b1b",
    width: "100%",
    position: "fixed",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection:"column",
    [theme.breakpoints.down('md')]: {
        background: '#322b25',
    }
}))

const RegisterCard = styled(Card)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    overflow: "auto",
    minWidth: 300,
    height: "83%",
    background: "#322b25",
    padding: "20px",
    borderRadius: "7px",
    [theme.breakpoints.down('md')]: {
        boxShadow: "none"
    },
    /* width */
    "&::-webkit-scrollbar": {
        width: '0'
    },
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

export default function Register() {
    const [err, setErr] = useState(false)
    const [errmsg, setErrmsg] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("pass").value;
        const displayName = e.target[0].value;
        const file = document.getElementById("avatar").files[0]

        const handle = '@' + displayName.split(" ").join("").toLowerCase() + Math.floor(1000 + Math.random() * 9000)

        try {
            //Create user
            const res = await createUserWithEmailAndPassword(auth, email, password);

            //Create a unique image name
            const date = new Date().getTime();
            const storageRef = ref(storage, `${displayName + date}`);

            await uploadBytesResumable(storageRef, file).then(() => {
                getDownloadURL(storageRef).then(async (downloadURL) => {
                    try {
                        //Update profile
                        await updateProfile(res.user, {
                            displayName,
                            photoURL: downloadURL,
                        });
                        //create user on firestore
                        await setDoc(doc(db, "users", res.user.uid), {
                            uid: res.user.uid,
                            displayName,
                            email,
                            photoURL: downloadURL,
                            handle
                        });

                        //create empty user chats on firestore
                        await setDoc(doc(db, "userChats", res.user.uid), {});
                        await sendEmailVerification(res.user)
                        alert("Verification Link Sent to Email, Verify to Proceed")
                        navigate("/login");
                    } catch (err) {
                        setErr(true);
                    }
                });
            });
        }
        catch (err) {
            setErr(true)
            const errorCode = err.code;
            if (errorCode === "auth/weak-password") {
                setErrmsg("Password should Contain Atleast 6 Letters")
            }

            else if (errorCode === "auth/missing-email") {
                setErrmsg("Email is not Provided")
            }

            else if (errorCode === "auth/email-already-in-use") {
                setErrmsg("Email is Already Registered")
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
            // ..
        };


    }


    const [selectimage, setImage] = useState(null)
    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setImage(URL.createObjectURL(event.target.files[0]));
        }
    }

    return (
        <Page >
            <RegisterCard>
                <Box sx={{ textAlign: "center", width: "100%", display: "block" }} >
                    <Box><img src={logo} width={"75px"} alt="Linkon" /></Box>
                    <Typography variant="h5" sx={{ pt: 2, color: "#fffcf9" }}>Sign Up</Typography>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Input placeholder="Name" variant="outlined" required
                        inputProps={{
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
                        }}
                    />
                    <Input placeholder="Email" variant="outlined" id="email" required type="email"
                        inputProps={{
                            sx: {
                                color: '#7e7a77',
                                paddingLeft: '15px',

                            },
                        }} InputLabelProps={{ shrink: false, display: "none" }} sx={{
                            backgroundColor: '#171310',
                            borderRadius: 3,
                            color: "#b0a9a6",
                            marginTop:1,
                            border: 'none',
                            "& fieldset": { border: 'none' },
                        }}
                    />
                    <Input placeholder="Password" variant="outlined" id="pass" type="password" required
                        inputProps={{
                            sx: {
                                color: '#7e7a77',
                                paddingLeft: '15px',

                            },
                        }} InputLabelProps={{ shrink: false, display: "none" }} sx={{
                            backgroundColor: '#171310',
                            borderRadius: 3,
                            marginTop:1,
                            color: "#b0a9a6",
                            border: 'none',
                            "& fieldset": { border: 'none' },
                        }}
                    />
                    <Box sx={{ background: "#171310", justifyContent: "center", alignItems: "center", my: "15px", p: "15px 10px",mt:1, border: "none", borderRadius: "15px" }}><Typography noWrap sx={{ color: "#7e7a77cc", ml: 1 }}>Profile Photo &nbsp; </Typography> <input type="file" id="avatar" accept='image/*' onChange={onImageChange} style={{ display: "none" }} /><label htmlFor="avatar"><Avatar sx={{ width: 70, height: 70, display: "block", margin: "auto", objectFit: "cover", alignItems: "center" }} src={selectimage ? selectimage : registerDefault} /></label></Box>
                    <Button type="submit" variant="contained" sx={{ background: "#e4ac50", width: "100%", py: "10px", mt: 2, "&:hover": { background: "#e4ac50" } }}>Register Now</Button>
                    <Typography sx={{ pt: 2, textAlign: "center", color: "#ded9d4" }}>Already have an account? <Link to="/login" style={{ color: "#e4ab51" }}>Sign In</Link></Typography>
                    {err === true &&
                        <ThemeProvider theme={darkTheme}>
                            <CssBaseline /><Alert color='warning' title='Error' action={<IconButton onClick={() => { setErr(false) }}><Clear /></IconButton>} severity="error" sx={{ display: "flex", alignItems: "center", transition: "all 0.2s ease-in-out", position: "fixed", bottom: "20px", left: "20px", }}>{errmsg}</Alert>
                        </ThemeProvider>
                    }
                </form>
            </RegisterCard>
            <Typography sx={{ fontSize:"13px",background:"#1b1b1b",mt: 2,p:1, textAlign: "center", color: "#a9a9a9",borderRadius:1,fontWeight:"800" }}>With ❤️ from <a href="https://api.whatsapp.com/send?phone=919044558703&text=Hi%2C%20I%20Used%20Linkon%20and%20Had%20Some%20Feedback%20Regarding%20it!" target="_blank" style={{color:"#ded9d4",fontWeight:"800"}}>DEVCOST Tech.</a></Typography>
        </Page>
    )
}