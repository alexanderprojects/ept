// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Home";
import './App.css'
export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />} />
				{/* Redirect all other routes to homepage */}
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</Router>
	);
}
