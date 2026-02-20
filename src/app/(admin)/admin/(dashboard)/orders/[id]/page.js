"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  FiShoppingBag, 
  FiClock, 
  FiCheckCircle, 
  FiTruck,
  FiUser,
  FiMapPin,
  FiMail,
  FiPhone,
  FiArrowLeft,
  FiTrash2,
  FiCalendar,
  FiCreditCard,
  FiDownload,
  FiX
} from "react-icons/fi";
import { generateInvoice } from "@/lib/invoiceGenerator";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSettingsStore } from "@/store/settingsStore";
import { PageLoader } from "@/components/Loader";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const router = useRouter();
  console.log("Rendering AdminOrderDetails, ID:", id);
  const queryClient = useQueryClient();
  const { formatPrice, settings } = useSettingsStore();

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [targetStatus, setTargetStatus] = useState("");

  const updateStatusMutation = useMutation({
    mutationFn: async (variables) => {
      // Support multiple update types
      const payload = {};
      
      if (typeof variables === 'string') {
          payload.orderStatus = variables;
      } else {
          if (variables.status) payload.orderStatus = variables.status;
          if (variables.rejectionReason) payload.rejectionReason = variables.rejectionReason;
          if (variables.paymentStatus) payload.paymentStatus = variables.paymentStatus;
      }

      await api.put(`/orders/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-order", id]);
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Order status updated");
      setRejectionModalOpen(false);
      setRejectionReason("");
    },
    onError: () => {
      toast.error("Failed to update status");
    }
  });

  const handleReject = (status) => {
      setTargetStatus(status);
      setRejectionModalOpen(true);
  };

  const confirmRejection = () => {
      if (!rejectionReason.trim()) return toast.error("Please provide a reason");
      updateStatusMutation.mutate({ status: targetStatus, rejectionReason });
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Order deleted successfully");
      router.push("/admin/orders");
    },
    onError: () => {
      toast.error("Failed to delete order");
    }
  });

  if (isLoading) return <PageLoader />;

  if (!order) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
       <div className="p-8 bg-gray-50 rounded-full">
         <FiShoppingBag size={48} className="text-gray-300" />
       </div>
       <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
       <p className="text-gray-500">The order you are looking for does not exist or has been deleted.</p>
       <Link href="/admin/orders" className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-colors">
         Back to Orders
       </Link>
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <Link href="/admin/orders" className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
             <FiArrowLeft className="text-gray-600" />
           </Link>
           <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-display font-bold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</h1>
                <button
                    onClick={() => generateInvoice(order, settings)}
                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                    title="Download Invoice"
                >
                    <FiDownload size={20} />
                </button>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.orderStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                    order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-700' :
                    order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                }`}>
                    {order.orderStatus || 'Pending'}
                </span>
              </div>

              <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                <FiCalendar className="text-gray-400" /> {new Date(order.createdAt).toLocaleString()}
              </p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => {
                if(confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                    deleteMutation.mutate();
                }
             }}
             className="px-4 py-2 bg-white text-red-500 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors flex items-center gap-2 shadow-sm"
           >
             <FiTrash2 /> Delete
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content */}
         <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FiShoppingBag className="text-primary" /> Order Items
                </h2>
                <div className="space-y-6">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                            <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-100">
                                <Image 
                                    src={item.product?.images?.[0] || "/placeholder.jpg"} 
                                    alt={item.product?.name || "Product"} 
                                    fill 
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{item.product?.name || "Product Deleted"}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {item.product?.sku && (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                                                    SKU: {item.product.sku}
                                                </span>
                                            )}
                                            {item.variant?.color && (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    {item.variant.color}
                                                </span>
                                            )}
                                            {item.variant?.size && (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    {item.variant.size}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                                        {formatPrice(item.price)}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                                    <span>Qty: {item.quantity}</span>
                                    <span className="font-bold">Total: {formatPrice(item.price * item.quantity)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 bg-gray-50/50 -mx-8 -mb-8 p-8 rounded-b-[2rem]">
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.items.reduce((acc, item) => acc + item.price * item.quantity, 0))}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Shipping</span>
                            <span>{order.shippingCount ? formatPrice(order.shippingCount) : 'Free'}</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-{formatPrice(order.discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-gray-200 mt-4">
                            <span>Total</span>
                            <span>{formatPrice(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-gray-100">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiCreditCard className="text-primary" /> Payment Info
               </h2>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                     <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Method</p>
                     <p className="font-bold text-gray-900">{order.paymentMethod}</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Status</p>
                     <div className="flex items-center gap-2">
                         <p className={`font-bold ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>
                            {order.paymentStatus || 'Pending'}
                         </p>
                         {order.paymentMethod === 'COD' && order.paymentStatus !== 'Paid' && (
                             <button
                                onClick={() => updateStatusMutation.mutate({ paymentStatus: 'Paid' })}
                                className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                             >
                                Mark as Paid
                             </button>
                         )}
                     </div>
                  </div>
                  <div className="col-span-2">
                     <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Transaction ID</p>
                     <p className="font-mono text-sm text-gray-600 bg-gray-50 p-2 rounded-lg break-all">
                        {order.paymentResult?.id || 'N/A'}
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Sidebar */}
         <div className="space-y-8">
            {/* Status Update */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-gray-100">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiTruck className="text-primary" /> Update Status
               </h2>
               <div className="space-y-3">
                  {order.orderStatus === 'Cancellation Requested' ? (
                      <div className="space-y-3">
                          <p className="text-sm text-red-600 font-medium mb-2">
                             User requested cancellation. <br/>
                             Reason: &quot;{order.cancellationReason}&quot;
                          </p>
                          <button 
                              onClick={() => updateStatusMutation.mutate('Cancelled')}
                              className="w-full py-3 px-4 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center justify-between"
                          >
                              Approve Cancellation
                              <FiCheckCircle />
                          </button>
                          <button 
                              onClick={() => handleReject('Processing')}
                              className="w-full py-3 px-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-between"
                          >
                              Reject Request
                              <FiX />
                          </button>
                      </div>
                  ) : order.orderStatus === 'Return Requested' ? (
                      <div className="space-y-3">
                          <p className="text-sm text-orange-600 font-medium mb-2">
                             User requested return. <br/>
                             Reason: &quot;{order.returnReason}&quot;
                          </p>
                          <button 
                              onClick={() => updateStatusMutation.mutate('Returned')}
                              className="w-full py-3 px-4 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-between"
                          >
                              Approve Return
                              <FiCheckCircle />
                          </button>
                          <button 
                              onClick={() => handleReject('Delivered')}
                              className="w-full py-3 px-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-between"
                          >
                              Reject Return
                              <FiX />
                          </button>
                      </div>
                  ) : (
                      ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateStatusMutation.mutate(status)}
                            disabled={
                                order.orderStatus === status || 
                                order.orderStatus === 'Cancelled' || 
                                (order.orderStatus === 'Delivered' && status === 'Cancelled')
                            }
                            className={`w-full py-3 px-4 rounded-xl flex items-center justify-between font-bold text-sm transition-all ${
                                order.orderStatus === status 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 cursor-default'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                             {status}
                             {order.orderStatus === status && <FiCheckCircle />}
                          </button>
                      ))
                  )}
               </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-gray-100">
               <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiUser className="text-primary" /> Customer
               </h2>
               <div className="space-y-6">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <FiUser />
                     </div>
                     <div>
                        <p className="font-bold text-gray-900">{order.shippingAddress?.fullName || "Guest"}</p>
                        <p className="text-xs text-gray-500">{order.user?.email || "No account email"}</p>
                     </div>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-gray-50">
                     <div className="flex items-start gap-3">
                         <FiMail className="text-gray-400 mt-1" />
                         <div>
                             <p className="text-xs text-gray-500 font-bold uppercase">Email</p>
                             <p className="text-sm font-medium text-gray-900 break-all">{order.user?.email || "N/A"}</p>
                         </div>
                     </div>
                     {order.shippingAddress?.phone && (
                        <div className="flex items-start gap-3">
                            <FiPhone className="text-gray-400 mt-1" />
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Phone</p>
                                <p className="text-sm font-medium text-gray-900">{order.shippingAddress.phone}</p>
                            </div>
                        </div>
                     )}
                     <div className="flex items-start gap-3">
                         <FiMapPin className="text-gray-400 mt-1" />
                         <div>
                             <p className="text-xs text-gray-500 font-bold uppercase">Shipping Address</p>
                             <p className="text-sm font-medium text-gray-900 leading-relaxed mt-1">
                                {order.shippingAddress?.address},<br/>
                                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br/>
                                {order.shippingAddress?.country}
                             </p>
                         </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

       {/* Rejection Modal */}
       {rejectionModalOpen && (
           <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Request</h3>
                   <p className="text-gray-500 mb-6 text-sm">
                       Please provide a reason for rejecting this request. This will be visible to the customer.
                   </p>
                   
                   <div className="mb-6">
                       <label className="block text-sm font-bold text-gray-700 mb-2">Reason</label>
                       <textarea
                           value={rejectionReason}
                           onChange={(e) => setRejectionReason(e.target.value)}
                           className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium h-32 resize-none"
                           placeholder="e.g., Return period expired, Item not eligible..."
                       />
                   </div>
                   
                   <div className="flex gap-3">
                       <button 
                           onClick={() => {
                               setRejectionModalOpen(false);
                               setRejectionReason("");
                           }}
                           className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                       >
                           Cancel
                       </button>
                       <button 
                           onClick={confirmRejection}
                           className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                       >
                           Confirm Rejection
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
}
