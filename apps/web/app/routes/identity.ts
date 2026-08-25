import { redirect } from 'react-router';

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const isRecovery = form.get('mode') === 'recover';
  const response = await fetch(
    isRecovery
      ? 'http://server:3000/temporary-identities/recover'
      : 'http://server:3000/temporary-identities',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        displayName: form.get('displayName'),
        recoveryCode: form.get('recoveryCode'),
      }),
    },
  );
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { code?: string };
    } | null;
    const errorCode = payload?.error?.code ?? 'DISPLAY_NAME_INVALID';
    return redirect(`/?intent=${isRecovery ? 'recover' : 'create'}&identityError=${errorCode}`);
  }
  const payload = (await response.json()) as { recoveryCode?: string };
  const headers = new Headers();
  const sessionCookie = response.headers.get('set-cookie');
  if (sessionCookie) headers.append('set-cookie', sessionCookie);
  if (payload.recoveryCode) {
    headers.append(
      'set-cookie',
      `chess_ai_recovery_notice=${encodeURIComponent(payload.recoveryCode)}; Path=/; Max-Age=600; SameSite=Lax`,
    );
  }
  return redirect('/lobby', { headers });
}
