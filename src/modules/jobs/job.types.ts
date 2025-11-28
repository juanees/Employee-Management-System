export type JobMemberRole = 'leader' | 'member';

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
  assignments: JobAssignment[];
  createdAt: string;
  updatedAt: string;
}
