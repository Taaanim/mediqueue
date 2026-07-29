import React from 'react';
import Banner from '../../components/Banner/Banner';
import PopularCamps from '../../components/PopularCamps/PopularCamps';
import FeedbackAndRatings from '../../components/FeedbackAndRatings/FeedbackAndRatings';
import ApproachToCare from '../../components/ApproachToCare/ApproachToCare';
import Departments from '../../components/Departments/Departments';

const Home = () => {
    return (
        <div>
            <div>
                <Banner/>
            </div>
            <div>
                <Departments/>
            </div>
            <div>
                <PopularCamps/>
            </div>
            <div>
                <FeedbackAndRatings/>
            </div>
            <div>
                <ApproachToCare/>
            </div>            
        </div>
    );
};

export default Home;