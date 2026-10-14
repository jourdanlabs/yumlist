import React from "react";

export default function PrivacyPolicy() {
  const lastUpdated = "September 30, 2026";

  const Section = ({ id, title, children }) => (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-10 border-b border-border pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </header>

        <div className="space-y-10">
          <p className="text-muted-foreground leading-relaxed">
            YumList ("we," "us," or "our") operates the YumList mobile application
            and web service (the "App"). This Privacy Policy describes how we collect, use,
            disclose, and safeguard your information when you use the App. By using the App, you
            agree to the practices described in this policy.
          </p>

          <Section id="info-we-collect" title="1. Information We Collect">
            <p><strong className="text-foreground">Account information:</strong> When you register, we collect your email address and a password (stored in hashed form). You may optionally provide a display name.</p>
            <p><strong className="text-foreground">Family and household data:</strong> The App is organized around family units. You may create or join a family, and we associate your account with that family. We store a family name and an invite code that lets other members join.</p>
            <p><strong className="text-foreground">Pantry and shopping data:</strong> You and your family members add grocery items, quantities, expiration dates, categories, and shopping-list entries. Items may be added manually, by scanning a product barcode, or by importing a list. When you scan a barcode, we look up product details (name, brand, image) from a public product database to pre-fill the entry.</p>
            <p><strong className="text-foreground">Recipes and reactions:</strong> We store recipes you add or import, recipe suggestions, and likes/dislikes ("reactions") that family members record on items and recipes.</p>
            <p><strong className="text-foreground">Consumption and usage data:</strong> We log when items are consumed or removed so the App can show usage trends. We also collect standard analytics events (such as screens viewed and actions taken) to help us improve the App.</p>
            <p><strong className="text-foreground">Photos and files you upload:</strong> If you add a recipe or pantry item from a photo, or import a list from a file, that image or file is processed to extract the relevant information. Uploaded files are stored privately and are not given a public URL.</p>
            <p><strong className="text-foreground">Calendar integration (optional):</strong> If you choose to connect Google Calendar to schedule shopping trips, we access your calendar through Google's APIs with your permission to create calendar events for your trips. You can disconnect this at any time.</p>
            <p><strong className="text-foreground">Device and technical data:</strong> We collect limited technical information such as app version, device type, and approximate timestamps to operate and secure the service.</p>
          </Section>

          <Section id="how-we-use" title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide the pantry, shopping-list, recipe, and family-sharing features of the App.</li>
              <li>Recognize products from barcodes and pre-fill item details.</li>
              <li>Let family members collaborate on shared grocery and recipe data.</li>
              <li>Send optional notifications, such as expiration reminders and "at the store" alerts, when you enable them.</li>
              <li>Create calendar events when you connect and schedule shopping trips.</li>
              <li>Diagnose errors, prevent abuse, and improve the App's features and performance.</li>
            </ul>
          </Section>

          <Section id="legal-bases" title="3. Legal Bases for Processing (GDPR)">
            <p>For users in the European Economic Area, the United Kingdom, and Switzerland, we process personal data on the following legal bases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Performance of a contract:</strong> to operate the App features you requested.</li>
              <li><strong className="text-foreground">Consent:</strong> for optional analytics, notifications, and calendar integration you turn on.</li>
              <li><strong className="text-foreground">Legitimate interests:</strong> to secure the service and prevent misuse.</li>
              <li><strong className="text-foreground">Legal obligation:</strong> where we are required to retain or disclose data.</li>
            </ul>
          </Section>

          <Section id="sharing" title="4. How We Share Your Information">
            <p><strong className="text-foreground">Within your family:</strong> Grocery items, recipes, reactions, and shopping lists you add are visible to the other members of your family. If you connect with another family through the sharing feature, the content you choose to share becomes visible to that family's members.</p>
            <p><strong className="text-foreground">Service providers:</strong> We use third-party services to operate the App, including cloud hosting, authentication, product lookups, and analytics. These providers process data only as needed to deliver their services and under appropriate confidentiality obligations.</p>
            <p><strong className="text-foreground">With your permission:</strong> When you connect Google Calendar, we exchange data with Google only as necessary to create the calendar events you request.</p>
            <p><strong className="text-foreground">Legal compliance:</strong> We may disclose information when required by law, court order, or to protect the rights, property, or safety of our users or others.</p>
            <p>We do <strong className="text-foreground">not</strong> sell your personal information to third parties.</p>
          </Section>

          <Section id="data-retention" title="5. Data Retention">
            <p>We keep your data for as long as your account is active. When you delete your account through the App's settings, we remove your account and personal information, and your family content is removed or reassigned according to the App's family-membership rules. We may retain limited data for security, legal, or audit purposes where required.</p>
          </Section>

          <Section id="your-rights" title="6. Your Privacy Rights">
            <p>Depending on where you live, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate or incomplete data.</li>
              <li>Request deletion of your data or your account.</li>
              <li>Withdraw consent for optional processing (such as analytics or calendar integration) at any time.</li>
              <li>Object to or restrict certain processing.</li>
              <li>Request a portable copy of your data.</li>
            </ul>
            <p>You can delete your account directly in the App's settings. To exercise other rights, contact us using the details in Section 10. We will respond within the timeframe required by applicable law.</p>
            <p className="text-sm">California residents: We do not sell personal information as defined under the CCPA/CPRA, and you have the right to know, delete, and correct your personal information.</p>
          </Section>

          <Section id="children" title="7. Children's Privacy">
            <p>The App is not directed to children under 13 (or the equivalent minimum age in your jurisdiction), and we do not knowingly collect personal information from them. If you believe a child has provided us with personal information, please contact us so we can delete it.</p>
          </Section>

          <Section id="security" title="8. Security">
            <p>We use reasonable administrative, technical, and physical safeguards to protect your information, including encryption in transit and at rest, access controls, and family-level data isolation that prevents one family from accessing another family's data. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
          </Section>

          <Section id="international" title="9. International Data Transfers">
            <p>Your information may be processed and stored in countries other than your own, including the United States. Where required, we use appropriate safeguards such as standard contractual clauses to ensure a level of protection consistent with applicable law.</p>
          </Section>

          <Section id="contact" title="10. Contact Us">
            <p>If you have questions about this Privacy Policy or your personal data, you can contact us through the support options provided in the App or by the email associated with your account. We will address your request in accordance with applicable privacy law.</p>
          </Section>

          <Section id="changes" title="11. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will post the revised policy in the App and update the "Last updated" date above. Material changes will be highlighted where practical. Continued use of the App after changes take effect constitutes acceptance of the updated policy.</p>
          </Section>
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          <p>YumList — Less Guessing. More Yum!</p>
        </footer>
      </div>
    </div>
  );
}