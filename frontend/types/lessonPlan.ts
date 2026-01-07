/**
 * Lesson Plan types and interfaces
 */

export interface Resource {
  id: string;
  title: string;
  description: string;
  resource_type: 'pdf' | 'audio' | 'video' | 'image' | 'physical' | 'link' | 'other';
  file?: string;
  external_url?: string;
  tags: string[];
  category: string;
  is_physical_item: boolean;
  is_lendable: boolean;
  created_at: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  description: string;
  content: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes: number;
  tags: string[];
  is_public: boolean;
  created_by: string;
  created_by_name: string;
  resources: Resource[];
  resource_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface LessonPlanFormData {
  title: string;
  description: string;
  content: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes: number;
  tags: string[];
  is_public: boolean;
  resource_ids: string[];
}

export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-800' },
] as const;
