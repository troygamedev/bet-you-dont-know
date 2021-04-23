const express = require("express");

const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const path = require("path");

//force https
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https")
      res.redirect(`https://${req.header("host")}${req.url}`);
    else next();
  });
}

//middleware
app.use(cors());
app.use(express.json());

// force paths to load html
app.use(
  express.static(path.join(__dirname, "../client/out"), {
    // index: false,
    extensions: ["html"],
  })
);

//Routes//
app.get("/api", (req, res) => {
  res.json({ message: "hola" });
});

app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
