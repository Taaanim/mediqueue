import React from 'react';
import { Link } from 'react-router';

export const CardIcons = {
  Calendar: () => <svg className="h-5 w-5 text-[#1e74d2] mr-3 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
  Location: () => <svg className="h-5 w-5 text-[#1e74d2] mr-3 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>,
  Participants: () => <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 5.5a3 3 0 00-3 0V12a2 2 0 00-2 2v1a2 2 0 002 2h6a2 2 0 002-2v-1a2 2 0 00-2-2v-.5a3 3 0 00-3 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zm-1.5 5.5a3 3 0 00-3 0V12a2 2 0 00-2 2v1a2 2 0 002 2h6a2 2 0 002-2v-1a2 2 0 00-2-2v-.5a3 3 0 00-3 0z" /></svg>,
  ArrowRight: () => <svg className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
};

const SharedCard = ({
  image,
  badgeText,
  badgeColorClass = 'bg-[#1e74d2]',
  title,
  subtitle1,
  subtitle1Highlight = false,
  subtitle2,
  statLabel,
  statValue,
  buttonText,
  onAction,
  actionLink,
  actionDisabled = false,
  customButtonClasses = ''
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1.5 group border border-slate-200 flex flex-col">
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-56 object-cover"
        />
        <div className={`absolute top-4 right-4 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg ${badgeColorClass}`}>
          {badgeText}
        </div>
      </div>

      <div className="p-6 flex-grow">
        <h3
          className="text-xl poppins font-bold text-slate-800 mb-3 truncate"
          title={title}
        >
          {title}
        </h3>

        <div className="space-y-3 text-slate-600 inter">
          <div className="flex items-center">
            <CardIcons.Calendar />
            <span className={subtitle1Highlight ? "font-semibold text-[#1e74d2]" : ""}>
              {subtitle1}
            </span>
          </div>
          <div className="flex items-center">
            <CardIcons.Location />
            <span>{subtitle2}</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-4 border-t border-slate-100 mt-4 flex justify-between items-center">
        <div className="flex flex-col text-sm text-slate-500 font-medium">
          <p>{statLabel}</p>                    
          <span className="flex items-center"><CardIcons.Participants />{statValue} </span>
        </div>

        {actionLink ? (
          <Link
            to={actionLink}
            className={`bg-[#1e74d2] text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#185dab] hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#1e74d2] focus:ring-offset-2 ${customButtonClasses}`}
          >
            {buttonText}
          </Link>
        ) : (
          <button
            onClick={onAction}
            disabled={actionDisabled}
            className={`bg-[#1e74d2] text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#185dab] hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#1e74d2] focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${customButtonClasses}`}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default SharedCard;
