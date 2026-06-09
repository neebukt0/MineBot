import { useState } from "react"
import api from "../api/axios"

function Login() {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async () => {

        try {

            const response = await api.post(
                "auth/login/",
                {
                    username,
                    password,
                }
            )

            console.log(response.data)

            localStorage.setItem(
                "access",
                response.data.access
            )

            localStorage.setItem(
                "refresh",
                response.data.refresh
            )

            alert("Login success")

        }catch (err) {
            console.log("STATUS:", err.response.status)
            console.log("DATA:", err.response.data)
            console.log("HEADERS:", err.response.headers)
        }
    }

    return (
        <div>

            <h1>Login</h1>

            <input
                type="text"
                placeholder="Username"
                onChange={(e) =>
                    setUsername(e.target.value)
                }
            />

            <input
                type="password"
                placeholder="Password"
                onChange={(e) =>
                    setPassword(e.target.value)
                }
            />

            <button onClick={handleLogin}>
                Login
            </button>

        </div>
    )
}

export default Login