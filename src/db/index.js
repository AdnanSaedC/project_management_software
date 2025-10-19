import mongoose from "mongoose";

//aync function means js get aware
/**
 * awiat means it stops at that line and
 * executes the code after the async function part
 *
 * once the promise is fullfilles it starts to resume the execution
 *
 * so async is used to create a biundary and await is used to stop the execution
 * at certain point
 */

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to mongodb");
    } catch (error) {
        console.log("Error ", error);
        //terminate everything
        process.exit(1);
    }
};

export default connectDB;

/**we are doing this so that other parts of the file
use it 

keyword default just means main thing being exported*/
