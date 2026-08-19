/* =========================================================================
   CORSC oncology regimen library — bundled reference data.

   GENERATED FILE. Do not hand-edit; regenerate instead.

   Sources merged:
   - CORSC Comprehensive Oncology Regimen Library 0.1.0-research-release
     (verified 2026-08-18) — hand-curated multi-phase sequencing for its 82
     regimens, kept as the authoritative structure wherever it overlaps with
     the release below.
   - CORSC Comprehensive Oncology Regimen, Drug & Treatment Knowledge Library
     2.0.0-expanded-research-release (verified 2026-08-19) — broadens
     coverage to 468 regimen families and 230 drugs across essentially all
     adult solid-tumour and haematologic cancer types.

   WHAT THIS IS: a regimen *identity* library — which regimens exist, what
   phases they run in (where known), and which agents each phase contains. It
   is deliberately NOT a dosing or prescribing database: neither source
   release encodes doses, because a dose that varies by protocol, body
   surface area and local practice cannot be asserted from a preset without
   inventing a clinical fact.

   PHASE SEQUENCING: only the 82 regimens carried forward from the 0.1.0
   release have genuine multi-phase sequencing (e.g. AC then TH then
   trastuzumab maintenance). The 2.0.0 release's regimen records do not
   sequence phases — every agent sits in one bucket — so regimens sourced
   only from it have an empty 'phases' array. lib/treatment-course.js's
   courseFromPreset() already handles that: a regimen with no phase
   breakdown gets a single synthesized phase from its 'agents' list, so
   nothing downstream needs a special case, but a patient on one of these
   regimens will not see a phase transition the way an AC-TH patient does
   until that regimen's phases are hand-curated too.

   A regimen name that exists in both releases with a genuinely different
   agent composition (e.g. AC-TH with paclitaxel vs docetaxel) is kept as two
   separate entries rather than one silently redefined, because an existing
   patient record's regimenId must never change what it refers to.

   WHAT IT DOES NOT DO: assign patient risk. 'therapyClass' here is the
   library's own vocabulary. Mapping it onto the CORSC therapy classes the
   engines consume happens in lib/treatment-course.js, deliberately, and only
   where a defensible counterpart exists.
   ========================================================================= */

export const LIBRARY_VERSION = "2.0.0-expanded-research-release";
export const LIBRARY_VERIFIED_ON = "2026-08-19";

