"use server";

import { Resend } from "resend";

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { status: "error", message: "Please fill in all required fields." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.CONTACT_TO;

  if (!apiKey || !from || !to) {
    console.error("Missing Resend env vars: RESEND_API_KEY, RESEND_FROM, CONTACT_TO");
    return { status: "error", message: "Email service is not configured. Please try again later." };
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `[${category}] Message from ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Category:</strong> ${category}</p>
      <hr />
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return { status: "error", message: "Failed to send your message. Please try again." };
  }

  return {
    status: "success",
    message: `Thanks, ${name}! We got your message and will get back to you soon. 🌟`,
  };
}
