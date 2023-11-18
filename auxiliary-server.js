const express = require('express');
const axios = require('axios'); // Axios ekleniyor
const https = require('https');
const path = require('path');
require('dotenv').config({ path: './auxiliary-server.env' });

const app = express();
const PORT = process.env.PORT || 8080;

const mainServerAddress = process.env.MAIN_SERVER_ADDRESS;
const alchemyApiKey = process.env.ALCHEMY_API_KEY;

// Axios ile yapılan istekler için özel agent oluşturuluyor
const axiosAgent = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: true, secureProtocol: 'TLSv1_2_method' })
});

// Serve static files from the 'dist' folder of the main server
app.use('/static/:fileName', async (req, res) => {
  const fileName = req.params.fileName;

  try {
    const response = await axiosAgent.get(`${mainServerAddress}/get-file/${fileName}`);
    res.send(response.data);
  } catch (error) {
    console.error('Error during file request:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Load the remote index file from the main server
app.get('/load-remote-index', async (req, res) => {
  try {
    const response = await axiosAgent.get(`${mainServerAddress}/load-remote-index`);
    res.send(response.data);
  } catch (error) {
    console.error('Error during remote index request:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Catch-all route for handling other requests (404)
app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'dist', 'error-page', '404.html'));
});

// Start the secondary server
app.listen(PORT, () => {
  console.log(`Yan Sunucu Çalıştırıldı: http://localhost:${PORT}`);
});
