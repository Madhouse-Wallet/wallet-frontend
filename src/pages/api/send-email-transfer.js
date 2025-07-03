import AWS from "aws-sdk";

// Initialize the SES service
const replacePlaceholders = (template, placeholders) => {
  try {
    return template.replace(/{{(\w+)}}/g, (_, key) => placeholders[key] || "");
  } catch (err) {
    console.log("replacePlaceholders err", err);
  }
};

// Function to format transfer data into HTML table
const formatTransferDataToHTML = (transferData) => {
  try {
    const data = JSON.parse(transferData);

    let html = `
      <div style="margin: 20px 0;">
        <h4 style="color: #030e49; margin-bottom: 15px; font-family: Helvetica, Arial, sans-serif;">Transfer Summary</h4>
        
        <!-- Business Account Details -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: Helvetica, Arial, sans-serif; font-size: 14px;">
          <tr style="background-color: #f8f9fa;">
            <td colspan="2" style="padding: 10px; border: 1px solid #dee2e6; font-weight: 600; color: #030e49;">Business Account Information</td>
          </tr>
           <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500; width: 40%;">Business Id:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.businessAccountDetail?.data?.business?.id || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500; width: 40%;">Business Name:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.businessAccountDetail?.data?.business?.name || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Account Status:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.businessAccountDetail?.data?.business?.accountStatus || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Registered Address:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.businessAccountDetail?.data?.business?.registeredAddress?.street || ""}, ${data.businessAccountDetail?.data?.business?.registeredAddress?.city || ""}, ${data.businessAccountDetail?.data?.business?.registeredAddress?.state || ""}, ${data.businessAccountDetail?.data?.business?.registeredAddress?.country || ""} ${data.businessAccountDetail?.data?.business?.registeredAddress?.postalCode || ""}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Wallet Address:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.businessAccountDetail?.data?.wallets?.[0]?.address || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Network:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.businessAccountDetail?.data?.wallets?.[0]?.network || "N/A"}</td>
          </tr>
        </table>

        <!-- Transfer Details -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: Helvetica, Arial, sans-serif; font-size: 14px;">
          <tr style="background-color: #f8f9fa;">
            <td colspan="2" style="padding: 10px; border: 1px solid #dee2e6; font-weight: 600; color: #030e49;">Transfer Details</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500; width: 40%;">Payment ID:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.transfer?.paymentId || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Status:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;"><span style="background-color: ${data.transfer?.status === "confirmed" ? "#d4edda" : "#f8d7da"}; color: ${data.transfer?.status === "confirmed" ? "#155724" : "#721c24"}; padding: 3px 8px; border-radius: 3px;">${data.transfer?.status || "N/A"}</span></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Amount:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.transfer?.payment?.receivingAmount || "N/A"} ${data.transfer?.payment?.receivingCurrency || ""}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Sender Currency:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.transfer?.payment?.senderCurrency || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Description:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.transfer?.payment?.description || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Purpose:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.transfer?.payment?.purposeOfPayment?.replace(/_/g, " ") || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Transaction Hash:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6; word-break: break-all;">${data.txHash || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Valid From:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.transfer?.validFrom ? new Date(data.transfer.validFrom).toLocaleString() : "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Valid To:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${data.transfer?.validTo ? new Date(data.transfer.validTo).toLocaleString() : "N/A"}</td>
          </tr>
        </table>

        <!-- Receiving Party Details -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: Helvetica, Arial, sans-serif; font-size: 14px;">
          <tr style="background-color: #f8f9fa;">
            <td colspan="2" style="padding: 10px; border: 1px solid #dee2e6; font-weight: 600; color: #030e49;">Receiving Party Details</td>
          </tr>
    `;

    // Add receiving party details from the array
    if (data.receivingPartyDetail && data.receivingPartyDetail.length > 0) {
      data.receivingPartyDetail.forEach((party, index) => {
        const partyData = party.data;
        html += `
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500; width: 40%;">Party ${index + 1} Name:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${partyData?.name?.name || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Type:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${partyData?.type || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Account Number:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${partyData?.accounts?.[0]?.identifier?.value || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Bank Name:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${partyData?.accounts?.[0]?.provider?.name || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Bank Country:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${partyData?.accounts?.[0]?.provider?.country || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">SWIFT Code:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${partyData?.accounts?.[0]?.swiftCode || partyData?.accounts?.[0]?.provider?.networkIdentifier || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Currencies:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${partyData?.accounts?.[0]?.currencies?.join(", ") || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Address:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${partyData?.accounts?.[0]?.addresses?.[0]?.street || ""}, ${partyData?.accounts?.[0]?.addresses?.[0]?.city || ""}, ${partyData?.accounts?.[0]?.addresses?.[0]?.state || ""}, ${partyData?.accounts?.[0]?.addresses?.[0]?.country || ""} ${partyData?.accounts?.[0]?.addresses?.[0]?.postalCode || ""}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: 500;">Created At:</td>
            <td style="padding: 8px; border: 1px solid #dee2e6;">${party.createdAt ? new Date(party.createdAt).toLocaleString() : "N/A"}</td>
          </tr>
        `;

        // Add separator between parties if there are multiple
        if (index < data.receivingPartyDetail.length - 1) {
          html += `
            <tr>
              <td colspan="2" style="padding: 5px; border: 1px solid #dee2e6; background-color: #f8f9fa; text-align: center; font-style: italic;">--- Next Party ---</td>
            </tr>
          `;
        }
      });
    } else {
      html += `
        <tr>
          <td colspan="2" style="padding: 8px; border: 1px solid #dee2e6; text-align: center; font-style: italic;">No receiving party details available</td>
        </tr>
      `;
    }

    html += `
        </table>
      </div>
    `;

    return html;
  } catch (error) {
    console.error("Error formatting transfer data:", error);
    return `<div style="color: #721c24; padding: 10px; border: 1px solid #f5c6cb; background-color: #f8d7da; border-radius: 4px;">Error formatting transfer data: ${error.message}</div>`;
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

      // Format the transfer data into HTML table
      const formattedTransferDetail = formatTransferDataToHTML(
        emailData.transferDetail
      );

      // Create the email data with formatted transfer detail
      const processedEmailData = {
        ...emailData,
        transferDetail: formattedTransferDetail,
      };

      // Path to the HTML template
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}transferemail.html`
      );
      const htmlTemplate = await response.text();
      const htmlBody = await replacePlaceholders(
        htmlTemplate,
        processedEmailData
      );

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
      res.status(405).json({
        status: "failure",
        message: "Method not allowed",
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
