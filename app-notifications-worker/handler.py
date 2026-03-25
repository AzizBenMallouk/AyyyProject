"""
Feature Announcement Lambda — Simple email notification (no AI)

Sends a clean HTML email directly to SNS subscribers
with the commit message, author, and diff summary.
"""

import json
import os
import boto3
import logging
from datetime import datetime, timezone

logger = logging.getLogger()
logger.setLevel(logging.INFO)

sns_client = boto3.client("sns")
SNS_TOPIC_ARN = os.environ["SNS_TOPIC_ARN"]


def build_html_email(commit_msg: str, commit_sha: str, author: str, diff_summary: str) -> tuple[str, str]:
    short_sha = commit_sha[:7]
    date_str = datetime.now(timezone.utc).strftime("%B %d, %Y")

    # Clean up commit message for subject (remove "feature:" prefix if present)
    subject_text = commit_msg.replace("feature:", "").replace("feature/", "").strip().capitalize()
    subject = f"🚀 New Feature: {subject_text[:70]}"

    body = f"""<!DOCTYPE html>
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
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:32px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:24px;">🚀 New Feature Released</h1>
              <p style="color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:14px;">{date_str}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="color:#333333; font-size:18px; margin:0 0 16px;">{subject_text}</h2>
              <p style="color:#555555; font-size:15px; line-height:1.6; margin:0 0 24px;">
                We just shipped a new update to YouCode! Here's what changed:
              </p>

              <table width="100%" cellpadding="12" style="background:#f8f8f8; border-radius:6px; margin-bottom:24px;">
                <tr>
                  <td style="color:#888; font-size:13px; width:120px; vertical-align:top;"><strong>What changed</strong></td>
                  <td style="color:#333; font-size:14px;">{diff_summary}</td>
                </tr>
                <tr>
                  <td style="color:#888; font-size:13px; vertical-align:top;"><strong>Deployed by</strong></td>
                  <td style="color:#333; font-size:14px;">{author}</td>
                </tr>
                <tr>
                  <td style="color:#888; font-size:13px; vertical-align:top;"><strong>Commit</strong></td>
                  <td style="color:#333; font-size:14px; font-family:monospace;">{short_sha}</td>
                </tr>
              </table>

              <p style="color:#555555; font-size:14px; line-height:1.6; margin:0;">
                Thank you for using YouCode. Stay tuned for more updates! 🎉
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8; padding:16px 32px; border-top:1px solid #eeeeee;">
              <p style="color:#aaaaaa; font-size:12px; margin:0; text-align:center;">
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

    return subject, body


def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")

    for record in event["Records"]:
        body = json.loads(record["body"])

        commit_msg   = body.get("commit_message", "New feature released")
        commit_sha   = body.get("commit_sha", "unknown")
        author       = body.get("author", "The Engineering Team")
        diff_summary = body.get("diff_summary", "Various improvements and new capabilities.")

        logger.info(f"Sending announcement for: {commit_sha} — {commit_msg}")

        subject, html_body = build_html_email(commit_msg, commit_sha, author, diff_summary)

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
