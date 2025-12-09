import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace with real database call
const classesData: { [key: string]: any[] } = {
  '10': [
    { id: 101, name: 'Class 1' },
    { id: 102, name: 'Class 2' }
  ],
  '11': [
    { id: 111, name: 'Class 1' },
    { id: 112, name: 'Class 2' }
  ],
  '12': [
    { id: 121, name: 'Class 1' },
    { id: 122, name: 'Class 2' }
  ],
  '20': [
    { id: 201, name: 'Class A' },
    { id: 202, name: 'Class B' }
  ],
  '21': [
    { id: 211, name: 'Class A' },
    { id: 212, name: 'Class B' }
  ],
  '22': [
    { id: 221, name: 'Class A' },
    { id: 222, name: 'Class B' }
  ]
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gradeId = searchParams.get('gradeId');

  if (!gradeId) {
    return NextResponse.json(
      { error: 'gradeId is required' },
      { status: 400 }
    );
  }

  const classes = classesData[gradeId] || [];
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(classes);
}

