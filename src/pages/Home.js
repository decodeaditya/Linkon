import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import { Box, styled,Grid } from '@mui/material'
import { ChatContext } from '../context/ChatContext'
import { useContext } from 'react'

const Page = styled(Box)({
  background: "#6AABD2",
  width: "100%",
  minheight: "100%",
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
})

const ChatBox = styled(Grid)(({ theme }) => ({
  borderRadius: "15px",
  justifyContent:"center",
  background:"#fff",
  height:"100vh"

}))

const SidebarContainer = styled(Grid)(({ theme,chat }) => ({
  width:"30%",
  [theme.breakpoints.down('md')]: {
    background: '#fff',
    width:chat === true ? 0 : "100%",
    display:chat === true ? 'none' : "block",
    height:"100%"
  }
}))

const ChatContainer = styled(Grid)(({ theme,chat }) => ({
  width:"70%",
  [theme.breakpoints.down('md')]: {
    background: '#fff',
    width:chat === false ? 0 : "100%",
    height:"100%"
  }
}))


export default function Home() {
  const { state } = useContext(ChatContext)

  return (
    <Page>
      <ChatBox container>
        <SidebarContainer item chat={state.chatopen}>
        <Sidebar />
        </SidebarContainer>
        <ChatContainer item chat={state.chatopen}>
        <Chat />
        </ChatContainer>
      </ChatBox>
    </Page>
  )
}