import { categories } from './questions.js';
import { allQuestions, stateOf, counts } from './model.js';

// Template generation is deliberately isolated. A future provider can implement
// this contract behind a secure server-side proxy; never embed an API key here.
export function generateRequirements(session) {
  const questions=allQuestions(session), progress=counts(questions,session.answers);
  return {title:'Business Requirements Document',client:session.client,project:session.project,date:new Date(session.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}),sample:session.sample,progress,
    sections:categories.map(c=>({title:c.title,items:questions.filter(q=>q.categoryId===c.id && stateOf(q,session.answers[q.id])==='answered').map(q=>({question:q.text,answer:q.checklist ? `${session.answers[q.id].choice}${session.answers[q.id].text?.trim() ? ' — '+session.answers[q.id].text.trim():''}` : session.answers[q.id].text.trim()}))})),
    outstanding:questions.filter(q=>stateOf(q,session.answers[q.id])==='pending').map(q=>({category:q.category,question:q.text,notes:session.answers[q.id]?.text?.trim()||''})),
    notApplicable:questions.filter(q=>stateOf(q,session.answers[q.id])==='na').map(q=>({category:q.category,question:q.text,notes:session.answers[q.id]?.text?.trim()||''}))};
}
export function toMarkdown(d) {
  const lines=[`# ${d.title}`,'',`**Client:** ${d.client}`,`**Project:** ${d.project}`,`**Session started:** ${d.date}`,'',`Status: discovery draft · ${d.progress.answered} answered · ${d.progress.pending} outstanding · ${d.progress.na} not applicable`,d.sample?'Fictional sample scenario.':'','Template-generated from captured answers; stakeholder review required.',''];
  d.sections.forEach(s=>{lines.push(`## ${s.title}`,''); if(!s.items.length)lines.push('No answers captured in this category.',''); s.items.forEach(i=>lines.push(`### ${i.question}`,'',i.answer,''));});
  lines.push('## Open Questions / Outstanding Items','');
  d.outstanding.forEach(i=>lines.push(`- [${i.category}] ${i.question}${i.notes ? `\n  Notes captured (decision pending): ${i.notes}`:''}`));
  if(!d.outstanding.length)lines.push('No outstanding items.');
  if(d.notApplicable.length){lines.push('','## Not Applicable','');d.notApplicable.forEach(i=>lines.push(`- [${i.category}] ${i.question}${i.notes ? `\n  Notes: ${i.notes}`:''}`));}
  return lines.join('\n').trim()+'\n';
}
export function toPlainText(d) { return toMarkdown(d).replace(/^#{1,3} /gm,'').replace(/\*\*(Client|Project|Session started):\*\*/g,'$1:'); }
export function fileName(session,extension) {return `${(session.client+'-'+session.project).normalize('NFKD').replace(/[^a-zA-Z0-9-]+/g,'-').replace(/^-|-$/g,'').slice(0,100)||'discovery'}-BRD.${extension}`;}
export async function toDocx(d) {
  const {Document,Packer,Paragraph,TextRun,HeadingLevel} = await import('docx');
  const p=(text,heading)=>new Paragraph({children:[new TextRun(text)],heading,spacing:{after:160}});
  const children=[p(d.title,HeadingLevel.TITLE),p(`Client: ${d.client}`),p(`Project: ${d.project}`),p(`Session started: ${d.date}`),p(`Discovery draft — ${d.progress.answered} answered, ${d.progress.pending} outstanding, ${d.progress.na} not applicable.`),p(d.sample?'Fictional sample scenario. Template-generated; stakeholder review required.':'Template-generated from captured answers; stakeholder review required.')];
  d.sections.forEach(s=>{children.push(p(s.title,HeadingLevel.HEADING_1));if(!s.items.length)children.push(p('No answers captured in this category.'));s.items.forEach(i=>{children.push(p(i.question,HeadingLevel.HEADING_2));i.answer.split('\n').forEach(line=>children.push(p(line)));});});
  children.push(p('Open Questions / Outstanding Items',HeadingLevel.HEADING_1));
  d.outstanding.forEach(i=>{children.push(p(`${i.category}: ${i.question}`));if(i.notes)children.push(p(`Notes captured (decision pending): ${i.notes}`));});
  if(!d.outstanding.length)children.push(p('No outstanding items.'));
  if(d.notApplicable.length){children.push(p('Not Applicable',HeadingLevel.HEADING_1));d.notApplicable.forEach(i=>{children.push(p(`${i.category}: ${i.question}`));if(i.notes)children.push(p(`Notes: ${i.notes}`));});}
  return Packer.toBlob(new Document({creator:'Discovery Assistant',title:d.title,styles:{default:{document:{run:{font:'Calibri',size:22,color:'202B28'},paragraph:{spacing:{line:280}}}}},sections:[{properties:{page:{margin:{top:1100,bottom:1100,left:1200,right:1200}}},children}]}));
}
