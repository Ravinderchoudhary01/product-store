import {NextResponse} from 'next/server';export async function GET(){return NextResponse.json({error:'Orders are available only to administrators.'},{status:403})}
