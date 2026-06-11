import { useEffect, useState } from "react"
import api from "../api/axios"

export default function BotPage() {

    const [bots, setBots] = useState([])

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")

    const loadBots = async () => {
        try {
            const response = await api.get("bots/")
            setBots(response.data)
        } catch (error) {
            console.log(error)
        }
    }
    const createBot = async () => {
        try {
            const response = await api.post(
                "bots/",
                {
                    name,
                    description,
                }
            )
            setBots([
                ...bots,
                response.data
            ])
            setName("")
            setDescription("")
        } catch (error) {
            console.log(error.response?.data)
        }
    }
    useEffect(() => {
        loadBots()
    }, [])
    return (
        <div>
            <h1>Мои боты</h1>
            <div>
                <input
                    type="text"
                    placeholder="Название бота"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                />
                <textarea
                    placeholder="Описание"
                    value={description}
                    onChange={(e) =>
                        setDescription(e.target.value)
                    }
                />

                <button onClick={createBot}>
                    Создать бота
                </button>
            </div>
            <hr/>
            {bots.map((bot) => (

                <div
                    key={bot.id}
                    style={{
                        border: "1px solid gray",
                        padding: "10px",
                        marginBottom: "10px",
                    }}
                >
                    <h3>{bot.name}</h3>

                    <p>{bot.description}</p>
                </div>
            ))}
        </div>
    )
}