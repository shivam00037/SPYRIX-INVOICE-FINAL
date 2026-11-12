import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, Palette, Search, Sparkles } from 'lucide-react';
import { applyInvoiceTemplate, invoiceTemplates, loadInvoiceDesign, saveInvoiceDesign } from '../Invoices/invoiceDesign';
import TemplateMiniPreview from './TemplateMiniPreview';

export default function TemplateSelection() {
  const navigate = useNavigate();
  const [design,setDesign] = useState(()=>loadInvoiceDesign());
  const [filter,setFilter] = useState('All');
  const [query,setQuery] = useState('');
  const categories = useMemo(()=>['All',...new Set(invoiceTemplates.map(item=>item.category))],[]);
  const visible = invoiceTemplates.filter(item => (filter==='All'||item.category===filter) && `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  const selected = invoiceTemplates.find(item=>item.id===design.templateId) || invoiceTemplates[0];
  const choose = template => {
    const next=applyInvoiceTemplate(design, template);
    setDesign(next); saveInvoiceDesign(next);
  };

  return <div className="module-page template-selection-page">
    <div className="module-breadcrumb">Workspace <span>›</span> <strong>Invoice templates</strong></div>
    <header className="module-page-head"><div className="module-title-wrap"><span className="module-title-icon"><Palette size={24}/></span><div><div className="module-eyebrow">SPYRIX DESIGN COLLECTION</div><h1>Choose your invoice design</h1><p>Pick a layout first. Then preview it or open the separate customisation studio.</p></div></div><span className="template-count-pill"><Sparkles size={15}/> 20 professional layouts</span></header>
    <section className="template-choice-toolbar"><label><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search templates by name or style"/></label><div>{categories.map(category=><button key={category} className={filter===category?'active':''} onClick={()=>setFilter(category)}>{category}</button>)}</div></section>
    <section className="template-choice-grid">{visible.map(template=><article className={`template-choice-card ${design.templateId===template.id?'is-selected':''}`} key={template.id}>
      <TemplateMiniPreview template={template} selected={design}/><div className="template-choice-copy"><div><span>{template.category}</span><h3>{template.name}</h3><p>{template.description}</p></div>{design.templateId===template.id&&<span className="template-choice-check"><Check size={15}/></span>}</div><button className={design.templateId===template.id?'template-choice-select selected':'template-choice-select'} onClick={()=>choose(template)}>{design.templateId===template.id?'Selected design':'Select this template'} <ArrowRight size={15}/></button>
    </article>)}</section>
    {!visible.length&&<div className="template-choice-empty">No templates match that search. Try another name or category.</div>}
    <section className="template-next-step"><div className="template-next-copy"><span className="module-eyebrow">YOUR SELECTED DESIGN</span><h2>{selected.name}</h2><p>{selected.description} Your existing invoice records and calculations will not be changed by selecting a template.</p></div><div className="template-next-actions"><button className="template-option-card" onClick={()=>navigate('/app/templates/preview')}><span><Eye size={22}/></span><div><strong>Preview template</strong><small>See a larger sample before using it</small></div><ArrowRight size={17}/></button><button className="template-option-card primary" onClick={()=>navigate('/app/templates/customize')}><span><Palette size={22}/></span><div><strong>Customise template</strong><small>Open the full design studio</small></div><ArrowRight size={17}/></button></div></section>
  </div>;
}
