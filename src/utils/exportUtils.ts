declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: UserOptions) => jsPDF;
    }
}

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';
import mongoose from 'mongoose';

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const exportUtils = {
    async generateInvoicePDF(invoiceId: string) {
        const invoice = await mongoose.model('FreelanceInvoice')
            .findById(invoiceId)
            .populate('clientId')
            .populate('freelancerId');

        const doc = new jsPDF();
        
        // Заголовок
        doc.setFontSize(18);
        doc.text('Invoice', 14, 20);

        // Информация о счете
        doc.setFontSize(12);
        doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30);
        doc.text(`Date: ${invoice.dateIssued.toLocaleDateString()}`, 14, 35);
        doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, 14, 40);

        // Таблица позиций
        doc.autoTable({
            startY: 50,
            head: [['Description', 'Quantity', 'Unit Price', 'Total']],
            body: invoice.items.map((item: { 
                description: string;
                quantity: number;
                unitPrice: number;
                total: number;
            }) => [
                item.description,
                item.quantity.toString(),
                formatCurrency(item.unitPrice),
                formatCurrency(item.total)
            ])
        });

        return doc;
    }
}; 