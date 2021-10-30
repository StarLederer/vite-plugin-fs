const express = require("express");

const app = express();

// app.use(express.json());
// app.use(cors());

//
//
// Requests

// GET request
app.get("/*", async (req, res) => {
  console.log("11111111");
  res.status(200).send({
    type: "file",
    test: 1,
  });
});

//
//
// Start the app

app.listen(7070, () => {
  console.log("fs server has started on port 6666");
});
