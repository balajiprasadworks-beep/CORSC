export type DiagnosisOption = {
  label: string
  stageKey?: keyof typeof STAGE_OPTIONS
}

export type DiagnosisGroup = {
  label: string
  subgroups: {
    label?: string
    diagnoses: DiagnosisOption[]
  }[]
}

const notSpecifiedStages = [
  "Not staged",
  "Not applicable",
  "Other / not listed",
]

export const STAGE_OPTIONS = {
  unspecified: notSpecifiedStages,
  breast: ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"],
  nsclc: ["Stage 0", "Stage I", "Stage II", "Stage IIIA", "Stage IIIB", "Stage IIIC", "Stage IVA", "Stage IVB"],
  sclc: ["Stage I", "Stage II", "Stage III", "Stage IV"],
  esophageal: ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IVA", "Stage IVB"],
  gastric: ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"],
  colorectal: ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"],
  hcc: ["Stage I", "Stage II", "Stage IIIA", "Stage IIIB", "Stage IVA", "Stage IVB"],
  cholangiocarcinoma: ["Stage I", "Stage II", "Stage III", "Stage IVA", "Stage IVB"],
  gallbladder: ["Stage 0", "Stage I", "Stage II", "Stage IIIA", "Stage IIIB", "Stage IVA", "Stage IVB"],
  pancreatic: ["Stage 0", "Stage IA", "Stage IB", "Stage IIA", "Stage IIB", "Stage III", "Stage IV"],
  headNeck: ["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IVA", "Stage IVB", "Stage IVC"],
  cervical: ["Stage I", "Stage IA", "Stage IB", "Stage II", "Stage IIA", "Stage IIB", "Stage III", "Stage IIIA", "Stage IIIB", "Stage IIIC", "Stage IVA", "Stage IVB"],
  endometrial: ["Stage I", "Stage IA", "Stage IB", "Stage II", "Stage IIIA", "Stage IIIB", "Stage IIIC", "Stage IVA", "Stage IVB"],
  ovarian: ["Stage I", "Stage IA", "Stage IB", "Stage IC", "Stage II", "Stage IIA", "Stage IIB", "Stage IIIA", "Stage IIIB", "Stage IIIC", "Stage IVA", "Stage IVB"],
  vulvar: ["Stage I", "Stage IA", "Stage IB", "Stage II", "Stage III", "Stage IVA", "Stage IVB"],
  vaginal: ["Stage I", "Stage II", "Stage III", "Stage IVA", "Stage IVB"],
  renal: ["Stage I", "Stage II", "Stage III", "Stage IV"],
  bladder: ["Stage 0a", "Stage 0is", "Stage I", "Stage II", "Stage IIIA", "Stage IIIB", "Stage IVA", "Stage IVB"],
  prostate: ["Stage I", "Stage IIA", "Stage IIB", "Stage IIC", "Stage IIIA", "Stage IIIB", "Stage IIIC", "Stage IVA", "Stage IVB"],
  testicular: ["Stage IS", "Stage I", "Stage IA", "Stage IB", "Stage IIA", "Stage IIB", "Stage IIC", "Stage IIIA", "Stage IIIB", "Stage IIIC"],
  thyroid: ["Stage I", "Stage II", "Stage III", "Stage IVA", "Stage IVB", "Stage IVC"],
  adrenal: ["Stage I", "Stage II", "Stage III", "Stage IV"],
  melanoma: ["Stage 0", "Stage I", "Stage IA", "Stage IB", "Stage IIA", "Stage IIB", "Stage IIC", "Stage IIIA", "Stage IIIB", "Stage IIIC", "Stage IIID", "Stage IV"],
  merkel: ["Stage I", "Stage II", "Stage III", "Stage IV"],
  softTissueSarcoma: ["Stage IA", "Stage IB", "Stage II", "Stage IIIA", "Stage IIIB", "Stage IV"],
  osteosarcoma: ["Stage IA", "Stage IB", "Stage IIA", "Stage IIB", "Stage III", "Stage IV"],
  ewing: ["Localized", "Metastatic", "Recurrent"],
  brain: ["WHO Grade 1", "WHO Grade 2", "WHO Grade 3", "WHO Grade 4"],
  aml: ["Newly Diagnosed", "Complete Remission (CR)", "Relapsed", "Refractory"],
  all: ["Newly Diagnosed", "Complete Remission (CR)", "Relapsed", "Refractory"],
  cml: ["Chronic Phase", "Accelerated Phase", "Blast Phase"],
  cll: ["Rai Stage 0", "Rai Stage I", "Rai Stage II", "Rai Stage III", "Rai Stage IV"],
  lymphoma: ["Stage I", "Stage II", "Stage III", "Stage IV"],
  myeloma: ["R-ISS Stage I", "R-ISS Stage II", "R-ISS Stage III"],
  mds: ["Low Risk", "Intermediate Risk", "High Risk"],
  myelofibrosis: ["Low Risk", "Intermediate-1 Risk", "Intermediate-2 Risk", "High Risk"],
  polycythemiaVera: ["Low Risk", "High Risk"],
  essentialThrombocythemia: ["Very Low Risk", "Low Risk", "Intermediate Risk", "High Risk"],
  alAmyloidosis: ["Mayo Stage I", "Mayo Stage II", "Mayo Stage III", "Mayo Stage IV"],
} as const

