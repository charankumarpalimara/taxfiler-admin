import { NextRequest, NextResponse } from 'next/server';
import { SubmissionsService } from '@/services/submissions.service';
import { SubmissionStatus } from '@/types';

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
    const service = searchParams.get('service');

    const data = await SubmissionsService.getSubmissions({ status, search, service });
    return NextResponse.json({ success: true, count: data.length, data }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await SubmissionsService.createSubmission(body);
    return NextResponse.json({ success: true, message: 'Submission created successfully', data: created }, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400, headers: corsHeaders });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, staffNote } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status are required' }, { status: 400, headers: corsHeaders });
    }

    const updated = await SubmissionsService.updateSubmission(id, { status: status as SubmissionStatus, staffNote });
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

    await SubmissionsService.deleteSubmission(id);
    return NextResponse.json({ success: true, message: 'Deleted successfully' }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}
