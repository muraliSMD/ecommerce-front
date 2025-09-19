import {useQuery} from "@tanstack/react-query";
import {api } from "@/lib/api";

export const useProducts = (params = {}) => {
    return useQuery({
        queryKey: ['products'],
        queryFn : async ()=> {
            const {data} = await api.get('/products', params);
            return data;
        },
    });
}