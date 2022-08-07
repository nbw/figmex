import Store from "../core/store";

export const refreshUserCounts = (id: string, users: Store) => {
  const el = document.getElementById(id);
  const counts = userRegions(users);
  const counters = Object.keys(counts)
    .sort()
    .map((region) => {
      const countContainer = document.createElement("div");
      countContainer.classList.add("region");
      countContainer.setAttribute("region", region);
      countContainer.setAttribute("val", counts[region]);

      const iconEl = document.createElement("div");
      iconEl.classList.add("icon");
      countContainer.appendChild(iconEl);

      const countEl = document.createElement("div");
      countEl.classList.add("count");
      countEl.innerHTML = counts[region];
      countContainer.appendChild(countEl);

      const regionEl = document.createElement("a");
      regionEl.setAttribute("href", "https://fly.io/docs/reference/regions/");
      regionEl.setAttribute("target", "_blank");
      regionEl.classList.add("name");
      regionEl.innerHTML = region;
      countContainer.appendChild(regionEl);

      return countContainer;
    });

  el.replaceChildren(...counters);
};

/**
 * helper method to count users in each region
 */
const userRegions = (users: Store) => {
  const counts = {};
  users.values().forEach((u) => {
    u.metas.forEach((m) => {
      counts[m.region] = (counts[m.region] || 0) + 1;
    });
  });
  return counts;
};
