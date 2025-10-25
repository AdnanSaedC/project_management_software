//here we are going to create the message for our email
import Mailgen from "mailgen";
import nodemailer from "nodemailer";


const sendEmail = async (options)=>{
    //you need a mailgen object
    const mailgenarator = new Mailgen({
        theme: "default",
        product:{
            name :"Task Manager",
            link : "https://adnan0042n.carrd.co"
        }
        //this is to create the content of email
        //and it is a footer content which we have given here
    })

    const plainText = mailgenarator.generatePlaintext(options.mailgenContent);
    const htmlText = mailgenarator.generate(options.mailgenContent);
    //actual message
    const transporter = nodemailer.createTransport({
        host : process.env.MAILGEN_SMTP_host,
        port : process.env.MAILGEN_SMTP_port,
        auth:{
            user: process.env.MAILGEN_SMTP_user,
            pass: process.env.MAILGEN_SMTP_pass
        }
        //the one which is going to transport
    })
    const mail = {
        from : "mail@gmail.com",
        to : options.email,
        subject: options.subject,
        text: plainText ,
        html: htmlText
    }
    //the actual mail which is going to be send

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Error ",error)
    }
    //sending the mail
}

const emailVerificationMessage = (username,verifiactionURL)=>{
    return {
        body:{
            name: username,
            intro: "welcome",
            action:{
                message:"Click to verify",
                button:{
                    color: "#22BC66",
                    text:"verify ur emial",
                    link: verifiactionURL
                }
            },
            outro:"Need help reach out here"
        }
    }
}
const forgotPasswordVerificationMessage = (username,verifiactionURL)=>{
    return {
        body:{
            name: username,
            intro: "welcome",
            action:{
                message:"Click here to change your password",
                button:{
                    color: "#22BC66",
                    text:"change password",
                    link: verifiactionURL
                }
            },
            outro:"Need help reach out here"
        }
    }
}


export {
    emailVerificationMessage,
    forgotPasswordVerificationMessage,
    sendEmail
}