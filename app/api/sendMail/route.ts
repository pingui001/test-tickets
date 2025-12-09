import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, mensajeHtml, asunto } = await req.json();

  const userMail = process.env.MAIL_USER;
  const passMail = process.env.MAIL_PASS;

  if (!userMail || !passMail) {
    return NextResponse.json({ error: "Credenciales de correo no configuradas" }, { status: 500 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: userMail,
        pass: passMail,
      },
    });

    await transporter.sendMail({
      from: `"App Next_Nicolas" <${userMail}>`,
      to: email,
      subject: asunto,
      html: mensajeHtml,
    });

    return NextResponse.json({ res: "Mensaje enviado correctamente" }, { status: 200 });
  } catch (error: any) {
    console.error("Error enviando correo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
