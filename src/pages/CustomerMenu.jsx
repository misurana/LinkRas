import React, { useEffect, useState, forwardRef, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurant } from '../utils/storage';
import { Utensils, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import MenuChatbot from '../components/MenuChatbot';

const Page = forwardRef((props, ref) => {
  return (
    <div className="demoPage bg-dark-900 text-gray-100 p-6 sm:p-8 relative border border-white/10 shadow-2xl h-full flex flex-col overflow-hidden" ref={ref} data-density="soft">
      {/* Spine effect */}
      <div className={`absolute top-0 bottom-0 w-8 pointer-events-none z-10 ${props.number % 2 === 0 ? 'right-0 bg-gradient-to-l from-black/60 to-transparent' : 'left-0 bg-gradient-to-r from-black/60 to-transparent'}`}></div>
      {props.children}
      {props.number > 0 && (
        <div className="mt-auto pt-4 text-center text-gray-600 text-sm font-serif">
          - {props.number} -
        </div>
      )}
    </div>
  );
});

export default function CustomerMenu() {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef(null);

  useEffect(() => {
    const fetchMenu = async () => {
      const data = await getRestaurant(restaurantId);
      setRestaurant(data);
      if (data?.theme) {
        document.documentElement.setAttribute('data-theme', data.theme);
      }
      setLoading(false);
    };
    fetchMenu();

    return () => {
      // Revert to global/stored theme when leaving menu page
      const globalTheme = localStorage.getItem('app-theme') || 'dark';
      document.documentElement.setAttribute('data-theme', globalTheme);
    };
  }, [restaurantId]);

  const generatePDF = async () => {
    if (!restaurant || isExporting) return;
    setIsExporting(true);
    
    try {
      // Create a temporary hidden container for PDF rendering
      const element = pdfRef.current;
      element.style.display = 'block';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: restaurant.theme === 'light' ? '#ffffff' : '#0a0a0b',
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

      pdf.save(`${restaurant.name.replace(/\s+/g, '_')}_Menu.pdf`);
      element.style.display = 'none';
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-primary-500">Loading Menu...</div>;
  }

  if (!restaurant) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-6 space-y-4">
        <Utensils className="w-12 h-12 text-gray-600 mb-2" />
        <h2 className="text-2xl font-bold text-white">Menu Not Found</h2>
        <p className="text-gray-400">The QR code you scanned may be invalid or expired.</p>
      </div>
    );
  }

  const { menu = [] } = restaurant;
  
  // Group by category
  const categories = menu.reduce((acc, dish) => {
    if (!acc[dish.category]) acc[dish.category] = [];
    acc[dish.category].push(dish);
    return acc;
  }, {});

  // Paginate items to fit the book structure (Max 5 items per page)
  const pages = [];
  
  Object.keys(categories).forEach(cat => {
    const items = categories[cat];
    for (let i = 0; i < items.length; i += 5) {
       pages.push({
         category: cat,
         isNewCategory: i === 0,
         items: items.slice(i, i + 5)
       });
    }
  });

  // Calculate if we need empty pages at the end to make it an even spread before the back cover
  // Cover (1) + Inside Cover (2) + pages + Inside Back Cover + Back Cover = total.
  // We want the total pages passed to HTMLFlipBook to be even.
  // Cover Front (1), Cover Back (2) ... Pages (N) ... Back Cover Front (odd), Back Cover Back (even)
  // Let's just make sure the `pages` array has an even length so it fills internal spreads properly.
  if (pages.length % 2 !== 0) {
     pages.push({ empty: true });
  }

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 py-10 relative overflow-hidden flex items-center justify-center flex-col perspective-1000">
      {/* Background glow */}
      <div className="absolute top-0 right-[-10%] w-[50%] h-[30%] bg-primary-600/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-[-10%] w-[50%] h-[30%] bg-blue-600/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Toolbar */}
      <div className="w-full max-w-4xl px-4 mb-6 flex justify-between items-center z-20">
         <div className="flex items-center gap-2 text-primary-400">
            <Utensils className="w-5 h-5" />
            <span className="text-sm font-bold tracking-widest uppercase">linkras menu</span>
         </div>
         <button 
           onClick={generatePDF}
           disabled={isExporting}
           className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-2 text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
         >
           <FileDown className="w-4 h-4" />
           {isExporting ? 'Preparing...' : 'Download PDF'}
         </button>
      </div>

      <div className="flex-1 w-full max-w-4xl flex items-center justify-center px-4 md:px-8 drop-shadow-2xl z-10 transition-all duration-500 hover:drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <HTMLFlipBook 
          width={350} 
          height={550} 
          size="stretch"
          minWidth={300}
          maxWidth={450}
          minHeight={400}
          maxHeight={650}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          drawShadow={true}
          flippingTime={1000}
          className="mx-auto book-shadow"
          usePortrait={true}
        >
          {/* Cover Page */}
          <Page number={0}>
             <div className="h-full flex flex-col items-center justify-center text-center relative">
               <div className="absolute inset-0 bg-dark-800 opacity-50 z-0"></div>
               <div className="relative z-10 flex flex-col items-center">
                 <div className="w-24 h-24 rounded-full bg-primary-600/20 mb-8 flex items-center justify-center border border-primary-500/40 shadow-[0_0_30px_rgba(var(--color-primary-600),0.3)]">
                   <Utensils className="w-10 h-10 text-primary-400" />
                 </div>
                 <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-lg font-serif">
                   {restaurant.name}
                 </h1>
                 <p className="text-primary-400 font-medium tracking-[0.3em] uppercase text-sm">
                   Digital Menu
                 </p>
                 <div className="mt-16 inline-flex flex-col items-center opacity-60">
                    <p className="text-xs text-gray-400 tracking-wider mb-2">SWIPE TO OPEN</p>
                    <ChevronRight className="w-5 h-5 animate-pulse text-primary-500" />
                 </div>
               </div>
             </div>
          </Page>
          
          {/* Empty back of cover */}
          <Page number={0}>
             <div className="h-full flex items-center justify-center bg-dark-900 border-l border-white/5 opacity-50">
                <p className="text-gray-600 font-serif italic text-sm tracking-widest text-center" style={{ writingMode: 'vertical-rl' }}>
                   Enjoy your meal
                </p>
             </div>
          </Page>

          {pages.map((pageData, index) => (
            <Page key={`page-${index}`} number={index + 1}>
               {pageData.empty ? (
                 <div className="h-full flex flex-col justify-center items-center opacity-20">
                   <Utensils className="w-16 h-16 mb-4" />
                   <p className="font-serif italic text-lg">Enjoy your meal</p>
                 </div>
               ) : (
                 <div className="h-full flex flex-col pt-4 px-2">
                   {pageData.isNewCategory && (
                      <h2 className="text-2xl font-semibold text-primary-400 pb-3 mb-6 font-serif text-center uppercase tracking-widest relative">
                        {pageData.category}
                        <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
                      </h2>
                   )}
                   <div className="space-y-6">
                     {pageData.items.map((dish) => (
                       <div key={dish.id} className="relative z-10 group">
                         <div className="flex justify-between items-baseline mb-1 gap-2">
                            <h3 className="font-medium text-lg leading-tight text-white group-hover:text-primary-500 transition-colors">{dish.name}</h3>
                            <div className="flex-1 border-b-[2px] border-dotted border-gray-700 mx-2 relative top-[-6px] group-hover:border-primary-500/50 transition-colors"></div>
                            <span className="font-bold text-emerald-400 tracking-wide">₹{dish.price}</span>
                         </div>
                         {dish.description && (
                            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed italic pr-12 font-serif">{dish.description}</p>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </Page>
          ))}

          {/* Back Cover inside */}
          <Page number={0}>
             <div className="h-full flex items-center justify-center bg-dark-900">
               <div className="text-center opacity-30">
                 <Utensils className="w-10 h-10 mx-auto mb-4" />
                 <p className="font-serif italic">Culinary Excellence</p>
               </div>
             </div>
          </Page>
          
          {/* Final Back Cover */}
          <Page number={0}>
             <div className="h-full flex flex-col items-center justify-center bg-dark-800 border-l border-white/5 relative">
               <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent"></div>
               <Utensils className="w-12 h-12 text-gray-600 mb-6 relative z-10" />
               <p className="text-gray-400 tracking-widest text-xs uppercase mb-2 relative z-10">Thank you for dining at</p>
               <h2 className="text-2xl font-bold text-white relative z-10 font-serif">{restaurant.name}</h2>
               
               <div className="mt-24 text-center relative z-10 border-t border-white/10 pt-6 px-12">
                 <p className="text-xs text-gray-500 mb-1">Powered by</p>
                 <p className="text-sm text-primary-500 font-bold tracking-[0.2em] uppercase">LinkRas</p>
               </div>
             </div>
          </Page>
        </HTMLFlipBook>
      </div>
      
      {/* Mobile Swipe Hint */}
      <div className="mt-8 mb-12 flex justify-center items-center gap-8 text-xs text-gray-500 uppercase tracking-widest opacity-60">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Prev
          </div>
          <span className="text-white">Swipe or Click Pages</span>
          <div className="flex items-center gap-2">
             Next <ChevronRight className="w-4 h-4" />
          </div>
      </div>

      {/* Hidden PDF Content */}
      <div ref={pdfRef} className="hidden fixed left-[-9999px] top-0 w-[800px] p-16 font-serif bg-dark-950 text-white" style={{ fontFamily: 'serif' }}>
          <div className="text-center mb-16">
            <div className="w-20 h-20 rounded-full bg-primary-600/10 border border-primary-500/20 mx-auto mb-6 flex items-center justify-center">
              <Utensils className="w-10 h-10 text-primary-500" />
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight">{restaurant.name}</h1>
            <p className="text-primary-500 tracking-[0.5em] uppercase text-sm font-sans font-bold">Official Digital Menu</p>
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
             <p className="text-sm tracking-[0.3em] uppercase mb-1">Stay Connected with</p>
             <p className="text-xl font-bold text-primary-500 tracking-widest font-sans">LINKRAS</p>
             <p className="text-xs mt-4 text-gray-600 italic">Experience modern dining.</p>
          </div>
      </div>

      {/* AI Assistant Chatbot */}
      <MenuChatbot menu={restaurant.menu} restaurantName={restaurant.name} />
    </div>
  );
}

