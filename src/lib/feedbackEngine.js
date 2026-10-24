// V2.1 : retour pédagogique descriptif, sans modifier le barème ni suggérer des traitements.
export function buildFeedback(clinicalCase, rubric, visited = [], tests = [], result = {}) {
  const seen = new Set(visited);
  const ordered = new Set(tests);
  const historyMissing = (clinicalCase.qa || []).filter(q => Number(q.points) > 0 && !seen.has(q.id))
    .map(q => ({ id: q.id, label: q.label || `Question clinique non abordée (${q.id})`, points: Number(q.points) }));
  const eligible = (clinicalCase.exams || []).filter(e => Number(e.points) > 0);
  const possible = eligible.reduce((n, e) => n + Number(e.points), 0);
  const examMissing = eligible.filter(e => !ordered.has(e.id)).map(e => ({
    id: e.id, label: e.label || e.id, rawPoints: Number(e.points),
    // Expliquer la pondération : le barème transforme la somme des poids sur 25 points.
    approximateWeight: possible ? Number((25 * Number(e.points) / possible).toFixed(1)) : 0
  }));
  const writtenMissing = ['triage', 'diagnosis', 'management'].flatMap(section =>
    (result.report?.[section]?.items || []).filter(i => !i.found).map(i => ({
      section, id: i.id, label: i.label, points: i.max, method: i.method || 'non reconnu',
      confidence: typeof i.confidence === 'number' ? i.confidence : null
    })));
  const methods = { regles: 0, semantique: 0, synonymes: 0, autres: 0 };
  for (const section of ['triage', 'diagnosis', 'management']) {
    for (const item of result.report?.[section]?.items || []) {
      if (!item.found) continue;
      const m = String(item.method || 'regle').toLowerCase();
      if (m.includes('semantique')) methods.semantique++;
      else if (m.includes('synonyme')) methods.synonymes++;
      else if (m.includes('regle')) methods.regles++;
      else methods.autres++;
    }
  }
  const advice = [];
  if (historyMissing.length) advice.push('Revoir les dimensions de l’interrogatoire non explorées dans ce scénario.');
  if (examMissing.length) advice.push('Revoir la pertinence des examens non demandés, en fonction de la probabilité prétest et du contexte clinique.');
  if (writtenMissing.some(i => i.section === 'triage')) advice.push('Préciser l’évaluation de gravité et la probabilité clinique prétest.');
  if (writtenMissing.some(i => i.section === 'diagnosis')) advice.push('Expliciter les hypothèses diagnostiques et les éléments qui les soutiennent.');
  if (writtenMissing.some(i => i.section === 'management')) advice.push('Préciser les décisions thérapeutiques, leurs indications et contre-indications.');
  if (!advice.length) advice.push('Tous les critères attendus ont été reconnus sur cette tentative ; tester une autre formulation ou un autre cas pour vérifier la robustesse.');
  return { historyMissing, examMissing, writtenMissing, methods, advice, gradingMethod: result.examinerMode || 'regles', hasMissing: historyMissing.length > 0 || examMissing.length > 0 || writtenMissing.length > 0 };
}
