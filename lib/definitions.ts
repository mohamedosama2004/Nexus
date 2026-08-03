type ID = number;
// project
export type ProjectStatus = "active" | "completed";
export interface Project {
  id: ID;
  name: string;
  description: string;
  status: ProjectStatus;
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
