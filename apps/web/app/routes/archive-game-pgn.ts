export async function loader({ params }: { params: { gameId?: string } }) {
  const response = await fetch(`http://server:3000/archive/games/${params.gameId ?? ''}/pgn`);
  if (!response.ok) throw new Response('Archived PGN unavailable', { status: response.status });
  const pgn = await response.text();
  return new Response(pgn, {
    headers: {
      'content-disposition': `attachment; filename="chess-ai-${params.gameId ?? 'game'}.pgn"`,
      'content-type': 'application/x-chess-pgn; charset=utf-8',
    },
  });
}
