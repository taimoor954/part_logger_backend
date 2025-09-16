const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const https = require("https");
const http = require("http");
const morgan = require("morgan");
// const { initializeWebSocket } = require("./Config/socket");
// const bodyParser = require("body-parser");
// const { Server } = require("socket.io");
// const cookieParser = require("cookie-parser");
const fs = require("fs");
const credentials = require("./ssl");
// const { stripeWebhook } = require("./Controllers/Payment");
// const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const { NODE_ENV, PORT } = process.env;

// app initialize
const app = express();

// db initialize
require("./config/db");

const coreOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders:
    "Content-Type, Authorization, X-Requested-With, Accept, VERSION , params, headers",
  exposedHeaders:
    "Content-Type, Authorization, X-Requested-With, Accept, VERSION , params, headers",
};

app.use(cors(coreOptions));

app.use(morgan("dev"));

app.use(express.json());

var httpsServer;
if (NODE_ENV === "development") httpsServer = http.createServer(app);
else httpsServer = https.createServer(credentials, app);

// limiting the api calls
const limiter = rateLimit({
  max: 1000000,

  windowMs: 60 * 60 * 1000,

  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

// static routes
app.use("/Uploads", express.static("./Uploads"));

// routes register
app.use("/api", require("./routes/index"));

// app.use('/webhook', express.raw({type: 'application/json'}), stripeWebhook);

//test route

app.get("/", (req, res) => {
  res.send("Parts Logger Server Running");
});

httpsServer.listen(PORT, () => {
  console.log(`Parts Logger backend Listening on port ${PORT}`);
});
