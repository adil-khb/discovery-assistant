import { categories } from './questions.js';

export const STORAGE_KEY = 'adil-discovery-session-v1';
const samples = [
  ['Bring HR and payroll into one reliable system for our 420 employees. Reduce duplicate data entry, make onboarding consistent across three locations, and give managers a clear view of their teams.', 'A six-month implementation window and a first-year budget of MUR 2.4 million. The HR team has four people, so the rollout must be phased. IT and Finance must approve data access and costs.', 'Grow from 420 to 550 employees over the next two years while keeping administrative costs under control. Open a new regional service centre without adding unnecessary process complexity.', 'Use employee self-service and automated onboarding to support growth. Better workforce reporting should help us plan hiring and spot overtime costs earlier.'],
  ['Connect with Microsoft 365 for single sign-on, our existing accounting platform, and the biometric attendance system. Confirm API support with each vendor.', 'Role-based access is reviewed quarterly. HR approves personnel access, Finance approves payroll access, and IT signs off on security before go-live.', 'Historical employee records are spread across spreadsheets. Duplicate employee IDs and incomplete leave balances will need to be reconciled before migration.'],
  ['Applications arrive in shared inboxes and spreadsheets. Hiring managers lack a consistent view of candidate progress, and follow-up is often delayed.', 'We do not have a reliable cost-per-hire baseline yet. Finance and HR will review agency fees and time spent on administration.', 'The candidate experience should feel consistent across our three locations, with clear acknowledgements and timely updates.'],
  ['Training is coordinated through spreadsheets and shared folders. Mandatory training completion is tracked manually by each department.', 'Managers identify needs during performance reviews, but there is no shared development plan or consolidated skills matrix.', 'We need better visibility of supervisor training and customer-service skills. HR will confirm the initial competency framework.'],
  ['HR emails monthly changes to Finance, which re-enters them into payroll. This creates duplicate work and a risk of missed changes.', 'Yes. Retain the bank payment process for phase one. The new system must export a compatible payroll payment file.', 'Introduce an agreed monthly cut-off, a controlled approval workflow for changes, and parallel payroll runs before switching over.'],
  ['Reviews are inconsistent between departments and objectives are difficult to track over the year.', 'Annual appraisals today. We want quarterly check-ins with a lightweight way to track objectives.', '', ''],
];
const checklistSamples = [
  ['Yes','Standardise onboarding tasks and track equipment return during offboarding.'],['Yes','One candidate pipeline with hiring-manager access.'],['Yes','A single employee record across all three locations.'],['Yes','Payroll changes need approval and an audit trail.'],['Yes','Track mandatory learning and development plans.'],['Partial','Quarterly check-ins in phase one; succession planning requires further discovery.'],['Yes','Integrate attendance devices and approval of overtime.'],['Yes','Employees should update details and request leave.'],['Yes','Keyboard access, readable contrast, and mobile usability are required. Validate with employees.'],['Yes','Secure access for staff working across locations.'],['Partial','Explore useful assistance for drafting job descriptions, with human review. No automated hiring decisions.'],['Yes','Microsoft 365, accounting, and attendance integrations.'],['Yes','IT must confirm required certifications, hosting location, and audit requirements.'],['Yes','Headcount, turnover, absence, and overtime reporting by location.'],['Partial','Finance needs a baseline before agreeing a target payback period.'],['Yes','Procurement will supply the supplier assessment criteria.'],['Partial','MUR 2.4 million first-year budget; confirm recurring fees and migration costs.'],['Partial','HR lead and IT analyst available part-time. Confirm vendor support.'],['','']
];
export function allQuestions(session) {
  return categories.flatMap(c => [...c.questions, ...(session.custom[c.id] || [])].map(q => ({...q, categoryId:c.id, category:c.title})));
}
export function stateOf(question, answer = {}) {
  if (answer.na) return 'na';
  return (question.checklist ? ['Yes','No','Partial'].includes(answer.choice) : Boolean(answer.text?.trim())) ? 'answered' : 'pending';
}
export function counts(questions, answers) {
  return questions.reduce((n,q) => { n[stateOf(q,answers[q.id])]++; n.total++; return n; }, {answered:0,pending:0,na:0,total:0});
}
export function newSession(client, project) {
  return {version:1, client:client.trim(), project:project.trim(), sample:false, createdAt:new Date().toISOString(), answers:{}, custom:{}};
}
export function sampleSession() {
  const s = newSession('Northstar Services','HR & payroll transformation'); s.sample = true;
  categories.forEach((c,i)=> c.questions.forEach((q,j)=> {s.answers[q.id] = q.checklist ? {choice:checklistSamples[j][0],text:checklistSamples[j][1]} : {text:samples[i][j]};}));
  return s;
}
export function validSession(s) {
  return Boolean(s && s.version===1 && typeof s.client==='string' && typeof s.project==='string' && typeof s.createdAt==='string' && !Number.isNaN(Date.parse(s.createdAt)) && s.answers && typeof s.answers==='object' && !Array.isArray(s.answers) && Object.values(s.answers).every(a=>a && typeof a==='object' && (a.text===undefined || typeof a.text==='string') && (a.choice===undefined || typeof a.choice==='string')) && s.custom && typeof s.custom==='object' && !Array.isArray(s.custom) && Object.values(s.custom).every(list=>Array.isArray(list) && list.every(q=>q && typeof q.id==='string' && typeof q.text==='string' && typeof q.checklist==='boolean')));
}
export function loadSession(storage) {
  try { const raw = storage.getItem(STORAGE_KEY); if(!raw) return {session:sampleSession()}; const s=JSON.parse(raw); if(!validSession(s)) throw new Error('Invalid session'); return {session:s}; }
  catch { return {session:sampleSession(),warning:'Your saved session could not be loaded. A sample is shown; your stored data will not be overwritten until you choose to continue.'}; }
}
