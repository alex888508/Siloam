const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// MongoDB connection string (replace with your own connection string)
const mongoURI = 'mongodb+srv://alex888508:Sunrise42@alex.dbpmkvm.mongodb.net/'

// Create a MongoDB client
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
console.log('Starting to MongoDB')
// Connect to MongoDB
client.connect()
    .then(() => {
        console.log('Connected to MongoDB');

        // Express route to handle user creation
        app.post('/womans', async (req, res) => {
            const userData = req.body;

            // Get the "users" collection from MongoDB
            const usersCollection = client.db().collection('womans');

            try {
                // Insert the user data into the "users" collection
                const result = await usersCollection.insertOne(userData);

                // Send a success response
                res.status(201).json({ message: 'User added successfully', userId: result.insertedId });
            } catch (error) {
                // Send an error response
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // Start the Express server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
    });
