import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || process.env.CLERK_SECRET_KEY!);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Upsert user in database
    await prisma.user.upsert({
      where: { id },
      update: {
        email: email_addresses[0]?.email_address || '',
        name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        imageUrl: image_url || null,
      },
      create: {
        id,
        email: email_addresses[0]?.email_address || '',
        name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        imageUrl: image_url || null,
      },
    });

    console.log(`User ${id} ${eventType === 'user.created' ? 'created' : 'updated'}`);
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    // Delete user from database (cascade will handle related records)
    await prisma.user.delete({
      where: { id: id! },
    });

    console.log(`User ${id} deleted`);
  }

  return new Response('', { status: 200 });
}
