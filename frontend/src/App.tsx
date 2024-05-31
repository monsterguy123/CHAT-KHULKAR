import {BrowserRouter,Routes,Route} from "react-router-dom";
import CreateRoom from "./component/CreateRoom";
import ShowAllRooms from './component/ShowAllRooms'
import ViewRoom from "./component/ViewRoom";

function App() {
 
  return (
    <BrowserRouter>
       <Routes>
        <Route path="/createroom" element={<CreateRoom/>}/>
        <Route path="/rooms" element={<ShowAllRooms/>}/>
        <Route path="/room/:roomName" element={<ViewRoom/>}/>
       </Routes>
    </BrowserRouter>
  );
}

export default App;
