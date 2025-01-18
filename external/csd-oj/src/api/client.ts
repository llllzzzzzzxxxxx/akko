import axios, { Axios, AxiosResponse } from "axios";
import {
  ContestRankData,
  ContestsData,
  DashBoardInfo,
  Submissions,
  UserRankData,
  WithResponse,
} from "./types";

export default class ApiClient {
  http: Axios;

  constructor(http: Axios) {
    this.http = http;
  }

  async fetchDashboardInfo() {
    const response = await this.http.get<string>("/admin/dashboard_info");
    const data = this.getResponseData<DashBoardInfo>(response);
    return data;
  }

  async fetchSubmissions(limit = 12) {
    const response = await this.http.request<string>({
      method: "GET",
      url: "/submissions",
      params: {
        myself: 0,
        page: 1,
        limit: limit,
        offset: 0,
      },
    });

    const data = this.getResponseData<Submissions>(response);
    return data;
  }

  async fetchUserRank(
    offset: number,
    limit: number,
    rule: "ACM",
    since: number,
    to?: number
  ) {
    const response = await this.http.request<string>({
      method: "GET",
      url: "/user_rank",
      params: {
        offset,
        limit,
        rule,
        since,
        ...(to ? { to } : {}),
      },
    });

    const data = this.getResponseData<UserRankData>(response);
    return data;
  }

  async fetchContests(offset = 0, limit = 10) {
    const response = await this.http.request<string>({
      method: "GET",
      url: "/contests",
      params: {
        offset,
        limit,
      },
    });

    const data = this.getResponseData<ContestsData>(response);
    return data;
  }

  async fetchContestRank(contest_id: number, offset = 0, limit = 10) {
    const response = await this.http.request<string>({
      method: "GET",
      url: "/contest_rank",
      params: {
        contest_id,
        offset,
        limit,
      },
    });

    const data = this.getResponseData<ContestRankData>(response);
    return data;
  }

  getResponseData<T>(response: AxiosResponse): T {
    const axiosData = response.data;
    const withResponse: WithResponse<T> = JSON.parse(axiosData);
    const data = withResponse.data;
    return data;
  }
}
