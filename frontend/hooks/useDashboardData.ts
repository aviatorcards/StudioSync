import { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";

interface DashboardStats {
  overview: {
    [key: string]: {
      value: number | string;
      trend?: string;
      positive?: boolean;
      label?: string;
    };
  };
  recent_activity: {
    id: string;
    text: string;
    time: string;
    type: "success" | "warning" | "info" | "error";
  }[];
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/core/stats/");
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);


  return { stats, loading, error };
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface StudentGrowthData {
  month: string;
  students: number;
}

export interface AttendanceData {
  name: string;
  value: number;
}

export interface DashboardAnalytics {
  revenue_trend: RevenueData[];
  student_growth: StudentGrowthData[];
  attendance: AttendanceData[];
}

export function useDashboardAnalytics() {
    const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get("/core/analytics/");
                setAnalytics(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch dashboard analytics", err);
                setError("Failed to load analytics data");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return { analytics, loading, error };
}

export function useStudents(params?: any) {
  const [students, setStudents] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({
    count: 0,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get("/students/", { params });
      const data = response.data;
      if (data.results) {
        setStudents(data.results);
        setMeta({
          count: data.count,
          next: data.next,
          previous: data.previous,
        });
      } else {
        setStudents(Array.isArray(data) ? data : []);
        setMeta({
          count: Array.isArray(data) ? data.length : 0,
          next: null,
          previous: null,
        });
      }
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [JSON.stringify(params)]);

  return { students, meta, loading, refresh: fetchStudents };
}

export interface StudentStats {
  total_students: number;
  active_students: number;
  unassigned_students: number;
}

export function useStudentStats() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get("/students/stats/");
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load student stats:", err);
      // Don't toast — stats are supplementary; avoid alarming users on load
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refresh: fetchStats };
}

export function useLessons(params?: any) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    try {
      const response = await api.get("/lessons/", { params });
      const data = response.data.results || response.data;
      setLessons(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [JSON.stringify(params)]);

  return { lessons, loading, refetch: fetchLessons };
}

export function useTeachers(params?: any) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async () => {
    try {
      const response = await api.get("/core/teachers/", { params });
      const data = response.data.results || response.data;
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [JSON.stringify(params)]);

  return { teachers, loading, refresh: fetchTeachers };
}

export function useInvoices(params?: any) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get("/billing/invoices/", { params });
      const data = response.data.results || response.data;
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [JSON.stringify(params)]);

  return { invoices, loading, refetch: fetchInvoices };
}

export function useUsers(params?: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({
    count: 0,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/core/users/", { params });
      const data = response.data;
      if (data.results) {
        setUsers(data.results);
        setMeta({
          count: data.count,
          next: data.next,
          previous: data.previous,
        });
      } else {
        setUsers(Array.isArray(data) ? data : []);
        setMeta({
          count: Array.isArray(data) ? data.length : 0,
          next: null,
          previous: null,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [JSON.stringify(params)]);

  return { users, meta, loading, refresh: fetchUsers };
}

export function useBands(params?: any) {
  const [bands, setBands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBands = async () => {
    try {
      const response = await api.get("/core/bands/", { params });
      const data = response.data.results || response.data;
      setBands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBands();
  }, [JSON.stringify(params)]);

  return { bands, loading, refresh: fetchBands };
}

export function useStudios(params?: any) {
  const [studios, setStudios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudios = async () => {
    try {
      const response = await api.get("/core/studios/", { params });
      const data = response.data.results || response.data;
      setStudios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load studios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudios();
  }, [JSON.stringify(params)]);

  return { studios, loading, refetch: fetchStudios };
}

export function useResources(params?: any) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      const response = await api.get("/resources/library/", { params });
      const data = response.data.results || response.data;
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [JSON.stringify(params)]);

  return { resources, loading, refetch: fetchResources };
}

export function useRooms(params?: any) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const response = await api.get("/inventory/rooms/", { params });
      const data = response.data.results || response.data;
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [JSON.stringify(params)]);

  return { rooms, loading, refresh: fetchRooms };
}

export function useLessonPlans(params?: any) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const response = await api.get("/lessons/plans/", { params });
      const data = response.data.results || response.data;
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load lesson plans");
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: any) => {
    try {
      const response = await api.post("/lessons/plans/", planData);
      toast.success("Lesson plan created successfully!");
      await fetchPlans(); // Refresh the list
      return response.data;
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to create lesson plan");
      throw err;
    }
  };

  const updatePlan = async (id: string, planData: any) => {
    try {
      const response = await api.patch(`/lessons/plans/${id}/`, planData);
      toast.success("Lesson plan updated successfully!");
      await fetchPlans(); // Refresh the list
      return response.data;
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to update lesson plan");
      throw err;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await api.delete(`/lessons/plans/${id}/`);
      toast.success("Lesson plan deleted successfully!");
      await fetchPlans(); // Refresh the list
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to delete lesson plan");
      throw err;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [JSON.stringify(params)]);

  return { plans, loading, refetch: fetchPlans, createPlan, updatePlan, deletePlan };
}

export function useGoals(params?: any) {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      const response = await api.get("/lessons/goals/", { params });
      const data = response.data.results || response.data;
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [JSON.stringify(params)]);

  return { goals, loading, refetch: fetchGoals };
}

export function useInventoryItems(params?: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const response = await api.get("/inventory/items/", { params });
      const data = response.data.results || response.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load inventory items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [JSON.stringify(params)]);

  return { items, loading, refresh: fetchItems };
}

export function useInventoryCheckouts(params?: any) {
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheckouts = async () => {
    try {
      const response = await api.get("/inventory/checkouts/", { params });
      const data = response.data.results || response.data;
      setCheckouts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load checkouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckouts();
  }, [JSON.stringify(params)]);

  return { checkouts, loading, refresh: fetchCheckouts };
}

/** Fetches the merged instrument list (studio curated + used by students). */
export function useInstruments() {
  const [instruments, setInstruments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInstruments = async () => {
    try {
      const response = await api.get("/students/instruments/");
      setInstruments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load instruments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, []);

  return { instruments, loading, refresh: fetchInstruments };
}
