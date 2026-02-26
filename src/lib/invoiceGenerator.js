import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (order, settings = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Company Logo/Header
  if (settings.logo) {
      try {
          doc.addImage(settings.logo, 'PNG', 14, 15, 40, 20, undefined, 'FAST');
      } catch (e) {
          console.error("Error adding logo", e);
          doc.setFontSize(20);
          doc.text(settings.siteName || "GRABSZY", 14, 22);
      }
  } else {
      doc.setFontSize(20);
      doc.text(settings.siteName || "GRABSZY", 14, 22);
  }

  doc.setFontSize(10);
  doc.text("Your Premium Store", 14, 40);
  doc.text(settings.supportEmail || "support@grabszy.com", 14, 45);

  // Invoice Details
  doc.setFontSize(12);
  doc.text("INVOICE", 140, 22);
  doc.setFontSize(10);
  doc.text(`Invoice No: INV-${order._id.slice(-6).toUpperCase()}`, 140, 28);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 34);
  doc.text(`Status: ${order.paymentStatus}`, 140, 40);

  // Bill To / Ship To
  doc.line(14, 50, 196, 50);
  doc.text("Bill To:", 14, 60);
  doc.setFont("helvetica", "bold");
  doc.text(order.shippingAddress?.name || "Guest", 14, 65);
  doc.setFont("helvetica", "normal");
  doc.text(order.user?.email || "", 14, 70);
  doc.text(order.shippingAddress?.phone || "", 14, 75);

  doc.text("Ship To:", 110, 60);
  doc.setFont("helvetica", "bold");
  doc.text(order.shippingAddress?.name || "Guest", 110, 65);
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(
    `${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}, ${order.shippingAddress?.country}`,
    80
  );
  doc.text(addressLines, 110, 70);

  // Items Table
  const tableColumn = ["Item", "Quantity", "Price", "Total"];
  const tableRows = [];

  order.items.forEach((item) => {
    const itemData = [
      `${item.product?.name || "Product"} ${item.variant ? `(${item.variant.color}/${item.variant.size})` : ""}`,
      item.quantity,
      item.price.toFixed(2),
      (item.price * item.quantity).toFixed(2),
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 95,
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] }, // Primary color
    styles: { fontSize: 9 },
  });

  // Totals
  const subtotal = order.totalAmount - (order.shippingCharge || 0) - (order.taxAmount || 0) + (order.discountAmount || 0);
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Subtotal: ${subtotal.toFixed(2)}`, 140, finalY);
  doc.text(`Shipping: ${order.shippingCharge > 0 ? order.shippingCharge.toFixed(2) : "Free"}`, 140, finalY + 6);
  
  let currentY = finalY + 12;
  if (order.taxAmount > 0) {
      doc.text(`Tax: ${order.taxAmount.toFixed(2)}`, 140, currentY);
      currentY += 6;
  }
  
  if(order.discountAmount > 0) {
      doc.text(`Discount: -${order.discountAmount.toFixed(2)}`, 140, currentY);
      currentY += 6;
  }
  
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${order.totalAmount.toFixed(2)}`, 140, currentY);

  // Signature
  if (settings.signature) {
      try {
          doc.addImage(settings.signature, 'PNG', 140, totalY + 20, 40, 20, undefined, 'FAST');
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text("Authorized Signature", 140, totalY + 45);
      } catch (e) {
          console.error("Error adding signature", e);
      }
  }

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Thank you for your business!", 14, 280);

  doc.save(`invoice-GRABSZY-${order._id.slice(-6)}.pdf`);
};

