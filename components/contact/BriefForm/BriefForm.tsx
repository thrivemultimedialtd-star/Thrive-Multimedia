'use client';

import { useEffect, useRef, useState, useTransition, type ReactNode } from 'react';
import { contact } from '@/content/site';
import { briefOptions, emptyBrief, formatBrief, validateBrief, type Brief, type BriefErrors } from '@/lib/brief';
import { sendBrief } from '@/app/actions/sendBrief';
import styles from './BriefForm.module.css';

const WHATSAPP = '2347038860337'; // +234 703 886 0337, from the brochure
const steps = ['What do you need?', 'What’s the goal?', 'Tell us about it', 'How do we reach you?'];

/**
 * A four-step project brief. Sends to the studio by email (Resend, via a server action)
 * or opens WhatsApp with the same brief pre-filled.
 */
export default function BriefForm() {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<1 | -1>(1);
  const [brief, setBrief] = useState<Brief>(emptyBrief);
  const [errors, setErrors] = useState<BriefErrors>({});
  const [failure, setFailure] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const startedAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const headings = useRef<Array<HTMLHeadingElement | null>>([]);
  const shownStep = useRef(1);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Move focus to the new step's heading, only when the step actually changes.
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    headings.current[step - 1]?.focus({ preventScroll: true });
  }, [step]);

  const set = <K extends keyof Brief>(k: K, v: Brief[K]) => {
    setBrief((b) => ({ ...b, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const toggleService = (s: string) =>
    set('services', brief.services.includes(s) ? brief.services.filter((x) => x !== s) : [...brief.services, s]);

  const go = (to: number) => {
    if (to > step) {
      const e = validateBrief(brief, step);
      if (Object.keys(e).length) {
        setErrors(e);
        return;
      }
    }
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const submit = () => {
    const e = validateBrief(brief);
    if (Object.keys(e).length) {
      setErrors(e);
      const first = [1, 2, 3, 4].find((n) => Object.keys(validateBrief(brief, n)).length);
      if (first && first !== step) go(first);
      return;
    }
    setFailure('');
    startTransition(async () => {
      const res = await sendBrief(brief, { startedAt: startedAt.current, website: honeypot.current?.value ?? '' });
      if (res.ok) setSent(true);
      else {
        setFailure(res.error);
        if (res.fields) setErrors(res.fields);
      }
    });
  };

  const text = formatBrief(brief);
  const whatsappHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  const mailHref = `mailto:${contact.email}?subject=${encodeURIComponent(`Project brief: ${brief.name || 'new enquiry'}`)}&body=${encodeURIComponent(text)}`;

  if (sent) {
    return (
      <div className={styles.thanks} role="status">
        <div className={styles.thanksInner}>
          <span className="t-meta">Brief received</span>
          <p className={styles.thanksTitle}>Thanks, {brief.name.trim().split(' ')[0]}.</p>
          <p className={styles.thanksBody}>
            Your brief is with the studio and we’ll be in touch at {brief.email.trim()}. Can’t wait? Call{' '}
            <a href={contact.phones[0].href}>{contact.phones[0].display}</a>.
          </p>
        </div>
      </div>
    );
  }

  const chip = (props: { type: 'checkbox' | 'radio'; name: string; value: string; checked: boolean; onChange: () => void; describedBy?: string }) => (
    <label key={props.value} className={styles.chip}>
      <input
        type={props.type}
        name={props.name}
        value={props.value}
        checked={props.checked}
        onChange={props.onChange}
        aria-describedby={props.describedBy}
      />
      <span>{props.value}</span>
    </label>
  );

  const error = (k: keyof Brief) =>
    errors[k] ? (
      <p id={`brief-${k}-error`} className={styles.error}>
        {errors[k]}
      </p>
    ) : null;

  const field = (k: 'name' | 'email' | 'phone' | 'company', label: string, opts: { type?: string; auto?: string; required?: boolean }) => (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        {label}
        {!opts.required && <em> (optional)</em>}
      </span>
      <input
        type={opts.type ?? 'text'}
        name={k}
        autoComplete={opts.auto}
        value={brief[k]}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={!!errors[k] || undefined}
        aria-describedby={errors[k] ? `brief-${k}-error` : undefined}
        required={opts.required}
      />
      {error(k)}
    </label>
  );

  const stepBody: Record<number, ReactNode> = {
    1: (
      <fieldset className={styles.fieldset} aria-describedby={errors.services ? 'brief-services-error' : undefined}>
        <legend className="visually-hidden">Services</legend>
        <p className={styles.hint}>Choose as many as you like.</p>
        <div className={styles.chips}>
          {briefOptions.services.map((s) =>
            chip({ type: 'checkbox', name: 'services', value: s, checked: brief.services.includes(s), onChange: () => toggleService(s) }),
          )}
        </div>
        {error('services')}
      </fieldset>
    ),
    2: (
      <fieldset className={styles.fieldset}>
        <legend className="visually-hidden">Goal</legend>
        <div className={styles.chips}>
          {briefOptions.goals.map((g) =>
            chip({ type: 'radio', name: 'goal', value: g, checked: brief.goal === g, onChange: () => set('goal', g) }),
          )}
        </div>
        {error('goal')}
      </fieldset>
    ),
    3: (
      <div className={styles.stack}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>The project, in a few lines</span>
          <textarea
            name="message"
            rows={4}
            value={brief.message}
            onChange={(e) => set('message', e.target.value)}
            placeholder="What are you making, who is it for, and what should it achieve?"
            aria-invalid={!!errors.message || undefined}
            aria-describedby={errors.message ? 'brief-message-error' : undefined}
          />
          {error('message')}
        </label>
        <fieldset className={styles.fieldset}>
          <legend className={styles.fieldLabel}>
            Timeline <em>(optional)</em>
          </legend>
          <div className={styles.chips}>
            {briefOptions.timelines.map((t) =>
              chip({ type: 'radio', name: 'timeline', value: t, checked: brief.timeline === t, onChange: () => set('timeline', brief.timeline === t ? '' : t) }),
            )}
          </div>
        </fieldset>
        <fieldset className={styles.fieldset}>
          <legend className={styles.fieldLabel}>
            Budget <em>(optional)</em>
          </legend>
          <div className={styles.chips}>
            {briefOptions.budgets.map((t) =>
              chip({ type: 'radio', name: 'budget', value: t, checked: brief.budget === t, onChange: () => set('budget', brief.budget === t ? '' : t) }),
            )}
          </div>
        </fieldset>
      </div>
    ),
    4: (
      <div className={styles.grid2}>
        {field('name', 'Name', { auto: 'name', required: true })}
        {field('email', 'Email', { type: 'email', auto: 'email', required: true })}
        {field('phone', 'Phone', { type: 'tel', auto: 'tel' })}
        {field('company', 'Company', { auto: 'organization' })}
        {/* Honeypot: hidden from people, irresistible to bots. */}
        <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" className={styles.honeypot} aria-hidden="true" />
      </div>
    ),
  };

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (step < 4) go(step + 1);
        else submit();
      }}
    >
      <div className={styles.progress} aria-hidden="true">
        <span className="t-meta">
          {String(step).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
        </span>
        <span className={styles.bar}>
          <span style={{ transform: `scaleX(${step / steps.length})` }} />
        </span>
      </div>
      <p className="visually-hidden" aria-live="polite">
        Step {step} of {steps.length}: {steps[step - 1]}
      </p>

      {steps.map((title, i) => (
        <section
          key={title}
          className={styles.step}
          data-active={step === i + 1 || undefined}
          data-dir={dir}
          hidden={step !== i + 1}
          aria-labelledby={`brief-step-${i + 1}`}
        >
          <h3
            id={`brief-step-${i + 1}`}
            className={styles.stepTitle}
            tabIndex={-1}
            ref={(n) => {
              headings.current[i] = n;
            }}
          >
            {title}
          </h3>
          {stepBody[i + 1]}
        </section>
      ))}

      {failure && (
        <p className={styles.failure} role="alert">
          {failure}{' '}
          <a href={mailHref}>Email it instead</a> or <a href={whatsappHref} target="_blank" rel="noopener noreferrer">send it on WhatsApp</a>.
        </p>
      )}

      <div className={styles.actions}>
        {step > 1 && (
          <button type="button" className={styles.back} onClick={() => go(step - 1)}>
            ← Back
          </button>
        )}
        {step < 4 ? (
          <button type="submit" className={styles.next}>
            Continue <span aria-hidden="true">→</span>
          </button>
        ) : (
          <>
            <button type="submit" className={styles.next} disabled={pending}>
              {pending ? 'Sending…' : 'Send brief'} <span aria-hidden="true">→</span>
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsapp}
              onClick={(e) => {
                const errs = validateBrief(brief);
                if (Object.keys(errs).length) {
                  e.preventDefault();
                  setErrors(errs);
                }
              }}
            >
              Send on WhatsApp
            </a>
          </>
        )}
      </div>
    </form>
  );
}
