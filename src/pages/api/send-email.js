import AWS from 'aws-sdk';
import { readFileSync } from 'fs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Initialize the SES service


const replacePlaceholders = (template, placeholders) => {
    try {
        return template.replace(/{{(\w+)}}/g, (_, key) => placeholders[key] || '');
    }
    catch (err) {
        console.log("replacePlaceholders err", err);
    }
};

export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            // const sts = new AWS.STS();
            // const roleToAssume = {
            //     RoleArn: "arn:aws:iam::264736150784:role/Ses-Email-Madhouse-Role", // Replace with the role ARN in Account A
            //     RoleSessionName: "FargateCrossAccountSESSession",
            // };

            // const assumedRole = await sts.assumeRole(roleToAssume).promise();
            // const { AccessKeyId, SecretAccessKey, SessionToken } = assumedRole.Credentials;
            // console.log("AccessKeyId, SecretAccessKey, SessionToken", AccessKeyId, SecretAccessKey, SessionToken)
            // // Step 2: Use temporary credentials to send an email via SES in Account A
            // const ses = new AWS.SES({
            //     region: "us-east-1", // Replace with the SES region
            //     accessKeyId: AccessKeyId,
            //     secretAccessKey: SecretAccessKey,
            //     sessionToken: SessionToken,
            // });


            const sts = new AWS.STS()
            const data = await sts
                .assumeRole({
                    RoleArn: "arn:aws:iam::145023121234:role/madhouse-ecs-role",
                    RoleSessionName: 'AccessMongoDB'
                })
                .promise();

            let ses = new AWS.SES({
                region: "us-east-1",
                credentials: {
                    accessKeyId: data.Credentials.AccessKeyId,
                    secretAccessKey: data.Credentials.SecretAccessKey,
                    sessionToken: data.Credentials.SessionToken,
                },
            })


            // const ses = new AWS.SES({
            //     // region: process.env.NEXT_PUBLIC_AWS_S3_REGION
            //     region: "us-east-1"
            // });
            // const ses = new AWS.SES({
            //     region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
            //     credentials: {
            //         accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY,
            //         secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_KEY,
            //     }
            // });

            console.log("ses-->", ses)
            const { type, subject, emailData, email } = req.body;
            console.log("type, subject, emailData, email", req.body)
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            let templatePath;
            let htmlTemplate;
            let htmlBody;
            // Path to the HTML template
            if (type == "registerOtp") {
                // templatePath = path.join(__dirname, '../../templates', 'registerotp.html');
                // console.log("templatePath-->", templatePath)
                // htmlTemplate = readFileSync(templatePath, 'utf-8');
                console.log("process.env.NEXT_PUBLIC_DOMAIN-->", process.env.NEXT_PUBLIC_DOMAIN)
                const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}registerotp.html`);  // Fetching from public folder
                htmlTemplate = await response.text();
                // console.log("htmlTemplatdde -->", htmlTemplate);  // Logs the HTML content
                // let ghtmlBody = replacePlaceholders(htmlTemplate, emailData);
                // console.log("ghtmlBody -->", ghtmlBody); 

                // Read the file synchronously
                // const htmlTemplatee = fs.readFileSync(templatePath12, 'utf-8');
                // console.log("htmlTemplatee-->", htmlTemplatee)


                // const placeholders = {
                //     name: "user.name",
                //     verificationCode: "1234"
                // };
                htmlBody = replacePlaceholders(htmlTemplate, emailData);
            } else if (type == "verifyOtp") {
                // templatePath = path.join(__dirname, '../../templates', 'verifyEmail.html');
                // console.log("templatePath-->", templatePath)
                const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}verifyEmail.html`);  // Fetching from public folder
                htmlTemplate = await response.text();
                // const placeholders = {
                //     name: "user.name",
                //     verificationCode: "1234"
                // };
                htmlBody = replacePlaceholders(htmlTemplate, emailData);
            }
            // console.log("htmlBody-->",htmlBody)
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
                Source: `${process.env.NEXT_PUBLIC_EMAIL}`
                // process.env.NEXT_PUBLIC_EMAIL, // Replace with your verified email
            };

            try {
                const data = await ses.sendEmail(params).promise();
                res.status(200).json({ status: "success", message: 'Email sent successfully', data });
            } catch (err) {
                res.status(500).json({ status: "failure", message: 'Failed to send email', error: err.message });
            }
        } else {
            res.status(500).json({ status: "failure", message: 'Failed to send email', error: err.message });
        }
    } catch (error) {
        console.log("error-->", error)
        res.status(500).json({ status: "failure", message: 'Failed to send email', error: error.message });

    }

}
