import logo from './logo.svg';
import './App.css';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import { createTheme,ThemeProvider  } from '@mui/material'
import { BrowserRouter,Routes,Route,Navigate } from 'react-router-dom'
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

const theme = createTheme({
  typography:{
    fontFamily:[
      "Urbanist",
      "sans-serif"
    ].join(","),
    fontWeight:"bold"
  }
});

function App() {

  const {CurrentUser} = useContext(AuthContext)


  const ProtectedRoute = ({children})=>{
    if(!CurrentUser){
      return <Navigate to={"/login"}/>
    }
    return children
  }

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
      <Routes>
        <Route path='/'>
          <Route index element={<ProtectedRoute><Home/></ProtectedRoute>}/>
          <Route path="login" element={<Login />}/>
          <Route path="register" element={<Register />}/>
        </Route>
      </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
