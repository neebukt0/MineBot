import { useNavigate } from "react-router-dom"
import "./Dashboard.css"
export default function Dashboard() {
    const navigate = useNavigate()

    return (
        <div className="dashboard">
            <div className="card">
                <h1>
                    Добро пожаловать в <span>Bot Project</span> 🚀
                </h1>

                <p>
                    Создавайте, настраивайте и управляйте своими ботами.
                    Войдите в систему или зарегистрируйтесь, чтобы начать.
                </p>

                <div className="buttons">
                    <button 
                        className="login"
                        onClick={() => navigate("/login")}
                    >
                        Авторизация
                    </button>

                    <button 
                        className="register"
                        onClick={() => navigate("/register")}
                    >
                        Регистрация
                    </button>
                </div>
            </div>
        </div>
    )
}