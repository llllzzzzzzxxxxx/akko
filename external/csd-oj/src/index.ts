import { Context, Schema } from "koishi";
import today from "./today";
import rank from "./rank";
import { Axios } from "axios";
import ApiClient from "./api/client";

export const name = "csd-oj";
export const using = ['database'];

export interface Config {
  token: string;
  since: number;
  cookie: string;
  baseUrl: string;
}

export const Config: Schema<Config> = Schema.object({
  token: Schema.string().required(),
  since: Schema.number().required(),
  cookie: Schema.string().required(),
  baseUrl: Schema.string().required(),
});

export function apply(ctx: Context, config: Config) {
  const axios = new Axios({
    baseURL: config.baseUrl,
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Cookie: config.cookie,
      "X-CSRFToken": config.token,
    },
  });

  const apiClient = new ApiClient(axios);

  ctx = ctx.extend({ apiClient });

  ctx.i18n.define("zh", require("./locales/zh"));

  ctx.plugin(today, config);
  ctx.plugin(rank, config);
}
