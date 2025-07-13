import type { NextApiRequest, NextApiResponse } from 'next';

const API_KEY = 'AIzaSyCKX5_PDN5C-JF9NJRIJABVZEFPWoadaBc'; // 본인 API 키로 교체
const CX = '639657fd05b084d92'; // 본인 CX로 교체

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'No query' });

  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&searchType=image&q=${encodeURIComponent(query as string)}&num=4`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const images = data.items?.map((item: any) => ({
      link: item.link
    })) || [];
    res.status(200).json({ images });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
} 