export type Role = "administrador" | "atendente";
export type Status = "ativo" | "inativo";

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: Role;
  status: Status;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface DocumentationImage {
  id: string;
  documentation_id: string;
  url: string;
  path: string;
  created_at: string;
}

export interface Documentation {
  id: string;
  title: string;
  category_id: string | null;
  problem: string;
  identification: string;
  solution: string;
  observations: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
  rank?: number;
  category?: Category | null;
  author?: Profile | null;
  tags?: Tag[];
  images?: DocumentationImage[];
}
