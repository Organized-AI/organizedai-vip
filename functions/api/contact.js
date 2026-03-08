const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const webhookUrl = context.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return Response.json(
      { error: 'Slack webhook not configured' },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { name, email, company, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json(
      { error: 'Name, email, and message are required' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const slackPayload = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'New Contact — organizedai.vip' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${name.trim()}` },
          { type: 'mrkdwn', text: `*Email:*\n${email.trim()}` },
          { type: 'mrkdwn', text: `*Company:*\n${(company || '—').trim()}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Message:*\n> ${message.trim().replace(/\n/g, '\n> ')}` },
      },
    ],
  };

  try {
    const slackRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });

    if (!slackRes.ok) {
      return Response.json(
        { error: 'Failed to send to Slack' },
        { status: 502, headers: CORS_HEADERS }
      );
    }
  } catch {
    return Response.json(
      { error: 'Slack request failed' },
      { status: 502, headers: CORS_HEADERS }
    );
  }

  return Response.json({ success: true }, { status: 200, headers: CORS_HEADERS });
}
