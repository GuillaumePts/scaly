const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

/**
 * Envoie des mails au photographe et à son client final selon l’état du paiement.
 * @param {string} mailPhotographe - Email du photographe client
 * @param {string} mailClientFinal - Email du client final (acheteur)
 * @param {boolean} paiementReussi - True si paiement réussi, false sinon
 * @returns {Promise<{success: boolean, errors: any[]}>}
 */
async function sendMailTicket(mailPhotographe, mailClientFinal, paiementReussi) {
    const errors = [];

    // Messages pour succès
    const sujetPhotographeOk = 'Paiement réussi !';
    const messagePhotographeOk = `
    Bonjour,
    <br><br>
    Nous vous informons que le paiement de votre client a été validé avec succès.
    <br>
    Merci de votre confiance pour utiliser Scaly Pic’s. Nous restons à votre disposition pour toute assistance.
    <br><br>
    Bien cordialement,<br>
    L’équipe Scaly Pic’s
  `;

    const sujetClientOk = 'Merci pour votre achat !';
    const messageClientOk = `
    Bonjour,
    <br><br>
    Votre paiement a bien été pris en compte. Vous pouvez dès à présent accéder aux photos haute définition de votre séance.
    <br>
    Merci de faire confiance à votre photographe pour immortaliser ces moments précieux.
    <br><br>
    Cordialement,<br>
    L’équipe Scaly Pic’s
`;


    // Messages pour échec
    const sujetPhotographeFail = 'Échec du paiement de votre client';
    const messagePhotographeFail = (mailClientFinal) => `
    Bonjour,
    <br><br>
    Le paiement lié à votre ticket n’a malheureusement pas pu être validé.
    <br>
    Ce problème peut être dû à une mauvaise configuration de votre compte Stripe Connect. 
    Nous vous recommandons de vérifier votre dashboard Stripe pour vous assurer que tout est correctement configuré.
    <br>
    Par ailleurs, vous pouvez également contacter directement votre client à l’adresse suivante : <a href="mailto:${mailClientFinal}">${mailClientFinal}</a> afin de clarifier la situation.
    <br><br>
    Si vous constatez que le problème ne vient ni de votre compte ni de votre client, il est possible qu’il provienne de notre site.
    Dans ce cas, n’hésitez pas à nous contacter via notre page de contact pour que nous puissions vous assister rapidement.
    <br><br>
    Bien cordialement,<br>
    L’équipe Scaly Pic’s
`;

    const sujetClientFail = 'Problème lors de votre paiement sur Scaly Pic’s';
    const messageClientFail = (mailPhotographe) => `
    Bonjour,
    <br><br>
    Nous avons rencontré un problème lors de la validation de votre paiement.
    <br>
    Merci de réessayer ou de contacter directement votre photographe à l’adresse suivante : <a href="mailto:${mailPhotographe}">${mailPhotographe}</a> pour plus d’informations.
    <br><br>
    Cordialement,<br>
    L’équipe Scaly Pic’s
`;

    try {
        await transporter.sendMail({
            from: `"Scaly Pic’s" <${process.env.GMAIL_USER}>`,
            to: mailPhotographe,
            subject: paiementReussi ? sujetPhotographeOk : sujetPhotographeFail,
            text: paiementReussi ? messagePhotographeOk.replace(/<br>/g, '\n') : messagePhotographeFail.replace(/<br>/g, '\n'),
            html: paiementReussi ? messagePhotographeOk : messagePhotographeFail,
        });
        console.log(`📩 Mail envoyé au photographe (${mailPhotographe})`);
    } catch (err) {
        console.error(`❌ Erreur envoi mail photographe :`, err);
        errors.push({ type: 'photographe', error: err });
    }

    try {
        await transporter.sendMail({
            from: `"Scaly Pic’s" <${process.env.GMAIL_USER}>`,
            to: mailClientFinal,
            subject: paiementReussi ? sujetClientOk : sujetClientFail,
            text: paiementReussi ? messageClientOk.replace(/<br>/g, '\n') : messageClientFail.replace(/<br>/g, '\n'),
            html: paiementReussi ? messageClientOk : messageClientFail,
        });
        console.log(`📩 Mail envoyé au client final (${mailClientFinal})`);
    } catch (err) {
        console.error(`❌ Erreur envoi mail client final :`, err);
        errors.push({ type: 'client', error: err });
    }

    return {
        success: errors.length === 0,
        errors,
    };
}


module.exports = sendMailTicket;