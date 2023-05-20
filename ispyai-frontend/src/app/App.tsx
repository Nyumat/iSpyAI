import { Routes, Route } from 'react-router-dom'
import Landing from '../pages/Landing'
import Navbar from '../components/layout/Navbar'
import Generate from '../pages/Generate'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from '../redux/store/store';

function App() {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/generate" element={<Generate />} />
          </Routes>
        </PersistGate>
      </Provider>
    </>
  )
}

export default App
