import React, { useContext, useState, useEffect } from 'react'
import { Box, Avatar, Tooltip, Typography, IconButton, styled, Menu, MenuItem, ListItemIcon, Divider, DialogActions, TextField, Grid, InputAdornment, Button, ListItemText, Dialog, DialogTitle, DialogContent } from '@mui/material'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { AuthContext } from '../context/AuthContext';
import { CloseRounded, ImageRounded, LogoutRounded, SearchTwoTone } from '@mui/icons-material'
import { db } from '../firebase'
import { collection, query, where, getDocs, setDoc, updateDoc, doc, serverTimestamp, getDoc, onSnapshot } from 'firebase/firestore'
import { ChatContext } from '../context/ChatContext';
import logo from "../logo512.png"
import userProfileImg from "../userProfileImage.png"
import noUserFound from '../noUserFound.png'
import startChat from '../startChat.png'

const Sidebox = styled(Box)(({ theme }) => ({
    background: "#1b1b1b",
    height: "100vh",
    overflowY: "auto",
    '&::-webkit-scrollbar': {
        width: 0
    }
}));


const Header = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5,
    height: "50px",
    background: "#1b1b1b",
    padding: "1rem",
}))

const Search = styled(Box)((theme) => ({
    fontSize: "10px",
    padding: "14px",

}))

const User = styled(Grid)(({ theme }) => ({
    padding: "10px",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
        background: "#312a24"
    }
}))

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
        background: "#312a24"
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
        background: "#312a24"
    },
}));

