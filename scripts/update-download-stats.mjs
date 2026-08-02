import { writeFile } from "node:fs/promises";

const repository = process.env.DOWNLOAD_STATS_REPOSITORY || "Cometline/cometline";
const releasesApi = `https://api.github.com/repos/${repository}/releases`;
const releasesPerPage = 100;
const outputPath = new URL("../static/download-stats.json", import.meta.url);

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

const isDownloadAsset = (assetName) =>
  typeof assetName === "string" && /\.(dmg|zip)$/i.test(assetName) && !/\.blockmap$/i.test(assetName);

const getReleaseDate = (release) => {
  const publishedAt = release?.published_at || release?.created_at;
  if (!publishedAt) return null;

  const date = new Date(publishedAt);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getWeekStart = (date) => {
  const weekStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (weekStart.getUTCDay() + 6) % 7;
  weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);
  return weekStart;
};

const countDownloads = (releases) =>
  releases.reduce(
    (releaseCount, release) =>
      releaseCount +
      (Array.isArray(release.assets)
        ? release.assets.reduce(
            (sum, asset) => sum + (isDownloadAsset(asset.name) ? Number(asset.download_count) || 0 : 0),
            0
          )
        : 0),
    0
  );

const fetchAllReleases = async () => {
  const releases = [];

  for (let page = 1; ; page += 1) {
    const response = await fetch(`${releasesApi}?per_page=${releasesPerPage}&page=${page}`, { headers });
    if (!response.ok) {
      throw new Error(`GitHub releases request failed with ${response.status}`);
    }

    const pageReleases = await response.json();
    if (!Array.isArray(pageReleases) || pageReleases.length === 0) break;

    releases.push(...pageReleases);
    if (pageReleases.length < releasesPerPage) break;
  }

  return releases;
};

const main = async () => {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const releases = await fetchAllReleases();
  const weeklyReleases = releases.filter((release) => {
    const releaseDate = getReleaseDate(release);
    return releaseDate && releaseDate >= weekStart && releaseDate <= now;
  });
  const latestRelease = releases[0];
  const latestDmg = Array.isArray(latestRelease?.assets)
    ? latestRelease.assets.find((asset) => typeof asset.name === "string" && /\.dmg$/i.test(asset.name))
    : null;

  const stats = {
    repository,
    generatedAt: now.toISOString(),
    weekStartsAt: weekStart.toISOString(),
    releaseCount: releases.length,
    weeklyDownloads: countDownloads(weeklyReleases),
    latestRelease: latestRelease
      ? {
          tagName: latestRelease.tag_name || null,
          dmgUrl: latestDmg?.browser_download_url || null,
        }
      : null,
  };

  await writeFile(outputPath, `${JSON.stringify(stats, null, 2)}\n`);
  console.log(JSON.stringify(stats, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
