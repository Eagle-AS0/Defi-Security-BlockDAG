const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchStatus = async () => {
  const url = `${API_BASE}/status`;
  console.log("Fetching from:", url); // <-- debug log
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Failed to fetch status');
  }

  return res.json();
};
