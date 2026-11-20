import React from "react";
import { ShieldCheck } from "lucide-react";

const toc = [
  { id: "introduction", title: "Introduction" },
  { id: "info-we-collect", title: "Information we collect" },
  { id: "how-we-use", title: "How we use your information" },
  { id: "sharing", title: "How we share information" },
  { id: "cookies", title: "Cookies and tracking" },
  { id: "choices", title: "Advertising and your choices" },
  { id: "children", title: "Children's privacy" },
  { id: "data-retention", title: "Data retention" },
  { id: "security", title: "Data security" },
  { id: "your-rights", title: "Your privacy rights" },
  { id: "state-laws", title: "State-specific disclosures" },
  { id: "third-parties", title: "Third-party websites" },
  { id: "changes", title: "Changes to this policy" },
  { id: "do-not-track", title: "Do not track" },
  { id: "contact", title: "Contact information" },
];

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
    <h2 className="font-heading text-lg sm:text-xl font-semibold text-foreground mb-3 pb-2 border-b border-border">
      {title}
    </h2>
    <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">{children}</div>
  </section>
);

const Sub = ({ children }) => (
  <h3 className="font-heading text-sm sm:text-base font-semibold text-foreground pt-1">{children}</h3>
);

const List = ({ children }) => (
  <ul className="list-disc pl-5 space-y-1.5 marker:text-green-600">{children}</ul>
);

