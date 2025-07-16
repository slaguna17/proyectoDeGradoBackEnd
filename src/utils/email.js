const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendResetEmail(to, link) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Restablece tu contraseña',
    html: `<p>Para cambiar tu contraseña haz click en el siguiente enlace: <a href="${link}">${link}</a></p>
    <p>Si no solicitaste este cambio, ignora este correo.</p>`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };
