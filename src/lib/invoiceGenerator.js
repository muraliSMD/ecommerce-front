
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (order) => {
  const doc = new jsPDF();

  // Company Logo/Header
  doc.setFontSize(20);
  doc.text("GRABSZY", 14, 22);
  doc.setFontSize(10);
  doc.text("Your Premium Store", 14, 28);
  doc.text("contact@grabszy.com", 14, 34);

  // Invoice Details
  doc.setFontSize(12);
  doc.text("INVOICE", 140, 22);
  doc.setFontSize(10);
  doc.text(`Invoice No: INV-${order._id.slice(-6).toUpperCase()}`, 140, 28);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 34);
  doc.text(`Status: ${order.paymentStatus}`, 140, 40);

  // Bill To / Ship To
  doc.line(14, 45, 196, 45);
  doc.text("Bill To:", 14, 55);
  doc.setFont("helvetica", "bold");
  doc.text(order.shippingAddress?.name || "Guest", 14, 60);
  doc.setFont("helvetica", "normal");
  doc.text(order.user?.email || "", 14, 65);
  doc.text(order.shippingAddress?.phone || "", 14, 70);

  doc.text("Ship To:", 110, 55);
  doc.setFont("helvetica", "bold");
  doc.text(order.shippingAddress?.name || "Guest", 110, 60);
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(
    `${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}, ${order.shippingAddress?.country}`,
    80
  );
  doc.text(addressLines, 110, 65);

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
    startY: 85,
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] }, // Primary color
    styles: { fontSize: 9 },
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Subtotal: ${order.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}`, 140, finalY);
  doc.text(`Shipping: ${order.shippingCount ? order.shippingCount.toFixed(2) : "Free"}`, 140, finalY + 6);
  if(order.discountAmount > 0) {
      doc.text(`Discount: -${order.discountAmount.toFixed(2)}`, 140, finalY + 12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${order.totalAmount.toFixed(2)}`, 140, finalY + 18);
  } else {
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${order.totalAmount.toFixed(2)}`, 140, finalY + 12);
  }

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Thank you for your business!", 14, 280);

  doc.save(`invoice-GRABSZY-${order._id.slice(-6)}.pdf`);
};
