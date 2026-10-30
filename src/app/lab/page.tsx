// @ts-nocheck
'use client';
import {useEffect, useState} from 'react';
import Link from 'next/link';
import LanguageSwitcher, {getPreferredLanguage} from '../LanguageSwitcher';
import offlineQuestions from '../../data/i18n/benchmark-en.json';
import offlineReferences from '../../data/i18n/benchmark-references-en.json';
import offlineAnswers from '../../data/i18n/patient-answers-en.json';
import clinicalCase from '../../data/cases/ep-postop.json';
import benchmark from '../../data/benchmark/ep-postop-100.json';
import {rulesLabAnswer, semanticLabAnswer} from '../../lib/labEngines';

const engineLabels = {
  fr: {
    rules: 'Règles seules',
    semantic: 'Sémantique seule',
    generative: 'IA générative',
  },
  en: {
    rules: 'Rules only',
    semantic: 'Semantic only',
    generative: 'Generative AI',
  },
};

const enUI = {
  back: 'Back to consultation',
  subtitle: 'Experimental benchmark · Ms N. · Identical clinical record for all three engines',
  benchmark: 'Benchmark V3.3 · 100 educational questions',
  intro: 'Q01–Q50: development set. Q51–Q100: new evaluation questions. Have the fictional reference facts reviewed by a physician. Grey means at least one answer has been saved, not medically validated.',
  tested: 'questions saved',
  remaining: 'remaining',
  all: 'All questions',
  pending: 'Not yet saved',
  done: 'Saved',
  evaluation: 'New Q51–Q100',
  clearMarks: 'Reset grey question marks',
  resetAll: 'Reset entire Lab',
  resetAllConfirm: 'Delete ALL local trial results, grey indicators and conversation histories? Export your CSV files first. This cannot be undone.',
  resetMarksConfirm: 'Clear tested-question marks? Saved results will be kept.',
  selection: 'Selected:',
  preQuestion: 'Ask this first:',
  standalone: 'Independent question: no preceding question is required.',
  show: 'Show',
  hide: 'Hide',
  reference: 'reference answer (after rating)',
  referenceLabel: 'Reference to verify:',
  facts: 'Facts:',
  disclaimer: 'Educational responses contain fictional additions. No result represents clinically validated measurement.',
  compare: 'Compare',
  comparing: 'Comparing…',
  resetChat: 'Reset conversation',
  placeholder: 'Ask the same question to all three engines',
  rulesDesc: 'Shared clinical record · deterministic matching',
  semanticDesc: 'Shared clinical record · local embeddings',
  generativeDesc: 'Shared clinical record · API generation',
  waiting: 'Waiting…',
  start: 'Ask a question to begin.',
  inputTokens: 'Input tokens:',
  outputTokens: 'output:',
  subjective: 'Your assessment (subjective)',
  comprehension: 'Question understanding',
  fidelite: 'Clinical factual fidelity',
  naturel: 'Naturalness',
  notRated: 'Not rated',
  hallucination: 'Invented facts or contradictions?',
  no: 'No',
  yes: 'Yes',
  uncertain: 'Unsure',
  journal: 'Benchmark log and exports',
  journalDesc: 'Save the three engine responses, then export the blinded CSV and separate confidential key for physician review.',
  comments: 'Comments / justification',
  commentPlaceholder: 'Reasons, contradictions, clinical review needed…',
  save: 'Save responses',
  export: 'Export CSV',
  blind: 'Export for physicians (blinded)',
  key: 'Export confidential key',
  clear: 'Clear rating history',
  clearConfirm: 'Delete all local benchmark ratings?',
  stored: 'recorded responses',
  trials: 'trials',
  about: 'About this comparison',
  aboutText: 'All three engines use the same clinical reference record and keep separate dialogue histories. This is not yet a clinically validated comparative study. Use blinded evaluation on novel questions and track fabricated facts. Responses are saved only after clicking Save responses; physician ratings belong in the validation portal.',
  histories: 'Show separate histories',
  notAvailable: 'Response unavailable',
  semanticError: 'Semantic model unavailable; check browser and model download.',
  localInputError: 'English-to-French input translation unavailable; local engines may not recognize this question.',
  analytics: 'Performance visual comparison',
  analyticsDesc: 'The charts below summarize the subjective ratings already saved in this browser.',
  averageScore: 'Average global score',
  criterionBreakdown: 'Breakdown by criterion',
  scoreTrend: 'Trend across recent trials',
  noData: 'No saved ratings yet.',
  recentTrials: 'Recent trials',
  score5: 'score / 5',
  trial: 'Trial',
};

