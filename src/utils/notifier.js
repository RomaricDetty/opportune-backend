const nodemailer = require('nodemailer');

/**
 * Prévient l'équipe par e-mail. Sans SMTP configuré, rien n'est envoyé :
 * les pastilles du dashboard restent le signal de référence.
 * Une panne d'e-mail ne doit jamais bloquer une commande.
 * @param {string} subject
 * @param {string} text
 * @returns {Promise<void>}
 */
async function notifyTeam(subject, text) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, NOTIFY_EMAILS } = process.env;
    if (!SMTP_HOST || !NOTIFY_EMAILS) return;
    try {
        const port = Number(SMTP_PORT) || 587;
        const transport = nodemailer.createTransport({
            host: SMTP_HOST,
            port,
            secure: port === 465,
            auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
        });
        await transport.sendMail({
            from: SMTP_FROM || SMTP_USER,
            to: NOTIFY_EMAILS,
            subject,
            text,
        });
    } catch (error) {
        console.error('Notification e-mail non envoyée:', error.message);
    }
}

module.exports = { notifyTeam };
