import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { getRestaurant, updateRestaurantMenu } from '../utils/storage';
import { Download, Plus, Trash2, Edit, Save, ArrowUp, ArrowDown, ExternalLink, FileDown, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [menu, setMenu] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveError, setSaveError] = useState('');
  const qrRef = useRef();
  const fileInputRef = useRef();
  const pdfRef = useRef();

  useEffect(() => {
    fetchMenu();
  }, [user]);

  const fetchMenu = async () => {
    if (!user?.id) return;
    const res = await getRestaurant(user.id);
    if(res) setMenu(res.menu || []);
  };

  const handleSave = async () => {
    setSaveError('');
    if (menu.some(dish => !dish.category || !dish.category.trim())) {
      setSaveError('Please assign a category to all dishes before saving.');
      return;
    }
    if (menu.some(dish => !dish.name || !dish.name.trim())) {
      setSaveError('Please provide a name for all dishes before saving.');
      return;
    }

    setIsSaving(true);
    await updateRestaurantMenu(user.id, menu);
    setIsSaving(false);
  };

  const addDish = () => {
    const newDish = { id: crypto.randomUUID(), name: '', price: '', category: '', description: '' };
    setMenu([...menu, newDish]);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{ Name: 'Example Dish', Price: 14.99, Category: 'Main', Description: 'Delicious food' }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menu Template");
    XLSX.writeFile(wb, "LinkRas_Menu_Template.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const parsedMenu = json.map(rawRow => {
        // Normalize headers to lowercase to prevent capitalization/spacing errors
        const row = {};
        for (const key in rawRow) {
           row[key.toLowerCase().trim()] = rawRow[key];
        }

        return {
          id: crypto.randomUUID(),
          name: row.name || row['dish name'] || row.dish || '',
          price: row.price || '',
          category: row.category || row['category name'] || '',
          description: row.description || ''
        };
      });

      setMenu(prev => [...prev, ...parsedMenu]);
      if (parsedMenu.some(d => !d.category)) {
        setSaveError('Import successful! Please check and assign categories for the new items.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  const updateDish = (id, field, value) => {
    setMenu(menu.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const removeDish = (id) => {
    setMenu(menu.filter(d => d.id !== id));
  };

  const moveDish = (index, direction) => {
    if (index === 0 && direction === -1) return;
    if (index === menu.length - 1 && direction === 1) return;
    const newMenu = [...menu];
    const temp = newMenu[index];
    newMenu[index] = newMenu[index + direction];
    newMenu[index + direction] = temp;
    setMenu(newMenu);
  };

  const downloadQR = async () => {
    if(!qrRef.current) return;
    const canvas = await html2canvas(qrRef.current, { backgroundColor: '#18181b', scale: 2 });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `Menu-QR-${user.name}.png`;
    link.click();
  };

  const downloadPDF = async () => {
    if (!menu.length || isExporting) return;
    setIsExporting(true);
    
    try {
      const element = pdfRef.current;
      element.style.display = 'block';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a0b',
        windowWidth: 800
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${user.name.replace(/\s+/g, '_')}_Menu.pdf`);
      element.style.display = 'none';
    } catch (error) {
      console.error('PDF Error:', error);
      alert('Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Group by category for PDF
  const categories = menu.reduce((acc, dish) => {
    if (!dish.category) return acc;
    if (!acc[dish.category]) acc[dish.category] = [];
    acc[dish.category].push(dish);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome, {user.name}</h1>
          <p className="text-gray-400 mt-1">Manage your digital menu and QR codes.</p>
        </div>
        <div className="flex gap-3">
          <Link target="_blank" to={`/menu/${user.id}`} className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-white font-medium flex items-center gap-2 transition-colors">
             <ExternalLink className="w-4 h-4" /> View Public
          </Link>
          <button onClick={handleSave} className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2">
            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Menu"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              Menu Dishes
              {saveError && <span className="text-sm font-normal text-red-400 bg-red-400/10 px-2 py-1 rounded">{saveError}</span>}
            </h2>
            <div className="flex gap-4">
              <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                <Download className="w-3.5 h-3.5" /> Template
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 px-2 py-1 rounded-md"
              >
                <Plus className="w-3.5 h-3.5" /> Excel Import
              </button>
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button onClick={addDish} className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 ml-2">
                <Plus className="w-4 h-4" /> Add Manual
              </button>
            </div>
          </div>

          {menu.map((dish, i) => (
            <div key={dish.id} className="glass-panel p-4 rounded-xl flex gap-4">
              {/* Order buttons */}
              <div className="flex flex-col gap-2 justify-center border-r border-white/10 pr-4">
                <button onClick={() => moveDish(i, -1)} className="text-gray-500 hover:text-white disabled:opacity-30"><ArrowUp className="w-4 h-4"/></button>
                <button onClick={() => moveDish(i, 1)} className="text-gray-500 hover:text-white disabled:opacity-30"><ArrowDown className="w-4 h-4"/></button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" value={dish.name} onChange={e => updateDish(dish.id, 'name', e.target.value)} 
                  placeholder="Dish Name *" className={`bg-dark-900/50 border rounded-lg px-3 py-2 text-white ${!dish.name?.trim() ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`} />
                <div className="flex gap-2">
                  <input 
                    type="number" value={dish.price} onChange={e => updateDish(dish.id, 'price', e.target.value)} 
                    placeholder="Price" className="bg-dark-900/50 border border-white/10 rounded-lg px-3 py-2 text-white w-24" />
                  
                  <input 
                    list="category-list"
                    value={dish.category} 
                    onChange={e => updateDish(dish.id, 'category', e.target.value)} 
                    placeholder="Category *"
                    className={`bg-dark-900/50 border rounded-lg px-3 py-2 text-white flex-1 ${!dish.category?.trim() ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}
                  />
                  <datalist id="category-list">
                    {Array.from(new Set(menu.map(d => d.category).filter(Boolean))).map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                    <option value="Starters" />
                    <option value="Main" />
                    <option value="Dessert" />
                    <option value="Drinks" />
                  </datalist>
                </div>
                <input 
                  type="text" value={dish.description} onChange={e => updateDish(dish.id, 'description', e.target.value)} 
                  placeholder="Short description..." className="col-span-full md:col-span-2 bg-dark-900/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
              </div>
              
              <button onClick={() => removeDish(dish.id)} className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg self-start">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {menu.length === 0 && <p className="text-gray-500 py-8 text-center glass-panel rounded-xl">No dishes added. Click 'Add Dish' to start.</p>}
        </div>

        {/* QR Section */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl sticky top-8 flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold text-white mb-6">Table QR Code</h3>
            
            <div ref={qrRef} className="p-6 bg-white rounded-2xl mb-6 shadow-xl shadow-primary-500/10">
               {/* Fixed missing window port using generic app path */}
               <QRCodeSVG value={`${window.location.origin}/menu/${user.id}`} size={180} level={"H"} fgColor={"#18181b"} />
               <p className="mt-4 text-xs font-bold text-gray-900 tracking-widest uppercase">SCAN FOR MENU</p>
            </div>

            <button onClick={downloadQR} className="w-full flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-colors font-medium mb-3">
              <Download className="w-4 h-4" /> Download QR 
            </button>

            <button onClick={downloadPDF} disabled={isExporting} className="w-full flex justify-center items-center gap-2 border border-white/10 hover:bg-white/5 text-white py-3 rounded-xl transition-colors font-medium disabled:opacity-50">
              <FileDown className="w-4 h-4" /> {isExporting ? "Generating..." : "Download Menu PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden PDF Template */}
      <div ref={pdfRef} className="hidden fixed left-[-9999px] top-0 w-[800px] p-16 bg-dark-950 text-white" style={{ fontFamily: 'serif' }}>
          <div className="text-center mb-16">
            <div className="w-20 h-20 rounded-full bg-primary-600/10 border border-primary-500/20 mx-auto mb-6 flex items-center justify-center">
              <Utensils className="w-10 h-10 text-primary-500" />
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight">{user.name}</h1>
            <p className="text-primary-500 tracking-[0.5em] uppercase text-sm font-sans font-bold">Official Menu</p>
          </div>

          {Object.keys(categories).map(cat => (
            <div key={cat} className="mb-12 break-inside-avoid">
               <h2 className="text-3xl font-bold text-primary-500 border-b border-primary-500/20 pb-4 mb-8 uppercase tracking-widest">{cat}</h2>
               <div className="space-y-8">
                  {categories[cat].map(dish => (
                    <div key={dish.id} className="relative">
                       <div className="flex justify-between items-baseline gap-4 mb-2">
                          <h3 className="text-xl font-medium">{dish.name}</h3>
                          <div className="flex-1 border-b border-dotted border-gray-700"></div>
                          <span className="text-xl font-bold text-emerald-400">₹{dish.price}</span>
                       </div>
                       {dish.description && (
                          <p className="text-gray-400 italic text-sm pr-20">{dish.description}</p>
                       )}
                    </div>
                  ))}
               </div>
            </div>
          ))}

          <div className="mt-24 pt-16 border-t border-white/10 text-center opacity-50">
             <p className="text-sm tracking-[0.3em] uppercase mb-1">Created via</p>
             <p className="text-xl font-bold text-primary-500 tracking-widest font-sans">LINKRAS</p>
          </div>
      </div>
    </div>
  );
}
