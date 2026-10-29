/**
 * IT audit checklists. Questions are Aegis's own wording: ISO/IEC 27001:2022
 * items reference Annex A control numbers only, and the Bangladesh Bank set is
 * a readiness check organised around the themes of its ICT Security
 * Guideline. Neither is an official certification.
 */

export type AnswerValue = 'yes' | 'partial' | 'no' | 'na';

export type Answer = { value: AnswerValue; note?: string };

export type Answers = Record<string, Answer>;

export type Control = {
  id: string;
  domain: string;
  title: string;
  question: string;
  /** 1 = good practice, 2 = important, 3 = critical */
  weight: 1 | 2 | 3;
  /** Tie the control to the latest vulnerability-scan risk score. */
  linkedToScans?: boolean;
};

export type Framework = {
  id: string;
  name: string;
  short: string;
  description: string;
  controls: Control[];
};

export const FRAMEWORKS: Framework[] = [
  {
    id: 'iso27001-2022',
    name: 'ISO/IEC 27001:2022 readiness',
    short: 'ISO 27001',
    description:
      'Twenty high-impact Annex A controls. A quick way to see how far you are from certification.',
    controls: [
      { id: '5.1', domain: 'Organisational', title: 'Policies for information security', question: 'Is there an approved information security policy that staff have read and acknowledged?', weight: 2 },
      { id: '5.9', domain: 'Organisational', title: 'Inventory of information and assets', question: 'Do you keep an up-to-date inventory of systems, data and who owns each one?', weight: 2 },
      { id: '5.15', domain: 'Organisational', title: 'Access control', question: 'Is access granted on least privilege and reviewed at least once a year?', weight: 3 },
      { id: '5.17', domain: 'Organisational', title: 'Authentication information', question: 'Are passwords and secrets handled securely — never shared, and changed when staff leave?', weight: 2 },
      { id: '5.19', domain: 'Organisational', title: 'Supplier relationships', question: 'Are security requirements agreed in writing with suppliers who handle your data?', weight: 1 },
      { id: '5.24', domain: 'Organisational', title: 'Incident management planning', question: 'Is there a documented incident response plan that has been tested in the last year?', weight: 3 },
      { id: '5.30', domain: 'Organisational', title: 'ICT readiness for business continuity', question: 'Can critical systems be restored within agreed recovery times, and has this been proven?', weight: 2 },
      { id: '6.3', domain: 'People', title: 'Security awareness and training', question: 'Do all staff receive security awareness training at least once a year?', weight: 2 },
      { id: '7.1', domain: 'Physical', title: 'Physical security perimeters', question: 'Are server rooms and network equipment locked and access-controlled?', weight: 1 },
      { id: '8.2', domain: 'Technological', title: 'Privileged access rights', question: 'Are administrator accounts few, separate from daily accounts, and their use logged?', weight: 3 },
      { id: '8.5', domain: 'Technological', title: 'Secure authentication', question: 'Is multi-factor authentication enforced for remote access and all admin access?', weight: 3 },
      { id: '8.7', domain: 'Technological', title: 'Protection against malware', question: 'Is anti-malware / EDR running and monitored on every endpoint and server?', weight: 2 },
      { id: '8.8', domain: 'Technological', title: 'Management of technical vulnerabilities', question: 'Are systems scanned regularly, with critical patches applied within a set deadline?', weight: 3, linkedToScans: true },
      { id: '8.9', domain: 'Technological', title: 'Configuration management', question: 'Are secure baseline configurations defined and checked for servers and network devices?', weight: 2 },
      { id: '8.13', domain: 'Technological', title: 'Information backup', question: 'Are backups taken automatically, kept off-site or offline, and restore-tested?', weight: 3 },
      { id: '8.15', domain: 'Technological', title: 'Logging', question: 'Are security logs collected centrally and kept long enough to investigate incidents?', weight: 2 },
      { id: '8.16', domain: 'Technological', title: 'Monitoring activities', question: 'Does someone review security alerts every working day?', weight: 2 },
      { id: '8.20', domain: 'Technological', title: 'Networks security', question: 'Is the network segmented and firewalled, with rules reviewed at least yearly?', weight: 2 },
      { id: '8.24', domain: 'Technological', title: 'Use of cryptography', question: 'Is sensitive data encrypted in transit and at rest?', weight: 2 },
      { id: '8.25', domain: 'Technological', title: 'Secure development life cycle', question: 'Is security part of software development — code review, testing and sign-off?', weight: 1 },
    ],
  },
  {
    id: 'bb-ict',
    name: 'Bangladesh Bank ICT Security readiness',
    short: 'Bangladesh Bank ICT',
    description:
      'Readiness check for banks and financial institutions, organised around the themes of the Bangladesh Bank ICT Security Guideline.',
    controls: [
      { id: 'BB-01', domain: 'Governance', title: 'Board and ICT oversight', question: 'Does an ICT steering committee report on ICT and security risk to the board or management?', weight: 2 },
      { id: 'BB-02', domain: 'Governance', title: 'ICT security policy', question: 'Is there an approved ICT security policy, reviewed at least once a year?', weight: 2 },
      { id: 'BB-03', domain: 'Governance', title: 'Independent security function', question: 'Is information security run by a team independent of day-to-day IT operations?', weight: 2 },
      { id: 'BB-04', domain: 'Risk management', title: 'ICT risk assessment', question: 'Is a formal ICT risk assessment carried out at least yearly, with owners for each risk?', weight: 2 },
      { id: 'BB-05', domain: 'Access control', title: 'Segregation of duties', question: 'Do core banking systems enforce maker–checker and segregation of duties?', weight: 3 },
      { id: 'BB-06', domain: 'Access control', title: 'Customer authentication', question: 'Do internet and mobile banking require two-factor authentication for customers?', weight: 3 },
      { id: 'BB-07', domain: 'Data centre', title: 'Data centre controls', question: 'Is the data centre protected for access, fire, power and environment, with logs kept?', weight: 2 },
      { id: 'BB-08', domain: 'Business continuity', title: 'Disaster recovery site', question: 'Is there a disaster recovery site, and are DR drills run and documented regularly?', weight: 3 },
      { id: 'BB-09', domain: 'Network', title: 'Perimeter and segregation', question: 'Are firewalls / IDS in place, and is the core banking network separated from the internet?', weight: 3 },
      { id: 'BB-10', domain: 'Operations', title: 'Patching and VAPT', question: 'Are critical systems patched on schedule and covered by periodic vulnerability assessment and penetration testing?', weight: 3, linkedToScans: true },
      { id: 'BB-11', domain: 'Operations', title: 'Change management', question: 'Are changes tested and approved before they reach production?', weight: 2 },
      { id: 'BB-12', domain: 'Business continuity', title: 'Backup and restore', question: 'Are backups kept off-site and restore-tested on a schedule?', weight: 3 },
      { id: 'BB-13', domain: 'Incident response', title: 'Cyber incident handling', question: 'Is there a cyber incident response procedure, including reporting to the regulator as required?', weight: 3 },
      { id: 'BB-14', domain: 'Outsourcing', title: 'Vendor contracts', question: 'Do vendor contracts cover security, confidentiality and the right to audit?', weight: 2 },
      { id: 'BB-15', domain: 'People', title: 'Awareness', question: 'Do staff — and customers, through regular notices — receive security awareness guidance?', weight: 1 },
      { id: 'BB-16', domain: 'Assurance', title: 'Independent ICT audit', question: 'Is an independent ICT audit performed periodically, with findings tracked to closure?', weight: 2 },
    ],
  },
];

