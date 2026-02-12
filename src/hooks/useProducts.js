import {useQuery} from "@tanstack/react-query";
import {api } from "@/lib/api";

export const useProducts = (filters = {}) => {
    return useQuery({
        queryKey: ['products', filters],
        queryFn : async ()=> {
            const {data} = await api.get('/products', { params: filters });
            return data;
        },
    });
}