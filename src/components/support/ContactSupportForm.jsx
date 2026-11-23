import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const TOPICS = [
  { value: "account", label: "Account or sign-in" },
  { value: "shopping", label: "Shopping list or prices" },
  { value: "recipes", label: "Recipes" },
  { value: "party", label: "Party planning" },
  { value: "bug", label: "Something isn't working" },
  { value: "other", label: "Something else" },
];

export default function ContactSupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("other");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.auth
      .me()
      .then((user) => {
        if (!user) return;
        setName((prev) => prev || user.full_name || user.display_name || "");
        setEmail((prev) => prev || user.email || "");
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await base44.functions.invoke("submitSupportRequest", { name, email, topic, message });
      if (res.data?.error) throw new Error(res.data.error);
      setSent(true);
      setMessage("");
      setTopic("other");
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Could not send your message");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
        <h2 className="font-heading text-lg font-semibold text-foreground">Message sent</h2>
        <p className="text-sm text-muted-foreground">
          Thanks for reaching out. We'll reply to {email || "your email"} as soon as we can.
        </p>
        <Button variant="outline" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="support-name">Your name</Label>
          <Input
            id="support-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="support-email">Email</Label>
          <Input
            id="support-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            maxLength={120}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="support-topic">What's this about?</Label>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger id="support-topic">
            <SelectValue placeholder="Choose a topic" />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="support-message">How can we help?</Label>
        <Textarea
          id="support-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what happened, and what you expected instead."
          rows={6}
          maxLength={2000}
          required
        />
        <p className="text-xs text-muted-foreground">{message.length}/2000</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={sending} className="w-full sm:w-auto">
        {sending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" /> Send message
          </>
        )}
      </Button>
    </form>
  );
}