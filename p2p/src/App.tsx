import { BrowserRouter, Route, Routes } from "react-router-dom";
import CreateRoom from "./components/CreateRoom";
import Rooms from "./components/Rooms";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CreateRoom />} />
          <Route path="/room/:roomID" element={<Rooms />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
