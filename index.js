const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion , ObjectId} = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

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

async function run() {
  try {
    await client.connect();

    const foodCollection = client.db("foodBunny").collection("food");
    // Food api

    app.post('/addfood', async(req, res) => {
        const newFood = req.body;
        const result = await foodCollection.insertOne(newFood);
        console.log(result);
        res.json(result);

    })

    app.put('/updatefood/:id', async (req, res) => {
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
              requestDate: updateDate ,
              additionalNotes: updateNotes
          }
      };
      const result = await foodCollection.updateOne(filter, updateDoc, options);
      res.json(result);
  });
  
    app.get('/food', async(req, res) => {
        const foods = await foodCollection.find({}).toArray();
        res.json(foods);
    })

  

    app.get('/sortfoodByExpireDate', async (req, res) => {
      try {
        const foods = await foodCollection.find({ "foodStatus": "available" }).sort({ expiredDateTime: 1 }).toArray();
        res.json(foods);
      } catch (error) {
        console.error("Error fetching food data:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.get('/foodDetails/:id' , async (req, res) => {
      try {
        const id = req.params.id;
        const food = await foodCollection.findOne({ _id: new ObjectId(id) });
        res.json(food);
      } catch (error) {
        console.error("Error fetching food data:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    })
    app.get('/myFood/:email', async (req, res) => {
      try {
          const email = req.params.email;
          const foods = await foodCollection.find({ "donatorEmail": email }).toArray();
          res.json(foods);
      } catch (error) {
          console.error("Error fetching food data:", error);
          res.status(500).json({ message: "Internal server error" });
      }
  })

  app.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await foodCollection.deleteOne(query);
    res.json(result);
  })

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
            additionalNotes: updateNotes
        }
    };
    const result = await foodCollection.updateOne(filter, updateDoc, options);
    res.json(result);
});

// foodName, foodImage, foodQuantity, pickupLocation, expiredDateTime, additionalNotes




    
    
    

    // Connect the client to the server	(optional starting in v4.7)
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
