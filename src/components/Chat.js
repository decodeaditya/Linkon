import { Box, Avatar, Typography, styled, IconButton, Button, TextField, Grid, Input, Alert, Modal, Card, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { Clear, ArrowBackRounded, Send, Close, Share } from "@mui/icons-material"
import { useContext, useEffect, useState, useRef, useLayoutEffect } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import { onSnapshot, doc, updateDoc, arrayUnion, Timestamp, serverTimestamp, getDoc, setDoc, arrayRemove } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { v4 as uuid } from 'uuid'
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import userProfileImg from "../userProfileImage.png"
import openChatImg from '../openChatImg.png'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
        background:"#312a24"
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
        background:"#312a24",
    },
}));

const Chatbox = styled(Box)(({ theme }) => ({
    background: "#f1f1f1",
    height: "100%",
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;',
}));

const styles = theme => ({
    textField: {
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingBottom: 0,
        marginTop: 0,
        fontWeight: 500
    },
    input: {
        color: 'white'
    }
});

const Header = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5,
    height: "50px",
    background: "#322b25",
    color: "#ffffff",
    padding: "1rem",
}))

const ChatContainer = styled(Grid)(({ theme }) => ({
    overflowY: "auto",
    background: "#1b1b1b",
    backgroundSize: "cover",
}))

const GetChat = styled(Grid)(({ theme }) => ({
    padding: "2rem",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflowY: "scroll",
    '&::-webkit-scrollbar': {
        width: 0
    },
    height: "100vh",
}))


const GetBox = styled(Box)(({ theme, Input }) => ({
    background: "#312a24",
    padding: "10px",
    borderRadius: "10px",
    borderTopLeftRadius: "0",
    display: "inline-flex",
    marginTop: "14px",
    width: "fit-content",
    maxWidth: "75%",
    color: "#f0ebe7"
}))

const PostBoxCover = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "right",
}))

const PostBox = styled(Box)(({ theme }) => ({
    background: "#e4ab51",
    padding: "10px",
    borderRadius: "10px",
    borderBottomRightRadius: "0",
    display: "inline-flex",
    marginTop: "14px",
    width: "fit-content",
    float: "right",
    color: "#fffde2",
    maxWidth: "75%"
}))

const InputBox = styled(Grid)(({ theme }) => ({
    zIndex: "999",
    position: "fixed",
    background: "#1b1b1b",
    bottom: "0",
    width: "70%",
    alignItems: "center",
    left: "30vw",
    padding: "1rem",
    boxShadow: 'rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px',
    [theme.breakpoints.down('md')]: {
        left: "0",
        width: "100%",
    }
}))


