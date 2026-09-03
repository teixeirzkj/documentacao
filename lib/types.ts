export type Role = "administrador" | "atendente";
export type Status = "ativo" | "inativo";
export type Classification = "basico" | "medio" | "avancado";

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
  identification: string | null;
  solution: string;
  observations: string | null;
  classification: Classification;
  author_id: string;
  created_at: string;
  updated_at: string;
  rank?: number;
  category?: Category | null;
  author?: Profile | null;
  tags?: Tag[];
  images?: DocumentationImage[];
}

export interface AppSettings {
  logo_url: string | null;
  logo_path: string | null;
}
