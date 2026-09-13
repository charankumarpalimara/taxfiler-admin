import { NextRequest, NextResponse } from 'next/server';
import { RegistrationsService } from '@/services/registrations.service';
import { PortalStatus } from '@/types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const data = await RegistrationsService.getRegistrations({ status, search });
    return NextResponse.json({ success: true, count: data.length, data }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await RegistrationsService.createRegistration(body);
    return NextResponse.json({ success: true, message: 'Registration created successfully', data: created }, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400, headers: corsHeaders });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status are required' }, { status: 400, headers: corsHeaders });
    }

    const updated = await RegistrationsService.updateRegistrationStatus(id, status as PortalStatus);
    return NextResponse.json({ success: true, data: updated }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter required' }, { status: 400, headers: corsHeaders });
    }

    await RegistrationsService.deleteRegistration(id);
    return NextResponse.json({ success: true, message: 'Deleted successfully' }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}
