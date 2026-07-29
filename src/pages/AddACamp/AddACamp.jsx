import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { FiPlusCircle } from 'react-icons/fi';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';




const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'medi_camp');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/deqw8tu5v/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error('Image should be within 2MB');
  }

  const data = await res.json();
  return data.secure_url;
};

const AddACamp = () => {
  const axiosSecure = useAxiosSecure ()
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { participantCount: 0 } });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedImage = watch('image');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const imageFile = data.image[0];

    if (!imageFile) {
      Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: "Please select an image file.",
                    showConfirmButton: false,
                    timer: 2000
                });
      setIsSubmitting(false);
      return;
    }

    const [yy, mm, dd] = data.date.split('-')
    const splitDate = `${dd}-${mm}-${yy}` 

    try {
      const imageUrl = await uploadToCloudinary(imageFile);
      const campData = {
        name: data.campName,
        imageUrl,
        fees: parseInt(data.campFees),
        date: splitDate,
        time: data.time,
        sortingTime: new Date(`${data.date}T${data.time}`).toISOString(),
        location: data.location,
        professionalName: data.healthcareProfessionalName,
        participantCount: parseInt(data.participantCount),
        description: data.description,
        searchKeyWords: (
          data.campName +
          ' ' +
          splitDate +
          ' ' +
          data.location +
          ' ' +
          data.healthcareProfessionalName +
          ' ' +
          data.description
        ).toLowerCase(),
      };

        const res = await axiosSecure.post('/camps', campData);
        if (res.data.insertedId) {
          console.log('Data ready for database:', campData);
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Camp added successfully!",
            showConfirmButton: false,
            timer: 1500,
          });
          reset();
        }
      }catch (error) {
        console.error('Submission failed:', error);
        Swal.fire({
          icon: "error",
          confirmButtonColor: "#00A79D",
          title: "Oops...",
          text: "Error: Could not add the camp!",
        });
      } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="w-12/12 mx-auto">
      <h1 className="text-4xl font-extrabold text-slate-800 text-center mb-2"> Add A Medical Camp</h1>
      <p className="text-center text-slate-500 mb-10">Please fill in all the required details carefully.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className='grid md:grid md:grid-cols-5 gap-4'>
          <div className="grid grid-cols-1 md:col-span-3 bg-base-200 shadow-2xl p-8 rounded-2xl md:grid-cols-2 gap-8">
          {/* Camp Name */}
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="campName" className="font-semibold block mb-2 text-gray-700">Camp Name</label>
            <input
              id="campName"
              type="text"
              {...register('campName', { required: 'Camp name is required.' })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter the name of the camp"
            />
            {errors.campName && <p className="text-red-500 text-sm mt-1">{errors.campName.message}</p>}
          </div>


          {/* Camp Fees */}
          <div>
            <label htmlFor="campFees" className="font-semibold block mb-2 text-gray-700">Camp Fees ($)</label>
            <input
              id="campFees"
              type="number"
              step="0.01"
              {...register('campFees', {
                required: 'Camp fees are required.',
                valueAsNumber: true,
                min: { value: 0, message: 'Fees cannot be negative.' }
              })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g., 50"
            />
            {errors.campFees && <p className="text-red-500 text-sm mt-1">{errors.campFees.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="dateTime" className="font-semibold block mb-2 text-gray-700">Date</label>
            <input
              id="date"
              type="date"
              {...register('date', { required: 'Date is required.' })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.dateTime && <p className="text-red-500 text-sm mt-1">{errors.dateTime.message}</p>}
          </div>

          {/* Time */}
          <div>
            <label htmlFor="dateTime" className="font-semibold block mb-2 text-gray-700">Date</label>
            <input
              id="time"
              type="time"
              {...register('time', { required: 'Time is required.' })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.dateTime && <p className="text-red-500 text-sm mt-1">{errors.dateTime.message}</p>}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="font-semibold block mb-2 text-gray-700">Location</label>
            <input
              id="location"
              type="text"
              {...register('location', { required: 'Location is required.' })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="City, Street or Hospital Name"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
          </div>

          {/* Healthcare Professional */}
          <div>
            <label htmlFor="healthcareProfessionalName" className="font-semibold block mb-2 text-gray-700">Professional</label>
            <input
              id="healthcareProfessionalName"
              type="text"
              {...register('healthcareProfessionalName', { required: 'This field is required.' })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Dr. Smith, Dr. Ahmed..."
            />
            {errors.healthcareProfessionalName && <p className="text-red-500 text-sm mt-1">{errors.healthcareProfessionalName.message}</p>}
          </div>

          {/* Participant Count */}
          <div>
            <label htmlFor="participantCount" className="font-semibold block mb-2 text-gray-700">Participant Count</label>
            <input
              id="participantCount"
              type="number"
              {...register('participantCount')}
              readOnly
              className="w-full p-4 bg-slate-100 text-gray-500 border border-gray-300 rounded-xl cursor-not-allowed"
            />
          </div>
        </div>

        <div className='bg-base-200 shadow-2xl md:col-span-2 p-8 rounded-2xl'>
            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="font-semibold block mb-2 text-gray-700">Description</label>
              <textarea
                id="description"
                rows="4"
                {...register('description', { required: 'Description is required.' })}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Write a short summary of the camp..."
              ></textarea>
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>
          
          {/* Image Upload */}
            <div>
              <label htmlFor="image" className="font-semibold block mb-2 text-gray-700">Camp Image</label>
              <label className="flex items-center justify-center gap-3 p-3 border h-32 border-dashed border-blue-400 rounded-xl text-blue-500 bg-blue-50 cursor-pointer hover:bg-blue-100 transition">
                <FaCloudUploadAlt className='text-2xl' /> {selectedImage && selectedImage.length > 0 ? selectedImage[0].name : 'Upload Image'}
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  {...register('image', { required: 'Image is required.' })}
                  className="hidden"
                />
              </label>
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
            </div>

          {/* Submit */}
          <div className="mt-10 text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer flex items-center justify-center px-8 py-3 bg-gradient-to-r text-md 2xl:text-2xl from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-600 transition disabled:bg-slate-400 disabled:cursor-wait"
            >
              {isSubmitting ? 'Submitting...' : <span className='flex items-center gap-2'><FiPlusCircle className='text-md 2xl:text-2xl' /> Publish Camp</span>}
            </button>
          </div>
        </div>
        </div>
      </form>
    </div>
  );
};

export default AddACamp;
