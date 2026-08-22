export type Member = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};
