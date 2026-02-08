/**
 * UI translations for service categories and specializations (EN → RO).
 * Database and API remain in English; this is for display only.
 */

import type { ServiceCategoryType } from "../types/company.types";

// Category names as returned by API (from service_categories.name)
const CATEGORY_NAME_EN_TO_RO: Record<string, string> = {
  "Routine Care": "Îngrijire de rutină",
  "Dental Care": "Îngrijire dentară",
  "Diagnostic Services": "Servicii diagnostice",
  "Emergency Care": "Urgențe",
  "Surgical Procedures": "Proceduri chirurgicale",
  Grooming: "Toaletare",
  Custom: "Serviciu personalizat",
};

// Specialization names as returned by API (from category_specializations.name)
const SPECIALIZATION_NAME_EN_TO_RO: Record<string, string> = {
  // Routine Care
  "General Checkup": "Consult general",
  Vaccination: "Vaccinare",
  "Flea/Tick Prevention": "Prevenție purici/căpușe",
  Deworming: "Deparazitare",
  "Nail Trimming": "Tăiere unghi",
  Microchipping: "Microcip",
  // Dental Care
  "Dental Checkup": "Consult stomatologic",
  "Teeth Cleaning": "Detartraj",
  "Tooth Extraction": "Extracție dinte",
  "Dental X-Ray": "Radiografie dentară",
  // Diagnostic Services
  "Blood Test (Basic)": "Analiză sanguină (de bază)",
  "Blood Test (Comprehensive)": "Analiză sanguină (completă)",
  "X-Ray": "Radiografie",
  Ultrasound: "Ecografie",
  Urinalysis: "Analiză urină",
  "Fecal Exam": "Analiză coprologică",
  // Emergency Care
  "Emergency Consultation": "Consult urgențe",
  "Emergency Surgery": "Chirurgie urgențe",
  "Overnight Hospitalization": "Spitalizare",
  "Wound Treatment": "Tratament răni",
  "Poison Treatment": "Tratament intoxicații",
  // Surgical Procedures
  "Spay (Cat)": "Sterilizare (pisică)",
  "Spay (Dog)": "Sterilizare (câine)",
  "Neuter (Cat)": "Castrare (pisică)",
  "Neuter (Dog)": "Castrare (câine)",
  "Soft Tissue Surgery": "Chirurgie țesuturi moi",
  "Orthopedic Surgery": "Chirurgie ortopedică",
  "Tumor Removal": "Ablație tumoare",
  // Grooming
  "Bath & Brush": "Baie și periat",
  "Full Grooming": "Toaletare completă",
  "Haircut/Trim": "Tuns/Aruncat",
  "Ear Cleaning": "Curățare urechi",
  "Anal Gland Expression": "Expresie glande anale",
};

// Descrieri categorii (EN name → RO description)
const CATEGORY_DESCRIPTION_EN_TO_RO: Record<string, string> = {
  "Routine Care": "Controluri regulate și îngrijire preventivă",
  "Dental Care": "Sănătate orală și proceduri dentare",
  "Diagnostic Services": "Analize, imagistică și diagnostice",
  "Emergency Care": "Servicii de urgență",
  "Surgical Procedures": "Intervenții chirurgicale",
  Grooming: "Toaletare și igienă",
  Custom: "Serviciu definit de clinică",
};

