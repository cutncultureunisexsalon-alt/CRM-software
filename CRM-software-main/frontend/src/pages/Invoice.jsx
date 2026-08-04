import { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, Send, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { invoiceAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyItem = { description: '', quantity: 1, price: 0 };

const emptyCustomer = {
  name: '',
  phone: '',
  email: '',
  address: '',
  gender: '',
};

export default function Invoice() {
  const [invoiceNumber, setInvoiceNumber] = useState(null);
  const [loadingNumber, setLoadingNumber] = useState(true);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchNextNumber = async () => {
    setLoadingNumber(true);
    try {
      const { data } = await invoiceAPI.getNextNumber();
      setInvoiceNumber(data.data.invoice_number);
    } catch {
      toast.error('Failed to load invoice number');
    } finally {
      setLoadingNumber(false);
    }
  };

  useEffect(() => {
    fetchNextNumber();
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return sum + qty * price;
    }, 0);
    const discountAmt = Number(discount) || 0;
    const taxable = Math.max(subtotal - discountAmt, 0);
    const tax = taxRate ? (taxable * Number(taxRate)) / 100 : 0;
    return {
      subtotal,
      tax,
      total: taxable + tax,
    };
  }, [items, discount, taxRate]);

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = (nextNum) => {
    setCustomer(emptyCustomer);
    setItems([{ ...emptyItem }]);
    setDiscount(0);
    setTaxRate(0);
    setNotes('');
    if (nextNum) setInvoiceNumber(nextNum);
    else fetchNextNumber();
  };

  const handleSaveAndSend = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await invoiceAPI.saveAndSend({
        customer,
        items: items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
        discount: Number(discount) || 0,
        tax_rate: Number(taxRate) || 0,
        notes: notes || null,
        send_whatsapp: true,
      });

      toast.success(data.message || 'Saved and sent via WhatsApp');
      resetForm(data.data.next_invoice_number);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice</h1>
          <p className="text-dark-400 text-sm mt-1">Create invoice and send to customer via WhatsApp</p>
        </div>
        <button type="button" onClick={fetchNextNumber} className="btn-secondary" disabled={loadingNumber}>
          <RefreshCw size={16} className={loadingNumber ? 'animate-spin' : ''} />
          Refresh Number
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form onSubmit={handleSaveAndSend} className="space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold text-dark-100 mb-4">Customer Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group sm:col-span-2">
                <label className="form-label">Name *</label>
                <input
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                />
              </div>
              <div className="form-group sm:col-span-2">
                <label className="form-label">Address</label>
                <textarea
                  rows={2}
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  value={customer.gender}
                  onChange={(e) => setCustomer({ ...customer, gender: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dark-100">Services / Items</h2>
              <button type="button" onClick={addItem} className="btn-secondary text-sm py-1.5">
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-12 sm:col-span-5 form-group">
                    {index === 0 && <label className="form-label">Description</label>}
                    <input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Service name"
                      required
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2 form-group">
                    {index === 0 && <label className="form-label">Qty</label>}
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-3 form-group">
                    {index === 0 && <label className="form-label">Price (₹)</label>}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2 flex justify-end pb-0.5">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-dark-700">
              <div className="form-group">
                <label className="form-label">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tax (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group mt-4">
              <label className="form-label">Notes</label>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full sm:w-auto" disabled={saving}>
            <Send size={16} />
            {saving ? 'Saving...' : 'Save Customer & Send WhatsApp'}
          </button>
        </form>

        <div className="card invoice-preview bg-white text-gray-900 print:shadow-none">
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4 mb-4">
            <div>
              <img
                src="/logo.svg"
                alt="Salon Logo"
                className="h-16 w-auto max-w-[180px] object-contain mb-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <p className="text-sm text-gray-500">Tax Invoice</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Invoice No.</p>
              <p className="text-2xl font-bold text-gray-900">
                {loadingNumber ? '...' : `#${String(invoiceNumber).padStart(4, '0')}`}
              </p>
              <p className="text-sm text-gray-500 mt-1">{today}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Bill To</p>
            <p className="font-semibold">{customer.name || '—'}</p>
            <p className="text-sm text-gray-600">{customer.phone || '—'}</p>
            {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
            {customer.address && <p className="text-sm text-gray-600 mt-1">{customer.address}</p>}
          </div>

          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 font-medium">Item</th>
                <th className="py-2 font-medium text-center w-12">Qty</th>
                <th className="py-2 font-medium text-right w-20">Rate</th>
                <th className="py-2 font-medium text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const qty = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                return (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2">{item.description || '—'}</td>
                    <td className="py-2 text-center">{qty}</td>
                    <td className="py-2 text-right">₹{price.toFixed(2)}</td>
                    <td className="py-2 text-right">₹{(qty * price).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            {Number(discount) > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>-₹{Number(discount).toFixed(2)}</span>
              </div>
            )}
            {Number(taxRate) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tax ({taxRate}%)</span>
                <span>₹{totals.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>₹{totals.total.toFixed(2)}</span>
            </div>
          </div>

          {notes && (
            <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">{notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
