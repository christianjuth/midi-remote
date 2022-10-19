import Reciever from './pages/Reciever'
import Transmitter from './pages/Transmitter'
import { Routes, Route, BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='reciever' element={<Reciever/>} />
        <Route path='transmitter/:id' element={<Transmitter/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
