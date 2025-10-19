//you have import everything on the top
import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({
    path: "../.env",
});

import app from "./app.js";

const port = process.env.PORT || 3000;



connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.error("Error", error);
        process.exit(1);
    });
