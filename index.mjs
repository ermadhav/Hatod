import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail as the email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send email alert
const sendRainAlert = (city, rainHours) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to yourself
        subject: `Rain Alert for ${city}`,
        text: `There is a chance of rain during the following hours:\n${rainHours.join('\n')}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

// Fetch weather data and send an alert if rain is forecasted
app.get('/weather', async (req, res) => {
    const apiKey = process.env.API_KEY;
    const city = req.query.city || 'Hatod';

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod !== "200") {
            return res.status(404).json({ error: data.message });
        }

        let rainHours = [];
        for (let i = 0; i < data.list.length; i++) {
            const hourForecast = data.list[i];
            if (hourForecast.rain) {
                const forecastDate = new Date(hourForecast.dt * 1000);
                const time = forecastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                rainHours.push(`Rain expected at ${time} on ${forecastDate.toLocaleDateString()}`);
            }
        }

        if (rainHours.length > 0) {
            sendRainAlert(city, rainHours);
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).send('Error retrieving weather data');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
