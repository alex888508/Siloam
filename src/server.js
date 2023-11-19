const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();
const port = 3001;




app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.js'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://alex888508:Sunrise42@alex.dbpmkvm.mongodb.net/Siloam', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
// MongoDB connection string (replace with your own connection string)
const mongoURI = 'mongodb+srv://alex888508:Sunrise42@alex.dbpmkvm.mongodb.net/Siloam'
// Create a MongoDB client
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
// Connect to MongoDB
const womanSchema = new mongoose.Schema({
    name: String,
    phone_number: String,
    church: String,
    city: String,
    home: String,
    payment: String
});
const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const Admin = mongoose.model('admins', adminSchema);
const womans_list = mongoose.model('womans', womanSchema);
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB database connection established successfully.");
});

client.connect()
    .then(async () => {
        console.log('Connected to MongoDB');
        // Express route to handle user creation
        app.use(bodyParser.json());
        app.post('/womans', async (req, res) => {
            const userData = req.body;
            // Get the "users" collection from MongoDB
            const usersCollection = client.db().collection('womans');

            try {
                // Insert the user data into the "users" collection
                const result = await usersCollection.insertOne(userData);
                console.log('User added successfully');
                // Send a success response
                res.status(201).json({message: 'User added successfully', userId: result.insertedId});
            } catch (error) {
                // Send an error response
                res.status(500).json({error: 'Internal Server Error'});
            }
        });
        app.post('/login', async (req, res) => {
            console.log("trying to access login and password");
            const { username, password } = req.body;

            try {
                const user = await Admin.findOne({ username });

                if (!user || user.password !== password) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }

                return res.status(200).json({ message: 'Login successful' });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });

        app.get('/womans', async (req, res) => {
            try {
                const women = await womans_list.find();
                res.json(women || [])
            } catch (error) {
                console.error('Error fetching women:', error);
                res.status(500).send('Internal Server Error');
            }
        });
        app.delete('/womans/:id', async (req, res) => {
            try {
                const deletedWoman = await womans_list.findByIdAndDelete(req.params.id);
                if (!deletedWoman) {
                    return res.status(404).json({ message: 'Woman not found' });
                }
                res.json({ message: 'Woman deleted successfully', deletedWoman });
            } catch (error) {
                console.error('Error deleting woman:', error);
                res.status(500).send('Internal Server Error');
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
