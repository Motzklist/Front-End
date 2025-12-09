'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import SearchableSelect, { SelectItem } from '@/components/SearchableSelect';

// Define the API URL using the environment variable set in docker-compose.yml
// IMPORTANT: This must match the environment variable name set in your Next.js config
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Define the state structure to track all selected IDs
interface SelectionState {
    school: SelectItem | null;
    grade: SelectItem | null;
    class: SelectItem | null;
}

export default function Home() {
    const [selection, setSelection] = useState<SelectionState>({
        school: null,
        grade: null,
        class: null,
    });

    // State for fetched data (these will now be populated by API calls)
    const [schools, setSchools] = useState<SelectItem[]>([]);
    const [grades, setGrades] = useState<SelectItem[]>([]);
    const [classes, setClasses] = useState<SelectItem[]>([]);
    const [equipmentData, setEquipmentData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- API Fetch Function ---

    const fetchData = useCallback(async (endpoint: string, setter: (data: SelectItem[] | any) => void) => {
        setIsLoading(true);
        try {
            // Use the absolute API URL here
            const url = `${API_BASE_URL}${endpoint}`;
            console.log('Fetching from:', url);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch data from ${endpoint}. Status: ${response.status}`);
            const data = await response.json();
            setter(data);
        } catch (error) {
            console.error(`Error fetching data for ${endpoint}:`, error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 1. Fetch Schools (Runs once on mount)
    useEffect(() => {
        fetchData('/api/schools', setSchools);
    }, [fetchData]);

    // 2. Fetch Grades (Runs when School changes)
    useEffect(() => {
        if (!selection.school) {
            setGrades([]);
            return;
        }
        // API CALL: /api/grades?school_id=ID
        fetchData(`/api/grades?school_id=${selection.school.id}`, setGrades);
    }, [selection.school, fetchData]);

    // 3. Fetch Classes (Runs when Grade changes)
    useEffect(() => {
        if (!selection.grade) {
            setClasses([]);
            return;
        }
        // CRITICAL FIX: Need to pass BOTH school_id and grade_id
        // API CALL: /api/classes?school_id=ID&grade_id=ID
        const endpoint = `/api/classes?school_id=${selection.school?.id}&grade_id=${selection.grade.id}`;
        fetchData(endpoint, setClasses);
    }, [selection.grade, selection.school, fetchData]);

    // 4. Fetch Equipment (Runs when Class changes)
    useEffect(() => {
        if (!selection.class) {
            setEquipmentData(null);
            return;
        }
        // CRITICAL FIX: Need to pass ALL THREE IDs
        // API CALL: /api/equipment?school_id=ID&grade_id=ID&class_id=ID
        const endpoint = `/api/equipment?school_id=${selection.school?.id}&grade_id=${selection.grade?.id}&class_id=${selection.class.id}`;
        fetchData(endpoint, setEquipmentData);
    }, [selection.class, selection.grade, selection.school, fetchData]);


    // --- Event Handlers (Update State) ---

    const handleSchoolSelect = useCallback((item: SelectItem) => {
        // Reset lower selections
        setSelection({ school: item, grade: null, class: null });
        setGrades([]);
        setClasses([]);
        setEquipmentData(null);
    }, []);

    const handleGradeSelect = useCallback((item: SelectItem) => {
        // Retain school selection, reset class
        setSelection((prev) => ({ ...prev, grade: item, class: null }));
        setClasses([]);
        setEquipmentData(null);
    }, []);

    const handleClassSelect = useCallback((item: SelectItem) => {
        // Retain school and grade, set class
        setSelection((prev) => ({ ...prev, class: item }));
        // The useEffect for equipmentData will handle the fetch automatically
    }, []);

    // --- Render UI ---

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                        Motzkin Store - School Equipment
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400">
                        Select your school, grade, and class to view your equipment list
                    </p>
                </div>

                <div className="max-w-md mx-auto">
                    {/* School Selector - Always enabled, always populated from API */}
                    <SearchableSelect
                        label="1. School"
                        items={schools}
                        placeholder={isLoading && schools.length === 0 ? "Loading Schools..." : "Search School"}
                        onSelect={handleSchoolSelect}
                        disabled={isLoading && schools.length === 0}
                    />

                    {/* Grade Selector - Enabled only after School is selected */}
                    <SearchableSelect
                        label="2. Grade"
                        items={grades}
                        placeholder={selection.school ? "Search Grade" : "Select School First"}
                        onSelect={handleGradeSelect}
                        disabled={!selection.school || isLoading}
                    />

                    {/* Class Selector - Enabled only after Grade is selected */}
                    <SearchableSelect
                        label="3. Class"
                        items={classes}
                        placeholder={selection.grade ? "Search Class" : "Select Grade First"}
                        onSelect={handleClassSelect}
                        disabled={!selection.grade || isLoading}
                    />

                    {isLoading && (
                        <div className="text-center py-4">
                            <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
                        </div>
                    )}

                    {equipmentData && (
                        <div className="p-6 mt-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
                            <h3 className="font-bold text-zinc-900 dark:text-white mb-3">
                                Equipment List Ready
                            </h3>
                            {/* Assuming equipmentData is an array of objects from your mock_db */}
                            {Array.isArray(equipmentData) && equipmentData.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1 text-zinc-700 dark:text-zinc-300">
                                    {equipmentData.map((item, index) => (
                                        <li key={index} className="text-sm">
                                            **{item.name}**: {item.quantity} units
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    No specific equipment found for this selection.
                                </p>
                            )}

                            <h4 className="font-semibold mt-4 mb-2 text-zinc-900 dark:text-white">Raw Data:</h4>
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800">
                <pre className="text-xs text-zinc-700 dark:text-zinc-300 overflow-auto">
                  {JSON.stringify(equipmentData, null, 2)}
                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}