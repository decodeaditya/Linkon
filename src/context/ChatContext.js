import { createContext, useContext, useReducer} from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext()

export const ChatContextProvider = ({children})=>{
  
    const {CurrentUser} = useContext(AuthContext)  

   const INITIAL_STATE = {
    user:{},
    chatId:"null",
    chatopen:false
   }

   const chatReducer = (state,action)=>{ 
        switch(action.type){
            case "CHANGE_USER":
                return{
                    user:action.chat === false ? {} : action.payload,
                    chatopen:action.chat === false ? false : true,
                    chatId: action.chat === false ? "null" :(CurrentUser.uid > action.payload.uid? CurrentUser.uid + action.payload.uid: action.payload.uid + CurrentUser.uid)
                }
                default:
                    return{
                        state
                    }
        }
   }

   const [state,dispatch] = useReducer(chatReducer,INITIAL_STATE)

return(
    <ChatContext.Provider value={{state,dispatch}}>
        {children}
    </ChatContext.Provider>
)
}