import axios from "axios";

const BASE_URL = "https://api.rawg.io/api";
const API_KEY = process.env.RAWG_API_KEY;

// Get popular games
export async function getGames(page = 1) {
  const res = await axios.get(`${BASE_URL}/games`, {
    params: {
      key: API_KEY,
      page,
    },
  });

  return res.data.results;
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

// Get single game details
export async function getGameById(id) {
  const res = await axios.get(`${BASE_URL}/games/${id}`, {
    params: {
      key: API_KEY,
    },
  });

  return res.data;
}