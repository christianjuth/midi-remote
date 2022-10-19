import Reciever from "./pages/Reciever";
import Transmitter from "./pages/Transmitter";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="reciever" element={<Reciever />} />
        <Route path="transmitter/:id" element={<Transmitter />} />
        <Route path="*" element={<Navigate to="reciever" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
