import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/* ─────────────────────────── Content ───────────────────────────
   Both documents are general-purpose templates written for 6POINT
   Designs LLC. They intentionally avoid jurisdiction-specific
   guarantees — replace or extend with attorney-reviewed copy before
   launch if you need anything stricter than a freelance studio default.
   ──────────────────────────────────────────────────────────────── */

const LAST_UPDATED = 'April 18, 2026';

const TERMS_SECTIONS = [
  {
    h: '1. Agreement to terms',
    body: [
      'By accessing or using 6pointdesigns.com (the "Site") or engaging 6POINT Designs LLC ("6POINT", "we", "us") for any service, you agree to these Terms & Conditions. If you do not agree, please do not use the Site or our services.',
    ],
  },
  {
    h: '2. Services',
    body: [
      'We provide brand identity, web design and development, growth strategy, and social media services. Specific deliverables, timelines, and fees are defined in a separate written proposal or statement of work ("SOW") signed between you and 6POINT. The SOW controls in the event of any conflict with these Terms.',
    ],
  },
  {
    h: '3. Payment',
    body: [
      'Unless stated otherwise in your SOW, projects require a non-refundable deposit (typically 50%) before work begins, with the remaining balance due on delivery or per the milestone schedule. Invoices are due net 7. Late balances accrue 1.5% interest per month and may pause active work.',
    ],
  },
  {
    h: '4. Revisions and approvals',
    body: [
      'Each project includes a defined number of revision rounds at each stage. Additional rounds, scope changes, or new deliverables may be billed separately at our then-current rate. Written approval at any milestone is treated as your sign-off to proceed.',
    ],
  },
  {
    h: '5. Intellectual property',
    body: [
      'Upon full payment, you receive ownership of the final deliverables produced under the SOW for the purposes described in that SOW. 6POINT retains ownership of all preliminary concepts, source files, working files, and underlying methodologies, and may showcase the work in our portfolio and case studies unless agreed otherwise in writing.',
      'Third-party assets (fonts, stock imagery, plugins, etc.) are licensed to you under their respective terms, and you are responsible for maintaining valid licenses going forward.',
    ],
  },
  {
    h: '6. Client responsibilities',
    body: [
      'You agree to provide accurate information, timely feedback, and any required content (copy, images, brand assets) needed to complete the project. Delays caused by missing materials may extend timelines and, in some cases, incur additional fees.',
    ],
  },
  {
    h: '7. Cancellation',
    body: [
      'Either party may terminate a project for material breach with 14 days written notice. If you cancel mid-project, you remain responsible for all work completed up to the termination date and any non-refundable third-party costs we have incurred on your behalf.',
    ],
  },
  {
    h: '8. Warranties and disclaimers',
    body: [
      'We deliver work in good faith and to a professional standard, but the Site and our services are provided "as is" without warranties of any kind, whether express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.',
    ],
  },
  {
    h: '9. Limitation of liability',
    body: [
      'To the maximum extent permitted by law, 6POINT\u2019s total liability for any claim arising out of or relating to the Site or our services is limited to the amount you paid us under the relevant SOW in the 6 months preceding the claim. We are not liable for indirect, incidental, consequential, special, or punitive damages.',
    ],
  },
  {
    h: '10. Confidentiality',
    body: [
      'Both parties will treat non-public information shared during the project as confidential and will not disclose it to third parties except as required to perform the work or by law.',
    ],
  },
  {
    h: '11. Governing law',
    body: [
      'These Terms are governed by the laws of the State of South Carolina, USA, without regard to conflict-of-law principles. Any dispute will be resolved in the state or federal courts located in South Carolina.',
    ],
  },
  {
    h: '12. Changes to these terms',
    body: [
      'We may update these Terms from time to time. The "Last updated" date above reflects the most recent revision. Continued use of the Site after changes are posted constitutes acceptance of the revised Terms.',
    ],
  },
  {
    h: '13. Contact',
    body: [
      'Questions? Reach us at hello@6pointdesigns.com or (803) 669-5425.',
    ],
  },
];

