import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const DAILY_RECIPIENTS = [
  "cliente1@gmail.com",
  "cliente2@hotmail.com",
  "admin@tudominio.com",
  "nicolasporras0910@gmail.com"

];

export async function GET() {
  const userMail = process.env.MAIL_USER;
  const passMail = process.env.MAIL_PASS;

  if (!userMail || !passMail) {
    return NextResponse.json(
      { error: "Faltan credenciales de correo (MAIL_USER o MAIL_PASS)" },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: userMail,
      pass: passMail,
    },
  });

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Buenos días - ${today}`;
  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
      <h1 style="color: #2563eb;">¡Buenos días!</h1>
      <p>Espero que estés teniendo un excelente <strong>${today}</strong>.</p>
      <p>Este es tu email automático diario desde <strong>App Next_Nicolas</strong>.</p>
      <hr>
      <p><a href="https://tutienda.vercel.app" style="color: #2563eb; text-decoration: none;">Ir a la tienda</a></p>
      <br>
      <small style="color: #888;">Este es un mensaje automático • No respondas a este correo</small>
    </div>
  `;

  try {
    const results = await Promise.all(
      DAILY_RECIPIENTS.map(async (email) => {
        try {
          await transporter.sendMail({
            from: `"App Next_Nicolas" <${userMail}>`,
            to: email,
            subject,
            html: htmlMessage,
          });
          return { email, status: "enviado" };
        } catch (err: any) {
          console.error(`Error enviando a ${email}:`, err.message);
          return { email, status: "error", error: err.message };
        }
      })
    );

    const enviados = results.filter((r) => r.status === "enviado").length;
    const fallidos = results.filter((r) => r.status === "error");

    return NextResponse.json({
      success: true,
      message: "Email diario enviado",
      enviados,
      fallidos: fallidos.length > 0 ? fallidos : null,
      ejecutado: new Date().toLocaleString("es-AR"),
    });
  } catch (error: any) {
    console.error("Error crítico en cron:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";