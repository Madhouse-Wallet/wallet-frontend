import AWS from "aws-sdk";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY; // Same key, stored securely

const decryptOTP = async (encryptedOTP) => {
  console.log("decryptOTP", { encryptedOTP });
  const bytes = await CryptoJS.AES.decrypt(encryptedOTP, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
// Initialize the SES service
const replacePlaceholders = (template, placeholders) => {
  try {
    return template.replace(/{{(\w+)}}/g, (_, key) => placeholders[key] || "");
  } catch (err) {
    console.log("replacePlaceholders err", err);
  }
};

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const ses = new AWS.SES({
        region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
        credentials: {
          accessKeyId: process.env.NEXT_PUBLIC_AWS_SES_ACCESS_KEY,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_SES_SECRET_KEY,
        },
      });

      const { type, subject, emailData, email } = req.body;
      // Path to the HTML template
      let { verificationCode } = emailData;
      verificationCode = await decryptOTP(verificationCode);
      console.log("decrypted verificationCode", verificationCode);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}registerotp.html`
      );
      const htmlTemplate = await response.text();
      const htmlBody = await replacePlaceholders(htmlTemplate, { ...emailData, verificationCode });

      const params = {
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Body: {
            Html: {
              Data: htmlBody,
            },
          },

          Subject: {
            Data: subject,
          },
        },
        Source: `${process.env.NEXT_PUBLIC_EMAIL}`,
      };

      try {
        const data = await ses.sendEmail(params).promise();
        res.status(200).json({
          status: "success",
          message: "Email sent successfully",
          data,
        });
      } catch (err) {
        console.log("error->", err);
        res.status(500).json({
          status: "failure",
          message: "Failed to send email",
          error: err.message,
        });
      }
    } else {
      res.status(500).json({
        status: "failure",
        message: "Failed to send email",
        error: err.message,
      });
    }
  } catch (error) {
    console.log("error-->", error);
    res.status(500).json({
      status: "failure",
      message: "Failed to send email",
      error: error.message,
    });
  }
}
