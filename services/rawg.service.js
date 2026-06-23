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

// Get single game details
export async function getGameById(id) {
  const res = await axios.get(`${BASE_URL}/games/${id}`, {
    params: {
      key: API_KEY,
    },
  });

  return res.data;
}