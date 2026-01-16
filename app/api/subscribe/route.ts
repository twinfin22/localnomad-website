import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

interface SubscriberData {
  email: string;
  firstName: string;
  status: "sent" | "failed";
}

async function addToAirtable({ email, firstName, status }: SubscriberData) {
  console.log("[Airtable] Saving with email:", email);
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Subscribers";

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn("Airtable not configured, skipping...");
    return;
  }

  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              Email: email,
              "First Name": firstName,
              Source: "curated-resource",
              Page: "homepage",
              Status: status,
            },
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Airtable error:", error);
    throw new Error("Failed to save to Airtable");
  }
}

async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  try {
    const resend = getResend();
    const greeting = firstName ? `Hey ${firstName},` : "Hey there,";
    const emailFrom = process.env.EMAIL_FROM || "LocalNomad <welcome@mail.localnomad.club>";
    const replyTo = process.env.EMAIL_REPLY_TO || "hey@localnomad.club";
    const resourceUrl = process.env.NOTION_RESOURCE_URL || "https://localnomad.notion.site/local-resource-archive";

    const { error } = await resend.emails.send({
      from: emailFrom,
      to: email,
      replyTo,
      subject: "Your Seoul Local Resource Archive is here",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 8px;">Welcome to LocalNomad</h1>
            </div>

            <p style="font-size: 16px; margin-bottom: 16px;">${greeting}</p>

            <p style="font-size: 16px; margin-bottom: 16px;">
              Thanks for signing up! Here's your access to our curated <strong>Seoul Local Resource Archive</strong> — a collection of vetted resources to help you navigate your first days in Seoul.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resourceUrl}"
                 style="display: inline-block; background-color: #1a1a2e; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Access the Resource Archive
              </a>
            </div>

            <p style="font-size: 16px; margin-bottom: 16px;">
              This archive includes:
            </p>
            <ul style="font-size: 16px; margin-bottom: 24px; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Accommodation options (co-living, serviced apartments, short-term rentals)</li>
              <li style="margin-bottom: 8px;">Banking & financial setup guides</li>
              <li style="margin-bottom: 8px;">SIM cards & connectivity</li>
              <li style="margin-bottom: 8px;">Transportation tips</li>
              <li style="margin-bottom: 8px;">Neighborhood breakdowns</li>
            </ul>

            <p style="font-size: 16px; margin-bottom: 16px;">
              Need more hands-on help? Our <a href="https://localnomad.club" style="color: #3B6EA8;">Soft Landing packages</a> include 1:1 calls, personalized guidance, and optional in-person support.
            </p>

            <p style="font-size: 16px; margin-bottom: 8px;">
              Safe travels,<br>
              <strong>The LocalNomad Team</strong>
            </p>

            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">

            <p style="font-size: 12px; color: #666; text-align: center;">
              You're receiving this because you signed up at localnomad.club<br>
              Questions? Reply to this email — we read everything.
            </p>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[Subscribe] Request body:", JSON.stringify(body));
    const { email, firstName } = body;
    console.log("[Subscribe] Extracted email:", email);

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const trimmedFirstName = typeof firstName === "string" ? firstName.trim() : "";

    // Send email first, then save to Airtable with status
    const emailSent = await sendWelcomeEmail(email, trimmedFirstName);

    await addToAirtable({
      email,
      firstName: trimmedFirstName,
      status: emailSent ? "sent" : "failed",
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Successfully subscribed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
