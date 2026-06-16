import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import BotPage from "./pages/BotPage.jsx"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/bots" element={<BotPage />} />
                <Route path="/" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    )
}
export default App