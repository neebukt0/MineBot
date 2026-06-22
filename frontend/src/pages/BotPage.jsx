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

const deleteBot = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bot?")) return;
    
    try {
        await api.delete(`/bots/${id}/delete_bot/`);
        setBots((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
        console.error("DELETE ERROR:", err.response?.data || err);
    }
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

const startBot = async (id) => {
    try {
        // ID должен идти ДО названия экшена start
        await api.post(`/bots/${id}/start/`);
        alert("Bot started");
    } catch (err) {
        console.error("START ERROR:", err.response?.data || err);
    }
};

    useEffect(() => {
        loadBots();
    }, []);

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
            <h1>My bots</h1>

            <form onSubmit={createBot}>
                <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    required
                />

                <br /><br />

                <input
                    name="username"
                    placeholder="Bot username"
                    value={form.username}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="server_ip"
                    placeholder="Server IP"
                    value={form.server_ip}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="number"
                    name="server_port"
                    placeholder="Port"
                    value={form.server_port}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    name="version"
                    placeholder="Version"
                    value={form.version}
                    onChange={handleChange}
                />

                <br /><br />

                <button type="submit">Create bot</button>
            </form>

            <hr />

            {bots.length === 0 ? (
                <p>No bots</p>
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
                        <p><b>ID:</b> {bot.id}</p>
                        <p><b>Username:</b> {bot.username}</p>
                        <p>
                            <b>Server:</b> {bot.server_ip}:{bot.server_port}
                        </p>
                        <p><b>Version:</b> {bot.version}</p>

                        <button
                            onClick={() => startBot(bot.id)}
                            style={{
                                marginTop: "10px",
                                padding: "6px 12px",
                                cursor: "pointer"
                            }}
                        >
                            Start bot
                        </button>

                        <button onClick={() => deleteBot(bot.id)}>
                        Delete bot
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}