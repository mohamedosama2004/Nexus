type ID = number;
// project
export type ProjectStatus = "Active" | "Completed";
export interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt :Date; 
  updatedAt:Date
}
// users
export type User = {
  id: ID;
  name: string;
  email: string;
};

//tasks
export type Task = {
  userId: ID;
  id: ID;
  title: string;
  completed: boolean;
};

export type Albums = {
  userId: ID;
  id: ID;
  title: string;
};

// posts
export type Post= {
  userId: ID;
  id: ID;
  title: string;
  body: string;
};
