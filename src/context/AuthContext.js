import { onAuthStateChanged } from "firebase/auth";
import { createContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export const AuthContext = createContext()


export const AuthContextProvider = ({ children }) => {
    const [CurrentUser, setCurrentUser] = useState({})
    const [CurrentUserHandle, setUserhandle] = useState("")

    useEffect(() => {
        const Authstate = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (CurrentUser && Object.keys(CurrentUser).length !== 0) {
                const q = query(
                    collection(db, "users"),
                    where("uid", "==", CurrentUser.uid)
                );

                try {
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach((doc) => {
                        setUserhandle(doc.data().handle);
                    });
                } catch (err) {
                    setUserhandle("@handle")
                }
            }
        });


        return () => {
            Authstate()
        }
    }, [CurrentUser]);

    return (
        <AuthContext.Provider value={{ CurrentUser, CurrentUserHandle }}>
            {children}
        </AuthContext.Provider>
    )
}