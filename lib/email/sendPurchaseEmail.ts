


// this function send pdf over the mail 
// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT || 587),
//   secure: process.env.SMTP_SECURE === 'true',

//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });

// export async function sendProductEmail({
//   email,
//   productName,
//   pdfBuffer,
//   filename,
// }: {
//   email: string;
//   productName: string;
//   pdfBuffer: Buffer;
//   filename: string;
// }) {
//   await transporter.sendMail({
//     from: `"Digital Build" <${process.env.SMTP_USER}>`,

//     to: email,

//     subject: `Your purchase is confirmed - ${productName}`,

//     html: `
//       <div style="
//         font-family: Arial, sans-serif;
//         max-width: 600px;
//         margin: auto;
//         padding: 30px;
//       ">

//         <h2>Payment Successful 🎉</h2>

//         <p>
//           Thank you for your purchase.
//         </p>

//         <p>
//           Your purchase of
//           <strong>${productName}</strong>
//           has been successfully completed.
//         </p>

//         <p>
//           Your PDF is attached to this email.
//         </p>

//         <p>
//           You can also download the PDF directly
//           from the purchase page.
//         </p>

//         <br />

//         <p>
//           Regards,<br />
//           <strong>Digital Build</strong>
//         </p>

//       </div>
//     `,

//     attachments: [
//       {
//         filename,
//         content: pdfBuffer,
//         contentType: 'application/pdf',
//       },
//     ],
//   });
// }

//this function send the drive url over the mail :
import nodemailer from 'nodemailer';

const transporter =
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,

    pool: true,
    maxConnections: 2,
    maxMessages: 50,

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

export async function sendProductEmail({
  email,
  customerName,
  productName,
  downloadUrl,
}: {
  email: string;
  customerName?: string | null;
  productName: string;
  downloadUrl: string;
}) {
  await transporter.sendMail({
    from: `"Digital Build" <${process.env.SMTP_USER}>`,

    to: email,

    subject: `Your purchase is ready - ${productName}`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        
        <h2>Thank you for your purchase!</h2>

        ${
          customerName
            ? `<p>Hi ${customerName},</p>`
            : ''
        }

        <p>
          Your purchase of
          <strong>${productName}</strong>
          is ready.
        </p>

        <p>
          Click the button below to access your
          purchased content.
        </p>

        <p style="margin: 30px 0;">
          <a
            href="${downloadUrl}"
            target="_blank"
            style="
              display: inline-block;
              padding: 12px 24px;
              background: #111;
              color: #fff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Access Your Purchase
          </a>
        </p>

        <p style="font-size: 13px; color: #666;">
          You can also copy and paste this link
          into your browser:
        </p>

        <p style="font-size: 12px; word-break: break-all;">
          ${downloadUrl}
        </p>

        <p>
          If you have any issues accessing your
          purchase, contact us at
          wellservice367@gmail.com.
        </p>

      </div>
    `,
  });
}