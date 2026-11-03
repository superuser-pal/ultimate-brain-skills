// The GitHub REST seam the upstream sync uses (spec/skills-delivery.md §10.5), authenticated with UPSTREAM_SYNC_TOKEN.

const API = "https://api.github.com";

export function githubApi({ token, repository }) {
  const owner = repository.split("/")[0];
  async function request(method, path, body) {
    const response = await fetch(`${API}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "ultimate-brain-skills-upstream-sync" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 404 && method === "GET") return undefined;
    if (!response.ok) throw new Error(`GitHub ${method} ${path}: ${response.status} ${(await response.text()).slice(0, 300)}`);
    return response.status === 204 ? undefined : response.json();
  }
  const list = async (path) => {
    const items = [];
    for (let page = 1; ; page++) {
      const batch = await request("GET", `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
      items.push(...(batch ?? []));
      if (batch === undefined || batch.length < 100) return items;
    }
  };
  const repo = `/repos/${repository}`;

  return {
    /** Checks the token can read the fork; a missing or rejected token fails the run, never falls back. */
    async verify() {
      if ((await request("GET", repo)) === undefined) throw new Error(`UPSTREAM_SYNC_TOKEN can't read ${repository}`);
    },
    async upstreamHead(upstreamUrl) {
      const name = upstreamUrl.replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "");
      const meta = await request("GET", `/repos/${name}`);
      if (meta === undefined) throw new Error(`upstream ${name} not found`);
      const commit = await request("GET", `/repos/${name}/commits/${encodeURIComponent(meta.default_branch)}`);
      return { branch: meta.default_branch, sha: commit.sha };
    },
    openPulls: async (branch) => (await list(`${repo}/pulls?state=open&head=${owner}:${branch}`)).map((pull) => ({ number: pull.number, title: pull.title })),
    closedPulls: async (branch) => (await list(`${repo}/pulls?state=closed&head=${owner}:${branch}`)).map((pull) => ({ number: pull.number, title: pull.title, merged: pull.merged_at !== null })),
    comments: async (number) => (await list(`${repo}/issues/${number}/comments`)).map((comment) => comment.body ?? ""),
    createPull: async ({ title, body, head, base }) => (await request("POST", `${repo}/pulls`, { title, body, head, base })).number,
    updatePull: (number, fields) => request("PATCH", `${repo}/pulls/${number}`, fields),
    closePull: (number) => request("PATCH", `${repo}/pulls/${number}`, { state: "closed" }),
    comment: (number, body) => request("POST", `${repo}/issues/${number}/comments`, { body }),
    async ensureLabel(name) {
      if ((await request("GET", `${repo}/labels/${encodeURIComponent(name)}`)) === undefined) {
        await request("POST", `${repo}/labels`, { name, color: "c5def5", description: "Merging upstream needs a person" });
      }
    },
    openIssues: async (label) => (await list(`${repo}/issues?state=open&labels=${encodeURIComponent(label)}`)).filter((issue) => issue.pull_request === undefined).map((issue) => ({ number: issue.number, title: issue.title })),
    createIssue: async ({ title, body, labels }) => (await request("POST", `${repo}/issues`, { title, body, labels })).number,
    updateIssue: (number, fields) => request("PATCH", `${repo}/issues/${number}`, fields),
    closeIssue: (number) => request("PATCH", `${repo}/issues/${number}`, { state: "closed" }),
  };
}
