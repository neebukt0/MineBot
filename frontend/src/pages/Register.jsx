import { useState } from "react"
import api from "../api/axios"

function Register() {

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleRegister = async () => {

        try {

            const response = await api.post(
                "auth/register/",
                {
                    username,
                    email,
                    password,
                }
            )

            console.log(response.data)

            alert("Registration successful")

        } catch (error) {

            console.log(error.response.data)

        }
    }

    return (
        <div>

            <h1>Register</h1>

            <input
                type="text"
                placeholder="Username"
                onChange={(e) =>
                    setUsername(e.target.value)
                }
            />

            <input
                type="email"
                placeholder="Email"
                onChange={(e) =>
                    setEmail(e.target.value)
                }
            />

            <input
                type="password"
                placeholder="Password"
                onChange={(e) =>
                    setPassword(e.target.value)
                }
            />

            <button onClick={handleRegister}>
                Register
            </button>

        </div>
    )
}

export default Register