// Descrieri specializări: cheie "CategoryName|SpecializationName" → RO description
const SPECIALIZATION_DESCRIPTION_EN_TO_RO: Record<string, string> = {
  "Routine Care|General Checkup": "Examinare fizică completă",
  "Routine Care|Vaccination": "Administrare vaccin",
  "Routine Care|Flea/Tick Prevention": "Tratament lunar de prevenție",
  "Routine Care|Deworming": "Tratament antiparazitar",
  "Routine Care|Nail Trimming": "Îngrijire unghi",
  "Routine Care|Microchipping": "Identificare permanentă",
  "Dental Care|Dental Checkup": "Examinare sănătate orală",
  "Dental Care|Teeth Cleaning": "Curățare dentară profesională",
  "Dental Care|Tooth Extraction": "Îndepărtare chirurgicală dinte",
  "Dental Care|Dental X-Ray": "Radiografii dentare",
  "Diagnostic Services|Blood Test (Basic)": "Hemogramă",
  "Diagnostic Services|Blood Test (Comprehensive)": "Analiză panel complet",
  "Diagnostic Services|X-Ray": "Imagistică radiografică",
  "Diagnostic Services|Ultrasound": "Imagistică ecografică",
  "Diagnostic Services|Urinalysis": "Analiză urină",
  "Diagnostic Services|Fecal Exam": "Analiză coprologică",
  "Emergency Care|Emergency Consultation": "Evaluare de urgență",
  "Emergency Care|Emergency Surgery": "Intervenție chirurgicală de urgență",
  "Emergency Care|Overnight Hospitalization": "Monitorizare spitalizare",
  "Emergency Care|Wound Treatment": "Tratament răni urgență",
  "Emergency Care|Poison Treatment": "Tratament intoxicații",
  "Surgical Procedures|Spay (Cat)": "Operație sterilizare felină",
  "Surgical Procedures|Spay (Dog)": "Operație sterilizare canină",
  "Surgical Procedures|Neuter (Cat)": "Operație castrare felină",
  "Surgical Procedures|Neuter (Dog)": "Operație castrare canină",
  "Surgical Procedures|Soft Tissue Surgery": "Proceduri chirurgicale non-ortopedice",
  "Surgical Procedures|Orthopedic Surgery": "Chirurgie osoasă și articulară",
  "Surgical Procedures|Tumor Removal": "Excisie formațiune",
  "Grooming|Bath & Brush": "Băi și periat de bază",
  "Grooming|Full Grooming": "Pachet toaletare completă",
  "Grooming|Haircut/Trim": "Tuns și aruncat",
  "Grooming|Ear Cleaning": "Curățare și verificare urechi",
  "Grooming|Anal Gland Expression": "Expresie glande anale",
};

/** Etichete categorii în română (după cheia ServiceCategoryType) */
export const ServiceCategoryLabelsRO: Record<ServiceCategoryType, string> = {
  routine_care: "Îngrijire de rutină",
  dental_care: "Îngrijire dentară",
  diagnostic_services: "Servicii diagnostice",
  emergency_care: "Urgențe",
  surgical_procedures: "Proceduri chirurgicale",
  grooming: "Toaletare",
  custom: "Serviciu personalizat",
};

/**
 * Translate category name from API (English) to Romanian for display.
 * Falls back to original string if no mapping exists.
 */
export function translateCategoryName(enName: string): string {
  if (!enName || typeof enName !== "string") return enName || "";
  return CATEGORY_NAME_EN_TO_RO[enName.trim()] ?? enName;
}

/**
 * Translate specialization name from API (English) to Romanian for display.
 * Falls back to original string if no mapping exists.
 */
export function translateSpecializationName(enName: string): string {
  if (!enName || typeof enName !== "string") return enName || "";
  return SPECIALIZATION_NAME_EN_TO_RO[enName.trim()] ?? enName;
}

/**
 * Get Romanian label for a ServiceCategoryType key (e.g. from company_services.category).
 */
export function getCategoryLabelRO(
  categoryKey: ServiceCategoryType | string,
): string {
  if (ServiceCategoryLabelsRO[categoryKey as ServiceCategoryType]) {
    return ServiceCategoryLabelsRO[categoryKey as ServiceCategoryType];
  }
  return translateCategoryName(categoryKey);
}

/**
 * Translate category description from API (English) to Romanian for display.
 */
export function translateCategoryDescription(enCategoryName: string): string {
  if (!enCategoryName || typeof enCategoryName !== "string") return "";
  return CATEGORY_DESCRIPTION_EN_TO_RO[enCategoryName.trim()] ?? "";
}

/**
 * Translate specialization description from API (English) to Romanian for display.
 */
export function translateSpecializationDescription(
  enCategoryName: string,
  enSpecializationName: string,
): string {
  if (!enCategoryName || !enSpecializationName) return "";
  const key = `${enCategoryName.trim()}|${enSpecializationName.trim()}`;
  return SPECIALIZATION_DESCRIPTION_EN_TO_RO[key] ?? "";
}
