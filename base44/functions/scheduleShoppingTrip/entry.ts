import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const CONNECTOR_ID = "6ab299dec4bfe525f1bb5806";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const start = body?.start;
    const durationMinutes = Number(body?.duration_minutes) || 60;
    const itemCount = Number(body?.item_count) || 0;

    if (!start || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(start)) {
      return Response.json({ error: 'A valid start datetime is required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);

    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) {
      return Response.json({ error: 'Invalid start datetime' }, { status: 400 });
    }
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const summary = "Family Pantry Shopping Trip";
    const description = itemCount > 0
      ? `Shopping trip scheduled from Family Pantry. ${itemCount} item${itemCount > 1 ? "s" : ""} on the list.`
      : "Shopping trip scheduled from Family Pantry.";

    const event = {
      summary,
      description,
      start: { dateTime: startDate.toISOString(), timeZone: body?.timezone || "Etc/UTC" },
      end: { dateTime: endDate.toISOString(), timeZone: body?.timezone || "Etc/UTC" },
      reminders: { useDefault: true },
    };

    const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: `Google Calendar error: ${errText}` }, { status: 502 });
    }

    const created = await res.json();
    return Response.json({ event_id: created.id, html_link: created.htmlLink });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}