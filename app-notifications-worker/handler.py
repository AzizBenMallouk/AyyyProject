"""
Feature Announcement Lambda Handler

Flow:
1. Receives SQS event from GitHub Actions (feature commit detected)
2. Fetches HuggingFace token from Secrets Manager
3. Calls HuggingFace Inference API to generate email subject + body
4. Publishes formatted HTML email to SNS topic
"""

import json
import os
import boto3
import requests
import logging
from datetime import datetime, timezone

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# AWS clients
secrets_client = boto3.client("secretsmanager")
sns_client = boto3.client("sns")

SNS_TOPIC_ARN = os.environ["SNS_TOPIC_ARN"]
HF_SECRET_NAME = os.environ["HF_SECRET_NAME"]

HF_API_URL = (
    "https://api-inference.huggingface.co/models/"
    "mistralai/Mistral-7B-Instruct-v0.3"
)


def get_hf_token() -> str:
    """Fetch HuggingFace token from Secrets Manager (cached per Lambda warm start)."""
    response = secrets_client.get_secret_value(SecretId=HF_SECRET_NAME)
    return response["SecretString"]


def generate_email_content(commit_msg: str, commit_sha: str, author: str, diff_summary: str, hf_token: str) -> dict:
    """Call HuggingFace Inference API to generate subject + body."""
    prompt = f"""<s>[INST] You are a friendly product update writer for a software application called YouCode.

A developer just pushed a new feature. Write a short, engaging email to notify users.

Commit message: {commit_msg}
Author: {author}
Changes summary: {diff_summary}

Return ONLY a JSON object with exactly two keys:
- "subject": a concise, exciting email subject line (max 80 chars)
- "body": a friendly HTML email body (2-3 short paragraphs, no <html>/<head> tags, just the inner content)

JSON: [/INST]"""

    headers = {"Authorization": f"Bearer {hf_token}"}
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 512,
            "temperature": 0.7,
            "return_full_text": False,
        },
    }

    response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)
    response.raise_for_status()

    generated = response.json()[0]["generated_text"]
    logger.info(f"HuggingFace raw output: {generated}")

    # Extract JSON from the generated text
    start = generated.find("{")
    end = generated.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON found in HuggingFace response: {generated}")

    email_data = json.loads(generated[start:end])

    if "subject" not in email_data or "body" not in email_data:
        raise ValueError(f"Missing keys in parsed JSON: {email_data}")

    return email_data


def build_html_email(subject: str, body: str, commit_sha: str, author: str) -> str:
    """Wrap the AI-generated body in a clean HTML email template."""
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
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:32px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:24px;">🚀 New Feature Update</h1>
              <p style="color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:14px;">{date_str}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              {body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8; padding:16px 32px; border-top:1px solid #eeeeee;">
              <p style="color:#999999; font-size:12px; margin:0; text-align:center;">
                Deployed by <strong>{author}</strong> &bull; Commit <code>{short_sha}</code><br>
                You received this because you subscribed to YouCode feature updates.<br>
                <a href="{{{{unsubscribeUrl}}}}" style="color:#667eea;">Unsubscribe</a>
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

    hf_token = get_hf_token()

    for record in event["Records"]:
        body = json.loads(record["body"])

        commit_msg = body.get("commit_message", "New feature released")
        commit_sha = body.get("commit_sha", "unknown")
        author = body.get("author", "The Engineering Team")
        diff_summary = body.get("diff_summary", "Various improvements and new capabilities.")

        logger.info(f"Processing feature commit: {commit_sha} — {commit_msg}")

        # Generate email with AI
        email_content = generate_email_content(
            commit_msg=commit_msg,
            commit_sha=commit_sha,
            author=author,
            diff_summary=diff_summary,
            hf_token=hf_token,
        )

        subject = email_content["subject"]
        html_body = build_html_email(
            subject=subject,
            body=email_content["body"],
            commit_sha=commit_sha,
            author=author,
        )

        # Publish to SNS
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
