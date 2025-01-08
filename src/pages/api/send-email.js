import AWS from 'aws-sdk';
import { readFileSync } from 'fs';
import path from 'path';
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
            const sts = new AWS.STS();
            const roleToAssume = {
                RoleArn: "arn:aws:iam::123456789012:role/CrossAccountSESSendEmail", // Replace with the role ARN in Account A
                RoleSessionName: "FargateCrossAccountSESSession",
            };

            const assumedRole = await sts.assumeRole(roleToAssume).promise();
            const { AccessKeyId, SecretAccessKey, SessionToken } = assumedRole.Credentials;
            console.log("AccessKeyId, SecretAccessKey, SessionToken", AccessKeyId, SecretAccessKey, SessionToken)
            // Step 2: Use temporary credentials to send an email via SES in Account A
            const ses = new AWS.SES({
                region: "us-east-1", // Replace with the SES region
                accessKeyId: AccessKeyId,
                secretAccessKey: SecretAccessKey,
                sessionToken: SessionToken,
            });

          
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
                templatePath = path.join(__dirname, '../../templates', 'registerotp.html');
                htmlTemplate = readFileSync(templatePath, 'utf-8');
                // const placeholders = {
                //     name: "user.name",
                //     verificationCode: "1234"
                // };
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
                Source: process.env.NEXT_PUBLIC_EMAIL, // Replace with your verified email
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
