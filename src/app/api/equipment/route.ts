import {NextRequest, NextResponse} from 'next/server';

// TODO: Replace with real database call
const equipmentData: { [key: string]: any } = {
    '101': {
        classId: 101,
        className: 'Begin כיתה א - Class 1',
        items: [
            {id: 1, name: 'Pencils (pack of 12)', quantity: 1, required: true},
            {id: 2, name: 'Erasers', quantity: 2, required: true},
            {id: 3, name: 'Colored Pencils (24 colors)', quantity: 1, required: true},
            {id: 4, name: 'Notebooks (5 pack)', quantity: 1, required: true},
            {id: 5, name: 'Glue Stick', quantity: 2, required: true},
            {id: 6, name: 'Scissors', quantity: 1, required: false}
        ]
    },
    '102': {
        classId: 102,
        className: 'Begin כיתה א - Class 2',
        items: [
            {id: 1, name: 'Pencils (pack of 12)', quantity: 1, required: true},
            {id: 2, name: 'Erasers', quantity: 2, required: true},
            {id: 3, name: 'Colored Pencils (24 colors)', quantity: 1, required: true},
            {id: 4, name: 'Notebooks (5 pack)', quantity: 1, required: true},
            {id: 5, name: 'Glue Stick', quantity: 2, required: true},
            {id: 7, name: 'Markers Set', quantity: 1, required: false}
        ]
    }
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('classId');

    if (!classId) {
        return NextResponse.json(
            {error: 'classId is required'},
            {status: 400}
        );
    }

    const equipment = equipmentData[classId] || {
        classId,
        className: 'Unknown Class',
        items: [
            {id: 1, name: 'Standard School Supplies', quantity: 1, required: true}
        ]
    };

    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json(equipment);
}

