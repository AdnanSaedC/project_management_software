import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//we have named it diffrently here


const app = express();


//lets us initialize our express server to handle
//cross origin share resource error

//use is nothing but config the middle ware
//it preprocess the req,authorize and stops mth fishy reaching the server

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
app.use(cookieParser())

//cors configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

import healthCheckFromRouterFolder from "./routes/healthcheck.route.js"
//routing allowed
app.use("/api/v1/healthcheck",healthCheckFromRouterFolder)
//look here we are using app.use 
/**because we want to attach everything after this base url(api/v1/...)
 * if we do it here then we have to write api/v1... multiple times which we dont want
 * and it makes thing messeier
 * 
 * if you to healthCheckFromRouterfolder we will use only get menthod there
 * its just abstarction 
 * u can also do some calculations if you want inside get no one is stopping u
 */



import authRoute from "../src/routes/auth.route.js"
app.use("/api/v1/auth",authRoute);
app.get("/", (req, res) => {
    res.send("Hello World!");
});




//credentials is to access cookies and other things
export default app;