export default function Chat() {

    const { state, dispatch } = useContext(ChatContext)
    const { CurrentUser } = useContext(AuthContext)
    const [messages, setMessages] = useState([])
    const [err, setErr] = useState(false)
    const [errmsg, setErrmsg] = useState("")
    const [text, setText] = useState("")

    const handleSend = async () => {
        if (text.length != 0) {
            try {
                await updateDoc(doc(db, 'chats', state.chatId), {
                    messages: arrayUnion(
                        {
                            id: uuid(),
                            senderID: CurrentUser.uid,
                            date: Timestamp.now(),
                            text
                        }
                    )
                })

                await updateDoc(doc(db, "userChats", CurrentUser.uid), {
                    [state.chatId + ".lastmsg"]: {
                        lastmsg: text
                    },
                    [state.chatId + ".date"]: {
                        date: serverTimestamp()
                    }
                })

                await updateDoc(doc(db, "userChats", state.user.uid), {
                    [state.chatId + ".lastmsg"]: {
                        lastmsg: text
                    },
                    [state.chatId + ".date"]: {
                        date: serverTimestamp()
                    }
                })
            } catch (err) {
                setErr(true)
             
            }
            setText("")
        }
    }

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "chats", state.chatId), (doc) => {
            doc.exists() && setMessages(doc.data().messages)
        })
        return () => {
            unsub()
        }
    }, [state.chatId])

    const scrollref = useRef();

    useEffect(() => {
        scrollref.current?.scrollInfoView({ behavior: "smooth" })
    }, [messages])


    const chatclose = () => {
        setMessages([])
        dispatch({ type: "CHANGE_USER", chat: false })
    }

    const [selectimage, setImage] = useState(null)
    const [openImageBox, setOpenImage] = useState(false)

    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setImage(URL.createObjectURL(event.target.files[0]));
            setOpenImage(true)
        }
    }

    const shareImage = async () => {

        const file = document.getElementById("sendImage").files[0]
        const uuidId = uuid()
        const storageRef = ref(storage, uuidId);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            (error) => {
                //TODO:Handle Error
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    await updateDoc(doc(db, "chats", state.chatId), {
                        messages: arrayUnion({
                            id: uuidId,
                            senderID: CurrentUser.uid,
                            date: Timestamp.now(),
                            img: downloadURL,
                        }),
                    });

                    await updateDoc(doc(db, "userChats", CurrentUser.uid), {
                        [state.chatId + ".lastmsg"]: {
                            lastmsg: CurrentUser.uid + "Image" + downloadURL
                        },
                        [state.chatId + ".date"]: {
                            date: serverTimestamp()
                        }
                    })

                    await updateDoc(doc(db, "userChats", state.user.uid), {
                        [state.chatId + ".lastmsg"]: {
                            lastmsg: state.user.uid + "Image" + downloadURL
                        },
                        [state.chatId + ".date"]: {
                            date: serverTimestamp()
                        }
                    })
                });
            }
        );
        setOpenImage(false)
    }

    const InputRef = useRef(null)

    const [InputBoxHeight, setInputBoxHeight] = useState(0)

    useLayoutEffect(() => {
        if (InputRef.current) {
            const { clientWidth, clientHeight } = InputRef.current

            setInputBoxHeight(clientHeight)
        }
    })

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (err) {
            return false;
        }
    }

    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    const deleteMsg = async (mess) => {

        if (window.confirm("Are you sure to delete this message?")) {
            await updateDoc(doc(db, "chats", state.chatId), {
                messages: arrayRemove(mess),
            });
        }


        await updateDoc(doc(db, "userChats", CurrentUser.uid), {
            [state.chatId + ".lastmsg"]: {
                lastmsg: "Message Deleted"
            },
            [state.chatId + ".date"]: {
                date: serverTimestamp()
            }
        })

        await updateDoc(doc(db, "userChats", state.user.uid), {
            [state.chatId + ".lastmsg"]: {
                lastmsg: "Message Deleted By Sender"
            },
            [state.chatId + ".date"]: {
                date: serverTimestamp()
            }
        })
    }

    const deleteImage = async (mess) => {

        if (window.confirm("Are you sure to delete this image?")) {

            await deleteObject(ref(storage, mess.id));

            await updateDoc(doc(db, "chats", state.chatId), {
                messages: arrayRemove(mess),
            });


            await updateDoc(doc(db, "userChats", CurrentUser.uid), {
                [state.chatId + ".lastmsg"]: {
                    lastmsg: "Image Deleted"
                },
                [state.chatId + ".date"]: {
                    date: serverTimestamp()
                }
            })
    
            await updateDoc(doc(db, "userChats", state.user.uid), {
                [state.chatId + ".lastmsg"]: {
                    lastmsg: "Image Deleted by Sender"
                },
                [state.chatId + ".date"]: {
                    date: serverTimestamp()
                }
            })
        }
    }



    return (
        <Chatbox>
            {state.chatopen &&
                <>
                    <Header>
                        <Box sx={{ display: "flex", alignItems: "center" }} >
                            <IconButton onClick={chatclose} sx={{ display: state.chatopen ? "flex" : "none", mr: 0.3 }}>
                                <ArrowBackRounded sx={{ color: "#f3f3f3" }} />
                            </IconButton>
                            <img src={state.user.photoURL} onError={(e) => { e.target.src = userProfileImg }} style={{ border: "0px solid #ccac79", width: 40, height: 40, borderRadius: '50%', padding: "2px", objectFit: "cover" }} />
                           <Box>
                           <Typography variant="h6" sx={{ fontSize: "18px", ml: 1 }}>{state.user.displayName}</Typography>
                           <Typography variant="h6" sx={{ fontSize: "15px", ml: 1 }}>{state.user.handle}</Typography>
                           </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}><IconButton sx={{ paddingTop: 1.2 }} onClick={()=>alert("Voice Calling will be Available Soon!")}><i class="fi fi-rr-phone-call" style={{ color: "#fff", lineHeight: 1.2, marginTop: "5px", fontSize: "18px" }} /></IconButton><IconButton sx={{ ml: 1, paddingTop: 1.2, }} onClick={() => alert("Video Calling Will Be Available Soon!")}><i class="fi fi-rr-video-camera-alt" style={{ color: "#fff", lineHeight: 1.2, marginTop: "5px", fontSize: "20px" }} /></IconButton></Box>
                    </Header><ChatContainer container >
                        <GetChat item sx={{ pb: { md: `${(InputBoxHeight + 50) / 16 + 4}rem`, xs: `${(InputBoxHeight + 50) / 16 + 7}rem` } }}>
                            {messages.map((m) => (
                                m.senderID === CurrentUser.uid ? <PostBoxCover>{m.img ? <Tooltip arrow placement="bottom-end" title={`On ${m.date.toDate().getDate()}/${m.date.toDate().getMonth() + 1}/${m.date.toDate().getFullYear()} at ${formatAMPM(m.date.toDate())}`}><Box component="img" key={m.id} onDoubleClick={() => deleteImage(m)} src={m.img} alt="" sx={{maxWidth: { xs: "75%", md: "50%" }, borderRadius: "10px",marginTop: '14px' }} /></Tooltip> :
                                    <Tooltip arrow placement="bottom-end" title={`On ${m.date.toDate().getDate()}/${m.date.toDate().getMonth() + 1}/${m.date.toDate().getFullYear()} at ${formatAMPM(m.date.toDate())}`}><PostBox key={m.id} onDoubleClick={() => deleteMsg(m)}><Typography wrap>{isValidUrl(m.text) ? <a style={{ color: "#fff" }} href={m.text} target="_blank">{m.text}</a> : m.text}</Typography></PostBox></Tooltip>
                                }</PostBoxCover> : <>{m.img ? <Tooltip arrow placement="bottom-start" title={`On ${m.date.toDate().getDate()}/${m.date.toDate().getMonth() + 1}/${m.date.toDate().getFullYear()} at ${formatAMPM(m.date.toDate())}`}><Box component="img" key={m.id} src={m.img} alt="" sx={{ maxWidth: { xs: "75%", md: "50%" }, borderRadius: "10px", marginTop: '14px' }} /></Tooltip> :

                                    <Tooltip arrow placement="bottom-start" title={`On ${m.date.toDate().getDate()}/${m.date.toDate().getMonth() + 1}/${m.date.toDate().getFullYear()} at ${formatAMPM(m.date.toDate())}`}><GetBox key={m.id}><Typography wrap>{isValidUrl(m.text) ? <a style={{ color: "#e4ab51" }} href={m.text} target="_blank">{m.text}</a> : m.text}</Typography></GetBox></Tooltip>}</>
                            ))}
                        </GetChat>
                        <InputBox ref={InputRef} container sx={{ display: state.chatopen ? "flex" : "none" }}>
                            <Grid item style={{ display: "flex", width: "100%", background: "#312a24", borderRadius: "5rem", alignItems: "center" }}>
                                <TextField placeholder='Type your message' inputProps={{
                                    sx: {
                                        color: '#b0a9a6',
                                        paddingLeft: '15px',
                                    },
                                }} InputLabelProps={{ shrink: false, display: "none" }} sx={{
                                    backgroundColor: 'transparent',
                                    color: "#b0a9a6",
                                    border: 'none',
                                    "& fieldset": { border: 'none' },
                                }} fullWidth value={text} onChange={e => setText(e.target.value)} />
                                <input type="file" id="sendImage" accept='image/*' onChange={onImageChange} style={{ display: "none" }} />
                                <IconButton sx={{ paddingTop: 1.2 }}>   <label htmlFor='sendImage' style={{ paddingTop: 2 }}><i class="fi fi-rr-camera" style={{ color: "#d9aa63", paddingTop: "100px", cursor: "pointer" }} /></label></IconButton>
                                <IconButton sx={{ mx: 1, paddingTop: 1.2, ml: 0.7 }} onClick={handleSend}><i class="fi fi-rr-paper-plane" style={{ color: "#d9aa63", lineHeight: 1.2, marginTop: "8px" }} /></IconButton>
                            </Grid></InputBox>
                    </ChatContainer>

                    <BootstrapDialog
                        onClose={() => setOpenImage(false)}
                        aria-labelledby="customized-dialog-title"
                        open={openImageBox}
                        PaperProps={{ sx: { borderRadius: "10px",background:"#312a24" } }}
                    >
                        <DialogTitle sx={{ m: 0, p: 2,background:"#312a24",color:"#fffefb" }} id="customized-dialog-title">
                            Upload Image
                        </DialogTitle>
                        <IconButton
                            aria-label="close"
                            onClick={() => setOpenImage(false)}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <Close />
                        </IconButton>
                        <DialogContent dividers>
                            <img src={selectimage} alt="" height="100%" width="100%" style={{ objectFit: "cover", borderRadius: "10px" }} />
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={shareImage} variant="contained" sx={{ background: "#e4ac50", width: "100%", padding: "10px", "&:hover": { background: "#e4ac50" } }}>Share</Button>
                        </DialogActions>
                    </BootstrapDialog>

                </>}
            {!state.chatopen && <Box sx={{ display: { md: "flex", xs: "none",flexDirection:"column" }, alignItems: "center", justifyContent: "center", height: "100vh", background: "#312a24" }}>
             <img src={openChatImg} width={70}/>
                <Typography variant="h5" color={"#ddd8d4"} sx={{mt:1}}>Select A User to Chat</Typography>
            </Box>}

        </Chatbox>
    )
}
