import { put } from '@vercel/blob';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { filename } = request.query;

  if (!filename) {
    return response.status(400).json({ error: 'Filename is required' });
  }

  try {
    // Pegamos o corpo do arquivo (stream) e enviamos para Vercel Blob
    const blob = await put(filename as string, request, {
      access: 'public',
    });

    return response.status(200).json(blob);
  } catch (error: any) {
    console.error('Upload Error:', error);
    return response.status(500).json({ error: error.message });
  }
}
