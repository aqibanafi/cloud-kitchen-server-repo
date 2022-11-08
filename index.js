const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//Middle Wares
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2mjnncj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run () {
    try {
        const serviceCollection = client.db('superkitch').collection('services')
        const reviewCollection = client.db('superkitch').collection('reviews')
        

        //Create Reviews 
        app.post('/reviews', async(req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result);
        })

        //Add New Service
        app.post('/services', async(req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })

        //Get Single Data for Update Review
        app.get('/reviews/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const review = await reviewCollection.findOne(query)
            res.send(review)
        })

        //Get All Services To Display Data
        app.get('/services', async(req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

        //Get 3 Data For Display On Home Page
        app.get('/homeservices', async(req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services)
        })

        //Review Get By Email Query
        app.get('/myreviews', async(req, res) => {
            let query = {};
            if(req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        //Get Single Data of services
        app.get('/service/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        //Update User Review
        app.patch('/myreviews/:id', async(req, res) => {
            const id = req.params.id;
            const review = req.body;
            const query = {_id: ObjectId(id)}
            const updatedDoc = {
                $set: {
                    message: review.message
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc)
            res.send(result)
        })

        //Delete Review
        app.delete('/reviews/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })
    }
    finally{

    }
}

run().catch(error => console.error(error))


app.get('/', (req, res) => {
    res.send("Superkitch Server is Running")
})

app.listen(port, () => {
    console.log(`Superkitch Server running on ${port}`)
})