export function getFramework(id: string): Framework | null {
  return FRAMEWORKS.find((framework) => framework.id === id) ?? null;
}

export const ANSWER_SCORE: Record<Exclude<AnswerValue, 'na'>, number> = {
  yes: 1,
  partial: 0.5,
  no: 0,
};

export type AuditScore = {
  /** 0–100, or null until at least one control is answered. */
  score: number | null;
  answered: number;
  total: number;
  byDomain: { domain: string; score: number | null; answered: number; total: number }[];
  gaps: Control[];
};

/** Weighted compliance score; "N/A" controls are excluded from the maximum. */
export function scoreAudit(framework: Framework, answers: Answers): AuditScore {
  const domains = new Map<string, { got: number; max: number; answered: number; total: number }>();
  let got = 0;
  let max = 0;
  let answered = 0;
  const gaps: Control[] = [];

  for (const control of framework.controls) {
    const bucket = domains.get(control.domain) ?? { got: 0, max: 0, answered: 0, total: 0 };
    bucket.total += 1;
    const answer = answers[control.id];
    if (answer) {
      answered += 1;
      bucket.answered += 1;
      if (answer.value !== 'na') {
        const earned = ANSWER_SCORE[answer.value] * control.weight;
        got += earned;
        max += control.weight;
        bucket.got += earned;
        bucket.max += control.weight;
        if (answer.value !== 'yes') gaps.push(control);
      }
    }
    domains.set(control.domain, bucket);
  }

  gaps.sort((a, b) => b.weight - a.weight);

  return {
    score: max > 0 ? Math.round((got / max) * 100) : null,
    answered,
    total: framework.controls.length,
    byDomain: [...domains.entries()].map(([domain, b]) => ({
      domain,
      score: b.max > 0 ? Math.round((b.got / b.max) * 100) : null,
      answered: b.answered,
      total: b.total,
    })),
    gaps,
  };
}

/** Accepts only known control ids and answer values. */
export function sanitizeAnswers(framework: Framework, input: unknown): Answers {
  const out: Answers = {};
  if (!input || typeof input !== 'object') return out;
  const valid = new Set(framework.controls.map((control) => control.id));
  for (const [id, raw] of Object.entries(input as Record<string, unknown>)) {
    if (!valid.has(id) || !raw || typeof raw !== 'object') continue;
    const value = (raw as { value?: unknown }).value;
    if (value !== 'yes' && value !== 'partial' && value !== 'no' && value !== 'na') continue;
    const note = (raw as { note?: unknown }).note;
    out[id] = { value, ...(typeof note === 'string' && note.trim() ? { note: note.slice(0, 600) } : {}) };
  }
  return out;
}
