const express = require('express');
const cors = require('cors');
const app = express();
const Groq = require("groq-sdk");
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
    const postContent = req.body.postContent;
    console.log('Mensaje recibido:', postContent);
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a helpful assistant in the areas of global threat intelligence and osint. Please only return valid JSON and no other text.'
                },
                {
                    role: 'user',
                    content: "hola"
                }
            ],
            model: 'llama3-70b-8192',
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null
        })
    });

    if (response.ok) {
        const data = await response.json();
        console.log(data.choices[0].message?.content, '<---- groq.com api');

        res.json({ content: data.choices[0].message?.content });
    } else {
        console.error(await response.json());
    }
})

app.listen(3000, () => {
    console.log('Example app listening at http://localhost:3000')
})
