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
//     from: `"Your Company Name" <${process.env.SMTP_USER}>`,
//     to: email,
//     subject: `Your purchase is confirmed - ${productName}`,

//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        
//         <h2>Payment Successful 🎉</h2>

//         <p>
//           Thank you for your purchase.
//         </p>

//         <p>
//           Your payment for <strong>${productName}</strong>
//           has been successfully received.
//         </p>

//         <p>
//           Your purchased PDF is attached to this email.
//         </p>

//         <p>
//           You can also download your product from your
//           purchase confirmation page.
//         </p>

//         <br />

//         <p>
//           Regards,<br />
//           <strong>Your Company Name</strong>
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

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendProductEmail({
  email,
  productName,
  pdfBuffer,
  filename,
}: {
  email: string;
  productName: string;
  pdfBuffer: Buffer;
  filename: string;
}) {
  await transporter.sendMail({
    from: `"Digital Build" <${process.env.SMTP_USER}>`,

    to: email,

    subject: `Your purchase is confirmed - ${productName}`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 30px;
      ">

        <h2>Payment Successful 🎉</h2>

        <p>
          Thank you for your purchase.
        </p>

        <p>
          Your purchase of
          <strong>${productName}</strong>
          has been successfully completed.
        </p>

        <p>
          Your PDF is attached to this email.
        </p>

        <p>
          You can also download the PDF directly
          from the purchase page.
        </p>

        <br />

        <p>
          Regards,<br />
          <strong>Digital Build</strong>
        </p>

      </div>
    `,

    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}