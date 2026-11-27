
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const TERMII_API_KEY = Deno.env.get("TERMII_API_KEY");
const TERMII_BASE_URL = Deno.env.get("TERMII_BASE_URL");
const TERMII_SENDER_ID = Deno.env.get("TERMII_SENDER_ID");
const SEND_SMS_HOOK_SECRET = Deno.env.get("SEND_SMS_HOOK_SECRET");

Deno.serve(async (req: Request) => {
  const jsonHeaders = {
    "Content-Type": "application/json",
  };

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: jsonHeaders }
    );
  }

  try {
    if (
      !TERMII_API_KEY ||
      !TERMII_BASE_URL ||
      !TERMII_SENDER_ID ||
      !SEND_SMS_HOOK_SECRET
    ) {
      throw new Error("Required SMS configuration is missing.");
    }

    const payload = await req.text();

    const secret = SEND_SMS_HOOK_SECRET.replace(/^v1,whsec_/, "");
    const webhook = new Webhook(secret);

    const headers = Object.fromEntries(req.headers);
    const event = webhook.verify(payload, headers) as {
      user?: { phone?: string };
      sms?: { otp?: string };
    };

    const phone = event.user?.phone;
    const otp = event.sms?.otp;

    if (!phone || !otp) {
      throw new Error("Phone number or OTP is missing.");
    }

    // Convert Nigerian numbers to international format.
    let recipient = phone.replace(/\D/g, "");

    if (recipient.startsWith("0")) {
      recipient = `234${recipient.slice(1)}`;
    }

    if (!recipient.startsWith("234") || recipient.length !== 13) {
      throw new Error("A valid Nigerian phone number is required.");
    }

    const message =
      `Your TRP verification code is ${otp}. Do not share this code with anyone.`;

    const baseUrl = TERMII_BASE_URL.replace(/\/+$/, "");

    const response = await fetch(`${baseUrl}/api/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TERMII_API_KEY,
        to: recipient,
        from: TERMII_SENDER_ID,
        sms: message,
        type: "plain",
        channel: "dnd",
      }),
    });

    const result = await response.json();

    if (!response.ok || result.message !== "Successfully Sent") {
      console.error("Termii SMS delivery failed:", result);

      return new Response(
        JSON.stringify({ error: "SMS delivery failed." }),
        { status: 502, headers: jsonHeaders }
      );
    }

    return new Response("{}", {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (error) {
    console.error("Send SMS hook error:", error);

return new Response(null, {
  status: 200,
});    
  }
});
