# ClinicaAI — Workflow Lab → Physician Validation

1. In **AI Comparison Lab**, select a question, compare the three engines and click **Save responses**. Continue for as many questions as needed.
2. Use **Export for physicians (blinded)** to download a CSV with columns `lot`, `questionId`, `category`, `question`, `codeReponse`, `answer`; this file **does not contain engine identities**.
3. Download **Export confidential key** separately. Keep this key away from physician reviewers until they finish scoring.
4. Sign into **Physician Validation Portal** using the configured physician credentials. In the **Blinded imported response review** panel, enter a reviewer ID and import the CSV from step 2. Score each answer and export the physician ratings CSV regularly.
5. The existing clinical dossier review is preserved underneath. Review case reference facts separately from scoring model responses.
6. Keep the confidential key for analysis after completing blinded review. Browser local storage is **not a central database**; physicians must export their own files.

Notes: The imported CSV should contain only fictional educational cases, not identifiable patient data. If the CSV is re-imported with a different filename, local review keys differ; keep the filename stable. No external service receives the CSV during import. The Lab’s old saved ratings are not deleted by this update, but the Lab no longer asks users to score answers.
