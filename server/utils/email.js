const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false, //Gmail uses TLS
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
    rejectUnauthorized: false
    }
});

// Main function to send mail
exports.sendEmail = async (to, subject, html) => {
    try{
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to,
            subject,
            html
        });

        console.log("Email sent!");
        console.log("GMAIL MESSAGE ID:", info.messageId); 
        return true;
    } catch(error){
        console.error("Email sending error: ",error);
        return false;
    }
};