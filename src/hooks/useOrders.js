import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useOrders() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await api.get("/orders");
      return data;
    },
  });

  const createOrder = useMutation({
    mutationFn: (order) => api.post("/orders", order),
    onSuccess: () => queryClient.invalidateQueries(["orders"]),
  });

  return { orders, isLoading, error, createOrder };
}
