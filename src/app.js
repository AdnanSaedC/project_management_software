import express from "express";
import cors from "cors";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

//lets us initialize our express server to handle
//cross origin share resource error

app.use(express.json({ limit: "16kb" }));

/**
 * all the codes run in the server
 * the client does not access to them
 *
 * all the files in the folder can be accessible by client using get,post method
 */
app.use(express.static("public"));

//this is to handle the encoded data which comes from forms etc
//extended means that we can handle nested objects or complex objects
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//cors configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

//credentials is to access cookies and other things
export default app;
