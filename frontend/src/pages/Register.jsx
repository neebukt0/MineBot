import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import "./Register.css"

function Register() {

    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [password2, setPassword2] = useState("")


    const handleRegister = async () => {

        try {

            await api.post(
                "auth/register/",
                {
                    username,
                    password,
                    password2
                }
            )


            alert("Registration success")


            // после регистрации отправляем на логин
            navigate("/login")


        } catch (err) {

            console.log(err.response?.data)

            alert("Ошибка регистрации")

        }
    }


    return (

        <div className="register-page">


            <div className="register-card">


                <h1>
                    Регистрация в <span>Bot Project</span>
                </h1>



                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e)=>
                        setUsername(e.target.value)
                    }
                />



                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>
                        setPassword(e.target.value)
                    }
                />



                <input
                    type="password"
                    placeholder="Repeat password"
                    value={password2}
                    onChange={(e)=>
                        setPassword2(e.target.value)
                    }
                />



                <button onClick={handleRegister}>
                    Создать аккаунт
                </button>



            </div>


        </div>

    )
}


export default Register