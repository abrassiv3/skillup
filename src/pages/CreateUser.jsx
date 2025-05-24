import { supabase } from "../supabaseClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import plus from '../assets/add.svg';
import "../index.css";

const CreateUser = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [formError, setFormError] = useState(null);

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
  }
};

  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    const fileName = `${Date.now()}_${avatarFile.name}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile);

    if (error) {
      console.error("Error uploading profile picture:", error);
      setFormError("Error uploading profile picture");
      return null;
    }

    const { publicURL } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstname || !lastname || !userType) {
      setFormError('Please fill in all the required fields');
      return;
    }

    const avatarUrl = await uploadAvatar();

    if (formError) return;

    const { data, error, status } = await supabase
      .from('users')
      .insert([{ firstname, lastname, usertype: userType, profile_picture: avatarUrl }]);

    if (error) {
      if (status === 409) {
        setFormError('A user with this information already exists.');
      } else {
        setFormError('Error submitting form');
      }
      console.error(error);
    } else {
      setFormError(null);
      if (userType === 'Client') {
        navigate('/dashboard');
      } else {
        navigate('/update-profile');
      }
    }
  };

  return (
    <div className="flex flex-col p-8 items-center ">
      <form id="setuserform" className="flex flex-col gap-2 p-3" onSubmit={handleSubmit}>
        <h1 className="section-header text-center">Tell us more <br /> about yourself</h1>
        <label className='flex items-center gap-2' htmlFor="avatar"><img src={plus} alt="add image" className='border-2 border-green-600 rounded-full'/> <p className='font-bold'>Add Profile Picture</p></label>
        <input type="file" id='avatar' class="hidden" onChange={handleFileChange} accept="image/*" />
        {avatarUrl && (
          <div className='py-2'>
            <h2 className='header text-center'> Profile Picture</h2>
            <div className='flex flex-col items-center gap-2'>
              <div className="avatar w-32 h-32 rounded-full overflow-hidden border border-gray-300 mx-auto">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className='flex items-center justify-center w-full h-full text-xl font-bold bg-gray-200'>
                    AV
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          <label className="label" htmlFor="first-name">First Name</label>
          <input
            type="text"
            id="first-name"
            value={firstname}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <label className="label" htmlFor="last-name">Last Name</label>
          <input
            type="text"
            id="last-name"
            value={lastname}
            onChange={(e) => setLastName(e.target.value)}
          />

          <label className="label text-center" htmlFor="usertype">What will you use SkillUp as?</label>
          <div className="radio-container">
            <label className="label radiolabel" htmlFor="client">
              <input
                type="radio"
                id="client"
                name="usertype"
                value="client"
                onChange={(e) => setUserType(e.target.value)} />
              Client
            </label>

            <label className="label radiolabel" htmlFor="freelancer">
              <input
                type="radio"
                id="freelancer"
                name="usertype"
                value="freelancer"
                onChange={(e) => setUserType(e.target.value)} />
              Freelancer
            </label>
          </div>

          

          <button>Next</button>
          {formError && <p className="error text-red-600 text-xl font-bold">{formError}</p>}
      </form>
    </div>
  );
};

export default CreateUser;
