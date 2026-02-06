import { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-hot-toast";

export function usePublicResources(params?: any) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      const response = await api.get("/resources/public/", { params });
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

