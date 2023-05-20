import { Routes, Route } from 'react-router-dom'
import Landing from '../pages/Landing'
import Navbar from '../components/layout/Navbar'
import Generate from '../pages/Generate'

function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/generate" element={<Generate/>} />
      </Routes>
    </>
  )
}

export default App
