const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // ou autre : smtp.ionos.fr, smtp.mailtrap.io, etc.
  port: 587,
  secure: false, // true pour le port 465, false pour 587
  auth: {
    user: process.env.GMAIL_USER, // ton adresse mail
    pass: process.env.GMAIL_PASS  // mot de passe ou app password
  }
});

/**
 * Envoie un email simple (texte) à un destinataire.
 * @param {string} to - Adresse email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} text - Contenu texte brut de l'email
 * @returns {Promise<void>}
 */
async function sendEmail(to, subject, html) {
  const mailOptions = {
    from: `"Scaly Pic’s" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé à :", to);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du mail :", error);
    throw error;
  }
}

module.exports = sendEmail;
