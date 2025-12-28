import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types';
import { MapPin, User, Tractor, Award, Heart } from 'lucide-react';

interface RegistrationProps {
  role: UserRole;
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ role, onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    farmName: '',
    certifications: {
      organic: false,
      pdo: false, // Protected Designation of Origin
      bio: false
    },
    preferences: {
      veg: false,
      fruit: false,
      dairy: false
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const certs = [];
    if (formData.certifications.organic) certs.push('Organic Certified');
    if (formData.certifications.pdo) certs.push('PDO (Protected Designation of Origin)');
    if (formData.certifications.bio) certs.push('Bio Hellas');

    const prefs = [];
    if (formData.preferences.veg) prefs.push('Vegetables');
    if (formData.preferences.fruit) prefs.push('Fruits');
    if (formData.preferences.dairy) prefs.push('Dairy');

    const profile: UserProfile = {
      role,
      name: formData.name,
      location: formData.location,
      ...(role === UserRole.PRODUCER ? {
        farmName: formData.farmName,
        certifications: certs
      } : {
        preferences: prefs
      })
    };

    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfa] flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
        <div className={`p-6 ${role === UserRole.PRODUCER ? 'bg-amber-50' : 'bg-green-50'} border-b border-stone-100`}>
          <h2 className="text-2xl font-bold text-stone-800">
            {role === UserRole.PRODUCER ? 'Producer Registration' : 'Buyer Registration'}
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {role === UserRole.PRODUCER 
              ? 'Tell us about your farm and products.' 
              : 'Tell us where you are to find local goods.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Common Fields */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-stone-400" size={18} />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Georgios Papadopoulos"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Location (City/Region)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-stone-400" size={18} />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="e.g. Kalamata, Messinia"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          {/* Producer Specific */}
          {role === UserRole.PRODUCER && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Farm Name</label>
                <div className="relative">
                  <Tractor className="absolute left-3 top-2.5 text-stone-400" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="e.g. Sunny Olive Grove"
                    value={formData.farmName}
                    onChange={e => setFormData({...formData, farmName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                  <Award size={16} /> Certifications
                </label>
                <div className="space-y-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.certifications.organic} onChange={e => setFormData({...formData, certifications: {...formData.certifications, organic: e.target.checked}})} className="rounded text-green-600" />
                    <span className="text-sm">Organic (Bio)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.certifications.pdo} onChange={e => setFormData({...formData, certifications: {...formData.certifications, pdo: e.target.checked}})} className="rounded text-green-600" />
                    <span className="text-sm">PDO (Protected Designation of Origin)</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Buyer Specific */}
          {role === UserRole.BUYER && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                <Heart size={16} /> Interests
              </label>
              <div className="flex gap-2 flex-wrap">
                 {['veg', 'fruit', 'dairy'].map((key) => (
                   <button
                     key={key}
                     type="button"
                     onClick={() => setFormData({
                       ...formData, 
                       preferences: {
                         ...formData.preferences, 
                         [key]: !formData.preferences[key as keyof typeof formData.preferences]
                       }
                     })}
                     className={`px-3 py-1 rounded-full text-sm border ${
                       formData.preferences[key as keyof typeof formData.preferences] 
                         ? 'bg-green-100 border-green-500 text-green-700' 
                         : 'bg-white border-stone-300 text-stone-600'
                     }`}
                   >
                     {key === 'veg' ? 'Vegetables' : key === 'fruit' ? 'Fruits' : 'Dairy & Cheese'}
                   </button>
                 ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
             <button
               type="button"
               onClick={onBack}
               className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium"
             >
               Back
             </button>
             <button
               type="submit"
               className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-bold shadow-md transition-colors"
             >
               Complete Registration
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Registration;
