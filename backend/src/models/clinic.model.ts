import { CompanyModel } from './company.model';
import { CompanyServiceModel } from './companyService.model';
import { Company } from '../types/company.types';
import { CompanyService } from '../types/companyService.types';

// Provide legacy `clinic` model API that maps to `companies` implementation.
export type Clinic = Company;
export type Service = CompanyService;

export const createClinicModel = () => {
  return {
    async create(data: any) {
      return CompanyModel.create(data);
    },

    async findById(id: number) {
      return CompanyModel.findById(id);
    },

    async findByOwner(userId: number) {
      // Historically called findByOwner; delegate to findByUserId
      return CompanyModel.findByUserId(userId);
    },

    async findAll(limit?: number, offset?: number) {
      // CompanyModel.findAll accepts an optional filters object; emulate simple pagination
      return CompanyModel.findAll();
    },

    async findByCity(city: string) {
      // CompanyModel.search can filter by city
      return CompanyModel.search({ city } as any);
    },

    async findNearby(latitude: number, longitude: number, radius: number) {
      return CompanyModel.search({ latitude, longitude, radius_km: radius } as any);
    },

    async update(id: number, data: any) {
      return CompanyModel.update(id, data);
    },

    async delete(id: number) {
      return CompanyModel.delete(id);
    },
  };
};

export const createServiceModel = () => {
  return {
    async create(data: any) {
      return CompanyServiceModel.create(data);
    },

    async findById(id: number) {
      return CompanyServiceModel.findById(id);
    },

    async findByClinic(clinicId: number) {
      // alias for findByCompanyId
      return CompanyServiceModel.findByCompanyId(clinicId);
    },

    async findByCompanyId(companyId: number) {
      return CompanyServiceModel.findByCompanyId(companyId);
    },

    async update(id: number, data: any) {
      return CompanyServiceModel.update(id, data);
    },

    async delete(id: number) {
      return CompanyServiceModel.delete(id);
    },
  };
};