export const DIAGNOSIS_GROUPS: DiagnosisGroup[] = [
  { label: "Breast cancer", subgroups: [{ diagnoses: [
    { label: "Breast carcinoma", stageKey: "breast" }, { label: "Ductal carcinoma in situ (DCIS)", stageKey: "breast" },
    { label: "Invasive ductal carcinoma", stageKey: "breast" }, { label: "Invasive lobular carcinoma", stageKey: "breast" },
    { label: "Triple-negative breast cancer", stageKey: "breast" }, { label: "HER2-positive breast cancer", stageKey: "breast" },
    { label: "Inflammatory breast cancer", stageKey: "breast" }, { label: "Metastatic breast cancer", stageKey: "breast" },
  ] }] },
  { label: "Lung cancer", subgroups: [{ diagnoses: [
    { label: "Non-small cell lung cancer (NSCLC)", stageKey: "nsclc" }, { label: "Adenocarcinoma lung", stageKey: "nsclc" },
    { label: "Squamous cell carcinoma lung", stageKey: "nsclc" }, { label: "Large cell carcinoma", stageKey: "nsclc" },
    { label: "Small cell lung cancer (SCLC)", stageKey: "sclc" }, { label: "Mesothelioma" },
  ] }] },
  { label: "Gastrointestinal cancers", subgroups: [
    { label: "Esophagus", diagnoses: [{ label: "Esophageal adenocarcinoma", stageKey: "esophageal" }, { label: "Esophageal squamous cell carcinoma", stageKey: "esophageal" }] },
    { label: "Stomach", diagnoses: [{ label: "Gastric adenocarcinoma", stageKey: "gastric" }, { label: "Gastroesophageal junction cancer", stageKey: "gastric" }] },
    { label: "Small bowel", diagnoses: [{ label: "Small bowel adenocarcinoma" }] },
    { label: "Colon & rectum", diagnoses: [{ label: "Colon adenocarcinoma", stageKey: "colorectal" }, { label: "Rectal adenocarcinoma", stageKey: "colorectal" }, { label: "Colorectal carcinoma", stageKey: "colorectal" }] },
    { label: "Appendix", diagnoses: [{ label: "Appendiceal adenocarcinoma" }] },
    { label: "Anal canal", diagnoses: [{ label: "Anal squamous carcinoma" }] },
  ] },
  { label: "Hepatobiliary cancers", subgroups: [{ diagnoses: [
    { label: "Hepatocellular carcinoma (HCC)", stageKey: "hcc" }, { label: "Intrahepatic cholangiocarcinoma", stageKey: "cholangiocarcinoma" },
    { label: "Extrahepatic cholangiocarcinoma", stageKey: "cholangiocarcinoma" }, { label: "Gallbladder carcinoma", stageKey: "gallbladder" }, { label: "Ampullary carcinoma" },
  ] }] },
  { label: "Pancreatic cancers", subgroups: [{ diagnoses: [{ label: "Pancreatic adenocarcinoma", stageKey: "pancreatic" }, { label: "Neuroendocrine tumor pancreas" }] }] },
  { label: "Head & neck cancers", subgroups: [{ diagnoses: [
    { label: "Oral cavity carcinoma", stageKey: "headNeck" }, { label: "Tongue carcinoma", stageKey: "headNeck" }, { label: "Buccal mucosa carcinoma", stageKey: "headNeck" },
    { label: "Gingival carcinoma", stageKey: "headNeck" }, { label: "Floor of mouth carcinoma", stageKey: "headNeck" }, { label: "Lip carcinoma", stageKey: "headNeck" },
    { label: "Oropharyngeal carcinoma", stageKey: "headNeck" }, { label: "Nasopharyngeal carcinoma", stageKey: "headNeck" }, { label: "Hypopharyngeal carcinoma", stageKey: "headNeck" },
    { label: "Laryngeal carcinoma", stageKey: "headNeck" }, { label: "Salivary gland carcinoma", stageKey: "headNeck" }, { label: "Sinonasal carcinoma", stageKey: "headNeck" },
  ] }] },
  { label: "Gynecological cancers", subgroups: [{ diagnoses: [
    { label: "Cervical carcinoma", stageKey: "cervical" }, { label: "Endometrial carcinoma", stageKey: "endometrial" }, { label: "Uterine sarcoma", stageKey: "endometrial" },
    { label: "Ovarian epithelial carcinoma", stageKey: "ovarian" }, { label: "Fallopian tube carcinoma", stageKey: "ovarian" }, { label: "Primary peritoneal carcinoma", stageKey: "ovarian" },
    { label: "Vulvar carcinoma", stageKey: "vulvar" }, { label: "Vaginal carcinoma", stageKey: "vaginal" }, { label: "Gestational trophoblastic neoplasia" },
  ] }] },
  { label: "Urological cancers", subgroups: [
    { label: "Kidney", diagnoses: [{ label: "Renal cell carcinoma", stageKey: "renal" }, { label: "Wilms tumor", stageKey: "renal" }] },
    { label: "Bladder", diagnoses: [{ label: "Urothelial carcinoma", stageKey: "bladder" }, { label: "Bladder squamous carcinoma", stageKey: "bladder" }] },
    { label: "Prostate", diagnoses: [{ label: "Prostate adenocarcinoma", stageKey: "prostate" }] },
    { label: "Testis", diagnoses: [{ label: "Seminoma", stageKey: "testicular" }, { label: "Non-seminomatous germ cell tumor", stageKey: "testicular" }] },
    { label: "Penis", diagnoses: [{ label: "Penile squamous carcinoma" }] },
  ] },
  { label: "Hematological malignancies", subgroups: [
    { label: "Leukemia", diagnoses: [{ label: "Acute myeloid leukemia (AML)", stageKey: "aml" }, { label: "Acute lymphoblastic leukemia (ALL)", stageKey: "all" }, { label: "Chronic myeloid leukemia (CML)", stageKey: "cml" }, { label: "Chronic lymphocytic leukemia (CLL)", stageKey: "cll" }] },
    { label: "Lymphoma", diagnoses: [{ label: "Hodgkin lymphoma", stageKey: "lymphoma" }, { label: "Diffuse large B-cell lymphoma", stageKey: "lymphoma" }, { label: "Follicular lymphoma", stageKey: "lymphoma" }, { label: "Mantle cell lymphoma", stageKey: "lymphoma" }, { label: "Burkitt lymphoma", stageKey: "lymphoma" }, { label: "Peripheral T-cell lymphoma", stageKey: "lymphoma" }, { label: "Cutaneous T-cell lymphoma", stageKey: "lymphoma" }, { label: "Primary mediastinal lymphoma", stageKey: "lymphoma" }] },
    { label: "Plasma cell disorders", diagnoses: [{ label: "Multiple myeloma", stageKey: "myeloma" }, { label: "Solitary plasmacytoma" }, { label: "AL amyloidosis", stageKey: "alAmyloidosis" }] },
    { label: "Myelodysplastic disorders", diagnoses: [{ label: "Myelodysplastic syndrome (MDS)", stageKey: "mds" }, { label: "Myeloproliferative neoplasm (MPN)" }, { label: "Myelofibrosis", stageKey: "myelofibrosis" }, { label: "Polycythemia vera", stageKey: "polycythemiaVera" }, { label: "Essential thrombocythemia", stageKey: "essentialThrombocythemia" }] },
  ] },
  { label: "Sarcomas", subgroups: [
    { label: "Soft tissue sarcoma", diagnoses: [{ label: "Liposarcoma", stageKey: "softTissueSarcoma" }, { label: "Leiomyosarcoma", stageKey: "softTissueSarcoma" }, { label: "Synovial sarcoma", stageKey: "softTissueSarcoma" }, { label: "Undifferentiated pleomorphic sarcoma", stageKey: "softTissueSarcoma" }, { label: "Angiosarcoma", stageKey: "softTissueSarcoma" }, { label: "Rhabdomyosarcoma", stageKey: "softTissueSarcoma" }] },
    { label: "Bone", diagnoses: [{ label: "Osteosarcoma", stageKey: "osteosarcoma" }, { label: "Ewing sarcoma", stageKey: "ewing" }, { label: "Chondrosarcoma" }] },
  ] },
  { label: "Skin cancers", subgroups: [{ diagnoses: [{ label: "Malignant melanoma", stageKey: "melanoma" }, { label: "Cutaneous squamous cell carcinoma" }, { label: "Merkel cell carcinoma", stageKey: "merkel" }, { label: "Basal cell carcinoma (advanced)" }] }] },
  { label: "Brain & CNS tumors", subgroups: [{ diagnoses: [{ label: "Glioblastoma", stageKey: "brain" }, { label: "Astrocytoma", stageKey: "brain" }, { label: "Oligodendroglioma", stageKey: "brain" }, { label: "Medulloblastoma", stageKey: "brain" }, { label: "Ependymoma", stageKey: "brain" }, { label: "CNS lymphoma", stageKey: "brain" }] }] },
  { label: "Endocrine tumors", subgroups: [{ diagnoses: [{ label: "Thyroid carcinoma", stageKey: "thyroid" }, { label: "Medullary thyroid carcinoma", stageKey: "thyroid" }, { label: "Anaplastic thyroid carcinoma", stageKey: "thyroid" }, { label: "Adrenal cortical carcinoma", stageKey: "adrenal" }, { label: "Pheochromocytoma" }, { label: "Paraganglioma" }] }] },
  { label: "Neuroendocrine tumors", subgroups: [{ diagnoses: [{ label: "Pancreatic NET" }, { label: "Small intestinal NET" }, { label: "Lung NET" }, { label: "High-grade neuroendocrine carcinoma" }] }] },
  { label: "Pediatric malignancies", subgroups: [{ diagnoses: [{ label: "Neuroblastoma" }, { label: "Wilms tumor", stageKey: "renal" }, { label: "Retinoblastoma" }, { label: "Hepatoblastoma" }, { label: "Medulloblastoma", stageKey: "brain" }, { label: "Rhabdomyosarcoma", stageKey: "softTissueSarcoma" }, { label: "Osteosarcoma", stageKey: "osteosarcoma" }, { label: "Ewing sarcoma", stageKey: "ewing" }, { label: "ALL", stageKey: "all" }, { label: "AML", stageKey: "aml" }] }] },
  { label: "Cancer of unknown primary", subgroups: [{ diagnoses: [{ label: "Carcinoma of unknown primary (CUP)" }] }] },
  { label: "Other rare malignancies", subgroups: [{ diagnoses: [{ label: "Thymoma" }, { label: "Thymic carcinoma" }, { label: "Desmoid tumor" }, { label: "Germ cell tumor (extragonadal)" }, { label: "Castleman disease" }, { label: "Langerhans cell histiocytosis" }, { label: "Histiocytic sarcoma" }] }] },
]

const flattenedDiagnoses = DIAGNOSIS_GROUPS.flatMap((category) =>
  category.subgroups.flatMap((subgroup) => subgroup.diagnoses)
)

export function findDiagnosis(label: string) {
  return flattenedDiagnoses.find((diagnosis) => diagnosis.label === label)
}

export function stagesForDiagnosis(label: string) {
  const stageKey = findDiagnosis(label)?.stageKey ?? "unspecified"
  return STAGE_OPTIONS[stageKey]
}