/** Cardiovascular metadata per agent, keyed by generic name. */
export const LIBRARY_DRUGS = {
  "azacitidine": {
    "genericName": "azacitidine",
    "drugClass": "hypomethylating agent",
    "therapyClass": "epigenetic/cytotoxic therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "bevacizumab": {
    "genericName": "bevacizumab",
    "drugClass": "VEGF inhibitor",
    "therapyClass": "VEGF/VEGFR-directed therapy",
    "cvToxicity": [
      "hypertension",
      "thromboembolism",
      "heart failure/vascular toxicity"
    ],
    "anthracycline": false
  },
  "bleomycin": {
    "genericName": "bleomycin",
    "drugClass": "antibiotic antineoplastic",
    "therapyClass": "cytotoxic chemotherapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "bortezomib": {
    "genericName": "bortezomib",
    "drugClass": "proteasome inhibitor",
    "therapyClass": "proteasome inhibitor",
    "cvToxicity": [
      "heart failure",
      "hypertension",
      "arrhythmia"
    ],
    "anthracycline": false
  },
  "brentuximab vedotin": {
    "genericName": "brentuximab vedotin",
    "drugClass": "CD30 antibody-drug conjugate",
    "therapyClass": "antibody-drug conjugate",
    "cvToxicity": [],
    "anthracycline": false
  },
  "cabazitaxel": {
    "genericName": "cabazitaxel",
    "drugClass": "taxane",
    "therapyClass": "taxane",
    "cvToxicity": [
      "arrhythmia",
      "ischemia/vasospasm"
    ],
    "anthracycline": false
  },
  "capecitabine": {
    "genericName": "capecitabine",
    "drugClass": "antimetabolite",
    "therapyClass": "fluoropyrimidine",
    "cvToxicity": [
      "ischemia/vasospasm",
      "arrhythmia",
      "heart failure"
    ],
    "anthracycline": false
  },
  "carboplatin": {
    "genericName": "carboplatin",
    "drugClass": "platinum",
    "therapyClass": "platinum",
    "cvToxicity": [
      "vascular toxicity/thrombosis",
      "ischemia"
    ],
    "anthracycline": false
  },
  "cetuximab": {
    "genericName": "cetuximab",
    "drugClass": "EGFR monoclonal antibody",
    "therapyClass": "EGFR-targeted therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "cisplatin": {
    "genericName": "cisplatin",
    "drugClass": "platinum",
    "therapyClass": "platinum",
    "cvToxicity": [
      "vascular toxicity/thrombosis",
      "ischemia"
    ],
    "anthracycline": false
  },
  "cyclophosphamide": {
    "genericName": "cyclophosphamide",
    "drugClass": "alkylating agent",
    "therapyClass": "cytotoxic chemotherapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "cytarabine": {
    "genericName": "cytarabine",
    "drugClass": "antimetabolite",
    "therapyClass": "cytotoxic chemotherapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "dacarbazine": {
    "genericName": "dacarbazine",
    "drugClass": "alkylating-like agent",
    "therapyClass": "cytotoxic chemotherapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "daratumumab": {
    "genericName": "daratumumab",
    "drugClass": "anti-CD38 monoclonal antibody",
    "therapyClass": "anti-CD38/biologic",
    "cvToxicity": [],
    "anthracycline": false
  },
  "daunorubicin": {
    "genericName": "daunorubicin",
    "drugClass": "anthracycline",
    "therapyClass": "anthracycline",
    "cvToxicity": [
      "LV dysfunction/heart failure",
      "arrhythmia"
    ],
    "anthracycline": true
  },
  "dexamethasone": {
    "genericName": "dexamethasone",
    "drugClass": "corticosteroid",
    "therapyClass": "corticosteroid",
    "cvToxicity": [],
    "anthracycline": false
  },
  "docetaxel": {
    "genericName": "docetaxel",
    "drugClass": "taxane",
    "therapyClass": "taxane",
    "cvToxicity": [
      "arrhythmia",
      "ischemia/vasospasm"
    ],
    "anthracycline": false
  },
  "doxorubicin": {
    "genericName": "doxorubicin",
    "drugClass": "anthracycline",
    "therapyClass": "anthracycline",
    "cvToxicity": [
      "LV dysfunction/heart failure",
      "arrhythmia"
    ],
    "anthracycline": true
  },
  "durvalumab": {
    "genericName": "durvalumab",
    "drugClass": "PD-L1 inhibitor",
    "therapyClass": "immune checkpoint inhibitor",
    "cvToxicity": [
      "myocarditis",
      "arrhythmia",
      "vascular events"
    ],
    "anthracycline": false
  },
  "etoposide": {
    "genericName": "etoposide",
    "drugClass": "topoisomerase II inhibitor",
    "therapyClass": "cytotoxic chemotherapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "filgrastim": {
    "genericName": "filgrastim",
    "drugClass": "G-CSF",
    "therapyClass": "supportive biologic",
    "cvToxicity": [],
    "anthracycline": false
  },
  "fludarabine": {
    "genericName": "fludarabine",
    "drugClass": "purine analog",
    "therapyClass": "cytotoxic chemotherapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "fluorouracil": {
    "genericName": "fluorouracil",
    "drugClass": "antimetabolite",
    "therapyClass": "fluoropyrimidine",
    "cvToxicity": [
      "ischemia/vasospasm",
      "arrhythmia",
      "heart failure"
    ],
    "anthracycline": false
  },
  "gemcitabine": {
    "genericName": "gemcitabine",
    "drugClass": "antimetabolite",
    "therapyClass": "cytotoxic chemotherapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "idarubicin": {
    "genericName": "idarubicin",
    "drugClass": "anthracycline",
    "therapyClass": "anthracycline",
    "cvToxicity": [
      "LV dysfunction/heart failure",
      "arrhythmia"
    ],
    "anthracycline": true
  },
  "ifosfamide": {
    "genericName": "ifosfamide",
    "drugClass": "alkylating agent",
    "therapyClass": "cytotoxic chemotherapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "irinotecan": {
    "genericName": "irinotecan",
    "drugClass": "topoisomerase I inhibitor",
    "therapyClass": "cytotoxic chemotherapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "lenalidomide": {
    "genericName": "lenalidomide",
    "drugClass": "IMiD",
    "therapyClass": "immunomodulatory drug",
    "cvToxicity": [
      "thromboembolism"
    ],
    "anthracycline": false
  },
  "leucovorin": {
    "genericName": "leucovorin",
    "drugClass": "folate analog modulator",
    "therapyClass": "combination agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "methotrexate": {
    "genericName": "methotrexate",
    "drugClass": "antimetabolite",
    "therapyClass": "cytotoxic chemotherapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "nab-paclitaxel": {
    "genericName": "nab-paclitaxel",
    "drugClass": "taxane",
    "therapyClass": "taxane",
    "cvToxicity": [
      "arrhythmia",
      "ischemia/vasospasm"
    ],
    "anthracycline": false
  },
  "nivolumab": {
    "genericName": "nivolumab",
    "drugClass": "PD-1 inhibitor",
    "therapyClass": "immune checkpoint inhibitor",
    "cvToxicity": [
      "myocarditis",
      "arrhythmia",
      "vascular events"
    ],
    "anthracycline": false
  },
  "oxaliplatin": {
    "genericName": "oxaliplatin",
    "drugClass": "platinum",
    "therapyClass": "platinum",
    "cvToxicity": [
      "vascular toxicity/thrombosis",
      "ischemia"
    ],
    "anthracycline": false
  },
  "paclitaxel": {
    "genericName": "paclitaxel",
    "drugClass": "taxane",
    "therapyClass": "taxane",
    "cvToxicity": [
      "arrhythmia",
      "ischemia/vasospasm"
    ],
    "anthracycline": false
  },
  "pembrolizumab": {
    "genericName": "pembrolizumab",
    "drugClass": "PD-1 inhibitor",
    "therapyClass": "immune checkpoint inhibitor",
    "cvToxicity": [
      "myocarditis",
      "arrhythmia",
      "vascular events"
    ],
    "anthracycline": false
  },
  "pemetrexed": {
    "genericName": "pemetrexed",
    "drugClass": "antimetabolite",
    "therapyClass": "cytotoxic chemotherapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "pertuzumab": {
    "genericName": "pertuzumab",
    "drugClass": "HER2 monoclonal antibody",
    "therapyClass": "HER2-targeted therapy",
    "cvToxicity": [
      "LV dysfunction/heart failure"
    ],
    "anthracycline": false
  },
  "pomalidomide": {
    "genericName": "pomalidomide",
    "drugClass": "IMiD",
    "therapyClass": "immunomodulatory drug",
    "cvToxicity": [
      "thromboembolism"
    ],
    "anthracycline": false
  },
  "prednisolone": {
    "genericName": "prednisolone",
    "drugClass": "corticosteroid",
    "therapyClass": "corticosteroid",
    "cvToxicity": [],
    "anthracycline": false
  },
  "prednisone": {
    "genericName": "prednisone",
    "drugClass": "corticosteroid",
    "therapyClass": "corticosteroid",
    "cvToxicity": [],
    "anthracycline": false
  },
  "rituximab": {
    "genericName": "rituximab",
    "drugClass": "anti-CD20 monoclonal antibody",
    "therapyClass": "anti-CD20/biologic",
    "cvToxicity": [],
    "anthracycline": false
  },
  "trastuzumab": {
    "genericName": "trastuzumab",
    "drugClass": "HER2 monoclonal antibody",
    "therapyClass": "HER2-targeted therapy",
    "cvToxicity": [
      "LV dysfunction/heart failure"
    ],
    "anthracycline": false
  },
  "venetoclax": {
    "genericName": "venetoclax",
    "drugClass": "BCL-2 inhibitor",
    "therapyClass": "targeted therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "vinblastine": {
    "genericName": "vinblastine",
    "drugClass": "vinca alkaloid",
    "therapyClass": "vinca alkaloid",
    "cvToxicity": [
      "arrhythmia/vasospasm"
    ],
    "anthracycline": false
  },
  "vincristine": {
    "genericName": "vincristine",
    "drugClass": "vinca alkaloid",
    "therapyClass": "vinca alkaloid",
    "cvToxicity": [
      "arrhythmia/vasospasm"
    ],
    "anthracycline": false
  },
  "abemaciclib": {
    "genericName": "abemaciclib",
    "drugClass": "CDK4/6 inhibitor",
    "therapyClass": "CDK4/6 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "abiraterone": {
    "genericName": "abiraterone",
    "drugClass": "CYP17 inhibitor",
    "therapyClass": "CYP17 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "acalabrutinib": {
    "genericName": "acalabrutinib",
    "drugClass": "BTK inhibitor",
    "therapyClass": "BTK inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "actinomycin d": {
    "genericName": "actinomycin d",
    "drugClass": "antitumour antibiotic",
    "therapyClass": "antitumour antibiotic",
    "cvToxicity": [],
    "anthracycline": false
  },
  "adagrasib": {
    "genericName": "adagrasib",
    "drugClass": "KRAS G12C inhibitor",
    "therapyClass": "KRAS G12C inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "alectinib": {
    "genericName": "alectinib",
    "drugClass": "ALK TKI",
    "therapyClass": "ALK TKI",
    "cvToxicity": [],
    "anthracycline": false
  },
  "all-trans retinoic acid": {
    "genericName": "all-trans retinoic acid",
    "drugClass": "differentiation agent",
    "therapyClass": "differentiation agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "amivantamab": {
    "genericName": "amivantamab",
    "drugClass": "EGFR/MET bispecific antibody",
    "therapyClass": "EGFR/MET bispecific antibody",
    "cvToxicity": [],
    "anthracycline": false
  },
  "anastrozole": {
    "genericName": "anastrozole",
    "drugClass": "aromatase inhibitor",
    "therapyClass": "aromatase inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "apalutamide": {
    "genericName": "apalutamide",
    "drugClass": "androgen receptor inhibitor",
    "therapyClass": "androgen receptor inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "aprepitant": {
    "genericName": "aprepitant",
    "drugClass": "NK1 antagonist",
    "therapyClass": "NK1 antagonist",
    "cvToxicity": [],
    "anthracycline": false
  },
  "arsenic trioxide": {
    "genericName": "arsenic trioxide",
    "drugClass": "differentiation agent",
    "therapyClass": "differentiation agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "asparaginase": {
    "genericName": "asparaginase",
    "drugClass": "enzyme therapy",
    "therapyClass": "enzyme therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "atezolizumab": {
    "genericName": "atezolizumab",
    "drugClass": "PD-L1 inhibitor",
    "therapyClass": "immune checkpoint inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "avapritinib": {
    "genericName": "avapritinib",
    "drugClass": "KIT/PDGFRA inhibitor",
    "therapyClass": "KIT/PDGFRA inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "avelumab": {
    "genericName": "avelumab",
    "drugClass": "PD-L1 inhibitor",
    "therapyClass": "immune checkpoint inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "axicabtagene ciloleucel": {
    "genericName": "axicabtagene ciloleucel",
    "drugClass": "CD19 CAR-T",
    "therapyClass": "CD19 CAR-T",
    "cvToxicity": [],
    "anthracycline": false
  },
  "axitinib": {
    "genericName": "axitinib",
    "drugClass": "VEGFR TKI",
    "therapyClass": "VEGF/VEGFR-directed therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "bendamustine": {
    "genericName": "bendamustine",
    "drugClass": "alkylating agent",
    "therapyClass": "alkylating agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "bicalutamide": {
    "genericName": "bicalutamide",
    "drugClass": "endocrine",
    "therapyClass": "endocrine",
    "cvToxicity": [],
    "anthracycline": false
  },
  "binimetinib": {
    "genericName": "binimetinib",
    "drugClass": "MEK inhibitor",
    "therapyClass": "RAF/MEK pathway inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "blinatumomab": {
    "genericName": "blinatumomab",
    "drugClass": "CD19-directed BiTE",
    "therapyClass": "CD19-directed BiTE",
    "cvToxicity": [],
    "anthracycline": false
  },
  "bosutinib": {
    "genericName": "bosutinib",
    "drugClass": "BCR-ABL tyrosine kinase inhibitor",
    "therapyClass": "BCR-ABL TKI",
    "cvToxicity": [],
    "anthracycline": false
  },
  "brexucabtagene autoleucel": {
    "genericName": "brexucabtagene autoleucel",
    "drugClass": "CD19 CAR-T",
    "therapyClass": "CD19 CAR-T",
    "cvToxicity": [],
    "anthracycline": false
  },
  "brigatinib": {
    "genericName": "brigatinib",
    "drugClass": "ALK inhibitor",
    "therapyClass": "ALK inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "busulfan": {
    "genericName": "busulfan",
    "drugClass": "alkylating agent",
    "therapyClass": "alkylating agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "cabozantinib": {
    "genericName": "cabozantinib",
    "drugClass": "multikinase inhibitor",
    "therapyClass": "VEGF/VEGFR-directed therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "capmatinib": {
    "genericName": "capmatinib",
    "drugClass": "MET inhibitor",
    "therapyClass": "MET inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "carfilzomib": {
    "genericName": "carfilzomib",
    "drugClass": "proteasome inhibitor",
    "therapyClass": "proteasome inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "carmustine": {
    "genericName": "carmustine",
    "drugClass": "cytotoxic",
    "therapyClass": "cytotoxic",
    "cvToxicity": [],
    "anthracycline": false
  },
  "cemiplimab": {
    "genericName": "cemiplimab",
    "drugClass": "PD-1 inhibitor",
    "therapyClass": "PD-1 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ceritinib": {
    "genericName": "ceritinib",
    "drugClass": "ALK inhibitor",
    "therapyClass": "ALK inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "chlorambucil": {
    "genericName": "chlorambucil",
    "drugClass": "alkylating agent",
    "therapyClass": "alkylating agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ciltacabtagene autoleucel": {
    "genericName": "ciltacabtagene autoleucel",
    "drugClass": "BCMA CAR-T",
    "therapyClass": "BCMA CAR-T",
    "cvToxicity": [],
    "anthracycline": false
  },
  "cladribine": {
    "genericName": "cladribine",
    "drugClass": "purine analogue",
    "therapyClass": "purine analogue",
    "cvToxicity": [],
    "anthracycline": false
  },
  "clofarabine": {
    "genericName": "clofarabine",
    "drugClass": "purine analogue",
    "therapyClass": "purine analogue",
    "cvToxicity": [],
    "anthracycline": false
  },
  "cobimetinib": {
    "genericName": "cobimetinib",
    "drugClass": "MEK inhibitor",
    "therapyClass": "RAF/MEK pathway inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "crizotinib": {
    "genericName": "crizotinib",
    "drugClass": "ALK/ROS1/MET TKI",
    "therapyClass": "ALK/ROS1/MET TKI",
    "cvToxicity": [],
    "anthracycline": false
  },
  "dabrafenib": {
    "genericName": "dabrafenib",
    "drugClass": "BRAF inhibitor",
    "therapyClass": "RAF/MEK pathway inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "dactinomycin": {
    "genericName": "dactinomycin",
    "drugClass": "antitumour antibiotic",
    "therapyClass": "antitumour antibiotic",
    "cvToxicity": [],
    "anthracycline": false
  },
  "darolutamide": {
    "genericName": "darolutamide",
    "drugClass": "androgen receptor inhibitor",
    "therapyClass": "androgen receptor inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "dasatinib": {
    "genericName": "dasatinib",
    "drugClass": "BCR-ABL tyrosine kinase inhibitor",
    "therapyClass": "BCR-ABL TKI",
    "cvToxicity": [],
    "anthracycline": false
  },
  "datopotamab deruxtecan": {
    "genericName": "datopotamab deruxtecan",
    "drugClass": "ADC",
    "therapyClass": "ADC",
    "cvToxicity": [],
    "anthracycline": false
  },
  "decitabine": {
    "genericName": "decitabine",
    "drugClass": "hypomethylating agent",
    "therapyClass": "hypomethylating agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "degarelix": {
    "genericName": "degarelix",
    "drugClass": "GnRH antagonist",
    "therapyClass": "GnRH antagonist",
    "cvToxicity": [],
    "anthracycline": false
  },
  "denosumab": {
    "genericName": "denosumab",
    "drugClass": "RANKL inhibitor",
    "therapyClass": "RANKL inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "dostarlimab": {
    "genericName": "dostarlimab",
    "drugClass": "PD-1 inhibitor",
    "therapyClass": "PD-1 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "elranatamab": {
    "genericName": "elranatamab",
    "drugClass": "BCMAxCD3 bispecific",
    "therapyClass": "BCMAxCD3 bispecific",
    "cvToxicity": [],
    "anthracycline": false
  },
  "enasidenib": {
    "genericName": "enasidenib",
    "drugClass": "IDH2 inhibitor",
    "therapyClass": "IDH2 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "encorafenib": {
    "genericName": "encorafenib",
    "drugClass": "BRAF inhibitor",
    "therapyClass": "RAF/MEK pathway inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "enfortumab vedotin": {
    "genericName": "enfortumab vedotin",
    "drugClass": "antibody-drug conjugate",
    "therapyClass": "antibody-drug conjugate",
    "cvToxicity": [],
    "anthracycline": false
  },
  "entrectinib": {
    "genericName": "entrectinib",
    "drugClass": "TRK/ROS1/ALK TKI",
    "therapyClass": "TRK/ROS1/ALK TKI",
    "cvToxicity": [],
    "anthracycline": false
  },
  "enzalutamide": {
    "genericName": "enzalutamide",
    "drugClass": "androgen receptor inhibitor",
    "therapyClass": "androgen receptor inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "epcoritamab": {
    "genericName": "epcoritamab",
    "drugClass": "CD20xCD3 bispecific",
    "therapyClass": "CD20xCD3 bispecific",
    "cvToxicity": [],
    "anthracycline": false
  },
  "epirubicin": {
    "genericName": "epirubicin",
    "drugClass": "anthracycline",
    "therapyClass": "anthracycline",
    "cvToxicity": [],
    "anthracycline": true
  },
  "eprenetapopt": {
    "genericName": "eprenetapopt",
    "drugClass": "targeted",
    "therapyClass": "targeted",
    "cvToxicity": [],
    "anthracycline": false
  },
  "eribulin": {
    "genericName": "eribulin",
    "drugClass": "microtubule inhibitor",
    "therapyClass": "microtubule inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "everolimus": {
    "genericName": "everolimus",
    "drugClass": "mTOR inhibitor",
    "therapyClass": "mTOR inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "exemestane": {
    "genericName": "exemestane",
    "drugClass": "aromatase inhibitor",
    "therapyClass": "aromatase inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "fam-trastuzumab deruxtecan-nxki": {
    "genericName": "fam-trastuzumab deruxtecan-nxki",
    "drugClass": "ADC",
    "therapyClass": "ADC",
    "cvToxicity": [],
    "anthracycline": false
  },
  "flutamide": {
    "genericName": "flutamide",
    "drugClass": "endocrine",
    "therapyClass": "endocrine",
    "cvToxicity": [],
    "anthracycline": false
  },
  "fosaprepitant": {
    "genericName": "fosaprepitant",
    "drugClass": "NK1 antagonist prodrug",
    "therapyClass": "NK1 antagonist prodrug",
    "cvToxicity": [],
    "anthracycline": false
  },
  "fulvestrant": {
    "genericName": "fulvestrant",
    "drugClass": "SERD",
    "therapyClass": "SERD",
    "cvToxicity": [],
    "anthracycline": false
  },
  "futibatinib": {
    "genericName": "futibatinib",
    "drugClass": "FGFR inhibitor",
    "therapyClass": "FGFR inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "gemtuzumab ozogamicin": {
    "genericName": "gemtuzumab ozogamicin",
    "drugClass": "antibody-drug conjugate",
    "therapyClass": "antibody-drug conjugate",
    "cvToxicity": [],
    "anthracycline": false
  },
  "gilteritinib": {
    "genericName": "gilteritinib",
    "drugClass": "FLT3 inhibitor",
    "therapyClass": "FLT3 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "glofitamab": {
    "genericName": "glofitamab",
    "drugClass": "CD20xCD3 bispecific",
    "therapyClass": "CD20xCD3 bispecific",
    "cvToxicity": [],
    "anthracycline": false
  },
  "glucarpidase": {
    "genericName": "glucarpidase",
    "drugClass": "methotrexate rescue enzyme",
    "therapyClass": "methotrexate rescue enzyme",
    "cvToxicity": [],
    "anthracycline": false
  },
  "goserelin": {
    "genericName": "goserelin",
    "drugClass": "GnRH agonist",
    "therapyClass": "GnRH agonist",
    "cvToxicity": [],
    "anthracycline": false
  },
  "hydrocortisone": {
    "genericName": "hydrocortisone",
    "drugClass": "corticosteroid",
    "therapyClass": "corticosteroid",
    "cvToxicity": [],
    "anthracycline": false
  },
  "hydroxyurea": {
    "genericName": "hydroxyurea",
    "drugClass": "antimetabolite",
    "therapyClass": "antimetabolite",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ibrutinib": {
    "genericName": "ibrutinib",
    "drugClass": "BTK inhibitor",
    "therapyClass": "BTK inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "idecabtagene vicleucel": {
    "genericName": "idecabtagene vicleucel",
    "drugClass": "BCMA CAR-T",
    "therapyClass": "BCMA CAR-T",
    "cvToxicity": [],
    "anthracycline": false
  },
  "imatinib": {
    "genericName": "imatinib",
    "drugClass": "BCR-ABL tyrosine kinase inhibitor",
    "therapyClass": "BCR-ABL TKI",
    "cvToxicity": [],
    "anthracycline": false
  },
  "imetelstat": {
    "genericName": "imetelstat",
    "drugClass": "targeted",
    "therapyClass": "targeted",
    "cvToxicity": [],
    "anthracycline": false
  },
  "inotuzumab ozogamicin": {
    "genericName": "inotuzumab ozogamicin",
    "drugClass": "CD22 antibody-drug conjugate",
    "therapyClass": "CD22 antibody-drug conjugate",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ipilimumab": {
    "genericName": "ipilimumab",
    "drugClass": "CTLA-4 inhibitor",
    "therapyClass": "immune checkpoint inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "isatuximab": {
    "genericName": "isatuximab",
    "drugClass": "anti-CD38 monoclonal antibody",
    "therapyClass": "anti-CD38 monoclonal antibody",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ivosidenib": {
    "genericName": "ivosidenib",
    "drugClass": "IDH1 inhibitor",
    "therapyClass": "IDH1 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ixazomib": {
    "genericName": "ixazomib",
    "drugClass": "proteasome inhibitor",
    "therapyClass": "proteasome inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "larotrectinib": {
    "genericName": "larotrectinib",
    "drugClass": "TRK inhibitor",
    "therapyClass": "TRK inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "lazertinib": {
    "genericName": "lazertinib",
    "drugClass": "EGFR inhibitor",
    "therapyClass": "EGFR inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "lenvatinib": {
    "genericName": "lenvatinib",
    "drugClass": "multikinase inhibitor",
    "therapyClass": "VEGF/VEGFR-directed therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "letrozole": {
    "genericName": "letrozole",
    "drugClass": "aromatase inhibitor",
    "therapyClass": "aromatase inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "leuprolide": {
    "genericName": "leuprolide",
    "drugClass": "GnRH agonist",
    "therapyClass": "GnRH agonist",
    "cvToxicity": [],
    "anthracycline": false
  },
  "linvoseltamab": {
    "genericName": "linvoseltamab",
    "drugClass": "bispecific",
    "therapyClass": "bispecific",
    "cvToxicity": [],
    "anthracycline": false
  },
  "liposomal daunorubicin": {
    "genericName": "liposomal daunorubicin",
    "drugClass": "anticancer agent — verify",
    "therapyClass": "anticancer agent — verify",
    "cvToxicity": [],
    "anthracycline": false
  },
  "liposomal doxorubicin": {
    "genericName": "liposomal doxorubicin",
    "drugClass": "anthracycline",
    "therapyClass": "anthracycline",
    "cvToxicity": [],
    "anthracycline": true
  },
  "lisocabtagene maraleucel": {
    "genericName": "lisocabtagene maraleucel",
    "drugClass": "CD19 CAR-T",
    "therapyClass": "CD19 CAR-T",
    "cvToxicity": [],
    "anthracycline": false
  },
  "lomustine": {
    "genericName": "lomustine",
    "drugClass": "nitrosourea alkylating agent",
    "therapyClass": "nitrosourea alkylating agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "loncastuximab tesirine": {
    "genericName": "loncastuximab tesirine",
    "drugClass": "ADC",
    "therapyClass": "ADC",
    "cvToxicity": [],
    "anthracycline": false
  },
  "lorlatinib": {
    "genericName": "lorlatinib",
    "drugClass": "ALK/ROS1 TKI",
    "therapyClass": "ALK/ROS1 TKI",
    "cvToxicity": [],
    "anthracycline": false
  },
  "lurbinectedin": {
    "genericName": "lurbinectedin",
    "drugClass": "RNA polymerase II inhibitor",
    "therapyClass": "RNA polymerase II inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "luspatercept": {
    "genericName": "luspatercept",
    "drugClass": "erythroid maturation agent",
    "therapyClass": "erythroid maturation agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "lutetium lu 177 dotatate": {
    "genericName": "lutetium lu 177 dotatate",
    "drugClass": "somatostatin receptor radioligand",
    "therapyClass": "somatostatin receptor radioligand",
    "cvToxicity": [],
    "anthracycline": false
  },
  "lutetium lu 177 vipivotide tetraxetan": {
    "genericName": "lutetium lu 177 vipivotide tetraxetan",
    "drugClass": "PSMA-directed radioligand",
    "therapyClass": "PSMA-directed radioligand",
    "cvToxicity": [],
    "anthracycline": false
  },
  "margetuximab": {
    "genericName": "margetuximab",
    "drugClass": "HER2 monoclonal antibody",
    "therapyClass": "HER2-targeted therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "melphalan": {
    "genericName": "melphalan",
    "drugClass": "alkylating agent",
    "therapyClass": "alkylating agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "mesna": {
    "genericName": "mesna",
    "drugClass": "uroprotective agent",
    "therapyClass": "uroprotective agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "midostaurin": {
    "genericName": "midostaurin",
    "drugClass": "FLT3 inhibitor",
    "therapyClass": "FLT3 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "mirvetuximab soravtansine": {
    "genericName": "mirvetuximab soravtansine",
    "drugClass": "FRα antibody-drug conjugate",
    "therapyClass": "FRα antibody-drug conjugate",
    "cvToxicity": [],
    "anthracycline": false
  },
  "mitomycin": {
    "genericName": "mitomycin",
    "drugClass": "antitumour antibiotic",
    "therapyClass": "antitumour antibiotic",
    "cvToxicity": [],
    "anthracycline": false
  },
  "mitotane": {
    "genericName": "mitotane",
    "drugClass": "adrenolytic agent",
    "therapyClass": "adrenolytic agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "mitoxantrone": {
    "genericName": "mitoxantrone",
    "drugClass": "anthracycline-like/topoisomerase II inhibitor",
    "therapyClass": "anthracycline-like",
    "cvToxicity": [],
    "anthracycline": true
  },
  "mobocertinib": {
    "genericName": "mobocertinib",
    "drugClass": "targeted",
    "therapyClass": "targeted",
    "cvToxicity": [],
    "anthracycline": false
  },
  "mosunetuzumab": {
    "genericName": "mosunetuzumab",
    "drugClass": "CD20xCD3 bispecific",
    "therapyClass": "CD20xCD3 bispecific",
    "cvToxicity": [],
    "anthracycline": false
  },
  "nedaplatin": {
    "genericName": "nedaplatin",
    "drugClass": "platinum",
    "therapyClass": "platinum",
    "cvToxicity": [],
    "anthracycline": false
  },
  "nelarabine": {
    "genericName": "nelarabine",
    "drugClass": "purine nucleoside analogue",
    "therapyClass": "purine nucleoside analogue",
    "cvToxicity": [],
    "anthracycline": false
  },
  "neratinib": {
    "genericName": "neratinib",
    "drugClass": "HER2 TKI",
    "therapyClass": "HER2 TKI",
    "cvToxicity": [],
    "anthracycline": false
  },
  "nilotinib": {
    "genericName": "nilotinib",
    "drugClass": "BCR-ABL tyrosine kinase inhibitor",
    "therapyClass": "BCR-ABL TKI",
    "cvToxicity": [],
    "anthracycline": false
  },
  "nilutamide": {
    "genericName": "nilutamide",
    "drugClass": "endocrine",
    "therapyClass": "endocrine",
    "cvToxicity": [],
    "anthracycline": false
  },
  "niraparib": {
    "genericName": "niraparib",
    "drugClass": "PARP inhibitor",
    "therapyClass": "PARP inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "obinutuzumab": {
    "genericName": "obinutuzumab",
    "drugClass": "anti-CD20 monoclonal antibody",
    "therapyClass": "anti-CD20 monoclonal antibody",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ofatumumab": {
    "genericName": "ofatumumab",
    "drugClass": "anti-CD20 monoclonal antibody",
    "therapyClass": "anti-CD20 monoclonal antibody",
    "cvToxicity": [],
    "anthracycline": false
  },
  "olanzapine": {
    "genericName": "olanzapine",
    "drugClass": "supportive",
    "therapyClass": "supportive",
    "cvToxicity": [],
    "anthracycline": false
  },
  "olaparib": {
    "genericName": "olaparib",
    "drugClass": "PARP inhibitor",
    "therapyClass": "PARP inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "osimertinib": {
    "genericName": "osimertinib",
    "drugClass": "EGFR TKI",
    "therapyClass": "EGFR TKI",
    "cvToxicity": [],
    "anthracycline": false
  },
  "palbociclib": {
    "genericName": "palbociclib",
    "drugClass": "CDK4/6 inhibitor",
    "therapyClass": "CDK4/6 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "palonosetron": {
    "genericName": "palonosetron",
    "drugClass": "5-HT3 antagonist",
    "therapyClass": "5-HT3 antagonist",
    "cvToxicity": [],
    "anthracycline": false
  },
  "panitumumab": {
    "genericName": "panitumumab",
    "drugClass": "EGFR monoclonal antibody",
    "therapyClass": "EGFR monoclonal antibody",
    "cvToxicity": [],
    "anthracycline": false
  },
  "patritumab deruxtecan": {
    "genericName": "patritumab deruxtecan",
    "drugClass": "ADC",
    "therapyClass": "ADC",
    "cvToxicity": [],
    "anthracycline": false
  },
  "pazopanib": {
    "genericName": "pazopanib",
    "drugClass": "multikinase inhibitor",
    "therapyClass": "VEGF/VEGFR-directed therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "pegaspargase": {
    "genericName": "pegaspargase",
    "drugClass": "enzyme therapy",
    "therapyClass": "enzyme therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "pegfilgrastim": {
    "genericName": "pegfilgrastim",
    "drugClass": "long-acting G-CSF",
    "therapyClass": "long-acting G-CSF",
    "cvToxicity": [],
    "anthracycline": false
  },
  "pemigatinib": {
    "genericName": "pemigatinib",
    "drugClass": "FGFR inhibitor",
    "therapyClass": "FGFR inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "pirtobrutinib": {
    "genericName": "pirtobrutinib",
    "drugClass": "non-covalent BTK inhibitor",
    "therapyClass": "non-covalent BTK inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "polatuzumab vedotin": {
    "genericName": "polatuzumab vedotin",
    "drugClass": "anti-CD79b antibody-drug conjugate",
    "therapyClass": "anti-CD79b antibody-drug conjugate",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ponatinib": {
    "genericName": "ponatinib",
    "drugClass": "BCR-ABL tyrosine kinase inhibitor",
    "therapyClass": "BCR-ABL TKI",
    "cvToxicity": [],
    "anthracycline": false
  },
  "pralsetinib": {
    "genericName": "pralsetinib",
    "drugClass": "RET inhibitor",
    "therapyClass": "RET inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "procarbazine": {
    "genericName": "procarbazine",
    "drugClass": "alkylating agent",
    "therapyClass": "alkylating agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "pyrotinib": {
    "genericName": "pyrotinib",
    "drugClass": "targeted",
    "therapyClass": "targeted",
    "cvToxicity": [],
    "anthracycline": false
  },
  "quizartinib": {
    "genericName": "quizartinib",
    "drugClass": "FLT3 inhibitor",
    "therapyClass": "FLT3 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "radiotherapy": {
    "genericName": "radiotherapy",
    "drugClass": "treatment modality",
    "therapyClass": "treatment modality",
    "cvToxicity": [],
    "anthracycline": false
  },
  "radium ra 223 dichloride": {
    "genericName": "radium ra 223 dichloride",
    "drugClass": "alpha-emitting radiopharmaceutical",
    "therapyClass": "alpha-emitting radiopharmaceutical",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ramucirumab": {
    "genericName": "ramucirumab",
    "drugClass": "VEGFR2 monoclonal antibody",
    "therapyClass": "VEGF/VEGFR-directed therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "rasburicase": {
    "genericName": "rasburicase",
    "drugClass": "urate oxidase",
    "therapyClass": "urate oxidase",
    "cvToxicity": [],
    "anthracycline": false
  },
  "regorafenib": {
    "genericName": "regorafenib",
    "drugClass": "multikinase inhibitor",
    "therapyClass": "multikinase inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "relatlimab": {
    "genericName": "relatlimab",
    "drugClass": "LAG-3 inhibitor",
    "therapyClass": "LAG-3 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "relugolix": {
    "genericName": "relugolix",
    "drugClass": "GnRH antagonist",
    "therapyClass": "GnRH antagonist",
    "cvToxicity": [],
    "anthracycline": false
  },
  "repotrectinib": {
    "genericName": "repotrectinib",
    "drugClass": "ROS1/TRK/ALK inhibitor",
    "therapyClass": "ROS1/TRK/ALK inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ribociclib": {
    "genericName": "ribociclib",
    "drugClass": "CDK4/6 inhibitor",
    "therapyClass": "CDK4/6 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ripretinib": {
    "genericName": "ripretinib",
    "drugClass": "KIT/PDGFRA switch-control inhibitor",
    "therapyClass": "KIT/PDGFRA switch-control inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ritlecitinib": {
    "genericName": "ritlecitinib",
    "drugClass": "targeted",
    "therapyClass": "targeted",
    "cvToxicity": [],
    "anthracycline": false
  },
  "rucaparib": {
    "genericName": "rucaparib",
    "drugClass": "PARP inhibitor",
    "therapyClass": "PARP inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "sacituzumab govitecan": {
    "genericName": "sacituzumab govitecan",
    "drugClass": "TROP2 antibody-drug conjugate",
    "therapyClass": "TROP2 antibody-drug conjugate",
    "cvToxicity": [],
    "anthracycline": false
  },
  "sacituzumab govitecan-hziy": {
    "genericName": "sacituzumab govitecan-hziy",
    "drugClass": "TROP2 antibody-drug conjugate",
    "therapyClass": "TROP2 antibody-drug conjugate",
    "cvToxicity": [],
    "anthracycline": false
  },
  "selinexor": {
    "genericName": "selinexor",
    "drugClass": "targeted",
    "therapyClass": "targeted",
    "cvToxicity": [],
    "anthracycline": false
  },
  "selpercatinib": {
    "genericName": "selpercatinib",
    "drugClass": "RET inhibitor",
    "therapyClass": "RET inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "selumetinib": {
    "genericName": "selumetinib",
    "drugClass": "targeted",
    "therapyClass": "targeted",
    "cvToxicity": [],
    "anthracycline": false
  },
  "sirolimus": {
    "genericName": "sirolimus",
    "drugClass": "mTOR inhibitor",
    "therapyClass": "mTOR inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "sonidegib": {
    "genericName": "sonidegib",
    "drugClass": "Hedgehog pathway inhibitor",
    "therapyClass": "Hedgehog pathway inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "sorafenib": {
    "genericName": "sorafenib",
    "drugClass": "multikinase inhibitor",
    "therapyClass": "VEGF/VEGFR-directed therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "sotorasib": {
    "genericName": "sotorasib",
    "drugClass": "KRAS G12C inhibitor",
    "therapyClass": "KRAS G12C inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "sunitinib": {
    "genericName": "sunitinib",
    "drugClass": "multikinase inhibitor",
    "therapyClass": "VEGF/VEGFR-directed therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "tafasitamab": {
    "genericName": "tafasitamab",
    "drugClass": "CD19 monoclonal antibody",
    "therapyClass": "CD19 monoclonal antibody",
    "cvToxicity": [],
    "anthracycline": false
  },
  "talazoparib": {
    "genericName": "talazoparib",
    "drugClass": "PARP inhibitor",
    "therapyClass": "PARP inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "talquetamab": {
    "genericName": "talquetamab",
    "drugClass": "GPRC5DxCD3 bispecific",
    "therapyClass": "GPRC5DxCD3 bispecific",
    "cvToxicity": [],
    "anthracycline": false
  },
  "tamoxifen": {
    "genericName": "tamoxifen",
    "drugClass": "SERM",
    "therapyClass": "SERM",
    "cvToxicity": [],
    "anthracycline": false
  },
  "tarlatamab": {
    "genericName": "tarlatamab",
    "drugClass": "DLL3xCD3 bispecific",
    "therapyClass": "DLL3xCD3 bispecific",
    "cvToxicity": [],
    "anthracycline": false
  },
  "tebentafusp": {
    "genericName": "tebentafusp",
    "drugClass": "gp100xCD3 bispecific",
    "therapyClass": "gp100xCD3 bispecific",
    "cvToxicity": [],
    "anthracycline": false
  },
  "teclistamab": {
    "genericName": "teclistamab",
    "drugClass": "BCMAxCD3 bispecific",
    "therapyClass": "BCMAxCD3 bispecific",
    "cvToxicity": [],
    "anthracycline": false
  },
  "temozolomide": {
    "genericName": "temozolomide",
    "drugClass": "alkylating agent",
    "therapyClass": "alkylating agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "temsirolimus": {
    "genericName": "temsirolimus",
    "drugClass": "mTOR inhibitor",
    "therapyClass": "mTOR inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "teniposide": {
    "genericName": "teniposide",
    "drugClass": "topoisomerase II inhibitor",
    "therapyClass": "topoisomerase II inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "tepotinib": {
    "genericName": "tepotinib",
    "drugClass": "MET inhibitor",
    "therapyClass": "MET inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "thalidomide": {
    "genericName": "thalidomide",
    "drugClass": "immunomodulatory agent",
    "therapyClass": "immunomodulatory agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "thiotepa": {
    "genericName": "thiotepa",
    "drugClass": "alkylating agent",
    "therapyClass": "alkylating agent",
    "cvToxicity": [],
    "anthracycline": false
  },
  "tisagenlecleucel": {
    "genericName": "tisagenlecleucel",
    "drugClass": "CD19 CAR-T",
    "therapyClass": "CD19 CAR-T",
    "cvToxicity": [],
    "anthracycline": false
  },
  "tisotumab vedotin": {
    "genericName": "tisotumab vedotin",
    "drugClass": "tissue factor antibody-drug conjugate",
    "therapyClass": "tissue factor antibody-drug conjugate",
    "cvToxicity": [],
    "anthracycline": false
  },
  "tivozanib": {
    "genericName": "tivozanib",
    "drugClass": "VEGFR inhibitor",
    "therapyClass": "VEGFR inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "topotecan": {
    "genericName": "topotecan",
    "drugClass": "topoisomerase I inhibitor",
    "therapyClass": "topoisomerase I inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "trabectedin": {
    "genericName": "trabectedin",
    "drugClass": "transcription inhibitor",
    "therapyClass": "transcription inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "trametinib": {
    "genericName": "trametinib",
    "drugClass": "MEK inhibitor",
    "therapyClass": "RAF/MEK pathway inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "trastuzumab deruxtecan": {
    "genericName": "trastuzumab deruxtecan",
    "drugClass": "HER2 antibody-drug conjugate",
    "therapyClass": "HER2-targeted therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "trastuzumab emtansine": {
    "genericName": "trastuzumab emtansine",
    "drugClass": "HER2 antibody-drug conjugate",
    "therapyClass": "HER2-targeted therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "tremelimumab": {
    "genericName": "tremelimumab",
    "drugClass": "CTLA-4 inhibitor",
    "therapyClass": "CTLA-4 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "trifluridine/tipiracil": {
    "genericName": "trifluridine/tipiracil",
    "drugClass": "oral nucleoside analogue",
    "therapyClass": "oral nucleoside analogue",
    "cvToxicity": [],
    "anthracycline": false
  },
  "tucatinib": {
    "genericName": "tucatinib",
    "drugClass": "HER2 TKI",
    "therapyClass": "HER2 TKI",
    "cvToxicity": [],
    "anthracycline": false
  },
  "vemurafenib": {
    "genericName": "vemurafenib",
    "drugClass": "BRAF inhibitor",
    "therapyClass": "RAF/MEK pathway inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "vinorelbine": {
    "genericName": "vinorelbine",
    "drugClass": "vinca alkaloid",
    "therapyClass": "vinca alkaloid",
    "cvToxicity": [],
    "anthracycline": false
  },
  "vismodegib": {
    "genericName": "vismodegib",
    "drugClass": "Hedgehog pathway inhibitor",
    "therapyClass": "Hedgehog pathway inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "vorasidenib": {
    "genericName": "vorasidenib",
    "drugClass": "IDH1/2 inhibitor",
    "therapyClass": "IDH1/2 inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "zanubrutinib": {
    "genericName": "zanubrutinib",
    "drugClass": "BTK inhibitor",
    "therapyClass": "BTK inhibitor",
    "cvToxicity": [],
    "anthracycline": false
  },
  "ziv-aflibercept": {
    "genericName": "ziv-aflibercept",
    "drugClass": "VEGF trap",
    "therapyClass": "VEGF/VEGFR-directed therapy",
    "cvToxicity": [],
    "anthracycline": false
  },
  "zoledronic acid": {
    "genericName": "zoledronic acid",
    "drugClass": "bisphosphonate",
    "therapyClass": "bisphosphonate",
    "cvToxicity": [],
    "anthracycline": false
  }
};

/** The regimen library. */
export const LIBRARY_REGIMENS = [
  {
    "id": "aml_73",
    "name": "7+3",
    "cancerType": "acute myeloid leukemia",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cytarabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "daunorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "daunorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "induction"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ]
  },
  {
    "id": "aml_73_ida",
    "name": "7+3 with idarubicin",
    "cancerType": "acute myeloid leukemia",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cytarabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "idarubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "idarubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "induction"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ]
  },
  {
    "id": "aml_ven_aza",
    "name": "Azacitidine + venetoclax",
    "cancerType": "acute myeloid leukemia",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "azacitidine",
            "drugClass": "hypomethylating agent",
            "therapyClass": "epigenetic/cytotoxic therapy"
          },
          {
            "genericName": "venetoclax",
            "drugClass": "BCL-2 inhibitor",
            "therapyClass": "targeted therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "azacitidine",
        "drugClass": "hypomethylating agent",
        "therapyClass": "epigenetic/cytotoxic therapy"
      },
      {
        "genericName": "venetoclax",
        "drugClass": "BCL-2 inhibitor",
        "therapyClass": "targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "newly diagnosed",
      "unfit"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true
  },
  {
    "id": "aml_flag_ida",
    "name": "FLAG-Ida",
    "cancerType": "acute myeloid leukemia",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "fludarabine",
            "drugClass": "purine analog",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "cytarabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "idarubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "filgrastim",
            "drugClass": "G-CSF",
            "therapyClass": "supportive biologic"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "fludarabine",
        "drugClass": "purine analog",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "idarubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "filgrastim",
        "drugClass": "G-CSF",
        "therapyClass": "supportive biologic"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_AML"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "salvage"
    ],
    "intent": [
      "salvage"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "dlbcl_rchop",
    "name": "R-CHOP",
    "cancerType": "aggressive B-cell lymphoma",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "rituximab",
            "drugClass": "anti-CD20 monoclonal antibody",
            "therapyClass": "anti-CD20/biologic"
          },
          {
            "genericName": "cyclophosphamide",
            "drugClass": "alkylating agent",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "vincristine",
            "drugClass": "vinca alkaloid",
            "therapyClass": "vinca alkaloid"
          },
          {
            "genericName": "prednisone",
            "drugClass": "corticosteroid",
            "therapyClass": "corticosteroid"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20/biologic"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_BCELL",
      "NCI_RCHOP",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq",
      "https://www.cancer.gov/about-cancer/treatment/drugs/r-chop",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "RCHOP",
      "rituximab CHOP"
    ],
    "settings": [
      "first-line"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lymphoma_rmini_chop",
    "name": "R-mini-CHOP",
    "cancerType": "aggressive B-cell lymphoma",
    "tier": 2,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "rituximab",
            "drugClass": "anti-CD20 monoclonal antibody",
            "therapyClass": "anti-CD20/biologic"
          },
          {
            "genericName": "cyclophosphamide",
            "drugClass": "alkylating agent",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "vincristine",
            "drugClass": "vinca alkaloid",
            "therapyClass": "vinca alkaloid"
          },
          {
            "genericName": "prednisone",
            "drugClass": "corticosteroid",
            "therapyClass": "corticosteroid"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20/biologic"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_BCELL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "moderate"
    },
    "settings": [
      "first-line"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ]
  },
  {
    "id": "lymphoma_rdhax",
    "name": "R-DHAOx",
    "cancerType": "B-cell lymphoma",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "rituximab",
            "drugClass": "anti-CD20 monoclonal antibody",
            "therapyClass": "anti-CD20/biologic"
          },
          {
            "genericName": "dexamethasone",
            "drugClass": "corticosteroid",
            "therapyClass": "corticosteroid"
          },
          {
            "genericName": "cytarabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20/biologic"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "salvage"
    ],
    "intent": [
      "salvage"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lymphoma_rdhap",
    "name": "R-DHAP",
    "cancerType": "B-cell lymphoma",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "rituximab",
            "drugClass": "anti-CD20 monoclonal antibody",
            "therapyClass": "anti-CD20/biologic"
          },
          {
            "genericName": "dexamethasone",
            "drugClass": "corticosteroid",
            "therapyClass": "corticosteroid"
          },
          {
            "genericName": "cytarabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20/biologic"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "salvage"
    ],
    "intent": [
      "salvage"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "platinum"
    ],
    "aliases": [
      "RDHAP"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "biliary_cap",
    "name": "Capecitabine",
    "cancerType": "biliary/gallbladder",
    "tier": 2,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "capecitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "biliary_cisgem",
    "name": "Cisplatin + gemcitabine",
    "cancerType": "biliary/gallbladder",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "gemcitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "biliary_cisgem_durva",
    "name": "Cisplatin + gemcitabine + durvalumab",
    "cancerType": "biliary/gallbladder",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "gemcitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "durvalumab",
            "drugClass": "PD-L1 inhibitor",
            "therapyClass": "immune checkpoint inhibitor"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "durvalumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_ac",
    "name": "AC",
    "cancerType": "breast",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "cyclophosphamide",
            "drugClass": "alkylating agent",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "doxorubicin/cyclophosphamide"
    ],
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_ac_t",
    "name": "AC-T",
    "cancerType": "breast",
    "tier": 1,
    "phases": [
      {
        "id": "ac",
        "name": "AC",
        "sequence": 1,
        "agents": [
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "cyclophosphamide",
            "drugClass": "alkylating agent",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      },
      {
        "id": "taxane",
        "name": "Taxane",
        "sequence": 2,
        "agents": [
          {
            "genericName": "paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "AC followed by paclitaxel"
    ],
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_ac_th",
    "name": "AC-TH",
    "cancerType": "breast",
    "tier": 1,
    "phases": [
      {
        "id": "ac",
        "name": "AC",
        "sequence": 1,
        "agents": [
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "cyclophosphamide",
            "drugClass": "alkylating agent",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      },
      {
        "id": "th",
        "name": "TH",
        "sequence": 2,
        "agents": [
          {
            "genericName": "docetaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "trastuzumab",
            "drugClass": "HER2 monoclonal antibody",
            "therapyClass": "HER2-targeted therapy"
          }
        ]
      },
      {
        "id": "trastuzumab_maintenance",
        "name": "Trastuzumab maintenance",
        "sequence": 3,
        "agents": [
          {
            "genericName": "trastuzumab",
            "drugClass": "HER2 monoclonal antibody",
            "therapyClass": "HER2-targeted therapy"
          }
        ],
        "maintenance": true
      }
    ],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "ESC_CO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardio-oncology/"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "hasMaintenance": true,
    "cardioOncologyClasses": [
      "anthracycline",
      "HER2-targeted therapy"
    ],
    "notes": [
      "eviQ specifically describes 4 AC cycles followed by TH and subsequent trastuzumab; exact protocol details belong in a separate protocol-variant layer."
    ]
  },
  {
    "id": "breast_ddac_t",
    "name": "Dose-dense AC-T",
    "cancerType": "breast",
    "tier": 1,
    "phases": [
      {
        "id": "dose_dense_ac",
        "name": "Dose-dense AC",
        "sequence": 1,
        "agents": [
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "cyclophosphamide",
            "drugClass": "alkylating agent",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      },
      {
        "id": "taxane",
        "name": "Taxane",
        "sequence": 2,
        "agents": [
          {
            "genericName": "paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "ddAC-T",
      "ddAC then taxane"
    ],
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_pac_trast",
    "name": "Paclitaxel + trastuzumab",
    "cancerType": "breast",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "trastuzumab",
            "drugClass": "HER2 monoclonal antibody",
            "therapyClass": "HER2-targeted therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "ESC_CO",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardio-oncology/",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "HER2-targeted therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_tac",
    "name": "TAC",
    "cancerType": "breast",
    "tier": 2,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "docetaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "cyclophosphamide",
            "drugClass": "alkylating agent",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_tc",
    "name": "TC",
    "cancerType": "breast",
    "tier": 2,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "docetaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "cyclophosphamide",
            "drugClass": "alkylating agent",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_tchp",
    "name": "TCHP",
    "cancerType": "breast",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "docetaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "trastuzumab",
            "drugClass": "HER2 monoclonal antibody",
            "therapyClass": "HER2-targeted therapy"
          },
          {
            "genericName": "pertuzumab",
            "drugClass": "HER2 monoclonal antibody",
            "therapyClass": "HER2-targeted therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      },
      {
        "genericName": "pertuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "ESC_CO",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardio-oncology/",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "docetaxel-carboplatin-trastuzumab-pertuzumab"
    ],
    "settings": [
      "neoadjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "HER2-targeted therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_th",
    "name": "TH",
    "cancerType": "breast",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "docetaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "trastuzumab",
            "drugClass": "HER2 monoclonal antibody",
            "therapyClass": "HER2-targeted therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "ESC_CO",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardio-oncology/",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "HER2-targeted therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "cervix_carbo_pac",
    "name": "Carboplatin + paclitaxel",
    "cancerType": "cervical cancer",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "cervix_carbo_pac_bev",
    "name": "Carboplatin + paclitaxel + bevacizumab",
    "cancerType": "cervical cancer",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "bevacizumab",
            "drugClass": "VEGF inhibitor",
            "therapyClass": "VEGF/VEGFR-directed therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_GYN",
      "ESC_CO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological",
      "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardio-oncology/"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "cervix_carbo_pac_pembro",
    "name": "Carboplatin + paclitaxel + pembrolizumab",
    "cancerType": "cervical cancer",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "pembrolizumab",
            "drugClass": "PD-1 inhibitor",
            "therapyClass": "immune checkpoint inhibitor"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "cervix_cis_rt",
    "name": "Weekly cisplatin chemoradiation",
    "cancerType": "cervical cancer",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "locally advanced"
    ],
    "intent": [
      "curative"
    ],
    "cardioOncologyClasses": [
      "platinum"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hl_abvd",
    "name": "ABVD",
    "cancerType": "classical Hodgkin lymphoma",
    "tier": 2,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "bleomycin",
            "drugClass": "antibiotic antineoplastic",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "vinblastine",
            "drugClass": "vinca alkaloid",
            "therapyClass": "vinca alkaloid"
          },
          {
            "genericName": "dacarbazine",
            "drugClass": "alkylating-like agent",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "bleomycin",
        "drugClass": "antibiotic antineoplastic",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "vinblastine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "dacarbazine",
        "drugClass": "alkylating-like agent",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "NCI_HL",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/adult-hodgkin-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "moderate"
    },
    "settings": [
      "classical Hodgkin lymphoma"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "NCI describes N-AVD and BV-AVD as having replaced ABVD for advanced cHL; ABVD remains a viable option in cost-conscious settings."
    ]
  },
  {
    "id": "hl_bv_avd",
    "name": "BV-AVD",
    "cancerType": "classical Hodgkin lymphoma",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "brentuximab vedotin",
            "drugClass": "CD30 antibody-drug conjugate",
            "therapyClass": "antibody-drug conjugate"
          },
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "vinblastine",
            "drugClass": "vinca alkaloid",
            "therapyClass": "vinca alkaloid"
          },
          {
            "genericName": "dacarbazine",
            "drugClass": "alkylating-like agent",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "brentuximab vedotin",
        "drugClass": "CD30 antibody-drug conjugate",
        "therapyClass": "antibody-drug conjugate"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vinblastine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "dacarbazine",
        "drugClass": "alkylating-like agent",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "NCI_HL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/adult-hodgkin-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ]
  },
  {
    "id": "hl_n_avd",
    "name": "N-AVD",
    "cancerType": "classical Hodgkin lymphoma",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "nivolumab",
            "drugClass": "PD-1 inhibitor",
            "therapyClass": "immune checkpoint inhibitor"
          },
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "vinblastine",
            "drugClass": "vinca alkaloid",
            "therapyClass": "vinca alkaloid"
          },
          {
            "genericName": "dacarbazine",
            "drugClass": "alkylating-like agent",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vinblastine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "dacarbazine",
        "drugClass": "alkylating-like agent",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "NCI_HL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/adult-hodgkin-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline",
      "immune checkpoint inhibitor"
    ]
  },
  {
    "id": "crc_capecitabine",
    "name": "Capecitabine monotherapy",
    "cancerType": "colorectal",
    "tier": 2,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "capecitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "moderate"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "colorectal",
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_capox",
    "name": "CAPOX",
    "cancerType": "colorectal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "capecitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_RECTAL",
      "NCI_COLON"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "XELOX",
      "CAPOX"
    ],
    "settings": [
      "adjuvant",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "subtype": "colorectal",
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_capox_bev",
    "name": "CAPOX + bevacizumab",
    "cancerType": "colorectal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "capecitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "bevacizumab",
            "drugClass": "VEGF inhibitor",
            "therapyClass": "VEGF/VEGFR-directed therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "ESC_CO",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardio-oncology/",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "subtype": "colorectal",
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_folfiri",
    "name": "FOLFIRI",
    "cancerType": "colorectal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "irinotecan",
            "drugClass": "topoisomerase I inhibitor",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "leucovorin",
            "drugClass": "folate analog modulator",
            "therapyClass": "combination agent"
          },
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "irinotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate analog modulator",
        "therapyClass": "combination agent"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "aliases": [
      "FOLFIRI",
      "irinotecan + 5-FU/LV"
    ],
    "subtype": "colorectal",
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_folfiri_bev",
    "name": "FOLFIRI + bevacizumab",
    "cancerType": "colorectal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "irinotecan",
            "drugClass": "topoisomerase I inhibitor",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "leucovorin",
            "drugClass": "folate analog modulator",
            "therapyClass": "combination agent"
          },
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "bevacizumab",
            "drugClass": "VEGF inhibitor",
            "therapyClass": "VEGF/VEGFR-directed therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "irinotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate analog modulator",
        "therapyClass": "combination agent"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "ESC_CO",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardio-oncology/",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "subtype": "colorectal",
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_folfiri_cetux",
    "name": "FOLFIRI + cetuximab",
    "cancerType": "colorectal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "irinotecan",
            "drugClass": "topoisomerase I inhibitor",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "leucovorin",
            "drugClass": "folate analog modulator",
            "therapyClass": "combination agent"
          },
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "cetuximab",
            "drugClass": "EGFR monoclonal antibody",
            "therapyClass": "EGFR-targeted therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "irinotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate analog modulator",
        "therapyClass": "combination agent"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "cetuximab",
        "drugClass": "EGFR monoclonal antibody",
        "therapyClass": "EGFR-targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "subtype": "colorectal",
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_folfox",
    "name": "FOLFOX",
    "cancerType": "colorectal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "leucovorin",
            "drugClass": "folate analog modulator",
            "therapyClass": "combination agent"
          },
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate analog modulator",
        "therapyClass": "combination agent"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_RECTAL",
      "NCI_COLON"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "FOLFOX4",
      "FOLFOX6",
      "modified FOLFOX6",
      "mFOLFOX6"
    ],
    "settings": [
      "adjuvant",
      "neoadjuvant",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "notes": [
      "FOLFOX is a regimen family with multiple protocol variants; CORSC should not treat the family name as one universal dosing schedule.",
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ],
    "subtype": "colorectal"
  },
  {
    "id": "crc_folfox_bev",
    "name": "FOLFOX + bevacizumab",
    "cancerType": "colorectal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "leucovorin",
            "drugClass": "folate analog modulator",
            "therapyClass": "combination agent"
          },
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "bevacizumab",
            "drugClass": "VEGF inhibitor",
            "therapyClass": "VEGF/VEGFR-directed therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate analog modulator",
        "therapyClass": "combination agent"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "ESC_CO",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardio-oncology/",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "subtype": "colorectal",
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_folfoxiri",
    "name": "FOLFOXIRI",
    "cancerType": "colorectal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "irinotecan",
            "drugClass": "topoisomerase I inhibitor",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "leucovorin",
            "drugClass": "folate analog modulator",
            "therapyClass": "combination agent"
          },
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "irinotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate analog modulator",
        "therapyClass": "combination agent"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_RECTAL",
      "NCI_COLON"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "subtype": "colorectal",
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "fl_rchop",
    "name": "R-CHOP",
    "cancerType": "follicular lymphoma",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "rituximab",
            "drugClass": "anti-CD20 monoclonal antibody",
            "therapyClass": "anti-CD20/biologic"
          },
          {
            "genericName": "cyclophosphamide",
            "drugClass": "alkylating agent",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "vincristine",
            "drugClass": "vinca alkaloid",
            "therapyClass": "vinca alkaloid"
          },
          {
            "genericName": "prednisone",
            "drugClass": "corticosteroid",
            "therapyClass": "corticosteroid"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20/biologic"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_RCHOP",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/about-cancer/treatment/drugs/r-chop",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "aliases": [
      "RCHOP",
      "rituximab CHOP"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ugi_capox_trast",
    "name": "CAPOX + trastuzumab",
    "cancerType": "gastric/gastroesophageal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "capecitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "trastuzumab",
            "drugClass": "HER2 monoclonal antibody",
            "therapyClass": "HER2-targeted therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_UGI",
      "ESC_CO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal",
      "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardio-oncology/"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "HER2-targeted therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ugi_cis_fu_trast",
    "name": "Cisplatin + fluorouracil + trastuzumab",
    "cancerType": "gastric/gastroesophageal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "trastuzumab",
            "drugClass": "HER2 monoclonal antibody",
            "therapyClass": "HER2-targeted therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_UGI",
      "ESC_CO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal",
      "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardio-oncology/"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "HER2-targeted therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ugi_capox",
    "name": "CAPOX",
    "cancerType": "gastric/oesophageal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "capecitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "adjuvant",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ugi_capox_nivo",
    "name": "CAPOX + nivolumab",
    "cancerType": "gastric/oesophageal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "capecitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "nivolumab",
            "drugClass": "PD-1 inhibitor",
            "therapyClass": "immune checkpoint inhibitor"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ugi_flot",
    "name": "FLOT",
    "cancerType": "gastric/oesophageal",
    "tier": 1,
    "phases": [
      {
        "id": "pre_operative",
        "name": "Pre-operative",
        "sequence": 1,
        "agents": [
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "leucovorin",
            "drugClass": "folate analog modulator",
            "therapyClass": "combination agent"
          },
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "docetaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          }
        ]
      },
      {
        "id": "surgery",
        "name": "Surgery",
        "sequence": 2,
        "agents": [],
        "transitionCondition": "surgical interval"
      },
      {
        "id": "post_operative",
        "name": "Post-operative",
        "sequence": 3,
        "agents": [
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "leucovorin",
            "drugClass": "folate analog modulator",
            "therapyClass": "combination agent"
          },
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "docetaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate analog modulator",
        "therapyClass": "combination agent"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "perioperative",
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "eviQ describes four pre-operative and four post-operative cycles around surgery; the surgery interval is modeled as a non-drug phase.",
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ugi_folfox_nivo",
    "name": "FOLFOX + nivolumab",
    "cancerType": "gastric/oesophageal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "leucovorin",
            "drugClass": "folate analog modulator",
            "therapyClass": "combination agent"
          },
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "nivolumab",
            "drugClass": "PD-1 inhibitor",
            "therapyClass": "immune checkpoint inhibitor"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate analog modulator",
        "therapyClass": "combination agent"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ]
  },
  {
    "id": "ugi_folfox",
    "name": "modified FOLFOX6",
    "cancerType": "gastric/oesophageal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "leucovorin",
            "drugClass": "folate analog modulator",
            "therapyClass": "combination agent"
          },
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate analog modulator",
        "therapyClass": "combination agent"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_UGI",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "FOLFOX6"
    ],
    "settings": [
      "metastatic",
      "chemoradiation"
    ],
    "intent": [
      "palliative",
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_carbofu_cetux",
    "name": "Carboplatin + fluorouracil + cetuximab",
    "cancerType": "head and neck SCC",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "cetuximab",
            "drugClass": "EGFR monoclonal antibody",
            "therapyClass": "EGFR-targeted therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "cetuximab",
        "drugClass": "EGFR monoclonal antibody",
        "therapyClass": "EGFR-targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_carbofu_pembro",
    "name": "Carboplatin + fluorouracil + pembrolizumab",
    "cancerType": "head and neck SCC",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "pembrolizumab",
            "drugClass": "PD-1 inhibitor",
            "therapyClass": "immune checkpoint inhibitor"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_carbopac_pembro",
    "name": "Carboplatin + paclitaxel + pembrolizumab",
    "cancerType": "head and neck SCC",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "pembrolizumab",
            "drugClass": "PD-1 inhibitor",
            "therapyClass": "immune checkpoint inhibitor"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_cispofu_pembro",
    "name": "Cisplatin + fluorouracil + pembrolizumab",
    "cancerType": "head and neck SCC",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "pembrolizumab",
            "drugClass": "PD-1 inhibitor",
            "therapyClass": "immune checkpoint inhibitor"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "platinum"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_cis_rt",
    "name": "Cisplatin chemoradiation",
    "cancerType": "head and neck SCC",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "definitive",
      "post-operative"
    ],
    "intent": [
      "curative"
    ],
    "cardioOncologyClasses": [
      "platinum"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_tpf",
    "name": "TPF",
    "cancerType": "head and neck SCC",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "docetaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "induction"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lymphoma_rcvp",
    "name": "R-CVP",
    "cancerType": "indolent B-cell lymphoma",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "rituximab",
            "drugClass": "anti-CD20 monoclonal antibody",
            "therapyClass": "anti-CD20/biologic"
          },
          {
            "genericName": "cyclophosphamide",
            "drugClass": "alkylating agent",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "vincristine",
            "drugClass": "vinca alkaloid",
            "therapyClass": "vinca alkaloid"
          },
          {
            "genericName": "prednisone",
            "drugClass": "corticosteroid",
            "therapyClass": "corticosteroid"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20/biologic"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "first-line"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true
  },
  {
    "id": "lymphoma_rice",
    "name": "R-ICE",
    "cancerType": "lymphoma",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "rituximab",
            "drugClass": "anti-CD20 monoclonal antibody",
            "therapyClass": "anti-CD20/biologic"
          },
          {
            "genericName": "ifosfamide",
            "drugClass": "alkylating agent",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "etoposide",
            "drugClass": "topoisomerase II inhibitor",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20/biologic"
      },
      {
        "genericName": "ifosfamide",
        "drugClass": "alkylating agent",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "salvage"
    ],
    "intent": [
      "salvage"
    ],
    "combination": true,
    "aliases": [
      "RICE"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "meso_carbopem",
    "name": "Carboplatin + pemetrexed",
    "cancerType": "mesothelioma",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "pemetrexed",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "meso_cispem",
    "name": "Cisplatin + pemetrexed",
    "cancerType": "mesothelioma",
    "tier": 2,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "pemetrexed",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "platinum"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_dara_rvd",
    "name": "Dara-RVd",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "daratumumab",
            "drugClass": "anti-CD38 monoclonal antibody",
            "therapyClass": "anti-CD38/biologic"
          },
          {
            "genericName": "lenalidomide",
            "drugClass": "IMiD",
            "therapyClass": "immunomodulatory drug"
          },
          {
            "genericName": "bortezomib",
            "drugClass": "proteasome inhibitor",
            "therapyClass": "proteasome inhibitor"
          },
          {
            "genericName": "dexamethasone",
            "drugClass": "corticosteroid",
            "therapyClass": "corticosteroid"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "daratumumab",
        "drugClass": "anti-CD38 monoclonal antibody",
        "therapyClass": "anti-CD38/biologic"
      },
      {
        "genericName": "lenalidomide",
        "drugClass": "IMiD",
        "therapyClass": "immunomodulatory drug"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "newly diagnosed"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ]
  },
  {
    "id": "mm_pvd",
    "name": "PVd",
    "cancerType": "multiple myeloma",
    "tier": 2,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "pomalidomide",
            "drugClass": "IMiD",
            "therapyClass": "immunomodulatory drug"
          },
          {
            "genericName": "bortezomib",
            "drugClass": "proteasome inhibitor",
            "therapyClass": "proteasome inhibitor"
          },
          {
            "genericName": "dexamethasone",
            "drugClass": "corticosteroid",
            "therapyClass": "corticosteroid"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "pomalidomide",
        "drugClass": "IMiD",
        "therapyClass": "immunomodulatory drug"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed/refractory"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_rd",
    "name": "Rd",
    "cancerType": "multiple myeloma",
    "tier": 2,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "lenalidomide",
            "drugClass": "IMiD",
            "therapyClass": "immunomodulatory drug"
          },
          {
            "genericName": "dexamethasone",
            "drugClass": "corticosteroid",
            "therapyClass": "corticosteroid"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "lenalidomide",
        "drugClass": "IMiD",
        "therapyClass": "immunomodulatory drug"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "moderate"
    },
    "settings": [
      "multiple myeloma"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_rvd",
    "name": "RVd",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "lenalidomide",
            "drugClass": "IMiD",
            "therapyClass": "immunomodulatory drug"
          },
          {
            "genericName": "bortezomib",
            "drugClass": "proteasome inhibitor",
            "therapyClass": "proteasome inhibitor"
          },
          {
            "genericName": "dexamethasone",
            "drugClass": "corticosteroid",
            "therapyClass": "corticosteroid"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "lenalidomide",
        "drugClass": "IMiD",
        "therapyClass": "immunomodulatory drug"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "VRd"
    ],
    "settings": [
      "newly diagnosed"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ]
  },
  {
    "id": "mm_rvd_lite",
    "name": "RVd-lite",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "lenalidomide",
            "drugClass": "IMiD",
            "therapyClass": "immunomodulatory drug"
          },
          {
            "genericName": "bortezomib",
            "drugClass": "proteasome inhibitor",
            "therapyClass": "proteasome inhibitor"
          },
          {
            "genericName": "dexamethasone",
            "drugClass": "corticosteroid",
            "therapyClass": "corticosteroid"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "lenalidomide",
        "drugClass": "IMiD",
        "therapyClass": "immunomodulatory drug"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "newly diagnosed",
      "transplant-ineligible"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ]
  },
  {
    "id": "lung_carbopac",
    "name": "Carboplatin + paclitaxel",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_carbopac_pembro",
    "name": "Carboplatin + paclitaxel + pembrolizumab",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "pembrolizumab",
            "drugClass": "PD-1 inhibitor",
            "therapyClass": "immune checkpoint inhibitor"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_carbopem",
    "name": "Carboplatin + pemetrexed",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "pemetrexed",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_carbopem_pembro",
    "name": "Carboplatin + pemetrexed + pembrolizumab",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "pemetrexed",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "pembrolizumab",
            "drugClass": "PD-1 inhibitor",
            "therapyClass": "immune checkpoint inhibitor"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_cisgem",
    "name": "Cisplatin + gemcitabine",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "gemcitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "platinum"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_cispem",
    "name": "Cisplatin + pemetrexed",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "pemetrexed",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "platinum"
    ]
  },
  {
    "id": "ugi_carbopac_rt",
    "name": "Carboplatin + paclitaxel with radiation",
    "cancerType": "oesophageal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "definitive chemoradiation",
      "neoadjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ovary_bep",
    "name": "BEP",
    "cancerType": "ovarian germ-cell tumor",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "bleomycin",
            "drugClass": "antibiotic antineoplastic",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "etoposide",
            "drugClass": "topoisomerase II inhibitor",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "bleomycin",
        "drugClass": "antibiotic antineoplastic",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "germ-cell tumor"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "platinum"
    ]
  },
  {
    "id": "ovary_carbo_gem",
    "name": "Carboplatin + gemcitabine",
    "cancerType": "ovarian/fallopian tube/primary peritoneal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "gemcitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ovary_carbo_pac",
    "name": "Carboplatin + paclitaxel",
    "cancerType": "ovarian/fallopian tube/primary peritoneal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "adjuvant",
      "advanced"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ovary_carbo_pac_bev",
    "name": "Carboplatin + paclitaxel + bevacizumab",
    "cancerType": "ovarian/fallopian tube/primary peritoneal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "bevacizumab",
            "drugClass": "VEGF inhibitor",
            "therapyClass": "VEGF/VEGFR-directed therapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_GYN",
      "ESC_CO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological",
      "https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cardio-oncology/"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ovary_carbo_doxil",
    "name": "Carboplatin + pegylated liposomal doxorubicin",
    "cancerType": "ovarian/fallopian tube/primary peritoneal",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ]
  },
  {
    "id": "pan_folfirinox",
    "name": "FOLFIRINOX",
    "cancerType": "pancreatic",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "fluorouracil",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          },
          {
            "genericName": "leucovorin",
            "drugClass": "folate analog modulator",
            "therapyClass": "combination agent"
          },
          {
            "genericName": "irinotecan",
            "drugClass": "topoisomerase I inhibitor",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "oxaliplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate analog modulator",
        "therapyClass": "combination agent"
      },
      {
        "genericName": "irinotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "modified FOLFIRINOX",
      "mFOLFIRINOX"
    ],
    "settings": [
      "neoadjuvant",
      "adjuvant",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "pan_gem_cap",
    "name": "Gemcitabine + capecitabine",
    "cancerType": "pancreatic",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "gemcitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "capecitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "fluoropyrimidine"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "capecitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "pan_gem_nabpac",
    "name": "Gemcitabine + nab-paclitaxel",
    "cancerType": "pancreatic",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "gemcitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "nab-paclitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "nab-paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "prostate_cabazitaxel",
    "name": "Cabazitaxel + prednisolone",
    "cancerType": "prostate cancer",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cabazitaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          },
          {
            "genericName": "prednisolone",
            "drugClass": "corticosteroid",
            "therapyClass": "corticosteroid"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cabazitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "prednisolone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic castration-resistant"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true
  },
  {
    "id": "prostate_docetaxel",
    "name": "Docetaxel + androgen deprivation therapy",
    "cancerType": "prostate cancer",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "docetaxel",
            "drugClass": "taxane",
            "therapyClass": "taxane"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "metastatic castration-sensitive"
    ],
    "intent": [
      "palliative"
    ]
  },
  {
    "id": "sclc_platinum_etoposide",
    "name": "Platinum + etoposide",
    "cancerType": "small-cell lung cancer",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "etoposide",
            "drugClass": "topoisomerase II inhibitor",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_RESP",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "carboplatin-etoposide",
      "cisplatin-etoposide"
    ],
    "settings": [
      "limited-stage",
      "extensive-stage"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "testis_bep",
    "name": "BEP",
    "cancerType": "testicular germ-cell tumor",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "bleomycin",
            "drugClass": "antibiotic antineoplastic",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "etoposide",
            "drugClass": "topoisomerase II inhibitor",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "bleomycin",
        "drugClass": "antibiotic antineoplastic",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "germ-cell tumor"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "platinum"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "testis_ep",
    "name": "EP",
    "cancerType": "testicular germ-cell tumor",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "etoposide",
            "drugClass": "topoisomerase II inhibitor",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "germ-cell tumor"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "platinum"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "uro_carbgem",
    "name": "Carboplatin + gemcitabine",
    "cancerType": "urothelial cancer",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "carboplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "gemcitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "uro_cisgem",
    "name": "Cisplatin + gemcitabine",
    "cancerType": "urothelial cancer",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          },
          {
            "genericName": "gemcitabine",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "platinum"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "uro_ddmvac",
    "name": "Dose-dense MVAC",
    "cancerType": "urothelial cancer",
    "tier": 1,
    "phases": [
      {
        "id": "primary_regimen",
        "name": "Primary regimen",
        "sequence": 1,
        "agents": [
          {
            "genericName": "methotrexate",
            "drugClass": "antimetabolite",
            "therapyClass": "cytotoxic chemotherapy"
          },
          {
            "genericName": "vinblastine",
            "drugClass": "vinca alkaloid",
            "therapyClass": "vinca alkaloid"
          },
          {
            "genericName": "doxorubicin",
            "drugClass": "anthracycline",
            "therapyClass": "anthracycline"
          },
          {
            "genericName": "cisplatin",
            "drugClass": "platinum",
            "therapyClass": "platinum"
          }
        ]
      }
    ],
    "agents": [
      {
        "genericName": "methotrexate",
        "drugClass": "antimetabolite",
        "therapyClass": "cytotoxic chemotherapy"
      },
      {
        "genericName": "vinblastine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "ddMVAC"
    ],
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline",
      "platinum"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "all_a_bfm",
    "name": "ALL BFM-like chemotherapy",
    "cancerType": "acute lymphoblastic leukemia",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "asparaginase",
        "drugClass": "enzyme therapy",
        "therapyClass": "enzyme therapy"
      },
      {
        "genericName": "methotrexate",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "consolidation",
      "salvage"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "all_blinatumomab",
    "name": "Blinatumomab",
    "cancerType": "acute lymphoblastic leukemia",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "blinatumomab",
        "drugClass": "CD19-directed BiTE",
        "therapyClass": "CD19-directed BiTE"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "consolidation",
      "salvage"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "all_hypercvad",
    "name": "Hyper-CVAD",
    "cancerType": "acute lymphoblastic leukemia",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "methotrexate",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "induction",
      "consolidation",
      "salvage"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "all_hypercvad_inotuz",
    "name": "Hyper-CVAD + inotuzumab",
    "cancerType": "acute lymphoblastic leukemia",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "inotuzumab ozogamicin",
        "drugClass": "CD22 antibody-drug conjugate",
        "therapyClass": "CD22 antibody-drug conjugate"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "consolidation",
      "salvage"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "adrenocortical_carcinoma_edp_mitotane",
    "name": "EDP-mitotane",
    "cancerType": "adrenocortical carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "mitotane",
        "drugClass": "adrenolytic agent",
        "therapyClass": "adrenolytic agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "adrenocortical_carcinoma_mitotane",
    "name": "Mitotane",
    "cancerType": "adrenocortical carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "mitotane",
        "drugClass": "adrenolytic agent",
        "therapyClass": "adrenolytic agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "adrenocortical_edp",
    "name": "EDP + mitotane",
    "cancerType": "adrenocortical carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "mitotane",
        "drugClass": "adrenolytic agent",
        "therapyClass": "adrenolytic agent"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "dlbcl_da_r_epoch",
    "name": "DA-R-EPOCH",
    "cancerType": "aggressive B-cell lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lymphoma_rgemox",
    "name": "R-GemOx",
    "cancerType": "aggressive B-cell lymphoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "all_blinatumomab_mrd_positive",
    "name": "Blinatumomab MRD-positive",
    "cancerType": "ALL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "blinatumomab",
        "drugClass": "CD19-directed BiTE",
        "therapyClass": "CD19-directed BiTE"
      }
    ],
    "sources": [
      "NCI_ALL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-all-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "consolidation",
      "MRD-directed"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "all_hyper_cvad_blinatumomab",
    "name": "Hyper-CVAD + blinatumomab",
    "cancerType": "ALL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "blinatumomab",
        "drugClass": "CD19-directed BiTE",
        "therapyClass": "CD19-directed BiTE"
      }
    ],
    "sources": [
      "NCI_ALL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-all-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "all_inotuzumab_ozogamicin",
    "name": "Inotuzumab ozogamicin",
    "cancerType": "ALL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "inotuzumab ozogamicin",
        "drugClass": "CD22 antibody-drug conjugate",
        "therapyClass": "CD22 antibody-drug conjugate"
      }
    ],
    "sources": [
      "NCI_ALL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-all-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "all_nelarabine_based_t_all_therapy",
    "name": "Nelarabine-based T-ALL therapy",
    "cancerType": "ALL",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "nelarabine",
        "drugClass": "purine nucleoside analogue",
        "therapyClass": "purine nucleoside analogue"
      }
    ],
    "sources": [
      "NCI_ALL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-all-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "all_ponatinib_chemotherapy_for_ph_positive_all",
    "name": "Ponatinib + chemotherapy for Ph-positive ALL",
    "cancerType": "ALL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "ponatinib",
        "drugClass": "BCR-ABL tyrosine kinase inhibitor",
        "therapyClass": "BCR-ABL TKI"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "NCI_ALL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-all-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "aml_7_3_dauno",
    "name": "7+3 daunorubicin",
    "cancerType": "AML",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "daunorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "aml_7_3_ida",
    "name": "7+3 idarubicin",
    "cancerType": "AML",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "idarubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "aml_7_3_midostaurin",
    "name": "7+3 + midostaurin",
    "cancerType": "AML",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "daunorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "midostaurin",
        "drugClass": "FLT3 inhibitor",
        "therapyClass": "FLT3 inhibitor"
      }
    ],
    "sources": [
      "NCI_AML"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "induction"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "aml_7_3_mito",
    "name": "7+3 mitoxantrone",
    "cancerType": "AML",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "mitoxantrone",
        "drugClass": "anthracycline-like/topoisomerase II inhibitor",
        "therapyClass": "anthracycline-like"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline-like"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "aml_7_3_quizartinib",
    "name": "7+3 + quizartinib",
    "cancerType": "AML",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "daunorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "quizartinib",
        "drugClass": "FLT3 inhibitor",
        "therapyClass": "FLT3 inhibitor"
      }
    ],
    "sources": [
      "NCI_AML"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "aml_aza_ven",
    "name": "Azacitidine + venetoclax",
    "cancerType": "AML",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "azacitidine",
        "drugClass": "hypomethylating agent",
        "therapyClass": "hypomethylating agent"
      },
      {
        "genericName": "venetoclax",
        "drugClass": "BCL-2 inhibitor",
        "therapyClass": "BCL-2 inhibitor"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "aml_azacitidine_venetoclax",
    "name": "Azacitidine + venetoclax",
    "cancerType": "AML",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "azacitidine",
        "drugClass": "hypomethylating agent",
        "therapyClass": "hypomethylating agent"
      },
      {
        "genericName": "venetoclax",
        "drugClass": "BCL-2 inhibitor",
        "therapyClass": "BCL-2 inhibitor"
      }
    ],
    "sources": [
      "NCI_AML"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "induction",
      "frontline"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "aml_clag",
    "name": "CLAG",
    "cancerType": "AML",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cladribine",
        "drugClass": "purine analogue",
        "therapyClass": "purine analogue"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "aml_cpX",
    "name": "CPX-351",
    "cancerType": "AML",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "liposomal daunorubicin",
        "drugClass": "anticancer agent — verify",
        "therapyClass": "anticancer agent — verify"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "aml_decitabine_venetoclax",
    "name": "Decitabine + venetoclax",
    "cancerType": "AML",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "decitabine",
        "drugClass": "hypomethylating agent",
        "therapyClass": "hypomethylating agent"
      },
      {
        "genericName": "venetoclax",
        "drugClass": "BCL-2 inhibitor",
        "therapyClass": "BCL-2 inhibitor"
      }
    ],
    "sources": [
      "NCI_AML"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "aml_enasidenib",
    "name": "Enasidenib",
    "cancerType": "AML",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "enasidenib",
        "drugClass": "IDH2 inhibitor",
        "therapyClass": "IDH2 inhibitor"
      }
    ],
    "sources": [
      "NCI_AML"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "aml_flag",
    "name": "FLAG",
    "cancerType": "AML",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "fludarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "filgrastim",
        "drugClass": "G-CSF",
        "therapyClass": "G-CSF"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "aml_gemtuzumab_ozogamicin_7_3",
    "name": "Gemtuzumab ozogamicin + 7+3",
    "cancerType": "AML",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "gemtuzumab ozogamicin",
        "drugClass": "antibody-drug conjugate",
        "therapyClass": "antibody-drug conjugate"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "daunorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "NCI_AML"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "induction"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "aml_gilteritinib",
    "name": "Gilteritinib",
    "cancerType": "AML",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "gilteritinib",
        "drugClass": "FLT3 inhibitor",
        "therapyClass": "FLT3 inhibitor"
      }
    ],
    "sources": [
      "NCI_AML"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "aml_hidac",
    "name": "High-dose cytarabine consolidation",
    "cancerType": "AML",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "aml_ivosidenib",
    "name": "Ivosidenib",
    "cancerType": "AML",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "ivosidenib",
        "drugClass": "IDH1 inhibitor",
        "therapyClass": "IDH1 inhibitor"
      }
    ],
    "sources": [
      "NCI_AML"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "frontline",
      "relapsed"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "aml_mec",
    "name": "MEC",
    "cancerType": "AML",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "mitoxantrone",
        "drugClass": "anthracycline-like/topoisomerase II inhibitor",
        "therapyClass": "anthracycline-like"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline-like"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "aml_ven_lda",
    "name": "Low-dose cytarabine + venetoclax",
    "cancerType": "AML",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "venetoclax",
        "drugClass": "BCL-2 inhibitor",
        "therapyClass": "BCL-2 inhibitor"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "anal_carbo_pac",
    "name": "Carboplatin + paclitaxel",
    "cancerType": "anal cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_RARE"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/rare-cancers"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "anal_cis_5fu_rt",
    "name": "Cisplatin + 5-FU chemoradiation",
    "cancerType": "anal cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_RARE"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/rare-cancers"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "definitive chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "anal_mmc_5fu_rt",
    "name": "Mitomycin + 5-FU chemoradiation",
    "cancerType": "anal cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "mitomycin",
        "drugClass": "antitumour antibiotic",
        "therapyClass": "antitumour antibiotic"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_RARE"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/rare-cancers"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "definitive chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "anal_mmc_cap_rt",
    "name": "Mitomycin + capecitabine chemoradiation",
    "cancerType": "anal cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "mitomycin",
        "drugClass": "antitumour antibiotic",
        "therapyClass": "antitumour antibiotic"
      },
      {
        "genericName": "capecitabine",
        "drugClass": "oral fluoropyrimidine",
        "therapyClass": "oral fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_RARE"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/rare-cancers"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "definitive chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "anaplastic_thyroid_carcinoma_dabrafenib_trametinib",
    "name": "Dabrafenib + trametinib",
    "cancerType": "anaplastic thyroid carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "dabrafenib",
        "drugClass": "BRAF inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      },
      {
        "genericName": "trametinib",
        "drugClass": "MEK inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      }
    ],
    "sources": [
      "NCI_THYROID"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/thyroid/hp/thyroid-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "apl_aida",
    "name": "AIDA",
    "cancerType": "APL",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "all-trans retinoic acid",
        "drugClass": "differentiation agent",
        "therapyClass": "differentiation agent"
      },
      {
        "genericName": "idarubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "apl_atra_anthracycline_arsenic_trioxide",
    "name": "ATRA + anthracycline + arsenic trioxide",
    "cancerType": "APL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "all-trans retinoic acid",
        "drugClass": "differentiation agent",
        "therapyClass": "differentiation agent"
      },
      {
        "genericName": "idarubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "arsenic trioxide",
        "drugClass": "differentiation agent",
        "therapyClass": "differentiation agent"
      }
    ],
    "sources": [
      "NCI_AML"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "apl_atra_arsenic_trioxide",
    "name": "ATRA + arsenic trioxide",
    "cancerType": "APL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "all-trans retinoic acid",
        "drugClass": "differentiation agent",
        "therapyClass": "differentiation agent"
      },
      {
        "genericName": "arsenic trioxide",
        "drugClass": "differentiation agent",
        "therapyClass": "differentiation agent"
      }
    ],
    "sources": [
      "NCI_AML"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "apl_atra_ato",
    "name": "ATRA + arsenic trioxide",
    "cancerType": "APL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "all-trans retinoic acid",
        "drugClass": "differentiation agent",
        "therapyClass": "differentiation agent"
      },
      {
        "genericName": "arsenic trioxide",
        "drugClass": "differentiation agent",
        "therapyClass": "differentiation agent"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "apl_atra_ida_ato",
    "name": "ATRA + ATO + idarubicin",
    "cancerType": "APL",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "all-trans retinoic acid",
        "drugClass": "differentiation agent",
        "therapyClass": "differentiation agent"
      },
      {
        "genericName": "arsenic trioxide",
        "drugClass": "differentiation agent",
        "therapyClass": "differentiation agent"
      },
      {
        "genericName": "idarubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "NCI_AML",
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/leukemia/hp/adult-aml-treatment-pdq",
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "basal_cell_carcinoma_sonidegib",
    "name": "Sonidegib",
    "cancerType": "basal cell carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "sonidegib",
        "drugClass": "Hedgehog pathway inhibitor",
        "therapyClass": "Hedgehog pathway inhibitor"
      }
    ],
    "sources": [
      "NCI_SKIN"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/skin/hp/skin-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic",
      "unresectable"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "basal_cell_carcinoma_vismodegib",
    "name": "Vismodegib",
    "cancerType": "basal cell carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "vismodegib",
        "drugClass": "Hedgehog pathway inhibitor",
        "therapyClass": "Hedgehog pathway inhibitor"
      }
    ],
    "sources": [
      "NCI_SKIN"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/skin/hp/skin-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic",
      "unresectable"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "biliary_folfox",
    "name": "FOLFOX",
    "cancerType": "biliary",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "aliases": [
      "FOLFOX4",
      "FOLFOX6",
      "mFOLFOX6",
      "FOLFOX4",
      "FOLFOX6",
      "mFOLFOX6"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "biliary_gemox",
    "name": "Gemcitabine + oxaliplatin",
    "cancerType": "biliary",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "biliary_tract_cancer_encorafenib_cetuximab",
    "name": "Encorafenib + cetuximab",
    "cancerType": "biliary tract cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "encorafenib",
        "drugClass": "BRAF inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      },
      {
        "genericName": "cetuximab",
        "drugClass": "EGFR monoclonal antibody",
        "therapyClass": "EGFR monoclonal antibody"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "biliary_tract_cancer_folfox",
    "name": "FOLFOX",
    "cancerType": "biliary tract cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "biliary_tract_cancer_futibatinib",
    "name": "Futibatinib",
    "cancerType": "biliary tract cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "futibatinib",
        "drugClass": "FGFR inhibitor",
        "therapyClass": "FGFR inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "biliary_tract_cancer_gemcitabine_cisplatin_durvalumab",
    "name": "Gemcitabine + cisplatin + durvalumab",
    "cancerType": "biliary tract cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "durvalumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "biliary_tract_cancer_gemcitabine_cisplatin_pembrolizumab",
    "name": "Gemcitabine + cisplatin + pembrolizumab",
    "cancerType": "biliary tract cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "biliary_tract_cancer_her2_directed_therapy",
    "name": "HER2-directed therapy",
    "cancerType": "biliary tract cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      },
      {
        "genericName": "pertuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "biliary_tract_cancer_ivosidenib",
    "name": "Ivosidenib",
    "cancerType": "biliary tract cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "ivosidenib",
        "drugClass": "IDH1 inhibitor",
        "therapyClass": "IDH1 inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "biliary_tract_cancer_pemigatinib",
    "name": "Pemigatinib",
    "cancerType": "biliary tract cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pemigatinib",
        "drugClass": "FGFR inhibitor",
        "therapyClass": "FGFR inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_abemaciclib_endocrine_therapy",
    "name": "Abemaciclib + endocrine therapy",
    "cancerType": "breast",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "abemaciclib",
        "drugClass": "CDK4/6 inhibitor",
        "therapyClass": "CDK4/6 inhibitor"
      },
      {
        "genericName": "letrozole",
        "drugClass": "aromatase inhibitor",
        "therapyClass": "aromatase inhibitor"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "adjuvant",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_ac_docetaxel",
    "name": "AC-docetaxel",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_ac_th_v2variant",
    "name": "AC-TH (variant)",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "HER2-targeted therapy",
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_ac_thp",
    "name": "AC-THP",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      },
      {
        "genericName": "pertuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "HER2-targeted therapy",
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_atezo_nabpac",
    "name": "Atezolizumab + nab-paclitaxel",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "atezolizumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "nab-paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_capecitabine",
    "name": "Capecitabine monotherapy",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "oral fluoropyrimidine",
        "therapyClass": "oral fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_docetaxel",
    "name": "Docetaxel monotherapy",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_doxil",
    "name": "Pegylated liposomal doxorubicin",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "liposomal doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_ec_t",
    "name": "EC-T",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "epirubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_fulvestrant_cdk4_6_inhibitor",
    "name": "Fulvestrant + CDK4/6 inhibitor",
    "cancerType": "breast",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "fulvestrant",
        "drugClass": "SERD",
        "therapyClass": "SERD"
      },
      {
        "genericName": "ribociclib",
        "drugClass": "CDK4/6 inhibitor",
        "therapyClass": "CDK4/6 inhibitor"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_neoadj_ac_t",
    "name": "Neoadjuvant AC → taxane",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_neoadjuvant_tchp",
    "name": "Neoadjuvant TCHP",
    "cancerType": "breast",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      },
      {
        "genericName": "pertuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "neoadjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_olaparib_for_germline_brca",
    "name": "Olaparib for germline BRCA",
    "cancerType": "breast",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "olaparib",
        "drugClass": "PARP inhibitor",
        "therapyClass": "PARP inhibitor"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "adjuvant",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_paclitaxel",
    "name": "Paclitaxel monotherapy",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_palbociclib_endocrine_therapy",
    "name": "Palbociclib + endocrine therapy",
    "cancerType": "breast",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "palbociclib",
        "drugClass": "CDK4/6 inhibitor",
        "therapyClass": "CDK4/6 inhibitor"
      },
      {
        "genericName": "letrozole",
        "drugClass": "aromatase inhibitor",
        "therapyClass": "aromatase inhibitor"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_pembro_chemo",
    "name": "Pembrolizumab + chemotherapy",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_pembrolizumab_for_pd_l1_positive_metastatic_tnbc",
    "name": "Pembrolizumab for PD-L1 positive metastatic TNBC",
    "cancerType": "breast",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_pembrolizumab_neoadjuvant_chemotherapy_for_tnbc",
    "name": "Pembrolizumab + neoadjuvant chemotherapy for TNBC",
    "cancerType": "breast",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_ribociclib_endocrine_therapy",
    "name": "Ribociclib + endocrine therapy",
    "cancerType": "breast",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "ribociclib",
        "drugClass": "CDK4/6 inhibitor",
        "therapyClass": "CDK4/6 inhibitor"
      },
      {
        "genericName": "letrozole",
        "drugClass": "aromatase inhibitor",
        "therapyClass": "aromatase inhibitor"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "adjuvant",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_sacituzumab_govitecan",
    "name": "Sacituzumab govitecan",
    "cancerType": "breast",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "sacituzumab govitecan",
        "drugClass": "TROP2 antibody-drug conjugate",
        "therapyClass": "TROP2 antibody-drug conjugate"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_t_dm1_post_neoadjuvant_her2_positive",
    "name": "T-DM1 post-neoadjuvant HER2-positive",
    "cancerType": "breast",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "trastuzumab emtansine",
        "drugClass": "HER2 antibody-drug conjugate",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "cardioOncologyClasses": [
      "HER2-targeted",
      "LVEF decline/HF risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_talazoparib_for_germline_brca",
    "name": "Talazoparib for germline BRCA",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "talazoparib",
        "drugClass": "PARP inhibitor",
        "therapyClass": "PARP inhibitor"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_tch",
    "name": "TCH",
    "cancerType": "breast",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_BREAST",
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast",
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "HER2-targeted therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "breast_trastuzumab_deruxtecan",
    "name": "Trastuzumab deruxtecan",
    "cancerType": "breast",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "trastuzumab deruxtecan",
        "drugClass": "HER2 antibody-drug conjugate",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "HER2-targeted",
      "LVEF decline/HF risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "breast_tucatinib_trastuzumab_capecitabine",
    "name": "Tucatinib + trastuzumab + capecitabine",
    "cancerType": "breast",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "tucatinib",
        "drugClass": "HER2 TKI",
        "therapyClass": "HER2 TKI"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      },
      {
        "genericName": "capecitabine",
        "drugClass": "oral fluoropyrimidine",
        "therapyClass": "oral fluoropyrimidine"
      }
    ],
    "sources": [
      "NCI_BREAST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/breast/hp/breast-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "HER2-targeted"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "cancer_of_unknown_primary_empiric_carboplatin_paclitaxel",
    "name": "Empiric carboplatin + paclitaxel",
    "cancerType": "cancer of unknown primary",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "cancer_of_unknown_primary_molecularly_informed_tumour_agnostic_therapy",
    "name": "Molecularly informed tumour-agnostic therapy",
    "cancerType": "cancer of unknown primary",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "larotrectinib",
        "drugClass": "TRK inhibitor",
        "therapyClass": "TRK inhibitor"
      },
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "cervical_cancer_pembrolizumab_chemotherapy_bevacizumab",
    "name": "Pembrolizumab + chemotherapy + bevacizumab",
    "cancerType": "cervical cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk",
      "hypertension",
      "heart failure risk",
      "arterial/venous thromboembolism"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "cervical_cancer_tisotumab_vedotin",
    "name": "Tisotumab vedotin",
    "cancerType": "cervical cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "tisotumab vedotin",
        "drugClass": "tissue factor antibody-drug conjugate",
        "therapyClass": "tissue factor antibody-drug conjugate"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "cervix_cis_pac_bev",
    "name": "Cisplatin + paclitaxel + bevacizumab",
    "cancerType": "cervical cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "cervix_cis_rt_pembro",
    "name": "Weekly cisplatin chemoradiation + pembrolizumab",
    "cancerType": "cervical cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "locally advanced"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "colorectal_rectal_encorafenib_cetuximab",
    "name": "Encorafenib + cetuximab",
    "cancerType": "colorectal/rectal",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "encorafenib",
        "drugClass": "BRAF inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      },
      {
        "genericName": "cetuximab",
        "drugClass": "EGFR monoclonal antibody",
        "therapyClass": "EGFR monoclonal antibody"
      }
    ],
    "sources": [
      "NCI_COLON"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "colorectal_rectal_nivolumab_ipilimumab_for_msi_h_dmmr",
    "name": "Nivolumab + ipilimumab for MSI-H/dMMR",
    "cancerType": "colorectal/rectal",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "ipilimumab",
        "drugClass": "CTLA-4 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_COLON"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "colorectal_rectal_pembrolizumab_for_msi_h_dmmr",
    "name": "Pembrolizumab for MSI-H/dMMR",
    "cancerType": "colorectal/rectal",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_COLON"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "colorectal_rectal_regorafenib",
    "name": "Regorafenib",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "regorafenib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "multikinase inhibitor"
      }
    ],
    "sources": [
      "NCI_COLON"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "colorectal_rectal_sotorasib_panitumumab",
    "name": "Sotorasib + panitumumab",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "sotorasib",
        "drugClass": "KRAS G12C inhibitor",
        "therapyClass": "KRAS G12C inhibitor"
      },
      {
        "genericName": "panitumumab",
        "drugClass": "EGFR monoclonal antibody",
        "therapyClass": "EGFR monoclonal antibody"
      }
    ],
    "sources": [
      "NCI_COLON"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "colorectal_rectal_trifluridine_tipiracil_bevacizumab",
    "name": "Trifluridine/tipiracil + bevacizumab",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "trifluridine/tipiracil",
        "drugClass": "oral nucleoside analogue",
        "therapyClass": "oral nucleoside analogue"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "NCI_COLON"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "hypertension",
      "heart failure risk",
      "arterial/venous thromboembolism"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "colorectal_rectal_tucatinib_trastuzumab",
    "name": "Tucatinib + trastuzumab",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "tucatinib",
        "drugClass": "HER2 TKI",
        "therapyClass": "HER2 TKI"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "NCI_COLON"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "HER2-targeted"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "crc_5fu_lv",
    "name": "5-FU/LV",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "metastatic"
    ],
    "intent": [
      "curative_or_palliative_dependent_on_setting"
    ],
    "subtype": "colorectal",
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_capiri",
    "name": "CAPIRI",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "oral fluoropyrimidine",
        "therapyClass": "oral fluoropyrimidine"
      },
      {
        "genericName": "irinotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "topoisomerase I inhibitor"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "colorectal",
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_folfiri_panit",
    "name": "FOLFIRI + panitumumab",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "irinotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "topoisomerase I inhibitor"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "panitumumab",
        "drugClass": "EGFR monoclonal antibody",
        "therapyClass": "EGFR monoclonal antibody"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "colorectal",
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_folfox4",
    "name": "FOLFOX4",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "colorectal",
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_folfox_panit",
    "name": "FOLFOX + panitumumab",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "panitumumab",
        "drugClass": "EGFR monoclonal antibody",
        "therapyClass": "EGFR monoclonal antibody"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "colorectal",
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_folfoxiri_bev",
    "name": "FOLFOXIRI + bevacizumab",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "irinotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "topoisomerase I inhibitor"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "colorectal",
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "crc_mfolfox6",
    "name": "modified FOLFOX6",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "metastatic"
    ],
    "intent": [
      "curative_or_palliative_dependent_on_setting"
    ],
    "subtype": "colorectal",
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "rectal_5fu_rt",
    "name": "5-FU with radiation",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "subtype": "rectal",
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "rectal_capox_rt",
    "name": "CAPOX with radiation",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "oral fluoropyrimidine",
        "therapyClass": "oral fluoropyrimidine"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "subtype": "rectal",
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "rectal_tnt_folfox",
    "name": "FOLFOX-based total neoadjuvant therapy",
    "cancerType": "colorectal/rectal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_COLORECTAL",
      "NCI_COLON",
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/colon-treatment-pdq",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "neoadjuvant"
    ],
    "intent": [
      "curative"
    ],
    "subtype": "rectal",
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "cutaneous_squamous_cell_carcinoma_cemiplimab",
    "name": "Cemiplimab",
    "cancerType": "cutaneous squamous cell carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cemiplimab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "PD-1 inhibitor"
      }
    ],
    "sources": [
      "NCI_SKIN"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/skin/hp/skin-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic",
      "unresectable"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "cutaneous_squamous_cell_carcinoma_pembrolizumab",
    "name": "Pembrolizumab",
    "cancerType": "cutaneous squamous cell carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_SKIN"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/skin/hp/skin-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic",
      "unresectable"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "desmoid_tumour_sorafenib",
    "name": "Sorafenib",
    "cancerType": "desmoid tumour",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "sorafenib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "unresectable"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "dlbcl_axicabtagene_ciloleucel",
    "name": "Axicabtagene ciloleucel",
    "cancerType": "DLBCL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "axicabtagene ciloleucel",
        "drugClass": "CD19 CAR-T",
        "therapyClass": "CD19 CAR-T"
      }
    ],
    "sources": [
      "NCI_AGG_BCELL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "dlbcl_epcoritamab",
    "name": "Epcoritamab",
    "cancerType": "DLBCL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "epcoritamab",
        "drugClass": "CD20xCD3 bispecific",
        "therapyClass": "CD20xCD3 bispecific"
      }
    ],
    "sources": [
      "NCI_AGG_BCELL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "dlbcl_glofitamab",
    "name": "Glofitamab",
    "cancerType": "DLBCL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "glofitamab",
        "drugClass": "CD20xCD3 bispecific",
        "therapyClass": "CD20xCD3 bispecific"
      }
    ],
    "sources": [
      "NCI_AGG_BCELL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "dlbcl_lisocabtagene_maraleucel",
    "name": "Lisocabtagene maraleucel",
    "cancerType": "DLBCL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "lisocabtagene maraleucel",
        "drugClass": "CD19 CAR-T",
        "therapyClass": "CD19 CAR-T"
      }
    ],
    "sources": [
      "NCI_AGG_BCELL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "dlbcl_loncastuximab_tesirine",
    "name": "Loncastuximab tesirine",
    "cancerType": "DLBCL",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "loncastuximab tesirine",
        "drugClass": "ADC",
        "therapyClass": "ADC"
      }
    ],
    "sources": [
      "NCI_AGG_BCELL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "dlbcl_pol_r_chp",
    "name": "Pola-R-CHP",
    "cancerType": "DLBCL",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "polatuzumab vedotin",
        "drugClass": "anti-CD79b antibody-drug conjugate",
        "therapyClass": "anti-CD79b antibody-drug conjugate"
      },
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "dlbcl_pola_r_chp",
    "name": "Pola-R-CHP",
    "cancerType": "DLBCL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "polatuzumab vedotin",
        "drugClass": "anti-CD79b antibody-drug conjugate",
        "therapyClass": "anti-CD79b antibody-drug conjugate"
      },
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "NCI_AGG_BCELL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "dlbcl_r_chop",
    "name": "R-CHOP",
    "cancerType": "DLBCL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "NCI_AGG_BCELL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "dlbcl_r_dhap_salvage",
    "name": "R-DHAP salvage",
    "cancerType": "DLBCL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "NCI_AGG_BCELL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "dlbcl_r_ice_salvage",
    "name": "R-ICE salvage",
    "cancerType": "DLBCL",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "ifosfamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      }
    ],
    "sources": [
      "NCI_AGG_BCELL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "dlbcl_rmini_chop",
    "name": "R-mini-CHOP",
    "cancerType": "DLBCL",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "dlbcl_tafasitamab_lenalidomide",
    "name": "Tafasitamab + lenalidomide",
    "cancerType": "DLBCL",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "tafasitamab",
        "drugClass": "CD19 monoclonal antibody",
        "therapyClass": "CD19 monoclonal antibody"
      },
      {
        "genericName": "lenalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      }
    ],
    "sources": [
      "NCI_AGG_BCELL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "endo_carbopac",
    "name": "Carboplatin + paclitaxel",
    "cancerType": "endometrial cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "adjuvant",
      "advanced"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "endo_doxo",
    "name": "Doxorubicin",
    "cancerType": "endometrial cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "endo_doxo_cis",
    "name": "Doxorubicin + cisplatin",
    "cancerType": "endometrial cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "endo_pac_carbo_rt",
    "name": "Carboplatin + paclitaxel with radiation",
    "cancerType": "endometrial cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "endo_pembro_carbopac",
    "name": "Pembrolizumab + carboplatin + paclitaxel",
    "cancerType": "endometrial cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "primary advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "endometrial_cancer_dostarlimab_carboplatin_paclitaxel",
    "name": "Dostarlimab + carboplatin + paclitaxel",
    "cancerType": "endometrial cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "dostarlimab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "PD-1 inhibitor"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "NCI_ENDOMETRIAL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/uterine/hp/endometrial-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "primary advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "endometrial_cancer_dostarlimab_monotherapy_for_dmmr_msi_h",
    "name": "Dostarlimab monotherapy for dMMR/MSI-H",
    "cancerType": "endometrial cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "dostarlimab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "PD-1 inhibitor"
      }
    ],
    "sources": [
      "NCI_ENDOMETRIAL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/uterine/hp/endometrial-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "endometrial_cancer_pembrolizumab_carboplatin_paclitaxel",
    "name": "Pembrolizumab + carboplatin + paclitaxel",
    "cancerType": "endometrial cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "NCI_ENDOMETRIAL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/uterine/hp/endometrial-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "primary advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "endometrial_cancer_pembrolizumab_lenvatinib",
    "name": "Pembrolizumab + lenvatinib",
    "cancerType": "endometrial cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "lenvatinib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "NCI_ENDOMETRIAL"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/uterine/hp/endometrial-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "ewing_ie",
    "name": "IE",
    "cancerType": "Ewing sarcoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "ifosfamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ewing_irino_temo",
    "name": "Irinotecan + temozolomide",
    "cancerType": "Ewing sarcoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "irinotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "topoisomerase I inhibitor"
      },
      {
        "genericName": "temozolomide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ewing_sarcoma_vdc_ie_interval_compressed",
    "name": "VDC/IE interval-compressed",
    "cancerType": "Ewing sarcoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "ifosfamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "ewing_topo_cyclo",
    "name": "Topotecan + cyclophosphamide",
    "cancerType": "Ewing sarcoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "topotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "topoisomerase I inhibitor"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ewing_vdc",
    "name": "VDC",
    "cancerType": "Ewing sarcoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ewing_vdc_ie",
    "name": "VDC/IE",
    "cancerType": "Ewing sarcoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "ifosfamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "fl_bendamustine_ritux",
    "name": "Bendamustine + rituximab",
    "cancerType": "follicular lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "bendamustine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "fl_obinut_benda",
    "name": "Obinutuzumab + bendamustine",
    "cancerType": "follicular lymphoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "obinutuzumab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "bendamustine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "fl_r_cvp",
    "name": "R-CVP",
    "cancerType": "follicular lymphoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "follicular_lymphoma_bendamustine_rituximab",
    "name": "Bendamustine + rituximab",
    "cancerType": "follicular lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "bendamustine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "follicular_lymphoma_r",
    "name": "R²",
    "cancerType": "follicular lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "lenalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "frontline",
      "relapsed"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gastric_gastroesophageal_oesophageal_dostarlimab_for_msi_h_dmmr",
    "name": "Dostarlimab for MSI-H/dMMR",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "dostarlimab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "PD-1 inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gastric_gastroesophageal_oesophageal_nivolumab_chemotherapy",
    "name": "Nivolumab + chemotherapy",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gastric_gastroesophageal_oesophageal_nivolumab_ipilimumab",
    "name": "Nivolumab + ipilimumab",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "ipilimumab",
        "drugClass": "CTLA-4 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gastric_gastroesophageal_oesophageal_pembrolizumab_chemotherapy",
    "name": "Pembrolizumab + chemotherapy",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gastric_gastroesophageal_oesophageal_ramucirumab_paclitaxel",
    "name": "Ramucirumab + paclitaxel",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "ramucirumab",
        "drugClass": "VEGFR2 monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "hypertension",
      "vascular/thrombotic risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gastric_gastroesophageal_oesophageal_trastuzumab_deruxtecan",
    "name": "Trastuzumab deruxtecan",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "trastuzumab deruxtecan",
        "drugClass": "HER2 antibody-drug conjugate",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "HER2-targeted",
      "LVEF decline/HF risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gastric_gastroesophageal_oesophageal_trastuzumab_fluoropyrimidine_plat",
    "name": "Trastuzumab + fluoropyrimidine + platinum",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "ugi_cis_cap_rt",
    "name": "Cisplatin + capecitabine chemoradiation",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "capecitabine",
        "drugClass": "oral fluoropyrimidine",
        "therapyClass": "oral fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ugi_cis_fu_rt",
    "name": "Cisplatin + 5-FU chemoradiation",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "definitive chemoradiation"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ugi_flot_d",
    "name": "FLOT-D",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "durvalumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "perioperative",
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ugi_folfox_rt",
    "name": "FOLFOX chemoradiation",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "definitive chemoradiation"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ugi_folfox_trast",
    "name": "FOLFOX + trastuzumab",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "trastuzumab",
        "drugClass": "HER2 monoclonal antibody",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "HER2-targeted therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ugi_foxto",
    "name": "FOLFOX + nivolumab",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ugi_pembro",
    "name": "Pembrolizumab monotherapy",
    "cancerType": "gastric/gastroesophageal/oesophageal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "gastroenteropancreatic_neuroendocrine_carcinoma_platinum_etoposide",
    "name": "Platinum + etoposide",
    "cancerType": "gastroenteropancreatic neuroendocrine carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      }
    ],
    "sources": [
      "NCI_NET"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/gi-cancers/patient/neuroendocrine-tumors-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gastroenteropancreatic_neuroendocrine_tumour_capecitabine_temozolomide",
    "name": "Capecitabine + temozolomide",
    "cancerType": "gastroenteropancreatic neuroendocrine tumour",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "oral fluoropyrimidine",
        "therapyClass": "oral fluoropyrimidine"
      },
      {
        "genericName": "temozolomide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "NCI_NET"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/gi-cancers/patient/neuroendocrine-tumors-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gastroenteropancreatic_neuroendocrine_tumour_everolimus",
    "name": "Everolimus",
    "cancerType": "gastroenteropancreatic neuroendocrine tumour",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "everolimus",
        "drugClass": "mTOR inhibitor",
        "therapyClass": "mTOR inhibitor"
      }
    ],
    "sources": [
      "NCI_NET"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/gi-cancers/patient/neuroendocrine-tumors-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gastroenteropancreatic_neuroendocrine_tumour_lutetium_177_dotatate",
    "name": "Lutetium-177 DOTATATE",
    "cancerType": "gastroenteropancreatic neuroendocrine tumour",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "lutetium lu 177 dotatate",
        "drugClass": "somatostatin receptor radioligand",
        "therapyClass": "somatostatin receptor radioligand"
      }
    ],
    "sources": [
      "NCI_NET"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/gi-cancers/patient/neuroendocrine-tumors-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gestational_trophoblastic_neoplasia_ema_co",
    "name": "EMA-CO",
    "cancerType": "gestational trophoblastic neoplasia",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      },
      {
        "genericName": "methotrexate",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      },
      {
        "genericName": "actinomycin d",
        "drugClass": "antitumour antibiotic",
        "therapyClass": "antitumour antibiotic"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "high-risk",
      "relapsed"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gist_avapritinib",
    "name": "Avapritinib",
    "cancerType": "GIST",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "avapritinib",
        "drugClass": "KIT/PDGFRA inhibitor",
        "therapyClass": "KIT/PDGFRA inhibitor"
      }
    ],
    "sources": [
      "NCI_GIST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/soft-tissue-sarcoma/patient/gist-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gist_imatinib",
    "name": "Imatinib",
    "cancerType": "GIST",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "imatinib",
        "drugClass": "BCR-ABL tyrosine kinase inhibitor",
        "therapyClass": "BCR-ABL TKI"
      }
    ],
    "sources": [
      "NCI_GIST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/soft-tissue-sarcoma/patient/gist-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gist_regorafenib",
    "name": "Regorafenib",
    "cancerType": "GIST",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "regorafenib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "multikinase inhibitor"
      }
    ],
    "sources": [
      "NCI_GIST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/soft-tissue-sarcoma/patient/gist-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gist_ripretinib",
    "name": "Ripretinib",
    "cancerType": "GIST",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "ripretinib",
        "drugClass": "KIT/PDGFRA switch-control inhibitor",
        "therapyClass": "KIT/PDGFRA switch-control inhibitor"
      }
    ],
    "sources": [
      "NCI_GIST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/soft-tissue-sarcoma/patient/gist-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "gist_sunitinib",
    "name": "Sunitinib",
    "cancerType": "GIST",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "sunitinib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "NCI_GIST"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/soft-tissue-sarcoma/patient/gist-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "hypertension",
      "heart failure risk",
      "QT/arrhythmia potential"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "cns_bev",
    "name": "Bevacizumab",
    "cancerType": "glioblastoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_NEURO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "gbm_adjuvant_tmz",
    "name": "Adjuvant temozolomide",
    "cancerType": "glioblastoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "temozolomide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_NEURO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "gbm_tmz_rt",
    "name": "Temozolomide with radiation",
    "cancerType": "glioblastoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "temozolomide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_NEURO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "concurrent chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "glioblastoma_lomustine_temozolomide",
    "name": "Lomustine + temozolomide",
    "cancerType": "glioblastoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "lomustine",
        "drugClass": "nitrosourea alkylating agent",
        "therapyClass": "nitrosourea alkylating agent"
      },
      {
        "genericName": "temozolomide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "glioblastoma_stupp_protocol",
    "name": "Stupp protocol",
    "cancerType": "glioblastoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "radiotherapy",
        "drugClass": "treatment modality",
        "therapyClass": "treatment modality"
      },
      {
        "genericName": "temozolomide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "newly diagnosed",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "cns_lomustine",
    "name": "Lomustine",
    "cancerType": "glioma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "lomustine",
        "drugClass": "nitrosourea alkylating agent",
        "therapyClass": "nitrosourea alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_NEURO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "cns_tmz",
    "name": "Temozolomide",
    "cancerType": "glioma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "temozolomide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_NEURO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_carbofu",
    "name": "Carboplatin + 5-FU",
    "cancerType": "head and neck SCC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_carbofu_rt",
    "name": "Carboplatin + 5-FU chemoradiation",
    "cancerType": "head and neck SCC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "definitive chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_carbopac",
    "name": "Carboplatin + paclitaxel",
    "cancerType": "head and neck SCC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_cis_rt_weekly",
    "name": "Weekly cisplatin chemoradiation",
    "cancerType": "head and neck SCC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "definitive chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_ciscap",
    "name": "Cisplatin + capecitabine",
    "cancerType": "head and neck SCC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "capecitabine",
        "drugClass": "oral fluoropyrimidine",
        "therapyClass": "oral fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_cisfu",
    "name": "Cisplatin + 5-FU",
    "cancerType": "head and neck SCC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_cispofu_cetux",
    "name": "Cisplatin + 5-FU + cetuximab",
    "cancerType": "head and neck SCC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "cetuximab",
        "drugClass": "EGFR monoclonal antibody",
        "therapyClass": "EGFR monoclonal antibody"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_mtx",
    "name": "Methotrexate monotherapy",
    "cancerType": "head and neck SCC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "methotrexate",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hn_pac",
    "name": "Paclitaxel monotherapy",
    "cancerType": "head and neck SCC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hcc_folfox",
    "name": "FOLFOX",
    "cancerType": "hepatocellular carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "aliases": [
      "FOLFOX4",
      "FOLFOX6",
      "mFOLFOX6",
      "FOLFOX4",
      "FOLFOX6",
      "mFOLFOX6"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hepatocellular_carcinoma_atezolizumab_bevacizumab",
    "name": "Atezolizumab + bevacizumab",
    "cancerType": "hepatocellular carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "atezolizumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "NCI_LIVER"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/liver/hp/adult-liver-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "unresectable",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk",
      "hypertension",
      "heart failure risk",
      "arterial/venous thromboembolism"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "hepatocellular_carcinoma_cabozantinib",
    "name": "Cabozantinib",
    "cancerType": "hepatocellular carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cabozantinib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "NCI_LIVER"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/liver/hp/adult-liver-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "hypertension",
      "vascular/thrombotic risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "hepatocellular_carcinoma_durvalumab_tremelimumab",
    "name": "Durvalumab + tremelimumab",
    "cancerType": "hepatocellular carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "durvalumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "tremelimumab",
        "drugClass": "CTLA-4 inhibitor",
        "therapyClass": "CTLA-4 inhibitor"
      }
    ],
    "sources": [
      "NCI_LIVER"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/liver/hp/adult-liver-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "unresectable",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "hepatocellular_carcinoma_lenvatinib",
    "name": "Lenvatinib",
    "cancerType": "hepatocellular carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "lenvatinib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "NCI_LIVER"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/liver/hp/adult-liver-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "unresectable",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "hepatocellular_carcinoma_nivolumab",
    "name": "Nivolumab",
    "cancerType": "hepatocellular carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_LIVER"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/liver/hp/adult-liver-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "hepatocellular_carcinoma_ramucirumab",
    "name": "Ramucirumab",
    "cancerType": "hepatocellular carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "ramucirumab",
        "drugClass": "VEGFR2 monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "NCI_LIVER"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/liver/hp/adult-liver-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "hypertension",
      "vascular/thrombotic risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "hepatocellular_carcinoma_regorafenib",
    "name": "Regorafenib",
    "cancerType": "hepatocellular carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "regorafenib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "multikinase inhibitor"
      }
    ],
    "sources": [
      "NCI_LIVER"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/liver/hp/adult-liver-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "hepatocellular_carcinoma_sorafenib",
    "name": "Sorafenib",
    "cancerType": "hepatocellular carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "sorafenib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "NCI_LIVER"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/liver/hp/adult-liver-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "unresectable",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "chl_abvd",
    "name": "ABVD",
    "cancerType": "Hodgkin lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "bleomycin",
        "drugClass": "antitumour antibiotic",
        "therapyClass": "antitumour antibiotic"
      },
      {
        "genericName": "vinblastine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "dacarbazine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "chl_beacopp",
    "name": "BEACOPPesc",
    "cancerType": "Hodgkin lymphoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "bleomycin",
        "drugClass": "antitumour antibiotic",
        "therapyClass": "antitumour antibiotic"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "dacarbazine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "chl_bv_avd",
    "name": "Brentuximab vedotin + AVD",
    "cancerType": "Hodgkin lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "brentuximab vedotin",
        "drugClass": "antibody-drug conjugate",
        "therapyClass": "antibody-drug conjugate"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vinblastine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "dacarbazine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "chl_nivo_avd",
    "name": "Nivolumab + AVD",
    "cancerType": "Hodgkin lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vinblastine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "dacarbazine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline",
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "hodgkin_lymphoma_brentuximab_vedotin_avd",
    "name": "Brentuximab vedotin + AVD",
    "cancerType": "Hodgkin lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "brentuximab vedotin",
        "drugClass": "antibody-drug conjugate",
        "therapyClass": "antibody-drug conjugate"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vinblastine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "dacarbazine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "hodgkin_lymphoma_nivolumab_avd",
    "name": "Nivolumab + AVD",
    "cancerType": "Hodgkin lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vinblastine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "dacarbazine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "hodgkin_lymphoma_nivolumab_salvage",
    "name": "Nivolumab salvage",
    "cancerType": "Hodgkin lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "hodgkin_lymphoma_pembrolizumab_salvage",
    "name": "Pembrolizumab salvage",
    "cancerType": "Hodgkin lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "idh_mutant_glioma_vorasidenib",
    "name": "Vorasidenib",
    "cancerType": "IDH-mutant glioma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "vorasidenib",
        "drugClass": "IDH1/2 inhibitor",
        "therapyClass": "IDH1/2 inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "post-surgery",
      "residual",
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nhl_bendamustine",
    "name": "Bendamustine",
    "cancerType": "lymphoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "bendamustine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "nhl_gdp",
    "name": "GDP",
    "cancerType": "lymphoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mantle_cell_lymphoma_acalabrutinib",
    "name": "Acalabrutinib",
    "cancerType": "mantle cell lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "acalabrutinib",
        "drugClass": "BTK inhibitor",
        "therapyClass": "BTK inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "mantle_cell_lymphoma_brexucabtagene_autoleucel",
    "name": "Brexucabtagene autoleucel",
    "cancerType": "mantle cell lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "brexucabtagene autoleucel",
        "drugClass": "CD19 CAR-T",
        "therapyClass": "CD19 CAR-T"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "mantle_cell_lymphoma_zanubrutinib",
    "name": "Zanubrutinib",
    "cancerType": "mantle cell lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "zanubrutinib",
        "drugClass": "BTK inhibitor",
        "therapyClass": "BTK inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "mcl_r_bac",
    "name": "R-BAC",
    "cancerType": "mantle cell lymphoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "bendamustine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mcl_r_chop",
    "name": "R-CHOP",
    "cancerType": "mantle cell lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "aliases": [
      "RCHOP",
      "rituximab CHOP",
      "RCHOP",
      "rituximab CHOP"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mcl_rdhap",
    "name": "R-DHAP",
    "cancerType": "mantle cell lymphoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "aliases": [
      "RDHAP",
      "RDHAP"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mds_azacitidine",
    "name": "Azacitidine",
    "cancerType": "MDS",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "azacitidine",
        "drugClass": "hypomethylating agent",
        "therapyClass": "hypomethylating agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "higher-risk"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "mds_decitabine",
    "name": "Decitabine",
    "cancerType": "MDS",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "decitabine",
        "drugClass": "hypomethylating agent",
        "therapyClass": "hypomethylating agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "higher-risk"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "mds_lenalidomide_for_del_5q",
    "name": "Lenalidomide for del(5q)",
    "cancerType": "MDS",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "lenalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "lower-risk"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "mds_luspatercept",
    "name": "Luspatercept",
    "cancerType": "MDS",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "luspatercept",
        "drugClass": "erythroid maturation agent",
        "therapyClass": "erythroid maturation agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "lower-risk",
      "transfusion-dependent"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "medullary_thyroid_carcinoma_selpercatinib",
    "name": "Selpercatinib",
    "cancerType": "medullary thyroid carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "selpercatinib",
        "drugClass": "RET inhibitor",
        "therapyClass": "RET inhibitor"
      }
    ],
    "sources": [
      "NCI_THYROID"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/thyroid/hp/thyroid-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "mel_dab_tram",
    "name": "Dabrafenib + trametinib",
    "cancerType": "melanoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "dabrafenib",
        "drugClass": "BRAF inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      },
      {
        "genericName": "trametinib",
        "drugClass": "MEK inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SKIN",
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/skin",
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "RAF/MEK pathway inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mel_enc_bin",
    "name": "Encorafenib + binimetinib",
    "cancerType": "melanoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "encorafenib",
        "drugClass": "BRAF inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      },
      {
        "genericName": "binimetinib",
        "drugClass": "MEK inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SKIN",
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/skin",
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "RAF/MEK pathway inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mel_neoadj_nivo_ipi",
    "name": "Neoadjuvant nivolumab + ipilimumab",
    "cancerType": "melanoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "ipilimumab",
        "drugClass": "CTLA-4 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SKIN",
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/skin",
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mel_nivo",
    "name": "Nivolumab",
    "cancerType": "melanoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SKIN",
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/skin",
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mel_nivo_adjuvant",
    "name": "Adjuvant nivolumab",
    "cancerType": "melanoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SKIN",
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/skin",
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mel_nivo_ipi",
    "name": "Nivolumab + ipilimumab",
    "cancerType": "melanoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "ipilimumab",
        "drugClass": "CTLA-4 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SKIN",
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/skin",
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mel_pembro",
    "name": "Pembrolizumab",
    "cancerType": "melanoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SKIN",
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/skin",
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mel_pembro_adjuvant",
    "name": "Adjuvant pembrolizumab",
    "cancerType": "melanoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SKIN",
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/skin",
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mel_vem_cobi",
    "name": "Vemurafenib + cobimetinib",
    "cancerType": "melanoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "vemurafenib",
        "drugClass": "BRAF inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      },
      {
        "genericName": "cobimetinib",
        "drugClass": "MEK inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SKIN",
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/skin",
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "RAF/MEK pathway inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "merkel_cell_carcinoma_avelumab",
    "name": "Avelumab",
    "cancerType": "Merkel cell carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "avelumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_SKIN"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/skin/hp/skin-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "merkel_cell_carcinoma_pembrolizumab",
    "name": "Pembrolizumab",
    "cancerType": "Merkel cell carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_SKIN"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/skin/hp/skin-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "meso_carbopem_bev",
    "name": "Carboplatin + pemetrexed + bevacizumab",
    "cancerType": "mesothelioma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "meso_cispem_bev",
    "name": "Cisplatin + pemetrexed + bevacizumab",
    "cancerType": "mesothelioma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "meso_nivo_ipi",
    "name": "Nivolumab + ipilimumab",
    "cancerType": "mesothelioma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "ipilimumab",
        "drugClass": "CTLA-4 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "meso_vino",
    "name": "Vinorelbine",
    "cancerType": "mesothelioma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "vinorelbine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_cyborD",
    "name": "CyBorD",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "induction",
      "relapsed"
    ],
    "intent": [
      "palliative",
      "disease control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_d_cvrd",
    "name": "D-CVRd",
    "cancerType": "multiple myeloma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "daratumumab",
        "drugClass": "anti-CD38 monoclonal antibody",
        "therapyClass": "anti-CD38 monoclonal antibody"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "lenalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "relapsed"
    ],
    "intent": [
      "palliative",
      "disease control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_d_vrd",
    "name": "D-VRd",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "daratumumab",
        "drugClass": "anti-CD38 monoclonal antibody",
        "therapyClass": "anti-CD38 monoclonal antibody"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "lenalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "induction",
      "relapsed"
    ],
    "intent": [
      "palliative",
      "disease control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_dara_rd",
    "name": "Dara-Rd",
    "cancerType": "multiple myeloma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "daratumumab",
        "drugClass": "anti-CD38 monoclonal antibody",
        "therapyClass": "anti-CD38 monoclonal antibody"
      },
      {
        "genericName": "lenalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "relapsed"
    ],
    "intent": [
      "palliative",
      "disease control"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_dara_vd",
    "name": "Dara-Vd",
    "cancerType": "multiple myeloma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "daratumumab",
        "drugClass": "anti-CD38 monoclonal antibody",
        "therapyClass": "anti-CD38 monoclonal antibody"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "relapsed"
    ],
    "intent": [
      "palliative",
      "disease control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_dkd",
    "name": "DKd",
    "cancerType": "multiple myeloma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "daratumumab",
        "drugClass": "anti-CD38 monoclonal antibody",
        "therapyClass": "anti-CD38 monoclonal antibody"
      },
      {
        "genericName": "carfilzomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "relapsed"
    ],
    "intent": [
      "palliative",
      "disease control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_i_vrd",
    "name": "I-VRd",
    "cancerType": "multiple myeloma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "isatuximab",
        "drugClass": "anti-CD38 monoclonal antibody",
        "therapyClass": "anti-CD38 monoclonal antibody"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "lenalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "relapsed"
    ],
    "intent": [
      "palliative",
      "disease control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_kd",
    "name": "Kd",
    "cancerType": "multiple myeloma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carfilzomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "relapsed"
    ],
    "intent": [
      "palliative",
      "disease control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_lpd",
    "name": "LPd",
    "cancerType": "multiple myeloma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "lenalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      },
      {
        "genericName": "pomalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "relapsed"
    ],
    "intent": [
      "palliative",
      "disease control"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_mel_auto",
    "name": "High-dose melphalan conditioning",
    "cancerType": "multiple myeloma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "melphalan",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "autologous transplant conditioning"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_vd",
    "name": "VD",
    "cancerType": "multiple myeloma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction",
      "relapsed"
    ],
    "intent": [
      "palliative",
      "disease control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mm_vrd",
    "name": "VRd",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "lenalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_MYELoma"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "induction",
      "relapsed"
    ],
    "intent": [
      "palliative",
      "disease control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "proteasome inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "multiple_myeloma_bcma_car_t_cilta_cel",
    "name": "BCMA CAR-T cilta-cel",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "ciltacabtagene autoleucel",
        "drugClass": "BCMA CAR-T",
        "therapyClass": "BCMA CAR-T"
      }
    ],
    "sources": [
      "NCI_MYElOMA"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "multiple_myeloma_bcma_car_t_ide_cel",
    "name": "BCMA CAR-T ide-cel",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "idecabtagene vicleucel",
        "drugClass": "BCMA CAR-T",
        "therapyClass": "BCMA CAR-T"
      }
    ],
    "sources": [
      "NCI_MYElOMA"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "multiple_myeloma_carfilzomib_dexamethasone",
    "name": "Carfilzomib + dexamethasone",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "carfilzomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "NCI_MYElOMA"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "heart failure risk",
      "hypertension",
      "ischemia"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "multiple_myeloma_d_cvrd",
    "name": "D-CVRd",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "daratumumab",
        "drugClass": "anti-CD38 monoclonal antibody",
        "therapyClass": "anti-CD38 monoclonal antibody"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "lenalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "NCI_MYElOMA"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "induction"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "heart failure risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "multiple_myeloma_d_vrd",
    "name": "D-VRd",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "daratumumab",
        "drugClass": "anti-CD38 monoclonal antibody",
        "therapyClass": "anti-CD38 monoclonal antibody"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "lenalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "NCI_MYElOMA"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "induction"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "heart failure risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "multiple_myeloma_elranatamab",
    "name": "Elranatamab",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "elranatamab",
        "drugClass": "BCMAxCD3 bispecific",
        "therapyClass": "BCMAxCD3 bispecific"
      }
    ],
    "sources": [
      "NCI_MYElOMA"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "multiple_myeloma_i_vrd",
    "name": "I-VRd",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "isatuximab",
        "drugClass": "anti-CD38 monoclonal antibody",
        "therapyClass": "anti-CD38 monoclonal antibody"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "lenalidomide",
        "drugClass": "immunomodulatory agent",
        "therapyClass": "immunomodulatory agent"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "NCI_MYElOMA"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "induction"
    ],
    "intent": [
      "disease_control"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "heart failure risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "multiple_myeloma_selinexor_bortezomib_dexamethasone",
    "name": "Selinexor + bortezomib + dexamethasone",
    "cancerType": "multiple myeloma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "selinexor",
        "drugClass": "targeted",
        "therapyClass": "targeted"
      },
      {
        "genericName": "bortezomib",
        "drugClass": "proteasome inhibitor",
        "therapyClass": "proteasome inhibitor"
      },
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "NCI_MYElOMA"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "heart failure risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "multiple_myeloma_talquetamab",
    "name": "Talquetamab",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "talquetamab",
        "drugClass": "GPRC5DxCD3 bispecific",
        "therapyClass": "GPRC5DxCD3 bispecific"
      }
    ],
    "sources": [
      "NCI_MYElOMA"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "multiple_myeloma_teclistamab",
    "name": "Teclistamab",
    "cancerType": "multiple myeloma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "teclistamab",
        "drugClass": "BCMAxCD3 bispecific",
        "therapyClass": "BCMAxCD3 bispecific"
      }
    ],
    "sources": [
      "NCI_MYElOMA"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/myeloma/hp/myeloma-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "refractory"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "mds_aza",
    "name": "Azacitidine",
    "cancerType": "myelodysplastic syndrome",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "azacitidine",
        "drugClass": "hypomethylating agent",
        "therapyClass": "hypomethylating agent"
      }
    ],
    "sources": [
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "higher-risk"
    ],
    "intent": [
      "disease control"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "mds_deci",
    "name": "Decitabine",
    "cancerType": "myelodysplastic syndrome",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "decitabine",
        "drugClass": "hypomethylating agent",
        "therapyClass": "hypomethylating agent"
      }
    ],
    "sources": [
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "higher-risk"
    ],
    "intent": [
      "disease control"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "npc_adjuvant_cisfu",
    "name": "Cisplatin + 5-FU after chemoradiation",
    "cancerType": "nasopharyngeal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "npc_cis_cap_induction",
    "name": "Cisplatin + capecitabine induction",
    "cancerType": "nasopharyngeal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "capecitabine",
        "drugClass": "oral fluoropyrimidine",
        "therapyClass": "oral fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "induction"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "npc_cis_rt",
    "name": "Cisplatin chemoradiation",
    "cancerType": "nasopharyngeal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "definitive chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "npc_cisgem_induction",
    "name": "Cisplatin + gemcitabine induction",
    "cancerType": "nasopharyngeal",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "induction"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "nhl_choep",
    "name": "CHOEP",
    "cancerType": "non-Hodgkin lymphoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "nhl_chop",
    "name": "CHOP",
    "cancerType": "non-Hodgkin lymphoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "frontline"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "nhl_dhap",
    "name": "DHAP",
    "cancerType": "non-Hodgkin lymphoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "nhl_dhax",
    "name": "DHAX",
    "cancerType": "non-Hodgkin lymphoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "dexamethasone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_HEM",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed",
      "salvage"
    ],
    "intent": [
      "palliative",
      "salvage"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_carbodoc",
    "name": "Carboplatin + docetaxel",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_carbogem",
    "name": "Carboplatin + gemcitabine",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_carbopac_bev",
    "name": "Carboplatin + paclitaxel + bevacizumab",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_carbopac_rt",
    "name": "Carboplatin + paclitaxel chemoradiation",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "locally advanced"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_carbopem_bev_atezo",
    "name": "Carboplatin + pemetrexed + bevacizumab + atezolizumab",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      },
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      },
      {
        "genericName": "atezolizumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy",
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_carbovin",
    "name": "Carboplatin + vinorelbine",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "vinorelbine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_cis_pem",
    "name": "Cisplatin + pemetrexed",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_cis_pem_pembro",
    "name": "Cisplatin + pemetrexed + pembrolizumab",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      },
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_cis_vino_rt",
    "name": "Cisplatin + vinorelbine concurrent chemoradiation",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "vinorelbine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "locally advanced"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_cisvin",
    "name": "Cisplatin + vinorelbine",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "vinorelbine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_doc",
    "name": "Docetaxel",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_durva_rt",
    "name": "Durvalumab after concurrent chemoradiation",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "durvalumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "locally advanced"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_gem",
    "name": "Gemcitabine",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_pem",
    "name": "Pemetrexed",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "lung_vino",
    "name": "Vinorelbine",
    "cancerType": "NSCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "vinorelbine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      }
    ],
    "sources": [
      "EVIQ_RESP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "adjuvant",
      "advanced",
      "metastatic"
    ],
    "intent": [
      "disease_control",
      "curative_or_palliative_dependent_on_setting"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "nsclc_adagrasib",
    "name": "Adagrasib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "adagrasib",
        "drugClass": "KRAS G12C inhibitor",
        "therapyClass": "KRAS G12C inhibitor"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "KRAS G12C",
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_alectinib",
    "name": "Alectinib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "alectinib",
        "drugClass": "ALK TKI",
        "therapyClass": "ALK TKI"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "ALK-rearranged",
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_amivantamab",
    "name": "Amivantamab",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "amivantamab",
        "drugClass": "EGFR/MET bispecific antibody",
        "therapyClass": "EGFR/MET bispecific antibody"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "EGFR exon20",
    "cardioOncologyClasses": [
      "hypertension",
      "vascular/thrombotic risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_capmatinib",
    "name": "Capmatinib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "capmatinib",
        "drugClass": "MET inhibitor",
        "therapyClass": "MET inhibitor"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "MET exon14",
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_cemiplimab_platinum_doublet",
    "name": "Cemiplimab + platinum doublet",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cemiplimab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "PD-1 inhibitor"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_crizotinib",
    "name": "Crizotinib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "crizotinib",
        "drugClass": "ALK/ROS1/MET TKI",
        "therapyClass": "ALK/ROS1/MET TKI"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "ROS1-positive",
    "cardioOncologyClasses": [
      "QT prolongation"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_dabrafenib_trametinib",
    "name": "Dabrafenib + trametinib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "dabrafenib",
        "drugClass": "BRAF inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      },
      {
        "genericName": "trametinib",
        "drugClass": "MEK inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "BRAF V600E",
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_entrectinib",
    "name": "Entrectinib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "entrectinib",
        "drugClass": "TRK/ROS1/ALK TKI",
        "therapyClass": "TRK/ROS1/ALK TKI"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "NTRK-fusion",
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_larotrectinib",
    "name": "Larotrectinib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "larotrectinib",
        "drugClass": "TRK inhibitor",
        "therapyClass": "TRK inhibitor"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "NTRK-fusion",
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_lorlatinib",
    "name": "Lorlatinib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "lorlatinib",
        "drugClass": "ALK/ROS1 TKI",
        "therapyClass": "ALK/ROS1 TKI"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "ALK-rearranged",
    "cardioOncologyClasses": [
      "hyperlipidemia"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_nivolumab_ipilimumab",
    "name": "Nivolumab + ipilimumab",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "ipilimumab",
        "drugClass": "CTLA-4 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_osimertinib",
    "name": "Osimertinib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "osimertinib",
        "drugClass": "EGFR TKI",
        "therapyClass": "EGFR TKI"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "EGFR-mutated",
    "cardioOncologyClasses": [
      "QT prolongation",
      "heart failure/LVEF decline"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_osimertinib_platinum_pemetrexed",
    "name": "Osimertinib + platinum/pemetrexed",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "osimertinib",
        "drugClass": "EGFR TKI",
        "therapyClass": "EGFR TKI"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "EGFR-mutated",
    "combination": true,
    "cardioOncologyClasses": [
      "QT prolongation",
      "heart failure/LVEF decline"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_pembrolizumab_monotherapy",
    "name": "Pembrolizumab monotherapy",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_pralsetinib",
    "name": "Pralsetinib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pralsetinib",
        "drugClass": "RET inhibitor",
        "therapyClass": "RET inhibitor"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "RET-fusion",
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_repotrectinib",
    "name": "Repotrectinib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "repotrectinib",
        "drugClass": "ROS1/TRK/ALK inhibitor",
        "therapyClass": "ROS1/TRK/ALK inhibitor"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "ROS1-positive",
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_selpercatinib",
    "name": "Selpercatinib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "selpercatinib",
        "drugClass": "RET inhibitor",
        "therapyClass": "RET inhibitor"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "RET-fusion",
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_sotorasib",
    "name": "Sotorasib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "sotorasib",
        "drugClass": "KRAS G12C inhibitor",
        "therapyClass": "KRAS G12C inhibitor"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "KRAS G12C",
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_tepotinib",
    "name": "Tepotinib",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "tepotinib",
        "drugClass": "MET inhibitor",
        "therapyClass": "MET inhibitor"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "MET exon14",
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "nsclc_trastuzumab_deruxtecan",
    "name": "Trastuzumab deruxtecan",
    "cancerType": "NSCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "trastuzumab deruxtecan",
        "drugClass": "HER2 antibody-drug conjugate",
        "therapyClass": "HER2-targeted therapy"
      }
    ],
    "sources": [
      "NCI_NSCLC"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/lung/hp/non-small-cell-lung-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "subtype": "HER2-mutated",
    "cardioOncologyClasses": [
      "HER2-targeted",
      "LVEF decline/HF risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "cns_pcv",
    "name": "PCV",
    "cancerType": "oligodendroglial glioma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "procarbazine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "lomustine",
        "drugClass": "nitrosourea alkylating agent",
        "therapyClass": "nitrosourea alkylating agent"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      }
    ],
    "sources": [
      "EVIQ_NEURO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "oligodendroglioma_pcv",
    "name": "PCV",
    "cancerType": "oligodendroglioma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "procarbazine",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "lomustine",
        "drugClass": "nitrosourea alkylating agent",
        "therapyClass": "nitrosourea alkylating agent"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "osteo_map",
    "name": "MAP",
    "cancerType": "osteosarcoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "methotrexate",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "osteosarcoma_map",
    "name": "MAP",
    "cancerType": "osteosarcoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "methotrexate",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "ovarian_bevacizumab_carboplatin_paclitaxel",
    "name": "Bevacizumab + carboplatin + paclitaxel",
    "cancerType": "ovarian",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "bevacizumab",
        "drugClass": "VEGF monoclonal antibody",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "first-line",
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "hypertension",
      "heart failure risk",
      "arterial/venous thromboembolism"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "ovarian_mirvetuximab_soravtansine",
    "name": "Mirvetuximab soravtansine",
    "cancerType": "ovarian",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "mirvetuximab soravtansine",
        "drugClass": "FRα antibody-drug conjugate",
        "therapyClass": "FRα antibody-drug conjugate"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "platinum-resistant",
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "ovarian_niraparib_maintenance",
    "name": "Niraparib maintenance",
    "cancerType": "ovarian",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "niraparib",
        "drugClass": "PARP inhibitor",
        "therapyClass": "PARP inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "maintenance"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "ovarian_olaparib_maintenance",
    "name": "Olaparib maintenance",
    "cancerType": "ovarian",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "olaparib",
        "drugClass": "PARP inhibitor",
        "therapyClass": "PARP inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "maintenance"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "ovary_doxil",
    "name": "Pegylated liposomal doxorubicin",
    "cancerType": "ovarian",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "liposomal doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ovary_gem",
    "name": "Gemcitabine",
    "cancerType": "ovarian",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ovary_topotecan_pac",
    "name": "Topotecan + paclitaxel",
    "cancerType": "ovarian",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "topotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "topoisomerase I inhibitor"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ovary_carbo_doxil_v2variant",
    "name": "Carboplatin + pegylated liposomal doxorubicin (variant)",
    "cancerType": "ovarian/fallopian tube/primary peritoneal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "liposomal doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "ovary_weekly_pac",
    "name": "Weekly paclitaxel",
    "cancerType": "ovarian/fallopian tube/primary peritoneal",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "pan_fluorouracil_rt",
    "name": "5-FU chemoradiation",
    "cancerType": "pancreatic",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "locally advanced chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "pan_gem",
    "name": "Gemcitabine monotherapy",
    "cancerType": "pancreatic",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "EVIQ_UGI"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/upper-gastrointestinal"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "pancreatic_modified_folfirinox",
    "name": "Modified FOLFIRINOX",
    "cancerType": "pancreatic",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "irinotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "topoisomerase I inhibitor"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "NCI_PANCREAS"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/pancreatic/hp/pancreatic-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "neoadjuvant",
      "adjuvant",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "pancreatic_nalirifox",
    "name": "NALIRIFOX",
    "cancerType": "pancreatic",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "leucovorin",
        "drugClass": "folate rescue / fluoropyrimidine modulator",
        "therapyClass": "folate rescue / fluoropyrimidine modulator"
      },
      {
        "genericName": "irinotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "topoisomerase I inhibitor"
      },
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "NCI_PANCREAS"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/pancreatic/hp/pancreatic-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic",
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "pancreatic_olaparib_maintenance_for_germline_brca",
    "name": "Olaparib maintenance for germline BRCA",
    "cancerType": "pancreatic",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "olaparib",
        "drugClass": "PARP inhibitor",
        "therapyClass": "PARP inhibitor"
      }
    ],
    "sources": [
      "NCI_PANCREAS"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/pancreatic/hp/pancreatic-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "maintenance"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "pancreatic_neuroendocrine_tumour_captem",
    "name": "CAPTEM",
    "cancerType": "pancreatic neuroendocrine tumour",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "oral fluoropyrimidine",
        "therapyClass": "oral fluoropyrimidine"
      },
      {
        "genericName": "temozolomide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "NCI_NET"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/gi-cancers/patient/neuroendocrine-tumors-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "pancreatic_neuroendocrine_tumour_everolimus",
    "name": "Everolimus",
    "cancerType": "pancreatic neuroendocrine tumour",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "everolimus",
        "drugClass": "mTOR inhibitor",
        "therapyClass": "mTOR inhibitor"
      }
    ],
    "sources": [
      "NCI_NET"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/gi-cancers/patient/neuroendocrine-tumors-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "pancreatic_neuroendocrine_tumour_sunitinib",
    "name": "Sunitinib",
    "cancerType": "pancreatic neuroendocrine tumour",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "sunitinib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "NCI_NET"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/gi-cancers/patient/neuroendocrine-tumors-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "hypertension",
      "heart failure risk",
      "QT/arrhythmia potential"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "penile_cis5fu",
    "name": "Cisplatin + 5-FU",
    "cancerType": "penile cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "penile_tpf",
    "name": "TPF",
    "cancerType": "penile cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "primary_cns_lymphoma_high_dose_methotrexate_cytarabine_consolidation",
    "name": "High-dose methotrexate + cytarabine consolidation",
    "cancerType": "primary CNS lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "methotrexate",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "consolidation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "primary_cns_lymphoma_high_dose_methotrexate_rituximab",
    "name": "High-dose methotrexate + rituximab",
    "cancerType": "primary CNS lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "methotrexate",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      },
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "frontline",
      "induction"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "primary_cns_lymphoma_matrix",
    "name": "MATRix",
    "cancerType": "primary CNS lymphoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "methotrexate",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      },
      {
        "genericName": "cytarabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "thiotepa",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "rituximab",
        "drugClass": "anti-CD20 monoclonal antibody",
        "therapyClass": "anti-CD20 monoclonal antibody"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "frontline",
      "induction"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "prostate_abiraterone_prednisone_adt",
    "name": "Abiraterone + prednisone + ADT",
    "cancerType": "prostate",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "abiraterone",
        "drugClass": "CYP17 inhibitor",
        "therapyClass": "CYP17 inhibitor"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "leuprolide",
        "drugClass": "GnRH agonist",
        "therapyClass": "GnRH agonist"
      }
    ],
    "sources": [
      "NCI_PROSTATE"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/prostate/hp/prostate-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic castration-sensitive"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "prostate_abiraterone_prednisone_docetaxel_adt",
    "name": "Abiraterone + prednisone + docetaxel + ADT",
    "cancerType": "prostate",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "abiraterone",
        "drugClass": "CYP17 inhibitor",
        "therapyClass": "CYP17 inhibitor"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      },
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "leuprolide",
        "drugClass": "GnRH agonist",
        "therapyClass": "GnRH agonist"
      }
    ],
    "sources": [
      "NCI_PROSTATE"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/prostate/hp/prostate-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic castration-sensitive"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "prostate_apalutamide_adt",
    "name": "Apalutamide + ADT",
    "cancerType": "prostate",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "apalutamide",
        "drugClass": "androgen receptor inhibitor",
        "therapyClass": "androgen receptor inhibitor"
      },
      {
        "genericName": "leuprolide",
        "drugClass": "GnRH agonist",
        "therapyClass": "GnRH agonist"
      }
    ],
    "sources": [
      "NCI_PROSTATE"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/prostate/hp/prostate-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic castration-sensitive"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "prostate_cabazitaxel_v2variant",
    "name": "Cabazitaxel + androgen deprivation (variant)",
    "cancerType": "prostate",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cabazitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "goserelin",
        "drugClass": "GnRH agonist",
        "therapyClass": "GnRH agonist"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "metastatic castration-resistant"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "prostate_darolutamide_adt",
    "name": "Darolutamide + ADT",
    "cancerType": "prostate",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "darolutamide",
        "drugClass": "androgen receptor inhibitor",
        "therapyClass": "androgen receptor inhibitor"
      },
      {
        "genericName": "leuprolide",
        "drugClass": "GnRH agonist",
        "therapyClass": "GnRH agonist"
      }
    ],
    "sources": [
      "NCI_PROSTATE"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/prostate/hp/prostate-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "nonmetastatic castration-resistant"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "prostate_darolutamide_docetaxel_adt",
    "name": "Darolutamide + docetaxel + ADT",
    "cancerType": "prostate",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "darolutamide",
        "drugClass": "androgen receptor inhibitor",
        "therapyClass": "androgen receptor inhibitor"
      },
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "leuprolide",
        "drugClass": "GnRH agonist",
        "therapyClass": "GnRH agonist"
      }
    ],
    "sources": [
      "NCI_PROSTATE"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/prostate/hp/prostate-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic castration-sensitive"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "prostate_docetaxel_v2variant",
    "name": "Docetaxel + androgen deprivation (variant)",
    "cancerType": "prostate",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "goserelin",
        "drugClass": "GnRH agonist",
        "therapyClass": "GnRH agonist"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "metastatic hormone-sensitive"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "prostate_docetaxel_pred",
    "name": "Docetaxel + prednisone",
    "cancerType": "prostate",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "prednisone",
        "drugClass": "corticosteroid",
        "therapyClass": "corticosteroid"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "metastatic castration-resistant"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "prostate_doxorubicin",
    "name": "Doxorubicin",
    "cancerType": "prostate",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "prostate_enzalutamide_adt",
    "name": "Enzalutamide + ADT",
    "cancerType": "prostate",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "enzalutamide",
        "drugClass": "androgen receptor inhibitor",
        "therapyClass": "androgen receptor inhibitor"
      },
      {
        "genericName": "leuprolide",
        "drugClass": "GnRH agonist",
        "therapyClass": "GnRH agonist"
      }
    ],
    "sources": [
      "NCI_PROSTATE"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/prostate/hp/prostate-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic castration-sensitive"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "prostate_lutetium_177_psma_radioligand_therapy",
    "name": "Lutetium-177 PSMA radioligand therapy",
    "cancerType": "prostate",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "lutetium lu 177 vipivotide tetraxetan",
        "drugClass": "PSMA-directed radioligand",
        "therapyClass": "PSMA-directed radioligand"
      }
    ],
    "sources": [
      "NCI_PROSTATE"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/prostate/hp/prostate-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic castration-resistant"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "prostate_olaparib_for_hrr_mutated_mcrpc",
    "name": "Olaparib for HRR-mutated mCRPC",
    "cancerType": "prostate",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "olaparib",
        "drugClass": "PARP inhibitor",
        "therapyClass": "PARP inhibitor"
      }
    ],
    "sources": [
      "NCI_PROSTATE"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/prostate/hp/prostate-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic castration-resistant"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "prostate_radium_223",
    "name": "Radium-223",
    "cancerType": "prostate",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "radium ra 223 dichloride",
        "drugClass": "alpha-emitting radiopharmaceutical",
        "therapyClass": "alpha-emitting radiopharmaceutical"
      }
    ],
    "sources": [
      "NCI_PROSTATE"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/prostate/hp/prostate-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic castration-resistant"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "prostate_rucaparib_for_brca_mutated_mcrpc",
    "name": "Rucaparib for BRCA-mutated mCRPC",
    "cancerType": "prostate",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "rucaparib",
        "drugClass": "PARP inhibitor",
        "therapyClass": "PARP inhibitor"
      }
    ],
    "sources": [
      "NCI_PROSTATE"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/prostate/hp/prostate-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic castration-resistant"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "rcc_cabozantinib",
    "name": "Cabozantinib",
    "cancerType": "renal cell carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cabozantinib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "rcc_lenv_pembro",
    "name": "Lenvatinib + pembrolizumab",
    "cancerType": "renal cell carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "lenvatinib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      },
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy",
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "rcc_nivo_caboz",
    "name": "Nivolumab + cabozantinib",
    "cancerType": "renal cell carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "cabozantinib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy",
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "rcc_nivo_ipi",
    "name": "Nivolumab + ipilimumab",
    "cancerType": "renal cell carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "ipilimumab",
        "drugClass": "CTLA-4 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "rcc_pac_carbo",
    "name": "Paclitaxel + carboplatin",
    "cancerType": "renal cell carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "rcc_pazopanib",
    "name": "Pazopanib",
    "cancerType": "renal cell carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "pazopanib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "rcc_pembro_axitinib",
    "name": "Pembrolizumab + axitinib",
    "cancerType": "renal cell carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "axitinib",
        "drugClass": "VEGFR TKI",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy",
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "rcc_sunitinib",
    "name": "Sunitinib",
    "cancerType": "renal cell carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "sunitinib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "salivary_CAP",
    "name": "CAP",
    "cancerType": "salivary gland",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "salivary_cis_vino",
    "name": "Cisplatin + vinorelbine",
    "cancerType": "salivary gland",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "vinorelbine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      }
    ],
    "sources": [
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "recurrent",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "sclc_atezolizumab_carboplatin_etoposide",
    "name": "Atezolizumab + carboplatin + etoposide",
    "cancerType": "SCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "atezolizumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "extensive-stage",
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "sclc_durvalumab_platinum_etoposide",
    "name": "Durvalumab + platinum + etoposide",
    "cancerType": "SCLC",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "durvalumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "extensive-stage",
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "sclc_lurbinectedin",
    "name": "Lurbinectedin",
    "cancerType": "SCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "lurbinectedin",
        "drugClass": "RNA polymerase II inhibitor",
        "therapyClass": "RNA polymerase II inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "sclc_tarlatamab",
    "name": "Tarlatamab",
    "cancerType": "SCLC",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "tarlatamab",
        "drugClass": "DLL3xCD3 bispecific",
        "therapyClass": "DLL3xCD3 bispecific"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "relapsed",
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "sclc_atezo_chemo",
    "name": "Carboplatin + etoposide + atezolizumab",
    "cancerType": "small-cell lung cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      },
      {
        "genericName": "atezolizumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_RESP",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "relapsed"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "sclc_cav",
    "name": "CAV",
    "cancerType": "small-cell lung cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "vincristine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      }
    ],
    "sources": [
      "EVIQ_RESP",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "sclc_cis_etoposide",
    "name": "Cisplatin + etoposide",
    "cancerType": "small-cell lung cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      }
    ],
    "sources": [
      "EVIQ_RESP",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "sclc_durva_chemo",
    "name": "Platinum + etoposide + durvalumab",
    "cancerType": "small-cell lung cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      },
      {
        "genericName": "durvalumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "EVIQ_RESP",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "limited-stage",
      "extensive-stage"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "sclc_topotecan",
    "name": "Topotecan",
    "cancerType": "small-cell lung cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "topotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "topoisomerase I inhibitor"
      }
    ],
    "sources": [
      "EVIQ_RESP",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/respiratory",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "relapsed"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "sarcoma_doxo",
    "name": "Doxorubicin",
    "cancerType": "soft tissue sarcoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "localized",
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "sarcoma_doxo_ifos",
    "name": "Doxorubicin + ifosfamide",
    "cancerType": "soft tissue sarcoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "ifosfamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "high"
    },
    "settings": [
      "localized",
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "sarcoma_eribulin",
    "name": "Eribulin",
    "cancerType": "soft tissue sarcoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "eribulin",
        "drugClass": "microtubule inhibitor",
        "therapyClass": "microtubule inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "sarcoma_gem_doc",
    "name": "Gemcitabine + docetaxel",
    "cancerType": "soft tissue sarcoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "localized",
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "sarcoma_ifos",
    "name": "Ifosfamide",
    "cancerType": "soft tissue sarcoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "ifosfamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "sarcoma_pac",
    "name": "Paclitaxel",
    "cancerType": "soft tissue sarcoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "localized",
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "sarcoma_trabectedin",
    "name": "Trabectedin",
    "cancerType": "soft tissue sarcoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "trabectedin",
        "drugClass": "transcription inhibitor",
        "therapyClass": "transcription inhibitor"
      }
    ],
    "sources": [
      "EVIQ_SARCOMA"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/sarcoma"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "soft_tissue_sarcoma_doxorubicin_ifosfamide",
    "name": "Doxorubicin + ifosfamide",
    "cancerType": "soft tissue sarcoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "ifosfamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "soft_tissue_sarcoma_eribulin",
    "name": "Eribulin",
    "cancerType": "soft tissue sarcoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "eribulin",
        "drugClass": "microtubule inhibitor",
        "therapyClass": "microtubule inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "soft_tissue_sarcoma_gemcitabine_docetaxel",
    "name": "Gemcitabine + docetaxel",
    "cancerType": "soft tissue sarcoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "soft_tissue_sarcoma_pazopanib",
    "name": "Pazopanib",
    "cancerType": "soft tissue sarcoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pazopanib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "soft_tissue_sarcoma_trabectedin",
    "name": "Trabectedin",
    "cancerType": "soft tissue sarcoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "trabectedin",
        "drugClass": "transcription inhibitor",
        "therapyClass": "transcription inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "testis_tip",
    "name": "TIP",
    "cancerType": "testicular germ cell tumor",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      },
      {
        "genericName": "ifosfamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "salvage"
    ],
    "intent": [
      "salvage"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "testis_veip",
    "name": "VeIP",
    "cancerType": "testicular germ cell tumor",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "vinblastine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      },
      {
        "genericName": "ifosfamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "salvage"
    ],
    "intent": [
      "salvage"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "testis_vip",
    "name": "VIP",
    "cancerType": "testicular germ cell tumor",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      },
      {
        "genericName": "ifosfamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "salvage"
    ],
    "intent": [
      "curative",
      "salvage"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "thymic_carcinoma_carboplatin_paclitaxel",
    "name": "Carboplatin + paclitaxel",
    "cancerType": "thymic carcinoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "thymoma_cap",
    "name": "CAP",
    "cancerType": "thymoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "thy_cabozantinib",
    "name": "Cabozantinib",
    "cancerType": "thyroid cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cabozantinib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_SKIN",
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/skin",
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "thy_lenva",
    "name": "Lenvatinib",
    "cancerType": "thyroid cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "lenvatinib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_SKIN",
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/skin",
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "thy_sorafenib",
    "name": "Sorafenib",
    "cancerType": "thyroid cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "sorafenib",
        "drugClass": "multikinase inhibitor",
        "therapyClass": "VEGF/VEGFR-directed therapy"
      }
    ],
    "sources": [
      "EVIQ_SKIN",
      "EVIQ_HN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/skin",
      "https://www.eviq.org.au/medical-oncology/head-and-neck"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "VEGF/VEGFR-directed therapy"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "thyroid_cancer_selpercatinib_for_ret_fusion_positive_disease",
    "name": "Selpercatinib for RET fusion-positive disease",
    "cancerType": "thyroid cancer",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "selpercatinib",
        "drugClass": "RET inhibitor",
        "therapyClass": "RET inhibitor"
      }
    ],
    "sources": [
      "NCI_THYROID"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/thyroid/hp/thyroid-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "single_5fu",
    "name": "5-FU monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_capecitabine",
    "name": "Capecitabine monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "capecitabine",
        "drugClass": "oral fluoropyrimidine",
        "therapyClass": "oral fluoropyrimidine"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_carboplatin",
    "name": "Carboplatin monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_cisplatin",
    "name": "Cisplatin monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_cyclophosphamide",
    "name": "Cyclophosphamide monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "cyclophosphamide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_docetaxel",
    "name": "Docetaxel monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "docetaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_doxorubicin",
    "name": "Doxorubicin monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_epirubicin",
    "name": "Epirubicin monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "epirubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_etoposide",
    "name": "Etoposide monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "etoposide",
        "drugClass": "topoisomerase II inhibitor",
        "therapyClass": "topoisomerase II inhibitor"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_gemcitabine",
    "name": "Gemcitabine monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_irinotecan",
    "name": "Irinotecan monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "irinotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "topoisomerase I inhibitor"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_oxaliplatin",
    "name": "Oxaliplatin monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "oxaliplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_paclitaxel",
    "name": "Paclitaxel monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "paclitaxel",
        "drugClass": "taxane",
        "therapyClass": "taxane"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_pemetrexed",
    "name": "Pemetrexed monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "pemetrexed",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_temozolomide",
    "name": "Temozolomide monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "temozolomide",
        "drugClass": "alkylating agent",
        "therapyClass": "alkylating agent"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_topotecan",
    "name": "Topotecan monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "topotecan",
        "drugClass": "topoisomerase I inhibitor",
        "therapyClass": "topoisomerase I inhibitor"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "single_vinorelbine",
    "name": "Vinorelbine monotherapy",
    "cancerType": "tumour-agnostic",
    "tier": 3,
    "phases": [],
    "agents": [
      {
        "genericName": "vinorelbine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      }
    ],
    "sources": [
      "EVIQ_NEURO",
      "NCI_ADULT"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/neurological",
      "https://www.cancer.gov/publications/pdq/information-summaries/adult-treatment"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "low_to_moderate"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "tumour_agnostic_dabrafenib_trametinib_for_braf_v600e_solid_tumor",
    "name": "Dabrafenib + trametinib for BRAF V600E solid tumor",
    "cancerType": "tumour-agnostic",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "dabrafenib",
        "drugClass": "BRAF inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      },
      {
        "genericName": "trametinib",
        "drugClass": "MEK inhibitor",
        "therapyClass": "RAF/MEK pathway inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "tumour_agnostic_dostarlimab_for_dmmr_solid_tumor",
    "name": "Dostarlimab for dMMR solid tumor",
    "cancerType": "tumour-agnostic",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "dostarlimab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "PD-1 inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "tumour_agnostic_entrectinib_for_ntrk_fusion",
    "name": "Entrectinib for NTRK fusion",
    "cancerType": "tumour-agnostic",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "entrectinib",
        "drugClass": "TRK/ROS1/ALK TKI",
        "therapyClass": "TRK/ROS1/ALK TKI"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "tumour_agnostic_larotrectinib_for_ntrk_fusion",
    "name": "Larotrectinib for NTRK fusion",
    "cancerType": "tumour-agnostic",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "larotrectinib",
        "drugClass": "TRK inhibitor",
        "therapyClass": "TRK inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "tumour_agnostic_pembrolizumab_for_msi_h_dmmr",
    "name": "Pembrolizumab for MSI-H/dMMR",
    "cancerType": "tumour-agnostic",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "tumour_agnostic_pembrolizumab_for_tmb_high",
    "name": "Pembrolizumab for TMB-high",
    "cancerType": "tumour-agnostic",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "uro_cis_rt",
    "name": "Cisplatin chemoradiation",
    "cancerType": "urothelial",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "locally advanced"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "uro_dose_dense_gemcarbo",
    "name": "Gemcitabine + carboplatin",
    "cancerType": "urothelial",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "carboplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "uro_folfox_rt",
    "name": "5-FU + mitomycin chemoradiation",
    "cancerType": "urothelial",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "fluorouracil",
        "drugClass": "antimetabolite / fluoropyrimidine",
        "therapyClass": "antimetabolite / fluoropyrimidine"
      },
      {
        "genericName": "mitomycin",
        "drugClass": "antitumour antibiotic",
        "therapyClass": "antitumour antibiotic"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "locally advanced chemoradiation"
    ],
    "intent": [
      "curative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "uro_mvAC",
    "name": "MVAC",
    "cancerType": "urothelial",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "methotrexate",
        "drugClass": "antimetabolite / antifolate",
        "therapyClass": "antimetabolite / antifolate"
      },
      {
        "genericName": "vinblastine",
        "drugClass": "vinca alkaloid",
        "therapyClass": "vinca alkaloid"
      },
      {
        "genericName": "doxorubicin",
        "drugClass": "anthracycline",
        "therapyClass": "anthracycline"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_URO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/urogenital"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "advanced"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "urothelial_enfortumab_vedotin_pembrolizumab",
    "name": "Enfortumab vedotin + pembrolizumab",
    "cancerType": "urothelial",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "enfortumab vedotin",
        "drugClass": "antibody-drug conjugate",
        "therapyClass": "antibody-drug conjugate"
      },
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_BLADDER"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/bladder/hp/bladder-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "urothelial_nivolumab_cisplatin_gemcitabine",
    "name": "Nivolumab + cisplatin + gemcitabine",
    "cancerType": "urothelial",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "nivolumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      },
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      }
    ],
    "sources": [
      "NCI_BLADDER"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/bladder/hp/bladder-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "urothelial_pembrolizumab",
    "name": "Pembrolizumab",
    "cancerType": "urothelial",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "pembrolizumab",
        "drugClass": "PD-1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_BLADDER"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/bladder/hp/bladder-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "cardioOncologyClasses": [
      "immune checkpoint inhibitor",
      "immune-mediated myocarditis risk"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "urothelial_platinum_chemotherapy_followed_by_avelumab_maintenance",
    "name": "Platinum chemotherapy followed by avelumab maintenance",
    "cancerType": "urothelial",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      },
      {
        "genericName": "gemcitabine",
        "drugClass": "antimetabolite",
        "therapyClass": "antimetabolite"
      },
      {
        "genericName": "avelumab",
        "drugClass": "PD-L1 inhibitor",
        "therapyClass": "immune checkpoint inhibitor"
      }
    ],
    "sources": [
      "NCI_BLADDER"
    ],
    "sourceUrls": [
      "https://www.cancer.gov/types/bladder/hp/bladder-treatment-pdq"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "advanced",
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "combination": true,
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "uveal_melanoma_tebentafusp",
    "name": "Tebentafusp",
    "cancerType": "uveal melanoma",
    "tier": 1,
    "phases": [],
    "agents": [
      {
        "genericName": "tebentafusp",
        "drugClass": "gp100xCD3 bispecific",
        "therapyClass": "gp100xCD3 bispecific"
      }
    ],
    "sources": [
      "NCI_ADULT"
    ],
    "sourceUrls": [],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": false,
      "currentness": "unknown",
      "confidence": "high_for_regimen_identity"
    },
    "settings": [
      "metastatic"
    ],
    "intent": [
      "palliative"
    ],
    "notes": [
      "Confirm histology, stage, biomarker status, organ function, prior therapy, pregnancy status and local protocol eligibility before use."
    ]
  },
  {
    "id": "vagina_cis_rt",
    "name": "Cisplatin chemoradiation",
    "cancerType": "vaginal cancer",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "locally advanced"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  },
  {
    "id": "vulva_cis_rt",
    "name": "Weekly cisplatin chemoradiation",
    "cancerType": "vulval squamous cell carcinoma",
    "tier": 2,
    "phases": [],
    "agents": [
      {
        "genericName": "cisplatin",
        "drugClass": "platinum",
        "therapyClass": "platinum"
      }
    ],
    "sources": [
      "EVIQ_GYN"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/gynaecological"
    ],
    "lastVerified": "2026-08-19",
    "verification": {
      "verified": true,
      "currentness": "catalogue_current_or_recent",
      "confidence": "moderate"
    },
    "settings": [
      "locally advanced"
    ],
    "intent": [
      "curative"
    ],
    "notes": [
      "Confirm histology, stage, molecular/biomarker criteria and protocol-specific eligibility before use."
    ]
  }
];

