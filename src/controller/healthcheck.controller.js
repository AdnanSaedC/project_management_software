//this is to just check whether everything working properly or not

import { ApiResponse } from "../utils/api-response.js";

//a function whichis logic

const healthCheck =(req,res) =>{
    try {
        res.status(200).json(
            new ApiResponse(200,{message: "Server is running and thisn is data"})
        )
        //this line is status code is 200
        //data is the an object converted in json before sending
    } catch (error) {
        
    }
}

export { healthCheck }