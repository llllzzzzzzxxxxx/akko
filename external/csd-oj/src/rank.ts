import { Context, Component, Database, DatabaseService, Tables } from "koishi";
import { Config } from ".";
import { UserRankResult } from "./api/types";


enum ERankChangeType {
  ASC = '↑',
  DESC = '↓',
  STAY = '-'
}

class RankRecorder {
  constructor(private db: Database<Tables>) {}

  async render(userRankResults: UserRankResult[]) {
    const usersRank = await this.db.get(
      "csd-oj-year-rank",
      userRankResults.map((v) => v.id)
    );

    await this.db.upsert(
      "csd-oj-year-rank",
      userRankResults.map((v, i) => ({
        id: v.id,
        no: i + 1,
        ac: v.accepted_number,
        sub: v.submission_number,
      }))
    );

    return userRankResults.map((v, i) => {
      const last = usersRank.find(u => u.id === v.id);
      const no = i + 1;
      const ac = v.accepted_number;
      const sub = v.submission_number;

      const noChangeDisplay = last
        ? no > last.no
          ? `${ERankChangeType.DESC}${no - last.no}`
          : no < last.no
          ? `${ERankChangeType.ASC}${last.no - no}`
          : ERankChangeType.STAY
        : ERankChangeType.STAY;

      const noDisplay = no < 10 ? `${no}.   ` : `${no}. `;

      const acSuffix = last ? (ac > last.ac ? `+${ac - last.ac}` : "") : "";

      const subSuffix = last
        ? sub > last.sub
          ? `+${sub - last.sub}`
          : ""
        : "";

      return `${noDisplay}${noChangeDisplay} ${v.user.username}（AC: ${ac}${acSuffix}, Sub: ${sub}${subSuffix}）`;
    }).join('\n');
  }
}

export default function apply(ctx: Context, config: Config) {
  ctx.model.extend('csd-oj-year-rank', {
    id: 'unsigned',
    no: 'unsigned',
    ac: 'unsigned',
    sub: 'unsigned'
  })
  
  
  const rank = ctx.command("rank [contestId]");
  const recorder = new RankRecorder(ctx.database);
  

  rank.action(async ({ session, next }, contestId) => {
    if (contestId !== undefined) {
      return next();
    }
    
    const data = await ctx.apiClient.fetchUserRank(
      0,
      10,
      "ACM",
      config.since
    );

    const results = data.results;
    return session.text(".rank", [await recorder.render(results)]);
  });

  rank.action(async ({ session }, contestId) => {
    const contestsData = await ctx.apiClient.fetchContests();
    const publicContests = contestsData.results.filter(
      (c) => c.contest_type === "Public"
    );

    const contest = publicContests.find((c) => c.id === +contestId);

    if (!contest) {
      return session.text(".no-contest-found", [
        publicContests.map((c) => `${c.title}（ID: ${c.id}）`).join("\n"),
      ]);
    }

    const rankData = await ctx.apiClient.fetchContestRank(+contestId);
    const rankString = rankData.results
      .map(
        (result, index) =>
          `${index + 1}. ${result.user.username}（分数：${result.total_score}）`
      )
      .join("\n");

    return `${contest.title}：\n${rankString}`;
  });
}
