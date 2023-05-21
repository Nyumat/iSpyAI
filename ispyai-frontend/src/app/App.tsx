import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Navbar from '../components/layout/Navbar';
import Generate from '../pages/Generate';
import List from '../pages/List';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from '../redux/store/store';
import Blog from '../pages/Blog';

function App() {
	return (
		<>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<Navbar />
					<Routes>
						<Route path="/" element={<Landing />} />
						<Route path="/generate" element={<Generate />} />
						<Route path="/list" element={<List />} />
						<Route path="/blog/:id" element={<Blog />} />
					</Routes>
				</PersistGate>
			</Provider>
		</>
	);
}

export default App;
