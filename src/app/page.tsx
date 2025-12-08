'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import SearchableSelect, { SelectItem } from '@/components/SearchableSelect';
import EquipmentList, { EquipmentData } from '@/components/EquipmentList';

export default function Home() {
  const [schools] = useState<SelectItem[]>([
    { id: 1, name: 'Begin' },
    { id: 2, name: 'Ben-Gurion' }
  ]);
  const [grades, setGrades] = useState<SelectItem[]>([]);
  const [classes, setClasses] = useState<SelectItem[]>([]);
  const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Set<number>>(new Set());
  const [quantities, setQuantities] = useState<Map<number, number>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Initialize all items as selected when equipment data loads
  useEffect(() => {
    if (equipmentData) {
      const allIds = new Set(equipmentData.items.map(item => item.id));
      setSelectedEquipment(allIds);

      const initialQuantities = new Map(
        equipmentData.items.map(item => [item.id, item.quantity])
      );
      setQuantities(initialQuantities);
    }
  }, [equipmentData]);

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

  const handleToggleItem = (id: number) => {
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
            <EquipmentList
              data={equipmentData}
              selectedIds={selectedEquipment}
              quantities={quantities}
              onToggle={handleToggleItem}
              onQuantityChange={handleQuantityChange}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
