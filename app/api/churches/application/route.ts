import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({ message: 'Test API' })
  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 })
  }
}