const PRIVACY_SECTIONS = [
  {
    h: '1. Who we are',
    body: [
      '6POINT Designs LLC ("6POINT", "we", "us") operates 6pointdesigns.com (the "Site") and provides design and development services to clients. This Privacy Policy explains what information we collect, how we use it, and the choices you have.',
    ],
  },
  {
    h: '2. Information we collect',
    body: [
      'Information you provide: when you contact us, book a call, or become a client, we collect details you submit such as your name, email, phone number, company, project information, and any messages you send.',
      'Automatically collected: when you visit the Site we may collect basic technical data such as IP address, browser type, device type, referring URL, pages viewed, and timestamps. This is typically collected through cookies or similar technologies (see Section 6).',
    ],
  },
  {
    h: '3. How we use your information',
    body: [
      'We use your information to respond to inquiries, prepare proposals, deliver and manage projects, send invoices, improve the Site, prevent fraud or abuse, and comply with legal obligations. We do not sell your personal information.',
    ],
  },
  {
    h: '4. Email and outreach',
    body: [
      'If you contact us or are listed as a contact for a prospective project, we may email you about your inquiry, follow up on proposals, or share occasional updates relevant to your account. Every marketing email includes an unsubscribe link \u2014 transactional or project emails (e.g. invoices) will continue regardless.',
    ],
  },
  {
    h: '5. Sharing with third parties',
    body: [
      'We share information only with trusted vendors who help us run our business \u2014 for example, hosting providers, email delivery services (such as Resend), analytics tools, and payment processors. These vendors are contractually limited to using your information to perform services for us. We may also disclose information when required by law or to protect our rights.',
    ],
  },
  {
    h: '6. Cookies and analytics',
    body: [
      'The Site may use cookies and similar technologies to remember preferences, measure traffic, and improve performance. You can disable cookies in your browser settings; some Site features may not work as well without them.',
    ],
  },
  {
    h: '7. Data retention',
    body: [
      'We retain personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce agreements. When information is no longer needed, we delete or anonymize it.',
    ],
  },
  {
    h: '8. Security',
    body: [
      'We use reasonable technical and organizational safeguards to protect your information. No method of transmission or storage is 100% secure, however, and we cannot guarantee absolute security.',
    ],
  },
  {
    h: '9. Your choices and rights',
    body: [
      'Depending on your location, you may have rights to access, correct, delete, or restrict use of your personal information, or to object to certain processing. To exercise any of these rights, email us at hello@6pointdesigns.com and we will respond within a reasonable time.',
    ],
  },
  {
    h: '10. Children\u2019s privacy',
    body: [
      'The Site is not directed to children under 13 and we do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us so we can delete it.',
    ],
  },
  {
    h: '11. International users',
    body: [
      '6POINT is based in the United States. If you access the Site from outside the U.S., your information may be transferred to, stored, and processed in the U.S. or other countries where we or our service providers operate.',
    ],
  },
  {
    h: '12. Changes to this policy',
    body: [
      'We may update this Privacy Policy from time to time. Material changes will be reflected in the "Last updated" date above and, where appropriate, communicated through the Site or by email.',
    ],
  },
  {
    h: '13. Contact',
    body: [
      'Questions or requests about this policy? Email hello@6pointdesigns.com or call (803) 669-5425.',
    ],
  },
];

const CONTENT = {
  terms: {
    eyebrow: 'Legal',
    title: 'Terms &',
    italic: 'conditions.',
    intro:
      'The fine print that governs how you and 6POINT Designs LLC work together \u2014 written in plain English so it actually reads like one human talking to another.',
    sections: TERMS_SECTIONS,
  },
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy',
    italic: 'policy.',
    intro:
      'How we collect, use, and protect the information you share with 6POINT Designs LLC \u2014 because trust is non-negotiable.',
    sections: PRIVACY_SECTIONS,
  },
};