/** Superseded/discontinued regimens, kept for audit and search only. */
export const LIBRARY_HISTORICAL = [
  {
    "id": "historical_mayo_crc",
    "name": "Mayo 5-FU/leucovorin",
    "cancerType": "colorectal",
    "status": "historical/discontinued in cited eviQ context"
  },
  {
    "id": "historical_ecf",
    "name": "ECF",
    "cancerType": "gastric/oesophageal",
    "status": "historical/discontinued in cited eviQ context"
  },
  {
    "id": "historical_ecx",
    "name": "ECX",
    "cancerType": "gastric/oesophageal",
    "status": "historical/discontinued in cited eviQ context"
  },
  {
    "id": "historical_folfox4",
    "name": "FOLFOX4",
    "cancerType": "colorectal",
    "status": "protocol variant; discontinued in cited eviQ context"
  },
  {
    "id": "historical_macdonald",
    "name": "MacDonald chemoradiation",
    "cancerType": null,
    "status": "superseded"
  },
  {
    "id": "historical_bep_variant",
    "name": "Bleomycin-containing germ-cell protocol variants",
    "cancerType": null,
    "status": "protocol-dependent"
  },
  {
    "id": "historical_vad",
    "name": "VAD",
    "cancerType": null,
    "status": "historical"
  }
];
