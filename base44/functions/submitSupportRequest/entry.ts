import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const TOPICS = ['account', 'shopping', 'recipes', 'party', 'bug', 'other'];
const SUPPORT_INBOX = 'info@ratemyrep.co';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    const body = await req.json().catch(() => ({}));

    const name = String(body.name || '').trim().slice(0, 80);
    const email = String(body.email || '').trim().slice(0, 120);
    const topic = TOPICS.includes(String(body.topic || '')) ? String(body.topic) : 'other';
    const message = String(body.message || '').trim().slice(0, 2000);

    if (!name) return Response.json({ error: 'Please enter your name' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return Response.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }
    if (message.length < 5) {
      return Response.json({ error: 'Please add a few details about your question' }, { status: 400 });
    }

    await base44.asServiceRole.entities.SupportRequest.create({
      name,
      email,
      topic,
      message,
      status: 'new',
      user_id: user ? user.id : '',
    });

    // Best-effort notification to the support inbox; the request is saved either way.
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: SUPPORT_INBOX,
        subject: `YumList support request: ${topic}`,
        body: [
          'New support request submitted from the YumList app.',
          '',
          `Name: ${name}`,
          `Email: ${email}`,
          `Topic: ${topic}`,
          `Signed-in user: ${user ? user.email : 'not signed in'}`,
          '',
          'Message:',
          message,
        ].join('\n'),
        category: 'transactional',
      });
    } catch (mailError) {
      console.log('Support notification email failed:', mailError.message);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}