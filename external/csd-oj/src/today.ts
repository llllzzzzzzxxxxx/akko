import { Context } from "koishi";
import { groupBy, sortBy, maxBy, uniqBy } from "lodash";
import { Config } from ".";
import { Result, Submissions } from "./api/types";

export default function apply(ctx: Context, config: Config) {
  let submissions: Submissions = null;
  let lastACKingUserId = 0;
  let acKingCount = 0;

  ctx.middleware(async (session, next) => {
    if (session.content.match(/^today(\s|$)/)) {
      const dashboardInfo = await ctx.apiClient.fetchDashboardInfo();
      submissions = await ctx.apiClient.fetchSubmissions(
        dashboardInfo.today_submission_count
      );
      if (submissions.results.length < 10) {
        return session.text("commands.today.no-enough-submissions");
      }
    }
    return next();
  }, true);

  const today = ctx.command("today");

  today.subcommand(".subrank").action(({ session }) => {
    const results = submissions.results;
    const userIdGroups = groupBy(results, "user_id");
    const userIdGroupsSortByLength = sortBy(
      Object.values(userIdGroups),
      (x) => -x.length
    );

    if (userIdGroupsSortByLength.length < 5) {
      return session.text(".no-enough-user");
    }

    const subRankString = userIdGroupsSortByLength
      .slice(0, 5)
      .map(
        (results, index) =>
          `${index + 1}. ${results[0].username}（Sub: ${
            results.length
          }, AC: ${getAcCount(results)}）`
      )
      .join("\n");

    return session.text(".subrank", [subRankString]);
  });

  today.subcommand(".subking").action(({ session }) => {
    const results = submissions.results;
    const userIdGroups = groupBy(results, "user_id");
    const subKingResults = maxBy(Object.values(userIdGroups), (x) => x.length);
    const subKingLanguageGroups = groupBy(subKingResults, "language");

    const subKingUsername = subKingResults[0].username;
    const subKingAcCount = getAcCount(subKingResults);
    const subKingSubCount = subKingResults.length;
    const subKingMostUsedLanguage = maxBy(
      Object.values(subKingLanguageGroups),
      (x) => x.length
    )[0].language;

    return session.text(".subking", [
      subKingUsername,
      subKingSubCount,
      subKingAcCount,
      subKingMostUsedLanguage,
    ]);
  });

  today.subcommand(".acrank").action(({ session }) => {
    const results = submissions.results;
    const userIdGroups = groupBy(results, "user_id");
    const userIdGroupsSortByLength = sortBy(
      Object.values(userIdGroups),
      (results) => -getAcCount(results)
    );

    if (userIdGroupsSortByLength.length < 5) {
      return session.text(".no-enough-user");
    }

    const acRankString = userIdGroupsSortByLength
      .slice(0, 5)
      .map(
        (results, index) =>
          `${index + 1}. ${results[0].username}（AC: ${getAcCount(
            results
          )}, Sub: ${results.length}）`
      )
      .join("\n");

    return session.text(".acrank", [acRankString]);
  });

  today.subcommand(".acking").action(({ session }) => {
    const results = submissions.results;
    const userIdGroups = groupBy(results, "user_id");
    const acKingResults = maxBy(Object.values(userIdGroups), (results) =>
      getResultsCountBy(results, (result) => (result.result === 0 ? 1 : 0))
    );
    const acKingLanguageGroups = groupBy(acKingResults, "language");

    const acKingUserId = acKingResults[0].user_id;
    const acKingUsername = acKingResults[0].username;
    const acKingAcCount = getAcCount(acKingResults);
    const acKingSubCount = acKingResults.length;
    const acKingMostUsedLanguage = maxBy(
      Object.values(acKingLanguageGroups),
      (x) => x.length
    )[0].language;

    if (!lastACKingUserId || lastACKingUserId !== acKingUserId) {
      lastACKingUserId = acKingUserId;
      acKingCount++;
    }

    return session.text(".acking", [
      acKingCount,
      acKingUsername,
      acKingAcCount,
      acKingSubCount,
      acKingMostUsedLanguage,
    ]);
  });
}

function getResultsCountBy(
  results: Submissions["results"],
  callback: (result: Submissions["results"][number]) => number
) {
  return results.reduce((count, result) => callback(result) + count, 0);
}

function getAcCount(results: Result[]) {
  return uniqBy(results, "problem").filter((r) => r.result === 0).length;
}
