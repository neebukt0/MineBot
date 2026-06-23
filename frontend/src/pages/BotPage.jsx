import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./BotPage.css";


export default function BotPage() {

    const navigate = useNavigate();

    const [bots, setBots] = useState([]);


    const [form, setForm] = useState({
        name: "",
        description: "",
        username: "",
        server_ip: "localhost",
        server_port: 25565,
        version: "1.12.2",
    });



    const authError = (err) => {

        if (
            err.response?.status === 401 ||
            err.response?.status === 403
        ) {

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");

            navigate("/login");
        }

    };



    const normalizeBots = (data) => {

        if (Array.isArray(data)) return data;

        if (Array.isArray(data?.results))
            return data.results;

        if (Array.isArray(data?.bots))
            return data.bots;

        return [];

    };



    const loadBots = async () => {

        try {

            const {data} = await api.get("/bots/");

            setBots(normalizeBots(data));


        } catch(err){

            authError(err);

            console.error(err.response?.data);

        }

    };



    const createBot = async(e)=>{

        e.preventDefault();


        try {


            const {data} = await api.post(
                "/bots/",
                form
            );


            setBots(prev=>[
                ...prev,
                data
            ]);



            setForm({
                name:"",
                description:"",
                username:"",
                server_ip:"localhost",
                server_port:25565,
                version:"1.12.2"
            });



        }catch(err){

            authError(err);

        }

    };




    const deleteBot = async(id)=>{


        try{


            await api.delete(
                `/bots/${id}/delete_bot/`
            );


            setBots(prev =>
                prev.filter(
                    bot=>bot.id !== id
                )
            );


        }catch(err){

            authError(err);

        }

    };




    const startBot = async(id)=>{


        try{


            await api.post(
                `/bots/${id}/start/`
            );


            alert("Bot started");


        }catch(err){

            authError(err);

        }

    };




    const handleChange=(e)=>{


        const {name,value}=e.target;


        setForm(prev=>({

            ...prev,

            [name]:

            name==="server_port"

            ? Number(value)

            : value

        }));

    };




    useEffect(()=>{

        loadBots();

    },[]);




    return (

        <div className="bots-page">


            <div className="bots-container">


                <h1>
                    My <span>Bots</span> 🤖
                </h1>



                <form 
                className="bot-form"
                onSubmit={createBot}>


                    <input
                    name="name"
                    placeholder="Bot name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    />


                    <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    />


                    <input
                    name="username"
                    placeholder="Bot username"
                    value={form.username}
                    onChange={handleChange}
                    />


                    <input
                    name="server_ip"
                    placeholder="Server IP"
                    value={form.server_ip}
                    onChange={handleChange}
                    />


                    <input
                    type="number"
                    name="server_port"
                    value={form.server_port}
                    onChange={handleChange}
                    />


                    <input
                    name="version"
                    placeholder="Version"
                    value={form.version}
                    onChange={handleChange}
                    />


                    <button>
                        Create bot
                    </button>


                </form>




                <div className="bot-list">


                {
                bots.length===0

                ?

                <p>No bots</p>


                :

                bots.map(bot=>(


                <div
                className="bot-card"
                key={bot.id}>


                    <h2>
                        {bot.name}
                    </h2>


                    <p>{bot.description}</p>


                    <p>
                    ID: {bot.id}
                    </p>


                    <p>
                    Server:
                    {bot.server_ip}:
                    {bot.server_port}
                    </p>


                    <p>
                    Version:
                    {bot.version}
                    </p>



                    <button
                    onClick={()=>
                    startBot(bot.id)}>
                        Start
                    </button>



                    <button
                    className="delete"
                    onClick={()=>
                    deleteBot(bot.id)}>
                        Delete
                    </button>


                </div>


                ))

                }


                </div>


            </div>


        </div>

    );

}