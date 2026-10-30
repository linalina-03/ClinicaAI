# ClinicaAI — Jury demonstration

Open the Medical Validation page and use the previously configured demonstration access code displayed on the login page.

- Reviewer ID defaults to `Doctor1` and can be edited.
- The blinded CSV sample is loaded automatically from `public/jury-demo-blinded.csv` and contains **3 sample responses to Q10** (A, B, C).
- The judge can rate each response (understanding, clinical accuracy, naturalness, hallucinations), add comments, and export ratings.
- The file chooser still allows importing another blinded CSV instead of the demo.
- The engine-to-response key is not included in the anonymized CSV.
- Ratings are stored locally in the user's own browser.

**Security:** the access code displayed publicly is intended only for a demonstration environment, not protection of confidential clinical data.

**Important:** the demo contains three answers to one question, not the entire 100-question benchmark. This dataset illustrates the workflow, not a scientific validation result.
