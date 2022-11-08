const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//Middle Wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2mjnncj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//Function JWT
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try {
        const serviceCollection = client.db('superkitch').collection('services')
        const reviewCollection = client.db('superkitch').collection('reviews')


        //Create Reviews 
        app.post('/reviews', verifyJWT, async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result);
        })

        //Add New Service
        app.post('/services', verifyJWT, async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })

        //JWT Token
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
            res.send({ token })
        })

        //Get Single Data for Update Review
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const review = await reviewCollection.findOne(query)
            res.send(review)
        })

        //Get All Services To Display Data
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

        //Get 3 Data For Display On Home Page
        app.get('/homeservices', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services)
        })

        //Review Get By Email Query
        app.get('/myreviews', verifyJWT, async (req, res) => {

            const decoded = req.decoded;
            if(decoded.email !== req.query.email) {
                res.status(403).send({message: 'unauthorized access'})
            }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        //Get Single Data of services
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        //Update User Review
        app.patch('/myreviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const review = req.body;
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    message: review.message
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc)
            res.send(result)
        })

        //Delete Review
        app.delete('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })

        //Get Review Data Into Individual Services
        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.serviceid) {
                query = {
                    serviceid: req.query.serviceid
                }
            }
            const cursor = reviewCollection.find(query).sort({date: -1})
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

        //Get Review Data Into Individual Services(Use Effects)
        app.get('/allreviews', async (req, res) => {
            const query = {}
            if (req.query.serviceid) {
                query = {
                    serviceid: req.query.serviceid
                }
            }
            const cursor = reviewCollection.find(query)
            const reviews = await cursor.toArray()
            res.send(reviews);
        })
    }
    finally {

    }
}

run().catch(error => console.error(error))


app.get('/', (req, res) => {
    res.send("Superkitch Server is Running")
})

app.listen(port, () => {
    console.log(`Superkitch Server running on ${port}`)
})