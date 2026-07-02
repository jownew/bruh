"use server";

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

  // TODO: plug in your email/notification service here (e.g. Resend, SendGrid, Nodemailer)
  console.log("📬 Contact form submission:", { name, email, category, message });

  return {
    status: "success",
    message: `Thanks, ${name}! We got your message and will get back to you soon. 🌟`,
  };
}
