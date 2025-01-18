export type WithResponse<T> = {
  error: null | string;
  data: T;
};

export interface DashBoardInfo {
  user_count: number;
  recent_contest_count: number;
  today_submission_count: number;
  judge_server_count: number;
  env: Env;
}

export interface Env {
  FORCE_HTTPS: boolean;
  STATIC_CDN_HOST: string;
}

export interface Submissions {
  results: Result[];
  total: number;
}

export interface Result {
  id: string;
  problem: string;
  show_link: boolean;
  create_time: Date;
  user_id: number;
  username: string;
  result: number;
  language: Language;
  shared: boolean;
  statistic_info: StatisticInfo;
}

export enum Language {
  C = "C++",
  Java = "Java",
  LanguageC = "C",
}

export interface StatisticInfo {
  time_cost: number;
  memory_cost: number;
  score?: number;
}
export interface UserRankData {
  results: UserRankResult[];
  total: number;
}

export interface UserRankResult {
  id: number;
  user: User;
  acm_problems_status: AcmProblemsStatus;
  oi_problems_status: OiProblemsStatus;
  real_name: null | string;
  avatar: string;
  blog: null | string;
  mood: null | string;
  github: null | string;
  school: null | string;
  major: null | string;
  language: Language | null;
  accepted_number: number;
  total_score: number;
  submission_number: number;
}

export interface AcmProblemsStatus {
  problems: { [key: string]: AcmProblemsStatusProblem };
}

export interface AcmProblemsStatusProblem {
  _id: string;
  status: number;
}

export enum Language {
  ZhCN = "zh-CN",
}

export interface OiProblemsStatus {
  problems?: { [key: string]: ContestProblemValue };
  contest_problems?: { [key: string]: ContestProblemValue };
}

export interface ContestProblemValue {
  _id: string;
  score: number;
  status: number;
}

export interface User {
  id: number;
  username: string;
  real_name: null;
}

export interface ContestsData {
  results: ContestResult[];
  total: number;
}

export interface ContestResult {
  id: number;
  created_by: CreatedBy;
  status: string;
  contest_type: "Public" | "Password Protected";
  title: string;
  description: string;
  real_time_rank: boolean;
  rule_type: string;
  start_time: Date;
  end_time: Date;
  create_time: Date;
  last_update_time: Date;
}

export interface CreatedBy {
  id: number;
  username: string;
  real_name: null;
}

export interface ContestRankData {
  results: ContestRankResult[];
  total: number;
}

export interface ContestRankResult {
  id: number;
  user: User;
  submission_number: number;
  total_score: number;
  submission_info: { [key: string]: number };
  contest: number;
}
