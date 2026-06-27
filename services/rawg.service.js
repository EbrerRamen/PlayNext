import axios from "axios";

const BASE_URL = "https://api.rawg.io/api";
const API_KEY = process.env.RAWG_API_KEY;

// Get popular games
export async function getGames(page = 1) {
  const res = await axios.get(`${BASE_URL}/games`, {
    params: {
      key: API_KEY,
      page,
      page_size: 20,

      // ⭐ all-time popularity ranking
      ordering: "-added,-rating",
    },
  });

  return res.data.results;
}

export async function getFeaturedGames() {
  const today = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(today.getFullYear() - 1);

  const format = (d) => d.toISOString().split("T")[0];

  const res = await axios.get(`${BASE_URL}/games`, {
    params: {
      key: API_KEY,
      dates: `${format(lastYear)},${format(today)}`,
      ordering: "-added",      // 🔥 MOST IMPORTANT (trending)
      page_size: 20,
    },
  });

  let games = res.data.results;

  // Optional: boost better-rated games slightly
  games.sort((a, b) => {
    const scoreA = (a.added || 0) * 0.8 + (a.metacritic || 0) * 0.2;
    const scoreB = (b.added || 0) * 0.8 + (b.metacritic || 0) * 0.2;
    return scoreB - scoreA;
  });

  return games;
}

export async function getNewReleases() {
  const today = new Date();
  const last30Days = new Date();
  last30Days.setDate(today.getDate() - 30);

  const format = (d) => d.toISOString().split("T")[0];

  const res = await axios.get(`${BASE_URL}/games`, {
    params: {
      key: API_KEY,
      dates: `${format(last30Days)},${format(today)}`,
      ordering: "-added",
      page_size: 20,
    },
  });

  return res.data.results;
}

export async function getUpcomingGames() {
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  const format = (d) => d.toISOString().split("T")[0];

  const res = await axios.get(`${BASE_URL}/games`, {
    params: {
      key: API_KEY,
      dates: `${format(today)},${format(nextYear)}`,
      ordering: "-added",
      page_size: 20,
    },
  });

  return res.data.results;
}

export async function getTrendingGames() {
  const year = new Date().getFullYear();
  const today = new Date().toISOString().split("T")[0];

  const MIN_METACRITIC = 80;
  const MIN_ADDED = 1000;

  const res = await axios.get(`${BASE_URL}/games`, {
    params: {
      key: API_KEY,
      dates: `${year}-01-01,${today}`,
      metacritic: `${MIN_METACRITIC},100`,
      ordering: "-metacritic",
      page_size: 40,
    },
  });

  return res.data.results
    .filter(
      (game) =>
        game.metacritic >= MIN_METACRITIC &&
        game.added >= MIN_ADDED
    )
    .sort((a, b) => b.metacritic - a.metacritic || b.added - a.added)
    .slice(0, 20);
}

// Get single game details
export async function getGameById(id) {
  const res = await axios.get(`${BASE_URL}/games/${id}`, {
    params: {
      key: API_KEY,
    },
  });

  return res.data;
}