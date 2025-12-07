'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import SearchableSelect, { SelectItem } from '@/components/SearchableSelect';

export default function Home() {
  const [schools] = useState<SelectItem[]>([
    { id: 1, name: 'Begin' },
    { id: 2, name: 'Ben-Gurion' }
  ]);
  const [grades, setGrades] = useState<SelectItem[]>([]);
  const [classes, setClasses] = useState<SelectItem[]>([]);
  const [equipmentData, setEquipmentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSchoolSelect = async (item: SelectItem) => {
    console.log('Selected School:', item.name);
    setGrades([]);
    setClasses([]);
    setEquipmentData(null);

    setIsLoading(true);
    try {
            const response = await fetch(`/api/grades?schoolId=${item.id}`);
      if (!response.ok) throw new Error('Failed to fetch grades');
      const data = await response.json();
      setGrades(data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeSelect = async (item: SelectItem) => {
    console.log('Selected Grade:', item.name);
    setClasses([]);
    setEquipmentData(null);

    setIsLoading(true);
    try {
      const response = await fetch(`/api/classes?gradeId=${item.id}`);
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = async (item: SelectItem) => {
    console.log('Selected Class:', item.name);

    setIsLoading(true);
    try {
      const response = await fetch(`/api/equipment?classId=${item.id}`);
      const data = await response.json();
      setEquipmentData(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <SearchableSelect
            label="School"
            items={schools}
            onSelect={handleSchoolSelect}
          />

          {grades.length > 0 && (
            <SearchableSelect
              label="Grade"
              items={grades}
              onSelect={handleGradeSelect}
            />
          )}

          {classes.length > 0 && (
            <SearchableSelect
              label="Class"
              items={classes}
              onSelect={handleClassSelect}
            />
          )}

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
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Equipment data loaded - presentation component goes here
              </p>
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
