const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const app = express();
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const corsOptions ={
  origin: [ 'http://localhost:5173', 'https://food-09.web.app', 'https://food-09.firebaseapp.com'],

  credentials: true,
  optionSuccessStatus: 200,

}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ncq0h0t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


const logger =  (req, res, next) => {

  console.log(`${req.method} ${req.path} ${req.ip}`)
  next()

  
}

const verifyJWT = (req, res, next) => {
  const token = req.cookies?.tokennn
  console.log(token, 'in middle')

  if (!token) {
    return res.status(401).send({ success: false, message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ success: false, message: 'unauthorized access' })
    }
    req.user = decoded
    
    next()
  })



  
}


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};
async function run() {
  try {
    // await client.connect();

    const foodCollection = client.db("foodBunny").collection("food");


    // auth api
    app.post('/jwt' ,  async (req, res) => {
      const user = req.body
      console.log(user)
      
      console.log(req.cookies)
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN , { expiresIn: '1h' })
      res
      .cookie('tokennn', token, cookieOptions)
      .send({'success': true,})
    })

    app.post('/logout', async (req, res) => {
       const user = req.body
      console.log('logout')
       res
       .clearCookie('tokennn', {...cookieOptions , maxAge: 0})
       .send({'success': true,})
    })








 







    // Food api

    app.post("/addfood", async (req, res) => {
      const newFood = req.body;
      const result = await foodCollection.insertOne(newFood);
      console.log(result);
      res.json(result);
    });

    app.put("/updatefood/:id", async (req, res) => {
      const id = req.params.id;
      const updateFood = req.body;
      const updateEmail = req.body.email;
      const updateDate = req.body.requestDate;
      const updateNotes = req.body.additionalNotes;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          foodStatus: updateFood.foodStatus,
          email: updateEmail,
          requestDate: updateDate,
          additionalNotes: updateNotes,
        },
      };
      const result = await foodCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    app.get("/food", async (req, res) => {
      const foods = await foodCollection.find({}).toArray();
      res.json(foods);
    });

    app.get("/sortfoodByExpireDate", async (req, res) => {
      try {
        const foods = await foodCollection
          .find({ foodStatus: "available" })
          .sort({ expiredDateTime: 1 })
          .toArray();
        res.json(foods);
      } catch (error) {
        console.error("Error fetching food data:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.get("/foodDetails/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const food = await foodCollection.findOne({ _id: new ObjectId(id) });
        res.json(food);
      } catch (error) {
        console.error("Error fetching food data:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
    app.get("/myFood/:email",  verifyJWT, async (req, res) => {
      console.log('tokennnn' , req.cookies.tokennn)
      if(req.user.email !== req.params.email){
        return res.status(403).send({success: false, message: 'forbidden access'})
      }
      try {
        const email = req.params.email;
        
        const foods = await foodCollection
          .find({ donatorEmail: email })
          .toArray();
        res.json(foods);
      } catch (error) {
        console.error("Error fetching food data:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    
  app.get('/requestFooood/:email' , verifyJWT, async (req, res) =>{
    if(req.user.email !== req.params.email){
      return res.status(403).send({success: false, message: 'forbidden access'})
    }
    const email = req.params.email;
    const query = { email: email };
    const cursor = foodCollection.find(query);
    const food = await cursor.toArray();
    res.send(food);    
  })

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.json(result);
    });

    app.put("/updatefoodddddd/:id", async (req, res) => {
      const id = req.params.id;
      const updateFoodName = req.body.foodName;
      const updateFoodImage = req.body.foodImage;
      const updateFoodQuantity = req.body.foodQuantity;
      const updatePickupLocation = req.body.pickupLocation;
      const updateExpiredDateTime = req.body.expiredDateTime;
      const updateNotes = req.body.additionalNotes;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          foodName: updateFoodName,
          foodImage: updateFoodImage,
          foodQuantity: updateFoodQuantity,
          pickupLocation: updatePickupLocation,
          expiredDateTime: updateExpiredDateTime,
          additionalNotes: updateNotes,
        },
      };
      const result = await foodCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

  app.get('/requestFooood/:email' , async (req, res) =>{
    const email = req.params.email;
    const query = { email: email };
    const cursor = foodCollection.find(query);
    const food = await cursor.toArray();
    res.send(food);    
  })

    // Connect the client to the server	(optional starting in v4.7)

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
