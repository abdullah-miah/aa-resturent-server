const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config()
const port = process.env.Port || 5000;


//middleware
app.use(cors());
app.use(express.json());


const verifyJWT =(req,res,next)=>{
  const authorization = req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error: true, message: 'unauthorized access'});
  }
}

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ulqow.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();
    
    const usersCollection = client.db("aADb").collection("users");
    const menuCollection = client.db("aADb").collection("menu");
    const reviewCollection = client.db("aADb").collection("reviews");
    const cartCollection = client.db("aADb").collection("carts");
    
    app.post('/jwt', (req,res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({token})
    })

    // users related apis
    app.get('/users', async(req,res)=>{
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async(req,res)=>{
      const user = req.body;
      const query ={email: user.email};
      const existingUser = await usersCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'User already exist'})
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })
  /// make admin
    app.patch('/users/admin/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set:{
          role: 'admin'
        }
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
     
    // menu get api
   app.get('/menu', async(req,res)=>{
     const result = await menuCollection.find().toArray();
     res.send(result);
   })
   // reviews get api
   app.get('/reviews',async(req,res)=>{
    const result = await reviewCollection.find().toArray();
    res.send(result);
   });

   //cart collection

    app.post('/carts', async (req,res)=>{
    const item = req.body;
    console.log(item)
    const result = await cartCollection.insertOne(item);
    res.send(result);
     })

     // cart get api
      app.get('/carts', async(req,res)=>{
        const email = req.query.email;
        console.log(email);
        if(!email){
          res.send([]);
        }
        const query = {email: email}
        const result = await cartCollection.find(query).toArray();
        res.send(result);
      })

      // app.delete('/carts/:id', async(req,res)=>{
      //   const id = req.params.id;
      //   const query = {_id: new ObjectId(id)};
      //   const result = await cartCollection.deleteOne(query)
      //   res.send(result);
      // })

      app.delete('/carts/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await cartCollection.deleteOne(query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
     
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('aa is sitting')
});

app.listen(port, ()=>{
    console.log(`Bistro boss is sitting on port${port}`);
})