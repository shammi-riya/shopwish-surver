const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.use(cors());
app.use(express.json());
require('dotenv').config();
const port = process.env.PORT || 5000;



const uri = `mongodb+srv://${process.env.user}:${process.env.pass}@cluster0.f4myxpg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)

        const proudctsCollection = client.db("shop-wish").collection('products');
        const usersCollection = client.db("shop-wish").collection('users');
        const cartCollection = client.db("shop-wish").collection('carts');



        //   get all producs
        app.get('/products', async (req, res) => {
            const result = await proudctsCollection.find().toArray();
            res.send(result)
        })




        // get specifik 1 products
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const result = await proudctsCollection.findOne({ _id: new ObjectId(id) });
            res.send(result)
        })




        // users

        app.post('/users', async (req, res) => {
            const user = req.body;
            const quiry = { email: user.email }
            const exitingUser = usersCollection.findOne(quiry);
            if (exitingUser) {
                return res.send({ message: 'user already exit' })
            }

            const result = await usersCollection.insertOne(user);
            res.send(result)

        })



        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            console.log("Received email:", email);
            const userInfo = req.body;
            const quiry = { email: email };
            const options = { upsert: true };

            const updateDoc = {
                $set: userInfo
            }

            const result = await usersCollection.updateOne(quiry, updateDoc, options);
            console.log({ result });
            res.send(result);
        })







        // jwt

        app.post('/jwt', (req, res) => {
            const body = req.body;
            const token = jwt.sign(body, process.env.token, { expiresIn: '1h' })
            res.send({ token })
        })


        // products cart

  app.post('/addcart',async(req,res)=>{
    const productsInfo = req.body;
   console.log(productsInfo);
    const result = await cartCollection.insertOne(productsInfo);
    console.log(result);
    res.send(result);
  })



  app.get('/my-cart',async(req,res)=>{
    const myEmail = req.query.email;
    console.log(myEmail);
    const filter = {pharsedBy:myEmail}
    const result = await cartCollection.find(filter).toArray();
    res.send(result)

  })









        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('running shopwish');
});

app.listen(port, () => {
    console.log(`running shopwish ${port}`);
});
