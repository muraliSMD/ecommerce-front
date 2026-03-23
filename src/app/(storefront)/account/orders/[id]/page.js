"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowLeft, FiMapPin, FiTruck, FiCreditCard } from "react-icons/fi";
import { useSettingsStore } from "@/store/settingsStore";
import Image from "next/image";
import ReviewModal from "@/components/ReviewModal";
import { FiStar, FiDownload } from "react-icons/fi";
import { generateInvoice } from "@/lib/invoiceGenerator";
import InlineOrderReview from "@/components/InlineOrderReview";
import { getClosestColorName } from "@/lib/colors";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const formatPrice = useSettingsStore((state) => state.formatPrice);
  const { settings } = useSettingsStore();
  const queryClient = useQueryClient();

  const resolveColorName = (color) => {
    if (!color) return "";
    if (color.startsWith("#")) {
      const name = getClosestColorName(color);
      return name || color;
    }
    return color;
  };
  
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'cancel' or 'return'
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
  });

  const handleAction = async () => {
      if(!reason.trim()) return toast.error("Please provide a reason");
      
      setIsSubmitting(true);
      try {
          const endpoint = modalType === 'cancel' ? `/orders/${id}/cancel` : `/orders/${id}/return`;
          await api.put(endpoint, { reason });
          
          toast.success(modalType === 'cancel' ? "Order cancelled" : "Return requested");
          queryClient.invalidateQueries(["order", id]);
          setModalOpen(false);
          setReason("");
      } catch (error) {
          toast.error(error.response?.data?.message || "Action failed");
      } finally {
          setIsSubmitting(false);
      }
  };

  const openModal = (type) => {
      setModalType(type);
      setModalOpen(true);
      setReason("");
  };

   if (isLoading) return <div className="h-96 bg-bg-surface rounded-3xl animate-pulse border border-border-main" />;
  if (!order) return <div>Order not found</div>;
  if (!mounted) return null; // Prevent hydration errors

  const totalQuantity = order.items.reduce((acc, item) => acc + item.quantity, 0);
  const estimatedDays = totalQuantity <= 3 ? 4 : 10;
  const estimatedDeliveryDate = new Date(order.createdAt);
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + estimatedDays);



  const handleInvoiceDownload = () => {
      generateInvoice(order, settings);
  };
    
  return (
     <div className="space-y-8 relative text-text-main">
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-text-muted hover:text-text-main font-bold mb-4 transition-colors">
        <FiArrowLeft /> Back to Orders
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-text-main">Order #{order.orderId || order._id.slice(-6).toUpperCase()}</h1>
            <p className="text-text-muted text-sm">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
            {['Pending', 'Processing', 'Shipped'].includes(order.orderStatus) && (
              <p className="text-primary font-bold mt-1 inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-sm">
                <FiTruck /> Estimated Delivery: {estimatedDeliveryDate.toLocaleDateString()}
              </p>
            )}
        </div>
        <div className="flex items-center gap-3">
              <button 
                onClick={handleInvoiceDownload}
                disabled={order.orderStatus !== 'Delivered'}
                className="flex items-center gap-2 px-4 py-2 bg-btn-dark text-btn-text rounded-full font-bold text-sm hover:bg-btn-dark-hover transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                title={order.orderStatus !== 'Delivered' ? "Invoice available after delivery" : "Download Invoice"}
            >
                <FiDownload /> Invoice
            </button>

            {['Pending', 'Processing'].includes(order.orderStatus) && (
                <button 
                    onClick={() => openModal('cancel')}
                    className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm transition-colors"
                >
                    Cancel Order
                </button>
            )}
            {order.orderStatus === 'Delivered' && (
                  <button 
                    onClick={() => openModal('return')}
                    className="px-4 py-2 rounded-full border border-border-main text-text-main hover:bg-bg-section/50 font-bold text-sm transition-colors"
                >
                    Return Items
                </button>
            )}
            <span className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider text-sm ${
                order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-600' :
                order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-600' :
                order.orderStatus === 'Return Requested' ? 'bg-orange-100 text-orange-600' :
                order.orderStatus === 'Cancellation Requested' ? 'bg-red-50 text-red-600 border border-red-100' :
                order.orderStatus === 'Returned' ? 'bg-gray-200 text-gray-600' :
                'bg-yellow-100 text-yellow-600'
            }`}>
                {order.orderStatus}
            </span>
        </div>
      </div>

      {order.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-900 mb-8">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                  <FiTruck /> Request Update
              </h3>
              <p className="text-sm">
                  <span className="font-bold">Admin Note:</span> {order.rejectionReason}
              </p>
          </div>
      )}

      {order.adminNotes && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-blue-900 mb-8">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                  <FiTruck /> Note from Support
              </h3>
              <p className="text-sm whitespace-pre-wrap">
                  {order.adminNotes}
              </p>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-bg-surface p-8 rounded-[2.5rem] border border-border-main shadow-sm">
                <h3 className="font-bold text-xl mb-6">Items</h3>
                 <div className="space-y-6">
                    {order.items.map((item, i) => (
                         <div key={i} className="flex flex-col gap-4 border-b border-border-main/50 last:border-0 pb-6 last:pb-0">
                              <div className="flex gap-4 items-center">
                                <div className="w-20 h-20 bg-bg-section rounded-2xl overflow-hidden relative flex-shrink-0">
                                    {(() => {
                                        let imgUrl = item.product?.images?.find(img => img?.trim()) || "/placeholder.png";
                                        if (item.variant?.color && item.product?.variants) {
                                            const matchedV = item.product.variants.find(v => v.color === item.variant.color);
                                            const vImg = matchedV?.images?.find(img => img?.trim());
                                            if (vImg) imgUrl = vImg;
                                        }
                                        return (
                                            <Image 
                                                src={imgUrl} 
                                                alt={item.product?.name || "Product"} 
                                                fill 
                                                className="object-cover" 
                                            />
                                        );
                                    })()}
                                </div>
                                 <div className="flex-1">
                                    <h4 className="font-bold text-text-main">{item.product?.name || "Product"}</h4>
                                     {item.variant && (
                                        <p className="text-sm text-text-muted">
                                            {resolveColorName(item.variant.color)} / {item.variant.size}
                                        </p>
                                    )}
                                        <p className="text-sm text-text-main font-bold mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
                             </div>
                             
                             {order.orderStatus === 'Delivered' && item.product && (
                                 <InlineOrderReview 
                                    product={item.product} 
                                    onReviewSubmitted={() => queryClient.invalidateQueries(["order", id])} 
                                 />
                             )}
                         </div>
                    ))}
                </div>
            </div>

            {/* Timeline Placeholder */}
            {/* Could add a visual timeline here if order status history was available */}
        </div>

         {/* Sidebar Info */}
        <div className="space-y-6">
            <div className="bg-bg-surface p-6 rounded-[2rem] border border-border-main shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                    <FiMapPin /> <span className="text-xs font-bold uppercase tracking-widest">Shipping To</span>
                </div>
                 <p className="font-bold text-text-main">{order.shippingAddress?.name}</p>
                <p className="text-sm text-text-muted">{order.shippingAddress?.email}</p>
                <p className="text-sm text-text-muted">{order.shippingAddress?.phone}</p>
                <p className="text-sm text-text-muted mt-2">{order.shippingAddress?.address}</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                     <FiCreditCard /> <span className="text-xs font-bold uppercase tracking-widest">Payment</span>
                </div>
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-text-muted text-sm">Method</span>
                    <span className="font-bold text-sm">{order.paymentMethod}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-text-muted text-sm">Status</span>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${
                        order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{order.paymentStatus}</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="flex justify-between text-text-muted mb-2">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.totalAmount - (order.shippingCharge || 0) - (order.taxAmount || 0) + (order.discountAmount || 0))}</span>
                 </div>
                 {order.discountAmount > 0 && (
                     <div className="flex justify-between text-red-500 mb-2">
                        <span>Discount</span>
                        <span>-{formatPrice(order.discountAmount)}</span>
                     </div>
                 )}
                  {order.taxAmount > 0 && (
                     <div className="flex justify-between text-text-muted mb-2">
                        <span>Tax</span>
                        <span>{formatPrice(order.taxAmount)}</span>
                     </div>
                 )}
                  <div className="flex justify-between text-text-muted mb-4">
                    <span>Shipping</span>
                    <span className={order.shippingCharge > 0 ? "font-bold text-text-main" : "text-primary font-bold"}>
                        {order.shippingCharge > 0 ? formatPrice(order.shippingCharge) : "FREE"}
                    </span>
                 </div>
                  <div className="border-t border-border-main/50 pt-4 flex justify-between font-bold text-xl text-text-main">
                    <span>Total</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                 </div>
            </div>
        </div>
      </div>
      
       {/* Action Modal */}
      {modalOpen && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 border border-border-main">
                  <h3 className="text-xl font-bold text-text-main mb-2">
                       {modalType === 'cancel' ? 'Cancel Order' : 'Request Return'}
                  </h3>
                  <p className="text-text-muted mb-6 text-sm">
                      {modalType === 'cancel' 
                          ? 'Are you sure you want to cancel this order? This action cannot be undone.' 
                          : 'Please select a reason for returning this item.'}
                  </p>
                  
                   <div className="space-y-4 mb-8">
                      <label className="block text-sm font-bold text-text-muted">Reason</label>
                      <select 
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full p-3 bg-bg-section/50 border border-border-main rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-text-main"
                      >
                           <option value="" className="bg-bg-surface">Select a reason</option>
                          {modalType === 'cancel' ? (
                               <>
                                  <option value="Changed my mind" className="bg-bg-surface">Changed my mind</option>
                                  <option value="Ordered by mistake" className="bg-bg-surface">Ordered by mistake</option>
                                  <option value="Found better price" className="bg-bg-surface">Found better price</option>
                                  <option value="Other" className="bg-bg-surface">Other</option>
                              </>
                          ) : (
                               <>
                                  <option value="Damaged item" className="bg-bg-surface">Damaged item</option>
                                  <option value="Wrong item received" className="bg-bg-surface">Wrong item received</option>
                                  <option value="Size/Color doesn&apos;t match" className="bg-bg-surface">Size/Color doesn&apos;t match</option>
                                  <option value="Quality not as expected" className="bg-bg-surface">Quality not as expected</option>
                                  <option value="Other" className="bg-bg-surface">Other</option>
                              </>
                          )}
                      </select>
                  </div>
                  
                  <div className="flex gap-3">
                       <button 
                          onClick={() => setModalOpen(false)}
                          className="flex-1 py-3 bg-bg-section text-text-muted font-bold rounded-xl hover:bg-bg-section/80 transition-colors"
                      >
                          Close
                      </button>
                      <button 
                          onClick={handleAction}
                          disabled={isSubmitting}
                          className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                          {isSubmitting ? 'Processing...' : 'Confirm'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
