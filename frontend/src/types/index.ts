export interface User {
  id: string;
  name: string;
  email: string;
  badge: string;
}

export interface IdScanResult {
  fullName: string;
  birthdate: string;
  gender: string;
  idType: string;
  idNumber: string;
  expirationDate: string;
}

export interface PersonalInfo {
  email: string;
  phone: string;
  aliases: string[];
  addresses: Address[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  startDate: string;
  endDate: string;
}

export interface EducationEntry {
  level: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: string;
}

export interface EmploymentEntry {
  employer: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface OnboardingProgress {
  identity: boolean;
  personalInfo: boolean;
  education: boolean;
  employment: boolean;
  review: boolean;
}

export type IdType = 'us_passport' | 'drivers_license' | 'real_id' | 'foreign_passport' | 'permanent_resident';

export type KycProvider = 'persona' | 'au10tix' | 'onfido' | 'idme';

export type IdentitySubStep = 'provider-select' | 'select-id' | 'verify-intro' | 'verification' | 'persona-api' | 'review';

export type EducationLevel =
  | 'high_school'
  | 'associate'
  | 'bachelors'
  | 'masters'
  | 'doctoral'
  | 'professional_license'
  | 'no_degree';