export default function Sidebar() {

    const { CurrentUser, CurrentUserHandle } = useContext(AuthContext)
    const { state, dispatch } = useContext(ChatContext)

    const [userName, setuserName] = useState("")
    const [user, setUser] = useState(null)
    const [err, setErr] = useState(false)

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };


    const handleSearch = async () => {

        try {
            const q = query(
                collection(db, "users"),
                where("handle", "==", userName)
            );
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {

                if (doc.exists()) {
                    setUser(doc.data());
                    setNewUserOpen(true)
                    setuserName("")
                }
                else{
                    setUserError(true)
                    setuserName("")
                }
            });

        }

        catch (err) {
            setErr(true);
            setUserError(true)
            setuserName("")
        }
    };

    const search = (e) => {
        setuserName(e)

        if (userName !== "" && userName !== CurrentUserHandle) {
            handleSearch()
        }
    }

    const handleSelect = async () => {
        const chatId = CurrentUser.uid > user.uid
            ? CurrentUser.uid + user.uid
            : user.uid + CurrentUser.uid;
        try {
            const res = await getDoc(doc(db, "chats", chatId))
            if (!res.exists()) {
                await setDoc(doc(db, "chats", chatId), { messages: [] })
                await updateDoc(doc(db, "userChats", CurrentUser.uid), {
                    [chatId + ".userInfo"]: {
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        uid: user.uid,
                        handle: user.handle
                    },
                    [chatId + ".date"]: serverTimestamp()
                })
                await updateDoc(doc(db, "userChats", user.uid), {
                    [chatId + ".userInfo"]: {
                        email: CurrentUser.email,
                        displayName: CurrentUser.displayName,
                        photoURL: CurrentUser.photoURL,
                        uid: CurrentUser.uid,
                        handle: CurrentUserHandle
                    },
                    [chatId + ".date"]: serverTimestamp()
                })
            }
        }
        catch (err) {
            console.log(err)
        }
        setUser(null)
        setUserError(false)
        setuserName("")
        setNewUserOpen(false)
    }

    const [Chats, setChats] = useState([])

    useEffect(() => {
        const getChats = () => {
            const Chat = onSnapshot(doc(db, "userChats", CurrentUser.uid), (doc) => {
                setChats(doc.data())
            })

            return () => {
                Chat()
            }
        }
        CurrentUser.uid && getChats()
    }, [CurrentUser.uid])


    const handleChat = (e, u) => {
        dispatch({ type: "CHANGE_USER", payload: u })
    }

    const [newUserOpen, setNewUserOpen] = useState(false);

    const handleUserOpen = () => {
        setNewUserOpen(true);
    };
    const handleUserClose = () => {
        setNewUserOpen(false);
    };

    const [userError, setUserError] = useState(false)

    return (
        <Sidebox>
            <Header>
                <Box sx={{ display: "flex", alignItems: "center" }}>    <Box><img src={logo} width={"40px"} alt="Linkon" /></Box>
                    <Box>
                        <Typography variant="h5" sx={{ ml: 1, fontWeight: 900, lineHeight: 1.1, color: "#fff" }}>LINKON</Typography>
                    </Box></Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Tooltip title={CurrentUserHandle}>
                        <Avatar aria-controls={open ? 'account-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined} onClick={handleClick} sx={{ cursor: "pointer", height: "50px", width: "50px" }} src={CurrentUser.photoURL} />
                    </Tooltip>
                </Box>
            </Header>
            <Search>
                <TextField inputProps={{
                    sx: {
                        color: '#7e7a77',
                        paddingLeft: '15px',
                    },
                }} InputLabelProps={{ shrink: false, display: "none" }} sx={{
                    backgroundColor: '#171310',
                    borderRadius: 10,
                    color: "#b0a9a6",
                    border: 'none',
                    "& fieldset": { border: 'none' },
                }} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={e => search(e.target.value)}><SearchTwoTone sx={{ color: "#7e7a77" }} /></IconButton></InputAdornment> }} placeholder='Search friends by handle...' value={userName} onChange={(e) => { setuserName(e.target.value) }} fullWidth />
            </Search>
            {userError === true &&
                <BootstrapDialog
                    onClose={() => setUserError(false)}
                    aria-labelledby="customized-dialog-title"
                    open={userError}
                    PaperProps={{ sx: { borderRadius: "10px", background: "#312a24", width: 470 } }}
                >
                    <DialogTitle sx={{ m: 0, p: 2, color: "#f9f6f6", background: "#312a24" }} id="customized-dialog-title">
                        Result:
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={() => setUserError(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseRounded />
                    </IconButton>
                    <DialogContent dividers>
                        <Box sx={{ textAlign: "center", width: "100%" }}>
                            <img src={noUserFound} style={{ width: 75, height: 75, objectFit: "cover" }} />
                            <Typography color={"#f9f6f6"} sx={{ fontWeight: "600", fontSize: "19px" }}>No User Found!</Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={() => setUserError(false)} sx={{ background: "#e4ac50", borderRadius: 6, width: "100%", padding: "10px", "&:hover": { background: "#e4ac50" } }}>OK</Button>
                    </DialogActions>
                </BootstrapDialog>
            }

            {user && CurrentUser.uid !== user.uid && <BootstrapDialog
                onClose={handleUserClose}
                aria-labelledby="customized-dialog-title"
                open={newUserOpen}
                PaperProps={{ sx: { borderRadius: "10px", background: "#312a24", width: 470 } }}
            >
                <DialogTitle sx={{ m: 0, p: 2, color: "#f9f6f6", background: "#312a24" }} id="customized-dialog-title">
                    Result:
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleUserClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseRounded />
                </IconButton>
                <DialogContent dividers>
                    <Box sx={{ textAlign: "center", width: "100%" }}>
                        <img src={user?.photoURL} onError={(e) => { e.target.src = userProfileImg }} style={{ border: "2px solid #ccac79", width: 100, height: 100, borderRadius: '50%', padding: "2px", objectFit: "cover" }} />
                        <Typography color={"#f9f6f6"} sx={{ fontWeight: "600", fontSize: 19 }}>{user.displayName}</Typography>
                        <Typography color={"#d1ccc8"}>{user.handle}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleSelect} sx={{ background: "#e4ac50", borderRadius: 6, width: "100%", padding: "10px", "&:hover": { background: "#e4ac50" } }}>Chat Now</Button>
                </DialogActions>
            </BootstrapDialog>
            }
            <Box sx={{ px: 1.5, pb: 1 }}>
                {Object.entries(Chats)?.sort((a, b) => b[1].date.date - a[1].date.date).map((chat) => (
                    <User sx={{ py: 1.6, background: state.user.uid === chat[1].userInfo.uid ? "#312a24" : "transparent", borderRadius: "10px" }} container key={chat[0]} onClick={(e) => { handleChat(e, chat[1].userInfo); }}>
                        <Grid item>
                            <img src={chat[1].userInfo.photoURL} onError={(e) => { e.target.src = userProfileImg }} style={{ border: "2px solid #ccac79", width: 49, height: 49, borderRadius: '50%', padding: "2px", objectFit: "cover" }} />
                        </Grid>
                        <Grid item sx={{ width: "80%" }}>
                            <Box sx={{ pl: '0.9rem' }}>
                                <Typography sx={{ fontWeight: "500", fontSize: "18px", color: "#fdfdfd" }}>{chat[1].userInfo.displayName}</Typography>
                                <Typography variant="body2" sx={{ color: "#a7a7a7" }} noWrap>{chat[1]?.lastmsg?.lastmsg.includes(CurrentUser.uid + "Image") ? <Box sx={{ display: "flex", alignItems: "center", }}><ImageRounded sx={{ mr: 0.3, fontSize: '20px' }} /> <Typography style={{ ml: 1 }}>Image</Typography></Box> : chat[1]?.lastmsg?.lastmsg}</Typography>
                            </Box>
                        </Grid>
                    </User>
                ))
                }
            </Box>
            {Chats.length === 0 && <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", }}>
                <img src={startChat} width={70} />
                <Typography variant="h6" color={"#ddd8d4"} sx={{ mt: 1 }}>Search & Chat!</Typography>
            </Box>
            }
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        background: "#312a24",
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: '#312a24',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: "10px 13px" }}>
                    <Typography sx={{ fontWeight: "600", color: "#e1dad4" }}>Hi, {CurrentUser?.displayName}</Typography>
                    <Typography sx={{ color: "#d7d0ca", fontSize: "14px", fontWeight: "300" }}>{`(${CurrentUserHandle})`}</Typography>
                </Box>
                <Divider sx={{}} />
                <MenuItem onClick={() => { signOut(auth) }}>
                    <ListItemIcon>
                        <LogoutRounded fontSize="small" sx={{ color: "#e1dad4" }} />
                    </ListItemIcon>
                    <ListItemText sx={{ color: "#e1dad4" }}>Sign Out </ListItemText>
                </MenuItem>
            </Menu>
        </Sidebox >
    )
}