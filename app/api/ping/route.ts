import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET(){ return NextResponse.json({ ok:true, hasKey:!!process.env.OPENAI_API_KEY }); }
