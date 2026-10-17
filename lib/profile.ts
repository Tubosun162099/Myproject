export interface Employer {
  hospital: string;
  location: string;
  years: string;
  // The candidate's real title and department. Used to describe transferable
  // experience accurately; the statement never relabels them as the new role.
  role: string;
  department: string;
  current: boolean;
}

export interface Profile {
  fullName: string;
  nmcRegistered: string;
  employers: Employer[];
  qualifications: string;
  cpd: string;
  equipment: string;
  achievements: string;
  skills: string;
  expertise: string;
}

export interface JobPosting {
  jobTitle: string;
  trust: string;
  department: string;
  jobDescription: string;
  personSpecification: string;
  trustValues: string;
}

export const emptyEmployer = (): Employer => ({
  hospital: "",
  location: "",
  years: "",
  role: "",
  department: "",
  current: false,
});

export const emptyProfile = (): Profile => ({
  fullName: "",
  nmcRegistered: "",
  employers: [emptyEmployer()],
  qualifications: "",
  cpd: "",
  equipment: "",
  achievements: "",
  skills: "",
  expertise: "",
});

export const emptyJob = (): JobPosting => ({
  jobTitle: "",
  trust: "",
  department: "",
  jobDescription: "",
  personSpecification: "",
  trustValues: "",
});

export function isProfileComplete(p: Profile): boolean {
  return (
    p.fullName.trim() !== "" &&
    p.employers.some((e) => e.hospital.trim() !== "" && e.years.trim() !== "") &&
    p.qualifications.trim() !== ""
  );
}
