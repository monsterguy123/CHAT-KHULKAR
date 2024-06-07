import {BrowserRouter,Routes,Route} from "react-router-dom";
import CreateRoom from "./component/CreateRoom";
import ShowAllRooms from './component/ShowAllRooms'
import ViewRoom from "./component/ViewRoom";
import SignIn from "./component/SignIn";
import SignUp from "./component/SignUp";
import Notifications from "./component/Notification";
import Friends from "./component/Friends";

function App() {
 
  return (
    <BrowserRouter>
       <Routes>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/friends" element={<Friends/>}/>
        <Route path="/notifications" element={<Notifications/>}/>
        <Route path="/signin" element={<SignIn/>}/>
        <Route path="/createroom" element={<CreateRoom/>}/>
        <Route path="/" element={<ShowAllRooms/>}/>
        <Route path="/room/:roomName" element={<ViewRoom/>}/>
       </Routes>
    </BrowserRouter>
  );
}

export default App;
