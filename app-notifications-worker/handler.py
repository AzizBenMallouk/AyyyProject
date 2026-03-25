"""
Feature Announcement Lambda Handler — powered by Google Gemini

Flow:
1. Receives SQS event from GitHub Actions (feature commit detected)
2. Fetches Gemini API key from Secrets Manager
3. Calls Gemini 1.5 Flash (free tier) to generate email subject + body
4. Publishes formatted HTML email to SNS topic
"""

import json
import os
import boto3
import google.generativeai as genai
import logging
from datetime import datetime, timezone

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# AWS clients
secrets_client = boto3.client("secretsmanager")
sns_client = boto3.client("sns")

SNS_TOPIC_ARN = os.environ["SNS_TOPIC_ARN"]
GEMINI_SECRET_NAME = os.environ["GEMINI_SECRET_NAME"]

# Cache the API key across warm Lambda invocations
_gemini_configured = False


def configure_gemini():
    """Fetch Gemini API key from Secrets Manager and configure SDK (once per warm start)."""
    global _gemini_configured
    if not _gemini_configured:
        response = secrets_client.get_secret_value(SecretId=GEMINI_SECRET_NAME)
        api_key = response["SecretString"]
        genai.configure(api_key=api_key)
        _gemini_configured = True


def generate_email_content(commit_msg: str, commit_sha: str, author: str, diff_summary: str) -> dict:
    """Call Gemini 1.5 Flash to generate email subject + HTML body."""
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""You are a friendly product update writer for a web application called YouCode.

A developer just pushed a new feature. Write a short, engaging announcement email for the app's users.

Commit message: {commit_msg}
Author: {author}
Changes summary: {diff_summary}

Return ONLY a valid JSON object with exactly two keys:
- "subject": a concise, exciting email subject line (max 80 characters)
- "body": a friendly HTML email body (2-3 short paragraphs, no <html>/<head> tags, just inner content)

JSON:"""

    response = model.generate_content(prompt)
    raw = response.text.strip()
    logger.info(f"Gemini raw output: {raw}")

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON found in Gemini response: {raw}")

    email_data = json.loads(raw[start:end])

    if "subject" not in email_data or "body" not in email_data:
        raise ValueError(f"Missing keys in parsed JSON: {email_data}")

    return email_data


def build_html_email(subject: str, body: str, commit_sha: str, author: str) -> str:
    """Wrap the AI-generated body in a clean branded HTML email template."""
    short_sha = commit_sha[:7]
    date_str = datetime.now(timezone.utc).strftime("%B %d, %Y")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:32px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:24px;">🚀 New Feature Update</h1>
              <p style="color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:14px;">{date_str}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              {body}
            </td>
          </tr>
          <tr>
            <td style="background:#f8f8f8; padding:16px 32px; border-top:1px solid #eeeeee;">
              <p style="color:#999999; font-size:12px; margin:0; text-align:center;">
                Deployed by <strong>{author}</strong> &bull; Commit <code>{short_sha}</code><br>
                You received this because you subscribed to YouCode feature updates.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def lambda_handler(event, context):
    """Main Lambda entry point — processes one SQS message at a time."""
    logger.info(f"Received event: {json.dumps(event)}")

    configure_gemini()

    for record in event["Records"]:
        body = json.loads(record["body"])

        commit_msg = body.get("commit_message", "New feature released")
        commit_sha = body.get("commit_sha", "unknown")
        author = body.get("author", "The Engineering Team")
        diff_summary = body.get("diff_summary", "Various improvements and new capabilities.")

        logger.info(f"Processing feature commit: {commit_sha} — {commit_msg}")

        email_content = generate_email_content(
            commit_msg=commit_msg,
            commit_sha=commit_sha,
            author=author,
            diff_summary=diff_summary,
        )

        subject = email_content["subject"]
        html_body = build_html_email(
            subject=subject,
            body=email_content["body"],
            commit_sha=commit_sha,
            author=author,
        )

        response = sns_client.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject=subject,
            Message=html_body,
            MessageAttributes={
                "content-type": {
                    "DataType": "String",
                    "StringValue": "text/html",
                }
            },
        )

        logger.info(f"SNS publish response: {response['MessageId']}")

    return {"statusCode": 200, "body": "Feature announcement sent."}
