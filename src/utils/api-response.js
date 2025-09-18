//we are trying top create a standard api response format for our application
//here api is nothing but the format of response from our server to the client

class ApiResponse {
    constructor(StatusCode, data, message = "Success") {
        this.statusCode = StatusCode;
        this.data = data;
        this.message = message;
        this.success = StatusCode < 400;
        //just true or false
    }
}

export { ApiResponse };
