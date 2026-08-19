/* =========================================================================
   CORSC oncology regimen library — bundled reference data.

   GENERATED FILE. Source: CORSC Comprehensive Oncology Regimen Library
   0.1.0-research-release, verified 2026-08-18. Do not hand-edit; regenerate
   from the research release instead.

   WHAT THIS IS: a regimen *identity* library — which regimens exist, what
   phases they run in, and which agents each phase contains. It is deliberately
   NOT a dosing or prescribing database: the research release encodes no doses,
   because a dose that varies by protocol, body surface area and local practice
   cannot be asserted from a preset without inventing a clinical fact.

   WHAT IT DOES NOT DO: assign patient risk. `therapyClass` here is the
   library's own vocabulary. Mapping it onto the CORSC therapy classes the
   engines consume happens in lib/treatment-course.js, deliberately, and only
   where a defensible counterpart exists.
   ========================================================================= */

export const LIBRARY_VERSION = "0.1.0-research-release";
export const LIBRARY_VERIFIED_ON = "2026-08-18";

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
  }
};

/** Current regimens, ordered by cancer type then name. */
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
      "salvage"
    ],
    "intent": [
      "salvage"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "anthracycline"
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
      "NCI_RCHOP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/types/lymphoma/hp/aggressive-b-cell-lymphoma-treatment-pdq",
      "https://www.cancer.gov/about-cancer/treatment/drugs/r-chop"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "RCHOP"
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
      "salvage"
    ],
    "intent": [
      "salvage"
    ],
    "combination": true
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
      "salvage"
    ],
    "intent": [
      "salvage"
    ],
    "combination": true,
    "cardioOncologyClasses": [
      "platinum"
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
    "combination": true
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
      "EVIQ_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast"
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
      "EVIQ_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast"
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
      "EVIQ_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "ddAC-T"
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
    "cardioOncologyClasses": [
      "HER2-targeted therapy"
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
      "EVIQ_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast"
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
      "EVIQ_BREAST"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/breast"
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
    "combination": true
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
    "cardioOncologyClasses": [
      "HER2-targeted therapy"
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
    "combination": true
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
      "EVIQ_COLORECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal"
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
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
    ],
    "lastVerified": "2026-08-18",
    "verification": {
      "verified": true,
      "currentness": "current",
      "confidence": "high"
    },
    "aliases": [
      "XELOX"
    ],
    "settings": [
      "adjuvant",
      "metastatic"
    ],
    "intent": [
      "curative",
      "palliative"
    ],
    "combination": true
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
      "ESC_CO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
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
      "VEGF/VEGFR-directed therapy"
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
      "EVIQ_COLORECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal"
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
    "combination": true
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
      "ESC_CO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
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
      "VEGF/VEGFR-directed therapy"
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
      "EVIQ_COLORECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal"
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
    "combination": true
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
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
      "https://www.cancer.gov/types/colorectal/hp/rectal-treatment-pdq"
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
      "modified FOLFOX6"
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
      "FOLFOX is a regimen family with multiple protocol variants; CORSC should not treat the family name as one universal dosing schedule."
    ]
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
      "ESC_CO"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
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
      "VEGF/VEGFR-directed therapy"
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
      "NCI_RECTAL"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/medical-oncology/colorectal",
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
    "combination": true
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
      "NCI_RCHOP"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt",
      "https://www.cancer.gov/about-cancer/treatment/drugs/r-chop"
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
    "combination": true
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
      "eviQ describes four pre-operative and four post-operative cycles around surgery; the surgery interval is modeled as a non-drug phase."
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
    "combination": true
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
    "combination": true
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
    "combination": true
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
      "salvage"
    ],
    "intent": [
      "salvage"
    ],
    "combination": true
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
    "combination": true
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
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt"
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
      "EVIQ_HEM"
    ],
    "sourceUrls": [
      "https://www.eviq.org.au/haematology-and-bmt"
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
    "combination": true
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
    "combination": true
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
    "combination": true
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
    "combination": true
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
    "combination": true
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
    "combination": true
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
      "modified FOLFIRINOX"
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
    "combination": true
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
    "combination": true
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
    "combination": true
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
    "combination": true
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
    "combination": true
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
    ]
  }
];

/** Superseded regimens, kept so a historical record still resolves a name. */
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
  }
];
