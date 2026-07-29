import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/useAxiosSecure/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';


const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'medi_camp');

  const res = await fetch(`https://api.cloudinary.com/v1_1/deqw8tu5v/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Image upload failed');

  const data = await res.json();
  return data.secure_url;
};

const UpdateCamps = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
console.log(id);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const selectedImage = watch('image');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: camp, isLoading } = useQuery({
    queryKey: ['camp', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/camps/${id}`);
      const data = res.data;   
      const [dd, mm, yy] = data.date.split('-');
      const formattedDate = `${yy}-${mm}-${dd}`;
  
      reset({
        campName: data.name,
        campFees: data.fees,
        date: formattedDate,
        time: data.time,
        location: data.location,
        healthcareProfessionalName: data.professionalName,
        participantCount: data.participantCount,
        description: data.description,
      });

      return data;
    },
    enabled: !!id, 
  });


  const onSubmit = async (data) => {
    setIsSubmitting(true);

    let imageUrl = camp.imageUrl;
    if (data.image && data.image.length > 0) {
      try {
        imageUrl = await uploadToCloudinary(data.image[0]);
      } catch (error) {
        console.log(error);        
        Swal.fire('Upload Error', 'Failed to upload new image.', 'error');
        setIsSubmitting(false);
        return;
      }
    }

    const [yy, mm, dd] = data.date.split('-');
    const formattedDate = `${dd}-${mm}-${yy}`;

    const updatedData = {
      name: data.campName,
      imageUrl,
      fees: parseInt(data.campFees),
      date: formattedDate,
      time: data.time,
      sortingTime: new Date(`${data.date}T${data.time}`).toISOString(),
      location: data.location,
      professionalName: data.healthcareProfessionalName,
      participantCount: parseInt(camp.participantCount),
      description: data.description,
      searchKeyWords: (
        data.campName +
        ' ' +
        formattedDate +
        ' ' +
        data.location +
        ' ' +
        data.healthcareProfessionalName +
        ' ' +
        data.description
      ).toLowerCase(),
    };

    try {
      const res = await axiosSecure.put(`/update-camp/${id}`, updatedData);
      if (res.data.modifiedCount > 0) {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Camp updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        navigate('/Dashboard/ManageCamps');
      } else {
        Swal.fire('No Change', 'Nothing was modified.', 'info');
      }
    } catch (error) {
      console.error('Update error:', error);
      Swal.fire('Error', 'Could not update the camp.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-blue-600"></span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">Update Medical Camp</h1>
      <p className="text-center text-gray-500 mb-8">Edit the camp details below.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-base-200 p-8 rounded-2xl shadow-lg">
        {/* Form Left */}
        <div className="md:col-span-2 space-y-6">
          {/* Camp Name */}
          <div>
            <label className="block font-semibold mb-1">Camp Name</label>
            <input type="text" defaultValue={camp.name} {...register('campName', { required: true })} className="input input-bordered w-full" />
            {errors.campName && <p className="text-sm text-red-500 mt-1">Camp name is required.</p>}
          </div>

          {/* Fees, Date, Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Fees ($)</label>
              <input type="number" defaultValue={camp.fees} {...register('campFees', { required: true })} className="input input-bordered w-full" />
              {errors.campFees && <p className="text-sm text-red-500 mt-1">Fees required</p>}
            </div>
            <div>
              <label className="block font-semibold mb-1">Date</label>
              <input type="date" {...register('date', { required: true })} className="input input-bordered w-full" />
              {errors.date && <p className="text-sm text-red-500 mt-1">Date required</p>}
            </div>
            <div>
              <label className="block font-semibold mb-1">Time</label>
              <input type="time" defaultValue={camp.time} {...register('time', { required: true })} className="input input-bordered w-full" />
              {errors.time && <p className="text-sm text-red-500 mt-1">Time required</p>}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block font-semibold mb-1">Location</label>
            <input type="text" defaultValue={camp.location} {...register('location', { required: true })} className="input input-bordered w-full" />
            {errors.location && <p className="text-sm text-red-500 mt-1">Location required</p>}
          </div>

          {/* Professional Name */}
          <div>
            <label className="block font-semibold mb-1">Professional Name</label>
            <input type="text" defaultValue={camp.professionalName} {...register('healthcareProfessionalName', { required: true })} className="input input-bordered w-full" />
            {errors.healthcareProfessionalName && <p className="text-sm text-red-500 mt-1">Required</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea rows="5" defaultValue={camp.description} {...register('description', { required: true })} className="textarea textarea-bordered w-full"></textarea>
            {errors.description && <p className="text-sm text-red-500 mt-1">Description is required</p>}
          </div>
        </div>

        {/* Form Right - Image and Count */}
        <div className="space-y-6">
          {/* Participant Count */}
          <div>
            <label className="block font-semibold mb-1">Participant Count</label>
            <input type="number" readOnly value={camp.participantCount} {...register('participantCount')} className="input input-bordered w-full bg-slate-100 cursor-not-allowed text-gray-500" />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-semibold mb-1">Current Image</label>
            <img src={camp?.imageUrl} alt="camp" className="rounded-lg h-32 object-cover w-full border" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Upload New Image</label>
            <label className="flex items-center justify-center overflow-x-hidden p-3 border h-28 border-dashed border-blue-400 rounded-xl text-blue-500 bg-blue-50 cursor-pointer hover:bg-blue-100 transition">
              <FaCloudUploadAlt className="text-2xl" />
              <span className="ml-2">{selectedImage && selectedImage.length > 0 ? selectedImage[0].name : 'Upload Image'}</span>
              <input type="file" accept="image/*" {...register('image')} className="hidden" />
            </label>
          </div>

          {/* Submit */}
          <div className="text-right mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex cursor-pointer items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:bg-slate-400 disabled:cursor-wait"
            >
              <FiRefreshCw className={isSubmitting ? 'animate-spin' : ''} />
              {isSubmitting ? 'Updating...' : 'Update Camp'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateCamps;
