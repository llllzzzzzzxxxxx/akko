import { Context } from "koishi";
import ApiClient from "./api/client";

declare module "koishi" {
  export interface Context {
    apiClient: ApiClient;
  }
  
  export interface Tables {
    'csd-oj-year-rank': UserRank
  }
}

export interface UserRank {
  id: number
  no: number
  ac: number
  sub: number
}