export default function PrivacyPolicy() {
  const effectiveDate = "November 20, 2026";
  const lastUpdated = "November 20, 2026";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-8 rounded-xl border border-border bg-card p-5 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div className="min-w-0">
              <h1 className="font-heading text-2xl sm:text-4xl font-bold text-foreground leading-tight">
                Privacy Policy
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Effective {effectiveDate} · Last updated {lastUpdated}
              </p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm">
            <div>
              <dt className="text-muted-foreground">Company</dt>
              <dd className="text-foreground font-medium">Rate My Rep LLC</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Application</dt>
              <dd className="text-foreground font-medium">YumList</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Website</dt>
              <dd className="text-foreground font-medium break-all">https://yumlist.us</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Privacy contact</dt>
              <dd className="text-foreground font-medium break-all">info@ratemyrep.co</dd>
            </div>
          </dl>
        </header>

        <nav className="mb-8 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground mb-3">
            On this page
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {toc.map((item, i) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-muted-foreground hover:text-green-700 hover:underline">
                  <span className="text-green-700 font-medium mr-1.5">{i + 1}.</span>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-5">
          <Section id="introduction" title="1. Introduction">
            <p>
              Rate My Rep LLC ("we," "us," or "our") respects your privacy and is committed to protecting the
              personal information of our users and their families.
            </p>
            <p>Our application provides family-oriented grocery shopping tools that allow users to:</p>
            <List>
              <li>Create family profiles and identify individual food preferences.</li>
              <li>Like and dislike individual grocery products.</li>
              <li>Discover recipes based on family food preferences.</li>
              <li>Create grocery shopping lists.</li>
              <li>Compare grocery prices across participating retailers.</li>
              <li>Identify retailers offering competitive prices on selected products.</li>
              <li>Discover sponsored products and promotional recommendations.</li>
            </List>
            <p>
              Our application is free to users. We generate revenue through affiliate relationships with grocery
              retailers and sponsored product placements from food manufacturers, brands and other commercial
              partners.
            </p>
            <p>
              This Privacy Policy explains what information we collect, how we use it, when we share it, and the
              choices available to you. By using our application, you acknowledge that you have reviewed this
              Privacy Policy.
            </p>
          </Section>

          <Section id="info-we-collect" title="2. Information We Collect">
            <p>
              We collect information necessary to operate our application, personalize the shopping experience,
              and support our commercial relationships.
            </p>

            <Sub>A. Account Information</Sub>
            <p>Depending on how you use the application, we may collect:</p>
            <List>
              <li>Name.</li>
              <li>Email address.</li>
              <li>Account login credentials or authentication identifiers.</li>
              <li>Household or family account identifiers.</li>
              <li>Profile information.</li>
              <li>Account preferences.</li>
            </List>
            <p>
              We do not need to collect payment card information to provide our basic grocery shopping comparison
              services.
            </p>

            <Sub>B. Family Profiles and Food Preferences</Sub>
            <p>Our application allows users to create family profiles and identify individual food preferences.</p>
            <p>Information may include:</p>
            <List>
              <li>Family member profile names or nicknames.</li>
              <li>Favorite grocery products.</li>
              <li>Product likes and dislikes.</li>
              <li>Preferred food categories.</li>
              <li>Favorite ingredients.</li>
              <li>Recipe preferences.</li>
              <li>Grocery shopping preferences.</li>
              <li>Products added to shopping lists.</li>
              <li>Allergies or food sensitivities you choose to flag for your family.</li>
              <li>The age range you select for your account, used to limit advertising shown to younger users.</li>
            </List>
            <p>
              This information is used to provide personalized recipes, product recommendations, and grocery
              shopping suggestions. Family profile information is not automatically shared with food
              manufacturers, advertisers, or grocery retailers.
            </p>

            <Sub>C. Shopping and Product Activity</Sub>
            <p>We may collect information regarding your use of the application, including:</p>
            <List>
              <li>Products searched.</li>
              <li>Products viewed.</li>
              <li>Products selected.</li>
              <li>Grocery items added to shopping lists.</li>
              <li>Recipes searched or viewed.</li>
              <li>Retailers selected.</li>
              <li>Grocery price comparisons.</li>
              <li>Sponsored product interactions.</li>
              <li>Affiliate shopping link clicks.</li>
              <li>Product details looked up from a scanned barcode.</li>
            </List>
            <p>
              This information helps us operate the application, improve functionality, measure shopping
              activity, and evaluate the effectiveness of sponsored placements.
            </p>

            <Sub>D. Photos, Files and Optional Integrations</Sub>
            <p>
              If you add a recipe or pantry item from a photo, or import a list from a file, that image or file is
              processed to extract the relevant information. Uploaded files are stored privately and are not
              given a public URL. If you choose to connect Google Calendar to schedule shopping trips, we access
              your calendar through Google's APIs with your permission to create the calendar events you request,
              and you can disconnect it at any time.
            </p>

            <Sub>E. Device and Technical Information</Sub>
            <p>We may automatically collect certain technical information, including:</p>
            <List>
              <li>Device type.</li>
              <li>Operating system.</li>
              <li>Application version.</li>
              <li>IP address.</li>
              <li>Device identifiers.</li>
              <li>Usage activity.</li>
              <li>Crash reports.</li>
              <li>General location information, when authorized.</li>
            </List>
            <p>
              We use this information for application functionality, analytics, security, and performance
              improvements.
            </p>
          </Section>

          <Section id="how-we-use" title="3. How We Use Your Information">
            <Sub>A. Application Functionality</Sub>
            <List>
              <li>Create and manage user accounts.</li>
              <li>Maintain family profiles.</li>
              <li>Store food preferences.</li>
              <li>Generate personalized recipe recommendations.</li>
              <li>Build grocery shopping lists.</li>
              <li>Compare grocery prices.</li>
              <li>Recommend grocery retailers.</li>
              <li>Improve application functionality.</li>
            </List>

            <Sub>B. Personalized Recommendations</Sub>
            <p>
              We may use product preferences and shopping activity to provide relevant grocery product
              suggestions and recipe recommendations. For example, if family members indicate that they like
              certain breakfast products, our application may recommend recipes and grocery products that
              correspond with those preferences.
            </p>

            <Sub>C. Affiliate Marketing and Retailer Referrals</Sub>
            <p>
              Our application may include links to grocery retailers and third-party shopping services. When you
              select a retailer or follow a shopping link, we may receive compensation if you complete a
              qualifying purchase.
            </p>
            <p>To facilitate these relationships, we may collect or share limited information such as:</p>
            <List>
              <li>Affiliate referral identifiers.</li>
              <li>Anonymous or pseudonymous user identifiers.</li>
              <li>Product identifiers.</li>
              <li>Shopping referral information.</li>
              <li>Referral timestamps.</li>
              <li>Purchase confirmation information.</li>
              <li>Transaction amounts.</li>
              <li>Commission information.</li>
            </List>
            <p>
              Retailers and affiliate networks may use cookies, tracking technologies, or other attribution
              methods to determine whether a purchase resulted from a referral originating in our application.
              We do not require access to your retailer account password or payment card information to receive
              affiliate commissions. Affiliate relationships do not guarantee that every purchase will generate a
              commission.
            </p>

            <Sub>D. Sponsored Product Placements</Sub>
            <p>
              We may display sponsored products, sponsored recipes, featured brands, or other promotional content
              within our application. Food manufacturers, consumer product companies, and other commercial
              partners may compensate us for these placements.
            </p>
            <p>
              We may use general product categories, shopping interests, and application activity to determine
              which sponsored products are relevant to users. For example, a user searching for breakfast recipes
              may see a sponsored cereal product.
            </p>
            <p>
              Sponsored content will be identified as advertising, sponsored content, or another appropriate
              disclosure. Our commercial relationships do not guarantee that a sponsored product represents the
              lowest-priced product available. We will maintain a distinction between paid product placements and
              objective grocery price comparisons.
            </p>

            <Sub>E. Business Operations and Analytics</Sub>
            <p>We may use aggregated application activity to:</p>
            <List>
              <li>Measure application engagement.</li>
              <li>Evaluate product popularity.</li>
              <li>Measure advertising performance.</li>
              <li>Understand shopping trends.</li>
              <li>Improve recommendations.</li>
              <li>Evaluate affiliate partnerships.</li>
              <li>Improve our services.</li>
            </List>
          </Section>

          <Section id="sharing" title="4. How We Share Information">
            <p>
              We do not disclose personal information indiscriminately. We may share limited information with the
              following categories of third parties when necessary for the purposes described in this Privacy
              Policy.
            </p>

            <Sub>A. Grocery Retailers</Sub>
            <p>
              When you select a retailer or follow an outbound shopping link, certain information may be shared
              with that retailer to facilitate shopping, referral attribution, or purchase tracking. The
              retailer's own privacy policy governs its collection and use of information once you leave our
              application.
            </p>

            <Sub>B. Affiliate Networks</Sub>
            <p>
              We may work with affiliate networks and referral tracking providers that help us measure purchases
              resulting from links in our application. These providers may receive limited referral information,
              including tracking identifiers, product information, transaction information, and purchase
              confirmation data.
            </p>

            <Sub>C. Food Manufacturers and Advertising Partners</Sub>
            <p>
              We may work with food manufacturers, grocery brands, and advertising partners that pay to promote
              products within our application. These partners may receive campaign performance information,
              including:
            </p>
            <List>
              <li>Sponsored product impressions.</li>
              <li>Product clicks.</li>
              <li>Advertising engagement.</li>
              <li>Aggregated product category activity.</li>
              <li>Aggregated campaign performance.</li>
            </List>
            <p>
              We do not provide advertisers with identifiable family profiles or individual family member food
              preference histories for their independent advertising purposes.
            </p>

            <Sub>D. Technology and Service Providers</Sub>
            <p>We may share information with service providers that assist with:</p>
            <List>
              <li>Application hosting.</li>
              <li>Database management.</li>
              <li>Authentication.</li>
              <li>Analytics.</li>
              <li>Application performance.</li>
              <li>Affiliate tracking.</li>
              <li>Advertising delivery.</li>
              <li>Customer support.</li>
              <li>Security.</li>
            </List>
            <p>
              These providers are authorized to use information only as permitted by their contractual
              obligations and applicable law.
            </p>

            <Sub>E. Legal and Business Requirements</Sub>
            <p>We may disclose information when reasonably necessary to:</p>
            <List>
              <li>Comply with applicable laws.</li>
              <li>Respond to valid legal requests.</li>
              <li>Protect our users and application.</li>
              <li>Prevent fraud or security incidents.</li>
              <li>Enforce our agreements.</li>
              <li>Complete a merger, acquisition, or business transfer, subject to applicable privacy requirements.</li>
            </List>
          </Section>

          <Section id="cookies" title="5. Cookies, Tracking and Advertising Technologies">
            <p>
              Our application and participating third-party providers may use cookies, software development kits
              (SDKs), pixels, device identifiers, and similar technologies.
            </p>
            <p>These technologies may be used to:</p>
            <List>
              <li>Maintain account functionality.</li>
              <li>Understand application usage.</li>
              <li>Measure advertising performance.</li>
              <li>Track affiliate referrals.</li>
              <li>Attribute qualifying purchases.</li>
              <li>Improve sponsored product placements.</li>
            </List>
            <p>
              Some third-party tracking technologies may collect information across different websites or
              services. Where required by applicable law, we will obtain appropriate consent or provide mechanisms
              to opt out of targeted advertising and regulated data sharing. Users may also be able to control
              certain tracking technologies through device and browser settings.
            </p>
          </Section>

          <Section id="choices" title="6. Advertising and User Choices">
            <p>
              Our application may display sponsored products and personalized promotional recommendations. Users
              may have choices regarding the use of their information for advertising and promotional purposes.
            </p>
            <p>Where applicable, users may:</p>
            <List>
              <li>Opt out of targeted advertising.</li>
              <li>Opt out of the sale or sharing of personal information.</li>
              <li>Adjust available advertising preferences.</li>
              <li>Disable optional advertising personalization.</li>
              <li>Exercise applicable privacy rights.</li>
            </List>
            <p>
              Disabling personalized advertising does not necessarily eliminate sponsored content. Users may
              continue to see general or contextual advertisements. We do not condition access to basic grocery
              shopping functionality on agreeing to optional targeted advertising.
            </p>
          </Section>

          <Section id="children" title="7. Children's Privacy and Family Profiles">
            <p>
              Our application is designed to support family grocery shopping and may allow parents or authorized
              household administrators to create profiles for family members. We recognize the importance of
              protecting children's information.
            </p>
            <p>
              Parents and guardians are responsible for managing family profiles and determining what information
              is appropriate to provide.
            </p>
            <p>
              Where applicable, we comply with the Children's Online Privacy Protection Act (COPPA) and other
              relevant children's privacy laws. If our application collects personal information from children
              under 13 in circumstances covered by COPPA, we will obtain verifiable parental consent before
              collecting, using, or disclosing that information as required by law.
            </p>
            <p>
              We will not knowingly use children's individual food preferences, shopping behavior, or family
              profile information to create targeted advertising profiles. We will not knowingly sell children's
              personal information.
            </p>
            <p>Parents or guardians may contact us to:</p>
            <List>
              <li>Review information associated with a child's profile.</li>
              <li>Request correction of information.</li>
              <li>Request deletion of a child's profile and associated personal information.</li>
              <li>Withdraw consent where applicable.</li>
            </List>
            <p>We may take reasonable steps to verify parental authority before processing these requests.</p>
          </Section>

          <Section id="data-retention" title="8. Data Retention">
            <p>We retain personal information only for as long as reasonably necessary to:</p>
            <List>
              <li>Provide application services.</li>
              <li>Maintain family profiles.</li>
              <li>Process affiliate referrals.</li>
              <li>Measure sponsored advertising campaigns.</li>
              <li>Maintain business records.</li>
              <li>Resolve disputes.</li>
              <li>Comply with legal obligations.</li>
            </List>
            <p>
              When information is no longer needed, we will delete, deidentify, or securely dispose of it in
              accordance with applicable requirements. Certain transaction, referral, or business records may be
              retained for legitimate accounting, contractual, or legal purposes. You can delete your account at
              any time from the application's settings.
            </p>
          </Section>

          <Section id="security" title="9. Data Security">
            <p>
              We use reasonable administrative, technical, and organizational safeguards designed to protect
              personal information against unauthorized access, disclosure, alteration, and destruction.
            </p>
            <p>These safeguards may include:</p>
            <List>
              <li>Access controls.</li>
              <li>Authentication protections.</li>
              <li>Encryption where appropriate.</li>
              <li>Secure data storage.</li>
              <li>Vendor security requirements.</li>
              <li>Monitoring and incident response procedures.</li>
            </List>
            <p>No electronic transmission or storage system can be guaranteed to be completely secure.</p>
          </Section>

          <Section id="your-rights" title="10. Your Privacy Rights">
            <p>Depending on your state of residence and applicable law, you may have rights to:</p>
            <List>
              <li>Confirm whether we process your personal information.</li>
              <li>Access personal information.</li>
              <li>Obtain a copy of personal information.</li>
              <li>Correct inaccurate personal information.</li>
              <li>Request deletion of personal information.</li>
              <li>Opt out of targeted advertising.</li>
              <li>Opt out of the sale or sharing of personal information.</li>
              <li>Appeal certain privacy-related decisions.</li>
              <li>Withdraw consent where processing is based on consent.</li>
            </List>
            <p>
              To exercise applicable rights, contact us using the information provided in Section 15. We may take
              reasonable steps to verify your identity before processing certain requests. We will not unlawfully
              discriminate against users for exercising their privacy rights.
            </p>
          </Section>

          <Section id="state-laws" title="11. State-Specific Privacy Disclosures">
            <p>
              Residents of certain U.S. states may have additional privacy rights under applicable state privacy
              laws. These rights may include access, correction, deletion, portability, and the ability to opt out
              of certain types of personal information processing.
            </p>
            <p>
              Where required by law, we will provide additional disclosures, consent mechanisms, and opt-out
              tools. We will honor applicable Global Privacy Control signals and other legally recognized
              universal opt-out mechanisms where required.
            </p>
          </Section>

          <Section id="third-parties" title="12. Third-Party Websites and Services">
            <p>
              Our application may contain links to external grocery retailers, affiliate networks, and other
              third-party websites. Once you leave our application, the privacy practices of those third parties
              are governed by their respective privacy policies and terms.
            </p>
            <p>
              We are not responsible for the privacy practices, security practices, or content of third-party
              websites. We encourage users to review the privacy policies of retailers and other services before
              completing purchases or providing personal information.
            </p>
          </Section>

          <Section id="changes" title="13. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our application, business
              practices, commercial relationships, or applicable laws. When material changes occur, we will
              provide notice as required by applicable law.
            </p>
            <p>
              The updated Privacy Policy will include a revised effective date. Continued use of our application
              following an update does not replace any consent that applicable law requires us to obtain.
            </p>
          </Section>

          <Section id="do-not-track" title="14. Do Not Track and Advertising Preferences">
            <p>
              Some browsers and devices provide privacy signals or settings that communicate user preferences
              regarding tracking. We will recognize legally required privacy signals, including applicable Global
              Privacy Control signals. Users may also manage available advertising and privacy preferences through
              our application settings.
            </p>
          </Section>

          <Section id="contact" title="15. Contact Information">
            <p>
              If you have questions about this Privacy Policy, wish to exercise your privacy rights, or have
              concerns regarding the handling of your personal information, please contact us.
            </p>
            <div className="rounded-lg bg-muted/60 p-4 space-y-1.5 text-sm">
              <p>
                <strong className="text-foreground">Company:</strong> Rate My Rep LLC
              </p>
              <p>
                <strong className="text-foreground">Application:</strong> YumList
              </p>
              <p>
                <strong className="text-foreground">Privacy email:</strong>{" "}
                <a href="mailto:info@ratemyrep.co" className="text-green-700 hover:underline">
                  info@ratemyrep.co
                </a>
              </p>
              <p className="break-all">
                <strong className="text-foreground">Website:</strong>{" "}
                <a href="https://yumlist.us/privacy-policy" className="text-green-700 hover:underline">
                  https://yumlist.us/privacy-policy
                </a>
              </p>
              <p>
                <strong className="text-foreground">Mailing address:</strong> 2506 Ralph St, Houston, TX 77006
              </p>
            </div>
          </Section>
        </div>

        <footer className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground text-center">
          <p>YumList — Less Guessing. More Yum!</p>
        </footer>
      </div>
    </div>
  );
}