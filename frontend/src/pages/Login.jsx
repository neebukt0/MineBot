import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import "./Login.css"

function Login() {

    const navigate = useNavigate()

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


            localStorage.setItem(
                "access",
                response.data.access
            )

            localStorage.setItem(
                "refresh",
                response.data.refresh
            )


            alert("Login success")



            navigate("/bots")


        } catch (err) {

            console.log(err.response?.data)

            alert("Ошибка авторизации")

        }
    }


    return (

        <div className="login-page">

            <div className="login-card">

                <h1>
                    Вход в <span>Bot Project</span>
                </h1>


                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />


                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />


                <button onClick={handleLogin}>
                    Войти
                </button>


            </div>

        </div>

    )
}


export default Login