const initial = {rules: null, semantic: null, generative: null};
const englishCategories = {
  simple: 'simple',
  composee: 'multi-part',
  suivi: 'follow-up',
  reformulation: 'rephrasing',
  contextuelle: 'contextual',
  ambiguite: 'ambiguous',
  securite: 'safety',
};
const englishStaticAnswers = {
  ...offlineAnswers,
  'Je ne dispose pas d’information précise sur ce point.': 'I do not have precise information on that point.',
};
const engineOrder = ['rules', 'semantic', 'generative'];
export default function Lab() {
  const [language, setLanguage] = useState('en');
  const en = language === 'en';
  const tr = (key: string, fr: string) => (en ? (enUI as any)[key] || fr : fr);
  const labels = (engineLabels as any)[language];
  const [question, setQuestion] = useState(offlineQuestions.Q01);
  const [results, setResults] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState({rules: [], semantic: [], generative: []});
  
  const [showHistory, setShowHistory] = useState(false);
  const [errors, setErrors] = useState({});
  const [selected, setSelected] = useState('Q01');
  const [records, setRecords] = useState([]);
  const [reveal, setReveal] = useState(false);
  const [filter, setFilter] = useState('all');
  
  
  const selectedItem = benchmark.items.find((b) => b.id === selected) || benchmark.items[0];

  useEffect(() => {
    setLanguage(getPreferredLanguage());
  }, []);

  useEffect(() => {
    setQuestion((current) => {
      const item = benchmark.items.find((x) => x.id === selected);
      if (!item) return current;
      const enQuestion = offlineQuestions[item.id] || item.question;
      return current === item.question || current === enQuestion ? (language === 'en' ? enQuestion : item.question) : current;
    });
  }, [language, selected]);

  useEffect(() => {
    try {
      const old = JSON.parse(localStorage.getItem('clinicaai-v32-benchmark') || '[]');
      if (Array.isArray(old)) setRecords(old);
    } catch {}
  }, []);

  function persist(next) {
    setRecords(next);
    try {
      localStorage.setItem('clinicaai-v32-benchmark', JSON.stringify(next));
    } catch {}
  }

  // Grey only when at least one answer was explicitly saved. Comparing never marks a question.
  const doneIds = new Set(records.filter((r) => r && typeof r.questionId === 'string' && r.answer).map((r) => r.questionId));
  const totalDone = benchmark.items.filter((item) => doneIds.has(item.id)).length;

  function resetEntireLab() {
    // Supprime aussi les notes grises et l'historique : la réinitialisation du dialogue seule ne suffit pas.
    localStorage.removeItem('clinicaai-v32-benchmark');
    setRecords([]);
    setResults(initial);
    setHistory({rules: [], semantic: [], generative: []});
    setErrors({});
    setLoading(false);
    setReveal(false);
    setFilter('all');
    setSelected('Q01');
    setQuestion(language === 'en' ? offlineQuestions.Q01 : benchmark.items.find(x=>x.id==='Q01')?.question || '');
  }

  function choose(item) {
    setSelected(item.id);
    setQuestion(language === 'en' ? offlineQuestions[item.id] || item.question : item.question);
    setResults(initial);
    
    
    setReveal(false);
  }

  function csvEscape(v) {
    const x = String(v ?? '');
    return '"' + x.replaceAll('"', '""') + '"';
  }

  function exportCSV() {
    const fields = ['testId', 'questionId', 'category', 'question', 'engine', 'answer', 'expectedIds', 'reference', 'comprehension', 'fidelite', 'naturel', 'hallucination', 'comment', 'inputTokens', 'outputTokens', 'timestamp'];
    const lines = [fields.join(';'), ...records.map((r) => fields.map((f) => csvEscape(r[f])).join(';'))];
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clinicaai-benchmark-v3-3.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function blindCodeRows(rows) {
    const hash = (str) => {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
      return h >>> 0;
    };
    return [...rows].sort((a, b) => hash(String(a.testId) + '|' + a.engine) - hash(String(b.testId) + '|' + b.engine));
  }

  function exportBlindCSV() {
    const groups = new Map();
    for (const r of records) {
      const k = r.testId || `${r.questionId}-${r.timestamp}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(r);
    }
    const fields = ['lot', 'questionId', 'category', 'question', 'codeReponse', 'answer', 'comprehension', 'fidelite', 'naturel', 'hallucination', 'comment'];
    const lines = [fields.join(';')];
    let lot = 0;
    for (const rows of groups.values()) {
      lot++;
      const shuffled = blindCodeRows(rows);
      shuffled.forEach((r, i) => {
        const v = {lot, questionId: r.questionId, category: r.category, question: r.question, codeReponse: String.fromCharCode(65 + i), answer: r.answer, comprehension: '', fidelite: '', naturel: '', hallucination: '', comment: ''};
        lines.push(fields.map((f) => csvEscape(v[f])).join(';'));
      });
    }
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clinicaai-v33-evaluation-aveugle.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function exportBlindKey() {
    const groups = new Map();
    for (const r of records) {
      const k = r.testId || `${r.questionId}-${r.timestamp}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(r);
    }
    const lines = ['lot;questionId;codeReponse;moteur'];
    let lot = 0;
    for (const rows of groups.values()) {
      lot++;
      blindCodeRows(rows).forEach((r, i) => lines.push([lot, r.questionId, String.fromCharCode(65 + i), r.engine].map(csvEscape).join(';')));
    }
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clinicaai-v33-cle-confidentielle.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  // Use the same localized answer for display, storage and blinded CSV export.
  function visibleAnswer(engine, answer, lang = language) {
    if (!answer) return '';
    if (lang === 'en' && (engine === 'rules' || engine === 'semantic')) {
      return englishStaticAnswers[answer] || answer;
    }
    return answer;
  }

  function saveTrial() {
    const engines = engineOrder.filter((k) => results[k]?.answer);
    if (!engines.length) return;
    const timestamp = new Date().toISOString();
    const testId = timestamp + '-' + selected;
    const next = [
      ...records,
      ...engines.map((engine) => ({
        testId,
        questionId: selectedItem.id,
        category: selectedItem.category,
        question: question.trim(),
        engine,
        answer: visibleAnswer(engine, results[engine]?.answer),
        language,
        expectedIds: selectedItem.expectedIds.join('|'),
        reference: selectedItem.reference,
        comprehension: '',
        fidelite: '',
        naturel: '',
        hallucination: 'non_evaluee',
        comment: '',
        inputTokens: results[engine]?.usage?.input || '',
        outputTokens: results[engine]?.usage?.output || '',
        timestamp,
      })),
    ];
    persist(next);
  }

  async function compare(e) {
    e.preventDefault();
    if (loading || !question.trim()) return;
    const q = question.trim();
    setLoading(true);
    setErrors({});
    setResults(initial);
    let localQuestion = q;
    if (language === 'en') {
      try {
        const matching = benchmark.items.find((it) => q === (offlineQuestions[it.id] || ''));
        localQuestion = matching ? matching.question : q;
      } catch {
        setErrors((x) => ({...x, rules: tr('localInputError', 'Impossible de traduire la question pour les moteurs locaux.')}));
      }
    }
    const unsupportedEnglish = language === 'en' && !benchmark.items.some((it) => q === (offlineQuestions[it.id] || ''));
    if (unsupportedEnglish) {
      setErrors((x) => ({
        ...x,
        rules: 'Select a benchmark question to compare the two local engines in English.',
        semantic: 'English free-text matching has not been calibrated for this benchmark.',
      }));
    }
    const rule = unsupportedEnglish ? {answer: '', engine: 'unavailable'} : rulesLabAnswer(localQuestion, history.rules);
    if (!unsupportedEnglish) setResults((x) => ({...x, rules: {answer: rule.answer, engine: rule.engine || 'regles'}}));

    const tasks = [
      (async () => {
        if (unsupportedEnglish) return null;
        try {
          const a = await semanticLabAnswer(localQuestion, history.semantic);
          setResults((x) => ({...x, semantic: {answer: a.answer, engine: a.engine || 'semantique'}}));
          return a.answer;
        } catch (e) {
          setErrors((x) => ({...x, semantic: tr('semanticError', 'Modèle sémantique indisponible : téléchargement ou navigateur à vérifier.')}));
          return null;
        }
      })(),
      (async () => {
        try {
          const resp = await fetch('/api/lab/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({question: q, history: history.generative, language}),
          });
          const data = await resp.json();
          if (!resp.ok) throw Error(data.error || 'API indisponible');
          setResults((x) => ({...x, generative: {answer: data.answer, engine: data.model, usage: data.usage}}));
          return data.answer;
        } catch (e) {
          setErrors((x) => ({...x, generative: e.message || 'Erreur API'}));
          return null;
        }
      })(),
    ];

    const [semantic, generative] = await Promise.all(tasks);
    setHistory((h) =>
      Object.fromEntries(
        engineOrder.map((k) => [
          k,
          [
            ...h[k],
            {role: 'student', text: k === 'generative' ? q : localQuestion},
            {role: 'patient', text: (k === 'rules' ? rule.answer : k === 'semantic' ? semantic : generative) || 'Réponse indisponible'},
          ].slice(-8),
        ])
      )
    );
    
    
    setLoading(false);
  }

  const box = 'bg-white border border-slate-200 rounded-2xl p-5 shadow-sm';
  const methodCardClasses = {
    rules: 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50',
    semantic: 'border-teal-200 bg-gradient-to-br from-teal-50 via-white to-emerald-50',
    generative: 'border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50',
  } as const;
  const methodAnswerClasses = {
    rules: 'border-amber-100',
    semantic: 'border-teal-100',
    generative: 'border-violet-100',
  } as const;
  const methodTitleClasses = {
    rules: 'text-amber-950',
    semantic: 'text-teal-950',
    generative: 'text-violet-950',
  } as const;
  const methodIconClasses = {
    rules: 'bg-amber-100 text-amber-800',
    semantic: 'bg-teal-100 text-teal-800',
    generative: 'bg-violet-100 text-violet-800',
  } as const;
  const methodIcons = {rules: '≡', semantic: '◎', generative: '✦'} as const;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-4 md:p-5">
      <div className="max-w-7xl mx-auto flex justify-end rounded-xl bg-slate-900 p-2">
        <LanguageSwitcher language={language} onChange={setLanguage} />
      </div>

      <div className="max-w-7xl mx-auto space-y-5 mt-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">ClinicaAI · AI Comparison Lab</h1>
            <p className="text-slate-600">{tr('subtitle', 'V3.2 expérimental · Mme N. · Même dossier clinique pour les trois moteurs')}</p>
          </div>
          <Link href="/" className="rounded-lg bg-slate-900 text-white px-4 py-2">
            {tr('back', 'Retour à la consultation')}
          </Link>
        </div>

        <div className="clinicaai-lab-layout">
          <div className="clinicaai-lab-left min-w-0 space-y-5">
            <div className={box}>
              <h2 className="text-lg font-bold mb-2">{tr('benchmark', 'Benchmark V3.3 · 100 questions pédagogiques')}</h2>
              <p className="text-sm text-slate-600 mb-2">{tr('intro', 'Q01–Q50 : développement déjà effectué. Q51–Q100 : nouvelles questions pour l’évaluation. Faites valider les références fictives par un médecin. Le gris signifie « réponse enregistrée », pas « médicalement validée ».')}</p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-sm mb-2">
                <strong>{totalDone} / 100 {tr('tested', 'questions sauvegardées')}</strong>
                <span>{100 - totalDone} {tr('remaining', 'restantes')}</span>
              </div>
              <div className="h-2 rounded bg-slate-200 overflow-hidden mb-3">
                <div className="h-full bg-slate-500" style={{width: `${totalDone}%`}} />
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <select aria-label="Filtrer les questions" className="border rounded-lg p-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">{tr('all', 'Toutes les questions')}</option>
                  <option value="pending">{tr('pending', 'Non sauvegardées')}</option>
                  <option value="done">{tr('done', 'Sauvegardées')}</option>
                  <option value="evaluation">{tr('evaluation', 'Nouvelles Q51–Q100')}</option>
                </select>
                <button type="button" className="rounded-lg border border-red-300 px-3 py-2 text-xs text-red-700 hover:bg-red-50" onClick={() => {if (confirm(tr('resetAllConfirm', 'Supprimer tous les résultats locaux, les indicateurs gris et les historiques des conversations ? Exportez vos fichiers CSV avant : cette opération est irréversible.'))) resetEntireLab();}}>{tr('resetAll', 'Tout réinitialiser (Lab)')}</button>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                {language === 'en'
                  ? 'All questions are self-contained. They are grouped by clinical theme; IDs now follow clinical order from Q01 to Q100.'
                  : 'Chaque question est autonome. Les questions sont regroupées par thème clinique ; les identifiants d’origine sont conservés pour les exports.'}
              </p>
              <div role="list" aria-label="Questions du benchmark" className="max-h-[28rem] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 p-2 space-y-1">
                {benchmark.items
                  .filter(
                    (item) =>
                      filter === 'all' ||
                      (filter === 'pending' && !doneIds.has(item.id)) ||
                      (filter === 'done' && doneIds.has(item.id)) ||
                      (filter === 'evaluation' && Number(item.id.slice(1)) >= 51)
                  )
                  .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => choose(item)}
                      aria-current={selected === item.id ? 'true' : undefined}
                      className={
                        'text-left block w-full rounded-lg px-3 py-2 text-sm border transition ' +
                        (selected === item.id ? 'border-blue-500 ring-2 ring-blue-200 ' : 'border-transparent ') +
                        (doneIds.has(item.id) ? 'bg-slate-200 text-slate-500 ' : 'bg-white hover:bg-blue-50 text-slate-900 ')
                      }
                    >
                      <span className="font-semibold">{doneIds.has(item.id) ? '✓ ' : ''}{item.id}</span> · {language === 'en' ? englishCategories[item.category] || item.category : item.category} · {(language === 'en' ? offlineQuestions[item.id] : null) || item.question}
                    </button>
                  ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {tr('selection', 'Sélection :')} {selectedItem.id}.{' '}
                {tr('standalone', 'Question autonome : aucune question préalable nécessaire.')}
              </p>
              <button className="text-sm underline mt-2" type="button" onClick={() => setReveal((x) => !x)}>
                {reveal ? tr('hide', 'Masquer') : tr('show', 'Afficher')} {tr('reference', 'la réponse de référence (après notation)')}
              </button>
              {reveal && (
                <div className="bg-amber-50 p-3 mt-2 text-sm rounded-lg">
                  <strong>{tr('referenceLabel', 'Référence pédagogique à vérifier :')}</strong> {language === 'en' ? offlineReferences[selectedItem.id] || selectedItem.reference : selectedItem.reference}
                  <br />
                  <strong>{tr('facts', 'Faits :')}</strong> {selectedItem.expectedIds.join(', ')}
                </div>
              )}
            </div>
          </div>

          <div className="clinicaai-lab-right min-w-0 space-y-5">
            <div className={box}>
              <p className="font-semibold mb-1">{language === 'en' ? 'Ms N., 45, presents to the emergency department with shortness of breath for three days.' : clinicalCase.opening}</p>
              <p className="text-sm text-slate-600 mb-3">{tr('disclaimer', 'Les réponses sont pédagogiques et contiennent des ajouts fictifs. Aucun résultat ne représente une mesure clinique validée.')}</p>
              <form onSubmit={compare} className="flex gap-2 flex-wrap">
                <input
                  aria-label="Question de l'étudiant"
                  required
                  maxLength={350}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-w-0 flex-1 border rounded-lg p-3"
                  placeholder={tr('placeholder', 'Posez la même question aux trois moteurs')}
                />
                <button disabled={loading || !question.trim()} className="bg-blue-700 text-white rounded-lg px-5 py-3 disabled:opacity-50">
                  {loading ? tr('comparing', 'Analyse en cours…') : tr('compare', 'Comparer')}
                </button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setHistory({rules: [], semantic: [], generative: []});
                  setResults(initial);
                  
                  setErrors({});
                }}
                className="text-sm mt-3 underline"
              >
                {tr('resetChat', 'Réinitialiser la conversation')}
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3" aria-label={language === 'en' ? 'Comparison of three methods' : 'Comparaison des trois méthodes'}>
              {Object.entries(labels).map(([key, label]) => {
                const method = key as keyof typeof methodCardClasses;
                const answer = (results[key]?.answer
                  ? visibleAnswer(key, results[key].answer)
                  : null) || errors[key] || (loading ? tr('waiting', 'En attente…') : tr('start', 'Posez une question pour démarrer.'));
                return (
                  <article className={`min-w-0 overflow-hidden rounded-2xl border p-3 sm:p-4 shadow-sm transition-shadow hover:shadow-md ${methodCardClasses[method]}`} key={key}>
                    <div className="flex items-start gap-3">
                      <div aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl font-bold ${methodIconClasses[method]}`}>
                        {methodIcons[method]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className={`text-base font-bold leading-6 ${methodTitleClasses[method]}`}>{label}</h2>
                        <p className="text-xs leading-5 text-slate-600">
                          {key === 'rules'
                            ? tr('rulesDesc', 'Variantes du dossier commun · local')
                            : key === 'semantic'
                              ? tr('semanticDesc', 'Embeddings sur le dossier commun · local')
                              : tr('generativeDesc', 'Génération API · dossier commun')}
                        </p>
                      </div>
                    </div>
                    <div role="region" aria-label={`${label} — ${language === 'en' ? 'answer' : 'réponse'}`} tabIndex={0} className={`h-20 overflow-y-auto overscroll-contain mt-3 rounded-xl border bg-white/90 p-3 text-sm leading-5 text-slate-800 whitespace-pre-wrap break-words focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${methodAnswerClasses[method]}`}>
                      {answer}
                    </div>
                    {results[key]?.usage && (
                      <p className="mt-2 text-xs text-slate-500">
                        {tr('inputTokens', 'Jetons entrée :')} {results[key].usage.input}, {tr('outputTokens', 'sortie :')} {results[key].usage.output}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            <div className={box}>
              <h2 className="font-semibold">{tr('journal', 'Journal et export du benchmark')}</h2>
              <p className="text-sm text-slate-600 mt-2">{tr('journalDesc', 'Enregistrez les réponses des trois moteurs, puis exportez le fichier CSV aveugle et la clé confidentielle séparée pour le portail médical.')}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button type="button" onClick={saveTrial} disabled={!Object.values(results).some((v) => v?.answer)} className="rounded-lg bg-blue-700 text-white px-4 py-2 disabled:opacity-50">
                  {tr('save', 'Enregistrer les réponses')}
                </button>
                <button type="button" onClick={exportCSV} disabled={!records.length} className="rounded-lg border px-4 py-2 disabled:opacity-50">
                  {tr('export', 'Exporter CSV')}
                </button>
                <button type="button" onClick={exportBlindCSV} disabled={!records.length} className="rounded-lg border px-4 py-2 disabled:opacity-50">
                  {tr('blind', 'Exporter pour les médecins (aveugle)')}
                </button>
                <button type="button" onClick={exportBlindKey} disabled={!records.length} className="rounded-lg border px-4 py-2 disabled:opacity-50">
                  {tr('key', 'Exporter la clé confidentielle')}
                </button>
                <button type="button" onClick={() => { if (confirm(tr('clearConfirm', 'Supprimer toutes les évaluations locales du benchmark ?'))) persist([]); }} className="rounded-lg border px-4 py-2">
                  {tr('clear', 'Effacer l’historique des évaluations')}
                </button>
              </div>
              <p className="text-sm mt-2">
                {records.length} {tr('stored', 'réponses enregistrées')} ({new Set(records.map((r) => r.testId)).size} {tr('trials', 'essais')}). {language === 'en' ? 'Data are stored only in this browser.' : 'Données stockées uniquement dans ce navigateur.'}
              </p>
            </div>

            <div className={box}>
              <h2 className="font-semibold">{tr('about', 'À propos de cette comparaison')}</h2>
              <p className="text-sm mt-2">{tr('aboutText', 'Les trois moteurs utilisent le même dossier clinique de référence et chaque moteur conserve son propre historique. Ce n’est pas encore une étude comparative validée : les jugements doivent être faits à l’aveugle sur des questions inédites, en surveillant les faits inventés. Les réponses sont enregistrées ici ; leur évaluation médicale se fait dans le portail dédié.')}</p>
              <label className="text-sm flex gap-2 items-center mt-3">
                <input type="checkbox" checked={showHistory} onChange={(e) => setShowHistory(e.target.checked)} />
                {tr('histories', 'Voir les historiques séparés')}
              </label>
              {showHistory && <pre className="text-xs mt-3 whitespace-pre-wrap bg-slate-50 rounded-lg p-3">{JSON.stringify(history, null, 2)}</pre>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
