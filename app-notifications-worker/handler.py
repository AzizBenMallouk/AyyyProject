"""
Feature Announcement Lambda — Gemini REST API (no external dependencies)

Uses Python stdlib only (urllib + json) to call Gemini, avoiding
gRPC/grpcio platform mismatch errors in Lambda.
"""

import json
import os
import urllib.request
import boto3
import logging
from datetime import datetime, timezone

logger = logging.getLogger()
logger.setLevel(logging.INFO)

secrets_client = boto3.client("secretsmanager")
sns_client = boto3.client("sns")

SNS_TOPIC_ARN = os.environ["SNS_TOPIC_ARN"]
GEMINI_SECRET_NAME = os.environ["GEMINI_SECRET_NAME"]

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-1.5-flash:generateContent?key={api_key}"
)

_api_key = None  # Cached across warm invocations


def get_api_key() -> str:
    global _api_key
    if not _api_key:
        response = secrets_client.get_secret_value(SecretId=GEMINI_SECRET_NAME)
        _api_key = response["SecretString"]
    return _api_key


def generate_email_content(commit_msg: str, commit_sha: str, author: str, diff_summary: str) -> dict:
    """Call Gemini 1.5 Flash via REST API (no SDK needed)."""
    api_key = get_api_key()
    url = GEMINI_URL.format(api_key=api_key)

    prompt = f"""You are a friendly product update writer for a web application called YouCode.

A developer just pushed a new feature. Write a short, engaging announcement email for app users.

Commit message: {commit_msg}
Author: {author}
Changes summary: {diff_summary}

Return ONLY a valid JSON object with exactly two keys:
- "subject": a concise, exciting email subject line (max 80 chars)
- "body": a friendly HTML email body (2-3 short paragraphs, no html/head tags, just inner content)

JSON:"""

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 512},
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    raw = result["candidates"][0]["content"]["parts"][0]["text"].strip()
    logger.info(f"Gemini raw output: {raw}")

    # Strip markdown code fences if present
    if "```" in raw:
        parts = raw.split("```")
        raw = parts[1] if len(parts) > 1 else raw
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
            <td style="padding:32px;">{body}</td>
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
    logger.info(f"Received event: {json.dumps(event)}")

    for record in event["Records"]:
        body = json.loads(record["body"])

        commit_msg = body.get("commit_message", "New feature released")
        commit_sha = body.get("commit_sha", "unknown")
        author = body.get("author", "The Engineering Team")
        diff_summary = body.get("diff_summary", "Various improvements and new capabilities.")

        logger.info(f"Processing: {commit_sha} — {commit_msg}")

        email_content = generate_email_content(commit_msg, commit_sha, author, diff_summary)

        subject = email_content["subject"]
        html_body = build_html_email(subject, email_content["body"], commit_sha, author)

        response = sns_client.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject=subject,
            Message=html_body,
            MessageAttributes={
                "content-type": {"DataType": "String", "StringValue": "text/html"}
            },
        )
        logger.info(f"SNS MessageId: {response['MessageId']}")

    return {"statusCode": 200, "body": "Feature announcement sent."}
