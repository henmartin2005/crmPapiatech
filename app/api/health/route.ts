import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
    const { data, error } = await supabase
        .from('estados')
        .select('id,nombre')

    if (error) {
        return NextResponse.json(
            { status: 'error', database: 'disconnected', error: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json({
        status: 'ok',
        database: 'connected',
        estados: data,
        serverTime: new Date().toISOString(),
    })
}

