// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Home";
import PaymentSuccess from "./pages/PaymentSuccess";
import './App.css'
export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/payment-success" element={<PaymentSuccess />} />
				{/* Redirect all other routes to homepage */}
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</Router>
	);
}
