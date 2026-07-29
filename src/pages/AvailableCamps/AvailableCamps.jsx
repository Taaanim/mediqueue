import React, { useState, useMemo } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure/useAxiosSecure";

const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>,
  Sort: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9M3 12h9m-9 4h6" /></svg>,
  Grid3: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Grid2: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Calendar: () => <svg className="h-5 w-5 text-[#1e74d2] mr-3 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
  Location: () => <svg className="h-5 w-5 text-[#1e74d2] mr-3 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>,
  Participants: () => <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 5.5a3 3 0 00-3 0V12a2 2 0 00-2 2v1a2 2 0 002 2h6a2 2 0 002-2v-1a2 2 0 00-2-2v-.5a3 3 0 00-3 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 5.5a3 3 0 00-3 0V12a2 2 0 00-2 2v1a2 2 0 002 2h6a2 2 0 002-2v-1a2 2 0 00-2-2v-.5a3 3 0 00-3 0z" /></svg>,
  ArrowRight: () => <svg className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
};


const AvailableCamps = () => {
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("most-registered");
  const [layout, setLayout] = useState("grid-cols-1 md:grid-cols-2 lg:grid-cols-3");

  const { data: camps = [], isLoading, isError, error } = useQuery({
    queryKey: ["camps"],
    queryFn: async () => {
      const res = await axiosSecure.get("/camps");
      return res.data;
    },
  });

  const filteredAndSortedCamps = useMemo(() => {
    const getFeeValue = (fee) => {
      if (typeof fee === 'number') return fee;
      if (typeof fee !== 'string') return 0;
      if (fee.toLowerCase() === 'free') return 0;
      const numericFee = parseFloat(fee.replace(/[^0-9.]/g, ''));
      return isNaN(numericFee) ? Infinity : numericFee;
    };
    
    return camps
      .filter((camp) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          camp.searchKeyWords.toLowerCase().includes(searchLower) 
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "alphabetical":
            return a.name.localeCompare(b.name);
          case "fees":
            return getFeeValue(a.fees) - getFeeValue(b.fees);
          case "most-registered":
          default:
            return b.participantCount - a.participantCount;
        }
      });
  }, [camps, searchTerm, sortBy]);

  if (isLoading) return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg text-[#1e74d2]"></span></div>;
  if (isError) return <div className="text-center text-red-500 my-20 font-semibold text-lg">Error: {error.message}</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* --- Hero Section --- */}
      <div className="bg-gradient-to-br from-[#e5f2fa] to-[#a7d4f9] text-center py-20 px-4">
        <h1 className="poppins text-5xl font-extrabold poppins text-gray-700">Available Medical Camps</h1>
        <p className="inter text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
          Explore a wide range of medical camps. Find the one that suits your needs and join us in building a healthier community.
        </p>
      </div>

      {/* --- Controls Bar --- */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm py-4 px-4 md:px-8">
        <div className="w-11/12 2xl:w-9/12 mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icons.Search />
              </div>
              <input
                type="text"
                placeholder="Search by name, location, date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2] transition-all inter"
              />
            </div>

            <div className="flex flex-col sm:flex-row w-full md:w-auto items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative w-full sm:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icons.Sort />
                  </div>
                  <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e74d2] focus:border-[#1e74d2] transition-all inter"
                  >
                  <option value="most-registered">Most Registered</option>
                  <option value="fees">Lowest Fee</option>
                  <option value="alphabetical">Alphabetical (A-Z)</option>
                  </select>
              </div>
              
              {/* Layout Toggle */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setLayout("grid-cols-1 md:grid-cols-2 lg:grid-cols-3")} className={`p-1.5 rounded-md transition-colors ${layout.includes('3') ? 'bg-[#1e74d2] text-white' : 'text-slate-500 hover:bg-slate-200'}`}><Icons.Grid3 /></button>
                  <button onClick={() => setLayout("grid-cols-1 md:grid-cols-2")} className={`p-1.5 rounded-md transition-colors ${layout.includes('2') && !layout.includes('3') ? 'bg-[#1e74d2] text-white' : 'text-slate-500 hover:bg-slate-200'}`}><Icons.Grid2 /></button>
              </div>
            </div>
        </div>
      </div>
      
      {/* --- Camps Grid --- */}
      <div className="w-11/12 2xl:w-9/12 mx-auto py-12 px-4 md:px-8">
        {filteredAndSortedCamps.length > 0 ? (
          <div className={`grid ${layout} gap-8`}>
            {filteredAndSortedCamps.map((camp) => (
              <div
                key={camp._id}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1.5 group border border-slate-200 flex flex-col"
              >
                <div className="relative">
                  <img
                    src={camp.imageUrl}
                    alt={camp.name}
                    className="w-full h-56 object-cover"
                  />
                  <div className={`absolute top-4 right-4 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg ${typeof camp.fees === 'number' && camp.fees > 0 ? 'bg-[#1e74d2]' : 'bg-[#1e74d2]'}`}>
                    ${typeof camp.fees === 'number' && camp.fees > 0 ? camp.fees : 'Free'}
                  </div>
                </div>

                <div className="p-6 flex-grow">
                  <h3
                    className="text-xl poppins font-bold text-slate-800 mb-3 truncate"
                    title={camp.name}
                  >
                    {camp.name}
                  </h3>

                  <div className="space-y-3 text-slate-600 inter">
                    <div className="flex items-center"><Icons.Calendar /><span>{new Date(camp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {camp.time}</span></div>
                    <div className="flex items-center"><Icons.Location /><span>{camp.location}</span></div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
                  <div className="flex flex-col  text-sm text-slate-500 font-medium">
                    <p>Participants</p>                    
                    <span className="flex items-center"><Icons.Participants />{camp.participantCount} </span>
                  </div>

                  <Link
                    to={`/CampDetails/${camp._id}`}
                    className="bg-[#1e74d2] text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#1e74d2] focus:outline-none focus:ring-2 focus:ring-[#1e74d2] focus:ring-offset-2 flex items-center group-hover:pl-4 group-hover:pr-6"
                  >
                    Details
                    <Icons.ArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold poppins text-slate-700">No Camps Found</h2>
            <p className="text-slate-500 inter mt-2">Try adjusting your search or sort criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableCamps;