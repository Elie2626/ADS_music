export const DEFAULT_OWNER_EMAIL = "contact@wavore.com";

/* Emballage commun : en-tête de marque + pied de page, en table pour la compatibilité email */
export function emailShell(bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f3f1fa;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1fa;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(20,10,50,0.08);">
          <tr>
            <td style="background:#12101a;padding:32px 40px;text-align:center;">
              <span style="font-size:22px;font-weight:800;color:#f0edfb;letter-spacing:-0.5px;">WAVORE<span style="color:#9d8cff;">.</span></span>
              <div style="margin-top:6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#9d8cff;">Pubs musicales &amp; vidéo</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background:#f7f6fb;border-top:1px solid #eeecf5;text-align:center;">
              <p style="margin:0;font-size:13px;color:#6b6580;">
                Une question ? Écrivez-nous à
                <a href="mailto:${DEFAULT_OWNER_EMAIL}" style="color:#6f5ce8;text-decoration:none;font-weight:600;">${DEFAULT_OWNER_EMAIL}</a>
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#a8a2bd;">© ${new Date().getFullYear()} WAVORE — tous droits réservés</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type EmailAttachment = { filename: string; content: string };

/* Envoie un email via Resend. Renvoie false silencieusement si la clé n'est pas configurée. */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "WAVORE <onboarding@resend.dev>";
  if (!apiKey) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, ...params }),
    });
    return res.ok;
  } catch (err) {
    console.error("[email] échec de l'envoi :", err);
    return false;
  }
}
