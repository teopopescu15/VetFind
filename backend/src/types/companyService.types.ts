// Company Service Types for VetFinder Backend
// Follows object-literal pattern (no classes)

export type ServiceCategory =
  | 'routine_care'
  | 'dental_care'
  | 'diagnostic_services'
  | 'emergency_care'
  | 'surgical_procedures'
  | 'grooming'
  | 'custom';

export interface CompanyService {
  id: number;
  company_id: number;

  // Service Information
  category: ServiceCategory;
  service_name: string;
  description?: string;

  // Specialization reference (null for custom services)
  specialization_id?: number | null;
  category_id?: number;

  // Pricing
  price_min: number;
  price_max: number;

  // Duration (in minutes)
  duration_minutes?: number;

  // Flags
  is_custom: boolean;
  is_active: boolean;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface CreateServiceDTO {
  company_id: number;
  category: ServiceCategory;
  service_name: string;
  description?: string;
  specialization_id?: number | null;
  category_id?: number;
  price_min: number;
  price_max: number;
  duration_minutes?: number;
  is_custom?: boolean;
}

export interface UpdateServiceDTO {
  category?: ServiceCategory;
  service_name?: string;
  description?: string;
  specialization_id?: number | null;
  category_id?: number;
  price_min?: number;
  price_max?: number;
  duration_minutes?: number;
  is_active?: boolean;
}

export interface BulkCreateServiceDTO {
  services: CreateServiceDTO[];
}

// Pre-defined service templates for each category
export interface ServiceTemplate {
  category: ServiceCategory;
  service_name: string;
  suggested_price_min: number;
  suggested_price_max: number;
  duration_minutes?: number;
  description: string;
}

// Șabloane de servicii pentru clinici (texte în română pentru UI)
export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  // Îngrijire de rutină
  {
    category: 'routine_care',
    service_name: 'Control general',
    suggested_price_min: 50,
    suggested_price_max: 80,
    duration_minutes: 30,
    description: 'Examinare fizică completă',
  },
  {
    category: 'routine_care',
    service_name: 'Vaccinare (per doză)',
    suggested_price_min: 25,
    suggested_price_max: 45,
    duration_minutes: 15,
    description: 'Administrare vaccin',
  },
  {
    category: 'routine_care',
    service_name: 'Prevenție purici/căpușe',
    suggested_price_min: 30,
    suggested_price_max: 60,
    duration_minutes: 10,
    description: 'Tratament lunar de prevenție',
  },
  {
    category: 'routine_care',
    service_name: 'Degelmintizare',
    suggested_price_min: 20,
    suggested_price_max: 40,
    duration_minutes: 10,
    description: 'Tratament antiparazitar',
  },
  {
    category: 'routine_care',
    service_name: 'Tăiere unghi',
    suggested_price_min: 15,
    suggested_price_max: 25,
    duration_minutes: 15,
    description: 'Îngrijire unghi',
  },
  {
    category: 'routine_care',
    service_name: 'Microcip',
    suggested_price_min: 45,
    suggested_price_max: 75,
    duration_minutes: 20,
    description: 'Identificare permanentă',
  },

  // Îngrijire dentară
  {
    category: 'dental_care',
    service_name: 'Control dentar',
    suggested_price_min: 60,
    suggested_price_max: 100,
    duration_minutes: 30,
    description: 'Examinare sănătate orală',
  },
  {
    category: 'dental_care',
    service_name: 'Curățare dentară',
    suggested_price_min: 200,
    suggested_price_max: 400,
    duration_minutes: 90,
    description: 'Curățare dentară profesională',
  },
  {
    category: 'dental_care',
    service_name: 'Extracție dentară',
    suggested_price_min: 300,
    suggested_price_max: 800,
    duration_minutes: 120,
    description: 'Îndepărtare chirurgicală dinte',
  },

  // Servicii diagnostice
  {
    category: 'diagnostic_services',
    service_name: 'Analiză de sânge (de bază)',
    suggested_price_min: 80,
    suggested_price_max: 150,
    duration_minutes: 30,
    description: 'Hemogramă și biochimie',
  },
  {
    category: 'diagnostic_services',
    service_name: 'Radiografie',
    suggested_price_min: 150,
    suggested_price_max: 300,
    duration_minutes: 45,
    description: 'Imagistică radiografică',
  },
  {
    category: 'diagnostic_services',
    service_name: 'Ecografie',
    suggested_price_min: 250,
    suggested_price_max: 500,
    duration_minutes: 60,
    description: 'Imagistică ecografică',
  },
  {
    category: 'diagnostic_services',
    service_name: 'Analiză urină',
    suggested_price_min: 50,
    suggested_price_max: 100,
    duration_minutes: 20,
    description: 'Analiză urină',
  },

  // Urgențe
  {
    category: 'emergency_care',
    service_name: 'Consultație urgențe',
    suggested_price_min: 150,
    suggested_price_max: 300,
    duration_minutes: 30,
    description: 'Evaluare de urgență',
  },
  {
    category: 'emergency_care',
    service_name: 'Chirurgie de urgență',
    suggested_price_min: 1000,
    suggested_price_max: 5000,
    duration_minutes: 180,
    description: 'Intervenție chirurgicală de urgență',
  },
  {
    category: 'emergency_care',
    service_name: 'Spitalizare peste noapte',
    suggested_price_min: 200,
    suggested_price_max: 500,
    duration_minutes: 1440, // 24 ore
    description: 'Îngrijiri și monitorizare',
  },

  // Proceduri chirurgicale
  {
    category: 'surgical_procedures',
    service_name: 'Sterilizare (pisică)',
    suggested_price_min: 150,
    suggested_price_max: 300,
    duration_minutes: 90,
    description: 'Operație de sterilizare felină',
  },
  {
    category: 'surgical_procedures',
    service_name: 'Sterilizare (câine)',
    suggested_price_min: 200,
    suggested_price_max: 500,
    duration_minutes: 120,
    description: 'Operație de sterilizare canină',
  },
  {
    category: 'surgical_procedures',
    service_name: 'Chirurgie tesuturi moi',
    suggested_price_min: 500,
    suggested_price_max: 2000,
    duration_minutes: 120,
    description: 'Intervenții chirurgicale non-ortopedice',
  },
  {
    category: 'surgical_procedures',
    service_name: 'Chirurgie ortopedică',
    suggested_price_min: 2000,
    suggested_price_max: 5000,
    duration_minutes: 180,
    description: 'Chirurgie osoasă și articulară',
  },

  // Toaletare
  {
    category: 'grooming',
    service_name: 'Băi și periat',
    suggested_price_min: 40,
    suggested_price_max: 80,
    duration_minutes: 60,
    description: 'Băi și periat de bază',
  },
  {
    category: 'grooming',
    service_name: 'Toaletare completă',
    suggested_price_min: 60,
    suggested_price_max: 150,
    duration_minutes: 120,
    description: 'Pachet toaletare completă',
  },
  {
    category: 'grooming',
    service_name: 'Curățare urechi',
    suggested_price_min: 20,
    suggested_price_max: 35,
    duration_minutes: 15,
    description: 'Curățare și verificare urechi',
  },
];
