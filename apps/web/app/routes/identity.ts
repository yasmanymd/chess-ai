import { redirect } from 'react-router';

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const response = await fetch('http://server:3000/temporary-identities', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ displayName: form.get('displayName') }),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { code?: string } | null;
    const errorCode = payload?.code === 'DISPLAY_NAME_UNAVAILABLE' ? payload.code : 'DISPLAY_NAME_INVALID';
    return redirect(`/?intent=create&identityError=${errorCode}`);
  }
  return redirect('/lobby', { headers: { 'set-cookie': response.headers.get('set-cookie') ?? '' } });
}