/* ───────────────────────── Component ───────────────────────── */

const Section = ({ index, h, body }) => (
  <motion.section
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-10%' }}
    transition={{ duration: 0.55, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    style={{
      paddingTop: 32,
      paddingBottom: 32,
      borderTop: index === 0 ? 'none' : '1px solid var(--line)',
    }}
  >
    <h2
      style={{
        margin: '0 0 14px',
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: 'clamp(18px, 1.6vw, 22px)',
        letterSpacing: '-0.005em',
        color: 'var(--ink)',
      }}
    >
      {h}
    </h2>
    {body.map((p, i) => (
      <p
        key={i}
        style={{
          margin: i === 0 ? 0 : '12px 0 0',
          fontSize: 'clamp(15px, 1.05vw, 16.5px)',
          lineHeight: 1.7,
          color: 'var(--ink-2)',
        }}
      >
        {p}
      </p>
    ))}
  </motion.section>
);

export const LegalPage = ({ kind = 'terms' }) => {
  const data = CONTENT[kind] || CONTENT.terms;

  /* Scroll to top whenever the page mounts so deep-links from the footer
     always start at the headline rather than mid-document. */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [kind]);

  const goHome = (e) => {
    e.preventDefault();
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="App">
      <Navbar />

      <main>
        {/* ───────── Hero ───────── */}
        <section
          style={{
            position: 'relative',
            background: 'var(--bg)',
            color: 'var(--ink)',
            paddingTop: 'calc(var(--nav-h) + 72px)',
            paddingBottom: 'clamp(40px, 6vw, 80px)',
            overflow: 'hidden',
            isolation: 'isolate',
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: -1,
              background:
                'radial-gradient(800px 460px at 90% -10%, rgba(116,142,117,0.07), transparent 60%),' +
                'radial-gradient(700px 400px at -10% 110%, rgba(217,178,106,0.05), transparent 60%)',
            }}
          />

          <div className="container" style={{ maxWidth: 880 }}>
            <motion.a
              href="#top"
              onClick={goHome}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ x: -3 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: 'var(--ink-3)',
                marginBottom: 24,
              }}
            >
              <ArrowLeft size={14} />
              Back to home
            </motion.a>

            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginBottom: 18 }}
            >
              {data.eyebrow} · Last updated {LAST_UPDATED}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'clamp(44px, 6.4vw, 84px)',
                lineHeight: 1.02,
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
              }}
            >
              {data.title}{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--brand)' }}>
                {data.italic}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                marginTop: 22,
                maxWidth: 640,
                fontSize: 'clamp(16px, 1.2vw, 18px)',
                lineHeight: 1.55,
                color: 'var(--ink-3)',
              }}
            >
              {data.intro}
            </motion.p>
          </div>
        </section>

        {/* ───────── Body ───────── */}
        <section
          style={{
            background: 'var(--bg)',
            paddingBottom: 'clamp(80px, 10vw, 140px)',
          }}
        >
          <div
            className="container"
            style={{
              maxWidth: 880,
              background: 'var(--bg-elev)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(28px, 4vw, 56px)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {data.sections.map((s, i) => (
              <Section key={s.h} index={i} h={s.h} body={s.body} />
            ))}

            {/* Cross-link to the other doc */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                marginTop: 40,
                paddingTop: 24,
                borderTop: '1px solid var(--line)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 14,
                color: 'var(--ink-3)',
              }}
            >
              <span>
                Looking for{' '}
                <a
                  href={kind === 'terms' ? '#privacy' : '#terms'}
                  style={{
                    color: 'var(--ink)',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                    fontWeight: 600,
                  }}
                >
                  {kind === 'terms' ? 'our Privacy Policy' : 'our Terms & Conditions'}
                </a>
                ? It lives one click away.
              </span>
              <a
                href="mailto:hello@6pointdesigns.com"
                style={{
                  color: 'var(--ink)',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  fontWeight: 600,
                }}
              >
                hello@6pointdesigns.com
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
