const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false, //Gmail uses TLS
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    connectionTimeout: 5000, // 5 seconds
    greetingTimeout: 5000,
    socketTimeout: 5000,
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

// Function to send emails to multiple recipients (for blog notifications)
exports.sendBulkEmail = async (recipients, subject, html) => {
    const results = {
        success: 0,
        failed: 0,
        errors: []
    };

    // Send emails in batches to avoid overwhelming the server
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        const promises = batch.map(async (email) => {
            try {
                await transporter.sendMail({
                    from: process.env.MAIL_FROM,
                    to: email,
                    subject,
                    html
                });
                results.success++;
            } catch (error) {
                console.error(`Failed to send email to ${email}:`, error.message);
                results.failed++;
                results.errors.push({ email, error: error.message });
            }
        });

        await Promise.all(promises);
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`Bulk email complete: ${results.success} sent, ${results.failed} failed`);
    return results;
};