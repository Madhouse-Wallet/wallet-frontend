import AWS from "aws-sdk";
import { readFileSync } from "fs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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
          accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY,
          secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_KEY,
        },
      });

      const { type, subject, emailData, email } = req.body;
      console.log("type, subject, emailData, email", req.body);
      let templatePath;
      let htmlTemplate;
      let htmlBody;
      // Path to the HTML template
      if (type == "registerOtp") {
        console.log(
          "process.env.NEXT_PUBLIC_DOMAIN-->",
          process.env.NEXT_PUBLIC_DOMAIN
        );
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}registerotp.html`
        );
        htmlTemplate = await response.text();
        replacePlaceholders(htmlTemplate, emailData);
      } else if (type == "verifyOtp") {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DOMAIN}verifyEmail.html`
        ); // Fetching from public folder
        htmlTemplate = await response.text();

        htmlBody = replacePlaceholders(htmlTemplate, emailData);
      }

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
