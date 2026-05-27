import axios from "axios";
import nodemailer from "nodemailer";
import { env } from "../config/env";

export async function unsubscribeFromLink(link: string, userEmail: string) {
  try {
    if (!link) throw new Error("No unsubscribe link");

    const candidates = link.split(",").map(s => s.trim());
    let selected = candidates.find(c => c.toLowerCase().startsWith("<http")) || candidates.find(c => c.toLowerCase().startsWith("http"));
    if (!selected) selected = candidates.find(c => c.toLowerCase().includes("mailto:")) || candidates[0];

    if (selected.startsWith("<") && selected.endsWith(">")) selected = selected.slice(1, -1);

    if (selected.toLowerCase().startsWith("http")) {
      await axios.get(selected, { timeout: 15000 });
      return { success: true, method: "http", url: selected };
    } else if (selected.toLowerCase().startsWith("mailto:")) {
      const to = selected.replace(/^mailto:/i, "");
      let transporter;
      if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: Number(env.SMTP_PORT) || 587,
          secure: false,
          auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
        });
      } else {
        transporter = nodemailer.createTransport({ sendmail: true });
      }

      await transporter.sendMail({
        from: userEmail,
        to,
        subject: "Unsubscribe request",
        text: "Please remove me from this mailing list.",
      });
      return { success: true, method: "mailto", to };
    } else {
      await axios.get(selected, { timeout: 15000 });
      return { success: true, method: "unknown", url: selected };
    }
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}
