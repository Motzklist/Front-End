import {NextRequest, NextResponse} from 'next/server';

// TODO: Replace with real database call
const gradesData: { [key: string]: any[] } = {
    '1': [
        {id: 10, name: 'כיתה א'},
        {id: 11, name: 'כיתה ב'},
        {id: 12, name: 'כיתה ג'}
    ],
    '2': [
        {id: 20, name: 'כיתה א'},
        {id: 21, name: 'כיתה ב'},
        {id: 22, name: 'כיתה ג'}
    ]
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
        return NextResponse.json(
            {error: 'schoolId is required'},
            {status: 400}
        );
    }

    const grades = gradesData[schoolId] || [];
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json(grades);
}

