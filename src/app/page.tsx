'use client';

import {useState, useEffect, useCallback} from 'react';
import {useRouter} from 'next/navigation';
import Layout from '@/components/Layout';
import SearchableSelect, {SelectItem} from '@/components/SearchableSelect';
import EquipmentList, {EquipmentData} from '@/components/EquipmentList';
import {useAuth} from '@/contexts/AuthContext';
        
// Define the API URL using the environment variable injected by Docker Compose.
// CRITICAL: Next.js must be told which URL to use for the API Gateway service.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Define the state structure to track all selected IDs
interface SelectionState {
    school: SelectItem | null;
    grade: SelectItem | null;
    class: SelectItem | null;
}

export default function Home() {
    const router = useRouter();
    const {isAuthenticated} = useAuth();
    
    // State to track the currently selected items
    const [selection, setSelection] = useState<SelectionState>({
        school: null,
        grade: null,
        class: null,
    });
    
    const [schools, setSchools] = useState<SelectItem[]>([]);
    const [grades, setGrades] = useState<SelectItem[]>([]);
    const [classes, setClasses] = useState<SelectItem[]>([]);
    const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null);
    
    const [selectedEquipment, setSelectedEquipment] = useState<Set<number>>(new Set());
    const [quantities, setQuantities] = useState<Map<number, number>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    // Check authentication and redirect if not authenticated
    useEffect(() => {
        let isMounted = true;
        if (!isAuthenticated && !redirecting) {
            setRedirecting(true);
            // Await router.push and cleanup if unmounted
            Promise.resolve(router.push('/login')).finally(() => {
                if (!isMounted) {
                    setRedirecting(false);
                }
            });
        }
        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, redirecting, router]);

    // --- Utility Fetch Function ---
    // Memoize the function for use in useEffect dependencies
    const fetchData = useCallback(async (endpoint: string, setter: (data: SelectItem[] | any) => void, resetSelections: boolean = true) => {
        if (resetSelections) {
            setter([]);
            setEquipmentData(null);
        }

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
    }, []); // Only fetchData is a dependency

    // 1. Fetch Schools (Runs once on component mount)
    useEffect(() => {
        // We pass 'false' for resetSelections since we are setting the initial data for schools
        fetchData('/api/schools', setSchools, false);
    }, [fetchData]);
    
    // Initialize all items as selected when equipment data loads
    useEffect(() => {
        if (equipmentData) {
            const allIds = new Set(equipmentData.items.map(item => parseInt(item.id as any))); // TODO: Settle if using numberor string
            setSelectedEquipment(allIds);

            const initialQuantities = new Map(
                equipmentData.items.map(item => [parseInt(item.id as any), item.quantity])
            ); // TODO: Settle if using numberor string
            setQuantities(initialQuantities);
        }
    }, [equipmentData]);
    
    
    // --- Event Handlers (Trigger Fetching) ---
    
    const handleSchoolSelect = useCallback((item: SelectItem) => {
        console.log('Selected School:', item.name);
        // 1. Reset lower selections
        setSelection({ school: item, grade: null, class: null });
        setGrades([]);
        setClasses([]);
        setEquipmentData(null);

        // 2. Fetch Grades immediately (CRITICAL FIX: Use 'school_id' and correct ID access)
        fetchData(`/api/grades?school_id=${item.id}`, setGrades);

    }, [fetchData]);

    const handleGradeSelect = useCallback((item: SelectItem) => {
        console.log('Selected Grade:', item.name);
        // 1. Retain school selection, reset class
        setSelection(prev => ({ ...prev, grade: item, class: null }));
        setClasses([]);
        setEquipmentData(null);

        // 2. Fetch Classes immediately (CRITICAL FIX: Pass BOTH school_id and grade_id)
        const endpoint = `/api/classes?school_id=${selection.school?.id}&grade_id=${item.id}`;
        fetchData(endpoint, setClasses);

    }, [fetchData, selection.school]);

    const handleClassSelect = useCallback((item: SelectItem) => {
        console.log('Selected Class:', item.name);
        // 1. Retain school and grade, set class
        setSelection(prev => ({ ...prev, class: item }));
        setEquipmentData(null);

        // 2. Fetch Equipment immediately (CRITICAL FIX: Pass ALL THREE IDs)
        const endpoint = `/api/equipment?school_id=${selection.school?.id}&grade_id=${selection.grade?.id}&class_id=${item.id}`;
        fetchData(endpoint, setEquipmentData);

    }, [fetchData, selection.school, selection.grade]);

    const handleToggleEquipment = (id: number) => {
        setSelectedEquipment(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleQuantityChange = (id: number, quantity: number) => {
        setQuantities(prev => {
            const newMap = new Map(prev);
            newMap.set(id, quantity);
            return newMap;
        });
    };

    // Don't render content if not authenticated
    if (!isAuthenticated) {
        return null;
    }

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

                <div className="max-w-3xl mx-auto">
                    {/* School Selector - Now fetches data */}
                    <SearchableSelect
                        label="School"
                        items={schools}
                        placeholder={isLoading && schools.length === 0 ? "Loading Schools..." : "Search School"}
                        onSelect={handleSchoolSelect}
                        disabled={isLoading && schools.length === 0}
                    />

                    {grades.length > 0 && (
                        {/* Grade Selector - Enabled after School is selected */}
                        <SearchableSelect
                            label="Grade"
                            items={grades}
                            placeholder={selection.school ? "Search Grade" : "Select School First"}
                            onSelect={handleGradeSelect}
                            disabled={!selection.school || isLoading}
                        />
                    )}

                    {classes.length > 0 && (
                        {/* Class Selector - Enabled after Grade is selected */}
                        <SearchableSelect
                            label="Class"
                            items={classes}
                            placeholder={selection.grade ? "Search Class" : "Select Grade First"}
                            onSelect={handleClassSelect}
                            disabled={!selection.grade || isLoading}
                        />
                    )}

                    {isLoading && (
                        <div className="text-center py-4">
                            <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
                        </div>
                    )}

                    {equipmentData && (
                        <EquipmentList
                            data={equipmentData}
                            selectedIds={selectedEquipment}
                            quantities={quantities}
                            onToggle={handleToggleEquipment}
                            onQuantityChange={handleQuantityChange}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
}