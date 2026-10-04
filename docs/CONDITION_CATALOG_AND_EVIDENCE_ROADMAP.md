# Condition catalog and evidence roadmap

## Decision

SALUS will pursue **catalog completeness with explicit evidence coverage**. A condition being searchable does not mean that SALUS has evaluated an intervention for it, and absence of reviewed evidence must never be converted into a score, recommendation, or implied safety conclusion.

The current six conditions are demonstration fixtures. They are not intended to represent the scope of the eventual catalog.

## Product model

The condition system has two independently versioned layers:

| Layer | Role | User-facing status |
| --- | --- | --- |
| Condition catalog | A searchable, versioned identity record: preferred name, synonyms, codes, hierarchy, and mappings. | `Catalogued` |
| Evidence coverage | Source-linked records of retrieval, screening, appraisal, synthesis, safety review, and uncertainty. | `Indexed`, `Screened`, `Reviewed`, `Insufficient evidence`, or `Out of scope` |

A catalogued condition with no reviewed evidence must prominently say so. It must not receive a Pramana score, confidence estimate, clinical recommendation, or safety conclusion.

## Authoritative source strategy

1. **WHO ICD-11 MMS** is the primary public-facing global classification and the source of stable reporting codes. Use its versioned API/release and retain WHO identifiers and release provenance. The broader Foundation may support discovery, but MMS is the reporting code system.
2. **MONDO** is the open disease-identity and cross-reference layer, particularly useful for rare diseases and harmonizing mappings. It is available under CC BY 4.0.
3. **Orphanet / ORPHAcode** supplements rare-disease identity, epidemiology, and specialist-resource links.
4. **SNOMED CT** is a future clinical-synonym/interoperability layer only after an explicit licensing and jurisdiction review. Do not ingest or redistribute its full semantic content without the necessary rights.
5. **PubMed / NCBI E-utilities** supplies primary-literature identifiers and metadata. Store PMIDs, source queries, retrieval timestamps, and source provenance; do not scrape pages or equate a citation with an appraisal.
6. **ClinicalTrials.gov** and **WHO ICTRP** provide trial registry coverage. Preserve registry identifiers, recruitment/result status, source dates, and usage restrictions. ICTRP attribution, update, and non-commercial requirements must be checked before production ingestion.
7. **Cochrane, WHO, NICE, and professional-society guidelines** are high-value evidence-synthesis sources. Link and appraise them under their individual licences; do not assume they can be copied into the product.
8. **OpenAlex** may enrich bibliographic metadata and citation relationships, but is never evidence appraisal by itself.

## Target data model

Replace the static condition fixture with a versioned `ConditionConcept` record containing:

- immutable internal `conditionId`;
- ICD-11 URI and MMS code, preferred display name, synonyms, and parent concepts;
- MONDO, ORPHAcode, MeSH, and—where licensed—SNOMED CT cross-references;
- source, source release/version, ingest date, mapping confidence, and mapping-review status;
- lifecycle state: `catalogued`, `indexed`, `screened`, `reviewed`, `insufficient_evidence`, or `out_of_scope`;
- evidence-count and last-reviewed metadata that are calculated from source records, not manually asserted.

Mappings must be first-class, reviewable records. They need source provenance, a confidence/status, a reviewer where applicable, timestamps, and an audit trail. A synonym or crosswalk is not a clinical equivalence claim.

## Delivery phases

### Phase 0 — scope, licensing, and governance

- Define the initial coverage statement: “All current ICD-11 MMS conditions are searchable; evidence coverage is visibly labelled, dated, and never inferred from missing evidence.”
- Confirm licences, attribution, permitted storage, redistribution, and update obligations for every source.
- Publish a data dictionary, release policy, mapping-review policy, and correction path.

### Phase 1 — complete discovery catalog

- Import a pinned ICD-11 MMS release with source identifiers, hierarchy, and aliases.
- Add MONDO mappings and the MONDO rare-disease subset.
- Build code/synonym search, hierarchy navigation, cursor pagination, and source-version display.
- Mark every imported condition `Catalogued`; do not create placeholder evidence or scores.

### Phase 2 — reproducible evidence intake

- Create condition-specific query packs based on ICD-11, MONDO, MeSH, and reviewed synonym mappings.
- Retrieve PubMed and trial-registry records with query version, run time, cursor/checkpoint, record identifier, and deduplication decision.
- Keep raw source metadata separate from screening, appraisal, and SALUS synthesis.
- Refresh on a documented schedule and retain prior snapshots so an audit can reproduce a result as of a date.

### Phase 3 — focused human review

Prioritize cohorts rather than adding conditions alphabetically:

1. High-burden global conditions.
2. Maternal, newborn, child, infectious, and mental health conditions.
3. Rare diseases and conditions with severe unmet need.
4. Conditions with common integrative-medicine claims or material interaction risks.
5. Conditions selected by a transparent public-health or community-review process.

Only screened and appraised records can contribute to a SALUS score or synthesis. Clinical-editor workflow, dual review for high-impact claims, conflicts-of-interest declarations, and audit records are required.

### Phase 4 — transparent coverage reporting

Publish and maintain:

- number of catalogued conditions by source release;
- number indexed, screened, and reviewed;
- conditions with no reviewed evidence;
- date last searched and date last appraised by condition;
- source mix, review queue, mapping disputes, and known limitations.

The product should make “no reviewed evidence yet” a useful, honest result—not an empty or misleading screen.

## Safety invariants

- No score, confidence interval, treatment ranking, or safety statement when appraisal data are absent.
- Never infer equivalence from a code mapping, synonym, or shared parent category.
- Preserve raw-source identity, transformation history, human review, and model version for each visible conclusion.
- Keep retrieval/indexing separate from clinical or scientific appraisal.
- Refresh terminology releases predictably, show the release used, and preserve historical snapshots.
- Follow source-specific license, attribution, update, and redistribution requirements before production use.

## Success measures

Success is not a large condition count alone. Track catalog completeness against the selected ICD-11 MMS release, search precision/recall for synonym and code lookup, mapping-review completeness, percentage with an explicit coverage state, review freshness, and the percentage of displayed conclusions with reproducible source and appraisal provenance.

## Source references

- [WHO ICD API documentation](https://icd.who.int/docs/icd-api/APIDoc-Version2/)
- [WHO ICD-11 licence](https://icd.who.int/icdapi/docs2/license/)
- [MONDO downloads and licence](https://mondo.monarchinitiative.org/pages/download/)
- [SNOMED CT licensing guidance](https://docs.snomed.org/snomed-ct-practical-guides/vendor-introduction-to-snomed-ct/7-licensing)
- [NCBI E-utilities overview](https://www.ncbi.nlm.nih.gov/books/NBK25497/)
- [ClinicalTrials.gov CSV/API fields](https://clinicaltrials.gov/data-about-studies/csv-download)
- [WHO ICTRP download conditions](https://www.who.int/tools/clinical-trials-registry-platform/network/who-data-set/downloading-records-from-the-ictrp-database)
- [OpenAlex Works documentation](https://help.openalex.org/data/works/)
