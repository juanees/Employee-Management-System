export type JobMemberRole = 'leader' | string;

export interface JobAssignment {
  id: string;
  jobId: string;
  employeeId: string;
  role: JobMemberRole;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  leaderId: string;
  leader: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  template?: {
    id: string;
    title: string;
  };
  assignments: JobAssignment[];
  createdAt: string;
  updatedAt: string;
}
