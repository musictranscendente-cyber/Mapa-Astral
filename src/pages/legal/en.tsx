import { Section } from './common'
import { CONTACT_EMAIL } from './contact'

const email = <b>{CONTACT_EMAIL}</b>

export function TermsEn() {
  return (
    <>
      <p>Welcome to <b>Cosmic Sky</b>. By using the app you agree to these Terms. If you do not agree, please do not use the service.</p>
      <Section title="1. What Cosmic Sky is">
        <p>
          Cosmic Sky calculates birth charts, the daily sky, forecasts, synastry and solar returns from astronomical ephemerides, and
          presents astrological interpretations for self-knowledge and entertainment.
        </p>
        <p>
          <b>Astrology is not an exact science.</b> Interpretations are symbolic and reflective and <b>do not replace</b> medical,
          psychological, legal, financial or any other professional advice. Decisions made based on the app are your sole responsibility.
        </p>
      </Section>
      <Section title="2. Full analyses">
        <p>
          Full analyses are personalized texts generated automatically by a third-party writing system from the calculated positions of
          your chart. They may contain inaccuracies and should be read as reflection, not as absolute truth.
        </p>
      </Section>
      <Section title="3. Account">
        <ul>
          <li>You can use part of the app without an account. To save charts in the cloud and buy services, you need to sign in with Google or e-mail.</li>
          <li>You are responsible for the birth data you enter and for having permission to add other people's data.</li>
          <li>The app is intended for people aged 18 or over, or minors with parental consent.</li>
          <li>You can delete your account at any time in <b>My account → Delete account</b>.</li>
        </ul>
      </Section>
      <Section title="4. Plans and single purchases">
        <ul>
          <li>Payments outside Brazil are processed by <b>Stripe</b> (card, in US dollars); in Brazil, by <b>Mercado Pago</b> (in reais). Cosmic Sky never receives or stores card details.</li>
          <li>Plans <b>do not renew automatically</b>: they last for the period purchased (1 month or 1 year). Buying the same plan again adds to the remaining time; switching plans starts a new period.</li>
          <li>Single services are unlocked for the chosen chart. Forecasts last for the period purchased (30 days, 3 months or 12 months); the Birthday Bundle and the Lunar Return last 1 year. Each single purchase includes one generation of that service's full analysis; new versions require a new purchase or a plan.</li>
          <li>Plan analyses form a single monthly allowance for all services, which resets on the 1st of each month and does not roll over.</li>
          <li>
            <b>Refunds:</b> you may request a refund within 7 days of purchase by writing to {email}. Purchases already used (analyses
            generated) may be refunded proportionally.
          </li>
          <li>Prices and conditions may change; past purchases keep the conditions in force on the purchase date.</li>
        </ul>
      </Section>
      <Section title="5. Acceptable use">
        <p>
          You may not use the app for unlawful purposes, try to bypass access limits or payments, copy the content at scale or harm the
          service. Accounts that breach these Terms may be suspended.
        </p>
      </Section>
      <Section title="6. Intellectual property">
        <p>
          The texts, interpretations, design, brand and code of Cosmic Sky belong to their owners. You may share images and texts of
          your own chart for personal use.
        </p>
      </Section>
      <Section title="7. Availability and liability">
        <p>
          We work to keep the app available and accurate, but it is provided "as is" and may have interruptions, changes or errors. To
          the extent permitted by law, we are not liable for indirect damages arising from the use of the interpretations.
        </p>
      </Section>
      <Section title="8. Contact">
        <p>Questions, support and refund requests: {email}.</p>
      </Section>
      <Section title="9. Changes and governing law">
        <p>
          These Terms may be updated; the date above shows the version in force. They are governed by the laws of Brazil, without
          prejudice to the mandatory consumer rights of your country of residence.
        </p>
      </Section>
    </>
  )
}

export function PrivacyEn() {
  return (
    <>
      <p>This Policy explains what data <b>Cosmic Sky</b> uses, why, and what your rights are.</p>
      <Section title="1. Data we use">
        <ul>
          <li><b>Birth data</b> (name, date, time and place) you enter to calculate charts — yours and those of other people you add.</li>
          <li><b>Account data</b>: e-mail and, if you sign in with Google, your profile name and photo.</li>
          <li><b>Purchases</b>: product, amount, date and payment status. Payment details stay with Stripe or Mercado Pago.</li>
          <li><b>Analysis usage</b>: how many full analyses were generated, to manage your allowance.</li>
          <li><b>Anonymous visit counts</b>: a random device code, with no name, e-mail or IP address, to know how many people use the app and where they come from (e.g. a shared link).</li>
          <li><b>Location</b>: only when you tap "Where I am". We do not keep a location history.</li>
        </ul>
      </Section>
      <Section title="2. What we use it for">
        <ul>
          <li>Calculating and showing your charts, forecasts and reports.</li>
          <li>Syncing your charts across devices when you sign in.</li>
          <li>Processing purchases and unlocking paid access.</li>
          <li>Generating full analyses, sending only the calculated chart positions and the name entered.</li>
          <li>Improving the app with anonymous usage statistics.</li>
        </ul>
        <p>We do not sell your data and do not use it for advertising.</p>
      </Section>
      <Section title="3. Where it is stored and who we share it with">
        <ul>
          <li><b>On your device</b>: charts, preferences and analyses already generated are saved in the browser.</li>
          <li><b>Supabase</b>: hosting for sign-in, synced charts, purchases and statistics.</li>
          <li><b>Stripe</b> and <b>Mercado Pago</b>: payment processing.</li>
          <li><b>Anthropic</b>: the automated writing service that produces the full analyses.</li>
          <li><b>Google</b>: Google sign-in, if you choose it.</li>
        </ul>
        <p>Some of these providers may process data outside your country, with appropriate safeguards.</p>
      </Section>
      <Section title="4. How long">
        <p>
          We keep your data while your account exists. When you delete your account, cloud charts and sign-in are erased; purchase
          records may be kept for the period required by tax law. Data saved on your device can be erased in <b>My account → Sign out
          and erase charts on this device</b>.
        </p>
      </Section>
      <Section title="5. Your rights">
        <p>
          You may access, correct, export or delete your data at any time (deletion directly in <b>My account → Delete account</b>), and
          withdraw consent. For any request, contact us at {email}. You may also complain to your local data protection authority.
        </p>
      </Section>
      <Section title="6. Security">
        <p>We use encrypted connections, per-account access control (each person reads only their own data) and store no passwords — access is by Google or a code sent by e-mail.</p>
      </Section>
      <Section title="7. Changes">
        <p>This Policy may be updated; the date at the top shows the version in force.</p>
      </Section>
    </>
  )
}
