import { useEffect, useState } from "react";
import api from "../api/axios";

export default function BotPage() {
    const [bots, setBots] = useState([]);

    const [form, setForm] = useState({
        name: "",
        description: "",
        username: "",
        server_ip: "localhost",
        server_port: 25565,
        version: "1.12.2",
    });

    const normalizeBots = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        if (Array.isArray(data?.bots)) return data.bots;
        return [];
    };

    const loadBots = async () => {
        try {
            const { data } = await api.get("/bots/");
            setBots(normalizeBots(data));
        } catch (err) {
            console.error("LOAD ERROR:", err.response?.data || err);
            setBots([]);
        }
    };

    const createBot = async (e) => {
        e.preventDefault();

        try {
            const { data } = await api.post("/bots/", form);

            setBots((prev) => [...prev, data]);

            setForm({
                name: "",
                description: "",
                username: "",
                server_ip: "localhost",
                server_port: 25565,
                version: "1.12.2",
            });
        } catch (err) {
            console.error("CREATE ERROR:", err.response?.data || err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                name === "server_port"
                    ? Number(value)
                    : value,
        }));
    };

    useEffect(() => {
        loadBots();
    }, []);

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
            <h1>Мои боты</h1>

            {/* FORM */}
            <form onSubmit={createBot}>
                <input
                    name="name"
                    placeholder="Название"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <textarea
                    name="description"
                    placeholder="Описание"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    required
                />

                <br /><br />

                <input
                    name="username"
                    placeholder="Ник бота"
                    value={form.username}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="server_ip"
                    placeholder="IP сервера"
                    value={form.server_ip}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="number"
                    name="server_port"
                    placeholder="Порт"
                    value={form.server_port}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="version"
                    placeholder="Версия"
                    value={form.version}
                    onChange={handleChange}
                />

                <br /><br />

                <button type="submit">Создать бота</button>
            </form>

            <hr />

            {/* LIST */}
            {bots.length === 0 ? (
                <p>Ботов пока нет</p>
            ) : (
                bots.map((bot) => (
                    <div
                        key={bot.id}
                        style={{
                            border: "1px solid #ddd",
                            margin: "10px 0",
                            padding: "10px",
                            borderRadius: "8px",
                        }}
                    >
                        <h3>{bot.name}</h3>
                        <p>{bot.description}</p>
                        <p><b>UUID:</b> {bot.id}</p>
                        <p><b>Ник:</b> {bot.username}</p>
                        <p>
                            <b>Сервер:</b> {bot.server_ip}:{bot.server_port}
                        </p>
                        <p><b>Версия:</b> {bot.version}</p>
                    </div>
                ))
            )}
        </div>
    );
}