import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Link } from 'react-router';



const Banner = () => {
  return (
    <div className="w-full font-sans">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
        style={{
          '--swiper-navigation-color': '#FFFFFF',
          '--swiper-pagination-color': '#FFFFFF',
        }}
      >
        {/* Slide 1 */}
        <SwiperSlide>
          <div
            className="relative w-full h-[90vh] md:h-[750px] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://res.cloudinary.com/dv6p7mprd/image/upload/v1751979396/happy-doctor-holding-clipboard-witjkh-patients_qwwxzh.jpg')",
            }}
          >
            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

            <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-8 md:p-12 lg:p-16 text-white z-10">
              {/* Top Section: Satisfied Patients */}
              <div className='flex items-center gap-3 self-start md:self-end'>
                <div className="avatar-group -space-x-4 sm:-space-x-6">
                  <div className="avatar border-2 border-white/50 rounded-full">
                    <div className="w-8 sm:w-10">
                      <img src="https://res.cloudinary.com/dd4np04jl/image/upload/v1748020486/images_dcbx12.jpg" alt="Patient 1" />
                    </div>
                  </div>
                  <div className="avatar border-2 border-white/50 rounded-full">
                    <div className="w-8 sm:w-10">
                      <img src="https://res.cloudinary.com/dd4np04jl/image/upload/v1748019889/people-2402-1H6A2446gaffney-20210923170531_sy6y6n.jpg" alt="Patient 2" />
                    </div>
                  </div>
                  <div className="avatar border-2 border-white/50 rounded-full">
                    <div className="w-8 sm:w-10">
                      <img src="https://res.cloudinary.com/dd4np04jl/image/upload/v1748020271/istockphoto-517234226-612x612_vpugax.jpg" alt="Patient 3" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className='text-base sm:text-lg font-bold'>150k+</h3>
                  <p className='text-xs sm:text-sm'>Patient Satisfied</p>
                </div>
              </div>

              {/* Middle Section: Main Content */}
              <div className="max-w-2xl space-y-4 sm:space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">Bringing Hope <br /> and Health to Everyone</h2>
                <p className='text-sm sm:text-base lg:text-lg'>Our recent medical camp provided free check-ups, essential medicines, and specialized care to over 500 residents, transforming lives one consultation at a time.</p>
                <div className='flex items-start gap-4 sm:gap-6 pt-4'>
                  <h3 className='border-b-2 border-b-white h-fit text-base sm:text-lg font-bold whitespace-nowrap'>Pro Health</h3>
                  <p className='text-xs sm:text-sm'>Our team of experienced doctors and healthcare professionals are committed to providing quality care and personalized attention to our patients.</p>
                </div>
                <div className='pt-4 sm:pt-6'>
                  <Link to='/AvailableCamps' className='px-5 py-3 bg-[#1e74d2] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'>View Camps</Link>
                </div>
              </div>

              {/* Bottom Section: Stats Box */}
              <div className="w-full max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/10 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg text-center">
                  <div className='flex flex-col items-center justify-center'>
                    <p className="text-xl sm:text-2xl font-bold">20+</p>
                    <p className="text-xs sm:text-sm">Years of Experience</p>
                  </div>
                  <div className='flex flex-col items-center justify-center'>
                    <p className="text-xl sm:text-2xl font-bold">95%</p>
                    <p className="text-xs sm:text-sm">Patient Satisfaction</p>
                  </div>
                  <div className='flex flex-col items-center justify-center'>
                    <p className="text-xl sm:text-2xl font-bold">500+</p>
                    <p className="text-xs sm:text-sm">Patients Served</p>
                  </div>
                  <div className='flex flex-col items-center justify-center'>
                    <p className="text-xl sm:text-2xl font-bold">10+</p>
                    <p className="text-xs sm:text-sm">Pro Medical Units</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 2 */}
        <SwiperSlide>
          <div
            className="relative w-full h-[90vh] md:h-[750px] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://res.cloudinary.com/dv6p7mprd/image/upload/v1751980188/medium-shot-nurse-doctor-checking-epatient_tbr97c.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

            <div className="relative w-full h-full flex flex-col justify-center items-start p-4 sm:p-8 md:p-12 lg:p-16 text-white z-10">
              <div className="max-w-lg space-y-4 sm:space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  Restoring Health, <br /> Rebuilding Lives
                </h2>
                <p className="text-sm sm:text-base lg:text-lg">
                  Our dedicated volunteers provided dental, eye, and primary care services to underserved communities — all in one day.
                </p>
                <div className='pt-4 sm:pt-6'>
                  <Link to='/AvailableCamps' className='px-5 py-3 bg-[#1e74d2] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'>View Camps</Link>
                </div>
              </div>

              <div className="absolute bottom-12 right-4 sm:right-8 md:right-12 lg:right-16 left-4 sm:left-auto flex flex-col md:flex-row gap-6 items-end">
                <div className="bg-white/10 hidden sm:block backdrop-blur-md rounded-xl px-6 py-4 shadow-lg w-full max-w-sm">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3">Impact Snapshot</h3>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm">
                    <li>120+ Dental Checkups</li>
                    <li>90 Eye Screenings</li>
                    <li>300+ Consultations</li>
                    <li>100% Free Services</li>
                  </ul>
                </div>
                <div className="max-w-xs text-right self-end">
                  <p className="text-base sm:text-lg italic font-light">
                    “This camp gave my mother a second chance at health.”
                  </p>
                  <p className="text-xs sm:text-sm mt-2">— Rina Akter, Participant</p>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 3 */}
        <SwiperSlide>
          <div
            className="relative w-full h-[90vh] md:h-[750px] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://res.cloudinary.com/dv6p7mprd/image/upload/v1751991835/close-up-medical-team-ready-hwork_nhfvkd.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

            <div className="relative w-full h-full flex flex-col justify-center items-start p-4 sm:p-8 md:p-12 lg:p-16 text-white z-10">
              <div className="max-w-2xl space-y-4 sm:space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                  Bringing Care<br />Where It’s Needed Most
                </h2>
                <p className="text-sm sm:text-base lg:text-xl">
                  Our mobile medical units have reached 30+ remote villages with diagnostics, medicines, and first-aid kits — at no cost.
                </p>
                <div className="bg-white/10 backdrop-blur-md rounded-lg px-6 py-4 text-left text-sm w-full max-w-md shadow-lg">
                  <h4 className="text-base font-semibold mb-2">Outreach Timeline:</h4>
                  <ul className="space-y-1 text-xs sm:text-sm">
                    <li>Jan - Mymensingh: 400+ patients served</li>
                    <li>Mar - Rangpur: 350+ checkups done</li>
                    <li>May - Sylhet: 300+ families reached</li>
                  </ul>
                </div>
                <div className='pt-4 sm:pt-6'>
                  <Link to='/AvailableCamps' className='px-5 py-3 bg-[#1e74d2] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'>View Camps</Link>
                </div>
              </div>

              <div className="absolute bottom-6 right-4 sm:right-8">
                <span className="bg-[#1e74d2] text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                  100% Free | Volunteer Driven | Always Ready
                </span>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default Banner;
