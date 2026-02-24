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
  estimated_duration_minutes: number;
  tags: string[];
  is_public: boolean;
  resource_ids: string[];
}

