const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello Worldddddddd!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});