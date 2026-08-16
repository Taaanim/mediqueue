import React from 'react';
import Banner from '../../components/Banner/Banner';
import Departments from '../../components/Departments/Departments';
import HomeDoctors from '../../components/HomeDoctors/HomeDoctors';
import FeedbackAndRatings from '../../components/FeedbackAndRatings/FeedbackAndRatings';
import ApproachToCare from '../../components/ApproachToCare/ApproachToCare';

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
                <HomeDoctors/>
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