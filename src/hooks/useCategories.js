import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/categories");
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
